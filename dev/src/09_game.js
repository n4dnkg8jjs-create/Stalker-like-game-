/* ---------- items ---------- */
const ITEMS={
  pm:{name:'PM Makarov',kind:'weapon',w:.73,desc:'9×18mm service pistol, 8-round magazine. Issued to every contract soldier in the detachment. Reliable, weak.',ico:'pm'},
  ak:{name:'AK-74M',kind:'weapon',w:3.6,desc:'Standard-issue AK-74M: black polymer furniture, side-folding stock, two-chamber muzzle brake. Scuffed, but it cycles. 30-round magazine.',ico:'ak'},
  ammo918:{name:'9×18mm PM',kind:'ammo',ammo:'9x18',count:16,w:.16,desc:'Paper box of 16 rounds, 9×18 PM.',ico:'box'},
  ammo545:{name:'5.45×39mm 7N6',kind:'ammo',ammo:'5.45x39',count:30,w:.33,desc:'A paper pack of 30 rounds of 5.45×39 7N6, steel core.',ico:'box'},
  bandage:{name:'Field dressing IPP-1',kind:'use',w:.1,desc:'Individual dressing packet. Restores 35 health.',ico:'band',use(){S.hp=clamp(S.hp+35,0,100);}},
  antirad:{name:'Radioprotector (AI-2)',kind:'use',w:.05,desc:'Orange AI-2 kit: cystamine and potassium iodide. Clears 2.0 mSv of absorbed dose.',ico:'pill',use(){S.dose=Math.max(0,S.dose-2);}},
  vodka:{name:'Vodka "Stolichnaya"',kind:'use',w:.6,desc:'Half a bottle. The Zone\'s folk remedy: −0.8 mSv dose, +15 sanity, worse aim for a minute.',ico:'vod',use(){S.dose=Math.max(0,S.dose-.8);S.sanity=clamp(S.sanity+15,0,100);S.drunk=60;}},
  cigs:{name:'Cigarettes «Polevye»',kind:'use',keep:true,w:.05,desc:'A soft flip-top pack of filter cigarettes and a cheap gas lighter tucked in with it. Smoke one: G, or use it here. Each one +12 sanity, −1 health.',ico:'cig',use(){ACT.smoke();}},
  tushonka:{name:'Tushonka (stewed beef)',kind:'use',w:.35,desc:'Canned stewed beef, army reserve, 2019. Restores 15 health, +5 sanity.',ico:'can',use(){S.hp=clamp(S.hp+15,0,100);S.sanity=clamp(S.sanity+5,0,100);}},
  helm:{name:'6B47 Helmet',kind:'helmet',w:1.1,desc:'Ratnik aramid helmet with EMR cover, NVG shroud and side rails.',ico:'helm'},
  vest:{name:'6B45 Plate Carrier',kind:'vest',w:7.5,desc:'Ratnik general-purpose body armour with ceramic plates front and back. Cuts incoming damage by 40%.',ico:'vest'},
  emr:{name:'VKPO Field Uniform',kind:'outfit',w:1.6,desc:'All-season field uniform in EMR digital camouflage, knee and elbow pads fitted.',ico:'emr'},
  kobra:{name:'Kobra EKP-8-18 sight',kind:'optic',w:.24,desc:'Collimator sight for the AK on its side-rail mount: a red chevron on the glass, brightness on the dial. Fast to pick up, no magnification. Taken off a separatist\'s crate.',ico:'kobra'},
  mag545:{name:'AK-74 magazine, loaded',kind:'ammo',ammo:'5.45x39',count:30,w:.45,desc:'An old plum-bakelite 30-round magazine, full of 7N6. The rounds go into your reserve.',ico:'mag'},
  pbs:{name:'PBS-4 Suppressor',kind:'attach',w:.5,desc:'Suppressor for the AK-74 family. The wipes are shot out, but it still takes the edge off the report.',ico:'pbs'},
  dkg:{name:'DKG-RM1203 Dosimeter',kind:'detector',w:.2,desc:'Personal gamma dosimeter clipped to the vest. Clicks with the counts.',ico:'dkg'}};
/* printed tops for the small packets: IPP-1 dressing, AI-2 kit, Belomorkanal papirosy */
const LBLT={};
function lbl(par,k,w,d,y){const t=LBLT[k]||(LBLT[k]=tex(256,160,(c,W,H)=>{
    if(k==='bandage'){c.fillStyle='#6f6a4c';c.fillRect(0,0,W,H);c.fillStyle='#1d1c14';c.font='bold 21px sans-serif';c.textAlign='center';c.fillText('ПАКЕТ',W/2,44);c.fillText('ПЕРЕВЯЗОЧНЫЙ',W/2,70);c.font='15px sans-serif';c.fillText('ИНДИВИДУАЛЬНЫЙ',W/2,94);
      c.fillStyle='#8a1c16';c.fillRect(W/2-9,108,18,40);c.fillRect(W/2-20,119,40,18);c.fillStyle='#1d1c14';c.font='12px monospace';c.fillText('ИПП-1  2019',W/2,H-3);}
    else if(k==='antirad'){c.fillStyle='#e0661c';c.fillRect(0,0,W,H);c.fillStyle='#f4efe2';c.fillRect(16,18,W-32,H-36);c.fillStyle='#202020';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText('АИ-2',W/2,74);
      c.font='14px sans-serif';c.fillText('АПТЕЧКА ИНДИВИДУАЛЬНАЯ',W/2,102);c.fillStyle='#b8161a';c.fillRect(W/2-6,112,12,26);c.fillRect(W/2-13,119,26,12);}
    else{c.fillStyle='#e8e6dc';c.fillRect(0,0,W,H);c.fillStyle='#3d6fa0';c.beginPath();c.moveTo(0,64);for(let x=0;x<=W;x+=16)c.lineTo(x,64+Math.sin(x*.05)*10+Math.sin(x*.13)*5);c.lineTo(W,H);c.lineTo(0,H);c.fill();
      c.fillStyle='#2b5582';c.fillRect(0,112,W,48);c.fillStyle='#f2f0e8';c.font='bold 26px serif';c.textAlign='center';c.fillText('БЕЛОМОРКАНАЛ',W/2,146);c.fillStyle='#1f3d5c';c.font='13px serif';c.fillText('папиросы  ·  25 шт',W/2,34);}
  },{}));t.anisotropy=4;const m=mesh(new T.PlaneGeometry(w,d),std({map:t,roughness:.8}),0,y,0,par,false);m.rotation.x=-Math.PI/2;return m;}
function itemMesh(id){const g=new T.Group();
  switch(id){case 'ak':g.add(npcAK());break;case 'pm':g.add(buildPM());break;
    case 'ammo918':mesh(rbox(.075,.035,.05,.004),M.ammo918,0,0,0,g);break;case 'ammo545':mesh(rbox(.1,.045,.06,.005),M.ammo545,0,0,0,g);break;
    case 'bandage':mesh(rbox(.11,.03,.07,.01),std({color:C(0x6f6a4c),roughness:.85}),0,0,0,g);lbl(g,'bandage',.1,.062,.0152);break;
    case 'antirad':mesh(rbox(.09,.022,.11,.006),M.orange,0,0,0,g);lbl(g,'antirad',.078,.098,.0112);break;
    case 'vodka':mesh(lathe([[0,0],[.038,0],[.04,.01],[.04,.18],[.03,.22],[.014,.25],[.014,.3],[0,.3]],16),M.bottle,0,0,0,g);mesh(new T.CylinderGeometry(.0405,.0405,.08,16,1,true),M.label,0,.1,0,g);break;
    case 'cigs':{const pk=PACK.build(0);pk.rotation.x=-Math.PI/2;pk.position.y=PACK.D/2;g.add(pk);break;}
    case 'tushonka':mesh(new T.CylinderGeometry(.05,.05,.075,18),M.tushonka,0,0,0,g);break;
    case 'kobra':g.add(kobraModel());break;case 'mag545':g.add(akMag());break;
    case 'pbs':mesh(xf(new T.CylinderGeometry(.019,.019,.19,14),0,0,0,0,0,Math.PI/2),M.black,0,0,0,g);break;}
  g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});return g;}
const worldItems=[];
function placeItem(L){const m=iconMesh(L.id);if(L.rot)m.rotation.set(L.rot[0],L.rot[1],L.rot[2],L.order||'XYZ');else m.rotation.y=rnd(6.28);m.position.set(L.x,0,L.z);scene.add(m);
  m.updateWorldMatrix(true,true);const b=new T.Box3().setFromObject(m);m.position.y=L.y-b.min.y+.002;
  const it={id:L.id,mesh:m,L};worldItems.push(it);
  const e={obj:m,off:V3(),label:'Take '+ITEMS[L.id].name,r:1.8,L,fn(){if(giveItem(L.id,L.data)){scene.remove(m);interact.splice(interact.indexOf(e),1);const wi=worldItems.indexOf(it);if(wi>=0)worldItems.splice(wi,1);sfx.pick();
    if(L.dropped){const k=(S.dropped||[]).indexOf(L);if(k>=0)S.dropped.splice(k,1);}else(S.taken||(S.taken=[])).push(lootKey(L));}else toast('Backpack is full.');}};interact.push(e);}
function lootKey(L){return L.id+'@'+L.x.toFixed(1)+','+L.z.toFixed(1);}
[[-20,-290],[70,-412],[10,-330],[-48,-342],[HX+3,HZ+7.5],[-32,-312]].forEach((p,i)=>LOOT.push({id:i===3?'bandage':i===5?'antirad':'ammo918',x:p[0],y:H(p[0],p[1]),z:p[1]}));
LOOT.push({id:'ammo918',x:31.2,y:1.3,z:20.1},{id:'bandage',x:-15,y:1.12,z:-27},{id:'ammo918',x:-20,y:0,z:-24.5});
LOOT.forEach(placeItem);

/* ---------- state ---------- */
Object.assign(S,{state:'boot',hp:100,sanity:100,stam:100,dose:0,rate:.12,drunk:0,flash:false,t:0,ordersRead:false,searched:false,
  equip:{weapon:{id:'pm',inMag:8},helmet:{id:'helm'},vest:{id:'vest'},outfit:{id:'emr'},attach:null,detector:{id:'dkg'},optic:null},
  bag:[{id:'bandage'},{id:'tushonka'}],ammo:{'9x18':0,'5.45x39':0},reloading:0,fire:0,ads:false,sinceDmg:99,sens:1,where:'fob'});
const BAGMAX=20;
function bagWeight(){let w=0;S.bag.forEach(i=>w+=ITEMS[i.id].w);Object.values(S.equip).forEach(e=>{if(e)w+=ITEMS[e.id].w;});return w;}
function giveItem(id,data){const d=ITEMS[id];if(d.kind==='ammo'){S.ammo[d.ammo]+=d.count;toast(`+${d.count} × ${d.name}`);return true;}if(S.bag.length>=BAGMAX)return false;S.bag.push(data||(d.kind==='weapon'?{id,inMag:id==='ak'?7:0}:{id}));toast('Taken: '+d.name);return true;}
function searchSoldier(){if(S.searched)return;S.searched=true;setTimeout(()=>{if(S.chapter!==2)say('RADIO · BOARD 121','121 to the house. Kurgan is on the net for us. Get back to the vehicle, now.',5.5);},5200);S.ammo['9x18']+=16;S.sanity=clamp(S.sanity-12,0,100);
  say('DOG TAG','Jr. Sgt. A. Volkov, patrol 3. Sixteen rounds of 9×18 in his pouch. Two men still unaccounted for.',6);setObj('Return to BTR «121» at the road. Two of the patrol are still missing.');setTimeout(()=>saveGame(false),600);}

/* ---------- player ---------- */
const player={pos:V3(0,0,10),vel:V3(),yaw:Math.PI,pitch:0,y:0,crouch:0,ph:0,bobA:0,lean:0,lastStep:0,fovK:0};
const keys={};let mdx=0,mdy=0;
addEventListener('keydown',e=>{if(e.code==='Tab'){e.preventDefault();if(S.state==='play'||S.state==='inv')toggleInv();return;}keys[e.code]=true;
  if(S.state!=='play')return;if(e.code==='KeyG')ACT.smoke();if(e.code==='KeyQ')S.ads=true;if(e.code==='KeyR')reload();if(e.code==='KeyF'){S.flash=!S.flash;sfx.click();}if(e.code==='KeyE')doInteract();});
addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyQ')S.ads=false;});
addEventListener('blur',()=>{for(const k in keys)keys[k]=false;S.fire=0;S.ads=false;});
canvas.addEventListener('mousedown',e=>{if(AC&&AC.state==='suspended'&&!window.__ffw)try{AC.resume();}catch(_){}if(S.state==='ride'){if(document.pointerLockElement!==canvas)lockPointer();return;}if(S.state!=='play')return;if(document.pointerLockElement!==canvas){lockPointer();return;}if(e.button===0)S.fire=1;if(e.button===2)S.ads=true;});
addEventListener('mouseup',e=>{if(e.button===0)S.fire=0;if(e.button===2)S.ads=false;});
addEventListener('contextmenu',e=>e.preventDefault());
addEventListener('mousemove',e=>{if(S.state==='ride'&&document.pointerLockElement===canvas&&!RIDE.lockLook){const s=.0021*S.sens;RIDE.fy=clamp((RIDE.fy||0)-e.movementX*s,-2.1,2.1);RIDE.fp=clamp((RIDE.fp||0)-e.movementY*s,-.7,.6);RIDE.fq=0;return;}
  if(S.state!=='play'||document.pointerLockElement!==canvas)return;const s=.0021*S.sens*(S.ads?.55:1);player.yaw-=e.movementX*s;player.pitch=clamp(player.pitch-e.movementY*s,-1.5,1.5);mdx+=e.movementX;mdy+=e.movementY;});
function lockPointer(){try{const p=canvas.requestPointerLock();if(p&&p.catch)p.catch(()=>{});}catch(_){}}
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement!==canvas&&S.state==='play'){S.state='paused';$('pause').classList.remove('off');S.fire=0;S.ads=false;}});
function resume(){S.state='play';$('pause').classList.add('off');lockPointer();}
$('resume').onclick=resume;
function inHouse(x,z){for(const b of HOUSES)if(x>b.x1&&x<b.x2&&z>b.z1&&z<b.z2)return true;return false;}
function groundY(x,z){if(inHouse(x,z))return FL+.03;for(const p of PORCHES)if(x>p.x1&&x<p.x2&&z>p.z1&&z<p.z2)return p.y;if(x>HX-1.4&&x<HX+.5&&z>HOUSE.z2&&z<HOUSE.z2+1.45)return FL;if(x>HX-1.4&&x<HX+.5&&z>=HOUSE.z2+1.45&&z<HOUSE.z2+1.75)return FL*.5;return H(x,z);}
function collide(p,r){for(const s of solids){if(s.r!==undefined){const dx=p.x-s.cx,dz=p.z-s.cz,d=Math.hypot(dx,dz);if(d<s.r+r&&d>1e-6){p.x=s.cx+dx/d*(s.r+r);p.z=s.cz+dz/d*(s.r+r);}continue;}
    if(S.door&&s===S.door.solid&&S.door.open)continue;if(s.door&&s.door.open)continue;
    if(p.x>s.x1-r&&p.x<s.x2+r&&p.z>s.z1-r&&p.z<s.z2+r){const a=p.x-(s.x1-r),b=(s.x2+r)-p.x,c=p.z-(s.z1-r),d=(s.z2+r)-p.z;const m=Math.min(a,b,c,d);
      if(m===a)p.x=s.x1-r;else if(m===b)p.x=s.x2+r;else if(m===c)p.z=s.z1-r;else p.z=s.z2+r;}}}
const fwd=V3(),rgt=V3(),wish=V3();
function movePlayer(dt){if(ACT.move(dt))return;
  const f=(keys.KeyW?1:0)-(keys.KeyS?1:0),r=(keys.KeyD?1:0)-(keys.KeyA?1:0);
  player.crouch=damp(player.crouch,keys.KeyC?1:0,10,dt);
  const sprint=keys.ShiftLeft&&f>0&&S.stam>3&&!S.ads&&player.crouch<.4&&S.reloading<=0&&!ACT.noSprint();
  let sp=sprint?5.3:lerp(2.8,1.4,player.crouch);if(S.ads)sp*=.55;if(S.wade>0)sp*=lerp(1,.32,clamp(S.wade/.9,0,1));if(S.deepW)sp=Math.min(sp,.75);if(S.held)sp*=.2;if(S.hp<30)sp*=.8;if(bagWeight()>35)sp*=.8;sp*=ACT.spd();
  fwd.set(-Math.sin(player.yaw),0,-Math.cos(player.yaw));rgt.set(-fwd.z,0,fwd.x);
  wish.set(0,0,0).addScaledVector(fwd,f).addScaledVector(rgt,r);if(wish.lengthSq()>0)wish.normalize().multiplyScalar(sp);
  const k=wish.lengthSq()>0?8:10;player.vel.x=damp(player.vel.x,wish.x,k,dt);player.vel.z=damp(player.vel.z,wish.z,k,dt);
  player.pos.addScaledVector(player.vel,dt);collide(player.pos,.3);
  /* in a crayfish's claw: you go where it takes you */
  if(S.held){player.pos.x=damp(player.pos.x,S.held.x,9,dt);player.pos.z=damp(player.pos.z,S.held.z,9,dt);player.vel.multiplyScalar(.2);}
  /* (the country west of the yard opens once the yard is taken) */const wOpen=S.chapter===3&&CH3.stage>=8;
  /* before the reinforcement ride the world is only where the orders are: inside the F.O.B.'s walls (the BTR takes you
     out), and in Sector 1 the village and its fields round the drop point - walk to the edge and you are turned back */
  if(S.chapter<2&&!RIDE.on){const Z=S.where==='sector'?[[-30,214,-472,-236]]:[[-40.2,40.2,-31.6,31.6]];let inside=false,bx=0,bz=0,bd=1e9;
    for(const [x0,x1,z0,z1] of Z){if(player.pos.x>=x0&&player.pos.x<=x1&&player.pos.z>=z0&&player.pos.z<=z1){inside=true;break;}const cx=clamp(player.pos.x,x0,x1),cz=clamp(player.pos.z,z0,z1),d=Math.hypot(cx-player.pos.x,cz-player.pos.z);if(d<bd){bd=d;bx=cx;bz=cz;}}
    if(!inside){player.pos.x=bx;player.pos.z=bz;player.vel.multiplyScalar(.3);if(S.t-(S.borderT||-99)>5){S.borderT=S.t;toast(S.where==='sector'?'No further - your orders are the village and the house.':'The gate stays shut. The BTR takes you out.');}}}
  player.pos.x=clamp(player.pos.x,wOpen?WX.end:-893,S.xMax||340);if(player.pos.x<-905)player.pos.z=clamp(player.pos.z,WX.box.z0+30,WX.box.z1-30);else player.pos.z=clamp(player.pos.z,player.pos.x<-330?-600:-560,player.pos.x<-330?-150:280);
  /* wading: the water drags at the legs, more the deeper it gets; deeper than the chest it will not let you through */
  {const dp=inDET(player.pos.x,player.pos.z)?W3.wl-groundY(player.pos.x,player.pos.z):-1;if(dp>0){S.wade=Math.min(dp,1.3);}else S.wade=0;S.deepW=dp>1.3;}
  const v=Math.hypot(player.vel.x,player.vel.z);
  player.stride=damp(player.stride||.78,sprint?1.05:.78,5,dt);player.ph+=v*dt/player.stride*Math.PI;
  const step=Math.floor(player.ph/Math.PI);if(step!==player.lastStep){player.lastStep=step;if(v>.6){if(S.wade>.03&&sfx.splash){sfx.splash(.4+S.wade);WATER.ring(player.pos.x,player.pos.z,.5+S.wade);if(S.wade>.25&&v>2)WATER.splash(V3(player.pos.x,0,player.pos.z),.25);}else sfx.step(surface(),v);gearFoley(v);}}
  player.bobA=damp(player.bobA,clamp(v/2.8,0,1.6),8,dt);
  if(sprint&&v>1)S.stam=Math.max(0,S.stam-dt*10);else S.stam=Math.min(100,S.stam+dt*(v<.3?12:6));
  /* (where it is deeper than the chest you are half swimming, half pulling yourself through the reeds: the head stays up) */
  player.y=damp(player.y,S.deepW?W3.wl-1.3:groundY(player.pos.x,player.pos.z),S.deepW?4:14,dt);
  player.lean=damp(player.lean,-r*.012-mdx*.00004,6,dt);
  player.fovK=damp(player.fovK,sprint&&v>3?1:0,5,dt);
  const eye=lerp(1.64,1.05,player.crouch)-(ACT.eyeDrop||0);const A=player.bobA;
  const bobV=(sabs(Math.cos(player.ph))-.6)*.045*A;const bobL=Math.sin(player.ph)*.028*A;
  camera.position.set(player.pos.x+rgt.x*bobL,player.y+eye+bobV,player.pos.z+rgt.z*bobL);
  camera.rotation.set(player.pitch-(ACT.look||0)+sabs(Math.sin(player.ph))*.006*A,player.yaw,player.lean+Math.sin(player.ph)*.005*A+(S.sanity<35?Math.sin(S.t*.7)*.012*(1-S.sanity/35):0));
  GRASS.uni.uPlayer.value.set(player.pos.x,player.y,player.pos.z);
  /* the trail through the grass: a point every ~30 cm while moving, with when and how hard you went through */
  {const T_=GRASS.uni.uTrail.value,G=GRASS;const l=G.tl||(G.tl={x:1e9,z:0,k:0});if(Math.hypot(player.pos.x-l.x,player.pos.z-l.z)>.3&&v>.4){l.x=player.pos.x;l.z=player.pos.z;T_[l.k].set(l.x,l.z,S.t,clamp(v/3,.35,1.3));l.k=(l.k+1)%8;}}
  playerBody.root.position.set(player.pos.x,player.y,player.pos.z);playerBody.root.rotation.y=player.yaw+Math.PI;playerBody.root.scale.y=lerp(1,.66,player.crouch);
  const fv=(player.vel.x*fwd.x+player.vel.z*fwd.z)/Math.max(v,.01);gait(dt,v,player.ph*(fv<-.3?-1:1),sprint&&v>3,player.crouch);}
/* player body gait (seen in its shadow): proper walking / running cycle built from gait curves - hip flexion leading
   the swing, knee loading bump after heel strike and a big swing-phase bend, toe-off push, pelvis rotation and drop,
   vertical bob, counter-rotating torso, opposite arm swing with more elbow bend when running. Everything is blended
   by a smoothed speed so starts and stops ease in, and it settles into a natural relaxed stance when still. */
const GAIT={a:0,run:0,t:0,var:1};
/* gait curves over one stride cycle (0 = heel strike of that leg), from motion-capture style references:
   hip flexion (negative = thigh forward), knee flexion, and foot pitch relative to the ground (+ = toes down).
   The foot pitch is what makes the boot roll: toes up at heel strike, flat through stance, heel lifting and toes
   pushing down at toe-off, then the foot dorsiflexing back up through the swing. */
const GK={
  walk:{hip:[[0,-.4],[.15,-.3],[.5,.2],[.6,.24],[.75,-.02],[.88,-.38]],
        knee:[[0,.05],[.12,.3],[.3,.08],[.45,.06],[.58,.45],[.72,1.05],[.85,.55],[.95,.07]],
        foot:[[0,-.24],[.08,0],[.42,0],[.5,.14],[.6,.6],[.68,.4],[.8,-.02],[.93,-.24]]},
  run:{hip:[[0,-.6],[.18,-.05],[.36,.44],[.48,.32],[.66,-.4],[.82,-.88],[.93,-.78]],
        knee:[[0,.32],[.12,.62],[.28,.38],[.38,.28],[.55,1.3],[.68,1.75],[.84,.95],[.95,.4]],
        foot:[[0,-.08],[.1,.06],[.26,.18],[.37,.88],[.5,.95],[.64,.4],[.84,-.22],[.95,-.16]]}};
/* periodic smooth interpolation of [u,v] keys: a cubic Hermite spline whose tangents respect the real spacing of the keys
   in the stride (uniform Catmull-Rom on unevenly spaced keys put a jolt in the motion at every key), baked once per
   curve into a 512-step table and read with a linear lerp - smooth to the eye, and cheap */
function gkeyBake(k){const n=k.length,N=512,L=new Float32Array(N+1);const U=i=>k[((i%n)+n)%n][0]+Math.floor(i/n),P=i=>k[((i%n)+n)%n][1];
  const m=i=>(P(i+1)-P(i-1))/Math.max(1e-4,U(i+1)-U(i-1));
  for(let s=0;s<=N;s++){const u=s/N;let i=n-1;for(let j=0;j<n;j++)if(k[j][0]<=u)i=j;if(u<k[0][0])i=-1;const u1=U(i),u2=U(i+1),h=Math.max(1e-4,u2-u1),t=(u-u1)/h,t2=t*t,t3=t2*t;
    L[s]=(2*t3-3*t2+1)*P(i)+(t3-2*t2+t)*h*m(i)+(-2*t3+3*t2)*P(i+1)+(t3-t2)*h*m(i+1);}
  return L;}
function gkey(k,u){const L=k._lut||(k._lut=gkeyBake(k));u=((u%1)+1)%1;const f=u*512,i=f|0;return L[i]+(L[i+1]-L[i])*(f-i);}
/* a softened |x|: the head's and the gun's bob keep the firm footfall but lose the sharp jolt |cos| has at the bottom */
const sabs=x=>(Math.sqrt(x*x+.04)-.2)/.8198;
function gait(dt,v,ph,run,crouch){gaitPose(playerBody.P.bones,GAIT,dt,v,ph,run,crouch);}
function gaitPose(B,G,dt,v,ph,run,crouch){G.a=damp(G.a,clamp(v/2.6,0,1),7,dt);G.run=damp(G.run,run?1:0,4,dt);const a=G.a,rn=G.run;G.t+=dt;
  /* stride-to-stride variation so no two steps are identical */
  const vr=1+.06*Math.sin(G.t*.83)+.04*Math.sin(G.t*2.17+1.3);
  const cyc=x=>x/(Math.PI*2);const hx=lerp(0,.1,rn)*a+crouch*.05;
  const leg=(sd,phi)=>{const u=cyc(phi);const W=GK.walk,Rn=GK.run;const mix=(k)=>lerp(gkey(W[k],u),gkey(Rn[k],u),rn);
    /* the rig's rest pose has the thigh slanted back ~.24 rad with the knee locked; -.24 / +.24 straightens it */
    const hip=mix('hip')*a*vr-.24-.05*(1-a)-crouch*.8,knee=.24+.06*(1-a)+mix('knee')*a*vr+crouch*.9,pitch=mix('foot')*a;
    /* the rest pose is also splayed and bow-legged: hip rolled in .19 and knee rolled back out .19 stacks knee and ankle
       straight under the hip joint (feet about hip-width); in the stride the swing leg comes slightly toward the midline */
    const sg=sd==='L'?1:-1;
    B['hp'+sd].rotation.set(hip,sg*.04*a,sg*.19-sg*.03*a*Math.max(0,-Math.cos(phi)));
    B['kn'+sd].rotation.set(knee,0,-sg*.19);
    /* ankle = undo the chain's pitch so the sole is flat, then apply the gait's foot pitch; a touch of roll onto the outside edge in swing */
    B['an'+sd].rotation.set(-(hx+hip+knee)+pitch,(sd==='L'?-.1:.1),(sd==='L'?1:-1)*.06*a*Math.max(0,Math.sin(phi-3.6)));};
  leg('L',ph);leg('R',ph+Math.PI);
  /* pelvis: rotation with the stepping leg, drop on the swing side, bob - lowest at mid-stance, highest in the run's flight */
  /* a man walking his rounds with a rifle carries his upper body quietly: less pelvis swing and torso counter-twist */
  const cm=G.calm?.5:1;
  const h=B.hips;h.rotation.set(hx,.1*Math.sin(ph)*a*lerp(1,.8,rn)*cm,.04*Math.sin(2*ph+.4)*a*cm);
  if(!G.h0)G.h0=h.position.clone();
  const bobW=-(1-Math.cos(2*ph))*.5*.02,bobR=-(.5+.5*Math.cos(2*(ph-.15*Math.PI*2)))*.05;
  h.position.y=G.h0.y+lerp(bobW,bobR,rn)*a-crouch*.02;h.position.x=G.h0.x+.012*Math.sin(ph)*a*(1-rn*.5)*cm;
  /* torso counter-rotates the pelvis, leans into the run, bends a little toward the stance leg; head stays level */
  const sp=lerp(.03,.17,rn)*a+.02+crouch*.25+.02*Math.sin(2*ph-.6)*rn*a;
  B.spine.rotation.set(sp,-.14*Math.sin(ph)*a*cm*cm,-.03*Math.sin(ph)*a*cm);
  B.neck.rotation.set(-(sp-.02)*.6-hx*.5,.06*Math.sin(ph)*a*cm,.025*Math.sin(ph)*a*cm);B.head.rotation.set(-(sp-.02)*.3,.03*Math.sin(ph)*a,0);
  /* arms swing opposite to the legs; elbows bend more as the arm comes forward; in a run the hands cross toward the midline */
  const armA=lerp(.3,.78,rn)*a*vr;
  [['L',ph+Math.PI,1],['R',ph,-1]].forEach(([sd,p,s])=>{const sw=Math.cos(p);
    B['sh'+sd].rotation.set(armA*sw+.03+rn*a*.1,s*(.1+rn*a*.18*Math.max(0,-sw)),-s*(.1+rn*a*.06));
    B['el'+sd].rotation.set(-lerp(.28,1.35,rn*a)-Math.max(0,-sw)*lerp(.25,.45,rn)*a+.08*Math.sin(p*2)*a,0,0);
    B['wr'+sd].rotation.set(.1*a*sw,0,s*.1);});}
function surface(x=player.pos.x,z=player.pos.z){if(inHouse(x,z))return'wood';if(Math.abs(x)<4)return'dirt';if(Math.abs(x)<42&&Math.abs(z)<33)return'gravel';
  /* the shack's floor and deck, the roads, the dyke, the mud at the water's edge */
  if(typeof FLOORS!=='undefined'&&floorAt(x,z)>H(x,z)+.12)return'wood';const q=roadQuery(x,z);if(q.dH<5||q.dW<3.6)return'asphalt';if(q.dT<2.4)return'dirt';
  if(typeof DET!=='undefined'&&inDET(x,z)){const P=W3.path;let dp=9;for(let i=0;i<P.length-1;i++){const p=P[i],r=P[i+1],dx=r[0]-p[0],dz=r[1]-p[1],l2=dx*dx+dz*dz;const t=clamp(((x-p[0])*dx+(z-p[1])*dz)/l2,0,1);dp=Math.min(dp,Math.hypot(x-p[0]-dx*t,z-p[1]-dz*t));}
    if(dp<1.5)return'gravel';if(H(x,z)<W3.wl+.35)return'mud';}
  if(typeof W3!=='undefined'&&W3.yard&&Math.hypot(x-W3.yard.x,z-W3.yard.z)<14)return'dirt';return'grass';}
/* the player's own body is invisible but still casts a shadow */
const playerBody=buildHuman({char:'player',outfit:'ratnik',vest:true,helmet:true,holster:true});scene.add(playerBody.root);
playerBody.root.traverse(m=>{if(m.isMesh){const f=x=>{x=x.clone();x.colorWrite=false;x.depthWrite=false;return x;};m.material=Array.isArray(m.material)?m.material.map(f):f(m.material);m.receiveShadow=false;}});
/* ...into the sun's shadow map only: the flashlight sits at your chest, so your own body would throw a big shadow into its
   beam. A spot light's shadow camera is a perspective one, the sun's orthographic - the body is clipped away in the first */
playerBody.root.traverse(m=>{if(!m.isMesh)return;const g=m.geometry;const dm=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,skinning:!!m.isSkinnedMesh,morphTargets:!!(g.morphAttributes&&g.morphAttributes.position&&m.material&&m.material.morphTargets)});
  dm.onBeforeCompile=sh=>{sh.vertexShader=sh.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nif(projectionMatrix[3][3]<.5)gl_Position=vec4(0.,0.,-2.,1.);');};dm.customProgramCacheKey=()=>'noFlash';m.customDepthMaterial=dm;});

/* ---------- interaction ---------- */
let curInt=null;const tv=V3();
function findInteract(){curInt=null;let best=1e9;const cp=camera.position;camera.getWorldDirection(fwd);
  /* (busy: the only thing E does is end what you are doing) */if(ACT.kind==='sit'||ACT.kind==='drag'){const pr=$('prompt');const l=ACT.kind==='sit'?(ACT.sit&&ACT.sit.ph==='sit'&&!ACT.smk?'[E]  Stand up':''):'[E]  Let go';pr.textContent=l;pr.classList.toggle('on',!!l);return;}
  for(const i of interact){if(i.show&&!i.show())continue;i.obj.localToWorld(tv.copy(i.off||V3()));const d=tv.distanceTo(cp);if(d>i.r+.6)continue;tv.sub(cp).normalize();const dot=tv.dot(fwd);if(dot<.55)continue;const sc=d*(1.6-dot);if(sc<best){best=sc;curInt=i;}}
  const pr=$('prompt');pr.textContent=curInt?'[E]  '+curInt.label:'';pr.classList.toggle('on',!!curInt);}
function doInteract(){if(ACT.use())return;if(curInt){const c=curInt;c.fn.call(c);if(c.once){const k=interact.indexOf(c);if(k>=0)interact.splice(k,1);}}}
{const ob=scene.children.find(c=>c.userData&&c.userData.orders);interact.push({obj:ob,off:V3(0,1.6,0),label:'Read combat orders № 12-7',r:2.4,fn(){S.ordersRead=true;setObj('Board BTR-80 "121" by the road and ride out to Sector 1.');say('ORDERS № 12-7','Sector 1, the field by Staroye Opalikhino. Measure the background, search the house, find the missing patrol of three. Keep the dosimeter on.',7);}});}

/* ---------- viewmodel ---------- */
const vmRoot=new T.Group();vmCam.add(vmRoot);
const WEAP={pm:{hands:1,hip:[.07,-.115,-.47],hipR:[.03,.05,-.02],ads:[0,0,-.5],rec:[.045,.012],fov:58,rpm:0,dmg:28,mag:8,ammo:'9x18',name:'PM Makarov · 9×18'},
  ak:{hands:2,hip:[.115,-.12,-.30],hipR:[.015,.06,-.07],ads:[0,0,-.19],rec:[.035,.014],fov:52,rpm:650,dmg:44,mag:30,ammo:'5.45x39',name:'AK-74M · 5.45×39'}};
let VM={id:null,gun:null,kick:0,t:0,flash:null,muzzle:V3(),sight:0,sx:0,sy:0};
function basis(yv,zv){const y=V3(...yv).normalize(),z=V3(...zv).normalize();const x=V3().crossVectors(y,z).normalize();z.crossVectors(x,y).normalize();return new T.Quaternion().setFromRotationMatrix(new T.Matrix4().makeBasis(x,y,z));}
/* re-pose every frame: a squeeze on each shot and a faint, uneven tension so the hands never freeze */
function handsVM(dt){if(!VM.hands)return;const sq=VM.kick*.14,t=VM.t||0;if(VM.gun)VM.gun.updateMatrixWorld(true);
  for(const [h,P,sd] of VM.hands){const f=P.f.map((r,i)=>{const e=sq+.025*Math.sin(t*(.9+i*.37)+i*1.7+sd);return[r[0]+(i===0&&sd<0?-sq*1.6:e),r[1]+e*.8,r[2]+e*.5,r[3]];});
    const th=P.th.map((r,k)=>k?[r[0]-sq*.5]:r);poseHand(h,f,th,sd);fingerClear(h,f,th,sd,P);}}
/* fingers never pass into the gun: after a hand is posed, each finger (and the thumb) is tested joint by joint against
   the gun's own meshes (a point is inside a part when rays cast from it cross that part's surface an odd number of
   times); a finger that would go in is opened a little at a time until every joint is clear, so it ends lying on the
   surface instead of in it - whatever the grip, the reload key or the recoil is doing */
const _fcV=V3(),_fcW=V3(),_fcRC=new T.Raycaster(),_fcD=[V3(0,1,0),V3(.31,.2,.93).normalize()],_fcBB=new T.Box3(),_fcM=new T.Matrix4();
function gunColliders(gun){if(gun.userData.col)return gun.userData.col;const L=[];gun.updateMatrixWorld(true);
  gun.traverse(m=>{if(!m.isMesh||!m.geometry||!m.geometry.attributes.position)return;for(let a=m;a&&a!==gun;a=a.parent)if(a.userData&&(a.userData.noCol))return;
    const ty=m.geometry.type||'';if(/Plane|Circle|Shape/.test(ty)||m.material.transparent||m.material.alphaTest)return;
    m.geometry.computeBoundingBox();const sz=m.geometry.boundingBox.getSize(V3());const sc=m.getWorldScale(V3());if(Math.min(sz.x*sc.x,sz.y*sc.y,sz.z*sc.z)<.0025)return;L.push(m);});
  return gun.userData.col=L;}
function inGun(p,col){for(const m of col){_fcM.copy(m.matrixWorld).invert();_fcW.copy(p).applyMatrix4(_fcM);const bb=m.geometry.boundingBox;
    if(_fcW.x<bb.min.x||_fcW.y<bb.min.y||_fcW.z<bb.min.z||_fcW.x>bb.max.x||_fcW.y>bb.max.y||_fcW.z>bb.max.z)continue;
    /* (both faces count: from inside a closed part the way out is through a back face) */
    const sd0=m.material.side;m.material.side=T.DoubleSide;let ok=true;for(const d of _fcD){_fcRC.set(p,d);_fcRC.far=.6;const h=[];m.raycast(_fcRC,h);if(h.length%2===0){ok=false;break;}}m.material.side=sd0;if(ok)return true;}return false;}
function fingerClear(h,f,th,sd,P0){if(!VM.gun||!h||!h.fingers||window.__noFC)return;const col=gunColliders(VM.gun);const root=h.fingers[0][0].parent;
  /* the pad side of each segment: the palm normal carried round by that bone's own rotation relative to the wrist */
  const arm=VM.arms&&VM.arms.find(a=>a.hand===h);const wq=root.getWorldQuaternion(new T.Quaternion()),wqi=wq.clone().invert(),palmW=arm?arm.palm.clone().applyQuaternion(wq):null;
  /* sample each segment along its length, on its axis and in two rings round it out to the glove's skin (the gloved
     fingers are close to 2 cm thick) */
  const pts=chain=>{const a=chain.map(b=>b.getWorldPosition(V3()));const b3=chain[2],tq=b3.getWorldQuaternion(new T.Quaternion());const tip=a[2].clone().add(b3.position.clone().multiplyScalar(.95).applyQuaternion(tq).multiplyScalar(b3.getWorldScale(V3()).x));const J=[a[0],a[1],a[2],tip],P=[];
    for(let k=0;k<3;k++){const d=J[k+1].clone().sub(J[k]);const L=d.length();if(L<1e-5)continue;d.divideScalar(L);const u=Math.abs(d.y)<.9?V3(0,1,0).cross(d).normalize():V3(1,0,0).cross(d).normalize(),w=d.clone().cross(u);
      for(const t of (k===0?[.6,1]:[.35,.7,1])){const c=J[k].clone().lerp(J[k+1],t);P.push(c);for(const rr of [.0055,.0095])for(let r=0;r<8;r++){const an=(r+(rr>.008?.5:0))/8*6.283;P.push(c.clone().addScaledVector(u,Math.cos(an)*rr).addScaledVector(w,Math.sin(an)*rr));}}}
    if(palmW)P.push(tip.clone().addScaledVector(palmW,.006));return P;};
  const hits=chain=>{let n=0;for(const q of pts(chain))if(inGun(q,col))n++;return n;};
  /* a finger wrapped round a handle that touches it must close further, one lying against a flat side must open: try both
     and keep whichever clears more joints, until nothing is inside */
  const setF=(ch,s)=>{ch.forEach((b_,k)=>{b_.quaternion.copy(b_.userData.q0);if(k===0&&s[3])b_.quaternion.multiply(QZ_.setFromAxisAngle(AZ_,s[3]*sd));b_.quaternion.multiply(QX.setFromAxisAngle(AX,s[k]));});ch[0].updateMatrixWorld(true);};
  /* the search is costly (rays into every gun part), so it is spread out: each frame one finger of each hand is solved
     afresh - starting from the bare pose, then from its last answer - and every finger wears its latest correction,
     eased in, so a reload never stalls a frame */
  const all=!h._fc;const C=h._fc||(h._fc={k:0,d:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],cur:[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],td:[[0,0,0],[0],[0]],tc:[[0,0,0],[0],[0]]});
  /* the resting grip: every finger is closed joint by joint (knuckle, then middle, then tip) until it touches the gun,
     so the hand really wraps the handguard or the grip; that wrap is kept while it stays clear. The trigger finger keeps
     its own pose. Any other shape (a reload key) starts from no correction and is only kept out of the gun. */
  const base=!!P0&&(P0===HANDS[VM.id+'_r']||P0===HANDS[VM.id+'_l']);const Z4=()=>[[0,0,0,0],[0,0,0,0],[0,0,0,0],[0,0,0,0]],ZT=()=>[[0,0,0],[0],[0]],cp=a=>a.map(r=>r.slice());
  if(!all){if(base&&!C.wasBase&&C.dB){C.d=cp(C.dB);C.td=cp(C.tdB);}else if(!base&&C.wasBase){C.d=Z4();C.td=ZT();}}C.wasBase=base;
  const j=C.k;C.k=(C.k+1)%5;const dt=Math.min(VM.dt||1/60,.05),ek=all?1:1-Math.exp(-dt*22);
  const CAND=s=>[[s[0]*.86,s[1]*.86,s[2]*.86,s[3]],[s[0]*1.12,s[1]*1.12,s[2]*1.12,s[3]],[s[0]*.72,s[1]*.72,s[2]*.72,s[3]],[s[0],s[1]*.8,s[2]*.4,s[3]],[s[0],s[1]*1.15,s[2]*1.4,s[3]],[s[0],s[1],s[2],s[3]+.1],[s[0],s[1],s[2],s[3]-.1],[s[0],s[1],s[2],s[3]+.22],[s[0],s[1],s[2],s[3]-.22],[s[0]*.9,s[1]*.75,s[2]*.6,s[3]],[s[0]*1.1,s[1]*.7,s[2]*.5,s[3]],[s[0]*.7,s[1]*1.2,s[2]*1.2,s[3]]];
  h.fingers.forEach((ch,i)=>{if(all||i===j){let s,n;
      const pr=f[i].map((v,k)=>v+C.d[i][k]);if(base&&!all){setF(ch,pr);n=hits(ch);s=pr;}
      if(!(base&&!all&&n===0)){s=f[i].slice();setF(ch,s);n=hits(ch);if(n>0){setF(ch,pr);const np=hits(ch);if(np<n){s=pr;n=np;}else setF(ch,s);}}
      for(let it=0;it<(all?9:3)&&n>0;it++){let best=null,bn=n;for(const c of CAND(s)){setF(ch,c);const k=hits(ch);if(k<bn){bn=k;best=c;}}if(!best){setF(ch,s);break;}s=best;n=bn;setF(ch,s);}
      if(all&&base&&n===0&&!(sd<0&&i===0)){for(let k=0;k<3;k++)for(let st=0;st<14;st++){const c=s.slice();c[k]-=.07;if(c[k]<-1.85)break;setF(ch,c);if(hits(ch)>0){setF(ch,s);break;}s=c;}}
      C.d[i]=s.map((v,k)=>v-f[i][k]);}
    for(let k=0;k<4;k++)C.cur[i][k]+=(C.d[i][k]-C.cur[i][k])*ek;
    setF(ch,f[i].map((v,k)=>v+C.cur[i][k]));});
  {const ch=h.thumb;const setT=e=>{ch.forEach((b_,k)=>{const q=e[k]||[0,0,0];b_.quaternion.copy(b_.userData.q0).multiply(QX.setFromAxisAngle(AX,q[0]||0)).multiply(QY_.setFromAxisAngle(AY_,(q[1]||0)*sd)).multiply(QZ_.setFromAxisAngle(AZ_,(q[2]||0)*sd));});ch[0].updateMatrixWorld(true);};
   const add=(a,d)=>a.map((r,k)=>[0,1,2].slice(0,Math.max(r.length,1)).map(x=>(r[x]||0)+((d[k]||[])[x]||0)));
   if(all||j===4){let e=th.map(r=>r.slice());setT(e);let n=hits(ch);
     if(n>0){const p=add(th,C.td);setT(p);const np=hits(ch);if(np<n){e=p;n=np;}else setT(e);}
     for(let it=0;it<(all?6:2)&&n>0;it++){let best=null,bn=n;
      for(const c of [e.map((r,k)=>k?[r[0]*.8]:r),e.map((r,k)=>k?[r[0]*1.2]:r),e.map((r,k)=>k?r:[r[0],(r[1]||0)+.12,r[2]||0]),e.map((r,k)=>k?r:[r[0],(r[1]||0)-.12,r[2]||0]),e.map((r,k)=>k?r:[(r[0]||0)-.12,r[1]||0,r[2]||0])]){setT(c);const k=hits(ch);if(k<bn){bn=k;best=c;}}
      if(!best){setT(e);break;}e=best;n=bn;setT(e);}
     C.td=e.map((r,k)=>r.map((v,x)=>v-((th[k]||[])[x]||0)));if(all&&base){C.dB=cp(C.d);C.tdB=cp(C.td);}}
   C.tc=C.tc.map((r,k)=>[0,1,2].slice(0,Math.max(r.length,(C.td[k]||[]).length)).map(x=>(r[x]||0)+(((C.td[k]||[])[x]||0)-(r[x]||0))*ek));
   setT(add(th,C.tc));}}
/* a hand shape with every finger curl scaled by k (how tightly this grip closes round its handle) */
function curlHandShape(P,k,tk,fk){if(!P)return P;k=k||1;tk=tk||[0,0,0];fk=fk||[0,0,0,0];
  return{f:P.f.map((r,i)=>{const q=k*(1+fk[i]);return[r[0]*q,r[1]*q,r[2]*q,r[3]];}),th:[[P.th[0][0]+tk[0],P.th[0][1]+tk[1],P.th[0][2]||0],[P.th[1][0]+tk[2]],[P.th[2][0]+tk[2]]]};}
/* each weapon's resting grip shapes, registered under their own names ('pm_r', 'ak_l'...) so reload keys can return to them */
function gripShapes(id){const P=VMG[id];HANDS[id+'_r']=curlHandShape(HANDS[P.r[5]],P.r[6],P.r[7],P.r[8]);HANDS[id+'_l']=curlHandShape(HANDS[P.l[5]],P.l[6],P.l[7],P.l[8]);}
/* grip placement per weapon, gun space: [palm point, finger direction, palm normal, forearm direction, forearm roll, hand shape] */
/* PM: a proper two-handed grip, thumbs forward (the support thumb laid along the frame under the slide, not standing up) - the shooting hand's web high under the tang and its palm round the back strap, the
   support palm filling the left side with its fingers wrapped over the shooting fingers; from behind, two closed fists */
/* (found by a search that drives hand and sleeve penetration of the gun to zero and keeps the forearms apart, starting
   from the authored grips: palm point, fingers, palm normal, forearm, roll, shape, curl, thumb [x,y,flex], finger curls) */
/* (re-authored: the shooting hand's web wraps the PM's back strap with its palm on the right panel, the support palm
   fills the left panel with its fingers over the front; the AK's support hand cradles the lower handguard from beneath,
   thumb along the left side, fingers closing up round the right - then each finger closes until it meets the gun) */
/* (v36: the old PM grip had its palm normal almost parallel to the fingers, so once squared up the palm faced the sky - the
   hand lay under the gun with the thumb toward the trigger. Now: the shooting palm on the right panel and round the back
   strap, web high under the tang, index along the frame to the trigger, the other three round the front strap; the
   support palm on the left panel with its fingers wrapped forward over the shooting fingers) */
const VMG={pm:{r:[V3(.011,-.04,.042),V3(-.55,-.1,-.83),V3(-.5,.05,.86),V3(-.2,.33,-.92),0,'trig',1.0,[0,0,0],[0,0,0,0]],
             l:[V3(-.026,-.058,.014),V3(.15,-.55,-.82),V3(.95,0,.3),V3(.3,.3,-.9),0,'cup',.8,[0,0,0],[0,0,0,0]]},
  ak:{r:[V3(.033,-.08,.047),V3(-.034,-.304,-.952),V3(-.974,.222,-.036),V3(-.35,.35,-.869),0,'trig',1.06,[-.569,-.25,-.287],[-.186,.091,.01,0]],
      l:[V3(-.014,-.0315,-.285),V3(.85,.05,-.5),V3(.45,.89,0),V3(.38,.45,-.81),0,'guard',.7,[0,0,0],[0,0,0,0]]}};
function mountWeapon(id){while(vmRoot.children.length)vmRoot.remove(vmRoot.children[0]);VM={id,kick:0,t:0,sx:0,sy:0};if(!id)return;
  const sup=id==='ak'&&S.equip.attach&&S.equip.attach.id==='pbs';const gun=id==='pm'?buildPM({lanyard:true}):buildAK(sup,{sling:true});gun.traverse(m=>{m.castShadow=false;});vmRoot.add(gun);VM.gun=gun;
  VM.muzzle=gun.userData.muzzle.clone();VM.sight=gun.userData.sightY;
  /* the Kobra on the side rail: the eye comes up to its window instead of the iron sights */
  if(id==='ak'&&S.equip.optic&&S.equip.optic.id==='kobra'){const k=kobraModel();gun.add(k);VM.sight=k.userData.sightY;VM.kobra=k;}else VM.kobra=null;
  const ar=buildFPArm(-1);   /* game side L = the character's right hand (the old setup used the left hand mirrored, so the thumb ended up underneath) */vmRoot.add(ar.root);VM.arms=[ar];
  const P=VMG[id];gripShapes(id);placeArm2(ar,gun,P.r[0],P.r[1],P.r[2],P.r[3],P.r[4]||0);VM.hands=[[ar.hand,HANDS[id+'_r'],-1]];
  const al=buildFPArm(1);vmRoot.add(al.root);VM.arms.push(al);placeArm2(al,gun,P.l[0],P.l[1],P.l[2],P.l[3],P.l[4]||0);VM.hands.push([al.hand,HANDS[id+'_l'],1]);
  VM.parts=gun.userData.parts||{};VM.L0=P.l;VM.R0=P.r;VM.cyc=9;VM.lock=0;VM.anim=null;
  if(S.reloading>0){S.reloading=0;S.reloadFill=null;}
  {const w=S.equip.weapon;if(id==='pm'&&w&&w.inMag===0)VM.lock=1;}
  handsVM(0);vmAction(0);
  const fl=buildFlash(id==='ak',sup);fl.position.copy(VM.muzzle);fl.visible=false;gun.add(fl);VM.flash=fl;}
/* ---------- reloads ----------
   Keyframed like a mocap pass and splined (Catmull-Rom through every key, so the motion flows instead of stopping at each
   pose): the gun's pose in the hands, the magazine (it rocks out about its front lug on the AK, slides down the grip on the
   PM), the bolt carrier / slide, the support hand's target - on the gun, or riding on the magazine - and its shape. The
   trigger finger comes off the trigger for the whole reload. Sounds fire on the keys where metal meets metal. */
Object.assign(HANDS,{
  trigOff:{f:[[-.1,-.16,-.08,.05],[-1.48,-1.55,-1.05,.02],[-1.55,-1.55,-1.02,-.05],[-1.62,-1.45,-.92,-.13]],th:[[.15,.25,0],[-.55],[-.7]]},
  open:{f:[[-.22,-.28,-.16,.2],[-.28,-.32,-.2,.05],[-.32,-.36,-.22,-.07],[-.38,-.36,-.22,-.2]],th:[[.12,.32,0],[-.05],[-.08]]},
  grab:{f:[[-1.05,-1.15,-.75,.1],[-1.2,-1.28,-.85,.02],[-1.28,-1.3,-.85,-.06],[-1.34,-1.25,-.8,-.15]],th:[[.32,.42,0],[-.08],[-.1]]},
  grabP:{f:[[-1.12,-1.22,-.8,.1],[-1.26,-1.33,-.9,.02],[-1.33,-1.35,-.9,-.06],[-1.4,-1.3,-.85,-.15]],th:[[.28,.36,0],[-.4],[-.5]]},
  hook:{f:[[-.75,-1.45,-.95,.06],[-.85,-1.55,-1.0,0],[-.9,-1.55,-1.0,-.05],[-.95,-1.45,-.95,-.12]],th:[[.18,.3,0],[-.25],[-.25]]},
  base:{f:[[-.55,-.7,-.45,.12],[-.62,-.78,-.5,.03],[-.68,-.82,-.5,-.06],[-.74,-.8,-.48,-.17]],th:[[.2,.38,0],[-.5],[-.55]]},
  slap:{f:[[-.12,-.15,-.08,.12],[-.14,-.16,-.1,.03],[-.16,-.18,-.1,-.05],[-.2,-.2,-.12,-.14]],th:[[.1,.25,0],[-.05],[-.05]]},
  pinch:{f:[[-.75,-.95,-.55,.08],[-.85,-1.05,-.62,0],[-.9,-1.05,-.62,-.06],[-.95,-1.0,-.58,-.14]],th:[[.15,.32,0],[-.45],[-.5]]},
  thumbDn:{f:[[-.1,-.16,-.08,.05],[-1.48,-1.55,-1.05,.02],[-1.55,-1.55,-1.02,-.05],[-1.62,-1.45,-.92,-.13]],th:[[.32,.05,0],[-.25],[-.3]]}});
function splineHand(H4,tt,t){const [a,b,c,d]=H4;const v=(x0,x1,x2,x3)=>{const y=crs(x0,x1,x2,x3,tt[0],tt[1],tt[2],tt[3],t);return clamp(y,Math.min(x1,x2),Math.max(x1,x2));};
  return{f:b.f.map((r,i)=>r.map((x,k)=>v(a.f[i][k],x,c.f[i][k],d.f[i][k]))),th:b.th.map((r,k)=>[0,1,2].slice(0,Math.max(r.length,(c.th[k]||[]).length)).map(j=>{const g=H=>((H.th[k]||[])[j])||0;return v(g(a),g(b),g(c),g(d));}))};}
function blendHand(a,b,u){return{f:a.f.map((r,i)=>r.map((x,k)=>lerp(x,b.f[i][k],u))),th:a.th.map((r,k)=>r.map((x,j)=>lerp(x,((b.th[k]||[])[j])||0,u)))};}
/* key list -> every key carries every channel (missing ones inherit from the key before) */
const LC0=[0,0,0,0,0,0],_cq=new T.Quaternion(),_ce=new T.Euler();
const RLFIX={};
/* AK support-hand corrections per reload key [dx,dy,dz,rx,ry,rz] (gun space), from the clearance search */
RLFIX.ak={"1":[[0,0,0,0,0,0],[0.0048,-0.0002,0,0,-0.2,0],[-0.0122,-0.0001,-0.0137,0.0495,0.2,0],[0.0003,-0.0123,-0.0063,0.3106,-0.1228,-0.565],[-0.0023,-0.0089,0.0135,0.1283,0.0917,-0.4038],[-0.0072,-0.0005,0.0144,0.31,0.1716,-0.51],[-0.0067,0.0048,0.0042,0,0,0.09],[-0.01,0.0056,0.0056,0,0,0],[-0.01,0.0056,0.0056,0,0,0],[-0.008,0.0056,0.0056,0,-0.0295,0],[0.0034,-0.0002,0.0034,0.0504,0.0767,-0.5138],[0.0012,-0.0139,-0.0011,0.2422,-0.0049,-0.7138],[0.0082,-0.0145,-0.0014,0.2,-0.0504,-0.51],[-0.0024,0.0296,-0.003,0.11,-0.0495,0.1332],[0.0097,0.0156,0.0012,0,0,0],[0.0097,0.0156,0.0012,0,0,0],[0.0124,0.0029,0,-0.2,0.2,0.2],[0.0138,0.0093,0.0001,0,-0.11,0.0717],[0.0078,0.0122,0,0.0428,-0.0266,0.1328],[-0.0002,0.0048,0,-0.2495,0.0038,0.0295],[-0.0002,0.0002,0,0,-0.1062,0],[0,0,0,0,0,0],[0,0,0,0,0,0]],"0":[[0,0,0,0,0,0],[-0.0002,-0.0002,0,0,-0.1667,0],[-0.012,0.0001,-0.016,0,0.2,0],[0.0082,-0.0145,-0.0014,0.2,-0.0504,-0.51],[-0.0048,-0.0164,0.0113,0.541,0.1667,-0.354],[-0.0044,0,0.0144,0,0.11,-0.31],[-0.0042,0.0067,0.0012,0,0,0.2],[-0.0073,-0.0002,-0.0002,-0.0567,0,0.1395],[-0.008,0.0015,0.008,0,0,0.09],[-0.008,-0.0002,-0.0002,0,0,0.1667],[-0.0024,-0.006,0.0026,0.0788,0.1728,-0.4333],[0.0012,-0.0139,-0.0011,0.2422,-0.0049,-0.7138],[0.0082,-0.0145,-0.0014,0.2,-0.0504,-0.51],[-0.0002,0.0002,0,0,-0.1062,0],[0,0,0,0,0,0],[0,0,0,0,0,0],[0,0,0,0,0,0]]};
function rlFix(K,id,empty){const F=(RLFIX[id]||{})[empty?1:0];K.forEach((k,i)=>{k.Lc=(F&&F[i])||LC0;});return K;}
function seq(list){let prev=null;return list.map(k=>{const o=Object.assign({},prev||{},k);if(k.L&&prev&&prev.L)o.L=Object.assign({},prev.L,k.L);delete o.ev;if(k.ev)o.ev=k.ev;prev=o;return o;});}
const _av=(a)=>V3(a[0],a[1],a[2]);
function L0key(id){const l=VMG[id].l;gripShapes(id);return{f:'gun',p:l[0].toArray(),F:l[1].toArray(),N:l[2].toArray(),A:l[3].toArray(),h:id+'_l'};}
const RL={
  /* AK-74M: tilt the rifle over, grip the magazine with the thumb on the release paddle, rock it out forward about the front
     lug, carry it down out of sight, come back with a fresh one, hook the front lug in and rock it back until it clicks.
     From empty the support hand then reaches under the receiver and rips the charging handle back. */
  ak:(empty)=>{const G0=[0,0,0,0,0,0],GT=[-.032,.022,.03,.13,.05,-.5],L0=L0key('ak');
    const MG={f:'mag',p:[-.022,-.068,-.142],F:[0,-.28,-.96],N:[1,0,0],A:[.45,.5,-.74],h:'grab'};
    const K=[{t:0,g:G0,m:[0,0,0],b:0,L:L0,R:'trig'},
      {t:.16,g:[-.01,.006,.008,.04,.02,-.16],L:{f:'gun',p:[-.06,-.09,-.21],F:[.5,-.2,-.84],N:[.85,.4,0],A:[.42,.45,-.78],h:'open'},R:'trigOff'},
      {t:.38,g:GT,L:Object.assign({},MG,{p:[-.03,-.075,-.142],h:'open'})},
      {t:.5,L:MG},
      {t:.6,L:{h:'grabP'},ev:'paddle'},
      {t:.72,m:[3,-3,.3],L:{h:'grabP'},ev:'magout'},
      {t:.86,m:[22,-55,.42],g:[-.03,.024,.03,.15,.05,-.47],L:{h:'grab'}},
      {t:1.08,m:[-60,-300,.7],g:[-.028,.02,.03,.13,.05,-.5]},
      {t:1.18,m:[-90,-330,.75]},
      {t:1.46,m:[30,-130,.55],g:[-.032,.022,.03,.13,.05,-.52]},
      {t:1.64,m:[4,-8,.3],ev:'tap'},
      {t:1.82,m:[0,0,0],g:[-.03,.028,.028,.15,.05,-.5],ev:'magin'},
      {t:1.9,g:[-.032,.02,.03,.12,.05,-.5]}];
    if(!empty)K.push(
      {t:2.06,L:{f:'gun',p:[-.06,-.085,-.22],F:[.6,-.1,-.8],N:[.85,.45,0],A:[.42,.45,-.78],h:'open'},g:[-.025,.018,.025,.1,.04,-.4]},
      {t:2.28,L:Object.assign({},L0,{h:'open'}),g:[-.008,.006,.008,.03,.015,-.12]},
      {t:2.4,L:L0,R:'trigOff'},
      {t:2.55,g:G0,R:'trig'});
    else K.push(
      /* over the top: cant the rifle to the left so the handle comes up, palm down on the dust cover, fingers hooked round the
         knob on the far side, rip it back to the stop and let go */
      {t:2.02,L:{f:'gun',p:[-.05,.02,-.2],F:[.85,-.2,-.45],N:[.3,-.95,0],A:[.55,.5,-.67],h:'open'},g:[-.02,.024,.026,.09,.04,-.05]},
      {t:2.2,L:{f:'gun',p:[.006,.056,-.142],F:[.9,-.42,-.05],N:[.15,-1,0],A:[.62,.48,-.62],h:'hook'},g:[-.016,.026,.026,.08,.035,.26]},
      {t:2.27,L:{h:'hook'}},
      {t:2.4,b:92,L:{p:[.006,.056,-.05]},g:[-.012,.03,.036,.06,.03,.3],ev:'boltback'},
      {t:2.44,L:{h:'open',p:[.0,.064,-.04]}},
      {t:2.48,b:0,g:[-.014,.022,.026,.075,.03,.27],ev:'boltfwd'},
      {t:2.56,g:[-.012,.024,.028,.07,.03,.26]},
      {t:2.76,L:{f:'gun',p:[-.06,-.085,-.22],F:[.6,-.1,-.8],N:[.85,.45,0],A:[.42,.45,-.78],h:'open'},g:[-.006,.008,.01,.03,.015,.05]},
      {t:2.98,L:Object.assign({},L0,{h:'open'})},
      {t:3.1,L:L0,g:G0,R:'trig'});
    return rlFix(seq(K),'ak',empty);},
  /* PM: raise and roll the pistol, thumb the heel catch, draw the magazine down the grip, fetch a full one, push it home and
     slap the floorplate; from empty the slide is locked back, so the support hand comes over the top and slingshots it */
  pm:(empty)=>{const G0=[0,0,0,0,0,0],GT=[-.03,.03,.04,.28,.06,-.42],L0=L0key('pm');
    const MG={f:'mag',p:[-.004,-.103,.024],F:[.25,.25,-.94],N:[0,1,0],A:[.35,.75,-.56],h:'base'};
    const b0=empty?30:0;
    const K=[{t:0,g:G0,m:[0,0,0],b:b0,L:L0,R:'trig'},
      {t:.14,g:[-.012,.014,.018,.12,.03,-.18],L:{f:'gun',p:[-.03,-.11,.03],F:[.3,.2,-.93],N:[.3,.95,0],A:[.35,.7,-.62],h:'open'},R:'trigOff'},
      {t:.3,g:GT,L:Object.assign({},MG,{p:[-.004,-.113,.026],h:'open'})},
      {t:.38,L:MG},
      {t:.44,L:{h:'grabP'},ev:'paddle'},
      {t:.52,m:[.6,-10,0],L:{h:'base'},ev:'magout'},
      {t:.66,m:[3.5,-58,0],g:[-.03,.032,.04,.3,.06,-.4]},
      {t:.86,m:[-40,-300,.4],g:[-.028,.028,.04,.27,.06,-.42]},
      {t:.96,m:[-60,-320,.5]},
      {t:1.12,m:[8,-120,.1],g:[-.03,.03,.04,.28,.06,-.44]},
      {t:1.24,m:[1.8,-30,0],ev:'tap'},
      {t:1.32,m:[0,0,0],L:{h:'slap',p:[-.004,-.094,.024]},g:[-.03,.036,.04,.31,.06,-.42],ev:'magin'},
      {t:1.4,g:[-.03,.03,.04,.27,.06,-.42],L:{f:'gun',p:[-.02,-.13,.04],h:'open'}}];
    if(!empty)K.push(
      {t:1.56,L:Object.assign({},L0,{h:'open'}),g:[-.01,.01,.012,.08,.02,-.12]},
      {t:1.66,L:L0},
      {t:1.75,g:G0,R:'trig'});
    else K.push(
      /* from empty the slide is locked back: the support hand goes back to the grip and the shooting thumb drops the slide
         stop - the slide slams home */
      {t:1.56,L:Object.assign({},L0,{h:'open'}),g:[-.012,.012,.014,.09,.02,-.14]},
      {t:1.66,L:L0},
      {t:1.74,R:'thumbDn'},
      {t:1.8,b:0,g:[-.01,.016,.016,.11,.02,-.1],ev:'slidefwd'},
      {t:1.9,R:'trigOff',g:[-.006,.008,.01,.05,.01,-.06]},
      {t:2.05,g:G0,R:'trig'});
    return rlFix(seq(K),'pm',empty);}};
/* Catmull-Rom on non-uniform keys (tangents scaled to the segment), clamped at the ends */
function crs(a,b,c,d,ta,tb,tc,td,t){const h=tc-tb,u=h>0?(t-tb)/h:0,m1=(c-a)/Math.max(tc-ta,1e-4)*h,m2=(d-b)/Math.max(td-tb,1e-4)*h,u2=u*u,u3=u2*u;
  return(2*u3-3*u2+1)*b+(u3-2*u2+u)*m1+(-2*u3+3*u2)*c+(u3-u2)*m2;}
const _mq=new T.Quaternion(),_mm=new T.Matrix4(),_mi=new T.Matrix4();
function magDelta(){/* the magazine part's motion from its rest pose, as a matrix in gun space. mm -> gun: x = w, y = v - v0,
  z = -(u - u0), so a turn about the part's mm z axis is a turn about gun x */
  const g=VM.parts.mag;if(!g)return null;const p0=g.userData.p0,P=g.userData.gp,du=(g.position.x-p0.x)*.001,dv=(g.position.y-p0.y)*.001;
  return new T.Matrix4().makeTranslation(P.x,P.y+dv,P.z-du).multiply(_mi.makeRotationX(g.rotation.z)).multiply(_mm.makeTranslation(-P.x,-P.y,-P.z));}
function vmAction(dt){/* bolt / slide cycling on each shot, slide lock, and the reload timeline */
  const P=VM.parts;if(!P)return;VM.cyc=(VM.cyc||0)+dt;
  const c=VM.cyc,cyc=c<.022?c/.022:Math.max(0,1-(c-.022)/.045);
  let b=0,A=VM.anim;
  if(VM.id==='pm')b=VM.lock?30:cyc*31;else b=cyc*92;
  if(A){A.t+=dt;const K=A.K,t=Math.min(A.t,K[K.length-1].t);let i=0;while(i<K.length-2&&K[i+1].t<=t)i++;
    const k0=K[Math.max(0,i-1)],k1=K[i],k2=K[i+1],k3=K[Math.min(K.length-1,i+2)];
    const sp=(f)=>crs(f(k0),f(k1),f(k2),f(k3),k0.t,k1.t,k2.t,k3.t,t);
    for(const k of K)if(k.ev&&!A.fired[k.t]&&A.t>=k.t){A.fired[k.t]=1;reloadEvent(k.ev);}
    const g=[0,1,2,3,4,5].map(j=>sp(k=>k.g[j]));const n=Math.sin(A.t*7.1)*.0012,n2=Math.sin(A.t*4.3+1)*.0015;
    VM.gun.position.set(g[0]+n*.5,g[1]+n2*.5,g[2]);VM.gun.rotation.set(g[3]+n*.6,g[4]+n2*.5,g[5]+n*.8);
    const m=[0,1,2].map(j=>sp(k=>k.m[j]));
    if(P.mag){const p0=P.mag.userData.p0;P.mag.position.set(p0.x+m[0],p0.y+m[1],0);P.mag.rotation.z=m[2];}
    b=Math.max(b,sp(k=>k.b));if(VM.id==='pm'&&A.t>=A.unlock)VM.lock=0;
    /* support hand: every key's target in gun space (keys riding the magazine follow it), splined, then the arm is re-placed */
    const D=magDelta();const L=[k0,k1,k2,k3].map(k=>{const l=k.L;const p=_av(l.p),F=_av(l.F),N=_av(l.N),Av=_av(l.A);
      if(l.f==='mag'&&D){p.applyMatrix4(D);const q=_mq.setFromRotationMatrix(D);F.applyQuaternion(q);N.applyQuaternion(q);}return{p,F,N,A:Av};});
    const tt=[k0.t,k1.t,k2.t,k3.t];const SPV=(key)=>V3(...['x','y','z'].map(ax=>crs(L[0][key][ax],L[1][key][ax],L[2][key][ax],L[3][key][ax],tt[0],tt[1],tt[2],tt[3],t)));
    /* per-key clearance corrections (baked so the hand never passes into the gun or the magazine), splined like the rest */
    const C=[0,1,2,3,4,5].map(j=>sp(k=>(k.Lc||LC0)[j]));const cq=_cq.setFromEuler(_ce.set(C[3],C[4],C[5]));
    const al=VM.arms[1];if(al)placeArm2(al,VM.gun,SPV('p').add(V3(C[0],C[1],C[2])),SPV('F').applyQuaternion(cq).normalize(),SPV('N').applyQuaternion(cq).normalize(),SPV('A').applyQuaternion(cq).normalize(),0);
    /* the hand shapes run through the keys on the same spline as everything else, so the fingers keep moving through a key
       instead of easing to a stop at each one (held inside the two shapes either side, so a curl never overshoots) */
    const RH=r=>HANDS[r==='trig'?VM.id+'_r':r];VM.hands[1][1]=splineHand([k0,k1,k2,k3].map(k=>HANDS[k.L.h]),tt,t);VM.hands[0][1]=splineHand([k0,k1,k2,k3].map(k=>RH(k.R)),tt,t);
    if(A.t>=K[K.length-1].t){VM.anim=null;VM.gun.position.set(0,0,0);VM.gun.rotation.set(0,0,0);if(P.mag){P.mag.position.copy(P.mag.userData.p0);P.mag.rotation.z=0;}
      const l=VM.L0;if(al)placeArm2(al,VM.gun,l[0],l[1],l[2],l[3],l[4]||0);VM.hands[1][1]=HANDS[VM.id+'_l'];VM.hands[0][1]=HANDS[VM.id+'_r'];}}
  if(VM.id==='pm'){if(P.slide)P.slide.position.x=-b;if(P.hammer)P.hammer.rotation.z=clamp(b/22,0,1)*1.05+(VM.cocked?.62:0)*(1-clamp(b/22,0,1));}
  else if(P.bolt)P.bolt.position.x=P.bolt.userData.p0.x-b;
  /* the pistol's lanyard swings freely from the heel loop */
  if(P.lanyard&&dt>0){const ly=P.lanyard,inner=ly.parent;inner.updateWorldMatrix(true,false);const q=inner.getWorldQuaternion(new T.Quaternion()).invert();
    const d=V3(0,-1,0).applyQuaternion(q);VM.lyD=VM.lyD||d.clone();VM.lyV=VM.lyV||V3();VM.lyV.addScaledVector(d.clone().sub(VM.lyD),30*dt).multiplyScalar(Math.max(0,1-2.6*dt));
    VM.lyD.addScaledVector(VM.lyV,dt).normalize();ly.quaternion.setFromUnitVectors(V3(0,-1,0),VM.lyD);}
  /* the sling hangs: a damped pendulum about the line through its two loops, pulled toward straight down in the world */
  if(P.sling&&dt>0){const sl=P.sling,inner=sl.parent,ax=sl.userData.ax;inner.updateWorldMatrix(true,false);const q=inner.getWorldQuaternion(new T.Quaternion()).invert();
    const d=V3(0,-1,0).applyQuaternion(q);d.addScaledVector(ax,-d.dot(ax));const r0=V3(0,-1,0).addScaledVector(ax,-ax.y);
    if(d.lengthSq()>1e-6&&r0.lengthSq()>1e-6){d.normalize();r0.normalize();const tgt=Math.atan2(ax.dot(r0.clone().cross(d)),r0.dot(d));
      let e=tgt-(VM.slA||0);e=Math.atan2(Math.sin(e),Math.cos(e));VM.slV=((VM.slV||0)+(e*38-(VM.slV||0)*3.2)*dt);VM.slA=(VM.slA||0)+VM.slV*dt;sl.quaternion.setFromAxisAngle(ax,VM.slA);}}}
function reloadEvent(e){sfx.mech(e,VM.id);
  if(e==='magin'&&S.reloadFill){S.reloadFill();S.reloadFill=null;}
  if(e==='magin'||e==='boltfwd'||e==='slidefwd')VM.kick=Math.max(VM.kick,.18);}
/* muzzle flash: side-on, an elongated plume of burning propellant gas - a white-hot core at the muzzle, a second bulb
   where the gas mixes with air, ragged tongues; face-on, a hot star with uneven petals. Several painted variants;
   every shot picks variants, roll, length and width at random and fades out over a few hundredths of a second. */
const FLASHTEX=(()=>{const side=[],front=[];const nz=(x,y,s)=>{let v=0,a=.5,f=1;for(let k=0;k<4;k++){v+=a*(Math.sin(x*f*1.7+s*3.1+Math.sin(y*f*1.3+s))*.5+.5);a*=.5;f*=2.07;}return v/.94;};
  for(let k=0;k<4;k++){const W=256,Hh=96,s=k*7.3+1;side.push(tex(W,Hh,(c)=>{const im=c.createImageData(W,Hh),d=im.data;const b1=.14+k*.025,b2=.55+k*.05,w2=.28+(k%2)*.12;
      for(let y=0;y<Hh;y++)for(let x=0;x<W;x++){const u=x/W,v=(y-Hh/2)/(Hh/2);
        const wv=(.16+.62*Math.exp(-Math.pow((u-b1)/.12,2))+w2*Math.exp(-Math.pow((u-b2)/.17,2)))*Math.pow(1-u,.6);
        const jag=(nz(u*7,v*2.5,s)-.5)*.5*(.3+u);const dd=Math.abs(v)/Math.max(.02,wv+jag*wv);let I=Math.pow(Math.max(0,1-dd),1.4)*Math.pow(1-u,1.1)*Math.min(1,u/.03);
        I*=.75+.5*nz(u*15+3,v*6,s+2);I=Math.min(1,I);const hot=Math.pow(I,2.2);
        const i=(y*W+x)*4;d[i]=255;d[i+1]=Math.min(255,78+170*Math.pow(I,.85));d[i+2]=Math.min(255,14+235*Math.pow(hot,1.4));d[i+3]=Math.min(255,255*I);}c.putImageData(im,0,0);},{clamp:true}));
    const F=128;front.push(tex(F,F,(c)=>{const im=c.createImageData(F,F),d=im.data;const n=4+(k%3),ph=k*.9,L=Array.from({length:n},(_,i)=>.55+.45*Math.abs(Math.sin(i*2.7+k*1.3)));
      for(let y=0;y<F;y++)for(let x=0;x<F;x++){const dx=(x-F/2)/(F/2),dy=(y-F/2)/(F/2),r=Math.hypot(dx,dy),a=Math.atan2(dy,dx);let rp=.22;
        for(let i=0;i<n;i++){let da=a-(ph+i/n*6.283);da=Math.atan2(Math.sin(da),Math.cos(da));rp=Math.max(rp,.22+L[i]*.75*Math.exp(-Math.pow(da/(.16+.05*Math.sin(i+k)),2)));}
        let I=Math.pow(Math.max(0,1-r/rp),1.5)+1.3*Math.exp(-Math.pow(r/.16,2));I*=.8+.4*nz(dx*6,dy*6,k);I=Math.min(1,I);const hot=Math.pow(I,2);
        const i=(y*F+x)*4;d[i]=255;d[i+1]=Math.min(255,95+160*Math.pow(I,.7));d[i+2]=Math.min(255,20+235*Math.pow(hot,1.3));d[i+3]=Math.min(255,255*I);}c.putImageData(im,0,0);},{clamp:true}));}
  [...side,...front].forEach(t=>{t.encoding=T.sRGBEncoding;});return{side,front};})();
function buildFlash(big,sup){const g=new T.Group();const k=sup?.35:big?1.3:.85;
  const mk=(map,col)=>new T.MeshBasicMaterial({map,color:col,transparent:true,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide,toneMapped:false,fog:false});
  const sideG=new T.PlaneGeometry(.36*k,.13*k);sideG.translate(.18*k,0,0);sideG.rotateY(Math.PI/2);
  const s1=new T.Mesh(sideG,mk(FLASHTEX.side[0],C(0xffffff).multiplyScalar(1.7))),s2=new T.Mesh(sideG,mk(FLASHTEX.side[1],C(0xffffff).multiplyScalar(1.7)));s2.rotation.z=Math.PI/2;
  const fr=new T.Mesh(new T.PlaneGeometry(.2*k,.2*k),mk(FLASHTEX.front[0],C(0xffffff).multiplyScalar(2.0)));fr.position.z=-.012;
  g.add(s1,s2,fr);const all=[s1,s2,fr];
  /* AK-74 brake: its two side windows throw short sideways jets just behind the muzzle */
  if(big&&!sup){const jg=new T.PlaneGeometry(.085,.04);jg.translate(.05,0,0);jg.rotateX(-Math.PI/2);[1,-1].forEach(sd=>{const j=new T.Mesh(jg,mk(FLASHTEX.side[2],C(0xffffff).multiplyScalar(1.4)));j.rotation.y=sd>0?0:Math.PI;j.position.z=.012;g.add(j);all.push(j);});}
  g.userData={s1,s2,fr,k,all};g.traverse(o=>{o.castShadow=false;o.renderOrder=9;});return g;}
function fireFlash(){const f=VM.flash;if(!f)return;const u=f.userData,R2=a=>a[Math.floor(R()*a.length)];
  u.s1.material.map=R2(FLASHTEX.side);u.s2.material.map=R2(FLASHTEX.side);u.fr.material.map=R2(FLASHTEX.front);
  u.all.slice(3).forEach(j=>{j.material.map=R2(FLASHTEX.side);j.scale.set(rnd(.7,1.3),1,rnd(.8,1.2));});f.rotation.z=rnd(-.08,.08);u.s1.rotation.z=rnd(6.28);u.s2.rotation.z=u.s1.rotation.z+Math.PI/2;f.scale.set(rnd(.8,1.2),rnd(.8,1.2),rnd(.75,1.3));u.fr.scale.setScalar(rnd(.7,1.25));u.fr.rotation.z=rnd(6.28);f.visible=true;VM.flashT=.055;}
const flashlight=new T.SpotLight(C(0xfff4dc),0,32,.5,.6,1.6);flashlight.position.set(.15,-.1,0);flashlight.target.position.set(0,-.06,-10);camera.add(flashlight,flashlight.target);
flashlight.castShadow=true;flashlight.shadow.mapSize.set(512,512);flashlight.shadow.camera.near=.2;flashlight.shadow.bias=-.002;

/* ---------- shooting ---------- */
const ray=new T.Raycaster();const decals=[];const _amPV=new T.Matrix4(),_amF=new T.Frustum(),_amS=new T.Sphere();
function shoot(dt){S.fireCd=(S.fireCd||0)-dt;if((S.fire||S.ads)&&(ACT.kind||ACT.smk)){ACT.onFire();S.fire=0;S.ads=false;}if(ACT.kind||ACT.smk||ACT.lower>.3)return;const w=S.equip.weapon;if(!w||S.reloading>0||player.fovK>.5)return;const def=WEAP[w.id];
  if(S.fire){if(def.rpm===0&&S.fired)return;if(S.fireCd>0)return;if(w.inMag<=0){if(!S.fired)sfx.click();S.fired=1;S.fireCd=.25;return;}
    w.inMag--;S.fired=1;S.fireCd=def.rpm?60/def.rpm:.12;VM.kick=1;VM.cyc=0;VM.cocked=1;if(w.id==='pm'&&w.inMag===0)setTimeout(()=>{if(VM.id==='pm')VM.lock=1;},20);sfx.shot(w.id,w.id==='ak'&&S.equip.attach&&S.equip.attach.id==='pbs');
    fireFlash();
    {const f=V3(0,0,-1).applyQuaternion(camera.quaternion),r=V3(1,0,0).applyQuaternion(camera.quaternion),u=V3(0,1,0).applyQuaternion(camera.quaternion);
     const mp=camera.position.clone().addScaledVector(f,w.id==='ak'?.95:.6).addScaledVector(r,S.ads?0:.13).addScaledVector(u,S.ads?-.05:-.1);
     const sup=w.id==='ak'&&S.equip.attach&&S.equip.attach.id==='pbs';if(!sup)fxMuzzle(mp,f,w.id==='ak');else fxMuzzle(mp,f.multiplyScalar(.3),false);ejectCase(VM.gun,w.id,vmRoot);}muzzleLight.intensity=3;vmMuzzle.intensity=2;
    const spread=(S.ads?.004:.025)+(S.drunk>0?.03:0)+Math.hypot(player.vel.x,player.vel.z)*.008;ray.setFromCamera({x:rnd(-spread,spread),y:rnd(-spread,spread)},camera);
    const hits=ray.intersectObjects(HITS.length?shootables.concat(HITS):shootables,false);onPlayerShot();
    /* the flood water: a round that goes in throws up a splash and is spent */
    {const o=ray.ray.origin,dv=ray.ray.direction;if(dv.y<-1e-4&&o.y>W3.wl){const t=(W3.wl-o.y)/dv.y,wx=o.x+dv.x*t,wz=o.z+dv.z*t;
       if(t<300&&inDET(wx,wz)&&H(wx,wz)<W3.wl-.02&&(!hits.length||hits[0].distance>t)){WATER.splash(V3(wx,W3.wl,wz),.55);if(typeof crabWater==='function')crabWater(wx,wz);hits.length=0;}}}
    if(hits.length&&hits[0].object.userData.owner){const h=hits[0];h.object.userData.owner.onShot(h.object,h.point.clone(),ray.ray.direction.clone());}
    else if(hits.length&&hits[0].face){const h=hits[0];const n=h.face.normal.clone().transformDirection(h.object.matrixWorld);
      /* bullet holes stick to what was hit (they move and vanish with it); none on creatures or bodies */
      /* holes only in hard surfaces: not in soil, grass or foliage cards (the ray can hit a card's clear part - that left
         black dots hanging in the air and peppering the fields) */
      const mt0=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;
      const hard=mt0&&!mt0.userData.soft&&!mt0.alphaTest&&!mt0.transparent&&!h.object.isInstancedMesh&&!h.object.isPoints&&!h.object.isLine;
      if(hard&&!h.object.userData.onHit&&!h.object.isSkinnedMesh&&!h.object.userData.noDecal){
        const mpp=mt0.map,sk=mpp&&mpp===PB.brick.a?(mt0.color&&mt0.color.r>.7?'plaster':'brick'):mpp&&(mpp===PB.boards.a||mpp===PB.planks.a||mpp===PB.peel.a||mpp===M.boards.map)||[M.logs,M.planks,M.boards,M.wood,M.post].includes(mt0)?'wood':[M.paint,M.paintP,M.rust,M.steel,M.corrug,M.grille].includes(mt0)||(mt0.metalness>.5)?'metal':mt0===M.concrete||mt0===M.plaster?'plaster':'dirt';
        const d=new T.Mesh(G('hole2',()=>new T.CircleGeometry(.025,28)),decalMat(sk));d.position.copy(h.point).addScaledVector(n,.004);d.lookAt(h.point.clone().add(n));d.rotateZ(rnd(6.28));d.scale.setScalar(rnd(.8,1.2));
        scene.add(d);d.updateMatrixWorld();if(h.object!==scene&&h.object.parent)h.object.attach(d);decals.push(d);if(decals.length>80){const o=decals.shift();if(o.parent)o.parent.remove(o);}}
      const mt=Array.isArray(h.object.material)?h.object.material[0]:h.object.material;const surf=[M.logs,M.planks,M.boards,M.wood,M.post].includes(mt)?'wood':[M.paint,M.paintP,M.rust,M.steel,M.corrug,M.grille].includes(mt)?'metal':'dirt';
      fxImpact(h.point.clone().addScaledVector(n,.01),n,surf);if(h.object.userData.onHit)h.object.userData.onHit(h);}
    player.pitch+=def.rec[0]*(S.ads?.6:1);player.yaw+=rnd(-def.rec[1],def.rec[1]);S.sanity=clamp(S.sanity-.25,0,100);}
  else S.fired=0;}
function reload(){const w=S.equip.weapon;if(!w||S.reloading>0||ACT.kind||ACT.smk)return;const def=WEAP[w.id];const need=def.mag-w.inMag,have=S.ammo[def.ammo];if(need<=0||have<=0){sfx.click();if(have<=0)toast('No '+(def.ammo==='9x18'?'9×18':'5.45×39')+' ammunition.');return;}
  const empty=w.inMag===0;S.reloadFill=()=>{const n=Math.min(need,S.ammo[def.ammo]);w.inMag+=n;S.ammo[def.ammo]-=n;};
  if(VM.gun&&RL[w.id]){const K=RL[w.id](empty);VM.anim={K,t:0,fired:{},unlock:9};if(w.id==='pm'&&empty){VM.lock=1;const kf=K.find(k=>k.ev==='slidefwd');VM.anim.unlock=kf?kf.t-.04:9;}
    S.reloading=K[K.length-1].t;}
  else{S.reloading=w.id==='pm'?1.7:2.5;sfx.reload();}}
/* impact dust */
const puffs=[];const puffMat=new T.PointsMaterial({color:C(0x9a8e70),size:.08,transparent:true,opacity:.6,depthWrite:false});
function dustPuff(p,n){const g=new T.BufferGeometry();const a=new Float32Array(30);for(let i=0;i<10;i++){a[i*3]=p.x;a[i*3+1]=p.y;a[i*3+2]=p.z;}g.setAttribute('position',new T.BufferAttribute(a,3));
  const m=new T.Points(g,puffMat.clone());scene.add(m);puffs.push({m,a,v:Array.from({length:10},()=>V3(n.x+rnd(-.6,.6),n.y+rnd(0,.8),n.z+rnd(-.6,.6)).multiplyScalar(rnd(.4,1.4))),t:0});}

/* ---------- audio ---------- */
/* everything is synthesised. The chain: sources -> master -> a gentle compressor (the ear's own squash after a shot) ->
   the concussion low-pass -> out, with sends into two convolution reverbs built from generated impulse responses (open
   ground with a treeline: early reflections, a long dark tail; a small timber room). Sounds with a place in the world go
   through HRTF panners, so a shot comes from where the shooter is, quieter, later and darker with distance. */
const sfx={shotFar(){},whiz(){},hitFlesh(){},splash(){},crab(){},mech(){},tick(){},step(){},click(){},pick(){},creak(){},reload(){},shot(){},heart(){},caw(){},radio(){},launch(){},rocket(){},boom(){},thud(){},pop(){},crk(){},tin(){},muffle(){},stepAt(){},quiet(){}};let AC=null;
const AUD={lastGun:-99,birdT:3,frogT:6,creakT:20,gust:0,breath:0,brT:0,radio:null};
function initAudio(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();}catch(_){return;}const master=AC.createGain();master.gain.value=.55;
  const comp=AC.createDynamicsCompressor();comp.threshold.value=-12;comp.knee.value=12;comp.ratio.value=3.5;comp.attack.value=.003;comp.release.value=.25;
  /* everything goes through one low-pass so a concussion can muffle the world (the ringing in the ears bypasses it) */
  const mlp=AC.createBiquadFilter();mlp.type='lowpass';mlp.frequency.value=20000;mlp.Q.value=.5;master.connect(comp).connect(mlp).connect(AC.destination);sfx.lp=mlp;
  const nb=AC.createBuffer(1,AC.sampleRate*2,AC.sampleRate),d=nb.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  /* impulse responses: decaying noise that darkens as it goes, with a cluster of early reflections */
  const ir=(dur,pow,pre,dark,er)=>{const sr=AC.sampleRate,n=Math.floor(sr*dur),b=AC.createBuffer(2,n,sr);
    for(let c=0;c<2;c++){const x=b.getChannelData(c);let lp=0;for(let i=0;i<n;i++){const t=i/sr;const a=Math.min(.985,.08+t*dark);lp=lp*a+(Math.random()*2-1)*(1-a);x[i]=t<pre?0:lp*Math.pow(1-t/dur,pow)*(1+(1-a)*2);}
      for(let k=0;k<er.length;k++){const i=Math.floor((er[k][0]+Math.random()*.004)*sr);if(i<n)x[i]+=er[k][1]*(Math.random()<.5?-1:1)*(c?.9:1);}}return b;};
  const rvO=AC.createConvolver();rvO.buffer=ir(2.8,2.2,.012,2.4,[[.03,.5],[.055,.35],[.09,.3],[.14,.22],[.21,.3],[.33,.16]]);
  const rvI=AC.createConvolver();rvI.buffer=ir(.7,2.5,.003,7,[[.006,.6],[.011,.45],[.017,.35],[.024,.3]]);
  const rvOg=AC.createGain(),rvIg=AC.createGain();rvOg.gain.value=.55;rvIg.gain.value=0;const send=AC.createGain();send.connect(rvO).connect(rvOg).connect(master);send.connect(rvI).connect(rvIg).connect(master);AUD.rvOg=rvOg;AUD.rvIg=rvIg;
  /* the muzzle blast bus: a soft clipper for the hard edge of a real report, then dry and into the room */
  const blast=AC.createGain();{const ws=AC.createWaveShaper(),cv=new Float32Array(1024);for(let i=0;i<1024;i++){const x=i/511.5-1;cv[i]=Math.tanh(x*2.2)/Math.tanh(2.2);}ws.curve=cv;blast.connect(ws);ws.connect(master);const bs=AC.createGain();bs.gain.value=.9;ws.connect(bs).connect(send);}
  const wet=AC.createGain();wet.gain.value=.5;wet.connect(send);/* a dry sound that should also ring a little: connect to both */
  const both=AC.createGain();both.connect(master);both.connect(wet);
  const burst=(len,gain,f1,f2,type='bandpass',q=1,delay=0,out=master,att=.004)=>{const s=AC.createBufferSource();s.buffer=nb;const f=AC.createBiquadFilter();f.type=type;f.frequency.value=f1;f.Q.value=q;const g=AC.createGain();const t=AC.currentTime+Math.max(0,delay);
    g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(Math.max(gain,.0002),t+att);g.gain.exponentialRampToValueAtTime(.0001,t+len);if(f2)f.frequency.exponentialRampToValueAtTime(f2,t+len);s.connect(f).connect(g).connect(out);s.start(t,Math.random()*1.5);s.stop(t+len+.05);};
  const tone=(f0,f1,len,gain,delay=0,out=master,type='sine',att=.002)=>{const o=AC.createOscillator();o.type=type;const t=AC.currentTime+delay;o.frequency.setValueAtTime(f0,t);if(f1)o.frequency.exponentialRampToValueAtTime(f1,t+len);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain,t+att);g.gain.exponentialRampToValueAtTime(.0001,t+len);o.connect(g).connect(out);o.start(t);o.stop(t+len+.05);};
  const grains=(n,span,g,f,q,delay=0,out=master)=>{for(let i=0;i<n;i++)burst(.008+Math.random()*.018,g*(.45+Math.random()*.7),f*(.7+Math.random()*.6),0,'bandpass',q,delay+Math.random()*span,out,.001);};
  /* a place in the world: an HRTF panner (cheaper equal-power for the ambient bed) feeding the mix and the reverb */
  const pan=(p,ref=5,roll=1,hrtf=true,wetK=.6)=>{const n=AC.createPanner();n.panningModel=hrtf?'HRTF':'equalpower';n.distanceModel='inverse';n.refDistance=ref;n.rolloffFactor=roll;n.maxDistance=5000;
    if(n.positionX){n.positionX.value=p.x;n.positionY.value=p.y;n.positionZ.value=p.z;}else n.setPosition(p.x,p.y,p.z);n.connect(master);const w=AC.createGain();w.gain.value=wetK;n.connect(w).connect(send);return n;};
  AUD.pan=pan;AUD.burst=burst;AUD.tone=tone;AUD.master=master;AUD.send=send;AUD.nb=nb;
  sfx.tick=()=>burst(.01,.35,5200,2600,'highpass',.5);
  /* the Geiger counter: a household dosimeter of the Soviet kind in the chest pouch - an SBM-20 tube and a little speaker.
     A count is one pulse a few microseconds long; what is heard is the speaker's own answer to it: a hard, dry tick with a
     very short bright ring and a hint of the plastic case behind it, no tone, no beep. One impulse response is computed
     here and every count plays it, each a touch different in level and pitch, at the exact moment the count falls -
     scheduled on the audio clock, so at a high rate the ticks run together into the real crackle and hiss instead of
     arriving in lumps once a frame */
  /* (eight clicks, each its own speaker's answer: the cone's resonances and their decays a little different, now and
     then a second strike as the cone bounces back - picked at random for every count, so the run of ticks never
     repeats itself like a machine) */
  {const sr=AC.sampleRate,n=Math.floor(sr*.016),BS=[];for(let v=0;v<8;v++){const b=AC.createBuffer(1,n,sr),x=b.getChannelData(0);let m=0;const j=()=>.8+Math.random()*.4;
     const f1=3300*j(),f2=1250*j(),f3=460*j(),d1=.0006*j(),d2=.0016*j(),d3=.0045*j(),a2=.42*j(),bounce=Math.random()<.35?.0011+Math.random()*.0009:0;
     for(let i=0;i<n;i++){const t=i/sr;let y=(i<2?.85*(i?-.6:1):0)+Math.exp(-t/d1)*Math.sin(6.2832*f1*t)*.7+Math.exp(-t/d2)*Math.sin(6.2832*f2*t+.7)*a2+Math.exp(-t/d3)*Math.sin(6.2832*f3*t+1.3)*.12+(Math.random()*2-1)*Math.exp(-t/.00035)*.35;
       if(bounce&&t>bounce){const u=t-bounce;y+=-.35*Math.exp(-u/(d1*.8))*Math.sin(6.2832*f1*1.04*u);}x[i]=y;m+=y;}
     m/=n;for(let i=0;i<n;i++)x[i]-=m*Math.exp(-i/sr/.004);BS.push(b);}const b=BS[0];
   const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=280;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=8500;const gb=AC.createGain();gb.gain.value=.42;hp.connect(lp).connect(gb).connect(master);
   sfx.geigerAt=t=>{const s=AC.createBufferSource();s.buffer=BS[(Math.random()*BS.length)|0];s.playbackRate.value=.95+Math.random()*.1;const g=AC.createGain();g.gain.value=.5+Math.random()*.4;s.connect(g).connect(hp);s.start(t);};}
  /* footsteps by surface: the heel, then the grit, gravel or grass under it, with the kit moving on the body */
  const stepOn=(s,k,out,dl=0)=>{switch(s){
    case 'wood':burst(.1,.3*k,240,110,'lowpass',.8,dl,out);tone(150+Math.random()*30,95,.09,.12*k,dl,out);grains(2,.04,.04*k,2400,3,dl,out);break;
    case 'asphalt':burst(.035,.2*k,1700,900,'bandpass',1.3,dl,out);burst(.05,.12*k,260,0,'lowpass',.7,dl,out);grains(3,.05,.05*k,3600,3,dl+.01,out);break;
    case 'gravel':grains(10,.08,.08*k,2500,2.2,dl,out);burst(.08,.14*k,300,90,'lowpass',.6,dl,out);break;
    case 'dirt':grains(5,.05,.055*k,1600,1.6,dl,out);burst(.09,.17*k,340,100,'lowpass',.6,dl,out);break;
    case 'mud':burst(.13,.13*k,300,1400,'lowpass',2.5,dl,out);burst(.05,.07*k,900,2600,'bandpass',4,dl+.1,out);burst(.07,.1*k,220,0,'lowpass',.7,dl,out);break;
    default:burst(.16,.07*k,3800,2400,'highpass',.4,dl,out,.03);grains(5,.09,.035*k,4800,1.3,dl,out);burst(.08,.14*k,300,100,'lowpass',.5,dl,out);}};
  sfx.step=(s,v=2.6)=>{const k=clamp(v/3,.45,1.35);stepOn(s,k,master);burst(.14,.035*k,2200,1500,'bandpass',.6,.02);
    if(v>4)grains(2,.06,.05,3900,7,.03);};
  sfx.stepAt=(p,s,v=1.5)=>{const d=p.distanceTo(camera.position);if(d>20)return;stepOn(s,clamp(v/3,.4,1),pan(p,2,1.4,true,.3));};
  sfx.click=()=>burst(.03,.3,2800,1200,'bandpass',3);
  sfx.pick=()=>{burst(.1,.25,1400,500,'bandpass',2);burst(.08,.2,900,300,'bandpass',2,.08);};
  sfx.creak=(v=.07,out=master)=>{const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(80+Math.random()*40,AC.currentTime);o.frequency.exponentialRampToValueAtTime(150+Math.random()*80,AC.currentTime+.8);const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=4;
    const g=AC.createGain();g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(v,AC.currentTime+.08);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+.9);o.connect(f).connect(g).connect(out);o.start();o.stop(AC.currentTime+1);};
  /* reload foley: polymer and steel clicks, the paddle, the magazine scraping out, seating, the bolt/slide running */
  sfx.mech=(e,id)=>{const ak=id==='ak';switch(e){
    case 'paddle':burst(.025,.25,3400,2200,'bandpass',5);break;
    case 'magout':burst(.06,.32,ak?1700:2400,ak?900:1400,'bandpass',3);burst(.18,.12,ak?900:1500,ak?400:700,'bandpass',1.5,.03);break;
    case 'tap':burst(.03,.22,ak?1500:2600,0,'bandpass',4);break;
    case 'magin':burst(.04,.5,ak?2300:3000,ak?1200:1700,'bandpass',4,0,master,.001);burst(.05,.35,ak?600:900,0,'lowpass',.7,.005);burst(.02,.3,4200,0,'bandpass',6,.012,master,.001);break;
    case 'boltback':burst(.09,.4,1900,800,'bandpass',3);burst(.05,.3,3000,0,'bandpass',5,.07,master,.001);break;
    case 'boltfwd':burst(.05,.6,2600,900,'bandpass',3,0,master,.001);burst(.08,.45,500,0,'lowpass',.7);tone(1350,1250,.12,.03,0,master,'triangle');break;
    case 'slideback':burst(.06,.3,2800,1500,'bandpass',4);break;
    case 'slidefwd':burst(.04,.55,3200,1400,'bandpass',4,0,master,.001);burst(.06,.35,700,0,'lowpass',.7);break;}};
  sfx.reload=()=>{burst(.07,.35,2000,900,'bandpass',4,.15);burst(.09,.4,1300,500,'bandpass',4,.75);burst(.06,.45,2600,1300,'bandpass',4,1.25);};
  /* a gunshot heard from far off: the report arrives late and darker, the treeline throws it back, the valley rolls it on */
  sfx.shotFar=(d,big=true,p)=>{AUD.lastGun=S.t;const dl=Math.min(1.5,d/343),dk=clamp(d/160,0,1);const out=p?pan(p,6,.8,true,.9):master,k=p?1:1/(1+d/22);
    burst(.012,1.1*k*(1-dk*.7),lerp(5200,2400,dk),0,'highpass',.6,dl,out,.0006);
    burst(.28,1.5*k,lerp(big?1500:1900,500,dk),70,'lowpass',.55,dl,out,.001);burst(.13,.6*k,lerp(3400,1100,dk),600,'bandpass',.7,dl,out);
    tone(95,40,.16,.5*k*(1-dk*.6),dl,out);
    [[.19,.32],[.44,.2],[.8,.13],[1.25,.08]].forEach(([e,g])=>burst(.45,g*k*1.3,lerp(900,420,dk),150,'lowpass',.5,dl+e+Math.random()*.08,wet));
    burst(1.9,.18*k,420,80,'lowpass',.3,dl+.12,both);};
  /* a round going past: the supersonic snap, then the tearing hiss */
  sfx.whiz=()=>{burst(.006,.9,4000,0,'highpass',.7,0,master,.0004);burst(.08,.45,5200,1700,'bandpass',1.4,.004);burst(.03,.5,2600,0,'highpass',.8,.002);};
  sfx.hitFlesh=(v=1)=>{burst(.09,.6*v,700,180,'lowpass',1.2);burst(.05,.3*v,1900,900,'bandpass',1.5,.01);tone(110,60,.08,.25*v);};
  sfx.splash=(v=1)=>{const k=Math.min(v,1.6);burst(.22,.22*k,900,240,'lowpass',.8);burst(.14,.12*k,2400,800,'bandpass',.9,.03);grains(4,.18,.05*k,3200,2,.04);burst(.3,.06*k,600,200,'lowpass',1.5,.12);};
  /* the crayfish: chitin clicking as the legs go down, bubbles, the water bursting as one comes up, the claw slamming
     shut, the crunch of it closing on you, and the rasp - plates of the shell ground together, a stuttering scrape over a
     growl that is felt more than heard */
  sfx.crab=(k,p)=>{const t=AC.currentTime;const out=p?pan(p,4,1.1,true,.7):both;
    if(k==='click'){for(let i=0;i<5;i++)burst(.018,.3,1800+Math.random()*2200,900,'bandpass',4,i*.05+Math.random()*.03,out,.001);return;}
    if(k==='bubble'){for(let i=0;i<4;i++)tone(240+Math.random()*260,480+Math.random()*400,.07,.07,i*.09+Math.random()*.05,out);burst(.25,.05,500,200,'lowpass',1.5,0,out,.02);return;}
    if(k==='snap'){burst(.03,.9,2600,1200,'bandpass',3,0,out,.0008);burst(.12,.6,500,120,'lowpass',.8,.004,out);tone(160,70,.1,.35,0,out);return;}
    if(k==='crunch'){grains(9,.12,.28,1500,2,0,out);burst(.12,.5,420,110,'lowpass',.8,0,out);tone(90,50,.12,.3,.01,out);return;}
    if(k==='erupt'){burst(1.3,.75,700,160,'lowpass',.7,0,out,.02);burst(.5,.45,2400,700,'bandpass',.8,.03,out,.01);grains(14,.6,.12,3000,1.5,.05,out);burst(.9,.25,300,80,'lowpass',1,.25,out);return;}
    const die=k==='die',scr=k==='screech',len=die?1.7:scr?1.4:.8;
    const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(die?150:scr?125:185,t);o.frequency.exponentialRampToValueAtTime(die?38:scr?68:105,t+len);
    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=die?600:780;f.Q.value=1.1;
    const am=AC.createOscillator();am.type='square';am.frequency.value=die?11:22+Math.random()*12;const amd=AC.createGain();amd.gain.value=.45;am.connect(amd);
    const ag=AC.createGain();ag.gain.value=.55;amd.connect(ag.gain);const env=AC.createGain();env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(die?.4:.5,t+.05);env.gain.exponentialRampToValueAtTime(.0001,t+len);
    o.connect(f).connect(ag).connect(env).connect(out);o.start(t);o.stop(t+len+.1);am.start(t);am.stop(t+len+.1);
    const n=AC.createBufferSource();n.buffer=nb;const f2=AC.createBiquadFilter();f2.type='bandpass';f2.frequency.value=2600;f2.Q.value=.9;const ag2=AC.createGain();ag2.gain.value=.5;amd.connect(ag2.gain);
    const env2=AC.createGain();env2.gain.setValueAtTime(.0001,t);env2.gain.exponentialRampToValueAtTime(scr?.38:.3,t+.03);env2.gain.exponentialRampToValueAtTime(.0001,t+len*.9);
    n.connect(f2).connect(ag2).connect(env2).connect(out);n.start(t,Math.random());n.stop(t+len);
    tone(die?55:62,die?30:44,len,.35,0,out,'triangle',.04);};
  /* the player's own shot: the supersonic crack and muzzle blast through the clipper, the chest thump, the bolt carrier
     slamming, echoes off the treeline, the reverb, and the case landing a moment later */
  sfx.shot=(id,sup)=>{const ak=id==='ak';AUD.lastGun=S.t;const ind=AUD.ind;
    if(sup){burst(.1,.9,1100,280,'lowpass',.7,0,both);burst(.05,.35,2400,900,'bandpass',1.2);burst(.03,.55,2700,0,'bandpass',4,.012,master,.001);burst(.05,.3,1500,0,'bandpass',3,.05);}
    else{burst(.008,ak?2.4:1.8,ak?3800:3200,0,'highpass',.7,0,blast,.0004);burst(ak?.16:.12,ak?1.9:1.5,ak?1500:1900,180,'lowpass',.6,0,blast,.0008);burst(.07,ak?1:.8,3300,1200,'bandpass',.8,0,blast,.001);
      tone(ak?125:150,36,.15,ak?.95:.75);burst(.025,.32,ak?2500:3100,0,'bandpass',4,ak?.032:.02,master,.001);
      if(!ind)[[.21,.36],[.47,.24],[.86,.15],[1.35,.09]].forEach(([e,g])=>burst(.4,g*(ak?1:.75),800,160,'lowpass',.5,e+Math.random()*.06,wet));
      burst(1.4,.16,600,110,'lowpass',.3,.06,both);}
    if(!(S.wade>.1))for(let k=0;k<3;k++)tone(5200+Math.random()*2400,0,.025,.035,.42+k*.08+Math.random()*.05,master,'triangle',.001);};
  sfx.heart=()=>{[0,.18].forEach(dl=>tone(46,0,.22,.5,dl,master,'sine',.02));};
  sfx.scream=(k=1)=>{const t=AC.currentTime;const o=AC.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(320,t);o.frequency.exponentialRampToValueAtTime(90,t+.9*k);
    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=900;f.Q.value=3;const g=AC.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.22*k,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+1*k);
    o.connect(f).connect(g).connect(both);o.start(t);o.stop(t+1.1*k);burst(.9*k,.25*k,2400,300,'bandpass',2,0,both);};
  sfx.muffle=(f,tc=.15)=>{mlp.frequency.setTargetAtTime(f,AC.currentTime,tc);};
  sfx.radio=()=>{burst(.12,.35,2200,1400,'bandpass',3);burst(.5,.12,1800,900,'bandpass',1.5,.05);for(let k=0;k<5;k++)burst(.02,.25,3200,2000,'bandpass',4,Math.random()*.5);};
  sfx.launch=()=>{burst(.7,1.6,700,60,'lowpass',.6,0,blast);burst(1.4,.7,2400,400,'bandpass',.7,.03,both);tone(90,30,.35,1.1);};
  sfx.rocket=(d=2.6)=>{const s=AC.createBufferSource();s.buffer=nb;s.loop=true;const f=AC.createBiquadFilter();f.type='bandpass';f.Q.value=1.2;f.frequency.setValueAtTime(700,AC.currentTime);f.frequency.exponentialRampToValueAtTime(2600,AC.currentTime+d);
    const g=AC.createGain();g.gain.setValueAtTime(.0001,AC.currentTime);g.gain.exponentialRampToValueAtTime(.55,AC.currentTime+d*.85);g.gain.exponentialRampToValueAtTime(.0001,AC.currentTime+d+.05);s.connect(f).connect(g).connect(master);s.start();s.stop(AC.currentTime+d+.1);};
  sfx.boom=()=>{AUD.lastGun=S.t;burst(3.2,2.6,1000,35,'lowpass',.5,0,blast);burst(.5,1.4,3600,500,'bandpass',.5,0,blast);burst(5,.5,260,50,'lowpass',.4,.25,both);for(let k=0;k<7;k++)burst(.08,.35,2600,900,'bandpass',2,.3+Math.random()*1.8);tone(60,22,1.6,1.6);};
  sfx.thud=(v=1)=>{burst(.3,1*v,320,50,'lowpass',.7);tone(75,32,.25,.9*v);};
  sfx.pop=(v=1)=>{AUD.lastGun=S.t;burst(.35,.7*v,1300,160,'lowpass',.7,0,both);burst(.12,.45*v,3800,900,'bandpass',.8);for(let k=0;k<3;k++)burst(.04,.2*v,3000,1500,'bandpass',3,.05+Math.random()*.3);};
  sfx.crk=(v=1)=>burst(.025+Math.random()*.04,.18*v,1800+Math.random()*2400,700,'bandpass',2.5,0,both);
  /* tinnitus: two sine tones straight to the output */
  {const tg=AC.createGain();tg.gain.value=0;tg.connect(AC.destination);[[5600,.6],[3900,.25],[6100,.15]].forEach(([f,a])=>{const o=AC.createOscillator();o.frequency.value=f;const g=AC.createGain();g.gain.value=a;o.connect(g).connect(tg);o.start();});
   sfx.tin=(v,tc=.3)=>{tg.gain.setTargetAtTime(v*.09,AC.currentTime,tc);};}
  /* a crow somewhere off in the trees */
  sfx.caw=()=>{const a=Math.random()*6.28,r=25+Math.random()*30;const out=pan(V3(camera.position.x+Math.cos(a)*r,camera.position.y+8,camera.position.z+Math.sin(a)*r),8,1,false,.7);const t=AC.currentTime;
    for(let k=0;k<2+Math.floor(Math.random()*2);k++){const o=AC.createOscillator();o.type='sawtooth';const st=t+k*.42;o.frequency.setValueAtTime(560,st);o.frequency.exponentialRampToValueAtTime(330,st+.28);
    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=1200;f.Q.value=2;const g=AC.createGain();g.gain.setValueAtTime(.0001,st);g.gain.exponentialRampToValueAtTime(.4,st+.03);g.gain.exponentialRampToValueAtTime(.0001,st+.3);o.connect(f).connect(g).connect(out);o.start(st);o.stop(st+.35);}};
  /* songbirds: a few call types, each from a point in the trees */
  sfx.bird=(p)=>{const out=pan(p,10,1,false,.5);const ty=Math.floor(Math.random()*4),base=2600+Math.random()*2400;
    if(ty===0){for(let r=0;r<3;r++){tone(base*1.3,base*1.25,.07,.1,r*.32,out);tone(base,base*.95,.08,.08,r*.32+.11,out);}}
    else if(ty===1){const n=8+Math.floor(Math.random()*8);for(let r=0;r<n;r++)tone(base*(1+(r%2)*.15),base*.92,.035,.07,r*.045,out);}
    else if(ty===2){const o=AC.createOscillator(),m=AC.createOscillator(),mg=AC.createGain(),g=AC.createGain(),t=AC.currentTime;o.frequency.setValueAtTime(base,t);o.frequency.linearRampToValueAtTime(base*1.35,t+.5);m.frequency.value=28+Math.random()*25;mg.gain.value=base*.12;
      m.connect(mg).connect(o.frequency);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.08,t+.05);g.gain.exponentialRampToValueAtTime(.0001,t+.55);o.connect(g).connect(out);o.start(t);m.start(t);o.stop(t+.6);m.stop(t+.6);}
    else{tone(base*.75,base*1.1,.18,.09,0,out);tone(base*1.1,base*.7,.22,.07,.25,out);}};
  /* frogs in the flooded basin: a pulsed rattle through the throat's resonance */
  sfx.frog=(p)=>{const out=pan(p,6,1,false,.5);const t=AC.currentTime,len=.25+Math.random()*.35;const o=AC.createOscillator();o.type='sawtooth';o.frequency.value=90+Math.random()*60;
    const am=AC.createOscillator();am.type='square';am.frequency.value=18+Math.random()*14;const ag=AC.createGain();ag.gain.value=.5;const g=AC.createGain();g.gain.value=0;const env=AC.createGain();
    const f=AC.createBiquadFilter();f.type='bandpass';f.frequency.value=500+Math.random()*400;f.Q.value=3;am.connect(ag).connect(g.gain);o.connect(g).connect(f).connect(env).connect(out);
    env.gain.setValueAtTime(.0001,t);env.gain.exponentialRampToValueAtTime(.35,t+.03);env.gain.setValueAtTime(.35,t+len-.05);env.gain.exponentialRampToValueAtTime(.0001,t+len);o.start(t);am.start(t);o.stop(t+len+.05);am.stop(t+len+.05);};
  /* wind: a low roar and, higher up, the leaves, both swelling with gusts */
  const ws=AC.createBufferSource();ws.buffer=nb;ws.loop=true;const wf=AC.createBiquadFilter();wf.type='lowpass';wf.frequency.value=420;const wg=AC.createGain();wg.gain.value=.06;ws.connect(wf).connect(wg).connect(master);ws.start();sfx.windG=wg;sfx.windF=wf;
  {const ls=AC.createBufferSource();ls.buffer=nb;ls.loop=true;ls.playbackRate.value=.85;const lf=AC.createBiquadFilter();lf.type='bandpass';lf.frequency.value=3200;lf.Q.value=.5;const lg=AC.createGain();lg.gain.value=0;ls.connect(lf).connect(lg).connect(master);ls.start(0,1.1);sfx.leafG=lg;}
  /* breath: in and out through a bandpass, when winded */
  {const bs=AC.createBufferSource();bs.buffer=nb;bs.loop=true;const bf=AC.createBiquadFilter();bf.type='bandpass';bf.frequency.value=1100;bf.Q.value=.9;const bg=AC.createGain();bg.gain.value=0;bs.connect(bf).connect(bg).connect(master);bs.start(0,.3);sfx.breathG=bg;sfx.breathF=bf;}
  const eo=AC.createOscillator();eo.type='sawtooth';eo.frequency.value=36;const ef=AC.createBiquadFilter();ef.type='lowpass';ef.frequency.value=180;const eg=AC.createGain();eg.gain.value=0;eo.connect(ef).connect(eg).connect(master);eo.start();
  /* rain: broadband hiss through a filter that closes when indoors, plus a low patter layer */
  {const rs=AC.createBufferSource();rs.buffer=nb;rs.loop=true;const rf=AC.createBiquadFilter();rf.type='lowpass';rf.frequency.value=3800;const rh=AC.createBiquadFilter();rh.type='highpass';rh.frequency.value=380;
   const rg=AC.createGain();rg.gain.value=0;rs.connect(rh).connect(rf).connect(rg).connect(master);rs.start();
   const ps=AC.createBufferSource();ps.buffer=nb;ps.loop=true;ps.playbackRate.value=.6;const pf=AC.createBiquadFilter();pf.type='bandpass';pf.frequency.value=900;pf.Q.value=.7;ps.connect(pf).connect(rg);ps.start(0,.7);
   sfx.rain={g:rg,f:rf,src:[rs,ps]};sfx.thunder=(v)=>{burst(3.5,.6*v,180,40,'lowpass',.7,0,both);burst(1.2,.35*v,600,120,'lowpass',.5,.08,both);for(let k=0;k<4;k++)burst(1.2,.2*v,300,60,'lowpass',.6,.4+k*.5+Math.random()*.4,wet);};}
  const es=AC.createBufferSource();es.buffer=nb;es.loop=true;const esf=AC.createBiquadFilter();esf.type='lowpass';esf.frequency.value=140;es.connect(esf).connect(eg);es.start();sfx.engine=eg;sfx.engineO=eo;
  const fo=AC.createOscillator();fo.type='sawtooth';fo.frequency.value=205;const ff=AC.createBiquadFilter();ff.type='bandpass';ff.frequency.value=420;ff.Q.value=3;const fg=AC.createGain();fg.gain.value=0;const lfo=AC.createOscillator();lfo.frequency.value=7;const lg=AC.createGain();lg.gain.value=18;lfo.connect(lg).connect(fo.frequency);fo.connect(ff).connect(fg).connect(master);fo.start();lfo.start();sfx.flies=fg;
  /* ---- recorded sounds (all CC0: The Free Firearm Sound Library by Still North Media, Kenney's Impact Sounds, and
     Freesound recordings), decoded once; each replaces or sits under its synthesized counterpart, which stays as the
     fallback until it has decoded or if it fails to ---- */
  AUD.buf={};
  if(window.SNDB64)for(const k in SNDB64){AUD.buf[k]=[];SNDB64[k].forEach((b64,i)=>{try{const bin=atob(b64),u=new Uint8Array(bin.length);for(let j=0;j<bin.length;j++)u[j]=bin.charCodeAt(j);
      AC.decodeAudioData(u.buffer,buf=>{AUD.buf[k][i]=buf;},()=>{});}catch(_){}});}
  const has=k=>!!(AUD.buf[k]&&AUD.buf[k].some(Boolean));
  const play=(k,out=master,g=1,rate=1,dl=0,idx)=>{const L=AUD.buf[k];if(!L)return null;const v=L.filter(Boolean);if(!v.length)return null;const b=idx!==undefined&&L[idx]?L[idx]:v[Math.floor(Math.random()*v.length)];
    const s=AC.createBufferSource();s.buffer=b;s.playbackRate.value=rate;const gn=AC.createGain();gn.gain.value=g;s.connect(gn).connect(out);s.start(AC.currentTime+Math.max(0,dl));return{s,g:gn};};
  AUD.has=has;AUD.play=play;AUD.beds={};
  /* looping beds (birds, frogs, wind, wading), started silent the first time they are wanted */
  AUD.bed=k=>{if(AUD.beds[k])return AUD.beds[k];const L=AUD.buf[k];if(!L||!L[0])return null;const b=L[0];const s=AC.createBufferSource();s.buffer=b;s.loop=true;s.loopStart=.06;s.loopEnd=b.duration-.06;
    const g=AC.createGain();g.gain.value=0;s.connect(g).connect(master);s.start(0,.06+Math.random()*b.duration*.7);return AUD.beds[k]={s,g};};
  /* your own rifle or pistol: the recorded report, dry and into the reverb, the treeline throwing it back, the chest thump */
  {const syn=sfx.shot;sfx.shot=(id,sup)=>{const ak=id==='ak',k=ak?'ak':'pm';if(sup||!has(k)){syn(id,sup);return;}AUD.lastGun=S.t;const ind=AUD.ind,r=.97+Math.random()*.06;
    play(k,master,ak?1.55:1.3,r);play(k,wet,ind?.16:.42,r);tone(ak?110:140,36,.16,ak?.85:.65);
    if(!ind)[[.24,.3],[.52,.2],[.9,.12]].forEach(([e,g])=>burst(.4,g*(ak?1:.75),800,160,'lowpass',.5,e+Math.random()*.06,wet));
    if(!(S.wade>.1))for(let q=0;q<3;q++)tone(5200+Math.random()*2400,0,.025,.035,.42+q*.08+Math.random()*.05,master,'triangle',.001);};}
  /* someone else's: the far report, later and darker the further off, from where it was fired */
  {const syn=sfx.shotFar;sfx.shotFar=(d,big=true,p)=>{if(!has('akfar')){syn(d,big,p);return;}AUD.lastGun=S.t;const dl=Math.min(1.5,d/343),dk=clamp(d/160,0,1);
    const out=p?pan(p,10,.7,true,.9):master,k=p?1:1/(1+d/22);const f=AC.createBiquadFilter();f.type='lowpass';f.frequency.value=lerp(15000,1900,Math.pow(dk,.6));f.Q.value=.5;f.connect(out);
    play('akfar',f,1.9*k,big?.96+Math.random()*.08:1.2+Math.random()*.06,dl);
    [[.44,.18],[.8,.11]].forEach(([e,g])=>burst(.45,g*k,lerp(900,420,dk),150,'lowpass',.5,dl+e+Math.random()*.08,wet));};}
  /* footsteps by surface */
  {const SK={grass:'st_grass',dirt:'st_dirt',gravel:'st_crunch',asphalt:'st_hard',wood:'st_wood',mud:'st_dirt'};
   const rec=(s,k,out,dl=0)=>{const key=SK[s]||'st_grass';if(!has(key)){stepOn(s,k,out,dl);return;}play(key,out,(s==='wood'||s==='asphalt'?.3:.36)*k,.9+Math.random()*.2,dl);
     if(s==='mud')burst(.13,.1*k,300,1400,'lowpass',2.5,dl,out);};
   sfx.step=(s,v=2.6)=>{const k=clamp(v/3,.45,1.35);rec(s,k,master);burst(.14,.035*k,2200,1500,'bandpass',.6,.02);if(v>4)grains(2,.06,.05,3900,7,.03);};
   sfx.stepAt=(p,s,v=1.5)=>{const d=p.distanceTo(camera.position);if(d>20)return;rec(s,clamp(v/3,.4,1),pan(p,2,1.4,true,.3));};}
  /* reloading */
  {const syn=sfx.mech;sfx.mech=(e,id)=>{const r=id==='ak'?1:1.22;
    if(e==='magout'&&has('magout'))play('magout',master,.5,r);else if(e==='magin'&&has('magin'))play('magin',master,.55,r);
    else if((e==='boltback'||e==='slideback')&&has('rack'))play('rack',master,.5,r*(e==='slideback'?1.1:1));else syn(e,id);};}
  /* water */
  {const syn=sfx.splash;sfx.splash=(v=1)=>{if(!has('splash')){syn(v);return;}const k=Math.min(v,1.6);play('splash',master,.16*k,1.08-.12*Math.min(k,1)+Math.random()*.08,0,k>1.1?0:1);};}
  {const syn=sfx.caw;sfx.caw=()=>{if(!has('crow')){syn();return;}const a=Math.random()*6.28,r=25+Math.random()*30;play('crow',pan(V3(camera.position.x+Math.cos(a)*r,camera.position.y+8,camera.position.z+Math.sin(a)*r),8,1,false,.7),.55,.94+Math.random()*.12);};}
  /* rain: once the recording has decoded it takes the noise's place in the same chain (indoor filter, weather gain) */
  AUD.rainRec=()=>{if(AUD.rainOn||!has('rain')||!sfx.rain)return;AUD.rainOn=true;try{sfx.rain.src.forEach(x=>x.disconnect());}catch(_){}
    const b=AUD.buf.rain.find(Boolean);const rs2=AC.createBufferSource();rs2.buffer=b;rs2.loop=true;rs2.loopStart=.06;rs2.loopEnd=b.duration-.06;const g=AC.createGain();g.gain.value=1.6;rs2.connect(g).connect(sfx.rain.f);rs2.start(0,Math.random()*b.duration*.5);};
  {const syn=sfx.thunder;sfx.thunder=v=>{if(!has('thunder')){syn(v);return;}play('thunder',both,.7*v,.9+Math.random()*.15);burst(3.5,.3*v,180,40,'lowpass',.7,0,both);};}
  {const syn=sfx.boom;sfx.boom=()=>{if(!has('boom')){syn();return;}AUD.lastGun=S.t;play('boom',blast,1.1);play('boom',wet,.45);tone(60,22,1.6,1.3);burst(5,.35,260,50,'lowpass',.4,.25,both);};}
}

/* ---------- the camp radio: a fingerpicked guitar on a transistor set ----------
   A minute and a half of slow minor-key fingerpicking (arpeggios over Am, Dm, G, E and F, a melody on the top strings,
   now and then a strum), rendered once with Karplus-Strong strings into a buffer, then played through a small cheap
   speaker: band-limited, a little overdriven, with hiss, crackle and the signal drifting. It sits at the radio, so you
   hear it from across the yard and it gets louder as you come up to it. */
function radioSong(sr){const dur=96,n=Math.floor(sr*dur),out=new Float32Array(n);const R=rng(1972),jobs=[];
  const ks=(f,t0,len,amp,bright)=>jobs.push([f,t0,len,amp,bright,R()]);
  const nf=m=>440*Math.pow(2,(m-69)/12);
  /* chord shapes as MIDI notes, bass first */
  const CH={Am:[45,52,57,60,64],Dm:[50,57,62,65],G:[43,50,55,59,62],E:[40,47,52,56,59,64],F:[41,48,53,57,60],C:[48,55,60,64],Em:[40,47,52,55,59]};
  const prog=['Am','Am','Dm','Am','E','E','Am','Am','F','C','G','Em','Am','Dm','E','Am'];
  const mel=[[76,74,72,71],[72,71,69,0],[74,72,69,0],[72,71,69,67],[68,71,74,71],[68,0,64,0],[72,71,69,71],[69,0,0,0],[72,74,72,69],[67,0,64,67],[71,69,67,0],[67,64,0,0],[72,71,69,67],[69,72,74,0],[71,68,64,68],[69,0,0,0]];
  const bar=2.9;let t=.6;
  for(let rep=0;rep<2;rep++)for(let b=0;b<prog.length&&t<dur-4;b++){const c=CH[prog[b]];const sw=()=>(R()-.5)*.025;
    /* bass on the beat and the fifth halfway, the arpeggio rolling up and back between */
    ks(nf(c[0]),t+sw(),3.5,.55,false);ks(nf(c[0]+7),t+bar*.5+sw(),2.5,.35,false);
    const up=c.slice(1);[0,1,2,1,0,1,2,1].forEach((q,i)=>ks(nf(up[Math.min(q+(i>3?1:0),up.length-1)]),t+bar*(i/8)+bar/16+sw(),2.2,.22,false));
    /* the melody on the second pass, a soft strum at the end of each phrase on the first */
    if(rep===1||b%4===3)mel[b].forEach((m,i)=>{if(m)ks(nf(m),t+bar*i/4+sw()*.6,2.6,.34,true);});
    if(b%4===0&&rep===0)c.forEach((m,i)=>ks(nf(m),t+bar*.75+i*.018,2,.12,false));
    t+=bar*(b===prog.length-1?1.3:1);}
  /* one Karplus-Strong string per note, run a few at a time so it never stalls a frame */
  const run=([f,t0,len,amp,bright,seed])=>{const N=Math.max(2,Math.round(sr/f)),buf=new Float32Array(N);let r=seed*1e4;for(let i=0;i<N;i++){r=(r*16807+11)%2147483647;buf[i]=r/1073741823.5-1;}
    for(let p=0;p<(bright?1:3);p++)for(let i=1;i<N;i++)buf[i]=(buf[i]+buf[i-1])*.5;
    const s0=Math.floor(t0*sr),L=Math.min(Math.floor(len*sr),n-s0);const dec=.4985+Math.min(.0012,f/400000);let j=0;
    for(let i=0;i<L;i++){const j2=j+1===N?0:j+1;const v=buf[j];buf[j]=(v+buf[j2])*dec;j=j2;out[s0+i]+=v*amp*(i<30?i/30:1);}};
  return{out,jobs,sr,step(k){for(let i=0;i<k&&jobs.length;i++)run(jobs.pop());if(!jobs.length&&!this.done){let mx=0;for(let i=0;i<n;i++)mx=Math.max(mx,Math.abs(out[i]));for(let i=0;i<n;i++)out[i]/=mx*1.05;this.done=true;}return this.done;}};}
function radioMusic(pos,song){if(!AC||AUD.radio)return;const b=AC.createBuffer(1,song.out.length,song.sr);b.getChannelData(0).set(song.out);
  const src=AC.createBufferSource();src.buffer=b;src.loop=true;
  /* the little speaker: no bass, no top, a bump in the mids, a little drive */
  const hp=AC.createBiquadFilter();hp.type='highpass';hp.frequency.value=320;hp.Q.value=.8;const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3400;lp.Q.value=1.2;
  const pk=AC.createBiquadFilter();pk.type='peaking';pk.frequency.value=1500;pk.gain.value=5;pk.Q.value=1;
  const ws=AC.createWaveShaper(),cv=new Float32Array(512);for(let i=0;i<512;i++){const x=i/255.5-1;cv[i]=Math.tanh(x*1.6)/Math.tanh(1.6);}ws.curve=cv;
  const fade=AC.createGain();fade.gain.value=1;const g=AC.createGain();g.gain.value=0;
  src.connect(hp).connect(pk).connect(lp).connect(ws).connect(fade).connect(g);
  /* the signal: hiss and crackle under it, and a slow drift that pulls the music down into the static now and then */
  const hs=AC.createBufferSource();hs.buffer=AUD.nb;hs.loop=true;const hf=AC.createBiquadFilter();hf.type='bandpass';hf.frequency.value=2600;hf.Q.value=.6;const hg=AC.createGain();hg.gain.value=.03;hs.connect(hf).connect(hg).connect(g);
  const cb=AC.createBuffer(1,AC.sampleRate*3,AC.sampleRate),cd=cb.getChannelData(0);for(let i=0;i<cd.length;i++)cd[i]=Math.random()<.0009?(Math.random()*2-1)*.8:0;
  const cs=AC.createBufferSource();cs.buffer=cb;cs.loop=true;const cf=AC.createBiquadFilter();cf.type='highpass';cf.frequency.value=900;cs.connect(cf).connect(g);
  const p=AUD.pan(pos,1.6,1.5,true,.25);g.connect(p);src.start();hs.start();cs.start();
  AUD.radio={g,fade,hg,pos,on:true,t:0};}
function audioTick(dt){if(!AC)return;const c=camera,L=AC.listener;
  /* the ears follow the camera */
  {const f=V3(0,0,-1).applyQuaternion(c.quaternion),u=V3(0,1,0).applyQuaternion(c.quaternion);
   if(L.positionX){const t=AC.currentTime;L.positionX.setTargetAtTime(c.position.x,t,.02);L.positionY.setTargetAtTime(c.position.y,t,.02);L.positionZ.setTargetAtTime(c.position.z,t,.02);
     L.forwardX.setTargetAtTime(f.x,t,.02);L.forwardY.setTargetAtTime(f.y,t,.02);L.forwardZ.setTargetAtTime(f.z,t,.02);L.upX.setTargetAtTime(u.x,t,.02);L.upY.setTargetAtTime(u.y,t,.02);L.upZ.setTargetAtTime(u.z,t,.02);}
   else{L.setPosition(c.position.x,c.position.y,c.position.z);L.setOrientation(f.x,f.y,f.z,u.x,u.y,u.z);}}
  const ind=inHouse(c.position.x,c.position.z);AUD.ind=ind;AUD.rvOg.gain.value=damp(AUD.rvOg.gain.value,ind?.08:.55,3,dt);AUD.rvIg.gain.value=damp(AUD.rvIg.gain.value,ind?.7:0,3,dt);
  /* wind with gusts; the leaves answer the gusts */
  /* the wind is not a constant hiss: the air is mostly still, and now and then a breeze comes through - it rises over a
     second or three, holds, and dies away, each one different in strength and colour; in rain or fog they come oftener */
  const rain=(typeof WEATHER!=='undefined'&&WEATHER.rain)||0;{const G=AUD.gw||(AUD.gw={t:3+Math.random()*8,ph:0,e:0,pk:0,r:2,h:1,f:4,c:0,tt:0});
    if(G.ph===0){G.t-=dt;G.e=damp(G.e,0,1.2,dt);if(G.t<=0){G.ph=1;G.tt=0;G.pk=.25+Math.pow(Math.random(),.7)*.75;G.r=1+Math.random()*2.4;G.h=.4+Math.random()*3.2;G.f=2.2+Math.random()*4.5;G.c=Math.random();}}
    else{G.tt+=dt;const tt=G.tt;let w;if(tt<G.r)w=sstep(0,1,tt/G.r);else if(tt<G.r+G.h)w=1-.15*(.5+.5*Math.sin((tt-G.r)*2.3+G.c*6));else if(tt<G.r+G.h+G.f)w=1-sstep(0,1,(tt-G.r-G.h)/G.f);else{w=0;G.ph=0;G.t=(5+Math.random()*28)*(rain>.3||(typeof WEATHER!=='undefined'&&(WEATHER.fogX||1)>1.2)?.55:1);}
      G.e=w*G.pk;}
    AUD.gust=G.e;AUD.gustC=G.c;}
  if(sfx.windG){sfx.windG.gain.value=(.003+AUD.gust*.075+Math.hypot(player.vel.x,player.vel.z)*.0025)*(ind?.3:1);sfx.windF.frequency.value=220+AUD.gust*(380+(AUD.gustC||0)*420);}
  if(sfx.leafG)sfx.leafG.gain.value=ind?0:AUD.gust*AUD.gust*.03*(1+rain*.5);
  /* breathing hard after a sprint */
  if(sfx.breathG){const want=clamp((55-S.stam)/55,0,1)*(S.state==='play'?1:0);AUD.breath=damp(AUD.breath,want,1.5,dt);AUD.brT+=dt*lerp(.25,.55,AUD.breath);const ph=AUD.brT%1;
    const env=ph<.42?Math.sin(ph/.42*Math.PI)*.7:ph<.5?0:Math.sin((ph-.5)/.5*Math.PI);sfx.breathG.gain.value=AUD.breath*env*.03;sfx.breathF.frequency.value=ph<.45?1500:900;}
  /* the recorded beds: birds by day, frogs over the basin, the wind, the water round your legs */
  if(AUD.bed){const calm=clamp((S.t-AUD.lastGun-20)/40,0,1),px=player.pos.x,live=S.state==='play'||S.state==='view'||S.state==='ride';
    const B=AUD.bed('birds');if(B)B.g.gain.value=damp(B.g.gain.value,live&&!ind?.22*calm*(1-rain)*(1-clamp(((WEATHER.fogX||1)-1)/.6,0,.7)):0,1,dt);
    const F=AUD.bed('frogs');if(F)F.g.gain.value=damp(F.g.gain.value,live&&px<-660?.3*clamp((S.t-AUD.lastGun-10)/25,0,1)*clamp((-660-px)/60,0,1):0,.7,dt);
    const Wd=AUD.bed('wind');if(Wd)Wd.g.gain.value=damp(Wd.g.gain.value,live?AUD.gust*.45*(ind?.25:1):0,3,dt);
    if(AUD.rainRec)AUD.rainRec();
    const Wa=AUD.bed('wade');if(Wa){const v=Math.hypot(player.vel.x,player.vel.z);Wa.g.gain.value=damp(Wa.g.gain.value,S.state==='play'&&S.wade>.05?clamp(v/2,0,1)*clamp(S.wade*1.6,0,1)*.5:0,6,dt);}
    if(B&&sfx.windG)sfx.windG.gain.value*=.45;}
  /* the life around: birds by day (quiet for a while after gunfire, and in the rain), frogs in the basin, trees creaking */
  if(S.state==='play'||S.state==='view'){const calm=S.t-AUD.lastGun>45,pz=player.pos.z,px=player.pos.x;
    AUD.birdT-=dt;if(AUD.birdT<0){AUD.birdT=(2+Math.random()*7)*(rain>.3?3:1);if(calm&&!ind&&sfx.bird&&!(AUD.beds&&AUD.beds.birds&&Math.random()<.75)){const a=Math.random()*6.28,r=14+Math.random()*30;sfx.bird(V3(c.position.x+Math.cos(a)*r,H(c.position.x+Math.cos(a)*r,c.position.z+Math.sin(a)*r)+5+Math.random()*7,c.position.z+Math.sin(a)*r));}}
    if(px<-690){AUD.frogT-=dt;if(AUD.frogT<0){AUD.frogT=.8+Math.random()*3.5;if(S.t-AUD.lastGun>25&&sfx.frog&&!(AUD.beds&&AUD.beds.frogs&&Math.random()<.7)){for(let k=0;k<6;k++){const x=DET.x0+Math.random()*(DET.x1-DET.x0),z=DET.z0+Math.random()*(DET.z1-DET.z0);if(H(x,z)<W3.wl-.1&&Math.hypot(x-px,z-pz)<45&&Math.hypot(x-px,z-pz)>6){sfx.frog(V3(x,W3.wl,z));break;}}}}}
    AUD.creakT-=dt;if(AUD.creakT<0){AUD.creakT=15+Math.random()*30;if(!ind&&AUD.gust>.35){const a=Math.random()*6.28;sfx.creak(.03,AUD.pan(V3(c.position.x+Math.cos(a)*18,c.position.y+6,c.position.z+Math.sin(a)*18),6,1,false,.6));}}}
  /* the camp radio, only once the yard is near */
  if(typeof WEST!=='undefined'&&WEST.radio&&S.chapter===3){const d=c.position.distanceTo(WEST.radio);if(!AUD.song&&d<260)AUD.song=radioSong(22050);if(AUD.song&&!AUD.song.done)AUD.song.step(3);if(!AUD.radio&&AUD.song&&AUD.song.done&&d<70)radioMusic(WEST.radio,AUD.song);
    const R=AUD.radio;if(R){R.t+=dt;const drift=clamp(Math.sin(R.t*.05)*1.6-.9,0,1)*.55+clamp(fbm(R.t*.3,7.7,2)-.6,0,1);R.fade.gain.value=1-drift*.75;R.hg.gain.value=.025+drift*.06;R.g.gain.value=d<75?.5:0;}}}

/* ---------- HUD ---------- */
function setObj(t){$('objt').textContent=t;}
let sayT=0,toastT=0;
function say(head,text,dur){if(window.__ffw)return;$('sub').innerHTML='<small>'+head+'</small>'+text;$('bars').style.opacity=1;sayT=dur;if(/^RADIO/.test(head))sfx.radio();}
function toast(t,d=2){$('toast').textContent=t;$('toast').classList.add('on');toastT=d;}
function updateHUD(){$('hpb').style.width=S.hp+'%';$('hpv').textContent=Math.round(S.hp);$('snb').style.width=S.sanity+'%';$('snv').textContent=Math.round(S.sanity);$('stb').style.width=S.stam+'%';$('stv').textContent=Math.round(S.stam);
  const g=$('gv');g.textContent=(S.rate<10?S.rate.toFixed(2):S.rate.toFixed(1))+' μSv/h';g.classList.toggle('hot',S.rate>20);$('gd').textContent=S.dose.toFixed(3)+' mSv';
  $('gs').textContent=S.dose>6?'ACUTE SICKNESS':S.dose>3?'sickness onset':S.rate>20?'DANGER · leave':S.rate>2?'elevated':'background';
  const w=S.equip.weapon;if(w){$('am').textContent=w.inMag;$('ar').textContent=S.ammo[WEAP[w.id].ammo];$('wn').textContent=WEAP[w.id].name;}else{$('am').textContent='—';$('ar').textContent='0';$('wn').textContent='Unarmed';}
  $('xh').classList.toggle('off',S.ads||player.fovK>.5);}

/* ---------- inventory ---------- */
const dollCanvas=$('dc');const dollR=new T.WebGLRenderer({canvas:dollCanvas,antialias:true,alpha:true});dollR.outputEncoding=T.sRGBEncoding;dollR.toneMapping=T.ACESFilmicToneMapping;dollR.toneMappingExposure=1.1;dollR.setPixelRatio(Math.min(devicePixelRatio,2));
const dollS=new T.Scene();const dollC=new T.PerspectiveCamera(30,330/470,.1,20);dollC.position.set(0,1.0,4.1);dollC.lookAt(0,.98,0);
dollS.add(new T.HemisphereLight(C(0xb8c4d0),C(0x3a3828),.9));{const k=new T.DirectionalLight(C(0xfff0dd),2.2);k.position.set(2,4,3);dollS.add(k);const rl=new T.DirectionalLight(C(0x9ab0d0),1.2);rl.position.set(-3,2,-3);dollS.add(rl);}
const doll=buildHuman({char:'player',outfit:'ratnik',vest:true,helmet:true,holster:true});pose(doll,POSE.doll);dollS.add(doll.root);
const dollAK=buildAK(false);/* fitted below */dollAK.position.set(0,.26,-.2);dollAK.rotation.set(Math.PI/2,0,.55,'ZXY');doll.P.spine.add(dollAK);
/* categories, effects and stats shown in the details pane */
const CATN={weapon:'Weapons',ammo:'Ammunition',med:'Medical',food:'Provisions',gear:'Equipment',misc:'Misc'};
const ICAT={kobra:'gear',mag545:'ammo',pm:'weapon',ak:'weapon',ammo918:'ammo',ammo545:'ammo',bandage:'med',antirad:'med',vodka:'food',tushonka:'food',cigs:'misc',helm:'gear',vest:'gear',emr:'gear',pbs:'gear',dkg:'gear'};
const IFX={kobra:[['Reticle','Red chevron, adjustable','good'],['Magnification','None'],['Fits','AK side rail']],bandage:[['Health','+35','good']],antirad:[['Absorbed dose','−2.0 mSv','good']],vodka:[['Absorbed dose','−0.8 mSv','good'],['Sanity','+15','good'],['Aim','worse for 60 s','bad']],
  cigs:[['Sanity','+20','good'],['Health','−2','bad']],tushonka:[['Health','+15','good'],['Sanity','+5','good']],
  helm:[['Protection','Head · fragments'],['Class','6Б47 · Ratnik']],vest:[['Damage taken','−40%','good'],['Plates','Ceramic, front + back'],['Class','6Б45 · Ratnik']],
  emr:[['Pattern','EMR «Tsifra»'],['Pads','Knee + elbow']],pbs:[['Report','Suppressed','good'],['Fits','AK-74M']],dkg:[['Measures','Gamma dose rate + dose'],['Range','0.1 μSv/h – 10 Sv/h']]};
const CAL={'9x18':'9×18 mm PM','5.45x39':'5.45×39 mm'};
const AMMOID={'9x18':'ammo918','5.45x39':'ammo545'};
/* item icons: each item's own 3D model rendered once (3/4 view, studio light) to an image */
function iconMesh(id){const g=new T.Group();const E=M.emrVest||M.emr;
  switch(id){
    case 'helm':{const m=new T.Mesh(gearGeo('player','helmet','helmet',null),HELMMATS());g.add(m);break;}
    case 'vest':{const VM=[cmat('vest',false),cmat('webbing',false),cmat('black',false)];['vest','pouches'].forEach(k=>g.add(new T.Mesh(gearGeo('player',k,k,null),VM)));break;}
    case 'emr':{mesh(rbox(.3,.05,.24,.012),E,0,0,0,g);mesh(rbox(.27,.045,.21,.012),E,.005,.045,-.005,g);mesh(rbox(.2,.03,.06,.01),E,0,.08,-.08,g);mesh(rbox(.08,.05,.07,.02),M.black,.08,.08,.06,g);break;}
    case 'dkg':{mesh(rbox(.07,.12,.026,.01),std({color:C(0x2a2c2a),roughness:.6}),0,0,0,g);
      const lcd=tex(96,64,(c,w,h)=>{c.fillStyle='#a9b98f';c.fillRect(0,0,w,h);c.fillStyle='#1d2418';c.font='bold 26px monospace';c.fillText('0.12',8,34);c.font='12px monospace';c.fillText('μSv/h',52,52);});
      mesh(new T.PlaneGeometry(.052,.034),new T.MeshBasicMaterial({map:lcd}),0,.025,.0135,g);[-1,1].forEach(s=>mesh(new T.CylinderGeometry(.008,.008,.004,14).rotateX(Math.PI/2),M.black,s*.016,-.03,.014,g));
      mesh(rbox(.03,.035,.012,.004),M.black,0,.06,-.012,g);break;}
    default:return itemMesh(id);}
  return g;}
const ICONS={};
function renderIcons(){if(ICONS.done)return;const N=384,rt=new T.WebGLRenderTarget(N,N);rt.texture.encoding=T.sRGBEncoding;
  const sc=new T.Scene();sc.add(new T.HemisphereLight(C(0xdfe6ee),C(0x40382c),.55));{const k=new T.DirectionalLight(C(0xfff2e0),1.55);k.position.set(2,3,2.5);sc.add(k);const r2=new T.DirectionalLight(C(0x9fb4d8),.9);r2.position.set(-3,1.5,-2);sc.add(r2);}
  const cam=new T.PerspectiveCamera(20,1,.01,60);const buf=new Uint8Array(N*N*4);const cv=document.createElement('canvas');cv.width=cv.height=N;const cx=cv.getContext('2d');const im=cx.createImageData(N,N);
  const out=document.createElement('canvas');out.width=out.height=192;const ox=out.getContext('2d');ox.imageSmoothingQuality='high';
  const oc=dollR.getClearColor(new T.Color()),oa=dollR.getClearAlpha();dollR.setClearColor(0,0);
  for(const id in ITEMS){const o=iconMesh(id);const w=new T.Group();w.add(o);sc.add(w);
    const weap=ITEMS[id].kind==='weapon'||id==='pbs';o.updateMatrixWorld(true);const b=new T.Box3().setFromObject(o),c=b.getCenter(V3()),sz=b.getSize(V3());o.position.sub(c);
    const r=Math.max(sz.x,sz.y,sz.z)*.5*(weap?1.0:1.12);const dir=weap?V3(1,.22,.12):V3(.75,.85,1.05);const d=r/Math.tan(cam.fov*Math.PI/360)*1.18;
    cam.position.copy(dir.normalize().multiplyScalar(d));cam.lookAt(0,0,0);cam.near=d*.2;cam.far=d*4;cam.updateProjectionMatrix();
    dollR.setRenderTarget(rt);dollR.clear();dollR.render(sc,cam);dollR.readRenderTargetPixels(rt,0,0,N,N,buf);
    for(let y=0;y<N;y++)im.data.set(buf.subarray((N-1-y)*N*4,(N-y)*N*4),y*N*4);cx.putImageData(im,0,0);
    ox.clearRect(0,0,192,192);ox.drawImage(cv,0,0,192,192);ICONS[id]=out.toDataURL();sc.remove(w);}
  dollR.setRenderTarget(null);dollR.setClearColor(oc,oa);rt.dispose();ICONS.done=true;}
const SLOTN={helmet:'Helmet',vest:'Armour',outfit:'Uniform',weapon:'Weapon',attach:'Attachment',detector:'Detector',optic:'Optic'};
const SLOTGHOST={helmet:'helm',vest:'vest',outfit:'emr',weapon:'ak',attach:'pbs',detector:'dkg',optic:'kobra'};
let selItem=null,invTab='all',hoverItem=null;
/* a page to read: the world keeps going behind it, but you stop to read */
function openNote(){if(S.state!=='play')return;S.state='note';S.noteT=performance.now();$('note').classList.add('on');$('hud').style.opacity=0;$('prompt').classList.remove('on');S.fire=0;S.ads=false;document.exitPointerLock();sfx.click&&sfx.click();}
function closeNote(){if(S.state!=='note'||performance.now()-S.noteT<250)return;S.state='play';$('note').classList.remove('on');$('hud').style.opacity=1;lockPointer();}
addEventListener('keydown',e=>{if(S.state==='note'&&(e.code==='Escape'||e.code==='KeyE'||e.code==='Space')){e.preventDefault();closeNote();}});
$('note').onclick=()=>closeNote();
function toggleInv(){if(S.state==='inv'){S.state='play';$('inv').classList.remove('on');$('hud').style.opacity=1;lockPointer();}
  else{S.state='inv';renderIcons();$('inv').classList.add('on');$('hud').style.opacity=0;document.exitPointerLock();S.fire=0;S.ads=false;selItem=null;hoverItem=null;resizeDoll();renderInv();}}
$('invx').onclick=()=>{if(S.state==='inv')toggleInv();};
addEventListener('keydown',e=>{if(S.state==='inv'&&(e.code==='Escape'||e.code==='KeyI')){e.preventDefault();toggleInv();}else if(S.state==='play'&&e.code==='KeyI')toggleInv();});
/* every bag item plus one tile per calibre of loose rounds */
function invList(){const L=S.bag.map((it,i)=>({it,idx:i,where:'bag'}));for(const cal in S.ammo)if(S.ammo[cal]>0)L.push({it:{id:AMMOID[cal],count:S.ammo[cal]},where:'ammo',cal});return L;}
function itemBadge(it){if(it.count!==undefined)return it.count;if(it.inMag!==undefined)return it.inMag+'/'+WEAP[it.id].mag;return '';}
function renderInv(){const w=bagWeight();$('wt').textContent=w.toFixed(1)+' / 40 kg';const wf=$('wfill');wf.style.width=Math.min(100,w/40*100)+'%';wf.className=w>40?'over':w>35?'heavy':'';
  document.querySelectorAll('.eq').forEach(el=>{const sl=el.dataset.slot,e=S.equip[sl];el.classList.toggle('empty',!e);el.classList.toggle('sel',!!(selItem&&selItem.where==='eq'&&selItem.slot===sl));
    el.innerHTML=`<span class="cap">${SLOTN[sl]}</span><img alt="" src="${ICONS[e?e.id:SLOTGHOST[sl]]}">`;el.title=e?ITEMS[e.id].name:SLOTN[sl]+' · empty';
    el.onclick=()=>{selItem={where:'eq',slot:sl,item:e};renderInv();};el.ondblclick=()=>{selItem={where:'eq',slot:sl,item:e};doAct('pri');};
    el.onmouseenter=()=>{hoverItem={where:'eq',slot:sl,item:e};showDesc();};el.onmouseleave=()=>{hoverItem=null;showDesc();};});
  const L=invList();const cnt={all:L.length};L.forEach(x=>{const c=ICAT[x.it.id];cnt[c]=(cnt[c]||0)+1;});
  const tabs=$('tabs');tabs.innerHTML='';[['all','All'],...Object.entries(CATN)].forEach(([k,n])=>{if(k!=='all'&&!cnt[k])return;const b=document.createElement('button');b.className='tab'+(invTab===k?' on':'');b.setAttribute('role','tab');
    b.innerHTML=`${n}<span>${cnt[k]||0}</span>`;b.onclick=()=>{invTab=k;renderInv();};tabs.appendChild(b);});
  if(invTab!=='all'&&!cnt[invTab])invTab='all';
  $('bagct').textContent=S.bag.length+' / '+BAGMAX+' slots';
  const bag=$('bag');bag.innerHTML='';const shown=L.filter(x=>invTab==='all'||ICAT[x.it.id]===invTab);
  shown.forEach(x=>{const it=x.it,def=ITEMS[it.id];const d=document.createElement('div');d.className='slot';d.tabIndex=0;
    const isSel=selItem&&selItem.where===x.where&&(x.where==='ammo'?selItem.cal===x.cal:selItem.idx===x.idx);if(isSel)d.classList.add('sel');
    const badge=itemBadge(it);const kg=x.where==='ammo'?(def.w/def.count*it.count):def.w;
    d.innerHTML=`<img alt="" src="${ICONS[it.id]}"><div class="nm">${def.name}</div><div class="kg">${kg.toFixed(2)} kg</div>${badge!==''?`<span class="ct">${badge}</span>`:''}`;
    const sel={where:x.where,idx:x.idx,cal:x.cal,item:it};
    d.onclick=()=>{selItem=sel;renderInv();};d.ondblclick=()=>{selItem=sel;doAct('pri');};d.onkeydown=e=>{if(e.code==='Enter'){selItem=sel;doAct('pri');}};
    d.onmouseenter=()=>{hoverItem=sel;showDesc();};d.onmouseleave=()=>{hoverItem=null;showDesc();};bag.appendChild(d);});
  if(invTab==='all')for(let i=S.bag.length;i<BAGMAX;i++){const d=document.createElement('div');d.className='slot empty';bag.appendChild(d);}
  /* status */
  const bar=(v,c)=>`<div class="mb"><i style="width:${clamp(v,0,100)}%;background:${c}"></i></div>`;
  $('istat').innerHTML=`<span>Health</span>${bar(S.hp,'var(--hp)')}<b>${Math.round(S.hp)}</b><span>Sanity</span>${bar(S.sanity,'var(--san)')}<b>${Math.round(S.sanity)}</b>
    <span>Stamina</span>${bar(S.stam,'var(--stam)')}<b>${Math.round(S.stam)}</b><span>Dose</span>${bar(S.dose/6*100,'var(--rad)')}<b>${S.dose.toFixed(2)} mSv</b>
    <span>Protection</span>${bar(S.equip.vest?40:0,'#8a9aa8')}<b>${S.equip.vest?'40%':'—'}</b>`;
  doll.P.helmet.visible=!!S.equip.helmet;doll.P.vest.visible=!!S.equip.vest;dollAK.visible=!!(S.equip.weapon&&S.equip.weapon.id==='ak');showDesc();}
function actsFor(s){if(!s||!s.item)return[];const def=ITEMS[s.item.id];if(s.where==='ammo')return[];
  if(s.where==='eq')return[['pri','Unequip']];return[['pri',def.kind==='use'?(ICAT[s.item.id]==='food'?'Consume':'Use'):'Equip'],['drop','Drop']];}
function showDesc(){const d=$('desc');const s=hoverItem&&hoverItem.item?hoverItem:selItem;if(!s||!s.item){d.innerHTML='<div class="none">Select an item to inspect it.</div>';return;}
  const it=s.item,def=ITEMS[it.id],rows=[];
  if(def.kind==='weapon'){const W=WEAP[it.id];rows.push(['Calibre',CAL[W.ammo]],['Magazine',(it.inMag!==undefined?it.inMag+' / ':'')+W.mag],['Damage',W.dmg],['Action',W.rpm?W.rpm+' rpm · auto':'Semi-auto'],['Reserve',S.ammo[W.ammo]+' rds']);}
  if(def.kind==='ammo')rows.push(['Calibre',CAL[def.ammo]],['Rounds',it.count||def.count]);
  (IFX[it.id]||[]).forEach(r=>rows.push(r));rows.push(['Weight',(s.where==='ammo'?def.w/def.count*it.count:def.w).toFixed(2)+' kg']);
  const acts=actsFor(s===hoverItem&&selItem&&selItem.item!==s.item?null:s);
  d.innerHTML=`<div class="dimg"><img alt="" src="${ICONS[it.id]}"></div><span class="dcat">${CATN[ICAT[it.id]]||'Item'}${s.where==='eq'?' · equipped':''}</span><h3>${def.name}</h3><p>${def.desc}</p>
    <table class="dst">${rows.map(r=>`<tr><td>${r[0]}</td><td class="${r[2]||''}">${r[1]}</td></tr>`).join('')}</table>
    <div class="dact">${acts.map(a=>`<button class="${a[0]==='pri'?'pri':''}" data-a="${a[0]}">${a[1]}</button>`).join('')}</div>`;
  d.querySelectorAll('button[data-a]').forEach(b=>b.onclick=()=>doAct(b.dataset.a));}
function doAct(a){const s=selItem;if(!s||!s.item||s.where==='ammo')return;const it=s.item,def=ITEMS[it.id];
  if(s.where==='bag'){if(a==='drop'){S.bag.splice(s.idx,1);const yw=player.yaw,x=player.pos.x-Math.sin(yw)*.8,z=player.pos.z-Math.cos(yw)*.8;const L={id:it.id,x,y:groundY(x,z),z,data:it,dropped:1};placeItem(L);(S.dropped||(S.dropped=[])).push(L);sfx.pick();toast('Dropped: '+def.name);}
    else if(def.kind==='use'&&def.keep){if(S.state==='inv')toggleInv();setTimeout(()=>def.use(it),60);}
    else if(def.kind==='use'){def.use();S.bag.splice(s.idx,1);sfx.pick();toast('Used: '+def.name);}
    else{const slot=def.kind;const old=S.equip[slot];S.equip[slot]=it;S.bag.splice(s.idx,1);if(old)S.bag.push(old);if(slot==='weapon'||slot==='attach'||slot==='optic')mountWeapon(S.equip.weapon&&S.equip.weapon.id);sfx.pick();}}
  else{if(!it)return;if(S.bag.length>=BAGMAX){toast('Backpack is full.');return;}S.bag.push(it);S.equip[s.slot]=null;if(s.slot==='weapon'||s.slot==='attach'||s.slot==='optic')mountWeapon(S.equip.weapon&&S.equip.weapon.id);sfx.pick();}
  selItem=null;hoverItem=null;renderInv();}
function resizeDoll(){const d=$('doll');const w=d.clientWidth||330,h=d.clientHeight||470;dollR.setSize(w,h,false);dollC.aspect=w/h;dollC.updateProjectionMatrix();}

/* ---------- BTR + ride sequences ---------- */
const btr=buildBTR();btr.rotation.y=Math.PI/2;scene.add(btr);
const btrSolid=solidAABB(0,0,0,0);
function parkBTR(z){btr.position.set(0,0,z);btrSolid.x1=-1.55;btrSolid.x2=1.55;btrSolid.z1=z-3.95;btrSolid.z2=z+3.95;}
parkBTR(btrPark.z);
const riders=[[1.2,.68,.2,'guard5'],[1.75,-.66,-.25,'guard2']].map((p,ri)=>{const h=buildHuman({char:p[3],outfit:'ratnik',vest:true,helmet:true});
  animate(h,{pose:'sitDeck',gun:npcAK(),bump:t=>{const v=Math.abs(RIDE.v||0);return[Math.sin(t*9+ri)*.012*v/8+Math.sin(t*2.1)*.01,Math.sin(t*6.3+ri*2)*.015*v/8];}});h.root.position.set(p[0],1.9-.84,p[1]);h.root.rotation.y=Math.PI/2+p[2];btr.add(h.root);
  return h;});
/* Captain Morozov rides in the vehicle: up in the commander's hatch (front right), lid swung back on its hinge */
const cmdr=(()=>{const h=buildHuman({char:'guard1',outfit:'ratnik',vest:true,helmet:true});
  animate(h,{pose:'hatch',bump:t=>{const v=Math.abs(RIDE.v||0);return[Math.sin(t*8+1)*.01*v/8+Math.sin(t*1.7)*.008,Math.sin(t*5.7+2)*.012*v/8];}});
  h.root.position.set(2.21,.78,.45);h.root.rotation.y=Math.PI/2;btr.add(h.root);if(btr.userData.cmdHatch)btr.userData.cmdHatch.rotation.z=1.92;return h;})();
const dust=(()=>{const n=160,g=new T.BufferGeometry(),a=new Float32Array(n*3);g.setAttribute('position',new T.BufferAttribute(a,3));const m=new T.Points(g,new T.PointsMaterial({color:C(0xa89a78),size:.9,transparent:true,opacity:.18,depthWrite:false}));m.frustumCulled=false;scene.add(m);
  return{m,a,life:new Float32Array(n),i:0,n};})();
const SEAT=V3(-1.25,2.86,.55);
const RIDE={on:false,legs:[],li:0,t:0,cam:V3(),look:0};
function startRide(legs){RIDE.on=true;RIDE.legs=legs;RIDE.li=0;RIDE.t=0;RIDE.fy=RIDE.fp=0;RIDE.fq=0;S.state='ride';vmRoot.visible=false;$('bars').style.opacity=1;$('hud').style.opacity=0;$('prompt').classList.remove('on');if(sfx.engine)sfx.engine.gain.value=.22;}
const ease={io:u=>u*u*(3-2*u),i:u=>u*u,o:u=>1-(1-u)*(1-u),l:u=>u};
/* scripted legs run on a fixed 1/60 s step, so the drive, the hit, the crash and where everyone lands come out exactly the
   same on every machine and frame rate */
const RFH=1/60;
function tickRide(dt,rdt){const L=RIDE.legs[RIDE.li];if(!L){endRide();return;}
  if(L.type==='fn'){RIDE.acc=(RIDE.acc||0)+dt;const rk=(dt>0?rdt/dt:1)*(window.__ffw||1);let n=0;
    while(RIDE.acc>=RFH&&n<30){RIDE.acc-=RFH;n++;RIDE.t+=RFH;RIDE.fq=(RIDE.fq||0)+RFH*rk;if(RIDE.fq>2.5){RIDE.fy=damp(RIDE.fy,0,1.2,RFH*rk);RIDE.fp=damp(RIDE.fp,0,1.2,RFH*rk);}
      if(L.lines&&L.lines.length&&RIDE.t>L.lines[0][0]){const l=L.lines.shift();say(l[1],l[2],l[3]||4.5);}
      if(L.tick(RFH,RFH*rk,RIDE.t,L)){RIDE.li++;RIDE.t=0;return;}}
    if(dt===0)L.tick(0,rdt,RIDE.t,L);return;}
  RIDE.t+=dt;const u=clamp(RIDE.t/L.dur||0,0,1);
  /* free look while riding: drifts back to centre a few seconds after the mouse stops */
  RIDE.fq=(RIDE.fq||0)+rdt;if(RIDE.fq>2.5){RIDE.fy=damp(RIDE.fy,0,1.2,rdt);RIDE.fp=damp(RIDE.fp,0,1.2,rdt);}
  if(L.lines&&L.lines.length&&RIDE.t>L.lines[0][0]){const l=L.lines.shift();say(l[1],l[2],l[3]||4.5);}
  if(L.type==='drive'){const e=ease[L.ease||'io'];const z0=btr.position.z;parkBTR(lerp(L.z0,L.z1,e(u)));const spd=Math.abs(btr.position.z-z0)/Math.max(dt,1e-4);
    btrSpin(spd,dt);
    if(sfx.engineO)sfx.engineO.frequency.value=34+spd*2.4;
    RIDE.v=Math.min(spd,10);const sh=Math.min(spd,10)*.0015;btr.position.y=Math.sin(S.t*7.3)*sh*.6;btr.rotation.z=Math.sin(S.t*2.1)*sh*.5;btr.rotation.x=Math.sin(S.t*3.3)*sh*.5;
    btr.userData.tur.rotation.y=Math.sin(S.t*.25)*.35;
    btrDust(spd,dt);
    btr.updateMatrixWorld(true);RIDE.cam.copy(SEAT).applyMatrix4(btr.matrixWorld);camera.position.copy(RIDE.cam);
    RIDE.look=damp(RIDE.look,L.look!==undefined?L.look:Math.sin(S.t*.18)*.45,1.2,dt);camera.rotation.set(-.1+Math.sin(S.t*9)*sh*.4+RIDE.fp,RIDE.look+RIDE.fy,Math.sin(S.t*5)*sh*.4);
    if(u>=1){RIDE.li++;RIDE.t=0;}}
  else if(L.type==='card'){if(!L.shown){L.shown=true;$('cardk').textContent=L.k;$('cardh').textContent=L.h;$('cardp').textContent=L.p;$('fade').style.opacity=1;$('card').classList.add('on');if(sfx.engine)sfx.engine.gain.value=.08;}
    if(RIDE.t>L.dur-.9)$('card').classList.remove('on');if(u>=1){if(L.then)L.then();$('fade').style.opacity=0;if(sfx.engine)sfx.engine.gain.value=.22;RIDE.li++;RIDE.t=0;}}
  else if(L.type==='dismount'){if(!L.from){L.from=camera.position.clone();L.yaw0=camera.rotation.y;if(sfx.engine)sfx.engine.gain.value=.07;}
    const e=ease.io(u);const to=V3(L.x,groundY(L.x,L.z)+1.64,L.z);camera.position.lerpVectors(L.from,to,e);camera.position.y+=Math.sin(u*Math.PI)*.35-(u>.7?Math.sin((u-.7)/.3*Math.PI)*.12:0);
    camera.rotation.set(lerp(-.1,0,e)-Math.sin(u*Math.PI)*.25,lerp(L.yaw0,L.yaw,e),Math.sin(u*Math.PI)*.08);if(u>=1){player.pos.set(L.x,0,L.z);player.y=groundY(L.x,L.z);player.yaw=L.yaw;player.pitch=0;player.vel.set(0,0,0);RIDE.li++;RIDE.t=0;}}
  else if(L.type==='fadein'){$('fade').style.opacity=0;RIDE.li++;}
  else if(L.type==='fn'){if(L.tick(dt,rdt,RIDE.t,L)){RIDE.li++;RIDE.t=0;}}}
function endRide(){RIDE.on=false;S.state='play';vmRoot.visible=true;$('hud').style.opacity=1;$('bars').style.opacity=0;if(!S.btrWrecked){btr.position.y=0;btr.rotation.set(0,Math.PI/2,0);}if(RIDE.done)RIDE.done();}
function rideToSector(){startRide([
  {type:'drive',z0:btrPark.z,z1:-70,dur:10,ease:'i',lines:[[1,'DRIVER','Hold on. The road is bad past the north gate.'],[5.5,'RADIO · «KURGAN»','Board 121, you are clear of the perimeter. Check in every ten minutes.']]},
  {type:'card',dur:3.4,k:'Zone 12 · Sector 1',h:'Staroye Opalikhino',p:'Field survey · 2.4 km north of F.O.B. · 16:58',then(){parkBTR(-205);S.where='sector';}},
  {type:'drive',z0:-205,z1:DROPZ,dur:10,ease:'o',lines:[[1,'DRIVER','There is the house. Nobody has come back from there since the spring.'],[6,'DRIVER','Drop point. Out you go. I will hold here with the engine running. Radio when you find them.']],look:-.25},
  {type:'dismount',dur:1.5,x:2.9,z:DROPZ-1.5,yaw:Math.atan2(-(HX-2.9),-(HZ-DROPZ))}]);
  RIDE.done=()=>{setObj('Survey Sector 1. Search the old house for the missing patrol. Watch the dosimeter.');setBoard('wait');S.btrHere=true;setTimeout(()=>saveGame(false),400);};}
function rideToFOB(){startRide([{type:'card',dur:3,k:'Zone 12',h:'F.O.B. «Kurgan»',p:'Return trip · 17:20',then(){BTRGO.on=false;btr.visible=true;btr.rotation.set(0,Math.PI/2,0);parkBTR(150);S.where='fob';}},
  {type:'drive',z0:150,z1:btrPark.z,dur:12,ease:'o',lines:[[2,'DRIVER','Back to Kurgan. You smell like that house.']]},
  {type:'dismount',dur:1.5,x:2.9,z:btrPark.z-1,yaw:0}]);
  RIDE.done=()=>{setObj(S.searched?'Report Volkov\'s death. Treat your dose, re-arm, then ride out again.':'Re-arm and treat your dose, then ride out again to finish the search.');setBoard(false);};}
function setBoard(atSector){const i=interact.findIndex(x=>x.btr);if(i>=0)interact.splice(i,1);if(atSector===null)return;
  /* chapter 1: the BTR holds at the drop point until the house is searched */
  if(atSector==='wait'){interact.push({btr:true,obj:btr,off:V3(0,1.2,0),r:4.6,get label(){return S.searched?'Board BTR-80 «121»':'BTR-80 «121» · holding at the drop point';},
    fn(){if(!S.searched){say('COMMANDER · MOROZOV',['We do not leave without our people. Search the house, we hold here.','The house first. Find the patrol.','Still here. Go on — the house.'][(S.nagBTR=(S.nagBTR||0)+1)%3],4);return;}rideReinforce();}});return;}
  interact.push({btr:true,obj:btr,off:V3(0,1.2,0),r:4.6,label:atSector?'Board BTR-80 · return to F.O.B.':'Board BTR-80 «121» · ride out to Sector 1',fn(){if(!atSector&&!S.ordersRead){say('DRIVER','Read your orders at the board first.',3);return;}atSector?rideToFOB():rideToSector();}});}

/* ---------- the BTR on its own: drives off after the drop, kicks up dust, comes back when Volkov is found ---------- */
const BTRGO={on:false};
const DUSTC=[.62,.56,.44,.34],DUSTE=[.6,.55,.46,0],_dv=V3(),_dp=V3();
function btrDust(spd,dt){if(spd<1.2)return;const rear=btr.userData.wheels.filter(w=>w.position.x<-1);let n=Math.floor(Math.min(spd,14)*2.6*dt+R());
  const back=V3(-1,0,0).applyQuaternion(btr.quaternion);
  while(n-->0){const w=rear[Math.floor(R()*rear.length)];w.getWorldPosition(_dp);_dp.y=groundY(_dp.x,_dp.z)+.25;_dp.addScaledVector(back,.5);
    _dv.copy(back).multiplyScalar(rnd(.5,1.5)+spd*.12).add(V3(rnd(-.8,.8),rnd(.4,1.3),rnd(-.8,.8)));
    FX.dust.spawn(_dp,_dv,rnd(2.4,4.2),rnd(.5,.9),rnd(2.8,4.6),DUSTC,DUSTE,{drag:.8,g:-.05,spin:rnd(-.4,.4)});}}
function btrTick(dt){const G=BTRGO;if(!G.on)return;G.t+=dt;const u=clamp(G.t/G.dur,0,1),z0=btr.position.z;parkBTR(lerp(G.z0,G.z1,G.ease(u)));
  const spd=Math.abs(btr.position.z-z0)/Math.max(dt,1e-4);btrSpin(spd,dt);
  const sh=Math.min(spd,10)*.0015;btr.position.y=Math.sin(S.t*7.3)*sh*.6;btr.rotation.z=Math.sin(S.t*2.1)*sh*.5;btr.rotation.x=Math.sin(S.t*3.3)*sh*.5;
  btrDust(spd,dt);
  if(sfx.engine){const d=btr.position.distanceTo(camera.position);sfx.engine.gain.value=.24*clamp(1-d/170,0,1);if(sfx.engineO)sfx.engineO.frequency.value=34+spd*2.4;}
  if(u>=1){G.on=false;btr.position.y=0;btr.rotation.x=btr.rotation.z=0;if(G.done)G.done();if(G.after){const a=G.after;G.after=null;a();}}}
/* (the BTR used to drive off up the north road and come back; it now waits at the drop point, so that is gone) */

/* ---------- stats, radiation ---------- */
let geigerAcc=0,cawT=8;
function tickStats(dt){const px=player.pos.x,pz=player.pos.z;let rate=.1+fbm(px/90,pz/90,2)*.25;
  for(const s of hotspots){const d=Math.hypot(px-s.x,pz-s.z);if(d<s.r){const k=1-d/s.r;rate+=s.uSv*k*k*(1+Math.sin(S.t*2.3+d)*.08);}}
  if(pz<-250)rate*=1.6;S.rate=damp(S.rate,rate,3,dt);S.dose+=S.rate/3600*dt*12;
  if(S.dose>3){S.hp-=dt*(S.dose-3)*.35;S.sanity-=dt*.25;}
  let drain=0;for(const c of CORPSES){const d=Math.hypot(px-c[0],pz-c[1]);if(d<5)drain+=1.5*(1-d/5);}
  if(S.rate>20)drain+=.4;if(pz<-250)drain+=.04;else drain-=.3;if(S.flash&&inHouse(px,pz))drain-=.2;
  S.sanity=clamp(S.sanity-drain*dt,0,100);if(S.drunk>0)S.drunk-=dt;
  if(S.sanity<25){S.hb=(S.hb||0)+dt;if(S.hb>lerp(.55,1.2,S.sanity/25)){S.hb=0;sfx.heart();}}
  /* counts arrive as a Poisson process (exponential gaps), never closer than the tube's dead time, scheduled on the audio
     clock a little ahead; a big change in rate redraws the next gap (the process has no memory) */
  if(AC&&sfx.geigerAt&&S.equip.detector){const now=AC.currentTime,cps=Math.max(.001,S.rate*1.1);if(!geigerAcc||geigerAcc<now-.2||Math.abs(cps-(tickStats.lr||cps))>cps*.3){geigerAcc=now+.02+(-Math.log(Math.random()+1e-9))/cps;tickStats.lr=cps;}
    let guard=0;while(geigerAcc<now+dt+.06&&guard++<400){sfx.geigerAt(geigerAcc);geigerAcc+=Math.max(.00019,-Math.log(Math.random()+1e-9)/cps);}}
  S.sinceDmg+=dt;S.hp=clamp(S.hp,0,100);
  if(sfx.flies){let fd=99;for(const c of CORPSES)fd=Math.min(fd,Math.hypot(px-c[0],pz-c[1]));sfx.flies.gain.value=clamp(1-fd/6,0,1)*.035;}
  cawT-=dt;if(cawT<0){cawT=rnd(14,30);if(pz<-200)sfx.caw();}
  if(S.hp<=0&&S.state!=='dead'&&S.state!=='dying'){/* (not straight to the KIA screen: you go down first) */ACT.die(S.dose>3?'Acute radiation sickness. Absorbed dose '+S.dose.toFixed(1)+' mSv.':S.killer==='shadow'?'Something in the grass outside the house.':S.killer==='separatists'?'Shot by the separatists at the lumber yard.':S.killer==='crab'?'Dragged under in the flooded basin.':S.killer==='grenade'?'Caught in a grenade blast.':'Wounds.');}
  for(const n of NPCS){const d=Math.hypot(px-n.x,pz-n.z);if(d<3.2&&!n.said){n.said=true;say('SENTRY',n.line,4.5);}if(d>7)n.said=false;}}

/* ---------- viewmodel animation ---------- */
const VMS={p:V3(),v:V3(),r:V3(),w:V3(),init:false},_vmT=V3(),_vmR=V3();
/* a damped spring on three axes, sub-stepped so it stays stable at any frame rate */
function spring3(x,v,tg,k,z,dt){const n=Math.max(1,Math.ceil(dt/.006)),h=dt/n,c=2*z*Math.sqrt(k);
  for(let i=0;i<n;i++){v.x+=(k*(tg.x-x.x)-c*v.x)*h;v.y+=(k*(tg.y-x.y)-c*v.y)*h;v.z+=(k*(tg.z-x.z)-c*v.z)*h;x.x+=v.x*h;x.y+=v.y*h;x.z+=v.z*h;}}
function tickVM(dt){vmCam.position.copy(camera.position);vmCam.quaternion.copy(camera.quaternion);vmCam.fov=camera.fov*.82;vmCam.updateProjectionMatrix();
  vmSun.position.copy(camera.position).addScaledVector(SUN,10);vmSun.target.position.copy(camera.position);
  const inside=inHouse(player.pos.x,player.pos.z);vmSun.intensity=damp(vmSun.intensity,inside?.15:2.4,4,dt);vmHemi.intensity=damp(vmHemi.intensity,inside?.18:.6,4,dt);
  vmMuzzle.position.copy(camera.position);
  if(VM.flashT>0){VM.flashT-=dt;const a=clamp(VM.flashT/.055,0,1);const u=VM.flash.userData;u.all.forEach(m=>m.material.opacity=a*a);muzzleLight.intensity=3*a;vmMuzzle.intensity=2*a;if(VM.flashT<=0){VM.flash.visible=false;muzzleLight.intensity=0;vmMuzzle.intensity=0;}}
  if(!VM.gun)return;const w=WEAP[VM.id];VM.t+=dt;VM.dt=dt;vmAction(dt);handsVM(dt);const ads=S.ads&&S.reloading<=0&&player.fovK<.5;
  VM.sx=damp(VM.sx,clamp(-mdx*.0009,-.05,.05),12,dt);VM.sy=damp(VM.sy,clamp(mdy*.0009,-.05,.05),12,dt);mdx=0;mdy=0;
  const k=VM.kick;VM.kick=Math.max(0,k-dt*8);const A=player.bobA;const spr=player.fovK;
  const tx=ads?0:w.hip[0],ty=ads?-VM.sight:w.hip[1],tz=ads?w.ads[2]-(VM.kobra?.07:0):w.hip[2];
  const br=Math.sin(VM.t*1.4)*.0018*(ads?.3:1);
  const bx=Math.sin(player.ph)*.012*A*(ads?.15:1),by=(sabs(Math.cos(player.ph))-.6)*.012*A*(ads?.15:1);
  /* the gun hangs in the hands on springs: it lags behind a turn and swings back past centre, settles after each shot
     with a little bounce, and walks in a figure of eight (dip on each footfall, roll and yaw from side to side), leaning
     into strafes - no stiff exponential easing */
  const hr=ads?[0,0,0]:(w.hipR||[0,.03,0]);const sw=ads?.15:1;
  const roll=Math.sin(player.ph)*.016*A*sw,yawB=Math.cos(player.ph*2)*.006*A*sw;
  const rx_=Math.cos(player.yaw),rz_=-Math.sin(player.yaw);const lat=player.vel?clamp((player.vel.x*rx_+player.vel.z*rz_)/5,-1,1):0;
  _vmT.set(tx+bx+VM.sx-spr*.05,ty+by+br+VM.sy-spr*.05-(S.reloading>0&&!VM.anim?.08:0)-ACT.lower*.42,tz+k*.05+ACT.lower*.08);
  _vmR.set(-ACT.lower*.7+hr[0]+k*.28+(S.reloading>0&&!VM.anim?.35:0)-spr*.35+VM.sy*2,hr[1]+spr*.7+VM.sx*2+yawB,hr[2]+(S.reloading>0&&!VM.anim?-.35:0)+spr*.25+roll-lat*.035*sw+(S.drunk>0?Math.sin(VM.t*1.7)*.03:0));
  if(!VMS.init){VMS.p.copy(_vmT);VMS.r.copy(_vmR);VMS.v.set(0,0,0);VMS.w.set(0,0,0);VMS.init=true;}
  spring3(VMS.p,VMS.v,_vmT,ads?260:170,ads?.86:.66,dt);spring3(VMS.r,VMS.w,_vmR,ads?220:130,ads?.86:.6,dt);
  vmRoot.position.copy(VMS.p);vmRoot.rotation.set(VMS.r.x,VMS.r.y,VMS.r.z);
  vmRoot.updateMatrixWorld(true);if(VM.arms)VM.arms.forEach(a=>fpShoulder(a,vmCam));
  const tf=(ads?w.fov:72)+player.fovK*7;camera.fov=damp(camera.fov,tf,10,dt);camera.updateProjectionMatrix();
  if(S.reloading>0){S.reloading-=dt;if(S.reloading<=.35&&S.reloadFill){S.reloadFill();S.reloadFill=null;}}}

/* ---------- camp life: soldiers walking their rounds between the tents, the containers, the vehicles and the gates.
   Each follows a loop of waypoints; at some stops he does something (checks his watch, stretches his back, warms his
   hands, looks about) before walking on. Walking uses the same procedural gait as your own body (planted feet, pelvis
   sway, counter-rotating torso, arm swing); the rifle rides slung on his back. ---------- */
const WALKERS=[];
function addWalker(char,route,o={}){const h=buildHuman({char,outfit:'ratnik',vest:o.vest!==false,helmet:o.helmet!==false,kit:o.kit});scene.add(h.root);
  /* armed men carry the rifle in their hands, at low ready (and stop to scan with it, never to warm their hands) */
  const armed=o.rifle!==false;const an=animate(h,armed?{pose:'lowready',gun:npcAK()}:{pose:'relaxed'});an.paused=true;
  const W={h,an,route,armed,i:0,p:V3(route[0][0],0,route[0][1]),yaw:0,v:0,ph:R()*6,state:'walk',t:0,G:{a:0,run:0,t:R()*9,var:1,calm:armed},sp:(o.speed||1.3)*(.94+R()*.12),solid:{cx:route[0][0],cz:route[0][1],r:.32}};
  if(armed)W.route=route.map(r=>r[2]?[r[0],r[1],(r[2]==='warm'||r[2]==='stretch'||r[2]==='relaxed')?'lowready':(r[2]==='watch'?'ready':r[2]),r[3],r[4]]:r);
  solids.push(W.solid);WALKERS.push(W);h.root.position.copy(W.p);if(o.line)NPCS.push({h,line:o.line,said:false,get x(){return W.p.x;},get z(){return W.p.z;}});return W;}
function walkersTick(dt){if(Math.hypot(camera.position.x,camera.position.z)>140)return;
  for(const W of WALKERS){if(!W.h.root.parent)continue;const r=W.route[W.i];
    if(W.state==='walk'){const tx=r[0],tz=r[1],dx=tx-W.p.x,dz=tz-W.p.z,d=Math.hypot(dx,dz);
      const want=Math.atan2(dx,dz);let dy=want-W.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));W.yaw+=dy*clamp(dt*3.2,0,1);
      const slow=clamp(d/1.2,.35,1)*clamp(1-Math.abs(dy)/1.6,.3,1);W.v=damp(W.v,W.sp*slow,3,dt);
      W.p.x+=Math.sin(W.yaw)*W.v*dt;W.p.z+=Math.cos(W.yaw)*W.v*dt;W.ph+=W.v*dt/.68*Math.PI;
      if(d<.35){if(r[2]){W.state='act';W.t=r[3]||6;W.an.paused=false;W.an.go(r[2],.9);W.face=r[4]!==undefined?r[4]:W.yaw;}W.i=(W.i+1)%W.route.length;}
      /* full stride at walking pace (the gait's amplitude scale is tuned to the player's speed), so the feet plant instead of skating */
      gaitPose(W.h.P.bones,W.G,dt,W.v*1.6,W.ph,false,0);
      /* he looks about as he walks: now and then at something to the side, at you when you are close */
      W.lt=(W.lt||0)-dt;if(W.lt<=0){W.lt=rnd(1.8,4.5);W.lk=R()<.55?0:rnd(-.6,.6);}
      const cd=Math.hypot(camera.position.x-W.p.x,camera.position.z-W.p.z);let tgt=W.lk;
      if(cd<7){let a=Math.atan2(camera.position.x-W.p.x,camera.position.z-W.p.z)-W.yaw;a=Math.atan2(Math.sin(a),Math.cos(a));if(Math.abs(a)<1.6)tgt=clamp(a,-.9,.9);}
      W.look=damp(W.look||0,tgt,3,dt);const B=W.h.P.bones;B.neck.rotation.y+=W.look*.45;B.head.rotation.y+=W.look*.55;B.spine.rotation.y+=W.look*.12;
      if(W.armed){W.h.root.position.set(W.p.x,H(W.p.x,W.p.z),W.p.z);W.h.root.rotation.y=W.yaw;W.an.holdGun(AP.lowready.hold,W.ph);}}
    else{W.t-=dt;let dy=W.face-W.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));W.yaw+=dy*clamp(dt*2,0,1);W.v=damp(W.v,0,6,dt);
      const rest=W.armed?'lowready':'relaxed';if(W.t<=0){if(W.an.cur!==rest){W.an.go(rest,.8);W.t=.9;}else{W.state='walk';W.an.paused=true;W.G.a=0;}}}
    W.h.root.position.set(W.p.x,H(W.p.x,W.p.z),W.p.z);W.h.root.rotation.y=W.yaw;W.solid.cx=W.p.x;W.solid.cz=W.p.z;}}
addWalker('guard2',[[-18,-20],[-18,-6,'watch',5,Math.PI/2],[-18,18],[-12,26,'relaxed',4,Math.PI],[-10,10],[-10,-12,'stretch',4.5,-Math.PI/2]],{line:'Walking the lines. Nothing moves out there but the crows.'});
addWalker('guard5',[[28,-2],[14,-4,'watch',4,Math.PI],[11,12],[13,21],[25,22,'warm',6,Math.PI/2],[30,10]],{kit:'A',line:'Fuel is low again. Kurgan says next week. They always say next week.'});
addWalker('driver',[[13,3.5,'relaxed',7,Math.PI*.5],[23.5,3.2],[24.5,13,'watch',4,-Math.PI/2],[13,13.2]],{vest:false,helmet:false,rifle:false,speed:1.05,line:'One-two-two needs a new fuel pump. Do not tell the major.'});
addWalker('guard3',[[-8,-24],[12,-24],[30,-24,'relaxed',5,Math.PI],[30,-4],[12,-4],[-8,-8,'watch',4,0]],{speed:1.35});
/* two men smoking by the containers */
{const pair=[['guard1',18.6,-5.2,2.2],['guard5',20.1,-6.3,-1.0]];pair.forEach(([c,x,z,ry],i)=>{const h=buildHuman({char:c,outfit:'ratnik',vest:i===0,helmet:false});h.root.position.set(x,0,z);h.root.rotation.y=ry;scene.add(h.root);
  animate(h,{pose:'relaxed',plan:i?[['relaxed',9],['watch',4,1],['relaxed',11,1],['stretch',3.5,1.2]]:[['relaxed',6],['warm',5,1],['relaxed',12,1],['watch',3,1]]});solids.push({cx:x,cz:z,r:.32});
  if(!i)NPCS.push({h,line:'Got a smoke? …No? Then keep walking, contract man.',said:false,x,z});});}
/* ammunition boxes stacked on pallets by the containers, a spare-wheel stack by the parked BTR */
[[26.5,-6.6],[26.5,-8.2]].forEach(([x,z],k)=>{mesh(rbox(1.2,.14,.8,.02),M.wood,x,.07,z,scene);for(let i=0;i<4+k;i++){const b_=mesh(rbox(.56,.22,.32,.012),M.olive,x-.28+(i%2)*.56,.25+Math.floor(i/2)*.23,z+(i%2?.12:-.12)*.0,scene);b_.rotation.y=(R()-.5)*.08;}solids.push({cx:x,cz:z,r:.7});});
{for(let i=0;i<4;i++){const t_=mesh(new T.TorusGeometry(.48,.17,8,18),M.rubber||M.black,27.2,.17+i*.34,5.5,scene);t_.rotation.x=Math.PI/2;t_.rotation.z=i*.4;}solids.push({cx:27.2,cz:5.5,r:.7});}
/* ---------- quality / resize ---------- */
function applyQuality(name){Q=QUAL[name]||QUAL.med;$('q').value=$('q2').value=name;buildGrass(Q.grassR);sun.shadow.mapSize.set(Q.shadow,Q.shadow);if(sun.shadow.map){sun.shadow.map.dispose();sun.shadow.map=null;}resize();try{localStorage.setItem('z12q',name);}catch(_){}}
let DRS=1;/* dynamic resolution: keeps weaker GPUs near 50+ fps */
const DRSs={n:0,t:performance.now()};
function resize(){const w=innerWidth,h=innerHeight,pr=Math.min(devicePixelRatio,1.5)*Q.pr*DRS;postMat.uniforms.uAA.value=(!GL2||!Q.ms||pr<Math.min(devicePixelRatio,1.5)*.99)?1:0;renderer.setPixelRatio(pr);renderer.setSize(w,h,false);makeRT(Math.floor(w*pr),Math.floor(h*pr));
  camera.aspect=vmCam.aspect=w/h;camera.updateProjectionMatrix();vmCam.updateProjectionMatrix();fxScale(h*pr,camera.fov);postMat.uniforms.uRes.value.set(w*pr,h*pr);}
addEventListener('resize',resize);
['q','q2'].forEach(id=>$(id).onchange=e=>applyQuality(e.target.value));
['sens','sens2'].forEach(id=>$(id).oninput=e=>{S.sens=+e.target.value;$('sens').value=$('sens2').value=e.target.value;try{localStorage.setItem('z12s',e.target.value);}catch(_){}});
try{const q=localStorage.getItem('z12q');if(q&&QUAL[q])Q=QUAL[q];const s=localStorage.getItem('z12s');if(s){S.sens=+s;$('sens').value=$('sens2').value=s;}}catch(_){}
$('q').value=$('q2').value=Object.keys(QUAL).find(k=>QUAL[k]===Q);
/* frame rate: optional cap (frames are skipped in the rAF loop so timing stays exact) and an on-screen counter */
const FPS={cap:0,show:false,last:0,ms:0};
try{FPS.cap=+(localStorage.getItem('z12fc')||0)||0;FPS.show=localStorage.getItem('z12fs')==='1';}catch(_){}
function applyFPS(){['fpsc','fpsc2'].forEach(i=>$(i).value=String(FPS.cap));['fpss','fpss2'].forEach(i=>$(i).checked=FPS.show);
  $('fps').style.display=(FPS.show||DBG)?'block':'none';FPS.last=0;try{localStorage.setItem('z12fc',FPS.cap);localStorage.setItem('z12fs',FPS.show?'1':'0');}catch(_){}}
['fpsc','fpsc2'].forEach(i=>$(i).onchange=e=>{FPS.cap=+e.target.value;applyFPS();});
['fpss','fpss2'].forEach(i=>$(i).onchange=e=>{FPS.show=e.target.checked;applyFPS();});

/* ---------- main loop ---------- */
const SHX=V3(0,1,0).cross(SUN).normalize(),SHY=SUN.clone().cross(SHX).normalize();
const clock={last:performance.now()};let fpsN=0,fpsT=0;
const snap=V3();
function frame(now){requestAnimationFrame(frame);
  if(FPS.cap){const iv=1000/FPS.cap;if(now-FPS.last<iv-1.2)return;FPS.last=(now-FPS.last>iv*2)?now:FPS.last+iv;}
  const rdt=window.__hold?0:(window.__fdt||clamp((now-clock.last)/1000,0,.05));const dt=rdt*(window.__ts||1)*(S.ts===undefined?1:S.ts);clock.last=now;S.t+=dt;
  GRASS.uni.uTime.value=S.t;{const g=CH2.capG;const N=GRASS.uni.uNPC.value;if(g&&g.parent&&S.chapter>=2){N.set(g.position.x,1,g.position.z);}else N.set(0,0,-999);}skyMat.uniforms.uT.value=S.t;
  /* weather (dry until the intro ride is over) */
  {const cpx=camera.position.x,cpz=camera.position.z;let HB=HOUSE,bd=1e9;for(const b of HOUSES){const d=Math.hypot((b.x1+b.x2)/2-cpx,(b.z1+b.z2)/2-cpz);if(d<bd){bd=d;HB=b;}}WU.box.value.set(HB.x1-.2,HB.z1-.2,HB.x2+.2,HB.z2+.2);WU.boxY.value=FL+4.6;
   if(!S.wetScanT||S.t>S.wetScanT){wetScan();S.wetScanT=S.t+2;}
   const ind=inHouse(camera.position.x,camera.position.z);const r=weatherUpdate(dt,camera.position,ind);
   postMat.uniforms.uDrops.value=(S.state==='play'||S.state==='ride')&&!ind?clamp(r*1.4,0,1)*(.45+.55*clamp(-camera.rotation.x*2+.5,0,1)):0;}
  if(S.state!=='ride')btrTick(dt);
  ch2Tick(dt,rdt);ch3Tick(dt,rdt);heliTick(dt);forestTick(dt);blastTick(dt);fieldsTick(dt);nfxTick(dt);actTick(dt);wxTick(dt);
  if(S.state==='ride')tickRide(dt,rdt);
  else if(S.state==='play'){movePlayer(dt);findInteract();shoot(dt);tickStats(dt);
    if(S.searched&&S.chapter!==2&&!SHADOW.on&&!SHADOW.dead&&player.pos.z<-250){const inH=inHouse(player.pos.x,player.pos.z);if(inH)S.wasIn=true;
      S.outT=(!S.wasIn||inH||Math.hypot(player.pos.x-HX,player.pos.z-HZ)<7)?0:(S.outT||0)+dt;
      if(S.outT>1.2){const a=player.yaw+Math.PI+(R()<.5?-1:1)*rnd(.35,.6);spawnShadow(player.pos.x+Math.sin(a)*16,player.pos.z+Math.cos(a)*16);}}
    if(SHADOW.dead||!S.searched)shadow2Tick(dt);
    shadowUpdate(dt);}
  else if(S.state==='view'){mdx=mdy=0;}
  if(S.state==='play'||S.state==='view'||S.state==='inv'||S.state==='paused')tickVM(dt);
  GRASS.uni.uCenter.value.set(Math.floor(camera.position.x/GRASS.uni.uCell.value),Math.floor(camera.position.z/GRASS.uni.uCell.value));grassBounds();if(typeof vegLOD==='function')vegLOD();
  if(S.door){S.door.g.rotation.y=damp(S.door.g.rotation.y,S.door.open?1.75:0,6,dt);}for(const d of DOORS)d.g.rotation.y=damp(d.g.rotation.y,d.open?1.75:0,6,dt);
  flashlight.intensity=damp(flashlight.intensity,S.flash&&(S.state==='play'||S.state==='view')?6:0,14,dt);flashlight.shadow.autoUpdate=flashlight.intensity>.02;playerBody.root.visible=S.state!=='ride';
  if(flagMesh&&flagMesh.parent&&camera.position.distanceToSquared(flagMesh.getWorldPosition(AV3))<14400){const p=flagMesh.geometry.attributes.position,b=flagMesh.userData.base;for(let i=0;i<p.count;i++){const x=b[i*3]+1.05,y=b[i*3+1];p.setZ(i,Math.sin(S.t*3.2-x*2.6+y*.8)*.11*x/2.1);p.setY(i,y-x*x*.03);}p.needsUpdate=true;flagMesh.geometry.computeVertexNormals();}
  walkersTick(dt);
  /* (a man out of sight - behind you, and far enough off that his shadow cannot reach into view - is not posed this
     frame; the time he missed is caught up the moment he is back in view, so nothing he does is lost) */
  {const tgt={x:camera.position.x,y:camera.position.y,z:camera.position.z};camera.updateMatrixWorld();_amPV.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);_amF.setFromProjectionMatrix(_amPV);
   for(const a of ANIMS){if(a.paused)continue;a.h.root.getWorldPosition(AV3);const d2=AV3.distanceToSquared(camera.position);if(d2>=3600)continue;
     _amS.center.copy(AV3);_amS.center.y+=.9;_amS.radius=1.4;if(d2>64&&!_amF.intersectsSphere(_amS)){a._skip=(a._skip||0)+dt;continue;}const dd=Math.min(.25,dt+(a._skip||0));a._skip=0;a.update(dd,tgt);}}springTick(dt,camera.position);
  if(S.stove&&camera.position.distanceToSquared(S.stove.p)<4900)fireUpdate(dt,S.t);
  tentSmoke(dt);fxUpdate(dt);casesUpdate(dt);
  if(S.flies){const a=S.flies.arr;S.flies.ph.forEach((f,i)=>{const c=CORPSES[f[3]];const t=S.t*f[2]*3+f[0];a[i*3]=c[0]+Math.sin(t)*.35+Math.sin(t*2.3)*.1;a[i*3+1]=FL+.5+Math.sin(t*1.7+f[1])*.25;a[i*3+2]=c[1]+Math.cos(t*1.3)*.35;});S.flies.pts.geometry.attributes.position.needsUpdate=true;}
  {let live=false;for(let i=0;i<dust.n;i++){if(dust.life[i]>0){live=true;dust.life[i]-=dt*.35;dust.a[i*3+1]+=dt*.5;dust.a[i*3]+=dt*.3;}else if(dust.a[i*3+1]!==-50){dust.a[i*3+1]=-50;live=true;}}if(live)dust.m.geometry.attributes.position.needsUpdate=true;}
  for(let i=puffs.length-1;i>=0;i--){const p=puffs[i];p.t+=dt;for(let k=0;k<10;k++){p.a[k*3]+=p.v[k].x*dt;p.a[k*3+1]+=p.v[k].y*dt;p.a[k*3+2]+=p.v[k].z*dt;}p.m.geometry.attributes.position.needsUpdate=true;p.m.material.opacity=.6*(1-p.t/.8);if(p.t>.8){scene.remove(p.m);puffs.splice(i,1);}}
  /* shadow camera follows, snapped to texels to stop shimmering */
  /* snap in the light's own frame (a world-XZ grid isn't aligned with the shadow map's texels, so the shadow
     pattern on nearby surfaces like the BTR deck crawled and looked different every time you arrived) */
  {const ts=96/Q.shadow,p=camera.position,ax=SHX.dot(p),ay=SHY.dot(p),az=SUN.dot(p);
   snap.copy(SHX).multiplyScalar(Math.round(ax/ts)*ts).addScaledVector(SHY,Math.round(ay/ts)*ts).addScaledVector(SUN,az);
   sun.position.copy(snap).addScaledVector(SUN,120);sun.target.position.copy(snap);}
  sky.position.copy(camera.position);
  if(sayT>0){sayT-=dt;if(sayT<=0&&S.state!=='ride')$('bars').style.opacity=0;}
  if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').classList.remove('on');}
  if(S.state==='play'&&document.pointerLockElement!==canvas&&!curInt&&!DBG){$('prompt').textContent='Click to take control';$('prompt').classList.add('on');}
  audioTick(dt);aud2Tick(dt);btrRunTick(dt);warTick(dt);villTick(dt);warFxTick(dt);
  const P=postMat.uniforms;P.uT.value=S.t;P.uWar.value=WEATHER.war||0;{/* (the eye adapts: indoors, out of the daylight, it opens up a little) */const cp=camera.position;const ind=inHouse(cp.x,cp.z)&&cp.y<3.2;P.uExp.value=damp(P.uExp.value,ind?1.6:1.12,ind?1.1:1.8,rdt||1/60);}P.uSan.value=clamp((45-S.sanity)/45,0,1);P.uDmg.value=S.sinceDmg<.6?1-S.sinceDmg/.6:clamp((25-S.hp)/25,0,.7);P.uRad.value=clamp((S.rate-3)/40,0,1)*(S.state==='play'?1:0);P.uHP.value=S.hp/100;P.uDrunk.value=S.drunk>0?.6:0;
  if(S.state==='play'||S.state==='view')updateHUD();objMarker(dt);
  if(window.__camOv){const c=window.__camOv(),q=camera;q.position.copy(c[0]);q.up.set(0,1,0);q.lookAt(c[1]);vmRoot.visible=false;}
  streamTick();PORTRAIT.tick();distanceCull();regionOffload();humanLOD(camera.position);
  renderer.setRenderTarget(rt);renderer.clear();renderer.render(scene,camera);
  if((S.state==='play'||S.state==='view'||S.state==='paused')&&((vmRoot.visible&&VM.gun)||(RIG.g&&RIG.g.visible))){renderer.clearDepth();renderer.render(vmScene,vmCam);}
  /* bloom / sun shafts (off on Low) */
  if(Q.ms||Q.pr>=1){P.tB.value=runBloom(rt.texture);P.uBloom.value=.4;P.uSharp.value=.35;
    const sv=AV3.copy(SUN).multiplyScalar(500).add(camera.position).project(camera);const fw=camera.getWorldDirection(AV2).dot(SUN);
    P.uSunUV.value.set(sv.x*.5+.5,sv.y*.5+.5);P.uRays.value=fw>0?clamp(fw*1.4-.1,0,1)*.22*clamp(1.6-Math.max(Math.abs(sv.x),Math.abs(sv.y)),0,1)*(1-.8*(WEATHER.dim||0)):0;}
  else{P.tB.value=null;P.uBloom.value=0;P.uRays.value=0;P.uSharp.value=0;}
  renderer.setRenderTarget(null);P.tD.value=rt.texture;renderer.render(postScene,postCam);
  if(S.state==='inv'){doll.root.rotation.y+=dt*.5;dollR.render(dollS,dollC);}
  fpsN++;fpsT+=dt;if(fpsT>=.5){$('fps').textContent=Math.round(fpsN/fpsT)+' FPS · '+(fpsT*1000/fpsN).toFixed(1)+' ms'+(FPS.cap?' · cap '+FPS.cap:'');fpsN=0;fpsT=0;}
  /* frame-rate governor: below 30 fps the render resolution drops quickly (to 60%), a little below 40 it eases down,
     with headroom it comes back up; if the resolution is already at its floor and it is still under 30, the grass ring
     is drawn smaller until things recover. Geometry, textures and lighting are never touched. */
  if(S.state==='play'){DRSs.n++;const el=now-DRSs.t;if(el>1500){const f=DRSs.n*1000/el;DRSs.n=0;DRSs.t=now;
    const cap=FPS.cap||1e9,goal=Math.min(30,cap*.9),fl=Q===QUAL.high?.7:.6;DRSs.low=f<Math.min(40,cap*.85)?(DRSs.low||0)+1:0;const old=DRS;
    if(DRSs.warm>2){if(f<goal)DRS=Math.max(fl,DRS-.12);else if(DRSs.low>=2)DRS=Math.max(fl,DRS-.06);else if(f>Math.min(58,cap*.96))DRS=Math.min(1,DRS+.04);
      if(f<goal&&old<=fl+.001&&!DRSs.cut){DRSs.cut=1;buildGrass(Q.grassR*.72);}else if(DRSs.cut&&DRS>=.99&&f>Math.min(55,cap*.96)){DRSs.cut=0;buildGrass(Q.grassR);}}
    DRSs.warm=(DRSs.warm||0)+1;if(Math.abs(old-DRS)>.01)resize();}}else{DRSs.n=0;DRSs.t=now;}}

/* ---------- start / debug views ---------- */
const DBG=(location.hash||'').slice(1).split('&')[0];if(location.hash.includes('rain')){window.__rain=1;window.__wet=1;}
function begin(){initAudio();$('menu').classList.add('off');mountWeapon('pm');
  startRide([{type:'card',dur:3.6,k:'Войска РХБЗ · Zone 12',h:'F.O.B. «Kurgan»',p:'19 October · 16:40 · overcast, +4 °C',then(){parkBTR(150);}},
    {type:'drive',z0:150,z1:btrPark.z,dur:15,ease:'o',lines:[[1.5,'DRIVER','New contract? Welcome to the Twelfth. Keep the dosimeter on your chest, not in a pouch.'],[8,'DRIVER','Gate ahead. Jump down and find the orders board by the road.']]},
    {type:'dismount',dur:1.5,x:2.9,z:btrPark.z-1,yaw:.15}]);
  RIDE.done=()=>{setObj('Read the orders board by the road, then board the BTR.');setBoard(false);S.introDone=true;WEATHER.enabled=true;WEATHER.timer=300+Math.random()*240;setTimeout(()=>saveGame(false),400);};}
$('start').onclick=begin;
if($('cont')){$('cont').onclick=loadGame;updateContinue();}if($('loadd'))$('loadd').onclick=freshLoad;if($('savep'))$('savep').onclick=()=>{saveGame(true);};if($('loadp'))$('loadp').onclick=()=>{if(saveData())freshLoad();else toast('No saved game.');};
$('again').onclick=()=>location.reload();
function debugView(v){$('menu').classList.add('off');$('fade').style.opacity=0;mountWeapon(v==='ak'||v==='adsak'?'ak':'pm');S.state='view';$('hud').style.opacity=1;setBoard(false);
  const V={fob:[0,1.65,26,0,-.05],road1:[1.2,1.7,78,.08,-.28],road2:[-2.5,1.4,120,-.5,-.45],gnd:[-4,1.65,10,.6,-.6],csold:[HX-.2,FL+2.3,HZ+.9,0,-1.0],fire4:[-14.9,1.2,7.7,.75,-.55],fire2:[-14.4,1.35,8.1,.75,-.42],fire3:[-15.5,1.75,7.55,0,-1.1],gate2:[2,1.9,24,2.29,-.12],gate3:[2,1.9,-24,.85,-.12],gen:[-12,2.2,-20,.45,-.25],zsg:[-12,1.8,40,.4,-.05],gnd2:[5,1.65,-298,.3,-.5],gate:[-14,1.65,46,-.45,0],btr:[7,1.7,19,.75,-.1],field:[2.9,1.64+H(2.9,-294),-294,Math.atan2(-(HX-2.9),-(HZ+294)),0],
    gatev:[HX-.4,1.7,HZ+15,0,-.05],room1:[HX+3.0,FL+1.7,HZ+2.6,.72,-.35],cbed:[HX-1.3,FL+1.3,HZ+.6,1.35,-.55],cst:[HX-.4,FL+1.3,HZ-1.5,-1.57,-.55],cfl:[HX+1.2,FL+1.5,HZ-.2,1.18,-.75],fridge:[HX+.55,FL+1.2,HZ-1.2,0,-.12],paper:[HX-2.2,FL+.75,HZ+1.25,.3,-1.2],doorv:[HX-1.6,FL+1.6,HZ+.8,-.6,-.35],room2:[HX-3.0,FL+1.7,HZ-2.5,-2.4,-.38],room3:[HX+.6,FL+2.4,HZ+.2,0,-1.2],shedv:[HX-9.5,2.2,HZ-1,-2.3,-.15],shedb:[HX-3.5,3.4,HZ-8,2.4,-.3],house:[HX-6,1.64,HZ+14,-.35,-.02],inside:[HX-.4,FL+1.62,HZ+2.6,.35,-.32],corpse:[HX+.2,FL+1.5,HZ+.9,1.0,-.55],sign:[-3,1.64,-256,.25,0],corner:[50,1.7,44,.69,-.05],btr:[5.5,2.4,19.5,.785,-.2],btrref:[-5.2,2.3,7.6,-2.44,-.14],drvwin:[-.62,1.95,8.6,-2.6,-.3],btrside:[-9,1.4,14,-1.5708,0],btrr:[-5,2.6,8,-2.4,-.2],uazc:[-22,1.9,-319,1.0,-.15],bags:[-8,1.5,30.2,.2,-.2],mgnest:[13,1.8,-23.2,.15,-.25],fuel:[24.2,1.7,-1.6,-.69,-.2],zsign:[-10.5,1.7,40,0,0],walls:[0,14,60,0,-.32],
    vm:[0,1.64,20,0,0],ak:[0,1.64,20,0,0],ads:[0,1.64,20,0,0],adsak:[0,1.64,20,0,0],tents:[-12,1.65,-2,1.4,-.05],bed:[HX-1.7,FL+1.5,HZ+1.3,1.35,-.5],stove:[HX-.5,FL+1.45,HZ-.9,-1.75,-.4],soldier:[HX-.4,FL+1.6,HZ+1.6,0.2,-.95],west:[HX+1.5,FL+1.6,HZ+.5,1.45,-.25],front:[HX,FL+1.6,HZ-1.6,Math.PI,-.15],east:[HX-1.8,FL+1.6,HZ,-1.5,-.2],plan:[HX,FL+4.6,HZ+.01,0,-1.5707],wide:[30,8,60,.35,-.12],camp:[-12.6,1.55,9.6,.86,-.2],fire:[-14.2,1.3,8.4,.75,-.3],uaz:[-22.5,1.5,-318.5,.55,-.12],net:[9,2.2,16,-.85,-.05],gate:[-6.5,1.6,33.2,Math.PI,-.05]};
  if(v==='ridecam'){parkBTR(-40);btr.updateMatrixWorld(true);camera.position.copy(SEAT).applyMatrix4(btr.matrixWorld);camera.rotation.set(-.1,.15,0);vmRoot.visible=false;$('hud').style.opacity=0;say('DRIVER','Hold on. The road is bad past the north gate.',99);S.where='sector';return;}
  if(v==='faces'||v==='face'||v==='face2'||v==='bodies'||/^f[cs]\d$/.test(v)||/^b[fsk]\d$/.test(v)){S.state='view';vmRoot.visible=false;const L=location.hash.includes('kit')?[['guard1'],['guard2'],['player'],['guard3'],['guard4'],['guard5']].map(([c])=>({char:c,outfit:'ratnik',vest:true,helmet:true})):location.hash.includes('crew')?['player','guard1','guard2','guard3','guard4','guard5'].map((c,i)=>({char:c,outfit:'ratnik',vest:i%2===1,helmet:i===3})):[{char:'player',outfit:'ratnik'},{char:'oldman',outfit:'telogreika'},{char:'plaid',outfit:'plaid'},{char:'guard2',outfit:'ratnik',vest:true,helmet:true},{char:'guard1',outfit:'ratnik'},{char:'patrol',outfit:'ratnik'}];
    L.forEach((o,i)=>{const h=buildHuman(o);h.root.position.set(-2.5+i*1,0,20);scene.add(h.root);let ap=(location.hash.split('&')[1]||'relaxed');if(ap==='tune')ap='tune'+i;if(!AP[ap]&&ap!=='mix')ap='relaxed';animate(h,{pose:ap==='mix'?['relaxed','ready','squat','kneel','sitCrate','stretch'][i]:ap,gun:(ap==='ready'||ap==='kneel'||ap==='squat'||ap==='mix'&&[1,2,3].includes(i))&&o.outfit==='ratnik'?buildAK(false):null});});
    let cv={faces:[0,1.7,22.4,0,-.05],bodies:[0,1.1,24.6,0,-.02],face:[-2.5,1.71,20.5,0,0],face2:[-1.5,1.68,20.5,0,0]}[v];
    if(!cv){const i=+v[2],hy=CHARDATA.chars[L[i].char].fit.headTop-.115;cv=v[0]==='b'?(v[1]==='f'?[-2.5+i,1.05,22.3,0,0]:v[1]==='s'?[-2.5+i+1.5,1.15,21.2,.95,-.05]:[-2.5+i-.1,1.0,18.4,Math.PI+.1,0]):v[1]==='c'?[-2.5+i,hy,20.62,0,0]:[-2.5+i+.42,hy,20.42,.78,0];}
    camera.position.set(cv[0],cv[1],cv[2]);camera.rotation.set(cv[4],cv[3],0);camera.fov=/^b[fsk]/.test(v)?42:/^f[cs]/.test(v)?28:v.startsWith('face')&&v!=='faces'?40:60;camera.updateProjectionMatrix();return;}
  if(v==='ride'){begin();return;}if(v==='doll'){S.state='play';toggleInv();return;}
  /* views along the new roads: [road, distance along, height, side offset, look yaw offset, pitch] */
  const RV={trk:['tr',150,1.7,0,0,-.08],trk2:['tr',60,2.9,-1,0,-.12],hwj:['hw',ROADS.sJ-30,1.7,2,Math.PI,-.06],hwa:['hw',ROADS.sJ+100,2.9,-1.2,0,-.1],hwb:['hw',ROADS.sJ+128,1.7,-8,-1.2,-.1],hwf:['hw',ROADS.sJ+90,1.6,12,1.5,-.05],kmp:['hw',ROADS.sJ+124.5,1.6,-2.2,.8,-.12],dl:['hw',ROADS.sJ+60,1.5,3.2,.25,-.12],sgn:['tr',ROADS.tr.L-18,1.6,-1.5,.35,-.04]};
  if(RV[v]){const [rk,s0,hh,off,yo,pt]=RV[v];const P=ROADS[rk].P;const i=P.findIndex(p=>p.s>=s0);const f=roadFrame(P,i);const x=P[i].x+f.nx*off,z=P[i].z+f.nz*off;
    V[v]=[x,H(x,z)+hh,z,Math.atan2(-f.tx,-f.tz)+yo,pt];}
  const c=V[v]||V.fob;if(v.startsWith('uaz'))c[1]=H(c[0],c[2])+(v==='uaz'?1.6:1.9);camera.position.set(c[0],c[1],c[2]);camera.rotation.set(c[4],c[3],0);player.pos.set(c[0],0,c[2]);player.y=c[1]-1.64;player.yaw=c[3];player.pitch=c[4];
  if(v.startsWith('ads'))S.ads=true;if(!['vm','ak','ads','adsak'].includes(v))vmRoot.visible=false;
  if(['inside','corpse','bed','stove','soldier','west','front','east'].includes(v)){S.flash=true;flashlight.intensity=6;}
  if(v==='plan'){scene.traverse(o=>{if(o.isMesh&&o.geometry===GEO.sheet)o.visible=false;});}}
/* ---------- saving ----------
   Progress is kept as checkpoints (the story is scripted, so a save restores the world as it stands at the last
   milestone - at the F.O.B., dropped at Sector 1, the house searched, awake after the ambush, on the road south) plus
   everything that is yours: health, dose, sanity, inventory, ammunition, the loot you have taken, where you stand. The
   game saves itself at each milestone; F5 / the pause menu saves on the spot, F9 / Continue loads. Kept in this
   browser's local storage. */
/* (var: the title screen asks for the save before this part of the script has run) */
var SAVEK='zone12.save.v1',SAVEB='zone12.save.v1.bak',SAVET='zone12.save.v1.tmp';
/* (v2) what was wrong before: a save that failed to parse, or was missing a field an older build did not write, came back as
   "no saved game" or threw half-way through loading and left a black screen; items you had dropped were not saved at all
   (they were gone after a load); nothing stopped a save being written while the game was in the middle of loading one; and
   the Continue button had no name for any chapter 3 checkpoint. Now every save is checked before it is used and filled in
   where an older one lacks something, the last good save is kept as a backup and used if the newest is unreadable, a save
   is written to a scratch slot and read back before it replaces the real one, and dropped items go with it. */
var CPS=['fob','orders','sector','searched','wake','south','ch3a','ch3b','ch3c','ch3d','ch3e','ch3f','ch3g'];
function saveCheck(d){if(!d||typeof d!=='object')return null;if(!CPS.includes(d.cp))return null;
  const num=(v,a,b,def)=>Number.isFinite(+v)?clamp(+v,a,b):def;
  const o=Object.assign({},d);o.v=2;o.hp=num(d.hp,1,100,100);o.sanity=num(d.sanity,0,100,100);o.stam=num(d.stam,0,100,100);o.dose=num(d.dose,0,99,0);o.flash=!!d.flash;
  o.equip=Object.assign({weapon:null,helmet:null,vest:null,outfit:null,attach:null,detector:null,optic:null},d.equip&&typeof d.equip==='object'?d.equip:{});
  for(const k in o.equip){const e=o.equip[k];if(e&&(!e.id||!ITEMS[e.id]))o.equip[k]=null;}
  o.bag=Array.isArray(d.bag)?d.bag.filter(e=>e&&e.id&&ITEMS[e.id]).slice(0,BAGMAX):[];
  o.ammo=Object.assign({'9x18':0,'5.45x39':0},d.ammo&&typeof d.ammo==='object'?d.ammo:{});for(const k in o.ammo)o.ammo[k]=Math.max(0,Math.floor(+o.ammo[k]||0));
  o.taken=Array.isArray(d.taken)?d.taken.filter(x=>typeof x==='string'):[];o.dropped=Array.isArray(d.dropped)?d.dropped.filter(e=>e&&e.id&&ITEMS[e.id]&&Number.isFinite(e.x)&&Number.isFinite(e.z)):[];
  o.pos=Array.isArray(d.pos)&&d.pos.length===2&&d.pos.every(Number.isFinite)?d.pos:null;o.yaw=num(d.yaw,-1e3,1e3,0);o.pitch=num(d.pitch,-1.5,1.5,0);o.obj=typeof d.obj==='string'?d.obj:'';
  if(/^ch3/.test(o.cp)&&(!d.ch3||typeof d.ch3!=='object'))return null;return o;}
function saveRead(k){try{const r=localStorage.getItem(k);return r?saveCheck(JSON.parse(r)):null;}catch(_){return null;}}
function saveData(){const d=saveRead(SAVEK);if(d)return d;const b=saveRead(SAVEB);if(b){b._fromBackup=true;return b;}return null;}
function checkpoint(){if(S.chapter===3)return 'ch3'+CH3.cp;if(S.chapter===2)return CH2.done2?'south':'wake';if(S.where==='sector'||S.btrHere)return S.searched?'searched':'sector';return S.ordersRead?'orders':'fob';}
function saveGame(manual){if(S.state!=='play'&&S.state!=='paused'&&S.state!=='inv'&&S.state!=='note'||S.hp<=0||S.loading){if(manual)toast('Cannot save right now.');return false;}
  if(window.ACT&&ACT.blockSave&&ACT.blockSave()){if(manual)toast('Cannot save right now.');return false;}
  const d={v:2,at:Date.now(),cp:checkpoint(),hp:S.hp,sanity:S.sanity,stam:S.stam,dose:S.dose,flash:S.flash,equip:S.equip,bag:S.bag,ammo:S.ammo,taken:S.taken||[],dropped:S.dropped||[],
    orders:S.ordersRead,searched:S.searched,checked:S.chapter>=2?CH2.checked:null,ch3:S.chapter===3?ch3SaveData():null,obj:($('objt')||{}).textContent||'',
    pos:[player.pos.x,player.pos.z],yaw:player.yaw,pitch:player.pitch,shadowDead:!!SHADOW.dead,sh2:S.sh2||null,seat:window.ACT&&ACT.seatSave?ACT.seatSave():null};
  let js;try{js=JSON.stringify(d);}catch(_){if(manual)toast('Could not save.');return false;}
  /* written to a scratch slot first and read back; only then does it replace the save, and the save it replaces is kept */
  try{localStorage.setItem(SAVET,js);if(!saveCheck(JSON.parse(localStorage.getItem(SAVET))))throw 0;const prev=localStorage.getItem(SAVEK);if(prev&&saveCheck((()=>{try{return JSON.parse(prev);}catch(_){return null;}})()))localStorage.setItem(SAVEB,prev);
    localStorage.setItem(SAVEK,js);localStorage.removeItem(SAVET);}
  catch(_){try{localStorage.removeItem(SAVET);}catch(__){}if(manual)toast('Could not save (storage unavailable). Your last save is unchanged.');return false;}
  if(manual)toast('Game saved.');else toast('Checkpoint saved.');updateContinue();return true;}
var CPNAME={fob:'F.O.B. «Kurgan»',orders:'F.O.B. «Kurgan»',sector:'Sector 1',searched:'Sector 1 · the house',wake:'The highway',south:'The highway · heading south',
  ch3a:'The forest',ch3b:'The flooded basin',ch3c:'The flooded basin',ch3d:'The lumber yard',ch3e:'The lumber yard · the path west',ch3f:'The road west',ch3g:'The road west · toward the line'};
function updateContinue(){const b=$('cont');if(!b)return;const d=saveData();b.style.display=d?'':'none';
  if(d){const when=new Date(d.at||Date.now());b.textContent='Continue · '+(CPNAME[d.cp]||'Last checkpoint')+' · '+when.toLocaleDateString()+' '+when.toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'});}}
function applySave(d){Object.assign(S,{hp:d.hp,sanity:d.sanity,stam:d.stam,dose:d.dose,flash:d.flash,equip:d.equip,bag:d.bag,ammo:d.ammo,taken:d.taken.slice(),dropped:[]});
  /* what you had put down is where you left it */(d.dropped||[]).forEach(L=>{const y=groundY(L.x,L.z);const L2=Object.assign({},L,{y,dropped:1});placeItem(L2);S.dropped.push(L2);});
  const tk=new Set(d.taken);for(let i=interact.length-1;i>=0;i--){const e=interact[i];if(e.L&&tk.has(lootKey(e.L))){scene.remove(e.obj);interact.splice(i,1);}}
  for(let i=worldItems.length-1;i>=0;i--)if(worldItems[i].L&&tk.has(lootKey(worldItems[i].L)))worldItems.splice(i,1);
  mountWeapon(S.equip.weapon&&S.equip.weapon.id);if(d.obj)setObj(d.obj);
  if(d.pos){player.pos.set(d.pos[0],0,d.pos[1]);player.y=groundY(d.pos[0],d.pos[1]);player.yaw=d.yaw||0;player.pitch=d.pitch||0;player.vel.set(0,0,0);
    camera.position.set(d.pos[0],player.y+1.64,d.pos[1]);camera.rotation.set(player.pitch,player.yaw,0);}}
/* loading in the middle of a game starts from a clean page (the world after an ambush, a fight, a fall is not undone
   piece by piece); from the title screen it loads straight away */
function freshLoad(){if(S.state==='boot'||!S.introDone){loadGame();return;}location.hash='';try{sessionStorage.setItem('z12load','1');}catch(_){}location.reload();}
function loadGame(){if(S.loading)return;const d=saveData();if(!d){toast('No saved game.');return;}S.loading=true;if(d._fromBackup)setTimeout(()=>toast('The newest save could not be read - loaded the one before it.'),1500);
  if(window.ACT&&ACT.reset)ACT.reset();
  initAudio();$('menu').classList.add('off');$('pause').classList.add('off');$('dead').classList.add('off');S.state='load';$('fade').style.opacity=1;
  const finish=()=>{applySave(d);S.loading=false;S.state='play';if(d.seat&&window.ACT&&ACT.seatLoad)setTimeout(()=>ACT.seatLoad(d.seat),400);$('hud').style.opacity=1;$('bars').style.opacity=0;vmRoot.visible=true;WEATHER.enabled=true;if(!WEATHER.timer)WEATHER.timer=300+Math.random()*240;
    setTimeout(()=>{$('fade').style.opacity=0;lockPointer();},300);toast('Loaded.');};
  S.introDone=true;S.ordersRead=!!d.orders;
  if(d.cp==='fob'||d.cp==='orders'){setBoard(false);finish();return;}
  if(d.cp==='sector'||d.cp==='searched'){parkBTR(DROPZ);S.where='sector';S.btrHere=true;S.searched=!!d.searched;setBoard('wait');if(d.shadowDead)SHADOW.dead=true;if(d.sh2)S.sh2=d.sh2;
    if(S.searched)for(let i=interact.length-1;i>=0;i--)if(typeof interact[i].label==='string'&&/search/i.test(interact[i].label))interact.splice(i,1);finish();return;}
  /* chapter 2: replay the ambush at full speed behind the black screen, so the wreck, the bodies and the survivor are exactly
     where they always are, then put you back */
  S.searched=true;ch2Offload();const P=ch2Path();CH2.path=P;window.__ts=24;window.__ffw=24;try{if(AC)AC.suspend();}catch(_){}rideReinforce({skip:true,s:P.sAmb-3});$('card').classList.remove('on');
  const done0=RIDE.done;RIDE.done=()=>{done0();window.__ts=1;window.__ffw=0;try{if(AC)AC.resume();}catch(_){}ch2Lids(1);if(d.checked){for(const k in d.checked){CH2.checked[k]=d.checked[k];const i=interact.findIndex(e=>e.label==='Check '+k||e.label==='Check Captain '+k);if(i>=0&&k!=='Morozov')interact.splice(i,1);}}
    if(d.cp==='south'||/^ch3/.test(d.cp))CH2.done2=1;CH2.rec=-1;CH2.post.blur=CH2.post.dbl=CH2.post.desat=0;finish();if(d.ch3)ch3Restore(d);};}
addEventListener('keydown',e=>{if(e.code==='F5'){e.preventDefault();saveGame(true);}if(e.code==='F9'){e.preventDefault();if(saveData())freshLoad();}});
function boot(){applyQuality(Object.keys(QUAL).find(k=>QUAL[k]===Q));applyFPS();$('load').remove();requestAnimationFrame(frame);
  if(DBG)debugView(DBG);else{$('fade').style.opacity=0;let ld=false;try{ld=sessionStorage.getItem('z12load')==='1';sessionStorage.removeItem('z12load');}catch(_){}if(ld&&saveData())setTimeout(loadGame,200);}}
