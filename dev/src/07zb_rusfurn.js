/* ---------- Russian village furniture, all of it modelled piece by piece at the same scale and finish as the rest of the
   interiors (metres, built standing on the floor at y, facing +z unless turned):
   the glazed sideboard (servant) with its dishes and crystal, the iron-bound dowry chest (sunduk), bentwood "Viennese"
   chairs, the round table under its fringed cloth and the silk lampshade (abazhur) over it, the Rubin television on its
   splayed legs, the chest of drawers (komod) with the mirror over it, the Podolsk treadle sewing machine, the pillow stack
   under its lace cover with the lace valance (podzor) on the bed, the icon lamp (lampada) on its chains, the wall rug of
   deer in a forest. Lace and crochet doilies are cut-out textures. ---------- */
const RF=(()=>{
  /* polished veneer: long figured grain, a little darker toward the edges; varnished */
  const grain=(base,dark,seed)=>tex(256,256,(c,w,h)=>{c.fillStyle=base;c.fillRect(0,0,w,h);const q=rng(seed);for(let i=0;i<140;i++){const x=q()*w;c.strokeStyle=`rgba(${dark},${.08+q()*.18})`;c.lineWidth=.5+q()*2;c.beginPath();c.moveTo(x,0);
      for(let y=0;y<=h;y+=16)c.lineTo(x+Math.sin(y*.03+i)*4*q()+Math.sin(y*.11)*1.5,y);c.stroke();}
    for(let i=0;i<6;i++){c.strokeStyle=`rgba(${dark},.18)`;c.lineWidth=1;const cx=q()*w,cy=q()*h;for(let r=4;r<40;r+=4){c.beginPath();c.ellipse(cx,cy,r*.4,r,0,0,7);c.stroke();}}});
  const gt=[grain('#6a3f22','40,20,8',3),grain('#8a5a32','60,32,14',5),grain('#3e2414','20,10,4',7),grain('#7a5634','52,32,16',9)];gt.forEach(t=>{t.wrapS=t.wrapT=T.RepeatWrapping;});
  const W1=std({map:gt[0],roughness:.38,envMapIntensity:.6}),W2=std({map:gt[1],roughness:.42,envMapIntensity:.55}),W3=std({map:gt[2],roughness:.35,envMapIntensity:.6});
  /* the plain painted wood of kitchen tables and chairs: brown paint over the grain, worn a little lighter on the edges */
  const PAINT=std({map:gt[3],color:C(0xc8b8a4),roughness:.6,envMapIntensity:.35});
  /* wood is mapped by the metre, not stretched face by face: the grain keeps one scale on a leg and on a door */
  const WOODS=new Set([W1,W2,W3,PAINT]);
  const fin=g=>{g.traverse(o=>{if(!o.isMesh)return;o.castShadow=true;o.receiveShadow=true;if(WOODS.has(o.material)&&!o.geometry.userData.metric){if(!o.geometry.attributes.normal)o.geometry.computeVertexNormals();worldUV(o.geometry,1.7);o.geometry.userData.metric=1;}});return g;};
  const BR=std({color:C(0xb08a40),metalness:.9,roughness:.32,envMapIntensity:1}),IRON=std({color:C(0x1c1c1c),metalness:.6,roughness:.45}),TIN=std({color:C(0x8a8a84),metalness:.85,roughness:.38});
  const PORC=std({color:C(0xf2efe8),roughness:.18,envMapIntensity:.9}),CRYS=std({color:C(0xd8e4ea),roughness:.03,metalness:.1,transparent:true,opacity:.14,depthWrite:false,envMapIntensity:.7}),MIRR=std({color:C(0xc8ccd0),metalness:1,roughness:.04,envMapIntensity:1.6});
  /* crochet lace: rings of holes, a scalloped edge, cut out */
  const laceT=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#f4f1ea';c.beginPath();for(let i=0;i<=48;i++){const a=i/48*6.28,r=118+Math.sin(a*12)*8;c.lineTo(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r);}c.fill();
    c.globalCompositeOperation='destination-out';for(let ring=1;ring<7;ring++){const n=6*ring+4,r=ring*16;for(let i=0;i<n;i++){const a=i/n*6.28+ring;c.beginPath();c.arc(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r,3.4+ring*.5,0,7);c.fill();}}
    c.globalCompositeOperation='source-over';c.strokeStyle='#f4f1ea';c.lineWidth=2;for(let ring=1;ring<7;ring++){c.beginPath();c.arc(w/2,h/2,ring*16+8,0,7);c.stroke();}},{clamp:true});
  const LACE=std({map:laceT,alphaTest:.5,side:T.DoubleSide,roughness:.9,envMapIntensity:.2});
  const edgeT=tex(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#f2efe6';c.fillRect(0,0,w,h*.45);for(let i=0;i<16;i++){c.beginPath();c.arc(i*16+8,h*.45,8,0,Math.PI);c.fill();}
    c.globalCompositeOperation='destination-out';for(let i=0;i<32;i++){c.beginPath();c.arc(i*8+4,h*.22,2.6,0,7);c.fill();}for(let i=0;i<16;i++){c.beginPath();c.arc(i*16+8,h*.52,3,0,7);c.fill();}});edgeT.wrapS=T.RepeatWrapping;
  const LEDGE=std({map:edgeT,alphaTest:.5,side:T.DoubleSide,roughness:.9,envMapIntensity:.2});
  const doily=(par,x,y,z,r,ry=0)=>{const m=mesh(new T.CircleGeometry(r,32),LACE,x,y,z,par,false);m.rotation.set(-Math.PI/2,0,ry);return m;};
  const G=(par,x,y,z,ry)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry||0;par.add(g);return g;};
  const knob=(g,x,y,z)=>{mesh(new T.CylinderGeometry(.008,.01,.02,10),BR,x,y,z+.01,g).rotation.x=Math.PI/2;mesh(new T.SphereGeometry(.015,10,8),BR,x,y,z+.025,g);};
  const panelDoor=(g,x,y,z,w,h,m)=>{mesh(rbox(w,h,.02,.004),m,x,y,z,g);mesh(rbox(w-.08,h-.08,.012,.004),m,x,y,z+.012,g);mesh(rbox(w-.12,h-.12,.01,.003),m,x,y,z+.02,g);};
  /* a dinner plate standing on edge, a cup on its saucer, a crystal vase */
  /* (a plate is a thin shell: seen from either side, with the cobalt band round its rim that the good service had) */
  const PORC2=std({color:C(0xf2efe8),roughness:.18,envMapIntensity:.8,side:T.DoubleSide}),COB=std({color:C(0x1e3a8a),roughness:.25,envMapIntensity:.6});
  const plate=(g,x,y,z,r,tilt)=>{const p=mesh(lathe([[0,0],[r*.6,0],[r*.65,.008],[r,.016],[r,.019],[r*.6,.006],[0,.004]],32),PORC2,x,y,z,g);const bd=new T.TorusGeometry(r*.88,.0025,4,40);bd.rotateX(Math.PI/2);mesh(bd,COB,0,.017,0,p);p.rotation.set(Math.PI/2-tilt,0,0);
    mesh(new T.TorusGeometry(r*.92,.0025,4,28),std({color:C(0x2a4a8a),roughness:.3}),x,y+Math.cos(tilt)*.012,z+.017,g,false).rotation.x=-tilt;};
  const cup=(g,x,y,z)=>{mesh(lathe([[0,0],[.05,0],[.065,.006],[.07,.01],[0,.008]],18),PORC,x,y,z,g);mesh(lathe([[0,0],[.025,0],[.032,.01],[.04,.06],[.038,.062],[.03,.012],[0,.012]],18),PORC,x,y+.008,z,g);
    mesh(new T.TorusGeometry(.015,.004,6,10,Math.PI*1.3),PORC,x+.042,y+.04,z,g).rotation.z=-1.2;};
  const vase=(g,x,y,z,s=1)=>{const v=mesh(lathe([[0,0],[.05,0],[.055,.02],[.04,.06],[.07,.16],[.075,.2],[.06,.22],[.064,.225],[.055,.22],[0,.03]].map(([a,b])=>[a*s,b*s]),10),CRYS,x,y,z,g);v.renderOrder=3;};
  /* bed linen: white cotton, a fine weave and soft fold shading; the coverlets: a patchwork quilt, a woven wool blanket
     with a border, or the white crocheted bedspread over a pink cover */
  const linT=tex(128,128,(c,w,h)=>{c.fillStyle='#efebe2';c.fillRect(0,0,w,h);const q=rng(17);for(let i=0;i<w;i+=2){c.fillStyle=`rgba(200,192,178,${.12+q()*.1})`;c.fillRect(i,0,1,h);c.fillRect(0,i,w,1);}
    for(let i=0;i<6;i++){const y=q()*h,g=c.createLinearGradient(0,y-10,0,y+10);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(.5,'rgba(120,110,95,.18)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(0,y-10,w,20);}});linT.wrapS=linT.wrapT=T.RepeatWrapping;
  const LINEN=std({map:linT,roughness:.95,envMapIntensity:.2});
  const quilt=k=>{k=k%3;const t=memo('quiltT'+k,()=>tex(256,512,(c,w,h)=>{const q=rng(70+k);
    if(k%3===0){const P=['#8a3a32','#c8a46a','#3a5a7a','#6a7a4a','#b8865a','#5a3a5a','#d8c8a8'];for(let y=0;y<h;y+=32)for(let x=0;x<w;x+=32){c.fillStyle=P[(q()*P.length)|0];c.fillRect(x,y,32,32);c.fillStyle='rgba(255,255,255,.12)';for(let i=0;i<10;i++)c.fillRect(x+q()*28,y+q()*28,3,3);c.strokeStyle='rgba(40,25,15,.45)';c.lineWidth=1.5;c.strokeRect(x+1,y+1,30,30);}}
    else if(k%3===1){c.fillStyle='#7a2a2a';c.fillRect(0,0,w,h);c.fillStyle='#2a2a3a';for(let y=0;y<h;y+=24)c.fillRect(0,y,w,6);for(let x=0;x<w;x+=24)c.fillRect(x,0,6,h);c.strokeStyle='#d8b878';c.lineWidth=10;c.strokeRect(14,14,w-28,h-28);c.fillStyle='rgba(216,184,120,.5)';for(let y=0;y<h;y+=24)for(let x=0;x<w;x+=24)c.fillRect(x+10,y+10,4,4);}
    else{c.fillStyle='#d89a9a';c.fillRect(0,0,w,h);c.fillStyle='#f4f0e6';for(let y=0;y<h;y+=20)for(let x=0;x<w;x+=20){c.beginPath();c.arc(x+10,y+10,8.5,0,7);c.fill();}c.globalCompositeOperation='destination-out';for(let y=0;y<h;y+=20)for(let x=0;x<w;x+=20){c.beginPath();c.arc(x+10,y+10,3,0,7);c.fill();}c.globalCompositeOperation='source-over';}
    const im=c.getImageData(0,0,w,h),d=im.data;for(let i=0;i<d.length;i+=4){const v=.9+Math.random()*.14;d[i]*=v;d[i+1]*=v;d[i+2]*=v;d[i+3]=255;}c.putImageData(im,0,0);}));return memo('quiltM'+k,()=>std({map:t,roughness:.95,envMapIntensity:.15}));};
  return{LINEN,quilt,W1,W2,W3,PAINT,fin,BR,IRON,TIN,PORC,CRYS,MIRR,LACE,LEDGE,doily,G,knob,panelDoor,plate,cup,vase};})();

/* ---- the sideboard (servant): a cupboard of two panelled doors under two drawers, the counter with a doily and the
   crystal; over it, set back, the glazed case on two glass shelves: plates on edge, cups on saucers, the good vase ---- */
function servant(par,x,y,z,ry){const R=RF,g=R.G(par,x,y,z,ry),W=1.36,D=.46,lh=.86,uh=.92;
  [[-W/2+.05,-D/2+.05],[W/2-.05,-D/2+.05],[-W/2+.05,D/2-.05],[W/2-.05,D/2-.05]].forEach(([a,b])=>mesh(lathe([[0,0],[.022,0],[.026,.04],[.02,.08],[0,.08]],10),R.W3,a,0,b,g));
  mesh(rbox(W,lh-.08,D,.006),R.W1,0,.08+(lh-.08)/2,0,g);mesh(rbox(W+.02,.03,D+.02,.006),R.W3,0,.08,0,g);
  [-1,1].forEach(s=>{R.panelDoor(g,s*W/4,.36,D/2,W/2-.04,.5,R.W1);R.knob(g,s*.06,.4,D/2+.02);
    mesh(rbox(W/2-.04,.15,.02,.004),R.W1,s*W/4,.72,D/2,g);R.knob(g,s*W/4,.72,D/2+.01);});
  mesh(rbox(W+.04,.03,D+.04,.006),R.W3,0,lh+.015,0,g);R.doily(g,.25,lh+.031,.06,.17);R.vase(g,.25,lh+.032,.06,1.1);
  /* the glazed case: back, sides, top with its cornice, two sliding glass doors in thin frames */
  const ud=.32,uz=-D/2+ud/2;mesh(rbox(W,uh,.015,.003),R.W1,0,lh+.03+uh/2,-D/2+.008,g);[-1,1].forEach(s=>mesh(rbox(.02,uh,ud,.004),R.W1,s*(W/2-.01),lh+.03+uh/2,uz,g));
  mesh(rbox(W+.02,.03,ud+.02,.005),R.W1,0,lh+.03+uh,uz,g);mesh(rbox(W+.08,.045,ud+.08,.008),R.W3,0,lh+.06+uh,uz,g);mesh(rbox(W+.05,.02,ud+.05,.004),R.W1,0,lh+.035+uh-.02,uz,g);
  [.32,.62].forEach(sy=>{const s=mesh(rbox(W-.04,.008,ud-.03,.002),R.CRYS,0,lh+.03+sy,uz,g);s.renderOrder=3;});
  [-1,1].forEach((s,i)=>{const gd=mesh(new T.PlaneGeometry(W/2,uh-.06),R.CRYS,s*W/4-s*.01*i,lh+.03+uh/2,uz+ud/2-.01-i*.012,g,false);gd.renderOrder=4;
    [[0,uh/2-.03,W/2,.015],[0,-uh/2+.03,W/2,.015]].forEach(([dx,dy,w,hh])=>mesh(rbox(w,hh,.012,.002),R.W3,s*W/4+dx,lh+.03+uh/2+dy,uz+ud/2-.01-i*.012,g));});
  /* the dishes: a row of plates on edge at the back of each shelf, cups on saucers in front, a teapot */
  [[lh+.04],[lh+.03+.33],[lh+.03+.63]].forEach(([sy],k)=>{for(let i=0;i<5;i++)R.plate(g,-.55+i*.12+k*.05,sy+.11,uz-.08,.11,.18);if(k<2)for(let i=0;i<3;i++)R.cup(g,.15+i*.15,sy,uz+.05);});
  mesh(lathe([[0,0],[.06,0],[.08,.04],[.078,.09],[.05,.12],[.02,.125],[.025,.14],[0,.15]],18),R.PORC,.5,lh+.04,uz+.02,g);
  return R.fin(g);}

/* ---- the dowry chest (sunduk): painted planks under tinned iron straps and corner plates, a lock plate with its hasp,
   the lid slightly cambered, on four block feet; a folded blanket and a doily on top ---- */
function sunduk(par,x,y,z,ry,col){const R=RF,g=R.G(par,x,y,z,ry),W=.95,D=.52,H=.44;const paint=std({map:TX.boards,color:C(col||0x5a3828),roughness:.6,envMapIntensity:.3});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>mesh(rbox(.08,.05,.08,.008),R.W3,a*(W/2-.06),.025,b*(D/2-.06),g));
  mesh(rbox(W,H,D,.01),paint,0,.05+H/2,0,g);
  /* the lid, gently cambered: a half round flattened, standing on the lid rim */
  {const lid=new T.CylinderGeometry(D/2+.01,D/2+.01,W+.02,24,1,false,0,Math.PI);lid.rotateZ(Math.PI/2);lid.scale(1,.18,1);mesh(lid,paint,0,.05+H+.006,0,g);}
  mesh(rbox(W+.02,.012,D+.02,.003),R.TIN,0,.05+H,0,g);
  [-.32,0,.32].forEach(sx=>{mesh(rbox(.05,H+.004,D+.012,.003),R.TIN,sx,.05+H/2,0,g);for(let k=0;k<4;k++)[-1,1].forEach(sz=>mesh(new T.SphereGeometry(.007,6,5),R.TIN,sx,.12+k*.1,sz*(D/2+.007),g));});
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>mesh(rbox(.1,.1,.1,.01),R.TIN,a*(W/2-.04),.1,b*(D/2-.04),g).scale.set(1,1,1));
  mesh(rbox(.14,.16,.012,.004),R.TIN,0,.05+H-.12,D/2+.006,g);mesh(rbox(.04,.1,.016,.004),R.TIN,0,.05+H-.04,D/2+.01,g);mesh(new T.TorusGeometry(.018,.004,6,12),R.TIN,0,.05+H-.15,D/2+.016,g);
  [-1,1].forEach(s=>{const h=mesh(new T.TorusGeometry(.04,.007,6,14,Math.PI),R.IRON,s*(W/2+.012),.05+H*.7,0,g);h.rotation.set(0,Math.PI/2,Math.PI);
    [-.04,.04].forEach(dz=>{const st=mesh(new T.CylinderGeometry(.006,.006,.02,6),R.IRON,s*(W/2+.006),.05+H*.7,dz,g);st.rotation.z=Math.PI/2;});mesh(rbox(.006,.03,.11,.002),R.TIN,s*(W/2+.003),.05+H*.7+.005,0,g);});
  R.doily(g,0,.05+H+.03,0,.2);const bl=mesh(rbox(.5,.08,.36,.03),std({map:TX.cloth,color:C(0x6a3a3a),roughness:1}),-.15,.05+H+.07,-.02,g);bl.rotation.y=.12;
  return R.fin(g);}

/* ---- a bentwood ("Viennese") chair: the round seat with its woven cane, four turned legs splayed out with the ring
   stretcher, the back legs bent up into the hoop with the inner loop ---- */
function viennaChair(par,x,y,z,ry,fall){const R=RF,g=R.G(par,x,y,z,ry);if(fall){g.rotation.set(0,ry,Math.PI/2);g.position.y=y+.2;}
  const caneT=memo('cane',()=>tex(64,64,(c,w,h)=>{c.fillStyle='#c8a870';c.fillRect(0,0,w,h);c.strokeStyle='rgba(90,60,30,.6)';for(let i=-64;i<64;i+=6){c.beginPath();c.moveTo(i,0);c.lineTo(i+64,64);c.stroke();c.beginPath();c.moveTo(i+64,0);c.lineTo(i,64);c.stroke();}}));
  mesh(new T.CylinderGeometry(.205,.2,.035,28),R.W3,0,.45,0,g);mesh(new T.CircleGeometry(.17,24),std({map:caneT,roughness:.85}),0,.469,0,g,false).rotation.x=-Math.PI/2;
  /* legs: tops inside the seat rim, feet splayed out; the ring stretcher passes through all four */
  [[-1,1],[1,1],[-1,-1],[1,-1]].forEach(([a,b])=>{const l=mesh(new T.CylinderGeometry(.016,.012,.46,10),R.W3,a*.12,.22,b*.12,g);l.rotation.set(-b*.08,0,a*.08);});
  mesh(new T.TorusGeometry(.124*Math.SQRT2,.008,6,32),R.W3,0,.17,0,g).rotation.x=Math.PI/2;
  /* the back: one steam-bent rod rising from the back of the seat rim, over in a hoop and down again, leaning back a
     little; inside it the closed loop standing on the seat and touching the hoop's crown */
  {const P=[],zb=-.158,xb=.125;for(let i=0;i<=6;i++){const t=i/6;P.push(V3(-xb,.43+t*.27,zb-t*.03));}
   for(let i=1;i<12;i++){const a=Math.PI-i/12*Math.PI;P.push(V3(Math.cos(a)*xb,.7+Math.sin(a)*xb,zb-.03-Math.sin(a)*.01));}
   for(let i=0;i<=6;i++){const t=1-i/6;P.push(V3(xb,.43+t*.27,zb-t*.03));}
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(P),48,.0125,8,false),R.W3,0,0,0,g);
   const L=[];for(let i=0;i<24;i++){const a=i/24*Math.PI*2;L.push(V3(Math.cos(a)*.07,.645+Math.sin(a)*.168,zb-.015-(Math.sin(a)*.5+.5)*.03));}
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(L,true),40,.009,6,true),R.W3,0,0,0,g);}
  return R.fin(g);}

/* ---- the round table under its cloth (hem fringed), a lace doily in the middle with the crystal vase ---- */
function roundTable(par,x,y,z,col){const R=RF,g=R.G(par,x,y,z,0);mesh(new T.CylinderGeometry(.06,.18,.06,16),R.W3,0,.03,0,g);mesh(new T.CylinderGeometry(.04,.05,.68,12),R.W3,0,.38,0,g);
  mesh(new T.CylinderGeometry(.5,.5,.03,40),R.W2,0,.74,0,g);
  const clothT=FAB.tableSkirt(col||'#7a2a26');clothT.repeat.set(4,1);
  const cm=memo('rtSkirtM'+col,()=>std({map:clothT,alphaTest:.5,side:T.DoubleSide,roughness:.95,envMapIntensity:.15}));
  /* the top of the cloth: the same plush, its woven border running round just inside the edge (no fringe up here) */
  const topT=FAB.tableTop(col||'#7a2a26');
  mesh(new T.CircleGeometry(.55,64),memo('rtTopM'+col,()=>std({map:topT,roughness:.92,envMapIntensity:.15})),0,.757,0,g,false).rotation.x=-Math.PI/2;
  const sk=new T.CylinderGeometry(.55,.6,.3,72,6,true);const p=sk.attributes.position;for(let i=0;i<p.count;i++){const a=Math.atan2(p.getZ(i),p.getX(i)),yy=p.getY(i);const k=(.15-yy)/.3;const r=.55+k*.05+Math.sin(a*14)*.012*k;p.setX(i,Math.cos(a)*r);p.setZ(i,Math.sin(a)*r);}sk.computeVertexNormals();
  mesh(sk,cm,0,.755-.15,0,g,false);R.doily(g,0,.762,0,.18);R.vase(g,0,.763,0,1.2);
  return R.fin(g);}
/* ---- the silk lampshade (abazhur) over the table: a cord from the ceiling, the shade ribbed and fringed ---- */
function abazhur(par,x,z,ceilY,col){const g=RF.G(par,x,ceilY,z,0);mesh(new T.CylinderGeometry(.004,.004,.55,5),RF.IRON,0,-.275,0,g);mesh(new T.CylinderGeometry(.04,.03,.04,20),RF.BR,0,-.04,0,g);
  const sh=lathe([[.06,0],[.12,-.03],[.26,-.12],[.33,-.2],[.34,-.24]],24);const m=mesh(sh,std({color:C(col||0xd06a30),roughness:.8,side:T.DoubleSide,emissive:C(0x221005)}),0,-.55,0,g);
  const fr=new T.CylinderGeometry(.34,.345,.09,40,1,true);mesh(fr,RF.LEDGE,0,-.55-.285,0,g,false);return g;}

/* ---- the Rubin television on its splayed legs: walnut cabinet, the bulging grey screen in its bezel, the control
   panel with channel and volume knobs, speaker cloth; a doily on top with a porcelain figure ---- */
function tvRubin(par,x,y,z,ry){const R=RF,g=R.G(par,x,y,z,ry);
  [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const l=mesh(new T.CylinderGeometry(.018,.012,.5,8),R.W3,a*.26,.25,b*.17,g);l.rotation.set(-b*.12,0,a*.12);mesh(new T.SphereGeometry(.014,8,6),R.BR,a*(.26+.25*Math.sin(.12)),.012,b*(.17+.25*Math.sin(.12)),g);});
  mesh(rbox(.6,.02,.38,.004),R.W1,0,.5,0,g);
  mesh(rbox(.62,.5,.44,.02),R.W1,0,.76,0,g);mesh(rbox(.42,.34,.2,.03),std({color:C(0x2a2622),roughness:.7}),0,.74,-.28,g);
  mesh(rbox(.42,.36,.02,.03),std({color:C(0x8a8478),roughness:.4,metalness:.3}),-.08,.77,.22,g);
  {const sc=new T.PlaneGeometry(.34,.28,10,10);const p=sc.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i)/.17,v=p.getY(i)/.14;p.setZ(i,.025*(1-u*u*.8)*(1-v*v*.8));}sc.computeVertexNormals();
   mesh(sc,std({color:C(0x343a38),roughness:.06,metalness:.2,envMapIntensity:1.2}),-.08,.77,.232,g);}
  const grT=memo('tvgrille',()=>tex(64,128,(c,w,h)=>{c.fillStyle='#6a5a44';c.fillRect(0,0,w,h);c.strokeStyle='rgba(40,30,20,.5)';for(let i=0;i<w;i+=3){c.beginPath();c.moveTo(i,0);c.lineTo(i,h);c.stroke();}for(let j=0;j<h;j+=3){c.beginPath();c.moveTo(0,j);c.lineTo(w,j);c.stroke();}}));
  mesh(new T.PlaneGeometry(.1,.2),std({map:grT,roughness:.95}),.225,.82,.222,g,false);
  [.68,.6].forEach((yy,i)=>{mesh(new T.CylinderGeometry(.022,.022,.025,16),R.W3,.225,yy,.235,g).rotation.x=Math.PI/2;mesh(new T.CylinderGeometry(.006,.006,.03,8),R.BR,.225,yy,.25,g).rotation.x=Math.PI/2;});
  R.doily(g,0,1.012,0,.18);mesh(lathe([[0,0],[.03,0],[.03,.01],[.015,.03],[.02,.07],[.012,.1],[.018,.115],[0,.13]],14),R.PORC,.12,1.015,0,g);
  return R.fin(g);}

/* ---- the chest of drawers (komod): three drawers with raised fronts and brass pulls, top with a doily and a small
   mirror on its stand; the oval mirror in its frame on the wall over it ---- */
function komod(par,x,y,z,ry,wallMirror){const R=RF,g=R.G(par,x,y,z,ry),W=.95,D=.46,H=.86;
  mesh(rbox(W,.07,D,.006),R.W3,0,.035,0,g);mesh(rbox(W,H-.07,D-.02,.006),R.W2,0,.07+(H-.07)/2,-.01,g);
  for(let i=0;i<3;i++){const yy=.17+i*.24;R.panelDoor(g,0,yy,D/2-.02,W-.06,.21,R.W2);[-1,1].forEach(s=>{mesh(rbox(.08,.016,.012,.003),R.BR,s*.26,yy,D/2+.009,g);mesh(new T.TorusGeometry(.03,.004,6,12,Math.PI),R.BR,s*.26,yy-.002,D/2+.017,g).rotation.z=Math.PI;});mesh(rbox(.04,.05,.006,.002),R.BR,0,yy+.03,D/2+.01,g);}
  mesh(rbox(W+.04,.03,D+.04,.006),R.W3,0,H+.015,0,g);R.doily(g,0,H+.032,0,.2);
  const ms=R.G(g,-.25,H+.03,-.05,.3);mesh(rbox(.18,.02,.1,.004),R.W3,0,.01,0,ms);[-1,1].forEach(s=>mesh(new T.CylinderGeometry(.006,.006,.2,6),R.W3,s*.09,.11,0,ms));
  const mm=mesh(new T.CircleGeometry(.08,24),R.MIRR,0,.15,.005,ms);mm.scale.set(1,1.3,1);const mf=mesh(new T.TorusGeometry(.08,.008,6,24),R.W3,0,.15,0,ms);mf.scale.set(1,1.3,1);
  if(wallMirror){const wm=R.G(g,0,H+.62,-D/2-.01,0);const m=mesh(new T.CircleGeometry(.24,32),R.MIRR,0,0,.012,wm);m.scale.set(1,1.35,1);const f=mesh(new T.TorusGeometry(.24,.02,8,36),R.W3,0,0,.012,wm);f.scale.set(1,1.35,1);}
  return R.fin(g);}

/* ---- the Podolsk treadle sewing machine: cast-iron side frames, the treadle and its belt wheel, the wooden top with
   the black arm, the hand wheel, the needle bar, gilt scrollwork on the arm ---- */
function sewingMachine(par,x,y,z,ry){const R=RF,g=R.G(par,x,y,z,ry);
  const frame=new T.Shape();frame.moveTo(-.2,0);frame.lineTo(.2,0);frame.lineTo(.14,.12);frame.lineTo(.06,.68);frame.lineTo(-.06,.68);frame.lineTo(-.14,.12);frame.closePath();
  const hole=new T.Path();hole.absellipse(0,.32,.05,.14,0,Math.PI*2);frame.holes.push(hole);const h2=new T.Path();h2.absarc(0,.56,.03,0,Math.PI*2);frame.holes.push(h2);
  [-1,1].forEach(s=>{const f=mesh(new T.ExtrudeGeometry(frame,{depth:.025,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1}),R.IRON,s*.28,0,0,g);f.rotation.y=Math.PI/2;f.position.z=-.012+.0;});
  mesh(rbox(.56,.03,.04,.005),R.IRON,0,.1,0,g);const tr=mesh(rbox(.4,.015,.22,.004),R.IRON,0,.12,.02,g);tr.rotation.x=-.12;
  const wh=mesh(new T.TorusGeometry(.14,.012,6,24),R.IRON,.24,.38,0,g);{const ax=mesh(new T.CylinderGeometry(.012,.012,.07,8),R.IRON,.265,.38,0,g);ax.rotation.z=Math.PI/2;mesh(new T.CylinderGeometry(.025,.025,.03,10),R.IRON,.24,.38,0,g).rotation.z=Math.PI/2;}wh.rotation.y=Math.PI/2;for(let i=0;i<4;i++){const sp=mesh(new T.CylinderGeometry(.006,.006,.26,5),R.IRON,.24,.38,0,g);sp.rotation.x=i*Math.PI/4;}
  mesh(rbox(.72,.035,.42,.008),R.W2,0,.7,0,g);mesh(rbox(.12,.12,.32,.01),R.W2,-.28,.62,0,g);
  /* the machine: bed plate, the curved arm and head, hand wheel, needle bar, spool pin with thread */
  const blk=std({color:C(0x0e0e0e),roughness:.25,metalness:.3,envMapIntensity:1.1});const gilt=memo('gilt',()=>tex(256,64,(c,w,h)=>{c.fillStyle='#0e0e0e';c.fillRect(0,0,w,h);c.strokeStyle='#c8a050';c.lineWidth=2;for(let i=0;i<8;i++){c.beginPath();c.arc(20+i*30,h/2,10,0,5);c.stroke();}c.fillStyle='#c8a050';c.font='bold 16px serif';c.fillText('ПОДОЛЬСК',60,h-6);}));
  mesh(rbox(.36,.03,.17,.008),blk,0,.735,0,g);const arm=new T.Shape();arm.moveTo(-.16,0);arm.lineTo(-.12,0);arm.lineTo(-.12,.18);arm.quadraticCurveTo(-.1,.24,0,.24);arm.lineTo(.14,.24);arm.lineTo(.17,.2);arm.lineTo(.17,.13);arm.lineTo(.13,.13);arm.lineTo(.13,.17);arm.lineTo(-.04,.17);arm.quadraticCurveTo(-.08,.17,-.08,.12);arm.lineTo(-.08,0);arm.closePath();
  const am=mesh(new T.ExtrudeGeometry(arm,{depth:.07,bevelEnabled:true,bevelSize:.012,bevelThickness:.012,bevelSegments:3}),std({map:gilt,color:C(0xffffff),roughness:.25,metalness:.3,envMapIntensity:1.1}),0,.75,-.035,g);
  const hw=mesh(new T.CylinderGeometry(.06,.06,.03,24),R.TIN,-.147,.94,0,g);hw.rotation.z=Math.PI/2;mesh(new T.CylinderGeometry(.008,.008,.12,6),R.TIN,.15,.84,0,g);mesh(new T.CylinderGeometry(.004,.004,.06,5),R.TIN,0,.98,0,g);
  mesh(new T.CylinderGeometry(.012,.012,.03,10),std({color:C(0xd8d0b8),roughness:.8}),.03,1.01,0,g);
  return R.fin(g);}

/* ---- a made bed's finery: three pillows stacked largest to smallest under a lace cover (nakidka), and the lace valance
   (podzor) hanging along the side of the bed ---- */
function pillowStack(par,x,y,z,ry,len){const R=RF,g=R.G(par,x,y,z,ry);const pw=R.LINEN;
  /* the pillow pyramid at the head of the bed, as every house made it up: three feather pillows in white cases, the
     biggest at the bottom, each smaller one laid on the one below, the top one stood up on its edge and dented in the
     middle; a lace cover thrown over the top. Each pillow is a puffed case - full in the middle, pinched thin at the
     seams, the corners pulled out into ears */
  const pil=(w,h,t)=>G('pillow'+w+'_'+h,()=>{const nx=22,ny=16,mk=sg=>{const pg=new T.PlaneGeometry(w,h,nx,ny);if(sg<0)pg.rotateY(Math.PI);const P=pg.attributes.position;
      for(let i=0;i<P.count;i++){const u=P.getX(i)/(w/2),v=P.getY(i)/(h/2);const f=.12+.88*Math.pow(Math.max(0,1-Math.pow(Math.abs(u),2.2)),.38)*Math.pow(Math.max(0,1-Math.pow(Math.abs(v),2.2)),.38);
        const ear=Math.pow(Math.abs(u*v),3)*.06;const dent=.12*Math.exp(-(u*u+v*v)*3)*(sg>0?1:0);P.setXYZ(i,P.getX(i)*(1+ear),P.getY(i)*(1+ear),sg*t/2*(f-dent*f)+(Math.sin(u*5+v*3)*.004)*f);}
      pg.computeVertexNormals();return pg;};
    return merge([mk(1),mk(-1)]);});
  const st=[[.68,.5,.22,0,0],[.56,.42,.19,.17,-.02],[.44,.34,.17,.31,-.03]];
  st.forEach(([w,h,t,yy,zz],i)=>{const p=mesh(pil(w,h,t),pw,0,yy+t*.42,zz,g);p.rotation.x=-Math.PI/2+.05*i;if(i===2){p.rotation.x=-.32;p.position.y=yy+h*.42;p.position.z=zz-.03;}});
  /* the lace cover thrown over the top pillow, falling forward */
  {const lg=new T.PlaneGeometry(.5,.5,12,12);const P=lg.attributes.position;for(let i=0;i<P.count;i++){const yv=P.getY(i),xv=P.getX(i);P.setZ(i,-Math.max(0,-yv)*Math.max(0,-yv)*.9+Math.cos(xv*6)*.008);}lg.computeVertexNormals();
   const nk=mesh(lg,R.LACE,0,.31+.34*.42+.11,-.01,g,false);nk.rotation.x=-.32;}
  if(len){const v=mesh(new T.PlaneGeometry(len,.22),R.LEDGE,0,-.2,.47,g,false);v.material=R.LEDGE;}
  return g;}
/* ---- the icon lamp: a red glass cup in a brass cradle hung on three fine chains under the icon shelf ---- */
function lampada(par,x,y,z){const g=RF.G(par,x,y,z,0);[0,2.1,4.2].forEach(a=>{const c=mesh(new T.CylinderGeometry(.0015,.0015,.22,3),RF.BR,Math.cos(a)*.03,-.11,Math.sin(a)*.03,g);c.rotation.set(Math.sin(a)*.12,0,-Math.cos(a)*.12);});
  mesh(lathe([[0,0],[.035,.005],[.042,.03],[.04,.05],[0,.05]],14),RF.BR,0,-.27,0,g);mesh(lathe([[0,0],[.03,.0],[.038,.045],[.034,.07],[0,.06]],14),std({color:C(0xa01818),roughness:.1,transparent:true,opacity:.75,emissive:C(0x300404)}),0,-.25,0,g);return g;}
/* ---- a woven wall rug (kovyor) of deer at a forest edge, in its fringe ---- */
function deerRug(par,x,y,z,ry,w,h){const t=memo('deer',()=>tex(256,192,(c,W,H)=>{c.fillStyle='#3a4a2a';c.fillRect(0,0,W,H);const g=c.createLinearGradient(0,0,0,H);g.addColorStop(0,'#8aa0a8');g.addColorStop(.55,'#6a7a58');g.addColorStop(1,'#3a4a2a');c.fillStyle=g;c.fillRect(8,8,W-16,H-16);
    c.fillStyle='#24301c';for(let i=0;i<14;i++){const x=10+i*18,h=40+(i*37)%50;c.beginPath();c.moveTo(x,H*.62);c.lineTo(x+9,H*.62-h);c.lineTo(x+18,H*.62);c.fill();}
    const deer=(x,y,s,f)=>{c.save();c.translate(x,y);c.scale(s*f,s);c.fillStyle='#7a4a24';c.beginPath();c.ellipse(0,0,18,8,0,0,7);c.fill();c.fillRect(-14,4,3,18);c.fillRect(-8,4,3,18);c.fillRect(8,4,3,18);c.fillRect(13,4,3,18);
      c.beginPath();c.moveTo(14,-4);c.lineTo(22,-18);c.lineTo(28,-16);c.lineTo(20,-2);c.fill();c.strokeStyle='#5a3418';c.lineWidth=2;c.beginPath();c.moveTo(24,-18);c.lineTo(20,-32);c.moveTo(22,-26);c.lineTo(28,-32);c.moveTo(26,-18);c.lineTo(32,-30);c.stroke();c.restore();};
    deer(W*.38,H*.72,1.1,1);deer(W*.66,H*.76,.9,-1);c.strokeStyle='#c8a860';c.lineWidth=5;c.strokeRect(5,5,W-10,H-10);
    const im=c.getImageData(0,0,W,H),d=im.data;for(let i=0;i<d.length;i+=4){const k=.82+Math.random()*.3;d[i]*=k;d[i+1]*=k;d[i+2]*=k;}c.putImageData(im,0,0);}));
  const m=mesh(new T.PlaneGeometry(w,h),std({map:t,roughness:1,envMapIntensity:.1}),x,y,z,par,false);m.rotation.y=ry;return m;}
/* ---------- the things of a lived-in house and yard, each modelled to scale and standing on what it stands on ---------- */
const LV=(()=>{const R=RF;const m=(k,f)=>memo('lv_'+k,f);
  const ENAM=m('enam',()=>std({color:C(0xe8e6de),roughness:.22,envMapIntensity:.9})),ENB=m('enb',()=>std({color:C(0x2a4a7a),roughness:.25,envMapIntensity:.8})),ENR=m('enr',()=>std({color:C(0x8a2a22),roughness:.25,envMapIntensity:.8}));
  const ZN=m('zinc',()=>std({map:PB.galv.a,normalMap:PB.galv.n,roughnessMap:PB.galv.r,color:C(0xd0d2d0),metalness:.8,roughness:1,envMapIntensity:.85,normalScale:new T.Vector2(.5,.5),side:T.DoubleSide})),CHR=m('chrome',()=>std({color:C(0xd8dad8),metalness:1,roughness:.12,envMapIntensity:1.5}));
  const BREAD=m('bread',()=>std({map:tex(64,64,(c,w,h)=>{c.fillStyle='#8a5428';c.fillRect(0,0,w,h);const q=rng(5);for(let i=0;i<200;i++){c.fillStyle=`rgba(${60+q()*60|0},${30+q()*30|0},10,${q()*.4})`;c.fillRect(q()*w,q()*h,2,2);}}),roughness:.85}));
  const CRUMB=m('crumb',()=>std({color:C(0xd8c49a),roughness:1})),FELT=m('felt',()=>std({map:TX.cloth,color:C(0x5a5650),roughness:1})),RUB=m('rubber',()=>std({color:C(0x1a1a1a),roughness:.6}));
  const WATER=m('water',()=>std({color:C(0x1a2420),roughness:.05,metalness:.1,envMapIntensity:1.2}));
  /* a cup of tea on its saucer, a teaspoon in it */
  const teacup=(g,x,y,z,ry=0)=>{const c=R.G(g,x,y,z,ry);R.cup(c,0,0,0);mesh(new T.CircleGeometry(.034,18),m('tea',()=>std({color:C(0x4a2a10),roughness:.05,envMapIntensity:1.2})),0,.058,0,c,false).rotation.x=-Math.PI/2;
    const sp=mesh(new T.CylinderGeometry(.003,.004,.12,6),R.TIN,.015,.07,.01,c);sp.rotation.z=.45;return c;};
  /* the teapot: Leningrad porcelain in the cobalt net - a squat belly, the spout drawn out of it and turned up, a loop
     handle, a domed lid with its knob and steam hole; gilt lines round the rim and the lid. The net is painted on a
     canvas mapped round the lathe (u round, v up) */
  const NET=m('cobaltNet',()=>{const t=tex(512,256,(c,w,h)=>{c.fillStyle='#f6f3ec';c.fillRect(0,0,w,h);c.strokeStyle='#1f3c8c';c.lineWidth=2.2;c.lineCap='round';
      const n=24;for(let i=-n;i<=2*n;i++){const x0=i*w/n;c.beginPath();c.moveTo(x0,h*.18);c.lineTo(x0+h*.64,h*.82);c.stroke();c.beginPath();c.moveTo(x0,h*.82);c.lineTo(x0+h*.64,h*.18);c.stroke();}
      c.fillStyle='#1f3c8c';for(let i=0;i<n*2;i++)for(let j=0;j<6;j++){const x=(i+.5)*w/(n*2)*1,y=h*.18+(j+.5)*h*.64/6;if((i+j)%2)continue;c.beginPath();c.arc(x,y,1.6,0,7);c.fill();}
      const gold=(y,lw)=>{c.strokeStyle='#c8a040';c.lineWidth=lw;c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();};gold(h*.14,4);gold(h*.86,4);gold(h*.97,6);
      c.clearRect(0,0,w,h*.1);c.fillStyle='#f6f3ec';c.fillRect(0,0,w,h*.1);c.clearRect(0,h*.88,w,h*.08);c.fillStyle='#f6f3ec';c.fillRect(0,h*.88,w,h*.08);gold(h*.97,6);});
    return std({map:t,roughness:.12,envMapIntensity:1});});
  const GILT=m('gilt',()=>std({color:C(0xd0a848),metalness:1,roughness:.25,envMapIntensity:1.2}));
  const teapot=(g,x,y,z,ry=0)=>{const t=R.G(g,x,y,z,ry);
    const body=lathe([[0,0],[.042,0],[.046,.004],[.05,.008],[.066,.022],[.078,.045],[.081,.065],[.077,.085],[.066,.1],[.052,.11],[.047,.113],[.047,.118],[.043,.118],[.041,.112],[0,.112]],40);mesh(body,NET,0,0,0,t);
    const lid=lathe([[0,0],[.044,0],[.045,.004],[.041,.012],[.03,.022],[.016,.028],[.01,.03],[.012,.036],[.014,.044],[.009,.05],[0,.051]],32);mesh(lid,R.PORC,0,.114,0,t);mesh(new T.TorusGeometry(.043,.0018,6,40),GILT,0,.119,0,t).rotation.x=Math.PI/2;
    /* spout: a tapered tube out of the belly, turning up, its lip cut */
    {const pts=[V3(.06,.03,0),V3(.09,.045,0),V3(.112,.07,0),V3(.126,.1,0),V3(.132,.118,0)];const cv=new T.CatmullRomCurve3(pts);const sp=new T.TubeGeometry(cv,24,1,14,false);const P=sp.attributes.position;
      for(let i=0;i<P.count;i++){const k=Math.floor(i/15)/24,c=cv.getPoint(k),r=lerp(.017,.0075,k);const d=V3(P.getX(i),P.getY(i),P.getZ(i));const tg=cv.getTangent(k);const off=d.sub(c);off.sub(tg.multiplyScalar(off.dot(tg))).normalize();P.setXYZ(i,c.x+off.x*r,c.y+off.y*r,c.z+off.z*r);}
      sp.computeVertexNormals();mesh(sp,R.PORC,0,0,0,t);}
    {const hc=new T.CatmullRomCurve3([V3(-.07,.095,0),V3(-.1,.1,0),V3(-.118,.075,0),V3(-.108,.04,0),V3(-.076,.028,0)]);mesh(new T.TubeGeometry(hc,24,.0065,10,false),R.PORC,0,0,0,t);}
    return t;};
  /* a brick of black rye bread (baked in a tin: straight sides, the top domed and split along the edges, the crust
     dark and floury) on a breadboard with its handle, the end cut off and two slices lying by it, crumbs, the knife */
  const CRUST=m('crust',()=>{const t=tex(256,256,(c,w,h)=>{c.fillStyle='#4e301c';c.fillRect(0,0,w,h);const q=rng(51);
      for(let i=0;i<70;i++){const x=q()*w,y=q()*h,r=8+q()*26,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,q()<.5?'rgba(92,58,32,.5)':'rgba(20,12,8,.45)');g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
      for(let i=0;i<900;i++){c.fillStyle=`rgba(${190+q()*40|0},${170+q()*30|0},${140+q()*30|0},${q()*.22})`;c.beginPath();c.arc(q()*w,q()*h,.5+q()*1.4,0,7);c.fill();}
      c.strokeStyle='rgba(16,10,6,.55)';c.lineWidth=1;for(let i=0;i<40;i++){let x=q()*w,y=q()*h;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(q()-.5)*14;y+=(q()-.5)*14;c.lineTo(x,y);}c.stroke();}});t.wrapS=t.wrapT=T.RepeatWrapping;
    return std({map:t,bumpMap:t,bumpScale:.004,roughness:.58,envMapIntensity:.45});});
  const CRUMBT=m('crumbT',()=>{const t=tex(256,256,(c,w,h)=>{c.fillStyle='#5a4030';c.fillRect(0,0,w,h);const q=rng(61);
      for(let i=0;i<1600;i++){const x=q()*w,y=q()*h,r=.6+Math.pow(q(),3)*4.5;c.fillStyle=`rgba(${28+q()*20|0},${18+q()*12|0},${10+q()*8|0},.75)`;c.beginPath();c.ellipse(x,y,r,r*(.6+q()*.5),q()*3,0,7);c.fill();
        c.fillStyle='rgba(140,108,80,.35)';c.beginPath();c.ellipse(x-r*.3,y-r*.4,r*.5,r*.3,0,0,7);c.fill();}
      for(let i=0;i<30;i++){c.fillStyle='rgba(120,90,60,.5)';c.beginPath();c.arc(q()*w,q()*h,1+q()*1.5,0,7);c.fill();}});t.wrapS=t.wrapT=T.RepeatWrapping;
    return std({map:t,bumpMap:t,bumpScale:.002,roughness:.95,envMapIntensity:.1});});
  /* the loaf: a box grid pushed out to a rounded brick, the top swelling over the tin's edge */
  const loafGeo=(L,W_,H_)=>G('loaf'+L,()=>{const g=weldGeo(new T.BoxGeometry(L,H_,W_,18,8,10).toNonIndexed());const P=g.attributes.position,q=rng(8);
    for(let i=0;i<P.count;i++){let x=P.getX(i)/(L/2),y=P.getY(i)/(H_/2),z=P.getZ(i)/(W_/2);
      /* rounded edges (a superellipse section), the crown domed and overhanging a little, the base flat */
      const top=y>0?y:0;const sx=Math.sign(x)*Math.pow(Math.abs(x),1.0),sz=Math.sign(z)*Math.pow(Math.abs(z),1.0);
      const rr=1-.18*Math.pow(Math.max(Math.abs(x),Math.abs(z)),8)*top;let X=sx*rr,Z=sz*rr*(1+.06*top),Y=y;
      const cr=Math.max(0,1-Math.pow(Math.abs(z),2.2))*Math.max(0,1-Math.pow(Math.abs(x),6));if(y>0)Y=y*(.86+.28*cr);
      if(y>.6&&Math.abs(z)>.7&&Math.abs(z)<.9)Y-=.1*y*Math.max(0,1-Math.pow(Math.abs(x),6));
      Y+=(vnoise(x*4+3,z*4)-.5)*.06*top;P.setXYZ(i,X*L/2,Y*H_/2+H_/2,Z*W_/2);}
    g.computeVertexNormals();worldUV(g,6);return g;});
  const loaf=(g,x,y,z,ry=0)=>{const b=R.G(g,x,y,z,ry);
    const board=new T.Shape();board.moveTo(-.18,-.12);board.lineTo(.14,-.12);board.quadraticCurveTo(.18,-.12,.18,-.08);board.lineTo(.18,-.035);board.lineTo(.26,-.03);board.quadraticCurveTo(.29,0,.26,.03);board.lineTo(.18,.035);board.lineTo(.18,.08);board.quadraticCurveTo(.18,.12,.14,.12);board.lineTo(-.14,.12);board.quadraticCurveTo(-.18,.12,-.18,.08);board.closePath();
    const hole=new T.Path();hole.absarc(.24,0,.012,0,Math.PI*2,true);board.holes.push(hole);
    const bg=new T.ExtrudeGeometry(board,{depth:.018,bevelEnabled:true,bevelThickness:.003,bevelSize:.003,bevelSegments:2,curveSegments:12});bg.rotateX(-Math.PI/2);worldUV(bg,1.7);mesh(bg,R.W2,0,.003,0,b);
    const L=.22,W_=.11,H_=.1;const lf=mesh(loafGeo(L,W_,H_),CRUST,-.03,.024,0,b);
    /* the cut face, and the slices off it */
    const face=mesh(new T.PlaneGeometry(W_*.96,H_*.95),CRUMBT,-.03+L/2+.0005,.024+H_*.49,0,b);face.rotation.y=Math.PI/2;
    [[.1,.035,.2],[.13,.03,-.15]].forEach(([sx,sz,a],k)=>{const sl=R.G(b,sx,.024+.006+k*.008,sz,a);mesh(rbox(W_*.95,.011,H_*.92,.004),CRUMBT,0,0,0,sl).rotation.x=0;const cr=rbox(W_*.97,.0115,.006,.002);mesh(cr,CRUST,0,0,H_*.46,sl);});
    for(let i=0;i<10;i++){const c=mesh(new T.IcosahedronGeometry(.0035+Math.random()*.003,0),CRUMBT,(Math.random()-.4)*.25,.024,(Math.random()-.5)*.2,b);c.rotation.set(Math.random()*3,Math.random()*3,0);}
    /* the knife: a worn carbon-steel blade, the wooden handle riveted */
    {const kn=R.G(b,.02,.03,.085,.18);const bl=new T.Shape();bl.moveTo(0,0);bl.lineTo(.17,0);bl.quadraticCurveTo(.2,.003,.205,.012);bl.lineTo(0,.024);bl.closePath();const bgm=new T.ExtrudeGeometry(bl,{depth:.0015,bevelEnabled:false});bgm.rotateX(-Math.PI/2);
      mesh(bgm,m('blade',()=>std({color:C(0x8a8c8a),metalness:.9,roughness:.35,envMapIntensity:1})),0,0,0,kn);const hd=rbox(.1,.016,.022,.006);hd.translate(-.05,.002,-.011);mesh(hd,R.W3,0,0,0,kn);
      [-.025,-.07].forEach(xx=>mesh(new T.CylinderGeometry(.0028,.0028,.018,8),R.BR,xx,.003,-.011,kn));}
    return b;};
  /* the three-litre jar of pickled cucumbers under its tin lid */
  const pickles=(g,x,y,z)=>{const j=R.G(g,x,y,z,0);const v=mesh(lathe([[0,0],[.075,0],[.08,.02],[.08,.2],[.06,.24],[.045,.25],[.045,.265],[0,.265]],24),R.CRYS,0,0,0,j);v.renderOrder=3;
    for(let i=0;i<6;i++){const c=mesh(new T.CylinderGeometry(.018,.018,.16,10),m('cuc',()=>std({color:C(0x3a5a22),roughness:.5})),Math.cos(i)*.04,.1,Math.sin(i)*.04,j);c.rotation.z=(i%2?.15:-.12);}
    mesh(new T.CylinderGeometry(.05,.05,.015,20),R.TIN,0,.27,0,j);return j;};
  /* the samovar on its tray, Tula style: a vase-shaped urn of brass (or nickel-plated) on a square foot with ball feet,
     a raised band and stamped medals round the shoulder, the lid with its two black knobs, the crown (konforka) that the
     teapot sits on, two side handles - brass brackets, black turned grips - and the tap low on the front with its
     filigree key over the slop bowl. Everything turned or tubed, round to the eye at table distance */
  const BRASS=m('brass',()=>std({color:C(0xd2a95a),metalness:1,roughness:.2,normalMap:PB.metal.n,normalScale:new T.Vector2(.08,.08),envMapIntensity:1.35}));
  const NICK=m('nickel',()=>std({color:C(0xd6d6d0),metalness:1,roughness:.16,normalMap:PB.metal.n,normalScale:new T.Vector2(.06,.06),envMapIntensity:1.45}));
  const EBON=m('ebon',()=>std({color:C(0x16110e),roughness:.32,envMapIntensity:.8}));
  const samovar=(g,x,y,z,seed=0,ry=0)=>{const s=R.G(g,x,y,z,ry);const MT=seed%2?NICK:BRASS;
    /* the tray */const tr=new T.Shape();const tw=.2,td=.16,tc=.04;tr.moveTo(-tw+tc,-td);tr.lineTo(tw-tc,-td);tr.quadraticCurveTo(tw,-td,tw,-td+tc);tr.lineTo(tw,td-tc);tr.quadraticCurveTo(tw,td,tw-tc,td);tr.lineTo(-tw+tc,td);tr.quadraticCurveTo(-tw,td,-tw,td-tc);tr.lineTo(-tw,-td+tc);tr.quadraticCurveTo(-tw,-td,-tw+tc,-td);
    const tg=new T.ExtrudeGeometry(tr,{depth:.006,bevelEnabled:true,bevelThickness:.004,bevelSize:.006,bevelSegments:3,curveSegments:10});tg.rotateX(-Math.PI/2);mesh(tg,MT,0,.002,.03,s);
    /* the foot: a square plinth on four ball feet, necking in to the stem */
    const F=.012;[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>mesh(new T.SphereGeometry(.014,14,10),MT,a*.062,F+.004,b*.062,s));
    mesh(rbox(.15,.016,.15,.006),MT,0,F+.024,0,s);
    const prof=[[0,F+.03],[.07,F+.03],[.072,F+.036],[.06,F+.044],[.044,F+.055],[.036,F+.07],[.036,F+.08],[.05,F+.084],[.048,F+.09],
      [.07,F+.1],[.1,F+.115],[.125,F+.14],[.14,F+.17],[.147,F+.2],[.15,F+.235],[.149,F+.265],[.143,F+.295],[.133,F+.318],[.118,F+.337],[.1,F+.35],[.084,F+.357],[.074,F+.36],[0,F+.36]];
    mesh(lathe(prof,56),MT,0,0,0,s);
    /* raised bands, and the medals stamped round the shoulder */
    [[.1465,F+.2],[.143,F+.295],[.105,F+.117]].forEach(([r,yy])=>mesh(new T.TorusGeometry(r+.002,.0032,8,64),MT,0,yy,0,s).rotation.x=Math.PI/2);
    for(let i=0;i<5;i++){const a=(i-2)*.32,r=.139;const md=mesh(new T.CylinderGeometry(.011,.011,.003,20),MT,Math.sin(a)*r,F+.31,Math.cos(a)*r,s);md.rotation.x=Math.PI/2-.55;md.rotation.order='YXZ';md.rotation.y=a;}
    /* the lid, its knobs, the crown with its vents */
    mesh(lathe([[0,0],[.082,0],[.084,.004],[.075,.012],[.058,.018],[.05,.02],[0,.02]],48),MT,0,F+.36,0,s);
    [-1,1].forEach(k=>{mesh(lathe([[0,0],[.009,0],[.011,.006],[.008,.012],[.01,.016],[0,.02]],14),EBON,k*.062,F+.368,0,s);});
    const crown=lathe([[.03,0],[.034,0],[.034,.006],[.03,.01],[.03,.036],[.04,.044],[.046,.05],[.044,.052],[.03,.046],[.026,.04],[.026,.004],[.03,0]],40);mesh(crown,MT,0,F+.378,0,s);
    for(let i=0;i<8;i++){const a=i/8*6.28;const v=mesh(rbox(.008,.014,.004,.002),EBON,Math.sin(a)*.0305,F+.4,Math.cos(a)*.0305,s);v.rotation.y=a;}
    /* the handles: a brass bracket out of the body at the shoulder, a black grip on a loop, brass ferrules */
    [-1,1].forEach(k=>{const hc=new T.CatmullRomCurve3([V3(k*.142,F+.31,0),V3(k*.178,F+.318,0),V3(k*.198,F+.3,0),V3(k*.2,F+.26,0),V3(k*.186,F+.235,0),V3(k*.146,F+.228,0)]);
      mesh(new T.TubeGeometry(hc,32,.0055,10,false),MT,0,0,0,s);const grip=new T.CylinderGeometry(.011,.011,.055,16);mesh(grip,EBON,k*.2,F+.27,0,s);
      [F+.2425,F+.2975].forEach(yy=>mesh(new T.CylinderGeometry(.0125,.0125,.006,16),MT,k*.2,yy,0,s));});
    /* the tap: a tapering pipe out of the lower body, the valve on the bend, its pierced key, the spout over the bowl */
    {const cv=new T.CatmullRomCurve3([V3(0,F+.15,.12),V3(0,F+.155,.165),V3(0,F+.15,.2),V3(0,F+.128,.218),V3(0,F+.108,.222)]);const tb=new T.TubeGeometry(cv,24,1,12,false);const P=tb.attributes.position;
      for(let i=0;i<P.count;i++){const kk=Math.floor(i/13)/24,c=cv.getPoint(kk),r=lerp(.014,.0075,kk);const d=V3(P.getX(i),P.getY(i),P.getZ(i));const tgn=cv.getTangent(kk);const off=d.sub(c);off.sub(tgn.multiplyScalar(off.dot(tgn))).normalize();P.setXYZ(i,c.x+off.x*r,c.y+off.y*r,c.z+off.z*r);}
      tb.computeVertexNormals();mesh(tb,MT,0,0,0,s);mesh(new T.SphereGeometry(.016,18,12),MT,0,F+.156,.185,s);mesh(new T.CylinderGeometry(.006,.008,.012,12),MT,0,F+.172,.185,s);
      const key=new T.Shape();key.moveTo(0,0);key.bezierCurveTo(.012,.004,.024,.018,.016,.03);key.bezierCurveTo(.01,.038,0,.03,0,.03);key.bezierCurveTo(0,.03,-.01,.038,-.016,.03);key.bezierCurveTo(-.024,.018,-.012,.004,0,0);
      const kh=new T.Path();kh.absarc(0,.019,.0055,0,Math.PI*2,true);key.holes.push(kh);const kg=new T.ExtrudeGeometry(key,{depth:.003,bevelEnabled:true,bevelThickness:.0008,bevelSize:.0008,bevelSegments:1,curveSegments:10});kg.translate(0,0,-.0015);
      mesh(kg,MT,0,F+.177,.185,s);}
    /* the slop bowl under the tap */mesh(lathe([[0,0],[.022,0],[.024,.004],[.034,.022],[.036,.03],[.033,.03],[.031,.024],[0,.006]],28),MT,0,.009,.215,s);
    teapot(s,0,F+.43,0,1.2+seed);return s;};
  /* a zinc bucket, water in it or not, its bail */
  const bucket=(g,x,y,z,water,ry=0)=>{const b=R.G(g,x,y,z,ry);mesh(new T.CylinderGeometry(.15,.11,.28,28,1,true),ZN,0,.14,0,b);mesh(new T.CircleGeometry(.11,24),ZN,0,.003,0,b).rotation.x=-Math.PI/2;
    mesh(new T.TorusGeometry(.15,.006,6,32),ZN,0,.28,0,b).rotation.x=Math.PI/2;const ba=mesh(new T.TorusGeometry(.15,.004,6,24,Math.PI),R.IRON,0,.28,0,b);ba.rotation.y=Math.PI/2;ba.rotation.x=-.5;
    if(water){mesh(new T.CircleGeometry(.14,28),WATER,0,.23,0,b,false).rotation.x=-Math.PI/2;}return b;};
  /* felt boots (valenki), standing as they were stepped out of */
  const valenki=(g,x,y,z,ry=0)=>{const v=R.G(g,x,y,z,ry);[-.07,.07].forEach((dx,i)=>{const b=R.G(v,dx,0,i*.03,i?.12:-.05);mesh(lathe([[0,0],[.05,0],[.055,.05],[.05,.3],[.056,.42],[0,.42]],20),FELT,0,0,-.04,b);
      const f=mesh(new T.SphereGeometry(.5,18,12),FELT,0,.045,.04,b);f.scale.set(.1,.09,.24);mesh(rbox(.1,.015,.25,.006),RUB,0,.006,.03,b);});return v;};
  /* the red propane bottle by the house wall, its valve and cap guard, the stencil */
  const gasBottle=(g,x,y,z,ry=0)=>{const b=R.G(g,x,y,z,ry);const red=m('gasred',()=>std({map:tex(128,64,(c,w,h)=>{c.fillStyle='#a8221a';c.fillRect(0,0,w,h);c.fillStyle='#e8e0d0';c.font='bold 15px sans-serif';c.fillText('ПРОПАН',20,38);const q=rng(4);for(let i=0;i<60;i++){c.fillStyle=`rgba(90,50,30,${q()*.5})`;c.fillRect(q()*w,q()*h,3+q()*6,2);}}),roughness:.5,metalness:.2}));
    mesh(new T.CylinderGeometry(.15,.15,.7,32),red,0,.43,0,b);mesh(new T.SphereGeometry(.15,32,12,0,Math.PI*2,0,Math.PI/2),red,0,.78,0,b);mesh(new T.CylinderGeometry(.14,.14,.08,32,1,true),red,0,.04,0,b);
    mesh(new T.CylinderGeometry(.03,.035,.06,12),R.BR,0,.95,0,b);mesh(new T.TorusGeometry(.07,.01,8,24),red,0,1.0,0,b).rotation.x=Math.PI/2;[0,2.1,4.2].forEach(a=>mesh(new T.CylinderGeometry(.008,.008,.1,6),red,Math.cos(a)*.07,.95,Math.sin(a)*.07,b));return b;};
  /* a washing line between two T-posts, the washing pegged on it moving a little */
  const laundry=(g,A,B,seed)=>{const q=rng(seed),post=(p)=>{mesh(new T.CylinderGeometry(.04,.05,2.2,12),R.W3,p.x,p.y+.85,p.z,g);mesh(rbox(.5,.05,.05,.01),R.W3,p.x,p.y+1.92,p.z,g);};post(A);post(B);
    const a=V3(A.x,A.y+1.9,A.z),b=V3(B.x,B.y+1.9,B.z),L=a.distanceTo(b);const ln=[];for(let i=0;i<=16;i++){const t=i/16;ln.push(a.clone().lerp(b,t).add(V3(0,-.25*4*t*(1-t),0)));}
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ln),32,.003,4),R.IRON,0,0,0,g);
    const cols=[0xe8e4d8,0x7a8aa8,0xa84a3a,0xd8d0b0,0x5a7a5a,0xe0d8e8];const dir=V3().subVectors(b,a).normalize(),ry=Math.atan2(dir.x,dir.z)+Math.PI/2;
    for(let t=.12;t<.9;t+=.12+q()*.08){const p=a.clone().lerp(b,t).add(V3(0,-.25*4*t*(1-t),0)),w=.3+q()*.4,hh=.35+q()*.4;const cg=new T.PlaneGeometry(w,hh,4,4);const P=cg.attributes.position;for(let i=0;i<P.count;i++)P.setZ(i,Math.sin(P.getX(i)*9+t*20)*.015+(P.getY(i)<0?(-P.getY(i))*.08:0));cg.computeVertexNormals();
      const cm=m('cloth'+(cols.length*t|0)%cols.length,()=>std({map:TX.cloth,color:C(cols[(cols.length*t|0)%cols.length]),roughness:1,side:T.DoubleSide}));const cl=mesh(cg,cm,p.x,p.y-hh/2,p.z,g);cl.rotation.y=ry;
      [-1,1].forEach(k=>{const pg=mesh(rbox(.012,.06,.012,.003),R.W2,p.x+Math.cos(ry)*k*w*.42,p.y-.01,p.z-Math.sin(ry)*k*w*.42,g);});}};
  /* the chopping block with the axe left in it, chips round it */
  const chopBlock=(g,x,y,z,ry=0)=>{const b=R.G(g,x,y,z,ry);mesh(new T.CylinderGeometry(.24,.27,.5,28),m('stump',()=>std({map:TX.bark,color:C(0x7a6650),roughness:1})),0,.25,0,b);mesh(new T.CircleGeometry(.235,28),m('endg',()=>std({color:C(0xb89a72),roughness:1})),0,.502,0,b).rotation.x=-Math.PI/2;
    const ax=R.G(b,.04,.5,0,.4);ax.rotation.z=.75;mesh(new T.CylinderGeometry(.016,.02,.62,10),R.W2,0,.31,0,ax);const head=mesh(rbox(.03,.09,.17,.006),R.IRON,0,.02,.05,ax);head.rotation.x=.1;
    for(let i=0;i<14;i++){const c=mesh(rbox(.05+Math.random()*.06,.012,.02+Math.random()*.03,.003),m('chip',()=>std({color:C(0xc8aa80),roughness:1})),(Math.random()-.5)*1.2,.006,(Math.random()-.5)*1.2,b);c.rotation.y=Math.random()*3;}return b;};
  /* a galvanised watering can and a milk churn */
  const wateringCan=(g,x,y,z,ry=0)=>{const w=R.G(g,x,y,z,ry);mesh(new T.CylinderGeometry(.11,.12,.26,24),ZN,0,.13,0,w);const sp=new T.TubeGeometry(new T.CatmullRomCurve3([V3(.1,.05,0),V3(.22,.16,0),V3(.32,.27,0)]),12,.014,8);mesh(sp,ZN,0,0,0,w);
    mesh(new T.CylinderGeometry(.035,.02,.04,14),ZN,.33,.28,0,w).rotation.z=-.9;const hd=new T.TubeGeometry(new T.CatmullRomCurve3([V3(-.09,.24,0),V3(-.02,.34,0),V3(.06,.25,0)]),12,.008,6);mesh(hd,ZN,0,0,0,w);return w;};
  /* the 40-litre aluminium milk churn (bidon): rolled foot ring and two stiffening ribs round the body, the shoulder and
     the neck; the lid pressed in on its rubber seal and held by the hinged lever clamp; the two handles of bent rod on
     the shoulder. Dull, oxidised aluminium, dented where it has been dropped, grimy round the foot. */
  const ALU=m('aluPB',()=>pbr(256,(u,v)=>{const n=N2(u,v,6,4),f=N2(u*.2,v*8,10,2),bl=sstep(.58,.72,N2(u+.4,v,5,4)),dirt=sstep(.25,0,v)*.7+sstep(.68,.8,N2(u,v+.3,7,3))*.3;
      let k=150+(n-.5)*30+(f-.5)*18;let c=[k,k*1.01,k*.99];c=mixc(c,[118,116,108],bl*.5);c=mixc(c,[70,62,50],dirt);const sc=Math.abs(Math.sin(u*90+N2(u,v,30,2)*8))>.995?1:0;c=mixc(c,[200,200,198],sc*.6);
      return[c[0],c[1],c[2],.5+n*.3+sc*.2,.55+n*.2+dirt*.3];},{bump:2}));
  const ALUM=m('aluM',()=>std({map:ALU.a,normalMap:ALU.n,roughnessMap:ALU.r,roughness:1,metalness:.75,envMapIntensity:.7,side:T.DoubleSide}));
  const milkCan=(g,x,y,z)=>{const c=R.G(g,x,y,z,0);const q=rng(Math.round(x*97+z*31));
    const body=lathe([[0,.004],[.148,.004],[.158,.012],[.16,.03],[.152,.04],[.152,.15],[.158,.158],[.158,.17],[.152,.178],[.152,.33],[.158,.338],[.158,.35],[.152,.358],[.152,.42],[.13,.47],[.1,.505],[.085,.53],[.082,.58],[.09,.59],[.09,.6],[.08,.6]],40);
    {const P=body.attributes.position;const dents=[0,1,2].map(()=>[q()*6.28,.06+q()*.35,.03+q()*.04,.008+q()*.01]);for(let i=0;i<P.count;i++){const px=P.getX(i),pz=P.getZ(i),py=P.getY(i),a=Math.atan2(pz,px),r=Math.hypot(px,pz);let d=0;
      for(const [da,dy,dr,dd] of dents){const e=Math.hypot((((a-da+9.42)%6.283)-3.14)*r,py-dy);d+=dd*Math.exp(-e*e/(dr*dr));}if(r>.01){const k=(r-d)/r;P.setX(i,px*k);P.setZ(i,pz*k);}}body.computeVertexNormals();}
    mesh(body,ALUM,0,0,0,c);
    /* the lid: a domed cap over the neck with its rim, a rubber seal showing black under it */
    mesh(lathe([[0,.648],[.04,.646],[.08,.635],[.098,.618],[.1,.6],[.094,.596]],32),ALUM,0,0,0,c);mesh(new T.TorusGeometry(.092,.005,6,32),m('rubber',()=>std({color:C(0x161616),roughness:.85})),0,.598,0,c).rotation.x=Math.PI/2;
    /* the lever clamp: a hinge block on the neck, the bail over the lid, the lever folded down */
    const st=m('alClamp',()=>std({color:C(0x8a8c88),metalness:.8,roughness:.45}));mesh(rbox(.03,.05,.03,.005),st,.095,.575,0,c);const bail=new T.TorusGeometry(.1,.006,6,24,Math.PI);bail.rotateY(Math.PI/2);mesh(bail,st,0,.6,0,c).rotation.x=0;
    mesh(rbox(.018,.012,.12,.004),st,.11,.62,0,c).rotation.z=-.5;
    /* the handles: rod bent into a stirrup, riveted to the shoulder */
    [-1,1].forEach(k=>{const hc=new T.TubeGeometry(new T.CatmullRomCurve3([V3(k*.135,.43,-.045),V3(k*.17,.45,-.04),V3(k*.18,.48,0),V3(k*.17,.45,.04),V3(k*.135,.43,.045)]),16,.0065,8);mesh(hc,st,0,0,0,c);
      [-.045,.045].forEach(zz=>mesh(new T.CylinderGeometry(.009,.009,.012,10),st,k*.137,.432,zz,c).rotation.z=Math.PI/2);});
    return c;};
  /* the dog's kennel: boards, a pitched roof, the round door, chain and bowl (the dog has gone) */
  const kennel=(g,x,y,z,ry=0,hy)=>{const k=R.G(g,x,y,z,ry);const bw=m('kennel',()=>std({map:M.boards.map,color:C(0x8a7458),roughness:1}));
    const sh=new T.Shape();sh.moveTo(-.4,0);sh.lineTo(.4,0);sh.lineTo(.4,.55);sh.lineTo(0,.8);sh.lineTo(-.4,.55);sh.closePath();const hole=new T.Path();hole.absarc(0,.25,.17,0,Math.PI,false);hole.lineTo(-.17,.05);hole.lineTo(.17,.05);sh.holes.push(hole);
    const fr=new T.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:false});worldUV(fr,2);mesh(fr,bw,0,0,.45,k);const bk=new T.Shape();bk.moveTo(-.4,0);bk.lineTo(.4,0);bk.lineTo(.4,.55);bk.lineTo(0,.8);bk.lineTo(-.4,.55);bk.closePath();const bg=new T.ExtrudeGeometry(bk,{depth:.03,bevelEnabled:false});worldUV(bg,2);mesh(bg,bw,0,0,-.48,k);
    [-1,1].forEach(s=>{mesh(rbox(.03,.55,.95,.005),bw,s*.385,.275,0,k);const r=mesh(rbox(.5,.025,1.05,.005),m('kroof',()=>std({map:TX.slate||M.slate.map,color:C(0x8a8a84),roughness:.9})),s*.21,.68,0,k);r.rotation.z=-s*Math.atan2(.25,.4);});
    mesh(rbox(.8,.03,.95,.005),bw,0,.015,0,k);const ch=[];for(let i=0;i<14;i++){const t=i/13;ch.push(V3(lerp(.3,1.4,t),.06+.25*Math.sin(t*Math.PI)*.2,lerp(.42,.8,t)));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(ch),40,.006,4),R.IRON,0,0,0,k);
    mesh(lathe([[0,0],[.08,0],[.1,.04],[.09,.05],[0,.02]],20),ZN,1.0,0,1.0,k);return k;};
  /* a "Ural" roadster bicycle leaning on a fence: frame tubes, mudguards, the wheels spoked, saddle, bars */
  const bicycle=(g,x,y,z,ry=0)=>{const b=R.G(g,x,y,z,ry);b.rotation.z=.14;const fr=m('bike',()=>std({color:C(0x1a2a3a),roughness:.35,metalness:.4,envMapIntensity:.8}));
    const tube=(a,c,r=.014)=>mesh(new T.TubeGeometry(new T.LineCurve3(a,c),2,r,10),fr,0,0,0,b);const W1=V3(-.55,.33,0),W2=V3(.55,.33,0),BB=V3(-.02,.3,0),ST=V3(-.12,.82,0),HD=V3(.42,.86,0);
    tube(BB,ST);tube(ST,HD);tube(BB,HD.clone().add(V3(-.02,-.06,0)));tube(BB,W1);tube(ST,W1);tube(HD,W2,.016);
    [W1,W2].forEach(c=>{mesh(new T.TorusGeometry(.33,.016,10,48),RUB,c.x,c.y,c.z,b);mesh(new T.TorusGeometry(.31,.006,6,48),CHR,c.x,c.y,c.z,b);const sp=[];for(let i=0;i<18;i++){const a=i/18*Math.PI*2;sp.push(V3(c.x,c.y,c.z),V3(c.x+Math.cos(a)*.31,c.y+Math.sin(a)*.31,c.z+(i%2?.02:-.02)));}
      const sg=new T.BufferGeometry().setFromPoints(sp);const ls=new T.LineSegments(sg,new T.LineBasicMaterial({color:0x9a9a9a}));b.add(ls);mesh(new T.CylinderGeometry(.03,.03,.07,14),CHR,c.x,c.y,c.z,b).rotation.x=Math.PI/2;
      mesh(new T.TorusGeometry(.36,.012,6,32,Math.PI*.7),fr,c.x,c.y,c.z,b).rotation.z=Math.PI*.15;});
    mesh(rbox(.2,.04,.1,.02),m('saddle',()=>std({color:C(0x2a1a12),roughness:.6})),-.14,.86,0,b);tube(V3(.42,.86,0),V3(.4,.98,0));tube(V3(.34,1.0,-.24),V3(.34,1.0,.24),.012);
    mesh(new T.CylinderGeometry(.08,.08,.02,24),CHR,-.02,.3,.03,b).rotation.x=Math.PI/2;return b;};
  return{teacup,teapot,loaf,pickles,samovar,bucket,valenki,gasBottle,laundry,chopBlock,wateringCan,milkCan,kennel,bicycle,ENAM,ZN};})();
