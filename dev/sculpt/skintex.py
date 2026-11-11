"""Paint skin albedo directly in the MakeHuman UV layout (per-texel 3D lookups)."""
import numpy as np
from mhbuild import *
from scipy.ndimage import distance_transform_edt

def raster_attrs(vpos, attrs, N):
    """returns per-texel interpolated attributes (H,W,k) and coverage mask; vpos: split-vertex positions"""
    uvp = UV * [N - 1, N - 1]; uvp[:, 1] = (N - 1) - uvp[:, 1]
    k = attrs.shape[1]; out = np.zeros((N, N, k), np.float32); cov = np.zeros((N, N), bool)
    for t in TRIS:
        p = uvp[t]; x0, y0 = np.floor(p.min(0)).astype(int); x1, y1 = np.ceil(p.max(0)).astype(int)
        xs, ys = np.meshgrid(np.arange(x0, x1 + 1), np.arange(y0, y1 + 1)); q = np.stack([xs.ravel() + .5, ys.ravel() + .5], 1)
        v0 = p[1] - p[0]; v1 = p[2] - p[0]; v2 = q - p[0]
        d00 = v0 @ v0; d01 = v0 @ v1; d11 = v1 @ v1; den = d00 * d11 - d01 * d01
        if abs(den) < 1e-12: continue
        d20 = v2 @ v0; d21 = v2 @ v1
        b1 = (d11 * d20 - d01 * d21) / den; b2 = (d00 * d21 - d01 * d20) / den; b0 = 1 - b1 - b2
        m = (b0 >= -.02) & (b1 >= -.02) & (b2 >= -.02)
        if not m.any(): continue
        X = xs.ravel()[m]; Y = ys.ravel()[m]; ok = (X >= 0) & (X < N) & (Y >= 0) & (Y < N)
        X, Y = X[ok], Y[ok]; B = np.stack([b0[m][ok], b1[m][ok], b2[m][ok]], 1)
        out[Y, X] = B @ attrs[t]; cov[Y, X] = True
    return out, cov

def dilate(img, cov):
    _, (iy, ix) = distance_transform_edt(~cov, return_indices=True)
    return img[iy, ix]

def landmarks(v):
    eL = bone_head_tail(v, 'eye.L')[0]; eR = bone_head_tail(v, 'eye.R')[0]
    M = (eL + eR) / 2
    head_ids = np.where(mh_mask0(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis', 'eye')) > .5)[0]
    hv = v[head_ids]
    near = hv[np.abs(hv[:, 0] - M[0]) < .006]
    nose_tip = near[np.argmax(near[:, 2])]
    chin = near[(near[:, 1] < nose_tip[1] - .04)]; chin = chin[np.argmax(chin[:, 2] - (chin[:, 1] - nose_tip[1]) * 0)] if len(chin) else nose_tip
    mouth = bone_head_tail(v, 'oris01')[0] if 'oris01' in SK['bones'] else nose_tip - [0, .03, 0]
    top = hv[np.argmax(hv[:, 1])]
    return dict(M=M, eL=eL, eR=eR, nose=nose_tip, chin_y=hv[:, 1][hv[:, 2] > M[2] - .03].min(), top=top, mouth=mouth)

def _orth(n, d):
    m = np.cross(n, d); return m / (np.linalg.norm(m, axis=1, keepdims=True) + 1e-9)

def strokes(P, n, d, sa, sc, seed, lo=.52, hi=.74):
    """hair-like streaks: value noise stretched along direction d (per texel), thin across it"""
    d = d - n * (d * n).sum(1, keepdims=True); d /= np.linalg.norm(d, axis=1, keepdims=True) + 1e-9
    m = _orth(n, d)
    q = np.stack([(P * m).sum(1) * sc, (P * d).sum(1) * sa, np.full(len(P), seed * 7.3)], 1)
    return ss(lo, hi, vnoise(q, 1.0))

def paint(v, variant='alive', hair=(.16, .12, .1), N=2048, seed=0, style='buzz', age=.55):
    """returns (albedo, detail) images; detail R = height (bump), G = roughness"""
    v0 = v; v = sub(v)
    c, n = cavity(v)
    lips = mh_mask(('oris',)); lids = mh_mask(('orbicularis',)); headm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis', 'eye', 'tongue'))
    fing3 = mh_mask(tuple(f'finger{i}-3' for i in range(1, 6)))
    e0 = np.zeros(len(V0))
    for sd in 'lr':
        i_, d_ = target(f'ears/{sd}-ear-wing-incr.target'); e0[i_] = np.maximum(e0[i_], (np.linalg.norm(d_, axis=1) > 1e-4) * 1.)
    earv = np.clip(S @ e0, 0, 1)
    import facegen as FG
    _ef, _ev = fit_proxy(v0 * 10, MH + '/eyes/high-poly/high-poly.mhclo'); _ev = _ev * .1
    gao = FG.head_ao(v, _ev, landmarks(v0)['M'])
    A = np.concatenate([v, n, c[:, None], lips[:, None], lids[:, None], headm[:, None], fing3[:, None], earv[:, None], gao[:, None]], 1)[VIDX]
    T, cov = raster_attrs(None, A, N)
    ear = T[..., 11].ravel()
    P = T[..., 0:3].reshape(-1, 3); Nn = T[..., 3:6].reshape(-1, 3); Nn /= np.linalg.norm(Nn, axis=1, keepdims=True) + 1e-9
    cav = T[..., 6].ravel(); lip = T[..., 7].ravel(); lid = T[..., 8].ravel(); hm = T[..., 9].ravel(); nail = T[..., 10].ravel()
    L = landmarks(v0); M = L['M']; ex = abs(L['eL'][0] - M[0])
    q = P - M; x, y, z = q[:, 0], q[:, 1], q[:, 2]; ax = np.abs(x); sx = np.sign(x)
    n1 = fbm(P + seed, 9, 4); n2 = fbm(P + seed, 60, 3); n3 = vnoise(P * 1 + seed, 900)
    G = lambda cx, cy, cz, s: np.exp(-((ax - cx) ** 2 + (y - cy) ** 2 + (z - cz) ** 2) / s)
    nb = L['nose'][1] - M[1]; cy = L['chin_y'] - M[1]; my = L['mouth'][1] - M[1]
    lipm = ss(.55, .85, lip) * hm
    H = np.full(len(P), .5); R = np.full(len(P), .64)
    if variant == 'alive':
        col = np.tile(np.array([.77, .61, .54]), (len(P), 1))
        col *= (0.93 + .12 * n1[:, None]) * (.97 + .06 * n2[:, None]) * (.985 + .03 * n3[:, None])
        # uneven tone: faint blotchy capillary redness and sallow patches so it doesn't read as one plastic colour
        bl = fbm(P + 91, 26, 3); col = col + (np.array([.76, .52, .48]) - col) * (ss(.5, .72, bl) * .28)[:, None]
        col = col + (np.array([.74, .64, .52]) - col) * (ss(.5, .7, fbm(P + 93, 18, 3)) * .22)[:, None]
        # forehead slightly sallow, cheeks / nose tip / ears flushed, eye bags faintly violet
        col = col + (np.array([.82, .66, .52]) - col) * (hm * ss(.01, .04, y) * .5)[:, None]
        red = hm * (G(.045, -.035, .01, .0006) * .55 + G(0, nb + .004, .045, .00012) * .55 + ear * .5 + G(0, my - .025, .03, .0003) * .15)
        red *= .75 + .5 * fbm(P + 21, 120, 2)
        col = col + (np.array([.80, .47, .43]) - col) * np.clip(red, 0, .5)[:, None]
        bags = hm * np.exp(-((ax - ex - .002) ** 2 / .00012 + (y + .014) ** 2 / .00003)) * (z > -.02)
        col = col * (1 - .1 * bags)[:, None] + np.array([.0, -.012, .006]) * bags[:, None]
        col = col + (np.array([.70, .46, .42]) - col) * (lipm * .62)[:, None]
        lidc = hm * np.exp(-((ax - ex) ** 2 / .0003 + (y - .004) ** 2 / .00006))
        col = col + (np.array([.74, .53, .5]) - col) * (lidc * .35)[:, None]
        # eye sockets: the hollow under the brow ridge and the inner corners sit in shadow, which gives the face depth
        sock = hm * np.exp(-((ax - ex + .002) ** 2 / .00022 + (y - .009) ** 2 / .00007)) * (z > -.02)
        col = col * (1 - .2 * sock)[:, None] + np.array([-.01, -.012, -.004]) * sock[:, None]
        inner = hm * np.exp(-((ax - ex + .017) ** 2 / .000012 + (y - .001) ** 2 / .000012))
        col = col + (np.array([.72, .45, .44]) - col) * (inner * .5)[:, None]
        # lip border and the dark line where the lips meet
        mline = hm * np.exp(-((y - my) / .0011) ** 2) * ss(.026, .012, ax) * (z > 0)
        col = col * (1 - .38 * mline)[:, None]
        corner = hm * np.exp(-((ax - .024) ** 2 + (y - my) ** 2) / .000012)
        col = col * (1 - .25 * corner)[:, None]
        # beard shadow + stubble points below a line from the sideburn to the mouth corner
        line = y - (-.014 - (.068 - ax) * 1.05)
        st = ss(.004, -.012, line) * ss(cy - .05, cy - .02, y) * ss(-.02, .0, z + .06) * (1 - lipm) * hm
        st = np.maximum(st, ss(nb - .004, nb - .012, y) * ss(.026, .018, ax) * (1 - lipm) * hm * ss(-.004, .004, y - my - .006))
        st = np.clip(st * (.75 + .5 * fbm(P + 5, 80, 2)), 0, 1)
        dots = ss(.55, .8, vnoise(P + 3, 1.6 * N))
        col = col + (np.array([.44, .43, .46]) * .62 - col) * (st * .2)[:, None]     # soft blue-grey shadow, not a rash of dots
        col = col + (np.array(hair) * 1.1 - col) * (st * dots * .12)[:, None]
        nails = ss(.5, .9, nail)
        col = col + (np.array([.9, .74, .7]) - col) * (nails * .3)[:, None]
        moles = ss(.972, .98, vnoise(P + 77, 260)) * (1 - hm)
        col = col * (1 - .25 * moles)[:, None]
        R = R - .14 * hm * (G(0, .035, .03, .0008) + G(0, nb, .04, .0003)) - .16 * lipm + .06 * st
    else:
        col = np.tile(np.array([.64, .6, .5]), (len(P), 1)) * (0.9 + .18 * n1[:, None]) * (.96 + .08 * n2[:, None])
        bl = fbm(P + 7, 14, 4)
        col = col + (np.array([.42, .33, .34]) - col) * (ss(.52, .7, bl) * .7)[:, None]
        col = col + (np.array([.45, .5, .36]) - col) * (ss(.55, .72, fbm(P + 3, 22, 3)) * .5)[:, None]
        veins = np.exp(-((fbm(P + 11, 35, 3) - .5) / .015) ** 2) * .35
        col = col * (1 - veins[:, None] * np.array([.3, .25, .1]))
        lipm = ss(.25, .6, lip) * hm
        col = col + (np.array([.3, .21, .21]) - col) * (lipm * .8)[:, None]
        col = col * (1 - .45 * hm * np.exp(-((ax - ex) ** 2 + y ** 2) / .0004))[:, None]
        slip = ss(.6, .75, fbm(P + 31, 30, 3))
        R = R + .12 - .25 * slip * (1 - hm * .5)
        H = H + .08 * (fbm(P + 41, 300, 2) - .5)
    # ---- scalp ----
    jit = (fbm(P + 9, 260, 2) - .5) * .008
    edge = .073 - .008 * np.cos(np.clip(ax / .05, 0, 1) * np.pi) + jit * .5
    hl_front = ss(edge - .007, edge + .009, y + np.maximum(0, -z) * .3)
    side = ss(-.002, .02, y + np.maximum(0, -z - .01) * .55 + jit) * ss(.04, .0, z)
    burn = ss(.064, .07, ax) * ss(-.03, -.012, y + jit) * ss(-.0, -.02, z)
    nape = ss(-.075, -.06, y + jit)
    scalp = np.clip(np.maximum(np.maximum(hl_front, side), burn) * hm * nape * (1 - ear), 0, 1)
    if style == 'buzz':
        sdots = (vnoise(P + 13, 1.6 * N) - .5) * .16 + (fbm(P + 17, 40, 2) - .5) * .12    # fine, even stubble on the scalp
        a = scalp * (.84 + sdots) * (.92 if variant == 'alive' else .5)
        col = col * (1 - .1 * scalp)[:, None]
        col = col + (np.array(hair) * .72 - col) * np.clip(a, 0, 1)[:, None]
        R = R + .12 * scalp
    else:
        hc = np.array(hair) * (.75 + .5 * vnoise(P, 1800))[:, None]
        col = col + (hc - col) * (scalp * (.8 if variant == 'alive' else .5))[:, None]
    # ---- eyebrows: hair strokes following the brow flow ----
    t = np.clip((ax - .01) / .045, 0, 1)
    d = np.stack([sx * (.25 + .9 * t), .9 - 1.3 * t, np.zeros_like(t)], 1)
    by = .0112 + .005 * np.sin(t * np.pi) - np.maximum(0, ax - .035) * .2   # sits on the brow ridge, just above the orbit
    w = (.0052 - .0026 * t) * (1 + .25 * (fbm(P + 19, 400, 2) - .5))
    band = np.exp(-((y - by) / w) ** 2 * 2.2) * ss(.007, .013, ax) * ss(.058, .049, ax) * ss(-.012, -.004, z) * (np.abs(y) < .05)
    sk = np.maximum(strokes(P, Nn, d, 380, 3200, 1), strokes(P, Nn, d + np.array([0, .25, 0]), 420, 2900, 2) * .8)
    brow = band * (.68 + .32 * sk)          # even, continuous brow tone under the hairs
    col = col + (np.array(hair) * .7 - col) * (np.clip(brow * 1.1, 0, 1) * (.88 if variant == 'alive' else .6))[:, None]
    R = R + .08 * band
    # ---- micro relief: pores, grain, wrinkles ----
    pore_d = (.45 + .55 * hm * (G(.03, -.025, .03, .0015) + G(0, nb, .04, .0004) + G(0, .04, .03, .0015)).clip(0, 1)) * (1 - lipm)
    pn = vnoise(P + 51, min(1700, .8 * N))
    H = H - .12 * ss(.3, .12, pn) * pore_d + (vnoise(P + 53, 1.5 * N) - .5) * .04
    fh = hm * ss(.022, .03, y) * ss(.066, .055, y) * ss(.05, .035, ax) * (z > 0)
    fl = np.cos((y + (fbm(P + 57, 60, 2) - .5) * .006) * 2 * np.pi / .0085)
    H = H - fh * ss(.7, 1, fl) * (.01 + .07 * age ** 2)
    cr = hm * np.exp(-((ax - ex - .024) ** 2 + (y + .002) ** 2) / .00008)
    ang = np.arctan2(y + .002, ax - ex - .012)
    H = H - cr * ss(.75, 1, np.cos(ang * 16 + fbm(P + 59, 200, 1) * 3)) * (.01 + .08 * age ** 2)
    lipc = lipm * ss(.6, 1, np.cos(x * 2 * np.pi / .0021 + fbm(P + 61, 300, 1) * 4))
    H = H - .14 * lipc
    H = H - .12 * ss(.003, .012, cav * 1000) * 0
    R = np.clip(R, .25, .95)
    ao = np.clip(1 - cav * 90, .7, 1.04)
    col = col * ao[:, None]
    # ---- geometric ambient occlusion (depth-map AO baked on the head); stored in the detail map's blue channel and
    #      applied only to indirect light in the shader, so lit faces keep their colour and the shading stays soft ----
    gA = np.clip(T[..., 12].ravel(), 0, 1)
    fao = .3 + .7 * gA ** .85
    col = col * (.95 + .05 * gA)[:, None]
    img = np.clip(col.reshape(N, N, 3), 0, 1); img = dilate(img, cov)
    det = np.stack([np.clip(H, 0, 1), R, fao], 1).reshape(N, N, 3); det = dilate(det, cov)
    return Image.fromarray((img * 255).astype(np.uint8)), Image.fromarray((det * 255).astype(np.uint8))
