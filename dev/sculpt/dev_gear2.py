import numpy as np, sys, time, subprocess
from clothes import *
from garments import *
import gear
from gear import *
import chardefs as EC
from skintex import landmarks
gear.QUICK = 'hq' not in sys.argv
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
v = shape(EC.CHARS['player']); head, _ = rig(v); R = reference(v); body = Body(v)
t = time.time()
pieces = ratnik(v, body, R); jk = [p for p in pieces if p['name'] == 'jacket'][0]
Xj = jk['X']; Nj = quad_normals(Xj, jk['g'].Q)
bfv = np.unique(BF); P = v[bfv]; dm = DOM[bfv]
dom_ok = np.isin(dm, ['hips', 'spine', 'neck'])
files = []
if 'vest' in sys.argv:
    Vt = vest45(P, dom_ok, head, Xj, Nj); print('vest %.1f' % (time.time() - t))
    col = np.array([[.36, .4, .29], [.27, .3, .22], [.05, .05, .05]])[Vt['mid']] * Vt['ao'][:, None]
    np.savez(SP + '/g_vest.npz', v=Vt['v'], f=Vt['f'], c=col * 1.6); files.append(SP + '/g_vest.npz')
if 'helmet' in sys.argv:
    vs = sub(v); hm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis')); hv = vs[hm > .5]; Lm = landmarks(v)
    top = hv[:, 1].max(); hw = np.percentile(np.abs(hv[:, 0]), 99); hl = (hv[:, 2].max() - hv[:, 2].min()) / 2; cz = (hv[:, 2].max() + hv[:, 2].min()) / 2
    hv2 = vs[(np.abs(vs[:, 0]) < .01) & (hm > .3)]; chin_y = Lm['chin_y']; chz = hv2[np.abs(hv2[:, 1] - chin_y) < .015][:, 2].max()
    print('head', top, hw, hl, cz, chin_y, chz)
    nh = vert_normals(vs, TRIS_ORIG); sel = hm > .5; Hm = helmet(top, hw, hl - .02, cz, (chin_y, chz), vs[sel], nh[sel]); print('helmet %.1f' % (time.time() - t))
    col = np.array([[.36, .4, .29], [.2, .22, .16], [.06, .06, .06], [.1, .1, .09], [.15, .12, .05]])[Hm['mid']] * Hm['ao'][:, None]
    np.savez(SP + '/g_helm.npz', v=Hm['v'], f=Hm['f'], c=col * 1.6); files.append(SP + '/g_helm.npz')
COL = dict(emr=[.42, .46, .34], glove=[.2, .19, .17], velcro=[.34, .37, .27], pad=[.25, .27, .2], padhard=[.18, .19, .15], strap=[.12, .12, .1])
for k, p in enumerate(pieces):
    if 'g' in p: Vv, Tt = p['X'], np.concatenate([p['g'].Q[:, [0, 1, 2]], p['g'].Q[:, [0, 2, 3]]])
    else: Vv, Tt = p['V'], p['T']
    np.savez(SP + f'/cl_{k}.npz', v=Vv, f=Tt, c=np.tile(COL[p['mat']], (len(Vv), 1))); files.append(SP + f'/cl_{k}.npz')
np.savez(SP + '/cl_body.npz', v=sub(v)[VIDX], f=TRIS); files.append(SP + '/cl_body.npz')
cams = '0,1.35,1.6,0,1.25,0,32;1.3,1.35,1.0,0,1.25,0,32;0,1.4,-1.6,0,1.25,0,32;.35,1.72,.55,0,1.66,0,30;.6,1.7,.1,0,1.68,.05,26'
subprocess.run(['python3', 'render.py', SP + '/shots/gear.png', '480', '560', cams] + files)
print('done %.1f' % (time.time() - t))
