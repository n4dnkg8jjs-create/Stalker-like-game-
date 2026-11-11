"""dev: gas mask + helmet with goggles + chin harness over the mask/balaclava on one character. python3 dev_mask.py name [bala]"""
import numpy as np, sys, time, subprocess
from mhbuild import *
from skintex import landmarks
from chardefs import *
import ratnik as RK
from sdf import normals
import os

SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
name = sys.argv[1]; t = time.time()
v = shape(CHARS[name]); vs = sub(v); bones, hd, Wf = rig_json(v); Lm = landmarks(v)
used = np.unique(VIDX[TRIS]); files = []
def save(nm, g, pal):
    col = np.asarray(pal)[g['mid']] * np.asarray(g['ao'])[:, None]; np.savez(SP + f'/dm_{nm}.npz', v=g['v'], f=g['f'], c=col * 1.4); files.append(SP + f'/dm_{nm}.npz')
if 'gp5' in sys.argv:
    G = RK.gp5(vs, used, Lm['M'], hd['neck'][1], Lm['mouth'], Lm['eL'], Lm['eR'], seed=3); print('gp5 %.1f' % (time.time() - t), len(G['f']), G['anchors'])
    save('mask', G, [[.33, .35, .3]]); cover = G
elif 'bala' in sys.argv:
    G = RK.balaclava(vs, used, Lm['M'], hd['neck'][1], seed=3); G['mid'] = np.zeros(len(G['v']), int); save('bala', G, [[.2, .22, .16]])
    cover = G
else:
    G = RK.gasmask2(vs, used, Lm['M'], hd['neck'][1], Lm['mouth'], seed=3); print('mask %.1f' % (time.time() - t), len(G['f']), G['anchors'])
    save('mask', G, [[.24, .26, .2], [.25, .55, .3], [.08, .08, .08], [.3, .32, .2]])
    cover = G

def cylm(p, n, r, l, off=0., seg=24):
    p = np.asarray(p); n = np.asarray(n) / np.linalg.norm(n); a = np.cross(n, [0, 1, 0]); a /= np.linalg.norm(a); b = np.cross(n, a)
    th = np.linspace(0, 2 * np.pi, seg, endpoint=False); ring = (np.cos(th)[:, None] * a + np.sin(th)[:, None] * b) * r
    c0 = p + n * off; c1 = c0 + n * l; V = np.concatenate([c0 + ring, c1 + ring, [c0, c1]]); F = []
    for i in range(seg):
        j = (i + 1) % seg; F += [[i, j, seg + j], [i, seg + j, seg + i], [2 * seg, j, i], [2 * seg + 1, seg + i, seg + j]]
    return V, np.array(F)
if 'anchors' in G:
    A = G['anchors']; hv = []
    for k, (r, l) in (dict(eyeL=(.026, .008), eyeR=(.026, .008), valve=(.026, .03)) if 'gp5' in sys.argv else dict(dia=(.031, .012), valve=(.019, .022), filt=(.052, .05))).items():
        V_, F_ = cylm(A[k][0], A[k][1], r, l, -.004); np.savez(SP + f'/dm_hw_{k}.npz', v=V_, f=F_, c=np.tile([.12, .13, .1], (len(V_), 1))); files.append(SP + f'/dm_hw_{k}.npz')
hm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis')); hv = vs[hm > .5]
top = hv[:, 1].max(); hw = np.percentile(np.abs(hv[:, 0]), 99); hl = (hv[:, 2].max() - hv[:, 2].min()) / 2; cz = (hv[:, 2].max() + hv[:, 2].min()) / 2
hv2 = vs[(np.abs(vs[:, 0]) < .01) & (hm > .3)]; chin_y = Lm['chin_y']; chz = hv2[np.abs(hv2[:, 1] - chin_y) < .015][:, 2].max()
nh = vert_normals(vs, TRIS_ORIG); sel = hm > .5
hpath = SP + f'/dm_helm_{name}.npz'
if os.path.exists(hpath) and 'rehelm' not in sys.argv: Hm = np.load(hpath, allow_pickle=True)['g'].item()
else: Hm = RK.helmet47(top, hw, hl - .02, cz, (chin_y, chz), vs[sel], nh[sel]); np.savez(hpath, g=np.array(Hm, dtype=object))
print('helmet %.1f' % (time.time() - t))
gg = Hm.pop('goggles'); anchors = Hm['anchors']
keep = Hm['hz'] == 0; Fk = Hm['f'][keep[Hm['f']].all(1)]
PAL = [[.42, .46, .34], [.3, .34, .23], [.05, .05, .05], [.3, .32, .22], [.25, .22, .12]]
save('helmet', dict(v=Hm['v'], f=Fk, ao=Hm['ao'], mid=Hm['mid']), PAL); save('gog', gg, PAL)
# harness over the cover: its outer vertices plus the skin it does not cover
nC = normals(cover['v'], cover['f']); cv_ = np.zeros(len(cover['v']), bool); cv_[np.unique(cover['f'])] = True
skin_ok = ~cover['covered'] & (np.linalg.norm(vs - vs[sel].mean(0), axis=1) < .2)
nsk = vert_normals(vs, TRIS_ORIG)
SPts = np.concatenate([cover['v'][cv_], vs[skin_ok]]); SN = np.concatenate([nC[cv_], nsk[skin_ok]])
acc = RK.Acc(); RK.chin_harness(acc, anchors, SPts, SN); Hz = acc.out(); save('harn', Hz, PAL)
cov = cover['covered']; Fsk = TRIS_ORIG[~cov[TRIS_ORIG].all(1)]
np.savez(SP + '/dm_head.npz', v=vs, f=Fsk); files.append(SP + '/dm_head.npz')
hcx = Lm['M']; e = lambda d, dist, fov: '%f,%f,%f,%f,%f,%f,%d' % (hcx[0] + d[0] * dist, hcx[1] + d[1] * dist, hcx[2] + d[2] * dist, hcx[0], hcx[1] - .03, hcx[2] - .03, fov)
cams = ';'.join([e((0, .1, 1), .55, 32), e((.7, .05, .7), .55, 32), e((-.8, -.2, .55), .5, 32), e((1, .1, -.2), .55, 34), e((0, -.6, .8), .5, 32), e((-.3, .5, .8), .6, 32)])
subprocess.run(['python3', 'render.py', SP + f'/shots/dm_{name}.png', '520', '520', cams] + files)
print('done %.1f' % (time.time() - t))
