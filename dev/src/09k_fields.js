/* ---------- the farmland on the drive, and the war across it. The hay meadow by the kolkhoz road: mown, raked into
   rows, fenced with posts and wire, the round bales standing where the baler dropped them (a few stacked by the gate, one
   burnt out where a shell landed among them). Out across the fields: the marks of tracked vehicles that crossed them,
   anti-tank hedgehogs and concrete teeth dragged up beside the road, and on the horizon the smoke of whatever is burning
   further on ---------- */
const FIELDS={plume:null,plumes:[]};
(function fields(){const r_=rng(5252),rr=(a,b)=>a+(b-a)*r_();const H_=HAYF;const W=(u,v)=>[H_.cx+H_.tx*u+H_.nx*v,H_.cz+H_.tz*u+H_.nz*v];
  /* round bale: wound hay on the side, the spiral on the ends, a little slumped and bellied; weathered grey-gold */
  const sideT=tex(512,256,(c,w,h)=>{c.fillStyle='#9c8a5c';c.fillRect(0,0,w,h);const q=rng(61);
    for(let i=0;i<5200;i++){const x=q()*w,y=q()*h,l=8+q()*26,a=(q()-.5)*.5;const k=q();c.strokeStyle=k<.4?`rgba(${190+q()*40|0},${168+q()*36|0},${104+q()*30|0},.7)`:k<.75?`rgba(${120+q()*30|0},${104+q()*24|0},${66+q()*18|0},.7)`:`rgba(${150+q()*20|0},${150+q()*20|0},${130+q()*20|0},.55)`;
      c.lineWidth=1+q()*1.4;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(a)*l,y+Math.sin(a)*l);c.stroke();}
    /* the net wrap, faint */c.strokeStyle='rgba(220,220,205,.18)';c.lineWidth=1;for(let k=-h;k<w;k+=14){c.beginPath();c.moveTo(k,0);c.lineTo(k+h,h);c.stroke();c.beginPath();c.moveTo(k+h,0);c.lineTo(k,h);c.stroke();}
    /* weathering: grey top, darker damp underside */const g=c.createLinearGradient(0,0,0,h);g.addColorStop(0,'rgba(140,140,130,.25)');g.addColorStop(.5,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(40,34,22,.35)');c.fillStyle=g;c.fillRect(0,0,w,h);},{rep:[1,1]});
  const endT=tex(256,256,(c,w,h)=>{c.fillStyle='#8e7c52';c.fillRect(0,0,w,h);const q=rng(62);
    for(let i=0;i<2600;i++){const t=q()*40,r=t/40*w*.48,a=t*6.283*0+q()*6.283;const x=w/2+Math.cos(a)*r,y=h/2+Math.sin(a)*r,l=6+q()*14;const ta=a+Math.PI/2+(q()-.5)*.3;
      c.strokeStyle=q()<.5?`rgba(${185+q()*40|0},${160+q()*36|0},${96+q()*30|0},.75)`:`rgba(${110+q()*30|0},${96+q()*24|0},${60+q()*18|0},.75)`;c.lineWidth=1.2;c.beginPath();c.moveTo(x,y);c.lineTo(x+Math.cos(ta)*l,y+Math.sin(ta)*l);c.stroke();}
    for(let k=1;k<9;k++){c.strokeStyle='rgba(60,50,30,.18)';c.lineWidth=2;c.beginPath();c.arc(w/2,h/2,k*w*.055,0,7);c.stroke();}},{clamp:true});
  const sideM=std({map:sideT,roughness:1,envMapIntensity:.15}),endM=std({map:endT,roughness:1,envMapIntensity:.15});
  const burnS=std({map:sideT,color:C(0x2a2622),roughness:1,envMapIntensity:.1}),burnE=std({map:endT,color:C(0x1e1a16),roughness:1,envMapIntensity:.1});
  const baleG=(()=>{const g=new T.CylinderGeometry(.74,.74,1.2,40,6,false);const p=g.attributes.position;for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),rad=Math.hypot(x,z);if(rad<1e-4)continue;
      const k=1+.035*Math.cos(y/1.2*Math.PI)-(Math.abs(y)>.59?.0:0);const sl=z<0?1-.04*(-z/.74):1;p.setXYZ(i,x*k,y,z*k*sl);}g.computeVertexNormals();g.rotateZ(Math.PI/2);return g;})();
  const bales=[];const bale=(x,z,yaw,burnt,dy=0)=>{const y=H(x,z);const m=new T.Mesh(baleG,burnt?[burnS,burnE,burnE]:[sideM,endM,endM]);m.position.set(x,y+.7+dy,z);m.rotation.set(0,yaw,rr(-.03,.03));m.castShadow=m.receiveShadow=true;scene.add(m);shootables.push(m);if(!dy)solids.push({cx:x,cz:z,r:.8});bales.push(m);return m;};
  /* where the baler dropped them: loosely along the rows */
  for(let k=0;k<16;k++){const u=rr(-H_.hl+6,H_.hl-6),v=-H_.hw+3+Math.floor(r_()*4)*4.2+rr(-.6,.6);const [x,z]=W(u,v);if(bales.some(b=>Math.hypot(b.position.x-x,b.position.z-z)<3))continue;bale(x,z,Math.atan2(H_.tx,H_.tz)+Math.PI/2+rr(-.25,.25),false);}
  /* a stack by the gate: three on the ground, two on top */
  {const [x,z]=W(-H_.hl+4,H_.hw-3.5);const yaw=Math.atan2(H_.tx,H_.tz);const ax=Math.sin(yaw),az=Math.cos(yaw);/* (side by side, across their axes) */for(let i=-1;i<=1;i++)bale(x+ax*i*1.5,z+az*i*1.5,yaw,false);
   for(const i of [-.5,.5]){bale(x+ax*i*1.5,z+az*i*1.5,yaw,false,1.27);}}
  /* where a shell landed among them: two burnt to black husks on a scorch */
  {const [x,z]=W(H_.hl*.45,-2);bale(x,z,rr(0,6),true);bale(x+2.2,z+1.1,rr(0,6),true);
   const st=tex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,8,w/2,h/2,w/2);g.addColorStop(0,'rgba(14,12,10,.9)');g.addColorStop(.6,'rgba(26,20,14,.6)');g.addColorStop(1,'rgba(26,20,14,0)');c.fillStyle=g;c.fillRect(0,0,w,h);},{clamp:true});
   const R0=4.5,g=new T.PlaneGeometry(R0*2,R0*2,10,10);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=x+1+p.getX(i),Z=z+.5+p.getZ(i);p.setXYZ(i,X,H(X,Z)+.03,Z);}g.computeVertexNormals();
   const m=new T.Mesh(g,std({map:st,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3}));m.renderOrder=2;m.receiveShadow=true;scene.add(m);}
  /* the fence: split posts every three metres, two strands of wire, a gap for the gate at the road end */
  {const bk=bucket();const wire=[];const post=std({map:TX.bark,color:C(0x8a7e6c),roughness:1,envMapIntensity:.15});const corners=[[-1,-1],[1,-1],[1,1],[-1,1]];
   for(let e=0;e<4;e++){const [a1,b1]=corners[e],[a2,b2]=corners[(e+1)%4];const A=W(a1*(H_.hl+1),b1*(H_.hw+1)),B=W(a2*(H_.hl+1),b2*(H_.hw+1));const L=Math.hypot(B[0]-A[0],B[1]-A[1]),n=Math.ceil(L/3);let prev=null;
     for(let i=0;i<=n;i++){const t=i/n,x=lerp(A[0],B[0],t),z=lerp(A[1],B[1],t);const gate=e===3&&t>.3&&t<.55;const y=H(x,z);
       if(!gate){const g=new T.CylinderGeometry(.055,.07,1.35,20);g.translate(0,.55,0);bk.add(g,post,TRS(x,y,z,rr(-.06,.06),rr(0,6),rr(-.06,.06)));}
       const P_={x,y,z,gate};if(prev&&!prev.gate&&!gate)[.5,.95].forEach(hh=>{const s=6;for(let k=0;k<s;k++){const u0=k/s,u1=(k+1)/s;const f=u=>[lerp(prev.x,x,u),lerp(prev.y,y,u)+hh-Math.sin(u*Math.PI)*.05,lerp(prev.z,z,u)];wire.push(...f(u0),...f(u1));}});prev=P_;}}
   bk.flush(scene,true);const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wire,3));scene.add(new T.LineSegments(wg,new T.LineBasicMaterial({color:C(0x3a352c)})));}
  /* tracked vehicles went across the fields: two parallel ribbons of crushed earth with the grouser pattern, in long
     curves, some across the road */
  {const tt=tex(64,256,(c,w,h)=>{c.clearRect(0,0,w,h);for(let y=0;y<h;y+=9){c.fillStyle='rgba(40,32,22,.75)';c.fillRect(4,y,w-8,5);c.fillStyle='rgba(70,58,40,.45)';c.fillRect(2,y+5,w-4,4);}
      const g=c.createLinearGradient(0,0,w,0);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.12,'rgba(0,0,0,0)');g.addColorStop(.88,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,1)');c.globalCompositeOperation='destination-out';c.fillStyle=g;c.fillRect(0,0,w,h);},{rep:[1,1]});
   tt.wrapS=T.ClampToEdgeWrapping;const tm=std({map:tt,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,envMapIntensity:.1});
   const D=ROADS.dr.P,s0=D[D.findIndex(p=>p.x<=262)].s;
   for(let k=0;k<5;k++){const i=D.findIndex(p=>p.s>=s0+rr(30,520));if(i<0)continue;const p0=D[i];let a=rr(0,6.28),x=p0.x+rr(-40,40),z=p0.z+rr(-25,25),cv=rr(-.006,.006);const pts=[];
     for(let s=0;s<220;s+=3){pts.push([x,z,a]);x+=Math.sin(a)*3;z+=Math.cos(a)*3;a+=cv*3+rr(-.004,.004);}
     for(const side of [-1.35,1.35]){const pos=[],uv=[],idx=[];pts.forEach(([px,pz,pa],j)=>{const nx=Math.cos(pa),nz=-Math.sin(pa);for(const e of [-.29,.29]){const X=px+nx*(side+e),Z=pz+nz*(side+e);const q=roadQuery(X,Z);pos.push(X,H(X,Z)+.035+(q.dT<4?.02:0),Z);uv.push(e<0?0:1,j*3/1.1);}
         if(j)idx.push((j-1)*2,(j-1)*2+1,j*2,(j-1)*2+1,j*2+1,j*2);});
       const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();const m=new T.Mesh(g,tm);m.renderOrder=2;m.receiveShadow=true;scene.add(m);}}}
  /* anti-tank obstacles dragged up beside the road: welded rail hedgehogs and concrete teeth */
  {const D=ROADS.dr.P,s0=D[D.findIndex(p=>p.x<=262)].s;const steel=std({map:PB.rust.a,normalMap:PB.rust.n,roughnessMap:PB.rust.r,color:C(0x6a5a4a),roughness:1,metalness:.5,envMapIntensity:.4});
   const conc=std({map:PB.concrete.a,normalMap:PB.concrete.n,roughnessMap:PB.concrete.r,color:C(0x9a968c),roughness:1,envMapIntensity:.3});
   const beam=(()=>{const s=new T.Shape();const w=.08,t=.012;s.moveTo(-w,-w);s.lineTo(w,-w);s.lineTo(w,-w+t);s.lineTo(t/2,-w+t);s.lineTo(t/2,w-t);s.lineTo(w,w-t);s.lineTo(w,w);s.lineTo(-w,w);s.lineTo(-w,w-t);s.lineTo(-t/2,w-t);s.lineTo(-t/2,-w+t);s.lineTo(-w,-w+t);s.closePath();
     const g=new T.ExtrudeGeometry(s,{depth:1.9,bevelEnabled:false});g.translate(0,0,-.95);return g;})();
   const hedge=(x,z,yaw)=>{const g=new T.Group();[[0,0,0],[Math.PI/2,0,0],[0,Math.PI/2,Math.PI/2]].forEach(([a,b,c])=>{const m=mesh(beam,steel,0,0,0,g);m.rotation.set(a+.62,b+.4,c);});g.position.set(x,H(x,z)+.62,z);g.rotation.set(rr(-.15,.15),yaw,rr(-.15,.15));scene.add(g);g.traverse(q=>{if(q.isMesh){q.castShadow=true;q.receiveShadow=true;shootables.push(q);}});solids.push({cx:x,cz:z,r:.9});};
   const tooth=(x,z,yaw)=>{const hp=HIPOLY;HIPOLY=false;const g=new T.CylinderGeometry(.08,.62,1.15,4,1);HIPOLY=hp;g.rotateY(Math.PI/4);const m=new T.Mesh(g,conc);m.position.set(x,H(x,z)+.5,z);m.rotation.set(rr(-.12,.12),yaw,rr(-.12,.12));m.castShadow=m.receiveShadow=true;scene.add(m);shootables.push(m);solids.push({cx:x,cz:z,r:.6});};
   for(const [ds,side,n] of [[90,1,4],[180,-1,3],[330,1,5],[455,-1,4]]){const i=D.findIndex(p=>p.s>=s0+ds);if(i<0)continue;const f=roadFrame(D,i);
     for(let k=0;k<n;k++){const off=side*rr(7,10),along=k*2.6+rr(-.4,.4);const x=D[i].x+f.nx*off+f.tx*along,z=D[i].z+f.nz*off+f.tz*along;if(roadQuery(x,z).dT<5.5)continue;(k%2?tooth:hedge)(x,z,rr(0,6.28));}}}
  /* smoke on the horizon: a few columns from fires somewhere past the fields, leaning with the wind, rising high */
  {FIELDS.plume=new PSys(420,PTEX.smoke,false,{order:2});FX.plume=FIELDS.plume;
   /* (smoke over a burning village shows through haze that hides the trees: the columns take a third of the fog) */
   thinFog(FIELDS.plume,.38);const D=ROADS.dr.P;
   [[60,-905],[-170,-910],[330,-860],[-420,-900]].forEach(([x,z],k)=>FIELDS.plumes.push({p:V3(x,0,z),t:rr(0,5),k:rr(.7,1.1)}));
   FIELDS.plumes.forEach(pl=>{pl.p.y=22;});}})();
function fieldsTick(dt){if(!FIELDS.plume)return;FIELDS.plume.mat.uniforms.uScale.value=FX.smoke.mat.uniforms.uScale.value;const on=S.chapter>=2&&camera.position.z<-380;if(!on)return;
  if(on)for(const pl of FIELDS.plumes){pl.t-=dt;if(pl.t<=0){pl.t=.55/pl.k;const p=pl.p.clone().add(V3(wr(-6,6),wr(0,6),wr(-6,6)));
      FIELDS.plume.spawn(p,V3(1.6+wr(-.4,.4),wr(3.2,4.6),.6+wr(-.3,.3)),wr(30,42),wr(12,18)*pl.k,wr(50,80)*pl.k,[.075,.07,.065,.95],[.24,.24,.23,0],{drag:.02,up:.05,spin:wr(-.05,.05),fi:.06});}}
}
window.__fields=FIELDS;FIELDS.tick=fieldsTick;
