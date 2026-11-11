import os as _os;_D=_os.path.dirname(_os.path.abspath(__file__));_DEV=_os.path.dirname(_D)
_WORK=_os.path.join(_DEV,'work');[_os.makedirs(_os.path.join(_WORK,x),exist_ok=True) for x in ('shots','vcmd')]
_HTML='file://'+_os.path.join(_DEV,'out','zone12.html')
import sys,json;sys.path.insert(0,_D)
from vrun import run
from PIL import Image
SP=_WORK
tag=sys.argv[1]
C=[-.01,-.12,-.22]
TS=[float(x) for x in sys.argv[2].split(',')]
V=['eye',[.6,.15,.9,.32,34,C]]
js="""window.__noMk=1;window.__labOut=null;(()=>{const A=__act,o=[];for(const t of [1.6,1.7,1.8,1.95,2.15,2.5]){{const it=__z.S.bag.find(b=>b&&b.id==='cigs');if(it)it.count=20;}A.ACT.smk=null;A.smokeAt(t);const m=A.ACT.smk,P=A.RIG.pack,c=(t<2.25&&!m.taken)?P.userData.cigs[m.ci]:(m.taken?A.RIG.cig:P.userData.cigs[m.ci]);
 const tp=ch=>{const q=A.chainPts(ch);return q[2].clone().lerp(q[3],.55);};const gp=+(tp(A.RIG.R.hand.thumb).distanceTo(tp(A.RIG.R.hand.fingers[0]))*1000).toFixed(1);const cols=A.colPrep([{o:c,kind:'cyl',c:[0,0,0],r:.0039,len:.084}]);const h=A.RIG.R.hand;const tip=ch=>{const q=A.chainPts(ch);return q[2].clone().lerp(q[3],.55);};
 o.push([t,m.taken?1:0,+(A.sdf(tip(h.thumb),cols)*1000).toFixed(1),+(A.sdf(tip(h.fingers[0]),cols)*1000).toFixed(1),gp]);}return JSON.stringify(o);})()"""
print(run(js,[{'name':tag+'%02d'%i,'t':t,'views':V,'w':480} for i,t in enumerate(TS)]))
ims=[Image.open(SP+'/shots/vs_%s%02d.png'%(tag,i)) for i in range(len(TS))];w,h=ims[0].size
o=Image.new('RGB',(w,h*len(TS)))
for i,m in enumerate(ims):o.paste(m,(0,i*h))
o.save(SP+'/shots/%s_seq.png'%tag);print(w,h)
