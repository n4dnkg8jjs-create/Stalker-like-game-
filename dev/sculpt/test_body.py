import time,numpy as np
from sdf import *
from body import body_sdf
t=time.time()
fn=body_sdf()
fld,lo,h=evaluate(fn,(-.72,-.01,-.2),(.72,1.75,.25),.008,coarse=3)
print('eval',time.time()-t, fld.shape)
v,f=extract(fld,lo,h); print('mc',len(v),len(f),time.time()-t)
v=taubin(v,f,4)
np.savez('/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad/body_test.npz',v=v,f=f)
