/* ---------- props kit: individual sandbags, two-sided signs with a real back, jerrycans, pallets, barriers,
   tyre stacks, floodlights, cables. Everything repeated is instanced or merged so the base stays cheap. ---------- */
/* woven sack cloth: tight over/under weave, a stitched seam near one end, dust and damp blotches.
   Albedo is a light neutral so per-bag instance colours give khaki / olive / faded grey-green bags */
PB.sack=pbr(256,(u,v,x,y)=>{const f=64,cx=x*f/256,cy=y*f/256,ix=Math.floor(cx),iy=Math.floor(cy),fx=cx-ix,fy=cy-iy;
  const over=(ix+iy)%2===0;const th=over?Math.sin(fx*Math.PI):Math.sin(fy*Math.PI);
  const n=N2(u,v,4,4),m=N2(u,v,16,3),fz=N2(u,v,64,2);
  let c=[196+(n-.5)*30,188+(n-.5)*28,164+(n-.5)*22].map(q=>q*(.86+.14*th)*(.94+fz*.1));
  const dirt=sstep(.55,.8,m)*.35;c=mixc(c,[120,108,84],dirt);
  const seam=Math.abs(v-.9)<.012?1:0,stitch=seam&&(x%10<6)?1:0;c=c.map(q=>q*(1-seam*.18-stitch*.15));
  return[c[0],c[1],c[2],.45+th*.25+fz*.1-seam*.25+stitch*.15,.92-th*.05];},{bump:3});
M.sack=std({map:PB.sack.a,normalMap:PB.sack.n,normalScale:new T.Vector2(.9,.9),roughnessMap:PB.sack.r,roughness:1,envMapIntensity:.25});wetBase(M.sack);
/* weld duplicated box-face vertices for smooth shading after displacement */
function smoothN(g){g.computeVertexNormals();const p=g.attributes.position,n=g.attributes.normal,acc=new Map(),key=i=>`${p.getX(i).toFixed(4)},${p.getY(i).toFixed(4)},${p.getZ(i).toFixed(4)}`;
  for(let i=0;i<p.count;i++){const k=key(i);const a=acc.get(k)||[0,0,0];a[0]+=n.getX(i);a[1]+=n.getY(i);a[2]+=n.getZ(i);acc.set(k,a);}
  for(let i=0;i<p.count;i++){const a=acc.get(key(i)),l=Math.hypot(a[0],a[1],a[2])||1;n.setXYZ(i,a[0]/l,a[1]/l,a[2]/l);}return g;}
/* one filled sandbag (~58 x 30 x 12 cm): a pillow that slumps flat on the bottom, pinched and folded at the tied end */
const BAGGEO=(()=>{const L=.58,Hh=.15,D=.31;const g=new T.BoxGeometry(L,Hh,D,12,3,6);const p=g.attributes.position;
  for(let i=0;i<p.count;i++){let x=p.getX(i),y=p.getY(i),z=p.getZ(i);const nx=x/(L/2),ny=y/(Hh/2),nz=z/(D/2);
    const endP=Math.pow(Math.abs(nx),3),sideP=Math.pow(Math.abs(nz),4);
    y*=(1-.55*endP)*(1-.45*sideP);if(y<0)y*=.55;                           /* slump onto a flat bottom */
    z*=1-.16*Math.pow(Math.abs(nx),4)-.05*Math.abs(ny);x*=1-.06*sideP;
    if(nx>.82){const t=(nx-.82)/.18;z*=1-.35*t;y=y*(1-.5*t)+.012*t;x+=.02*t;}   /* tied, folded end */
    y+=.012*(1-nx*nx)*(1-nz*nz)*(ny>0?1:0);
    const h=hash(Math.round(x*400),Math.round(z*400+y*900));x+=(h-.5)*.006;y+=(hash(z*90,x*70)-.5)*.009+.006*Math.sin(x*31+z*17);
    p.setXYZ(i,x,y,z);}
  g.translate(0,.045,0);return smoothN(g);})();
const BAGS=[];const BCOL=[[.5,.46,.34],[.42,.43,.31],[.53,.48,.36],[.38,.4,.3],[.47,.43,.33],[.35,.38,.31],[.45,.41,.32]].map(c=>new T.Color(...c));
const _bo=new T.Object3D(),_bm=new T.Matrix4();
/* lay a wall of bags in running bond. par: optional parent (its world matrix is applied); lines: bags across the depth */
function bagWall(par,x,y0,z,len,ry,h,lines=2,seed=1){const rows=Math.max(1,Math.round(h/.115)),n=Math.ceil(len/.55)+1;
  if(par)par.updateMatrixWorld(true);
  /* a wall standing on the ground (not one on a roof or a wall stub) settles into the dips along its length, every course
     going down with the ground under it */
  const onGround=!par&&Math.abs(H(x,z)-y0)<.3;const sink=xl=>onGround?Math.min(0,H(x+Math.cos(ry)*xl,z-Math.sin(ry)*xl)-.03-y0):0;
  /* the courses are laid in running bond; where an offset course would hang half a bag past the end of the course under
     it, the end is finished with a half bag instead, flush with the bags below - so the wall ends stand square and every
     bag sits on something */
  const xs=[];for(let i=0;i<n;i++){const xl=-len/2+.27+i*.55;if(xl>=-len/2+.2&&xl<=len/2-.2)xs.push(xl);}const loE=xs[0],hiE=xs[xs.length-1];
  for(let r=0;r<rows;r++){const odd=r%2===1,inset=r*.012;const P=[];
    if(!odd)xs.forEach((xl,i)=>P.push([xl,1,i]));
    else{for(let i=0;i<n;i++){const xl=-len/2+.27+i*.55-.275;if(xl>loE-.01&&xl<hiE+.01)P.push([xl,1,i]);}if(xs.length>1){P.push([loE-.1375,.5,-1]);P.push([hiE+.1375,.5,n]);}else P.push([loE,1,0]);}
    for(let l=0;l<lines;l++){const zl=(l-(lines-1)/2)*(.31-inset*.3);
      for(const [xl,hk,i] of P){
        const hh=hash(seed*7.1+i*3.3+r*1.7,l*5.3+seed);
        _bo.position.set(x+(Math.cos(ry)*xl+Math.sin(ry)*zl),y0+sink(xl)+r*.112+(hh-.5)*.012,z+(-Math.sin(ry)*xl+Math.cos(ry)*zl));
        _bo.rotation.set((hash(i,r+9)-.5)*.06,ry+(hh-.5)*.09+(hh>.5?Math.PI:0),(hash(r,i+3)-.5)*.05);
        const s=.95+hash(i+seed,r*3)*.1;_bo.scale.set(s*hk,.95+hh*.1,.97+hash(r,i)*.06);_bo.updateMatrix();
        _bm.copy(_bo.matrix);if(par)_bm.premultiply(par.matrixWorld);BAGS.push([_bm.clone(),BCOL[Math.floor(hash(i*1.3+seed,r+l*7)*BCOL.length)]]);}}}
  /* collision */
  const hw=len/2,hd=lines*.17;if(!par){const c=Math.abs(Math.cos(ry)),s=Math.abs(Math.sin(ry));const ex=hw*c+hd*s,ez=hw*s+hd*c;solidAABB(x-ex,x+ex,z-ez,z+ez);}}
/* a ring of bags (MG nest / fighting position) */
function bagRing(x,z,r,a0,a1,h,seed=3){const rows=Math.round(h/.115);for(let k=0;k<rows;k++){const n=Math.floor((a1-a0)*r/.52);
  for(let i=0;i<=n;i++){const a=a0+(i+(k%2)*.5)/n*(a1-a0);if(a>a1)continue;const rr=r-k*.01;
    _bo.position.set(x+Math.sin(a)*rr,k*.112,z+Math.cos(a)*rr);_bo.rotation.set(0,a+Math.PI/2+(hash(i,k)-.5)*.1,(hash(k,i)-.5)*.05);_bo.scale.set(.95+hash(i,k+2)*.1,1,1);_bo.updateMatrix();
    BAGS.push([_bo.matrix.clone(),BCOL[Math.floor(hash(i+seed,k)*BCOL.length)]]);
    _bo.position.set(x+Math.sin(a)*(rr+.31),k*.112,z+Math.cos(a)*(rr+.31));_bo.updateMatrix();BAGS.push([_bo.matrix.clone(),BCOL[Math.floor(hash(i,k+seed)*BCOL.length)]]);}}
  for(let a=a0;a<=a1;a+=.4)solids.push({cx:x+Math.sin(a)*(r+.15),cz:z+Math.cos(a)*(r+.15),r:.3});}
/* (each flush gets its own geometry object over the shared buffers, with a bounding sphere round all of its bags - an
   InstancedMesh is culled, and filed into a streaming region, by its geometry's sphere) */
function flushBags(){if(!BAGS.length)return;const bg=new T.BufferGeometry();bg.index=BAGGEO.index;for(const a in BAGGEO.attributes)bg.setAttribute(a,BAGGEO.attributes[a]);
  {const bb=new T.Box3(),v=V3();BAGS.forEach(([m])=>{v.setFromMatrixPosition(m);bb.expandByPoint(v);});bg.boundingSphere=new T.Sphere(bb.getCenter(V3()),bb.getSize(V3()).length()/2+.6);bg.boundingBox=bb.expandByScalar(.6);}
  const im=new T.InstancedMesh(bg,M.sack,BAGS.length);
  BAGS.forEach(([m,c],i)=>{im.setMatrixAt(i,m);im.setColorAt(i,c);});im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
  im.castShadow=im.receiveShadow=true;scene.add(im);shootables.push(im);BAGS.length=0;return im;}

/* signs: printed face only on the front, a painted steel back and edge, posts behind - nothing mirrored, nothing coplanar */
const SIGNBACK=std({color:C(0x5d6150),roughness:.7,metalness:.35});
function signBoard(w,h,map,o={}){const g=new T.Group();mesh(rbox(w+.04,h+.04,.035,.01),o.back||SIGNBACK,0,0,-.018,g);
  const f=mesh(new T.PlaneGeometry(w,h),std({map,roughness:o.rough||.75,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2}),0,0,.003,g,false);f.receiveShadow=true;
  if(o.posts)[-1,1].forEach(s=>mesh(rbox(.08,o.posts,.08,.01),M.steel,s*(w/2-.15),-h/2-o.posts/2+h*.5+.2,-.08,g));return g;}
/* two U-bolt clamps tying a sign board to its post */
function signClamps(par,x,ys,zb,pw){ys.forEach(y=>{mesh(rbox(pw+.04,.04,.012,.004),M.gunD,x,y,zb-.006,par);mesh(rbox(.025,.04,pw+.03,.004),M.gunD,x-pw/2-.012,y,zb-pw/2-.01,par);mesh(rbox(.025,.04,pw+.03,.004),M.gunD,x+pw/2+.012,y,zb-pw/2-.01,par);
  mesh(rbox(pw+.04,.04,.012,.004),M.gunD,x,y,zb-pw-.03,par);});}
/* fit-to-width text helper for sign textures */
function fitText(g,s,x,y,maxW,font,size){let sz=size;do{g.font=font.replace('#',sz);sz-=1;}while(g.measureText(s).width>maxW&&sz>8);g.fillText(s,x,y);}

/* jerrycan: pressed-steel body with the X stamping, triple handle, spout */
const CANGEO=G('jerry',()=>{const P=[];P.push(tag(rbox(.165,.47,.34,.03),0));
  [-1,1].forEach(s=>{[.6,-.6].forEach(a=>{const b=new T.BoxGeometry(.01,.36,.03);xf(b,0,0,0,a,0,0);xf(b,s*.084,-.02,0);P.push(tag(b,0));});
    const rim=new T.BoxGeometry(.012,.4,.012);xf(rim,s*.084,-.02,.13);P.push(tag(rim,0));const rim2=rim.clone();xf(rim2,0,0,-.26);P.push(tag(rim2,0));});
  for(let i=0;i<3;i++){const hd=new T.CylinderGeometry(.012,.012,.11,6);xf(hd,0,.255,-.09+i*.09,Math.PI/2,0,0);P.push(tag(hd,0));const st=new T.BoxGeometry(.03,.04,.012);xf(st,0,.24,-.09+i*.09);P.push(tag(st,0));}
  const sp=new T.CylinderGeometry(.025,.028,.05,10);xf(sp,0,.255,.13);P.push(tag(sp,1));return merge(P);});
const CANMAT=[std({color:C(0x3c4529),roughness:.55,metalness:.35,vertexColors:true}),M.gunD];
function jerrycan(x,y,z,ry,par=scene,tilt=0){const m=new T.Mesh(CANGEO,CANMAT);m.position.set(x,y+.235,z);m.rotation.set(0,ry,tilt);m.castShadow=m.receiveShadow=true;par.add(m);return m;}
/* euro pallet */
const PALGEO=G('pallet',()=>{const P=[];for(let i=0;i<7;i++){const b=rbox(1.2,.022,.1,.004);xf(b,0,.122,-.35+i*.117);P.push(b);}
  [-1,0,1].forEach(s=>{const b=rbox(1.2,.022,.1,.004);xf(b,0,.011,s*.35);P.push(b);for(let k=-1;k<=1;k++){const bl=rbox(.14,.078,.1,.006);xf(bl,k*.53,.061,s*.35);P.push(bl);}});return merge(P);});
function pallet(x,z,ry,y=0){const m=mesh(PALGEO,M.boards,x,y,z,scene);m.rotation.y=ry;return m;}
/* stacked old tyres */
const TYREGEO=G('stackTyre',()=>{const t=new T.TorusGeometry(.36,.13,10,24);t.rotateX(Math.PI/2);t.scale(1,.75,1);return t;});
function tyreStack(x,z,n){for(let i=0;i<n;i++){const t=mesh(TYREGEO,M.tire,x+(hash(i,x)-.5)*.08,.1+i*.19,z+(hash(z,i)-.5)*.08,scene);t.rotation.y=i;}solids.push({cx:x,cz:z,r:.5});}
/* smooth precast concrete for the barriers: no cracks, just form-board marks, a few pits and road grime at the base */
let _cc=null;function CLEANCON(){if(_cc)return _cc;const P=pbr(256,(u,v)=>{const n=N2(u,v,4,4),m=N2(u,v,30,2);let k=150+(n-.5)*24+(m-.5)*8;let c=[k,k*.985,k*.95];
    const form=sstep(.96,1,Math.abs(Math.sin(v*Math.PI*3)))*.06;c=c.map(x=>x*(1-form));const pit=sstep(.88,.93,N2(u,v,90,1));c=c.map(x=>x*(1-pit*.25));
    const grime=sstep(.75,1,v)*.35;c=mixc(c,[92,86,74],grime);return[c[0],c[1],c[2],.6+n*.1-pit*.3,.85+m*.08];},{bump:3});
  _cc=std({map:P.a,normalMap:P.n,roughnessMap:P.r,roughness:1,envMapIntensity:.35});return _cc;}
/* concrete jersey barrier */
const JERSEY=G('jersey',()=>{const s=new T.Shape();s.moveTo(-.3,0);s.lineTo(.3,0);s.lineTo(.3,.08);s.lineTo(.12,.3);s.lineTo(.08,.81);s.lineTo(-.08,.81);s.lineTo(-.12,.3);s.lineTo(-.3,.08);s.closePath();
  const g=new T.ExtrudeGeometry(s,{depth:2.0,bevelEnabled:true,bevelThickness:.015,bevelSize:.015,bevelSegments:1});g.translate(0,0,-1);worldUV(g,.6);return g;});
function jersey(x,z,ry){const m=mesh(JERSEY,CLEANCON(),x,0,z,scene);m.rotation.y=ry;solidFrom(m);shootables.push(m);return m;}
/* floodlight on a pole with a cable down it */
function floodlight(x,z,ry,hgt=4.2){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
  mesh(new T.CylinderGeometry(.045,.06,hgt,8),M.steel,0,hgt/2,0,g);const hd=new T.Group();hd.position.set(0,hgt+.05,.12);hd.rotation.x=.45;g.add(hd);
  mesh(rbox(.36,.26,.14,.03),M.gunD,0,0,0,hd);mesh(new T.PlaneGeometry(.3,.2),M.lamp,0,0,.072,hd,false);mesh(rbox(.06,.06,.18,.01),M.gunD,0,-.1,-.1,hd);
  mesh(new T.CylinderGeometry(.008,.008,hgt,4),M.black,.06,hgt/2,-.04,g,false);return g;}
/* sagging cable between two points */
function cable(a,b,sag=.4,n=16){const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(V3(lerp(a.x,b.x,t),lerp(a.y,b.y,t)-Math.sin(t*Math.PI)*sag,lerp(a.z,b.z,t)));}
  const c=new T.CatmullRomCurve3(pts);const m=mesh(new T.TubeGeometry(c,n*2,.009,4,false),M.black,0,0,0,scene,false);return m;}
/* PKM on its tripod */
function pkm(x,y,z,ry){const g=new T.Group();g.position.set(x,y,z);g.rotation.y=ry;scene.add(g);const k=M.gunD;
  [[.35,-.25],[-.35,-.25],[0,.4]].forEach(([a,b])=>{const l=mesh(new T.CylinderGeometry(.012,.012,.62,6),k,a*.5,.27,b*.5,g);l.rotation.set(b*.9,0,-a*.9);});
  const b=new T.Group();b.position.set(0,.55,0);g.add(b);mesh(rbox(.07,.09,.55,.01),k,0,0,0,b);mesh(new T.CylinderGeometry(.016,.016,.62,8),k,0,.02,-.55,b).rotation.x=Math.PI/2;
  mesh(rbox(.05,.08,.32,.01),M.wood,0,-.02,.4,b);mesh(rbox(.1,.1,.12,.01),std({color:C(0x4d5a33),roughness:.6}),.08,-.06,-.02,b);
  mesh(new T.CylinderGeometry(.022,.022,.08,8),k,0,.02,-.88,b).rotation.x=Math.PI/2;return g;}
