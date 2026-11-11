/* ---------- logs: the hewn log (hqLog) shared by the village, the farmhouse and the well, and its texture - weathered
   pine gone silver-grey and brown, the long drying checks along it, knots, the adze marks of the hewing, darker in the
   checks and low down. The texture is drawn at the log's own proportions: 3.14 m along it by its girth round it
   (0.785 m for a 25 cm log), so knots are round and checks run straight - not the stretched streaks of a square
   texture wrapped on a long cylinder. ---------- */
function pbrRect(w,h,fn,o={}){const A=document.createElement('canvas');A.width=w;A.height=h;const ga=A.getContext('2d'),ia=ga.createImageData(w,h),da=ia.data;const Hh=new Float32Array(w*h),Rr=new Float32Array(w*h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const r=fn(x/w,y/h,x,y),i=y*w+x;da[i*4]=r[0];da[i*4+1]=r[1];da[i*4+2]=r[2];da[i*4+3]=255;Hh[i]=r[3];Rr[i]=r[4];}ga.putImageData(ia,0,0);
  const N=document.createElement('canvas');N.width=w;N.height=h;const gn=N.getContext('2d'),inn=gn.createImageData(w,h),dn=inn.data;const Rc=document.createElement('canvas');Rc.width=w;Rc.height=h;const gr=Rc.getContext('2d'),ir=gr.createImageData(w,h),dr=ir.data;
  const k=(o.bump||4)*h/256,at=(x,y)=>Hh[((y+h)%h)*w+((x+w)%w)];
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const i=y*w+x,du=(at(x+1,y)-at(x-1,y))*.5,dv=(at(x,y-1)-at(x,y+1))*.5;let nx=-du*k,ny=-dv*k,nz=1;const l=Math.hypot(nx,ny,nz);
    dn[i*4]=(nx/l*.5+.5)*255;dn[i*4+1]=(ny/l*.5+.5)*255;dn[i*4+2]=(nz/l*.5+.5)*255;dn[i*4+3]=255;const rv=clamp(Rr[i],0,1)*255;dr[i*4]=dr[i*4+1]=dr[i*4+2]=rv;dr[i*4+3]=255;}
  gn.putImageData(inn,0,0);gr.putImageData(ir,0,0);
  const mk=(c,srgb)=>{const t=new T.CanvasTexture(c);t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=8;if(srgb)t.encoding=T.sRGBEncoding;return t;};return{a:mk(A,true),n:mk(N,false),r:mk(Rc,false)};}
const LOGTEX=(()=>{const W=1024,Hh=256;
  /* the features first, in pixel space (4 px per cm both ways): checks as long wandering cracks, knots as round whorls */
  const q=rng(4401),checks=[],knots=[];for(let i=0;i<9;i++)checks.push({x0:q()*W,y:q()*Hh,len:150+q()*600,w:1+q()*2.2,ph:q()*6});for(let i=0;i<11;i++)knots.push({x:q()*W,y:q()*Hh,r:6+q()*12,dark:q()<.6});
  const wrapD=(a,b,P)=>{let d=a-b;d-=Math.round(d/P)*P;return d;};
  return pbrRect(W,Hh,(u,v,x,y)=>{const gr=N2(u*1.5,v*14,6,3),n=N2(u*2,v*.5,5,4),fine=N2(u*14,v*40,20,2),adze=Math.sin((u*96+N2(u,v,6,2)*3)*Math.PI*2)*.5+.5;
    /* knots: the grain swirls round them */let kn=0,swirl=0;for(const k of knots){const dx=wrapD(x,k.x,W),dy=wrapD(y,k.y,Hh),d=Math.hypot(dx*.8,dy);if(d<k.r)kn=Math.max(kn,(k.dark?1:.6)*sstep(k.r,k.r*.4,d));swirl+=Math.exp(-d*d/(k.r*k.r*9))*.5;}
    let ck=0;for(const c of checks){const dx=wrapD(x,c.x0,W);if(dx<0||dx>c.len)continue;const yy=c.y+Math.sin(dx*.012+c.ph)*6+Math.sin(dx*.05+c.ph)*1.5,dy=Math.abs(wrapD(y,yy,Hh)),wl=c.w*Math.sin(Math.PI*dx/c.len);if(dy<wl+1.2)ck=Math.max(ck,sstep(wl+1.2,wl*.3,dy));}
    const g2=gr+swirl*Math.sin(v*80+u*20)*.3;let k=132+(g2-.5)*46+(n-.5)*36+(fine-.5)*14;let c=[k*.95,k*.9,k*.82];
    c=mixc(c,[150,148,142],sstep(.5,.75,n)*.35);/* silvered where the weather got at it */c=mixc(c,[92,72,52],sstep(.55,.3,n)*.3);/* browner in the lee */
    c=mixc(c,[118,108,92],adze*.08);c=mixc(c,[70,50,34],kn*.85);c=mixc(c,[26,22,18],ck*.9);
    return[c[0],c[1],c[2],.55+(g2-.5)*.35+adze*.05-ck*.7-kn*.15,.92-ck*.05+kn*.04];},{bump:5});})();
TX.endgrain=tex(256,256,(g,w,h)=>{pix(g,w,h,(u,v)=>{const x=u-.5,y=v-.5,cx=.03,cy=-.02,r=Math.hypot(x-cx,y-cy)*2,a=Math.atan2(y-cy,x-cx);
  const ring=.5+.5*Math.sin(r*58+fbmT(u,v,6,3)*5);const chk=sstep(.025,0,Math.abs(Math.sin(a*3+1.3)))*sstep(.15,.6,r)*.8+sstep(.02,0,Math.abs(Math.sin(a*5-.4)))*sstep(.3,.7,r)*.4;
  let k=150+ring*26-r*30;let c=[k*.92,k*.8,k*.62];c=mixc(c,[70,58,44],chk);const bark=sstep(.86,.92,r);c=mixc(c,[52,44,36],bark);const gr=sstep(.6,.9,fbmT(u,v,4,3))*.25;c=mixc(c,[96,98,88],gr);
  return c;});},{clamp:true});
const LOGM=std({map:LOGTEX.a,normalMap:LOGTEX.n,roughnessMap:LOGTEX.r,normalScale:new T.Vector2(1.1,1.1),roughness:1,envMapIntensity:.25});
function hqLog(A,B,r,q,o={}){const d=V3().subVectors(B,A),L=d.length(),rs=o.rs||14,ls=Math.max(1,Math.round(L/(o.seg||.7)));
    const g=new T.CylinderGeometry(1,1,L,rs,ls,true),P=g.attributes.position,U=g.attributes.uv;const ph=q()*6.28,ph2=q()*6.28,bow=(q()-.5)*(o.bow===undefined?.04:o.bow),tap=o.taper===undefined?.08:o.taper,ov=.03+q()*.03;
    const rad=(a,t)=>r*(1+tap*(.5-t))*(1+ov*Math.sin(a*2+ph)+.018*Math.sin(a*5+t*7+ph2)+.025*Math.sin(t*L*2.3+ph)*Math.sin(t*L*.9+ph2));
    for(let i=0;i<P.count;i++){const y=P.getY(i),t=.5-y/L,a=Math.atan2(P.getZ(i),P.getX(i)),rr=rad(a,t),b=bow*(1-4*(t-.5)*(t-.5));
      P.setXYZ(i,Math.cos(a)*rr+b,y,Math.sin(a)*rr);/* (u along the log, v round it - the log texture is 3.14 m by one log's girth, so nothing is stretched) */U.setXY(i,t*L/3.14+ph,U.getX(i));}
    g.computeVertexNormals();
    /* end faces: a fan from the centre to the exact rim vertices of each end ring */
    const cap=(j,sg)=>{const pos=[],uv=[],nr=[];const c=j*(rs+1);const cx=P.getX(c)*0,cy=P.getY(c);let mx=0,mz=0;for(let k=0;k<rs;k++){mx+=P.getX(c+k);mz+=P.getZ(c+k);}mx/=rs;mz/=rs;
      const u0=(q()-.5)*.1,v0=(q()-.5)*.1;for(let k=0;k<rs;k++){const a0=c+k,a1=c+k+1;const pts=[[mx,cy,mz],[P.getX(a0),cy,P.getZ(a0)],[P.getX(a1),cy,P.getZ(a1)]];if(sg<0)pts.reverse();
        for(const [x,y,z] of pts){pos.push(x,y,z);uv.push(u0+(x-mx)/(2.2*r)+.5,v0+(z-mz)/(2.2*r)+.5);nr.push(0,sg,0);}}
      const cg=new T.BufferGeometry();cg.setAttribute('position',new T.Float32BufferAttribute(pos,3));cg.setAttribute('normal',new T.Float32BufferAttribute(nr,3));cg.setAttribute('uv',new T.Float32BufferAttribute(uv,2));return cg;};
    const caps=[cap(0,1),cap(ls,-1)];const cg=merge(caps);
    const m=new T.Matrix4().compose(A.clone().add(B).multiplyScalar(.5),new T.Quaternion().setFromUnitVectors(V3(0,1,0),d.normalize()),V3(1,1,1));g.applyMatrix4(m);cg.applyMatrix4(m);
    return{side:g,cap:cg};}
/* painted boards gone shabby: the paint (white here - each house's colour is the material's tint) brushed along the
   grain, chalky, flaking off in patches that show the grey wood under it, darker streaks where the rain runs off */
/* weathered painted boards: the paint goes in ragged flakes - bigger and more of them along each board's lower drip
   edge, their edges following the grain - showing silver-grey weathered wood with its grain; hairline cracks run along
   the grain in what paint is left, a dark lip rims each flake, dirt streaks run down from the laps */
PB.peel=pbr(512,(u,v)=>{const b=Math.floor(v*5),bv=v*5-b;
  const grain=N2(u,v*8,24,3),n=N2(u,v,6,4),w=N2(u*2,v*2,5,3),pm=N2(u*2,v,7,5),run=N2(u*4,v,10,2),ck=N2(u,v*6,20,2);
  const seam=sstep(.035,0,bv)+sstep(.965,1,bv);const drip=.1*(1-sstep(.0,.28,bv))*sstep(.42,.62,N2(u*2,v,5,3));
  const m=pm+(w-.5)*.16+drip+(grain-.5)*.1;const peel=sstep(.71,.74,m),lip=sstep(.67,.71,m)*(1-peel);
  let c;if(peel>.5){const k=118+(grain-.5)*80+(n-.5)*24;c=[k,k*.955,k*.89];}
  else{const k=214+(n-.5)*24;c=[k,k*.99,k*.965];const cr=1-sstep(0,.035,Math.abs(ck-.5));c=mixc(c,[110,104,96],cr*.35+lip*.45);c=mixc(c,[150,142,128],sstep(.6,.82,run)*.3);}
  c=mixc(c,[62,56,48],seam*.75);
  const h=peel>.5?.42+(grain-.5)*.22:.6+lip*.06-(1-sstep(0,.035,Math.abs(ck-.5)))*.04;
  return[c[0],c[1],c[2],h-seam*.35,peel>.5?.9:.58+seam*.2];},{bump:5});
/* charred wood: the surface burned into alligator-cracked blocks running with the grain, deep black in the cracks, the
   block faces a dull silvery black with a little sheen, grey ash bloom here and there, and patches the fire only
   browned. (The cells are drawn stretched across the grain, so on a board mapped along its length they come out
   longer along it, as char checks do) */
PB.char=pbr(512,(u,v)=>{const [f1,e0]=wor(u,v*2,9,5);const e=sstep(0,.09,e0),g=N2(u,v*8,24,3),n=N2(u,v,6,4),ash=sstep(.6,.74,N2(u*2,v*2,5,4)),br=sstep(.7,.78,N2(u+.4,v,4,4));
  let c=[30+n*20,26+n*16,22+n*13];c=mixc(c,[5,4,4],1-e);c=mixc(c,[128,124,118],ash*e*.55);c=mixc(c,[84,52,30],br*e*.65);c=c.map(x=>x*(.85+g*.3));
  return[c[0],c[1],c[2],.25+e*.5+g*.12+f1*.08,.95-e*.32+ash*.2];},{bump:6});
/* freshly burnt metal (the BTR burning after the ambush): no rust yet - the paint burned away to black soot and
   charcoal, heat-tinted grey steel showing through (a little straw and blue at the edges of the hottest patches),
   grey-white ash bloom, blistered scraps of the olive paint left at the cooler edges */
function charPB(){return memo('charPB',()=>pbr(256,(u,v)=>{const n=N2(u,v,5,5),m=N2(u+.3,v,18,3),f=N2(u,v,70,2),a=sstep(.6,.74,N2(u*.7+.1,v*.7,4,4)),pt=sstep(.64,.7,N2(u+.6,v+.2,9,4)),ht=sstep(.5,.62,N2(u+.2,v+.5,6,4)),bl=sstep(.55,.6,N2(u,v,40,2));
    let c=[34+(n-.5)*26,32+(n-.5)*24,30+(n-.5)*22];c=mixc(c,[78,76,74],ht*.8);c=mixc(c,[96,86,62],sstep(.6,.66,N2(u+.2,v+.5,6,4))*(1-sstep(.66,.72,N2(u+.2,v+.5,6,4)))*.5);
    c=mixc(c,[70,78,96],sstep(.7,.74,N2(u+.2,v+.5,6,4))*.3);c=mixc(c,[158,154,148],a*.7);c=mixc(c,[58,62,42],pt*(1-ht)*.85);c=mixc(c,[14,13,12],sstep(.42,.24,n)*.75);
    c=c.map(x=>x*(.9+f*.2));return[c[0],c[1],c[2],.4+n*.3+f*.2+pt*bl*.15+m*.1,.95-a*.05-ht*.1];},{bump:5}));}
/* burnt metal (the wrecks): rust where the paint burned off, grey-white ash bloom, soot */
function burntPB(){return memo('burntPB',()=>pbr(256,(u,v)=>{const n=N2(u,v,5,5),m=N2(u+.3,v,18,3),f=N2(u,v,70,2),a=sstep(.56,.7,N2(u*.7+.1,v*.7,4,4)),sp=sstep(.62,.72,N2(u+.6,v+.2,9,3));
    let c=[96+(n-.5)*60,52+(n-.5)*34,30+(n-.5)*20];c=mixc(c,[150,144,134],a*.75);c=mixc(c,[22,20,18],sstep(.45,.25,n)*.8);c=mixc(c,[70,74,56],sp*.35*(1-a));
    c=c.map(x=>x*(.9+f*.2));return[c[0],c[1],c[2],.4+n*.4+f*.2+m*.1,.96-a*.06];},{bump:5}));}
