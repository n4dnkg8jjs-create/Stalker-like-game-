import numpy as np, sys, time, subprocess
from clothes import *
import chardefs as EC
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
t = time.time()
vref = shape(EC.CHARS['player']); R = reference(vref)
v = shape(EC.CHARS[sys.argv[1] if len(sys.argv) > 1 else 'player'])
body = Body(v); print('body %.1f' % (time.time() - t))
from garments import *
pieces = ratnik(v, body, R); print('ratnik %.1f' % (time.time() - t))
COL = dict(emr=[.42, .46, .34], glove=[.2, .19, .17], velcro=[.34, .37, .27], pad=[.25, .27, .2], padhard=[.18, .19, .15], strap=[.12, .12, .1])
files = [SP + '/cl_body.npz']
np.savez(SP + '/cl_body.npz', v=sub(v)[VIDX], f=TRIS)
for k, p in enumerate(pieces):
    if 'g' in p: Vv, Tt = p['X'], np.concatenate([p['g'].Q[:, [0, 1, 2]], p['g'].Q[:, [0, 2, 3]]])
    else: Vv, Tt = p['V'], p['T']
    np.savez(SP + f'/cl_{k}.npz', v=Vv, f=Tt, c=np.tile(COL[p['mat']], (len(Vv), 1))); files.append(SP + f'/cl_{k}.npz')
cams = '0,1.0,3.2,0,.95,0,32;2.6,1.0,1.6,0,.95,0,32;0,1.0,-3.2,0,.95,0,32;1.2,1.25,.9,-.15,1.15,0,30'
subprocess.run(['python3', 'render.py', SP + '/shots/clothes.png', '420', '700', cams] + files)
print('done %.1f' % (time.time() - t))
