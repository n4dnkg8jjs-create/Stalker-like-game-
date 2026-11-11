/* ---------- procedural character animation: pose blending, breathing, weight shifts, head look,
   feet kept on the ground, two-bone arm IK onto a held rifle, STALKER-style idle / squat / kneel behaviours ---------- */
const AQ=new T.Quaternion(),AQ2=new T.Quaternion(),AE=new T.Euler(),AV=new T.Vector3(),AV2=new T.Vector3(),AV3=new T.Vector3(),AM=new T.Matrix4(),AM2=new T.Matrix4();
const ABONES=['hips','spine','neck','head','shL','elL','wrL','shR','elR','wrR','hpL','knL','anL','hpR','knR','anR'];
/* poses: bone -> euler [x,y,z]. Conventions: limb bones at 0 hang/continue straight down their parent; -x swings forward,
   knees bend with +x, elbows with -x; game side L is x<0 (the character's right). 'hold' = rifle placement in spine space. */
/* standing legs: the rig's rest pose is splayed and bow-legged, so a standing leg needs the hip rolled in (+.19 L) and
   the knee rolled back out (-.19 L) - that puts knee and ankle straight under the hip joint, feet about hip-width apart */
const AP={
  relaxed:{spine:[.02],neck:[.06],head:[-.04],shL:[.03,.12,-.07],elL:[-.28],wrL:[0,.1,0],shR:[.03,-.12,.07],elR:[-.28],wrR:[0,-.1,0],
    hpL:[-0.27,0,0.19],knL:[0.3,0,-0.19],anL:[0,-.12,0],hpR:[-0.27,0,-0.19],knR:[0.3,0,0.19],anR:[0,.12,0]},
  ready:{spine:[.05],neck:[.04],head:[-.03],hpL:[-0.31,0,0.19],knL:[0.36,0,-0.19],anL:[0,-.16,0],hpR:[-0.27,0,-0.19],knR:[0.3,0,0.19],anR:[0,.1,0],
    hold:{p:[-.04,-.09,.3],f:[.5,-.36,.79],u:[.08,.93,.36]}},
  squat:{hips:[.2],spine:[.42,0,0],neck:[-.18],head:[-.22],hpL:[-2.05,.18,-.32],knL:[2.45],hpR:[-2.0,-.18,.32],knR:[2.45],
    shL:[-.55,.2,-.12],elL:[-1.05],shR:[-.5,-.2,.12],elR:[-1.1],contactKnee:false,
    hold:{p:[-.02,-.17,.3],f:[.3,-.25,.92],u:[.05,.97,.25]}},
  kneel:{hips:[.06],spine:[.18],neck:[-.05],head:[-.08],hpL:[.08,.08,-.07],knL:[1.48],anL:[-.38],hpR:[-1.45,-.15,.12],knR:[1.5],
    footFree:{L:true},hold:{p:[-.03,-.12,.3],f:[.25,-.35,.9],u:[.1,.94,.3]}},
  /* seated on a crate: the rig's thigh slant means ~-1.73 brings the thighs level on the seat; knees ~1.8 drop the shins
     plumb so the boots stand flat on the ground (the right foot a little further out) */
  sitCrate:{hips:[.0],spine:[.22],neck:[-.06],head:[-.1],hpL:[-1.74,.2,-.12],knL:[1.8],hpR:[-1.7,-.2,.14],knR:[1.66],
    shL:[-.5,.25,-.1],elL:[-1.15],shR:[-.45,-.25,.1],elR:[-1.2],seat:.44},
  /* lower-back stretch: fists in the small of the back, hips pushed forward, leaning back and rolling the neck -
     keeps the arms below the shoulder so the jacket never has to stretch over a raised arm */
  stretch:{hips:[-.06],spine:[-.2,0,0],neck:[-.06],head:[-.04],shL:[.6,1.2,-.3],elL:[-1.7],wrL:[.15,.35,0],shR:[.6,-1.2,.3],elR:[-1.7],wrR:[.15,-.35,0],
    osc:{spine:[.05,.03,0,.9],neck:[.04,0,.08,.7],head:[0,.1,0,.7]},hpL:[-0.28,0,0.19],knL:[0.32,0,-0.19],anL:[0,-.12,0],hpR:[-0.28,0,-0.19],knR:[0.32,0,0.19],anR:[0,.12,0]},
  warm:{spine:[.2],neck:[-.06],head:[-.12],shL:[-1.0,.35,-.05],elL:[-1.1],wrL:[0,.4,0],shR:[-1.0,-.35,.05],elR:[-1.1],wrR:[0,-.4,0],
    hpL:[-0.3,0,0.19],knL:[0.36,0,-0.19],anL:[0,-.12,0],hpR:[-0.3,0,-0.19],knR:[0.36,0,0.19],anR:[0,.12,0],osc:{elL:[.12,0,0,6.5],elR:[-.12,0,0,6.5],wrL:[0,.18,0,6.5],wrR:[0,-.18,0,6.5]}},
  watch:{spine:[.06],neck:[.25],head:[.18,.1,0],shL:[.03,.12,-.07],elL:[-.28],shR:[-.35,-.6,.25],elR:[-1.9],wrR:[0,-.8,0],hpL:[-0.27,0,0.19],knL:[0.3,0,-0.19],anL:[0,-.12,0],hpR:[-0.27,0,-0.19],knR:[0.3,0,0.19],anR:[0,.12,0]},
  /* BTR driver: seated low, leaning slightly into the wheel, both hands up on the rim */
  drive:{hips:[.0],spine:[.12],neck:[.02],head:[-.06],hpL:[-1.62,.1,-.08],knL:[.5],anL:[.2],hpR:[-1.6,-.1,.08],knR:[.45],anR:[.2],footFree:{L:true,R:true},
    shL:[-.95,.3,-.18],elL:[-1.15],wrL:[0,.3,.2],shR:[-.95,-.3,.18],elR:[-1.15],wrR:[0,-.3,-.2],seat:.44},
  /* wounded, sitting on the ground: the hurt left leg (game R) out straight, the other knee up, propped on the right arm
     behind him, the left hand pressed on the thigh above the dressing, head heavy */
  woundedSit:{hips:[-.1],spine:[.2,0,-.04],neck:[.12],head:[.32,.12,.06],hpR:[-1.6,-.12,.04],knR:[.12],anR:[.55],hpL:[-2.25,.22,-.08],knL:[2.15],anL:[-.25],
    shR:[-.62,-.2,.32],elR:[-.75],wrR:[.2,-.2,0],shL:[.55,.45,-.5],elL:[-.08],wrL:[-1.1,0,.2],footFree:{L:true,R:true},seat:0,
    osc:{head:[.07,.05,0,.31],neck:[.04,0,.02,.31],spine:[.025,0,0,.42]}},
  /* in the ditch, the torn left thigh (game R) out straight, hunched over it, both hands pushing gauze into the wound in
     short hard shoves, head down */
  woundPress:{hips:[-.05],spine:[.5,-.12,.05],neck:[.25],head:[.42,.18,0],hpR:[-1.62,-.1,.04],knR:[.08],anR:[.5],hpL:[-2.1,.32,-.12],knL:[1.85],anL:[-.25],
    shR:[-1.05,-.15,.3],elR:[-1.0],wrR:[.5,0,0],shL:[-1.0,.6,-.15],elL:[-1.35],wrL:[.4,.3,0],footFree:{L:true,R:true},seat:0,
    osc:{shR:[.14,0,0,5.5],elR:[-.2,0,0,5.5],shL:[.1,0,0,5.5],elL:[-.12,0,0,5.5],spine:[.05,0,0,5.5],head:[.06,.04,0,.45]}},
  /* BTR commander up in his hatch: standing on the seat inside, chest out of the hatch, forearms resting on the coaming,
     looking ahead down the road */
  hatch:{spine:[.1],neck:[-.04],head:[.02],shL:[-.62,.42,-.38],elL:[-1.55],wrL:[.15,.4,.2],shR:[-.62,-.42,.38],elR:[-1.55],wrR:[.15,-.4,-.2],
    hpL:[-0.27,0,0.19],knL:[0.3,0,-0.19],anL:[0,-.12,0],hpR:[-0.27,0,-0.19],knR:[0.3,0,0.19],anR:[0,.12,0]},
  /* walking a patrol with the rifle at low ready: stock in the shoulder pocket, muzzle down and a little to the left */
  lowready:{spine:[.06],neck:[.03],head:[-.02],hpL:[-0.27,0,0.19],knL:[0.3,0,-0.19],anL:[0,-.12,0],hpR:[-0.27,0,-0.19],knR:[0.3,0,0.19],anR:[0,.12,0],
    hold:{p:[-.035,-.17,.27],f:[.32,-.62,.72],u:[.12,.77,.63]}},
  /* wounded but standing: the weight on the good (right, game L) leg, the bandaged left leg (game R) eased forward and bent,
     pelvis dropped on that side, torso leaning away from it, rifle at low ready; breathing hard */
  woundStand:{hips:[0,.08,-.05],spine:[.1,-.06,.09],neck:[.02,.04,-.05],head:[.06,.06,-.04],hpL:[-0.26,.02,0.24],knL:[0.26,0,-0.19],anL:[0,-.16,0],
    hpR:[-0.5,-.08,-0.13],knR:[0.52,0,0.19],anR:[-.12,.14,0],footFree:{R:false},
    hold:{p:[-.035,-.17,.27],f:[.32,-.62,.72],u:[.12,.77,.63]},osc:{spine:[.03,0,0,2.4],neck:[-.015,0,0,2.4],head:[.02,.03,0,.4]}},
  sitDeck:{spine:[.15],neck:[-.04],head:[.05],shL:[-.5,0,-.15],elL:[-.9],shR:[-.5,0,.15],elR:[-.9],hpL:[-1.45,0,-.12],knL:[1.5],anL:[-.2],hpR:[-1.4,0,.1],knR:[1.35],anR:[-.2],seat:-1,
    hold:{p:[.0,-.1,.32],f:[.15,-.3,.94],u:[0,.95,.3]}},
};
/* rifle grips (gun space, metres): trigger hand on the pistol grip, support hand under the handguard */
/* (the same grips as the first-person hands: the shooting hand wraps the pistol grip from the right with the trigger
   finger along the guard, the support hand cups the lower handguard from the left, thumb over the top) */
const GRIP={trig:{p:V3(.018,-.085,.012),f:V3(-.15,-.25,-.95),n:V3(-1,0,0),curl:[-1.35,-1.45,-1.1,-.4]},
  supp:{p:V3(-.024,-.03,-.29),f:V3(.75,.45,-.48),n:V3(.88,.45,0),curl:[-1.1,-1.2,-.9,-.3]}};
/* per-bone spring stiffness (rad/s^2 per rad): the torso leads, the head and the arms follow a moment later and
   settle with a little overshoot - this is most of what makes the motion read as weight rather than interpolation */
const ASPR={hips:110,spine:70,neck:46,head:38,shL:34,elL:28,wrL:22,shR:36,elR:30,wrR:24,hpL:140,knL:140,hpR:140,knR:140};
/* small idle fidgets layered on top of the pose: [bone, euler offset] lists, played with a bell envelope */
const AFID=[
  {d:1.6,k:{shL:[-.14,0,.05],shR:[-.14,0,-.05],spine:[-.03,0,0],neck:[.06,0,0]}},          /* shoulder roll */
  {d:1.8,k:{neck:[.02,0,.16],head:[0,.12,.1]}},                                           /* neck crack to one side */
  {d:2.2,k:{neck:[.22,0,0],head:[.16,0,0],spine:[.04,0,0]}},                              /* glance at the ground */
  {d:1.2,k:{wrL:[0,.4,.2],elL:[-.15,0,0]}},{d:1.2,k:{wrR:[0,-.4,-.2],elR:[-.15,0,0]}},     /* flex a hand */
  {d:2.6,k:{spine:[0,.12,0],neck:[0,.2,0],head:[0,.25,0]}}];                               /* look over the shoulder */
function basisQ(a1,a2,b1,b2,out){/* rotation taking (a1,a2) onto (b1,b2) */
  const A1=a1.clone().normalize(),A2=a2.clone().sub(A1.clone().multiplyScalar(a2.dot(A1))).normalize(),A3=new T.Vector3().crossVectors(A1,A2);
  const B1=b1.clone().normalize(),B2=b2.clone().sub(B1.clone().multiplyScalar(b2.dot(B1))).normalize(),B3=new T.Vector3().crossVectors(B1,B2);
  AM.makeBasis(A1,A2,A3);AM2.makeBasis(B1,B2,B3);AM2.multiply(AM.transpose());return out.setFromRotationMatrix(AM2);}
function worldQ(o,out){o.updateWorldMatrix(true,false);return o.getWorldQuaternion(out);}
function setWorldQ(bone,q){const pq=worldQ(bone.parent,new T.Quaternion());bone.quaternion.copy(pq.invert().multiply(q));bone.updateMatrixWorld(true);}
class Animator{
  constructor(h,o={}){this.h=h;this.B=h.P.bones;this.o=o;this.t=R()*10;this.ph=R()*6;
    this.cur=o.pose||'relaxed';this.prev=this.cur;this.blend=1;this.hold=null;
    this.hips0=this.B.hips.position.clone();
    this.look={yaw:0,pitch:0,ty:0,tp:0,next:1+R()*3};this.shift={side:R()<.5?-1:1,v:0,next:4+R()*5};
    this.fid={next:4+R()*8,t:-1,f:null,sg:1};this.brp=R()*6;this.sacc={x:0,y:0,tx:0,ty:0,next:.5};
    this.plan=o.plan||null;this.planT=this.plan?this.plan[0][1]:0;this.planI=0;
    /* arm chains + hand frames measured in the bind pose */
    h.root.updateMatrixWorld(true);this.arm={};
    for(const s of ['L','R']){const sh=this.B['sh'+s],el=this.B['el'+s],wr=this.B['wr'+s],m1=this.B['mid'+s+'1'];
      const ps=sh.getWorldPosition(new T.Vector3()),pe=el.getWorldPosition(new T.Vector3()),pw=wr.getWorldPosition(new T.Vector3()),pm=m1.getWorldPosition(new T.Vector3());
      const qw=worldQ(wr,new T.Quaternion()).invert(),qm=worldQ(m1,new T.Quaternion());
      const fing=pm.clone().sub(pw).normalize().applyQuaternion(qw),palm=new T.Vector3(0,0,1).applyQuaternion(qm).applyQuaternion(qw);
      this.arm[s]={sh,el,wr,L1:ps.distanceTo(pe),L2:pe.distanceTo(pw),fing,palm,out:s==='L'?-1:1};}
    this.ankH=this.B.anL.getWorldPosition(new T.Vector3()).y-h.root.getWorldPosition(new T.Vector3()).y;
    if(o.gun){this.gun=o.gun;this.B.spine.add(o.gun);poseHand(h.P.armL.hand,HANDS.trig.f,HANDS.trig.th,-1);poseHand(h.P.armR.hand,HANDS.guard.f,HANDS.guard.th,1);}
  }
  go(p,dur=.7){if(p===this.cur)return;this.prev=this.cur;this.cur=p;this.blend=0;this.bdur=dur;}
  /* evaluate the blended pose (eulers) */
  evalPose(){const a=AP[this.prev],b=AP[this.cur],w=this.blend<1?sstep(0,1,this.blend):1;const out={};
    for(const k of ABONES){const va=a[k]||[0,0,0],vb=b[k]||[0,0,0];out[k]=[lerp(va[0]||0,vb[0]||0,w),lerp(va[1]||0,vb[1]||0,w),lerp(va[2]||0,vb[2]||0,w)];}
    out._w=w;out._a=a;out._b=b;return out;}
  update(dt,target){dt=clamp(dt||0,0,.1);this.t+=dt;const B=this.B,t=this.t;
    if(this.blend<1)this.blend=Math.min(1,this.blend+dt/(this.bdur||.7));
    /* behaviour plan: list of [pose, seconds] repeated */
    if(this.plan){this.planT-=dt;if(this.planT<=0){this.planI=(this.planI+1)%this.plan.length;const st=this.plan[this.planI];this.planT=st[1]*(.8+R()*.4);this.go(st[0],st[2]||.8);}}
    const P=this.evalPose(),w=P._w,a=P._a,b=P._b;
    const standing=(k)=>!(b.seat!==undefined||b===AP.squat||b===AP.kneel);
    /* breathing */
    this.brp+=dt*(1.5+.25*Math.sin(t*.13+this.ph));const bx=this.brp;const br=Math.sin(bx)*.85+Math.sin(2*bx-.6)*.22;   /* quicker in, slower out */P.spine[0]+=br*.014;P.neck[0]-=br*.006;P.shL[2]-=br*.006;P.shR[2]+=br*.006;
    /* weight shift while standing: settle onto one leg, hip drops on the other side, torso counters */
    const sh=this.shift;sh.next-=dt;if(sh.next<0){sh.side=-sh.side;sh.next=5+R()*7;}
    const sw=(b.seat===undefined&&b!==AP.squat&&b!==AP.kneel)?w:(1-w)*((a.seat===undefined&&a!==AP.squat&&a!==AP.kneel)?1:0);
    sh.v=damp(sh.v,sh.side,1.2,dt);const s=sh.v*sw;
    P.hips[2]+=s*.03;P.spine[2]-=s*.035;P.neck[2]-=s*.01;
    const loaded=s<0?'L':'R',free=s<0?'R':'L',fa=Math.abs(s);
    P['hp'+loaded][2]-=s*.03;P['hp'+free][2]-=s*.03;P['kn'+free][0]+=fa*.13;P['hp'+free][0]-=fa*.05;P['kn'+loaded][0]-=fa*.02;
    /* idle sway */
    P.spine[1]+=Math.sin(t*.37+this.ph)*.02;P.hips[1]+=Math.sin(t*.29+this.ph*2)*.015;
    /* head look: glance around, track the player when close */
    const L=this.look;L.next-=dt;
    if(target){const wp=this.h.root.getWorldPosition(AV);const dx=target.x-wp.x,dz=target.z-wp.z,d=Math.hypot(dx,dz);
      const ry=this.h.root.getWorldQuaternion(AQ);AE.setFromQuaternion(ry,'YXZ');let ang=Math.atan2(dx,dz)-AE.y;ang=Math.atan2(Math.sin(ang),Math.cos(ang));
      if(d<6&&Math.abs(ang)<1.6){L.ty=clamp(ang,-1.1,1.1);L.tp=clamp(Math.atan2((target.y||1.6)-1.6,d),-.4,.4);L.next=.5;}}
    if(L.next<0){L.ty=(R()-.5)*1.4;L.tp=(R()-.5)*.35;L.next=2.5+R()*4;}
    L.yaw=damp(L.yaw,L.ty,2.2,dt);L.pitch=damp(L.pitch,L.tp,2.2,dt);
    P.neck[1]+=L.yaw*.4;P.head[1]+=L.yaw*.6;P.neck[0]-=L.pitch*.4;P.head[0]-=L.pitch*.6;
    /* living noise: incommensurate sines per bone so nothing is ever perfectly still or periodic */
    const nz=(f,p)=>Math.sin(t*f+p)+.6*Math.sin(t*f*2.31+p*1.7)+.3*Math.sin(t*f*4.17+p*2.9);const ph=this.ph;
    P.spine[0]+=nz(.41,ph)*.006;P.spine[2]+=nz(.33,ph+1)*.006;P.neck[0]+=nz(.53,ph+2)*.008;P.head[1]+=nz(.47,ph+3)*.012;P.head[2]+=nz(.38,ph+4)*.008;
    P.shL[0]+=nz(.36,ph+5)*.012;P.shR[0]+=nz(.39,ph+6)*.012;P.elL[0]+=nz(.44,ph+7)*.016;P.elR[0]+=nz(.42,ph+8)*.016;P.wrL[1]+=nz(.6,ph+9)*.03;P.wrR[1]+=nz(.57,ph+10)*.03;
    /* fidgets, only while standing */
    const F=this.fid;F.next-=dt;if(F.t<0&&F.next<0&&sw>.8){F.f=AFID[Math.floor(R()*AFID.length)];F.t=0;F.sg=R()<.5?-1:1;F.d=F.f.d*(.8+R()*.5);}
    if(F.t>=0){F.t+=dt;const u=F.t/F.d;if(u>=1){F.t=-1;F.next=5+R()*10;}else{const e=Math.pow(Math.sin(Math.PI*u),2)*sw;
      for(const k in F.f.k){const o=F.f.k[k];P[k][0]+=o[0]*e;P[k][1]+=o[1]*e*F.sg;P[k][2]+=o[2]*e*F.sg;}}}
    if(this.o.bump){const bp=this.o.bump(t);P.spine[0]+=bp[0];P.spine[2]+=bp[1];P.head[0]-=bp[0]*.6;}
    for(const [pp,ww] of [[a,1-w],[b,w]])if(pp.osc&&ww>0)for(const k in pp.osc){const o=pp.osc[k],sn=Math.sin(t*o[3]+this.ph);for(let c=0;c<3;c++)P[k][c]+=o[c]*sn*ww;}
    /* spring every bone towards its target; the feet are solved after so they stay flat on the ground */
    if(!this.sp){this.sp={};for(const k in ASPR)this.sp[k]={x:P[k].slice(),v:[0,0,0]};}
    {const n=Math.max(1,Math.ceil(dt/.017)),h=dt/n;for(const k in ASPR){const S_=this.sp[k],K=ASPR[k],Dm=2*.72*Math.sqrt(K);
      for(let c=0;c<3;c++){let x=S_.x[c],v=S_.v[c];const tg=P[k][c];for(let i=0;i<n;i++){v+=(K*(tg-x)-Dm*v)*h;x+=v*h;}S_.x[c]=x;S_.v[c]=v;P[k][c]=x;}}}
    for(const sd of ['L','R']){const ff=(b.footFree&&b.footFree[sd]&&w>.5)||(a.footFree&&a.footFree[sd]&&w<.5);
      if(!ff)P['an'+sd][0]=-(P.hips[0]+P['hp'+sd][0]+P['kn'+sd][0])*.95;}
    for(const k of ABONES)B[k].rotation.set(P[k][0],P[k][1],P[k][2]);
    /* face: blinks (fast close, slower open, sometimes doubled, often on a big glance), slow drifting expression,
       a brow-raise and faint smile when the player comes close and they make eye contact */
    {const SK=this.h.P.skinM;if(SK&&SK.morphTargetInfluences){const F=this.face||(this.face={bt:1+R()*3,bu:-1,ex:[0,0,0,0,0],tg:[0,.06,0,0,0],next:2+R()*4,eng:0,lastTy:0});
      F.bt-=dt;if(Math.abs(L.ty-F.lastTy)>.5&&R()<.65&&F.bu<0)F.bt=0;F.lastTy=L.ty;
      if(F.bt<=0&&F.bu<0){F.bu=0;F.bdur=.14+R()*.08;F.dbl=R()<.15;}
      let bw=0;if(F.bu>=0){F.bu+=dt/F.bdur;const u=F.bu;bw=u<.35?Math.sin(u/.35*Math.PI/2):Math.cos((u-.35)/.65*Math.PI/2);
        if(u>=1){F.bu=-1;bw=0;F.bt=F.dbl?.12:2+R()*4.5;F.dbl=false;}}
      F.next-=dt;if(F.next<0){F.next=3+R()*6;const r=R();F.tg=[0,.05+R()*.15,r<.3?R()*.22:0,r>.85?R()*.25:0,r>.6&&r<.75?R()*.3:0];}
      const near=target&&L.next===.5;F.eng=damp(F.eng,near?1:0,1.5,dt);
      const tg=[0,F.tg[1],Math.max(F.tg[2],F.eng*.3),Math.max(F.tg[3],F.eng*(.35+.25*Math.sin(t*.7))),F.tg[4]*(1-F.eng)];
      for(let i=1;i<5;i++)F.ex[i]=damp(F.ex[i],tg[i],2.2,dt);
      const inf=SK.morphTargetInfluences;inf[0]=clamp(bw,0,1);inf[1]=F.ex[1]*(1-bw);inf[2]=F.ex[2];inf[3]=F.ex[3]*(1-bw*.5);inf[4]=F.ex[4];
      const LM=this.h.P.lashM;if(LM&&LM.morphTargetInfluences&&LM.morphTargetInfluences.length){LM.morphTargetInfluences[0]=inf[0];LM.morphTargetInfluences[1]=inf[1];}}}
    /* eyes: lead the head towards where it is about to look, plus small saccades and drift */
    const EY=this.h.P.eyes;if(EY){const q=this.sacc;q.next-=dt;if(q.next<0){q.tx=(R()-.5)*.14;q.ty=(R()-.5)*.22;q.next=.4+R()*2.2;}
      q.x=damp(q.x,q.tx,28,dt);q.y=damp(q.y,q.ty,28,dt);const ly=clamp((L.ty-L.yaw)*.9,-.45,.45)+q.y,lp=clamp(-(L.tp-L.pitch)*.9,-.25,.25)+q.x;
      for(const e of EY)e.rotation.set(lp,ly,0);}
    /* hips height: seated poses use the seat, standing/crouching poses keep the lowest foot (or knee) on the ground */
    const seatA=a.seat,seatB=b.seat;B.hips.position.copy(this.hips0);
    const root=this.h.root;root.updateMatrixWorld(true);
    let drop=0;
    {let mn=1e9;for(const sd of ['L','R']){B['an'+sd].getWorldPosition(AV);root.worldToLocal(AV);mn=Math.min(mn,AV.y-this.ankH);
       B['kn'+sd].getWorldPosition(AV);root.worldToLocal(AV);mn=Math.min(mn,AV.y-.055);}drop=mn;}
    const seatDrop=sv=>sv===undefined?null:sv<0?0:(this.hips0.y-.085-sv);
    const dA=seatDrop(seatA)??drop,dB=seatDrop(seatB)??drop;B.hips.position.y=this.hips0.y-lerp(dA,dB,w);
    /* seated: the seat fixes the hips, so a shin that reaches lower than the floor would push the boot into the ground.
       Unbend the knee (the foot swings forward and up) until the ankle sits at standing height, then set the sole flat */
    if((seatA!==undefined&&seatA>=0&&w<.5)||(seatB!==undefined&&seatB>=0&&w>=.5)){const pz=w>=.5?b:a;
      for(const sd of ['L','R']){if(pz.footFree&&pz.footFree[sd])continue;const K=B['kn'+sd],A=B['an'+sd];
        for(let it=0;it<40;it++){A.rotation.x=-(B.hips.rotation.x+B['hp'+sd].rotation.x+K.rotation.x);root.updateMatrixWorld(true);
          A.getWorldPosition(AV);root.worldToLocal(AV);if(AV.y>=this.ankH+.004||K.rotation.x<.2)break;K.rotation.x-=.015;}}}
    /* rifle: blend its hold, then reach both hands onto it */
    if(this.gun){const ha=a.hold||AP.ready.hold,hb=b.hold||AP.ready.hold;const H={};for(const k of ['p','f','u'])H[k]=V3(...ha[k].map((x,i)=>lerp(x,hb[k][i],w)));
      H.p.y+=br*.004;this.gun.position.copy(H.p);basisQ(V3(0,0,-1),V3(0,1,0),H.f,H.u,this.gun.quaternion);
      root.updateMatrixWorld(true);this.reach('L',GRIP.trig);this.reach('R',GRIP.supp);}
    /* hands placed by the caller (pressing on a wound, holding onto something) */
    if(this.o.hands){root.updateMatrixWorld(true);this.o.hands(this,t);}
  }
  /* put the rifle at a given hold (spine space) and both hands on it - used while a walker's legs are driven by the gait */
  holdGun(hd,t){if(!this.gun)return;const H={};for(const k of ['p','f','u'])H[k]=V3(...hd[k]);H.p.y+=Math.sin((t||0)*1.7)*.003;
    this.gun.position.copy(H.p);basisQ(V3(0,0,-1),V3(0,1,0),H.f,H.u,this.gun.quaternion);this.h.root.updateMatrixWorld(true);this.reach('L',GRIP.trig);this.reach('R',GRIP.supp);}
  /* two-bone IK: shoulder -> elbow -> wrist onto a grip on the gun */
  reach(s,g){const gun=this.gun;
    const T0=gun.localToWorld(g.p.clone());const F=g.f.clone().transformDirection(gun.matrixWorld),N=g.n.clone().transformDirection(gun.matrixWorld);this.reachW(s,T0,F,N);}
  /* the same reach onto any palm placement in world space: palm centre T0, fingers along F, palm facing N */
  reachW(s,T0,F,N){const A=this.arm[s];
    /* the wrist joint sits behind the palm centre */
    const tw=T0.clone().addScaledVector(F,-.075).addScaledVector(N,-.022);
    const ps=A.sh.getWorldPosition(new T.Vector3());let d=tw.clone().sub(ps);const dist=clamp(d.length(),.05,A.L1+A.L2-.002);d.normalize();
    const ca=clamp((A.L1*A.L1+dist*dist-A.L2*A.L2)/(2*A.L1*dist),-1,1),sa=Math.sqrt(1-ca*ca);
    const spineQ=worldQ(this.B.spine,new T.Quaternion());
    const pole=V3(A.out*.55,-1,-.35).applyQuaternion(spineQ);pole.sub(d.clone().multiplyScalar(pole.dot(d))).normalize();
    const pe=ps.clone().addScaledVector(d,A.L1*ca).addScaledVector(pole,A.L1*sa);
    const u1=pe.clone().sub(ps).normalize(),u2=tw.clone().sub(pe).normalize();
    /* keep each bone's own twist: align its -y with the new direction, preserving the current z as well as possible */
    const aim=(bone,u)=>{const q=worldQ(bone,new T.Quaternion());const z=V3(0,0,1).applyQuaternion(q);basisQ(V3(0,-1,0),V3(0,0,1),u,z,q);setWorldQ(bone,q);};
    aim(A.sh,u1);aim(A.el,u2);
    setWorldQ(A.wr,basisQ(A.fing,A.palm,F,N,new T.Quaternion()));}
}
const ANIMS=[];
function animate(h,o){const a=new Animator(h,o);ANIMS.push(a);return a;}
