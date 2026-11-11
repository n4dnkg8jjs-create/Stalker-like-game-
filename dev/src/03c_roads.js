/* road furniture: galvanised 76 mm pipe posts with a cap, sign blanks with a rolled rim, a grey back with two rails
   and clamp bands around the post */
let _GALV=null;const GALV=()=>_GALV||(_GALV=std({map:PB.galv.a,normalMap:PB.galv.n,roughnessMap:PB.galv.r,roughness:1,metalness:.75,envMapIntensity:.9,normalScale:new T.Vector2(.4,.4)}));
function signPost(g,x,z,h){const m=GALV();const pg=new T.CylinderGeometry(.038,.038,h+.4,16,1,true);worldUV(pg,1.6);mesh(pg,m,x,(h+.4)/2-.4,z,g);
  const cap=new T.SphereGeometry(.041,14,6,0,Math.PI*2,0,Math.PI/2);mesh(cap,std({color:C(0x2a2c2a),roughness:.5}),x,h,z,g);mesh(new T.CylinderGeometry(.041,.041,.03,14),std({color:C(0x2a2c2a),roughness:.5}),x,h-.015,z,g);
  /* concrete footing showing at the base */
  mesh(new T.CylinderGeometry(.12,.14,.1,12),std({map:PB.concrete.a,normalMap:PB.concrete.n,roughness:.95}),x,.0,z,g);}
function signPlate(g,w,h,map,posts=[0],tri=false){const sh=tri?(()=>{const q=new T.Shape();q.moveTo(0,-h/2);q.lineTo(w/2,h/2);q.lineTo(-w/2,h/2);q.lineTo(0,-h/2);return q;})():rboxShape(w,h,.03);
  const body=new T.ExtrudeGeometry(sh,{depth:.004,bevelEnabled:true,bevelThickness:.006,bevelSize:.008,bevelSegments:2,curveSegments:4});body.translate(0,0,-.002);
  mesh(body,GALV(),0,0,0,g);
  const fg=new T.ShapeGeometry(sh,4);{const p=fg.attributes.position,uv=fg.attributes.uv;for(let k=0;k<p.count;k++)uv.setXY(k,p.getX(k)/w+.5,p.getY(k)/h+.5);}
  const face=mesh(fg,std({map,transparent:false,roughness:.42,metalness:.05,envMapIntensity:.8}),0,0,.0085,g,false);face.scale.setScalar(tri?.9:.985);
  /* back rails and clamp bands */
  const rw=tri?w*.35:w*.86;[-.25,.25].forEach(f=>{const y=f*h*(tri?.6:1)+(tri?h*.12:0);mesh(rbox(rw,.035,.02,.004),GALV(),0,y,-.016,g);
    posts.forEach(px=>{const b=new T.TorusGeometry(.044,.006,6,16,Math.PI);b.rotateX(Math.PI/2);mesh(b,GALV(),px,y,-.07,g).rotation.y=Math.PI;mesh(rbox(.03,.03,.04,.004),GALV(),px,y,-.035,g);});});}
/* ---------- the old highway and the forest track: meshes, roadside furniture, and the forest along them ---------- */
/* asphalt (u across 7.24 m, v along the same): worn aggregate, wheel-path polish, long cracks and alligator cracking
   in the wheel paths, black crack-seal lines, darker patches, the odd pothole; worn edge lines and a dashed centre
   line; the edges crumble (alpha) into the gravel shoulder */
PB.asphalt=pbr(512,(u,v)=>{const a=N2(u,v,6,5),b=N2(u+.31,v,24,3),c=N2(u,v,96,2),e=N2(u+.7,v+.2,4,4);
  const [f1,f2]=wor(u,v,9,13),[g1,g2]=wor(u+.3,v,30,5),[p1]=wor(u+.11,v+.53,3,21);
  const wp=Math.max(Math.exp(-Math.pow((u-.27)/.07,2)),Math.exp(-Math.pow((u-.73)/.07,2)));
  /* cracking: a few long meandering cracks (cell edges only where a low-frequency mask allows), not a paving pattern */
  const crack=sstep(.018,0,f2)*sstep(.6,.7,N2(u+.5,v,3,3))*sstep(.2,.5,N2(u*.5,v*3,6,2));
  const allig=sstep(.03,0,g2)*wp*sstep(.6,.72,N2(u,v+.3,5,3));
  /* tar crack-seal along two long wandering longitudinal cracks; rectangular cut-and-patch repairs */
  const tp=6.2832,w1=.36+.04*Math.sin(v*tp*2+1)+.015*Math.sin(v*tp*7),w2=.63+.03*Math.sin(v*tp*3+2)+.012*Math.sin(v*tp*9);
  const seal=Math.max(sstep(.007,.003,Math.abs(u-w1))*sstep(.35,.5,N2(u,v,2,2)),sstep(.006,.0025,Math.abs(u-w2))*sstep(.55,.65,N2(u+.4,v,2,2)));
  const rect=(u0,u1,v0,v1)=>{const n=(N2(u,v,24,2)-.5)*.012;return sstep(u0-.004,u0+.004,u+n)*(1-sstep(u1-.004,u1+.004,u+n))*sstep(v0-.004,v0+.004,v+n)*(1-sstep(v1-.004,v1+.004,v+n));};
  /* (potholes, cut-and-patch repairs and the tar seal are not baked in - a texture repeating every 7 m would repeat
     them too; the shader lays them out over the world instead) */
  const patch=0,hole=0;
  const agg=sstep(.7,.92,c);
  let k=60+(a-.5)*16+agg*26-crack*26-allig*18;k+=wp*6;
  let col=[k*1.0,k*.99,k*.96];
  /* markings: edge lines and the 3 m dash of the centre line, worn through in places */
  const wear=sstep(.3,.62,N2(u,v,40,2)*.6+N2(u,v,8,3)*.4);
  const edge=(sstep(.058,.062,u)-sstep(.074,.078,u))+(sstep(.922,.926,u)-sstep(.938,.942,u));
  const dash=(sstep(.491,.494,u)-sstep(.506,.509,u))*(v%1<.42?1:0);
  const paint=Math.max(edge,dash)*wear*(1-crack)*(1-hole);col=mixc(col,[196,194,182],paint*.92);
  const h=.5+(c-.5)*.1+agg*.08-crack*.22-allig*.16-hole*.6+patch*.05;
  const r=.9-wp*.1-paint*.2;
  const ed=Math.min(u,1-u),al=sstep(0,.018+e*.03,ed+(c-.5)*.01);
  return[col[0],col[1],col[2],h,r,al*255];},{bump:3});
bleedAlpha(PB.asphalt.a,8);
function asphaltMat(){const m=std({map:PB.asphalt.a,normalMap:PB.asphalt.n,roughnessMap:PB.asphalt.r,alphaTest:.5,roughness:1,envMapIntensity:.35,normalScale:new T.Vector2(.9,.9)});
  m.onBeforeCompile=s=>{s.vertexShader='varying vec3 vAW;\n'+s.vertexShader.replace('#include <fog_vertex>','#include <fog_vertex>\nvAW=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader='varying vec3 vAW;float aH(vec2 p){vec3 q=fract(vec3(p.xyx)*.1031);q+=dot(q,q.yzx+33.33);return fract((q.x+q.y)*q.z);}\n'+
      'float aV(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(aH(i),aH(i+vec2(1,0)),f.x),mix(aH(i+vec2(0,1)),aH(i+1.),f.x),f.y);}\n'+s.fragmentShader
      .replace('#include <map_fragment>',`vec4 tA=texture2D(map,vUv),tB=texture2D(map,vec2(vUv.x,vUv.y*.37+.41));float bw=smoothstep(.35,.7,aV(vAW.xz*.06));
        vec4 texelColor=mapTexelToLinear(vec4(mix(tA.rgb,tB.rgb,bw*.5),tA.a));texelColor.rgb*=.88+.24*aV(vAW.xz*.04+3.);
        /* laid out over the world, never repeating: long wandering lines of tar crack-seal, rectangular repairs, potholes */
        vec2 wq=vAW.xz;float sn=aV(wq*.31+vec2(7.,3.)),sm=smoothstep(.56,.63,aV(wq*.045+11.));float seal=(1.-smoothstep(.006,.016,abs(sn-.5)))*sm;
        vec2 pc=floor(wq/9.),pf=fract(wq/9.);float patchK=0.;if(aH(pc+3.1)<.2){vec2 c=vec2(aH(pc+1.7),aH(pc+5.3))*.5+.25,hs=vec2(.1,.16)+vec2(aH(pc+8.),aH(pc+9.))*.16;vec2 q=abs(pf-c)-hs+(aV(wq*3.)-.5)*.012;patchK=1.-smoothstep(-.006,.006,max(q.x,q.y));}
        vec2 hc=floor(wq/4.),hf=fract(wq/4.);float hole=0.;if(aH(hc+.7)<.05){vec2 c=vec2(aH(hc+2.2),aH(hc+4.4))*.6+.2;float r=.06+aH(hc+6.6)*.07;float d=length((hf-c)*vec2(1.,1.3))+(aV(wq*7.)-.5)*.035;hole=1.-smoothstep(r*.75,r,d);}
        texelColor.rgb*=1.-.13*patchK;texelColor.rgb=mix(texelColor.rgb,vec3(.016,.015,.014),seal*.8);texelColor.rgb=mix(texelColor.rgb,texelColor.rgb*.34,hole);
        diffuseColor*=texelColor;`).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=mix(roughnessFactor,.55,seal*.7);');};
  m.customProgramCacheKey=()=>'asph2';return m;}
/* a ribbon of quads (rows along the road, columns across) wound so its normals face up */
function ribbon(pos,uv,rows,cols,extra){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));if(uv)g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));
  for(const k in extra||{})g.setAttribute(k,new T.Float32BufferAttribute(extra[k][0],extra[k][1]));
  const idx=[];for(let i=0;i<rows-1;i++)for(let j=0;j<cols-1;j++){const a=i*cols+j,b=a+1,c=a+cols,d=c+1;idx.push(a,c,b,b,c,d);}
  /* flip if the first triangle faces down */
  const P=(k)=>V3(pos[k*3],pos[k*3+1],pos[k*3+2]);const n=V3().crossVectors(P(idx[1]).sub(P(idx[0])),P(idx[2]).sub(P(idx[0])));
  if(n.y<0)for(let i=0;i<idx.length;i+=3){const t=idx[i+1];idx[i+1]=idx[i+2];idx[i+2]=t;}
  g.setIndex(idx);g.computeVertexNormals();return g;}
function roadFrame(P,i){const a=P[Math.max(0,i-1)],b=P[Math.min(P.length-1,i+1)];const dx=b.x-a.x,dz=b.z-a.z,l=Math.hypot(dx,dz)||1;return{tx:dx/l,tz:dz/l,nx:-dz/l,nz:dx/l};}
const terrCol=(x,z)=>{const k=.86+fbm(x/30+3,z/30,3)*.28;return[k,k*(.98+fbm(x/60,z/60+5,2)*.04),k*.97];};
(function highway(){const R=ROADS.hw,P=R.P;
  /* asphalt */
  const cols=[-3.62,-2.4,-1.2,0,1.2,2.4,3.62];const pos=[],uv=[];
  P.forEach((p,i)=>{const f=roadFrame(P,i);cols.forEach(d=>{const x=p.x+f.nx*d,z=p.z+f.nz*d;pos.push(x,p.y+hwRel(Math.abs(d),p.s,Math.sign(d))+.008,z);uv.push((d+3.62)/7.24,p.s/7.24);});});
  const am=mesh(ribbon(pos,uv,P.length,cols.length),asphaltMat(),0,0,0,scene,false);am.receiveShadow=true;shootables.push(am);
  /* shoulders, ditches and verges in the terrain's own splat material, blending into the ground at the outer edge */
  const ds=[3.3,3.6,4.4,5.4,6.1,6.9,8,9.5,11,12.5];
  [1,-1].forEach(sg=>{const ps=[],sp=[],we=[],co=[];
    P.forEach((p,i)=>{const f=roadFrame(P,i);const fill=hwFill(p.s,sg);
      ds.forEach((d,j)=>{const x=p.x+f.nx*d*sg,z=p.z+f.nz*d*sg;let y=p.y+hwRel(d,p.s,sg);if(j===0)y-=.03;if(j===ds.length-1)y-=.05;ps.push(x,y,z);
        let w,wt;if(d<=4.4){w=[0,.05,.15,.8];wt=.1;}else if(d<=6.9){w=fill>.5?[0,.05,.3,.65]:[.04,.1,.76,.1];wt=fill>.5?.15:.55;}
        else if(d<=8){w=[.45,.3,.25,0];wt=.3;}else if(d<12.5){w=[.6,.35,.05,0];wt=.12;}else{const gm=groundMix(x,z);w=gm.slice(0,4);wt=gm[4];}
        sp.push(...w);we.push(wt);co.push(...terrCol(x,z));});});
    const g=ribbon(ps,null,P.length,ds.length,{splat:[sp,4],wet:[we,1],color:[co,3]});const sm=mesh(g,splatMat(.45),0,0,0,scene,false);sm.receiveShadow=true;shootables.push(sm);});
  /* white plastic delineator posts (rounded-trapezoid section, black band moulded in, a red reflector toward traffic),
     every 50 m both sides */
  const posts=[];for(let s=18;s<R.L;s+=50)[1,-1].forEach(sg=>{if(hwFill(s,sg)>0)return;const i=P.findIndex(p=>p.s>=s);if(i<0)return;const p=P[i],f=roadFrame(P,i);
    const x=p.x+f.nx*4.85*sg,z=p.z+f.nz*4.85*sg;posts.push([x,H(x,z)-.12,z,Math.atan2(f.tx,f.tz)+(sg<0?Math.PI:0)]);});
  {const sh=new T.Shape();const pts=[[-.06,.045],[.06,.045],[.045,-.05],[-.045,-.05]];sh.moveTo(...pts[0]);pts.slice(1).forEach(q=>sh.lineTo(...q));sh.lineTo(...pts[0]);
    const pg=new T.ExtrudeGeometry(sh,{depth:1.2,bevelEnabled:true,bevelThickness:.008,bevelSize:.012,bevelSegments:3,curveSegments:4});pg.rotateX(-Math.PI/2);
    {const p=pg.attributes.position,uv=pg.attributes.uv;for(let k=0;k<p.count;k++)uv.setXY(k,(p.getX(k)+p.getZ(k))*2,p.getY(k)/1.2);}
    const ptex=tex(32,256,(c,w,h)=>{const im=c.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const v=1-y/h;const band=v>.8&&v<.95;const dirt=sstep(.25,0,v)*.5;
      const n=Math.random()*10;const k=band?24+n*.5:(226-dirt*120+n);const i=(y*w+x)*4;d[i]=k;d[i+1]=k*.99;d[i+2]=k*(band?1:.95);d[i+3]=255;}c.putImageData(im,0,0);},{});ptex.wrapS=T.RepeatWrapping;
    const rf=new T.PlaneGeometry(.07,.13);rf.rotateY(Math.PI);rf.translate(0,.98,-.0585);
    [[pg,std({map:ptex,roughness:.45,envMapIntensity:.5})],[rf,std({color:C(0xc8281a),emissive:C(0x4a0c04),roughness:.18,metalness:.2})]].forEach(([g,m])=>{
      const im=new T.InstancedMesh(g,m,posts.length);const o=new T.Object3D();posts.forEach((p,k)=>{o.position.set(p[0],p[1],p[2]);o.rotation.set(rnd(-.03,.03),p[3],rnd(-.04,.04));o.updateMatrix();im.setMatrixAt(k,o.matrix);});
      im.castShadow=true;im.receiveShadow=true;fitInstBounds(im,posts.map(p=>[p[0],p[2]]),4);scene.add(im);});}
  /* wooden power poles with a crossarm and three insulators, east of the road, and their sagging wires */
  const poles=[];for(let s=10;s<R.L;s+=46){const i=P.findIndex(p=>p.s>=s);if(i<0)break;const p=P[i],f=roadFrame(P,i);const d=-15.5;const x=p.x+f.nx*d,z=p.z+f.nz*d;
    if(Math.abs(s-ROADS.sJ)<14||Math.abs(s-ROADS.sJd)<14)continue;poles.push({x,z,y:H(x,z),yaw:Math.atan2(f.tx,f.tz),lean:rnd(-.03,.03)});}
  const poleG=new T.CylinderGeometry(.11,.15,9.2,9);poleG.translate(0,4.6,0);const armG=rbox(2.1,.11,.11,.01);armG.translate(0,8.55,0);const insG=new T.CylinderGeometry(.04,.05,.16,8);
  const wood=std({map:TX.bark,color:C(0x6a5e50),roughness:.95});const o=new T.Object3D();
  const pm=new T.InstancedMesh(poleG,wood,poles.length),amm=new T.InstancedMesh(armG,wood,poles.length),im3=new T.InstancedMesh(insG,std({color:C(0x8a9a8a),roughness:.25,metalness:.1}),poles.length*3);
  const wires=[];poles.forEach((p,k)=>{o.position.set(p.x,p.y-.3,p.z);o.rotation.set(p.lean,p.yaw+Math.PI/2,0);o.updateMatrix();pm.setMatrixAt(k,o.matrix);amm.setMatrixAt(k,o.matrix);
    p.att=[-.85,0,.85].map((ox,j)=>{const v=V3(ox,8.69,0).applyMatrix4(o.matrix);const q=new T.Object3D();q.position.copy(v);q.updateMatrix();im3.setMatrixAt(k*3+j,q.matrix);return v;});
    solids.push({cx:p.x,cz:p.z,r:.22});});
  for(let k=0;k<poles.length-1;k++)for(let j=0;j<3;j++){const a=poles[k].att[j],b=poles[k+1].att[j];const n=14;for(let t=0;t<n;t++){const u0=t/n,u1=(t+1)/n;
    const sag=u=>-4*.55*u*(1-u);const pa=a.clone().lerp(b,u0),pb=a.clone().lerp(b,u1);pa.y+=sag(u0)+.08;pb.y+=sag(u1)+.08;wires.push(pa.x,pa.y,pa.z,pb.x,pb.y,pb.z);}}
  [pm,amm,im3].forEach(m=>{m.castShadow=true;m.receiveShadow=true;fitInstBounds(m,poles.map(p=>[p.x,p.z]),12);scene.add(m);});
  {const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(wires,3));const l=new T.LineSegments(g,new T.LineBasicMaterial({color:C(0x1c1c1a)}));scene.add(l);}
  /* kilometre sign 6.13 on a galvanised post, east verge just past the junction */
  {const s=ROADS.sJ+128,i=P.findIndex(p=>p.s>=s),p=P[i],f=roadFrame(P,i);const x=p.x-f.nx*5.3,z=p.z-f.nz*5.3;const g=new T.Group();g.position.set(x,H(x,z)-.05,z);g.rotation.y=Math.atan2(f.tx,f.tz)+Math.PI/2;scene.add(g);
    signPost(g,0,0,1.75);
    const t=tex(160,128,(c,w,h)=>{c.fillStyle='#ececE4';c.fillRect(0,0,w,h);c.strokeStyle='#161616';c.lineWidth=5;c.strokeRect(6,6,w-12,h-12);c.fillStyle='#141414';c.font='bold 70px sans-serif';c.textAlign='center';c.fillText('31',w/2,92);
      const im=c.getImageData(0,0,w,h);for(let k=0;k<im.data.length;k+=4){const n=Math.random()*14-7;im.data[k]+=n;im.data[k+1]+=n;im.data[k+2]+=n;}c.putImageData(im,0,0);},{});
    [1,-1].forEach(sd=>{const gp=new T.Group();gp.position.set(0,1.42,sd*.05);if(sd<0)gp.rotation.y=Math.PI;g.add(gp);signPlate(gp,.42,.34,t);});}
})();
(function forestTrack(){const R=ROADS.tr,P=R.P;const cols=[-3.2,-2.4,-1.2,0,1.2,2.4,3.2];const pos=[],uv=[];
  P.forEach((p,i)=>{const f=roadFrame(P,i);cols.forEach(d=>{const x=p.x+f.nx*d,z=p.z+f.nz*d;pos.push(x,p.y+.035,z);uv.push((d+3.2)/6.4,p.s/(7.6*109));});});
  const m=mesh(ribbon(pos,uv,P.length,cols.length),roadMat(),0,0,0,scene,false);m.renderOrder=1;m.receiveShadow=true;
  /* direction signs where the track meets the highway: Lesnoye to the left (south), Krasny Bor to the right */
  const i=P.length-7,p=P[i],f=roadFrame(P,i);const side=-1;const x=p.x+f.nx*4.6*side,z=p.z+f.nz*4.6*side;const g=new T.Group();g.position.set(x,H(x,z)-.05,z);g.rotation.y=Math.atan2(f.tx,f.tz)+Math.PI;scene.add(g);
  [-.62,.62].forEach(ox=>signPost(g,ox,-.075,2.75));
  const sign=tex(512,256,(c,w,h)=>{c.fillStyle='#1d4a8c';c.fillRect(0,0,w,h);c.strokeStyle='#f2f2f2';c.lineWidth=10;c.strokeRect(12,12,w-24,h-24);c.fillStyle='#f2f2f2';c.font='bold 44px sans-serif';
    c.textAlign='left';c.fillText('← ЛЕСНОЕ',36,106);c.textAlign='right';c.fillText('4',w-40,106);c.fillRect(30,128,w-60,5);c.textAlign='left';c.fillText('КРАСНЫЙ БОР →',36,210);c.textAlign='right';c.fillText('19',w-40,210);
    const im=c.getImageData(0,0,w,h);for(let k=0;k<im.data.length;k+=4){const n=Math.random()*18-9;im.data[k]+=n;im.data[k+1]+=n;im.data[k+2]+=n;}c.putImageData(im,0,0);},{});
  {const gp=new T.Group();gp.position.set(0,2.15,0);g.add(gp);signPlate(gp,1.6,.8,sign,[-.62,.62]);}
  /* give-way triangle */
  const tri=tex(256,224,(c,w,h)=>{c.clearRect(0,0,w,h);c.fillStyle='#c0201a';c.beginPath();c.moveTo(w/2,h-6);c.lineTo(6,8);c.lineTo(w-6,8);c.fill();c.fillStyle='#f2f2f2';c.beginPath();c.moveTo(w/2,h-48);c.lineTo(46,30);c.lineTo(w-46,30);c.fill();},{});
  const tg=new T.Group();tg.position.set(x+f.tx*3.2,H(x+f.tx*3.2,z+f.tz*3.2)-.05,z+f.tz*3.2);tg.rotation.y=g.rotation.y;scene.add(tg);signPost(tg,0,-.07,2.55);
  {const gp=new T.Group();gp.position.set(0,2.08,0);tg.add(gp);signPlate(gp,.78,.68,tri,[0],true);}
  solids.push({cx:x,cz:z,r:.3});window.__signs=[[x,z],[tg.position.x,tg.position.z]];
})();
/* the kolkhoz road: two ruts of packed earth and gravel, the same surface as the forest track */
(function kolkhozRoad(){const R=ROADS.dr,P=R.P;const cols=[-3.0,-2.2,-1.1,0,1.1,2.2,3.0];const pos=[],uv=[];
  P.forEach((p,i)=>{const f=roadFrame(P,i);cols.forEach(d=>{const x=p.x+f.nx*d,z=p.z+f.nz*d;pos.push(x,p.y+.035,z);uv.push((d+3.2)/6.4,p.s/(7.6*109)+.37);});});
  const m=mesh(ribbon(pos,uv,P.length,cols.length),roadMat(),0,0,0,scene,false);m.renderOrder=1;m.receiveShadow=true;})();
/* the forest: jittered-grid planting wherever forestF says so, in 128 m chunks so the frustum culls it */
(function forest(){const sp=6.4,pine=[],birch=[],bush=[];
  /* (west of the old map edge the woods are planted fully only round the chapter-3 corridor; further out a thinner stand
     that the fog swallows) */
  for(let x=-900;x<-6;x+=sp)for(let z=-716;z<326;z+=sp){if(x<-378&&(z<-650||z>-100)&&R()>.3)continue;const jx=x+rnd(-.42,.42)*sp,jz=z+rnd(-.42,.42)*sp;const f=forestF(jx,jz);if(f<=0||R()>f)continue;
    (R()<.68?pine:birch).push([jx,jz]);if(R()<.14)bush.push([jx+rnd(-2.5,2.5),jz+rnd(-2.5,2.5)]);}
  /* undergrowth along the edges of the forest track */
  ROADS.tr.P.forEach((p,i)=>{if(i%3)return;const f=roadFrame(ROADS.tr.P,i);[1,-1].forEach(sg=>{if(R()<.55){const d=rnd(6.8,9.5);bush.push([p.x+f.nx*d*sg,p.z+f.nz*d*sg]);}});});
  /* nothing grows on a road surface or its shoulders, whatever list it came from */
  const clr=L=>L.filter(([x,z])=>{const q=roadQuery(x,z);return q.dT>3.8&&q.dH>6.2&&q.dW>5.8;});
  const chunk=(list,geoFn,variants,trunkMat,leafM,leafTex,col)=>plant(geoFn,variants,clr(list),trunkMat,leafM,leafTex,null,col,true);
  /* the conifers are mostly spruce with Scots pine mixed through on the drier ground */
  const spr=[],sco=[];pine.forEach(t=>(fbm(t[0]/60+4,t[1]/60,2)>.55&&R()<.75?sco:spr).push(t));
  /* shelterbelts across the old collective field: double rows of birch with a hazel understorey, planted along the
     block boundaries - two running north-south, one east-west - each broken by a few gaps where the field tracks ran */
  {const belts=[[-522,-492,-522,-250],[-586,-494,-586,-252],[-472,-372,-640,-372]];const bb=[],bu=[];
   belts.forEach(([x0,z0,x1,z1],bi)=>{const L=Math.hypot(x1-x0,z1-z0),dx=(x1-x0)/L,dz=(z1-z0)/L,nx=-dz,nz=dx;
     for(let s=0;s<L;s+=rnd(3.2,4.4)){const g=((s+bi*37)%70);if(g>60)continue;
       for(const off of [-2.4,2.4]){const x=x0+dx*s+nx*(off+rnd(-.6,.6)),z=z0+dz*s+nz*(off+rnd(-.6,.6));if(roadQuery(x,z).dW<10)continue;bb.push([x,z]);}
       if(R()<.6){const off=rnd(-4.5,4.5);bu.push([x0+dx*s+nx*off,z0+dz*s+nz*off]);}}});
   W3.belts=belts;plant(birchGeo,3,clr(bb),woodMat.birch,MB,TX.twigBirch,null,.25,true);plant(bushGeo,2,clr(bu),woodMat.dead,MG,TX.twigBush,null,0,true);}
  /* a windbreak on the north side of the kolkhoz road: a single ragged row of birches with gaps, here and there a hazel */
  {const P=ROADS.dr.P,wb=[],wu=[];for(let i=4;i<P.length-14;i++){if(P[i].x>235||P[i].x<-280)continue;if(R()>.36)continue;const gap=Math.sin(P[i].s*.021+1.3)>.55;if(gap)continue;
     const f=roadFrame(P,i),d=rnd(8.5,11);const x=P[i].x+f.nx*d,z=P[i].z+f.nz*d;if(CRATERS&&craterGrass(x,z)<.95)continue;wb.push([x,z]);if(R()<.3)wu.push([x+rnd(-2,2),z+rnd(-2,2)]);}
   wb.splice(0,wb.length,...clr(wb));plant(birchGeo,3,wb,woodMat.birch,MB,TX.twigBirch,null,.25,true);plant(bushGeo,2,clr(wu),woodMat.dead,MG,TX.twigBush,null,0,true);ROADS.dr.wb=wb;}
  chunk(spr,pineGeo,3,woodMat.bark,MP,TX.spray,.33);
  chunk(sco,scotsGeo,2,woodMat.bark,MS,TX.tuft,.3);
  chunk(birch,birchGeo,3,woodMat.birch,MB,TX.twigBirch,.25);
  chunk(bush,bushGeo,2,woodMat.dead,MG,TX.twigBush,0);
})();
