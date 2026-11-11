HIPOLY=true;if(location.hash.includes('bklog'))window.__bkLog=[];
/* ---------- chapter 3 country, built at boot: the flooded basin's water and what floats on it, reeds round the pools,
   the old district road with its poles and a bus shelter, the warning sign where the track drops into the basin, the
   hunters' clearing, the lumber yard on the far shore that the separatists have made into an outpost ---------- */
const WEST={reeds:[],bob:[],cover:[],spots:{},t:0};
const WR=rng(31337),wr=(a,b)=>a+(b-a)*WR();
/* end grain for sawn log ends: growth rings round an off-centre pith, radial checks, a dark bark ring */
/* (TX.endgrain is drawn in 07zh_logs) */
/* woodland camouflage: four colours in soft-edged blobs, printed on canvas */
const TXcamo=tex(512,512,(g,w,h)=>{g.fillStyle='#6b6a4a';g.fillRect(0,0,w,h);const r=rng(4141);
  [['#4a5233',70],['#3a2f22',55],['#1d1f17',40]].forEach(([c,n])=>{g.fillStyle=c;for(let i=0;i<n;i++){const x=r()*w,y=r()*h,rx=18+r()*46,ry=10+r()*26,a=r()*6.28;
    for(const ox of [0,-w,w])for(const oy of [0,-h,h]){g.beginPath();for(let k=0;k<=14;k++){const t=k/14*6.28,rr_=1+.35*Math.sin(t*3+i)+.2*Math.sin(t*5+i*2);g.lineTo(x+ox+Math.cos(t+a)*rx*rr_,y+oy+Math.sin(t+a)*ry*rr_);}g.fill();}}});
  const im=g.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const n=(r()-.5)*14;d[i]+=n;d[i+1]+=n;d[i+2]+=n;}g.putImageData(im,0,0);});
const WM={log:std({map:PB.logs.a,normalMap:PB.logs.n,roughnessMap:PB.logs.r,roughness:1,color:C(0xa49c90),normalScale:new T.Vector2(1.2,1.2),envMapIntensity:.25}),
  bark:std({map:TX.bark,color:C(0xb4a894),roughness:1,envMapIntensity:.2}),end:std({map:TX.endgrain,color:C(0x7c705f),roughness:1,envMapIntensity:.12}),
  board:std({map:PB.boards.a,normalMap:PB.boards.n,roughnessMap:PB.boards.r,roughness:1,color:C(0x948c80),envMapIntensity:.25,side:T.DoubleSide}),
  plank:std({map:PB.planks.a,normalMap:PB.planks.n,roughnessMap:PB.planks.r,roughness:1,color:C(0x8c8478),envMapIntensity:.25}),
  rust:std({map:PB.rust.a,normalMap:PB.rust.n,roughnessMap:PB.rust.r,roughness:1,metalness:.4,envMapIntensity:.6,side:T.DoubleSide}),
  corr:std({map:PB.corrug.a,normalMap:PB.corrug.n,roughnessMap:PB.corrug.r,roughness:1,metalness:.35,envMapIntensity:.6,side:T.DoubleSide}),
  conc:std({map:PB.concrete.a,normalMap:PB.concrete.n,roughnessMap:PB.concrete.r,roughness:1,envMapIntensity:.3}),
  canvas:std({map:PB.canvas.a,normalMap:PB.canvas.n,roughnessMap:PB.canvas.r,roughness:1,color:C(0x8a8a6e),side:T.DoubleSide,envMapIntensity:.25}),
  camo:std({map:TXcamo,normalMap:PB.canvas.n,roughness:.95,side:T.DoubleSide,envMapIntensity:.2}),
  stone:std({color:C(0x4e4b44),roughness:.92,envMapIntensity:.25}),char:std({color:C(0x161412),roughness:.95}),
  ember:std({color:C(0x1a0e08),emissive:C(0xff5a14),emissiveIntensity:1.6,roughness:.9}),tar:std({color:C(0x232321),roughness:.85,side:T.DoubleSide,envMapIntensity:.4})};
/* sawn end grain drinks the rain: it darkens, it never turns glossy (a wet, mirror-bright disc facing the torch read as white) */
WM.end.defines.DRY_MATTE='';
/* a log as two parts (bark side, sawn ends) so the ends show their rings */
/* (sawn-log texture: grain runs along u, so u goes along the log; bark textures run along v) */
function logGeo(r,L,seg=12,alongU=false){const rr_=r*1.03;seg=Math.max(seg,rr_>=.19?24:rr_>=.11?18:14);const s=new T.CylinderGeometry(r,r*1.03,L,seg,1,true);{const uv=s.attributes.uv;for(let i=0;i<uv.count;i++){const a=uv.getX(i)*r*6.28/1.4,b=uv.getY(i)*L/1.4;if(alongU)uv.setXY(i,b*.6,a);else uv.setXY(i,a,b);}}
  const e=new T.CircleGeometry(r*1.01,seg);const ea=e.clone().rotateX(-Math.PI/2).translate(0,L/2,0),eb=e.clone().rotateX(Math.PI/2).translate(0,-L/2,0);return{s,e:[ea,eb]};}
/* collect geometry per material and flush as one mesh each */
function bucket(){const B=new Map();return{add(g,m,mat4){const q=g.index?g.toNonIndexed():g.clone();if(mat4)q.applyMatrix4(mat4);if(window.__bkLog){q.computeBoundingBox();window.__bkLog.push(q.boundingBox.clone());}if(!B.has(m))B.set(m,[]);B.get(m).push(q);},
  flush(par,shoot=true){const out=[];B.forEach((gs,m)=>{const g=mergeAttrs(gs.map(q=>{if(!q.attributes.wear)q.setAttribute('wear',new T.BufferAttribute(new Float32Array(q.attributes.position.count),1));if(!q.attributes.uv)q.setAttribute('uv',new T.BufferAttribute(new Float32Array(q.attributes.position.count*2),2));return q;}));
    const x=new T.Mesh(g,m);x.castShadow=true;x.receiveShadow=true;(par||scene).add(x);if(shoot)shootables.push(x);out.push(x);});B.clear();return out;}};}
const _m4=new T.Matrix4(),_q4=new T.Quaternion(),_e4=new T.Euler();
function TRS(x,y,z,rx=0,ry=0,rz=0,s=1){return new T.Matrix4().compose(V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ')),V3(s,s,s));}
/* an instancing bucket: many copies of one geometry with one material become one InstancedMesh (one draw call, one copy
   of the vertices), its bounds fitted round all its copies so it culls and streams properly */
function ibucket(){const B=new Map();return{add(g,m,mat4){const k=g.uuid+'|'+m.uuid;if(!B.has(k))B.set(k,{g,m,L:[]});B.get(k).L.push(mat4.clone());},
  flush(par,cast=true){const out=[];for(const {g,m,L} of B.values()){const ig=new T.BufferGeometry();ig.index=g.index;for(const a in g.attributes)ig.setAttribute(a,g.attributes[a]);
      const im=new T.InstancedMesh(ig,m,L.length);const bb=new T.Box3(),v=V3();if(!g.boundingSphere)g.computeBoundingSphere();const pr=g.boundingSphere.radius*1.5;
      L.forEach((M4,i)=>{im.setMatrixAt(i,M4);v.setFromMatrixPosition(M4);bb.expandByPoint(v);});im.instanceMatrix.needsUpdate=true;
      ig.boundingSphere=new T.Sphere(bb.getCenter(V3()),bb.getSize(V3()).length()/2+pr);ig.boundingBox=bb.clone().expandByScalar(pr);im.castShadow=cast;im.receiveShadow=true;(par||scene).add(im);out.push(im);}B.clear();return out;}};}
/* turn a surface inside out (for the inner wall of a pipe) */
function flipIn(g){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i+1];ix[i+1]=ix[i+2];ix[i+2]=t;}const n=g.attributes.normal;for(let i=0;i<n.count;i++)n.setXYZ(i,-n.getX(i),-n.getY(i),-n.getZ(i));return g;}
/* a trunk snapped across: the torn face of pale fresh wood and a ring of long splinters standing off it, some with their
   bark still on. M4 places it; y0 is the break's height along the local up axis, the splinters point up that axis */
let _SPLW=null;const SPLW=()=>_SPLW||(_SPLW=std({map:PB.planks.a,normalMap:PB.planks.n,color:C(0xe8d8b4),roughness:.95,envMapIntensity:.2}));
/* a trunk snapped by a shell, standing: bark round a slightly irregular, tapering trunk; the top torn in a jagged break -
   a long tongue of wood left standing up on one side where the fibres held, the rest broken lower and ragged - the pale
   raw wood of the break across it and shards standing out of it. M4 places the trunk's foot; r0 at the foot, r1 at the
   top, h the height of the tongue's tip. */
function snagParts(bk,M4,r0,r1,h,rnd_,bark){const rr=(a,b)=>a+(b-a)*rnd_();const rs=16,hs=Math.max(3,Math.round(h/.45));
  const g=new T.CylinderGeometry(1,1,h,rs,hs,true);g.translate(0,h/2,0);const P=g.attributes.position,U=g.attributes.uv;
  const ph=rr(0,6.28),ph2=rr(0,6.28),tongue=rr(0,6.28),tw=rr(.45,1.0),jag=Math.min(h*.22,rr(.25,.6));
  const topY=a=>{const da=Math.abs(((a-tongue+9.42)%6.283)-3.14);return h-jag*(1-Math.exp(-da*da/(tw*tw)))-Math.abs(Math.sin(a*4+ph))*jag*.22;};
  for(let i=0;i<P.count;i++){const x=P.getX(i),y=P.getY(i),z=P.getZ(i),a=Math.atan2(z,x),t=y/h;const rad=lerp(r0,r1,t)*(1+.05*Math.sin(a*2+ph)+.03*Math.sin(a*5+ph2+t*4)+.02*Math.sin(t*h*3+ph));
    const yy=t>.999?topY(a):Math.min(y,topY(a));P.setXYZ(i,Math.cos(a)*rad,yy,Math.sin(a)*rad);U.setXY(i,U.getX(i)*2,yy/.8);}
  g.computeVertexNormals();bk.add(g,bark,M4);
  /* the break across the top: a fan from a low centre up to the torn rim, fibrous and pale */
  {const pos=[],uv=[],cy=h-jag*1.05;for(let k=0;k<rs;k++){const a0=P.getX(k),b0=P.getZ(k),a1=P.getX(k+1),b1=P.getZ(k+1);pos.push(0,cy,0,a0,P.getY(k),b0,a1,P.getY(k+1),b1);uv.push(.5,.5,.5+a0/(2*r1),.5+b0/(2*r1),.5+a1/(2*r1),.5+b1/(2*r1));}
   const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(pos,3));cg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));cg.computeVertexNormals();bk.add(cg,SPLW(),M4);}
  /* shards standing out of the break, longest by the tongue */
  for(let k=0;k<12;k++){const a=rr(0,6.283),rad=r1*rr(.25,.9),da=Math.abs(((a-tongue+9.42)%6.283)-3.14),L=rr(.12,.45)*(1.3-Math.min(1,da/2)*.6);
    const sg=new T.ConeGeometry(r1*rr(.07,.16),L,4);sg.scale(1,1,rr(.3,.5));sg.translate(0,L/2,0);sg.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rr(-.25,.25)+(rad/r1)*.25,a+Math.PI/2,rr(-.2,.2),'YXZ')));
    sg.translate(Math.cos(a)*rad,topY(a)-.06-rr(0,.08),Math.sin(a)*rad);bk.add(sg,k%3===0?bark:SPLW(),M4);}}
function splinters(bk,M4,r,y0,rnd_,bark,n=11,h0=.12,h1=.5){const rr=(a,b)=>a+(b-a)*rnd_();
  const face=new T.CircleGeometry(r*.94,10);face.rotateX(-Math.PI/2);{const p=face.attributes.position;for(let i=0;i<p.count;i++)p.setY(i,(rnd_()-.5)*r*.35);}face.translate(0,y0,0);bk.add(face,SPLW(),M4);
  for(let k=0;k<n;k++){const a=k/n*6.283+rr(-.22,.22),rad=r*rr(.2,.88),h=rr(h0,h1)*(1.25-rad/r*.4);
    const g=new T.ConeGeometry(r*rr(.09,.2),h,3);g.scale(1,1,rr(.3,.55));g.translate(0,h/2,0);
    g.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rr(-.18,.18)+(rad/r)*.22,a+Math.PI/2,rr(-.15,.15),'YXZ')));
    g.translate(Math.cos(a)*rad,y0-.02,Math.sin(a)*rad);bk.add(g,rad>r*.7&&k%2===0?bark:SPLW(),M4);}}
/* a soft dark contact shadow to set small things down on a surface */
let _ctM=null;function CONTACT(){if(_ctM)return _ctM;const t=tex(64,64,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,0,w/2,h/2,w/2);g.addColorStop(0,'rgba(0,0,0,.75)');g.addColorStop(.6,'rgba(0,0,0,.35)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},{clamp:true});
  return _ctM=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});}
/* a log from point A to point B (its axis between them) */
function putLogAB(bk,r,A,B,mat){const D=B.clone().sub(A),L=D.length();D.normalize();const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),D);putLog(bk,r,L,new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),q,V3(1,1,1)),mat);}
function putLog(bk,r,L,M4,mat){const g=logGeo(r,L,12,(mat||WM.log)===WM.log);bk.add(g.s,mat||WM.log,M4);g.e.forEach(e=>bk.add(e,WM.end,M4));}
/* cover boxes: block bullets and sight lines (enemies, the captain, the player's own rounds are not affected - they hit
   the meshes) - centre, half extents, yaw */
function addCover(x,y0,y1,z,hx,hz,ry=0,tag){const c={x,z,y0,y1,hx,hz,ry,c:Math.cos(ry),s:Math.sin(ry),tag};WEST.cover.push(c);return c;}
/* does a segment pass through any cover box? (slab test in each box's own frame) */
function coverHit(a,b){for(const c of WEST.cover){const ax=a.x-c.x,az=a.z-c.z,bx=b.x-c.x,bz=b.z-c.z;
    const p0=[ax*c.c-az*c.s,a.y,ax*c.s+az*c.c],p1=[bx*c.c-bz*c.s,b.y,bx*c.s+bz*c.c];let t0=0,t1=1;const lo=[-c.hx,c.y0,-c.hz],hi=[c.hx,c.y1,c.hz];let ok=true;
    for(let k=0;k<3&&ok;k++){const d=p1[k]-p0[k];if(Math.abs(d)<1e-9){if(p0[k]<lo[k]||p0[k]>hi[k])ok=false;continue;}let u0=(lo[k]-p0[k])/d,u1=(hi[k]-p0[k])/d;if(u0>u1){const t=u0;u0=u1;u1=t;}t0=Math.max(t0,u0);t1=Math.min(t1,u1);if(t0>t1)ok=false;}
    if(ok)return c;}return null;}
/* sight line over the ground: the terrain must stay below the line (sampled every metre) */
function terrainClear(a,b){const d=Math.hypot(b.x-a.x,b.z-a.z),n=Math.max(2,Math.ceil(d/1.4));for(let i=1;i<n;i++){const t=i/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=a.y+(b.y-a.y)*t;if(H(x,z)>y-.05)return false;}return true;}
function losClear(a,b){return terrainClear(a,b)&&!coverHit(a,b);}

/* ======================= water ======================= */
const WATER=(()=>{const wl=W3.wl,st=2;const nx=Math.ceil((DET.x1-DET.x0)/st),nz=Math.ceil((DET.z1-DET.z0)/st);
  const pos=[],dep=[],idx=[];const vid=new Int32Array((nx+1)*(nz+1)).fill(-1);
  const V=(i,j)=>{const k=j*(nx+1)+i;if(vid[k]<0){const x=Math.min(DET.x1,DET.x0+i*st),z=Math.min(DET.z1,DET.z0+j*st);vid[k]=pos.length/3;pos.push(x,wl,z);dep.push(wl-H(x,z));}return vid[k];};
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=DET.x0+i*st,z=DET.z0+j*st;let wet=false;
    for(const [a,b] of [[0,0],[1,0],[0,1],[1,1],[.5,.5],[.5,0],[0,.5],[1,.5],[.5,1]])if(H(x+a*st,z+b*st)<wl+.03){wet=true;break;}
    if(!wet)continue;const a=V(i,j),b=V(i+1,j),c=V(i,j+1),d=V(i+1,j+1);idx.push(a,c,b,b,c,d);}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('dep',new T.Float32BufferAttribute(dep,1));
  const nrm=new Float32Array(pos.length);for(let i=1;i<nrm.length;i+=3)nrm[i]=1;g.setAttribute('normal',new T.BufferAttribute(nrm,3));g.setIndex(idx);g.computeBoundingSphere();
  const U={uRings:{value:Array.from({length:8},()=>new T.Vector4(0,0,-99,0))},uWind:{value:.5}};
  const m=new T.MeshStandardMaterial({color:C(0x2a2e1f),roughness:.07,metalness:0,transparent:true,envMapIntensity:1});
  m.userData.wetW=1;
  m.onBeforeCompile=s=>{Object.assign(s.uniforms,U);s.uniforms.rainG=WU.rain;s.uniforms.timeG=WU.time;
    s.vertexShader='attribute float dep;varying float vDep;varying vec3 vWw;\n'+s.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nvDep=dep;vWw=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='uniform vec4 uRings[8];uniform float uWind;varying float vDep;varying vec3 vWw;\n'+s.fragmentShader
      .replace('#include <map_fragment>',`float dpt=max(vDep,0.);
        /* murky floodwater: the silt bottom shows through only at the very edge; a pale scum line where it laps the bank */
        diffuseColor.rgb=mix(vec3(.085,.075,.05),diffuse,smoothstep(0.,.45,dpt));
        diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.16,.15,.11),smoothstep(.09,.02,dpt)*.6);
        diffuseColor.a=smoothstep(0.,.1,dpt)*mix(.6,.94,smoothstep(.06,.7,dpt));`)
      .replace('#include <normal_fragment_maps>',`{vec2 p=vWw.xz;float t=timeG;float fd=1.-smoothstep(25.,90.,length(vWw-cameraPosition));
        vec2 gs=vec2(0.);float wa=.4+uWind;
        gs+=vec2(.8,.3)*cos(dot(p,vec2(.8,.3))*2.3+t*1.6)*.022*wa;gs+=vec2(-.45,.9)*cos(dot(p,vec2(-.45,.9))*3.7+t*2.1)*.016*wa;
        gs+=vec2(.6,-.7)*cos(dot(p,vec2(.6,-.7))*6.1+t*2.9)*.01*wa;gs+=vec2(-.9,-.2)*cos(dot(p,vec2(-.9,-.2))*9.3+t*3.7)*.006*wa;
        float e=.06;vec2 q=p*2.4+t*vec2(.21,.07);float n0=zWN(q),n1=zWN(q+vec2(e,0.)),n2=zWN(q+vec2(0.,e));gs+=vec2(n1-n0,n2-n0)/e*.006*wa;
        gs+=zRip(p,t)*rainG*.9;
        for(int i=0;i<8;i++){vec4 r=uRings[i];float age=t-r.z;if(age>0.&&age<2.6){vec2 d=p-r.xy;float dl=length(d);float R=.15+age*1.15;
          float w=sin((dl-R)*16.)*exp(-pow((dl-R)*3.2,2.))*(1.-age/2.6)*r.w;gs+=d/max(dl,1e-3)*w*.3;}}
        gs*=fd;vec3 nw=normalize(vec3(-gs.x,1.,-gs.y));normal=normalize((viewMatrix*vec4(nw,0.)).xyz);}`);};
  m.customProgramCacheKey=()=>'water1';
  const mesh_=new T.Mesh(g,m);mesh_.receiveShadow=true;mesh_.renderOrder=2;scene.add(mesh_);
  let ri=0;
  const W={mesh:mesh_,m,U,wl,
    ring(x,z,k=1){U.uRings.value[ri].set(x,z,S.t,k);ri=(ri+1)%8;},
    depth(x,z){return wl-H(x,z);},
    /* droplets and a mist puff thrown up from the surface, and the rings it leaves */
    splash(p,k=1){const n=Math.round(6+k*12);for(let i=0;i<n;i++){const a=WR()*6.28,sp=wr(.4,1.6)*k;
        FX.water.spawn(V3(p.x,wl+.02,p.z),V3(Math.cos(a)*sp*.5,wr(1.2,3.4)*Math.sqrt(k),Math.sin(a)*sp*.5),wr(.4,.9),wr(.012,.028)*(1+k*.4),.01,[.62,.64,.58,.75],[.6,.62,.56,0],{g:9.8,fi:0});
        FX.water.P[FX.water.P.length-1].floor=wl;}
      for(let i=0;i<Math.round(1+k*2);i++)FX.dust.spawn(V3(p.x+wr(-.15,.15),wl+.08,p.z+wr(-.15,.15)),V3(wr(-.3,.3),wr(.3,.8),wr(-.3,.3)),wr(.6,1.1),.08*k,.5*k,[.6,.62,.6,.35],[.65,.66,.64,0],{drag:2,g:.4});
      W.ring(p.x,p.z,Math.min(1.4,.5+k*.5));},
    tick(dt){m.envMapIntensity=lerp(1,.4,clamp(WEATHER.cov,0,1));U.uWind.value=damp(U.uWind.value,.35+WEATHER.rain*.9+(WEATHER.mist||0)*-.2,.5,dt);}};
  return W;})();
FX.water=new PSys(360,PTEX.soft,false,{order:3});

/* ======================= reeds, floating mats, duckweed ======================= */
(function reeds(){const wl=W3.wl;
  /* one clump: a fan of long blades and a few bulrush heads, coloured from a dark wet base to pale tips */
  const clump=(seed)=>{const r=rng(seed),pos=[],col=[],nor=[],idx=[];let vi=0;const nb=13+Math.floor(r()*6);
    for(let b=0;b<nb;b++){const a=r()*6.28,h=.9+r()*1.2,w=.012+r()*.01,lean=.1+r()*.32,ox=(r()-.5)*.22,oz=(r()-.5)*.22,dx=Math.cos(a),dz=Math.sin(a),px=-dz,pz=dx,Sg=5;
      const tip=r();for(let k=0;k<=Sg;k++){const t=k/Sg,ww=w*(1-Math.pow(t,1.4)*.62),cx=ox+dx*lean*t*t*h,cz=oz+dz*lean*t*t*h,cy=h*t*(1-.12*t*t*lean);
        pos.push(cx-px*ww,cy,cz-pz*ww,cx+px*ww,cy,cz+pz*ww);const c=t<.15?[.12,.13,.07]:tip<.55?[lerp(.22,.42,t),lerp(.26,.4,t),lerp(.1,.2,t)]:[lerp(.2,.52,t),lerp(.22,.46,t),lerp(.09,.26,t)];col.push(...c,...c);
        nor.push(px*.3,.95,pz*.3,px*.3,.95,pz*.3);if(k<Sg)idx.push(vi,vi+2,vi+1,vi+1,vi+2,vi+3);vi+=2;}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setAttribute('normal',new T.Float32BufferAttribute(nor,3));g.setIndex(idx);
    /* bulrush heads: a brown velvet spike on a stalk */
    const heads=[];const nh=Math.floor(r()*3);for(let i=0;i<nh;i++){const x=(r()-.5)*.2,z=(r()-.5)*.2,h=1.3+r()*.6;
      const st=new T.CylinderGeometry(.004,.005,h,4);st.translate(x,h/2,z);const sp=new T.CylinderGeometry(.016,.016,.16,8);sp.translate(x,h-.12,z);
      [st,sp].forEach((q,j)=>{const n=q.attributes.position.count,cc=new Float32Array(n*3);for(let k=0;k<n;k++){cc[k*3]=j?.24:.3;cc[k*3+1]=j?.14:.32;cc[k*3+2]=j?.08:.14;}q.setAttribute('color',new T.BufferAttribute(cc,3));heads.push(q.toNonIndexed());});}
    if(!heads.length)return g;const g2=g.toNonIndexed();return mergeColor([g2,...heads]);};
  function mergeColor(gs){let n=0;gs.forEach(q=>n+=q.attributes.position.count);const out=new T.BufferGeometry();[['position',3],['normal',3],['color',3]].forEach(([a,sz])=>{const arr=new Float32Array(n*sz);let o=0;gs.forEach(q=>{arr.set(q.attributes[a].array.subarray(0,q.attributes.position.count*sz),o*sz);o+=q.attributes.position.count;});out.setAttribute(a,new T.BufferAttribute(arr,sz));});return out;}
  /* (matte even when wet, and the tips never narrower than a third of the blade - sub-pixel glossy tips were what
     flickered as white dots along the reed beds) */
  const mat=std({vertexColors:true,side:T.DoubleSide,roughness:.9,envMapIntensity:.12});mat.defines.NO_PUDDLE='';mat.defines.DRY_MATTE='';
  mat.onBeforeCompile=s=>{s.uniforms.uTime=GRASS.uni.uTime;s.vertexShader='uniform float uTime;\n'+s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
    {vec4 wq=instanceMatrix*vec4(0.,0.,0.,1.);float hh=max(position.y,0.);float sw=sin(uTime*1.3+wq.x*.21+wq.z*.17)*.6+sin(uTime*2.9+wq.x*.7)*.25;transformed.x+=sw*.06*hh*hh;transformed.z+=sw*.03*hh*hh;}`);
    s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP);};
  mat.customProgramCacheKey=()=>'reeds1';
  const types=[clump(3),clump(17),clump(41),clump(77)];
  /* where: the waterline band round every pool, thicker in drifts; a few stands out in the shallows */
  const T_=32,tiles=new Map();
  for(let x=DET.x0+1;x<DET.x1-1;x+=1.25)for(let z=DET.z0+1;z<DET.z1-1;z+=1.25){const jx=x+wr(-.5,.5),jz=z+wr(-.5,.5);const h=H(jx,jz),a=h-wl;if(a<-.4||a>.18)continue;
    const drift=fbm(jx/11+4,jz/11-2,2);if(drift<.42+(a<-.2?.12:0))continue;if(WR()>.85)continue;
    /* keep the causeway walkable */
    let dp=9;const P=W3.path;for(let i=0;i<P.length-1;i++){const p=P[i],q=P[i+1],dx=q[0]-p[0],dz=q[1]-p[1],l2=dx*dx+dz*dz;let t=((jx-p[0])*dx+(jz-p[1])*dz)/l2;t=clamp(t,0,1);dp=Math.min(dp,Math.hypot(jx-p[0]-dx*t,jz-p[1]-dz*t));}
    if(dp<1.6)continue;if(Math.hypot((jx-W3.yard.x)/16,(jz-W3.yard.z)/13)<1.1)continue;
    const k=Math.floor((jx-DET.x0)/T_)+','+Math.floor((jz-DET.z0)/T_);if(!tiles.has(k))tiles.set(k,[]);tiles.get(k).push([jx,h,jz,WR()*6.28,.75+WR()*.5,Math.floor(WR()*4)]);}
  const o=new T.Object3D();
  tiles.forEach(list=>{for(let ty=0;ty<4;ty++){const L=list.filter(e=>e[5]===ty);if(!L.length)continue;const im=new T.InstancedMesh(types[ty],mat,L.length);
    L.forEach((e,i)=>{o.position.set(e[0],e[1]-.05,e[2]);o.rotation.set(wr(-.06,.06),e[3],wr(-.06,.06));o.scale.set(e[4],e[4]*wr(.85,1.15),e[4]);o.updateMatrix();im.setMatrixAt(i,o.matrix);});
    im.castShadow=true;im.receiveShadow=true;fitInstBounds(im,L.map(e=>[e[0],e[2]]),3);scene.add(im);WEST.reeds.push({m:im,x:L[0][0],z:L[0][2]});}});
  /* floating mats of dead grass and straw drifted together on the open water, and green duckweed in the calm shallows */
  const strawTex=tex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);const r=rng(9);
    for(let i=0;i<900;i++){const a=r()*6.28,rr=Math.sqrt(r())*.42,cx=w*(.5+Math.cos(a)*rr*(1+.3*Math.sin(a*3))),cy=h*(.5+Math.sin(a)*rr*(1+.25*Math.cos(a*2)));
      const L=8+r()*30,an=r()*6.28;const k=r();g.strokeStyle=`rgba(${Math.round(lerp(88,182,k))},${Math.round(lerp(80,164,k))},${Math.round(lerp(50,104,k))},${.75+r()*.25})`;g.lineWidth=.8+r()*1.6;
      g.beginPath();g.moveTo(cx,cy);g.lineTo(cx+Math.cos(an)*L,cy+Math.sin(an)*L);g.stroke();}
    for(let i=0;i<40;i++){g.fillStyle=`rgba(60,58,40,${.3+r()*.3})`;g.beginPath();g.arc(w*(.25+r()*.5),h*(.25+r()*.5),2+r()*6,0,6.28);g.fill();}},{clamp:true});
  const duckTex=tex(256,256,(g,w,h)=>{g.clearRect(0,0,w,h);const r=rng(21);for(let i=0;i<2600;i++){const a=r()*6.28,rr=Math.pow(r(),.6)*.46,cx=w*(.5+Math.cos(a)*rr),cy=h*(.5+Math.sin(a)*rr*(1+.3*Math.sin(a*2)));
      const k=r();g.fillStyle=`rgba(${Math.round(lerp(60,110,k))},${Math.round(lerp(92,140,k))},${Math.round(lerp(28,50,k))},${.85})`;g.beginPath();g.ellipse(cx,cy,1.4+r()*1.8,1.1+r()*1.2,r()*3,0,6.28);g.fill();}},{clamp:true});
  bleedAlpha(strawTex,10);bleedAlpha(duckTex,10);
  const fm=(map)=>{const q=std({map,alphaTest:.4,side:T.DoubleSide,roughness:.85,envMapIntensity:.3});q.userData.wetW=1;return q;};
  const flat=new T.PlaneGeometry(1,1);flat.rotateX(-Math.PI/2);
  [[strawTex,320,.35,9,[.9,2.6]],[duckTex,220,-1,.25,[.7,2.2]]].forEach(([tx,N,dmin,dmax,sz],k)=>{const L=[];let tries=0;
    while(L.length<N&&tries<N*40){tries++;const x=wr(DET.x0+2,DET.x1-2),z=wr(DET.z0+2,DET.z1-2),d=wl-H(x,z);
      if(k===0){if(d<dmin)continue;}else{if(d<.04||d>.5)continue;}if(k===1&&fbm(x/14,z/14+9,2)<.45)continue;L.push([x,z,wr(sz[0],sz[1]),WR()*6.28]);}
    const im=new T.InstancedMesh(flat,fm(tx),L.length);L.forEach((e,i)=>{o.position.set(e[0],wl+.012+(i%7)*.0012,e[1]);o.rotation.set(0,e[3],0);o.scale.set(e[2],1,e[2]*wr(.6,1));o.updateMatrix();im.setMatrixAt(i,o.matrix);});
    im.receiveShadow=true;fitInstBounds(im,L.map(e=>[e[0],e[1]]),3);scene.add(im);});})();

/* floating things that bob: logs, a half-sunk barrel, a jerrycan, planks, a tyre, branches, bottles */
(function floaters(){const wl=W3.wl;const bk=(m,x,z,o)=>{m.position.set(x,wl,z);m.userData.noMerge=true;scene.add(m);WEST.bob.push(Object.assign({m,x,z,ph:WR()*6.28,ry:WR()*6.28,y0:0,amp:.012,tilt:.03},o));m.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});};
  const spot=(dmin)=>{for(let i=0;i<400;i++){const x=wr(-860,-712),z=wr(-470,-270);if(wl-H(x,z)>dmin)return[x,z];}return[-790,-372];};
  for(let i=0;i<9;i++){const r=wr(.1,.19),L=wr(1.8,4.2);const g=new T.Group();const lg=logGeo(r,L);const a=new T.Mesh(lg.s,WM.bark);g.add(a);lg.e.forEach(e=>g.add(new T.Mesh(e,WM.end)));
    g.children.forEach(c=>c.rotation.z=Math.PI/2);/* a stub of a branch */if(WR()<.6){const b=new T.Mesh(new T.CylinderGeometry(.02,.035,.6,16),WM.bark);b.position.set(wr(-L/3,L/3),.06,0);b.rotation.set(.6,0,.9);g.add(b);}
    const [x,z]=spot(.5);bk(g,x,z,{y0:-r*.62,amp:.008,tilt:.015});}
  {const bar=(x,z,tilt)=>{const g=new T.Group();const body=mesh(lathe([[0,-.44],[.29,-.44],[.295,-.42],[.29,-.3],[.3,-.28],[.29,0],[.3,.28],[.29,.3],[.295,.42],[.29,.44],[0,.44]],20),WM.rust,0,0,0,g);
      g.rotation.set(tilt,0,.5);bk(g,x,z,{y0:-.18,amp:.02,tilt:.05});};const a=spot(.6);bar(a[0],a[1],.4);const b=spot(.6);bar(b[0],b[1],1.2);}
  {const g=new T.Group();mesh(rbox(.34,.46,.17,.03),std({color:C(0x3a4430),roughness:.6,metalness:.3}),0,0,0,g);mesh(rbox(.07,.06,.05,.01),M.black,.1,.25,0,g);g.rotation.set(1.3,0,.2);const a=spot(.4);bk(g,a[0],a[1],{y0:-.04,amp:.025,tilt:.12});}
  for(let i=0;i<5;i++){const L=wr(1.2,2.8);const m=mesh(rbox(L,.03,wr(.12,.2),.008),WM.board,0,0,0);const a=spot(.3);bk(m,a[0],a[1],{y0:-.005,amp:.008,tilt:.03});}
  {const t=new T.Mesh(new T.TorusGeometry(.32,.12,10,22),M.tire||M.black);t.rotation.x=Math.PI/2;const a=spot(.5);bk(t,a[0],a[1],{y0:-.04,amp:.01,tilt:.04});}
  for(let i=0;i<6;i++){const g=new T.Group();const n=3+Math.floor(WR()*4);for(let k=0;k<n;k++){const b=new T.Mesh(new T.CylinderGeometry(.006,.018,wr(.6,1.6),5),WM.bark);b.rotation.set(wr(1.2,1.9),wr(0,6),wr(-.4,.4));b.position.set(wr(-.4,.4),0,wr(-.4,.4));g.add(b);}
    const a=spot(.2);bk(g,a[0],a[1],{y0:.01,amp:.006,tilt:.02});}
  const bottle=std({color:C(0x6a7a66),roughness:.25,transparent:true,opacity:.75,envMapIntensity:.5});for(let i=0;i<4;i++){const m=mesh(lathe([[0,0],[.04,0],[.042,.01],[.042,.17],[.02,.22],[.014,.26],[0,.26]],12),bottle,0,0,0);m.rotation.z=Math.PI/2+wr(-.3,.3);const a=spot(.3);bk(m,a[0],a[1],{y0:-.02,amp:.015,tilt:.15});}})();

/* ======================= the district road ======================= */
(function westRoad(){const R=ROADS.wr,P=R.P;
  const cols=[-3.1,-2,-1,0,1,2,3.1];const pos=[],uv=[];
  P.forEach((p,i)=>{const f=roadFrame(P,i);cols.forEach(d=>{const x=p.x+f.nx*d,z=p.z+f.nz*d;pos.push(x,p.y+pwl(WRP,Math.abs(d))+.008,z);uv.push((d+3.1)/6.2,p.s/6.2);});});
  const am=mesh(ribbon(pos,uv,P.length,cols.length),asphaltMat(),0,0,0,scene,false);am.receiveShadow=true;shootables.push(am);
  const ds=[2.95,3.2,4.2,5.2,6.2,7.4,8.4,9.5];
  [1,-1].forEach(sg=>{const ps=[],sp=[],we=[],co=[];
    P.forEach((p,i)=>{const f=roadFrame(P,i);ds.forEach((d,j)=>{const x=p.x+f.nx*d*sg,z=p.z+f.nz*d*sg;let y=j===ds.length-1?H(x,z)-.06:p.y+wrRel(d,p.s,sg);if(j===0)y-=.025;ps.push(x,y,z);
      let w,wt;if(d<=3.2){w=[0,.06,.2,.74];wt=.12;}else if(d<=4.2){w=[.05,.15,.3,.5];wt=.18;}else if(d<=6.2){w=[.22,.18,.55,.05];wt=.6;}else if(d<9.5){w=[.6,.3,.1,0];wt=.2;}else{const gm=groundMix(x,z);w=gm.slice(0,4);wt=gm[4];}
      sp.push(...w);we.push(wt);co.push(...terrCol(x,z));});});
    const gg=ribbon(ps,null,P.length,ds.length,{splat:[sp,4],wet:[we,1],color:[co,3]});const sm=mesh(gg,splatMat(.45),0,0,0,scene,false);sm.receiveShadow=true;shootables.push(sm);});
  /* wooden poles on concrete stubs along the east verge, a crossarm and two insulators, wires sagging - two poles lean
     hard and one is down across the ditch with its wires in the grass */
  const poles=[];for(let s=24;s<R.L;s+=52){const i=P.findIndex(p=>p.s>=s);if(i<0)break;const p=P[i],f=roadFrame(P,i);const x=p.x+f.nx*10.5,z=p.z+f.nz*10.5;
    poles.push({x,z,y:H(x,z),yaw:Math.atan2(f.tx,f.tz),lean:wr(-.04,.04),roll:wr(-.04,.04),s});}
  poles.forEach(p=>{if(Math.abs(p.s-670)<30){p.lean=.22;}if(Math.abs(p.s-930)<30){p.roll=-.18;}});
  const down=poles.find(p=>Math.abs(p.s-544)<30);if(down)down.down=true;
  const bk=bucket();const wires=[];
  poles.forEach(p=>{const M4=TRS(p.x,p.y-.2,p.z,p.down?-(Math.PI/2-.08):p.lean,p.yaw+Math.PI/2,p.roll);
    bk.add(new T.CylinderGeometry(.1,.13,7.8,16).translate(0,4.6,0),WM.bark,M4);bk.add(rbox(.2,1.6,.16,.03).translate(0,.6,-.17),WM.conc,M4);
    [.25,.95].forEach(y=>bk.add(new T.TorusGeometry(.15,.012,5,14).rotateX(Math.PI/2).translate(0,y,-.08),WM.rust,M4));
    bk.add(rbox(1.3,.1,.1,.01).translate(0,8.1,0),WM.bark,M4);
    p.att=[-.55,.55].map(ox=>{bk.add(new T.CylinderGeometry(.035,.045,.13,16).translate(ox,8.24,0),M.white||WM.conc,M4);return V3(ox,8.3,0).applyMatrix4(M4);});
    if(!p.down)solids.push({cx:p.x,cz:p.z,r:.2});});
  bk.flush(scene,true);
  for(let k=0;k<poles.length-1;k++){const a=poles[k],b=poles[k+1];if(a.down||b.down){/* the downed span: wires lying slack in the grass */
      const live=a.down?b:a,dead=a.down?a:b;for(let j=0;j<2;j++){const p0=live.att[j];const g=V3(lerp(p0.x,dead.x,.7),H(lerp(p0.x,dead.x,.7),lerp(p0.z,dead.z,.7))+.04,lerp(p0.z,dead.z,.7));
        const n=10;for(let t=0;t<n;t++){const u0=t/n,u1=(t+1)/n,c=(u)=>{const q=p0.clone().lerp(g,u);q.y-=Math.sin(u*Math.PI)*.8;return q;};const qa=c(u0),qb=c(u1);wires.push(qa.x,qa.y,qa.z,qb.x,qb.y,qb.z);}}continue;}
    for(let j=0;j<2;j++){const pa=a.att[j],pb=b.att[j];const n=14;for(let t=0;t<n;t++){const u0=t/n,u1=(t+1)/n,c=u=>{const q=pa.clone().lerp(pb,u);q.y-=4*.6*u*(1-u);return q;};const qa=c(u0),qb=c(u1);wires.push(qa.x,qa.y,qa.z,qb.x,qb.y,qb.z);}}}
  {const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(wires,3));scene.add(new T.LineSegments(g,new T.LineBasicMaterial({color:C(0x1c1c1a)})));}
  /* the bus stop (see BUS): the bay, the kerb, the platform, the shelter, the signs, the path off to the collective */
  busStop();})();
function busStop(){const B=BUS,G=new T.Group();G.position.set(B.x,B.y,B.z);G.rotation.y=Math.atan2(B.T.x,B.T.z)-Math.PI/2;scene.add(G);
  /* local x = along the road, local z = -(distance from the centre line towards the stop) */
  const W=(u,w)=>[B.x+B.T.x*u+B.Sd.x*w,B.z+B.T.z*u+B.Sd.z*w],Y=(u,w)=>{const [x,z]=W(u,w);return H(x,z)-B.y;};
  const r=rng(377),rr=(a,b)=>a+(b-a)*r();const M_=(geo,mat,u,y,w,par=G)=>mesh(geo,mat,u,y,-w,par);
  /* precast concrete throughout, textured by the metre (not stretched over each piece): the road slabs grimy with traffic,
     the kerb darker, the shelter's walls and roof paler */
  const pcM=(col)=>std({map:PB.precast.a,normalMap:PB.precast.n,roughnessMap:PB.precast.r,roughness:1,color:C(col),envMapIntensity:.3});
  const slab=pcM(0x938f87),kerb=pcM(0x8a877f),pc=pcM(0xb4b0a6),wU=g=>worldUV(g,.5);
  /* the bay: precast road slabs in two rows, a little out of level, one cracked across */
  [4.0,5.62].forEach((w,row)=>{for(let k=0;k<6;k++){const u=-7.5+k*3.0;const y=Y(u,w)+.035-.07+rr(-.006,.006);
    if(row===1&&k===3){[-.74,.74].forEach((du,h)=>{const m=M_(wU(rbox(1.44,.14,1.58,.01)),slab,u+du,y+(h?-.012:.004),w);m.rotation.set(rr(-.01,.01),0,h?.012:-.006);});continue;}
    const m=M_(wU(rbox(2.96,.14,1.58,.012)),slab,u,y,w);m.rotation.set(rr(-.006,.006),0,rr(-.006,.006));}});
  /* the kerb */
  for(let k=0;k<18;k++){const u=-8.5+k;const m=M_(wU(rbox(.97,.34,.15,.012)),kerb,u,Y(u,6.5)+.06+rr(-.01,.01),6.5);m.rotation.y=rr(-.012,.012);}
  /* the platform: paving slabs, a couple sunk or gone */
  for(let i=0;i<9;i++)for(let j=0;j<3;j++){if((i===7&&j===2)||(i===1&&j===0&&false))continue;const u=-4+i,w=7.15+j*.99;const sunk=(i===2&&j===1)?-.03:0;
    const m=M_(wU(rbox(.97,.08,.96,.01)),pc,u,Y(u,w)+.012-.04+sunk+rr(-.004,.004),w);m.rotation.set(rr(-.008,.008),rr(-.01,.01),rr(-.008,.008));}
  /* the culvert under the bay: the pipe's mouths show at the ends of the fill */
  [-1,1].forEach(sd=>{const u=sd*12.6,w=5.75;const pg=new T.Group();pg.position.set(u,Y(u,w)+.22,-w);pg.rotation.set(0,0,Math.PI/2);G.add(pg);
    mesh(new T.CylinderGeometry(.42,.42,1.2,18,1,true),kerb,0,-sd*.4,0,pg);mesh(flipIn(new T.CylinderGeometry(.33,.33,1.2,18,1,true)),kerb,0,-sd*.4,0,pg);
    const rim=new T.RingGeometry(.33,.42,18);rim.rotateX(sd>0?Math.PI/2:-Math.PI/2);mesh(rim,kerb,0,sd*.2,0,pg);});
  /* the shelter: precast back wall with its faded mosaic, side walls, the roof slab, a bench (a slat gone), the stop's name */
  {const g=new T.Group();g.position.set(0,Y(0,8.55)+.012,-8.55);G.add(g);
    const mos=tex(512,256,(c,w,h)=>{c.fillStyle='#8e8a80';c.fillRect(0,0,w,h);const q=rng(4);const cols=['#b04a2a','#d8b04a','#3a6a8a','#e8e2d0','#4a7a4a','#2a3a5a'];
      /* a sun over a wheat field and a stylised tractor - the collective's own mosaic, half the tesserae gone */
      for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){const u=x/w,v=y/h;let ci=v>.62?(Math.sin(u*40+v*9)>0?1:4):(Math.hypot(u-.72,v-.28)<.13?1:Math.hypot(u-.72,v-.28)<.17?0:v<.62&&v>.5&&u>.18&&u<.42?0:2);
        if(v>.5&&v<.62&&u>.2&&u<.4&&(Math.hypot(u-.24,v-.6)<.035||Math.hypot(u-.37,v-.6)<.025))ci=5;if(q()<.05)ci=3;
        if(fbmT(u,v,5,3)<.38&&q()<.9)continue;c.fillStyle=cols[ci];c.fillRect(x+1,y+1,6,6);}
      c.fillStyle='rgba(60,56,50,.35)';for(let i=0;i<30;i++)c.fillRect(q()*w,q()*h*.2,2,q()*h);});
    mesh(wU(rbox(4.2,2.4,.16,.02)),pc,0,1.2,-.9,g);const mm=mesh(new T.PlaneGeometry(3.9,1.6),std({map:mos,roughness:.6,polygonOffset:true,polygonOffsetFactor:-2}),0,1.35,-.815,g,false);mm.receiveShadow=true;
    [-1,1].forEach(sd=>mesh(wU(rbox(.14,2.4,1.8,.02)),pc,sd*2.03,1.2,-.05,g));
    const rf=mesh(wU(rbox(4.6,.14,2.4,.02)),pc,0,2.45,.0,g);rf.rotation.x=-.05;
    /* the name board under the roof's front edge */
    const nm=tex(512,64,(c,w,h)=>{c.fillStyle='#e9e4d6';c.fillRect(0,0,w,h);c.fillStyle='#1f3f7a';c.font='bold 38px sans-serif';c.textAlign='center';c.fillText('КОЛХОЗ «РАССВЕТ»',w/2,46);
      const q=rng(9);for(let i=0;i<40;i++){c.fillStyle=`rgba(110,80,50,${q()*.35})`;c.fillRect(q()*w,q()*h,2+q()*30,1+q()*3);}});
    mesh(rbox(3.0,.3,.03,.006),WM.rust,0,2.2,1.12,g);mesh(new T.PlaneGeometry(2.96,.28),std({map:nm,roughness:.75,polygonOffset:true,polygonOffsetFactor:-2}),0,2.2,1.137,g,false);
    /* bench: three slats on steel legs, the middle one broken and hanging */
    [-1.4,1.4].forEach(sd=>{mesh(rbox(.06,.44,.34,.008),WM.rust,sd,.22,-.6,g);});
    [-.72,-.6,-.48].forEach((z,k)=>{if(k===1){const sl=mesh(rbox(1.6,.035,.11,.006),WM.board,-.8,.42,z,g);sl.rotation.z=.32;const s2=mesh(rbox(1.7,.035,.11,.006),WM.board,.85,.455,z,g);return;}mesh(rbox(3.4,.035,.11,.006),WM.board,0,.455,z,g);});
    /* scratched into the side wall */
    const gr=tex(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='rgba(40,38,36,.75)';c.lineWidth=2;c.font='italic 30px sans-serif';c.fillStyle='rgba(40,38,36,.7)';c.fillText('ВИТЯ+ОЛЯ',10,50);c.font='22px sans-serif';c.fillText('1986',150,90);c.fillText('ЦОЙ ЖИВ',14,112);});
    const gm=mesh(new T.PlaneGeometry(.9,.45),std({map:gr,transparent:true,roughness:.9,polygonOffset:true,polygonOffsetFactor:-2}),-1.955,1.3,-.2,g,false);gm.rotation.y=Math.PI/2;
    g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;shootables.push(q);}});
    const [sx,sz]=W(0,8.55);WEST.spots.shelter=V3(sx,0,sz);G.updateMatrixWorld(true);addCover(sx,B.y+Y(0,8.55),B.y+Y(0,8.55)+2.4,sz,2.1,.12,G.rotation.y,'shelter');
    /* walls as collision: back wall and the two sides, from their corners in the world */
    const wpt=(x,z)=>g.localToWorld(V3(x,0,z));const seg=(a,b,n)=>{for(let i=0;i<=n;i++){const p=a.clone().lerp(b,i/n);solids.push({cx:p.x,cz:p.z,r:.16});}};
    seg(wpt(-2.05,-.9),wpt(2.05,-.9),12);seg(wpt(-2.03,-.9),wpt(-2.03,.8),5);seg(wpt(2.03,-.9),wpt(2.03,.8),5);}
  /* the stop sign: an "A" plate, the route and the timetable under it, on a rusty pipe at the kerb; a plain one for the
     other direction across the road */
  const signTex=(other)=>tex(256,512,(c,w,h)=>{c.fillStyle='#e7c32a';c.fillRect(0,0,w,240);c.strokeStyle='#161410';c.lineWidth=10;c.strokeRect(6,6,w-12,228);c.fillStyle='#161410';c.font='bold 190px sans-serif';c.textAlign='center';c.fillText('А',w/2,200);
    c.fillStyle='#f1eee4';c.fillRect(8,262,w-16,240);c.fillStyle='#161410';c.font='bold 26px sans-serif';c.fillText('№ 108',w/2,296);c.font='19px sans-serif';c.fillText(other?'на Лесное':'на Опалихино',w/2,322);
    c.font='bold 18px sans-serif';c.fillText('РАСПИСАНИЕ',w/2,356);c.font='20px monospace';['6.40   13.15','8.05   17.30','11.20  19.45'].forEach((t,i)=>c.fillText(t,w/2,388+i*28));
    const q=rng(other?5:6);for(let i=0;i<60;i++){c.fillStyle=`rgba(120,62,24,${q()*.4})`;c.fillRect(q()*w,q()*h,1+q()*4,4+q()*40);}});
  const post=(u,w,face)=>{const g=new T.Group();g.position.set(u,Y(u,w),-w);g.rotation.y=face;G.add(g);mesh(new T.CylinderGeometry(.035,.04,2.75,16),WM.rust,0,1.37,0,g);
    mesh(rbox(.42,.84,.02,.006),WM.rust,0,2.2,.03,g);mesh(new T.PlaneGeometry(.4,.8),std({map:signTex(face!==0),roughness:.7,metalness:.15,polygonOffset:true,polygonOffsetFactor:-2}),0,2.2,.042,g,false);
    g.rotation.z=rr(-.03,.03);g.traverse(q=>{if(q.isMesh){q.castShadow=true;}});const [x,z]=W(u,w);solids.push({cx:x,cz:z,r:.1});};
  post(5.6,6.9,0);post(-5.4,-7.4,Math.PI);
  /* a concrete litter urn, overflowing; bottles and a crushed packet on the slabs */
  /* the litter urn: cast concrete, whitewashed long ago and flaking; full - a heap of rubbish inside, the top of it at the
     rim and a few things on top of the heap */
  {const u=2.75,w=7.35,y0=Y(u,w);const ur=M_(lathe([[0,0],[.2,0],[.24,.06],[.26,.55],[.22,.58],[.2,.2],[0,.2]],20),std({map:PB.white.a,normalMap:PB.white.n,roughness:.92,color:C(0xd8d4c8),envMapIntensity:.3}),u,y0,w);ur.castShadow=true;const [x,z]=W(u,w);solids.push({cx:x,cz:z,r:.27});
    const heap=new T.SphereGeometry(.205,14,8,0,6.29,0,Math.PI/2);heap.scale(1,.55,1);{const pp=heap.attributes.position;for(let i=0;i<pp.count;i++){const a=Math.atan2(pp.getZ(i),pp.getX(i));pp.setY(i,pp.getY(i)*(.8+.4*Math.abs(Math.sin(a*3+1))));}heap.computeVertexNormals();}
    M_(heap,std({color:C(0x4a4438),roughness:.95}),u,y0+.4,w);
    const lit=[std({color:C(0xc9c2b0),roughness:.9}),std({color:C(0x8a3a28),roughness:.8}),std({color:C(0x6a7a8a),roughness:.7})];
    [[.06,.025,.05,-.05,.02],[.09,.02,.06,.06,-.04],[.05,.04,.08,0,.07],[.08,.015,.08,-.07,-.06]].forEach(([a,b,c,du,dw],k)=>{const m=M_(rbox(a,b,c,.006),lit[k%3],u+du,y0+.505+b*.4,w+dw);m.rotation.set(rr(-.3,.3),rr(0,3),rr(-.3,.3));});
    /* a crumpled newspaper sticking up out of it */
    {const m=M_(new T.IcosahedronGeometry(.07,1),lit[0],u+.04,y0+.57,w-.02);m.scale.set(1,.7,.8);}}
  [[1.2,7.6,.4],[-2.6,6.95,2.1],[3.4,9.8,1.2]].forEach(([u,w,a])=>{const m=M_(lathe([[0,0],[.035,0],[.037,.01],[.037,.15],[.017,.2],[.012,.23],[0,.23]],10),M.bottle||WM.conc,u,Y(u,w)+.036,w);m.rotation.set(0,a,Math.PI/2);});
  {const pk=tex(64,32,(c,w,h)=>{c.fillStyle='#d8d0b8';c.fillRect(0,0,w,h);c.fillStyle='#a8261c';c.fillRect(0,10,w,12);c.fillStyle='#fff';c.font='bold 10px sans-serif';c.fillText('ЯВА',18,20);});
   const m=M_(rbox(.09,.022,.055,.004),std({map:pk,roughness:.8}),-1.1,Y(-1.1,7.9)+.025,7.9);m.rotation.set(.1,.7,.15);}
  /* where the path leaves: a finger board on a post */
  {const u=-2.2,w=10.9;const g=new T.Group();g.position.set(u,Y(u,w),-w);g.rotation.y=-.5;G.add(g);mesh(new T.CylinderGeometry(.045,.055,1.9,16),WM.bark,0,.95,0,g);
   const ft=tex(256,64,(c,w,h)=>{c.fillStyle='#d9d3bf';c.fillRect(0,0,w,h);c.fillStyle='#202018';c.font='bold 22px sans-serif';c.fillText('к-з «Рассвет» 2 км',12,40);const q=rng(3);for(let i=0;i<30;i++){c.fillStyle=`rgba(90,70,40,${q()*.3})`;c.fillRect(q()*w,q()*h,8+q()*30,1+q()*3);}});
   const ar=new T.Shape();ar.moveTo(0,-.09);ar.lineTo(.92,-.09);ar.lineTo(1.05,0);ar.lineTo(.92,.09);ar.lineTo(0,.09);ar.lineTo(0,-.09);const ag=new T.ExtrudeGeometry(ar,{depth:.025,bevelEnabled:false});
   mesh(ag,WM.board,.02,1.65,-.012,g);const fp=mesh(new T.PlaneGeometry(.9,.16),std({map:ft,roughness:.85,polygonOffset:true,polygonOffsetFactor:-2}),.47,1.65,.0145,g,false);
   g.traverse(q=>{if(q.isMesh)q.castShadow=true;});const [x,z]=W(u,w);solids.push({cx:x,cz:z,r:.08});}
  G.traverse(q=>{if(q.isMesh){q.receiveShadow=true;if(q.castShadow===undefined)q.castShadow=true;}});}

/* ======================= the warning sign and the old fence at the basin's edge ======================= */
(function basinSign(){const x=-701.5,z=-349.2;const g=new T.Group();g.position.set(x,H(x,z)-.03,z);g.rotation.set(-.05,Math.PI/2+.08,.04);scene.add(g);   /* its face to the east, where you come from */
  const t=tex(512,384,(c,w,h)=>{c.fillStyle='#d9b51e';c.fillRect(0,0,w,h);c.strokeStyle='#161410';c.lineWidth=12;c.strokeRect(10,10,w-20,h-20);
    const cx=w/2,cy=140,R0=92;c.fillStyle='#161410';c.beginPath();c.arc(cx,cy,R0*.2,0,6.28);c.fill();
    for(let k=0;k<3;k++){const a=-Math.PI/2+k*2.094;c.beginPath();c.moveTo(cx+Math.cos(a-.52)*R0*.3,cy+Math.sin(a-.52)*R0*.3);c.arc(cx,cy,R0,a-.52,a+.52);c.arc(cx,cy,R0*.3,a+.52,a-.52,true);c.fill();}
    c.fillStyle='#b01818';c.textAlign='center';fitLine(c,'ОПАСНО!',cx,286,440,54,'bold');c.fillStyle='#161410';fitLine(c,'РАДИАЦИОННОЕ ЗАГРЯЗНЕНИЕ',cx,328,452,38,'bold');
    fitLine(c,'ПРОХОД И ВЫПАС СКОТА ЗАПРЕЩЁН',cx,362,452,26,'bold');
    /* rust bleeding from the bolts, flaking paint, bird shot */
    const r=rng(12);for(let i=0;i<14;i++){const x0=r()*w,y0=r()*h;const gr=c.createLinearGradient(x0,y0,x0,y0+60+r()*90);gr.addColorStop(0,'rgba(120,60,20,.6)');gr.addColorStop(1,'rgba(120,60,20,0)');c.fillStyle=gr;c.fillRect(x0,y0,3+r()*5,150);}
    for(let i=0;i<220;i++){c.fillStyle=`rgba(${r()<.5?'90,80,60':'60,40,24'},${.3+r()*.5})`;c.beginPath();c.arc(r()*w,r()*h,r()*5+1,0,6.28);c.fill();}
    for(let i=0;i<9;i++){const x0=w*.3+r()*w*.4,y0=h*.3+r()*h*.3;c.fillStyle='#2a1a10';c.beginPath();c.arc(x0,y0,3,0,6.28);c.fill();c.fillStyle='rgba(200,200,190,.6)';c.beginPath();c.arc(x0,y0,5,0,6.28);c.lineWidth=2;c.strokeStyle='rgba(220,220,200,.5)';c.stroke();}});
  mesh(rbox(1.04,.8,.02,.008),WM.rust,0,1.7,0,g);mesh(new T.PlaneGeometry(1.0,.75),std({map:t,roughness:.7,metalness:.2,polygonOffset:true,polygonOffsetFactor:-2}),0,1.7,.0115,g,false);
  [-.42,.42].forEach(px=>{mesh(new T.CylinderGeometry(.05,.06,2.3,16),WM.bark,px,1.05,-.06,g);[.2,-.2].forEach(dy=>mesh(rbox(.04,.04,.03,.01),WM.rust,px,1.7+dy,.014,g));});
  solids.push({cx:x,cz:z,r:.25});
  /* a rusted barbed-wire fence along the old exclusion line: leaning posts, two strands, one broken and trailing */
  const posts=[];for(let k=0;k<9;k++){const zz=-366+k*4.2+wr(-.4,.4),xx=-703.5+wr(-.6,.6)+Math.sin(k*.9)*.8;posts.push(V3(xx,H(xx,zz),zz));}
  const bk=bucket();const wires=[];posts.forEach((p,k)=>{if(k===4)return;bk.add(new T.CylinderGeometry(.045,.055,1.5,16).translate(0,.55,0),WM.bark,TRS(p.x,p.y,p.z,wr(-.12,.12),0,wr(-.15,.15)));solids.push({cx:p.x,cz:p.z,r:.08});});
  bk.flush(scene,true);
  for(let k=0;k<posts.length-1;k++){if(k===3||k===4)continue;wireSolids(posts[k].x,posts[k].z,posts[k+1].x,posts[k+1].z);[.55,1.05].forEach((hh,j)=>{if(k===6&&j===1)return;const a=V3(posts[k].x,posts[k].y+hh,posts[k].z),b=V3(posts[k+1].x,posts[k+1].y+hh,posts[k+1].z);const n=8;
    for(let t=0;t<n;t++){const u0=t/n,u1=(t+1)/n,c=u=>{const q=a.clone().lerp(b,u);q.y-=Math.sin(u*Math.PI)*.12;return q;};const qa=c(u0),qb=c(u1);wires.push(qa.x,qa.y,qa.z,qb.x,qb.y,qb.z);
      /* barbs */const m_=qa.clone().lerp(qb,.5);wires.push(m_.x-.025,m_.y-.02,m_.z,m_.x+.025,m_.y+.02,m_.z,m_.x,m_.y-.02,m_.z-.025,m_.x,m_.y+.02,m_.z+.025);}});}
  {const g2=new T.BufferGeometry();g2.setAttribute('position',new T.Float32BufferAttribute(wires,3));scene.add(new T.LineSegments(g2,new T.LineBasicMaterial({color:C(0x3a2a1e)})));}
  /* the basin: silt that took the fallout - an elevated reading all the way across, worst in the low middle */
  hotspots.push({x:-790,z:-372,r:95,uSv:2.2},{x:-776,z:-390,r:26,uSv:6});})();

/* ======================= the hunters' clearing ======================= */
(function clearing(){const c=W3.clear;const bk=bucket();
  /* stumps of the birches they felled, and one left where it fell */
  for(let i=0;i<7;i++){const a=i*.9+wr(0,.5),d=wr(4,13),x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d,r=wr(.13,.24),h=wr(.25,.55);
    bk.add(new T.CylinderGeometry(r*.92,r*1.15,h,10).translate(0,h/2-.05,0),WM.bark,TRS(x,H(x,z),z,wr(-.05,.05),WR()*6,wr(-.05,.05)));
    bk.add(new T.CircleGeometry(r*.9,10).rotateX(-Math.PI/2).translate(0,h-.05,0),WM.end,TRS(x,H(x,z),z,0,WR()*6,0));solids.push({cx:x,cz:z,r:r+.05});}
  {const x=c.x+5,z=c.z-4,L=9.5;putLog(bk,.2,L,TRS(x,H(x,z)+.17,z,0,.7,Math.PI/2),WM.bark);addCover(x,H(x,z),H(x,z)+.4,z,L/2,.22,.7,'clearLog');
    for(let k=0;k<5;k++){const t=(k/4-.5)*L*.8;const bx=x+Math.cos(.7)*t,bz=z-Math.sin(.7)*t;bk.add(new T.CylinderGeometry(.015,.04,1.4,16).translate(0,.7,0),WM.bark,TRS(bx,H(bx,bz)+.3,bz,wr(-.9,.9),WR()*6,wr(-.9,.9)));}
    solids.push({cx:x,cz:z,r:.6},{cx:x+Math.cos(.7)*3,cz:z-Math.sin(.7)*3,r:.5},{cx:x-Math.cos(.7)*3,cz:z+Math.sin(.7)*3,r:.5});}
  /* a hunters' high seat at the edge, looking over the clearing: four poles, a deck, a rail, a ladder */
  {const x=c.x-12.5,z=c.z+8,y=H(x,z),ry=2.3;const M4=TRS(x,y,z,0,ry,0);
    [[-.8,-.8],[.8,-.8],[-.8,.8],[.8,.8]].forEach(([a,b])=>bk.add(new T.CylinderGeometry(.06,.08,3.6,16).translate(a*1.04,1.75,b*1.04).rotateZ(a*-.02),WM.bark,M4));
    bk.add(rbox(1.9,.06,1.9,.01).translate(0,2.9,0),WM.board,M4);[[0,.95],[0,-.95]].forEach(([a,b])=>bk.add(rbox(1.9,.06,.06,.01).translate(a,3.55,b),WM.bark,M4));[[.95,0],[-.95,0]].forEach(([a,b])=>bk.add(rbox(.06,.06,1.9,.01).translate(a,3.55,b),WM.bark,M4));
    for(let k=0;k<9;k++)bk.add(new T.CylinderGeometry(.025,.025,.6,5).rotateZ(Math.PI/2).translate(0,.3+k*.31,1.32+k*.04),WM.bark,M4);
    [-.3,.3].forEach(a=>bk.add(new T.CylinderGeometry(.04,.045,3.2,16).translate(a,1.5,1.45).rotateX(.08),WM.bark,M4));
    solids.push({cx:x,cz:z,r:1.2});}
  bk.flush(scene,true);})();

/* ======================= scattered cover along the far shore (where the causeway climbs out) ======================= */
(function shoreCover(){const bk=bucket();
  /* washed-up logs: two across, one on top */
  {const x=-851.4,z=-340.2,y=H(x,z);[[-.32,0,.2],[.32,0,.21],[0,.36,.19]].forEach(([dz,dy,r],k)=>putLog(bk,r,3.4+k*.4,TRS(x+wr(-.1,.1),y+r+dy*1.02-.04,z+dz,0,.25+k*.05,Math.PI/2),WM.bark));
    addCover(x,y-.1,y+.86,z,1.7,.6,.25,'logs1');solids.push({cx:x,cz:z,r:.9},{cx:x+1.2,cz:z-.3,r:.7},{cx:x-1.2,cz:z+.3,r:.7});WEST.spots.c1=V3(x+.4,0,z-1.1);}
  /* a precast culvert ring rolled off the old dyke, lying on its side in the shallows */
  {const x=-840.6,z=-335.3,y=H(x,z);const ring=new T.CylinderGeometry(.78,.78,1.2,22,1,true),inn=flipIn(new T.CylinderGeometry(.64,.64,1.2,22,1,true));
    const M4=TRS(x,y+.55,z,0,.4,Math.PI/2+.06);bk.add(ring,WM.conc,M4);bk.add(inn,WM.conc,M4);
    const rim=new T.RingGeometry(.64,.78,22);[.6,-.6].forEach(o=>bk.add(rim.clone().rotateX(o>0?-Math.PI/2:Math.PI/2).translate(0,o,0),WM.conc,M4));
    addCover(x,y-.2,y+1.3,z,.62,.78,.4,'pipe');solids.push({cx:x,cz:z,r:.85});WEST.spots.c2=V3(x+.6,0,z-1.4);}
  /* a 2PTS-4 tractor trailer half sunk off the causeway: steel bed with drop sides, one side hanging open, wheels in the mud */
  {const x=-833.6,z=-346.2,y=H(x,z);const g=new T.Group();g.position.set(x,Math.max(y,W3.wl-.7)+.3,z);g.rotation.set(.06,.32,-.11);scene.add(g);
    mesh(rbox(4.6,.12,2.2,.02),WM.rust,0,.4,0,g);[-1,1].forEach(s=>mesh(rbox(4.6,.62,.06,.01),WM.rust,0,.75,s*1.08,g));mesh(rbox(.06,.62,2.2,.01),WM.rust,2.27,.75,0,g);
    const flap=mesh(rbox(.06,.62,2.2,.01),WM.rust,-2.3,.45,0,g);flap.rotation.z=1.2;for(let k=0;k<5;k++)mesh(rbox(.06,.66,.05,.01),WM.rust,-1.9+k*.95,.75,1.1,g);
    mesh(rbox(4.2,.16,.12,.02),WM.rust,0,.25,.6,g);mesh(rbox(4.2,.16,.12,.02),WM.rust,0,.25,-.6,g);mesh(rbox(1.4,.12,.12,.02),WM.rust,3,.2,0,g);
    [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const t=new T.Mesh(new T.TorusGeometry(.38,.14,8,18),M.tire||M.black);t.position.set(a*1.2,.05,b*1.05);g.add(t);const hb=new T.Mesh(new T.CylinderGeometry(.2,.2,.16,12),WM.rust);hb.rotation.x=Math.PI/2;hb.position.copy(t.position);g.add(hb);});
    g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;shootables.push(q);}});addCover(x,g.position.y-.2,g.position.y+1.05,z,2.3,1.1,.32,'trailer');solidAABB(x-2,x+2,z-1.4,z+1.4);WEST.spots.c3=V3(x+.8,0,z+2.0);}
  bk.flush(scene,true);})();

/* ======================= the lumber yard on the far shore ======================= */
/* a log store from the collective's day on the dry knoll across the basin: a log shack (its north-east corner caved in,
   half the roof gone with it), log piles, a firewood rick. The separatists have dug in: sandbags on the broken wall
   stub and a plank firing platform behind them, a sandbag wall along the top of the bank, a tarp shelter with their
   table and radio, a campfire still smouldering. */
(function lumberYard(){const bk=bucket(),bkS=bucket();const SH={x:-879,z:-334,W:4.6,D:7};const y0=H(SH.x,SH.z);WEST.yardY=y0;
  const LR=.13,LS=.235,NL=10,top=.12+NL*LS,ov=.3;const r=rng(808),rr=(a,b)=>a+(b-a)*r();
  const W2=SH.W/2,D2=SH.D/2;const L2W=(lx,ly,lz)=>[SH.x+lx,y0+ly,SH.z+lz];
  const open={S:[[-.48,.48,0,1.94]],N:[],E:[[-2.5,-1.6,.95,1.62]],W:[[-.5,.45,.95,1.62]]};
  /* where the corner caved in: the east wall above the sixth course north of the window, the north wall above the
     seventh east of its middle - each course breaks at a slightly different place */
  const cut=(wall,k)=>wall==='E'&&k>=6?-.35+rr(-.25,.35)-(k-6)*.18:wall==='N'&&k>=7?.6+rr(-.2,.3)-(k-7)*.15:null;
  const logAt=(axis,c,a0,a1,y,k,wall)=>{const L=a1-a0;if(L<.12)return;const rad=LR*rr(.92,1.06),m=(a0+a1)/2,sag=rr(-.012,.012);
    const [x,yy,z]=axis==='x'?L2W(m,y+sag,c):L2W(c,y+sag,m);const M4=axis==='x'?TRS(x,yy,z,0,rr(-.012,.012),Math.PI/2):TRS(x,yy,z,Math.PI/2,0,rr(-.012,.012));putLog(bk,rad,L,M4,WM.log);};
  for(let k=0;k<NL;k++){const y=.12+k*LS;
    [['S',-D2,'x'],['N',D2,'x'],['E',W2,'z'],['W',-W2,'z']].forEach(([nm,c,axis])=>{const half=(axis==='x'?SH.W:SH.D)/2;const ext=((k%2===0)===(axis==='x'))?ov:0;const yy=axis==='x'?y:y+LS/2;
      let segs=[[-half-ext,half+ext]];open[nm].forEach(o=>{if(yy+LR*.5<o[2]||yy-LR*.5>o[3])return;const ns=[];segs.forEach(s=>{if(o[1]<=s[0]||o[0]>=s[1]){ns.push(s);return;}if(o[0]>s[0])ns.push([s[0],o[0]]);if(o[1]<s[1])ns.push([o[1],s[1]]);});segs=ns;});
      const cu=cut(nm,k);if(cu!==null)segs=segs.map(s=>[s[0],Math.min(s[1],cu)]).filter(s=>s[1]-s[0]>.12);
      segs.forEach(s=>logAt(axis,c,s[0],s[1],yy,k,nm));});}
  /* sill logs and the south top plate */
  putLog(bk,LR,SH.D,TRS(...L2W(W2,.12-LS/2,0),Math.PI/2,0,0),WM.log);putLog(bk,LR,SH.D,TRS(...L2W(-W2,.12-LS/2,0),Math.PI/2,0,0),WM.log);
  putLog(bk,LR,SH.W+2*ov,TRS(...L2W(0,top,-D2),0,0,Math.PI/2),WM.log);
  /* the fallen logs from the corner: outside along the east wall, two inside under the gap */
  [[3.2,1.6,.5,.3,0],[3.6,2.1,.9,-.25,0],[3.0,2.4,1.5,.15,1],[2.6,1.2,2.6,-.5,0]].forEach(([dx,dz,a,ry,on])=>{const L=rr(2.2,3.6),yw=a+ry,[cx_,,cz_]=L2W(dx,0,dz);
    /* it lies along the ground as the ground lies - each end on what is under it, raised only where a hump would come
       through it (and the one thrown across another rests on that) */
    const dx_=Math.cos(yw)*L/2,dz_=-Math.sin(yw)*L/2;const A=V3(cx_-dx_,0,cz_-dz_),B=V3(cx_+dx_,0,cz_+dz_);A.y=H(A.x,A.z);B.y=H(B.x,B.z);
    let lift=0;for(let t=0;t<=1;t+=.1){const x=lerp(A.x,B.x,t),z=lerp(A.z,B.z,t);lift=Math.max(lift,H(x,z)-lerp(A.y,B.y,t)-LR*.25);}
    const up=LR*.88+lift+(on?LR*1.75:0);A.y+=up;B.y+=up;putLogAB(bk,LR,A,B,WM.log);});
  putLog(bk,LR,2.4,TRS(...L2W(1.3,.14,3.0),.0,.4,Math.PI/2+.08),WM.log);
  /* roof: rafters, a ridge beam snapped where the corner went, rusted corrugated sheets on the west slope, boards on what
     is left of the east slope with a few hanging into the gap */
  const ridge=top+1.3,eave=top-.08,ex=W2+.38,pitch=Math.atan2(ridge-eave,ex),slope=Math.hypot(ex,ridge-eave);
  for(let z=-D2-.2;z<=D2+.21;z+=1.12){[-1,1].forEach(sd=>{if(sd>0&&z>-.9)return;const M4=TRS(...L2W(sd*ex/2,(ridge+eave)/2,z),0,0,sd*(Math.PI/2-pitch));bk.add(new T.CylinderGeometry(.055,.06,slope+.15,16),WM.bark,M4);});}
  {const zb=.55;putLog(bk,.08,zb+D2+.3,TRS(...L2W(0,ridge-.05,(zb-D2-.3)/2),Math.PI/2,0,0),WM.bark);
   putLog(bk,.075,2.1,TRS(...L2W(.2,ridge-.75,zb+.85),Math.PI/2+.75,.1,0),WM.bark);}
  {const sh=new T.PlaneGeometry(1.0,slope+.25,20,1);const p=sh.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/.125*Math.PI*2)*.016);sh.computeVertexNormals();
   for(let i=0;i<8;i++){const z=-D2-.35+.5+i*.98;const M4=TRS(...L2W(-ex/2-.03,(ridge+eave)/2+.08,z),0,0,0);const R4=new T.Matrix4().makeRotationX(-Math.PI/2);const R5=new T.Matrix4().makeRotationZ(-(Math.PI/2-pitch));const R6=new T.Matrix4().makeRotationY(-Math.PI/2);
     const q=sh.clone();q.applyMatrix4(new T.Matrix4().makeRotationX(-Math.PI/2));q.applyMatrix4(new T.Matrix4().makeRotationY(Math.PI/2));q.applyMatrix4(new T.Matrix4().makeRotationZ(-(Math.PI/2-pitch)+Math.PI/2));
     q.applyMatrix4(TRS(...L2W(-ex/2-.04,(ridge+eave)/2+.07+(i===6?-.05:0),z+(i%2?.02:0)),i===6?.06:0,0,0));bkS.add(q,WM.corr);}}
  {const bw=.22;for(let z=-D2-.35;z<-.85;z+=bw+.01){const q=rbox(slope+.2,.025,bw,.004);q.applyMatrix4(TRS(...L2W(ex/2+.03,(ridge+eave)/2+.06,z),0,0,-pitch));bk.add(q,WM.board);}
   /* broken boards hanging down into the gap */
   [[-.55,.9,.2],[-.3,1.25,-.35],[0.15,1.5,.5],[.5,1.1,-.2]].forEach(([z,dr,tw])=>{const q=rbox(rr(1.1,1.9),.025,bw,.004);q.translate(.5,0,0);q.applyMatrix4(TRS(...L2W(.15,ridge-.12,z),tw*.2,0,-pitch-dr));bk.add(q,WM.board);});}
  /* a second camouflage tarp thrown over the hole where the corner and the roof came down - so the gap does not show
     from the air - sagging into it between the remaining rafters, its edges hanging over the east and north walls and
     leaving a slit above the sandbags to shoot through */
  {const NU=26,NV=22,pos=[],uvs=[],idx=[];
   for(let j=0;j<=NV;j++)for(let i=0;i<=NU;i++){const u=i/NU,v=j/NV;let x=u*(W2+.32),z=lerp(-1.15,D2+.3,v);
     let y=ridge-Math.min(x,ex)/ex*(ridge-eave)+.06-.34*Math.sin(Math.PI*Math.min(1,u/.84))*Math.sin(Math.PI*Math.min(1,v/.9))+Math.sin(x*9+z*4)*.014+Math.sin(z*13)*.008;
     if(u>.84){const t=(u-.84)/.16,ye=eave+.04;x=W2+.3;y=lerp(ye,1.98,t)+Math.sin(z*5)*.04*t;}
     if(v>.9){const t=(v-.9)/.1;z=D2+.28;y=lerp(y,2.02+Math.sin(x*4)*.05,t);}
     const [wx,wy,wz]=L2W(x,y,z);pos.push(wx,wy,wz);uvs.push(x/3.4,z/3.4);}
   for(let j=0;j<NV;j++)for(let i=0;i<NU;i++){const a_=j*(NU+1)+i,b_=a_+1,c_=a_+NU+1,d_=c_+1;idx.push(a_,c_,b_,b_,c_,d_);}
   const tg=new T.BufferGeometry();tg.setAttribute('position',new T.Float32BufferAttribute(pos,3));tg.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));tg.setIndex(idx);tg.computeVertexNormals();bkS.add(tg,WM.camo);
   addCover(SH.x+W2/2,y0+top-.1,y0+ridge,SH.z+1.6,W2/2+.35,2.2,0,'tarpN');}
  /* gable boards on the south end (the north end went with the corner) */
  for(let y=top;y<ridge-.05;y+=.18){const w=(1-(y-top)/(ridge-top))*(ex*2)-.05;if(w<.2)break;bk.add(rbox(w,.17,.03,.005),WM.board,TRS(...L2W(0,y+.09,-D2-.14)));}
  /* the door: planks on two ledges, hanging open off its top hinge */
  {const dg=new T.Group();dg.position.set(...L2W(-.47,0,-D2-.16));dg.rotation.set(0,-1.65,.03);scene.add(dg);for(let i=0;i<5;i++)mesh(rbox(.185,1.86,.035,.004),WM.board,.1+i*.19,.95,0,dg);
   [.35,1.55].forEach(y=>mesh(rbox(.92,.12,.03,.004),WM.board,.48,y,-.03,dg));mesh(rbox(.3,.03,.01,.003),WM.rust,.15,1.55,-.05,dg);dg.traverse(q=>{if(q.isMesh)shootables.push(q);});}
  /* boards nailed over the west window */
  [[.0,1.1,.1],[.0,1.35,-.15],[.05,1.55,.08]].forEach(([a,y,t])=>bk.add(rbox(1.15,.12,.025,.004),WM.board,TRS(...L2W(-W2-.15,y,a),0,Math.PI/2,t)));
  /* inside: a barrel stove in the north-west corner with its pipe out through the roof, shelves on the west wall, a
     plank cot, the crate where they keep the good things */
  /* the fire is in here now, not out in the yard: a barrel stove kept low - a few embers glowing dull red behind the
     door's vent slots, the pot of water warming on top. Nothing that shows from the air */
  {const [x,yy,z]=L2W(-1.6,0,2.7);const st=new T.Group();st.position.set(x,yy,z);st.rotation.y=Math.PI/2;scene.add(st);
   const soot=std({color:C(0x1c1916),roughness:.8,metalness:.4,envMapIntensity:.3}),drum=std({map:PB.rust.a,normalMap:PB.rust.n,color:C(0x5a4a40),roughness:.85,metalness:.3,envMapIntensity:.25});
   /* the drum on its side, its rims, the flat top plate welded on, four angle-iron legs */
   mesh(new T.CylinderGeometry(.29,.29,.82,28,1,true),drum,0,.52,0,st).rotation.z=Math.PI/2;
   [-.41,.41].forEach(a=>{const rm=mesh(new T.TorusGeometry(.29,.012,8,28),drum,a,.52,0,st);rm.rotation.y=Math.PI/2;});
   [-.13,.13].forEach(a=>{const rm=mesh(new T.TorusGeometry(.292,.008,6,28),drum,a,.52,0,st);rm.rotation.y=Math.PI/2;});
   mesh(new T.CircleGeometry(.29,28),soot,-.41,.52,0,st).rotation.y=-Math.PI/2;
   mesh(rbox(.7,.02,.34,.004),soot,0,.82,0,st);
   [[-.3,-.18],[-.3,.18],[.3,-.18],[.3,.18]].forEach(([a,b])=>{const l=mesh(rbox(.04,.3,.04,.004),drum,a,.15,b,st);l.rotation.set(b>0?.15:-.15,0,a>0?-.1:.1);});
   /* the door on the front end: a plate on two hinges with vent slots, embers glowing through them, a latch */
   const fr=new T.Group();fr.position.set(.415,.52,0);fr.rotation.y=Math.PI/2;st.add(fr);
   const glow=std({color:C(0x120604),emissive:C(0xff3a0c),emissiveIntensity:.55,roughness:1});WEST.stoveGlow=glow;
   mesh(new T.CircleGeometry(.2,24),glow,0,0,-.004,fr);mesh(new T.RingGeometry(.198,.292,32,1),soot,0,0,-.002,fr);
   const door=new T.Shape();door.absarc(0,0,.2,0,Math.PI*2,false);for(let i=0;i<4;i++){const hl=new T.Path();const y=-.1+i*.05;hl.moveTo(-.09,y-.008);hl.lineTo(.09,y-.008);hl.lineTo(.09,y+.008);hl.lineTo(-.09,y+.008);hl.lineTo(-.09,y-.008);door.holes.push(hl);}
   mesh(new T.ExtrudeGeometry(door,{depth:.012,bevelEnabled:false,curveSegments:24}),soot,0,0,0,fr);
   [-.12,.12].forEach(y=>mesh(new T.CylinderGeometry(.012,.012,.05,10),drum,-.2,y,.006,fr));mesh(rbox(.06,.02,.02,.004),drum,.17,.0,.02,fr);
   /* the pipe: up from the back of the top, a damper handle, out through the roof */
   mesh(new T.CylinderGeometry(.065,.065,2.6,16),drum,-.22,2.1,0,st);mesh(new T.TorusGeometry(.068,.01,8,16),drum,-.22,.95,0,st).rotation.x=Math.PI/2;
   mesh(rbox(.16,.012,.02,.003),M.black,-.22,1.15,.09,st);
   /* the soot-black pot moved in off the old fire, on the top plate */
   mesh(lathe([[0,0],[.13,0],[.145,.03],[.145,.17],[.155,.18],[.135,.18],[.13,.02],[0,.02]],24),M.black,.1,.83,0,st);
   st.traverse(q=>{if(q.isMesh){q.castShadow=q.receiveShadow=true;}});
   /* the light from the embers: dim, orange, reaching only the floor in front of it */
   const L=new T.PointLight(0xff6a2a,.0,3.2,2);L.position.set(.7,.4,0);st.add(L);WEST.stoveL=L;st.updateMatrixWorld(true);WEST.stove=st.localToWorld(V3(.42,.5,0));
   WEST.fire=st.localToWorld(V3(-.22,3.35,0));}
  /* the shelves: on the solid wall north of the west window, their back edge on the logs, each on two brackets nailed to the wall */
  [1.1,1.55].forEach(y=>{bk.add(rbox(.32,.03,1.6,.005),WM.plank,TRS(...L2W(-W2+.13+.16,y,-1.45)));[-2.1,-.8].forEach(zz=>{bk.add(rbox(.04,.22,.04,.004),WM.board,TRS(...L2W(-W2+.13+.02,y-.125,zz)));bk.add(rbox(.04,.04,.28,.004),WM.board,TRS(...L2W(-W2+.13+.12,y-.13,zz),Math.PI/4.5,Math.PI/2,0));});});
  {const jar=std({color:C(0x8a9688),roughness:.25,transparent:true,opacity:.7,envMapIntensity:.5});for(let i=0;i<6;i++){const [x,yy,z]=L2W(-W2+.29,1.115+(i%2)*.45,-2.1+i*.25);const m=mesh(lathe([[0,0],[.05,0],[.055,.02],[.055,.13],[.04,.16],[.04,.18],[0,.18]],12),i%3?M.tushonka:jar,x,yy,z,scene);m.castShadow=true;const sh=mesh(new T.CircleGeometry(.075,16),CONTACT(),x,yy+.002,z,scene,false);sh.rotation.x=-Math.PI/2;sh.renderOrder=2;}}
  bk.add(rbox(.8,.05,1.9,.01),WM.plank,TRS(...L2W(-1.75,.42,.5)));[[-.7],[.7]].forEach(([a])=>putLog(bk,.16,.8,TRS(...L2W(-1.75,.16,.5+a),0,0,Math.PI/2),WM.bark));
  const crate=std({map:PB.boards.a,normalMap:PB.boards.n,roughness:.9,color:C(0x5c6a48)});
  [[-1.5,-2.6,0],[-1.5,-2.6,.46],[-.8,-2.85,0]].forEach(([a,b,y])=>{const m=mesh(rbox(.75,.44,.45,.02),crate,...L2W(a,y+.22,b),scene);m.rotation.y=rr(-.1,.1);shootables.push(m);});
  /* on the cot: a school exercise book gone soft with damp, a stub of pencil lying on its cover - one of them was writing home */
  {const [x,yy,z]=L2W(-1.62,.447,1.0);const nb=new T.Group();nb.position.set(x,yy,z);nb.rotation.y=.42;scene.add(nb);
   const cov=tex(256,320,(g,w,h)=>{g.fillStyle='#7d8a6e';g.fillRect(0,0,w,h);const q=rng(77);for(let i=0;i<2600;i++){g.fillStyle=`rgba(${q()<.5?40:150},${q()<.5?46:150},${q()<.5?30:130},${.04+q()*.05})`;g.fillRect(q()*w,q()*h,1+q()*2,1+q()*2);}
     g.strokeStyle='rgba(30,34,24,.75)';g.lineWidth=3;g.strokeRect(46,52,164,96);g.fillStyle='rgba(30,34,24,.85)';g.font='bold 30px serif';g.textAlign='center';g.fillText('ТЕТРАДЬ',128,92);
     g.lineWidth=1.5;for(const y of [112,130])g.beginPath(),g.moveTo(62,y),g.lineTo(194,y),g.stroke();g.font='italic 20px serif';g.fillText('Саша',128,126);
     /* damp: a tide mark, a dark corner, a ring from a mug */const r=g.createRadialGradient(230,300,10,230,300,140);r.addColorStop(0,'rgba(40,36,24,.35)');r.addColorStop(1,'rgba(40,36,24,0)');g.fillStyle=r;g.fillRect(0,0,w,h);
     g.strokeStyle='rgba(60,44,28,.35)';g.lineWidth=5;g.beginPath();g.arc(170,236,38,0,6.3);g.stroke();},{clamp:true});
   const page=std({color:C(0xd9d2bd),roughness:.95,envMapIntensity:.2});
   mesh(rbox(.166,.007,.204,.0015),page,0,.0035,0,nb);
   const top=mesh(new T.PlaneGeometry(.17,.207),std({map:cov,roughness:.9,envMapIntensity:.2}),0,.0074,0,nb);top.rotation.x=-Math.PI/2;
   const bot=mesh(new T.PlaneGeometry(.17,.207),std({color:C(0x6f7b62),roughness:.9}),0,.0002,0,nb);bot.rotation.x=Math.PI/2;
   [-.06,.06].forEach(zz=>mesh(rbox(.004,.0012,.012,.0004),M.gun,-.085,.0068,zz,nb));
   /* (the pencil it is written in, left lying across the cover) */const pen=new T.Group();pen.position.set(.012,.0112,.018);pen.rotation.set(0,.55,Math.PI/2);nb.add(pen);
   mesh(new T.CylinderGeometry(.0036,.0036,.085,6),std({color:C(0x7a4a24),roughness:.7}),0,0,0,pen);mesh(new T.ConeGeometry(.0036,.014,6),std({color:C(0xc8a37a),roughness:.8}),0,.0495,0,pen);
   mesh(new T.ConeGeometry(.0012,.005,6),M.black,0,.0565,0,pen);
   nb.traverse(q=>{if(q.isMesh){q.castShadow=q.receiveShadow=true;}});
   interact.push({obj:nb,off:V3(0,.02,0),r:1.7,label:'Read the notebook',fn(){openNote();}});}
  WEST.spots.lootCrate=V3(...L2W(-.8,.44,-2.85));
  /* the firing platform in the caved-in corner: plank deck on two log cribs, a crate and a round to step up on */
  [[.42],[1.9]].forEach(([a])=>{for(let k=0;k<4;k++){const al=k%2;putLog(bk,.11,al?1.2:2.5,TRS(...L2W(a+(al?0:0),.11+k*.21,1.8),al?0:Math.PI/2,0,al?Math.PI/2:0),WM.bark);}});
  for(let i=0;i<9;i++)bk.add(rbox(.2,.045,2.95,.004),WM.board,TRS(...L2W(.3+i*.205,.11+3*.21+.11+.02,1.8)));
  {const m=mesh(rbox(.6,.4,.45,.02),crate,...L2W(-.2,.2,1.2),scene);m.rotation.y=.3;}putLog(bk,.2,.35,TRS(...L2W(-.05,.17,2.0)),WM.bark);
  WEST.spots.e1=V3(...L2W(1.25,.11+3*.21+.11+.045,1.85));
  /* collision: the walls (with the door gap), the platform */
  {const X=SH.x,Z=SH.z,t=.18;solidAABB(X-W2-t,X+W2+t,Z+D2-t,Z+D2+t);solidAABB(X-W2-t,X-W2+t,Z-D2,Z+D2);solidAABB(X+W2-t,X+W2+t,Z-D2,Z+D2);
   solidAABB(X-W2-t,X-.5,Z-D2-t,Z-D2+t);solidAABB(X+.5,X+W2+t,Z-D2-t,Z-D2+t);solidAABB(X+.2,X+2.1,Z+.3,Z+3.3);solidAABB(X-2.2,X-1.3,Z-.5,Z+1.5);solidAABB(X-2,X-1.2,Z+2.3,Z+3.1);solidAABB(X-1.95,X-.4,Z-3.2,Z-2.4);
   /* cover: the walls stop rounds and sight; the collapsed corner stands only to the stub (the bags on top count) */
   addCover(X,y0,y0+top+.2,Z-D2,W2+.2,.16,0,'wallS');addCover(X-W2,y0,y0+top+.2,Z,.16,D2+.2,0,'wallW');
   addCover(X+W2,y0,y0+top+.2,Z-2.0,.16,1.6,0,'wallE1');addCover(X+W2,y0,y0+1.98,Z+1.6,.16,2.0,0,'wallE2');
   addCover(X-1.2,y0,y0+top+.2,Z+D2,1.3,.16,0,'wallN1');addCover(X+1.4,y0,y0+1.98,Z+D2,1.0,.16,0,'wallN2');
   addCover(X,y0+top,y0+ridge,Z-1.3,W2+.4,2.4,0,'roofS');}
  /* sandbags: the parapet on the east wall stub and along the north stub, the wall across the top of the bank and its
     dog-leg at the south end */
  /* (one course only: a single bag high, so the gap above it stays open to shoot through) */bagWall(null,SH.x+W2,y0+.12+5*LS+LS/2+LR-.03,SH.z+1.75,3.3,Math.PI/2,.11,1,31);
  bagWall(null,SH.x+1.45,y0+.12+6*LS+LR-.03,SH.z+D2,1.8,0,.11,1,32);
  {const x=-865.7,z=-336.4,yy=H(x,z)-.03;bagWall(null,x,yy,z,7.2,Math.PI/2,1.15,2,33);addCover(x,yy,yy+1.12,z,.34,3.6,0,'bagsE');WEST.spots.e2=V3(x-.75,yy,z-.4);
   /* (its north end butts into the foot of the long wall, no gap at the corner) */const x2=-866.68,z2=-340.75,y2=H(x2,z2)-.03;bagWall(null,x2,y2,z2,2.4,Math.PI/2+.7,1.0,2,34);addCover(x2,y2,y2+1,z2,.34,1.2,.7,'bagsS');}
  /* log piles held with stakes; their ends show the rings */
  const pile=(cx,cz,ry,len,n,tag)=>{const rad=.19;const yy=Math.min(H(cx,cz),H(cx+Math.cos(ry)*len*.45,cz-Math.sin(ry)*len*.45),H(cx-Math.cos(ry)*len*.45,cz+Math.sin(ry)*len*.45))+.02;const cr=Math.cos(ry),sr=Math.sin(ry);
    for(let j=0;j<n;j++)for(let i=0;i<n-j;i++){const off=(i-(n-j-1)/2)*rad*2.02,hh=rad+j*rad*1.72,ln=len*rr(.92,1.04),sl=rr(-.18,.18);
      const lx=sl,lz=off;putLog(bk,rad*rr(.88,1.08),ln,TRS(cx+lx*cr+lz*sr,yy+hh-.03,cz-lx*sr+lz*cr,0,ry+rr(-.03,.03),Math.PI/2),WM.log);}
    [-1,1].forEach(s=>[-1,1].forEach(e=>{const lx=e*len*.34,lz=s*(n*rad+.06);bk.add(new T.CylinderGeometry(.04,.05,1.1,16).translate(0,.4,0),WM.bark,TRS(cx+lx*cr+lz*sr,yy,cz-lx*sr+lz*cr,0,0,s*.12));}));
    addCover(cx,yy,yy+rad*2+(n-1)*rad*1.72,cz,len/2,n*rad,ry,tag);
    const ex2=len/2*Math.abs(cr)+n*rad*Math.abs(sr),ez2=len/2*Math.abs(sr)+n*rad*Math.abs(cr);solidAABB(cx-ex2,cx+ex2,cz-ez2,cz+ez2);};
  pile(-869.4,-328.2,Math.PI/2,4.6,4,'pileN');WEST.spots.e3=V3(-870.75,0,-328.4);
  pile(-866.4,-343.4,.1,4.2,4,'pileSE');WEST.spots.e4=V3(-866.5,0,-344.75);
  /* a firewood rick against the south wall */
  {const cx=-881.3,cz=-338.05,yy=H(cx,cz);for(let k=0;k<6;k++)for(let i=0;i<9;i++){const M4=TRS(cx-.95+i*.23+rr(-.02,.02),yy+.1+k*.2,cz+rr(-.04,.04),Math.PI/2,0,0);const g=logGeo(.095,.5,7);bk.add(g.s,WM.bark,M4);g.e.forEach(e=>bk.add(e,WM.end,M4));}
   [-1.1,1.1].forEach(a=>bk.add(new T.CylinderGeometry(.04,.05,1.45,16).translate(0,.7,0),WM.bark,TRS(cx+a,yy,cz)));solidAABB(cx-1.15,cx+1.15,cz-.3,cz+.3);}
  /* chopping block with an axe, a sawhorse with a log on it and the bow saw */
  {const cx=-875.6,cz=-340.4,yy=Math.min(H(cx,cz),H(cx+.25,cz),H(cx-.25,cz),H(cx,cz+.25),H(cx,cz-.25))-.03;
   /* the block: a round of birch, its top scarred by years of splitting, a split down one side */
   bk.add(new T.CylinderGeometry(.25,.28,.53,24,3).translate(0,.265,0),WM.bark,TRS(cx,yy,cz,0,.3,0));
   {const top=new T.CircleGeometry(.252,24);top.rotateX(-Math.PI/2);top.translate(0,.531,0);bk.add(top,WM.end,TRS(cx,yy,cz,0,.3,0));}
   bk.add(rbox(.01,.3,.16,.002),WM.char,TRS(cx+.27,yy+.32,cz+.04,0,0,.02));
   /* the axe: the head's blade bitten into the top of the block, the haft rising out of it at an angle */
   {const ag=new T.Group();ag.position.set(cx+.04,yy+.53+.105,cz+.02);ag.rotation.set(0,.7,.62,'YXZ');scene.add(ag);
    const prof=new T.Shape();prof.moveTo(-.03,.05);prof.lineTo(.032,.05);prof.lineTo(.036,-.015);prof.quadraticCurveTo(.05,-.09,.072,-.165);prof.quadraticCurveTo(0,-.19,-.075,-.17);prof.quadraticCurveTo(-.052,-.1,-.034,-.02);prof.lineTo(-.03,.05);
    const eye=new T.Path();eye.absellipse(0,.012,.016,.024,0,Math.PI*2,true);prof.holes.push(eye);
    const hg=new T.ExtrudeGeometry(prof,{depth:.034,bevelEnabled:true,bevelThickness:.004,bevelSize:.003,bevelSegments:2,curveSegments:10});hg.translate(0,0,-.017);
    /* (the blade thins to its edge: pull the front and back faces together towards the bottom) */
    {const q=hg.attributes.position;for(let i=0;i<q.count;i++){const y=q.getY(i),k=sstep(-.04,-.17,y);q.setZ(i,q.getZ(i)*(1-.88*k));}hg.computeVertexNormals();}
    const steel=std({color:C(0x2a2a28),roughness:.42,metalness:.85,envMapIntensity:.6});
    const hm_=mesh(hg,steel,0,0,0,ag);hm_.castShadow=true;
    /* the haft: through the eye, a long gentle S to a swelled end */
    const cu=new T.CatmullRomCurve3([V3(-.0,.012,0),V3(.12,.008,0),V3(.36,.0,0),V3(.58,.012,0),V3(.7,.03,0)]);
    const haft=new T.TubeGeometry(cu,24,.015,10,false);{const q=haft.attributes.position;for(let i=0;i<q.count;i++){const x=q.getX(i);const sw=1+.35*sstep(.55,.7,x)-.15*sstep(.05,.3,x)*(1-sstep(.3,.5,x));const c=cu.getPoint(clamp(x/.7,0,1));q.setY(i,c.y+(q.getY(i)-c.y)*sw);q.setZ(i,q.getZ(i)*sw*1.25);}haft.computeVertexNormals();}
    mesh(haft,WM.plank,0,0,0,ag).castShadow=true;mesh(new T.SphereGeometry(.021,12,8),WM.plank,.7,.03,0,ag).scale.set(.6,1,1.2);
    mesh(new T.CylinderGeometry(.006,.006,.042,6),steel,0,.044,0,ag).rotation.x=Math.PI/2;}
   solids.push({cx,cz,r:.3});
   /* the sawhorse: two X-trestles of poles lashed where they cross, a stretcher between, the log lying in the crotches;
      a bow saw hung on one end */
   const sx=-876.8,sz=-342.2,sy=Math.min(H(sx-.6,sz),H(sx+.6,sz))-.04;const L=1.15,cr=.62;
   [-.55,.55].forEach(a=>{[-1,1].forEach(b=>{const ang=b*.55;const M4=TRS(sx+a,sy,sz,ang,0,0);const g=new T.CylinderGeometry(.032,.036,L,12);g.translate(0,L/2,0);bk.add(g,WM.bark,M4);});
     bk.add(new T.TorusGeometry(.045,.008,6,14),WM.rope||WM.canvas,TRS(sx+a,sy+Math.cos(.55)*cr,sz,0,Math.PI/2,0));});
   bk.add(new T.CylinderGeometry(.028,.028,1.25,10),WM.bark,TRS(sx,sy+.3,sz,0,0,Math.PI/2));
   {const ly=sy+Math.cos(.55)*cr+.15;putLog(bk,.13,1.85,TRS(sx,ly,sz,0,0,Math.PI/2),WM.bark);}
   {const bg=new T.Group();bg.position.set(sx+.62,sy+.95,sz+.05);bg.rotation.set(0,.0,-.15);scene.add(bg);const st=std({color:C(0x3a3a36),roughness:.5,metalness:.7});
    const cu=new T.CatmullRomCurve3([V3(-.32,0,0),V3(-.3,.12,0),V3(0,.2,0),V3(.3,.12,0),V3(.32,0,0)]);mesh(new T.TubeGeometry(cu,20,.012,8,false),std({color:C(0x7a4a2a),roughness:.6}),0,0,0,bg);
    mesh(new T.BoxGeometry(.66,.03,.002),st,0,-.005,0,bg);}
   solidAABB(sx-.9,sx+.9,sz-.35,sz+.35);}
  /* the tarp shelter: four poles, a sagging olive tarp tied off with ropes, their table and radio underneath */
  {const cx=-873,cz=-343.6,yy=H(cx,cz);const pts=[[-1.6,-1.4,1.55],[1.6,-1.4,1.55],[-1.6,1.4,1.95],[1.6,1.4,1.95]];
   pts.forEach(([a,b,h])=>{bk.add(new T.CylinderGeometry(.04,.05,h+.1,16).translate(0,(h+.1)/2-.05,0),WM.bark,TRS(cx+a,H(cx+a,cz+b),cz+b));solids.push({cx:cx+a,cz:cz+b,r:.08});});
   const tg=new T.PlaneGeometry(3.6,3.2,16,14);tg.rotateX(-Math.PI/2);const p=tg.attributes.position;
   for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i),u=x/3.6+.5,v=z/3.2+.5;const hh=lerp(1.55,1.95,v);p.setY(i,yy+hh+.02-Math.sin(u*Math.PI)*Math.sin(v*Math.PI)*.22+Math.sin(x*7+z*3)*.012+(Math.abs(x)>1.7||Math.abs(z)>1.5?-.06:0));p.setX(i,cx+x);p.setZ(i,cz+z);}
   tg.computeVertexNormals();bkS.add(tg,WM.camo);
   const rope=[];pts.forEach(([a,b,h])=>{const t0=V3(cx+a,yy+h,cz+b),t1=V3(cx+a*1.7,H(cx+a*1.7,cz+b*1.5),cz+b*1.5);rope.push(t0.x,t0.y,t0.z,t1.x,t1.y,t1.z);});
   {const gg=new T.BufferGeometry();gg.setAttribute('position',new T.Float32BufferAttribute(rope,3));scene.add(new T.LineSegments(gg,new T.LineBasicMaterial({color:C(0x4a463a)})));}
   /* their table, knocked together from planks: five boards on two cleats, four splayed legs, an apron and a cross-brace
      at each end; a crate under it for a seat */
   const TY=yy+.745;{const tz=cz+.3;for(let i=0;i<5;i++)bk.add(rbox(1.62,.032,.135,.004),WM.plank,TRS(cx+rr(-.01,.01),TY-.016,tz-.29+i*.145,0,rr(-.006,.006),0));
    [-.62,.62].forEach(a=>bk.add(rbox(.07,.045,.7,.006),WM.board,TRS(cx+a,TY-.055,tz)));
    [-1,1].forEach(sx=>[-1,1].forEach(sz=>bk.add(rbox(.055,.72,.055,.006),WM.board,TRS(cx+sx*.66,yy+.36,tz+sz*.28,-sz*.045,0,sx*.04))));
    [-1,1].forEach(sz=>bk.add(rbox(1.3,.08,.025,.005),WM.board,TRS(cx,TY-.1,tz+sz*.27)));
    [-1,1].forEach(sx=>{[1,-1].forEach(k=>bk.add(rbox(.025,.78,.05,.005),WM.board,TRS(cx+sx*.69,yy+.36,tz,k*.72,0,0)));});
    bk.add(rbox(1.36,.05,.04,.005),WM.board,TRS(cx,yy+.36,tz,0,0,0));
    const m=mesh(rbox(.5,.4,.4,.02),crate,cx-.2,yy+.2,cz+1.05,scene);m.rotation.y=.25;shootables.push(m);solids.push({cx:cx-.2,cz:cz+1.05,r:.3});
    /* (the seat: you can sit on that crate at their table) */WEST.seat={p:V3(cx-.2,yy+.4,cz+1.05),obj:m,radio:V3(cx+.5,TY,cz+.42)};
    solidAABB(cx-.86,cx+.86,tz-.37,tz+.37);WEST.table=V3(cx,TY,tz);}
   /* the transistor set they keep the music on: a leatherette case, a chrome-ringed grille, the tuning scale, piano keys for
      the bands on top, two knurled knobs, a strap, and the telescopic aerial run right out */
   {const rg=new T.Group();rg.position.set(cx+.5,TY,cz+.42);rg.rotation.y=-.35;scene.add(rg);
    const face=tex(512,320,(g,w,h)=>{g.fillStyle='#2b2723';g.fillRect(0,0,w,h);
      /* grille: a pressed steel plate with rows of holes */
      g.fillStyle='#8d8f8a';g.fillRect(14,14,300,292);const gr=g.createLinearGradient(0,14,0,306);gr.addColorStop(0,'rgba(255,255,255,.18)');gr.addColorStop(1,'rgba(0,0,0,.25)');g.fillStyle=gr;g.fillRect(14,14,300,292);
      g.fillStyle='#151413';for(let y=30;y<296;y+=11)for(let x=30+((y/11)%2)*5.5;x<300;x+=11){g.beginPath();g.arc(x,y,3.2,0,7);g.fill();}
      g.strokeStyle='#c9c9c2';g.lineWidth=5;g.strokeRect(14,14,300,292);
      /* the scale: cream card behind glass, bands, the numbers, the needle */
      g.fillStyle='#d8cfb4';g.fillRect(330,18,166,214);g.strokeStyle='#c9c9c2';g.lineWidth=4;g.strokeRect(330,18,166,214);
      g.fillStyle='#1d1b18';g.font='bold 15px sans-serif';const bands=[['ДВ',150,410],['СВ',530,1600],['КВ',3.9,12.1],['УКВ',66,73]];
      bands.forEach(([n,a,b],i)=>{const x=346+i*38;g.fillText(n,x-6+(n.length>2?-4:0),40);g.fillRect(x+8,48,1.5,170);for(let k=0;k<=8;k++){const y=50+k*20.5;g.fillRect(x+3,y,11,1.4);
        if(k%2===0){g.font='10px sans-serif';const v=a+(b-a)*k/8;g.fillText(v<20?v.toFixed(1):Math.round(v),x+14,y+4);g.font='bold 15px sans-serif';}}});
      g.fillStyle='#b5221b';g.fillRect(340,121,150,2.4);
      /* the switches plate and a little metal tag under the scale */
      g.fillStyle='#6d6b65';g.fillRect(332,244,162,58);g.fillStyle='#1a1917';g.font='bold 13px sans-serif';g.fillText('ГРОМК.',340,264);g.fillText('НАСТР.',420,264);
      g.fillStyle='#a8a69e';g.fillRect(352,276,40,16);g.fillRect(432,276,40,16);
      /* wear on the leatherette */for(let i=0;i<600;i++){g.fillStyle=`rgba(255,255,255,${Math.random()*.05})`;g.fillRect(Math.random()*w,Math.random()*h,1+Math.random()*2,1);}});
    face.encoding=T.sRGBEncoding;face.anisotropy=8;
    const leath=std({color:C(0x2a2521),roughness:.72,envMapIntensity:.25}),chrome=std({color:C(0xc4c4bc),roughness:.28,metalness:1,envMapIntensity:.9}),ivory=std({color:C(0xd9d1ba),roughness:.4}),blk=std({color:C(0x161514),roughness:.5});
    mesh(rbox(.32,.2,.09,.018),leath,0,.1,0,rg);
    const fp=mesh(new T.PlaneGeometry(.296,.185),std({map:face,roughness:.45,metalness:.25,envMapIntensity:.5}),0,.1,.0455,rg);fp.castShadow=false;
    mesh(rbox(.1,.128,.006,.002),std({color:C(0xffffff),roughness:.22,transparent:true,opacity:.16,envMapIntensity:.5}),.091,.12,.049,rg);
    [[.1,.006],[.1,.194],[0,.1,1],[.3,.1,1]].forEach(([x,y,v])=>mesh(v?rbox(.006,.19,.006,.002):rbox(.306,.006,.006,.002),chrome,v?x-.15:0,y+.0,.047,rg));
    for(let i=0;i<5;i++)mesh(rbox(.024,.014,.032,.003),i===2?blk:ivory,.03+i*.027,.205,.0,rg);
    [[.06,.022],[.0,.017]].forEach(([y,r],i)=>{const k=mesh(new T.CylinderGeometry(r,r,.016,20),blk,.168,.07+y,.0,rg);k.rotation.z=Math.PI/2;const c=mesh(new T.CylinderGeometry(r*.55,r*.55,.018,14),chrome,.17,.07+y,.0,rg);c.rotation.z=Math.PI/2;});
    {const cu=new T.CatmullRomCurve3([V3(-.15,.19,0),V3(-.13,.29,0),V3(0,.32,0),V3(.13,.29,0),V3(.15,.19,0)]);mesh(new T.TubeGeometry(cu,18,.008,6,false),std({color:C(0x4a3424),roughness:.6}),0,0,0,rg).scale.set(1,1,1.6);
     [-.15,.15].forEach(x=>mesh(new T.TorusGeometry(.012,.003,6,12),chrome,x,.19,0,rg));}
    {const ag=new T.Group();ag.position.set(-.13,.2,-.03);ag.rotation.set(-.25,0,.42);rg.add(ag);mesh(new T.SphereGeometry(.009,10,8),chrome,0,0,0,ag);let y=0;
     for(let i=0;i<6;i++){const r=.0042-i*.0005,L=.13;mesh(new T.CylinderGeometry(r,r,L,8),chrome,0,y+L/2,0,ag);y+=L-.008;}mesh(new T.SphereGeometry(.0035,8,6),chrome,0,y,0,ag);}
    rg.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});WEST.radio=V3(cx+.5,TY+.12,cz+.42);}
   /* the field set on a crate at the table's end: an olive R-159 with its panel, the handset and its coiled lead, the whip */
   {const rg=new T.Group();const [x,yy2,z]=[cx-1.15,yy+.44,cz+.35];{const m=mesh(rbox(.6,.44,.44,.02),crate,x,yy+.22,z,scene);m.rotation.y=.1;shootables.push(m);}
    rg.position.set(x,yy2,z);rg.rotation.y=.1+Math.PI/2;scene.add(rg);
    const pan=tex(256,192,(g,w,h)=>{g.fillStyle='#4b5139';g.fillRect(0,0,w,h);g.fillStyle='#3a3f2c';g.fillRect(8,8,w-16,h-16);
      g.fillStyle='#d9d4c0';g.font='bold 11px sans-serif';[['ЧАСТОТА',20,24],['ПРД',150,24],['ТЛФ',20,150],['АНТ',200,150],['ПИТ',120,150]].forEach(([t,a,b])=>g.fillText(t,a,b));
      g.fillStyle='#111';g.fillRect(20,32,110,30);g.fillStyle='#e8c060';g.font='bold 22px monospace';g.fillText('3 4 7 5',28,55);
      for(let i=0;i<40;i++){g.fillStyle=`rgba(200,200,170,${Math.random()*.15})`;g.fillRect(Math.random()*w,Math.random()*h,2+Math.random()*6,1);}});pan.encoding=T.sRGBEncoding;
    const ol=std({color:C(0x4a5038),roughness:.62,metalness:.15}),blk=std({color:C(0x161514),roughness:.5}),met=std({color:C(0x8a8a82),roughness:.35,metalness:1});
    mesh(rbox(.3,.22,.14,.012),ol,0,.11,0,rg);mesh(new T.PlaneGeometry(.27,.19),std({map:pan,roughness:.6}),0,.115,.0705,rg);
    [[-.06,.16,.016],[.07,.16,.013],[-.08,.05,.011],[.0,.05,.011],[.09,.05,.013]].forEach(([a,b,r])=>{const k=mesh(new T.CylinderGeometry(r,r*1.08,.018,16),blk,a,b,.08,rg);k.rotation.x=Math.PI/2;});
    [[-.11,.03],[.11,.03]].forEach(([a,b])=>{const k=mesh(new T.CylinderGeometry(.009,.009,.02,12),met,a,b,.08,rg);k.rotation.x=Math.PI/2;});
    [[-.15],[.15]].forEach(([a])=>mesh(rbox(.012,.2,.15,.004),ol,a,.11,0,rg));mesh(rbox(.28,.012,.03,.004),blk,0,.226,0,rg);
    mesh(new T.CylinderGeometry(.002,.004,1.3,5),blk,.1,.87,-.04,rg);mesh(new T.CylinderGeometry(.012,.014,.04,10),met,.1,.24,-.04,rg);
    /* the handset lying on the table and its coiled lead running back to the set */
    {const hg=new T.Group();hg.position.set(cx-.62,TY,cz+.52);hg.rotation.y=.6;scene.add(hg);mesh(rbox(.17,.03,.045,.012),blk,0,.022,0,hg);[-.075,.075].forEach(a=>mesh(new T.CylinderGeometry(.026,.024,.035,14),blk,a,.025,0,hg).rotation.z=Math.PI/2);
     const P0=V3(cx-.62,TY+.02,cz+.52),P1=V3(x+.0,yy2+.07,z+.0);const pts=[];for(let i=0;i<=160;i++){const t=i/160;const b=P0.clone().lerp(P1,t);b.y+=Math.sin(t*Math.PI)*-.05-t*.0;const a=t*Math.PI*2*38;pts.push(b.add(V3(Math.cos(a)*.008,Math.sin(a)*.008,Math.sin(a+1)*.008)));}
     mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),640,.0022,4,false),blk,0,0,0,scene);hg.traverse(q=>{if(q.isMesh)q.castShadow=true;});}
    rg.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});solids.push({cx:x,cz:z,r:.38});}
   /* a kettle and two enamel mugs */
   {const en=std({color:C(0x5a6a5a),roughness:.35});mesh(lathe([[0,0],[.1,0],[.11,.02],[.11,.13],[.08,.17],[.03,.18],[0,.18]],16),M.black,cx-.42,TY,cz+.18,scene);
    [[-.1,.5,.4],[.15,.2,2.1]].forEach(([a,b,ry],k)=>{const mg=new T.Group();mg.position.set(cx+a,TY,cz+b);mg.rotation.y=ry;scene.add(mg);
      /* an enamel mug: the wall turned with its thickness, so it has an inside and a rolled rim; a chipped black rim */
      mesh(lathe([[0,0],[.04,0],[.043,.004],[.045,.09],[.047,.094],[.044,.097],[.041,.094],[.04,.012],[0,.012]],28),en,0,0,0,mg);
      mesh(new T.TorusGeometry(.046,.0025,6,28),M.black,0,.095,0,mg).rotation.x=Math.PI/2;
      const hd=mesh(new T.TorusGeometry(.026,.006,8,16,Math.PI),en,.046,.05,0,mg);hd.rotation.z=-Math.PI/2;
      if(k===0){const tea=mesh(new T.CircleGeometry(.039,24),std({color:C(0x2a160a),roughness:.08,envMapIntensity:.8}),0,.062,0,mg);tea.rotation.x=-Math.PI/2;}
      mg.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;}});});}
   addCover(cx,yy,yy+.76,cz+.3,.86,.34,0,'table');}
  /* the old fire pit in the yard, long out: they stopped lighting fires in the open when the drones started coming. A
     shallow scoop of grey ash and charcoal, half grown over, the stones that ringed it sunk and blackened and scattered,
     one burnt stub - and the rain has packed it all down */
  {const cx=-869.9,cz=-338.7,yy=H(cx,cz);
   const at=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(77);
     for(let i=0;i<5200;i++){const a=q()*6.283,rr_=Math.pow(q(),.6)*w*.47,x=w/2+Math.cos(a)*rr_*(1+.12*Math.sin(a*3)),y=h/2+Math.sin(a)*rr_*(1+.1*Math.cos(a*2));const e=rr_/(w*.47);
       const k=q();const al=(1-Math.pow(e,3))*(.35+q()*.5);
       c.fillStyle=k<.5?`rgba(${126+q()*40|0},${118+q()*34|0},${100+q()*26|0},${al})`:k<.78?`rgba(${30+q()*20|0},${28+q()*16|0},${26+q()*14|0},${al})`:k<.93?`rgba(${70+q()*20|0},${60+q()*14|0},${48+q()*10|0},${al})`:`rgba(${160+q()*30|0},${156+q()*30|0},${148+q()*30|0},${al*.8})`;
       c.beginPath();c.arc(x,y,1+q()*3.2*(1-e*.6),0,7);c.fill();}
     /* charcoal lumps */for(let i=0;i<70;i++){const a=q()*6.28,r_=Math.sqrt(q())*w*.3;c.fillStyle=`rgba(${14+q()*12|0},${13+q()*10|0},${12+q()*8|0},.9)`;c.save();c.translate(w/2+Math.cos(a)*r_,h/2+Math.sin(a)*r_);c.rotate(q()*3);c.fillRect(-2-q()*4,-1.5-q()*2,4+q()*8,3+q()*4);c.restore();}},{clamp:true});
   const am=std({map:at,transparent:true,depthWrite:false,roughness:1,envMapIntensity:.08,polygonOffset:true,polygonOffsetFactor:-4});
   {const R=.85,g=new T.PlaneGeometry(R*2,R*2,14,14);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=cx+p.getX(i),Z=cz+p.getZ(i),d=Math.hypot(p.getX(i),p.getZ(i));p.setXYZ(i,X,H(X,Z)+.018-.07*Math.max(0,1-d/.6),Z);}g.computeVertexNormals();
    const m=new T.Mesh(g,am);m.receiveShadow=true;m.renderOrder=2;scene.add(m);}
   /* the ring stones, sunk to half their height, soot on the inner faces, two kicked out of the ring */
   const sm=rockMat();for(let i=0;i<9;i++){let a=i/9*6.28+rr(-.15,.15),d=.48+rr(-.04,.06);if(i===2||i===6){d+=rr(.25,.5);a+=rr(-.3,.3);}const s=rr(.08,.13);
     const g=rockGeo(30+i%6,{detail:3,col:[.32,.3,.28]});const rm=new T.Mesh(g,sm);rm.matrixAutoUpdate=false;rm.matrix.copy(TRS(cx+Math.cos(a)*d,H(cx+Math.cos(a)*d,cz+Math.sin(a)*d)-s*.35,cz+Math.sin(a)*d,rr(-.3,.3),rr(0,6),rr(-.3,.3),s));rm.matrix.scale(V3(1,.8,1));rm.castShadow=rm.receiveShadow=true;scene.add(rm);}
   /* one burnt stub, mostly buried */
   bk.add(new T.CylinderGeometry(.045,.055,.36,14),WM.char,TRS(cx+.12,yy+.01,cz-.08,0,.7,Math.PI/2+.18));
   solids.push({cx,cz,r:.45});}
  /* a plank boat turned over on the bank, resting on two logs */
  {const bx=-857.8,bz=-330.6,by=H(bx,bz);const g=new T.Group();g.position.set(bx,by+.65,bz);g.rotation.set(.0,.35,.05);scene.add(g);
   const out=[[-1.75,0],[-1.6,.42],[-1,.52],[1.0,.52],[1.55,.36],[1.95,0],[1.55,-.36],[1.0,-.52],[-1,-.52],[-1.6,-.42]];
   const sh=new T.Shape(out.map(([a,b])=>new T.Vector2(a,b)));const bot=new T.ExtrudeGeometry(sh,{depth:.035,bevelEnabled:false});bot.rotateX(Math.PI/2);worldUV(bot,1.2);mesh(bot,WM.plank,0,.0,0,g);
   for(let i=0;i<out.length;i++){const a=out[i],b=out[(i+1)%out.length];const L=Math.hypot(b[0]-a[0],b[1]-a[1]);if(L<.2)continue;const m=mesh(rbox(L,.38,.03,.004),WM.board,(a[0]+b[0])/2*1.06,-.19,(a[1]+b[1])/2*1.08,g);m.rotation.y=-Math.atan2(b[1]-a[1],b[0]-a[0]);m.rotation.x=(a[1]+b[1])>0?.18:-.18;}
   [-.6,.5].forEach(a=>mesh(rbox(.06,.06,1.0,.01),WM.plank,a,-.05,0,g));
   g.traverse(q=>{if(q.isMesh){q.castShadow=q.receiveShadow=true;shootables.push(q);}});
   [[-1.0],[1.0]].forEach(([a])=>putLog(bk,.14,1.5,TRS(bx+Math.cos(.35)*a,by+.12,bz-Math.sin(.35)*a,0,.35+Math.PI/2,Math.PI/2),WM.bark));
   addCover(bx,by,by+.72,bz,1.9,.55,.35,'boat');solidAABB(bx-1.7,bx+1.7,bz-.8,bz+.8);WEST.spots.c4=V3(bx+.4,0,bz-1.1);}
  /* drums and cans by the shack, a washbasin on a stump */
  {const d1=mesh(new T.CylinderGeometry(.29,.29,.88,18),WM.rust,-874.4,H(-874.4,-330.2)+.44,-330.2,scene);const d2=mesh(new T.CylinderGeometry(.29,.29,.88,18),WM.rust,-873.6,H(-873.6,-329.6)+.29,-329.6,scene);d2.rotation.set(Math.PI/2,0,.4);
   [d1,d2].forEach(q=>{q.castShadow=q.receiveShadow=true;shootables.push(q);});solids.push({cx:-874.4,cz:-330.2,r:.32},{cx:-873.6,cz:-329.6,r:.45});
   jerrycan(-875.2,H(-875.2,-330.9),-330.9,.4);}
  /* hiding from the drones: a camouflage net strung over the yard between the shack and the bank - garnish strips on cord,
     lifted on three poles and tied down at the edges - and cut spruce boughs laid along the tops of the sandbag walls and
     against the boat, so nothing in the yard shows a straight line or a bare face to the sky */
  {const netTex=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const q=rng(515);const pal=[[62,70,42],[80,86,54],[94,84,58],[50,54,36],[104,98,70],[68,60,44],[58,66,40]];
     for(let i=0;i<1300;i++){const x=q()*w,y=q()*h,an=q()*Math.PI,l=12+q()*26,wd=5+q()*8,c=pal[(q()*pal.length)|0],k=.8+q()*.4;g.fillStyle=`rgb(${c[0]*k|0},${c[1]*k|0},${c[2]*k|0})`;
       for(const ox of [0,-w,w])for(const oy of [0,-h,h]){g.save();g.translate(x+ox,y+oy);g.rotate(an);g.beginPath();g.moveTo(-l/2,0);for(let t=0;t<=8;t++){const u=t/8;g.lineTo(-l/2+u*l,-wd/2*Math.sin(u*Math.PI)*(1+.35*Math.sin(u*17)));}
         for(let t=8;t>=0;t--){const u=t/8;g.lineTo(-l/2+u*l,wd/2*Math.sin(u*Math.PI)*(1+.35*Math.cos(u*13)));}g.closePath();g.fill();g.restore();}}
     g.globalCompositeOperation='destination-out';for(let i=0;i<210;i++){g.beginPath();g.arc(q()*w,q()*h,4+q()*9,0,7);g.fill();}g.globalCompositeOperation='source-over';
     /* the net the garnish is tied to: a diamond mesh of tarred cord with a knot at every crossing, showing through the gaps
        and over the strips where they are tied on */
     g.lineCap='round';for(const [c,lw] of [['rgba(28,27,20,.95)',2.2],['rgba(74,70,50,.9)',1.0]]){g.strokeStyle=c;g.lineWidth=lw;
       for(let k=-h;k<=w+h;k+=16){g.beginPath();g.moveTo(k,0);g.lineTo(k+h,h);g.stroke();g.beginPath();g.moveTo(k+h,0);g.lineTo(k,h);g.stroke();}}
     for(let x=0;x<=w;x+=8)for(let y=0;y<=h;y+=8){if(((x+y)/8)%2)continue;g.fillStyle='rgba(30,28,20,.95)';g.beginPath();g.arc(x,y,1.8,0,7);g.fill();g.fillStyle='rgba(84,78,56,.9)';g.beginPath();g.arc(x-.5,y-.5,.9,0,7);g.fill();}},{rep:[2.2,1.8]});
   bleedAlpha(netTex,8);const netMat=std({map:netTex,alphaTest:.45,side:T.DoubleSide,roughness:1,envMapIntensity:.35,color:new T.Color(1.45,1.45,1.4)});
   const cx=-868.6,cz=-337.6,W=7.4,D=6.4,yref=H(cx,cz);
   const props=[[-2.2,-1.6,2.45],[1.9,.4,2.3],[-1.2,2.0,2.4]];
   /* a way in on the side toward the shack: the edge held up on two poles at head height, so the men go under it */
   const DZ=1.0,DH=1.85,door=(x,z)=>sstep(.45,.92,-x/(W/2))*(1-sstep(1.15,1.6,Math.abs(z-DZ)));
   [[-W/2+.12,DZ-1.4],[-W/2+.12,DZ+1.4]].forEach(p=>props.push([p[0],p[1],DH+.05]));
   const lift=(x,z)=>{let best=-9;for(const p of props){const d=Math.hypot(x-p[0],z-p[1]);best=Math.max(best,p[2]-d*d*.07-d*.04);}return best;};
   const gN=new T.PlaneGeometry(W,D,48,42);gN.rotateX(-Math.PI/2);const np=gN.attributes.position;
   for(let i=0;i<np.count;i++){const x=np.getX(i),z=np.getZ(i);const e=Math.max(Math.abs(x)/(W/2),Math.abs(z)/(D/2));const X=cx+x,Z=cz+z,gy=H(X,Z);
     let y=gy+Math.max(.15,lift(x,z));const dr=door(x,z);y=lerp(y,gy+.12,sstep(.72,1,e)*(1-dr));y=lerp(y,Math.max(y,gy+DH-(1-sstep(.85,1,-x/(W/2)))*.25),dr);y+=(fbm(x*.7,z*.7,2)-.5)*.18;np.setXYZ(i,X+(fbm(x*.5,z*.5+9,2)-.5)*.15,y,Z);}
   gN.computeVertexNormals();const nm=new T.Mesh(gN,netMat);nm.castShadow=nm.receiveShadow=true;nm.customDepthMaterial=depthMat(netTex);scene.add(nm);
   /* collision: the net comes down to the ground on every side except the raised doorway, so a man can only get under it
      there. Walking in from each edge vertex, the first point where the net is head-high (1.6 m) is where you would
      walk into it: a line of small posts goes along that contour, none across the doorway */
   {const NX=49,NZ=43,at=(i,j)=>{const k=j*NX+i;return V3(np.getX(k),np.getY(k),np.getZ(k));};const NET=[];
    const walk=(i0,j0,di,dj,n)=>{for(let s_=0;s_<n;s_++){const i=i0+di*s_,j=j0+dj*s_;const q=at(i,j);if(q.y-H(q.x,q.z)>=1.6)return q;}return null;};
    const edge=[];for(let i=0;i<NX;i+=2){edge.push([i,0,0,1,NZ>>1]);edge.push([i,NZ-1,0,-1,NZ>>1]);}for(let j=2;j<NZ-2;j+=2){edge.push([0,j,1,0,NX>>1]);edge.push([NX-1,j,-1,0,NX>>1]);}
    for(const [i,j,di,dj,n] of edge){const lx=-W/2+i/(NX-1)*W,lz=-D/2+j/(NZ-1)*D;if(door(lx,lz)>.25)continue;const q=walk(i,j,di,dj,n);if(!q)continue;const sd={cx:q.x,cz:q.z,r:.16,net:1};solids.push(sd);NET.push(sd);}
    WEST.netSolids=NET;WEST.netDoor=V3(cx-W/2+.4,0,cz+DZ);}
   props.forEach(p=>{const X=cx+p[0],Z=cz+p[1],gy=H(X,Z);bk.add(new T.CylinderGeometry(.035,.045,p[2],20).translate(0,p[2]/2,0),WM.bark,TRS(X,gy,Z));solids.push({cx:X,cz:Z,r:.06});});
   /* cut boughs */
   const bough=(x,y,z,yaw,tilt,s)=>{const g=new T.PlaneGeometry(.95*s,.5*s,4,2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i)/(.95*s);p.setZ(i,-Math.abs(u)*.12*s+Math.sin(p.getY(i)*6)*.02);}
     g.rotateX(-Math.PI/2+tilt);g.rotateY(yaw);g.translate(x,y,z);return g;};
   const bl=[];const wallTop=(x0,z0,len,ry,h,n)=>{for(let i=0;i<n;i++){const t=(i+.5)/n-.5,x=x0+Math.cos(ry)*t*len,z=z0-Math.sin(ry)*t*len;bl.push(bough(x+rr(-.15,.15),H(x0,z0)-.03+h+.02,z+rr(-.15,.15),ry+rr(-.6,.6)+(r()<.5?Math.PI:0),rr(-.15,.2),rr(.9,1.3)));}};
   for(let i=0;i<5;i++){const x=-863.6+rr(-1.4,1.4),z=-344.4+rr(-.6,.6);bl.push(bough(x,H(x,z)+.55+rr(0,.2),z,rr(0,6),rr(-.5,.5),rr(1,1.4)));}
   const bg=merge(bl);/* (cut boughs lie face-up to the sky and wilt: darker and duller than the living sprays) */const bM=std({map:TX.spray,alphaTest:.5,side:T.DoubleSide,roughness:.9,envMapIntensity:.2,color:C(0x5f6650)});const bm=new T.Mesh(bg,bM);bm.customDepthMaterial=depthMat(TX.spray);bm.castShadow=bm.receiveShadow=true;scene.add(bm);}
  /* places to fall back to, deeper in the yard: a log stack by the north fence, a dog-leg of bags by the south one and a
     low stack out in front of the bag wall - so the men holding the yard have somewhere to go when a position gets hot */
  pile(-873.8,-324.4,Math.PI/2-.18,3.8,3,'pileNW');
  {const x=-872.3,z=-347.5,yy=H(x,z)-.03;bagWall(null,x,yy,z,2.8,Math.PI/2+.1,1.05,2,35);addCover(x,yy,yy+1.05,z,.34,1.4,.1,'bagsSW');
   const x2=-871.3,z2=-349.1,y2=H(x2,z2)-.03;bagWall(null,x2,y2,z2,1.7,0,1.05,2,36);addCover(x2,y2,y2+1.05,z2,.85,.34,0,'bagsSW2');}
  pile(-861.2,-339.8,Math.PI/2-.22,3.4,3,'pileM');
  bk.flush(scene,true);bkS.flush(scene,true);flushBags&&fitBags();
  function fitBags(){const im=flushBags();if(im)fitInstBounds(im,[[-882,-351],[-860,-322]],6);}})();

/* ======================= shell craters along the highway and the district road ======================= */
(function craters(){const mat=splatMat(.45);mat.polygonOffset=true;mat.polygonOffsetFactor=-1;mat.polygonOffsetUnits=-2;const bk=bucket(),r_=rng(902),rr=(a,b)=>a+(b-a)*r_();
  /* torn-up earth: clods with the mud's own grain and relief, lumpy and broken-faced, half sunk where they landed */
  const soil=std({map:PB.mud.a,normalMap:PB.mud.n,normalScale:new T.Vector2(1.5,1.5),color:new T.Color(1.9,1.7,1.5),vertexColors:true,roughness:1,envMapIntensity:.12}),scorch=std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0x3a3632),vertexColors:true,roughness:1,envMapIntensity:.08});
  /* the terrain mesh under a crater is sunk out of the way (every vertex within 2.05 radii) - and so are the triangles
     that reach from those vertices out to the next ones, up to a grid cell further. The crater's own mesh carries on past
     the sunk zone as a skirt over that slope and ends exactly on the terrain mesh as drawn, so there is no ledge where the
     two meet (that was the flat disc with a step round it) */
  const TX_=1285/338,TZ_=1040/272,meshY=(x,z)=>{const fx=(x+905)/TX_,fz=(z+720)/TZ_,ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz;const c=(i,j)=>Hterr(-905+i*TX_,-720+j*TZ_);
    const h00=c(ix,iz),h10=c(ix+1,iz),h01=c(ix,iz+1),h11=c(ix+1,iz+1);return u+v<=1?h00+u*(h10-h00)+v*(h01-h00):h11+(1-u)*(h01-h11)+(1-v)*(h10-h11);};
  const meshMix=(x,z)=>{const fx=(x+905)/TX_,fz=(z+720)/TZ_,ix=Math.floor(fx),iz=Math.floor(fz),u=fx-ix,v=fz-iz;const c=(i,j)=>groundMix(-905+i*TX_,-720+j*TZ_);
    const a=c(ix,iz),b=c(ix+1,iz),d=c(ix,iz+1),e=c(ix+1,iz+1);return a.map((_,k)=>u+v<=1?a[k]+u*(b[k]-a[k])+v*(d[k]-a[k]):e[k]+(1-u)*(d[k]-e[k])+(1-v)*(b[k]-e[k]));};
  const RINGS=[-3,-2,-1,1.98,1.82,1.64,1.46,1.3,1.16,1.04,.94,.82,.68,.54,.4,.26,.13,0],NS=40;
  for(const c of CRATERS.L){const ps=[],sp=[],we=[],co=[];const SK=6.2/c.r;
    for(let i=0;i<=NS;i++){const a=(i%NS)/NS*Math.PI*2,f=1+.1*Math.sin(3*a+c.ph)+.06*Math.sin(5*a+c.ph2);
      for(const p0 of RINGS){/* (negative entries: the skirt rings, -3 at its outer edge) */const sk=p0<0?-p0/3:0,p=p0<0?2.02+SK*sk:p0;
        const d=p*c.r*f,x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d;const hT=H(x,z),hM=meshY(x,z);
        ps.push(x,p0<0?(sk>=1?hM:Math.max(hT,hM)+.006*(1-sk)):hT+.004,z);
        /* (on the skirt the ground's mix fades to what the terrain mesh shows there - its coarse vertices' mix, interpolated
           the same way - so the two meet without a seam) */
        let gm=groundMix(x,z);if(sk>0){const gc=meshMix(x,z),t=sstep(0,1,sk);gm=gm.map((v,j)=>lerp(v,gc[j],t));}sp.push(gm[0],gm[1],gm[2],gm[3]);we.push(clamp(gm[4]+(p<.55?.35:0),0,.9));
        const k=p<1.1?lerp(.5,.8,p/1.1):lerp(.8,1,sstep(1.1,1.9,p));const tc=terrCol(x,z);co.push(tc[0]*k,tc[1]*k,tc[2]*k);}}
    const g=ribbon(ps,null,NS+1,RINGS.length,{splat:[sp,4],wet:[we,1],color:[co,3]});const m=mesh(g,mat,0,0,0,scene,false);m.receiveShadow=true;shootables.push(m);
    /* clods of torn earth thrown round the rim, a few in the bowl; a scorched lump or two */
    const n=14+Math.floor(r_()*9);for(let k=0;k<n;k++){const a=rr(0,6.28),p=k<3?rr(.2,.7):rr(.95,1.75),d=p*c.r,x=c.x+Math.cos(a)*d,z=c.z+Math.sin(a)*d,s=rr(.05,.17);
      const q=rockGeo(40+k%9,{detail:s>.11?2:1,flat:.5,col:k%5===0?[.34,.31,.28]:[.78,.64,.5]});bk.add(q,k%5===0?scorch:soil,TRS(x,H(x,z)-s*.12,z,rr(-.35,.35),rr(0,6),rr(-.35,.35),s));}}
  bk.flush(scene,true);})();

/* ======================= dead wood thickening towards the swamp ======================= */
/* past the road the ground gets wetter and the trees die standing: snags, and trunks down across the slope with their
   root plates torn up - more of them the nearer the water, and all round the basin's rim */
(function fallenTrees(){const bk=bucket(),r_=rng(4471),rr=(a,b)=>a+(b-a)*r_();
  const dead=std({map:TX.bark,color:C(0xbab2a4),roughness:1,envMapIntensity:.25}),birch=std({map:TX.birch,color:C(0xd2cec4),roughness:.9,envMapIntensity:.2}),
    root=std({color:C(0x3b3128),roughness:1,envMapIntensity:.15}),endM=WM.end;
  const avoid=[[-640,-374],[-650,-372],[-668,-368],[-690,-356],[-704,-352]].concat(W3.path);
  const segD=(x,z,P)=>{let d=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return d;};
  const ok=(x,z,wet)=>{if(roadQuery(x,z).dW<11.5)return false;if(segD(x,z,avoid)<3.6)return false;if(Math.hypot(x-BUS.x,z-BUS.z)<48)return false;
    if(Math.hypot(x-W3.yard.x,z-W3.yard.z)<24||Math.hypot(x+701.5,z+349.2)<7)return false;if(!wet&&H(x,z)<W3.wl+.25)return false;return true;};
  const placed=[];const up=V3(0,1,0);
  const dens=(x,z)=>{const r=basinK(x,z);let d=0;if(x<-648&&x>-714)d=sstep(-652,-700,x)*.85;if(r>1.15&&r<1.6)d=Math.max(d,.55*sstep(1.15,1.25,r)*sstep(1.6,1.45,r));if(z>-246||z<-500)d*=.3;return d;};
  let nF=0,nS=0;
  for(let it=0;it<2600&&(nF<56||nS<22);it++){const x=rr(-905,-645),z=rr(-505,-240);if(r_()>dens(x,z))continue;if(!ok(x,z,false))continue;if(placed.some(p=>Math.hypot(p[0]-x,p[1]-z)<3.2))continue;
    const snag=nS<22&&(r_()<.3||nF>=56);if(!snag&&nF>=56)continue;
    if(snag){const h=rr(1.6,4.8),r=rr(.09,.2),lx=rr(-.08,.08),lz=rr(-.08,.08),mt=r_()<.35?birch:dead,y=H(x,z);const M4=TRS(x,y-.1,z,lx,rr(0,6),lz);
      snagParts(bk,M4,r*1.08,r*.82,h,r_,mt);
      for(let k=0;k<rr(1,4);k++){const by=rr(.35,.9)*h,L=rr(.3,1.2),ba=rr(0,6.28);const br=new T.CylinderGeometry(.012,.03,L,16);br.translate(0,L/2,0);br.applyMatrix4(TRS(0,0,0,0,ba,rr(.7,1.3)));br.translate(0,by,0);bk.add(br,mt,M4);}
      solids.push({cx:x,cz:z,r:r+.1});placed.push([x,z]);nS++;continue;}
    /* a fallen trunk: from its root end, down the slope more often than not */
    const L=rr(4,11),r=rr(.1,.24),yaw=rr(0,6.28),ex=x+Math.cos(yaw)*L,ez=z+Math.sin(yaw)*L;if(!ok(ex,ez,true)||segD((x+ex)/2,(z+ez)/2,avoid)<3.6)continue;
    if(placed.some(p=>Math.hypot(p[0]-(x+ex)/2,p[1]-(z+ez)/2)<L*.5+1))continue;
    /* snapped low on the trunk: the stump stands where it grew, the trunk lies off it, both ends of the break splintered */
    const sh=rr(.35,1.1),yb=H(x,z)+r*.85,yt=Math.max(H(ex,ez),W3.wl-.25)+r*.45;const sx=x-Math.cos(yaw)*rr(.25,.6),sz=z-Math.sin(yaw)*rr(.25,.6);
    const A=V3(x,yb,z),Bv=V3(ex,yt,ez),D=Bv.clone().sub(A),Ln=D.length();D.normalize();
    const q=new T.Quaternion().setFromUnitVectors(up,D),mid=A.clone().add(Bv).multiplyScalar(.5),M4=new T.Matrix4().compose(mid,q,V3(1,1,1));const mt=r_()<.3?birch:dead;
    bk.add(new T.CylinderGeometry(r*.42,r,Ln,9,1,true),mt,M4);
    {const SM=TRS(sx,H(sx,sz)-.06,sz,rr(-.05,.05),rr(0,6),rr(-.05,.05));bk.add(new T.CylinderGeometry(r*1.02,r*1.18,sh,10).translate(0,sh/2,0),mt,SM);splinters(bk,SM,r*1.02,sh,r_,mt);
     solids.push({cx:sx,cz:sz,r:r+.12});}
    {const EM=new T.Matrix4().compose(A,new T.Quaternion().setFromUnitVectors(up,D.clone().negate()),V3(1,1,1));splinters(bk,EM,r*.98,Ln*0,r_,mt,10,.15,.6);}
    /* broken branches standing off the trunk, more towards the crown */
    const nb=3+Math.floor(r_()*5);for(let k=0;k<nb;k++){const t=rr(.3,.95),bl=rr(.35,1.7)*(1.2-t*.5),ba=rr(0,6.28);const br=new T.CylinderGeometry(.01,r*rr(.18,.32),bl,5);br.translate(0,bl/2,0);
      br.applyMatrix4(new T.Matrix4().makeRotationFromEuler(new T.Euler(rr(.6,1.5),ba,0,'YXZ')));br.translate(0,(t-.5)*Ln,0);bk.add(br,mt,M4);}
    const n=Math.ceil(Ln/1.3);for(let k=0;k<=n;k++){const p=A.clone().lerp(Bv,k/n);if(p.y-H(p.x,p.z)<1.4&&H(p.x,p.z)>W3.wl+.1)solids.push({cx:p.x,cz:p.z,r:r+.12});}
    placed.push([x,z],[(x+ex)/2,(z+ez)/2],[ex,ez]);nF++;}
  bk.flush(scene,true);WEST.dead={nF,nS};})();
