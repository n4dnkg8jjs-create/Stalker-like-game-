/* ---------- the red corner (krasny ugol): Orthodox icons as a village house keeps them. Painted in the canon of Russian
   icon-painting, layer on layer as an iconographer works: a gilded ground (levkas under gold leaf, the tooling and the
   wear showing), the garments in mineral colours with their gold assist (folds hatched in gold), the faces built up from
   the dark olive underpaint (sankir) through ochre glazes to the white highlight strokes (dvizhki), the long straight
   nose, the large almond eyes under arched brows, the small closed mouth; the cross in Christ's halo with O ΩN, the
   Greek abbreviations in red - ΜΡ ΘΥ, IC XC - the three stars on the Mother of God's veil. Then the age: the drying oil
   darkened to brown, a craquelure, the edges rubbed.
   Three icons: the Kazan Mother of God, Christ Pantocrator, St Nicholas the Wonderworker. Some houses keep them bare on
   their boards, some under a stamped brass cover (oklad / riza) that leaves only faces and hands showing, in a glazed
   wooden case (kiot) with a carved top, on the corner shelf (bozhnitsa) with the embroidered towel (rushnyk) over it,
   the lamp before it and a sprig of pussy-willow from Palm Sunday. ---------- */
const ICON=(()=>{
  const W=384,Hh=512;
  /* a face, iconographic: oval, built from dark to light. cx,cy = centre of face, s = scale (face height ~ 2.1*s),
     turn = 3/4 turn (-1..1), old = elder (lined, beard), hair: 'veil'|'christ'|'bald' */
  const face=(c,cx,cy,s,o={})=>{const turn=o.turn||0;c.save();c.translate(cx,cy);
    /* neck */c.fillStyle='#5a4a2e';c.beginPath();c.moveTo(-s*.42,s*.8);c.quadraticCurveTo(-s*.4,s*1.25,-s*.5,s*1.6);c.lineTo(s*.5,s*1.6);c.quadraticCurveTo(s*.4,s*1.25,s*.42,s*.8);c.fill();
    c.fillStyle='rgba(196,150,96,.55)';c.beginPath();c.ellipse(turn*s*.1,s*1.15,s*.22,s*.3,0,0,7);c.fill();
    /* the oval in sankir */const ov=()=>{c.beginPath();c.ellipse(turn*s*.06,0,s*.74,s*1.02,0,0,7);};ov();c.fillStyle='#5e5032';c.fill();
    /* ochre glazes, each smaller and lighter, gathered to the forehead, cheeks and the nose */
    [[.66,.94,'rgba(150,112,66,.85)'],[.56,.84,'rgba(178,134,84,.8)'],[.46,.72,'rgba(204,160,104,.7)']].forEach(([a,b,col])=>{c.fillStyle=col;c.beginPath();c.ellipse(turn*s*.1,-s*.08,s*a,s*b,0,0,7);c.fill();});
    [[-.32,.12],[.32,.12]].forEach(([x,y])=>{c.fillStyle='rgba(214,170,116,.55)';c.beginPath();c.ellipse((x+turn*.12)*s,y*s,s*.2,s*.16,0,0,7);c.fill();});
    /* shadow down the turned-away side and under the jaw */c.fillStyle='rgba(60,46,26,.45)';c.beginPath();c.ellipse((turn>0?-.5:.5)*s+turn*s*.06,s*.1,s*.24,s*.8,0,0,7);c.fill();
    /* brows: thin dark arcs, high */c.strokeStyle='#2a1c10';c.lineWidth=s*.045;c.lineCap='round';[-1,1].forEach(k=>{c.beginPath();c.moveTo((k*.12+turn*.1)*s,-s*.32);c.quadraticCurveTo((k*.34+turn*.1)*s,-s*.46,(k*.56+turn*.08)*s,-s*.3);c.stroke();});
    /* eyes: large almond shapes, the upper lid heavy, dark irises looking out, the shadowed socket under the brow */
    [-1,1].forEach(k=>{const ex=(k*.33+turn*.1)*s,ey=-s*.16,ew=s*.2*(k*turn>0?.85:1);c.fillStyle='rgba(70,50,28,.45)';c.beginPath();c.ellipse(ex,ey-s*.05,ew*1.25,s*.13,0,0,7);c.fill();
      c.fillStyle='#e8dcc0';c.beginPath();c.moveTo(ex-ew,ey);c.quadraticCurveTo(ex,ey-s*.12,ex+ew,ey);c.quadraticCurveTo(ex,ey+s*.08,ex-ew,ey);c.fill();
      c.fillStyle='#2a1a0e';c.beginPath();c.arc(ex+turn*s*.03,ey-s*.01,s*.07,0,7);c.fill();c.fillStyle='rgba(255,250,235,.7)';c.beginPath();c.arc(ex+turn*s*.03+s*.02,ey-s*.03,s*.014,0,7);c.fill();
      c.strokeStyle='#24160c';c.lineWidth=s*.035;c.beginPath();c.moveTo(ex-ew*1.05,ey+s*.01);c.quadraticCurveTo(ex,ey-s*.15,ex+ew*1.05,ey);c.stroke();
      c.lineWidth=s*.015;c.strokeStyle='rgba(60,40,20,.7)';c.beginPath();c.moveTo(ex-ew*.8,ey+s*.08);c.quadraticCurveTo(ex,ey+s*.13,ex+ew*.8,ey+s*.07);c.stroke();});
    /* the nose: long and narrow from the brows, a fine shadow line down one side, the small rounded tip and nostrils */
    const nx=turn*s*.12;c.strokeStyle='rgba(60,40,22,.85)';c.lineWidth=s*.03;c.beginPath();c.moveTo(nx-s*.06,-s*.28);c.quadraticCurveTo(nx-s*.07,s*.05,nx-s*.1,s*.24);c.stroke();
    c.beginPath();c.moveTo(nx-s*.12,s*.27);c.quadraticCurveTo(nx,s*.34,nx+s*.12,s*.27);c.stroke();c.fillStyle='rgba(50,32,18,.8)';[-1,1].forEach(k=>{c.beginPath();c.ellipse(nx+k*s*.07,s*.29,s*.03,s*.018,0,0,7);c.fill();});
    /* the mouth: small, closed, the lower lip full */c.fillStyle='#8a3a2a';c.beginPath();c.moveTo(nx-s*.15,s*.48);c.quadraticCurveTo(nx,s*.43,nx+s*.15,s*.48);c.quadraticCurveTo(nx,s*.58,nx-s*.15,s*.48);c.fill();
    c.strokeStyle='#3a160e';c.lineWidth=s*.02;c.beginPath();c.moveTo(nx-s*.16,s*.48);c.quadraticCurveTo(nx,s*.5,nx+s*.16,s*.48);c.stroke();
    /* the highlights: fine white strokes - over the brows, the bridge of the nose, under the eyes, the chin */
    c.strokeStyle='rgba(250,240,215,.85)';c.lineWidth=s*.018;[[[-.2,-.52],[-.05,-.56],[.1,-.52]],[[nx/s+.04,-.2],[nx/s+.05,.0],[nx/s+.03,.18]],[[-.45,.0],[-.36,.04],[-.24,.03]],[[.24,.03],[.36,.04],[.45,.0]],[[-.08,.7],[0,.73],[.08,.7]]].forEach(L=>{c.beginPath();c.moveTo(L[0][0]*s,L[0][1]*s);c.quadraticCurveTo(L[1][0]*s,L[1][1]*s,L[2][0]*s,L[2][1]*s);c.stroke();});
    if(o.old){/* the elder's lines and his short white beard */c.strokeStyle='rgba(60,40,22,.6)';c.lineWidth=s*.015;for(let i=0;i<3;i++){c.beginPath();c.moveTo(-s*.3,-s*(.62+i*.06));c.quadraticCurveTo(0,-s*(.68+i*.06),s*.3,-s*(.62+i*.06));c.stroke();}
      c.fillStyle='#d8d4c8';c.beginPath();c.moveTo(-s*.62,s*.15);c.quadraticCurveTo(-s*.66,s*.95,0,s*1.2);c.quadraticCurveTo(s*.66,s*.95,s*.62,s*.15);c.quadraticCurveTo(s*.3,s*.62,0,s*.62);c.quadraticCurveTo(-s*.3,s*.62,-s*.62,s*.15);c.fill();
      c.strokeStyle='rgba(120,116,106,.8)';c.lineWidth=s*.02;for(let i=-5;i<=5;i++){c.beginPath();c.moveTo(i*s*.1,s*.66);c.quadraticCurveTo(i*s*.11,s*.9,i*s*.06,s*1.12);c.stroke();}
      c.fillStyle='#8a3a2a';c.beginPath();c.ellipse(nx,s*.5,s*.1,s*.04,0,0,7);c.fill();c.strokeStyle='#e4e0d4';c.lineWidth=s*.04;c.beginPath();c.moveTo(nx-s*.25,s*.43);c.quadraticCurveTo(nx,s*.36,nx+s*.25,s*.43);c.stroke();}
    if(o.christ){/* the beard, short and parted, and the moustache */c.fillStyle='#3a2414';c.beginPath();c.moveTo(-s*.6,s*.2);c.quadraticCurveTo(-s*.58,s*.95,-s*.08,s*1.18);c.lineTo(0,s*1.08);c.lineTo(s*.08,s*1.18);c.quadraticCurveTo(s*.58,s*.95,s*.6,s*.2);c.quadraticCurveTo(s*.3,s*.6,0,s*.62);c.quadraticCurveTo(-s*.3,s*.6,-s*.6,s*.2);c.fill();
      c.strokeStyle='#3a2414';c.lineWidth=s*.07;c.beginPath();c.moveTo(nx-s*.28,s*.5);c.quadraticCurveTo(nx,s*.36,nx+s*.28,s*.5);c.stroke();c.fillStyle='#8a3a2a';c.beginPath();c.ellipse(nx,s*.52,s*.1,s*.035,0,0,7);c.fill();}
    if(o.bald){/* the high bald crown, a fringe of white hair at the temples */c.fillStyle='rgba(204,160,104,.6)';c.beginPath();c.ellipse(0,-s*.75,s*.62,s*.34,0,Math.PI,0);c.fill();c.fillStyle='#d8d4c8';[-1,1].forEach(k=>{c.beginPath();c.ellipse(k*s*.72,-s*.1,s*.12,s*.36,0,0,7);c.fill();});}
    c.restore();};
  /* a gold halo: the leaf burnished, a tooled double line round it */
  const halo=(c,x,y,r,cross)=>{const g=c.createRadialGradient(x-r*.3,y-r*.3,r*.1,x,y,r);g.addColorStop(0,'#f2d27a');g.addColorStop(.7,'#d6a848');g.addColorStop(1,'#a8782a');c.fillStyle=g;c.beginPath();c.arc(x,y,r,0,7);c.fill();
    c.strokeStyle='#7a4a18';c.lineWidth=2.4;c.beginPath();c.arc(x,y,r,0,7);c.stroke();c.lineWidth=1.2;c.beginPath();c.arc(x,y,r-6,0,7);c.stroke();
    if(cross){c.strokeStyle='#8a2a1a';c.lineWidth=r*.16;[[0,-1],[1,0],[-1,0]].forEach(([dx,dy])=>{c.beginPath();c.moveTo(x+dx*r*.45,y+dy*r*.45);c.lineTo(x+dx*r*.95,y+dy*r*.95);c.stroke();});
      c.fillStyle='#f4e6c0';c.font=`bold ${r*.24|0}px serif`;c.textAlign='center';c.textBaseline='middle';c.fillText('Ο',x-r*.7,y-r*.25);c.fillText('Ω',x,y-r*.72);c.fillText('Ν',x+r*.7,y-r*.25);}};
  /* garments: a field of colour with its folds as dark strokes and the gold assist hatched over the lights */
  const robe=(c,path,base,dark,gold)=>{c.save();path();c.clip();c.fillStyle=base;c.fillRect(0,0,W,Hh);c.strokeStyle=dark;c.lineWidth=4;c.globalAlpha=.6;
    const q=rng(base.length*7+(gold?gold.length:3));for(let i=0;i<22;i++){const x=q()*W,y=q()*Hh;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+(q()-.5)*60,y+40,x+(q()-.5)*30,y+90+q()*60);c.stroke();}
    if(gold){c.globalAlpha=.75;c.strokeStyle=gold;c.lineWidth=1.2;for(let i=0;i<70;i++){const x=q()*W,y=q()*Hh,a=-.8+q()*.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*14,y+Math.sin(a)*14);c.stroke();}}c.restore();};
  const ground=(c,q)=>{/* the gilded ground and the raised border (luzga and polya) */const g=c.createLinearGradient(0,0,W,Hh);g.addColorStop(0,'#d8ae58');g.addColorStop(.5,'#e8c472');g.addColorStop(1,'#c09440');c.fillStyle=g;c.fillRect(0,0,W,Hh);
    for(let i=0;i<500;i++){c.fillStyle=`rgba(${q()<.5?120:255},${q()<.5?80:240},${q()<.5?30:180},${q()*.12})`;c.fillRect(q()*W,q()*Hh,2+q()*6,1);}
    c.strokeStyle='#8a2a1a';c.lineWidth=4;c.strokeRect(26,26,W-52,Hh-52);c.strokeStyle='rgba(90,50,20,.6)';c.lineWidth=2;c.strokeRect(32,32,W-64,Hh-64);};
  const letters=(c,a,b,y)=>{c.fillStyle='#9a1e12';c.font='bold 30px serif';c.textAlign='center';c.textBaseline='middle';c.fillText(a,W*.2,y);c.fillText(b,W*.8,y);c.strokeStyle='#9a1e12';c.lineWidth=2;[W*.2,W*.8].forEach(x=>{c.beginPath();c.moveTo(x-18,y-20);c.lineTo(x+18,y-20);c.stroke();});};
  /* the age of it: the drying oil gone brown, craquelure, a candle's soot near the top, the edges worn to the gesso */
  const age=(c,q)=>{c.fillStyle='rgba(90,58,18,.22)';c.fillRect(0,0,W,Hh);const g=c.createRadialGradient(W/2,Hh/2,W*.2,W/2,Hh/2,W*.85);g.addColorStop(0,'rgba(60,36,10,0)');g.addColorStop(1,'rgba(40,24,8,.45)');c.fillStyle=g;c.fillRect(0,0,W,Hh);
    const sg=c.createLinearGradient(0,0,0,Hh*.3);sg.addColorStop(0,'rgba(20,14,8,.35)');sg.addColorStop(1,'rgba(20,14,8,0)');c.fillStyle=sg;c.fillRect(0,0,W,Hh*.3);
    c.strokeStyle='rgba(40,24,10,.28)';c.lineWidth=.7;for(let i=0;i<260;i++){let x=q()*W,y=q()*Hh;c.beginPath();c.moveTo(x,y);for(let k=0;k<3;k++){x+=(q()-.5)*16;y+=(q()-.5)*16;c.lineTo(x,y);}c.stroke();}
    c.fillStyle='rgba(236,226,200,.5)';for(let i=0;i<40;i++){const e=q()*4|0,t=q();const x=e===0?t*W:e===1?t*W:e===2?q()*8:W-q()*8,y=e===0?q()*8:e===1?Hh-q()*8:t*Hh;c.fillRect(x,y,3+q()*8,2+q()*3);}};
  const paint={
    /* the Kazan Mother of God: half-length, her head inclined toward the Child, who stands at her left blessing */
    kazan(c){const q=rng(11);ground(c,q);halo(c,W*.44,Hh*.36,92,false);halo(c,W*.66,Hh*.6,52,true);
      robe(c,()=>{c.beginPath();c.moveTo(W*.1,Hh*.95);c.quadraticCurveTo(W*.08,Hh*.52,W*.26,Hh*.36);c.quadraticCurveTo(W*.44,Hh*.18,W*.62,Hh*.34);c.quadraticCurveTo(W*.74,Hh*.5,W*.8,Hh*.95);c.closePath();},'#6a1e18','#2e0c08','#e0b860');
      c.strokeStyle='#e0b860';c.lineWidth=5;c.beginPath();c.moveTo(W*.26,Hh*.38);c.quadraticCurveTo(W*.44,Hh*.22,W*.6,Hh*.36);c.stroke();
      [[W*.44,Hh*.25],[W*.24,Hh*.56],[W*.66,Hh*.52]].forEach(([x,y])=>{c.fillStyle='#f0d070';c.beginPath();for(let k=0;k<16;k++){const a=k/16*Math.PI*2,r=k%2?4:11;c.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}c.fill();});
      c.fillStyle='#1e2e5a';c.beginPath();c.ellipse(W*.44,Hh*.33,52,40,.1,Math.PI,0);c.fill();
      face(c,W*.45,Hh*.37,46,{turn:.35});
      robe(c,()=>{c.beginPath();c.moveTo(W*.52,Hh*.95);c.lineTo(W*.54,Hh*.68);c.quadraticCurveTo(W*.66,Hh*.62,W*.78,Hh*.68);c.lineTo(W*.82,Hh*.95);c.closePath();},'#b8862e','#5a3a10','#f6e0a0');
      face(c,W*.66,Hh*.59,26,{turn:-.2});c.fillStyle='#d8a870';c.beginPath();c.ellipse(W*.6,Hh*.73,10,14,0,0,7);c.fill();
      letters(c,'ΜΡ','ΘΥ',Hh*.11);c.font='bold 22px serif';c.fillStyle='#9a1e12';c.fillText('ΙΣ',W*.56,Hh*.5);c.fillText('ΧΣ',W*.78,Hh*.5);age(c,q);},
    /* Christ Pantocrator: frontal, half-length, blessing with the right hand, the Gospel closed in the left */
    christ(c){const q=rng(23);ground(c,q);halo(c,W/2,Hh*.33,104,true);
      robe(c,()=>{c.beginPath();c.moveTo(W*.1,Hh*.96);c.quadraticCurveTo(W*.12,Hh*.56,W*.36,Hh*.5);c.lineTo(W*.64,Hh*.5);c.quadraticCurveTo(W*.88,Hh*.56,W*.9,Hh*.96);c.closePath();},'#7a2216','#34100a','#e6c070');
      robe(c,()=>{c.beginPath();c.moveTo(W*.1,Hh*.96);c.quadraticCurveTo(W*.14,Hh*.6,W*.4,Hh*.56);c.quadraticCurveTo(W*.36,Hh*.8,W*.56,Hh*.96);c.closePath();},'#1e3a6a','#0a1630',null);
      c.fillStyle='#3a2414';c.beginPath();c.ellipse(W/2,Hh*.3,60,76,0,Math.PI*1.05,-.05);c.fill();[-1,1].forEach(k=>{c.beginPath();c.ellipse(W/2+k*52,Hh*.42,16,46,k*.1,0,7);c.fill();});
      face(c,W/2,Hh*.33,48,{christ:true});
      /* the Gospel: red cover, gold clasps and corners */c.fillStyle='#8a1e14';c.fillRect(W*.6,Hh*.66,W*.22,Hh*.22);c.strokeStyle='#e0b860';c.lineWidth=4;c.strokeRect(W*.62,Hh*.68,W*.18,Hh*.18);c.fillStyle='#e0b860';c.beginPath();c.arc(W*.71,Hh*.77,10,0,7);c.fill();
      /* the blessing hand */c.fillStyle='#c09060';c.beginPath();c.ellipse(W*.32,Hh*.7,18,24,-.3,0,7);c.fill();c.strokeStyle='#6a4a2a';c.lineWidth=2;for(let k=0;k<3;k++){c.beginPath();c.moveTo(W*.3+k*6,Hh*.68);c.lineTo(W*.3+k*6,Hh*.62);c.stroke();}
      letters(c,'ΙΣ','ΧΣ',Hh*.11);age(c,q);},
    /* St Nicholas: the elder bishop, bald brow and short white beard, the white omophorion with its black crosses over a
       red phelonion, the Gospel in his left hand; Christ and the Mother of God in the clouds at either shoulder */
    nicholas(c){const q=rng(37);ground(c,q);halo(c,W/2,Hh*.34,98,false);
      robe(c,()=>{c.beginPath();c.moveTo(W*.08,Hh*.96);c.quadraticCurveTo(W*.1,Hh*.56,W*.36,Hh*.52);c.lineTo(W*.64,Hh*.52);c.quadraticCurveTo(W*.9,Hh*.56,W*.92,Hh*.96);c.closePath();},'#8a2a1a','#3a0e08','#e6c070');
      c.fillStyle='#ece6d4';c.beginPath();c.moveTo(W*.28,Hh*.55);c.quadraticCurveTo(W/2,Hh*.66,W*.72,Hh*.55);c.lineTo(W*.6,Hh*.62);c.lineTo(W*.56,Hh*.96);c.lineTo(W*.44,Hh*.96);c.lineTo(W*.4,Hh*.62);c.closePath();c.fill();
      c.fillStyle='#1a1410';const cr=(x,y,r)=>{c.fillRect(x-r*.2,y-r,r*.4,r*2);c.fillRect(x-r,y-r*.2,r*2,r*.4);};cr(W*.36,Hh*.585,11);cr(W*.64,Hh*.585,11);cr(W*.5,Hh*.76,12);cr(W*.5,Hh*.88,12);
      face(c,W/2,Hh*.35,46,{old:true,bald:true});
      c.fillStyle='#7a1e14';c.fillRect(W*.64,Hh*.7,W*.2,Hh*.2);c.strokeStyle='#e0b860';c.lineWidth=4;c.strokeRect(W*.66,Hh*.72,W*.16,Hh*.16);
      [[W*.17,Hh*.2],[W*.83,Hh*.2]].forEach(([x,y],k)=>{c.fillStyle='rgba(120,150,170,.5)';c.beginPath();c.arc(x,y,34,0,7);c.fill();halo(c,x,y-4,20,k===0);face(c,x,y-4,12,{christ:k===0});});
      c.fillStyle='#9a1e12';c.font='bold 22px serif';c.textAlign='center';c.fillText('СВ. НИКОЛАЙ',W/2,Hh*.11);age(c,q);}};
  /* the real icon, where there is one (07zf0_iconimg): the photograph drawn over the painted stand-in once it has decoded,
     then aged as a household icon ages - the drying-oil varnish gone amber and dark, soot from a century of the lamp
     settled thickest at the top, the craquelure, the edges rubbed by hands and the odd flake of gesso lost */
  const photo=(c,im,kind)=>{c.drawImage(im,0,0,W,Hh);const q=rng(kind.length*91+7);
    c.globalCompositeOperation='multiply';c.fillStyle='rgba(214,176,118,.55)';c.fillRect(0,0,W,Hh);
    const sg=c.createLinearGradient(0,0,0,Hh);sg.addColorStop(0,'rgba(70,52,34,.55)');sg.addColorStop(.45,'rgba(150,120,90,.12)');sg.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=sg;c.fillRect(0,0,W,Hh);
    const vg=c.createRadialGradient(W/2,Hh/2,Hh*.3,W/2,Hh/2,Hh*.72);vg.addColorStop(0,'rgba(255,255,255,0)');vg.addColorStop(1,'rgba(60,40,24,.55)');c.fillStyle=vg;c.fillRect(0,0,W,Hh);c.globalCompositeOperation='source-over';
    c.strokeStyle='rgba(40,26,14,.2)';c.lineWidth=.7;for(let i=0;i<260;i++){let x=q()*W,y=q()*Hh;c.beginPath();c.moveTo(x,y);for(let k=0;k<4;k++){x+=(q()-.5)*12;y+=(q()-.5)*12;c.lineTo(x,y);}c.stroke();}
    c.fillStyle='rgba(210,196,160,.75)';for(let i=0;i<26;i++){const e=q()<.5,x=e?(q()<.5?q()*14:W-q()*14):q()*W,y=e?q()*Hh:(q()<.5?q()*14:Hh-q()*14);c.beginPath();c.ellipse(x,y,1+q()*4,1+q()*3,q()*3,0,7);c.fill();}
    c.fillStyle='rgba(255,236,190,.05)';c.fillRect(0,0,W,Hh);};
  const hasPhoto=kind=>typeof ICONIMG!=='undefined'&&!!ICONIMG[kind];
  const texOf=kind=>memo('icon_'+kind,()=>{let ctx=null;const t=tex(W,Hh,(c)=>{ctx=c;paint[kind](c);},{clamp:true});
    if(hasPhoto(kind)&&ctx){const im=new Image();im.onload=()=>{try{photo(ctx,im,kind);t.needsUpdate=true;}catch(e){console.warn('icon',e);}};im.src=ICONIMG[kind];}return t;});
  /* the stamped brass cover over the painting, cut away at the faces and hands, its repoussé scrollwork catching the lamp */
  const rizaTex=kind=>memo('riza_'+kind,()=>tex(W,Hh,(c)=>{const q=rng(kind.length*17);const g=c.createLinearGradient(0,0,W,Hh);g.addColorStop(0,'#c8a050');g.addColorStop(.5,'#e8cc80');g.addColorStop(1,'#a87c30');c.fillStyle=g;c.fillRect(0,0,W,Hh);
      c.strokeStyle='rgba(110,70,20,.7)';c.lineWidth=2;for(let i=0;i<160;i++){const x=q()*W,y=q()*Hh,r=6+q()*14;c.beginPath();c.arc(x,y,r,q()*6,q()*6+3);c.stroke();}c.fillStyle='rgba(255,240,200,.35)';for(let i=0;i<300;i++){c.beginPath();c.arc(q()*W,q()*Hh,1+q()*2,0,7);c.fill();}
      c.globalCompositeOperation='destination-out';const cut=(x,y,rx,ry)=>{c.beginPath();c.ellipse(x,y,rx,ry,0,0,7);c.fill();};
      if(hasPhoto(kind)){/* (a basma: the stamped brass over the margins only, the whole painting showing in its window) */const m=W*.085;c.fillStyle='#000';c.beginPath();c.moveTo(m,m+12);c.quadraticCurveTo(m,m,m+12,m);c.lineTo(W-m-12,m);c.quadraticCurveTo(W-m,m,W-m,m+12);c.lineTo(W-m,Hh-m-12);c.quadraticCurveTo(W-m,Hh-m,W-m-12,Hh-m);c.lineTo(m+12,Hh-m);c.quadraticCurveTo(m,Hh-m,m,Hh-m-12);c.closePath();c.fill();c.globalCompositeOperation='source-over';
        c.strokeStyle='rgba(90,56,16,.8)';c.lineWidth=3;c.strokeRect(m-2,m-2,W-2*m+4,Hh-2*m+4);return;}
      if(kind==='kazan'){cut(W*.45,Hh*.37,40,50);cut(W*.66,Hh*.59,23,28);}else if(kind==='christ'){cut(W/2,Hh*.34,44,54);cut(W*.32,Hh*.7,18,24);}else{cut(W/2,Hh*.35,42,54);}c.globalCompositeOperation='source-over';},{clamp:true}));
  const board=memo('iconBoard',()=>std({map:RF.W2.map,color:C(0x7a5a3a),roughness:.7,envMapIntensity:.3}));
  /* one icon: the board with its recessed field (kovcheg), the painting, the riza if it has one */
  const icon=(par,x,y,z,ry,kind,w,rz)=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;par.add(g);const h=w*Hh/W;
    mesh(rbox(w+.03,h+.03,.025,.004),board,0,0,-.0125,g);const pm=mesh(new T.PlaneGeometry(w,h),memo('iconM_'+kind,()=>std({map:texOf(kind),roughness:.42,metalness:.15,envMapIntensity:.55})),0,0,.0015,g,false);
    if(rz){mesh(new T.PlaneGeometry(w,h),memo('rizaM_'+kind,()=>std({map:rizaTex(kind),transparent:true,alphaTest:.5,metalness:.9,roughness:.32,envMapIntensity:1.2})),0,0,.004,g,false);}
    [[0,h/2+.008,w+.04,.016],[0,-h/2-.008,w+.04,.016],[-w/2-.008,0,.016,h],[w/2+.008,0,.016,h]].forEach(b=>mesh(rbox(b[2],b[3],.03,.004),board,b[0],b[1],0,g));return g;};
  /* the embroidered towel: white linen, its ends worked in red cross-stitch - a band of the tree of life and the bird, lace
     at the edge - hung over the top of the case and falling down both sides */
  const towelT=memo('rushnyk',()=>tex(128,512,(c,w,h)=>{c.fillStyle='#ece6d8';c.fillRect(0,0,w,h);c.fillStyle='#a8201a';const st=(x,y)=>{c.fillRect(x,y,3,3);};
      for(const y0 of [24,h-120]){for(let i=0;i<40;i++){const x=8+(i%13)*9,y=y0+Math.floor(i/13)*9;if((i*7)%3)st(x,y);}for(let k=0;k<5;k++){const cx=w/2,cy=y0+40+k*14;for(let d=-k*3;d<=k*3;d+=3){st(cx+d*2,cy);}}
        c.fillStyle='#2a2a2a';for(let i=0;i<w;i+=6)c.fillRect(i,y0+100,3,3);c.fillStyle='#a8201a';}
      c.globalCompositeOperation='destination-out';for(let i=0;i<w;i+=8){c.beginPath();c.arc(i+4,h-4,3,0,7);c.fill();c.beginPath();c.arc(i+4,3,3,0,7);c.fill();}c.globalCompositeOperation='source-over';
      FAB.grain(c,w,h,{seed:77,weave:.08,dye:.04});},{clamp:true}));
  /* the corner: a triangular shelf on brackets, the case, two or three icons, the towel, the lamp, the willow */
  const corner=(par,x,y,z,ry,o={})=>{const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;par.add(g);const wd=memo('kiotWood',()=>std({map:RF.W3.map,color:C(0x6a4a30),roughness:.45,envMapIntensity:.45}));
    /* (local frame: the corner is at the origin, the two walls along -x+z and +x+z at 45 degrees; the case faces +z) */
    const sh=new T.Shape();sh.moveTo(0,-.02);sh.lineTo(.36,.34);sh.quadraticCurveTo(0,.46,-.36,.34);sh.closePath();const sg=new T.ExtrudeGeometry(sh,{depth:.03,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1});sg.rotateX(Math.PI/2);mesh(sg,wd,0,0,0,g);
    [-1,1].forEach(k=>{const br=new T.Shape();br.moveTo(0,0);br.lineTo(.16,0);br.quadraticCurveTo(.04,-.04,0,-.16);br.closePath();const bg=new T.ExtrudeGeometry(br,{depth:.018,bevelEnabled:false});const m=mesh(bg,wd,k*.12,-.005,.13,g);m.rotation.y=k>0?-Math.PI/4:Math.PI*1.25;});
    const kinds=o.kinds||['kazan','christ'];const n=kinds.length,cw=n===3?.62:.46;
    /* the case: back, sides, a carved arched top, glazed front door */const kg=new T.Group();kg.position.set(0,.03,.32);g.add(kg);
    mesh(rbox(cw,.42,.02,.004),wd,0,.21,-.06,kg);[-1,1].forEach(k=>mesh(rbox(.025,.44,.1,.004),wd,k*(cw/2),.22,-.015,kg));mesh(rbox(cw+.04,.025,.11,.004),wd,0,.005,-.015,kg);
    const top=new T.Shape();top.moveTo(-cw/2-.03,0);top.lineTo(cw/2+.03,0);top.lineTo(cw/2+.03,.04);top.quadraticCurveTo(cw/4,.06,0,.13);top.quadraticCurveTo(-cw/4,.06,-cw/2-.03,.04);top.closePath();
    const th=new T.Path();th.absarc(0,.06,.025,0,Math.PI*2,true);top.holes.push(th);const tg=new T.ExtrudeGeometry(top,{depth:.11,bevelEnabled:true,bevelThickness:.004,bevelSize:.004,bevelSegments:1,curveSegments:12});tg.translate(0,0,-.07);mesh(tg,wd,0,.43,0,kg);
    kinds.forEach((k,i)=>icon(kg,(i-(n-1)/2)*(cw/n),.22,-.04,0,k,cw/n-.04,o.riza&&i!==1));
    [[0,.42,cw,.02],[0,.02,cw,.02],[-cw/2+.01,.22,.02,.4],[cw/2-.01,.22,.02,.4]].forEach(b=>mesh(rbox(b[2],b[3],.015,.003),wd,b[0],b[1],.04,kg));mesh(new T.PlaneGeometry(cw-.02,.38),M.glass,0,.22,.038,kg,false);
    /* the towel over the top, its embroidered ends hanging down either side of the case */
    {const tm=memo('rushM',()=>std({map:towelT,alphaTest:.4,side:T.DoubleSide,roughness:.95,envMapIntensity:.15}));[-1,1].forEach(k=>{const pg=new T.PlaneGeometry(.13,.62,2,16);const P=pg.attributes.position;for(let i=0;i<P.count;i++){const yy=P.getY(i);P.setZ(i,Math.sin((yy+.31)*6)*.012+(yy>.22?(yy-.22)*-.5:0));}pg.computeVertexNormals();
      const m=mesh(pg,tm,k*(cw/2+.05),.3,.38,g,false);m.rotation.y=-k*.25;});const sw=new T.PlaneGeometry(cw+.2,.16,12,2);{const P=sw.attributes.position;for(let i=0;i<P.count;i++){const xx=P.getX(i);P.setZ(i,-Math.abs(xx)*.08);P.setY(i,P.getY(i)-Math.cos(xx/(cw/2+.1)*1.57)*.05);}sw.computeVertexNormals();}mesh(sw,tm,0,.52,.36,g,false);}
    /* the pussy-willow sprig tucked behind the case */{const wl=memo('willow',()=>std({color:C(0x5a3a2a),roughness:.8})),cat=memo('catkin',()=>std({color:C(0xd8d2c4),roughness:1}));for(let k=0;k<3;k++){const a=-.3+k*.3,L=.4;const st=new T.CylinderGeometry(.003,.004,L,5);st.translate(0,L/2,0);const m=mesh(st,wl,cw/2-.04,.05,.24,g);m.rotation.set(-.2,0,a);
      for(let j=0;j<5;j++){const t=.15+j*.17;const b=mesh(new T.SphereGeometry(.009,6,5),cat,cw/2-.04-Math.sin(a)*L*t,.05+Math.cos(a)*L*t,.24-.2*L*t*.2,g);b.scale.y=1.6;}}}
    return g;};
  return{texOf,icon,corner};})();
