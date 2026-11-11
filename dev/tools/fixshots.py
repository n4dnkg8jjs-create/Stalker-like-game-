import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import asyncio,base64,io,sys,json
from playwright.async_api import async_playwright
from PIL import Image
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
TAG=sys.argv[1] if len(sys.argv)>1 else 'fx'
SETUP='''(()=>{const z=__z,T=THREE;for(const k of Object.keys(z.PARK.L||{}))z.unparkRegion(k);z.roffRestore();z.S.state='paused';
 const sh=[];const add=(name,p,t,fov=50)=>sh.push({name,p:p.toArray?p.toArray():p,t:t.toArray?t.toArray():t,fov});
 const V=(x,y,z_)=>new T.Vector3(x,y,z_);const H=z.H;
 const byMat=(m)=>{const o=[];if(!m)return o;z.scene.traverse(q=>{if(q.isMesh&&(q.material===m||(Array.isArray(q.material)&&q.material.includes(m))))o.push(q);});return o;};
 const front=(q,dist,up=.05,side=0)=>{q.updateMatrixWorld(true);const p=q.getWorldPosition(V());const n=V(0,0,1).transformDirection(q.matrixWorld);const s=V(1,0,0).transformDirection(q.matrixWorld);return [p.clone().addScaledVector(n,dist).addScaledVector(s,side).add(V(0,up,0)),p];};
 const M=z.MEMO;
 {const g=byMat(M.get('gasMeterBody'))[0];if(g){const [a,b]=front(g,1.3,.15,.35);add('gas',a,b,45);}}
 {const g=byMat(M.get('meterBox2'))[0];if(g){const [a,b]=front(g,1.1,.05,.2);add('elmeter',a,b,45);const [c,d]=front(g,3.2,.2,1.2);add('wall',c,d,50);}}
 {const g=byMat(M.get('toyKnit2'))[0];if(g){const p=g.getWorldPosition(V());add('rabbit',p.clone().add(V(.45,.25,.45)),p.clone().add(V(0,.08,0)),40);}}
 {const g=byMat(M.get('caseStrap'))[0];if(g){const p=g.getWorldPosition(V());add('bags',p.clone().add(V(1.4,1.1,1.4)),p.clone().add(V(0,.1,0)),50);}}
 const hs=z.VILL.houses;const col=hs.filter(h=>h.ruin==='collapse');col.slice(0,2).forEach((h,i)=>{const [cx,cz]=z.villW(h,0,0),[ex,ez]=z.villW(h,4,h.D/2+13);add('collapse'+i,V(ex,H(ex,ez)+3,ez),V(cx,H(cx,cz)+3,cz),55);});
 const bo=hs.filter(h=>h.boarded&&!h.ruin);bo.slice(0,2).forEach((h,i)=>{const [cx,cz]=z.villW(h,0,h.D/2+3),[ex,ez]=z.villW(h,3,h.D/2+10);add('yard'+i,V(ex,H(ex,ez)+3.4,ez),V(cx,H(cx,cz),cz),55);});
 {const P=z.WX.P;if(P){const SL=P[P.length-1].s,i=Math.min(P.length-1,Math.max(1,Math.round(.585*SL/2))),p=P[i],fr=z.roadFrame(P,i);const bx=p.x+fr.nx*(z.WX.hw+1.6),bz=p.z+fr.nz*(z.WX.hw+1.6);
   add('wreckA',V(bx-fr.nx*7+fr.tx*1,H(bx,bz)+1.8,bz-fr.nz*7+fr.tz*1),V(bx,H(bx,bz)+1.1,bz),50);add('wreckB',V(bx+fr.nx*7-fr.tx*1,H(bx,bz)+1.8,bz+fr.nz*7-fr.tz*1),V(bx,H(bx,bz)+1.1,bz),50);}}
 add('nroad',V(1.5,1.8,-420),V(0,1.2,-600),60);add('nroad2',V(2,2,-560),V(0,0,-700),60);
 window.__SH=sh;return JSON.stringify(sh.map(s=>s.name));})()'''
SHOT='''(i=>{const z=__z,T=THREE,s=__SH[i];const r=z.renderer;r.setRenderTarget(null);r.setPixelRatio(1);r.setSize(800,500,false);
 z.camera.position.set(...s.p);z.camera.updateMatrixWorld(true);z.distanceCull();
 const c=new T.PerspectiveCamera(s.fov,1.6,.05,1500);c.position.set(...s.p);c.lookAt(...s.t);c.layers.enableAll();c.updateMatrixWorld(true);
 if(z.sky)z.sky.position.set(...s.p);r.clear();r.render(z.scene,c);return r.domElement.toDataURL('image/jpeg',.88);})'''
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':800,'height':500});errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:300]))
    await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
    await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
    await pg.goto(_HTML+'#field',timeout=1200000)
    for i in range(500):
      await pg.wait_for_timeout(3000)
      if await pg.evaluate('!!window.__z'):break
      f=await pg.evaluate("[...document.querySelectorAll('pre')].map(p=>p.textContent).filter(t=>/failed to start|Error:/.test(t)).join('\\n')")
      if f: print('FAILED',f[:1500],flush=True);await b.close();return
    print('booted',flush=True)
    await pg.wait_for_timeout(3000)
    names=json.loads(await pg.evaluate(SETUP));print(names,flush=True)
    for i,n in enumerate(names):
      u=await pg.evaluate(SHOT+f'({i})')
      open(f'{SP}/shots/{TAG}_{n}.jpg','wb').write(base64.b64decode(u.split(',')[1]));print('shot',n,flush=True)
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
