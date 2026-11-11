/* ---------- the walk west through the forest: what is in these woods. The old exclusion fence, fallen in where you
   cross it; a stand of red pines that took the fallout in '86 and still tick on the dosimeter; trees the wind tore out
   by the roots; ant hills and fly agarics; ferns; a war memorial from '41 in its own small clearing, the fence round it
   unpainted for decades. Shafts of sun through the canopy; crows that go up from a dead tree as you come; a cuckoo, a
   woodpecker, and the artillery somewhere past the river. Morozov has a word for some of it. ---------- */
const FW={shafts:[],crows:null,t:{cuckoo:14,wood:30,art:55,crk:20},said:{},art0:false};
(function forestWalk(){const r_=rng(6060),rr=(a,b)=>a+(b-a)*r_();const bk=bucket();
  /* room for what is put down: the trees the forest planted there are taken out (and their trunks' collision) */
  const clearVeg=(x,z,r)=>{for(const t of VEG.types){const P=t.P,M=t.M,Cc=t.C;const keep=[];for(let i=0;i<P.length/2;i++)if(Math.hypot(P[i*2]-x,P[i*2+1]-z)>=r)keep.push(i);
      if(keep.length===P.length/2)continue;const nP=[],nM=[],nC=[];keep.forEach(i=>{nP.push(P[i*2],P[i*2+1]);for(let k=0;k<16;k++)nM.push(M[i*16+k]);nC.push(Cc[i*3],Cc[i*3+1],Cc[i*3+2]);});
      t.P.length=0;t.P.push(...nP);t.M.length=0;t.M.push(...nM);t.C.length=0;t.C.push(...nC);}
    for(let i=solids.length-1;i>=0;i--){const s=solids[i];if(s.r!==undefined&&s.r<1&&Math.hypot(s.cx-x,s.cz-z)<r)solids.splice(i,1);}};
  const pathZ=x=>{const P=ROUTE3;for(let i=0;i<P.length-1;i++){const a=P[i],b=P[i+1];if(x<=a[0]&&x>=b[0]){const t=(x-a[0])/(b[0]-a[0]);return lerp(a[1],b[1],t);}}return -392;};
  const inClear=(x,z)=>Math.hypot(x-W3.clear.x,z-W3.clear.z)<W3.clear.r+1;

  /* ===== the exclusion fence: concrete posts, three strands of barbed wire, fallen flat where the path crosses ===== */
  {const X0=-331,posts=[],wires=[];const pz=pathZ(X0);const cm=std({map:PB.precast.a,normalMap:PB.precast.n,color:C(0x8a867c),roughness:1,envMapIntensity:.25});
   for(let z=pz-40;z<=pz+40;z+=3.2){const x=X0+Math.sin(z*.13)*.8+rr(-.15,.15);const down=Math.abs(z-pz)<5.5;const lean=down?rr(.9,1.35)*(r_()<.5?-1:1):rr(-.12,.12);
     const y=H(x,z);clearVeg(x,z,.9);const M4=TRS(x,y-.25,z,lean*.7,rr(-.2,.2),lean*.3);const g=rbox(.12,1.85,.12,.015);g.translate(0,.92,0);bk.add(g,cm,M4);
     posts.push({x,z,y,lean,down,M4});if(!down)solids.push({cx:x,cz:z,r:.12});}
   const wire=[];for(let i=0;i<posts.length-1;i++){const a=posts[i],b=posts[i+1];if(a.down||b.down)continue;if(r_()<.12)continue;wireSolids(a.x,a.z,b.x,b.z);
     [.5,.95,1.4].forEach((hh,k)=>{if(r_()<.1)return;const A=V3(0,hh,0).applyMatrix4(a.M4),B=V3(0,hh,0).applyMatrix4(b.M4);const n=8;let prev=A;
       for(let s=1;s<=n;s++){const u=s/n,q=A.clone().lerp(B,u);q.y-=Math.sin(u*Math.PI)*(.08+k*.03);wire.push(prev.x,prev.y,prev.z,q.x,q.y,q.z);
         const m_=prev.clone().lerp(q,.5);wire.push(m_.x-.03,m_.y-.025,m_.z,m_.x+.03,m_.y+.025,m_.z,m_.x,m_.y-.025,m_.z-.03,m_.x,m_.y+.025,m_.z+.03);prev=q;}});}
   /* by the gap: a coil of wire lying in the grass where someone dragged it aside */
   for(let k=0;k<3;k++){const cx=X0+rr(-1.5,1.5),cz=pz+(k-1)*2.2+rr(-.5,.5);let prev=null;for(let i=0;i<=60;i++){const a=i/60*Math.PI*2*3,q=V3(cx+Math.cos(a)*.38+i*.012,H(cx,cz)+.32+Math.sin(a)*.3,cz+Math.sin(a*.5)*.1);if(prev)wire.push(prev.x,prev.y,prev.z,q.x,q.y,q.z);prev=q;}}
   const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wire,3));scene.add(new T.LineSegments(wg,new T.LineBasicMaterial({color:C(0x3a2f26)})));
   /* the sign on the last post standing before the gap, hanging off one bolt */
   const sp=posts.filter(p=>!p.down&&p.z<pz).pop()||posts[0];
   const st=tex(512,320,(c,w,h)=>{c.fillStyle='#d6b42a';c.fillRect(0,0,w,h);c.strokeStyle='#14120c';c.lineWidth=12;c.strokeRect(9,9,w-18,h-18);c.fillStyle='#14120c';const cx=95,cy=110,R0=70;
     c.beginPath();c.arc(cx,cy,R0*.2,0,7);c.fill();for(let k=0;k<3;k++){const a=-Math.PI/2+k*2.094;c.beginPath();c.arc(cx,cy,R0,a-.52,a+.52);c.arc(cx,cy,R0*.3,a+.52,a-.52,true);c.fill();}
     c.textAlign='center';c.fillStyle='#14120c';fitLine(c,'ЗОНА',340,90,280,56,'bold');fitLine(c,'ОТЧУЖДЕНИЯ',340,150,290,44,'bold');c.fillStyle='#a8160f';fitLine(c,'ПРОХОД ЗАПРЕЩЁН',w/2,232,470,38,'bold');
     c.fillStyle='#14120c';fitLine(c,'Министерство здравоохранения СССР · 1987',w/2,288,460,18,'');
     const q=rng(71);for(let i=0;i<16;i++){const x0=q()*w,y0=q()*h;const gr=c.createLinearGradient(x0,y0,x0,y0+80+q()*120);gr.addColorStop(0,'rgba(110,52,18,.65)');gr.addColorStop(1,'rgba(110,52,18,0)');c.fillStyle=gr;c.fillRect(x0,y0,3+q()*6,200);}
     for(let i=0;i<260;i++){c.fillStyle=`rgba(${q()<.5?'84,74,54':'60,38,20'},${.25+q()*.5})`;c.beginPath();c.arc(q()*w,q()*h,q()*5+1,0,7);c.fill();}});
   const sg=new T.Group();sg.position.copy(V3(0,1.5,0).applyMatrix4(sp.M4));sg.rotation.set(.04,Math.PI/2+.06,.24);scene.add(sg);
   mesh(rbox(.82,.52,.012,.006),WM.rust,-.37,-.23,.075,sg);mesh(new T.PlaneGeometry(.8,.5),std({map:st,roughness:.75,metalness:.2,polygonOffset:true,polygonOffsetFactor:-2}),-.37,-.23,.0825,sg,false);
   mesh(new T.CylinderGeometry(.014,.014,.1,10),WM.rust,0,0,.06,sg).rotation.x=Math.PI/2;sg.traverse(q=>{if(q.isMesh){q.castShadow=true;shootables.push(q);}});
   FW.fence=X0;}

  /* ===== the red pines: a stand of Scots pine south of the path that died standing; needles rust-red, bark black ===== */
  {const cx=REDPINE.x,cz=REDPINE.z,R0=REDPINE.r;FW.red=REDPINE;hotspots.push({x:cx,z:cz,r:R0+6,uSv:6.5});
   clearVeg(cx,cz,R0*.8);const L=speciesTypes(scotsGeo,woodMat.bark,MS,TX.tuft),Ld=speciesTypes(deadGeo,woodMat.dead,null,null);
   const col=new T.Color();
   for(let i=0;i<26;i++){const a=rr(0,6.28),d=Math.sqrt(r_())*R0,x=cx+Math.cos(a)*d,z=cz+Math.sin(a)*d;if(Math.abs(z-pathZ(x))<3.5)continue;
     if(r_()<.28){const t=Ld[r_()*Ld.length|0],s=rr(.9,1.3);vegPut(t,x,H(x,z)-.15,z,rr(0,6.28),s,s*rr(.9,1.1),null,null);solids.push({cx:x,cz:z,r:.2*s});continue;}
     const t=L[r_()*L.length|0],s=rr(.75,1.1);col.setRGB(rr(4.2,5),rr(1.1,1.4),rr(.34,.46));vegPut(t,x,H(x,z)-.15,z,rr(0,6.28),s,s*rr(.9,1.1),col,[rr(-.03,.03),rr(-.03,.03)]);solids.push({cx:x,cz:z,r:.3*s});}
   /* their needles, fallen thick and rust-coloured on the ground under them */
   const nt=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(5);for(let i=0;i<2600;i++){const x=q()*w,y=q()*h,a=q()*6.28,l=4+q()*9;const d=Math.hypot(x-w/2,y-h/2)/(w/2);if(q()>1.15-d)continue;
       c.strokeStyle=`rgba(${120+q()*50|0},${52+q()*30|0},${22+q()*16|0},${.55+q()*.4})`;c.lineWidth=1.2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}},{clamp:true});
   const nm=std({map:nt,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,envMapIntensity:.15});
   for(let k=0;k<9;k++){const x=cx+rr(-R0,R0)*.8,z=cz+rr(-R0,R0)*.8,R=rr(4,7);const g=new T.PlaneGeometry(R*2,R*2,10,10);g.rotateX(-Math.PI/2);const p=g.attributes.position;
     for(let i=0;i<p.count;i++){const X=x+p.getX(i),Z=z+p.getZ(i);p.setXYZ(i,X,H(X,Z)+.025,Z);}g.computeVertexNormals();const m=new T.Mesh(g,nm);m.receiveShadow=true;m.renderOrder=2;scene.add(m);}}

  /* the dead pine the crows sit in, by the path */
  {const x=-372,z=-382;clearVeg(x,z,2.5);const t=speciesTypes(deadGeo,woodMat.dead,null,null)[0];vegPut(t,x,H(x,z)-.15,z,1.1,1.35,1.4,null,null);solids.push({cx:x,cz:z,r:.3});}
  /* ===== windthrow: two trees the wind tore out by the roots - the trunk down, the root plate stood on edge with
     the earth still in it, the pit it came out of ===== */
  const soil=std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0xa08a70),roughness:1,envMapIntensity:.2}),rootM=std({map:TX.bark,color:C(0x5a4a3a),roughness:1});
  const pitT=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const q=rng(919);
    /* torn earth: dark loam with lighter sandy subsoil turned up, root threads, a ragged edge that breaks into clumps */
    for(let i=0;i<5200;i++){const a=q()*6.283,rd=Math.sqrt(q())*w*.5*(1+.12*Math.sin(a*5+1)+.08*Math.sin(a*11));const x=w/2+Math.cos(a)*rd,y=h/2+Math.sin(a)*rd;const e=rd/(w*.5);if(e>.93&&q()<.6)continue;
      const k=q();c.fillStyle=k<.55?`rgba(${46+q()*20|0},${36+q()*14|0},${26+q()*10|0},1)`:k<.85?`rgba(${70+q()*24|0},${56+q()*18|0},${38+q()*12|0},1)`:`rgba(${120+q()*30|0},${100+q()*24|0},${66+q()*16|0},1)`;
      c.beginPath();c.arc(x,y,2+q()*4.5*(1-e*.5),0,7);c.fill();}
    c.strokeStyle='rgba(70,50,34,.9)';c.lineWidth=1.2;for(let i=0;i<40;i++){const a=q()*6.283,r0=q()*w*.3;c.beginPath();c.moveTo(w/2+Math.cos(a)*r0,h/2+Math.sin(a)*r0);c.quadraticCurveTo(w/2+Math.cos(a+.3)*(r0+20),h/2+Math.sin(a+.3)*(r0+20),w/2+Math.cos(a)*(r0+30+q()*30),h/2+Math.sin(a)*(r0+30+q()*30));c.stroke();}},{clamp:true});
  const PITM=std({map:pitT,alphaTest:.5,roughness:1,envMapIntensity:.15,polygonOffset:true,polygonOffsetFactor:-2});PITM.defines.DRY_MATTE='';
  [[-347,-376,.5],[-429,-384.5,2.6]].forEach(([x,z,yaw])=>{clearVeg(x,z,5);const y=H(x,z);const dx=Math.sin(yaw),dz=Math.cos(yaw);
    /* the root plate */
    const rp=new T.CylinderGeometry(1.45,1.3,.42,26,2);{const q=rp.attributes.position;for(let i=0;i<q.count;i++){const a=Math.atan2(q.getZ(i),q.getX(i)),rad=Math.hypot(q.getX(i),q.getZ(i));const k=1+.18*Math.sin(a*3+1)+.1*Math.sin(a*7);q.setX(i,q.getX(i)*k);q.setZ(i,q.getZ(i)*k);q.setY(i,q.getY(i)+(n3(q.getX(i)*2,q.getY(i)*2,q.getZ(i)*2)-.5)*.25*(rad>.5?1:0));}rp.computeVertexNormals();}
    const RM=TRS(x,y+1.15,z,Math.PI/2-.12,yaw,0);bk.add(rp,soil,RM);
    for(let i=0;i<16;i++){const a=rr(0,6.28),ln=rr(.6,1.6);const st_=V3(Math.cos(a)*rr(.9,1.4),rr(-.2,.25),Math.sin(a)*rr(.9,1.4));const en=st_.clone().multiplyScalar(1+ln).add(V3(0,rr(-.4,.4),0));
      const pts=[st_,st_.clone().lerp(en,.5).add(V3(rr(-.15,.15),rr(-.15,.15),rr(-.15,.15))),en].map(v=>v.applyMatrix4(RM));bk.add(new T.TubeGeometry(new T.CatmullRomCurve3(pts),8,rr(.02,.06),6,false),rootM);}
    /* the trunk, lying away from the plate */
    const A=V3(x+dx*.25,y+1.0,z+dz*.25),B=V3(x+dx*13,H(x+dx*13,z+dz*13)+.3,z+dz*13);putLogAB(bk,.3,A,B,WM.bark);
    for(let k=0;k<5;k++){const t=rr(.35,.95),bl=rr(.6,1.8);const p0=A.clone().lerp(B,t);const br=new T.CylinderGeometry(.02,.06,bl,8);br.translate(0,bl/2,0);bk.add(br,WM.bark,TRS(p0.x,p0.y,p0.z,rr(.6,1.5),rr(0,6.28),0));}
    for(let k=0;k<=8;k++){const p0=A.clone().lerp(B,k/8);solids.push({cx:p0.x,cz:p0.z,r:.38});}solids.push({cx:x,cz:z,r:1.4});
    /* the pit */
    /* (the pit can't be dug into the ground mesh, which is built before this; instead a patch of torn-up earth lies over the
       grass where the plate came out, its edge ragged, with clods thrown round it) */
    {const g=new T.CircleGeometry(1.75,40,0,6.2832);g.rotateX(-Math.PI/2);const q=g.attributes.position,uv=g.attributes.uv;for(let i=0;i<q.count;i++){const X=x-dx*1.1+q.getX(i),Z=z-dz*1.1+q.getZ(i);q.setXYZ(i,X,H(X,Z)+.035,Z);}g.computeVertexNormals();
     const m=new T.Mesh(g,PITM);m.receiveShadow=true;m.renderOrder=1;scene.add(m);
     for(let k=0;k<14;k++){const a=rr(0,6.28),d=rr(.6,2.1);const X=x-dx*1.1+Math.cos(a)*d,Z=z-dz*1.1+Math.sin(a)*d;const c=new T.IcosahedronGeometry(rr(.05,.13),1);bk.add(c,soil,TRS(X,H(X,Z)+.03,Z,rr(0,3),rr(0,3),0));}}});

  /* ===== ant hills: domes of needles and twigs at the foot of the pines ===== */
  const needleT=tex(256,256,(c,w,h)=>{c.fillStyle='#6e5640';c.fillRect(0,0,w,h);const q=rng(33);for(let i=0;i<3200;i++){const x=q()*w,y=q()*h,a=q()*6.28,l=3+q()*7;const k=q();
      c.strokeStyle=k<.45?`rgba(${150+q()*40|0},${112+q()*30|0},${70+q()*20|0},.9)`:k<.8?`rgba(${70+q()*20|0},${52+q()*14|0},${36+q()*10|0},.9)`:`rgba(${120+q()*30|0},${84+q()*20|0},${40+q()*14|0},.9)`;
      c.lineWidth=1.3;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}},{rep:[3,2]});
  const needle=std({map:needleT,roughness:1,envMapIntensity:.25});
  [[-364,-383],[-341,-399],[-456,-380],[-452,-404],[-318,-404]].forEach(([x,z],k)=>{const s=rr(.6,1),y=H(x,z);
    const g=lathe([[.95,0],[.86,.08],[.72,.28],[.5,.52],[.25,.68],[0,.72]],28);const q=g.attributes.position;for(let i=0;i<q.count;i++){const X=q.getX(i),Y=q.getY(i),Z=q.getZ(i);const n=n3(X*9+k,Y*9,Z*9);q.setXYZ(i,X*(1+(n-.5)*.12),Y*(1+(n-.5)*.2),Z*(1+(n-.5)*.12));}g.computeVertexNormals();
    bk.add(g,needle,TRS(x,y-.05,z,0,rr(0,6),0,s));for(let i=0;i<14;i++){const a=rr(0,6.28),d=rr(.1,.8)*s;bk.add(new T.CylinderGeometry(.006,.008,rr(.1,.25),4),WM.bark,TRS(x+Math.cos(a)*d,y+.7*s*(1-d/s/.95)*.95,z+Math.sin(a)*d,rr(.8,1.6),rr(0,6),0));}
    solids.push({cx:x,cz:z,r:.8*s});});

  /* ===== fly agarics in rings under the birches ===== */
  {const capT=tex(128,128,(c,w,h)=>{c.fillStyle='#b8261a';c.fillRect(0,0,w,h);const q=rng(9);const g=c.createRadialGradient(w/2,h/2,4,w/2,h/2,w/2);g.addColorStop(0,'rgba(120,20,10,.5)');g.addColorStop(1,'rgba(240,120,40,.35)');c.fillStyle=g;c.fillRect(0,0,w,h);
      for(let i=0;i<40;i++){c.fillStyle=`rgba(240,236,220,${.7+q()*.3})`;c.beginPath();c.arc(q()*w,q()*h,2+q()*4,0,7);c.fill();}});
   const capM=std({map:capT,roughness:.45,envMapIntensity:.4}),stemM=std({color:C(0xe6e0cc),roughness:.7});
   const capG=lathe([[0,.012],[.06,.01],[.07,.012],[.068,.025],[.055,.045],[.03,.058],[0,.06]],20),stemG=lathe([[0,0],[.016,0],[.014,.02],[.012,.05],[.014,.06],[0,.06]],12);
   {const q=capG.attributes.position,uv=capG.attributes.uv;for(let i=0;i<q.count;i++)uv.setXY(i,q.getX(i)*6+.5,q.getZ(i)*6+.5);}
   [[-345,-386,7],[-379,-401,5],[-424,-397,6],[-463,-389,4]].forEach(([x,z,n])=>{for(let i=0;i<n;i++){const a=i/n*6.28+rr(-.3,.3),d=rr(.4,1.3),X=x+Math.cos(a)*d,Z=z+Math.sin(a)*d,s=rr(.8,1.6),y=H(X,Z);
      bk.add(stemG,stemM,TRS(X,y-.005,Z,rr(-.1,.1),0,rr(-.1,.1),s));bk.add(capG,capM,TRS(X,y+.05*s,Z,rr(-.15,.15),rr(0,6),rr(-.15,.15),s));}});}

  /* ===== the memorial: a mass grave from 1941 in a little clearing off the path - a stepped plinth, the obelisk with
     its star, the plaque, a low iron fence once painted blue, a faded wreath ===== */
  {const x=-447,z=-405,yaw=-.25;clearVeg(x,z,6.5);const y=Math.min(H(x,z),H(x+1.5,z),H(x-1.5,z),H(x,z+1.5),H(x,z-1.5));const g=new T.Group();g.position.set(x,y,z);g.rotation.y=yaw;scene.add(g);
   const pc=std({map:PB.precast.a,normalMap:PB.precast.n,color:C(0xc8c2b4),roughness:1,envMapIntensity:.3}),pc2=std({map:PB.precast.a,normalMap:PB.precast.n,color:C(0x9d988c),roughness:1,envMapIntensity:.3});
   mesh(rbox(2.4,.25,2.4,.03),pc2,0,.08,0,g);mesh(rbox(1.7,.3,1.7,.03),pc,0,.35,0,g);
   const ob=rbox(.62,3.1,.62,.02);{const q=ob.attributes.position;for(let i=0;i<q.count;i++){const t=(q.getY(i)+1.55)/3.1,k=lerp(1,.55,t);q.setX(i,q.getX(i)*k);q.setZ(i,q.getZ(i)*k);}ob.computeVertexNormals();}
   mesh(ob,pc,0,2.05,0,g);
   const star=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.075:.19;if(i)star.lineTo(Math.cos(a)*r,Math.sin(a)*r);else star.moveTo(Math.cos(a)*r,Math.sin(a)*r);}
   const sg=new T.ExtrudeGeometry(star,{depth:.04,bevelEnabled:true,bevelThickness:.012,bevelSize:.01,bevelSegments:2});sg.translate(0,0,-.02);
   mesh(sg,std({color:C(0x7a1a14),roughness:.55,metalness:.3}),0,3.82,0,g);
   const pl=tex(512,384,(c,w,h)=>{c.fillStyle='#3a3a36';c.fillRect(0,0,w,h);c.strokeStyle='#b8a56a';c.lineWidth=6;c.strokeRect(14,14,w-28,h-28);c.fillStyle='#d2c08a';c.textAlign='center';
     fitLine(c,'ВЕЧНАЯ СЛАВА',w/2,92,440,48,'bold');fitLine(c,'ГЕРОЯМ, ПАВШИМ',w/2,150,440,34,'bold');fitLine(c,'В БОЯХ ЗА РОДИНУ',w/2,196,440,34,'bold');fitLine(c,'1941 — 1945',w/2,276,440,46,'bold');
     fitLine(c,'Здесь похоронены 37 бойцов 141-й стрелковой дивизии',w/2,334,450,17,'');const q=rng(8);for(let i=0;i<160;i++){c.fillStyle=`rgba(${q()<.5?'90,96,70':'40,40,36'},${q()*.4})`;c.beginPath();c.arc(q()*w,q()*h,q()*6+1,0,7);c.fill();}});
   const pm=mesh(new T.PlaneGeometry(.5,.38),std({map:pl,roughness:.5,metalness:.4,polygonOffset:true,polygonOffsetFactor:-2}),0,1.25,.296,g,false);pm.rotation.x=-.06;
   /* the fence: pickets with pointed tops on two rails, faded blue paint flaking to rust; the gate hanging */
   const blue=std({map:PB.rust.a,color:C(0x8aa4b4),roughness:.7,metalness:.35}),pk=new T.CylinderGeometry(.012,.012,.62,8);pk.translate(0,.31,0);const tip=new T.ConeGeometry(.022,.07,4);tip.translate(0,.655,0);
   const S=1.85,G0=.36,G1=.62;for(const [ax,az,lx,lz] of [[-1,-1,1,0],[1,-1,0,1],[1,1,-1,0],[-1,1,0,-1]]){const front=az===1&&lx===-1,n=12;for(let i=0;i<n;i++){const t=i/n;const px=ax*S+lx*t*2*S,pz=az*S+lz*t*2*S;if(front&&t>G0&&t<G1)continue;
       const lean=rr(-.06,.06);const M4=TRS(px,0,pz,lean,0,rr(-.05,.05));mesh(pk.clone().applyMatrix4(M4),blue,0,0,0,g);mesh(tip.clone().applyMatrix4(M4),blue,0,0,0,g);}
     (front?[[0,G0],[G1,1]]:[[0,1]]).forEach(([t0,t1])=>[.18,.5].forEach(hh=>{const L=2*S*(t1-t0),tm=(t0+t1)/2,m=mesh(new T.BoxGeometry(L,.03,.012),blue,ax*S+lx*tm*2*S,hh,az*S+lz*tm*2*S,g);m.rotation.y=lx?0:Math.PI/2;}));}
   /* the gate, hinged at the post by the gap and standing open */
   {const gw=2*S*(G1-G0)-.06,hx=S-2*S*G0,gt=new T.Group();gt.position.set(hx,0,S);gt.rotation.y=1.25;g.add(gt);
    for(let i=0;i<4;i++){const x=-(.04+i*(gw-.08)/3);mesh(pk.clone(),blue,x,.02,0,gt);mesh(tip.clone(),blue,x,.02,0,gt);}
    [.2,.52].forEach(hh=>mesh(new T.BoxGeometry(gw,.03,.012),blue,-gw/2,hh,0,gt));}
   /* the wreath of faded plastic flowers against the plinth */
   {const wg=new T.TorusGeometry(.19,.05,10,28);const wm=std({color:C(0x4a5a3a),roughness:.85});const w=mesh(wg,wm,.25,.205+.235,.93,g);w.rotation.set(-.12,.1,0);
    const fl=std({color:C(0xa86a6a),roughness:.7});for(let i=0;i<9;i++){const a=i/9*6.28+.3;mesh(new T.SphereGeometry(.036,10,8),fl,Math.cos(a)*.19,Math.sin(a)*.19,.035,w);}
    const rb=mesh(new T.PlaneGeometry(.05,.24),std({color:C(0x8a3a30),roughness:.8,side:T.DoubleSide}),.04,-.27,.02,w);rb.rotation.z=.2;
    /* two carnations laid on the top step */
    for(let k=0;k<2;k++){const st_=mesh(new T.CylinderGeometry(.004,.004,.32,6),std({color:C(0x4a5a30),roughness:.8}),-.3+k*.09,.505,.62,g);st_.rotation.set(Math.PI/2,0,.3-k*.5);
     const hd=mesh(new T.SphereGeometry(.03,10,8),fl,-.3+k*.09+Math.sin(.3-k*.5)*-.16,.52,.62+.16,g);hd.scale.set(1,.8,1);}}
   g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;shootables.push(q);}});solids.push({cx:x,cz:z,r:1.05});FW.mem=V3(x,y,z);}

  /* ===== ferns over the forest floor either side of the path ===== */
  {const fr=[];for(let k=0;k<7;k++){const g=new T.PlaneGeometry(.2,.7,1,5);g.translate(0,.35,0);const p=g.attributes.position;for(let i=0;i<p.count;i++){const y=p.getY(i);p.setZ(i,y*y*.5);}
      g.rotateX(-.55-.25*r_());g.rotateY(k/7*6.283+r_()*.4);g.computeVertexNormals();fr.push(g);}
   const fg=merge(fr);const list=[];
   for(let i=0;i<900&&list.length<420;i++){const x=rr(-468,-306),z=pathZ(x)+(r_()<.5?-1:1)*rr(2.4,26);if(inClear(x,z)||forestF(x,z)<=0)continue;if(FW.red&&Math.hypot(x-FW.red.x,z-FW.red.z)<FW.red.r*.7)continue;
     if(n3(x*.08,0,z*.08)<.42)continue;list.push([x,z]);}
   const m=new T.InstancedMesh(fg,leafMat(TX.fern,'f2'),list.length);m.customDepthMaterial=depthMat(TX.fern);m.castShadow=m.receiveShadow=true;const o=new T.Object3D(),c=new T.Color();
   list.forEach(([x,z],k)=>{const s=rr(.8,1.5);o.position.set(x,H(x,z)-.04,z);o.rotation.set(0,rr(0,6.28),0);o.scale.set(s,s*rr(.85,1.2),s);o.updateMatrix();m.setMatrixAt(k,o.matrix);c.setRGB(1,1,1).offsetHSL(rr(-.03,.04),rr(-.15,.05),rr(-.08,.05));m.setColorAt(k,c);});
   fitInstBounds(m,list,2);scene.add(m);FW.ferns=list.length;}

  /* ===== deadfall: old trunks lying where they fell, grey and mossed; snapped branches; stumps ===== */
  {const moss=std({map:TX.bark,color:C(0x7d826a),roughness:1,envMapIntensity:.2}),grey=std({map:TX.bark,color:C(0x8a847a),roughness:1,envMapIntensity:.2});
   let logs=0,tries=0;while(logs<16&&tries<400){tries++;const x=rr(-466,-334),z=pathZ(x)+(r_()<.5?-1:1)*rr(4,30);if(inClear(x,z)||forestF(x,z)<=0)continue;
     if(Math.hypot(x-REDPINE.x,z-REDPINE.z)<REDPINE.r*.8||(FW.mem&&Math.hypot(x-FW.mem.x,z-FW.mem.z)<9))continue;const yaw=rr(0,6.28),L=rr(4,9),r=rr(.14,.26);
     const dx=Math.sin(yaw)*L/2,dz=Math.cos(yaw)*L/2;let bad=false;for(let k=-1;k<=1;k++){const px=x+dx*k,pz=z+dz*k;if(Math.abs(pz-pathZ(px))<2.6||inClear(px,pz))bad=true;}if(bad)continue;
     const A=V3(x-dx,H(x-dx,z-dz)+r*.6,z-dz),B=V3(x+dx,H(x+dx,z+dz)+r*.6,z+dz);const mid=A.clone().lerp(B,.5),gm=H(mid.x,mid.z)+r*.6;if(mid.y<gm)A.y+=gm-mid.y,B.y+=gm-mid.y;
     putLogAB(bk,r,A,B,r_()<.6?moss:grey);for(let k=0;k<=4;k++){const p0=A.clone().lerp(B,k/4);solids.push({cx:p0.x,cz:p0.z,r:r+.08});}
     for(let k=0;k<3;k++){const p0=A.clone().lerp(B,rr(.15,.85)),bl=rr(.4,1.1);const br=new T.CylinderGeometry(.012,.035,bl,8);br.translate(0,bl/2,0);bk.add(br,grey,TRS(p0.x,p0.y,p0.z,rr(-1.2,1.2),yaw,rr(-1.2,1.2)));}
     logs++;}
   for(let i=0;i<70;i++){const x=rr(-468,-332),z=pathZ(x)+rr(-28,28);if(inClear(x,z))continue;const bl=rr(.6,1.8),yaw=rr(0,6.28),y=H(x,z)+.03;
     const br=new T.CylinderGeometry(.012,.03,bl,8);br.rotateZ(Math.PI/2);bk.add(br,grey,TRS(x,y,z,0,yaw,rr(-.08,.08)));
     if(r_()<.6){const tw=new T.CylinderGeometry(.006,.012,bl*.4,6);tw.translate(0,bl*.2,0);bk.add(tw,grey,TRS(x+Math.cos(yaw)*bl*.15,y,z-Math.sin(yaw)*bl*.15,rr(.4,1.2),yaw+rr(-1,1),0));}}
   for(let i=0;i<9;i++){const x=rr(-466,-336),z=pathZ(x)+(r_()<.5?-1:1)*rr(3.5,22);if(inClear(x,z))continue;const r=rr(.2,.38),h=rr(.25,.7),y=H(x,z);
     const st=new T.CylinderGeometry(r*.92,r*1.12,h,22,1,true);st.translate(0,h/2-.05,0);bk.add(st,moss,TRS(x,y,z,0,rr(0,6),0));
     const top=new T.CircleGeometry(r*.9,22);top.rotateX(-Math.PI/2);{const q=top.attributes.position;for(let k=0;k<q.count;k++)q.setY(k,(n3(q.getX(k)*9+i,0,q.getZ(k)*9)-.5)*.06);}top.computeVertexNormals();
     bk.add(top,WM.end,TRS(x,y+h-.05,z,rr(-.12,.12),0,rr(-.12,.12)));solids.push({cx:x,cz:z,r:r+.05});}}

  bk.flush(scene,true);

  /* ===== shafts of sun through the canopy: soft additive beams along the sun's direction, turned to face you ===== */
  {const t=tex(64,256,(c,w,h)=>{const im=c.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=x/(w-1)*2-1,v=y/(h-1);const a=Math.pow(Math.max(0,1-u*u),1.6)*Math.sin(Math.PI*v)*(.75+.25*Math.sin(v*9+u*2));
      const i=(y*w+x)*4;d[i]=255;d[i+1]=236;d[i+2]=190;d[i+3]=clamp(a,0,1)*255;}c.putImageData(im,0,0);},{clamp:true});
   const g=new T.PlaneGeometry(1,1);const ax=SUN.clone().negate();
   for(let i=0;i<18;i++){const x=rr(-462,-308),z=pathZ(x)+rr(-14,14);if(inClear(x,z))continue;const m=new T.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,blending:T.AdditiveBlending,opacity:0,fog:false,side:T.DoubleSide});
     const me=new T.Mesh(g,m);const L=rr(26,40),W=rr(.9,2.6);const base=V3(x,H(x,z)+.2,z);const mid=base.clone().addScaledVector(ax,-L*.5);me.position.copy(mid);me.scale.set(W,L,1);me.renderOrder=9;me.frustumCulled=false;
     me.userData={mid,ax:ax.clone(),k:rr(.5,1),ph:rr(0,6)};scene.add(me);FW.shafts.push(me);}}})();
/* ---- flight of crows: up from the dead tree as you come, scattering, cawing ---- */
function crowFlock(at){const mat=std({color:C(0x111111),roughness:.6,envMapIntensity:.3});const list=[];
  for(let i=0;i<8;i++){const g=new T.Group();const body=new T.Mesh(new T.SphereGeometry(.09,10,8),mat);body.scale.set(.7,.7,1.8);g.add(body);const head=new T.Mesh(new T.SphereGeometry(.055,8,6),mat);head.position.set(0,.03,.17);g.add(head);
    const beak=new T.Mesh(new T.ConeGeometry(.018,.07,6),mat);beak.rotation.x=Math.PI/2;beak.position.set(0,.025,.24);g.add(beak);const tail=new T.Mesh(new T.PlaneGeometry(.12,.16),mat);tail.rotation.x=-Math.PI/2;tail.position.set(0,0,-.22);g.add(tail);
    const wings=[-1,1].map(s=>{const p=new T.Group();p.position.set(s*.05,.02,0);const w=new T.Mesh(new T.PlaneGeometry(.42,.2),mat);w.material.side=T.DoubleSide;w.position.x=s*.21;w.rotation.x=-Math.PI/2;p.add(w);g.add(p);return p;});
    g.position.copy(at).add(V3((Math.random()-.5)*3,Math.random()*2,(Math.random()-.5)*3));const v=V3((Math.random()-.5)*6,3+Math.random()*3,(Math.random()-.5)*6).add(V3(-4,0,0));scene.add(g);list.push({g,v,wings,ph:Math.random()*6,t:0});}
  FW.crows={list,t:0};for(let k=0;k<3;k++)setTimeout(()=>{if(sfx.caw)sfx.caw();},k*500+Math.random()*300);}
function forestTick(dt){if(S.chapter!==3)return;const px=player.pos.x,pz=player.pos.z,cp=camera.position;const inF=px<-300&&px>-470;
  /* sun shafts: only in the woods, only with the sun out, never when you stand in one */
  /* (haze is what makes them show: more of it, stronger beams - as long as the sun still gets through) */
  const sunK=(1-clamp((WEATHER.cov||0)*1.4,0,1))*(1-.6*(WEATHER.dim||0))*(1+clamp(((WEATHER.fogX||1)-1)*2,0,.8));
  for(const m of FW.shafts){const u=m.userData;const d=Math.hypot(u.mid.x-cp.x,u.mid.z-cp.z);const want=inF?sunK*u.k*.2*(1-sstep(55,80,d))*sstep(2.5,6,d)*(.8+.2*Math.sin(S.t*.4+u.ph)):0;
    m.material.opacity=damp(m.material.opacity,want,1.2,dt);m.visible=m.material.opacity>.003;if(!m.visible)continue;
    /* turn about the beam's own axis to face the camera */
    const to=cp.clone().sub(u.mid);to.addScaledVector(u.ax,-to.dot(u.ax)).normalize();const xA=u.ax.clone().cross(to).normalize();m.matrix.makeBasis(xA.multiplyScalar(m.scale.x),u.ax.clone().multiplyScalar(-m.scale.y),to);m.matrix.setPosition(u.mid);m.matrixAutoUpdate=false;m.matrixWorldNeedsUpdate=true;}
  /* crows */
  if(!FW.crows&&!FW.said.crows&&px<-360&&px>-380&&S.state==='play'){FW.said.crows=1;crowFlock(V3(-372,H(-372,-381)+7,-381));}
  if(FW.crows){const C_=FW.crows;C_.t+=dt;for(const c of C_.list){c.t+=dt;c.v.y+=dt*.6;c.g.position.addScaledVector(c.v,dt);c.g.lookAt(c.g.position.clone().add(c.v));c.ph+=dt*(c.t<2?16:9);const f=Math.sin(c.ph)*.9;c.wings[0].rotation.z=f;c.wings[1].rotation.z=-f;}
    if(C_.t>10){C_.list.forEach(c=>scene.remove(c.g));FW.crows=null;}}
  if(!inF||S.state!=='play'||typeof CH3==='undefined'||CH3.stage<1||CH3.stage>2)return;
  /* sounds of the woods */
  const T_=FW.t,A=AUD;if(!A||!A.pan||!AC)return;const calm=S.t-AUD.lastGun>30;
  T_.cuckoo-=dt;if(T_.cuckoo<=0){T_.cuckoo=22+Math.random()*30;if(calm){const a=Math.random()*6.28,r=40+Math.random()*50;const out=A.pan(V3(cp.x+Math.cos(a)*r,cp.y+10,cp.z+Math.sin(a)*r),14,1,false,.8);const n=3+Math.floor(Math.random()*4);
      for(let i=0;i<n;i++){A.tone(690,680,.16,.12,i*.62,out,'sine',.03);A.tone(560,548,.24,.11,i*.62+.2,out,'sine',.03);}}}
  T_.wood-=dt;if(T_.wood<=0){T_.wood=28+Math.random()*40;if(calm){const a=Math.random()*6.28,r=25+Math.random()*35;const out=A.pan(V3(cp.x+Math.cos(a)*r,cp.y+7,cp.z+Math.sin(a)*r),10,1,false,.7);const n=14+Math.floor(Math.random()*8);
      for(let i=0;i<n;i++)A.burst(.022,.5*(1-i/n*.5),1800,700,'bandpass',3,i*(.058-i*.0008),out,.0008);}}
  T_.art-=dt;if(T_.art<=0){T_.art=60+Math.random()*60;const a=Math.random()*6.28;const out=A.pan(V3(cp.x+Math.cos(a)*900,cp.y,cp.z+Math.sin(a)*900),200,.4,false,.9);const nn=1+Math.floor(Math.random()*3);
    const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=280;lp.Q.value=.4;lp.connect(out);
    for(let i=0;i<nn;i++){const dl=i*(.8+Math.random()*1.4);if(!(A.play&&A.play('boom',lp,.9,.62+Math.random()*.12,dl)))A.burst(1.8,.9,260,40,'lowpass',.6,dl,lp,.02);A.tone(40,22,1.6,.45,dl,lp,'sine',.05);}
    if(!FW.said.art&&CH3.q.length===0){FW.said.art=1;setTimeout(()=>{if(S.state==='play'&&CH3.q.length<2)ch3Say([['CAPTAIN MOROZOV','Hear that? Guns, far off. Past the river… ours, by the sound.',3.6]]);},2600);}}
  T_.crk-=dt;if(T_.crk<=0){T_.crk=14+Math.random()*24;const a=Math.random()*6.28,r=8+Math.random()*14;const out=A.pan(V3(cp.x+Math.cos(a)*r,cp.y-1,cp.z+Math.sin(a)*r),4,1,true,.4);A.burst(.04,.35,1600,700,'bandpass',2,0,out,.001);A.burst(.06,.2,900,300,'bandpass',1.5,.03,out,.002);}
  /* Morozov, now and then */
  const say=(k,L,cond)=>{if(FW.said[k]||!cond||CH3.q.length)return;FW.said[k]=1;ch3Say(L);};
  say('fence',[['CAPTAIN MOROZOV','The old exclusion fence. Nobody has mended it in thirty years… nobody needed to.',4.4]],px<-326);
  say('red',[['CAPTAIN MOROZOV','Red pines. They took the dose in eighty-six and they still hold it. Don\'t touch the bark — and don\'t stop here.',5.2]],FW.red&&Math.hypot(px-FW.red.x,pz-FW.red.z)<FW.red.r+12);
  say('mem',[['CAPTAIN MOROZOV','Forty-one. Somebody held a line in these woods then, too.',3.4],['CAPTAIN MOROZOV','Nobody comes to paint the fence any more. Keep moving, Sergeant.',3.6]],FW.mem&&Math.hypot(px-FW.mem.x,pz-FW.mem.z)<15);}
window.__fw=FW;window.__wx=WEATHER;
