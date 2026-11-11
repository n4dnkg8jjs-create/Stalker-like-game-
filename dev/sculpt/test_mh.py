import numpy as np, sys, json
from mh import *
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
V,VT,F,FT,G=base()
v=V.copy()
macro(v,gender=1,age=.56,muscle=.82,weight=.52,height=.47)
v*=.1; v[:,1]-=v[:,1][np.array([i for f,g in zip(F,G) if g=='body' for i in f])].min()
tri=[]
for f,g in zip(F,G):
    if g!='body': continue
    tri.append([f[0],f[1],f[2]])
    if len(f)==4: tri.append([f[0],f[2],f[3]])
tri=np.array(tri)
print('height',v[np.unique(tri)][:,1].max())
np.savez(SP+'/mh_body.npz',v=v,f=tri)
