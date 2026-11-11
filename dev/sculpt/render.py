"""Render meshes (npz with v,f[,c]) in a grey studio like the reference, via three.js in headless Chromium.
usage: python3 render.py out.png W H "cam" mesh1.npz [mesh2.npz ...]
cam = "px,py,pz,tx,ty,tz,fov" """
import sys, json, base64, asyncio, numpy as np
from playwright.async_api import async_playwright
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
THREE = open(SP + '/threejs/build/three.min.js').read()
SKINJS = open('/home/claude/z12/src/03x_skin.js').read()
import os; BUMP = float(os.environ.get('BUMP', '.004')); A2C = os.environ.get('A2C', '1') == '1'

def pack(path):
    d = np.load(path); v = d['v'].astype(np.float32); f = d['f'].astype(np.uint32)
    o = dict(v=base64.b64encode(v.tobytes()).decode(), f=base64.b64encode(f.tobytes()).decode())
    if 'c' in d: o['c'] = base64.b64encode((np.clip(d['c'], 0, 1) * 255).astype(np.uint8).tobytes()).decode()
    if 'grey' in d: o['grey'] = 1
    if 'uv' in d: o['uv'] = base64.b64encode(d['uv'].astype(np.float32).tobytes()).decode()
    if 'tex' in d:
        tp = str(d['tex']); o['tex'] = ('data:image/png;base64,' if tp.endswith('.png') else 'data:image/jpeg;base64,') + base64.b64encode(open(tp, 'rb').read()).decode()
    if 'col' in d: o['col'] = [float(x) for x in d['col']]
    if 'opacity' in d: o['opacity'] = float(d['opacity'])
    if 'alpha' in d: o['alpha'] = float(d['alpha'])
    if 'det' in d: o['det'] = 'data:image/jpeg;base64,' + base64.b64encode(open(str(d['det']), 'rb').read()).decode()
    if 'sss' in d: o['sss'] = 1
    if 'vc' in d: o['vc'] = base64.b64encode((np.clip(d['vc'], 0, 1) * 255).astype(np.uint8).tobytes()).decode()
    if 'n' in d: o['nrm'] = base64.b64encode(d['n'].astype(np.float32).tobytes()).decode()
    return o

def html(meshes, cams, W, H):
    return f"""<html><body style="margin:0;background:#888"><canvas id=c width={W} height={H}></canvas><script>{THREE}</script><script>{SKINJS}</script><script>
const M={json.dumps(meshes)};const CAMS={json.dumps(cams)};
const r=new THREE.WebGLRenderer({{canvas:document.getElementById('c'),antialias:true,preserveDrawingBuffer:true}});r.setSize({W},{H},false);
r.outputEncoding=THREE.sRGBEncoding;r.toneMapping=THREE.ACESFilmicToneMapping;r.toneMappingExposure=.42;r.shadowMap.enabled=true;
const s=new THREE.Scene();s.background=new THREE.Color(0x8a8a8a);
const b64=(x,T)=>{{const s=atob(x),u=new Uint8Array(s.length);for(let i=0;i<s.length;i++)u[i]=s.charCodeAt(i);return new T(u.buffer);}};
M.forEach(m=>{{const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(b64(m.v,Float32Array),3));g.setIndex(new THREE.BufferAttribute(b64(m.f,Uint32Array),1));
  let mat;if(m.tex){{g.setAttribute('uv',new THREE.BufferAttribute(b64(m.uv,Float32Array),2));const t=new THREE.TextureLoader().load(m.tex,()=>{{window.texn=(window.texn||0)+1;}});t.encoding=THREE.sRGBEncoding;t.anisotropy=8;
    mat=new THREE.MeshStandardMaterial({{map:t,roughness:m.alpha?.7:.62,alphaTest:m.alpha||0,side:m.alpha?THREE.DoubleSide:THREE.FrontSide}});if(m.col)mat.color.setRGB(...m.col).convertSRGBToLinear();window.texw=(window.texw||0)+1;
    if(m.alpha&&{'true' if True else ''}){{mat.alphaToCoverage={'true' if A2C else 'false'};}}
    if(m.det){{const d=new THREE.TextureLoader().load(m.det,()=>{{window.texn=(window.texn||0)+1;}});window.texw++;d.anisotropy=8;mat.bumpMap=d;mat.bumpScale={BUMP};mat.roughnessMap=d;mat.roughness=1;}}
    if(m.sss)skinPatch(mat);
    if(m.vc){{const c=b64(m.vc,Uint8Array);g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(c.length*3).map((_,i)=>Math.pow(c[(i/3)|0]/255,1)),3));mat.vertexColors=true;}}}}
  else if(m.opacity){{mat=new THREE.MeshStandardMaterial({{color:0xffffff,roughness:.03,metalness:0,transparent:true,opacity:m.opacity,depthWrite:false}});}}
  else if(m.c){{const c=b64(m.c,Uint8Array);g.setAttribute('color',new THREE.BufferAttribute(new Float32Array(c).map(x=>Math.pow(x/255,2.2)),3));mat=new THREE.MeshStandardMaterial({{vertexColors:true,roughness:.6}});}}
  else mat=new THREE.MeshStandardMaterial({{color:0x8c8c8c,roughness:.6}});
  if(!m.nrm)g.computeVertexNormals();else g.setAttribute('normal',new THREE.BufferAttribute(b64(m.nrm,Float32Array),3));const me=new THREE.Mesh(g,mat);me.castShadow=me.receiveShadow=true;s.add(me);}});
const k=new THREE.DirectionalLight(0xffffff,2.6);k.position.set(-2.5,3,3);k.castShadow=true;k.shadow.bias=-.0004;k.shadow.normalBias=.003;k.shadow.mapSize.set(2048,2048);k.shadow.camera.left=-1;k.shadow.camera.right=1;k.shadow.camera.top=2;k.shadow.camera.bottom=-.2;s.add(k);
const f2=new THREE.DirectionalLight(0xffffff,.8);f2.position.set(3,1,2);s.add(f2);
const rim=new THREE.DirectionalLight(0xffffff,1.0);rim.position.set(0,2,-4);s.add(rim);
s.add(new THREE.HemisphereLight(0xffffff,0x444444,.35));
window.go=()=>{{window.shots=[];CAMS.forEach(c=>{{const cam=new THREE.PerspectiveCamera(c[6],{W}/{H},.01,50);cam.position.set(c[0],c[1],c[2]);cam.lookAt(c[3],c[4],c[5]);r.render(s,cam);window.shots.push(r.domElement.toDataURL('image/png'));}});
window.done=1;}};const wait=()=>{{if((window.texn||0)>=(window.texw||0))window.go();else setTimeout(wait,100);}};wait();</script></body></html>"""

async def main():
    out, W, H, cams = sys.argv[1], int(sys.argv[2]), int(sys.argv[3]), sys.argv[4]
    cams = [list(map(float, c.split(','))) for c in cams.split(';')]
    meshes = [pack(p) for p in sys.argv[5:]]
    open(SP + '/viewer.html', 'w').write(html(meshes, cams, W, H))
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args=['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'])
        pg = await b.new_page(viewport={'width': W, 'height': H})
        pg.on('pageerror', lambda e: print('ERR', e))
        await pg.goto('file://' + SP + '/viewer.html')
        await pg.wait_for_function('window.done', timeout=300000)
        shots = await pg.evaluate('window.shots')
        from PIL import Image; import io
        ims = [Image.open(io.BytesIO(base64.b64decode(s.split(',')[1]))) for s in shots]
        out_im = Image.new('RGB', (W * len(ims), H))
        for i, im in enumerate(ims): out_im.paste(im, (i * W, 0))
        out_im.save(out)
        await b.close()
asyncio.run(main())
