/* ---------- chapter 3: on foot with Captain Morozov - the comms call, west through the forest and the old collective
   field, across the district road, the fog coming in with the rain, the flooded basin and what lives in it, the
   separatist outpost at the lumber yard ---------- */
const CH3={stage:-1,cp:'a',q:[],qt:0,seps:[],kills:0,alert:false,crumbs:[],lastCrumb:null,mz:null,t:0,flags:{},shotT:-99};
/* dialogue queue on game time (pauses with the game) */
function ch3Say(L,cb){L.forEach(l=>CH3.q.push(l));if(cb)CH3.q.push({fn:cb});}
function ch3Queue(dt){if(S.state!=='play'&&S.state!=='view')return;CH3.qt-=dt;if(CH3.qt>0||!CH3.q.length)return;const l=CH3.q.shift();if(l.fn){l.fn();CH3.qt=0;return;}say(l[0],l[1],l[2]);CH3.qt=l[2]+.35;}

/* ======================= Morozov on foot ======================= */
/* he walks with a limp: the bandaged left leg (game R) is kept stiff and swung round, he hurries off it (less time
   on it, more on the good leg), the hip hitches on that side and he leans away from it; the rifle at low ready */
function limpPose(B,G,dt,v,ph){const pw=ph-.32*Math.sin(ph);gaitPose(B,G,dt,v,pw,false,0);const a=G.a;
  const uR=(((pw+Math.PI)/(Math.PI*2))%1+1)%1;const swingR=sstep(.55,.66,uR)*(1-sstep(.88,.98,uR)),stanceR=1-swingR;
  B.knR.rotation.x=.24+(B.knR.rotation.x-.24)*.42;B.hpR.rotation.z-=.13*swingR*a;B.hpR.rotation.x*=1-.18*a;B.anR.rotation.x=-(B.hips.rotation.x+B.hpR.rotation.x+B.knR.rotation.x)+(B.anR.rotation.x+(B.hips.rotation.x+B.hpR.rotation.x+B.knR.rotation.x))*.5;
  B.hips.rotation.z+=(.07*swingR-.03)*a;B.hips.position.y-=.035*stanceR*a*Math.max(0,Math.sin(uR*Math.PI*1.6));
  B.spine.rotation.z+=.1+.04*stanceR*a;B.neck.rotation.z-=.05;B.spine.rotation.x+=.06*a;}
const MZ={state:'stand',p:V3(),yaw:0,v:0,ph:0,G:{a:0,run:0,t:0,var:1,calm:true},k:0,solid:null,fireCd:2,burst:0,cover:null,wade:0,look:0};
function mzInit(){const g=CH2.capG;if(!g)return;MZ.p.set(g.position.x,0,g.position.z);MZ.yaw=g.rotation.y;MZ.solid={cx:MZ.p.x,cz:MZ.p.z,r:.34};solids.push(MZ.solid);
  CH2.capAn.o.hands=(an)=>mzPost(an);CH3.mz=MZ;if(!MZ.radio)mzRadio(CH2.captain);}
/* his R-187 "Azart" in its pouch on the left of his vest: the set, the whip antenna up past the shoulder, the
   coiled lead to the handset clipped on the chest - which he takes up to his ear for the call */
function mzRadio(h){const B=h.P.bones,c=CD.chars[h.name].fit;const sp=B.spine;
  /* built in the body's bind space (he is already standing somewhere, posed, by now) and carried by the spine bone */
  const inv=h.skel.boneInverses[h.skel.bones.indexOf(sp)].clone();
  const vz=(x,y)=>Math.max(frontZ(h,x,y),c.chestF);
  const ol=std({color:C(0x4a4c38),roughness:.9}),bl=std({color:C(0x1a1b1a),roughness:.55,metalness:.2}),gr=std({color:C(0x2c2e2a),roughness:.7});const bk=bucket();
  const x=.135,y=c.chestY-.06,z=vz(x,y)+.03;
  bk.add(rbox(.078,.15,.052,.01),ol,TRS(x,y,z));bk.add(rbox(.082,.04,.056,.008),ol,TRS(x,y+.07,z+.002));
  bk.add(rbox(.06,.035,.04,.006),bl,TRS(x,y+.1,z-.002));[[-.016],[.014]].forEach(([dx])=>bk.add(new T.CylinderGeometry(.007,.007,.012,12),gr,TRS(x+dx,y+.122,z)));
  bk.add(new T.CylinderGeometry(.008,.009,.03,8),bl,TRS(x+.02,y+.13,z-.006));
  const ant=new T.CylinderGeometry(.0018,.0035,.5,5);ant.translate(0,.25,0);bk.add(ant,bl,TRS(x+.02,y+.14,z-.006,-.32,0,-.12));
  /* the handset on the chest, and its coiled lead */
  const px=-.02,py=c.chestY+.05,pz=vz(px,py)+.02;bk.add(rbox(.02,.014,.006,.003),gr,TRS(px+.013,py+.01,pz+.014));
  {const pts=[];for(let i=0;i<=60;i++){const t=i/60;const a=V3(x-.02,y+.04,z+.02),b=V3(px+.01,py-.035,pz);const m=a.clone().lerp(b,t);m.y-=Math.sin(t*Math.PI)*.04;m.x+=Math.cos(t*44)*.006;m.z+=Math.sin(t*44)*.006;pts.push(m);}
   bk.add(new T.TubeGeometry(new T.CatmullRomCurve3(pts),180,.0018,4),bl);}
  const ms=bk.flush(null,false);ms.forEach(m=>{m.geometry.applyMatrix4(inv);sp.add(m);});MZ.radio=ms;
  /* the handset he holds at his ear (shown only then) and the one clipped on his chest (hidden then) */
  const hs=new T.Group();const a=mesh(rbox(.045,.075,.026,.008),bl,0,0,0,hs);B.wrR.add(hs);hs.position.set(0,-.09,.03);hs.rotation.set(0,0,0);hs.visible=false;MZ.handset=hs;
  {const cp=new T.Mesh(rbox(.045,.075,.026,.008).applyMatrix4(TRS(px,py,pz,-.1,0,0)).applyMatrix4(inv),bl);cp.castShadow=true;sp.add(cp);MZ.chestPtt=cp;}}
function mzPost(an){const B=an.B;let ch=false;if(MZ.aimP!==undefined){B.spine.rotation.x-=MZ.aimP*.8;ch=true;}
  if(ch){an.h.root.updateMatrixWorld(true);an.reach('L',GRIP.trig);an.reach('R',GRIP.supp);}
  /* on the radio: the left hand comes off the handguard and holds the handset to his ear */
  MZ.tk=damp(MZ.tk||0,MZ.talk?1:0,4,1/60);if(MZ.handset){MZ.handset.visible=MZ.tk>.5;if(MZ.chestPtt)MZ.chestPtt.visible=MZ.tk<=.5;}
  if(MZ.tk>.02&&an.gun){an.h.root.updateMatrixWorld(true);const yw=MZ.yaw,L=V3(Math.cos(yw),0,-Math.sin(yw)),F=V3(Math.sin(yw),0,Math.cos(yw));
    const hp=B.head.getWorldPosition(new T.Vector3());const T0=hp.clone().addScaledVector(L,.12).addScaledVector(F,.03).add(V3(0,-.01,0));
    const g=an.gun;const Tg=g.localToWorld(GRIP.supp.p.clone()),Fg=GRIP.supp.f.clone().transformDirection(g.matrixWorld),Ng=GRIP.supp.n.clone().transformDirection(g.matrixWorld);
    const k=sstep(0,1,MZ.tk);an.reachW('R',Tg.lerp(T0,k),Fg.lerp(V3(0,1,0).addScaledVector(F,.25),k).normalize(),Ng.lerp(L.clone().negate(),k).normalize());}}
/* where he should be going: along your trail, a few metres behind you */
function mzTarget(){const C=CH3.crumbs;if(!C.length)return null;let acc=0;for(let i=C.length-1;i>0;i--){acc+=C[i].distanceTo(C[i-1]);if(acc>3.2)return i-1;}return 0;}
function mzTick(dt){const g=CH2.capG,an=CH2.capAn;if(!g||!an)return;const pp=player.pos;
  /* your trail */
  if(!CH3.lastCrumb||CH3.lastCrumb.distanceTo(pp)>.8){const c=pp.clone();c.y=0;CH3.crumbs.push(c);CH3.lastCrumb=c;if(CH3.crumbs.length>500){CH3.crumbs.shift();MZ.k=Math.max(0,MZ.k-1);}}
  const d2p=Math.hypot(pp.x-MZ.p.x,pp.z-MZ.p.z);let want=null,speed=0;
  if(MZ.state==='follow'||MZ.state==='toCover'){
    if(MZ.state==='toCover'&&MZ.cover){want=MZ.cover;speed=2.4;}
    else{const ti=mzTarget();if(ti!==null){MZ.k=Math.min(Math.max(MZ.k,0),ti);
        /* skip ahead along the trail when you doubled back near him */
        for(let i=ti;i>MZ.k;i--)if(CH3.crumbs[i].distanceTo(MZ.p)<1.2){MZ.k=i;break;}
        const c=CH3.crumbs[MZ.k];if(c&&Math.hypot(c.x-MZ.p.x,c.z-MZ.p.z)<.6&&MZ.k<ti)MZ.k++;want=CH3.crumbs[MZ.k];
        const behind=(CH3.crumbs.length-1-MZ.k)*.8;MZ.behind=behind;speed=d2p<3.2?0:behind>16?2.6:clamp(Math.hypot(player.vel.x,player.vel.z)*1.05+(behind>8?.4:0),1.1,2.1);}}}
  if(want&&speed>0){const dx=want.x-MZ.p.x,dz=want.z-MZ.p.z,d=Math.hypot(dx,dz);if(d<.35&&MZ.state==='toCover'){MZ.state='cover';speed=0;}
    else{let dy=Math.atan2(dx,dz)-MZ.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));MZ.yaw+=dy*clamp(dt*3,0,1);const slow=clamp(1-Math.abs(dy)/1.8,.35,1);MZ.v=damp(MZ.v,speed*slow,3,dt);}}
  else MZ.v=damp(MZ.v,0,5,dt);
  /* water slows him, the player's body shoves him aside */
  MZ.wade=inDET(MZ.p.x,MZ.p.z)?Math.max(0,W3.wl-H(MZ.p.x,MZ.p.z)):0;const vv=MZ.v*(MZ.wade>0?lerp(1,.45,clamp(MZ.wade/.9,0,1)):1);
  MZ.p.x+=Math.sin(MZ.yaw)*vv*dt;MZ.p.z+=Math.cos(MZ.yaw)*vv*dt;{const ox=MZ.p.x-pp.x,oz=MZ.p.z-pp.z,od=Math.hypot(ox,oz);if(od<.9&&od>1e-4){MZ.p.x=pp.x+ox/od*.9;MZ.p.z=pp.z+oz/od*.9;}}
  if(vv>.3){const st=Math.floor(MZ.ph/Math.PI);MZ.ph+=vv*dt/.62*Math.PI;if(Math.floor(MZ.ph/Math.PI)!==st){if(MZ.wade>.05&&d2p<30){WATER.ring(MZ.p.x,MZ.p.z,.6);if(d2p<14)sfx.splash(.25+MZ.wade*.5);}else if(d2p<16)sfx.stepAt(V3(MZ.p.x,H(MZ.p.x,MZ.p.z)+.05,MZ.p.z),surface(MZ.p.x,MZ.p.z),vv);}}
  const moving=MZ.v>.12;
  if(moving){an.paused=true;limpPose(an.B,MZ.G,dt,MZ.v*1.7,MZ.ph);an.holdGun(AP.lowready.hold,MZ.ph);MZ.aimP=undefined;
    /* he glances at you and about him as he goes */
    let a=Math.atan2(pp.x-MZ.p.x,pp.z-MZ.p.z)-MZ.yaw;a=Math.atan2(Math.sin(a),Math.cos(a));MZ.look=damp(MZ.look,Math.abs(a)<1.5&&d2p<8?a*.6:Math.sin(S.t*.4)*.3,3,dt);an.B.neck.rotation.y+=MZ.look*.45;an.B.head.rotation.y+=MZ.look*.55;}
  else{if(an.paused){an.paused=false;MZ.G.a=0;}const pz=MZ.state==='crab'?'kneelAim':MZ.state==='cover'?(MZ.peek?'kneelAim':'cover'):(CH3.alert&&!CH3.clear?'kneelAim':'woundStand');an.go(pz,.6);
    /* turn to face you, or the enemy */
    let ty=MZ.yaw;if(MZ.face!==undefined)ty=MZ.face;else if(d2p<12)ty=Math.atan2(pp.x-MZ.p.x,pp.z-MZ.p.z);let dy=ty-MZ.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));MZ.yaw+=dy*clamp(dt*(Math.abs(dy)>.5?2.2:1),0,1);}
  g.position.set(MZ.p.x,H(MZ.p.x,MZ.p.z),MZ.p.z);g.rotation.y=MZ.yaw;MZ.solid.cx=MZ.p.x;MZ.solid.cz=MZ.p.z;
  /* blood drips from the dressing as he walks - every few metres, not a trail */
  MZ.drip=(MZ.drip||0)+vv*dt;if(MZ.drip>5.5&&MZ.wade<=0){MZ.drip=0;if(WR()<.55)stain('spot',MZ.p.x+wr(-.15,.15),MZ.p.z+wr(-.15,.15),.16,.2,V3(Math.sin(MZ.yaw),0,Math.cos(MZ.yaw)),{life:120});}
  /* too far behind: he calls after you */
  MZ.waitCd=(MZ.waitCd||8)-dt;if(MZ.state==='follow'&&!CH3.alert&&(MZ.behind||0)>20&&d2p>14&&MZ.waitCd<=0&&!CH3.q.length){MZ.waitCd=35;
    const L=MZ.behind>45?['CAPTAIN MOROZOV','Sergeant! Don\'t leave me out here — wait!',3.4]:['CAPTAIN MOROZOV','Wait up, Sergeant… I can\'t keep that pace on this leg.',3.6];ch3Say([L]);}
  if(typeof CRAB!=='undefined')mzCrab(dt);
  if(CH3.alert&&!CH3.clear)mzFight(dt);}
/* the creature: he stops, kneels and puts bursts into it */
/* he turns on whichever of them is nearest - the one that has hold of you first */
function mzCrab(dt){let C_=null,d=1e9;for(const c of CRAWS){if(!crawLive(c))continue;const dd=Math.hypot(c.p.x-MZ.p.x,c.p.z-MZ.p.z)-(c.state==='grab'?20:0);if(dd<d){d=dd;C_=c;}}
  const live=!!C_;if(C_)d=Math.hypot(C_.p.x-MZ.p.x,C_.p.z-MZ.p.z);
  if(!live||d>30){if(MZ.crab){MZ.crab=false;MZ.face=undefined;MZ.aimP=undefined;if(MZ.state==='crab')MZ.state='follow';}return;}
  MZ.crab=true;if(MZ.state==='follow'||MZ.state==='stand')MZ.state='crab';MZ.face=Math.atan2(C_.p.x-MZ.p.x,C_.p.z-MZ.p.z);MZ.aimP=Math.atan2(C_.y+.1*C_.s-(H(MZ.p.x,MZ.p.z)+1.1),Math.max(d,1));
  MZ.fireCd-=dt;if(MZ.fireCd>0)return;if(!(MZ.burst>0))MZ.burst=2+Math.floor(WR()*3);MZ.burst--;MZ.fireCd=MZ.burst>0?.11:wr(.7,1.3);
  const gun=CH2.capAn.gun;const mp=npcMuzzle(gun);npcFlash(mp,true);sfx.shotFar(mp.distanceTo(camera.position),true,mp);
  const tgt=V3(C_.p.x+wr(-.4,.4)*C_.s/2,C_.y+.07*C_.s,C_.p.z+wr(-.4,.4)*C_.s/2);if(C_.hitM&&WR()<.16)C_.onShot(C_.hitM[WR()<.08?0:1],tgt,tgt.clone().sub(mp).normalize());
  else{const q=tgt.clone().add(V3(wr(-1,1),0,wr(-1,1)));q.y=W3.wl;if(inDET(q.x,q.z)&&H(q.x,q.z)<W3.wl)WATER.splash(q,.4);else fxImpact(q.setY(H(q.x,q.z)),V3(0,1,0),'dirt');}}
/* cover geometry: the spot behind a box on the far side from p; is a spot clear of the solids; is a straight run clear */
function coverBehind(c,p,gap=.55){const ux0=c.x-p.x,uz0=c.z-p.z,l=Math.hypot(ux0,uz0)||1,ux=ux0/l,uz=uz0/l;const lx=ux*c.c-uz*c.s,lz=ux*c.s+uz*c.c;
  const e=1/Math.max(Math.abs(lx)/c.hx,Math.abs(lz)/c.hz,1e-6);return V3(c.x+ux*(e+gap),0,c.z+uz*(e+gap));}
function freeAt(q,r,skip){for(const s of solids){if(s===skip)continue;if(s.r!==undefined){if(Math.hypot(q.x-s.cx,q.z-s.cz)<s.r+r){freeAt.last=s;return false;}}else if(q.x>s.x1-r&&q.x<s.x2+r&&q.z>s.z1-r&&q.z<s.z2+r){freeAt.last=s;return false;}}return true;}
function pathFree(a,b,r,skip){const n=Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/.4);for(let i=1;i<=n;i++){const t=i/n;if(!freeAt(V3(a.x+(b.x-a.x)*t,0,a.z+(b.z-a.z)*t),r,skip))return false;}
  return !coverHit(V3(a.x,floorAt(a.x,a.z)+.45,a.z),V3(b.x,floorAt(b.x,b.z)+.45,b.z));}
const inShack=q=>q.x>-881.6&&q.x<-876.4&&q.z>-337.8&&q.z<-330.2;
/* a separatist's next cover: hidden from you when he ducks, with a view of you when he comes up, a clear run to it; on a
   flank, well round from where he is now */
/* a way through the clutter: a small grid over the ground between the two points (half-metre cells, the solids near them
   only), searched A*-fashion, then pulled tight so he walks straight legs between the corners. Null if there is no way. */
function gridPath(a,b,r,skip){const cs=.5,x0=Math.min(a.x,b.x)-5,z0=Math.min(a.z,b.z)-5,nx=Math.ceil((Math.max(a.x,b.x)+5-x0)/cs),nz=Math.ceil((Math.max(a.z,b.z)+5-z0)/cs);if(nx*nz>12000)return null;
  const loc=solids.filter(s=>s!==skip&&(s.r!==undefined?(s.cx>x0-1&&s.cx<x0+nx*cs+1&&s.cz>z0-1&&s.cz<z0+nz*cs+1):!(s.x2<x0-1||s.x1>x0+nx*cs+1||s.z2<z0-1||s.z1>z0+nz*cs+1)));
  const free=(x,z)=>{for(const s of loc){if(s.r!==undefined){if(Math.hypot(x-s.cx,z-s.cz)<s.r+r)return false;}else if(x>s.x1-r&&x<s.x2+r&&z>s.z1-r&&z<s.z2+r)return false;}return !(inDET(x,z)&&H(x,z)<W3.wl-.5);};
  const blk=new Uint8Array(nx*nz);for(let j=0;j<nz;j++)for(let i=0;i<nx;i++)blk[j*nx+i]=free(x0+(i+.5)*cs,z0+(j+.5)*cs)?0:1;
  const cell=p=>[clamp(Math.floor((p.x-x0)/cs),0,nx-1),clamp(Math.floor((p.z-z0)/cs),0,nz-1)];const [ai,aj]=cell(a),[bi,bj]=cell(b);blk[aj*nx+ai]=0;blk[bj*nx+bi]=0;
  const g=new Float32Array(nx*nz).fill(1e9),from=new Int32Array(nx*nz).fill(-1),done=new Uint8Array(nx*nz);const open=[[0,aj*nx+ai]];g[aj*nx+ai]=0;const goal=bj*nx+bi;
  const hh=k=>Math.hypot(k%nx-bi,(k/nx|0)-bj);let found=false,it=0;
  while(open.length&&it++<20000){let m=0;for(let t=1;t<open.length;t++)if(open[t][0]<open[m][0])m=t;const [,k]=open[m];open[m]=open[open.length-1];open.pop();if(done[k])continue;done[k]=1;if(k===goal){found=true;break;}
    const ci=k%nx,cj=k/nx|0;for(let dj=-1;dj<=1;dj++)for(let di=-1;di<=1;di++){if(!di&&!dj)continue;const ni=ci+di,nj=cj+dj;if(ni<0||nj<0||ni>=nx||nj>=nz)continue;const nk=nj*nx+ni;if(blk[nk]||done[nk])continue;
      if(di&&dj&&(blk[cj*nx+ni]||blk[nj*nx+ci]))continue;const ng=g[k]+(di&&dj?1.414:1);if(ng<g[nk]){g[nk]=ng;from[nk]=k;open.push([ng+hh(nk),nk]);}}}
  if(!found)return null;const pts=[];for(let k=from[goal];k>=0&&k!==aj*nx+ai;k=from[k])pts.unshift(V3(x0+(k%nx+.5)*cs,0,z0+((k/nx|0)+.5)*cs));
  /* pull it tight */
  const clear=(p,q)=>{const n=Math.ceil(Math.hypot(q.x-p.x,q.z-p.z)/.25);for(let i=1;i<n;i++){const t=i/n;if(!free(p.x+(q.x-p.x)*t,p.z+(q.z-p.z)*t))return false;}return true;};
  const out=[];let cur=a;const all=pts.concat([b]),L=all.length-1;let i=-1;while(i<L){let j=L;while(j>i+1&&!clear(cur,all[j]))j--;if(j===L)break;out.push(all[j]);cur=all[j];i=j;}
  return out.length?out:null;}
function sepCover(me,pp,flank,back){const pC=V3(pp.x,camera.position.y-.45,pp.z),cur=me.pos;let best=null,bs=1e9;const myA=Math.atan2(cur.x-pp.x,cur.z-pp.z),dCur=Math.hypot(cur.x-pp.x,cur.z-pp.z);
  const no=k=>{const d=window.__scd;if(d)d[k]=(d[k]||0)+1;};
  for(const c of WEST.cover){if(c.y1-c.y0<.75||c.y0>H(c.x,c.z)+.35){no('low');continue;}if(Math.hypot(c.x-cur.x,c.z-cur.z)>(flank?22:back?22:20)){no('far');continue;}
    /* the places behind it: straight behind, and along its back to either side; a little further back if that is clear */
    let q=null;{const q0=coverBehind(c,pp),ux=q0.x-c.x,uz=q0.z-c.z,ul=Math.hypot(ux,uz)||1,px=-uz/ul,pz=ux/ul,hl=Math.max(c.hx,c.hz)*.6;
      for(const [o,g] of [[0,0],[hl*.5,0],[-hl*.5,0],[hl,0],[-hl,0],[0,.3],[hl*.5,.3],[-hl*.5,.3],[hl,.3],[-hl,.3],[0,.6],[hl*.5,.6],[-hl*.5,.6]]){const t=V3(q0.x+px*o+ux/ul*g,0,q0.z+pz*o+uz/ul*g);
        if(inShack(t)||(inDET(t.x,t.z)&&H(t.x,t.z)<W3.wl+.1)||!freeAt(t,.35,me.solid))continue;const fy_=floorAt(t.x,t.z);if(!coverHit(pC,V3(t.x,fy_+.95,t.z)))continue;q=t;break;}}
    if(!q){no('blocked');if(window.__scdL)window.__scdL.push([c.x.toFixed(1),c.z.toFixed(1),c.hx,c.hz,c.ry.toFixed(2),c.tag||'',JSON.stringify(freeAt.last)]);continue;}
    const dq=Math.hypot(q.x-pp.x,q.z-pp.z),run=Math.hypot(q.x-cur.x,q.z-cur.z);if(dq<6||dq>50||run<1){no('dist');continue;}
    if(CH3.seps.some(o=>o!==me&&!sepOut(o)&&Math.hypot(o.spot.x-q.x,o.spot.z-q.z)<1.8)||Math.hypot(MZ.p.x-q.x,MZ.p.z-q.z)<2){no('taken');continue;}
    /* the way there: straight if it is clear, otherwise round whatever is in the way by one turning point - a step back off his
       own cover first, or out to one side of the line */
    const fy=floorAt(q.x,q.z);let via=null;
    if(!pathFree(cur,q,.22,me.solid)){via=gridPath(cur,q,.22,me.solid);if(!via){no('path');continue;}}
    q.via=via;
    let runV=run;if(via){runV=0;let p0=cur;for(const w of via.concat([q])){runV+=Math.hypot(w.x-p0.x,w.z-p0.z);p0=w;}if(runV>run*2.2+3){no('detour');continue;}}let sc=runV+(losClear(V3(q.x,fy+1.45,q.z),pC)?0:6);
    /* falling back: further from you than he is now, the further the better; and not straight back past you */
    if(back){if(dq<dCur-.5){no('closer');continue;}sc=runV*.5-(dq-dCur)*.9;}
    /* (not the cover he is leaving) */if(me.spot&&Math.hypot(q.x-me.spot.x,q.z-me.spot.z)<2.5){no('same');continue;}
    if(flank){let da=Math.atan2(q.x-pp.x,q.z-pp.z)-myA;da=Math.abs(Math.atan2(Math.sin(da),Math.cos(da)));if(da<.6){no('angle');continue;}sc-=da*5;}
    if(sc<bs){bs=sc;best=q;}}
  return best;}
/* in the fight: to the nearest cover close to you, kneel, come up and fire short bursts at whoever shows */
function mzFight(dt){const pp=player.pos;
  /* cover near you, on the far side of something solid from them: the shore cover, or behind any cover box */
  const pick=()=>{const live=CH3.seps.filter(x=>!sepOut(x));if(!live.length)return null;const ex=live.reduce((a,x)=>a.add(x.pos),V3()).multiplyScalar(1/live.length);
    const cand=['c1','c2','c3','c4'].map(k=>WEST.spots[k]).filter(Boolean).map(c=>c.clone());
    for(const c of WEST.cover){if(Math.hypot(c.x-pp.x,c.z-pp.z)>16||Math.hypot(c.x-ex.x,c.z-ex.z)<9||c.y1-c.y0<.6||c.y0>H(c.x,c.z)+.35)continue;cand.push(coverBehind(c,ex));}
    let best=null,bd=1e9;cand.forEach(c=>{const d=Math.hypot(c.x-pp.x,c.z-pp.z),dm=Math.hypot(c.x-MZ.p.x,c.z-MZ.p.z);if(d<1.4||d>17||dm>34)return;if(inDET(c.x,c.z)&&W3.wl-H(c.x,c.z)>.6)return;if(inShack(c)||!freeAt(c,.34,MZ.solid))return;if(live.some(x=>Math.hypot(x.pos.x-c.x,x.pos.z-c.z)<2.5))return;const sc=d+dm*.25;if(sc<bd){bd=sc;best=c;}});return best;};
  if(MZ.state==='follow'){const b=pick();if(b){MZ.cover=b;MZ.state='toCover';}else{MZ.state='cover';MZ.cover=MZ.p.clone();}}
  /* you moved on: he moves up to new cover near you */
  if(MZ.state==='cover'&&Math.hypot(MZ.p.x-pp.x,MZ.p.z-pp.z)>14){const b=pick();if(b&&b.distanceTo(MZ.p)>2){MZ.cover=b;MZ.state='toCover';MZ.peek=false;return;}if(Math.hypot(MZ.p.x-pp.x,MZ.p.z-pp.z)>22){MZ.state='follow';MZ.peek=false;return;}}
  if(MZ.state!=='cover')return;
  const live=CH3.seps.filter(s=>!sepOut(s));if(!live.length)return;
  let tg=null,td=1e9;const eye=V3(MZ.p.x,H(MZ.p.x,MZ.p.z)+(MZ.peek?1.1:1.0),MZ.p.z);live.forEach(s=>{const hp=s.headPos();const d=eye.distanceTo(hp);if(d<td&&d<70){td=d;tg=s;}});
  if(!tg)return;MZ.face=Math.atan2(tg.pos.x-MZ.p.x,tg.pos.z-MZ.p.z);MZ.aimP=Math.atan2(tg.headPos().y-.3-eye.y,td);
  MZ.pt=(MZ.pt||0)-dt;if(MZ.pt<=0){MZ.peek=!MZ.peek;MZ.pt=MZ.peek?wr(1.8,3.2):wr(1.6,3);MZ.burst=0;}
  if(!MZ.peek)return;MZ.fireCd-=dt;if(MZ.fireCd>0)return;
  if(!(MZ.burst>0)){MZ.burst=1+Math.floor(WR()*3);}
  MZ.burst--;MZ.fireCd=MZ.burst>0?.11:wr(.9,1.8);const gun=CH2.capAn.gun;const mp=npcMuzzle(gun);npcFlash(mp,true);sfx.shotFar(mp.distanceTo(camera.position),true,mp);
  const vis=losClear(eye,tg.headPos())||losClear(eye,tg.chestPos());const exposed=tg.peek||tg.state!=='combat';
  if(vis)tg.supT=S.t;
  if(vis&&(exposed?WR()<.34:WR()<.08)){const hd=WR()<.3;const hp=hd?tg.headPos():tg.chestPos();tg.onShot({userData:{part:hd?'head':'torso',bone:'spine'}},hp,hp.clone().sub(mp).normalize(),'mz');}
  else{const p=tg.chestPos().add(V3(wr(-.8,.8),wr(-.4,.6),wr(-.8,.8)));const c=coverHit(mp,p);if(c){fxImpact(p,V3(0,1,0),'wood');}}}

/* ======================= the separatists ======================= */
/* what they shout to each other */
/* (out of the fight: dead, or down and bleeding) */
function sepOut(s){return s.state==='dead'||s.state==='down';}
function sepCall(me,k){const live=CH3.seps.filter(o=>!sepOut(o)&&o!==me);if(S.t<(CH3.callT||0)||CH3.q.length>1||(k!=='nade'&&!live.length&&k!=='reload'&&k!=='hit'&&k!=='fall'))return;CH3.callT=S.t+5;
  const L={reload:['Перезаряжаю! Прикрой!','Пустой! Прикрой меня!'],flank:['Обхожу справа!','Захожу сбоку, держи его!'],nade:['Граната!','Ложись — граната!'],down:['Витьку убили!','Минус один! Он справа!'],hit:['Я ранен!','Зацепило! Нога!','Попал, сука… держусь!'],cover:['Прикрываю!','Давай, я прикрою!','Работаю — двигай!'],move:['Меняю позицию!','Перебегаю!','Прикрой, перебегаю!'],fall:['Отходим к сараю!','Назад! Назад!']}[k];
  ch3Say([['SEPARATIST',L[Math.floor(WR()*L.length)],1.6]]);}
/* RGD-5 grenades: thrown in an arc at where you went to ground, they bounce and roll, and go off three to four seconds
   after the spoon flies. Each man has one */
const NADES=[];const _nadeM=std({color:C(0x4a5034),roughness:.6,metalness:.2});const _nadeG=(()=>{const g=new T.SphereGeometry(.032,10,8);g.scale(1,1.25,1);return g;})();
function sepNade(me,dP){if(me.nade===0||dP<8||dP>26||S.t-(CH3.nadeT||-99)<18)return;const unseen=S.t-(CH3.seenT||S.t);if(unseen<6)return;
  const pp=player.pos;const eye=me.headPos();const hide=V3(pp.x+wr(-1.6,1.6),0,pp.z+wr(-1.6,1.6));hide.y=floorAt(hide.x,hide.z);
  /* a lob: the flight time for the range, the launch velocity that lands it there */
  const dx=hide.x-eye.x,dz=hide.z-eye.z,dh=Math.hypot(dx,dz),tf=.55+dh*.045,vy=(hide.y-eye.y+4.9*tf*tf)/tf;
  const m=new T.Mesh(_nadeG,_nadeM);m.castShadow=true;m.position.copy(eye).add(V3(0,.3,0));scene.add(m);
  NADES.push({m,v:V3(dx/tf,vy,dz/tf),fuse:wr(3.2,4),warned:false,rest:false});me.nade=0;CH3.nadeT=S.t;sepCall(me,'nade');sfx.click&&sfx.click();}
function nadeTick(dt){for(let i=NADES.length-1;i>=0;i--){const n=NADES[i],m=n.m;n.fuse-=dt;
    if(!n.rest){n.v.y-=9.8*dt;m.position.addScaledVector(n.v,dt);m.rotation.x+=dt*9;m.rotation.z+=dt*6;const fy=floorAt(m.position.x,m.position.z)+.032;
      const wet=inDET(m.position.x,m.position.z)&&W3.wl>fy;if(wet&&m.position.y<W3.wl){if(!n.splashed){n.splashed=true;WATER.splash(V3(m.position.x,W3.wl,m.position.z),.5);}n.v.multiplyScalar(Math.exp(-dt*6));if(m.position.y<fy){m.position.y=fy;n.rest=true;}}
      else if(m.position.y<fy){m.position.y=fy;if(Math.abs(n.v.y)>1.2){n.v.y*=-.3;n.v.x*=.5;n.v.z*=.5;sfx.tin&&sfx.stepAt&&sfx.stepAt(m.position.clone(),'gravel',1);}else{n.v.set(0,0,0);n.rest=true;}}}
    if(!n.warned&&n.rest&&m.position.distanceTo(player.pos.clone().setY(m.position.y))<10){n.warned=true;if(CH3.q.length<2)ch3Say([['CAPTAIN MOROZOV','Grenade! Move!',1.4]]);}
    if(n.fuse<=0){nadeBoom(m.position.clone());scene.remove(m);NADES.splice(i,1);}}}
function nadeBoom(p){explode(p,{killer:'separatists'});}
/* the ringing and the blur wear off */
function nadeConc(dt){const k=CH3.concK||0;if(k<=0)return;CH3.concK=Math.max(0,k-dt/9);if(CH2.rec<0){CH2.post.blur=Math.max(0,CH2.post.blur-dt*.05);CH2.post.dbl=Math.max(0,CH2.post.dbl-dt*.05);}
  sfx.tin&&sfx.tin(.12*CH3.concK,.5);sfx.muffle&&sfx.muffle(lerp(20000,900,Math.pow(CH3.concK,.7)),.4);}
/* four men of an irregular unit: three in GP-5 masks, Soviet khaki or a quilted telogreika, the fourth in a knitted
   balaclava; Afghan-war chest rigs, SSh-68 helmets, wooden-stocked AK-74s. None of them is anyone you have seen dead. */
const SEPDEF=[{char:'patrol',hood:true,kit:true,helm:true,spot:'e1',idle:{p:null,pose:'ready',yaw:Math.PI/2+.25},peek:'kneelAim',duck:'cover',name:'the guard'},
  {char:'driver',hood:true,kit:true,helm:false,spot:'e2',idle:{p:[-866.7,-334.2],pose:'relaxed',yaw:Math.PI*.95},peek:'aim',duck:'cover'},
  {char:'oldman',hood:true,kit:false,helm:true,spot:'e3',idle:{p:[-871.4,-330.6],pose:'lowready',yaw:Math.PI/2-.4},peek:'aim',duck:'cover'},
  {char:'guard3',hood:false,kit:true,helm:true,spot:'e4',idle:{p:[-870.6,-339.6],pose:'fireSquat',yaw:-.9},peek:'aim',duck:'cover'}];
class Sep{constructor(d,i){this.d=d;this.i=i;
    const c=CD.chars[d.char];const h=buildHuman({char:d.char,outfit:c.outfit,vest:false,helmet:false,hood:d.hood,uniqMat:true,matMap:{emr:'khaki',velcro:'khakiW'},drop:['pad','padhard','strap'],tint:[.96-i*.004,.94+i*.002,.93]});
    h.hooded=!!(d.hood&&c.hood);this.h=h;this.hits=addHits(h,this);holeMats(h);if(d.kit)sepKit(h);else sepBag(h);if(d.helm)ssh68(h);
    this.g=new T.Group();this.g.userData.keep=true;this.g.add(h.root);scene.add(this.g);
    const sp=WEST.spots[d.spot];this.spot=V3(sp.x,0,sp.z);const ip=d.idle.p?V3(d.idle.p[0],0,d.idle.p[1]):this.spot.clone();this.pos=ip;this.yaw=d.idle.yaw;
    this.an=animate(h,{pose:d.idle.pose,gun:npcAK({wood:true}),hands:an=>this.post(an)});this.an.go(d.idle.pose,.01);
    this.hp=100;this.state='idle';this.aw=0;this.chk=wr(0,.25);this.peek=false;this.pt=wr(.8,2);this.burst=0;this.fireCd=wr(.6,1.4);this.acq=0;this.G={a:0,run:0,t:0,var:1,calm:false};this.ph=0;this.v=0;this.flinch=0;this.supT=-9;this.W={leg:0,arm:0,torso:0};this.stayT=0;this.supUntil=0;
    this.solid={cx:ip.x,cz:ip.z,r:.32};solids.push(this.solid);this.place();}
  place(){this.g.position.set(this.pos.x,floorAt(this.pos.x,this.pos.z),this.pos.z);this.g.rotation.y=this.yaw;this.solid.cx=this.pos.x;this.solid.cz=this.pos.z;}
  headPos(){return this.h.P.bones.head.getWorldPosition(new T.Vector3()).add(V3(0,.06,0));}
  chestPos(){return this.h.P.bones.spine.getWorldPosition(new T.Vector3()).add(V3(0,.25,0));}
  post(an){if(this.state==='dead'||this.state==='down')return;const B=an.B;let ch=false;if(this.aimP!==undefined&&this.peek){B.spine.rotation.x-=this.aimP*.85;ch=true;}
    if(this.flinch>0){B.spine.rotation.x-=this.flinch*.35;B.spine.rotation.z+=this.flinch*.2*this.fs;B.head.rotation.x-=this.flinch*.3;ch=true;}
    if(ch&&an.gun){an.h.root.updateMatrixWorld(true);an.reach('L',GRIP.trig);an.reach('R',GRIP.supp);}}
  alert(){if(this.state==='idle'){this.state='move';this.an.paused=true;this.G.a=0;
    /* (the way to his post goes round things - under the camo net only through its doorway) */if(this.d.spot!=='e1'&&!pathFree(this.pos,this.spot,.22,this.solid)){const v=gridPath(this.pos,this.spot,.22,this.solid);if(v)this.spot.via=v;}}}
  tick(dt){if(this.state==='dead')return;if(this.state==='down'){this.downTick(dt);return;}if(this.state==='wfight'){this.wfTick(dt);return;}const pp=player.pos,eye=this.headPos();const dP=Math.hypot(pp.x-this.pos.x,pp.z-this.pos.z);this.flinch=Math.max(0,this.flinch-dt*3);
    const pHead=camera.position.clone(),pChest=camera.position.clone().add(V3(0,-.45,0));
    if(this.state==='idle'){/* the guard looks out over the water; the others mind their own business */
      if(this.d.spot==='e1'){this.yaw=damp(this.yaw,Math.PI/2+.25+Math.sin(S.t*.13)*.6,.6,dt);}
      this.chk-=dt;if(this.chk<=0){this.chk=.25;if(dP<75&&S.t-(CH3.spawnT||0)>6){const see=losClear(eye,pChest)||losClear(eye,pHead);let a=Math.atan2(pp.x-this.pos.x,pp.z-this.pos.z)-this.yaw;a=Math.abs(Math.atan2(Math.sin(a),Math.cos(a)));
          const cone=this.d.spot==='e1'?1.5:2.2;if(see&&a<cone){const mv=Math.hypot(player.vel.x,player.vel.z);let r=clamp((70-dP)/45,0,1.6)*(mv>2?1.7:mv>.5?1:.55)*(player.crouch>.5?.45:1)/(WEATHER.fogX||1);
            if(dP<14)r=4;this.aw+=.25*r;if(this.aw>1)ch3Alert(this);}}}
      this.place();return;}
    if(this.state==='move'){const vw=this.spot.via;let tgt=this.spot;if(vw&&vw.length){tgt=vw[0];if(Math.hypot(tgt.x-this.pos.x,tgt.z-this.pos.z)<.6){vw.shift();tgt=vw.length?vw[0]:this.spot;}}
      const tx=tgt.x-this.pos.x,tz=tgt.z-this.pos.z,d=tgt===this.spot?Math.hypot(tx,tz):Math.hypot(tx,tz)+5;
      if(d<.3||this.d.spot==='e1'){if(CH3.flanker===this)CH3.flanker=null;this.state='combat';this.stayT=0;this.an.paused=false;this.an.go(this.d.duck,.4);this.peek=false;this.pt=wr(.6,1.5);this.v=0;}
      else{let dy=Math.atan2(tx,tz)-this.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));this.yaw+=dy*clamp(dt*5,0,1);this.v=damp(this.v,Math.min(4.2*(1-.62*Math.min(1,this.W.leg)),d*2+1),5,dt);
        const st=Math.min(d,this.v*dt);this.pos.x+=Math.sin(this.yaw)*st;this.pos.z+=Math.cos(this.yaw)*st;this.ph+=this.v*dt/1.0*Math.PI;
        gaitPose(this.h.P.bones,this.G,dt,this.v,this.ph,this.v>2.6&&this.W.leg<.3,0);this.an.holdGun(AP.lowready.hold,this.ph);}
      this.place();return;}
    /* combat: duck behind the cover, come up to fire a few bursts, duck again; close in, he stops ducking */
    const tgt=pChest;const close=dP<9;
    /* is his cover still between you? if you have worked round it, he runs for cover that is. If nobody has seen you
       for a while, one of them goes round to a flank to dig you out */
    if(this.d.spot!=='e1'){this.cvT=(this.cvT||0)-dt;if(this.cvT<=0){this.cvT=.5;const me=V3(this.pos.x,floorAt(this.pos.x,this.pos.z)+.95,this.pos.z);
      this.exp=(coverHit(pChest,me)||!terrainClear(pChest,me))?0:(this.exp||0)+.5;const live=CH3.seps.filter(o=>!sepOut(o)).length;let q=null,fl=false;
      if(this.exp>=1.5&&dP>5)q=sepCover(this,pp,false);
      else if(!CH3.flanker&&live>=2&&S.t-(CH3.seenT||S.t)>9&&S.t-(CH3.flankT||-99)>20&&dP>8){q=sepCover(this,pp,true);fl=!!q;}
      if(q){this.spot=q;this.state='move';this.an.paused=true;this.G.a=0;this.peek=false;this.exp=0;if(fl){CH3.flanker=this;CH3.flankT=S.t;sepCall(this,'flank');}this.place();return;}}}
    /* bounding: nobody stays in one place for long. After a while he picks the next piece of cover and runs for it while
       the nearest of the others puts rounds on you - never two of them moving at once */
    this.stayT+=dt;if(!this.stayMax)this.stayMax=wr(12,22);
    if(this.d.spot!=='e1'&&!close&&this.stayT>this.stayMax&&S.t-(CH3.moveT||-99)>5&&!this.peek){this.stayMax=wr(12,22);this.stayT=0;
      const mates=CH3.seps.filter(o=>o!==this&&o.state==='combat');
      if(mates.length){const q=sepCover(this,pp,false,this.hp<50||this.W.leg>.4);if(q){CH3.moveT=S.t;CH3.moves=(CH3.moves||0)+1;const m=mates.sort((a,b)=>a.pos.distanceTo(this.pos)-b.pos.distanceTo(this.pos))[0];m.supUntil=S.t+4.5;
        sepCall(this,'move');this.spot=q;this.state='move';this.an.paused=true;this.G.a=0;this.peek=false;this.place();return;}}}
    /* you have gone to ground behind something for a while: he throws a grenade at it */
    if(this.nadeTry&&this.peek&&this.an.blend>=.8){this.nadeTry=false;sepNade(this,dP);}
    let ty=Math.atan2(pp.x-this.pos.x,pp.z-this.pos.z);let dy=ty-this.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));this.yaw+=dy*clamp(dt*4,0,1);
    this.aimP=Math.atan2(tgt.y-eye.y,Math.max(dP,1));
    this.pt-=dt;if(this.pt<=0){this.peek=close?true:!this.peek;this.pt=this.peek?wr(2,3.6):wr(1.4,2.8);
      /* pinned: he stays down longer - and does not come up where you last saw him if he can help it */
      if(S.t-this.supT<1.5){if(this.peek){this.peek=false;this.pt=wr(1.2,2.2);}
        else if(this.d.spot!=='e1'&&!close&&WR()<.7&&S.t-(this.movT||-99)>6){const q=sepCover(this,pp,false,this.hp<50);if(q){this.movT=S.t;CH3.moves=(CH3.moves||0)+1;this.spot=q;this.state='move';this.an.paused=true;this.G.a=0;this.peek=false;this.place();return;}}}
      /* covering a comrade who is moving: up and firing for as long as it takes */
      if(this.supUntil>S.t&&S.t-this.supT>=1.5){this.peek=true;this.pt=wr(2.6,3.6);}
      /* hurt in the body he does not stay up as long */
      if(this.peek)this.pt*=1-.35*Math.min(1,this.W.torso);
      /* he comes up kneeling one time, standing the next - only kneeling on a wounded leg */
      this.an.go(this.peek?(this.W.leg>.4?'kneelAim':WR()<.4?(this.d.peek==='aim'?'kneelAim':'aim'):this.d.peek):this.d.duck,.35);this.burst=0;this.fireCd=wr(.35,.8);this.acq=Math.min(this.acq,this.peek?.6:0);
      if(this.peek)this.nadeTry=true;}
    if(this.peek&&this.an.blend>=.8){this.losT=(this.losT||0)-dt;if(this.losT<=0){this.losT=.15+WR()*.05;this.vH=losClear(eye,pHead);this.vC=losClear(eye,pChest);}const vH=this.vH,vC=this.vC;const vis=vH||vC;if(vis)CH3.seenT=S.t;this.acq=vis?this.acq+dt:Math.max(0,this.acq-dt*2);
      this.fireCd-=dt;if(this.fireCd<=0){if(this.burst<=0){this.burst=2+Math.floor(WR()*3);this.shotN=0;}else this.shotN++;this.burst--;this.fireCd=this.burst>0?.105:wr(.55,1.2)*(1+Math.min(1,this.W.arm));
        this.rounds=(this.rounds||0)+1;if(this.rounds>=30&&this.burst<=0){/* empty: down behind cover to change magazines */this.rounds=0;this.peek=false;this.pt=wr(2.6,3.4);this.an.go(this.d.duck,.3);sepCall(this,'reload');}
        const mp=npcMuzzle(this.an.gun);npcFlash(mp,true);sfx.shotFar(mp.distanceTo(camera.position),true,mp);
        /* shooting at what he saw last, or at the captain if you are hidden */
        /* he walks his fire onto you: the first rounds after he sees you go wide, then closer the longer he has you in his
           sights; range, your moving across them, crouching, being shot at himself and the climb of a long burst open it up
           again. And nobody lands a hit for a moment after one has - four men do not all hit you in the same instant */
        if(vis){const zero=sstep(.2,1.7,this.acq);const rx=pp.x-this.pos.x,rz=pp.z-this.pos.z,rl=Math.hypot(rx,rz)||1;const lat=Math.abs(player.vel.x*rz/rl-player.vel.z*rx/rl);
          let p=(.12+.2*zero)*(1-.55*Math.min(1,this.W.arm))*clamp(1.1-dP/80,.2,1)*(player.crouch>.5?.7:1)/(1+lat*.3)*(this.shotN>1?.75:1)*(S.t-this.supT<1.5?.5:1)*(vC?1:.45)/Math.sqrt(WEATHER.fogX||1);
          if(S.t-(CH3.hitT||-9)<.5)p=0;const hit=WR()<p;if(hit)CH3.hitT=S.t;shotAtPlayer(mp,hit,wr(14,22),zero);}
        else if(CH3.mz&&WR()<.6){const m=V3(MZ.p.x,H(MZ.p.x,MZ.p.z)+1,MZ.p.z);const q=m.clone().add(V3(wr(-1.2,1.2),wr(-.6,.5),wr(-1.2,1.2)));q.y=Math.max(q.y,floorAt(q.x,q.z));
          if(inDET(q.x,q.z)&&q.y<W3.wl){q.y=W3.wl;WATER.splash(q,.4);}else fxImpact(q,V3(0,1,0),coverHit(mp,q)?'wood':'dirt');}
        else{/* suppressing fire at where you were */const q=pChest.clone().add(V3(wr(-2,2),wr(-1,.2),wr(-2,2)));const c=coverHit(mp,q);if(c||WR()<.5){fxImpact(q,V3(0,1,0),c?'wood':'dirt');}if(dP<30&&WR()<.3)sfx.whiz();}}}
    this.place();}
  onShot(hitObj,p,dir,who){if(this.state==='dead')return;const part=hitObj.userData.part,bone=hitObj.userData.bone;const ak=who==='mz'?true:VM.id==='ak';
    const dmg=part==='head'||part==='neck'?300:part==='torso'?(ak?58:36):(ak?30:20);this.hp-=dmg;if(hitObj.isMesh)addHole(this.h,hitObj,p);bloodSpurt(p,dir,part==='head'?1.5:1);
    if(dP3(p)<30)sfx.hitFlesh(.7);
    /* down already: another hit finishes him */if(this.state==='down'||this.state==='wfight'){this.die(p,dir);return;}
    this.flinch=1;this.fs=WR()<.5?-1:1;ch3Alert(this);if(this.state==='idle')this.alert();this.supT=S.t;
    if(this.hp<=0){this.die(p,dir);return;}
    /* badly hit in the legs or the body and he may go down instead of fighting on */if(this.canDown(part,bone)){this.down(p,dir);return;}
    this.wounded([bone||(part==='torso'?'spine':'')]);}
  /* (when a man goes down: hurt badly enough - under 45 of his 100 - by a hit that is not to the head, more likely in the
     legs; not off the shack roof platform; not twice) */
  canDown(part,bone){if(this.hp>45||this.wasDown||floorAt(this.pos.x,this.pos.z)>H(this.pos.x,this.pos.z)+.5)return false;
    if(part==='head'||part==='neck')return false;const leg=/^(hp|kn|an)/.test(bone||'');return WR()<(leg?.8:part==='torso'?.55:.3);}
  /* down: the legs go, he drops the rifle and falls; no more fighting, moving to cover or throwing - he lies there,
     moving a little, bleeding, until someone helps him or it is over */
  /* hit hard but not out: he goes down sitting where he fell, still holding his rifle - breathing hard, in pain, and when
     he can see you he still shoots, short wild bursts, slow to come onto you. In time he passes out (the old 'down');
     another hit finishes him */
  down(p,dir,silent){if(this.state==='dead'||this.state==='down')return;
    if(!silent&&this.state!=='wfight'&&!this.wfDone&&this.an.gun&&WR()<.8){this.state='wfight';this.wasDown=true;this.peek=false;this.v=0;if(CH3.flanker===this)CH3.flanker=null;sepCall(this,'hit');
      if(!AP.woundFire)AP.woundFire=Object.assign({},AP.woundedSit,{hold:AP.kneel.hold,osc:Object.assign({},AP.woundedSit.osc,{spine:[.035,0,.015,.55],neck:[.05,0,.02,.55]})});
      this.an.paused=false;this.an.go('woundFire',.7);this.peek=true;this.bleed=wr(70,120);this.fireCd=wr(1.8,3.2);this.burst=0;this.acq=0;return;}
    this.state='down';this.wasDown=true;this.peek=false;this.v=0;if(CH3.flanker===this)CH3.flanker=null;
    if(!silent)sepCall(this,'hit');this.an.paused=true;const i=solids.indexOf(this.solid);if(i>=0)solids.splice(i,1);
    if(this.an.gun){const gun=this.an.gun;this.an.gun=null;dropGun(gun,(dir||V3(0,0,1)).clone().multiplyScalar(.8).add(V3(0,.8,0)));}
    this.rag=new Ragdoll(this.h,p||this.chestPos(),dir||V3(0,0,1),{vel:V3(Math.sin(this.yaw)*this.v,0,Math.cos(this.yaw)*this.v),k:silent?.05:.55});
    this.bleed=wr(110,170);this.twT=wr(1.5,3);
    const k=this;interact.push({obj:this.h.P.bones.spine,off:V3(),r:1.9,label:'Drag the wounded man',show:()=>k.state==='down'&&!ACT.kind&&!ACT.smk,fn(){ACT.startDrag(k);}});
    /* (out of the fight counts for the objective) */if(!this.counted){this.counted=true;CH3.kills++;ch3Kill(this);}}
  wfTick(dt){const pp=player.pos,eye=this.headPos(),dP=Math.hypot(pp.x-this.pos.x,pp.z-this.pos.z);
    this.bleed-=dt;if(this.bleed<=0){this.wfDone=true;this.down(this.chestPos(),V3(0,-1,0),true);return;}
    let dy=Math.atan2(pp.x-this.pos.x,pp.z-this.pos.z)-this.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));this.yaw+=dy*clamp(dt*1.1,0,1);
    const pC=camera.position.clone().add(V3(0,-.45,0));this.aimP=Math.atan2(pC.y-eye.y,Math.max(dP,1));
    this.losT=(this.losT||0)-dt;if(this.losT<=0){this.losT=.25;this.vC=losClear(eye,pC)||losClear(eye,camera.position);}
    this.acq=this.vC?this.acq+dt:Math.max(0,this.acq-dt);if(this.vC)CH3.seenT=S.t;
    this.fireCd-=dt;if(this.fireCd<=0&&this.vC&&this.acq>.9&&Math.abs(dy)<.45&&this.an.gun){if(this.burst<=0)this.burst=1+Math.floor(WR()*3);this.burst--;this.fireCd=this.burst>0?.17:wr(1.8,3.6);
      const mp=npcMuzzle(this.an.gun);npcFlash(mp,true);sfx.shotFar(mp.distanceTo(camera.position),true,mp);
      const zero=sstep(.9,3.5,this.acq);let pr=(.04+.07*zero)*clamp(1.1-dP/60,.2,1)*(player.crouch>.5?.7:1);if(S.t-(CH3.hitT||-9)<.6)pr=0;const hit=WR()<pr;if(hit)CH3.hitT=S.t;shotAtPlayer(mp,hit,wr(10,18),zero*.4);}
    if(S.t-(this.hitCallT||-99)>10&&WR()<dt*.12){this.hitCallT=S.t;sepCall(this,'hit');}
    this.place();}
  downTick(dt){this.bleed-=dt*(ACT.drag&&ACT.drag.sep===this?1.4:1);const r=this.rag;if(!r)return;
    /* a hand moves, a knee comes up, he rolls his head: a nudge to the ragdoll now and then */
    this.twT-=dt;if(this.twT<=0&&!(ACT.drag&&ACT.drag.sep===this)){this.twT=wr(2,4.5);const i=[7,11,14,18,3][Math.floor(WR()*5)];const q=r.q[i];q.x+=wr(-.012,.012);q.z+=wr(-.012,.012);q.y-=wr(.004,.012);r.done=false;r.t=Math.min(r.t,6.2);}
    if(this.bleed<=0)this.die(this.chestPos(),V3(0,-1,0),{quiet:1});}
  /* where he is hit tells: a leg and he cannot run or stand to shoot, an arm and his fire is wild and slow, the body and
     he does not stay up long. He shouts that he is hit; the nearest of the others covers him; badly hurt he pulls back to
     cover further from you */
  wounded(bones){for(const b of bones){if(/^(hp|kn|an)/.test(b))this.W.leg+=.6;else if(/^(sh|el|wr)/.test(b))this.W.arm+=.6;else if(b==='spine'||b==='hips')this.W.torso+=.5;}
    if(S.t-(this.hitCallT||-99)>8&&WR()<.7){this.hitCallT=S.t;sepCall(this,'hit');}
    const mates=CH3.seps.filter(o=>o!==this&&o.state==='combat');if(mates.length){const m=mates.sort((a,b)=>a.pos.distanceTo(this.pos)-b.pos.distanceTo(this.pos))[0];m.supUntil=S.t+4;if(WR()<.5)setTimeout(()=>sepCall(m,'cover'),1700);}
    if(this.state==='combat'&&this.d.spot!=='e1'&&(this.W.leg>.4||this.hp<50)&&S.t-(this.movT||-99)>5&&WR()<.65){const pp=player.pos;const q=sepCover(this,pp,false,true);
      if(q){this.movT=S.t;CH3.moves=(CH3.moves||0)+1;this.spot=q;this.state='move';this.an.paused=true;this.G.a=0;this.peek=false;this.place();}}}
  /* a grenade: the blast and whatever fragments found him */
  blastHit(p,tot,parts,dir){if(this.state==='dead')return;this.hp-=tot;const ch=this.chestPos();bloodSpurt(ch,dir,1.2);if(this.state==='down'||this.state==='wfight'){this.die(ch,dir.clone().multiplyScalar(1.8),{blast:p});return;}this.flinch=1;this.fs=WR()<.5?-1:1;ch3Alert(this);if(this.state==='idle')this.alert();this.supT=S.t;
    if(this.hp<=0||this.state==='down'){this.die(ch,dir.clone().multiplyScalar(1.8),{blast:p});return;}if(this.hp<=45&&!this.wasDown&&WR()<.6){this.down(ch,dir);return;}this.wounded(parts);}
  die(p,dir,o={}){if(this.state==='dead')return;const wasDown=this.state==='down';this.state='dead';if(ACT.drag&&ACT.drag.sep===this)ACT.dropDrag();if(CH3.flanker===this)CH3.flanker=null;if(!o.quiet)sepCall(this,'down');this.an.paused=true;dropHits(this.hits);const i=solids.indexOf(this.solid);if(i>=0)solids.splice(i,1);
    if(this.an.gun){const gun=this.an.gun;this.an.gun=null;dropGun(gun,dir.clone().multiplyScalar(1.2).add(V3(0,1,0)));}
    /* (already lying there: the same body settles; otherwise he falls now) */
    let rg;if(wasDown&&this.rag){rg=this.rag;rg.pin=null;rg.done=false;rg.t=0;rg.still=0;if(o.blast){rg.q.forEach((q,k)=>q.addScaledVector(dir,-.02));}}
    else rg=new Ragdoll(this.h,p,dir,{vel:V3(Math.sin(this.yaw)*this.v,0,Math.cos(this.yaw)*this.v),k:o.blast?2.2:1});this.rag=rg;
    if(o.blast)severNear(this.h,o.blast,dir);
    rg.onRest=()=>{const P=rg.p;const cx=(P[0].x+P[1].x)/2,cz=(P[0].z+P[1].z)/2;const e=.5,gx=floorAt(cx+e,cz)-floorAt(cx-e,cz),gz=floorAt(cx,cz+e)-floorAt(cx,cz-e),gl=Math.hypot(gx,gz);
      stain('pool',cx,cz,1.3,1.5,gl>1e-3?V3(-gx/gl,0,-gz/gl):V3(P[2].x-P[0].x,0,P[2].z-P[0].z).normalize(),{spread:1,tg:.12,rate:18,life:120});
      const k=this;interact.push({obj:this.h.P.bones.spine,off:V3(),r:2,label:'Search the body',once:true,fn(){S.ammo['5.45x39']+=wr(18,40)|0;toast('+ 5.45×39 rounds');sfx.pick();k.searched=true;}});};
    if(!this.counted){this.counted=true;CH3.kills++;ch3Kill(this);}}}
function dP3(p){return p.distanceTo(camera.position);}
function ch3Spawn(){if(CH3.seps.length)return;CH3.spawnT=S.t;FLOORS.length=0;const y0=WEST.yardY;FLOORS.push({x0:-878.75,x1:-876.85,z0:-333.7,z1:-330.73,y:y0+1.0});
  SEPDEF.forEach((d,i)=>CH3.seps.push(new Sep(d,i)));}
function ch3Alert(by){if(CH3.alert)return;CH3.alert=true;CH3.seps.forEach(s=>s.alert());CH3.alertT=S.t;
  ch3Say([['SEPARATIST','Стой! Кто там?.. Огонь!',2],['CAPTAIN MOROZOV','Contact, far shore! Get down — get behind something!',3.4]]);
  setObj(`Take cover. Eliminate the separatists at the lumber yard (${CH3.kills}/4).`);MZ.state=MZ.state==='stand'?'follow':MZ.state;}
function ch3Kill(s){if(CH3.restoring){if(CH3.kills>=4){CH3.clear=true;CH3.stage=Math.max(CH3.stage,7);}return;}setObj(`Take cover. Eliminate the separatists at the lumber yard (${CH3.kills}/4).`);
  const L=['He\'s down.','Got him!','One less.','That\'s three. One more.'];if(CH3.kills<4&&WR()<.8)ch3Say([['CAPTAIN MOROZOV',L[Math.min(3,CH3.kills-1)],1.8]]);
  if(CH3.kills>=4){CH3.clear=true;CH3.stage=7;MZ.state='follow';MZ.face=undefined;MZ.aimP=undefined;
    ch3Say([['CAPTAIN MOROZOV','…Clear. That\'s all of them.',2.6],['CAPTAIN MOROZOV','Search them, and the shack — ammunition, anything we can use. Gas masks… whoever they are, they know what this ground is.',6]],()=>{setObj('Search the lumber yard outpost.');CH3.cp='d';saveGame(false);});}}

/* ======================= the walk west, scripted ======================= */
function ch3Comms(){if(CH3.stage>=0)return;CH3.stage=0;S.chapter=3;CH2.done2=1;mzInit();MZ.state='stand';MZ.talk=true;
  ch3Say([['CAPTAIN MOROZOV','Kurgan, Kurgan, this is One-Two-One. Ambushed on the highway, kilometre thirty-one. Vehicle lost. Two alive. Over.',6.2],
    ['RADIO · KURGAN','One-Two-One, Kurgan… [static] …do not go back to the road, it is watched. Third Battalion holds the tree line west of the old Lesnoye field. Go to them through the forest. Over.',7.4],
    ['CAPTAIN MOROZOV','West through the forest, to Third Battalion. Understood. Out.',3.6],{fn:()=>{MZ.talk=false;}},
    ['CAPTAIN MOROZOV','You heard him. Off the road, into the trees on the right. I\'ll keep up — don\'t wait for me.',5]],()=>{
    setObj('Get off the road. Head west through the forest to 3rd Battalion with Captain Morozov.');MZ.state='follow';CH3.stage=1;CH3.cp='a';saveGame(false);});}
function ch3Script(dt){const px=player.pos.x,pz=player.pos.z;const F=CH3.flags;
  if(CH3.stage===1&&px<-385&&!F.clear){F.clear=1;ch3Say([['CAPTAIN MOROZOV','A hunters\' clearing… the collective\'s old field is past these trees. Keep along the windbreaks — in the open we stand out.',6.5]],()=>setObj('Cross the old collective field. Keep to the tree lines.'));CH3.stage=2;}
  if(CH3.stage===2&&px<-610&&!F.road){F.road=1;ch3Say([['CAPTAIN MOROZOV','The district road. Look both ways before you step out — and then go quickly.',4.5]],()=>setObj('Cross the road and keep heading west.'));}
  if(CH3.stage===2&&px<-662&&!F.fog){F.fog=1;CH3.stage=3;WEATHER.script={rain:.5,fog:1.45,mist:.6};
    ch3Say([['CAPTAIN MOROZOV','Here comes the fog… and the rain with it. Good. They won\'t see us either.',4.5]]);}
  if(CH3.stage===3&&px<-694&&!F.sign){F.sign=1;CH3.stage=4;
    ch3Say([['CAPTAIN MOROZOV','A radiation sign — this low ground took the fallout, and the flood keeps it here. Don\'t drink, don\'t kneel in it.',6.2],
      ['CAPTAIN MOROZOV','There\'s an old dyke under the water, see where the reeds part? Walk the high ground across.',5]],()=>{setObj('Cross the flooded basin along the old dyke. Elevated radiation.');CH3.cp='b';saveGame(false);});}
  if(CH3.stage===4&&typeof CRAB!=='undefined'&&CRAB.dead&&!F.crabDone){F.crabDone=1;
    ch3Say([['CAPTAIN MOROZOV','…What in God\'s name was that.',2.8],['CAPTAIN MOROZOV','The Zone breeds things in this water. Keep your rifle up. Move.',4],['CAPTAIN MOROZOV','And keep to the dyke. Where it is deep, there will be more of them.',4.2]],()=>setObj('Cross the flooded basin along the old dyke.'));}
  if(CH3.stage===4&&px<-814&&!F.spot){F.spot=1;CH3.stage=5;ch3Spawn();
    ch3Say([['CAPTAIN MOROZOV','Stop. Down. Smoke on the far shore — the old lumber yard.',3.6],['CAPTAIN MOROZOV','Sandbags. And a man on the roof of that shack… gas mask. Not ours. Stay low, use what cover there is.',5.5]],()=>{if(!CH3.alert)setObj('Approach the lumber yard. Stay low.');});}
  /* the separatists come into being a little before you can see the yard, so they are there when the fog thins */
  if(CH3.stage>=4&&px<-790&&!CH3.seps.length)ch3Spawn();
  if(CH3.stage===7&&!F.end){const tk=S.taken||[];const kob=tk.some(k=>k.startsWith('kobra@'));const searched=CH3.seps.filter(s=>s.searched).length;
    if(kob&&searched>=2||(CH3.endT=(CH3.endT||0)+dt)>150){F.end=1;
      ch3Say([['CAPTAIN MOROZOV','A Kobra sight… they were better supplied than they looked.',3.6],['CAPTAIN MOROZOV','There is a path out the back of the shack. It goes west, to the old road - the battalion is somewhere past it. We keep moving.',7]],()=>{
        setObj('Take the footpath behind the shack west to the road.');CH3.stage=8;CH3.cp='e';saveGame(false);});}}
  /* the road west: out of the trees onto the asphalt, the guns audible; then far enough along it for now */
  if(CH3.stage===8&&px<-948&&wxRoad(px,pz).d<7){CH3.stage=9;CH3.cp='f';
    ch3Say([['CAPTAIN MOROZOV','Listen. Artillery, south-west - theirs or ours, I can\'t tell from here.',4.6],['CAPTAIN MOROZOV','Keep to the verge, not the asphalt. And watch the sky.',3.8]],()=>{setObj('Follow the road south-west, toward the fighting.');saveGame(false);});}
  if(CH3.stage===9&&px<WX.end+18){CH3.stage=10;CH3.cp='g';ch3Say([['CAPTAIN MOROZOV','…That smoke is the line. Get your breath back.',3.6]],()=>{setObj('The road goes on toward the fighting. (To be continued.)');saveGame(false);setTimeout(()=>toast('End of this section — to be continued.',6),2000);});}}
/* the player fired: anyone within earshot comes running */
function onPlayerShot(){CH3.shotT=S.t;if(!CH3.seps.length||CH3.alert)return;const d=Math.hypot(player.pos.x+874,player.pos.z+336);if(d<95)ch3Alert(CH3.seps[0]);}
function ch3Tick(dt,rdt){ch3Queue(dt);bloodTick(dt);ragTick(dt);droppedTick(dt);WATER.tick(dt);westTick(dt);
  if(S.chapter!==3||S.state!=='play'&&S.state!=='view')return;
  if(CH3.mz&&MZ.state!=='stand')mzTick(dt);else if(CH3.mz){mzTick(dt);}
  CH3.seps.forEach(s=>s.tick(dt));nadeTick(dt);nadeConc(dt);
  /* halfway over the basin there is no going back: everything east of the old field is let go (the frame rate gets it
     back), and the way back stops at the near shore */
  {const F=CH3.flags;if(!F.noBack&&CH3.stage>=4&&player.pos.x<-790)F.noBack=1;
   if(F.noBack){S.xMax=S.xMax&&S.xMax<-716?S.xMax:-716;if(!CH3.dropped){CH3.dropped=dropRegion((x,z)=>x>-560,[]);}
     if(player.pos.x>-716.5&&S.t>(CH3.backT||0)&&S.state==='play'){CH3.backT=S.t+14;if(CH3.q.length<2)ch3Say([['CAPTAIN MOROZOV','Not back that way. Whatever is behind us stays behind us. The yard, Sergeant.',3.6]]);}}
   /* (the raid: once you are at the yard the east shore of the basin is let go too - out of sight in the fog, and the way
      back now stops in the middle of the water; out on the road west, the basin and the yard go as well, behind the tree line) */
   if(F.noBack&&CH3.stage>=5&&player.pos.x<-830&&!CH3.dropped2){S.xMax=Math.min(S.xMax,-780);CH3.dropped2=dropRegion((x,z)=>x>-690,[]);}
   if(CH3.stage>=9&&player.pos.x<-1010&&!CH3.dropped3){S.xMax=Math.min(S.xMax,-990);CH3.dropped3=dropRegion((x,z)=>x>-912&&x<-560,[]);}
   if(S.xMax===-990&&player.pos.x>-991&&S.t>(CH3.backT||0)&&S.state==='play'){CH3.backT=S.t+14;if(CH3.q.length<2)ch3Say([['CAPTAIN MOROZOV','There is nothing back there for us now. The road.',3]]);}}if(typeof CRAB!=='undefined')crabTick(dt);ch3Script(dt);}
/* ambient: bob the floating things, smoke from the fire, reeds and mist by distance */
function westTick(dt){const cp=camera.position;WEST.t+=dt;if(cp.x>-560)return;
  for(const b of WEST.bob){const dx=b.x-cp.x,dz=b.z-cp.z;if(dx*dx+dz*dz>150*150)continue;const t=WEST.t+b.ph;b.m.position.y=W3.wl+b.y0+Math.sin(t*1.1)*b.amp+Math.sin(t*2.3)*b.amp*.4;
    b.m.rotation.x=(b.m.userData.rx0===undefined?(b.m.userData.rx0=b.m.rotation.x):b.m.userData.rx0)+Math.sin(t*.9)*b.tilt;b.m.rotation.y=b.ry+Math.sin(t*.07)*.3;}
  for(const r of WEST.reeds){const dx=r.x-cp.x,dz=r.z-cp.z;r.m.visible=dx*dx+dz*dz<130*130;}
  /* the stove inside: embers that breathe a little, light only for the floor in front of it, and from the pipe the
     thinnest thread of smoke - they keep it low so nothing shows from the air */
  if(WEST.stoveL){const near=cp.distanceToSquared(WEST.stove)<40*40;const fl=.75+.15*Math.sin(S.t*2.3)+.1*Math.sin(S.t*5.1+1)+(WR()-.5)*.06;WEST.stoveL.intensity=near?.55*fl:0;WEST.stoveGlow.emissiveIntensity=.45*fl;}
  if(WEST.fire&&cp.distanceToSquared(WEST.fire)<70*70&&WR()<dt*.7)FX.smoke.spawn(WEST.fire.clone().add(V3(wr(-.03,.03),.05,wr(-.03,.03))),V3(wr(-.05,.05)+.1,wr(.25,.4),wr(-.05,.05)),wr(2.5,4),wr(.12,.18),wr(.6,1.1),[.36,.36,.35,.1],[.5,.5,.49,0],{drag:.3,spin:wr(-.4,.4)});
  if(typeof mistTick==='function')mistTick(dt);}
/* save / load */
function ch3SaveData(){return{stage:CH3.stage,cp:CH3.cp,mz:[MZ.p.x,MZ.p.z,MZ.yaw],crab:typeof CRAB!=='undefined'&&CRAB.dead?1:0,dead:CH3.seps.map(s=>s.state==='dead'?1:s.state==='down'?2:0),alert:CH3.alert?1:0,flags:CH3.flags,fog:WEATHER.script?1:0};}
function ch3Restore(d){const c=d.ch3;if(!c)return;const i=interact.findIndex(e=>e.label==='Talk to Captain Morozov');if(i>=0)interact.splice(i,1);CH2.checked.Morozov=1;CH2.done2=1;
  S.chapter=3;CH3.stage=c.stage;CH3.cp=c.cp;Object.assign(CH3.flags,c.flags||{});mzInit();MZ.state='follow';
  /* the captain stands a little behind you on your trail */
  const px=player.pos.x,pz=player.pos.z,yw=player.yaw;MZ.p.set(px+Math.sin(yw)*2.2,0,pz+Math.cos(yw)*2.2);if(inDET(MZ.p.x,MZ.p.z)&&W3.wl-H(MZ.p.x,MZ.p.z)>.8)MZ.p.set(px+.8,0,pz+.8);
  CH3.crumbs=[MZ.p.clone(),V3(px,0,pz)];MZ.k=0;CH3.lastCrumb=CH3.crumbs[1];
  if(c.fog)WEATHER.script={rain:.5,fog:1.45,mist:.6};
  if(c.crab&&typeof CRAB!=='undefined')crabKill(true);
  if(c.stage>=5||c.dead&&c.dead.some(x=>x)){ch3Spawn();CH3.restoring=true;CH3.seps.forEach((s,k)=>{if(c.dead&&c.dead[k]===2&&s.state!=='dead'){/* (he was down when you saved: he is down where he went down) */s.hp=30;s.down(null,null,true);return;}if(c.dead&&c.dead[k]&&s.state!=='dead'){s.hp=0;s.die(s.chestPos(),V3(-1,0,0));s.rag=RAGS[RAGS.length-1];for(let j=0;j<600&&!s.rag.done;j++)s.rag.update(1/30);}});
    /* (the count is what the save says, not what this session had already counted) */if(c.dead)CH3.kills=c.dead.reduce((a,x)=>a+(x?1:0),0);
    CH3.restoring=false;if(c.alert&&CH3.kills<4){CH3.alert=false;ch3Alert(CH3.seps.find(s=>!sepOut(s)));}}
  if(c.stage>=7){CH3.clear=true;}}
/* what the separatists left: loaded magazines and a cartridge pack on their table, the Kobra on the crate in the shack */
{const t=WEST.table,c=WEST.spots.lootCrate;[[-.3,.12,.4],[.05,.18,-.3]].forEach(([dx,dz,r])=>LOOT.push({id:'mag545',x:t.x+dx,y:t.y,z:t.z+dz,rot:[Math.PI/2,r,0]}));LOOT.push({id:'ammo545',x:t.x+.3,y:t.y,z:t.z-.12});
 LOOT.push({id:'kobra',x:c.x,y:c.y,z:c.z,rot:[0,.6,0]},{id:'mag545',x:c.x+.22,y:c.y,z:c.z+.1,rot:[Math.PI/2,1.3,0]},{id:'bandage',x:-880.8,y:WEST.yardY+1.57,z:-334.6});
 LOOT.slice(-6).forEach(placeItem);}
/* (test hook: run the game logic without rendering) */
function __sim(n,dt){for(let i=0;i<n;i++){S.t+=dt;WU.time.value=S.t;ch3Tick(dt,dt);const tgt={x:camera.position.x,y:camera.position.y,z:camera.position.z};for(const a of ANIMS){if(a.paused)continue;a.update(dt,tgt);}fxUpdate(dt);}}
/* ======================= objective marker ======================= */
/* where the current objective is: read off the objective itself, so every chapter's steps get a place without the
   scripts having to set one. Nothing is marked for a fight or a mystery - only places to go and things to do. */
const ROUTE3=[[-340,-392],[-392,-392],[-470,-385],[-560,-380],[-620,-374],[-650,-372],[-668,-368],[-690,-356],[-704,-352]].concat(W3.path).concat([[W3.yard.x+6,W3.yard.z]]);
const _om={el:null,t:null,k:0,a:0};
function objTarget(){const t=$('objt').textContent,pp=player.pos;const at=(x,z,dy=1.2)=>V3(x,H(x,z)+dy,z);
  const near=re=>{let b=null,bd=1e9;const w=V3();for(const i of interact){if(typeof i.label!=='string'||!re.test(i.label)||!i.obj)continue;i.obj.localToWorld(w.copy(i.off||V3()));const d=w.distanceTo(camera.position);if(d<bd){bd=d;b=w.clone();}}return b;};
  if(/orders board/.test(t))return near(/orders/i);
  if(/footpath behind the shack/.test(t)){/* the next bend of the path ahead of you, then the road */const P=WX.trail;for(let i=0;i<P.length;i++)if(P[i][0]<pp.x-3)return at(P[i][0],P[i][1],1.4);return at(-953,-322.5,1.6);}
  if(/Follow the road south-west/.test(t)){const q=wxRoad(pp.x,pp.z);const P=WX.P;const i=Math.min(P.length-1,Math.round(q.s/2)+40);return at(P[i].x,P[i].z,1.6);}
  if(/Board BTR|Return to BTR|ride out again/.test(t))return btr.visible?btr.position.clone().add(V3(0,2.4,0)):null;
  if(/Report Volkov/.test(t))return cmdr&&cmdr.root?cmdr.root.getWorldPosition(V3()).add(V3(0,2.1,0)):null;
  if(/Search the old house/.test(t))return S.door?S.door.g.getWorldPosition(V3()).add(V3(.5,1.6,0)):null;
  if(/Check on the crew/.test(t))return near(/^Check /);
  if(/Kill the creature/.test(t))return CRAB.state!=='dead'&&CRAB.state!=='off'?V3(CRAB.p.x,CRAB.y+.8,CRAB.p.z):null;
  if(/Search the lumber yard/.test(t))return near(/Search the body|^Take /);
  if(/Approach the lumber yard/.test(t))return at(W3.yard.x+4,W3.yard.z,1.5);
  if(/Head west|collective field|keep heading west|flooded basin/.test(t)){for(const q of ROUTE3)if(q[0]<pp.x-7)return at(q[0],q[1]);return null;}
  return null;}
function objMarker(dt){const el=_om.el||(_om.el=$('omk'));if(!el)return;
  if((_om.k-=dt)<=0){_om.k=.25;_om.t=S.state==='play'&&!S.ads?objTarget():null;}
  const T_=_om.t;let show=!!T_;if(T_){const d=Math.hypot(T_.x-player.pos.x,T_.z-player.pos.z);if(d<3.5)show=false;
    const W=innerWidth,Hh=innerHeight,m=46;const v=T_.clone().project(camera);const fw=V3(0,0,-1).applyQuaternion(camera.quaternion),to=T_.clone().sub(camera.position);const behind=fw.dot(to)<0;
    let x=(v.x*.5+.5)*W,y=(-v.y*.5+.5)*Hh;if(behind){x=W-x;y=Hh-y;}
    const off=behind||x<m||x>W-m||y<m+30||y>Hh-m-40;
    if(off){/* to the edge, along the line from the centre */const cx=W/2,cy=Hh/2;let dx=x-cx,dy=y-cy;if(behind&&Math.abs(dy)<1e-3)dy=1;const sx=(W/2-m)/Math.max(Math.abs(dx),1e-3),sy=(Hh/2-m-40)/Math.max(Math.abs(dy),1e-3),k=Math.min(sx,sy);x=cx+dx*k;y=cy+dy*k;
      el.querySelector('em').style.transform='rotate('+Math.atan2(dx,-dy).toFixed(3)+'rad)';}
    el.classList.toggle('edge',off);el.style.transform='translate('+x.toFixed(1)+'px,'+y.toFixed(1)+'px)';
    el.querySelector('span').textContent=Math.round(d)+' m';}
  _om.a=damp(_om.a,show?1:0,6,dt);el.style.opacity=_om.a.toFixed(2);}
window.__c3={ch3Spawn,sepCover,H,solids,inDET,W3,CRAWS,crawReset,crawEmerge,crawTick,crawGrab,crawFlip,crawKill,objTarget,objMarker,BUS,CRATERS,__audio:{init:initAudio,tick:audioTick,sfx,AUD,ac:()=>AC,surface},FXn:()=>FX.blood.P.length+FX.bloodMist.P.length,__bloodP:()=>FX.blood.P.concat(FX.bloodMist.P),frontZ,__sim,ANIMS,mzInit,MIST,CRAB,crabInit,WEATHER,player,CH3,MZ,WEST,WATER,SEPDEF,Sep,ch3Spawn,ch3Comms,ch3Alert,Ragdoll,RAGS,HITS,STAINS,bloodSpurt,stain,losClear,coverHit,floorAt,limpPose,AP,buildHuman,animate,npcAK,sepKit,ssh68,addHits,holeMats};
