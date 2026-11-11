/* ---------- textures (all tileable, painted procedurally) ---------- */
const TX={};
TX.road=tex(256,512,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,6,5),m=fbmT(u*2,v,16,3);
  const rut=(c)=>Math.exp(-Math.pow((u-c)/0.075,2));const r=Math.max(rut(.27),rut(.73));
  const dirt=[112+(n-.5)*60,96+(n-.5)*50,72+(n-.5)*40];const wet=[62,54,42];const grassC=[96,108,62];
  let c=mixc(dirt,wet,r*sstep(.45,.62,m));
  const cent=1-sstep(.07,.16,Math.abs(u-.5));c=mixc(c,grassC,cent*sstep(.35,.6,n)*.85);
  const edge=Math.min(u,1-u);const a=sstep(0.02,0.16+n*.08,edge)*255;
  return[c[0],c[1],c[2],a];});
  g.globalAlpha=.35;for(let i=0;i<900;i++){g.fillStyle=R()<.5?'#3a3022':'#a49a80';const x=R()*w,y=R()*h;g.fillRect(x,y,1+R()*2,1+R()*2);}},{rep:[1,100]});
TX.emr=tex(512,512,(g,w,h)=>{/* EMR 'Tsifra': khaki-olive base, horizontally drawn-out green fields, dark-green and brown
   pixel clusters along their edges, a few near-black pixels; ~5 mm digital cells on a ripstop weave */
  const cols=[[122,132,94],[78,96,56],[50,64,38],[82,70,50],[34,38,28]];const px=8;
  for(let y=0;y<h;y+=px)for(let x=0;x<w;x+=px){const u=x/w,v=y/h;
    const a=fbmT(u,v*1.0,5,4),a2=fbmT(u+.21,v+.47,8,3),b=fbmT(u+.37,v+.61,9,3),c=fbmT(u+.13,v+.29,14,2),e=fbmT(u+.71,v+.05,18,2);
    let k=0;if(a>.5)k=1;if(k===1&&a2>.55)k=2;if(k===0&&a>.46&&a2>.6)k=2;if(b>.66&&(a>.46))k=3;if(c>.7&&k>0)k=4;if(k===0&&e>.76)k=3;
    const cc=cols[k],j=(R()-.5)*7;g.fillStyle=`rgb(${cc[0]+j|0},${cc[1]+j|0},${cc[2]+j|0})`;g.fillRect(x,y,px,px);}
  g.globalAlpha=.03;for(let y=0;y<h;y+=2){g.fillStyle=y%4?'#000':'#fff';g.fillRect(0,y,w,1);}g.globalAlpha=.025;g.fillStyle='#000';for(let x=0;x<w;x+=2)g.fillRect(x,0,1,h);
  g.globalAlpha=.018;for(let y=0;y<h;y+=16)g.fillRect(0,y,w,1);for(let x=0;x<w;x+=16)g.fillRect(x,0,1,h);g.globalAlpha=1;},{rep:[2,2]});
TX.knit=tex(256,256,(g,w,h)=>{/* olive polyester jersey: tight knit rows, faint heathering */
  const im=g.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h;const a=fbmT(u,v,6,3);
    const rib=.5+.5*Math.sin(x*Math.PI/2)*Math.sin(y*Math.PI/1.5+Math.sin(x*Math.PI/2)*1.2);const k=.82+(a-.5)*.14+rib*.12+R()*.04;
    const i=(y*w+x)*4;d[i]=72*k;d[i+1]=77*k;d[i+2]=55*k;d[i+3]=255;}g.putImageData(im,0,0);},{rep:[1,1]});
TX.olive=tex(512,512,(g,w,h)=>{/* faded olive-drab cordura: weathered lighter mottling, a dense weave */
  const im=g.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h;const a=fbmT(u,v,4,4),b=fbmT(u+.3,v+.7,16,3),n=R()*.06;
    const k=.86+(a-.5)*.22+(b-.5)*.1+n+.05*((x+y)%2);const i=(y*w+x)*4;d[i]=88*k;d[i+1]=91*k;d[i+2]=64*k;d[i+3]=255;}g.putImageData(im,0,0);
  g.globalAlpha=.06;g.fillStyle='#000';for(let y=0;y<h;y+=3)g.fillRect(0,y,w,1);g.globalAlpha=1;},{rep:[2,2]});
TX.emrVest=tex(256,256,(g,w,h)=>{g.drawImage(TX.emr.image,0,0);g.fillStyle='rgba(20,24,16,.25)';g.fillRect(0,0,w,h);
  for(let y=14;y<h;y+=26){g.fillStyle='rgba(30,36,24,.85)';g.fillRect(0,y,w,9);g.fillStyle='rgba(0,0,0,.4)';g.fillRect(0,y+9,w,1);for(let x=0;x<w;x+=24){g.fillStyle='rgba(0,0,0,.5)';g.fillRect(x,y,1,9);}}},{rep:[1,1]});
TX.helmet=tex(256,256,(g,w,h)=>{g.drawImage(TX.emr.image,0,0);g.globalAlpha=.3;g.strokeStyle='#1e2414';for(let i=0;i<40;i++){g.beginPath();g.moveTo(R()*w,R()*h);g.bezierCurveTo(R()*w,R()*h,R()*w,R()*h,R()*w,R()*h);g.stroke();}},{rep:[3,2]});
TX.quilt=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,8,3);const q=Math.abs(Math.sin(u*Math.PI*14));const k=48+n*26;return[k*.9*(.7+.3*q),k*.95*(.7+.3*q),k*1.08*(.7+.3*q)];});},{rep:[2,2]});
TX.plaid=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const a=(Math.sin(u*Math.PI*16)>.4?1:0),b=(Math.sin(v*Math.PI*16)>.4?1:0),c=(Math.sin(u*Math.PI*64)>.7||Math.sin(v*Math.PI*64)>.7)?1:0;
  const base=[70,64,58];let col=mixc(base,[120,46,38],(a+b)*.4);col=mixc(col,[160,150,120],c*.2);const n=fbmT(u,v,6,3);return col.map(x=>x*(.75+n*.4));});},{rep:[2,2]});
TX.cloth=tex(128,128,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,6,4);const k=42+n*30;return[k,k*.98,k*.95];});},{rep:[2,2]});
TX.skin=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,6,4),m=fbmT(u,v,40,2);return[166+n*30-m*14,122+n*24-m*14,98+n*20-m*12];});});
TX.decay=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,5,5),m=fbmT(u+.4,v,12,3);let c=[132+n*40,128+n*34,102+n*26];
  c=mixc(c,[70,58,52],sstep(.55,.75,m));c=mixc(c,[92,96,70],sstep(.5,.7,n)*.5);return c;});});
TX.sand=tex(128,128,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,8,4);return[150+n*50,132+n*44,96+n*34];});},{rep:[2,2]});
TX.sandbag=tex(256,256,(g,w,h)=>{g.fillStyle='#4a4632';g.fillRect(0,0,w,h);for(let r=0;r<6;r++)for(let c=-1;c<5;c++){const x=c*64+(r%2?32:0),y=r*43;
  const gr=g.createRadialGradient(x+32,y+20,4,x+32,y+21,36);const k=100+R()*24;gr.addColorStop(0,`rgb(${k+28},${k+18},${k-18})`);gr.addColorStop(1,`rgb(${k-30},${k-34},${k-56})`);g.fillStyle=gr;g.beginPath();g.ellipse(x+32,y+21,32,20,0,0,7);g.fill();}},{rep:[2,1]});
TX.slate=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,4,5),m=fbmT(u,v,10,3);let c=[128+(n-.5)*40,128+(n-.5)*40,120+(n-.5)*36];
  c=mixc(c,[72,86,48],sstep(.58,.72,m)*.8);c=mixc(c,[60,56,48],sstep(.6,.75,n)*.4);return c;});},{rep:[1,1]});
TX.wallpaper=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,6,4);const st=Math.sin(u*Math.PI*24)>.6?1:0;let c=mixc([170,160,128],[140,120,96],st*.4);
  const peel=sstep(.62,.66,fbmT(u,v,3,4));c=mixc(c,[110,96,74],peel);c=c.map(x=>x*(.8+n*.3));return c;});
  g.globalAlpha=.5;g.fillStyle='#7a5040';for(let i=0;i<40;i++){const x=(i%6)*44+12,y=Math.floor(i/6)*40+10;g.beginPath();g.arc(x,y,4,0,7);g.fill();}},{rep:[1,1]});
TX.steel=tex(128,128,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,8,4);const k=40+n*22;return[k,k*1.02,k*1.06];});},{rep:[1,1]});
TX.wood=tex(256,64,(g,w,h)=>{pix(g,w,h,(u,v)=>{const gr=fbmT(u*.6,v*3,6,4);const ring=Math.sin((u*5+gr*3)*Math.PI*2)*.5+.5;const k=.78+ring*.22;return[104*k,56*k,34*k];});},{rep:[1,1]});
TX.gripPM=tex(128,128,(g,w,h)=>{pix(g,w,h,(u,v,x,y)=>{const ch=((x>>2)+(y>>2))%2?.85:1;return[58*ch,36*ch,26*ch];});
  g.fillStyle='#2a1810';g.beginPath();g.arc(64,46,20,0,7);g.fill();g.fillStyle='#8d2a20';g.beginPath();for(let k=0;k<10;k++){const r=k%2?7:17,a=-Math.PI/2+k*Math.PI/5;g.lineTo(64+Math.cos(a)*r,46+Math.sin(a)*r);}g.closePath();g.fill();});
TX.leafBirch=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#3a2e20';g.lineWidth=3;
  for(let i=0;i<9;i++){const a=R()*Math.PI*2;g.beginPath();g.moveTo(w/2,h/2);g.quadraticCurveTo(w/2+Math.cos(a)*90,h/2+Math.sin(a)*60,w/2+Math.cos(a)*200,h/2+Math.sin(a)*200);g.stroke();}
  for(let i=0;i<1000;i++){const a=R()*Math.PI*2,r=Math.pow(R(),.75)*220;const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r*.95;
    const t=R();const hue=t<.5?46+R()*12:t<.85?66+R()*22:32+R()*8;const l=t<.85?34+R()*20:28+R()*10;g.fillStyle=`hsl(${hue},${42+R()*25}%,${l}%)`;
    g.save();g.translate(x,y);g.rotate(R()*7);g.beginPath();g.ellipse(0,0,7+R()*3,4.5+R()*2,0,0,7);g.fill();g.restore();}},{clamp:true});
TX.leafGreen=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#33291c';g.lineWidth=3;
  for(let i=0;i<9;i++){const a=R()*Math.PI*2;g.beginPath();g.moveTo(w/2,h/2);g.lineTo(w/2+Math.cos(a)*200,h/2+Math.sin(a)*200);g.stroke();}
  for(let i=0;i<1500;i++){const a=R()*Math.PI*2,r=Math.pow(R(),.6)*215;const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r;
    g.fillStyle=`hsl(${70+R()*30},${35+R()*25}%,${22+R()*20}%)`;g.save();g.translate(x,y);g.rotate(R()*7);g.beginPath();g.ellipse(0,0,8+R()*3,4+R()*2,0,0,7);g.fill();g.restore();}},{clamp:true});
TX.needles=tex(512,256,(g,w,h)=>{g.clearRect(0,0,w,h);g.strokeStyle='#3b2a1a';g.lineWidth=5;g.beginPath();g.moveTo(0,h/2);g.lineTo(w*.97,h/2);g.stroke();
  for(let s=0;s<14;s++){const bx=30+s*33,by=h/2,len=(1-s/16)*110+20;const side=s%2?1:-1;g.lineWidth=2;g.beginPath();g.moveTo(bx,by);const ex=bx+len*.5,ey=by+side*len*.8;g.lineTo(ex,ey);g.stroke();
    for(let k=0;k<70;k++){const t=R();const px=lerp(bx,ex,t),py=lerp(by,ey,t);const a=R()*Math.PI*2;const l=10+R()*12;g.strokeStyle=`hsl(${95+R()*30},${30+R()*20}%,${14+R()*16}%)`;g.lineWidth=1.6;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);g.stroke();}}
  for(let k=0;k<900;k++){const px=R()*w*.95,py=h/2+(R()-.5)*30;const a=R()*Math.PI*2,l=10+R()*14;g.strokeStyle=`hsl(${95+R()*30},${30+R()*20}%,${14+R()*16}%)`;g.lineWidth=1.6;g.beginPath();g.moveTo(px,py);g.lineTo(px+Math.cos(a)*l,py+Math.sin(a)*l);g.stroke();}},{clamp:true});
TX.birch=tex(128,512,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u,v,4,4);const k=210+(n-.5)*30;return[k,k*.98,k*.92];});
  for(let i=0;i<120;i++){const y=R()*h,x=R()*w,l=6+R()*40;g.fillStyle=`rgba(25,22,18,${.6+R()*.4})`;g.fillRect(x,y,l,1+R()*4);}
  g.globalAlpha=.4;g.fillStyle='#4a4436';for(let i=0;i<30;i++)g.fillRect(R()*w,R()*h,2,20+R()*40);},{rep:[1,3]});
TX.bark=tex(128,512,(g,w,h)=>{pix(g,w,h,(u,v)=>{const n=fbmT(u*2,v*.5,8,4);const r=Math.abs(Math.sin((u*6+n*2)*Math.PI));const k=40+n*50+r*24;return[k*1.05,k*.82,k*.62];});},{rep:[1,3]});
/* text that must stay on its board: shrink the font until the line fits the width it is given */
function fitLine(g,txt,x,y,maxW,px,style=''){let f=px;g.font=`${style} ${f}px Arial`.trim();while(f>6&&g.measureText(txt).width>maxW){f-=1;g.font=`${style} ${f}px Arial`.trim();}g.fillText(txt,x,y);}
TX.radSign=tex(256,192,(g,w,h)=>{g.fillStyle='#d9b51e';g.fillRect(0,0,w,h);g.strokeStyle='#1a1a14';g.lineWidth=8;g.strokeRect(6,6,w-12,h-12);
  const cx=72,cy=88;g.fillStyle='#16140e';g.beginPath();g.arc(cx,cy,9,0,7);g.fill();for(let k=0;k<3;k++){const a=-Math.PI/2+k*2.094;g.beginPath();g.arc(cx,cy,48,a-.52,a+.52);g.arc(cx,cy,16,a+.52,a-.52,true);g.closePath();g.fill();}
  g.textAlign='center';fitLine(g,'ОПАСНО',184,80,100,30,'bold');fitLine(g,'РАДИАЦИЯ',184,112,100,22,'bold');fitLine(g,'ПРОХОД ЗАПРЕЩЁН',128,168,212,15,'bold');g.textAlign='left';
  pix2(g,w,h,1);});
function pix2(g,w,h,K=1){const img=g.getImageData(0,0,w,h),d=img.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/w,v=y/h;const n=fbm(u*6,v*6,4),m=fbm(u*14+3,v*3,3);const i=(y*w+x)*4;
  const rs=(sstep(.55,.72,n)*.85+sstep(.6,.75,m)*sstep(.3,1,v)*.6)*K;d[i]=lerp(d[i],118,rs);d[i+1]=lerp(d[i+1],60,rs);d[i+2]=lerp(d[i+2],30,rs);
  const fade=.85+n*.25;d[i]*=fade;d[i+1]*=fade;d[i+2]*=fade;}g.putImageData(img,0,0);}
TX.radSign.wrapS=TX.radSign.wrapT=T.ClampToEdgeWrapping;
TX.zoneSign=tex(512,256,(g,w,h)=>{g.fillStyle='#2b3826';g.fillRect(0,0,w,h);g.strokeStyle='#d8c35a';g.lineWidth=6;g.strokeRect(10,10,w-20,h-20);g.fillStyle='#e8dca0';g.textAlign='center';
  const fit=(s,y,f,sz)=>{do{g.font=f.replace('#',sz);sz--;}while(g.measureText(s).width>w-70&&sz>8);g.fillText(s,256,y);};fit('ЗОНА 12',100,'bold #px Arial',74);fit('ВОЙСКА РХБЗ · ПЕРЕДОВАЯ БАЗА «КУРГАН»',152,'bold #px Arial',26);g.fillStyle='#d6b324';fit('ПРЕДЪЯВИ ПРОПУСК · ДОЗИМЕТР ОБЯЗАТЕЛЕН',200,'#px Arial',22);pix2(g,w,h,.3);},{clamp:true});
TX.stop=tex(512,256,(g,w,h)=>{g.fillStyle='#e9e4d6';g.fillRect(0,0,w,h);g.fillStyle='#b3241c';g.fillRect(14,14,w-28,h-28);g.fillStyle='#f1ece0';g.textAlign='center';
  g.font='bold 120px Arial';g.fillText('СТОЙ!',256,140);g.font='bold 30px Arial';g.fillText('ПРЕДЪЯВИ ДОКУМЕНТЫ',256,205);pix2(g,w,h,.25);},{clamp:true});
TX.kpp=tex(256,128,(g,w,h)=>{g.fillStyle='#2b3826';g.fillRect(0,0,w,h);g.strokeStyle='#e8dca0';g.lineWidth=5;g.strokeRect(8,8,w-16,h-16);g.fillStyle='#e8dca0';g.textAlign='center';g.font='bold 76px Arial';g.fillText('КПП',128,96);pix2(g,w,h,.25);},{clamp:true});
TX.orders=tex(512,512,(g,w,h)=>{g.fillStyle='#d9d2b4';g.fillRect(0,0,w,h);g.fillStyle='#222';g.font='bold 28px Arial';g.fillText('БОЕВОЙ ПРИКАЗ № 12-7',24,52);g.font='19px Arial';
  ['Сектор 1: поле у д. Старое Опалихино.','Задача: замер уровня радиации,','осмотр жилого дома, поиск','пропавшего патруля (3 чел.).','Доставка: БТР-80 борт 121.','Дозиметр не снимать.','Связь: канал 4, позывной «Курган».','','                     Командир отряда'].forEach((s,i)=>g.fillText(s,24,100+i*32));
  g.strokeStyle='#a82020';g.lineWidth=3;g.beginPath();g.arc(410,430,48,0,7);g.stroke();g.font='12px Arial';g.fillStyle='#a82020';g.fillText('В/Ч 12091',378,434);},{clamp:true});
TX.num=tex(256,128,(g,w,h)=>{g.clearRect(0,0,w,h);g.fillStyle='rgba(235,232,220,.92)';g.font='bold 100px Arial';g.textAlign='center';g.fillText('121',128,104);},{clamp:true});
TX.flag=tex(192,128,(g,w,h)=>{g.fillStyle='#eeeeee';g.fillRect(0,0,w,43);g.fillStyle='#1d4fa8';g.fillRect(0,43,w,43);g.fillStyle='#c9281c';g.fillRect(0,86,w,42);},{clamp:true});
TX.ammo918=tex(128,64,(g,w,h)=>{g.fillStyle='#c8b98a';g.fillRect(0,0,w,h);g.fillStyle='#222';g.font='bold 20px Arial';g.fillText('9 мм ПМ',8,26);g.font='13px Arial';g.fillText('16 патронов · 57-Н-181С',8,48);},{clamp:true});
TX.ammo545=tex(128,64,(g,w,h)=>{g.fillStyle='#8f8160';g.fillRect(0,0,w,h);g.fillStyle='#111';g.font='bold 18px Arial';g.fillText('5,45×39 ПС',8,26);g.font='13px Arial';g.fillText('30 шт. · 7Н6',8,48);},{clamp:true});
TX.crate=tex(256,128,(g,w,h)=>{pix(g,w,h,(u,v)=>{const gr=fbmT(u*3,v*.4,8,3);const k=.8+gr*.3;return[86*k,98*k,62*k];});g.fillStyle='rgba(20,20,10,.5)';g.fillRect(0,40,w,3);g.fillRect(0,86,w,3);
  g.fillStyle='rgba(235,228,190,.85)';g.font='bold 22px Arial';g.fillText('7,62 ПС ГЖ',24,30);g.font='16px Arial';g.fillText('1320 ШТ   ПАРТ. 14-86',24,72);g.fillText('ВЕС 26 КГ',24,118);});
TX.calendar=tex(128,192,(g,w,h)=>{g.fillStyle='#e6dfc6';g.fillRect(0,0,w,h);g.fillStyle='#a33';g.fillRect(0,0,w,46);g.fillStyle='#fff';g.font='bold 26px Arial';g.textAlign='center';g.fillText('1986',64,34);
  g.fillStyle='#333';g.font='bold 16px Arial';g.fillText('АПРЕЛЬ',64,70);g.font='12px Arial';for(let i=0;i<30;i++){const x=14+(i%7)*16,y=92+Math.floor(i/7)*20;g.fillStyle=i===25?'#a33':'#333';g.fillText(String(i+1),x,y);}pix2(g,w,h,.12);},{clamp:true});
TX.icon=tex(96,128,(g,w,h)=>{g.fillStyle='#6a4a20';g.fillRect(0,0,w,h);g.fillStyle='#b88a30';g.fillRect(6,6,w-12,h-12);g.fillStyle='#4a2a18';g.beginPath();g.ellipse(48,48,18,22,0,0,7);g.fill();g.fillStyle='#d8b070';g.beginPath();g.arc(48,44,24,Math.PI,0);g.lineWidth=4;g.strokeStyle='#e8c860';g.stroke();g.fillStyle='#5a1a14';g.fillRect(24,72,48,46);},{clamp:true});
TX.newspaper=tex(128,128,(g,w,h)=>{g.fillStyle='#cfc8b0';g.fillRect(0,0,w,h);g.fillStyle='#333';g.font='bold 14px Arial';g.fillText('ПРАВДА',30,18);for(let i=0;i<24;i++)g.fillRect(8+(i%2)*60,28+Math.floor(i/2)*8,52*(.6+R()*.4),2);pix2(g,w,h,.1);},{clamp:true});
TX.label=tex(128,64,(g,w,h)=>{g.fillStyle='#e8e2d0';g.fillRect(0,0,w,h);g.fillStyle='#b02020';g.font='bold 16px Arial';g.fillText('СТОЛИЧНАЯ',10,24);g.fillStyle='#333';g.font='11px Arial';g.fillText('ВОДКА · 40%',30,44);},{clamp:true});
TX.tushonka=tex(128,64,(g,w,h)=>{g.fillStyle='#d8cfa8';g.fillRect(0,0,w,h);g.fillStyle='#8a2a1a';g.font='bold 14px Arial';g.fillText('ГОВЯДИНА',20,24);g.fillText('ТУШЁНАЯ',22,42);g.fillStyle='#333';g.font='10px Arial';g.fillText('ГОСТ 32125',36,58);});
TX.grille=tex(64,64,(g,w,h)=>{g.fillStyle='#1d1f1a';g.fillRect(0,0,w,h);g.fillStyle='#3a3e30';for(let y=0;y<h;y+=8)g.fillRect(0,y,w,4);},{rep:[1,1]});/* ---------- weathered "Zone" texture set: dirt, grime, chipped paint, water streaks; each with a matching bump map ---------- */
function wor(u,v,p,seed=0){/* tileable cellular noise: [F1, F2-F1] */let f1=9,f2=9;const x=u*p,y=v*p,xi=Math.floor(x),yi=Math.floor(y);
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const cx=xi+i,cy=yi+j,mx=((cx%p)+p)%p,my=((cy%p)+p)%p;
    const px=cx+hash(mx+seed*7.1,my+seed*3.3),py=cy+hash(my+seed*5.7,mx+seed*1.9);const d=Math.hypot(px-x,py-y);if(d<f1){f2=f1;f1=d;}else if(d<f2)f2=d;}
  return[f1,f2-f1];}
function ptex2(w,h,f,o={}){const c=document.createElement('canvas');c.width=w;c.height=h;const g=c.getContext('2d');const b=document.createElement('canvas');b.width=w;b.height=h;const gb=b.getContext('2d');
  const img=g.createImageData(w,h),bi=gb.createImageData(w,h),d=img.data,e=bi.data;
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const r=f(x/w,y/h,x,y);const i=(y*w+x)*4;d[i]=clamp(r[0],0,255);d[i+1]=clamp(r[1],0,255);d[i+2]=clamp(r[2],0,255);d[i+3]=r[4]===undefined?255:r[4];
    const hv=clamp(r[3]*255,0,255);e[i]=e[i+1]=e[i+2]=hv;e[i+3]=255;}
  g.putImageData(img,0,0);gb.putImageData(bi,0,0);if(o.post)o.post(g,gb,w,h);
  const mk=(cv,lin)=>{const t=new T.CanvasTexture(cv);t.wrapS=t.wrapT=o.clamp?T.ClampToEdgeWrapping:T.RepeatWrapping;if(o.rep)t.repeat.set(o.rep[0],o.rep[1]);t.anisotropy=8;if(!lin)t.encoding=T.sRGBEncoding;return t;};
  return[mk(c,false),mk(b,true)];}
const TB={};
/* soil with dead grass litter, pebbles and damp patches */
[TX.ground,TB.ground]=ptex2(512,512,(u,v)=>{const n=fbmT(u,v,4,5),m=fbmT(u+.3,v+.7,16,4),k=fbmT(u+.6,v+.1,48,2);const [s1,s2]=wor(u,v,22,1);
  let c=mixc([96,86,62],[124,112,80],sstep(.4,.62,n));c=mixc(c,[64,58,42],sstep(.55,.72,m)*.65);c=c.map(x=>x*(.85+k*.3));
  const peb=sstep(.22,.12,s1)*sstep(.55,.75,fbmT(u,v,8,2));c=mixc(c,[140,134,122],peb*.8);
  return[c[0],c[1],c[2],.45+n*.25+peb*.3-sstep(.55,.72,m)*.15];},
  {rep:[180,220],post:(g,gb,w,h)=>{for(let i=0;i<9000;i++){const x=R()*w,y=R()*h,l=3+R()*11,a=R()*Math.PI*2;const t=R();
    g.strokeStyle=t<.45?`rgba(${150+R()*40|0},${132+R()*30|0},${80+R()*20|0},.8)`:t<.8?`rgba(${70+R()*30|0},${78+R()*30|0},${42|0},.7)`:'rgba(40,34,24,.7)';g.lineWidth=.8+R()*.8;
    g.beginPath();g.moveTo(x,y);g.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);g.stroke();gb.strokeStyle='rgba(255,255,255,.35)';gb.beginPath();gb.moveTo(x,y);gb.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);gb.stroke();}}});
/* trampled base mud: tyre treads, gravel, standing water */
[TX.dirtFOB,TB.dirtFOB]=ptex2(512,512,(u,v)=>{const n=fbmT(u,v,4,5),m=fbmT(u,v,14,3);const [s1]=wor(u,v,110,2);
  let c=mixc([70,66,56],[92,86,72],sstep(.42,.65,n));c=mixc(c,[84,74,56],sstep(.58,.74,m)*.4);
  const tread=Math.abs(((u*3+fbmT(u,v,2,2)*.6)%1)-.5)<.05?(.5+.5*Math.sin(v*400)):0;c=c.map(x=>x*(1-tread*.12));
  const gr=sstep(.16,.08,s1)*sstep(.45,.7,fbmT(u,v,9,2));c=mixc(c,[118,112,100],gr*.6);const wet=sstep(.68,.74,m);c=mixc(c,[64,58,46],wet*.45);
  return[c[0],c[1],c[2],.5+n*.25+gr*.25-wet*.3-tread*.1];},{rep:[1,1]});
/* weathered poured concrete: stains, rust runs, cracks, pitting */
[TX.concrete,TB.concrete]=ptex2(512,512,(u,v)=>{const n=fbmT(u,v,4,5),m=fbmT(u,v,24,3),st=fbmT(u*.25,v*1.8,6,3);const [c1,c2]=wor(u,v,5,3);
  let k=138+(n-.5)*46+(m-.5)*16;let c=[k,k*.985,k*.94];
  const streak=sstep(.55,.8,st)*(.4+.6*v);c=mixc(c,[86,82,74],streak*.7);
  const rustR=sstep(.75,.85,fbmT(u*.2,v*2.2,9,2))*v;c=mixc(c,[120,74,44],rustR*.6);
  const crack=sstep(.035,.0,c2)*sstep(.5,.6,fbmT(u,v,6,2));c=mixc(c,[40,38,34],crack);
  const pit=sstep(.85,.9,fbmT(u,v,80,1));c=c.map(x=>x*(1-pit*.3));
  return[c[0],c[1],c[2],.55+n*.2-crack*.4-pit*.25];},{rep:[1,1]});
/* old log walls: grey weathered timber, splits along the grain, lichen */
[TX.logs,TB.logs]=ptex2(512,512,(u,v)=>{const gr=fbmT(u*.5,v*6,8,4),n=fbmT(u,v,4,4),li=fbmT(u+.2,v,10,3);
  let k=104+(gr-.5)*70+(n-.5)*40;let c=[k*.92,k*.86,k*.76];
  const split=sstep(.012,.0,Math.abs(fbmT(u*.4,v*3,6,2)-.5))*sstep(.5,.7,n);c=mixc(c,[44,38,30],split*.6);
  c=mixc(c,[118,124,92],sstep(.68,.78,li)*.6);
  return[c[0],c[1],c[2],.5+(gr-.5)*.6-split*.5];},{rep:[1,1]});
/* weathered planks with seams and nails */
[TX.planks,TB.planks]=ptex2(512,512,(u,v,x)=>{const b=Math.floor(u*6);const gr=fbmT(u*4,v*.3,16,4),n=fbmT(u,v,4,3);const off=hash(b,3);
  let k=92+off*26+(gr-.5)*46+(n-.5)*26;let c=[k*.94,k*.86,k*.74];const fu=(u*6)%1;const seam=sstep(.03,0,Math.min(fu,1-fu));c=mixc(c,[26,22,18],seam);
  const nail=Math.hypot((fu-.5)*.17,((v*8)%1-.5)*.12)<.012?1:0;c=mixc(c,[60,40,30],nail);
  c=mixc(c,[70,62,52],sstep(.6,.75,fbmT(u,v,9,3))*.4);return[c[0],c[1],c[2],.55+(gr-.5)*.4-seam*.5];},{rep:[1,1]});
[TX.boards,TB.boards]=ptex2(512,512,(u,v)=>{const b=Math.floor(u*5);const gr=fbmT(u*5,v*.25,10,4);const k=82+hash(b,7)*24+(gr-.5)*44;const fu=(u*5)%1;
  const seam=sstep(.035,0,Math.min(fu,1-fu));let c=mixc([k*.9,k*.86,k*.8],[22,20,16],seam);c=mixc(c,[64,70,50],sstep(.7,.8,fbmT(u,v,7,3))*.4);
  return[c[0],c[1],c[2],.55+(gr-.5)*.45-seam*.5];},{rep:[1,1]});
/* lime-washed plaster, flaking to the lath, mould and soot */
[TX.whitewash,TB.whitewash]=ptex2(512,512,(u,v)=>{const n=fbmT(u,v,6,5),m=fbmT(u,v,3,4),fl=fbmT(u+.4,v+.2,6,4);
  let c=[198+(n-.5)*26,194+(n-.5)*26,180+(n-.5)*26];const fl2=fbmT(u+.4,v+.2,20,4);const flake=sstep(.66,.69,fl2)*sstep(.45,.6,fl);c=mixc(c,[150,132,108],flake*.8);c=mixc(c,[70,62,52],sstep(.6,.64,fl)*sstep(.7,.74,fl)*.5);
  c=mixc(c,[120,118,96],sstep(.6,.75,m)*.35);c=mixc(c,[70,62,52],sstep(.55,.8,fbmT(u*.4,v,4,3))*v*.5);
  return[c[0],c[1],c[2],.6+n*.1-flake*.35];},{rep:[1,1]});
/* olive army paint: chips to primer and rust, dust, drips */
[TX.paint,TB.paint]=ptex2(512,512,(u,v)=>{const n=fbmT(u,v,4,5),m=fbmT(u,v,24,3),s=fbmT(u*.2,v*2,6,3);const [w1,w2]=wor(u,v,18,4);
  let c=[78+(n-.5)*20,88+(n-.5)*20,54+(n-.5)*14];c=mixc(c,[104,96,70],sstep(.58,.75,s)*.55);
  const chip=sstep(.04,.0,w2)*sstep(.62,.7,fbmT(u,v,10,3));c=mixc(c,[52,48,40],chip);const rs=sstep(.75,.82,fbmT(u,v,12,2));c=mixc(c,[112,64,36],rs*.8);
  c=mixc(c,[126,112,84],sstep(.55,.78,m)*.35);return[c[0],c[1],c[2],.6-chip*.35-rs*.2+(n-.5)*.1];},{rep:[1,1]});
[TX.rust,TB.rust]=ptex2(256,256,(u,v)=>{const n=fbmT(u,v,6,5),m=fbmT(u,v,20,3);let c=[112+(n-.5)*60,62+(n-.5)*36,34+(n-.5)*20];c=mixc(c,[64,68,54],sstep(.55,.7,m)*.6);c=mixc(c,[40,26,18],sstep(.7,.8,n)*.6);
  return[c[0],c[1],c[2],.4+n*.4+m*.1];},{rep:[1,1]});
[TX.corrug,TB.corrug]=ptex2(256,256,(u,v)=>{const sn=Math.sin(u*Math.PI*16);const n=fbmT(u,v,6,4);let c=[(76+sn*14)*(.8+n*.4),(86+sn*14)*(.8+n*.4),(60+sn*10)*(.8+n*.4)];
  const run=sstep(.62,.8,fbmT(u*2,v*.3,8,3))*(1-v);c=mixc(c,[110,62,36],run*.75);return[c[0],c[1],c[2],.5+sn*.4];},{rep:[4,1]});
[TX.canvas,TB.canvas]=ptex2(512,512,(u,v,x,y)=>{const n=fbmT(u,v,6,4),m=fbmT(u,v,30,2);const wv=((x+y)%3===0)?.93:1;let c=[96+n*24,102+n*22,68+n*16].map(q=>q*wv);
  c=mixc(c,[60,58,42],sstep(.6,.8,m)*.4);c=mixc(c,[86,74,54],sstep(.7,1,v)*.6);c=mixc(c,[50,48,36],sstep(.55,.75,fbmT(u*.3,v*2,5,3))*.35);
  return[c[0],c[1],c[2],.5+(wv-1)*3+n*.2];},{rep:[3,2]});
[TX.hesco,TB.hesco]=ptex2(256,256,(u,v)=>{const n=fbmT(u,v,6,4),m=fbmT(u,v,24,2);let c=[164+(n-.5)*50,148+(n-.5)*44,108+(n-.5)*36];c=mixc(c,[110,100,76],sstep(.5,.8,m)*.4);
  c=mixc(c,[92,84,64],sstep(.75,1,v)*.5);const wire=(Math.abs(((u*8)%1)-.5)>.48||Math.abs(((v*8)%1)-.5)>.48)?1:0;c=mixc(c,[70,72,66],wire*.9);return[c[0],c[1],c[2],.5+n*.3+wire*.3];},{rep:[1,1]});
/* EMR fabric: wear, dust and grime on top of the pixel pattern */
{const g=TX.emr.image.getContext('2d'),w=TX.emr.image.width;const img=g.getImageData(0,0,w,w),d=img.data;
  for(let y=0;y<w;y++)for(let x=0;x<w;x++){const u=x/w,v=y/w,i=(y*w+x)*4;const fade=.82+fbmT(u,v,3,3)*.22,dust=sstep(.5,.75,fbmT(u+.5,v,5,3))*.25,gr=sstep(.6,.8,fbmT(u,v,12,2))*.15;
    for(let k=0;k<3;k++){let q=d[i+k]*fade;q=q+(([150,138,108])[k]-q)*dust;q*=1-gr;d[i+k]=q;}}g.putImageData(img,0,0);TX.emr.needsUpdate=true;}
/* ---------- materials ---------- */
function std(o){if(o.envMapIntensity===undefined)o.envMapIntensity=.55;return new T.MeshStandardMaterial(o);}
const M={};
M.emr=std({map:TX.emr,roughness:.92});
M.emrVest=std({map:TX.emrVest,roughness:.95});
M.helmet=std({map:TX.helmet,roughness:.9});
M.glove=std({color:C(0x24221d),roughness:.8});
M.boot=std({color:C(0x1c1a17),roughness:.55,envMapIntensity:.8});
M.black=std({color:C(0x161616),roughness:.6});
M.strap=std({color:C(0x2d3423),roughness:.95});
M.skin=std({map:TX.skin,roughness:.7});
M.stubble=std({color:C(0x3a3028),roughness:1,transparent:true,opacity:.4,depthWrite:false});
M.decay=std({map:TX.decay,roughness:.75});
M.socket=std({color:C(0x120c0a),roughness:1});
M.quilt=std({map:TX.quilt,roughness:1});
M.plaid=std({map:TX.plaid,roughness:1});
M.cloth=std({map:TX.cloth,roughness:1});
M.felt=std({color:C(0x6a645a),roughness:1});
M.hair=std({color:C(0x8c8880),roughness:1});
M.hairDark=std({color:C(0x2a2622),roughness:1});
M.gun=std({map:TX.steel,color:C(0x8a8e96),roughness:.42,metalness:.85,envMapIntensity:1});
M.gunD=std({map:TX.steel,color:C(0x5a5c62),roughness:.5,metalness:.8,envMapIntensity:1});
M.bore=std({color:0x000000,roughness:1});
M.gripPM=std({map:TX.gripPM,color:C(0x8a7a72),roughness:.5});
M.akWood=std({map:TX.wood,roughness:.45,envMapIntensity:.8});
M.bakelite=std({color:C(0x4a2416),roughness:.4,envMapIntensity:.8});
M.hesco=std({map:TX.hesco,bumpMap:TB.hesco,bumpScale:.03,roughness:1,envMapIntensity:.3});
M.sand=std({map:TX.sand,roughness:1,envMapIntensity:.2});
M.sandbag=std({map:TX.sandbag,roughness:1,envMapIntensity:.3});
M.canvas=std({map:TX.canvas,bumpMap:TB.canvas,bumpScale:.02,roughness:1,side:T.DoubleSide,envMapIntensity:.3});
M.concrete=std({map:TX.concrete,bumpMap:TB.concrete,bumpScale:.05,roughness:.95,envMapIntensity:.3});
M.logs=std({map:TX.logs,bumpMap:TB.logs,bumpScale:.06,roughness:1,envMapIntensity:.25});
M.planks=std({map:TX.planks,bumpMap:TB.planks,bumpScale:.04,roughness:.9,envMapIntensity:.25});
M.boards=std({map:TX.boards,bumpMap:TB.boards,bumpScale:.04,roughness:1,envMapIntensity:.25,side:T.DoubleSide});
M.slate=std({map:TX.slate,roughness:.9,side:T.DoubleSide,envMapIntensity:.3});
M.white=std({map:TX.whitewash,bumpMap:TB.whitewash,bumpScale:.04,roughness:1,envMapIntensity:.3});
M.wallpaper=std({map:TX.wallpaper,roughness:1,envMapIntensity:.2});
M.paint=std({map:TX.paint,bumpMap:TB.paint,bumpScale:.025,roughness:.68,metalness:.2,vertexColors:true,side:T.DoubleSide});
M.paintP=std({map:TX.paint,bumpMap:TB.paint,bumpScale:.025,roughness:.68,metalness:.2});
M.tire=std({color:C(0x1b1b1a),roughness:.92,envMapIntensity:.3});
M.rust=std({map:TX.rust,bumpMap:TB.rust,bumpScale:.04,roughness:.85,metalness:.35});
M.steel=std({map:TX.steel,color:C(0xb0b4b8),roughness:.5,metalness:.7});
M.wood=std({map:TX.boards,roughness:.95,envMapIntensity:.25});
M.glass=std({color:C(0x99a8a8),roughness:.24,metalness:0,transparent:true,opacity:.26,envMapIntensity:.55});
M.blue=std({color:C(0x4f7899),roughness:.8,map:TX.whitewash});
M.trimWhite=std({color:C(0xe0dcd0),roughness:.85,map:TX.whitewash});
M.radSign=[std({color:C(0x8a8478),roughness:.6,metalness:.5}),std({color:C(0x8a8478),roughness:.6,metalness:.5}),std({color:C(0x8a8478),roughness:.6,metalness:.5}),std({color:C(0x8a8478),roughness:.6,metalness:.5}),std({map:TX.radSign,roughness:.7}),std({map:TX.rust,roughness:.8})];
M.post=std({map:TX.logs,color:C(0x8a8070),roughness:1});
M.flag=std({map:TX.flag,side:T.DoubleSide,roughness:1});
M.zoneSign=std({map:TX.zoneSign,roughness:.8});
M.orders=std({map:TX.orders,roughness:1});
M.num=std({map:TX.num,transparent:true,roughness:.8,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2});
M.olive=std({color:C(0x4d5634),roughness:.8});
M.crate=std({map:TX.crate,roughness:.9});
M.corrug=std({map:TX.corrug,bumpMap:TB.corrug,bumpScale:.04,roughness:.72,metalness:.3});
M.grille=std({map:TX.grille,roughness:.8,metalness:.4});
M.lamp=new T.MeshBasicMaterial({color:C(0xfff2d0)});
M.dark=std({color:C(0x0a0a0a),roughness:1});
M.enamel=std({color:C(0xd8d4c8),roughness:.3,envMapIntensity:.9});
M.bottle=std({color:C(0x4a7a4a),roughness:.22,metalness:0,transparent:true,opacity:.75,envMapIntensity:.55});
M.orange=std({color:C(0xd87a20),roughness:.5});
M.label=std({map:TX.label,roughness:.8});
M.tushonka=std({map:TX.tushonka,roughness:.5,metalness:.3});
M.ammo918=std({map:TX.ammo918,roughness:.9});
M.ammo545=std({map:TX.ammo545,roughness:.9});
M.paper=std({map:TX.newspaper,roughness:1,side:T.DoubleSide});
M.calendar=std({map:TX.calendar,roughness:1});
M.icon=std({map:TX.icon,roughness:.5,metalness:.3});
M.stain=new T.MeshBasicMaterial({color:C(0x1a120c),transparent:true,opacity:.7,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
M.decal=new T.MeshBasicMaterial({color:0x080808,transparent:true,opacity:.85,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
M.flash=new T.MeshBasicMaterial({color:C(0xffc06a),transparent:true,opacity:.95,blending:T.AdditiveBlending,depthWrite:false,side:T.DoubleSide});
M.wire=new T.LineBasicMaterial({color:C(0x2a2a26)});
