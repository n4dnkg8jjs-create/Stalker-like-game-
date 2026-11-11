import glob,os
os.chdir(os.path.dirname(os.path.abspath(__file__)));os.makedirs('out',exist_ok=True)
js='\n'.join(open(f).read() for f in sorted(glob.glob('src/*.js')))
js="window.addEventListener('load',()=>setTimeout(function main(){try{\n"+js+"\n}catch(e){const p=document.createElement('pre');p.style.cssText='position:fixed;left:8px;bottom:8px;right:8px;z-index:99;color:#f88;background:#000c;font:12px monospace;white-space:pre-wrap;padding:8px';p.textContent='Zone 12 failed to start: '+(e&&e.stack||e);document.body.appendChild(p);}},30));\nwindow.addEventListener('error',e=>{const p=document.createElement('pre');p.style.cssText='position:fixed;left:8px;top:8px;right:8px;z-index:99;color:#f88;background:#000c;font:12px monospace;white-space:pre-wrap;padding:8px';p.textContent='Error: '+e.message+' @'+e.lineno;document.body.appendChild(p);});"
t=open('template.html').read().replace('/*JS*/',js)
# the recorded sounds (CC0), as base64 in their own script ahead of the game's
k=t.index('<script>',t.index('three.min.js'));t=t[:k]+'<script>'+open('assets/snd.js').read()+'</script>\n'+t[k:]
open('out/zone12.html','w').write(t)
print(len(t))
