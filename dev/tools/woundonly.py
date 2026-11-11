import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import asyncio,base64,io,sys,json
from playwright.async_api import async_playwright
from PIL import Image
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
TAG=sys.argv[1] if len(sys.argv)>1 else 'fx'
SETUP='''(()=>{const z=__z,T=THREE,c3=__c3;for(const k of Object.keys(z.PARK.L||{}))z.unparkRegion(k);z.roffRestore();z.S.state='paused';
 const sh=[];const V=(x,y,z_)=>new T.Vector3(x,y,z_);
 c3.ch3Spawn();let s=null;for(const q of c3.CH3.seps){q.state='combat';q.wfDone=false;q.down(q.chestPos(),V(0,0,1),false);if(q.state==='wfight'){s=q;break;}}
 if(!s)return JSON.stringify({names:[],wound:'none'});
 const tgt={x:s.pos.x+Math.sin(s.yaw)*7,y:z.H(s.pos.x,s.pos.z)+1.6,z:s.pos.z+Math.cos(s.yaw)*7};
 for(let i=0;i<150;i++){s.an.update(1/30,tgt);s.place();}
 s.g.updateMatrixWorld(true);const p=s.h.P.bones.spine.getWorldPosition(V());const fw=V(Math.sin(s.yaw),0,Math.cos(s.yaw)),rt=V(Math.cos(s.yaw),0,-Math.sin(s.yaw));
 [[2.4,0,.3],[1.6,1.6,.5],[0,2.4,.2],[-1.4,1.4,.9]].forEach(([a,b,h],i)=>{const c=p.clone().addScaledVector(fw,a).addScaledVector(rt,b);c.y+=h;sh.push({name:'wp'+i,p:c.toArray(),t:[p.x,p.y-.05,p.z],fov:42});});
 window.__SH=sh;return JSON.stringify({names:sh.map(x=>x.name),wound:s.state,cur:s.an.cur,blend:s.an.blend,hipsY:+s.h.P.bones.hips.position.y.toFixed(3)});})()'''
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
    R=json.loads(await pg.evaluate(SETUP));print(R,flush=True);names=R['names']
    for i,n in enumerate(names):
      u=await pg.evaluate(SHOT+f'({i})')
      open(f'{SP}/shots/{TAG}_{n}.jpg','wb').write(base64.b64decode(u.split(',')[1]));print('shot',n,flush=True)
    print('errors',errs[:5]);await b.close()
asyncio.run(main())
