import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
"""viewmodel lab: renders only the first-person gun + arms (no world) from the eye and from orbit angles.
usage: vmlab.py view[,view] [jsfile] [tag]   view = vm|ak|ads|adsak ; jsfile runs first (tweaks), may set window.__labViews"""
import sys, asyncio, base64, io
from playwright.async_api import async_playwright
from PIL import Image
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
views=sys.argv[1].split(',')
pre=open(sys.argv[2]).read() if len(sys.argv)>2 and sys.argv[2]!='-' else ''
tag=sys.argv[3] if len(sys.argv)>3 else ''
JS='''(async()=>{const z=__z,T=THREE;z.scene.visible=false;
 const id=location.hash.includes('ak')?'ak':'pm';const ads=location.hash.includes('ads');
 const r=z.renderer;r.setPixelRatio(1);r.setSize(960,540,false);r.setRenderTarget(null);r.toneMapping=T.ACESFilmicToneMapping;r.outputEncoding=T.sRGBEncoding;%s
 r.setClearColor(window.__labBg||0x7d8794,1);
 const VARS=window.__labVar||[()=>{}];const out=[];let VM,root,w;
 const cam=z.vmCam;
 for(const fv of VARS){fv(z);z.mountWeapon(id);VM=z.VM;root=z.vmRoot;w=z.WEAP[id];
  if(window.__labFlash){z.fireFlash();VM.flashT=.05;const u=VM.flash.userData;u.all.forEach(m=>m.material.opacity=1);}
  if(window.__labNoArms)VM.arms.forEach(a=>a.root.visible=false);
  if(window.__labPost)window.__labPost(z,VM);
  root.position.set(ads?0:w.hip[0],ads?-VM.sight:w.hip[1],ads?w.ads[2]:w.hip[2]);{const hr=ads?[0,0,0]:(w.hipR||[0,.03,0]);root.rotation.set(hr[0],hr[1],hr[2]);}
  if(window.__labT)window.__labT(z,root,VM);
  cam.position.set(0,1.64,20);cam.quaternion.set(0,0,0,1);cam.updateMatrixWorld(true);root.updateMatrixWorld(true);if(VM.arms&&z.fpShoulder)VM.arms.forEach(a=>z.fpShoulder(a,cam));
  cam.position.set(0,1.64,20);cam.quaternion.set(0,0,0,1);cam.fov=(ads?w.fov:72)*(ads&&w.vmk?w.vmk:(window.__labK||.82));cam.aspect=16/9;cam.updateProjectionMatrix();cam.updateMatrixWorld(true);
  z.vmScene.children.forEach(o=>{if(o.isDirectionalLight){o.position.set(4,12,24);o.target.position.set(0,1.64,20);o.intensity=2.4;}});
  r.clear();r.render(z.vmScene,cam);out.push(r.domElement.toDataURL('image/png'));
  if(window.__labAll){const gun=VM.gun;gun.updateMatrixWorld(true);for(const v of window.__labViews){const k=new T.PerspectiveCamera(v[4]||40,16/9,.005,10);const cc=gun.localToWorld(new T.Vector3(...(v[5]||[0,0,-.1])));k.position.copy(cc).add(new T.Vector3(v[0],v[1],v[2]).normalize().multiplyScalar(v[3]));k.lookAt(cc);z.vmScene.add(k);k.updateMatrixWorld(true);r.clear();r.render(z.vmScene,k);out.push(r.domElement.toDataURL('image/png'));z.vmScene.remove(k);}}}
 if(window.__labAll)return [-VARS.length,out,JSON.stringify(window.__labOut||null)];
 const gun=VM.gun;gun.updateMatrixWorld(true);const c=gun.localToWorld(new T.Vector3(0,0,id==='ak'?-.12:-.03));
 const VS=window.__labViews||[[1,0,0,.6],[-1,0,0,.6],[0,1,.05,.6],[.35,-.25,-1,.6],[.6,.5,.7,.55],[-.5,.3,.8,.45]];
 for(const v of VS){const k=new T.PerspectiveCamera(v[4]||40,16/9,.005,10);const cc=v[5]?gun.localToWorld(new T.Vector3(...v[5])):c;k.position.copy(cc).add(new T.Vector3(v[0],v[1],v[2]).normalize().multiplyScalar(v[3]));k.lookAt(cc);z.vmScene.add(k);k.updateMatrixWorld(true);
   r.clear();r.render(z.vmScene,k);out.push(r.domElement.toDataURL('image/png'));z.vmScene.remove(k);}
 return [VARS.length,out,JSON.stringify(window.__labOut||null)];})()'''%pre
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        for v in views:
            pg=await b.new_page(viewport={'width':960,'height':540})
            logs=[];pg.on('pageerror',lambda e: logs.append(str(e)))
            pg.on('console',lambda m: logs.append(m.text) if m.type=='error' else None)
            await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
            await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
            await pg.goto(_HTML+'#'+v)
            await pg.wait_for_function('window.__z',timeout=900000)
            await pg.evaluate("__z.scene.visible=false")
            await pg.wait_for_timeout(1500)
            nv,res,lo=await pg.evaluate(JS)
            if lo and lo!='null': print('LABOUT',lo)
            ims=[Image.open(io.BytesIO(base64.b64decode(u.split(',')[1]))).convert('RGB') for u in res]
            if nv<0:
                nv=-nv;per=len(ims)//nv;cw,ch=640,360;o=Image.new('RGB',(cw*per,ch*nv))
                for i,m in enumerate(ims): o.paste(m.resize((cw,ch)),((i%per)*cw,(i//per)*ch))
                o.save(f'{SP}/shots/lab_{v}{tag}_all.png');print(v,'ok',logs[:4]);await pg.close();continue
            if nv==1: ims[0].save(f'{SP}/shots/lab_{v}{tag}_eye.png')
            else:
                o=Image.new('RGB',(960*2,540*((nv+1)//2)))
                for i in range(nv): o.paste(ims[i],((i%2)*960,(i//2)*540))
                o.save(f'{SP}/shots/lab_{v}{tag}_eye.png')
            ims=ims[nv:];n=len(ims)
            if n==0: print(v,'ok',logs[:4]);await pg.close();continue
            cw=960 if (n<=2 or 'BIG' in tag) else 480;ch=cw*9//16;cols=2 if (n<=2 or 'BIG' in tag) else 3;o=Image.new('RGB',(cw*cols,ch*((n+cols-1)//cols)))
            for i,m in enumerate(ims): o.paste(m.resize((cw,ch)),((i%cols)*cw,(i//cols)*ch))
            o.save(f'{SP}/shots/lab_{v}{tag}_orb.png');print(v,'ok',logs[:4])
            await pg.close()
        await b.close()
asyncio.run(main())
