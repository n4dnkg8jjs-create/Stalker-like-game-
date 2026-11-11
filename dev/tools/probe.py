import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import sys, asyncio
from playwright.async_api import async_playwright
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
view=sys.argv[1]; steps=sys.argv[2:]
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
        pg=await b.new_page(viewport={'width':int(__import__('os').environ.get('PW','960')),'height':int(__import__('os').environ.get('PH','540'))})
        logs=[]
        pg.on('console',lambda m: logs.append(m.type+': '+m.text))
        pg.on('pageerror',lambda e: logs.append('PAGEERROR: '+str(e)))
        await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
        await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
        await pg.goto(_HTML+'#'+view)
        await pg.wait_for_function('window.__z',timeout=900000)
        await pg.wait_for_timeout(4000)
        for i,s in enumerate(steps):
            name,js=s.split('::',1)
            if js.strip(): 
                r=await pg.evaluate(js); 
                if r is not None: print(name,'=>',str(r)[:6000])
            await pg.wait_for_timeout(2500)
            await pg.screenshot(path=f'{SP}/shots/p_{name}.png',timeout=600000)
        for l in logs[:30]: print('  ',l[:300])
        await b.close()
asyncio.run(main())
