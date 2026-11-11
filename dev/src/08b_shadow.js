/* ---------- the shadow: a flat, paper-thin silhouette that peels off the field outside the house after Volkov
   is found, charges the player, recoils when hit and comes apart like smoke after a few rounds ---------- */
const SHADOWTEX=tex(256,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='#000';
  /* gaunt figure: small head, long neck, narrow chest, arms hanging past the knees, splayed fingers */
  const P=[[128,30],[146,36],[152,58],[146,78],[140,92],[168,104],[184,140],[192,200],[200,262],[206,320],[214,356],[204,362],[194,332],[186,286],[176,236],[170,196],[164,232],[166,300],[172,380],[178,452],[184,500],[160,500],[150,440],[138,360],[128,320],[118,360],[106,440],[96,500],[72,500],[78,452],[84,380],[90,300],[92,232],[86,196],[80,236],[70,286],[62,332],[52,362],[42,356],[50,320],[56,262],[64,200],[72,140],[88,104],[116,92],[110,78],[104,58],[110,36]];
  g.beginPath();P.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]));g.closePath();g.fill();
  /* ragged smoky edge */
  const im=g.getImageData(0,0,w,h),d=im.data,a=new Float32Array(w*h);for(let i=0;i<w*h;i++)a[i]=d[i*4+3]/255;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x;let s=0,n=0;for(let k=-3;k<=3;k++)for(let j=-3;j<=3;j++){const xx=x+j,yy=y+k;if(xx<0||yy<0||xx>=w||yy>=h)continue;s+=a[yy*w+xx];n++;}
    const blur=s/n,nz=fbmT(x/w,y/h*2,8,4);const al=sstep(.25,.75,blur+(nz-.5)*.9*(1-Math.abs(blur-.5)*1.2));d[i*4]=d[i*4+1]=d[i*4+2]=0;d[i*4+3]=al*255;}
  /* two pale pin-prick eyes */
  g.putImageData(im,0,0);g.fillStyle='rgba(220,210,190,.85)';[121,135].forEach(ex=>{g.beginPath();g.arc(ex,55,2.2,0,7);g.fill();});},{clamp:true});
const SHADOW={on:false,dead:false};
function spawnShadow(x,z,o){if(SHADOW.on||(SHADOW.dead&&!o))return;
  const mat=new T.ShaderMaterial({transparent:true,depthWrite:false,side:T.DoubleSide,uniforms:{map:{value:SHADOWTEX},uT:{value:0},uA:{value:0},uHit:{value:0}},
    vertexShader:'uniform float uT;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;p.x+=sin(p.y*3.1+uT*7.0)*.03*(1.0-uv.y*.5)+sin(uT*23.0+p.y*11.0)*.012;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}',
    fragmentShader:`uniform sampler2D map;uniform float uT,uA,uHit;varying vec2 vUv;
      float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
      void main(){vec2 uv=vUv;uv.x+=sin(uv.y*40.0+uT*13.0)*.006;vec4 t=texture2D(map,uv);float flick=.82+.18*h(vec2(floor(uT*18.0),uv.y*3.0));
        float a=t.a*uA*flick;if(a<.02)discard;vec3 c=mix(vec3(.01,.008,.012),vec3(.9,.85,.8),uHit)+t.rgb;gl_FragColor=vec4(c,a*.94);}`});
  const m=new T.Mesh(new T.PlaneGeometry(1.1,2.25,1,8),mat);m.geometry.translate(0,1.12,0);m.position.set(x,groundY(x,z),z);m.renderOrder=6;scene.add(m);
  m.userData.onHit=()=>{if(SHADOW.state==='die')return;SHADOW.hp--;SHADOW.hit=1;SHADOW.recoil=1.6;sfx.scream&&sfx.scream(.6);if(SHADOW.hp<=0)killShadow();};
  shootables.push(m);
  Object.assign(SHADOW,{on:true,m,mat,hp:o?4:3,state:'rise',t:0,hit:0,recoil:0,a:0,vel:V3(),blink:0,second:!!o,wasDead:!!SHADOW.dead,prevObj:$('objt').textContent});
  if(o){setObj(o.obj);toast(o.toast);}else{setObj('Something is moving in the grass outside the house. Deal with it.');toast('You feel watched.');}if(sfx.scream)sfx.scream(1);}
function killShadow(){SHADOW.state='die';SHADOW.t=0;const i=shootables.indexOf(SHADOW.m);if(i>=0)shootables.splice(i,1);
  const p=SHADOW.m.position;for(let k=0;k<26;k++)FX.smoke.spawn(V3(p.x+rnd(-.4,.4),p.y+rnd(.1,1.9),p.z+rnd(-.4,.4)),V3(rnd(-.6,.6),rnd(.2,1.2),rnd(-.6,.6)),rnd(1.5,3),rnd(.25,.4),rnd(.8,1.4),[.02,.02,.025,.75],[.08,.08,.09,0],{drag:1.2,spin:rnd(-1,1)});
  S.sanity=clamp(S.sanity+10,0,100);toast('The shape tears apart like smoke.');}
function shadowUpdate(dt){const s=SHADOW;if(!s.on)return;s.t+=dt;const m=s.m;s.mat.uniforms.uT.value+=dt;
  const px=player.pos.x,pz=player.pos.z;const dx=px-m.position.x,dz=pz-m.position.z,d=Math.hypot(dx,dz);
  m.rotation.y=Math.atan2(dx,dz);
  s.hit=Math.max(0,s.hit-dt*5);s.mat.uniforms.uHit.value=s.hit;
  if(s.state==='die'){s.a=Math.max(0,s.a-dt*1.4);m.scale.set(1+s.t*.6,1-s.t*.2,1);if(s.a<=0){scene.remove(m);s.on=false;s.dead=s.second?s.wasDead:true;
      if(s.second){S.sh2='done';setObj(s.prevObj);}else setObj(S.searched?'Return to BTR «121» at the road. Two of the patrol are still missing.':'Search the old house for the missing patrol.');}}
  else{s.a=Math.min(1,s.a+dt*(s.state==='rise'?.7:2));
    if(s.state==='rise'&&s.t>2.2)s.state='charge';
    /* close in, with short sideways blinks; pull back after striking or being shot */
    let sp=s.state==='charge'?(d>14?5.5:8.5):0;if(s.recoil>0){s.recoil-=dt;sp=-6;}
    if(s.state==='back'){sp=-5.5;if(s.t>1.1){s.state='charge';s.t=0;}}
    s.blink-=dt;if(s.blink<0&&s.state==='charge'&&d>3){s.blink=rnd(.6,1.4);const sd=rnd(-1.4,1.4);m.position.x+=dz/d*sd;m.position.z-=dx/d*sd;}
    if(d>.01){m.position.x+=dx/d*sp*dt;m.position.z+=dz/d*sp*dt;}m.position.y=groundY(m.position.x,m.position.z);
    if(R()<dt*10)FX.smoke.spawn(V3(m.position.x+rnd(-.3,.3),m.position.y+rnd(.2,1.6),m.position.z+rnd(-.3,.3)),V3(rnd(-.2,.2),rnd(.1,.5),rnd(-.2,.2)),rnd(.8,1.6),.12,.45,[.02,.02,.025,.45],[.05,.05,.06,0],{drag:1});
    if(d<12)S.sanity=clamp(S.sanity-dt*(12-d)*.25,0,100);
    if(s.state==='charge'&&d<1.0){S.hp-=17;S.sanity=clamp(S.sanity-14,0,100);S.sinceDmg=0;S.killer='shadow';s.state='back';s.t=0;player.pitch+=.12;if(sfx.scream)sfx.scream(1);}}
  s.mat.uniforms.uA.value=s.a;}

/* the second one, in the last house up the street (n4, the one with the covered yard): go in, and when you turn back for
   the door it is standing in the porch, between you and the way out; it comes in after you */
function shadow2Tick(dt){if(S.sh2==='done'||S.chapter===2||SHADOW.on||S.state!=='play')return;const hd=VILL.houses.find(h=>h.id==='n4');
  const r=villRect(hd,-hd.W/2,hd.W/2,-hd.D/2,hd.D/2),p=player.pos,inH=p.x>r.x1&&p.x<r.x2&&p.z>r.z1&&p.z<r.z2;
  S.sh2T=inH?(S.sh2T||0)+dt:0;
  if(S.sh2T>3.5){const dx=hd.enter?(VILL.houses.indexOf(hd)%2?.6:.2):.2;const [x,z]=villW(hd,dx-.45,hd.D/2+2.6);S.sh2T=0;
    spawnShadow(x,z,{obj:'It came in after you. Deal with it.',toast:'The door darkens behind you.'});}}
