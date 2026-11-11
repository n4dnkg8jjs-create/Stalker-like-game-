/* ---------- the rest of Staroye Opalikhino (layout: VILL in 02_terrain): eleven more houses on the street and the lane,
   built like the farmhouse - log walls with real openings on a plinth, plank floors, carved white window frames and
   painted shutters - some clad in painted boards, gable or hip roofs of asbestos slate or painted ribbed tin, glazed
   verandas, one with its covered yard (dvor) under the same roof; every plot with its own fence, gate and path,
   outbuildings (shed, bathhouse, woodpile under a lean-to, privy, greenhouse), a proper cellar - stone-walled pit with
   its timber cellar-house over the stairs and the earth bank over the vault with its vent - and a dug vegetable garden
   of ridged beds. Three houses stand boarded up, one of those burnt out. ---------- */
const HOUSES=[HOUSE],PORCHES=[],DOORS=[],YARDS=[];
/* a sepia family photograph in a dark frame: people in a row, the old ones sat in front (each one different) */
function photoTex(seed){return PORTRAIT.photo(seed);}
/* Soviet wallpaper: a pale ground, a printed vertical stripe of little flower sprigs, a fine pinstripe, faded and
   foxed with age; and lime-wash over plaster, white with a blue tint, worn grey at hand height */
function wallPaper(seed){return FAB.wallpaper(seed);}
function wallLime(seed){return memo('lime',()=>{const t=tex(256,256,(c,w,h)=>{const q=rng(500+seed);c.fillStyle='#dfe6ea';c.fillRect(0,0,w,h);
    for(let i=0;i<260;i++){const x=q()*w,y=q()*h,r=2+q()*14;c.fillStyle=`rgba(${q()<.5?150:255},${q()<.5?160:255},${q()<.5?165:255},${.05+q()*.08})`;c.beginPath();c.arc(x,y,r,0,7);c.fill();}
    for(let i=0;i<40;i++){c.strokeStyle=`rgba(90,90,95,${.05+q()*.08})`;c.lineWidth=.6;c.beginPath();let x=q()*w,y=q()*h;c.moveTo(x,y);for(let k=0;k<5;k++){x+=(q()-.5)*20;y+=q()*14;c.lineTo(x,y);}c.stroke();}});
  t.wrapS=t.wrapT=T.RepeatWrapping;return std({map:t,roughness:.95,envMapIntensity:.25});});}
/* the carpet on the wall over the bed: dark red field, border bands, a row of medallions */
function carpetTex(seed){return FAB.carpet(seed);}
(function village(){const LR=.125,LS=.215,NL=12;const top=FL+.11+NL*LS;const bk=bucket(),ibk=ibucket();
  const CHEAD=(()=>{const g=new T.SphereGeometry(.12,14,10);g.scale(1,.85,1);return g;})(),CHEADD=(()=>{const g=new T.SphereGeometry(.12,14,10);g.scale(1,.65,1);return g;})();
  const charred=std({map:PB.char.a,normalMap:PB.char.n,roughnessMap:PB.char.r,normalScale:new T.Vector2(1.4,1.4),roughness:1,envMapIntensity:.3});
  const charEnd=std({map:TX.endgrain,color:C(0x2a2622),roughness:1,envMapIntensity:.08});
  /* a hewn log between two points: round but not a cylinder - it tapers butt to top, swells and dips along its length,
     its section is a little out of round and it bows; the sawn ends are capped with end grain (rings, checks) cut to the
     very rim of the bark, so nothing shows through. Returns the bark and the two end faces as separate geometries */
  /* (hqLog, the hewn log, is in 07zh_logs) */
  /* ribbed sheet tin, painted and weathered: ribs run down the slope (v), rust bleeding from the fixings */
  const tinTex=tex(256,256,(c,w,h)=>{c.fillStyle='#bdbdb6';c.fillRect(0,0,w,h);for(let x=0;x<w;x+=16){const g=c.createLinearGradient(x,0,x+16,0);g.addColorStop(0,'#8e8e88');g.addColorStop(.3,'#e6e6de');g.addColorStop(.55,'#c9c9c2');g.addColorStop(1,'#7c7c76');c.fillStyle=g;c.fillRect(x,0,16,h);}
    const q=rng(41);for(let i=0;i<70;i++){const x=(q()*16|0)*16+8,y=q()*h;const g=c.createLinearGradient(0,y,0,y+30+q()*60);g.addColorStop(0,'rgba(120,60,30,.55)');g.addColorStop(1,'rgba(120,60,30,0)');c.fillStyle=g;c.fillRect(x-3,y,6,90);}
    for(let i=0;i<500;i++){c.fillStyle=`rgba(${q()<.5?60:220},${q()<.5?55:215},${q()<.5?50:205},${q()*.12})`;c.fillRect(q()*w,q()*h,2,2);}});tinTex.wrapS=tinTex.wrapT=T.RepeatWrapping;
  const tinM=col=>std({map:tinTex,color:C(col).multiplyScalar(1.25),roughness:.5,metalness:.45,envMapIntensity:.55,side:T.DoubleSide});
  const plank=std({map:M.boards.map,normalMap:PB.boards.n,roughnessMap:PB.boards.r,color:C(0x9a8c78),roughness:1}),plankG=std({map:M.boards.map,normalMap:PB.boards.n,roughnessMap:PB.boards.r,color:C(0x8a8478),roughness:1}),stone=std({map:TX.whitewash,color:C(0x7c776c),roughness:1}),brick=std({map:PB.brick.a,normalMap:PB.brick.n,roughnessMap:PB.brick.r,normalScale:new T.Vector2(1.3,1.3),color:C(0xb4aca4),roughness:1,envMapIntensity:.2});
  /* the garden: freshly hoed earth - crumbs and clods, a few stones, dry crust on the tops - and the plants: potato
     haulm (compound leaves of 5-7 leaflets on branching stems), cabbages (a tight pale head in a ruff of broad, veined,
     blue-green outer leaves), carrot and dill rows (fine feathery tufts) */
  const SOIL_T=tex(256,256,(c,w,h)=>{c.fillStyle='#3a2e25';c.fillRect(0,0,w,h);const q=rng(55);
    /* turned earth: a mottle of damp and drier patches, then crumbs of every size, each lit on top and dark beneath,
       soft-edged so they read as loose soil rather than tiles; a few pale grit stones */
    for(let i=0;i<70;i++){const x=q()*w,y=q()*h,r=10+q()*26,gr=c.createRadialGradient(x,y,0,x,y,r);const l=q()<.5;gr.addColorStop(0,l?'rgba(82,66,52,.35)':'rgba(20,14,10,.4)');gr.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=gr;c.fillRect(x-r,y-r,2*r,2*r);}
    for(let i=0;i<2600;i++){const x=q()*w,y=q()*h,r=.8+Math.pow(q(),2.5)*6;const gr=c.createRadialGradient(x-r*.3,y-r*.35,0,x,y,r);gr.addColorStop(0,`rgba(${88+q()*30|0},${70+q()*22|0},${55+q()*18|0},.75)`);gr.addColorStop(.6,'rgba(48,38,30,.6)');gr.addColorStop(1,'rgba(14,10,7,0)');
      c.fillStyle=gr;c.beginPath();c.ellipse(x,y,r,r*(.6+q()*.4),q()*3,0,7);c.fill();}
    for(let i=0;i<5000;i++){c.fillStyle=`rgba(${q()<.6?16:96},${q()<.6?12:80},${q()<.6?9:64},${.25+q()*.4})`;c.fillRect(q()*w,q()*h,1+q()*1.5,1+q()*1.5);}
    for(let i=0;i<30;i++){const x=q()*w,y=q()*h;c.fillStyle=`rgba(${120+q()*30|0},${112+q()*25|0},${100+q()*25|0},.65)`;c.beginPath();c.ellipse(x,y,1+q()*1.6,.8+q()*1.2,q()*3,0,7);c.fill();}});SOIL_T.wrapS=SOIL_T.wrapT=T.RepeatWrapping;SOIL_T.repeat.set(3,1);
  const leafTex=(draw)=>{const t=tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);draw(c,w,h);},{clamp:true});return t;};
  const potL=leafTex((c,w,h)=>{const q=rng(3);c.strokeStyle='#3d5a22';c.lineWidth=3;c.beginPath();c.moveTo(w/2,h);c.lineTo(w/2,8);c.stroke();
    const lf=(x,y,a,s)=>{c.save();c.translate(x,y);c.rotate(a);const g=c.createLinearGradient(-10*s,0,10*s,0);g.addColorStop(0,'#2f4a1a');g.addColorStop(.5,'#557a32');g.addColorStop(1,'#2f4a1a');c.fillStyle=g;c.beginPath();c.ellipse(0,-14*s,9*s,15*s,0,0,7);c.fill();
      c.strokeStyle='rgba(150,180,110,.6)';c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(0,-27*s);for(let k=1;k<4;k++){c.moveTo(0,-7*k*s);c.lineTo(6*s,-7*k*s-5*s);c.moveTo(0,-7*k*s);c.lineTo(-6*s,-7*k*s-5*s);}c.stroke();c.restore();};
    lf(w/2,14,0,1.05);[[36,-1],[62,1],[88,-1]].forEach(([y,_],i)=>{lf(w/2,y,-1.15,.85-i*.08);lf(w/2,y,1.15,.85-i*.08);});[50,76].forEach(y=>{lf(w/2,y,-1.6,.38);lf(w/2,y,1.6,.38);});});
  const cabL=leafTex((c,w,h)=>{const g=c.createRadialGradient(w/2,h,10,w/2,h*.5,h*.6);g.addColorStop(0,'#a8c098');g.addColorStop(1,'#5e8a6e');c.fillStyle=g;c.beginPath();c.moveTo(w/2,h);c.bezierCurveTo(-10,h*.7,0,0,w/2,4);c.bezierCurveTo(w,0,w+10,h*.7,w/2,h);c.fill();
    c.strokeStyle='rgba(225,235,215,.75)';c.lineWidth=3;c.beginPath();c.moveTo(w/2,h);c.lineTo(w/2,10);c.stroke();c.lineWidth=1.3;for(let k=1;k<7;k++){const y=h-k*16;c.beginPath();c.moveTo(w/2,y);c.quadraticCurveTo(w/2-20,y-10,w/2-42+k*3,y-22);c.moveTo(w/2,y);c.quadraticCurveTo(w/2+20,y-10,w/2+42-k*3,y-22);c.stroke();}
    const q=rng(9);for(let i=0;i<30;i++){c.clearRect(q()*w,q()*h*.6,2+q()*3,2+q()*3);}});
  const headT=tex(128,128,(c,w,h)=>{c.fillStyle='#c8d8b0';c.fillRect(0,0,w,h);c.strokeStyle='rgba(240,245,230,.8)';c.lineWidth=2;for(let i=0;i<9;i++){c.beginPath();c.moveTo(i*16,h);c.bezierCurveTo(i*16+20,h*.6,i*16-10,h*.3,i*16+12,0);c.stroke();}
    c.strokeStyle='rgba(120,150,100,.5)';c.lineWidth=1;for(let i=0;i<40;i++){c.beginPath();const x=Math.random()*w,y=Math.random()*h;c.moveTo(x,y);c.lineTo(x+8,y-6);c.stroke();}});
  const fernL=leafTex((c,w,h)=>{c.strokeStyle='#4f7a2e';for(let k=0;k<7;k++){const x=w/2+(k-3)*8;c.lineWidth=1.6;c.beginPath();c.moveTo(w/2,h);c.quadraticCurveTo(x,h*.6,x+(k-3)*5,10+Math.abs(k-3)*8);c.stroke();
      for(let j=0;j<10;j++){const t=j/10,yy=h-(h-10)*t,xx=w/2+(x+(k-3)*5-w/2)*t;c.lineWidth=.9;c.beginPath();c.moveTo(xx,yy);c.lineTo(xx-5,yy-4);c.moveTo(xx,yy);c.lineTo(xx+5,yy-4);c.stroke();}}});
  /* plain concatenation (position, normal, uv) - the bucket merges these again by material */
  const mergeP=list=>{const P=[],N=[],U=[];for(let g of list){g=g.index?g.toNonIndexed():g;g.computeVertexNormals();P.push(...g.attributes.position.array);N.push(...g.attributes.normal.array);U.push(...g.attributes.uv.array);}
    const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(P,3));o.setAttribute('normal',new T.Float32BufferAttribute(N,3));o.setAttribute('uv',new T.Float32BufferAttribute(U,2));return o;};
  const leafM=(t,col)=>std({map:t,color:C(col||0xffffff),alphaTest:.45,side:T.DoubleSide,roughness:.85,envMapIntensity:.25});
  const POT=leafM(potL,0xc8d8b8),CABO=leafM(cabL,0x8fae8a),CABH=std({map:headT,color:C(0x93ad80),roughness:.75,envMapIntensity:.2}),FERN=leafM(fernL);
  /* one potato plant: stems fanning out, each with its compound leaf, the young top leaves smaller and upright */
  const potGeo=(()=>{const parts=[];for(let i=0;i<14;i++){const a=i/14*6.28*2+(i%2)*.3,up=i<9?.85+(i%3)*.15:.3,s=i<9?1:.75;const g=new T.PlaneGeometry(.27*s,.33*s);g.translate(0,.165*s,0);g.rotateX(-up);g.rotateY(a);g.translate(Math.sin(a)*.04,i<9?.08+(i%3)*.07:.26,Math.cos(a)*.04);parts.push(g);}
    for(let i=0;i<4;i++){const st=new T.CylinderGeometry(.006,.009,.22,4);st.translate(0,.11,0);st.rotateZ((i%2?1:-1)*.35);st.rotateY(i*1.57);parts.push(st);}return mergeP(parts);})();
  const cabGeo=(()=>{const parts=[];for(let i=0;i<7;i++){const a=i/7*6.28,g=new T.PlaneGeometry(.26,.28,4,4);const p=g.attributes.position;for(let k=0;k<p.count;k++){const x=p.getX(k),y=p.getY(k)+.14;p.setZ(k,-Math.pow(x*3,2)*.06+Math.pow(y*2.6,2)*.05);p.setY(k,y);}
      g.computeVertexNormals();g.rotateX(-1.05-(i%2)*.2);g.rotateY(a);g.translate(0,.03,0);parts.push(g);}return mergeP(parts);})();
  /* the war's gardens: most went untended this summer - the potato haulm died back brown and collapsed over the ridges,
     the cabbages bolted and rotted yellow, the dill gone to straw; only a couple of families kept theirs going */
  const potLD=leafTex((c,w,h)=>{c.strokeStyle='#5a4a2a';c.lineWidth=3;c.beginPath();c.moveTo(w/2,h);c.quadraticCurveTo(w/2+10,h*.5,w/2-6,14);c.stroke();const q=rng(4);
    const lf=(x,y,a,s)=>{c.save();c.translate(x,y);c.rotate(a);const g=c.createLinearGradient(-10*s,0,10*s,0);const cc=q()<.5?['#4a3a1e','#7a6230']:['#3a2e18','#6a5a2c'];g.addColorStop(0,cc[0]);g.addColorStop(.5,cc[1]);g.addColorStop(1,cc[0]);c.fillStyle=g;
      c.beginPath();c.moveTo(0,0);c.bezierCurveTo(9*s,-6*s,7*s*(.6+q()*.4),-24*s,0,-28*s);c.bezierCurveTo(-5*s,-20*s,-8*s,-8*s,0,0);c.fill();c.strokeStyle='rgba(30,22,10,.5)';c.lineWidth=1;c.beginPath();c.moveTo(0,0);c.lineTo(0,-26*s);c.stroke();c.restore();};
    lf(w/2-4,16,.3,.95);[[36],[62],[88]].forEach(([y],i)=>{lf(w/2,y,-1.35,.8-i*.08);lf(w/2,y,1.4,.75-i*.08);});
    for(let i=0;i<25;i++){c.globalCompositeOperation='destination-out';c.beginPath();c.arc(q()*w,q()*h*.8,1+q()*3,0,7);c.fill();c.globalCompositeOperation='source-over';}});
  const cabLD=leafTex((c,w,h)=>{const g=c.createRadialGradient(w/2,h,10,w/2,h*.5,h*.6);g.addColorStop(0,'#a8a070');g.addColorStop(1,'#7a6a38');c.fillStyle=g;c.beginPath();c.moveTo(w/2,h);c.bezierCurveTo(-10,h*.7,0,0,w/2,4);c.bezierCurveTo(w,0,w+10,h*.7,w/2,h);c.fill();
    const q=rng(19);for(let i=0;i<14;i++){const x=q()*w,y=q()*h*.8,r=4+q()*12,gg=c.createRadialGradient(x,y,0,x,y,r);gg.addColorStop(0,'rgba(70,50,20,.8)');gg.addColorStop(1,'rgba(70,50,20,0)');c.fillStyle=gg;c.fillRect(x-r,y-r,2*r,2*r);}
    c.globalCompositeOperation='destination-out';for(let i=0;i<40;i++){c.beginPath();c.arc(q()*w,q()*h*.7,2+q()*4,0,7);c.fill();}c.globalCompositeOperation='source-over';});
  const fernLD=leafTex((c,w,h)=>{c.strokeStyle='#8a7a4a';for(let k=0;k<6;k++){const x=w/2+(k-3)*9;c.lineWidth=1.4;c.beginPath();c.moveTo(w/2,h);c.quadraticCurveTo(x,h*.65,x+(k-3)*8,26+Math.abs(k-3)*10);c.stroke();}});
  const POTD=leafM(potLD,0xd8c8a8),CABD=leafM(cabLD,0xc8b890),FERND=leafM(fernLD,0xd8c8a0),CABHD=std({map:headT,color:C(0x9a9060),roughness:.85,envMapIntensity:.15});
  /* the dead haulm: fewer stems, every leaf hanging, the plant fallen open over the ridge */
  const potGeoD=(()=>{const parts=[];for(let i=0;i<9;i++){const a=i/9*6.28*2+(i%2)*.4,s=.85+(i%3)*.1;const g=new T.PlaneGeometry(.26*s,.3*s);g.translate(0,.15*s,0);g.rotateX(-(1.25+(i%3)*.12));g.rotateY(a);g.translate(Math.sin(a)*.06,.04+(i%3)*.025,Math.cos(a)*.06);parts.push(g);}
    for(let i=0;i<3;i++){const st=new T.CylinderGeometry(.005,.008,.2,4);st.translate(0,.1,0);st.rotateZ((i%2?1:-1)*1.0);st.rotateY(i*2.1);parts.push(st);}return mergeP(parts);})();
  const fernGeo=(()=>{const parts=[];for(let i=0;i<3;i++){const g=new T.PlaneGeometry(.18,.24);g.translate(0,.12,0);g.rotateY(i*1.05);parts.push(g);}return mergeP(parts);})();
  const soilM=std({map:SOIL_T,bumpMap:SOIL_T,bumpScale:.025,color:C(0xa08a78),roughness:1,envMapIntensity:.04}),clodM=std({map:SOIL_T,bumpMap:SOIL_T,bumpScale:.02,color:C(0xb09a88),roughness:1,envMapIntensity:.04}),furrowM=std({map:SOIL_T,bumpMap:SOIL_T,bumpScale:.025,color:C(0x85725f),roughness:1,envMapIntensity:.03}),leafG=std({color:C(0x4f6e30),roughness:.9}),cabb=std({color:C(0x8fae78),roughness:.8}),film=std({color:C(0xe8ece8),roughness:.35,transparent:true,opacity:.42,side:T.DoubleSide,depthWrite:false});
  const slateDS=M.slate.clone();slateDS.side=T.DoubleSide;
  const turfM=std({map:TX.whitewash,color:C(0x56693a),roughness:1,envMapIntensity:.1});
  /* a sloped quad roof face with its own uv: u along the eave, v down the slope (the ribs) */
  const face=(pts,uvs)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pts.flat(),3));g.setAttribute('uv',new T.Float32BufferAttribute(uvs.flat(),2));g.computeVertexNormals();return g;};
  const quad=(a,b,c,d,ua,ub,va,vb)=>face([a,b,c,a,c,d],[[ua,va],[ub,va],[ub,vb],[ua,va],[ub,vb],[ua,vb]]);
  const tri=(a,b,c,u0,u1,uc,v0,v1)=>face([a,b,c],[[u0,v0],[u1,v0],[uc,v1]]);
  /* a brick chimney stack through the roof: running bond (uv in metres), two corbelled courses at the head, a little tin
     hood on four rods against the rain, soot up the top courses */
  const sootM=memo('chimSoot',()=>std({map:tex(64,256,(c,w,h)=>{const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(14,12,10,.85)');g.addColorStop(.35,'rgba(14,12,10,.35)');g.addColorStop(1,'rgba(14,12,10,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},{clamp:true}),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}));
  const chimney=(par,x,y0,y1,z,hood)=>{const hgt=y1-y0;const b=worldUV(rbox(.52,hgt,.52,.012),.96);b.translate(x,y0+hgt/2,z);const parts=[b];
    [[.6,.075,y1-.04],[.66,.075,y1+.035]].forEach(([w,t,y])=>{const c=worldUV(rbox(w,t,w,.01),.96);c.translate(x,y,z);parts.push(c);});shootables.push(mesh(merge(parts),brick,0,0,0,par));
    [[0,1,0],[0,-1,Math.PI],[1,0,Math.PI/2],[-1,0,-Math.PI/2]].forEach(([dx,dz,ry])=>{const m=mesh(new T.PlaneGeometry(.53,.9),sootM,x+dx*.264,y1-.45,z+dz*.264,par,false);m.rotation.y=ry;});
    if(hood){const tin=std({map:PB.rust.a,normalMap:PB.rust.n,color:C(0x8a8680),roughness:.75,metalness:.5,side:T.DoubleSide});const cn=new T.ConeGeometry(.5,.22,4,1,true);cn.rotateY(Math.PI/4);mesh(cn,tin,x,y1+.42,z,par);
      [[-.2,-.2],[.2,-.2],[-.2,.2],[.2,.2]].forEach(([dx,dz])=>mesh(new T.CylinderGeometry(.008,.008,.34,6),tin,x+dx,y1+.22,z+dz,par));}};
  /* ===== what each house is built of and how it is finished - the village was built over a century: the old log
     izbas, some clad later in painted lap boards or in vertical boards and battens, the post-war houses rendered in
     lime and painted, and the kolkhoz's brick houses of the seventies with their corbelled cornices and flat-arched
     window heads. Window trims: the carved arch, the gabled kokoshnik with its fretwork, a plain cornice with dentils;
     painted white, blue, green or ochre; shutters or none; a few families have put in white plastic windows ===== */
  const HSTYLE={n1:{ped:0,trim:0xe0dcd0,gas:1,ant:1,dmg:2},n2:{ped:1,trim:0xe0dcd0,gas:1,dish:1,dmg:1},n3:{ped:0},n4:{wall:'plaster',col:0xdfe4e6,ped:2,trim:0x3a6aa0,shut:1,gas:1,ant:1,dorm:1,dmg:2},
    s1:{wall:'brick',pvc:1,gas:1,dish:1,dmg:3},s2:{ped:1,trim:0xf0e6c8,gas:1,ant:1,shut:0,dmg:1},s3:{ped:0},s4:{wall:'vboard',ped:2,trim:0xe8e4d8,gas:1,dmg:2},s5:{wall:'brick',gas:1,ant:1,dmg:1},
    l1:{ped:2},l2:{ped:0,trim:0xd8c070,gas:1,dish:1,dorm:1,dmg:2},b1:{wall:'plaster',col:0xe6d49a,ped:0,trim:0xf2efe6,shut:1,gas:1,ant:1,dorm:1,dmg:2},b2:{ped:1,trim:0x4a7a52,gas:1,dmg:2},
    b4:{ped:2,trim:0xe0dcd0,pvc:1,gas:1,dish:1,shut:0,dmg:1},b5:{ped:0},c1:{wall:'brick',sil:1,gas:1,ant:1,dorm:1,dmg:1},c2:{ped:1}};
  const brickM=std({map:PB.brick.a,normalMap:PB.brick.n,roughnessMap:PB.brick.r,normalScale:new T.Vector2(1.3,1.3),color:C(0xb4aca4),roughness:1,envMapIntensity:.2});
  /* (sand-lime brick: the same bond, pale grey) */const silM=std({map:PB.brick.a,normalMap:PB.brick.n,roughnessMap:PB.brick.r,normalScale:new T.Vector2(1.2,1.2),color:C(0xe6e2da),roughness:1,envMapIntensity:.22});
  silM.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <map_fragment>','#include <map_fragment>\n diffuseColor.rgb=mix(vec3(dot(diffuseColor.rgb,vec3(.3,.59,.11)))*vec3(1.55,1.52,1.45),diffuseColor.rgb,.12);');};silM.customProgramCacheKey=()=>'silbrick';
  const plasterM=col=>memo('plast'+col,()=>std({map:PB.plaster.a,normalMap:PB.plaster.n,roughnessMap:PB.plaster.r,normalScale:new T.Vector2(1.1,1.1),color:C(col),roughness:1,envMapIntensity:.22}));
  const trimMat=col=>memo('trim'+col,()=>std({color:C(col),roughness:.85,map:TX.whitewash,normalMap:PB.white.n,normalScale:new T.Vector2(.6,.6),envMapIntensity:.35}));
  const gasY=std({map:PB.rustpaint.a,normalMap:PB.rustpaint.n,roughnessMap:PB.rustpaint.r,color:C(0xf0c428),roughness:1,metalness:.35,envMapIntensity:.55}),galvM=std({map:PB.galv.a,normalMap:PB.galv.n,color:C(0xb8bcb8),roughness:.45,metalness:.8,envMapIntensity:.8});
  /* shrapnel strikes: an atlas of 4x4 holes. In wood - a dark punched hole, the fibres torn out round it pale and fresh,
     splinters lifted along the grain; in render or brick - a dark pit in a chipped crater, the brick showing red at its
     heart, the render cracked round it. Each strike is a small quad laid on the actual surface it hit (on a log, tangent
     to the log at that height), so none of them float */
  const pockT=kind=>memo('pockT'+kind,()=>tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(kind==='wood'?71:73);
    for(let j=0;j<4;j++)for(let i=0;i<4;i++){const cx=i*64+32,cy=j*64+32,r=4+q()*6;
      if(kind==='wood'){c.fillStyle='rgba(206,176,128,.95)';c.beginPath();for(let k=0;k<14;k++){const a=k/14*Math.PI*2,rr=r*(1.6+q()*1.4)*(Math.abs(Math.cos(a))>.7?1.8:1);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr*.6);}c.fill();
        c.strokeStyle='rgba(220,196,150,.9)';c.lineWidth=1.3;for(let k=0;k<6;k++){const sgn=q()<.5?-1:1,y=cy+(q()-.5)*r*1.2;c.beginPath();c.moveTo(cx+sgn*r,y);c.lineTo(cx+sgn*(r+8+q()*14),y+(q()-.5)*3);c.stroke();}
        c.fillStyle='rgba(30,20,12,.95)';c.beginPath();for(let k=0;k<10;k++){const a=k/10*Math.PI*2,rr=r*(.7+q()*.5);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.fill();}
      else{c.fillStyle='rgba(150,146,136,.9)';c.beginPath();for(let k=0;k<16;k++){const a=k/16*Math.PI*2,rr=r*(1.7+q()*1.3);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.fill();
        c.fillStyle='rgba(140,70,50,.9)';c.beginPath();c.arc(cx,cy,r*1.05,0,7);c.fill();c.fillStyle='rgba(24,18,14,.95)';c.beginPath();for(let k=0;k<9;k++){const a=k/9*Math.PI*2,rr=r*(.55+q()*.4);c.lineTo(cx+Math.cos(a)*rr,cy+Math.sin(a)*rr);}c.fill();
        c.strokeStyle='rgba(60,56,50,.6)';c.lineWidth=.8;for(let k=0;k<5;k++){let x=cx,y=cy,a=q()*6.28;c.beginPath();c.moveTo(x,y);for(let m=0;m<4;m++){a+=(q()-.5)*.8;x+=Math.cos(a)*5;y+=Math.sin(a)*5;c.lineTo(x,y);}c.stroke();}}}},{clamp:true}));
  const pockM=kind=>memo('pockM'+kind,()=>std({map:pockT(kind),transparent:true,alphaTest:.2,depthWrite:false,roughness:.9,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,envMapIntensity:.2}));
  /* a tomato plant: a jointed stem tied to its stake, compound leaves on alternating nodes (pinnate leaf cards, bent so
     they droop), the state of it from green (0) to half-dry (1) to dead and brown (2). Pieces are pushed per material. */
  const TOM={fruit:[],fruitM:std({color:C(0xa8321e),roughness:.35,envMapIntensity:.6}),stemG:std({color:C(0x4a6028),roughness:.8}),stemD:std({map:TX.bark,color:C(0x8a7452),roughness:1}),leaf:[0,1,2].map(k=>{const T_=memo('tomLeafT'+k,()=>tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(31+k);
      const col=k===0?['#3e5a26','#4c6a2e','#34501e']:k===1?['#6a6a34','#7a6a3a','#4e5a2a']:['#6a5434','#5a4628','#7a6440'];c.strokeStyle=k===2?'#4a3a24':'#3a5020';c.lineWidth=4;c.beginPath();c.moveTo(10,h/2);c.lineTo(w-10,h/2);c.stroke();
      for(let i=0;i<5;i++){const x=30+i*44;for(const sd of [-1,1]){if(i===4&&sd>0)continue;c.save();c.translate(x,h/2);c.rotate(sd*(.9+q()*.3)-(k===2?sd*.25:0));c.fillStyle=col[(i+(sd>0?1:0))%3];c.beginPath();
          const L=38+q()*16,W=15+q()*5;c.moveTo(0,0);for(let t=0;t<=1.001;t+=.1){c.lineTo(t*L,-W*Math.sin(t*Math.PI)*(1+.25*Math.sin(t*22)));}for(let t=1;t>=-.001;t-=.1){c.lineTo(t*L,W*Math.sin(t*Math.PI)*(1+.25*Math.sin(t*22+1)));}c.fill();
          c.strokeStyle='rgba(20,30,10,.5)';c.lineWidth=1.2;c.beginPath();c.moveTo(0,0);c.lineTo(L,0);c.stroke();if(k===2){c.fillStyle='rgba(40,28,14,.5)';for(let j=0;j<6;j++){c.beginPath();c.arc(q()*L,(q()-.5)*W,2+q()*3,0,7);c.fill();}}c.restore();}}
      c.fillStyle=col[0];c.beginPath();c.ellipse(w-24,h/2,20,13,0,0,7);c.fill();},{clamp:true}));
    return std({map:T_,alphaTest:.45,side:T.DoubleSide,roughness:.85,envMapIntensity:.25});})};
  function tomatoPlant(q,st,parts,x,y0,z){const H_=.7+q()*.3,n=7;const stem=[];let px=x,pz=z;for(let i=0;i<=n;i++){const t=i/n;px+=(q()-.5)*.03;pz+=(q()-.5)*.03;stem.push(V3(px,y0+t*H_*(st===2?.92:1),pz));}
    const cr=new T.CatmullRomCurve3(stem);const tg=new T.TubeGeometry(cr,14,st===2?.006:.008,6,false);(st===2?(parts.stemD=parts.stemD||[]):(parts.stemG=parts.stemG||[])).push(tg);
    for(let i=1;i<n;i++){const p=cr.getPoint(i/n),a=i*2.4+q(),dead=st===2||(st===1&&i<n-2),lk=dead?2:st===1&&i<n-1?1:0;
      const lf=new T.PlaneGeometry(.26,.26,4,1);const P=lf.attributes.position;for(let j=0;j<P.count;j++){const u=(P.getX(j)+.13)/.26;P.setZ(j,-u*u*(dead?.16:.07));}lf.rotateX(-Math.PI/2);lf.translate(.13,0,0);
      lf.rotateZ(-(dead?.6+q()*.5:.15+q()*.3));lf.rotateY(a);lf.translate(p.x,p.y,p.z);parts[lk].push(lf);}
    if(st<2&&q()<.6){const nF=1+(q()*3|0);for(let k=0;k<nF;k++){const p=cr.getPoint(.35+q()*.3),f=new T.SphereGeometry(.026+q()*.012,10,8);f.scale(1,.85,1);f.translate(p.x+(q()-.5)*.08,p.y-.05,p.z+(q()-.5)*.08);TOM.fruit.push(f);}}}
  const buildHouses=()=>VILL.houses.forEach((hd,hi)=>{const W=hd.W,D=hd.D;const h=new T.Group();h.position.set(hd.x,0,hd.z);h.rotation.y=hd.yaw;scene.add(h);
    const wb=(a0,a1,b0,b1)=>{const r=villRect(hd,a0,a1,b0,b1);return solidAABB(r.x1,r.x2,r.z1,r.z2);};
    const paint=M.blue.clone();paint.color=C(hd.col);const logM=hd.burnt?charred:LOGM;const dx=hi%2?.6:.2,sd=hi%2?-1:1;
    /* (only the paint takes the house's colour: where it has flaked off, the bare wood stays silver-grey - the shader
       tells the two apart by brightness, the paint near white in the texture and the wood mid-grey) */
    const cladM=std({map:PB.peel.a,normalMap:PB.peel.n,roughnessMap:PB.peel.r,roughness:1,envMapIntensity:.4});{const tint={value:C(hd.col).multiplyScalar(1.05)};
      cladM.onBeforeCompile=sh=>{sh.uniforms.uTint=tint;sh.fragmentShader='uniform vec3 uTint;\n'+sh.fragmentShader.replace('#include <map_fragment>','vec4 texelColor=mapTexelToLinear(texture2D(map,vUv));float pmk=smoothstep(.2,.48,dot(texelColor.rgb,vec3(.2126,.7152,.0722)));diffuseColor.rgb*=texelColor.rgb*mix(vec3(.92,.9,.86),uTint,pmk);');};
      cladM.customProgramCacheKey=()=>'cladTint';}
    const st=HSTYLE[hd.id]||{},gutted=(st.dmg||0)>=3,WK=st.wall||(hd.clad?'lap':'log'),masonry=WK==='brick'||WK==='plaster',wallM=WK==='brick'?(st.sil?silM:brickM):WK==='plaster'?plasterM(st.col||0xe6e6e0):null,trimM=trimMat(st.trim||0xe0dcd0);
    mesh(rbox(W+.3,FL-.02+.5,D+.3,.04),M.concrete,0,(FL-.02)/2-.27,0,h);
    const dX0=dx-.95,dX1=dx+.05,wf=W/2-1.25,wide=W>8.5;
    const w3=-sd*(wf-1.7);const fW=wide?[[-wf-.5,-wf+.5],[wf-.5,wf+.5],[w3-.5,w3+.5]]:[[-wf-.5,-wf+.5],[wf-.5,wf+.5]];
    /* the back window lights the kitchen: between the stove and the partition in a big house, clear of the stove in a small one */
    const bwx=W>=8?sd*(1.05+(W/2-1.78-1.05)/2):sd*Math.min(.9,W/2-1.78-.62);
    const open={front:[[dX0,dX1,FL,FL+2.05],...fW.map(o=>[o[0],o[1],FL+.9,FL+2.0])],back:hd.dvor?[]:[[bwx-.5,bwx+.5,FL+.9,FL+2.0]],
      east:hi%2?[]:[[-.5,.5,FL+.9,FL+2.0]].concat(D>7?[[1.6,2.6,FL+.9,FL+2.0]]:[]),west:hi%2?[[-.5,.5,FL+.9,FL+2.0]]:[]};
    /* a ruin: 'collapse' (a shell came through it - the side it came from is down to a course or two, the rest broken off at
       ragged heights, the corners standing longest as corners do), 'strike' (a drone through the side wall and the roof) */
    const ruin=hd.ruin,RP={front:.5,back:.38,east:.08,west:.78},fallen=[],burntLogs=[];
    const stands=(nm,a,k)=>{if(ruin!=='collapse')return true;const half=(nm==='front'||nm==='back'?W:D)/2;const f=RP[nm]+sstep(half-1,half+.2,Math.abs(a))*.32+.15*Math.sin(a*1.9+hi*1.3)+.07*Math.sin(a*5.3+hi*2.1);/* (a log only stands on the one under it: the height a wall is broken off at depends on where along it, never on the course) */return k<NL*f;};
    if(ruin==='strike')open[hd.breach[0]].push([hd.breach[1],hd.breach[2],FL+.2,FL+1.75]);
    /* the log walls, opening by opening; a clad house gets a skin of painted lap boards outside the logs */
    const logs=[],boards=[],lq=rng(9000+hi);const addLog=(axis,c,a0,a1,y)=>{const L=a1-a0;if(L<.05)return;const A=axis==='x'?V3(a0,y,c):V3(c,y,a0),B=axis==='x'?V3(a1,y,c):V3(c,y,a1);
      /* (hewn logs, a little out of round and tapering, their sawn ends showing the grain) */logs.push(hqLog(A,B,LR,lq,{rs:12,seg:2.0,bow:.012,taper:.04}));};
    const addBoard=(axis,c,a0,a1,y,out)=>{const L=a1-a0;if(L<.05)return;const g=new T.BoxGeometry(axis==='x'?L:.025,LS*.92,axis==='x'?.025:L);
      /* (one painted board of the texture per lap board: u along it in metres, v across its own fifth of the texture) */{const P=g.attributes.position,U=g.attributes.uv,sl=(Math.round(y/LS*.92*7+c*3)%5+5)%5;for(let i=0;i<P.count;i++){const al=(axis==='x'?P.getX(i):P.getZ(i))+(a0+a1)/2;U.setXY(i,al/1.6,(sl+.04+.92*(P.getY(i)/(LS*.92)+.5))*.2);}}g.rotateX(axis==='x'?out*.07:0);g.rotateZ(axis==='x'?0:-out*.07);g.translate(axis==='x'?(a0+a1)/2:c,y,axis==='x'?c:(a0+a1)/2);boards.push(g);};
    const segsFor=(nm,half,ext,y,yr)=>{let segs=[[-half-ext,half+ext]];open[nm].forEach(o=>{if(y+yr<o[2]||y-yr>o[3])return;const ns=[];segs.forEach(s=>{if(o[1]<=s[0]||o[0]>=s[1]){ns.push(s);return;}if(o[0]>s[0])ns.push([s[0],o[0]]);if(o[1]<s[1])ns.push([o[1],s[1]]);});segs=ns;});return segs;};
    const WALLS=[['front',D/2,'x',1],['back',-D/2,'x',-1],['east',W/2,'z',1],['west',-W/2,'z',-1]];
    if(!masonry)for(let k=0;k<NL;k++){const y=FL+.11+k*LS;
      WALLS.forEach(([nm,c,axis])=>{const half=(axis==='x'?W:D)/2;const ext=hd.clad?0:((k%2===0)===(axis==='x'))?.28:0;const yy=axis==='x'?y:y+LS/2;
        segsFor(nm,half,ext,y,LR*.5).forEach(sg=>{if(ruin!=='collapse'){addLog(axis,c,sg[0],sg[1],yy);return;}
          /* broken off: the standing runs of this course, each end snapped short; what is missing has fallen */
          const nb=logs.length;let a=sg[0],run=null;for(;a<=sg[1]+.001;a+=.25){const st=a<sg[1]&&stands(nm,a,k);if(st&&run===null)run=a;if(!st&&run!==null){const e=Math.min(a,sg[1]);addLog(axis,c,run+(run>sg[0]?Math.random()*.15:0),e-Math.random()*.2,yy);run=null;}
            if(!st&&a<sg[1])fallen.push([nm,c,axis,a,Math.min(a+.25,sg[1]),yy]);}
          if(run!==null)addLog(axis,c,run,sg[1],yy);
          /* the courses just under the break are charred */const am=(sg[0]+sg[1])/2;if(!stands(nm,am,k+2)||!stands(nm,sg[0]+.3,k+2)||!stands(nm,sg[1]-.3,k+2))burntLogs.push(...logs.splice(nb));});});}
    if(WK==='lap')for(let y=FL-.05;y<top+.05;y+=LS*.92)WALLS.forEach(([nm,c,axis,o])=>{const half=(axis==='x'?W:D)/2+LR+.03;segsFor(nm,half,0,y,LS*.42).forEach(s=>addBoard(axis,c+o*(LR+.035),s[0],s[1],y,o));});
    /* vertical boards and battens over the logs: boards on end, a narrow batten over every joint, cut round the openings */
    if(WK==='vboard'){const bt=[];WALLS.forEach(([nm,c,axis,o])=>{const half=(axis==='x'?W:D)/2+LR+.03,oc=c+o*(LR+.035);const y0=FL-.05,y1=top+.05;
      for(let a=-half;a<half-.01;a+=.17){const a1=Math.min(half,a+.17),am=(a+a1)/2;let segs=[[y0,y1]];
        open[nm].forEach(op=>{if(a1<=op[0]||a>=op[1])return;const ns=[];segs.forEach(sg=>{if(op[3]<=sg[0]||op[2]>=sg[1]){ns.push(sg);return;}if(op[2]>sg[0])ns.push([sg[0],op[2]]);if(op[3]<sg[1])ns.push([op[3],sg[1]]);});segs=ns;});
        segs.forEach(([b0,b1])=>{if(b1-b0<.02)return;const g=new T.BoxGeometry(axis==='x'?a1-a-.006:.022,b1-b0,axis==='x'?.022:a1-a-.006);
          {const P=g.attributes.position,U=g.attributes.uv,sl=(Math.round(a*13+c*7)%5+5)%5;for(let i=0;i<P.count;i++){const ac=axis==='x'?P.getX(i):P.getZ(i);U.setXY(i,(P.getY(i)+(b0+b1)/2)/1.6+a*.37,(sl+.5+ac/.18)*.2);}}g.translate(axis==='x'?am:oc,(b0+b1)/2,axis==='x'?oc:am);boards.push(g);
          const t=new T.BoxGeometry(axis==='x'?.05:.02,b1-b0,axis==='x'?.02:.05);t.translate(axis==='x'?a1:oc+o*.02,(b0+b1)/2,axis==='x'?oc+o*.02:a1);bt.push(t);});}});
      boards.push(...bt);}
    /* rendered or brick walls: solid, cut round every opening; boxes laid edge to edge with the texture mapped by the metre
       in the house's own frame, so the bond and the render run on unbroken from piece to piece and into the reveals */
    if(masonry){const slab=[],T2=2*LR,y0=FL-.02,y1=top+.06,uvS=WK==='brick'?.96:.5;
      WALLS.forEach(([nm,c,axis])=>{const half=axis==='x'?W/2+LR:D/2-LR;const ops=open[nm].map(o=>[o[0],o[1],Math.max(o[2],y0),Math.min(o[3],y1)]);
        const xs=[-half,half];ops.forEach(o=>xs.push(clamp(o[0],-half,half),clamp(o[1],-half,half)));xs.sort((p_,q_)=>p_-q_);
        for(let i=0;i<xs.length-1;i++){const a0=xs[i],a1=xs[i+1];if(a1-a0<.004)continue;const am=(a0+a1)/2;let segs=[[y0,y1]];
          ops.forEach(o=>{if(am<=o[0]||am>=o[1])return;const ns=[];segs.forEach(sg=>{if(o[3]<=sg[0]||o[2]>=sg[1]){ns.push(sg);return;}if(o[2]>sg[0])ns.push([sg[0],o[2]]);if(o[3]<sg[1])ns.push([o[3],sg[1]]);});segs=ns;});
          segs.forEach(([b0,b1])=>{if(b1-b0<.004)return;const g=new T.BoxGeometry(axis==='x'?a1-a0:T2,b1-b0,axis==='x'?T2:a1-a0);g.translate(axis==='x'?am:c,(b0+b1)/2,axis==='x'?c:am);worldUV(g,uvS);slab.push(g);});}});
      /* the brick house's cornice (two corbelled courses), its corner pilasters; the rendered house's painted plinth band */
      const band=(y,hh,p,m,list)=>{[[0,D/2,W+2*LR+2*p,'x'],[0,-D/2,W+2*LR+2*p,'x'],[W/2,0,D+2*LR,'z'],[-W/2,0,D+2*LR,'z']].forEach(([x,z,L,ax])=>{const g=new T.BoxGeometry(ax==='x'?L:T2+2*p,hh,ax==='x'?T2+2*p:L);g.translate(x,y,z);worldUV(g,uvS);list.push(g);});};
      if(WK==='brick'){band(y1-.09,.075,.035,wallM,slab);band(y1-.035,.075,.07,wallM,slab);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>{const g=new T.BoxGeometry(.4,y1-y0-.16,.4);g.translate(sx*(W/2+LR-.17),(y0+y1-.16)/2,sz*(D/2+LR-.17));worldUV(g,uvS);slab.push(g);});}
      shootables.push(mesh(merge(slab),wallM,0,0,0,h));
      if(WK==='plaster'){const pb=[];band(FL+.08,.5,.012,null,pb);mesh(merge(pb),memo('plinthPaint',()=>std({map:PB.plaster.a,normalMap:PB.plaster.n,color:C(0x8a8a86),roughness:1,envMapIntensity:.2})),0,0,0,h);}}
    if(!masonry){addLog('z',W/2,-D/2,D/2,FL+.11-LS/2);addLog('z',-W/2,-D/2,D/2,FL+.11-LS/2);}if(!masonry&&ruin!=='collapse'){addLog('x',D/2,-W/2-(hd.clad?0:.28),W/2+(hd.clad?0:.28),top);addLog('x',-D/2,-W/2-(hd.clad?0:.28),W/2+(hd.clad?0:.28),top);}
    /* the openings in a log wall are lined (the obsada): a planed board up each side, a head and a sill board, the depth of
       the wall - the cut log ends are behind them, as in any izba, instead of showing in the reveal */
    if(!masonry&&ruin!=='collapse'&&!hd.boarded){const jb=[],T2=2*LR+.02;WALLS.forEach(([nm,c,axis])=>open[nm].forEach(o=>{const hgt=o[3]-o[2],ym=(o[2]+o[3])/2,door=o[2]<=FL+.01;
        const bx=(a,y,len,vert)=>{const g=vert?new T.BoxGeometry(axis==='x'?.045:T2,len,axis==='x'?T2:.045):new T.BoxGeometry(axis==='x'?len:T2,.045,axis==='x'?T2:len);g.translate(axis==='x'?a:c,y,axis==='x'?c:a);worldUV(g,.6);jb.push(g);};
        bx(o[0]+.022,ym,hgt+.09,true);bx(o[1]-.022,ym,hgt+.09,true);bx((o[0]+o[1])/2,o[3]+.022,o[1]-o[0],false);if(!door)bx((o[0]+o[1])/2,o[2]-.022,o[1]-o[0],false);}));
      if(jb.length)mesh(merge(jb),memo('jambM',()=>std({map:PB.planks.a,normalMap:PB.planks.n,roughnessMap:PB.planks.r,color:C(0xc8b89a),roughness:1,envMapIntensity:.3})),0,0,0,h);}
    if(logs.length){shootables.push(mesh(merge(logs.map(l=>l.side)),logM,0,0,0,h));mesh(merge(logs.map(l=>l.cap)),hd.burnt?charEnd:WM.end,0,0,0,h);}if(burntLogs.length){shootables.push(mesh(merge(burntLogs.map(l=>l.side)),charred,0,0,0,h));mesh(merge(burntLogs.map(l=>l.cap)),charEnd,0,0,0,h);}
    /* inside a lived-in house the logs are lined: wallpaper on battens over the logs in most, lime-washed plaster in some,
       cut round every window and the door, a painted skirting board along the floor */
    /* the inside finish: the brick houses papered, the rendered ones lime-washed with an oil-painted dado, the log houses
       papered or limed - and in two of them nothing at all over the logs, the moss in the joints */
    const bareLogs=!masonry&&(hd.id==='b2'||hd.id==='n1');
    if(hd.enter&&!bareLogs){const lin=gutted?burntWall():WK==='plaster'?wallLime(hi):WK==='brick'?wallPaper(hi+1):hi%4===2?wallLime(hi):wallPaper(hi);const IN=LR+.012,y0=FL+.03,y1=top-.08,parts=[],cas=[];
      /* a painted casing round each opening, standing a little proud of the lining */
      const casing=(lo,hi2,c0,c1,place,door)=>{const bw=.075,bx=(w,h_,cx,cy)=>{const g=new T.BoxGeometry(w,h_,.022);g.translate(cx,cy,.011);place(g);cas.push(g);};
        bx(bw,c1-c0+(door?bw:2*bw),lo-bw/2,(c0+c1)/2+(door?bw/2:0));bx(bw,c1-c0+(door?bw:2*bw),hi2+bw/2,(c0+c1)/2+(door?bw/2:0));bx(hi2-lo,bw,(lo+hi2)/2,c1+bw/2);if(!door)bx(hi2-lo,bw,(lo+hi2)/2,c0-bw/2);};
      const wallPiece=(a0,a1,holes,place)=>{const sh=new T.Shape();sh.moveTo(a0,y0);sh.lineTo(a1,y0);sh.lineTo(a1,y1);sh.lineTo(a0,y1);sh.closePath();
        holes.forEach(([b0,b1,c0,c1])=>{const lo=Math.max(b0,a0+.02),hi2=Math.min(b1,a1-.02);if(hi2<=lo)return;const hp=new T.Path();const yy0=Math.max(c0,y0+.01);
          if(yy0<=y0+.011){/* a doorway: notch from the floor */return;}hp.moveTo(lo,yy0);hp.lineTo(hi2,yy0);hp.lineTo(hi2,c1);hp.lineTo(lo,c1);hp.closePath();sh.holes.push(hp);casing(lo,hi2,yy0,c1,place,false);});
        const g=new T.ShapeGeometry(sh);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*1.8,p.getY(i)*1.8);place(g);parts.push(g);};
      /* doorways reach the floor: split the wall there instead of cutting a hole */
      const runs=(a0,a1,holes)=>{let segs=[[a0,a1]];holes.filter(o=>o[2]<=FL+.05).forEach(o=>{const ns=[];segs.forEach(sg=>{if(o[1]<=sg[0]||o[0]>=sg[1]){ns.push(sg);return;}if(o[0]>sg[0])ns.push([sg[0],o[0]]);if(o[1]<sg[1])ns.push([o[1],sg[1]]);});segs=ns;});
        /* and the lintel over the doorway */const door=holes.filter(o=>o[2]<=FL+.05);return{segs,door};};
      const doWall=(nm,len,mirror,place)=>{const L2=len/2-LR;const H_=open[nm].map(o=>mirror?[-o[1],-o[0],o[2],o[3]]:o);const {segs,door}=runs(-L2,L2,H_);
        segs.forEach(([a0,a1])=>wallPiece(a0,a1,H_.filter(o=>o[2]>FL+.05&&o[0]<a1&&o[1]>a0),place));
        door.forEach(o=>{casing(o[0],o[1],o[2],o[3],place,true);const sh=new T.Shape();sh.moveTo(o[0],o[3]);sh.lineTo(o[1],o[3]);sh.lineTo(o[1],y1);sh.lineTo(o[0],y1);sh.closePath();const g=new T.ShapeGeometry(sh);const p=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<p.count;i++)uv.setXY(i,p.getX(i)*1.8,p.getY(i)*1.8);place(g);parts.push(g);});};
      doWall('back',W,false,g=>g.translate(0,0,-D/2+IN));
      doWall('front',W,true,g=>{g.rotateY(Math.PI);g.translate(0,0,D/2-IN);});
      doWall('east',D,false,g=>{g.rotateY(-Math.PI/2);g.translate(W/2-IN,0,0);});
      doWall('west',D,true,g=>{g.rotateY(Math.PI/2);g.translate(-W/2+IN,0,0);});
      parts.forEach(g=>{g.deleteAttribute('normal');g.computeVertexNormals();});mesh(merge(parts),lin,0,0,0,h,false).userData.inside=hd.id;if(cas.length)mesh(merge(cas),M.trimWhite,0,0,0,h,false).userData.inside=hd.id;
      /* skirting */const sk=std({map:RF.PAINT.map,color:C(hi%2?0x8a5a3a:0x6a4a34),roughness:.6});
      [[0,-D/2+IN+.012,W-2*LR,'x'],[W/2-IN-.012,0,D-2*LR,'z'],[-W/2+IN+.012,0,D-2*LR,'z']].forEach(([x,z,L,ax])=>{mesh(rbox(ax==='x'?L:.024,.1,ax==='x'?.024:L,.006),sk,x,FL+.08,z,h).userData.inside=hd.id;});
      [[-W/2+LR,dX0],[dX1,W/2-LR]].forEach(([a,b])=>{if(b-a>.05)mesh(rbox(b-a,.1,.024,.006),sk,(a+b)/2,FL+.08,D/2-IN-.012,h).userData.inside=hd.id;});
      /* the dado: oil paint, gloss, to just under the window sills, a dark line along its top */
      if(WK==='plaster'){const dm=memo('dado'+hi%2,()=>std({map:TX.whitewash,color:C(hi%2?0x4a6a86:0x5a7a62),roughness:.32,envMapIntensity:.55})),ln=memo('dadoLine',()=>std({color:C(0x2a2a2a),roughness:.5})),dp=[],lp=[];
        const strip=(x0,x1,place)=>{const g=new T.PlaneGeometry(x1-x0,.78);g.translate((x0+x1)/2,FL+.1+.39,0);place(g);dp.push(g);const l=new T.PlaneGeometry(x1-x0,.018);l.translate((x0+x1)/2,FL+.88,0);place(l);lp.push(l);};
        const L2=W/2-LR-.01,L3=D/2-LR-.01;strip(-L2,L2,g=>g.translate(0,0,-D/2+IN+.004));strip(-L3,L3,g=>{g.rotateY(-Math.PI/2);g.translate(W/2-IN-.004,0,0);});strip(-L3,L3,g=>{g.rotateY(Math.PI/2);g.translate(-W/2+IN+.004,0,0);});
        [[-L2,dX0-.08],[dX1+.08,L2]].forEach(([a,b])=>{if(b-a>.05)strip(-b,-a,g=>{g.rotateY(Math.PI);g.translate(0,0,D/2-IN-.004);});});
        mesh(merge(dp),dm,0,0,0,h,false).userData.inside=hd.id;mesh(merge(lp),ln,0,0,0,h,false).userData.inside=hd.id;}}
    if(boards.length){shootables.push(mesh(merge(boards),cladM,0,0,0,h));
      /* white corner boards and the skirting board */[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([sx,sz])=>mesh(rbox(.16,top-FL+.2,.16,.01),M.trimWhite,sx*(W/2+LR+.05),(top+FL)/2,sz*(D/2+LR+.05),h));
      [[0,D/2,W+.5,'x'],[0,-D/2,W+.5,'x'],[W/2,0,D+.5,'z'],[-W/2,0,D+.5,'z']].forEach(([x,z,L,ax])=>mesh(rbox(ax==='x'?L:.06,.18,ax==='x'?.06:L,.01),M.trimWhite,x+(ax==='z'?Math.sign(x)*(LR+.06):0),FL-.02,z+(ax==='x'?Math.sign(z)*(LR+.06):0),h));}
    wb(-W/2-.15,W/2+.15,-D/2-.15,-D/2+.15);wb(-W/2-.15,-W/2+.15,-D/2,D/2);wb(W/2-.15,W/2+.15,-D/2,D/2);wb(-W/2,dX0,D/2-.15,D/2+.15);wb(dX1,W/2,D/2-.15,D/2+.15);
    /* the floor: bare boards, boards painted the usual brick-red ochre, or linoleum printed like parquet */
    const flM=WK==='brick'?memo('lino',()=>std({map:FAB.lino(),roughness:.38,envMapIntensity:.55})):(WK==='plaster'||hd.id==='s2'||hd.id==='b4')?memo('paintFloor',()=>std({map:PB.planks.a,normalMap:PB.planks.n,color:C(0xb0583a),roughness:.42,envMapIntensity:.5})):M.planks;
    {const fg=rbox(W-.2,.06,D-.2,.01);if(flM!==M.planks)worldUV(fg,WK==='brick'?.5:.6);shootables.push(mesh(fg,flM,0,FL,0,h));}
    /* the ceiling boards; where a drone came through the roof they are torn open under the hole, the broken ends hanging */
    if(ruin==='strike'){const [rs,i0,i1]=hd.hole,exr=W/2+.6,hx0=Math.max(-W/2+.1,-exr+.55+i0*1.03-.35),hx1=Math.min(W/2-.1,-exr+.55+i1*1.03+.35),hz0=rs>0?.35:-(D/2-.35),hz1=rs>0?D/2-.35:-.35;
      const cb=[],box=(x0,x1,z0,z1)=>{if(x1-x0<.05||z1-z0<.05)return;const g=rbox(x1-x0,.06,z1-z0,.01);g.translate((x0+x1)/2,top-.05,(z0+z1)/2);cb.push(g);};
      box(-W/2+.05,hx0,-D/2+.05,D/2-.05);box(hx1,W/2-.05,-D/2+.05,D/2-.05);box(hx0,hx1,-D/2+.05,hz0);box(hx0,hx1,hz1,D/2-.05);mesh(merge(cb),M.planks,0,0,0,h);
      const q=rng(330+hi),hp=[];for(let i=0;i<7;i++){const x=lerp(hx0+.1,hx1-.1,q()),z=q()<.5?hz0:hz1,L=.4+q()*.7,g=rbox(.12,.025,L,.004);g.translate(0,0,(z===hz0?1:-1)*L/2);g.rotateX((z===hz0?1:-1)*(.9+q()*.5));g.translate(x,top-.05,z);hp.push(g);}
      mesh(merge(hp),charred,0,0,0,h);
      /* what came down with it, on the floor under the hole */const dp=[];for(let i=0;i<18;i++){const g=rbox(.08+q()*.12,.025,.3+q()*.8,.004);g.rotateY(q()*3);g.rotateZ((q()-.5)*.4);g.translate(lerp(hx0,hx1,q()),FL+.05+q()*.06,lerp(hz0,hz1,q()));dp.push(g);}mesh(merge(dp),q()<.5?charred:M.planks,0,0,0,h);}
    else if(gutted){/* burned out: the ceiling boards gone over most of the room, charred joists left across it, some fallen */const cq=rng(3700+hi),cb=[];
      for(let x=-W/2+.4;x<W/2-.3;x+=.62){if(cq()<.35)continue;const A=V3(x,top-.08,-D/2+.15),B=V3(x+(cq()-.5)*.1,top-.08,D/2-.15);if(cq()<.3){B.y=FL+.15+cq()*.4;B.z=(cq()-.5)*D*.6;}cb.push(beamG(A,B,.08,.16));}
      for(let k=0;k<5;k++){const x0=(cq()-.5)*(W-1),z0=(cq()-.5)*(D-1.2),g=rbox(.9+cq()*1.2,.05,.25+cq()*.5,.01);g.translate(x0,top-.05,z0);cb.push(g);}mesh(merge(cb),charred,0,0,0,h);}
    else if(ruin!=='collapse')mesh(rbox(W+.1,.18,D+.1,.01),M.planks,0,top+.01,0,h);/* (thick, and run into the top logs all round: a thin slab let the low sun leak in along its edges) *//* (a collapsed house has no ceiling left: it came down with the roof) */
    /* door */
    const door=new T.Group();door.position.set(dX0+(masonry||hd.boarded?0:.045),FL,D/2-.02);h.add(door);/* (a collapsed house's door has come down with its frame, flat out over the porch) */if(ruin==='collapse'){door.rotation.set(1.5,0,.12);door.position.set(dX0+.05,FL+.25,D/2+.1);}
    {const dw_=masonry||hd.boarded?1.0:.91;mesh(rbox(dw_,2.0,.06,.01),hd.burnt?charred:M.boards,dw_/2,1.0,0,door);[.3,1.7].forEach(y=>mesh(rbox(dw_-.1,.12,.04,.01),M.boards,dw_/2,y,-.05,door));mesh(new T.SphereGeometry(.03,8,6),M.rust,dw_-.12,1.0,.05,door);}
    const dsol=wb(dX0,dX1,D/2-.12,D/2+.12);
    if(hd.enter){const st={g:door,open:false};dsol.door=st;DOORS.push(st);interact.push({obj:door,off:V3(.5,1,0),label:'Open door',r:2.2,fn(){st.open=!st.open;this.label=st.open?'Close door':'Open door';const dp=door.getWorldPosition(V3());dp.y+=1;doorSound(st.open,dp,hi+1);}});}
    else[[.55,.3],[1.45,-.25]].forEach(([y,rz])=>{const b=mesh(rbox(1.3,.14,.03,.01),M.boards,.5,y,.06,door);b.rotation.z=rz;});
    /* windows: carved white frames standing proud of the wall, painted shutters, glass, net curtains */
    const po=hd.clad?.06:0;
    const win=(x,z,ry,broken,boarded)=>{const g=new T.Group();g.position.set(x,FL+1.45,z);g.rotation.y=ry;h.add(g);
      const sash=st.pvc?memo('pvc',()=>std({color:C(0xf2f2ee),roughness:.35,envMapIntensity:.6})):paint;
      if(masonry){/* set in the reveal: the frame, a tin sill outside, the head - a flat arch of bricks, or a rendered surround */
        [[0,.52,1.0,.07],[0,-.52,1.0,.07],[-.465,0,.07,1.1],[.465,0,.07,1.1]].forEach(b=>mesh(rbox(b[2],b[3],.08,.008),st.pvc?sash:trimM,b[0],b[1],.02,g));
        const sl=mesh(rbox(1.14,.018,.17,.004),galvM,0,-.565,.16,g);sl.rotation.x=.12;
        if(WK==='brick'){const hb=worldUV(rbox(1.26,.17,.06,.006),.96);mesh(hb,wallM,0,.635,.135,g);}
        else{[[0,.62,1.3,.12],[0,-.6,1.3,.06],[-.6,0,.1,1.3],[.6,0,.1,1.3]].forEach(b=>mesh(rbox(b[2],b[3],.02,.004),trimM,b[0],b[1],.133,g));}}
      else{[[0,.58,1.2,.1],[0,-.6,1.25,.12],[-.55,0,.1,1.25],[.55,0,.1,1.25]].forEach(b=>mesh(rbox(b[2],b[3],.07,.01),trimM,b[0],b[1],.15+po,g));
        const pd=st.ped||0;
        if(pd===0){const ped=new T.Shape();ped.moveTo(-.7,0);ped.lineTo(.7,0);ped.lineTo(.5,.22);ped.quadraticCurveTo(0,.42,-.5,.22);ped.closePath();mesh(new T.ExtrudeGeometry(ped,{depth:.04,bevelEnabled:false}),trimM,0,.62,.13+po,g);}
        else if(pd===1){/* the kokoshnik: a gabled head with a fretwork of round and leaf holes, an apron of scallops under the sill */
          const ped=new T.Shape();ped.moveTo(-.72,0);ped.lineTo(.72,0);ped.lineTo(.62,.08);ped.lineTo(0,.46);ped.lineTo(-.62,.08);ped.closePath();
          [[-.3,.12],[0,.2],[.3,.12]].forEach(([hx,hy],k)=>{const hp=new T.Path();hp.absarc(hx,hy,k===1?.07:.045,0,Math.PI*2,true);ped.holes.push(hp);});
          [-1,1].forEach(sg=>{const hp=new T.Path();hp.moveTo(sg*.15,.06);hp.quadraticCurveTo(sg*.2,.16,sg*.12,.2);hp.quadraticCurveTo(sg*.1,.12,sg*.15,.06);ped.holes.push(hp);});
          mesh(new T.ExtrudeGeometry(ped,{depth:.035,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:14}),trimM,0,.62,.13+po,g);
          mesh(rbox(1.5,.05,.09,.008),trimM,0,.645,.17+po,g);
          const ap=new T.Shape();ap.moveTo(-.62,0);ap.lineTo(.62,0);for(let k=5;k>=0;k--){const xx=-.62+k*1.24/6;ap.lineTo(xx+.207,-.06);ap.quadraticCurveTo(xx+.103,-.16,xx,-.06);}ap.closePath();
          mesh(new T.ExtrudeGeometry(ap,{depth:.03,bevelEnabled:false,curveSegments:8}),trimM,0,-.66,.135+po,g);}
        else{/* a plain cornice board on brackets, a row of dentils under it */mesh(rbox(1.44,.07,.12,.01),trimM,0,.7,.17+po,g);for(let k=0;k<11;k++)mesh(rbox(.05,.05,.05,.006),trimM,-.6+k*.12,.645,.16+po,g);
          [-1,1].forEach(sg=>mesh(rbox(.06,.16,.08,.008),trimM,sg*.62,.6,.17+po,g));}}
      if(st.pvc){mesh(rbox(.06,1.06,.06,.006),sash,0,0,.05,g);mesh(rbox(.47,.05,.05,.006),sash,.24,.16,.05,g);}
      else{mesh(rbox(.08,1.15,.04,.01),sash,0,0,.06,g);mesh(rbox(1,.06,.04,.01),sash,0,.15,.06,g);}
      if(!broken)mesh(new T.PlaneGeometry(1,1.1),M.glass,0,0,.04,g);
      else{/* blown in: what is left of the glass is a ragged ring of shards in the frame round a hole, the rest lies below
           the window outside and in on the sill; a house that burned has none left at all */const wq=rng(Math.round(x*97+z*31)+hi*7);
        if(!gutted){const sh=new T.Shape();sh.moveTo(-.5,-.55);sh.lineTo(.5,-.55);sh.lineTo(.5,.55);sh.lineTo(-.5,.55);sh.closePath();const hp=new T.Path(),n=13,cx=(wq()-.5)*.25,cy=(wq()-.5)*.25;
          for(let k=0;k<n;k++){const a=k/n*Math.PI*2,r=(.32+wq()*.16)*(k%2?.75:1);hp.lineTo(clamp(cx+Math.cos(a)*r*1.05,-.47,.47),clamp(cy+Math.sin(a)*r*1.15,-.52,.52));}hp.closePath();sh.holes.push(hp);mesh(new T.ShapeGeometry(sh),M.glass,0,0,.04,g);}
        const sg=[];for(let k=0;k<14;k++){const lx=(wq()-.5)*1.3,lz=.25+wq()*.9,[hx,hz]=[x+lx*Math.cos(ry)+lz*Math.sin(ry),z-lx*Math.sin(ry)+lz*Math.cos(ry)],[wx,wz]=villW(hd,hx,hz);
          const t=new T.BufferGeometry(),s_=.03+wq()*.07;t.setAttribute('position',new T.Float32BufferAttribute([0,0,0,s_,0,s_*(wq()-.3),s_*(wq()-.5),0,s_],3));t.computeVertexNormals();t.rotateY(wq()*6);t.translate(lx,H(wx,wz)-(FL+1.45)+.012,lz);sg.push(t);}
        mesh(merge(sg),memo('shardM',()=>std({color:C(0xb8c8c8),roughness:.08,metalness:.1,transparent:true,opacity:.5,envMapIntensity:1.4,side:T.DoubleSide})),0,0,0,g,false);
        /* the net curtain sucked out through the hole by the blast, hanging down the wall */
        if(!boarded&&!gutted&&wq()<.6){const cg=new T.PlaneGeometry(.5,1.1,4,12),P=cg.attributes.position;for(let i=0;i<P.count;i++){const yy=P.getY(i),xx=P.getX(i),t=(.55-yy)/1.1;P.setZ(i,Math.sin(t*Math.PI)*.22+t*.08+Math.sin(xx*9+yy*5)*.02);P.setY(i,yy-t*t*.15);}cg.computeVertexNormals();
          mesh(cg,memo('netCurtain',()=>std({map:TX.cloth,color:C(0xe8e2d2),roughness:1,transparent:true,opacity:.75,side:T.DoubleSide})),(wq()-.5)*.3,-.1,.12,g,false);}}
      if(!boarded)mesh(new T.PlaneGeometry(.95,.7),memo('netCurtain',()=>std({map:TX.cloth,color:C(0xe8e2d2),roughness:1,transparent:true,opacity:.75,side:T.DoubleSide})),0,.15,-.05,g,false);
      if(!masonry&&st.shut!==0||st.shut)[-1,1].forEach(s=>{const sh=new T.Group();sh.position.set(s*(masonry?.66:.62),0,(masonry?.15:.178)+po);g.add(sh);sh.rotation.y=-s*(broken&&s>0?.95:.1);mesh(rbox(.55,1.15,.04,.01),paint,s*.29,0,0,sh);mesh(rbox(.4,.06,.05,.01),trimM,s*.29,.3,0,sh);mesh(rbox(.4,.06,.05,.01),trimM,s*.29,-.3,0,sh);});
      if(boarded)[[.25,.12],[-.2,-.1],[-.5,.05]].forEach(([y,rz])=>{const b=mesh(rbox(1.35,.15,.03,.01),M.boards,0,y,.21+po,g);b.rotation.z=rz;});
      mesh(rbox(1.1,.05,.25,.01),M.boards,0,-.6,-.2,g);};
    const bo=!!hd.boarded,kTop=Math.ceil((FL+2.1-FL-.11)/LS),okW=(nm,a)=>stands(nm,a-.55,kTop)&&stands(nm,a+.55,kTop)&&stands(nm,a,kTop);
    /* (the street side took the blasts: its windows are the ones blown in, more of them the harder the house was hit) */
    const dq=rng(4400+hi),dmg=st.dmg||0,brk=(front)=>gutted||(dmg>0&&dq()<(front?.35:.18)*dmg);
    fW.forEach((o,i)=>{const a=(o[0]+o[1])/2;if(okW('front',a))win(a,D/2,0,bo||(hi===2&&i===1)||!!ruin||brk(true),bo);});if(!hd.dvor&&okW('back',bwx))win(bwx,-D/2,Math.PI,bo||brk(false),bo);
    if(hi%2){if(okW('west',0))win(-W/2,0,-Math.PI/2,bo||brk(false),bo);}else{if(okW('east',0))win(W/2,0,Math.PI/2,bo||hi===0||brk(false),bo);if(D>7&&okW('east',2.1))win(W/2,2.1,Math.PI/2,bo||brk(false),bo);}
    /* shrapnel: a spray of strikes over the street front (and some round the corners), thickest low and toward where the
       shell burst, none in the openings */
    if(dmg&&!ruin){const pq=rng(8800+hi),quads=[],n=[0,60,130,200][dmg],ac=(pq()-.5)*W*.6;const surf=(nm,c,axis,o,a,y)=>{
        if(open[nm].some(op=>a>op[0]-.04&&a<op[1]+.04&&y>op[2]-.04&&y<op[3]+.04))return null;let off,ny=0;
        if(WK==='log'){const y0=FL+.11+(axis==='z'?LS/2:0),k=Math.round((y-y0)/LS);if(k<0||k>=NL)return null;const d=y-(y0+k*LS);if(Math.abs(d)>LR*.9)return null;off=Math.sqrt(LR*LR-d*d);ny=d/LR;}
        else if(WK==='lap')off=LR+.035+.016;else if(WK==='vboard')off=LR+.035+.015;else off=LR+.002;
        const nz=Math.sqrt(Math.max(0,1-ny*ny));const P=axis==='x'?V3(a,y,c+o*(off+.002)):V3(c+o*(off+.002),y,a);const N=axis==='x'?V3(0,ny,o*nz):V3(o*nz,ny,0);return{P,N,t:axis==='x'?V3(1,0,0):V3(0,0,1)};};
      for(let i=0;i<n;i++){const w=pq()<.72?WALLS[0]:WALLS[(1+pq()*3)|0];const [nm,c,axis,o]=w,half=(axis==='x'?W:D)/2-.05;
        const a=nm==='front'?clamp(ac+(pq()+pq()+pq()-1.5)*W*.5,-half,half):(pq()-.5)*2*half,y=FL-.02+Math.pow(pq(),1.6)*(top-FL);const r=surf(nm,c,axis,o,a,y);if(!r)continue;
        const sz=.05+pq()*.09,g=new T.PlaneGeometry(sz,sz),cu=(pq()*4)|0,cv=(pq()*4)|0,U=g.attributes.uv;for(let k=0;k<U.count;k++)U.setXY(k,(cu+U.getX(k))/4,(cv+U.getY(k))/4);
        const b=V3().crossVectors(r.N,r.t).normalize();if(b.y<0)b.negate();const t=V3().crossVectors(b,r.N).normalize();g.applyMatrix4(new T.Matrix4().makeBasis(t,b,r.N).setPosition(r.P));g.rotateY(0);quads.push(g);}
      if(quads.length){const pm=mesh(merge(quads),pockM(masonry?'stone':'wood'),0,0,0,h,false);pm.renderOrder=1;pm.receiveShadow=true;}}
    /* the roof: overhanging eaves; gable roofs carry painted board gables, hip roofs slope on all four sides */
    const ov=.55,ridge=top+(hd.hip?1.5:1.6),eave=top-.2,ex=W/2+(hd.hip?ov:.6),ez=D/2+ov;
    const roofM=hd.roof==='tin'?tinM(hd.rc||0x6a6e70):(hd.hip?slateDS:M.slate);
    if(ruin==='collapse'){ruinRoof(h,hd,hi,W,D,top,ridge,fallen,logM,(nm,a)=>{let k=0;while(k<NL&&stands(nm,a,k))k++;return FL+.11+(k-1)*LS+LR*.8;});}
    else if(!hd.hip){/* a gable roof of corrugated sheets (asbestos slate or painted tin) on battens and rafters, laid sheet by
         sheet. Where blast and splinters hit it: sheets gone in a ragged patch, the battens and rafters showing through
         and the dark of the loft under them; sheets torn loose and peeled back, curling up off the roof; the ones blown
         off lying broken in the yard below. A burned-out house keeps only its charred rafters and a few hanging sheets */
      const slope=Math.hypot(ez,ridge-eave),pitch=Math.atan2(ridge-eave,ez);const rq=rng(9100+hi);
      const sheet=G('vsheet'+D,()=>{const g=new T.PlaneGeometry(1.12,slope,28,1);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/.167*Math.PI*2)*.018);g.computeVertexNormals();return g;});
      /* (a sheet torn loose stays nailed along its upper part; the lower part, where the blast got under it, is bent up
         off the roof - a curl of a half-metre or so at the eave, not the whole sheet lifted) */
      const curl=(phi,flat=.55)=>{const g=new T.PlaneGeometry(1.12,slope,28,14);const p=g.attributes.position,d0=slope*flat,k=phi/Math.max(.3,slope-d0);for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),d=slope/2-y;const cz=Math.sin(x/.167*Math.PI*2)*.018;
          if(d<=d0){p.setXYZ(i,x,y,cz);continue;}const th=k*(d-d0);p.setXYZ(i,x,slope/2-d0-Math.sin(th)/k+Math.sin(th)*cz,(1-Math.cos(th))/k+Math.cos(th)*cz);}g.computeVertexNormals();return g;};
      const nS=Math.ceil(2*ex/1.03),xs=i=>-ex+.55+i*1.03,rot=s=>s>0?-(Math.PI/2-pitch):Math.PI/2-pitch;
      const at=(s,x,t,dn)=>V3(x,ridge-(ridge-eave)*t-Math.cos(pitch)*(dn||0),s*ez*t-s*Math.sin(pitch)*(dn||0));
      const gone=new Set(),peel=new Map();
      if(gutted){for(let i=0;i<nS;i++)for(const s_ of [-1,1]){if(rq()<.82)gone.add(s_+':'+i);else if(rq()<.5)peel.set(s_+':'+i,-.9-rq()*.8);}}
      else if(dmg){const c0=1+((rq()*(nS-3))|0),w_=dmg>=2?2+((rq()*2)|0):((rq()<.6)?1:0);for(let i=c0;i<c0+w_&&i<nS;i++)gone.add('1:'+i);
        for(let k=0;k<dmg+((rq()*2)|0);k++){const i=(rq()*nS)|0,s_=rq()<.75?1:-1;if(!gone.has(s_+':'+i))peel.set(s_+':'+i,.5+rq()*1.1);}}
      if(hd.burnt){gone.add('1:2');gone.add('1:3');gone.add('1:4');}if(ruin==='strike'){for(let i=hd.hole[1];i<=hd.hole[2];i++)gone.add(hd.hole[0]+':'+i);}
      const fallen=[],lath=[],raft=[];
      [-1,1].forEach(s_=>{for(let i=0;i<nS;i++){const key=s_+':'+i,x=xs(i);
        if(gone.has(key)){/* the battens across the gap (some snapped), the rafters at its sides */for(let t=.06;t<.98;t+=.36/slope){if(rq()<(gutted?.45:.12))continue;const A=at(s_,x-.56,t,.04),B=at(s_,x+.56,t,.04);if(rq()<.15)B.lerp(A,.4+rq()*.3);lath.push(beamG(A,B,.05,.025));}
          [x-.52,x+.52].forEach(xx=>{if(gutted&&rq()<.3)return;const A=at(s_,xx,0,.1),B=at(s_,xx,1,.1);if(gutted&&rq()<.4)B.lerp(A,.3+rq()*.4);raft.push(beamG(A,B,.06,.13));});
          if(!gutted&&s_>0&&rq()<.85){const [lx,lz]=[x+(rq()-.5)*2,D/2+1.4+rq()*3];fallen.push([lx,lz,rq()]);}continue;}
        const ph=peel.get(key);if(ph!==undefined){const g=curl(Math.abs(ph));const m=mesh(g,roofM,x,0,0,h);if(ph>0){const T0=at(s_,x,0,-.01);m.position.copy(T0);m.rotation.set(rot(s_),0,0);m.updateMatrix();
            /* (pivot the curl at the sheet's top edge: geometry is centred, so shift it up half a slope) */g.translate(0,-slope/2,0);m.position.copy(at(s_,x,0,-.012));}
          else{/* hanging down off a burned roof by its top fixing */g.translate(0,-slope/2,0);m.position.copy(at(s_,x,(rq()*.5),-.01));m.rotation.set(rot(s_)+s_*1.1,0,(rq()-.5)*.3);}shootables.push(m);continue;}
        const m=mesh(sheet,roofM,x,(ridge+eave)/2,s_*ez/2,h);m.rotation.set(rot(s_),0,0);shootables.push(m);}});
      if(lath.length)mesh(merge(lath),gutted?charred:WM.board,0,0,0,h);if(raft.length)mesh(merge(raft),gutted?charred:M.post,0,0,0,h);
      /* (the loft seen through the gap: its floor of clay and sawdust laid over the ceiling boards, lit in a patch where the
         sheets are gone and dim under the rest of the roof; the bits of slate the blast knocked in lying on it) */
      if(gone.size&&!gutted){const lf=new T.PlaneGeometry(W-.2,D-.2);lf.rotateX(-Math.PI/2);worldUV(lf,.8);mesh(lf,memo('loftFloor',()=>std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0x8a7a64),roughness:1,envMapIntensity:.15})),0,top+.115,0,h,false);
        const lq=rng(4100+hi),bits=[];for(let i=0;i<9;i++){const g_=rbox(.12+lq()*.2,.008,.08+lq()*.14,.003);g_.rotateY(lq()*6.28);g_.rotateZ((lq()-.5)*.25);g_.translate((lq()-.5)*(W-1),top+.125+lq()*.02,(lq()-.5)*(D-1));bits.push(g_);}
        mesh(merge(bits),roofM,0,0,0,h,false);}
      if(!gutted)mesh(rbox(2*ex+.1,.08,.36,.02),roofM,0,ridge+.02,0,h);
      /* the blown-off sheets in the yard, cracked and buckled */
      /* (only in the open strip of yard between the porch and the street fence, clear of the gate path; broken lengths
         turned along the strip; each one laid over the ground point by point, so it neither floats nor sinks, and never
         runs through the porch or the fence) */
      {const zA=D/2+(hd.ver?2.7:1.9)+.35,zB=hd.plotL[3]-.9,gxp=(hi%2?.6:.2)-.45,fq=rng(7700+hi);let n=0;
       if(zB-zA>.7)for(const [lx0,lz0,r] of fallen){if(n>=3)break;const nk=(roofM===M.slate||roofM===slateDS)?2:1;
        for(let k=0;k<nk;k++){const len=.42+fq()*.18,Lz=slope*len;let lx=(fq()-.5)*(W-1.6);if(Math.abs(lx-gxp)<1.2+Lz/2)lx=gxp+(lx<gxp?-1:1)*(1.25+Lz/2);if(Math.abs(lx)>W/2+.4)continue;
          const lz=zA+.35+fq()*Math.max(0,zB-zA-.7);const g=curl(.3+r*.5);g.scale(1,len,1);g.rotateX(-Math.PI/2);g.rotateY(Math.PI/2+(fq()-.5)*.5);g.translate(lx,0,lz);
          const P=g.attributes.position;let ok=true;for(let i=0;i<P.count;i++){const z=P.getZ(i);if(z<zA-.1||z>zB+.1){ok=false;break;}}if(!ok)continue;
          for(let i=0;i<P.count;i++){const x=P.getX(i),z=P.getZ(i);P.setY(i,P.getY(i)+gY(hd,x,z)+.03);}g.computeVertexNormals();shootables.push(mesh(g,roofM,0,0,0,h));n++;}}}}
    else{const rx=hd.hip?Math.max(.2,W/2-D/2):ex;const sl=Math.hypot(ez,ridge-eave)*1.6;const parts=[];
      parts.push(quad([-ex,eave,ez],[ex,eave,ez],[rx,ridge,0],[-rx,ridge,0],-ex,ex,0,sl),quad([ex,eave,-ez],[-ex,eave,-ez],[-rx,ridge,0],[rx,ridge,0],-ex,ex,0,sl));
      if(hd.hip){const sl2=Math.hypot(ex-rx,ridge-eave)*1.6;parts.push(tri([ex,eave,ez],[ex,eave,-ez],[rx,ridge,0],-ez,ez,0,0,sl2),tri([-ex,eave,-ez],[-ex,eave,ez],[-rx,ridge,0],-ez,ez,0,0,sl2));}
      const rm=mesh(merge(parts),roofM,0,0,0,h);shootables.push(rm);mesh(rbox(2*rx+.2,.08,.2,.02),roofM,0,ridge+.01,0,h);
      /* (a hit hip roof: sheets torn loose and lying askew over the slope, one blown down into the yard) */
      if(dmg){const lq=rng(9300+hi),pitchH=Math.atan2(ridge-eave,ez),slH=Math.hypot(ez,ridge-eave);for(let k=0;k<dmg+1;k++){const x=(lq()-.5)*2*(rx-.6),t=.15+lq()*.4,g=new T.PlaneGeometry(1.0,1.6,20,8),P=g.attributes.position;
          for(let i=0;i<P.count;i++){const yy=P.getY(i),xx=P.getX(i);P.setZ(i,Math.sin(xx/.167*Math.PI*2)*.016+Math.max(0,-yy-.2)*.35*lq()+.02);}g.computeVertexNormals();
          const m=mesh(g,roofM,x,ridge-(ridge-eave)*t,ez*t+.01,h);m.rotation.set(-(Math.PI/2-pitchH),0,(lq()-.5)*.6);m.translateZ(.03);}
        {const zA=D/2+(hd.ver?2.7:1.9)+.35,zB=hd.plotL[3]-.9,gxp=(hi%2?.6:.2)-.45;let lx=(lq()-.5)*(W-1.6);if(Math.abs(lx-gxp)<2)lx=gxp+(lx<gxp?-2:2);
         if(zB-zA>1.1&&Math.abs(lx)<W/2+.4){const lz=(zA+zB)/2,g=new T.PlaneGeometry(1.0,1.5,20,6),P=g.attributes.position;for(let i=0;i<P.count;i++){P.setZ(i,Math.sin(P.getX(i)/.167*Math.PI*2)*.016+Math.pow(Math.abs(P.getY(i)),2)*.25);}
          g.rotateX(-Math.PI/2);g.rotateY(Math.PI/2+(lq()-.5)*.4);g.translate(lx,0,lz);for(let i=0;i<P.count;i++)P.setY(i,P.getY(i)+gY(hd,P.getX(i),P.getZ(i))+.03);g.computeVertexNormals();shootables.push(mesh(g,roofM,0,0,0,h));}}}
      /* fascia boards along the eaves */[[0,ez,2*ex,'x'],[0,-ez,2*ex,'x']].concat(hd.hip?[[ex,0,2*ez,'z'],[-ex,0,2*ez,'z']]:[]).forEach(([x,z,L,ax])=>mesh(rbox(ax==='x'?L:.04,.16,ax==='x'?.04:L,.01),M.trimWhite,x,eave-.07,z,h));}
    if(!hd.hip&&ruin!=='collapse'&&!gutted)[-1,1].forEach(s=>{const gs=new T.Shape();gs.moveTo(-D/2-.1,0);gs.lineTo(D/2+.1,0);gs.lineTo(0,ridge-top+.05);gs.closePath();const gg=new T.ExtrudeGeometry(gs,{depth:.05,bevelEnabled:false});worldUV(gg,1);
      const gm=mesh(gg,hd.burnt?charred:hd.clad?cladM:paint,s*(W/2+(hd.clad?LR+.06:masonry?LR-.04:.05)),top-.02,0,h);gm.rotation.y=s*Math.PI/2;
      /* the attic window in the gable: a cross-barred casement in a frame, glazed, under a little pediment */{const ag=new T.Group();ag.position.set(s*(W/2+(hd.clad?LR+.115:masonry?LR+.015:.105)),top+.62,0);ag.rotation.y=s*Math.PI/2;h.add(ag);
        [[0,.29,.56,.06],[0,-.29,.56,.06],[-.25,0,.06,.64],[.25,0,.06,.64]].forEach(b=>mesh(rbox(b[2],b[3],.05,.006),trimM,b[0],b[1],.02,ag));mesh(rbox(.035,.52,.03,.004),trimM,0,0,.015,ag);mesh(rbox(.44,.035,.03,.004),trimM,0,.05,.015,ag);
        mesh(new T.PlaneGeometry(.46,.54),memo('atticGlass',()=>std({color:C(0x1c2224),roughness:.08,metalness:.2,envMapIntensity:1.2})),0,0,.004,ag);const pdS=new T.Shape();pdS.moveTo(-.36,0);pdS.lineTo(.36,0);pdS.lineTo(0,.16);pdS.closePath();mesh(new T.ExtrudeGeometry(pdS,{depth:.03,bevelEnabled:false}),trimM,0,.32,.0,ag);}});
    /* a dormer (svetyolka) on the street slope of some gable roofs: a little boarded front with its window and a gable of
       its own, set into the slope - the part of it under the roof is inside the loft and never seen */
    if(st.dorm&&!hd.hip&&!ruin){const zf=ez*.68,ry0=eave+(ridge-eave)*(1-zf/ez),dw=1.7,wh=1.0,base=ry0-.12,rise=Math.min(.42,ridge-(base+wh)-.04),dg=new T.Group();dg.position.set(0,base,zf);h.add(dg);
      const dp=[];for(let x=-dw/2;x<dw/2-.01;x+=.14){const x1=Math.min(dw/2,x+.14),xm=(x+x1)/2;if(Math.abs(xm)<.36){const lo=rbox(x1-x-.006,.18,.025,.003);lo.translate(xm,.09,0);dp.push(lo);const up=rbox(x1-x-.006,.12,.025,.003);up.translate(xm,wh-.06,0);dp.push(up);continue;}
        const b=rbox(x1-x-.006,wh,.025,.003);b.translate(xm,wh/2,0);dp.push(b);}
      [-1,1].forEach(sg=>{const sw=rbox(.025,wh,zf+.02,.003);sw.translate(sg*dw/2,wh/2,-zf/2);dp.push(sw);});mesh(merge(dp),cladM,0,0,0,dg);
      const gs=new T.Shape();gs.moveTo(-dw/2-.05,0);gs.lineTo(dw/2+.05,0);gs.lineTo(0,rise);gs.closePath();const gg=new T.ExtrudeGeometry(gs,{depth:.03,bevelEnabled:false});worldUV(gg,1);mesh(gg,cladM,0,wh,-.01,dg);
      const sl=Math.hypot(dw/2+.15,rise),pa=Math.atan2(rise,dw/2+.15);[-1,1].forEach(sg=>{const r=rbox(sl,.035,zf+.3,.006);r.rotateZ(-sg*pa);mesh(r,roofM,sg*(dw/2+.15)/2,wh+rise/2+.03,-zf/2+.1,dg);const bb=rbox(sl+.04,.12,.03,.004);bb.rotateZ(-sg*pa);mesh(bb,trimM,sg*(dw/2+.15)/2,wh+rise/2,.05,dg);});
      /* its window: a twin casement in a carved frame */[[0,.82,.86,.07],[0,.17,.86,.07],[-.4,.5,.07,.72],[.4,.5,.07,.72]].forEach(b=>mesh(rbox(b[2],b[3],.05,.006),trimM,b[0],b[1],.03,dg));
      mesh(new T.PlaneGeometry(.72,.6),M.glass,0,.5,.01,dg);mesh(rbox(.04,.6,.03,.004),paint,0,.5,.025,dg);mesh(rbox(.72,.04,.03,.004),paint,0,.62,.025,dg);
      const pd=new T.Shape();pd.moveTo(-.5,0);pd.lineTo(.5,0);pd.lineTo(0,.2);pd.closePath();mesh(new T.ExtrudeGeometry(pd,{depth:.03,bevelEnabled:false}),trimM,0,.87,.02,dg);}
    if(ruin==='collapse'){/* the stove and its chimney stand when the house round them has gone - as they do */const cx=hi%2?-W/2+1.2:W/2-1.2;const sg=new T.Group();sg.scale.x=hi%2?-1:1;sg.userData.noMerge=true;h.add(sg);russianStove(sg,W/2-.98,FL,-D/2+1.05,top-FL-.06);
      /* (the stack rises straight off the stove's own flue, at the back of the stove) */chimney(h,(hi%2?-1:1)*(W/2-.67),top-.08,ridge+.92,-D/2+.485,false);wb(sd>0?W/2-1.78:-W/2+.18,sd>0?W/2-.18:-W/2+1.78,-D/2+.1,-D/2+2.05);}
    else{const cx=hi%2?-W/2+1.2:W/2-1.2;chimney(h,cx,ridge-1.5,ridge+.92,-.4,hi%3!==0);}
    /* in front of the door: a glazed veranda (the small one round the door, or one across the whole front), or an open porch */
    if(hd.ver){const vw=hd.ver===2?W-.4:3.2,vd=2.3,vx=hd.ver===2?0:dx-.45,vz=D/2+vd/2+.02;const vg=new T.Group();vg.position.set(vx,0,vz);h.add(vg);
      mesh(rbox(vw,FL+.25,vd,.01),M.concrete,0,(FL-.25)/2,0,vg);mesh(rbox(vw-.1,.05,vd-.1,.01),M.planks,0,FL+.005,0,vg);
      const dw=1.0,dxx=(hd.ver===2?dX0+.5-vx:0);
      /* lower walls of boards, the glazing above in small panes behind white glazing bars, posts at the corners */
      const sides=[['f',vd/2,vw,'x'],['l',-vw/2,vd,'z'],['r',vw/2,vd,'z']];
      sides.forEach(([k,c,L,ax])=>{const segs=k==='f'?[[-L/2,dxx-dw/2],[dxx+dw/2,L/2]]:[[-L/2,L/2]];
        segs.forEach(([a,b])=>{if(b-a<.05)return;const len=b-a,mid=(a+b)/2;const px=ax==='x'?mid:c,pz=ax==='x'?c:mid;
          mesh(rbox(ax==='x'?len:.08,.9,ax==='x'?.08:len,.01),cladM,px,FL+.45,pz,vg);mesh(rbox(ax==='x'?len:.12,.06,ax==='x'?.12:len,.01),M.trimWhite,px,FL+.92,pz,vg);
          mesh(new T.PlaneGeometry(len,1.1),M.glass,px,FL+1.5,pz,vg).rotation.y=ax==='x'?0:Math.PI/2;
          const n=Math.max(1,Math.round(len/.45));for(let i=0;i<=n;i++){const t=a+len*i/n;mesh(rbox(.05,1.15,.06,.005),M.trimWhite,ax==='x'?t:c,FL+1.5,ax==='x'?c:t,vg);}
          [1.15,1.85,2.08].forEach(y=>mesh(rbox(ax==='x'?len:.06,.05,ax==='x'?.06:len,.005),M.trimWhite,px,FL+y-(y===1.15?.0:0),pz,vg));});});
      [[-vw/2,vd/2],[vw/2,vd/2]].forEach(([x,z])=>mesh(rbox(.12,2.2,.12,.01),M.trimWhite,x,FL+1.1,z,vg));
      /* the doorway: its jamb posts (the boarding, the sill and the glazing bars all end against them) and the head over it,
         the glazed transom above */
      [-1,1].forEach(k=>mesh(rbox(.1,2.2,.12,.01),M.trimWhite,dxx+k*(dw/2+.03),FL+1.1,vd/2,vg));mesh(rbox(dw+.16,.08,.12,.01),M.trimWhite,dxx,FL+2.06,vd/2,vg);
      mesh(rbox(dw+.16,.05,.06,.005),M.trimWhite,dxx,FL+2.27,vd/2,vg);mesh(new T.PlaneGeometry(dw,.2),M.glass,dxx,FL+2.16,vd/2,vg);
      const vr=mesh(rbox(vw+.3,.05,vd+.25,.01),roofM,0,FL+2.25,.105+LR+(hd.clad?.06:0),vg);vr.rotation.x=.16;
      /* the steps up to its doorway */mesh(rbox(1.2,FL*.5,.35,.01),M.boards,dxx,FL*.25,vd/2+.2,vg);
      const vr0=villRect(hd,vx-vw/2,vx+vw/2,D/2,D/2+vd);PORCHES.push(Object.assign(vr0,{y:FL}));const st=villRect(hd,vx+dxx-.6,vx+dxx+.6,D/2+vd,D/2+vd+.4);PORCHES.push(Object.assign(st,{y:FL*.5}));
      if(hd.enter)HOUSES.push(villRect(hd,vx-vw/2,vx+vw/2,D/2,D/2+vd));
      wb(vx-vw/2-.06,vx-vw/2+.06,D/2,D/2+vd);wb(vx+vw/2-.06,vx+vw/2+.06,D/2,D/2+vd);wb(vx-vw/2,vx+dxx-dw/2,D/2+vd-.06,D/2+vd+.06);wb(vx+dxx+dw/2,vx+vw/2,D/2+vd-.06,D/2+vd+.06);}
    else{const porch=new T.Group();porch.position.set(dx-.45,0,D/2+.75);h.add(porch);
      /* the open porch (kryltso): a boarded base, a deck of planks, two steps, turned posts, side rails on balusters, and its
         canopy - a little gable with its own carved pediment on some houses, a lean-to on rafters on others */
      const wz=-.75+LR+(WK==='lap'||WK==='vboard'?.08:.02),pq=rng(5300+hi),pk=[];
      mesh(rbox(1.8,FL+.2,1.3,.01),M.boards,0,(FL-.2)/2-.01,0,porch);
      for(let i=0;i<11;i++){const z=-.65+(i+.5)*1.3/11,b=rbox(1.84,.03,1.3/11-.008,.004);b.translate((pq()-.5)*.01,FL+.012,z);pk.push(b);}
      [[FL*.5,.82,.36],[FL*.25,.98,.3]].forEach(([y,z,d])=>{const b=rbox(1.3,y,d,.008);b.translate(0,y/2-.02,z-.05);pk.push(b);const t=rbox(1.34,.03,d+.03,.004);t.translate(0,y,z-.05);pk.push(t);});
      mesh(merge(pk),M.boards,0,0,0,porch);
      const postG=G('porchPost',()=>lathe([[0,0],[.07,0],[.07,.08],[.055,.1],[.05,.14],[.06,.2],[.045,.26],[.045,1.6],[.055,1.66],[.04,1.72],[.04,1.86],[.06,1.9],[.065,1.96],[.06,2.02],[0,2.02]],16));
      const balG=G('porchBal',()=>lathe([[0,0],[.022,0],[.022,.05],[.016,.08],[.03,.24],[.016,.42],[.022,.45],[.022,.5],[0,.5]],10));
      const ph=2.45;[-.85,.85].forEach((x,i)=>{const pp=mesh(postG,trimM,x,FL,.55,porch);pp.scale.y=(ph-FL)/2.02;if(ruin==='collapse'){if(i===1){pp.rotation.z=1.5;pp.position.set(.95,FL+.07,.62);}else{pp.rotation.set(.25,0,-.62);pp.position.set(-.9,FL,.5);}}});
      if(ruin!=='collapse'){[-.85,.85].forEach(x=>{mesh(rbox(.05,.05,1.15,.006),trimM,x,FL+.85,wz/2+.28,porch);mesh(rbox(.05,.05,1.15,.006),trimM,x,FL+.1,wz/2+.28,porch);for(let k=0;k<6;k++)mesh(balG,trimM,x,FL+.12,-.45+k*.16,porch).scale.y=1.42;});
        mesh(rbox(1.92,.12,.1,.01),M.post,0,ph+.06,.55,porch);[-.85,.85].forEach(x=>mesh(rbox(.08,.1,.55-wz,.01),M.post,x,ph+.05,(wz+.55)/2,porch));
        if(hi%2){/* gable canopy */const half=1.0,rise=.5,sl=Math.hypot(half,rise),pa=Math.atan2(rise,half),L=.69-wz;[-1,1].forEach(sg=>{const r=rbox(sl+.08,.04,L,.006);r.rotateZ(-sg*pa);mesh(r,roofM,sg*half/2,ph+.13+rise/2,wz+L/2,porch);});
          const gs=new T.Shape();gs.moveTo(-half,0);gs.lineTo(half,0);gs.lineTo(0,rise);gs.closePath();const ho=new T.Path();ho.absarc(0,rise*.4,.09,0,Math.PI*2,true);gs.holes.push(ho);
          mesh(new T.ExtrudeGeometry(gs,{depth:.03,bevelEnabled:false,curveSegments:16}),trimM,0,ph+.1,.6,porch);
          [-1,1].forEach(sg=>{const bb=rbox(sl+.12,.12,.03,.006);bb.rotateZ(-sg*pa);mesh(bb,trimM,sg*half/2,ph+.1+rise/2,.645,porch);});}
        else{/* lean-to on rafters */const z0=wz,z1=.72,y0=ph+.42,y1=ph+.13,ln=Math.hypot(z1-z0,y0-y1),pa=Math.atan2(y0-y1,z1-z0);
          for(let k=0;k<4;k++){const r=rbox(.05,.09,ln,.006);r.rotateX(pa);mesh(r,M.post,-.85+k*.567,(y0+y1)/2+.02,(z0+z1)/2,porch);}
          const rf=rbox(2.1,.04,ln+.1,.006);rf.rotateX(pa);mesh(rf,roofM,0,(y0+y1)/2+.085,(z0+z1)/2,porch);const fa=rbox(2.12,.14,.03,.004);mesh(fa,trimM,0,y1+.03,z1+.05,porch);}}
      PORCHES.push(Object.assign(villRect(hd,dx-1.35,dx+.45,D/2,D/2+1.45),{y:FL}),Object.assign(villRect(hd,dx-1.35,dx+.45,D/2+1.45,D/2+1.75),{y:FL*.5}));}
    /* the things on a lived-in house's front: the yellow gas pipe on its brackets coming up the corner and along under
       the eaves to the meter by the door, the electricity meter box, the street number, a television aerial on its mast
       at the gable, a satellite dish */
    if(!hd.boarded&&!ruin){/* (everything here sits ON the wall's outer face: the rendered or brick face, the lap boards' lower edges, the
         battens; on bare logs - which only touch a flat thing along one crest - each piece is screwed to a painted backing
         board that bridges the logs, as they are) */
      const fOff=WK==='lap'?.056:WK==='vboard'?.066:masonry?.001:.003,logW=!masonry&&WK!=='lap'&&WK!=='vboard';
      const q=rng(7700+hi),fo=D/2+LR+fOff,cs=-sd,cx=cs*(W/2+LR+fOff);
      /* (behind a veranda across the whole front, the meter, the number and the gas come in on the side wall instead) */
      const side=hd.ver===2;const onWall0=(lx,ly,off)=>side?{p:V3(cx+cs*off,ly,D/2-.9-lx),ry:cs*Math.PI/2}:{p:V3(lx,ly,fo+off),ry:0};
      const bk=logW?.028:0,backM=memo('mountBoard',()=>std({map:M.boards.map,color:C(0x6f6a5c),roughness:.9}));
      const backer=(lx,ly,w,hh)=>{if(!logW)return;const b_=onWall0(lx,ly,bk/2);const m=mesh(rbox(w,hh,bk,.004),backM,b_.p.x,b_.p.y,b_.p.z,h);m.rotation.y=b_.ry;};
      const onWall=(lx,ly,off)=>onWall0(lx,ly,off+bk);
      /* (every box and plate on the wall gets a free patch of it: clear of the window surrounds and pediments, of the
         shutters where they open, of the door, of each other, and in from the corners) */
      const hasSh=(!masonry&&st.shut!==0)||!!st.shut,mg=hasSh?.5:.2,nmW=side?(cs>0?'east':'west'):'front',taken=[];
      const lim=side?D/2-.3:W/2-.3,toA=lx=>side?D/2-.9-lx:lx,toL=a=>side?D/2-.9-a:a;
      const free=(a,y,hw,hh)=>Math.abs(a)+hw<lim&&open[nmW].every(o=>a+hw<o[0]-mg||a-hw>o[1]+mg||y+hh<o[2]-.05||y-hh>o[3]+.42)&&taken.every(t=>a+hw<t[0]-.06||a-hw>t[1]+.06||y+hh<t[2]-.06||y-hh>t[3]+.06);
      const slot=(a0,dir,y,hw,hh)=>{for(const d of [dir,-dir])for(let k=0;k<40;k++){const a=a0+d*k*.1;if(free(a,y,hw,hh)){taken.push([a-hw,a+hw,y-hh,y+hh]);return a;}}return null;};
      const doorA=side?D/2-.9:(cs>0?dX1+.35:dX0-.35),dirA=side?-1:cs;
      const gasA=st.gas?slot(doorA,dirA,FL+1.55,.19,.24):null;
      if(st.gas&&gasA!==null){const gy=Math.min(top-.25,FL+2.55),px=[],run=(A,B)=>{px.push(new T.CylinderGeometry(.021,.021,A.distanceTo(B),16).applyMatrix4(new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(V3(0,1,0),V3().subVectors(B,A).normalize()),V3(1,1,1))));};
        const mpos=onWall(toL(gasA),FL+1.55,.08);
        /* the meter: a household diaphragm meter - its painted case, the dial face with the counter in its window, the
           inlet and outlet stubs on top with their union nuts; the riser comes down into the inlet, the outlet turns back
           into the wall */
        const mb=mesh(rbox(.26,.32,.16,.012),memo('gasMeterBody',()=>std({color:C(0xc9c4b2),roughness:.5,metalness:.15,envMapIntensity:.5})),mpos.p.x,mpos.p.y,mpos.p.z,h);mb.rotation.y=mpos.ry;mb.updateMatrix();
        const face=memo('gasMeterFace',()=>tex(240,296,(c,w,hh)=>{c.fillStyle='#c9c4b2';c.fillRect(0,0,w,hh);const q2=rng(31);for(let i=0;i<900;i++){c.fillStyle=`rgba(${q2()<.5?60:255},${q2()<.5?50:250},40,${q2()*.05})`;c.fillRect(q2()*w,q2()*hh,2,2);}
          c.strokeStyle='rgba(60,56,48,.55)';c.lineWidth=3;c.strokeRect(14,14,w-28,hh-28);c.fillStyle='#e9e6dc';c.fillRect(30,70,w-60,120);c.strokeStyle='#3a3a36';c.lineWidth=2;c.strokeRect(30,70,w-60,120);
          c.fillStyle='#111';c.fillRect(44,108,w-88,40);const dg='01734';for(let i=0;i<6;i++){c.fillStyle=i<5?'#151515':'#7a1010';c.fillRect(48+i*25,111,22,34);c.fillStyle='#f2f0e8';c.font='bold 26px monospace';c.textAlign='center';c.fillText(i<5?dg[i]:'5',59+i*25,137);}
          c.fillStyle='#222';c.font='bold 18px sans-serif';c.textAlign='center';c.fillText('СГМН-1  G6',w/2,96);c.font='12px sans-serif';c.fillText('м³',w/2+90,166);c.fillText('Qmax 10 м³/ч   Pmax 50 кПа',w/2,176);
          c.font='bold 14px sans-serif';c.fillText('ГАЗ',w/2,230);c.fillStyle='#8a1a14';c.beginPath();c.arc(w-40,hh-40,7,0,7);c.fill();
          for(let i=0;i<14;i++){const x=q2()*w,l=20+q2()*80;const g2=c.createLinearGradient(x,hh-l,x,hh);g2.addColorStop(0,'rgba(120,70,30,0)');g2.addColorStop(1,'rgba(120,70,30,.35)');c.fillStyle=g2;c.fillRect(x,hh-l,2+q2()*3,l);}},{clamp:true}));
        mesh(new T.PlaneGeometry(.24,.296),memo('gasFaceM',()=>std({map:face,roughness:.45,metalness:.1,envMapIntensity:.5,polygonOffset:true,polygonOffsetFactor:-2})),0,0,.0812,mb,false);
        {const gw=mesh(new T.PlaneGeometry(.17,.034),memo('gasWinGl',()=>std({color:C(0x9aa4a8),transparent:true,opacity:.18,roughness:.05,metalness:.3,envMapIntensity:1.4,depthWrite:false})),0,.01,.0835,mb,false);}
        const at_=(x,y,z)=>V3(x,y,z).applyMatrix4(mb.matrix),inl=at_(-.07,.16,0),outl=at_(.07,.16,0),stubT=.055;
        const nutG=G('unionNut',()=>new T.CylinderGeometry(.031,.031,.026,6));[inl,outl].forEach(p_=>{px.push(new T.CylinderGeometry(.018,.018,stubT,16).translate(p_.x,p_.y+stubT/2,p_.z));px.push(nutG.clone().translate(p_.x,p_.y+stubT-.005,p_.z));});
        const iT=inl.clone().add(V3(0,stubT,0)),oT=outl.clone().add(V3(0,stubT,0));let pts;
        if(side){const xr=iT.x,zr=D/2-.6;pts=[V3(xr,gY(hd,xr,zr)-.1,zr),V3(xr,FL+1.95,zr),V3(xr,FL+1.95,iT.z),iT];}
        else{const zz=iT.z,c0=V3(cx+cs*.06,gY(hd,cx+cs*.06,fo-.3)-.1,fo-.3),c1=V3(cx+cs*.06,gy,fo-.3),c2=V3(cx+cs*.06,gy,zz),c3=V3(iT.x,gy,zz);pts=[c0,c1,c2,c3,iT];}
        for(let i=0;i<pts.length-1;i++)run(pts[i],pts[i+1]);pts.slice(1,-1).forEach(c=>px.push(new T.SphereGeometry(.03,16,10).translate(c.x,c.y,c.z)));
        /* the outlet: up a hand's width, a bend, and back into the wall through a sleeve */
        {const o1=oT.clone().add(V3(0,.07,0)),o2=side?V3(cx+cs*.005,o1.y,o1.z):V3(o1.x,o1.y,fo-.005);run(oT,o1);run(o1,o2);px.push(new T.SphereGeometry(.03,16,10).translate(o1.x,o1.y,o1.z));
         px.push(new T.CylinderGeometry(.034,.034,.03,16).rotateX(side?0:Math.PI/2).rotateZ(side?Math.PI/2:0).translate(o2.x,o2.y,o2.z));}
        if(!side){const c2=pts[2],c3=pts[3];for(let t=.15;t<1;t+=1.1/Math.max(1,c2.distanceTo(c3))){const p_=c2.clone().lerp(c3,t);px.push(new T.BoxGeometry(.03,.03,Math.max(.02,p_.z-fo)).translate(p_.x,p_.y,(p_.z+fo)/2));}}
        mesh(merge(px),gasY,0,0,0,h);backer(toL(gasA),FL+1.55,.36,.46);}
      /* the meter box and the street number */
      {const elA=slot(gasA!==null?gasA+dirA*.5:doorA,dirA,FL+1.9,.23,.29);if(elA!==null){const mp=onWall(toL(elA),FL+1.9,.065);const mm=mesh(rbox(.32,.42,.13,.012),memo('meterBox2',()=>std({color:C(0x7c8682),roughness:.55,metalness:.35,envMapIntensity:.5})),mp.p.x,mp.p.y,mp.p.z,h);mm.rotation.y=mp.ry;backer(toL(elA),FL+1.9,.44,.56);
         /* its door, painted on the front: the door seam and hinges, the lock, the yellow lightning-bolt sticker, the
            paint chipped at the edges and rust running down from the lock and the bottom corners */
         {const dt=memo('meterDoorT',()=>tex(256,336,(c,w,hh)=>{c.fillStyle='#7c8682';c.fillRect(0,0,w,hh);const q2=rng(57);for(let i=0;i<1400;i++){c.fillStyle=`rgba(${q2()<.5?20:240},${q2()<.5?24:240},${q2()<.5?22:236},${q2()*.05})`;c.fillRect(q2()*w,q2()*hh,2,2);}
             c.strokeStyle='rgba(20,22,22,.75)';c.lineWidth=3;c.strokeRect(10,10,w-20,hh-20);c.fillStyle='rgba(255,255,255,.12)';c.fillRect(12,12,w-24,3);
             c.fillStyle='#3a3e3c';[60,hh-70].forEach(y=>c.fillRect(4,y,10,34));c.fillStyle='#2a2c2c';c.fillRect(w-40,hh/2-16,18,32);c.fillStyle='#111';c.fillRect(w-34,hh/2-6,6,12);
             c.fillStyle='#e8c21a';c.beginPath();c.moveTo(w/2,hh-118);c.lineTo(w/2+34,hh-60);c.lineTo(w/2-34,hh-60);c.closePath();c.fill();c.strokeStyle='#111';c.lineWidth=3;c.stroke();
             c.fillStyle='#111';c.beginPath();c.moveTo(w/2+4,hh-106);c.lineTo(w/2-9,hh-82);c.lineTo(w/2+1,hh-82);c.lineTo(w/2-5,hh-66);c.lineTo(w/2+10,hh-90);c.lineTo(w/2,hh-90);c.closePath();c.fill();
             const rust=(x,y,l,wd)=>{const g2=c.createLinearGradient(x,y,x,y+l);g2.addColorStop(0,'rgba(120,58,22,.75)');g2.addColorStop(1,'rgba(120,58,22,0)');c.fillStyle=g2;c.fillRect(x,y,wd,l);};
             rust(w-34,hh/2+16,90,7);rust(w-28,hh/2+16,60,4);for(let i=0;i<10;i++)rust(12+q2()*(w-30),hh-24,24,3+q2()*5);
             for(let i=0;i<40;i++){const ed=q2()<.5,x=ed?(q2()<.5?6+q2()*10:w-16+q2()*10):q2()*w,y=ed?q2()*hh:(q2()<.5?6+q2()*8:hh-14+q2()*8);c.fillStyle=q2()<.5?'rgba(110,62,30,.8)':'rgba(170,170,160,.7)';c.beginPath();c.ellipse(x,y,2+q2()*5,1+q2()*3,q2()*3,0,7);c.fill();}},{clamp:true}));
          mesh(new T.PlaneGeometry(.32,.42),memo('meterDoorM',()=>std({map:dt,roughness:.55,metalness:.3,envMapIntensity:.5,polygonOffset:true,polygonOffsetFactor:-2})),0,0,.0661,mm,false);}
         /* its window onto the dial, the seal wire, the cable going up under the eaves */
         /* the window in the door: the meter behind the glass - its black face, the white drum digits, the disc edge */
         {const mt=memo('elMeterT',()=>tex(256,144,(c,w,hh)=>{c.fillStyle='#16191a';c.fillRect(0,0,w,hh);c.fillStyle='#d8d6cc';c.fillRect(10,10,w-20,hh-20);c.fillStyle='#1b1d1e';c.fillRect(30,34,w-60,38);
             for(let i=0;i<6;i++){c.fillStyle=i<5?'#eeeae0':'#b02018';c.fillRect(36+i*32,38,26,30);c.fillStyle=i<5?'#111':'#fff';c.font='bold 24px monospace';c.textAlign='center';c.fillText('204917'[i],49+i*32,62);}
             c.fillStyle='#222';c.font='bold 14px sans-serif';c.textAlign='center';c.fillText('СО-И446  220 В  10-40 А  кВт·ч',w/2,94);c.fillStyle='#555';c.fillRect(40,104,w-80,10);c.fillStyle='#a01010';c.fillRect(120,104,14,10);
             c.fillStyle='rgba(255,255,255,.18)';c.fillRect(10,10,w-20,8);},{clamp:true}));
          const mw=mesh(new T.PlaneGeometry(.15,.084),memo('elMeterM',()=>std({map:mt,roughness:.4,envMapIntensity:.4,polygonOffset:true,polygonOffsetFactor:-3})),0,.05,.0668,mm,false);
          mesh(new T.PlaneGeometry(.15,.084),memo('elMeterGl',()=>std({color:C(0xa8b0b4),transparent:true,opacity:.16,roughness:.04,metalness:.3,envMapIntensity:1.5,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4})),0,.05,.0672,mm,false);}
         const cb=onWall(toL(elA),(FL+2.11+top)/2,.03);const cm=mesh(new T.CylinderGeometry(.008,.008,top-FL-2.11,8),memo('cableM',()=>std({color:C(0x1a1a1a),roughness:.6})),cb.p.x+(side?0:.1),cb.p.y,cb.p.z+(side?.1:0),h);}
       const nm_={n:'ЦЕНТРАЛЬНАЯ',s:'ЦЕНТРАЛЬНАЯ',l:'ЛУГОВАЯ',b:'ПОЛЕВАЯ',c:'ЛЕСНАЯ'}[hd.id[0]],no=(hi*3+7)%40+1;
       const pt=memo('plate'+hd.id,()=>tex(256,128,(c,w,h_)=>{c.fillStyle='#1f4a8a';c.fillRect(0,0,w,h_);c.strokeStyle='#e8ecf0';c.lineWidth=5;c.strokeRect(6,6,w-12,h_-12);c.fillStyle='#eef2f4';c.textAlign='center';c.font='bold 26px sans-serif';c.fillText('УЛ. '+nm_,w/2,48);c.font='bold 52px sans-serif';c.fillText(String(no),w/2,106);
         const q2=rng(no);for(let i=0;i<60;i++){c.fillStyle=`rgba(90,60,30,${q2()*.25})`;c.beginPath();c.arc(q2()*w,q2()*h_,1+q2()*3,0,7);c.fill();}}));
       /* (the plate goes up at the corner away from the gas riser, clear of the window surrounds, pediments and open
          shutters; on the side wall, clear of that wall's windows) */
       let pa=null,py=FL+2.24;for(let k=0;k<14&&pa===null;k++)for(const sg of side?[1]:[-cs,cs]){const a=side?(D/2-.75-k*.15):sg*(W/2-.62-k*.12);if(free(a,py,.24,.14)){pa=a;taken.push([a-.24,a+.24,py-.14,py+.14]);break;}}
       if(pa===null){py=FL+1.75;pa=slot(side?D/2-.75:-cs*(W/2-.62),side?-1:cs,py,.24,.14);}const lx_=pa===null?null:toL(pa);if(lx_!==null){
       const pp=onWall(lx_,py,.006);backer(lx_,py,.48,.28);const pl=mesh(rbox(.4,.2,.012,.004),memo('plateM'+hd.id,()=>std({map:pt,roughness:.5,metalness:.3,envMapIntensity:.6})),pp.p.x,pp.p.y,pp.p.z,h);pl.rotation.y=pp.ry;}}
      /* aerial: a galvanised mast up the gable end past the ridge, a Yagi on top */
      if(st.ant){const ax=-cs*(W/2+LR+.12),am=[];const my0=top-.6,my1=ridge+1.9;am.push(new T.CylinderGeometry(.018,.022,my1-my0,10).translate(ax,(my0+my1)/2,-.4));
        [top-.3,top+.6].forEach(y=>am.push(new T.BoxGeometry(.2,.03,.03).translate(ax+cs*.1,y,-.4)));am.push(new T.CylinderGeometry(.008,.008,1.4,8).rotateX(Math.PI/2).translate(ax,my1-.05,-.4));
        for(let k=0;k<8;k++){const z_=-.4-.6+k*.17,L_=.48-k*.025;am.push(new T.CylinderGeometry(.004,.004,L_,6).rotateZ(Math.PI/2).translate(ax,my1-.05,z_));}mesh(merge(am),galvM,0,0,0,h);}
      /* satellite dish on the gable-end wall, up under the eaves where nothing is in front of it: an offset-feed dish
         with its rolled rim, on a wall bracket with its elevation plate; the LNB on its arm; the coax cable stapled down
         the wall to a hole by the window. Faded white, rust weeping from the bolts. */
      if(st.dish){const sx=cs,wx=sx*(W/2+LR+fOff),swn=sx>0?'east':'west';let dz=null;for(const z0 of [-D/2+.75,-D/2+1.05,D/2-.9,0])if(open[swn].every(o=>z0+.4<o[0]-.5||z0-.4>o[1]+.5)){dz=z0;break;}
        if(dz!==null){const dg=new T.Group();dg.position.set(wx,top-.55,dz);dg.rotation.y=sx*Math.PI/2;h.add(dg);
          const dm=memo('dishM',()=>std({map:PB.rustpaint.a,normalMap:PB.rustpaint.n,color:C(0xe4e4e0),roughness:.7,metalness:.15,envMapIntensity:.5,side:T.DoubleSide}));
          /* wall plate, the arm out from the wall, the elevation clamp */
          mesh(rbox(.16,.22,.012,.004),galvM,0,0,.006,dg);[[-.05,.08],[.05,.08],[-.05,-.08],[.05,-.08]].forEach(([a,b2])=>mesh(new T.CylinderGeometry(.008,.008,.02,8).rotateX(Math.PI/2),galvM,a,b2,.018,dg));
          mesh(new T.CylinderGeometry(.022,.022,.32,12).rotateX(Math.PI/2),galvM,0,0,.17,dg);mesh(rbox(.09,.12,.01,.003),galvM,0,0,.33,dg);
          const dh=new T.Group();dh.position.set(0,.02,.36);dh.rotation.set(-.42,sx*.35,0);dg.add(dh);
          const pts=[];for(let i=0;i<=14;i++){const r=i/14*.29;pts.push([r,r*r*.75]);}pts.push([.3,.069],[.305,.06]);const dish=lathe(pts,40);dish.rotateX(Math.PI/2);dish.scale(1,1.12,1);mesh(dish,dm,0,0,.03,dh);
          mesh(rbox(.08,.06,.02,.006),galvM,0,0,.025,dh);
          const arm=new T.TubeGeometry(new T.CatmullRomCurve3([V3(0,-.3,.06),V3(0,-.28,.25),V3(0,-.12,.42)]),12,.008,8);mesh(arm,galvM,0,0,0,dh);
          mesh(new T.CylinderGeometry(.022,.026,.09,14).rotateX(Math.PI/2),memo('lnbM',()=>std({color:C(0x2a2a2a),roughness:.5})),0,-.1,.45,dh);
          const cab=new T.TubeGeometry(new T.CatmullRomCurve3([V3(0,-.11,.42),V3(.05,-.35,.3),V3(.06,-.2,.04),V3(.06,-.6,.012),V3(.06,-1.6,.012)]),24,.0045,6);mesh(cab,memo('cableM',()=>std({color:C(0x1a1a1a),roughness:.6})),0,0,0,dg);}}}
    /* the covered yard behind, under its own lower roof: weathered vertical boards, a pair of cart doors in the side */
    if(hd.dvor){const L=7.2,z0=-D/2-L/2,hh=3.4;const dv=new T.Group();h.add(dv);
      const pl=[];for(let x=-W/2;x<W/2;x+=.22)for(const zz of [-D/2-L]){const g=new T.BoxGeometry(.21,hh,.035);g.translate(x+.11,hh/2,zz);pl.push(g);}
      for(let z=-D/2-L;z<-D/2;z+=.22)for(const xx of [-W/2,W/2]){if(xx>0&&z>z0-1.3&&z<z0+1.3)continue;const g=new T.BoxGeometry(.035,hh,.21);g.translate(xx,hh/2,z+.11);pl.push(g);}
      shootables.push(mesh(merge(pl),plankG,0,0,0,dv));
      const dd=new T.Group();dd.position.set(W/2+.02,0,z0);dv.add(dd);[-1,1].forEach(s=>{const d=mesh(rbox(.05,2.8,1.25,.01),plankG,0,1.4,s*.64,dd);d.rotation.y=s*.04;});mesh(rbox(.08,.1,2.7,.01),M.post,.03,2.85,0,dd);
      const er=hd.roof==='tin'?tinM(hd.rc||0x6a6e70):slateDS;const rL=L+.4,rr2=hh+1.2;const sl=Math.hypot(W/2+.5,1.2)*1.6;
      const dp=[quad([-W/2-.5,hh,-D/2-L-.3],[-W/2-.5,hh,-D/2+.05],[0,rr2,-D/2+.05],[0,rr2,-D/2-L-.3],-rL,0,0,sl),quad([W/2+.5,hh,-D/2+.05],[W/2+.5,hh,-D/2-L-.3],[0,rr2,-D/2-L-.3],[0,rr2,-D/2+.05],-rL,0,0,sl)];
      shootables.push(mesh(merge(dp),er,0,0,0,dv));
      const gs=new T.Shape();gs.moveTo(-W/2,0);gs.lineTo(W/2,0);gs.lineTo(0,1.2);gs.closePath();const gg=new T.ExtrudeGeometry(gs,{depth:.04,bevelEnabled:false});worldUV(gg,1);mesh(gg,plankG,0,hh,-D/2-L,dv);
      wb(-W/2-.1,W/2+.1,-D/2-L-.1,-D/2-L+.1);wb(-W/2-.1,-W/2+.1,-D/2-L,-D/2);wb(W/2-.1,W/2+.1,-D/2-L,-D/2);}
    if(ruin)ruinDetail(h,hd,hi,W,D,top,ridge,eave,ez,fallen,logM);
    PLOT(hd,hi,W,D,dx);if(!hd.boarded)livedYard(hd,hi,W,D,dx);
    if(hd.enter)HOUSES.push(villRect(hd,-W/2,W/2,-D/2,D/2));
    /* (everything inside is tagged: it is merged per house and not drawn from more than ~32 m away) */
    if(gutted){const n0=h.children.length;wreck(h,hd,hi,W,D,wb,top,fW,bwx);for(let i=n0;i<h.children.length;i++)h.children[i].userData.inside=hd.id;}
    else if(hd.enter){const n0=h.children.length;furnish(h,hd,hi,W,D,wb,top);for(let i=n0;i<h.children.length;i++)h.children[i].userData.inside=hd.id;}
    h.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});});
  /* ---- inside: the same layout as an izba always has, different in every house - the stove in a back corner with the
     kitchen by it, the red corner (icon, embroidered towel) over the table diagonally opposite, the bed under a carpet,
     the family's photographs, a clock, rag runners on the boards; left in a hurry: a chair over, papers on the floor ---- */
  /* the inside of a house that burned: the paper charred off the walls in sheets, the plaster black to the ceiling line
     and smoke-brown below; the floor deep in what came down - charred joists and boards, the chimney's bricks, ash,
     the springs of the sofa, the iron bed, glass; outside, the soot licked up the brick over every window */
  const burntWall=()=>memo('burntWall',()=>{const t=tex(512,512,(c,w,h)=>{c.fillStyle='#5a544a';c.fillRect(0,0,w,h);const q=rng(61);
      for(let i=0;i<30;i++){const x=q()*w,y=q()*h,ww=30+q()*90,hh=20+q()*80;c.fillStyle=`rgba(${190+q()*30|0},${180+q()*30|0},${150+q()*30|0},${.25+q()*.3})`;c.beginPath();c.moveTo(x,y);for(let k=0;k<7;k++)c.lineTo(x+(q()-.2)*ww,y+(q()-.2)*hh);c.fill();}
      const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(8,6,5,.95)');g.addColorStop(.45,'rgba(20,16,12,.7)');g.addColorStop(1,'rgba(40,32,24,.25)');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<400;i++){c.fillStyle=`rgba(0,0,0,${q()*.3})`;c.beginPath();c.arc(q()*w,q()*h,1+q()*8,0,7);c.fill();}});t.wrapS=t.wrapT=T.RepeatWrapping;return std({map:t,roughness:1,envMapIntensity:.1});});
  const sootUp=()=>memo('sootUp',()=>std({map:tex(128,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(13);for(let i=0;i<18;i++){const x=w/2+(q()-.5)*w*.6,top=h*(q()*.4),wd=10+q()*22;const g=c.createLinearGradient(0,h,0,top);g.addColorStop(0,'rgba(10,8,6,.9)');g.addColorStop(.6,'rgba(14,12,10,.45)');g.addColorStop(1,'rgba(14,12,10,0)');
      c.fillStyle=g;c.beginPath();c.moveTo(x-wd,h);c.quadraticCurveTo(x+(q()-.5)*30,(h+top)/2,x+(q()-.5)*20,top);c.quadraticCurveTo(x+(q()-.5)*30,(h+top)/2,x+wd,h);c.fill();}},{clamp:true}),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));
  function wreck(h,hd,hi,W,D,wb,top,fW,bwx){const q=rng(5500+hi),ch=[],br=[],deb=[],ir=[];
    /* the fallen ceiling: charred joists and boards, some leaning from the wall heads */
    for(let i=0;i<14;i++){const lx=(q()-.5)*(W-.6),lz=(q()-.5)*(D-.6),L=.6+q()*2.2,a=q()*Math.PI;const A=V3(lx-Math.cos(a)*L/2,FL+.08+q()*.15,lz-Math.sin(a)*L/2),B=V3(lx+Math.cos(a)*L/2,FL+.08+q()*.25,lz+Math.sin(a)*L/2);if(q()<.25){B.y=top-.3-q()*.5;}ch.push(beamG(A,B,.07+q()*.06,.05+q()*.1));}
    /* the bricks of the chimney breast that came down, and ash and broken plaster in drifts */
    const cx=hi%2?-W/2+1.2:W/2-1.2;for(let i=0;i<70;i++){const r=Math.pow(q(),.7)*1.6,a=q()*6.28,g=worldUV(rbox(.24,.065,.12,.01),.96);g.rotateX((q()-.5)*1.4);g.rotateY(q()*3);g.translate(cx+Math.cos(a)*r,FL+.06+q()*.12*(1.6-r),-D/2+1.0+Math.sin(a)*r);br.push(g);}
    for(let i=0;i<9;i++){const lx=(q()-.5)*(W-1),lz=(q()-.5)*(D-1),g=new T.SphereGeometry(.3+q()*.4,10,6,0,Math.PI*2,0,Math.PI/2);g.scale(1,.18+q()*.15,1);g.translate(lx,FL+.03,lz);deb.push(g);}
    /* the sofa's springs in their burnt frame, the iron bed, the radiators */
    {const sx=-(hi%2?-1:1)*(W/2-.6);const fr=rbox(.8,.14,1.9,.01);fr.translate(sx,FL+.12,.4);ch.push(fr);for(let i=0;i<5;i++)for(let j=0;j<12;j++){const t=new T.TorusGeometry(.045,.004,4,10);t.rotateX(Math.PI/2);t.translate(sx-.3+i*.15,FL+.22,.4-.85+j*.155);ir.push(t);}}
    {const bx=(hi%2?-1:1)*(W/2-1.2),bz=1.2;[[-.45,-1],[.45,-1],[-.45,1],[.45,1]].forEach(([a,b])=>{const c=new T.CylinderGeometry(.018,.018,b<0?.95:.7,10);c.translate(bx+a,FL+(b<0?.47:.35),bz+b*.95);ir.push(c);});
     const rail=new T.CylinderGeometry(.015,.015,1.9,8);rail.rotateX(Math.PI/2);[-.45,.45].forEach(a=>{const r=rail.clone();r.translate(bx+a,FL+.42,bz);ir.push(r);});}
    mesh(merge(ch),charred,0,0,0,h);mesh(merge(br),memo('brickBurnt',()=>std({map:PB.brick.a,normalMap:PB.brick.n,color:C(0x6a625a),roughness:1})),0,0,0,h);
    mesh(merge(deb),memo('ashPile',()=>std({map:TX.whitewash,color:C(0x4a4640),roughness:1,envMapIntensity:.1})),0,0,0,h);mesh(merge(ir),memo('burntIron',()=>std({map:PB.rust.a,normalMap:PB.rust.n,color:C(0x5a4a40),roughness:.8,metalness:.5})),0,0,0,h);
    paperMesh(h,'news',hi*9+1,.4,FL+.04,-.3,.8,.9);paperMesh(h,'letter',hi*9+2,-1,FL+.05,.6,2.1);
    /* soot licked up the outside wall over each window opening */
    const sw=(x,z,ry)=>{const m=mesh(new T.PlaneGeometry(1.3,.78),sootUp(),x,FL+2.02+.39,z,h,false);m.rotation.y=ry;m.renderOrder=1;};
    fW.forEach(o=>sw((o[0]+o[1])/2,D/2+LR+.004,0));if(!hd.dvor)sw(bwx,-D/2-LR-.004,Math.PI);if(hi%2)sw(-W/2-LR-.004,0,-Math.PI/2);else sw(W/2+LR+.004,0,Math.PI/2);
    wb(-W/2+.2,W/2-.2,-D/2+.6,-D/2+1.6);}
  const dX0Of=(hd,hi)=>(hi%2?.6:.2)-.95,dX1Of=(hd,hi)=>(hi%2?.6:.2)+.05;
  function furnish(h,hd,hi,W,D,wb,top){const sd=hi%2?-1:1;const st=HSTYLE[hd.id]||{},modern=st.wall==='brick';
    /* an izba's Russian stove in its corner; a brick house has gas: the AGV boiler in the corner with its flue up to the
       chimney, the cooker and the refrigerator along the back wall, radiators under the windows */
    if(!modern){const sg=new T.Group();sg.scale.x=sd;sg.userData.noMerge=true;h.add(sg);russianStove(sg,W/2-.98,FL,-D/2+1.05,top-FL-.06);wb(sd>0?W/2-1.78:-W/2+.18,sd>0?W/2-.18:-W/2+1.78,-D/2+.1,-D/2+2.05);}
    else{const cxs=hi%2?-W/2+1.2:W/2-1.2;MOD.boiler(h,cxs,FL,-D/2+.42,0,top-FL-.04);wb(cxs-.25,cxs+.25,-D/2+.15,-D/2+.7);
      MOD.cooker(h,sd*(W/2-.45),FL,-D/2+.45,0);wb(sd*(W/2-.45)-.27,sd*(W/2-.45)+.27,-D/2+.15,-D/2+.75);
      MOD.fridge(h,sd*(W/2-.45),FL,-D/2+1.3,-sd*Math.PI/2);wb(sd*(W/2-.45)-.32,sd*(W/2-.45)+.32,-D/2+1.0,-D/2+1.62);
      const wf=W/2-1.25,wide=W>8.5,w3=-sd*(wf-1.7);(wide?[-wf,wf,w3]:[-wf,wf]).forEach(x=>MOD.radiator(h,x,FL,D/2-LR-.12,Math.PI,9));}
    {const dx=hi%2?.6:.2,lo=W>=8?1.13:(sd>0?dx+.05:-(dx-.95))+.05,hi_=W/2-1.25-.55,wx=sd*(lo+hi_)/2;washstand(h,wx,FL,D/2-.33,Math.PI);wb(wx-.3,wx+.3,D/2-.55,D/2-.1);}
    wardrobe(h,-sd*(W/2-.45),FL,-D/2+.95,sd*Math.PI/2);wb(sd>0?-W/2+.1:W/2-.8,sd>0?-W/2+.8:W/2-.1,-D/2+.3,-D/2+1.6);
    if(!modern)wallClock(h,-sd*.6,FL+1.85,-D/2+.15,0);else wallClock(h,sd*1.0,FL+1.9,D/2-.15,Math.PI);
    ragRunner(h,0,FL+.034,.2,D-1.6,.7,.06*sd);ragRunner(h,-sd*1.1,FL+.034,-.6,1.4,.6,Math.PI/2);
    if(modern){/* the sofa-bed along the side wall under the carpet, the coffee table, a wool rug on the linoleum */
      MOD.sofa(h,-sd*(W/2-.58),FL,.4,sd*Math.PI/2,hi);wb(sd>0?-W/2+.1:W/2-1.05,sd>0?-W/2+1.05:W/2-.1,-.6,1.4);
      MOD.coffeeTable(h,-sd*(W/2-1.55),FL,.4,sd*Math.PI/2);wb(-sd*(W/2-1.55)-.3,-sd*(W/2-1.55)+.3,-.05,.85);
      const rg=mesh(new T.PlaneGeometry(2.0,2.8),memo('floorRug'+hi%3,()=>std({map:FAB.carpet(hi+1),roughness:1,envMapIntensity:.1})),-sd*(W/2-1.45),FL+.036,.4,h,false);rg.rotation.set(-Math.PI/2,0,Math.PI/2);rg.receiveShadow=true;}
    else{
    /* bed along the side wall with the carpet over it */
    const bed=new T.Group();bed.position.set(-sd*(W/2-.6),FL,.4);h.add(bed);const iron=memo('bedIron',()=>std({map:PB.rustpaint.a,normalMap:PB.rustpaint.n,roughnessMap:PB.rustpaint.r,color:C(0x4a5056),roughness:1,metalness:.6,envMapIntensity:.6}));
    [[-.45,-1.0],[.45,-1.0],[-.45,1.0],[.45,1.0]].forEach(p=>mesh(new T.CylinderGeometry(.018,.018,p[1]<0?1.0:.75,14),iron,p[0],p[1]<0?.5:.375,p[1],bed));
    [-1.0,1.0].forEach(z=>{mesh(xf(new T.CylinderGeometry(.015,.015,.9,14),0,0,0,0,0,Math.PI/2),iron,0,z<0?.95:.7,z,bed);for(let i=0;i<5;i++)mesh(new T.CylinderGeometry(.008,.008,.35,10),iron,-.36+i*.18,z<0?.78:.55,z,bed);});
    /* mattress in its white sheet, the coverlet laid over it and hanging down the sides a little */mesh(rbox(.86,.14,1.9,.05),RF.LINEN,0,.49,0,bed);
      {const qm=RF.quilt(hi);qm.side=T.DoubleSide;mesh(new T.BoxGeometry(.92,.025,1.7),qm,0,.57,.1,bed);[-1,1].forEach(sx=>{const dg=new T.PlaneGeometry(1.7,.13);{const P=dg.attributes.position,U=dg.attributes.uv;for(let i=0;i<P.count;i++)U.setXY(i,(P.getY(i)+.065)/.92,(P.getX(i)+.85)/1.7);}const m=mesh(dg,qm,sx*.46,.505,.1,bed);m.rotation.y=sx*Math.PI/2;});}pillowStack(bed,0,.57,-.72,0);{const v=mesh(new T.PlaneGeometry(1.92,.22),RF.LEDGE,sd*.455,.38,0,bed,false);v.rotation.y=Math.PI/2;}
    wb(sd>0?-W/2+.15:W/2-1.05,sd>0?-W/2+1.05:W/2-.15,-.65,1.45);
    }
    const cp=mesh(new T.PlaneGeometry(1.5,2.1),std({map:carpetTex(hi),roughness:1,envMapIntensity:.1}),-sd*(W/2-.14),FL+1.45,.4,h,false);cp.rotation.y=sd*Math.PI/2;
    /* table with oilcloth in the red corner, the bench along the wall, chairs */
    const tx=-sd*(W/2-.75),tz=D/2-.75;const table=new T.Group();table.position.set(tx,FL,tz);h.add(table);
    mesh(rbox(1.12,.05,.76,.01),RF.PAINT,0,.74,0,table);mesh(rbox(1.16,.006,.8,.002),std({map:KLEENKA,roughness:.35,envMapIntensity:.6}),0,.768,0,table);
    [[-.5,-.32],[.5,-.32],[-.5,.32],[.5,.32]].forEach(p=>mesh(rbox(.05,.72,.05,.01),RF.PAINT,p[0],.36,p[1],table));[[0,.66,-.32,1.0,'x'],[0,.66,.32,1.0,'x'],[-.5,.66,0,.6,'z'],[.5,.66,0,.6,'z']].forEach(([x,y,z,L,ax])=>mesh(rbox(ax==='x'?L:.025,.09,ax==='x'?.025:L,.006),RF.PAINT,x,y,z,table));RF.fin(table);wb(tx-.58,tx+.58,tz-.4,tz+.4);
    mesh(new T.CylinderGeometry(.06,.05,.1,12),M.enamel,.25,.82,-.1,table);mesh(lathe([[0,0],[.05,0],[.06,.05],[.04,.1],[.02,.12],[.035,.16],[.04,.22],[.02,.26],[0,.26]],12),M.glass,-.3,.77,.15,table);
    const chair=(x,z,ry,fall)=>{const c=new T.Group();c.position.set(x,FL,z);c.rotation.y=ry;h.add(c);if(fall){c.rotation.set(0,ry,Math.PI/2);c.position.y=FL+.22;}
      /* a plain kitchen chair: the back legs run on up as the uprights, two back rails between them, stretchers low down */
      mesh(rbox(.42,.04,.42,.01),RF.PAINT,0,.45,0,c);[[-.18,.18],[.18,.18]].forEach(p=>mesh(rbox(.035,.45,.035,.005),RF.PAINT,p[0],.225,p[1],c));
      [-.18,.18].forEach(x=>{const u=mesh(rbox(.035,.92,.035,.005),RF.PAINT,x,.46,-.185,c);u.rotation.x=-.04;});[.66,.84].forEach(y=>mesh(rbox(.36,.07,.022,.005),RF.PAINT,0,y,-.193-(y-.46)*.04,c));
      [[0,.12,.18,'x'],[0,.12,-.18,'x'],[-.18,.17,0,'z'],[.18,.17,0,'z']].forEach(([x,y,z,ax])=>mesh(rbox(ax==='x'?.36:.022,.025,ax==='x'?.022:.36,.004),RF.PAINT,x,y,z,c));RF.fin(c);};
    if(hi%3===1){chair(tx+sd*.75,tz-.1,sd*Math.PI/2,false);chair(sd*.3,.6,1.2+hi,hi%2===0);}
    else{viennaChair(h,tx+sd*.78,FL,tz-.1,sd*Math.PI/2,false);viennaChair(h,sd*.3,FL,.6,1.2+hi,hi%2===0);}
    /* against the back wall of the living room: the sideboard, or the chest of drawers under its mirror, or the dowry
       chest beside the television - a different house, a different family */
    {const v=modern?3:hi%3,bz=-D/2+.13;
     if(v===3){MOD.stenka(h,-sd*1.05,FL,bz+.23,0);wb(-sd*1.05-1.22,-sd*1.05+1.22,bz,bz+.48);}
     else if(v===0){servant(h,-sd*1.6,FL,bz+.24,0);wb(sd>0?-2.3:.9,sd>0?-.9:2.3,bz,bz+.5);}
     else if(v===1){komod(h,-sd*1.55,FL,bz+.24,0,true);wb(sd>0?-2.05:1.05,sd>0?-1.05:2.05,bz,bz+.5);}
     else{sunduk(h,-sd*1.75,FL,bz+.28,0,[0x5a3828,0x2e4a3a,0x4a2a2a][hi%3]);wb(sd>0?-2.25:1.25,sd>0?-1.25:2.25,bz,bz+.56);tvRubin(h,-sd*.55,FL,bz+.25,0);wb(sd>0?-.88:.22,sd>0?-.22:.88,bz,bz+.5);}}
    /* the big houses' living rooms: the round table under the silk lampshade with its bentwood chairs, the sewing machine
       under the window, a woven rug of deer on the partition */
    if(W>=8&&!modern){const rx=-sd*(W/2-2.4),rz=.9;roundTable(h,rx,FL,rz,['#7a2a26','#2a4a6a','#5a4a2a'][hi%3]);abazhur(h,rx,rz,top-.05,[0xd06a30,0xc0a040,0xb04040][hi%3]);wb(rx-.5,rx+.5,rz-.5,rz+.5);
      [0,2.2,4.2].forEach(a=>viennaChair(h,rx+Math.sin(a)*.72,FL,rz+Math.cos(a)*.72,a+Math.PI));
      sewingMachine(h,-sd*(W/2-2.1),FL,D/2-.35,Math.PI);wb(-sd*(W/2-2.1)-.38,-sd*(W/2-2.1)+.38,D/2-.6,D/2-.1);
      deerRug(h,sd*(1.05-.035),FL+1.45,-1.5,-sd*Math.PI/2,1.0,.72);}
    else if(hi%2===0){sewingMachine(h,sd*(W/2-1.0),FL,.9,-sd*Math.PI/2);wb(sd*(W/2-1.0)-.25,sd*(W/2-1.0)+.25,.5,1.3);}
    /* the red corner: icon on its shelf, the embroidered towel over it */
    {const cg=ICON.corner(h,-sd*(W/2-LR-.015),FL+1.6,D/2-LR-.015,sd>0?Math.PI*.75:-Math.PI*.75,{kinds:[['kazan','christ'],['christ','kazan','nicholas'],['nicholas','kazan']][hi%3],riza:hi%2===1});lampada(cg,0,-.005,.5);}
    /* the family's photographs on the back wall, a calendar, a shelf with jars */
    for(let i=0;i<2+hi%3;i++){const fx=-sd*(1.0+i*.36),fy=FL+(modern?2.42:2.12)-(i%2)*.06;mesh(rbox(.24,.3,.02,.004),std({color:C(0x3a2a1c),roughness:.6}),fx,fy,-D/2+.15,h);mesh(new T.PlaneGeometry(.19,.24),std({map:photoTex(hi*7+i),roughness:.5}),fx,fy,-D/2+.162,h,false);}
    mesh(new T.PlaneGeometry(.28,.42),M.calendar,sd*(W/2-.15),FL+1.55,.9,h).rotation.y=-sd*Math.PI/2;
    const shX=W>=8?sd*1.22:sd*(W/2-.3);mesh(rbox(.28,.04,1.0,.01),M.boards,shX,FL+1.6,1.7,h);[1.4,1.6,1.8].forEach(z=>mesh(new T.CylinderGeometry(.045,.045,.16,20),M.glass,shX,FL+1.7,z,h));
    [1.3,2.1].forEach(z=>{const b=mesh(rbox(.03,.2,.03,.004),M.boards,shX+(W>=8?-sd:sd)*.1,FL+1.48,z,h);});
    /* a big house is two rooms: a whitewashed plank partition from the back wall to the front, the kitchen with the
       stove on one side, the living room with the bed and the red corner on the other, a doorway with its frame */
    if(W>=8){const px=sd*1.05,z0=-D/2+.13,z1=D/2-.13,dz0=-.35,dz1=.55,hh=top-FL-.08,pl=[];const pm=std({map:TX.whitewash,color:C(0xd6d0c2),roughness:.95,envMapIntensity:.2});
      for(let z=z0;z<z1-.01;z+=.16){const zz=Math.min(z+.16,z1),mid=(z+zz)/2;if(mid>dz0&&mid<dz1){const b=new T.BoxGeometry(.05,hh-2.05,zz-z-.004);b.translate(px,FL+2.05+(hh-2.05)/2,mid);pl.push(b);continue;}
        const b=new T.BoxGeometry(.05,hh,zz-z-.004);b.translate(px,FL+hh/2+.03,mid);pl.push(b);}
      shootables.push(mesh(merge(pl),pm,0,0,0,h));
      [[dz0-.05],[dz1+.05]].forEach(([z])=>mesh(rbox(.1,2.08,.08,.01),M.trimWhite,px,FL+1.04,z,h));mesh(rbox(.1,.08,dz1-dz0+.18,.01),M.trimWhite,px,FL+2.08,(dz0+dz1)/2,h);
      [-1,1].forEach(k=>mesh(rbox(.08,.1,(k<0?dz0-z0:z1-dz1),.01),M.trimWhite,px,FL+.08,k<0?(z0+dz0)/2:(dz1+z1)/2,h));
      wb(px-.05,px+.05,z0,dz0);wb(px-.05,px+.05,dz1,z1);}
    /* the tea things on the table as they were left: two cups, the teapot or the pickle jar, the loaf on its board; the
       samovar on the round table in the big room; water buckets by the stove; felt boots by the door */
    /* what is on the table is each family's own: only in one house was the tea poured and the bread cut when they went */
    const TY=.772,story={n1:'tea',n2:'knit',n4:'med',s2:'samovar',s4:'school',s5:'vodka',l2:'lamp',b1:'cards',b2:'tools',b4:'lamp2',c1:'draw'}[hd.id]||'none';
    if(story==='tea'){LV.loaf(table,-.05,TY,-.18,.3+hi*.4);LV.teacup(table,.33,TY,.2,hi);LV.teacup(table,-.44,TY,-.22,hi+1);LV.teapot(table,.42,TY,-.22,hi*.7);}
    else if(story==='samovar'){LV.pickles(table,.45,TY,-.25);LV.teacup(table,.33,TY,.2,hi);}
    else if(story==='knit')BEL.knitting(table,0,TY,0,.4);else if(story==='med')BEL.medicine(table,.05,TY,0,-.3);
    else if(story==='school'){BEL.school(table,0,TY,0,.2);BEL.satchel(h,tx+sd*.2,FL,tz-.65,1.2);BEL.rabbit(h,-sd*(W/2-.9),FL+.6,.9,sd*1.2);}
    else if(story==='vodka')BEL.vodka(table,0,TY,0,.5);else if(story==='lamp'){BEL.kerosene(table,-.3,TY,-.1);BEL.candles(table,.25,TY,.15);BEL.radio(table,.1,TY,-.2,.3);}
    else if(story==='lamp2'){BEL.candles(table,-.2,TY,0);BEL.kerosene(table,.3,TY,-.15);}else if(story==='cards'){BEL.cards(table,0,TY,0,.3);BEL.ashtray(table,.4,TY,-.25);}
    else if(story==='tools')BEL.tools(table,0,TY,0,-.2);else if(story==='draw'){BEL.drawings(table,0,TY,0,.1);BEL.rabbit(h,-sd*(W/2-.9),FL+.465,.2,sd*1.4);}
    /* two houses left packed bags by the door */if(hd.id==='l2'||hd.id==='n4'){const bx=sd>0?dX0Of(hd,hi)-.5:dX1Of(hd,hi)+.5;BEL.bags(h,bx,FL+.03,D/2-.45,Math.PI+.15*sd);}
    if(story==='samovar'){const rx=-sd*(W/2-2.4),rt=RF.G(h,rx,FL,.9,0);LV.samovar(rt,.24,.762,-.12,hi);[[-.26,.06],[.04,.3],[.12,-.36]].forEach(([x,z],k)=>LV.teacup(rt,x,.762,z,k*2+hi));}
    LV.bucket(h,sd*(W/2-.45),FL+.03,-D/2+2.35,true,hi);LV.bucket(h,sd*(W/2-.85),FL+.03,-D/2+2.3,hi%2===0,hi+1);
    if(!modern&&hd.id!=='l2'&&hd.id!=='n4'){const vx=sd>0?dX0Of(hd,hi)-.32:dX1Of(hd,hi)+.32;LV.valenki(h,vx,FL+.03,D/2-.32,Math.PI+.3);}
    /* what is worth taking, left where it was put down: on the table, on the kitchen shelf */
    {const put=(id,lx,ly,lz,data)=>{const [x,z]=villW(hd,lx,lz);const o={id,x,y:ly,z,rot:[0,hi*1.7+lx,0]};if(data)o.data=data;LOOT.push(o);};
     const T_={n1:[['cigs',0,{id:'cigs',count:16}]],n2:[['ammo545',0]],n4:[['tushonka',1]],s1:[['bandage',0]],s2:[['antirad',1]],s4:[['bandage',0]],s5:[['pbs',0],['ammo545',1]],l2:[['tushonka',1]]}[hd.id]||[];
     T_.forEach(([id,where,data],k)=>{if(where===0)put(id,tx+(k?.25:-.2)*sd,FL+.79,tz-.05,data);else put(id,shX,FL+1.62,2.05-k*.15,data);});}
    /* left in a hurry */
    [['news',hi*5+1,.3,-.4,.5],['letter',hi*5+2,-.8*sd,.9,2.1],['form',hi*5+3,.5*sd,1.6,1.2]].forEach(([k,s,px,pz,rt])=>paperMesh(h,k,s,px,FL+.036,pz,rt));}

  /* ===== the plot: its fence all round (the street side in the house's own style with a gate on the path), the
     outbuildings, the cellar, the garden ===== */
  /* one ridge along local x from xa to xb about the line z: a mound of earth laid on the ground vertex by vertex */
  const clodG=[0,1,2,3].map(k=>{const g=k<2?new T.IcosahedronGeometry(1,2):new T.IcosahedronGeometry(1,1);const p=g.attributes.position,q=rng(31+k),mm=new Map();
    for(let i=0;i<p.count;i++){const key=p.getX(i).toFixed(3)+','+p.getY(i).toFixed(3)+','+p.getZ(i).toFixed(3);if(!mm.has(key))mm.set(key,.68+q()*.6);const f=mm.get(key);p.setXYZ(i,p.getX(i)*f,p.getY(i)*f*.72,p.getZ(i)*f*(.85+k*.06));}g.computeVertexNormals();return g;});
  /* dug soil stands proud of the trodden ground round it */
  const BED=.08;
  function ridge(hd,xa,xb,zr,seed){const n=Math.max(2,Math.ceil((xb-xa)/.09)),RS=12,pos=[],uv=[],idx=[],top=[];
    for(let i=0;i<=n;i++){const x=xa+(xb-xa)*i/n,end=Math.min(1,Math.min(x-xa,xb-x)/.4),taper=Math.sqrt(Math.max(.06,end));
      const zc=zr+(vnoise(x*.55+seed,seed*.37)-.5)*.16+(vnoise(x*2.3+seed*3,seed)-.5)*.045;
      const wid=(.25+(vnoise(x*1.7+seed*5,1.3)-.5)*.09)*(.7+.3*taper),hgt=(.135+(vnoise(x*1.3+seed*2,4.1)-.5)*.07)*taper;
      for(let j=0;j<=RS;j++){const a=j/RS*Math.PI,lz=zc+Math.cos(a)*wid*(1+(hash(i*.7+seed,j*1.3)-.5)*.14);const [wx,wz]=villW(hd,x,lz);
        const lump=(hash(Math.round(wx*16),Math.round(wz*16))-.5)*.04+(vnoise(wx*7,wz*7)-.5)*.06+(vnoise(wx*3.2+9,wz*3.2)-.5)*.05;
        /* (a hoed mound, not a tube: a soft crown and long toes that run out into the furrow) */const cs=Math.cos(a),pr=Math.pow(Math.max(0,1-cs*cs),1.45);pos.push(wx,H(wx,wz)+BED+pr*hgt+(j===0||j===RS?-.03:lump*Math.sqrt(pr)),wz);uv.push(x*.9,j/RS*.55+seed*.13);}
      top.push([x,zc,hgt,wid]);}
    for(let i=0;i<n;i++)for(let j=0;j<RS;j++){const a=i*(RS+1)+j,b=a+RS+1;idx.push(a,b,a+1,b,b+1,a+1);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();bk.add(g,soilM);return top;}
  /* ===== ruins ===== */
  const RUIN={wood:std({map:TX.bark,color:C(0x6a5e50),roughness:1}),ash:null};
  const scorchT=()=>memo('scorch',()=>tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(91);for(let i=0;i<60;i++){const x=w/2+(q()-.5)*w*.5,y=h/2+(q()-.5)*h*.5,r=20+q()*70,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(12,10,8,.5)');g.addColorStop(1,'rgba(12,10,8,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
    for(let i=0;i<300;i++){c.fillStyle=`rgba(${20+q()*30|0},${18+q()*20|0},${14+q()*14|0},${q()*.5})`;const r=q()*3;const x=w/2+(q()-.5)*w*.7,y=h/2+(q()-.5)*h*.7;c.fillRect(x,y,r,r);}},{clamp:true}));
  const scorchM=()=>memo('scorchM',()=>std({map:scorchT(),transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,envMapIntensity:.05}));
  /* a beam between two points in the house's frame */
  const beamG=(A,B,w,t)=>{const d=V3().subVectors(B,A),L=d.length(),g=rbox(w,t,L,.008);const m=new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(V3(0,0,1),d.normalize()),V3(1,1,1));g.applyMatrix4(m);return g;};
  const logG=(A,B,r)=>{const d=V3().subVectors(B,A),L=d.length(),g=new T.CylinderGeometry(r,r*1.04,L,14);g.rotateX(Math.PI/2);const uv=g.attributes.uv;for(let i=0;i<uv.count;i++){const u=uv.getX(i),v=uv.getY(i);uv.setXY(i,v*L*.45,u);}
    g.applyMatrix4(new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(V3(0,0,1),d.normalize()),V3(1,1,1)));return g;};
  const gY=(hd,lx,lz)=>{const [x,z]=villW(hd,lx,lz);return H(x,z);};
  /* the roof of a shelled house, come down: sections of it leaning from what is left of the walls into the room, the ridge
     beam fallen corner to corner and out through the gap, rafters broken and sticking up, sheets of slate strewn outside
     the side the blast came from; the logs that came down from the walls lie where they fell or lean on the stubs */
  function ruinRoof(h,hd,hi,W,D,top,ridge,fallen,logM,topAt){const q=rng(4100+hi),sl=[],wd=[],lg=[],ch=[],bt=[],sh=[],lcap=[];
    /* the roof has come down into the house: the ridge broke and dropped, and each slope swung down on its eave - still
       resting on what is left of its wall where the wall stands, slid off onto the ground where the wall has gone - so the
       two slopes lie in a broken V with the ridge down among the wreckage on the floor. Each sheet-width of slope is laid
       on its own: rafters, the battens across them, the corrugated sheets on the battens; some sheets gone, a few rafters
       snapped off short and sticking up */
    const ex=W/2+.6,ov=.55,eave=top-.2,ez=D/2+ov,slope=Math.hypot(ez,ridge-eave),nS=Math.ceil(2*ex/1.03);
    const rsheet=G('rsheet',()=>{const g=new T.PlaneGeometry(1.1,1,28,1);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/.167*Math.PI*2)*.018);g.computeVertexNormals();return g;});
    const place=(E,Rp,x0)=>{const ey=V3().subVectors(E,Rp),L=ey.length();ey.normalize();const exv=V3(1,0,0),ezv=V3().crossVectors(exv,ey).normalize();exv.crossVectors(ey,ezv).normalize();
      return{L,m:new T.Matrix4().makeBasis(exv,ey,ezv),ezv,ey,exv};};
    for(const s_ of [1,-1]){const wall=s_>0?'front':'back',zW=s_*D/2;
      for(let i=0;i<nS;i++){const x=-ex+.55+i*1.03,xa=clamp(x,-W/2+.25,W/2-.25),wt=topAt(wall,xa);
        /* where it rests: on the wall's broken top, or out on the ground past a wall that has gone */
        let E;if(wt>FL+.75){E=V3(x,wt+LR*.7,zW+s_*.32);}else{const zg=zW+s_*(1.1+q()*.5);E=V3(x,gY(hd,x,zg)+.1,zg);}
        const zr=-s_*(.15+q()*.35)+(s_>0?.0:.0),Rp=V3(x+(q()-.5)*.25,FL+.18+q()*.35+(s_>0?.28:0),zr);
        /* (the slope cannot be longer than it was: if the floor is too far it stops short, broken) */
        const d=E.distanceTo(Rp);if(d>slope){Rp.sub(E).multiplyScalar(slope/d).add(E);}
        const P=place(E,Rp);const mid=E.clone().add(Rp).multiplyScalar(.5);
        /* rafter on the column's left edge (and the right edge of the last), battens every 35 cm across */
        for(const xo of (i===nS-1?[-.515,.515]:[-.515])){const snap=q()<.18;const a=E.clone().addScaledVector(P.exv,xo),b=Rp.clone().addScaledVector(P.exv,xo);
          if(snap){b.lerp(a,.35+q()*.3);const st=b.clone().addScaledVector(P.ezv,.0);const up=st.clone().add(V3((q()-.5)*.3,.5+q()*.5,(q()-.5)*.3));(q()<.5?wd:ch).push(beamG(st,up,.06,.13));}
          (q()<.3?ch:wd).push(beamG(a,b,.06,.13));}
        const gone=q()<.22;const nb=Math.floor(P.L/.35);
        for(let k=0;k<=nb;k++){if(gone&&k>1&&k<nb-1&&q()<.6)continue;const c=E.clone().lerp(Rp,k/nb).addScaledVector(P.ezv,.08);bt.push(beamG(c.clone().addScaledVector(P.exv,-.54),c.clone().addScaledVector(P.exv,.54),.045,.03));}
        if(!gone){const g=rsheet.clone();const m=P.m.clone().scale(V3(1,P.L*(.92+q()*.06),1)).setPosition(mid.clone().addScaledVector(P.ezv,.115).addScaledVector(P.ey,(q()-.5)*.1));
          g.applyMatrix4(m);sh.push(g);}
        else if(q()<.7){/* the sheet slid off and lies on the ground below, cracked across */const lx=x+(q()-.5)*.6,lz=zW+s_*(1.4+q()*1.6),y=gY(hd,lx,lz);for(let k=0;k<2;k++){const g=rsheet.clone();g.applyMatrix4(new T.Matrix4().makeScale(1,.7+q()*.5,1));g.rotateX(-Math.PI/2+(q()-.5)*.25);g.rotateY(q()*.6-.3+(k?.4:0));g.translate(lx+k*.3,y+.05+k*.04,lz+k*.5*s_);sh.push(g);}}}}
    /* the attic floor: joists torn out of the wall tops, hanging from one end down onto the floor */
    for(let i=0;i<6;i++){const x=-W/2+.6+i*(W-1.2)/5+(q()-.5)*.3,zs=q()<.5?1:-1,wt=topAt(zs>0?'front':'back',x);if(wt<FL+1)continue;
      const A=V3(x,wt-.05,zs*(D/2-.2)),B=V3(x+(q()-.5)*.8,FL+.1+q()*.3,zs*(D/2-.2)-zs*(2.2+q()*1.2));(q()<.4?ch:wd).push(beamG(A,B,.08,.16));}
    /* the ridge beam itself, broken in two, both halves down in the middle of it all */
    wd.push(beamG(V3(-ex+.2,FL+.3,.05),V3(-.2,FL+.85,-.1),.15,.15));ch.push(beamG(V3(.1,FL+.9,.0),V3(ex-.3,FL+.25,.15),.15,.15));
    /* the west gable, fallen out flat on the grass, its boards splitting */
    {const gw=D+.2,gh=ridge-top,gx=-W/2-gh*.55-.6;for(let k=0;k<9;k++){const t=(k+.5)/9,len=gh*(1-Math.abs(t-.5)*2)+.05;if(len<.15||q()<.12)continue;const lz=-gw/2+t*gw,lx=gx+len/2-gh*.5;
      const g=rbox(len,.025,gw/9-.012,.004);g.rotateY((q()-.5)*.08);g.rotateZ((q()-.5)*.06);g.translate(lx,gY(hd,lx,lz)+.04+q()*.03,lz);wd.push(g);}}
    if(sh.length)shootables.push(mesh(merge(sh),slateDS,0,0,0,h));if(bt.length)mesh(merge(bt),WM.board,0,0,0,h);
    for(let i=0;i<14;i++){const lx=W/2+.6+q()*4.5,lz=(q()-.5)*(D+3),y=gY(hd,lx,lz);const g=rbox(.3+q()*.5,.012,.25+q()*.5,.003);g.rotateX((q()-.5)*.25);g.rotateY(q()*3);g.rotateZ((q()-.5)*.25);g.translate(lx,y+.025,lz);sl.push(g);}
    /* the fallen logs: runs of the same course and wall make one log; about half lie about, a few lean */
    const runs=[];for(const f of fallen){const r=runs[runs.length-1];if(r&&r[0]===f[0]&&r[5]===f[5]&&Math.abs(r[4]-f[3])<.01)r[4]=f[4];else runs.push(f.slice());}
    for(const [nm,c,axis,a0,a1,yy] of runs){if(a1-a0<.6||q()>.55)continue;const L=Math.min(a1-a0,1+q()*2.2),out=nm==='front'||nm==='east'?1:-1,am=(a0+a1)/2,off=out*(.6+q()*2.4)*(q()<.75?1:-1),yaw=(q()-.5)*.9;
      let cx,cz;if(axis==='x'){cx=am;cz=c+off;}else{cx=c+off;cz=am;}const inside=Math.abs(cx)<W/2-.2&&Math.abs(cz)<D/2-.2;const y0=inside?FL+.03+LR:gY(hd,cx,cz)+LR*.8;
      const dx=(axis==='x'?Math.cos(yaw):Math.sin(yaw))*L/2,dz=(axis==='x'?Math.sin(yaw):Math.cos(yaw))*L/2;const lean=q()<.2;
      const A=V3(cx-dx,y0,cz-dz),B=V3(cx+dx,lean?y0+L*.5:y0+(q()-.5)*.1,cz+dz);const lo=hqLog(A,B,LR*(.95+q()*.1),q,{rs:14,seg:.6});(q()<.4?ch:lg).push(lo.side);lcap.push(lo.cap);}
    if(sl.length)shootables.push(mesh(merge(sl),slateDS,0,0,0,h));if(wd.length)shootables.push(mesh(merge(wd),RUIN.wood,0,0,0,h));if(lg.length)shootables.push(mesh(merge(lg),logM,0,0,0,h));if(ch.length)shootables.push(mesh(merge(ch),charred,0,0,0,h));if(lcap.length)mesh(merge(lcap),WM.end,0,0,0,h);
    /* (big pieces you cannot walk through) */[[W/2+1.6,-.4,.5],[W/2+.6,0,.6]].forEach(([lx,lz,r])=>{const [x,z]=villW(hd,lx,lz);solids.push({cx:x,cz:z,r});});}
  /* the scorch, the broken things lying round, and the smoke still coming off a hit */
  function ruinDetail(h,hd,hi,W,D,top,ridge,eave,ez,fallen,logM){const q=rng(5200+hi);const deb=[],brk=[],gl=[];
    const dec=(lx,lz,sz,ry)=>{const y=gY(hd,lx,lz)+.04;const m=mesh(new T.PlaneGeometry(sz,sz),scorchM(),lx,y,lz,h,false);m.rotation.set(-Math.PI/2,0,ry);m.receiveShadow=true;m.renderOrder=1;};
    if(hd.ruin==='collapse'){dec(W/2+1.5,0,7,q()*3);dec(-.5,D/2+2.2,5.5,q()*3);
      for(let i=0;i<40;i++){const lx=(q()-.5)*(W+5),lz=(q()-.5)*(D+5),inside=Math.abs(lx)<W/2-.2&&Math.abs(lz)<D/2-.2,y=inside?FL+.03:gY(hd,lx,lz);
        if(q()<.55){const g=rbox(.24,.065,.12,.01);g.rotateY(q()*3);g.rotateX((q()-.5)*.6);g.translate(lx,y+.04,lz);brk.push(g);}else{const g=rbox(.08+q()*.12,.025,.5+q()*1.1,.005);g.rotateY(q()*3);g.rotateZ((q()-.5)*.3);g.translate(lx,y+.02,lz);deb.push(g);}}
      /* brick tumble at the foot of the chimney */const cx=hi%2?-W/2+1.2:W/2-1.2;for(let i=0;i<24;i++){const g=worldUV(rbox(.24,.065,.12,.01),.96);g.rotateY(q()*3);g.rotateX((q()-.5)*1.2);g.translate(cx+(q()-.5)*1.4,FL+.06+q()*.25,-.4+(q()-.5)*1.4+.9);brk.push(g);}}
    if(hd.ruin==='strike'){const [wl,b0,b1]=hd.breach,sx=wl==='west'?-1:1,cx=sx*W/2;
      /* the breach: splintered log ends round it, its edges charred, a fan of wreckage blown out into the yard */
      const wsT=memo('wallScorch',()=>tex(256,192,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(77),cx=w/2,cy=h*.55;
        /* soot blown out round the hole and licking up the wall above it, the hole itself left clear */
        for(let i=0;i<90;i++){const a=q()*6.28,r=40+q()*70,x=cx+Math.cos(a)*r*1.1,y=cy+Math.sin(a)*r*.8-q()*30,rr=10+q()*34,g=c.createRadialGradient(x,y,0,x,y,rr);g.addColorStop(0,'rgba(14,11,8,.55)');g.addColorStop(1,'rgba(14,11,8,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
        for(let i=0;i<26;i++){const x=cx+(q()-.5)*150,g=c.createLinearGradient(0,cy,0,0);g.addColorStop(0,'rgba(10,8,6,.6)');g.addColorStop(1,'rgba(10,8,6,0)');c.fillStyle=g;c.beginPath();c.moveTo(x-6-q()*8,cy);c.quadraticCurveTo(x+(q()-.5)*30,cy*.5,x+(q()-.5)*20,cy*(.05+q()*.3));c.lineTo(x+6+q()*8,cy);c.fill();}
        c.globalCompositeOperation='destination-out';const g2=c.createRadialGradient(cx,cy,0,cx,cy,64);g2.addColorStop(0,'rgba(0,0,0,1)');g2.addColorStop(.7,'rgba(0,0,0,1)');g2.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g2;c.save();c.translate(cx,cy);c.scale(1.05,.95);c.translate(-cx,-cy);c.fillRect(0,0,w,h);c.restore();},{clamp:true}));
      const wsM=memo('wallScorchM',()=>std({map:wsT,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2}));
      const wm=mesh(new T.PlaneGeometry(4.4,3.3),wsM,cx+sx*(LR+.03),FL+1.05,(b0+b1)/2,h,false);wm.rotation.y=sx*Math.PI/2;wm.renderOrder=1;dec(cx+sx*2.5,(b0+b1)/2,6,q()*3);
      for(let k=0;k<8;k++){const y=FL+.25+k*LS*.95;for(const e of [b0,b1]){const L=.15+q()*.35,g=new T.CylinderGeometry(.02+q()*.03,.004,L,6);g.rotateZ(Math.PI/2*sx*(q()<.5?1:.6));g.translate(cx+sx*q()*.1,y,e+(e===b0?.05:-.05)+(q()-.5)*.1);deb.push(g);}}
      for(let i=0;i<26;i++){const lx=cx+sx*(.6+q()*5),lz=(b0+b1)/2+(q()-.5)*5,y=gY(hd,lx,lz);if(q()<.3){const g=new T.CylinderGeometry(LR*.9,LR,.6+q()*1.4,16);g.rotateZ(Math.PI/2);g.rotateY(q()*3);g.translate(lx,y+LR*.8,lz);(q()<.5?brk:deb).push(g);for(let k=0;k<3;k++){const sp=new T.CylinderGeometry(.012+q()*.02,.003,.25+q()*.3,6);sp.rotateZ(Math.PI/2+(q()-.5)*.5);sp.rotateY(q()*3);sp.translate(lx+(q()-.5)*.6,y+LR*.4+q()*.1,lz+(q()-.5)*.6);deb.push(sp);}}
        else{const g=rbox(.06+q()*.1,.025,.3+q()*.9,.005);g.rotateY(q()*3);g.rotateZ((q()-.5)*.3);g.translate(lx,y+.02,lz);deb.push(g);}}
      /* the hole in the roof: charred rafters across it, the broken edges of the sheets */
      const [rs,i0,i1]=hd.hole,ex=W/2+.6,x0=-ex+.55+i0*1.03-.5,x1=-ex+.55+i1*1.03+.5,slope=Math.atan2(ridge-eave,ez);
      for(let k=0;k<3;k++){const x=lerp(x0,x1,(k+.5)/3),A=V3(x,ridge-.05,0),B=V3(x,eave+.05,rs*ez*.98);deb.push(beamG(A,B,.07,.1));}
      for(let i=0;i<6;i++){const t=q(),x=lerp(x0,x1,q()),y=lerp(ridge,eave,t),z=rs*ez*t;const g=rbox(.25+q()*.3,.012,.2+q()*.3,.003);g.rotateX(rs*(Math.PI/2-slope)*(1-.5*q()));g.translate(x,y,z);gl.push(g);}
      VILL.smoke=VILL.smoke||[];const [wx,wz]=villW(hd,(x0+x1)/2,rs*ez*.5);VILL.smoke.push({x:wx,y:(ridge+eave)/2,z:wz,t:0});}
    if(deb.length)mesh(merge(deb),charred,0,0,0,h);if(brk.length)mesh(merge(brk),hd.ruin==='strike'?logM:brick,0,0,0,h);if(gl.length)mesh(merge(gl),slateDS,0,0,0,h);}
  /* ===== a yard someone lives in ===== */
  /* a boot print pressed into mud: the sole's outline (a broad tread, the waist, the heel), the lugs of the tread as
     square pits in rows, the heel's horseshoe of lugs; dark where the mud is pushed down and wet, a raised lip of mud
     pushed up round the edge catching the light */
  const bootT=()=>memo('bootT2',()=>tex(128,256,(c,w,h)=>{c.clearRect(0,0,w,h);const sole=(inset)=>{c.beginPath();c.moveTo(w*.5,h*.04+inset);c.bezierCurveTo(w*.86-inset,h*.06,w*.9-inset,h*.3,w*.82-inset,h*.46);
      c.bezierCurveTo(w*.74-inset,h*.56,w*.7-inset,h*.6,w*.74-inset,h*.7);c.bezierCurveTo(w*.8-inset,h*.86,w*.72-inset,h*.96-inset,w*.5,h*.96-inset);c.bezierCurveTo(w*.28+inset,h*.96-inset,w*.2+inset,h*.86,w*.26+inset,h*.7);
      c.bezierCurveTo(w*.3+inset,h*.6,w*.26+inset,h*.56,w*.18+inset,h*.46);c.bezierCurveTo(w*.1+inset,h*.3,w*.14+inset,h*.06,w*.5,h*.04+inset);c.closePath();};
    c.save();sole(-3);c.lineWidth=8;c.strokeStyle='rgba(120,98,76,.45)';c.stroke();c.restore();
    sole(0);c.fillStyle='rgba(26,18,12,.78)';c.fill();c.save();sole(0);c.clip();
    c.fillStyle='rgba(8,5,3,.55)';for(let y=h*.08;y<h*.56;y+=14)for(let x=w*.22;x<w*.8;x+=16){const o=((y/14|0)%2)*8;c.fillRect(x+o-5,y-4,10,8);}
    for(let k=0;k<9;k++){const a=Math.PI*(.08+k*.105),cx=w*.5+Math.cos(a)*w*.2,cy=h*.82+Math.sin(a)*h*.08;c.fillRect(cx-5,cy-4,10,8);}c.fillRect(w*.42,h*.78,w*.16,h*.06);
    const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(0,0,0,.25)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(255,240,220,.08)');c.fillStyle=g;c.fillRect(0,0,w,h);c.restore();},{clamp:true}));
  const bootM=()=>memo('bootM2',()=>std({map:bootT(),transparent:true,depthWrite:false,roughness:.4,envMapIntensity:.45,polygonOffset:true,polygonOffsetFactor:-3}));
  /* the churned strip: wet dark mud with puddled water in the ruts, its edges ragged and fading into the grass (alpha) */
  const mudM=()=>memo('mudM2',()=>{const t=tex(256,512,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(66);const im=c.createImageData(w,h),d=im.data;
      for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h,i=(y*w+x)*4;const edge=Math.min(u,1-u),rag=(fbmT(u*.25,v,8,3)-.5)*.22,a=sstep(.04,.26,edge+rag);
        const n=fbmT(u,v,6,4),f=fbmT(u+.3,v,24,2),rut=Math.exp(-Math.pow((u-.32+.03*Math.sin(v*12.6))/.07,2))+Math.exp(-Math.pow((u-.68+.03*Math.sin(v*12.6+1))/.07,2));
        const k=.55+n*.5+(f-.5)*.25-rut*.25;d[i]=58*k;d[i+1]=44*k;d[i+2]=32*k;d[i+3]=255*a;}
      c.putImageData(im,0,0);
      for(let i=0;i<500;i++){const x=w*(.2+q()*.6),y=q()*h,r=1+q()*4;c.fillStyle=`rgba(${q()<.5?20:100},${q()<.5?14:82},${q()<.5?10:62},${.2+q()*.35})`;c.beginPath();c.ellipse(x,y,r,r*.7,q()*3,0,7);c.fill();}});
    t.wrapS=T.ClampToEdgeWrapping;t.wrapT=T.RepeatWrapping;return std({map:t,transparent:true,depthWrite:false,alphaTest:.02,roughness:.5,metalness:.02,envMapIntensity:.4,polygonOffset:true,polygonOffsetFactor:-1});});
  const propFree=(hd,lx,lz,r)=>{const [x0,x1,z0,z1]=hd.plotL,g=hd.garden;if(lx<x0+.5+r||lx>x1-.5-r||lz<z0+.5+r||lz>z1-.5-r)return false;if(lx>g[0]-.3-r&&lx<g[1]+.3+r&&lz>g[2]-.3-r&&lz<g[3]+.3+r)return false;
    return !hd.out.some(([k,ox,oz,ry])=>{const sw=Math.abs(Math.sin(ry))>.5,[w,d]=FPY[k];const a=(sw?d:w)/2+.3+r,b=(sw?w:d)/2+.3+r;if(lx>ox-a&&lx<ox+a&&lz>oz-b&&lz<oz+b)return true;
      if(k==='cellar'){const bx=ox-3.55*Math.sin(ry),bz=oz-3.55*Math.cos(ry),ex=(sw?2.4:1.9)+r,ez=(sw?1.9:2.4)+r;return lx>bx-ex&&lx<bx+ex&&lz>bz-ez&&lz<bz+ez;}return false;});};
  function livedYard(hd,hi,W,D,dx){const q=rng(6100+hi),G=new T.Group();scene.add(G);const W_=(lx,lz)=>{const [x,z]=villW(hd,lx,lz);return [x,H(x,z),z];};const put=(fn,lx,lz,ry,...a)=>{const [x,y,z]=W_(lx,lz);return fn(G,x,y,z,...a,hd.yaw+ry);};
    const sd=hi%2?-1:1,gx=dx-.45,[x0,x1,z0,z1]=hd.plotL,g=hd.garden;
    /* the gas bottle against the windowless side of the house */
    if(propFree(hd,-sd*(W/2+.45),-D/2+.7,.2)){const [x,y,z]=W_(-sd*(W/2+.45),-D/2+.7);LV.gasBottle(G,x,y,z,hd.yaw);solids.push({cx:x,cz:z,r:.2});}
    /* the washing line across the back yard */
    {const zz=(-D/2-(hd.dvor?7.4:0)+g[3])/2;const a=-W/2+.4,b=W/2-.4;if(g[3]<-D/2-(hd.dvor?7.4:0)-2.4&&propFree(hd,a,zz,.15)&&propFree(hd,b,zz,.15)){const [ax,ay,az]=W_(a,zz),[bx,by,bz]=W_(b,zz);LV.laundry(G,V3(ax,ay,az),V3(bx,by,bz),hi);solids.push({cx:ax,cz:az,r:.08},{cx:bx,cz:bz,r:.08});}}
    /* the chopping block in front of the woodpile, a bucket by the cellar door, the watering can by the garden gate, the milk churn */
    for(const [k,ox,oz,ry] of hd.out){const fx=Math.sin(ry),fz=Math.cos(ry);if(k==='wood'&&propFree(hd,ox+fx*1.9,oz+fz*1.9,.3)){const [x,y,z]=W_(ox+fx*1.9,oz+fz*1.9);LV.chopBlock(G,x,y,z,q()*3);solids.push({cx:x,cz:z,r:.28});}
      if(k==='cellar'&&propFree(hd,ox+fx*1.8+fz*.6,oz+fz*1.8-fx*.6,.2)){const [x,y,z]=W_(ox+fx*1.8+fz*.6,oz+fz*1.8-fx*.6);LV.bucket(G,x,y,z,false,q()*3);}}
    {const lx=(g[0]+g[1])/2+.9,lz=g[3]+.7;if(propFree(hd,lx,lz,.25)){const [x,y,z]=W_(lx,lz);LV.wateringCan(G,x,y,z,q()*3);}}
    if(hi%2===0){const lx=sd*(W/2+1.1),lz=D/2+.9;if(propFree(hd,lx,lz,.2)){const [x,y,z]=W_(lx,lz);LV.milkCan(G,x,y,z);solids.push({cx:x,cz:z,r:.17});}}
    /* the dog's kennel in the corner of the yard by the gate */
    if(hi%3!==1){const lx=gx>0?x0+1.3:x1-1.3,lz=z1-1.4;if(propFree(hd,lx,lz,.7)){const [x,y,z]=W_(lx,lz);LV.kennel(G,x,y,z,hd.yaw+(gx>0?Math.PI/2:-Math.PI/2));solids.push({cx:x,cz:z,r:.5});}}
    /* a bicycle against the street fence, outside, the other side of the gate from the bench */
    if(hi%4===1){const [x,y,z]=W_(gx+2.6,z1+.28);LV.bicycle(G,x,y+.0,z,hd.yaw);solids.push({cx:x,cz:z,r:.4});}
    /* the trodden way round the house to the garden and the privy, churned to mud, the boot prints in it going both ways */
    const side=[sd,-sd].find(s=>{for(let t=0;t<=1;t+=.1){if(!propFree(hd,s*(W/2+1.3),lerp(D/2,-D/2-(hd.dvor?7.4:0),t),.3))return false;}return true;});
    if(side!==undefined){const P=[[gx,z1-.6],[gx*.5+side*(W/2+1.1)*.5,D/2+1.2],[side*(W/2+1.3),D/2-.5],[side*(W/2+1.3),-D/2-(hd.dvor?7.4:0)-.8],[(g[0]+g[1])/2,g[3]+.25]];
      const wc=hd.out.find(o=>o[0]==='wc');if(wc){P.push([(g[0]+g[1])/2+(wc[1]>(g[0]+g[1])/2?1:-1)*((g[1]-g[0])/2+.6),g[3]+.5],[wc[1],wc[2]+1.4]);}
      const mud=[],prints=[];let acc=0,ft=0;
      for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L,n=Math.max(1,Math.ceil(L/.4));
        const pos=[],uv=[],idx=[];for(let k=0;k<=n;k++){const t=k/n,cx=ax+(bx-ax)*t,cz=az+(bz-az)*t,w=.42+.12*Math.sin((acc+t*L)*1.3+hi)+.06*Math.sin((acc+t*L)*4.1);for(const s of [-1,1]){const lx=cx-uz*w*s,lz=cz+ux*w*s;const [x,y,z]=W_(lx,lz);pos.push(x,y+.018,z);uv.push((s+1)*.5,(acc+t*L)*.9);}}
        for(let k=0;k<n;k++){const a=k*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}const mg=new T.BufferGeometry();mg.setAttribute('position',new T.Float32BufferAttribute(pos,3));mg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));mg.setIndex(idx);mg.computeVertexNormals();
        {const nn=mg.attributes.normal;let up=0;for(let k=0;k<nn.count;k++)up+=nn.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const t2=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t2;}mg.setIndex(idx);mg.computeVertexNormals();}}mud.push(mg);
        for(let t=(.36-ft%.36);t<L;t+=.36){const cx=ax+ux*t,cz=az+uz*t,sgn=(Math.floor((acc+t)/.36)%2)?1:-1;for(const lane of [-.16,.16]){const back=lane>0;const off=lane+sgn*.075;const lx=cx-uz*off,lz=cz+ux*off;const [x,y,z]=W_(lx,lz);
            const pg=new T.PlaneGeometry(.12,.29);pg.rotateX(-Math.PI/2);pg.rotateY(hd.yaw+Math.atan2(ux,uz)+(back?Math.PI:0)+(q()-.5)*.18);pg.translate(x,y+.026,z);prints.push(pg);}}
        acc+=L;ft=acc;}
      if(mud.length)mesh(merge(mud),mudM(),0,0,0,G,false).receiveShadow=true;if(prints.length){const m=mesh(merge(prints),bootM(),0,0,0,G,false);m.renderOrder=2;m.receiveShadow=true;}}}
  /* ===== the yard of a house that was hit: what the blast threw out of it and what was dropped in the leaving - the
     glass-wool insulation torn out of the walls and loft in yellow tufts, splintered boards and laths, a chair on its
     back, a bucket, clothes trodden into the dirt, a white plastic sack, a suitcase burst open, crockery in pieces ===== */
  const woolM=()=>memo('glassWool',()=>{const t=tex(128,128,(c,w,h)=>{c.fillStyle='#bfae62';c.fillRect(0,0,w,h);const q=rng(81);c.lineWidth=1;for(let i=0;i<900;i++){const x=q()*w,y=q()*h,a=q()*6.28,l=4+q()*14;c.strokeStyle=`rgba(${220+q()*30|0},${200+q()*30|0},${120+q()*40|0},${.3+q()*.5})`;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+Math.cos(a)*l*.5+(q()-.5)*4,y+Math.sin(a)*l*.5,x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}
      for(let i=0;i<60;i++){c.fillStyle='rgba(60,50,30,.25)';c.beginPath();c.arc(q()*w,q()*h,1+q()*3,0,7);c.fill();}});t.wrapS=t.wrapT=T.RepeatWrapping;return std({map:t,bumpMap:t,bumpScale:.01,roughness:1,envMapIntensity:.1});});
  const tuftG=k=>G('wool'+k,()=>{const g=weldGeo(new T.IcosahedronGeometry(1,2));const P=g.attributes.position,q=rng(90+k);for(let i=0;i<P.count;i++){const v=V3(P.getX(i),P.getY(i),P.getZ(i));const d=.7+n3(v.x*2.2+k,v.y*2.2,v.z*2.2)*.6+q()*.08;v.multiplyScalar(d);v.y*=.45;if(v.y<-.1)v.y=-.1+(v.y+.1)*.2;P.setXYZ(i,v.x,v.y,v.z);}g.computeVertexNormals();worldUV(g,4);return g;});
  function warYard(hd,hi,W,D,dmg){const q=rng(6600+hi),G_=new T.Group();scene.add(G_);const W_=(lx,lz)=>{const [x,z]=villW(hd,lx,lz);return [x,H(x,z),z];};const [x0,x1,z0,z1]=hd.plotL;
    const spot=(r)=>{for(let k=0;k<20;k++){const lx=(q()-.5)*(W+3),lz=D/2+.6+q()*(z1-D/2-1.2);if(propFree(hd,lx,lz,r)&&Math.abs(lx-(hi%2?.6:.2)+.45)>1.1)return[lx,lz];}return null;};
    const wool=[],bd=[],cl=[];
    for(let i=0;i<4+dmg*3;i++){const p=spot(.3);if(!p)continue;const [x,y,z]=W_(...p);const sc=.12+q()*.22;const g=tuftG(i%4).clone();g.applyMatrix4(TRS(x,y+sc*.25,z,0,q()*6,0,sc));wool.push(g);}
    for(let i=0;i<6+dmg*5;i++){const p=spot(.2);if(!p)continue;const [x,y,z]=W_(...p);const g=rbox(.04+q()*.1,.02+q()*.015,.4+q()*1.4,.004);g.rotateZ((q()-.5)*.25);g.rotateY(q()*6);g.translate(x,y+.02,z);bd.push(g);
      if(q()<.4){/* a splinter end */const sp=new T.CylinderGeometry(.004,.02,.18+q()*.2,5);sp.rotateZ(Math.PI/2);sp.rotateY(q()*6);sp.translate(x+(q()-.5)*.4,y+.02,z+(q()-.5)*.4);bd.push(sp);}}
    for(let i=0;i<2+dmg;i++){const p=spot(.3);if(!p)continue;const [x,y,z]=W_(...p);/* cloth trodden into the dirt: a garment's crumpled sheet following the ground */const g=new T.PlaneGeometry(.5+q()*.4,.6+q()*.5,8,8),P=g.attributes.position;
      for(let k=0;k<P.count;k++)P.setZ(k,Math.max(0,Math.sin(P.getX(k)*11+i)*Math.cos(P.getY(k)*9)*.04)+.012);g.computeVertexNormals();g.rotateX(-Math.PI/2);g.rotateY(q()*6);g.translate(x,y,z);cl.push([g,i]);}
    if(wool.length)mesh(merge(wool),woolM(),0,0,0,G_,false).receiveShadow=true;if(bd.length)mesh(merge(bd),q()<.5?plankG:plank,0,0,0,G_);
    const cloths=[0x3a4a6a,0x8a2a2a,0x5a5a4a,0xd8d0c0,0x4a6a4a];cl.forEach(([g,i])=>mesh(g,memo('rag'+i%5,()=>std({map:TX.cloth,color:C(cloths[i%5]),roughness:1,side:T.DoubleSide})),0,0,0,G_,false));
    /* a chair thrown out on its back, a bucket rolled away, a suitcase burst open, the white sack */
    {const p=spot(.5);if(p){const [x,y,z]=W_(...p);const cg=new T.Group();cg.position.set(x,y,z);cg.rotation.y=q()*6;G_.add(cg);viennaChair(cg,0,0,0,0,true);}}
    {const p=spot(.3);if(p){const [x,y,z]=W_(...p);const b=LV.bucket(G_,x,y+.15,z,false,q()*6);b.rotation.z=Math.PI/2;}}
    if(dmg>=2){const p=spot(.5);if(p){const [x,y,z]=W_(...p);const sg=new T.Group();sg.position.set(x,y,z);sg.rotation.y=q()*6;G_.add(sg);const leather=memo('suitcase',()=>std({map:TX.cloth,color:C(0x4a3424),roughness:.7}));
        mesh(rbox(.62,.16,.4,.02),leather,0,.08,0,sg);const lid=mesh(rbox(.62,.05,.4,.02),leather,0,.0,0,sg);lid.position.set(0,.2,-.32);lid.rotation.x=-2.2;mesh(rbox(.14,.02,.03,.008),RF.BR,0,.09,.21,sg);
        const sp=new T.PlaneGeometry(.8,.5,6,6),P=sp.attributes.position;for(let k=0;k<P.count;k++)P.setZ(k,Math.abs(Math.sin(P.getX(k)*8))*.04);sp.computeVertexNormals();sp.rotateX(-Math.PI/2);mesh(sp,memo('rag2',()=>std({map:TX.cloth,color:C(0x8a2a2a),roughness:1,side:T.DoubleSide})),.5,.03,.1,sg,false);}}
    {const p=spot(.3);if(p){const [x,y,z]=W_(...p);const g=new T.SphereGeometry(.22,10,8);const P=g.attributes.position;for(let k=0;k<P.count;k++){const v=V3(P.getX(k),P.getY(k),P.getZ(k));v.multiplyScalar(.75+Math.random()*.35);v.y*=.55;P.setXYZ(k,v.x,v.y,v.z);}g.computeVertexNormals();
      mesh(g,memo('sack',()=>std({color:C(0xd8d8d0),roughness:.55,envMapIntensity:.4})),x,y+.08,z,G_);}}
    /* pieces of a plate */for(let i=0;i<6;i++){const p=spot(.1);if(!p)continue;const [x,y,z]=W_(...p);const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(.06+q()*.05,0);sh.lineTo(q()*.05,.04+q()*.05);sh.closePath();const g=new T.ExtrudeGeometry(sh,{depth:.006,bevelEnabled:false});g.rotateX(-Math.PI/2);mesh(g,RF.PORC,x,y+.008,z,G_);}}
  function PLOT(hd,hi,W,D,dx){const g=hd.garden;const [x0,x1,z0,z1]=hd.plotL;
    /* the footprints of whatever stands in the garden (a greenhouse): the ridges stop short of it */
    const FPS={saray:[3.8,3.2],banya:[4.3,4.5],wood:[4.1,1.9],wc:[1.5,1.75],green:[3.1,5.9],cellar:[2.5,2.8]};
    const busy=hd.out.map(([k,lx,lz,ry])=>{const sw=Math.abs(Math.sin(ry))>.5,[w,d]=FPS[k];const W_=(sw?d:w)/2+.25,D_=(sw?w:d)/2+.25;return[lx-W_,lx+W_,lz-D_,lz+D_];});
    const isBusy=(x,z)=>busy.some(b=>x>b[0]&&x<b[1]&&z>b[2]&&z<b[3]);
    const gx=dx-.45,pc=[(x0+x1)/2,(z0+z1)/2],gc=[(g[0]+g[1])/2,(g[2]+g[3])/2];{const dmg_=(HSTYLE[hd.id]||{}).dmg||0;let dn=null;if(dmg_>=2||(hd.ruin&&hd.fence!=='rail')){const L_=x1-x0,a0=(gx+.75-x0)+1.2+((hi*37)%5)*.4;dn=[Math.min(a0,L_-3.5),Math.min(a0,L_-3.5)+2.2+dmg_*.6];}fenceRun(hd,x0,z1,x1,z1,hd.fence,[gx-.75,gx+.75],0,pc,dn);}fenceRun(hd,x0,z0,x0,z1,'rail',null,0,pc);fenceRun(hd,x1,z0,x1,z1,'rail',null,0,pc);fenceRun(hd,x0,z0,x1,z0,'rail',null,0,pc);
    /* the garden: its own low rail fence, dug ridges, potatoes in most of them, a row or two of cabbages */
    fenceRun(hd,g[0],g[2],g[1],g[2],'rail',null,.9,gc);fenceRun(hd,g[0],g[2],g[0],g[3],'rail',null,.9,gc);fenceRun(hd,g[1],g[2],g[1],g[3],'rail',null,.9,gc);fenceRun(hd,g[0],g[3],g[1],g[3],'rail',[(g[0]+g[1])/2-.6,(g[0]+g[1])/2+.6],.9,gc);
    /* the ridges, hoed up by hand: each one follows the ground, wanders a little off the line, swells and slumps along
       its length, its crown lumpy, its ends ragged; clods large and small lie on its flanks and in the furrows */
    /* the whole bed is turned earth, furrows included: a sheet of soil laid over the ground, a little lumpy, darker and damper
       than the ridge crowns */
    {const nx=Math.ceil((g[1]-g[0])/.3),nz=Math.ceil((g[3]-g[2])/.3),pos=[],uv=[],idx=[];
     for(let j=0;j<=nz;j++)for(let i=0;i<=nx;i++){const lx=g[0]+(g[1]-g[0])*i/nx,lz=g[2]+(g[3]-g[2])*j/nz;const [wx,wz]=villW(hd,lx,lz);const edge=Math.min(i,nx-i,j,nz-j)===0;
       pos.push(wx,H(wx,wz)+(edge?-.04:BED+(vnoise(wx*5,wz*5)-.5)*.025),wz);uv.push(wx*.8,wz*.8);}
     for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const a=j*(nx+1)+i,b=a+nx+1;idx.push(a,b,a+1,b,b+1,a+1);}
     const bg=new T.BufferGeometry();bg.setAttribute('position',new T.Float32BufferAttribute(pos,3));bg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));bg.setIndex(idx);bg.computeVertexNormals();
     {const n=bg.attributes.normal;let up=0;for(let k=0;k<n.count;k++)up+=n.getY(k);if(up<0){for(let k=0;k<idx.length;k+=3){const t=idx[k+1];idx[k+1]=idx[k+2];idx[k+2]=t;}bg.setIndex(idx);bg.computeVertexNormals();}}
     bk.add(bg,furrowM);}
    const q=rng(77+hi);let ri=0;
    for(let z=g[2]+.85+q()*.15;z<g[3]-.7;z+=.74+q()*.1){const kind=q();ri++;const seed=hi*31+ri*7.3;
      const xa0=g[0]+.6+q()*.3,xb0=g[1]-.6-q()*.3;const runs=[];let st=null;for(let x=xa0;x<=xb0+.001;x+=.1){const b=isBusy(x,z);if(!b&&st===null)st=x;if((b||x>xb0-.05)&&st!==null){const e=b?x-.1:x;if(e-st>.4)runs.push([st,e]);st=null;}}
      for(const [xa,xb] of runs){const top=ridge(hd,xa,xb,z,seed);
        /* clods: most of them crumbs, a few fist-sized */
        for(let t=xa+.04;t<xb;t+=.07){if(q()>(hd.boarded?.3:.6))continue;const k=Math.min(top.length-1,Math.round((t-xa)/(xb-xa)*(top.length-1))),[,zc,hg,wd]=top[k];const off=(q()*2-1)*(wd+.12),pr=Math.max(0,1-(off/wd)*(off/wd));
          const [cx,cz]=villW(hd,t,zc+off);const sc=.014+Math.pow(q(),1.8)*.085;bk.add(clodG[sc>.06?(q()*2|0):2+(q()*2|0)],clodM,TRS(cx,H(cx,cz)+BED+Math.sqrt(pr)*hg-sc*.25,cz,q()*3,q()*6.28,q()*3,sc));}
        /* potatoes in most rows, cabbages, carrots and dill in the rest; an empty house's garden is going to weed */
        if(hd.boarded)continue;const yAt=t=>{const k=Math.min(top.length-1,Math.round((t-xa)/(xb-xa)*(top.length-1)));return top[k];};
        const alive=hd.id==='s2'||hd.id==='b4'||(hd.id==='n1'&&ri%3===0);
        if(kind<.62)for(let t=.18;t<xb-xa-.1;t+=.33+q()*.08){const [,zc,hg]=yAt(xa+t);const [px,pz]=villW(hd,xa+t,zc+(q()-.5)*.05);const sc=.8+q()*.45;if(!alive&&q()<.15)continue;ibk.add(alive?potGeo:potGeoD,alive?POT:POTD,TRS(px,H(px,pz)+BED+hg-(alive?.05:.07),pz,(q()-.5)*.15,q()*6.28,(q()-.5)*.15,sc));}
        else if(kind<.82)for(let t=.3;t<xb-xa-.15;t+=.5){const [,zc,hg]=yAt(xa+t);const [px,pz]=villW(hd,xa+t,zc);const y0=H(px,pz)+BED+hg-.06,sc=.85+q()*.35;ibk.add(cabGeo,alive?CABO:CABD,TRS(px,y0-(alive?0:.02),pz,alive?0:(q()-.5)*.3,q()*6.28,0,sc*(alive?1:.9)));if(!alive&&q()<.4)continue;ibk.add(alive?CHEAD:CHEADD,alive?CABH:CABHD,TRS(px,y0+(alive?.1:.06)*sc,pz,0,q()*6,0,sc*(alive?1:.85)));}
        else for(let t=.1;t<xb-xa-.05;t+=.14){const [,zc,hg]=yAt(xa+t);const [px,pz]=villW(hd,xa+t,zc);ibk.add(fernGeo,alive?FERN:FERND,TRS(px,H(px,pz)+BED+hg-.04,pz,alive?0:(q()-.5)*.6,q()*6.28,alive?0:(q()-.5)*.6,.6+q()*.5));}}}
    /* the bench (lavochka) outside the front fence beside the gate, where the old people sit of an evening: two log
       stumps dug in, a thick plank seat, on some a back board on two uprights */
    if(!hd.boarded){const bx=gx-2.25,bz=z1+.42;const bg=OUTG(hd,bx,bz,0);const sw=std({map:M.boards.map,color:C(0x8c7e6a),roughness:1});
      [-.62,.62].forEach(x=>{const st=new T.CylinderGeometry(.11,.12,.62,18);mesh(st,M.logs,x,.16,0,bg);});mesh(rbox(1.7,.055,.34,.012),sw,0,.5,0,bg);mesh(rbox(1.6,.04,.06,.008),sw,0,.455,.12,bg);
      if(hi%3!==1){[-.62,.62].forEach(x=>mesh(rbox(.06,.62,.05,.008),sw,x,.62,-.19,bg));mesh(rbox(1.6,.14,.035,.01),sw,0,.86,-.2,bg);}
      const r=villRect(hd,bx-.86,bx+.86,bz-.22,bz+.2);solidAABB(r.x1,r.x2,r.z1,r.z2);}
    for(const o of hd.out)OUT[o[0]](hd,o[1],o[2],o[3],hi);
    {const dmg_=(HSTYLE[hd.id]||{}).dmg||0;if(dmg_||hd.ruin)warYard(hd,hi,W,D,Math.max(dmg_,hd.ruin?2:0));}}
  /* a run of fence along a straight line in the house's frame, posts sunk in the ground; picket (shtaketnik), close
     boards, or poles on posts (zherdi); an opening [a,b] along the run for a gate */
  function fenceRun(hd,ax,az,bx,bz,type,gap,hgt,cen,down){/* (down: [t0,t1] along the run where a blast knocked it flat) */const isDown=t=>down&&t>down[0]&&t<down[1];const L=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/L,uz=(bz-az)/L,yr=hd.yaw+Math.atan2(-uz,ux);const hh=hgt||(type==='board'?1.65:type==='picket'?1.2:1.1);
    const fm=type==='board'&&hd.boarded?plankG:type==='board'?plank:plankG;
    /* the side away from what the fence encloses: rails are nailed to that face of the posts, the boards to the rails */
    let nx=-uz,nz=ux;{const c0=cen||[0,0],mx=(ax+bx)/2-c0[0],mz=(az+bz)/2-c0[1];if(nx*mx+nz*mz<0){nx=-nx;nz=-nz;}}
    const at=(t,o)=>villW(hd,ax+ux*t+nx*(o||0),az+uz*t+nz*(o||0));
    /* the run in spans either side of the gateway; posts evenly spaced along each span, one at each of its ends, so
       every rail ends on a post */
    let spans=[[0,L]];if(gap){const t0=ax===bx?(gap[0]-az)/uz:(gap[0]-ax)/ux,t1=ax===bx?(gap[1]-az)/uz:(gap[1]-ax)/ux;spans=[[0,Math.min(t0,t1)],[Math.max(t0,t1),L]];}
    const gate=gap&&type!=='rail',bay=type==='rail'?2.3:2.1,pR=type==='rail'?.07:.06,q=rng(Math.round((ax*7+az*13+bx*3+bz*5)*100)+hd.x|0);
    const postG=G('fpost'+type+hh,()=>{const g=new T.CylinderGeometry(pR*.88,pR,hh+.5,12,4);const P=g.attributes.position;for(let i=0;i<P.count;i++){const y=P.getY(i),a=Math.atan2(P.getZ(i),P.getX(i)),k=1+(Math.sin(a*3+y*2.1)*.05+Math.sin(a*7+y*5)*.025);P.setX(i,P.getX(i)*k);P.setZ(i,P.getZ(i)*k);}
      const U=g.attributes.uv;for(let i=0;i<U.count;i++)U.setXY(i,U.getX(i)*.45,U.getY(i)*(hh+.5)*.6);g.translate(0,(hh+.5)/2-.5,0);g.computeVertexNormals();return g;});
    for(const [s0,s1] of spans){if(s1-s0<.3)continue;const n=Math.max(1,Math.ceil((s1-s0)/bay)),ts=[];for(let i=0;i<=n;i++)ts.push(s0+(s1-s0)*i/n);
      /* (where a shell landed on the line the posts are gone and the rails lie broken in the hole) */const gone=ts.map(t=>{const [x,z]=at(t);return craterD(x,z)<-.08;});
      ts.forEach((t,i)=>{if(gone[i])return;if(gate&&((i===0&&s0>0)||(i===n&&s1<L)))return;const [x,z]=at(t);const dn=isDown(t);bk.add(postG,M.post,TRS(x,H(x,z)-(dn?.12:0),z,dn?(q()-.5)*.9:(q()-.5)*.05,q()*6.28,dn?(q()-.5)*.9:(q()-.5)*.05));});
      const rails=type==='rail'?[.3,.64,.97].map(k=>k*hh):[.26,.82].map(k=>k*hh);
      for(let i=0;i<n;i++){const ta=ts[i],tb=ts[i+1];
        if(gone[i]||gone[i+1]){for(let k=0;k<2;k++){const [x,z]=at(lerp(ta,tb,.3+q()*.4),(q()-.5)*1.2);const L_=.6+q()*.9,rg=new T.CylinderGeometry(.045,.05,L_,20);rg.rotateZ(Math.PI/2+(q()-.5)*.3);
            bk.add(rg,M.post,TRS(x,H(x,z)+.05,z,0,q()*6.28,0));}continue;}
        if(type==='rail'){/* poles: barked, a little crooked, nailed across the posts' outer faces; inside a run each one
             runs a hand past the post into the next bay, at the run's ends it stops on the post */
          const ea=i>0?.12:0,eb=i<n-1?.12:0,o=pR+.05;const A=at(ta-ea,o),B=at(tb+eb,o);
          rails.forEach((ry,k)=>{const r=.042+q()*.012,ya=H(A[0],A[1])+ry+(q()-.5)*.03,yb=H(B[0],B[1])+ry+(q()-.5)*.03;const ln=Math.hypot(B[0]-A[0],B[1]-A[1],yb-ya);
            const rg=new T.CylinderGeometry(r,r*1.1,ln,10,3);{const P=rg.attributes.position;const bow=(q()-.5)*.05;for(let j=0;j<P.count;j++){const y=P.getY(j)/ln;P.setX(j,P.getX(j)+bow*(1-4*y*y));}}
            {const U=rg.attributes.uv;for(let j=0;j<U.count;j++)U.setXY(j,U.getX(j)*.4,U.getY(j)*ln*.5);}rg.computeVertexNormals();
            const d=V3(B[0]-A[0],yb-ya,B[1]-A[1]).normalize();const m4=new T.Matrix4().compose(V3((A[0]+B[0])/2,(ya+yb)/2,(A[1]+B[1])/2),new T.Quaternion().setFromUnitVectors(V3(0,1,0),d),V3(1,1,1));bk.add(rg,M.post,m4);});}
        else if(isDown(ta)||isDown(tb)){/* knocked flat: the rails torn off, lying with the boards still nailed to them */const A=at(ta,.6+q()*.8),B=at(tb,.4+q()*.9);rails.forEach(()=>{const ya=H(A[0],A[1])+.06,yb=H(B[0],B[1])+.08,ln=Math.hypot(B[0]-A[0],B[1]-A[1]);
            const rg=new T.BoxGeometry(ln*(.6+q()*.35),.065,.035);bk.add(rg,fm,new T.Matrix4().compose(V3((A[0]+B[0])/2,(ya+yb)/2,(A[1]+B[1])/2),new T.Quaternion().setFromEuler(new T.Euler(Math.PI/2,yr+(q()-.5)*.4,0,'YXZ')),V3(1,1,1)));});continue;}
        else{/* two sawn rails on the posts' outer faces, the boards or pickets nailed to the rails */
          const o=pR+.0175,A=at(ta,o),B=at(tb,o);rails.forEach(ry=>{const ya=H(A[0],A[1])+ry,yb=H(B[0],B[1])+ry,ln=Math.hypot(B[0]-A[0],B[1]-A[1]);
            const rg=new T.BoxGeometry(ln,.065,.035);bk.add(rg,fm,new T.Matrix4().compose(V3((A[0]+B[0])/2,(ya+yb)/2,(A[1]+B[1])/2),new T.Quaternion().setFromEuler(new T.Euler(0,yr,Math.atan2(yb-ya,ln),'YXZ')),V3(1,1,1)));});}
        const r=villRect(hd,Math.min(ax+ux*ta,ax+ux*tb)-(ax===bx?.1:0),Math.max(ax+ux*ta,ax+ux*tb)+(ax===bx?.1:0),Math.min(az+uz*ta,az+uz*tb)-(az===bz?.1:0),Math.max(az+uz*ta,az+uz*tb)+(az===bz?.1:0));solidAABB(r.x1,r.x2,r.z1,r.z2);}
      if(type==='picket'||type==='board'){const st=type==='board'?.185:.15,bw=type==='board'?.165:.085,o=pR+.035+.012;const nb=Math.max(1,Math.round((s1-s0-.04)/st));
        for(let i=0;i<nb;i++){const t=s0+.02+(i+.5)*(s1-s0-.04)/nb;if(isDown(t)){if(q()<.25)continue;const [x,z]=at(t+(q()-.5)*.3,.3+q()*1.2);const lg=type==='board'?rbox(bw,hh*(.5+q()*.5),.022,.003):rbox(bw,hh*(.4+q()*.6),.02,.003);bk.add(lg,fm,TRS(x,H(x,z)+.03,z,-Math.PI/2+(q()-.5)*.15,yr+(q()-.5)*.6,0));continue;}const [x,z]=at(t,o);if(craterD(x,z)<-.05)continue;const y=H(x,z),ph=hh+(type==='picket'?(q()-.5)*.06:(q()-.5)*.02);
          const key='fb'+type+(ph*50|0);const pg=G(key,()=>{let g;if(type==='picket'){const sh=new T.Shape();sh.moveTo(-bw/2,0);sh.lineTo(bw/2,0);sh.lineTo(bw/2,ph-.1);sh.lineTo(0,ph-.02);sh.lineTo(-bw/2,ph-.1);sh.closePath();
              g=new T.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:1});g.translate(0,0,-.01);}else g=rbox(bw,ph,.022,.003).translate(0,ph/2,0);
            worldUV(g,1);g.translate(0,.05,0);return g;});
          bk.add(pg,fm,TRS(x,y,z,0,yr,(q()-.5)*.025));}}}
    /* the gate: heavier posts either side, its leaf standing open */
    if(gate){[gap[0],gap[1]].forEach(p=>{const [x,z]=ax===bx?villW(hd,ax,p):villW(hd,p,az);bk.add(new T.CylinderGeometry(.075,.085,hh+.85,12).translate(0,(hh+.85)/2-.5,0),M.post,TRS(x,H(x,z),z));});
      const [x,z]=ax===bx?villW(hd,ax,gap[1]):villW(hd,gap[1],az);const gt=new T.Group();gt.position.set(x,H(x,z),z);gt.rotation.y=yr+2.1;scene.add(gt);
      const lw=Math.abs(gap[1]-gap[0])-.2,nb=Math.max(4,Math.round(lw/(type==='board'?.185:.15)));
      for(let i=0;i<nb;i++)mesh(rbox(type==='board'?.165:.085,hh-.12,.022,.003),fm,-.12-(i+.5)*lw/nb,hh/2,0,gt);[.22,.8].forEach(k=>mesh(rbox(lw,.065,.035,.004),fm,-.1-lw/2,k*hh,-.03,gt));
      {const br=mesh(rbox(.06,Math.hypot(lw,hh*.58),.03,.004),fm,-.1-lw/2,hh*.51,-.03,gt);br.rotation.z=Math.atan2(lw,hh*.58);}}}
  /* ===== outbuildings, placed in the house's frame (x, z) and turned (ry) relative to it; each sits on its own footing ===== */
  const OUTG=(hd,lx,lz,ry)=>{const [x,z]=villW(hd,lx,lz);const g=new T.Group();g.position.set(x,H(x,z),z);g.rotation.y=hd.yaw+ry;scene.add(g);return g;};
  const OUTS=(hd,lx,lz,ry,w,d)=>{const sw=Math.abs(Math.sin(ry))>.5;const r=villRect(hd,lx-(sw?d:w)/2,lx+(sw?d:w)/2,lz-(sw?w:d)/2,lz+(sw?w:d)/2);solidAABB(r.x1,r.x2,r.z1,r.z2);};
  const gableRoof=(g,w,d,y,rise,m,ovh=.3)=>{const ex=d/2+ovh,ez=w/2+ovh,sl=Math.hypot(ez,rise)*1.6;shootables.push(mesh(merge([quad([-ex,y,ez],[ex,y,ez],[ex,y+rise,0],[-ex,y+rise,0],-ex,ex,0,sl),quad([ex,y,-ez],[-ex,y,-ez],[-ex,y+rise,0],[ex,y+rise,0],-ex,ex,0,sl)].map(q=>{q.rotateY(Math.PI/2);q.computeVertexNormals();return q;})),m,0,0,0,g));
    [-1,1].forEach(s=>{const gs=new T.Shape();gs.moveTo(-w/2,0);gs.lineTo(w/2,0);gs.lineTo(0,rise);gs.closePath();const gg=new T.ExtrudeGeometry(gs,{depth:.03,bevelEnabled:false});worldUV(gg,1);mesh(gg,plankG,0,y,s*d/2-(s>0?.03:0),g);});};
  const plankWalls=(g,w,d,hh,m,doorW,doorSide)=>{const pl=[];const add=(x,z,ax,len)=>{const n=Math.round(len/.2);for(let i=0;i<n;i++){const t=-len/2+(i+.5)*len/n;if(doorSide&&ax===doorSide.ax&&Math.abs(t-doorSide.c)<doorW/2&&Math.sign(ax==='x'?z:x)===doorSide.s)continue;
      const b=new T.BoxGeometry(ax==='x'?len/n-.008:.03,hh+(i*7%3)*.02,ax==='x'?.03:len/n-.008);b.translate(ax==='x'?t:x,hh/2-.05,ax==='x'?z:t);pl.push(b);}};
    add(0,d/2,'x',w);add(0,-d/2,'x',w);add(w/2,0,'z',d);add(-w/2,0,'z',d);shootables.push(mesh(merge(pl),m,0,0,0,g));
    [[-w/2,-d/2],[w/2,-d/2],[-w/2,d/2],[w/2,d/2]].forEach(([x,z])=>mesh(rbox(.1,hh+.5,.1,.01),M.post,x,(hh+.5)/2-.5,z,g));};
  const doorLeaf=(g,x,z,ry,w,hh,m,ang)=>{const d=new T.Group();d.position.set(x,0,z);d.rotation.y=ry;g.add(d);const l=new T.Group();l.rotation.y=ang||0;d.add(l);mesh(rbox(w,hh,.04,.01),m,w/2,hh/2+.02,0,l);
    [.25,hh-.25].forEach(y=>mesh(rbox(w-.08,.1,.03,.01),m,w/2,y,.035,l));const zb=mesh(rbox(.08,Math.hypot(w-.2,hh-.6),.03,.005),m,w/2,hh/2,.035,l);zb.rotation.z=Math.atan2(w-.2,hh-.6);mesh(new T.SphereGeometry(.025,6,5),M.rust,w-.12,hh/2,.06,l);return l;};
  const OUT={
    /* the shed (saray): plank walls on posts, a lean of tin or slate, its door ajar */
    saray(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);const w=3.2,d=2.6,hh=2.3;plankWalls(g,w,d,hh,hi%2?plank:plankG,1,{ax:'x',c:.4,s:1});mesh(rbox(w-.1,.05,d-.1,.01),plankG,0,.05,0,g);
      doorLeaf(g,-.1,d/2+.02,0,1.0,2.0,plankG,-.5);gableRoof(g,w,d,hh-.05,.8,hd.roof==='tin'?tinM(hd.rc||0x6a6e70):slateDS);OUTS(hd,lx,lz,ry,w,d);},
    /* the bathhouse (banya): a small log house, a little window, a stovepipe with its cap */
    banya(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);const w=3.2,d=3.6,n=9,lr=.11,ls=.2;const lg=[],lgc=[],bq=rng(6600+hi);
      for(let k=0;k<n;k++){const y=.1+k*ls;[[0,d/2,'x',w],[0,-d/2,'x',w],[w/2,0,'z',d],[-w/2,0,'z',d]].forEach(([x,z,ax,L])=>{const ext=((k%2===0)===(ax==='x'))?.22:0;const pieces=ax==='x'&&z>0&&y<1.9?[[-L/2-ext,-.1],[.75,L/2+ext]]:ax==='z'&&x>0&&y>.9&&y<1.5?[[-L/2-ext,-.3],[.3,L/2+ext]]:[[-L/2-ext,L/2+ext]];
        pieces.forEach(([a,b])=>{const lo=ax==='x'?hqLog(V3(a,y,z),V3(b,y,z),lr,bq,{rs:12,seg:1.2,bow:.01,taper:.04}):hqLog(V3(x,y+ls/2,a),V3(x,y+ls/2,b),lr,bq,{rs:12,seg:1.2,bow:.01,taper:.04});lg.push(lo.side);lgc.push(lo.cap);});});}
      shootables.push(mesh(merge(lg),hd.burnt?charred:LOGM,0,0,0,g));mesh(merge(lgc),hd.burnt?charEnd:WM.end,0,0,0,g);mesh(rbox(w+.2,.25,d+.2,.02),stone,0,-.05,0,g);
      doorLeaf(g,-.1,d/2+.03,0,.85,1.75,plankG,0);mesh(new T.PlaneGeometry(.55,.5),M.glass,w/2+.05,1.2,0,g).rotation.y=Math.PI/2;[[0,.3,.7,.06],[0,-.3,.7,.06],[0,0,.06,.66]].forEach(([y,zz,a,b])=>0);
      gableRoof(g,w+.3,d,.1+n*ls,.95,slateDS);const pipe=mesh(new T.CylinderGeometry(.09,.09,1.6,16),memo('bathPipe',()=>std({map:PB.rust.a,normalMap:PB.rust.n,roughnessMap:PB.rust.r,color:C(0x5a4a40),roughness:1,metalness:.5})),-.6,.1+n*ls+.9,-.6,g);mesh(new T.ConeGeometry(.2,.15,10),M.rust,-.6,.1+n*ls+1.78,-.6,g);
      OUTS(hd,lx,lz,ry,w+.4,d+.4);},
    /* firewood: split logs stacked end-out under a lean-to on four posts */
    wood(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);const w=3.4,d=1.1,q=rng(500+hi);const wd=std({map:TX.bark,color:C(0x8a7458),roughness:1}),endM=std({color:C(0xb69a72),roughness:1});
      for(let r=0;r<7;r++)for(let i=0;i<14;i++){const x=-w/2+.15+i*.23+(r%2)*.11,y=.12+r*.2;if(x>w/2-.12)continue;const lg=new T.CylinderGeometry(.095+q()*.02,.1,d*.92,6);lg.rotateX(Math.PI/2);bk.add(lg,q()<.5?wd:endM,new T.Matrix4().multiplyMatrices(g.matrixWorld.clone().compose(g.position,g.quaternion,V3(1,1,1)),TRS(x,y,0,0,0,q()*3)));}
      /* the lean-to: tall posts at the back, short at the front, a top plate on each pair, the roof lying on the plates */
      const zb=-d/2-.1,zf=d/2+.1,yb=2.3,yf=1.95,ang=Math.atan2(yb-yf,zf-zb);
      [[-w/2-.1,zb,yb],[w/2+.1,zb,yb],[-w/2-.1,zf,yf],[w/2+.1,zf,yf]].forEach(([x,z,top])=>mesh(rbox(.1,top+.3,.1,.01),M.post,x,(top+.3)/2-.3,z,g));
      [[zb,yb],[zf,yf]].forEach(([z,top])=>mesh(rbox(w+.36,.08,.1,.01),M.post,0,top+.04,z,g));
      const rl=Math.hypot(zf-zb,yb-yf)+.5,r=mesh(rbox(w+.6,.035,rl,.008),hd.roof==='tin'?tinM(hd.rc||0x6a6e70):slateDS,0,(yb+yf)/2+.08+.0175/Math.cos(ang),(zb+zf)/2,g);r.rotation.x=ang;OUTS(hd,lx,lz,ry,w+.4,d+.4);},
    /* the privy at the end of the garden */
    wc(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);plankWalls(g,1.1,1.3,2.0,plankG,.7,{ax:'x',c:0,s:1});doorLeaf(g,-.36,.67,0,.72,1.85,plankG,-.2);
      /* the roof sits on the wall tops and a raised front plate: high over the door, falling to the back */
      mesh(rbox(1.2,.2,.06,.01),plankG,0,2.01,.65,g);const ang=Math.atan2(.14,1.3);const r=mesh(rbox(1.5,.035,1.75,.008),slateDS,0,2.06,0,g);r.rotation.x=-ang;OUTS(hd,lx,lz,ry,1.3,1.5);},
    /* a greenhouse: hoops of steel under clouded film, tomatoes inside */
    green(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);const L=5.6,R=1.4,st=memo('ghFrame',()=>std({map:PB.galv.a,normalMap:PB.galv.n,roughnessMap:PB.galv.r,color:C(0xb0b2ae),roughness:1,metalness:.7,envMapIntensity:.8}));for(let i=0;i<=6;i++){const t=new T.TorusGeometry(R,.022,8,36,Math.PI);t.translate(0,0,-L/2+i*L/6);bk.add(t,st,new T.Matrix4().compose(g.position,g.quaternion,V3(1,1,1)));}
      const fg=new T.CylinderGeometry(R,R,L,20,1,true,-Math.PI/2,Math.PI);fg.rotateX(Math.PI/2);mesh(fg,film,0,0,0,g);[-1,1].forEach(s=>mesh(new T.CircleGeometry(R,20,0,Math.PI),film,0,0,s*L/2,g));
      /* tomatoes on stakes, two rows: nobody has watered them since the shelling started - most have dried brown on their
         stakes, a few still green at the top, a last fruit or two on them */
      const q=rng(700+hi),parts={0:[],1:[],2:[],3:[]};for(let i=0;i<10;i++){const x=(i%2?.6:-.6)+(q()-.5)*.08,z=-L/2+.5+(i>>1)*1.1+(q()-.5)*.1;const st_=q()<.25?0:q()<.5?1:2;
        tomatoPlant(q,st_,parts,x,.1,z);const sk=new T.CylinderGeometry(.009,.011,1.05,8);sk.translate(x+.04,.6,z+.03);parts[3].push(sk);}
      [0,1,2].forEach(k=>{if(parts[k].length)mesh(merge(parts[k]),TOM.leaf[k],0,0,0,g);});mesh(merge(parts[3]),M.post,0,0,0,g);if(parts.stemG)mesh(merge(parts.stemG),TOM.stemG,0,0,0,g);if(parts.stemD)mesh(merge(parts.stemD),TOM.stemD,0,0,0,g);if(TOM.fruit.length){mesh(merge(TOM.fruit.splice(0)),TOM.fruitM,0,0,0,g);}
      mesh(rbox(2.4,.12,L-.2,.01),soilM,0,.04,0,g);OUTS(hd,lx,lz,ry,2*R,L);},
    /* the cellar (pogreb): a stone-walled pit roofed over by a squat timber cellar-house with a padlocked door; behind it
       the turfed earth bank over the vault, its tin vent pipe standing up out of the grass */
    cellar(hd,lx,lz,ry,hi){const g=OUTG(hd,lx,lz,ry);const w=1.9,d=2.2;
      mesh(rbox(w+.36,.75,d+.36,.03),stone,0,-.1,0,g);[[0,d/2+.19],[0,-d/2-.19]].forEach(([x,z])=>{for(let i=0;i<6;i++)mesh(rbox(.32,.16,.08,.02),stone,-w/2+.15+i*.33,.12+(i%2)*.1,z,g);});
      plankWalls(g,w,d,1.55,hi%2?plankG:plank,.8,{ax:'x',c:0,s:1});mesh(rbox(.95,.08,.12,.01),M.post,0,1.82,d/2+.02,g);
      const lf=doorLeaf(g,-.4,d/2+.03,0,.8,1.72,plankG,0);mesh(rbox(.06,.08,.03,.01),memo('padlockM',()=>std({map:PB.rust.a,color:C(0x7a7470),roughness:.7,metalness:.8})),.74,.95,.07,lf);mesh(new T.TorusGeometry(.03,.008,5,10),std({color:C(0x3a3a38),roughness:.4,metalness:.8}),.74,.9,.08,lf);
      gableRoof(g,w,d,1.5,.85,hd.roof==='tin'?tinM(hd.rc||0x6a6e70):slateDS,.25);
      /* the bank over the vault, turfed */const bg=new T.SphereGeometry(1,22,10,0,Math.PI*2,0,Math.PI/2);const p=bg.attributes.position;for(let i=0;i<p.count;i++){const q=Math.sin(p.getX(i)*6+hi)*.05+Math.cos(p.getZ(i)*5)*.04;p.setXYZ(i,p.getX(i)*(1.9+q),p.getY(i)*(.95+q)-.12,p.getZ(i)*(2.4+q));}bg.computeVertexNormals();
      mesh(bg,turfM,0,0,-d/2-2.45,g);const vp=std({color:C(0x7a7c78),roughness:.5,metalness:.6});mesh(new T.CylinderGeometry(.06,.06,1.1,20),vp,.3,.75,-d/2-2.85,g);mesh(new T.ConeGeometry(.14,.12,10),vp,.3,1.34,-d/2-2.85,g);
      OUTS(hd,lx,lz,ry,w+.4,d+.4);const [bx,bz]=villW(hd,lx-(d/2+2.45)*Math.sin(ry),lz-(d/2+2.45)*Math.cos(ry));solids.push({cx:bx,cz:bz,r:1.8});}};
  /* the yards' own growth, planted at boot (see villageYards): an apple tree or birch, lilac and currant by the fences */
  /* ===== what grows in and round the yards (planted at boot, see villageYards) ===== */
  let VT=null;const vt=()=>VT||(VT={birch:speciesTypes(birchGeo,woodMat.birch,MB,TX.twigBirch),bush:speciesTypes(bushGeo,woodMat.dead,MG,TX.twigBush),dead:speciesTypes(deadGeo,woodMat.dead,null,null),apple:speciesTypes(appleGeo,woodMat.bark,MG,TX.twigBush)});
  const SCALE={bush:[.6,1.05],apple:[.85,1.15],ybirch:[.5,.7],birch:[.8,1.15],dead:[.6,.8]},SOLR={bush:.35,apple:.2,ybirch:.16,birch:.22,dead:.2};
  const plantAt=(q,col,x,z,kind,s)=>{const L=vt()[kind==='ybirch'?'birch':kind];col.setRGB(1,1,1).offsetHSL((q()-.5)*.06,(q()-.5)*.15,(q()-.5)*.1);
    vegPut(L[(q()*L.length)|0],x,H(x,z)-.12,z,q()*6.28,s,s*(.9+q()*.2),col,null);solids.push({cx:x,cz:z,r:SOLR[kind]*s});};
  /* inside a plot: never on the house, the garden beds, an outbuilding or the cellar's bank, the gate path, or the fence */
  const FPY={saray:[3.8,3.2],banya:[4.3,4.5],wood:[4.1,1.9],wc:[1.5,1.75],green:[3.1,5.9],cellar:[2.5,2.8]};
  const yardBusy=(hd,hi)=>{if(hd._yb)return hd._yb;const W=hd.W,D=hd.D,g=hd.garden,L=[[-W/2-1.0,W/2+1.0,-D/2-1.0-(hd.dvor?7.4:0),D/2+(hd.ver?2.7:1.9)],[g[0]-.35,g[1]+.35,g[2]-.35,g[3]+.35]];
    hd.out.forEach(([k,lx,lz,ry])=>{const sw=Math.abs(Math.sin(ry))>.5,[w,d]=FPY[k];const a=(sw?d:w)/2+.6,b=(sw?w:d)/2+.6;L.push([lx-a,lx+a,lz-b,lz+b]);
      if(k==='cellar'){const bx=lx-3.55*Math.sin(ry),bz=lz-3.55*Math.cos(ry),ex=(sw?2.4:1.9)+.3,ez=(sw?1.9:2.4)+.3;L.push([bx-ex,bx+ex,bz-ez,bz+ez]);}});
    const gx=(hi%2?.6:.2)-.45;L.push([gx-1.2,gx+1.2,D/2,hd.plotL[3]+1]);return hd._yb=L;};
  const yardFree=(hd,hi,lx,lz,r,taken)=>{const [x0,x1,z0,z1]=hd.plotL;if(lx<x0+.7+r||lx>x1-.7-r||lz<z0+.7+r||lz>z1-.7-r)return false;
    if(yardBusy(hd,hi).some(b=>lx>b[0]-r&&lx<b[1]+r&&lz>b[2]-r&&lz<b[3]+r))return false;return !taken.some(t=>Math.hypot(t[0]-lx,t[1]-lz)<t[2]+r);};
  VILL.houses.forEach((hd,hi)=>YARDS.push(()=>{const q=rng(900+hi),col=new T.Color(),taken=[];const [x0,x1,z0,z1]=hd.plotL;
    /* an old apple tree or two (three in the big yards), a young birch, lilac and currant against the fences; an empty
       house's yard has gone wild - more bushes, a self-sown birch, a dead tree */
    const want=hd.boarded?[['dead',1],['ybirch',1],['bush',5]]:[['apple',hd.W>8?3:2],['ybirch',1],['bush',3]];
    for(const [kind,n] of want){let got=0;for(let t=0;t<60&&got<n;t++){let lx,lz;
      if(kind==='bush'){const e=(q()*4)|0;lx=e<2?(e?x1-1.1:x0+1.1):x0+1.5+q()*(x1-x0-3);lz=e>=2?(e===2?z0+1.1:z0+1.5+q()*(z1-z0-3)):z0+1.5+q()*(z1-z0-3);if(e===3)lz=z1-1.1;}
      else{lx=x0+1.5+q()*(x1-x0-3);lz=z0+1.5+q()*(z1-z0-3);}
      const r=kind==='bush'?.75:kind==='ybirch'?1.1:1.8;if(!yardFree(hd,hi,lx,lz,kind==='bush'?.35:.9,taken))continue;
      const [wx,wz]=villW(hd,lx,lz),sc=SCALE[kind];plantAt(q,col,wx,wz,kind,sc[0]+q()*(sc[1]-sc[0]));taken.push([lx,lz,r]);got++;}}}));
  /* the alleys: a hedge of lilac, elder and acacia either side, gapped here and there, an apple or a young birch every
     few metres; the streets' verges; and the odd tree in the grass between the plots */
  YARDS.push(()=>{const q=rng(1313),col=new T.Color(),placed=[];
    const inPlot=(x,z,m)=>VILL.houses.some(hd=>{const r=hd.prect;return x>r.x1-m&&x<r.x2+m&&z>r.z1-m&&z<r.z2+m;});
    const clear=(x,z,r)=>!placed.some(p=>Math.hypot(p[0]-x,p[1]-z)<p[2]+r);
    const free=(x,z,m,pathMin)=>!(villStreetD(x,z)<4.5||Math.hypot(x-HX,z-HZ)<13||villPathD(x,z)<pathMin||Math.hypot(x-VILL.well.x,z-VILL.well.z)<4||inPlot(x,z,m));
    const put=(x,z,kind,m,pathMin)=>{const sc=SCALE[kind],s=sc[0]+q()*(sc[1]-sc[0]),r=kind==='bush'?.6*s:kind==='apple'?1.6:1.0;if(!free(x,z,m,pathMin)||!clear(x,z,r))return false;plantAt(q,col,x,z,kind,s);placed.push([x,z,r]);return true;};
    for(const [pi,za,zb] of VILL.alleys){const L=VILL.paths[pi],w=(VILL.alleyW[pi]||0)+.9;
      for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len;
        for(let t=0;t<len;t+=1.5+q()*.7){const x=ax+ux*t,z=az+uz*t;if(z>Math.max(za,zb)+.5||z<Math.min(za,zb)-.5)continue;
          for(const sd of [-1,1]){if(q()<.13)continue;const off=w+.55+q()*.35,px=x-uz*off*sd,pz=z+ux*off*sd;
            if(q()<.12){put(px-uz*.5*sd,pz+ux*.5*sd,q()<.55?'apple':'ybirch',.5,w+.6);}else put(px,pz,'bush',.15,w+.25);}}}}
    for(const L of VILL.streets){for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len;
      for(let t=0;t<len;t+=3.5+q()*4)for(const sd of [-1,1]){const off=4.9+q()*6,px=ax+ux*t-uz*off*sd,pz=az+uz*t+ux*off*sd,r=q();put(px,pz,r<.5?'bush':r<.75?'apple':'ybirch',.8,2);}}}
    for(let x=4;x<165;x+=4+q()*5){for(const sdz of [-1,1]){const z=villSZ(x)+sdz*(4.8+q()*9);const r=q();if(r<.32)put(x,z,'bush',.8,2);else if(r<.42)put(x,z,'birch',1.6,2);else if(r<.52)put(x,z,q()<.5?'apple':'ybirch',1.2,2);}}
    for(let k=0;k<160;k++){const x=5+q()*200,z=-445+q()*190;const r=q();put(x,z,r<.5?'bush':r<.72?'apple':r<.9?'ybirch':'birch',1.2,2);}});
  buildHouses();
  /* ===== the power line along the street: wooden poles on the north verge with a crossarm and three glass insulators,
     the wires sagging pole to pole, and from the nearest pole a service wire down to an insulator on each house ===== */
  {const q=rng(4242),wood=std({map:TX.bark,color:C(0x6f6354),roughness:.95}),ins=std({color:C(0x9fb8b0),roughness:.15,metalness:.1,envMapIntensity:.9});const poles=[],wires=[];
   const sag=(a,b,dep)=>{for(let t=0;t<12;t++){const u0=t/12,u1=(t+1)/12,f=u=>-4*dep*u*(1-u);const pa=a.clone().lerp(b,u0),pb=a.clone().lerp(b,u1);pa.y+=f(u0);pb.y+=f(u1);wires.push(pa.x,pa.y,pa.z,pb.x,pb.y,pb.z);}};
   /* a pole stands on the verge, never in a yard, an alley, a path's line or the road; the crossarm across the line */
   const okP=(x,z)=>!(VILL.houses.some(hd=>{const r=hd.prect;return x>r.x1-.7&&x<r.x2+.7&&z>r.z1-.7&&z<r.z2+.7;})||villPathD(x,z)<1.5||villStreetD(x,z)<3.7||Math.hypot(x-HX,z-HZ)<9||Math.hypot(x-VILL.well.x,z-VILL.well.z)<3);
   /* (one pole in six has been hit: snapped a couple of metres up, its top lying in the grass where it fell with the
      crossarm still on it, the wires dragged down with it to the ground) */
   let pn=0;const pole=(x,z,ang)=>{const y=H(x,z);if((pn++%6)===3){const fa=ang+(q()<.5?0:Math.PI)+(q()-.5)*.6,hs=1.6+q()*1.2;const st_=new T.CylinderGeometry(.12,.14,hs+.7,18);st_.translate(0,hs/2-.35,0);bk.add(st_,wood,TRS(x,y,z,(q()-.5)*.08,q()*6,(q()-.5)*.08));
       for(let k=0;k<7;k++){const sp=new T.CylinderGeometry(.002,.035,.25+q()*.3,4);sp.translate(0,.12,0);bk.add(sp,wood,TRS(x+(q()-.5)*.12,y+hs-.06,z+(q()-.5)*.12,(q()-.5)*.5,q()*6,(q()-.5)*.5));}
       const L=8.8-hs-.7,dx=Math.sin(fa),dz=Math.cos(fa),bx=x+dx*(L/2+.4),bz=z+dz*(L/2+.4);const top=new T.CylinderGeometry(.1,.12,L,18);top.rotateX(Math.PI/2);bk.add(top,wood,TRS(bx,H(bx,bz)+.12,bz,0,fa,0));
       const ex=x+dx*(L+.2),ez=z+dz*(L+.2);const ag=rbox(.1,.1,1.9,.01);ag.rotateX(Math.PI/2);bk.add(ag,wood,TRS(ex,H(ex,ez)+.25,ez,0,fa+Math.PI/2,0));solids.push({cx:x,cz:z,r:.18});
       return[-.8,0,.8].map(d=>V3(ex+d*dz,H(ex+d*dz,ez-d*dx)+.32,ez-d*dx));}
     const lean=(q()-.5)*.05;const pg=new T.CylinderGeometry(.1,.14,8.8,18);pg.translate(0,4.4-.7,0);bk.add(pg,wood,TRS(x,y,z,lean,q()*6,0));
     const ag=rbox(.1,.1,1.9,.01);ag.translate(0,7.55,0);bk.add(ag,wood,TRS(x,y,z,lean,ang,0));const c=Math.cos(ang),sn=Math.sin(ang);
     const att=[-.8,0,.8].map(dz=>{const ig=new T.CylinderGeometry(.035,.05,.12,16);ig.translate(0,7.67,dz);bk.add(ig,ins,TRS(x,y,z,lean,ang,0));return V3(x+dz*sn,y+7.74,z+dz*c);});
     solids.push({cx:x,cz:z,r:.18});return att;};
   /* walk a street's centre line, a pole every 30-38 m on one verge (the other if that is taken), the wires pole to pole */
   const lines=[];const runLine=(L,side,first)=>{const ps=[];let next=first;let acc=0;
     for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1],len=Math.hypot(bx-ax,bz-az),ux=(bx-ax)/len,uz=(bz-az)/len;
       for(let t=0;t<len;t+=.5){acc+=.5;if(acc<next)continue;const cx=ax+ux*t,cz=az+uz*t;let done=false;
         for(const sd of [side,-side]){const x=cx-uz*5.3*sd,z=cz+ux*5.3*sd;if(okP(x,z)){ps.push(pole(x,z,Math.atan2(ux,uz)+Math.PI/2));done=true;break;}}
         if(done){next=acc+30+q()*8;}else next=acc+1.5;}}
     for(let i=1;i<ps.length;i++)for(let k=0;k<3;k++)sag(ps[i-1][k],ps[i][k],.45);lines.push(...ps);return ps;};
   {const M_=[];for(let x=4;x<=162;x+=2)M_.push([x,villSZ(x)]);runLine(M_,-1,2);}
   runLine(VILL.streets[0],-1,8);runLine(VILL.streets[1],1,8);poles.push(...lines);
   for(const hd of VILL.houses){if(hd.burnt)continue;const [hx,hz]=villW(hd,-hd.W/2+.5,hd.D/2+.14+(hd.clad?.06:0));const yT=FL+.11+12*.215-.25;let best=null,bd=1e9;for(const p of poles){const d=Math.hypot(p[1].x-hx,p[1].z-hz);if(d<bd){bd=d;best=p;}}
     if(!best||bd>60)continue;const tgt=V3(hx,yT,hz);const ig=new T.CylinderGeometry(.03,.04,.1,16);ig.rotateX(Math.PI/2);bk.add(ig,ins,TRS(hx,yT,hz,0,hd.yaw,0));sag(best[0],tgt,.6);}
   const wl=new T.LineSegments(new T.BufferGeometry().setAttribute('position',new T.Float32BufferAttribute(wires,3)),new T.LineBasicMaterial({color:C(0x161614)}));scene.add(wl);}
  /* ===== the village well (kolodets) at the mouth of the lane: a square log frame (srub) dovetailed at the corners over
     the shaft, two posts carrying the windlass drum with its chain and iron crank, a little gable roof over it, a hinged
     plank lid, and the zinc bucket stood on the rim ===== */
  {const wx=VILL.well.x,wz=VILL.well.z,g=new T.Group();g.position.set(wx,H(wx,wz)-.06,wz);g.rotation.y=.35;scene.add(g);const q=rng(4242);
   /* the frame: seven courses, the logs of the two pairs of walls half a log apart in height, each laid in the saddle
      notch of the one below with its round end standing out past the corner; the courses bed into each other along a
      groove, so they touch all the way along */
   const S=1.12,lr=.105,st=.19,n=7,OH=.2,side=[],caps=[];
   for(let k=0;k<n;k++){const yx=.1+k*st,yz=yx+st/2;
     for(const sg of [-1,1]){const a=hqLog(V3(-S/2-OH,yx,sg*S/2),V3(S/2+OH,yx,sg*S/2),lr,q,{seg:.45,bow:.02});side.push(a.side);caps.push(a.cap);
       const b=hqLog(V3(sg*S/2,yz,-S/2-OH),V3(sg*S/2,yz,S/2+OH),lr,q,{seg:.45,bow:.02});side.push(b.side);caps.push(b.cap);}}
   const topY=.1+(n-1)*st+st/2+lr*.85;
   shootables.push(mesh(merge(side),LOGM,0,0,0,g));mesh(merge(caps),WM.end,0,0,0,g);
   /* flat stones set round the foot, the ground trodden and wet there */
   {const sm=rockMat();const sl=[];for(let i=0;i<14;i++){const a=i/14*6.28+q()*.3,d=S/2+.45+q()*.25,x=Math.cos(a)*d,z=Math.sin(a)*d,sc=.16+q()*.12;const rg=rockGeo(70+i%7,{detail:3,flat:.5,col:[.3,.29,.27]}).clone();rg.applyMatrix4(TRS(x,.06-sc*.22,z,(q()-.5)*.1,q()*6,(q()-.5)*.1,sc));sl.push(rg);}
    const rm=mesh(merge(sl),sm,0,0,0,g);rm.receiveShadow=true;}
   /* dark water down the shaft */
   mesh(new T.PlaneGeometry(S-.2,S-.2).rotateX(-Math.PI/2),std({color:C(0x0a0c0c),roughness:.04,metalness:.1,envMapIntensity:1.4}),0,-.9,0,g);
   {const sh=new T.BoxGeometry(S-.2,1.0,S-.2);sh.scale(-1,1,1);sh.translate(0,-.45,0);mesh(sh,std({map:TX.bark,color:C(0x2e2a24),roughness:1,side:T.BackSide}),0,0,0,g);}
   /* the lid: planks on two battens; the back half fixed, the front half on strap hinges, propped open */
   const lw=WM.board,pw=S+.1;const lidHalf=(grp,z0,z1)=>{const nb=6,bw=(z1-z0)/nb;for(let i=0;i<nb;i++)mesh(rbox(pw,.035,bw-.008,.006),lw,0,0,z0+(i+.5)*bw,grp).rotation.z=(q()-.5)*.01;[-.36,.36].forEach(x=>mesh(rbox(.07,.035,z1-z0-.06,.006),lw,x,-.035,(z0+z1)/2,grp));};
   {const fx=new T.Group();fx.position.set(0,topY,0);g.add(fx);lidHalf(fx,-S/2-.05,0);}
   {const lid=new T.Group();lid.position.set(0,topY+.02,0);lid.rotation.x=-1.2;g.add(lid);lidHalf(lid,0,S/2+.05);const iron=memo('wellIron',()=>std({map:PB.rust.a,normalMap:PB.rust.n,color:C(0x6a5a50),roughness:.9,metalness:.6}));[-.36,.36].forEach(x=>mesh(rbox(.04,.006,.22,.002),iron,x,.022,.08,lid));}
   /* posts: squared timbers dug in beside the frame, braced to it, carrying the windlass and the roof */
   const pH=2.15,px=S/2+lr+.075;const iron=std({map:PB.rust.a,normalMap:PB.rust.n,color:C(0x6a6460),roughness:.7,metalness:.6,envMapIntensity:.5});
   [-px,px].forEach(x=>{const pg=rbox(.14,pH+.5,.14,.018);mesh(pg,M.post,x,(pH+.5)/2-.5,0,g);});
   /* the drum: a short log on an iron axle, rope wound on it in tight turns, the free end down to the pail's bail */
   const dY=1.72,dr=.12,dL=2*px-.16;{const a=hqLog(V3(-dL/2,dY,0),V3(dL/2,dY,0),dr,q,{taper:.02,bow:0,seg:.3});mesh(a.side,LOGM,0,0,0,g);mesh(a.cap,WM.end,0,0,0,g);}
   const rope=std({map:TX.cloth,color:C(0x9a8a6a),roughness:1,envMapIntensity:.15});
   {const turns=11,w0=-.32,w1=.3,pts=[];for(let i=0;i<=turns*24;i++){const t=i/(turns*24),a=t*turns*6.28;pts.push(V3(lerp(w0,w1,t),dY+Math.sin(a)*(dr+.012),Math.cos(a)*(dr+.012)));}
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),turns*24,.011,6,false),rope,0,0,0,g);
    const bx=.24,bz=-.2,by=topY+.035+.36;const hang=new T.CatmullRomCurve3([V3(w1,dY,dr+.012),V3(w1-.01,dY-.3,dr+.02),V3(lerp(w1,bx,.6),by+.35,lerp(dr,bz,.5)),V3(bx,by+.05,bz)]);mesh(new T.TubeGeometry(hang,24,.011,6,false),rope,0,0,0,g);
    /* the zinc pail stood on the fixed half of the lid: rolled rim, a bead round its middle, ears and bail */
    const zn=std({map:PB.galv.a,normalMap:PB.galv.n,color:C(0xb4b8b4),roughness:.42,metalness:.85,envMapIntensity:.9,side:T.DoubleSide});
    const pail=lathe([[0,0],[.108,0],[.112,.006],[.118,.06],[.122,.13],[.126,.135],[.128,.142],[.138,.27],[.146,.3],[.15,.305],[.152,.3],[.146,.296],[.136,.27],[.12,.14],[.11,.012],[0,.012]],28);mesh(pail,zn,bx,topY+.035,bz,g);
    [-1,1].forEach(sg=>mesh(rbox(.012,.04,.03,.004),zn,bx+sg*.15,topY+.035+.27,bz,g));const ba=new T.TorusGeometry(.15,.0045,6,24,Math.PI);mesh(ba,iron,bx,topY+.035+.28,bz,g).rotation.y=0;}
   /* the crank: the axle through the post, a forged arm, a turned wooden grip */
   {const ax=new T.CylinderGeometry(.02,.02,.26,10);ax.rotateZ(Math.PI/2);mesh(ax,iron,px+.1,dY,0,g);mesh(rbox(.036,.4,.026,.006),iron,px+.22,dY-.18,0,g);
    const grip=lathe([[0,0],[.022,0],[.026,.03],[.024,.1],[.026,.15],[.02,.17],[0,.17]],12);grip.rotateZ(-Math.PI/2);mesh(grip,M.post,px+.23,dY-.36,0,g);}
   /* the roof: rafters on a ridge beam between the post heads, sawn boards laid down the slopes with the gaps between
      them, barge boards along the gable ends, a capping board along the ridge */
   {const rise=.62,half=.92,rw=S+.95,sl=Math.hypot(half,rise),pa=Math.atan2(rise,half),rb=[];
    /* the truss on each post: a tie beam across the post head under the rafter feet, a king post up to the ridge beam */
    mesh(rbox(2*px+.14,.1,.1,.012),M.post,0,pH+.05,0,g);mesh(rbox(rw-.06,.1,.1,.012),M.post,0,pH+.1+rise-.07,0,g);
    [-px,px].forEach(x=>{mesh(rbox(.09,.1,2*half-.05,.01),M.post,x,pH+.1+.05,0,g);mesh(rbox(.09,rise-.12,.09,.01),M.post,x,pH+.1+(rise-.12)/2+.04,0,g);});
    [-1,1].forEach(sg=>{
      const nb=7,bw=sl/nb;for(let i=0;i<nb;i++){const d0=(i+.5)*bw,b=rbox(rw,.026,bw-.012,.004);b.rotateX(sg*pa);b.translate(0,pH+.15+rise-Math.sin(pa)*d0,sg*Math.cos(pa)*d0);b.rotateZ((q()-.5)*.006);rb.push(b);}
      [-1,1].forEach(ex=>{const bb=rbox(.03,.16,sl+.06,.006);bb.rotateX(sg*pa);bb.translate(ex*(rw/2+.015),pH+.1+rise-Math.sin(pa)*sl/2,sg*Math.cos(pa)*sl/2);rb.push(bb);});
      for(const x of [-px,px]){const r_=rbox(.07,.09,sl-.05,.008);r_.rotateX(sg*pa);r_.translate(x,pH+.1+rise-Math.sin(pa)*sl/2,sg*Math.cos(pa)*sl/2);rb.push(r_);}});
    shootables.push(mesh(merge(rb),WM.board,0,0,0,g));
    [-1,1].forEach(sg=>{const c=rbox(rw+.04,.026,.16,.004);c.rotateX(sg*pa);mesh(c,WM.board,0,pH+.15+rise+.035,sg*.06,g);});}
   g.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;}});
   solids.push({cx:wx,cz:wz,r:1.0});}
  bk.flush(scene,true);ibk.flush(scene,false);
})();
/* at boot, before the vegetation is built: clear the wild growth out of every plot, then plant the yards */
function villageYards(){for(const hd of VILL.houses){const r=hd.prect;const x1=r.x1-1.5,x2=r.x2+1.5,z1=r.z1-1.5,z2=r.z2+1.5;
    for(const t of VEG.types){const P=t.P,M_=t.M,Cc=t.C;const keep=[];for(let i=0;i<P.length/2;i++){const x=P[i*2],z=P[i*2+1];if(!(x>x1&&x<x2&&z>z1&&z<z2))keep.push(i);}if(keep.length===P.length/2)continue;
      const nP=[],nM=[],nC=[];keep.forEach(i=>{nP.push(P[i*2],P[i*2+1]);for(let k=0;k<16;k++)nM.push(M_[i*16+k]);nC.push(Cc[i*3],Cc[i*3+1],Cc[i*3+2]);});t.P.length=0;t.P.push(...nP);t.M.length=0;t.M.push(...nM);t.C.length=0;t.C.push(...nC);}}
  for(const t of VEG.types){const P=t.P;const keep=[];for(let i=0;i<P.length/2;i++){const x=P[i*2],z=P[i*2+1];if(x>0&&x<205&&z>-448&&z<-240&&(villPathD(x,z)<2.2||villStreetD(x,z)<5||Math.hypot(x-VILL.well.x,z-VILL.well.z)<4))continue;keep.push(i);}
    if(keep.length===P.length/2)continue;const nP=[],nM=[],nC=[];keep.forEach(i=>{nP.push(P[i*2],P[i*2+1]);for(let k=0;k<16;k++)nM.push(t.M[i*16+k]);nC.push(t.C[i*3],t.C[i*3+1],t.C[i*3+2]);});t.P.length=0;t.P.push(...nP);t.M.length=0;t.M.push(...nM);t.C.length=0;t.C.push(...nC);}
  YARDS.forEach(f=>f());YARDS.length=0;}

/* the smoke still coming off a fresh hit: a slow grey wisp, only while you are near enough to see it */
/* smoke on the sky: the gutted house still smouldering, and beyond the village to the south and east the columns of
   whatever else is burning - big slow plumes leaning off with the wind, rising until they flatten under the overcast */
const VSMK={cols:[{x:21,y:3.4,z:-351.6,r:.35,big:0,t:0},{x:62.5,y:1.2,z:-352.4,r:.6,big:0,t:0},{x:255,y:0,z:-470,r:3,big:1,t:0},{x:20,y:0,z:-560,r:4,big:1,t:0},{x:-75,y:0,z:-470,r:3.5,big:1,t:0},{x:310,y:0,z:-360,r:4,big:1,t:0}]};
function villTick(dt){if(typeof FX==='undefined'||!FX.smoke)return;const c=camera.position;
  if(S.where==='sector'||S.chapter>=2){if(!VSMK.ps&&typeof PSys!=='undefined'){VSMK.ps=FX.vsmk=thinFog(new PSys(340,PTEX.smoke,false,{order:2}),.3);VSMK.ps.mat.uniforms.uScale.value=FX.smoke.mat.uniforms.uScale.value;}
    for(const s of VSMK.cols){const d=Math.hypot(c.x-s.x,c.z-s.z);if(!s.big&&d>110)continue;if(s.big&&d>900)continue;s.t-=dt;if(s.t>0)continue;
      if(s.big&&VSMK.ps){s.t=.5+Math.random()*.4;const y=(s.y||H(s.x,s.z));VSMK.ps.spawn(V3(s.x+(Math.random()-.5)*s.r,y+2,s.z+(Math.random()-.5)*s.r),V3(1.2+Math.random()*.8,2.6+Math.random()*1.2,.6),40+Math.random()*20,6,48+Math.random()*20,[.13,.12,.11,.55],[.42,.41,.4,0],{drag:.04,up:.02,spin:(Math.random()-.5)*.05,fi:.05});}
      else if(!s.big){s.t=.35+Math.random()*.3;FX.smoke.spawn(V3(s.x+(Math.random()-.5)*s.r,s.y,s.z+(Math.random()-.5)*s.r),V3(.25+Math.random()*.2,.45+Math.random()*.3,.1),7+Math.random()*4,.4,2.4+Math.random()*1.2,[.3,.29,.27,.16],[.47,.46,.44,0],{drag:.15,spin:(Math.random()-.5)*.3});}}
}
  if(!VILL.smoke)return;
  for(const s of VILL.smoke){if(Math.hypot(c.x-s.x,c.z-s.z)>90)continue;s.t-=dt;if(s.t>0)continue;s.t=.3+Math.random()*.35;
    /* (smouldering timber: a thin, pale grey smoke that thins out as it goes - not a black column) */
    FX.smoke.spawn(V3(s.x+(Math.random()-.5)*.8,s.y,s.z+(Math.random()-.5)*.8),V3(.35+Math.random()*.25,.55+Math.random()*.35,.15),6+Math.random()*4,.45,2.4+Math.random()*1.4,[.3,.29,.27,.17],[.48,.47,.45,0],{drag:.15,spin:(Math.random()-.5)*.3});}}
