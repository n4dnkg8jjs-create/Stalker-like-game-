/* ---------- beyond the lumber yard: the footpath out the back of the shack through the tall grass and a small tree line,
   out onto a single-lane asphalt road, and the road running a long way south-west across open country toward the
   fighting - smoke standing on the horizon, now and then the guns landing far off and the sound coming after.
   (Heights, grass and the shell holes are defined with the terrain: WX, wxH, wxGrass, wxCraters.) ---------- */
(function westRoad(){const r_=rng(7272),rr=(a,b)=>a+(b-a)*r_();wxInit();const B=WX.box,P=WX.P;
  /* ===== the ground: its own mesh west of the old edge, 2.5 m cells; its east edge follows the coarse terrain's edge exactly ===== */
  {const st=2.5,nx=Math.round((B.x1-B.x0)/st),nz=Math.round((B.z1-B.z0)/st);const g=new T.PlaneGeometry(B.x1-B.x0,B.z1-B.z0,nx,nz);g.rotateX(-Math.PI/2);g.translate((B.x0+B.x1)/2,0,(B.z0+B.z1)/2);
   const p=g.attributes.position,n=p.count,col=new Float32Array(n*3),spl=new Float32Array(n*4),wet=new Float32Array(n);const sz=TERR.d/272;
   const edgeY=z=>{const j=Math.floor((z-TERR.z0)/sz),za=TERR.z0+j*sz,t=clamp((z-za)/sz,0,1);return lerp(Hterr(TERR.x0,za),Hterr(TERR.x0,za+sz),t);};
   for(let i=0;i<n;i++){const x=p.getX(i),z=p.getZ(i);const onE=Math.abs(x-B.x1)<.01;const y=onE?edgeY(z):H(x,z);p.setY(i,y-(onE?0:.03));
     const k=.86+fbm(x/30+3,z/30,3)*.28;col[i*3]=k;col[i*3+1]=k*(.98+fbm(x/60,z/60+5,2)*.04);col[i*3+2]=k*.97;
     /* grass and dry grass over the fields; mud along the path; gravel and mud on the shoulders */
     const q=wxRoad(x,z),dt=x>-960?wxTrail(x,z):99;let w=groundMix(x,z).slice(0,4),wt=.15;
     if(dt<1.5){const k2=sstep(1.5,.6,dt);w=[w[0]*(1-k2),w[1]*(1-k2),lerp(w[2],1,k2),w[3]*(1-k2)];wt=lerp(wt,.85,k2);}
     if(q.d<WX.hw+3.2){const k3=sstep(WX.hw+3.2,WX.hw+.6,q.d);w=[w[0]*(1-k3),w[1]*(1-k3)+.15*k3,lerp(w[2],.45,k3),lerp(w[3],.4,k3)];wt=lerp(wt,.4,k3);}
     spl.set(w,i*4);wet[i]=wt;}
   g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('splat',new T.BufferAttribute(spl,4));g.setAttribute('wet',new T.BufferAttribute(wet,1));g.computeVertexNormals();
   const m=mesh(g,splatMat(.45),0,0,0,scene,false);m.receiveShadow=true;m.userData.wx=1;shootables.push(m);WX.ground=m;}
  /* ===== the footpath: a ribbon of trodden mud with ragged edges and standing water in the ruts, from the shack's back wall ===== */
  {const cr=new T.CatmullRomCurve3(WX.trail.map(p=>V3(p[0],0,p[1])),false,'centripetal');const L=cr.getLength(),n=Math.round(L/.5);const cols=[-.8,-.45,-.15,.15,.45,.8];const pos=[],uv=[];
   for(let i=0;i<=n;i++){const t=i/n,q=cr.getPointAt(t),tg=cr.getTangentAt(t);const nx=-tg.z,nz=tg.x;const wob=(fbm(q.x/3,q.z/3,2)-.5)*.5;
     cols.forEach((d,j)=>{const w=d*(1+.25*Math.sin(i*.37+j)+wob*.4);const x=q.x+nx*w,z=q.z+nz*w;pos.push(x,H(x,z)+.03,z);uv.push(j/(cols.length-1),t*L/1.6);});}
   const edge=tex(64,256,(c,w,h)=>{const im=c.createImageData(w,h),d=im.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=Math.abs(x/(w-1)-.5)*2;const nn=fbm(x/9,y/9,3);const a=sstep(1,.62,u+(nn-.5)*.5);const i=(y*w+x)*4;d[i]=d[i+1]=d[i+2]=255;d[i+3]=a*255;}c.putImageData(im,0,0);},{data:true});
   const mud=std({map:PB.mud.a,normalMap:PB.mud.n,color:C(0x7a6b58),roughness:.88,alphaMap:edge,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-3,envMapIntensity:.15});
   mud.defines.NO_PUDDLE='';const mm=mesh(ribbon(pos,uv,n+1,cols.length),mud,0,0,0,scene,false);mm.receiveShadow=true;mm.renderOrder=1;
   /* water standing in the wheel and boot ruts */
   const pud=std({color:C(0x221f1a),roughness:.12,metalness:0,transparent:true,opacity:.78,envMapIntensity:.45,polygonOffset:true,polygonOffsetFactor:-4,depthWrite:false});
   for(let k=0;k<9;k++){const t=rr(.04,.96),q=cr.getPointAt(t),tg=cr.getTangentAt(t);const g=new T.CircleGeometry(1,18);g.rotateX(-Math.PI/2);const ps=g.attributes.position;
     const a=Math.atan2(tg.x,tg.z),sx=rr(.25,.55),sz_=rr(.5,1.3);for(let i=0;i<ps.count;i++){const lx=ps.getX(i)*sx*(1+(fbm(i,k,2)-.5)*.4),lz=ps.getZ(i)*sz_;const x=q.x+lx*Math.cos(a)+lz*Math.sin(a),z=q.z-lx*Math.sin(a)+lz*Math.cos(a);ps.setXYZ(i,x,H(x,z)+.04,z);}
     g.computeVertexNormals();const pm=new T.Mesh(g,pud);pm.renderOrder=2;scene.add(pm);}}
  /* ===== the road: single lane of old, broken asphalt with ragged edges, gravel and mud shoulders, a ditch ===== */
  {const cols=[-1,-.66,-.33,0,.33,.66,1].map(k=>k*WX.hw);const pos=[],uv=[];
   P.forEach((p,i)=>{const f=roadFrame(P,i);cols.forEach(d=>{const x=p.x+f.nx*d,z=p.z+f.nz*d;pos.push(x,p.y+wxRel(Math.abs(d))+.012,z);uv.push((d+WX.hw)/(2*WX.hw)*.33+.1,p.s/7.24);});});
   const am=mesh(ribbon(pos,uv,P.length,cols.length),asphaltMat(),0,0,0,scene,false);am.receiveShadow=true;shootables.push(am);WX.asph=am;
   const ds=[WX.hw-.12,WX.hw+.25,WX.hw+.7,WX.hw+1.3,WX.hw+2.1,WX.hw+3,WX.hw+4.2];
   [1,-1].forEach(sg=>{const ps=[],sp=[],we=[],co=[];P.forEach((p,i)=>{const f=roadFrame(P,i);ds.forEach((d,j)=>{const x=p.x+f.nx*d*sg,z=p.z+f.nz*d*sg;let y=j===ds.length-1?H(x,z)-.02:p.y+wxRel(d)+(j===0?-.004:.004);ps.push(x,y,z);
       const w=d<WX.hw+.8?[0,.08,.32,.6]:d<WX.hw+2.4?[.15,.15,.6,.1]:groundMix(x,z).slice(0,4);sp.push(...w);we.push(d<WX.hw+.8?.25:d<WX.hw+2.4?.65:.2);co.push(...terrCol(x,z));});});
     const g=ribbon(ps,null,P.length,ds.length,{splat:[sp,4],wet:[we,1],color:[co,3]});const sm=mesh(g,splatMat(.45),0,0,0,scene,false);sm.receiveShadow=true;shootables.push(sm);});}
  /* ===== windbreaks (lesopolosy): the belts of trees between the fields, one every few hundred metres along the road,
     running off across the country from the verge. The near ones are whole; further on the shelling has thinned and
     splintered them, and the last ones before the line are rows of snapped, bare trunks with hardly a crown left.
     Each point is decided here once (a living tree, a dead one standing, a snapped snag, or gone) so the trees and the
     snags below agree. ===== */
  const WB=[];{const q=rng(5150),qq=(a,b)=>a+(b-a)*q(),SL=P[P.length-1].s;
    [[.17,1,.97],[.3,-1,.9],[.43,1,.72],[.55,-1,.55],[.67,1,.38],[.78,-1,.24],[.88,1,.12],[.94,-1,.06]].forEach(([f,sd,alive])=>{
      const i=Math.round(f*SL/2),p=P[Math.min(i,P.length-1)],fr=roadFrame(P,Math.min(i,P.length-1));const ang=Math.atan2(fr.nz,fr.nx)+qq(-.3,.3),ca=Math.cos(ang),sa=Math.sin(ang);
      const L=qq(120,210),d0=qq(9,13),gap=qq(.35,.7);const pts=[];
      for(let d=d0;d<d0+L;d+=qq(3.4,4.8)){if(Math.abs((d-d0)/L-gap)<.03)continue;/* (a gap where a track crosses) */
        const bend=Math.sin(d*.018+f*11)*5;for(const row of [-1.7,1.7]){const off=row+bend+qq(-.7,.7),dd=d+qq(-.8,.8);const x=p.x+ca*dd*sd-sa*off,z=p.z+sa*dd*sd+ca*off;
          const u=q();const kind=u<alive?(q()<.12+.5*(1-alive)?'dead':q()<.55?'birch':q()<.75?'bush':'pine'):u<alive+(1-alive)*.7?'snag':'none';pts.push({x,z,kind,big:q()<.4});}}
      WB.push({pts,alive,f,sd});});}
  WX.wb=WB;
  /* ===== war on the road: shell-hole decals and thrown earth round the craters, torn-up asphalt, a burnt-out UAZ in the
     ditch, the old power line along the road with a pole snapped by blast, its wires down ===== */
  const bk=bucket();const soil=std({color:C(0x3a3027),roughness:1,envMapIntensity:.15}),scorch=std({color:C(0x1d1a17),roughness:1,envMapIntensity:.1}),chunk=std({map:PB.asphalt.a,color:C(0x8a8a86),roughness:.95});
  {const sc=tex(256,256,(c,w,h)=>{const g=c.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);g.addColorStop(0,'rgba(18,15,12,.92)');g.addColorStop(.55,'rgba(30,24,18,.6)');g.addColorStop(1,'rgba(30,24,18,0)');c.fillStyle=g;c.fillRect(0,0,w,h);
      const q=rng(31);for(let i=0;i<220;i++){const a=q()*6.28,d=q()*w*.5;c.fillStyle=`rgba(${20+q()*30|0},${16+q()*20|0},${12+q()*14|0},${q()*.5})`;c.beginPath();c.arc(w/2+Math.cos(a)*d,h/2+Math.sin(a)*d,2+q()*7,0,7);c.fill();}},{clamp:true});
   const scM=std({map:sc,transparent:true,depthWrite:false,roughness:1,polygonOffset:true,polygonOffsetFactor:-3,envMapIntensity:.1});
   /* (all the scorch decals are one mesh - they are hundreds now) */const decs=[];
   for(const c of wxCraters()){if(c.x<-1700||c.x>-905)continue;const R0=c.r*2.1,g=new T.PlaneGeometry(R0*2,R0*2,10,10);g.rotateX(-Math.PI/2);const p=g.attributes.position;for(let i=0;i<p.count;i++){const X=c.x+p.getX(i),Z=c.z+p.getZ(i);p.setXYZ(i,X,H(X,Z)+.03,Z);}
     g.computeVertexNormals();decs.push(g);
     for(let k=0;k<(c.salvo?4:c.nu?7:12);k++){const a=rr(0,6.28),p_=rr(.95,1.8)*c.r,x=c.x+Math.cos(a)*p_,z=c.z+Math.sin(a)*p_,s=rr(.06,.18);bk.add(rockGeo(50+k%6,{detail:1,flat:.6}),k%4===0?scorch:soil,TRS(x,H(x,z)+s*.15,z,rr(-.4,.4),rr(0,6),rr(-.4,.4),s));}
     /* the near ones threw broken asphalt and earth onto the road */
     const q=wxRoad(c.x,c.z);if(q.d<12)for(let k=0;k<7;k++){const s=q.s+rr(-3,3),i=Math.min(P.length-1,Math.max(0,Math.round(s/2))),pp=P[i],f=roadFrame(P,i),d=rr(-1.4,1.4);const x=pp.x+f.nx*d,z=pp.z+f.nz*d;
       bk.add(rbox(rr(.08,.25),rr(.03,.06),rr(.08,.2),.01),k%3?chunk:soil,TRS(x,pp.y+.04,z,rr(-.2,.2),rr(0,6),rr(-.2,.2)));}}
   {const m=new T.Mesh(merge(decs),scM);m.renderOrder=1;m.receiveShadow=true;scene.add(m);}}
  /* ===== trees broken by the shelling: snapped trunks with splintered, pale broken ends, the crowns lying beside
     them pointing away from the blast; some stripped and blackened. Round the craters and scattered along the road. ===== */
  {const barkP=std({map:TX.bark,color:C(0x6a5e52),roughness:1}),barkB=std({map:TX.birch,color:C(0xd8d4c8),roughness:.9}),raw=std({color:C(0xb9a47e),roughness:.95}),burnt=std({map:TX.bark,color:C(0x2a2622),roughness:1});
   const snag=(x,z,away,big)=>{if(wxRoad(x,z).d<WX.hw+3.2||x>-906||x<-1695)return;const y=H(x,z)-.1,birch=r_()<.35,r=big?rr(.17,.27):rr(.1,.18),h=rr(1.6,5.5),M_=r_()<.25?burnt:birch?barkB:barkP;
     const lean=rr(-.12,.12);snagParts(bk,TRS(x,y,z,lean,rr(0,6),rr(-.1,.1)),r,r*.84,h,r_,M_);
     /* the top, thrown down beside it */if(r_()<.7){const L=rr(3,7),tg=new T.CylinderGeometry(r*.35,r*.8,L,8,1);tg.rotateZ(Math.PI/2);tg.translate(L/2+.3,0,0);const ya=Math.atan2(-away[1],away[0])+rr(-.5,.5);bk.add(tg,M_,TRS(x,H(x,z)+r*.6,z,0,ya,rr(-.05,.05)));
       for(let k=0;k<4;k++){const bl=rr(.6,1.6),bg=new T.CylinderGeometry(.02,.04,bl,16);bg.translate(0,bl/2,0);const u=rr(.3,.9)*L;bk.add(bg,M_,TRS(x+Math.cos(-ya)*u,H(x,z)+.2,z+Math.sin(-ya)*u,rr(-1,1),rr(0,6),rr(.6,1.4)));}}
     solids.push({cx:x,cz:z,r:r+.12});n_++;};let n_=0;
   const r2=rng(8123);for(const c of wxCraters()){if(c.salvo||c.nu&&r2()<.7)continue;const m=rr(1,3.4)|0;for(let k=0;k<m;k++){const a=rr(0,6.28),d=c.r*rr(1.8,4.5);snag(c.x+Math.cos(a)*d,c.z+Math.sin(a)*d,[Math.cos(a),Math.sin(a)],r_()<.4);}}
   for(let s=20;s<P[P.length-1].s;s+=rr(5,13)){const i=Math.round(s/2),p=P[Math.min(i,P.length-1)],f=roadFrame(P,Math.min(i,P.length-1)),sd=r_()<.5?-1:1,d=rr(WX.hw+4.5,WX.hw+30);snag(p.x+f.nx*d*sd,p.z+f.nz*d*sd,[f.nx*sd,f.nz*sd],r_()<.45);}
   /* where a salvo walked through a copse: clumps of broken trunks */
   for(let k=0;k<14;k++){const s=rr(60,P[P.length-1].s-60),i=Math.round(s/2),p=P[Math.min(i,P.length-1)],f=roadFrame(P,Math.min(i,P.length-1)),sd=r_()<.5?-1:1,d=rr(WX.hw+10,WX.hw+40);const cx=p.x+f.nx*d*sd,cz=p.z+f.nz*d*sd;
     for(let j=0;j<rr(5,10);j++){const a=rr(0,6.28),e=rr(1,9);snag(cx+Math.cos(a)*e,cz+Math.sin(a)*e,[Math.cos(a),Math.sin(a)],r_()<.5);}}
   /* the windbreaks' broken trees: the crowns thrown away from the line of fire (the guns are to the south-west) */
   for(const w of WB)for(const p of w.pts)if(p.kind==='snag')snag(p.x,p.z,[-.6+r2()*.3,.75],p.big);
   WX.snags=n_;}
  /* a burnt-out UAZ nosed into the ditch, about a third of the way along */
  {const s=P[P.length-1].s*.36,i=Math.round(s/2),p=P[i],f=roadFrame(P,i);const x=p.x-f.nx*(WX.hw+2.7),z=p.z-f.nz*(WX.hw+2.7);uazWreck(x,z,[.06,Math.atan2(f.tx,f.tz)+.35,.14],-.25);solids.push({cx:x,cz:z,r:1.6});}
  /* the power line: wooden poles every 46 m north of the road; one snapped by a blast, its top half down in the grass */
  {const poles=[];for(let s=40;s<P[P.length-1].s-20;s+=46){const i=Math.round(s/2),p=P[i],f=roadFrame(P,i);const x=p.x+f.nx*(WX.hw+5.8),z=p.z+f.nz*(WX.hw+5.8);poles.push({x,z,y:H(x,z),yaw:Math.atan2(f.tx,f.tz),s,broken:Math.abs(s-420)<23,lean:rr(-.04,.04)});}
   const wood=std({map:TX.bark,color:C(0x6a5e50),roughness:.95});const wires=[];let prev=null;
   for(const p of poles){const o=new T.Object3D();o.position.set(p.x,p.y-.3,p.z);o.rotation.set(p.lean,p.yaw+Math.PI/2,0);o.updateMatrix();
     if(p.broken){const g=new T.CylinderGeometry(.13,.15,2.6,18);g.translate(0,1.3,0);bk.add(g,wood,o.matrix);splinters(bk,new T.Matrix4().compose(V3(p.x,p.y+2.25,p.z),new T.Quaternion(),V3(1,1,1)),.13,0,r_,wood,9,.1,.45);
       const g2=new T.CylinderGeometry(.11,.13,6.3,18);g2.translate(0,3.15,0);bk.add(g2,wood,TRS(p.x+.6,H(p.x+.6,p.z+.5)+.13,p.z+.5,Math.PI/2-.05,p.yaw+1.1,0));solids.push({cx:p.x,cz:p.z,r:.2});
       if(prev){const a=prev.att[1];const end=V3(p.x+2,H(p.x+2,p.z+1)+.05,p.z+1);for(let t=0;t<14;t++){const u0=t/14,u1=(t+1)/14;const f=u=>{const v=a.clone().lerp(end,u);v.y-=Math.sin(u*Math.PI)*1.2*(1-u)+0;return v;};const A=f(u0),B_=f(u1);wires.push(A.x,A.y,A.z,B_.x,B_.y,B_.z);}}prev=null;continue;}
     const pg=new T.CylinderGeometry(.11,.15,9.2,18);pg.translate(0,4.6,0);bk.add(pg,wood,o.matrix);const ag=rbox(2.1,.11,.11,.01);ag.translate(0,8.55,0);bk.add(ag,wood,o.matrix);
     p.att=[-.85,0,.85].map(ox=>V3(ox,8.69,0).applyMatrix4(o.matrix));solids.push({cx:p.x,cz:p.z,r:.22});
     if(prev)for(let j=0;j<3;j++){const a=prev.att[j],b=p.att[j];for(let t=0;t<14;t++){const u0=t/14,u1=(t+1)/14;const sag=u=>-4*.55*u*(1-u);const pa=a.clone().lerp(b,u0),pb=a.clone().lerp(b,u1);pa.y+=sag(u0);pb.y+=sag(u1);wires.push(pa.x,pa.y,pa.z,pb.x,pb.y,pb.z);}}
     prev=p;}
   const wg=new T.BufferGeometry();wg.setAttribute('position',new T.Float32BufferAttribute(wires,3));scene.add(new T.LineSegments(wg,new T.LineBasicMaterial({color:C(0x1c1c1a)})));}
  bk.flush(scene,true);
  /* ===== the trees: a small tree line across the path, copses and field edges along the road, a forest closing in at the
     edges of the country so it never ends in nothing ===== */
  {const pine=speciesTypes(pineGeo,woodMat.bark,MP,TX.spray),birch=speciesTypes(birchGeo,woodMat.birch,MB,TX.twigBirch),bush=speciesTypes(bushGeo,woodMat.dead,MG,TX.twigBush),dead=speciesTypes(deadGeo,woodMat.dead,null,null);
   const col=new T.Color();let n=0;const clear=(x,z)=>{const q=wxRoad(x,z);if(q.d<WX.hw+3.5)return false;if(x>-960&&wxTrail(x,z)<1.6)return false;for(const c of wxCraters())if(Math.hypot(x-c.x,z-c.z)<c.r*1.3)return false;return true;};
   const put=(x,z,kind)=>{if(x>B.x1-1||x<B.x0||z<B.z0||z>B.z1||!clear(x,z))return;const y=H(x,z)-.12,s=rr(.8,1.2);col.setRGB(1,1,1).offsetHSL(rr(-.04,.04),rr(-.1,.1),rr(-.08,.05));
     const L=kind==='pine'?pine:kind==='birch'?birch:kind==='bush'?bush:dead;vegPut(L[(r_()*L.length)|0],x,y,z,rr(0,6.28),kind==='bush'?s*.8:s,s*rr(.9,1.12),col,null);n++;};
   /* the small tree line the path goes through: birch and pine, a few bushes in its edge */
   for(let z=-372;z<-292;z+=rr(2.8,4.2))for(let x=-941;x<-928;x+=rr(3.2,4.6))put(x+rr(-1,1),z+rr(-1,1),r_()<.55?'birch':r_()<.8?'pine':'bush');
   /* the forest north of the road and closing in round the edges of this country */
   for(let x=B.x0+3;x<B.x1-2;x+=5.2)for(let z=B.z0+3;z<B.z1-3;z+=5.2){const jx=x+rr(-2,2),jz=z+rr(-2,2);const q=wxRoad(jx,jz);
     const edge=Math.min(jx-B.x0,B.x1-jx,jz-B.z0,B.z1-jz);const north=q.side>0&&jz>-520;
     let k=0;if(edge<34)k=.9;else if(north&&q.d>26)k=(.22*sstep(.45,.65,fbm(jx/60+4,jz/60,3))+(jz>-300?.3:0))*(1-.7*sstep(-1000,-1150,jx));/* (open country further on: it should feel vast off the road) */else if(q.d>40)k=.12*sstep(.55,.72,fbm(jx/45,jz/45+7,3));
     if(jx>-960&&jz>-420&&jz<-250&&edge>34)k*=jx<-945?.6:.15;/* (open by the yard) */
     if(r_()<k)put(jx,jz,r_()<.5?'pine':r_()<.85?'birch':'dead');}
   /* bushes and a few birches along the ditches */
   for(let s=6;s<P[P.length-1].s;s+=rr(9,22)){const i=Math.round(s/2),p=P[i],f=roadFrame(P,i);const sd=r_()<.5?-1:1,d=rr(WX.hw+4,WX.hw+8);put(p.x+f.nx*d*sd,p.z+f.nz*d*sd,r_()<.7?'bush':'birch');}
   /* the windbreaks' living (or standing dead) trees */
   for(const w of WB)for(const p of w.pts)if(p.kind!=='snag'&&p.kind!=='none')put(p.x,p.z,p.kind);
   /* the odd tree standing alone in the fields, and small clumps round old field corners and the hollows */
   {const q=rng(5151),qq=(a,b)=>a+(b-a)*q();for(let k=0;k<12;k++){const x=qq(B.x0+40,B.x1-30),z=qq(B.z0+40,B.z1-40);if(wxRoad(x,z).d<14)continue;const f=sstep(-1100,-1600,x);
       put(x,z,q()<.25+.45*f?'dead':q()<.6?'birch':'pine');}
     for(let k=0;k<4;k++){const cx=qq(B.x0+60,B.x1-40),cz=qq(B.z0+50,B.z1-50);if(wxRoad(cx,cz).d<20)continue;const n2=3+(q()*5|0);for(let j=0;j<n2;j++){const a=qq(0,6.28),e=qq(1.5,8);put(cx+Math.cos(a)*e,cz+Math.sin(a)*e,q()<.35?'bush':q()<.6?'birch':q()<.2+.5*sstep(-1100,-1600,cx)?'dead':'pine');}}}
   WX.trees=n;}
  /* ===== the battle out there: smoke standing over the horizon to the south-west, and the guns ===== */
  {const PS=thinFog(new PSys(420,PTEX.smoke,false,{order:2}),.075);
   const FL=thinFog(new PSys(24,PTEX.soft,true,{order:6}),.06);
   const DU=thinFog(new PSys(300,PTEX.smoke,false,{order:3}),.08);
   FX.wxSmoke=PS;FX.wxFlash=FL;FX.wxDust=DU;
   const SRC=[[-1950,-760,1],[-2060,-590,.8],[-1840,-890,.7],[-2160,-700,1.1],[-1760,-960,.6]].map(([x,z,k])=>({p:V3(x,22,z),k,t:rr(0,3)}));
   WX.bat={SRC,PS,FL,DU,next:12,queue:[]};}
  window.__wx=WX;})();
/* each frame: smoke columns while you are out here; shells landing far off - a flash, a column of earth thrown up and
   drifting, the sound arriving seconds later; sometimes one, sometimes a short salvo */
function wxTick(dt){const W=WX.bat;if(!W)return;const cp=camera.position;const on=cp.x<-880&&S.chapter===3;
  FX.wxSmoke.mat.uniforms.uScale.value=FX.wxDust.mat.uniforms.uScale.value=FX.wxFlash.mat.uniforms.uScale.value=FX.smoke.mat.uniforms.uScale.value;
  if(!on)return;
  /* (out of the trees the rain eases and the murk lifts as you go, until the horizon and the smoke on it stand clear) */
  const prog=sstep(-960,-1350,cp.x);if(WEATHER.script){const sc=WEATHER.script;sc.rain=lerp(.5,.1,prog);sc.fog=lerp(1.45,1.04,prog);sc.mist=lerp(.6,.1,prog);}
  /* nearer columns: a farm burning a few hundred metres off the road, the last windbreaks smouldering */
  if(!W.MID){W.MID=[[-1585,-350,.55],[-1620,-690,.7],[-1390,-700,.45]].map(([x,z,k])=>({p:V3(x,H(x,z)+3,z),k,t:0}));W.SM=[];const wb=WX.wb||[];
    for(const w of wb.slice(-3))for(let i=0;i<w.pts.length;i+=9)if(w.pts[i].kind==='snag'){const q=w.pts[i];W.SM.push({p:V3(q.x,H(q.x,q.z)+1.2,q.z),t:Math.random()*3});}}
  for(const s of W.MID){s.t-=dt;if(s.t<=0){s.t=.9/s.k;FX.wxSmoke.spawn(s.p.clone().add(V3(wr(-3,3),wr(0,3),wr(-3,3))),V3(1.1+wr(-.3,.3),wr(2.4,3.4),.4+wr(-.2,.2)),wr(28,38),wr(8,12)*s.k,wr(46,70)*s.k,[.09,.085,.08,.85],[.3,.3,.29,0],{drag:.025,up:.04,spin:wr(-.05,.05),fi:.06});}}
  for(const s of W.SM){if(Math.abs(s.p.x-cp.x)>220||Math.abs(s.p.z-cp.z)>220)continue;s.t-=dt;if(s.t<=0){s.t=1.1+Math.random()*1.2;FX.smoke.spawn(s.p.clone().add(V3(wr(-.3,.3),0,wr(-.3,.3))),V3(.3+wr(-.1,.1),.5+wr(0,.3),.15),wr(10,15),.5,3.5+wr(0,1.5),[.22,.21,.2,.3],[.36,.35,.34,0],{drag:.12,spin:wr(-.2,.2)});}}
  for(const s of W.SRC){s.t-=dt;if(s.t<=0){s.t=.6/s.k;FX.wxSmoke.spawn(s.p.clone().add(V3(wr(-8,8),wr(0,6),wr(-8,8))),V3(1.4+wr(-.4,.4),wr(3,4.4),.5+wr(-.3,.3)),wr(34,46),wr(24,32)*s.k,wr(95,135)*s.k,[.07,.066,.06,.95],[.24,.24,.23,0],{drag:.02,up:.05,spin:wr(-.04,.04),fi:.06});}}
  W.next-=dt;if(W.next<=0){const salvo=Math.random()<.35+.2*prog?2+Math.floor(Math.random()*3):1;W.next=(rnd(9,26)+salvo*2)*lerp(1,.55,prog);
    const base=rnd(-2.45,-1.75),R=rnd(650,1300)*lerp(1,.72,prog);for(let k=0;k<salvo;k++){const a=base+rnd(-.12,.12),r=R+rnd(-120,120);W.queue.push({t:k*rnd(.8,2.6),x:cp.x+Math.sin(a)*r,z:cp.z+Math.cos(a)*r,big:Math.random()<.3});}}
  for(let i=W.queue.length-1;i>=0;i--){const q=W.queue[i];q.t-=dt;if(q.t>0)continue;W.queue.splice(i,1);
    const y=Math.min(H(q.x,q.z),cp.y+30),p=V3(q.x,y,q.z),d=p.distanceTo(cp),k=q.big?1.6:1;
    /* the flash */FX.wxFlash.spawn(p.clone().add(V3(0,3,0)),V3(),.18,18*k,34*k,[1,.75,.45,1],[1,.4,.15,0]);
    /* the column: dark earth up fast, then the brown cloud spreading and drifting downwind */
    for(let j=0;j<10;j++)FX.wxDust.spawn(p.clone().add(V3(wr(-4,4),wr(0,3),wr(-4,4))),V3(wr(-3,3),wr(14,26)*k,wr(-3,3)),wr(1.5,2.5),4*k,10*k,[.12,.1,.08,.95],[.2,.18,.15,0],{g:9,drag:.4});
    for(let j=0;j<8;j++)FX.wxDust.spawn(p.clone().add(V3(wr(-6,6),wr(2,10),wr(-6,6))),V3(wr(-2,2)+1.2,wr(2,6),wr(-2,2)+.5),wr(7,11),10*k,34*k,[.36,.32,.27,.7],[.42,.4,.36,0],{drag:.3,up:.1});
    /* the sound: the crack first, the long rumble after, darker the further off */
    if(AC&&AUD.has&&AUD.has('boom')){const out=AUD.pan(p,200,.5,false,.9);const lp=AC.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lerp(900,320,clamp((d-600)/800,0,1));lp.connect(out);AUD.play('boom',lp,(q.big?.9:.6)*clamp(1100/d,.35,1.2),.75+Math.random()*.15,d/343);}
    else if(AC&&AUD.burst){AUD.burst(1.6,.35*clamp(1000/d,.3,1),220,60,'lowpass',.6,d/343);}}
}
