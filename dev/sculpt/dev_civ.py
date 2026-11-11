import numpy as np, sys, time, subprocess
from garments import *
import chardefs as EC
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
vref = shape(EC.CHARS['player']); R = reference(vref)
files = []
COL = dict(emr=[.42, .46, .34], quilt=[.12, .12, .11], cloth=[.35, .33, .29], plaid=[.5, .2, .18], strap=[.1, .1, .1])
for off, (nm, fn) in zip((-.6, .6), (('oldman', telogreika), ('plaid', plaid))):
    v = shape(EC.CHARS[nm]); body = Body(v); pcs = fn(v, body, R)
    for k, p in enumerate(pcs):
        if 'g' in p: Vv, Tt = p['X'], np.concatenate([p['g'].Q[:, [0, 1, 2]], p['g'].Q[:, [0, 2, 3]]])
        else: Vv, Tt = p['V'], p['T']
        np.savez(SP + f'/cv_{nm}{k}.npz', v=Vv + [off, 0, 0], f=Tt, c=np.tile(COL[p['mat']], (len(Vv), 1))); files.append(SP + f'/cv_{nm}{k}.npz')
    np.savez(SP + f'/cv_{nm}b.npz', v=sub(v)[VIDX] + [off, 0, 0], f=TRIS); files.append(SP + f'/cv_{nm}b.npz')
subprocess.run(['python3', 'render.py', SP + '/shots/civ.png', '640', '600', '0,1.0,3.6,0,.95,0,36;2.8,1.1,2.2,0,.95,0,36'] + files)
