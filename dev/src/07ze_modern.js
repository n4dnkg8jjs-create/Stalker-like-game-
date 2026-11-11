/* ---------- the furniture of a newer house - the kolkhoz's brick houses of the seventies and eighties, gas brought in,
   water heating: the sofa-bed under its plaid, the polished wall unit (stenka) with its glass cases of crystal and
   books and the television in its niche, the low coffee table, a wool rug on the floor, cast-iron radiators under the
   windows, and in the kitchen the gas cooker, the refrigerator and the AGV boiler with its flue. Metres; standing on
   the floor at y, facing +z unless turned. ---------- */
const MOD=(()=>{const R=RF,m=(k,f)=>memo('mod_'+k,f);
  const ENW=m('enw',()=>std({color:C(0xeeece4),roughness:.18,envMapIntensity:.9})),BLK=m('blk',()=>std({color:C(0x121212),roughness:.35,envMapIntensity:.6})),CHR=m('chr',()=>std({color:C(0xd8dad8),metalness:1,roughness:.12,envMapIntensity:1.4}));
  const RAD=m('rad',()=>std({color:C(0xe6e0d0),roughness:.45,envMapIntensity:.5})),GLS=m('gls',()=>std({color:C(0xc8d4d8),roughness:.05,transparent:true,opacity:.28,envMapIntensity:1.2,depthWrite:false}));
  /* upholstery: a woven furnishing fabric - a small jacquard lozenge in two tones over a ribbed ground */
  const UPH=k=>m('uph'+k,()=>{const pal=[['#5a3a2a','#7a5238'],['#3a4a3a','#58705a'],['#4a3048','#6a4a68']][k%3];const t=tex(256,256,(c,w,h)=>{c.fillStyle=pal[0];c.fillRect(0,0,w,h);c.fillStyle=pal[1];
      for(let y=0;y<h;y+=32)for(let x=((y/32)%2)*16;x<w;x+=32){c.beginPath();c.moveTo(x+16,y+4);c.lineTo(x+28,y+16);c.lineTo(x+16,y+28);c.lineTo(x+4,y+16);c.closePath();c.fill();}
      FAB.grain(c,w,h,{seed:k+40,weave:.09,dye:.05,nap:.08,cell:1});});t.wrapS=t.wrapT=T.RepeatWrapping;
    return std({map:t,roughness:.95,envMapIntensity:.15});});
  /* a cushion: a puffed box, the seams rounded over, a little sag in the middle */
  const cush=(w,h,d,sag)=>{const g=weldGeo(new T.BoxGeometry(w,h,d,10,4,8).toNonIndexed());const P=g.attributes.position;
    for(let i=0;i<P.count;i++){let x=P.getX(i)/(w/2),y=P.getY(i)/(h/2),z=P.getZ(i)/(d/2);const ex=Math.max(Math.abs(x),Math.abs(z));const r=.82+.18*Math.pow(1-Math.min(1,Math.pow(ex,6)),.5);
      const pf=(1-x*x)*(1-z*z);y=y*(.8+.2*pf*(y>0?1:.4))-(y>0?sag*pf:0);P.setXYZ(i,x*w/2*(.96+.04*r),y*h/2,z*d/2*(.96+.04*r));}g.computeVertexNormals();worldUV(g,3);return g;};
  const sofa=(par,x,y,z,ry,k=0)=>{const g=R.G(par,x,y,z,ry),U=UPH(k),W=1.92,D=.86;
    mesh(rbox(W-.1,.2,D-.08,.02),R.W3,0,.2,0,g);[[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>mesh(new T.CylinderGeometry(.022,.016,.1,10),R.W3,a*(W/2-.12),.05,b*(D/2-.1),g));
    /* armrests: upholstered blocks capped with a polished board */[-1,1].forEach(s_=>{mesh(cush(.14,.36,D,0),U,s_*(W/2-.07),.48,0,g);mesh(rbox(.16,.035,D+.02,.012),R.W1,s_*(W/2-.07),.675,0,g);});
    mesh(cush(W-.28,.17,D-.18,.02),U,0,.385,.05,g);
    {const b=mesh(cush(W-.28,.48,.18,.0),U,0,.69,-D/2+.11,g);b.rotation.x=-.12;
     /* buttons tufted into the back */for(let i=0;i<5;i++)for(let j=0;j<2;j++){const bt=mesh(new T.SphereGeometry(.012,8,6),U,-.6+i*.3,.6+j*.18,-D/2+.21+j*.02,g);bt.scale.z=.5;}}
    /* the plaid thrown over one end */{const pg=new T.PlaneGeometry(.7,1.3,10,18);const P=pg.attributes.position;for(let i=0;i<P.count;i++){const yy=P.getY(i),xx=P.getX(i);
        const zz=yy>.25?0:yy>-.15?(yy-.25)*-.9:.36+(-.15-yy)*.1;P.setXYZ(i,xx,yy>.25?.47+(yy-.25)*.15:yy>-.15?.47-(.25-yy)*.25:.37-(-.15-yy)*.9,yy>.25?-D/2+.2+(yy-.25)*-.1:zz-D/2+.2);}
      pg.computeVertexNormals();const pm=m('plaid',()=>std({map:FAB.quilt(1),roughness:.95,envMapIntensity:.15,side:T.DoubleSide}));mesh(pg,pm,W/2-.55,0,.15,g,false);}
    return R.fin(g);};
  /* the wall unit: cupboards below, the glass case in the middle with its shelves of crystal and books, the TV niche,
     cupboards above under a cornice; veneer polished to a gloss */
  const stenka=(par,x,y,z,ry)=>{const g=R.G(par,x,y,z,ry),W=2.4,D=.45,H=2.05,V=R.W1,V2=R.W3;
    mesh(rbox(W,.06,D-.02,.006),V2,0,.03,0,g);mesh(rbox(.02,H-.06,D,.004),V,-W/2+.01,H/2+.03,0,g);mesh(rbox(.02,H-.06,D,.004),V,W/2-.01,H/2+.03,0,g);mesh(rbox(W,.02,D,.004),V,0,H,0,g);
    mesh(rbox(W+.04,.05,D+.03,.01),V2,0,H+.035,.01,g);mesh(rbox(W-.04,H-.08,.012,.002),V2,0,H/2+.03,-D/2+.006,g);
    [-.4,.4].forEach(xx=>mesh(rbox(.02,H-.08,D-.02,.004),V,xx,H/2+.03,0,g));
    /* lower doors, a row of drawers */[-1,0,1].forEach(c=>{R.panelDoor(g,c*.8,.38,D/2-.01,.76,.62,V);R.knob(g,c*.8+(c<=0?.3:-.3),.44,D/2+.005);});
    mesh(rbox(W-.04,.02,D-.02,.004),V,0,.71,0,g);
    /* middle: left the glass case of crystal and plates, centre the TV niche, right the books */
    [1.05,1.42].forEach(yy=>{mesh(rbox(.76,.012,D-.06,.002),GLS,-.8,yy,0,g);});
    for(let i=0;i<4;i++)R.vase(g,-1.05+i*.16,.72,.04,.8+(i%2)*.3);for(let i=0;i<5;i++){const c=mesh(lathe([[0,0],[.025,0],[.03,.012],[.03,.09],[.034,.1],[0,.1]],12),R.CRYS,-1.1+i*.12,1.062,.02,g);c.renderOrder=3;}
    for(let i=0;i<4;i++)R.plate(g,-1.08+i*.18,1.55,-.12,.1,.25);
    mesh(new T.PlaneGeometry(.76,1.12),GLS,-.8,1.27,D/2-.008,g,false);mesh(rbox(.025,1.12,.02,.004),V2,-.8,1.27,D/2-.005,g);
    tvColour(g,0,.72,0);
    [1.15,1.5].forEach(yy=>mesh(rbox(.76,.018,D-.04,.004),V,.8,yy,0,g));
    {const cols=[0x6a1c18,0x1c2a4a,0x2a4a2a,0x5a4a2a,0x3a2a2a,0x8a6a3a,0x1a1a1a,0x4a1a3a];const q=rng(5);[.73,1.17,1.52].forEach(sy=>{let bx=.44;while(bx<1.14){const bw=.025+q()*.035,bh=.2+q()*.12;
        if(q()<.08){bx+=.06;continue;}const b=mesh(rbox(bw,bh,.15+q()*.06,.003),m('book'+(q()*8|0),()=>std({color:C(cols[(q()*8)|0]),roughness:.7})),bx+bw/2,sy+bh/2+.01,.02,g);if(bx>1.0&&q()<.5)b.rotation.z=-.25;bx+=bw+.002;}});}
    /* the upper cupboards */[-1,0,1].forEach(c=>{R.panelDoor(g,c*.8,1.8,D/2-.01,.76,.4,V);R.knob(g,c*.8,1.65,D/2+.005);});mesh(rbox(W-.04,.02,D-.02,.004),V,0,1.59,0,g);
    return R.fin(g);};
  /* a colour television of the eighties on the niche shelf: a wood-effect cabinet, the curved screen, the control strip */
  const tvColour=(g,x,y,z)=>{const t=R.G(g,x,y,z,0);mesh(rbox(.62,.48,.44,.02),R.W2,0,.25,0,t);mesh(rbox(.54,.4,.02,.02),BLK,-.02,.27,.22,t);
    {const sc=new T.PlaneGeometry(.44,.34,10,10);const p=sc.attributes.position;for(let i=0;i<p.count;i++){const u=p.getX(i)/.22,v=p.getY(i)/.17;p.setZ(i,.02*(1-u*u*.8)*(1-v*v*.8));}sc.computeVertexNormals();mesh(sc,m('crt',()=>std({color:C(0x2c3230),roughness:.05,metalness:.2,envMapIntensity:1.3})),-.04,.28,.232,t);}
    mesh(rbox(.06,.38,.02,.004),m('tvstrip',()=>std({color:C(0x8a8a86),roughness:.35,metalness:.6})),.24,.27,.232,t);for(let i=0;i<6;i++)mesh(rbox(.03,.018,.01,.003),BLK,.24,.42-i*.03,.245,t);
    mesh(rbox(.18,.02,.12,.004),BLK,0,.505,-.05,t);[-1,1].forEach(s_=>{const a=mesh(new T.CylinderGeometry(.003,.003,.45,6),CHR,s_*.05,.73,-.05,t);a.rotation.z=s_*.5;});return t;};
  /* the coffee table: a polished top on splayed legs, a shelf under it with the newspapers */
  const coffeeTable=(par,x,y,z,ry)=>{const g=R.G(par,x,y,z,ry);mesh(rbox(.9,.03,.5,.008),R.W1,0,.5,0,g);mesh(rbox(.8,.015,.4,.004),R.W1,0,.16,0,g);
    [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(([a,b])=>{const l=mesh(new T.CylinderGeometry(.018,.012,.5,10),R.W3,a*.38,.25,b*.19,g);l.rotation.set(-b*.08,0,a*.08);});
    paperMesh(g,'news',33,.1,.18,.0,.3);R.doily(g,0,.517,0,.16);R.vase(g,0,.517,0,1.1);return R.fin(g);};
  /* a cast-iron radiator: a run of sections, each two rounded columns joined at top and bottom, painted cream, on its
     brackets, the pipes in and out */
  const radSec=G('radSec',()=>{const parts=[];[-.035,.035].forEach(zz=>{const c=new T.CylinderGeometry(.022,.022,.46,12);c.translate(0,0,zz);parts.push(c);});
    [.215,-.215].forEach(yy=>{const b=rbox(.06,.06,.14,.025);b.translate(0,yy,0);parts.push(b);});const g=merge(parts);return g;});
  const radiator=(par,x,y,z,ry,n=9)=>{const g=R.G(par,x,y,z,ry);for(let i=0;i<n;i++)mesh(radSec,RAD,(i-(n-1)/2)*.085,.37,0,g);
    [.6,.14].forEach(yy=>{const p=new T.CylinderGeometry(.016,.016,.3,10);p.rotateZ(Math.PI/2);mesh(p,RAD,(n/2)*.085+.12,yy,-.02,g);});
    [-1,1].forEach(s_=>mesh(rbox(.04,.08,.06,.006),RAD,s_*(n/2-1)*.085,.66,-.08,g));return g;};
  /* the gas cooker: white enamel, four burners on the black hob under their pan supports, the oven door glazed, the
     knobs along the front, a kettle on the back burner */
  const cooker=(par,x,y,z,ry)=>{const g=R.G(par,x,y,z,ry);mesh(rbox(.5,.84,.56,.012),ENW,0,.42,0,g);mesh(rbox(.48,.012,.52,.004),BLK,0,.845,0,g);
    [[-.12,-.12],[.12,-.12],[-.12,.12],[.12,.12]].forEach(([a,b])=>{mesh(new T.CylinderGeometry(.045,.05,.015,20),m('burner',()=>std({color:C(0x3a3a38),metalness:.6,roughness:.4})),a,.856,b,g);
      for(let k=0;k<4;k++){const s_=mesh(rbox(.11,.012,.012,.003),BLK,a,.87,b,g);s_.rotation.y=k*Math.PI/4;}});
    mesh(rbox(.42,.4,.02,.01),ENW,0,.4,.285,g);mesh(rbox(.3,.16,.005,.004),m('ovenglass',()=>std({color:C(0x1a1c1c),roughness:.08,envMapIntensity:1.2})),0,.42,.296,g);mesh(rbox(.34,.02,.03,.008),CHR,0,.63,.305,g);
    for(let i=0;i<5;i++){mesh(new T.CylinderGeometry(.018,.02,.02,16).rotateX(Math.PI/2),BLK,-.18+i*.09,.73,.29,g);}
    {const k=R.G(g,.12,.863,-.12,.6);mesh(lathe([[0,0],[.08,0],[.095,.03],[.095,.1],[.07,.15],[.03,.165],[0,.165]],28),m('kettle',()=>std({color:C(0x2a5a9a),roughness:.18,envMapIntensity:.9})),0,0,0,k);
      mesh(new T.TubeGeometry(new T.CatmullRomCurve3([V3(.08,.05,0),V3(.13,.1,0),V3(.15,.14,0)]),10,.01,8),CHR,0,0,0,k);mesh(new T.TorusGeometry(.06,.008,8,20,Math.PI),BLK,0,.19,0,k);}
    return g;};
  /* the refrigerator: a rounded white cabinet, the chrome handle and nameplate */
  const fridge=(par,x,y,z,ry)=>{const g=R.G(par,x,y,z,ry);mesh(rbox(.58,1.42,.6,.05),ENW,0,.71,0,g);mesh(rbox(.56,1.2,.03,.04),ENW,0,.8,.3,g);mesh(rbox(.56,.03,.02,.004),m('gasket',()=>std({color:C(0xb0aca0),roughness:.6})),0,.19,.3,g);
    mesh(rbox(.04,.3,.05,.015),CHR,.22,.95,.33,g);mesh(rbox(.14,.03,.005,.003),CHR,0,1.3,.316,g);return g;};
  /* the AGV boiler: a tall enamelled drum on its foot, the burner door low down, the flue up into the chimney */
  const boiler=(par,x,y,z,ry,flueTop)=>{const g=R.G(par,x,y,z,ry);mesh(lathe([[0,0],[.2,0],[.215,.02],[.215,1.1],[.2,1.13],[.06,1.16],[0,1.16]],32),ENW,0,.06,0,g);
    mesh(new T.CylinderGeometry(.22,.2,.06,32),BLK,0,.03,0,g);mesh(rbox(.14,.12,.02,.01),BLK,0,.22,.21,g);mesh(new T.CylinderGeometry(.012,.012,.02,10).rotateX(Math.PI/2),CHR,.05,.3,.215,g);
    if(flueTop){const fl=new T.CylinderGeometry(.065,.065,flueTop-1.2,16);fl.translate(0,1.2+(flueTop-1.2)/2,0);mesh(fl,m('flue',()=>std({color:C(0x8a8a86),metalness:.7,roughness:.4})),0,0,0,g);}return g;};
  return{sofa,stenka,coffeeTable,radiator,cooker,fridge,boiler,tvColour};})();
