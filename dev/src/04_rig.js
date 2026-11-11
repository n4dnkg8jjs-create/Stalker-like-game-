/* ---------- characters: skinned meshes built from the CC0 MakeHuman base mesh (see 03y_chars.js) ---------- */
const CD=CHARDATA;
function b64u(s,Ty){const bin=atob(s),u=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)u[i]=bin.charCodeAt(i);return new Ty(u.buffer);}
const SHD=(()=>{const s=CD.shared;return{tris:b64u(s.tris,Uint16Array),uv:b64u(s.uv,Uint16Array),vidx:b64u(s.vidx,Uint16Array),skI:b64u(s.skI,Uint8Array),skW:b64u(s.skW,Uint8Array),
  flags:b64u(s.flags,Uint8Array),loose:b64u(s.loose,Uint8Array),nv:s.nv,nvs:s.nvs,eyeOp:b64u(s.eye.op,Uint16Array),eyeCl:b64u(s.eye.cl,Uint16Array),eyeUV:b64u(s.eye.uv,Uint16Array),
  teeth:Object.fromEntries(Object.entries(s.teeth).map(([k,v])=>[k,b64u(v.t,Uint16Array)]))};})();
const CGEO={};
function deq(s,n){const a=b64u(s,Int16Array),o=new Float32Array(a.length),q=1/CD.Q;for(let i=0;i<a.length;i++)o[i]=a[i]*q;return o;}
function charGeo(name){if(CGEO[name])return CGEO[name];const c=CD.chars[name];const pos=deq(c.pos);const n=SHD.nv;
  const acc=new Float32Array(SHD.nvs*3),tr=SHD.tris,vi=SHD.vidx;
  for(let f=0;f<tr.length;f+=3){const a=tr[f]*3,b=tr[f+1]*3,cc=tr[f+2]*3;const ux=pos[b]-pos[a],uy=pos[b+1]-pos[a+1],uz=pos[b+2]-pos[a+2],vx=pos[cc]-pos[a],vy=pos[cc+1]-pos[a+1],vz=pos[cc+2]-pos[a+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(let k=0;k<3;k++){const o=vi[tr[f+k]]*3;acc[o]+=nx;acc[o+1]+=ny;acc[o+2]+=nz;}}
  const nor=new Float32Array(n*3);for(let i=0;i<n;i++){const o=vi[i]*3;const l=Math.hypot(acc[o],acc[o+1],acc[o+2])||1;nor[i*3]=acc[o]/l;nor[i*3+1]=acc[o+1]/l;nor[i*3+2]=acc[o+2]/l;}
  return CGEO[name]={pos,nor,c,sub:{}};}
function subsetGeo(cg,triMask,inflate,key){if(cg.sub[key])return cg.sub[key];
  const tr=SHD.tris,n=SHD.nv;const map=new Int32Array(n).fill(-1);const idx=[];let m=0;
  for(let f=0;f<tr.length/3;f++){if(!triMask(f))continue;for(let k=0;k<3;k++){const v=tr[f*3+k];if(map[v]<0)map[v]=m++;idx.push(map[v]);}}
  const P=new Float32Array(m*3),N=new Float32Array(m*3),U=new Float32Array(m*2),SI=new Uint16Array(m*4),SW=new Float32Array(m*4);
  for(let v=0;v<n;v++){const j=map[v];if(j<0)continue;const L=inflate*SHD.loose[v]/100;
    for(let k=0;k<3;k++){N[j*3+k]=cg.nor[v*3+k];P[j*3+k]=cg.pos[v*3+k]+cg.nor[v*3+k]*L;}
    U[j*2]=SHD.uv[v*2]/65535;U[j*2+1]=SHD.uv[v*2+1]/65535;for(let k=0;k<4;k++){SI[j*4+k]=SHD.skI[v*4+k];SW[j*4+k]=SHD.skW[v*4+k]/255;}}
  let Pf=P,Nf=N,Uf=U,SIf=SI,SWf=SW;
  if(inflate>0){/* close open garment edges (collar, cuffs, hems) with a strip back down to the skin so the cloth reads as having thickness */
    const ec=new Map();for(let f=0;f<idx.length;f+=3)for(let k=0;k<3;k++){const a=idx[f+k],b=idx[f+(k+1)%3];const kk=a<b?a*m+b:b*m+a;ec.set(kk,(ec.get(kk)||0)+1);}
    const bd=[];for(let f=0;f<idx.length;f+=3)for(let k=0;k<3;k++){const a=idx[f+k],b=idx[f+(k+1)%3];if(ec.get(a<b?a*m+b:b*m+a)===1)bd.push(a,b);}
    const inner=new Map();let m2=m;bd.forEach(v=>{if(!inner.has(v))inner.set(v,m2++);});
    Pf=new Float32Array(m2*3);Pf.set(P);Nf=new Float32Array(m2*3);Nf.set(N);Uf=new Float32Array(m2*2);Uf.set(U);SIf=new Uint16Array(m2*4);SIf.set(SI);SWf=new Float32Array(m2*4);SWf.set(SW);
    const back=new Int32Array(m).fill(-1);for(let v=0;v<n;v++)if(map[v]>=0)back[map[v]]=v;
    inner.forEach((j,v)=>{const o=back[v];for(let k=0;k<3;k++){Pf[j*3+k]=cg.pos[o*3+k]+cg.nor[o*3+k]*.0015;Nf[j*3+k]=-N[v*3+k];}Uf[j*2]=U[v*2];Uf[j*2+1]=U[v*2+1]+.004;for(let k=0;k<4;k++){SIf[j*4+k]=SI[v*4+k];SWf[j*4+k]=SW[v*4+k];}});
    for(let i=0;i<bd.length;i+=2){const a=bd[i],b=bd[i+1],ai=inner.get(a),bi=inner.get(b);idx.push(b,a,ai,b,ai,bi);}}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(Pf,3));g.setAttribute('normal',new T.BufferAttribute(Nf,3));g.setAttribute('uv',new T.BufferAttribute(Uf,2));
  g.setAttribute('skinIndex',new T.BufferAttribute(SIf,4));g.setAttribute('skinWeight',new T.BufferAttribute(SWf,4));g.setIndex(idx);g.computeBoundingSphere();
  g.userData.map=map;return cg.sub[key]=g;}
/* face morph targets (blink, squint, smile, brow raise, frown) stored sparse, relative, in split-vertex space */
const FACEMORPHS=['blink','squint','smile','browUp','frown'];
function skinGeo(cg,outfit,hood){const key='skin_'+outfit+(hood?'_h':'');if(cg.sub[key])return cg.sub[key];
  const of=CD.outfits[outfit];const hide=of._hide||(of._hide=b64u(of.hide,Uint8Array));
  /* skin under a balaclava is not drawn at all (nothing can poke through when the jaw or an expression moves it) */
  const bh=cg.c.balaHide?b64u(cg.c.balaHide,Uint8Array):null,bhid=f=>bh&&(bh[f>>3]>>(7-(f&7)))&1;
  const hh=hood&&cg.c.hoodHide?b64u(cg.c.hoodHide,Uint8Array):null,hhid=f=>hh&&(hh[f>>3]>>(7-(f&7)))&1;
  const g=subsetGeo(cg,f=>!hide[f]&&!bhid(f)&&!hhid(f),0,key);const mp=cg.c.morph,map=g.userData.map,nv=g.attributes.position.count;
  g.morphAttributes.position=FACEMORPHS.map(k=>{const a=new Float32Array(nv*3);if(mp&&mp[k]){const ix=b64u(mp[k].i,Uint16Array),d=b64u(mp[k].d,Int16Array);
    for(let i=0;i<ix.length;i++){const j=map[ix[i]];if(j<0)continue;a[j*3]=d[i*3]/40000;a[j*3+1]=d[i*3+1]/40000;a[j*3+2]=d[i*3+2]/40000;}}return new T.BufferAttribute(a,3);});
  g.morphTargetsRelative=true;
  if(cg.c.thick){const th=cg._th||(cg._th=b64u(cg.c.thick,Uint8Array)),a=new Float32Array(nv);for(let v=0;v<map.length;v++){const j=map[v];if(j>=0)a[j]=th[v]/4000;}g.setAttribute('thick',new T.BufferAttribute(a,1));}
  return g;}
/* ---- wardrobe: garments draped offline (loose cloth, folds, pockets, pads) — shared topology, per-character positions ---- */
function decPiece(pc){if(pc._d)return pc._d;const uv16=b64u(pc.uv,Uint16Array),uv=new Float32Array(uv16.length);for(let i=0;i<uv.length;i++)uv[i]=uv16[i]/65535;
  return pc._d={t:b64u(pc.t,Uint16Array),vidx:b64u(pc.vidx,Uint16Array),uv,skI:b64u(pc.skI,Uint8Array),skW:b64u(pc.skW,Uint8Array),ao:b64u(pc.ao,Uint8Array)};}
const WGEO={};
function mergedWear(name,mat,pcs){const k=name+'|M|'+mat;if(WGEO[k])return WGEO[k];const gs=pcs.map(pc=>wearGeo(name,pc));if(gs.length===1)return WGEO[k]=gs[0];
  let nv=0,ni=0;gs.forEach(g=>{nv+=g.attributes.position.count;ni+=g.index.count;});const out=new T.BufferGeometry();
  for(const a of ['position','normal','uv','color','skinIndex','skinWeight']){const s0=gs[0].attributes[a];const arr=new s0.array.constructor(nv*s0.itemSize);let o=0;gs.forEach(g=>{arr.set(g.attributes[a].array,o);o+=g.attributes[a].array.length;});out.setAttribute(a,new T.BufferAttribute(arr,s0.itemSize));}
  const ix=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let o=0,vo=0;gs.forEach(g=>{const s0=g.index.array;for(let i=0;i<s0.length;i++)ix[o+i]=s0[i]+vo;o+=s0.length;vo+=g.attributes.position.count;});
  out.setIndex(new T.BufferAttribute(ix,1));out.computeBoundingSphere();return WGEO[k]=out;}
function wearGeo(name,pc,triFilter,key){const k=name+'|'+pc.name+(key||'');if(WGEO[k])return WGEO[k];const d=decPiece(pc);
  const P=deq(CD.chars[name].wear[pc.name]),nu=pc.nu,vi=d.vidx,ns=vi.length;let t=d.t;
  if(triFilter){const keep=[];for(let f=0;f<t.length;f+=3)if(triFilter(vi[t[f]],vi[t[f+1]],vi[t[f+2]],d))keep.push(t[f],t[f+1],t[f+2]);t=new Uint16Array(keep);}
  const acc=new Float32Array(nu*3);
  for(let f=0;f<d.t.length;f+=3){const a=vi[d.t[f]]*3,b=vi[d.t[f+1]]*3,c=vi[d.t[f+2]]*3;const ux=P[b]-P[a],uy=P[b+1]-P[a+1],uz=P[b+2]-P[a+2],vx=P[c]-P[a],vy=P[c+1]-P[a+1],vz=P[c+2]-P[a+2];
    const nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;for(const o of [a,b,c]){acc[o]+=nx;acc[o+1]+=ny;acc[o+2]+=nz;}}
  const pos=new Float32Array(ns*3),nor=new Float32Array(ns*3),col=new Float32Array(ns*3),SI=new Uint16Array(ns*4),SW=new Float32Array(ns*4);
  for(let j=0;j<ns;j++){const u=vi[j];const l=Math.hypot(acc[u*3],acc[u*3+1],acc[u*3+2])||1;
    for(let k=0;k<3;k++){pos[j*3+k]=P[u*3+k];nor[j*3+k]=acc[u*3+k]/l;col[j*3+k]=d.ao[u]/255;}
    let ws=0;for(let k=0;k<4;k++){SI[j*4+k]=d.skI[u*4+k];SW[j*4+k]=d.skW[u*4+k]/255;ws+=SW[j*4+k];}if(ws>0)for(let k=0;k<4;k++)SW[j*4+k]/=ws;}
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(pos,3));g.setAttribute('normal',new T.BufferAttribute(nor,3));g.setAttribute('uv',new T.BufferAttribute(d.uv,2));
  g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('skinIndex',new T.BufferAttribute(SI,4));g.setAttribute('skinWeight',new T.BufferAttribute(SW,4));g.setIndex(new T.BufferAttribute(t,1));g.computeBoundingSphere();
  return WGEO[k]=g;}
/* ---- hard gear sculpted offline: boots (skinned to ankle/shin), 6B45 vest (spine), 6B47 helmet (head) ---- */
const GGEO={};
function gearGeo(name,kind,part,off,skin,noHz){const k=name+'|'+kind+'|'+part+(off?'o':'')+(noHz?'h':'');if(GGEO[k])return GGEO[k];const gs=CD.gear[kind];
  const cgear=CD.chars[name].gear;let P;
  if(cgear.aff){P=deq(gs.v);const A=cgear.aff[part],mir=part==='bootR'||part==='sprotR';for(let i=0;i<P.length;i+=3){if(mir)P[i]=-P[i];for(let k=0;k<3;k++)P[i+k]=A[1][k]+(P[i+k]-A[0][k])*A[2][k];}}
  else P=deq(cgear[part]);
  if(off)for(let i=0;i<P.length;i+=3){P[i]-=off.x;P[i+1]-=off.y;P[i+2]-=off.z;}
  let t=b64u(gs.t,Uint16Array);const mirror=part==='bootR'||part==='sprotR';if(mirror){t=t.slice();for(let f=0;f<t.length;f+=3){const a=t[f+1];t[f+1]=t[f+2];t[f+2]=a;}}
  const mid=gs._mid||(gs._mid=b64u(gs.mid,Uint8Array)),ao=gs._ao||(gs._ao=b64u(gs.ao,Uint8Array));
  /* sort triangles by material so each part gets its own draw group */
  const hz=noHz&&gs.hz?(gs._hz||(gs._hz=b64u(gs.hz,Uint8Array))):null;   /* hz: the helmet's own chin harness (left out when it is rebuilt over a balaclava / mask) */
  const groups=[];const byM={};for(let f=0;f<t.length;f+=3){if(hz&&hz[t[f]]&&hz[t[f+1]]&&hz[t[f+2]])continue;const m=mid[t[f]];(byM[m]||(byM[m]=[])).push(t[f],t[f+1],t[f+2]);}
  const idx=[];Object.keys(byM).sort().forEach(m=>{groups.push([idx.length,byM[m].length,+m]);for(const x of byM[m])idx.push(x);});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));
  const col=new Float32Array(ao.length*3);for(let i=0;i<ao.length;i++)col[i*3]=col[i*3+1]=col[i*3+2]=ao[i]/255;g.setAttribute('color',new T.BufferAttribute(col,3));
  g.setIndex(idx);groups.forEach(([s0,c,m])=>g.addGroup(s0,c,m));g.computeVertexNormals();
  if(skin){const wk=gs._wk||(gs._wk=b64u(gs.wkn,Uint8Array));const n=ao.length,SI=new Uint16Array(n*4),SW=new Float32Array(n*4);
    for(let i=0;i<n;i++){SI[i*4]=skin[0];SI[i*4+1]=skin[1];SW[i*4]=1-wk[i]/255;SW[i*4+1]=wk[i]/255;}
    g.setAttribute('skinIndex',new T.BufferAttribute(SI,4));g.setAttribute('skinWeight',new T.BufferAttribute(SW,4));}
  g.computeBoundingSphere();return GGEO[k]=g;}
/* a per-character packed mesh (positions, triangles, per-vertex material id and AO) as a geometry with one group per material */
function packedGeo(d,off){const P=deq(d.v);if(off)for(let i=0;i<P.length;i+=3){P[i]-=off.x;P[i+1]-=off.y;P[i+2]-=off.z;}
  const t=d.w32?b64u(d.t,Uint32Array):b64u(d.t,Uint16Array),ao=b64u(d.ao,Uint8Array),mid=d.mid?b64u(d.mid,Uint8Array):null;
  const byM={};for(let f=0;f<t.length;f+=3){const m=mid?mid[t[f]]:0;(byM[m]||(byM[m]=[])).push(t[f],t[f+1],t[f+2]);}
  const idx=[],groups=[];Object.keys(byM).sort().forEach(m=>{groups.push([idx.length,byM[m].length,+m]);for(const x of byM[m])idx.push(x);});
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(P,3));
  const col=new Float32Array(ao.length*3);for(let i=0;i<ao.length;i++)col[i*3]=col[i*3+1]=col[i*3+2]=ao[i]/255;g.setAttribute('color',new T.BufferAttribute(col,3));
  g.setIndex(idx.length>65535?new T.BufferAttribute(new Uint32Array(idx),1):idx);groups.forEach(([s0,c,m])=>g.addGroup(s0,c,m));g.computeVertexNormals();g.computeBoundingSphere();return g;}
/* materials: garments use triplanar projection in bind space, so camo and plaid wrap cleanly with no seams */
function triMat(tex,scale,o={}){const m=std(Object.assign({map:tex,roughness:.9,skinning:true,side:T.DoubleSide,vertexColors:true},o));
  m.onBeforeCompile=s=>{s.uniforms.uTriS={value:scale};
    s.vertexShader='varying vec3 vTP;varying vec3 vTN;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvTP=position;vTN=normal;');
    s.fragmentShader='uniform float uTriS;varying vec3 vTP;varying vec3 vTN;\n'+s.fragmentShader.replace('#include <map_fragment>',
     `vec3 bw=pow(abs(normalize(vTN)),vec3(4.0));bw/=dot(bw,vec3(1.0));
      vec4 tX=texture2D(map,vTP.zy*uTriS),tY=texture2D(map,vTP.xz*uTriS),tZ=texture2D(map,vTP.xy*uTriS);
      vec4 texelColor=mapTexelToLinear(tX*bw.x+tY*bw.y+tZ*bw.z);diffuseColor*=texelColor;`);};
  return m;}
const CM={};
function cmat(kind,skinning=true,tag=''){const key=kind+(skinning?'':'_r')+tag;if(CM[key])return CM[key];let m;const sk={skinning};
  switch(kind){case 'emr':m=triMat(TX.emr,3.6,{roughness:.93,...sk});break;
    case 'khaki':m=triMat(TX.khaki,3.6,{roughness:.95,...sk});break;case 'khakiW':m=triMat(TX.khaki,3.4,{roughness:.95,color:C(0xd8d2c0),...sk});break;
    case 'velcro':m=triMat(TX.emr,3.6,{roughness:1,color:C(0x8a8a80),...sk});break;
    case 'vest':m=triMat(TX.emr,3.4,{roughness:.95,color:C(0xe8e8e0),...sk});break;
    case 'webbing':m=triMat(TX.emr,3.4,{roughness:.92,color:C(0xb2b2a8),...sk});break;
    case 'vestOl':m=triMat(TX.olive,3.4,{roughness:.95,...sk});break;
    case 'bala':m=triMat(TX.knit,11,{roughness:.9,envMapIntensity:.3,...sk});break;
    case 'gp5':m=std({color:C(0x6b6e66),roughness:.58,envMapIntensity:.55,vertexColors:true,...sk});break;
    case 'webOl':m=triMat(TX.olive,3.4,{roughness:.88,color:C(0xc2c4b6),...sk});break;
    case 'molle':m=triMat(TX.emr,3.4,{roughness:.95,color:C(0xb0b0a4),...sk});break;
    case 'helmet':m=triMat(TX.emr,6.2,{roughness:.95,...sk});break;
    case 'glove':m=std({color:C(0x3a372c),roughness:.85,vertexColors:true,side:T.DoubleSide,...sk});break;
    case 'pad':m=std({color:C(0x3f4332),roughness:.9,vertexColors:true,...sk});break;
    case 'padhard':m=std({color:C(0x2b2d25),roughness:.5,vertexColors:true,...sk});break;
    case 'strap':m=std({color:C(0x1f211b),roughness:.9,vertexColors:true,side:T.DoubleSide,...sk});break;
    case 'black':m=std({color:C(0x141413),roughness:.55,vertexColors:true,...sk});break;
    case 'tqRub':m=std({color:C(0xa8401c),roughness:.48,envMapIntensity:.8,vertexColors:true,...sk});break;
    case 'leather':m=std({color:C(0x161412),roughness:.42,envMapIntensity:.7,vertexColors:true,...sk});break;
    case 'oldleather':m=std({color:C(0x3a2a1d),roughness:.6,vertexColors:true,...sk});break;
    case 'rubber':m=std({color:C(0x111111),roughness:.92,vertexColors:true,...sk});break;
    case 'lace':m=std({color:C(0x2a2722),roughness:.85,vertexColors:true,...sk});break;
    case 'felt':m=triMat(TX.cloth,4,{roughness:1,color:C(0x7a746a),...sk});break;
    case 'lens':m=std({color:C(0x1e1d18),roughness:.34,metalness:.1,envMapIntensity:.7,transparent:true,opacity:.72,depthWrite:false,side:T.FrontSide,...sk});break;
    case 'harn':m=std({color:C(0x6e6c4c),roughness:.86,vertexColors:true,side:T.DoubleSide,...sk});break;
    case 'visor':m=std({color:C(0x343b36),roughness:.14,metalness:0,envMapIntensity:.95,transparent:true,opacity:.66,depthWrite:false,side:T.FrontSide,...sk});break;
    case 'maskRub':m=std({color:C(0x5c614e),roughness:.72,envMapIntensity:.5,vertexColors:true,...sk});break;
    case 'maskStrap':m=std({color:C(0x2e3228),roughness:.8,vertexColors:true,side:T.DoubleSide,...sk});break;
    case 'maskPl':m=std({color:C(0x2a2d26),roughness:.45,envMapIntensity:.7,vertexColors:true,...sk});break;
    case 'filtCl':m=triMat(TX.olive,9,{roughness:1,color:C(0xa2a488),vertexColors:false,...sk});break;
    case 'maskPl2':m=std({color:C(0x2c2f28),roughness:.45,envMapIntensity:.7,...sk});break;
    case 'maskRub2':m=std({color:C(0x5c614e),roughness:.72,envMapIntensity:.5,...sk});break;
    case 'maskStrap2':m=std({color:C(0x2e3228),roughness:.8,...sk});break;
    case 'filtMt':m=std({color:C(0x4a5038),roughness:.5,metalness:.35,envMapIntensity:.8,...sk});break;
    case 'quilt':m=triMat(TX.cloth,3.0,{roughness:1,color:C(0x3a3a36),...sk});break;
    case 'cloth':m=triMat(TX.cloth,3,{roughness:1,color:C(0x8a8478),...sk});break;
    case 'plaid':m=triMat(TX.plaid,2.2,{roughness:1,...sk});break;}
  const DET={emr:['weave',14,.32],velcro:['weave',20,.6],vest:['weave',14,.55],webbing:['webbing',22,.7],helmet:['weave',16,.45],glove:['leather',45,.6],pad:['plastic',12,.5],
    padhard:['plastic',10,.35],tqRub:['rubber',30,.4],strap:['webbing',26,.6],black:['plastic',20,.3],leather:['leather',32,.8],oldleather:['leather',28,.9],rubber:['rubber',40,.5],lace:['webbing',60,.5],
    harn:['webbing',40,.6],bala:['weave',90,.5],maskRub:['rubber',70,.1],gp5:['rubber',60,.12],maskStrap:['webbing',40,.5],filtCl:['weave',30,.6],molle:['webbing',22,.7],vestOl:['weave',14,.55],webOl:['webbing',22,.7],    felt:['rubber',14,.7],quilt:['weave',12,.4],cloth:['weave',16,.45],plaid:['weave',18,.45]}[kind];
  if(DET)detailPatch(m,DET[0],DET[1],DET[2]);
  if(kind==='molle')molleRows(m);
  if(skinning&&(kind==='emr'||kind==='quilt'||kind==='cloth'||kind==='plaid'))creasePatch(m);
  return CM[key]=m;}
/* cloth creases that come and go with the pose: wherever a vertex is shared between two bones, the angle between those
   bones (read straight from the skinning matrices) says how far that joint is bent, so the knees, the backs of the knees,
   the hip crease, the elbows and the armpits bunch up into folds when you crouch, kneel, sit or raise the rifle, and
   relax when you stand. A few soft resting folds stay at those joints even when straight. Folds run across the limb,
   are shaded in their valleys and perturb the normal. */
function creasePatch(m){const prev=m.onBeforeCompile;m.onBeforeCompile=(s,r)=>{prev(s,r);
    /* per vertex at a joint: where the two bones it hangs on would each carry it. On the inside of a bend the child bone
       pushes the cloth into the body (it bunches into folds); on the outside it pulls away (the cloth goes taut and smooth) */
    s.vertexShader='varying float vBend;varying float vComp;\n'+s.vertexShader.replace('#include <skinnormal_vertex>',`#include <skinnormal_vertex>
      {float mixw=clamp(min(skinWeight.x,skinWeight.y)*3.2,0.,1.);vec3 pA=(boneMatX*vec4(position,1.)).xyz,pB=(boneMatY*vec4(position,1.)).xyz;
       vec3 nA=normalize(mat3(boneMatX)*normal);vec3 dd=pB-pA;vBend=clamp(length(dd)*14.,0.,1.)*mixw;vComp=clamp(-dot(dd,nA)*30.,-1.,1.)*mixw;}`);
    let f=s.fragmentShader;
    f='varying float vBend;varying float vComp;\n'+f;
    f=f.replace('void main() {',`float crN(vec3 p){vec3 i=floor(p),q=fract(p);q=q*q*(3.-2.*q);float h=dot(i,vec3(1.,57.,113.));
        vec4 a=fract(sin(vec4(h,h+1.,h+57.,h+58.))*43758.5453),b=fract(sin(vec4(h+113.,h+114.,h+170.,h+171.))*43758.5453);
        vec4 c=mix(a,b,q.z);vec2 d=mix(c.xy,c.zw,q.y);return mix(d.x,d.y,q.x);}
      float crF(vec3 p){return crN(p)*.58+crN(p*2.27+7.1)*.29+crN(p*5.13+3.3)*.13;}
      /* cloth folds with a cause:
         - a bent joint bunches the cloth into a few deep folds across the limb, on the inside of the bend only;
         - sleeves stack in soft rings above the cuff, trousers stack above the boots;
         - the jacket hangs in long vertical folds from the chest, deepening toward the waist; trousers hang from the hips
           down the thighs. The tops of the shoulders, where the cloth is carried, stay smooth. */
      float crV;
      float creaseH(){float ax=abs(vTP.x),y=vTP.y;float arm=smoothstep(.17,.24,ax);float along=mix(y,ax*.8+y*.6,arm);
        float w1=(crF(vTP*6.)-.5)*3.2;
        float jb=clamp(vComp*1.4,0.,1.)*smoothstep(.05,.35,vBend);
        float xj=along*90.+w1*3.;float sj=abs(sin(xj));float jf=pow(sj,.7)*jb*(.55+.45*smoothstep(.2,.6,crF(vTP*5.+2.)));
        float cuff=arm*smoothstep(.46,.56,ax);float ank=(1.-arm)*(1.-smoothstep(.29,.45,y))*step(y,.6);float stk=max(cuff,ank);
        float xs=along*118.+w1*2.4;float s2=abs(sin(xs));float st=pow(s2,.7)*stk;
        float torso=(1.-arm)*smoothstep(1.0,1.18,y)*(1.-smoothstep(1.32,1.42,y));float thigh=(1.-arm)*smoothstep(.5,.62,y)*(1.-smoothstep(.86,.98,y));
        float hang=torso*(1.-smoothstep(1.18,1.4,y))+thigh*.6;
        float xv=vTP.x*48.+(crF(vTP*vec3(5.,1.6,5.))-.5)*7.;float sv=abs(sin(xv));float dv=pow(sv,.8)*hang;
        crV=(1.-sj)*jb+(1.-s2)*stk*.8+(1.-sv)*hang*.45;
        return jf*1.3+st*.9+dv*.7;}
      void main() {`);
    f=f.replace('#include <roughnessmap_fragment>','float crH=creaseH();diffuseColor.rgb*=1.-clamp(crV,0.,1.)*.24;\n#include <roughnessmap_fragment>');
    f=f.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\nnormal=dPerturb(-vViewPosition,normal,crH*.0085,faceDirection);');
    s.fragmentShader=f;};
  const ck=m.customProgramCacheKey();m.customProgramCacheKey=()=>ck+'crease3';}
/* MOLLE / PALS webbing: 25 mm strips on a 38 mm pitch with 13 mm gaps of the cordura behind them in shadow, bar-tacked
   every 38 mm across - drawn in the shader from the gear's own (spine-local) position, so it never smears or swims */
function molleRows(m){const prev=m.onBeforeCompile;m.onBeforeCompile=(s,r)=>{prev(s,r);let f=s.fragmentShader;
    f=f.replace('void main() {',`float molleB(){float y=fract(vTP.y*26.316+.31);return smoothstep(.0,.05,y)*(1.-smoothstep(.64,.70,y));}
      float molleT(){return 1.-smoothstep(.012,.04,abs(fract(vTP.x*26.316+.5)-.5));}
      void main() {`);
    f=f.replace('#include <map_fragment>','#include <map_fragment>\n{float mb=molleB(),tk=molleT()*mb;diffuseColor.rgb*=mix(.42,1.,mb)*(1.-tk*.3);}');
    f=f.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n{float mb=molleB(),tk=molleT()*mb;normal=dPerturb(-vViewPosition,normal,mb*.0024-tk*.0007,faceDirection);}');
    s.fragmentShader=f;};
  const ck=m.customProgramCacheKey();m.customProgramCacheKey=()=>ck+'molle';}
/* olive tactical gloves (reference: sage-olive synthetic leather, dark brown-olive suede patches): an arched pad over
   the knuckles, a broad curved band across the back of the hand, a strip along the index-finger edge, suede finger
   caps, a velcro wrist tab, double stitching round the patches, a suede palm. Drawn in the hand's own bind-pose frame
   (wrist, knuckles, index/little-finger line), so it sits right on every character and never swims when the hand moves */
const GLOVEM={};
function gloveMat(name,BN){if(GLOVEM[name])return GLOVEM[name];const V=()=>new T.Vector3();
  const fr=s=>{const w=BN['wr'+s].getWorldPosition(V()),k=BN['mid'+s+'1'].getWorldPosition(V()),i=BN['idx'+s+'1'].getWorldPosition(V()),p=BN['pnk'+s+'1'].getWorldPosition(V());
    const a=k.clone().sub(w);const K=a.length();a.normalize();const b=i.clone().sub(p);b.sub(a.clone().multiplyScalar(b.dot(a))).normalize();const n=a.clone().cross(b).normalize();if(n.y<0)n.negate();
    return{w,a,b,n,K};};
  const L=fr('L'),R=fr('R');
  const m=std({color:C(0xffffff),roughness:.6,vertexColors:true,side:T.DoubleSide,skinning:true});detailPatch(m,'leather',30,.05,false);
  const prev=m.onBeforeCompile;
  m.onBeforeCompile=(s,r)=>{prev(s,r);
    Object.assign(s.uniforms,{gWL:{value:L.w},gAL:{value:L.a},gBL:{value:L.b},gNL:{value:L.n},gKL:{value:L.K},gWR:{value:R.w},gAR:{value:R.a},gBR:{value:R.b},gNR:{value:R.n},gKR:{value:R.K}});
    let f=s.fragmentShader;
    f=f.replace('void main() {',`uniform vec3 gWL,gAL,gBL,gNL,gWR,gAR,gBR,gNR;uniform float gKL,gKR;
      float band(float d,float hw){return 1.-smoothstep(hw-.0009,hw+.0009,abs(d));}
      float stitch(float d,float hw,float along){return (1.-smoothstep(.0003,.00085,abs(abs(d)-(hw-.0024))))*smoothstep(-.3,.3,sin(along*1150.));}
      vec4 glovePat(){bool l=vTP.x<0.;vec3 W=l?gWL:gWR,A=l?gAL:gAR,B=l?gBL:gBR,N=l?gNL:gNR;float K=l?gKL:gKR;
        vec3 d=vTP-W;float u=dot(d,A),v=dot(d,B),h=dot(d,N);float back=smoothstep(-.006,.006,h);
        float d1=u-(K-.013+7.*v*v),e1=band(abs(v+.002)-.039,.0);float p1=band(d1,.0105)*(1.-smoothstep(.034,.042,abs(v+.002)));
        float d2=u-(K*.5+11.*v*v-.22*v);float p2=band(d2,.0105)*(1.-smoothstep(.039,.047,abs(v)));
        float p3=smoothstep(K+.056,K+.06,u);
        float p4=band(v-.036,.0065)*step(K*.5,u)*(1.-smoothstep(K+.05,K+.054,u));
        float p5=step(-.052,u)*(1.-step(-.021,u))*(1.-smoothstep(.026,.03,abs(v+.004)));
        float pat=max(max(p1,p2),max(p3,p4))*back;pat=max(pat,p5*back);
        float palm=(1.-back)*step(.004,u)*(1.-smoothstep(K+.002,K+.008,u));
        float st=(stitch(d1,.0105,v)*(1.-smoothstep(.03,.036,abs(v)))+stitch(d2,.0105,v)*(1.-smoothstep(.035,.041,abs(v))))*back;
        st+=stitch(u+.0365,.0155,v)*(1.-smoothstep(.022,.026,abs(v+.004)))*back;
        return vec4(pat,palm,clamp(st,0.,1.),back);}
      void main() {`);
    f=f.replace('#include <map_fragment>','#include <map_fragment>\n vec4 gp=glovePat();{vec3 base=vec3(.088,.104,.058),pchC=vec3(.04,.036,.022),palmC=vec3(.05,.052,.032),thr=vec3(.19,.2,.14);\n diffuseColor.rgb*=mix(mix(mix(base,pchC,gp.x),palmC,gp.y),thr,gp.z*.9);}');
    f=f.replace('#include <roughnessmap_fragment>','#include <roughnessmap_fragment>\n roughnessFactor=mix(mix(.48,.93,max(gp.x,gp.y)),.75,gp.z);');
    f=f.replace('#include <normal_fragment_maps>','#include <normal_fragment_maps>\n normal=dPerturb(-vViewPosition,normal,gp.x*.0007-gp.z*.00025,faceDirection);');
    s.fragmentShader=f;};
  const ck=m.customProgramCacheKey();m.customProgramCacheKey=()=>ck+'glove';
  return GLOVEM[name]=m;}
/* (every character texture is kept in CTEX, so anything that has to draw the people before the first frame - the
   family photographs - can tell when they have all arrived) */
const CTEX=[];const texLoad=src=>{const t=new T.TextureLoader().load(src);t.encoding=T.sRGBEncoding;t.anisotropy=8;CTEX.push(t);return t;};
const texLin=src=>{const t=new T.TextureLoader().load(src);t.anisotropy=8;CTEX.push(t);return t;};
const SKINTEX={alive:texLoad(CD.tex.skin),decay:texLoad(CD.tex.decay)},SKINDET={alive:texLin(CD.tex.skinD),decay:texLin(CD.tex.decayD)};
/* skin: albedo + detail map (R = pore/wrinkle height for bump, G = roughness), wrapped red-shifted diffuse */
const SKM={};function skinMat(kind,tint,who){const k=kind+tint.join()+(who||'');if(SKM[k])return SKM[k];
  const m=std({morphTargets:true,map:SKINTEX[kind],bumpMap:SKINDET[kind],bumpScale:.0016,roughnessMap:SKINDET[kind],roughness:kind==='alive'?1:1.08,skinning:true,envMapIntensity:kind==='alive'?.2:.18,color:new T.Color(...tint)});
  skinPatch(m,kind==='alive'?[.3,.12,.07]:[.22,.12,.1]);
  if(who&&CD.chars[who]){const c=CD.chars[who];const hairM=!!c.hair,mus=!!c.must;faceDetail(m,c.fit,{hair:!hairM,beard:kind==='alive'?(mus?.55:.8):.5,hc:c.hc},who);}
  return SKM[k]=m;}
/* blood soaked into cloth and smeared on skin, painted in bind space so it stays put as the body moves: each spot is
   [x,y,z, radius, drip] - drip stretches it downward (below its centre) the way blood runs and soaks down a sleeve or a
   trouser leg; ragged noisy edges, darker and dried at the rim, wetter and glossier in the middle */
function bloodPatch(m,spots,id){/* idempotent: a material shared by a rebuilt body (cached skin) gets the patch once */
  if(!('_bpPrev' in m)){m._bpPrev=m.onBeforeCompile;m._bpKey=m.customProgramCacheKey?m.customProgramCacheKey():'';}const prev=m._bpPrev;
  const code=spots.map(sp=>`{vec3 d=vBP-vec3(${sp[0].toFixed(4)},${sp[1].toFixed(4)},${sp[2].toFixed(4)});if(d.y<0.)d.y*=${(sp[4]||1).toFixed(3)};
      float r=length(d)/${sp[3].toFixed(4)}+(bN(vBP*95.)-.5)*.32+(bN(vBP*24.+3.)-.5)*.42;bm=max(bm,(1.-smoothstep(.62,1.,r)));bc=max(bc,(1.-smoothstep(.15,.62,r)));}`).join('\n');
  m.onBeforeCompile=(s,r)=>{if(prev)prev(s,r);
    s.vertexShader='varying vec3 vBP;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvBP=position;');
    let f='varying vec3 vBP;\n'+s.fragmentShader;
    f=f.replace('void main() {',`float bH(vec3 p){p=fract(p*.3183099+.1);p*=17.;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}
      float bN(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);return mix(mix(mix(bH(i),bH(i+vec3(1,0,0)),f.x),mix(bH(i+vec3(0,1,0)),bH(i+vec3(1,1,0)),f.x),f.y),
        mix(mix(bH(i+vec3(0,0,1)),bH(i+vec3(1,0,1)),f.x),mix(bH(i+vec3(0,1,1)),bH(i+vec3(1,1,1)),f.x),f.y),f.z);}
      void main() {`);
    f=f.replace('#include <roughnessmap_fragment>',`#include <roughnessmap_fragment>
      {float bm=0.,bc=0.;${code}
       vec3 dry=vec3(.062,.011,.009),wet=vec3(.105,.009,.007);diffuseColor.rgb=mix(diffuseColor.rgb,mix(dry,wet,bc)*(.85+.3*bN(vBP*140.)),bm*.95);
       roughnessFactor=mix(roughnessFactor,mix(.74,.46,bc),bm);}`);
    s.fragmentShader=f;};
  const ck=m._bpKey;m.customProgramCacheKey=()=>ck+'|blood'+id;m.needsUpdate=true;return m;}
/* field dressings: gauze wound round and round (each turn a little off the last, frayed, slack where it crosses), the
   blood soaked through over the wound; an Esmarch tourniquet in turns above a limb wound. Built in the bind pose round
   the body's own surface and carried by the bone. */
let _GZ=null;function gauzeTex(){return _GZ||(_GZ=tex(512,128,(g,w,h)=>{const r=rng(31);g.fillStyle='#c4bba7';g.fillRect(0,0,w,h);
  for(let i=0;i<w;i+=3){g.fillStyle=`rgba(120,110,90,${.05+r()*.07})`;g.fillRect(i,0,1,h);}for(let j=0;j<h;j+=3){g.fillStyle=`rgba(120,110,90,${.04+r()*.06})`;g.fillRect(0,j,w,1);}
  for(let i=0;i<40;i++){g.fillStyle=`rgba(90,75,50,${r()*.12})`;g.beginPath();g.arc(r()*w,r()*h,4+r()*20,0,7);g.fill();}
  /* the wound sits at u = .1: a soaked patch, darker and dried at its middle, spreading thinner along the weave, with runs */
  const sp=(x,y,rx,ry,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,1);gr.addColorStop(0,`rgba(70,6,6,${a})`);gr.addColorStop(.55,`rgba(110,12,10,${a*.85})`);gr.addColorStop(1,'rgba(130,20,15,0)');
    g.save();g.translate(x,y);g.scale(rx,ry);g.translate(-x,-y);g.fillStyle=gr;g.fillRect(x-1,y-1,2,2);g.restore();};
  for(let k=0;k<3;k++){const x0=.1*w+k*w*.333;for(let i=0;i<18;i++)sp(x0+(r()-.5)*(60+k*20),h*.5+(r()-.5)*70,14+r()*30,12+r()*26,(.3+r()*.4)*(1-k*.25));}
  for(let i=0;i<30;i++){const x=r()*w,y=r()*h;g.fillStyle=`rgba(120,20,15,${r()*.12})`;g.fillRect(x,y,2+r()*6,1+r()*3);}},{}));}
function dressing(cx,axis,radiusAt,width,turns,mat,o={}){/* rings round an axis through cx: radiusAt(dir) gives the surface radius in direction dir */
  const ax=axis.clone().normalize(),e1=Math.abs(ax.y)<.9?V3(0,1,0).cross(ax).normalize():V3(1,0,0).cross(ax).normalize(),e2=ax.clone().cross(e1).normalize();
  const grp=new T.Group(),N=48;
  for(let k=0;k<turns;k++){const pos=[],uv=[],idx=[];const tilt=(o.tilt||0)+(k-(turns-1)/2)*(o.dt||.06),off=(k-(turns-1)/2)*(o.dz||.006),lift=(o.lift||.0022)+k*.0011;
    for(let i=0;i<=N;i++){const a=i/N*Math.PI*2,dir=e1.clone().multiplyScalar(Math.cos(a)).addScaledVector(e2,Math.sin(a));const R=radiusAt(dir)+lift;
      const wv=width*(.92+.12*Math.sin(a*3+k*1.7));
      for(const v of [-.5,.5]){const p=cx.clone().addScaledVector(dir,R*(1+.02*Math.sin(a*5+k)) ).addScaledVector(ax,off+v*wv+Math.sin(a+k)*tilt*R);pos.push(p.x,p.y,p.z);uv.push(i/N*(o.urep||1)+k*.333,v+.5);}}
    for(let i=0;i<N;i++){const a=i*2;idx.push(a,a+2,a+1,a+1,a+2,a+3);}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();
    const m=new T.Mesh(g,mat);m.castShadow=true;m.receiveShadow=true;grp.add(m);}
  return grp;}
function surfRadius(P,cx,ax,band,maxR=.2){/* radius of a point cloud round an axis, per direction (24 bins), within a slab of half-width band */
  const a=ax.clone().normalize(),e1=Math.abs(a.y)<.9?V3(0,1,0).cross(a).normalize():V3(1,0,0).cross(a).normalize(),e2=a.clone().cross(e1).normalize();
  const B=new Float32Array(24),v=V3();for(let i=0;i<P.length;i+=3){v.set(P[i]-cx.x,P[i+1]-cx.y,P[i+2]-cx.z);const t=v.dot(a);if(Math.abs(t)>band)continue;v.addScaledVector(a,-t);const r=v.length();if(r>maxR)continue;
    const k=Math.floor(((Math.atan2(v.dot(e2),v.dot(e1))/(Math.PI*2))+1)%1*24);if(r>B[k])B[k]=r;}
  for(let it=0;it<3;it++)for(let k=0;k<24;k++)if(!B[k])B[k]=(B[(k+23)%24]+B[(k+1)%24])/2||.05;
  return dir=>{const ang=((Math.atan2(dir.dot(e2),dir.dot(e1))/(Math.PI*2))+1)%1*24,k0=Math.floor(ang)%24,k1=(k0+1)%24,t=ang-Math.floor(ang);return B[k0]*(1-t)+B[k1]*t;};}
/* the wounded captain's dressings: a head bandage round the brow and the back of the skull, soaked over the cut on the
   left of the forehead; a tourniquet high on the left thigh with a bloody dressing below it */
function woundDress(h){const c=CD.chars[h.name],BN=h.P.bones,root=h.root;root.updateMatrixWorld(true);
  const pos=deq(c.pos),gz=std({map:gauzeTex(),roughness:.95,side:T.DoubleSide}),tq=cmat('tqRub',false);
  const eye=V3(...c.fit.eye),hc=V3(0,eye.y+.012,c.fit.skullZ-.004);
  /* the band: tilted - over the brow at the front, low over the occiput at the back */
  const axH=V3(0,1,-.32).normalize();const rH=surfRadius(pos,hc,axH,.012);
  const hb=dressing(hc,axH,d=>rH(d)+.003,.046,3,gz,{dt:.035,dz:.008,urep:1,lift:.0016});
  root.add(hb);root.updateMatrixWorld(true);BN.head.attach(hb);
  /* left thigh (game side R): tourniquet at a third of the way down, dressing below */
  const hp=root.worldToLocal(BN.hpR.getWorldPosition(V3())),kn=root.worldToLocal(BN.knR.getWorldPosition(V3())),ax=kn.clone().sub(hp);
  const tro=c.wear&&c.wear.trousers?deq(c.wear.trousers):pos;const at=t=>hp.clone().addScaledVector(ax,t);const rT=surfRadius(tro,at(.3),ax,.02,.17),rD=surfRadius(tro,at(.48),ax,.04,.17);
  const tg=dressing(at(.3),ax,d=>rT(d)+.004,.02,3,tq,{dt:.0,dz:.0045,lift:.003});const dg=dressing(at(.48),ax,d=>rD(d)+.004,.07,3,gz,{dt:.03,dz:.012,lift:.0035});
  /* the thigh dressings are skinned like the trousers under them (each vertex takes the weights of the nearest cloth
     vertex), so they bend with the leg instead of riding the hip bone stiffly through the cloth */
  [tg,dg].forEach(g=>{root.add(g);skinToNearest(g,root,at(.4));});
  return{hb,tg,dg};}
function skinToNearest(grp,root,near){let src=null,best=1e9;root.children.forEach(o=>{if(!o.isSkinnedMesh||!o.geometry.attributes.skinIndex)return;const P=o.geometry.attributes.position;
    for(let i=0;i<P.count;i+=7){const d=(P.getX(i)-near.x)**2+(P.getY(i)-near.y)**2+(P.getZ(i)-near.z)**2;if(d<best){best=d;src=o;}}});
  if(!src)return;const SP=src.geometry.attributes.position,SI=src.geometry.attributes.skinIndex,SW=src.geometry.attributes.skinWeight;
  /* the candidate cloth vertices: those within 25 cm of the dressing */
  const cand=[];for(let i=0;i<SP.count;i++){const d=(SP.getX(i)-near.x)**2+(SP.getY(i)-near.y)**2+(SP.getZ(i)-near.z)**2;if(d<.0625)cand.push(i);}
  grp.children.slice().forEach(m=>{const g=m.geometry,P=g.attributes.position,n=P.count,si=new Uint16Array(n*4),sw=new Float32Array(n*4);
    for(let v=0;v<n;v++){let bi=-1,bd=1e9;const x=P.getX(v),y=P.getY(v),z=P.getZ(v);for(const i of cand){const d=(SP.getX(i)-x)**2+(SP.getY(i)-y)**2+(SP.getZ(i)-z)**2;if(d<bd){bd=d;bi=i;}}
      if(bi<0)continue;si[v*4]=SI.getX(bi);si[v*4+1]=SI.getY(bi);si[v*4+2]=SI.getZ(bi);si[v*4+3]=SI.getW(bi);sw[v*4]=SW.getX(bi);sw[v*4+1]=SW.getY(bi);sw[v*4+2]=SW.getZ(bi);sw[v*4+3]=SW.getW(bi);}
    g.setAttribute('skinIndex',new T.Uint16BufferAttribute(si,4));g.setAttribute('skinWeight',new T.Float32BufferAttribute(sw,4));
    const m0=m.material,mm=m0.clone();mm.skinning=true;mm.onBeforeCompile=m0.onBeforeCompile;if(m0.customProgramCacheKey)mm.customProgramCacheKey=m0.customProgramCacheKey;if(m0.userData)mm.userData=Object.assign({},m0.userData);const sm=new T.SkinnedMesh(g,mm);sm.castShadow=true;sm.receiveShadow=true;sm.frustumCulled=false;grp.remove(m);grp.add(sm);sm.bind(src.skeleton,src.bindMatrix);});}
const EYEMAT={},STRANDTEX=texLoad(CD.tex.strand),LASHTEX=texLoad(CD.tex.lash);
/* eyes: a soft, slightly wet sclera under a glossy clear coat (the cornea's tear film) - a single sharp highlight
   instead of a mirror-bright eyeball, which read as a stare */
function eyeMat(k){return EYEMAT[k]||(EYEMAT[k]=new T.MeshPhysicalMaterial({map:texLoad(CD.tex.eye[k]),roughness:.38,metalness:0,clearcoat:.7,clearcoatRoughness:.05,envMapIntensity:.35,vertexColors:true}));}
const CORNEA=std({color:0xffffff,roughness:.03,metalness:0,transparent:true,opacity:.05,depthWrite:false,envMapIntensity:1.1});
const NOFLIP_M=m=>{m.onBeforeCompile=s=>{s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>',NOFLIP);};return m;};
let _lashMat=null;const LASHMAT=()=>_lashMat||(_lashMat=(()=>{const m=strandMat([.05,.04,.04],true).clone();m.morphTargets=true;m.onBeforeCompile=strandMat([.05,.04,.04],true).onBeforeCompile;return m;})());
const STRANDMAT={};function strandMat(col,lash){const k=col.join(',')+(lash?'l':'');return STRANDMAT[k]||(STRANDMAT[k]=NOFLIP_M(std({map:lash?LASHTEX:STRANDTEX,color:new T.Color(...col).convertSRGBToLinear(),alphaTest:.3,alphaToCoverage:true,side:T.DoubleSide,roughness:.65,envMapIntensity:.4})));}
const TEETHMAT={upper:std({color:C(0xd8cfb8),roughness:.35}),lower:std({color:C(0xd8cfb8),roughness:.35}),tongue:std({color:C(0x8a4a48),roughness:.5})};
const TEETHDECAY=std({color:C(0x8a7a5a),roughness:.5});
function ribGeo(r,off){const p=deq(r.p);for(let i=0;i<p.length;i+=3){p[i]-=off.x;p[i+1]-=off.y;p[i+2]-=off.z;}
  const n8=b64u(r.n,Int8Array),n=new Float32Array(n8.length);for(let i=0;i<n.length;i++)n[i]=n8[i]/127;const u16=b64u(r.uv,Uint16Array),uv=new Float32Array(u16.length);for(let i=0;i<uv.length;i++)uv[i]=u16[i]/65535*4;
  const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(p,3));g.setAttribute('normal',new T.BufferAttribute(n,3));g.setAttribute('uv',new T.BufferAttribute(uv,2));g.setIndex(new T.BufferAttribute(b64u(r.t,Uint16Array),1));return g;}
const HEADGEO={};
function headParts(name,off){if(HEADGEO[name])return HEADGEO[name];const c=CD.chars[name];const sh=(arr)=>{for(let i=0;i<arr.length;i+=3){arr[i]-=off.x;arr[i+1]-=off.y;arr[i+2]-=off.z;}return arr;};
  const eg=new T.BufferGeometry();eg.setAttribute('position',new T.BufferAttribute(sh(deq(c.eyes)),3));const euv=new Float32Array(SHD.eyeUV.length);for(let i=0;i<euv.length;i++)euv[i]=SHD.eyeUV[i]/65535;eg.setAttribute('uv',new T.BufferAttribute(euv,2));
  const ao=b64u(c.eyeAO,Uint8Array),aoc=new Float32Array(ao.length*3);for(let i=0;i<ao.length;i++)aoc[i*3]=aoc[i*3+1]=aoc[i*3+2]=ao[i]/255;eg.setAttribute('color',new T.BufferAttribute(aoc,3));
  const eyeOp=eg.clone();eyeOp.setIndex(new T.BufferAttribute(SHD.eyeOp,1));eyeOp.computeVertexNormals();const eyeCl=eg.clone();eyeCl.setIndex(new T.BufferAttribute(SHD.eyeCl,1));eyeCl.computeVertexNormals();
  const teeth={};for(const k in c.teeth){const g=new T.BufferGeometry();g.setAttribute('position',new T.BufferAttribute(sh(deq(c.teeth[k])),3));g.setIndex(new T.BufferAttribute(SHD.teeth[k],1));g.computeVertexNormals();teeth[k]=g;}
  const lg=ribGeo(c.lashes,off);if(c.lashMorph){lg.morphAttributes.position=['blink','squint'].map(k=>{const d=b64u(c.lashMorph[k],Int16Array),a=new Float32Array(d.length);for(let i=0;i<d.length;i++)a[i]=d[i]/40000;return new T.BufferAttribute(a,3);});lg.morphTargetsRelative=true;}
  return HEADGEO[name]={eyeOp,eyeCl,teeth,brows:ribGeo(c.brows,off),lashes:lg,hair:c.hair?ribGeo(c.hair,off):null,must:c.must?ribGeo(c.must,off):null};}
/* split the paired eye geometry into left / right eyeballs centred on their own origin */
function eyePivots(hpG){if(hpG.piv)return hpG.piv;
  const split=(g,side)=>{const p=g.attributes.position.array,ix=g.index.array,keep=[];
    for(let i=0;i<ix.length;i+=3){const x=(p[ix[i]*3]+p[ix[i+1]*3]+p[ix[i+2]*3])/3;if((x<0)===(side<0))keep.push(ix[i],ix[i+1],ix[i+2]);}
    const h=g.clone();h.setIndex(keep);return h;};
  return hpG.piv=[-1,1].map(sd=>{const op=split(hpG.eyeOp,sd),cl=split(hpG.eyeCl,sd);
    const p=op.attributes.position.array,ix=op.index.array,mn=V3(1e9,1e9,1e9),mx=V3(-1e9,-1e9,-1e9),v=V3();
    for(let i=0;i<ix.length;i++){v.fromArray(p,ix[i]*3);mn.min(v);mx.max(v);}
    const c=mn.clone().add(mx).multiplyScalar(.5);c.z=mn.z+(mx.x-mn.x)*.5;   /* sphere centre: half a diameter behind the back of the ball */
    const opg=op.clone(),clg=cl.clone();opg.translate(-c.x,-c.y,-c.z);clg.translate(-c.x,-c.y,-c.z);return{op:opg,cl:clg,c};});}
const QX=new T.Quaternion(),AX=new T.Vector3(1,0,0);
function curlHand(h,a,b,c,t=0){if(!h||!h.fingers)return;h.fingers.forEach((f,i)=>{[a*(1+i*.05),b,c].forEach((ang,k)=>{f[k].quaternion.copy(f[k].userData.q0).multiply(QX.setFromAxisAngle(AX,ang));});});
  h.thumb.forEach((b_,k)=>{if(k)b_.quaternion.copy(b_.userData.q0).multiply(QX.setFromAxisAngle(AX,t*(k===1?1:.8)));});}
/* full hand pose: per finger [base, middle, tip curl, spread] and per thumb bone [x,y,z]; spread mirrors with the side */
const QY_=new T.Quaternion(),QZ_=new T.Quaternion(),AY_=new T.Vector3(0,1,0),AZ_=new T.Vector3(0,0,1);
function poseHand(h,Fs,Th,side=1){if(!h||!h.fingers)return;
  h.fingers.forEach((f,i)=>{const s=Fs[i];f.forEach((b_,k)=>{b_.quaternion.copy(b_.userData.q0);if(k===0&&s[3])b_.quaternion.multiply(QZ_.setFromAxisAngle(AZ_,s[3]*side));b_.quaternion.multiply(QX.setFromAxisAngle(AX,s[k]));});});
  h.thumb.forEach((b_,k)=>{const e=Th[k]||[0,0,0];b_.quaternion.copy(b_.userData.q0).multiply(QX.setFromAxisAngle(AX,e[0]||0)).multiply(QY_.setFromAxisAngle(AY_,(e[1]||0)*side)).multiply(QZ_.setFromAxisAngle(AZ_,(e[2]||0)*side));});}
/* first-person hand shapes: each finger curls by a different amount - the trigger finger rests out on the trigger,
   the lower fingers wrap tighter around the grip, the thumb closes over the far side */
const HANDS={
  trig:{f:[[-.42,-.95,-.55,.12],[-1.48,-1.55,-1.05,.02],[-1.55,-1.55,-1.02,-.05],[-1.62,-1.45,-.92,-.13]],th:[[.15,.25,0],[-.55],[-.7]]},
  guard:{f:[[-.92,-1.0,-.62,.14],[-1.08,-1.18,-.78,.03],[-1.18,-1.25,-.82,-.06],[-1.26,-1.2,-.78,-.17]],th:[[.1,.15,0],[-.3],[-.35]]},
  cup:{f:[[-1.0,-1.15,-.8,.1],[-1.15,-1.3,-.9,.02],[-1.22,-1.35,-.9,-.06],[-1.3,-1.3,-.85,-.15]],th:[[.05,.1,0],[-.2],[-.25]]}};
const CHAR_FOR={ratnik:'guard1',telogreika:'oldman',plaid:'plaid'};
const HELMMATS=()=>[cmat('helmet',false),cmat('webbing',false),cmat('black',false),cmat('harn',false),cmat('lens',false)];
/* a loose helmet (dropped on the floor): same geometry, positioned around its own centre */
function looseHelmet(name){const g=gearGeo(name,'helmet','helmet',null).clone();g.computeBoundingBox();const c=new T.Vector3();g.boundingBox.getCenter(c);g.translate(-c.x,-c.y,-c.z);const m=new T.Mesh(g,HELMMATS());m.castShadow=true;return m;}
/* a skinned body part is culled with a sphere that holds any pose (reach, sitting, lying - the root carries the lying rotation) */
const HUMAN_BS=new T.Sphere(new T.Vector3(0,.9,0),1.55);
const KIT={player:'B',guard1:'A',guard2:'A',guard3:'C',guard4:'B',guard5:'B',patrol:'B',driver:'A'},KITC={guard1:'ol',guard4:'ol'};
/* extra kit high on the chest MOLLE, different per soldier: a pair of grenade pouches on the left, one on the right, or
   an Esmarch tourniquet strapped across the right */
/* ballistic goggles worn up on the helmet */
const KITG={guard3:1,guard5:1,patrol:1};
/* PMK-type gas mask: the moulded face piece (built offline round this soldier's face), and the parts on it built here at
   its anchors - the speech diaphragm with its perforated cover, the exhale valve housing, the filter canister on the
   left cheek in its cloth cover with a drawstring */
let _PERF=null;function perfTex(){return _PERF||(_PERF=tex(256,256,(g,w,h)=>{g.fillStyle='#5a5f4c';g.fillRect(0,0,w,h);
  const gr=g.createRadialGradient(w/2,h/2,10,w/2,h/2,w/2);gr.addColorStop(0,'rgba(255,255,255,.06)');gr.addColorStop(1,'rgba(0,0,0,.3)');g.fillStyle=gr;g.fillRect(0,0,w,h);
  g.fillStyle='#0b0c0a';for(let r=0;r<9;r++){const rad=r*13,n=r?Math.round(rad*6.283/11):1;for(let i=0;i<n;i++){const a=i/n*6.283+r*.17;g.beginPath();g.arc(w/2+Math.cos(a)*rad,h/2+Math.sin(a)*rad,3.1,0,7);g.fill();}}},{clamp:true}));}
/* GP-5 parts: each eyepiece is a pressed-steel ring clamping a round glass into a raised rubber seat; under the chin the
   alloy valve box with the inhalation valve's threaded neck in front and the exhalation valve's slotted cover below,
   and the GP-5 filter canister screwed onto it - a ribbed, olive-painted steel can hanging down in front of the chest */
let _GPM=null;
function gp5Hardware(d,hp,H){const M_=_GPM||(_GPM={ring:std({color:C(0x4a4d48),roughness:.38,metalness:.75,envMapIntensity:1.1}),
    glass:std({color:C(0x161a1a),roughness:.15,metalness:.1,envMapIntensity:.8}),seat:cmat('gp5',false),
    box:std({color:C(0x2c2e2b),roughness:.45,metalness:.55}),can:std({map:TX.steel,color:C(0x6f7458),roughness:.55,metalness:.45}),dark:std({color:C(0x0d0d0c),roughness:1})});
  const A=d.anc,Z=V3(0,0,1),root=new T.Group();H.add(root);
  const at=(k,push)=>{const g=new T.Group();const p=V3(...A[k][0]).sub(hp),nn=V3(...A[k][1]).normalize();g.position.copy(p).addScaledVector(nn,push||0);g.quaternion.setFromUnitVectors(Z,nn);root.add(g);return g;};
  const cyl=(r1,r2,l,seg,mat,z,par)=>{const x=new T.Mesh(new T.CylinderGeometry(r1,r2,l,seg),mat);x.rotation.x=Math.PI/2;x.position.z=z;x.castShadow=true;par.add(x);return x;};
  ['eyeL','eyeR'].forEach(k=>{const g=at(k,-.004);cyl(.033,.035,.008,32,M_.seat,.002,g);cyl(.029,.029,.006,32,M_.ring,.008,g);
    const t=new T.Mesh(new T.TorusGeometry(.0275,.0026,8,32),M_.ring);t.position.z=.0112;g.add(t);
    const gl=new T.Mesh(new T.CircleGeometry(.0255,32),M_.glass);gl.position.z=.0105;g.add(gl);
    for(let i=0;i<3;i++){const a=i/3*Math.PI*2+.4,sc=new T.Mesh(new T.CylinderGeometry(.0018,.0018,.003,6),M_.ring);sc.rotation.x=Math.PI/2;sc.position.set(Math.cos(a)*.031,Math.sin(a)*.031,.011);g.add(sc);}});
  {const g=at('valve',-.006);cyl(.024,.026,.022,24,M_.box,.008,g);
    /* exhalation valve cover, slotted, under the box */
    {const ex=new T.Group();ex.position.set(0,-.026,.008);g.add(ex);const c=new T.Mesh(new T.CylinderGeometry(.015,.016,.012,18),M_.box);ex.add(c);
     for(let i=0;i<6;i++){const sl=new T.Mesh(new T.BoxGeometry(.003,.004,.012),M_.dark);sl.position.y=-.006;sl.rotation.y=i/6*Math.PI;ex.add(sl);}}
    cyl(.017,.017,.012,20,M_.ring,.024,g);
    /* the canister: its axis hangs down-forward from the box */
    const cn=new T.Group();cn.position.z=.03;cn.rotation.x=.55;g.add(cn);
    const pr=[[0,0],[.018,0],[.02,.004],[.05,.012],[.054,.018],[.054,.075],[.051,.08],[.03,.085],[.012,.086],[0,.086]].map(q=>new T.Vector2(q[0],q[1]));
    const can=new T.Mesh(new T.LatheGeometry(pr,32),M_.can);can.rotation.x=Math.PI/2;can.castShadow=true;cn.add(can);
    for(let i=0;i<4;i++){const rb=new T.Mesh(new T.TorusGeometry(.0545,.0022,6,32),M_.can);rb.position.z=.028+i*.012;cn.add(rb);}
    const hole=new T.Mesh(new T.CircleGeometry(.008,14),M_.dark);hole.position.z=.0862;cn.add(hole);}
  return root;}
/* the mask's head harness, laid over this soldier's own head: five rubberised straps - one over the crown, two over the
   temples, two under the ears from the cheeks - from the edge of the face piece round the skull to a pad on the back of
   the head. Each is a ribbon following the skin a few millimetres off it (the scalp is sampled in direction bins round
   the head centre), so it goes all the way round whatever the head's shape */
const HARNESS={};
function maskHarness(c,hp){if(HARNESS[c.name||c.fit.eye.join()])return HARNESS[c.name||c.fit.eye.join()];
  const P=deq(c.pos),eye=V3(...c.fit.eye),hc=V3(0,eye.y+.016,c.fit.skullZ-.012);
  const NT=48,NP=24,B=new Float32Array(NT*NP),v=V3();
  const bin=d=>{const th=(Math.atan2(d.x,d.z)/(Math.PI*2)+1)%1,ph=clamp(Math.asin(clamp(d.y,-1,1))/Math.PI+.5,0,.9999);return Math.floor(ph*NP)*NT+Math.floor(th*NT)%NT;};
  for(let i=0;i<P.length;i+=3){v.set(P[i]-hc.x,P[i+1]-hc.y,P[i+2]-hc.z);const r=v.length();if(r>.16||r<.04||P[i+1]<eye.y-.11)continue;const k=bin(v.divideScalar(r));if(r>B[k])B[k]=r;}
  for(let it=0;it<6;it++)for(let k=0;k<B.length;k++)if(!B[k]){const t=k%NT,pr=Math.floor(k/NT);let s_=0,n=0;for(const [dt,dp] of [[1,0],[-1,0],[0,1],[0,-1]]){const pp=pr+dp;if(pp<0||pp>=NP)continue;const q=B[pp*NT+(t+dt+NT)%NT];if(q){s_+=q;n++;}}if(n)B[k]=s_/n;}
  const R_=d=>B[bin(d)]||.095;
  const mat=std({color:C(0x2c3026),roughness:.82,envMapIntensity:.3,side:T.DoubleSide});
  const strap=(a,b,via,w)=>{const pts=[];const N=44;const A=V3(...a).normalize(),Bd=V3(...b).normalize(),Vd=via?V3(...via).normalize():null;
    for(let i=0;i<=N;i++){const t=i/N;let d;if(Vd){d=t<.5?A.clone().lerp(Vd,t*2):Vd.clone().lerp(Bd,(t-.5)*2);}else d=A.clone().lerp(Bd,t);d.normalize();pts.push({d,p:hc.clone().addScaledVector(d,R_(d)+.0045)});}
    /* smooth the sampled radius along the strap so it does not follow single bumps */
    for(let it=0;it<3;it++)for(let i=1;i<N;i++){const r0=pts[i-1].p.distanceTo(hc),r1=pts[i].p.distanceTo(hc),r2=pts[i+1].p.distanceTo(hc);const rr_=Math.max(r1,(r0+r1*2+r2)/4);pts[i].p.copy(hc).addScaledVector(pts[i].d,rr_);}
    const pos=[],idx=[];for(let i=0;i<=N;i++){const p=pts[i].p,tg=pts[Math.min(N,i+1)].p.clone().sub(pts[Math.max(0,i-1)].p).normalize(),side=tg.clone().cross(pts[i].d).normalize().multiplyScalar(w/2);
      const q=p.clone().sub(hp);pos.push(q.x+side.x,q.y+side.y,q.z+side.z,q.x-side.x,q.y-side.y,q.z-side.z);if(i<N){const a2=i*2;idx.push(a2,a2+1,a2+2,a2+1,a2+3,a2+2);}}
    const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(pos,3));g.setIndex(idx);g.computeVertexNormals();return g;};
  const pad=V3(0,-.06,-1).normalize();const gs=[];
  gs.push(strap([0,.5,.86],[0,.1,-1],[0,1,-.05],.018));
  [-1,1].forEach(sd=>{gs.push(strap([sd*.9,.2,.38],[sd*.12,.0,-1],null,.016));gs.push(strap([sd*.82,-.42,.38],[sd*.13,-.16,-1],[sd*.9,-.38,-.25],.016));});
  /* the pad: a rounded plate where they meet, buckles on it */
  {const pc=hc.clone().addScaledVector(pad,R_(pad)+.006).sub(hp);const g=new T.CylinderGeometry(.034,.036,.004,20);g.rotateX(Math.PI/2);
   const q=new T.Quaternion().setFromUnitVectors(V3(0,0,1),pad.clone().negate());g.applyMatrix4(new T.Matrix4().makeRotationFromQuaternion(q));g.scale(1,1.15,1);g.translate(pc.x,pc.y,pc.z);gs.push(g);}
  return HARNESS[c.name||c.fit.eye.join()]={g:mergeAttrs(gs.map(g=>g.index?g.toNonIndexed():g)),mat};}
function gasMask(c,hp,H){const d=c.mask,root=new T.Group();H.add(root);
  /* (the offline strap pieces are replaced by the harness built round the head here) */
  const mats=[cmat('maskRub',false),cmat('visor',false),cmat('maskPl',false),new T.MeshBasicMaterial({visible:false})];
  {const hz=maskHarness(c,hp);const hm=new T.Mesh(hz.g,hz.mat);hm.castShadow=true;hm.receiveShadow=true;root.add(hm);}
  const m=new T.Mesh(packedGeo(d,hp),mats);m.castShadow=true;m.receiveShadow=true;root.add(m);
  const A=d.anc,Z=V3(0,0,1);
  const at=(k,push)=>{const g=new T.Group();const p=V3(...A[k][0]).sub(hp),n=V3(...A[k][1]).normalize();g.position.copy(p).addScaledVector(n,push||0);g.quaternion.setFromUnitVectors(Z,n);root.add(g);return g;};
  const cyl=(r1,r2,l,seg,mat,z,par)=>{const x=new T.Mesh(new T.CylinderGeometry(r1,r2,l,seg),mat);x.rotation.x=Math.PI/2;x.position.z=z;x.castShadow=true;par.add(x);return x;};
  const PL=cmat('maskPl2',false),RB=cmat('maskRub2',false);
  /* speech emitter in the middle of the snout: a raised rim round a domed cover pierced with rings of small holes */
  {const g=at('dia',-.003);cyl(.031,.033,.012,40,RB,.006,g);
    const lip=new T.Mesh(new T.TorusGeometry(.0295,.0028,10,40),RB);lip.position.z=.0122;g.add(lip);
    const dg=new T.SphereGeometry(.12,40,8,0,Math.PI*2,0,.255);dg.rotateX(Math.PI/2);dg.translate(0,0,-.1077);
    const cv=new T.Mesh(dg,std({map:perfTex(),roughness:.55,metalness:.15}));const uv=dg.attributes.uv,pp=dg.attributes.position;
    for(let i=0;i<uv.count;i++)uv.setXY(i,pp.getX(i)/.062+.5,pp.getY(i)/.062+.5);cv.position.z=.0035;g.add(cv);}
  /* exhale valve: a short round cap under the emitter, pointing down at the chest */
  {const g=at('valve',-.004);cyl(.021,.02,.02,28,RB,.01,g);cyl(.0215,.0215,.004,28,PL,.021,g);
    for(let i=0;i<6;i++){const s_=new T.Mesh(new T.BoxGeometry(.004,.0035,.012),M.bore);const a=i/6*Math.PI*2;s_.position.set(Math.cos(a)*.0195,Math.sin(a)*.0195,.012);s_.rotation.z=a;g.add(s_);}}
  /* filter canister on the left cheek in its olive cloth cover, gathered at the back with a drawstring */
  {const g=at('filt',-.002);cyl(.022,.024,.012,24,PL,.006,g);const fm=cmat('filtMt',false),fc=cmat('filtCl',false);
    cyl(.05,.05,.045,40,fm,.034,g);
    const pr=[];for(let i=0;i<=18;i++){const t=i/18,y=-.004+t*.056,r=.0525+.0035*Math.sin(Math.min(1,t*1.1)*Math.PI)+(t>.88?(.88-t)*.25:0);pr.push(new T.Vector2(Math.max(r,.012),y));}
    pr.push(new T.Vector2(.034,.0525),new T.Vector2(.0,.0535));
    const cl=new T.Mesh(new T.LatheGeometry(pr,40),fc);cl.rotation.x=Math.PI/2;cl.position.z=.012;cl.castShadow=true;g.add(cl);
    const ds=new T.Mesh(new T.TorusGeometry(.0525,.0017,6,40),cmat('maskStrap2',false));ds.position.z=.014;g.add(ds);
    const kn=new T.Mesh(new T.SphereGeometry(.0035,8,6),cmat('maskStrap2',false));kn.position.set(.052,-.01,.016);g.add(kn);}
  return root;}
const KITX={player:['gren2'],guard1:['tq'],guard2:['gren1'],guard3:['gren2','tq'],guard4:['gren2'],guard5:['tq'],patrol:['gren1','gren2'],driver:['tq']};
/* the groin protector swings forward with whichever thigh is lifted further, so it rides over the legs */
const GROINS=[];
/* spring bones: hanging gear (groin protector, magazine pouches, the vest's lower edge) is a damped pendulum about its
   top edge - it lags behind the body when it moves off, swings past when it stops, bounces with each footfall and, for
   the groin plate, is pushed forward by whichever thigh comes up. Simulated in the parent bone's frame. */
const SPRINGS=[];const _sp=new T.Vector3(),_sq=new T.Quaternion();
function addSpring(piv,o){const s=Object.assign({piv,a:0,v:0,k:90,d:9,g:.06,lim:.6,prev:null,pv:new T.Vector3(),drive:null},o);SPRINGS.push(s);return s;}
function springTick(dt,cam){dt=Math.min(dt,.05);if(dt<=0)return;
  for(const s of SPRINGS){const p=s.piv;if(!p.parent)continue;p.getWorldPosition(_sp);if(_sp.distanceToSquared(cam)>40*40){s.prev=null;continue;}
    p.parent.getWorldQuaternion(_sq);
    if(s.prev){/* acceleration of the hinge, in the parent's frame: forward (+z) and vertical (+y) */
      const vel=_sp.clone().sub(s.prev).divideScalar(dt);const acc=vel.clone().sub(s.pv).divideScalar(dt);s.pv.copy(vel);
      acc.applyQuaternion(_sq.clone().invert());const tgt=s.drive?s.drive():0;
      const f=s.k*(tgt-s.a)-s.d*s.v+(acc.z*1.0-Math.abs(acc.y)*.25*Math.sign(s.a||1))*s.g*-1;
      s.v+=f*dt;s.a=clamp(s.a+s.v*dt,-s.lim,s.lim*.6);p.rotation.x=s.a;}
    else s.pv.set(0,0,0);
    s.prev=(s.prev||new T.Vector3()).copy(_sp);}}
function groinTick(){}
let P_bala=null;
const HUMANS=[];const _hv=new T.Vector3();let _hk=0;
function humanLOD(cam){if(++_hk%12)return;for(const h of HUMANS){if(!h.root.parent)continue;h.root.getWorldPosition(_hv);const on=_hv.distanceToSquared(cam)<22*22;if(on!==h.on){h.on=on;h.det.forEach(d=>d.visible=on);}}}
function buildHuman(o={}){
  const name=o.char||CHAR_FOR[o.outfit||'ratnik'];const outfit=CD.chars[name].outfit||o.outfit||'ratnik';const cg=charGeo(name);const c=cg.c;
  const root=new T.Group();root.userData.char=name;const BN={};const UM=[];
  c.bones.forEach(b=>{const bo=new T.Bone();bo.name=b.n;bo.position.fromArray(b.pos);bo.quaternion.fromArray(b.q);bo.userData.q0=bo.quaternion.clone();BN[b.n]=bo;if(b.p)BN[b.p].add(bo);});
  root.add(BN.hips);root.updateMatrixWorld(true);
  const skel=new T.Skeleton(CD.bonesOrder.map(n=>BN[n]));
  const add=(g,m)=>{const sm=new T.SkinnedMesh(g,m);sm.castShadow=true;sm.receiveShadow=true;g.boundingSphere=HUMAN_BS;sm.frustumCulled=true;root.add(sm);sm.bind(skel);return sm;};
  /* garment pieces that share a material are one mesh (same skeleton, same look, a fraction of the draw calls) */
  {const by={};CD.outfits[outfit].pieces.forEach(pc=>{if(o.drop&&o.drop.includes(pc.mat))return;const mt=(o.matMap&&o.matMap[pc.mat])||pc.mat;(by[mt]||(by[mt]=[])).push(pc);});
   for(const mat in by){let mm;if(mat==='glove')mm=gloveMat(name,BN);else if(o.uniqMat){mm=cmat(mat,true,'|u'+name);UM.push(mm);}else mm=cmat(mat);add(mergedWear(name,mat,by[mat]),mm);}}
  const bk=c.gear.boot,bmat=bk==='valenki'?[cmat('felt'),cmat('rubber'),cmat('lace')]:[cmat(name==='plaid'?'oldleather':'leather'),cmat('rubber'),cmat('lace')];
  ['L','R'].forEach(sd=>add(gearGeo(name,bk,'boot'+sd,null,[CD.bonesOrder.indexOf('an'+sd),CD.bonesOrder.indexOf('kn'+sd)]),bmat));
  const skm=o.uniqMat?skinMat(c.skin,(o.tint||c.tint||[1,1,1]).map(x=>x*.9993),name):skinMat(c.skin,o.tint||c.tint||[1,1,1],name);if(o.uniqMat)UM.push(skm);const hood=!!(c.hood&&o.hood);const skinM=add(skinGeo(cg,outfit,hood),skm);
  /* head parts ride rigidly on the head bone (all spine frames are axis-aligned in the bind pose) */
  const hp=new T.Vector3();BN.head.getWorldPosition(hp);const hpG=headParts(name,hp);const H=BN.head;
  const mk=(g,m,sh=true)=>{const x=new T.Mesh(g,m);x.castShadow=sh;x.receiveShadow=true;H.add(x);return x;};
  /* each eyeball gets its own pivot at its centre so the eyes can lead head turns and make small saccades */
  const eyes=eyePivots(hpG).map(e=>{const pv=new T.Group();pv.position.copy(e.c);H.add(pv);
    const a=new T.Mesh(e.op,eyeMat(c.iris));a.receiveShadow=true;pv.add(a);const b=new T.Mesh(e.cl,CORNEA);b.castShadow=false;pv.add(b);return pv;});
  for(const k in hpG.teeth)mk(hpG.teeth[k],c.skin==='decay'&&k!=='tongue'?TEETHDECAY:TEETHMAT[k],false);
  if(!hood)mk(hpG.brows,strandMat(c.hc.map(x=>x*1.35)),false);const lashM=mk(hpG.lashes,LASHMAT(),false);
  const bala=c.bala&&o.bala!==false;
  if(hpG.hair&&!bala&&!hood)mk(hpG.hair,strandMat(c.hc));
  if(hpG.must&&!bala&&!c.mask&&!hood)mk(hpG.must,strandMat(c.hc.map(x=>x*1.15)),false);
  /* balaclava (built offline round this character's own head): skinned head -> neck so it follows head turns */
  if(bala){const d=c.bala;const g=new T.BufferGeometry();const P=deq(d.v);g.setAttribute('position',new T.BufferAttribute(P,3));
    g.setIndex(new T.BufferAttribute(d.w32?b64u(d.t,Uint32Array):b64u(d.t,Uint16Array),1));const ao=b64u(d.ao,Uint8Array),wk=b64u(d.wkn,Uint8Array),n=ao.length;
    const col=new Float32Array(n*3),SI=new Uint16Array(n*4),SW=new Float32Array(n*4),hi=CD.bonesOrder.indexOf('head'),ni=CD.bonesOrder.indexOf('neck');
    /* the knit under the chin and over the jaw moves with the head; only the part round the neck itself follows the neck */
    const nz=BN.neck.getWorldPosition(new T.Vector3()).z,hy=BN.head.getWorldPosition(new T.Vector3()).y;
    /* everything from the jaw line up is the head's (it turns as one piece with the face, so the knit cannot shear across
       the jaw); below that the weight hands over to the neck smoothly so a head turn twists the collar evenly round */
    for(let i=0;i<n;i++){const a=Math.pow(ao[i]/255,1.3);col[i*3]=col[i*3+1]=col[i*3+2]=a;const fz=clamp((P[i*3+2]-(nz+.025))/.05,0,1),fy=clamp((P[i*3+1]-(hy-.11))/.05,0,1);
      const w=wk[i]/255*(1-fz)*(1-fy*fy*(3-2*fy));SI[i*4]=hi;SI[i*4+1]=ni;SW[i*4]=1-w;SW[i*4+1]=w;}
    g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('skinIndex',new T.BufferAttribute(SI,4));g.setAttribute('skinWeight',new T.BufferAttribute(SW,4));g.computeVertexNormals();
    P_bala=add(g,cmat('bala'));}
  /* GP-5 helmet-mask: the whole moulded rubber hood (built offline round this head), skinned like the balaclava, with its
     eyepieces, valve box and filter canister on the head bone */
  if(hood){const d=c.hood;const g=new T.BufferGeometry();const P=deq(d.v);g.setAttribute('position',new T.BufferAttribute(P,3));
    g.setIndex(new T.BufferAttribute(d.w32?b64u(d.t,Uint32Array):b64u(d.t,Uint16Array),1));const ao=b64u(d.ao,Uint8Array),wk=b64u(d.wkn,Uint8Array),n=ao.length;
    const col=new Float32Array(n*3),SI=new Uint16Array(n*4),SW=new Float32Array(n*4),hi=CD.bonesOrder.indexOf('head'),ni=CD.bonesOrder.indexOf('neck');
    const hy=BN.head.getWorldPosition(new T.Vector3()).y;
    for(let i=0;i<n;i++){const a=Math.pow(ao[i]/255,1.2);col[i*3]=col[i*3+1]=col[i*3+2]=a;const fy=clamp((P[i*3+1]-(hy-.11))/.05,0,1);
      const w=wk[i]/255*(1-fy*fy*(3-2*fy));SI[i*4]=hi;SI[i*4+1]=ni;SW[i*4]=1-w;SW[i*4+1]=w;}
    g.setAttribute('color',new T.BufferAttribute(col,3));g.setAttribute('skinIndex',new T.BufferAttribute(SI,4));g.setAttribute('skinWeight',new T.BufferAttribute(SW,4));g.computeVertexNormals();
    add(g,cmat('gp5'));gp5Hardware(d,hp,H);}
  const hand=s=>({fingers:['idx','mid','rng','pnk'].map(f=>[1,2,3].map(k=>BN[f+s+k])),thumb:[1,2,3].map(k=>BN['th'+s+k])});
  const P={hips:BN.hips,spine:BN.spine,neck:BN.neck,head:BN.head,face:H,bones:BN,eyes,skinM,lashM,uniqMats:UM,
    armL:{sh:BN.shL,el:BN.elL,wr:BN.wrL,hand:hand('L')},armR:{sh:BN.shR,el:BN.elR,wr:BN.wrR,hand:hand('R')},
    legL:{hp:BN.hpL,kn:BN.knL,an:BN.anL},legR:{hp:BN.hpR,kn:BN.knR,an:BN.anR}};
  curlHand(P.armL.hand,-.35,-.45,-.3,-.15);curlHand(P.armR.hand,-.35,-.45,-.3,-.15);
  const fit=c.fit;const sp=new T.Vector3();BN.spine.getWorldPosition(sp);
  if(o.vest){const sp0=new T.Vector3();BN.spine.getWorldPosition(sp0);
    /* 6B45 kit per soldier: A clean front with the shoulder protectors rolled and stowed, B the same with pouches,
       C shoulder protectors over the upper arms and the groin protector; EMR or olive cover */
    const kit=o.kit||KIT[name]||'A',VM=(o.vcol||KITC[name])==='ol'?[cmat('vestOl',false),cmat('webOl',false),cmat('black',false),cmat('tqRub',false)]:[cmat('vest',false),cmat('webbing',false),cmat('black',false),cmat('tqRub',false)];
    const gm=(kind,part,off,par)=>{const m=new T.Mesh(gearGeo(name,kind,part,off),VM);m.castShadow=m.receiveShadow=true;if(par)par.add(m);return m;};
    const vm=gm('vest','vest',sp0,BN.spine);P.vest=vm;P.kit=kit;
    /* every soldier carries the three magazine pouches as a baseline */
    {const g=gearGeo(name,'pouches','pouches',sp0);g.computeBoundingBox();const bb=g.boundingBox;
      const piv=new T.Group();piv.position.set((bb.min.x+bb.max.x)/2,bb.max.y-.012,bb.min.z+.004);BN.spine.add(piv);
      const pm=gm('pouches','pouches',sp0,piv);pm.position.copy(piv.position).negate();P.pouches=piv;addSpring(piv,{k:140,d:11,g:.035,lim:.25});}
    if(CD.gear.gren2)(o.kitx||KITX[name]||[]).forEach(k=>gm(k,k,sp0,BN.spine));
    if(kit==='C'){const h0=BN.hips.getWorldPosition(new T.Vector3()),pv=new T.Vector3().fromArray(c.gear.groinPivot);
      const piv=new T.Group();piv.position.copy(pv).sub(h0);BN.hips.add(piv);gm('groin','groin',pv,piv);addSpring(piv,{k:70,d:7.5,g:.07,lim:.9,drive:()=>Math.min(0,BN.hpL.rotation.x,BN.hpR.rotation.x)*.92});P.groin=piv;
      /* the shoulder protectors ride on the upper-arm bones (attached in the bind pose, so they keep their fit) */
      ['L','R'].forEach(s=>{const m=gm('sprot','sprot'+s,null,root);root.updateMatrixWorld(true);BN['sh'+s].attach(m);});}
    }
  if(o.holster)mesh(G('holst',()=>rbox(.05,.14,.1,.02)),std({color:C(0x4a3020),roughness:.6}),.19,-.06,.03,BN.hips);
  if(o.helmet){const rebuilt=!!(c.harn&&CD.gear.helmet.hz);const hm=new T.Mesh(gearGeo(name,'helmet','helmet',hp,null,rebuilt),HELMMATS());hm.castShadow=hm.receiveShadow=true;H.add(hm);P.helmet=hm;
    /* the chin harness rebuilt over this soldier's balaclava / gas mask (part of the helmet: it comes off with it) */
    if(rebuilt){const hz=new T.Mesh(packedGeo(c.harn,hp),HELMMATS());hz.castShadow=true;hz.receiveShadow=true;hm.add(hz);}
    if(CD.gear.goggles&&(o.goggles||(o.goggles!==false&&KITG[name]))){const gg=new T.Mesh(gearGeo(name,'goggles','helmet',hp),HELMMATS());gg.castShadow=true;gg.receiveShadow=true;hm.add(gg);P.goggles=gg;}}
  if(c.mask&&o.mask!==false)P.mask=gasMask(c,hp,H);
  root.traverse(m=>{if(m.isMesh&&!m.isSkinnedMesh&&m.castShadow===undefined)m.castShadow=true;});
  if(c.skin==='decay'){skinM.morphTargetInfluences[0]=.62;if(lashM.morphTargetInfluences)lashM.morphTargetInfluences[0]=.62;}   /* dead eyes half closed */
  /* fine face parts (teeth, eyes, lashes, brows) are switched off when they would be a pixel or less */
  {const det=[];H.children.forEach(ch=>{if(ch===P.helmet||(ch.geometry&&(ch.geometry===hpG.hair||ch.geometry===hpG.must)))return;if(ch.isMesh||ch.isGroup)det.push(ch);});HUMANS.push({root,det,on:true});}
  return{root,P,skel,name};}
/* drop a posed rig so its lowest skinned vertex rests at world height y (corpses on beds / floors) */
function restOn(rig,y,holder){const top=holder||rig.root;let o=top;while(o.parent)o=o.parent;o.updateMatrixWorld(true);let mn=1e9;const v=new T.Vector3();
  const trunk=new Set(['hips','spine','neck','head','hpL','hpR'].map(n=>CD.bonesOrder.indexOf(n)));
  rig.root.traverse(m=>{if(!m.isSkinnedMesh)return;const p=m.geometry.attributes.position,si=m.geometry.attributes.skinIndex;for(let i=0;i<p.count;i+=3){if(!trunk.has(si.getX(i)))continue;m.boneTransform(i,v);v.applyMatrix4(m.matrixWorld);if(v.y<mn)mn=v.y;}});
  top.position.y+=y-mn;top.updateMatrixWorld(true);return mn;}
/* corpses: let the limbs fall under their own weight until they lie on the ground - gradient descent on the height of
   points along each leg and arm (knee, shin, ankle, heel, toe / elbow, forearm, wrist, fingers) with a stiff penalty for
   sinking into the floor, anatomical joint limits and a weak pull toward the authored pose */
function settleBody(rig,floorFn,o={}){const P=rig.P;let top=rig.root;while(top.parent)top=top.parent;top.updateMatrixWorld(true);
  /* toe/heel offsets in the ankle frame, measured in the bind pose (characters face +z) */
  const all=[];rig.root.traverse(b=>{if(b.isBone&&b.userData.q0)all.push([b,b.quaternion.clone()]);});
  all.forEach(([b])=>b.quaternion.copy(b.userData.q0));rig.root.updateMatrixWorld(true);
  const rq=rig.root.getWorldQuaternion(new T.Quaternion());const foot={};
  ['L','R'].forEach(sd=>{const an=P['leg'+sd].an,ap=an.getWorldPosition(new T.Vector3());const f=V3(0,0,1).applyQuaternion(rq),d=V3(0,-1,0).applyQuaternion(rq);
    foot[sd]={toe:an.worldToLocal(ap.clone().addScaledVector(f,.15).addScaledVector(d,.06)),heel:an.worldToLocal(ap.clone().addScaledVector(f,-.04).addScaledVector(d,.07))};});
  all.forEach(([b,q])=>b.quaternion.copy(q));rig.root.updateMatrixWorld(true);
  const half=(b,c)=>c.position.clone().multiplyScalar(.5);
  const chains=[];
  ['L','R'].forEach(sd=>{const L=P['leg'+sd];chains.push({root:L.hp,pts:[[L.hp,half(L.hp,L.kn),.085],[L.kn,V3(),.065],[L.kn,half(L.kn,L.an),.055],[L.an,V3(),.05],[L.an,foot[sd].heel,.03],[L.an,foot[sd].toe,.03]],
    dof:[[L.hp,'x',.7],[L.hp,'z',.5],[L.hp,'y',.5],[L.kn,'x',[-.02,2.5]],[L.an,'x',.6],[L.an,'z',.35]]});});
  ['L','R'].forEach(sd=>{const A=P['arm'+sd];const mid=A.hand&&A.hand.fingers?A.hand.fingers[1]:null;
    const pts=[[A.el,V3(),.05],[A.el,half(A.el,A.wr),.045],[A.wr,V3(),.04]];if(mid){pts.push([mid[0],V3(),.028],[mid[2],V3(),.014]);}
    chains.push({root:A.sh,pts,dof:[[A.sh,'x',.9],[A.sh,'y',.6],[A.sh,'z',.9],[A.el,'x',[-2.5,.02]],[A.wr,'x',.7],[A.wr,'z',.5]]});});
  const v=new T.Vector3();
  for(const ch of chains){const base=ch.dof.map(([b,ax])=>b.rotation[ax]);
    const lim=ch.dof.map(([b,ax,l],i)=>Array.isArray(l)?l:[base[i]-l,base[i]+l]);
    const E=()=>{ch.root.updateMatrixWorld(true);let e=0;for(const [b,off,r] of ch.pts){v.copy(off);b.localToWorld(v);const h=v.y-r-floorFn(v.x,v.z);e+=h>0?h:400*h*h-h*.2;}
      ch.dof.forEach(([b,ax],i)=>{const d=b.rotation[ax]-base[i];e+=.015*d*d;});return e;};
    for(let it=0;it<90;it++){const lr=.07*(1-it/110);
      ch.dof.forEach(([b,ax],i)=>{const t0=b.rotation[ax],eps=.01;b.rotation[ax]=t0+eps;const e1=E();b.rotation[ax]=t0-eps;const e2=E();
        b.rotation[ax]=clamp(t0-lr*clamp((e1-e2)/(2*eps),-3,3),lim[i][0],lim[i][1]);});}
    ch.root.updateMatrixWorld(true);}
  return chains.length;}
function pose(r,p){const P=r.P;const set=(g,v)=>{if(v)g.rotation.set(v[0]||0,v[1]||0,v[2]||0);};
  set(P.spine,p.spine);set(P.neck,p.neck);set(P.head,p.head);set(P.hips,p.hips);
  ['armL','armR'].forEach(k=>{if(p[k]){set(P[k].sh,p[k][0]);set(P[k].el,p[k][1]);set(P[k].wr,p[k][2]);}});
  ['legL','legR'].forEach(k=>{if(p[k]){set(P[k].hp,p[k][0]);set(P[k].kn,p[k][1]);set(P[k].an,p[k][2]);}});}
/* corpse poses: settled once under gravity against the floor / the roadside offline, then stored, so every body lies the
   same way on every playthrough */
const BAKED={"sitDead_plaid":{"hips":[0,0,0],"spine":[0.38,0.22,0.26],"neck":[0.42,0.1,0.3],"head":[0.45,0.35,0.5],"armL":[[-0.2878,0.1709,-0.2181],[-0.5632,0,0],[-0.1328,0,0.6398]],"armR":[[-0.384,-0.3007,-0.2861],[-0.2163,0,0],[0.1963,0,0.1131]],"legL":[[-1.729,-0.0682,-0.4691],[0.257,0,0],[-0.2606,0.4,-0.2757]],"legR":[[-1.05,-0.8,0.5175],[0.0939,0,0],[-0.159,-0.2,0.2871]]},"proneDead_patrol":{"hips":[0,0,0],"spine":[0,0.28,0.12],"neck":[-0.25,0.6,0],"head":[-0.2,0.8,0.1],"armL":[[-0.5361,0.9977,0.1638],[-0.0112,0,0],[0.3477,1.4,0.2243]],"armR":[[-1.4103,0.5193,-0.1811],[-1.5062,0,0],[-0.0646,0,-0.0986]],"legL":[[-1.3599,-0.2487,-0.6402],[1.3196,0,0],[1.0981,0,0.0999]],"legR":[[-0.65,-0.4433,-0.1729],[0.4828,0,0],[1.2,0,-0.1327]]},"faceDown_guard5":{"hips":[0,0,0],"spine":[0,0,0],"neck":[0,0,0],"head":[0,1.2,0],"armL":[[-1.9516,0.466,-0.0453],[-0.8431,0,0],[-0.3819,0,0.0308]],"armR":[[-0.7,0.2566,0.05],[0.0167,0,0],[0.5598,0,0.029]],"legL":[[-0.7,0.1744,0.3389],[0.86,0,0],[0.6,0,0.0849]],"legR":[[-0.7,0.1276,0.0317],[0.9507,0,0],[0.0472,0,0.2046]]},"onBack_guard2":{"hips":[0,0,0],"spine":[0,0,0],"neck":[0,0,0],"head":[-0.25,0.6,0],"armL":[[-0.12,-0.5547,-1.9141],[-0.2626,0,0],[-0.3035,0,0.1379]],"armR":[[0.5375,0.5952,1.0049],[-0.6467,0,0],[-0.1164,0,-0.1186]],"legL":[[0.2155,-0.5,0.3632],[-0.003,0,0],[-0.5499,0,0.3051]],"legR":[[0.3741,-0.3808,0.5218],[-0.02,0,0],[-0.5518,0,0.3106]]}};
const POSE={
  stand:{armL:[[.04,0,-.12],[-.22]],armR:[[.04,0,.12],[-.22]],legL:[[-.03,0,-.035],[.05],[0]],legR:[[-.03,0,.035],[.05],[0]]},
  sitDeck:{spine:[.12],armL:[[-.5,0,-.15],[-.9]],armR:[[-.5,0,.15],[-.9]],legL:[[-1.45,0,-.12],[1.5],[-.2]],legR:[[-1.4,0,.1],[1.35],[-.2]],head:[.05]},
  slump:{spine:[.42,0,.12],neck:[.35],head:[.55,.2,.35],armL:[[-.25,0,-.25],[-.4]],armR:[[.1,0,.3],[-.2]],legL:[[-1.25,-.3,-.25],[.9]],legR:[[-1.5,.2,.15],[1.6]]},
  onBack:{head:[-.25,.6,0],armL:[[0,0,-1.1],[-.3]],armR:[[-.1,0,.2],[-.2]],legL:[[0,0,-.08],[.15]],legR:[[.1,0,.12],[.35]]},
  faceDown:{head:[0,1.2,0],armL:[[-2.6,0,-.4],[-.3]],armR:[[.2,0,.35],[-.4]],legL:[[0,0,-.12],[.4]],legR:[[0,0,.05],[.1]]},
  /* the dead in the izba, posed from reference: on the bed with an arm hanging to the floor, slumped sitting against the
     stove, face down with one knee drawn up */
  bedDead:{hips:[0,0,.05],spine:[.05,.18,.06],neck:[-.15,.35,.08],head:[-.35,.75,.15],armL:[[-.45,.3,.5],[-1.35],[.3,.4,0]],armR:[[.75,0,1.35],[-.35],[.2,0,.3]],
    legL:[[-.28,.35,-.42],[.55],[.35,.4,0]],legR:[[-.05,-.3,.12],[.12],[.45,-.35,0]]},
  sitDead:{hips:[0,0,0],spine:[.38,.22,.26],neck:[.42,.1,.3],head:[.45,.35,.5],armL:[[-.12,.1,-.35],[-.35],[0,0,.3]],armR:[[-.55,-.2,.28],[-.95],[.2,0,0]],
    legL:[[-1.5,.2,-.28],[.3],[.3,.4,0]],legR:[[-1.75,-.3,.42],[1.15],[.2,-.2,0]]},
  proneDead:{hips:[0,0,0],spine:[0,.28,.12],neck:[-.25,.6,0],head:[-.2,.8,.1],armL:[[.08,.4,-.1],[-.12],[0,1.4,0]],armR:[[-2.3,.15,.45],[-.95],[.3,0,0]],
    legL:[[-.7,.25,-.45],[1.1],[.5,0,0]],legR:[[.05,-.15,.1],[.12],[.6,0,0]]},
  doll:{armL:[[.05,0,-.2],[-.25]],armR:[[.05,0,.2],[-.25]],legL:[[0,0,-.05],[0],[0]],legR:[[0,0,.05],[0],[0]]},
};
