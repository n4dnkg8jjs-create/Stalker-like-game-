/* ---------- trees: real branching structures ----------
   Every tree is grown as a hierarchy: trunk -> limbs -> branches (-> twigs), each a tapered tube swept along a curved
   path. A child starts on its parent's axis with a smaller radius than the parent has there, so every branch is joined
   to the wood it grows from - nothing floats. Foliage cards hang from the actual twigs. Each species has a full-detail
   model for the trees round the player and a light one grown from the same skeleton for the distance. */
function card(w,h,cx,cy,cz,rx,ry,rz,center){const g=new T.PlaneGeometry(w,h);xf(g,cx,cy,cz,rx,ry,rz);
  const p=g.attributes.position,n=g.attributes.normal;for(let i=0;i<p.count;i++){const v=V3(p.getX(i)-center.x,(p.getY(i)-center.y)*1.3,p.getZ(i)-center.z).normalize();n.setXYZ(i,v.x,v.y*.8+.25,v.z);}return g;}
/* tapered tube along a polyline; parallel-transported frames so it never twists; vertex colour per point */
function Wood(){this.p=[];this.n=[];this.uv=[];this.c=[];this.ix=[];this.vi=0;}
Wood.prototype.tube=function(P,rad,sides,vScale,col){const n=P.length;let N=null;const t=V3(),B=V3(),d=V3();let vacc=0;const s0=this.vi;
  for(let k=0;k<n;k++){if(k===0)t.subVectors(P[1],P[0]);else if(k===n-1)t.subVectors(P[n-1],P[n-2]);else t.subVectors(P[k+1],P[k-1]);t.normalize();
    if(!N){N=Math.abs(t.y)<.9?V3(0,1,0).cross(t).normalize():V3(1,0,0).cross(t).normalize();}else{N.addScaledVector(t,-N.dot(t)).normalize();}
    B.crossVectors(t,N);if(k>0)vacc+=P[k].distanceTo(P[k-1]);const r=rad[k],cc=col?col(k/(n-1),P[k],r):[1,1,1];
    for(let s=0;s<=sides;s++){const a=s/sides*Math.PI*2;d.copy(N).multiplyScalar(Math.cos(a)).addScaledVector(B,Math.sin(a));
      this.p.push(P[k].x+d.x*r,P[k].y+d.y*r,P[k].z+d.z*r);this.n.push(d.x,d.y,d.z);this.uv.push(s/sides,vacc/vScale);this.c.push(cc[0],cc[1],cc[2]);}}
  for(let k=0;k<n-1;k++)for(let s=0;s<sides;s++){const a=s0+k*(sides+1)+s,b=a+sides+1;this.ix.push(a,a+1,b,a+1,b+1,b);}
  this.vi+=n*(sides+1);};
Wood.prototype.geo=function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setAttribute('color',new T.Float32BufferAttribute(this.c,3));g.setIndex(this.vi>65535?new T.Uint32BufferAttribute(this.ix,1):new T.Uint16BufferAttribute(this.ix,1));g.computeBoundingSphere();return g;};
/* foliage cards: hung at a point, growing along V, U across; normals bent out from the crown centre so the canopy is
   shaded as a volume rather than as flat sheets */
function Leaves(ctr){this.p=[];this.n=[];this.uv=[];this.ix=[];this.vi=0;this.ctr=ctr;}
Leaves.prototype.add=function(o,U,Vd,w,l){const c=this.ctr,fn=V3().crossVectors(U,Vd).normalize();
  const cs=[[-w/2,0,0,1],[w/2,0,1,1],[w/2,l,1,0],[-w/2,l,0,0]];const q=V3(),nn=V3();
  for(const [a,b,u,v] of cs){q.copy(o).addScaledVector(U,a).addScaledVector(Vd,b);this.p.push(q.x,q.y,q.z);
    nn.subVectors(q,c);nn.y*=.75;nn.normalize();const f=fn.dot(nn)<0?-1:1;nn.multiplyScalar(.7).addScaledVector(fn,.3*f);nn.y+=.22;nn.normalize();this.n.push(nn.x,nn.y,nn.z);this.uv.push(u,v);}
  const i=this.vi;this.ix.push(i,i+1,i+2,i,i+2,i+3);this.vi+=4;};
Leaves.prototype.geo=function(){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(this.p,3));g.setAttribute('normal',new T.Float32BufferAttribute(this.n,3));
  g.setAttribute('uv',new T.Float32BufferAttribute(this.uv,2));g.setIndex(this.vi>65535?new T.Uint32BufferAttribute(this.ix,1):new T.Uint16BufferAttribute(this.ix,1));g.computeBoundingSphere();return g;};
/* a branch path: from p0 along d0, bending under gravity (g<0 droops, g>0 lifts), wandering by `wob` */
function grow(p0,d0,len,n,g,wob,up){const P=[p0.clone()],d=d0.clone().normalize(),p=p0.clone(),st=len/n;
  for(let i=0;i<n;i++){p.addScaledVector(d,st);P.push(p.clone());const t=(i+1)/n;d.y+=g*st*(up?Math.max(0,t-.4)*2.2:1);d.x+=rnd(-wob,wob)*st;d.z+=rnd(-wob,wob)*st;d.normalize();}return P;}
const at=(P,t)=>{const f=t*(P.length-1),i=Math.min(P.length-2,Math.floor(f)),u=f-i;return P[i].clone().lerp(P[i+1],u);};
const dirAt=(P,t)=>{const f=t*(P.length-1),i=Math.min(P.length-2,Math.floor(f));return P[i+1].clone().sub(P[i]).normalize();};
/* a direction leaving axis `a` at angle th, turned round it by phi */
function spread(a,th,phi){const ref=Math.abs(a.y)<.95?V3(0,1,0):V3(1,0,0);const u=V3().crossVectors(a,ref).normalize(),v=V3().crossVectors(a,u);
  return a.clone().multiplyScalar(Math.cos(th)).addScaledVector(u,Math.sin(th)*Math.cos(phi)).addScaledVector(v,Math.sin(th)*Math.sin(phi)).normalize();}
const taper=(n,r0,r1,pw=1)=>Array.from({length:n},(_,i)=>lerp(r0,r1,Math.pow(i/(n-1),pw)));
/* ---- silver birch: a slim white trunk, black and fissured at the foot; ascending limbs whose long branchlets hang ---- */
function birchGeo(){const H0=rnd(10,14),lean=V3(rnd(-.05,.05),1,rnd(-.05,.05)).normalize();
  const W=new Wood(),w=new Wood(),ctr=V3(lean.x*H0*.6,H0*.68,lean.z*H0*.6),Lv=new Leaves(ctr),lv=new Leaves(ctr);
  const trunk=grow(V3(),lean,H0,12,0,.04);const tr=t=>lerp(rnd(.17,.2),.018,Math.pow(t,.8));const TR=trunk.map((_,i)=>lerp(.19,.016,Math.pow(i/11,.85)));
  const bcol=(t,p,r)=>{const foot=1-sstep(.6,2.6,p.y);const thin=1-sstep(.025,.06,r);return[lerp(lerp(1,.34,foot),.38,thin),lerp(lerp(1,.31,foot),.31,thin),lerp(lerp(1,.28,foot),.27,thin)];};
  W.tube(trunk,TR,9,10,bcol);w.tube(trunk.filter((_,i)=>i%3===0||i===11),TR.filter((_,i)=>i%3===0||i===11),4,10,bcol);
  const nb=(rnd(15,20)|0);
  for(let i=0;i<nb;i++){const t=lerp(.3,.96,i/(nb-1))+rnd(-.02,.02),p=at(trunk,t),rT=lerp(.19,.016,Math.pow(t,.85));
    const d=spread(lean,rnd(.6,1.0)*(1-.35*t),i*2.4+rnd(-.3,.3));const L=H0*.34*(1-(t-.3)/.7*.62)*rnd(.8,1.15);
    const P=grow(p,d,L,6,-.16,.15,true),r0=Math.min(rT*.55,.075);
    W.tube(P,taper(7,r0,.006,.8),5,10,bcol);if(t<.62)w.tube([P[0],P[3],P[6]],[r0,r0*.45,.006],3,10,bcol);
    /* hanging branchlets along the limb, each carrying a few leafy twig cards */
    for(let s=.22;s<1;s+=rnd(.08,.12)){const q=at(P,s),dq=dirAt(P,s);const sd=spread(dq,rnd(.7,1.2),rnd(6.28));sd.y-=.6;sd.normalize();
      const l2=rnd(.6,1.4)*(1.1-s*.4),C=grow(q,sd,l2,2,-.9,.3);W.tube(C,taper(3,r0*(1-s)*.55+.004,.003),3,10,bcol);
      for(let k=1;k<=4;k++){const o=at(C,k/4*.95),hang=V3(rnd(-.3,.3),-1,rnd(-.3,.3)).addScaledVector(dirAt(C,k/4*.9),.35).normalize();
        const U=V3().crossVectors(hang,V3(rnd(-1,1),0,rnd(-1,1))).normalize();const sz=rnd(.6,.9);Lv.add(o,U,hang,sz*.9,sz*1.15);}}
    /* the distance model: a handful of bigger cards per limb */
    for(let k=0;k<5;k++){const o=at(P,.3+k*.17),hang=V3(rnd(-.4,.4),-1,rnd(-.4,.4)).normalize();const U=V3().crossVectors(hang,V3(rnd(-1,1),0,rnd(-1,1))).normalize();lv.add(o,U,hang,1.45,1.8);}
    const tip=P[6],hang=V3(rnd(-.3,.3),-1,rnd(-.3,.3)).normalize();Lv.add(tip,V3().crossVectors(hang,V3(1,0,0)).normalize(),hang,.7,1);}
  for(let k=0;k<6;k++){const o=at(trunk,rnd(.86,1)),hang=V3(rnd(-.5,.5),-1,rnd(-.5,.5)).normalize();const U=V3().crossVectors(hang,V3(rnd(-1,1),0,rnd(-1,1))).normalize();Lv.add(o,U,hang,.7,1);lv.add(o,U,hang,1.2,1.5);}
  return{trunk:W.geo(),leaves:Lv.geo(),lo:{trunk:w.geo(),leaves:lv.geo()}};}
/* ---- Norway spruce: a straight tapering trunk, whorls of drooping branches whose tips turn up, clothed in flat sprays;
   in the forest the lowest branches are dead, bare and grey ---- */
function pineGeo(){const H0=rnd(14,20),W=new Wood(),w=new Wood(),ctr=V3(0,H0*.45,0),Lv=new Leaves(ctr),lv=new Leaves(ctr);
  const trunk=grow(V3(),V3(rnd(-.02,.02),1,rnd(-.02,.02)),H0,10,0,.01);const TRd=trunk.map((_,i)=>lerp(.3,.012,Math.pow(i/10,.9)));
  const bcol=(t,p,r)=>{const dead=r<.03?.92:1;return[.9*dead,.84*dead,.8*dead];};
  W.tube(trunk,TRd,9,10,bcol);w.tube(trunk.filter((_,i)=>i%2===0),TRd.filter((_,i)=>i%2===0),4,10,bcol);
  const live0=H0*rnd(.18,.26);let ph=rnd(6.28),wh=0;
  for(let y=H0*.05;y<H0-.3;y+=lerp(.62,.32,y/H0)*rnd(.85,1.15)){const t=y/H0,p=at(trunk,t),rT=lerp(.3,.012,Math.pow(t,.9));ph+=rnd(.5,1.3);
    if(y<live0){/* dead stubs */const n=(rnd(2,4)|0);for(let i=0;i<n;i++){const d=spread(V3(0,1,0),rnd(1.7,2.0),ph+i*6.28/n);const P=grow(p,d,rnd(.3,1.1),2,-.1,.4);
      W.tube(P,[Math.min(rT*.25,.025),.012,.004],3,10,()=>[.62,.6,.58]);}continue;}
    const k=(H0-y)/(H0-live0),L=.3+3.1*Math.pow(k,.85),n=(rnd(5,7)|0);wh++;
    for(let i=0;i<n;i++){const d=spread(V3(0,1,0),Math.PI/2+.12+.28*k+rnd(-.08,.08),ph+i*6.28/n+rnd(-.2,.2));const P=grow(p,d,L,3,.16,.08,true),r0=Math.min(rT*.32,.055);
      if(L>1.1)W.tube(P,[r0,r0*.6,r0*.3,.004],3,10,bcol);else W.tube([P[0],P[3]],[r0,.004],3,10,bcol);
      /* sprays along the branch: one lying flat along it, one hanging off it to the side, overlapping like shingles */
      const m=Math.max(1,Math.round(L/.62));for(let j=0;j<m;j++){const s=j/m*.92,o=at(P,s),dv=dirAt(P,s);const flat=V3().crossVectors(dv,V3(0,1,0)).normalize();
        const len=Math.min(.95,L*(1-s)+.25),wid=lerp(.62,.4,s)*Math.min(1,L/.9+.3);Lv.add(o,flat,dv,wid,len);
        const side=V3().crossVectors(dv,flat).normalize().applyAxisAngle(dv,rnd(-.9,.9));Lv.add(o,V3().crossVectors(dv,side).normalize(),dv.clone().addScaledVector(side,.5).normalize(),wid*.85,len*.9);}
      if(wh%2===0){const flat=V3().crossVectors(d,V3(0,1,0)).normalize();const dn=dirAt(P,.3);lv.add(p,flat,dn,L*.7+.4,L+.25);if(i%3===0)lv.add(p,V3().crossVectors(dn,flat).normalize(),dn,L*.45+.3,L+.15);}}
}
  /* the leader */
  {const p=at(trunk,.97);for(let i=0;i<3;i++){const U=V3(Math.cos(i*2.1),0,Math.sin(i*2.1));Lv.add(V3(0,H0+.25,0),U,V3(0,-1,0),.45,.8);lv.add(V3(0,H0+.2,0),U,V3(0,-1,0),.6,1.2);}}
  return{trunk:W.geo(),leaves:Lv.geo(),lo:{trunk:w.geo(),leaves:lv.geo()}};}
/* ---- Scots pine: tall clean stem, grey and plated below, flaking orange towards the crown; a flat-topped crown of
   crooked limbs ending in brushes of long needles ---- */
function scotsGeo(){const H0=rnd(16,22),lean=V3(rnd(-.04,.04),1,rnd(-.04,.04)).normalize(),W=new Wood(),w=new Wood(),ctr=V3(lean.x*H0,H0*.86,lean.z*H0),Lv=new Leaves(ctr),lv=new Leaves(ctr);
  const trunk=grow(V3(),lean,H0,11,0,.035);const TRd=trunk.map((_,i)=>lerp(.28,.03,Math.pow(i/11,1.1)));
  const bcol=(t,p,r)=>{const o=sstep(H0*.42,H0*.62,p.y);return[lerp(.82,1.45,o),lerp(.76,.82,o),lerp(.72,.55,o)];};
  W.tube(trunk,TRd,9,10,bcol);w.tube(trunk.filter((_,i)=>i%2===0||i===11),TRd.filter((_,i)=>i%2===0||i===11),4,10,bcol);
  for(let i=0;i<5;i++){const t=rnd(.35,.6),p=at(trunk,t);const P=grow(p,spread(lean,rnd(1.3,1.8),rnd(6.28)),rnd(.25,.6),2,-.2,.3);W.tube(P,[.025,.014,.005],3,10,()=>[.7,.66,.6]);}
  const nb=(rnd(12,16)|0);
  for(let i=0;i<nb;i++){const t=lerp(.6,.97,i/(nb-1))+rnd(-.02,.02),p=at(trunk,t),rT=lerp(.28,.03,Math.pow(t,1.1));const L=lerp(3.4,1.2,(t-.64)/.33)*rnd(.8,1.15);
    const d=spread(lean,lerp(1.25,.7,(t-.64)/.33)+rnd(-.15,.15),i*2.4+rnd(-.4,.4));const P=grow(p,d,L,4,.12,.55,true),r0=Math.min(rT*.5,.09);
    W.tube(P,taper(5,r0,.012,.9),4,10,bcol);w.tube([P[0],P[4]],[r0,.012],3,10,bcol);
    const tips=[[P[4],dirAt(P,.99)]];for(let s=.3;s<.95;s+=rnd(.13,.2)){const q=at(P,s),sd=spread(dirAt(P,s),rnd(.5,.9),rnd(6.28));sd.y=Math.abs(sd.y)+.2;sd.normalize();
      const C=grow(q,sd,rnd(.5,1.2),2,.2,.5);W.tube(C,[r0*(1-s)*.5+.008,.01,.006],3,10,bcol);tips.push([C[2],dirAt(C,.99)]);}
    tips.forEach(([q,dq])=>{const up=dq.clone();up.y+=.6;up.normalize();for(let k=0;k<4;k++){const U=V3().crossVectors(up,V3(Math.cos(k*1.6+.3),rnd(-.3,.3),Math.sin(k*1.6+.3))).normalize();
      Lv.add(q.clone().addScaledVector(up,-.18),U,up.clone().applyAxisAngle(U,rnd(-.5,.5)),1.0,1.1);}
      const U=V3().crossVectors(up,V3(rnd(-1,1),0,rnd(-1,1))).normalize();lv.add(q.clone().addScaledVector(up,-.35),U,up,2.1,2.1);if(q===P[4])lv.add(q.clone().addScaledVector(up,-.35),V3().crossVectors(up,U).normalize(),up,2.1,2.1);});}
  return{trunk:W.geo(),leaves:Lv.geo(),lo:{trunk:w.geo(),leaves:lv.geo()}};}
/* ---- dead tree: weathered grey, bark gone in strips, often snapped off; every limb grows from the wood below it ---- */
function deadGeo(){const H0=rnd(5,8.5),W=new Wood(),w=new Wood(),lean=V3(rnd(-.08,.08),1,rnd(-.08,.08)).normalize();
  const snapped=R()<.55,top=snapped?rnd(.55,.8):1;const trunk=grow(V3(),lean,H0*top,9,0,.08);const r0=rnd(.17,.24);
  const TRd=trunk.map((_,i)=>lerp(r0,snapped?r0*.45:.02,Math.pow(i/9,.8)));
  const col=(t,p,r)=>{const n=fbm(p.y*2.3+r*40,p.x*3+p.z*3,2);const peel=sstep(.52,.6,n);return[lerp(.82,1.08,peel),lerp(.79,1.0,peel),lerp(.75,.9,peel)];};
  W.tube(trunk,TRd,9,10,col);w.tube(trunk.filter((_,i)=>i%2===0||i===9),TRd.filter((_,i)=>i%2===0||i===9),6,10,col);
  if(snapped){/* jagged break: a few splinters standing up from the stump top */const p=trunk[9],rr=TRd[9];for(let k=0;k<5;k++){const a=k/5*6.28+rnd(.4),q=p.clone().add(V3(Math.cos(a)*rr*.6,-.05,Math.sin(a)*rr*.6));
    W.tube([q,q.clone().add(V3(Math.cos(a)*.03,rnd(.15,.45),Math.sin(a)*.03))],[rr*.35,.004],3,10,col);}}
  const nb=(rnd(10,15)|0);
  for(let i=0;i<nb;i++){const t=rnd(.3,.95)*top/Math.max(top,.001),tt=Math.min(.97,t),p=at(trunk,tt),rT=lerp(r0,.02,Math.pow(tt,.8));const L=rnd(1,2.8)*(1.1-tt*.5);
    const P=grow(p,spread(lean,rnd(.6,1.25),i*2.4+rnd(-.4,.4)),L,5,rnd(-.12,.18),.5),rb=Math.min(rT*.5,.07);W.tube(P,taper(6,rb,.008,.8),4,10,col);w.tube([P[0],P[2],P[5]],[rb,rb*.5,.008],3,10,col);
    for(let s=.3;s<.95;s+=rnd(.2,.32)){const q=at(P,s),C=grow(q,spread(dirAt(P,s),rnd(.5,1),rnd(6.28)),rnd(.35,1.1)*(1.1-s),3,.05,.7);W.tube(C,[rb*(1-s)*.6+.005,.008,.005,.003],3,10,col);
      if(R()<.5){const q2=at(C,.6),C2=grow(q2,spread(dirAt(C,.6),rnd(.5,.9),rnd(6.28)),rnd(.2,.45),2,0,.8);W.tube(C2,[.006,.004,.002],3,10,col);}}}
  return{trunk:W.geo(),lo:{trunk:w.geo()}};}
/* ---- undergrowth: hazel / alder clumps - stems fanning out of one root, arching, leafy shoots along them ---- */
function bushGeo(){const W=new Wood(),w=new Wood(),ctr=V3(0,.9,0),Lv=new Leaves(ctr),lv=new Leaves(ctr);const n=(rnd(5,9)|0),Hb=rnd(1.3,2.4);
  for(let i=0;i<n;i++){const d=spread(V3(0,1,0),rnd(.15,.7),i*2.4+rnd(-.3,.3)),P=grow(V3(rnd(-.08,.08),0,rnd(-.08,.08)),d,Hb*rnd(.75,1.1),4,-.18,.3,true);
    W.tube(P,[.026,.02,.012,.007,.004],4,6,()=>[.7,.65,.6]);w.tube([P[0],P[2],P[4]],[.026,.012,.004],3,6,()=>[.7,.65,.6]);
    for(let s=.2;s<1.01;s+=rnd(.07,.12)){const o=at(P,Math.min(s,.99)),dv=dirAt(P,Math.min(s,.98));const sd=spread(dv,rnd(.5,1.1),rnd(6.28));sd.y-=.25;sd.normalize();
      const U=V3().crossVectors(sd,V3(rnd(-1,1),rnd(-.2,.2),rnd(-1,1))).normalize();const sz=rnd(.38,.58);Lv.add(o,U,sd,sz,sz*1.15);}
    for(let k=0;k<2;k++){const o=at(P,.45+k*.4),sd=spread(dirAt(P,.6),.9,rnd(6.28));const U=V3().crossVectors(sd,V3(0,1,0)).normalize();lv.add(o,U,sd,1,1.2);}}
  return{trunk:W.geo(),leaves:Lv.geo(),lo:{trunk:w.geo(),leaves:lv.geo()}};}
/* ---- an old apple tree (the yards' fruit tree): a short crooked trunk, dark scaly bark, splitting low into a few
   heavy limbs that spread out and down under their own weight; side branches off every limb, the twigs dense with leaf,
   the crown wider than it is tall. Every limb starts inside the wood it grows from. ---- */
function appleGeo(){const W=new Wood(),w=new Wood(),th=rnd(.9,1.35),H0=rnd(3.3,4.6),lean=V3(rnd(-.12,.12),1,rnd(-.12,.12)).normalize();
  const ctr=V3(lean.x*th,th+(H0-th)*.5,lean.z*th),Lv=new Leaves(ctr),lv=new Leaves(ctr);
  const bcol=(t,p,r)=>{const k=.55+.25*sstep(.02,.08,r);return[k*.95,k*.88,k*.8];};
  const trunk=grow(V3(),lean,th,5,0,.18);const r0=rnd(.1,.13);const TR=taper(6,r0,r0*.72,1);W.tube(trunk,TR,10,3,bcol);w.tube([trunk[0],trunk[5]],[r0,r0*.72],5,3,bcol);
  const top=trunk[5],nl=(rnd(3,6)|0);
  for(let i=0;i<nl;i++){const d=spread(lean,rnd(.55,1.05),i*6.28/nl+rnd(-.3,.3)),L=rnd(1.7,2.6)*(H0/4);
    const P=grow(top.clone().addScaledVector(d,-.04),d,L,6,-.22,.35,false),lr=r0*.62;W.tube(P,taper(7,lr,.012,.9),7,3,bcol);w.tube([P[0],P[3],P[6]],[lr,lr*.5,.012],4,3,bcol);
    /* side branches: shorter, more level, crooked */
    for(let s=.25;s<.95;s+=rnd(.16,.24)){const q=at(P,s),dq=dirAt(P,s);const sd=spread(dq,rnd(.6,1.1),rnd(6.28));sd.y=Math.abs(sd.y)*.6+.1;sd.normalize();
      const l2=rnd(.7,1.3)*(1.1-s*.5),C=grow(q,sd,l2,4,-.25,.6,false),br=Math.min(lr*(1-s)*.7,.035)+.006;W.tube(C,taper(5,br,.004,.9),4,3,bcol);
      /* leafy twigs all along: clusters of leaf cards facing out and a little up */
      for(let k=1;k<=5;k++){const o=at(C,k/5*.96),out=V3().subVectors(o,ctr).setY(0).normalize();const dv=V3(out.x*.6+rnd(-.4,.4),rnd(.1,.7),out.z*.6+rnd(-.4,.4)).normalize();
        const U=V3().crossVectors(dv,V3(rnd(-1,1),rnd(-.3,.3),rnd(-1,1))).normalize();const sz=rnd(.42,.62);Lv.add(o,U,dv,sz,sz*1.05);if(k%2)Lv.add(o,V3().crossVectors(dv,U).normalize(),dv,sz*.9,sz);}
      lv.add(at(C,.6),V3().crossVectors(sd,V3(0,1,0)).normalize(),V3(sd.x,.5,sd.z).normalize(),1.3,1.3);}
    for(let k=0;k<3;k++){const o=at(P,.5+k*.22),dv=V3(rnd(-.5,.5),rnd(.3,.8),rnd(-.5,.5)).normalize();const U=V3().crossVectors(dv,V3(1,0,0)).normalize();Lv.add(o,U,dv,.55,.6);lv.add(o,U,dv,1.2,1.2);}}
  return{trunk:W.geo(),leaves:Lv.geo(),lo:{trunk:w.geo(),leaves:lv.geo()}};}
/* ---- foliage material: alpha-tested, lit on both faces from the bent normals, swaying with the wind; the alpha is
   boosted with distance so mipmapping cannot thin the canopy into see-through lace (the usual reason distant trees
   look sparse and their shadows let the sun straight through) ---- */
const FOLIAGE_A=`{vec2 tsz=vec2(512.);vec2 dx=dFdx(vUv*tsz),dy=dFdy(vUv*tsz);float lod=max(0.,.5*log2(max(dot(dx,dx),dot(dy,dy))));diffuseColor.a*=1.+lod*.33;}`;
function fixFoliageAlpha(s){s.fragmentShader=s.fragmentShader.replace('#include <alphatest_fragment>',FOLIAGE_A+'\n#include <alphatest_fragment>');}
const leafMats={};
/* a crown shades itself, but light also scatters through the leaves and the sky lights it from all round: in a leaf
   the sun's shadow only takes away part of the light, the sky term is stronger, and the sun shining through from
   behind adds a warm glow */
const LEAF_LIGHT=T.ShaderChunk.lights_fragment_begin.replace('directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow(','directLight.color *= all( bvec2( directLight.visible, receiveShadow ) ) ? .38+.62*getShadow(')
  .replace(/RE_Direct\( directLight, geometry, material, reflectedLight \);/g,'RE_Direct( directLight, geometry, material, reflectedLight );reflectedLight.directDiffuse+=material.diffuseColor*directLight.color*max(0.,-dot(geometry.normal,directLight.direction))*.3;');
function leafMat(t,key){const m=std({map:t,alphaTest:.5,side:T.DoubleSide,roughness:.82,envMapIntensity:.35});m.defines.NO_PUDDLE='';m.extensions={derivatives:true};
  m.onBeforeCompile=s=>{s.uniforms.uTime=GRASS.uni.uTime;fixFoliageAlpha(s);s.fragmentShader=s.fragmentShader.replace('#include <lights_fragment_begin>',LEAF_LIGHT).replace('#include <lights_fragment_end>','#include <lights_fragment_end>\nreflectedLight.indirectDiffuse*=1.7;');s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP);s.vertexShader='uniform float uTime;\n'+s.vertexShader.replace('#include <begin_vertex>',
  '#include <begin_vertex>\n#ifdef USE_INSTANCING\nfloat ph=instanceMatrix[3].x*0.13+instanceMatrix[3].z*0.11;\ntransformed.x+=sin(uTime*1.2+ph+position.y*0.3)*0.05*position.y*0.15;\ntransformed.z+=cos(uTime*0.9+ph)*0.04*position.y*0.15;\n#endif');};
  m.customProgramCacheKey=()=>'leaf2';leafMats[key]=m;return m;}
const MB=leafMat(TX.twigBirch,'b'),MG=leafMat(TX.twigBush,'g'),MP=leafMat(TX.spray,'p'),MS=leafMat(TX.tuft,'s');
const depthMat=t=>{const m=new T.MeshDepthMaterial({depthPacking:T.RGBADepthPacking,map:t,alphaTest:.5});m.extensions={derivatives:true};m.onBeforeCompile=fixFoliageAlpha;m.customProgramCacheKey=()=>'leafdepth';return m;};
/* (bush stems take the dead-wood material) */
const woodMat={birch:std({map:TX.birch,roughness:.9,vertexColors:true}),bark:std({map:TX.bark,roughness:1,vertexColors:true}),dead:std({map:TX.bark,color:C(0x9a948a),roughness:1,vertexColors:true})};
const treeSpots={birch:[],pine:[],dead:[],bush:[]};
(function plan(){
  const ok=(x,z,clear)=>{if(Math.abs(x)<clear+4)return false;if(Math.abs(x)<52&&Math.abs(z)<44)return false;if(Math.hypot(x-HX,z-HZ)<20)return false;
    if(Math.abs(z+262)<4)return false;
    /* keep the forest track and the highway with its fields clear; the new forest along them is planted separately */
    const q=roadQuery(x,z);if(q.dT<clear+4)return false;if(q.dH<(q.sideH<0?72:27))return false;if(forestF(x,z)>0)return false;return true;};
  for(let i=0;i<1400;i++){const x=rnd(-360,360),z=rnd(-590,290);const edge=Math.max(sstep(150,230,Math.abs(x)),sstep(-470,-540,z),sstep(150,230,z),1-sstep(60,110,Math.abs(z+100))*sstep(70,30,Math.abs(x)) );
    const n=fbm(x/45,z/45,3);let p;
    if(z>-480&&z<-200&&Math.abs(x)<150)p=sstep(.6,.72,n)*.6;
    else if(Math.abs(x)<120&&z>-110&&z<130)p=sstep(.62,.75,n)*.35;
    else p=.6+.4*n+edge*.0;
    if(R()>p)continue;if(!ok(x,z,6))continue;
    (R()<(z<-200?.7:.45)?treeSpots.birch:treeSpots.pine).push([x,z]);}
  for(let i=0;i<700;i++){const x=rnd(-200,200),z=rnd(-500,150);if(!ok(x,z,3))continue;if(fbm(x/30,z/30,2)<.48)continue;treeSpots.bush.push([x,z]);}
  [[HX-12,HZ+9],[HX+9,HZ-8],[HX-10,HZ-7],[-58,-300],[22,-410]].forEach(p=>treeSpots.dead.push(p));
})();
/* ---- planting: every tree goes into a registry by model; at boot the registry is turned into (a) the distance models,
   instanced in 96 m chunks that the frustum can cull, and (b) one full-detail instanced mesh per model and quarter round
   the camera holding just the trees within VEG.R. When you move, the trees that crossed VEG.R are swapped between the
   two (the far copy is hidden by a zero matrix). ---- */
/* an InstancedMesh is frustum-culled with its geometry's bounding sphere; make that sphere enclose all instances */
function fitInstBounds(im,pts,pad){let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(const p of pts){x0=Math.min(x0,p[0]);x1=Math.max(x1,p[0]);z0=Math.min(z0,p[1]);z1=Math.max(z1,p[1]);}
  const c=V3((x0+x1)/2,6,(z0+z1)/2),r=Math.hypot(x1-x0,z1-z0)/2+pad;im.geometry.boundingSphere=new T.Sphere(c,r);}
const VEG={types:[],R:46,last:null};
function vegType(g,trunkMat,leafM,leafTex){const t={g,tm:trunkMat,lm:leafM,lt:leafTex,M:[],C:[],P:[]};VEG.types.push(t);return t;}
const _vo=new T.Object3D(),_vc=new T.Color();
function vegPut(t,x,y,z,ry,s,sy,col,tilt){_vo.position.set(x,y,z);_vo.rotation.set(tilt?tilt[0]:0,ry,tilt?tilt[1]:0);_vo.scale.set(s,sy,s);_vo.updateMatrix();
  t.M.push(..._vo.matrix.elements);t.P.push(x,z);t.C.push(col?col.r:1,col?col.g:1,col?col.b:1);}
/* a fixed set of models per species, shared by every planting (fields, forest, verges): fewer distinct meshes means
   far fewer draw calls for the same forest */
const SPECIES=new Map(),NVAR=new Map([[birchGeo,3],[pineGeo,3],[scotsGeo,2],[deadGeo,2],[bushGeo,2],[appleGeo,3]]);
function speciesTypes(geoFn,trunkMat,leafM,leafTex){let L=SPECIES.get(geoFn);if(!L){L=Array.from({length:NVAR.get(geoFn)||2},()=>vegType(geoFn(),trunkMat,leafM,leafTex));SPECIES.set(geoFn,L);}return L;}
function plant(geoFn,variants,list,trunkMat,leafM,leafTex,tint,col,tilt){if(!list.length)return;const L=speciesTypes(geoFn,trunkMat,leafM,leafTex);
  list.forEach(p=>{const s=rnd(.8,1.2),t=L[R()*L.length|0];_vc.copy(tint||_white).offsetHSL(rnd(-.04,.04),rnd(-.1,.1),rnd(-.08,.06));
    vegPut(t,p[0],H(p[0],p[1])-.15,p[1],rnd(6.28),s,s*rnd(.9,1.1),_vc,tilt?[rnd(-.03,.03),rnd(-.03,.03)]:null);if(col)solids.push({cx:p[0],cz:p[1],r:col*s});});}
const _white=new T.Color(1,1,1);
function vegBuild(){const m4=new T.Matrix4();
  for(const t of VEG.types){const n=t.P.length/2;if(!n)continue;const g=t.g,lo=g.lo||{};t.M=Float32Array.from(t.M);t.C=Float32Array.from(t.C);
    const ext=(g.trunk&&g.trunk.boundingSphere?g.trunk.boundingSphere.center.length()+g.trunk.boundingSphere.radius:4)*1.25;
    const share=src=>{const q=new T.BufferGeometry();q.index=src.index;for(const a in src.attributes)q.setAttribute(a,src.attributes[a]);return q;};
    const mk=(geo,mat,cnt,leaf)=>{const im=new T.InstancedMesh(share(geo),mat,cnt);im.castShadow=true;im.receiveShadow=true;im.userData.chunked=true;if(leaf)im.customDepthMaterial=depthMat(t.lt);return im;};
    /* far: chunks */
    t.where=new Int32Array(n*2);t.near=new Uint8Array(n);t.chunks=[];const groups=new Map();
    for(let i=0;i<n;i++){const k=Math.floor(t.P[i*2]/128)+','+Math.floor(t.P[i*2+1]/128);let G=groups.get(k);if(!G)groups.set(k,G=[]);G.push(i);}
    for(const idx of groups.values()){const ch={idx,meshes:[]};const ci=t.chunks.length;t.chunks.push(ch);let cx=0,cz=0;idx.forEach(i=>{cx+=t.P[i*2];cz+=t.P[i*2+1];});cx/=idx.length;cz/=idx.length;let r=0;
      idx.forEach((i,j)=>{r=Math.max(r,Math.hypot(t.P[i*2]-cx,t.P[i*2+1]-cz));t.where[i*2]=ci;t.where[i*2+1]=j;});
      /* (the far copies cast no shadow: everything inside the shadow map's reach is drawn by the near models) */
      [[lo.trunk||g.trunk,t.tm,false],[lo.leaves||g.leaves,t.lm,true]].forEach(([geo,mat,leaf])=>{if(!geo||!mat||!geo.attributes||!geo.attributes.position)return;const im=mk(geo,mat,idx.length,leaf);im.castShadow=false;
        idx.forEach((i,j)=>{m4.fromArray(t.M,i*16);im.setMatrixAt(j,m4);if(leaf){_vc.setRGB(t.C[i*3],t.C[i*3+1],t.C[i*3+2]);im.setColorAt(j,_vc);}});
        im.geometry.boundingSphere=new T.Sphere(V3(cx,8,cz),r+ext+8);scene.add(im);ch.meshes.push(im);});}
    /* near: one full-detail mesh per quarter round the camera */
    t.hi=[];const cap=Math.min(n,520);
    for(let q=0;q<4;q++){const set=[];[[g.trunk,t.tm,false],[g.leaves,t.lm,true]].forEach(([geo,mat,leaf])=>{if(!geo||!mat||!geo.attributes||!geo.attributes.position)return;const im=mk(geo,mat,cap,leaf);
      /* (the colour buffer is sized from .count, so create it while the mesh still has its full capacity) */
      if(leaf){_vc.setRGB(1,1,1);im.setColorAt(0,_vc);}im.count=0;im.geometry.boundingSphere=new T.Sphere(V3(),1);scene.add(im);set.push(im);});t.hi.push(set);}}}
const _zero=new T.Matrix4().makeScale(0,0,0),_hm=new T.Matrix4();
function vegLOD(force){const cx=camera.position.x,cz=camera.position.z;if(!force&&VEG.last&&Math.hypot(cx-VEG.last[0],cz-VEG.last[1])<2.5)return;VEG.last=[cx,cz];const R2=VEG.R*VEG.R;
  for(const t of VEG.types){if(!t.hi)continue;const n=t.P.length/2,Q=[[],[],[],[]],dirty=new Set();
    for(let i=0;i<n;i++){const dx=t.P[i*2]-cx,dz=t.P[i*2+1]-cz,nr=dx*dx+dz*dz<R2?1:0;if(nr)Q[(dx>=0?1:0)+(dz>=0?2:0)].push(i);
      if(nr!==t.near[i]){t.near[i]=nr;const ch=t.chunks[t.where[i*2]],j=t.where[i*2+1];if(nr)_hm.copy(_zero);else _hm.fromArray(t.M,i*16);ch.meshes.forEach(im=>im.setMatrixAt(j,_hm));dirty.add(ch);}}
    dirty.forEach(ch=>ch.meshes.forEach(im=>im.instanceMatrix.needsUpdate=true));
    /* far chunks close enough to throw shadow into the shadow map's reach still cast (beyond the near ring) */
    for(const ch of t.chunks){const b=ch.meshes[0]&&ch.meshes[0].geometry.boundingSphere;if(!b)continue;const near=Math.hypot(b.center.x-cx,b.center.z-cz)-b.radius<70;ch.meshes.forEach(im=>im.castShadow=near);}
    for(let q=0;q<4;q++){const L=Q[q],set=t.hi[q];if(!set.length)continue;const cap=set[0].instanceMatrix.count;const k=Math.min(L.length,cap);
      let x0=1e9,x1=-1e9,z0=1e9,z1=-1e9;for(let j=0;j<k;j++){const i=L[j],x=t.P[i*2],z=t.P[i*2+1];x0=Math.min(x0,x);x1=Math.max(x1,x);z0=Math.min(z0,z);z1=Math.max(z1,z);}
      for(const im of set){im.count=k;for(let j=0;j<k;j++){const i=L[j];im.instanceMatrix.array.set(t.M.subarray(i*16,i*16+16),j*16);if(im.instanceColor){im.instanceColor.array[j*3]=t.C[i*3];im.instanceColor.array[j*3+1]=t.C[i*3+1];im.instanceColor.array[j*3+2]=t.C[i*3+2];}}
        im.instanceMatrix.needsUpdate=true;if(im.instanceColor)im.instanceColor.needsUpdate=true;
        if(k)im.geometry.boundingSphere.set(V3((x0+x1)/2,9,(z0+z1)/2),Math.hypot(x1-x0,z1-z0)/2+14);else im.geometry.boundingSphere.set(V3(0,-999,0),.1);}}}}
{const pin=treeSpots.pine,sp=pin.filter((_,i)=>i%5<3),sc=pin.filter((_,i)=>i%5>=3);
 plant(birchGeo,4,treeSpots.birch,woodMat.birch,MB,TX.twigBirch,new T.Color(1,1,1),.25);
 plant(pineGeo,3,sp,woodMat.bark,MP,TX.spray,new T.Color(1,1,1),.33);
 plant(scotsGeo,3,sc,woodMat.bark,MS,TX.tuft,new T.Color(1,1,1),.3);
 plant(deadGeo,3,treeSpots.dead,woodMat.dead,null,null,null,.25);
 plant(bushGeo,3,treeSpots.bush,woodMat.dead,MG,TX.twigBush,new T.Color(1,1,1),0);}
/* rocks */
(function(){for(let vi=0;vi<3;vi++){const g=rockGeo(vi+1,{col:[.6,.58,.53]});
  const n=24,m=new T.InstancedMesh(g,rockMat(),n);const o=new T.Object3D();m.castShadow=m.receiveShadow=true;
  for(let i=0;i<n;i++){let x,z;do{x=rnd(-180,180);z=rnd(-500,200);}while(Math.abs(x)<8||(Math.abs(x)<50&&Math.abs(z)<42));const s=rnd(.15,.7);o.position.set(x,H(x,z)-s*.2,z);o.rotation.set(rnd(.3),rnd(6.28),rnd(.3));o.scale.setScalar(s);o.updateMatrix();m.setMatrixAt(i,o.matrix);}
  m.geometry=m.geometry.clone();m.geometry.boundingSphere=new T.Sphere(V3(0,0,-150),400);scene.add(m);}})();
