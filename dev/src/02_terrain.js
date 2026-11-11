/* ---------- terrain ---------- */
const HX=40,HZ=-380;           // farmhouse centre
const DROPZ=-292;              // BTR drop point in Sector 1
function baseH(x,z){return (fbm(x/90+11,z/90+3,4)-.5)*7+(fbm(x/24+5,z/24,3)-.5)*1.1;}
/* ---------- the village of Staroye Opalikhino along its one dirt street: the street leaves the north road eastward just
   south of the house the patrol died in; houses stand along it on both sides, fronts to the street, each in its own
   fenced yard (outlines here so the ground is levelled for them and the grass, mud and trees know where they are) ---------- */
const VILL={sz:-363.5,x0:0,x1:160,
  /* a lane leaving the street southward between the gardens, bending off toward the fields */
  lane:[[73.5,-364.2],[77.2,-361.2],[80.2,-355],[83.2,-344],[86.6,-332],[89.2,-319],[89.6,-306],[88.2,-292],[85,-279]],
  /* the wheel-ruts that cut the junction's other corner */lane2:[[87.5,-363.8],[84,-360.3],[81.6,-357.4],[80.2,-355]],
  /* each house: centre, facing (0 = front to +z, the street to the north; PI = to the south side; +-PI/2 = onto the lane),
     size, walls (log / log clad in painted boards), roof (slate / painted tin, gable or hip), paint and roof colour, glazed
     veranda (1 small, 2 across the front), an attached covered yard behind (dvor); the vegetable garden behind in the
     house's own frame [x0,x1,z0,z1]; outbuildings [kind, x, z, turn] in the house's frame (+z = toward the street) */
  houses:[
   {id:'n1',x:64,z:-379,yaw:0,W:7.2,D:6.2,clad:0,roof:'tin',col:0x5d7f52,rc:0x7a3a2c,enter:1,ver:1,fence:'picket',
    garden:[-7,4.4,-21,-7.5],out:[['cellar',7.0,-4.6,0],['saray',-6.2,-3.4,Math.PI/2],['wood',-6.2,1.1,Math.PI/2],['wc',4,-22.5,Math.PI]]},
   {id:'n2',x:86,z:-387,yaw:0,W:9.6,D:7.2,clad:1,hip:1,roof:'tin',col:0x4f7899,rc:0x46684a,enter:1,ver:2,fence:'board',
    garden:[-8,9,-24,-7.5],out:[['banya',-8.4,-4,Math.PI/2],['cellar',7.6,-3.2,-Math.PI/2],['green',6,-19,0],['saray',-8.6,2.8,Math.PI/2],['wc',-6,-25.5,Math.PI/2]]},
   {id:'n3',x:113,z:-377.5,yaw:0,W:6.2,D:5.4,clad:0,roof:'slate',col:0x8a5a3a,boarded:1,ruin:'collapse',fence:'rail',
    garden:[-5,6,-15,-5],out:[['saray',5.6,-2.6,-Math.PI/2],['wood',-5.6,-1.2,Math.PI/2]]},
   {id:'n4',x:140,z:-381,yaw:0,W:7.6,D:6.4,clad:0,roof:'slate',col:0x6c6f72,enter:1,dvor:1,fence:'picket',
    garden:[-9,8,-28,-14],out:[['cellar',-6.6,-5,Math.PI/2],['banya',11.5,-14.5,-Math.PI/2],['wood',6.4,-1.2,-Math.PI/2]]},
   {id:'s1',x:21,z:-351,yaw:Math.PI,W:6.6,D:5.8,clad:0,roof:'slate',col:0x4f7899,enter:1,fence:'picket',
    garden:[-6,7,-19,-6],out:[['cellar',6.4,-3.6,-Math.PI/2],['saray',-6,-2,Math.PI/2],['green',-2,-22.6,0]]},
   {id:'s2',x:45,z:-346.5,yaw:Math.PI,W:8.4,D:6.6,clad:1,hip:1,roof:'tin',col:0xb08a3a,rc:0x8a3028,enter:1,ver:1,fence:'board',
    garden:[-6,4,-20,-6.5],out:[['cellar',7.0,-6.0,0],['wood',-6.4,.4,Math.PI/2],['wc',3,-21.5,Math.PI]]},
   {id:'s3',x:63,z:-352.5,yaw:Math.PI,W:5.8,D:5,clad:0,roof:'slate',col:0x6a7a5a,boarded:1,burnt:1,fence:'rail',
    garden:[-2,5,-13,-4.5],out:[['saray',5.6,-1.6,-Math.PI/2]]},
   {id:'s4',x:106,z:-350,yaw:Math.PI,W:7,D:6,clad:1,roof:'tin',col:0x5d7f52,rc:0x676c70,enter:1,fence:'picket',
    garden:[-7,7,-15,-6],out:[['cellar',6.2,-3.8,-Math.PI/2],['banya',-10.2,-9,Math.PI/2],['wood',-5.8,-2.5,Math.PI/2],['green',3,-18.4,0]]},
   {id:'s5',x:133,z:-345,yaw:Math.PI,W:10,D:7.4,clad:0,hip:1,roof:'tin',col:0x8a3a32,rc:0x8a3028,enter:1,ver:2,fence:'board',
    garden:[-9,9,-24,-8],out:[['cellar',-8.4,-4.2,Math.PI/2],['saray',8.2,-3.6,-Math.PI/2],['saray',8.2,1.2,-Math.PI/2],['wc',-10.6,-25,Math.PI/2],['green',5,-27.4,0]]},
   {id:'l1',x:71.2,z:-326,yaw:Math.PI/2,W:6.4,D:5.6,clad:0,roof:'slate',col:0x6a7a5a,boarded:1,fence:'rail',
    garden:[-5,5,-15,-5],out:[['cellar',-6.6,-1.5,Math.PI/2]]},
   {id:'l2',x:100,z:-318,yaw:-Math.PI/2,W:7.6,D:6.2,clad:1,roof:'tin',col:0x3f5f8f,rc:0x8a3028,enter:1,fence:'picket',
    garden:[-6,3.5,-13,-6],out:[['cellar',6.0,-6.3,0],['saray',-6.4,-3.2,Math.PI/2],['green',-2.5,-16.3,0]]},
   /* Polevaya street, off the lane south-east toward the fields: b1, b4 on its south side, b2, b5 on its north */
   {id:'b1',x:112,z:-275.6,yaw:Math.PI,W:7.4,D:6.2,clad:1,roof:'tin',col:0x7a8a5a,rc:0x5a3a30,enter:1,ver:1,fence:'picket',
    garden:[-6,6,-19,-6.5],out:[['cellar',6.4,-3.6,-Math.PI/2],['saray',-6.2,-2.6,Math.PI/2],['wc',3,-21,Math.PI]]},
   {id:'b2',x:134,z:-299.1,yaw:0,W:6.8,D:5.8,clad:0,roof:'slate',col:0x7a5a3a,enter:1,fence:'picket',
    garden:[-6,6,-12,-5],out:[['wood',-6,-1.5,Math.PI/2],['cellar',6.2,-2.8,-Math.PI/2]]},
   {id:'b4',x:147,z:-265.5,yaw:Math.PI,W:7,D:6,clad:1,roof:'tin',col:0x9a8a5a,rc:0x4a5a6a,enter:1,fence:'board',
    garden:[-6,6,-17,-6],out:[['cellar',-6,-3.5,Math.PI/2],['saray',6,-2,-Math.PI/2],['green',-2,-21,0]]},
   {id:'b5',x:168,z:-288.3,yaw:0,W:6.4,D:5.8,clad:0,roof:'slate',col:0x6a6a5a,boarded:1,ruin:'strike',breach:['west',-1.3,.5],hole:[1,4,5],fence:'rail',
    garden:[-5,5,-14,-5],out:[['saray',5.9,-2.4,-Math.PI/2]]},
   /* Lesnaya street, leaving the main street's east end north-east toward the forest: c1 on its east side, c2 on its west */
   {id:'c1',x:181.8,z:-384,yaw:-Math.PI/2,W:7.2,D:6,clad:0,roof:'tin',col:0x4a6a8a,rc:0x6a3a2c,enter:1,ver:1,fence:'picket',
    garden:[-6,6,-20,-6.5],out:[['cellar',6.2,-3.6,-Math.PI/2],['saray',-6.2,-2.4,Math.PI/2],['wc',-4,-22,Math.PI]]},
   {id:'c2',x:163.2,z:-424,yaw:Math.PI/2,W:6.2,D:5.6,clad:0,roof:'slate',col:0x5a6a4a,boarded:1,fence:'rail',
    garden:[-5,5,-14,-5],out:[['wood',5.4,-1.8,-Math.PI/2]]}]};
/* the two newer streets (the kolkhoz built them in the sixties): each bends away from the street it leaves at a slant */
VILL.streets=[[[89.5,-302],[95,-298.5],[103,-296],[112,-293.5],[122,-290],[140,-283.5],[160,-277],[180,-271],[198,-266]],
  [[150,-363],[156,-370],[163,-380],[168,-392],[171,-405],[175,-418],[183,-431],[194,-442]]];
/* a point in a house's own frame -> the world (the same turn the house group gets) */
function villW(h,lx,lz){const c=Math.cos(h.yaw),s=Math.sin(h.yaw);return[h.x+lx*c+lz*s,h.z-lx*s+lz*c];}
/* a box in a house's frame -> its world-aligned rectangle (the houses only ever turn by quarter turns) */
function villRect(h,a0,a1,b0,b1){const P=[villW(h,a0,b0),villW(h,a1,b0),villW(h,a0,b1),villW(h,a1,b1)];return{x1:Math.min(...P.map(p=>p[0])),x2:Math.max(...P.map(p=>p[0])),z1:Math.min(...P.map(p=>p[1])),z2:Math.max(...P.map(p=>p[1]))};}
VILL.houses.forEach(h=>{const r=villRect(h,-h.W/2,h.W/2,-h.D/2-(h.dvor?7.2:0),h.D/2);h.box=r;h.gbox=villRect(h,...h.garden);
  /* the plot: the fence goes round the house, its yard, the outbuildings (with the cellar's earth bank) and the garden */
  const W=h.W,D=h.D,g=h.garden;let x0=Math.min(-W/2-4.2,g[0]-1),x1=Math.max(W/2+4.2,g[1]+1),z0=g[2]-1.2,z1=D/2+(h.ver?2.3:0)+3.6;
  for(const o of h.out){const rr=o[0]==='green'?3.2:o[0]==='banya'?2.4:2.1;x0=Math.min(x0,o[1]-rr);x1=Math.max(x1,o[1]+rr);z0=Math.min(z0,o[2]-rr);
    if(o[0]==='cellar'){const bx=o[1]-3.55*Math.sin(o[3]),bz=o[2]-3.55*Math.cos(o[3]),sw=Math.abs(Math.sin(o[3]))>.5,ex=(sw?2.4:1.9)+.6,ez=(sw?1.9:2.4)+.6;x0=Math.min(x0,bx-ex);x1=Math.max(x1,bx+ex);z0=Math.min(z0,bz-ez);}}
  h.plotL=[x0,x1,z0,z1];h.prect=villRect(h,x0,x1,z0,z1);});
/* footpaths: trodden earth between the plots - to the fields behind the north gardens, round the south side to the lane's
   end, between the two plots on the east, out to the well, and a short cut across the meadow toward the forest */
VILL.paths=[[[52,-366],[51.6,-379],[51.4,-392],[52.6,-404],[57,-412.5],[66,-418],[84,-421],[104,-419.5],[124,-417.5],[146,-414.5],[158,-412.6],[170.2,-406.8]],
  [[54.4,-362],[54.4,-350],[54.4,-341],[54.5,-337.2],[57,-335.9],[64,-335.8],[72,-335.6],[78,-336.4],[84.6,-338.2]],
  [[32.3,-362],[32.4,-348],[32.3,-334],[32.6,-322],[35.8,-312],[39.5,-301]],
  [[123.4,-366],[123.6,-378],[123.9,-392],[123.8,-405],[124,-416.5]],
  [[102.7,-366],[102.6,-380],[102.9,-394],[102.7,-408],[103,-419.6]],
  [[120.6,-361],[120.7,-345],[120.8,-330],[121.1,-312],[121.6,-290.5]],
  [[75.2,-362.6],[74.5,-359.4],[74.1,-355.4]],
  [[151,-361],[151.8,-346],[152.5,-331],[154,-316],[156,-300],[157.5,-279]],
  [[13,-366.6],[11.6,-374],[12.4,-384],[17,-397],[30,-405],[42,-409],[52.6,-404]]];
VILL.well={x:74.0,z:-353.4};
/* which of the paths are alleys (proper lanes between the fences, hedged with lilac and elder) and over what stretch */
VILL.alleys=[[2,-361,-324],[3,-366,-414],[4,-366,-417],[5,-360,-292]];
VILL.alleyW={2:.45,3:.4,4:.5,5:.35};
function villPathD(x,z){let d=99;VILL.paths.forEach((L,pi)=>{const w=VILL.alleyW&&VILL.alleyW[pi]||0;for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1];if(Math.abs(x-ax)>40&&Math.abs(x-bx)>40)continue;const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-ax-dx*t,z-az-dz*t)+Math.sin(x*1.7+z*1.3)*.08-w);}});return d;}
function villLaneD(x,z){let d=99;for(const L of [VILL.lane,VILL.lane2])for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1];const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-ax-dx*t,z-az-dz*t));}return d;}
/* the street's centre line: a gentle wander, and at its west end it swings north-west to run into the north road at a
   slant (carts and lorries turned north there, toward the house); the ruts of the few that turned south cut the other corner */
function polyD(L,x,z){let d=99;for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1];const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-ax-dx*t,z-az-dz*t));}return d;}
function villSZ(x){const k=x<26?(26-x)/26:0;return VILL.sz+Math.sin(x*.045)*1.2-k*k*12;}
function villSZd(x){const k=x<26?(26-x)/26:0;return Math.cos(x*.045)*.054+k*24/26;}
VILL.cut=[[1.6,-354.5],[5.2,-359.4],[10.5,-362.8],[17,-364.9]];
function villCutD(x,z){const L=VILL.cut;let d=99;for(let i=0;i<L.length-1;i++){const [ax,az]=L[i],[bx,bz]=L[i+1];const dx=bx-ax,dz=bz-az,t=Math.max(0,Math.min(1,((x-ax)*dx+(z-az)*dz)/(dx*dx+dz*dz)));d=Math.min(d,Math.hypot(x-ax-dx*t,z-az-dz*t));}return d;}
function villStreetD(x,z){let d=99;if(x>VILL.x0-2&&x<VILL.x1+6)d=Math.abs(z-villSZ(x))/Math.hypot(1,villSZd(x));if(x>-2&&x<20&&z>-368&&z<-350)d=Math.min(d,villCutD(x,z)*1.35);if(x>85&&x<200&&z>-446&&z<-260)for(const L of VILL.streets)d=Math.min(d,polyD(L,x,z));if(x>70&&x<100&&z>-366&&z<-275)d=Math.min(d,villLaneD(x,z)*1.15);return d;}
function villGarden(x,z){for(const h of VILL.houses){const g=h.gbox;if(x>g.x1&&x<g.x2&&z>g.z1&&z<g.z2)return Math.min(x-g.x1,g.x2-x,z-g.z1,g.z2-z);}return -1;}
function flatW(x,z){let m=sstep(4.5,16,Math.abs(x));
  const dF=Math.max(Math.abs(x)-46,Math.abs(z)-38);m*=sstep(0,18,dF);
  m*=sstep(11,26,Math.hypot(x-HX,z-HZ));
  for(const h of VILL.houses){const d=Math.hypot(x-h.x,z-h.z);if(d<30)m*=sstep(10,24,d);}
  {const d=villStreetD(x,z);if(d<14)m*=sstep(3,12,d);}
  return m;}
/* ---------- the country west of the highway (chapter 3): a forest belt, the old collective field cut into blocks by
   shelterbelts, the old district road, a wet slope where the fog lies, and the flooded basin with the lumber yard on its
   far shore ---------- */
const W3={path:[[-708,-352],[-726,-360],[-744,-350],[-760,-356],[-778,-344],[-796,-350],[-812,-338],[-828,-344],[-846,-336],[-860,-337]],fieldX0:-470,fieldX1:-640,roadX:-656,basin:{x:-792,z:-372,rx:92,rz:124},wl:-4.5,yard:{x:-874,z:-336},clear:{x:-398,z:-392,r:17}};
function fieldK(x,z){return sstep(-462,-480,x)*sstep(-646,-630,x)*sstep(-505,-490,z)*sstep(-238,-252,z);}
function basinK(x,z){const b=W3.basin;const u=(x-b.x)/b.rx,v=(z-b.z)/b.rz;const r=Math.sqrt(u*u+v*v)*(1+.08*Math.sin(Math.atan2(v,u)*3+1));return r;}
function westH(x,z){if(x>-330)return 0;let h=0;
  /* the basin: a broad, shallow bowl ~5 m deep; its floor is uneven - low hummocks and old field ridges stand out of
     the water as broken paths, drowned hollows between */
  const r=basinK(x,z);if(r<1.35){const d=sstep(1.35,.62,r);const fl=(fbm(x/17+7,z/17-3,3)-.5)*4.4+(fbm(x/6+1,z/6,2)-.5)*.8;
    /* old field dykes running east-west make the spotty paths across */
    const dyke=Math.min(1,Math.max(0,1.5-Math.abs(((z+372)%22+22)%22-11)/2.4))*1.1*sstep(.3,.5,fbm(x/30,z/9+4,2))*sstep(.32,.46,fbm(x/11+3,z/11,2));
    h+=-4.95*d+(fl+dyke)*d*sstep(.35,.85,d);}
  /* the old field causeway that once crossed the bottom: a low embankment meandering from the east shore to the lumber
     yard, sunk in places so the water runs over it (knee-deep wading), with side spurs to islands */
  if(r<1.2){let best=9,sAt=0,acc=0;const P=W3.path;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz,L=Math.sqrt(l2);
      let t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;const d=Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t);if(d<best){best=d;sAt=acc+t*L;}acc+=L;}
    if(best<4.5){const sunk=Math.sin(sAt*.11+1.3)>.72;const top=W3.wl+(sunk?-.28:.32)+(fbm(x/4,z/4,2)-.5)*.12;h=lerp(Math.max(h,top-.6),top,sstep(4.5,1.6,best));}}
  /* the dry knoll of the lumber yard on the far shore */
  {const dy=Math.hypot((x-W3.yard.x)/16,(z-W3.yard.z)/13);if(dy<1.6)h=lerp(h,-1.0,sstep(1.6,.8,dy));}
  return h;}
/* ---------- west of the lumber yard (beyond the old map edge): a muddy footpath from behind the shack through tall grass and
   a small tree line out to a single-lane asphalt road that runs a long way south-west toward the fighting. The ground
   there is the same rolling country (H0); the road and the path are cut into it here so every height query agrees. ---------- */
const WX={X:-905,trail:[[-883.5,-333.5],[-891,-331],[-899,-334],[-907,-331.5],[-915,-327.5],[-923,-329.5],[-931,-326],[-939,-324.5],[-946,-323.5],[-953,-322.5]],
  road:[[-962,-120],[-958,-190],[-954,-255],[-952,-300],[-955,-340],[-968,-382],[-992,-420],[-1030,-455],[-1080,-484],[-1140,-506],[-1205,-523],[-1275,-536],[-1350,-546],[-1430,-556],[-1510,-568],[-1590,-584],[-1680,-604],[-1780,-626]],
  P:null,hw:3.1,end:-1445,box:{x0:-1700,x1:-905,z0:-660,z1:-130}};
/* the road sampled every 2 m with a smoothed height (it lies over the country, cut a little through rises) */
function wxInit(){if(WX.P)return;const cr=new T.CatmullRomCurve3(WX.road.map(p=>V3(p[0],0,p[1])),false,'centripetal');const n=Math.round(cr.getLength()/2);const P=[];
  for(let i=0;i<=n;i++){const q=cr.getPointAt(i/n);P.push({x:q.x,z:q.z,s:i*2,y:H0(q.x,q.z)});}
  for(let it=0;it<6;it++){const y=P.map(p=>p.y);for(let i=0;i<P.length;i++){let a=0,w=0;for(let k=-6;k<=6;k++){const j=clamp(i+k,0,P.length-1);a+=y[j];w++;}P[i].y=a/w;}}
  WX.P=P;const B=16;WX.B=B;WX.cells=new Map();for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];for(const q of [a,b]){const k=Math.floor(q.x/B)+','+Math.floor(q.z/B);if(!WX.cells.has(k))WX.cells.set(k,new Set());WX.cells.get(k).add(i);}}}
/* nearest point of the road: distance, height there, distance along it, side */
const WXQ={d:1e9,y:0,s:0,side:1};
function wxRoad(x,z){wxInit();const P=WX.P,B=WX.B;let best=1e9,y=0,s=0,side=1;const cx=Math.floor(x/B),cz=Math.floor(z/B);
  for(let i_=-1;i_<=1;i_++)for(let j_=-1;j_<=1;j_++){const c=WX.cells.get((cx+i_)+','+(cz+j_));if(!c)continue;for(const i of c){const a=P[i],b=P[i+1];if(!b)continue;const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;
    let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=t<0?0:t>1?1:t;const px=a.x+dx*t,pz=a.z+dz*t;const d=Math.hypot(x-px,z-pz);if(d<best){best=d;y=lerp(a.y,b.y,t);s=lerp(a.s,b.s,t);side=Math.sign((x-a.x)*dz-(z-a.z)*dx)||1;}}}
  WXQ.d=best;WXQ.y=y;WXQ.s=s;WXQ.side=side;return WXQ;}
function wxTrail(x,z){const P=WX.trail;let best=1e9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;let t=((x-a[0])*dx+(z-a[1])*dz)/l2;t=t<0?0:t>1?1:t;
    best=Math.min(best,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}return best;}
/* the cross-section of the road: asphalt crown, the soft edge, the shoulder and a shallow ditch, then the field */
function wxRel(d){return d<WX.hw?-.02*(d/WX.hw)*(d/WX.hw):d<WX.hw+.9?-.02-(d-WX.hw)*.05:d<WX.hw+2.6?-.065-.18*Math.sin((d-WX.hw-.9)/1.7*Math.PI):-.065;}
function wxH(x,z,h){if(z<WX.box.z0-80||z>WX.box.z1+80)return h;
  /* the path: worn a few centimetres into the ground, wet and soft */const dt=x>-960?wxTrail(x,z):99;if(dt<1.4)h-=.07*sstep(1.4,.35,dt)*sstep(0,8,WX.X-x);
  const q=wxRoad(x,z);if(q.d<14){const r=q.y+wxRel(q.d);h=q.d<WX.hw+2.6?r:lerp(r,h,sstep(WX.hw+2.6,14,q.d));}
  /* shell holes in the verges and the fields by the road */
  wxCraters();const cl=WX.crG.get(Math.floor(x/24)+','+Math.floor(z/24));if(cl)for(const c of cl){const dx=x-c.x,dz=z-c.z;if(Math.abs(dx)>c.r*1.9||Math.abs(dz)>c.r*1.9)continue;const p=Math.hypot(dx,dz)/c.r;if(p>1.9)continue;
    h+=(p<1?-c.dep*Math.pow(1-p*p,1.25):0)+c.rim*Math.exp(-Math.pow((p-1.02)/.32,2))*sstep(1.9,1.35,p);}
  return h;}
/* where the shells fell: some by the road (none on it - its surface is drawn on its own), more out in the fields */
function wxCraters(){if(WX.cr)return WX.cr;wxInit();const r_=rng(6061),rr=(a,b)=>a+(b-a)*r_();const L=[];const P=WX.P,SL=P[P.length-1].s;
  /* (closer together the further you go: the road runs toward the line) */
  for(let s=90;s<SL-40;s+=rr(28,60)*lerp(1,.42,sstep(.2,.95,s/SL))){const i=Math.round(s/2),p=P[Math.min(i,P.length-1)],a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;
    const sd=r_()<.5?-1:1,off=rr(8.5,17);L.push({x:p.x-dz/l*off*sd,z:p.z+dx/l*off*sd,r:rr(1.6,3.2),dep:rr(.5,1.05),rim:rr(.12,.26)});}
  for(let k=0;k<70;k++){const x=rr(-1640,-990),z=rr(-645,-150);if(wxRoad(x,z).d<11)continue;L.push({x,z,r:rr(2,4.2),dep:rr(.6,1.3),rim:rr(.15,.3)});}
  /* nearer the line the fields are pocked all over; and here and there a rocket salvo has walked across them, a long
     ellipse of smaller, overlapping holes along the line of fire */
  {const q=rng(6062),qq=(a,b)=>a+(b-a)*q();
   for(let k=0;k<95;k++){const x=lerp(-1150,-1690,Math.pow(q(),.75)),z=qq(-645,-150);if(wxRoad(x,z).d<11)continue;L.push({x,z,r:qq(1.6,3.6),dep:qq(.5,1.2),rim:qq(.12,.28),nu:1});}
   for(let k=0;k<7;k++){const cx=qq(-1660,-1180),cz=qq(-630,-170),a=qq(0,6.28),n=6+(q()*6|0);
     for(let j=0;j<n;j++){const t=qq(-1,1),x=cx+Math.cos(a)*t*26+qq(-4,4),z=cz+Math.sin(a)*t*26+qq(-4,4);if(wxRoad(x,z).d<11||z<-650||z>-140)continue;L.push({x,z,r:qq(1.6,2.4),dep:qq(.45,.85),rim:qq(.14,.24),salvo:1});}}}
  /* (a 24 m grid of the holes for the height lookups) */
  WX.crG=new Map();for(const c of L){const r=c.r*1.9;for(let i=Math.floor((c.x-r)/24);i<=Math.floor((c.x+r)/24);i++)for(let j=Math.floor((c.z-r)/24);j<=Math.floor((c.z+r)/24);j++){const k=i+','+j;if(!WX.crG.has(k))WX.crG.set(k,[]);WX.crG.get(k).push(c);}}
  return WX.cr=L;}
function H0(x,z){if(x>-330)return baseH(x,z)*flatW(x,z);const fk=fieldK(x,z),bk=sstep(1.35,.95,basinK(x,z)),yk=sstep(1.6,1,Math.hypot((x-W3.yard.x)/16,(z-W3.yard.z)/13));
  /* (inside the basin and on the yard knoll the heights are absolute - the water level is a fixed height) */
  return baseH(x,z)*flatW(x,z)*(1-.7*fk)*(1-Math.max(bk,yk))+westH(x,z);}
/* ---------- roads beyond Sector 1: a forest track branching west off the north road, and the old highway it joins.
   Each road is a spline sampled every 2 m with a smoothed centre-line height; a spatial hash finds the nearest segment
   so every height query (terrain, grass, trees, the player's feet, the BTR's wheels) agrees with the road meshes. ---------- */
const ROADS=(function(){
  const mk=(pts,type)=>{const cr=new T.CatmullRomCurve3(pts.map(p=>V3(p[0],0,p[1])),false,'centripetal');const n=Math.max(2,Math.round(cr.getLength()/2));
    const P=[];for(let i=0;i<=n;i++){const p=cr.getPointAt(i/n);P.push({x:p.x,z:p.z,s:0,y:0});}
    let s=0;P.forEach((p,i)=>{if(i)s+=Math.hypot(p.x-P[i-1].x,p.z-P[i-1].z);p.s=s;});
    let y=P.map(p=>H0(p.x,p.z));for(let k=0;k<7;k++){const w=7;y=y.map((_,i)=>{let a=0,c=0;for(let j=Math.max(0,i-w);j<=Math.min(y.length-1,i+w);j++){a+=y[j];c++;}return a/c;});}
    P.forEach((p,i)=>p.y=y[i]);return{type,P,L:s};};
  const hw=mk([[-317,-716],[-315,-664],[-312,-604],[-309,-545],[-306,-516],[-302,-470],[-297,-420],[-295,-380],[-298,-320],[-303,-250],[-306,-170],[-304,-80],[-300,20],[-302,120],[-306,220],[-305,324]],1);
  /* the forest track: off the end of the north road it winds south-west through the forest in long bends, down almost to
     the southern edge, then back up to meet the highway */
  const tr=mk([[0,-432],[-4,-444],[-16,-458],[-34,-470],[-50,-489],[-56,-508],[-59,-534],[-61,-562],[-63,-592],[-70,-607],[-96,-607],[-130,-599],[-164,-592],[-192,-588],[-216,-575],[-229,-553],[-237,-529],[-251,-508],[-270,-500],[-289,-507],[-300,-514],[-306,-516]],0);
  /* the track starts level with the north road and ends level with the highway's shoulder */
  const yJ=(()=>{let b=hw.P[0],bd=1e9;for(const p of hw.P){const d=Math.hypot(p.x+306,p.z+516);if(d<bd){bd=d;b=p;}}return b;})();
  tr.P.forEach(p=>{const a=sstep(22,0,p.s),b=sstep(tr.L-26,tr.L,p.s);p.y=lerp(p.y,0,a);p.y=lerp(p.y,yJ.y+.04,b);});
  /* the old district road, north-south between the collective field and the basin: cracked asphalt, never repaired */
  const wr=mk([[-660,-720],[-657,-600],[-652,-500],[-655,-420],[-660,-340],[-657,-250],[-650,-150],[-652,-20],[-658,120],[-655,320]],2);
  /* the old kolkhoz road: out of the woods far to the east, west across the open fields of the southern farm, past a
     windbreak, to meet the highway well south of the forest track - the way the BTR comes after the long drive */
  const dr=mk([[372,-640],[310,-644],[262,-648],[220,-653],[170,-660],[120,-664],[70,-660],[20,-668],[-30,-672],[-80,-665],[-130,-660],[-180,-668],[-225,-671],[-262,-667],[-290,-664],[-307,-664],[-311.2,-664]],0);
  {const yE=(()=>{let b=hw.P[0],bd=1e9;for(const p of hw.P){const d=Math.hypot(p.x+314,p.z+664);if(d<bd){bd=d;b=p;}}return b;})();dr.P.forEach(p=>{const b=sstep(dr.L-30,dr.L,p.s);p.y=lerp(p.y,yE.y+.04,b);});dr.yE=yE;}
  const R={hw,tr,wr,dr,sJ:yJ.s,B:16,x0:-900,z0:-720,nx:0,nz:0,cells:null};R.nx=Math.ceil((400-R.x0)/R.B);R.nz=Math.ceil((380-R.z0)/R.B);R.cells=Array.from({length:R.nx*R.nz},()=>[]);
  [hw,tr,wr,dr].forEach(rd=>{for(let i=0;i<rd.P.length-1;i++){const a=rd.P[i],b=rd.P[i+1],E=34;
    const i0=Math.max(0,Math.floor((Math.min(a.x,b.x)-E-R.x0)/R.B)),i1=Math.min(R.nx-1,Math.floor((Math.max(a.x,b.x)+E-R.x0)/R.B));
    const j0=Math.max(0,Math.floor((Math.min(a.z,b.z)-E-R.z0)/R.B)),j1=Math.min(R.nz-1,Math.floor((Math.max(a.z,b.z)+E-R.z0)/R.B));
    for(let j=j0;j<=j1;j++)for(let k=i0;k<=i1;k++)R.cells[j*R.nx+k].push([rd,i]);}});
  /* which side of the highway the track joins from (its ditch is filled there, as over a culvert) */
  {const a=tr.P[tr.P.length-8];const i=hw.P.findIndex(p=>p.s>=R.sJ);const p=hw.P[i],q=hw.P[i+1];R.sideJ=Math.sign((q.x-p.x)*(a.z-p.z)-(q.z-p.z)*(a.x-p.x));}
  /* and where the kolkhoz road comes in from the east: the ditch filled there too, so the dirt runs onto the asphalt */
  {const e=dr.P[dr.P.length-1];let bi=0,bd=1e9;hw.P.forEach((p,k)=>{const d=Math.hypot(p.x-e.x,p.z-e.z);if(d<bd){bd=d;bi=k;}});R.sJd=hw.P[bi].s;const p=hw.P[Math.max(0,bi-1)],q=hw.P[Math.min(hw.P.length-1,bi+1)];const a=dr.P[dr.P.length-8];
   R.sideJd=Math.sign((q.x-p.x)*(a.z-p.z)-(q.z-p.z)*(a.x-p.x));}
  return R;})();
/* the hay meadow beside the kolkhoz road: mown in late summer, the swaths raked into rows, the round bales left standing
   in it (09k) - a rectangle along the road on its southern side */
const HAYF=(()=>{const P=ROADS.dr.P,i0=P.findIndex(p=>p.x<=262),s=P[i0].s+235;const i=P.findIndex(p=>p.s>=s);const a=P[i-1],b=P[i+1];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);
  const tx=dx/l,tz=dz/l;let nx=-tz,nz=tx;if(nz<0){nx=-nx;nz=-nz;}/* (the side away from the windbreak, which stands on the south side) */
  const p=P[i];return{cx:p.x+nx*23,cz:p.z+nz*23,tx,tz,nx,nz,hl:58,hw:13};})();
function hayK(x,z){const H_=HAYF,dx=x-H_.cx,dz=z-H_.cz,u=dx*H_.tx+dz*H_.tz,v=dx*H_.nx+dz*H_.nz;return sstep(H_.hl+2,H_.hl-2,Math.abs(u))*sstep(H_.hw+2,H_.hw-2,Math.abs(v));}
const RQ={dT:1e9,sT:0,yT:0,dH:1e9,sH:0,yH:0,sideH:0,dW:1e9,sW:0,yW:0,sideW:0};
function roadQuery(x,z){RQ.dT=RQ.dH=RQ.dW=1e9;const R=ROADS;const ci=Math.floor((x-R.x0)/R.B),cj=Math.floor((z-R.z0)/R.B);if(ci<0||cj<0||ci>=R.nx||cj>=R.nz)return RQ;
  for(const [rd,i] of R.cells[cj*R.nx+ci]){const a=rd.P[i],b=rd.P[i+1];const dx=b.x-a.x,dz=b.z-a.z,l2=dx*dx+dz*dz;let t=((x-a.x)*dx+(z-a.z)*dz)/l2;t=t<0?0:t>1?1:t;
    const px=a.x+dx*t,pz=a.z+dz*t,d=Math.hypot(x-px,z-pz);
    if(rd.type===1){if(d<RQ.dH){RQ.dH=d;RQ.sH=a.s+(b.s-a.s)*t;RQ.yH=a.y+(b.y-a.y)*t;RQ.sideH=Math.sign(dx*(z-a.z)-dz*(x-a.x));}}
    else if(rd.type===2){if(d<RQ.dW){RQ.dW=d;RQ.sW=a.s+(b.s-a.s)*t;RQ.yW=a.y+(b.y-a.y)*t;RQ.sideW=Math.sign(dx*(z-a.z)-dz*(x-a.x));}}
    else if(d<RQ.dT){RQ.dT=d;RQ.sT=a.s+(b.s-a.s)*t;RQ.yT=a.y+(b.y-a.y)*t;}}
  return RQ;}
/* highway cross-section (metres from the centre line -> height above it): crowned asphalt, gravel shoulder, ditch, verge */
const HWP=[[0,.12],[3.5,.07],[3.6,.04],[4.4,0],[5.4,-.35],[6.1,-.6],[6.9,-.58],[8,-.22],[9.5,-.03],[11,0],[12.5,0]];
function pwl(T_,d){if(d<=T_[0][0])return T_[0][1];for(let i=1;i<T_.length;i++)if(d<=T_[i][0]){const a=T_[i-1],b=T_[i];return a[1]+(b[1]-a[1])*(d-a[0])/(b[0]-a[0]);}return T_[T_.length-1][1];}
function hwFill(s,side){return Math.max(side===ROADS.sideJ?sstep(10,5,Math.abs(s-ROADS.sJ)):0,side===ROADS.sideJd?sstep(11,6,Math.abs(s-ROADS.sJd)):0);}
function hwRel(d,s,side){let r=pwl(HWP,d);if(d>4.4){const f=hwFill(s,side);if(f>0)r=lerp(r,0,f);}return r;}
/* walkable surface: natural ground, the track's level bed, the highway's own cross-section */
/* the district road's cross-section: crowned asphalt 6 m wide, gravel shoulders, shallow ditches */
const WRP=[[0,.08],[3,.03],[3.2,0],[4.2,-.05],[5.2,-.45],[6.2,-.5],[7.4,-.15],[9,0]];
/* ---------- the bus stop on the district road: where the footpath from the collective farm comes out of the field.
   On the east side the ditch is piped and filled for a bus bay of concrete road slabs, a kerb, a raised platform with
   the shelter; the path runs off from behind it across the field ---------- */
const BUS=(()=>{const P=ROADS.wr.P;const i=P.findIndex(p=>p.z>=-378),p=P[i],a=P[i-1],b=P[i+1];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz);
  const T_={x:dx/l,z:dz/l},N={x:-dz/l,z:dx/l},Sd={x:-N.x,z:-N.z};const o={x:p.x,y:p.y,z:p.z,s:p.s,T:T_,Sd,side:-1,path:[]};
  /* the path: out from the back of the platform, bending gently north-east across the field */
  for(let k=0;k<11;k++){const w=10.2+k*5.2,u=-1.2+k*.9+Math.sin(k*.55)*1.6;o.path.push([p.x+T_.x*u+Sd.x*w,p.z+T_.z*u+Sd.z*w]);}
  o.loc=(x,z)=>{const ex=x-o.x,ez=z-o.z;return[ex*T_.x+ez*T_.z,ex*Sd.x+ez*Sd.z];};return o;})();
/* cross-section over the bay: road level out to the kerb, the platform up behind it, a bank down to the field */
const BWP=[[0,.08],[3,.03],[6.42,.045],[6.6,.21],[9.65,.21],[10.6,.05],[12,0]];
function busFill(s){return sstep(14,9,Math.abs(s-BUS.s));}
function wrRel(d,s,side){let r=pwl(WRP,d);if(side===BUS.side){const f=busFill(s);if(f>0)r=lerp(r,pwl(BWP,d),f);}return r;}
/* trodden ground: the bay, the platform and its bank, the footpath */
function busTrample(x,z){if(Math.abs(x-BUS.x)>70||Math.abs(z-BUS.z)>70)return 0;const [u,w]=BUS.loc(x,z);let k=0;
  if(w>2.4&&w<10.8)k=sstep(14.5,11.5,Math.abs(u))*(w<10?1:sstep(10.8,10,w));
  const P=BUS.path;let d=9;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1],dx=b[0]-a[0],dz=b[1]-a[1],l2=dx*dx+dz*dz;const t=clamp(((x-a[0])*dx+(z-a[1])*dz)/l2,0,1);d=Math.min(d,Math.hypot(x-a[0]-dx*t,z-a[1]-dz*t));}
  const fade=1-sstep(.6,1,Math.hypot(x-P[P.length-1][0],z-P[P.length-1][1])/12);k=Math.max(k,sstep(1.05,.45,d)*Math.max(fade,.0)*(1-sstep(40,58,Math.hypot(x-P[0][0],z-P[0][1]))));return k;}
/* ---------- artillery craters along both roads: a bowl with a thrown-up rim of torn earth. The fine shape is in the
   heights (and a fine crater mesh); the coarse terrain is sunk out of the way underneath ---------- */
let CRATERS=null;CRATERS=(()=>{const L=[],R=rng(731);const take=(rd,s0,s1,n,dmin,dmax,forest)=>{let k=0,guard=0;while(k<n&&guard++<400){const s=lerp(s0,s1,R());const i=rd.P.findIndex(p=>p.s>=s);if(i<1)continue;
      const p=rd.P[i],q=rd.P[i-1],dx=p.x-q.x,dz=p.z-q.z,l=Math.hypot(dx,dz),sg=R()<.5?-1:1,r=lerp(2.2,3.8,R()),d=lerp(dmin,dmax,R())+r*1.9;
      const x=p.x+(-dz/l)*d*sg,z=p.z+(dx/l)*d*sg;if(L.some(c=>Math.hypot(c.x-x,c.z-z)<c.r*2.2+r*2.2))continue;if(Math.hypot(x-BUS.x,z-BUS.z)<40)continue;
      if(x<-690)continue;{const q=roadQuery(x,z);if(q.dT<9||q.dH<12.5+r*2||q.dW<9.6+r*2)continue;}if(!forest&&forestF(x,z)>.12)continue;
      L.push({x,z,r,dep:r*lerp(.28,.36,R()),rim:r*lerp(.07,.11,R()),ph:R()*6.28,ph2:R()*6.28});k++;}};
  take(ROADS.hw,40,ROADS.hw.L*.62,9,13.5,24);take(ROADS.wr,30,ROADS.wr.L*.6,9,10.5,22);
  /* the war gets closer on the way: shell holes in the woods along the last straight of the forest track before the long
     drive, and all over the fields along the kolkhoz road */
  {const t=ROADS.tr.P;const sA=t.find(p=>p.z<-500).s,sB=t.find(p=>p.z<-556).s;take(ROADS.tr,sA,sB,5,7.5,20,true);}
  take(ROADS.dr,60,ROADS.dr.L-30,11,8.5,26);take(ROADS.dr,40,ROADS.dr.L-30,9,26,52);
  /* the village has been shelled too: the hit that brought n3 down (its crater in the front yard), one in the burnt
     house's garden, two on the street, one on the lane's verge, one in the meadow behind the north gardens */
  [[110.5,-370.4,2.2],[61.5,-343.4,2.1],[88,-362.6,1.7],[139,-361.8,1.9],[84,-322,1.8],[93,-430,2.6],[40,-418,2.2],
   /* (and the mortar rounds that fell among the houses since) */[44.6,-382.3,1.17],[123.9,-352.9,1.29],[91.3,-401.1,1.31],[124.9,-289.2,1.84],[54.8,-387.7,1.45],[149.2,-314.7,1.8],[94.3,-306.1,1.66],[105.9,-343,1.32],[113.7,-331.1,1.71],[88.4,-332.7,1.26],[107.9,-288.8,1.48]].forEach(([x,z,r])=>L.push({x,z,r,dep:r*.32,rim:r*.09,ph:x%6.28,ph2:z%6.28}));
  const B=24,G=new Map();L.forEach(c=>{const e=c.r*2;for(let i=Math.floor((c.x-e)/B);i<=Math.floor((c.x+e)/B);i++)for(let j=Math.floor((c.z-e)/B);j<=Math.floor((c.z+e)/B);j++){const k=i+','+j;if(!G.has(k))G.set(k,[]);G.get(k).push(c);}});
  return{L,G,B};})();
function _crList(x,z){if(!CRATERS)return null;return CRATERS.G.get(Math.floor(x/CRATERS.B)+','+Math.floor(z/CRATERS.B));}
function crRho(c,x,z){const dx=x-c.x,dz=z-c.z,a=Math.atan2(dz,dx);return Math.hypot(dx,dz)/(c.r*(1+.1*Math.sin(3*a+c.ph)+.06*Math.sin(5*a+c.ph2)));}
function craterD(x,z){const L=_crList(x,z);if(!L)return 0;let h=0;for(const c of L){const p=crRho(c,x,z);if(p>1.9)continue;
  const bowl=p<1?-c.dep*Math.pow(1-p*p,1.25):0,rim=c.rim*Math.exp(-Math.pow((p-1.02)/.32,2))*sstep(1.9,1.35,p);h+=bowl+rim+(p<1.6?(fbm(x*1.3,z*1.3,2)-.5)*.08*sstep(1.6,1.1,p):0);}return h;}
function craterK(x,z){const L=_crList(x,z);if(!L)return 0;let k=0;for(const c of L){if(crRho(c,x,z)<2.05)k=Math.max(k,c.dep+.5);}return k;}
/* grass and weeds: none in the bowl, thin on the thrown earth */
function craterGrass(x,z){const L=_crList(x,z);if(!L)return 1;let g=1;for(const c of L){const p=crRho(c,x,z);if(p<1.85)g=Math.min(g,sstep(1.15,1.8,p)*.85+(p>1.7?.15:0));}return g;}
function H(x,z){return Hb(x,z)+craterD(x,z);}
function Hb(x,z){let h=H0(x,z);if(x<-905)return wxH(x,z,h);if(x>395||z<-720)return h;const q=roadQuery(x,z);
  if(q.dW<16){h=q.dW<9?q.yW+wrRel(q.dW,q.sW,q.sideW):lerp(q.yW,h,sstep(9,16,q.dW));
    /* the bay's fill fades into the field behind it */
    if(q.sideW===BUS.side&&q.dW>=9&&q.dW<13){const f=busFill(q.sW);if(f>0)h=lerp(h,q.yW+pwl(BWP,q.dW),f*sstep(13,10.6,q.dW));}return h;}
  if(q.dT<14)h=lerp(q.yT,h,sstep(3.6,14,q.dT));
  if(q.dH<30)h=q.dH<12.5?q.yH+hwRel(q.dH,q.sH,q.sideH):lerp(q.yH,h,sstep(12.5,30,q.dH));
  return h;}
/* the terrain mesh is tucked under the highway's own mesh so its coarse triangles never poke through */
/* the flooded basin has its own fine terrain patch (1.27 m cells: the causeway, the dykes and the pools need it); the
   coarse terrain is pushed well under it there. The patch rectangle sits exactly on the coarse mesh's grid lines. */
const DET=(()=>{const sx=1285/338,sz=1040/272;return{i0:4,i1:55,j0:58,j1:126,x0:-905+4*sx,x1:-905+55*sx,z0:-720+58*sz,z1:-720+126*sz,sx,sz,k:3};})();
const inDET=(x,z)=>x>DET.x0+.01&&x<DET.x1-.01&&z>DET.z0+.01&&z<DET.z1-.01;
function Hterr(x,z){if(inDET(x,z))return H(x,z)-6;const h=H(x,z);{const ck=craterK(x,z);if(ck>0)return Hb(x,z)-ck;}if(RQ.dW<6.2)return Math.min(h,RQ.yW-.3);if(RQ.dH<12.5){const tr=RQ.dH<6.5?-1.1:lerp(-1.1,0,(RQ.dH-6.5)/6);return Math.min(h,RQ.yH+tr);}return h;}
/* open fields of tall grass either side of the highway (narrow to the west where the forest stands), forest beyond */
function fieldW(){return RQ.sideH<0?24:68;}
function tallGrass(x,z){if(x<-881&&x>-910&&Math.abs(z+332)<12){const dt=wxTrail(x,z);if(dt<1)return 0;if(dt<5)return .95*sstep(5,1.6,dt);}const f2=field2K(x,z);const t0=f2>0?Math.max(tallGrass0(x,z),f2*.8*sstep(.38,.62,fbm(x/26+5,z/26,2))):tallGrass0(x,z);let k=t0*(1-busTrample(x,z))*craterGrass(x,z)*(1-hayK(x,z));if(f2>0){const q=roadQuery(x,z);if(q.dT<6)k*=sstep(3.5,6,q.dT);}return k;}
function tallGrass0(x,z){if(x<-460){const fk=fieldK(x,z);const wet=x<-700?sstep(W3.wl+.05,W3.wl+.4,H0(x,z))*sstep(W3.wl+1.6,W3.wl+.6,H0(x,z)):0;return Math.max(fk*.85,wet*.9);}const q=roadQuery(x,z);if(q.dH>90)return 0;const w=fieldW();return sstep(6.5,10,q.dH)*(1-sstep(12,w+18,q.dH))*(z>-492?1:sstep(-520,-492,z));}
/* dense forest: along the forest track (a tunnel of trees either side), the northern woods, and west of the highway beyond its field */
/* the southern farm's open fields along the kolkhoz road, from the highway east out of the woods */
function field2K(x,z){if(z>-600||z<-712||x<-300)return 0;return sstep(-702,-692,z)*sstep(-616,-626,z)*sstep(-298,-286,x);}
function forestF(x,z){if(x>-6||z>330)return 0;if(CRATERS&&craterGrass(x,z)<.95)return 0;if(field2K(x,z)>.5)return 0;const q=roadQuery(x,z);if(q.dT<7.2)return 0;if(q.dH<(q.sideH<0?74:28))return 0;
  let f=0;if(q.dT<150)f=1;if(z<-468)f=1;if(q.dH<220&&q.sideH>0)f=1;if(x<-330)f=westForest(x,z,q);
  return f*(.72+.28*fbm(x/26+3,z/26,2));}
/* west of the highway: the forest belt (with its clearing) as far as the collective field, the field open, the road
   kept clear, a thin wet scrub where the fog lies, the basin open, forest again beyond the lumber yard and walling the
   whole area in to the north and south */
function westForest(x,z,q){if(q.dW<12)return 0;if(Math.hypot(x-W3.clear.x,z-W3.clear.z)<W3.clear.r)return 0;
  const edgeNS=Math.max(sstep(-505,-525,z),sstep(-238,-218,z));
  if(x>-468)return 1;
  if(x>-648)return edgeNS;
  const r=basinK(x,z);if(x>-708)return Math.max(edgeNS,r<1.5?0:.22*sstep(.55,.7,fbm(x/12,z/12,2)));
  if(Math.hypot((x-W3.yard.x)/22,(z-W3.yard.z)/19)<1)return 0;
  if(r<1.3)return 0;return Math.max(edgeNS,x<-880?1:sstep(1.3,1.6,r));}
/* radiation: a few small, hot spots where fragments of the original dirty bomb came down (and a weak one round the house) */
/* the stand of red pines on the walk west (09g): the grass under them thin, the ground dry and needle-strewn */
const REDPINE={x:-357,z:-411,r:17};
/* the forest floor along the walk west: under the trees needles, old leaves and moss, the grass thin and patchy */
function floorK(x,z){if(x>-312||x<-482||Math.abs(z+392)>72)return 0;const f=forestF(x,z);if(f<=0)return 0;
  return f*sstep(-312,-332,x)*sstep(72,56,Math.abs(z+392))*sstep(-482,-466,x)*(.5+.5*sstep(.32,.62,fbm(x/16+3,z/16,2)));}
const hotspots=[{x:-34,z:-318,r:7,uSv:45,frag:1},{x:66,z:-436,r:8,uSv:110,frag:1},{x:14,z:-352,r:5,uSv:28,frag:1},{x:HX,z:HZ,r:12,uSv:9}];
/* the village's fine ground cover, sharper than the grass map can hold: it goes into a mask of its own at a third of a
   metre (VM) - bare under and round the houses, worn thin near them, none in the beds, trodden paths and alleys, the street
   ruts with their grassy crown; and the tall grass is cut short in the yards and kept off every way people walk */
const VB={x0:-2,x1:208,z0:-450,z1:-238};
function villGrassK(x,z){let d=1;for(const h of VILL.houses){const b=h.box;if(x>b.x1-1.2&&x<b.x2+1.2&&z>b.z1-1.2&&z<b.z2+1.2)return 0;const dh2=Math.hypot(x-h.x,z-h.z);if(dh2<9)d*=.35+.65*sstep(4,9,dh2);}
  {const gd=villGarden(x,z);if(gd>=0)d*=gd<.6?.5:0;}
  if(x>0&&x<205&&z>-445&&z<-265){const pd=villPathD(x,z);if(pd<1.1)d*=pd<.42?0:pd<.75?.35:.7;if(Math.hypot(x-VILL.well.x,z-VILL.well.z)<2.4)d*=.2;}
  {const sd=villStreetD(x,z);if(sd<3.6){const rut=Math.abs(Math.abs(sd)-.85);d*=sd<2.4?(rut<.35?0:.45):.7;}}return d;}
function villTallK(x,z){if(villGarden(x,z)>=0)return 0;for(const h of VILL.houses){const b=h.box;if(x>b.x1-1.8&&x<b.x2+1.8&&z>b.z1-1.8&&z<b.z2+1.8)return 0;}
  let k=1;const pd=villPathD(x,z);k*=sstep(.9,1.8,pd);const sd=villStreetD(x,z);k*=sstep(3.4,4.6,sd);if(Math.hypot(x-VILL.well.x,z-VILL.well.z)<3.2)k=0;
  for(const h of VILL.houses){const r=h.prect;if(x>r.x1&&x<r.x2&&z>r.z1&&z<r.z2){k*=h.boarded?.6:.12;break;}}return k;}
function grassDens(x,z,noVill){
  let d=.5+.5*sstep(.32,.62,fbm(x/34+7,z/34+1,3));
  const ax=Math.abs(x);
  if(ax<4.2){d*=sstep(.32,.62,Math.abs(ax-1.85));if(ax>3.2)d*=.6;}
  if(Math.abs(x)<44&&Math.abs(z)<35){const e=Math.min(44-Math.abs(x),35-Math.abs(z));d*=e<1.2?.5:0;}
  if(x>HX-4.6&&x<HX+4.6&&z>HZ-3.6&&z<HZ+5.2)d=0;
  if(!(noVill&&x>VB.x0&&x<VB.x1&&z>VB.z0&&z<VB.z1))d*=villGrassK(x,z);
  for(const h of hotspots){if(!h.frag)continue;const k=Math.hypot(x-h.x,z-h.z)/(h.r*.4);if(k<1)d*=.45+.55*k*k;}
  {const k=Math.hypot(x-REDPINE.x,z-REDPINE.z)/REDPINE.r;if(k<1.15)d*=.3+.7*sstep(.55,1.15,k);}
  {const fk=floorK(x,z);if(fk>0)d*=1-.62*fk;}
  {const hk=hayK(x,z);if(hk>0)d=lerp(d,.16,hk);}
  {const q=roadQuery(x,z);if(q.dT<5)d*=sstep(2.6,4.6,q.dT);if(q.dH<9)d*=sstep(4.6,7.2,q.dH);if(q.dH<90&&q.dH>7){const tg=tallGrass(x,z);d=Math.max(d,tg*.95);}
   if(q.dW<6)d*=sstep(3.6,5.6,q.dW);}
  if(x<-460){const fk=fieldK(x,z);if(fk>0)d=Math.max(d,fk*.95);if(H0(x,z)<W3.wl+.05)d=0;}
  d*=(1-busTrample(x,z))*craterGrass(x,z);
  /* the lumber yard is trodden down round the shack and the fire; nothing grows inside the shack */
  if(x<-856&&x>-894&&z<-320&&z>-352){const dy=Math.hypot((x-W3.yard.x)/16,(z-W3.yard.z)/13);if(dy<.95)d*=.18+.82*sstep(.5,.95,dy);if(Math.abs(x+879)<2.7&&Math.abs(z+334)<3.9)d=0;}
  /* the footpath out the back */if(x<-881&&x>-910&&Math.abs(z+332)<12){const dt=wxTrail(x,z);if(dt<.5)d=0;else if(dt<1)d*=.35;else if(dt<5)d=Math.max(d,.9);}
  return d;}

/* ground mesh with vertex colour variation */
const TERR={x0:-905,z0:-720,w:1285,d:1040};
/* per-vertex material weights: x grass, y dry grass, z mud, w gravel; plus wetness */
function warDry(x,z){const wk=sstep(-170,-260,z);if(wk<=0)return 0;const live=sstep(.56,.7,fbm(x/70+11,z/70-4,3))+sstep(-1.4,-2.2,baseH(x,z)*flatW(x,z))*.6;return wk*(1-clamp(live,0,1));}
function groundMix(x,z){const n1=fbm(x/46,z/46,3),n2=fbm(x/11+50,z/11,2),n3=fbm(x/7+9,z/7+21,2);
  let g=1.3,d=sstep(.5,.72,n1)*.8,m=sstep(.62,.76,n2)*.3,v=0;
  const ax=Math.abs(x);const road=1-sstep(3.4,6.5,ax);m+=road*1.2;v+=road*.6*sstep(.4,.6,n3);g*=1-road*.8;
  if(Math.abs(x)<46&&Math.abs(z)<37){const e=sstep(0,4,Math.min(46-Math.abs(x),37-Math.abs(z)));m+=e*1.4;v+=e*1.0;g*=1-e;d*=1-e;}
  const dh=Math.hypot(x-HX,z-HZ);const yard=1-sstep(6,13,dh);m+=yard*.9;d+=yard*.4;g*=1-yard*.7;
  /* the village street: two wheel ruts of mud with a grassy crown between, trodden earth along its edges; yards trodden
     round each house and along the path from its gate */
  {const sd=villStreetD(x,z);if(sd<4.2){const rut=Math.min(Math.abs(sd-.85),Math.abs(sd+.85));const k=1-sstep(2.6,4.2,sd),kr=1-sstep(.25,.55,Math.min(rut,Math.abs(sd-.85)));
     m+=k*.9+kr*1.6;v+=k*.25;g*=1-k*.55-kr*.4;d*=1-k*.6;}
   for(const h of VILL.houses){const dh2=Math.hypot(x-h.x,z-h.z);if(dh2<12){const k=1-sstep(4.5,10,dh2);m+=k*.7;d+=k*.35;g*=1-k*.55;}}
   /* the vegetable gardens: dug dark earth */{const gd=villGarden(x,z);if(gd>=0){const k=sstep(0,.8,gd);d*=1-k*.85;m+=k*2.4;v+=k*.15;g*=1-k*.97;}}
   /* the footpaths: bare trodden earth, a little muddy in the middle */if(x>0&&x<205&&z>-445&&z<-265){const pd=villPathD(x,z);if(pd<1){const k=1-sstep(.3,.95,pd);d+=k*1.1;m+=k*.35;g*=1-k*.75;}const wd=Math.hypot(x-VILL.well.x,z-VILL.well.z);if(wd<2.6){const k=1-sstep(1.2,2.6,wd);m+=k*.9;d+=k*.4;g*=1-k*.7;}}}
  /* round each fragment the grass has died back a little: dry and thin, the soil showing - no puddles, no glow */
  for(const h of hotspots){if(!h.frag)continue;const k=Math.hypot(x-h.x,z-h.z)/(h.r*.45);if(k<1){d+=(1-k)*.9;m+=(1-k)*.25;g*=.35+.65*k;}}
  {const k=Math.hypot(x-REDPINE.x,z-REDPINE.z)/REDPINE.r;if(k<1.2){const e=1-sstep(.5,1.2,k);d+=e*1.1;m+=e*.35;g*=1-e*.75;}}
  {const fk=floorK(x,z);if(fk>0){d+=fk*.75;m+=fk*.32;g*=1-.5*fk;}}
  {const hk=hayK(x,z);if(hk>0){const H_=HAYF,v=(x-H_.cx)*H_.nx+(z-H_.cz)*H_.nz,row=sstep(.7,.95,Math.abs(Math.sin(v*Math.PI/4.2)));d+=hk*(1.1+row*.8);g*=1-.7*hk;m+=hk*.08;}}
  {const q=roadQuery(x,z);if(q.dT<6.5){const k=1-sstep(2.8,6.5,q.dT);m+=k*1.6;v+=k*.5*sstep(.4,.6,n3);g*=1-k*.85;d*=1-k;}if(q.dH<16){const k=1-sstep(12.5,16,q.dH);d+=k*.6;}}
  /* trodden earth at the bus stop and along its path; torn, bare earth in and round a shell crater */
  {const bt=busTrample(x,z);if(bt>0){m+=bt*1.5;v+=bt*.3;g*=1-bt*.85;d*=1-bt*.7;}}
  {const f2=field2K(x,z);if(f2>0){d+=f2*.7*sstep(.3,.7,fbm(x/40+2,z/40,2));}}
  {const L=_crList(x,z);if(L)for(const c of L){const p=crRho(c,x,z);if(p<1.95){const k=sstep(1.95,1.15,p);m+=k*1.9;v+=k*.3;g*=1-k*.92;d*=1-k*.6;}}}
  /* the war country south of the F.O.B.: a summer of nobody working the land and the fires that went through it - the
     fields gone to dry, bleached grass, the green holding on only in the damp hollows and in patches here and there */
  {const k=warDry(x,z);if(k>0){d+=g*k*1.25;g*=1-k*.72;}}
  let wet=sstep(-1.2,-2.4,baseH(x,z)*flatW(x,z))*.8+m*sstep(.62,.7,n3)*.7;
  const s=g+d+m+v+1e-4;return[g/s,d/s,m/s,v/s,clamp(wet,0,.9)];}
/* the basin: grey-brown silt under and just above the water (wet, glossy), trampled mud on the yard knoll, grass on top */
function basinMix(x,z,h){const w=groundMix(x,z);const a=h-W3.wl;const silt=1-sstep(.15,.65,a),bank=sstep(.1,.4,a)*(1-sstep(.4,1.4,a));
  const yd=1-sstep(.6,1.1,Math.hypot((x-W3.yard.x)/16,(z-W3.yard.z)/13));
  let g=w[0]*(1-silt)*(1-.6*yd),d=w[1]*(1-silt)+bank*.25,m=w[2]+silt*2.2+bank*.5+yd*.9,v=w[3]+yd*.35+silt*.15*sstep(.5,.7,fbm(x/5,z/5,2));const s=g+d+m+v+1e-4;
  return[g/s,d/s,m/s,v/s,clamp(Math.max(w[4],silt*.9,bank*.55),0,.92)];}
(function(){const g=new T.PlaneGeometry(TERR.w,TERR.d,338,272);g.rotateX(-Math.PI/2);g.translate(TERR.x0+TERR.w/2,0,TERR.z0+TERR.d/2);
  const p=g.attributes.position,col=new Float32Array(p.count*3),spl=new Float32Array(p.count*4),wet=new Float32Array(p.count);
  for(let i=0;i<p.count;i++){const x=p.getX(i),z=p.getZ(i);p.setY(i,Hterr(x,z));
    const k=.86+fbm(x/30+3,z/30,3)*.28;col[i*3]=k;col[i*3+1]=k*(.98+fbm(x/60,z/60+5,2)*.04);col[i*3+2]=k*.97;
    const w=groundMix(x,z);spl.set(w.slice(0,4),i*4);wet[i]=w[4];}
  g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('splat',new T.BufferAttribute(spl,4));g.setAttribute('wet',new T.BufferAttribute(wet,1));g.computeVertexNormals();
  const m=mesh(g,splatMat(.45),0,0,0,scene,false);shootables.push(m);
  /* the horizon fill: a frame of ground round the terrain (not a plane under it - that would show over the basin floor,
     which lies lower than the fill) */
  {const fm=std({color:C(0x66744a),roughness:1,envMapIntensity:.2}),E=20,X0=TERR.x0+E,X1=TERR.x0+TERR.w-E,Z0=TERR.z0+E,Z1=TERR.z0+TERR.d-E,B=2000;
   [[X0-B,X1+B,Z0-B,Z0],[X0-B,X1+B,Z1,Z1+B],[X0-B,X0,Z0,Z1],[X1,X1+B,Z0,Z1]].forEach(([a,b,c,d])=>{const pg=new T.PlaneGeometry(b-a,d-c);pg.rotateX(-Math.PI/2);
     const f=new T.Mesh(pg,fm);f.position.set((a+b)/2,-60,(c+d)/2);f.receiveShadow=true;scene.add(f);});}
  /* the basin's fine patch: borders follow the coarse mesh's edges exactly (linear between its vertices), inside the
     true height; silt and mud below and round the waterline, grass on the dry tops */
  {const nx=(DET.i1-DET.i0)*DET.k,nz=(DET.j1-DET.j0)*DET.k;const pg=new T.PlaneGeometry(DET.x1-DET.x0,DET.z1-DET.z0,nx,nz);pg.rotateX(-Math.PI/2);
   pg.translate((DET.x0+DET.x1)/2,0,(DET.z0+DET.z1)/2);const pp=pg.attributes.position,n=pp.count;const col=new Float32Array(n*3),spl=new Float32Array(n*4),wt=new Float32Array(n);
   const edgeH=(x,z,alongX)=>{if(alongX){const i=Math.floor((x-TERR.x0)/DET.sx+1e-6),xa=TERR.x0+i*DET.sx,t=clamp((x-xa)/DET.sx,0,1);return lerp(H(xa,z),H(xa+DET.sx,z),t);}
     const j=Math.floor((z-TERR.z0)/DET.sz+1e-6),za=TERR.z0+j*DET.sz,t=clamp((z-za)/DET.sz,0,1);return lerp(H(x,za),H(x,za+DET.sz),t);};
   for(let i=0;i<n;i++){const x=pp.getX(i),z=pp.getZ(i);const bx=Math.abs(x-DET.x0)<.01||Math.abs(x-DET.x1)<.01,bz=Math.abs(z-DET.z0)<.01||Math.abs(z-DET.z1)<.01;
     const h=bx&&bz?H(x,z):bz?edgeH(x,z,true):bx?edgeH(x,z,false):H(x,z);pp.setY(i,h);
     const k=.86+fbm(x/30+3,z/30,3)*.28;col[i*3]=k;col[i*3+1]=k*(.98+fbm(x/60,z/60+5,2)*.04);col[i*3+2]=k*.97;
     const w=basinMix(x,z,h);spl.set(w.slice(0,4),i*4);wt[i]=w[4];}
   pg.setAttribute('color',new T.BufferAttribute(col,3));pg.setAttribute('splat',new T.BufferAttribute(spl,4));pg.setAttribute('wet',new T.BufferAttribute(wt,1));pg.computeVertexNormals();
   const dm=mesh(pg,splatMat(.45),0,0,0,scene,false);dm.receiveShadow=true;shootables.push(dm);DET.mesh=dm;}
  /* (the north road does not stop where the forest track turns off it: it runs on south past the junction, across the
     kolkhoz road, to the edge of the country and away into the haze) */
  const road=new T.PlaneGeometry(7.6,1020,1,1);road.rotateX(-Math.PI/2);road.translate(0,.025,-210);
  const rm=mesh(road,roadMat(),0,0,0,scene,false);rm.renderOrder=1;
})();

/* how deep into the woods a point is (0 at the edge or in the open, 1 well inside): forest cover averaged over a ring 14 m
   round it, on an 8 m grid, read bilinearly. Grass gets shorter the deeper you go. */
const FDEPTH=(()=>{const c=8,nx=Math.ceil(TERR.w/c)+1,nz=Math.ceil(TERR.d/c)+1,a=new Float32Array(nx*nz);
  for(let j=0;j<nz;j++)for(let i=0;i<nx;i++){const x=TERR.x0+i*c,z=TERR.z0+j*c;let s=forestF(x,z)>0?1:0;for(let k=0;k<8;k++){const an=k*.785;s+=forestF(x+Math.cos(an)*14,z+Math.sin(an)*14)>0?1:0;}a[j*nx+i]=s/9;}
  return{c,nx,nz,a,at(x,z){const u=clamp((x-TERR.x0)/c,0,nx-1.001),v=clamp((z-TERR.z0)/c,0,nz-1.001),i=Math.floor(u),j=Math.floor(v),fu=u-i,fv=v-j;const A=this.a;
    return lerp(lerp(A[j*nx+i],A[j*nx+i+1],fu),lerp(A[(j+1)*nx+i],A[(j+1)*nx+i+1],fu),fv);}};})();
/* height + grass density texture for the GPU grass */
const HM=(function(){const n=512,nx=864,data=new Uint8Array(nx*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<nx;i++){const x=TERR.x0+(i+.5)/nx*TERR.w,z=TERR.z0+(j+.5)/n*TERR.d;const k=(j*nx+i)*4;
    data[k]=clamp((H(x,z)+5)/12*255,0,255);data[k+1]=clamp(grassDens(x,z,true)*255,0,255);data[k+2]=clamp(lerp((.5+.5*fbm(x/40+9,z/40,3))*(1-.58*sstep(.3,.95,FDEPTH.at(x,z))),.97,warDry(x,z)*.85)*255,0,255);data[k+3]=clamp(tallGrass(x,z)*255,0,255);}
  const t=new T.DataTexture(data,nx,n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;})();
const VGM=(function(){const res=1/3,nx=Math.round((VB.x1-VB.x0)/res),n=Math.round((VB.z1-VB.z0)/res),data=new Uint8Array(nx*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<nx;i++){const x=VB.x0+(i+.5)*res,z=VB.z0+(j+.5)*res,k=(j*nx+i)*4;data[k+1]=clamp(villGrassK(x,z)*255,0,255);data[k+3]=clamp(villTallK(x,z)*255,0,255);}
  const t=new T.DataTexture(data,nx,n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;})();
/* fine heights over the basin patch (0.5 m) so blades and flowers sit on the causeway and the pool margins, and none
   grow under the water; the range is fitted to what is there */
const HM2=(function(){const nx=Math.round((DET.x1-DET.x0)/.5),n=Math.round((DET.z1-DET.z0)/.5),hs=new Float32Array(nx*n);let mn=1e9,mx=-1e9;
  for(let j=0;j<n;j++)for(let i=0;i<nx;i++){const x=DET.x0+(i+.5)/nx*(DET.x1-DET.x0),z=DET.z0+(j+.5)/n*(DET.z1-DET.z0);const h=H(x,z);hs[j*nx+i]=h;if(h<mn)mn=h;if(h>mx)mx=h;}
  mn-=.05;mx+=.05;const data=new Uint8Array(nx*n*4);for(let k=0;k<nx*n;k++){data[k*4]=clamp((hs[k]-mn)/(mx-mn)*255,0,255);data[k*4+3]=255;}
  const t=new T.DataTexture(data,nx,n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.needsUpdate=true;t.userData={mn,mx};return t;})();
/* west of the old edge: heights and grass for the trail and road country (1.5 m), same packing as HM */
/* where armour crossed the fields by the road toward the line: the centre-lines of its tracks (each a pair of ruts 2.64 m
   apart), shared by the grass (crushed in the ruts) and the tread-printed decals (09n_xfront) */
function wxTracks(){if(WX.tk)return WX.tk;wxInit();const P=WX.P,SL=P[P.length-1].s;WX.tk=[];
  for(const [f,len,bend] of [[.69,70,.5],[.81,95,-.35]]){const i=Math.min(P.length-1,Math.max(1,Math.round(f*SL/2))),p=P[i],fr=roadFrame(P,i),yaw=Math.atan2(fr.tx,fr.tz),ang=yaw+Math.PI/2+.5;
    const pts=[];for(let d=-len;d<=len;d+=1.2){const k=d/len,lat=bend*k*k*Math.sign(k)*len*.3;pts.push([p.x+Math.sin(ang)*d+Math.cos(ang)*lat,p.z+Math.cos(ang)*d-Math.sin(ang)*lat]);}
    let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const q of pts){x0=Math.min(x0,q[0]);x1=Math.max(x1,q[0]);z0=Math.min(z0,q[1]);z1=Math.max(z1,q[1]);}WX.tk.push({pts,bb:[x0-3,x1+3,z0-3,z1+3]});}
  return WX.tk;}
function wxTrackD(x,z){let best=99;for(const t of wxTracks()){const b=t.bb;if(x<b[0]||x>b[1]||z<b[2]||z>b[3])continue;const P=t.pts;
    for(let i=0;i<P.length-1;i++){const a=P[i],c=P[i+1],dx=c[0]-a[0],dz=c[1]-a[1],l2=dx*dx+dz*dz;let u=((x-a[0])*dx+(z-a[1])*dz)/l2;u=u<0?0:u>1?1:u;best=Math.min(best,Math.hypot(x-a[0]-dx*u,z-a[1]-dz*u));}}return best;}
function wxGrass(x,z){const q=wxRoad(x,z);let d=.55+.45*sstep(.3,.6,fbm(x/30+2,z/30+8,3)),tall=.25+.6*sstep(.42,.7,fbm(x/40+6,z/40-3,3));
  if(q.d<WX.hw+.15){d=0;tall=0;}else if(q.d<WX.hw+1.2){d*=.35;tall=0;}else if(q.d<WX.hw+3){d*=.8;tall*=.4;}
  {const td=wxTrackD(x,z);if(td<2.2){const rut=Math.abs(td-1.32);if(rut<.5){d*=.15;tall=0;}else{d*=.7;tall*=.35;}}}
  const dt=x>-960?wxTrail(x,z):99;if(dt<.5){d=0;tall=0;}else if(dt<1){d*=.35;tall*=.2;}else if(dt<5){tall=Math.max(tall,.95*sstep(5,1.6,dt));d=Math.max(d,.9);}
  return[d,tall];}
const HM3=(function(){const B=WX.box,res=1.5,nx=Math.round((B.x1-B.x0)/res),n=Math.round((B.z1-B.z0)/res),data=new Uint8Array(nx*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<nx;i++){const x=B.x0+(i+.5)/nx*(B.x1-B.x0),z=B.z0+(j+.5)/n*(B.z1-B.z0);const k=(j*nx+i)*4;const g=wxGrass(x,z);
    data[k]=clamp((H(x,z)+5)/12*255,0,255);data[k+1]=clamp(g[0]*255,0,255);data[k+2]=clamp((.5+.5*fbm(x/40+9,z/40,3))*255,0,255);data[k+3]=clamp(g[1]*255,0,255);}
  const t=new T.DataTexture(data,nx,n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;})();
/* the visible grass ground uses the same quantised height so blades sit exactly on it */

/* foliage is lit from its own outward normal on both faces (no back-face darkening) */
const NOFLIP='vec3 normal=normalize(vNormal);vec3 geometryNormal=normal;';
/* ---------- GPU grass: world-locked tufts in a ring around the camera ---------- */
const GRASS={mesh:null,trail:[],uni:{uTrail:{value:Array.from({length:8},()=>new T.Vector4(0,0,-99,0))},uNPC:{value:V3(0,0,-999)},uCenter:{value:new T.Vector2()},uTime:{value:0},uHM:{value:HM},uTB:{value:new T.Vector4(TERR.x0,TERR.z0,TERR.w,TERR.d)},uCell:{value:.36},uR:{value:32},uPlayer:{value:V3()},uHM2:{value:HM2},uTB2:{value:new T.Vector4(DET.x0,DET.z0,DET.x1-DET.x0,DET.z1-DET.z0)},uHR2:{value:new T.Vector3(HM2.userData.mn,HM2.userData.mx-HM2.userData.mn,W3.wl)},uHM3:{value:HM3},uVM:{value:VGM},uVB:{value:new T.Vector4(VB.x0,VB.z0,VB.x1-VB.x0,VB.z1-VB.z0)},uTB3:{value:new T.Vector4(WX.box.x0,WX.box.z0,WX.box.x1-WX.box.x0,WX.box.z1-WX.box.z0)}}};
function tuftGeo(){const pos=[],uv=[],idx=[];let vi=0;
  for(let b=0;b<6;b++){const a=R()*Math.PI*2,h=rnd(.28,.7),w=rnd(.016,.03),bend=rnd(.12,.42),ox=rnd(-.09,.09),oz=rnd(-.09,.09);
    const dx=Math.cos(a),dz=Math.sin(a),px=-dz,pz=dx;const S=4;
    for(let k=0;k<=S;k++){const t=k/S;const ww=w*(1-Math.pow(t,1.6)*.92);const cx=ox+dx*bend*t*t*h,cz=oz+dz*bend*t*t*h,cy=h*t*(1-.2*t*t*bend);
      pos.push(cx-px*ww/2,cy,cz-pz*ww/2,cx+px*ww/2,cy,cz+pz*ww/2);uv.push(0,t,1,t);if(k<S)idx.push(vi,vi+2,vi+1,vi+1,vi+2,vi+3);vi+=2;}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  const nor=new Float32Array(pos.length);for(let i=1;i<nor.length;i+=3)nor[i]=1;g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setIndex(idx);return g;}
const grassMat=std({roughness:1,side:T.DoubleSide,envMapIntensity:.2});grassMat.defines.NO_PUDDLE='';/* blades are not puddles, however flat their normals */
grassMat.onBeforeCompile=s=>{Object.assign(s.uniforms,GRASS.uni);
  s.vertexShader=`attribute vec2 aOff;uniform vec2 uCenter;uniform float uTime,uCell,uR;uniform sampler2D uHM;uniform vec4 uTB;uniform vec3 uPlayer;uniform vec4 uTrail[8];uniform vec3 uNPC;varying float vT;varying vec3 vGC;varying float vFs;
  /* sine-free hash: sin() of large cell coordinates loses precision far from the origin and collapses to 0 */
  float gh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  uniform sampler2D uHM2;uniform vec4 uTB2;uniform vec3 uHR2;uniform sampler2D uHM3;uniform vec4 uTB3;uniform sampler2D uVM;uniform vec4 uVB;
  /* height in metres + density channels; over the basin the fine heights, and nothing below the waterline */
  vec4 hmD(sampler2D hm1,vec2 wp,vec4 tb){if(wp.x<tb.x){vec2 u3=(wp-uTB3.xy)/uTB3.zw;vec4 h3=texture2D(uHM3,u3);h3.r=h3.r*12.-5.;if(u3.x<0.||u3.y<0.||u3.x>1.||u3.y>1.){h3.g=0.;h3.a=0.;}return h3;}vec4 h=texture2D(hm1,(wp-tb.xy)/tb.zw);h.r=h.r*12.-5.;vec2 u=(wp-uTB2.xy)/uTB2.zw;
    if(u.x>0.&&u.y>0.&&u.x<1.&&u.y<1.){h.r=texture2D(uHM2,u).r*uHR2.y+uHR2.x;if(h.r<uHR2.z+.06){h.g=0.;h.a=0.;}}vec2 uv5=(wp-uVB.xy)/uVB.zw;if(uv5.x>0.&&uv5.y>0.&&uv5.x<1.&&uv5.y<1.){vec4 vm=texture2D(uVM,uv5);h.g*=vm.g;h.a*=vm.a;}return h;}
  `+s.vertexShader.replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.0,1.0,0.0);')
  .replace('#include <begin_vertex>',`
  vec2 cell=uCenter+aOff;float gR1=gh(cell),gR2=gh(cell+17.31),gR3=gh(cell+5.17),gR4=gh(cell+41.9);
  vec2 wp=(cell+vec2(gR1,gR2))*uCell;
  vec4 hm=hmD(uHM,wp,uTB);
  float hgt=hm.r;
  float dist=length(wp-cameraPosition.xz);
  float fade=1.0-smoothstep(uR*0.62,uR,dist);
  float dens=step(gR3*.995+.004,hm.g);
  /* b: the size variation in its upper half, below .5 the blades are shortened (deep in the woods) */
  float bF=clamp(hm.b*2.-1.,0.,1.),hs=clamp(hm.b*2.,.42,1.);
  float sc=fade*dens*(0.55+gR4*0.5)*(0.8+bF*0.35);
  float ang=gR2*6.2831;float ca=cos(ang),sa=sin(ang);
  vec3 transformed=position;transformed.xz=mat2(ca,-sa,sa,ca)*transformed.xz;float tall=hm.a;transformed*=vec3(sc*(1.0+tall*.35),sc*hs*(0.75+gR1*0.6)*(1.0+tall*(1.6+gR4*1.4)),sc*(1.0+tall*.35));
  float t=uv.y;
  float wv=sin(uTime*1.6+wp.x*0.31+wp.y*0.23)*0.65+sin(uTime*3.7+wp.x*1.3+wp.y*0.7)*0.22;
  transformed.x+=wv*0.13*t*t*sc;transformed.z+=wv*0.06*t*t*sc;
  vec2 pd=wp-uPlayer.xz;float pl=length(pd);float push=max(0.0,1.0-pl/0.85);
  transformed.xz+=(pd/max(pl,0.001))*push*0.32*t*sc;transformed.y-=push*0.18*t*sc;
  {vec2 nd=wp-uNPC.xz;float nl=length(nd);float np=max(0.,1.-nl/.8)*uNPC.y;transformed.xz+=(nd/max(nl,.001))*np*.3*t*sc;transformed.y-=np*.16*t*sc;}
  /* where you have just walked the blades spring back and swing to and fro before they settle */
  {vec2 sw=vec2(0.);for(int i=0;i<8;i++){vec4 tr=uTrail[i];float age=uTime-tr.z;if(age<0.||age>2.6)continue;vec2 d=wp-tr.xy;float l=length(d);float w=max(0.,1.-l/1.15);if(w<=0.)continue;
     sw+=(d/max(l,.001))*w*tr.w*exp(-age*2.1)*sin(age*10.5+l*3.+gR3*2.);}
   transformed.xz+=sw*.2*t*t*sc*(1.+tall);}
  transformed+=vec3(wp.x,hgt-0.09,wp.y);
  vT=t;vFs=clamp(fade*(0.55+gR4*0.5),0.,1.);vGC=vec3(gR1,gR4,clamp(bF+tall*.7,0.,1.));`);
  s.fragmentShader='varying float vT;varying vec3 vGC;varying float vFs;\n'+s.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP).replace('vec4 diffuseColor = vec4( diffuse, opacity );',
  `vec3 gB=vec3(0.020,0.030,0.010);vec3 gT=mix(vec3(0.16,0.20,0.06),vec3(0.34,0.29,0.12),clamp(vGC.z*0.9+vGC.x*0.35-0.2,0.0,1.0));
   gT=mix(gT,vec3(0.40,0.34,0.17),step(0.86,vGC.y));
   /* the root is only a shaded version of the blade colour (never near-black: at a distance, or without anti-aliasing,
      every tuft's base would read as a black dot on the ground); a shrinking tuft keeps even less of that shade */
   gB=gT*vec3(0.74,0.78,0.66);gB=mix(gT*0.86,gB,smoothstep(0.45,0.9,vFs));
   vec4 diffuseColor=vec4(mix(gB,gT,pow(vT,0.75)),opacity);`);};
/* the ring of grass cells around the camera is split into 8 wedges, each its own instanced mesh whose bounding sphere
   follows the camera: wedges behind the view are skipped by the frustum test instead of drawing every blade */
function buildGrass(Rad){if(GRASS.mesh){scene.remove(GRASS.mesh);GRASS.mesh.children.forEach(c=>c.geometry.dispose());}
  const cell=GRASS.uni.uCell.value,K=Math.ceil(Rad/cell),NS=8,buck=Array.from({length:NS},()=>[]);
  for(let i=-K;i<=K;i++)for(let j=-K;j<=K;j++)if(i*i+j*j<=K*K){const a=Math.atan2(j,i);buck[Math.floor((a+Math.PI)/(Math.PI*2)*NS)%NS].push(i,j);}
  const base=tuftGeo(),grp=new T.Group();GRASS.secs=[];
  buck.forEach(off=>{if(!off.length)return;const g=new T.InstancedBufferGeometry();g.index=base.index;g.attributes.position=base.attributes.position;g.attributes.uv=base.attributes.uv;g.attributes.normal=base.attributes.normal;
    g.setAttribute('aOff',new T.InstancedBufferAttribute(new Float32Array(off),2));g.instanceCount=off.length/2;
    let cx=0,cz=0;for(let k=0;k<off.length;k+=2){cx+=off[k];cz+=off[k+1];}cx=cx/(off.length/2)*cell;cz=cz/(off.length/2)*cell;let r=0;for(let k=0;k<off.length;k+=2)r=Math.max(r,Math.hypot(off[k]*cell-cx,off[k+1]*cell-cz));
    g.boundingSphere=new T.Sphere(new T.Vector3(),r+cell*2+3.5);const m=new T.Mesh(g,grassMat);m.frustumCulled=true;m.receiveShadow=true;grp.add(m);GRASS.secs.push({m,cx,cz});});
  GRASS.mesh=grp;GRASS.uni.uR.value=Rad;scene.add(grp);buildFlowers(Rad);}
/* per frame: move each wedge's bounding sphere with the camera's grass cell */
function grassBounds(){if(!GRASS.secs)return;const c=GRASS.uni.uCenter.value,cell=GRASS.uni.uCell.value;for(const s of GRASS.secs)s.m.geometry.boundingSphere.center.set(c.x*cell+s.cx,camera.position.y-1.2,c.y*cell+s.cz);
  if(FLOWERS.secs){const fc=FLOWERS.uni.uFC.value,fs=FLOWERS.uni.uFCell.value;fc.set(Math.floor(camera.position.x/fs),Math.floor(camera.position.z/fs));for(const s of FLOWERS.secs)s.m.geometry.boundingSphere.center.set(fc.x*fs+s.cx,camera.position.y-1.2,fc.y*fs+s.cz);}}
/* ---------- wildflowers: the same world-locked ring around the camera, sparser cells (0.9 m), drawn from a six-species
   atlas. Meadow ground only (no forest floor, roads or the camp); they grow in drifts - one species dominant in each
   patch with others mixed through - and sway and part round your legs like the grass ---------- */
const FM=(function(){const n=256,nx=432,data=new Uint8Array(nx*n*4);
  for(let j=0;j<n;j++)for(let i=0;i<nx;i++){const x=TERR.x0+(i+.5)/nx*TERR.w,z=TERR.z0+(j+.5)/n*TERR.d,k=(j*nx+i)*4;const f=forestF(x,z);
    data[k]=(f>0||busTrample(x,z)>.4||craterGrass(x,z)<.5)?0:255;data[k+1]=clamp(fbm(x/23+31,z/23-12,2)*255,0,255);data[k+2]=0;data[k+3]=255;}
  const t=new T.DataTexture(data,nx,n,T.RGBAFormat,T.UnsignedByteType);t.magFilter=T.LinearFilter;t.minFilter=T.LinearFilter;t.needsUpdate=true;return t;})();
const FLOWERS={secs:null,uni:{uFC:{value:new T.Vector2()},uFCell:{value:.9},uFM:{value:FM}}};
const flowerMat=std({map:TX.flowers,alphaTest:.5,side:T.DoubleSide,roughness:.78,envMapIntensity:.25});flowerMat.defines.NO_PUDDLE='';
flowerMat.onBeforeCompile=s=>{Object.assign(s.uniforms,GRASS.uni,FLOWERS.uni);
  s.vertexShader=`attribute vec2 aOff;uniform vec2 uFC;uniform float uFCell,uTime,uR;uniform sampler2D uHM,uFM;uniform vec4 uTB;uniform vec3 uPlayer;varying float vFD;
  float gh(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}
  uniform sampler2D uHM2;uniform vec4 uTB2;uniform vec3 uHR2;uniform sampler2D uHM3;uniform vec4 uTB3;uniform sampler2D uVM;uniform vec4 uVB;
  /* height in metres + density channels; over the basin the fine heights, and nothing below the waterline */
  vec4 hmD(sampler2D hm1,vec2 wp,vec4 tb){if(wp.x<tb.x){vec2 u3=(wp-uTB3.xy)/uTB3.zw;vec4 h3=texture2D(uHM3,u3);h3.r=h3.r*12.-5.;if(u3.x<0.||u3.y<0.||u3.x>1.||u3.y>1.){h3.g=0.;h3.a=0.;}return h3;}vec4 h=texture2D(hm1,(wp-tb.xy)/tb.zw);h.r=h.r*12.-5.;vec2 u=(wp-uTB2.xy)/uTB2.zw;
    if(u.x>0.&&u.y>0.&&u.x<1.&&u.y<1.){h.r=texture2D(uHM2,u).r*uHR2.y+uHR2.x;if(h.r<uHR2.z+.06){h.g=0.;h.a=0.;}}vec2 uv5=(wp-uVB.xy)/uVB.zw;if(uv5.x>0.&&uv5.y>0.&&uv5.x<1.&&uv5.y<1.){vec4 vm=texture2D(uVM,uv5);h.g*=vm.g;h.a*=vm.a;}return h;}
  `+s.vertexShader.replace('#include <uv_vertex>',`#include <uv_vertex>
  vec2 cell=uFC+aOff;float r1=gh(cell+3.1),r2=gh(cell+11.7),r3=gh(cell+23.3),r4=gh(cell+47.9);
  vec2 wp=(cell+vec2(r1,r2))*uFCell;vec4 hm=hmD(uHM,wp,uTB),fm=texture2D(uFM,(wp-uTB.xy)/uTB.zw);
  float dist=length(wp-cameraPosition.xz),Rf=min(uR*1.25,44.);vFD=dist;float fade=1.-smoothstep(14.,24.,dist);
  float drift=smoothstep(.5,.68,clamp(hm.b*2.-1.,0.,1.)),meadow=smoothstep(.45,.8,hm.g)*step(.5,fm.r)*(1.-hm.a*.6);
  float dens=meadow*(.012+.3*drift);{vec2 u2=(wp-uTB2.xy)/uTB2.zw;if(u2.x>0.&&u2.y>0.&&u2.x<1.&&u2.y<1.&&hm.r<uHR2.z+1.6)dens=0.;}float show=step(r3,dens);
  float sp=floor(fm.g*5.99);if(r4<.28)sp=floor(r1*5.99);
  float hs=sp<.5?.5:sp<1.5?.62:sp<2.5?.7:sp<3.5?.86:sp<4.5?1.25:.3;
  vUv.x=(sp+uv.x)/6.;
  float fsc=show*fade*(.75+r4*.5);`).replace('#include <beginnormal_vertex>','vec3 objectNormal=vec3(0.0,1.0,0.0);')
  .replace('#include <begin_vertex>',`
  float ang=r2*6.2831;float ca=cos(ang),sa=sin(ang);vec3 transformed=position;transformed.xz=mat2(ca,-sa,sa,ca)*transformed.xz;
  transformed*=vec3(fsc*.55,fsc*hs,fsc*.55);float t=uv.y;
  float wv=sin(uTime*1.6+wp.x*.31+wp.y*.23)*.65+sin(uTime*3.7+wp.x*1.3+wp.y*.7)*.22;transformed.x+=wv*.1*t*t*fsc;transformed.z+=wv*.05*t*t*fsc;
  vec2 pd=wp-uPlayer.xz;float pl=length(pd);float push=max(0.,1.-pl/.85);transformed.xz+=(pd/max(pl,.001))*push*.3*t*fsc;transformed.y-=push*.15*t*fsc;
  transformed+=vec3(wp.x,hm.r-.03,wp.y);`);
  /* a white head a few metres off is only a pixel or two: dimmed with distance so the far ones cannot sparkle as white
     specks in the grass (the coloured ones hardly change) */
  s.fragmentShader='varying float vFD;\n'+s.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP).replace('#include <map_fragment>',`#include <map_fragment>
  {float fk=smoothstep(7.,15.,vFD);float fl=dot(diffuseColor.rgb,vec3(.3,.59,.11));diffuseColor.rgb*=mix(1.,min(1.,.34/max(fl,.01)),fk);}`);};
flowerMat.customProgramCacheKey=()=>'flowers2';
function buildFlowers(Rad){if(FLOWERS.mesh){scene.remove(FLOWERS.mesh);FLOWERS.mesh.children.forEach(c=>c.geometry.dispose());}
  const cell=FLOWERS.uni.uFCell.value,Rf=Math.min(Rad*1.25,26),K=Math.ceil(Rf/cell),NS=8,buck=Array.from({length:NS},()=>[]);
  for(let i=-K;i<=K;i++)for(let j=-K;j<=K;j++)if(i*i+j*j<=K*K){const a=Math.atan2(j,i);buck[Math.floor((a+Math.PI)/(Math.PI*2)*NS)%NS].push(i,j);}
  const q1=new T.PlaneGeometry(1,1);q1.translate(0,.5,0);const q2=q1.clone();q2.rotateY(Math.PI/2);const base=merge([q1,q2]);const grp=new T.Group();FLOWERS.secs=[];
  buck.forEach(off=>{if(!off.length)return;const g=new T.InstancedBufferGeometry();g.index=base.index;for(const a in base.attributes)g.attributes[a]=base.attributes[a];
    g.setAttribute('aOff',new T.InstancedBufferAttribute(new Float32Array(off),2));g.instanceCount=off.length/2;
    let cx=0,cz=0;for(let k=0;k<off.length;k+=2){cx+=off[k];cz+=off[k+1];}cx=cx/(off.length/2)*cell;cz=cz/(off.length/2)*cell;let r=0;for(let k=0;k<off.length;k+=2)r=Math.max(r,Math.hypot(off[k]*cell-cx,off[k+1]*cell-cz));
    g.boundingSphere=new T.Sphere(new T.Vector3(),r+cell*2+3);const m=new T.Mesh(g,flowerMat);m.frustumCulled=true;m.receiveShadow=true;grp.add(m);FLOWERS.secs.push({m,cx,cz});});
  grp.userData.keep=true;FLOWERS.mesh=grp;scene.add(grp);}
