/* ---------- particle effects: soft-sprite point particles (smoke, dust, sparks, flames, embers), muzzle flashes,
   ejected cases, bullet-hole decals.  CPU-simulated, one draw call per system. ---------- */
function spriteTex(kind){return tex(128,128,(g,w,h)=>{const im=g.createImageData(w,h),d=im.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w-.5,v=y/h-.5,r=Math.hypot(u,v)*2,i=(y*w+x)*4;let a=0,c=[255,255,255];
    if(kind==='soft')a=Math.pow(Math.max(0,1-r),1.6);
    else if(kind==='smoke'){const n=fbmT(x/w,y/h,4,4);a=Math.pow(Math.max(0,1-r),1.3)*sstep(.25,.75,n+.35*(1-r));}
    else if(kind==='flame'){const n=fbmT(x/w,y/h*.6,3,4);const tall=Math.hypot(u*1.7,(v+.12)*1.05)*2;a=Math.pow(Math.max(0,1-tall),.9)*sstep(.15,.55,n+(1-tall)*.6);}
    else if(kind==='spark'){a=Math.pow(Math.max(0,1-r),4);}
    else if(kind==='star'){const ang=Math.atan2(v,u);const rays=Math.pow(Math.abs(Math.cos(ang*3)),8)*.9+Math.pow(Math.abs(Math.cos(ang*2+.4)),14)*.6;a=Math.pow(Math.max(0,1-r/(.35+rays*.65)),1.8);}
    d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=clamp(a,0,1)*255;}g.putImageData(im,0,0);},{clamp:true});}
M.caseBrass=std({color:C(0xb08a3a),metalness:.9,roughness:.32});M.caseSteel=std({color:C(0x67603f),metalness:.75,roughness:.42});
const PTEX={soft:spriteTex('soft'),smoke:spriteTex('smoke'),flame:spriteTex('flame'),spark:spriteTex('spark'),star:spriteTex('star')};
class PSys{constructor(max,texture,additive,o={}){this.max=max;this.n=0;this.o=o;
    const g=new T.BufferGeometry();this.pos=new Float32Array(max*3);this.col=new Float32Array(max*4);this.sz=new Float32Array(max);this.rot=new Float32Array(max);
    g.setAttribute('position',new T.BufferAttribute(this.pos,3));g.setAttribute('pcol',new T.BufferAttribute(this.col,4));g.setAttribute('psize',new T.BufferAttribute(this.sz,1));g.setAttribute('prot',new T.BufferAttribute(this.rot,1));
    this.P=[];const m=new T.ShaderMaterial({transparent:true,depthWrite:false,blending:additive?T.AdditiveBlending:T.NormalBlending,fog:true,
      uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{map:{value:texture},uScale:{value:600}}]),
      vertexShader:`attribute vec4 pcol;attribute float psize;attribute float prot;varying vec4 vC;varying float vR;varying float vN;uniform float uScale;
        #include <fog_pars_vertex>
        void main(){vC=pcol;vR=prot;vec3 transformed=position;vec4 mvPosition=modelViewMatrix*vec4(position,1.0);gl_Position=projectionMatrix*mvPosition;vN=smoothstep(.35,1.6,-mvPosition.z);/* (a particle in the eye's face is faded out anyway: it is not drawn at all, and none is drawn bigger than a third of the screen - full-screen soft sprites stacked up were what made smoke at the face so slow) */gl_PointSize=vN<.02?0.:min(psize*uScale/max(-mvPosition.z,.05),uScale*.55);
        #include <fog_vertex>
        }`,
      fragmentShader:`uniform sampler2D map;varying vec4 vC;varying float vR;varying float vN;
        #include <fog_pars_fragment>
        void main(){vec2 p=gl_PointCoord-.5;float c=cos(vR),s=sin(vR);p=vec2(c*p.x-s*p.y,s*p.x+c*p.y)+.5;vec4 t=texture2D(map,p);float a=t.a*vC.a*vN;if(a<.003)discard;gl_FragColor=vec4(vC.rgb*t.rgb,a);
        #include <fog_fragment>
        }`});
    this.mat=m;this.pts=new T.Points(g,m);this.pts.frustumCulled=false;this.pts.renderOrder=o.order||2;(o.scene||scene).add(this.pts);}
  spawn(p,v,life,s0,s1,c0,c1,o={}){if(this.P.length>=this.max)this.P.shift();this.P.push({p:p.clone(),v:v.clone(),t:0,life,s0,s1,c0,c1,g:o.g||0,drag:o.drag||0,rot:R()*6.28,spin:o.spin||0,up:o.up||0,fi:o.fi===undefined?.08:o.fi});}
  update(dt){const P=this.P;for(let i=P.length-1;i>=0;i--){const q=P[i];q.t+=dt;if(q.t>=q.life){P.splice(i,1);continue;}
      q.v.y+=(q.up-q.g)*dt;q.v.multiplyScalar(Math.max(0,1-q.drag*dt));q.p.addScaledVector(q.v,dt);q.rot+=q.spin*dt;
      if(q.floor!==undefined&&q.p.y<q.floor){q.p.y=q.floor;q.v.y*=-.3;q.v.x*=.5;q.v.z*=.5;}}
    const n=Math.min(P.length,this.max);
    for(let i=0;i<n;i++){const q=P[i],k=q.t/q.life;this.pos[i*3]=q.p.x;this.pos[i*3+1]=q.p.y;this.pos[i*3+2]=q.p.z;
      const c=q.c0,d=q.c1;this.col[i*4]=lerp(c[0],d[0],k);this.col[i*4+1]=lerp(c[1],d[1],k);this.col[i*4+2]=lerp(c[2],d[2],k);this.col[i*4+3]=lerp(c[3],d[3],k)*(q.fi>0?sstep(0,q.fi,k):1);
      this.sz[i]=lerp(q.s0,q.s1,k);this.rot[i]=q.rot;}
    for(let i=n;i<this.max;i++){this.sz[i]=0;this.col[i*4+3]=0;}
    const g=this.pts.geometry;g.attributes.position.needsUpdate=g.attributes.pcol.needsUpdate=g.attributes.psize.needsUpdate=g.attributes.prot.needsUpdate=true;}}
/* (smoke columns stand out of haze that hides the trees under them: k scales the distance the fog sees) */
function thinFog(ps,k){const m=ps.mat;m.fragmentShader=m.fragmentShader.replace('#include <fog_fragment>',T.ShaderChunk.fog_fragment.replace('fogDensity*vFogD','fogDensity*vFogD*'+k.toFixed(3)));m.needsUpdate=true;return ps;}
const FX={smoke:new PSys(620,PTEX.smoke,false,{order:3}),dust:new PSys(380,PTEX.smoke,false),spark:new PSys(420,PTEX.spark,true,{order:4}),
  flame:new PSys(340,PTEX.flame,true,{order:5}),ember:new PSys(160,PTEX.spark,true,{order:5}),glow:new PSys(64,PTEX.soft,true,{order:4})};
function fxUpdate(dt){for(const k in FX)FX[k].update(dt);}
/* resize hook: point sizes are in world metres, scaled by the projection */
function fxScale(h,fov){const s=h/(2*Math.tan(fov*Math.PI/360));for(const k in FX)FX[k].mat.uniforms.uScale.value=s;}
const _v=new T.Vector3(),_w=new T.Vector3();
function fxImpact(p,n,surf){
  const dustC=surf==='wood'?[.42,.34,.24,.75]:surf==='metal'?[.5,.5,.48,.4]:[.5,.45,.36,.8],endC=[dustC[0]*1.1,dustC[1]*1.1,dustC[2]*1.1,0];
  for(let i=0;i<6;i++){_v.set(n.x+rnd(-.5,.5),n.y+rnd(-.2,.7),n.z+rnd(-.5,.5)).multiplyScalar(rnd(.3,1.2));FX.dust.spawn(p,_v,rnd(.6,1.4),rnd(.05,.09),rnd(.25,.5),dustC,endC,{g:.6,drag:2.4,spin:rnd(-1,1)});}
  const ns=surf==='metal'?14:surf==='wood'?3:5;
  for(let i=0;i<ns;i++){_v.set(n.x+rnd(-.7,.7),n.y+rnd(-.3,.9),n.z+rnd(-.7,.7)).normalize().multiplyScalar(rnd(2,6));
    FX.spark.spawn(p,_v,rnd(.12,.35),.018,.006,surf==='wood'?[.6,.45,.3,.9]:[1,.75,.35,1],surf==='wood'?[.4,.3,.2,0]:[1,.35,.1,0],{g:9.8,drag:1});}}
function fxMuzzle(p,dir,big){for(let i=0;i<(big?5:3);i++){_v.copy(dir).multiplyScalar(rnd(.4,1.6)).add(_w.set(rnd(-.15,.15),rnd(.05,.3),rnd(-.15,.15)));
    FX.smoke.spawn(p,_v,rnd(.9,1.8),rnd(.04,.07),rnd(.35,.6),[.75,.74,.7,.35],[.8,.8,.78,0],{drag:1.8,up:.25,spin:rnd(-.8,.8)});}
  FX.glow.spawn(p,_w.set(0,0,0),.06,big?.5:.35,big?.7:.5,[1,.75,.4,.9],[1,.5,.2,0]);}
/* barrel-stove fire: flames, embers and smoke from a point, with a flickering light */
function fxFire(p,dt,strength=1){const s=strength;const N=r=>{let n=Math.floor(r*dt+R());while(n-->0)return true;return false;};for(let k=0;k<Math.floor(dt*40*s+R());k++)FX.flame.spawn(_w.set(p.x+rnd(-.12,.12),p.y+rnd(-.02,.04),p.z+rnd(-.12,.12)),_v.set(rnd(-.08,.08),rnd(.5,.9),rnd(-.08,.08)),rnd(.4,.7),rnd(.3,.42)*s,rnd(.06,.1),[1,.72,.32,1],[1,.22,.04,0],{drag:.6,spin:rnd(-1.5,1.5)});
  if(N(6*s))FX.ember.spawn(_w.set(p.x+rnd(-.1,.1),p.y+.05,p.z+rnd(-.1,.1)),_v.set(rnd(-.3,.3),rnd(1,2.2),rnd(-.3,.3)),rnd(1,2.2),.012,.004,[1,.6,.2,1],[1,.25,.05,0],{drag:.4,up:.2});
  if(N(7*s))FX.smoke.spawn(_w.set(p.x+rnd(-.1,.1),p.y+.45,p.z+rnd(-.1,.1)),_v.set(rnd(-.1,.1)+.15,rnd(.4,.7),rnd(-.1,.1)),rnd(2.5,4.5),rnd(.2,.3),rnd(.9,1.5),[.22,.21,.2,.32],[.45,.45,.44,0],{drag:.3,spin:rnd(-.4,.4)});}
/* spent cases for the viewmodel: small brass/steel cylinders thrown right and up */
const CASES=[];
function ejectCase(gun,id,vmRoot){const geo=G('case'+id,()=>xf(new T.CylinderGeometry(id==='ak'?.0055:.0045,id==='ak'?.0062:.0048,id==='ak'?.039:.018,24),0,0,0,Math.PI/2,0,0));
  const m=new T.Mesh(geo,id==='ak'?M.caseSteel:M.caseBrass);const p=gun.localToWorld(id==='ak'?V3(.012,.02,-.06):V3(.01,.03,-.04));vmRoot.parent.worldToLocal(p);m.position.copy(p);vmRoot.parent.add(m);
  CASES.push({m,v:V3(rnd(.9,1.4),rnd(.8,1.3),rnd(.1,.4)),s:V3(rnd(-20,20),rnd(-20,20),rnd(-20,20)),t:0});if(CASES.length>12){const c=CASES.shift();c.m.parent.remove(c.m);}}
function casesUpdate(dt){for(let i=CASES.length-1;i>=0;i--){const c=CASES[i];c.t+=dt;c.v.y-=4.5*dt;c.m.position.addScaledVector(c.v,dt);c.m.rotation.x+=c.s.x*dt;c.m.rotation.y+=c.s.y*dt;
    if(c.t>.9){c.m.parent.remove(c.m);CASES.splice(i,1);}}}
/* bullet hole decal: dark core, torn rim, pale chipped halo */
M.decal.map=tex(128,128,(g,w,h)=>{const im=g.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w-.5,v=y/h-.5,r=Math.hypot(u,v)*2,a=Math.atan2(v,u),i=(y*w+x)*4;
  const rim=.3+Math.sin(a*7)*.04+Math.sin(a*13)*.03,nz=fbmT(x/w,y/h,8,3);let c=20,al=0;if(r<rim*.7){c=6;al=1;}else if(r<rim){c=18+nz*20;al=1;}else if(r<rim+.12){c=60+nz*40;al=.85;}
  else if(r<.95){c=170+nz*30;al=(1-r)*.42*sstep(.95,.45,r)*(.45+.55*nz)*(.7+.3*Math.sin(a*9));}
  d[i]=d[i+1]=d[i+2]=c;d[i+3]=clamp(al,0,1)*255;}g.putImageData(im,0,0);},{clamp:true});M.decal.color.set(0xffffff);M.decal.opacity=1;M.decal.needsUpdate=true;
/* (a hole is lit like the wall it is in - not a pale ring glowing in the dusk - and its chipped halo is what that surface
   is made of: brick dust, raw splinters, bare steel, plaster) */
const DECM={};function decalMat(k){return DECM[k]||(DECM[k]=std({map:M.decal.map,color:C({brick:0xffa082,wood:0xffdcaa,metal:0xd8dce4,plaster:0xf2efe8,dirt:0xb8b0a4}[k]||0xb8b0a4),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4,roughness:.95,metalness:k==='metal'?.4:0,envMapIntensity:.3}));}
M.flash.map=PTEX.star;M.flash.needsUpdate=true;
