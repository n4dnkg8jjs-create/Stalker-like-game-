/* ---------- chapter 2: new orders at the drop point, the forest track, the highway, the ambush, the wake-up ---------- */
btr.rotation.order='YZX';   /* yaw, then pitch about the hull's lateral axis, then roll about its length */
const CH2={path:null,wreck:null,rec:-1,deb:[],flames:[],checked:{},post:{blur:0,dbl:0,desat:0,flash:0}};
/* one point light, created up front (adding a light later would recompile every material mid-cinematic): the rocket's
   motor glow, then the blast, then the burning wreck */
CH2.L=new T.PointLight(C(0xffa050),0,40,2);scene.add(CH2.L);
/* ---------- dressing for the forest track: ferns, fallen trees and logs, stumps, mossy boulders, saplings and a
   hunter's high seat - so the long drive reads as deep, old, untended forest ---------- */
TX.fern=tex(128,512,(g,w,h)=>{g.clearRect(0,0,w,h);const N=26;g.strokeStyle='#3e5a22';g.lineWidth=3;g.beginPath();g.moveTo(w/2,h);g.quadraticCurveTo(w/2+4,h*.5,w/2,4);g.stroke();
  for(let i=0;i<N;i++){const t=i/N,y=h-8-t*(h-24),L=(1-t*.85)*(w*.46)*(t<.08?t/.08:1);
    [-1,1].forEach(sd=>{for(let k=0;k<9;k++){const u=k/9,lx=w/2+sd*u*L,ly=y-u*L*.35;g.fillStyle=`hsl(${86+R()*16},${40+R()*18}%,${22+R()*14+t*6}%)`;g.beginPath();g.ellipse(lx,ly,L*.07+2,L*.035+2.2,sd*-.35,0,7);g.fill();}});}},{clamp:true});
(function forestDressing(){const P=ROADS.tr.P,L=ROADS.tr.L;const rs=rng(4417);const rr=(a,b)=>a+(b-a)*rs();
  const spot=(i,side,d)=>{const f=roadFrame(P,i);const x=P[i].x+f.nx*d*side,z=P[i].z+f.nz*d*side;return{x,z,f,y:H(x,z)};};
  const okF=(x,z)=>forestF(x,z)>0||x<-6;
  /* ferns: instanced clusters of arched fronds */
  {const fr=[];for(let k=0;k<7;k++){const g=new T.PlaneGeometry(.2,.7,1,5);g.translate(0,.35,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,y*y*.5);}
      g.rotateX(-.55-.25*rs());g.rotateY(k/7*6.283+rs()*.4);g.computeVertexNormals();fr.push(g);}
    const fg=merge(fr);const list=[];
    P.forEach((p,i)=>{if(i<14||P[i].s>L-24)return;for(let k=0;k<2;k++){const sd=rs()<.5?-1:1,q=spot(i,sd,rr(3.9,15));if(okF(q.x,q.z))list.push(q);}});
    const m=new T.InstancedMesh(fg,leafMat(TX.fern,'f'),list.length);m.customDepthMaterial=depthMat(TX.fern);m.castShadow=m.receiveShadow=true;const o=new T.Object3D(),c=new T.Color();
    list.forEach((q,k)=>{const s=rr(.7,1.35);o.position.set(q.x,q.y-.04,q.z);o.rotation.set(0,rr(0,6.28),0);o.scale.set(s,s*rr(.85,1.15),s);o.updateMatrix();m.setMatrixAt(k,o.matrix);c.setRGB(1,1,1).offsetHSL(rr(-.03,.04),rr(-.15,.05),rr(-.08,.05));m.setColorAt(k,c);});
    fitInstBounds(m,list.map(q=>[q.x,q.z]),2);m.userData.chunkSize=48;scene.add(m);}
  const bark=std({map:TX.bark,color:C(0x8a7c6c),roughness:.95}),end=std({color:C(0xa8916c),roughness:.9}),rot=std({map:TX.bark,color:C(0x4e4a3e),roughness:1});
  const mossy=(()=>{const m=std({map:TX.concrete,color:C(0xa0a090),roughness:1,vertexColors:true});return m;})();
  /* fallen logs and whole fallen trees, lying across the forest floor beside the track (never on it) */
  const logAt=(x,z,len,r,yaw,mat)=>{const y=H(x,z);const g=new T.CylinderGeometry(r*.92,r,len,12,1);g.rotateZ(Math.PI/2);worldUV(g,.8);const m=mesh(g,mat,x,y+r*.72,z,scene);m.rotation.set(0,yaw,rr(-.06,.06));
    const e=new T.CircleGeometry(r*.95,12);[-1,1].forEach(sd=>{const c=mesh(e,end,0,0,0,m,false);c.position.set(sd*len/2,0,0);c.rotation.y=sd*Math.PI/2;});solids.push({cx:x,cz:z,r:Math.min(len/2,.6)});shootables.push(m);return m;};
  for(let i=20;i<P.length-14;i+=rs()<.5?5:9){const sd=rs()<.5?-1:1,q=spot(i,sd,rr(5.4,12));if(!okF(q.x,q.z))continue;const yaw=Math.atan2(q.f.tx,q.f.tz)+rr(-.7,.7)+(rs()<.5?Math.PI/2:0);
    if(rs()<.42){const r=rr(.13,.26),len=rr(2.4,6.5);logAt(q.x,q.z,len,r,yaw,rs()<.35?rot:bark);}
    else if(rs()<.5){const r=rr(.16,.24);const st=mesh(new T.CylinderGeometry(r,r*1.25,rr(.25,.6),10),bark,q.x,q.y+.12,q.z,scene);const c=mesh(new T.CircleGeometry(r,10),end,0,.3,0,st,false);c.rotation.x=-Math.PI/2;c.position.y=st.geometry.parameters.height/2+.002;solids.push({cx:q.x,cz:q.z,r:r+.05});}
    else{const g=rockGeo(10+i%7,{moss:1,col:[.5,.5,.46]});
      const s=rr(.35,.95);const m=mesh(g,rockMat(),q.x,q.y-s*.15,q.z,scene);m.scale.setScalar(s);m.rotation.set(rr(-.2,.2),rr(0,6.28),rr(-.2,.2));solids.push({cx:q.x,cz:q.z,r:s*.8});}}
  /* whole fallen pines: bare trunks with broken stubs, some resting on their own branches at a slant */
  for(let k=0;k<11;k++){const i=Math.floor(rr(.08,.92)*P.length),sd=rs()<.5?-1:1,q=spot(i,sd,rr(9,20));if(!okF(q.x,q.z))continue;
    const len=rr(10,16),r=rr(.17,.27),yaw=Math.atan2(q.f.tx,q.f.tz)+rr(-.5,.5)+(rs()<.5?.4:-.4);const lg=logAt(q.x,q.z,len,r,yaw,bark);lg.rotation.z=rr(-.12,.12);
    for(let b=0;b<6;b++){const sb=mesh(new T.CylinderGeometry(.02,.045,rr(.4,1.1),6),bark,rr(-len/2.4,len/2.4),r*.6,0,lg);sb.rotation.set(rr(-1.2,1.2),0,rr(-.6,.6));}}
  /* a hunter's high seat */
  {const i=Math.floor(P.length*.44),q=spot(i,1,11.5);const g=new T.Group();g.position.set(q.x,q.y,q.z);g.rotation.y=Math.atan2(q.f.tx,q.f.tz)+.4;scene.add(g);const w=std({map:TX.bark,color:C(0x7a6a58),roughness:1});
    [[-.7,-.7],[.7,-.7],[-.7,.7],[.7,.7]].forEach(([x,z])=>{const pl=mesh(new T.CylinderGeometry(.06,.08,3.6,16),w,x*.82,1.8,z*.82,g);pl.rotation.set(-z*.06,0,x*.06);});
    mesh(rbox(1.5,.06,1.5,.01),M.planks,0,3.0,0,g);[[0,.7],[0,-.7]].forEach(([x,z])=>mesh(rbox(1.5,.05,.05,.01),M.planks,x,3.45,z,g));mesh(rbox(.05,.05,1.5,.01),M.planks,-.72,3.45,0,g);mesh(rbox(.05,.05,1.5,.01),M.planks,.72,3.45,0,g);
    for(let r=0;r<10;r++)mesh(rbox(.5,.04,.04,.01),M.planks,0,.3+r*.28,.95+r*.012,g);[-.25,.25].forEach(x=>{const rl=mesh(new T.CylinderGeometry(.03,.03,3.2,16),w,x,1.6,.98,g);rl.rotation.x=-.06;});
    g.updateWorldMatrix(true,true);solids.push({cx:q.x,cz:q.z,r:1.0});}
  /* young birches and spruce saplings crowding the verges */
  {const sp=[];P.forEach((p,i)=>{if(i<14||i%2||P[i].s>L-24)return;if(rs()<.55){const sd=rs()<.5?-1:1,q=spot(i,sd,rr(4.6,8.5));if(okF(q.x,q.z))sp.push([q.x,q.z]);}});
    plant(birchGeo,2,sp.filter((_,k)=>k%3===0),woodMat.birch,MB,TX.twigBirch,new T.Color(.95,1,.9),.12);
    plant(pineGeo,2,sp.filter((_,k)=>k%3===1),woodMat.bark,MP,TX.spray,new T.Color(.9,1,.92),.15);}
})();
/* ---------- the war on the way: shell-felled trees along the last of the forest track, then on the kolkhoz road
   charred bales, a wrecked checkpoint at the highway, scorched earth round the shell holes, splintered trees in the
   windbreak ---------- */
const SMOULDER=[];
(function warDressing(){const r_=rng(2207),rr=(a,b)=>a+(b-a)*r_();const bk=bucket();
  const char=std({map:PB.rust.a,normalMap:PB.rust.n,roughnessMap:PB.rust.r,color:C(0x3a302a),roughness:1,metalness:.35,envMapIntensity:.35}),
    soot=std({color:C(0x161412),roughness:.95,metalness:.2,envMapIntensity:.2}),ash=std({color:C(0x4a4640),roughness:1,envMapIntensity:.15}),
    conc=WM.conc,bagM=WM.canvas,dead=std({map:TX.bark,color:C(0x7e766a),roughness:1,envMapIntensity:.2}),charW=std({map:TX.bark,color:C(0x2a2522),roughness:1});
  const sootTex=tex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,8,w/2,h/2,w/2);g.addColorStop(0,'rgba(12,10,8,.92)');g.addColorStop(.55,'rgba(20,16,12,.7)');g.addColorStop(1,'rgba(20,16,12,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
    const q=rng(5);for(let i=0;i<260;i++){c.fillStyle=`rgba(${q()<.5?'60,52,40':'10,8,6'},${q()*.35})`;const a=q()*6.28,d=q()*w*.45;c.fillRect(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,2+q()*6,2+q()*6);}},{clamp:true});
  const sootM=std({map:sootTex,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,envMapIntensity:.1});
  const scorch=(x,z,r)=>{const g=new T.PlaneGeometry(r*2,r*2,8,8);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=x+p.getX(i),Z=z+p.getZ(i);p.setXYZ(i,X,H(X,Z)+.03,Z);}g.computeVertexNormals();
    const m=new T.Mesh(g,sootM);m.receiveShadow=true;m.renderOrder=2;scene.add(m);};
  const place=(g,x,z,yaw,dy=0)=>{const y=H(x,z);g.position.set(x,y+dy,z);g.rotation.y=yaw;scene.add(g);g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;shootables.push(q);}});};
  const rim=()=>{const g=new T.Group();const t=new T.TorusGeometry(.42,.035,6,18);mesh(t,soot,0,0,0,g);mesh(new T.CylinderGeometry(.3,.3,.2,12),char,0,0,0,g).rotation.x=Math.PI/2;return g;};
  /* a GAZ-66 burnt down to the metal: cab windows gone, the canvas and the bed boards burnt off the frame, tyres burnt
     off the rims, the hood up a little, the whole thing down on its rims */
  function truck(x,z,yaw){const g=new T.Group();const P_=(geo,m,px,py,pz,rx=0,ry=0,rz=0)=>{const q=mesh(geo,m,px,py,pz,g);q.rotation.set(rx,ry,rz);return q;};
    [-.48,.48].forEach(sz=>P_(rbox(5.4,.16,.1,.01),char,0,.62,sz));
    /* cab: floor, back, roof, the pillars and door panels round empty window holes */
    P_(rbox(1.5,.06,1.95,.01),char,1.55,.86,0);P_(rbox(.06,1.2,1.95,.01),char,.82,1.45,0);P_(rbox(1.42,.06,1.9,.02),soot,1.52,2.05,0,0,0,.03);
    [-1,1].forEach(sd=>{P_(rbox(1.4,.62,.05,.01),char,1.55,1.18,sd*.97);P_(rbox(.06,.55,.05,.01),char,2.22,1.78,sd*.95);P_(rbox(.06,.55,.05,.01),char,.85,1.78,sd*.95);});
    P_(rbox(.06,.08,1.9,.01),char,2.24,1.5,0);P_(rbox(.06,.08,1.9,.01),char,2.24,2.03,0,0,0,.08);
    /* hood and wings, the grille */
    P_(rbox(1.15,.5,1.4,.03),char,2.85,1.15,0,0,0,-.04);P_(rbox(1.0,.06,1.42,.01),soot,2.85,1.44,0,0,0,-.12);[-1,1].forEach(sd=>P_(rbox(1.1,.3,.35,.02),char,2.9,1.0,sd*.9));
    P_(rbox(.08,.55,1.2,.01),soot,3.45,1.05,0);
    /* bed: the steel floor and what is left of the sides */
    P_(rbox(3.0,.06,2.2,.01),char,-1.0,1.0,0,0,0,-.02);[-1,1].forEach(sd=>{for(let k=0;k<3;k++)P_(rbox(rr(.4,1.2),.12,.04,.005),charW,-2.2+k*1.1+rr(-.2,.2),1.16,sd*1.08);});
    P_(rbox(.06,.4,2.2,.01),char,-2.5,1.22,0,0,0,.3);
    [[2.6,1],[2.6,-1],[-.6,1],[-.6,-1],[-1.9,1],[-1.9,-1]].forEach(([wx,wz])=>{const w=rim();w.position.set(wx,.36,wz*.92);w.rotation.set(rr(-.15,.15),0,rr(-.1,.1));g.add(w);});
    place(g,x,z,yaw,-.06);g.rotation.z=rr(-.04,.04);g.rotation.x=rr(-.03,.03);scorch(x,z,4.2);const c=Math.cos(yaw),s_=Math.sin(yaw);solidAABB(x-3,x+3,z-3,z+3);}
  /* a Zhiguli burnt out in the field: the shell, the roof sagged, doors and boot lid sprung */
  function car(x,z,yaw){const g=new T.Group();const P_=(geo,m,px,py,pz,rx=0,ry=0,rz=0)=>{const q=mesh(geo,m,px,py,pz,g);q.rotation.set(rx,ry,rz);return q;};
    P_(rbox(4.1,.55,1.62,.05),char,0,.55,0);P_(rbox(1.05,.08,1.55,.02),soot,1.45,.86,0,0,0,-.05);P_(rbox(1.0,.08,1.55,.02),soot,-1.55,.86,0,0,0,.06);
    P_(rbox(1.9,.06,1.42,.02),soot,-.1,1.3,0,0,0,.02);[[.9,1],[.9,-1],[-.2,1],[-.2,-1],[-1.05,1],[-1.05,-1]].forEach(([px,pz],k)=>P_(rbox(.06,.5,.05,.01),char,px,1.06,pz*.7,0,0,k<2?-.35:k>3?.3:0));
    P_(rbox(.9,.5,.04,.01),char,.35,.62,.95,0,-.5,0);
    [[1.3,.75],[1.3,-.75],[-1.25,.75],[-1.25,-.75]].forEach(([wx,wz])=>{const w=rim();w.scale.setScalar(.75);w.position.set(wx,.22,wz);g.add(w);});
    place(g,x,z,yaw,-.04);scorch(x,z,3.2);solids.push({cx:x,cz:z,r:2.0});}
  /* round bales, charred */
  function bale(x,z,yaw){const g=new T.Group();const q=mesh(new T.CylinderGeometry(.75,.75,1.2,16),r_()<.5?ash:charW,0,.68,0,g);q.rotation.z=Math.PI/2;q.scale.set(1,1,rr(.85,1));place(g,x,z,yaw);solids.push({cx:x,cz:z,r:.8});}
  const D=ROADS.dr,P=D.P,s0=P[P.findIndex(p=>p.x<=262)].s;const at=(s,off)=>{const i=Math.max(1,P.findIndex(p=>p.s>=s));const p=P[i],f=roadFrame(P,i);return{x:p.x+f.nx*off,z:p.z+f.nz*off,yaw:Math.atan2(f.tx,f.tz)};};
  /* (+off = north of the road, the windbreak side; - = south) */
  /* (the bales are in the hay meadow now - 09k) */for(let k=0;k<7;k++){rr(60,480);r_();rr(16,44);rr(0,6.28);}
  /* the checkpoint where the kolkhoz road meets the highway: FBS blocks shoved about, a burnt barrier pole, sandbags split
     and spilled, a shattered sign */
  {const q=at(D.L-38,-7.5);const g=new T.Group();
    [[0,0,0,0],[2.5,0,.4,.2],[-2.3,.1,-.2,-.3]].forEach(([px,pz,ry,rz])=>{const b=mesh(rbox(2.38,.58,.58,.02),conc,px,.29,pz,g);b.rotation.set(0,ry,rz*.1);});
    const bar=mesh(new T.CylinderGeometry(.05,.05,4.2,16),soot,0,.95,-2.2,g);bar.rotation.set(0,0,Math.PI/2-.25);mesh(rbox(.35,1.1,.35,.02),char,-2.2,.55,-2.2,g);
    for(let k=0;k<14;k++){const b=mesh(rbox(.55,.14,.32,.06),bagM,rr(-1.6,1.6),.07+(k%3)*.13,1.0+rr(-.3,.3),g);b.rotation.set(rr(-.15,.15),rr(-.4,.4),rr(-.2,.2));if(k>10)b.scale.set(.7,.6,1);}
    place(g,q.x,q.z,q.yaw);scorch(q.x,q.z-1,3);solidAABB(q.x-3.6,q.x+3.6,q.z-1.4,q.z+1.4);}
  /* scorched earth round some of the shell holes on the kolkhoz road */
  if(CRATERS)CRATERS.L.forEach(c=>{const q=roadQuery(c.x,c.z);if(q.dT<60&&c.z<-600&&r_()<.6)scorch(c.x,c.z,c.r*rr(1.6,2.2));});
  /* splintered stumps in the windbreak, where a shell burst in the trees */
  (D.wb||[]).forEach((t,k)=>{if(k%5!==2)return;const h=rr(1.2,3.2),r=rr(.12,.18);const M4=TRS(t[0]+rr(1.5,3),H(t[0],t[1])-.05,t[1]+rr(-1,1),rr(-.08,.08),rr(0,6),rr(-.08,.08));
    snagParts(bk,M4,r,r*.84,h,r_,dead);});
  /* the forest track's last straight before the long drive: trees brought down by shellfire, lying back from the track */
  {const T_=ROADS.tr.P;T_.forEach((p,i)=>{if(p.z>-492||p.z<-566||i%2)return;if(r_()>.55)return;const f=roadFrame(T_,i),sd=r_()<.5?-1:1,d=rr(5.2,14);const x=p.x+f.nx*d*sd,z=p.z+f.nz*d*sd;if(roadQuery(x,z).dT<4.6)return;
     const L=rr(6,13),r=rr(.14,.26),yaw=Math.atan2(f.tx,f.tz)+sd*rr(.5,1.2);const ex=x+Math.sin(yaw)*L,ez=z+Math.cos(yaw)*L;if(roadQuery(ex,ez).dT<4.2)return;
     const ax=x+Math.sin(yaw)*.55,az=z+Math.cos(yaw)*.55;const A=V3(ax,H(ax,az)+r*.9,az),Bv=V3(ex,H(ex,ez)+r*.6,ez),Dv=Bv.clone().sub(A),Ln=Dv.length();Dv.normalize();const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),Dv);
     const M4=new T.Matrix4().compose(A.clone().add(Bv).multiplyScalar(.5),q,V3(1,1,1));bk.add(new T.CylinderGeometry(r*.4,r,Ln,9,1,true),dead,M4);
     for(let k=0;k<5;k++){const t=rr(.35,.95),bl=rr(.4,1.5);const br=new T.CylinderGeometry(.01,r*.28,bl,5);br.translate(0,bl/2,0);br.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rr(.6,1.5),rr(0,6.28),0,'YXZ')));br.translate(0,(t-.5)*Ln,0);bk.add(br,dead,M4);}
     /* the splintered stump it broke from */
     const sh=rr(.45,1.2),SM=TRS(x,H(x,z)-.05,z,0,rr(0,6),0);bk.add(new T.CylinderGeometry(r*.9,r*1.05,sh,8).translate(0,sh/2,0),dead,SM);splinters(bk,SM,r*.9,sh,r_,dead);
     {const EM=new T.Matrix4().compose(A,new T.Quaternion().setFromUnitVectors(V3(0,1,0),Dv.clone().negate()),V3(1,1,1));splinters(bk,EM,r*.95,0,r_,dead,10,.15,.55);}
     const n=Math.ceil(Ln/1.4);for(let k=0;k<=n;k++){const pp=A.clone().lerp(Bv,k/n);solids.push({cx:pp.x,cz:pp.z,r:r+.1});}});}
  /* round the shell holes along the way: trees the blast knocked flat outward and burnt, charred snags still standing, the
     ground scorched - and in some the wood is still smouldering, a thin smoke and the odd spark */
  {const charM=std({map:TX.bark,color:C(0x2a2420),roughness:1,envMapIntensity:.15}),emb=std({color:C(0x1a0e08),emissive:C(0xff4a10),emissiveIntensity:1.3,roughness:.9});
   const nearDrive=c=>{const q=roadQuery(c.x,c.z);return (q.dT<46&&c.z<-480)||(q.dH<46&&c.z<-412);};
   (CRATERS?CRATERS.L:[]).forEach((c,ci)=>{if(!nearDrive(c))return;const inWood=forestF(c.x+c.r*4,c.z)>0||forestF(c.x-c.r*4,c.z)>0||forestF(c.x,c.z+c.r*4)>0;
     if(!(c.z<-600&&roadQuery(c.x,c.z).dT<60))scorch(c.x,c.z,c.r*rr(1.7,2.2));
     const n=inWood?3+Math.floor(r_()*3):1+Math.floor(r_()*2);let smoulder=r_()<.4;
     for(let k=0;k<n;k++){const a=rr(0,6.28),d=c.r*rr(1.6,2.6),x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d;const q=roadQuery(x,z);if(q.dT<4.5||q.dH<5)continue;
       if(r_()<.3&&inWood){/* a burnt snag, its crown gone */const h=rr(2.5,6.5),r=rr(.12,.2);const M4=TRS(x,H(x,z)-.08,z,rr(-.07,.07),rr(0,6),rr(-.07,.07));
         snagParts(bk,M4,r*1.1,r*.8,h,r_,charM);solids.push({cx:x,cz:z,r:r+.1});continue;}
       /* a trunk thrown flat away from the blast, snapped off its stump */
       const L=rr(3.5,8),r=rr(.1,.2),ex=x+Math.cos(a)*L,ez=z+Math.sin(a)*L;if(roadQuery(ex,ez).dT<4.5||roadQuery(ex,ez).dH<5)continue;
       const A=V3(x,H(x,z)+r*.85,z),Bv=V3(ex,H(ex,ez)+r*.5,ez),Dv=Bv.clone().sub(A),Ln=Dv.length();Dv.normalize();const qq=new T.Quaternion().setFromUnitVectors(V3(0,1,0),Dv);
       const M4=new T.Matrix4().compose(A.clone().add(Bv).multiplyScalar(.5),qq,V3(1,1,1));bk.add(new T.CylinderGeometry(r*.45,r,Ln,8,1,true),charM,M4);
       {const EM=new T.Matrix4().compose(A,new T.Quaternion().setFromUnitVectors(V3(0,1,0),Dv.clone().negate()),V3(1,1,1));splinters(bk,EM,r*.95,0,r_,charM,9,.12,.45);}
       const sx=x-Math.cos(a)*.45,sz=z-Math.sin(a)*.45,sh=rr(.3,.9),SM=TRS(sx,H(sx,sz)-.06,sz,0,rr(0,6),0);bk.add(new T.CylinderGeometry(r*1.02,r*1.15,sh,8).translate(0,sh/2,0),charM,SM);splinters(bk,SM,r,sh,r_,charM,9,.12,.4);
       for(let b=0;b<3;b++){const t=rr(.4,.95),bl=rr(.3,1.1);const br=new T.CylinderGeometry(.008,r*.25,bl,4);br.translate(0,bl/2,0);br.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rr(.7,1.5),rr(0,6.28),0,'YXZ')));br.translate(0,(t-.5)*Ln,0);bk.add(br,charM,M4);}
       const nn=Math.ceil(Ln/1.3);for(let j=0;j<=nn;j++){const pp=A.clone().lerp(Bv,j/nn);solids.push({cx:pp.x,cz:pp.z,r:r+.1});}
       if(smoulder){smoulder=false;/* the broken end still glowing under the char */bk.add(rockGeo(50+ci%4,{detail:2,flat:.6}),emb,TRS(A.x,A.y-r*.3,A.z,rr(-.3,.3),rr(0,6),0,r*.7));
         SMOULDER.push({p:V3(A.x,A.y+.05,A.z),t:r_()*2,k:0});}}});}
  bk.flush(scene,true);})();
/* smouldering wood: a thin, slow smoke and now and then a spark, from the places near enough to see */
function smoulderTick(dt){if(!SMOULDER.length||dt<=0)return;const c=camera.position;let n=0;
  for(const s of SMOULDER){const d=s.p.distanceTo(c);if(d>170)continue;if(++n>10)break;s.t-=dt;
    if(s.t<=0){s.t=rnd(1.4,2.4);FX.smoke.spawn(_w.copy(s.p).add(V3(rnd(-.15,.15),.05,rnd(-.15,.15))),_v.set(rnd(-.1,.1)+.16,rnd(.5,.8),rnd(-.1,.1)+.05),rnd(3,4.5),rnd(.15,.25),rnd(.9,1.5),[.3,.29,.28,.3],[.5,.5,.49,0],{drag:.3,up:.12,spin:rnd(-.3,.3),fi:.05});
      if(Math.random()<.5)FX.ember.spawn(_w.copy(s.p),_v.set(rnd(-.3,.3),rnd(.6,1.4),rnd(-.3,.3)),rnd(.8,1.6),.03,.01,[1,.55,.15,1],[1,.3,.05,0],{drag:.6,up:.3});}}}
/* the route, sampled every metre: north road -> forest track -> south down the highway. The speed plan respects each
   road's limit and the curvature, then is smoothed by an acceleration pass forwards and a braking pass backwards. */
function ch2Path(){const pts=[];for(let z=DROPZ;z>-428;z-=6)pts.push(V3(0,0,z));
  /* the forest track round its last bend and down the long straight south, almost to where it comes out of the trees -
     the loading card falls near the end of the straight, before the open ground (and no road) shows ahead */
  const tp=ROADS.tr.P;for(let i=0;i<tp.length-5&&tp[i].z>-600;i+=3)pts.push(V3(tp[i].x,0,tp[i].z));
  /* fifty minutes later: the kolkhoz road west across the fields, then onto the highway, south */
  const dp=ROADS.dr.P;const d0=dp.findIndex(p=>p.x<=262);for(let i=d0;i<dp.length-4;i+=3)pts.push(V3(dp[i].x,0,dp[i].z));
  const hp=ROADS.hw.P;let jE=0,bd=1e9;hp.forEach((p,i)=>{const d=Math.hypot(p.x-dp[dp.length-1].x,p.z-dp[dp.length-1].z);if(d<bd){bd=d;jE=i;}});
  for(let i=jE+4;i<hp.length;i+=3)pts.push(V3(hp[i].x,0,hp[i].z));
  const Q=[pts[0]];for(const p of pts)if(p.distanceTo(Q[Q.length-1])>2.5)Q.push(p);
  const cv=new T.CatmullRomCurve3(Q,false,'centripetal');const n=Math.floor(cv.getLength());
  const X=new Float32Array(n+1),Z=new Float32Array(n+1),TX=new Float32Array(n+1),TZ=new Float32Array(n+1),V=new Float32Array(n+1);
  for(let i=0;i<=n;i++){const p=cv.getPointAt(i/n);X[i]=p.x;Z[i]=p.z;}
  for(let i=0;i<=n;i++){const a=Math.max(0,i-1),b=Math.min(n,i+1);const dx=X[b]-X[a],dz=Z[b]-Z[a],l=Math.hypot(dx,dz)||1;TX[i]=dx/l;TZ[i]=dz/l;}
  const near=(x,z,i0=0,i1=n)=>{let k=i0,b=1e9;for(let i=i0;i<=i1;i++){const d=Math.hypot(X[i]-x,Z[i]-z);if(d<b){b=d;k=i;}}return k;};
  /* the card comes on the forest track's straight; the drive picks up on the kolkhoz road */
  let sCard=0;for(let i=0;i<=n;i++)if(Z[i]<-578){sCard=i;break;}
  const sJump=near(dp[d0].x,dp[d0].z,sCard,n)+6,sJd=near(dp[dp.length-1].x,dp[dp.length-1].z,sJump,n);
  /* the ambush happens where it always did: 104 m on down the highway from the forest track's junction */
  const sJ=near(-306,-516,sJd,n),sAmb=sJ+104;
  /* (across the jump the curve bends through the gap - start the picked-up drive on the road's own heading) */
  for(let i=sJump;i<sJump+4;i++){TX[i]=TX[sJump+4];TZ[i]=TZ[sJump+4];}
  for(let i=0;i<=n;i++){const k0=Math.max(i>=sJump?sJump:0,i-3),k1=Math.min(n,i+3);const ang=Math.acos(clamp(TX[k0]*TX[k1]+TZ[k0]*TZ[k1],-1,1))/Math.max(1,k1-k0);
    const q=roadQuery(X[i],Z[i]);const vmax=q.dH<5.5?15.5:q.dT<5?(Z[i]<-600?11.2:9.4):10.2;V[i]=Math.min(vmax,Math.sqrt(2.6/Math.max(ang,1e-4)));}
  /* accelerate from rest at the drop point, and again (from a rolling 9 m/s) where the drive picks up after the card */
  V[0]=0;for(let i=1;i<=n;i++){if(i===sJump){V[i]=Math.min(V[i],9);continue;}V[i]=Math.min(V[i],Math.sqrt(V[i-1]*V[i-1]+2*2.1));}
  for(let i=n-1;i>=0;i--){if(i===sJump-1)continue;V[i]=Math.min(V[i],Math.sqrt(V[i+1]*V[i+1]+2*3.2));}
  return{n,X,Z,TX,TZ,V,sJ,sJd,sAmb,sCard,sJump};}
function ch2At(P,s){const i=clamp(Math.floor(s),0,P.n-1),f=clamp(s-i,0,1);return{x:lerp(P.X[i],P.X[i+1],f),z:lerp(P.Z[i],P.Z[i+1],f),tx:lerp(P.TX[i],P.TX[i+1],f),tz:lerp(P.TZ[i],P.TZ[i+1],f),v:lerp(P.V[i],P.V[i+1],f)};}
/* the hull rides on four wheel stations; height, pitch and roll follow the ground through a damped spring (suspension) */
const BP={y:0,p:0,r:0,vy:0,vp:0,vr:0};
function ch2Spring(k,tg,dt,K,D){BP['v'+k]+=(K*(tg-BP[k])-D*BP['v'+k])*dt;BP[k]+=BP['v'+k]*dt;}
/* dyn: {k: path curvature (1/m, + = left), v: speed, al: longitudinal acceleration} - the hull rolls out of a turn and
   squats or dives with the throttle and brakes, the front wheels steer to the curvature, each wheel follows the ground */
function ch2Pose(x,z,tx,tz,dt,snap,dyn){const l=Math.hypot(tx,tz)||1;tx/=l;tz/=l;const rx=-tz,rz=tx,Lw=2.3,Ww=1.15;const h=(a,b)=>H(x+tx*a+rx*b,z+tz*a+rz*b);
  const fl=h(Lw,-Ww),fr=h(Lw,Ww),bl=h(-Lw,-Ww),br=h(-Lw,Ww);const ty=(fl+fr+bl+br)/4;let tp=Math.atan2((fl+fr)-(bl+br),4*Lw),tr=Math.atan2((fr+br)-(fl+bl),4*Ww);
  if(dyn){const aLat=dyn.v*dyn.v*dyn.k;tr+=clamp(aLat*.02,-.075,.075);tp+=clamp((dyn.al||0)*.011,-.035,.03);btrSteer(clamp(Math.atan(3.77*dyn.k),-.55,.55),dt||.016);}
  if(snap){BP.y=ty;BP.p=tp;BP.r=tr;BP.vy=BP.vp=BP.vr=0;}else{const n=Math.max(1,Math.ceil(dt/.008)),h2=dt/n;for(let k=0;k<n;k++){ch2Spring('y',ty,h2,90,17);ch2Spring('p',tp,h2,70,15);ch2Spring('r',tr,h2,60,13);}}
  btr.position.set(x,BP.y,z);btr.rotation.set(-BP.r,Math.atan2(-tz,tx),BP.p);btrSusp(dt||.016,snap);}
/* signed curvature of the route at s (per metre, + = turning left) */
function ch2Kappa(P,s){const i0=clamp(Math.floor(s)-3,0,P.n),i1=clamp(Math.floor(s)+3,0,P.n);if(i1<=i0)return 0;let d=Math.atan2(-P.TZ[i1],P.TX[i1])-Math.atan2(-P.TZ[i0],P.TX[i0]);d=Math.atan2(Math.sin(d),Math.cos(d));return d/(i1-i0);}
function ch2Wheels(spd,dt){btrSpin(spd,dt);}
/* camera on the commander's-side deck seat, with free look and a scripted look that cinematics can take over */
function ch2SeatCam(rdt,look,shake){btr.updateMatrixWorld(true);camera.position.copy(SEAT).applyMatrix4(btr.matrixWorld);const sh=shake||0;
  camera.position.x+=(R()-.5)*sh*.04;camera.position.y+=(R()-.5)*sh*.04;
  RIDE.look=damp(RIDE.look,look,1.6,rdt);const base=btr.rotation.y-Math.PI/2;
  camera.rotation.set(-.08+BP.p*.7+RIDE.fp+(R()-.5)*sh*.02,base+RIDE.look+RIDE.fy,-BP.r*.6+(R()-.5)*sh*.02);}
function ch2Engine(spd){if(!sfx.engine)return;sfx.engine.gain.value=.2+Math.min(spd,14)*.006;if(sfx.engineO)sfx.engineO.frequency.value=30+spd*2.6;}
/* ---------- the ride: mount, new orders over the radio, drive ---------- */
function ch2Mount(){return{type:'fn',dur:25.5,lines:[[1.6,'COMMANDER · MOROZOV','Volkov? …Then we take his tags home. Sit down, hold on.',4.2],
    [6.2,'RADIO · «KURGAN»','One-two-one, Kurgan. Change of orders. Third platoon of the Seventy-fourth is pinned at the Lesnoye crossroads. Two more boards are on their way to them. You join the reinforcement. How copy?',6.2],
    [12.8,'COMMANDER · MOROZOV','Kurgan, one-two-one. I have a dead man from patrol three and two still missing out here—',4],
    [17.1,'RADIO · «KURGAN»','Negative. Patrol three waits. Forest track to the highway, then south four kilometres. Move now. Kurgan out.',5.2],
    [22.6,'COMMANDER · MOROZOV','…Copy. Lukin — forest track. Don\'t spare the engine.',3.2]],
  tick(dt,rdt,t,L){if(!L.init){L.init=1;L.from=camera.position.clone();L.y0=camera.rotation.y;L.p0=camera.rotation.x;ch2Pose(0,DROPZ,0,-1,0,true);RIDE.look=0;}
    ch2Pose(0,DROPZ,0,-1,dt);btr.position.y+=Math.sin(S.t*31)*.004;ch2Engine(t>22?2:0);
    const u=clamp(t/1.3,0,1),e=ease.io(u);btr.updateMatrixWorld(true);const seat=SEAT.clone().applyMatrix4(btr.matrixWorld);
    if(u<1){camera.position.lerpVectors(L.from,seat,e);camera.position.y+=Math.sin(u*Math.PI)*.45;camera.rotation.set(lerp(L.p0,-.08,e),lerp(L.y0,btr.rotation.y-Math.PI/2+.4,e),0);RIDE.look=.4;}
    else ch2SeatCam(rdt,t>6&&t<21?.55*Math.sin(t*.21):.3);
    return t>=L.dur;}};}
/* the drive is split by the loading card: lines are [s, who, text, secs] (s along the route) */
function ch2Lines(P,sCard,sJump){const A=[[8,'DRIVER · LUKIN','Hold on. North road, then the forest track.',3.5],[60,'RADIO · «KURGAN»','One-two-one, Kurgan. Lesnoye checkpoint still not answering. Expedite.',4.4],
    [150,'DRIVER · LUKIN','Forest track. Nobody has driven this since the evacuation.',4],[sCard-48,'BELOV','Look there — shell holes. In the middle of the forest.',3.6],[sCard-14,'COMMANDER · MOROZOV','Fresh ones. Keep going.',2.6]];
  const B=[[sJump+8,'DRIVER · LUKIN','Fifty minutes of this. My kidneys are somewhere behind us.',4],[sJump+62,'RYABOV','Lesnoye… my cousin was on the crossroads checkpoint. In April.',4.2],
    [sJump+114,'COMMANDER · MOROZOV','Was?',2],[sJump+136,'RYABOV','Nobody has heard from them since.',3.4],[sJump+205,'BELOV','Look at that field. Somebody walked artillery straight across it.',4],
    [sJump+292,'DRIVER · LUKIN','Shell holes in the field. Fresh - the earth is still dark.',3.8],[sJump+352,'COMMANDER · MOROZOV','Eyes open. Whoever did that is not far.',3.4],
    [P.sJd-52,'RADIO · ???','—any call sign, Lesnoye crossroads, contact east of the— (static)',4.4],[P.sJd+8,'DRIVER · LUKIN','Asphalt. Finally.',2.6],
    [P.sJd+66,'COMMANDER · MOROZOV','Kurgan, one-two-one, on the highway, kilometre twenty-eight. Five minutes out.',4.4],[P.sJd+142,'BELOV','Trees right up to the road. Good place for an ambush.',3.4],
    [P.sJd+192,'COMMANDER · MOROZOV','Then we do not stop.',2.4]];
  return [A,B.filter(l=>l[0]<P.sAmb-8)];}
function ch2Drive(sEnd,lines){const P=CH2.path;return{type:'fn',sl:lines.slice(),
  tick(dt,rdt,t,L){if(L.s===undefined){L.s=CH2.drive?CH2.drive.s:0;L.v=CH2.drive?CH2.drive.v:0;L.al=0;while(L.sl.length&&L.sl[0][0]<L.s-2)L.sl.shift();}const P=CH2.path;
    /* target speed is read a few metres ahead (the plan starts from rest, so reading it where we stand would never pull away) */
    const a=ch2At(P,Math.min(P.n,L.s+4));const acc=a.v>L.v?2.1:3.2;const v0=L.v;L.v=L.v+clamp(Math.max(a.v,1.2)-L.v,-acc*dt,acc*dt);L.s+=L.v*dt;const b=ch2At(P,L.s);
    L.al=damp(L.al,(L.v-v0)/Math.max(dt,1e-4),4,dt);
    ch2Pose(b.x,b.z,b.tx,b.tz,dt,false,{k:ch2Kappa(P,L.s+1.5),v:L.v,al:L.al});ch2Wheels(L.v,dt);ch2Engine(L.v);RIDE.v=Math.min(L.v,10);
    const onHw=roadQuery(b.x,b.z).dH<6;if(!onHw)btrDust(L.v,dt);
    while(L.sl.length&&L.s>=L.sl[0][0]){const l=L.sl.shift();say(l[1],l[2],l[3]);}
    btr.userData.tur.rotation.y=damp(btr.userData.tur.rotation.y,Math.sin(S.t*.22)*.5,1,dt);
    ch2SeatCam(rdt,Math.sin(S.t*.17)*.3+(onHw?.15:0),Math.min(L.v,12)*(onHw?.035:.06));
    CH2.drive={s:L.s,v:L.v};return L.s>=sEnd;}};}
/* the loading card between the north road and the deep forest: fade out, unload Sector 1 (the house, the field, the
   bodies, everything the rest of the game never comes back to), skip ahead fifty minutes down the track, fade in */
function ch2Load(sJump){const P=CH2.path;return{type:'fn',tick(dt,rdt,t,L){const card=$('card'),bar=$('cardbar').firstElementChild;
    if(!L.init){L.init=1;$('fade').style.opacity=1;if(sfx.engine)L.g0=sfx.engine.gain.value;}
    if(sfx.engine)sfx.engine.gain.value=lerp(L.g0||.2,.05,clamp(t/.8,0,1))*(t>3.6?clamp((t-3.6)/.8,0,1)*3+.25:1);
    if(t>.8&&!L.card){L.card=1;$('cardk').textContent='Zone 12 · South of the forest';$('cardh').textContent='The old kolkhoz road';$('cardp').textContent='Fifty minutes later · 17:52';bar.style.width='0%';card.classList.add('on','load');}
    if(t>1.1&&!L.off){L.off=1;L.stat=ch2Offload();}
    if(t>1.7&&!L.warm){L.warm=1;ch2Warm();}
    if(L.card)bar.style.width=Math.round(clamp((t-.9)/2.4,0,1)*100)+'%';
    if(t>3.5&&!L.jump){L.jump=1;CH2.drive={s:sJump,v:Math.min(P.V[Math.floor(sJump)],9)};const b=ch2At(P,sJump);ch2Pose(b.x,b.z,b.tx,b.tz,0,true,{k:ch2Kappa(P,sJump),v:0,al:0});card.classList.remove('on');}
    if(L.jump)ch2SeatCam(rdt,0,0);
    if(t>3.9&&!L.fin){L.fin=1;$('fade').style.opacity=0;setTimeout(()=>card.classList.remove('load'),900);}
    return t>4.3;}};}
/* drop everything in Sector 1 from the scene and free what nothing else uses (geometry, materials, textures); lights
   are kept (dark) so the light count - and every compiled shader - stays the same */
function ch2Offload(){const inR=(x,z)=>x>-40&&x<160&&z>-474&&z<-222;return dropRegion(inR,[btr,CH2.L],(x,z)=>x>-6&&inR(x,z));}
/* take a whole region out of the scene for good: everything top-level whose bounds sit in it (meshes no bigger than a
   few hundred metres - the terrain and the map-wide batches stay), with its shootables, interactions, items, culling
   entries and animations, and free what nothing else uses */
function dropRegion(inR,keepX=[],instR=inR){const t0=performance.now();roffRestore();const keep=new Set([sky,camera,GRASS.mesh,playerBody.root,...keepX]);
  scene.updateMatrixWorld(true);const v=V3(),rm=[];
  /* (kept whatever is flagged to stay - the things that live everywhere: creatures, the enemy, the flyovers, the camera's
     own flower ring - and a group is judged by where its contents are, not by its origin: a container left at 0,0,0
     whose parts are placed in the world is not part of the region just because its origin is) */
  for(const o of scene.children){if(keep.has(o)||o.isLight||o.frustumCulled===false||o.userData.keep||o.userData.noCull)continue;
    if(o.isInstancedMesh){const b=o.geometry.boundingSphere;if(!b)continue;v.copy(b.center).applyMatrix4(o.matrixWorld);if(instR(v.x,v.z))rm.push(o);continue;}
    if(o.isMesh||o.isPoints||o.isLine){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere.radius>90)continue;v.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);if(inR(v.x,v.z))rm.push(o);continue;}
    {const bb=new T.Box3().setFromObject(o);if(bb.isEmpty())o.getWorldPosition(v);else bb.getCenter(v);}if(inR(v.x,v.z))rm.push(o);}
  const gone=new Set();rm.forEach(o=>o.traverse(c=>gone.add(c)));
  /* lights inside removed groups stay in the scene, switched off */
  const lights=[];rm.forEach(o=>o.traverse(c=>{if(c.isLight)lights.push(c);}));lights.forEach(c=>{c.intensity=0;scene.attach(c);gone.delete(c);if(c.target)gone.delete(c.target);});
  rm.forEach(o=>{if(o.parent)o.parent.remove(o);});
  for(let i=shootables.length-1;i>=0;i--)if(gone.has(shootables[i]))shootables.splice(i,1);
  for(let i=interact.length-1;i>=0;i--)if(interact[i].obj&&gone.has(interact[i].obj))interact.splice(i,1);
  for(let i=worldItems.length-1;i>=0;i--)if(gone.has(worldItems[i].mesh))worldItems.splice(i,1);
  DCULL.list=DCULL.list.filter(e=>!gone.has(e.o));ROFF.L=ROFF.L.filter(e=>!gone.has(e.o));S.flies=null;
  if(typeof ANIMS!=='undefined')ANIMS.forEach(an=>{if(an.h&&gone.has(an.h.root))an.paused=true;});
  /* free GPU and CPU memory nothing left references */
  const used={g:new Set(),m:new Set(),t:new Set(),a:new Set()};const tk=m=>{for(const k in m){const x=m[k];if(x&&x.isTexture)used.t.add(x);}};
  [scene,vmScene].forEach(sc=>sc.traverse(c=>{if(c.geometry){used.g.add(c.geometry);const gg=c.geometry;if(gg.index)used.a.add(gg.index);for(const k in gg.attributes)used.a.add(gg.attributes[k]);}if(c.material)(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{used.m.add(m);tk(m);});if(c.customDepthMaterial){used.m.add(c.customDepthMaterial);tk(c.customDepthMaterial);}}));
  let ng=0,nm=0,nt=0;const dm=new Set();
  /* (a geometry whose buffers are shared with one still in the scene - the chunks of one instanced model share them - is
     left alone: disposing it would delete those buffers from under the survivors, which then draw nothing) */
  const shares=g=>{if(g.index&&used.a.has(g.index))return true;for(const k in g.attributes)if(used.a.has(g.attributes[k]))return true;return false;};
  gone.forEach(c=>{if(c.geometry&&!used.g.has(c.geometry)&&!shares(c.geometry)){c.geometry.dispose();used.g.add(c.geometry);ng++;}
    if(c.material)(Array.isArray(c.material)?c.material:[c.material]).forEach(m=>{if(used.m.has(m)||dm.has(m))return;dm.add(m);m.dispose();nm++;
      for(const k in m){const x=m[k];if(x&&x.isTexture&&!used.t.has(x)){x.dispose();used.t.add(x);nt++;}}});
    if(c.isSkinnedMesh&&c.skeleton&&c.skeleton.boneTexture){c.skeleton.boneTexture.dispose();}});
  CH2.unloaded=true;const r={objects:rm.length,nodes:gone.size,geo:ng,mat:nm,tex:nt,ms:Math.round(performance.now()-t0),mem:Object.assign({},renderer.info.memory)};window.__offload=r;return r;}
/* ---------- the ambush ---------- */
/* everything the strike will need is made and its shaders compiled ahead (behind the loading card), so the hit itself
   costs nothing but the effects: the rocket, the debris, the burnt hull materials, the flame volumes */
const CH2W={};
function ch2Warm(){if(CH2W.done)return;CH2W.done=1;
  CH2W.rk=[std({color:C(0x3f4630),roughness:.6,metalness:.2}),std({color:C(0x23251f),roughness:.5,metalness:.4})];
  CH2W.deb=[std({color:C(0x262822),roughness:.7,metalness:.4}),std({color:C(0x161616),roughness:.9}),std({color:C(0x4a4f3a),roughness:.75,metalness:.3})];
  CH2W.burnt=new Map();btr.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh)return;(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(!m||CH2W.burnt.has(m))return;
    const c=m.clone();if(m.onBeforeCompile)c.onBeforeCompile=m.onBeforeCompile;if(m.customProgramCacheKey)c.customProgramCacheKey=m.customProgramCacheKey;c.userData.burnt=1;if(c.emissive)c.emissive.setRGB(0,0,0);if(!c.transparent&&c.isMeshStandardMaterial){const B=charPB();c.map=B.a;c.normalMap=B.n;c.roughnessMap=B.r;c.color=C(c.color&&(c.color.r+c.color.g+c.color.b)<.12?0x383532:0x8e8a86);c.roughness=1;c.metalness=.35;c.needsUpdate=true;}else{if(c.color)c.color.multiplyScalar(.22);c.roughness=.95;c.metalness=.15;}CH2W.burnt.set(m,c);});});
  CH2W.fl=[[1.75,1.15,1.05,1.35,2.1],[-.2,2.05,0,1.1,2.7]].map(([x,y,z,w,h])=>{const fl=flameVolume(w,h,99,-99,26);fl.position.set(x,y-.2,z);return fl;});
  const g=new T.Group(),bx=new T.BoxGeometry(.01,.01,.01);[...CH2W.rk,...CH2W.deb,...CH2W.burnt.values()].forEach(m=>g.add(new T.Mesh(bx,m)));CH2W.fl.forEach(f=>g.add(f));
  g.position.copy(camera.position);scene.add(g);try{renderer.compile(scene,camera);}catch(_){}scene.remove(g);CH2W.fl.forEach(f=>g.remove(f));}
function ch2RocketMesh(){ch2Warm();const g=new T.Group();const ol=CH2W.rk[0],dk=CH2W.rk[1];
  const wh=lathe([[0,.0],[.012,.02],[.034,.09],[.042,.17],[.042,.25],[.022,.29],[.022,.33],[0,.33]],40);wh.rotateX(-Math.PI/2);mesh(wh,ol,0,0,.33,g,false);
  const bd=new T.CylinderGeometry(.021,.021,.42,32);bd.rotateX(Math.PI/2);mesh(bd,dk,0,0,-.18,g,false);
  for(let k=0;k<4;k++){const f=mesh(rbox(.002,.06,.1,.001),dk,0,0,-.36,g,false);f.rotation.z=k*Math.PI/4;}
  scene.add(g);return g;}
function ch2Explode(p,n){FX.glow.spawn(p,_w.set(0,0,0),.22,4,8,[1,.9,.7,1],[1,.5,.15,0]);FX.glow.spawn(p,_w.set(0,0,0),.5,2.5,5,[1,.6,.25,.9],[.6,.15,.02,0]);
  for(let i=0;i<46;i++){_v.set(rnd(-1,1),rnd(-.2,1),rnd(-1,1)).normalize().addScaledVector(n,.8).normalize().multiplyScalar(rnd(3,10));
    FX.flame.spawn(_w.copy(p).addScaledVector(_v,.05),_v,rnd(.45,1.1),rnd(.6,1.1),rnd(1.6,2.8),[1,.75,.35,1],[.55,.12,.02,0],{drag:2.6,up:1.2,spin:rnd(-2,2),fi:.01});}
  for(let i=0;i<150;i++){_v.set(rnd(-1,1),rnd(-.1,1.2),rnd(-1,1)).normalize().addScaledVector(n,.6).multiplyScalar(rnd(7,26));FX.spark.spawn(p,_v,rnd(.4,1.5),rnd(.02,.05),.008,[1,.85,.5,1],[1,.35,.08,0],{g:9.8,drag:.6});}
  for(let i=0;i<34;i++){_v.set(rnd(-1,1),rnd(.3,1.4),rnd(-1,1)).addScaledVector(n,.7).multiplyScalar(rnd(.8,3.2));
    FX.smoke.spawn(_w.copy(p).add(V3(rnd(-.6,.6),rnd(-.2,.6),rnd(-.6,.6))),_v,rnd(3,7),rnd(1.2,2),rnd(4,8),[.09,.08,.07,.85],[.3,.29,.28,0],{drag:.7,up:.35,spin:rnd(-.5,.5),fi:.02});}
  for(let i=0;i<26;i++){const a=i/26*6.283;_v.set(Math.cos(a),.1,Math.sin(a)).multiplyScalar(rnd(4,9));
    FX.dust.spawn(_w.set(p.x,H(p.x,p.z)+.3,p.z),_v,rnd(1.6,3),rnd(.8,1.4),rnd(3,5),[.5,.46,.38,.7],[.55,.52,.46,0],{drag:1.6,up:.15});}
  CH2.L.color.set(0xffb060);CH2.L.distance=45;CH2.L.intensity=90;CH2.L.position.copy(p).addScaledVector(n,.5);CH2.boomT=0;
  /* debris: torn steel and rubber chunks that fly, bounce and come to rest */
  ch2Warm();const mats=CH2W.deb;
  for(let i=0;i<22;i++){const m=mesh(rbox(rnd(.05,.28),rnd(.02,.08),rnd(.05,.24),.01),mats[i%3],p.x,p.y,p.z,scene);
    CH2.deb.push({m,v:V3(rnd(-1,1),rnd(.3,1.6),rnd(-1,1)).normalize().addScaledVector(n,.9).multiplyScalar(rnd(5,15)),w:V3(rnd(-9,9),rnd(-9,9),rnd(-9,9)),rest:false,r:.04});}}
function ch2DebrisTick(dt){for(const d of CH2.deb){if(d.rest)continue;d.v.y-=9.8*dt;d.m.position.addScaledVector(d.v,dt);d.m.rotation.x+=d.w.x*dt;d.m.rotation.y+=d.w.y*dt;d.m.rotation.z+=d.w.z*dt;
    const g=H(d.m.position.x,d.m.position.z)+d.r;if(d.m.position.y<g){d.m.position.y=g;if(d.v.y<-1.2){d.v.y*=-.28;d.v.x*=.55;d.v.z*=.55;d.w.multiplyScalar(.5);if(d.big&&sfx.thud)sfx.thud(.25);}else{d.v.set(0,0,0);d.rest=true;
      if(d.flat){d.m.rotation.set(Math.PI/2,0,d.m.rotation.z);d.m.position.y=H(d.m.position.x,d.m.position.z)+.15;}}}}}
/* a burning, scorched wreck: two flame volumes from the hull, a smoke column, sparks, cook-off pops, crackling */
function ch2Burn(){ch2Warm();btr.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh)return;const f=m=>{if(!m||m.userData.burnt)return m;return CH2W.burnt.get(m)||m;};
    o.material=Array.isArray(o.material)?o.material.map(f):f(o.material);});
  CH2W.fl.forEach(fl=>{btr.add(fl);CH2.flames.push(fl);});
  CH2.wreck={t:0,pop:4};}
function ch2WreckTick(dt){const W=CH2.wreck;if(!W)return;W.t+=dt;FIRE.uT.value=S.t%1200;const k=.8+Math.sin(S.t*9.1)*.1+Math.sin(S.t*5.3+1)*.12+(R()-.5)*.08;
  /* the shared light hands over from the blast to the fire */
  CH2.boomT=(CH2.boomT||0)+dt;btr.updateMatrixWorld();const fp=V3(.5,3,0).applyMatrix4(btr.matrixWorld);CH2.L.position.lerp(fp,clamp(CH2.boomT*2,0,1));CH2.L.distance=lerp(45,24,clamp(CH2.boomT*2,0,1));
  CH2.L.color.lerp(C(0xff7a2a),clamp(dt*3,0,1));CH2.L.intensity=Math.max(3.6*k,90*Math.exp(-CH2.boomT*7));CH2.flames.forEach((f,i)=>{f.material.uniforms.uI.value=(.9+.25*k)*(i===0?1.15:1);f.updateMatrixWorld();f.material.uniforms.uCam.value.copy(camera.position);f.worldToLocal(f.material.uniforms.uCam.value);});
  const near=camera.position.distanceTo(btr.position)<160;if(!near)return;
  btr.updateMatrixWorld();const top=V3(.3,2.4,0).applyMatrix4(btr.matrixWorld);
  W.sm=(W.sm||0)+dt*7.5;while(W.sm>1){W.sm--;FX.smoke.spawn(_w.copy(top).add(V3(rnd(-.6,.6),rnd(0,.8),rnd(-.6,.6))),_v.set(rnd(-.25,.25)+.4,rnd(1.8,3.2),rnd(-.25,.25)+.14),rnd(7,10),rnd(1.5,2.4),rnd(6,11),[.06,.055,.05,.88],[.3,.29,.28,0],{drag:.16,up:.14,spin:rnd(-.3,.3),fi:.03});}
  W.em=(W.em||0)+dt*14;while(W.em>1){W.em--;FX.ember.spawn(_w.copy(top).add(V3(rnd(-.8,.8),rnd(-.6,.2),rnd(-.8,.8))),_v.set(rnd(-.6,.6),rnd(2,4.5),rnd(-.6,.6)),rnd(1.2,2.6),.016,.005,[1,.7,.3,1],[1,.25,.05,0],{drag:.4,up:.3});}
  W.pop-=dt;if(W.pop<0){W.pop=rnd(2.5,9);const p=V3(rnd(-1.5,1.5),rnd(1.4,2.2),rnd(-.8,.8)).applyMatrix4(btr.matrixWorld);FX.glow.spawn(p,_w.set(0,0,0),.12,.8,1.6,[1,.8,.5,1],[1,.4,.1,0]);
    for(let i=0;i<24;i++)FX.spark.spawn(p,_v.set(rnd(-1,1),rnd(0,1.5),rnd(-1,1)).multiplyScalar(rnd(4,12)),rnd(.3,.9),.03,.008,[1,.8,.4,1],[1,.3,.05,0],{g:9.8,drag:.5});
    const d=camera.position.distanceTo(p);if(sfx.pop)sfx.pop(clamp(1.4-d/40,.15,1));}
  const d=camera.position.distanceTo(btr.position);if(sfx.crk&&R()<dt*30*clamp(1-d/30,0,1))sfx.crk(clamp(1.2-d/25,.1,1));}
function ch2Ambush(){return{type:'fn',tick(dt,rdt,t,A){const P=CH2.path;
  if(!A.init){A.init=1;A.rt=0;A.s=CH2.drive.s;A.v=CH2.drive.v;const i=Math.min(P.n-1,Math.floor(A.s+44));const rx=-P.TZ[i],rz=P.TX[i];
    let lx=P.X[i]+rx*17,lz=P.Z[i]+rz*17;A.L=V3(lx,H(lx,lz)+.95,lz);CH2.launch=A.L.clone();RIDE.lockLook=true;say('RYABOV','The grass — right side! In the grass!',2.4);}
  A.rt+=rdt;
  /* the BTR drives on until the hit, then slews right off the road into the ditch */
  if(!A.hit){A.s+=A.v*dt;const b=ch2At(P,A.s);ch2Pose(b.x,b.z,b.tx,b.tz,dt);ch2Wheels(A.v,dt);ch2Engine(A.v);A.hx=b.tx;A.hz=b.tz;}
  else ch2Crash(dt);
  /* launch: flash and back-blast in the grass, then slow motion as the rocket comes in */
  if(!A.launched&&A.rt>.95){A.launched=1;const tg=V3(1.85,1.1,1.45).applyMatrix4(btr.matrixWorld);const dir=tg.clone().sub(A.L).normalize();
    /* launch: a hard muzzle flash, the back-blast throwing dust and grass out behind, a white cloud hanging over the spot */
    FX.glow.spawn(A.L,_w.set(0,0,0),.1,2.6,4.5,[1,.9,.7,1],[1,.45,.1,0]);FX.glow.spawn(A.L,_w.set(0,0,0),.25,1.4,2.2,[1,.7,.35,.9],[.8,.3,.05,0]);
    for(let i=0;i<14;i++)FX.flame.spawn(_w.copy(A.L).addScaledVector(dir,-.4),_v.copy(dir).multiplyScalar(-rnd(4,10)).add(V3(rnd(-1,1),rnd(-.2,1),rnd(-1,1))),rnd(.12,.3),rnd(.3,.5),rnd(.8,1.4),[1,.8,.45,1],[.8,.3,.05,0],{drag:3});
    for(let i=0;i<40;i++)FX.dust.spawn(_w.copy(A.L).addScaledVector(dir,-.8),_v.copy(dir).multiplyScalar(-rnd(3,11)).add(V3(rnd(-2,2),rnd(0,2),rnd(-2,2))),rnd(2.5,5),rnd(.6,1.1),rnd(3.5,6),[.62,.58,.5,.85],[.7,.68,.62,0],{drag:1.4,up:.12,spin:rnd(-.5,.5),fi:.01});
    for(let i=0;i<10;i++)FX.smoke.spawn(_w.copy(A.L).add(V3(rnd(-.5,.5),rnd(0,.6),rnd(-.5,.5))),_v.set(rnd(-.4,.4),rnd(.2,.8),rnd(-.4,.4)),rnd(5,8),rnd(.8,1.4),rnd(3,5),[.88,.88,.86,.75],[.9,.9,.9,0],{drag:.6,up:.1,fi:.01});
    A.rk={p:A.L.clone().addScaledVector(dir,.6),d:dir,m:ch2RocketMesh(),tr:0,D:A.L.distanceTo(tg)};sfx.launch();sfx.rocket(2.7);sfx.muffle(900,.2);A.slow=1;}
  S.ts=damp(S.ts===undefined?1:S.ts,A.slow===1?.1:1,A.slow===1?9:30,rdt);
  camera.fov=damp(camera.fov,A.slow===1?48:72,A.slow===1?5:8,rdt);camera.updateProjectionMatrix();
  if(A.rk&&!A.hit){const R_=A.rk,tg=V3(1.85,1.1,1.45).applyMatrix4(btr.matrixWorld);const want=tg.clone().sub(R_.p).normalize();R_.d.lerp(want,clamp(dt*8,0,1)).normalize();
    const step=118*dt,dist0=R_.p.distanceTo(tg);R_.p.addScaledVector(R_.d,Math.min(step,dist0));R_.tr+=step;const sp=_w.copy(R_.p).addScaledVector(R_.d,-.5);const w=Math.sin(R_.tr*2.2)*.05,ww=Math.cos(R_.tr*2.2)*.05;
    R_.m.position.copy(R_.p).add(V3(w,ww,0));R_.m.lookAt(R_.p.clone().add(R_.d));CH2.L.position.copy(R_.p).addScaledVector(R_.d,-.5);CH2.L.distance=10;CH2.L.intensity=2.4+R()*1.6;
    const n=Math.ceil(step/.08);for(let k=0;k<n;k++){const q=sp.clone().addScaledVector(R_.d,-k*.08);FX.smoke.spawn(q,_v.set(rnd(-.2,.2),rnd(-.05,.25),rnd(-.2,.2)),rnd(3,4.5),rnd(.28,.42),rnd(1.2,2.1),[.9,.89,.86,.75],[.92,.92,.91,0],{drag:1.1,up:.08,spin:rnd(-1,1),fi:.005});}
    FX.glow.spawn(sp,_w.set(0,0,0),.04,.7,.35,[1,.85,.5,1],[1,.45,.1,0]);FX.flame.spawn(sp,_v.copy(R_.d).multiplyScalar(-6),.03,.25,.1,[1,.8,.4,1],[1,.4,.1,0]);
    if(step>=dist0-.7||R_.p.distanceTo(tg)<.7){A.hit=1;A.hitT=A.rt;scene.remove(R_.m);A.slow=0;S.ts=1;ch2Hit(A,tg);}}
  /* camera: on the deck until the hit, looking at the launcher, then following the rocket in */
  if(!A.hit){const look=A.rk?A.rk.p:A.L;const base=btr.rotation.y-Math.PI/2;const d=look.clone().sub(camera.position);const wantY=Math.atan2(-d.x,-d.z)-base;
    let dy=wantY-RIDE.look;dy=Math.atan2(Math.sin(dy),Math.cos(dy));RIDE.look+=dy*clamp(rdt*(A.rk?5:3.2),0,1);RIDE.fy=damp(RIDE.fy,0,6,rdt);RIDE.fp=damp(RIDE.fp,0,6,rdt);
    btr.updateMatrixWorld(true);camera.position.copy(SEAT).applyMatrix4(btr.matrixWorld);const pt=Math.atan2(d.y,Math.hypot(d.x,d.z));camera.rotation.set(damp(camera.rotation.x,pt,4,rdt),base+RIDE.look,-BP.r*.6);}
  else if(A.rt-A.hitT<.16){const sh=1-(A.rt-A.hitT)/.16;camera.position.x+=(R()-.5)*.12*sh;camera.position.y+=(R()-.5)*.12*sh;camera.rotation.z+=(R()-.5)*.05*sh;if(A.th)A.th.p.copy(camera.position);}
  else ch2Thrown(dt,rdt,A);
  CH2.post.flash=Math.max(0,CH2.post.flash-rdt*4.5);
  if(A.hit){const k=A.rt-A.hitT;CH2.post.blur=lerp(.25,.55,clamp(k/2,0,1));$('fade').style.transition='none';postMat.uniforms.uFade.value=clamp((k-2.1)/.9,0,1);}
  return A.hit&&A.rt-A.hitT>3.3;}};}
function ch2Hit(A,tg){$('sub').innerHTML='';sayT=0;const n=V3(0,0,1).transformDirection(btr.matrixWorld);ch2Explode(tg.clone().addScaledVector(n,.3),n);sfx.boom();sfx.tin(1,.05);sfx.muffle(320,.08);
  CH2.post.flash=1;S.sinceDmg=0;S.hp=Math.max(30,S.hp-45);
  riders.forEach(r=>r.root.visible=false);cmdr.root.visible=false;
  /* the struck front wheel tears off and flies */
  btr.updateMatrixWorld(true);let best=null,bx=-1e9;btr.userData.wheels.forEach(w=>{const p=btr.worldToLocal(w.getWorldPosition(V3()));if(p.z>.3&&p.x>bx){bx=p.x;best=w;}});
  if(best){best.userData.torn=true;scene.attach(best);CH2.deb.push({m:best,v:n.clone().multiplyScalar(7.5).add(V3(A.hx*A.v*.5,6.5,A.hz*A.v*.5)),w:V3(rnd(-4,4),rnd(-4,4),rnd(-6,6)),rest:false,r:.55,big:true,flat:true});}
  ch2Burn();
  A.cr={v:A.v,hx:A.hx,hz:A.hz,x:btr.position.x,z:btr.position.z,t:0};BP.vy+=1.6;BP.vr-=1.4;BP.vp+=.5;
  /* the player is thrown off the far side of the deck */
  const fwd=V3(A.hx,0,A.hz),left=V3(A.hz,0,-A.hx);
  A.th={p:camera.position.clone(),v:fwd.clone().multiplyScalar(A.v*.55).addScaledVector(left,5.2).add(V3(0,4.4,0)),e:camera.rotation.clone(),w:V3(-1.3,1.1,3.8),hits:0,rest:false};}
/* the hull slews right (the struck side) into the ditch, bleeding off speed */
function ch2Crash(dt){const A=CH2.amb;if(!A||!A.cr)return;const c=A.cr;if(c.done)return;c.t+=dt;
  const rx=-c.hz,rz=c.hx;const turn=clamp(dt*(c.t<1.4?.55:.15),0,1);c.hx+=rx*turn;c.hz+=rz*turn;const l=Math.hypot(c.hx,c.hz);c.hx/=l;c.hz/=l;
  c.v=Math.max(0,c.v-dt*(c.t<.4?7:4.6));c.x+=c.hx*c.v*dt;c.z+=c.hz*c.v*dt;ch2Pose(c.x,c.z,c.hx,c.hz,dt);ch2Wheels(c.v,dt);if(sfx.engine)sfx.engine.gain.value=Math.max(0,sfx.engine.gain.value-dt*.3);
  if(c.v<=0&&c.t>2){c.done=1;S.btrWrecked=true;btrSolid.x1=btrSolid.x2=btrSolid.z1=btrSolid.z2=-9999;
    [-2.3,0,2.3].forEach(o=>solids.push({cx:c.x+c.hx*o,cz:c.z+c.hz*o,r:1.55}));}}
function ch2Thrown(dt,rdt,A){const th=A.th;if(!th)return;
  if(!th.rest){th.v.y-=9.8*dt;th.p.addScaledVector(th.v,dt);th.e.x+=th.w.x*dt;th.e.y+=th.w.y*dt;th.e.z+=th.w.z*dt;
    const g=H(th.p.x,th.p.z)+.22;if(th.p.y<g){th.p.y=g;th.hits++;sfx.thud(th.hits===1?1:.5);CH2.post.flash=Math.max(CH2.post.flash,th.hits===1?.25:.1);S.sinceDmg=0;
      th.v.y=-th.v.y*.22;th.v.x*=.42;th.v.z*=.42;th.w.multiplyScalar(.35);if(th.hits>=2||th.v.length()<1.2){th.rest=true;th.v.set(0,0,0);}}}
  else{/* on the ground, on your side: the head rolls toward the burning wreck before everything goes dark */
    const d=btr.position.clone().sub(th.p);const yt=Math.atan2(-d.x,-d.z);let dy=yt-th.e.y;dy=Math.atan2(Math.sin(dy),Math.cos(dy));th.e.y+=dy*clamp(dt*2.2,0,1);
    th.e.x=damp(th.e.x,.06,2.5,dt);th.e.z=damp(th.e.z,1.22,2.5,dt);th.p.y=damp(th.p.y,H(th.p.x,th.p.z)+.3,4,dt);}
  camera.position.copy(th.p);camera.rotation.set(th.e.x,th.e.y,th.e.z);CH2.land=th.p.clone();CH2.landYaw=th.e.y;}
/* ---------- black, then the wake-up ---------- */
function ch2Black(){return{type:'fn',dur:8,lines:[[1.6,'RADIO','…one-two-one… Kurgan… one-two-one, respond…',3.2],[4.9,'BELOV','…can\'t feel my legs… somebody… lads…',3]],
  tick(dt,rdt,t,L){if(!L.init){L.init=1;L.hb=0;postMat.uniforms.uFade.value=1;ch2Aftermath();sfx.tin(.55,1.5);sfx.muffle(240,.5);}
    ch2Crash(dt);L.hb+=rdt;if(L.hb>1.25){L.hb=0;sfx.heart();}return t>=L.dur;}};}
const LIDK=[[0,0],[1.3,0],[1.8,.22],[2.5,.2],[2.8,0],[3.6,0],[4.6,.5],[5.7,.47],[6.0,.07],[6.4,.1],[7.6,1]];
function ch2Lids(o){const el=$('lids');el.style.display=o>=.999?'none':'block';if(o>=.999)return;
  /* like real lids: the gap opens from the middle out to the corners; the upper lid lifts further than the lower one drops,
     so the opening rides up a little as it widens; its edge stays soft (lashes, tears, out of focus) */
  const u=clamp(o,0,1),ry=Math.max(.05,Math.pow(u,.85)*78),rx=lerp(58,118,Math.pow(u,.6)),cy=lerp(53,47,u),soft=lerp(55,30,u);
  el.style.background=`radial-gradient(ellipse ${rx}% ${ry}% at 50% ${cy}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${100-soft}%, rgba(0,0,0,.9) ${100-soft*.25}%, #000 100%)`;}
function ch2Wake(){return{type:'fn',lines:[[9.6,'MOROZOV','…Sergeant!… Over here… don\'t go near the fire…',4]],tick(dt,rdt,t,L){if(!L.init){L.init=1;L.rt=0;const lp=CH2.land||camera.position.clone();L.p=V3(lp.x,0,lp.z);
      const d=btr.position.clone().sub(L.p);L.yaw=Math.atan2(-d.x,-d.z);RIDE.lockLook=true;ch2Lids(0);postMat.uniforms.uFade.value=0;S.where='highway';}
    L.rt+=rdt;const k=L.rt;let o=0;for(let i=1;i<LIDK.length;i++)if(k<=LIDK[i][0]){const a=LIDK[i-1],b=LIDK[i];o=lerp(a[1],b[1],ease.io((k-a[0])/(b[0]-a[0])));break;}if(k>LIDK[LIDK.length-1][0])o=1;ch2Lids(o);
    CH2.post.blur=k<6?1:lerp(1,.45,clamp((k-6)/7,0,1));CH2.post.dbl=k<6?.9:lerp(.9,.3,clamp((k-6)/7,0,1));CH2.post.desat=lerp(.75,.4,clamp(k/13,0,1));
    sfx.tin(lerp(.5,.2,clamp(k/13,0,1)),.5);sfx.muffle(lerp(260,1100,clamp(k/13,0,1)),.5);
    const gy=H(L.p.x,L.p.z);const br=Math.sin(k*1.7)*.012;
    const sit=ease.io(clamp((k-7.6)/2.4,0,1)),stand=ease.io(clamp((k-10.6)/2.4,0,1));if(k>10.5&&CH2.capUp&&CH2.capUp.t<0)CH2.capUp.t=0;
    camera.position.set(L.p.x+Math.sin(k*1.3)*.03*stand,gy+lerp(lerp(.2,.92,sit),1.64,stand)+br,L.p.z);
    camera.rotation.set(lerp(lerp(.42,-.2,sit),-.06,stand)+Math.sin(k*.9)*.02,L.yaw+lerp(.45,0,sit)+Math.sin(k*.6)*.04,lerp(lerp(1.15,.12,sit),0,stand)+Math.sin(k*1.1)*.03*(1-stand));
    return k>13.2;}};}
/* bodies, the spent launcher, interactions */
function ch2Body(char,x,z,ry,poseK,rx,name,text){const c=buildHuman({char,outfit:'ratnik',vest:true,helmet:true});pose(c,POSE[poseK]);const w=new T.Group();w.position.set(x,0,z);w.rotation.y=ry;scene.add(w);c.root.rotation.x=rx;w.add(c.root);
  restOn(c,H(x,z)+.005,w);if(BAKED[poseK+'_'+char]){pose(c,BAKED[poseK+'_'+char]);}else settleBody(c,(a,b)=>H(a,b)+.005);restOn(c,H(x,z)+.005,w);(CH2.bodies||(CH2.bodies=[])).push({c,key:poseK+'_'+char});w.updateMatrixWorld(true);{const sp=c.P.spine.getWorldPosition(new T.Vector3()),hd=c.P.head.getWorldPosition(new T.Vector3());const bx=(sp.x+hd.x)/2,bz=(sp.z+hd.z)/2;const e2=.5,gx=H(bx+e2,bz)-H(bx-e2,bz),gz=H(bx,bz+e2)-H(bx,bz-e2),gl=Math.hypot(gx,gz);
    groundBlood('pool',char.length*7+3,bx,bz,1.25,1.45,gl>1e-3?V3(-gx/gl,0,-gz/gl):V3(Math.sin(ry),0,Math.cos(ry)),H);}
  interact.push({obj:w,off:V3(0,.4,0),r:2.2,label:'Check '+name,once:true,fn(){say(name.toUpperCase(),text,6.5);CH2.checked[name]=1;ch2CheckDone();}});return w;}
function ch2Aftermath(){/* finish the crash if it is still sliding */
  const A=CH2.amb;if(A&&A.cr&&!A.cr.done)for(let i=0;i<600&&!A.cr.done;i++)ch2Crash(.02);
  for(let i=0;i<400;i++)ch2DebrisTick(.02);
  const P=CH2.path,b=ch2At(P,A&&A.s?A.s+4:P.sAmb),lx=b.tz,lz=-b.tx;   /* left of the direction of travel */
  /* the riders were thrown off the same side as you: one ahead of you on the road, one behind you in the grass */
  const ld=CH2.land||V3(b.x+lx*4,0,b.z+lz*4);
  const r1=V3(ld.x+b.tx*5.2-lx*1.6,0,ld.z+b.tz*5.2-lz*1.6),r2=V3(ld.x-b.tx*4.2+lx*3.8,0,ld.z-b.tz*4.2+lz*3.8);
  ch2Body('guard5',r1.x,r1.z,Math.atan2(b.tx,b.tz)+.8,'faceDown',Math.PI/2,'Ryabov','Face down on the asphalt. The blast caught him across the back. No pulse.');
  ch2Body('guard2',r2.x,r2.z,Math.atan2(b.tx,b.tz)-1.1,'onBack',-Math.PI/2,'Belov','On his back in the grass, still warm. He crawled this far on his own. You were minutes too late.');
  /* Captain Morozov was inside, up in the commander's hatch. He got out through it after the hit, slid down the left side
     of the hull and dragged himself across the road into the ditch where you landed - a smeared trail from the wreck to
     where he lies now, a few metres from you, pressing gauze into his thigh */
  {const hz=s_=>{const q=roadQuery(s_.x,s_.z);return q.dH;};const bp=btr.position;let best=null,bs=1e9;
   for(let rr_=2.6;rr_<=4.6;rr_+=.4)for(let a=0;a<6.28;a+=.26){const x=ld.x+Math.cos(a)*rr_,z=ld.z+Math.sin(a)*rr_;const q=roadQuery(x,z);if(q.dH<4.6)continue;
     const sc=H(x,z)+.05*Math.hypot(x-ld.x,z-ld.z)+.02*Math.hypot(x-bp.x,z-bp.z);if(sc<bs){bs=sc;best=V3(x,0,z);}}
   if(!best)best=V3(ld.x+lx*2.8,0,ld.z+lz*2.8);
   /* feet toward the road, head up the outer bank */
   const e=.6,g0=hz(best),gx=(hz(V3(best.x+e,0,best.z))-g0)/e,gz=(hz(V3(best.x,0,best.z+e))-g0)/e,gl=Math.hypot(gx,gz)||1;const f=V3(-gx/gl,0,-gz/gl);
   ch2Captain(best,f);ch2Trail(best,f);}
  placeItem({id:'ak',x:r1.x+lx*.9,y:H(r1.x+lx*.9,r1.z+lz*.9),z:r1.z+lz*.9,data:{id:'ak',inMag:23},rot:[0,rnd(6.28),Math.PI/2]});
  placeItem({id:'ammo545',x:r2.x+.6,y:H(r2.x+.6,r2.z-.4),z:r2.z-.4});placeItem({id:'bandage',x:r2.x-.5,y:H(r2.x-.5,r2.z+.5),z:r2.z+.5});
  /* the spent tube where the shot came from */
  if(CH2.launch){const L=CH2.launch;const g=new T.Group();g.position.set(L.x+.4,H(L.x+.4,L.z)+.06,L.z);g.rotation.set(0,rnd(6.28),Math.PI/2);scene.add(g);
    const tb=new T.CylinderGeometry(.036,.036,.78,14,1,true);mesh(tb,std({color:C(0x4b5236),roughness:.7,side:T.DoubleSide}),0,0,0,g);mesh(new T.CylinderGeometry(.044,.044,.05,14),M.black,0,.36,0,g);mesh(new T.CylinderGeometry(.044,.044,.05,14),M.black,0,-.36,0,g);
    interact.push({obj:g,off:V3(),r:2,label:'Inspect the spent launcher',once:true,fn(){say('','RPG-26, single shot — fired from here, then dropped. The markings are ground off. The grass is pressed flat in a line toward the trees.',7);}});}
  interact.push({obj:btr,off:V3(0,1.4,0),r:5.5,label:'BTR-80 «121» · burning',fn(){say('','The driver\'s hatch is jammed and the hull is burning from the inside. Lukin does not answer.',5.5);CH2.checked.btr=1;ch2CheckDone();}});}
/* the survivor: Captain Morozov got out through the commander's hatch, tied off the shrapnel wound in his left thigh with
   a field dressing and a tourniquet, and is on his feet beside the ditch - weight on the good leg, rifle at low ready,
   pale and bloodied, leaning away from the wound. He will walk, badly. */
function ch2Captain(P0,f){const c=CD.chars.guard1,e=c.fit.eye;
  const h=buildHuman({char:'guard1',outfit:'ratnik',vest:true,helmet:true,uniqMat:true,tint:[.9,.87,.86]});h.name='guard1';
  h.root.updateMatrixWorld(true);const BN=h.P.bones,loc=b=>h.root.worldToLocal(BN[b].getWorldPosition(new T.Vector3()));
  const pos=deq(c.pos);const surf=(x_,y_)=>{let zz=-9;for(let i=0;i<pos.length;i+=3)if(Math.abs(pos[i]-x_)<.008&&Math.abs(pos[i+1]-y_)<.008&&pos[i+2]>zz)zz=pos[i+2];return zz;};
  const fs=(dx,dy,r,dr)=>[e[0]+dx,e[1]+dy,surf(e[0]+dx,e[1]+dy),r,dr];
  const hp=loc('hpR'),kn=loc('knR'),sp=loc('spine'),wl=loc('wrL'),wr=loc('wrR'),th=t=>hp.clone().lerp(kn,t).add(V3(0,0,.045));
  const T1=th(.52),T2=th(.72),T3=th(.95);
  /* dried and fresh blood: a cut at the temple run down the cheek, the trouser leg soaked from the dressing down past the
     knee, bloody gloves from working on the wound */
  const blood=[fs(.04,.045,.024,.3),fs(.056,.01,.02,.32),fs(.05,-.035,.016,.45),
    [T1.x,T1.y,T1.z,.1,.45],[T2.x,T2.y,T2.z,.09,.5],[T3.x,T3.y,T3.z,.06,.7],[T1.x,T1.y-.02,T1.z-.08,.08,.5],[wl.x,wl.y-.05,wl.z,.06,1],[wr.x,wr.y-.05,wr.z,.06,1]];
  h.P.uniqMats.forEach((m,i)=>bloodPatch(m,blood,'cap'+i));
  /* the field dressing and the tourniquet above it (no head bandage) */
  {const D=woundDress(h);if(D.hb){D.hb.parent.remove(D.hb);}
   if(D.dg)D.dg.traverse(m=>{if(m.isMesh){m.material=m.material.clone();m.material.color=C(0xa88276);}});}
  const ld=CH2.land||P0;const g=new T.Group();g.position.set(P0.x,H(P0.x,P0.z),P0.z);g.rotation.y=Math.atan2(ld.x-P0.x,ld.z-P0.z);scene.add(g);g.add(h.root);
  /* he is sitting in the grass when you come round - he watches you get up, then gets up himself (see ch2CapTick) */
  if(!AP.capSit)AP.capSit=Object.assign({},AP.woundedSit,{hold:AP.woundStand.hold});
  const an=animate(h,{pose:'capSit',gun:npcAK()});an.o.hands=a=>ch2CapLook(a);
  CH2.captain=h;CH2.capG=g;CH2.capAn=an;CH2.capUp={t:-1,base:g.position.clone(),yaw:g.rotation.y};CH2.capLook=1;
  /* a few drops where he stood tying off the leg */
  groundBlood('drops',78,P0.x+.2,P0.z+.1,.5,.9,f,H,{lift:.026});
  interact.push({obj:g,off:V3(0,1.3,0),r:2.6,label:'Talk to Captain Morozov',once:true,fn(){CH2.checked.Morozov=1;
    const L=[['CAPTAIN MOROZOV','Sergeant. Easy, I am fine — shrapnel in the leg, it is tied off. I got out through my hatch before the fire took it.',6.2],
      ['CAPTAIN MOROZOV','Lukin\'s hatch would not open. Ryabov, Belov… no. It is us two.',5],
      ['CAPTAIN MOROZOV','Wait. Let me raise someone on the handset.',3.6]];
    let t=0;L.forEach(l=>{setTimeout(()=>say(l[0],l[1],l[2]),t*1000);t+=l[2]+.3;});setTimeout(()=>{if(typeof ch3Comms==='function')ch3Comms();else ch2CheckDone();},t*1000);}});}
/* the way he came: drops of blood from the open hatch, down the hull and across the road to where he stands */
/* his head turns to follow you (a little, then the whole head as you come round to his side) */
function ch2CapLook(an){if(!(CH2.capLook>0))return;const g=CH2.capG,B=an.B;const d=camera.position.clone().sub(g.position);let a=Math.atan2(d.x,d.z)-g.rotation.y;a=Math.atan2(Math.sin(a),Math.cos(a));
  const k=CH2.capLook,ya=clamp(a,-1.3,1.3)*k;const pit=Math.atan2(d.y-1.0,Math.hypot(d.x,d.z))*k;B.neck.rotation.y+=ya*.4;B.head.rotation.y+=ya*.55;B.head.rotation.x-=clamp(pit,-.5,.4)*.6;B.neck.rotation.x-=clamp(pit,-.5,.4)*.25;}
/* getting up: onto a knee, then up on the good leg - he lurches, catches himself on the next step, and stands at low ready */
function ch2CapTick(dt){const U=CH2.capUp;if(!U||U.t<0||U.done||!CH2.capG)return;U.t+=dt;const g=CH2.capG,an=CH2.capAn,t=U.t;
  if(t>0&&!U.k){U.k=1;an.go('kneel',.95);}
  if(t>1.05&&!U.s){U.s=1;an.go('woundStand',.75);sfx.step&&sfx.stepAt&&sfx.stepAt(g.position.clone().add(V3(0,.1,0)),'grass',1.2);}
  /* the stumble: weight goes over the bad leg, a lurch forward and sideways, a catch-step, then upright */
  const f=V3(Math.sin(U.yaw),0,Math.cos(U.yaw)),r=V3(Math.cos(U.yaw),0,-Math.sin(U.yaw));const u=clamp((t-1.2)/1.4,0,1);
  const lurch=Math.sin(u*Math.PI)*(1-u*.4),side=Math.sin(u*Math.PI*1.6)*(1-u);
  g.position.copy(U.base).addScaledVector(f,.32*lurch+.18*sstep(1.3,2.6,t)).addScaledVector(r,-.12*side);g.position.y=H(g.position.x,g.position.z);
  g.rotation.set(.16*lurch,U.yaw+.12*side,-.1*side);
  if(t>1.55&&!U.c){U.c=1;sfx.stepAt&&sfx.stepAt(g.position.clone(),'grass',2.2);}
  if(t>2.9){U.done=1;g.rotation.set(0,U.yaw,0);U.base.copy(g.position);}}
function ch2Trail(P0,f){btr.updateMatrixWorld(true);
  const A=V3(2.0,0,-1.75).applyMatrix4(btr.matrixWorld);A.y=0;const B=P0.clone();B.y=0;
  const D=B.clone().sub(A),len=D.length();D.normalize();const side=V3(-D.z,0,D.x);
  for(let s=0,k=0;s<len-.3;s+=rnd(1.4,2.4),k++){const c=A.clone().addScaledVector(D,s+.4).addScaledVector(side,Math.sin(s*.9+1)*.18);groundBlood('drops',310+k,c.x,c.z,.35,.9,D,H,{lift:.024+k*.0003});}}
function ch2CheckDone(){if(CH2.checked.Morozov&&!CH2.done2){CH2.done2=1;setTimeout(()=>{say('RADIO · R-187','…static. Nobody answers on the battalion net.',4.5);
  setObj('Get off the road before whoever fired comes back. Head south on foot to the Lesnoye crossroads, 4 km — bring help for Morozov.');setTimeout(()=>{if(typeof saveGame==='function')saveGame(false);},800);},2500);}}
/* ---------- chapter entry ---------- */
function rideReinforce(o={}){S.chapter=2;if(typeof unparkRegion==='function')['west','fob','sector'].forEach(unparkRegion);S.btrHere=false;setBoard(null);if(SHADOW.on){SHADOW.on=false;if(SHADOW.m)SHADOW.m.visible=false;}
  CH2.path=CH2.path||ch2Path();const P=CH2.path;
  const legs=[];if(!o.skip)legs.push(ch2Mount());CH2.drive=o.s!==undefined?{s:o.s,v:Math.min(P.V[Math.floor(o.s)],12)}:{s:0,v:0};
  const [LA,LB]=ch2Lines(P,P.sCard,P.sJump);
  if(CH2.drive.s<P.sCard)legs.push(ch2Drive(P.sCard,LA),ch2Load(P.sJump));
  if(o.skip)ch2Warm();legs.push(ch2Drive(P.sAmb,LB));const amb=ch2Ambush();CH2.amb=amb;legs.push(amb,ch2Black(),ch2Wake());
  startRide(legs);RIDE.lockLook=false;S.ts=1;
  RIDE.done=()=>{RIDE.lockLook=false;S.ts=1;ch2Lids(1);player.pos.set(camera.position.x,0,camera.position.z);player.y=H(player.pos.x,player.pos.z);player.yaw=camera.rotation.y;player.pitch=camera.rotation.x;player.vel.set(0,0,0);
    S.hp=38;S.sanity=Math.max(12,S.sanity-30);S.stam=35;CH2.rec=0;setObj('Check on the crew.');};}
/* per-frame: wreck fire, debris, the slow recovery from the concussion, fire damage, the idling BTR in chapter 1 */
function ch2Tick(dt,rdt){ch2DebrisTick(dt);ch2WreckTick(dt);ch2CapTick(rdt);smoulderTick(dt);
  if(CH2.rec>=0&&S.state==='play'){CH2.rec+=rdt;const k=clamp(CH2.rec/28,0,1);CH2.post.blur=lerp(.45,0,k);CH2.post.dbl=lerp(.3,0,clamp(CH2.rec/18,0,1));CH2.post.desat=lerp(.4,0,k);
    sfx.tin(lerp(.2,0,clamp(CH2.rec/24,0,1)),.5);sfx.muffle(lerp(1100,20000,Math.pow(clamp(CH2.rec/20,0,1),2)),.6);if(k>=1)CH2.rec=-1;}
  if(S.btrWrecked&&S.state==='play'&&Math.hypot(player.pos.x-btr.position.x,player.pos.z-btr.position.z)<3.4){S.hp-=dt*9;S.sinceDmg=0;}
  if(S.btrHere&&S.state==='play'&&sfx.engine){const d=btr.position.distanceTo(camera.position);sfx.engine.gain.value=.11*clamp(1-d/55,0,1);if(sfx.engineO)sfx.engineO.frequency.value=29+Math.sin(S.t*.7)*.6;}
  const U=postMat.uniforms,p=CH2.post;U.uBlur.value=p.blur;U.uDbl.value=p.dbl;U.uDesat.value=p.desat;U.uFlash.value=p.flash;}
window.__ch2={SMOULDER,smoulderTick,fxUpdate,ch2Pose,ch2At,ch2SeatCam,ch2CapTick,CH2,ch2Trail,rideReinforce,ch2Path,ch2Offload,ch2Aftermath,ch2Captain,ROADS,dbg:{grassDens,H,Hterr,tallGrass,roadQuery,forestF,groundMix}};
