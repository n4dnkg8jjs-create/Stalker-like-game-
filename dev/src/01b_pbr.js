/* ---------- PBR texture sets: albedo + tangent-space normal map (from a height field) + roughness map,
   all generated procedurally and tileable.  Plus: a splat terrain material, a wet-ground term and triplanar
   micro-detail (weave, leather grain, rubber) for the characters' gear. ---------- */
function pbr(n,fn,o={}){
  const A=document.createElement('canvas');A.width=A.height=n;const ga=A.getContext('2d');const ia=ga.createImageData(n,n),da=ia.data;
  const Hh=new Float32Array(n*n),Rr=new Float32Array(n*n);
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const r=fn(x/n,y/n,x,y),i=y*n+x;da[i*4]=r[0];da[i*4+1]=r[1];da[i*4+2]=r[2];da[i*4+3]=r.length>5?r[5]:255;Hh[i]=r[3];Rr[i]=r[4];}
  ga.putImageData(ia,0,0);
  /* normal = normalize(-dh/du*k, -dh/dv*k, 1); canvas rows grow downward while v grows upward */
  const N=document.createElement('canvas');N.width=N.height=n;const gn=N.getContext('2d');const inn=gn.createImageData(n,n),dn=inn.data;
  const Rc=document.createElement('canvas');Rc.width=Rc.height=n;const gr=Rc.getContext('2d');const ir=gr.createImageData(n,n),dr=ir.data;
  const k=(o.bump||4)*n/256;const at=(x,y)=>Hh[((y+n)%n)*n+((x+n)%n)];
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const i=y*n+x;
    const du=(at(x+1,y)-at(x-1,y))*.5,dv=(at(x,y-1)-at(x,y+1))*.5;let nx=-du*k,ny=-dv*k,nz=1;const l=Math.hypot(nx,ny,nz);nx/=l;ny/=l;nz/=l;
    dn[i*4]=(nx*.5+.5)*255;dn[i*4+1]=(ny*.5+.5)*255;dn[i*4+2]=(nz*.5+.5)*255;dn[i*4+3]=255;
    const rv=clamp(Rr[i],0,1)*255;dr[i*4]=rv;dr[i*4+1]=rv;dr[i*4+2]=rv;dr[i*4+3]=255;
    if(o.pack){dn[i*4+2]=rv;}}   /* packed: RG = normal xy, B = roughness (terrain layers) */
  gn.putImageData(inn,0,0);gr.putImageData(ir,0,0);
  const mk=(c,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.encoding=T.sRGBEncoding;if(o.rep)t.repeat.set(o.rep[0],o.rep[1]);return t;};
  return{a:mk(A,true),n:mk(N,false),r:mk(Rc,false)};}
const PB={};window.__PB=PB;
const N2=(u,v,p,o)=>fbmT(u,v,p,o);
/* --- grass turf: thousands of painted blades over soil; height = blade coverage --- */
function turfTex(n,dry,seed){const c=document.createElement('canvas');c.width=c.height=n;const g=c.getContext('2d');
  const base=dry?[92,80,52]:[46,48,28];g.fillStyle=`rgb(${base})`;g.fillRect(0,0,n,n);
  const im0=g.getImageData(0,0,n,n);for(let y=0;y<n;y++)for(let x=0;x<n;x++){const v=fbmT(x/n,y/n,6,3),i=(y*n+x)*4;for(let k=0;k<3;k++)im0.data[i+k]=base[k]*(.7+v*.6);}g.putImageData(im0,0,0);
  let s0=seed;const rr=()=>{s0=(s0*16807)%2147483647;return(s0-1)/2147483646;};
  const N=n*n/9;for(let i=0;i<N;i++){const x=rr()*n,y=rr()*n,l=(3+rr()*9)*n/256,a=-Math.PI/2+(rr()-.5)*1.6;const t=rr();
    /* (the strands stay close to the ground's own tone: pale straw strokes in this texture, raised by the bump map that
       follows its brightness, caught the low sun as bright specks between the grass blades - the white dots at the base
       of the grass) */
    const pal=dry?(t<.6?[112+rr()*22,98+rr()*18,62+rr()*12]:t<.9?[98,88,56]:[76,82,46]):(t<.5?[56+rr()*18,72+rr()*22,32+rr()*10]:t<.85?[72+rr()*16,82+rr()*16,40]:[84,80,50]);
    const sh=.75+rr()*.35;g.strokeStyle=`rgb(${pal[0]*sh|0},${pal[1]*sh|0},${pal[2]*sh|0})`;g.lineWidth=(.8+rr()*.9)*n/256;
    for(const ox of [0,-n,n])for(const oy of [0,-n,n]){if((x+ox<-12||x+ox>n+12)||(y+oy<-12||y+oy>n+12))continue;g.beginPath();g.moveTo(x+ox,y+oy);g.quadraticCurveTo(x+ox+Math.cos(a)*l*.5+(rr()-.5)*2,y+oy+Math.sin(a)*l*.5,x+ox+Math.cos(a)*l,y+oy+Math.sin(a)*l);g.stroke();}}
  return c;}
function pbrFromCanvas(c,rough,o={}){const n=c.width,g=c.getContext('2d'),d=g.getImageData(0,0,n,n).data;const L=new Float32Array(n*n);
  for(let i=0;i<n*n;i++)L[i]=(d[i*4]*.3+d[i*4+1]*.55+d[i*4+2]*.15)/255;
  return pbr(n,(u,v,x,y)=>{const i=y*n+x;const h=L[i];return[d[i*4],d[i*4+1],d[i*4+2],h,rough(h)];},o);}
PB.grass=pbrFromCanvas(turfTex(256,false,7),h=>.95-h*.05,{bump:2.2,pack:true});
PB.dry=pbrFromCanvas(turfTex(256,true,11),h=>.96-h*.04,{bump:2.2,pack:true});
/* --- mud: lumpy clay with tyre/boot impressions and pooled water (low = glossy) --- */
PB.mud=pbr(256,(u,v)=>{const a=N2(u,v,4,5),b=N2(u+.2,v,16,3),c=N2(u,v,48,2);const [w1,w2]=wor(u,v,12,5);
  const h=a*.6+b*.3+c*.1-sstep(.06,0,w2)*.08;const low=sstep(.42,.34,h);
  let col=mixc([74,60,44],[106,88,64],sstep(.35,.7,h));col=mixc(col,[62,52,40],low*.35);
  return[col[0],col[1],col[2],h,.9-low*.15-(1-h)*.1];},{bump:5,pack:true});
/* --- dirt road (u across 7.6 m, v along): compacted clay and fines, two BTR-gauge tyre ruts pressed lower and darker
   with chevron tread prints, loose pebbles thrown out of the ruts, a grassy crown down the middle, ragged grass edges --- */
PB.road=pbr(512,(u,v)=>{const a=N2(u,v,4,5),b=N2(u+.3,v,16,3),c=N2(u,v,64,2),e=N2(u+.6,v+.2,8,4);
  let rut=0,tread=0;for(const rc of [.342,.658]){const d=(u-rc)/(.05+e*.02);const r=Math.exp(-d*d);rut=Math.max(rut,r);
    if(Math.abs(d)<1.4){const ch=Math.sin((v*40+Math.abs(u-rc)*7+N2(u,v,8,2)*.5)*6.2832);tread=Math.max(tread,sstep(.45,.9,ch)*sstep(1.4,.5,Math.abs(d))*sstep(.25,.55,e));}}
  const [s1]=wor(u,v,46,9),[s2]=wor(u+.37,v+.11,90,4);const pb=sstep(.34,.12,s1)*sstep(.42,.6,b)*(1-rut*.85),fp=sstep(.3,.1,s2)*.6*(1-rut*.5);
  const edge=Math.min(u,1-u),crown=Math.exp(-Math.pow((u-.5)/(.06+a*.03),2));
  const gz=sstep(.46,.7,b*.55+c*.45)*(crown*.95+sstep(.17,.05,edge))*(1-rut);
  const h=.5+(a-.5)*.22+(c-.5)*.1-rut*.3+tread*.07+pb*.1*Math.sqrt(Math.max(0,1-s1/.34))+fp*.03+gz*.08+crown*.06;
  let col=mixc([118,104,82],[140,126,102],sstep(.3,.75,a*.7+c*.3));
  col=mixc(col,[84,72,56],rut*(.55+e*.35));col=mixc(col,[72,62,48],tread*rut*.5);
  col=mixc(col,[132,126,114].map(x=>x*(.75+hash(Math.floor(u*46),Math.floor(v*46))*.4)),pb);col=mixc(col,[150,142,128],fp*.5);
  col=mixc(col,[78+c*30,90+c*26,48],gz*.9);
  const al=sstep(.0,.1+a*.07,edge+(c-.5)*.03);
  return[col[0],col[1],col[2],h,.93-rut*.12-tread*rut*.1-pb*.1,al*255];},{bump:3,rep:[1,134]});
/* --- gravel / packed dirt with stones --- */
PB.gravel=pbr(256,(u,v)=>{const [s1,s2]=wor(u,v,26,6);const [t1]=wor(u+.5,v+.5,60,7);const a=N2(u,v,8,4);
  const st=sstep(.42,.2,s1),fine=sstep(.4,.15,t1);let col=mixc([96,86,70],[122,112,96],a);col=mixc(col,[118,111,100],st*.7);col=mixc(col,[110,104,94],fine*.4);
  col=col.map(x=>x*(.85+hash(Math.floor(u*26),Math.floor(v*26))*.3*st));
  return[col[0],col[1],col[2],st*.7+fine*.2+a*.15,.88-st*.12];},{bump:6,pack:true});
/* --- gun finishes (planar-mapped on the parts at ~6 px/mm): worn bluing that goes to bright bare steel on the edges and
   where hands rub it, fine scratches and pitting; dark phosphate; varnished birch with grain and dents; moulded bakelite --- */
PB.blued=pbr(256,(u,v)=>{const a=N2(u,v,8,4),b=N2(u+.4,v,40,2),w=sstep(.62,.8,N2(u*1.3,v*1.3,5,4)),sc=Math.pow(Math.abs(Math.sin((u*.3+v)*170+N2(u,v,20,2)*6)),40);
  const k=34+a*14,bare=[96+b*30,94+b*30,92+b*28];let col=mixc([k*.92,k*.96,k*1.08],bare,w*.55+sc*.2);
  return[col[0],col[1],col[2],.5+b*.1-sc*.1,.48-w*.2-sc*.15+a*.12];},{bump:2,rep:[1,1]});
PB.phos=pbr(256,(u,v)=>{const a=N2(u,v,24,3),b=N2(u,v,90,2),w=sstep(.68,.85,N2(u+.2,v,4,4));const k=44+a*10+b*8;
  let col=mixc([k*.95,k*.99,k*1.06],[78,78,80],w*.35);return[col[0],col[1],col[2],.5+b*.2,.72-w*.18+b*.08];},{bump:2,rep:[1,1]});
PB.birch=pbr(256,(u,v)=>{const g=N2(u*.5,v*4,8,5),f=N2(u,v,60,2);const ring=.5+.5*Math.sin((u*8+g*5)*Math.PI*2);const dent=sstep(.84,.95,N2(u+.6,v,12,2));
  const k=.72+ring*.2+f*.08;let col=[142*k,62*k,36*k];col=mixc(col,[70,32,20],dent*.6);return[col[0],col[1],col[2],.5+ring*.08-dent*.25,.38+f*.12+dent*.3];},{bump:2,rep:[1,1]});
PB.bake=pbr(128,(u,v)=>{const a=N2(u,v,30,3);const k=.8+a*.25;return[84*k,36*k,22*k,.5+a*.15,.42+a*.1];},{bump:2,rep:[1,1]});
/* black glass-filled polyamide: fine moulded stipple, a faint plum cast, rubbed-smooth highlights; magazine one shade warmer;
   checkered grip panel (1.6 mm pyramids) */
PB.poly=pbr(256,(u,v)=>{const a=N2(u,v,12,3),b=N2(u,v,140,2),w=sstep(.66,.86,N2(u+.3,v,5,4));const k=40+a*7;
  const col=mixc([k*.95,k*.98,k*1.07],[54,55,58],w*.4);return[col[0],col[1],col[2],.5+b*.25,.5-w*.18+a*.06];},{bump:1.4,rep:[1,1]});
PB.polyMag=pbr(256,(u,v)=>{const a=N2(u+.5,v,12,3),b=N2(u,v,140,2),w=sstep(.68,.88,N2(u,v+.3,5,4));const k=42+a*7;
  const col=mixc([k*1.05,k*.98,k*1.0],[58,56,57],w*.4);return[col[0],col[1],col[2],.5+b*.25,.6-w*.2+a*.06];},{bump:1.4,rep:[1,1]});
PB.chk=pbr(128,(u,v)=>{const cu=Math.abs((u*24)%1-.5),cv=Math.abs((v*24)%1-.5);const h=1-Math.max(cu,cv)*2;const a=N2(u,v,8,2);const k=36+a*5+h*6;
  return[k,k,k*1.03,h,.62-h*.12];},{bump:7,rep:[1,1]});
/* hot-dip galvanised steel: zinc spangle cells of slightly different sheen, dull white-rust bloom, light scratches */
PB.galv=pbr(256,(u,v)=>{const [f1,f2]=wor(u,v,9,3);const cell=hash(Math.floor(u*9*3+f1*5),Math.floor(v*9*3));const a=N2(u,v,6,4),b=N2(u,v,60,2);
  const bloom=sstep(.6,.8,N2(u+.4,v,4,4));const k=138+cell*22+(a-.5)*20;let col=mixc([k,k*1.01,k*1.03],[176,176,170],bloom*.5);
  return[col[0],col[1],col[2],.5+sstep(0,.06,f2)*.08+b*.05,.42+cell*.12+bloom*.25];},{bump:1.5,rep:[1,1]});
/* --- objects (classic three maps) --- */
PB.concrete=pbr(512,(u,v)=>{const n=N2(u,v,4,5),m=N2(u,v,24,3),st=N2(u*.25,v*1.8,6,3);const [c1,c2]=wor(u,v,5,3);
  let k=138+(n-.5)*46+(m-.5)*16;let c=[k,k*.985,k*.94];const streak=sstep(.55,.8,st)*(.4+.6*v);c=mixc(c,[86,82,74],streak*.7);
  const rustR=sstep(.75,.85,N2(u*.2,v*2.2,9,2))*v;c=mixc(c,[120,74,44],rustR*.6);
  const crack=sstep(.022,0,c2)*sstep(.68,.76,N2(u,v,3,3))*.8;c=mixc(c,[40,38,34],crack);const pit=sstep(.85,.9,N2(u,v,80,1));c=c.map(x=>x*(1-pit*.3));
  return[c[0],c[1],c[2],.55+n*.15+m*.1-crack*.5-pit*.3,.86+m*.1-streak*.15];},{bump:5,rep:[1,1]});
/* precast concrete - cast in steel forms, so smooth: a fine aggregate speckle and pinholes from trapped air, the cement
   skin mottled by curing, darker where the rain has run down it and grimy at the foot; only the odd hairline crack */
PB.precast=pbr(512,(u,v)=>{const n=N2(u,v,3,5),m=N2(u,v,12,3),fine=N2(u,v,96,2),st=N2(u*6,v*.35,6,3);
  let k=150+(n-.5)*30+(m-.5)*12+(fine-.5)*14;let c=[k,k*.985,k*.95];
  const run=sstep(.56,.8,st)*(.3+.7*(1-v));c=mixc(c,[96,94,88],run*.55);c=mixc(c,[92,90,78],sstep(.25,0,v)*.35*(.6+n*.6));
  const pin=sstep(.9,.95,N2(u+.3,v,140,1));c=c.map(x=>x*(1-pin*.45));
  const [h1,h2]=wor(u+.2,v,3,7);const hair=sstep(.01,0,h2)*sstep(.74,.8,N2(u,v,2,3))*.7;c=mixc(c,[60,58,54],hair);
  return[c[0],c[1],c[2],.6+(fine-.5)*.12-pin*.4-hair*.3,.88+run*.06-(m-.5)*.06];},{bump:3});
PB.logs=pbr(512,(u,v)=>{const gr=N2(u*.5,v*6,8,4),n=N2(u,v,4,4),li=N2(u+.2,v,10,3);let k=104+(gr-.5)*70+(n-.5)*40;let c=[k*.92,k*.86,k*.76];
  const split=sstep(.012,0,Math.abs(N2(u*.4,v*3,6,2)-.5))*sstep(.5,.7,n);c=mixc(c,[44,38,30],split*.6);const lich=sstep(.68,.78,li);c=mixc(c,[118,124,92],lich*.6);
  return[c[0],c[1],c[2],.5+(gr-.5)*.7-split*.6+lich*.08,.9+lich*.08];},{bump:7});
PB.planks=pbr(512,(u,v)=>{const b=Math.floor(u*6);const gr=N2(u*4,v*.3,16,4),n=N2(u,v,4,3);const off=hash(b,3);let k=92+off*26+(gr-.5)*46+(n-.5)*26;let c=[k*.94,k*.86,k*.74];
  const fu=(u*6)%1;const seam=sstep(.03,0,Math.min(fu,1-fu));c=mixc(c,[26,22,18],seam);const nd=Math.hypot((fu-.5)*.17,((v*8)%1-.5)*.12);const nail=nd<.0032?1:0,ring=sstep(.007,.003,nd)*(1-nail);c=mixc(c,[52,40,32],nail*.8);c=mixc(c,[86,62,44],ring*.35);
  const grime=sstep(.6,.75,N2(u,v,9,3));c=mixc(c,[70,62,52],grime*.4);return[c[0],c[1],c[2],.55+(gr-.5)*.5-seam*.6-nail*.08,.84+grime*.1-nail*.3];},{bump:6});
PB.boards=pbr(512,(u,v)=>{const b=Math.floor(u*5);const gr=N2(u*5,v*.25,10,4);const k=82+hash(b,7)*24+(gr-.5)*44;const fu=(u*5)%1;
  const seam=sstep(.035,0,Math.min(fu,1-fu));let c=mixc([k*.9,k*.86,k*.8],[22,20,16],seam);c=mixc(c,[64,70,50],sstep(.7,.8,N2(u,v,7,3))*.4);
  return[c[0],c[1],c[2],.55+(gr-.5)*.55-seam*.6,.9];},{bump:6});
PB.white=pbr(512,(u,v)=>{const n=N2(u,v,6,5),m=N2(u,v,3,4),fl=N2(u+.4,v+.2,6,4),fl2=N2(u+.4,v+.2,20,4);
  let c=[198+(n-.5)*26,194+(n-.5)*26,180+(n-.5)*26];const flake=sstep(.66,.69,fl2)*sstep(.45,.6,fl);c=mixc(c,[150,132,108],flake*.8);
  c=mixc(c,[120,118,96],sstep(.6,.75,m)*.35);c=mixc(c,[70,62,52],sstep(.55,.8,N2(u*.4,v,4,3))*v*.5);return[c[0],c[1],c[2],.6+n*.1-flake*.35,.95];},{bump:4});
/* painted armour steel: semi-gloss olive, rough chips to primer, rust blooms, dust */
PB.paint=pbr(512,(u,v)=>{const n=N2(u,v,4,5),m=N2(u,v,24,3),s=N2(u*.2,v*2,6,3);const [w1,w2]=wor(u,v,18,4);
  let c=[72+(n-.5)*12,82+(n-.5)*12,56+(n-.5)*9];const dust=sstep(.6,.78,s)*.4;c=mixc(c,[104,96,70],dust);
  const chip=sstep(.2,.12,w1)*sstep(.62,.72,N2(u,v,10,3));c=mixc(c,[52,48,40],chip);const rs=sstep(.86,.9,N2(u,v,12,2));c=mixc(c,[100,66,40],rs*.45);
  c=mixc(c,[110,108,80],sstep(.6,.8,m)*.15);return[c[0],c[1],c[2],.6-chip*.35-rs*.15+(n-.5)*.1,.55+dust*.35+chip*.25+rs*.35];},{bump:3});
/* --- fired clay brick in running bond, lime mortar: four bricks across and fourteen courses up per tile (about a metre
   each way at 1 unit = 1 m); each brick its own colour - most a dull red-brown, some over-fired dark, a few pale - with
   a sanded face, chipped arrises and the odd spall; the joints recessed and crumbly --- */
PB.brick=pbr(512,(u,v,x,y)=>{const R=14,Cn=4;const row=Math.floor(v*R),fv=v*R-row,off=(row%2)*.5,bu=u*Cn+off,col=Math.floor(bu),fu=bu-col,ci=((col%Cn)+Cn)%Cn;
  const h0=hash(ci*7+1,row*13+3),h1=hash(ci*3+5,row*5+11),n=N2(u,v,24,3),f=N2(u,v,96,2),ch=N2(u*3.1,v*3.1,40,3);
  const ex=Math.min(fu,1-fu)*128,ey=Math.min(fv,1-fv)*(512/R);const chip=(ch-.5)*4.2+(h1>.85?(N2(u+.3,v,30,2)-.4)*6:0);const e=Math.min(ex,ey)+chip;
  if(e<2.6){const m=N2(u,v,60,3);const k=.78+m*.3;return[146*k,140*k,128*k,.12+m*.08,.97];}
  const tone=h0<.62?[128,58,42]:h0<.8?[104,44,34]:h0<.92?[150,82,58]:[82,42,36];const k=.84+n*.24+(f-.5)*.12;const sp=f>.78?.85:1;
  const face=sstep(2.6,5.5,e);return[tone[0]*k*sp,tone[1]*k*sp,tone[2]*k*sp,.55+face*.35+(f-.5)*.08,.9-f*.06];},{bump:5});
/* --- lime render over brick, painted: the trowel's soft swirl, hairline cracks, damp blooms low down, and here and
   there the render fallen away to show the brick behind (height drops there). Neutral pale: tinted by the material --- */
PB.plaster=pbr(512,(u,v,x,y)=>{const n=N2(u,v,4,5),m=N2(u,v,18,3),f=N2(u,v,80,2),sw=N2(u*1.6+.3,v*1.6,6,4);const [c1,c2]=wor(u,v,7,9);
  const crack=sstep(.035,0,c2)*sstep(.45,.6,N2(u+.5,v+.2,5,3));const fall=sstep(.66,.72,N2(u*.9+.7,v*.9+.1,3,5));
  if(fall>.01){const row=Math.floor(v*28),off=(row%2)*.5,bu=u*8+off,fu=bu-Math.floor(bu),fv=v*28-row,mor=Math.min(fu,1-fu)*64<2.4||Math.min(fv,1-fv)*18<1.8;
    const br=mor?[150,144,134]:[124+f*20,62+f*10,46+f*8];const edge=sstep(.66,.69,N2(u*.9+.7,v*.9+.1,3,5))*(1-sstep(.69,.72,N2(u*.9+.7,v*.9+.1,3,5)));
    const k=1-fall;return[br[0]*fall+236*k-edge*40,br[1]*fall+232*k-edge*40,br[2]*fall+222*k-edge*40,.15-(mor?.05:0),.95];}
  const k=.93+(n-.5)*.1+(sw-.5)*.06+(f-.5)*.04-crack*.25;const damp=sstep(.55,.85,N2(u,v*.6+.3,3,4))*.08;
  return[238*k*(1-damp),234*k*(1-damp),224*k*(1-damp*1.2),.5+(sw-.5)*.12+(f-.5)*.05-crack*.2,.9-f*.05];},{bump:3});
PB.rust=pbr(256,(u,v)=>{const n=N2(u,v,6,5),m=N2(u,v,20,3),f=N2(u,v,60,2);let c=[112+(n-.5)*60,62+(n-.5)*36,34+(n-.5)*20];const pt=sstep(.55,.7,m);c=mixc(c,[64,68,54],pt*.6);
  const scale=sstep(.7,.8,n);c=mixc(c,[40,26,18],scale*.6);return[c[0],c[1],c[2],.4+n*.4+f*.15+scale*.2,.93-pt*.35];},{bump:6});
PB.metal=pbr(256,(u,v)=>{const n=N2(u,v,8,4),br=N2(u*.2,v*14,10,2),sc=sstep(.8,.86,N2(u,v,30,2));const k=100+n*30+br*20-sc*30;
  return[k,k*1.01,k*1.03,.5+br*.1-sc*.2,.32+n*.2+sc*.3];},{bump:2});
PB.corrug=pbr(256,(u,v)=>{const sn=Math.sin(u*Math.PI*16);const n=N2(u,v,6,4);let c=[(76+sn*14)*(.8+n*.4),(86+sn*14)*(.8+n*.4),(60+sn*10)*(.8+n*.4)];
  const run=sstep(.62,.8,N2(u*2,v*.3,8,3))*(1-v);c=mixc(c,[110,62,36],run*.75);return[c[0],c[1],c[2],.5+sn*.45,.6+run*.3+n*.1];},{bump:8,rep:[4,1]});
PB.canvas=pbr(512,(u,v,x,y)=>{const n=N2(u,v,6,4),m=N2(u,v,30,2);const wv=((x+y)%3===0)?.93:1;let c=[96+n*24,102+n*22,68+n*16].map(q=>q*wv);
  c=mixc(c,[60,58,42],sstep(.6,.8,m)*.4);c=mixc(c,[86,74,54],sstep(.7,1,v)*.6);return[c[0],c[1],c[2],.5+(wv-1)*2+n*.15,.95];},{bump:3,rep:[3,2]});
/* swap the new sets into the existing materials */
function usePBR(m,p,ns=1){m.map=p.a;m.normalMap=p.n;m.normalScale=new T.Vector2(ns,ns);m.roughnessMap=p.r;m.roughness=1;m.bumpMap=null;m.needsUpdate=true;}
[[M.concrete,PB.concrete,1],[M.logs,PB.logs,1.2],[M.post,PB.logs,1.2],[M.planks,PB.planks,1],[M.boards,PB.boards,1],[M.wood,PB.boards,1],[M.white,PB.white,.8],
 [M.paint,PB.paint,.8],[M.paintP,PB.paint,.8],[M.rust,PB.rust,1.1],[M.corrug,PB.corrug,1],[M.canvas,PB.canvas,.7]].forEach(([m,p,s])=>m&&usePBR(m,p,s));
M.steel.normalMap=PB.metal.n;M.steel.roughnessMap=PB.metal.r;M.steel.roughness=1;
M.trimWhite.normalMap=PB.white.n;M.blue.normalMap=PB.white.n;M.blue.roughnessMap=PB.white.r;
/* wet ground near the base of walls / barrels: darker and glossy below ~35 cm */
function wetBase(m,h=.35){const prev=m.onBeforeCompile;m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);
  s.vertexShader='varying vec3 vWPw;\n'+s.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\n#ifdef USE_INSTANCING\nvWPw=(modelMatrix*instanceMatrix*vec4(transformed,1.0)).xyz;\n#else\nvWPw=(modelMatrix*vec4(transformed,1.0)).xyz;\n#endif');
  s.fragmentShader='varying vec3 vWPw;\n'+s.fragmentShader.replace('#include <lights_physical_fragment>',
    `float wetK=(1.0-smoothstep(${(h*.4).toFixed(3)},${h.toFixed(3)},vWPw.y));diffuseColor.rgb*=1.0-wetK*.42;roughnessFactor=mix(roughnessFactor,0.22,wetK*.85);\n#include <lights_physical_fragment>`);};
  m.customProgramCacheKey=()=>'wet'+h;return m;}
[M.concrete,M.hesco,M.logs,M.white,M.sandbag].forEach(m=>m&&wetBase(m));

/* ---------- splat terrain: grass / dry grass / mud / gravel blended per vertex, wetness darkens and glosses ---------- */
const SPLAT=[PB.grass,PB.dry,PB.mud,PB.gravel];
function splatMat(scale=.45){const m=std({color:0xffffff,vertexColors:true,roughness:1,envMapIntensity:.3});m.extensions={derivatives:true};
  m.onBeforeCompile=s=>{SPLAT.forEach((p,i)=>{s.uniforms['sA'+i]={value:p.a};s.uniforms['sN'+i]={value:p.n};});s.uniforms.sScale={value:scale};
    s.vertexShader='attribute vec4 splat;attribute float wet;varying vec4 vSpl;varying float vWet;varying vec3 vWPt;varying vec3 vWNt;\n'+s.vertexShader.replace('#include <fog_vertex>',
      '#include <fog_vertex>\nvSpl=splat;vWet=wet;vWPt=(modelMatrix*vec4(transformed,1.0)).xyz;vWNt=normalize(mat3(modelMatrix)*objectNormal);');
    const dec=[0,1,2,3].map(i=>`uniform sampler2D sA${i};uniform sampler2D sN${i};`).join('');
    s.fragmentShader=dec+'uniform float sScale;varying vec4 vSpl;varying float vWet;varying vec3 vWPt;varying vec3 vWNt;\n'+
     `vec4 spA(sampler2D t,vec2 uv){return mix(texture2D(t,uv),texture2D(t,uv*.27+vec2(.37,.11)),.35);}
      vec3 spN(sampler2D t,vec2 uv){return texture2D(t,uv).rgb;}
      vec4 SPw;vec3 SPn;float SPr;float SPp;float SPpG;
      float spH(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
      float spV(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(spH(i),spH(i+vec2(1,0)),f.x),mix(spH(i+vec2(0,1)),spH(i+1.),f.x),f.y);}
      void splatEval(){vec2 uv=vWPt.xz*sScale;vec2 uv2=uv*1.13+vec2(.5,.3);
        vec4 a0=spA(sA0,uv),a1=spA(sA1,uv2),a2=spA(sA2,uv*.8),a3=spA(sA3,uv*2.3);
        vec3 n0=spN(sN0,uv),n1=spN(sN1,uv2),n2=spN(sN2,uv*.8),n3=spN(sN3,uv*2.3);
        /* height-aware blend: brighter (taller) texels win at the borders */
        vec4 w=vSpl*vec4(dot(a0.rgb,vec3(.4))+.4,dot(a1.rgb,vec3(.4))+.4,dot(a2.rgb,vec3(.4))+.4,dot(a3.rgb,vec3(.4))+.4);w=pow(max(w,1e-4),vec4(3.0));w/=dot(w,vec4(1.0));
        SPw=a0*w.x+a1*w.y+a2*w.z+a3*w.w;vec3 np=n0*w.x+n1*w.y+n2*w.z+n3*w.w;SPr=np.b;SPn=vec3(np.xy*2.0-1.0,0.0);SPn.z=sqrt(max(1.0-dot(SPn.xy,SPn.xy),0.0));
        /* standing water: shaped by world-space noise (never repeats with the texture tile), only in mud, more where the
           ground is wet; a darker saturated rim of wet soil round each one */
        vec2 wp=vWPt.xz;float dC=length(vWPt-cameraPosition),fineK=1.-smoothstep(5.,18.,dC);
        /* (the finest ragged edge only close up: further off it broke the puddles into single-pixel mirrors - the white dots) */
        float pn=spV(wp*.43+vec2(17.,3.))*.55+spV(wp*1.7+vec2(3.1,9.))*.3+mix(.075,spV(wp*6.1+7.)*.15,fineK);
        float mudW=smoothstep(.3,.75,w.z)*(.45+.55*clamp(vWet*1.8,0.,1.));
        SPp=smoothstep(.655,.685,pn)*mudW;float rim=clamp(smoothstep(.6,.66,pn)*mudW-SPp,0.,1.);
        SPw.rgb*=(1.-.38*SPp)*(1.-.2*rim);SPw.rgb=mix(SPw.rgb,SPw.rgb*vec3(.92,.95,1.),SPp);
        SPr=mix(mix(SPr,.4,rim),mix(.07,.32,smoothstep(8.,45.,dC)),SPp);SPpG=SPp*(1.-smoothstep(10.,40.,dC));SPn=normalize(mix(SPn,vec3(0.,0.,1.),SPp*.96));}
      `+s.fragmentShader.replace('#include <map_fragment>',`splatEval();diffuseColor*=sRGBToLinear(SPw);diffuseColor.rgb*=1.0-vWet*.38;`)
      .replace('#include <roughnessmap_fragment>',`float roughnessFactor=mix(SPr,0.48,vWet*.75);{vec3 dnx=dFdx(vWNt),dny=dFdy(vWNt);float var_=.25*(dot(dnx,dnx)+dot(dny,dny));roughnessFactor=max(roughnessFactor,clamp(sqrt(var_)*6.+.18,0.,1.)*(1.-SPp*.85));
        /* grass, leaf litter and soil are matte: the texture's roughness channel let little facets in the normal map catch
           the sun at grazing angles, which showed as bright specks scattered over the ground - right where the grass grows.
           Only the standing water keeps its gloss */
        roughnessFactor=max(roughnessFactor,mix(.86,0.,SPp));}`)
      .replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectSpecular*=1.+SPpG*2.2;')
      .replace('#include <normal_fragment_maps>',`{vec3 Nw=normalize(vWNt);vec3 Tw=normalize(vec3(1.,0.,0.)-Nw*Nw.x);vec3 Bw=normalize(cross(Tw,Nw));
        vec3 tn=SPn;tn.xy*=1.0-vWet*.6;vec3 nw=normalize(Tw*tn.x+Bw*tn.y+Nw*tn.z);normal=normalize((viewMatrix*vec4(nw,0.0)).xyz);}`);};
  m.customProgramCacheKey=()=>'splat2';m.userData.soft=true;return m;}

/* ---------- triplanar micro-detail for gear: height (R) + roughness (G) tiles, bump-mapped by screen derivatives ---------- */
function dtex(n,fn){return tex(n,n,(g,w,h)=>{const im=g.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const r=fn(x/w,y/h,x,y),i=(y*w+x)*4;d[i]=r[0]*255;d[i+1]=r[1]*255;d[i+2]=0;d[i+3]=255;}g.putImageData(im,0,0);},{data:true});}
const DT={
  /* ripstop weave: alternating warp/weft threads with a heavier grid every ~5 mm */
  weave:dtex(256,(u,v,x,y)=>{const th=((x>>1)+(y>>1))%2?.62:.38,wx=.5+.5*Math.sin(u*Math.PI*128),wy=.5+.5*Math.sin(v*Math.PI*128);
    const rip=(x%32<2||y%32<2)?.25:0;const n=N2(u,v,8,3);return[clamp(th*.5+(wx*wy)*.3+rip+n*.15,0,1),.88+n*.1];}),
  leather:dtex(256,(u,v)=>{const [p1,p2]=wor(u,v,40,8);const cr=sstep(.6,.66,N2(u*3,v*.6,6,3));const n=N2(u,v,12,3);return[clamp(sstep(.0,.5,p1)*.6+n*.3-cr*.4,0,1),.42+n*.25+cr*.2];}),
  rubber:dtex(128,(u,v)=>{const n=N2(u,v,16,3);return[n,.85+n*.1];}),
  plastic:dtex(128,(u,v)=>{const n=N2(u,v,10,3),f=N2(u,v,40,2);return[n*.5+f*.5,.45+n*.2];}),
  webbing:dtex(128,(u,v,x,y)=>{const r=.5+.5*Math.sin(v*Math.PI*48);const tw=((x>>1)%2)?.2:0;return[r*.7+tw,.9];}),
};
function detailPatch(m,kind,sc,amp=.6,rough=true){const t=DT[kind];m.userData.objSpace=true;const prev=m.onBeforeCompile;m.extensions={derivatives:true};
  m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);s.uniforms.dTex={value:t};s.uniforms.dSc={value:sc};s.uniforms.dAmp={value:amp};
    if(!/varying vec3 vTP;/.test(s.vertexShader))s.vertexShader='varying vec3 vTP;varying vec3 vTN;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTP=position;vTN=normal;');
    let f=s.fragmentShader;if(!/varying vec3 vTP;/.test(f))f='varying vec3 vTP;varying vec3 vTN;\n'+f;
    f='uniform sampler2D dTex;uniform float dSc;uniform float dAmp;\n'+f;
    f=f.replace('void main() {',`vec2 triD(){vec3 bw=pow(abs(normalize(vTN)),vec3(4.0));bw/=dot(bw,vec3(1.0));vec3 p=vTP*dSc;
        return (texture2D(dTex,p.zy).rg*bw.x+texture2D(dTex,p.xz).rg*bw.y+texture2D(dTex,p.xy).rg*bw.z);}
      vec3 dPerturb(vec3 sp,vec3 sn,float h,float fd){vec3 sx=dFdx(sp),sy=dFdy(sp);vec3 pR1=cross(sy,sn),pR2=cross(sn,sx);float det=dot(sx,pR1)*fd;
        vec2 dh=vec2(dFdx(h),dFdy(h));vec3 g=sign(det)*(dh.x*pR1+dh.y*pR2);return normalize(abs(det)*sn-g);}
      void main() {`);
    if(rough)f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nvec2 dD=triD();roughnessFactor*=dD.g*1.15;');
    else f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nvec2 dD=triD();');
    f=f.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=dPerturb(-vViewPosition,normal,dD.r*dAmp*.004,faceDirection);');
    s.fragmentShader=f;};
  const ck=m.customProgramCacheKey?m.customProgramCacheKey():'';m.customProgramCacheKey=()=>ck+'det'+kind;return m;}
/* olive paint mostly eaten by rust: wreck bodywork */
PB.rustpaint=pbr(512,(u,v)=>{const n=N2(u,v,3,5),m=N2(u,v,14,4),f=N2(u,v,50,2),st=N2(u*.3,v*2,6,3);const [w1]=wor(u,v,9,12);
  const paint=sstep(.58,.48,n+(m-.5)*.4+v*.12);let c=[72+(m-.5)*16,80+(m-.5)*16,52+(m-.5)*12];c=mixc(c,[104,98,74],sstep(.6,.8,st)*.5);
  const rust=[104+(f-.5)*50,58+(f-.5)*30,32+(f-.5)*14],dark=[54,34,22];let r=mixc(rust,dark,sstep(.6,.8,m)*.7);
  const flake=sstep(.04,.0,Math.abs(paint-.5))*.5;c=mixc(r,c,paint);c=c.map(x=>x*(1-flake*.4));const streak=sstep(.6,.8,st)*(1-paint)*.4;c=mixc(c,[130,74,40],streak);
  return[c[0],c[1],c[2],.5+paint*.15+f*.15-flake*.2+(1-paint)*m*.15,lerp(.95,.6,paint)];},{bump:6});
M.rustpaint=std({roughness:1});usePBR(M.rustpaint,PB.rustpaint,1.1);
M.olive.normalMap=PB.paint.n;M.olive.roughnessMap=PB.paint.r;M.olive.roughness=1;M.olive.needsUpdate=true;
M.crate.normalMap=PB.planks.n;M.crate.normalScale=new T.Vector2(.6,.6);M.crate.needsUpdate=true;
if(M.sandbag){M.sandbag.normalMap=PB.canvas.n;M.sandbag.normalScale=new T.Vector2(1.2,1.2);}
if(M.slate){M.slate.normalMap=PB.corrug.n;M.slate.roughnessMap=PB.rust.r;}

/* road material: PBR road tile; a second, stretched sample and a low-frequency world tint break the 7.6 m repeat;
   water lies in the ruts where world-space noise says so */
function roadMat(){const m=std({map:PB.road.a,normalMap:PB.road.n,roughnessMap:PB.road.r,transparent:true,depthWrite:false,roughness:1,envMapIntensity:.25,
    polygonOffset:true,polygonOffsetFactor:-2,normalScale:new T.Vector2(.9,.9)});
  m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vRW;\n'+s.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nvRW=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='varying vec3 vRW;float rH(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
      'float rV(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(rH(i),rH(i+vec2(1,0)),f.x),mix(rH(i+vec2(0,1)),rH(i+1.),f.x),f.y);}\n'+
      'float RP;\n'+s.fragmentShader
      .replace('#include <map_fragment>',`vec4 tA=texture2D(map,vUv),tB=texture2D(map,vec2(vUv.x,vUv.y*.41+.29));float bw=smoothstep(.3,.7,rV(vRW.xz*.09));
        vec4 texelColor=mapTexelToLinear(mix(tA,vec4(tB.rgb,tA.a),bw*.55));texelColor.rgb*=.86+.28*rV(vRW.xz*.05+5.);
        float ru=max(exp(-pow((vUv.x-.342)/.06,2.)),exp(-pow((vUv.x-.658)/.06,2.)));
        float pn=rV(vRW.xz*vec2(1.1,.35))*.6+rV(vRW.xz*3.3+2.)*.3+rV(vRW.xz*9.)*.1;RP=smoothstep(.6,.64,pn)*ru;
        texelColor.rgb*=1.-.45*RP;diffuseColor*=texelColor;`)
      .replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.04,RP);')
      .replace('#include <aomap_fragment>','#include <aomap_fragment>\nreflectedLight.indirectSpecular*=1.+RP*2.2;')
      .replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=normalize(mix(normal,(viewMatrix*vec4(0.,1.,0.,0.)).xyz,RP*.95));');};
  m.customProgramCacheKey=()=>'road2';return m;}
/* ---------- rocks: an icosphere welded smooth, pushed out by smooth and ridged 3D noise, cut by a few flat fracture
   planes (the faces a rock splits along), the bottom flattened to sit; coloured darker down in the crevices, paler on
   the worn edges, mossy on top when asked. Variants are cached by seed. ---------- */
function n3(x,y,z){const xi=Math.floor(x),yi=Math.floor(y),zi=Math.floor(z);let xf=x-xi,yf=y-yi,zf=z-zi;xf=xf*xf*(3-2*xf);yf=yf*yf*(3-2*yf);zf=zf*zf*(3-2*zf);
  const h=(a,b,c)=>{let n=Math.imul(a,374761393)^Math.imul(b,668265263)^Math.imul(c,1274126177);n=Math.imul(n^(n>>>13),1274126177);return((n^(n>>>16))>>>0)/4294967295;};
  const l=(a,b,t)=>a+(b-a)*t;
  return l(l(l(h(xi,yi,zi),h(xi+1,yi,zi),xf),l(h(xi,yi+1,zi),h(xi+1,yi+1,zi),xf),yf),l(l(h(xi,yi,zi+1),h(xi+1,yi,zi+1),xf),l(h(xi,yi+1,zi+1),h(xi+1,yi+1,zi+1),xf),yf),zf);}
function weldGeo(g){const p=g.attributes.position,map=new Map(),pos=[],idx=[];for(let i=0;i<p.count;i++){const k=Math.round(p.getX(i)*1e4)+','+Math.round(p.getY(i)*1e4)+','+Math.round(p.getZ(i)*1e4);
    let j=map.get(k);if(j===undefined){j=pos.length/3;map.set(k,j);pos.push(p.getX(i),p.getY(i),p.getZ(i));}idx.push(j);}
  const o=new T.BufferGeometry();o.setAttribute('position',new T.Float32BufferAttribute(pos,3));o.setIndex(idx);return o;}
const _rockC={};
function rockGeo(seed=0,o={}){const key=seed+'|'+(o.detail||4)+'|'+(o.flat||.62)+'|'+(o.moss||0)+'|'+(o.col||'');if(_rockC[key])return _rockC[key];
  const g=weldGeo(new T.IcosahedronGeometry(1,o.detail||4));const p=g.attributes.position,r=rng(seed*7+3),off=seed*13.7+r()*50;
  const planes=[];const np=3+Math.floor(r()*3);for(let i=0;i<np;i++)planes.push([V3(r()*2-1,r()*1.4-.4,r()*2-1).normalize(),.5+r()*.32]);
  const sx=.82+r()*.45,sy=(o.flat||.62)*(.8+r()*.4),sz=.82+r()*.45,D=new Float32Array(p.count);
  for(let i=0;i<p.count;i++){const v=V3(p.getX(i),p.getY(i),p.getZ(i));
    let d=1+(n3(v.x*1.5+off,v.y*1.5,v.z*1.5)-.5)*.55;const rid=1-Math.abs(n3(v.x*3.6+off,v.y*3.6+7,v.z*3.6)*2-1);d+=(rid-.55)*.14;d+=(n3(v.x*10+off,v.y*10,v.z*10)-.5)*.05;
    v.multiplyScalar(d);for(const [n,dd] of planes){const t=v.dot(n);if(t>dd)v.addScaledVector(n,-(t-dd)*.9);}
    v.x*=sx;v.y*=sy;v.z*=sz;const fb=-.32*sy;if(v.y<fb)v.y=fb+(v.y-fb)*.15;D[i]=d;p.setXYZ(i,v.x,v.y,v.z);}
  g.computeVertexNormals();const nn=g.attributes.normal,uv=new Float32Array(p.count*2),col=new Float32Array(p.count*3);
  /* (vertex colour multiplies the grain texture: about 1 is the texture's own grey) */
  const base=(o.col||[.56,.54,.5]).map(q=>q/.56);
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),ax=Math.abs(nn.getX(i)),ay=Math.abs(nn.getY(i)),az=Math.abs(nn.getZ(i));
    if(ay>=ax&&ay>=az){uv[i*2]=x*.8;uv[i*2+1]=z*.8;}else if(ax>=az){uv[i*2]=z*.8;uv[i*2+1]=y*.8;}else{uv[i*2]=x*.8;uv[i*2+1]=y*.8;}
    const cav=sstep(.9,1.12,D[i]),mot=n3(x*4+off,y*4,z*4),up=sstep(.35,.85,nn.getY(i));
    let c=base.map(q=>q*(.62+cav*.48)*(.85+mot*.3));if(o.moss)c=mixc(c,[.42,.62,.26],up*sstep(.4,.6,n3(x*2.5,y*2.5+3,z*2.5+off))*o.moss);
    c=mixc(c,[.36,.33,.29],sstep(.15,-.25,y/sy)*.5);col.set(c,i*3);}
  g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setAttribute('color',new T.BufferAttribute(col,3));g.computeBoundingSphere();return _rockC[key]=g;}
let _rockM=null;function rockMat(){return _rockM||(_rockM=std({map:PB.precast.a,normalMap:PB.precast.n,normalScale:new T.Vector2(1.6,1.6),vertexColors:true,roughness:.88,envMapIntensity:.3}));}
