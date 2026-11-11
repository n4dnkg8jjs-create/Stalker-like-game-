import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import asyncio
from playwright.async_api import async_playwright
SP=_WORK
THREE=open(_os.path.join(_DEV,'lab','three.min.js'),'rb').read()
async def main():
  async with async_playwright() as p:
    b=await p.chromium.launch(args=['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist'])
    pg=await b.new_page(viewport={'width':320,'height':180});errs=[]
    pg.on('pageerror',lambda e: errs.append(str(e)[:400]))
    await pg.route('**/three.min.js',lambda r: r.fulfill(body=THREE,content_type='application/javascript'))
    await pg.route('https://fonts.googleapis.com/**',lambda r: r.fulfill(body='',content_type='text/css'))
    await pg.goto(_HTML+'')
    for i in range(110):
      await pg.wait_for_timeout(3000)
      if errs or await pg.evaluate('!!window.__z'):break
      f=await pg.evaluate("[...document.querySelectorAll('pre')].map(p=>p.textContent).filter(t=>/failed to start|Error:/.test(t)).join(' | ')")
      if f:errs.append(f[:600]);break
    print('booted' if await pg.evaluate('!!window.__z') else 'NOT booted',errs[:3]);await b.close()
asyncio.run(main())
