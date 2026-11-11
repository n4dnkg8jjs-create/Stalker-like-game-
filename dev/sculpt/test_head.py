import sys,time,json,numpy as np
from sdf import *
from head import head_sdf
p=json.loads(sys.argv[1]) if len(sys.argv)>1 else {}
h=float(sys.argv[2]) if len(sys.argv)>2 else .0012
t=time.time();fn,_=head_sdf(p)
fld,lo,hh=evaluate(fn,(-.1,-.2,-.13),(.1,.12,.13),h,coarse=4)
v,f=extract(fld,lo,hh);v=taubin(v,f,3)
print('verts',len(v),'faces',len(f),'%.1fs'%(time.time()-t))
np.savez('/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad/head_test.npz',v=v,f=f)
