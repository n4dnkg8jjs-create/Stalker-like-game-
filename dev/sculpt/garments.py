"""Outfit definitions: ease profiles and fold patterns for the Ratnik uniform and the civilian clothes."""
import numpy as np
from clothes import *

def arm_coords(X0, W, head, side):
    """per vertex: signed distance from the elbow along the arm, angle around the arm (0 = front), arm mask"""
    sh, el, wr = head['sh' + side], head['el' + side], head['wr' + side]
    su, thu, ru, Lu, du, fu, sdu = limb(X0, sh, el)
    sf, thf, rf, Lf, df, ff, sdf = limb(X0, el, wr)
    names = np.array(GAME_BONES)[W.argmax(1)]
    upper = np.array([n == 'sh' + side for n in names]); lower = np.array([n in ('el' + side, 'wr' + side) for n in names])
    se = np.where(upper, su - Lu, sf); th = np.where(upper, thu, thf)
    return se, th, upper | lower, Lu, Lf

def leg_coords(X0, W, head, side):
    hp, kn, an = head['hp' + side], head['kn' + side], head['an' + side]
    su, thu, ru, Lu, *_ = limb(X0, hp, kn); sl, thl, rl, Ll, *_ = limb(X0, kn, an)
    names = np.array(GAME_BONES)[W.argmax(1)]
    upper = np.array([n == 'hp' + side for n in names]); lower = np.array([n in ('kn' + side, 'an' + side) for n in names])
    sk = np.where(upper, su - Lu, sl); th = np.where(upper, thu, thl)
    # mirror angles so +theta is always the outer side of the leg
    if side == 'L': th = -th
    return sk, th, upper | lower, Lu, Ll

def jacket_spec(head, W, X0, loose=1.0):
    y = X0[:, 1]; ease = np.full(len(X0), .02 * loose)
    sleeve = np.zeros(len(X0), bool); SE = np.zeros(len(X0)); TH = np.zeros(len(X0)); LF = 0
    for s in 'LR':
        se, th, m, Lu, Lf = arm_coords(X0, W, head, s); sleeve |= m; SE[m] = se[m]; TH[m] = th[m]; LF = Lf
    ease[sleeve] = (.017 + .012 * ss(-.15, .1, SE) - .012 * ss(LF - .07, LF - .02, SE))[sleeve] * loose
    hem = y < head['hips'][1] + .05
    ease[~sleeve] += (.012 * ss(head['hips'][1] + .12, head['hips'][1] - .05, y))[~sleeve] * loose
    def folds(X0, X, N):
        n1 = fbm(X0 * 1 + 3, 18, 3) - .5; n2 = fbm(X0 + 7, 40, 2) - .5
        d = np.zeros(len(X0))
        # elbow: compression rings, strongest on the inside of the bend
        E = np.exp(-(SE / .075) ** 2) * (.45 + .55 * (.5 + .5 * np.cos(TH)))
        d += sleeve * E * .009 * ridge(2 * np.pi * SE / .034 + 1.4 * np.sin(TH + .6) + 6 * n1)
        # bunching above the cuff
        Ew = ss(LF - .16, LF - .1, SE) * ss(LF - .015, LF - .05, SE)
        d += sleeve * Ew * .007 * ridge(2 * np.pi * SE / .026 + 1.8 * np.sin(1.5 * TH) + 5 * n2)
        # long twisting drape on the upper arm
        Eu = ss(-.05, -.12, SE) * ss(-.32, -.22, SE)
        d += sleeve * Eu * .004 * ridge(2 * np.pi * (SE * .8 + TH * .045 * 1.4) / .07 + 4 * n1, 1.2)
        # torso: soft horizontal folds at the small of the back, vertical drape at the hem
        tor = ~sleeve; zb = X0[:, 2] < head['spine'][2]
        Eb = np.exp(-((y - head['spine'][1] + .02) / .07) ** 2) * zb
        d += tor * Eb * .006 * ridge(2 * np.pi * y / .035 + 2 * np.sin(X0[:, 0] * 30) + 5 * n2)
        Eh = ss(head['hips'][1] + .06, head['hips'][1] - .04, y)
        ang = np.arctan2(X0[:, 0], X0[:, 2] - head['spine'][2])
        d += tor * Eh * .008 * ridge(ang * 9 + 3 * n1, 1.3)
        # armpit: folds radiating from the underarm
        for s in 'LR':
            ap = head['sh' + s] + np.array([0, -.07, 0]); r = np.linalg.norm(X0 - ap, axis=1)
            Ea = np.exp(-(r / .09) ** 2) * (r > .02)
            dirv = X0 - ap; ang2 = np.arctan2(dirv[:, 2], dirv[:, 1])
            d += Ea * .006 * ridge(ang2 * 7 + 3 * n2)
        d += .002 * n1 + .0015 * n2
        return d
    return ease, folds, dict(sleeve=sleeve, SE=SE, TH=TH, LF=LF)

def trouser_spec(head, W, X0, boot_top, loose=1.0, tuck=True):
    y = X0[:, 1]; ease = np.full(len(X0), .012 * loose)
    leg = np.zeros(len(X0), bool); SK = np.zeros(len(X0)); TH = np.zeros(len(X0))
    for s in 'LR':
        sk, th, m, Lu, Ll = leg_coords(X0, W, head, s); leg |= m; SK[m] = sk[m]; TH[m] = th[m]
    # baggy legs: wider toward the knee and shin
    ease += (.014 * ss(head['hips'][1], head['hips'][1] - .25, y) + .01 * ss(.6, .35, y)) * loose
    if tuck:
        bt = boot_top
        ease += .022 * np.exp(-((y - bt - .035) / .03) ** 2) * loose        # blousing over the boot
        ease = np.where(y < bt - .005, .004, ease)                          # tucked inside the boot shaft
    ease = np.where(y > head['hips'][1] + .03, .007, ease)                 # belted waist
    def folds(X0, X, N):
        n1 = fbm(X0 + 11, 16, 3) - .5; n2 = fbm(X0 + 5, 35, 2) - .5
        d = np.zeros(len(X0))
        # knee: compression rings behind, a stretched bag in front
        back = .5 - .5 * np.cos(TH - 0); front = .5 + .5 * np.cos(TH)
        Ek = np.exp(-((SK + .01) / .08) ** 2)
        d += leg * Ek * (.006 + .004 * back) * ridge(2 * np.pi * SK / .036 + 1.5 * np.sin(TH * 1.3) + 6 * n1)
        d += leg * np.exp(-((SK + .02) / .06) ** 2) * front * .006
        # drag folds from the crotch down the inner/front thigh
        Et = ss(-.45, -.3, SK) * ss(-.05, -.18, SK)
        d += leg * Et * .005 * ridge(2 * np.pi * (SK * .7 - TH * .05) / .075 + 4 * n2, 1.3)
        if tuck:
            Eb = np.exp(-((y - boot_top - .035) / .035) ** 2)
            d += leg * Eb * (.008 * ridge(2 * np.pi * y / .021 + 1.6 * np.sin(3 * TH) + 6 * n1) + .005 * ridge(TH * 9 + 4 * n2))
        d += .0025 * n1 + .0015 * n2
        return d
    return ease, folds, dict(leg=leg, SK=SK, TH=TH)

# ---------------------------------------------------------------- pieces
def theta_of(a, b, p):
    _, th, *_ = limb(p[None], a, b); return float(th[0])

def collar(g, X, head, height=.034, flare=.006, open_front=.35, rings=6):
    """stand collar grown from the jacket's neck opening, open at the front"""
    L = max(g.loops, key=lambda L: X[L, 1].mean()); P = X[L]; c = np.array([0, P[:, 1].mean(), P[:, 2].mean()])
    o = P - c; o[:, 1] = 0; o /= np.linalg.norm(o, axis=1, keepdims=True)
    ang = np.arctan2(o[:, 0], o[:, 2]); hgt = height * (.35 + .65 * ss(open_front * .4, open_front, np.abs(ang)))
    m = len(L); V = []; Wt = []; U = []
    t = np.linspace(0, 1, rings)
    for k, tk in enumerate(t):
        V.append(P + np.array([0, 1., 0]) * (hgt * tk)[:, None] + o * (flare * tk ** 1.5 + .002))
    for k, tk in enumerate(t[::-1]):     # inner face back down (thickness)
        V.append(P + np.array([0, 1., 0]) * (hgt * tk)[:, None] + o * (flare * tk ** 1.5 - .0025))
    V = np.concatenate(V); R2 = 2 * rings
    Wn = g.W[L]; Wneck = np.zeros_like(Wn); Wneck[:, BI['neck']] = 1
    for k in range(R2):
        tk = t[k] if k < rings else t[R2 - 1 - k]
        Wt.append(Wn * (1 - .6 * tk) + Wneck * .6 * tk); U.append(g.uv_unsplit[L] + np.array([0, .004 * tk]))
    tris = []
    for k in range(R2 - 1):
        for i in range(m):
            a0, b0 = k * m + i, k * m + (i + 1) % m; c0, d0 = a0 + m, b0 + m
            tris += [[a0, b0, d0], [a0, d0, c0]]
    return V, np.array(tris), np.concatenate(Wt), np.concatenate(U)

def glove_tips(g, X, body):
    """gloves have no fingernails: the cloth runs smooth over the end of each finger (the draped surface keeps the nail's
    ridge and groove). Laplacian smoothing on the last two finger segments, kept just outside the skin."""
    from mhbuild import GAME_BONES
    names = [n for n in GAME_BONES if n[-1] in '23' and n[:-2] in ('idx', 'mid', 'rng', 'pnk', 'th')]
    cols = [GAME_BONES.index(n) for n in names]
    w = np.asarray(g.W[:, cols].sum(1)).ravel(); dist = np.asarray(g.W[:, [GAME_BONES.index(n) for n in names if n[-1] == '3']].sum(1)).ravel()
    k = np.clip(w, 0, 1) * (.35 + .65 * np.clip(dist * 1.5, 0, 1))
    Q = g.Q; e = np.concatenate([Q[:, [0, 1]], Q[:, [1, 2]], Q[:, [2, 3]], Q[:, [3, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    import scipy.sparse as sp
    A = sp.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(len(X), len(X))).tocsr(); A.data[:] = 1
    deg = np.maximum(np.asarray(A.sum(1)).ravel(), 1)
    Y = X.copy()
    for it in range(14):
        L = (A @ Y) / deg[:, None] - Y
        Y = Y + .5 * k[:, None] * L
    # keep it outside the skin by the original clearance
    d0, i0 = body.kd.query(X); d1, i1 = body.kd.query(Y)
    nrm = body.N[i1]; pen = ((Y - body.P[i1]) * nrm).sum(1)
    Y = Y + nrm * np.maximum(0, .0016 - pen)[:, None] * (k[:, None] > 0)
    return Y

def unsplit_uv(g):
    uvu = np.zeros((g.n, 2)); uvu[g.vidx] = g.uv; return uvu

def ratnik(v, body, R, ref_cache={}):
    """Ratnik combat uniform: jacket (+collar, sleeve pockets), trousers (+cargo pockets, knee pads), gloves"""
    head, _ = rig(v)
    jk, tr, gl = _g('jacket', R), _g('trousers', R), _g('gloves', R, need=4)
    pieces = []
    e, fo, ti = trouser_spec(head, tr.W, tr.S @ v, R['boot_top'])
    Xt = tr.drape(v, body, e, .004, folds=fo)
    pieces.append(dict(name='trousers', mat='emr', X=Xt, g=tr))
    b2 = Body.__new__(Body); b2.P = np.concatenate([body.P, Xt]); b2.N = np.concatenate([body.N, quad_normals(Xt, tr.Q)]); b2.kd = cKDTree(b2.P)
    e, fo, ji = jacket_spec(head, jk.W, jk.S @ v)
    Xj = jk.drape(v, b2, e, .006, folds=fo, smooth=45, hang=dict(cx=0, cz=head['spine'][2], y_top=head['spine'][1] + .2, mask=~ji['sleeve'], taper=.06))
    pieces.append(dict(name='jacket', mat='emr', X=Xj, g=jk))
    Xg = gl.drape(v, body, np.full(gl.n, .0022), .0018, iters=0, maxbridge=0, smooth=2)
    Xg = glove_tips(gl, Xg, body)
    pieces.append(dict(name='gloves', mat='glove', X=Xg, g=gl))
    # stand collar
    V, T_, W_, U_ = collar(jk, Xj, head); pieces.append(dict(name='collar', mat='emr', V=V, T=T_, W=W_, U=U_))
    # sleeve pockets with flaps, cargo pockets, knee pads + straps
    for s in 'LR':
        sh, el = head['sh' + s], head['el' + s]
        out = theta_of(sh, el, (sh + el) / 2 + np.array([np.sign(sh[0]) * .2, .05, 0]))
        Lu = np.linalg.norm(el - sh)
        sel = (np.array(GAME_BONES)[jk.W.argmax(1)] == 'sh' + s)
        V, T_, W_, U_ = patch(Xj, jk.W, jk.uv_unsplit, sh, el, np.array([0, 0, 1.]), (Lu * .3, Lu * .72), (out - .9, out + .9), .003, .004, nu=12, nv=10, sel=sel)
        pieces.append(dict(name='slvpocket' + s, mat='emr', V=V, T=T_, W=W_, U=U_))
        V, T_, W_, U_ = patch(Xj, jk.W, jk.uv_unsplit, sh, el, np.array([0, 0, 1.]), (Lu * .27, Lu * .43), (out - .98, out + .98), .0085, .002, nu=12, nv=5, sel=sel)
        pieces.append(dict(name='slvflap' + s, mat='emr', V=V, T=T_, W=W_, U=U_))
        V, T_, W_, U_ = patch(Xj, jk.W, jk.uv_unsplit, sh, el, np.array([0, 0, 1.]), (Lu * .45, Lu * .66), (out - .55, out + .55), .0105, .0, nu=6, nv=5, wall=True, sel=sel)
        pieces.append(dict(name='velcro' + s, mat='velcro', V=V, T=T_, W=W_, U=U_))
        hp, kn, an = head['hp' + s], head['kn' + s], head['an' + s]
        out = theta_of(hp, kn, (hp + kn) / 2 + np.array([np.sign(hp[0]) * .25, 0, .17]))
        Lt = np.linalg.norm(kn - hp)
        selt = np.array([n == 'hp' + s for n in np.array(GAME_BONES)[tr.W.argmax(1)]])
        V, T_, W_, U_ = patch(Xt, tr.W, tr.uv_unsplit, hp, kn, np.array([0, 0, 1.]), (Lt * .42, Lt * .82), (out - .75, out + .75), .004, .009, nu=12, nv=12, sel=selt)
        pieces.append(dict(name='cargo' + s, mat='emr', V=V, T=T_, W=W_, U=U_))
        V, T_, W_, U_ = patch(Xt, tr.W, tr.uv_unsplit, hp, kn, np.array([0, 0, 1.]), (Lt * .38, Lt * .52), (out - .82, out + .82), .0135, .002, nu=12, nv=5, sel=selt)
        pieces.append(dict(name='cargoflap' + s, mat='emr', V=V, T=T_, W=W_, U=U_))
        selk = np.array([n in ('hp' + s, 'kn' + s) for n in np.array(GAME_BONES)[tr.W.argmax(1)]])
        V, T_, W_, U_ = patch(Xt, tr.W, tr.uv_unsplit, kn, an, np.array([0, 0, 1.]), (-.075, .105), (-1.05, 1.05), .009, .012, nu=14, nv=14, round_=3, sel=selk)
        pieces.append(dict(name='kneepad' + s, mat='pad', V=V, T=T_, W=W_, U=U_))
        V, T_, W_, U_ = patch(Xt, tr.W, tr.uv_unsplit, kn, an, np.array([0, 0, 1.]), (-.02, .05), (-.62, .62), .0215, .007, nu=10, nv=6, round_=3, sel=selk)
        pieces.append(dict(name='kneecap' + s, mat='padhard', V=V, T=T_, W=W_, U=U_))
        for s0 in (-.055, .085):
            V, T_, W_, U_ = band(Xt, tr.W, tr.uv_unsplit, kn, an, np.array([0, 0, 1.]), s0, .022, .004, sel=selk)
            pieces.append(dict(name=f'strap{s}{s0}', mat='strap', V=V, T=T_, W=W_, U=U_))
    return pieces

GCACHE = {}
def _g(name, R, need=3):
    if name not in GCACHE:
        g = Garment(name, R[name], need=need); g.uv_unsplit = unsplit_uv(g); GCACHE[name] = g
    return GCACHE[name]

def telogreika(v, body, R, valenki_top=.4):
    """quilted padded jacket, baggy cotton trousers tucked into valenki"""
    head, _ = rig(v); jk = _g('jacket', R); tr = _g('trousers', R)
    e, fo, ti = trouser_spec(head, tr.W, tr.S @ v, valenki_top, loose=1.3)
    Xt = tr.drape(v, body, e, .004, folds=fo)
    b2 = Body.__new__(Body); b2.P = np.concatenate([body.P, Xt]); b2.N = np.concatenate([body.N, quad_normals(Xt, tr.Q)]); b2.kd = cKDTree(b2.P)
    e, fo0, ji = jacket_spec(head, jk.W, jk.S @ v, loose=1.45)
    sl, SE = ji['sleeve'], ji['SE']
    def fo(X0, X, N):
        y = X0[:, 1]
        q = np.where(sl, ridge(2 * np.pi * SE / .05, .5), ridge(2 * np.pi * y / .055, .5))       # quilted channels
        return fo0(X0, X, N) * .6 + .007 * q
    Xj = jk.drape(v, b2, e, .01, folds=fo, smooth=50, hang=dict(cx=0, cz=head['spine'][2], y_top=head['spine'][1] + .22, mask=~sl, taper=.04))
    pieces = [dict(name='trousers', mat='cloth', X=Xt, g=tr), dict(name='jacket', mat='quilt', X=Xj, g=jk)]
    V, T_, W_, U_ = collar(jk, Xj, head, height=.05, flare=.035, open_front=.7)
    pieces.append(dict(name='collar', mat='quilt', V=V, T=T_, W=W_, U=U_))
    return pieces

def plaid(v, body, R, boot_top=None):
    """flannel shirt with rolled sleeves, worn work trousers tucked into old boots"""
    head, _ = rig(v); sh = _g('shirt', R); tr = _g('trousers', R)
    e, fo, ti = trouser_spec(head, tr.W, tr.S @ v, boot_top or R['boot_top'], loose=1.15)
    Xt = tr.drape(v, body, e, .004, folds=fo)
    b2 = Body.__new__(Body); b2.P = np.concatenate([body.P, Xt]); b2.N = np.concatenate([body.N, quad_normals(Xt, tr.Q)]); b2.kd = cKDTree(b2.P)
    e, fo, ji = jacket_spec(head, sh.W, sh.S @ v, loose=.8)
    Xs = sh.drape(v, b2, e, .005, folds=fo, smooth=40, hang=dict(cx=0, cz=head['spine'][2], y_top=head['spine'][1] + .18, mask=~ji['sleeve'], taper=.05))
    pieces = [dict(name='trousers', mat='cloth', X=Xt, g=tr), dict(name='shirt', mat='plaid', X=Xs, g=sh)]
    V, T_, W_, U_ = collar(sh, Xs, head, height=.03, flare=.03, open_front=.6)
    pieces.append(dict(name='collar', mat='plaid', V=V, T=T_, W=W_, U=U_))
    for s in 'LR':
        el, wr = head['el' + s], head['wr' + s]; Lf = np.linalg.norm(wr - el)
        selk = np.array([n in ('el' + s, 'sh' + s) for n in np.array(GAME_BONES)[sh.W.argmax(1)]])
        V, T_, W_, U_ = band(Xs, sh.W, sh.uv_unsplit, el, wr, np.array([0, 0, 1.]), Lf * .26, .05, .008, sel=selk)
        pieces.append(dict(name='roll' + s, mat='plaid', V=V, T=T_, W=W_, U=U_))
    return pieces
