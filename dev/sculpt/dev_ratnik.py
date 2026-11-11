"""render the Ratnik kit on the reference body: python3 dev_ratnik.py [hq] [vest] [helmet] [A|B|C]"""
import numpy as np, sys, time, subprocess
from clothes import *
from garments import *
import ratnik as RK
import chardefs as EC
from skintex import landmarks
RK.QUICK = 'hq' not in sys.argv
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
v = shape(EC.CHARS['player']); head, _ = rig(v); R = reference(v); body = Body(v)
t = time.time()
pieces = ratnik(v, body, R); jk = [p for p in pieces if p['name'] == 'jacket'][0]
Xj = jk['X']; Nj = quad_normals(Xj, jk['g'].Q)
bfv = np.unique(BF); P = v[bfv]; dm = DOM[bfv]; dom_ok = np.isin(dm, ['hips', 'spine', 'neck'])
files = []; kit = [k for k in 'ABC' if k in sys.argv[1:]] or ['A']
olive = 'olive' in sys.argv
PAL = np.array([[.33, .36, .25], [.24, .27, .18], [.05, .05, .05], [.2, .21, .15], [.15, .12, .05]]) if olive else np.array([[.40, .44, .32], [.30, .34, .23], [.05, .05, .05], [.24, .26, .18], [.15, .12, .05]])
def save(name, g):
    col = PAL[g['mid']] * g['ao'][:, None]; np.savez(SP + f'/rk_{name}.npz', v=g['v'], f=g['f'], c=col * 1.5); files.append(SP + f'/rk_{name}.npz')
if 'vest' in sys.argv:
    V, ctx = RK.vest_kit(P, dom_ok, head, Xj, Nj); print('vest %.1f' % (time.time() - t), len(V['f']), flush=True); save('vest', V)
    print('yN-yH', ctx['yN'] - ctx['yH'], 'upper', RK.upper_y(ctx) - ctx['yH'])
    if kit[0] == 'B': save('pouches', RK.pouches(ctx))
    if 'X' in sys.argv: save('gren2', RK.grenade_pouches(ctx, (.04, .112), 3)); save('gren1', RK.grenade_pouches(ctx, (-.07,), 4)); PAL[3] = [.55, .16, .06]
    if 'Y' in sys.argv: save('gren2', RK.grenade_pouches(ctx, (.04, .112), 3)); save('tq', RK.tourniquet(ctx, -.07)); PAL[3] = [.55, .16, .06]
    if kit[0] == 'C':
        save('groin', RK.groin(ctx)); sp = RK.shoulder_prot(ctx, head, Xj, Nj); save('sprotL', sp)
        sp2 = dict(sp); sp2['v'] = sp['v'] * [-1, 1, 1]; sp2['f'] = sp['f'][:, ::-1]; save('sprotR', sp2)
    print('parts %.1f' % (time.time() - t), flush=True)
if 'helmet' in sys.argv:
    vs = sub(v); hm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis')); hv = vs[hm > .5]; Lm = landmarks(v)
    top = hv[:, 1].max(); hw = np.percentile(np.abs(hv[:, 0]), 99); hl = (hv[:, 2].max() - hv[:, 2].min()) / 2; cz = (hv[:, 2].max() + hv[:, 2].min()) / 2
    hv2 = vs[(np.abs(vs[:, 0]) < .01) & (hm > .3)]; chin_y = Lm['chin_y']; chz = hv2[np.abs(hv2[:, 1] - chin_y) < .015][:, 2].max()
    nh = vert_normals(vs, TRIS_ORIG); sel = hm > .5
    Hm = RK.helmet47(top, hw, hl - .02, cz, (chin_y, chz), vs[sel], nh[sel]); print('helmet %.1f' % (time.time() - t), len(Hm['f']), flush=True); save('helmet', Hm)
COL = dict(emr=[.42, .46, .34], glove=[.2, .19, .17], velcro=[.34, .37, .27], pad=[.25, .27, .2], padhard=[.18, .19, .15], strap=[.12, .12, .1])
for k, p in enumerate(pieces):
    if 'g' in p: Vv, Tt = p['X'], np.concatenate([p['g'].Q[:, [0, 1, 2]], p['g'].Q[:, [0, 2, 3]]])
    else: Vv, Tt = p['V'], p['T']
    np.savez(SP + f'/cl_{k}.npz', v=Vv, f=Tt, c=np.tile(COL[p['mat']], (len(Vv), 1)) * .8); files.append(SP + f'/cl_{k}.npz')
np.savez(SP + '/cl_body.npz', v=sub(v)[VIDX], f=TRIS); files.append(SP + '/cl_body.npz')
cams = sys.argv[-1] if sys.argv[-1].count(',') >= 6 else '-.95,1.62,1.25,0,1.25,.02,30;0,1.3,1.75,0,1.25,0,30;1.45,1.35,.5,0,1.25,0,30;0,1.45,-1.7,0,1.28,0,30;-.45,1.72,.62,0,1.67,.04,26;.55,1.6,-.25,0,1.7,.02,28'
out = SP + '/shots/rk_%s.png' % ''.join(kit)
subprocess.run(['python3', 'render.py', out, '520', '600', cams] + files)
print('done %.1f' % (time.time() - t))
