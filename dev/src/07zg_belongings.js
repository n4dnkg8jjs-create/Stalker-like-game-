/* ---------- what each family left on the table - every house its own: the old woman's medicines and her glasses on
   the prayer book; the knitting with the half-made sock; the schoolchild's exercise books, the satchel and the pencils;
   the men's bottle with the faceted glasses, the tin of sprats and the full ashtray; the paraffin lamp and candles of a
   house that has lost its power; the card game abandoned among the enamel mugs; the toolbox opened on a cloth; the
   children's drawings with the crayons; the bags packed and left by the door. Metres, standing on what they stand on. */
const BEL=(()=>{const R=RF,m=(k,f)=>memo('bel_'+k,f);
  const GLS=m('gls',()=>std({color:C(0xd0dcd8),roughness:.05,metalness:.05,transparent:true,opacity:.35,envMapIntensity:1.4,depthWrite:false})),BRN=m('brnglass',()=>std({color:C(0x5a3010),roughness:.08,transparent:true,opacity:.75,envMapIntensity:1.2}));
  const PAPER=m('paper',()=>std({color:C(0xe8e2d0),roughness:.95})),TIN=m('tin',()=>std({color:C(0xb8b8b0),metalness:.85,roughness:.35,envMapIntensity:.9}));
  const lbl=(key,w,h,draw)=>m('lbl'+key,()=>std({map:tex(w,h,draw,{clamp:true}),roughness:.6}));
  /* the faceted tumbler (granyonyi stakan): sixteen flat faces, a smooth rim band, the thick base */
  const stakan=(g,x,y,z,fill)=>{const s=R.G(g,x,y,z,0);const gg=new T.CylinderGeometry(.036,.031,.105,16,1,true);gg.translate(0,.0525,0);const mm=mesh(gg,GLS,0,0,0,s);mm.renderOrder=3;
    const b=new T.CylinderGeometry(.031,.031,.012,16);b.translate(0,.006,0);mesh(b,GLS,0,0,0,s).renderOrder=3;const rim=new T.CylinderGeometry(.0365,.0365,.018,24,1,true);rim.translate(0,.096,0);mesh(rim,GLS,0,0,0,s).renderOrder=3;
    if(fill){const f=new T.CylinderGeometry(.03,.029,fill,16);f.translate(0,.012+fill/2,0);mesh(f,m('vodkaIn',()=>std({color:C(0xe8f0f0),roughness:.02,transparent:true,opacity:.25})),0,0,0,s).renderOrder=2;}return s;};
  const bottle=(g,x,y,z,label,dark)=>{const b=R.G(g,x,y,z,0);mesh(lathe([[0,0],[.038,0],[.04,.005],[.04,.2],[.036,.23],[.016,.27],[.014,.31],[.016,.315],[.015,.32],[0,.32]],24),dark?BRN:GLS,0,0,0,b).renderOrder=3;
    if(label){const L=new T.CylinderGeometry(.0405,.0405,.08,24,1,true,-.9,1.8);mesh(L,lbl('vodka',128,64,(c,w,h)=>{c.fillStyle='#e8e2d0';c.fillRect(0,0,w,h);c.fillStyle='#b02020';c.font='bold 16px serif';c.fillText('СТОЛИЧНАЯ',8,26);c.fillStyle='#333';c.font='10px sans-serif';c.fillText('ВОДКА  0,5 л  40%',22,46);}),0,.1,0,b);}
    mesh(new T.CylinderGeometry(.017,.017,.022,16),TIN,0,.325,0,b);return b;};
  /* the tin of sprats: a flat oval can, the key rolled back over half the lid, the gold label */
  const sprats=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const sh=new T.Shape();sh.absellipse(0,0,.08,.05,0,Math.PI*2);const can=new T.ExtrudeGeometry(sh,{depth:.025,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:1,curveSegments:20});can.rotateX(-Math.PI/2);
    mesh(can,m('sprat',()=>std({color:C(0xc8a040),metalness:.8,roughness:.3})),0,0,0,s);const oil=new T.ShapeGeometry(sh,20);oil.rotateX(-Math.PI/2);mesh(oil,m('oil',()=>std({color:C(0x6a4a18),roughness:.05,envMapIntensity:1.2})),0,.02,0,s);
    for(let i=0;i<5;i++){const f=mesh(G('spratG',()=>{const g=lathe([[0,-.042],[.0035,-.036],[.0016,-.03],[.0075,-.022],[.0095,-.004],[.0088,.016],[.006,.031],[.0025,.04],[0,.043]],10);g.scale(1,1,.62);return g;}),m('fish',()=>std({color:C(0x8a6a30),metalness:.3,roughness:.25})),-.04+i*.02,.021,0,s);f.rotation.z=Math.PI/2;f.rotation.y=.1*(i-2);}
    const lid=new T.CylinderGeometry(.02,.02,.1,16);lid.rotateX(Math.PI/2);mesh(lid,TIN,.06,.035,0,s);return s;};
  /* an ashtray of pressed glass heaped with butts */
  const ashtray=(g,x,y,z)=>{const a=R.G(g,x,y,z,0);mesh(lathe([[0,0],[.06,0],[.065,.02],[.06,.028],[.045,.008],[0,.008]],20),GLS,0,0,0,a).renderOrder=3;
    for(let i=0;i<9;i++){const b=mesh(new T.CylinderGeometry(.0039,.0039,.025+Math.random()*.02,8),m('butt',()=>std({color:C(0xd8a860),roughness:.9})),(Math.random()-.5)*.07,.014,(Math.random()-.5)*.07,a);b.rotation.set(Math.PI/2+(Math.random()-.5)*.6,Math.random()*3,0);}
    mesh(new T.CircleGeometry(.04,16).rotateX(-Math.PI/2),m('ash2',()=>std({color:C(0x8a8680),roughness:1})),0,.01,0,a);return a;};
  /* the medicines: brown glass bottles with paper labels, a box of tablets, a blister strip, a glass of water, the
     reading glasses folded on the prayer book */
  const medicine=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);[[-.12,.0,.09],[-.07,.04,.07],[-.02,-.03,.11]].forEach(([dx,dz,hh])=>{mesh(lathe([[0,0],[.022,0],[.022,hh*.75],[.012,hh*.85],[.011,hh],[0,hh]],18),BRN,dx,0,dz,s).renderOrder=3;
      mesh(new T.CylinderGeometry(.0235,.0235,hh*.4,18,1,true),lbl('med',64,32,(c,w,h)=>{c.fillStyle='#f0ece0';c.fillRect(0,0,w,h);c.fillStyle='#2a3a8a';c.font='9px sans-serif';c.fillText('Корвалол',4,14);c.fillText('25 мл',14,26);}),dx,hh*.35,dz,s);mesh(new T.CylinderGeometry(.013,.013,.012,12),m('cap',()=>std({color:C(0xe8e8e0),roughness:.4})),dx,hh+.006,dz,s);});
    mesh(rbox(.09,.03,.05,.004),lbl('pills',64,32,(c,w,h)=>{c.fillStyle='#f4f0f0';c.fillRect(0,0,w,h);c.fillStyle='#c02020';c.fillRect(0,0,w,8);c.fillStyle='#333';c.font='bold 8px sans-serif';c.fillText('ВАЛИДОЛ',6,22);}),.06,.015,.04,s);
    {const bl=rbox(.1,.004,.045,.001);mesh(bl,TIN,.08,.003,-.05,s).rotation.y=.4;for(let i=0;i<5;i++)mesh(new T.SphereGeometry(.006,8,6),m('blist',()=>std({color:C(0xf0f0f0),roughness:.3})),.08-.035+i*.017*Math.cos(.4),.006,-.05+i*.017*Math.sin(.4),s);}
    stakan(s,.14,0,-.06,.06);
    const bk=R.G(s,-.1,0,-.12,.3);mesh(rbox(.14,.03,.2,.006),m('book',()=>std({color:C(0x2a1a14),roughness:.6})),0,.015,0,bk);mesh(rbox(.135,.026,.19,.004),PAPER,.004,.015,0,bk);mesh(new T.PlaneGeometry(.04,.04),m('cross',()=>std({color:C(0xc8a040),metalness:.8,roughness:.3})),0,.031,0,bk,false).rotation.x=-Math.PI/2;
    const gl=R.G(bk,0,.034,.02,.2);[-1,1].forEach(k=>{mesh(new T.TorusGeometry(.022,.0018,6,20),R.IRON,k*.026,.004,0,gl).rotation.x=Math.PI/2;mesh(new T.CircleGeometry(.021,20).rotateX(-Math.PI/2),GLS,k*.026,.004,0,gl);});mesh(new T.CylinderGeometry(.0015,.0015,.008,6).rotateZ(Math.PI/2),R.IRON,0,.004,0,gl);
    [-1,1].forEach(k=>{const a=mesh(new T.CylinderGeometry(.0015,.0015,.11,6),R.IRON,k*.048,.004,-.05,gl);a.rotation.x=Math.PI/2;});return s;};
  /* the knitting: a wicker basket of wool balls, the needles through a half-made sock, scissors, a reel of thread */
  const knitting=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const bas=lathe([[0,0],[.1,0],[.13,.08],[.135,.09],[.13,.092],[.12,.082],[.09,.012],[0,.012]],24);mesh(bas,m('wicker',()=>std({map:tex(64,64,(c,w,h)=>{c.fillStyle='#8a6a3a';c.fillRect(0,0,w,h);c.strokeStyle='#5a4220';for(let y=0;y<h;y+=6){c.beginPath();for(let x=0;x<=w;x+=8)c.lineTo(x,y+((x/8)%2)*3);c.stroke();}}),roughness:.9})),0,0,0,s);
    const cols=[0xa82a2a,0x2a4a8a,0xe0d8c8,0x5a7a3a];for(let i=0;i<4;i++){const b=mesh(new T.SphereGeometry(.035,14,10),m('wool'+i,()=>std({map:TX.knit||TX.cloth,color:C(cols[i]),roughness:1})),Math.cos(i*1.7)*.05,.06+(i%2)*.02,Math.sin(i*1.7)*.05,s);b.scale.y=.9;}
    const sock=R.G(s,.2,0,.02,.6);mesh(rbox(.05,.025,.16,.012),m('wool0',()=>std({color:C(cols[0]),roughness:1})),0,.013,0,sock);[-.012,.012].forEach(k=>{const n=mesh(new T.CylinderGeometry(.0014,.0014,.2,6),TIN,k,.03,0,sock);n.rotation.x=Math.PI/2;});
    const yn=new T.TubeGeometry(new T.CatmullRomCurve3([V3(.2,.02,-.06),V3(.14,.005,-.04),V3(.08,.03,-.02),V3(.03,.06,0)]),16,.0025,5);mesh(yn,m('wool0',()=>std({color:C(cols[0]),roughness:1})),0,0,0,s);
    {const sc=R.G(s,-.17,.004,.06,.8);[-1,1].forEach(k=>{const bl=mesh(rbox(.09,.003,.01,.001),TIN,.045,k*.001,0,sc);bl.rotation.y=k*.08;mesh(new T.TorusGeometry(.012,.003,6,14),R.IRON,-.012,0,k*.012,sc).rotation.x=Math.PI/2;});}
    mesh(new T.CylinderGeometry(.014,.014,.03,14),m('reel',()=>std({color:C(0xe8e0c8),roughness:.8})),-.12,.015,-.08,s);return s;};
  /* the schoolchild's things: two exercise books (the green tetrad), a pencil case and pencils, the satchel on the floor */
  const school=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const cov=lbl('tetrad',64,96,(c,w,h)=>{c.fillStyle='#4a7a5a';c.fillRect(0,0,w,h);c.fillStyle='#f0ece0';c.fillRect(8,10,w-16,30);c.fillStyle='#333';c.font='7px sans-serif';c.fillText('ТЕТРАДЬ',16,20);c.fillText('ученика 4 класса',10,32);});
    [[0,0,.1],[.05,.012,-.3]].forEach(([dx,dy,r],i)=>{const b=R.G(s,dx,dy,0,r);mesh(rbox(.17,.006,.205,.001),PAPER,0,.003,0,b);mesh(new T.PlaneGeometry(.17,.205),cov,0,.0065,0,b,false).rotation.x=-Math.PI/2;});
    const open=R.G(s,-.22,0,.05,.2);mesh(rbox(.34,.004,.205,.001),PAPER,0,.002,0,open);mesh(new T.PlaneGeometry(.33,.2),lbl('page',256,160,(c,w,h)=>{c.fillStyle='#f4f0e6';c.fillRect(0,0,w,h);c.strokeStyle='rgba(80,110,170,.35)';for(let x=0;x<w;x+=8){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke();}for(let y=0;y<h;y+=8){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke();}
      c.fillStyle='#1a3a8a';c.font='italic 12px serif';c.fillText('Классная работа',20,24);c.fillText('7 + 5 = 12   9 - 4 = 5',24,48);c.fillText('8 + 6 = 14',24,72);c.fillStyle='#c02020';c.font='bold 18px serif';c.fillText('5',w-40,40);c.strokeStyle='#888';c.beginPath();c.moveTo(w/2,0);c.lineTo(w/2,h);c.stroke();}),0,.0045,0,open,false).rotation.x=-Math.PI/2;
    for(let i=0;i<4;i++){const p=mesh(new T.CylinderGeometry(.0035,.0035,.17,6),m('pen'+i,()=>std({color:C([0xc02020,0x2040a0,0x208040,0xd8b020][i]),roughness:.5})),.18,.004,-.08+i*.012,s);p.rotation.set(Math.PI/2,0,.2*i);}return s;};
  /* the school satchel (ranets): a stiff leatherette case with rounded corners, the flap over the front with its two
     buckled straps, a reflector badge, the carrying handle and the shoulder straps down the back */
  const satchel=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const lea=m('satchel',()=>std({map:TX.cloth,color:C(0x6a3a22),roughness:.6})),dk=m('satchelDk',()=>std({color:C(0x3a1e12),roughness:.6}));
    mesh(rbox(.32,.26,.1,.035),lea,0,.13,0,s);
    {const sh=new T.Shape();sh.moveTo(-.16,0);sh.lineTo(.16,0);sh.lineTo(.16,-.12);sh.quadraticCurveTo(.16,-.17,.11,-.17);sh.lineTo(-.11,-.17);sh.quadraticCurveTo(-.16,-.17,-.16,-.12);sh.closePath();
     const fg=new T.ExtrudeGeometry(sh,{depth:.008,bevelEnabled:true,bevelThickness:.002,bevelSize:.002,bevelSegments:2,curveSegments:16});const fl=mesh(fg,lea,0,.262,.051,s);fl.rotation.x=.04;}
    [-.08,.08].forEach(dx=>{mesh(rbox(.026,.11,.004,.002),dk,dx,.13,.064,s);const bk=mesh(new T.TorusGeometry(.011,.0022,8,24),R.BR,dx,.11,.067,s);bk.scale.y=1.3;mesh(rbox(.026,.03,.005,.002),dk,dx,.07,.058,s);});
    mesh(new T.CircleGeometry(.022,28),m('refl',()=>std({color:C(0xd06020),roughness:.2,metalness:.3,envMapIntensity:1.2})),0,.19,.066,s);
    mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(-.05,.26,0),V3(-.035,.3,0),V3(.035,.3,0),V3(.05,.26,0)]),16,.006,10),dk,0,0,0,s);
    [-.09,.09].forEach(dx=>mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(dx,.25,-.05),V3(dx,.18,-.075),V3(dx*1.1,.06,-.07),V3(dx*1.15,.02,-.052)]),16,.0055,8).scale(1,1,1),dk,0,0,0,s));
    return s;};
  /* the paraffin lamp: the glass font on its foot, the burner and wick, the tall chimney; candles stuck on a saucer */
  const kerosene=(g,x,y,z)=>{const k=R.G(g,x,y,z,0);mesh(lathe([[0,0],[.05,0],[.045,.02],[.02,.04],[.02,.07],[.055,.1],[.06,.13],[.04,.16],[.018,.17],[0,.17]],24),GLS,0,0,0,k).renderOrder=3;
    mesh(lathe([[0,0],[.03,0],[.034,.02],[.03,.03],[0,.03]],18),TIN,0,.17,0,k);mesh(lathe([[.026,0],[.03,.02],[.034,.05],[.022,.1],[.02,.2],[.0001,.2]],20),GLS,0,.2,0,k).renderOrder=4;
    const fuel=new T.CylinderGeometry(.045,.05,.03,18);fuel.translate(0,.09,0);mesh(fuel,m('kero',()=>std({color:C(0xd8b060),roughness:.05,transparent:true,opacity:.5})),0,0,0,k).renderOrder=2;return k;};
  const candles=(g,x,y,z)=>{const c=R.G(g,x,y,z,0);mesh(lathe([[0,0],[.06,0],[.065,.012],[.06,.015],[0,.006]],18),R.PORC,0,0,0,c);[[-.015,.0,.09],[.02,.01,.05]].forEach(([dx,dz,hh])=>{mesh(new T.CylinderGeometry(.009,.01,hh,12),m('wax',()=>std({color:C(0xf0e8d0),roughness:.5})),dx,.008+hh/2,dz,c);
      const drip=mesh(new T.SphereGeometry(.012,8,6),m('wax',()=>std({color:C(0xf0e8d0),roughness:.5})),dx,.012,dz,c);drip.scale.y=.3;mesh(new T.CylinderGeometry(.001,.001,.008,4),m('wick',()=>std({color:C(0x1a1a1a)})),dx,.012+hh,dz,c);});return c;};
  /* the transistor radio: a leatherette case, the dial window, the grille, the aerial out */
  const radio=(g,x,y,z,ry)=>{const r=R.G(g,x,y,z,ry);mesh(rbox(.26,.16,.08,.012),m('radio',()=>std({map:TX.cloth,color:C(0x3a2a20),roughness:.6})),0,.08,0,r);
    mesh(new T.PlaneGeometry(.12,.06),lbl('dial',128,64,(c,w,h)=>{c.fillStyle='#e8dcb8';c.fillRect(0,0,w,h);c.fillStyle='#333';c.font='8px sans-serif';['ДВ','СВ','КВ','УКВ'].forEach((t,i)=>{c.fillText(t,4,12+i*14);for(let x=24;x<w;x+=10)c.fillRect(x,8+i*14,1,4);});c.fillStyle='#c02020';c.fillRect(70,4,2,56);}),-.05,.1,.041,r,false);
    mesh(rbox(.08,.1,.004,.002),m('grille',()=>std({color:C(0xb0b0a8),metalness:.8,roughness:.4})),.07,.08,.04,r);const a=mesh(new T.CylinderGeometry(.002,.003,.4,6),TIN,.11,.32,-.02,r);a.rotation.z=-.4;return r;};
  /* the card game: the hands thrown down, the stock face down, two enamel mugs; dominoes */
  const cards=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const back=lbl('cardB',32,48,(c,w,h)=>{c.fillStyle='#b02a2a';c.fillRect(0,0,w,h);c.strokeStyle='#f0e0d0';c.lineWidth=1;for(let i=-h;i<w;i+=4){c.beginPath();c.moveTo(i,0);c.lineTo(i+h,h);c.stroke();}c.strokeRect(2,2,w-4,h-4);});
    const face=lbl('cardF',32,48,(c,w,h)=>{c.fillStyle='#f8f4ec';c.fillRect(0,0,w,h);c.fillStyle='#b01010';c.font='bold 12px serif';c.fillText('7',3,12);c.fillText('♥',10,30);});
    for(let i=0;i<14;i++){const cd=new T.PlaneGeometry(.058,.088);cd.rotateX(-Math.PI/2);const mm=mesh(cd,i%3?face:back,(Math.random()-.5)*.35,.002+i*.0004,(Math.random()-.5)*.25,s,false);mm.rotation.y=Math.random()*6;}
    for(let i=0;i<6;i++){const st=mesh(new T.PlaneGeometry(.058,.088).rotateX(-Math.PI/2),back,.2,.002+i*.0007,-.1,s,false);st.rotation.y=.1;}
    [[-.22,.12],[.25,.12]].forEach(([dx,dz],i)=>{const mg=R.G(s,dx,0,dz,i*2);mesh(lathe([[0,0],[.04,0],[.042,.09],[.04,.092],[.0001,.012]],20),LV.ENAM,0,0,0,mg);mesh(new T.TorusGeometry(.025,.006,6,12,Math.PI),LV.ENAM,.045,.05,0,mg).rotation.z=-Math.PI/2;});return s;};
  /* the opened toolbox on an oilcloth: hammer, pliers, screwdriver, nails spilled */
  const tools=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const box=m('toolbox',()=>std({color:C(0x3a5a3a),metalness:.6,roughness:.45}));mesh(rbox(.42,.12,.2,.006),box,0,.06,0,s);const lid=mesh(rbox(.42,.012,.2,.004),box,0,.13,-.12,s);lid.rotation.x=-1.9;mesh(rbox(.24,.02,.02,.006),R.IRON,0,.14,0,s);
    const hm=R.G(s,.32,.015,.1,.5);mesh(new T.CylinderGeometry(.012,.014,.3,10).rotateZ(Math.PI/2),R.W2,0,0,0,hm);mesh(rbox(.035,.035,.1,.004),R.IRON,.15,0,0,hm);
    const sd=R.G(s,-.3,.012,.12,-.4);mesh(new T.CylinderGeometry(.012,.012,.1,10).rotateZ(Math.PI/2),m('handle',()=>std({color:C(0xd8a020),roughness:.4})),0,0,0,sd);mesh(new T.CylinderGeometry(.003,.003,.12,6).rotateZ(Math.PI/2),TIN,.11,0,0,sd);
    for(let i=0;i<12;i++){const n=mesh(new T.CylinderGeometry(.0015,.0015,.05,4),TIN,(Math.random()-.5)*.3,.003,.15+(Math.random()-.5)*.1,s);n.rotation.set(Math.PI/2,Math.random()*3,0);}return s;};
  /* a child's drawings and the crayons; the knitted toy rabbit */
  const drawings=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);for(let i=0;i<3;i++){const pg=new T.PlaneGeometry(.21,.297);pg.rotateX(-Math.PI/2);const mm=mesh(pg,lbl('draw'+i,128,180,(c,w,h)=>{c.fillStyle='#f4f2ea';c.fillRect(0,0,w,h);c.lineWidth=3;
        if(i===0){c.strokeStyle='#2a8a2a';c.beginPath();c.moveTo(0,150);c.lineTo(w,150);c.stroke();c.fillStyle='#c02020';c.fillRect(30,90,60,60);c.fillStyle='#6a3a1a';c.beginPath();c.moveTo(24,90);c.lineTo(60,60);c.lineTo(96,90);c.fill();c.fillStyle='#f0d020';c.beginPath();c.arc(100,30,16,0,7);c.fill();}
        else if(i===1){c.strokeStyle='#2040a0';c.beginPath();c.arc(64,60,22,0,7);c.stroke();c.beginPath();c.moveTo(64,82);c.lineTo(64,130);c.moveTo(64,95);c.lineTo(40,110);c.moveTo(64,95);c.lineTo(90,110);c.moveTo(64,130);c.lineTo(46,165);c.moveTo(64,130);c.lineTo(82,165);c.stroke();c.fillStyle='#333';c.font='14px sans-serif';c.fillText('МАМА',40,24);}
        else{c.fillStyle='#4a6a3a';c.fillRect(10,100,100,30);c.fillRect(30,80,50,20);c.strokeStyle='#333';c.beginPath();c.moveTo(80,88);c.lineTo(118,80);c.stroke();c.fillStyle='#f08020';c.beginPath();c.arc(118,70,10,0,7);c.fill();}}),(i-1)*.18,.002+i*.0005,(i%2)*.04,s,false);mm.rotation.y=(i-1)*.25;}
    for(let i=0;i<5;i++){const cr=mesh(new T.CylinderGeometry(.005,.005,.08,8),m('cray'+i,()=>std({color:C([0xc02020,0x2040a0,0x20a040,0xe0c020,0x7a3a1a][i]),roughness:.6})),.3,.005,-.1+i*.015,s);cr.rotation.set(Math.PI/2,0,.3*i);}return s;};
  /* the knitted toy rabbit, sat up: a plump body and head in worn stocking-stitch, long ears lined with pink felt (one
     flopped over), arms hanging, legs out in front with felt soles, a pompom tail, button eyes with a shine, the nose
     sewn on, a faded ribbon at the neck */
  const KNIT=()=>m('knitTex',()=>{const t=tex(128,128,(c,w,h)=>{c.fillStyle='#b8a890';c.fillRect(0,0,w,h);for(let y=0;y<h;y+=8)for(let x=0;x<w;x+=8){c.strokeStyle='rgba(255,250,236,.35)';c.lineWidth=2.2;c.beginPath();c.moveTo(x+1,y+1);c.lineTo(x+4,y+7);c.lineTo(x+7,y+1);c.stroke();
      c.strokeStyle='rgba(40,30,20,.35)';c.lineWidth=1;c.beginPath();c.moveTo(x+4,y+7.5);c.lineTo(x+4,y+8);c.stroke();}const q=rng(3);for(let i=0;i<500;i++){c.fillStyle=`rgba(${q()<.5?255:60},${q()<.5?250:50},230,${q()*.08})`;c.beginPath();c.arc(q()*w,q()*h,.6+q()*1.6,0,7);c.fill();}});t.repeat.set(4,4);return t;});
  const rabbit=(g,x,y,z,ry)=>{const r=R.G(g,x,y,z,ry);const kt=KNIT();const knit=m('toyKnit2',()=>std({map:kt,bumpMap:kt,bumpScale:.0012,color:C(0xd2c4ac),roughness:1,envMapIntensity:.15}));
    const felt=m('toyFelt',()=>std({color:C(0xd89a98),roughness:1,envMapIntensity:.1})),L=(p,sg)=>lathe(p,sg||28);
    const body=mesh(L([[0,0],[.042,.004],[.058,.026],[.062,.055],[.056,.085],[.042,.108],[.024,.12],[0,.123]]),knit,0,0,0,r);body.scale.z=.86;
    const hd=R.G(r,0,.112,.004,0);const head=mesh(L([[0,0],[.028,.004],[.044,.024],[.048,.048],[.042,.072],[.024,.087],[0,.09]]),knit,0,0,0,hd);head.scale.set(1,.96,.95);
    const muz=mesh(new T.SphereGeometry(.026,24,16),knit,0,.032,.034,hd);muz.scale.set(1.15,.8,.8);
    [-1,1].forEach(k=>{const eg=R.G(hd,k*.021,.078,-.004,0);eg.rotation.z=-k*.16;if(k>0){eg.rotation.x=.9;eg.position.y-=.005;}
      const ear=mesh(L([[0,0],[.011,.006],[.017,.035],[.016,.07],[.01,.1],[0,.106]],24),knit,0,0,0,eg);ear.scale.z=.34;
      const inn=mesh(L([[0,.01],[.009,.016],[.012,.04],[.011,.07],[.006,.093],[0,.097]],20),felt,0,0,.0045,eg);inn.scale.z=.12;
      const eye=mesh(new T.SphereGeometry(.0065,16,12),m('btnEye2',()=>std({color:C(0x0c0c0c),roughness:.15,metalness:.1,envMapIntensity:1.4})),k*.018,.05,.038,hd);eye.scale.z=.55;
      const arm=R.G(r,k*.05,.088,.012,0);arm.rotation.set(-.35,0,k*.38);mesh(L([[0,-.07],[.011,-.066],[.015,-.05],[.016,-.02],[.012,-.004],[0,0]],22),knit,0,0,0,arm);
      const leg=R.G(r,k*.03,.022,.03,0);leg.rotation.set(Math.PI/2-.12,0,k*.12);mesh(L([[0,-.076],[.015,-.072],[.02,-.055],[.021,-.025],[.017,-.004],[0,0]],22),knit,0,0,0,leg);
      mesh(new T.CircleGeometry(.0145,24),felt,0,-.0765,0,leg).rotation.x=Math.PI/2;});
    {const ns=mesh(new T.SphereGeometry(.0075,16,12),m('toyNose',()=>std({color:C(0x9a4a50),roughness:.9})),0,.042,.054,hd);ns.scale.set(1.2,.7,.5);
     const st=new T.TubeGeometry(new T.CatmullRomCurve3([V3(-.008,.028,.05),V3(0,.034,.054),V3(.008,.028,.05)]),12,.0012,6);mesh(st,m('toyThread',()=>std({color:C(0x3a2a24),roughness:1})),0,0,0,hd);}
    mesh(new T.SphereGeometry(.019,20,14),m('toyPom',()=>std({map:kt,bumpMap:kt,bumpScale:.002,color:C(0xeee6d8),roughness:1})),0,.03,-.052,r);
    {const rb=m('toyRibbon',()=>std({color:C(0x8a2a3a),roughness:.55,envMapIntensity:.3}));const nk=mesh(new T.TorusGeometry(.03,.0035,10,36),rb,0,.113,.003,r);nk.rotation.x=Math.PI/2;nk.scale.y=.86;
     [-1,1].forEach(k=>{const lp=mesh(new T.SphereGeometry(.012,16,10),rb,k*.012,.114,.03,r);lp.scale.set(1.2,.7,.35);lp.rotation.z=k*.4;const tl=mesh(rbox(.008,.026,.002,.001),rb,k*.006,.098,.031,r);tl.rotation.z=k*.3;});}
    return r;};
  /* packed and left: two bags and a bundle tied up in a blanket by the door */
  /* packed and left by the door: the old suitcase (its lid seam, steel corner caps, the two straps round it buckled, the
     handle), a canvas holdall zipped shut with its two handles, and a bundle tied up in a blanket, the corners knotted
     on top */
  const bags=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);const leather=m('suitcase',()=>std({map:TX.cloth,color:C(0x4a3424),roughness:.7}));
    mesh(rbox(.6,.4,.18,.025),leather,0,.2,0,s);mesh(rbox(.606,.012,.186,.004),m('caseSeam',()=>std({color:C(0x2a1c12),roughness:.8})),0,.27,0,s);
    const cap=m('caseCap',()=>std({color:C(0x8a8478),metalness:.8,roughness:.4}));[-1,1].forEach(a=>[-1,1].forEach(b=>[-1,1].forEach(c=>{const k=mesh(new T.SphereGeometry(.02,14,10),cap,a*.29,.2+b*.19,c*.08,s);k.scale.set(1,1,.9);})));
    const strap=m('caseStrap',()=>std({color:C(0x2e2014),roughness:.65}));[-.17,.17].forEach(dx=>{mesh(rbox(.04,.41,.19,.006),strap,dx,.2,0,s);mesh(rbox(.036,.03,.006,.002),cap,dx,.29,.096,s);mesh(rbox(.024,.018,.006,.002),strap,dx,.29,.0985,s);});
    {const hp=new T.TubeGeometry(new T.CatmullRomCurve3([V3(-.07,.4,0),V3(-.06,.45,0),V3(0,.465,0),V3(.06,.45,0),V3(.07,.4,0)]),24,.011,12);mesh(hp,strap,0,0,0,s);[-.07,.07].forEach(dx=>mesh(rbox(.03,.02,.04,.004),cap,dx,.405,0,s));}
    /* the holdall: a soft canvas tube on its side, round ends, the zip along the top, two webbing handles */
    {const bag=R.G(s,.62,0,.05,.4);const cl=m('bagCloth',()=>std({map:TX.cloth,color:C(0x2a3a5a),roughness:.9}));const L=.5,sec=[];
     for(let i=0;i<=12;i++){const a=i/12*Math.PI*2;sec.push([Math.cos(a)*.15,.12+Math.sin(a)*.12*(Math.sin(a)<0?.85:1)]);}
     const gb=new T.CylinderGeometry(1,1,L,32,6);gb.rotateZ(Math.PI/2);const P=gb.attributes.position;for(let i=0;i<P.count;i++){const xx=P.getX(i),yy=P.getY(i),zz=P.getZ(i),sag=1-.12*Math.pow(xx/(L/2),2);P.setXYZ(i,xx,.13+yy*.125*sag*(yy<0?.9:1)+(yy<0?.0:0),zz*.15*sag);}gb.computeVertexNormals();mesh(gb,cl,0,0,0,bag);
     [-1,1].forEach(k=>{const e=mesh(new T.SphereGeometry(1,24,16,0,Math.PI*2,0,Math.PI/2),cl,k*L/2,.13,0,bag);e.scale.set(.045,.11,.135);e.rotation.z=-k*Math.PI/2;});
     mesh(rbox(L-.02,.008,.012,.003),m('zip',()=>std({color:C(0x1a1a1a),metalness:.4,roughness:.5})),0,.257,0,bag);mesh(rbox(.016,.006,.02,.002),cap,.12,.262,.01,bag);
     const web=m('webbing',()=>std({color:C(0x1c2638),roughness:.8}));[-1,1].forEach(k=>{const h_=new T.TubeGeometry(new T.CatmullRomCurve3([V3(-.1,.24,k*.06),V3(-.05,.33,k*.06),V3(.05,.33,k*.06),V3(.1,.24,k*.06)]),20,.008,8);h_.scale(1,1,1);mesh(h_,web,0,0,0,bag);});}
    /* the bundle: a blanket gathered up round what is in it, its four corners knotted on top */
    {const bun=R.G(s,-.6,0,.1,-.3);const bm=m('bundle',()=>std({map:FAB.quilt(1),roughness:.95}));const gb=new T.SphereGeometry(.22,32,20);const P=gb.attributes.position;
     for(let i=0;i<P.count;i++){const v=V3(P.getX(i),P.getY(i),P.getZ(i));const a=Math.atan2(v.z,v.x),up=v.y/.22;v.multiplyScalar(1+.06*Math.sin(a*5+up*3)*(1-Math.abs(up)));if(up>.4){const k_=(up-.4)/.6;v.x*=1-.55*k_;v.z*=1-.55*k_;}if(v.y<-.12)v.y=-.12-(v.y+.12)*.15;P.setXYZ(i,v.x,v.y,v.z);}gb.computeVertexNormals();
     mesh(gb,bm,0,.13,0,bun).scale.set(1.05,1,.9);
     for(let k=0;k<4;k++){const a=k*Math.PI/2+.4;const ear=R.G(bun,Math.cos(a)*.02,.33,Math.sin(a)*.02,0);ear.rotation.set(Math.sin(a)*.7,0,-Math.cos(a)*.7);const eg=new T.ConeGeometry(.045,.13,16,4,true);eg.translate(0,.065,0);const E=eg.attributes.position;for(let i=0;i<E.count;i++)E.setX(i,E.getX(i)*1.3);eg.computeVertexNormals();
       mesh(eg,m('bundleDS',()=>std({map:FAB.quilt(1),roughness:.95,side:T.DoubleSide})),0,0,0,ear);}
     const kn=new T.TorusGeometry(.04,.022,14,28);mesh(kn,bm,0,.33,0,bun).rotation.x=Math.PI/2;mesh(new T.SphereGeometry(.035,20,14),bm,0,.345,0,bun);}
    return s;};
  const vodka=(g,x,y,z,ry)=>{const s=R.G(g,x,y,z,ry);bottle(s,0,0,0,true);stakan(s,.1,0,.06,.03);stakan(s,-.08,0,.09,0);sprats(s,.05,0,-.14,.4);ashtray(s,-.2,0,-.06);
    /* a heel of the loaf on newspaper, a pickled cucumber */paperMesh(s,'news',91,-.02,.002,.02,.3,.7);return s;};
  return{stakan,bottle,sprats,ashtray,medicine,knitting,school,satchel,kerosene,candles,radio,cards,tools,drawings,rabbit,bags,vodka};})();
