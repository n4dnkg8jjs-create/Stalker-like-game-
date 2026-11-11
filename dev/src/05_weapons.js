/* ---------- weapons from real side profiles (millimetres), extruded and bevelled ---------- */
function ext(pts,depth,o={}){const s=new T.Shape(pts.map(p=>new T.Vector2(p[0],p[1])));
  (o.holes||[]).forEach(hp=>s.holes.push(new T.Path(hp.map(p=>new T.Vector2(p[0],p[1])))));
  const b=o.bevel===undefined?1:o.bevel;const g=new T.ExtrudeGeometry(s,{depth:Math.max(depth-2*b,.1),bevelEnabled:b>0,bevelThickness:b,bevelSize:b*(o.bsize||.8),bevelSegments:o.bseg||2,curveSegments:o.cseg||10});
  g.translate(0,0,-(depth-2*b)/2+(o.z||0));if(o.uvScale)worldUV(g,o.uvScale);g.userData.kind='ext';return g;}
function cylMM(r,len,u0,v,z=0,seg=40){const g=new T.CylinderGeometry(r,r,len,seg);g.rotateZ(Math.PI/2);g.translate(u0+len/2,v,z);return g;}
function gunGroup(u0,v0){const outer=new T.Group(),mm=new T.Group();mm.scale.setScalar(.001);mm.rotation.y=Math.PI/2;mm.position.set(0,0,0);outer.add(mm);
  const inner=new T.Group();inner.position.set(-u0,-v0,0);mm.add(inner);
  /* moving parts (slide, bolt carrier, magazine, hammer) are sub-groups pivoting about a point in the gun's millimetre space:
     part(name,u,v) opens one, end() closes it; the part group sits at the pivot and its contents are offset back */
  const parts={};let cur=null;
  /* parts are modelled in millimetres: give every steel/plastic part planar UVs at a real-world scale (wood already has them) */
  return{outer,parts,part:(n,pu=0,pv=0,pw=0)=>{const g=new T.Group();g.position.set(pu,pv,pw);g.userData.p0=V3(pu,pv,pw);g.userData.gp=V3(pw*.001,(pv-v0)*.001,-(pu-u0)*.001);inner.add(g);const h=new T.Group();h.position.set(-pu,-pv,-pw);g.add(h);parts[n]=g;cur=h;return g;},end:()=>{cur=null;},
    add:(g,m)=>{if(m!==M.gripPM&&!g.userData.wuv&&g.attributes.normal){worldUV(g,1/160);g.userData.wuv=1;}edgeWear(g);const x=new T.Mesh(g,GUNMAT(m));x.castShadow=true;x.receiveShadow=true;(cur||inner).add(x);return x;}};}
let _SLT=null;function slingTex(){return _SLT||(_SLT=tex(128,64,(g,w,h)=>{g.fillStyle='#5e5638';g.fillRect(0,0,w,h);const r=rng(5);
  for(let x=0;x<w;x+=2){g.fillStyle=`rgba(0,0,0,${.06+r()*.06})`;g.fillRect(x,0,1,h);}for(let y=0;y<h;y+=3){g.fillStyle=`rgba(255,255,230,${.03+r()*.04})`;g.fillRect(0,y,w,1);}
  g.fillStyle='rgba(30,30,20,.5)';g.fillRect(0,2,w,2);g.fillRect(0,h-4,w,2);for(let i=0;i<30;i++){g.fillStyle=`rgba(80,70,40,${r()*.15})`;g.fillRect(r()*w,r()*h,3+r()*10,2+r()*6);}}));}
/* a cartridge lying along the gun axis (u forward), mm: lacquered steel case, copper-clad bullet */
let _CM=null;function cartMats(){return _CM||(_CM={cs:std({color:C(0x59563a),metalness:.75,roughness:.38,envMapIntensity:1}),bl:std({color:C(0xa86438),metalness:.85,roughness:.3,envMapIntensity:1.1}),pr:std({color:C(0x9a8a60),metalness:.9,roughness:.3})});}
function cartridge(a,u,v,z,kind){const k=kind==='545'?{L:39.6,R:5,Rn:3.15,N:5,B:17,Rb:2.8}:{L:18,R:4.95,Rn:4.85,N:0,B:10.5,Rb:4.6};const CMt=cartMats();
  const pts=[[0,0],[k.R*.92,0],[k.R*.92,.9],[k.R*.8,1.3],[k.R*.8,2.2],[k.R,2.8],[k.R*.96,k.L-k.N-3],[k.Rn,k.L-k.N],[k.Rn,k.L],[0,k.L]].map(p=>new T.Vector2(p[0],p[1]));
  const cs=new T.LatheGeometry(pts,18);cs.rotateZ(-Math.PI/2);cs.translate(u,v,z);cs.userData.wuv=1;a(cs,CMt.cs);
  const bp=[];for(let i=0;i<=10;i++){const t=i/10,yy=k.B*t,r=kind==='545'?k.Rb*(t<.45?1:Math.sqrt(Math.max(0,1-Math.pow((t-.45)/.55,2)))*(1-.15*(t-.45))):k.Rb*Math.sqrt(Math.max(0,1-Math.pow(Math.max(0,t-.15)/.85,2.2)));bp.push(new T.Vector2(Math.max(r,.05),yy));}
  const bl=new T.LatheGeometry(bp,16);bl.rotateZ(-Math.PI/2);bl.translate(u+k.L-1.5,v,z);bl.userData.wuv=1;a(bl,CMt.bl);
  const pr=new T.CircleGeometry(k.R*.35,28);pr.rotateY(-Math.PI/2);pr.translate(u-.05,v,z);pr.userData.wuv=1;a(pr,CMt.pr);}
/* edge wear mask per vertex: the bevel faces of extruded parts (normal between the side wall and the face), the rounded
   corners of box parts; round parts (barrels, pins) get none here - the shader adds handling wear and scratches */
function edgeWear(g){if(g.attributes.wear)return;const n=g.attributes.normal,c=n?n.count:g.attributes.position.count,w=new Float32Array(c);
  const kind=g.userData.kind||(g.type==='ExtrudeGeometry'?'rbox':'');
  if(n)for(let i=0;i<c;i++){const x=Math.abs(n.getX(i)),y=Math.abs(n.getY(i)),z=Math.abs(n.getZ(i));
    if(kind==='ext')w[i]=z>.16&&z<.93?1:0;else if(kind==='rbox')w[i]=Math.max(x,y,z)<.93?1:0;}
  g.setAttribute('wear',new T.BufferAttribute(w,1));}
/* worn finish: bare steel shows through on edges and in scratches, polymer scuffs paler; handling rubs the surface where
   hands go. Driven by the per-vertex edge mask, a scratch texture and noise in the part's own millimetre space */
const SCRATCH=(()=>{const N=512;return tex(N,N,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);const r=rng(77);
  for(let i=0;i<420;i++){const x=r()*w,y=r()*h,a=(r()<.6?r()*.5-.25:r()*6.28),L=4+Math.pow(r(),2.6)*60,wd=.4+r()*.6;c.strokeStyle=`rgba(255,255,255,${.15+r()*.6})`;c.lineWidth=wd;
    c.beginPath();c.moveTo(x,y);const k=r()*.04-.02;let px=x,py=y;for(let s=0;s<L;s+=3){px+=Math.cos(a+k*s)*3;py+=Math.sin(a+k*s)*3;c.lineTo(px,py);}c.stroke();}
  for(let i=0;i<1800;i++){c.fillStyle=`rgba(255,255,255,${r()*.5})`;c.fillRect(r()*w,r()*h,1,1);}},{});})();
function wornPatch(m,o){const prev=m.onBeforeCompile;m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);
    s.uniforms.uScr={value:SCRATCH};s.uniforms.uBare={value:new T.Color(...o.bare)};
    s.vertexShader='attribute float wear;varying float vWear;varying vec3 vOP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvWear=wear;vOP=position;');
    let f=s.fragmentShader;
    f='uniform sampler2D uScr;uniform vec3 uBare;varying float vWear;varying vec3 vOP;\n'+f;
    f=f.replace('void main() {',`float wHash(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float wNoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(wHash(i),wHash(i+vec3(1,0,0)),f.x),mix(wHash(i+vec3(0,1,0)),wHash(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(wHash(i+vec3(0,0,1)),wHash(i+vec3(1,0,1)),f.x),mix(wHash(i+vec3(0,1,1)),wHash(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float wearMask(){float n=wNoise(vOP*.09)*.6+wNoise(vOP*.35)*.4;float e=vWear*smoothstep(.34,.6,n);
        float sc=texture2D(uScr,vUv*1.7).r*smoothstep(.55,.8,wNoise(vOP*.05+7.));float rub=smoothstep(.8,.95,wNoise(vOP*.03+3.))*.35;
        return clamp(max(max(e,sc*${o.scr.toFixed(2)}),rub*${o.rub.toFixed(2)}),0.,1.);}
      void main() {`);
    f=f.replace('#include <map_fragment>','#include <map_fragment>\nfloat wM=wearMask();diffuseColor.rgb=mix(diffuseColor.rgb,uBare,wM);');
    f=f.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,${o.rough.toFixed(2)},wM);`);
    f=f.replace('#include <metalnessmap_fragment>',`#include <metalnessmap_fragment>\nmetalnessFactor=mix(metalnessFactor,${o.metal.toFixed(2)},wM);`);
    s.fragmentShader=f;};
  const ck=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>ck+'worn'+o.bare.join();return m;}
/* gun finishes, swapped in for the generic steel/wood materials */
let _GM=null;function GUNMAT(m){if(!_GM){const mk=(p,o)=>std(Object.assign({map:p.a,normalMap:p.n,roughnessMap:p.r,roughness:1,normalScale:new T.Vector2(.5,.5)},o));
    const steel={bare:[.42,.43,.44],rough:.26,metal:1,scr:.5,rub:.8},plast={bare:[.075,.075,.08],rough:.42,metal:0,scr:.6,rub:.7};
    _GM=new Map([[M.gun,wornPatch(mk(PB.blued,{metalness:.82,envMapIntensity:1.1}),steel)],[M.gunD,wornPatch(mk(PB.phos,{metalness:.55,envMapIntensity:.8}),steel)],[M.akWood,mk(PB.birch,{metalness:0,envMapIntensity:.7})],[M.bakelite,mk(PB.bake,{metalness:0,envMapIntensity:.7})],
      ['poly',wornPatch(mk(PB.poly,{metalness:0,envMapIntensity:.55}),plast)],['polyMag',wornPatch(mk(PB.polyMag,{metalness:0,envMapIntensity:.55}),plast)],['chk',mk(PB.chk,{metalness:0,envMapIntensity:.5,normalScale:new T.Vector2(1,1)})]]);}
  return _GM.get(m)||m;}
function buildPM(opt){const G0=gunGroup(55,80);const a=G0.add;
  /* fixed barrel under the slide (shows when the slide runs back) */
  a(cylMM(6.3,98,62,92),M.gun);
  /* hammer: pivots at the back of the frame; the slide cocks it on the way back */
  G0.part('hammer',2,88);a(ext([[-5,92],[3,92],[7,100],[5,108],[-2,109],[-6,101]],8,{bevel:1}),M.gunD);a(ext([[-3,96],[2,96],[3,103],[0,107],[-5,106],[-6,100]],7,{bevel:.8}),M.gun);a(ext([[-1,84],[4,84],[3,97],[-2,97]],6,{bevel:.5}),M.gun);
  for(let i=0;i<4;i++)a(xf(rbox(1.1,.8,7.4,.2),-5.2+i*.4,100.5+i*1.7,0),M.gun);G0.end();
  /* slide: rounded section, sloped at the muzzle end; sights, extractor, ejection port, safety, grasping grooves move with it */
  G0.part('slide');
  a(loftU(secSE(3.4,28,0),[[2.5,11.6,80.6,99.5],[5,12.3,80.2,103],[10,12.5,80,104],[156,12.5,80,104],[159.5,12.3,80.2,100.5],[161.2,11.8,80.6,97.5]]),M.gun);
  /* sights: square-notch rear (two blades with a 3.8 mm gap), front blade whose top sits level with the top of the notch (equal height) */
  a(xf(rbox(10,2.2,11,.6),10,104.9,0),M.gunD);[-1,1].forEach(z=>a(xf(rbox(9,3.4,3.6,.5),10,107.6,z*3.7),M.gunD));
  a(xf(rbox(3.2,6.6,2.0,.4),154,106,0),M.gunD);
  a(xf(rbox(20,8,1,.3),110,95,12.8),M.bore);
  a(xf(rbox(18,4,3,.8),22,94,-13.2),M.gunD);a(xf(new T.CylinderGeometry(3.5,3.5,3,32),30,94,-14.5,Math.PI/2,0,0),M.gunD);
  for(let i=0;i<4;i++)a(xf(rbox(.7,.7,1.2,.2),24.5+i*1.5,96.7,-15.6),M.gun);
  for(let i=0;i<7;i++)a(xf(new T.BoxGeometry(1.2,15,25.6),15+i*2.5,93,0),M.gunD);
  a(xf(rbox(14,3.2,1.2,.4),124,97.5,12.6),M.gun);a(xf(new T.CylinderGeometry(1,1,1.4,20),130,97.5,13.2,Math.PI/2,0,0),M.gun);
  a(xf(new T.TorusGeometry(5.6,.6,12,40),161.6,92,0,0,Math.PI/2,0),M.gunD);
  G0.end();
  a(cylMM(4.6,3,159.5,92),M.gunD);a(cylMM(2.3,3.2,159.6,92),M.bore);
  /* frame with the trigger guard (its front pin), trigger, grip panels with the star, lanyard loop */
  a(ext([[10,80],[150,80],[150,71],[112,70],[108,64],[104,52],[98,44],[88,40],[72,40],[64,44],[58,30],[52,2],[48,-2],[18,-2],[14,2],[6,40],[3,62],[4,74]],22,{bevel:1.2,holes:[[[100,65],[97,53],[91,47],[80,46],[70,47],[66,55],[66,66]]]}),M.gunD);
  a(ext([[84,66],[86,60],[84,52],[80,49],[81,55],[80,62]],5,{bevel:.6}),M.gunD);
  [-1,1].forEach(sd=>a(xf(new T.CylinderGeometry(1.6,1.6,1,24),102,66.5,sd*11.3,Math.PI/2,0,0),M.gun));
  /* the one-piece wraparound grip: moulded dark brown plastic round the back strap, checkered on the sides, star medallion */
  {const g=ext([[57,63],[57.5,38],[52,10],[48,2],[44,-1],[16,-1],[9,3],[5,30],[3.5,52],[4,63]],30,{bevel:4.6,bsize:.95,bseg:5,cseg:16});
    const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,(p.getX(i)-6)/52,(p.getY(i)-4)/58);a(g,M.gripPM);}
  a(xf(new T.TorusGeometry(4.5,1.1,14,36),9,-4,0,0,Math.PI/2,0),M.gunD);
  /* slide stop on the left above the grip panel; heel magazine catch at the bottom of the back strap */
  a(ext([[44,70],[64,70],[66,74],[60,76.5],[46,75]],1.6,{bevel:.4,z:-11.9}),M.gun);for(let i=0;i<4;i++)a(xf(rbox(.6,4,.8,.2),56+i*2,73,-12.9),M.gun);
  a(ext([[8,-1],[15,-1],[16,5],[10,6]],9,{bevel:.6}),M.gun);
  /* grip screw through both panels, stamped markings on the frame */
  [-1,1].forEach(sd=>{a(xf(new T.CylinderGeometry(3.2,3.2,1.2,32),34,33,sd*14.5,Math.PI/2,0,0),M.gun);a(xf(rbox(4.6,.8,.6,.2),34,33,sd*15.1),M.bore);});
  {const t=tex(256,64,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 30px sans-serif';c.fillText('★ 1983 ★  ЕК 4417',6,44);},{clamp:true});
    const m=new T.MeshStandardMaterial({map:t,alphaTest:.45,color:C(0xb4b6b8),metalness:.92,roughness:.32,polygonOffset:true,polygonOffsetFactor:-2,envMapIntensity:1.1});
    const g=new T.PlaneGeometry(40,8);g.rotateY(Math.PI);g.translate(128,75.6,-11.15);g.userData.wuv=1;a(g,m);}
  /* lanyard: a leather strap through the loop at the heel of the grip, hanging free (it swings in the game) */
  if(opt&&opt.lanyard){G0.part('lanyard',9,-5);const n=30,P=[],I=[],W=4,th=.9,pts=[];
    for(let i=0;i<=n;i++){const t=i/n;pts.push(V3(9+3*Math.sin(t*2.2)+t*8,-6.5-t*250,2*Math.sin(t*5)));}
    for(let i=0;i<=n;i++){const tg=pts[Math.min(n,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize(),sd=V3(0,0,1),wd=tg.clone().cross(sd).normalize();
      for(const a_ of [-1,1])for(const b_ of [-1,1]){const q=pts[i].clone().addScaledVector(wd,a_*W).addScaledVector(sd,b_*th);P.push(q.x,q.y,q.z);}}
    for(let i=0;i<n;i++){const a0=i*4,b0=a0+4;[[0,2],[1,3],[0,1],[2,3]].forEach(([p,q])=>I.push(a0+p,b0+p,a0+q,a0+q,b0+p,b0+q));}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();g.userData.wuv=1;
    a(g,std({color:C(0x3b2d1f),roughness:.68,side:T.DoubleSide}));G0.end();G0.parts.lanyard.userData.noCol=true;}
  /* magazine: steel single-stack body up the grip, follower with the top round showing between the lips, floorplate */
  G0.part('mag',33,-4);
  /* (the body runs the full height of the grip and its floorplate stands proud below it, with the heel lip for the catch) */
  a(xf(rbox(29,78,10.2,1.4),33.5,21,0,0,0,.06),M.gun);for(let i=0;i<5;i++)a(xf(new T.CylinderGeometry(1.6,1.6,1.2,24),30.5+i*.6,12+i*9,-5.4,Math.PI/2,0,0),M.bore);
  a(ext([[13,-19],[52,-19],[55,-16.5],[54,-13],[50,-11],[16,-11],[12,-12.5],[11,-16]],22,{bevel:1.2}),M.gunD);a(xf(rbox(5,3.2,12,.6),12.5,-10,0),M.gunD);
  a(xf(rbox(22,1.4,6.6,.4),35,58,0),M.bore);cartridge(a,22,62,0,'918');
  G0.end();
  const o=G0.outer;o.userData={muzzle:V3(0,(92-80)*.001,-(161-55)*.001),sightY:(109.2-80)*.001,parts:G0.parts};return o;}
/* loft: a 2D section (z in -1..1, v in 0..1) swept along the gun axis u; each station = [u, half-width, v bottom, v top] */
function loftU(sec,st){const n=sec.length,P=[],I=[];
  st.forEach(([u,w,vb,vt])=>sec.forEach(([z,v])=>P.push(u,vb+v*(vt-vb),z*w)));
  for(let i=0;i<st.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=a+n,d=b+n;I.push(a,c,b,b,c,d);}
  /* caps: fan around the section centre */
  [0,st.length-1].forEach((si,e)=>{const [u,w,vb,vt]=st[si];let cz=0,cv=0;sec.forEach(([z,v])=>{cz+=z;cv+=v;});const c0=P.length/3;P.push(u,vb+cv/n*(vt-vb),cz/n*w);
    const b0=P.length/3;sec.forEach(([z,v])=>P.push(u,vb+v*(vt-vb),z*w));for(let j=0;j<n;j++){const x=b0+j,y=b0+(j+1)%n;e?I.push(c0,y,x):I.push(c0,x,y);}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setIndex(I);
  /* orient outward: test the first side quad against the section centre */
  const v3=i=>V3(P[i*3],P[i*3+1],P[i*3+2]);const A=v3(I[0]),B=v3(I[1]),Cc=v3(I[2]);const nn=B.clone().sub(A).cross(Cc.clone().sub(A));
  const [u0,w0,vb0,vt0]=st[0];const out=A.clone().sub(V3(A.x,(vb0+vt0)/2,0));if(nn.dot(out)<0){for(let i=0;i<I.length;i+=3){const t=I[i+1];I[i+1]=I[i+2];I[i+2]=t;}g.setIndex(I);}
  g.computeVertexNormals();
  /* UVs: u along the gun, v = arc length around the section (mm, scaled like the planar parts); caps planar */
  {const uv=[];st.forEach(([u,w,vb,vt])=>{let L=0;sec.forEach(([z,v],j)=>{if(j){const p0=sec[j-1];L+=Math.hypot((z-p0[0])*w,(v-p0[1])*(vt-vb));}uv.push(u/160,L/160);});});
    for(let e=0;e<2;e++){const [u,w,vb,vt]=st[e?st.length-1:0];uv.push(0,(vb+vt)/320);sec.forEach(([z,v])=>uv.push(z*w/160,(vb+v*(vt-vb))/160));}
    g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.userData.wuv=1;}
  return g;}
/* rounded-rectangle / superellipse sections */
function secRR(tz,tv,bz,bv,k=6){const o=[];const q=(cx,cy,rz,rv,a0)=>{for(let i=0;i<=k;i++){const a=a0+i/k*Math.PI/2;o.push([cx+Math.cos(a)*rz,cy+Math.sin(a)*rv]);}};
  q(1-tz,1-tv,tz,tv,0);q(-1+tz,1-tv,tz,tv,Math.PI/2);q(-1+bz,bv,bz,bv,Math.PI);q(1-bz,bv,bz,bv,Math.PI*1.5);return o;}
function secSE(m=4,n=24,flat=0){const o=[];for(let i=0;i<n;i++){const a=i/n*Math.PI*2,c=Math.cos(a),s=Math.sin(a);o.push([Math.sign(c)*Math.pow(Math.abs(c),2/m),Math.max(flat,.5+.5*Math.sign(s)*Math.pow(Math.abs(s),2/m))]);}return o;}
/* AK-74M (2026 standard issue): stamped receiver and ribbed dust cover, 90-degree gas block, black glass-filled polyamide
   furniture, side-folding skeleton stock, 5.45 polymer magazine, two-chamber muzzle brake. Millimetres: u from the butt
   (0) to the brake (943), v from the bore line. */
/* the older rifles' furniture: laminated wood gone dark with oil and handling, the plum bakelite magazine and grip */
let _OLDF=null;function oldFurn(){return _OLDF||(_OLDF={wood:Object.assign(GUNMAT(M.akWood).clone(),{color:C(0x8c5c4a)}),bake:Object.assign(GUNMAT(M.bakelite).clone(),{color:C(0x7a4a40)})});}
function buildAK(sup,opt){const G0=gunGroup(318,0);const a=G0.add;const WD=!!(opt&&opt.wood);const P=WD?oldFurn().wood:GUNMAT('poly'),PM_=WD?oldFurn().bake:GUNMAT('polyMag'),CK=GUNMAT('chk'),St=M.gunD,Bl=M.gun,GR=WD?oldFurn().bake:P;
  /* receiver */
  a(ext([[253,-30],[253,26],[262,28],[493,28],[493,-33],[426,-33],[420,-31],[262,-31]],30,{bevel:1.2}),St);
  /* dust cover with stamped transverse ribs and the recoil-spring button at the back */
  {const S=[[256,13,24,25],[259,14.5,24,33],[264,15.3,24,39],[272,15.5,24,42.6],[284,15.5,24,43.6]];
    [300,330,360,390,420,450].forEach(c=>S.push([c-3.2,15.5,24,43.6],[c-1.6,15.9,24,44.4],[c+1.6,15.9,24,44.4],[c+3.2,15.5,24,43.6]));S.push([484,15.5,24,43.6],[487,15.2,24,42.8]);
    a(loftU(secRR(.5,.42,.08,.06),S),St);a(cylMM(3.2,8,248,30),St);}
  /* rear trunnion + stock hinge block (the stock folds to the left), hinge barrel */
  a(ext([[234,-42],[256,-42],[256,24],[248,16],[234,8]],32,{bevel:1.5}),St);
  if(!WD){a(xf(new T.CylinderGeometry(5.5,5.5,50,32),240,-15,-16.5),St);a(xf(new T.CylinderGeometry(3,3,6,32),240,-41,-16.5),Bl);}
  /* stock: rim plates with the long side recess over a solid core; steel butt plate with the trap door */
  {const O=[[236,7],[200,3],[120,0],[40,-1],[7,-2],[0,-6],[0,-91],[3,-95],[10,-97],[80,-74],[160,-56],[236,-40]];
    const slot=[[58,-24],[176,-13],[181,-17],[181,-31],[176,-35],[58,-55],[53,-51],[53,-28]];
    /* one rounded moulding, 30 mm thick; on each side a raised rim round a long recess holding a matte rubbery pad */
    a(ext(O,30,{bevel:4.5,bsize:.9,bseg:4,cseg:12}),P);if(!WD){const inner=[[62,-27],[173,-16.5],[177,-19],[177,-29],[173,-31.5],[62,-51.5],[57,-48.5],[57,-30.5]];
    const RUB=std({color:C(0x151515),roughness:.86,metalness:0});
    [-1,1].forEach(sd=>{a(ext(slot,1.8,{bevel:.6,z:sd*15.5,holes:[inner]}),P);a(ext(inner,1,{bevel:.3,z:sd*14.7}),RUB);});
    /* the stock latch button by the hinge, and the sling slot through the butt */
    a(xf(new T.CylinderGeometry(4.6,4.6,2.4,32),214,-24,-15.4,Math.PI/2,0,0),St);a(xf(new T.CylinderGeometry(2.2,2.2,1,32),214,-24,-16.7,Math.PI/2,0,0),Bl);}
    [-1,1].forEach(sd=>a(xf(rbox(18,4,1,.8),24,-80,sd*15.1,0,0,.3),M.bore));
    a(ext([[0,-6],[-6,-7],[-6,-92],[0,-91]],28,{bevel:1}),St);a(xf(rbox(1,40,16,.4),-6.4,-48,0),M.bore);
    a(xf(rbox(14,5,8,1),40,-86,0,0,0,.33),M.bore);}
  /* pistol grip with checkered panels */
  {const G=[[308,-33],[270,-33],[266,-46],[256,-84],[248,-122],[246,-131],[252,-137],[288,-139],[295,-134],[299,-99],[304,-61],[308,-38]];
    a(ext(G,30,{bevel:5}),GR);
    if(!WD)[-1,1].forEach(sd=>{const g=ext([[298,-47],[272,-47],[260,-84],[254,-122],[286,-126],[292,-99],[297,-61]],1,{bevel:.3,z:sd*14.8});
      const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)/40,p.getY(i)/40);g.userData.wuv=1;a(g,CK);});}
  /* trigger guard, trigger, magazine release paddle */
  a(ext([[305,-31],[396,-31],[396,-36],[388,-60],[380,-66],[317,-66],[307,-58]],10,{bevel:.8,holes:[[[312,-35],[386,-35],[380,-57],[374,-61],[321,-61],[314,-55]]]}),St);
  a(ext([[323,-33],[332,-33],[331,-44],[326,-54],[320,-56],[324,-45]],5,{bevel:.5}),Bl);
  a(ext([[397,-31],[407,-31],[409,-49],[402,-52]],13,{bevel:.6}),St);
  /* right side: safety/selector lever, ejection port with the bolt carrier, charging handle */
  a(ext([[262,3],[270,11],[424,15],[441,10],[441,3],[424,6],[272,-5]],2,{bevel:.4,z:16.4}),St);a(xf(new T.CylinderGeometry(5,5,3,32),266,3,16.6,Math.PI/2,0,0),St);
  a(xf(rbox(74,13,.6,.2),417,21,15.3),M.bore);
  /* bolt carrier face in the port and the charging handle: they run back together (on each shot and when charging) */
  a(xf(rbox(70,7,.8,.2),417,22.5,15.5),Bl);a(xf(rbox(16,5,.6,.2),396,16.5,15.6),Bl);a(xf(new T.CylinderGeometry(3.2,3.2,1,32),402,16,15.9,Math.PI/2,0,0),M.gun);
  G0.part('bolt');a(xf(rbox(7,7,20,1.2),458,21,24),Bl);a(xf(new T.CylinderGeometry(5.5,5,13,32),458,21,38,Math.PI/2,0,0),Bl);
  for(let i=0;i<5;i++)a(xf(new T.TorusGeometry(5.3,.35,10,40),458,21,33.5+i*2,0,0,0),Bl);G0.end();
  /* left side: optic mount rail */
  /* left side: the optic mount rail over the grip, with its lightening cuts and rivets; trunnion rivets; the oval
     magazine-guide dimple; the stamped factory mark */
  {const cut=(u0,u1,v0,v1)=>[[u0,v0],[u1,v0],[u1,v1],[u0,v1]];
   a(ext([[244,-18],[352,-18],[357,-13.5],[357,-2],[244,-2]],3,{bevel:.6,z:-16.4,holes:[cut(262,282,-14,-6),cut(298,318,-14,-6),cut(331,345,-13,-7)]}),St);
   [[252,-10],[290,-10],[324,-10],[350,-6]].forEach(([u,v])=>a(xf(new T.CylinderGeometry(2.6,2.6,1.6,32),u,v,-18.4,Math.PI/2,0,0),Bl));
   [[450,-4],[461,-13],[450,-22]].forEach(([u,v])=>a(xf(new T.CylinderGeometry(2.4,2.6,1.2,32),u,v,-15.6,Math.PI/2,0,0),St));
   {const d=a(new T.TorusGeometry(5.2,1.1,14,48),M.bore);d.position.set(378,-10,-15.5);d.scale.set(1.9,1,1);}
   a(xf(rbox(10,4,.6,.2),436,-21,-15.4),M.bore);}
  /* rivets and fire-control pins, both sides */
  [-1,1].forEach(sd=>{[[466,-6],[466,-22],[478,-6],[478,-22],[262,12],[262,-12],[274,-24],[488,12]].forEach(([u,v])=>a(xf(new T.CylinderGeometry(2.1,2.3,1.2,32),u,v,sd*15.5,Math.PI/2,0,0),St));
    [[313,-12],[334,-21],[358,-10]].forEach(([u,v])=>a(xf(new T.CylinderGeometry(2.6,2.6,1.4,32),u,v,sd*15.6,Math.PI/2,0,0),Bl));});
  /* rear sight: block, tangent leaf with slider, notched blade (3.6 mm gap); its floor is the sight line */
  a(ext([[480,6],[538,6],[538,26],[532,31],[486,31],[480,26]],26,{bevel:1.2}),St);
  a(ext([[496,35],[534,30],[534,33.4],[496,38.6]],12,{bevel:.4}),Bl);a(xf(rbox(8,5.4,16,1),516,35,0,0,0,-.13),St);[-1,1].forEach(z=>a(xf(new T.CylinderGeometry(1.8,1.8,2,24),516,35,z*8.6,Math.PI/2,0,0),Bl));
  a(ext([[492,31],[499,31],[499,49],[492,49]],12,{bevel:.3}),St);[-1,1].forEach(z=>a(xf(rbox(5,3.4,4.2,.4),495.5,50.7,z*3.9),St));
  a(xf(rbox(6,14,4,.8),540,15,14),St);a(xf(rbox(4,8,3,.6),540,25,14.5,0,0,.3),St);
  /* stamped markings: range graduations on top of the leaf, АВ / ОД by the selector on the right of the receiver */
  {const stamp=(w,h,draw)=>{const t=tex(w*8,h*8,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#fff';c.strokeStyle='#fff';draw(c,W,H);},{clamp:true});
      return new T.MeshStandardMaterial({map:t,alphaTest:.45,color:C(0xb4b6b8),metalness:.92,roughness:.32,polygonOffset:true,polygonOffsetFactor:-2,envMapIntensity:1.1});};
    const leaf=stamp(34,8,(c,W,H)=>{c.lineWidth=3;for(let i=0;i<=10;i++){const x=12+i*(W-24)/10;c.beginPath();c.moveTo(x,H*.62);c.lineTo(x,H*.95);c.stroke();}
      c.font=`bold ${H*.42}px sans-serif`;c.textAlign='center';['П','2','3','4','5','6','7','8','9','10'].forEach((d,i)=>c.fillText(d,12+(i+.5)*(W-24)/10,H*.5));});
    const lg=new T.PlaneGeometry(34,8);lg.rotateX(-Math.PI/2);lg.rotateZ(-.137);lg.translate(515,36.4,0);lg.userData.wuv=1;a(lg,leaf);
    const mk=stamp(30,14,(c,W,H)=>{c.lineWidth=3;c.beginPath();c.moveTo(W*.08,H*.85);c.lineTo(W*.25,H*.15);c.lineTo(W*.42,H*.85);c.closePath();c.stroke();c.beginPath();c.moveTo(W*.25,H*.85);c.lineTo(W*.25,H*.45);c.stroke();
      c.font=`bold ${H*.62}px sans-serif`;c.fillText('АК',W*.48,H*.78);});
    const mg_=new T.PlaneGeometry(30,14);mg_.rotateY(Math.PI);mg_.translate(408,-2,-15.62);mg_.userData.wuv=1;a(mg_,mk);
    const sel=stamp(18,16,(c,W,H)=>{c.font=`bold ${H*.36}px sans-serif`;c.textAlign='center';c.fillText('АВ',W/2,H*.42);c.fillText('ОД',W/2,H*.88);});
    const sg=new T.PlaneGeometry(18,16);sg.translate(431,-9,15.62);sg.userData.wuv=1;a(sg,sel);}
  /* upper handguard over the gas tube, lower handguard with grip ribs, retainer band */
  a(loftU(secSE(3.4,40,.04),[[537,12,10,37],[541,13.6,9.5,39],[600,14.2,9.5,40.5],[640,14.2,9.5,40],[647,12.6,11,38],[651,10,14,35]]),P);
  /* (proportions from the AK-74M references: about 45 mm deep at the front, swelling to some 60 mm at the rear where the
     rib rack is, its bottom edge below the receiver's; the upper half sits down on it) */
  a(loftU(secSE(4.6,44,0),[[484,17,-38,9],[488,21,-46,11],[495,22.6,-49,12],[545,22.8,-49,12],[566,22.8,-46.5,12],[590,22.4,-39,12],[640,22,-36,12],[651,21,-34,11.5],[657,18.5,-30,10],[660,15.5,-25,8]]),P);
  /* lower handguard: the rack of long ribs at its rear, short upright ribs at the front of its top edge */
  if(!WD)[-1,1].forEach(sd=>{for(let i=0;i<6;i++)a(xf(rbox(68-i*3,1.7,3.2,.5),534+i*1.5,4-i*6.2,sd*22.1),P);for(let i=0;i<4;i++)a(xf(rbox(1.7,15,3.2,.5),600+i*5.5,-1,sd*21.6),P);});
  /* the wooden lower handguard has two finger grooves along each side instead of the ribs */
  else [-1,1].forEach(sd=>[-8,-22].forEach(v=>a(xf(rbox(120,2.2,1,.6),565,v,sd*22.9),M.bore)));
  a(ext([[653,-36],[666,-36],[666,13],[653,13]],46,{bevel:1}),St);
  /* barrel, gas tube with vents, 90-degree gas block with the cleaning-rod lug, cleaning rod */
  a(cylMM(7.2,260,493,0),Bl);a(cylMM(6.3,90,750,0),Bl);a(cylMM(7.6,82,650,22),Bl);a(cylMM(8.6,6,726,22),St);
  [-1,1].forEach(sd=>{for(let i=0;i<3;i++)a(xf(rbox(10,1.6,1,.3),700+i*13,22+sd*1.5,sd*7.3,0,0,.6),M.bore);});
  a(ext([[730,-24],[752,-24],[754,-12],[754,16],[750,30],[732,30],[728,16],[728,-12]],22,{bevel:2}),St);
  a(xf(new T.TorusGeometry(5,1.4,14,40),741,-24,-11.5),Bl);
  a(cylMM(2.8,205,640,-17),Bl);a(cylMM(3.6,10,836,-17),Bl);
  /* the exposed gas tube is fluted */
  [-.95,-.32,.32,.95].forEach(t=>a(xf(rbox(62,1.3,1.8,.3),690,22+7.25*Math.cos(t),7.25*Math.sin(t),t,0,0),M.bore));
  /* barrel collar ahead of the handguard retainer */
  a(cylMM(9.6,5,668,0),St);
  /* front sight block, bayonet lug, windage drum, protective ears and post (tip level with the notch floor) */
  a(ext([[828,-26],[864,-26],[864,10],[858,16],[836,16],[828,10]],22,{bevel:1.5}),St);
  a(ext([[838,-26],[860,-26],[860,-33],[842,-33]],10,{bevel:1}),St);
  a(xf(new T.CylinderGeometry(5.2,5.2,7,32),848,19,0),St);
  /* the hood: two tall ears, joined over the top, each pierced with a round hole */
  {const hole=[];for(let i=0;i<40;i++){const t=i/40*Math.PI*2;hole.push([847.5+Math.cos(t)*3.8,40+Math.sin(t)*3.8]);}
   [-1,1].forEach(z=>a(ext([[836,16],[860,16],[856,48.5],[852,57.5],[843,57.5],[839,48.5]],3.2,{bevel:.6,z:z*7.6,holes:[hole]}),St));
   a(xf(rbox(10,3,18,.8),847.5,56.5,0),St);}
  a(xf(new T.CylinderGeometry(1.1,1.6,34,24),848,35.2,0),St);
  a(xf(new T.CylinderGeometry(1.6,1.6,4,24),862,11,0),Bl);
  if(!sup){/* AK-74 brake: threaded collar, expansion body, front cup with side windows (the bore shows through) */
    a(cylMM(10.2,8,862,0),St);a(cylMM(12,58,868,0),St);
    /* the front cup is a real ring round a real hole: its face, the opening, the passage going back into the brake */
    {const pr=[[12,-7],[12,-.7],[11.3,0],[3.7,0],[3.4,-.4],[3.4,-16]];const g=new T.LatheGeometry(pr.map(p=>new T.Vector2(p[0],p[1])),48);g.rotateZ(-Math.PI/2);g.translate(943,0,0);a(g,St);
     const d=new T.CircleGeometry(3.4,40);d.rotateY(Math.PI/2);d.translate(927.2,0,0);a(d,M.bore);}
    [Math.PI/2,Math.PI*1.5].forEach(t0=>{const g=new T.CylinderGeometry(12,12,10,32,1,true,t0-.95,1.9);g.rotateZ(Math.PI/2);g.translate(931,0,0);a(g,St);});
    a(cylMM(5.6,12,926,0),M.bore);
    [0,1,2].forEach(i=>{const d=new T.CircleGeometry(1.8,28);d.rotateX(-Math.PI/2);d.translate(0,12.05,0);d.rotateX(-.55);d.translate(888+i*10,0,0);a(d,M.bore);});
}
  else{a(cylMM(10.2,8,862,0),St);a(cylMM(19,190,868,0),M.black);a(cylMM(19.5,6,868,0),St);a(cylMM(19.5,5,1053,0),St);
    {const d=new T.CircleGeometry(4,40);d.rotateY(Math.PI/2);d.translate(1058.2,0,0);a(d,M.bore);}}
  /* 5.45 polymer magazine: curved body, short reinforcing ribs along the front spine, floorplate, rear lug; it rocks out
     about its front lug, so the part pivots there; the top round sits staggered between the lips */
  G0.part('mag',486,-22);
  cartridge(a,421,-12,3.2,'545');cartridge(a,423,-17,-3.2,'545');
  {const Cc=[918,-33],Rf=430,Rr=505,a0=-.02,a1=.35,mg=[];const pt=(R,t)=>[Cc[0]-R*Math.cos(t),Cc[1]-R*Math.sin(t)];
    for(let i=0;i<=14;i++)mg.push(pt(Rf,a0+(a1-a0)*i/14));for(let i=14;i>=0;i--)mg.push(pt(Rr,a0+(a1-a0)*i/14));
    a(ext(mg,24,{bevel:2}),PM_);
    /* raised ribs along the front and rear edges of each side */
    {const strip=(R0,R1)=>{const q=[];for(let i=0;i<=16;i++)q.push(pt(R0,a0+.01+(a1-a0-.03)*i/16));for(let i=16;i>=0;i--)q.push(pt(R1,a0+.01+(a1-a0-.03)*i/16));return q;};
     [-1,1].forEach(sd=>{a(ext(strip(Rf+2,Rf+5.5),1.4,{bevel:.4,z:sd*12.3}),PM_);a(ext(strip(Rr-5.5,Rr-2),1.4,{bevel:.4,z:sd*12.3}),PM_);});}
    for(let i=0;i<5;i++){const t=.03+i*.06,[u,v]=pt(Rf+12,t);[-1,1].forEach(sd=>a(xf(rbox(20,1.6,1,.3),u,v,sd*12.3,0,0,t),PM_));}
    {const fp=[pt(Rf-3,a1-.012),pt(Rr+3,a1-.012),pt(Rr+3,a1+.004),pt(Rf-3,a1+.004)];a(ext(fp,28,{bevel:1.4}),PM_);}
    {const [u,v]=pt(Rr-2,.0);a(xf(rbox(8,10,14,1),u-3,v-2,0),PM_);}
    /* feed lips and the front catch lug */
    [-1,1].forEach(sd=>a(xf(rbox(44,3,1.6,.5),452,-19.5,sd*10.6,0,0,-.02),PM_));a(xf(rbox(6,6,12,1),490.5,-25,0),PM_);}
  G0.end();
  /* the sling: olive canvas webbing from the gas-block loop to the stock-hinge loop, hanging slack on the left with its
     adjuster buckle near the back; it swings about the line between its two loops so it always hangs down */
  if(opt&&opt.sling){const F=V3(741,-31,-14),Rr=V3(246,-40,-21);G0.part('sling',Rr.x,Rr.y,Rr.z);
    const n=56,P=[],U=[],I=[],W=14,th=1.1;const pts=[];
    for(let i=0;i<=n;i++){const t=i/n,sag=4*t*(1-t);pts.push(V3().lerpVectors(Rr,F,t).add(V3(0,-178*sag-6*Math.sin(t*9.4)*sag,-20*sag)));}
    let L=0;for(let i=0;i<=n;i++){if(i)L+=pts[i].distanceTo(pts[i-1]);const tg=pts[Math.min(n,i+1)].clone().sub(pts[Math.max(0,i-1)]).normalize();
      const tw=Math.sin(i/n*Math.PI)*.5;const side=V3(0,0,1).applyAxisAngle(tg,tw),wd=tg.clone().cross(side).normalize();
      for(const sd of [-1,1])for(const fz of [-1,1]){const q=pts[i].clone().addScaledVector(wd,sd*W).addScaledVector(side,fz*th);P.push(q.x,q.y,q.z);U.push(L/60,(sd+1)/2);}}
    for(let i=0;i<n;i++){const a=i*4,b=a+4;[[0,2],[1,3],[0,1],[2,3]].forEach(([p,q])=>{I.push(a+p,b+p,a+q,a+q,b+p,b+q);});}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(P,3));g.setAttribute('uv',new T.Float32BufferAttribute(U,2));g.setIndex(I);g.computeVertexNormals();g.userData.wuv=1;
    const sm=std({map:slingTex(),roughness:.92,side:T.DoubleSide});a(g,sm);
    /* adjuster buckle and the two end hooks */
    {const i=Math.round(n*.16),tg=pts[i+1].clone().sub(pts[i-1]).normalize();const b=a(rbox(22,34,5,1.2),M.gunD);b.position.copy(pts[i]);b.quaternion.setFromUnitVectors(V3(1,0,0),tg);}
    [[1,Rr],[n-1,F]].forEach(([i,pt])=>{const h=a(new T.TorusGeometry(7,1.6,14,36),M.gunD);h.position.copy(pts[i]).lerp(pt,.5);h.rotation.y=Math.PI/2;});
    G0.end();G0.parts.sling.userData.ax=F.clone().sub(Rr).normalize();G0.parts.sling.userData.noCol=true;}
  /* small parts from the references: the gas-tube lock lever on the right of the rear sight block, the pin-retaining
     spring on the right of the receiver, trigger-guard rivets, the gas vent in the block, and (folding stock) the
     stock latch button at the rear left of the receiver and the ribbed rubber butt pad */
  {const lv=a(ext([[488,12],[506,15],[512,22],[509,25],[492,19]],2.2,{bevel:.5,z:13.8}),St);a(xf(new T.CylinderGeometry(2.6,2.6,2.4,32),490,14,13.9,Math.PI/2,0,0),Bl);
   const pr=new T.CatmullRomCurve3([V3(342,-6,16.1),V3(356,-4,16.6),V3(372,-9,16.6),V3(386,-14,16.4),V3(392,-10,16.1)]);a(new T.TubeGeometry(pr,40,.75,12),Bl);
   [[309,-34],[391,-34]].forEach(([u,v])=>[-1,1].forEach(sd=>a(xf(new T.CylinderGeometry(1.8,2,1.2,32),u,v,sd*5.6,Math.PI/2,0,0),St)));
   [-1,1].forEach(sd=>{const c=new T.CircleGeometry(1.6,28);c.translate(0,0,0);a(xf(c,736,22,sd*11.05,0,sd>0?0:Math.PI,0),M.bore);});
   if(!WD){a(xf(new T.CylinderGeometry(3.4,3.4,3,32),249,12,-17.4,Math.PI/2,0,0),St);a(xf(new T.CylinderGeometry(2.4,2.4,1.6,32),249,12,-19.3,Math.PI/2,0,0),Bl);
     for(let i=0;i<9;i++)a(xf(rbox(1,4,24,.3),-6.4,-12-i*9,0),M.bore);}}
  /* sling loop on the left of the stock hinge, serial and year stamped on the left of the receiver over the magazine well */
  a(xf(new T.TorusGeometry(6,1.3,14,40),246,-38,-18.5,0,0,0),Bl);a(xf(rbox(10,6,4,1),246,-30,-17),St);
  {const t=tex(320,48,(c,W,H)=>{c.clearRect(0,0,W,H);c.fillStyle='#fff';c.font='bold 30px sans-serif';c.fillText('1986  № 2271694',8,36);},{clamp:true});
    const m=new T.MeshStandardMaterial({map:t,alphaTest:.45,color:C(0xb4b6b8),metalness:.92,roughness:.32,polygonOffset:true,polygonOffsetFactor:-2,envMapIntensity:1.1});
    const g=new T.PlaneGeometry(52,7.8);g.rotateY(Math.PI);g.translate(440,-24,-15.62);g.userData.wuv=1;a(g,m);}
  const o=G0.outer;o.userData={muzzle:V3(0,0,-((sup?1058:943)-318)*.001),sightY:.0522,parts:G0.parts};return o;}
/* ---------- the Kobra EKP-8-18 collimator sight on its side-rail mount: a long anodised housing, the big front window
   frame with the tinted reflector glass, the small rear window, the brightness/reticle dial on the right with its
   index marks, the battery cap, and on the left the dovetail clamp that grips the receiver rail with its throw
   lever and screw. Metres, gun axes (forward -z, up +y); the optical axis sits 76 mm over the bore. ---------- */
let _KOB=null;
function kobraModel(){const g=new T.Group();if(!_KOB){const an=std({color:C(0x1b1c1d),roughness:.42,metalness:.55,envMapIntensity:.9}),an2=std({color:C(0x232527),roughness:.6,metalness:.4}),
    glass=new T.MeshPhysicalMaterial({color:C(0x8fb4c8),roughness:.22,metalness:0,transparent:true,opacity:.08,clearcoat:0,envMapIntensity:.25,depthWrite:false}),
    coat=new T.MeshPhysicalMaterial({color:C(0xd8a060),roughness:.2,metalness:0,transparent:true,opacity:.06,envMapIntensity:.3,depthWrite:false,side:T.BackSide}),
    ret=new T.MeshBasicMaterial({map:tex(64,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.strokeStyle='#ff3a24';c.fillStyle='#ff3a24';c.lineWidth=5.5;c.lineCap='round';c.beginPath();c.moveTo(w*.26,h*.74);c.lineTo(w*.5,h*.5);c.lineTo(w*.74,h*.74);c.stroke();
      c.beginPath();c.arc(w*.5,h*.5,4,0,6.28);c.fill();},{clamp:true}),color:C(0xffd0c8),transparent:true,blending:T.AdditiveBlending,depthWrite:false,depthTest:false,fog:false}),
    mark=new T.MeshBasicMaterial({map:tex(256,48,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#d8d8d0';c.font='bold 30px sans-serif';c.fillText('КОБРА',8,36);c.font='18px sans-serif';c.fillText('ЭКП-8-18  № 04117',120,34);},{clamp:true}),transparent:true,depthWrite:false});
    _KOB={an,an2,glass,coat,ret,mark};}
  const K=_KOB,m=(geo,mat,x,y,z,rx=0,ry=0,rz=0)=>{const q=new T.Mesh(geo,mat);q.position.set(x,y,z);q.rotation.set(rx,ry,rz);q.castShadow=false;q.receiveShadow=true;g.add(q);return q;};
  const ax=.0755;
  /* housing: a long rounded box with a slightly raised spine, the rear window bezel */
  /* (it is a tube: you look through the housing to the reflector) */
  m(rbox(.032,.012,.098,.004),K.an,0,ax-.021,.012);m(rbox(.03,.004,.094,.002),K.an,0,ax+.0165,.012);[-1,1].forEach(sd=>m(rbox(.004,.034,.094,.002),K.an,sd*.0145,ax,.012));
  m(rbox(.02,.006,.07,.003),K.an,0,ax+.021,.018);
  [[0,.0135,.034,.005],[0,-.0135,.034,.005],[.0145,0,.005,.027],[-.0145,0,.005,.027]].forEach(([x,y,w,h])=>m(rbox(w,h,.008,.002),K.an,x,ax+y,.061));
  /* front window frame: a tall rectangular hood ahead of the housing, open fore and aft */
  {const fw=.044,fh=.041,d=.028,t=.0035;m(rbox(fw,t,d,.0015),K.an,0,ax+fh/2-t/2,-.044);m(rbox(fw,t,d,.0015),K.an,0,ax-fh/2+t/2,-.044);
   m(rbox(t,fh,d,.0015),K.an,fw/2-t/2,ax,-.044);m(rbox(t,fh,d,.0015),K.an,-fw/2+t/2,ax,-.044);
   /* the reflector glass, leaned back, with its amber coating; the rear glass */
   m(new T.PlaneGeometry(fw-.007,fh-.007),K.glass,0,ax,-.04,-.12);m(new T.PlaneGeometry(fw-.007,fh-.007),K.coat,0,ax,-.0402,-.12);
   m(new T.PlaneGeometry(.026,.022),K.glass,0,ax,.0645);
   /* the reticle, projected on the reflector */
   const r=m(new T.PlaneGeometry(.0085,.0085),K.ret,0,ax,-.0395);r.renderOrder=9;g.userData.ret=r;}
  /* the right-hand dial: brightness and reticle selector, knurled, with index marks; battery cap behind it */
  {const d=m(new T.CylinderGeometry(.011,.011,.009,32),K.an2,.019,ax-.004,.0,0,0,Math.PI/2);for(let i=0;i<20;i++){const a=i/20*6.28;m(rbox(.0025,.0011,.0016,.0004),K.an2,.0195,ax-.004+Math.sin(a)*.0112,Math.cos(a)*.0112,a);}
   for(let i=0;i<5;i++){const a=-.8+i*.4;m(rbox(.0003,.002,.0006,.0001),std({color:C(0xe0e0d8),roughness:.5}),.0236,ax-.004+Math.sin(a)*.0075,Math.cos(a)*.0075,a);}
   m(new T.CylinderGeometry(.0085,.0085,.006,32),K.an2,.0175,ax-.006,.04,0,0,Math.PI/2);}
  /* the side mount: an arm down the left of the receiver to the dovetail rail, the clamp, its lever and screw */
  {const L=-.0164;m(rbox(.006,.06,.07,.002),K.an,-.019,ax-.04,.02);m(rbox(.014,.012,.07,.002),K.an,L-.006,-.006,.02);m(rbox(.012,.03,.012,.002),K.an,-.017,ax-.068+.022,.02);
   const lv=m(rbox(.004,.012,.04,.0015),K.an2,L-.016,-.004,.04,0,.12,0);m(new T.CylinderGeometry(.004,.004,.008,24),K.an2,L-.015,-.004,.012,0,0,Math.PI/2);
   const mk=m(new T.PlaneGeometry(.05,.009),K.mark,-.0216,ax-.002,.012,0,-Math.PI/2,0);mk.renderOrder=3;}
  g.userData.sightY=ax;return g;}
/* a loose 30-round magazine (the old plum bakelite), the top round showing between the lips */
function akMag(){const G0=gunGroup(486,-22);const a=G0.add;const PM_=oldFurn().bake;cartridge(a,421,-12,3.2,'545');cartridge(a,423,-17,-3.2,'545');
  {const Cc=[1100,-33],Rf=612,Rr=675,a0=-.02,a1=.315,mg=[];const pt=(R,t)=>[Cc[0]-R*Math.cos(t),Cc[1]-R*Math.sin(t)];
    for(let i=0;i<=14;i++)mg.push(pt(Rf,a0+(a1-a0)*i/14));for(let i=14;i>=0;i--)mg.push(pt(Rr,a0+(a1-a0)*i/14));a(ext(mg,24,{bevel:2}),PM_);
    {const strip=(R0,R1)=>{const q=[];for(let i=0;i<=16;i++)q.push(pt(R0,a0+.01+(a1-a0-.03)*i/16));for(let i=16;i>=0;i--)q.push(pt(R1,a0+.01+(a1-a0-.03)*i/16));return q;};
     [-1,1].forEach(sd=>{a(ext(strip(Rf+2,Rf+5.5),1.4,{bevel:.4,z:sd*12.3}),PM_);a(ext(strip(Rr-5.5,Rr-2),1.4,{bevel:.4,z:sd*12.3}),PM_);});}
    {const fp=[pt(Rf-3,a1-.012),pt(Rr+3,a1-.012),pt(Rr+3,a1+.004),pt(Rf-3,a1+.004)];a(ext(fp,28,{bevel:1.4}),PM_);}
    {const [u,v]=pt(Rr-2,.0);a(xf(rbox(8,10,14,1),u-3,v-2,0),PM_);}[-1,1].forEach(sd=>a(xf(rbox(44,3,1.6,.5),452,-19.5,sd*10.6,0,0,-.02),PM_));a(xf(rbox(6,6,12,1),490.5,-25,0),PM_);}
  return G0.outer;}
/* NPC and world rifles: the same model merged into one mesh per material (a handful of draw calls instead of ~150),
   built once per variant and shared between everyone who carries one */
const _NPCG={};
function mergeAttrs(gs){let n=0;gs.forEach(g=>n+=g.attributes.position.count);const out=new T.BufferGeometry();
  [['position',3],['normal',3],['uv',2],['wear',1]].forEach(([a,sz])=>{const arr=new Float32Array(n*sz);let o=0;
    gs.forEach(g=>{const at=g.attributes[a],c=g.attributes.position.count;if(at)arr.set(at.array.subarray(0,c*sz),o*sz);o+=c;});out.setAttribute(a,new T.BufferAttribute(arr,sz));});
  out.computeBoundingSphere();return out;}
function npcAK(opt={}){const key=opt.wood?'w':'p';
  if(!_NPCG[key]){const src=buildAK(false,{wood:!!opt.wood});src.updateMatrixWorld(true);const by=new Map();
    src.traverse(m=>{if(!m.isMesh)return;const g=m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone();g.applyMatrix4(m.matrixWorld);
      if(!by.has(m.material))by.set(m.material,[]);by.get(m.material).push(g);});
    _NPCG[key]=[...by].map(([mat,gs])=>[mat,mergeAttrs(gs)]);}
  const o=new T.Group();_NPCG[key].forEach(([mat,g])=>{const x=new T.Mesh(g,mat);x.castShadow=true;x.receiveShadow=true;o.add(x);});
  o.userData={muzzle:V3(0,0,-(943-318)*.001),sightY:.0522,npc:true};return o;}
/* first-person arms: the player's own skinned glove + sleeve, with the elbow bone re-parented onto the gun */
function buildFPArm(side){const S=side<0?'L':'R';const cg=charGeo('player');const c=cg.c;const BN={};
  c.bones.forEach(b=>{const bo=new T.Bone();bo.position.fromArray(b.pos);bo.quaternion.fromArray(b.q);bo.userData.q0=bo.quaternion.clone();BN[b.n]=bo;if(b.p)BN[b.p].add(bo);});
  const root=new T.Group();root.add(BN.hips);root.updateMatrixWorld(true);const skel=new T.Skeleton(CD.bonesOrder.map(n=>BN[n]));
  const bi=CD.bonesOrder.indexOf('el'+S),bw=CD.bonesOrder.indexOf('wr'+S),bs=CD.bonesOrder.indexOf('sh'+S);const fingerIdx=new Set(CD.bonesOrder.map((n,i)=>n.endsWith(S+'1')||n.endsWith(S+'2')||n.endsWith(S+'3')?i:-1).filter(i=>i>=0));
  /* the sleeve now includes the upper arm (carried by the shoulder bone, which is swung up toward a shoulder point beside the
     camera every frame) so the arm never ends in an open tube, whatever the hands are doing */
  const ok=b0=>b0===bi||b0===bw||b0===bs||fingerIdx.has(b0);
  const own=(a,b,c,d)=>ok(d.skI[a*4])&&ok(d.skI[b*4])&&ok(d.skI[c*4]);
  const pcs=CD.outfits.ratnik.pieces;const pj=pcs.find(p=>p.name==='jacket'),pg=pcs.find(p=>p.name==='gloves');
  const fix=g=>{const SI=g.attributes.skinIndex.array,SW=g.attributes.skinWeight.array;for(let i=0;i<SI.length;i+=4){let w=0;
    let dom=bi,dw=-1;for(let k=0;k<4;k++)if(ok(SI[i+k])&&SW[i+k]>dw){dw=SW[i+k];dom=SI[i+k];}const tgt=dom===bs?bs:bi;
    for(let k=0;k<4;k++)if(!ok(SI[i+k])){w+=SW[i+k];SW[i+k]=0;SI[i+k]=tgt;}
    if(w>0){let k0=-1;for(let k=0;k<4;k++)if(SI[i+k]===tgt&&(k0<0||SW[i+k]>SW[i+k0]))k0=k;SW[i+k0]+=w;}}return g;};
  const sleeve=fix(wearGeo('player',pj,own,'fp'+S)).clone(),glove=fix(wearGeo('player',pg,own,'fp'+S));
  /* the cuffs are cinched down for shooting: pull the sleeve in toward the forearm axis, tighter toward the wrist */
  {const pe0=BN['el'+S].getWorldPosition(new T.Vector3()),pw0=BN['wr'+S].getWorldPosition(new T.Vector3()),ax=pw0.clone().sub(pe0),L2=ax.lengthSq(),p=sleeve.attributes.position,v=new T.Vector3(),c=new T.Vector3();
    const Lf=Math.sqrt(L2);for(let i=0;i<p.count;i++){v.fromBufferAttribute(p,i);const t0=v.clone().sub(pe0).dot(ax)/L2,t=Math.min(t0,1.15);c.copy(pe0).addScaledVector(ax,t);
      const f=t>=0?lerp(.9,.76,clamp(t,0,1)):lerp(1,.9,clamp(1+t*Lf/.05,0,1));v.sub(c).multiplyScalar(f).add(c);p.setXYZ(i,v.x,v.y,v.z);}
    sleeve.computeVertexNormals();}
  const out=[];[[sleeve,cmat('emr')],[glove,gloveMat('player',BN)]].forEach(([g,m])=>{const sm=new T.SkinnedMesh(g,m);sm.frustumCulled=false;root.add(sm);sm.bind(skel);out.push(sm);});
  /* palm normal and finger direction in the elbow bone's frame */
  const qe=new T.Quaternion(),qm=new T.Quaternion();BN['el'+S].getWorldQuaternion(qe);BN['mid'+S+'1'].getWorldQuaternion(qm);
  const pn=new T.Vector3(0,0,1).applyQuaternion(qm).applyQuaternion(qe.clone().invert());
  const hand={fingers:['idx','mid','rng','pnk'].map(f=>[1,2,3].map(k=>BN[f+S+k])),thumb:[1,2,3].map(k=>BN['th'+S+k])};
  /* wrist-local finger direction and palm normal, measured in the bind pose */
  const wr=BN['wr'+S],m1=BN['mid'+S+'1'];const pw=wr.getWorldPosition(new T.Vector3()),pm=m1.getWorldPosition(new T.Vector3()),pe=BN['el'+S].getWorldPosition(new T.Vector3());
  const qwi=wr.getWorldQuaternion(new T.Quaternion()).invert(),qm1=m1.getWorldQuaternion(new T.Quaternion());
  const fing=pm.clone().sub(pw).normalize().applyQuaternion(qwi),palm=new T.Vector3(0,0,1).applyQuaternion(qm1).applyQuaternion(qwi);
  const qe1=BN['el'+S].getWorldQuaternion(new T.Quaternion());const palmE=new T.Vector3(0,0,1).applyQuaternion(qm1).applyQuaternion(qe1.clone().invert());
  const sh=BN['sh'+S],ps0=sh.getWorldPosition(new T.Vector3());
  return{root,el:BN['el'+S],wr,hand,pn,meshes:out,fing,palm,palmE,Lf:pe.distanceTo(pw),side,sh,
    shB:{d:pe.clone().sub(ps0).normalize(),f:pw.clone().sub(pe).normalize(),q:sh.getWorldQuaternion(new T.Quaternion()),L:ps0.distanceTo(pe)}};}
/* swing the upper arm from a shoulder point beside the camera to wherever the elbow is (the forearm hangs off the gun) */
const _s1=new T.Vector3(),_s2=new T.Vector3(),_s3=new T.Vector3(),_sq1=new T.Quaternion(),_sq2=new T.Quaternion();
function fpShoulder(arm,cam){if(!arm.sh||!arm.el.parent)return;const B=arm.shB;arm.root.updateMatrixWorld(true);arm.el.updateWorldMatrix(true,false);
  const E=arm.el.getWorldPosition(_s1),W=arm.wr.getWorldPosition(_s2);
  const S=cam.localToWorld(_s3.set(-arm.side*.2,-.25,.07));const dir=E.clone().sub(S).normalize(),fN=W.clone().sub(E).normalize();
  arm.root.getWorldQuaternion(_sq1);const dB=B.d.clone().applyQuaternion(_sq1),fB=B.f.clone().applyQuaternion(_sq1),qB=_sq1.clone().multiply(B.q);
  const q=basisQ(dB,fB,dir,fN,new T.Quaternion()).multiply(qB);
  const par=arm.sh.parent;par.updateWorldMatrix(true,false);arm.sh.position.copy(par.worldToLocal(E.clone().addScaledVector(dir,-B.L)));
  par.getWorldQuaternion(_sq2);arm.sh.quaternion.copy(_sq2.invert().multiply(q));}
/* grip placement with an independent forearm direction: the forearm comes in along A (gun space), the hand
   is then turned at the wrist so its fingers run along F and the palm faces N */
function placeArm2(arm,gun,grip,F,N,A,roll=0){F=F.clone().normalize();A=A.clone().normalize();N=N.clone().sub(F.clone().multiplyScalar(N.dot(F))).normalize();
  const wristP=grip.clone().addScaledVector(F,-.072).addScaledVector(N,-.02);
  gun.add(arm.el);arm.el.position.copy(wristP).addScaledVector(A,-arm.Lf);
  /* forearm roll: keep the palm side of the forearm turned toward the palm direction (plus an optional roll) */
  const Np=N.clone().sub(A.clone().multiplyScalar(N.dot(A))).normalize().applyAxisAngle(A,roll);
  basisQ(V3(0,-1,0),arm.palmE,A,Np,arm.el.quaternion);
  const qh=basisQ(arm.fing,arm.palm,F,N,new T.Quaternion());arm.wr.quaternion.copy(arm.el.quaternion.clone().invert().multiply(qh));}
/* place an arm so the palm sits at `grip` (gun space), fingers along `fdir`, palm facing `ndir` */
function placeArm(arm,gun,grip,fdir,ndir){const F=fdir.clone().normalize(),N=ndir.clone().sub(fdir.clone().normalize().multiplyScalar(ndir.dot(F))).normalize();
  const lf=new T.Vector3(0,-1,0),ln=arm.pn.clone().sub(lf.clone().multiplyScalar(arm.pn.dot(lf))).normalize();
  const A=new T.Matrix4().makeBasis(lf,ln,new T.Vector3().crossVectors(lf,ln)),Bm=new T.Matrix4().makeBasis(F,N,new T.Vector3().crossVectors(F,N));
  const R=Bm.multiply(A.transpose());const q=new T.Quaternion().setFromRotationMatrix(R);
  gun.add(arm.el);arm.el.quaternion.copy(q);arm.el.position.copy(grip).addScaledVector(F,-.25-.045).addScaledVector(N,-.016);}
