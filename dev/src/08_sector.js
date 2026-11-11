/* ---------- Sector 1: the field, the checkpoint line, the farmhouse ---------- */
const FL=.35;   // house floor level
const HOUSE={x1:HX-3.5,x2:HX+3.5,z1:HZ-3,z2:HZ+3};
const CORPSES=[];
function radSign(x,z,ry,lean=0){const g=new T.Group();g.position.set(x,H(x,z),z);g.rotation.set(lean*.5,ry,lean);scene.add(g);
  mesh(G('signPost',()=>rbox(.08,2.0,.08,.012)),M.post,0,.7,0,g);
  mesh(G('signPlate',()=>new T.BoxGeometry(.52,.39,.012)),M.radSign,0,1.42,.046,g);
  [-.18,.18].forEach(dx=>mesh(G('bolt',()=>xf(new T.CylinderGeometry(.01,.01,.02,6),0,0,0,Math.PI/2,0,0)),M.steel,dx,1.42,.058,g));
  return g;}
function catenary(a,b,sag,n=14){const pts=[];for(let i=0;i<=n;i++){const t=i/n;pts.push(V3(lerp(a.x,b.x,t),lerp(a.y,b.y,t)-Math.sin(t*Math.PI)*sag,lerp(a.z,b.z,t)));}return pts;}
function lines(segs){const pos=[];segs.forEach(pts=>{for(let i=0;i<pts.length-1;i++)pos.push(pts[i].x,pts[i].y,pts[i].z,pts[i+1].x,pts[i+1].y,pts[i+1].z);});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));scene.add(new T.LineSegments(g,M.wire));}
(function checkpointLine(){const z0=-262;const posts=[],wires=[];const pg=G('cpost',()=>rbox(.13,1.9,.13,.015));
  let prev=null;for(let x=-150;x<=150;x+=4){if(Math.abs(x)<6){prev=null;continue;}const lean=hash(x,1)<.12?(hash(x,2)-.5)*.6:(hash(x,3)-.5)*.06;const y=H(x,z0);
    const p=mesh(pg,M.concrete,x,y+.6,z0,scene);p.rotation.z=lean;const top=V3(x+Math.sin(-lean)*1.5,y+1.5,z0);posts.push(top);
    if(prev&&hash(x,4)>.1)[0,.45,.9].forEach(dy=>wires.push(catenary(V3(prev.x,prev.y-dy,prev.z),V3(top.x,top.y-dy,top.z),.06+hash(x,dy)*.15,6)));prev=top;
    if(Math.round(x)%24===0)radSign(x,z0+.15,0,lean);}
  lines(wires);
  radSign(-5.2,z0,0.15);radSign(5.4,z0,-.2,.05);
  const bar=new T.Group();bar.position.set(-5,H(-5,z0),z0+1.2);bar.rotation.set(0,.4,0);scene.add(bar);
  for(let i=0;i<6;i++)mesh(rbox(1,.1,.1,.02),std({color:i%2?C(0xd8d4c8):C(0xa52a22),roughness:.7,map:TX.rust}),i*1-2.5,.06,0,bar);
  [[-62,-300,.6],[-20,-326,2.4],[60,-418,1.1],[78,-446,-.6],[22,-346,.3],[HX-10,HZ+10,.4],[HX+12,HZ+9,-.3]].forEach(s=>radSign(s[0],s[1],s[2],(hash(s[0],s[1])-.5)*.25));
})();
(function powerLine(){const a=V3(-210,0,-306),b=V3(230,0,-354);const tops=[];
  /* a pole every 40 m or so, but never in a yard, a garden, on a path, an alley or a street: where the ideal spot is taken
     it moves along the line to the nearest clear one (the spans run 22-60 m through the village, as they do) */
  const Ln=a.distanceTo(b),clearAt=(x,z)=>!(VILL.houses.some(h=>{const r=h.prect;return x>r.x1-.9&&x<r.x2+.9&&z>r.z1-.9&&z<r.z2+.9;})||villPathD(x,z)<1.4||villStreetD(x,z)<4.5);
  const ts=[0];while(true){const prev=ts[ts.length-1],t0=prev+40/Ln;if(t0>1-15/Ln)break;let best=null;
    for(let k=0;k<64&&best===null;k++)for(const sg of [1,-1]){const t=t0+sg*k*.0025;if(t-prev<22/Ln)continue;if(clearAt(lerp(a.x,b.x,t),lerp(a.z,b.z,t))){best=t;break;}}
    ts.push(best===null?t0:best);}ts.push(1);
  for(let i=0;i<ts.length;i++){const t=ts[i];
    const x=lerp(a.x,b.x,t),z=lerp(a.z,b.z,t);const y=H(x,z);const g=new T.Group();g.position.set(x,y,z);g.rotation.y=Math.atan2(b.x-a.x,b.z-a.z);
    const lean=i===4?.22:(hash(i,9)-.5)*.06;g.rotation.z=lean;scene.add(g);
    mesh(G('ppole',()=>xf(new T.CylinderGeometry(.11,.15,9,16),0,4.2,0)),M.post,0,0,0,g);mesh(G('parm',()=>rbox(.12,.12,1.9,.01)),M.post,0,8.1,0,g);
    [-.8,0,.8].forEach(dz=>mesh(G('insul',()=>lathe([[.0,0],[.05,0],[.06,.04],[.04,.06],[.06,.09],[.04,.11],[.03,.16],[0,.16]],10)),M.enamel,0,8.17,dz,g));
    g.updateWorldMatrix(true,false);tops.push([-.8,0,.8].map(dz=>V3(0,8.32,dz).applyMatrix4(g.matrixWorld)));solids.push({cx:x,cz:z,r:.2});}
  const segs=[];for(let i=0;i<ts.length-1;i++)for(let k=0;k<3;k++){if(i===6&&k===2){const p=tops[i][k];segs.push(catenary(p,V3(p.x+4,H(p.x+4,p.z+2)+.05,p.z+2),.5,8));continue;}segs.push(catenary(tops[i][k],tops[i+1][k],1.1,16));}
  lines(segs);})();
function uazWreck(x,z,rot=[.035,.9,-.07],dy=.02){/* abandoned UAZ-469, stripped and rusting */
  const g=new T.Group();g.position.set(x,H(x,z)+dy,z);g.rotation.set(rot[0],rot[1],rot[2]);scene.add(g);const rp=M.rustpaint,rm=M.rust;
  const sideShape=()=>{const s_=new T.Shape();const A=[1.19,-1.19],r=.47,cy=.43;s_.moveTo(-2.0,.56);
    s_.lineTo(A[1]-r,.56);s_.absarc(A[1],cy,r,Math.PI-.28,.28,true);s_.lineTo(A[0]-r,.56);s_.absarc(A[0],cy,r,Math.PI-.28,.28,true);
    s_.lineTo(2.0,.56);s_.lineTo(2.04,.74);s_.lineTo(2.02,.98);s_.lineTo(1.9,1.02);s_.lineTo(.78,1.13);s_.lineTo(.7,1.16);s_.lineTo(-1.98,1.16);s_.lineTo(-2.02,.95);s_.closePath();return s_;};
  const bodyG=new T.ExtrudeGeometry(sideShape(),{depth:1.62,bevelEnabled:true,bevelThickness:.04,bevelSize:.035,bevelSegments:3,curveSegments:14});bodyG.translate(0,0,-.81);worldUV(bodyG.toNonIndexed?bodyG:bodyG,1);
  mesh(bodyG,rp,0,0,0,g);
  /* hollow tub: dark interior volume + floor so the open top reads */
  mesh(rbox(2.55,.08,1.5,.02),rm,-.68,1.08,0,g);mesh(rbox(2.5,.04,1.48,.01),M.dark,-.68,1.12,0,g);
  /* fenders */
  [1.19,-1.19].forEach(ax=>[-1,1].forEach(sd=>{const f=mesh(xf(new T.TorusGeometry(.52,.06,6,18,Math.PI*.8),0,0,0,0,0,Math.PI*.1),rp,ax,.43,sd*.86,g);}));
  /* bonnet with a centre crease and louvres, grille with vertical slots, round headlamps */
  mesh(xf(rbox(1.22,.05,1.5,.02),0,0,0,0,0,-.085),rp,1.39,1.09,0,g);mesh(rbox(1.1,.025,.04,.01),rm,1.39,1.12,0,g).rotation.z=-.085;
  const gr=new T.Group();gr.position.set(2.06,.78,0);g.add(gr);mesh(rbox(.05,.4,1.25,.02),rp,0,0,0,gr);
  for(let k=-5;k<=5;k++)mesh(rbox(.06,.3,.035,.008),M.dark,.012,0,k*.07,gr);
  [-.55,.55].forEach(zz=>{mesh(xf(new T.CylinderGeometry(.09,.09,.08,16),0,0,0,0,0,Math.PI/2),rm,2.07,.84,zz,g);const gl=mesh(xf(new T.CircleGeometry(.075,16),0,0,0,0,Math.PI/2,0),zz>0?M.glass:M.dark,2.115,.84,zz,g);});
  mesh(rbox(.1,.1,1.8,.02),rm,2.12,.5,0,g);mesh(rbox(.1,.1,1.75,.02),rm,-2.06,.55,0,g);
  /* windscreen frame (one pane smashed) and folded-down top bows */
  const ws=new T.Group();ws.position.set(.74,1.16,0);ws.rotation.z=.22;g.add(ws);
  mesh(rbox(.05,.5,1.58,.015),rp,0,.25,0,ws).scale.set(1,1,1);mesh(rbox(.06,.46,.05,.01),rp,0,.25,0,ws);
  mesh(rbox(.012,.42,.7,.002),M.glass,.01,.25,-.38,ws);
  for(let k=0;k<3;k++){const bw=mesh(xf(new T.TorusGeometry(.8,.016,5,20,Math.PI),0,0,0,0,Math.PI/2,0),rm,-.4-k*.55,1.16,0,g);bw.scale.set(1,.72,1);bw.rotation.x=k===2?.0:-.15;}
  /* torn canvas remnant hanging off the rear bow */
  {const cg=new T.PlaneGeometry(.45,.6,6,8);const cp=cg.attributes.position;for(let i=0;i<cp.count;i++){const a=cp.getX(i),b=cp.getY(i);cp.setZ(i,Math.sin(a*4)*.04+Math.sin(b*3)*.05-(b+.7)*(b+.7)*.12);}
   cg.computeVertexNormals();const cm=mesh(cg,M.canvas,-1.5,1.3,.8,g);cm.rotation.set(0,0,-.15);cm.material=M.canvas;}
  /* seats, wheel, dash */
  mesh(rbox(.45,.5,.5,.04),rm,.15,1.35,.38,g).rotation.z=.2;mesh(rbox(.42,.08,.48,.03),M.dark,.3,1.18,-.38,g);
  mesh(xf(new T.TorusGeometry(.17,.015,6,16),0,0,0,0,Math.PI/2,0),M.black,.5,1.45,.38,g).rotation.z=-.6;
  /* doors: panel seams and handles */
  [-1,1].forEach(sd=>{[[.35,.42],[-.45,.42]].forEach(([dx,w])=>{mesh(rbox(.012,.5,.01,.002),M.dark,dx+w,.87,sd*.852,g);mesh(rbox(.012,.5,.01,.002),M.dark,dx-w,.87,sd*.852,g);
    mesh(rbox(.1,.02,.03,.008),rm,dx+.25,1.0,sd*.86,g);});});
  /* wheels: lugged tyres (one flat), pressed steel rims */
  const tyre=G('uazTyre',()=>{const pts=[];for(let i=0;i<=12;i++){const a=i/12*Math.PI;pts.push(new T.Vector2(.25+Math.sin(a)*.115,(-Math.cos(a))*.12));}const lg=new T.LatheGeometry(pts,32);
    const p=lg.attributes.position;for(let i=0;i<p.count;i++){const vx=p.getX(i),vz=p.getZ(i),r=Math.hypot(vx,vz);if(r>.35){const an=Math.atan2(vz,vx);const k=1+.025*(Math.sin(an*22)>0?1:0);p.setX(i,vx*k);p.setZ(i,vz*k);}}lg.computeVertexNormals();return xf(lg,0,0,0,Math.PI/2,0,0);});
  [[1.19,.8],[1.19,-.8],[-1.19,.8],[-1.19,-.8]].forEach(([ax,az],i)=>{const w=new T.Group();w.position.set(ax,i===2?.3:.37,az);g.add(w);if(i===2){w.rotation.z=.35;w.scale.set(1,.85,1);}
    mesh(tyre,M.tire,0,0,0,w);mesh(xf(new T.CylinderGeometry(.24,.24,.18,18),0,0,0,Math.PI/2,0,0),rm,0,0,0,w);mesh(xf(new T.CylinderGeometry(.07,.07,.2,16),0,0,0,Math.PI/2,0,0),M.dark,0,0,0,w);});
  /* spare on the tailgate, axles, leaf springs, exhaust */
  {const sp=new T.Group();sp.position.set(-2.12,.92,.3);sp.rotation.y=Math.PI/2;g.add(sp);mesh(tyre,M.tire,0,0,0,sp);mesh(xf(new T.CylinderGeometry(.24,.24,.18,18),0,0,0,Math.PI/2,0,0),rm,0,0,0,sp);}
  [1.19,-1.19].forEach(ax=>{mesh(xf(new T.CylinderGeometry(.06,.06,1.6,16),0,0,0,Math.PI/2,0,0),rm,ax,.37,0,g);[-.55,.55].forEach(zz=>mesh(rbox(1.0,.06,.07,.01),rm,ax,.45,zz,g));});
  mesh(xf(new T.CylinderGeometry(.03,.03,2.4,16),0,0,0,0,0,Math.PI/2),rm,-.6,.42,-.45,g);
  mesh(rbox(.48,.3,.16,.03),M.olive,-2.0,1.0,-.62,g);
  /* ---- extra wreck detail ---- */
  {const holeT=tex(128,128,(c,w,h)=>{c.clearRect(0,0,w,h);let s0=7;const rr=()=>{s0=(s0*16807)%2147483647;return(s0-1)/2147483646;};
      const blob=(r,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<=24;i++){const a=i/24*Math.PI*2,q=r*(.75+rr()*.4);i?c.lineTo(64+Math.cos(a)*q,64+Math.sin(a)*q):c.moveTo(64+Math.cos(a)*q,64+Math.sin(a)*q);}c.fill();};
      blob(58,'rgba(122,62,28,.85)');blob(44,'rgba(84,40,18,1)');blob(30,'rgba(12,9,7,1)');},{clamp:true});
   const holeM=std({map:holeT,alphaTest:.4,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,polygonOffsetUnits:-3});
   const hole=(x,y,z,ry,rx,sc)=>{const m=mesh(new T.PlaneGeometry(sc,sc*.8),holeM,x,y,z,g,false);m.rotation.set(rx,ry,hash(x,y)*6,'YXZ');};
   [[-1.5,.8,1],[-.2,.66,1],[1.6,.7,1],[-1.75,.95,-1],[.2,.72,-1],[1.3,.82,-1]].forEach(([hx,hy,sd],i)=>hole(hx,hy,sd*.848,sd>0?0:Math.PI,0,.16+hash(i,3)*.18));
   [[1.1,.3],[1.6,-.45]].forEach(([hx,hz])=>{const m=mesh(new T.PlaneGeometry(.22,.18),holeM,hx,1.118+(1.39-hx)*.085,hz,g,false);m.rotation.set(-Math.PI/2,0,hash(hx,hz)*6);});
   /* body side rib */
   [-1,1].forEach(sd=>mesh(rbox(3.9,.035,.02,.008),rp,0,.98,sd*.85,g));
   /* driver's door torn open on its hinges, dark doorway behind it */
   const dw=mesh(new T.PlaneGeometry(.8,.48),M.dark,.35,.88,.853,g,false);dw.material=std({color:C(0x0e0c0a),roughness:1,polygonOffset:true,polygonOffsetFactor:-2});
   {const dg=new T.Group();dg.position.set(.77,.88,.86);dg.rotation.y=-1.15;g.add(dg);mesh(rbox(.82,.48,.035,.01),rp,-.41,0,0,dg);mesh(rbox(.1,.02,.03,.008),rm,-.65,.12,.02,dg);
    mesh(rbox(.04,.08,.05,.01),rm,-.02,.17,-.02,dg);mesh(rbox(.04,.08,.05,.01),rm,-.02,-.17,-.02,dg);}
   /* dashboard with dead gauges, steering column, gear sticks, torn seat foam */
   mesh(rbox(.12,.16,1.45,.02),rp,.62,1.2,0,g);[[.38,.5],[.38,.27]].forEach(([dy,dz])=>{const ga=mesh(new T.CircleGeometry(.04,12),M.glass,.55,1.24,dz,g,false);ga.rotation.y=-Math.PI/2;});
   mesh(xf(new T.CylinderGeometry(.018,.022,.5,6),0,0,0,0,0,.9),M.black,.5,1.3,.38,g);
   mesh(new T.CylinderGeometry(.01,.012,.32,5),M.black,.25,1.25,0,g).rotation.z=.2;mesh(new T.SphereGeometry(.025,6,5),M.black,.22,1.4,0,g);
   const foam=std({color:C(0x9a8a58),roughness:1});mesh(rbox(.3,.06,.28,.03),foam,.14,1.62,.38,g).rotation.z=.2;mesh(rbox(.36,.08,.4,.03),std({color:C(0x2e2a22),roughness:.7}),-.6,1.2,.38,g);
   /* jerrycan rolled into the back, bent bumper, side mirror, number plates, broken glass on the grass */
   jerrycan(-1.2,1.14,-.3,.6,g,Math.PI/2);
   const bp=g.children.find(m=>m.position&&Math.abs(m.position.x-2.12)<.01&&Math.abs(m.position.y-.5)<.01);if(bp){bp.rotation.set(.0,.18,.12);bp.position.z=.1;}
   {const mr=new T.Group();mr.position.set(.74,1.45,-.86);g.add(mr);mesh(new T.CylinderGeometry(.008,.008,.2,5),rm,0,.05,0,mr).rotation.z=.4;mesh(rbox(.03,.12,.16,.01),M.black,-.04,.16,-.04,mr);}
   const plT=tex(256,64,(c,w,h)=>{c.fillStyle='#d8d2c0';c.fillRect(0,0,w,h);c.strokeStyle='#222';c.lineWidth=4;c.strokeRect(3,3,w-6,h-6);c.fillStyle='#1a1a1a';c.font='bold 40px Arial';c.textAlign='center';c.fillText('К 417 ВН',128,47);pix2(c,w,h,.6);},{clamp:true});
   const plM=std({map:plT,roughness:.8,polygonOffset:true,polygonOffsetFactor:-2});
   mesh(new T.PlaneGeometry(.34,.085),plM,2.18,.42,.1,g,false).rotation.set(.1,Math.PI/2,.12);mesh(new T.PlaneGeometry(.34,.085),plM,-2.12,.72,-.3,g,false).rotation.y=-Math.PI/2;
   const glassM=std({color:C(0x9fb0a8),roughness:.24,metalness:0,transparent:true,opacity:.6,side:T.DoubleSide,envMapIntensity:.5});
   for(let i=0;i<14;i++){const a=hash(i,1)*6.28,r=.3+hash(i,2)*1.1;const sx=x+Math.cos(a)*r+1.2,sz=z+Math.sin(a)*r+1.0;const t=new T.Mesh(new T.CircleGeometry(.02+hash(i,3)*.03,3),glassM);t.position.set(sx,H(sx,sz)+.03,sz);t.rotation.set(-Math.PI/2,0,hash(i,4)*6);scene.add(t);}}
  g.updateWorldMatrix(true,true);solidFrom(g);g.traverse(m=>{if(m.isMesh)shootables.push(m);});return g;}
uazWreck(-26,-323);
/* what is actually hot out here: a handful of small fragments of the bomb's core - dull black metal crusted with yellow-
   green oxide, the largest no bigger than a matchbox, half pressed into the soil - and the rusting junk that lay where they
   fell and took the contamination: a torn piece of the bomb casing, a shielded source container lying open, a bucket and
   a shovel left by whoever tried to clear it. A liquidator's stake with a radiation tag marks each spot. */
(function hotspotProps(){const r=rng(9071),rr=(a,b)=>a+(b-a)*r();
  const oxide=std({color:C(0xffffff),roughness:.62,metalness:.55,vertexColors:true});
  const fragGeo=k=>{const g=new T.DodecahedronGeometry(1,0).toNonIndexed();const p=g.attributes.position,col=[];const sx=rr(.6,1.4),sy=rr(.35,.7),sz=rr(.6,1.3);
    for(let i=0;i<p.count;i++){const v=V3(p.getX(i),p.getY(i),p.getZ(i));const j=.75+hash(i+k*31,k)*.5;p.setXYZ(i,v.x*sx*j,v.y*sy*j,v.z*sz*j);}
    g.computeVertexNormals();for(let i=0;i<p.count;i+=3){const ox=hash(i+k*7,3)<.45;const c=ox?[.62+hash(i,k)*.12,.6+hash(i,k+1)*.1,.2]:[.16,.16,.15];for(let q=0;q<3;q++)col.push(c[0],c[1],c[2]);}
    g.setAttribute('color',new T.Float32BufferAttribute(col,3));return g;};
  const rustD=M.rust.clone();rustD.side=T.DoubleSide;
  const sunk=(o,x,z,dy)=>{o.position.set(x,H(x,z)+dy,z);scene.add(o);return o;};
  hotspots.forEach((h,hi)=>{if(!h.frag)return;
    /* the fragments: four to seven, within a metre or so of where the biggest one hit */
    const n=4+(r()*4|0);for(let k=0;k<n;k++){const a=r()*6.28,d=Math.pow(r(),1.4)*1.3,x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d,s=k===0?rr(.03,.045):rr(.008,.025);
      const m=new T.Mesh(fragGeo(hi*10+k),oxide);m.scale.setScalar(s);m.rotation.set(rr(-.5,.5),r()*6.28,rr(-.5,.5));m.castShadow=true;m.receiveShadow=true;sunk(m,x,z,s*.15);}
    /* a liquidators' warning sign at the spot: a full-size painted steel plate on a leaning post */
    {const x=h.x+rr(-2.6,2.6),z=h.z+rr(-2.6,2.6);const g=new T.Group();sunk(g,x,z,0);g.rotation.set(rr(-.08,.08),r()*6.28,rr(-.1,.1));
      mesh(new T.CylinderGeometry(.035,.04,1.9,16),M.rust,0,.85,0,g);
      const pl=mesh(rbox(.62,.46,.012,.006),std({color:C(0x6a6458),roughness:.7,metalness:.4}),0,1.52,.03,g);
      mesh(new T.PlaneGeometry(.6,.44),std({map:TX.radSign,roughness:.7,metalness:.25}),0,1.52,.0375,g,false);
      [-1,1].forEach(k=>mesh(rbox(.05,.03,.04,.01),M.rust,0,1.52+k*.16,.012,g));solids.push({cx:x,cz:z,r:.1});}
    const kind=[[0,1,3],[0,2,4],[1,3]][hi%3];
    kind.forEach((kd,ii)=>{const a=ii*2.1+r(),d=rr(1.2,3.2),x=h.x+Math.cos(a)*d,z=h.z+Math.sin(a)*d;const g=new T.Group();sunk(g,x,z,0);g.rotation.y=r()*6.28;
      if(kd===0){/* a torn, buckled piece of the casing wall */const cg=new T.CylinderGeometry(.21,.21,.38,14,4,true,0,rr(1.3,1.9));const p=cg.attributes.position;
        for(let i=0;i<p.count;i++){const y=p.getY(i);p.setX(i,p.getX(i)*(1+Math.sin(y*14+i)*.04));p.setZ(i,p.getZ(i)*(1+Math.cos(y*9)*.05));p.setY(i,y+(Math.abs(y)>.17?(hash(i,7)-.5)*.06:0));}cg.computeVertexNormals();
        const m=mesh(cg,rustD,0,.06,0,g);m.rotation.set(Math.PI/2-.15,0,rr(-.3,.3));}
      else if(kd===1){/* the source container: a squat steel pot, tipped over, its lid lying a pace away */
        const c=mesh(lathe([[0,0],[.13,0],[.135,.01],[.135,.22],[.12,.23],[.09,.23],[.09,.2],[0,.2]],20),M.rust,0,.135,0,g);c.rotation.set(0,0,Math.PI/2-.08);
        [[-1],[1]].forEach(([sd])=>mesh(new T.TorusGeometry(.03,.007,5,10,Math.PI),M.rust,.11,.135+sd*.13,0,g).rotation.set(0,Math.PI/2,0));
        const ld=mesh(new T.CylinderGeometry(.12,.12,.025,20),M.rust,.42,.0125,.18,g);ld.rotation.set(rr(-.1,.1),0,rr(-.1,.1));}
      else if(kd===2){/* a bucket, rusted through at the bottom */const b=mesh(lathe([[.1,0],[.105,.004],[.14,.26],[.146,.268],[.14,.27]],18),rustD,0,.14,0,g);b.rotation.set(0,0,Math.PI/2+.2);}
      else if(kd===3){/* a liquidator's shovel: rotten handle, rusted blade */const sh=mesh(new T.CylinderGeometry(.018,.02,1.1,7),std({map:TX.bark,color:C(0x8a7a62),roughness:1}),0,.03,0,g);sh.rotation.set(0,0,Math.PI/2);
        const bl=mesh(new T.BoxGeometry(.24,.004,.2),rustD,-.66,.012,0,g);bl.rotation.y=.05;}
      else{/* a length of pipe */const pp=mesh(new T.CylinderGeometry(.04,.04,.9,12,1,true),rustD,0,.04,0,g);pp.rotation.set(0,0,Math.PI/2);}
      g.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});});});})();

/* ---------- the izba ---------- */
(function house(){const h=new T.Group();h.position.set(HX,0,HZ);scene.add(h);const W=7,D=6,LR=.125,LS=.215,NL=12;const top=FL+.11+NL*LS;
  mesh(rbox(W+.3,FL-.02,D+.3,.04),M.concrete,0,(FL-.02)/2-.02,0,h);
  const logs=[];const open={front:[[-.95,.05,FL,FL+2.05],[-2.7,-1.7,FL+.9,FL+2.0],[1.7,2.7,FL+.9,FL+2.0]],back:[[1.0,2.0,FL+.9,FL+2.0]],east:[[-.5,.5,FL+.9,FL+2.0]],west:[]};
  /* (hewn logs as in the village: out of round, tapering, capped with their end grain) */const fq=rng(8181),fcaps=[];
  const addLog=(axis,c,a0,a1,y)=>{const L=a1-a0;if(L<.05)return;const lo=axis==='x'?hqLog(V3(a0,y,c),V3(a1,y,c),LR,fq,{rs:12,seg:2.0,bow:.012,taper:.04}):hqLog(V3(c,y,a0),V3(c,y,a1),LR,fq,{rs:12,seg:2.0,bow:.012,taper:.04});logs.push(lo.side);fcaps.push(lo.cap);};
  for(let k=0;k<NL;k++){const y=FL+.11+k*LS;const ov=.28;
    [['front',D/2,'x'],['back',-D/2,'x'],['east',W/2,'z'],['west',-W/2,'z']].forEach(([nm,c,axis])=>{const half=(axis==='x'?W:D)/2;const ext=((k%2===0)===(axis==='x'))?ov:0;
      let segs=[[-half-ext,half+ext]];open[nm].forEach(o=>{if(y+LR*.5<o[2]||y-LR*.5>o[3])return;const ns=[];segs.forEach(s=>{if(o[1]<=s[0]||o[0]>=s[1]){ns.push(s);return;}if(o[0]>s[0])ns.push([s[0],o[0]]);if(o[1]<s[1])ns.push([o[1],s[1]]);});segs=ns;});
      const yy=axis==='x'?y:y+LS/2;segs.forEach(s=>addLog(axis,c,s[0],s[1],yy));});}
  /* sill logs under the half-course-raised east/west walls (otherwise light shows between the floor and the first log),
     and a top plate on the front/back walls so they meet the ceiling */
  addLog('z',W/2,-D/2,D/2,FL+.11-LS/2);addLog('z',-W/2,-D/2,D/2,FL+.11-LS/2);
  addLog('x',D/2,-W/2-.28,W/2+.28,FL+.11+NL*LS);addLog('x',-D/2,-W/2-.28,W/2+.28,FL+.11+NL*LS);
  const lm=mesh(merge(logs),LOGM,0,0,0,h);shootables.push(lm);mesh(merge(fcaps),memo('logEndM',()=>std({map:TX.endgrain,color:C(0xb8a888),roughness:.95,envMapIntensity:.2})),0,0,0,h);
  /* collision walls */
  const sx=HX,sz=HZ;solidAABB(sx-W/2-.15,sx+W/2+.15,sz-D/2-.15,sz-D/2+.15);solidAABB(sx-W/2-.15,sx-W/2+.15,sz-D/2,sz+D/2);solidAABB(sx+W/2-.15,sx+W/2+.15,sz-D/2,sz+D/2);
  solidAABB(sx-W/2,sx-.95,sz+D/2-.15,sz+D/2+.15);solidAABB(sx+.05,sx+W/2,sz+D/2-.15,sz+D/2+.15);
  /* floor & ceiling */
  const fl=mesh(rbox(W-.2,.06,D-.2,.01),M.planks,0,FL,0,h);fl.material=(()=>{const m=M.planks.clone();const rp=t=>{const c=t.clone();c.needsUpdate=true;c.repeat.set(2,1.6);return c;};m.map=rp(PB.planks.a);m.normalMap=rp(PB.planks.n);m.roughnessMap=rp(PB.planks.r);m.envMapIntensity=.2;return m;})();shootables.push(fl);
  mesh(rbox(W-.1,.06,D-.1,.01),M.planks,0,top-.05,0,h);
  /* door, opens inward */
  const door=new T.Group();door.position.set(-.95,FL,D/2-.02);h.add(door);
  mesh(rbox(1.0,2.02,.06,.01),M.boards,.5,1.01,0,door);[.3,1.7].forEach(y=>mesh(rbox(.9,.12,.04,.01),M.boards,.5,y,-.05,door));mesh(new T.SphereGeometry(.03,8,6),M.rust,.88,1.0,.05,door);
  S.door={g:door,open:false,solid:solidAABB(sx-.95,sx+.05,sz+D/2-.12,sz+D/2+.12)};
  interact.push({obj:door,off:V3(.5,1,0),label:'Open door',r:2.2,fn(){S.door.open=!S.door.open;this.label=S.door.open?'Close door':'Open door';const dp=door.getWorldPosition(V3());dp.y+=1;doorSound(S.door.open,dp,7);}});
  /* windows with carved frames and shutters */
  const win=(x,z,ry,broken)=>{const g=new T.Group();g.position.set(x,FL+1.45,z);g.rotation.y=ry;h.add(g);
    [[0,.58,1.2,.1],[0,-.6,1.25,.12],[-.55,0,.1,1.25],[.55,0,.1,1.25]].forEach(b=>mesh(rbox(b[2],b[3],.07,.01),M.trimWhite,b[0],b[1],.15,g));
    const ped=new T.Shape();ped.moveTo(-.7,0);ped.lineTo(.7,0);ped.lineTo(.5,.22);ped.quadraticCurveTo(0,.42,-.5,.22);ped.closePath();
    mesh(new T.ExtrudeGeometry(ped,{depth:.04,bevelEnabled:false}),M.trimWhite,0,.62,.13,g);
    mesh(rbox(.08,1.15,.04,.01),M.blue,0,0,.06,g);mesh(rbox(1,.06,.04,.01),M.blue,0,.15,.06,g);
    if(!broken)mesh(new T.PlaneGeometry(1,1.1),M.glass,0,0,.04,g);else{const sh=new T.Shape();sh.moveTo(-.5,-.55);sh.lineTo(.5,-.55);sh.lineTo(.5,-.1);sh.lineTo(.1,-.3);sh.lineTo(-.2,.1);sh.lineTo(-.5,-.2);sh.closePath();mesh(new T.ShapeGeometry(sh),M.glass,0,0,.04,g);}
    [-1,1].forEach(s=>{const sh=new T.Group();sh.position.set(s*.62,0,.178);g.add(sh);sh.rotation.y=-s*(broken&&s>0?.95:.1);if(broken&&s>0)sh.rotation.z=-.12;mesh(rbox(.55,1.15,.04,.01),M.blue,s*.29,0,0,sh);mesh(rbox(.4,.06,.05,.01),M.trimWhite,s*.29,.3,0,sh);});
    mesh(rbox(1.1,.05,.25,.01),M.boards,0,-.6,-.2,g);return g;};
  win(-2.2,D/2,0,false);win(2.2,D/2,0,true);win(1.5,-D/2,Math.PI,false);win(W/2,0,Math.PI/2,true);
  /* roof: corrugated asbestos-cement sheets */
  const ridge=top+1.6,eave=top-.2,ez=D/2+.55,slope=Math.hypot(ez,ridge-eave),pitch=Math.atan2(ridge-eave,ez);
  const sheet=G('sheet',()=>{const g=new T.PlaneGeometry(1.12,slope,28,1);const p=g.attributes.position;for(let i=0;i<p.count;i++)p.setZ(i,Math.sin(p.getX(i)/.167*Math.PI*2)*.018);g.computeVertexNormals();return g;});
  [-1,1].forEach(s=>{for(let i=0;i<8;i++){if(s>0&&i===5)continue;const x=-4.1+.55+i*1.03;const m=mesh(sheet,M.slate,x,(ridge+eave)/2,s*ez/2,h);m.rotation.set(-s*(Math.PI/2-pitch),0,0);if(s<0)m.rotation.set(Math.PI/2-pitch,0,0);
    if(s>0&&i===6){m.position.y-=.3;m.position.z+=.4;m.rotation.z=.06;}shootables.push(m);}});
  mesh(rbox(W+1.2,.08,.36,.02),M.slate,0,ridge+.02,0,h);
  /* the gables, each with its loft hatch (a small plank door in a cased opening, on strap hinges): shut at one end, and
     at the other hanging open, the loft behind it - the boarded underside of the roof, a rafter foot, old hay on the
     floor - dim, but not a hole */
  [-1,1].forEach(s=>{const gs=new T.Shape();gs.moveTo(-D/2-.1,0);gs.lineTo(D/2+.1,0);gs.lineTo(0,ridge-top+.05);gs.closePath();const op=s<0,hy=.62;
    if(op){const hp=new T.Path();hp.moveTo(-.24,hy-.27);hp.lineTo(.24,hy-.27);hp.lineTo(.24,hy+.27);hp.lineTo(-.24,hy+.27);hp.closePath();gs.holes.push(hp);}
    const gg=new T.ExtrudeGeometry(gs,{depth:.05,bevelEnabled:false});worldUV(gg,1);
    const gm=mesh(gg,M.boards,s*(W/2+.05),top-.02,0,h);gm.rotation.y=s*Math.PI/2;
    const hg=new T.Group();hg.position.set(s*(W/2+.1),top-.02+hy,0);hg.rotation.y=s*Math.PI/2;h.add(hg);
    [[0,.3,.64,.07],[0,-.3,.64,.07],[-.285,0,.07,.53],[.285,0,.07,.53]].forEach(([x,y,w,hh])=>mesh(rbox(w,hh,.035,.006),M.post,x,y,.017,hg));
    mesh(rbox(.72,.05,.07,.01),M.post,0,.36,.035,hg);
    const iron=memo('strapIron',()=>std({color:C(0x2c2a28),roughness:.55,metalness:.7}));
    if(op){const lb=new T.BoxGeometry(.48,.54,.9);lb.translate(0,0,-.47);mesh(lb,memo('loftIn',()=>std({map:M.boards.map,color:C(0x4a4238),roughness:1,side:T.BackSide})),0,0,0,hg,false);
      mesh(rbox(.48,.09,.1,.01),M.post,0,.2,-.6,hg).rotation.z=.0;const hay=new T.BoxGeometry(.46,.06,.8,6,1,6);const hp_=hay.attributes.position;for(let i=0;i<hp_.count;i++)if(hp_.getY(i)>0)hp_.setY(i,hp_.getY(i)+Math.sin(hp_.getX(i)*17+hp_.getZ(i)*9)*.025);hay.computeVertexNormals();
      mesh(hay,memo('loftHay',()=>std({map:PB.dry.a,color:C(0x8a7a52),roughness:1})),0,-.24,-.48,hg,false);}
    const dr=new T.Group();dr.position.set(-.25,0,.04);dr.rotation.y=op?-1.25:0;hg.add(dr);
    for(let k=0;k<3;k++)mesh(rbox(.162,.52,.025,.004),M.boards,.085+k*.165,0,0,dr);
    mesh(rbox(.46,.06,.02,.004),M.boards,.25,.17,-.022,dr);mesh(rbox(.46,.06,.02,.004),M.boards,.25,-.17,-.022,dr);const zb=rbox(.5,.055,.02,.004);zb.rotateZ(Math.atan2(.34,.4));mesh(zb,M.boards,.25,0,-.022,dr);
    [.16,-.16].forEach(y=>mesh(rbox(.3,.03,.006,.002),iron,.12,y,.016,dr));mesh(rbox(.03,.09,.012,.003),iron,.27+.04,0,op?.06:.04,hg);});
  /* chimney + porch */
  mesh(rbox(.5,2.2,.5,.03),std({map:TX.whitewash,color:C(0x9a8a7a),roughness:1}),2.5,ridge-.2,-1.9,h);
  const porch=new T.Group();porch.position.set(-.45,0,D/2+.75);h.add(porch);
  mesh(rbox(1.8,.08,1.3,.01),M.boards,0,FL-.04,0,porch);mesh(rbox(1.8,.06,.32,.01),M.boards,0,FL*.5,.75,porch);
  [-.85,.85].forEach(x=>{mesh(rbox(.1,2.3,.1,.01),M.post,x,1.3,.55,porch);});
  const pr=mesh(rbox(2.2,.05,1.6,.01),M.slate,0,2.5,.1,porch);pr.rotation.x=.18;
  /* ---- interior: a coherent izba layout - Russian stove in the back corner with the kitchen side by it (fridge,
     washstand by the door), the "red corner" diagonally opposite with the icon over the table and bench, bed along
     the west wall, wardrobe in the back-west corner. The door swings over a clear patch of floor. ---- */
  russianStove(h,2.52,FL,-1.95,top-FL-.06);solidAABB(sx+1.72,sx+3.32,sz-2.9,sz-.95);
  zilFridge(h,.55,FL,-2.5,0);solidAABB(sx+.2,sx+.9,sz-2.9,sz-2.15);
  wardrobe(h,-W/2+.45,FL,-2.05,Math.PI/2);solidAABB(sx-W/2+.1,sx-W/2+.8,sz-2.7,sz-1.4);
  washstand(h,.75,FL,D/2-.33,Math.PI);solidAABB(sx+.45,sx+1.05,sz+D/2-.55,sz+D/2-.1);
  wallClock(h,-2.1,FL+1.85,-D/2+.15,0);
  ragRunner(h,-.3,FL+.034,.3,3.0,.72,.06);
  /* iron bed */
  const bed=new T.Group();bed.position.set(-W/2+.62,FL,.85);h.add(bed);const iron=std({map:PB.rustpaint.a,normalMap:PB.rustpaint.n,roughnessMap:PB.rustpaint.r,color:C(0x4a5056),roughness:1,metalness:.6,envMapIntensity:.6});
  [[-.45,-1.0],[.45,-1.0],[-.45,1.0],[.45,1.0]].forEach(p=>mesh(new T.CylinderGeometry(.018,.018,p[1]<0?1.0:.75,6),iron,p[0],p[1]<0?.5:.375,p[1],bed));
  [-1.0,1.0].forEach(z=>{mesh(xf(new T.CylinderGeometry(.015,.015,.9,6),0,0,0,0,0,Math.PI/2),iron,0,z<0?.95:.7,z,bed);for(let i=0;i<5;i++)mesh(new T.CylinderGeometry(.008,.008,.35,4),iron,-.36+i*.18,z<0?.78:.55,z,bed);});
  [-.45,.45].forEach(x=>mesh(xf(new T.CylinderGeometry(.015,.015,2,6),0,0,0,Math.PI/2,0,0),iron,x,.42,0,bed));
  mesh(rbox(.88,.14,1.92,.05),std({map:TX.cloth,color:C(0x8a7f6a),roughness:1}),0,.5,0,bed);mesh(rbox(.5,.1,.3,.05),std({map:TX.cloth,color:C(0xb0a890),roughness:1}),0,.6,-.78,bed);
  /* blanket half pulled off, hanging over the side */
  {const bg=new T.PlaneGeometry(1.0,1.3,10,14);const p=bg.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i),v=p.getY(i);const over=Math.max(0,u-.38);p.setXYZ(i,Math.min(u,.42)+Math.sin(over*3)*.02,.58-Math.max(0,over)*1.0+Math.sin(v*9+u*5)*.012,v);}
   bg.computeVertexNormals();mesh(bg,std({map:TX.cloth,color:C(0x5a4a5a),roughness:1,side:T.DoubleSide}),-.05,0,.25,bed,true);}
  solidAABB(sx-W/2+.15,sx-W/2+1.1,sz+.85-1.05,sz+.85+1.05);
  /* table with oilcloth in the red corner, bench under the window, chairs */
  const table=new T.Group();table.position.set(-2.72,FL,2.3);h.add(table);
  mesh(rbox(1.12,.05,.76,.01),M.boards,0,.74,0,table);mesh(rbox(1.16,.006,.8,.002),std({map:KLEENKA,roughness:.35,envMapIntensity:.6}),0,.768,0,table);
  [[-.5,-.32],[.5,-.32],[-.5,.32],[.5,.32]].forEach(p=>mesh(rbox(.05,.72,.05,.01),M.boards,p[0],.36,p[1],table));mesh(rbox(1.0,.08,.03,.01),M.boards,0,.66,.33,table);
  solidAABB(sx-3.3,sx-2.14,sz+1.9,sz+2.7);
  mesh(rbox(1.3,.05,.3,.01),M.boards,-2.65,FL+.45,D/2-.3,h);[-3.2,-2.1].forEach(x=>mesh(rbox(.05,.43,.28,.01),M.boards,x,FL+.22,D/2-.3,h));
  const chair=(x,z,ry,fall)=>{const c=new T.Group();c.position.set(x,FL,z);c.rotation.y=ry;h.add(c);if(fall){c.rotation.set(0,ry,Math.PI/2);c.position.y=FL+.22;}
    mesh(rbox(.42,.04,.42,.01),M.boards,0,.45,0,c);mesh(rbox(.42,.45,.04,.01),M.boards,0,.7,-.2,c);[[-.18,-.18],[.18,-.18],[-.18,.18],[.18,.18]].forEach(p=>mesh(rbox(.035,.45,.035,.005),M.boards,p[0],.225,p[1],c));};
  chair(-1.95,2.15,-Math.PI/2+.2,false);chair(.15,1.55,-1.2,true);
  /* shelf with jars on the east wall, icon corner, calendar */
  mesh(rbox(.28,.04,1.2,.01),M.boards,W/2-.3,FL+1.6,1.2,h);
  mesh(new T.CylinderGeometry(.09,.11,.16,12),M.enamel,W/2-.3,FL+1.7,.9,h);
  [1.25,1.4,1.55].forEach(z=>mesh(new T.CylinderGeometry(.045,.045,.16,20),M.glass,W/2-.3,FL+1.7,z,h));
  {const cg=ICON.corner(h,-W/2+.16,FL+1.6,D/2-.16,Math.PI*.75,{kinds:['christ','kazan','nicholas'],riza:true});lampada(cg,0,-.005,.5);}
  mesh(new T.PlaneGeometry(.28,.42),M.calendar,-1,FL+1.55,-D/2+.15,h);
  /* papers: a newspaper, letters and an evacuation order scattered from the table and the wardrobe */
  [['news',3,-2.2,1.55,.6],['letter',4,-2.9,.0,2.2],['form',5,-.8,-.25,1.1],['news',6,.3,-1.3,-.4],['letter',8,-1.6,-1.8,2.9],['form',9,-3.0,-1.0,.3]].forEach(([k,sd,px,pz,rt])=>paperMesh(h,k,sd,px,FL+.036,pz,rt));
  paperMesh(h,'letter',12,-2.8,FL+.772,2.35,.25,.9);
  for(let i=0;i<14;i++){const s=mesh(new T.PlaneGeometry(rnd(.03,.09),rnd(.03,.09)),M.glass,2.2+rnd(-.5,.5),FL+.035,D/2-rnd(.1,.7),h);s.rotation.set(-Math.PI/2,0,rnd(6));}
  const lamp=mesh(lathe([[0,0],[.05,0],[.06,.05],[.04,.1],[.02,.12],[.035,.16],[.04,.22],[.02,.26],[0,.26]],12),M.glass,-3.0,FL+.77,2.5,h);
  /* faint light so the room reads before the flashlight comes on */
  const fill=new T.PointLight(C(0x9aa4b0),.35,7,2);fill.position.set(0,FL+2.1,0);h.add(fill);
  /* ---- the dead ---- */
  const place=(rig,x,y,z,rx,ry,stain)=>{const w=new T.Group();w.position.set(x,y,z);w.rotation.y=ry;h.add(w);rig.root.rotation.x=rx;w.add(rig.root);
    if(stain){const s=mesh(new T.CircleGeometry(stain,20),M.stain,x,FL+.033,z,h,false);s.rotation.x=-Math.PI/2;s.scale.set(1,.6+R()*.4,1);}return w;};
  const wy=ly=>h.localToWorld(V3(0,ly,0)).y;
  const c1=buildHuman({char:'oldman',outfit:'telogreika'});pose(c1,POSE.bedDead);c1.P.hips.rotation.set(...POSE.bedDead.hips);const w1=place(c1,-W/2+.62,FL+.7,1.78,-Math.PI/2,0,0);restOn(c1,wy(FL+.565),w1);
  const c2=buildHuman({char:'plaid',outfit:'plaid'});pose(c2,POSE.sitDead);const w2=place(c2,1.58,FL-.83,-1.75,0,-Math.PI/2,0);restOn(c2,wy(FL+.035),w2);if(BAKED.sitDead_plaid){pose(c2,BAKED.sitDead_plaid);restOn(c2,wy(FL+.035),w2);}else{const fy=wy(FL+.035);settleBody(c2,()=>fy);}
  const c3=buildHuman({char:'patrol',outfit:'ratnik',vest:true});pose(c3,POSE.proneDead);const w3=place(c3,-.15,FL+.21,-.75,Math.PI/2,.35,0);restOn(c3,wy(FL+.035),w3);if(BAKED.proneDead_patrol){pose(c3,BAKED.proneDead_patrol);restOn(c3,wy(FL+.035),w3);}else{const fy=wy(FL+.035);settleBody(c3,()=>fy);restOn(c3,fy,w3);}
  /* blood: placed from the posed bodies - pooled under the wounds and run along the boards, soaked into the mattress and
     dripping off it, smeared down the stove where the man slid, spatter by the soldier */
  {h.updateMatrixWorld(true);const loc=(rig,b)=>h.worldToLocal(rig.P.bones[b].getWorldPosition(new T.Vector3()));
   /* blood is placed from where the bodies actually lie (their posed bones), sized like real pools (0.5-0.9 m) */
   const sp1=loc(c1,'spine'),hn1=loc(c1,'wrR');bloodDecal(h,'bed',21,sp1.x+.05,FL+.578,sp1.z+.05,.8,.8,.4);
   bloodDecal(h,'pool',23,hn1.x,FL+.037,hn1.z,.55,.48,.2);bloodDecal(h,'spatter',24,hn1.x+.05,FL+.038,hn1.z-.05,.28,.28,1.1);
   const hp2=loc(c2,'hips'),sp2=loc(c2,'spine');bloodDecal(h,'smear',25,1.735,FL+.5,-1.75,.55,.8,-Math.PI/2,true);bloodDecal(h,'pool',26,(hp2.x+sp2.x)/2,FL+.037,(hp2.z+sp2.z)/2,1.15,.9,.1);
   const sp3=loc(c3,'spine'),hd3=loc(c3,'head');bloodDecal(h,'pool',27,hd3.x+(hd3.x-sp3.x)*.15,FL+.039,hd3.z+(hd3.z-sp3.z)*.15,1.05,.85,.06);bloodDecal(h,'spatter',28,hd3.x+(hd3.x-sp3.x)*.6,FL+.04,hd3.z+(hd3.z-sp3.z)*.6,.6,.6,2.3);}
  const hm=new T.Group();h.add(hm);hm.position.set(.7,FL+.07,.9);hm.rotation.set(2.6,.4,.2);
  hm.add(looseHelmet('patrol'));
  CORPSES.push([sx-W/2+.62,sz+.85],[sx+1.38,sz-1.75],[sx-.15,sz-.75]);
  window.__house={c1,c2,c3,w1,w2,w3,h};
  const flyG=new T.BufferGeometry();const fp=new Float32Array(3*60);flyG.setAttribute('position',new T.BufferAttribute(fp,3));
  const flies=new T.Points(flyG,new T.PointsMaterial({color:0x050505,size:.018,sizeAttenuation:true}));scene.add(flies);S.flies={pts:flies,arr:fp,ph:Array.from({length:60},()=>[R()*6,R()*6,R()*.5+.3,Math.floor(R()*3)])};
  interact.push({obj:w3,off:V3(0,.3,0),label:'Search the body',r:2,once:true,fn(){searchSoldier();}});
  /* loot inside */
  /* the soldier's rifle stays here with him; the rest of what is worth having is spread through the village houses (08e) */
  LOOT.push({id:'ak',x:sx-W/2+.32,y:FL+.03,z:sz-.85,rot:[Math.PI/2,0,.17],order:'ZXY'},{id:'vodka',x:sx-W/2+1.3,y:FL+.03,z:sz+.2});
})();
/* yard: fence, shed, well, woodpile, bathtub */
(function yard(){const x1=HX-9,x2=HX+9,z1=HZ-8,z2=HZ+10;const board=G('picket',()=>rbox(.1,1.1,.025,.008));const n=[];
  const run=(ax,az,bx,bz,gap)=>{const L=Math.hypot(bx-ax,bz-az),k=Math.floor(L/.16);for(let i=0;i<k;i++){const t=(i+.5)/k;const x=lerp(ax,bx,t),z=lerp(az,bz,t);if(gap&&gap(x,z))continue;if(hash(x*3,z*3)<.12)continue;n.push([x,z,Math.atan2(bx-ax,bz-az)+Math.PI/2,hash(x,z)<.1]);}};
  const gate=(x,z)=>Math.abs(x-HX+.45)<1.1;
  run(x1,z2,x2,z2,gate);run(x1,z1,x2,z1,(x)=>x>HX+2&&x<HX+5);run(x1,z1,x1,z2);run(x2,z1,x2,z2,(x,z)=>z>HZ-2&&z<HZ+1);
  const m=new T.InstancedMesh(board,M.boards,n.length);const o=new T.Object3D();m.castShadow=m.receiveShadow=true;
  n.forEach((b,i)=>{o.position.set(b[0],.55+H(b[0],b[1]),b[1]);o.rotation.set(b[3]?.5:0,b[2],b[3]?.2:(hash(b[0],1)-.5)*.08);o.updateMatrix();m.setMatrixAt(i,o.matrix);});scene.add(m);
  /* wire rails: broken at the gate and the gaps (never across an opening), sagging between posts, on the terrain */
  {const segs=[];const span=(ax,az,bx,bz)=>{const L=Math.hypot(bx-ax,bz-az),k=Math.max(1,Math.round(L/2.4));
     for(let i=0;i<k;i++){const t0=i/k,t1=(i+1)/k;const p=V3(lerp(ax,bx,t0),0,lerp(az,bz,t0)),q=V3(lerp(ax,bx,t1),0,lerp(az,bz,t1));
       [.85,.3].forEach(hh=>segs.push(catenary(V3(p.x,H(p.x,p.z)+hh,p.z),V3(q.x,H(q.x,q.z)+hh,q.z),.03+hash(p.x,hh)*.05,6)));
       const po=mesh(G('fpost',()=>rbox(.08,1.15,.08,.01)),M.post,p.x,H(p.x,p.z)+.5,p.z,scene);po.rotation.z=(hash(p.x,p.z)-.5)*.06;}
     const po=mesh(G('fpost',()=>rbox(.08,1.15,.08,.01)),M.post,bx,H(bx,bz)+.5,bz,scene);};
   span(x1,z2,HX-1.6,z2);span(HX+.7,z2,x2,z2);span(x1,z1,HX+2,z1);span(HX+5,z1,x2,z1);span(x1,z1,x1,z2);span(x2,z1,x2,HZ-2);span(x2,HZ+1,x2,z2);
   lines(segs);}
  solidAABB(x1-.1,HX-1.6,z2-.1,z2+.1);solidAABB(HX+.7,x2+.1,z2-.1,z2+.1);solidAABB(x1-.1,x2+.1,z1-.1,z1+.1);solidAABB(x1-.1,x1+.1,z1,z2);solidAABB(x2-.1,x2+.1,z1,HZ-2);solidAABB(x2-.1,x2+.1,HZ+1,z2);
  const shed=new T.Group();shed.position.set(HX-6,0,HZ-4.5);shed.rotation.y=.05;scene.add(shed);
  /* lean-to shed: walls cut to the roof pitch so the roof sits on them all round (no gap under the high side) */
  {const tl=Math.tan(.18),yAt=z=>2.4-z*tl-.03;const pr=new T.Shape();pr.moveTo(-1.3,0);pr.lineTo(1.3,0);pr.lineTo(1.3,yAt(1.3));pr.lineTo(-1.3,yAt(-1.3));pr.closePath();
   const wg=new T.ExtrudeGeometry(pr,{depth:3,bevelEnabled:false});wg.rotateY(-Math.PI/2);wg.translate(1.5,0,0);worldUV(wg,.5);
   wg.computeVertexNormals();const wm=mesh(wg,M.boards,0,0,0,shed);
   /* rafters showing under the eaves */
   for(let i=0;i<5;i++){const r=mesh(rbox(.07,.09,3.0,.01),M.post,-1.35+i*.675,2.37,0,shed);r.rotation.x=.18;}}
  const sr=mesh(rbox(3.4,.05,3.1,.01),M.slate,0,2.42,0,shed);sr.rotation.x=.18;mesh(rbox(.9,1.8,.05,.01),M.boards,.6,.9,1.33,shed).rotation.y=.5;solidFrom(shed);
  const wp=new T.Group();wp.position.set(HX-6,0,HZ-2.6);scene.add(wp);for(let r=0;r<4;r++)for(let i=0;i<9;i++)mesh(G('logw',()=>xf(new T.CylinderGeometry(.07,.08,.6,16),0,0,0,Math.PI/2,0,0)),M.logs,-1.2+i*.17+(r%2)*.08,.08+r*.14,0,wp);
  const well=new T.Group();well.position.set(HX+7,0,HZ+6.5);scene.add(well);mesh(rbox(1.3,.9,1.3,.03),M.logs,0,.45,0,well);
  [-.55,.55].forEach(x=>mesh(rbox(.1,1.9,.1,.01),M.post,x,1.0,0,well));const wr=mesh(new T.ConeGeometry(1.05,.6,4),M.slate,0,2.1,0,well);wr.rotation.y=Math.PI/4;
  mesh(xf(new T.CylinderGeometry(.06,.06,1.1,16),0,0,0,0,0,Math.PI/2),M.post,0,1.4,0,well);solids.push({cx:HX+7,cz:HZ+6.5,r:.8});
  const tub=mesh(xf(lathe([[0,0],[.3,0],[.36,.1],[.38,.5],[.34,.52],[.3,.12],[0,.1]],18),0,0,0,0,0,0,1.9,1,1),M.rust,HX+6,0,HZ-6.2,scene);tub.rotation.set(.1,.6,.05);
})();
