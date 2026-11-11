/* ---------- two enduro bikes (Sharmax 280-style: 21/18-inch spoked wheels, air-cooled single, high front fender,
   number-plate headlight, slim seat, silver can), black plastics caked in dried mud, leaning on the south wall of the
   lumber-yard cabin - the second one leant against the first ---------- */
(function motos(){const r_=rng(2808),rr=(a,b)=>a+(b-a)*r_();
  /* mud: dried grey-brown crust thrown up from the wheels - a light coat on the upper plastics, a heavy one low down */
  const mudTex=(seed,base,amt)=>tex(512,512,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);const q=rng(seed);
    /* fine dust */for(let i=0;i<9000*amt;i++){c.fillStyle=`rgba(${120+q()*40|0},${104+q()*30|0},${80+q()*20|0},${.05+q()*.12})`;c.fillRect(q()*w,q()*h,1+q()*2,1+q()*2);}
    /* splashes: a blob with satellite droplets, darker where still damp, paler cracked crust where dry */
    for(let i=0;i<180*amt;i++){const x=q()*w,y=q()*h,r=3+q()*16*amt,dry=q()<.6;
      for(const ox of [0,-w,w])for(const oy of [0,-h,h]){c.fillStyle=dry?`rgba(${118+q()*30|0},${100+q()*24|0},${74+q()*16|0},${.55+q()*.35})`:`rgba(${62+q()*20|0},${50+q()*14|0},${36+q()*10|0},${.6+q()*.3})`;
        c.beginPath();for(let k=0;k<=14;k++){const a=k/14*6.283,rk=r*(.7+.5*Math.sin(a*3+i)*Math.sin(a*5+i*2));c.lineTo(x+ox+Math.cos(a)*rk,y+oy+Math.sin(a)*rk);}c.fill();
        for(let k=0;k<6;k++){const a=q()*6.283,d=r*(1.2+q()*1.6);c.beginPath();c.arc(x+ox+Math.cos(a)*d,y+oy+Math.sin(a)*d,.8+q()*2.4,0,7);c.fill();}}}
    /* streaks where water ran down through it */c.strokeStyle='rgba(20,18,16,.35)';for(let i=0;i<60*amt;i++){const x=q()*w,y=q()*h;c.lineWidth=1+q()*2;c.beginPath();c.moveTo(x,y);c.lineTo(x+(q()-.5)*6,y+20+q()*60);c.stroke();}});
  const mL=mudTex(281,'#141414',.7),mH=mudTex(282,'#1a1816',1.6),mT=mudTex(283,'#141210',.9);
  /* (a film of dried dust over all of it: matte, no plastic sheen against the light) */const PL=std({map:mL,roughness:.9,metalness:0,envMapIntensity:.22}),PH=std({map:mH,roughness:.85,envMapIntensity:.3}),
    FR=std({map:mH,color:C(0x8a8a8a),roughness:.55,metalness:.6,envMapIntensity:.45}),
    AL=std({map:mL,color:C(0xb8b8b4),roughness:.42,metalness:.85,envMapIntensity:.6}),
    CH=std({color:C(0x9a9c9e),roughness:.18,metalness:1,envMapIntensity:.9}),
    RU=std({map:mT,color:C(0x8c8c8c),roughness:.95,envMapIntensity:.15,side:T.DoubleSide}),
    SE=std({map:mL,color:C(0x8a8a8a),roughness:.75,envMapIntensity:.3}),
    LENS=std({color:C(0xb8bcc0),roughness:.08,metalness:.2,envMapIntensity:1.1}),RED=std({color:C(0x6a0e0c),roughness:.2,emissive:C(0x200000),envMapIntensity:.8});
  /* caked mud: packed in the tread and the wheel wells, dried pale on top, still dark and damp underneath */
  const mudT=tex(256,256,(c,w,h)=>{c.fillStyle='#6e5c44';c.fillRect(0,0,w,h);const q=rng(2899);for(let i=0;i<5200;i++){const k=q();c.fillStyle=k<.4?`rgba(${96+q()*30|0},${80+q()*24|0},${58+q()*16|0},.8)`:k<.75?`rgba(${54+q()*16|0},${42+q()*12|0},${30+q()*8|0},.85)`:`rgba(${130+q()*30|0},${114+q()*24|0},${86+q()*16|0},.6)`;
    c.beginPath();c.arc(q()*w,q()*h,1+q()*4,0,7);c.fill();}
    c.strokeStyle='rgba(30,24,18,.6)';c.lineWidth=1;for(let i=0;i<70;i++){let x=q()*w,y=q()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(q()-.5)*24;y+=(q()-.5)*24;c.lineTo(x,y);}c.stroke();}});
  const MUD=std({map:mudT,color:C(0xd8ccb8),roughness:1,envMapIntensity:.1});
  [PL,PH,FR,AL,RU,SE,MUD].forEach(m=>{m.defines=m.defines||{};m.defines.NO_PUDDLE='';});MUD.defines.DRY_MATTE='';[PL,PH,RU,SE].forEach(m=>{m.defines.DRY_MATTE='';});
  /* (texture laid on by world scale, each face projected along its own axis) */
  const uvW=(g,s=2.2)=>{g=g.index?g.toNonIndexed():g;if(!g.attributes.normal)g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,uv=new Float32Array(p.count*2);
    for(let i=0;i<p.count;i+=3){const nx=Math.abs(n.getX(i)+n.getX(i+1)+n.getX(i+2)),ny=Math.abs(n.getY(i)+n.getY(i+1)+n.getY(i+2)),nz=Math.abs(n.getZ(i)+n.getZ(i+1)+n.getZ(i+2));
      for(let k=i;k<i+3;k++){const x=p.getX(k),y=p.getY(k),z=p.getZ(k);let u,v;if(nx>=ny&&nx>=nz){u=z;v=y;}else if(ny>=nz){u=x;v=z;}else{u=x;v=y;}uv[k*2]=u*s;uv[k*2+1]=v*s;}}
    g.setAttribute('uv',new T.BufferAttribute(uv,2));return g;};
  const P=[];const add=(g,m,M)=>{if(M)g.applyMatrix4(M);P.push([uvW(g),m]);};
  const tube=(a,b,r,m,seg=10)=>{const d=b.clone().sub(a),L=d.length();const g=new T.CylinderGeometry(r,r,L,seg);g.translate(0,L/2,0);
    const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize());g.applyMatrix4(new T.Matrix4().compose(a,q,V3(1,1,1)));add(g,m);};
  const curve=(pts,r,m,n=24,rs=8)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(...p))),n,r,rs,false),m);
  /* side-profile part: an outline in x,y extruded across z */
  const prof=(pts,w,m,z=0,bev=.012)=>{const g=ext(pts,w,{bevel:bev,bsize:.9,bseg:3,cseg:8});g.translate(0,0,z);add(g,m);};
  const RA=V3(.1,.33,0),FA=V3(1.56,.355,0),SP=V3(.66,.5,0);
  const rake=Math.atan2(.25,.49);/* fork axis: up and back */const fk=V3(-Math.sin(rake),Math.cos(rake),0);
  /* ---- wheels: knobbly tyre, rim, hub, 36 spokes, disc ---- */
  const wheel=(c,R,rim,wd,front)=>{const M=new T.Matrix4().makeRotationX(Math.PI/2).setPosition(c);
    const prof_=[];for(let k=0;k<=16;k++){const a=-Math.PI/2+k/16*Math.PI,rad=rim+(R-.012-rim)*(.55+.45*Math.cos(a*.9));prof_.push([rad+(k===0||k===16?0:.0),Math.sin(a)*wd/2]);}
    {const g=lathe([[rim,-wd*.42],...prof_.map(p=>[Math.max(rim,p[0]),p[1]]),[rim,wd*.42]],56);add(g,RU,M);}
    /* knobs: staggered blocks in three rows round the tread */
    const nk=front?44:40;for(let i=0;i<nk;i++){const a=i/nk*6.283;for(const [zz,off] of [[0,0],[-wd*.36,.5],[wd*.36,.5]]){const aa=a+off/nk*6.283;
      const g=new T.BoxGeometry(.026,.02,zz?.022:.03);g.translate(0,R-.006,0);g.rotateZ(aa);g.translate(0,0,zz);add(g,RU,new T.Matrix4().setPosition(c));}}
    {const g=new T.TorusGeometry(rim,.011,6,48);add(g,FR,new T.Matrix4().setPosition(c));
     const g2=new T.CylinderGeometry(rim+.008,rim+.008,wd*.42,48,1,true);g2.rotateX(Math.PI/2);add(g2,FR,new T.Matrix4().setPosition(c));}
    {const g=new T.CylinderGeometry(.045,.045,.13,16);g.rotateX(Math.PI/2);add(g,AL,new T.Matrix4().setPosition(c));}
    for(let i=0;i<36;i++){const sd=i%2?1:-1,a=i/36*6.283,a2=a+(i%4<2?.5:-.5);const h=V3(c.x+Math.cos(a)*.04,c.y+Math.sin(a)*.04,sd*.05),e=V3(c.x+Math.cos(a2)*(rim-.008),c.y+Math.sin(a2)*(rim-.008),sd*.012);tube(h,e,.0019,FR,4);}
    /* brake disc: front on the left, rear on the right; the rear sprocket on the left */
    {const g=new T.CylinderGeometry(front?.135:.11,front?.135:.11,.005,40);g.rotateX(Math.PI/2);g.translate(0,0,front?-.075:.075);add(g,CH,new T.Matrix4().setPosition(c));}
    if(!front){const g=new T.CylinderGeometry(.105,.105,.007,46);g.rotateX(Math.PI/2);g.translate(0,0,-.078);add(g,FR,new T.Matrix4().setPosition(c));
      /* sprocket teeth */for(let i=0;i<46;i++){const a=i/46*6.283;const t_=new T.BoxGeometry(.012,.012,.007);t_.translate(0,.109,0);t_.rotateZ(a);t_.translate(0,0,-.078);add(t_,FR,new T.Matrix4().setPosition(c));}}
    /* the disc's drilled holes and its carrier bolts; hub flanges; spoke nipples; the axle nut */
    {const dz=front?-.078:.078,dr=front?.135:.11;for(let i=0;i<18;i++){const a=i/18*6.283,rr_=dr*.78;const hg=new T.CylinderGeometry(.006,.006,.008,8);hg.rotateX(Math.PI/2);hg.translate(c.x+Math.cos(a)*rr_,c.y+Math.sin(a)*rr_,dz);add(hg,PH);}
     for(let i=0;i<6;i++){const a=i/6*6.283;const b=new T.CylinderGeometry(.007,.007,.012,6);b.rotateX(Math.PI/2);b.translate(c.x+Math.cos(a)*.055,c.y+Math.sin(a)*.055,dz);add(b,AL);}}
    for(const sd of [-1,1]){const f=new T.CylinderGeometry(.062,.062,.008,24);f.rotateX(Math.PI/2);f.translate(c.x,c.y,sd*.05);add(f,AL);
      const nut=new T.CylinderGeometry(.016,.016,.014,6);nut.rotateX(Math.PI/2);nut.translate(c.x,c.y,sd*.072);add(nut,CH);}
    for(let i=0;i<36;i++){const a=i/36*6.283+(i%4<2?.5:-.5);const n_=new T.CylinderGeometry(.004,.004,.012,6);n_.translate(0,rim-.012,0);n_.rotateZ(a-Math.PI/2);n_.translate(c.x,c.y,(i%2?1:-1)*.012);add(n_,CH);}
    {const v=new T.CylinderGeometry(.004,.004,.03,6);v.translate(0,rim-.02,0);v.rotateZ(.4);v.translate(c.x,c.y,0);add(v,AL);}
    /* raised lettering band on the sidewall */for(const sd of [-1,1]){const g=new T.TorusGeometry(rim+(R-rim)*.45,.0035,4,64);g.translate(c.x,c.y,sd*wd*.43);add(g,RU);}
    /* mud: packed between the knobs all round, thickest at the bottom where the bike stood in it, and clods on the rim and
       the lower spokes */
    {const mr=lathe([[rim+.004,-wd*.4],[R-.012,-wd*.5],[R-.002,-wd*.2],[R-.002,wd*.2],[R-.012,wd*.5],[rim+.004,wd*.4]],56);const q=mr.attributes.position;
     for(let i=0;i<q.count;i++){const x=q.getX(i),z=q.getZ(i),y=q.getY(i);const a=Math.atan2(z,x);const n=n3(x*40+c.x*7,y*40,z*40);const k=1+(n-.5)*.035+.012*Math.max(0,Math.sin(a+.6));q.setXYZ(i,x*k,y*(1+(n-.5)*.4),z*k);}
     mr.computeVertexNormals();add(mr,MUD,M);}
    for(let i=0;i<70;i++){const a=rr(0,6.283),bot=Math.sin(a)<-.1;if(!bot&&r_()<.5)continue;const rad=bot?rr(rim-.06,R-.005):rr(rim-.02,rim+.01);const cl=new T.DodecahedronGeometry(rr(.008,bot?.024:.014),0);
      cl.scale(1,rr(.6,1),rr(.8,1.4));cl.translate(c.x+Math.cos(a)*rad,c.y+Math.sin(a)*rad,rr(-wd*.45,wd*.45));add(cl,MUD);}};
  wheel(FA,.35,.268,.085,true);wheel(RA,.33,.228,.105,false);
  /* ---- forks: black stanchions in the clamps, alloy sliders, plastic guards; the clamps; the bars ---- */
  const top=V3(1.19,1.09,0),bot=V3(1.285,.865,0);
  for(const sd of [-1,1]){const zf=sd*.088;const a=V3(top.x+fk.x*.04,top.y+fk.y*.04,zf),m_=V3(FA.x-fk.x*.29,FA.y+fk.y*.29,zf),b=V3(FA.x+fk.x*.03,FA.y-.02,zf);
    tube(m_,a,.024,FR,14);tube(V3(b.x,b.y,zf),m_.clone().addScaledVector(fk,.05),.03,AL,14);
    {const g=rbox(.05,.26,.03,.01);g.translate(0,.13,0);const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),fk);const p=V3(FA.x-fk.x*.05+.02,FA.y+.05,zf+sd*.006);g.applyMatrix4(new T.Matrix4().compose(p,q,V3(1,1,1)));add(g,PH);}}
  for(const [p,w] of [[top,.03],[bot,.035]]){const g=rbox(.09,w,.25,.008);const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),fk);g.applyMatrix4(new T.Matrix4().compose(p,q,V3(1,1,1)));add(g,AL);}
  tube(bot,top.clone().addScaledVector(fk,.02),.03,FR,12);
  curve([[1.15,1.17,-.4],[1.17,1.19,-.28],[1.2,1.15,-.1],[1.2,1.15,.1],[1.17,1.19,.28],[1.15,1.17,.4]],.012,FR,30,8);
  for(const sd of [-1,1]){tube(V3(1.165,1.18,sd*.3),V3(1.15,1.172,sd*.43),.017,SE,10);
    /* handguard: a curved plastic shell round the grip */curve([[1.2,1.16,sd*.24],[1.3,1.16,sd*.34],[1.27,1.18,sd*.45],[1.16,1.18,sd*.46]],.02,PL,16,6);
    tube(V3(1.19,1.17,sd*.26),V3(1.24,1.15,sd*.38),.005,AL,6);}
  {const g=rbox(.05,.04,.18,.015);g.translate(1.2,1.2,0);add(g,SE);}
  /* ---- number-plate headlight and the high front fender ---- */
  {const g=ext([[-.105,.0],[.105,.0],[.11,.2],[.07,.31],[-.07,.31],[-.11,.2]],.03,{bevel:.008,bsize:.9,bseg:2});
   g.rotateY(Math.PI/2);g.rotateZ(rake);g.translate(1.36,.86,0);add(g,PL);
   const L_=rbox(.03,.08,.11,.012);L_.rotateZ(rake);L_.translate(1.375,1.0,0);add(L_,LENS);}
  prof([[1.33,.88],[1.5,.93],[1.7,.95],[1.88,.92],[1.9,.9],[1.7,.915],[1.5,.905],[1.36,.86]],.12,PH);
  /* ---- frame: steel, black, a cradle under the engine ---- */
  for(const sd of [-1,1]){const z=sd*.055;curve([[1.22,.99,z*.4],[1.0,.93,z],[.76,.86,z*1.2],[.68,.72,z*1.3],[.66,.52,z*1.3]],.016,FR,24,8);
    curve([[1.27,.87,z*.4],[1.17,.6,z],[1.08,.34,z],[.9,.27,z],[.72,.3,z],[.66,.46,z*1.3]],.014,FR,24,8);
    curve([[.76,.86,z*1.6],[.4,.93,z*1.7],[-.1,1.0,z*1.6]],.011,FR,18,6);tube(V3(.68,.66,z*1.4),V3(.25,.93,z*1.7),.01,FR,6);}
  /* ---- engine: crankcase, finned barrel tipped forward, head, the side covers, carb ---- */
  {const g=rbox(.38,.27,.25,.05);g.translate(.86,.45,0);add(g,AL);
   const ax=V3(Math.sin(.28),Math.cos(.28),0);for(let i=0;i<9;i++){const g2=rbox(.17,.012,.17,.004);g2.rotateZ(-.28);const p=V3(.95,.6,0).addScaledVector(ax,.015+i*.024);g2.translate(p.x,p.y,p.z);add(g2,i%2?AL:PH);}
   const cyl=new T.CylinderGeometry(.055,.055,.22,16);cyl.rotateZ(-.28);cyl.translate(.98,.69,0);add(cyl,FR);
   const hd=rbox(.17,.07,.18,.02);hd.rotateZ(-.28);hd.translate(1.03,.84,0);add(hd,AL);
   const cv=new T.CylinderGeometry(.11,.115,.03,28);cv.rotateX(Math.PI/2);cv.translate(.8,.44,-.135);add(cv,AL);
   const cv2=new T.CylinderGeometry(.12,.12,.035,28);cv2.rotateX(Math.PI/2);cv2.translate(.88,.47,.135);add(cv2,AL);
   const cb=new T.CylinderGeometry(.03,.03,.1,10);cb.rotateZ(Math.PI/2);cb.translate(.86,.76,0);add(cb,AL);tube(V3(.81,.76,0),V3(.66,.84,0),.03,SE,10);}
  /* ---- exhaust: the header out of the front of the head, down, round to the left, back up to the silver can ---- */
  curve([[1.07,.79,0],[1.15,.66,-.02],[1.12,.46,-.09],[.95,.4,-.15],[.66,.45,-.16],[.46,.62,-.17],[.36,.72,-.17]],.019,FR,40,10);
  {const g=new T.CylinderGeometry(.055,.055,.46,20);const a=V3(.38,.71,-.17),b=V3(-.06,.88,-.17);const q=new T.Quaternion().setFromUnitVectors(V3(0,1,0),b.clone().sub(a).normalize());g.translate(0,.23,0);g.applyMatrix4(new T.Matrix4().compose(a,q,V3(1,1,1)));add(g,AL);
   tube(b,b.clone().add(V3(-.04,.015,0)),.02,FR,10);}
  /* ---- tank, shrouds, seat, side panels, tail ---- */
  prof([[.7,.9],[.72,1.0],[.95,1.075],[1.12,1.05],[1.16,.96],[1.1,.88]],.27,PL,0,.03);
  for(const sd of [-1,1])prof([[1.19,1.05],[1.0,1.05],[.8,.97],[.77,.84],[.95,.76],[1.17,.79]],.02,PL,sd*.15,.008);
  prof([[.18,.92],[.2,.985],[.6,.995],[.95,1.03],[1.03,1.0],[.98,.95],[.3,.9]],.21,SE,0,.03);
  for(const sd of [-1,1])prof([[.12,.89],[.55,.91],[.63,.73],[.42,.62],[.14,.72]],.018,PL,sd*.125,.006);
  prof([[.22,.91],[-.1,.97],[-.36,1.02],[-.42,1.01],[-.3,.97],[.2,.875]],.17,PH,0,.012);
  {const g=rbox(.03,.035,.09,.008);g.translate(-.41,1.0,0);add(g,RED);}
  {const g=rbox(.006,.12,.16,.004);g.rotateZ(-.4);g.translate(-.4,.93,0);add(g,PH);}
  /* ---- swingarm, chain, shock, pegs, levers, stand ---- */
  for(const sd of [-1,1]){const g=rbox(.58,.05,.03,.01);g.rotateZ(Math.atan2(SP.y-RA.y,SP.x-RA.x));g.translate((SP.x+RA.x)/2,(SP.y+RA.y)/2,sd*.085);add(g,PH);}
  tube(V3(.44,.43,-.09),V3(.44,.43,.09),.018,PH,8);
  {const fs=V3(.72,.45,-.085),rs=V3(RA.x,RA.y,-.085);for(const [dy1,dy2] of [[.04,.104],[-.04,-.104]])tube(V3(fs.x,fs.y+dy1,fs.z),V3(rs.x,rs.y+dy2,rs.z),.006,FR,4);}
  {const a=V3(.4,.46,0),b=V3(.6,.88,0);tube(a,b,.024,FR,12);const d=b.clone().sub(a),L=d.length();d.normalize();const pts=[];const n0=V3(0,0,1),n1=d.clone().cross(n0).normalize();
   for(let i=0;i<=120;i++){const t=i/120,an=t*6.283*8;pts.push(a.clone().addScaledVector(d,.04+t*(L-.1)).addScaledVector(n0,Math.cos(an)*.036).addScaledVector(n1,Math.sin(an)*.036));}
   add(new T.TubeGeometry(new T.CatmullRomCurve3(pts),240,.0055,5,false),AL);}
  for(const sd of [-1,1]){const g=rbox(.09,.022,.055,.006);g.translate(.62,.42,sd*.17);add(g,FR);}
  tube(V3(.7,.44,-.1),V3(.82,.47,-.16),.007,FR,6);tube(V3(.58,.44,.1),V3(.72,.43,.16),.008,FR,6);
  tube(V3(.58,.36,-.1),V3(.3,.36,-.14),.012,FR,8);
  /* ---- brake calipers on the discs, the hoses up to the bar and the rear master; throttle and clutch cables ---- */
  {const cf=rbox(.05,.075,.04,.012);cf.translate(FA.x-.07,FA.y+.1,-.1);add(cf,PH);const cr=rbox(.05,.065,.035,.01);cr.translate(RA.x+.075,RA.y+.07,.1);add(cr,PH);
   curve([[FA.x-.07,FA.y+.15,-.11],[1.33,.75,-.13],[1.27,1.0,-.14],[1.2,1.17,-.2]],.004,PH,20,5);
   curve([[1.2,1.17,.26],[1.25,1.06,.2],[1.15,.93,.12],[.9,.78,.06]],.0035,PH,24,5);
   curve([[1.2,1.17,-.27],[1.26,1.05,-.2],[1.14,.95,-.1],[.95,.62,-.11]],.0035,PH,24,5);
   curve([[RA.x+.08,RA.y+.1,.1],[.3,.42,.11],[.58,.44,.12]],.004,PH,14,5);}
  /* ---- bash plate under the engine, the tank's filler cap, the chain guide, the rear mud flap ---- */
  prof([[.66,.27],[1.06,.27],[1.14,.36],[1.12,.42],[1.05,.33],[.7,.33]],.2,AL,0,.008);
  {const g=new T.CylinderGeometry(.032,.034,.018,16);g.translate(.96,1.085,0);add(g,AL);}
  {const g=rbox(.12,.035,.02,.008);g.translate(.2,.27,-.09);add(g,PH);}
  {const g=rbox(.004,.13,.12,.003);g.rotateZ(.25);g.translate(-.31,.86,0);add(g,PH);}
  /* ---- mud thrown up: under the front fender, along the swingarm, the lower forks, the frame rails, the engine cases ---- */
  for(let i=0;i<70;i++){const z=rr(-.12,.12);let p;const u=r_();
    if(u<.2)p=V3(rr(1.38,1.86),rr(.86,.91),z*.5);else if(u<.42)p=V3(rr(.15,.62),rr(.36,.48),r_()<.5?-.095:.095);else if(u<.6)p=V3(rr(1.44,1.54),rr(.4,.62),r_()<.5?-.1:.1);
    else if(u<.78)p=V3(rr(.72,1.1),rr(.28,.4),rr(-.12,.12));else p=V3(rr(.7,1.05),rr(.33,.5),r_()<.5?-.14:.14);
    const cl=new T.DodecahedronGeometry(rr(.007,.02),0);cl.scale(rr(1,1.8),rr(.5,.9),rr(.8,1.4));cl.translate(p.x,p.y,p.z);add(cl,MUD);}
  /* ---- merge it into one bike's geometry per material ---- */
  const BY=new Map();P.forEach(([g,m])=>{if(!BY.has(m))BY.set(m,[]);BY.get(m).push(g);});
  /* two of them on the cabin's east wall, facing south, clear of the door: the first leant on the logs, the second
     leant on the first */
  const wallX=-876.45;const bk=bucket();
  const place=(xc,zc,lean)=>{const fx=xc,fz=zc-1.56,rx=xc,rz=zc-.1;const yR=Math.min(H(fx,fz),H(rx,rz))-.01;
    const M=new T.Matrix4().compose(V3(xc,yR,zc),new T.Quaternion().setFromEuler(new T.Euler(lean,Math.PI/2,0,'YXZ')),V3(1,1,1));BY.forEach((gs,m)=>gs.forEach(g=>bk.add(g,m,M)));};
  place(wallX+.6,-335.4,-.18);place(wallX+1.22,-335.15,-.3);
  const outM=bk.flush(scene,true);window.__motoM=outM;solidAABB(wallX,wallX+1.75,-337.4,-334.5);
  window.__moto={n:P.length};})();
