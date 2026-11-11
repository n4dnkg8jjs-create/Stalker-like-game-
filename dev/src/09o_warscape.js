/* ---------- the war, all round and never quite gone: a soundscape that runs through lulls, the ordinary day of it, and
   heavy spells. Far guns thump and roll back off the country; machine guns argue a few kilometres off; now and then an
   FPV drone's whine crosses somewhere overhead and, a little later, there is a crump where it found something; a recon
   drone drones high up; once in a while a rocket salvo rips off over the horizon and comes down long seconds later.
   Everything goes through one bus that closes down indoors and while riding in the armour. Every node an event makes is
   disconnected again when it has finished. ---------- */
const WAR={ready:false,phase:'active',left:70,t:{art:6,mg:9,drone:40,recon:90,grad:120,close:40,single:20},bus:null,lp:null};
function warInit(){if(WAR.ready||!AC||!AUD.master||!AUD.burst)return;WAR.ready=true;
  WAR.bus=AC.createGain();WAR.bus.gain.value=.9;WAR.lp=AC.createBiquadFilter();WAR.lp.type='lowpass';WAR.lp.frequency.value=6000;WAR.bus.connect(WAR.lp);WAR.lp.connect(AUD.master);
  const w=AC.createGain();w.gain.value=.35;WAR.lp.connect(w);w.connect(AUD.send);warSynth();}
/* the guns' own sound, made once at start: a few blast bodies (the sub-bass thump falling in pitch under a short burst of
   filtered noise) and a few rolling tails (the boom coming back off the land: a dozen and more echoes arriving at random
   over several seconds, each its own little decay, the whole losing its top as it travels) - every gun picks one of
   each, at a slightly different speed, so no two shots sound alike */
function warSynth(){const sr=AC.sampleRate;const R_=Math.random;WAR.bodies=[];WAR.tails=[];
  const norm=(x,pk=.92)=>{let m=0;for(let i=0;i<x.length;i++)m=Math.max(m,Math.abs(x[i]));const k=pk/Math.max(1e-6,m);for(let i=0;i<x.length;i++)x[i]*=k;};
  const jobs=[];for(let v=0;v<4;v++)jobs.push(()=>{const n=Math.floor(sr*2.6),b=AC.createBuffer(1,n,sr),x=b.getChannelData(0);const f0=48+R_()*16,f1=30+R_()*8,tau=.3+R_()*.18;let ph=0,y1=0,y2=0;
    const a1=1-Math.exp(-2*Math.PI*380/sr);
    for(let i=0;i<n;i++){const t=i/sr,at=Math.min(1,t/.008),f=f1+(f0-f1)*Math.exp(-t/.25);ph+=2*Math.PI*f/sr;
      const nz=(R_()*2-1)*Math.exp(-t/(.09+R_()*.0))*1.1;y1+=a1*(nz-y1);y2+=a1*(y1-y2);
      x[i]=at*(Math.sin(ph)*Math.exp(-t/tau)*1.0+y2*1.6+Math.sin(ph*.5)*Math.exp(-t/(tau*1.6))*.35);}norm(x);WAR.bodies.push(b);});
  for(let v=0;v<5;v++)jobs.push(()=>{const n=Math.floor(sr*7),b=AC.createBuffer(1,n,sr),x=b.getChannelData(0);const E=[[0,1,.9+R_()*.5]];const ne=14+Math.floor(R_()*8);
    for(let k=0;k<ne;k++){const tk=.18+Math.pow(R_(),1.4)*5.8;E.push([tk,(.25+R_()*.75)*Math.exp(-tk/2.2),.35+R_()*.9]);}
    let y1=0,y2=0;for(let i=0;i<n;i++){const t=i/sr;let env=0;for(const [tk,ak,tau] of E){if(t<tk)continue;const d=t-tk;env+=ak*Math.min(1,d/.07)*Math.exp(-d/tau);}
      const fc=60+620*Math.exp(-t/1.3),a=1-Math.exp(-2*Math.PI*fc/sr);const nz=(R_()*2-1)*env;y1+=a*(nz-y1);y2+=a*(y1-y2);x[i]=y2;}
    for(let i=0;i<n;i++){const t=i/sr;x[i]*=Math.min(1,(7-t)/.5);}norm(x);WAR.tails.push(b);});
  /* (made a piece at a time between frames, so starting the sound never stalls the picture) */const step=()=>{const j=jobs.shift();if(j){j();setTimeout(step,150);}};step();}
function warBuf(b,out,g,rate,dl=0){if(!b)return;const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=rate;const gn=AC.createGain();gn.gain.value=g;s.connect(gn).connect(out);s.start(AC.currentTime+dl);s.onended=()=>{try{s.disconnect();gn.disconnect();}catch(_){}};}
const warPick=a=>a&&a.length?a[Math.floor(Math.random()*a.length)]:null;
/* an event's place: a panner at p feeding a lowpass for its distance, into the bus; cut loose after `life` seconds */
function warOut(p,cut,life,ref=250,roll=.35){const n=AC.createPanner();n.panningModel='equalpower';n.distanceModel='inverse';n.refDistance=ref;n.rolloffFactor=roll;n.maxDistance=20000;
  if(n.positionX){n.positionX.value=p.x;n.positionY.value=p.y;n.positionZ.value=p.z;}else n.setPosition(p.x,p.y,p.z);
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=cut;lp.Q.value=.5;lp.connect(n);n.connect(WAR.bus);
  setTimeout(()=>{try{lp.disconnect();n.disconnect();}catch(_){}},(life+1)*1000);return{in:lp,pan:n};}
const warAt=(r,y=30)=>{const a=Math.random()*6.283,c=camera.position;return V3(c.x+Math.cos(a)*r,c.y+y,c.z+Math.sin(a)*r);};
/* a gun far off: the thud, the long roll of it coming back off the land, sometimes a second echo */
function warGun(r,k=1){const p=warAt(r,40);warFlash(p,clamp(1800/r,.15,.8)*k);const dl=Math.min(r/343,14);setTimeout(()=>{if(WAR.ready)warGunSnd(p,r,k);},dl*1000);}
function warGunSnd(p,r,k){const o=warOut(p,lerp(420,110,clamp((r-1200)/5000,0,1)),9);const g=clamp(2600/r,.25,1.1)*k;
  if(AUD.has('boom'))AUD.play('boom',o.in,.32*g,.52+Math.random()*.2);
  warBuf(warPick(WAR.bodies),o.in,.75*g,.8+Math.random()*.3);warBuf(warPick(WAR.tails),o.in,.42*g,.8+Math.random()*.35,.06+Math.random()*.1);
  if(Math.random()<.55){const e=warOut(warAt(r*1.2,60),140,8);AUD.burst(3,.12*g,160,40,'lowpass',.4,.9+Math.random()*1.6,e.in,.3);}}
/* close enough to feel: a sharp crack ahead of the boom, the ground's thump, a patter of debris */
function warClose(){const r=380+Math.random()*700,p=warAt(r,5);warFlash(p,.9);setTimeout(()=>{if(WAR.ready)warCloseSnd(p);},r/343*1000);}
function warCloseSnd(p){const o=warOut(p,2400,8,60,.8);
  if(AUD.has('boom'))AUD.play('boom',o.in,.6,.8+Math.random()*.12);AUD.burst(.06,.7,5200,1800,'highpass',.7,0,o.in);AUD.burst(.25,.5,3800,700,'bandpass',.6,.01,o.in);AUD.tone(55,24,1.4,.5,0,o.in);
  warBuf(warPick(WAR.bodies),o.in,1.0,1.05+Math.random()*.2);warBuf(warPick(WAR.tails),o.in,.55,.95+Math.random()*.25,.05);
  for(let k=0;k<10;k++)AUD.burst(.05,.06,2200+Math.random()*1500,0,'bandpass',3,.6+Math.random()*2.2,o.in,.002);AUD.lastGun=S.t;}
/* a machine gun's bursts (a PKM sounds slower and heavier than a rifle), sometimes answered from another bearing */
function warMG(){const r=700+Math.random()*2200,p=warAt(r,10);const o=warOut(p,lerp(1500,600,clamp((r-700)/2200,0,1)),14,120,.5);const g=clamp(1400/r,.3,1.1);
  let dl=0;const nb=1+Math.floor(Math.random()*4),pk=Math.random()<.5,gap=pk?.1:.085;
  for(let b=0;b<nb;b++){const shots=4+Math.floor(Math.random()*(pk?14:8));for(let s=0;s<shots;s++){if(AUD.has('akfar'))AUD.play('akfar',o.in,.3*g,(pk?.82:.95)+Math.random()*.06,dl+s*gap);else AUD.burst(.09,.12*g,900,300,'lowpass',.8,dl+s*gap,o.in);}dl+=shots*gap+.4+Math.random()*1.6;}
  if(Math.random()<.45){const q=warAt(r*(.8+Math.random()*.5),10),o2=warOut(q,1100,14,120,.5);let d2=dl*.4+.5;for(let b=0;b<2;b++){const n=3+Math.floor(Math.random()*6);for(let s=0;s<n;s++)if(AUD.has('akfar'))AUD.play('akfar',o2.in,.22*g,1+Math.random()*.08,d2+s*.09);d2+=n*.09+.5+Math.random();}}}
/* one or two aimed shots, and their echo */
function warSingle(){const r=500+Math.random()*1200,o=warOut(warAt(r,8),1800,6,120,.5);const n=1+Math.floor(Math.random()*2);for(let k=0;k<n;k++){if(AUD.has('akfar'))AUD.play('akfar',o.in,.35,.9,k*(.8+Math.random()*1.5));AUD.burst(1.2,.05,700,160,'lowpass',.5,.35+k,o.in,.05);}}
/* an FPV drone crossing: two detuned saws and the prop buzz on top, its pitch sliding as it passes (it is moving fast),
   coming up out of nothing and going away; sometimes, a while later, where it went, a crump */
function warDrone(recon){const c=camera.position,a=Math.random()*6.283,off=(recon?250:60)+Math.random()*(recon?500:220),len=recon?(22+Math.random()*20):(8+Math.random()*7),sp=recon?28:55;
  const dx=Math.cos(a),dz=Math.sin(a),ox=-dz*off,oz=dx*off,L=sp*len/2,y=c.y+(recon?180+Math.random()*200:35+Math.random()*80);
  const P0=V3(c.x+ox-dx*L,y,c.z+oz-dz*L),P1=V3(c.x+ox+dx*L,y,c.z+oz+dz*L);const o=warOut(P0,recon?900:3200,len+1,recon?60:30,1);
  const t=AC.currentTime;if(o.pan.positionX){o.pan.positionX.setValueAtTime(P0.x,t);o.pan.positionX.linearRampToValueAtTime(P1.x,t+len);o.pan.positionZ.setValueAtTime(P0.z,t);o.pan.positionZ.linearRampToValueAtTime(P1.z,t+len);}
  const f=recon?(95+Math.random()*30):(170+Math.random()*70),env=AC.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(recon?.09:.16,t+len*.45);env.gain.setValueAtTime(recon?.09:.16,t+len*.55);env.gain.exponentialRampToValueAtTime(.0001,t+len);env.connect(o.in);const amG=AC.createGain();amG.gain.value=1;amG.connect(env);
  const oscs=[];[[f,'sawtooth',.5],[f*1.012,'sawtooth',.4],[f*2,'square',.12],[f*3.02,'sawtooth',.08]].forEach(([fr,ty,gn])=>{const s=AC.createOscillator();s.type=ty;s.frequency.setValueAtTime(fr*1.05,t);s.frequency.linearRampToValueAtTime(fr*.95,t+len);
    s.frequency.setTargetAtTime(fr*(1+(Math.random()-.5)*.08),t+len*.3,1.5);const g=AC.createGain();g.gain.value=gn;s.connect(g).connect(amG);s.start(t);s.stop(t+len+.1);oscs.push(s);});
  if(!recon){const am=AC.createOscillator();am.frequency.value=26+Math.random()*16;const ag=AC.createGain();ag.gain.value=.3;am.connect(ag).connect(amG.gain);am.start(t);am.stop(t+len+.1);
    if(Math.random()<.5)setTimeout(()=>{if(WAR.ready&&!document.hidden)warGun(900+Math.random()*900,.8);},(len+2+Math.random()*5)*1000);}
  setTimeout(()=>{try{env.disconnect();amG.disconnect();}catch(_){}},(len+1)*1000);}
/* a rocket salvo: the ripping launch of a battery far off, and long after, the impacts coming down in a string */
function warGrad(){const r=3500+Math.random()*3000,o=warOut(warAt(r,60),900,40,400,.3);const n=16+Math.floor(Math.random()*20);
  for(let k=0;k<n;k++)AUD.burst(.9,.08,2200,500,'bandpass',.7,k*.42+Math.random()*.15,o.in,.05);
  const land=14+Math.random()*10;setTimeout(()=>{if(!WAR.ready)return;const q=warAt(2500+Math.random()*2500,20),o2=warOut(q,300,30,300,.3);for(let k=0;k<n;k++){const d=k*.35+Math.random()*.3;if(AUD.has('boom'))AUD.play('boom',o2.in,.28,.55+Math.random()*.2,d);else AUD.burst(1.5,.2,200,50,'lowpass',.5,d,o2.in);}},land*1000);}
/* lull, the ordinary day, heavy spells: how long each lasts and how often each sound comes in it */
const WARP={lull:{d:[35,80],art:[22,45],mg:[40,90],drone:[120,240],recon:[90,160],single:[30,70],close:null,grad:null},
  active:{d:[60,150],art:[7,18],mg:[10,26],drone:[55,130],recon:[110,200],single:[18,45],close:[90,200],grad:[200,400]},
  heavy:{d:[30,80],art:[2.2,6],mg:[4,11],drone:[30,70],recon:[150,250],single:[12,30],close:[18,40],grad:[60,140]}};
function warTick(dt){if(!AC)return;if(!WAR.ready){warInit();if(!WAR.ready)return;}
  const st=S.state,live=st==='play'||st==='view'||st==='ride',ride=st==='ride',ind=AUD.ind,t=AC.currentTime;
  WAR.bus.gain.setTargetAtTime(live?(ride?.35:ind?.55:1):0,t,.5);WAR.lp.frequency.setTargetAtTime(ride?500:ind?700:6000,t,.4);if(!live)return;
  WAR.left-=dt;if(WAR.left<=0){const r=Math.random();WAR.phase=WAR.phase==='heavy'?(r<.75?'active':'lull'):WAR.phase==='lull'?(r<.75?'active':'heavy'):(r<.6?'active':r<.88?'heavy':'lull');
    const P=WARP[WAR.phase];WAR.left=P.d[0]+Math.random()*(P.d[1]-P.d[0]);for(const k in WAR.t){const v=P[k];if(v)WAR.t[k]=Math.min(WAR.t[k],v[0]+Math.random()*(v[1]-v[0]));}}
  const P=WARP[WAR.phase],T_=WAR.t,next=k=>{const v=P[k];return v?v[0]+Math.random()*(v[1]-v[0]):1e9;};
  /* (closer to the front it is busier and nearer: the base hears it as a far mutter, the village and the road south-west
     as a near, continuous thing) */
  const wl=typeof WEATHER!=='undefined'&&WEATHER.war!==undefined?WEATHER.war:.7;
  for(const k in T_){T_[k]-=dt*(.6+.6*wl);if(T_[k]>0)continue;T_[k]=next(k);if(!P[k])continue;
    if(k==='art'){const sal=WAR.phase==='heavy'&&Math.random()<.5?2+Math.floor(Math.random()*4):1;const r=(1500+Math.random()*5000)*(1.35-.45*wl);for(let i=0;i<sal;i++)setTimeout(()=>warGun(r*(.9+Math.random()*.2)),i*(600+Math.random()*1900));if(WAR.phase==='heavy')AUD.lastGun=S.t;}
    else if(k==='mg')warMG();else if(k==='drone')warDrone(false);else if(k==='recon')warDrone(true);else if(k==='single')warSingle();else if(k==='close')warClose();else if(k==='grad')warGrad();}}

/* ---------- what you see of it: the flash of a far gun lighting the haze low on the horizon an instant before you hear
   it; and the ash and dust that hang in the air of a burnt-out country, drifting past outdoors ---------- */
const WFX={spr:[],ash:null,n:0};
function warFlash(p,k){if(!WFX.tex)WFX.tex=memo('flashT',()=>tex(128,64,(c,w,h)=>{const g=c.createRadialGradient(w/2,h*.75,0,w/2,h*.75,w*.5);g.addColorStop(0,'rgba(255,190,120,1)');g.addColorStop(.35,'rgba(240,140,70,.45)');g.addColorStop(1,'rgba(200,100,50,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},{clamp:true}));
  let sp=WFX.spr.find(s=>s.userData.a<=0);if(!sp){if(WFX.spr.length>=6)sp=WFX.spr[0];else{sp=new T.Sprite(new T.SpriteMaterial({map:WFX.tex,color:0xffc89a,transparent:true,blending:T.AdditiveBlending,depthWrite:false,fog:false,opacity:0}));sp.renderOrder=-1;sp.userData={a:0,dir:V3()};scene.add(sp);WFX.spr.push(sp);}}
  const c=camera.position;sp.userData.dir.set(p.x-c.x,0,p.z-c.z).normalize();sp.userData.a=k*(.6+Math.random()*.4);sp.userData.t=0;}
function warFxTick(dt){const c=camera.position,ind=typeof inHouse==='function'&&inHouse(c.x,c.z);
  for(const sp of WFX.spr){const u=sp.userData;if(u.a<=0){sp.visible=false;continue;}u.t+=dt;const k=u.t<.06?u.t/.06:Math.exp(-(u.t-.06)*7);sp.visible=!ind;sp.material.opacity=u.a*k*.55;
    sp.position.set(c.x+u.dir.x*190,c.y+6,c.z+u.dir.z*190);sp.scale.set(150,42,1);if(u.t>1.2)u.a=0;}
  /* ash: a few hundred grey flecks in a box that follows you, falling slowly and swaying in the air */
  if(!WFX.ash){const n=700,g=new T.BufferGeometry(),P=new Float32Array(n*3);for(let i=0;i<n;i++){P[i*3]=(Math.random()-.5)*36;P[i*3+1]=Math.random()*14;P[i*3+2]=(Math.random()-.5)*36;}
    g.setAttribute('position',new T.BufferAttribute(P,3));const m=new T.PointsMaterial({color:0x9a9690,size:.045,sizeAttenuation:true,transparent:true,opacity:.6,depthWrite:false,map:memo('ashT',()=>tex(16,16,(c2,w,h)=>{const gr=c2.createRadialGradient(8,8,0,8,8,8);gr.addColorStop(0,'rgba(255,255,255,1)');gr.addColorStop(1,'rgba(255,255,255,0)');c2.fillStyle=gr;c2.fillRect(0,0,w,h);},{clamp:true}))});
    WFX.ash=new T.Points(g,m);WFX.ash.frustumCulled=false;WFX.ash.userData.noCull=true;scene.add(WFX.ash);WFX.base=V3();}
  const A=WFX.ash;A.visible=!ind&&(S.state==='play'||S.state==='view');if(!A.visible)return;const P=A.geometry.attributes.position.array,t=S.t,g=(typeof AUD!=='undefined'&&AUD.gust)||0;
  for(let i=0;i<P.length;i+=3){P[i]+=(Math.sin(t*.7+i)*.08+.15+g*1.2)*dt;P[i+1]-=(.12+Math.sin(t*1.3+i*.37)*.05)*dt;P[i+2]+=(Math.cos(t*.6+i*.5)*.08+g*.4)*dt;
    const wx=P[i]+A.position.x-c.x,wz=P[i+2]+A.position.z-c.z;if(wx>18||wx<-18)P[i]=c.x-A.position.x+(((wx+18)%36+36)%36)-18;if(wz>18||wz<-18)P[i+2]=c.z-A.position.z+(((wz+18)%36+36)%36)-18;if(P[i+1]+A.position.y<c.y-4)P[i+1]+=14;}
  A.geometry.attributes.position.needsUpdate=true;if(Math.abs(A.position.y-(c.y-4))>6)A.position.y=c.y-4;}
