import numpy as np, sys, subprocess, time
from PIL import Image
from mhbuild import *
from skintex import landmarks
import chardefs as EC, tsh2
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
name=sys.argv[1] if len(sys.argv)>1 else 'driver'
P=EC.CHARS[name];v=shape(P);vs=sub(v);M=landmarks(v)['M']
e0=np.zeros(len(V0))
for sd in 'lr':
    i_,d_=target(f'ears/{sd}-ear-wing-incr.target');e0[i_]=1
ear=(S@e0)>.5;ec=vs[ear&(vs[:,0]>M[0])].mean(0)
t=time.time();parts,fit=tsh2.build(vs,M,ec);print('tsh %.1fs'%(time.time()-t))
Image.fromarray(parts['tex']).save(SP+'/tsh_tex.png')
V,Fo,Fi,Fr,UV=parts['cloth']
np.savez(SP+'/dev_head.npz',v=vs[VIDX],f=TRIS,col=[.62,.45,.38])
np.savez(SP+'/dev_tc.npz',v=V,f=np.concatenate([Fo,Fi,Fr]),uv=UV,tex=SP+'/tsh_tex.png')
pv,pf=parts['pipe'];np.savez(SP+'/dev_tp.npz',v=pv,f=pf,col=[.13,.145,.17])
lv,lf=parts['leather'];np.savez(SP+'/dev_tl.npz',v=lv,f=lf,col=[.25,.17,.11])
cx,cy,cz=M
cams=f'{cx},{cy-.02},{cz+.5},{cx},{cy-.03},{cz-.07},34;{cx+.42},{cy+.02},{cz+.25},{cx},{cy-.03},{cz-.08},34;{cx-.5},{cy+.05},{cz-.12},{cx},{cy-.03},{cz-.09},34;{cx-.3},{cy+.2},{cz-.5},{cx},{cy-.02},{cz-.09},34'
subprocess.run(['python3','render.py',SP+'/shots/dev_tsh.png','440','560',cams]+[SP+f'/dev_{k}.npz' for k in ('head','tc','tp','tl')])
