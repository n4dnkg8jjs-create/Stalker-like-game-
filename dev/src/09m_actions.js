/* ---------- things the player does with their hands and body besides fighting: sitting down at the radio table in the
   bog, smoking a cigarette from a pack (a finite one), dragging a downed enemy, and dying. One small state machine
   (ACT.kind) so they cannot overlap: each knows how to start, how to run each frame, and how to be cut short cleanly by
   anything else (a shot, damage, death, loading a save). The weapon is lowered out of view while the hands are busy. ---------- */
const ACT={kind:null,lower:0,lowerT:0,t:0,sit:null,smk:null,drag:null,dead:null,butts:[]};window.ACT=ACT;
const _aV=V3(),_aV2=V3(),_aQ=new T.Quaternion(),_aE=new T.Euler(0,0,0,'YXZ');
const ease3=u=>u<.5?4*u*u*u:1-Math.pow(-2*u+2,3)/2,smooth=u=>{u=clamp(u,0,1);return u*u*(3-2*u);};
function aLerp(a,b,u){return[lerp(a[0],b[0],u),lerp(a[1],b[1],u),lerp(a[2],b[2],u)];}
/* what may happen while each action runs */
ACT.busy=()=>ACT.kind==='sit'||ACT.kind==='smoke'||ACT.kind==='drag'||ACT.kind==='dying';
ACT.blockSave=()=>ACT.kind==='dying'||ACT.kind==='drag'||(ACT.kind==='smoke'&&ACT.smk&&ACT.smk.taken&&!ACT.smk.done);
ACT.spd=()=>ACT.kind==='drag'?.38:ACT.kind==='smoke'?.75:1;
ACT.noSprint=()=>ACT.kind==='drag'||ACT.kind==='smoke';

/* =========================== sitting at the radio table =========================== */
const SEATA={an:null};
function seatEye(){const s=WEST.seat;return V3(s.p.x,s.p.y+.78,s.p.z);}
function seatYaw(){const s=WEST.seat,r=s.radio;const dx=r.x-s.p.x,dz=r.z-s.p.z;return Math.atan2(-dx,-dz)*.35;}
function sitDown(){if(ACT.kind||!WEST.seat||S.state!=='play')return;S.fire=0;S.ads=false;
  ACT.kind='sit';ACT.sit={ph:'down',t:0,p0:camera.position.clone(),y0:player.yaw,pt0:player.pitch,base:seatYaw()};player.vel.set(0,0,0);
  if(!SEATA.an){SEATA.an=animate(playerBody,{pose:'sitCrate'});}SEATA.an.paused=false;SEATA.an.go('sitCrate',.6);
  sfx.creak&&sfx.creak();}
function standUp(){const s=ACT.sit;if(!s||s.ph==='up')return;s.ph='up';s.t=0;s.p0=camera.position.clone();sfx.creak&&sfx.creak();}
function sitTick(dt){const s=ACT.sit,ST=WEST.seat;s.t+=dt;const eye=seatEye();
  if(s.ph==='down'){const u=clamp(s.t/1.15,0,1),e=ease3(u);
    /* a step to the crate, turn, lower yourself onto it - the eye dips a little lower than it ends up and comes back */
    camera.position.lerpVectors(s.p0,eye,e);camera.position.y-=Math.sin(u*Math.PI)*.08;
    let dy=s.base-s.y0;dy=Math.atan2(Math.sin(dy),Math.cos(dy));player.yaw=s.y0+dy*e;player.pitch=lerp(s.pt0,-.12,e);
    if(u>=1){s.ph='sit';player.pos.set(ST.p.x,0,ST.p.z);}}
  else if(s.ph==='sit'){camera.position.copy(eye);camera.position.y+=Math.sin(S.t*1.6)*.004;
    /* looking round from the crate: not all the way behind you */
    let dy=player.yaw-s.base;dy=Math.atan2(Math.sin(dy),Math.cos(dy));player.yaw=s.base+clamp(dy,-1.7,1.7);player.pitch=clamp(player.pitch,-.95,.75);}
  else{const u=clamp(s.t/.9,0,1),e=ease3(u);const out=V3(ST.p.x,0,ST.p.z+.55);out.y=groundY(out.x,out.z)+1.64;
    camera.position.lerpVectors(s.p0,out,e);camera.position.y+=Math.sin(u*Math.PI)*.05;
    if(u>=1){player.pos.set(out.x,0,out.z);player.y=groundY(out.x,out.z);player.vel.set(0,0,0);ACT.kind=null;ACT.sit=null;if(SEATA.an){SEATA.an.paused=true;}return;}}
  camera.rotation.set(player.pitch-(ACT.look||0),player.yaw,0);
  /* the body (its shadow) sits on the crate */
  playerBody.root.position.set(ST.p.x,ST.p.y-.44,ST.p.z);playerBody.root.rotation.y=player.yaw+Math.PI;playerBody.root.scale.y=1;}
ACT.seatSave=()=>ACT.kind==='sit'&&ACT.sit&&ACT.sit.ph==='sit'?1:null;
ACT.seatLoad=v=>{if(!v||!WEST.seat)return;const ST=WEST.seat;player.pos.set(ST.p.x,0,ST.p.z+.55);sitDown();};

/* =========================== the first-person smoking rig =========================== */
/* two arms of their own in the view camera's space (the gun and its arms are lowered out of sight meanwhile), the pack,
   one cigarette and the lighter, all driven by one timeline of keys. Positions are in camera space: x right, y up, -z ahead.
   The mouth is just under and in front of the eye. */
const RIG={g:null,R:null,L:null,pack:null,cig:null,lit:null,ember:null,glow:null,lightV:null,lightW:null};
const MOUTH=[0,-.085,-.03];
/* =========================== contact: fingers close until they meet a surface =========================== */
/* the things a hand can touch, as exact shapes in their own space: boxes (the pack, its lid, the row of filters, the
   lighter), capped cylinders (a cigarette) and the other hand (its joints as balls, kind 'pts', world space). Every finger joint and fingertip is a small sphere; a finger closes from
   its open shape toward its closed one and stops at the first touch - so it lies on the surface and never goes in. */
const _ci=new T.Matrix4(),_cp=V3();
function colPrep(cols){for(const c of cols){if(!c.o)continue;c.o.updateWorldMatrix(true,false);c.inv=(c.inv||new T.Matrix4()).copy(c.o.matrixWorld).invert();}return cols;}
function sdf(pw,cols){let d=1e9;for(const c of cols){if(c.kind==='pts'){for(const q of c.pts)d=Math.min(d,pw.distanceTo(q)-c.r);continue;}_cp.copy(pw).applyMatrix4(c.inv);
    if(c.kind==='box'){const qx=Math.abs(_cp.x-c.c[0])-c.h[0],qy=Math.abs(_cp.y-c.c[1])-c.h[1],qz=Math.abs(_cp.z-c.c[2])-c.h[2];
      const ox=Math.max(qx,0),oy=Math.max(qy,0),oz=Math.max(qz,0);d=Math.min(d,Math.hypot(ox,oy,oz)+Math.min(Math.max(qx,qy,qz),0));}
    else{const rx=_cp.x-c.c[0],rz=_cp.z-c.c[2],ry=_cp.y-c.c[1];const a=Math.hypot(rx,rz)-c.r,b=Math.max(-ry,ry-c.len);d=Math.min(d,Math.min(Math.max(a,b),0)+Math.hypot(Math.max(a,0),Math.max(b,0)));}}
  return d;}
function poseFinger(h,i,f,side){const ch=h.fingers[i];ch.forEach((b,k)=>{b.quaternion.copy(b.userData.q0);if(k===0&&f[3])b.quaternion.multiply(QZ_.setFromAxisAngle(AZ_,f[3]*side));b.quaternion.multiply(QX.setFromAxisAngle(AX,f[k]));});ch[0].updateMatrixWorld(true);}
function poseThumb(h,th,side){h.thumb.forEach((b,k)=>{const e=th[k]||[0,0,0];b.quaternion.copy(b.userData.q0).multiply(QX.setFromAxisAngle(AX,e[0]||0)).multiply(QY_.setFromAxisAngle(AY_,(e[1]||0)*side)).multiply(QZ_.setFromAxisAngle(AZ_,(e[2]||0)*side));});h.thumb[0].updateMatrixWorld(true);}
/* the spheres along one finger: the knuckle to the tip (the tip extrapolated past the last joint) */
const _fp=[V3(),V3(),V3(),V3()],_fq=V3();
/* (the tip: where the glove's fingertip really ends - measured once from the skinned glove itself, see fingerTips - so a
   pad that is said to touch something is seen to touch it; before that, a guess along the last bone) */
function chainPts(ch){ch[0].getWorldPosition(_fp[0]);ch[1].getWorldPosition(_fp[1]);ch[2].getWorldPosition(_fp[2]);const tl=ch[2].userData.tipL;
  if(tl){ch[2].updateWorldMatrix(true,false);_fp[3].copy(tl).applyMatrix4(ch[2].matrixWorld);}else _fp[3].copy(_fp[2]).sub(_fp[1]).multiplyScalar(.9).add(_fp[2]);return _fp;}
/* every finger's real tip, in its last bone's own space: of the glove's vertices bound to that bone, the one furthest out
   along the finger */
function fingerTips(arm){arm.root.updateMatrixWorld(true);const ms=[];arm.root.traverse(o=>{if(o.isSkinnedMesh)ms.push(o);});const h=arm.hand;
  for(const ch of h.fingers.concat([h.thumb])){const b=ch[2];let best=null,bd=-1e9;const b1=ch[1].getWorldPosition(V3()),b2=b.getWorldPosition(V3()),dir=b2.clone().sub(b1).normalize(),v=V3();
    for(const M of ms){const k=M.skeleton.bones.indexOf(b);if(k<0)continue;M.skeleton.update();const si=M.geometry.attributes.skinIndex.array,sw=M.geometry.attributes.skinWeight.array,P=M.geometry.attributes.position;
      for(let i=0;i<P.count;i++){let w=0;for(let j=0;j<4;j++)if(si[i*4+j]===k)w+=sw[i*4+j];if(w<.6)continue;v.fromBufferAttribute(P,i);M.boneTransform(i,v);v.applyMatrix4(M.matrixWorld);const d=v.clone().sub(b2).dot(dir);if(d>bd){bd=d;best=v.clone();}}}
    if(best)b.userData.tipL=b.worldToLocal(best);}}
function chainPen(ch,cols,r){const P=chainPts(ch);let m=1e9;for(let k=0;k<3;k++)for(const t of [.5,1]){_fq.copy(P[k]).lerp(P[k+1],t);m=Math.min(m,sdf(_fq,cols)-r*(k===2&&t===1?.8:1));}return m;}
/* close each finger (and the thumb) from shape A toward shape B as far as it goes without passing into anything;
   lim[] caps how far each may close (1 = all the way to B). Returns how far each got. */
function gripSolve(arm,A,B,cols,lim,side){const h=arm.hand;colPrep(cols);const out=[];const r=.0088;
  for(let i=0;i<4;i++){const L=lim?lim[i]:1;const fA=A.f[i],fB=B.f[i];const at=c=>[0,1,2,3].map(k=>lerp(fA[k],fB[k],c));
    let lo=0,hi=-1;poseFinger(h,i,at(0),side);if(chainPen(h.fingers[i],cols,r)<0){let c=0;while(c>-1.5){c-=.1;poseFinger(h,i,at(c),side);if(chainPen(h.fingers[i],cols,r)>=0)break;}out.push(c);continue;}
    for(let c=.1;c<=L+1e-6;c+=.1){poseFinger(h,i,at(Math.min(c,L)),side);if(chainPen(h.fingers[i],cols,r)<0){hi=Math.min(c,L);break;}lo=Math.min(c,L);}
    if(hi>0){for(let it=0;it<5;it++){const mid=(lo+hi)/2;poseFinger(h,i,at(mid),side);if(chainPen(h.fingers[i],cols,r)<0)hi=mid;else lo=mid;}}
    poseFinger(h,i,at(lo),side);out.push(lo);}
  {const L=lim?lim[4]:1;const at=c=>A.th.map((a,k)=>(a||[0,0,0]).map((x,j)=>lerp(x||0,((B.th[k]||[])[j])||0,c)));let lo=0,hi=-1;
   poseThumb(h,at(0),side);if(chainPen(h.thumb,cols,r)<0){let c=0;while(c>-1.5){c-=.1;poseThumb(h,at(c),side);if(chainPen(h.thumb,cols,r)>=0)break;}out.push(c);}
   else{for(let c=.1;c<=L+1e-6;c+=.1){poseThumb(h,at(Math.min(c,L)),side);if(chainPen(h.thumb,cols,r)<0){hi=Math.min(c,L);break;}lo=Math.min(c,L);}
     if(hi>0){for(let it=0;it<5;it++){const mid=(lo+hi)/2;poseThumb(h,at(mid),side);if(chainPen(h.thumb,cols,r)<0)hi=mid;else lo=mid;}}poseThumb(h,at(lo),side);out.push(lo);}}
  return out;}
/* a point of the hand, in the rig's space: the thumb tip, the index tip, or the pinch between them */
function handPt(arm,which){const h=arm.hand;const g=RIG.g;const tipOf=ch=>{const P=chainPts(ch);return P[2].clone().lerp(P[3],.55);};
  const w=which==='thumb'?tipOf(h.thumb):which==='index'?tipOf(h.fingers[0]):tipOf(h.thumb).add(tipOf(h.fingers[0])).multiplyScalar(.5);return g.worldToLocal(w);}
/* place an arm so that one point of its hand lands on a target (two passes: the fingers move the point a little) */
function armTo(arm,k,A,B,cols,lim,which,target){const side=arm===RIG.R?-1:1;let K=Object.assign({},k);
  for(let pass=0;pass<2;pass++){placeArm2(arm,RIG.g,V3(...K.p),V3(...K.F),V3(...K.N),V3(...K.A),0);RIG.g.updateMatrixWorld(true);fpShoulder(arm,RIGSH);RIG.g.updateMatrixWorld(true);
    poseHand(arm.hand,A.f,A.th,side);if(cols&&cols.length)gripSolve(arm,A,B,cols,lim,side);else poseHand(arm.hand,B.f,B.th,side);
    if(!target)break;const d=target.clone().sub(handPt(arm,which));K.p=[K.p[0]+d.x,K.p[1]+d.y,K.p[2]+d.z];}
  return K;}

function rigBuild(){if(RIG.g)return;const g=new T.Group();vmCam.add(g);RIG.g=g;g.visible=false;
  RIG.R=buildFPArm(-1);RIG.L=buildFPArm(1);g.add(RIG.R.root,RIG.L.root);fingerTips(RIG.R);fingerTips(RIG.L);
  RIG.pack=PACK.build(20);g.add(RIG.pack);RIG.lit=LIGHTER.build();g.add(RIG.lit);
  /* the cigarette in use: filter, paper (it burns down), a grey ash and the ember at the tip */
  const c=new T.Group();const f=new T.Mesh(new T.CylinderGeometry(.0039,.0039,.024,24),PACK.filt);f.position.y=.012;
  const p=new T.Mesh(new T.CylinderGeometry(.0039,.0039,1,24).translate(0,.5,0),PACK.paper);p.position.y=.024;p.scale.y=.06;
  const ash=new T.Mesh(new T.CylinderGeometry(.0036,.0039,1,24).translate(0,.5,0),std({color:C(0x77736c),roughness:1}));ash.scale.y=.0001;
  const em=new T.Mesh(new T.SphereGeometry(.0037,20,12),new T.MeshBasicMaterial({color:C(0xff5a1a),toneMapped:false}));em.scale.set(1,.45,1);em.visible=false;
  const gl=new T.Sprite(new T.SpriteMaterial({map:PTEX.soft,color:C(0xff6a20),transparent:true,blending:T.AdditiveBlending,depthWrite:false,toneMapped:false}));gl.scale.setScalar(.03);gl.visible=false;
  c.add(f,p,ash,em,gl);c.userData={paper:p,ash,em,gl,len:.06};RIG.cig=c;g.add(c);
  RIG.lightV=new T.PointLight(0xffa050,0,.9,2);g.add(RIG.lightV);/* (no light of its own in the world: one more light there means every shader in the world recompiled, and a cost on every lit pixel ever after; the flame lights the hands) */RIG.lightW={position:V3(),intensity:0};}
/* cigarette geometry: burnt fraction b (0 fresh .. 1 down to the filter) */
function cigBurn(c,b){const u=c.userData,L=u.len*(1-b*.78);u.paper.scale.y=L;const ashL=Math.min(.014,b*.035);u.ash.position.y=.024+L;u.ash.scale.y=Math.max(ashL,.0001);
  u.em.position.y=.024+L+ashL;u.gl.position.y=.024+L+ashL+.002;return .024+L+ashL;}
/* place an arm: palm point p, fingers along F, palm facing N, forearm along A (all camera space) and its hand shape */
/* (the upper arm swings from a shoulder point low and a little behind the eye, so with the hand at the face the arm comes
   up from below the frame instead of passing in front of the lens) */
const RIGSH={localToWorld(v){v.x*=1.2;v.y=-.5;v.z=.16;return vmCam.localToWorld(v);}};
function rigArm(arm,k,shape){placeArm2(arm,RIG.g,V3(...k.p),V3(...k.F),V3(...k.N),V3(...k.A),0);poseHand(arm.hand,shape.f,shape.th,arm===RIG.R?-1:1);RIG.g.updateMatrixWorld(true);fpShoulder(arm,RIGSH);}
function handShape(a,b,u){const A=HANDS[a]||HANDS.open,B=HANDS[b]||HANDS.open;return u<=0?A:u>=1?B:blendHand(A,B,u);}
/* key interpolation for one track: keys [t, value] where value is a plain object of arrays / strings */
function trackAt(K,t){let i=0;while(i<K.length-1&&K[i+1][0]<=t)i++;const a=K[i],b=K[Math.min(i+1,K.length-1)];if(a===b||t<=a[0])return{v:a[1],w:a[1],u:0};
  const u=smooth((t-a[0])/(b[0]-a[0]));return{v:a[1],w:b[1],u};}
function mixKey(r){const o={};for(const k in r.v){const x=r.v[k],y=r.w[k]!==undefined?r.w[k]:x;o[k]=Array.isArray(x)?aLerp(x,y,r.u):x;}return o;}
/* where things rest out of sight, below the view */
const HID_R={p:[.34,-.85,-.05],F:[0,1,0],N:[-1,0,0],A:[0,1,-.2],h:'open'},HID_L={p:[-.34,-.85,-.05],F:[0,1,0],N:[1,0,0],A:[0,1,-.2],h:'open'};
/* the timeline (seconds). Phases: bring out the pack, open it, draw one, to the lips, pack away, lighter up, strike, light,
   lighter away; then the hand takes it from the lips and holds it low, puffs on demand; at the end it is flicked away */
const SMK={
  /* the pack, in camera space: position and rotation (the left hand holds it) */
  pack:[[0,{p:[-.2,-.5,-.25],r:[.2,.4,0]}],[.55,{p:[-.025,-.13,-.34],r:[.1,.3,.06]}],[2.25,{p:[-.025,-.13,-.34],r:[.1,.3,.06]}],[2.75,{p:[-.2,-.5,-.25],r:[.2,.4,0]}]],
  lid:[[0,0],[.9,0],[1.25,1.95],[2.3,1.95],[2.65,0]],
  /* the left hand once the pack is away (while it holds the pack it is placed from the pack: see packHands) */
  L:[[0,HID_L],[3.3,HID_L],[3.75,{p:[-.04,-.2,-.19],F:[.35,.1,-.93],N:[.93,0,.35],A:[.3,.5,-.8],h:'grab'}],[4.1,{p:[-.03,-.185,-.19],F:[.35,.1,-.93],N:[.93,0,.35],A:[.3,.5,-.8],h:'grab'}],[5.15,{p:[-.03,-.185,-.19],F:[.35,.1,-.93],N:[.93,0,.35],A:[.3,.5,-.8],h:'grab'}],[5.6,HID_L],[6.0,HID_L]],
  /* the right hand once the cigarette is in the lips: back with the lighter, strike, away (before that: packHands) */
  R:[[0,HID_R],[3.2,HID_R],[3.55,HID_R],[3.85,{p:[.035,-.15,-.2],F:[-.55,.8,-.2],N:[-.85,-.1,.2],A:[-.5,.6,-.6],h:'cup'}],[5.1,{p:[.035,-.15,-.2],F:[-.55,.8,-.2],N:[-.85,-.1,.2],A:[-.5,.6,-.6],h:'cup'}],[5.5,HID_R],[6.0,HID_R]],
  /* the lighter, held in the right fist with the thumb on the wheel */
  lit:[[0,{p:[.3,-.6,-.2],r:[0,0,0]}],[3.3,{p:[.3,-.6,-.2],r:[0,0,0]}],[3.75,{p:[.024,-.16,-.19],r:[0,.2,-.1]}],[5.15,{p:[.024,-.16,-.19],r:[0,.2,-.1]}],[5.6,{p:[.3,-.6,-.2],r:[0,0,0]}]],
  END:6.0,TAKE:1.8,MOUTH:2.85,PACKOFF:2.75,STRIKE:4.15,LIGHT:4.25,LIT:4.75,FLAMEOFF:5.15};
/* while it burns: held low between puffs; a puff brings it to the lips */
/* while it burns it is held the usual way: between the index and middle fingers, near the middle joints, the filter on
   the palm side; the two fingers close on it until they touch it, the other two curl into the palm */
const HOLD_R={p:[.12,-.22,-.3],F:[-.3,.6,-.75],N:[-.8,.3,.4],A:[-.3,.7,-.65],h:'vO'};
Object.assign(HANDS,{vO:{f:[[-.25,-.3,-.18,.32],[-.3,-.35,-.2,-.2],[-1.25,-1.35,-.95,-.06],[-1.3,-1.3,-.9,-.14]],th:[[.1,.3,0],[-.2],[-.25]]},
  vC:{f:[[-.25,-.3,-.18,-.1],[-.3,-.35,-.2,.14],[-1.25,-1.35,-.95,-.06],[-1.3,-1.3,-.9,-.14]],th:[[.1,.3,0],[-.2],[-.25]]}});
/* the gap between the index and middle fingers, just short of their middle joints (rig space) */
function vgap(arm){const h=arm.hand,g=RIG.g;const a=h.fingers[0][0].getWorldPosition(V3()).lerp(h.fingers[0][1].getWorldPosition(V3()),.8),b=h.fingers[1][0].getWorldPosition(V3()).lerp(h.fingers[1][1].getWorldPosition(V3()),.8);return g.worldToLocal(a.add(b).multiplyScalar(.5));}
function palmN(arm){const wq=arm.wr.getWorldQuaternion(new T.Quaternion()),gq=RIG.g.getWorldQuaternion(new T.Quaternion()).invert();return arm.palm.clone().applyQuaternion(wq).applyQuaternion(gq).normalize();}
function cigInFingers(){const N=palmN(RIG.R);RIG.cig.position.copy(vgap(RIG.R)).addScaledVector(N,.02);RIG.cig.quaternion.setFromUnitVectors(V3(0,1,0),N.clone().negate());}
/* at the lips: palm toward the mouth, the hand placed so the filter end is exactly between the lips */
function lipsKey(){const d=V3(.05,-.7,-.71).normalize(),N=d.clone().negate();const F=V3(-.35,1,0);F.sub(N.clone().multiplyScalar(F.dot(N))).normalize();
  const K={p:[.06,-.13,-.12],F:[F.x,F.y,F.z],N:[N.x,N.y,N.z],A:[-.45,.85,-.1]};const tg=V3(...MOUTH).addScaledVector(d,.02);
  for(let i=0;i<3;i++){rigArm(RIG.R,K,HANDS.vO);const e=tg.clone().sub(vgap(RIG.R));K.p=[K.p[0]+e.x,K.p[1]+e.y,K.p[2]+e.z];}return K;}
function cigTip(){const c=RIG.cig;const y=cigBurn(c,ACT.smk.burn);return c.localToWorld(V3(0,y+.002,0));}
/* the cigarette rides with the pinching fingers: placed from the right hand's own fingertip bones */
/* where the hand is: the knuckles of the index and little finger, the index's middle joint, the thumb tip, and the palm's
   normal - all in the rig's own space */
function handFrame(arm){const h=arm.hand,g=RIG.g;const L=o=>g.worldToLocal(o.getWorldPosition(V3()));
  const wq=arm.wr.getWorldQuaternion(new T.Quaternion()),gq=g.getWorldQuaternion(new T.Quaternion()).invert();
  return{ib:L(h.fingers[0][0]),pb:L(h.fingers[3][0]),im:L(h.fingers[0][1]),it:L(h.fingers[0][2]),tt:L(h.thumb[2]),pn:arm.palm.clone().applyQuaternion(wq).applyQuaternion(gq).normalize(),fd:arm.fing.clone().applyQuaternion(wq).applyQuaternion(gq).normalize()};}
/* the cigarette rides between the thumb and the side of the index finger: across the hand, the filter in the fingers and
   the rest standing out on the thumb side */
function cigOnHand(){const F=handFrame(RIG.R);const m=F.im.clone().add(F.tt).multiplyScalar(.5);const ax=F.ib.clone().sub(F.pb).normalize().addScaledVector(F.fd,.3).addScaledVector(F.pn,-.15).normalize();
  RIG.cig.position.copy(m).addScaledVector(ax,-.026);RIG.cig.quaternion.setFromUnitVectors(V3(0,1,0),ax);}
/* the lighter in the fist: its body along the line of the knuckles, the hood standing out above the index finger with the
   thumb on the wheel */
function litOnHand(arm){const g=RIG.g;const wq=arm.wr.getWorldQuaternion(new T.Quaternion()),gq=g.getWorldQuaternion(new T.Quaternion()).invert();
  /* the hand's own frame in rig space: fingers F, palm N, and across the knuckles toward the thumb side (Lt) */
  const F=arm.fing.clone().applyQuaternion(wq).applyQuaternion(gq).normalize(),N0=arm.palm.clone().applyQuaternion(wq).applyQuaternion(gq);
  const N=N0.sub(F.clone().multiplyScalar(N0.dot(F))).normalize(),Lt=F.clone().cross(N).normalize();
  /* the middle of the fist (the point the fingers wrap round): the lighter stands in it along Lt, the hood out above the index */
  const w=g.worldToLocal(arm.wr.getWorldPosition(V3()));const c=w.addScaledVector(F,.072).addScaledVector(N,.02);
  RIG.lit.position.copy(c).addScaledVector(arm.side<0?Lt:Lt.clone().negate(),-.026).addScaledVector(N,.0045);
  const ax=arm.side<0?Lt:Lt.clone().negate();const m=new T.Matrix4().makeBasis(F,ax,F.clone().cross(ax).normalize());RIG.lit.quaternion.setFromRotationMatrix(m);RIG.lit.updateMatrixWorld(true);}
/* the fingers round the lighter: each closes until it lies on the body, the thumb comes over onto the hood and wheel */
const LITCOL=[{o:null,kind:'box',c:[0,.032,0],h:[.0125,.033,.0065]},{o:null,kind:'box',c:[0,.071,0],h:[.0095,.009,.0068]}];
function litGrip(arm,th){LITCOL.forEach(c=>c.o=RIG.lit);RIG.lit.updateMatrixWorld(true);gripSolve(arm,HANDS.open,HANDS.grab,LITCOL,[1,1,1,1,th],arm.side);}
function cigInLips(){const d=V3(.04,-.5,-.86).normalize();RIG.cig.position.set(...MOUTH);RIG.cig.quaternion.setFromUnitVectors(V3(0,1,0),d);}
/* =========================== the pack in the hands =========================== */
/* everything in this part is placed from the pack itself, every frame: the left hand holds the pack (palm on its back,
   the fingers round its right edge, the thumb on the front), the right thumb goes under the front edge of the lid and
   stays on it as the lid swings back on its hinge, then the right thumb and index take the end of one filter and draw
   that cigarette straight up out of its row and carry it to the lips. Each finger closes until it meets the card, the
   lid or the cigarette (gripSolve), the palms rest on what they hold without going into it (palmFit), and the hand is
   moved so that the thumb tip / the pinch lands exactly on its target (handSolve). All directions are pack space unless
   marked rig. PK is open for tuning (window.__act.PK). */
const PK={
  /* (the hand poses below were found by a search in the viewmodel lab against the same contacts: thumb / pinch on target,
     nothing inside anything, a natural wrist, the elbow low and to the side) */
  L:{p:[-.0155,.0051,.0029],F:[.985,.016,-.173],N:[.174,-.09,.981],A:[.5,.62,-.6]},
  FL:{F:[-.741,.671,-.043],N:[-.443,-.535,-.719],A:[-.749,.657,-.088]},FLpt:[0,-.0075,.008],
  PI:{F:[-.501,.865,.029],N:[-.692,-.38,-.614],A:[-.842,.537,-.049]},PIy0:.006,PIy1:.02,
  MO:{F:[-.348,.518,-.782],N:[-.657,.46,.597],A:[-.259,.221,-.94]},
  CUP:[.06,.01,-.045],LOOKL:.75,T:{fl0:.45,fl1:.9,lid1:1.25,pi0:1.25,pi1:1.5,take:1.8,pull:2.25,mouth:2.85,rel:3.05,gone:3.35},PULL:.08};
Object.assign(HANDS,{
  holdL:{f:[[-1.45,-1.6,-1.1,.06],[-1.55,-1.65,-1.15,0],[-1.6,-1.65,-1.1,-.05],[-1.65,-1.6,-1.05,-.12]],th:[[.55,.55,0],[-.6],[-.7]]},
  flipA:{f:[[-.55,-.7,-.4,.1],[-.8,-.95,-.6,.02],[-.95,-1.05,-.65,-.05],[-1.05,-1.05,-.6,-.14]],th:[[.05,.15,0],[-.05],[-.1]]},
  flipB:{f:[[-1.3,-1.4,-1,.1],[-1.45,-1.5,-1.05,.02],[-1.5,-1.5,-1,-.05],[-1.55,-1.45,-.95,-.14]],th:[[.05,.15,0],[-.05],[-.1]]},
  pinchO:{f:[[-.35,-.45,-.25,.06],[-1.3,-1.45,-1,0],[-1.4,-1.5,-1,-.06],[-1.5,-1.45,-.95,-.14]],th:[[.05,.2,0],[-.15],[-.15]]},
  /* (closed: the thumb swung round to oppose the index, tip to tip - found by a search in the lab for the pose nearest the
     old one whose pads close to a filter's thickness apart, the two last joints pointing at each other) */
  pinchC:{f:[[-.98,-1.215,-.79,.06],[-1.55,-1.65,-1.15,0],[-1.6,-1.65,-1.1,-.06],[-1.65,-1.6,-1.05,-.14]],th:[[0,.2,0],[-.75],[-.825]]}});
const _pq=new T.Quaternion(),_pv=V3(),_pm=new T.Matrix4(),_FLIP=new T.Quaternion().setFromAxisAngle(V3(1,0,0),Math.PI);
/* pack-space direction / point -> rig space */
const pdir=(v,q)=>V3(...v).applyQuaternion(q||RIG.pack.quaternion);
const ppt=v=>V3(...v).applyMatrix4(RIG.pack.matrix);
/* the palm: points along the back of the hand's inside (wrist side to the knuckles); r is the half thickness to the skin */
function palmGap(arm,cols){const h=arm.hand,w=arm.wr.getWorldPosition(V3());let d=1e9;const pts=[];
  for(let i=0;i<4;i++)pts.push(h.fingers[i][0].getWorldPosition(V3()));
  pts.push(w.clone().lerp(pts[1],.5),w.clone().lerp(pts[1],.78),w.clone().lerp(pts[3],.6),w.clone().lerp(pts[0],.7));
  pts.forEach((q,i)=>{d=Math.min(d,sdf(q,cols)-(i<4?.0105:.0115));});return d;}
/* place an arm by key K (rig space p,F,N,A), close its hand from shape A toward B against cols (lim caps each finger),
   rest the palm on / keep it off the colliders, and move the whole hand so a point of it lands on a target */
/* a pinch on a cigarette: the thumb and index close (the hand from shape A toward B, past B if need be) until the pads of
   their tips are as far apart as the filter is thick plus the two pads - so with the point between them on the
   cigarette's axis (handSolve's target) each pad lies on it, one either side. u: 0 open (shape A) .. 1 closed on it */
const PINCH_SEP=2*(.0039+.0068);
function tipGap(arm){const h=arm.hand;arm.root.updateMatrixWorld(true);const t=ch=>{const P=chainPts(ch);return P[2].clone().lerp(P[3],.55);};return t(h.thumb).distanceTo(t(h.fingers[0]));}
function pinchTo(arm,A,B,u,side){const at=c=>{const H=blendHand(A,B,c);for(let i=0;i<4;i++)poseFinger(arm.hand,i,H.f[i],side);poseThumb(arm.hand,H.th,side);return tipGap(arm);};
  const d0=at(0),want=lerp(d0,PINCH_SEP,clamp(u,0,1));if(d0<=want){at(0);return 0;}
  /* (walk in from open to the first point where the pads are close enough, then narrow it down; past the closed shape the
     fingers over-curl and the gap opens again, so never jump to the far end) */
  let lo=0,hi=-1,bc=0,bd=d0;for(let c=.05;c<=1.4001;c+=.05){const d=at(c);if(d<bd){bd=d;bc=c;}if(d<=want){hi=c;break;}lo=c;}
  if(hi<0){at(bc);return bc;}for(let k=0;k<10;k++){const mid=(lo+hi)/2;if(at(mid)>want)lo=mid;else hi=mid;}at(hi);return hi;}
function nrmN(K){const F=V3(...K.F).normalize();return V3(...K.N).sub(F.clone().multiplyScalar(V3(...K.N).dot(F))).normalize();}
function handSolve(arm,K0,A,B,cols,lim,o={}){const side=arm===RIG.R?-1:1;const K={p:K0.p.slice(),F:K0.F,N:K0.N,A:K0.A};
  const place=()=>{placeArm2(arm,RIG.g,V3(...K.p),V3(...K.F),V3(...K.N),V3(...K.A),0);RIG.g.updateMatrixWorld(true);fpShoulder(arm,RIGSH);arm.root.updateMatrixWorld(true);};
  const close=()=>{if(o.sepU!==undefined){pinchTo(arm,A,B,o.sepU,side);return;}if(cols&&cols.length)gripSolve(arm,A,B,cols,lim,side);else{const u=lim?lim[0]:1;const H=blendHand(A,B,u);poseHand(arm.hand,H.f,H.th,side);arm.root.updateMatrixWorld(true);}};
  const passes=o.target?3:1;if(cols&&cols.length)colPrep(cols);
  for(let k=0;k<passes;k++){place();poseHand(arm.hand,A.f,A.th,side);arm.root.updateMatrixWorld(true);
    if(o.palm&&cols&&cols.length){const d=palmGap(arm,cols);if(o.palm==='touch'||d<0){const n=nrmN(K);K.p=[K.p[0]+n.x*d,K.p[1]+n.y*d,K.p[2]+n.z*d];place();poseHand(arm.hand,A.f,A.th,side);arm.root.updateMatrixWorld(true);}}
    close();
    if(o.target){const d=o.target.clone().sub(handPt(arm,o.which));K.p=[K.p[0]+d.x,K.p[1]+d.y,K.p[2]+d.z];}}
  if(o.target){place();close();}
  /* last: nothing of the hand may be inside anything - push the whole hand straight out of the deepest point */
  if(cols&&cols.length)for(let it=0;it<4;it++){const dp=deepest(arm,cols);if(dp.d>=-.0002)break;
    /* (the gradient is in world space; RIG.g has no scale, so turn it into rig space by its rotation only) */
    const gw=sdfGrad(dp.p,cols),gr=gw.applyQuaternion(RIG.g.getWorldQuaternion(new T.Quaternion()).invert());const k=-dp.d+.0003;K.p=[K.p[0]+gr.x*k,K.p[1]+gr.y*k,K.p[2]+gr.z*k];place();}
  return K;}
/* push a posed arm (fingers as they are) straight out of whatever it is inside */
function depenArm(arm,cols){colPrep(cols);const gq=RIG.g.getWorldQuaternion(new T.Quaternion()).invert();
  for(let it=0;it<12;it++){const dp=deepest(arm,cols);if(dp.d>=-.0002)break;const g=sdfGrad(dp.p,cols).applyQuaternion(gq);arm.el.position.addScaledVector(g,-dp.d+.0006);arm.el.updateMatrixWorld(true);arm.wr.updateMatrixWorld(true);RIG.g.updateMatrixWorld(true);fpShoulder(arm,RIGSH);arm.root.updateMatrixWorld(true);}}
const cigCol=()=>({o:RIG.cig,kind:'cyl',c:[0,0,0],r:.0039,len:.084});
/* the deepest point of a hand inside the colliders (palm and every finger joint / tip, with their radii) */
function deepest(arm,cols){const h=arm.hand;let best={d:1e9,p:null};const chk=(q,r)=>{const d=sdf(q,cols)-r;if(d<best.d)best={d,p:q.clone()};};
  const w=arm.wr.getWorldPosition(V3()),kn=[0,1,2,3].map(i=>h.fingers[i][0].getWorldPosition(V3()));kn.forEach(q=>chk(q,.0105));
  [[1,.5],[1,.78],[3,.6],[0,.7]].forEach(([i,u])=>chk(w.clone().lerp(kn[i],u),.0115));
  h.fingers.concat([h.thumb]).forEach(ch=>{const P=chainPts(ch);for(let k=0;k<3;k++)for(const t of [.5,1])chk(P[k].clone().lerp(P[k+1],t),.0088*(k===2&&t===1?.8:1));});
  return best;}
function sdfGrad(p,cols){const e=.0007,g=V3();for(const a of ['x','y','z']){const q1=p.clone(),q2=p.clone();q1[a]+=e;q2[a]-=e;g[a]=sdf(q1,cols)-sdf(q2,cols);}return g.normalize();}
function keyMix(a,b,u){return{p:aLerp(a.p,b.p,u),F:aLerp(a.F,b.F,u),N:aLerp(a.N,b.N,u),A:aLerp(a.A,b.A,u)};}
const v3a=v=>[v.x,v.y,v.z];
/* a hand as a set of balls (world space): the palm and every finger joint, for the other hand to keep clear of */
function handBalls(arm){const h=arm.hand,o=[];const w=arm.wr.getWorldPosition(V3());const kn=[0,1,2,3].map(i=>h.fingers[i][0].getWorldPosition(V3()));o.push(...kn);
  [[1,.5],[1,.78],[3,.6],[0,.7],[3,.3],[0,.4]].forEach(([i,u])=>o.push(w.clone().lerp(kn[i],u)));
  h.fingers.concat([h.thumb]).forEach(ch=>{const P=chainPts(ch);for(let k=0;k<3;k++)for(const t of [.33,.66,1])o.push(P[k].clone().lerp(P[k+1],t));});
  return{kind:'pts',pts:o,r:.009};}
/* the colliders of the pack as it is this frame */
function packCols(m,withCig){const P=RIG.pack,u=P.userData,W=PACK.W,H=PACK.H,D=PACK.D,LH=PACK.LH;
  const cols=[{o:P,kind:'box',c:[0,(H-LH)/2,0],h:[W/2,(H-LH)/2,D/2]},{o:u.lid,kind:'box',c:[0,LH/2,D/2],h:[W/2,LH/2,D/2]}];
  /* the rest of the cigarettes standing in the box (their tops are bare once the lid is up) */
  let x0=1,x1=-1,z0=1,z1=-1;u.cigs.forEach((c,i)=>{if(!c.visible||i===m.ci)return;x0=Math.min(x0,c.position.x);x1=Math.max(x1,c.position.x);z0=Math.min(z0,c.position.z);z1=Math.max(z1,c.position.z);});
  if(x1>=x0){const r=.0039;cols.push({o:P,kind:'box',c:[(x0+x1)/2,.044,(z0+z1)/2],h:[(x1-x0)/2+r,.042,(z1-z0)/2+r]});}
  if(withCig)cols.push({o:withCig,kind:'cyl',c:[0,0,0],r:.0039,len:.084});
  return cols;}
/* the cigarette being drawn: in the pack, pulled up out of it, then carried to the lips */
const _pk0=new T.Object3D();
function cigPose(m,t){const T_=PK.T,P=RIG.pack,c=P.userData.cigs[m.ci];
  if(t<T_.pull){const k=smooth((t-T_.take)/(T_.pull-T_.take))*PK.PULL;RIG.cig.position.copy(V3(c.position.x,c.position.y+k,c.position.z).applyMatrix4(P.matrix));RIG.cig.quaternion.copy(P.quaternion).multiply(_FLIP);return;}
  const K=mixKey(trackAt(SMK.pack,T_.pull));_pk0.position.set(...K.p);_pk0.rotation.set(...K.r);_pk0.updateMatrix();
  const p0=V3(c.position.x,c.position.y+PK.PULL,c.position.z).applyMatrix4(_pk0.matrix),q0=_pk0.quaternion.clone().multiply(_FLIP);
  cigInLips();const p1=RIG.cig.position.clone(),q1=RIG.cig.quaternion.clone();const u=smooth((t-T_.pull)/(T_.mouth-T_.pull));
  RIG.cig.position.copy(p0).lerp(p1,u).add(V3(.012,.02,.01).multiplyScalar(Math.sin(Math.PI*u)));RIG.cig.quaternion.copy(q0).slerp(q1,smooth(u));}
function packHands(m,t,lidA){const T_=PK.T,P=RIG.pack,u=P.userData,q=P.quaternion;P.updateMatrix();RIG.g.updateMatrixWorld(true);
  if(m.ci===undefined)m.ci=Math.max(0,(m.taken?m.it.count:m.it.count-1));
  /* --- left: holds the pack until it has gone back down out of sight --- */
  if(t<SMK.PACKOFF){const L=PK.L;const pc=packCols(m,null).slice(0,2);
    u.open(0);P.updateMatrixWorld(true);handSolve(RIG.L,{p:v3a(ppt(L.p)),F:v3a(pdir(L.F)),N:v3a(pdir(L.N)),A:L.A},HANDS.open,HANDS.holdL,pc,null,{palm:'touch'});
    /* the lid swings back until it is fully open or it comes to rest against the hand holding the pack */
    let a=lidA;if(a>0){const lc=[pc[1]];const hit=x=>{u.open(x);u.lid.updateMatrixWorld(true);colPrep(lc);return deepest(RIG.L,lc).d<.0005;};
      if(hit(a)){let lo=0,hi=a;for(let k=0;k<9;k++){const mid=(lo+hi)/2;if(hit(mid))hi=mid;else lo=mid;}a=lo;}}
    u.open(a);u.lid.updateMatrixWorld(true);m.lb=handBalls(RIG.L);m.lb.r=.0115;}else m.lb=null;
  /* --- the drawn cigarette --- */
  const held=m.taken&&t<T_.mouth;if(held){cigPose(m,t);RIG.cig.visible=true;RIG.cig.updateMatrixWorld(true);}
  /* --- right --- */
  if(t>=T_.gone)return;
  const cig=held?RIG.cig:u.cigs[m.ci];cig.updateMatrixWorld(true);
  const kFlip=()=>{const L=PK.FL;const tg=RIG.g.worldToLocal(u.lid.localToWorld(V3(PK.FLpt[0],PK.FLpt[1],PACK.D+PK.FLpt[2])));
      const F=pdir(L.F),N=pdir(L.N);const Lt=F.clone().cross(N).normalize();const p0=tg.clone().addScaledVector(Lt,-.068).addScaledVector(N,-.035);
      return{K:{p:v3a(p0),F:v3a(F),N:v3a(N),A:L.A},tg};};
  const pinchY=held?lerp(PK.PIy0,PK.PIy1,smooth((t-T_.pull)/(T_.mouth-T_.pull-.1))):PK.PIy0;
  const kPinch=()=>{const tg=RIG.g.worldToLocal(cig.localToWorld(V3(0,pinchY,0)));let F,N,A;
      if(!held||t<T_.pull){F=pdir(PK.PI.F);N=pdir(PK.PI.N);A=V3(...PK.PI.A);}
      else{const w=smooth((t-T_.pull)/(T_.mouth-T_.pull));const K=mixKey(trackAt(SMK.pack,T_.pull));_pk0.rotation.set(...K.r);
        F=pdir(PK.PI.F,_pk0.quaternion).lerp(V3(...PK.MO.F).normalize(),w);N=pdir(PK.PI.N,_pk0.quaternion).lerp(V3(...PK.MO.N).normalize(),w);A=V3(...PK.PI.A).lerp(V3(...PK.MO.A),w);}
      const Lt=F.clone().cross(N).normalize();const p0=tg.clone().addScaledVector(Lt,-.041).addScaledVector(N,-.055).addScaledVector(F,-.032);
      return{K:{p:v3a(p0),F:v3a(F),N:v3a(N),A:v3a(A)},tg};};
  let K,A,B,lim=null,o={},cols=packCols(m,cig);if(m.lb)cols.push(m.lb);const cigCol=cols.find(c=>c.kind==='cyl');
  if(t<T_.fl0){K=HID_R;A=B=HANDS.open;cols=null;}
  else if(t<T_.fl1){/* reaching in: from below the frame to under the lid's edge */const f=kFlip();const w=smooth((t-T_.fl0)/(T_.fl1-T_.fl0));
    const KK=handSolve(RIG.R,f.K,HANDS.flipA,HANDS.flipB,cols,[.7,.7,.7,.7,0],{target:f.tg,which:'thumb',palm:'out'});
    K=keyMix(HID_R,KK,w);A=blendHand(HANDS.open,HANDS.flipA,w);B=blendHand(HANDS.open,HANDS.flipB,w);lim=[.7,.7,.7,.7,0];o={palm:'out'};}
  else if(t<T_.pi0){/* the thumb on the lid's edge as it swings up and back */const f=kFlip();K=f.K;A=HANDS.flipA;B=HANDS.flipB;lim=[.7,.7,.7,.7,0];o={target:f.tg,which:'thumb',palm:'out'};}
  else if(t<T_.pi1){/* off the lid and over to the end of one filter, the thumb and index apart */const f=kFlip(),g=kPinch();const w=smooth((t-T_.pi0)/(T_.pi1-T_.pi0));
    const K1=handSolve(RIG.R,f.K,HANDS.flipA,HANDS.flipB,cols,[.7,.7,.7,.7,0],{target:f.tg,which:'thumb',palm:'out'});
    const K2=handSolve(RIG.R,g.K,HANDS.pinchO,HANDS.pinchC,cols,[0,1,1,1,0],{target:g.tg,which:'pinch',palm:'out'});
    K=keyMix(K1,K2,w);A=blendHand(HANDS.flipA,HANDS.pinchO,w);B=blendHand(HANDS.flipB,HANDS.pinchC,w);lim=[0,lerp(.7,1,w),lerp(.7,1,w),lerp(.7,1,w),0];o={palm:'out'};}
  else if(t<T_.mouth){/* closing on it, drawing it out, carrying it to the lips: the pinch stays on the filter */const g=kPinch();const c=smooth((t-T_.pi1)/(T_.take-.12-T_.pi1));
    /* the thumb and index close on this one filter alone (its neighbours and the lid would stop them short): both may
       curl past the pinch shape until each lies on the filter, so it is held from both sides before it moves */
    K=g.K;A=HANDS.pinchO;B=HANDS.pinchC;lim=null;o={target:g.tg,which:'pinch',sepU:c,palm:held&&t>T_.pull+.15?undefined:'out'};
    /* (only the pack's card keeps the rest of the hand out; the pads are placed on the filter exactly) */cols=held&&t>T_.pull+.15?[]:[cols[0]];}
  else{/* let go at the lips, then away */const g=kPinch();const KK=handSolve(RIG.R,g.K,HANDS.pinchO,HANDS.pinchC,[],null,{target:g.tg,which:'pinch',sepU:1});
    const r=smooth((t-T_.mouth)/(T_.rel-T_.mouth)),w=smooth((t-T_.rel)/(T_.gone-T_.rel));const back=keyMix(KK,{p:aLerp(KK.p,[KK.p[0]+.03,KK.p[1]-.03,KK.p[2]+.01],1),F:KK.F,N:KK.N,A:KK.A},r);
    K=keyMix(back,HID_R,w);A=HANDS.pinchO;B=HANDS.pinchC;lim=null;cols=[];o={sepU:1-r};}
  handSolve(RIG.R,K,A,B,cols,lim,o);}
function packCount(){const it=S.bag.find(b=>b&&b.id==='cigs');return it?(it.count===undefined?20:it.count):0;}
function startSmoke(){if(ACT.kind==='smoke'||ACT.kind==='drag'||ACT.kind==='dying')return false;if(ACT.kind==='sit'&&ACT.sit.ph!=='sit')return false;
  const it=S.bag.find(b=>b&&b.id==='cigs');if(!it){toast('No cigarettes.');return false;}if(it.count===undefined)it.count=20;if(it.count<=0){toast('The pack is empty.');return false;}
  rigBuild();S.fire=0;S.ads=false;ACT.prev=ACT.kind;ACT.smk={t:0,ph:'light',taken:false,lit:false,burn:0,puffs:0,max:5,idle:3+Math.random()*1.5,puffT:-1,done:false,it,seated:ACT.kind==='sit'};
  if(ACT.kind!=='sit')ACT.kind='smoke';else ACT.smkOnSit=true;RIG.pack.userData.set(it.count);RIG.g.visible=true;RIG.cig.visible=false;RIG.lit.visible=false;sfx.pick&&sfx.pick();return true;}
ACT.smoke=()=>{const m=ACT.smk;if(m){if(m.ph==='hold'&&m.lit&&!m.thrown){m.want=true;return true;}return false;}const ok=startSmoke();if(ok)setTimeout(()=>{if(ACT.smk&&!ACT.smk.hinted){ACT.smk.hinted=1;toast&&toast('G — draw on it');}},6500);return ok;};
/* (between draws it still burns slowly, the ash growing on it) */
/* a short soft burst of smoke at a world point */
function puffAt(p,v,n,big){for(let i=0;i<n;i++)FX.smoke.spawn(p.clone().add(V3(wr(-.01,.01),wr(-.01,.01),wr(-.01,.01))),v.clone().add(V3(wr(-.08,.08),wr(.02,.12),wr(-.08,.08))),wr(1.6,2.8),big?.04:.012,big?.42:.14,[.78,.78,.76,big?.16:.1],[.82,.82,.8,0],{drag:1.4,up:.06});}
function smokeTick(dt){const m=ACT.smk;if(!m)return;m.t+=dt;const t=m.t;const it=m.it;
  if(m.ph==='light'){
    const P=mixKey(trackAt(SMK.pack,t));RIG.pack.position.set(...P.p);RIG.pack.rotation.set(...P.r);const lr=trackAt(SMK.lid,t);RIG.pack.userData.open(lerp(lr.v,lr.w,lr.u));RIG.pack.visible=t<SMK.PACKOFF;
    /* drawing one out: the count goes down the moment it leaves the pack */
    if(!m.taken&&t>=SMK.TAKE){m.ci=Math.max(0,it.count-1);m.taken=true;it.count=Math.max(0,it.count-1);RIG.pack.userData.set(it.count);sfx.click&&sfx.click();}
    if(!m.taken)RIG.cig.visible=false;
    packHands(m,t,lerp(lr.v,lr.w,lr.u));
    const kl=trackAt(SMK.L,t),KL=mixKey(kl),shL=handShape(kl.v.h,kl.w.h,kl.u);if(t>=SMK.PACKOFF)rigArm(RIG.L,KL,shL);
    /* the lighter in the left fist, the thumb over the wheel; the hand brings the flame to the end of the cigarette */
    RIG.lit.visible=t>3.3&&t<5.6;let fp=null;
    if(RIG.lit.visible){litOnHand(RIG.L);
      const w=smooth((t-3.45)/.35)*(1-smooth((t-5.15)/.3));if(w>0&&m.taken){cigInLips();RIG.cig.updateMatrixWorld(true);const tip=RIG.g.worldToLocal(RIG.cig.localToWorld(V3(0,cigBurn(RIG.cig,0)+.004,0)));
        const fl=RIG.g.worldToLocal(RIG.lit.localToWorld(V3(.002,.083,0)));const d=tip.sub(fl).multiplyScalar(w);rigArm(RIG.L,Object.assign({},KL,{p:[KL.p[0]+d.x,KL.p[1]+d.y,KL.p[2]+d.z]}),shL);litOnHand(RIG.L);}
      /* the thumb rests up on the hood, then rolls down hard over the wheel at the strike */
      const th=t<3.95?.5:t<SMK.STRIKE?lerp(.5,1,smooth((t-3.95)/(SMK.STRIKE-3.95))):1;
      litGrip(RIG.L,th);if(m.taken){RIG.cig.updateMatrixWorld(true);depenArm(RIG.L,[cigCol()]);litOnHand(RIG.L);}
      fp=RIG.g.worldToLocal(RIG.lit.localToWorld(V3(.002,.09,0)));}
    if(t>=PK.T.gone){const kr=trackAt(SMK.R,t),KR=mixKey(kr),shR=handShape(kr.v.h,kr.w.h,kr.u);
      /* the right hand cupped round the far side of the flame, out of the wind */
      const wc=smooth((t-3.55)/.3)*(1-smooth((t-5.1)/.4));if(fp&&wc>0)KR.p=aLerp(KR.p,[fp.x+PK.CUP[0],fp.y+PK.CUP[1],fp.z+PK.CUP[2]],wc);
      rigArm(RIG.R,KR,shR);if(RIG.lit.visible){LITCOL.forEach(c=>c.o=RIG.lit);const hb=handBalls(RIG.L);hb.r=.0125;depenArm(RIG.R,m.taken?[cigCol(),...LITCOL,hb]:[...LITCOL,hb]);}}
    if(m.taken&&t>=SMK.MOUTH){RIG.cig.visible=true;cigInLips();}
    /* the lighter: strike (the wheel spins, a spark), the flame, the tip catches, the flame let go */
    const fl=RIG.lit.userData.flame;fl.material.uniforms.uT.value=S.t;
    if(t>=SMK.STRIKE&&!m.struck){m.struck=1;if(AUD.burst){AUD.burst(.025,.18,4200,0,'highpass',.7);AUD.burst(.012,.12,7000,0,'bandpass',3,.008);}FX.spark&&FX.spark.spawn(RIG.lit.localToWorld(V3(-.006,.084,0)),V3(0,.3,0),.15,.004,.001,[1,.8,.4,1],[1,.4,.1,0]);}
    const on=t>=SMK.LIGHT&&t<SMK.FLAMEOFF;fl.visible=on;if(on&&!m.fon){m.fon=1;if(AUD.burst)AUD.burst(.35,.05,900,300,'lowpass',.6);}
    const fw=RIG.lit.localToWorld(V3(.002,.09,0));RIG.lightV.position.copy(RIG.g.worldToLocal(fw.clone()));RIG.lightV.intensity=on?.9+Math.sin(S.t*31)*.1:0;
    RIG.lightW.position.copy(camera.localToWorld(RIG.lightV.position.clone()));RIG.lightW.intensity=on?.55:0;
    if(t>=SMK.LIT&&!m.lit){m.lit=true;/* (it calms you; it is not good for you) */S.sanity=clamp(S.sanity+12,0,100);S.hp=clamp(S.hp-1,1,100);}
    if(t>=SMK.FLAMEOFF&&!m.foff){m.foff=1;if(AUD.burst)AUD.burst(.02,.1,2500,0,'bandpass',2);}
    if(t>=SMK.END){m.ph='hold';m.pt=0;m.puffT=0;m.grab=false;RIG.pack.visible=false;RIG.lit.visible=false;}}
  else{/* burning: held low; puffs come on their own every few seconds; the arm follows the walk */
    m.pt+=dt;m.idle-=dt;let k=HOLD_R;if(m.lit&&!m.thrown)m.burn=Math.min(.97,m.burn+dt*.0035);
    /* (you take each draw yourself: G again, five to a cigarette) */if(m.puffT<0&&m.want&&m.ph==='hold'&&m.pt>.4){m.puffT=0;m.want=false;}
    if(m.puffT>=0){m.puffT+=dt;const u=m.puffT;const w=u<.55?smooth(u/.55):u<1.85?1:1-smooth((u-1.85)/.55);k=keyMix(HOLD_R,lipsKey(),w);if(u>=.55)m.grab=true;
      if(u>.55&&u<1.85){m.burn=Math.min(1,m.burn+dt*.13);m.inhale=1;if(Math.random()<dt*14&&FX.ember)FX.ember.spawn(cigTip(),V3(wr(-.03,.03),wr(.02,.08),wr(-.03,.03)),wr(.2,.5),.0025,.001,[1,.6,.2,1],[1,.3,.05,0],{drag:1.5,g:1});}else m.inhale=0;
      if(u>=2.4){m.puffT=-1;m.puffs++;m.idle=2.5+Math.random()*2.5;/* the breath out, a moment after *//* the breath out: a long soft stream from the mouth, thinning, curling up past the face */for(let k=0;k<6;k++)setTimeout(()=>{const ex=camera.localToWorld(V3(wr(-.01,.01),-.08,-.12));const fv=camera.getWorldDirection(V3()).multiplyScalar(.42-k*.04).add(V3(0,.04*k,0));puffAt(ex,fv,4,k<3);},250+k*110);
        if(m.puffs>=m.max||m.burn>=1){m.ph='flick';m.ft=0;}}}
    if(m.ph==='flick'){m.ft+=dt;const u=smooth(m.ft/.35);k=Object.assign({},HOLD_R,{p:aLerp(HOLD_R.p,[.24,-.13,-.43],u)});
      if(m.ft>=.3&&!m.thrown){m.thrown=1;throwButt();}
      if(m.ft>=.75){endSmoke();return;}}
    else{const sw=Math.sin(player.ph)*.01*player.bobA;k=Object.assign({},k,{p:[k.p[0]+sw,k.p[1]+sabs(Math.cos(player.ph))*.008*player.bobA,k.p[2]]});}
    if(m.pt<.35)k=keyMix(HID_R,k,smooth(m.pt/.35));
    rigArm(RIG.R,k,HANDS.vO);rigArm(RIG.L,HID_L,HANDS.open);
    if(!m.thrown){RIG.cig.visible=true;if(!m.grab)cigInLips();else{cigInFingers();RIG.cig.updateMatrixWorld(true);
      if(!(m.ph==='flick'&&m.ft>.28)){const cc=[cigCol()];colPrep(cc);gripSolve(RIG.R,HANDS.vO,HANDS.vC,cc,[1,1,1,1,1],-1);depenArm(RIG.R,cc);}}}else RIG.cig.visible=false;
    /* a thin thread of smoke off the tip while it is held, more after a puff */
    m.wisp=(m.wisp||0)-dt;if(m.wisp<=0&&!m.thrown){m.wisp=.12;const p=cigTip();FX.smoke.spawn(p,V3(wr(-.02,.02),.16,wr(-.02,.02)),wr(1.2,2),.006,.07,[.8,.8,.8,.12],[.85,.85,.85,0],{drag:.6,up:.05});}}
  /* the head goes down to look at the hands while lighting, and stays a little down while smoking (the rig is in the
     head's frame, so it is turned back up by the same angle - see actTick) */
  {const t2=m.ph==='light'?m.t:99;/* one smooth curve: down to the pack in the hands, further down as the cigarette comes to the lips (so its end is in
     view), held there through the light, then easing back up to where it rests while smoking */
   const want=m.ph==='light'?(t2<.15?0:t2<1.9?lerp(0,.34,smooth((t2-.15)/.6)):t2<5.3?lerp(.34,PK.LOOKL,smooth((t2-1.9)/1.1)):lerp(PK.LOOKL,.2,smooth((t2-5.3)/.7))):m.ph==='flick'?.05:(m.puffT>=0?.44:.2);ACT.lookT=want;}
  /* the ember: dull between puffs, bright while drawing on it */
  const u=RIG.cig.userData;u.em.visible=u.gl.visible=m.lit&&!m.thrown;if(m.lit){m.emb=damp(m.emb||.35,m.inhale?1:.32+Math.sin(S.t*7)*.04,m.inhale?6:2.5,Math.max(dt,.016));const g=m.emb;u.em.material.color.setRGB(.55+g*.45,.12+g*.32,.03+g*.1);u.gl.material.opacity=.15+g*.75;u.gl.scale.setScalar(.014+g*.028);}
  cigBurn(RIG.cig,m.burn);}
/* the butt, flicked: it flies, lands, glows a while and smokes a little */
function throwButt(){const p=cigTip();const g=new T.Group();const f=new T.Mesh(new T.CylinderGeometry(.0039,.0039,.024,10),PACK.filt);const pp=new T.Mesh(new T.CylinderGeometry(.0039,.0039,.014,10),PACK.paper);pp.position.y=.019;
  const em=new T.Sprite(new T.SpriteMaterial({map:PTEX.soft,color:C(0xff5a18),transparent:true,blending:T.AdditiveBlending,depthWrite:false}));em.scale.setScalar(.025);em.position.y=.027;g.add(f,pp,em);g.position.copy(p);scene.add(g);
  const v=camera.getWorldDirection(V3()).multiplyScalar(2.6).add(V3(0,1.4,0)).add(V3(wr(-.3,.3),0,wr(-.3,.3)).applyQuaternion(camera.quaternion));
  ACT.butts.push({g,v,t:0,em,rest:false,w:V3(wr(-12,12),wr(-12,12),wr(-12,12))});if(ACT.butts.length>12){const o=ACT.butts.shift();scene.remove(o.g);}}
function buttsTick(dt){for(const b of ACT.butts){b.t+=dt;if(!b.rest){b.v.y-=9.8*dt;b.g.position.addScaledVector(b.v,dt);b.g.rotation.x+=b.w.x*dt;b.g.rotation.z+=b.w.z*dt;const gy=groundY(b.g.position.x,b.g.position.z)+.004;
      if(b.g.position.y<=gy){b.g.position.y=gy;b.rest=true;b.g.rotation.set(Math.PI/2,b.g.rotation.y,0);}}
    const a=clamp(1-(b.t-4)/20,0,1);b.em.material.opacity=a*(.6+Math.sin(S.t*5+b.t)*.15);b.em.visible=a>0;
    if(a>0&&b.rest){b.sm=(b.sm||0)-dt;if(b.sm<=0){b.sm=.35;FX.smoke.spawn(b.g.position.clone().add(V3(0,.01,0)),V3(0,.12,0),1.5,.005,.05,[.8,.8,.8,.08*a],[.85,.85,.85,0],{drag:.5,up:.04});}}}}
function endSmoke(){const m=ACT.smk;if(!m)return;ACT.smk=null;if(RIG.g)RIG.g.visible=false;if(RIG.lightW)RIG.lightW.intensity=0;
  if(m.it&&m.it.count<=0){const i=S.bag.indexOf(m.it);if(i>=0){S.bag.splice(i,1);toast('Pack empty - thrown away.');}}
  if(ACT.kind==='smoke')ACT.kind=null;ACT.smkOnSit=false;}
/* cut short (a shot, damage, death, a load): whatever is out goes away at once; a cigarette already out of the pack is
   used up (it is dropped, still lit if it was); the pack keeps what it had left */
function cancelSmoke(){const m=ACT.smk;if(!m)return;if(m.taken&&!m.thrown&&RIG.cig.visible){try{throwButt();}catch(_){}}m.thrown=1;endSmoke();}
ACT.cancelSmoke=cancelSmoke;
ACT.onFire=()=>{if(ACT.kind==='sit'||ACT.kind==='drag'||ACT.kind==='dying')return true;if(ACT.smk){cancelSmoke();return true;}return false;};

/* =========================== dragging a downed enemy =========================== */
/* you take him by the shoulder strap of his rig and pull him along the ground behind your hand, walking slowly; his body
   is the same ragdoll he fell as, held at the top of the back, so it drags, swings and catches on things for real. E lets
   go; if he dies, if you are hit down, or if he snags and you pull away from him, you let go */
ACT.startDrag=sep=>{if(ACT.kind||ACT.smk||!sep||sep.state!=='down'||!sep.rag)return;S.fire=0;S.ads=false;ACT.kind='drag';
  const r=sep.rag;r.pin={i:2,p:r.p[2].clone()};r.done=false;r.t=1.3;ACT.drag={sep,r,t:0,scr:0};if(AUD.burst){AUD.burst(.18,.12,1500,600,'bandpass',.8);AUD.burst(.08,.08,3000,0,'bandpass',2,.05);}};
ACT.dragTick=dt=>{const d=ACT.drag;if(!d)return;d.t+=dt;const sep=d.sep,r=d.r;if(sep.state!=='down'){ACT.dropDrag();return;}
  /* the hand: in front of you, low (bent over, about knee height), a little to the right */
  const fw=V3(-Math.sin(player.yaw),0,-Math.cos(player.yaw)),rt=V3(-fw.z,0,fw.x);const hx=player.pos.x+fw.x*.62+rt.x*.08,hz=player.pos.z+fw.z*.62+rt.z*.08;
  const tgt=V3(hx,floorAt(hx,hz)+.5,hz);const k=clamp(d.t/.6,0,1);r.pin.p.lerp(tgt,k<1?.15:1);r.done=false;r.t=Math.min(r.t,5);
  /* he catches on something and you have pulled away from him: let go */
  if(r.p[1].distanceTo(r.pin.p)>.9||r.p[0].distanceTo(r.pin.p)>1.6){ACT.dropDrag();toast('He is caught on something.');return;}
  /* bent over the weight: the eye comes down */ACT.eyeDrop=.28*k;
  /* the scrape of him over the ground */const v=Math.hypot(player.vel.x,player.vel.z);d.scr-=dt;if(v>.25&&d.scr<=0&&AUD.burst){d.scr=.32;AUD.burst(.3,.05+v*.04,surface()==='grass'?900:600,0,'lowpass',.7);}};
ACT.dropDrag=()=>{const d=ACT.drag;ACT.eyeDrop=0;if(!d)return;ACT.drag=null;if(d.r){d.r.pin=null;d.r.done=false;d.r.t=0;d.r.still=0;}if(ACT.kind==='drag')ACT.kind=null;};

/* =========================== dying =========================== */
/* the legs go, you fold, then go over to one side and the ground comes up; the picture greys and fades to black, the
   sound drains away, then the KIA screen. Nothing you press changes it once it starts. */
function playerDie(why){if(ACT.kind==='dying'||S.state==='dead')return;cancelSmoke();if(ACT.drag&&ACT.dropDrag)ACT.dropDrag();if(SEATA.an)SEATA.an.paused=true;
  const seated=ACT.kind==='sit';ACT.kind='dying';ACT.sit=null;S.fire=0;S.ads=false;S.state='dying';
  const fw=V3(-Math.sin(player.yaw),0,-Math.cos(player.yaw)),rt=V3(-fw.z,0,fw.x);
  /* fall to whichever side is clear */let side=Math.random()<.5?-1:1;const ray=new T.Raycaster();for(const s of [side,-side]){ray.set(camera.position.clone().add(V3(0,-.6,0)),rt.clone().multiplyScalar(s));ray.far=1.1;if(!ray.intersectObjects(shootables,false).length){side=s;break;}}
  const g0=seated?WEST.seat.p.y-.4:groundY(camera.position.x,camera.position.z);
  ACT.dead={t:0,why,p0:camera.position.clone(),yaw:player.yaw,pitch:player.pitch,side,fw,rt,gy:g0,thud:false,shown:false};
  const f=$('fade');f.style.transition='none';
  if(AC&&AUD.master){try{const t=AC.currentTime;AUD.master.gain.cancelScheduledValues(t);AUD.master.gain.setValueAtTime(AUD.master.gain.value,t);AUD.master.gain.setTargetAtTime(0,t+.5,1.0);}catch(_){}}}
ACT.die=playerDie;
function dieTick(dt){const d=ACT.dead;d.t+=dt;const t=d.t;
  /* knees (0-.35s), topple (.35-1.1s, accelerating), the hit, then still */
  const k1=smooth(t/.35),k2=clamp((t-.35)/.75,0,1),k2e=k2*k2,hit=t>1.1?Math.exp(-(t-1.1)*9)*Math.sin((t-1.1)*30)*.03:0;
  const top=d.p0.y,gy=d.gy;let y=top-.5*k1;y=lerp(y,gy+.2,k2e)+hit;
  const off=d.rt.clone().multiplyScalar(d.side*.45*k2e).addScaledVector(d.fw,.18*k1+.1*k2e);
  camera.position.set(d.p0.x+off.x,Math.max(y,gy+.16),d.p0.z+off.z);
  const roll=d.side*(.08*k1+1.2*k2e)+hit*3,pitch=lerp(d.pitch,-.18,k1)+(-.1)*k2e;
  camera.rotation.set(pitch,d.yaw+d.side*.15*k2e,roll);
  if(t>1.1&&!d.thud){d.thud=true;if(AUD.burst){AUD.burst(.22,.5,180,60,'lowpass',.8);AUD.burst(.1,.25,700,0,'bandpass',.8,.02);}}
  ACT.lower=Math.min(1,ACT.lower+dt*3);
  if(CH2&&CH2.post){CH2.post.blur=clamp((t-.6)/2.4,0,1)*.7;CH2.post.desat=clamp((t-.4)/2,0,1)*.8;}
  $('fade').style.opacity=clamp((t-.9)/2.4,0,1);
  if(t>=3.6&&!d.shown){d.shown=true;S.state='play';S.state='dead';ACT.kind=null;showDead(d.why);}}
function showDead(why){document.exitPointerLock();if($('loadd'))$('loadd').style.display=saveData()?'':'none';$('deadwhy').textContent=why;$('dead').classList.remove('off');
  /* (the sound comes back up for the screen's own buttons; the fade stays black behind it) */if(AC&&AUD.master){try{AUD.master.gain.setTargetAtTime(.55,AC.currentTime+.2,.4);}catch(_){}}}

/* =========================== per frame, and resetting =========================== */
function actTick(dt){
  /* the weapon goes down out of view while the hands are busy, and comes back up after */
  const want=(ACT.kind==='sit'||ACT.kind==='drag'||ACT.kind==='dying'||ACT.smk)?1:0;ACT.lower=damp(ACT.lower,want,want?7:6,dt);
  if(VM.gun)vmRoot.visible=ACT.lower<.97&&S.state!=='ride';
  ACT.look=damp(ACT.look||0,ACT.smk?(ACT.lookT||0):0,4,dt);if(RIG.g)RIG.g.rotation.x=ACT.look;
  if(ACT.kind==='dying'){dieTick(dt);return;}
  if(ACT.kind==='sit'&&S.state==='play')sitTick(dt);
  if(ACT.smk&&(S.state==='play'||S.state==='inv'||S.state==='note'||S.state==='paused')){if(S.state==='play')smokeTick(dt);}
  if(ACT.kind==='drag'&&ACT.dragTick)ACT.dragTick(dt);
  buttsTick(dt);}
/* E while busy: stand up / let go */
ACT.use=()=>{if(ACT.kind==='sit'&&ACT.sit.ph==='sit'&&!ACT.smk){standUp();return true;}if(ACT.kind==='sit')return true;if(ACT.kind==='drag'&&ACT.dropDrag){ACT.dropDrag();return true;}return false;};
ACT.move=dt=>ACT.kind==='sit'||ACT.kind==='dying';
ACT.reset=()=>{cancelSmoke();if(ACT.drag&&ACT.dropDrag)ACT.dropDrag();ACT.kind=null;ACT.sit=null;ACT.dead=null;if(SEATA.an)SEATA.an.paused=true;ACT.lower=0;$('fade').style.transition='';
  if(AC&&AUD.master){try{AUD.master.gain.cancelScheduledValues(AC.currentTime);AUD.master.gain.setTargetAtTime(.55,AC.currentTime,.2);}catch(_){}}};
/* a second pack, half smoked, left on the separatists' radio table in the bog */
if(WEST.table)placeItem({id:'cigs',x:WEST.table.x-.32,y:WEST.table.y+.002,z:WEST.table.z-.12,rot:[0,.7,0],data:{id:'cigs',count:9}});
/* the seat at the radio table */
if(WEST.seat)interact.push({obj:WEST.seat.obj,off:V3(0,.4,0),r:1.6,label:'Sit down',show:()=>!ACT.kind,fn(){sitDown();}});
/* for the test harness: pose the smoking rig at time t (no game state) */
window.__act={ACT,RIG,SMK,PK,handBalls,deepest,chainPen,packHands,handSolve,palmGap,packCols,rigArm,armTo,gripSolve,handPt,chainPts,colPrep,sdf,poseFinger,poseThumb,handFrame,sitDown,standUp,startSmoke,cancelSmoke,playerDie,saveGame,saveData,saveCheck,keys,doInteract,findInteract,tickStats,WX,wxRoad,K:{SAVEK,SAVEB,SAVET},smokeAt(t){rigBuild();if(!ACT.smk){const it=S.bag.find(b=>b.id==='cigs')||{id:'cigs',count:20};ACT.smk={t:0,ph:'light',taken:false,lit:false,burn:0,puffs:0,max:5,idle:99,puffT:-1,done:false,it};}
  RIG.g.visible=true;
  if(t<=SMK.END){ACT.smk.t=Math.max(0,t-.001);smokeTick(.001);ACT.look=ACT.lookT||0;RIG.g.rotation.x=ACT.look;RIG.g.updateMatrixWorld(true);return;}
  /* after lighting: held low, a puff from END+1.5, a flick from END+4.4 */
  const m=ACT.smk;m.t=SMK.END+1;m.ph='hold';m.lit=true;m.taken=true;m.idle=99;m.burn=.2;m.thrown=0;m.grab=true;m.pt=1;const u=t-SMK.END;
  if(u>=4.4){m.ph='flick';m.ft=u-4.4-.0001;m.puffT=-1;if(m.ft>=.3)m.thrown=1;}else if(u>=1.5&&u<3.9){m.puffT=u-1.5-.0001;}else m.puffT=-1;
  smokeTick(.0001);ACT.look=ACT.lookT||0;RIG.g.rotation.x=ACT.look;RIG.g.visible=true;RIG.g.updateMatrixWorld(true);}};
