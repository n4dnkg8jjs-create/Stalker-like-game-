/* ---------- Mi-24V "Hind-E": a lofted fuselage (superellipse sections, smooth), the stepped tandem cockpits with their
   faceted armoured glazing and frames, the two TV3-117 nacelles with the PZU dust-separator domes in front of the
   intakes and the exhausts bent out to the sides, the gearbox and oil-cooler fairings, the five-blade main rotor (head,
   swashplate, dampers, twisted blades) and the three-blade tail rotor on the port side of the swept fin, the stub wings
   with their anhedral, B-8V20 rocket pods on the pylons and Shturm launch tubes on the wingtip rails, the YakB-12.7 chin
   turret, the Raduga antenna and sight pods, the air-data boom, the main wheels half out of their bays, antennas, flare
   dispensers. Painted in the shader: khaki with olive patches, a pale blue belly, panel lines, the clamshell doors,
   grime, exhaust soot down the boom; red stars and a white bort number as decals.
   Frame: +z forward (nose), +y up, +x port; the origin under the main rotor at the belly line. ---------- */
const HIND=(function(){
  const H={};
  /* --- smooth interpolation of keyed section parameters (Catmull-Rom on each) --- */
  const keyAt=(K,z,f)=>{let i=0;while(i<K.length-2&&z>K[i+1].z)i++;const a=K[Math.max(0,i-1)],b=K[i],c=K[i+1],d=K[Math.min(K.length-1,i+2)];
    const t=clamp((z-b.z)/(c.z-b.z),0,1),t2=t*t,t3=t2*t;const p0=a[f],p1=b[f],p2=c[f],p3=d[f];
    return .5*((2*p1)+(-p0+p2)*t+(2*p0-5*p1+4*p2-p3)*t2+(-p0+3*p1-3*p2+p3)*t3);};
  /* superellipse ring: half-width w, above ht, below hb, exponents nt (top) nb (bottom); theta 0 = port (+x) */
  const ring=(s,th)=>{const c=Math.cos(th),sn=Math.sin(th),n=sn>=0?s.nt:s.nb;const x=s.w*Math.sign(c)*Math.pow(Math.abs(c),2/n);
    const y=s.yc+(sn>=0?s.ht:s.hb)*Math.sign(sn)*Math.pow(Math.abs(sn),2/n);return[x+(s.cx||0),y];};
  /* a lofted body: sections keyed along z, sampled every dz, M points round; capped at both ends; smooth normals */
  function loftZ(K,o={}){K=K.slice().sort((a,b)=>a.z-b.z);const M=o.M||40,dz=o.dz||.12,z0=K[0].z,z1=K[K.length-1].z,th0=o.th0||0,th1=o.th1===undefined?Math.PI*2:o.th1,open=o.th1!==undefined;
    const pos=[],idx=[],uv=[];let rows=0;const S=s=>({w:keyAt(K,s,'w'),ht:keyAt(K,s,'ht'),hb:keyAt(K,s,'hb'),yc:keyAt(K,s,'yc'),nt:keyAt(K,s,'nt'),nb:keyAt(K,s,'nb'),cx:K[0].cx!==undefined?keyAt(K,s,'cx'):0});
    const zs=[];for(let z=z0;z<z1-1e-6;z+=dz)zs.push(z);zs.push(z1);
    const cols=open?M+1:M+1;
    for(const z of zs){const s=S(z);for(let i=0;i<cols;i++){const th=th0+(th1-th0)*i/M;const [x,y]=ring(s,th);pos.push(x,y,z);uv.push(i/M,z*.25);}rows++;}
    for(let r=0;r<rows-1;r++)for(let i=0;i<M;i++){const a=r*cols+i,b=a+1,c=a+cols,d=c+1;idx.push(a,b,d,a,d,c);}
    if(!open&&o.cap!==false){[0,rows-1].forEach((r,k)=>{const s=S(zs[r]);const ci=pos.length/3;pos.push(s.cx||0,s.yc,zs[r]);uv.push(.5,.5);for(let i=0;i<M;i++){const a=r*cols+i,b=a+1;if(k===0)idx.push(ci,b,a);else idx.push(ci,a,b);}});}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    if(o.flip){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i];ix[i]=ix[i+2];ix[i+2]=t;}g.computeVertexNormals();}
    g.userData.S=S;return g;}
  /* collect geometry per material */
  const parts=new Map();const add=(g,m,M4)=>{let q=g.index?g.toNonIndexed():g.clone();if(M4)q.applyMatrix4(M4);if(!q.attributes.normal)q.computeVertexNormals();
    if(!q.attributes.uv)q.setAttribute('uv',new T.BufferAttribute(new Float32Array(q.attributes.position.count*2),2));
    for(const k of Object.keys(q.attributes))if(!['position','normal','uv'].includes(k))q.deleteAttribute(k);
    if(!parts.has(m))parts.set(m,[]);parts.get(m).push(q);return q;};
  const TR=(x,y,z,rx=0,ry=0,rz=0,sx=1,sy=sx,sz=sx)=>new T.Matrix4().compose(V3(x,y,z),new T.Quaternion().setFromEuler(new T.Euler(rx,ry,rz,'YXZ')),V3(sx,sy,sz));
  const mirror=new T.Matrix4().makeScale(-1,1,1);
  /* a part and its mirror image (geometry winding flipped back) */
  const addM=(g,m,M4)=>{add(g,m,M4);const q=g.index?g.toNonIndexed():g.clone();if(M4)q.applyMatrix4(M4);q.applyMatrix4(mirror);const p=q.attributes.position.array;
    for(let i=0;i<p.length;i+=9)for(let k=0;k<3;k++){const t=p[i+3+k];p[i+3+k]=p[i+6+k];p[i+6+k]=t;}q.computeVertexNormals();add(q,m);};
  const tube=(pts,r,seg=6,closed=false)=>new T.TubeGeometry(new T.CatmullRomCurve3(pts.map(p=>V3(...p)),closed,'catmullrom',.3),Math.max(4,pts.length*6),r,seg,closed);
  /* an airfoil section (about a symmetric 12-15% section), chord along -z from the leading edge, thickness in y */
  const foil=(c,t)=>{const P=[];const N=14;for(let i=0;i<=N;i++){const x=1-Math.cos(i/N*Math.PI/2*2)*.5-.5;const yt=5*t*(.2969*Math.sqrt(x)-.126*x-.3516*x*x+.2843*x*x*x-.1036*x*x*x*x);P.push([x*c,yt*c]);}
    const up=P.map(p=>[p[0],p[1]]),lo=P.slice(1,-1).reverse().map(p=>[p[0],-p[1]]);return up.concat(lo);};
  /* a wing-like surface lofted spanwise from stations {x,y,zLE,c,t,tw(twist)} along their own span axis */
  function wing(st,o={}){const pos=[],idx=[];const F=st.map(s=>foil(s.c,s.t));const n=F[0].length;
    st.forEach((s,k)=>{F[k].forEach(([a,b])=>{const ca=Math.cos(s.tw||0),sa=Math.sin(s.tw||0);const zz=-a,yy=b;const z=zz*ca-yy*sa+(s.c*.25)*0,y=zz*sa+yy*ca;pos.push(s.x,s.y+y,s.zLE+z);});});
    for(let k=0;k<st.length-1;k++)for(let i=0;i<n;i++){const j=(i+1)%n;const a=k*n+i,b=k*n+j,c=(k+1)*n+i,d=(k+1)*n+j;idx.push(a,c,d,a,d,b);}
    [0,st.length-1].forEach((k,e)=>{const c0=pos.length/3;let cx=0,cy=0,cz=0;for(let i=0;i<n;i++){cx+=pos[(k*n+i)*3];cy+=pos[(k*n+i)*3+1];cz+=pos[(k*n+i)*3+2];}pos.push(cx/n,cy/n,cz/n);
      for(let i=0;i<n;i++){const j=(i+1)%n;if(e===0)idx.push(c0,k*n+i,k*n+j);else idx.push(c0,k*n+j,k*n+i);}});
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();
    if(o.flip){const ix=g.index.array;for(let i=0;i<ix.length;i+=3){const t=ix[i];ix[i]=ix[i+2];ix[i+2]=t;}g.computeVertexNormals();}return g;}

  /* ===================== materials ===================== */
  /* the paint is worked out in the shader from the airframe-space position and normal: khaki with olive-green patches,
     a pale blue belly and wing undersides, panel lines and doors, grime and exhaust soot */
  const paint=std({color:C(0xffffff),roughness:.6,metalness:.12,envMapIntensity:.45});
  paint.onBeforeCompile=s=>{
    s.vertexShader='varying vec3 vHp;varying vec3 vHn;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvHp=position;vHn=normal;');
    s.fragmentShader='varying vec3 vHp;varying vec3 vHn;\n'+s.fragmentShader.replace('void main() {',`
      float hH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float hN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(hH(i),hH(i+vec3(1,0,0)),f.x),mix(hH(i+vec3(0,1,0)),hH(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(hH(i+vec3(0,0,1)),hH(i+vec3(1,0,1)),f.x),mix(hH(i+vec3(0,1,1)),hH(i+vec3(1,1,1)),f.x),f.y),f.z);}
      float hL(float d,float w){float fw=max(fwidth(d),1e-4);return 1.-smoothstep(w*.5,w*.5+fw*1.2,abs(d));}
      void main() {`).replace('#include <color_fragment>',`#include <color_fragment>
      {vec3 p=vHp,nn=normalize(vHn);
       /* camouflage: large soft-edged patches, seen the same from the side and from above */
       float c=hN(p*vec3(.36,.42,.3)+vec3(3.1,0.,7.7))*.65+hN(p*vec3(.9,1.,.8)+11.)*.35;float cm=smoothstep(.47,.53,c);
       vec3 khaki=vec3(.25,.24,.13),olive=vec3(.1,.115,.05),belly=vec3(.34,.42,.45);
       vec3 col=mix(khaki,olive,cm);
       /* the belly line: underside and the lower flanks, wing undersides */
       float bl=smoothstep(-.12,-.42,nn.y)*smoothstep(1.6,.9,p.y)+smoothstep(-.35,-.6,nn.y);bl=clamp(bl,0.,1.);col=mix(col,belly,bl);
       /* panel lines: frames along the fuselage, stringers, the doors and hatches */
       float pl=0.;float onBody=step(-11.4,p.z)*step(p.z,7.)*step(abs(p.x),1.05);
       pl=max(pl,hL(fract(p.z/1.04+.5)-.5,.01)*onBody*step(p.y,2.35)*step(-10.4,p.z)*step(p.z,4.6)*.7);
       pl=max(pl,hL(p.y-.38,.01)*onBody*step(-2.6,p.z)*step(p.z,3.)*step(.55,abs(nn.x)));
       /* the clamshell doors each side: upper hinged up, lower down */
       float dz=step(-.2,p.z)*step(p.z,1.65),dy=step(.18,p.y)*step(p.y,1.72);float sd=step(.6,abs(nn.x));
       pl=max(pl,(hL(p.z+.2,.014)+hL(p.z-1.65,.014))*step(.18,p.y)*step(p.y,1.72)*sd);pl=max(pl,(hL(p.y-.18,.014)+hL(p.y-1.72,.014)+hL(p.y-1.0,.012))*dz*sd);
       /* the engine cowls: hinged panels along the nacelles */
       pl=max(pl,hL(fract(p.z/.95)-.5,.012)*step(2.2,p.y)*step(-2.,p.z)*step(p.z,3.));
       col*=1.-pl*.32;
       /* grime: darker low and round the hatches, paler where the sun has had it */
       float g=hN(p*3.1)*.6+hN(p*11.)*.4;col*=.86+g*.22;col=mix(col,col*vec3(.78,.74,.66),smoothstep(.6,.2,p.y)*.4*(1.-bl*.5));
       /* soot from the exhausts down the sides of the boom and the top deck behind them */
       float so=exp(-pow((p.y-2.05)/.45,2.))*smoothstep(-1.6,-2.4,p.z)*smoothstep(-8.5,-3.5,p.z)*step(.3,abs(nn.x)+max(0.,nn.y));
       col=mix(col,vec3(.03,.028,.025),so*.6);
       diffuseColor.rgb=col;}`).replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\nroughnessFactor=clamp(roughnessFactor+(hN(vHp*7.)-.5)*.18,.3,.95);');};
  paint.extensions={derivatives:true};paint.customProgramCacheKey=()=>'hindpaint1';
  const MT={paint,
    glass:std({color:C(0x5a6e6a),roughness:.05,metalness:0,transparent:true,opacity:.42,envMapIntensity:1.3,side:T.DoubleSide,depthWrite:false}),
    frame:std({color:C(0x50523a),roughness:.55,metalness:.15}),
    dark:std({color:C(0x1b1c1a),roughness:.45,metalness:.6,envMapIntensity:.6}),
    gun:std({color:C(0x161615),roughness:.32,metalness:.85,envMapIntensity:.8}),
    pod:std({color:C(0x56583a),roughness:.55,metalness:.2}),
    hole:std({color:C(0x060606),roughness:1,metalness:0}),
    blade:std({color:C(0x2d2f2b),roughness:.5,metalness:.25,vertexColors:true,side:T.DoubleSide}),
    rubber:std({color:C(0x161514),roughness:.85}),
    inside:std({color:C(0x2a302c),roughness:.85}),
    helmet:std({color:C(0x4d5236),roughness:.6}),visor:std({color:C(0x0c0d0c),roughness:.1,metalness:.5,envMapIntensity:1.2}),
    sootIn:std({color:C(0x0d0b0a),roughness:1,side:T.DoubleSide})};
  H.MT=MT;

  /* ===================== fuselage ===================== */
  /* z, centre height, half-width, above, below, exponents top/bottom */
  const BODY=[
    {z:-11.35,yc:2.06,w:.08,ht:.12,hb:.1,nt:2,nb:2},
    {z:-11.1,yc:2.03,w:.17,ht:.22,hb:.2,nt:2.1,nb:2.1},
    {z:-10.4,yc:1.96,w:.25,ht:.3,hb:.28,nt:2.2,nb:2.2},
    {z:-9.0,yc:1.86,w:.31,ht:.35,hb:.36,nt:2.3,nb:2.3},
    {z:-6.5,yc:1.68,w:.4,ht:.44,hb:.47,nt:2.4,nb:2.4},
    {z:-4.4,yc:1.52,w:.52,ht:.58,hb:.66,nt:2.6,nb:2.6},
    {z:-3.2,yc:1.32,w:.7,ht:.92,hb:1.0,nt:2.9,nb:2.9},
    {z:-2.35,yc:1.12,w:.83,ht:1.2,hb:1.1,nt:3.2,nb:3.4},
    {z:-1.0,yc:1.08,w:.87,ht:1.4,hb:1.08,nt:3.8,nb:3.8},
    {z:1.8,yc:1.08,w:.87,ht:1.4,hb:1.08,nt:3.8,nb:3.8},
    {z:3.0,yc:1.06,w:.83,ht:1.3,hb:1.06,nt:3.4,nb:3.6},
    {z:4.0,yc:1.0,w:.7,ht:.86,hb:1.0,nt:2.8,nb:3.2},
    {z:4.85,yc:.93,w:.62,ht:.56,hb:.9,nt:2.7,nb:3},
    {z:5.6,yc:.86,w:.55,ht:.44,hb:.7,nt:2.6,nb:2.7},
    {z:6.3,yc:.8,w:.44,ht:.36,hb:.5,nt:2.5,nb:2.5},
    {z:6.68,yc:.76,w:.36,ht:.3,hb:.38,nt:2.3,nb:2.4},
    {z:6.84,yc:.74,w:.24,ht:.2,hb:.26,nt:2.1,nb:2.1},
    {z:6.9,yc:.74,w:.08,ht:.06,hb:.09,nt:2,nb:2}];
  const body=loftZ(BODY,{M:48,dz:.11});add(body,paint);const BS=body.userData.S;
  const topAt=(z,x=0)=>{const s=BS(z);const t=Math.pow(Math.max(0,1-Math.pow(Math.min(1,Math.abs(x)/s.w),s.nt)),1/s.nt);return s.yc+s.ht*t;};
  const sideAt=(z,y)=>{const s=BS(z);const v=(y-s.yc)/(y>=s.yc?s.ht:s.hb);const n=y>=s.yc?s.nt:s.nb;return s.w*Math.pow(Math.max(0,1-Math.pow(Math.min(1,Math.abs(v)),n)),1/n);};
  H.topAt=topAt;H.sideAt=sideAt;

  /* ===================== cockpits ===================== */
  /* faceted glazing: few segments round, flat normals; the frames run along every edge */
  function canopy(K,segs){K=K.slice().sort((a,b)=>a.z-b.z);const g=loftZ(K.map(k=>({...k,yc:k.base,hb:.01,nb:2})),{M:segs,dz:.5,th0:0,th1:Math.PI});const q=g.toNonIndexed();q.computeVertexNormals();add(q,MT.glass);
    /* frames: the longitudinal edges and each section ring */
    const S=g.userData.S;for(let i=0;i<=segs;i+=2){const th=Math.PI*i/segs;const pts=[];for(let k=0;k<K.length;k++){const z=K[k].z;const s=S(z);const [x,y]=ring({...s,hb:.01,nb:2,yc:s.yc},th);pts.push([x,y,z]);}
      if(pts.length>1)add(tube(pts,i===0||i===segs?.04:.028,6),MT.frame);}
    K.forEach((k,j)=>{if(j!==1&&j!==K.length-1&&j!==Math.floor(K.length/2))return;const s=S(k.z);const pts=[];for(let i=0;i<=24;i++){const [x,y]=ring({...s,hb:.01,nb:2},Math.PI*i/24);pts.push([x,y,k.z]);}add(tube(pts,.026,5),MT.frame);});
    /* the cockpit inside: a dark tub under the glass */
    return S;}
  const gk=(z,w,top,n=2)=>({z,w,ht:top-topAt(z,w*.9)+.02,base:topAt(z,w*.9)-.02,nt:n});
  /* gunner's cockpit, low in the nose: a sloped armoured windscreen in front, a blown hood */
  const gun=[gk(6.62,.22,1.06),gk(6.45,.37,1.42),gk(6.15,.47,1.76),gk(5.6,.52,1.98),gk(5.05,.52,2.0),gk(4.82,.48,1.95)];
  const gunS=canopy(gun,6);
  /* pilot's, stepped up behind */
  const pil=[gk(4.86,.38,1.98),gk(4.62,.52,2.4),gk(4.25,.56,2.64),gk(3.75,.53,2.68),gk(3.35,.43,2.6),gk(3.02,.3,2.45)];
  canopy(pil,6);
  /* the frame where the two meet, and the pilot's door on the starboard side (its handle and hinge line) */
  {const s=BS(4.84);add(tube([[-.48,1.5,4.84],[-.38,1.88,4.84],[0,2.0,4.84],[.38,1.88,4.84],[.48,1.5,4.84]],.04,6),MT.frame);}
  add(tube([[-.57,2.15,4.2],[-.6,1.75,4.2]],.02,4),MT.frame);
  /* interiors: tubs, seats, panels and the two crew in their ZSh helmets */
  [[5.4,1.05,.42],[3.85,1.6,.48]].forEach(([z,y,w],k)=>{add(new T.BoxGeometry(w*1.7,.5,1.2),MT.inside,TR(0,y-.12,z));add(new T.BoxGeometry(w*1.5,.28,.22),MT.inside,TR(0,y+.32,z+.5,-.5));
    add(new T.BoxGeometry(.42,.6,.12),MT.inside,TR(0,y+.32,z-.42,.15));
    /* the man: torso, shoulders, the helmet with its visor down */
    add(new T.CylinderGeometry(.17,.2,.5,10),MT.helmet,TR(0,y+.38,z-.25,.1));add(new T.SphereGeometry(.15,14,10),MT.helmet,TR(0,y+.72,z-.22,0,0,0,1,1.05,1.1));
    add(new T.SphereGeometry(.152,14,8,-1.1,2.2,1.1,.9),MT.visor,TR(0,y+.72,z-.22,0,0,0,1,1.05,1.1));});

  /* ===================== the nose: chin turret, pods, air-data booms ===================== */
  {/* the USPU-24 turret and its four-barrel YakB-12.7 */
   add(new T.SphereGeometry(.25,20,14),MT.dark,TR(0,.33,6.48,0,0,0,1,.85,1));add(new T.CylinderGeometry(.27,.27,.08,22),MT.paint,TR(0,.5,6.45));
   const gb=new T.Group();const P4=[];for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.4;P4.push(xf(new T.CylinderGeometry(.021,.021,1.0,8),Math.cos(a)*.045,.5,Math.sin(a)*.045));}
   P4.forEach(g=>add(g,MT.gun,TR(0,.3,6.62,Math.PI/2+.08)));add(new T.CylinderGeometry(.085,.085,.22,12),MT.gun,TR(0,.3,6.66,Math.PI/2+.08));
   add(new T.CylinderGeometry(.075,.075,.06,12),MT.gun,TR(0,.27,7.0,Math.PI/2+.08));
   /* under the nose: the Raduga-F guidance antenna (port) and the KPS-53AV sight pod with its window (starboard) */
   add(new T.SphereGeometry(1,18,12),MT.paint,TR(.33,.22,6.0,0,0,0,.13,.13,.42));add(new T.SphereGeometry(1,18,12),MT.dark,TR(.33,.22,6.38,0,0,0,.09,.09,.08));
   add(new T.SphereGeometry(1,18,12),MT.paint,TR(-.34,.24,5.95,0,0,0,.17,.18,.5));add(new T.CircleGeometry(.11,16),MT.visor,TR(-.34,.24,6.44,0,0,0));
   /* the long air-data boom from the starboard side of the gunner's canopy, a second short probe */
   add(new T.CylinderGeometry(.03,.045,1.9,8),MT.dark,TR(-.42,1.18,7.15,Math.PI/2));add(new T.CylinderGeometry(.012,.02,.5,6),MT.dark,TR(-.42,1.18,8.3,Math.PI/2));
   [[-1,0],[1,0]].forEach(([s])=>add(new T.BoxGeometry(.004,.06,.12),MT.dark,TR(-.42+s*.02,1.18,7.9,0,0,s*.5)));
   add(new T.CylinderGeometry(.012,.018,.55,6),MT.dark,TR(.4,1.15,6.75,Math.PI/2));
   /* nose gear doors (retracted) and the windscreen wipers */
   add(new T.BoxGeometry(.5,.02,.9),MT.paint,TR(0,.06,5.2));[[6.5,1.2],[4.75,1.9]].forEach(([z,y])=>add(new T.BoxGeometry(.012,.012,.32),MT.dark,TR(0,y,z,-.9)));}

  /* ===================== engines and the top deck ===================== */
  const NAC=[{z:-2.3,yc:2.56,w:.24,ht:.24,hb:.24,nt:2,nb:2},{z:-1.6,yc:2.56,w:.38,ht:.38,hb:.36,nt:2.2,nb:2.4},{z:-.5,yc:2.58,w:.42,ht:.42,hb:.4,nt:2.3,nb:2.5},
    {z:1.5,yc:2.58,w:.43,ht:.42,hb:.4,nt:2.3,nb:2.5},{z:2.5,yc:2.58,w:.41,ht:.4,hb:.38,nt:2.2,nb:2.4},{z:3.0,yc:2.58,w:.34,ht:.33,hb:.32,nt:2,nb:2}];
  [.68,-.68].forEach(cx=>{const g=loftZ(NAC.map(k=>({...k,cx})),{M:28,dz:.15});add(g,paint);
    /* the intake lip and, in front of it on struts, the PZU dust separator: a big dome with its ring slot */
    add(new T.TorusGeometry(.31,.05,10,26),MT.paint,TR(cx,2.58,3.02));add(new T.CircleGeometry(.3,24),MT.hole,TR(cx,2.58,3.0));
    const dome=lathe([[0,-.12],[.36,-.12],[.41,-.07],[.42,0],[.39,.12],[.3,.25],[.17,.32],[0,.34]],28);add(dome,MT.paint,TR(cx,2.58,3.2,Math.PI/2));
    add(new T.TorusGeometry(.37,.035,8,26),MT.dark,TR(cx,2.58,3.1));
    for(let i=0;i<4;i++){const a=i/4*Math.PI*2+.785;add(new T.BoxGeometry(.03,.03,.22),MT.dark,TR(cx+Math.cos(a)*.28,2.58+Math.sin(a)*.28,3.08));}
    /* the exhaust: bent out and down to the side, open, sooty inside */
    const sd=Math.sign(cx);const ep=[[cx+sd*.12,2.56,-1.75],[cx+sd*.3,2.52,-2.05],[cx+sd*.48,2.46,-2.27]];add(tube(ep,.22,16),MT.paint);const ea=Math.atan2(sd*.6,-.8);
    add(new T.TorusGeometry(.22,.03,8,18),MT.dark,TR(cx+sd*.49,2.46,-2.28,0,ea,0));add(new T.CircleGeometry(.21,18),MT.sootIn,TR(cx+sd*.45,2.47,-2.24,0,ea,0));});
  /* between and behind the nacelles: the main gearbox fairing, the oil cooler hump with its fan grille behind the mast */
  add(loftZ([{z:-3.4,yc:2.25,w:.22,ht:.2,hb:.4,nt:2,nb:2},{z:-2.4,yc:2.4,w:.62,ht:.42,hb:.4,nt:2.6,nb:2},{z:-.9,yc:2.6,w:.66,ht:.55,hb:.4,nt:2.8,nb:2},
    {z:.9,yc:2.62,w:.64,ht:.52,hb:.4,nt:2.8,nb:2},{z:2.2,yc:2.55,w:.5,ht:.35,hb:.4,nt:2.4,nb:2},{z:2.9,yc:2.45,w:.2,ht:.18,hb:.3,nt:2,nb:2}],{M:30,dz:.15}),paint);
  {const gr=new T.CylinderGeometry(.33,.36,.22,22);add(gr,MT.paint,TR(0,3.12,-1.55,.1));add(new T.CircleGeometry(.29,22),MT.hole,TR(0,3.235,-1.56,-Math.PI/2+.1));
   for(let i=0;i<8;i++)add(new T.BoxGeometry(.58,.012,.02),MT.dark,TR(0,3.24,-1.56-.27+i*.075,.1));}
  /* the APU exhaust, the Lipa IR jammer on its plinth behind the cooler, whip and blade antennas */
  add(new T.CylinderGeometry(.08,.08,.25,10),MT.dark,TR(-.3,2.75,-2.6,0,0,Math.PI/2));
  add(new T.CylinderGeometry(.2,.2,.42,16),MT.dark,TR(0,2.92,-3.05));add(new T.CylinderGeometry(.13,.2,.3,16),MT.paint,TR(0,2.6,-3.05));
  add(new T.CylinderGeometry(.006,.012,1.2,5),MT.dark,TR(0,2.65,-5.6,-.35));add(new T.BoxGeometry(.02,.26,.3),MT.dark,TR(0,-.08,-1.4,-.2));
  add(new T.BoxGeometry(.02,.18,.22),MT.dark,TR(0,1.0,-7.5,-.3));
  /* flare dispensers on the boom sides */
  [[-4.6],[-5.3]].forEach(([z])=>{addM(new T.BoxGeometry(.18,.22,.5),MT.pod,TR(sideAt(z,1.6)+.07,1.6,z));});

  /* ===================== tail: fin, stabilator, skid ===================== */
  {add(vwing([{x:0,y:1.95,zLE:-9.3,c:1.95,t:.14},{x:0,y:3.1,zLE:-10.1,c:1.5,t:.13},{x:0,y:4.3,zLE:-10.95,c:1.05,t:.12}]),paint);
   /* the stabilator through the boom, each side */
   const st=wing([{x:.2,y:1.86,zLE:-8.45,c:.85,t:.11},{x:1.55,y:1.86,zLE:-8.75,c:.55,t:.1}]);addM(st,paint);
   /* the ventral fin and the tail skid under it */
   add(vwing([{x:0,y:1.75,zLE:-9.5,c:1.3,t:.12},{x:0,y:1.25,zLE:-9.9,c:.8,t:.1}]),paint);add(tube([[0,1.4,-10.0],[0,1.05,-10.35],[0,1.08,-10.75]],.03,6),MT.dark);}
  /* a vertical surface (fin, pylon): stations up or down in y, the section's thickness in x */
  function vwing(st){const up=st[st.length-1].y>st[0].y;const pos=[],idx=[];const F=st.map(s=>foil(s.c,s.t));const n=F[0].length;
    st.forEach((s,k)=>F[k].forEach(([a,b])=>pos.push((s.x||0)+b,s.y,s.zLE-a)));
    for(let k=0;k<st.length-1;k++)for(let i=0;i<n;i++){const j=(i+1)%n;const a=k*n+i,b=k*n+j,c=(k+1)*n+i,d=(k+1)*n+j;if(up)idx.push(a,d,c,a,b,d);else idx.push(a,c,d,a,d,b);}
    [0,st.length-1].forEach((k,e)=>{const c0=pos.length/3;let cx=0,cy=0,cz=0;for(let i=0;i<n;i++){cx+=pos[(k*n+i)*3];cy+=pos[(k*n+i)*3+1];cz+=pos[(k*n+i)*3+2];}pos.push(cx/n,cy/n,cz/n);
      const top=(e===1)===up;for(let i=0;i<n;i++){const j=(i+1)%n;if(top)idx.push(c0,k*n+i,k*n+j);else idx.push(c0,k*n+j,k*n+i);}});
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;}
  /* ===================== stub wings, pylons, stores ===================== */
  {const an=.21,x0=.72,span=2.55,y0=1.32,zr=1.2;const S=k=>{const t=k;return{x:x0+t*span*Math.cos(an),y:y0-t*span*Math.sin(an),zLE:zr-t*.35,c:lerp(1.95,1.3,t),t:lerp(.16,.13,t),tw:0};};
   addM(wing([S(0),S(.5),S(1)]),paint);
   const tip=S(1);
   /* the wingtip endplate: a stubby vertical pylon carrying the Shturm launch rails, two tubes each side */
   addM(new T.BoxGeometry(.1,.85,1.05),paint,TR(tip.x+.02,tip.y-.3,tip.zLE-.55));
   [[.18],[-.42]].forEach(([dy])=>{addM(new T.CylinderGeometry(.075,.075,1.85,14),MT.pod,TR(tip.x+.15,tip.y+dy,tip.zLE-.4,Math.PI/2));
     addM(new T.CircleGeometry(.07,14),MT.dark,TR(tip.x+.15,tip.y+dy,tip.zLE+.53));addM(new T.TorusGeometry(.075,.012,6,14),MT.dark,TR(tip.x+.15,tip.y+dy,tip.zLE+.5));
     addM(new T.BoxGeometry(.06,.05,1.5),MT.dark,TR(tip.x+.07,tip.y+dy,tip.zLE-.4));});
   /* two pylons under each wing, a B-8V20 under each: twenty 80 mm tubes behind a blunt front fairing */
   const holes=tex(256,256,(c,w,h)=>{c.fillStyle='#4a4c34';c.fillRect(0,0,w,h);c.fillStyle='#0a0a09';const R0=w/2;
     for(let ring_=0;ring_<3;ring_++){const n=[1,7,12][ring_],rr_=[0,.38,.74][ring_]*R0*.86;for(let i=0;i<n;i++){const a=i/n*Math.PI*2;c.beginPath();c.arc(w/2+Math.cos(a)*rr_,h/2+Math.sin(a)*rr_,R0*.12,0,7);c.fill();}}},{clamp:true});
   const front=std({map:holes,roughness:.6,metalness:.2});
   const podG=lathe([[0,-1.12],[.2,-1.12],[.24,-1.0],[.26,-.85],[.26,.85],[.255,.95],[.235,1.04],[.2,1.09],[0,1.09]],24);
   [.38,.78].forEach(t=>{const s=S(t);const px=s.x,py=s.y-.12;
     addM(vwing([{x:px,y:py+.08,zLE:s.zLE-.3,c:1.0,t:.12},{x:px,y:py-.36,zLE:s.zLE-.35,c:.9,t:.12}]),paint);
     addM(podG,MT.pod,TR(px,py-.6,s.zLE-.95,Math.PI/2));addM(new T.CircleGeometry(.2,24),front,TR(px,py-.6,s.zLE-.95+1.095));
     addM(new T.TorusGeometry(.262,.012,6,26),MT.dark,TR(px,py-.6,s.zLE-.95+.6));addM(new T.TorusGeometry(.262,.012,6,26),MT.dark,TR(px,py-.6,s.zLE-.95-.6));});}

  /* ===================== windows, steps, wheels ===================== */
  [[2.45],[1.95],[.85]].forEach(([z],k)=>{const y=1.42,x=sideAt(z,y);addM(new T.BoxGeometry(.012,.3,.3),MT.visor,TR(x+.004,y,z));addM(new T.TorusGeometry(.17,.016,4,4),MT.frame,TR(x+.008,y,z,0,Math.PI/2,Math.PI/4));});
  /* the main wheels, half out of their bays behind the wings */
  {const z=-1.25,y=.32,x=sideAt(z,y)+.02;addM(new T.TorusGeometry(.3,.12,12,22),MT.rubber,TR(x,y,z,0,Math.PI/2,0));addM(new T.CylinderGeometry(.22,.22,.18,18),MT.dark,TR(x,y,z,0,0,Math.PI/2));
   addM(new T.SphereGeometry(1,20,12,0,Math.PI*2,0,Math.PI/2),paint,TR(x-.1,y+.05,z,0,0,-Math.PI/2,.5,.32,.6));}
  /* the steps up to the cockpits and the gunner's hatch hinge line */
  [[4.4,.9],[5.2,.7]].forEach(([z,y])=>add(new T.BoxGeometry(.03,.04,.22),MT.dark,TR(-sideAt(z,y)-.01,y,z)));

  /* ===================== markings ===================== */
  const star=tex(256,256,(c,w,h)=>{c.clearRect(0,0,w,h);const st=(r,col)=>{c.fillStyle=col;c.beginPath();for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,rr_=i%2?r*.4:r;c.lineTo(w/2+Math.cos(a)*rr_,h/2+Math.sin(a)*rr_);}c.closePath();c.fill();};
    st(122,'#b3221c');st(112,'#f2efe6');st(100,'#b3221c');},{clamp:true});
  const num=tex(256,128,(c,w,h)=>{c.clearRect(0,0,w,h);c.font='bold 96px "Arial Narrow",Arial,sans-serif';c.textAlign='center';c.lineWidth=5;c.strokeStyle='rgba(30,30,25,.6)';c.strokeText('118',w/2,100);c.fillStyle='#ecebe2';c.fillText('118',w/2,100);},{clamp:true});
  const dec=m=>std({map:m,transparent:true,depthWrite:false,roughness:.6,polygonOffset:true,polygonOffsetFactor:-4,polygonOffsetUnits:-4,envMapIntensity:.4});
  const starM=dec(star),numM=dec(num);H.decals=[];
  [1,-1].forEach(sd=>{{const z=-6.6,y=1.68,x=(sideAt(z,y)+.006)*sd;const p=new T.PlaneGeometry(.52,.52);p.applyMatrix4(TR(x,y,z,0,sd*Math.PI/2,0));add(p,starM);}
    {const z=3.45,y=1.55,x=(sideAt(z,y)+.008)*sd;const p=new T.PlaneGeometry(.78,.39);p.applyMatrix4(TR(x,y,z,0,sd*Math.PI/2,0));add(p,numM);}});

  /* ===================== the airframe as meshes ===================== */
  const air=new T.Group();
  parts.forEach((gs,m)=>{const g=mergeAttrs(gs);g.computeBoundingSphere();const me=new T.Mesh(g,m);me.castShadow=m!==MT.glass;me.receiveShadow=true;air.add(me);});

  /* ===================== main rotor ===================== */
  const rotor=new T.Group();rotor.position.set(0,3.2,0);rotor.rotation.x=.075;air.add(rotor);
  const head=new T.Group();rotor.add(head);
  {const hm=(g,m,M4)=>{const q=g;if(M4)q.applyMatrix4(M4);const me=new T.Mesh(q,m);me.castShadow=true;head.add(me);return me;};
   hm(new T.CylinderGeometry(.16,.19,.75,16),MT.dark,TR(0,.3,0));hm(new T.CylinderGeometry(.4,.42,.08,24),MT.dark,TR(0,.28,0));hm(new T.CylinderGeometry(.34,.36,.06,24),MT.gun,TR(0,.36,0));
   hm(new T.CylinderGeometry(.3,.3,.3,5),MT.dark,TR(0,.78,0));hm(new T.CylinderGeometry(.16,.24,.18,16),MT.dark,TR(0,1.0,0));
   for(let i=0;i<5;i++){const a=i/5*Math.PI*2;const c=Math.cos(a),s=Math.sin(a);
     hm(new T.BoxGeometry(.6,.14,.16),MT.dark,TR(c*.45,.78,-s*.45,0,a,0));
     hm(new T.CylinderGeometry(.045,.045,.5,8),MT.gun,TR(c*.42+(-s)*.14,.86,-s*.42-c*.14,0,a,Math.PI/2));
     hm(new T.CylinderGeometry(.018,.018,.5,6),MT.gun,TR(c*.3,.52,-s*.3,0,0,0));}}
  /* the blades: twisted, a cuff at the root, a painted tip */
  const bladeG=(()=>{const R0=.75,R1=8.65,N=22;const sec=foil(.58,.12);const pos=[],col=[],idx=[];const n=sec.length;
    for(let k=0;k<=N;k++){const r=lerp(R0,R1,k/N),tw=lerp(.12,-.05,k/N);const tipK=r>R1-.32?1:0;
      sec.forEach(([a,b])=>{const zz=-(a-.145),yy=b;pos.push(r,zz*Math.sin(tw)+yy*Math.cos(tw),zz*Math.cos(tw)-yy*Math.sin(tw));const cc=tipK?[.65,.52,.08]:r<1.1?[.45,.45,.42]:[1,1,1];col.push(...cc);});}
    for(let k=0;k<N;k++)for(let i=0;i<n;i++){const j=(i+1)%n;const a=k*n+i,b=k*n+j,c=(k+1)*n+i,d=(k+1)*n+j;idx.push(a,c,d,a,d,b);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('color',new T.Float32BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();return g;})();
  const blades=new T.Group();blades.position.y=.78;rotor.add(blades);H.blades=[];
  for(let i=0;i<5;i++){const b=new T.Mesh(bladeG,MT.blade);b.rotation.y=i/5*Math.PI*2;b.rotation.z=.045;b.castShadow=true;blades.add(b);H.blades.push(b);}
  /* the blur of the spinning disc */
  const blurT=tex(512,512,(c,w,h)=>{const g=c.createImageData(w,h),d=g.data;for(let y=0;y<h;y++)for(let x=0;x<w;x++){const u=(x+.5)/w*2-1,v=(y+.5)/h*2-1,r=Math.hypot(u,v),i=(y*w+x)*4;
      let a=0;if(r<1&&r>.085){a=.13+.05*Math.sin(r*90)*(r>.5?1:.4);if(r>.965)a+=.25;if(r>.93&&r<.965)a+=.12;a*=sstep(.085,.14,r);}
      const tip=r>.93;d[i]=tip?150:40;d[i+1]=tip?128:42;d[i+2]=tip?40:38;d[i+3]=clamp(a,0,1)*255;}c.putImageData(g,0,0);},{clamp:true});
  const blurM=new T.MeshBasicMaterial({map:blurT,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0,fog:true});
  const disc=new T.Mesh(new T.PlaneGeometry(17.4,17.4).rotateX(-Math.PI/2),blurM);disc.position.y=.82;disc.renderOrder=3;rotor.add(disc);

  /* ===================== tail rotor (port side of the fin) ===================== */
  const trot=new T.Group();trot.position.set(.36,3.42,-10.95);trot.rotation.z=-Math.PI/2;air.add(trot);
  {const hb=new T.Mesh(new T.CylinderGeometry(.11,.14,.56,14),MT.dark);hb.position.y=-.08;trot.add(hb);const cap=new T.Mesh(new T.SphereGeometry(.11,12,8),MT.dark);cap.position.y=.22;trot.add(cap);}
  const tbG=(()=>{const g=wing([{x:.15,y:0,zLE:.13,c:.27,t:.11},{x:1.95,y:0,zLE:.12,c:.24,t:.1}]);const c=new Float32Array(g.attributes.position.count*3);for(let i=0;i<g.attributes.position.count;i++){const r=g.attributes.position.getX(i);c.set(r>1.7?[.62,.12,.08]:[1,1,1],i*3);}g.setAttribute('color',new T.BufferAttribute(c,3));return g;})();
  const tblades=new T.Group();tblades.position.y=.12;trot.add(tblades);
  for(let i=0;i<3;i++){const b=new T.Mesh(tbG,MT.blade);b.rotation.y=i/3*Math.PI*2;tblades.add(b);}
  const tdisc=new T.Mesh(new T.CircleGeometry(1.97,32).rotateX(-Math.PI/2),new T.MeshBasicMaterial({map:blurT,transparent:true,depthWrite:false,side:T.DoubleSide,opacity:0,fog:true}));tdisc.position.y=.12;trot.add(tdisc);

  air.traverse(o=>{o.frustumCulled=true;});
  H.air=air;H.rotor=rotor;H.blades=blades;H.disc=disc;H.trot=trot;H.tblades=tblades;H.tdisc=tdisc;
  /* spin: blur 0 = blades seen sharp (stopped or a fast shutter), 1 = in flight */
  H.spin=(g,ang,tang,blur)=>{const B=g.userData.parts;B.blades.rotation.y=-ang;B.tblades.rotation.y=tang;B.disc.material.opacity=lerp(0,1,blur);B.tdisc.material.opacity=lerp(0,.9,blur);
    B.bladeMat.opacity=lerp(1,.38,blur);B.bladeMat.transparent=blur>0.01;B.tbladeMat.opacity=lerp(1,.18,blur);B.tbladeMat.transparent=blur>0.01;};
  /* a flying copy: its own rotor parts and blade materials so two can spin out of step */
  H.make=()=>{const g=air.clone(true);const P={};g.traverse(o=>{});const rot=g.children.find(o=>o.isGroup&&o.position.y===3.2);const tr=g.children.find(o=>o.isGroup&&o.position.z===-10.95);
    const bl=rot.children.find(o=>o.isGroup&&o.position.y===.78),di=rot.children.find(o=>o.isMesh&&o.renderOrder===3);
    const tbl=tr.children.find(o=>o.isGroup),tdi=tr.children.find(o=>o.isMesh&&o.material.map===blurT);
    const bm=MT.blade.clone(),tbm=MT.blade.clone();bl.children.forEach(b=>b.material=bm);tbl.children.forEach(b=>b.material=tbm);di.material=di.material.clone();tdi.material=tdi.material.clone();
    g.userData.parts={blades:bl,disc:di,tblades:tbl,tdisc:tdi,bladeMat:bm,tbladeMat:tbm,rotor:rot};return g;};
  let tris=0;air.traverse(o=>{if(o.isMesh){const g=o.geometry;tris+=(g.index?g.index.count:g.attributes.position.count)/3;}});H.tris=Math.round(tris);
  return H;})();
