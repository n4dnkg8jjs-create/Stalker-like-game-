import numpy as np, sys, time, subprocess
from clothes import *
from gear import *
import chardefs as EC
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
v = shape(EC.CHARS['player']); head, _ = rig(v)
bfv = np.unique(BF); P = v[bfv]
def leg_centre(side, y):
    m = (np.sign(P[:, 0]) == (-1 if side == 'L' else 1)) & (np.abs(P[:, 1] - y) < .035) & (np.abs(P[:, 0]) > .08)
    q = P[m]; return (q.max(0) + q.min(0)) / 2
t = time.time()
B = boot(head['anL'], leg_centre('L', .255), side=1)
print('boot %.1f' % (time.time() - t))
col = np.array([[.05, .045, .04], [.03, .03, .03], [.08, .07, .06]])[B['mid']] * B['ao'][:, None]
np.savez(SP + '/g_boot.npz', v=B['v'], f=B['f'], c=col * 3)
np.savez(SP + '/g_body.npz', v=sub(v)[VIDX], f=TRIS)
a = head['anL']
cams = f'{a[0]-.5},.2,{a[2]+.35},{a[0]},.11,{a[2]+.07},30;{a[0]+.05},.35,{a[2]+.55},{a[0]},.12,{a[2]+.06},30;{a[0]-.35},.5,{a[2]-.35},{a[0]},.1,{a[2]+.05},30'
subprocess.run(['python3', 'render.py', SP + '/shots/boot.png', '500', '500', cams, SP + '/g_boot.npz'])
