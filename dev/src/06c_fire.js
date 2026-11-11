/* ---------- barrel fire: rusted, heat-scorched drum with air holes; inside, an ash bed with glowing coals and a stack
   of split logs - bark on the cooler upper ends, charred alligator-cracked wood lower down whose cracks glow and breathe;
   a ray-marched volumetric flame (turbulent 3D noise shaped into tongues, temperature-coloured); thin smoke and sparks ---------- */
const FIRE={list:[]};window.__fire=FIRE;
/* charred wood: black-grey crazed surface; the glow mask is the crack network */
const CHARTEX=(()=>{const N=256;const c=document.createElement('canvas');c.width=c.height=N;const g=c.getContext('2d');const im=g.createImageData(N,N),d=im.data;
  const gc=document.createElement('canvas');gc.width=gc.height=N;const gg=gc.getContext('2d');const gi=gg.createImageData(N,N),gd=gi.data;
  for(let y=0;y<N;y++)for(let x=0;x<N;x++){const u=x/N,v=y/N;const [f1,f2]=wor(u,v*.45,7,3);const crack=sstep(.06,0,f2);const n=fbmT(u,v,12,3),sheen=sstep(.55,.8,fbmT(u,v,24,2));
    const k=(18+n*22+sheen*28)*(1-crack*.75);const i=(y*N+x)*4;d[i]=k;d[i+1]=k*.95;d[i+2]=k*.92;d[i+3]=255;
    const gl=crack*(.55+.45*n)+sstep(.7,.9,1-f1)*.15;gd[i]=gd[i+1]=gd[i+2]=Math.min(255,gl*255);gd[i+3]=255;}
  g.putImageData(im,0,0);gg.putImageData(gi,0,0);
  const t1=new T.CanvasTexture(c),t2=new T.CanvasTexture(gc);[t1,t2].forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;});t1.encoding=T.sRGBEncoding;return{map:t1,glow:t2};})();
/* firewood: its own texture (not the house logs) - pine bark in fissured plates on the outside, pale split wood with
   grain on the flat faces - blended per vertex into charred, crazed wood ('charA'); the crack network glows and breathes */
const BARKTEX=(()=>{const N=256;return tex(N,N,(g,w,h)=>{const im=g.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h;
    const [f1,f2]=wor(u*1.2,v*.35,6,9);const plate=sstep(.02,.08,f2);const n=fbmT(u,v,16,3),gr=fbmT(u*.3,v*4,20,2);const bark=[58+n*30,44+n*22,34+n*16].map(c=>c*(.45+.55*plate));
    const split=u>.78;const wood=[176+gr*40,140+gr*30,96+gr*22].map(c=>c*(.85+.15*Math.sin(v*90+gr*8)));const c=split?wood:bark;const i=(y*w+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=255;}
  g.putImageData(im,0,0);},{rep:[1,1]});})();
function logFireMat(){const m=std({map:BARKTEX,roughness:.92,envMapIntensity:.2,emissive:new T.Color(1,.32,.06),emissiveIntensity:1});m.userData.objSpace=true;
  m.onBeforeCompile=s=>{s.uniforms.tChar={value:CHARTEX.map};s.uniforms.tGlow={value:CHARTEX.glow};s.uniforms.uT=FIRE.uT||(FIRE.uT={value:0});
    s.vertexShader='attribute float charA;varying float vChar;varying vec3 vLP;varying vec3 vLN;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvChar=charA;vLP=position;vLN=normal;');
    s.fragmentShader='uniform sampler2D tChar,tGlow;uniform float uT;varying float vChar;varying vec3 vLP;varying vec3 vLN;\n'+s.fragmentShader
      .replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(texture2D(map,vec2(atan(vLP.x,vLP.z)/6.2832+.5,vLP.y*2.2)));diffuseColor*=texelColor;\nvec2 cuv=vec2(atan(vLP.x,vLP.z)*.6,vLP.y*1.7);vec3 chc=sRGBToLinear(texture2D(tChar,cuv)).rgb;float chM=smoothstep(.05,.55,vChar);float cap=step(.8,abs(normalize(vLN).y));float rr=length(vLP.xz);float ring=.5+.5*sin(rr*260.+sin(atan(vLP.x,vLP.z)*3.)*1.5);vec3 eg=mix(vec3(.30,.20,.11),vec3(.42,.29,.16),ring)*(.8+.2*texture2D(tChar,vLP.xz*3.).r);diffuseColor.rgb=mix(diffuseColor.rgb,eg,cap);diffuseColor.rgb=mix(diffuseColor.rgb,chc,max(chM,cap*(.55+.45*smoothstep(.0,.03,rr))));')
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.75,vChar);')
      .replace('#include <emissivemap_fragment>',`float gm=mix(texture2D(tGlow,cuv).r,texture2D(tGlow,vLP.xz*2.5).r*.8+.25*step(.03,length(vLP.xz)),step(.8,abs(normalize(vLN).y)));float br=.5+.5*sin(uT*1.7+vLP.y*9.+gm*6.)*sin(uT*.73+vLP.x*7.+vLP.z*5.);
        float heat=smoothstep(.5,1.,vChar);totalEmissiveRadiance*=gm*heat*(.35+br)*3.4+heat*heat*.1;`);};
  m.customProgramCacheKey=()=>'logfire3';return m;}
/* a split log as an irregular prism (radius r, length len), axis along y */
function fireLog(len,r){const g=new T.CylinderGeometry(r*.94,r,len,8,6);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){const a=Math.atan2(p.getX(i),p.getZ(i));const k=1+.1*Math.sin(a*3+len*7)+.05*Math.sin(a*5);p.setX(i,p.getX(i)*k);p.setZ(i,p.getZ(i)*k);}
  g.setAttribute('charA',new T.BufferAttribute(new Float32Array(p.count),1));g.computeVertexNormals();return g;}
/* segment-segment distance (capsule collision) */
function segDist(p1,q1,p2,q2){const d1=q1.clone().sub(p1),d2=q2.clone().sub(p2),r=p1.clone().sub(p2);const a=d1.dot(d1),e=d2.dot(d2),f=d2.dot(r);let s,t;
  const c=d1.dot(r),b=d1.dot(d2),den=a*e-b*b;s=den>1e-9?clamp((b*f-c*e)/den,0,1):0;t=(b*s+f)/e;if(t<0){t=0;s=clamp(-c/a,0,1);}else if(t>1){t=1;s=clamp((b-c)/a,0,1);}
  return p1.clone().addScaledVector(d1,s).distanceTo(p2.clone().addScaledVector(d2,t));}
/* the volumetric flame */
function flameVolume(W,H,R,rim,steps){const g=new T.BoxGeometry(W,H,W);g.translate(0,H/2,0);
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.CustomBlending,blendSrc:T.OneFactor,blendDst:T.OneMinusSrcAlphaFactor,blendSrcAlpha:T.ZeroFactor,blendDstAlpha:T.OneFactor,side:T.FrontSide,fog:false,
    uniforms:{uT:FIRE.uT||(FIRE.uT={value:0}),uCam:{value:new T.Vector3()},uH:{value:H},uW:{value:W*.5},uI:{value:1},uWind:{value:new T.Vector2(.12,.05)},uR:{value:R},uRim:{value:rim}},
    vertexShader:'uniform vec3 uCam;varying vec3 vO;varying vec3 vC;void main(){vO=position;vC=uCam;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader:(steps?(x=>x.replace('const int NS=40','const int NS='+steps)):(x=>x))(`uniform float uT,uH,uW,uI,uR,uRim;uniform vec2 uWind;varying vec3 vO;varying vec3 vC;
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
  mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fb(vec3 p){float s=0.,a=.5;for(int i=0;i<5;i++){s+=a*n3(p);p=p*2.03+vec3(1.3,-2.1,.7);a*=.5;}return s;}
float fb2(vec3 p){return .66*n3(p)+.34*n3(p*2.1+vec3(4.1,1.7,-2.3));}
vec3 ramp(float t){
  vec3 c=mix(vec3(.4,.03,.0),vec3(1.,.22,.02),smoothstep(0.,.3,t));
  c=mix(c,vec3(1.,.42,.06),smoothstep(.28,.55,t));
  c=mix(c,vec3(1.,.66,.22),smoothstep(.55,.82,t));
  return mix(c,vec3(1.,.86,.6),smoothstep(.86,1.,t));}
void main(){vec3 ro=vC,rd=normalize(vO-vC);vec3 bmin=vec3(-uW,0.,-uW),bmax=vec3(uW,uH,uW);
  vec3 t0=(bmin-ro)/rd,t1=(bmax-ro)/rd;vec3 tn=min(t0,t1),tf=max(t0,t1);float a=max(max(max(tn.x,tn.y),tn.z),0.),b=min(min(tf.x,tf.y),tf.z);if(b<=a)discard;
  const int NS=40;float dt=(b-a)/float(NS);vec3 col=vec3(0.);float tr=1.;float j=h3(vec3(gl_FragCoord.xy,fract(uT*7.)*91.));
  float t=uT;
  /* the drum: an open-topped steel cylinder (radius uR, rim at uRim). A sample is seen only if the sight line to it does
     not pass through the wall below the rim */
  float A=dot(rd.xz,rd.xz),B=dot(ro.xz,rd.xz),Cc=dot(ro.xz,ro.xz)-uR*uR,disc=B*B-A*Cc;
  float tE=1e9,tX=1e9;if(disc>0.&&A>1e-6){float sq=sqrt(disc);tE=(-B-sq)/A;tX=(-B+sq)/A;}
  float yE=ro.y+rd.y*tE,yX=ro.y+rd.y*tX;bool hitWall=disc>0.&&Cc>0.&&yE<uRim;float tStop=hitWall?tE:(yX<uRim?tX:1e9);
  for(int i=0;i<NS;i++){float ts=a+(float(i)+j)*dt;if(ts>tStop)break;vec3 p=ro+rd*ts;float y=p.y/uH;
    if(p.y<uRim&&dot(p.xz,p.xz)>uR*uR)continue;
    vec2 q=p.xz-uWind*y*y*uH;
    /* large slow curl: the whole flame sways and twists, more at the top */
    vec3 wp=vec3(q*2.4,p.y*1.3-t*1.2);
    vec2 w=vec2(fb2(wp),fb2(wp+vec3(5.2,1.3,2.8)))-.5;
    q+=w*(.08+.4*y)*uW*2.;
    /* tongue field: advected upward fast, stretched vertically (features ~3x taller than wide) */
    float n=fb(vec3(q*10.5,p.y*2.9-t*3.6))*.78+fb2(vec3(q*24.+3.1,p.y*5.2-t*5.6))*.22;
    float r=length(q)/uW;
    float cone=1.-r/max(.1,1.-.5*y);
    float f=cone*.95+(n-.5)*2.5-y*.78;
    float d=smoothstep(0.,.05,f)*(.55+.45*smoothstep(.0,.35,f))*(.15+.85*smoothstep(.05,.32,y));
    if(d>.001){float temp=clamp(f*1.3+(1.-y)*.25-.06,0.,1.);
      float e=d*dt*uI*7.5*(.3+temp*1.6);
      col+=tr*ramp(temp)*e;tr*=exp(-d*dt*6.);}
  }
  gl_FragColor=vec4(col,(1.-tr)*.62);}`)});
  const fm=new T.Mesh(g,m);fm.renderOrder=7;fm.frustumCulled=true;return fm;}
/* build the whole barrel fire at (x,0,z); returns the handle the frame loop animates */
function barrelFire(x,z){const g=new T.Group();g.position.set(x,0,z);scene.add(g);const R0=.29,Hd=.88,FLOORY=.56;
  /* scorched drum texture: rust lower down, burnt blue-black and flaking near the hot top */
  const drT=tex(256,256,(c,w,h)=>{c.drawImage(TX.rust.image,0,0,w,h);const gr=c.createLinearGradient(0,0,0,h);gr.addColorStop(0,'rgba(18,16,18,.9)');gr.addColorStop(.35,'rgba(40,30,30,.55)');gr.addColorStop(.7,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(0,0,w,h);
    const r=rng(17);for(let i=0;i<160;i++){c.fillStyle=`rgba(${120+r()*60},${60+r()*30},${30},${.2+r()*.4})`;c.beginPath();c.arc(r()*w,h*.25+r()*h*.75,1+r()*4,0,7);c.fill();}},{rep:[2,1]});
  const drm=std({map:drT,roughness:.9,metalness:.35,side:T.DoubleSide,envMapIntensity:.4});
  const prof=[[R0,0],[R0+.012,.01],[R0,.03],[R0,.29],[R0+.01,.3],[R0,.31],[R0,.58],[R0+.01,.59],[R0,.6],[R0,Hd-.02],[R0+.006,Hd]];
  mesh(lathe(prof,32),drm,0,0,0,g);
  /* air holes punched round the bottom: dark rim with the coal glow showing through */
  const holeGlow=new T.MeshBasicMaterial({color:C(0xff6a1a),map:tex(32,32,(c,w,h)=>{const gr=c.createRadialGradient(w/2,h/2,1,w/2,h/2,w/2);gr.addColorStop(0,'#ffcf70');gr.addColorStop(.5,'#ff6a10');gr.addColorStop(1,'#401004');c.fillStyle=gr;c.fillRect(0,0,w,h);},{clamp:true})});FIRE.holeMat=holeGlow;
  for(let i=0;i<7;i++){const a=i/7*Math.PI*2+.3;const hm=mesh(new T.CircleGeometry(.024,12),holeGlow,Math.sin(a)*(R0+.003),.16+(i%2)*.03,Math.cos(a)*(R0+.003),g,false);hm.rotation.y=a;
    const rimR=mesh(new T.RingGeometry(.024,.034,12),std({color:C(0x1a1410),roughness:.8}),Math.sin(a)*(R0+.004),.16+(i%2)*.03,Math.cos(a)*(R0+.004),g,false);rimR.rotation.y=a;}
  /* ash bed with coals */
  const ashT=tex(128,128,(c,w,h)=>{c.fillStyle='#5a5652';c.fillRect(0,0,w,h);pix2(c,w,h,.6);},{});
  const ashG=tex(256,256,(c,w,h)=>{c.fillStyle='#000';c.fillRect(0,0,w,h);const r2=rng(5);
    for(let i=0;i<900;i++){const x=r2()*w,y=r2()*h,dd=Math.hypot(x-w/2,y-h/2)/(w/2);if(dd>.95)continue;const k=r2()*(1.1-dd*.6),rr=.6+r2()*r2()*2.6;
      c.fillStyle=`rgba(255,${90+k*120|0},${20+k*40|0},${Math.min(1,.25+k*.8)})`;c.beginPath();c.ellipse(x,y,rr*(1+r2()),rr,r2()*3,0,7);c.fill();}},{});
  const ash=mesh(new T.CircleGeometry(R0-.01,24),std({map:ashT,roughness:1,color:C(0x8a8680),emissive:C(0xff5a18),emissiveMap:ashG,emissiveIntensity:1}),0,FLOORY,0,g,false);FIRE.ashMat=ash.material;ash.rotation.x=-Math.PI/2;
  const coalM=std({color:C(0x0d0b0a),roughness:.95,emissive:C(0xa82a06),emissiveIntensity:1});FIRE.coalMat=coalM;
  const r=rng(31);for(let i=0;i<48;i++){const a=r()*6.28,d=Math.sqrt(r())*(R0-.04);const s=.008+r()*.016;const cm=mesh(new T.IcosahedronGeometry(s,1),coalM,Math.sin(a)*d,FLOORY+s*.4,Math.cos(a)*d,g,false);cm.rotation.set(r()*3,r()*3,r()*3);cm.scale.set(1,.6+r()*.4,1+r()*.5);}
  /* logs dropped into the drum one at a time: each is lowered until it rests on the ash, on a log already in, or would
     hit the drum wall - capsule collision, so nothing interpenetrates. First the bed logs lie nearly flat, later ones lean. */
  const lm=logFireMat();FIRE.logMat=lm;const placed=[],BED=FLOORY,RIM=Hd;
  const wallOK=(p,q,rad,over=.03)=>[p,q].every(e=>Math.hypot(e.x,e.z)<=R0-rad-.012)&&Math.max(p.y,q.y)+rad<RIM+over;
  /* lower a log (fixed plan position) from above until it touches the ash or another log - returns its resting ends */
  const hits=(p,q,rad)=>Math.min(p.y,q.y)-rad<BED||placed.some(L=>segDist(p,q,L.p,L.q)<rad+L.r+.002);
  const inWall=(p,q,rad)=>[p,q].every(e=>Math.hypot(e.x,e.z)<=R0-rad-.012);
  /* lower a log from above until it touches the ash or another log, then let it settle under gravity: repeatedly try a
     straight drop and pivots about points along the log (both ways, in its vertical plane), keeping any move that lowers
     its centre without touching the ash, another log or the drum wall - so it rolls off a single contact and comes to rest
     on two supports, or leans against the wall */
  const drop=(P0,Q0,rad)=>{let last=null;for(let dy=1.4;dy>-1;dy-=.002){const p=P0.clone(),q=Q0.clone();p.y+=dy;q.y+=dy;if(hits(p,q,rad))break;last=[p,q];}
    if(!last)return null;let [p,q]=last;const len=p.distanceTo(q);
    const ok=(a,b)=>!hits(a,b,rad)&&inWall(a,b,rad);
    for(let it=0;it<1500;it++){const cy=(p.y+q.y)/2;let best=null;
      const dn=[p.clone(),q.clone()];dn[0].y-=.002;dn[1].y-=.002;if(ok(dn[0],dn[1]))best=dn;
      if(!best){const d=q.clone().sub(p).divideScalar(len),hl=Math.hypot(d.x,d.z),th=Math.atan2(d.y,hl),hx=hl>1e-6?d.x/hl:1,hz=hl>1e-6?d.z/hl:0;
        for(const sp of [0,.15,.3,.45,.55,.7,.85,1]){const c=p.clone().lerp(q,sp);for(const sg of [-1,1]){const t2=th+sg*.01;
          const nd=V3(hx*Math.cos(t2),Math.sin(t2),hz*Math.cos(t2));const a=c.clone().addScaledVector(nd,-sp*len),b=c.clone().addScaledVector(nd,(1-sp)*len);
          if((a.y+b.y)/2<cy-1e-5&&ok(a,b)){best=[a,b];break;}}if(best)break;}}
      if(!best)break;[p,q]=best;}
    return[p,q];};
  const put=(p,q,rad)=>{placed.push({p,q,r:rad});const len=p.distanceTo(q),dir=q.clone().sub(p).normalize();
    const lg=new T.Mesh(fireLog(len,rad),lm);lg.castShadow=true;lg.position.copy(p).add(q).multiplyScalar(.5);lg.quaternion.setFromUnitVectors(V3(0,1,0),dir);lg.rotateY(r()*6.28);g.add(lg);
    /* char: everything low in the drum is burnt through and glowing; higher, cooler ends keep some bark */
    lg.updateMatrix();const P=lg.geometry.attributes.position,CA=lg.geometry.attributes.charA,v=V3();
    for(let i=0;i<P.count;i++){v.fromBufferAttribute(P,i).applyMatrix4(lg.matrix);CA.setX(i,clamp(1.3-(v.y-BED)/.3+(hash(v.x*40,v.z*40)-.5)*.3,.25,1));}};
  /* bed: three split logs laid in a loose triangle on the coals - they cross near their ends, the middle stays open */
  const a0=r()*6.28;[[.37,.045],[.36,.042],[.37,.044]].forEach(([len,rad],i)=>{for(let k=0;k<40;k++){const ai=a0+i*2.094+(r()-.5)*.12,io=.112+r()*.01;
    const c=V3(Math.sin(ai)*io,0,Math.cos(ai)*io),d=V3(Math.cos(ai),(r()-.5)*.06,-Math.sin(ai)).normalize();
    const P0=c.clone().addScaledVector(d,-len/2),Q0=c.clone().addScaledVector(d,len/2);if(!wallOK(P0,Q0,rad))continue;const e=drop(P0,Q0,rad);if(e&&wallOK(e[0],e[1],rad)){put(e[0],e[1],rad);break;}}});
  /* leaners: split logs stood in round the drum, foot near the middle, head resting against the wall just under the rim */
  const NL=6;for(let i=0;i<NL;i++){const rad=.032+r()*.012;let done=false;
    for(let k=0;k<220&&!done;k++){const len=.5-(k%110)*.0018-r()*.05,a=(k<40?i/NL*6.283+.5:r()*6.283)+(r()-.5)*.45,rt=R0-rad-.014,rb=.03+r()*.1,ab=a+Math.PI+(r()-.5)*.9;
      const hs=Math.hypot(Math.sin(a)*rt-Math.sin(ab)*rb,Math.cos(a)*rt-Math.cos(ab)*rb);if(hs>=len*.95)continue;const vs=Math.sqrt(len*len-hs*hs);
      const P0=V3(Math.sin(ab)*rb,0,Math.cos(ab)*rb),Q0=V3(Math.sin(a)*rt,vs,Math.cos(a)*rt);const e=drop(P0,Q0,rad);if(e&&wallOK(e[0],e[1],rad,.1)){put(e[0],e[1],rad);done=true;}}}
  /* check: report any interpenetrating pair (should be none) */
  let worst=1;for(let i=0;i<placed.length;i++)for(let j=i+1;j<placed.length;j++){const A=placed[i],B=placed[j];worst=Math.min(worst,segDist(A.p,A.q,B.p,B.q)-A.r-B.r);}FIRE.logGap=worst;FIRE.nLogs=placed.length;
  /* flame volume over the coals */
  const fl=flameVolume(.56,1.15,R0-.004,Hd-FLOORY);fl.position.set(0,FLOORY,0);g.add(fl);FIRE.flameMat=fl.material;
  const light=new T.PointLight(C(0xff8a3a),2.4,10,2);light.position.set(0,1.55,0);g.add(light);
  const h={g,light,p:V3(x,.85,z),fl,smokeAcc:0,emAcc:0};FIRE.list.push(h);return h;}
function fireUpdate(dt,t){if(!FIRE.list.length)return;FIRE.uT.value=t%1200;
  for(const f of FIRE.list){/* flicker: layered sines + a little noise; drives light, coals, crack glow, flame intensity */
    const k=.82+Math.sin(t*11.3)*.07+Math.sin(t*6.9+1.3)*.09+Math.sin(t*23.1)*.04+(Math.random()-.5)*.05;
    f.light.intensity=2.5*k;f.light.position.x=Math.sin(t*5.1)*.04;f.light.position.z=Math.cos(t*4.3)*.04;
    if(FIRE.coalMat)FIRE.coalMat.emissiveIntensity=.45+.2*Math.sin(t*1.3)+.1*k;if(FIRE.ashMat)FIRE.ashMat.emissiveIntensity=.7+.3*Math.sin(t*.9)+.2*k;if(FIRE.logMat)FIRE.logMat.emissiveIntensity=.9*k;
    if(FIRE.holeMat)FIRE.holeMat.color.setRGB(.9*k,.75*k,.6*k);f.fl.material.uniforms.uI.value=.85+.25*k;f.fl.updateMatrixWorld();f.fl.material.uniforms.uCam.value.copy(camera.position);f.fl.worldToLocal(f.fl.material.uniforms.uCam.value);
    /* thin, smooth smoke: a few large soft puffs a second that rise, spread and fade */
    f.smokeAcc+=dt*2.6;while(f.smokeAcc>1){f.smokeAcc--;FX.smoke.spawn(_w.set(f.p.x+rnd(-.08,.08),f.p.y+.55,f.p.z+rnd(-.08,.08)),_v.set(rnd(-.05,.05)+.12,rnd(.45,.65),rnd(-.05,.05)+.04),
      rnd(5,7),rnd(.18,.26),rnd(1.4,2.1),[.17,.16,.15,.16],[.42,.42,.41,0],{drag:.25,spin:rnd(-.25,.25)});}
    f.emAcc+=dt*9;while(f.emAcc>1){f.emAcc--;FX.ember.spawn(_w.set(f.p.x+rnd(-.1,.1),f.p.y+.1,f.p.z+rnd(-.1,.1)),_v.set(rnd(-.3,.3),rnd(1.4,3.0),rnd(-.3,.3)),rnd(1.2,2.8),.012,.004,[1,.65,.25,1],[1,.25,.05,0],{drag:.5,up:.25});}}}
