/* (from here on round things are built round: see HIPOLY in 00_core) */HIPOLY=true;
/* ---------- BTR-80: faceted lofted hull with full running gear ---------- */
function loft(sections,skip){const pos=[];const n=sections[0].pts.length;const P=(s,i)=>[s.x,s.pts[i][1],s.pts[i][0]];
  const tri=(a,b,c)=>pos.push(...a,...b,...c);
  for(let k=0;k<sections.length-1;k++){const A=sections[k],B=sections[k+1];for(let i=0;i<n;i++){if(skip&&skip(k,i))continue;const j=(i+1)%n;tri(P(A,i),P(B,j),P(B,i));tri(P(A,i),P(A,j),P(B,j));}}
  [[sections[0],1],[sections[sections.length-1],-1]].forEach(([S,dir])=>{const c=[S.x,S.pts.reduce((a,p)=>a+p[1],0)/n,0];for(let i=0;i<n;i++){const j=(i+1)%n;if(dir>0)tri(c,P(S,i),P(S,j));else tri(c,P(S,j),P(S,i));}});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.computeVertexNormals();worldUV(g,.28);
  const p=g.attributes.position,col=new Float32Array(p.count*3);const mud=C(0x6a5a40),top=new T.Color(1,1,1);
  for(let i=0;i<p.count;i++){const c=mud.clone().lerp(top,sstep(.55,1.45,p.getY(i)));col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}g.setAttribute('color',new T.BufferAttribute(col,3));return g;}
function tireGeo(){const pr=[[.3,-.18],[.47,-.19],[.53,-.17],[.555,-.12],[.56,0],[.555,.12],[.53,.17],[.47,.19],[.3,.18]];const parts=[tag(xf(lathe(pr,30),0,0,0,Math.PI/2,0,0),0)];
  for(let i=0;i<22;i++){const a=i/22*Math.PI*2;[-1,1].forEach(s=>{const b=new T.BoxGeometry(.05,.035,.15);xf(b,0,0,0,0,s*.35,0);xf(b,0,.565,s*.07);xf(b,0,0,0,0,0,a);parts.push(tag(b,0));});}
  const rim=lathe([[.0,.2],[.2,.2],[.29,.17],[.31,.12],[.31,-.15],[.0,-.15]],24);xf(rim,0,0,0,Math.PI/2,0,0);parts.push(tag(rim,1));
  const hub=new T.CylinderGeometry(.11,.13,.08,32);xf(hub,0,0,.22,Math.PI/2,0,0);parts.push(tag(hub,1));
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2;const nut=new T.CylinderGeometry(.018,.018,.04,6);xf(nut,Math.cos(a)*.17,Math.sin(a)*.17,.21,Math.PI/2,0,0);parts.push(tag(nut,1));}
  return merge(parts);}
let _btrGrime=null;function BTRGRIME(){if(_btrGrime)return _btrGrime;
  const t=tex(256,256,(c,w,h)=>{const im=c.createImageData(w,h),d=im.data;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=1-y/h,u=x/w,i=(y*w+x)*4;const n=fbmT(u,v,6,4),m=fbmT(u*4,v*.5,8,3),st=fbmT(u*14,v*.6,10,2);
      const mud=sstep(.52,.2,v+(n-.5)*.25),splash=sstep(.62,.35,v+(m-.5)*.35)*sstep(.45,.6,m)*.7,streak=sstep(.6,.75,st)*sstep(.98,.6,v)*.35,dust=sstep(.82,.97,v)*(.35+n*.4);
      let a=Math.max(mud*.85,splash,streak,dust);const k=dust>Math.max(mud,splash,streak)?1:0;
      d[i]=k?150+n*30:72+n*26;d[i+1]=k?136+n*26:60+n*20;d[i+2]=k?104+n*20:42+n*14;d[i+3]=clamp(a,0,1)*255;}
    c.putImageData(im,0,0);});
  return _btrGrime=std({map:t,transparent:true,depthWrite:false,roughness:.95,envMapIntensity:.2,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});}
const _BM={};function BTRMAT(k){if(_BM[k])return _BM[k];let m;
  switch(k){case 'plate':m=M.paintP.clone();m.side=T.DoubleSide;break;
    case 'glass':m=std({color:C(0x9fb2b0),roughness:.22,metalness:0,transparent:true,opacity:.22,depthWrite:false,envMapIntensity:.55});break;
    case 'interior':m=std({color:C(0x8e9a82),roughness:.8,side:T.DoubleSide});break;
    case 'interior2':m=std({color:C(0x7d876f),roughness:.7,metalness:.2});break;
    case 'seat':m=std({color:C(0x2c2a24),roughness:.75});break;
    case 'dial':m=new T.MeshBasicMaterial({color:C(0x9fb090)});break;
    case 'radio':m=std({color:C(0x4a5a3a),roughness:.6,metalness:.2});break;
    case 'ext':m=std({color:C(0x9a1a12),roughness:.4,metalness:.2});break;}
  return _BM[k]=m;}
/* tanker's kit for the BTR driver: black coverall over the field uniform, padded TSh-type helmet with headset */
let _covTex=null;
function tankerize(h){if(!_covTex)_covTex=tex(128,128,(c,w,hh)=>{c.fillStyle='#202327';c.fillRect(0,0,w,hh);for(let y=0;y<hh;y+=2)for(let x=0;x<w;x+=2){c.fillStyle=`rgba(${(x+y)%4?60:20},${(x+y)%4?64:22},${(x+y)%4?70:26},.35)`;c.fillRect(x,y,2,1);}});
  const cov=triMat(_covTex,6,{roughness:.95,color:C(0x8a8f96)});
  h.root.traverse(m=>{if(m.isSkinnedMesh&&m.material&&m.material!==m.material.skinMark){const mm=Array.isArray(m.material)?m.material[0]:m.material;if(mm&&mm.map===TX.emr)m.material=cov;}});
  const H=h.P.head;const c=CD.chars[h.name];const hp=new T.Vector3();h.root.updateMatrixWorld(true);
  H.getWorldPosition(hp);   /* called before the driver is placed or posed, so this is the bind-pose head position */
  const cap=new T.Group();H.add(cap);
  if(c.tsh){/* TSh-4 helmet built offline around this character's head: textured canvas shell with stitching,
     dark lining, rolled piping on every edge, leather strap and buckle tab */
    const d=c.tsh;const sh=P=>{for(let i=0;i<P.length;i+=3){P[i]-=hp.x;P[i+1]-=hp.y;P[i+2]-=hp.z;}return P;};
    const tx=texLoad(d.tex);tx.anisotropy=8;
    const outer=std({map:tx,roughness:1,envMapIntensity:.08});detailPatch(outer,'weave',170,.22,false);
    const lining=std({color:C(0x16181c),roughness:.95,envMapIntensity:.15,side:T.DoubleSide});
    const fabric=std({color:C(0x181b21),roughness:.9,envMapIntensity:.2});detailPatch(fabric,'weave',170,.22);
    const leather=std({color:C(0x3e2a1c),roughness:.5,envMapIntensity:.5});
    {const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(sh(deq(d.p)),3));
     const u16=b64u(d.uv,Uint16Array),uv=new Float32Array(u16.length);for(let i=0;i<uv.length;i++)uv[i]=u16[i]/65535;g.setAttribute('uv',new T.BufferAttribute(uv,2));
     const fo=b64u(d.fo,Uint32Array),fi=b64u(d.fi,Uint32Array),fr=b64u(d.fr,Uint32Array);const ix=new Uint32Array(fo.length+fi.length+fr.length);ix.set(fo);ix.set(fi,fo.length);ix.set(fr,fo.length+fi.length);
     g.setIndex(new T.BufferAttribute(ix,1));g.addGroup(0,fo.length,0);g.addGroup(fo.length,fi.length+fr.length,1);g.computeVertexNormals();
     const m=new T.Mesh(g,[outer,lining]);m.castShadow=m.receiveShadow=true;cap.add(m);}
    const part=(dd,mat)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(sh(deq(dd.p)),3));g.setIndex(new T.BufferAttribute(b64u(dd.t,Uint32Array),1));g.computeVertexNormals();
      const m=new T.Mesh(g,mat);m.castShadow=m.receiveShadow=true;cap.add(m);return m;};
    part(d.pipe,fabric);part(d.leather,leather);
  }
  h.P.tanker=cap;}
/* BTR-80, modelled from the side / top / front / rear reference drawings (scale 7.65 m x 2.9 m).
   Local frame: +x forward (nose at x=+3.83), +y up, +z = the vehicle's right. Positions are written as metres back
   from the nose (n), the way they were measured off the drawing, and converted with X(n). */
function buildBTR(opts={}){const g=new T.Group();const paint=M.paint,pp=M.paintP,dk=M.gunD;
  const X=n=>3.83-n;
  const S=(n,top,tw,uy,uw,ly,lw,by,bw)=>({x:X(n),pts:[[tw,top],[uw,uy],[lw,ly],[bw,by],[-bw,by],[-lw,ly],[-uw,uy],[-tw,top]]});
  /* hull: sharp nose at 1.35 m, low trim-vane deck, steep window plate up to a flat roof (1.88 m at the front rising to
     1.97 m), inward-sloping upper sides over a 2.9 m chine at 1.3 m, lower hull narrowing to a 2 m belly at 0.52 m */
  const SECS=[S(7.62,1.80,.95,1.36,1.22,.95,1.02,.66,.92),S(7.45,1.9,.96,1.33,1.34,.92,1.1,.56,.96),S(7.3,1.97,.97,1.3,1.45,.91,1.17,.52,1.0),
    S(4.0,1.97,.97,1.3,1.45,.91,1.17,.52,1.0),S(1.32,1.88,.97,1.31,1.43,.91,1.17,.52,1.0),S(1.02,1.5,1.1,1.32,1.32,.92,1.12,.6,1.0),
    S(.36,1.45,.98,1.33,1.05,1.17,1.02,1.04,.98),S(.03,1.41,.84,1.35,.88,1.31,.87,1.27,.84)];
  const WSKIP=(k,i)=>k===4&&i===7;   /* the window plate is built separately with real openings */
  const hull=mesh(loft(SECS,WSKIP),paint,0,0,0,g);
  const roofY=n=>n<1.32?1.88:n>4?1.97:lerp(1.88,1.97,(n-1.32)/2.68);
  const zU=y=>.97+(1.97-y)*.716,zL=y=>1.0+(y-.52)*.577;          /* upper / lower side plate z at height y */
  /* grime shell: the same hull with a mud / dust / streak layer mapped by height */
  {const gg=loft(SECS,WSKIP),p=gg.attributes.position,n=gg.attributes.normal,uv=new Float32Array(p.count*2);
   for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i);p.setXYZ(i,x+n.getX(i)*.004,y+n.getY(i)*.004,z+n.getZ(i)*.004);uv[i*2]=(x+(Math.abs(n.getX(i))>.7?z:0))*.32;uv[i*2+1]=clamp(y/2.1,0,1);}
   gg.setAttribute('uv',new T.BufferAttribute(uv,2));const gm=mesh(gg,BTRGRIME(),0,0,0,g,false);gm.renderOrder=1;}
  /* worn edges along the roof edge and chine */
  {const wm=std({color:C(0x4a4d3e),roughness:.45,metalness:.6});for(const i of [0,1,6,7]){const pts=SECS.map(sc=>V3(sc.x,sc.pts[i][1],sc.pts[i][0]));
     mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',0),48,.011,4,false),wm,0,0,0,g,false);}}
  const onU=(sd,n,y,w,h,mat=pp,t=.03)=>{const m=mesh(rbox(w,h,t,.008),mat,X(n),y,sd*(zU(y)+t*.4),g);m.rotation.x=-sd*.62;return m;};
  const onL=(sd,n,y,w,h,mat=pp,t=.03)=>{const m=mesh(rbox(w,h,t,.008),mat,X(n),y,sd*(zL(y)+t*.4),g);m.rotation.x=sd*.52;return m;};
  /* ---- wheels: 4 axles, 1.1 m tyres, track 2.4 m ---- */
  const tg=G('btrTire',tireGeo);const wheels=[];
  [1.78,3.2,4.85,6.25].forEach(n=>[-1,1].forEach(sd=>{const w=new T.Mesh(tg,[M.tire,pp]);w.position.set(X(n),.56,sd*1.2);if(sd<0)w.rotation.y=Math.PI;w.castShadow=w.receiveShadow=true;g.add(w);wheels.push(w);
    /* the first two axles steer (the second one less), every wheel rides on its own suspension arm */
    w.userData.sd=sd;w.userData.y0=w.rotation.y;w.userData.steer=n===1.78?1:n===3.2?.62:0;}));
  /* ---- front: trim vane on the nose deck, window plate with armoured covers, headlight clusters, tow hooks ---- */
  {const tv=new T.Group();tv.position.set(X(.43),1.465,0);tv.rotation.z=-.09;g.add(tv);mesh(rbox(.66,.045,1.7,.02),pp,0,0,0,tv);
   for(let i=0;i<7;i++)mesh(rbox(.56,.03,.03,.006),dk,0,.035,-.72+i*.24,tv);[-1,1].forEach(sd=>mesh(rbox(.08,.06,.1,.01),dk,.28,.02,sd*.78,tv));}
  const plate=(o,nx,ny)=>{const q=new T.Group();q.position.copy(o);q.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(V3(nx,ny,0),V3(-ny,nx,0),V3(0,0,1)));g.add(q);return q;};
  /* ---- window plate with two real openings: driver (left) and commander (right) windscreens, armoured covers raised ---- */
  const wp=plate(V3(X(1.17),1.69,0),.785,.62);   /* local x = plate normal, y = up the slope, z = across */
  {const L2=.242,sh=new T.Shape();sh.moveTo(-1.1,-L2);sh.lineTo(1.1,-L2);sh.lineTo(.97,L2);sh.lineTo(-.97,L2);sh.closePath();
   [-1,1].forEach(sd=>{const h=new T.Path(),z0=sd*.42-.21,z1=sd*.42+.21;h.moveTo(z0,-.11);h.lineTo(z0,.11);h.lineTo(z1,.11);h.lineTo(z1,-.11);h.closePath();sh.holes.push(h);});
   const pg=new T.ShapeGeometry(sh);pg.applyMatrix4(new T.Matrix4().makeBasis(V3(0,0,1),V3(0,1,0),V3(-1,0,0)));
   const ppD=BTRMAT('plate');mesh(pg,ppD,0,0,0,wp);
   const gl=BTRMAT('glass');
   [-1,1].forEach(sd=>{const zc=sd*.42;
     /* armour thickness around the opening, rubber seal, recessed glass */
     [[0,.11,.44,.012],[0,-.11,.44,.012]].forEach(([a,u,w,t])=>mesh(new T.BoxGeometry(.05,t,w),pp,-.02,u,zc,wp));
     [-1,1].forEach(k=>mesh(new T.BoxGeometry(.05,.23,.012),pp,-.02,0,zc+k*.215,wp));
     [[.0,.1,.4,.01],[.0,-.1,.4,.01]].forEach(([a,u,w,t])=>mesh(new T.BoxGeometry(.014,t,w),M.tire,-.03,u,zc,wp,false));[-1,1].forEach(k=>mesh(new T.BoxGeometry(.014,.2,.01),M.tire,-.03,0,zc+k*.2,wp,false));
     const gp=mesh(new T.PlaneGeometry(.4,.2),gl,-.034,0,zc,wp,false);gp.rotation.y=Math.PI/2;gp.renderOrder=3;
     /* raised armoured cover on its hinge, with stay arms and a handle */
     if(sd>0){/* commander's side: armoured cover closed down over the glass, latched */
       mesh(rbox(.035,.27,.5,.01),pp,.035,0,zc,wp);mesh(rbox(.02,.03,.1,.005),dk,.055,-.1,zc,wp);mesh(rbox(.02,.03,.1,.005),dk,.055,.1,zc+.18,wp);
     }else{
     const cv=new T.Group();cv.position.set(.02,.135,zc);cv.rotation.z=-1.32;wp.add(cv);mesh(rbox(.035,.28,.5,.01),pp,0,.14,0,cv);
     mesh(rbox(.05,.04,.08,.01),dk,.03,.25,-.15,cv);[-1,1].forEach(k=>{const st=mesh(new T.CylinderGeometry(.008,.008,.2,5),dk,.08,.05,k*.2,cv);st.rotation.z=.7;});}
     mesh(xf(new T.CylinderGeometry(.022,.022,.52,24),0,0,0,Math.PI/2,0,0),pp,.02,.13,zc,wp);});}
  /* ---- driver's / commander's compartment seen through the windscreens ---- */
  {const IS=[S(1.05,1.49,1.06,1.31,1.27,.93,1.08,.62,.95),S(1.33,1.85,.94,1.29,1.39,.93,1.13,.56,.96),S(2.45,1.88,.94,1.28,1.40,.93,1.13,.56,.96)];
   const ig=loft(IS,(k,i)=>k===0&&i===7);ig.deleteAttribute('color');const im=mesh(ig,BTRMAT('interior'),0,0,0,g,false);im.name='btrInterior';
   const IM=BTRMAT('interior2'),blk=M.black,dark=M.gunD;
   /* seats */
   [-1,1].forEach(sd=>{const zc=sd*.43;mesh(rbox(.42,.09,.42,.03),BTRMAT('seat'),X(2.04),.8,zc,g,false);const bk=mesh(rbox(.09,.52,.42,.03),BTRMAT('seat'),X(2.32),1.06,zc,g,false);bk.rotation.z=.12;
     mesh(new T.CylinderGeometry(.02,.02,.35,6),dark,X(2.0),.72,zc,g,false);});
   /* driver's controls: steering wheel on its column, instrument panel with dials and lamps, pedals, levers */
   const zd=-.43;const sw=new T.Group();sw.position.set(X(1.62),1.3,zd);sw.rotation.set(0,Math.PI/2,0);g.add(sw);
   const swi=new T.Group();swi.rotation.x=-.9;sw.add(swi);mesh(new T.TorusGeometry(.17,.016,6,24),blk,0,0,0,swi,false);
   for(let i=0;i<3;i++){const sp=mesh(new T.BoxGeometry(.015,.16,.012),blk,0,0,0,swi,false);sp.rotation.z=i*2.094;sp.position.set(Math.sin(i*2.094)*.08,-Math.cos(i*2.094)*.08,0);}
   mesh(new T.CylinderGeometry(.03,.03,.04,24),blk,0,0,0,swi,false).rotation.x=Math.PI/2;
   const col=mesh(new T.CylinderGeometry(.028,.034,.55,24),dark,X(1.45),1.12,zd,g,false);col.rotation.z=.9;
   const ip=new T.Group();ip.position.set(X(1.25),1.42,-.2);g.add(ip);mesh(rbox(.14,.24,.95,.02),IM,0,0,0,ip,false);
   const dial=BTRMAT('dial');for(let i=0;i<5;i++){const d=mesh(new T.CircleGeometry(.034,14),dial,-.072,.04,-.33+i*.13,ip,false);d.rotation.y=-Math.PI/2;
     mesh(xf(new T.TorusGeometry(.036,.006,4,14),0,0,0,0,Math.PI/2,0),dark,-.072,.04,-.33+i*.13,ip,false);}
   [[.0,-.05,.35,0x40ff60],[.0,-.05,.3,0xff5030],[.0,-.05,.25,0xffc040]].forEach(([dx,dy,dz,c])=>mesh(new T.SphereGeometry(.011,6,5),new T.MeshBasicMaterial({color:c}),-.074,dy,dz-.6,ip,false));
   for(let i=0;i<4;i++)mesh(rbox(.03,.03,.03,.005),blk,-.072,-.08,-.38+i*.06,ip,false);
   [-.12,0,.12].forEach(dz=>{const pd=mesh(rbox(.08,.03,.06,.006),blk,X(1.3),.72,zd+dz,g,false);pd.rotation.z=.6;});
   [.2,.28].forEach(dz=>{const lv=mesh(new T.CylinderGeometry(.01,.012,.32,6),blk,X(1.75),.95,zd+dz,g,false);lv.rotation.z=-.3;mesh(new T.SphereGeometry(.022,8,6),blk,X(1.7),1.1,zd+dz,g,false);});
   /* periscope blocks above the windscreens, radio set and fire extinguisher on the commander's side, cable runs */
   [-1,1].forEach(sd=>{for(let i=0;i<2;i++)mesh(rbox(.1,.07,.12,.01),IM,X(1.42),1.82,sd*.42+(i-.5)*.24,g,false);});
   const rad=mesh(rbox(.25,.22,.3,.02),BTRMAT('radio'),X(1.9),1.42,.78,g,false);for(let i=0;i<4;i++)mesh(new T.CylinderGeometry(.015,.015,.03,24),blk,X(1.77),1.45+(i%2)*.06,.7+Math.floor(i/2)*.12,g,false).rotation.z=Math.PI/2;
   mesh(new T.CylinderGeometry(.05,.05,.38,24),BTRMAT('ext'),X(2.35),1.12,-.85,g,false);
   [[.85,1.7],[.9,1.25]].forEach(([zz,yy])=>mesh(xf(new T.CylinderGeometry(.012,.012,1.1,5),0,0,0,0,0,Math.PI/2),blk,X(1.9),yy,-zz,g,false));
   const il=new T.PointLight(C(0xd8e0c8),.9,2.4,2);il.position.set(X(1.85),1.72,0);g.add(il);
   /* the driver: seated at the wheel in a black tanker's coverall and a padded tanker's helmet with headset */
   if(opts.driver!==false&&typeof buildHuman==='function'){const d=buildHuman({char:opts.driverChar||(CD.chars.driver?'driver':'guard2'),outfit:'ratnik',vest:false,helmet:false});
     tankerize(d);d.root.position.set(X(2.1),.37,zd);d.root.rotation.y=Math.PI/2;g.add(d.root);
     animate(d,{pose:'drive'});g.userData.driver=d;}}
  /* headlight clusters bolted to the top outer corners of the window plate: mounting plate flush on the armour, main
     lamp and IR lamp in deep housings, a bent-bar guard over them, and a hooded side marker */
  [-1,1].forEach(sd=>{const hc=new T.Group();hc.position.set(X(1.2),1.7,sd*1.06);hc.quaternion.copy(wp.quaternion);g.add(hc);
    mesh(rbox(.03,.26,.34,.02),pp,.015,0,0,hc);
    [[.04,-sd*.07,.075,M.glass],[-.05,sd*.09,.06,std({color:C(0x24221c),roughness:.25,metalness:.4})]].forEach(([dy,dz,r,gm])=>{
      mesh(xf(new T.CylinderGeometry(r,r*1.12,.13,16),0,0,0,0,0,Math.PI/2),dk,.095,dy,dz,hc);
      mesh(xf(new T.TorusGeometry(r*.98,.008,5,16),0,0,0,0,Math.PI/2,0),dk,.162,dy,dz,hc);
      mesh(new T.CircleGeometry(r*.86,16),gm,.158,dy,dz,hc,false).rotation.y=Math.PI/2;});
    /* guard: two bent bars from the plate up and over the lamps */
    [-.13,.13].forEach(zz=>{const pts=[V3(.02,-.12,zz),V3(.2,-.08,zz),V3(.24,.04,zz),V3(.2,.15,zz),V3(.02,.14,zz)];
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),16,.009,5,false),dk,0,0,0,hc);});
    mesh(xf(new T.CylinderGeometry(.009,.009,.27,5),0,0,0,Math.PI/2,0,0),dk,.24,.04,0,hc);
    /* triangular mud guard standing up from the roof corner, welded along its base */
    {const sh=new T.Shape();sh.moveTo(0,0);sh.lineTo(.42,0);sh.lineTo(0,.24);sh.closePath();const gg=new T.ExtrudeGeometry(sh,{depth:.02,bevelEnabled:true,bevelSize:.004,bevelThickness:.004,bevelSegments:1});
     const gm=mesh(gg,pp,X(1.72),roofY(1.5)-.01,sd*.985-(sd>0?.02:0),g);mesh(rbox(.44,.02,.06,.006),dk,X(1.5),roofY(1.5)+.005,sd*.985,g);}
    mesh(rbox(.05,.04,.08,.008),std({color:C(0xd08a20),roughness:.4}),X(.6),1.42,sd*1.02,g);
    /* tow hooks */
    mesh(xf(new T.TorusGeometry(.055,.018,6,12),0,0,0,0,Math.PI/2,0),dk,X(.12),1.2,sd*.42,g);mesh(rbox(.1,.08,.12,.01),dk,X(.17),1.2,sd*.42,g);});
  /* ---- roof: driver / commander hatches with periscopes, troop hatches, engine deck louvres, rear grilles ---- */
  [-1,1].forEach(sd=>{
    /* each lid hangs on the hinge pin at its rear edge (sd>0 is the commander's, on the right): a pivot group so it can
       be swung open; under it a dark coaming ring and the black of the hull interior */
    const hy=roofY(1.62),hv=new T.Group();hv.position.set(X(1.62)-.27,hy+.02,sd*.45);g.add(hv);
    mesh(new T.CylinderGeometry(.27,.27,.04,18),pp,.27,0,0,hv);
    mesh(xf(new T.TorusGeometry(.05,.008,4,10,Math.PI),0,0,0,0,Math.PI/2,0),dk,.27,.025,0,hv);
    mesh(new T.CylinderGeometry(.24,.24,.012,18),pp,.27,-.026,0,hv,false);
    mesh(xf(new T.TorusGeometry(.262,.022,6,24),0,0,0,Math.PI/2,0,0),pp,X(1.62),hy+.012,sd*.45,g);
    mesh(new T.CylinderGeometry(.245,.245,.01,18),std({color:C(0x0b0b0a),roughness:1}),X(1.62),hy+.006,sd*.45,g,false);
    if(sd>0)g.userData.cmdHatch=hv;else g.userData.drvHatch=hv;
    mesh(xf(new T.CylinderGeometry(.03,.03,.36,24),0,0,0,Math.PI/2,0,0),pp,X(1.88),roofY(1.88)+.035,sd*.45,g);
    for(let i=0;i<3;i++)mesh(rbox(.07,.07,.1,.01),dk,X(1.4),roofY(1.4)+.06,sd*.45+(i-1)*.12,g);
    const th=mesh(rbox(.6,.04,.55,.04),pp,X(4.3),1.99,sd*.55,g);mesh(xf(new T.CylinderGeometry(.025,.025,.5,24),0,0,0,Math.PI/2,0,0),pp,X(4.0),2.0,sd*.55,g);
    mesh(new T.CylinderGeometry(.13,.13,.05,32),pp,X(4.3),2.02,sd*.55,g);
    mesh(new T.CylinderGeometry(.11,.12,.06,32),pp,X(5.07),2.0,sd*.82,g);mesh(new T.CylinderGeometry(.04,.05,.08,24),dk,X(5.0),2.02,sd*.4,g);});
  for(let i=0;i<6;i++){const zz=-.73+i*.292;mesh(rbox(.9,.05,.24,.1),pp,X(5.85),1.995,zz,g);for(let k=0;k<6;k++)mesh(rbox(.04,.02,.18,.005),M.dark,X(5.5)-k*.14,2.022,zz,g,false);}
  mesh(rbox(.9,.04,1.6,.02),M.grille,X(6.9),1.99,0,g);mesh(rbox(.06,.05,1.75,.01),pp,X(6.42),2.0,0,g);
  [-1,1].forEach(sd=>mesh(rbox(.3,.035,.5,.01),pp,X(7.2),1.99,sd*.6,g));
  /* side-mounted ribbed tubes over the engine bay */
  [-1,1].forEach(sd=>{const tb=mesh(xf(new T.CylinderGeometry(.14,.14,1.6,32),0,0,0,0,0,Math.PI/2),pp,X(6.5),1.9,sd*1.15,g);
    const tp=mesh(xf(new T.CylinderGeometry(.14,.06,.45,32),0,0,0,0,0,Math.PI/2),pp,X(5.47),1.9,sd*1.15,g);
    for(let k=0;k<8;k++)mesh(xf(new T.TorusGeometry(.142,.012,4,14),0,0,0,0,Math.PI/2,0),dk,X(5.8)-k*.2,1.9,sd*1.15,g);});
  /* ---- sides: firing ports with armoured shields and vision blocks, two-part side door, handrails, suspension guards ---- */
  [-1,1].forEach(sd=>{
    [2.05,2.8,3.5,5.5].forEach(n=>{const y=1.58;const b=mesh(new T.SphereGeometry(.06,10,8),dk,X(n),y,sd*(zU(y)+.02),g);
      const sh=onU(sd,n+.04,y+.01,.22,.16,pp,.03);sh.rotation.y=sd*.25;onU(sd,n,1.8,.14,.06,M.glass,.02);});
    /* upper side door between the 2nd and 3rd axles with porthole and handle */
    if(!opts.openDoors){onU(sd,4.1,1.58,.72,.5,pp,.04);onU(sd,4.1,1.58,.64,.42,pp,.05);mesh(new T.CylinderGeometry(.05,.05,.04,24),dk,X(4.2),1.6,sd*(zU(1.6)+.06),g).rotation.x=Math.PI/2-sd*.62;
      mesh(rbox(.14,.025,.03,.006),dk,X(3.85),1.66,sd*(zU(1.66)+.065),g).rotation.x=-sd*.62;
      onL(sd,4.15,.92,.6,.62,pp,.04);}
    else{/* thrown open (an abandoned hull): the doorway black into the dark of the troop compartment, the upper leaf swung
         up and out on its top hinge, the lower leaf folded down on its bottom hinge into a step */
      const DK=memo('btrInside',()=>std({color:C(0x0b0a09),roughness:1,envMapIntensity:.05}));
      onU(sd,4.1,1.58,.72,.5,pp,.04);onU(sd,4.1,1.58,.62,.4,DK,.046);onL(sd,4.15,.92,.6,.62,pp,.04);onL(sd,4.15,.92,.5,.52,DK,.046);
      const leaf=(base,top,w,h,ang)=>{base.visible=false;base.updateMatrix();const pv=new T.Group();pv.position.copy(V3(0,top?h/2:-h/2,0).applyMatrix4(base.matrix));pv.rotation.copy(base.rotation);g.add(pv);
        const lf=new T.Group();lf.rotation.x=ang;pv.add(lf);mesh(rbox(w,h,.035,.008),pp,0,top?-h/2:h/2,0,lf);
        mesh(new T.CylinderGeometry(.05,.05,.04,24),dk,.08,top?-h/2+.02:h/2,sd*.03,lf).rotation.x=Math.PI/2;[-w/2+.08,w/2-.08].forEach(x=>mesh(new T.CylinderGeometry(.022,.022,.09,16),dk,x,0,0,pv).rotation.z=Math.PI/2);return lf;};
      leaf(onU(sd,4.1,1.58,.001,.001,pp,.001),true,.64,.44,-sd*1.78);leaf(onL(sd,4.15,.92,.001,.001,pp,.001),false,.56,.58,sd*1.68);}
    mesh(rbox(.5,.04,.12,.01),dk,X(4.15),.6,sd*1.05,g);
    /* handrails on the upper side */
    [[2.0,3.5],[4.6,5.25]].forEach(([a,b])=>{const y=1.86,zz=sd*(zU(y)+.06);mesh(xf(new T.CylinderGeometry(.012,.012,b-a,6),0,0,0,0,0,Math.PI/2),dk,X((a+b)/2),y,zz,g);
      [a,b].forEach(n=>mesh(new T.CylinderGeometry(.01,.01,.07,5),dk,X(n),y-.03,sd*(zU(y)+.03),g));});
    /* V-shaped bump-stop guards under the chine between axle pairs */
    [2.5,5.55].forEach(n=>{[-1,1].forEach(k=>{const v=mesh(rbox(.05,.42,.05,.01),dk,X(n)+k*.1,1.06,sd*(zL(1.06)+.04),g);v.rotation.z=k*.35;v.rotation.x=sd*.52;});});
    /* mud flaps behind each wheel */
    [1.78,3.2,4.85,6.25].forEach(n=>mesh(rbox(.025,.3,.36,.004),M.tire,X(n)-.62,.86,sd*1.22,g));
    /* number on the upper side */
    const ng=new T.Group();ng.position.set(X(5.05),1.55,sd*(zU(1.55)+.025));ng.rotation.y=sd<0?Math.PI:0;g.add(ng);const nm=new T.Mesh(G('btrNum',()=>new T.PlaneGeometry(.75,.36)),M.num);nm.rotation.x=-.62;ng.add(nm);
    /* rear upper side grille panel */
    onU(sd,6.9,1.6,.7,.28,M.grille,.03);
    /* exhaust outlet on the left rear quarter */
    if(sd<0){onU(sd,6.95,1.42,.6,.16,M.dark,.05);}
  });
  /* ---- rear: tail lights, louvred engine access hatches, water-jet cover, tow hitch ---- */
  {const rx=X(7.62)-.02;[-1,1].forEach(sd=>{mesh(rbox(.05,.09,.2,.01),dk,rx,1.72,sd*.82,g);mesh(new T.PlaneGeometry(.16,.06),std({color:C(0x8a1a10),roughness:.3,emissive:C(0x220000)}),rx-.03,1.72,sd*.82,g,false).rotation.y=-Math.PI/2;
     const ah=mesh(rbox(.04,.34,.62,.01),pp,rx-.01,1.45,sd*.6,g);for(let k=0;k<4;k++)mesh(rbox(.02,.03,.5,.004),M.dark,rx-.035,1.36+k*.06,sd*.6,g,false);});
   mesh(xf(new T.CylinderGeometry(.2,.2,.04,18),0,0,0,0,0,Math.PI/2),pp,rx-.01,.98,0,g);mesh(rbox(.16,.12,.14,.02),dk,rx,.72,0,g);
   mesh(xf(new T.TorusGeometry(.05,.015,6,10),0,0,0,0,0,Math.PI/2),dk,rx-.08,.72,0,g);}
  /* bolt rows along the roof edge and chine */
  {const B=[];const bolt=(x,y,z,rx=0)=>{const b=new T.CylinderGeometry(.013,.013,.012,6);xf(b,x,y,z,rx,0,0);B.push(b);};
   for(let n=1.4;n<=7.2;n+=.22)[-1,1].forEach(sd=>bolt(X(n),roofY(n)+.006,sd*.94));for(let n=1.3;n<=7.2;n+=.3)[-1,1].forEach(sd=>bolt(X(n),1.31,sd*1.44,sd*Math.PI/2));
   const bm=mesh(merge(B),pp,0,0,0,g);bm.castShadow=false;}
  /* deck stowage: tow cable, crowbar and shovel */
  {const cab=[];for(let i=0;i<=30;i++){const t=i/30;cab.push(V3(X(3.75)-t*1.3,roofY(3.75+t*1.3)+.03,-.25+Math.sin(t*Math.PI)*.04));}
   mesh(new T.TubeGeometry(new T.CatmullRomCurve3(cab),60,.017,6,false),dk,0,0,0,g);
   mesh(xf(new T.CylinderGeometry(.016,.016,1.1,6),0,0,0,0,0,Math.PI/2),dk,X(4.4),2.01,.05,g);
   const sh=new T.Group();sh.position.set(X(4.4),2.01,.2);g.add(sh);mesh(xf(new T.CylinderGeometry(.018,.018,.8,6),0,0,0,0,0,Math.PI/2),M.wood,-.15,0,0,sh);mesh(rbox(.24,.012,.18,.005),dk,.36,0,0,sh);}
  /* antenna */
  const ant=mesh(xf(new T.CylinderGeometry(.006,.012,3.2,5),0,1.6,0),M.black,X(5.0),2.03,-.4,g);ant.rotation.z=.12;
  /* ---- BPU-1 turret: faceted cone frustum with a flat roof, KPVT 14.5 mm + PKT, sight, searchlight, smoke launchers ---- */
  const tur=new T.Group();tur.position.set(X(2.95),roofY(2.95)-.01,0);g.add(tur);
  {const tgm=lathe([[.76,0],[.75,.05],[.54,.4],[.5,.42],[.0,.42]],8).toNonIndexed();tgm.rotateY(Math.PI/8);tgm.computeVertexNormals();mesh(tgm,pp,0,0,0,tur);
   mesh(new T.CylinderGeometry(.79,.8,.06,24),pp,0,.0,0,tur);
   mesh(rbox(.24,.28,.4,.04),pp,.6,.16,0,tur);
   mesh(new T.CylinderGeometry(.2,.2,.04,16),pp,-.12,.44,.12,tur);mesh(xf(new T.TorusGeometry(.06,.01,4,10,Math.PI),0,0,0,-Math.PI/2,0,0),dk,-.12,.47,.12,tur);
   mesh(rbox(.18,.14,.16,.02),dk,.3,.48,-.26,tur);mesh(new T.PlaneGeometry(.12,.07),M.glass,.392,.49,-.26,tur,false).rotation.y=Math.PI/2;
   const sl=new T.Group();sl.position.set(.22,.5,.36);tur.add(sl);mesh(xf(new T.CylinderGeometry(.1,.1,.16,32),0,0,0,0,0,Math.PI/2),dk,0,0,0,sl);mesh(new T.CircleGeometry(.085,14),M.glass,.082,0,0,sl,false).rotation.y=Math.PI/2;mesh(rbox(.06,.08,.06,.01),dk,0,-.08,0,sl);
   /* 902V smoke grenade launchers: three tubes per side on a bracket welded to the turret's rear quarter */
   [-1,1].forEach(sd=>{const br=new T.Group();const a0=Math.PI+sd*.75;br.position.set(Math.cos(a0)*.66,.17,Math.sin(a0)*.66);br.rotation.y=-a0;tur.add(br);
     mesh(rbox(.05,.1,.34,.01),dk,-.015,0,0,br);for(let i=0;i<3;i++){const t=mesh(xf(new T.CylinderGeometry(.036,.036,.2,32),0,.1,0),dk,.03,0,(i-1)*.1,br);t.rotation.z=-.75;
       mesh(xf(new T.CylinderGeometry(.03,.03,.005,24),0,.2,0),M.dark,.03,0,(i-1)*.1,br,false).rotation.z=-.75;}});}
  const gun=new T.Group();gun.position.set(.62,.14,.05);tur.add(gun);
  /* the guns: real tubes with real bores. A lathe of the wall's section (outside, the muzzle face, the bore going in)
     along +x from x0 to x1; the bore is open at the muzzle and closed by a dark breech plug a little way in, so looking
     down the barrel you see a hole, not a disc. KPVT 14.5 mm in its jacket with the conical flash hider; PKT 7.62 mm. */
  const bore=(x0,x1,rB,rF,rBore,seg,muz)=>{const L=x1-x0,pts=[[rBore,L-.18],[rBore,L],...(muz?[[muz.r0,L],[muz.r0+.004,L-.004]]:[[rF-.002,L]]),[rF,L-.006],[rF,L*.5],[rB,.004],[rB-.003,0],[rBore,0],[rBore,L-.18]];
    const g=new T.LatheGeometry(pts.slice().reverse().map(p=>new T.Vector2(p[0],p[1])),seg);g.rotateZ(-Math.PI/2);g.translate(x0,0,0);return g;};
  const plug=memo('borePlug',()=>std({color:C(0x050505),roughness:1}));
  mesh(xf(new T.CylinderGeometry(.07,.07,.5,40),.2,0,0,0,0,Math.PI/2),dk,0,0,0,gun);
  mesh(bore(.43,1.24,.042,.036,.0075,40),dk,0,0,0,gun);
  /* the flash hider: a cone opening forward, the bore at its throat */
  {const pts=[[.0075,0],[.0075,.02],[.024,.13],[.046,.13],[.05,.12],[.05,.01],[.044,0],[.0075,0]];const g=new T.LatheGeometry(pts.slice().reverse().map(p=>new T.Vector2(p[0],p[1])),40);g.rotateZ(-Math.PI/2);g.translate(1.235,0,0);mesh(g,dk,0,0,0,gun);}
  mesh(xf(new T.CircleGeometry(.0075,16),1.08,0,0,0,-Math.PI/2,0),plug,0,0,0,gun,false);
  /* the coaxial PKT: its barrel and flash hider, bored */
  mesh(bore(.09,.47,.016,.013,.0039,28),dk,0,-.02,-.18,gun);
  {const pts=[[.0039,0],[.0039,.01],[.0075,.05],[.017,.05],[.018,.045],[.018,.004],[.015,0],[.0039,0]];const g=new T.LatheGeometry(pts.slice().reverse().map(p=>new T.Vector2(p[0],p[1])),28);g.rotateZ(-Math.PI/2);g.translate(.47,0,0);mesh(g,dk,0,-.02,-.18,gun);}
  mesh(xf(new T.CircleGeometry(.0039,12),.33,0,0,0,-Math.PI/2,0),plug,0,-.02,-.18,gun,false);
  /* ---- AAA detail pass ---- */
  {const weld=std({color:C(0x3e4234),roughness:.8,metalness:.3});
   /* weld beads along every longitudinal hull edge and around each section joint (except the open window plate) */
   const W=[];for(const i of [2,3,4,5]){const pts=SECS.map(sc=>V3(sc.x,sc.pts[i][1],sc.pts[i][0]));W.push(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',0),40,.008,4,false));}
   [1,2,5,6].forEach(k=>{const sc=SECS[k];const pts=sc.pts.map(p=>V3(sc.x,p[1],p[0]));pts.push(pts[0].clone());W.push(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',0),48,.007,4,false));});
   mesh(merge(W),weld,0,0,0,g,false);
   /* lifting eyes on the roof corners */
   [[1.45,.85],[1.45,-.85],[7.15,.85],[7.15,-.85]].forEach(([n,zz])=>{mesh(xf(new T.TorusGeometry(.045,.012,6,12),0,0,0,0,Math.PI/2,0),dk,X(n),roofY(n)+.05,zz,g);mesh(rbox(.1,.03,.05,.008),dk,X(n),roofY(n)+.012,zz,g);});
   /* bolt rings round the hatches */
   {const B=[];const ring=(x,y,z,r,n)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2;const b=new T.CylinderGeometry(.011,.011,.012,6);xf(b,x+Math.cos(a)*r,y,z+Math.sin(a)*r);B.push(b);}};
    [-1,1].forEach(sd=>{ring(X(1.62),roofY(1.62)+.045,sd*.45,.24,14);});
    [[2.95,0]].forEach(([n,zz])=>ring(X(n),roofY(n)+.04,zz,.83,30));
    const bm=mesh(merge(B),pp,0,0,0,g);bm.castShadow=false;}
   /* tow cables looped over the nose and along the glacis, held in clamps */
   [-1,1].forEach(sd=>{const pts=[V3(X(.12),1.22,sd*.42),V3(X(.04),1.38,sd*.48),V3(X(.25),1.49,sd*.7),V3(X(.7),1.53,sd*.96),V3(X(1.05),1.48,sd*1.13),V3(X(1.4),1.4,sd*1.3),V3(X(1.9),1.36,sd*1.38),V3(X(2.5),1.35,sd*1.39)];
     mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts),60,.016,6,false),dk,0,0,0,g);
     mesh(xf(new T.TorusGeometry(.045,.016,6,12),0,0,0,0,Math.PI/2,0),dk,X(2.6),1.35,sd*1.39,g);
     [.5,1.2,2.1].forEach(n=>{const p=pts[Math.min(pts.length-1,Math.round(n/2.5*(pts.length-1)))];mesh(rbox(.05,.04,.05,.008),pp,p.x,p.y,p.z,g);});});
   /* central tyre inflation: an air line from every hub up into the hull */
   [1.78,3.2,4.85,6.25].forEach(n=>[-1,1].forEach(sd=>{const a=V3(X(n),.56,sd*1.43),b=V3(X(n)+.18,.86,sd*1.33),c=V3(X(n)+.25,1.22,sd*1.38);
     mesh(new T.TubeGeometry(new T.CatmullRomCurve3([a,b,c]),12,.011,5,false),M.black,0,0,0,g,false);
     mesh(xf(new T.CylinderGeometry(.03,.03,.05,24),0,0,0,Math.PI/2,0,0),dk,X(n),.56,sd*1.46,g,false);}));
   /* grab handles at the rear corners and beside the side door, boarding rungs under the door */
   [-1,1].forEach(sd=>{
     /* grab handles: bar bent out from two welded feet on the upper side plate */
     const upN=V3(0,.62,.785*sd).normalize();
     [[7.2,1.72],[3.62,1.66],[4.62,1.66]].forEach(([n,y])=>{const base=(dn,dy)=>V3(X(n)+dn,y+dy,sd*zU(y+dy));const o=V3(0,.0,sd*.785).normalize().multiplyScalar(.06);
       const pts=[base(-.09,0),base(-.09,0).add(o),base(.09,0).add(o),base(.09,0)];mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts,false,'catmullrom',.2),12,.011,5,false),dk,0,0,0,g);
       [-.09,.09].forEach(dn=>{const f=mesh(rbox(.03,.03,.02,.004),dk,X(n)+dn,y,sd*(zU(y)+.005),g);f.rotation.x=-sd*.62;});});
     /* boarding step welded under the side door */
     {const st=mesh(rbox(.42,.025,.16,.006),dk,X(4.15),.66,sd*(zL(.66)+.07),g);[-1,1].forEach(k=>{const s2=mesh(rbox(.025,.1,.13,.004),dk,X(4.15)+k*.2,.7,sd*(zL(.7)+.055),g);});}
     /* fuel filler caps and the rear tow hooks */
     mesh(new T.CylinderGeometry(.07,.07,.025,32),pp,X(5.0),2.0,sd*.68,g);mesh(rbox(.06,.02,.03,.005),dk,X(4.94),2.015,sd*.68,g);
     mesh(xf(new T.TorusGeometry(.05,.016,6,12),0,0,0,0,Math.PI/2,0),dk,X(7.64),.82,sd*.72,g);mesh(rbox(.1,.08,.12,.01),dk,X(7.58),.82,sd*.72,g);
     /* front fender lips over the first wheels and rear splash guards */
     mesh(rbox(.9,.03,.18,.01),pp,X(1.78),1.18,sd*1.36,g);mesh(rbox(.9,.03,.18,.01),pp,X(6.25),1.18,sd*1.36,g);});
   /* engine ventilation fan cover behind the turret and a spare-parts box on the roof */
   mesh(new T.CylinderGeometry(.2,.24,.1,16),pp,X(3.95),roofY(3.95)+.05,.0,g);mesh(new T.CylinderGeometry(.22,.22,.02,16),dk,X(3.95),roofY(3.95)+.105,0,g);
   for(let i=0;i<8;i++){const a=i/8*Math.PI*2;mesh(rbox(.02,.08,.06,.004),M.dark,X(3.95)+Math.cos(a)*.23,roofY(3.95)+.05,Math.sin(a)*.23,g,false).rotation.y=-a;}
   mesh(rbox(.5,.18,.3,.02),pp,X(4.85),2.06,.1,g);[-1,1].forEach(k=>mesh(rbox(.04,.03,.32,.006),dk,X(4.85)+k*.18,2.15,.1,g));
   /* turret: barrel jacket rings and perforations, side vision blocks, grab rails, aerial base */
   [.35,.5,.65].forEach(px=>mesh(xf(new T.CylinderGeometry(.075,.075,.02,32),px,0,0,0,0,Math.PI/2),dk,0,0,0,gun));
   for(let i=0;i<8;i++)mesh(new T.CylinderGeometry(.012,.012,.01,6),M.dark,.12+i*.05,.07,0,gun,false);
   [-1,1].forEach(sd=>{const vb=mesh(rbox(.12,.08,.1,.01),dk,.15,.3,sd*.6,tur);vb.rotation.x=-sd*.5;mesh(new T.PlaneGeometry(.09,.04),M.glass,.211,.3,sd*.6,tur,false).rotation.y=Math.PI/2;
     const gr=mesh(xf(new T.CylinderGeometry(.012,.012,.5,6),0,0,0,0,0,Math.PI/2),dk,-.15,.36,sd*.63,tur);});
   mesh(new T.CylinderGeometry(.035,.045,.1,24),dk,-.3,.46,-.25,tur);
   const tant=mesh(xf(new T.CylinderGeometry(.005,.01,2.4,5),0,1.2,0),M.black,-.3,.5,-.25,tur);tant.rotation.z=-.1;}
  g.traverse(m=>{if(m.isMesh)m.receiveShadow=true;});
  g.userData.wheels=wheels;g.userData.tur=tur;return g;}

/* wheels: roll with the ground speed, the front two axles steer (Ackermann-ish: the second axle turns 62% as far), and
   each wheel's suspension arm drops into dips and rises over bumps under the hull, through a stiff damped spring */
function btrSpin(spd,dt){btr.userData.wheels.forEach(w=>{if(!w.userData.torn)w.rotation.z-=spd*dt/.56*(w.userData.sd>0?1:-1);});}
const _bw=new T.Vector3();
function btrSteer(delta,dt){btr.userData.wheels.forEach(w=>{const u=w.userData;if(u.torn||!u.steer)return;u.st=damp(u.st||0,delta*u.steer,5,dt);w.rotation.y=u.y0+u.st;});}
function btrSusp(dt,snap){btr.updateMatrixWorld(true);btr.userData.wheels.forEach(w=>{const u=w.userData;if(u.torn)return;
  _bw.set(w.position.x,0,w.position.z);btr.localToWorld(_bw);const d=clamp(H(_bw.x,_bw.z)-_bw.y,-.14,.12);const ty=.56+d;
  if(snap){w.position.y=ty;u.vy=0;return;}const n=Math.max(1,Math.ceil(dt/.008)),h=dt/n;for(let k=0;k<n;k++){u.vy=(u.vy||0)+(320*(ty-w.position.y)-24*(u.vy||0))*h;w.position.y=clamp(w.position.y+u.vy*h,.4,.7);}});}
