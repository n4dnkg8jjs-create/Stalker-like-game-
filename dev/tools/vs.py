import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import sys,json,os,time
SP=_WORK;C=SP+'/vcmd'
cmd=json.load(open(sys.argv[1])) if sys.argv[1].endswith('.json') else json.loads(sys.argv[1])
o=C+'/out.txt';n0=open(o).read().count('DONE') if os.path.exists(o) else 0;p0=os.path.getsize(o) if os.path.exists(o) else 0
json.dump(cmd,open(C+'/next.tmp','w'));os.rename(C+'/next.tmp',C+'/next.json')
t=time.time()
while time.time()-t<1500:
    if os.path.exists(o) and open(o).read().count('DONE')>n0:break
    time.sleep(.5)
print(open(o).read()[p0:])
