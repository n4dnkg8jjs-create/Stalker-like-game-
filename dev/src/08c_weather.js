/* ---------- dynamic weather: clear -> clouding over -> rain -> clearing, with wet surfaces everywhere ----------
   Every standard / physical material gets a wetness term (darker albedo, glossy roughness, puddles with rain ripples on
   flat ground) driven by global uniforms; rain streaks and ground splashes follow the camera; drops run down the lens;
   sky, sun, fog and ambient darken with the cloud cover; occasional lightning and thunder in heavy rain.
   The intro cutscene always stays dry (weather starts after it). */
const WU={wet:{value:0},rain:{value:0},time:{value:0},box:{value:new T.Vector4(1e9,1e9,-1e9,-1e9)},boxY:{value:-1e9}};
T.ShaderChunk.lights_physical_pars_fragment=`uniform float wetG;uniform float rainG;uniform float timeG;uniform vec4 dryBox;uniform float dryBoxY;
float zWH(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float zWN(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(zWH(i),zWH(i+vec2(1,0)),f.x),mix(zWH(i+vec2(0,1)),zWH(i+1.),f.x),f.y);}
vec2 zRip(vec2 p,float t){vec2 acc=vec2(0.);for(int k=0;k<3;k++){float fk=float(k);vec2 q=p*(2.6+fk*1.9)+fk*7.13;vec2 c=floor(q),f=fract(q);float h=zWH(c+fk*3.1);
    vec2 o=vec2(.25+.5*fract(h*7.13),.25+.5*fract(h*3.71));float ph=fract(t*(.75+.5*fract(h*11.))+h);vec2 d=f-o;float r=length(d);float ring=ph*.42;
    float w=sin((r-ring)*46.)*exp(-pow((r-ring)*10.,2.))*(1.-ph)*(1.-ph);acc+=d/max(r,1e-3)*w;}return acc*.45;}
`+T.ShaderChunk.lights_physical_pars_fragment;
T.ShaderChunk.lights_physical_fragment=`
#ifdef USE_FOG
{vec3 wpW=vFogV+cameraPosition;vec3 upV=normalize((viewMatrix*vec4(0.,1.,0.,0.)).xyz);float upn=dot(normal,upV);
 float inside=step(dryBox.x,wpW.x)*step(wpW.x,dryBox.z)*step(dryBox.y,wpW.z)*step(wpW.z,dryBox.w)*step(wpW.y,dryBoxY);
 float wk=wetG*(1.-inside)*(.4+.6*smoothstep(-.35,.8,upn));
 if(wk>.002){diffuseColor.rgb*=1.-wk*.45*(1.-metalnessFactor);roughnessFactor=mix(roughnessFactor,.13,wk*.85);
   float flat_=smoothstep(.9,.985,upn);
   #ifdef NO_PUDDLE
   flat_=0.;roughnessFactor=max(roughnessFactor,.55);
   #endif
   #ifdef DRY_MATTE
   flat_=0.;roughnessFactor=max(roughnessFactor,.88);
   #endif
   if(flat_>0.){vec2 pq=wpW.xz;float pn=zWN(pq*.32)*.6+zWN(pq*1.4+4.)*.3+zWN(pq*5.)*.1;
     float pud=flat_*smoothstep(.66-wk*.2,.71-wk*.2,pn)*(1.-inside);
     if(pud>0.){float dpx=length(vFogV);
       /* a puddle is glossy but not a perfect mirror, and further off its ripples are below a pixel: there they only
          roughen it (sharp sub-pixel ripples are what sparkled as white dots) */
       roughnessFactor=mix(roughnessFactor,mix(.07,.3,smoothstep(8.,60.,dpx)),pud);diffuseColor.rgb*=1.-.3*pud;
       vec2 rn=zRip(pq,timeG)*rainG*(1.-smoothstep(8.,28.,dpx));vec3 nn=normalize(mix(normal,upV,pud*.9));normal=normalize(nn+(viewMatrix*vec4(rn.x,0.,rn.y,0.)).xyz*pud);}}}
 /* specular anti-aliasing: where the normal turns faster than a pixel can show (bumpy normal maps far off, grass, ripples)
    the surface is made rougher by that much, so a wet, glossy ground does not break up into single bright pixels - the
    white dots that came back wherever it was wet */
 #if __VERSION__>=300 || defined(GL_OES_standard_derivatives)
 {vec3 dnx=dFdx(normal),dny=dFdy(normal);float nv=.25*(dot(dnx,dnx)+dot(dny,dny));roughnessFactor=sqrt(clamp(roughnessFactor*roughnessFactor+min(2.*nv,.2),0.,1.));}
 #endif
}
#endif
`+T.ShaderChunk.lights_physical_fragment;
/* attach the shared uniforms to every standard material in the scene (rescanned so late-built props get them too) */
function wetWrap(m){if(!m||!m.isMeshStandardMaterial||m.userData.wetW)return;m.userData.wetW=1;const pk=m.customProgramCacheKey.call(m),prev=m.onBeforeCompile;
  m.onBeforeCompile=function(s,r){if(prev)prev.call(this,s,r);s.uniforms.wetG=WU.wet;s.uniforms.rainG=WU.rain;s.uniforms.timeG=WU.time;s.uniforms.dryBox=WU.box;s.uniforms.dryBoxY=WU.boxY;};
  m.customProgramCacheKey=()=>'W|'+pk;m.needsUpdate=true;}
function wetScan(){scene.traverse(o=>{if(!o.material)return;if(Array.isArray(o.material))o.material.forEach(wetWrap);else wetWrap(o.material);});}

/* rain streaks: each drop a thin quad drawn along the path it travels during one exposure (its fall velocity plus the
   wind, minus the camera's own motion) - so the streaks lean exactly the way the rain is moving, and swing when you run or
   turn. Positions integrate the wind on the CPU (a time-varying wind multiplied by absolute time would make every drop
   slide sideways far faster than it falls). */
const RAIN=(()=>{const N=5200;const base=new T.PlaneGeometry(1,1);base.translate(0,.5,0);
  const g=new T.InstancedBufferGeometry();g.index=base.index;g.setAttribute('position',base.attributes.position);g.setAttribute('uv',base.attributes.uv);
  const S=new Float32Array(N*3);for(let i=0;i<N*3;i++)S[i]=Math.random();g.setAttribute('seed',new T.InstancedBufferAttribute(S,3));g.instanceCount=N;
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,fog:false,side:T.DoubleSide,uniforms:{uCam:{value:V3()},uCamV:{value:V3()},uOff:{value:V3()},uRain:{value:0},uWind:{value:new T.Vector2(1.2,.5)},uBox:WU.box,uBoxY:WU.boxY,uRes:{value:new T.Vector2(1280,720)}},
    vertexShader:`attribute vec3 seed;uniform vec3 uCam,uCamV,uOff;uniform float uRain,uBoxY;uniform vec2 uWind,uRes;uniform vec4 uBox;varying float vA;varying vec2 vUv;
      void main(){vec3 B=vec3(44.,26.,44.);float k=.88+seed.x*.26;
        vec3 p=seed*B+vec3(uOff.x,-uOff.y*k,uOff.z);vec3 lo=uCam-B*.5;vec3 wp=lo+mod(p-lo,B);
        vec3 vel=vec3(uWind.x,-9.75*k,uWind.y)-uCamV;vec3 tail=wp-vel*.046;
        vec4 c0=projectionMatrix*viewMatrix*vec4(wp,1.),c1=projectionMatrix*viewMatrix*vec4(tail,1.);
        float on=step(fract(seed.x*71.13+seed.y*29.71+seed.z*13.37),uRain);float ins=step(uBox.x,wp.x)*step(wp.x,uBox.z)*step(uBox.y,wp.z)*step(wp.z,uBox.w)*step(wp.y,uBoxY);
        float d=length(wp-uCam);vA=on*(1.-ins)*smoothstep(.6,2.5,d)*(1.-smoothstep(14.,22.,d));
        if(c0.w<.05||c1.w<.05){gl_Position=vec4(2.,2.,2.,1.);return;}
        vec2 s0=c0.xy/c0.w,s1=c1.xy/c1.w;vec2 dir=(s1-s0)*uRes;float L=max(length(dir),1.);dir/=L;vec2 nrm=vec2(-dir.y,dir.x);
        float wpx=max(1.5,1.9*uRes.y/(d*90.));vA*=clamp(1.9/wpx,.4,1.);
        vec2 sp=mix(s0,s1,position.y)+nrm*position.x*wpx*2./uRes;float z=mix(c0.z/c0.w,c1.z/c1.w,position.y);
        vUv=vec2(position.x+.5,position.y);gl_Position=vec4(sp,z,1.);}`,
    fragmentShader:`varying float vA;varying vec2 vUv;void main(){float e=1.-abs(vUv.x-.5)*2.;float a=vA*e*(.35+.65*vUv.y)*.5;if(a<.004)discard;gl_FragColor=vec4(.86,.88,.92,a);}`});
  const l=new T.Mesh(g,m);l.frustumCulled=false;l.renderOrder=8;l.visible=false;scene.add(l);return{l,m,last:null};})();
/* splashes: short-lived expanding crowns on the ground around the player */
const SPL=(()=>{const N=520,P=new Float32Array(N*3),A=new Float32Array(N),Ph=new Float32Array(N),age=new Float32Array(N);for(let i=0;i<N;i++){Ph[i]=Math.random();P[i*3+1]=-200;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));g.setAttribute('ph',new T.BufferAttribute(Ph,1));
  /* (no splash may shrink to a speck: under ~3 px it fades out instead - a pixel-sized white point on the ground is
     what read as white dots in the grass - and they go with distance, fogged like everything else) */
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{uT:{value:0},uRain:{value:0},uScale:{value:600}}]),
    vertexShader:`attribute float ph;uniform float uT,uScale;varying float vAge;varying float vK;
      #include <fog_pars_vertex>
      void main(){vAge=fract(uT*3.2+ph);vec3 transformed=position;vec4 mvPosition=modelViewMatrix*vec4(position,1.);float px=uScale*(.04+.07*vAge)/-mvPosition.z;
        vK=smoothstep(3.,6.,px)*(1.-smoothstep(5.,8.,-mvPosition.z));gl_PointSize=max(px,3.);gl_Position=projectionMatrix*mvPosition;
        #include <fog_vertex>
      }`,
    fragmentShader:`uniform float uRain;varying float vAge;varying float vK;
      #include <fog_pars_fragment>
      void main(){vec2 d=gl_PointCoord-.5;float r=length(d)*2.;float ring=(1.-smoothstep(0.,.1,abs(r-.35-vAge*.55)))+(1.-smoothstep(0.,.25,r))*(1.-vAge)*.8;
      float a=ring*(1.-vAge)*uRain*.32*vK;if(a<.01)discard;gl_FragColor=vec4(.62,.64,.66,a);
      #include <fog_fragment>
      }`});
  const p=new T.Points(g,m);p.frustumCulled=false;p.renderOrder=8;p.visible=false;scene.add(p);return{p,m,P,Ph,age,N};})();

const WEATHER={rain:0,target:0,wet:0,cov:0,phase:'clear',timer:900+Math.random()*600,enabled:false,flash:0,thunderT:-1,base:null};
function weatherUpdate(dt,cam,indoor){const W=WEATHER;
  if(!W.base)W.base={sun:sun.intensity,hemi:hemi.intensity,fog:scene.fog.density,fogC:scene.fog.color.clone(),top:skyMat.uniforms.uTop.value.clone(),hor:skyMat.uniforms.uHor.value.clone(),sunC:skyMat.uniforms.uSunC.value.clone()};
  if(window.__rain!==undefined){W.target=W.rain=window.__rain;W.cov=Math.max(W.cov,window.__rain);W.enabled=false;if(window.__wet!==undefined)W.wet=window.__wet;}
  else if(W.script){W.target=W.script.rain;}
  else if(W.enabled){W.timer-=dt;if(W.timer<=0){
      if(W.phase==='clear'){W.phase='rain';W.target=.3+Math.random()*.6;W.timer=80+Math.random()*70;}
      else{W.phase='clear';W.target=0;W.timer=1100+Math.random()*900;}}}
  else W.target=0;
  W.rain+=clamp(W.target-W.rain,-dt/35,dt/45);
  W.cov=damp(W.cov,Math.max(W.rain*1.15,W.target*.8),.08,dt);
  if(window.__wet===undefined)W.wet=clamp(W.wet+(W.rain>.05?W.rain*.03:-.0035)*dt,0,1);
  /* (in the war zone the sky never clears: a low grey overcast whatever the weather is doing, heavier toward the front -
     the sun a pale smear through it, flat cold light, the distance lost in haze) */
  {const p=camera.position,fob=Math.abs(p.x)<110&&Math.abs(p.z)<140,sec=p.x>-60&&p.x<260&&p.z<-200,front=p.x<-1000||p.z<-450;
   const tgt=fob?.35:sec?1:p.x<-300?lerp(.7,1,clamp((-300-p.x)/600,0,1)):.7;W.war=damp(W.war===undefined?tgt:W.war,tgt,.12,dt);W.front=damp(W.front||0,front?1:0,.1,dt);}
  const oc=clamp(Math.max(W.cov,W.war*(.6+.14*W.front)),0,1),ocF=clamp(Math.max(W.cov,W.war*(.22+.1*W.front)),0,1),B=W.base;
  /* lightning in heavy rain: a flash on the ambient, thunder a moment later */
  if(W.rain>.6&&Math.random()<dt*.025){W.flash=1;W.thunderT=.8+Math.random()*2.5;}
  W.flash=Math.max(0,W.flash-dt*5);if(W.thunderT>0){W.thunderT-=dt;if(W.thunderT<=0&&sfx.thunder)sfx.thunder(.6+Math.random()*.4);}
  const fl=W.flash>0?(Math.random()<.5?W.flash:W.flash*.3):0;
  sun.intensity=B.sun*(1-.72*oc);hemi.intensity=B.hemi*(1-.32*oc)+fl*2.2;
  /* scripted fog: denser, paler, and low mist sheets over the wet ground */
  W.fogX=damp(W.fogX||1,W.script?W.script.fog:1,.18,dt);W.mist=damp(W.mist||0,W.script?W.script.mist:0,.2,dt);
  /* in fog the sun is a pale disc: the direct light is scattered out of it into the murk - weaker, softer shadows, more
     light from all round, and a dimmer disc and glare in the sky */
  W.dim=clamp(Math.max((W.fogX-1)/.4,W.mist*.85),0,1);sun.intensity*=1-.62*W.dim;hemi.intensity*=1+.12*W.dim;
  scene.fog.density=B.fog*(1+1.4*ocF)*W.fogX;scene.fog.color.copy(B.fogC).multiplyScalar(1-.24*oc+fl*.5).lerp(C(0x8c938e),clamp((W.fogX-1)*.35,0,.55));
  skyMat.uniforms.uTop.value.copy(B.top).lerp(C(0x4a5058),oc).multiplyScalar(1+fl);skyMat.uniforms.uHor.value.copy(B.hor).lerp(C(0x6c706c),oc).multiplyScalar(1+fl*.6);
  skyMat.uniforms.uSunC.value.copy(B.sunC).multiplyScalar((1-.85*oc)*(1-.7*(W.dim||0)));if(skyMat.uniforms.uCov)skyMat.uniforms.uCov.value=oc;
  WU.wet.value=W.wet;WU.rain.value=W.rain;WU.time.value=S.t;
  const r=W.rain;RAIN.l.visible=r>.01;const RU=RAIN.m.uniforms;RU.uRain.value=r;RU.uCam.value.copy(cam);
  RU.uWind.value.set(1.2+Math.sin(S.t*.05)*.8,.5+Math.cos(S.t*.04)*.6);
  RU.uOff.value.x=(RU.uOff.value.x+RU.uWind.value.x*dt)%440;RU.uOff.value.z=(RU.uOff.value.z+RU.uWind.value.y*dt)%440;RU.uOff.value.y=(RU.uOff.value.y+9.75*dt)%2600;
  if(RAIN.last&&dt>0){RU.uCamV.value.copy(cam).sub(RAIN.last).multiplyScalar(1/dt);if(RU.uCamV.value.length()>40)RU.uCamV.value.set(0,0,0);}RAIN.last=(RAIN.last||V3()).copy(cam);
  RU.uRes.value.set(renderer.domElement.width,renderer.domElement.height);
  /* splashes: relocate each one when its little animation wraps */
  SPL.p.visible=r>.02;SPL.m.uniforms.uT.value=S.t;SPL.m.uniforms.uRain.value=r;SPL.m.uniforms.uScale.value=renderer.domElement.height*.9;
  if(SPL.p.visible){const P=SPL.P;for(let i=0;i<SPL.N;i++){const a=(S.t*3.2+SPL.Ph[i])%1;if(a<SPL.age[i]){if(Math.random()<r){const ang=Math.random()*6.283,d=Math.sqrt(Math.random())*7.5+.6;
        const x=cam.x+Math.cos(ang)*d,z=cam.z+Math.sin(ang)*d;const bx=WU.box.value;const ins=x>bx.x&&x<bx.z&&z>bx.y&&z<bx.w;const sf=typeof surface==='function'?surface(x,z):'dirt';P[i*3]=x;P[i*3+1]=ins||sf==='grass'?-200:groundY(x,z)+.03;P[i*3+2]=z;}else P[i*3+1]=-200;}SPL.age[i]=a;}
    SPL.p.geometry.attributes.position.needsUpdate=true;}
  if(sfx.rain){sfx.rain.g.gain.value=r*.34*(indoor?.55:1);sfx.rain.f.frequency.value=indoor?850:3800;}
  return r;}
