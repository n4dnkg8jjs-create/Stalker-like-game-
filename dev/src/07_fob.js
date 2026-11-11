/* ---------- F.O.B. "Kurgan" ---------- */
const LOOT=[],NPCS=[];let flagMesh=null;
/* concertina razor wire (BTO-22 pattern): a galvanised tape crimped round a core wire, with double-edged blades every
   37 mm; the coil is clipped to itself so neighbouring turns lean alternately and cross, like a stretched coil on site.
   The tape is a ribbon lying in the coil's surface; the blades are cut from it by the texture's alpha */
let _RZ=null;
function razorMat(){if(_RZ)return _RZ;
  const t=tex(256,64,(c,w,h)=>{c.clearRect(0,0,w,h);const cy=h/2;
    const steel=(x0,x1,y0,y1)=>{const gr=c.createLinearGradient(0,y0,0,y1);gr.addColorStop(0,'#c9ccd0');gr.addColorStop(.5,'#f4f6f8');gr.addColorStop(1,'#a9adb2');c.fillStyle=gr;};
    steel(0,w,cy-4,cy+4);c.fillRect(0,cy-3.5,w,7);                                   /* tape with the core inside */
    for(let k=0;k<2;k++){const x0=w*(k+.5)/2;
      for(const sg of [-1,1]){steel(0,w,sg<0?0:cy,sg<0?cy:h);c.beginPath();       /* two blades each side, pointing apart */
        c.moveTo(x0-3,cy);c.lineTo(x0-44,cy+sg*28);c.lineTo(x0-30,cy+sg*29);c.lineTo(x0-9,cy+sg*4);
        c.lineTo(x0+9,cy+sg*4);c.lineTo(x0+30,cy+sg*29);c.lineTo(x0+44,cy+sg*28);c.lineTo(x0+3,cy);c.closePath();c.fill();}
      c.fillStyle='rgba(60,64,70,.55)';c.fillRect(x0-2,cy-5,4,10);}                  /* crimp */
    c.fillStyle='rgba(90,94,100,.6)';c.fillRect(0,cy-.8,w,1.6);},{clamp:false});
  t.wrapS=T.RepeatWrapping;t.wrapT=T.ClampToEdgeWrapping;t.encoding=T.sRGBEncoding;t.anisotropy=8;
  _RZ=std({map:t,color:C(0xf2f4f6),metalness:.35,roughness:.28,alphaTest:.5,side:T.DoubleSide,envMapIntensity:1.6});
  _RZ.userData.depth=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:t,alphaTest:.5});return _RZ;}
function concertina(x1,z1,x2,z2,y){const L=Math.hypot(x2-x1,z2-z1),dx=(x2-x1)/L,dz=(z2-z1)/L,px=-dz,pz=dx;
  const R0=.36,pitch=.2,lean=.12,W=.05,seg=34,turns=Math.ceil(L/pitch);const n=turns*seg;
  const pos=new Float32Array((n+1)*2*3),uv=new Float32Array((n+1)*2*2),idx=[];let arc=0;const pp=V3(),pr=V3(),Tg=V3(),Rd=V3(),Bw=V3();
  const P=(i,o)=>{const th=i/seg*Math.PI*2,k=i/seg;const r=R0*(1+.04*Math.sin(th*3+k*1.7)+.03*Math.sin(k*2.3));
    const s=Math.min(L,Math.max(0,k*pitch*(L/(turns*pitch))+lean*Math.sin(th*.5+Math.PI/4)));
    const c=Math.cos(th),sn=Math.sin(th);o.set(x1+dx*s+px*c*r,y+R0+sn*r,z1+dz*s+pz*c*r);return o;};
  for(let i=0;i<=n;i++){P(i,pp);P(Math.min(n,i+1),Tg);P(Math.max(0,i-1),pr);Tg.sub(pr).normalize();
    if(i>0){P(i-1,pr);arc+=pp.distanceTo(pr);}
    const s=(pp.x-x1)*dx+(pp.z-z1)*dz;Rd.set(pp.x-(x1+dx*s),pp.y-(y+R0),pp.z-(z1+dz*s)).normalize();Bw.crossVectors(Tg,Rd).normalize();
    for(let e=0;e<2;e++){const k=(i*2+e)*3,sg=e?1:-1;pos[k]=pp.x+Bw.x*sg*W/2;pos[k+1]=pp.y+Bw.y*sg*W/2;pos[k+2]=pp.z+Bw.z*sg*W/2;uv[(i*2+e)*2]=arc/.074;uv[(i*2+e)*2+1]=e;}
    if(i<n){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
  const m=razorMat();const ms=new T.Mesh(g,m);ms.castShadow=true;ms.receiveShadow=true;ms.customDepthMaterial=m.userData.depth;ms.userData.noMerge=true;scene.add(ms);
  /* galvanised pickets every few metres holding the coil down */
  for(let s=1.5;s<L;s+=6){const x=x1+dx*s,z=z1+dz*s;[-1,1].forEach(sd=>{const pk=mesh(G('rzPk',()=>new T.CylinderGeometry(.008,.008,.8,6)),GALV(),x+px*sd*(R0+.02),y+.36,z+pz*sd*(R0+.02),scene);pk.rotation.set(px*sd*.2,0,-pz*sd*.2);});}
  return ms;}
function hescoWall(segs){const geo=rbox(1.5,2.6,3,.04),top=G('hescoTop',()=>{const g=new T.BoxGeometry(1.42,.16,2.94,4,1,10);const p=g.attributes.position;
    for(let i=0;i<p.count;i++){const y=p.getY(i);if(y>0){const x=p.getX(i),z=p.getZ(i);p.setY(i,y+.06*(1-Math.pow(x/.71,2))+(hash(x*9,z*7)-.5)*.05);}}g.computeVertexNormals();return g;});const n=segs.length;
  const m=new T.InstancedMesh(geo,M.hesco,n),t=new T.InstancedMesh(top,M.sand,n);const o=new T.Object3D();
  segs.forEach((s,i)=>{const L=s[3]||3;o.position.set(s[0],.9,s[1]);o.rotation.set(0,s[2]?Math.PI/2:0,0);o.scale.set(1,1,L/3);o.updateMatrix();m.setMatrixAt(i,o.matrix);o.position.y=2.2;o.updateMatrix();t.setMatrixAt(i,o.matrix);
    const hw=s[2]?L/2:.75,hd=s[2]?.75:L/2;solidAABB(s[0]-hw,s[0]+hw,s[1]-hd,s[1]+hd);});
  m.castShadow=m.receiveShadow=t.castShadow=t.receiveShadow=true;scene.add(m,t);shootables.push(m);}
/* army tent: double-sided canvas throughout (seen from any side, and from the doorway), side walls hinged at the eave and
   flared out at the foot, gables cut to meet the flared walls, and a roof that overhangs the walls and gables a little so
   there is no slit anywhere */
const TENTCAN=M.canvas.clone();TENTCAN.side=T.DoubleSide;
/* wood-stove smoke from a tent's chimney: thin grey wisps leaning off with the breeze */
const TENTVENTS=[];
function tentSmoke(dt){if(S.where!=='fob')return;for(const v of TENTVENTS){v.acc+=dt*v.rate;while(v.acc>1){v.acc-=1;const k=R();
  FX.smoke.spawn(_w.set(v.p.x+rnd(-.04,.04),v.p.y+rnd(0,.06),v.p.z+rnd(-.04,.04)),_v.set(.22+rnd(-.06,.06),rnd(.45,.75),.08+rnd(-.06,.06)),rnd(5,8.5),rnd(.26,.34),rnd(1.8,2.9),
    [.11+k*.04,.11+k*.04,.125+k*.04,.75*v.k],[.36,.36,.39,0],{drag:.22,up:.1,spin:rnd(-.35,.35),fi:.015});}}}
function tent(x,z,ry){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);const L=9.6,W=4.8,wh=1.45,rh=3.5,fl=.06,flo=wh*Math.sin(fl);
  const ang=Math.PI/2-Math.atan2(rh-wh,W/2),sl=Math.hypot(W/2,rh-wh),ov=.16,oe=.22;
  const roofSide=s=>{const pg=new T.PlaneGeometry(L+oe*2,sl+ov,18,5);pg.translate(0,-ov/2,0);const p=pg.attributes.position;
    for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i);const sag=Math.abs(Math.sin(u/(L+oe*2)*Math.PI*4))*.05*Math.max(0,1-Math.abs(v)/1.6);p.setZ(i,-sag);}pg.computeVertexNormals();
    const m=mesh(pg,TENTCAN,0,(wh+rh)/2,s*W/4,g);m.rotation.set(-s*ang,0,0);return m;};
  const r1=roofSide(1),r2=roofSide(-1);
  [-1,1].forEach(s=>{const wg=new T.PlaneGeometry(L,wh,8,2);wg.translate(0,-wh/2,0);const w=mesh(wg,TENTCAN,0,wh+.01,s*W/2,g);w.rotation.x=-s*fl;
    const sh=new T.Shape();sh.moveTo(-W/2-flo,0);sh.lineTo(W/2+flo,0);sh.lineTo(W/2,wh);sh.lineTo(0,rh);sh.lineTo(-W/2,wh);sh.closePath();const e=mesh(new T.ShapeGeometry(sh),TENTCAN,s*L/2,0,0,g);e.rotation.y=Math.PI/2;
    for(let i=0;i<5;i++){const px=-L/2+i*L/4;const line=new T.BufferGeometry().setFromPoints([V3(px,wh,s*W/2),V3(px,0,s*(W/2+1.6))]);g.add(new T.Line(line,M.wire));
      mesh(new T.CylinderGeometry(.015,.015,.3,5),M.wood,px,.1,s*(W/2+1.6),g);}});
  tentDoor(g,L/2,.6);
  mesh(new T.CylinderGeometry(.07,.07,1.4,20),M.rust,-2,rh-.2,1.1,g);mesh(new T.CylinderGeometry(.12,.12,.08,20),M.rust,-2,rh+.5,1.1,g);
  g.updateMatrixWorld(true);const vent=g.localToWorld(V3(-2,rh+.56,1.1));
  /* exact footprint of the canvas (not the guy ropes) */
  {const c=Math.abs(Math.cos(ry)),s_=Math.abs(Math.sin(ry)),ex=L/2*c+(W/2+flo)*s_+.08,ez=L/2*s_+(W/2+flo)*c+.08;solidAABB(x-ex,x+ex,z-ez,z+ez);}
  shootables.push(r1,r2);g.userData.vent=vent;return g;}
/* the tent's entrance: a dark doorway in the end wall framed by a sewn-on canvas border; one flap rolled up and tied at
   the top, the other hanging, pushed half open, its lower edge curling out over the ground */
const TENTDARK=std({color:C(0x0d0e0a),roughness:1});
function tentDoor(g,x,z){const d=new T.Group();d.position.set(x+.015,0,z);d.rotation.y=Math.PI/2;g.add(d);const W=1.0,Hd=1.75;
  mesh(new T.PlaneGeometry(W,Hd),TENTDARK,0,Hd/2,.002,d,false);
  /* border tape */
  [[0,Hd+.04,W+.16,.08],[-W/2-.04,Hd/2,.08,Hd],[W/2+.04,Hd/2,.08,Hd]].forEach(([u,v,w,h])=>mesh(rbox(w,h,.02,.006),TENTCAN,u,v,.012,d));
  /* the rolled flap on the right, tied up with two webbing ties */
  {const r=mesh(new T.CylinderGeometry(.075,.075,W*.55,20),TENTCAN,W*.22,Hd-.05,.06,d);r.rotation.z=Math.PI/2;
   [-1,1].forEach(k=>{const t=mesh(new T.TorusGeometry(.085,.008,4,10),M.strap,W*.22+k*.16,Hd-.05,.06,d);t.rotation.y=Math.PI/2;});}
  /* the hanging flap on the left, curved, its edge lifted off the ground */
  {const fg=new T.PlaneGeometry(W*.6,Hd,6,10);const p=fg.attributes.position;
   for(let i=0;i<p.count;i++){const u=clamp(p.getX(i)/(W*.6)+.5,0,1),v=clamp(p.getY(i)/Hd+.5,0,1);p.setZ(i,.05+Math.pow(u,1.6)*.32*(1-v*.6)+Math.sin(v*9)*.01);p.setX(i,p.getX(i)-u*u*.12*(1-v));if(v<.08)p.setZ(i,p.getZ(i)+(.08-v)*1.2);}
   fg.computeVertexNormals();const f=mesh(fg,TENTCAN,-W*.2,Hd/2,0,d);f.material=TENTCAN;}
  /* a duckboard step in front */
  {const st=new T.Group();st.position.set(0,0,.55);d.add(st);for(let i=0;i<4;i++)mesh(rbox(1.1,.035,.12,.008),M.planks||M.wood,0,.08,-.25+i*.165,st);[-1,1].forEach(k=>mesh(rbox(.06,.06,.66,.01),M.wood,k*.45,.03,0,st));}}
/* a container's steel personnel door: recessed in a frame with a rubber seal, pressed stiffening ribs, three heavy
   hinges, a lever latch with its keeper, a stencilled marking, and a welded step below */
function containerDoor(g,x,z,mark){const d=new T.Group();d.position.set(x,0,z);g.add(d);const W=.9,Hd=1.95,y0=.18;
  const st=std({color:C(0x5f6a48),roughness:.62,metalness:.4});
  mesh(rbox(W+.14,Hd+.12,.05,.012),M.gunD,0,y0+Hd/2,.01,d);
  mesh(rbox(W,Hd,.045,.01),st,0,y0+Hd/2,.04,d);
  for(let i=0;i<3;i++)mesh(rbox(W-.18,.05,.025,.01),st,0,y0+.4+i*.6,.07,d);
  mesh(rbox(.04,Hd-.2,.025,.01),st,-W/2+.12,y0+Hd/2,.07,d);mesh(rbox(.04,Hd-.2,.025,.01),st,W/2-.12,y0+Hd/2,.07,d);
  [.25,Hd/2,Hd-.25].forEach(v=>{mesh(new T.CylinderGeometry(.022,.022,.13,10),M.gunD,-W/2-.01,y0+v,.07,d);mesh(rbox(.12,.08,.012,.004),M.gunD,-W/2+.05,y0+v,.068,d);});
  {const lv=new T.Group();lv.position.set(W/2-.13,y0+1.0,.075);d.add(lv);mesh(new T.CylinderGeometry(.03,.03,.03,12),M.gunD,0,0,0,lv).rotation.x=Math.PI/2;
   const h=mesh(rbox(.025,.2,.025,.008),M.gun,0,-.09,.025,lv);lv.rotation.z=.15;mesh(rbox(.05,.06,.04,.01),M.gunD,.06,-.2,0,lv);}
  if(mark){const t=tex(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='rgba(225,222,205,.88)';c.font='bold 74px sans-serif';c.textAlign='center';c.fillText(mark,w/2,92);},{clamp:true});
    mesh(new T.PlaneGeometry(.5,.25),std({map:t,transparent:true,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2}),0,y0+1.55,.065,d,false);}
  {const s=new T.Group();s.position.set(0,0,.32);d.add(s);mesh(rbox(1.0,.04,.36,.01),M.gunD,0,.17,0,s);[-1,1].forEach(k=>mesh(rbox(.04,.17,.36,.01),M.gunD,k*.48,.085,0,s));
   for(let i=0;i<6;i++)mesh(rbox(.9,.012,.02,.004),M.bore,0,.192,-.14+i*.056,s);}}
function container(x,z,ry,len=6,mark){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
  const b=mesh(rbox(len,2.6,2.44,.04),M.corrug,0,1.3,0,g);const tx=TX.corrug.clone();tx.needsUpdate=true;tx.repeat.set(len,1);b.material=std({map:tx,color:C(0x7a8a5c),roughness:.7,metalness:.3});
  mesh(rbox(.06,2.4,2.3,.02),std({color:C(0x5a6a44),roughness:.6,metalness:.3}),len/2+.02,1.3,0,g);
  containerDoor(g,-1,1.22,mark);mesh(rbox(1.08,.78,.05,.01),M.gunD,1.2,1.6,1.225,g);mesh(rbox(1,.7,.04,.01),M.glass,1.2,1.6,1.235,g);
  for(let i=0;i<4;i++)mesh(rbox(.02,.68,.03,.006),M.gunD,.78+i*.28,1.6,1.25,g);
  g.updateWorldMatrix(true,true);solidFrom(b);shootables.push(b);return g;}
function watchtower(x,z){const t=new T.Group();t.position.set(x,0,z);scene.add(t);const H0=6.4;
  [[-1.3,-1.3],[1.3,-1.3],[-1.3,1.3],[1.3,1.3]].forEach(p=>{mesh(rbox(.18,H0+3,.18,.02),M.post,p[0],(H0+3)/2,p[1],t);});
  for(let k=0;k<3;k++){const y=1.2+k*1.8;[[0,-1.3,0],[0,1.3,0],[-1.3,0,1],[1.3,0,1]].forEach(q=>{const br=mesh(rbox(2.6,.1,.08,.01),M.post,q[0],y,q[1],t);br.rotation.y=q[2]?Math.PI/2:0;br.rotation.z=.6;});}
  mesh(rbox(3.2,.15,3.2,.02),M.planks,0,H0,0,t);
  [[0,1.42,0],[0,-1.42,0],[1.42,0,1],[-1.42,0,1]].forEach(q=>bagWall(t,q[0],H0+.08,q[1],q[2]?2.5:3.1,q[2]?Math.PI/2:0,1.0,1,x+q[0]));
  const r=mesh(new T.ConeGeometry(2.6,1.2,4),std({map:TX.slate,color:C(0x7a8060),roughness:.9}),0,H0+3.2,0,t);r.rotation.y=Math.PI/4;
  for(let i=0;i<14;i++){mesh(rbox(.9,.05,.08,.01),M.post,1.05,.3+i*.46,1.6,t);}
  [-1,1].forEach(s=>mesh(rbox(.06,H0+.4,.06,.01),M.post,1.05+s*.42,(H0+.4)/2,1.65,t));
  solidAABB(x-1.45,x+1.45,z-1.45,z+1.45);}
function sandbagWall(x,z,len,ry,h=1.1){bagWall(null,x,0,z,len,ry,h,2,x*3+z);}
function crateStack(x,z,ry,n=4){const g=new T.Group();g.position.set(x,0,z);g.rotation.y=ry;scene.add(g);
  for(let i=0;i<n;i++){const c=mesh(rbox(1.0,.42,.5,.03),M.crate,(i%2)*.04,.21+Math.floor(i/2)*.43,(i%2)*.52-.26,g);c.rotation.y=(R()-.5)*.08;
    [-.4,.4].forEach(s=>mesh(new T.BoxGeometry(.06,.44,.52),std({color:C(0x4c5a36),roughness:.9}),s,.21+Math.floor(i/2)*.43,(i%2)*.52-.26,g));}
  g.updateWorldMatrix(true,true);solidFrom(g);}
function drum(x,z,m,tipped,y=0){const d=mesh(G('drum2',()=>{const g=lathe([[.0,.004],[.27,.004],[.288,0],[.298,.012],[.3,.03],[.3,.29],[.306,.296],[.31,.305],[.306,.314],[.3,.32],[.3,.58],[.306,.586],[.31,.595],[.306,.604],[.3,.61],[.3,.85],[.298,.868],[.288,.88],[.27,.876],[.268,.864],[.0,.864]],40);
      const cap=xf(new T.CylinderGeometry(.028,.028,.018,12),.17,.873,.05);const cap2=xf(new T.CylinderGeometry(.016,.016,.014,10),-.18,.871,-.04);
      const gm=merge([g,cap,cap2]);return gm;}),m,x,y,z,scene);
  if(tipped){d.rotation.set(Math.PI/2,0,R()*6);d.position.y=y+.3;}solids.push({cx:x,cz:z,r:.34});shootables.push(d);return d;}
const btrPark=V3(0,0,14);
(function buildFOB(){
  /* base ground: trampled mud and gravel, puddles in the ruts */
  const pad=new T.PlaneGeometry(86,68,86,68);pad.rotateX(-Math.PI/2);{const pp=pad.attributes.position,n=pp.count,sp=new Float32Array(n*4),we=new Float32Array(n),co=new Float32Array(n*3);
    for(let i=0;i<n;i++){const x=pp.getX(i),z=pp.getZ(i);const a=fbm(x/9+3,z/9,3),b=fbm(x/3+7,z/3+2,2),rut=Math.exp(-Math.pow((Math.abs(x)-1.85)/.5,2))*(Math.abs(x)<5?1:0);
      const mud=.35+sstep(.45,.65,a)*.8+rut,grv=.6+sstep(.5,.3,a)*.6,gr=sstep(.6,.8,b)*sstep(30,40,Math.max(Math.abs(x)*1.05,Math.abs(z)*1.3))*.8;const s0=mud+grv+gr;
      let w4=[gr/s0,0,mud/s0,grv/s0],wt=clamp(sstep(.56,.76,fbm(x/7+11,z/7,3))*.42+rut*.3,0,.48);
      /* (toward its edges the pad becomes the ground round it: the same mix the terrain has there, so there is no seam, and
         the ruts fade out into the track) */const ed=Math.min(43-Math.abs(x),34-Math.abs(z)),kb=sstep(0,7,ed);if(kb<1){const gm=groundMix(x,z);w4=w4.map((v,j)=>lerp(gm[j],v,kb));wt=lerp(gm[4],wt,kb);}
      pp.setY(i,H(x,z)+.012*kb);sp.set(w4,i*4);we[i]=wt;const k=.9+b*.15;co[i*3]=co[i*3+1]=co[i*3+2]=lerp(1,k,kb);}
    pad.setAttribute('splat',new T.BufferAttribute(sp,4));pad.setAttribute('wet',new T.BufferAttribute(we,1));pad.setAttribute('color',new T.BufferAttribute(co,3));pad.computeVertexNormals();}
  {const pm=mesh(pad,splatMat(.5),0,.004,0,scene,false);pm.receiveShadow=true;pm.material.polygonOffset=true;pm.material.polygonOffsetFactor=-1;pm.material.polygonOffsetUnits=-2;}
  /* perimeter: every run is split into equal, slightly overlapping cages that meet the corners and the gate exactly */
  const segs=[],run=(a,b,fix,alongX)=>{const n=Math.ceil((b-a)/2.95),st=(b-a)/n;for(let i=0;i<n;i++){const c=a+st*(i+.5);segs.push(alongX?[c,fix,1,st+.06]:[fix,c,0,st+.06]);}};
  [32.75,-32.75].forEach(zz=>{run(-42,-5.6,zz,true);run(5.6,42,zz,true);});[41.25,-41.25].forEach(xx=>run(-32,32,xx,false));
  hescoWall(segs);
  concertina(-41,33.5,-6,33.5,2.25);concertina(6,33.5,41,33.5,2.25);concertina(-41,-33.5,-6,-33.5,2.25);concertina(6,-33.5,41,-33.5,2.25);concertina(-42,-33,-42,33,2.25);concertina(42,-33,42,33,2.25);
  [[32.75,1],[-32.75,-1]].forEach(([gz,s])=>{[-1,1].forEach(k=>{const p=mesh(rbox(.32,3.4,.32,.03),std({color:C(0x8a8a80),roughness:.6,metalness:.4}),k*4.9,1.7,gz,scene);});
    const arm=new T.Group();arm.position.set(-4.9,1.15,gz+s*.3);scene.add(arm);arm.rotation.z=-1.35;
    for(let i=0;i<6;i++)mesh(rbox(1.3,.12,.12,.03),std({color:i%2?C(0xd8d4c8):C(0xb32a22),roughness:.6}),.65+i*1.3,0,0,arm);
    mesh(rbox(.4,.5,.4,.04),M.concrete,-4.9,.25,gz+s*.3,scene);});
  const zs=new T.Group();zs.position.set(-10.5,0,34.25);scene.add(zs);
  const zb=signBoard(4.2,2.1,TX.zoneSign);zb.position.set(0,2.4,0);zs.add(zb);[-1.9,1.9].forEach(x=>{mesh(rbox(.1,3.4,.1,.02),M.steel,x,1.7,-.086,zs);signClamps(zs,x,[1.65,3.15],-.036,.1);});
  /* checkpoint signs */
  [[5.6,36.2,0],[-5.6,-36.2,Math.PI]].forEach(([x,z,ry])=>{const sg=new T.Group();sg.position.set(x,0,z);sg.rotation.y=ry;scene.add(sg);const st=signBoard(1.3,.65,TX.stop);st.position.set(0,1.75,0);sg.add(st);
     mesh(rbox(.07,2.05,.07,.01),M.steel,0,1.025,-.071,sg);signClamps(sg,0,[1.55,1.95],-.036,.07);solids.push({cx:x,cz:z,r:.12});});
  const booth=new T.Group();booth.position.set(8,0,29);scene.add(booth);mesh(rbox(2,2.4,2,.03),M.planks,0,1.2,0,booth);mesh(rbox(2.3,.1,2.3,.02),M.slate,0,2.45,0,booth);mesh(rbox(1.2,.6,.05,.01),M.glass,0,1.6,1.01,booth);solidFrom(booth);{const kp=signBoard(.8,.4,TX.kpp);kp.position.set(0,2.15,1.04);booth.add(kp);}
  /* sandbags only where a soldier would put them: an L-shaped fighting position beside each gate guard, covering the
     opening, and a revetment round the generator (plus the low wall at the fuel point) */
  [1,-1].forEach(s=>{bagWall(null,-4.95,0,s*30.7,2.6,Math.PI/2,1.15,2,s*7);bagWall(null,-6.35,0,s*29.5,2.2,0,1.15,2,s*9);});
  bagWall(null,-15,0,-26.05,2.8,0,1.0,2,51);[-16.55,-13.45].forEach((x,i)=>bagWall(null,x,0,-27.15,1.9,Math.PI/2,1.0,2,52+i));
  tent(-24,-14,Math.PI/2);{const t=tent(-24,0,Math.PI/2);TENTVENTS.push({p:t.userData.vent,rate:6,acc:0,k:1});}tent(-24,14,Math.PI/2);
  container(22,-16,0,6,'КП');container(22,-10.6,0,9,'КШМ');
  mesh(new T.CylinderGeometry(.04,.06,11,16),M.steel,26.5,5.5,-16,scene);mesh(rbox(.9,.06,.06,.01),M.steel,26.5,10.8,-16,scene);
  watchtower(-36.5,-27.5);watchtower(36.5,27.5);
  [[-12,-29],[16,28]].forEach(p=>{mesh(new T.CylinderGeometry(.08,.11,9,16),M.steel,p[0],4.5,p[1],scene);const hd=mesh(rbox(.7,.4,.35,.05),M.gunD,p[0],9,p[1],scene);mesh(new T.PlaneGeometry(.55,.28),M.lamp,p[0],8.95,p[1]+.18,scene);});
  mesh(new T.CylinderGeometry(.05,.07,10,16),std({color:C(0xd0d0c8),roughness:.5,metalness:.5}),-9,5,-20,scene);
  const fl=new T.PlaneGeometry(2.1,1.4,14,6);flagMesh=mesh(fl,M.flag,-7.92,9.2,-20,scene);flagMesh.userData.base=fl.attributes.position.array.slice();
  const ob=new T.Group();ob.position.set(6.4,0,3);ob.rotation.y=-Math.PI/2;scene.add(ob);
  mesh(rbox(2.2,1.5,.08,.02),M.planks,0,1.65,0,ob);[-1,1].forEach(s=>mesh(rbox(.1,2.5,.1,.02),M.post,s*1.0,1.25,-.06,ob));
  [M.orders,M.paper].forEach(m=>{m.polygonOffset=true;m.polygonOffsetFactor=-2;m.polygonOffsetUnits=-2;});
  mesh(new T.PlaneGeometry(.75,.75),M.orders,-.45,1.68,.052,ob,false).rotation.z=.02;const pp=mesh(new T.PlaneGeometry(.5,.66),M.paper,.42,1.62,.058,ob,false);pp.rotation.z=-.05;pp.material=pp.material.clone();pp.material.side=T.FrontSide;
  mesh(rbox(2.4,.08,.3,.02),M.slate,0,2.45,.06,ob).rotation.x=.3;
  ob.userData.orders=true;
  for(let i=0;i<7;i++)drum(-35+i*.68,-22+(i%2)*.66,i%3?M.olive:M.rust,false);
  crateStack(31,20,0,6);crateStack(31,18.6,0,4);crateStack(-14,24,.3,4);
  const gen=mesh(rbox(1.7,1.1,1.0,.05),M.olive,-15,.55,-27,scene);solidFrom(gen);mesh(new T.CylinderGeometry(.05,.05,.6,16),M.rust,-14.4,1.3,-27,scene);
  /* parked BTR under a camo net */
  const b2=buildBTR();b2.position.set(18,0,8);b2.rotation.y=Math.PI;scene.add(b2);solidAABB(18-3.9,18+3.9,8-1.5,8+1.5);
  /* camouflage net: knotted cord mesh carrying garnish strips, lifted on four corner poles and a central prop
     over the turret, sagging between them and draping down at the edges; two layers for depth, guy ropes to stakes */
  {const cx=18,cz=8,W=12,D=8.6;
   const netTex=tex(512,512,(g,w,h)=>{g.clearRect(0,0,w,h);let s0=91;const rr=()=>{s0=(s0*16807)%2147483647;return(s0-1)/2147483646;};
     const pal=[[64,72,44],[84,88,56],[96,86,60],[52,56,38],[110,104,74],[70,62,46]];
     for(let i=0;i<520;i++){const x=rr()*w,y=rr()*h,a=rr()*Math.PI,l=12+rr()*26,wd=5+rr()*8,c=pal[(rr()*pal.length)|0],k=.8+rr()*.4;g.fillStyle=`rgb(${c[0]*k|0},${c[1]*k|0},${c[2]*k|0})`;
       for(const ox of [0,-w,w])for(const oy of [0,-h,h]){g.save();g.translate(x+ox,y+oy);g.rotate(a);g.beginPath();g.moveTo(-l/2,0);for(let t=0;t<=8;t++){const u=t/8;g.lineTo(-l/2+u*l,-wd/2*Math.sin(u*Math.PI)*(1+.35*Math.sin(u*17)));}
         for(let t=8;t>=0;t--){const u=t/8;g.lineTo(-l/2+u*l,wd/2*Math.sin(u*Math.PI)*(1+.35*Math.cos(u*13)));}g.closePath();g.fill();g.restore();}}
     /* punch irregular holes so the sky shows through */
     g.globalCompositeOperation='destination-out';for(let i=0;i<420;i++){g.beginPath();g.arc(rr()*w,rr()*h,5+rr()*14,0,7);g.fill();}g.globalCompositeOperation='source-over';
     g.strokeStyle='rgba(38,36,26,1)';g.lineWidth=2;for(let k=0;k<=w;k+=32){g.beginPath();g.moveTo(k,0);g.lineTo(k,h);g.stroke();g.beginPath();g.moveTo(0,k);g.lineTo(w,k);g.stroke();}},{rep:[3,2]});
   bleedAlpha(netTex,8);const netMat=std({map:netTex,alphaTest:.45,side:T.DoubleSide,roughness:1,envMapIntensity:.2});detailPatch(netMat,'weave',10,.6);
   const props=[[-W/2+.5,-D/2+.5,3.0],[W/2-.5,-D/2+.5,3.0],[-W/2+.5,D/2-.5,3.0],[W/2-.5,D/2-.5,3.0],[0,0,3.55],[-3,0,3.25],[3,0,3.25]];
   const lift=(x,y)=>{let best=-9;for(const p of props){const d=Math.hypot(x-p[0],y-p[1]);best=Math.max(best,p[2]-d*d*.055-d*.05);}return best;};
   for(let layer=0;layer<2;layer++){const gN=new T.PlaneGeometry(W+1.4,D+1.4,60,44);const np=gN.attributes.position;
     for(let i=0;i<np.count;i++){const x=np.getX(i),y=np.getY(i);const e=Math.max(Math.abs(x)/((W+1.4)/2),Math.abs(y)/((D+1.4)/2));
       let z=lift(x,y);z-=sstep(.78,1,e)*1.2;z+=fbm(x*.6+layer*3,y*.6,3)*.25-.12+layer*.06;np.setXYZ(i,x+(fbm(x*.4,y*.4+9,2)-.5)*.2,y,z);}
     gN.rotateX(-Math.PI/2);gN.computeVertexNormals();const nm=mesh(gN,netMat,cx,0,cz,scene);nm.customDepthMaterial=depthMat(netTex);nm.rotation.y=layer*.03;}
   props.slice(0,4).forEach(p=>{mesh(new T.CylinderGeometry(.045,.055,p[2],16),M.post,cx+p[0],p[2]/2,cz+p[1],scene);
     const sx=cx+p[0]*1.32,sz=cz+p[1]*1.4;const a=V3(cx+p[0],p[2]-.05,cz+p[1]),b=V3(sx,.05,sz);const L=a.distanceTo(b);
     const r=mesh(new T.CylinderGeometry(.008,.008,L,4),M.strap,(a.x+b.x)/2,(a.y+b.y)/2,(a.z+b.z)/2,scene,false);r.quaternion.setFromUnitVectors(V3(0,1,0),b.clone().sub(a).normalize());
     mesh(new T.CylinderGeometry(.02,.025,.35,5),M.wood,sx,.12,sz,scene).rotation.z=.3;});
   }
  /* NPC soldiers */
  const guard=(x,z,ry,line)=>{const h=buildHuman({char:['guard3','guard1','guard4'][NPCS.length%3],outfit:'ratnik',vest:true,helmet:true});h.root.position.set(x,0,z);h.root.rotation.y=ry;scene.add(h.root);
    const an=animate(h,{gun:npcAK(),pose:'ready'});
    NPCS.push({h,an,line,said:false,x,z,ph:R()*6});solids.push({cx:x,cz:z,r:.35});};
  /* off-duty soldiers round a barrel stove between the tents (squatting, sitting on crates, getting up to stretch) */
  {const fx=-15.5,fz=7;const BF=barrelFire(fx,fz);S.stove={l:BF.light,g:null,p:V3(fx,.84,fz),fire:BF};
    solids.push({cx:fx,cz:fz,r:.4});
    const crate=(x,z,ry)=>{const c=mesh(rbox(.62,.42,.42,.015),M.crate,x,.21,z,scene);c.rotation.y=ry;solids.push({cx:x,cz:z,r:.38});};
    const sq=buildHuman({char:'guard3',outfit:'ratnik',vest:false,helmet:false});sq.root.position.set(fx+1.05,0,fz+.15);sq.root.rotation.y=-Math.PI/2-.15;scene.add(sq.root);
    animate(sq,{pose:'squat',plan:[['squat',16,1.3],['relaxed',3,1.3],['warm',7,1.1],['relaxed',2.5,1],['stretch',3.2,1.4],['relaxed',2.5,1.3],['squat',14,1.4]]});
    crate(fx-1.15,fz+.25,.3);
    const sit=buildHuman({char:'guard4',outfit:'ratnik',vest:true,helmet:false});sit.root.position.set(fx-1.15,0,fz+.25);sit.root.rotation.y=Math.PI/2+.25;scene.add(sit.root);
    animate(sit,{pose:'sitCrate'});window.__sit=sit;
    const ak2=npcAK();ak2.rotation.set(1.18,.3+Math.PI,0,'YXZ');ak2.position.set(fx-1.15-.36*Math.sin(.3),.43,fz+.25-.36*Math.cos(.3));scene.add(ak2);
    const kn=buildHuman({char:'guard5',outfit:'ratnik',vest:true,helmet:true});kn.root.position.set(fx+.2,0,fz-1.25);kn.root.rotation.y=-.1;scene.add(kn.root);
    animate(kn,{gun:npcAK(),pose:'kneel',plan:[['kneel',18],['ready',9,1.1],['kneel',14,1.1]]});
    NPCS.push({h:sq,line:'Warm your hands, sentry. Out there the nights are cold even in summer.',said:false,x:fx+1.05,z:fz+.15});}
  guard(-6.5,30.5,Math.PI,'Gate post. Show your pass on the way out, not on the way in.');
  guard(8.5,2.5,-Math.PI/2+.4,'Orders are on the board. Sector 1, the house by the field. Rather you than me.');
  guard(-6.5,-30.5,0,'North gate. The BTR goes out this way. Keep your dosimeter where you can see it.');
  /* ---- extra dressing ---- */
  /* MG nest covering the north gate */
  /* chicane of jersey barriers outside both gates */
  [-1,1].forEach(sz=>[-1,1].forEach(sx=>{jersey(sx*4.5,sz*37.6,sx*.12*sz);jersey(sx*4.9,sz*39.7,sx*.2*sz);}));
  /* fuel point: pallets of jerrycans by the containers, more sandbags around it */
  [[26.6,-4.6],[28.1,-4.6]].forEach(([px,pz],k)=>{pallet(px,pz,0);for(let i=0;i<6;i++)jerrycan(px-.42+(i%3)*.42,.145,pz-.19+Math.floor(i/3)*.38,Math.PI/2,scene,0);});
  jerrycan(29.2,0,-3.9,.4,scene,0);jerrycan(29.6,.0,-4.4,1.3,scene,Math.PI/2*.98);solidAABB(25.9,28.8,-5.2,-4.0);
  bagWall(null,27.3,0,-3.2,3.6,0,.7,1,11);
  /* tyre stacks by the generator, cable runs to the tents */
  tyreStack(-17.6,-26.4,4);tyreStack(-18.5,-25.5,3);tyreStack(-17.4,-25.2,2);
  {const gp=V3(-15,1.15,-27);[[-24,3.3,-18],[-24,3.3,-4],[-24,3.3,10]].forEach(t=>cable(gp,V3(...t),.9));}
  /* floodlights along the inside of the wall, with feed cables between them */
  const FL=[[-38.8,-20,Math.PI/2],[-38.8,10,Math.PI/2],[38.8,-6,-Math.PI/2],[38.8,18,-Math.PI/2],[-26,-30.5,0],[24,-30.5,0],[-24,30.5,Math.PI],[22,30.5,Math.PI]];
  FL.forEach(f=>floodlight(f[0],f[1],f[2]));
  /* duckboard walkway in front of the tents */
  {const P=[];for(let z=-20;z<20;z+=1.25){for(let k=0;k<6;k++){const b=rbox(.7,.03,.14,.006);xf(b,0,.06,z+.1+k*.2,0,(hash(z,k)-.5)*.03,0);P.push(b);}
     [-.28,.28].forEach(xx=>{const r=rbox(.06,.05,1.2,.01);xf(r,xx,.025,z+.6);P.push(r);});}
   const dg=merge(P);const dm=mesh(dg,M.boards,-18.8,0,0,scene);dm.castShadow=false;}
  /* ammunition boxes by the BTR, a spare wheel, oil stains on the pad */
  [[14.2,4.2],[14.8,4.0],[14.5,4.6]].forEach(([ax,az],i)=>{const b=mesh(rbox(.55,.25,.3,.02),std({color:C(0x4d5a33),roughness:.6,metalness:.2}),ax,.125+(i===2?.25:0),az-(i===2?.35:0),scene);b.rotation.y=.2*i;});
  {const oil=std({color:C(0x15130f),roughness:.25,transparent:true,opacity:.55,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-4});
   [[18,8,1.6],[17,10.5,.9],[1,14,1.4],[-14.6,-27,.8]].forEach(([ox,oz,r])=>{const o=mesh(new T.CircleGeometry(r,20),oil,ox,.03,oz,scene,false);o.rotation.x=-Math.PI/2;o.scale.set(1,.7,1);});}
  flushBags();
})();
