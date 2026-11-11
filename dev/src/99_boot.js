/* ---------- render batching (no visual change): every large instanced mesh is split into spatial chunks so the frustum
   test (camera and shadow camera) can skip what is off screen, then static meshes that share a material inside a 40 m
   cell are merged into one, so thousands of tiny draw calls become a few hundred ---------- */
function chunkInstanced(){const list=[];scene.traverse(o=>{if(o.isInstancedMesh&&!o.userData.chunked)list.push(o);});
  const m4=new T.Matrix4(),p=V3(),q=new T.Quaternion(),sc=V3(),col=new T.Color();let made=0;
  for(const im of list){const geo=im.geometry;
    /* the model's own bounds (the planter may have stretched geometry.boundingSphere over the whole map) */
    const tg=new T.BufferGeometry();tg.setAttribute('position',geo.attributes.position);tg.computeBoundingSphere();const gs=tg.boundingSphere,gr=gs.center.length()+gs.radius;
    const size=im.userData.chunkSize||48,groups=new Map();
    for(let i=0;i<im.count;i++){im.getMatrixAt(i,m4);p.setFromMatrixPosition(m4);const k=Math.floor(p.x/size)+','+Math.floor(p.z/size);let g=groups.get(k);if(!g)groups.set(k,g=[]);g.push(i);}
    const parent=im.parent,sh=shootables.indexOf(im);
    for(const idx of groups.values()){const n=new T.BufferGeometry();n.index=geo.index;for(const a in geo.attributes)n.setAttribute(a,geo.attributes[a]);
      const c=new T.InstancedMesh(n,im.material,idx.length);c.castShadow=im.castShadow;c.receiveShadow=im.receiveShadow;c.customDepthMaterial=im.customDepthMaterial;c.customDistanceMaterial=im.customDistanceMaterial;
      c.renderOrder=im.renderOrder;c.frustumCulled=true;c.position.copy(im.position);c.quaternion.copy(im.quaternion);c.scale.copy(im.scale);c.userData.chunked=true;
      const ctr=V3();idx.forEach(ii=>{im.getMatrixAt(ii,m4);p.setFromMatrixPosition(m4);ctr.add(p);});ctr.divideScalar(idx.length);let r=0;
      idx.forEach((ii,j)=>{im.getMatrixAt(ii,m4);c.setMatrixAt(j,m4);m4.decompose(p,q,sc);r=Math.max(r,p.distanceTo(ctr)+gr*Math.max(sc.x,sc.y,sc.z));if(im.instanceColor){im.getColorAt(ii,col);c.setColorAt(j,col);}});
      n.boundingSphere=new T.Sphere(ctr,r);parent.add(c);if(sh>=0)shootables.push(c);made++;
}
    parent.remove(im);if(sh>=0)shootables.splice(shootables.indexOf(im),1);}
  return made;}
/* materials that look identical (same shader, same textures and values) are treated as one for batching; materials the
   game animates at runtime keep their own identity */
function matSig(m){if(m.userData.live)return m.uuid;const u=t=>t?t.uuid:'-',c=x=>x?x.getHexString():'-';
  return [m.type,m.customProgramCacheKey?m.customProgramCacheKey():'',c(m.color),c(m.emissive),m.emissiveIntensity,m.roughness,m.metalness,u(m.map),u(m.normalMap),u(m.roughnessMap),u(m.metalnessMap),u(m.aoMap),u(m.emissiveMap),u(m.alphaMap),u(m.bumpMap),
    m.bumpScale,m.normalScale?m.normalScale.x+','+m.normalScale.y:'',m.side,m.alphaTest,m.vertexColors,m.flatShading,m.envMapIntensity,m.opacity,m.depthWrite,m.depthTest,m.polygonOffset,m.polygonOffsetFactor,m.polygonOffsetUnits,m.fog,m.wireframe,m.colorWrite,m.toneMapped,m.skinning,m.morphTargets].join('|');}
function mergeGeoms(L,mat){const nm=new T.Matrix3(),t=V3();const g0=L[0].geometry,names=Object.keys(g0.attributes);
    let nv=0,ni=0;L.forEach(o=>{const g=o.geometry;nv+=g.attributes.position.count;ni+=g.index?g.index.count:g.attributes.position.count;});
    const out=new T.BufferGeometry(),arr={};names.forEach(k=>{const at=g0.attributes[k];arr[k]=new at.array.constructor(nv*at.itemSize);});
    const idx=nv>65535?new Uint32Array(ni):new Uint16Array(ni);let vo=0,io=0;
    for(const o of L){const g=o.geometry,M_=mat(o),cnt=g.attributes.position.count,flip=M_.determinant()<0;nm.getNormalMatrix(M_);
      for(const k of names){const at=g.attributes[k],is=at.itemSize,dst=arr[k],base=vo*is;
        if(k==='position'){for(let i=0;i<cnt;i++){t.fromBufferAttribute(at,i).applyMatrix4(M_);dst[base+i*3]=t.x;dst[base+i*3+1]=t.y;dst[base+i*3+2]=t.z;}}
        else if(k==='normal'){for(let i=0;i<cnt;i++){t.fromBufferAttribute(at,i).applyMatrix3(nm).normalize();dst[base+i*3]=t.x;dst[base+i*3+1]=t.y;dst[base+i*3+2]=t.z;}}
        else if(k==='tangent'){for(let i=0;i<cnt;i++){t.set(at.getX(i),at.getY(i),at.getZ(i)).transformDirection(M_);dst[base+i*4]=t.x;dst[base+i*4+1]=t.y;dst[base+i*4+2]=t.z;dst[base+i*4+3]=at.getW(i)*(flip?-1:1);}}
        else dst.set(at.array.subarray(0,cnt*is),base);}
      if(g.index){const s0=g.index.array;for(let i=0;i<s0.length;i+=3){idx[io++]=s0[i]+vo;if(flip){idx[io++]=s0[i+2]+vo;idx[io++]=s0[i+1]+vo;}else{idx[io++]=s0[i+1]+vo;idx[io++]=s0[i+2]+vo;}}}
      else for(let i=0;i<cnt;i+=3){idx[io++]=vo+i;if(flip){idx[io++]=vo+i+2;idx[io++]=vo+i+1;}else{idx[io++]=vo+i+1;idx[io++]=vo+i+2;}}
      vo+=cnt;}
    names.forEach(k=>{const at=g0.attributes[k];out.setAttribute(k,new T.BufferAttribute(arr[k],at.itemSize,at.normalized));});out.setIndex(new T.BufferAttribute(idx,1));out.computeBoundingSphere();
    return out;}
function mergeStatic(){const excl=new Set(),mark=o=>{if(o)o.traverse(c=>excl.add(c));};
  [FIRE.coalMat,FIRE.ashMat,FIRE.logMat,FIRE.holeMat,M.decal].forEach(m=>{if(m)m.userData.live=true;});
  mark(btr);if(S.door)mark(S.door.g);DOORS.forEach(d=>mark(d.g));interact.forEach(i=>mark(i.obj));worldItems.forEach(w=>mark(w.mesh));mark(flagMesh);if(SHADOW.m)mark(SHADOW.m);mark(playerBody.root);
  scene.updateMatrixWorld(true);const groups=new Map(),v=V3();
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||excl.has(o)||!o.visible)return;
    for(let a=o.parent;a&&a!==scene;a=a.parent)if(a.isBone||a.isSkinnedMesh||!a.visible||a.userData.noMerge)return;
    const m=o.material;if(!m||Array.isArray(m)||m.isShaderMaterial||m.transparent||m.userData.objSpace||o.userData.onHit||o.userData.noMerge||!o.frustumCulled||o.customDepthMaterial||o.onBeforeRender!==T.Object3D.prototype.onBeforeRender)return;
    const g=o.geometry;if(!g||!g.attributes.position||Object.keys(g.morphAttributes||{}).length||g.isInstancedBufferGeometry)return;
    const tc=g.index?g.index.count/3:g.attributes.position.count/3;if(tc>6000)return;
    if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere.radius>30)return;
    v.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);
    const sig=Object.keys(g.attributes).sort().map(k=>{const at=g.attributes[k];return k+at.itemSize+(at.normalized?'n':'')+at.array.constructor.name+(at.isInterleavedBufferAttribute?'i':'');}).join('|');
    if(sig.includes('i|')||/i$/.test(sig))return;
    let ins='';for(let a=o;a&&a!==scene;a=a.parent)if(a.userData.inside){ins=a.userData.inside;break;}
    const key=[matSig(m),o.castShadow,o.receiveShadow,o.renderOrder,sig,Math.floor(v.x/40),Math.floor(v.z/40),ins].join('#');let L=groups.get(key);if(!L)groups.set(key,L=[]);L.push(o);});
  let merged=0,removed=0;
  for(const L of groups.values()){if(L.length<2)continue;const out=mergeGeoms(L,o=>o.matrixWorld);
    const o0=L[0],mm=new T.Mesh(out,o0.material);mm.castShadow=o0.castShadow;mm.receiveShadow=o0.receiveShadow;mm.renderOrder=o0.renderOrder;mm.userData.merged=L.length;{let ins='';for(let q=L[0];q&&q!==scene;q=q.parent)if(q.userData.inside){ins=q.userData.inside;break;}if(ins)mm.userData.inside=ins;}scene.add(mm);merged++;
    let sh=false;for(const o of L){const k=shootables.indexOf(o);if(k>=0){shootables.splice(k,1);sh=true;}o.parent.remove(o);removed++;}if(sh)shootables.push(mm);}
  return [merged,removed];}
/* distance cull: with FogExp2 at 0.0125 anything further than ~230 m is >99.9% fog, so it is not drawn at all.
   Objects are moved to an unused render layer (their own .visible is left to the game) */
const DCULL={list:[],d:232};
function buildDistanceCull(){const ex=new Set();[btr,playerBody.root].forEach(r=>r&&r.traverse(c=>ex.add(c)));VEG.types.forEach(t=>(t.hi||[]).forEach(set=>set.forEach(m=>ex.add(m))));if(FLOWERS.mesh)FLOWERS.mesh.traverse(c=>ex.add(c));worldItems.forEach(w=>w.mesh.traverse(c=>ex.add(c)));
  scene.updateMatrixWorld(true);const v=V3(),sc=V3();
  scene.traverse(o=>{if(!(o.isMesh||o.isPoints||o.isLine)||ex.has(o)||o===sky||!o.frustumCulled)return;const g=o.geometry;if(!g||!g.attributes||!g.attributes.position)return;
    if(o.parent&&o.parent.isGroup&&GRASS.mesh===o.parent)return;for(let a=o;a;a=a.parent)if(a.userData.noCull)return;if(!g.boundingSphere)g.computeBoundingSphere();const b=g.boundingSphere;if(!b)return;
    v.copy(b.center).applyMatrix4(o.matrixWorld);o.matrixWorld.decompose(V3(),new T.Quaternion(),sc);const r=b.radius*Math.max(sc.x,sc.y,sc.z)+(o.isSkinnedMesh?1:0);
    let bone=false;for(let a=o.parent;a;a=a.parent)if(a.isBone)bone=true;
    if(r>140)return;let ins=false;for(let q=o;q;q=q.parent)if(q.userData.inside){ins=true;break;}DCULL.list.push({o,c:v.clone(),r:r+(bone?1.5:0),d:ins?32:0});});}
function distanceCull(){const p=camera.position,D=DCULL.d;for(const e of DCULL.list){const d=Math.hypot(e.c.x-p.x,e.c.z-p.z)-e.r;e.o.layers.mask=d<(e.d||D)?1:2;}}
/* region offload: whole static pieces of the map further off than the fog lets anything show are taken out of the scene
   graph altogether (not just hidden), so the per-frame matrix pass, the render-list walk and the shadow pass never touch
   them; they go back in well before they could come into view. Their matrices are frozen too - they never move. A piece
   qualifies only if nothing in it moves, animates, is skinned, lights, or is something the game reaches for. */
const ROFF={L:[],F:[],k:0,h:0,lp:V3(1e9,0,0),moved:[]};
function buildRegionOffload(){const ex=new Set(),mark=o=>{if(o)o.traverse(c=>ex.add(c));};
  [btr,playerBody.root,sky,GRASS.mesh,FLOWERS.mesh,flagMesh,SHADOW.m].forEach(mark);if(S.door)mark(S.door.g);DOORS.forEach(d=>mark(d.g));interact.forEach(i=>mark(i.obj));worldItems.forEach(w=>mark(w.mesh));
  if(typeof WEST!=='undefined'&&WEST.bob)WEST.bob.forEach(b=>mark(b.m));
  const inD=new Set(DCULL.list.map(e=>e.o)),bx=new T.Box3(),sp=new T.Sphere();scene.updateMatrixWorld(true);
  for(const o of scene.children){if(ex.has(o)||o.isLight||o.isCamera||o.frustumCulled===false||o.userData.noCull||o.userData.noMerge||!o.visible)continue;let ok=true,any=false;
    o.traverse(c=>{if(!ok)return;/* (instanced chunks keep their own culling: their box is not where their instances are) */if(ex.has(c)||c.isSkinnedMesh||c.isInstancedMesh||c.isBone||c.isLight||c.userData.noCull||c.userData.noMerge||!c.visible){ok=false;return;}if(c.isMesh||c.isPoints||c.isLine){if(!inD.has(c)){ok=false;return;}any=true;}});
    if(!ok||!any)continue;bx.setFromObject(o);if(bx.isEmpty())continue;bx.getBoundingSphere(sp);if(sp.radius>120)continue;
    ROFF.L.push({o,c:sp.center.clone(),r:sp.radius,out:false});o.traverse(c=>{c.updateMatrix();c.matrixAutoUpdate=false;ROFF.F.push(c);});}}
/* a safety net: should anything ever move a frozen piece, it is thawed (a slice is checked each frame) */
const _rhM=new T.Matrix4();
function roffHeal(n=120){const F=ROFF.F;if(!F.length)return;for(let k=0;k<n;k++){ROFF.h=(ROFF.h+1)%F.length;const o=F[ROFF.h];if(o.matrixAutoUpdate)continue;_rhM.compose(o.position,o.quaternion,o.scale);const a=_rhM.elements,b=o.matrix.elements;
  for(let i=0;i<16;i++)if(Math.abs(a[i]-b[i])>1e-5){o.matrixAutoUpdate=true;o.matrixWorldNeedsUpdate=true;ROFF.moved.push(o.name||o.type);break;}}}
/* ---------- chapter streaming: the parts of the map the story has not reached yet are taken out of the scene at boot
   (not drawn, not shadowed, not culled, not shot at, not reached for - and never uploaded to the GPU until needed) and
   put back, behind a black loading card, when the chapter that uses them begins:
     'west'  - everything west of x -250 and north of z -600: the highway, the forest, the field, the basin, the lumber
               yard and the road beyond (parked through the F.O.B. and Sector 1; back when the reinforcement ride starts)
     'far'   - the road west of the yard, x < -905 (back once the yard is taken) ---------- */
const PARK={L:{}};
function parkRegion(name,inR,instR=inR){const keep=new Set([sky,camera,GRASS.mesh,FLOWERS.mesh,playerBody.root,btr,flagMesh]);const rm=[],v=V3();scene.updateMatrixWorld(true);
  for(const o of scene.children){if(keep.has(o)||o.isLight||o.isCamera||o.frustumCulled===false||o.userData.keep||o.userData.noCull||o===WFX.ash)continue;
    if(o.isInstancedMesh){const b=o.geometry.boundingSphere;if(!b)continue;v.copy(b.center).applyMatrix4(o.matrixWorld);if(instR(v.x,v.z))rm.push(o);continue;}
    if(o.isMesh||o.isPoints||o.isLine){const g=o.geometry;if(!g.boundingSphere)g.computeBoundingSphere();if(g.boundingSphere.radius>90)continue;v.copy(g.boundingSphere.center).applyMatrix4(o.matrixWorld);if(inR(v.x,v.z))rm.push(o);continue;}
    {const bb=new T.Box3().setFromObject(o);if(bb.isEmpty())o.getWorldPosition(v);else bb.getCenter(v);}if(inR(v.x,v.z))rm.push(o);}
  const gone=new Set();rm.forEach(o=>o.traverse(c=>gone.add(c)));let lit=false;rm.forEach(o=>o.traverse(c=>{if(c.isLight)lit=true;}));
  const P={rm,shoot:shootables.filter(x=>gone.has(x)),inter:interact.filter(e=>e.obj&&gone.has(e.obj)),items:worldItems.filter(w=>gone.has(w.mesh)),lit};
  rm.forEach(o=>{if(o.parent)o.parent.remove(o);});
  for(let i=shootables.length-1;i>=0;i--)if(gone.has(shootables[i]))shootables.splice(i,1);
  for(let i=interact.length-1;i>=0;i--)if(interact[i].obj&&gone.has(interact[i].obj))interact.splice(i,1);
  for(let i=worldItems.length-1;i>=0;i--)if(gone.has(worldItems[i].mesh))worldItems.splice(i,1);
  for(const e of ROFF.L)if(gone.has(e.o))e.park=name;PARK.L[name]=P;return rm.length;}
function unparkRegion(name){const P=PARK.L[name];if(!P)return 0;delete PARK.L[name];P.rm.forEach(o=>{if(!o.parent)scene.add(o);});
  shootables.push(...P.shoot);interact.push(...P.inter);worldItems.push(...P.items);for(const e of ROFF.L)if(e.park===name){e.park=null;e.out=false;if(!e.o.parent)scene.add(e.o);}
  /* (compile what came back now, behind the card, rather than on the first frame it shows) */try{renderer.compile(scene,camera);}catch(_){}return P.rm.length;}
/* and before chapter 2 the two halves of it swap: at the F.O.B. the village and the sector are put away, in the sector the
   F.O.B. is - each comes back behind the ride's black card on the way there */
const PREG={sector:(x,z)=>x>-60&&x<260&&z<-200&&z>-600,fob:(x,z)=>Math.abs(x)<85&&z>-110&&z<110};
function streamTick(){if(S.chapter>=2){for(const k of ['west','fob','sector'])if(PARK.L[k])unparkRegion(k);}if(PARK.L.far&&S.chapter===3&&typeof CH3!=='undefined'&&CH3.stage>=7)unparkRegion('far');
  if(DBG||S.chapter>=2)return;const atS=S.where==='sector',ride=RIDE.on;
  if(atS){if(PARK.L.sector)unparkRegion('sector');if(!PARK.L.fob&&(!ride||RIDE.li>=2))parkRegion('fob',PREG.fob);}
  else{if(PARK.L.fob)unparkRegion('fob');if(!PARK.L.sector&&(!ride||RIDE.li>0))parkRegion('sector',PREG.sector);}}
function regionOffload(){roffHeal();const p=camera.position;const jump=Math.hypot(p.x-ROFF.lp.x,p.z-ROFF.lp.z)>20;if(!jump&&++ROFF.k%10)return;ROFF.lp.copy(p);const D=DCULL.d+25;
  for(const e of ROFF.L){if(e.park)continue;const d=Math.hypot(e.c.x-p.x,e.c.z-p.z)-e.r;if(!e.out&&d>D){scene.remove(e.o);e.out=true;}else if(e.out&&d<D-15){scene.add(e.o);e.out=false;}}}
function roffRestore(){for(const e of ROFF.L)if(e.out){scene.add(e.o);e.out=false;}}
/* inside moving or animated things (the BTR, its turret, each character's bones, a gun, an eye pivot, a door) rigid
   sibling parts that share a material are merged in their parent's own frame - they still move with it */
function mergeLocal(){const ex=new Set();btr.userData.wheels.forEach(w=>w.traverse(c=>ex.add(c)));ex.add(flagMesh);if(SHADOW.m)SHADOW.m.traverse(c=>ex.add(c));
  const groups=new Map();scene.updateMatrixWorld(true);
  scene.traverse(o=>{if(!o.isMesh||o.isSkinnedMesh||o.isInstancedMesh||o.userData.merged||ex.has(o)||o.children.length||!o.parent||o.parent===scene)return;
    if(o.matrixAutoUpdate===false||o.userData.owner||(o.material&&o.material.visible===false))return;for(let a=o.parent;a&&a!==scene;a=a.parent)if(a.userData.noMerge||a.matrixAutoUpdate===false)return;
    const m=o.material;if(!m||Array.isArray(m)||m.isShaderMaterial||m.transparent||m.userData.objSpace||o.userData.onHit||o.userData.noMerge||!o.frustumCulled||o.customDepthMaterial||o.onBeforeRender!==T.Object3D.prototype.onBeforeRender)return;
    const g=o.geometry;if(!g||!g.attributes.position||Object.keys(g.morphAttributes||{}).length||g.isInstancedBufferGeometry)return;
    const sig=Object.keys(g.attributes).sort().map(k=>{const at=g.attributes[k];return k+at.itemSize+(at.normalized?'n':'')+at.array.constructor.name+(at.isInterleavedBufferAttribute?'i':'');}).join('|');if(sig.includes('i|')||/i$/.test(sig))return;
    const key=[o.parent.uuid,matSig(m),o.castShadow,o.receiveShadow,o.renderOrder,o.visible,sig].join('#');let L=groups.get(key);if(!L)groups.set(key,L=[]);L.push(o);});
  let merged=0,removed=0;
  for(const L of groups.values()){if(L.length<2)continue;L.forEach(o=>o.updateMatrix());const out=mergeGeoms(L,o=>o.matrix);const o0=L[0],par=o0.parent,mm=new T.Mesh(out,o0.material);
    mm.castShadow=o0.castShadow;mm.receiveShadow=o0.receiveShadow;mm.renderOrder=o0.renderOrder;mm.visible=o0.visible;mm.userData.merged=L.length;par.add(mm);merged++;
    let sh=false;for(const o of L){const k=shootables.indexOf(o);if(k>=0){shootables.splice(k,1);sh=true;}par.remove(o);removed++;}if(sh)shootables.push(mm);}
  return [merged,removed];}
/* small things don't need to cast into the sun's shadow map: under ~45 cm across (cups, bolts, splinters, stones, the
   bits on a table) the shadow is a few texels nobody sees, and inside a house, where the sun only reaches in patches,
   only the furniture-sized things keep theirs. Fewer casters - a cheaper shadow pass every frame. */
function shadowTrim(){let n=0;scene.updateMatrixWorld(true);const sc=V3();scene.traverse(o=>{if(!o.isMesh||!o.castShadow||o.isInstancedMesh||o.isSkinnedMesh)return;if(o.userData.keepShadow)return;
  for(let a=o;a;a=a.parent)if(a===btr||a===playerBody.root)return;const g=o.geometry;if(!g||!g.attributes.position)return;if(!g.boundingSphere)g.computeBoundingSphere();o.matrixWorld.decompose(V3(),new T.Quaternion(),sc);
  const r=g.boundingSphere.radius*Math.max(sc.x,sc.y,sc.z);let ins=false;for(let a=o;a;a=a.parent)if(a.userData.inside){ins=true;break;}
  if(r<.22||(ins&&r<.6)){o.castShadow=false;n++;}});return n;}
{const t0=performance.now();villageYards();vegBuild();vegLOD(true);const c=chunkInstanced();window.__shTrim=shadowTrim();const [mg,rm]=location.hash.includes('nomerge')?[0,0]:mergeStatic();const [ml,rl]=mergeLocal();buildDistanceCull();buildRegionOffload();
 /* (a debug view of any place shows it all; otherwise the story's later country waits) */if(!DBG){window.__park={far:parkRegion('far',(x,z)=>x<-905),west:parkRegion('west',(x,z)=>x<-250||z<-600)};}window.__roff=ROFF;window.__batchL=[ml,rl];window.__batch={chunks:c,merged:mg,removed:rm,dcull:DCULL.list.length,roff:ROFF.L.length,ms:Math.round(performance.now()-t0)};}
/* the smoking rig (both arms, the pack, the cigarette, the lighter, its flame light) is built and its shaders compiled
   now, behind the loading card: built on first use it added a light to the view scene and stalled the game for seconds
   while every shader was recompiled */
try{rigBuild();RIG.g.visible=true;renderer.compile(vmScene,vmCam);RIG.g.visible=false;}catch(e){console.warn('rig',e);}
/* ---------- start (after every module, including chapter 2, has initialised) ---------- */
boot();
window.__z={ROADS,sky,memo,roffRestore,distanceCull,ROFF,PARK,parkRegion,unparkRegion,streamTick,actTick,RIG,get vmRoot(){return vmRoot;},initAudio,warTick,get AUD(){return AUD;},shadow2Tick,Ragdoll,RAGS,buildHuman,floorAt,groundSeen,terrMeshY,warGun,warMG,warDrone,warClose,warGrad,WAR,CD,poseHand,handsVM,RLFIX,inGun,gunColliders,AP,cmdr,riders,VEG,FLOWERS,GRASS_:GRASS,get VM(){return VM;},playerBody,gait,GAIT,ANIMS,SHADOW,spawnShadow,FX,begin,rideToSector,rideToFOB,interact,doInteract,findInteract,toggleInv,RIDE,btr,scene,renderer,camera,sun,hemi,S,M,postMat,vmScene,GRASS,Q,QUAL,applyQuality,player,debugView,tentSmoke,gloveMat,VMG,WEAP,HANDS,mountWeapon,vmCam,vmRoot,tickVM,buildPM,buildAK,fireFlash,RL,vmAction,placeArm2,HANDS,WALKERS,buildHuman,animate,woundDress,saveGame,loadGame,saveData,ch2Lids,fpShoulder,MEMO,villTick,wxTick,fxUpdate,WX,roadFrame,H,WEATHER,weatherUpdate,VILL,villW,INTERIORS,HX,HZ};
