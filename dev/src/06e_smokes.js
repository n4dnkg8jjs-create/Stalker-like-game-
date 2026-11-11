/* =========================== the cigarette pack, the cigarettes, the lighter =========================== */
/* a soft flip-top pack of twenty filter cigarettes (an invented brand: «Полевые»), printed card with a scuffed edge, the
   lid on a hinge at the back, a foil inner collar, the cigarettes standing in three rows (7-6-7) */
const PACK=(()=>{const W=.055,Hh=.086,D=.022,LH=.026;
  const art=tex(512,512,(c,w,h)=>{c.fillStyle='#e9e4d6';c.fillRect(0,0,w,h);
    /* front: a red band, the name, a small emblem; the health warning in a black frame along the bottom */
    c.fillStyle='#9c1d18';c.fillRect(0,150,w,150);c.fillStyle='#e9e4d6';c.font='bold 70px serif';c.textAlign='center';c.fillText('ПОЛЕВЫЕ',w/2,248);
    c.font='26px serif';c.fillText('сигареты с фильтром',w/2,284);c.fillStyle='#1c1a17';c.font='bold 30px sans-serif';c.fillText('20',w/2,120);
    c.strokeStyle='#1c1a17';c.lineWidth=3;c.beginPath();c.arc(w/2,70,26,0,7);c.stroke();c.beginPath();c.moveTo(w/2-14,70);c.lineTo(w/2+14,70);c.moveTo(w/2,56);c.lineTo(w/2,84);c.stroke();
    c.fillStyle='#fff';c.fillRect(30,330,w-60,150);c.strokeStyle='#000';c.lineWidth=8;c.strokeRect(30,330,w-60,150);c.fillStyle='#000';c.font='bold 40px sans-serif';c.fillText('КУРЕНИЕ',w/2,395);c.fillText('УБИВАЕТ',w/2,448);
    /* wear: rubbed corners and edges, a crease, grime */const q=rng(2020);for(let i=0;i<900;i++){const x=q()*w,y=q()*h,e=Math.min(x,y,w-x,h-y)/w;c.fillStyle=`rgba(${120+q()*40|0},${110+q()*30|0},${90+q()*20|0},${(.12+q()*.25)*(e<.06?1:.25)})`;c.fillRect(x,y,1+q()*3,1+q()*3);}
    c.strokeStyle='rgba(80,70,55,.35)';c.lineWidth=2;c.beginPath();c.moveTo(0,310);c.quadraticCurveTo(w*.5,300,w,318);c.stroke();});
  const card=std({map:art,roughness:.62,envMapIntensity:.4}),cardIn=std({color:C(0xcfc6b0),roughness:.9}),foil=std({color:C(0xc9c9c4),roughness:.32,metalness:.9,envMapIntensity:.8});
  const filt=std({color:C(0xc7925a),roughness:.8}),paper=std({color:C(0xefece4),roughness:.85});
  const cigG=()=>{const g=new T.Group();const f=new T.Mesh(new T.CylinderGeometry(.0039,.0039,.024,14),filt);f.position.y=.012;const p=new T.Mesh(new T.CylinderGeometry(.0039,.0039,.06,14),paper);p.position.y=.054;g.add(f,p);return g;};
  /* the box: four walls of card with real thickness (so the inside shows when the lid is up), a floor */
  const build=(n)=>{const g=new T.Group();const th=.0008;const box=(w,h,d,x,y,z,m)=>{const mm=new T.Mesh(new T.BoxGeometry(w,h,d),m);mm.position.set(x,y,z);g.add(mm);return mm;};
    const front=box(W,Hh-LH,th,0,(Hh-LH)/2,D/2,card);{const uv=front.geometry.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i),uv.getY(i)*.7);}
    box(W,Hh-LH,th,0,(Hh-LH)/2,-D/2,card);box(th,Hh-LH,D,-W/2,(Hh-LH)/2,0,card);box(th,Hh-LH,D,W/2,(Hh-LH)/2,0,card);box(W,th,D,0,0,0,card);
    /* the foil collar standing up inside the mouth */box(W-.003,.012,th,0,Hh-LH+.004,D/2-.0015,foil);box(W-.003,.012,th,0,Hh-LH+.004,-D/2+.0015,foil);
    /* the lid, hinged at the back edge */const lid=new T.Group();lid.position.set(0,Hh-LH,-D/2);g.add(lid);
    const lb=(w,h,d,x,y,z)=>{const mm=new T.Mesh(new T.BoxGeometry(w,h,d),card);mm.position.set(x,y,z);lid.add(mm);};
    lb(W,LH,th,0,LH/2,D);lb(W,th,D,0,LH,D/2);lb(th,LH,D,-W/2,LH/2,D/2);lb(th,LH,D,W/2,LH/2,D/2);lb(W,LH,th,0,LH/2,0);
    /* the cigarettes: rows 7-6-7, filters up (each one turned over: its own origin is the filter end, at the top), the
       tops just under the lid; they are taken front row first, right to left, so the one drawn is always cigs[n-1] */
    const cigs=[];const rows=[[7,-.0058],[6,0],[7,.0058]];rows.forEach(([k,z])=>{for(let i=0;i<k;i++){const c_=cigG();c_.rotation.x=Math.PI;c_.position.set((i-(k-1)/2)*.0074,.086,z);g.add(c_);cigs.push(c_);}});
    g.userData={lid,cigs,set(n){cigs.forEach((c_,i)=>c_.visible=i<n);},open(a){lid.rotation.x=-a;}};g.userData.set(n);
    g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});return g;};
  return{build,cigG,W,H:Hh,D,LH,paper,filt};})();
/* the lighter: a cheap gas lighter - moulded body, steel hood with its holes, the striker wheel, the gas button */
const LIGHTER=(()=>{
  /* printed, worn moulded plastic: a deep blue body darker toward the base, the gas level showing through as a lighter band,
     a small paper label (an invented make, «ИСКРА»), rubbed edges and fine scratches from a pocket */
  const art=tex(256,512,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'#2c5684');g.addColorStop(.55,'#1f3e64');g.addColorStop(1,'#14283f');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.fillStyle='rgba(150,190,230,.18)';c.fillRect(0,h*.42,w,h*.58);c.fillStyle='rgba(200,225,255,.35)';c.fillRect(0,h*.42,w,3);
    c.fillStyle='#e8e2cf';c.fillRect(w*.14,h*.5,w*.72,h*.3);c.strokeStyle='#8c1b16';c.lineWidth=5;c.strokeRect(w*.17,h*.52,w*.66,h*.26);
    c.fillStyle='#8c1b16';c.font='bold 46px sans-serif';c.textAlign='center';c.fillText('ИСКРА',w/2,h*.66);c.fillStyle='#222';c.font='20px sans-serif';c.fillText('газовая',w/2,h*.73);
    const q=rng(77);for(let i=0;i<260;i++){c.strokeStyle=`rgba(${200+q()*55|0},${210+q()*45|0},255,${.05+q()*.12})`;c.lineWidth=.6+q();c.beginPath();const x=q()*w,y=q()*h;c.moveTo(x,y);c.lineTo(x+(q()-.5)*40,y+(q()-.5)*12);c.stroke();}
    for(let i=0;i<500;i++){const x=q()*w,y=q()*h,e=Math.min(x,w-x)/w;c.fillStyle=`rgba(255,255,255,${(e<.07?.22:.04)*q()})`;c.fillRect(x,y,2,2);}});
  /* brushed steel for the hood and a knurled wheel */
  const brush=tex(128,128,(c,w,h)=>{c.fillStyle='#9a9c99';c.fillRect(0,0,w,h);const q=rng(5);for(let i=0;i<400;i++){c.fillStyle=`rgba(${q()<.5?255:40},${q()<.5?255:40},${q()<.5?255:40},.07)`;c.fillRect(0,q()*h,w,1);}});
  const knurl=tex(64,16,(c,w,h)=>{c.fillStyle='#777';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=3){c.fillStyle='#d8d8d4';c.fillRect(x,0,1.5,h);c.fillStyle='#3a3a3a';c.fillRect(x+1.5,0,1,h);}});
  const body=std({map:art,roughness:.3,envMapIntensity:.7}),steel=std({map:brush,color:C(0xd0d2cf),roughness:.38,metalness:1,envMapIntensity:.9}),dark=std({color:C(0x222222),roughness:.6}),wheelM=std({map:knurl,roughness:.45,metalness:1,envMapIntensity:.8});
  const build=()=>{const g=new T.Group();const b=new T.Mesh(rbox(.024,.062,.012,.004),body);b.position.y=.031;g.add(b);
    const hd=new T.Mesh(rbox(.019,.016,.011,.002),steel);hd.position.set(.002,.07,0);g.add(hd);
    for(let i=0;i<3;i++){const h=new T.Mesh(new T.CylinderGeometry(.0014,.0014,.0115,8).rotateX(Math.PI/2),dark);h.position.set(-.003+i*.004,.072,0);g.add(h);}
    const wh=new T.Mesh(new T.CylinderGeometry(.0045,.0045,.0075,20).rotateX(Math.PI/2),wheelM);wh.position.set(-.006,.0795,0);g.add(wh);
    const bt=new T.Mesh(rbox(.01,.006,.009,.002),dark);bt.position.set(.006,.064,0);g.add(bt);
    /* the flame: a small teardrop of blue base and yellow body, additive, with its own glow; off until lit */
    const fm=new T.Mesh(lathe([[0,0],[.0028,.002],[.0035,.008],[.0026,.016],[.0012,.022],[0,.025]],12),new T.ShaderMaterial({transparent:true,depthWrite:false,blending:T.AdditiveBlending,
      uniforms:{uT:{value:0}},vertexShader:'varying float vY;uniform float uT;void main(){vY=position.y/.025;vec3 p=position;p.x+=sin(uT*23.+vY*3.)*.0007*vY;p.z+=cos(uT*19.)*.0005*vY;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}',
      fragmentShader:'varying float vY;void main(){vec3 c=mix(vec3(.25,.4,1.),vec3(1.,.72,.25),smoothstep(.0,.35,vY));c=mix(c,vec3(1.,.9,.6),smoothstep(.35,.7,vY)*.5);float a=(1.-smoothstep(.75,1.,vY))*mix(.55,.9,smoothstep(0.,.3,vY));gl_FragColor=vec4(c*1.6,a);}'}));
    fm.position.set(.002,.08,0);fm.visible=false;g.add(fm);g.userData={flame:fm,wheel:wh};
    g.traverse(o=>{if(o.isMesh&&o!==fm){o.castShadow=true;}});return g;};return{build};})();

