"""Garments built from the MakeHuman body: Catmull-Clark subdivided regions, offset and relaxed against the
body (cloth bridges hollows instead of hugging them), procedural folds, collars, pockets, pads.
Topology is decided once on the reference body, so every character shares indices/UVs and only positions differ."""
import numpy as np, scipy.sparse as sp
from scipy.spatial import cKDTree
from mhbuild import *
from paint import fbm, vnoise, ss

BF = np.array([f for f, g in zip(F, G) if g == 'body'])
BFT = np.array([t for t, g in zip(FT, G) if g == 'body'])
NB = len(GAME_BONES)

def _wb():
    acc = np.zeros((len(V0), NB))
    for b, lst in SK['weights'].items():
        gi = BI[mapped(b)]
        for vi, w in lst: acc[vi, gi] += w
    acc[acc.sum(1) == 0, BI['hips']] = 1
    return acc / acc.sum(1, keepdims=True)
WB = _wb()
DOM = np.array(GAME_BONES)[WB.argmax(1)]

# ---------------------------------------------------------------- subdivision
def catmull_clark(Q, n0, QUV):
    """one Catmull-Clark step on quads Q (indices < n0).  Returns S (new x n0), new quads, new per-corner uvs."""
    Q = np.asarray(Q); m = len(Q)
    e = np.stack([Q, np.roll(Q, -1, 1)], 2).reshape(-1, 2); ek = np.sort(e, 1)
    uniq, einv = np.unique(ek, axis=0, return_inverse=True); einv = einv.reshape(m, 4); ne = len(uniq)
    ecount = np.bincount(einv.ravel(), minlength=ne)
    used = np.unique(Q); vmap = -np.ones(n0, int); vmap[used] = np.arange(len(used)); nv = len(used)
    rows, cols, vals = [], [], []
    def put(r, c, w): rows.append(r); cols.append(c); vals.append(w)
    # face points
    fbase = nv + ne
    for f in range(m):
        for i in Q[f]: put(fbase + f, i, .25)
    # edge points
    efaces = [[] for _ in range(ne)]
    for f in range(m):
        for k in range(4): efaces[einv[f, k]].append(f)
    for ei in range(ne):
        a, b = uniq[ei]
        if len(efaces[ei]) == 2:
            put(nv + ei, a, .25); put(nv + ei, b, .25)
            for f in efaces[ei]:
                for i in Q[f]: put(nv + ei, i, 1 / 16)
        else: put(nv + ei, a, .5); put(nv + ei, b, .5)
    # vertex points
    vf = [[] for _ in range(nv)]; ve = [[] for _ in range(nv)]
    for f in range(m):
        for i in Q[f]: vf[vmap[i]].append(f)
    for ei in range(ne):
        for i in uniq[ei]: ve[vmap[i]].append(ei)
    for j, i in enumerate(used):
        bd = [ei for ei in ve[j] if ecount[ei] == 1]
        if len(bd) == 0 and len(ve[j]) == len(vf[j]) and len(vf[j]) >= 3:
            n = len(vf[j])
            for f in vf[j]:
                for k in Q[f]: put(j, k, .25 / n / n)
            for ei in ve[j]:
                for k in uniq[ei]: put(j, k, 1 / n / n)
            put(j, i, (n - 3) / n)
        elif len(bd) == 2:
            for ei in bd:
                o = uniq[ei][0] if uniq[ei][1] == i else uniq[ei][1]; put(j, o, 1 / 8)
            put(j, i, .75)
        else: put(j, i, 1.)
    S = sp.csr_matrix((vals, (rows, cols)), shape=(fbase + m, n0))
    NQ = []; NUV = []
    for f in range(m):
        uv = QUV[f]; fc = uv.mean(0)
        for k in range(4):
            a = vmap[Q[f, k]]; en = nv + einv[f, k]; ep = nv + einv[f, (k - 1) % 4]
            NQ.append([a, en, fbase + f, ep])
            NUV.append([uv[k], (uv[k] + uv[(k + 1) % 4]) / 2, fc, (uv[k] + uv[(k - 1) % 4]) / 2])
    return S, np.array(NQ), np.array(NUV)

def split_uv(Q, QUV):
    """face-varying uv -> split vertices.  returns vidx (split->unsplit), uv, tris"""
    pairs = {}; vidx = []; uv = []; tris = []
    for q, u in zip(Q, QUV):
        ids = []
        for i, t in zip(q, u):
            k = (int(i), round(float(t[0]), 6), round(float(t[1]), 6))
            if k not in pairs: pairs[k] = len(vidx); vidx.append(int(i)); uv.append(t)
            ids.append(pairs[k])
        tris += [[ids[0], ids[1], ids[2]], [ids[0], ids[2], ids[3]]]
    return np.array(vidx), np.array(uv), np.array(tris)

def adjacency(Q, n):
    e = np.concatenate([Q[:, [0, 1]], Q[:, [1, 2]], Q[:, [2, 3]], Q[:, [3, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    A = sp.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(n, n)).tocsr(); A.data[:] = 1
    return A

def quad_normals(X, Q):
    fn = np.cross(X[Q[:, 2]] - X[Q[:, 0]], X[Q[:, 3]] - X[Q[:, 1]])
    n = np.zeros_like(X)
    for k in range(4): np.add.at(n, Q[:, k], fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)

def boundary_info(Q, n):
    e = np.concatenate([Q[:, [0, 1]], Q[:, [1, 2]], Q[:, [2, 3]], Q[:, [3, 0]]])
    k = np.sort(e, 1); u, c = np.unique(k, axis=0, return_counts=True)
    be = u[c == 1]; isb = np.zeros(n, bool); isb[be.ravel()] = True
    # directed boundary edges (keep face orientation) for loop extraction
    d = {}
    for a, b in e:
        if (min(a, b), max(a, b)) in set(map(tuple, be)): pass
    return be, isb

def loops_from_edges(Q, be):
    bes = set(map(tuple, be)); nxt = {}
    for q in Q:
        for k in range(4):
            a, b = q[k], q[(k + 1) % 4]
            if (min(a, b), max(a, b)) in bes: nxt[a] = b
    loops, seen = [], set()
    for a in nxt:
        if a in seen: continue
        L = [a]; seen.add(a); c = nxt[a]
        while c != a and c not in seen and c in nxt: L.append(c); seen.add(c); c = nxt[c]
        loops.append(np.array(L))
    return loops

# ---------------------------------------------------------------- body collision proxy
class Body:
    def __init__(self, v):
        self.v = v
        S1, NQ, _ = catmull_clark(BF, len(V0), BFT.astype(float)[..., None].repeat(2, -1) * 0 + VT[BFT])
        self.P = S1 @ v; self.N = quad_normals(self.P, NQ)
        self.kd = cKDTree(self.P)
    def push_out(self, X, minT):
        d, k = self.kd.query(X, k=3)
        q = self.P[k[:, 0]]; nq = self.N[k].mean(1); nq /= np.linalg.norm(nq, axis=1, keepdims=True)
        h = ((X - q) * nq).sum(1)
        return X + nq * np.maximum(minT - h, 0)[:, None], h

# ---------------------------------------------------------------- limb coordinates
def limb(P, a, b, front=np.array([0, 0, 1.])):
    """s = metres along a->b from a, theta = angle around the axis (0 = 'front', +pi/2 = lateral side for +x limbs), r = radius"""
    d = b - a; L = np.linalg.norm(d); d = d / L
    s = (P - a) @ d; foot = a + np.outer(s, d); r = P - foot; rad = np.linalg.norm(r, axis=1)
    f = front - d * (front @ d); f /= np.linalg.norm(f); sdir = np.cross(d, f)
    th = np.arctan2(r @ sdir, r @ f)
    return s, th, rad, L, d, f, sdir

def ridge(x, sharp=1.6):
    """cloth fold profile: rounded ridges, tighter valleys; x in radians"""
    return (0.5 + 0.5 * np.sin(x)) ** sharp

# ---------------------------------------------------------------- reference regions (decided once)
REF = None
def reference(vref):
    global REF
    if REF is not None: return REF
    head, W = rig(vref); y = vref[:, 1]
    def past(side, joint, off):
        e, w_ = head['el' + side], head['wr' + side]; d = (w_ - e) / np.linalg.norm(w_ - e)
        return ((vref - head[joint + side]) @ d) > off
    isL = vref[:, 0] < 0
    hand = np.zeros(len(vref), bool); handG = np.zeros(len(vref), bool)
    armdom = np.array([d.startswith(('sh', 'el', 'wr', 'idx', 'mid', 'rng', 'pnk', 'th')) for d in DOM])
    legdom = np.array([d.startswith(('hp', 'kn', 'an')) for d in DOM])
    for s, m in (('L', isL), ('R', ~isL)):
        hand |= m & armdom & past(s, 'wr', -.012)          # sleeve ends at the wrist
        handG |= m & armdom & past(s, 'wr', -.05)          # glove gauntlet runs under the cuff
    neck_base = head['neck'][1]
    headneck = (DOM == 'head') | ((DOM == 'neck') & (y > neck_base + .015))
    hem = head['hpL'][1] - .065
    jacket = ~headneck & ~hand & (y > hem) & ~(legdom & (y < hem + .02))
    jacket |= ~headneck & ~hand & armdom
    waist_top = head['hips'][1] + .085
    boot_top = head['anL'][1] + .175
    trousers = legdom & (y < waist_top) & (y > boot_top - .05) | (~armdom & ~headneck & (y < waist_top) & (y > hem - .2) & (DOM == 'hips'))
    trousers &= ~armdom
    gloves = handG
    fore = np.zeros(len(vref), bool)
    for s, m in (('L', isL), ('R', ~isL)):
        e, w_ = head['el' + s], head['wr' + s]; d = w_ - e; Lf = np.linalg.norm(d); d /= Lf
        fore |= m & armdom & (((vref - e) @ d) / Lf > .3)
    shirt = jacket & ~fore
    REF = dict(head=head, jacket=jacket, trousers=trousers, gloves=gloves, shirt=shirt, hem=hem, waist_top=waist_top, boot_top=boot_top, neck_base=neck_base)
    return REF

def faces_where(mask, need=3):
    return BF[mask[BF].sum(1) >= need], BFT[mask[BF].sum(1) >= need]

class Garment:
    """fixed topology over the base mesh: one CC level of the selected quads"""
    def __init__(self, name, vmask, need=3):
        Q, QT = faces_where(vmask, need)
        # drop faces that would make thin slivers: keep the largest connected component(s) of >40 faces
        self.name = name; self.Q0 = Q
        self.S, self.Q, self.QUV = catmull_clark(Q, len(V0), VT[QT])
        self.n = self.S.shape[0]
        self.A = adjacency(self.Q, self.n); self.deg = np.asarray(self.A.sum(1)).ravel()
        be = np.unique(np.sort(np.concatenate([self.Q[:, [0, 1]], self.Q[:, [1, 2]], self.Q[:, [2, 3]], self.Q[:, [3, 0]]]), 1), axis=0, return_counts=True)
        self.be = be[0][be[1] == 1]; self.isb = np.zeros(self.n, bool); self.isb[self.be.ravel()] = True
        self.loops = loops_from_edges(self.Q, self.be)
        self.W = self.S @ WB
        self.vidx, self.uv, self.tris = split_uv(self.Q, self.QUV)

    def drape(self, v, body, ease, minT, iters=40, maxbridge=.04, smooth=30, folds=None, hang=None):
        """loose cloth: offset by ease (+ bridging over hollows), then Taubin-smoothed so body detail (abs, pecs,
        calf muscles) no longer shows through, pushed back outside the body, then procedural folds"""
        X0 = self.S @ v; N0 = quad_normals(X0, self.Q)
        Xs = X0 + N0 * ease[:, None]
        for it in range(iters):
            Xs += .5 * ((self.A @ Xs) / self.deg[:, None] - Xs)
        hb = np.clip(((Xs - X0) * N0).sum(1) - ease, 0, maxbridge)
        h = ease + hb
        for it in range(6): h = .5 * h + .5 * (self.A @ h) / self.deg
        X = X0 + N0 * np.maximum(h, ease * .8)[:, None]
        Bn = np.zeros((self.n, 2), int) - 1
        for L in self.loops:
            for i in range(len(L)): Bn[L[i]] = (L[i - 1], L[(i + 1) % len(L)])
        inner = ~self.isb; hb_ = self.isb & (Bn[:, 0] >= 0)
        for it in range(smooth):
            for w in (.5, -.53):
                Lp = (self.A @ X) / self.deg[:, None] - X
                X[inner] += w * Lp[inner]
                X[hb_] += w * .6 * ((X[Bn[hb_, 0]] + X[Bn[hb_, 1]]) / 2 - X[hb_])
            if it % 5 == 4: X, _ = body.push_out(X, minT)
        X, _ = body.push_out(X, minT)
        if hang is not None: X = self.hang(X, **hang); X, _ = body.push_out(X, minT)
        self.X0 = X0
        if folds is not None:
            N = quad_normals(X, self.Q)
            X = X + N * folds(X0, X, N)[:, None]
            X, _ = body.push_out(X, minT * .7)
        return X

    def hang(self, X, cx, cz, y_top, mask, taper=.15, bins=96, blend=6):
        """gravity: below y_top the cloth falls straight down instead of following the body inward"""
        X = X.copy(); ang = np.arctan2(X[:, 0] - cx, X[:, 2] - cz); r = np.hypot(X[:, 0] - cx, X[:, 2] - cz)
        b = ((ang + np.pi) / (2 * np.pi) * bins).astype(int) % bins
        idx = np.where(mask & (X[:, 1] < y_top + .06))[0]; idx = idx[np.argsort(-X[idx, 1])]
        run = np.zeros(bins); ylast = np.full(bins, y_top + .06); rnew = r.copy()
        for i in idx:
            k = b[i]; dy = max(ylast[k] - X[i, 1], 0)
            lim = run[k] - taper * dy
            if X[i, 1] < y_top and lim > r[i]: rnew[i] = lim
            run[k] = max(rnew[i], lim); ylast[k] = X[i, 1]
        # smooth the radial change so the bin edges don't show
        dr = rnew - r
        for _ in range(blend): dr = .5 * dr + .5 * (self.A @ dr) / self.deg
        dr = np.maximum(dr, 0) * mask
        X[:, 0] += np.sin(ang) * dr; X[:, 2] += np.cos(ang) * dr
        return X

# ---------------------------------------------------------------- parametric patches (pockets, flaps, pads, straps)
def sample_radius(X, sel, s, th, s0, th0, Ravg):
    """radius of the garment surface at (s0, th0) from nearby garment vertices"""
    pts = np.stack([s[sel], np.unwrap(th[sel]) * 0 + th[sel] * Ravg], 1)
    kd = cKDTree(pts)
    q = np.stack([s0, th0 * Ravg], -1).reshape(-1, 2)
    d, k = kd.query(q, k=4); w = 1 / (d + 1e-4); w /= w.sum(1, keepdims=True)
    return k, w

def patch(X, W, UVs, a, b, front, srange, thrange, lift, bulge, nu=10, nv=8, side_th=None, round_=4.0, wall=True, sel=None, flip_th=1):
    """rounded-rectangle panel lying on the garment surface around limb axis a->b.
    lift: height above the cloth; bulge: extra dome.  Returns verts, tris, weights(top-4 idx/w), uv"""
    s, th, rad, L, d, f, sd = limb(X, a, b, front)
    if sel is None: sel = (s > srange[0] - .08) & (s < srange[1] + .08) & (rad < .2)
    Ravg = np.median(rad[sel])
    gu, gv = np.meshgrid(np.linspace(-1, 1, nu), np.linspace(-1, 1, nv))
    gu, gv = gu.ravel(), gv.ravel()
    # rounded corners: squash toward a superellipse
    rr = (np.abs(gu) ** round_ + np.abs(gv) ** round_) ** (1 / round_); mx = np.maximum(np.abs(gu), np.abs(gv))
    sc = np.where(rr > 1e-9, mx / np.maximum(rr, 1e-9), 1); gu2, gv2 = gu * sc, gv * sc
    s0 = srange[0] + (gv2 + 1) / 2 * (srange[1] - srange[0])
    t0 = thrange[0] + (gu2 + 1) / 2 * (thrange[1] - thrange[0])
    pts = np.stack([s[sel], th[sel] * Ravg], 1); kd = cKDTree(pts)
    dd, kk = kd.query(np.stack([s0, t0 * Ravg], 1), k=6); w = 1 / (dd + 2e-3) ** 2; w /= w.sum(1, keepdims=True)
    ids = np.where(sel)[0][kk]
    r0 = (rad[ids] * w).sum(1)
    dome = (np.clip(1 - gu2 ** 2, 0, 1) * np.clip(1 - gv2 ** 2, 0, 1)) ** .5
    radial = lambda t: np.outer(np.cos(t), f) + np.outer(np.sin(t), sd)
    base = a + np.outer(s0, d) + radial(t0) * r0[:, None]
    top = a + np.outer(s0, d) + radial(t0) * (r0 + lift + bulge * dome)[:, None]
    Wt = np.einsum('nk,nkb->nb', w, W[ids])
    UVp = np.einsum('nk,nkc->nc', w, UVs[ids])
    n = nu * nv; idx = np.arange(n).reshape(nv, nu)
    tris = []
    for j in range(nv - 1):
        for i in range(nu - 1):
            a0, b0, c0, d0 = idx[j, i], idx[j, i + 1], idx[j + 1, i + 1], idx[j + 1, i]
            tris += [[a0, b0, c0], [a0, c0, d0]] if flip_th > 0 else [[a0, c0, b0], [a0, d0, c0]]
    V = [top]; T = [np.array(tris)]; Wl = [Wt]; U = [UVp]
    if wall:
        ring = list(idx[0, :]) + list(idx[1:, -1]) + list(idx[-1, -2::-1]) + list(idx[-2:0:-1, 0])
        ring = np.array(ring); m = len(ring)
        bot = base[ring]; V.append(bot); Wl.append(Wt[ring]); U.append(UVp[ring])
        tw = []
        for i in range(m):
            p, q_ = ring[i], ring[(i + 1) % m]; pb, qb = n + i, n + (i + 1) % m
            tw += [[p, pb, qb], [p, qb, q_]] if flip_th > 0 else [[p, qb, pb], [p, q_, qb]]
        T.append(np.array(tw))
    return np.concatenate(V), np.concatenate(T), np.concatenate(Wl), np.concatenate(U)

def band(X, W, UVs, a, b, front, s0, width, lift, nu=40, sel=None):
    """strap/ring all the way around a limb"""
    s, th, rad, L, d, f, sd = limb(X, a, b, front)
    if sel is None: sel = (np.abs(s - s0) < .06) & (rad < .2)
    return patch(X, W, UVs, a, b, front, (s0 - width / 2, s0 + width / 2), (-np.pi, np.pi * (1 - 2 / nu)), lift, 0, nu=nu, nv=3, round_=60, wall=False, sel=sel)

def top4(Wm):
    idx = np.argsort(-Wm, 1)[:, :4]; w = np.take_along_axis(Wm, idx, 1); w /= np.maximum(w.sum(1, keepdims=True), 1e-9)
    return idx.astype(np.uint8), w
