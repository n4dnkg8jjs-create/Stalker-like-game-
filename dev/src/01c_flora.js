/* ---------- foliage and wildflower textures ----------
   Every foliage card shares one convention: the twig enters at the top centre of the image and the growth runs down
   the image, so a card hung from a branch point grows "down" its V axis. Leaves are drawn back to front, the earlier
   (inner) ones darker, so each card already carries its own self-shadowing. */
const FL_={
  leaf(g,x,y,ang,L,W,col,kind){/* one leaf: short petiole, then the blade. birch: deltoid with a drawn-out tip and a
    serrated edge; hazel: broad, rounded, heart-shaped base, doubly serrated; willow: long and narrow */
    g.save();g.translate(x,y);g.rotate(ang);g.strokeStyle='rgba(60,48,30,.9)';g.lineWidth=1.2;g.beginPath();g.moveTo(0,0);g.lineTo(0,L*.16);g.stroke();g.translate(0,L*.16);
    const n=18,pts=[];const prof=s=>kind==='hazel'?Math.pow(Math.sin(Math.PI*Math.min(1,s*1.05)),.8)*(1-.15*s):kind==='willow'?Math.sin(Math.PI*s)*.85:
      (s<.34?Math.sqrt(s/.34):Math.pow(1-(s-.34)/.66,1.05));
    for(let i=0;i<=n;i++){const s=i/n;pts.push([W/2*prof(s)+((i%2&&i<n)?W*.035:0),s*L]);}
    g.beginPath();g.moveTo(0,0);pts.forEach(p=>g.lineTo(p[0],p[1]));for(let i=n;i>=0;i--)g.lineTo(-pts[i][0],pts[i][1]);g.closePath();
    const gr=g.createLinearGradient(-W/2,0,W/2,0);gr.addColorStop(0,col[0]);gr.addColorStop(.5,col[1]);gr.addColorStop(1,col[0]);g.fillStyle=gr;g.fill();
    g.strokeStyle='rgba(235,240,190,.18)';g.lineWidth=1;g.beginPath();g.moveTo(0,0);g.lineTo(0,L*.92);g.stroke();
    g.strokeStyle='rgba(20,26,8,.25)';g.lineWidth=.8;for(let k=1;k<5;k++){const yy=L*k/5.5;g.beginPath();g.moveTo(0,yy);g.lineTo(W*.32,yy+L*.1);g.moveTo(0,yy);g.lineTo(-W*.32,yy+L*.1);g.stroke();}
    g.restore();},
  hsl(h,s,l,a=1){return `hsla(${h},${s}%,${l}%,${a})`;},
  /* a polyline twig sampled as points with directions */
  twig(x0,y0,ang,len,curve,step=4){const P=[];let x=x0,y=y0,a=ang;for(let s=0;s<=len;s+=step){P.push([x,y,a,s/len]);x+=Math.sin(a)*step;y+=Math.cos(a)*step;a+=curve*step;}return P;},
  stroke(g,P,w0,w1,col){g.strokeStyle=col;g.lineCap='round';for(let i=1;i<P.length;i++){g.lineWidth=lerp(w0,w1,P[i][3]);g.beginPath();g.moveTo(P[i-1][0],P[i-1][1]);g.lineTo(P[i][0],P[i][1]);g.stroke();}}
};
/* birch: a hanging branchlet - thin dark twigs drooping from the top, crowded with small toothed triangular leaves,
   mostly fresh yellow-green with a few already turning gold */
TX.twigBirch=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const main=FL_.twig(256,0,rnd(-.08,.08),480,rnd(-.0006,.0006));const all=[main];
  for(let i=0;i<10;i++){const p=main[Math.floor(rnd(.1,.85)*main.length)];const sd=i%2?1:-1;all.push(FL_.twig(p[0],p[1],p[2]+sd*rnd(.35,.8),rnd(110,220),-sd*rnd(.0015,.003)));}
  all.forEach((P,k)=>FL_.stroke(g,P,k?2.2:3.2,.9,'#3b2d22'));
  const L=[];all.forEach((P,k)=>{for(let i=3;i<P.length;i+=rnd(4,6)|0){const p=P[i];[-1,1].forEach(sd=>L.push([p[0],p[1],p[2]+sd*rnd(.5,1.1)+rnd(-.2,.2)]));}});
  L.sort(()=>R()-.5);L.forEach((l,i)=>{const d=.7+.3*i/L.length;const t=R();let hh,ss,ll;if(t<.78){hh=rnd(64,86);ss=rnd(40,56);ll=rnd(34,46);}else if(t<.95){hh=rnd(47,56);ss=rnd(60,75);ll=rnd(44,54);}else{hh=rnd(34,42);ss=rnd(45,55);ll=rnd(34,42);}
    const Ls=rnd(34,48);FL_.leaf(g,l[0],l[1],-l[2],Ls,Ls*rnd(.6,.72),[FL_.hsl(hh,ss,ll*d*.82),FL_.hsl(hh,ss,ll*d)],'birch');});},{clamp:true});
/* spruce: a flat shoot - a stiff central twig with side twiglets angled forward, every twig densely clothed in short
   stiff needles, dark blue-green, with paler new growth at the tips */
TX.spray=tex(256,512,(g,w,h)=>{g.clearRect(0,0,w,h);const main=FL_.twig(128,0,rnd(-.04,.04),500,0,3);const all=[[main,0]];
  for(let y=24;y<470;y+=rnd(18,26)){const p=main[Math.min(main.length-1,Math.round(y/3))];const sd=(Math.round(y/22))%2?1:-1;const L=(1-y/600)*112+18;all.push([FL_.twig(p[0],p[1],p[2]+sd*rnd(.75,.95),L,-sd*.002,3),1]);}
  all.forEach(([P,k])=>FL_.stroke(g,P,k?2:3.6,1,'#3a2a1c'));
  for(let pass=0;pass<2;pass++)all.forEach(([P,k])=>{P.forEach((p,i)=>{const tip=p[3]>.72;const n=pass?1:3;for(let j=0;j<n;j++){const a=p[2]+(R()<.5?-1:1)*rnd(.5,1.4),l=rnd(9,15)*(k?1:1.15);
    const hh=tip?rnd(110,128):rnd(148,168),ss=tip?rnd(34,44):rnd(22,34),ll=tip?rnd(30,37):rnd(16,26)+pass*4;g.strokeStyle=FL_.hsl(hh,ss,ll);g.lineWidth=1.7;
    g.beginPath();g.moveTo(p[0],p[1]);g.lineTo(p[0]+Math.sin(a)*l,p[1]+Math.cos(a)*l);g.stroke();}});});},{clamp:true});
/* Scots pine: a twig forking into three or four brushes of long paired grey-green needles */
TX.tuft=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const stem=FL_.twig(256,0,0,150,rnd(-.001,.001),4);FL_.stroke(g,stem,7,4,'#5a3e28');const e=stem[stem.length-1];
  const tips=[-.62,-.2,.2,.62].map(a=>{const P=FL_.twig(e[0],e[1],a+rnd(-.1,.1),rnd(110,170),rnd(-.001,.001),4);FL_.stroke(g,P,4,2,'#5a3e28');return P;});
  tips.forEach(P=>{for(let i=Math.floor(P.length*.25);i<P.length;i++){const p=P[i];for(let j=0;j<7;j++){const a=p[2]+rnd(-1.05,1.05),l=rnd(55,105)*(.6+.4*p[3]);
    g.strokeStyle=FL_.hsl(rnd(92,118),rnd(16,28),rnd(26,42));g.lineWidth=rnd(1.8,2.6);g.beginPath();g.moveTo(p[0],p[1]);g.quadraticCurveTo(p[0]+Math.sin(a)*l*.5+rnd(-4,4),p[1]+Math.cos(a)*l*.5,p[0]+Math.sin(a)*l,p[1]+Math.cos(a)*l);g.stroke();}}});},{clamp:true});
/* hazel / alder undergrowth: broad rounded toothed leaves on arching shoots */
TX.twigBush=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);const main=FL_.twig(256,0,rnd(-.1,.1),470,rnd(-.0008,.0008));const all=[main];
  for(let i=0;i<7;i++){const p=main[Math.floor(rnd(.12,.8)*main.length)];const sd=i%2?1:-1;all.push(FL_.twig(p[0],p[1],p[2]+sd*rnd(.4,.85),rnd(120,210),-sd*.0015));}
  all.forEach((P,k)=>FL_.stroke(g,P,k?2.6:3.6,1.2,'#4a3828'));
  const L=[];all.forEach(P=>{for(let i=4;i<P.length;i+=rnd(7,10)|0){const p=P[i];[-1,1].forEach(sd=>L.push([p[0],p[1],p[2]+sd*rnd(.6,1.2)]));}});
  L.sort(()=>R()-.5);L.forEach((l,i)=>{const d=.74+.26*i/L.length;const hh=rnd(68,92),ss=rnd(36,52),ll=rnd(34,46);const Ls=rnd(46,62);
    FL_.leaf(g,l[0],l[1],-l[2],Ls,Ls*rnd(.72,.86),[FL_.hsl(hh,ss,ll*d*.8),FL_.hsl(hh,ss,ll*d)],'hazel');});},{clamp:true});
/* wildflowers of the abandoned fields, one species per cell of a 6 x 1 atlas (256 x 512 each), stems rooted at the
   bottom: chamomile, cornflower, yarrow, tansy, fireweed, red clover */
TX.flowers=tex(1536,512,(g,w,h)=>{g.clearRect(0,0,w,h);
  const stem=(x0,len,lean)=>{const P=FL_.twig(x0,512,Math.PI+lean,len,rnd(-.0012,.0012),5);FL_.stroke(g,P,2.4,1.4,FL_.hsl(rnd(85,100),rnd(30,42),rnd(24,32)));return P;};
  const leafy=(P,n,len,wid,hh)=>{for(let i=0;i<n;i++){const p=P[Math.floor(rnd(.05,.7)*P.length)];const sd=R()<.5?-1:1;FL_.leaf(g,p[0],p[1],-(p[2]+sd*rnd(.5,.9)),len*rnd(.7,1.1),wid,[FL_.hsl(hh,38,22),FL_.hsl(hh,40,30)],'willow');}};
  const feather=(P,n)=>{for(let i=0;i<n;i++){const p=P[Math.floor(rnd(.05,.75)*P.length)];const sd=R()<.5?-1:1;const a=p[2]+sd*rnd(.5,1);g.strokeStyle=FL_.hsl(95,32,28);g.lineWidth=1.2;
    for(let k=0;k<6;k++){const l=rnd(10,22);const bx=p[0]+Math.sin(a)*k*5,by=p[1]+Math.cos(a)*k*5;g.beginPath();g.moveTo(bx,by);g.lineTo(bx+Math.sin(a+rnd(-.8,.8))*l,by+Math.cos(a+rnd(-.8,.8))*l);g.stroke();}}};
  const cell=(c,fn)=>{g.save();g.beginPath();g.rect(c*256,0,256,512);g.clip();g.translate(c*256,0);fn();g.restore();};
  /* chamomile: white rays round a domed yellow disc */
  cell(0,()=>{for(let i=0;i<7;i++){const P=stem(128+rnd(-50,50),rnd(240,440),rnd(-.35,.35));feather(P,4);const e=P[P.length-1];
    g.fillStyle='#f4f2ea';for(let k=0;k<16;k++){const a=k/16*6.283;g.save();g.translate(e[0],e[1]);g.rotate(a);g.beginPath();g.ellipse(0,11,3.4,8.5,0,0,7);g.fill();g.restore();}
    g.fillStyle='#e9b81e';g.beginPath();g.arc(e[0],e[1],7,0,7);g.fill();g.fillStyle='rgba(170,110,10,.6)';g.beginPath();g.arc(e[0]+1.5,e[1]+1.5,4,0,7);g.fill();}});
  /* cornflower: ragged blue florets round a violet centre */
  cell(1,()=>{for(let i=0;i<5;i++){const P=stem(128+rnd(-46,46),rnd(260,440),rnd(-.3,.3));leafy(P,3,48,7,92);const e=P[P.length-1];
    g.fillStyle=FL_.hsl(rnd(222,232),68,52);for(let k=0;k<11;k++){const a=k/11*6.283;g.save();g.translate(e[0],e[1]);g.rotate(a);g.beginPath();g.moveTo(-3,0);g.lineTo(-5,17);g.lineTo(0,13);g.lineTo(5,17);g.lineTo(3,0);g.fill();g.restore();}
    g.fillStyle='#4a2a6a';g.beginPath();g.arc(e[0],e[1],5,0,7);g.fill();g.fillStyle='#5a7a3a';g.beginPath();g.ellipse(e[0],e[1]+9,5,7,0,0,7);g.fill();}});
  /* yarrow: flat-topped clusters of tiny cream florets over feathery leaves */
  cell(2,()=>{for(let i=0;i<4;i++){const P=stem(128+rnd(-40,40),rnd(300,450),rnd(-.25,.25));feather(P,7);const e=P[P.length-1];
    for(let k=0;k<55;k++){const a=R()*6.283,r=Math.sqrt(R())*30;g.fillStyle=R()<.15?'#d9cfb8':'#f1ece0';g.beginPath();g.arc(e[0]+Math.cos(a)*r,e[1]+Math.sin(a)*r*.45,2.4,0,7);g.fill();}}});
  /* tansy: clusters of hard yellow buttons */
  cell(3,()=>{for(let i=0;i<3;i++){const P=stem(128+rnd(-36,36),rnd(360,480),rnd(-.2,.2));feather(P,8);const e=P[P.length-1];
    for(let k=0;k<16;k++){const a=R()*6.283,r=Math.sqrt(R())*28;const x=e[0]+Math.cos(a)*r,y=e[1]+Math.sin(a)*r*.5;g.strokeStyle=FL_.hsl(92,32,30);g.lineWidth=1;g.beginPath();g.moveTo(e[0],e[1]+8);g.lineTo(x,y);g.stroke();
      g.fillStyle=FL_.hsl(rnd(46,50),85,rnd(46,54));g.beginPath();g.arc(x,y,5.2,0,7);g.fill();g.fillStyle='rgba(150,100,0,.5)';g.beginPath();g.arc(x+1,y+1,2.5,0,7);g.fill();}}});
  /* fireweed (Ivan-chai): tall spikes of four-petalled magenta flowers opening from the bottom, buds at the tip */
  cell(4,()=>{for(let i=0;i<4;i++){const P=stem(128+rnd(-50,50),rnd(400,500),rnd(-.12,.12));leafy(P,9,52,8,100);
    for(let k=Math.floor(P.length*.55);k<P.length;k+=2){const p=P[k],u=(k/P.length-.55)/.45;const x=p[0]+rnd(-9,9),y=p[1];
      if(u>.8){g.fillStyle=FL_.hsl(330,45,38);g.beginPath();g.ellipse(x,y,3,5,0,0,7);g.fill();continue;}
      for(let q=0;q<4;q++){const a=q/4*6.283+.4;g.fillStyle=FL_.hsl(rnd(318,330),62,rnd(52,62));g.beginPath();g.ellipse(x+Math.cos(a)*5,y+Math.sin(a)*5,4.5,6,a,0,7);g.fill();}}}});
  /* red clover: low, round pink heads over trefoil leaves */
  cell(5,()=>{for(let i=0;i<9;i++){const P=stem(128+rnd(-80,80),rnd(110,230),rnd(-.5,.5));const e=P[P.length-1];
    for(let q=0;q<3;q++){const a=q/3*6.283;g.fillStyle=FL_.hsl(100,35,28);g.beginPath();g.ellipse(e[0]+Math.cos(a)*9,e[1]+40+Math.sin(a)*9,7,9,a,0,7);g.fill();}
    for(let k=0;k<26;k++){const a=R()*6.283,r=Math.sqrt(R())*12;g.fillStyle=FL_.hsl(rnd(325,338),rnd(45,60),rnd(52,66));g.beginPath();g.ellipse(e[0]+Math.cos(a)*r,e[1]+Math.sin(a)*r,2.4,4,a,0,7);g.fill();}}});
},{clamp:true});
/* no dark fringes on the cut-outs */
[TX.flowers,TX.twigBirch,TX.spray,TX.tuft,TX.twigBush].forEach(t=>t&&bleedAlpha(t,12));
