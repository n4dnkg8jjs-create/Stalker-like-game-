/* ---------- the things in the basin: crayfish grown monstrous in the contaminated silt. The biggest is close to two and
   a half metres from the rostrum to the tail fan, with claws that reach a metre further and feelers longer than that;
   the others are not much smaller. They lie on the bottom of the deep hollows with only the tips of their feelers above
   the water, and walk under it towards anything that wades in - the deeper you go, the further they hear you and the
   more of them come. They break the surface with the claws spread wide, take hold of a man and walk backwards with him
   into the deep. A round in the face hurts them most; the shell turns most of the rest. Hurt, they do what crayfish do:
   a flick of the tail shoots them backwards out of reach, and then they come again.
   Built and animated procedurally: a lathe-turned carapace and six tail segments, four pairs of walking legs stepping in
   alternating tetrapods with planted feet, the claws, feelers and mouthparts never still. ---------- */
const CRAWS=[],CRAWK={spT:20,hbT:0,shT:0};
const cfLin=c=>[Math.pow(c[0],2.2),Math.pow(c[1],2.2),Math.pow(c[2],2.2)];
/* several geometries into one, each given vertex colours (its own or a flat one) */
function cfMerge(parts){const gs=parts.map(([g,m,c])=>{const q=g.index?g.toNonIndexed():g.clone();if(m)q.applyMatrix4(m);if(!q.attributes.normal)q.computeVertexNormals();const n=q.attributes.position.count;
    if(!q.attributes.color){const a=new Float32Array(n*3);for(let i=0;i<n;i++)a.set(c,i*3);q.setAttribute('color',new T.BufferAttribute(a,3));}
    if(!q.attributes.uv)q.setAttribute('uv',new T.BufferAttribute(new Float32Array(n*2),2));return q;});
  let nv=0;gs.forEach(x=>nv+=x.attributes.position.count);const out=new T.BufferGeometry();
  [['position',3],['normal',3],['uv',2],['color',3]].forEach(([a,sz])=>{const arr=new Float32Array(nv*sz);let o=0;gs.forEach(x=>{arr.set(x.attributes[a].array,o*sz);o+=x.attributes.position.count;});out.setAttribute(a,new T.BufferAttribute(arr,sz));});
  out.computeBoundingSphere();return out;}
/* the shared parts, in a one-metre animal's units (each instance is scaled) */
const CFG=(function(){const G={};
  /* shell colours: near-black olive above, mottled; rust-red at the joints and margins; dirty cream beneath */
  const shellCol=(top,n,n2,rim)=>{let c=[.19+n*.09,.18+n*.07,.11+n*.04];c=mixc(c,[.1,.1,.07],sstep(.55,.7,n2)*.6);c=mixc(c,[.45,.2,.09],rim*.7);return mixc(c,[.6,.53,.4],1-top);};
  const setCol=(arr,i,c)=>{const L=cfLin(c);arr[i*3]=L[0];arr[i*3+1]=L[1];arr[i*3+2]=L[2];};
  /* the carapace: a lathe-turned shell, round in section and flat beneath, tapering to the spade of the rostrum; the
     cervical groove across the back, the branchial grooves down the sides, granules; the big one's grew wrong */
  const shellGeo=alpha=>{const P=[[0,-.004],[.07,0],[.088,.03],[.098,.1],[.1,.18],[.097,.26],[.088,.33],[.072,.39],[.052,.44],[.03,.48],[.014,.515],[.004,.55],[0,.565]];
    const g=new T.LatheGeometry(P.map(([a,b])=>new T.Vector2(a,b)),36,Math.PI);const p=g.attributes.position,col=new Float32Array(p.count*3);
    const tum=alpha?[[-.065,.2,.04],[-.078,.29,.03],[-.05,.12,.026],[.045,.33,.02]]:[];
    for(let i=0;i<p.count;i++){const x0=p.getX(i),a=p.getY(i),z0=p.getZ(i);const rad=Math.hypot(x0,z0)||1e-6;
      /* (the lathe's y is the long axis: x -> -x, z -> up, y -> forward keeps the faces turned outwards) */
      let X=-x0,Y=z0;const fk=sstep(.38,.56,a);Y*=(Y>0?.95:.72)*(1-.45*fk);Y+=.012*fk;const up=Math.max(0,z0/rad);
      const gr=Math.exp(-Math.pow((a-.24)/.011,2))*up*.075+Math.exp(-Math.pow((Math.abs(x0/rad)-.55)/.08,2))*sstep(.24,.3,a)*(1-sstep(.38,.42,a))*.03;
      let f=1-gr+Math.pow(fbm(X*28+3,a*28,2),3)*.06*up;
      for(const [tx,ta,tr] of tum){const dd=Math.hypot(X-tx,a-ta);if(dd<tr)f+=Math.sqrt(1-(dd/tr)**2)*tr*6*(Y>0?1:.3);}
      X*=f;Y*=f;p.setXYZ(i,X,Y,a);
      const n=fbm(X*14+5,a*14,3),n2=fbm(X*40,a*40,2),top=sstep(-.02,.03,Y);let c=shellCol(top,n,n2,Math.min(1,sstep(.5,.56,a)+Math.exp(-Math.pow((a-.24)/.008,2))*.6*up));
      if(n2>.74)c=mixc(c,[.05,.045,.035],sstep(.74,.8,n2)*top);
      for(const [tx,ta,tr] of tum){const dd=Math.hypot(X-tx,a-ta);if(dd<tr*1.15)c=mixc(c,[.66,.54,.47],(1-dd/(tr*1.15))*.85);}
      setCol(col,i,c);}
    g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();return g;};
  G.shell=shellGeo(false);G.shellA=shellGeo(true);
  /* the tail: six overlapping segments, each a short lathe, flat beneath, the pleura hanging down the sides; the telson
     on the last */
  G.AL=[.07,.068,.066,.064,.062,.06];const AR=[.088,.084,.078,.07,.062,.054,.046];
  G.abd=G.AL.map((L,i)=>{const r0=AR[i],r1=AR[i+1];const P=[[0,-.004],[r0*.92,0],[r0,.012],[r0*1.01,L*.5],[r1*1.03,L*.92],[r1*.96,L*1.12],[0,L*1.14]];
    const g=new T.LatheGeometry(P.map(([a,b])=>new T.Vector2(a,b)),28,Math.PI);const p=g.attributes.position,col=new Float32Array(p.count*3);
    for(let k=0;k<p.count;k++){const x0=p.getX(k),a=p.getY(k),z0=p.getZ(k);const rad=Math.hypot(x0,z0)||1e-6,rl=Math.max(1e-3,lerp(r0,r1,clamp(a/L,0,1)));
      const X=x0;let Y=z0*(z0>0?.78:.55);const side=sstep(.55,.95,Math.abs(x0)/rl);if(z0<0)Y-=.022*side*sstep(0,L*.3,a)*(1-sstep(L*.9,L*1.1,a));
      const up=Math.max(0,z0/rad);Y+=Math.pow(fbm(X*30+i*7,a*30,2),3)*.02*up;p.setXYZ(k,X,Y,-a);
      const n=fbm(X*14+i*3,a*14+i,3),n2=fbm(X*40+i,a*40,2),top=sstep(-.03,.02,Y);let c=shellCol(top,n,n2,sstep(L*.8,L*1.05,a)*up);
      if(n2>.76)c=mixc(c,[.05,.045,.035],sstep(.76,.82,n2)*top);setCol(col,k,c);}
    g.setAttribute('color',new T.BufferAttribute(col,3));g.computeVertexNormals();if(i<5)return g;
    const tel=new T.SphereGeometry(1,16,10);tel.scale(.034,.008,.062);tel.translate(0,-.004,-L-.05);return cfMerge([[g,null,null],[tel,null,cfLin([.3,.24,.15])]]);});
  {const u=new T.SphereGeometry(1,14,8);u.scale(.03,.006,.058);u.translate(0,0,-.05);const pp=u.attributes.position,cc=new Float32Array(pp.count*3);
    for(let i=0;i<pp.count;i++)setCol(cc,i,mixc([.24,.2,.13],[.5,.24,.11],sstep(-.02,-.1,pp.getZ(i))));u.setAttribute('color',new T.BufferAttribute(cc,3));G.uro=u;}
  /* leg segments: flattened, tapered, banded, a row of short spines along the front edge */
  const segGeo=(L,r0,r1,spines)=>{const q=new T.CylinderGeometry(r1,r0,L,10,6);q.translate(0,L/2,0);q.scale(1,1,.62);const pp=q.attributes.position,cc=new Float32Array(pp.count*3);
    for(let i=0;i<pp.count;i++){const y=pp.getY(i)/L,xx=pp.getX(i);const band=sstep(.85,1,y)+sstep(.15,0,y);let c=[.2,.17,.11];c=mixc(c,[.52,.24,.1],band*.7);c=mixc(c,[.58,.5,.37],sstep(0,-.5,pp.getZ(i)/r0)*.6);
      const n=fbm(xx*40/r0*.05,y*12,2);setCol(cc,i,c.map(v=>v*(.85+n*.3)));}
    q.setAttribute('color',new T.BufferAttribute(cc,3));const parts=[[q,null,null]];
    if(spines){const sg=new T.ConeGeometry(r0*.22,r0*.9,5);sg.rotateX(Math.PI/2);for(let k=1;k<spines;k++){const s=sg.clone();s.translate(0,L*k/spines,lerp(r0,r1,k/spines)*.62);parts.push([s,null,cfLin([.12,.1,.07])]);}}
    return cfMerge(parts);};
  const finger=(L,r0)=>{const q=new T.ConeGeometry(r0,L,10,5);q.translate(0,L/2,0);q.scale(1,1,.65);const pp=q.attributes.position,cc=new Float32Array(pp.count*3);
    for(let i=0;i<pp.count;i++)setCol(cc,i,mixc([.2,.16,.1],[.78,.62,.42],sstep(.62,1,pp.getY(i)/L)));q.setAttribute('color',new T.BufferAttribute(cc,3));q.computeVertexNormals();return q;};
  G.legL=[[.12,.11],[.135,.12],[.14,.125],[.13,.12]];
  G.leg=G.legL.map(([a,b])=>[segGeo(a,.023,.019,6),segGeo(b,.018,.014,5),finger(.055,.012)]);
  G.chM=segGeo(.17,.034,.03,6);G.chC=segGeo(.085,.03,.036,3);
  /* the claw: a long, flattened palm studded with tubercles on top, orange-red beneath; the fixed finger (pollex) runs on
     from it, the movable one (dactyl) hinges above; both edged with blunt teeth */
  {const parts=[];const palm=new T.SphereGeometry(1,22,14);const pp=palm.attributes.position,cc=new Float32Array(pp.count*3);
    for(let i=0;i<pp.count;i++){const x=pp.getX(i),y=pp.getY(i),z=pp.getZ(i);const n=fbm(x*3+2,z*3,2);let Y=y*.022;if(y>0)Y+=Math.pow(fbm(x*6+1,z*6,2),3)*.012;pp.setXYZ(i,x*.05,Y*1.2,z*.085+.078);
      let c=mixc([.17,.15,.1],[.55,.22,.1],sstep(-.3,-.9,y)*.85);c=mixc(c,[.08,.07,.05],sstep(.6,.75,fbm(x*9,z*9,2))*.6);setCol(cc,i,c.map(v=>v*(.85+n*.3)));}
    palm.setAttribute('color',new T.BufferAttribute(cc,3));palm.computeVertexNormals();parts.push([palm,null,null]);
    const pol=finger(.15,.027);pol.rotateX(Math.PI/2+.05);pol.translate(.008,-.008,.145);parts.push([pol,null,null]);
    const tg=new T.ConeGeometry(.004,.009,5);tg.translate(0,.0045,0);for(let i=0;i<7;i++){const t=tg.clone();t.translate(.008,.004,.16+i*.016);parts.push([t,null,cfLin([.5,.43,.32])]);}
    G.hand=cfMerge(parts);
    const d=finger(.165,.025);d.rotateX(Math.PI/2-.04);const dp=[[d,null,null]];for(let i=0;i<7;i++){const t=new T.ConeGeometry(.004,.009,5);t.rotateX(Math.PI);t.translate(0,-.011,.035+i*.016);dp.push([t,null,cfLin([.5,.43,.32])]);}
    G.dac=cfMerge(dp);}
  /* feelers: two stout basal joints, then a whip in seven lengths, longer than the animal */
  G.ANTL=[.045,.045,.15,.15,.15,.15,.15,.15,.14];const ANTR=[.008,.0065,.0046,.0039,.0033,.0028,.0023,.0019,.0014,.0009];
  G.ant=G.ANTL.map((L,i)=>{const q=new T.CylinderGeometry(ANTR[i+1],ANTR[i],L*1.04,5);q.translate(0,L*.52,0);const n=q.attributes.position.count,cc=new Float32Array(n*3);for(let k=0;k<n;k++)setCol(cc,k,i<2?[.32,.16,.08]:[.26,.15,.09]);q.setAttribute('color',new T.BufferAttribute(cc,3));return q;});
  {const a=new T.CylinderGeometry(.0015,.004,.1,4);a.translate(0,.05,0);G.antl=cfMerge([[a,new T.Matrix4().makeRotationZ(.2),cfLin([.3,.18,.1])],[a,new T.Matrix4().makeRotationZ(-.15),cfLin([.3,.18,.1])]]);}
  {const s=new T.CylinderGeometry(.009,.013,.04,8);s.translate(0,.02,0);G.stalk=cfMerge([[s,null,cfLin([.3,.2,.12])]]);}
  G.eye=new T.SphereGeometry(.0135,12,10);G.mx=cfMerge([[rbox(.03,.045,.008,.003),new T.Matrix4().makeTranslation(0,-.022,0),cfLin([.42,.28,.16])]]);G.hit=new T.SphereGeometry(1,10,8);
  G.shellM=new T.MeshStandardMaterial({vertexColors:true,roughness:.36,metalness:0,normalMap:PB.rust.n,normalScale:new T.Vector2(.5,.5),envMapIntensity:.6});
  G.legM=new T.MeshStandardMaterial({vertexColors:true,roughness:.42,normalMap:PB.rust.n,normalScale:new T.Vector2(.4,.4),envMapIntensity:.55});
  /* the eyes are black and wet, and like a crayfish's they throw back the light - a dull orange shine */
  G.eyeM=new T.MeshStandardMaterial({color:C(0x050505),roughness:.05,envMapIntensity:1.2,emissive:C(0x6a2208),emissiveIntensity:.55});
  return G;})();
/* one animal: its own meshes on the shared geometry */
function crawNew(o){const s=o.s;const C_={alpha:!!o.alpha,s,dead:false,state:'off',hp:o.hp,hp0:o.hp,p:V3(),yaw:0,v:V3(),y:0,t:WR()*20,st:0,legs:[],claws:[],abd:[],uro:[],ant:[[],[]],eyes:[],
    cool:0,rear:0,strike:0,curl:0,tuck:0,roll:0,fan:0,spread:0,raise:0,met:false,hurtN:0,recent:0,recentT:0,lost:0,home:null,dist:999,hitIn:false,wk:0};
  const shellM=CFG.shellM.clone(),legM=CFG.legM.clone();shellM.color.setScalar(o.tint||1);legM.color.setScalar(o.tint||1);C_.mats=[shellM,legM];
  const g=new T.Group();g.visible=false;g.scale.setScalar(s);g.userData.noMerge=g.userData.noCull=true;scene.add(g);C_.g=g;
  const body=new T.Group();g.add(body);C_.body=body;
  const sh=new T.Mesh(o.alpha?CFG.shellA:CFG.shell,shellM);sh.castShadow=sh.receiveShadow=true;body.add(sh);
  let par=body;for(let i=0;i<6;i++){const a=new T.Group();a.position.set(0,.004,i?-CFG.AL[i-1]:.012);par.add(a);const m=new T.Mesh(CFG.abd[i],shellM);m.castShadow=m.receiveShadow=true;a.add(m);C_.abd.push(a);par=a;}
  for(const [x,yw] of [[-.03,-.25],[-.055,-.6],[.03,.25],[.055,.6]]){const u=new T.Group();u.position.set(x,-.002,-CFG.AL[5]*.98);u.userData.y0=yw;par.add(u);const m=new T.Mesh(CFG.uro,shellM);m.castShadow=true;u.add(m);C_.uro.push(u);}
  /* the face: eyes on stalks either side of the rostrum (the big one has a third, crooked), feelers, mouthparts */
  [[-1,0],[1,0]].concat(o.alpha?[[.35,1]]:[]).forEach(([sd,k])=>{const st=new T.Group();st.position.set(sd*.026,.028,.5-k*.03);st.rotation.set(.5+k*.3,0,-sd*.7);body.add(st);
    st.add(new T.Mesh(CFG.stalk,legM));const e=new T.Mesh(CFG.eye,CFG.eyeM);e.position.y=.042;e.scale.setScalar(k?.7:1);st.add(e);C_.eyes.push(st);});
  for(let j=0;j<2;j++)for(let i=0;i<CFG.ant.length;i++){const m=new T.Mesh(CFG.ant[i],legM);body.add(m);C_.ant[j].push(m);}
  [-1,1].forEach(sd=>{const a=new T.Mesh(CFG.antl,legM);a.position.set(sd*.012,.018,.535);a.rotation.set(1.1,0,-sd*.25);body.add(a);});
  C_.mx=[-1,1].map(sd=>{const a=new T.Mesh(CFG.mx,legM);a.position.set(sd*.014,-.03,.5);body.add(a);return a;});
  /* legs and claws live in the world, placed every frame from the hips to the planted feet */
  const legs=new T.Group();legs.visible=false;legs.userData.noMerge=legs.userData.noCull=true;scene.add(legs);C_.legG=legs;
  const mk=(geo,m,sh)=>{const x=new T.Mesh(geo,m);x.matrixAutoUpdate=false;x.castShadow=sh;x.receiveShadow=true;legs.add(x);return x;};
  for(const sd of [-1,1])for(let k=0;k<4;k++){const [L1,L2]=CFG.legL[k];
    C_.legs.push({s:sd,k,hip:V3(sd*.062,-.05,.31-k*.058),rest:V3(sd*(.25+(k===1||k===2?.02:0)),0,[.34,.26,.17,.07][k]),L1,L2,L3:.05,
      seg:CFG.leg[k].map((q,i)=>mk(q,legM,i<2)),foot:V3(),from:V3(),to:V3(),lift:0,up:false,grp:(k+(sd>0?1:0))%2});}
  for(const sd of [-1,1]){const big=o.claws?o.claws[sd>0?1:0]:(o.alpha&&sd>0?1.75:1.35);const hand=new T.Group();hand.matrixAutoUpdate=false;legs.add(hand);
    const pm=new T.Mesh(CFG.hand,legM);pm.castShadow=pm.receiveShadow=true;hand.add(pm);const dg=new T.Group();dg.position.set(-.008,.016,.125);hand.add(dg);const dm=new T.Mesh(CFG.dac,legM);dm.castShadow=true;dg.add(dm);
    C_.claws.push({s:sd,big,hip:V3(sd*.05,-.035,.45),seg:[mk(CFG.chM,legM,true),mk(CFG.chC,legM,true)],hand,dg,open:0,L1:.17,L2:.085});}
  /* hit volumes: the face hurts it most; the shell, the tail and the claws are armour */
  const hv=(par,part,sc,pos)=>{const m=new T.Mesh(CFG.hit,_hidden);m.scale.set(sc[0],sc[1],sc[2]);m.position.set(pos[0],pos[1],pos[2]);par.add(m);m.userData={owner:C_,part};return m;};
  C_.hitM=[hv(body,'face',[.06,.05,.06],[0,0,.5]),hv(body,'shell',[.105,.085,.25],[0,0,.27]),hv(C_.abd[1],'tail',[.08,.06,.2],[0,0,-.06])];
  C_.claws.forEach(c=>C_.hitM.push(hv(c.hand,'claw',[.045,.03,.14],[0,0,.12])));
  C_.onShot=(m,p,d)=>crawShot(C_,m,p,d);g.position.set(-790,-60,-370);crawMutate(C_,o);CRAWS.push(C_);return C_;}
/* the mutations: lumpy growths of pale, raw-looking tissue pushing up through the carapace and between the tail plates,
   crooked spines along the back, a cluster of small extra eyes, sores; on some a stunted extra leg out of the side */
function crawMutate(C_,o){const r=rng(9100+(o.seed||0)*17),rr=(a,b)=>a+(b-a)*r(),b=C_.body;
  const flesh=std({color:C(0x7e5c4e),roughness:.55,envMapIntensity:.35}),sore=std({color:C(0x6a2a20),roughness:.3,envMapIntensity:.6}),horn=std({color:C(0x2a2018),roughness:.4,envMapIntensity:.5});
  const lump=(R0,sd)=>{const g=new T.SphereGeometry(R0,14,10);const q=g.attributes.position,rn=rng(sd);for(let i=0;i<q.count;i++){const x=q.getX(i),y=q.getY(i),z=q.getZ(i);const k=.75+.5*n3(x*90+sd,y*90,z*90)+(rn()<.05?.15:0);q.setXYZ(i,x*k,y*k*.8,z*k);}g.computeVertexNormals();return g;};
  /* on the shell: an ellipsoid round (0,.0,.27), half sizes .1, .08, .25 */
  const onShell=(u,v)=>{const x=Math.sin(u)*.098*Math.cos(v),y=.008+Math.cos(u)*.076,z=.27+Math.sin(v)*.24;return V3(x,y,z);};
  const nl=2+Math.floor(r()*4)+(o.alpha?3:0);for(let i=0;i<nl;i++){const p=onShell(rr(-1.1,1.1),rr(-.9,.8));const m=new T.Mesh(lump(rr(.016,.034)*(o.alpha?1.2:1),Math.floor(r()*1000)),r()<.25?sore:flesh);m.position.copy(p);m.castShadow=true;b.add(m);
    if(r()<.5){const m2=new T.Mesh(lump(rr(.008,.015),Math.floor(r()*1000)),flesh);m2.position.copy(p).add(V3(rr(-.02,.02),.008,rr(-.02,.02)));b.add(m2);}}
  /* growths between the tail plates */
  C_.abd.forEach((a,i)=>{if(i>3||r()>.45)return;const m=new T.Mesh(lump(rr(.012,.022),Math.floor(r()*1000)),flesh);m.position.set(rr(-.04,.04),.03,-.02);a.add(m);});
  /* crooked spines down the back and on the claws' palms */
  const sp=new T.ConeGeometry(.006,.05,6);sp.translate(0,.025,0);const ns=4+Math.floor(r()*5);for(let i=0;i<ns;i++){const v=rr(-.6,.8),u=rr(-.5,.5);const p=onShell(u,v);const m=new T.Mesh(sp,horn);m.position.copy(p);m.rotation.set(rr(-.6,.3),0,u*.9+rr(-.3,.3));m.scale.setScalar(rr(.6,1.4));b.add(m);}
  C_.claws.forEach(c=>{for(let i=0;i<3+Math.floor(r()*3);i++){const m=new T.Mesh(sp,horn);m.position.set(rr(-.03,.03),.02,.03+r()*.12);m.rotation.set(rr(-.5,.5),0,rr(-.5,.5));m.scale.setScalar(rr(.4,.9));c.hand.add(m);}});
  /* extra eyes, small and clustered, crooked on short stalks */
  const ne=1+Math.floor(r()*3);for(let i=0;i<ne;i++){const sd=r()<.5?-1:1;const st=new T.Group();st.position.set(sd*rr(.01,.04),.03,rr(.44,.5));st.rotation.set(.3+rr(0,.8),rr(-.4,.4),-sd*rr(.2,1.1));b.add(st);
    const sm=new T.Mesh(CFG.stalk,C_.mats[1]);sm.scale.set(.7,rr(.4,.8),.7);st.add(sm);const e=new T.Mesh(CFG.eye,CFG.eyeM);e.position.y=.026;e.scale.setScalar(rr(.45,.75));st.add(e);}
  /* a leg that never finished: a short bent stub out of the side */
  if(o.alpha||r()<.55){const sd=r()<.5?-1:1;const g1=new T.Group();g1.position.set(sd*.085,-.02,rr(.18,.3));g1.rotation.set(rr(-.3,.3),0,sd*rr(.9,1.4));b.add(g1);
    const s1=new T.Mesh(CFG.leg[1][0],C_.mats[1]);s1.scale.set(1.3,.5,1.3);g1.add(s1);const g2=new T.Group();g2.position.y=.06;g2.rotation.z=-sd*rr(.8,1.5);g1.add(g2);const s2=new T.Mesh(CFG.leg[1][1],C_.mats[1]);s2.scale.set(1.2,.45,1.2);g2.add(s2);}
  b.traverse(q=>{if(q.isMesh)q.castShadow=true;});}
/* the big one by the dyke, who is part of the story, then the others */
/* (bigger than they were, and none of them grew right: claws that do not match, growths on the shell, extra eyes, spines
   where there should be none, a leg that never finished) */
const CRAB=crawNew({alpha:true,s:3.0,hp:12,tint:1,claws:[1.3,2.05],seed:1});
[[2.45,8,.9],[2.7,8,1.05],[2.15,7,1.1],[2.3,7,.95],[2.55,7,.85],[2.4,7,1],[2.5,8,.92]].forEach(([s,hp,tint],i)=>{const r=rng(700+i*13),a=1.05+r()*.25,b=1.6+r()*.35;crawNew({s,hp,tint,claws:r()<.5?[a,b]:[b,a],seed:2+i});});
const _cm=new T.Matrix4(),_cx=V3(),_cy=V3(),_cz=V3(),_cu=V3(0,1,0),_cfq=V3();
/* place a segment from a to b (flattened face kept upright), at the animal's scale */
function crawSeg(m,a,b,up,s){_cy.subVectors(b,a).normalize();_cx.crossVectors(_cy,up);if(_cx.lengthSq()<1e-6)_cx.set(1,0,0);_cx.normalize();_cz.crossVectors(_cx,_cy);
  _cm.makeBasis(_cx.multiplyScalar(s),_cy.multiplyScalar(s),_cz.multiplyScalar(s));_cm.setPosition(a);m.matrix.copy(_cm);m.matrixWorldNeedsUpdate=true;}
/* two-bone reach: hip -> knee -> ankle, the knee bowed towards the pole */
function crabIK(h,t,L1,L2,pole){const d=V3().subVectors(t,h);const dist=clamp(d.length(),.05,L1+L2-.002);d.normalize();const ca=clamp((L1*L1+dist*dist-L2*L2)/(2*L1*dist),-1,1),sa=Math.sqrt(1-ca*ca);
  const pv=pole.clone().addScaledVector(d,-pole.dot(d));if(pv.lengthSq()<1e-8)pv.set(0,1,0);pv.normalize();return h.clone().addScaledVector(d,L1*ca).addScaledVector(pv,L1*sa);}
/* a point in the animal's frame (yaw only, scaled) in the world */
function crawW(C_,lp){return lp.clone().multiplyScalar(C_.s).applyAxisAngle(_cu,C_.yaw).add(C_.p).setY(lp.y*C_.s+C_.y);}
function crawPose(C_,dt){const t=C_.t,s=C_.s,b=C_.body,st=C_.state;C_.g.position.set(C_.p.x,C_.y,C_.p.z);C_.g.rotation.y=C_.yaw;
  /* breathing heave and a little sway; the front comes up to threaten and to strike; dead, it lies canted over */
  b.rotation.x=-.42*C_.rear+Math.sin(t*1.7)*.01;b.rotation.z=C_.roll+(st==='dead'?0:Math.sin(t*1.3)*.012);b.position.y=Math.sin(t*1.7)*.006;
  /* the tail lies along the bottom (it stays down when the front rears), tucks under in the flip and in death */
  C_.abd.forEach((a,i)=>a.rotation.x=(i===0?.36*C_.rear:0)-.03-.42*C_.tuck+(st==='dead'?0:Math.sin(t*1.1+i*.7)*.012));
  C_.uro.forEach(u=>u.rotation.y=u.userData.y0*(1+.8*C_.fan));
  C_.mx.forEach((m,i)=>m.rotation.x=.3+(st==='dead'?0:Math.sin(t*(9+i*1.3)+i)*.22));
  C_.eyes.forEach((e,i)=>e.rotation.y=(i===2?-.3:0)+(st==='dead'?0:Math.sin(t*.7+i*1.7)*.2));
  /* feelers: two whips, drooping along their length and never still; held high under the water so the tips break the
     surface, swung forward at what it hunts, lying flat when it is dead */
  {const hunt=['emerge','hunt','strike','grab'].includes(st);const pb=st==='lurk'?.78:st==='stalk'?.38:st==='dead'?-.05:hunt?.1:.14;
    for(let j=0;j<2;j++){const sd=j?1:-1;let ya=sd*(hunt?.18:.34)+Math.sin(t*.7+j*2)*.12,pi=pb+Math.sin(t*.9+j)*.06;const p=_cfq.set(sd*.026,.025,.53);
      C_.ant[j].forEach((m,i)=>{ya+=sd*(hunt?.02:.045)+(st==='dead'?0:Math.sin(t*1.6+i*.55+j*2)*.05);pi-=(st==='dead'?.02:.05)+(st==='dead'?0:Math.sin(t*1.1+i*.4+j)*.03);
        const d=V3(Math.sin(ya)*Math.cos(pi),Math.sin(pi),Math.cos(ya)*Math.cos(pi));m.position.copy(p);m.quaternion.setFromUnitVectors(_cu,d);p.addScaledVector(d,CFG.ANTL[i]);});
      if(j===0)C_.tipL=p.clone();else C_.tipR=p.clone();}}
  C_.g.updateMatrixWorld(true);
  /* legs */
  for(const L of C_.legs){const hip=b.localToWorld(L.hip.clone());let foot=L.foot;
    if(L.up){L.lift+=dt/.14;const u=Math.min(1,L.lift);foot=V3().lerpVectors(L.from,L.to,u);foot.y+=Math.sin(u*Math.PI)*.1*s;if(u>=1){L.up=false;L.foot.copy(L.to);foot=L.foot;if(C_.dist<26&&WR()<.2)sfx.crab('click',L.foot);}}
    if(C_.curl>0){const tuck=b.localToWorld(V3(L.hip.x*1.4,-.03,L.hip.z));foot=V3().lerpVectors(foot,tuck,C_.curl);}
    const ank=foot.clone().add(V3(0,L.L3*s*.9,0)).addScaledVector(V3().subVectors(hip,foot).setY(0).normalize(),-.04*s);
    const out=V3().subVectors(ank,hip).setY(0).normalize(),ax=out.clone().cross(_cu);const knee=crabIK(hip,ank,L.L1*s,L.L2*s,V3(0,1,0).addScaledVector(out,.3));
    crawSeg(L.seg[0],hip,knee,ax,s);crawSeg(L.seg[1],knee,ank,ax,s);crawSeg(L.seg[2],ank,foot,ax,s);}
  /* claws: carried low in front of the face, spread wide and high to threaten, thrown forward to strike - and the one
     that has hold of you, at you */
  const fw=b.localToWorld(V3(0,0,1)).sub(b.localToWorld(V3(0,0,0))).normalize();
  for(const c of C_.claws){const sc=s*c.big,hip=b.localToWorld(c.hip.clone());let target;
    if(st==='grab'&&c===C_.gc){const pp=player.pos;target=V3(pp.x,groundY(pp.x,pp.z)+.85,pp.z).addScaledVector(fw,-.15);}
    else{const r=C_.raise,sp=C_.spread;target=b.localToWorld(V3(c.s*(.11+.22*sp),lerp(-.07,.1,r)+.08*sp+(st==='dead'?0:Math.sin(t*1.1+c.s)*.01),lerp(.76,.64,r)-.1*sp+.4*C_.strike));}
    const pole=b.localToWorld(V3(c.s*.7,.6,-.2)).sub(b.localToWorld(V3(0,0,0)));const elbow=crabIK(hip,target,c.L1*sc,c.L2*sc,pole);
    crawSeg(c.seg[0],hip,elbow,_cu,sc);crawSeg(c.seg[1],elbow,target,_cu,sc);
    const dir=V3().subVectors(target,elbow).normalize();const hz=fw.clone().lerp(dir,.55).normalize();_cx.crossVectors(_cu,hz).normalize();_cy.crossVectors(hz,_cx);
    const ro=c.s*.55,co=Math.cos(ro),si=Math.sin(ro);const X=_cx.clone().multiplyScalar(co).addScaledVector(_cy,si),Y=_cy.clone().multiplyScalar(co).addScaledVector(_cx,-si);
    _cm.makeBasis(X.multiplyScalar(sc),Y.multiplyScalar(sc),hz.multiplyScalar(sc));_cm.setPosition(target);c.hand.matrix.copy(_cm);c.hand.matrixWorldNeedsUpdate=true;
    c.dg.rotation.x=-c.open*.6-(st==='dead'?0:Math.max(0,Math.sin(t*3+c.s))*.05);}}
/* the legs step: alternating tetrapods, a foot lifts when it lags too far behind where it should be */
function crawStep(C_,dt){const lead=C_.v.clone().multiplyScalar(.2);const need=[0,0],fast=C_.v.length()>.2;
  for(const L of C_.legs){const want=crawW(C_,L.rest).add(lead);want.y=H(want.x,want.z);L.want=want;if(!L.up&&L.foot.distanceTo(want)>(fast?.12:.17)*C_.s)need[L.grp]++;}
  if(!C_.legs.some(L=>L.up)){const gs=need[0]>=need[1]?0:1;if(need[gs]>0)for(const L of C_.legs)if(L.grp===gs){L.up=true;L.lift=0;L.from.copy(L.foot);L.to.copy(L.want);}}}
function crawPlace(C_,x,z,yaw){C_.p.set(x,0,z);C_.yaw=yaw;C_.v.set(0,0,0);C_.y=H(x,z)+.08*C_.s;for(const L of C_.legs){const w=crawW(C_,L.rest);w.y=H(w.x,w.z);L.foot.copy(w);L.up=false;}}
function crawHitOn(C_){if(C_.hitIn)return;C_.hitIn=true;C_.hitM.forEach(m=>{if(!HITS.includes(m))HITS.push(m);});}
function crawHitOff(C_){C_.hitIn=false;C_.hitM.forEach(m=>{const i=HITS.indexOf(m);if(i>=0)HITS.splice(i,1);});}
/* (re)start an animal somewhere in the water */
function crawReset(C_,x,z,yaw,state){Object.assign(C_,{dead:false,state,hp:C_.hp0,st:0,cool:0,rear:0,strike:0,curl:0,tuck:0,roll:0,fan:0,spread:0,raise:0,met:false,hurtN:0,recent:0,recentT:0,lost:0,gc:null,hitDone:false,snapped:false});
  crawPlace(C_,x,z,yaw);C_.home=V3(x,0,z);C_.claws.forEach(c=>c.open=0);crawHitOn(C_);}
const crawLive=C_=>['emerge','hunt','strike','grab','flinch','flip'].includes(C_.state);
const crawAct=C_=>C_.state==='stalk'||crawLive(C_);
/* depth of water at a point (negative: dry) */
const crawDep=(x,z)=>inDET(x,z)?W3.wl-H(x,z):-9;
/* a deep spot on the basin floor, away from the dyke */
function crawDyke(x,z){const P=W3.path;let dp=99;for(let j=0;j<P.length-1;j++){const p=P[j],q=P[j+1],dx=q[0]-p[0],dz=q[1]-p[1],l2=dx*dx+dz*dz;const t=clamp(((x-p[0])*dx+(z-p[1])*dz)/l2,0,1);dp=Math.min(dp,Math.hypot(x-p[0]-dx*t,z-p[1]-dz*t));}return dp;}
function crabInit(){if(CRAB.lurk)return;const P=W3.path;let best=null,bd=0;
  for(let i=3;i<=4;i++){const a=P[i],b=P[i+1];for(let u=0;u<=1;u+=.1){const px=lerp(a[0],b[0],u),pz=lerp(a[1],b[1],u);for(let ang=0;ang<6.28;ang+=.3)for(let r=5;r<10;r+=.5){const x=px+Math.cos(ang)*r,z=pz+Math.sin(ang)*r;
      if(crawDyke(x,z)<4.5)continue;const d=crawDep(x,z);if(d>bd&&d<1.5){bd=d;best=V3(x,0,z);}}}}
  CRAB.lurk=best||V3(-772,0,-366);CRAB.lurkD=bd;crawReset(CRAB,CRAB.lurk.x,CRAB.lurk.z,0,'lurk');
  /* more lie along the rest of the crossing, in the deeper water a few metres off the dyke - you pass within reach of
     every one of them - and two out in the deep hollows */
  const r=rng(4242),placed=[CRAB.lurk];let n=0;const P2=W3.path;
  for(let i=1;i<P2.length-1&&n<4;i++){const a=P2[i],b=P2[i+1];for(let u=.2;u<1&&n<4;u+=.35){const px=lerp(a[0],b[0],u),pz=lerp(a[1],b[1],u);if(px>CRAB.lurk.x-10)continue;
      const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz),nx=-dz/l,nz=dx/l;let best=null,bd=0;
      for(const sd of [-1,1])for(let o=4.5;o<=8.5;o+=.5){const x=px+nx*o*sd,z=pz+nz*o*sd,d=crawDep(x,z);if(d>.7&&d<1.45&&d>bd&&crawDyke(x,z)>4){bd=d;best=V3(x,0,z);}}
      if(!best||placed.some(q=>Math.hypot(q.x-best.x,q.z-best.z)<18))continue;placed.push(best);crawReset(CRAWS[1+n],best.x,best.z,r()*6.28,'lurk');n++;}}
  for(let k=0;k<400&&n<6;k++){const x=-835+r()*60,z=-420+r()*120;const d=crawDep(x,z);if(d<.95||d>1.5||crawDyke(x,z)<9||placed.some(q=>Math.hypot(q.x-x,q.z-z)<22))continue;
    placed.push(V3(x,0,z));crawReset(CRAWS[1+n],x,z,r()*6.28,'lurk');n++;}}
/* the animal under the water comes up out of it */
function crawEmerge(C_){const first=!C_.met;C_.state='emerge';C_.st=0;C_.met=true;crawHitOn(C_);
  /* the commotion brings the others lying near */
  if(!C_.alpha||!first)for(const o of CRAWS)if(o!==C_&&o.state==='lurk'&&Math.hypot(o.p.x-C_.p.x,o.p.z-C_.p.z)<22){o.state='stalk';o.st=0;o.met=true;}const P3=V3(C_.p.x,W3.wl,C_.p.z);
  sfx.crab('erupt',P3);sfx.crab('screech',P3);WATER.splash(V3(C_.p.x,0,C_.p.z),1.4+.6*C_.s);
  if(C_.alpha&&first){ch3Say([['CAPTAIN MOROZOV','In the water — there! Shoot it, shoot it!',2.6]]);setObj('Kill the creature.');}else crawShout('emerge',C_);}
/* Morozov shouts - now and then, and not over his own story */
function crawShout(kind,C_){if(CRAWK.shT>S.t||CH3.q.length)return;CRAWK.shT=S.t+9;const pp=player.pos;
  const behind=Math.sin(player.yaw)*(C_.p.x-pp.x)+Math.cos(player.yaw)*(C_.p.z-pp.z)>0;
  const L=kind==='grab'?[['It has you — hit it in the face! The face!',2.6],['Hold on — I can\'t get a clear shot!',2.4]]
    :[[behind?'Behind you! In the water!':'Another one — in the water!',2.3],['Get out of the deep water — now!',2.4],['There\'s more of them! Watch the water!',2.4]];
  const l=L[Math.floor(WR()*L.length)];ch3Say([['CAPTAIN MOROZOV',l[0],l[1]]]);}
function crawGrab(C_){C_.state='grab';C_.st=0;C_.hurt0=C_.hurtN;const pp=player.pos;
  C_.gc=C_.claws.reduce((a,c)=>{const ha=V3().setFromMatrixPosition(a.hand.matrix),hc=V3().setFromMatrixPosition(c.hand.matrix);return hc.distanceTo(pp)<ha.distanceTo(pp)?c:a;});
  S.held={x:pp.x,z:pp.z,by:C_};sfx.crab('crunch',V3(pp.x,groundY(pp.x,pp.z)+.9,pp.z));crawShout('grab',C_);}
function crawRelease(C_,shove){if(S.held&&S.held.by===C_)S.held=null;C_.gc=null;const pp=player.pos,away=V3(pp.x-C_.p.x,0,pp.z-C_.p.z).normalize();
  if(shove&&S.state==='play'){S.hp-=wr(10,14)*(S.equip.vest?.8:1);S.sinceDmg=0;S.killer='crab';sfx.hitFlesh(1);player.vel.addScaledVector(away,4.5);}
  if(C_.state==='grab'){C_.state='hunt';C_.cool=wr(1.4,2.2);C_.strike=0;}}
function crawFlip(C_){C_.state='flip';C_.st=0;C_.flipD=V3(-Math.sin(C_.yaw),0,-Math.cos(C_.yaw));if(S.held&&S.held.by===C_)crawRelease(C_,false);
  WATER.splash(V3(C_.p.x,0,C_.p.z),1+.5*C_.s);sfx.crab('erupt',V3(C_.p.x,W3.wl,C_.p.z));}
function crawTick(C_,dt){if(C_.state==='off')return;
  const pp=player.pos;C_.t+=dt;const dx=pp.x-C_.p.x,dz=pp.z-C_.p.z,d=Math.hypot(dx,dz);C_.dist=d;const s=C_.s;
  if(d>140){C_.g.visible=C_.legG.visible=false;return;}C_.g.visible=C_.legG.visible=true;
  const fl=H(C_.p.x,C_.p.z),dep=W3.wl-fl;let wantY=fl+.14*s;C_.v.multiplyScalar(Math.exp(-dt*4));
  const face=(a,k)=>{let dy=a-C_.yaw;dy=Math.atan2(Math.sin(dy),Math.cos(dy));C_.yaw+=dy*clamp(dt*k,0,1);};
  const P3=V3(C_.p.x,Math.max(W3.wl,C_.y),C_.p.z);const wade=S.wade||0;
  const inBasin=inDET(pp.x,pp.z)&&pp.x<-712&&pp.x>-858;const reach=.95*s;
  C_.recentT-=dt;if(C_.recentT<=0)C_.recent=0;
  if(C_.state==='lurk'){wantY=fl+.08*s;C_.rear=damp(C_.rear,0,3,dt);C_.spread=damp(C_.spread,0,3,dt);C_.raise=damp(C_.raise,0,3,dt);
    /* bubbles, and the feeler tips ringing the surface */
    if(WR()<dt*.35)WATER.ring(C_.p.x+wr(-.3,.3)*s,C_.p.z+wr(-.3,.3)*s,.2);
    if(C_.tipL&&WR()<dt*.8){const q=C_.body.localToWorld((WR()<.5?C_.tipL:C_.tipR).clone());if(q.y>W3.wl-.05&&inDET(q.x,q.z))WATER.ring(q.x,q.z,.12);}
    if(C_.alpha){if(CH3.stage>=4&&d<10&&pp.x<C_.p.x+6)crawEmerge(C_);else if(CH3.stage>=4&&inBasin&&!C_.met){C_.state='stalk';C_.st=0;}}
    /* the others wake for someone wading - the deeper, the further off they hear it */
    else if(CH3.stage>=4&&CRAB.met){const R=8.5+10*sstep(.1,1,wade);if(d<R&&(wade>0||d<R*.8)){if(d<4.5)crawEmerge(C_);else{C_.state='stalk';C_.st=0;}}}}
  else if(C_.state==='stalk'){C_.st+=dt;wantY=fl+.1*s;C_.rear=damp(C_.rear,0,3,dt);C_.raise=damp(C_.raise,.2,3,dt);
    /* towards you through the deeper water where it can, a wake of rings where it goes */
    const go=V3(dx,0,dz).normalize();const ok=(a,mind)=>{const q=go.clone().applyAxisAngle(_cu,a);const x=C_.p.x+q.x*1.2*s,z=C_.p.z+q.z*1.2*s;return crawDep(x,z)>mind?q:null;};
    let q=null;for(const a of [0,.45,-.45,.9,-.9,1.4,-1.4]){q=ok(a,.35);if(q)break;}
    /* no deep way round: it walks over the shallows and the dyke itself */
    if(!q)for(const a of [0,.45,-.45,.9,-.9]){q=ok(a,-1.1);if(q)break;}
    if(q){face(Math.atan2(q.x,q.z),2.5);C_.v.addScaledVector(q,dt*(C_.alpha?4.5:5));}
    C_.wk-=dt;if(C_.wk<=0){C_.wk=.3;WATER.ring(C_.p.x,C_.p.z,.3*s);const sx=Math.cos(C_.yaw),sz=-Math.sin(C_.yaw);WATER.ring(C_.p.x+sx*.3*s-Math.sin(C_.yaw)*.4*s,C_.p.z+sz*.3*s-Math.cos(C_.yaw)*.4*s,.2*s);}
    if(d<18&&WR()<dt*.8)sfx.crab(WR()<.3?'bubble':'click',P3);
    if((d<6.5&&dep>.15)||d<4.2||(C_.st>25&&d<20))crawEmerge(C_);
    else if(C_.alpha){/* it does not lose you: if you get past it, it surfaces close by in the water ahead */
      if(C_.st>40||!inBasin&&pp.x<-790){let best=null,bd=-1;for(let i=0;i<60;i++){const a=WR()*6.28,r=wr(6,10),x=pp.x+Math.cos(a)*r,z=pp.z+Math.sin(a)*r;const dp=crawDep(x,z);if(dp>bd&&dp<1.5){bd=dp;best=V3(x,0,z);}}
        if(best&&bd>.2){crawPlace(C_,best.x,best.z,Math.atan2(pp.x-best.x,pp.z-best.z));C_.y=H(best.x,best.z)+.12*s;crawEmerge(C_);}else C_.st=0;}
      if(C_.state==='stalk'&&d>60&&!inBasin)C_.state='back';}
    else{if(wade<=0&&d>9){C_.lost+=dt;if(C_.lost>6){C_.state='back';C_.lost=0;}}else C_.lost=0;if(d>60)C_.state='back';}}
  else if(C_.state==='emerge'){C_.st+=dt;const k=C_.st;face(Math.atan2(dx,dz),5);C_.v.addScaledVector(V3(dx,0,dz).normalize(),dt*(k<.5?11:4));
    if(k>.3&&k<.45&&WR()<.3)WATER.splash(V3(C_.p.x,0,C_.p.z),1+.4*s);
    /* up out of the water into the threat display: front reared, claws spread wide and open */
    C_.rear=sstep(0,.35,k)*(1-.55*sstep(.8,1.25,k));C_.raise=Math.min(1,k*2.5);C_.spread=1-sstep(.9,1.3,k);C_.claws.forEach(c=>c.open=1);
    if(k>1.3){C_.state='hunt';C_.cool=.3;}}
  else if(C_.state==='hunt'){face(Math.atan2(dx,dz),3.5);C_.cool-=dt;C_.disp=Math.max(0,(C_.disp||0)-dt);
    /* close in, circling a little; now and then it stops and rears, claws spread, rasping */
    if(C_.disp>0)C_.v.multiplyScalar(Math.exp(-dt*3));
    else if(d>reach+.1){const go=V3(dx,0,dz).normalize(),side=V3(-go.z,0,go.x).multiplyScalar(Math.sin(C_.t*.9)*.45);C_.v.addScaledVector(go.add(side),dt*(d>6?8:6));}
    else C_.v.addScaledVector(V3(-dx,0,-dz).normalize(),dt*1.2);
    if(C_.disp<=0&&d>3&&d<9&&WR()<dt*.18){C_.disp=1.5;sfx.crab('screech',P3);}
    C_.rear=damp(C_.rear,C_.disp>0?.85:.15,4,dt);C_.spread=damp(C_.spread,C_.disp>0?1:0,4,dt);C_.raise=damp(C_.raise,C_.disp>0?1:.7,4,dt);
    C_.claws.forEach(c=>c.open=damp(c.open,C_.disp>0?1:.5+.5*Math.sin(C_.t*4+c.s),6,dt));
    if(d<reach+.35&&C_.cool<=0&&C_.disp<=0){C_.state='strike';C_.st=0;C_.hitDone=false;C_.snapped=false;sfx.crab('hiss',P3);}
    else if(!C_.alpha&&wade<=0&&d>reach+2){C_.lost+=dt;if(C_.lost>8){C_.state='back';C_.lost=0;}}else C_.lost=0;
    if(C_.state==='hunt'&&d>30)C_.state='back';}
  else if(C_.state==='strike'){C_.st+=dt;face(Math.atan2(dx,dz),6);const k=C_.st;C_.raise=1;C_.spread=damp(C_.spread,.25,6,dt);C_.rear=sstep(0,.4,k)*(1-sstep(.7,.9,k))*.9;C_.claws.forEach(c=>c.open=k<.42?1:0);
    C_.strike=k<.42?-.15*sstep(0,.42,k):k<.62?lerp(-.15,1,sstep(.42,.56,k)):lerp(1,0,sstep(.62,1,k));if(k>.42&&k<.62)C_.v.addScaledVector(V3(dx,0,dz).normalize(),dt*6);
    if(k>.44&&!C_.snapped){C_.snapped=true;sfx.crab('snap',P3);}
    if(k>.52&&!C_.hitDone){C_.hitDone=true;if(d<reach+.6&&S.state==='play'&&!S.held){const dmg=wr(20,28)*(s/2.1)*(S.equip.vest?.75:1);S.hp-=dmg;S.sinceDmg=0;S.killer='crab';sfx.hitFlesh(1.1);sfx.thud&&sfx.thud(.6);
        if(S.hp>0&&WR()<(C_.alpha?.42:.3)){crawGrab(C_);}
        else{player.vel.addScaledVector(V3(dx,0,dz).normalize(),5.5);player.pitch+=.12;player.yaw+=wr(-.15,.15);}}}
    if(C_.state==='strike'&&k>1.05){C_.state='hunt';C_.cool=wr(1.5,2.6);C_.strike=0;}}
  else if(C_.state==='grab'){C_.st+=dt;face(Math.atan2(dx,dz),6);C_.raise=1;C_.spread=0;C_.rear=damp(C_.rear,.3,4,dt);C_.strike=damp(C_.strike,.3,4,dt);C_.claws.forEach(c=>c.open=c===C_.gc?0:damp(c.open,1,5,dt));
    /* it walks backwards into the deep with you */
    if(!C_.deepD||C_.st%.8<dt){let best=null,bd=-9;for(let i=0;i<10;i++){const a=i/10*6.28,x=C_.p.x+Math.sin(a)*3,z=C_.p.z+Math.cos(a)*3;const dp=crawDep(x,z);if(dp<1.55&&dp>bd){bd=dp;best=V3(Math.sin(a),0,Math.cos(a));}}C_.deepD=best||V3(-dx,0,-dz).normalize();}
    C_.v.addScaledVector(C_.deepD,dt*2.4);const fw=V3(Math.sin(C_.yaw),0,Math.cos(C_.yaw));
    if(S.held&&S.held.by===C_){S.held.x=C_.p.x+fw.x*reach*.8;S.held.z=C_.p.z+fw.z*reach*.8;}
    if(S.state==='play'){S.hp-=dt*(8*(S.equip.vest?.8:1)+(wade>1.05?6:0));S.sinceDmg=0;S.killer='crab';
      /* your head is dragged round and down to it, shaking */
      let wy=Math.atan2(dx,dz)-player.yaw;wy=Math.atan2(Math.sin(wy),Math.cos(wy));player.yaw+=wy*clamp(dt*4,0,1)+wr(-.025,.025);player.pitch=damp(player.pitch,-.62,3,dt)+wr(-.02,.02);}
    C_.crT=(C_.crT||0)-dt;if(C_.crT<=0){C_.crT=wr(.5,.9);sfx.crab('crunch',V3(pp.x,groundY(pp.x,pp.z)+.9,pp.z));}
    if(C_.hurtN>C_.hurt0)crawRelease(C_,false);else if(C_.st>4||S.state!=='play'||!S.held)crawRelease(C_,C_.st>4);}
  else if(C_.state==='flinch'){C_.st+=dt;C_.v.addScaledVector(V3(-dx,0,-dz).normalize(),dt*6);C_.rear=Math.sin(Math.min(1,C_.st*3)*Math.PI)*.8;if(C_.st>.45){C_.state='hunt';C_.cool=Math.max(C_.cool,.4);}}
  else if(C_.state==='flip'){C_.st+=dt;const k=C_.st;
    /* the tail snaps under and it shoots backwards, claws trailing, fan spread */
    C_.tuck=k<.3?sstep(0,.1,k):1-sstep(.3,.7,k);C_.fan=1-sstep(.6,1,k);C_.raise=damp(C_.raise,0,8,dt);C_.spread=0;C_.rear=damp(C_.rear,0,8,dt);
    if(k<.42)C_.v.copy(C_.flipD).multiplyScalar(14*(1-k/.42)+3);if(k>.1&&k<.4&&WR()<dt*20)WATER.ring(C_.p.x,C_.p.z,.4*s);
    if(k>1.1){C_.state='hunt';C_.cool=.6;C_.tuck=0;C_.fan=0;}}
  else if(C_.state==='back'){if(C_.alpha&&!C_.met&&inBasin){C_.state='stalk';C_.st=0;}
    else{const h=C_.home||C_.lurk||C_.p,tx=h.x-C_.p.x,tz=h.z-C_.p.z,dd=Math.hypot(tx,tz);face(Math.atan2(tx,tz),3);C_.raise=damp(C_.raise,.2,2,dt);C_.spread=0;C_.rear=damp(C_.rear,0,2,dt);
      if(dd>.8)C_.v.addScaledVector(V3(tx,0,tz).normalize(),dt*5);else C_.state='lurk';
      if(d<12&&(C_.alpha||wade>0))C_.state='hunt';}}
  else if(C_.state==='dead'){C_.st+=dt;
    /* dead on the bank or in the shallows it settles with the legs drawn in a little, the tail half under, canted onto one
       side; where the water is deeper than it is tall it rolls and floats belly up, the legs folded up into the air */
    const fl_=dep>.13*s;C_.floatD=fl_;C_.curl=fl_?Math.min(1,C_.curl+dt*.45):Math.min(.32,C_.curl+dt*.3);C_.tuck=Math.min(.55,C_.tuck+dt*.4);C_.roll=damp(C_.roll,fl_?Math.PI*.9:.22,fl_?1.1:1.5,dt);C_.raise=damp(C_.raise,0,2,dt);C_.rear=damp(C_.rear,0,2,dt);C_.spread=damp(C_.spread,0,2,dt);C_.strike=0;C_.fan=0;
    C_.claws.forEach(c=>c.open=damp(c.open,.2,2,dt));wantY=fl_?W3.wl+.012*s:fl+.06*s;if(!fl_&&C_.st<3&&WR()<dt*6){const L=C_.legs[Math.floor(WR()*8)];L.foot.y+=.02*s;}}
  /* move: stay in the basin, not into the deepest holes or far up the dry bank; off the player and off each other */
  if(C_.state!=='dead'){const sp=C_.v.length(),mx=C_.state==='flip'?16:C_.state==='emerge'?6:C_.state==='grab'?1.4:C_.state==='stalk'?3.4:C_.alpha?4.6:4.2;if(sp>mx)C_.v.multiplyScalar(mx/sp);
    const nx=C_.p.x+C_.v.x*dt,nz=C_.p.z+C_.v.z*dt;if(inDET(nx,nz)&&W3.wl-H(nx,nz)<1.6&&H(nx,nz)<W3.wl+1.2){C_.p.x=nx;C_.p.z=nz;}else C_.v.multiplyScalar(.2);
    if(C_.state!=='grab'){const R=.62*s+.3,od=Math.hypot(C_.p.x-pp.x,C_.p.z-pp.z);if(od<R&&od>1e-4){C_.p.x=pp.x+(C_.p.x-pp.x)/od*R;C_.p.z=pp.z+(C_.p.z-pp.z)/od*R;}}
    for(const o of CRAWS)if(o!==C_&&o.state!=='off'){const ex=C_.p.x-o.p.x,ez=C_.p.z-o.p.z,dd=Math.hypot(ex,ez),R=.42*(s+o.s);if(dd<R&&dd>1e-4){C_.p.x+=ex/dd*(R-dd)*.5;C_.p.z+=ez/dd*(R-dd)*.5;}}
    if(C_.state!=='lurk'&&W3.wl>fl&&C_.v.length()>.6&&WR()<dt*6)WATER.ring(C_.p.x,C_.p.z,.3*s);}
  if(crawLive(C_)&&C_.state!=='flip')wantY=Math.max(wantY,W3.wl-.02*s);
  C_.y=damp(C_.y||wantY,wantY,C_.state==='emerge'||C_.state==='flip'?6:4,dt);
  crawStep(C_,dt);crawPose(C_,dt);}
/* all of them, and the ones that come for whoever wades deep */
function crabTick(dt){if(CRAB.state==='off'){if(CH3.stage>=3)crabInit();return;}
  for(const C_ of CRAWS)crawTick(C_,dt);
  if(S.held&&(S.held.by.state!=='grab'||S.state!=='play'))S.held=null;
  const pp=player.pos,w=S.wade||0;
  /* your heart, when one is coming for you under the water */
  {let nd=99;for(const C_ of CRAWS)if(C_.state==='stalk'||(crawLive(C_)&&w>0))nd=Math.min(nd,C_.dist);CRAWK.hbT-=dt;if(nd<14&&CRAWK.hbT<=0){CRAWK.hbT=lerp(.5,1.05,nd/14);sfx.heart();}}
  /* out in the deep water more of them come: a body not yet used, or a dead one long out of sight, starts again
     somewhere behind you in the deep and comes on under the water */
  CRAWK.spT-=dt;const inBasin=inDET(pp.x,pp.z)&&pp.x<-712&&pp.x>-858;
  if(!CRAB.met||CH3.stage<4||!inBasin||CRAWK.spT>0)return;
  if(CRAWS.filter(crawAct).length>=(w>.5?3:2))return;if(WR()>=(.02+.08*sstep(.3,1.1,w))*dt)return;
  const cf=camera.getWorldDirection(V3());const seen=C_=>{const v=V3(C_.p.x,C_.y,C_.p.z).sub(camera.position);return v.length()<80&&v.normalize().dot(cf)>.25;};
  const free=CRAWS.find(C_=>!C_.alpha&&C_.state==='off')||CRAWS.find(C_=>!C_.alpha&&C_.state==='dead'&&C_.dist>45&&!seen(C_))||CRAWS.find(C_=>!C_.alpha&&C_.state==='lurk'&&C_.dist>35&&!seen(C_));
  if(!free)return;
  for(let i=0;i<50;i++){const a=player.yaw+wr(-1.6,1.6),r=wr(13,22),x=pp.x+Math.sin(a)*r,z=pp.z+Math.cos(a)*r;const dp=crawDep(x,z);
    if(dp<.75||dp>1.5||CRAWS.some(o=>o!==free&&o.state!=='off'&&Math.hypot(o.p.x-x,o.p.z-z)<7))continue;
    crawReset(free,x,z,Math.atan2(pp.x-x,pp.z-z),'stalk');free.met=true;CRAWK.spT=w>.5?10:16;sfx.crab('bubble',V3(x,W3.wl,z));return;}}
/* hit: in the face it hurts most; the shell, tail and claws are armour. Badly hurt, it flips away and comes again */
function crawShot(C_,m,p,dir){if(C_.state==='dead'||C_.state==='off')return;crabBlood(p,dir);if(dP3(p)<40)sfx.hitFlesh(.6);
  const part=m.userData.part,dmg=part==='face'?3:part==='claw'?.5:1;if(part!=='face')fxImpact(p,dir.clone().negate(),'metal');
  C_.hp-=dmg;C_.hurtN++;C_.recent+=dmg;C_.recentT=.9;if(C_.hp<=0){crawKill(C_);return;}
  if(C_.state==='grab')crawRelease(C_,false);
  if(C_.state==='lurk'||C_.state==='stalk'||C_.state==='back'){crawEmerge(C_);return;}
  if(C_.state==='flip'||C_.state==='emerge')return;
  if(C_.recent>=3||(C_.hp<C_.hp0*.4&&WR()<.35)){C_.recent=0;crawFlip(C_);return;}
  C_.state='flinch';C_.st=0;sfx.crab('hiss',V3(C_.p.x,Math.max(W3.wl,C_.y),C_.p.z));}
/* the round that went into the water near one wakes it */
function crabWater(x,z){for(const C_ of CRAWS)if(C_.state==='lurk'&&Math.hypot(x-C_.p.x,z-C_.p.z)<7&&(C_.alpha||CRAB.met))crawEmerge(C_);}
function crabBlood(p,dir){for(let i=0;i<9;i++){const v=dir.clone().normalize().multiplyScalar(-wr(.3,1.4)).add(V3(wr(-.6,.6),wr(.2,1),wr(-.6,.6)));FX.blood.spawn(p,v,wr(.3,.6),wr(.02,.04),wr(.08,.16),[.55,.62,.6,.8],[.5,.58,.58,0],{g:4,drag:2.5,fi:0});}}
function crawKill(C_,silent){if(C_.state==='dead')return;if(C_.alpha&&C_.state==='off')crabInit();if(S.held&&S.held.by===C_)crawRelease(C_,false);C_.state='dead';C_.dead=true;C_.st=silent?9:0;C_.v.set(0,0,0);crawHitOff(C_);
  if(silent){const fh=H(C_.p.x,C_.p.z),fl_=W3.wl-fh>.13*C_.s;C_.floatD=fl_;C_.curl=fl_?1:.32;C_.tuck=.55;C_.raise=C_.rear=C_.spread=0;C_.roll=fl_?Math.PI*.9:.22;C_.y=fl_?W3.wl+.012*C_.s:fh+.06*C_.s;C_.g.visible=C_.legG.visible=true;crawPose(C_,0);return;}sfx.crab('die',V3(C_.p.x,Math.max(W3.wl,C_.y),C_.p.z));}
function crabKill(silent){crawKill(CRAB,silent);}
/* ---------- low mist: soft sheets drifting over the wet ground in the fog, drawn when the scripted fog is in ---------- */
const MIST=(()=>{const pts=[];const r=rng(77);
  for(let i=0;i<70;i++){const x=-652-r()*50,z=-470+r()*200;pts.push([x,H(x,z)+.5+r()*1.4,z,9+r()*10]);}
  for(let i=0;i<110;i++){const x=-704-r()*170,z=-480+r()*220;const y=Math.max(W3.wl,H(x,z))+.35+r()*1.6;pts.push([x,y,z,10+r()*12]);}
  const N=pts.length,base=new T.PlaneGeometry(1,1),g=new T.InstancedBufferGeometry();g.index=base.index;g.setAttribute('position',base.attributes.position);g.setAttribute('uv',base.attributes.uv);
  const A=new Float32Array(N*4),Ph=new Float32Array(N);pts.forEach((p,i)=>{A.set(p,i*4);Ph[i]=r()*6.28;});g.setAttribute('aC',new T.InstancedBufferAttribute(A,4));g.setAttribute('aP',new T.InstancedBufferAttribute(Ph,1));g.instanceCount=N;
  const m=new T.ShaderMaterial({transparent:true,depthWrite:false,fog:true,uniforms:T.UniformsUtils.merge([T.UniformsLib.fog,{map:{value:PTEX.smoke},uA:{value:0},uT:{value:0},uCol:{value:C(0xb4bab4)}}]),
    vertexShader:`attribute vec4 aC;attribute float aP;uniform float uT;varying vec2 vUv;varying float vF;
      #include <fog_pars_vertex>
      void main(){vUv=uv;vec3 c=aC.xyz+vec3(sin(uT*.03+aP)*4.,sin(uT*.2+aP)*.15,cos(uT*.025+aP*1.3)*3.);vec4 mvPosition=viewMatrix*vec4(c,1.);
        float rot=aP+uT*.01;vec2 q=mat2(cos(rot),-sin(rot),sin(rot),cos(rot))*position.xy;mvPosition.xy+=q*aC.w*vec2(1.,.42);
        vF=smoothstep(3.,12.,-mvPosition.z);gl_Position=projectionMatrix*mvPosition;vec3 transformed=c;
        #include <fog_vertex>
      }`,
    fragmentShader:`uniform sampler2D map;uniform float uA;uniform vec3 uCol;varying vec2 vUv;varying float vF;
      #include <fog_pars_fragment>
      void main(){float a=texture2D(map,vUv).a*uA*vF*.32;if(a<.003)discard;gl_FragColor=vec4(uCol,a);
        #include <fog_fragment>
      }`});
  const mesh_=new T.Mesh(g,m);mesh_.frustumCulled=false;mesh_.renderOrder=7;mesh_.visible=false;scene.add(mesh_);return{mesh:mesh_,m};})();
function mistTick(dt){const a=WEATHER.mist||0;MIST.mesh.visible=a>.02&&camera.position.x<-560;MIST.m.uniforms.uA.value=a;MIST.m.uniforms.uT.value=S.t;
  MIST.m.uniforms.uCol.value.copy(scene.fog.color).multiplyScalar(1.12);}
