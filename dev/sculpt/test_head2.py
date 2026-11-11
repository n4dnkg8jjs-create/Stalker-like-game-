import sys,time,json,numpy as np
from sdf import *
from head import head_sdf, eye_centres, EYE_R
from qem import decimate
from paint import head_colors, uv_sphere, eye_colors
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
p=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
tf=int(sys.argv[2]) if len(sys.argv)>2 else 40000
t=time.time();fn,_=head_sdf(p)
fld,lo,hh=evaluate(fn,(-.1,-.2,-.13),(.1,.12,.13),.0012,coarse=4)
v,f=extract(fld,lo,hh);v=taubin(v,f,3)
keep=v[:,1]>-.16;v,f,_=cut(v,f,keep)
print('mc',len(v),len(f),'%.1f'%(time.time()-t))
v,f,_=decimate(v,f,tf);print('qem',len(v),len(f),'%.1f'%(time.time()-t))
n=normals(v,f);ao=sdf_ao(fn,v,n,dist=.006)
c=head_colors(v,ao,p,decay=p.get('decay',0),stubble=0 if p.get('decay') else .6)
np.savez(SP+'/head_test.npz',v=v,f=f,c=c)
for i,e in enumerate(eye_centres()):
    ev,ef,ed=uv_sphere(e,EYE_R);np.savez(SP+f'/eye{i}.npz',v=ev,f=ef,c=eye_colors(ed,decay=p.get('decay',0)))
print('done %.1f'%(time.time()-t))
