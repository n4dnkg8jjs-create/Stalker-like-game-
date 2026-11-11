import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import asyncio,time
from playwright.async_api import async_playwright
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':320,'height':180});t0=time.time()
    pg.on('pageerror',lambda e: print('PAGEERROR',round(time.time()-t0),str(e)[:500],flush=True))
    pg.on('console',lambda m: (m.type in ('error','warning') and 'toNonIndexed' not in m.text and 'willRead' not in m.text) and print('CONSOLE',m.type,round(time.time()-t0),m.text[:300],flush=True))
    await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
    await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
    await pg.goto(_HTML+'',timeout=1200000)
    for i in range(400):
      await pg.wait_for_timeout(3000)
      if await pg.evaluate('!!window.__z'):print('booted at',round(time.time()-t0),flush=True);break
      f=await pg.evaluate("[...document.querySelectorAll('pre')].map(p=>p.textContent).filter(t=>/failed to start|Error:/.test(t)).join('\\n')")
      if f: print('FAILED',round(time.time()-t0),f[:1500],flush=True);break
    else: print('not booted after',round(time.time()-t0))
    await b.close()
asyncio.run(main())
