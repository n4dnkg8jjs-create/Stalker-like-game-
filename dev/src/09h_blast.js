/* ---------- explosions: a fragmentation grenade going off. The sound: the crack and the shock, the thump through the
   ground, the roll of it off the treeline, and a moment later the dirt and gravel coming down. The fragments: a few
   hundred thrown out in every direction - what is in the open within a few metres is hit by several, what is behind
   something solid is not; further out they thin out and slow. The blast: at arm's length it takes a limb off, and a man
   that close is dead. ---------- */
const BLAST={L:null,lt:9,sev:[],bleed:[],buf:null};
BLAST.L=new T.PointLight(C(0xffb070),0,30,2);BLAST.L.userData.keep=true;scene.add(BLAST.L);
/* the sound, synthesised once from first principles rather than a film explosion: a near buffer (stereo, decorrelated
   tail) and the debris patter */
function blastBufs(){if(BLAST.buf||!AC)return BLAST.buf;const sr=AC.sampleRate,n=Math.floor(sr*3.6),near=AC.createBuffer(2,n,sr);
  const op=f=>1-Math.exp(-2*Math.PI*f/sr);
  for(let ch=0;ch<2;ch++){const d=near.getChannelData(ch),R=rng(4242+ch*77),nz=()=>R()*2-1;
    let l1=0,l2=0,br=0,ph=0;
    for(let i=0;i<n;i++){const t=i/sr;let x=0;
      /* the crack: an N-wave a few milliseconds long */
      if(t<.006){const u=t/.006;x+=u<.22?u/.22:u<.75?1-(u-.22)/.53*1.75:-.75*(1-(u-.75)/.25);}
      /* the shock: broadband, closing down fast from bright to dull */
      const w=nz();l1+=(w-l1)*op(lerp(1100,9000,Math.exp(-t/.02)));x+=l1*Math.exp(-t/.022)*1.15;
      /* the thump: a falling low tone you feel more than hear */
      const f=34+80*Math.exp(-t/.045);ph+=2*Math.PI*f/sr;x+=Math.sin(ph)*Math.min(1,t/.003)*Math.exp(-t/.17)*1.05;
      /* the tail: low rumble rolling away */
      br+=(nz()-br)*op(140);l2+=(br-l2)*op(420);x+=l2*3.2*(1-Math.exp(-t/.035))*Math.exp(-t/.85)*.55;
      d[i]=x;}
    /* reflections off the trees and the ground: duller and later each time, slightly different in each ear */
    const src=d.slice(0,Math.floor(sr*.25));[[.085,.42,2600],[.16,.32,1900],[.27,.25,1400],[.43,.19,1000],[.66,.14,800],[.98,.1,600],[1.4,.06,450]].forEach(([dl,g,fc],k)=>{
      const o=Math.floor((dl+(ch?.007*(k%3):-.004*(k%2)))*sr);let y=0;const a=op(fc);for(let i=0;i<src.length&&o+i<n;i++){y+=(src[i]-y)*a;d[o+i]+=y*g;}});
    for(let i=0;i<n;i++){d[i]=Math.tanh(d[i]*1.25)/Math.tanh(1.25);}
    const fo=Math.floor(sr*.6);for(let i=0;i<fo;i++)d[n-1-i]*=i/fo;}
  /* the debris: clods and gravel landing round about for a second and a half */
  const m=Math.floor(sr*2.2),deb=AC.createBuffer(1,m,sr),dd=deb.getChannelData(0),R=rng(5151);
  for(let k=0;k<190;k++){const t=.12+Math.pow(R(),1.7)*1.8,big=R()<.15,len=big?.03+R()*.03:.003+R()*.008,f=big?250+R()*350:1200+R()*3200,amp=(big?.9:.5)*(.4+R()*.6)*Math.exp(-(t-.12)*1.3);
    const s0=Math.floor(t*sr),L=Math.floor(len*sr);let y=0,y2=0;const a=op(f),a2=op(f*.5);for(let i=0;i<L&&s0+i<m;i++){const e=Math.exp(-i/(L*.3));const w=(R()*2-1)*e;y+=(w-y)*a;y2+=(y-y2)*a2;dd[s0+i]+=(y-y2)*amp*3;}}
  let pk=0;for(let i=0;i<m;i++)pk=Math.max(pk,Math.abs(dd[i]));for(let i=0;i<m;i++)dd[i]/=pk||1;
  return BLAST.buf={near,deb};}
function blastSound(p){if(!AC||!AUD.pan||!blastBufs())return;const d=p.distanceTo(camera.position),t0=AC.currentTime+Math.min(1.5,d/343);
  const pn=AUD.pan(p,9,.85,d<80,.35+.45*sstep(15,200,d));const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lerp(18000,700,Math.pow(sstep(6,450,d),.55));lp.Q.value=.4;lp.connect(pn);
  const s=AC.createBufferSource();s.buffer=BLAST.buf.near;const g=AC.createGain();g.gain.value=1.55;s.connect(g).connect(lp);s.start(t0);
  if(d<55){const pd=AUD.pan(p.clone().add(V3(0,.5,0)),5,1,true,.2);const s2=AC.createBufferSource();s2.buffer=BLAST.buf.deb;const g2=AC.createGain();g2.gain.value=.55*(1-d/55);s2.playbackRate.value=.9+Math.random()*.2;s2.connect(g2).connect(pd);s2.start(t0+.05);}
  AUD.lastGun=S.t;}
/* the scorch it leaves: soot and blown-out earth in a ragged star */
let _scT=null;const SCORCH=[];
function scorchAt(p){if(!_scT)_scT=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(313);for(let i=0;i<2600;i++){const a=q()*6.283,ray=.75+.25*Math.sin(a*7+1)*Math.sin(a*3),r_=Math.pow(q(),.8)*w*.48*ray,x=w/2+Math.cos(a)*r_,y=h/2+Math.sin(a)*r_,e=r_/(w*.48);
      c.fillStyle=q()<.8?`rgba(${16+q()*20|0},${14+q()*16|0},${12+q()*12|0},${(1-e*e)*(.35+q()*.5)})`:`rgba(${90+q()*30|0},${78+q()*20|0},${60+q()*16|0},${(1-e)*.6})`;c.beginPath();c.arc(x,y,1+q()*4*(1-e*.7),0,7);c.fill();}},{clamp:true});
  const R0=1.15,g=new T.PlaneGeometry(R0*2,R0*2,10,10);g.rotateX(-Math.PI/2);g.rotateY(WR()*6.28);const P=g.attributes.position;for(let i=0;i<P.count;i++){const X=p.x+P.getX(i),Z=p.z+P.getZ(i);P.setXYZ(i,X,floorAt(X,Z)+.022,Z);}g.computeVertexNormals();
  const m=new T.Mesh(g,std({map:_scT,transparent:true,depthWrite:false,roughness:1,envMapIntensity:.05,polygonOffset:true,polygonOffsetFactor:-4}));m.renderOrder=2;m.receiveShadow=true;scene.add(m);SCORCH.push(m);
  if(SCORCH.length>8){const o=SCORCH.shift();scene.remove(o);o.geometry.dispose();o.material.dispose();}}
const poisson=l=>{if(l<=0)return 0;let k=0,p=1;const L=Math.exp(-Math.min(l,30));do{k++;p*=WR();}while(p>L);return k-1;};
/* where a man stands relative to the blast: lethal within this, limbs within the inner part of it */
const BLAST_KILL=1.7,BLAST_SEVER=1.3;
function explode(p,o={}){const wet=inDET(p.x,p.z)&&W3.wl>p.y;
  FX.glow.spawn(p,V3(),.12,1.8,3.5,[1,.85,.6,1],[1,.45,.12,0]);for(let i=0;i<70;i++)FX.spark.spawn(p,V3(wr(-1,1),wr(.05,1.2),wr(-1,1)).normalize().multiplyScalar(wr(8,24)),wr(.15,.5),wr(.015,.03),.006,[1,.8,.45,1],[1,.35,.08,0],{g:9.8,drag:.6});
  for(let i=0;i<18;i++)FX.smoke.spawn(p.clone().add(V3(wr(-.4,.4),wr(0,.4),wr(-.4,.4))),V3(wr(-1,1),wr(.5,1.6),wr(-1,1)),wr(2.5,5),wr(.8,1.3),wr(3,5),[.14,.13,.12,.8],[.35,.34,.32,0],{drag:.8,up:.3,spin:wr(-.5,.5),fi:.02});
  for(let i=0;i<22;i++)FX.dust.spawn(p,V3(wr(-1,1),wr(.6,2.4),wr(-1,1)).multiplyScalar(wr(2,7)),wr(.8,1.8),.15,.6,[.3,.26,.2,.9],[.4,.36,.3,0],{g:7,drag:1.2});
  if(wet)WATER.splash(V3(p.x,W3.wl,p.z),2.2);
  BLAST.L.position.copy(p).add(V3(0,.6,0));BLAST.L.intensity=60;BLAST.lt=0;
  blastSound(p);if(!wet)scorchAt(p);
  /* the fragments that find the ground round about kick up dirt */
  for(let i=0;i<26;i++){const a=WR()*6.283,r=1.2+Math.pow(WR(),.6)*13;const q=V3(p.x+Math.cos(a)*r,0,p.z+Math.sin(a)*r);q.y=floorAt(q.x,q.z);if(coverHit(p.clone().add(V3(0,.25,0)),q.clone().add(V3(0,.1,0))))continue;if(inDET(q.x,q.z)&&q.y<W3.wl){q.y=W3.wl;WATER.splash(q,.25);}else fxImpact(q,V3(0,1,0),'dirt');}
  const frag=(d,A,cov)=>poisson(330*A/(4*Math.PI*Math.max(d,.5)**2)*(cov?.05:1));
  /* you */
  const d=p.distanceTo(camera.position);
  if(S.state==='play'&&d<30){const chest=camera.position.clone().add(V3(0,-.45,0)),dc=p.distanceTo(chest),cov=!!coverHit(p.clone().add(V3(0,.3,0)),chest);
    let dmg=0;if(dc<BLAST_KILL&&!cov){dmg=999;S.gib=true;}
    else{dmg+=dc<4.5?lerp(80,6,sstep(BLAST_KILL,4.5,dc))*(cov?.3:1):0;const n=frag(dc,player.crouch>.5?.3:.55,cov);for(let k=0;k<n;k++)dmg+=wr(9,26)*clamp(1.25-dc/28,.25,1)*(S.equip.vest&&WR()<.55?.3:1);
      if(n>0&&dc>4)sfx.whiz&&sfx.whiz();}
    if(dmg>1){S.hp-=dmg;S.sinceDmg=0;S.killer=dmg>=999?'grenade':(o.killer||'separatists');sfx.hitFlesh&&sfx.hitFlesh(1.2);}
    const k=clamp(1-d/14,0,1);if(typeof CH2!=='undefined'&&CH2.post){CH2.post.blur=Math.max(CH2.post.blur,.32*k);CH2.post.dbl=Math.max(CH2.post.dbl,.22*k);}
    if(typeof CH3!=='undefined')CH3.concK=Math.max(CH3.concK||0,k);player.pitch+=.07*k;player.yaw+=wr(-.09,.09)*k;}
  /* them */
  if(typeof CH3!=='undefined')CH3.seps.forEach(s=>{if(s.state==='dead')return;const ch=s.chestPos(),dc=p.distanceTo(ch),cov=!!coverHit(p.clone().add(V3(0,.3,0)),ch);if(dc>25)return;
    const dir=ch.clone().sub(p).normalize();
    if(dc<BLAST_KILL&&!cov){s.hp=0;s.die(ch,dir.clone().multiplyScalar(2.5),{blast:p});return;}
    let tot=dc<4.5?lerp(80,6,sstep(BLAST_KILL,4.5,dc))*(cov?.3:1):0;const n=frag(dc,.5,cov);const parts=[];
    for(let k=0;k<n;k++){const r=WR();const bone=r<.1?'head':r<.5?'spine':['shL','shR','elL','elR','hpL','hpR','knL','knR'][Math.floor(WR()*8)];parts.push(bone);tot+=bone==='head'?200:bone==='spine'?wr(20,40):wr(10,24);}
    if(tot>0)s.blastHit(p,tot,parts,dir);});
  if(typeof CRAWS!=='undefined')CRAWS.forEach(C_=>{if(C_.state==='dead'||C_.state==='off')return;const dc=Math.hypot(C_.p.x-p.x,C_.p.z-p.z);if(dc<3.5&&C_.hitM){const n=dc<1.6?4:2;for(let k=0;k<n;k++)C_.onShot(C_.hitM[1],V3(C_.p.x,C_.y,C_.p.z),V3(C_.p.x-p.x,0,C_.p.z-p.z).normalize());}});}
/* a limb taken off: the part of every skinned piece of him below the joint is baked into a loose mesh in the pose he is
   in, the joint's bone is shrunk away on the body, a torn stump closes the wound, and the limb is thrown */
const GORE=std({color:C(0x4a0c08),roughness:.35,metalness:0,envMapIntensity:.6});
const GOREIN=std({color:C(0x7a1a12),roughness:.4,envMapIntensity:.5});
const GORECAP=std({vertexColors:true,roughness:.32,metalness:0,envMapIntensity:.7});
function sever(h,bn,dir,p){const B=h.P.bones,cut=B[bn];if(!cut||cut.userData.severed)return null;cut.userData.severed=true;h.root.updateMatrixWorld(true);
  const sub=new Set();cut.traverse(o=>{if(o.isBone)sub.add(o);});const jw=cut.getWorldPosition(V3());
  const grp=new T.Group();grp.position.copy(jw);scene.add(grp);const v=V3();let tris=0;
  h.root.traverse(o=>{if(!o.isSkinnedMesh||!o.visible||!o.skeleton)return;const g=o.geometry,P=g.attributes.position,SI=g.attributes.skinIndex,SW=g.attributes.skinWeight;if(!SI)return;
    const bones=o.skeleton.bones,cnt=P.count,inS=new Uint8Array(cnt);
    for(let i=0;i<cnt;i++){let w=0;const ix=[SI.getX(i),SI.getY(i),SI.getZ(i),SI.getW(i)],ws=[SW.getX(i),SW.getY(i),SW.getZ(i),SW.getW(i)];for(let k=0;k<4;k++)if(sub.has(bones[ix[k]]))w+=ws[k];inS[i]=w>.5?1:0;}
    const idx=g.index?g.index.array:null,nt=idx?idx.length/3:cnt/3,map=new Int32Array(cnt).fill(-1),pos=[],out=[];
    /* every other vertex attribute the material may read (uv, colour, wear...) goes across as it is */
    const XA=Object.keys(g.attributes).filter(k=>!['position','normal','skinIndex','skinWeight'].includes(k)).map(k=>{const a=g.attributes[k],A=a.array;const dv=!a.normalized?1:A instanceof Uint8Array?255:A instanceof Uint16Array?65535:A instanceof Int8Array?127:A instanceof Int16Array?32767:1;return{k,a,dv,d:[]};});
    for(let t=0;t<nt;t++){const a=idx?idx[t*3]:t*3,b=idx?idx[t*3+1]:t*3+1,c=idx?idx[t*3+2]:t*3+2;if(!(inS[a]&&inS[b]&&inS[c]))continue;
      for(const q of [a,b,c]){if(map[q]<0){map[q]=pos.length/3;o.boneTransform(q,v);v.applyMatrix4(o.matrixWorld).sub(jw);pos.push(v.x,v.y,v.z);for(const x of XA){const it=x.a.itemSize;for(let c=0;c<it;c++)x.d.push(x.a.array[q*it+c]/x.dv);}}out.push(map[q]);}}
    if(!out.length)return;tris+=out.length/3;const ng=new T.BufferGeometry();ng.setAttribute('position',new T.Float32BufferAttribute(pos,3));for(const x of XA)ng.setAttribute(x.k,new T.Float32BufferAttribute(x.d,x.a.itemSize));ng.setIndex(out);ng.computeVertexNormals();
    const mats=Array.isArray(o.material)?o.material:[o.material];const m0=mats[0];const mc=m0.clone();mc.skinning=false;mc.onBeforeCompile=m0.onBeforeCompile;if(m0.customProgramCacheKey)mc.customProgramCacheKey=m0.customProgramCacheKey;
    const mm=new T.Mesh(ng,mc);mm.castShadow=true;mm.receiveShadow=true;grp.add(mm);});
  /* rigid kit on the limb goes with it */
  const rig=[];cut.traverse(o=>{if(o.isMesh&&!o.isSkinnedMesh&&o.material!==_hidden)rig.push(o);});rig.forEach(o=>grp.attach(o));
  /* the torn end on the limb, the stump on him */
  const rr_={shL:.06,shR:.06,elL:.045,elR:.045,hpL:.085,hpR:.085,knL:.062,knR:.062}[bn]||.05;
  /* the torn ends: a ragged dome of meat, darker where it has clotted, wetter red in the folds, the pale end of the bone in
     the middle (upper limbs only show it); flattened along the limb and facing out of the wound */
  const capG=new T.SphereGeometry(rr_,18,12);{const q=capG.attributes.position,col=new Float32Array(q.count*3),up=bn[0]!=='w'&&bn[0]!=='a';
    for(let i=0;i<q.count;i++){const x=q.getX(i),y=q.getY(i),z=q.getZ(i),n_=n3(x*70,y*70,z*70),n2=n3(x*190+5,y*190,z*190);const k=.8+n_*.45+(y>0?n2*.25:0);q.setXYZ(i,x*k,y*k,z*k);
      const ax=Math.hypot(x,z)/rr_;let c=[.22,.03,.02];if(n2>.55)c=[.42,.06,.04];if(n_<.3)c=[.12,.02,.015];
      if(y<-.2*rr_)c=[.24,.22,.18];/* (cloth round the base of it) */
      if(up&&y>.55*rr_&&ax<.32)c=[.78,.72,.6];col[i*3]=c[0];col[i*3+1]=c[1];col[i*3+2]=c[2];}
    capG.setAttribute('color',new T.BufferAttribute(col,3));capG.computeVertexNormals();}
  const ch=cut.children.find(o=>o.isBone);const axW=ch?ch.getWorldPosition(V3()).sub(jw).normalize():dir.clone();
  const axL=ch?ch.position.clone().applyQuaternion(cut.quaternion).normalize():V3(0,1,0);
  const st=new T.Mesh(capG,GORECAP);st.position.copy(cut.position);st.quaternion.setFromUnitVectors(V3(0,1,0),axL);st.scale.set(1,.5,1);cut.parent.add(st);st.castShadow=true;
  const te=new T.Mesh(capG,GORECAP);grp.add(te);te.quaternion.setFromUnitVectors(V3(0,1,0),axW.clone().negate());te.scale.set(.92,.45,.92);
  cut.scale.setScalar(.001);
  const vel=dir.clone().setY(0).normalize().multiplyScalar(wr(3,7)).add(V3(wr(-1.5,1.5),wr(2.5,5),wr(-1.5,1.5)));
  BLAST.sev.push({g:grp,v:vel,w:V3(wr(-9,9),wr(-9,9),wr(-9,9)),t:0,rest:false,r:rr_});
  BLAST.bleed.push({o:cut.parent,off:cut.position.clone(),t:0,dir:dir.clone()});
  bloodSpurt(jw,dir,2);return grp;}
/* the limbs within reach of the blast come off: a whole arm or leg very close, below the elbow or knee a little further */
function severNear(h,bp,dir){const B=h.P.bones;const w=n=>B[n].getWorldPosition(V3());const todo=[];
  for(const sd of ['L','R'])for(const [prox,dist,child] of [['sh'+sd,'el'+sd,'wr'+sd],['hp'+sd,'kn'+sd,'an'+sd]]){if(!B[prox]||!B[dist]||!B[child])continue;
    const mP=w(prox).lerp(w(dist),.5),mD=w(dist).lerp(w(child),.5);if(mP.distanceTo(bp)<BLAST_SEVER*.6)todo.push(prox);else if(mD.distanceTo(bp)<BLAST_SEVER)todo.push(dist);}
  todo.forEach(n=>sever(h,n,dir));return todo;}
/* each frame: the flash dies, thrown limbs tumble and come to rest, stumps pump for a few seconds */
function blastTick(dt){BLAST.lt+=dt;BLAST.L.intensity=BLAST.lt<.25?60*Math.exp(-BLAST.lt*16):0;
  for(const s of BLAST.sev){if(s.rest)continue;s.t+=dt;s.v.y-=9.8*dt;s.g.position.addScaledVector(s.v,dt);s.g.rotation.x+=s.w.x*dt;s.g.rotation.y+=s.w.y*dt;s.g.rotation.z+=s.w.z*dt;
    const fy=floorAt(s.g.position.x,s.g.position.z)+s.r*.8;if(s.g.position.y<fy){s.g.position.y=fy;if(Math.abs(s.v.y)>1.5){s.v.y=-s.v.y*.25;s.v.x*=.45;s.v.z*=.45;s.w.multiplyScalar(.4);}else{s.rest=true;stain('spot',s.g.position.x,s.g.position.z,.5,.6,V3(1,0,0),{life:300});}}
    if(s.t<1.2&&WR()<dt*14)bloodSpurt(s.g.position.clone(),s.v.clone().normalize().negate(),.5);}
  for(let i=BLAST.bleed.length-1;i>=0;i--){const b=BLAST.bleed[i];b.t+=dt;if(b.t>5){BLAST.bleed.splice(i,1);continue;}if(!b.o.parent)continue;
    if(Math.sin(b.t*7.5)>.85&&WR()<dt*30){const w=b.o.localToWorld(b.off.clone());bloodSpurt(w,V3(wr(-1,1),wr(-.2,.6),wr(-1,1)),.6*(1-b.t/5));}}}
window.__blast={explode,BLAST,sever,severNear};
