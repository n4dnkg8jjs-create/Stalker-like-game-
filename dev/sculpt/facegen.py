"""Face life: geometric ambient occlusion, eyelid blink / squint morphs, expression morphs from MakeHuman targets."""
import numpy as np
from mhbuild import *
from scipy.spatial import cKDTree

# ---------------- ambient occlusion by depth maps ----------------
def fib_dirs(n):
    i = np.arange(n) + .5; phi = np.arccos(1 - 2 * i / n); th = np.pi * (1 + 5 ** .5) * i
    return np.stack([np.cos(th) * np.sin(phi), np.cos(phi), np.sin(th) * np.sin(phi)], 1)

def depth_ao(P, N, occ, n_dir=128, px=.0022, bias=.0035, ctr=None, rad=.26):
    """P,N: query points/normals; occ: occluder sample points. Each direction renders a splat depth map of the
    occluders (ortho, looking along -d) and tests whether each point is the front-most along d."""
    ctr = P.mean(0) if ctr is None else ctr
    res = int(2 * rad / px) + 4; ao = np.zeros(len(P)); wsum = np.zeros(len(P))
    for d in fib_dirs(n_dir):
        u = np.cross(d, [0, 1, 0] if abs(d[1]) < .9 else [1, 0, 0]); u /= np.linalg.norm(u); w = np.cross(d, u)
        def proj(X):
            Q = X - ctr; return np.floor((Q @ u + rad) / px).astype(int), np.floor((Q @ w + rad) / px).astype(int), Q @ d
        ox, oy, oz = proj(occ); ok = (ox >= 1) & (oy >= 1) & (ox < res - 1) & (oy < res - 1)
        Z = np.full((res, res), -9.)
        for dx in (-1, 0, 1):
            for dy in (-1, 0, 1): np.maximum.at(Z, (ox[ok] + dx, oy[ok] + dy), oz[ok])
        qx, qy, qz = proj(P + N * .0045); qx = np.clip(qx, 0, res - 1); qy = np.clip(qy, 0, res - 1)
        vis = qz + bias >= Z[qx, qy]
        cw = np.clip(N @ d, 0, 1); ao += vis * cw; wsum += cw
    return ao / np.maximum(wsum, 1e-6)

def surface_samples(V, F, per=2):
    """vertices + random barycentric samples per face (dense occluder cloud)"""
    rng = np.random.default_rng(0); out = [V]
    for _ in range(per):
        r = rng.random((len(F), 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]
        a, b, c = V[F[:, 0]], V[F[:, 1]], V[F[:, 2]]; out.append(a + (b - a) * r[:, :1] + (c - a) * r[:, 1:])
    return np.concatenate(out)

def smooth_on_mesh(val, F, n, it=4):
    import scipy.sparse as sp
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    A = sp.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(n, n)).tocsr(); A.data[:] = 1
    deg = np.asarray(A.sum(1)).ravel(); deg[deg == 0] = 1
    for _ in range(it): val = .5 * val + .5 * (A @ val) / deg
    return val

def head_ao(vs, ev, M):
    """AO per subdivided vertex (1 = open); only the head / neck region is evaluated, the rest is 1"""
    Fw = VIDX[TRIS]; nrm = vert_normals(vs, Fw)
    near = np.linalg.norm(vs - (M + [0, -.03, -.06]), axis=1) < .26
    occ = surface_samples(vs, Fw[near[Fw].all(1)], 2); occ = np.concatenate([occ, ev])
    ao = np.ones(len(vs))
    ao[near] = depth_ao(vs[near], nrm[near], occ, ctr=M + [0, -.03, -.06])
    return np.clip(smooth_on_mesh(ao, Fw, len(vs), 3), 0, 1)

def vert_normals(V, F):
    n = np.zeros_like(V); fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
    for k in range(3): np.add.at(n, F[:, k], fn)
    return n / (np.linalg.norm(n, axis=1, keepdims=True) + 1e-12)

# ---------------- eyelids ----------------
def lid_frame(vs, c, R):
    """azimuth / elevation of points about the eyeball centre (elevation measured about the lateral x axis)"""
    d = vs - c; al = np.arctan2(d[:, 0], d[:, 2]); th = np.arctan2(d[:, 1], np.hypot(d[:, 2], d[:, 0]) * np.sign(d[:, 2] + 1e-9)); r = np.linalg.norm(d, axis=1)
    return d, al, th, r

def opening(vs, c, R):
    """per-azimuth upper / lower margin elevations of the lid opening, found as the gap in skin coverage"""
    d, al, th, r = lid_frame(vs, c, R)
    m = (r > .85 * R) & (r < 1.45 * R) & (d[:, 2] > -.2 * R)
    bins = np.linspace(-.9, .9, 19); up = np.full(len(bins), np.nan); lo = np.full(len(bins), np.nan)
    for i, a in enumerate(bins):
        s = m & (np.abs(al - a) < .09); t = np.sort(th[s])
        if len(t) < 6: continue
        g = np.diff(t); mid = (t[:-1] + t[1:]) / 2; cand = np.where(np.abs(mid) < .6)[0]
        if not len(cand): continue
        j = cand[np.argmax(g[cand])]
        if g[j] < .12: continue
        lo[i], up[i] = t[j], t[j + 1]
    ok = ~np.isnan(up); A, U, L = bins[ok], up[ok], lo[ok]
    from scipy.ndimage import median_filter
    if len(A) >= 5: U = median_filter(U, 3, mode='nearest'); L = median_filter(L, 3, mode='nearest')
    L = np.maximum(L, U - .75)
    return A, U, L

def lid_delta(vs, c, R, fu, fl, skin=None):
    d, al, th, r = lid_frame(vs, c, R); A, U, L = opening(vs if skin is None else skin, c, R)
    if len(A) < 3: return np.zeros_like(vs), (A, U, L)
    u = np.interp(al, A, U); l = np.interp(al, A, L); gap = np.maximum(u - l, 0)
    edge = np.abs(A).max()
    inA = np.clip(1 - (np.abs(al) - edge) / .3, 0, 1)
    rad = (1 - np.clip((r - 1.25 * R) / (.85 * R), 0, 1)) * (r > .78 * R) * (d[:, 2] > -.35 * R)
    wu = (th > u - .03) * (1 - np.clip((th - u) / .95, 0, 1)) ** 1.3 * rad * inA
    wl = (th < l + .03) * (1 - np.clip((l - th) / .55, 0, 1)) ** 1.5 * rad * inA
    ang = -wu * gap * fu + wl * gap * fl                 # elevation change (rad)
    # rotate in the plane spanned by y and the horizontal forward direction (keeps distance from the centre)
    h = np.hypot(d[:, 0], d[:, 2]); s = np.sign(d[:, 2] + 1e-9)
    t2 = th + ang; hn = r * np.cos(t2); yn = r * np.sin(t2)
    k = np.where(h > 1e-9, hn / np.maximum(h, 1e-9), 1) * 1.0
    o = d.copy(); o[:, 0] = d[:, 0] * k; o[:, 2] = d[:, 2] * k; o[:, 1] = yn
    # th was computed with sign(z) folded in; for points behind the centre keep them unchanged
    o[d[:, 2] <= 0] = d[d[:, 2] <= 0]
    return o - d, (A, U, L)

def eye_centres(ev, M):
    out = []
    for sd in (1, -1):
        e = ev[(ev[:, 0] - M[0]) * sd > 0]; c = e.mean(0); out.append((c, float(np.linalg.norm(e - c, axis=1).mean())))
    return out

def blink_squint(vs, ev, M):
    mask = np.zeros(len(vs), bool); res = {}
    D = {k: np.zeros_like(vs) for k in ('blink', 'squint')}
    for c, R in eye_centres(ev, M):
        loc = np.linalg.norm(vs - c, axis=1) < 2.3 * R
        for k, (fu, fl) in (('blink', (.9, .14)), ('squint', (.28, .42))):
            dd, _ = lid_delta(vs[loc], c, R, fu, fl); D[k][loc] += dd
    return D

def lash_delta(P, vs, ev, M, fu, fl):
    """apply the lid rotation to lash ribbon vertices (roots sit on the margin, so they ride it fully)"""
    out = np.zeros_like(P)
    for c, R in eye_centres(ev, M):
        loc = np.linalg.norm(P - c, axis=1) < 2.2 * R; sk = np.linalg.norm(vs - c, axis=1) < 2.3 * R
        if loc.any(): out[loc] = lid_delta(P[loc], c, R, fu, fl, skin=vs[sk])[0]
    return out

# ---------------- expressions from MakeHuman targets ----------------
EXPR = {
    'smile': [('mouth/mouth-angles-up', .55), ('cheek/{s}-cheek-trans-up', .35), ('mouth/mouth-laugh-lines-in', .4)],
    'browUp': [('eyebrows/eyebrows-trans-up', .85), ('eyebrows/eyebrows-angle-up', .3)],
    'frown': [('eyebrows/eyebrows-trans-down', .6), ('eyebrows/eyebrows-angle-down', .35), ('mouth/mouth-angles-down', .35)],
}
def expr_delta(name):
    d0 = np.zeros((len(V0), 3))
    for t, w in EXPR[name]:
        for s in (('l', 'r') if '{s}' in t else ('',)):
            path = t.replace('{s}', s) + '.target'
            try: i, d = target(path)
            except Exception: continue
            d0[i] += d * w
    return S @ (d0 * .1)
