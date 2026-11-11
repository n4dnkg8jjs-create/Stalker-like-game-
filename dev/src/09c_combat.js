/* ---------- combat for chapter 3: hit volumes on characters, bullet holes that stay in their clothes, blood that
   spurts, drips and pools (and dries away after two minutes), verlet ragdolls that drive the skeleton, NPC rifle fire,
   and the separatists' Soviet surplus kit. ---------- */
/* faded Soviet cotton: an olive-khaki twill, sun-bleached on the high points, sweat and oil stains, a darker wet hem */
TX.khaki=tex(512,512,(g,w,h)=>{pix(g,w,h,(u,v,x,y)=>{const n=fbmT(u,v,4,4),m=fbmT(u+.3,v,16,3),f=fbmT(u,v+.5,64,2);const tw=((x+y)%4<2)?1:.93;
  let c=[104+(n-.5)*26,100+(n-.5)*22,70+(n-.5)*16].map(q=>q*tw*(.95+f*.1));c=mixc(c,[128,122,92],sstep(.62,.8,m)*.45);c=mixc(c,[70,64,46],sstep(.66,.82,fbmT(u+.7,v+.1,6,3))*.4);return c;});},{rep:[1,1]});

/* ======================= hit volumes ======================= */
const HITS=[];const _hidden=new T.MeshBasicMaterial({visible:false});
/* invisible capsules and spheres on the bones, built round the bind-pose joints (call before the rig is posed) */
function addHits(h,owner){h.root.updateMatrixWorld(true);const B=h.P.bones,wp=n=>B[n].getWorldPosition(new T.Vector3());const list=[];
  const put=(bone,g,part)=>{const inv=new T.Matrix4().copy(B[bone].matrixWorld).invert();g.applyMatrix4(inv);g.computeBoundingSphere();const m=new T.Mesh(g,_hidden);m.userData={owner,part,bone};B[bone].add(m);HITS.push(m);list.push(m);return m;};
  const cyl=(a,b,r,sx=1,sz=1)=>{const d=b.clone().sub(a),L=d.length();const g=new T.CylinderGeometry(r,r,L,8);g.scale(sx,1,sz);g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(new T.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize())));g.translate((a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2);return g;};
  const c=CD.chars[h.name].fit;const hd=wp('head');
  put('head',new T.SphereGeometry(.118,10,8).translate(0,(c.headTop+hd.y)/2-.005,hd.z-.005),'head');
  put('neck',cyl(wp('neck'),hd,.065),'neck');
  put('spine',cyl(wp('spine').add(V3(0,-.02,0)),wp('neck').add(V3(0,.02,0)),.17,1.12,.78),'torso');
  put('hips',cyl(wp('hips').add(V3(0,-.12,0)),wp('spine'),.16,1.1,.8),'torso');
  for(const s of ['L','R']){put('sh'+s,cyl(wp('sh'+s),wp('el'+s),.06),'limb');put('el'+s,cyl(wp('el'+s),wp('wr'+s),.05),'limb');
    put('hp'+s,cyl(wp('hp'+s),wp('kn'+s),.09),'limb');put('kn'+s,cyl(wp('kn'+s),wp('an'+s),.065),'limb');}
  return list;}
function dropHits(list){list.forEach(m=>{const i=HITS.indexOf(m);if(i>=0)HITS.splice(i,1);if(m.parent)m.parent.remove(m);});}
/* bullet holes in the clothes: hit points are kept in the bind pose, so a hole stays in its place on the cloth however
   the body moves; each one gets a torn rim and a stain that spreads for a minute */
function holeMats(h){/* a body rebuilt on a reload can get the same cached materials back: those keep their one patch and
   their uniforms, cleared for the new body */
  const old=h.P.uniqMats.map(m=>m._hU).find(Boolean);if(old){old.uHits.value.forEach(v=>v.set(0,-9,0,-1));h.holes=old;h.nh=0;}
  const U=old||{uHits:{value:Array.from({length:10},()=>new T.Vector4(0,-9,0,-1))},uNow:WU.time};h.holes=U;h.nh=0;
  h.P.uniqMats.forEach(m=>{if(m._hU)return;m._hU=U;const prev=m.onBeforeCompile;m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);s.uniforms.uHits=U.uHits;s.uniforms.uNow=U.uNow;
      s.vertexShader='varying vec3 vHP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHP=position;');
      s.fragmentShader='uniform vec4 uHits[10];uniform float uNow;varying vec3 vHP;\n'+s.fragmentShader.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
        for(int i=0;i<10;i++){vec4 hh=uHits[i];if(hh.w<0.)continue;float r=length(vHP-hh.xyz);float age=max(uNow-hh.w,0.);
          float n=fract(sin(dot(floor(vHP*700.),vec3(12.9898,78.233,37.719)))*43758.5453);float R=.018+min(age*.0016,.05);
          float stain=1.-smoothstep(R*.5,R*(1.05+n*.3),r+(n-.5)*.005);float hole=1.-smoothstep(.0042,.0068,r+(n-.5)*.0012);float fray=(1.-smoothstep(.0065,.012,r))*(1.-hole);
          diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.075,.012,.01),stain*.88);diffuseColor.rgb=mix(diffuseColor.rgb,diffuseColor.rgb*1.4+.03,fray*n*.7);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.01,.004,.003),hole);
          roughnessFactor=mix(roughnessFactor,.32,stain*(1.-smoothstep(20.,90.,age)));}`);};
    const ck=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>ck+'|holes';m.needsUpdate=true;});}
function addHole(h,hitObj,p){if(!h.holes)return;const bone=h.P.bones[hitObj.userData.bone];const i=h.skel.bones.indexOf(bone);if(i<0)return;
  const q=p.clone().applyMatrix4(new T.Matrix4().copy(bone.matrixWorld).invert()).applyMatrix4(new T.Matrix4().copy(h.skel.boneInverses[i]).invert());
  h.holes.uHits.value[h.nh%10].set(q.x,q.y,q.z,S.t);h.nh++;}

/* ======================= blood ======================= */
FX.blood=new PSys(260,PTEX.soft,false,{order:3});FX.bloodMist=new PSys(90,PTEX.smoke,false,{order:3});
const DROPS=[],STAINS=[],FLOORS=[];
/* floors above the ground: the firing platform in the shack */
/* the ground as it is drawn: the terrain is a mesh of 3.8 m triangles, so between its vertices the surface you see is the
   flat triangle, not the smooth height function - a body laid on the function floats over hollows and sinks into
   rises. Here the triangle is interpolated exactly as the mesh splits its cells (corner heights cached); over a road or
   anything else drawn above the mesh, the higher surface wins */
const _TMH=new Map(),TSX=1285/338,TSZ=1040/272;
function terrMeshY(x,z){const fx=(x+905)/TSX,fz=(z+720)/TSZ,ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz;
  const c=(i,j)=>{const k=i*4096+j;let h=_TMH.get(k);if(h===undefined){h=Hterr(-905+i*TSX,-720+j*TSZ);if(_TMH.size>200000)_TMH.clear();_TMH.set(k,h);}return h;};
  const h00=c(ix,iz),h10=c(ix+1,iz),h01=c(ix,iz+1),h11=c(ix+1,iz+1);return u+v<=1?h00+u*(h10-h00)+v*(h01-h00):h11+(1-u)*(h01-h11)+(1-v)*(h10-h11);}
function groundSeen(x,z){const h=H(x,z);if(x<-904||x>379||z<-719||z>319||inDET(x,z))return h;const ht=Hterr(x,z);return ht<h-.05?h:terrMeshY(x,z);}
function floorAt(x,z){let y=groundSeen(x,z);if(inHouse(x,z))y=Math.max(y,FL+.03);else for(const p of PORCHES)if(x>p.x1&&x<p.x2&&z>p.z1&&z<p.z2){y=Math.max(y,p.y);break;}for(const f of FLOORS)if(x>f.x0&&x<f.x1&&z>f.z0&&z<f.z1)y=Math.max(y,f.y);return y;}
let _bseed=0;
function bloodSpurt(p,dir,k=1){const d=dir.clone().normalize();
  /* the puff of mist where the round goes in and out - big enough to read at fighting distance - then the spray of
     droplets thrown on along the round's line, falling, and a little blown back toward the shooter */
  for(let i=0;i<4;i++)FX.bloodMist.spawn(p.clone().addScaledVector(d,i*.1),d.clone().multiplyScalar(wr(.4,1.3)).add(V3(wr(-.3,.3),wr(0,.35),wr(-.3,.3))),wr(.45,.75),wr(.18,.28)*k,wr(.75,1.1)*k,[.62,.05,.035,.95],[.4,.03,.025,0],{g:.4,drag:3.5,fi:.04,spin:wr(-1,1)});
  for(let i=0;i<2;i++)FX.bloodMist.spawn(p,d.clone().multiplyScalar(-wr(.3,.8)).add(V3(0,wr(0,.3),0)),wr(.3,.45),.12*k,.45*k,[.6,.05,.035,.8],[.4,.03,.025,0],{g:.3,drag:4,fi:.04});
  for(let i=0;i<Math.round(11*k);i++){const v=d.clone().multiplyScalar(wr(1.4,4.5)).add(V3(wr(-.7,.7),wr(-.2,1),wr(-.7,.7)));
    FX.blood.spawn(p,v,wr(.3,.65),wr(.035,.06),wr(.05,.09),[.6,.035,.025,1],[.35,.015,.012,0],{g:9.8,drag:1.2,fi:0});}
  for(let i=0;i<3;i++)FX.blood.spawn(p,d.clone().multiplyScalar(-wr(.5,1.4)).add(V3(wr(-.4,.4),wr(0,.5),wr(-.4,.4))),wr(.25,.4),.04,.12,[.45,.03,.02,.7],[.3,.02,.02,0],{g:3,drag:3,fi:0});
  for(let i=0;i<Math.round(3+4*k);i++)DROPS.push({p:p.clone(),v:d.clone().multiplyScalar(wr(1.2,3.6)).add(V3(wr(-.8,.8),wr(.2,1.4),wr(-.8,.8))),big:WR()<.35});}
/* a stain on the ground that soaks in, and after two minutes dries away */
function stain(kind,x,z,w,l,dir,o={}){const seed=(kind==='pool'?400:kind==='spot'?500:600)+(_bseed++%5);
  const d=groundBlood(kind,seed,x,z,w,l,dir,floorAt,{lift:.018+(STAINS.length%8)*.0011,spread:o.spread});/* (blood stays five minutes, then dries away) */const e={d,t:0,life:300,spread:o.spread!==undefined,tg:o.tg||.14,rate:o.rate||16};STAINS.push(e);
  if(STAINS.length>160){const q=STAINS.shift();if(q.d.parent)q.d.parent.remove(q.d);q.d.geometry.dispose();q.d.material.dispose();}return e;}
function bloodTick(dt){for(let i=DROPS.length-1;i>=0;i--){const q=DROPS[i];q.v.y-=9.8*dt;q.p.addScaledVector(q.v,dt);const fy=floorAt(q.p.x,q.p.z);
    if(q.p.y<=fy){DROPS.splice(i,1);if(W3.wl>fy&&inDET(q.p.x,q.p.z))continue;const hv=V3(q.v.x,0,q.v.z);const sp=hv.length();
      stain('spot',q.p.x,q.p.z,(q.big?.32:.2)*(1+sp*.12),(q.big?.38:.24)*(1+sp*.2),sp>.1?hv.normalize():V3(0,0,1));}}
  for(let i=STAINS.length-1;i>=0;i--){const e=STAINS[i];e.t+=dt;const m=e.d.material;
    if(e.spread&&m.userData.spread)m.userData.spread.value=lerp(1,e.tg,1-Math.exp(-e.t/e.rate));
    const f=e.t>e.life-8?clamp((e.life-e.t)/8,0,1):1;m.opacity=f;
    if(e.t>=e.life){if(e.d.parent)e.d.parent.remove(e.d);e.d.geometry.dispose();m.dispose();STAINS.splice(i,1);}}}

/* ======================= ragdolls ======================= */
/* 21 points (joints, the crown, hands, toes) held together by distance constraints - rigid along the bones, a little
   give through the torso, limits that stop knees and elbows folding through the body - with gravity, ground friction
   and the cover walls to fall against. Every frame the skeleton is re-aimed along the points. */
const RAGS=[];
const RCON=[[0,1],[1,2],[2,3],[3,4],[1,5],[1,9],[2,5],[2,9],[5,9],[5,6],[6,7],[7,8],[9,10],[10,11],[11,12],[0,13],[0,17],[13,17],[13,14],[14,15],[15,16],[17,18],[18,19],[19,20],
  [0,5,.9,1.03],[0,9,.9,1.03],[1,13,.95,1.03],[1,17,.95,1.03],[5,13,.88,1.03],[9,17,.88,1.03],[5,17,.9,1.04],[9,13,.9,1.04],[0,2,.86,1.02],
  [1,3,.88,1.05],[1,4,.82,1.05],[5,3,.8,1.12],[9,3,.8,1.12],[5,7,.32,1],[9,11,.32,1],[13,15,.45,1],[17,19,.45,1],[14,16,.9,1.12],[18,20,.9,1.12],[6,8,.72,1],[10,12,.72,1],
  [14,18,1,9],[15,19,.6,9],[6,1,.6,9],[10,1,.6,9]];
const RRAD=[.11,.13,.06,.1,.09,.07,.05,.04,.03,.07,.05,.04,.03,.08,.06,.05,.04,.08,.06,.05,.04];
/* particle masses: the trunk is heavy, the limbs light, so a flailing arm cannot drag the body about */
const RMASS=[4,4,2,2,1,2,1,.7,.4,2,1,.7,.4,3,1.6,1,.5,3,1.6,1,.5];
/* joint cones: [parent point, joint, child point, max angle] - and the hips and shoulders against axes in the trunk's
   own frame (thigh forward up to ~110 deg, back ~35; arm almost anywhere but not behind the back) */
const RCONE=[[1,2,3,.65],[2,3,4,.5],[0,1,2,.55],[5,6,7,2.5],[9,10,11,2.5],[13,14,15,2.35],[17,18,19,2.35]];
class Ragdoll{constructor(h,hitP,dir,o={}){this.h=h;h.root.traverse(q=>{if(q.isSkinnedMesh)q.frustumCulled=false;});this.t=0;this.acc=0;this.still=0;this.done=false;const B=h.P.bones;h.root.updateMatrixWorld(true);
    const w=n=>B[n].getWorldPosition(new T.Vector3());const fw=V3(0,0,1).applyQuaternion(h.root.getWorldQuaternion(new T.Quaternion())).setY(0).normalize();
    const P=[w('hips'),w('spine'),w('neck'),w('head'),null,w('shL'),w('elL'),w('wrL'),null,w('shR'),w('elR'),w('wrR'),null,w('hpL'),w('knL'),w('anL'),null,w('hpR'),w('knR'),w('anR'),null];
    P[4]=P[3].clone().add(P[3].clone().sub(P[2]).normalize().multiplyScalar(.17));P[8]=P[7].clone().add(P[7].clone().sub(P[6]).normalize().multiplyScalar(.09));P[12]=P[11].clone().add(P[11].clone().sub(P[10]).normalize().multiplyScalar(.09));
    P[16]=P[15].clone().addScaledVector(fw,.15).add(V3(0,-.07,0));P[20]=P[19].clone().addScaledVector(fw,.15).add(V3(0,-.07,0));
    this.p=P;this.q=P.map(v=>v.clone());this.im=RMASS.map(m=>1/m);
    this.c=RCON.map(c=>{const L=P[c[0]].distanceTo(P[c[1]]);return[c[0],c[1],L*(c[2]===undefined?1:c[2]),L*(c[3]===undefined?1:Math.min(c[3],8))];});
    /* initial motion: the shot pushes the part it hit, the knees give, the body drops and pitches */
    const dt0=1/60,v=o.vel||V3();let near=0,nd=1e9;P.forEach((p,i)=>{const d=p.distanceTo(hitP);if(d<nd){nd=d;near=i;}});const dn=dir.clone().setY(0).normalize();
    P.forEach((p,i)=>{const kick=i===near?2.2:(i<=4||i===5||i===9)?.9:.35;const vv=v.clone().addScaledVector(dn,kick*(o.k||1));if(i===14||i===18)vv.addScaledVector(fw,.7).y-=.3;if(i<=4)vv.y-=.25;this.q[i].copy(p).addScaledVector(vv,-dt0);});
    /* the bones: trunk from two axes, limbs and head carried along their segment by the smallest turn each frame */
    const ax=[['hips',1,0,17,13,1],['spine',2,1,9,5,1],['neck',3,2],['head',4,3],['shL',6,5],['elL',7,6],['wrL',8,7],['shR',10,9],['elR',11,10],['wrR',12,11],
      ['hpL',14,13],['knL',15,14],['anL',16,15],['hpR',18,17],['knR',19,18],['anR',20,19]];
    this.ax=ax.map(([n,a1,a0,b1,b0,full])=>({b:B[n],a1,a0,b1,b0,full,Q:B[n].getWorldQuaternion(new T.Quaternion()),Q0:B[n].getWorldQuaternion(new T.Quaternion()),A0:P[a1].clone().sub(P[a0]).normalize(),
      Ap:P[a1].clone().sub(P[a0]).normalize(),B0:full?P[b1].clone().sub(P[b0]).normalize():null}));
    this.hipOff=w('hips').sub(P[0]);
    /* the hands let go and curl */
    curlHand(h.P.armL.hand,-.7,-.9,-.6,-.3);curlHand(h.P.armR.hand,-.6,-.8,-.6,-.25);RAGS.push(this);}
  cone(i,j,k,mx,axis){const P=this.p;const J=P[j];const C=V3().subVectors(P[k],J);const L=C.length();if(L<1e-5)return;C.multiplyScalar(1/L);
    const A=axis||V3().subVectors(J,P[i]).normalize();const c=C.dot(A);if(c>=Math.cos(mx))return;let perp=C.clone().addScaledVector(A,-c);const pl=perp.length();
    if(pl<1e-5)perp=V3(A.y,A.z,A.x).cross(A).normalize();else perp.multiplyScalar(1/pl);const nd=A.clone().multiplyScalar(Math.cos(mx)).addScaledVector(perp,Math.sin(mx));
    const tgt=J.clone().addScaledVector(nd,L);P[k].lerp(tgt,.7);}
  step(dt){const P=this.p,Q=this.q,im=this.im,g=-9.8*dt*dt;let mv=0;
    const dmp=this.t<2?.985:this.t<5?.96:.92;for(let i=0;i<P.length;i++){const p=P[i],q=Q[i];const vx=(p.x-q.x)*dmp,vy=(p.y-q.y)*(dmp+.005),vz=(p.z-q.z)*dmp;q.copy(p);p.x+=vx;p.y+=vy+g;p.z+=vz;}
    /* (held: one point of him goes where the hand that holds him goes) */const pin=this.pin;
    for(let it=0;it<12;it++){if(pin){P[pin.i].lerp(pin.p,.6);}for(const [i,j,mn,mx] of this.c){const a=P[i],b=P[j];const dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z;const d=Math.sqrt(dx*dx+dy*dy+dz*dz)||1e-6;
        const t=d<mn?mn:d>mx?mx:d;if(t===d)continue;const wa=im[i],wb=im[j],k=(d-t)/d/(wa+wb);a.x+=dx*k*wa;a.y+=dy*k*wa;a.z+=dz*k*wa;b.x-=dx*k*wb;b.y-=dy*k*wb;b.z-=dz*k*wb;}
      /* trunk frame */
      const lat=V3().subVectors(P[17],P[13]).normalize(),up=V3().subVectors(P[1],P[0]).normalize(),F=V3().crossVectors(lat,up).normalize();const cl=V3().subVectors(P[9],P[5]).normalize(),cu=V3().subVectors(P[2],P[1]).normalize(),CF=V3().crossVectors(cl,cu).normalize();
      for(const [a,b,c,m] of RCONE)this.cone(a,b,c,m);
      /* hips: a cone about a forward-tilted down axis; shoulders: about down-and-out */
      const hipAx=up.clone().multiplyScalar(-.78).addScaledVector(F,.62).normalize();this.cone(0,13,14,1.25,hipAx);this.cone(0,17,18,1.25,hipAx);
      this.cone(1,5,6,1.95,cu.clone().multiplyScalar(-1).addScaledVector(cl,-.55).addScaledVector(CF,.25).normalize());this.cone(1,9,10,1.95,cu.clone().multiplyScalar(-1).addScaledVector(cl,.55).addScaledVector(CF,.25).normalize());
      /* knees bend forward only, elbows never bend backwards past straight */
      for(const [hp,kn,an] of [[13,14,15],[17,18,19]]){const n=V3().subVectors(P[an],P[hp]);const L=n.length();if(L<1e-4)continue;n.multiplyScalar(1/L);
        const o=V3().subVectors(P[kn],P[hp]);const off=o.clone().addScaledVector(n,-o.dot(n));const f=off.dot(F);if(f<.03)P[kn].addScaledVector(F,(.03-f)*.6);}
      for(let i=0;i<P.length;i++){const p=P[i],r=RRAD[i];const fy=floorAt(p.x,p.z)+r;if(p.y<fy){p.y=fy;const q=Q[i];q.x=lerp(q.x,p.x,.65);q.z=lerp(q.z,p.z,.65);if(q.y<p.y-.0001)q.y=lerp(q.y,p.y,.5);}
        for(const c of WEST.cover){if(p.y<c.y0||p.y>c.y1+r)continue;const ax=p.x-c.x,az=p.z-c.z;const lx=ax*c.c-az*c.s,lz=ax*c.s+az*c.c;const ex=c.hx+r,ez=c.hz+r;
          if(Math.abs(lx)<ex&&Math.abs(lz)<ez){const px=ex-Math.abs(lx),pz=ez-Math.abs(lz);let nx=lx,nz=lz;if(px<pz)nx=Math.sign(lx)*ex;else nz=Math.sign(lz)*ez;
            p.x=c.x+nx*c.c+nz*c.s;p.z=c.z-nx*c.s+nz*c.c;}}}}
    if(pin){P[pin.i].copy(pin.p);Q[pin.i].lerp(pin.p,.5);}
    for(let i=0;i<P.length;i++)mv=Math.max(mv,P[i].distanceToSquared(Q[i]));return mv;}
  update(dt){if(this.done)return;this.acc+=Math.min(dt,.1);if(!this.pp)this.pp=this.p.map(v=>v.clone());while(this.acc>=1/60){this.acc-=1/60;this.t+=1/60;for(let i=0;i<this.p.length;i++)this.pp[i].copy(this.p[i]);const mv=this.step(1/60);this.still=mv<2.2e-6?this.still+1:0;}
    /* drawn between the last two physics steps, so the fall is smooth at any frame rate */
    {const a=this.acc*60;if(!this.pi)this.pi=this.p.map(v=>v.clone());for(let i=0;i<this.p.length;i++)this.pi[i].copy(this.pp[i]).lerp(this.p[i],a);}
    /* he only comes to rest lying on something: every point near the floor or held up by the others, never hanging */
    this.pose(this.pi);if(!this.pin&&this.t>1.2&&(this.still>40||this.t>12)){const P=this.p;let air=false;for(const i of [0,1,2,3,13,17]){if(P[i].y-floorAt(P[i].x,P[i].z)-RRAD[i]>.12){air=true;break;}}
      if(!air||this.t>20){this.done=true;if(this.onRest)this.onRest(this);}}}
  pose(Pv){const P=Pv||this.p,h=this.h;const root=h.root;h.P.bones.hips.position.copy(root.worldToLocal(P[0].clone().add(this.hipOff)));h.P.bones.hips.updateMatrixWorld(true);
    const q=new T.Quaternion(),dq=new T.Quaternion();
    for(const a of this.ax){const A=V3().subVectors(P[a.a1],P[a.a0]);if(A.lengthSq()<1e-8)continue;A.normalize();
      if(a.full){const Bv=V3().subVectors(P[a.b1],P[a.b0]).normalize();if(Math.abs(A.dot(Bv))>.98)continue;basisQ(a.A0,a.B0,A,Bv,q).multiply(a.Q0);a.Q.copy(q);}
      else{dq.setFromUnitVectors(a.Ap,A);a.Q.premultiply(dq);a.Ap.copy(A);}
      setWorldQ(a.b,a.Q);}}}
function ragTick(dt){for(const r of RAGS)if(!r.done&&r.h.root.parent)r.update(dt);}

/* a dropped rifle: falls, tips onto its side, comes to rest */
const DROPPED=[];
function dropGun(gun,v){const p=gun.getWorldPosition(new T.Vector3()),q=gun.getWorldQuaternion(new T.Quaternion());scene.attach(gun);gun.position.copy(p);gun.quaternion.copy(q);DROPPED.push({g:gun,v:v.clone(),w:V3(wr(-3,3),wr(-2,2),wr(-3,3)),t:0});}
function droppedTick(dt){for(let i=DROPPED.length-1;i>=0;i--){const d=DROPPED[i];d.t+=dt;d.v.y-=9.8*dt;d.g.position.addScaledVector(d.v,dt);d.g.rotation.x+=d.w.x*dt;d.g.rotation.y+=d.w.y*dt;d.g.rotation.z+=d.w.z*dt;
    const fy=floorAt(d.g.position.x,d.g.position.z)+.035;if(d.g.position.y<fy){d.g.position.y=fy;d.v.multiplyScalar(.3);d.v.y=Math.abs(d.v.y)*.2;d.w.multiplyScalar(.4);
      if(d.t>.4){const e=new T.Euler().setFromQuaternion(d.g.quaternion,'YXZ');d.g.rotation.set(0,e.y,Math.PI/2*(e.z>=0?1:-1),'YXZ');d.g.position.y=fy;DROPPED.splice(i,1);}}}}

/* ======================= rifle fire from NPCs ======================= */
const NFL=new T.Mesh(new T.PlaneGeometry(1,1),new T.MeshBasicMaterial({map:PTEX.star,transparent:true,blending:T.AdditiveBlending,depthWrite:false,color:C(0xffc070),fog:false}));NFL.visible=false;NFL.userData.keep=true;scene.add(NFL);
function npcMuzzle(gun){const p=gun.localToWorld(gun.userData.muzzle.clone());return p;}
/* someone else's muzzle flash: a star of burning gas at the muzzle you can pick out at a hundred metres, the glow round it,
   and for an instant the ground and walls around him lit orange (one light, moved to the latest shot) */
const NFX={L:new T.PointLight(0xffa24a,0,11,2),t:9,sp:[],k:0};NFX.L.userData.keep=true;scene.add(NFX.L);
for(let i=0;i<6;i++){const m=new T.Sprite(new T.SpriteMaterial({map:PTEX.star,color:C(0xffd08a),transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,toneMapped:false}));m.visible=false;m.userData.keep=true;m.renderOrder=6;scene.add(m);NFX.sp.push({m,t:9});}
function nfxTick(dt){NFX.t+=dt;NFX.L.intensity=NFX.t<.07?14*(1-NFX.t/.07):0;for(const q of NFX.sp){q.t+=dt;if(q.m.visible&&q.t>.06)q.m.visible=false;}}
function npcFlash(p,big=true){const q=NFX.sp[NFX.k++%NFX.sp.length];q.t=0;q.m.position.copy(p);const s=(big?.95:.7)*(.8+WR()*.45);q.m.scale.set(s,s,1);q.m.material.rotation=WR()*6.28;q.m.visible=true;
  NFX.t=0;NFX.L.position.copy(p);
  FX.glow.spawn(p,V3(),.08,big?.9:.6,big?1.3:.9,[1,.72,.36,1],[1,.45,.15,0]);for(let i=0;i<2;i++)FX.smoke.spawn(p,V3(wr(-.2,.2),wr(.1,.4),wr(-.2,.2)),wr(.8,1.4),.05,.4,[.72,.7,.66,.3],[.8,.8,.78,0],{drag:1.6,up:.2});}
/* the player is hit or missed: a miss cracks past and kicks up dirt next to you */
function shotAtPlayer(from,hit,dmg,zero=1){const head=camera.position;const d=from.distanceTo(head);
  if(hit){const red=S.equip.vest?.6:1;S.hp-=dmg*red;S.sinceDmg=0;player.pitch+=wr(.01,.03);player.yaw+=wr(-.02,.02);sfx.hitFlesh(.9);S.killer='separatists';return;}
  if(WR()<.7)sfx.whiz();const dir=head.clone().sub(from).normalize();const side=V3(-dir.z,0,dir.x);
  /* misses: wide at first, closer as he finds the range */const sp=lerp(2.6,1,zero);const p=head.clone().addScaledVector(dir,wr(.5,4)*sp).addScaledVector(side,wr(-1.4,1.4)*sp);p.y=floorAt(p.x,p.z);
  const inW=inDET(p.x,p.z)&&W3.wl>p.y;if(inW){p.y=W3.wl;WATER.splash(p,.45);}else fxImpact(p.clone().add(V3(0,.02,0)),V3(0,1,0),'dirt');}

/* ======================= poses for a fight ======================= */
/* shouldered: butt in the shoulder pocket, cheek down on the stock, the bore just under the right eye */
AP.aim={spine:[.06],neck:[.16,0,-.06],head:[.18,-.05,-.12],hpL:[-0.36,0,0.24],knL:[0.4,0,-0.19],anL:[0,-.25,0],hpR:[-0.16,0,-0.12],knR:[0.22,0,0.19],anR:[0,.3,0],
  hold:{p:[-.075,.39,.36],f:[.1,-.02,1],u:[0,1,0]}};
AP.kneelAim={hips:[.06],spine:[.2],neck:[.1,0,-.06],head:[.14,-.05,-.12],hpL:[.08,.08,-.07],knL:[1.48],anL:[-.38],hpR:[-1.45,-.15,.12],knR:[1.5],footFree:{L:true},
  hold:{p:[-.075,.39,.36],f:[.1,-.02,1],u:[0,1,0]}};
/* ducked behind cover, rifle upright between the knees */
AP.cover={hips:[.06],spine:[.38],neck:[-.1],head:[-.12],hpL:[.08,.08,-.07],knL:[1.48],anL:[-.38],hpR:[-1.45,-.15,.12],knR:[1.5],footFree:{L:true},
  hold:{p:[-.02,-.1,.3],f:[.15,.85,.5],u:[-.1,-.5,.85]}};
/* sitting by the fire / on a log, warming up */
AP.fireSquat={hips:[.2],spine:[.36,0,0],neck:[-.1],head:[-.16],hpL:[-2.05,.18,-.32],knL:[2.45],hpR:[-2.0,-.18,.32],knR:[2.45],
  shL:[-1.0,.35,-.05],elL:[-1.15],wrL:[0,.4,0],shR:[-1.0,-.35,.05],elR:[-1.15],wrR:[0,-.4,0],contactKnee:false,osc:{elL:[.1,0,0,1.3],elR:[-.1,0,0,1.3]}};

/* ======================= the separatists' kit ======================= */
let _SK=null;function sepMats(){return _SK||(_SK={canvas:std({map:PB.canvas.a,normalMap:PB.canvas.n,roughnessMap:PB.canvas.r,roughness:1,color:C(0xb4a878),envMapIntensity:.3}),
  web:std({color:C(0x5e5a3e),roughness:.9}),helm:std({map:PB.paint.a,normalMap:PB.paint.n,roughnessMap:PB.paint.r,roughness:1.25,color:C(0xe4ecc0),metalness:.12,envMapIntensity:.5}),
  liner:std({color:C(0x262218),roughness:.8}),brass:std({color:C(0x6a5a30),metalness:.8,roughness:.4})});}
/* the garments' bind-pose vertices, for fitting kit to this body */
function wearPts(h){if(h._wp)return h._wp;const L=[];h.root.traverse(o=>{if(!o.isSkinnedMesh)return;const p=o.geometry.attributes.position;for(let i=0;i<p.count;i++)L.push(p.getX(i),p.getY(i),p.getZ(i));});return h._wp=new Float32Array(L);}
/* sample the outermost garment's front (or back) surface at a height, across a band */
function frontZ(h,x,y,back){const P=wearPts(h);let best=back?1e9:-1e9;for(let i=0;i<P.length;i+=3){if(Math.abs(P[i]-x)<.035&&Math.abs(P[i+1]-y)<.035){const z=P[i+2];if(back?z<best:z>best)best=z;}}return best;}
/* the surface point seen from P looking back along -dir: the outermost cloth within a thin tube along dir */
function surfAt(h,P,dir){const V=wearPts(h);let best=-1e9;for(let i=0;i<V.length;i+=3){const vx=V[i]-P.x,vy=V[i+1]-P.y,vz=V[i+2]-P.z;const t=vx*dir.x+vy*dir.y+vz*dir.z;
    const px=vx-dir.x*t,py=vy-dir.y*t,pz=vz-dir.z*t;if(px*px+py*py+pz*pz<.0005&&t>best)best=t;}return best>-1e8?P.clone().addScaledVector(dir,best+.006):null;}
/* a flat webbing strap laid over the body: control points with the direction they face outward; densified, each sample
   pressed onto the cloth, then a ribbon two centimetres off it */
function strapGeo(h,ctrl,w=.032){const pts=ctrl.map(c=>c[0]),dirs=ctrl.map(c=>c[1].clone().normalize());const cv=new T.CatmullRomCurve3(pts);const n=40,S=[],N=[];
  for(let i=0;i<=n;i++){const u=i/n,f=u*(ctrl.length-1),k=Math.min(ctrl.length-2,Math.floor(f)),a=f-k;const d=dirs[k].clone().lerp(dirs[k+1],a).normalize();const q=cv.getPointAt(u);
    const base=q.clone().addScaledVector(d,-.12);const sp=surfAt(h,base,d)||q;S.push(sp);N.push(d);}
  for(let it=0;it<2;it++)for(let i=1;i<n;i++)S[i]=S[i].clone().lerp(S[i-1].clone().add(S[i+1]).multiplyScalar(.5),.35);
  const pos=[],idx=[];for(let i=0;i<=n;i++){const tg=S[Math.min(n,i+1)].clone().sub(S[Math.max(0,i-1)]).normalize();const wv=tg.clone().cross(N[i]).normalize();
    const a=S[i].clone().addScaledVector(wv,w/2),b=S[i].clone().addScaledVector(wv,-w/2);pos.push(a.x,a.y,a.z,b.x,b.y,b.z);if(i<n)idx.push(i*2,i*2+2,i*2+1,i*2+1,i*2+2,i*2+3);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
/* the Afghan-war chest rig (lifchik): four rifle-magazine pockets and two grenade pockets on a canvas panel, straps
   over the shoulders crossing on the back; and the GP-5 bag on the left hip on its strap */
function sepKit(h){const SK=sepMats();const B=h.P.bones,c=CD.chars[h.name].fit;h.root.updateMatrixWorld(true);
  const sp=B.spine,inv=new T.Matrix4().copy(sp.matrixWorld).invert();const bk=bucket();
  /* it rides low, over the belly: magazine pockets from just above the belt, the grenade pockets above them */
  const yb=c.waist-.03,yt=c.chestY-.11;const zf=(x,y)=>Math.max(frontZ(h,x,y),c.chestF*.6);
  for(let i=0;i<4;i++){const x=-.117+i*.078,y=yb+.085,z=zf(x,y)+.027;bk.add(rbox(.07,.165,.05,.01),SK.canvas,TRS(x,y,z,-.04,0,0));bk.add(rbox(.074,.045,.054,.008),SK.canvas,TRS(x,y+.074,z+.003,-.04,0,0));
    bk.add(new T.CylinderGeometry(.005,.005,.01,8).rotateX(Math.PI/2),SK.liner,TRS(x,y+.062,z+.03));}
  [-.085,.085].forEach(x=>{const y=yt-.005,z=zf(x,y)+.024;bk.add(rbox(.062,.072,.045,.008),SK.canvas,TRS(x,y,z,-.08,0,0));bk.add(rbox(.065,.025,.048,.006),SK.canvas,TRS(x,y+.036,z+.002,-.08,0,0));});
  {const y=(yb+yt)/2,z=zf(0,y)+.005;bk.add(rbox(.33,yt-yb+.05,.01,.004),SK.canvas,TRS(0,y,z));}
  /* straps: up over each shoulder, crossing between the shoulder blades to the opposite side of the belt */
  const F=V3(0,0,1),U=V3(0,1,0),Bk=V3(0,0,-1),FU=V3(0,.7,.7),BU=V3(0,.7,-.7);const cy=c.chestY;
  [1,-1].forEach(s=>{bk.add(strapGeo(h,[[V3(s*.14,yt+.02,.1),F],[V3(s*.145,cy+.04,.1),F],[V3(s*.15,cy+.1,.08),FU],[V3(s*.13,cy+.17,.0),U],[V3(s*.12,cy+.08,-.07),BU],[V3(s*.06,cy-.06,-.09),Bk],[V3(-s*.05,cy-.2,-.1),Bk],[V3(-s*.15,c.waist+.02,-.1),Bk]]),SK.web);});
  const ms=bk.flush(null,false);ms.forEach(m=>{m.geometry.applyMatrix4(inv);sp.add(m);});
  sepBag(h,true);}
/* the GP-5 bag on the left hip and its strap over the right shoulder (also worn alone, over the telogreika) */
function sepBag(h){const SK=sepMats();const B=h.P.bones,c=CD.chars[h.name].fit;h.root.updateMatrixWorld(true);const hp=B.hips,invh=new T.Matrix4().copy(hp.matrixWorld).invert();const b2=bucket();
  const x=.2,y=c.waist-.15,z=Math.max(-.02,frontZ(h,.2,c.waist-.1)-.12);const sx=Math.max(x,frontZ(h,0,0)>-1e8?.2:.2);
  b2.add(rbox(.07,.24,.21,.03),SK.canvas,TRS(x+.05,y,z,0,0,.05));b2.add(rbox(.075,.07,.215,.02),SK.canvas,TRS(x+.052,y+.1,z,0,0,.05));b2.add(rbox(.01,.04,.03,.004),SK.liner,TRS(x+.09,y+.07,z));
  b2.flush(null,false).forEach(m=>{m.geometry.applyMatrix4(invh);hp.add(m);});
  const sp=B.spine,inv=new T.Matrix4().copy(sp.matrixWorld).invert();const cy=c.chestY;const F=V3(0,0,1),U=V3(0,1,0),Bk=V3(0,0,-1),FU=V3(0,.7,.7),BU=V3(0,.7,-.7),L=V3(1,0,0);
  const b3=bucket();b3.add(strapGeo(h,[[V3(.25,c.waist-.02,.02),L],[V3(.17,cy-.12,.1),F],[V3(.0,cy-.0,.12),F],[V3(-.12,cy+.12,.07),FU],[V3(-.13,cy+.18,.0),U],[V3(-.1,cy+.06,-.08),BU],[V3(.06,cy-.12,-.1),Bk],[V3(.22,c.waist,-.04),V3(.7,0,-.7)]],.03),SK.web);
  b3.flush(null,false).forEach(m=>{m.geometry.applyMatrix4(inv);sp.add(m);});}
/* the SSh-68: a deep steel bowl with a slight flare at the rim, a rolled edge, liner rivets, a chin strap; painted
   olive, chipped and dull */
function ssh68(h){const SK=sepMats();const B=h.P.bones,c=CD.chars[h.name].fit;h.root.updateMatrixWorld(true);const hd=B.head,inv=new T.Matrix4().copy(hd.matrixWorld).invert();
  let top=c.headTop,hw=c.headHalfW,zc=c.skullZ,dz=hw*1.18;const hood=CD.chars[h.name].hood;
  if(hood&&h.hooded){const P=deq(hood.v);let x0=1e9,x1=-1e9,y1=-1e9,z0=1e9,z1=-1e9;for(let i=0;i<P.length;i+=3){if(P[i+1]<top-.13)continue;x0=Math.min(x0,P[i]);x1=Math.max(x1,P[i]);y1=Math.max(y1,P[i+1]);z0=Math.min(z0,P[i+2]);z1=Math.max(z1,P[i+2]);}
    top=y1;hw=(x1-x0)/2;zc=(z0+z1)/2;dz=(z1-z0)/2;}
  const R=hw*1.16+.014,Rz=Math.max(dz*1.1+.014,R*1.07),Hd=.15;const pts=[];for(let i=0;i<=16;i++){const t=i/16*1.86;pts.push([Math.sin(Math.min(t,1.5708))*R*(t>1.5708?1+(t-1.5708)*.18:1),Math.cos(Math.min(t,1.5708))*Hd-(t>1.5708?(t-1.5708)*.18:0)]);}
  /* the brow is cut high, the sides and the back come down over the ears and the nape */
  const shape=q=>{q.scale(1,1,Rz/R);const pp=q.attributes.position;for(let i=0;i<pp.count;i++){const z=pp.getZ(i),y=pp.getY(i);const f=Math.pow(Math.max(0,z/Rz),2);pp.setY(i,y+.085*f*(1-clamp(y/Hd,0,1)));}q.computeVertexNormals();return q;};
  const g=shape(lathe(pts,28));const yc=top+.03-Hd,bk=bucket();const M4=TRS(0,yc,zc-.008,-.14,0,0);bk.add(g,SK.helm,M4);
  const inner=flipIn(shape(lathe(pts.map(([a,b])=>[a*.96,b-.006]),28)));bk.add(inner,SK.liner,M4);
  const rimR=pts[pts.length-1];const rim=new T.TorusGeometry(rimR[0]+.002,.0045,6,40);rim.rotateX(Math.PI/2);rim.translate(0,rimR[1],0);bk.add(shape(rim),SK.helm,M4);
  [[1,.3],[-1,.3],[1,-.6],[-1,-.6]].forEach(([s,a])=>{const x=Math.cos(a)*R*s*.985,z=Math.sin(a)*Rz*.985;bk.add(new T.SphereGeometry(.007,8,6,0,6.28,0,1.6).rotateZ(-s*Math.PI/2),SK.brass,new T.Matrix4().multiplyMatrices(M4,TRS(x,-.07,z)));});
  /* chin strap: from the liner at each side, down under the jaw */
  {const sy=yc-.02,jaw=c.eye[1]-.13;const pts2=[V3(R*.96,sy,zc),V3(R*.82,(sy+jaw)/2,zc+.05),V3(R*.3,jaw-.015,c.eye[2]-.01),V3(-R*.3,jaw-.015,c.eye[2]-.01),V3(-R*.82,(sy+jaw)/2,zc+.05),V3(-R*.96,sy,zc)];
   if(h.hooded)pts2.forEach(p=>{p.z+=.012;p.y-=.01;});const tb=new T.TubeGeometry(new T.CatmullRomCurve3(pts2),20,.006,4);tb.scale(1,.6,1);bk.add(tb,SK.web);}
  bk.flush(null,false).forEach(m=>{m.geometry.applyMatrix4(inv);hd.add(m);});}
window.__nfx={npcFlash,NFX};
