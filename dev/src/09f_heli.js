/* ---------- Hinds overhead: now and then one, or a pair, passes over going somewhere else - low over the trees or
   higher under the cloud, nose down at cruise, banking a little as it corrects its course. You hear it long before it
   comes out of the haze: the blade slap, then the turbines' whine as it nears, pitch falling as it goes past. Only in
   ordinary play: never in a ride, a cutscene, a fade or a card, a pause or the inventory; and not in the first minute
   after one of those. One pass is guaranteed over the forest on the way west. ---------- */
const HELI={list:[],next:150+Math.random()*120,calm:0,n:0,forest:false,bus:null};
/* the sound: two loops synthesised once - the rotor (blade slap at the five-blade passing rate, the low whop, the
   tail rotor's buzz, the broadband rush) and the turbines (whine, its harmonics, hiss) */
function heliBuffers(){if(HELI.buf||!AC)return HELI.buf;const sr=22050,n=sr*2,R0=AC.createBuffer(1,n,sr),T0=AC.createBuffer(1,n,sr);const r=R0.getChannelData(0),t=T0.getChannelData(0);
  let lp=0,lp2=0;const rnd_=rng(2424);
  for(let i=0;i<n;i++){const s=i/sr;const nz=rnd_()*2-1;lp+= (nz-lp)*.25;lp2+=(nz-lp2)*.06;
    const ph=(s*20)%1,dt=ph/20;const k=Math.floor(s*20);const amp=.85+.3*Math.sin(k*1.7)*Math.sin(k*.37);
    const slap=Math.exp(-dt/.0045)*nz*.8*amp,whop=Math.exp(-dt/.03)*Math.sin(2*Math.PI*48*dt)*1.1*amp,tail=((s*55)%1-.5)*.12+Math.sin(2*Math.PI*110*s)*.05;
    r[i]=slap+whop+tail+lp2*.55+lp*.12;}
  for(let i=0;i<n;i++){const s=i/sr;const nz=rnd_()*2-1;const fm=Math.sin(2*Math.PI*.5*s)*6;
    t[i]=Math.sin(2*Math.PI*(2240*s+fm))*.18+Math.sin(2*Math.PI*(4480*s+fm*2))*.08+Math.sin(2*Math.PI*(5810*s))*.12+Math.sin(2*Math.PI*(6720*s+fm*3))*.05+nz*.1;}
  /* (normalise) */[r,t].forEach(a=>{let m=0;for(let i=0;i<n;i++)m=Math.max(m,Math.abs(a[i]));for(let i=0;i<n;i++)a[i]/=m||1;});
  return HELI.buf={r:R0,t:T0};}
function heliSound(h){if(!AC||!heliBuffers())return null;if(!HELI.bus){HELI.bus=AC.createGain();HELI.bus.gain.value=1;HELI.bus.connect(AUD.master);}
  const pn=AC.createPanner();pn.panningModel='HRTF';pn.distanceModel='inverse';pn.refDistance=55;pn.rolloffFactor=1;pn.maxDistance=8000;
  const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=2000;lp.Q.value=.5;lp.connect(pn);pn.connect(HELI.bus);const w=AC.createGain();w.gain.value=.35;pn.connect(w);w.connect(AUD.send);
  const mk=(b,g0)=>{const s=AC.createBufferSource();s.buffer=b;s.loop=true;const g=AC.createGain();g.gain.value=0;s.connect(g).connect(lp);s.start(0,Math.random()*1.9);return{s,g,g0};};
  return{pn,lp,rot:mk(HELI.buf.r,1.7),tur:mk(HELI.buf.t,.55)};}
function heliSoundStop(S_){if(!S_)return;try{[S_.rot,S_.tur].forEach(x=>{x.g.gain.setTargetAtTime(0,AC.currentTime,.3);x.s.stop(AC.currentTime+1.5);});setTimeout(()=>{try{S_.pn.disconnect();}catch(_){}},2000);}catch(_){}}
/* how much of the screen is covered by something that is not play: a fade, a chapter card, the menu, death */
function heliCover(){if(S.state==='dead'||S.state==='load'||S.state==='view')return 1;const f=$('fade');let k=f?(parseFloat(f.style.opacity)||0):0;const c=$('card');if(c&&c.classList.contains('on'))k=1;return k;}
const heliRide=()=>S.state==='ride'||(typeof RIDE!=='undefined'&&RIDE.on);
/* when one may set out: plain play, nothing over the screen, nobody mid-sentence (the letterbox of a spoken line) */
function heliOK(){if(S.state!=='play'||heliRide()||heliCover()>.04)return false;const b=$('bars');if(b&&(parseFloat(b.style.opacity)||0)>.04)return false;return true;}
/* a flight: from far off, past the player at an offset, on to far off the other side; a wingman sometimes */
function heliSpawn(o={}){const pp=player.pos;const hd=o.hd!==undefined?o.hd:Math.random()*Math.PI*2;const dir=V3(Math.sin(hd),0,Math.cos(hd)),side=V3(dir.z,0,-dir.x);
  const off=o.off!==undefined?o.off:(Math.random()<.25?(Math.random()-.5)*40:(Math.random()<.5?-1:1)*(60+Math.random()*190));const L=1500;
  let gmax=-1e9;for(let s=-L;s<=L;s+=40){const x=pp.x+side.x*off+dir.x*s,z=pp.z+side.z*off+dir.z*s;gmax=Math.max(gmax,H(x,z));}
  const alt=o.alt!==undefined?o.alt:(Math.random()<.3?40+Math.random()*12:60+Math.random()*80);const y=Math.max(H(pp.x,pp.z)+alt,gmax+32);
  const sp=o.sp||38+Math.random()*8,yr=o.yr!==undefined?o.yr:(Math.random()-.5)*.012;const pair=o.pair!==undefined?o.pair:Math.random()<.45;
  const mk=(dx,dz,dy,lag)=>{const g=HIND.make();g.userData.keep=true;scene.add(g);const p=V3(pp.x+side.x*off-dir.x*L,y,pp.z+side.z*off-dir.z*L).addScaledVector(side,dx).addScaledVector(dir,dz).add(V3(0,dy,0));
    const h={g,p,yaw:hd,yr,sp,t:0,L:2*L+300,ang:Math.random()*6,tang:0,bob:Math.random()*6,lead:!lag,snd:heliSound(null)};h.g.position.copy(p);HELI.list.push(h);return h;};
  mk(0,0,0,false);if(pair)mk(-38,-60,9,true);HELI.n++;HELI.next=200+Math.random()*220;}
function heliRemove(h){heliSoundStop(h.snd);scene.remove(h.g);const i=HELI.list.indexOf(h);if(i>=0)HELI.list.splice(i,1);}
const _hlv=V3(),_hlf=new T.Frustum(),_hlm=new T.Matrix4();
function heliTick(dt){const cover=heliCover(),ride=heliRide();
  /* pauses freeze it (and quiet it); plain play moves it on */
  if(HELI.bus&&AC)HELI.bus.gain.setTargetAtTime(S.state==='play'&&cover<.5?1:0,AC.currentTime,.15);
  if(!HELI.list.length){if(S.state!=='play'||ride||cover>.04){HELI.calm=0;return;}HELI.calm+=dt;if(!heliOK())return;
    /* the guaranteed pass over the forest on the way west: a pair, low, heading on west */
    if(HELI.calm>12&&S.chapter===3&&!HELI.forest&&player.pos.x<-345&&player.pos.x>-450&&typeof CH3!=='undefined'&&CH3.stage>=1&&CH3.stage<=3){HELI.forest=true;
      heliSpawn({hd:-Math.PI/2+(Math.random()-.5)*.5,off:(Math.random()<.5?-1:1)*(25+Math.random()*40),alt:42,pair:true,sp:36,yr:0});
      HELI.say=S.t+9;return;}
    if(HELI.calm<60)return;HELI.next-=dt;if(HELI.next<=0)heliSpawn();return;}
  /* the screen covered (a fade, a card, death, the menu): gone, unseen. In a pause or the inventory: held where it is */
  if(cover>.6){for(const h of HELI.list.slice())heliRemove(h);return;}
  if(S.state!=='play'&&S.state!=='ride')return;
  if(HELI.say&&S.t>HELI.say&&typeof CH3!=='undefined'){HELI.say=0;if(CH3.q.length<2)ch3Say([['CAPTAIN MOROZOV','Ours. Going west, low under the cloud.',2.8],['CAPTAIN MOROZOV','Whatever they are going to, we will hear it.',3]]);}
  _hlm.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_hlf.setFromProjectionMatrix(_hlm);
  const cp=camera.position;
  for(const h of HELI.list.slice()){
    /* a ride or a cutscene began: it goes as soon as it is off the screen */
    if(ride||cover>.04){h.gone=(h.gone||0)+dt;_hlv.copy(h.p);if(!_hlf.containsPoint(_hlv)||h.gone>8){heliRemove(h);continue;}}
    h.t+=dt;h.yaw+=h.yr*dt;const dir=V3(Math.sin(h.yaw),0,Math.cos(h.yaw));const v=dir.clone().multiplyScalar(h.sp);h.p.addScaledVector(v,dt);
    h.bob+=dt;const bank=Math.atan(h.sp*h.yr/9.8)+Math.sin(h.bob*.6)*.025,pitch=.1+Math.sin(h.bob*.45+1)*.015;
    h.g.position.set(h.p.x,h.p.y+Math.sin(h.bob*.5)*.6,h.p.z);h.g.rotation.set(pitch,h.yaw,bank,'YXZ');
    h.ang+=dt*25.1;h.tang+=dt*115;HIND.spin(h.g,h.ang,h.tang,1);
    /* the sound follows it, Doppler-shifted, darker with distance; the turbines only close in */
    const d=h.p.distanceTo(cp);
    if(h.snd){const S_=h.snd,tA=AC.currentTime;if(S_.pn.positionX){S_.pn.positionX.setTargetAtTime(h.p.x,tA,.03);S_.pn.positionY.setTargetAtTime(h.p.y,tA,.03);S_.pn.positionZ.setTargetAtTime(h.p.z,tA,.03);}else S_.pn.setPosition(h.p.x,h.p.y,h.p.z);
      const rv=v.dot(_hlv.copy(h.p).sub(cp).normalize()),dop=343/(343+rv);S_.rot.s.playbackRate.setTargetAtTime(dop,tA,.05);S_.tur.s.playbackRate.setTargetAtTime(dop,tA,.05);
      const edge=Math.min(1,h.t/6,(h.L-h.t*h.sp)/250);const fadeIn=clamp(edge,0,1);
      S_.rot.g.gain.setTargetAtTime(S_.rot.g0*fadeIn,tA,.2);S_.tur.g.gain.setTargetAtTime(S_.tur.g0*fadeIn*Math.pow(clamp(1-d/650,0,1),1.6),tA,.2);
      S_.lp.frequency.setTargetAtTime(lerp(9000,700,Math.pow(clamp(d/1300,0,1),.6)),tA,.1);if(d<400)AUD.lastGun=Math.max(AUD.lastGun,S.t-30);}
    if(h.t*h.sp>h.L)heliRemove(h);}}
/* built at boot: its materials compiled now (with the weather terms), not the first time one comes over */
{const g=HIND.make();g.traverse(o=>{if(o.isMesh)(Array.isArray(o.material)?o.material:[o.material]).forEach(m=>{if(typeof wetWrap==='function')wetWrap(m);});});
 HIND.air.traverse(o=>{if(o.isMesh&&typeof wetWrap==='function')wetWrap(o.material);});
 g.position.copy(camera.position).add(V3(0,-30,0));scene.add(g);try{renderer.compile(scene,camera);}catch(_){}scene.remove(g);}
/* for the renders: put one where it is wanted, sharp blades or blurred */
window.__hind={HIND,HELI,spawn:heliSpawn,remove:heliRemove,place(x,y,z,yaw=0,pitch=0,bank=0,blur=0,ang=0){const g=HIND.make();g.position.set(x,y,z);g.rotation.set(pitch,yaw,bank,'YXZ');HIND.spin(g,ang,ang*4,blur);scene.add(g);return g;}};
