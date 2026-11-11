/* ---------- textiles and papers for the houses, painted at a resolution that holds up at arm's length: the wool wall
   carpet, the bed covers (patchwork, a woven wool check, crochet over a pink lining), the plush tablecloth and its
   fringe, the crocheted doily, the wallpapers. Each drawn with the canvas's own anti-aliasing and then given a fine
   cloth grain - a weave of warp and weft, a soft unevenness of dye, wear - from smooth noise, never per-pixel static
   (which is what read as blocky pixels up close). ---------- */
const FAB=(()=>{
  /* the cloth grain: every pixel lifted or dropped a little by the over-under of the weave, a slow unevenness of dye
     and, for pile (carpet, plush), a soft nap */
  const grain=(c,w,h,o={})=>{const im=c.getImageData(0,0,w,h),d=im.data,seed=o.seed||1,wv=o.weave===undefined?.05:o.weave,dy=o.dye===undefined?.08:o.dye,nap=o.nap||0,per=o.per||8;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4;if(d[i+3]===0)continue;
      const weave=((x>>(o.cell||0))+(y>>(o.cell||0)))&1?wv:-wv;const slow=(fbmT(x/w+seed*.13,y/h,per,3)-.5)*2*dy;const fine=nap?(vnP(x*.5+seed,y*.5,w*.5)-.5)*nap:0;
      const k=1+weave*.5+slow+fine;d[i]=Math.min(255,d[i]*k);d[i+1]=Math.min(255,d[i+1]*k);d[i+2]=Math.min(255,d[i+2]*k);}
    c.putImageData(im,0,0);};
  const rep=t=>{t.wrapS=t.wrapT=T.RepeatWrapping;return t;};
  /* ===== the wall carpet: a wool pile rug of the sort every house hung over the bed - borders of rosettes and guard
     stripes, a red field strewn with small flowers, a stepped central medallion and corner pieces ===== */
  const carpet=seed=>memo('fabCarpet'+seed%3,()=>{const pal=[{f:'#7a1f1c',d:'#3e0f10',b:'#1d2a44',g:'#d8c39a',a:'#b5442e',e:'#2f5a4a'},{f:'#5a1e2a',d:'#2a0e16',b:'#2a3a2a',g:'#e0cfa4',a:'#9a3a2a',e:'#3a4a7a'},{f:'#253658',d:'#121a2c',b:'#6e1c1a',g:'#dcc89c',a:'#a8402a',e:'#4a6a4a'}][seed%3];
    return tex(512,768,(c,w,h)=>{const q=rng(900+seed);c.fillStyle=pal.f;c.fillRect(0,0,w,h);
      /* outer border: a dark band carrying a chain of rosettes, guard stripes either side */
      const band=(m,wd,col)=>{c.fillStyle=col;c.fillRect(m,m,w-2*m,wd);c.fillRect(m,h-m-wd,w-2*m,wd);c.fillRect(m,m,wd,h-2*m);c.fillRect(w-m-wd,m,wd,h-2*m);};
      band(0,10,pal.d);band(10,4,pal.g);band(14,44,pal.b);band(58,4,pal.g);band(62,8,pal.a);band(70,3,pal.g);
      const rosette=(x,y,r,c1,c2)=>{c.fillStyle=c1;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;c.beginPath();c.ellipse(x+Math.cos(a)*r*.55,y+Math.sin(a)*r*.55,r*.42,r*.2,a,0,7);c.fill();}c.fillStyle=c2;c.beginPath();c.arc(x,y,r*.32,0,7);c.fill();c.fillStyle=c1;c.beginPath();c.arc(x,y,r*.12,0,7);c.fill();};
      for(let x=36;x<w-20;x+=44){rosette(x,36,17,pal.g,pal.a);rosette(x,h-36,17,pal.g,pal.a);}for(let y=80;y<h-60;y+=44){rosette(36,y,17,pal.g,pal.a);rosette(w-36,y,17,pal.g,pal.a);}
      /* the guard stripe's little zigzag */c.strokeStyle=pal.g;c.lineWidth=2;c.beginPath();for(let x=70;x<w-70;x+=8){c.lineTo(x,66+(x/8%2?-2:2));}c.stroke();c.beginPath();for(let x=70;x<w-70;x+=8){c.lineTo(x,h-66+(x/8%2?-2:2));}c.stroke();
      /* the field: small flowers in a half-drop repeat */
      for(let y=90;y<h-80;y+=36)for(let x=90+((y/36|0)%2)*24;x<w-80;x+=48){const s=4+q()*1.5;c.fillStyle=q()<.5?pal.g:pal.e;for(let k=0;k<4;k++){const a=k/4*Math.PI*2+.4;c.beginPath();c.ellipse(x+Math.cos(a)*s,y+Math.sin(a)*s,s*.8,s*.4,a,0,7);c.fill();}c.fillStyle=pal.a;c.beginPath();c.arc(x,y,s*.45,0,7);c.fill();}
      /* the central medallion: a stepped lozenge in three layers with hooks on its edges, a star in the middle */
      const cx=w/2,cy=h/2;const loz=(rx,ry,col,step)=>{c.fillStyle=col;c.beginPath();const n=8;for(let k=0;k<=n;k++){const t=k/n;c.lineTo(cx+rx*t,cy-ry*(1-t)-(k%2?step:0));}for(let k=n;k>=0;k--){const t=k/n;c.lineTo(cx+rx*t,cy+ry*(1-t)+(k%2?step:0));}
        for(let k=0;k<=n;k++){const t=k/n;c.lineTo(cx-rx*t,cy+ry*(1-t)+(k%2?step:0));}for(let k=n;k>=0;k--){const t=k/n;c.lineTo(cx-rx*t,cy-ry*(1-t)-(k%2?step:0));}c.closePath();c.fill();};
      loz(170,250,pal.g,8);loz(150,226,pal.b,7);loz(118,180,pal.a,6);loz(80,124,pal.d,5);loz(46,70,pal.g,4);
      c.fillStyle=pal.b;for(let k=0;k<8;k++){const a=k/8*Math.PI*2;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*30,cy+Math.sin(a)*42);c.lineTo(cx+Math.cos(a+.39)*12,cy+Math.sin(a+.39)*16);c.closePath();c.fill();}
      /* hooks along the medallion's edge */c.strokeStyle=pal.g;c.lineWidth=3;for(let k=1;k<8;k++){const t=k/8;[[1,-1],[1,1],[-1,1],[-1,-1]].forEach(([sx,sy])=>{const x=cx+sx*170*t,y=cy+sy*250*(1-t);c.beginPath();c.moveTo(x,y);c.lineTo(x+sx*10,y+sy*6);c.lineTo(x+sx*10,y+sy*14);c.stroke();});}
      /* corner pieces: quarter medallions */[[86,86],[w-86,86],[86,h-86],[w-86,h-86]].forEach(([x,y])=>{c.save();c.beginPath();c.rect(73,73,w-146,h-146);c.clip();c.fillStyle=pal.b;c.beginPath();c.ellipse(x<w/2?73:w-73,y<h/2?73:h-73,70,90,0,0,7);c.fill();c.fillStyle=pal.a;c.beginPath();c.ellipse(x<w/2?73:w-73,y<h/2?73:h-73,46,60,0,0,7);c.fill();c.restore();});
      /* wear: the pile flattened and faded in a few places, and the wool's nap */
      for(let i=0;i<8;i++){const x=q()*w,y=q()*h,r=40+q()*90,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(230,210,180,.08)');g.addColorStop(1,'rgba(230,210,180,0)');c.fillStyle=g;c.fillRect(0,0,w,h);}
      grain(c,w,h,{seed,weave:.07,dye:.07,nap:.12,per:6});});});
  /* ===== bed covers ===== */
  const quilt=k=>memo('fabQuilt'+k%3,()=>{k=k%3;return rep(tex(512,1024,(c,w,h)=>{const q=rng(70+k);
    if(k===0){/* patchwork: squares of dress cottons, each with its own small print, stitched together; a plain binding */
      const P=[['#8a3a32','#e8d8b8','dots'],['#c8a46a','#7a4a2a','sprig'],['#3a5a7a','#e8e0d0','check'],['#6a7a4a','#e0d8b0','dots'],['#b8865a','#5a2a1a','stripe'],['#5a3a5a','#d8c0d8','sprig'],['#d8c8a8','#8a3a32','sprig'],['#2a4a5a','#c8a46a','stripe']];
      const S=64;for(let y=0;y<h;y+=S)for(let x=0;x<w;x+=S){const [bg,fg,kind]=P[(q()*P.length)|0];c.fillStyle=bg;c.fillRect(x,y,S,S);c.save();c.beginPath();c.rect(x,y,S,S);c.clip();c.fillStyle=fg;c.strokeStyle=fg;
        if(kind==='dots')for(let yy=4;yy<S;yy+=8)for(let xx=4+(yy/8%2)*4;xx<S;xx+=8){c.beginPath();c.arc(x+xx,y+yy,1.4,0,7);c.fill();}
        else if(kind==='sprig')for(let yy=8;yy<S;yy+=16)for(let xx=8+(yy/16%2)*8;xx<S;xx+=16){for(let a=0;a<5;a++){c.beginPath();c.ellipse(x+xx+Math.cos(a*1.26)*2.4,y+yy+Math.sin(a*1.26)*2.4,1.8,1,a*1.26,0,7);c.fill();}}
        else if(kind==='check'){c.globalAlpha=.35;for(let t=0;t<S;t+=8){c.fillRect(x+t,y,3,S);c.fillRect(x,y+t,S,3);}c.globalAlpha=1;}
        else{c.lineWidth=2;for(let t=0;t<S;t+=6){c.beginPath();c.moveTo(x+t,y);c.lineTo(x+t,y+S);c.stroke();}}
        c.restore();
        /* the seam and the quilting stitches */c.strokeStyle='rgba(30,20,12,.5)';c.lineWidth=1.2;c.strokeRect(x+.5,y+.5,S-1,S-1);c.setLineDash([3,3]);c.strokeStyle='rgba(240,230,210,.5)';c.strokeRect(x+5,y+5,S-10,S-10);c.setLineDash([]);
        const g=c.createRadialGradient(x+S/2,y+S/2,S*.1,x+S/2,y+S/2,S*.75);g.addColorStop(0,'rgba(255,255,255,.07)');g.addColorStop(1,'rgba(0,0,0,.12)');c.fillStyle=g;c.fillRect(x,y,S,S);}
      grain(c,w,h,{seed:k+3,weave:.05,dye:.05});}
    else if(k===1){/* a woven wool blanket: a check of wide and narrow stripes in two colours over a deep red, twill-woven
         (the diagonal rib), a plain border band round it */
      const warp=x=>{const t=x%128;return t<40?'#6a1c18':t<52?'#1e2232':t<60?'#c89a50':t<72?'#1e2232':t<120?'#7a2420':'#1e2232';};
      const W2=document.createElement('canvas');W2.width=w;W2.height=h;const a=W2.getContext('2d');
      for(let x=0;x<w;x++){a.fillStyle=warp(x);a.fillRect(x,0,1,h);}const A=a.getImageData(0,0,w,h).data;
      for(let y=0;y<h;y++){a.fillStyle=warp(y);a.fillRect(0,y,w,1);}const B=a.getImageData(0,0,w,h).data;
      const im=c.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=(y*w+x)*4,tw=((x+y)>>1)%2===0;const s=tw?A:B,o=tw?B:A;for(let ch=0;ch<3;ch++)d[i+ch]=s[i+ch]*.78+o[i+ch]*.22;d[i+3]=255;}c.putImageData(im,0,0);
      c.strokeStyle='#d8b878';c.lineWidth=3;c.strokeRect(22,22,w-44,h-44);c.strokeStyle='#1e2232';c.lineWidth=14;c.strokeRect(8,8,w-16,h-16);
      grain(c,w,h,{seed:k+5,weave:.06,dye:.08,nap:.1});}
    else{/* white crocheted squares (granny motifs) laid over a pink cotton cover that shows through their holes */
      c.fillStyle='#d4949a';c.fillRect(0,0,w,h);const S=64;for(let y=0;y<h;y+=S)for(let x=0;x<w;x+=S){const cx=x+S/2,cy=y+S/2;c.strokeStyle='#f4f0e6';c.lineCap='round';
        c.lineWidth=3;c.strokeRect(x+3,y+3,S-6,S-6);c.lineWidth=2.4;c.strokeRect(x+9,y+9,S-18,S-18);
        for(let k2=0;k2<8;k2++){const a=k2/8*Math.PI*2;c.beginPath();c.moveTo(cx+Math.cos(a)*5,cy+Math.sin(a)*5);c.lineTo(cx+Math.cos(a)*20,cy+Math.sin(a)*20);c.stroke();}
        c.lineWidth=2;for(let r=6;r<=20;r+=7){c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();}
        for(let k2=0;k2<12;k2++){const a=k2/12*Math.PI*2;c.beginPath();c.arc(cx+Math.cos(a)*24,cy+Math.sin(a)*24,3,0,7);c.stroke();}}
      grain(c,w,h,{seed:k+7,weave:.04,dye:.06});}}));});
  /* ===== the plush tablecloth of the round table: velvet pile with a sheen that shifts, a woven border of a running
     scroll in gold thread inside the edge; and the hanging skirt with its knotted fringe ===== */
  const tableTop=col=>memo('fabTop'+col,()=>tex(512,512,(c,w,h)=>{c.fillStyle=col;c.fillRect(0,0,w,h);const cx=w/2,cy=h/2;
    const g=c.createRadialGradient(cx*.8,cy*.8,10,cx,cy,w*.55);g.addColorStop(0,'rgba(255,255,255,.08)');g.addColorStop(1,'rgba(0,0,0,.15)');c.fillStyle=g;c.fillRect(0,0,w,h);
    c.strokeStyle='rgba(222,190,110,.85)';c.lineWidth=3;[238,212].forEach(r=>{c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();});
    c.lineWidth=2.4;const n=36;for(let i=0;i<n;i++){const a0=i/n*Math.PI*2,a1=(i+1)/n*Math.PI*2;const r=225;c.beginPath();c.moveTo(cx+Math.cos(a0)*r,cy+Math.sin(a0)*r);
      c.quadraticCurveTo(cx+Math.cos((a0+a1)/2)*(r+10),cy+Math.sin((a0+a1)/2)*(r+10),cx+Math.cos(a1)*r,cy+Math.sin(a1)*r);c.stroke();
      const am=(a0+a1)/2;c.beginPath();c.arc(cx+Math.cos(am)*(r-5),cy+Math.sin(am)*(r-5),3.2,0,7);c.stroke();}
    grain(c,w,h,{seed:31,weave:.03,dye:.06,nap:.14,per:4});},{clamp:true}));
  const tableSkirt=col=>memo('fabSkirt'+col,()=>rep(tex(512,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle=col;c.fillRect(0,0,w,h-30);
    c.strokeStyle='rgba(222,190,110,.85)';c.lineWidth=2.4;c.beginPath();c.moveTo(0,h-46);c.lineTo(w,h-46);c.stroke();for(let x=0;x<w;x+=32){c.beginPath();c.moveTo(x,h-60);c.quadraticCurveTo(x+16,h-74,x+32,h-60);c.stroke();}
    /* the fringe: knotted bunches of threads */c.strokeStyle=col;c.lineWidth=1.3;for(let x=1;x<w;x+=2.6){c.beginPath();c.moveTo(x,h-31);c.quadraticCurveTo(x+(Math.sin(x)*2),h-14,x+Math.sin(x*.7)*1.5,h-1);c.stroke();}
    c.fillStyle=col;for(let x=6;x<w;x+=13){c.beginPath();c.ellipse(x,h-27,4,3,0,0,7);c.fill();}
    grain(c,w,h,{seed:33,weave:.03,dye:.05,nap:.12,per:4});})));
  /* ===== the crocheted doily: thread drawn as thread - a flower in the middle, rounds of chain arches, a ring of
     petals, fans, a picot edge; cut out by its alpha ===== */
  const lace=()=>memo('fabLace',()=>tex(512,512,(c,w,h)=>{c.clearRect(0,0,w,h);const cx=w/2,cy=h/2;c.strokeStyle='#f6f2e8';c.fillStyle='#f6f2e8';c.lineCap='round';c.lineJoin='round';
    const ring=r=>{c.lineWidth=4;c.beginPath();c.arc(cx,cy,r,0,7);c.stroke();};
    /* centre flower */for(let k=0;k<8;k++){const a=k/8*Math.PI*2;c.lineWidth=5;c.beginPath();c.ellipse(cx+Math.cos(a)*16,cy+Math.sin(a)*16,14,6,a,0,7);c.stroke();}ring(6);ring(34);
    /* chain arches */const arches=(r0,r1,n,lw)=>{c.lineWidth=lw;for(let k=0;k<n;k++){const a0=k/n*Math.PI*2,a1=(k+1)/n*Math.PI*2,am=(a0+a1)/2;c.beginPath();c.moveTo(cx+Math.cos(a0)*r0,cy+Math.sin(a0)*r0);
      c.quadraticCurveTo(cx+Math.cos(am)*r1*1.08,cy+Math.sin(am)*r1*1.08,cx+Math.cos(a1)*r0,cy+Math.sin(a1)*r0);c.stroke();}};
    arches(34,62,16,3.4);ring(64);
    /* spokes and a ring of petals */c.lineWidth=3;for(let k=0;k<24;k++){const a=k/24*Math.PI*2;c.beginPath();c.moveTo(cx+Math.cos(a)*64,cy+Math.sin(a)*64);c.lineTo(cx+Math.cos(a)*104,cy+Math.sin(a)*104);c.stroke();}
    for(let k=0;k<12;k++){const a=(k+.5)/12*Math.PI*2;c.lineWidth=4;c.beginPath();c.ellipse(cx+Math.cos(a)*90,cy+Math.sin(a)*90,16,8,a,0,7);c.stroke();}
    ring(106);arches(106,140,30,3.2);ring(142);
    /* fans */for(let k=0;k<18;k++){const a=k/18*Math.PI*2;for(let j=-2;j<=2;j++){const b=a+j*.05;c.lineWidth=3;c.beginPath();c.moveTo(cx+Math.cos(a)*144,cy+Math.sin(a)*144);c.lineTo(cx+Math.cos(b)*196,cy+Math.sin(b)*196);c.stroke();}}
    arches(196,226,36,3.6);
    /* picot edge */for(let k=0;k<72;k++){const a=k/72*Math.PI*2;c.beginPath();c.arc(cx+Math.cos(a)*238,cy+Math.sin(a)*238,4,0,7);c.lineWidth=2.6;c.stroke();}},{clamp:true}));
  /* ===== wallpaper: a paper ground with a printed sprig in a half-drop, fine pinstripes, foxed and faded ===== */
  const wallpaper=seed=>{seed=seed%4;return memo('fabWP'+seed,()=>{const P=[['#e6dec6','#8a6a4a','#5a7a4a','#b84a3a'],['#d6dfd0','#4a6a5a','#a06a5a','#2a4a6a'],['#eadac2','#7a4a3a','#4a5a7a','#b88a3a'],['#e2d6da','#6a4a5a','#5a6a4a','#8a3a4a']][seed];
    const t=tex(512,512,(c,w,h)=>{const q=rng(300+seed);c.fillStyle=P[0];c.fillRect(0,0,w,h);
      for(let x=0;x<w;x+=128){c.fillStyle='rgba(0,0,0,.035)';c.fillRect(x+56,0,16,h);c.strokeStyle=P[1];c.globalAlpha=.35;c.lineWidth=1.4;[4,124].forEach(o=>{c.beginPath();c.moveTo(x+o,0);c.lineTo(x+o,h);c.stroke();});c.globalAlpha=1;
        for(let y=0;y<h;y+=128){const cx=x+64,cy=y+((x/128)%2)*64+30;
          /* the sprig: a curved stem, paired leaves, a three-petal flower and buds */
          c.strokeStyle=P[2];c.lineWidth=2.2;c.beginPath();c.moveTo(cx,cy+40);c.bezierCurveTo(cx-10,cy+20,cx+8,cy+4,cx,cy-14);c.stroke();
          [[-1,22],[1,12],[-1,2]].forEach(([s,dy])=>{c.fillStyle=P[2];c.save();c.translate(cx+s*2,cy+dy);c.rotate(s*.9);c.beginPath();c.moveTo(0,0);c.quadraticCurveTo(s*8,-6,s*16,0);c.quadraticCurveTo(s*8,5,0,0);c.fill();c.restore();});
          c.fillStyle=P[3];for(let k=0;k<3;k++){const a=-Math.PI/2+(k-1)*.7;c.beginPath();c.ellipse(cx+Math.cos(a)*7,cy-16+Math.sin(a)*7,6,3.6,a,0,7);c.fill();}c.fillStyle=P[1];c.beginPath();c.arc(cx,cy-16,2.6,0,7);c.fill();
          [[-12,-6],[11,-4]].forEach(([dx,dy])=>{c.fillStyle=P[3];c.beginPath();c.ellipse(cx+dx,cy+dy,2.6,3.6,dx*.05,0,7);c.fill();});}}
      for(let i=0;i<18;i++){const x=q()*w,y=q()*h,r=12+q()*44,g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,'rgba(150,118,64,.10)');g.addColorStop(1,'rgba(150,118,64,0)');c.fillStyle=g;c.fillRect(x-r,y-r,2*r,2*r);}
      grain(c,w,h,{seed:seed+11,weave:0,dye:.05,per:4});});
    t.wrapS=t.wrapT=T.RepeatWrapping;return std({map:t,roughness:.85,envMapIntensity:.2});});};
  /* ===== linoleum printed as parquet: herringbone blocks in three woods, each with its printed grain, a faint gloss
     worn dull along the walking lines ===== */
  const lino=()=>memo('fabLino',()=>tex(512,512,(c,w,h)=>{const q=rng(808);c.fillStyle='#6a4428';c.fillRect(0,0,w,h);const S=64,bw=16,tones=['#8a5a34','#7a4c2c','#9a6a40','#6e4426','#84542e'];
    /* basket-weave parquet: squares of four strips, the strips turned a quarter in every other square (8 x 8 squares: tiles) */
    for(let j=0;j<8;j++)for(let i=0;i<8;i++){const x0=i*S,y0=j*S,vert=(i+j)%2===0;for(let k=0;k<4;k++){const rx=vert?x0+k*bw:x0,ry=vert?y0:y0+k*bw,rw=vert?bw:S,rh=vert?S:bw;
      c.fillStyle=tones[(q()*tones.length)|0];c.fillRect(rx,ry,rw,rh);c.strokeStyle='rgba(30,16,8,.2)';c.lineWidth=.8;
      for(let l=0;l<4;l++){c.beginPath();if(vert){const xx=rx+2+q()*(bw-4);c.moveTo(xx,ry);c.bezierCurveTo(xx+(q()-.5)*3,ry+S*.3,xx+(q()-.5)*3,ry+S*.6,xx+(q()-.5)*2,ry+S);}else{const yy=ry+2+q()*(bw-4);c.moveTo(rx,yy);c.bezierCurveTo(rx+S*.3,yy+(q()-.5)*3,rx+S*.6,yy+(q()-.5)*3,rx+S,yy+(q()-.5)*2);}c.stroke();}
      c.strokeStyle='rgba(20,10,4,.5)';c.lineWidth=1;c.strokeRect(rx+.5,ry+.5,rw-1,rh-1);}}
    grain(c,w,h,{seed:9,weave:0,dye:.07,per:3});}));
  return{grain,carpet,quilt,tableTop,tableSkirt,lace,wallpaper,lino};})();
/* the bed covers and the lace everywhere take the new cloths */
RF.quilt=k=>memo('fabQuiltM'+k%3,()=>std({map:FAB.quilt(k),roughness:.95,envMapIntensity:.15}));
RF.LACE.map=FAB.lace();RF.LACE.needsUpdate=true;
