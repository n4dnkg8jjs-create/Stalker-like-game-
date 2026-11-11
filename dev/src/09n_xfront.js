/* ---------- the road toward the line: what the fighting has left along the last of it. A BTR burnt out on the
   shoulder with its turret thrown off into the field; the tracks of armour cut across the fields; a shot-through
   road sign; a downed FPV drone in the ditch; helmets and crates where a unit got off the road in a hurry; and at the
   last windbreak an abandoned position - a horseshoe of sandbags facing south-west, the wire strung in front of it,
   the casings in the dirt. No one is here now. (The windbreaks, the craters and the smoke are in 09n_westroad.) ------ */
(function frontRoad(){wxInit();const P=WX.P,SL=P[P.length-1].s,r_=rng(7373),rr=(a,b)=>a+(b-a)*r_();const bk=bucket();
  const at=(f,off)=>{const i=Math.min(P.length-1,Math.max(1,Math.round(f*SL/2))),p=P[i],fr=roadFrame(P,i);return{x:p.x+fr.nx*off,z:p.z+fr.nz*off,y:p.y,yaw:Math.atan2(fr.tx,fr.tz),fr};};
  /* burnt metal: rust coming through where the paint burned off, grey-white ash bloom where it burned hottest, soot
     black round the openings and low down; a little of the green left in the lee of things */
  const burnt=burntPB();
  const charM=std({map:burnt.a,normalMap:burnt.n,roughnessMap:burnt.r,roughness:1,metalness:.4,envMapIntensity:.35,side:T.DoubleSide});
  const sootM=std({map:burnt.a,normalMap:burnt.n,color:C(0x2a2622),roughness:1,metalness:.25,envMapIntensity:.2,side:T.DoubleSide});
  const hidden=new T.MeshBasicMaterial({visible:false});
  const scT=memo('frScorch',()=>tex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,6,w/2,h/2,w/2);g.addColorStop(0,'rgba(14,12,10,.95)');g.addColorStop(.6,'rgba(26,22,18,.55)');g.addColorStop(1,'rgba(26,22,18,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
    const q=rng(77);for(let i=0;i<300;i++){const a=q()*6.28,d=q()*w*.48;c.fillStyle=q()<.3?`rgba(150,146,138,${q()*.3})`:`rgba(10,8,6,${q()*.45})`;c.beginPath();c.arc(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,1+q()*5,0,7);c.fill();}},{clamp:true}));
  const scM=std({map:scT,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3,envMapIntensity:.1});
  const decal=(x,z,sx,sz,ry,m)=>{const g=new T.PlaneGeometry(sx,sz,Math.ceil(sx/1.2),Math.ceil(sz/1.2));g.rotateX(-Math.PI/2);g.rotateY(ry);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=x+p.getX(i),Z=z+p.getZ(i);p.setXYZ(i,X,H(X,Z)+.035,Z);}g.computeVertexNormals();const mm=new T.Mesh(g,m);mm.renderOrder=1;mm.receiveShadow=true;scene.add(mm);return mm;};

  /* ===== the BTR: hit on the move, it ran off onto the shoulder and burned out. The ammunition went up and lifted the
     turret clean off its ring; it lies upside down in the field. The tyres burned off the rims (the steel bead wire is
     still lying round them), the paint is gone to rust and ash, every lamp and vision block is out. ===== */
  {const A=at(.585,WX.hw+1.6),g=buildBTR({openDoors:true});g.updateMatrixWorld(true);
   const tur=g.userData.tur,ring=V3();tur.getWorldPosition(ring);tur.parent.remove(tur);
   const conv=new Map();const swap=m=>{if(!m)return m;if(conv.has(m))return conv.get(m);let r;
     if(m.transparent||m.opacity<1||m===M.glass||m===M.tire)r=hidden;else{const c=m.color||C(0x404040),l=.2126*c.r+.7152*c.g+.0722*c.b;r=l<.035?sootM:charM;}conv.set(m,r);return r;};
   const strip=o=>o.traverse(q=>{if(!q.isMesh)return;if(q.isSkinnedMesh){q.visible=false;return;}q.material=Array.isArray(q.material)?q.material.map(swap):swap(q.material);
     if(!Array.isArray(q.material)&&q.material===hidden)q.visible=false;q.castShadow=true;q.receiveShadow=true;});
   strip(g);strip(tur);
   /* (the whip antennas were snapped off in the blast: anything long and thin on the turret goes) */
   [tur,g].forEach(o=>o.traverse(q=>{if(!q.isMesh||!q.geometry)return;q.geometry.computeBoundingBox();const s3=q.geometry.boundingBox.getSize(V3()).multiply(q.scale);const mx=Math.max(s3.x,s3.y,s3.z),mn=Math.min(s3.x,s3.y,s3.z);if(mx>.9&&mn<.05&&s3.y>s3.x&&s3.y>s3.z)q.visible=false;}));{const lt=[];g.traverse(q=>{if(q.isLight)lt.push(q);});lt.forEach(l=>l.parent.remove(l));}
   /* (two wheels blown off the near side; the rest down on their rims) */
   const W_=g.userData.wheels||[];W_.forEach((w,i)=>{if(i===2||i===4)w.visible=false;});
   /* the hull's inside, seen down through the empty turret ring: burnt out, black */
   {const lb=new T.BoxGeometry(1.5,1.0,1.7);lb.translate(ring.x,ring.y-.52,ring.z);mesh(lb,std({map:burnt.a,color:C(0x3a3430),roughness:1,side:T.BackSide,envMapIntensity:.1}),0,0,0,g,false);
    const rg=new T.TorusGeometry(.79,.035,6,32);rg.rotateX(Math.PI/2);mesh(rg,sootM,ring.x,ring.y+.005,ring.z,g);}
   window.__xbtr=g;const y=H(A.x,A.z);g.position.set(A.x,y-.24,A.z);g.rotation.set(.0,A.yaw+Math.PI/2+.32,.05,'YXZ');scene.add(g);g.updateMatrixWorld(true);
   /* sit it down: every rim on (or a little into) the soft shoulder */
   {const b=new T.Box3().setFromObject(g);let lo=1e9;W_.forEach(w=>{if(!w.visible)return;const v=V3();w.getWorldPosition(v);lo=Math.min(lo,v.y-.31-H(v.x,v.z));});if(lo<1e8)g.position.y-=lo+.05;g.updateMatrixWorld(true);
    solids.push({cx:(b.min.x+b.max.x)/2,cz:(b.min.z+b.max.z)/2,r:3.4});}
   g.traverse(q=>{if(q.isMesh&&q.visible)shootables.push(q);});
   /* the turret, a dozen metres off in the field past the power line, upside down on its roof */
   {const tg=new T.Group();const ox=A.x+A.fr.nx*12.5+A.fr.tx*5,oz=A.z+A.fr.nz*12.5+A.fr.tz*5;tg.position.set(ox,0,oz);tg.rotation.set(Math.PI*.965,rr(0,6.28),0,'YXZ');tur.position.set(0,0,0);tur.rotation.set(0,0,0);tg.add(tur);scene.add(tg);tg.updateMatrixWorld(true);
    const b=new T.Box3();tg.traverse(q=>{if(q.isMesh&&q.visible){q.geometry.computeBoundingBox();b.union(q.geometry.boundingBox.clone().applyMatrix4(q.matrixWorld));}});tg.position.y=H(ox,oz)-(b.min.y)-.12;tg.updateMatrixWorld(true);tg.traverse(q=>{if(q.isMesh&&q.visible)shootables.push(q);});solids.push({cx:ox,cz:oz,r:1.0});
    decal(ox,oz,3.2,3.2,0,scM);
    /* the furrow it ploughed landing */decal(ox-A.fr.nx*2.2,oz-A.fr.nz*2.2,1.3,4.6,Math.atan2(A.fr.nx,A.fr.nz),memo('furrowM',()=>std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0x6a5a48),transparent:true,opacity:.92,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2})));}
   decal(A.x,A.z,9,7,A.yaw,scM);
   /* the bead wire out of the burnt tyres, lying in rings and tangles round where the wheels stand */
   W_.forEach((w,i)=>{const v=V3();w.getWorldPosition(v);for(let k=0;k<2;k++){const tg=new T.TorusGeometry(.5+rr(-.05,.06),.005,4,28);const p=tg.attributes.position;for(let j=0;j<p.count;j++)p.setZ(j,p.getZ(j)+Math.sin(j*.7+k)*.03);
       bk.add(tg,memo('beadW',()=>std({color:C(0x4a3a30),roughness:.6,metalness:.8})),TRS(v.x+rr(-.25,.25),H(v.x,v.z)+.03,v.z+rr(-.25,.25),Math.PI/2+rr(-.1,.1),0,rr(-.1,.1)));}});
   /* the two wheels that came off, one in the ditch, one out in the grass; a hatch lid; panels of the side armour */
   const tg2=G('btrTire',tireGeo);[[4.5,-1.6],[13,4.5]].forEach(([a,b],i)=>{const x=A.x+A.fr.tx*a+A.fr.nx*b,z=A.z+A.fr.tz*a+A.fr.nz*b;const wm=mesh(tg2,[hidden,charM],x,H(x,z)+.17,z,scene);wm.rotation.set(Math.PI/2+rr(-.06,.06),rr(0,6),0);shootables.push(wm);});
   for(let k=0;k<6;k++){const a=rr(0,6.28),d=rr(3,9),x=A.x+Math.cos(a)*d,z=A.z+Math.sin(a)*d;if(wxRoad(x,z).d<WX.hw)continue;const pg=rbox(rr(.3,.9),.012,rr(.25,.6),.004);const p=pg.attributes.position;for(let j=0;j<p.count;j++)p.setY(j,p.getY(j)+Math.sin(p.getX(j)*5)*.03);pg.computeVertexNormals();
     bk.add(pg,k%2?charM:sootM,TRS(x,H(x,z)+.03,z,rr(-.15,.15),rr(0,6),rr(-.15,.15)));}}

  /* ===== tracks: armour has crossed the fields here - two tread-printed ruts, churned and wet, out of the field on one
     side, over the road (the asphalt is scraped) and off across the other ===== */
  {const tread=memo('treadT',()=>tex(128,512,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(5);for(let y=0;y<h;y++){const lk=(y%32)<10;for(let x=0;x<w;x++){const e=Math.min(x,w-1-x)/w;const a=sstep(0,.18,e)*(.75+q()*.25);
        const v=lk?.55:.85;c.fillStyle=`rgba(${(58*v+q()*14)|0},${(48*v+q()*10)|0},${(36*v+q()*8)|0},${a})`;c.fillRect(x,y,1,1);}}
      c.fillStyle='rgba(30,26,22,.35)';for(let y=0;y<h;y+=32)c.fillRect(8,y+10,w-16,3);},{clamp:false}));tread.wrapS=T.ClampToEdgeWrapping;
   const tm=std({map:tread,transparent:true,depthWrite:false,roughness:.85,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,envMapIntensity:.3});
   const run=pts=>{
     for(const side of [-1.32,1.32]){const pos=[],uv=[],idx=[];let L=0;for(let i=0;i<pts.length;i++){const a=pts[Math.max(0,i-1)],b=pts[Math.min(pts.length-1,i+1)];const dx=b[0]-a[0],dz=b[1]-a[1],l=Math.hypot(dx,dz)||1,nx=-dz/l,nz=dx/l;
         if(i)L+=Math.hypot(pts[i][0]-pts[i-1][0],pts[i][1]-pts[i-1][1]);for(const e of [-.3,.3]){const x=pts[i][0]+nx*(side+e),z=pts[i][1]+nz*(side+e);const q=wxRoad(x,z);pos.push(x,(q.d<WX.hw+.2?q.y+wxRel(q.d)+.035:H(x,z)+.03),z);uv.push(e<0?0:1,L/2.2);}
         if(i<pts.length-1){const o=i*2;idx.push(o,o+2,o+1,o+1,o+2,o+3);}}
       const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
       const m=new T.Mesh(g,tm);m.renderOrder=1;m.receiveShadow=true;scene.add(m);}};
   for(const t of wxTracks())run(t.pts);}

  /* ===== the road sign for Lesnoye: the blue sheet on its pipe, shot through by fragments - clean bright holes punched
     in it with rust run down from the older ones - and leaning where something clipped the post ===== */
  {const A=at(.47,WX.hw+1.9);
   /* (the same fragment holes punched through both faces: the back is drawn mirrored, as it is seen from behind) */
   const holes=(c,w,h,front)=>{const q=rng(41);for(let i=0;i<14;i++){const x0=q()*w,y=q()*h,r=1.5+q()*4,old=q()<.5,x=front?x0:w-x0;
       if(old){const g2=c.createLinearGradient(0,y,0,y+30);g2.addColorStop(0,'rgba(120,60,24,.8)');g2.addColorStop(1,'rgba(120,60,24,0)');c.fillStyle=g2;c.fillRect(x-r,y,r*2,30);}
       c.globalCompositeOperation='destination-out';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.globalCompositeOperation='source-over';c.strokeStyle=old?'rgba(110,56,22,.9)':front?'rgba(200,200,200,.9)':'rgba(230,230,226,.9)';c.lineWidth=1.5;c.beginPath();c.arc(x,y,r+1,0,7);c.stroke();}};
   const st=tex(256,128,(c,w,h)=>{c.fillStyle='#1d4f98';c.fillRect(0,0,w,h);c.strokeStyle='#e8ecf0';c.lineWidth=5;c.strokeRect(7,7,w-14,h-14);
       c.fillStyle='#eef1f4';c.font='bold 40px sans-serif';c.textAlign='center';c.fillText('ЛЕСНОЕ',w/2-18,74);c.font='bold 44px sans-serif';c.fillText('4',w-34,76);
       c.beginPath();c.moveTo(24,98);c.lineTo(200,98);c.lineTo(200,90);c.lineTo(222,102);c.lineTo(200,114);c.lineTo(200,106);c.lineTo(24,106);c.closePath();c.fill();
       const q=rng(42);for(let i=0;i<300;i++){c.fillStyle=`rgba(70,60,40,${q()*.18})`;c.fillRect(q()*w,q()*h,2+q()*4,1+q()*3);}holes(c,w,h,true);});
   const sb=tex(256,128,(c,w,h)=>{c.fillStyle='#8c908c';c.fillRect(0,0,w,h);const q=rng(43);for(let i=0;i<500;i++){c.fillStyle=q()<.5?`rgba(60,58,50,${q()*.2})`:`rgba(200,200,196,${q()*.15})`;c.fillRect(q()*w,q()*h,2+q()*6,1+q()*3);}
       c.fillStyle='rgba(110,70,40,.35)';for(let i=0;i<6;i++){const x=q()*w;c.fillRect(x,q()*h*.5,2+q()*3,h);}holes(c,w,h,false);});
   const sg=new T.Group();sg.position.set(A.x,H(A.x,A.z)-.05,A.z);sg.rotation.set(0,A.yaw+Math.PI,0);scene.add(sg);const lean=new T.Group();lean.rotation.set(.16,0,.07);sg.add(lean);
   mesh(new T.CylinderGeometry(.04,.04,2.6,12),GALV(),0,1.3,0,lean);
   const plate=mesh(new T.PlaneGeometry(1.1,.55),std({map:st,alphaTest:.5,roughness:.55,metalness:.3,envMapIntensity:.6}),0,2.25,.05,lean);plate.rotation.y=0;
   const back=mesh(new T.PlaneGeometry(1.1,.55),std({map:sb,alphaTest:.5,roughness:.6,metalness:.5,envMapIntensity:.6}),0,2.25,.045,lean);back.rotation.y=Math.PI;
   [2.08,2.42].forEach(yy=>mesh(rbox(.18,.04,.03,.006),GALV(),0,yy,.02,lean));sg.traverse(q=>{if(q.isMesh)shootables.push(q);});solids.push({cx:A.x,cz:A.z,r:.12});}

  /* ===== a downed FPV drone on the shoulder: carbon X-frame snapped at one arm, four motors with bent props, the battery
     pack in its tape, the antenna, and its charge - a fat green tube taped underneath - still on it. Not touched. ===== */
  {const A=at(.73,-(WX.hw+.75)),d=new T.Group();d.position.set(A.x,H(A.x,A.z)+.03,A.z);d.rotation.set(.12,rr(0,6.28),-.08);scene.add(d);
   const carbon=std({color:C(0x1a1b1d),roughness:.45,metalness:.2}),mot=std({color:C(0x2a2c30),roughness:.35,metalness:.8}),prop=std({color:C(0x1c1c1c),roughness:.5}),tape=std({color:C(0x8a7a2a),roughness:.8}),olive=std({color:C(0x4a5034),roughness:.75});
   [[1,.0],[-1,.5]].forEach(([s,br])=>{const arm=mesh(rbox(.36,.008,.03,.003),carbon,0,.03,0,d);arm.rotation.y=s*Math.PI/4;if(br){arm.scale.x=.62;arm.position.x=-.05;}});
   [[.13,.13],[-.13,.13],[.13,-.13],[-.1,-.07]].forEach(([x,z],i)=>{mesh(new T.CylinderGeometry(.018,.018,.022,14),mot,x,.045,z,d);const pr_=mesh(rbox(.13,.003,.016,.001),prop,x,.06,z,d);pr_.rotation.set(rr(-.4,.4),rr(0,3),rr(-.3,.3));});
   mesh(rbox(.11,.03,.045,.006),tape,0,.06,0,d);mesh(new T.CylinderGeometry(.033,.033,.22,14),olive,0,.002,.02,d).rotation.z=Math.PI/2;
   mesh(new T.CylinderGeometry(.002,.002,.12,5),carbon,-.04,.11,-.03,d).rotation.z=.6;d.traverse(q=>{if(q.isMesh)q.castShadow=q.receiveShadow=true;});}

  /* ===== where a unit got off the road in a hurry, a little before the last windbreak: a helmet in the grass, ammunition
     crates (one burst open, the zinc cans spilled), an empty RPG-26 tube, a torn ration pack, a sleeping mat ===== */
  {const helm=G('helmet6b',()=>{const g=new T.SphereGeometry(.13,24,12,0,Math.PI*2,0,Math.PI*.52);g.scale(1,.85,1.12);const p=g.attributes.position;for(let i=0;i<p.count;i++){if(p.getZ(i)<-.06&&p.getY(i)<.04)p.setY(i,p.getY(i)-.012);}g.computeVertexNormals();return g;});
   const helmM=std({map:PB.canvas.a,normalMap:PB.canvas.n,color:C(0x6a6a48),roughness:.95,side:T.DoubleSide});
   const crateM=M.crate,zinc=std({color:C(0x6a7068),roughness:.5,metalness:.6}),tube=std({color:C(0x4a5236),roughness:.7});
   [[.79,-1,7],[.8,1,9],[.83,-1,6.5]].forEach(([f,sd,off],k)=>{const A=at(f,sd*(WX.hw+off));const y=H(A.x,A.z);
     const h=mesh(helm,helmM,A.x,y+.1,A.z,scene);h.rotation.set(rr(2.6,3.0),rr(0,6),rr(-.2,.2));if(k===1){h.rotation.set(rr(-.2,.2),rr(0,6),1.35);h.position.y=y+.09;}
     const cx=A.x+A.fr.tx*2.2,cz=A.z+A.fr.tz*2.2;const c1=mesh(rbox(.62,.26,.34,.02),crateM,cx,H(cx,cz)+.13,cz,scene);c1.rotation.y=rr(0,6);shootables.push(c1);
     if(k!==1){const lid=mesh(rbox(.62,.03,.34,.01),crateM,cx+.5,H(cx+.5,cz+.3)+.02,cz+.3,scene);lid.rotation.set(0,rr(0,6),.05);
       for(let j=0;j<2;j++){const z1=mesh(rbox(.3,.2,.12,.01),zinc,cx+rr(-.6,.6),H(cx,cz)+.06,cz+rr(-.6,.6),scene);z1.rotation.set(Math.PI/2*(j%2),rr(0,6),0);}}
     const tx_=A.x-A.fr.tx*1.5,tz_=A.z-A.fr.tz*1.5;const tb=mesh(new T.CylinderGeometry(.04,.04,.77,14),tube,tx_,H(tx_,tz_)+.04,tz_,scene);tb.rotation.set(Math.PI/2,rr(0,6),0);tb.rotation.order='YXZ';
     const mt=mesh(new T.CylinderGeometry(.09,.09,.6,16),std({color:C(0x3a4a5a),roughness:.8}),A.x+1.2,H(A.x+1.2,A.z-.8)+.09,A.z-.8,scene);mt.rotation.set(0,rr(0,6),Math.PI/2);mt.rotation.order='YXZ';});}

  /* ===== the abandoned position on one of the last windbreaks, near where the road walk ends: a horseshoe of sandbags facing the line, its corners collapsed
     where they were hit and the sand spilled; the razor wire strung out in front in broken lengths; a crate stack under
     the trees; the ground round it littered with casings ===== */
  {const wb=WX.wb&&WX.wb.find(w=>w.f===.78);if(wb){const pts=wb.pts;const p0=pts[Math.min(pts.length-1,10)],p1=pts[Math.min(pts.length-1,18)];
     const ux=p1.x-p0.x,uz=p1.z-p0.z,ul=Math.hypot(ux,uz)||1,dx=ux/ul,dz=uz/ul;let nx=-dz,nz=dx;if(nx*-.7+nz*-.4<0){nx=-nx;nz=-nz;}/* (n: the side toward the guns, south-west) */
     const cx=p0.x+nx*4,cz=p0.z+nz*4,ry=Math.atan2(-dz,dx);/* (bagWall lays along (cos ry,-sin ry)) */
     const yy=H(cx,cz)-.03;bagWall(null,cx,yy,cz,3.4,ry,.92,2,71);
     [-1,1].forEach(s=>{const x=cx+dx*s*1.55-nx*1.0,z=cz+dz*s*1.55-nz*1.0;bagWall(null,x,H(x,z)-.03,z,1.3,ry+Math.PI/2,s>0?.46:.8,2,72+s);});
     /* (spilled sand from the burst bags) */for(let k=0;k<3;k++){const x=cx+dx*rr(-2,2)+nx*rr(.3,.8),z=cz+dz*rr(-2,2)+nz*rr(.3,.8);const sg=new T.SphereGeometry(.45,12,6,0,Math.PI*2,0,Math.PI/2);sg.scale(1,.28,.7);bk.add(sg,memo('sandM',()=>std({map:PB.mud.a,color:C(0xa89878),roughness:1})),TRS(x,H(x,z)-.04,z,0,rr(0,6),0));}
     /* the wire, fifteen metres out, in lengths with the gaps the shelling cut */
     let s=-24;while(s<26){const L=rr(5,8.5);const x1=cx+dx*s+nx*15,z1=cz+dz*s+nz*15,x2=cx+dx*(s+L)+nx*15,z2=cz+dz*(s+L)+nz*15;const y=Math.min(H(x1,z1),H(x2,z2),H((x1+x2)/2,(z1+z2)/2))-.06;if(wxRoad((x1+x2)/2,(z1+z2)/2).d>WX.hw+3)concertina(x1,z1,x2,z2,y);s+=L+rr(1.5,4.5);}
     crateStack(cx-nx*5+dx*2,cz-nz*5+dz*2,ry+.3,3);{const g=scene.children[scene.children.length-1];if(g&&g.isGroup)g.position.y=H(cx-nx*5+dx*2,cz-nz*5+dz*2)-.02;}
     /* casings: 7.62x39 (lacquered steel) and PK belts' links, in the dirt behind the wall */
     const cas=new T.CylinderGeometry(.0055,.0055,.039,8);const casM=std({color:C(0x5a4a2a),roughness:.5,metalness:.7});for(let k=0;k<70;k++){const x=cx-nx*rr(.4,1.8)+dx*rr(-1.8,1.8),z=cz-nz*rr(.4,1.8)+dz*rr(-1.8,1.8);bk.add(cas,casM,TRS(x,H(x,z)+.005,z,Math.PI/2,rr(0,6.28),rr(-.2,.2)));}
     const flushed=flushBags();if(flushed)fitInstBounds(flushed,[[cx-6,cz-6],[cx+6,cz+6]],3);
     solids.push({cx,cz,r:1.9});}}

  /* ===== the road itself, toward the line: earth thrown across it by the shells that fell beside it, clods and broken
     asphalt scattered over the lanes - more and more of it further on; and where drones caught something on the road, the
     blackened spall star of the hit with the fragments of whatever it was ===== */
  {const q=rng(7474),qq=(a,b)=>a+(b-a)*q();const clodM=std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0x8a7660),roughness:1,envMapIntensity:.1}),asM=std({map:PB.asphalt.a,color:C(0x8a8a86),roughness:.95});
   const onRoad=(x,z)=>{const r=wxRoad(x,z);return r.d<WX.hw-.1?r.y+wxRel(r.d):null;};
   for(let s_=SL*.25;s_<SL-6;s_+=qq(.8,3.2)*lerp(1.6,.45,sstep(.25,.95,s_/SL))){const i=Math.min(P.length-1,Math.round(s_/2)),p=P[i],fr=roadFrame(P,i);const n=1+(q()*4|0);
     for(let k=0;k<n;k++){const d=qq(-WX.hw+.2,WX.hw-.2),x=p.x+fr.nx*d+fr.tx*qq(-1,1),z=p.z+fr.nz*d+fr.tz*qq(-1,1),y=onRoad(x,z);if(y===null)continue;const sc=qq(.03,.14),big=sc>.1;
       bk.add(rockGeo(60+(k%7),{detail:big?2:1,flat:.55}),q()<.8?clodM:asM,TRS(x,y+sc*.18,z,qq(-.3,.3),qq(0,6.28),qq(-.3,.3),sc));}}
   /* drone hits on the road: the spall star, the small crater in the asphalt, fragments */
   const star=memo('spallStar',()=>tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q2=rng(17);const g=c.createRadialGradient(w/2,h/2,4,w/2,h/2,w*.22);g.addColorStop(0,'rgba(10,9,8,.95)');g.addColorStop(1,'rgba(20,18,16,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
       c.strokeStyle='rgba(16,14,12,.75)';for(let i=0;i<70;i++){const a=q2()*6.283,L=w*(.12+q2()*.36);c.lineWidth=.6+q2()*2.2;c.beginPath();c.moveTo(w/2+Math.cos(a)*8,h/2+Math.sin(a)*8);c.lineTo(w/2+Math.cos(a)*L,h/2+Math.sin(a)*L);c.stroke();}
       for(let i=0;i<160;i++){const a=q2()*6.283,r=w*q2()*.45;c.fillStyle=`rgba(12,10,8,${.25+q2()*.5})`;c.beginPath();c.arc(w/2+Math.cos(a)*r,h/2+Math.sin(a)*r,.8+q2()*1.8,0,7);c.fill();}},{clamp:true}));
   const starM=std({map:star,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,envMapIntensity:.1});
   [.52,.63,.74,.83,.9].forEach((f,k)=>{const off=qq(-1.5,1.5),A=at(f,off);const y=onRoad(A.x,A.z);if(y===null)return;
     const g=new T.PlaneGeometry(3.4,3.4,6,6);g.rotateX(-Math.PI/2);g.rotateY(q()*6);const Pp=g.attributes.position;for(let i=0;i<Pp.count;i++){const X=A.x+Pp.getX(i),Z=A.z+Pp.getZ(i),yy=onRoad(X,Z);Pp.setXYZ(i,X,(yy===null?H(X,Z):yy)+.02,Z);}g.computeVertexNormals();
     const m=new T.Mesh(g,starM);m.renderOrder=2;scene.add(m);
     for(let j=0;j<14;j++){const a=qq(0,6.28),r=qq(.2,2.6),x=A.x+Math.cos(a)*r,z=A.z+Math.sin(a)*r,yy=onRoad(x,z);const sc=qq(.03,.1);bk.add(rbox(sc*2,sc*.4,sc*1.4,.004),j%3?asM:charM,TRS(x,(yy===null?H(x,z):yy)+sc*.2,z,qq(-.3,.3),qq(0,6),qq(-.3,.3)));}
     /* the shallow pit punched in the asphalt */const pit=new T.CircleGeometry(.32,18);pit.rotateX(-Math.PI/2);mesh(pit,memo('pitM',()=>std({color:C(0x161412),roughness:1,polygonOffset:true,polygonOffsetFactor:-5})),A.x,y+.025,A.z,scene,false);});}

  /* ===== where someone died: by the verge a cross knocked together from two pieces of birch and wire, a helmet hung on
     it, a few plastic flowers gone pale, a candle in a jar. No name on it. ===== */
  {const A=at(.705,WX.hw+3.4);const g=new T.Group();g.position.set(A.x,H(A.x,A.z)-.08,A.z);g.rotation.y=A.yaw+Math.PI*.5+.2;scene.add(g);const bm=std({map:TX.birch,color:C(0xe0dcd2),roughness:.85});
   const up=new T.CylinderGeometry(.035,.04,1.45,12);up.translate(0,.72,0);mesh(up,bm,0,0,0,g);const cb=new T.CylinderGeometry(.03,.03,.62,12);cb.rotateZ(Math.PI/2);mesh(cb,bm,0,1.1,0,g);
   const sl=new T.CylinderGeometry(.02,.02,.32,10);sl.rotateZ(Math.PI/2+.4);mesh(sl,bm,0,.55,0,g);
   const wr=new T.TorusGeometry(.045,.003,6,16);mesh(wr,memo('wireM',()=>std({color:C(0x5a5048),metalness:.7,roughness:.5})),0,1.1,.035,g);
   const helm=G('helmet6b');if(helm){const hm=mesh(helm,std({map:PB.canvas.a,normalMap:PB.canvas.n,color:C(0x5a5a3e),roughness:.95,side:T.DoubleSide}),0,1.47,.0,g);hm.rotation.set(-.1,0,0);}
   [[.16,.06],[-.12,.1],[.04,.16]].forEach(([x,z],k)=>{const st=new T.CylinderGeometry(.003,.003,.28,5);st.translate(0,.14,0);mesh(st,memo('stemP',()=>std({color:C(0x4a6a3a),roughness:.7})),x,0,z,g).rotation.z=(k-1)*.2;
     const fl=new T.SphereGeometry(.03,8,6);fl.scale(1,.6,1);mesh(fl,std({color:C([0xc8a0a0,0xd8d0c0,0xb8a0c0][k]),roughness:.6}),x-Math.sin((k-1)*.2)*.28,.28,z,g);});
   const jar=lathe([[0,0],[.035,0],[.04,.01],[.04,.09],[.03,.1],[.03,.11]],16);mesh(jar,std({color:C(0xc0d0c8),roughness:.1,transparent:true,opacity:.5,depthWrite:false}),.1,0,-.08,g,false);
   mesh(new T.CylinderGeometry(.025,.025,.05,12),std({color:C(0xd8c8a8),roughness:.9}),.1,.03,-.08,g);solids.push({cx:A.x,cz:A.z,r:.15});}

  bk.flush(scene,true);
  window.__front={ok:1};})();
