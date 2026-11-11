'use strict';
const S={};
const $=id=>document.getElementById(id);
const T=THREE;
/* round things get enough sides to look round: once HIPOLY is on (from the BTR's build on), every turned, rolled or
   bent part - cylinders, discs, spheres, rings, lathed profiles - gets a side count to match its size, from a chair
   rung up to a drum; asked-for counts above the minimum stand. Hair-thin wire (under 3 mm) is left as asked. */
let HIPOLY=false;{const sides=r=>r>=.15?32:r>=.08?24:r>=.04?20:r>=.015?16:r>=.006?12:r>=.003?8:0;
 const C0=T.CylinderGeometry;T.CylinderGeometry=class extends C0{constructor(rt=1,rb=1,h=1,rs=8,hs=1,oe=false,ts=0,tl=Math.PI*2){
  /* (three or four sides asked for is a deliberate prism or pyramid - a square post, a tent roof - and stays) */
  if(HIPOLY&&rs>4){rs=Math.max(rs,Math.ceil(sides(Math.max(rt,rb))*Math.max(.35,tl/(Math.PI*2))));}super(rt,rb,h,rs,hs,oe,ts,tl);}};
 const D0=T.CircleGeometry;T.CircleGeometry=class extends D0{constructor(r=1,sg=8,ts=0,tl=Math.PI*2){if(HIPOLY)sg=Math.max(sg,Math.ceil(sides(r)*Math.max(.35,tl/(Math.PI*2))));super(r,sg,ts,tl);}};
 const S0=T.SphereGeometry;T.SphereGeometry=class extends S0{constructor(r=1,ws=8,hs=6,ps=0,pl=Math.PI*2,ts=0,tl=Math.PI){
  if(HIPOLY&&r>=.003){const n=sides(r);ws=Math.max(ws,Math.ceil(n*pl/(Math.PI*2)));hs=Math.max(hs,Math.ceil(n*.6*tl/Math.PI));}super(r,ws,hs,ps,pl,ts,tl);}};
 const R0=T.TorusGeometry;T.TorusGeometry=class extends R0{constructor(R=1,tb=.4,rs=8,ts=6,arc=Math.PI*2){
  if(HIPOLY){if(tb>=.003)rs=Math.max(rs,tb>=.02?14:tb>=.008?10:8);ts=Math.max(ts,Math.ceil(Math.max(12,sides(R)*1.5)*arc/(Math.PI*2)));}super(R,tb,rs,ts,arc);}};
 const L0=T.LatheGeometry;T.LatheGeometry=class extends L0{constructor(pts,sg=12,ps=0,pl=Math.PI*2){
  if(HIPOLY){let r=0;for(const p of pts)r=Math.max(r,p.x);sg=Math.max(sg,Math.ceil(Math.max(12,sides(r))*pl/(Math.PI*2)));}super(pts,sg,ps,pl);}};}
/* one copy of a texture or material that many pieces share (made the first time it is asked for) */
const MEMO=new Map();function memo(k,f){let v=MEMO.get(k);if(v===undefined){v=f();MEMO.set(k,v);}return v;}
let _s=20261019;
const R=()=>{_s=(_s*16807)%2147483647;return (_s-1)/2147483646;};
const rnd=(a=1,b)=>b===undefined?R()*a:a+R()*(b-a);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const lerp=(a,b,t)=>a+(b-a)*t;
const sstep=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t);};
const damp=(a,b,k,dt)=>a+(b-a)*(1-Math.exp(-k*dt));
function hash(x,y){const h=Math.sin(x*127.1+y*311.7)*43758.5453;return h-Math.floor(h);}
function vnoise(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return lerp(lerp(hash(xi,yi),hash(xi+1,yi),u),lerp(hash(xi,yi+1),hash(xi+1,yi+1),u),v);}
function fbm(x,y,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnoise(x*f,y*f);n+=a;a*=.5;f*=2;}return s/n;}
/* tileable noise for textures (no seams) */
function vnP(x,y,p){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi;const u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);const m=a=>((a%p)+p)%p;
  const x0=m(xi),x1=m(xi+1),y0=m(yi),y1=m(yi+1);return lerp(lerp(hash(x0,y0),hash(x1,y0),u),lerp(hash(x0,y1),hash(x1,y1),u),v);}
function fbmT(u,v,p,o=4){let s=0,a=.5,f=1,n=0;for(let i=0;i<o;i++){s+=a*vnP(u*p*f,v*p*f,p*f);n+=a;a*=.5;f*=2;}return s/n;}
const C=h=>new T.Color(h).convertSRGBToLinear();
const V3=(x=0,y=0,z=0)=>new T.Vector3(x,y,z);

/* ---------- texture factory ---------- */
function tex(w,h,fn,o={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');fn(g,w,h);
  const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=o.clamp?T.ClampToEdgeWrapping:T.RepeatWrapping;if(o.rep)t.repeat.set(o.rep[0],o.rep[1]);
  t.anisotropy=8;if(!o.data)t.encoding=T.sRGBEncoding;return t;}
/* colour bleed for cut-out textures: the clear pixels round leaves, flowers, blades take the colour of the nearest
   painted pixel instead of black, so mipmaps and filtering never pull a dark fringe in (at a distance every small
   cut-out sprite turned into a dark dot). Iterative dilation, then whatever is still unreached gets the mean colour. */
function bleedAlpha(t,passes=24){const c=t.image;if(!c||!c.getContext)return t;const w=c.width,h=c.height,g=c.getContext('2d'),im=g.getImageData(0,0,w,h),d=im.data;
  const n=w*h,col=new Float32Array(n*3),has=new Uint8Array(n);let mr=0,mg=0,mb=0,mc=0;
  for(let i=0;i<n;i++)if(d[i*4+3]>=96){has[i]=1;col[i*3]=d[i*4];col[i*3+1]=d[i*4+1];col[i*3+2]=d[i*4+2];mr+=d[i*4];mg+=d[i*4+1];mb+=d[i*4+2];mc++;}
  let front=[];for(let i=0;i<n;i++)if(!has[i])front.push(i);
  for(let p=0;p<passes&&front.length;p++){const nx=[],upd=[];
    for(const i of front){const x=i%w,y=(i/w)|0;let r=0,gg=0,b=0,k=0;for(let dy=-1;dy<=1;dy++){const yy=y+dy;if(yy<0||yy>=h)continue;for(let dx=-1;dx<=1;dx++){const xx=x+dx;if(xx<0||xx>=w)continue;const j=yy*w+xx;if(has[j]){r+=col[j*3];gg+=col[j*3+1];b+=col[j*3+2];k++;}}}
      if(k){upd.push(i,r/k,gg/k,b/k);}else nx.push(i);}
    for(let q=0;q<upd.length;q+=4){const i=upd[q];col[i*3]=upd[q+1];col[i*3+1]=upd[q+2];col[i*3+2]=upd[q+3];has[i]=1;}front=nx;}
  if(mc){mr/=mc;mg/=mc;mb/=mc;}for(const i of front){col[i*3]=mr;col[i*3+1]=mg;col[i*3+2]=mb;}
  for(let i=0;i<n;i++)if(d[i*4+3]<96){d[i*4]=col[i*3];d[i*4+1]=col[i*3+1];d[i*4+2]=col[i*3+2];}
  g.putImageData(im,0,0);t.needsUpdate=true;return t;}
/* per-pixel painter: f(u,v) -> [r,g,b,a?] with u,v in 0..1 */
function pix(g,w,h,f){const img=g.createImageData(w,h),d=img.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const c=f(x/w,y/h,x,y);const i=(y*w+x)*4;
  d[i]=clamp(c[0],0,255);d[i+1]=clamp(c[1],0,255);d[i+2]=clamp(c[2],0,255);d[i+3]=c[3]===undefined?255:clamp(c[3],0,255);}g.putImageData(img,0,0);}
const mixc=(a,b,t)=>[lerp(a[0],b[0],t),lerp(a[1],b[1],t),lerp(a[2],b[2],t)];

/* ---------- global fog chunk: exponential with height falloff ---------- */
/* nothing a material writes may overflow the half-float target (a mirror-sharp highlight could, and inf turns to NaN
   downstream) */
T.ShaderChunk.dithering_fragment='gl_FragColor.rgb=min(gl_FragColor.rgb,vec3(32.));\n'+T.ShaderChunk.dithering_fragment;
T.ShaderChunk.fog_pars_vertex='#ifdef USE_FOG\nvarying float vFogD;\nvarying float vFogY;\nvarying vec3 vFogV;\n#endif';
T.ShaderChunk.fog_vertex='#ifdef USE_FOG\nvFogD=-mvPosition.z;\nvec4 fogWP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nfogWP=instanceMatrix*fogWP;\n#endif\nfogWP=modelMatrix*fogWP;\nvFogY=fogWP.y;\nvFogV=fogWP.xyz-cameraPosition;\n#endif';
T.ShaderChunk.fog_pars_fragment='#ifdef USE_FOG\nuniform vec3 fogColor;\nvarying float vFogD;\nvarying float vFogY;\nvarying vec3 vFogV;\n#ifdef FOG_EXP2\nuniform float fogDensity;\n#else\nuniform float fogNear;\nuniform float fogFar;\n#endif\n#endif';
T.ShaderChunk.fog_fragment='#ifdef USE_FOG\nfloat fogH=exp(-max(vFogY,0.0)*0.045);\n#ifdef FOG_EXP2\nfloat fogFactor=1.0-exp(-fogDensity*vFogD*(0.35+0.65*fogH));\n#else\nfloat fogFactor=smoothstep(fogNear,fogFar,vFogD);\n#endif\n/* aerial perspective: haze glows warm toward the sun and cools away from it */\nfloat fogS=max(dot(normalize(vFogV),vec3(-0.6033,0.4424,0.6636)),0.0);\nvec3 fogC=fogColor*mix(vec3(0.94,0.97,1.03),vec3(1.32,1.16,0.9),pow(fogS,5.0));\ngl_FragColor.rgb=mix(gl_FragColor.rgb,fogC,clamp(fogFactor,0.0,1.0));\n#endif';

/* ---------- renderer ---------- */
const canvas=$('c');
const renderer=new T.WebGLRenderer({canvas,antialias:false,powerPreference:'high-performance',stencil:false});
renderer.outputEncoding=T.LinearEncoding;renderer.toneMapping=T.NoToneMapping;
renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.autoClear=false;
const GL2=renderer.capabilities.isWebGL2;
const HDR=GL2&&!!renderer.extensions.get('EXT_color_buffer_float');
const QUAL={high:{pr:1.25,shadow:2048,grassR:40,ms:4},med:{pr:1,shadow:2048,grassR:32,ms:4},low:{pr:.75,shadow:1024,grassR:22,ms:0}};
let Q=QUAL.med;
let rt=null;
let bloomA=null,bloomB=null;
function makeRT(w,h){if(rt)rt.dispose();const o={type:HDR?T.HalfFloatType:T.UnsignedByteType,format:T.RGBAFormat,depthBuffer:true};
  if(GL2&&Q.ms){rt=new T.WebGLMultisampleRenderTarget(w,h,o);rt.samples=Q.ms;}else rt=new T.WebGLRenderTarget(w,h,o);
  if(bloomA){bloomA.dispose();bloomB.dispose();}const ob={type:HDR?T.HalfFloatType:T.UnsignedByteType,format:T.RGBAFormat,depthBuffer:false};
  const bw=Math.max(2,w>>2),bh=Math.max(2,h>>2);bloomA=new T.WebGLRenderTarget(bw,bh,ob);bloomB=new T.WebGLRenderTarget(bw,bh,ob);}

const scene=new T.Scene();
const FOGC=C(0x8e958a);
scene.fog=new T.FogExp2(0xffffff,0.0125);scene.fog.color.copy(FOGC);
const camera=new T.PerspectiveCamera(70,1,0.1,1400);camera.rotation.order='YXZ';
scene.add(camera);

/* ---------- sky ---------- */
const SUN=V3(-0.6,0.44,0.66).normalize();
const skyMat=new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
  uniforms:{uTop:{value:C(0x6d7c8c)},uHor:{value:FOGC.clone()},uSun:{value:SUN},uSunC:{value:C(0xffd8a8)},uT:{value:0},uCov:{value:0}},
  vertexShader:'varying vec3 vP;void main(){vP=position;vec4 p=projectionMatrix*modelViewMatrix*vec4(position,1.0);gl_Position=p.xyww;}',
  fragmentShader:`uniform vec3 uTop,uHor,uSun,uSunC;uniform float uT,uCov;varying vec3 vP;
  float hh(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
  float n2(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hh(i),hh(i+vec2(1,0)),f.x),mix(hh(i+vec2(0,1)),hh(i+1.),f.x),f.y);}
  float fb(vec2 p){float s=0.,a=.5;for(int i=0;i<6;i++){s+=a*n2(p);p=p*2.03+vec2(1.7,9.2);a*=.5;}return s;}
  void main(){vec3 d=normalize(vP);float y=max(d.y,0.);
    vec3 c=mix(uHor,uTop,pow(y,0.55));
    vec2 cp=d.xz/max(d.y+0.08,0.03)*1.3+vec2(uT*0.006,uT*0.002);
    float cl=fb(cp);float cov=smoothstep(0.32-uCov*.34,0.78-uCov*.3,cl);
    /* self-shadowing: density a step toward the sun darkens the cloud bases, thin edges catch the light */
    float cl2=fb(cp+normalize(uSun.xz)*0.22);float lit=clamp(0.55+(cl-cl2)*2.6,0.0,1.25);
    float s=max(dot(d,uSun),0.);
    vec3 cloudC=mix(uHor*1.08,uTop*0.78+vec3(0.02),smoothstep(0.4,0.95,cl));
    cloudC*=mix(0.72,1.18,lit);cloudC+=uSunC*pow(s,6.0)*(1.0-cov)*0.9*smoothstep(0.3,0.6,cl);
    /* high thin cirrus streaks */
    vec2 cp2=d.xz/max(d.y+0.15,0.05)*vec2(0.5,2.6)+vec2(uT*0.004,0.0);float ci=smoothstep(0.55,0.8,fb(cp2))*0.35*(1.0-cov);
    c=mix(c,uHor*1.15+uSunC*0.05,ci*smoothstep(0.05,0.3,y));
    c=mix(c,cloudC,cov*smoothstep(0.0,0.2,y)*0.88);
    c+=uSunC*(pow(s,900.)*6.0*(1.-cov*0.85)+pow(s,10.)*0.22+pow(s,3.0)*0.06);
    c=mix(uHor,c,smoothstep(-0.03,0.10,d.y));
    gl_FragColor=vec4(c,1.);}`});
const sky=new T.Mesh(new T.SphereGeometry(1000,32,16),skyMat);sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);

/* environment map from sky (gives metals and paint believable reflections) */
let ENV=null;
(function(){/* sky-gradient cube map, painted on canvases (robust on every GPU) */
  const top=new T.Color(0x8796a6),hor=new T.Color(0xa7ad9f),gnd=new T.Color(0x4a4a36);
  const face=(kind)=>{const c=document.createElement('canvas');c.width=c.height=64;const g=c.getContext('2d');
    if(kind==='py'){g.fillStyle='#'+top.getHexString();g.fillRect(0,0,64,64);}else if(kind==='ny'){g.fillStyle='#'+gnd.getHexString();g.fillRect(0,0,64,64);}
    else{const gr=g.createLinearGradient(0,0,0,64);gr.addColorStop(0,'#'+top.getHexString());gr.addColorStop(.5,'#'+hor.getHexString());gr.addColorStop(.56,'#'+gnd.getHexString());gr.addColorStop(1,'#'+gnd.getHexString());g.fillStyle=gr;g.fillRect(0,0,64,64);
      if(kind==='nx'||kind==='pz'){const s=g.createRadialGradient(kind==='nx'?44:20,24,0,kind==='nx'?44:20,24,30);s.addColorStop(0,'rgba(255,228,190,.8)');s.addColorStop(1,'rgba(255,228,190,0)');g.fillStyle=s;g.fillRect(0,0,64,64);}}
    return c;};
  const ct=new T.CubeTexture(['px','nx','py','ny','pz','nz'].map(face));ct.encoding=T.sRGBEncoding;ct.needsUpdate=true;ENV=ct;})();
scene.environment=ENV;
/* prefiltered radiance environment rendered from the sky shader itself (+ a dark ground), so reflections and
   ambient specular match the sky you actually see; falls back to the painted cube if PMREM fails */
function bakeEnv(){try{const pm=new T.PMREMGenerator(renderer);const es=new T.Scene();es.add(new T.Mesh(new T.SphereGeometry(500,32,16),skyMat));
  const gm=new T.Mesh(new T.CircleGeometry(480,32),new T.MeshBasicMaterial({color:new T.Color(0.06,0.055,0.035)}));gm.rotation.x=-Math.PI/2;gm.position.y=-3;es.add(gm);
  const crt=new T.WebGLCubeRenderTarget(128,{type:HDR?T.HalfFloatType:T.UnsignedByteType,format:T.RGBAFormat,generateMipmaps:false});
  const cc=new T.CubeCamera(.5,1200,crt);es.add(cc);const ac=renderer.autoClear;renderer.autoClear=true;renderer.setClearColor(0x000000,1);cc.update(renderer,es);renderer.autoClear=ac;
  const r=pm.fromCubemap(crt.texture);ENV=r.texture;scene.environment=ENV;if(typeof vmScene!=='undefined')vmScene.environment=ENV;pm.dispose();}catch(e){console.warn('env bake',e);}}

/* ---------- lights ---------- */
const sun=new T.DirectionalLight(C(0xffe2c0),3.3);sun.castShadow=true;
sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.near=1;sun.shadow.camera.far=260;
Object.assign(sun.shadow.camera,{left:-48,right:48,top:48,bottom:-48});sun.shadow.bias=-0.0004;sun.shadow.normalBias=0.035;
scene.add(sun,sun.target);
const hemi=new T.HemisphereLight(C(0xb4c2d0),C(0x5a5638),0.8);scene.add(hemi);

/* ---------- post-processing ---------- */
const postMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,
  uniforms:{tD:{value:null},tB:{value:null},uDrops:{value:0},uBloom:{value:.9},uSharp:{value:.35},uSunUV:{value:new T.Vector2(.5,.5)},uRays:{value:0},uT:{value:0},uExp:{value:1.12},uSan:{value:0},uDmg:{value:0},uRad:{value:0},uHP:{value:1},uDrunk:{value:0},uRes:{value:new T.Vector2(1,1)},uFade:{value:0},uBlur:{value:0},uDbl:{value:0},uDesat:{value:0},uFlash:{value:0},uAA:{value:0},uWar:{value:0}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD,tB;uniform float uT,uExp,uSan,uDmg,uRad,uHP,uDrunk,uFade,uBloom,uSharp,uRays,uDrops,uBlur,uDbl,uDesat,uFlash,uAA,uWar;
  float lu(vec3 v){v=v/(1.0+v);return dot(v,vec3(.299,.587,.114));}uniform vec2 uRes,uSunUV;varying vec2 vUv;
  vec3 aces(vec3 x){return clamp((x*(2.51*x+0.03))/(x*(2.43*x+0.59)+0.14),0.,1.);}
  float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
  bool ok3(vec3 v){return v.r<6e4&&v.g<6e4&&v.b<6e4&&v.r>=0.&&v.g>=0.&&v.b>=0.;}
  vec3 sn(vec3 v){return ok3(v)?v:vec3(-1.);}
  void main(){vec2 uv=vUv;
    float wob=uSan*0.8+uDrunk;
    uv+=vec2(sin(uv.y*9.+uT*1.3),cos(uv.x*8.+uT*1.1))*0.0035*wob;
    /* rain on the lens: drops appear, sit, then run down; each refracts the image behind it */
    float dropM=0.;if(uDrops>0.0){for(int k=0;k<2;k++){float fk=float(k);vec2 g=uv*vec2(10.+fk*7.,6.+fk*4.)+fk*3.7;vec2 c=floor(g),f=fract(g);float hh=h(c+fk*9.1);
        float life=fract(uT*(.05+.07*fract(hh*5.))+hh);vec2 o=vec2(.25+.5*fract(hh*13.),.7-.1*fract(hh*7.))-vec2(0.,max(life-.6,0.)*1.6);
        vec2 d=(f-o)*vec2(1.,1.3);float rad=.08+.12*fract(hh*3.);float on=step(fract(hh*17.),uDrops*.55);float m=smoothstep(rad,rad*.55,length(d))*on*smoothstep(0.,.08,life)*(1.-smoothstep(.9,1.,life));
        uv-=d*m*.09;dropM=max(dropM,m);}}
    vec2 dir=uv-0.5;float ca=0.0003+0.006*uSan+0.004*uDmg;
    vec3 c;c.r=texture2D(tD,uv-dir*ca).r;c.g=texture2D(tD,uv).g;c.b=texture2D(tD,uv+dir*ca).b;
    /* a pixel the renderer could not shade (NaN, or a half-float overflow to inf) takes the colour of its good neighbours;
       painting it black is what made the black dots in the grass */
    vec2 px1=1.0/uRes;vec3 nA=sn(texture2D(tD,uv+vec2(px1.x,0.)).rgb),nB=sn(texture2D(tD,uv-vec2(px1.x,0.)).rgb),nC=sn(texture2D(tD,uv+vec2(0.,px1.y)).rgb),nD=sn(texture2D(tD,uv-vec2(0.,px1.y)).rgb);
    if(!ok3(c)){vec4 acc=vec4(0.);if(ok3(nA))acc+=vec4(nA,1.);if(ok3(nB))acc+=vec4(nB,1.);if(ok3(nC))acc+=vec4(nC,1.);if(ok3(nD))acc+=vec4(nD,1.);c=acc.w>0.?acc.rgb/acc.w:vec3(0.);}
    if(!ok3(nA))nA=c;if(!ok3(nB))nB=c;if(!ok3(nC))nC=c;if(!ok3(nD))nD=c;
    /* edge anti-aliasing (FXAA): when the scene is drawn without multisampling, or below the screen's resolution, the
       stair-steps along every silhouette - roof edges, fence rails, wires, grass - are found from the luma of the pixel
       and its eight neighbours and blended along the edge's own direction */
    float aaEdge=0.;
    if(uAA>0.0){vec2 p=px1;vec3 cNW=sn(texture2D(tD,uv+vec2(-p.x,p.y)).rgb),cNE=sn(texture2D(tD,uv+p).rgb),cSW=sn(texture2D(tD,uv-p).rgb),cSE=sn(texture2D(tD,uv+vec2(p.x,-p.y)).rgb);
      if(!ok3(cNW))cNW=c;if(!ok3(cNE))cNE=c;if(!ok3(cSW))cSW=c;if(!ok3(cSE))cSE=c;
      float lM=lu(c),lN=lu(nC),lS=lu(nD),lE=lu(nA),lW=lu(nB),lNW=lu(cNW),lNE=lu(cNE),lSW=lu(cSW),lSE=lu(cSE);
      float mn=min(lM,min(min(min(lN,lS),min(lE,lW)),min(min(lNW,lNE),min(lSW,lSE)))),mx=max(lM,max(max(max(lN,lS),max(lE,lW)),max(max(lNW,lNE),max(lSW,lSE))));
      if(mx-mn>max(.035,mx*.12)){vec2 d=vec2(-((lNW+lNE)-(lSW+lSE)),(lNW+lSW)-(lNE+lSE));
        float red=max((lNW+lNE+lSW+lSE)*.03125,1./128.);float rc=1./(min(abs(d.x),abs(d.y))+red);d=clamp(d*rc,-8.,8.)*p;
        vec3 rA=.5*(sn(texture2D(tD,uv+d*(1./3.-.5)).rgb)+sn(texture2D(tD,uv+d*(2./3.-.5)).rgb));
        vec3 rB=rA*.5+.25*(sn(texture2D(tD,uv-d*.5).rgb)+sn(texture2D(tD,uv+d*.5).rgb));
        if(ok3(rA)){float lB=lu(rB);c=(!ok3(rB)||lB<mn||lB>mx)?rA:rB;aaEdge=1.;}}}
    /* concussion: soft blur (two rings of taps) and a drifting double image */
    if(uBlur>0.001||uDbl>0.001){vec2 px=1.0/uRes;vec3 acc=c;float r=uBlur*9.0;
      for(int k=0;k<12;k++){float a=float(k)*0.5236+0.26*float(k/6);vec2 o=vec2(cos(a),sin(a))*px*r*(k<6?1.0:2.1);acc+=texture2D(tD,uv+o).rgb;}
      c=mix(c,acc/13.0,clamp(uBlur*1.4,0.,1.));
      if(uDbl>0.001){vec2 dv=vec2(0.014+0.007*sin(uT*0.7),0.005*sin(uT*0.93))*uDbl;c=mix(c,texture2D(tD,uv+dv).rgb,0.42*clamp(uDbl,0.,1.));}
      if(!ok3(c))c=(nA+nB+nC+nD)*.25;}
    /* firefly suppression: a pixel far brighter than all four neighbours is a specular alias, clamp it to them */
    {vec3 mx=max(max(nA,nB),max(nC,nD));c=min(c,mx*1.35+0.03);
     /* and a speck two pixels wide (anti-aliasing or the resolution scale smear one over two) against its surroundings */
     vec2 p2=2.0/uRes;vec3 m2=max(max(sn(texture2D(tD,uv+vec2(p2.x,0.)).rgb),sn(texture2D(tD,uv-vec2(p2.x,0.)).rgb)),max(sn(texture2D(tD,uv+vec2(0.,p2.y)).rgb),sn(texture2D(tD,uv-vec2(0.,p2.y)).rgb)));
     if(ok3(m2))c=min(c,m2*2.2+0.06);}
    /* contrast-adaptive sharpen: recovers texture detail lost to MSAA / dynamic resolution */
    if(uSharp>0.0&&aaEdge<.5){vec3 nb=nA+nB+nC+nD;
      vec3 c0=c;vec3 d4=c*4.0-nb;float lc=dot(c,vec3(.3,.59,.11));c+=d4*uSharp*0.25/(1.0+lc*1.5);c=clamp(c,min(c0,nb*.25)*.9,max(c0,nb*.25)*1.1);}
    /* bloom and sun shafts from the quarter-res bright pass */
    vec3 bl=texture2D(tB,uv).rgb;c+=bl*uBloom;
    if(uRays>0.0){vec2 dv=(uSunUV-uv)/14.0;vec2 sp=uv;float wsum=0.;vec3 ry=vec3(0.);for(int i=0;i<14;i++){sp+=dv;float w=1.0-float(i)/14.0;ry+=texture2D(tB,sp).rgb*w;wsum+=w;}
      c+=ry/wsum*uRays*vec3(1.0,0.9,0.72);}
    c=aces(c*uExp*0.62);
    c=pow(c,vec3(1.0/2.2));
    float l=dot(c,vec3(.2126,.7152,.0722));
    c=mix(vec3(l),c,0.78-0.45*(1.0-uHP));
    /* Zone grade: olive-brown midtones, cold green-grey shadows, a little more bite */
    c=c*vec3(1.01,1.0,0.91)+vec3(-0.004,0.008,0.012)*(1.0-l)*(1.0-l);
    /* the war zone's grade: colour drained toward a cold grey-green, the shadows lifted a little and cooled, the highlights
       held down - an overcast, oppressive flatness */
    if(uWar>0.0){float lw=dot(c,vec3(.2126,.7152,.0722));vec3 cw=mix(vec3(lw),c,.62)*vec3(.97,1.0,1.02);cw=cw*.93+vec3(.012,.016,.02)*(1.0-lw);cw=mix(cw,vec3(lw*.96+.02),.08*smoothstep(.55,1.0,lw));c=mix(c,cw,uWar);}
    c=mix(c,c*vec3(1.04,1.0,0.86),smoothstep(0.35,0.9,l)*0.5);
    c=(c-0.5)*1.14+0.5;
    float v=(1.-smoothstep(0.30,0.98,length(dir*vec2(1.15,1.0))));
    c*=mix(0.58,1.0,v);
    c=mix(c,vec3(0.42,0.03,0.02),uDmg*(1.0-v)*0.9);
    c=mix(c,c*vec3(0.55,0.5,0.72),uSan*(1.0-v*0.6));
    float g=h(uv*uRes+fract(uT*7.13)*91.7)-0.5;c+=g*(0.028+0.10*uRad);
    float sp=step(1.0-0.002*uRad,h(floor(uv*uRes/2.0)+floor(uT*24.0)));c+=sp*0.5;
    {float l2=dot(c,vec3(.2126,.7152,.0722));c=mix(c,vec3(l2)*vec3(1.02,1.0,.97),uDesat);}
    c=mix(c,vec3(1.0,.97,.9),uFlash);
    c*=1.0-uFade;
    gl_FragColor=vec4(clamp(c,0.,1.),1.);}`});
const postScene=new T.Scene();const postCam=new T.OrthographicCamera(-1,1,1,-1,0,1);
/* bloom: soft-knee bright pass (13-tap downsample), then two separable gaussian passes at quarter resolution */
const brightMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tD:{value:null},uPx:{value:new T.Vector2()},uThr:{value:HDR?3.2:.92}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform vec2 uPx;uniform float uThr;varying vec2 vUv;
    /* sanitise (NaN / inf from degenerate normals would otherwise bloom into glowing squares) and Karis-weight each tap
       so single over-bright pixels (specular aliasing on wet ground) cannot dominate the bloom */
    vec3 tp(vec2 o){vec3 c=texture2D(tD,vUv+o*uPx).rgb;if(!(c.r<6e4&&c.g<6e4&&c.b<6e4&&c.r>=0.&&c.g>=0.&&c.b>=0.))c=vec3(0.);c=min(c,vec3(16.));return c/(1.+max(c.r,max(c.g,c.b))*.35);}
    void main(){vec3 c=tp(vec2(0))*.25+(tp(vec2(-1,-1))+tp(vec2(1,-1))+tp(vec2(-1,1))+tp(vec2(1,1)))*.125+(tp(vec2(-2,0))+tp(vec2(2,0))+tp(vec2(0,-2))+tp(vec2(0,2)))*.0625;
      c=c/max(1.-max(c.r,max(c.g,c.b))*.35,.05);float l=max(c.r,max(c.g,c.b));float kn=uThr*.4;float k=clamp(l-uThr+kn,0.,2.*kn);k=k*k/(4.*kn+1e-4);float w=max(k,l-uThr)/max(l,1e-4);gl_FragColor=vec4(min(c*w,vec3(12.)),1.);}`});
const blurMat=new T.ShaderMaterial({depthTest:false,depthWrite:false,uniforms:{tD:{value:null},uDir:{value:new T.Vector2()}},
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',
  fragmentShader:`uniform sampler2D tD;uniform vec2 uDir;varying vec2 vUv;
    void main(){vec3 c=texture2D(tD,vUv).rgb*.2270;c+=(texture2D(tD,vUv+uDir*1.3846).rgb+texture2D(tD,vUv-uDir*1.3846).rgb)*.3162;
      c+=(texture2D(tD,vUv+uDir*3.2308).rgb+texture2D(tD,vUv-uDir*3.2308).rgb)*.0703;gl_FragColor=vec4(c,1.);}`});
const fxScene=new T.Scene();const fxQuad=new T.Mesh(new T.PlaneGeometry(2,2),brightMat);fxQuad.frustumCulled=false;fxScene.add(fxQuad);
function runBloom(src){fxQuad.material=brightMat;brightMat.uniforms.tD.value=src;brightMat.uniforms.uPx.value.set(1/(bloomA.width*4),1/(bloomA.height*4));
  renderer.setRenderTarget(bloomA);renderer.render(fxScene,postCam);fxQuad.material=blurMat;
  for(const s of [1,2.2]){blurMat.uniforms.tD.value=bloomA.texture;blurMat.uniforms.uDir.value.set(s/bloomA.width,0);renderer.setRenderTarget(bloomB);renderer.render(fxScene,postCam);
    blurMat.uniforms.tD.value=bloomB.texture;blurMat.uniforms.uDir.value.set(0,s/bloomA.height);renderer.setRenderTarget(bloomA);renderer.render(fxScene,postCam);}
  return bloomA.texture;}
{const q=new T.Mesh(new T.PlaneGeometry(2,2),postMat);q.frustumCulled=false;postScene.add(q);}

/* ---------- viewmodel scene (drawn after world, with cleared depth so the gun never clips walls) ---------- */
const vmScene=new T.Scene();bakeEnv();vmScene.environment=ENV;
const vmCam=new T.PerspectiveCamera(52,1,0.01,10);vmCam.rotation.order='YXZ';vmScene.add(vmCam);
const vmSun=new T.DirectionalLight(C(0xffe0bc),2.4);vmScene.add(vmSun,vmSun.target);
const vmHemi=new T.HemisphereLight(C(0xaebccb),C(0x4d4b33),0.6);vmScene.add(vmHemi);
const muzzleLight=new T.PointLight(C(0xffb060),0,6,2);scene.add(muzzleLight);
const vmMuzzle=new T.PointLight(C(0xffb060),0,2,2);vmScene.add(vmMuzzle);

/* ---------- geometry helpers ---------- */
const solids=[],shootables=[],interact=[],WIND=[];
function mesh(geo,mat,x=0,y=0,z=0,parent,cast=true){const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.castShadow=cast;m.receiveShadow=true;if(parent)parent.add(m);return m;}
function rboxShape(w,h,r){const s=new T.Shape();const x=-w/2,y=-h/2;r=Math.min(r,w/2-1e-4,h/2-1e-4);
  s.moveTo(x+r,y);s.lineTo(x+w-r,y);s.quadraticCurveTo(x+w,y,x+w,y+r);s.lineTo(x+w,y+h-r);s.quadraticCurveTo(x+w,y+h,x+w-r,y+h);s.lineTo(x+r,y+h);s.quadraticCurveTo(x,y+h,x,y+h-r);s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);return s;}
/* rounded box: soft edges everywhere, UVs remapped to 0..1 per face direction */
function rbox(w,h,d,r=0.02){r=Math.max(1e-4,Math.min(r,w/2.2,h/2.2,d/2.2));
  const g=new T.ExtrudeGeometry(rboxShape(w-2*r,h-2*r,r*.6),{depth:Math.max(d-2*r,1e-4),bevelEnabled:true,bevelThickness:r,bevelSize:r,bevelSegments:2,curveSegments:3});
  g.translate(0,0,-(d-2*r)/2);boxUV(g);return g;}
function boxUV(g){g.computeBoundingBox();const b=g.boundingBox,s=V3();b.getSize(s);const p=g.attributes.position,n=g.attributes.normal,uv=g.attributes.uv;
  /* each face projected along its own axis, the right way round from outside (no mirrored lettering on any side); a
     triangle takes one projection for all three corners, so the bevels never smear the whole texture into a sliver */
  const tri=!g.index&&p.count%3===0;
  for(let i=0;i<p.count;i++){const x=(p.getX(i)-b.min.x)/(s.x||1),y=(p.getY(i)-b.min.y)/(s.y||1),z=(p.getZ(i)-b.min.z)/(s.z||1);
    let nx=n.getX(i),ny=n.getY(i),nz=n.getZ(i);if(tri){const f=i-i%3;nx=n.getX(f)+n.getX(f+1)+n.getX(f+2);ny=n.getY(f)+n.getY(f+1)+n.getY(f+2);nz=n.getZ(f)+n.getZ(f+1)+n.getZ(f+2);}
    const ax=Math.abs(nx),ay=Math.abs(ny),az=Math.abs(nz);
    if(az>=ax&&az>=ay)uv.setXY(i,nz>0?x:1-x,y);else if(ax>=ay)uv.setXY(i,nx>0?1-z:z,y);else uv.setXY(i,x,ny>0?1-z:z);}uv.needsUpdate=true;}
/* planar UV in metres (for tiling textures) */
function worldUV(g,scale=1){const p=g.attributes.position,n=g.attributes.normal;const uv=new Float32Array(p.count*2);
  for(let i=0;i<p.count;i++){const ax=Math.abs(n.getX(i)),ay=Math.abs(n.getY(i)),az=Math.abs(n.getZ(i));let u,v;
    if(ay>=ax&&ay>=az){u=p.getX(i);v=p.getZ(i);}else if(ax>=az){u=p.getZ(i);v=p.getY(i);}else{u=p.getX(i);v=p.getY(i);}uv[i*2]=u*scale;uv[i*2+1]=v*scale;}
  g.setAttribute('uv',new T.BufferAttribute(uv,2));return g;}
/* capsule pointing down -y from origin: top radius r1, bottom radius r2 */
function capsule(r1,r2,len,rs=14,hs=5){const pts=[];
  for(let i=0;i<=hs;i++){const a=i/hs*Math.PI/2;pts.push(new T.Vector2(Math.max(1e-4,Math.sin(a)*r2),-len-Math.cos(a)*r2));}
  for(let i=1;i<=hs;i++){const a=Math.PI/2+i/hs*Math.PI/2;pts.push(new T.Vector2(Math.max(1e-4,Math.sin(a)*r1),-Math.cos(a)*r1));}
  return new T.LatheGeometry(pts,rs);}
function lathe(pts,seg=24){return new T.LatheGeometry(pts.map(p=>new T.Vector2(Math.max(1e-4,p[0]),p[1])),seg);}
function xf(g,x=0,y=0,z=0,rx=0,ry=0,rz=0,sx=1,sy=1,sz=1){const m=new T.Matrix4().compose(V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz)),V3(sx,sy,sz));g.applyMatrix4(m);return g;}
/* merge geometries (non-indexed) with optional material groups (g.userData.mi) and per-piece tint (g.userData.tint) */
function merge(list){const items=list.map(g=>{const mi=g.userData.mi||0,tint=g.userData.tint;const n=g.index?g.toNonIndexed():g;return{n,mi,tint};}).sort((a,b)=>a.mi-b.mi);
  let tot=0;items.forEach(i=>tot+=i.n.attributes.position.count);
  const P=new Float32Array(tot*3),N=new Float32Array(tot*3),U=new Float32Array(tot*2),Cc=new Float32Array(tot*3);
  const out=new T.BufferGeometry();let o=0,gs=-1,gm=-1;
  items.forEach(it=>{const g=it.n,p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,c=g.attributes.color,cnt=p.count;
    if(it.mi!==gm){if(gm>=0)out.addGroup(gs,o-gs,gm);gs=o;gm=it.mi;}
    P.set(p.array.subarray(0,cnt*3),o*3);if(n)N.set(n.array.subarray(0,cnt*3),o*3);if(u)U.set(u.array.subarray(0,cnt*2),o*2);
    const tc=it.tint?(it.tint.isColor?it.tint:new T.Color(it.tint)):null;
    for(let i=0;i<cnt;i++){if(c){Cc[(o+i)*3]=c.getX(i);Cc[(o+i)*3+1]=c.getY(i);Cc[(o+i)*3+2]=c.getZ(i);}else if(tc){Cc[(o+i)*3]=tc.r;Cc[(o+i)*3+1]=tc.g;Cc[(o+i)*3+2]=tc.b;}else{Cc[(o+i)*3]=Cc[(o+i)*3+1]=Cc[(o+i)*3+2]=1;}}
    o+=cnt;});
  if(gm>=0)out.addGroup(gs,o-gs,gm);
  out.setAttribute('position',new T.BufferAttribute(P,3));out.setAttribute('normal',new T.BufferAttribute(N,3));out.setAttribute('uv',new T.BufferAttribute(U,2));out.setAttribute('color',new T.BufferAttribute(Cc,3));
  out.computeBoundingSphere();return out;}
const tag=(g,mi,tint)=>{g.userData.mi=mi;if(tint!==undefined)g.userData.tint=tint;return g;};
/* a fence span you cannot walk through: a row of small posts along it */
function wireSolids(ax,az,bx,bz,r=.1){const L=Math.hypot(bx-ax,bz-az),n=Math.max(1,Math.ceil(L/.3));for(let i=1;i<n;i++){const u=i/n;solids.push({cx:ax+(bx-ax)*u,cz:az+(bz-az)*u,r});}}
function solidAABB(x1,x2,z1,z2){const s={x1,x2,z1,z2};solids.push(s);return s;}
function solidFrom(obj){obj.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(obj);return solidAABB(b.min.x,b.max.x,b.min.z,b.max.z);}
