/* ---------- more of the world in the sound, and the nature beds put in their place: the recorded birds, frogs and wind
   go through one bus that keeps them back in the mix (a little darker, a little more of the room in them) and that closes
   right down while you ride - the engine and the armour are what you hear then. Fires crackle where they burn; the BTR's
   diesel knocks and clatters; now and then the war is audible somewhere far off; your kit rattles when you run. ---------- */
const A2={ready:false,fires:[],warT:70+Math.random()*60,eng:null};
/* a fire, synthesised: a low breathy roar under it, a steady scatter of small crackles, and every so often a sharp pop of
   sap with a short ring */
function fireBuf(){const sr=AC.sampleRate,n=Math.floor(sr*7),b=AC.createBuffer(2,n,sr);const op=f=>1-Math.exp(-2*Math.PI*f/sr);
  for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch),R=rng(808+ch*31);let l=0,l2=0,am=0;
    for(let i=0;i<n;i++){const w=R()*2-1;l+=(w-l)*op(260);l2+=(l-l2)*op(90);am+=((R()<.0004?1:0)-am)*op(2);d[i]=(l-l2*.6)*1.3*(.55+.45*Math.sin(i/sr*2.1+ch)*Math.sin(i/sr*.7))+(R()*2-1)*.012;}
    const ev=(t,a,f,len)=>{const s0=Math.floor(t*sr),L=Math.floor(len*sr);let y=0,y2=0;const k1=op(f),k2=op(f*.45);for(let i=0;i<L&&s0+i<n;i++){const e=Math.exp(-i/(L*.25));const w=(R()*2-1)*e;y+=(w-y)*k1;y2+=(y-y2)*k2;d[s0+i]+=(y-y2)*a;}};
    for(let k=0;k<7*26;k++)ev(R()*7,.18+R()*.5,2200+R()*4000,.002+R()*.006);
    for(let k=0;k<7*3;k++){const t=R()*7,f=1400+R()*1800;ev(t,.9+R()*.6,f*2,.004);const s0=Math.floor(t*sr);let ph=0;for(let i=0;i<sr*.03&&s0+i<n;i++){ph+=2*Math.PI*f/sr;d[s0+i]+=Math.sin(ph)*.12*Math.exp(-i/(sr*.006));}}
    let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[i]));for(let i=0;i<n;i++)d[i]/=pk||1;
    const xf=Math.floor(sr*.4);for(let i=0;i<xf;i++){const u=i/xf;d[i]=d[i]*u+d[n-xf+i]*(1-u);}}
  return b;}
/* the diesel: firing pulses at idle rate, each a dull thud and a sharp knock, the exhaust's rough breath, the clatter of
   the valve gear; two seconds exactly, so it loops on a firing stroke */
function dieselBuf(){const sr=AC.sampleRate,n=Math.floor(sr*2),b=AC.createBuffer(1,n,sr),d=b.getChannelData(0),R=rng(3131);const op=f=>1-Math.exp(-2*Math.PI*f/sr);
  const fr=54,per=sr/fr;let l=0;for(let i=0;i<n;i++){const w=R()*2-1;l+=(w-l)*op(320);d[i]=l*.6;}
  for(let k=0;k<fr*2;k++){const s0=Math.floor(k*per+(R()-.5)*per*.06),a=.75+R()*.35;let ph=0,y=0;const k1=op(1300);
    for(let i=0;i<per*1.6&&s0+i<n;i++){if(s0+i<0)continue;ph+=2*Math.PI*(88+20*Math.exp(-i/(sr*.004)))/sr;const e=Math.exp(-i/(sr*.016));d[s0+i]+=Math.sin(ph)*e*a;
      if(i<sr*.005){const w=R()*2-1;y+=(w-y)*k1;d[s0+i]+=y*.9*Math.exp(-i/(sr*.0015));}}
    if(k%2===0){const c0=s0+Math.floor(per*.5);for(let i=0;i<sr*.002&&c0+i<n;i++)if(c0+i>=0)d[c0+i]+=(R()*2-1)*.18;}}
  let pk=0;for(let i=0;i<n;i++)pk=Math.max(pk,Math.abs(d[i]));for(let i=0;i<n;i++)d[i]/=pk||1;return b;}
function aud2Init(){if(A2.ready||!AC||!AUD.master||!AUD.bed)return;A2.ready=true;
  A2.bed=AC.createGain();A2.bed.gain.value=.75;A2.bedLP=AC.createBiquadFilter();A2.bedLP.type='lowpass';A2.bedLP.frequency.value=7000;A2.bedLP.Q.value=.4;
  A2.bed.connect(A2.bedLP);A2.bedLP.connect(AUD.master);const wet=AC.createGain();wet.gain.value=.22;A2.bedLP.connect(wet);wet.connect(AUD.send);
  const route=r=>{try{r.g.disconnect();}catch(_){}r.g.connect(A2.bed);};
  for(const k in AUD.beds)if(k!=='wade')route(AUD.beds[k]);
  const orig=AUD.bed;AUD.bed=k=>{const had=!!AUD.beds[k];const r=orig(k);if(r&&!had&&k!=='wade')route(r);return r;};
  A2.fireB=fireBuf();A2.dieselB=dieselBuf();
  /* the BTR: the old synthesised hum kept low under the recorded-style diesel */
  if(sfx.engine){try{sfx.engine.disconnect();}catch(_){}A2.old=AC.createGain();A2.old.gain.value=.4;sfx.engine.connect(A2.old);A2.old.connect(AUD.master);
    const s=AC.createBufferSource();s.buffer=A2.dieselB;s.loop=true;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=1800;const g=AC.createGain();g.gain.value=0;s.connect(lp).connect(g).connect(AUD.master);s.start();A2.eng={s,g,lp};}
  /* fires that burn: the FOB's barrel, the stove in the lumber-yard shack (kept low) */
  if(S.stove&&S.stove.p)A2.fires.push({p:S.stove.p.clone().add(V3(0,.2,0)),gain:.9,ref:1.6,on:null});
  if(typeof WEST!=='undefined'&&WEST.stove){const p=WEST.stove.isVector3?WEST.stove.clone():WEST.stove.getWorldPosition(V3());A2.fires.push({p,gain:.3,ref:1.2,on:null});}}
function aud2Tick(dt){if(!AC)return;if(!A2.ready){aud2Init();if(!A2.ready)return;}const t=AC.currentTime,cp=camera.position;
  const ride=S.state==='ride'||(typeof RIDE!=='undefined'&&RIDE.on);
  A2.bed.gain.setTargetAtTime(ride?.32:.75,t,.4);A2.bedLP.frequency.setTargetAtTime(ride?650:(AUD.ind?2500:7000),t,.4);
  if(A2.eng&&sfx.engine){const eg=sfx.engine.gain.value;A2.eng.g.gain.setTargetAtTime(eg*2.2,t,.1);const r=sfx.engineO?clamp(sfx.engineO.frequency.value/36,.8,2.2):1;A2.eng.s.playbackRate.setTargetAtTime(r,t,.2);A2.eng.lp.frequency.setTargetAtTime(1200+r*700,t,.2);}
  for(const f of A2.fires){const d=cp.distanceTo(f.p);if(!f.on&&d<30&&S.state!=='load'){const s=AC.createBufferSource();s.buffer=A2.fireB;s.loop=true;s.playbackRate.value=.95+Math.random()*.1;const g=AC.createGain();g.gain.value=0;
      const pn=AUD.pan(f.p,f.ref,1.4,true,.35);s.connect(g).connect(pn);s.start(0,Math.random()*6);f.on={s,g,pn};}
    else if(f.on&&d>36){const o=f.on;f.on=null;o.g.gain.setTargetAtTime(0,t,.2);try{o.s.stop(t+1);}catch(_){}setTimeout(()=>{try{o.pn.disconnect();}catch(_){}},1500);}
    if(f.on)f.on.g.gain.setTargetAtTime(S.state==='play'||S.state==='view'||S.state==='ride'?f.gain:0,t,.3);}
  /* (the war far off is 09o's warscape now) */}
/* your kit when you run: buckles and magazines knocking, the webbing and cloth */
function gearFoley(v){if(!AC||!AUD.burst||v<2.2)return;const k=clamp((v-2.2)/3,0,1);
  for(let i=0;i<2;i++)AUD.burst(.012,.028*k*(.6+Math.random()*.6),3200+Math.random()*2400,0,'bandpass',9,i*.03+Math.random()*.02,AUD.master,.0006);
  AUD.burst(.13,.018*(.5+k),1500,700,'bandpass',.8,.01,AUD.master,.01);}
/* ---------- doors: the latch tongue clicking out of its keeper, then the hinge - a stick-slip creak, the pin dragging in
   a dry hinge as a train of tiny jerks whose rate wanders with the swing, ringing the door panel's resonances - and on
   closing the heavy board meeting the frame, the latch dropping. Each door a little different (its own pitch). ---------- */
const DOORSND={};
function doorSound(open,p,seed=1){if(!AC||!AUD.burst)return;const t0=AC.currentTime,out=p?AUD.pan(p,2.2,1.3,true,.45):AUD.master,q=rng(Math.floor(seed*997)+(open?1:2)+Math.floor(t0*7)),pitch=.85+((seed*37)%10)/30;
  const latch=(dl)=>{AUD.burst(.012,.22,3200*pitch,0,'bandpass',6,dl,out,.0005);AUD.burst(.02,.12,1500*pitch,0,'bandpass',4,dl+.012,out,.001);};
  const creak=(dl,len,up)=>{/* the stick-slip pulse train through the panel's resonances */
    const n=Math.floor(AC.sampleRate*len),b=AC.createBuffer(1,n,AC.sampleRate),d=b.getChannelData(0);let ph=0;
    for(let i=0;i<n;i++){const u=i/n,rate=(up?lerp(18,46,u):lerp(40,22,u))*(1+.35*Math.sin(u*9+q()*.01)+.2*Math.sin(u*31))*pitch;ph+=rate/AC.sampleRate;if(ph>=1){ph-=1;d[i]=.6+q()*.4;}else d[i]*=.0;}
    const src=AC.createBufferSource();src.buffer=b;const env=AC.createGain();env.gain.setValueAtTime(0,t0+dl);env.gain.linearRampToValueAtTime(.55,t0+dl+.06);env.gain.setValueAtTime(.55,t0+dl+len*.75);env.gain.linearRampToValueAtTime(0,t0+dl+len);
    for(const [f,Q,g] of [[620,14,.9],[1180,16,.7],[1960,18,.45],[2900,20,.25]]){const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f*pitch;bp.Q.value=Q;const gg=AC.createGain();gg.gain.value=g*.35;src.connect(bp).connect(gg).connect(env);}
    env.connect(out);src.start(t0+dl);src.stop(t0+dl+len+.05);setTimeout(()=>{try{env.disconnect();}catch(_){}},(dl+len+1)*1000);};
  if(open){latch(0);creak(.05,.75+q()*.4,true);AUD.burst(.25,.04,500,200,'lowpass',.7,.1,out,.03);}
  else{creak(0,.45+q()*.2,false);/* the slam: the board's thump, the frame's knock, the latch */AUD.burst(.18,.5,160,60,'lowpass',.9,.5,out,.002);AUD.tone(95*pitch,60,.16,.25,.5,out);AUD.burst(.04,.2,900,0,'bandpass',2,.5,out,.001);latch(.53);}}
/* footsteps: the recorded steps already vary per surface; on top of them each stride gets the small things that make a walk
   sound like a person in kit - left and right not quite alike, the odd scuff of the toe, a board that gives under you
   indoors, a twig in the grass, the suck of mud, the sling swivel and the magazines knocking now and then */
(function stepVariety(){const wrap=()=>{if(!sfx.step||sfx.step.__v)return false;const base=sfx.step;let lr=0;
    sfx.step=(s,v=2.6)=>{lr^=1;base(s,v*(lr?1:.92));if(!AC||!AUD.burst)return;const k=clamp(v/3,.45,1.35),r=Math.random();
      if(r<.18)AUD.burst(.07,.05*k,s==='asphalt'?2600:1800,900,'bandpass',1.2,.05,AUD.master,.01);/* toe scuff */
      if(s==='wood'&&Math.random()<.22){const o=AC.createOscillator(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime+.03;o.type='sawtooth';o.frequency.setValueAtTime(70+Math.random()*30,t);o.frequency.linearRampToValueAtTime(110+Math.random()*40,t+.22);f.type='bandpass';f.frequency.value=700;f.Q.value=6;g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.025,t+.04);g.gain.exponentialRampToValueAtTime(.0001,t+.26);o.connect(f).connect(g).connect(AUD.master);o.start(t);o.stop(t+.3);}
      if(s==='grass'&&Math.random()<.06){AUD.burst(.01,.18,3400,0,'bandpass',5,.04,AUD.master,.0004);AUD.burst(.015,.1,1800,0,'bandpass',4,.055,AUD.master,.0006);}
      if(s==='mud'&&Math.random()<.5)AUD.burst(.16,.06*k,500,1600,'lowpass',3,.16,AUD.master,.02);
      if(Math.random()<.3)AUD.burst(.01,.03*k,4200+Math.random()*1500,0,'bandpass',10,.02+Math.random()*.05,AUD.master,.0004);/* swivel / mag knock */};
    sfx.step.__v=true;return true;};
  const iv=setInterval(()=>{if(wrap())clearInterval(iv);},500);})();
/* the BTR moving: the diesel (above) plus what the running gear does - eight big tyres roaring on the road rising with
   speed, the drivetrain's whine, the hull creaking and the suspension knocking over the ruts */
const BTRSND={on:false};
function btrRunTick(dt){if(!AC||!A2.ready||!sfx.engine||!sfx.engineO)return;const t=AC.currentTime;
  if(!BTRSND.on){BTRSND.on=true;const nb=AUD.nb;const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const bp=AC.createBiquadFilter();bp.type='bandpass';bp.frequency.value=220;bp.Q.value=.7;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=900;
    const g=AC.createGain();g.gain.value=0;s.connect(bp).connect(lp).connect(g).connect(AUD.master);s.start();const o=AC.createOscillator();o.type='triangle';const ob=AC.createBiquadFilter();ob.type='bandpass';ob.frequency.value=400;ob.Q.value=3;const og=AC.createGain();og.gain.value=0;o.connect(ob).connect(og).connect(AUD.master);o.start();
    Object.assign(BTRSND,{g,bp,o,og,knock:0});}
  const spd=Math.max(0,(sfx.engineO.frequency.value-34)/2.4),eg=sfx.engine.gain.value,near=clamp(eg/.24,0,1);
  BTRSND.g.gain.setTargetAtTime(near*clamp(spd/14,0,1)*.22,t,.15);BTRSND.bp.frequency.setTargetAtTime(160+spd*9,t,.2);
  BTRSND.o.frequency.setTargetAtTime(120+spd*26,t,.2);BTRSND.og.gain.setTargetAtTime(near*clamp(spd/10,0,1)*.012,t,.2);
  BTRSND.knock-=dt*(spd/6);if(BTRSND.knock<=0&&spd>1.5&&near>.05){BTRSND.knock=.6+Math.random()*1.6;AUD.burst(.1,.12*near,140,50,'lowpass',.9,0,AUD.master,.003);if(Math.random()<.5)AUD.burst(.05,.05*near,1100,0,'bandpass',3,.04,AUD.master,.002);}}
