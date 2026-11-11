import numpy as np, sys, subprocess, time
from mhbuild import *
from skintex import landmarks
import chardefs as EC, tsh
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
name=sys.argv[1] if len(sys.argv)>1 else 'guard2'
P=EC.CHARS[name];v=shape(P);vs=sub(v);M=landmarks(v)['M']
e0=np.zeros(len(V0))
for sd in 'lr':
    i_,d_=target(f'ears/{sd}-ear-wing-incr.target');e0[i_]=1
ear=(S@e0)>.5;ec=vs[ear&(vs[:,0]>M[0])].mean(0)
t=time.time();parts,fit=tsh.build(vs,M,ec);print('tsh %.1fs'%(time.time()-t),{k:len(p[0]) for k,p in parts.items()})
np.savez(SP+'/dev_head.npz',v=vs[VIDX],f=TRIS,col=[.78,.6,.52])
cv,cf,cao=parts['cloth'];np.savez(SP+'/dev_tc.npz',v=cv,f=cf,c=np.repeat((.1+.12*cao)[:,None],3,1))
tv,tf,_=parts['tape'];np.savez(SP+'/dev_tt.npz',v=tv,f=tf,col=[.12,.1,.08])
sv,sf,_=parts['strap'];np.savez(SP+'/dev_ts.npz',v=sv,f=sf,col=[.14,.11,.08])
cx,cy,cz=M
cams=f'{cx+.25},{cy+.05},{cz+.35},{cx},{cy+.0},{cz-.07},34;{cx+.55},{cy+.02},{cz-.09},{cx},{cy-.01},{cz-.09},34;{cx-.38},{cy+.2},{cz-.52},{cx},{cy},{cz-.09},34;{cx+.12},{cy-.2},{cz+.42},{cx},{cy-.07},{cz-.05},34'
subprocess.run(['python3','render.py',SP+'/shots/dev_tsh.png','440','560',cams]+[SP+f'/dev_{k}.npz' for k in ('head','tc','tt','ts')])
