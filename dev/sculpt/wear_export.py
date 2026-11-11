"""Build wardrobe + gear for every character; shared topology, per-character positions."""
import numpy as np, os, time
from garments import *
from outfits import *
import gear as GEAR
import ratnik as RK
from skintex import landmarks
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
OUTFIT_OF = {'player': 'ratnik', 'guard1': 'ratnik', 'guard2': 'ratnik', 'patrol': 'ratnik', 'guard3': 'ratnik', 'guard4': 'ratnik', 'guard5': 'ratnik', 'driver': 'ratnik', 'oldman': 'telogreika', 'plaid': 'plaid'}
BUILD = {'ratnik': ratnik, 'telogreika': telogreika, 'plaid': plaid}
BFV = np.unique(BF)

def leg_centre(v, side, y):
    P = v[BFV]; m = (np.sign(P[:, 0]) == (-1 if side == 'L' else 1)) & (np.abs(P[:, 1] - y) < .035) & (np.abs(P[:, 0]) > .08)
    q = P[m]; return (q.max(0) + q.min(0)) / 2

def foot_len(v, side):
    P = v[BFV]; m = DOM[BFV] == 'an' + side; return np.ptp(P[m][:, 2])

def head_dims(v):
    vs = sub(v); hm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis'))
    hv = vs[hm > .5]; Lm = landmarks(v)
    top = hv[:, 1].max(); hw = np.percentile(np.abs(hv[:, 0]), 99); hl = (hv[:, 2].max() - hv[:, 2].min()) / 2; cz = (hv[:, 2].max() + hv[:, 2].min()) / 2
    hv2 = vs[(np.abs(vs[:, 0]) < .01) & (hm > .3)]; chin_y = Lm['chin_y']; chz = hv2[np.abs(hv2[:, 1] - chin_y) < .015][:, 2].max()
    return dict(top=top, hw=hw, hl=hl, cz=cz, chin=(chin_y, chz)), vs, hm

def torso_dims(v, head):
    P = v[BFV]; ok = np.isin(DOM[BFV], ['hips', 'spine', 'neck']); y = head['spine'][1] + .2
    q = P[ok & (np.abs(P[:, 1] - y) < .02)]; mid = q[np.abs(q[:, 0]) < .05]
    return dict(hw=np.abs(q[:, 0]).max(), front=mid[:, 2].max(), back=mid[:, 2].min(), len=head['neck'][1] - head['hips'][1])

def build_gear(vref, R, jacket_X, jacket_N):
    head, _ = rig(vref); out = {}; t = time.time()
    P = vref[BFV]; ok = np.isin(DOM[BFV], ['hips', 'spine', 'neck'])
    hd, vs, hm = head_dims(vref); nh = vert_normals(vs, TRIS_ORIG); sel = hm > .5
    makers = {'boot': lambda: GEAR.boot(head['anL'], leg_centre(vref, 'L', .255), side=1),
              'valenki': lambda: GEAR.boot(head['anL'], leg_centre(vref, 'L', .40), top_y=.40, side=1, lace=False, shaft_r=(.062, .066), lug=False, pad=False, sole_h=.008),
              'helmet': lambda: RK.helmet47(hd['top'], hd['hw'], hd['hl'] - .02, hd['cz'], hd['chin'], vs[sel], nh[sel])}
    for k, fn in makers.items():
        path = SP + f'/gear_{k}.npz'
        if os.path.exists(path): out[k] = np.load(path, allow_pickle=True)['g'].item(); continue
        out[k] = fn(); np.savez(path, g=np.array(out[k], dtype=object)); print(k, '%.0f' % (time.time() - t), flush=True)
    if 'goggles' in out['helmet']: out['goggles'] = out['helmet'].pop('goggles')
    # 6B45 kit: the vest and every add-on part are built together (they share the vest's distance field)
    vk = ('vest', 'pouches', 'groin', 'sprot', 'gren2', 'gren1', 'tq')
    if all(os.path.exists(SP + f'/gear_{k}.npz') for k in vk):
        for k in vk: out[k] = np.load(SP + f'/gear_{k}.npz', allow_pickle=True)['g'].item()
    else:
        V, ctx = RK.vest_kit(P, ok, head, jacket_X, jacket_N)
        parts = dict(vest=V, pouches=RK.pouches(ctx), groin=RK.groin(ctx), sprot=RK.shoulder_prot(ctx, head, jacket_X, jacket_N),
                     gren2=RK.grenade_pouches(ctx, (.04, .112), 3), gren1=RK.grenade_pouches(ctx, (-.07,), 4), tq=RK.tourniquet(ctx, -.07))
        for k in vk: out[k] = parts[k]; np.savez(SP + f'/gear_{k}.npz', g=np.array(parts[k], dtype=object))
        print('6B45 kit %.0f' % (time.time() - t), {k: len(parts[k]['v']) for k in vk}, flush=True)
    return out

def fit_boot(g, vref, v, side):
    hr, _ = rig(vref); hc, _ = rig(v)
    a_r = hr['anL'] * [1, 0, 1]; a_c = hc['an' + side] * [1, 0, 1]
    s = foot_len(v, side) / foot_len(vref, 'L')
    X = g['v'].copy()
    if side == 'R': X[:, 0] = -X[:, 0]; a_r = a_r * [-1, 1, 1]
    fit_boot.aff = [list(map(float, a_r)), list(map(float, a_c)), [float(s)] * 3]
    return a_c + (X - a_r) * s

def fit_affine(X, o_r, o_c, sc): return o_c + (X - o_r) * np.asarray(sc)

def build_all(CHARS):
    vref = shape(CHARS['player']); R = reference(vref)
    shared = {}; per = {}
    for name, P in CHARS.items():
        t = time.time(); v = shape(P); body = Body(v); o = OUTFIT_OF[name]
        pcs = pieces_to_mesh(BUILD[o](v, body, R))
        if o not in shared:
            # AO: fine cavities (cavity) times large-scale occlusion against every piece of the outfit and the body under it
            # (armpits, crotch, under the collar, behind pockets and pads, inside folds)
            import facegen as FG
            vsb = sub(v); occ = np.concatenate([p['X'] for p in pcs] + [vsb[np.unique(VIDX[TRIS])]])
            def vn(X, T_):
                fn = np.cross(X[T_[:, 1]] - X[T_[:, 0]], X[T_[:, 2]] - X[T_[:, 0]]); n = np.zeros_like(X)
                for k in range(3): np.add.at(n, T_[:, k], fn)
                return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
            aos = []
            for p in pcs:
                T_ = p['vidx'][p['tris']]; nn = vn(p['X'], T_)
                da = FG.depth_ao(p['X'], nn, occ, n_dir=64, px=.005, bias=.006, ctr=np.array([0, .95, 0.]), rad=1.05)
                aos.append(cavity_ao(p['X'], T_) * (.42 + .58 * np.clip(da, 0, 1) ** .8))
            shared[o] = [dict(name=p['name'], mat=p['mat'], vidx=p['vidx'], uv=p['uv'], tris=p['tris'], W=p['W'], ao=a) for p, a in zip(pcs, aos)]
        per[name] = dict(outfit=o, pos={p['name']: p['X'] for p in pcs})
        if name == 'player':
            jk = [p for p in pcs if p['name'] == 'jacket'][0]
            g = GCACHE['jacket']; Xj = jk['X'][:g.n]; Nj = quad_normals(Xj, g.Q)
            gear = build_gear(vref, R, Xj, Nj)
        print(name, o, '%.1fs' % (time.time() - t))
    # per-character gear fits
    hr, _ = rig(vref); tr_ = torso_dims(vref, hr); hdr, _, _ = head_dims(vref)
    for name, P in CHARS.items():
        v = shape(P); hc, _ = rig(v); tc = torso_dims(v, hc); hdc, _, _ = head_dims(v)
        boot = 'valenki' if per[name]['outfit'] == 'telogreika' else 'boot'
        g = {}
        aff = {}
        g['bootL'] = fit_boot(gear[boot], vref, v, 'L'); aff['bootL'] = fit_boot.aff; g['bootR'] = fit_boot(gear[boot], vref, v, 'R'); aff['bootR'] = fit_boot.aff; g['bootKind'] = boot
        sx = (tc['hw'] + .03) / (tr_['hw'] + .03); sz = (tc['front'] - tc['back'] + .06) / (tr_['front'] - tr_['back'] + .06); sy = tc['len'] / tr_['len']
        o_r = np.array([0, hr['spine'][1], (tr_['front'] + tr_['back']) / 2]); o_c = np.array([0, hc['spine'][1], (tc['front'] + tc['back']) / 2])
        g['vest'] = fit_affine(gear['vest']['v'], o_r, o_c, (sx, sy, sz))
        aff['vest'] = [list(map(float, o_r)), list(map(float, o_c)), [float(sx), float(sy), float(sz)]]
        fl = gear['vest']['flag']; g['flag'] = list(fit_affine(np.array(fl[:3]), o_r, o_c, (sx, sy, sz))) + [fl[3]]
        for k in ('pouches', 'groin', 'gren2', 'gren1', 'tq'): aff[k] = aff['vest']
        g['groinPivot'] = [float(x) for x in fit_affine(np.array(gear['groin']['pivot']), o_r, o_c, (sx, sy, sz))]
        la = np.linalg.norm(hc['elL'] - hc['shL']) / np.linalg.norm(hr['elL'] - hr['shL'])
        aff['sprotL'] = [list(map(float, hr['shL'])), list(map(float, hc['shL'])), [float(la)] * 3]
        aff['sprotR'] = [list(map(float, hr['shL'] * [-1, 1, 1])), list(map(float, hc['shR'])), [float(la)] * 3]
        hs = (hdc['hw'] / hdr['hw'], (hdc['top'] - hdc['chin'][0]) / (hdr['top'] - hdr['chin'][0]), hdc['hl'] / hdr['hl'])
        g['helmet'] = fit_affine(gear['helmet']['v'], np.array([0, hdr['top'], hdr['cz']]), np.array([0, hdc['top'], hdc['cz']]), hs)
        aff['helmet'] = [[0, float(hdr['top']), float(hdr['cz'])], [0, float(hdc['top']), float(hdc['cz'])], [float(x) for x in hs]]
        g['aff'] = aff
        per[name]['gear'] = g
    # skin hidden under each outfit (base-vertex masks, eroded one ring so skin runs under hems)
    A = adjacency(BF, len(V0))
    hide = {}
    legdom = np.array([d.startswith(('hp', 'kn', 'an')) for d in DOM])
    for o in shared:
        if o == 'ratnik': cov = R['jacket'] | R['trousers'] | R['gloves'] | (legdom & (vref[:, 1] < R['boot_top'] - .01))
        elif o == 'telogreika': cov = R['jacket'] | R['trousers'] | (legdom & (vref[:, 1] < .38))
        else: cov = R['shirt'] | R['trousers'] | (legdom & (vref[:, 1] < R['boot_top'] - .01))
        cov = cov & (np.asarray((A @ (~cov).astype(float))).ravel() == 0)
        cs = np.zeros(NVS, bool); cs[:len(V0)] = cov
        hide[o] = cs[VIDX][TRIS].all(1)
    return shared, per, gear, hide
