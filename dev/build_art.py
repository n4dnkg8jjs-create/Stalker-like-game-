"""artifact build: same page as build.py but with the character data split into <8.5 MB script files (artifact file limit)"""
import glob, json, os
os.chdir(os.path.dirname(os.path.abspath(__file__)))
D = 'out/art'; os.makedirs(D, exist_ok=True)
fs = [f for f in sorted(glob.glob('src/*.js')) if not f.endswith('03y_chars.js')]
b = open('build.py').read().split('\n')
pre = [l for l in b if l.startswith('js="window')][0]
js = '\n'.join(open(f).read() for f in fs); exec(pre)
t = open('template.html').read().replace('/*JS*/', js)
k = t.index('<script>', t.index('three.min.js'))
t = t[:k] + '<script src="snd.js"></script><script src="chars0.js"></script><script src="chars1.js"></script><script src="chars_join.js"></script>\n' + t[k:]
import shutil; shutil.copy('assets/snd.js', D + '/snd.js')
open(D + '/index.html', 'w').write(t)
s = open('src/03y_chars.js').read(); i = s.index('const CHARDATA='); body = s[i + 15:].rstrip().rstrip(';'); n = len(body) // 2
for k, p in enumerate([body[:n], body[n:]]): open(f'{D}/chars{k}.js', 'w').write(('var CHARSRC=[];' if k == 0 else '') + 'CHARSRC.push(' + json.dumps(p) + ');')
open(D + '/chars_join.js', 'w').write(s[:i] + 'const CHARDATA=JSON.parse(CHARSRC.join(""));CHARSRC=null;')
print('ok', len(t))
