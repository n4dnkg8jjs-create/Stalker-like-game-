import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
"""persistent viewmodel lab: boots the game once, then serves commands from SP/vcmd/next.json:
   {"js": "...code run first...", "shots": [{"name":..., "t": smoke time, "views": ["eye", [dx,dy,dz,dist,fov,[cx,cy,cz]] ...]}]}
   results (js return value, per-shot __labOut) append to SP/vcmd/out.txt; images go to SP/shots/vs_<name>.png (views side by side)"""
import asyncio, json, os, base64, io, sys
from playwright.async_api import async_playwright
from PIL import Image
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
C=SP+'/vcmd';os.makedirs(C,exist_ok=True)
SETUP='''(()=>{const z=__z,T=THREE;z.scene.visible=false;const r=z.renderer;r.setPixelRatio(1);r.setSize(960,540,false);r.setRenderTarget(null);
 r.toneMapping=T.ACESFilmicToneMapping;r.outputEncoding=T.sRGBEncoding;z.vmRoot.visible=false;
 window.__shot=(t,views)=>{const A=__act;if(t<=A.SMK.END)A.ACT.smk=null;A.smokeAt(t);z.vmRoot.visible=false;const cam=z.vmCam;
  cam.position.set(0,1.64,20);cam.quaternion.set(0,0,0,1);cam.fov=72*.82;cam.aspect=16/9;cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
  A.RIG.g.updateMatrixWorld(true);z.vmScene.children.forEach(o=>{if(o.isDirectionalLight){o.position.set(4,12,24);o.target.position.set(0,1.64,20);o.intensity=2.4;}});
  r.setClearColor(0x7d8794,1);const out=[];
  for(const v of views){if(v==="eye"){r.clear();r.render(z.vmScene,cam);}
   else{const k=new T.PerspectiveCamera(v[4]||35,16/9,.003,10);const cc=A.RIG.g.localToWorld(new T.Vector3(...(v[5]||[0,-.1,-.3])));
    k.position.copy(cc).add(new T.Vector3(v[0],v[1],v[2]).normalize().multiplyScalar(v[3]));k.up.set(0,1,0);k.lookAt(cc);k.updateMatrixWorld(true);r.clear();r.render(z.vmScene,k);}
   out.push(r.domElement.toDataURL('image/png'));}
  return out;};return 'setup';})()'''
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':960,'height':540});logs=[]
        pg.on('pageerror',lambda e: logs.append('PAGEERR '+str(e)));pg.on('console',lambda m: logs.append(m.text) if m.type=='error' else None)
        await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
        await pg.goto(_HTML+'#vm');await pg.wait_for_function('window.__z&&window.__act',timeout=900000)
        await pg.evaluate("__z.scene.visible=false");await pg.wait_for_timeout(1500)
        print(await pg.evaluate(SETUP),flush=True);open(C+'/ready','w').write('1')
        while True:
            f=C+'/next.json'
            if not os.path.exists(f):await asyncio.sleep(.3);continue
            try:cmd=json.load(open(f))
            except Exception:await asyncio.sleep(.3);continue
            os.remove(f);res=[]
            try:
                if cmd.get('js'):res.append('JS '+str(await pg.evaluate(cmd['js']))[:4000])
                for s in cmd.get('shots',[]):
                    urls=await pg.evaluate('([t,v])=>__shot(t,v)',[s['t'],s['views']])
                    ims=[Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in urls]
                    w=s.get('w',640);h=w*9//16;o=Image.new('RGB',(w*len(ims),h))
                    for i,m in enumerate(ims):o.paste(m.resize((w,h)),(i*w,0))
                    o.save(f"{SP}/shots/vs_{s['name']}.png")
                    lo=await pg.evaluate('JSON.stringify(window.__labOut||null)')
                    if lo!='null':res.append(s['name']+' '+lo[:3000])
            except Exception as e:res.append('EXC '+str(e)[:1500])
            res+=logs[:6];logs.clear()
            open(C+'/out.txt','a').write('\n'.join(res)+'\nDONE\n')
asyncio.run(main())
