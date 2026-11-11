"""Ratnik kit modelled from reference photos.

6B45 body armour (Ratnik), as in the references:
  * full-wrap soft-armour shell from the hips to the shoulders, stiff and boxy (it hangs straight, it does not follow
    the waist), edges finished with a raised binding tape
  * tall, thick padded collar wrapping the back and sides of the neck, open at the throat
  * broad padded shoulder straps over the top of the shoulders
  * front: seven rows of raised 25 mm MOLLE webbing spanning the whole panel, bar-tacked every 38 mm; six rows on the
    back; three short rows on each side
  * side adjustment straps with black side-release buckles, a drag handle under the collar at the back
  kit variants:
    A  stowed shoulder protectors rolled up on top of each shoulder, clean front
    B  as A plus pouches: two grenade pouches high, two double magazine pouches low, each with flap and pull tab
    C  deployed shoulder protectors over the upper arms (separate meshes, carried by the upper-arm bones) and the groin
       protector hanging from the front (separate mesh, swings with the thighs in the game)
6B47 helmet with EMR cover: wide, deep mid-cut dome, slightly boxy sides, flared rim with the cover's rolled hem,
  three-panel cover with seams, back pocket, velcro patch at the front, side loops, rear goggle-strap retainers with
  black buckles, four-point chin harness (front and rear straps meeting at an adjuster under each ear) and a chin cup.
Signed-distance shapes for the soft volumes; webbing, straps and buckles are explicit geometry with split vertices so
their edges stay crisp after decimation."""
import numpy as np, time
from scipy.spatial import cKDTree
from sdf import *
from qem import decimate
from paint import fbm, ss
from gear import torso_profile

QUICK = False

def mesh_sdf(fn, lo, hi, h, target, smooth=3, ao_fn=None, ao_dist=.012):
    t = time.time()
    if QUICK: h *= 1.8; target = 0
    fld, lo_, h_ = evaluate(fn, lo, hi, h)
    v, f = extract(fld, lo_, h_)
    v = taubin(v, f, iters=smooth)
    n0 = len(f)
    if target and len(f) > 3 * target:
        cell = h
        while True:
            v2, f2 = decimate_cluster(v, f, cell)
            if len(f2) < 3 * target or cell > h * 4: break
            cell *= 1.3
        v, f = v2, f2; uq, inv = np.unique(f, return_inverse=True); v = v[uq]; f = inv.reshape(-1, 3)
        v = taubin(v, f, iters=2)
    if target and len(f) > target: v, f, _ = decimate(v, f, target)
    n = normals(v, f)
    ao = sdf_ao(ao_fn or fn, v, n, dist=ao_dist)
    print('   mesh %d -> %d faces, %.1fs' % (n0, len(f), time.time() - t), flush=True)
    return v, f, n, ao

class Acc:
    """explicit geometry accumulator; every face gets its own vertices where the shading must stay crisp"""
    def __init__(self): self.V = []; self.F = []; self.ao = []; self.mid = []; self.n = 0
    def add(self, V, F, ao, mid):
        V = np.asarray(V, float); F = np.asarray(F, int)
        self.V.append(V); self.F.append(F + self.n); self.n += len(V)
        self.ao.append(np.broadcast_to(np.asarray(ao, float), (len(V),)).copy()); self.mid.append(np.full(len(V), mid, int))
    def quad(self, a, b, c, d, nrm, ao=1., mid=1):
        """quad a-b-c-d, wound so its normal agrees with nrm"""
        Q = np.array([a, b, c, d]); fn = np.cross(Q[1] - Q[0], Q[2] - Q[0])
        F = [[0, 1, 2], [0, 2, 3]] if fn @ nrm >= 0 else [[0, 2, 1], [0, 3, 2]]
        self.add(Q, F, ao, mid)
    def sheet(self, A, B, nrm, ao_a=1., ao_b=1., mid=1):
        """quad strip between polylines A[i], B[i]; wound so the faces agree with nrm (one vector or one per sample)"""
        A = np.asarray(A, float); B = np.asarray(B, float); m = len(A); V = np.concatenate([A, B])
        i = np.arange(m - 1); F = np.concatenate([np.stack([i, i + 1, m + i + 1], 1), np.stack([i, m + i + 1, m + i], 1)])
        fn = np.cross(V[F[:, 1]] - V[F[:, 0]], V[F[:, 2]] - V[F[:, 0]])
        N = np.asarray(nrm, float); ref = N[F[:, 0] % m] if N.ndim == 2 else np.broadcast_to(N, fn.shape)
        if (fn * ref).sum(1).mean() < 0: F = F[:, ::-1]
        ao = np.concatenate([np.broadcast_to(np.asarray(ao_a, float), (m,)), np.broadcast_to(np.asarray(ao_b, float), (m,))])
        self.add(V, F, ao, mid)
    def box(self, c, ex, ey, ez, h, ao=1., mid=2, bev=0.):
        """oriented box (axes ex, ey, ez, half sizes h), flat faces"""
        c = np.asarray(c, float); E = [np.asarray(e, float) / np.linalg.norm(e) for e in (ex, ey, ez)]
        for k in range(3):
            for s in (-1, 1):
                n = E[k] * s; u = E[(k + 1) % 3] * h[(k + 1) % 3]; w = E[(k + 2) % 3] * h[(k + 2) % 3]; o = c + n * h[k]
                self.quad(o - u - w, o + u - w, o + u + w, o - u + w, n, ao, mid)
    def merge(self, g, mid=None):
        self.add(g['v'], g['f'], g['ao'], 0)
        self.mid[-1] = np.asarray(g['mid']) if mid is None else np.full(len(g['v']), mid)
    def out(self):
        if not self.V: return dict(v=np.zeros((0, 3)), f=np.zeros((0, 3), int), ao=np.zeros(0), mid=np.zeros(0, int))
        return dict(v=np.concatenate(self.V), f=np.concatenate(self.F), ao=np.concatenate(self.ao), mid=np.concatenate(self.mid))

def grad(fn, P, e=.0005):
    g = np.stack([fn(P + np.array(d) * e) - fn(P - np.array(d) * e) for d in ((1, 0, 0), (0, 1, 0), (0, 0, 1))], -1)
    return g / (np.linalg.norm(g, axis=1, keepdims=True) + 1e-12)

def hits(fn, C, D, rmax=.42, step=.003):
    """outer surface along each ray: march from C + D*rmax inward to the first point inside, then bisect"""
    C = np.atleast_2d(C).astype(float); D = np.atleast_2d(D).astype(float); n = len(D); C = np.broadcast_to(C, (n, 3))
    tin = np.full(n, np.nan); t = rmax
    while t > 0:
        m = np.isnan(tin)
        if not m.any(): break
        v = fn(C[m] + D[m] * t); idx = np.where(m)[0][v < 0]; tin[idx] = t; t -= step
    ok = ~np.isnan(tin); lo = tin.copy(); hi = tin + step
    for _ in range(22):
        mid = (lo + hi) / 2; q = ok.copy(); v = np.full(n, 1.)
        v[q] = fn(C[q] + D[q] * mid[q, None]); inside = v < 0
        lo = np.where(inside, mid, lo); hi = np.where(inside, hi, mid)
    P = C + D * ((lo + hi) / 2)[:, None]
    return P, ok

def strip_on(acc, fn, C0, a, e1, e2, th0, th1, w=.025, t=.0023, tack=.038, keep=None, mid=1, ao=1., rmax=.42):
    """a webbing strip lying on the outer surface of fn: rays from the line C0 + s*a go out along cos(th) e1 + sin(th) e2;
    the strip runs across th and is w wide along a; bar tacks every `tack` metres from its centre"""
    C0 = np.asarray(C0, float); a = np.asarray(a, float); e1 = np.asarray(e1, float); e2 = np.asarray(e2, float)
    th = np.linspace(th0, th1, 260); D = np.cos(th)[:, None] * e1 + np.sin(th)[:, None] * e2
    Pc, ok = hits(fn, C0, D, rmax)
    if keep is not None: ok &= keep(Pc)
    if ok.sum() < 4: return
    # largest contiguous run of good samples
    runs = []; s0 = None
    for i, o in enumerate(list(ok) + [False]):
        if o and s0 is None: s0 = i
        if not o and s0 is not None: runs.append((s0, i)); s0 = None
    i0, i1 = max(runs, key=lambda r: r[1] - r[0]); th = th[i0:i1]; Pc = Pc[i0:i1]
    if len(th) < 4: return
    s = np.concatenate([[0], np.cumsum(np.linalg.norm(np.diff(Pc, axis=0), axis=1))]); L = s[-1]; smid = L / 2
    trim = .006; s_ = np.arange(trim, L - trim, .006)
    tk = smid + tack * np.arange(-int(L / tack) - 1, int(L / tack) + 2); tk = tk[(tk > trim + .004) & (tk < L - trim - .004)]
    s_ = np.unique(np.round(np.concatenate([s_, [trim, L - trim], tk - .0012, tk, tk + .0012]), 6))
    s_ = s_[(s_ >= trim) & (s_ <= L - trim)]
    thq = np.interp(s_, s, th); Dq = np.cos(thq)[:, None] * e1 + np.sin(thq)[:, None] * e2
    lo, ok1 = hits(fn, C0 - a * w / 2, Dq, rmax); hi, ok2 = hits(fn, C0 + a * w / 2, Dq, rmax)
    good = ok1 & ok2
    if good.sum() < 4: return
    lo, hi, Dq, s_ = lo[good], hi[good], Dq[good], s_[good]
    n = grad(fn, (lo + hi) / 2)
    lo = lo - n * .0006; hi = hi - n * .0006
    lo_o = lo + n * (t + .0006); hi_o = hi + n * (t + .0006)
    dark = np.zeros(len(s_))
    for tt in tk: dark = np.maximum(dark, (np.abs(s_ - tt) < 1e-4) * 1.)
    aoo = ao * (1 - .45 * dark)
    acc.sheet(lo_o, hi_o, n, aoo, aoo, mid)                              # face
    acc.sheet(hi, hi_o, a, ao * .8, ao, mid)                             # upper lip
    acc.sheet(lo, lo_o, -a, ao * .8, ao, mid)                            # lower lip
    tdir = lo[-1] - lo[0]
    acc.quad(lo[0], hi[0], hi_o[0], lo_o[0], -tdir, ao * .8, mid)        # ends
    acc.quad(lo[-1], hi[-1], hi_o[-1], lo_o[-1], tdir, ao * .8, mid)
    return dict(P=(lo + hi) / 2, n=n, s=s_)

# ====================================================================== 6B45
def vest_kit(P, dom_ok, head, jX, jN, ease=.011, T=.029):
    yN = head['neck'][1]; yS = head['shL'][1]; yH = head['hips'][1]; yap = yS - .125
    ys = np.linspace(yH - .04, yN - .02, 32)
    prof = torso_profile(P, dom_ok, ys); zf0, zb0, hw0 = prof.T
    sel = (ys <= yap - .03)
    hw = np.polyval(np.polyfit(ys[sel], hw0[sel], 2), ys); hap = np.interp(yap - .03, ys, hw); hw = np.where(ys > yap - .03, hap, hw)
    hw = np.maximum(hw, hap - .01) + ease
    zf = np.polyval(np.polyfit(ys, zf0, 3), ys) + ease; zb = np.polyval(np.polyfit(ys, zb0, 3), ys) - ease
    ich = np.argmax(np.where(ys < yap, zf, -9))
    for i in range(ich - 1, -1, -1): zf[i] = max(zf[i], zf[i + 1] - .1 * (ys[i + 1] - ys[i]))
    ibk = np.argmin(np.where(ys < yap, zb, 9))
    for i in range(ibk - 1, -1, -1): zb[i] = min(zb[i], zb[i + 1] + .1 * (ys[i + 1] - ys[i]))
    # make sure the jacket never pokes through: per slice, grow the section until every jacket point sits inside with margin
    pe0 = 2.9
    for i, y in enumerate(ys):
        if y > yap + .02: continue
        q = jX[(np.abs(jX[:, 1] - y) < .012) & (np.abs(jX[:, 0]) < hw[i] * 1.1)]
        if not len(q): continue
        a = hw[i]; zc = (zf[i] + zb[i]) / 2; bb = (zf[i] - zb[i]) / 2
        k = (np.abs(q[:, 0] / a) ** pe0 + np.abs((q[:, 2] - zc) / bb) ** pe0) ** (1 / pe0)
        km = np.percentile(k, 98.5)
        if km > .975:
            g = min(km / .975 - 1, .06); hw[i] += a * g; zf[i] += bb * g; zb[i] -= bb * g
    for _ in range(3):
        for arr in (hw, zf, zb): arr[1:-1] = np.maximum(arr[1:-1], (arr[:-2] + arr[2:] + 2 * arr[1:-1]) / 4) if arr is hw or arr is zf else np.minimum(arr[1:-1], (arr[:-2] + arr[2:] + 2 * arr[1:-1]) / 4)
    F = lambda arr, y: np.interp(y, ys, arr)
    zcB = (F(zf, yH) + F(zb, yH)) / 2
    def d_in(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        a = F(hw, y); f = F(zf, y); b_ = F(zb, y); zc = (f + b_) / 2; bb = (f - b_) / 2
        pe = 2.9; k = (np.abs(x / a) ** pe + np.abs((z - zc) / bb) ** pe) ** (1 / pe)
        return (k - 1) * np.minimum(a, bb) * .95
    def front_w(y, z):
        f = F(zf, y); b_ = F(zb, y); return ss(-.025, .025, z - (f + b_) / 2)
    def ytop(x, z, y):
        wf = front_w(y, z)
        ax_ = np.abs(x)
        yf = yN - .07 + .05 * ss(.015, .09, ax_) - .05 * ss(.12, .16, ax_); yb = yN - .05 + .04 * ss(.015, .09, ax_) - .05 * ss(.12, .16, ax_)
        return yb + (yf - yb) * wf
    def ybot(x, z):
        wf = ss(-.03, .03, z - zcB)
        return (yH + .028) + ((yH + .018) - (yH + .028)) * wf
    def outline(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        f = F(zf, y); b_ = F(zb, y); zc = (f + b_) / 2; bb = (f - b_) / 2
        o_bot = ybot(x, z) - y
        o_top = y - ytop(x, z, y)
        # armholes: above the armpit only the square front and back panels remain (30 cm wide), cut straight down
        wx = ss(yap - .07, yap - .025, y); o_side = np.abs(x) - (.152 + (1 - wx) * .3)
        return np.maximum(np.maximum(o_bot, o_top), o_side)
    def panel(P_):
        d = d_in(P_)
        sh = np.abs(d - T / 2) - T / 2
        o = outline(P_)
        bead = np.abs(d - T / 2) - (T / 2 + .0032)                     # binding tape: a slightly fuller rim along every edge
        rim = smax(bead, np.maximum(o, -o - .011), .002)
        return smin(smax(sh, o, .009), smax(rim, o, .004), .002)
    kdj = cKDTree(jX)
    def hj(P_):
        dd, kk = kdj.query(P_); return ((P_ - jX[kk]) * jN[kk]).sum(1)
    # shoulder straps: a padded bridge over each shoulder from the front panel's top edge to the back panel's, sized per
    # slice so it clears the jacket by the ease (an elliptic arc in the z-y plane, smooth and convex like a filled strap)
    Ts = .026; pe = 2.9
    def mid_z(x0, y, sgn):
        a = F(hw, y); f = F(zf, y); b_ = F(zb, y); zc = (f + b_) / 2; bb = (f - b_) / 2
        return zc + sgn * (bb * np.clip(1 - np.abs(x0 / a) ** pe, 1e-6, 1) ** (1 / pe) + T / 2)
    xs_ = np.linspace(.08, .2, 25); BR = []
    jm = np.abs(jX[:, 0]) > .088
    for x0 in xs_:
        ytf = float(ytop(np.array([x0]), np.array([1.]), np.array([yN - .05]))[0]); ytb = float(ytop(np.array([x0]), np.array([-1.]), np.array([yN - .05]))[0])
        zfe = float(mid_z(x0, ytf, 1)); zbe = float(mid_z(x0, ytb, -1))
        zc_s = (zfe + zbe) / 2; rz = (zfe - zbe) / 2 + .004; yc_s = min(ytf, ytb) - .012
        q = jX[jm & (np.abs(np.abs(jX[:, 0]) - x0) < .008) & (jX[:, 1] > yc_s - .01)]
        u = (q[:, 2] - zc_s) / rz; ok = np.abs(u) < .85
        need = (q[ok, 1] - yc_s + ease + Ts / 2) / np.clip(1 - np.abs(u[ok]) ** 3, .05, 1) ** (1 / 3) if ok.any() else np.array([.05])
        ry = np.percentile(need, 97)
        BR.append((zc_s, yc_s, max(rz, .06), float(np.clip(ry, .03, .14))))
    BR = np.array(BR)
    for k in range(4): BR[1:-1, 3] = (BR[:-2, 3] + BR[2:, 3] + 2 * BR[1:-1, 3]) / 4
    def straps(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]; ax_ = np.abs(x)
        zc_s, yc_s, rz, ry = (np.interp(ax_, xs_, BR[:, k]) for k in range(4))
        k = (np.abs((z - zc_s) / rz) ** 3 + (np.maximum(y - yc_s, 0) / ry) ** 3) ** (1 / 3); d = (k - 1) * np.minimum(rz, ry)
        sh = np.abs(d) - Ts / 2
        band = np.abs(ax_ - .118) - .036
        start = ytop(x, z, y) - .03 - y
        return smax(smax(sh, band, .014), start, .02)
    # collar: a thick padded wall round the back and sides of the neck, rolled top, open at the throat
    nz = .016; cy0 = yN - .045
    def collar(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        ph = np.arctan2(x, z - nz); aph = np.abs(ph)
        ax = .104 + .014 * ss(cy0, cy0 + .14, y); az = .1 + .014 * ss(cy0, cy0 + .14, y)
        r = np.hypot(x / ax, (z - nz) / az); dr = (r - 1) * np.minimum(ax, az)
        yt = (yN - .012) + ((yN + .058) - (yN - .012)) * ss(.8, 2.1, aph)
        yc = (cy0 + yt) / 2; hh = (yt - cy0) / 2
        th = .015 + .006 * ss(.75, 1.35, aph)
        q1 = np.abs(dr) - th; q2 = np.abs(y - yc) - hh
        rr = th * .96; d = np.hypot(np.maximum(q1 + rr, 0), np.maximum(q2 + rr, 0)) + np.minimum(np.maximum(q1 + rr, q2 + rr), 0) - rr
        gap = (.72 - aph) * .1
        return smax(d, gap, .016)
    hd_c = np.array([0, yN - .045, F(zb, yN - .045) - T - .004])
    handle = torus(hd_c, .036, .0065, Rm=rot(np.pi / 2, 0, 0))
    def base_fn(P_):
        d = panel(P_); d = smin(d, straps(P_), .018); d = smin(d, collar(P_), .016)
        return d
    lo = np.array([-.3, yH - .05, F(zb, yap) - .12]); hi = np.array([.3, yN + .09, F(zf, yap) + .1])
    v, f, n, ao = mesh_sdf(lambda Q: np.minimum(base_fn(Q), handle(Q)), lo, hi, .0024, 26000, smooth=3, ao_dist=.014)
    o = outline(v); dpan = panel(v)
    bind = (o > -.011) & (np.abs(dpan) < .004) & (v[:, 1] < yN - .04)
    mid = np.where(handle(v) < .0015, 2, np.where(bind, 1, 0))
    base = dict(v=v, f=f, ao=ao, mid=mid)
    # ---- explicit webbing, side straps and buckles ----
    acc = Acc(); acc.merge(base)
    up = np.array([0, 1., 0]); ez = np.array([0, 0, 1.]); ex = np.array([1., 0, 0])
    ctr = lambda y: np.array([0, y, (F(zf, y) + F(zb, y)) / 2])
    yt0 = yN - .093
    rows_f = np.linspace(yH + .058, yt0 - .042, 7)
    for y in rows_f:
        lim = .14
        strip_on(acc, base_fn, ctr(y), up, ez, ex, -1.45, 1.45, keep=lambda Q, l=lim, yy=y: (np.abs(Q[:, 0]) < l) & (Q[:, 2] > ctr(yy)[2] + .02))
    for y in np.linspace(yH + .075, yN - .1, 6):
        strip_on(acc, base_fn, ctr(y), up, -ez, ex, -1.45, 1.45, keep=lambda Q, yy=y: (np.abs(Q[:, 0]) < .148) & (Q[:, 2] < ctr(yy)[2] - .02))
    for sd in (1, -1):
        for y in (yH + .125, yH + .17, yH + .215):
            strip_on(acc, base_fn, ctr(y), up, ex * sd, ez, -.5, .5, keep=lambda Q: np.abs(Q[:, 0]) > .12)
        # side adjustment strap with a side-release buckle
        ys_ = yH + .068
        r = strip_on(acc, base_fn, ctr(ys_), up, ex * sd, ez, -.62, .62, w=.025, t=.003, tack=9., keep=lambda Q: np.abs(Q[:, 0]) > .1)
        if r:
            k = int(np.argmin(np.abs(r['P'][:, 2] - (F(zf, ys_) * .55 + F(zb, ys_) * .45) - .03)))
            p, nn = r['P'][k], r['n'][k]; tg = r['P'][min(k + 1, len(r['P']) - 1)] - r['P'][max(k - 1, 0)]; tg /= np.linalg.norm(tg)
            c = p + nn * (.0055 + .0035); bn = np.cross(tg, nn)
            acc.box(c, tg, bn, nn, (.026, .014, .0055), ao=1., mid=2)               # buckle body
            acc.box(c + tg * .03 + nn * .001, tg, bn, nn, (.007, .012, .0045), ao=.9, mid=2)   # ladder lock end
    # flag patch spot: upper right of the wearer's chest, on the top rows
    flag = [-.075, rows_f[-2], 0, 0]
    Pf, okf = hits(base_fn, ctr(flag[1]), np.array([[np.sin(-.5), 0, np.cos(-.5)]])); nf = grad(base_fn, Pf)[0]
    flag = [float(Pf[0, 0]), float(Pf[0, 1]), float(Pf[0, 2] + .0028 + .003), float(np.arctan2(nf[0], nf[2]))]
    vest = acc.out(); vest['flag'] = flag
    ctx = dict(F=F, zf=zf, zb=zb, hw=hw, ys=ys, yH=yH, yN=yN, yap=yap, base_fn=base_fn, ctr=ctr, T=T, hj=hj, kdj=kdj)
    return vest, ctx

def rolls(ctx):
    """stowed shoulder protectors: a fabric roll on top of each shoulder strap, tied with two webbing bands"""
    base_fn = ctx['base_fn']; parts = []; ties = []
    for sd in (1, -1):
        P0, ok = hits(base_fn, np.array([sd * .168, ctx['yN'] - .3, 0.]), np.array([[0, 1., 0]]), rmax=.6); x = sd * .18
        y = P0[0, 1] + .008
        a = np.array([x - sd * .008, y, -.072]); b = np.array([x + sd * .006, y + .002, .074])
        cap_ = capsule(a, b, .027); parts.append(lambda Q, c=cap_, yy=y: c(Q * [1, 1 / .78, 1] + [0, yy - yy / .78, 0]) * .85)
        for t_ in (.25, .72):
            c = a + (b - a) * t_; tt = torus(c, .0265, .0048, Rm=rot(np.pi / 2, 0, 0)); ties.append(lambda Q, f=tt, yy=y: f(Q * [1, 1 / .78, 1] + [0, yy - yy / .78, 0]) * .85)
    roll = lambda Q: np.minimum.reduce([p(Q) for p in parts])
    tie = lambda Q: np.minimum.reduce([t(Q) for t in ties])
    def fn(Q):
        wr = (fbm(Q * 1 + 4, 70, 2) - .5) * .003
        return np.minimum(roll(Q) - wr, tie(Q))
    lo = np.array([-.24, ctx['yN'] - .06, -.12]); hi = np.array([.24, ctx['yN'] + .1, .12])
    v, f, n, ao = mesh_sdf(fn, lo, hi, .0018, 5000, smooth=2, ao_fn=lambda Q: np.minimum(fn(Q), base_fn(Q)))
    return dict(v=v, f=f, ao=ao, mid=np.where(tie(v) < .0012, 1, 0))

def soft_pouch(p, n, hw, hh, hd, fh, seed=0, kind='mag'):
    """a soft nylon pouch on the MOLLE (not a hard box): the front bulges with what is inside and the top pinches in under
    the flap; compression folds bunch up along the bottom and the gusseted sides pleat; tension folds run from the flap's
    pull point down to the bottom corners. The flap is a thin cloth shell draped over the top, its lower edge dipping
    where the tab pulls it and lifting a little at the corners. Returns (body, flap, tab) distance functions."""
    yaw = np.arctan2(n[0], n[2]); Rm = rot(0, yaw, 0); c = p + n * (hd + .0015)
    rng = np.random.default_rng(seed); ph = rng.uniform(0, 6.28, 8); rr = .0095
    def loc(Q): return (Q - c) @ Rm
    def bulge(x, y, z):
        bx = np.clip(1 - (x / hw) ** 2, 0, 1); by = np.clip(1 - (y / hh) ** 2, 0, 1)
        return .0062 * bx ** .8 * by ** .7 * ss(-hd * .3, hd, z)
    def shape0(q):
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        wpin = 1 - .05 * ss(.2 * hh, hh, y) * ss(-.2 * hd, hd, z)        # top drawn in under the flap
        xx = x / wpin
        h = np.array([hw, hh, hd]) - rr
        qq = np.stack([xx, y, z], 1); d = np.abs(qq) - h
        box = np.linalg.norm(np.maximum(d, 0), axis=1) + np.minimum(d.max(1), 0) - rr
        return box - bulge(x, y, z)
    def folds(q):
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        n0 = fbm(q * [1, 1, 1] + seed * 3.1, 60, 2) - .5; n1 = fbm(q + 7 + seed, 140, 2) - .5
        front = ss(-hd * .6, hd * .2, z)
        # bottom compression folds: across the pouch, bunched up near the bottom and at the corners
        bot = ss(-.15 * hh, -hh, y) * (.55 + .45 * ss(.2 * hw, .9 * hw, np.abs(x)))
        w1 = np.sin(y * 6.283 / .016 + n0 * 5 + ph[0]) * .0019 * bot
        # tension folds: from the tab down to each bottom corner
        ty = hh - 2 * fh
        w2 = 0
        for s in (-1, 1):
            a = np.array([0, ty]); b = np.array([s * hw * .95, -hh * .95]); dv = b - a; L = np.linalg.norm(dv); dv /= L
            rel = np.stack([x - a[0], y - a[1]], 1); t = rel @ dv; perp = rel @ np.array([-dv[1], dv[0]])
            m = ss(0, .15 * L, t) * ss(L * 1.02, .6 * L, t) * np.exp(-(perp / .02) ** 2)
            w2 = w2 + np.sin(perp * 6.283 / .024 + n0 * 3 + ph[1 + (s > 0)]) * .0017 * m
        # gusseted sides pleat vertically-stacked folds
        side = ss(.75 * hw, hw, np.abs(x)) * ss(hd * .7, -hd * .2, z)
        w3 = np.sin(y * 6.283 / .017 + n0 * 5 + ph[3]) * .0012 * side
        # loose cloth everywhere: soft irregular undulation
        w4 = n0 * .0006 + n1 * .0002
        return (w1 + w2 + w4) * front + w3
    def bead(q):
        # binding tape: a rolled edge round the front of the pouch (a pipe round the inner box's front outline)
        x, y, z = q[:, 0], q[:, 1], q[:, 2]
        wpin = 1 - .05 * ss(.2 * hh, hh, y) * ss(-.2 * hd, hd, z); xx = x / wpin
        q1 = np.abs(xx) - (hw - rr); q2 = np.abs(y) - (hh - rr)
        sr = np.hypot(np.maximum(q1, 0), np.maximum(q2, 0)) + np.minimum(np.maximum(q1, q2), 0)
        return np.hypot(np.abs(sr), z - (hd - rr)) - (rr + .0012)
    def body(Q):
        q = loc(Q); return smin(shape0(q) - folds(q), bead(q), .0015)
    # webbing tabs that come from the MOLLE straps behind, wrap under the bottom and fasten on the front with a snap
    txs = (-.5 * hw, .5 * hw) if kind == 'mag' else (0.,)
    def tabs(Q):
        q = loc(Q); x, y, z = q[:, 0], q[:, 1], q[:, 2]; d0 = shape0(q)
        out = 9.
        for xt in txs:
            reg = np.maximum(np.maximum(np.abs(x - xt) - .0105, y - (-hh + .021)), -z - hd * .45)
            out = np.minimum(out, smax(np.abs(d0 - .0019) - .0011, reg, .001))
        return out
    def snaps(Q):
        q = loc(Q); x, y, z = q[:, 0], q[:, 1], q[:, 2]; out = 9.
        for xt in txs:
            zf = hd + bulge(np.array([xt]), np.array([-hh + .013]), np.array([hd]))[0]
            out = np.minimum(out, smax(np.hypot(x - xt, y - (-hh + .0125)) - .0042, np.abs(z - (zf + .0042)) - .0014, .0008))
        return out
    def yedge(x): return hh - fh - .0045 * (1 - (x / hw) ** 2) + .0012 * np.sin(x * 6.283 / .028 + ph[4])
    def flap(Q):
        q = loc(Q); x, y, z = q[:, 0], q[:, 1], q[:, 2]
        ye = yedge(x); lift = .0028 * ss(.012, 0, y - ye) * ss(.5 * hw, hw, np.abs(x))
        off = .0042 + lift + (fbm(q + 11 + seed, 90, 2) - .5) * .001
        sh = np.abs(shape0(q) - off) - .0022
        o = np.maximum(np.maximum(ye - y, np.abs(x) - (hw + .0012)), -z - hd * .7)
        rim = smax(np.hypot(shape0(q) - off, y - ye - .0016) - .0027, np.abs(x) - (hw + .0005), .001)
        return smin(smax(sh, o, .0025), rim, .0012)
    tab_c = np.array([0, hh - fh - .0045 - .011, hd + .0062 + .0075])
    def tab(Q):
        q = loc(Q) - tab_c; h = np.array([.0105, .014, .0016])
        d = np.abs(q) - h; return np.linalg.norm(np.maximum(d, 0), axis=1) + np.minimum(d.max(1), 0) - .0012
    buck_c = np.array([0, hh - fh - .0045 - .021, hd + .0062 + .0032])
    def buckle(Q):
        if kind == 'mag': return np.full(len(Q), 9.)
        q = loc(Q) - buck_c; h = np.array([.0118, .0082, .0028]); d = np.abs(q) - h
        return np.linalg.norm(np.maximum(d, 0), axis=1) + np.minimum(d.max(1), 0) - .0014
    def bbox():
        R_ = hw + hh + hd + .02; return c - R_, c + R_
    return body, flap, tab, bbox, tabs, snaps, buckle

def _pouch_mesh(ctx, specs, target, seed=0, kind='mag'):
    """mesh a set of soft pouches; specs = [(x, y, hw, hh, hd, fh)] placed on the front panel's outer surface"""
    base_fn = ctx['base_fn']; ctr = ctx['ctr']; R = {k: [] for k in ('body', 'flap', 'tab', 'tabs', 'snaps', 'buckle')}; lo = np.full(3, 9.); hi = np.full(3, -9.)
    for i, (x, y, hw, hh, hd, fh) in enumerate(specs):
        th = np.arctan2(x, .16); P0, ok = hits(base_fn, ctr(y), np.array([[np.sin(th), 0, np.cos(th)]]))
        nn = grad(base_fn, P0)[0]; nn[1] = 0; nn /= np.linalg.norm(nn)
        b, f, t, bb, tb, sn, bk = soft_pouch(P0[0], nn, hw, hh, hd, fh, seed * 10 + i, kind)
        for k, g in zip(('body', 'flap', 'tab', 'tabs', 'snaps', 'buckle'), (b, f, t, tb, sn, bk)): R[k].append(g)
        l_, h_ = bb(); lo = np.minimum(lo, l_); hi = np.maximum(hi, h_)
    U = {k: (lambda Q, L=L: np.minimum.reduce([p(Q) for p in L])) for k, L in R.items()}
    web = lambda Q: np.minimum(U['tab'](Q), U['tabs'](Q)); hard = lambda Q: np.minimum(U['snaps'](Q), U['buckle'](Q))
    def fn(Q):
        return np.minimum(np.minimum(smax(np.minimum(U['body'](Q), U['flap'](Q)), -base_fn(Q) - .0005, .0015), web(Q)), hard(Q))
    v, f, n, ao = mesh_sdf(fn, lo, hi, .0012, target, smooth=1, ao_fn=lambda Q: np.minimum(fn(Q), base_fn(Q)), ao_dist=.01)
    return dict(v=v, f=f, ao=ao, mid=np.where(hard(v) < .0008, 2, np.where(web(v) < .0009, 1, 0)))

def pouches(ctx):
    """photo layout: three equal double-magazine pouches across the lower front, soft flaps with pull tabs"""
    y_m = ctx['yH'] + .13
    return _pouch_mesh(ctx, [(x, y_m, .041, .074, .027, .028) for x in (-.09, 0., .09)], 22000, seed=1)

def upper_y(ctx):
    """centre height for the small upper pouches: between the magazine pouches and the panel's top edge"""
    return ctx['yH'] + .345

def grenade_pouches(ctx, xs, seed):
    """RGD-5 / F-1 grenade pouches high on the chest MOLLE: small upright soft pouches with a flap and pull tab"""
    y = upper_y(ctx)
    return _pouch_mesh(ctx, [(x, y, .033, .052, .025, .028) for x in xs], 7000 * len(xs), seed=seed, kind='gren')

def tourniquet(ctx, x):
    """an Esmarch rubber tourniquet folded into a flat bundle and held across the chest MOLLE under two black elastic
    bands: four stacked flattened loops of the 25 mm band, each slightly off the last, with the free end hanging out"""
    base_fn = ctx['base_fn']; ctr = ctx['ctr']; y = upper_y(ctx) + .01
    th = np.arctan2(x, .16); P0, ok = hits(base_fn, ctr(y), np.array([[np.sin(th), 0, np.cos(th)]]))
    nn = grad(base_fn, P0)[0]; nn[1] = 0; nn /= np.linalg.norm(nn); yaw = np.arctan2(nn[0], nn[2]); Rm = rot(0, yaw, 0)
    c = P0[0] + nn * .0105
    def loc(Q): return (Q - c) @ Rm
    L, W, t = .048, .0125, .0021                                         # half length, half band width, band thickness
    loops = []
    for k in range(4):
        dz = .0072 - k * .0048; dx = (k - 1.5) * .0022; dy = (k % 2 - .5) * .0016; hz = .0034 + k * .0002
        def lp(Q, dx=dx, dy=dy, dz=dz, hz=hz, k=k):
            q = loc(Q); x_, y_, z_ = q[:, 0] - dx, q[:, 1] - dy, q[:, 2] - dz
            # a flattened loop: stadium in the x-z plane (long along x), band width along y
            ax_ = np.maximum(np.abs(x_) - L, 0); r = np.hypot(ax_, z_)
            ring = np.abs(r - hz) - t / 2
            sag = .0009 * np.sin(x_ * 6.283 / .03 + k * 1.7)
            return np.maximum(ring, np.abs(y_ - sag) - W)
        loops.append(lp)
    def tail(Q):
        q = loc(Q); a = np.array([L * .7, -.004, .011]); b = np.array([L * .95, -.05, .016])
        ab = b - a; tt = np.clip(((q - a) @ ab) / (ab @ ab), 0, 1); pc = a + tt[:, None] * ab; dd = q - pc
        # flat band: thin across z, W wide along x
        return np.maximum(np.abs(dd[:, 2]) - t / 2, np.hypot(dd[:, 0], dd[:, 1]) - W * .9)
    band = lambda Q: np.minimum.reduce([lp(Q) for lp in loops] + [tail(Q)])
    def elastic(Q):
        out = []
        for ex in (-.026, .026):
            q = loc(Q); x_, y_, z_ = q[:, 0] - ex, q[:, 1], q[:, 2] - .0
            r = np.hypot(np.maximum(np.abs(y_) - (W + .002), 0), np.maximum(np.abs(z_ - .002) - .0135, 0))
            out.append(np.maximum(np.abs(r - .0012) - .0011, np.abs(x_) - .0085))
        return np.minimum(*out)
    fn = lambda Q: np.minimum(smax(band(Q), -base_fn(Q) - .0005, .001), smax(elastic(Q), -base_fn(Q) - .0003, .001))
    lo = c - .09; hi = c + .09
    v, f, n, ao = mesh_sdf(fn, lo, hi, .0009, 9000, smooth=1, ao_fn=lambda Q: np.minimum(fn(Q), base_fn(Q)), ao_dist=.008)
    return dict(v=v, f=f, ao=ao, mid=np.where(elastic(v) < .0008, 2, 3))

def groin(ctx):
    """groin protector: a curved, shield-shaped panel hanging from under the front edge, bending back between the legs
    at the bottom; two webbing rows across the top"""
    F = ctx['F']; yH = ctx['yH']; T = .022
    zf0 = F(ctx['zf'], yH) - .004; R0 = .26; ytop = yH + .035
    def axis_z(y): return zf0 - R0 - .07 * ss(0, .27, ytop - y) ** 1.6
    def fn0(Q):
        x, y, z = Q[:, 0], Q[:, 1], Q[:, 2]
        r = np.hypot(x, z - axis_z(y)); d = np.abs(r - (R0 + T / 2)) - T / 2
        w = .122 - .036 * ss(.06, .28, ytop - y)
        yb = (yH - .275) + .06 * (x / .09) ** 2
        o = smax(smax(np.abs(x) - w, yb - y, .03), y - ytop, .01)
        bead = smax(np.abs(r - (R0 + T / 2)) - (T / 2 + .003), np.maximum(o, -o - .01), .002)
        return smin(smax(d, o, .008), smax(bead, o, .004), .002)
    lo = np.array([-.15, yH - .31, zf0 - .2]); hi = np.array([.15, ytop + .02, zf0 + .07])
    v, f, n, ao = mesh_sdf(fn0, lo, hi, .002, 6000, smooth=2)
    acc = Acc(); acc.add(v, f, ao, 0)
    x, y, z = v[:, 0], v[:, 1], v[:, 2]
    w = .122 - .036 * ss(.06, .28, ytop - y); yb = (yH - .275) + .06 * (x / .09) ** 2
    o = np.maximum(np.maximum(np.abs(x) - w, yb - y), y - ytop); acc.mid[-1] = np.where(o > -.01, 1, 0)
    for yy in (yH - .03, yH - .082):
        C0 = np.array([0, yy, axis_z(yy)])
        strip_on(acc, fn0, C0, np.array([0, 1., 0]), np.array([0, 0, 1.]), np.array([1., 0, 0]), -.6, .6, keep=lambda Q: np.abs(Q[:, 0]) < .085, rmax=.45)
    g = acc.out(); g['pivot'] = [0., float(ytop), float(zf0)]
    return g

def shoulder_prot(ctx, head, jX, jN):
    """deployed shoulder protector for the LEFT arm (x<0), in bind space; mirrored in the game for the right arm"""
    A = np.asarray(head['shL'], float); E = np.asarray(head['elL'], float); u = (E - A) / np.linalg.norm(E - A)
    od = np.array([np.sign(A[0]), 0, 0.]); od = od - u * (od @ u); od /= np.linalg.norm(od)
    w2 = np.cross(u, od); T = .021; hj = ctx['hj']
    def region(Q):
        q = Q - A; t = q @ u; r = q - np.outer(t, u); rl = np.linalg.norm(r, axis=1) + 1e-9
        ca = (r @ od) / rl
        o_ang = (np.cos(1.85) - ca) * .08
        o_t = np.maximum(-.06 - t, t - .165)
        return smax(o_ang, o_t, .03)
    def fn(Q):
        h = hj(Q); d = np.abs(h - (.012 + T / 2)) - T / 2
        o = region(Q)
        bead = smax(np.abs(h - (.012 + T / 2)) - (T / 2 + .003), np.maximum(o, -o - .01), .002)
        return smin(smax(d, o, .01), smax(bead, o, .004), .002)
    lo = np.minimum(A, E) - .13; hi = np.maximum(A, E) + .13
    v, f, n, ao = mesh_sdf(fn, lo, hi, .0019, 6000, smooth=2)
    acc = Acc(); acc.add(v, f, ao, 0); acc.mid[-1] = np.where(region(v) > -.01, 1, 0)
    for t_ in (.055, .115):
        strip_on(acc, fn, A + u * t_, u, od, w2, -1.45, 1.45, rmax=.2, keep=lambda Q: region(Q) < -.012)
    return acc.out()

# ====================================================================== 6B47
def helmet47(top, half_w, half_l, cz, chin, head_pts, head_nrm):
    """6B47 with EMR cover (see module notes). Shell is a superellipsoid sized from the reference photos: about 26 cm wide,
    29 cm long, crown 3.5 cm above the skull; front rim 2-3 cm over the brows, sides over the tops of the ears,
    lowest at the nape"""
    good = np.isfinite(head_nrm).all(1) & (np.linalg.norm(head_nrm, axis=1) > .5); head_pts = head_pts[good]; head_nrm = head_nrm[good]
    C = np.array([0, top - .092, cz - .004]); R = np.array([half_w + .029, top + .027 - (top - .092), half_l + .02 + .03])
    def edge(x, z):
        ph = np.arctan2(x, z - C[2]); a = np.abs(ph)
        e = (top - .08) - .022 * ss(.3, 1.45, a) - .022 * ss(1.9, 2.9, a)
        return e
    def sup(q, Rr, p=2.7, pv=2.2):
        k = (np.abs(q[:, 0] / Rr[0]) ** p + np.abs(np.maximum(q[:, 1], 0) / Rr[1]) ** pv + np.abs(q[:, 2] / Rr[2]) ** p) ** (1 / p)
        return (k - 1) * Rr.min() * .97
    def outer(P_):
        q = P_ - C; e = edge(P_[:, 0], P_[:, 2])
        fl = 1 + .045 * ss(e + .028, e - .002, P_[:, 1])              # flared lip
        q = q.copy(); q[:, 0] /= fl; q[:, 2] /= fl
        return sup(q, R) * fl
    def wr_(P_):
        e = edge(P_[:, 0], P_[:, 2])
        w = (fbm(P_ * 1 + 3, 28, 3) - .5) * .0042 + (fbm(P_ + 9, 80, 2) - .5) * .0013
        return w * (.6 + .9 * np.exp(-((P_[:, 1] - e) / .03) ** 2))
    def seams(P_):
        x = P_[:, 0]; return .0011 * (np.exp(-(x / .0028) ** 2) + np.exp(-((np.abs(x) - .052) / .0028) ** 2))
    def shell(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]; e = edge(x, z)
        d = outer(P_) - wr_(P_) - seams(P_); th = .0105
        d = np.abs(d + th / 2) - th / 2
        return smax(d, e - y, .003)
    def hem(P_):
        e = edge(P_[:, 0], P_[:, 2]); return np.hypot(outer(P_) + .0035, P_[:, 1] - e - .002) - .0068
    def onshell(P_, x0, x1, y0, y1, ph0, ph1, h, rr=.006):
        """a flat patch lying on the cover between azimuths ph0..ph1 (radians) and heights y0..y1, raised h"""
        ph = np.arctan2(P_[:, 0], P_[:, 2] - C[2]); pm = (ph0 + ph1) / 2; hw_ = (ph1 - ph0) / 2
        dp = np.abs(np.arctan2(np.sin(ph - pm), np.cos(ph - pm))) - hw_
        rad = np.hypot(P_[:, 0], P_[:, 2] - C[2])
        o = np.maximum(dp * rad, np.abs(P_[:, 1] - (y0 + y1) / 2) - (y1 - y0) / 2)
        return smax(np.abs(outer(P_) - h / 2) - h / 2, o + rr * 0, rr)
    eB = edge(np.array([0.]), np.array([C[2] - 1.]))[0]
    pocket = lambda P_: onshell(P_, 0, 0, eB + .016, eB + .078, np.pi - .58, np.pi + .58, .012, .006)
    pflap = lambda P_: onshell(P_, 0, 0, eB + .062, eB + .082, np.pi - .6, np.pi + .6, .0155, .005)
    yF = top - .04
    velcro = lambda P_: smax(onshell(P_, 0, 0, yF - .014, yF + .014, -.3, .3, .0028, .003), C[2] - P_[:, 2], .01)
    loops = [lambda P_, s=sd: onshell(P_, 0, 0, top - .062, top - .046, s * 1.05 - .26, s * 1.05 + .26, .0034, .003) for sd in (1, -1)]
    eS = lambda s: edge(np.array([s * .1]), np.array([C[2] - .07]))[0]
    rets = [lambda P_, s=sd: onshell(P_, 0, 0, eS(s) + .006, eS(s) + .072, s * 2.12 - .085, s * 2.12 + .085, .0034, .003) for sd in (1, -1)]
    soft = lambda P_: np.minimum.reduce([velcro(P_)] + [l(P_) for l in loops] + [r(P_) for r in rets])
    cover = lambda P_: smin(smin(shell(P_), hem(P_), .003), np.minimum(pocket(P_), pflap(P_)), .002)
    # inner liner: the suspension pads and the dark liner band fill the space between shell and head at the rim, so from
    # below or the side the head reads as properly inside the helmet
    kdh = cKDTree(head_pts)
    def liner(P_):
        dh, kk = kdh.query(P_); sgn = np.sign(((P_ - head_pts[kk]) * head_nrm[kk]).sum(1)); dh = dh * sgn
        e = edge(P_[:, 0], P_[:, 2])
        return smax(smax(outer(P_) + .009, .004 - dh, .003), np.maximum(e - .003 - P_[:, 1], P_[:, 1] - (e + .05)), .004)
    def fn(P_): return np.minimum(np.minimum(cover(P_), soft(P_)), liner(P_))
    lo = np.array([-R[0] - .03, chin[0] - .03, C[2] - R[2] - .03]); hi = np.array([R[0] + .03, top + .05, C[2] + R[2] + .03])
    zlo = C[2] - R[2] - .03
    v, f, n, ao = mesh_sdf(fn, np.array([lo[0], C[1] - .1, zlo]), hi, .0016, 15000, smooth=3, ao_dist=.01)
    mid = np.where(soft(v) < .0012, 1, np.where(liner(v) < .0012, 2, 0))
    acc = Acc(); acc.add(v, f, ao, 0); acc.mid[-1] = mid
    # retainer buckles (black) near the bottom of each rear strap
    for sd in (1, -1):
        ph = sd * 2.12; d = np.array([np.sin(ph), 0, np.cos(ph)]); y = eS(sd) + .022
        P0, ok = hits(fn, np.array([0, y, C[2]]), d[None], rmax=.3); nn = grad(fn, P0)[0]
        acc.box(P0[0] + nn * .0045, np.array([0, 1., 0]), np.cross(nn, [0, 1., 0]), nn, (.009, .0135, .0035), ao=1., mid=2)
    # ---- chin harness: front and rear straps from inside the rim meet an adjuster under each ear, then run to the cup.
    #      Anchors are kept so the harness can be rebuilt over a balaclava or a gas mask for the soldiers who wear one ----
    anchors = dict(J0=[], a0=[], cup=[0, chin[0] + .021, chin[1] - .026])
    for sd in (1, -1):
        anchors['J0'].append([sd * (half_w - .004), chin[0] + .072, cz - .006])
        for ph in (sd * 1.12, sd * 2.0):
            d = np.array([np.sin(ph), 0, np.cos(ph)]); x0, z0 = C[0] + d[0] * .1, C[2] + d[2] * .1
            e = edge(np.array([x0]), np.array([z0]))[0]
            P0, ok = hits(fn, np.array([0, e + .012, C[2]]), d[None], rmax=.3)
            anchors['a0'].append((P0[0] - d * .016 + np.array([0, -.004, 0])).tolist())
    n_h0 = acc.n
    chin_harness(acc, anchors, head_pts, head_nrm)
    out = acc.out(); out['hz'] = (np.arange(len(out['v'])) >= n_h0).astype(np.uint8); out['anchors'] = anchors
    out['goggles'] = goggles(outer, edge, C, top)
    return out

def chin_harness(acc, A, surf_pts, surf_nrm, clr=.0045):
    """four-point chin harness lying on a surface (the skin, or a balaclava / gas mask over it): front and rear straps run
    from inside the helmet rim down to an adjuster under each ear, then forward along the jaw to a small chin cup"""
    kd = cKDTree(surf_pts)
    def hug(p, c=clr):
        _, k = kd.query(p, k=8); q = surf_pts[k].mean(1); nr = surf_nrm[k].mean(1); nr /= np.linalg.norm(nr, axis=1, keepdims=True)
        return q + nr * c, nr
    # chin cup: a shallow dish of webbing-covered foam cupping the point of the chin
    _, kc = kd.query(np.asarray(A['cup'])[None], k=10); S = surf_pts[kc[0]].mean(0); nS = surf_nrm[kc[0]].mean(0); nS /= np.linalg.norm(nS)
    rc = .021; cc = S - nS * (rc - .004)
    cup = lambda P_: smax(np.abs(np.linalg.norm(P_ - cc, axis=1) - rc) - .0018, -((P_ - cc) @ nS) + (rc - .0105), .002)
    xt = np.array([1., 0, 0]) - nS * nS[0]; xt /= np.linalg.norm(xt)
    for i, sd in enumerate((1, -1)):
        J, nJ = hug(np.asarray(A['J0'][i])[None], clr + .0015); J = J[0]
        for a0 in A['a0'][2 * i:2 * i + 2]:
            a0 = np.asarray(a0); path = a0 + np.linspace(0, 1, 14)[:, None] * (J - a0)
            path[2:-1], _ = hug(path[2:-1])
            for _ in range(3): path[2:-1] = (path[1:-2] + path[3:] + 2 * path[2:-1]) / 4; path[2:-1], _ = hug(path[2:-1])
            harness_strip(acc, path, kd, surf_pts, surf_nrm, .017)
        cend = S + xt * sd * .0175 + nS * .002
        path = J + np.linspace(0, 1, 12)[:, None] * (cend - J)
        path[1:-1], _ = hug(path[1:-1], clr + .0005)
        for _ in range(3): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4; path[1:-1], _ = hug(path[1:-1], clr + .0005)
        harness_strip(acc, path, kd, surf_pts, surf_nrm, .018)
        nn = nJ[0]; tg = np.array([0, 1., 0]) - nn * nn[1]; tg /= np.linalg.norm(tg)
        acc.box(J + nn * .0045, tg, np.cross(nn, tg), nn, (.011, .0095, .0032), ao=1., mid=2)
        acc.box(J + nn * .0072 + tg * .004, tg, np.cross(nn, tg), nn, (.004, .0035, .0012), ao=.9, mid=2)
    cv, cf, cn, cao = mesh_sdf(cup, cc - .03, cc + .03, .001, 700, smooth=2)
    acc.add(cv, cf, cao, 3)

def goggles(outer, edge, C, top):
    """ballistic goggles worn up on the front of the helmet cover (as in the reference photos): one wide smoked polycarbonate
    lens bulging forward in a moulded black rubber frame with a nose cut-out and vent slots along the top, an olive
    elastic strap round the cover (low at the back, through the rear retainers), side clips where strap meets frame"""
    yc = top - .046; H, W, rr = .031, .089, .019; R0 = .14
    def coords(P_):
        ph = np.arctan2(P_[:, 0], P_[:, 2] - C[2]); return ph, ph * R0, P_[:, 1] - yc
    def outline(u, v):
        q1 = np.abs(u) - (W - rr); q2 = np.abs(v) - (H - rr)
        rect = np.hypot(np.maximum(q1, 0), np.maximum(q2, 0)) + np.minimum(np.maximum(q1, q2), 0) - rr
        nose = .0215 - np.hypot(u * 1.1, v + H + .005)
        return np.maximum(rect, nose)
    def bul(u, v): return .0048 * np.clip(1 - (u / .09) ** 2, 0, 1) * np.clip(1 - (v / .034) ** 2, 0, 1)
    def frame(P_):
        ph, u, v = coords(P_); d = outer(P_); o = outline(u, v)
        f = smax(np.abs(d - .0105) - .0085, o, .004)
        win = np.maximum(o + .0088, .0128 - d)
        f = smax(f, -win, .0012)
        vent = np.maximum(np.maximum(np.abs(v - (H - .0035)) - .0018, .0185 - d), np.abs(np.sin(u * 6.283 / .016)) - .45 + (np.abs(u) > .072) * 9)
        return smax(f, -vent, .0006)
    def lens(P_):
        ph, u, v = coords(P_); d = outer(P_); o = outline(u, v)
        return smax(np.abs(d - .0142 - bul(u, v)) - .001, o + .0078, .0012)
    yR = top - .088
    def ys(ph): return yc - .002 + (yR - (yc - .002)) * ss(.75, 2.1, np.abs(ph))
    def strap(P_):
        ph, u, v = coords(P_); d = outer(P_)
        return smax(smax(np.abs(d - .0036) - .0014, np.abs(P_[:, 1] - ys(ph)) - .0175, .001), .6 - np.abs(ph), .01)
    fn = lambda P_: np.minimum(np.minimum(frame(P_), lens(P_)), strap(P_))
    lo = np.array([-.2, top - .14, C[2] - .22]); hi = np.array([.2, top - .005, C[2] + .22])
    v, f, n, ao = mesh_sdf(fn, lo, hi, .0011, 22000, smooth=2, ao_dist=.008)
    mid = np.where(lens(v) < .0006, 4, np.where(strap(v) < .0006, 3, 2))
    acc = Acc(); acc.add(v, f, ao, 0); acc.mid[-1] = mid
    # side clips joining strap and frame
    for sd in (1, -1):
        ph = sd * .655; d_ = np.array([np.sin(ph), 0, np.cos(ph)]); P0, ok = hits(lambda Q: outer(Q), np.array([C[0], yc - .002, C[2]]), d_[None], rmax=.35)
        nn = grad(lambda Q: outer(Q), P0)[0]; tg = np.array([0, 1., 0]) - nn * nn[1]; tg /= np.linalg.norm(tg)
        acc.box(P0[0] + nn * .0062, tg, np.cross(nn, tg), nn, (.0135, .0085, .0034), ao=.95, mid=2)
    return acc.out()

def harness_strip(acc, path, kd, head_pts, head_nrm, w, t=.0025):
    _, k = kd.query(path, k=8); nr = head_nrm[k].mean(1); nr /= np.linalg.norm(nr, axis=1, keepdims=True)
    tg = np.gradient(path, axis=0); tg /= np.linalg.norm(tg, axis=1, keepdims=True)
    b = np.cross(tg, nr); b /= np.linalg.norm(b, axis=1, keepdims=True)
    A_ = path - b * w / 2; B_ = path + b * w / 2
    acc.sheet(A_ + nr * t, B_ + nr * t, nr, 1., 1., 3)
    acc.sheet(B_, A_, -nr, .6, .6, 3)
    acc.sheet(A_, A_ + nr * t, -b, .8, .8, 3); acc.sheet(B_ + nr * t, B_, b, .8, .8, 3)

# ====================================================================== balaclava
def _head_field(vs, used, M, neck_y):
    """radius of the head in every direction (azimuth, elevation) round the skull centre, as a stretched cloth would see it:
    each direction takes the furthest skin point in a small cone (so it spans the eye sockets, under the chin, behind
    the ears), smoothed, and across the lower face it is bridged by the convex hull of each section"""
    from scipy.ndimage import gaussian_filter
    from scipy.interpolate import RegularGridInterpolator
    import facegen as FG
    from tsh import tube
    sk = vs[used]; hc = np.asarray(M) + np.array([0, .02, -.085])
    q = sk - hc; rq = np.linalg.norm(q, axis=1); dq = q / rq[:, None]
    hz = np.hypot(sk[:, 0], sk[:, 2] - (hc[2] - .03))
    keep = (rq < .21) & (sk[:, 1] > neck_y - .05) & ((sk[:, 1] > neck_y - .008) | (hz < .072)); kd = cKDTree(dq[keep]); rk = rq[keep]
    gP = np.linspace(-np.pi, np.pi, 360, endpoint=False); gE = np.radians(np.linspace(-89, 90, 180))
    GE, GP = np.meshgrid(gE, gP, indexing='ij')
    GD = np.stack([np.cos(GE) * np.sin(GP), np.sin(GE), np.cos(GE) * np.cos(GP)], -1)
    G0 = np.full(GE.shape, np.nan)
    for i in range(len(gE)):
        nb = kd.query_ball_point(GD[i], .055); G0[i] = [rk[n].max() if len(n) else np.nan for n in nb]
    for i in range(len(gE)):
        r = G0[i]; m = np.isnan(r)
        if m.all(): G0[i] = np.nanmean(G0); continue
        if m.any(): r[m] = np.interp(np.where(m)[0], np.where(~m)[0], r[~m], period=len(r))
    wp = lambda A, sg: gaussian_filter(np.pad(A, ((0, 0), (20, 20)), mode='wrap'), sg, mode='nearest')[:, 20:-20]
    from scipy.ndimage import maximum_filter
    Gm = maximum_filter(np.pad(G0, ((0, 0), (6, 6)), mode='wrap'), size=(3, 5), mode='nearest')[:, 6:-6]
    Gs = np.maximum(wp(Gm, (1.5, 1.7)), wp(G0, (.7, .8))) + .0014
    # stretched nylon does not follow the hollows between nose, cheeks, mouth and chin: across the lower face it spans
    # them in straight lines (the convex hull of each horizontal and each vertical section), so it runs flat from the
    # sides of the nose out to the cheekbones and straight down from the nose to the chin
    from scipy.spatial import ConvexHull
    def hull_ray(pts, dirs):
        H = ConvexHull(pts); n_, b_ = H.equations[:, :2], H.equations[:, 2]
        nd = dirs @ n_.T; t = np.where(nd > 1e-9, -b_[None] / np.where(nd > 1e-9, nd, 1), np.inf); return t.min(1)
    elD = np.degrees(gE)
    sec = np.abs(gP) < 1.45
    for i in np.where((elD > -66) & (elD < -6))[0]:
        w = ss(-66, -58, elD[i]) * ss(-6, -12, elD[i])
        d2 = np.stack([np.sin(gP[sec]), np.cos(gP[sec])], 1); pts = d2 * Gs[i, sec][:, None]
        pts = np.concatenate([pts, [[0, 0]]])
        Rh = hull_ray(pts, d2); Rh = np.where(np.isfinite(Rh), Rh, Gs[i, sec])
        Gs[i, sec] = Gs[i, sec] + (np.maximum(Gs[i, sec], Rh) - Gs[i, sec]) * w * ss(1.45, 1.15, np.abs(gP[sec]))
    rows = (elD > -78) & (elD < -2)
    for j in np.where(np.abs(gP) < 1.0)[0]:
        e_ = gE[rows]; d2 = np.stack([np.cos(e_), np.sin(e_)], 1); pts = np.concatenate([d2 * Gs[rows, j][:, None], [[0, 0]]])
        Rh = hull_ray(pts, d2); Rh = np.where(np.isfinite(Rh), Rh, Gs[rows, j])
        wj = ss(1.0, .7, abs(gP[j])) * ss(-78, -70, elD[rows]) * ss(-2, -8, elD[rows])
        Gs[rows, j] = Gs[rows, j] + (np.maximum(Gs[rows, j], Rh) - Gs[rows, j]) * wj
    Gs = np.maximum(Gs, wp(Gs, (.6, .6)))
    Gs = np.concatenate([Gs, Gs[:, :1]], 1); gPw = np.concatenate([gP, [np.pi]])
    fR = RegularGridInterpolator((gE, gPw), Gs, bounds_error=False, fill_value=None)
    return dict(hc=hc, sk=sk, fR=fR, gE=gE, gP=gP)

def balaclava(vs, used, M, neck_y, seed=0):
    """olive polyester balaclava worn under the helmet: a wrap of the head built in (azimuth, elevation) around the skull
    centre - the cloth spans the hollows (eye sockets, under the chin, behind the ears) because each direction takes the
    furthest skin point in a small cone, then the radius field is smoothed. Eye slot from the brows to the cheekbones with
    a rolled hem; it runs down the neck under the jacket collar. Returns geometry, AO and a head->neck skin weight."""
    from scipy.ndimage import gaussian_filter
    import facegen as FG
    from tsh import tube
    HF = _head_field(vs, used, M, neck_y); hc, sk, fR, gE, gP = HF['hc'], HF['sk'], HF['fR'], HF['gE'], HF['gP']
    NC, NR = 220, 150
    phi = np.linspace(-np.pi, np.pi, NC, endpoint=False)
    # lower edge: just below the neck base all round (the jacket collar hides it)
    elb = np.radians(-73 - 15 * np.maximum(np.cos(phi), 0) ** 2)
    T_ = np.linspace(0, 1, NR) ** 1.05
    EL = elb[None] + (np.radians(88) - elb[None]) * T_[:, None]; PH = np.broadcast_to(phi[None], EL.shape)
    D = np.stack([np.cos(EL) * np.sin(PH), np.sin(EL), np.cos(EL) * np.cos(PH)], -1)
    Rr = fR(np.stack([np.clip(EL, gE[0], gE[-1]), PH], -1))
    # the knit pulls in a little round the neck and sags a touch below the chin
    P = hc + D * Rr[..., None]
    # below the jaw the knit hugs the neck: pull each point in toward the neck surface (less under the chin, where it bridges)
    nm = (sk[:, 1] > neck_y - .06) & (sk[:, 1] < neck_y + .08) & ((np.hypot(sk[:, 0], sk[:, 2] - (hc[2] - .03)) < .085) | (sk[:, 1] > neck_y - .015))
    NS = sk[nm]; ycs = np.linspace(neck_y - .06, neck_y + .08, 15); ctrz = np.array([NS[np.abs(NS[:, 1] - y) < .012][:, 2].mean() if (np.abs(NS[:, 1] - y) < .012).any() else hc[2] - .03 for y in ycs])
    az_bins = np.linspace(-np.pi, np.pi, 37); RN = np.zeros((len(ycs), 36))
    for i, y in enumerate(ycs):
        q = NS[np.abs(NS[:, 1] - y) < .012]; a = np.arctan2(q[:, 0], q[:, 2] - ctrz[i]); r = np.hypot(q[:, 0], q[:, 2] - ctrz[i])
        for k in range(36):
            m = (a >= az_bins[k]) & (a < az_bins[k + 1]); RN[i, k] = r[m].max() if m.any() else np.nan
        row = RN[i]; bad = np.isnan(row)
        if bad.all(): RN[i] = .06
        elif bad.any(): row[bad] = np.interp(np.where(bad)[0], np.where(~bad)[0], row[~bad], period=36)
    RN = gaussian_filter(np.pad(RN, ((0, 0), (6, 6)), mode='wrap'), (1.4, 2.4))[:, 6:-6]
    py = P[..., 1]; cz_ = np.interp(py, ycs, ctrz); ax_ = np.arctan2(P[..., 0], P[..., 2] - cz_); rc = np.hypot(P[..., 0], P[..., 2] - cz_)
    fi = np.clip((py - ycs[0]) / (ycs[1] - ycs[0]), 0, len(ycs) - 1.001); fk = np.clip((ax_ + np.pi) / (2 * np.pi) * 36 - .5, 0, 34.999)
    i0 = fi.astype(int); k0 = fk.astype(int); tx = fi - i0; tk = fk - k0
    rN = (RN[i0, k0] * (1 - tx) * (1 - tk) + RN[np.minimum(i0 + 1, 14), k0] * tx * (1 - tk) + RN[i0, k0 + 1] * (1 - tx) * tk + RN[np.minimum(i0 + 1, 14), k0 + 1] * tx * tk) + .0035
    w = ss(neck_y + .055, neck_y + .01, py) * (1 - .55 * np.maximum(np.cos(ax_), 0) ** 2)
    rt = np.where(rc > rN, rc + (rN - rc) * w, rc)
    P = np.stack([np.sin(ax_) * rt, py, cz_ + np.cos(ax_) * rt], -1)
    # fabric: soft creases where it bunches at the neck and over the nose bridge
    # fabric: the knit is stretched tight over the skull and the nose; it gathers in soft horizontal rolls round the neck,
    # in shallow folds across the mask between nose and chin (pulled up over the nose), a few diagonal creases at the temples
    Pn = D.reshape(-1, 3); n1 = fbm(Pn * 3 + 7 + seed, 1, 3).reshape(EL.shape); n2 = fbm(Pn * 9 + 3 + seed, 1, 2).reshape(EL.shape)
    y_ = P[..., 1]; front = np.maximum(np.cos(PH), 0)
    fold = lambda t: np.clip(1 - np.abs(np.sin(t)) * 1.0, 0, 1) ** 2.4          # sharp-ish ridge every pi
    neckF = fold((y_ - neck_y) * 290 + n1 * 5 + PH * .6) * ss(neck_y + .075, neck_y + .035, y_) * (.6 + .4 * n2)
    jaw_y = M[1] - .115
    maskF = fold((y_ - jaw_y) * 230 + n1 * 3.5 + np.abs(PH) * 1.4) * ss(.15, .55, front) * ss(M[1] - .06, M[1] - .085, y_) * ss(jaw_y - .03, jaw_y + .005, y_) * (.5 + .5 * n2)
    templeF = fold((y_ - M[1]) * 160 + PH * 6 + n1 * 4) * ss(.9, 1.25, np.abs(PH)) * ss(1.9, 1.5, np.abs(PH)) * ss(M[1] - .03, M[1] + .02, y_) * ss(M[1] + .1, M[1] + .05, y_) * .5
    # tension lines: the knit is pulled tight from the tip of the nose, creasing down and out over the mouth toward the jaw
    nsel = (np.abs(sk[:, 0]) < .012) & (sk[:, 1] < M[1] - .02) & (sk[:, 1] > M[1] - .09); nose = sk[nsel][np.argmax(sk[nsel][:, 2])]
    dyn = nose[1] - y_; an = np.arctan2(np.abs(P[..., 0]), np.maximum(dyn, 1e-4)); dn = np.hypot(P[..., 0], dyn)
    tens = sum(np.exp(-((an - a0) / .05) ** 2) for a0 in (.6,)) * ss(.008, .02, dn) * ss(.05, .03, dn) * (dyn > 0) * ss(.3, .7, front)
    cre = neckF * .0032 + maskF * .0012 + templeF * .0012 + tens * .00045 + (n2 - .5) * .0004
    P = P + D * cre[..., None]
    for _ in range(2):
        Pp = np.pad(P, ((1, 1), (0, 0), (0, 0)), mode='edge'); lap = (Pp[:-2] + Pp[2:] + np.roll(P, 1, 1) + np.roll(P, -1, 1)) / 4 - P
        P = P + .35 * lap
    wn = ss(neck_y + .08, neck_y + .03, P[..., 1])[..., None]
    for _ in range(6):
        P = P + .45 * wn * ((np.roll(P, 1, 1) + np.roll(P, -1, 1)) / 2 - P)
    # eye slot (superellipse in azimuth/elevation), centred on the eyes
    e0 = np.arctan2(M[1] - hc[1], M[2] - hc[2])
    # eye slot (from the reference): a dead-straight lower edge running level across the bridge of the nose just under
    # the eyes, and an upper edge that arches over the brows - highest in the middle of the forehead, curving down to
    # meet the lower line at the temples. Defined in height (y) against azimuth, so nothing dips over the nose.
    yb, Hh, phm = M[1] - .0125, .039, np.radians(47)
    ytopf = lambda u: yb + Hh * np.clip(1 - np.abs(u) ** 1.9, 0, 1) ** .5
    uu = PH / phm; slot = (np.abs(uu) < 1) & (P[..., 1] > yb) & (P[..., 1] < ytopf(uu))
    # snap the edge vertices onto the exact outline (the grid would otherwise leave a staircase): top/bottom edges by
    # sliding along their column to the edge height, side edges along their row to the edge azimuth
    rm = np.zeros((NR, NC), bool)
    for di in (0, 1):
        for dj in (0, 1): rm |= np.roll(np.pad(slot, ((1, 0), (0, 0)))[:-1] if di else slot, dj, 1)
    keepq = ~(slot | np.roll(slot, -1, 1) | np.vstack([slot[1:], slot[-1:]]) | np.roll(np.vstack([slot[1:], slot[-1:]]), -1, 1))
    bnd = (~slot) & np.zeros_like(slot)
    for i in range(1, NR - 1):
        for j in range(NC):
            if slot[i, j]: continue
            nb = [slot[i - 1, j], slot[i + 1, j], slot[i, (j - 1) % NC], slot[i, (j + 1) % NC], slot[i - 1, (j - 1) % NC], slot[i + 1, (j + 1) % NC], slot[i - 1, (j + 1) % NC], slot[i + 1, (j - 1) % NC]]
            if any(nb): bnd[i, j] = True
    P0 = P.copy()
    for i, j in zip(*np.where(bnd)):
        u = PH[i, j] / phm; y = P0[i, j, 1]; yt = float(ytopf(np.array(u)))
        col = P0[:, j, 1]
        # which edge is nearest: the flat bottom, the arch (along the column) or the arch's end (along the row)
        if abs(u) < .97 and (abs(y - yb) <= abs(y - yt)): ty = yb
        elif abs(u) < .8: ty = yt
        else: ty = None
        if ty is not None:
            k = i + (1 if ty > col[i] else -1)
            if 0 <= k < NR and (col[k] - ty) * (col[i] - ty) <= 0 and col[k] != col[i]:
                t = (ty - col[i]) / (col[k] - col[i]); P[i, j] = P0[i, j] + (P0[k, j] - P0[i, j]) * t
        else:
            r_ = np.clip((y - yb) / Hh, 0, .999); tp = np.sign(u) * phm * (1 - r_ ** (1 / .5)) ** (1 / 1.9)
            k = (j + (1 if tp > PH[i, j] else -1)) % NC; dp = PH[i, k] - PH[i, j]
            if abs(dp) < .2 and dp != 0:
                t = np.clip((tp - PH[i, j]) / dp, 0, 1); P[i, j] = P0[i, j] + (P0[i, k] - P0[i, j]) * t
    # mesh
    vid = np.arange(NR * NC).reshape(NR, NC); Vo = P.reshape(-1, 3)
    F = []
    for i in range(NR - 1):
        for j in range(NC):
            j2 = (j + 1) % NC
            if slot[i, j] or slot[i + 1, j] or slot[i, j2] or slot[i + 1, j2]: continue
            F += [[vid[i, j], vid[i + 1, j], vid[i + 1, j2]], [vid[i, j], vid[i + 1, j2], vid[i, j2]]]
    pole = len(Vo); Vo = np.concatenate([Vo, (hc + np.array([0, Rr[-1].mean(), 0]))[None]])
    for j in range(NC): F.append([vid[NR - 1, j], pole, vid[NR - 1, (j + 1) % NC]])
    F = np.array(F)
    used_v = np.zeros(len(Vo), bool); used_v[np.unique(F)] = True
    nrm = normals(Vo, F)
    if (nrm[used_v] * (Vo[used_v] - hc)).sum(1).mean() < 0: F = F[:, ::-1]; nrm = -nrm
    # thickness: inner surface + rim strip along both boundaries
    nO = len(Vo); Vi = Vo - nrm * .0011
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); key = set(map(tuple, e))
    bd = [(a, b) for a, b in e if (b, a) not in key]
    Fr = np.array([[a, b + nO, a + nO] for a, b in bd] + [[a, b, b + nO] for a, b in bd])
    # the inside only shows near the openings: keep inner faces within a few rows of a boundary
    near = np.zeros(nO, bool); near[np.unique(np.array(bd).ravel())] = True
    import scipy.sparse as sp_
    A_ = sp_.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(nO, nO)).tocsr()
    for _ in range(5): near = near | (np.asarray(A_ @ near.astype(float)).ravel() > 0) | (np.asarray(A_.T @ near.astype(float)).ravel() > 0)
    Fi = F[near[F].all(1)]
    V = np.concatenate([Vo, Vi]); Fall = np.concatenate([F, Fi[:, ::-1] + nO, Fr])
    # rolled hem round the eye slot
    nxt = {a: b for a, b in bd}; loops = []; seen = set()
    for a, _ in bd:
        if a in seen: continue
        lp = [a]; seen.add(a); c = nxt[a]
        while c != a and c not in seen and c in nxt: lp.append(c); seen.add(c); c = nxt[c]
        if len(lp) > 12: loops.append(lp)
    hv, hf = [], []; o_ = len(V)
    for lp in loops:
        if Vo[lp][:, 1].mean() < neck_y + .02: continue                   # the bottom edge is hidden under the collar
        path = Vo[lp] - nrm[lp] * .0008; keep_ = np.r_[True, np.linalg.norm(np.diff(path, axis=0), axis=1) > .0012]; path = path[keep_]; path = np.concatenate([path, path[:1]])
        for _ in range(6): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
        tv, tf = tube(path, .0017, 7); hv.append(tv); hf.append(tf + o_); o_ += len(tv)
    if hv: V = np.concatenate([V] + hv); Fall = np.concatenate([Fall] + hf)
    # AO against the head and the cloth itself
    occ = np.concatenate([Vo[used_v], sk[np.linalg.norm(sk - hc, axis=1) < .22]])
    ao = np.ones(len(V)); ao_o = np.ones(nO); ao_o[used_v] = FG.depth_ao(Vo[used_v], nrm[used_v], occ, n_dir=64, px=.0024, ctr=hc, rad=.23)
    ao[:nO] = ao_o; ao[nO:2 * nO] = ao_o * .55
    if hv: ao[2 * nO:] = .85
    uv_ = np.unique(Fall); remap = -np.ones(len(V), int); remap[uv_] = np.arange(len(uv_))
    V = V[uv_]; ao = ao[uv_]; Fall = remap[Fall]
    wkn = ss(neck_y + .085, neck_y + .01, V[:, 1])
    # which skin vertices are under the cloth (they are not drawn, so a moving jaw or an expression can never poke through)
    qa = vs - hc; ra = np.linalg.norm(qa, axis=1); el_a = np.arcsin(np.clip(qa[:, 1] / np.maximum(ra, 1e-9), -1, 1)); ph_a = np.arctan2(qa[:, 0], qa[:, 2])
    elb_a = np.radians(-73 - 15 * np.maximum(np.cos(ph_a), 0) ** 2); ua = ph_a / phm
    in_slot = (np.abs(ua) < 1.06) & (vs[:, 1] > yb - .004) & (vs[:, 1] < ytopf(np.clip(ua, -1, 1)) + .005)
    covered = (el_a > elb_a + .06) & ~in_slot & (ra < .2)
    return dict(v=V, f=Fall, ao=ao, mid=np.zeros(len(V), int), wkn=wkn, covered=covered)

# ====================================================================== GP-5 hood
def gp5(vs, used, M, neck_y, mouth, eL, eR, seed=0):
    """Soviet GP-5 gas mask: a one-piece moulded grey rubber helmet-mask pulled over the whole head down to the neck - smooth
    and taut over the skull, with a seam over the crown, two round eyepiece seats in front of the eyes, and the rubber moulded
    out round the valve box in front of the mouth. The glass, the rings, the valve box and the filter are built in the game
    at the anchors returned here."""
    from scipy.ndimage import gaussian_filter
    import facegen as FG
    from tsh import tube
    HF = _head_field(vs, used, M, neck_y); hc, sk, fR, gE, gP = HF['hc'], HF['sk'], HF['fR'], HF['gE'], HF['gP']
    NC, NR = 200, 130
    phi = np.linspace(-np.pi, np.pi, NC, endpoint=False)
    elb = np.radians(-60 - 14 * np.maximum(np.cos(phi), 0) ** 2)
    T_ = np.linspace(0, 1, NR) ** 1.05
    EL = elb[None] + (np.radians(88) - elb[None]) * T_[:, None]; PH = np.broadcast_to(phi[None], EL.shape)
    D = np.stack([np.cos(EL) * np.sin(PH), np.sin(EL), np.cos(EL) * np.cos(PH)], -1)
    Rr = fR(np.stack([np.clip(EL, gE[0], gE[-1]), PH], -1))
    Rr = gaussian_filter(np.pad(Rr, ((0, 0), (8, 8)), mode='wrap'), (2.2, 2.2))[:, 8:-8]          # rubber spans every hollow
    P = hc + D * (Rr + .006)[..., None]
    front = np.maximum(np.cos(PH), 0); y_ = P[..., 1]
    # the valve-box moulding in front of the mouth and the chin cup under it
    mz = np.exp(-((y_ - (mouth[1] - .004)) / .026) ** 2 - (PH / .42) ** 2)
    P = P + D * (.017 * mz)[..., None]
    chin = np.exp(-((y_ - (mouth[1] - .045)) / .02) ** 2 - (PH / .6) ** 2); P = P + D * (.004 * chin)[..., None]
    # eyepiece seats: a raised flat ring round each eye, its face turned slightly outward
    anchors = {}
    for nm_, e_ in (('eyeL', eL), ('eyeR', eR)):
        d0 = (np.asarray(e_) - hc); d0 = d0 / np.linalg.norm(d0)
        cs = (D * d0).sum(-1); ang = np.arccos(np.clip(cs, -1, 1))
        seat = ss(.33, .2, ang)
        P = P + D * (.006 * seat)[..., None]
        k = np.unravel_index(np.argmax(cs), cs.shape)
        anchors[nm_] = [P[k].tolist(), d0.tolist()]
    # the seam over the crown and down the back, a few soft folds where the rubber gathers at the nape
    seam = np.exp(-(np.minimum(np.abs(PH), np.abs(np.abs(PH) - np.pi)) / .03) ** 2) * ss(np.radians(10), np.radians(40), EL)
    nape = (1 - front) * ss(neck_y + .06, neck_y + .01, y_)
    Pn = D.reshape(-1, 3); n1 = fbm(Pn * 4 + seed, 1, 3).reshape(EL.shape)
    folds = np.clip(1 - np.abs(np.sin(PH * 9 + n1 * 3)), 0, 1) ** 3 * nape
    P = P + D * (seam * .0012 + folds * .0018)[..., None]
    for _ in range(2):
        Pp = np.pad(P, ((1, 1), (0, 0), (0, 0)), mode='edge'); lap = (Pp[:-2] + Pp[2:] + np.roll(P, 1, 1) + np.roll(P, -1, 1)) / 4 - P
        P = P + .3 * lap
    # anchors for the valve box (on the moulding) and the filter thread under it
    k = np.unravel_index(np.argmax(mz * front), mz.shape); anchors['valve'] = [P[k].tolist(), D[k].tolist()]
    vid = np.arange(NR * NC).reshape(NR, NC); Vo = P.reshape(-1, 3); F = []
    for i in range(NR - 1):
        for j in range(NC):
            j2 = (j + 1) % NC; F += [[vid[i, j], vid[i + 1, j], vid[i + 1, j2]], [vid[i, j], vid[i + 1, j2], vid[i, j2]]]
    pole = len(Vo); Vo = np.concatenate([Vo, (hc + np.array([0, Rr[-1].mean() + .006, 0]))[None]])
    for j in range(NC): F.append([vid[NR - 1, j], pole, vid[NR - 1, (j + 1) % NC]])
    F = np.array(F); nrm = normals(Vo, F)
    if (nrm * (Vo - hc)).sum(1).mean() < 0: F = F[:, ::-1]; nrm = -nrm
    # a rolled bead round the bottom edge
    path = P[0] + D[0] * .0005; path = np.concatenate([path, path[:1]]); tv, tf = tube(path, .0028, 8)
    V = np.concatenate([Vo, tv]); Fall = np.concatenate([F, tf + len(Vo)])
    occ = np.concatenate([Vo, sk[np.linalg.norm(sk - hc, axis=1) < .22]])
    ao = np.ones(len(V)); ao[:len(Vo)] = FG.depth_ao(Vo, nrm, occ, n_dir=48, px=.0026, ctr=hc, rad=.23); ao[len(Vo):] = .8
    mid = np.zeros(len(V), int)
    wkn = ss(neck_y + .085, neck_y + .01, V[:, 1])
    qa = vs - hc; ra = np.linalg.norm(qa, axis=1); el_a = np.arcsin(np.clip(qa[:, 1] / np.maximum(ra, 1e-9), -1, 1)); ph_a = np.arctan2(qa[:, 0], qa[:, 2])
    elb_a = np.radians(-60 - 14 * np.maximum(np.cos(ph_a), 0) ** 2)
    covered = (el_a > elb_a + .05) & (ra < .2)
    return dict(v=V, f=Fall, ao=ao, mid=mid, wkn=wkn, covered=covered, anchors=anchors)

# ====================================================================== gas mask
def gasmask(vs, used, M, neck_y, mouth, seed=0):
    """PMK-type gas mask (reference photo): a moulded olive-grey rubber face piece sealing from the forehead round the
    temples and cheeks to under the chin, bulging out over the nose and mouth; one wide panoramic lens in a raised rim;
    a rolled seal edge; head straps back over the temples and two up over the crown, with buckles at the face piece.
    The speech diaphragm, exhale valve and the cheek filter with its cloth cover are built in the game at the anchors
    returned here. Built round this character's own head; also returns which skin vertices it covers."""
    from scipy.ndimage import gaussian_filter
    from scipy.spatial import ConvexHull
    import facegen as FG
    from tsh import tube
    HF = _head_field(vs, used, M, neck_y); hc, sk, fR = HF['hc'], HF['sk'], HF['fR']
    el_of = lambda p: np.arcsin(np.clip((p - hc)[..., 1] / np.linalg.norm(p - hc, axis=-1), -1, 1))
    el_e = float(el_of(np.asarray(M))); el_m = float(el_of(np.asarray(mouth)))
    NC, NR = 200, 150
    PHm = 1.5; ph = np.linspace(-1.62, 1.62, NC); el = np.radians(np.linspace(-78, 52, NR))
    EL, PH = np.meshgrid(el, ph, indexing='ij')
    D = np.stack([np.cos(EL) * np.sin(PH), np.sin(EL), np.cos(EL) * np.cos(PH)], -1)
    R0 = fR(np.stack([EL, PH], -1))
    # seal outline: forehead above the brows, down the temples in front of the ears, round under the chin
    def seal(ph_, el_):
        a = ph_ / PHm; top = np.radians(37 - 21 * a ** 2); bot = np.radians(-51 + 17 * a ** 2)
        b = (el_ - (top + bot) / 2) / ((top - bot) / 2)
        return np.abs(a) ** 4 + np.abs(b) ** 4                           # < 1 inside
    def visor(ph_, el_):
        return np.abs(ph_ / 1.1) ** 4 + np.abs((el_ - (el_e + np.radians(1.5))) / np.radians(14)) ** 4
    # face piece: standoff over the skin, a bulge over nose and mouth (the inner nose cup and the valve body), a pad on the
    # left cheek where the filter mounts; then made convex section by section like a moulding
    st = .0048 + .019 * np.exp(-((PH / .5) ** 2 + ((EL - (el_m + np.radians(6))) / .4) ** 2)) + .009 * np.exp(-(((PH - .78) / .3) ** 2 + ((EL - el_m) / .3) ** 2))
    R = R0 + st
    def hull_ray(pts, dirs):
        H = ConvexHull(pts); n_, b_ = H.equations[:, :2], H.equations[:, 2]
        nd = dirs @ n_.T; t = np.where(nd > 1e-9, -b_[None] / np.where(nd > 1e-9, nd, 1), np.inf); return t.min(1)
    for it in range(2):
        for i in range(NR):
            d2 = np.stack([np.sin(PH[i]), np.cos(PH[i])], 1); pts = np.concatenate([d2 * R[i][:, None], [[0, 0]]])
            Rh = hull_ray(pts, d2); R[i] = np.where(np.isfinite(Rh), np.maximum(R[i], Rh), R[i])
        for j in range(NC):
            d2 = np.stack([np.cos(EL[:, j]), np.sin(EL[:, j])], 1); pts = np.concatenate([d2 * R[:, j][:, None], [[0, 0]]])
            Rh = hull_ray(pts, d2); R[:, j] = np.where(np.isfinite(Rh), np.maximum(R[:, j], Rh), R[:, j])
        R = np.maximum(R, gaussian_filter(R, 1.2))
    # the lens: a smooth, nearly cylindrical sheet standing well off the eyes
    vm = visor(PH, EL) < 1.4
    Rl = np.where(vm, R, np.nan); Rl = np.where(np.isnan(Rl), R, Rl)
    Rl = gaussian_filter(np.maximum(Rl, R0 + .019), 5); Rl = np.maximum(Rl, R0 + .016); Rl = gaussian_filter(Rl, 3)
    wv = np.clip(1.6 - visor(PH, EL), 0, 1); R = R + (np.maximum(R, Rl) - R) * wv
    R = gaussian_filter(R, .8)
    # soft moulded detail: a faint ridge round the lens and the seal flange
    R += .0012 * np.exp(-((visor(PH, EL) - 1.12) / .12) ** 2)
    P = hc + D * R[..., None]
    inside = seal(PH, EL) < 1; lensF = visor(PH, EL) < 1
    vid = np.arange(NR * NC).reshape(NR, NC)
    Fr, Fl = [], []
    for i in range(NR - 1):
        for j in range(NC - 1):
            q = [(i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)]
            if not all(inside[a] for a in q): continue
            tri = [[vid[i, j], vid[i + 1, j], vid[i + 1, j + 1]], [vid[i, j], vid[i + 1, j + 1], vid[i, j + 1]]]
            (Fl if all(lensF[a] for a in q) else Fr).extend(tri)
    Vg = P.reshape(-1, 3)
    def part(F):
        F = np.array(F); u = np.unique(F); rm = -np.ones(len(Vg), int); rm[u] = np.arange(len(u)); return Vg[u], rm[F]
    Vr, Fr = part(Fr); Vl, Fl = part(Fl)
    def orient(V, F):
        n = normals(V, F)
        if (n * (V - hc)).sum(1).mean() < 0: F = F[:, ::-1]; n = -n
        return F, n
    Fr, nr = orient(Vr, Fr); Fl, nl = orient(Vl, Fl)
    acc = Acc()
    # rubber with thickness (inner surface shows only at the seal edge)
    def boundary(F):
        e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); key = set(map(tuple, e)); return [(a, b) for a, b in e if (b, a) not in key]
    bd = boundary(Fr); nO = len(Vr); Vi = Vr - nr * .0028
    Fs = np.array([[a, b + nO, a + nO] for a, b in bd] + [[a, b, b + nO] for a, b in bd])
    acc.add(np.concatenate([Vr, Vi]), np.concatenate([Fr, Fr[:, ::-1] + nO, Fs]), 1., 0)
    acc.add(np.concatenate([Vl, Vl - nl * .0022]), np.concatenate([Fl, Fl[:, ::-1] + len(Vl)]), 1., 1)
    # rolled seal edge and the lens rim (tubes along the boundary loops)
    def loops(bd_, V):
        nxt = {a: b for a, b in bd_}; out = []; seen = set()
        for a, _ in bd_:
            if a in seen: continue
            lp = [a]; seen.add(a); c = nxt[a]
            while c != a and c not in seen and c in nxt: lp.append(c); seen.add(c); c = nxt[c]
            if len(lp) > 12: out.append(V[lp])
        return out
    for path in loops(boundary(Fl), Vl):
        path = np.concatenate([path, path[:1]])
        for _ in range(4): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
        tv, tf = tube(path, .0042, 9); acc.add(tv, tf, 1., 2)
    lpR = loops(bd, Vr)
    outer_loop = max(lpR, key=len)
    path = np.concatenate([outer_loop, outer_loop[:1]]) - 0
    for _ in range(4): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
    tv, tf = tube(path, .0028, 8); acc.add(tv, tf, 1., 0)
    # head straps: two from each temple and cheek back round the head, two up over the crown; buckles at the face piece
    fRs = lambda e_, p_: fR(np.stack([e_, p_], -1))
    Dir = lambda e_, p_: np.stack([np.cos(e_) * np.sin(p_), np.sin(e_), np.cos(e_) * np.cos(p_)], -1)
    hp_, hn_ = [], []
    gE, gP = np.meshgrid(np.radians(np.linspace(-60, 89, 120)), np.linspace(-np.pi, np.pi, 240), indexing='ij')
    hp_ = (hc + Dir(gE, gP) * (fRs(gE, gP) + .0025)[..., None]).reshape(-1, 3); hn_ = Dir(gE, gP).reshape(-1, 3)
    kdh = cKDTree(hp_)
    straps = []
    for sd in (1, -1):
        straps.append(([sd * 1.43, sd * 2.05, sd * 2.55, sd * 2.9], [8, 12, 14, 12]))
        straps.append(([sd * 1.38, sd * 1.95, sd * 2.5, sd * 2.85], [-30, -24, -14, -6]))
        straps.append(([sd * .32, sd * .3, sd * .34, sd * .5], [33, 50, 66, 80]))
    for phs, els in straps:
        t = np.linspace(0, 1, 24); pp = np.interp(t, np.linspace(0, 1, len(phs)), phs); ee = np.radians(np.interp(t, np.linspace(0, 1, len(els)), els))
        path = hc + Dir(ee, pp) * (fRs(ee, pp) + .0032)[:, None]
        for _ in range(3): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
        harness_strip(acc, path, kdh, hp_, hn_, .02, t=.0022)
        e0 = ee[0]; p0 = pp[0]; b0 = hc + Dir(e0, p0) * (fRs(e0, p0) + .009); nn = Dir(e0, p0); tg = path[2] - path[0]; tg -= nn * (tg @ nn); tg /= np.linalg.norm(tg)
        acc.box(b0, tg, np.cross(nn, tg), nn, (.011, .012, .003), ao=.9, mid=2)
    G = acc.out()
    # AO against the head and itself
    occ = np.concatenate([G['v'], sk[np.linalg.norm(sk - hc, axis=1) < .22]])
    nG = normals(G['v'], G['f']); G['ao'] = np.clip(FG.depth_ao(G['v'], nG, occ, n_dir=48, px=.0025, ctr=hc, rad=.24), .25, 1)
    # anchors for the parts built in the game: speech diaphragm front-right, exhale valve below it, filter on the left cheek
    def anchor(ph_, el_, push=0.):
        i = np.argmin(np.abs(el - el_)); j = np.argmin(np.abs(ph - ph_))
        p = P[i, j]; du = P[i, min(j + 1, NC - 1)] - P[i, max(j - 1, 0)]; dv = P[min(i + 1, NR - 1), j] - P[max(i - 1, 0), j]
        n = np.cross(du, dv); n /= np.linalg.norm(n)
        if n @ (p - hc) < 0: n = -n
        return [(p + n * push).tolist(), n.tolist()]
    anchors = dict(dia=anchor(-.2, el_m + np.radians(3)), valve=anchor(-.02, el_m - np.radians(15)), filt=anchor(.86, el_m - np.radians(2)))
    # skin under the rubber is not drawn (the eyes stay visible through the lens)
    qa = vs - hc; ra = np.linalg.norm(qa, axis=1); el_a = np.arcsin(np.clip(qa[:, 1] / np.maximum(ra, 1e-9), -1, 1)); ph_a = np.arctan2(qa[:, 0], qa[:, 2])
    covered = (seal(ph_a, el_a) < .9) & (visor(ph_a, el_a) > 1.25) & (ra < .2) & (np.abs(ph_a) < PHm)
    G['covered'] = covered; G['anchors'] = anchors
    return G


def gasmask2(vs, used, M, neck_y, mouth, seed=0):
    """PMK-type gas mask, modelled as a moulding rather than a skin wrap: an egg-shaped rubber face piece (wider over the
    eyes, narrowing to a rounded chin) whose inside is the wearer's face; one wide panoramic lens set into its upper half in
    a raised black frame; a protruding valve body in front of the mouth; a boss on the left cheek for the filter; head
    straps round the head with buckles at the face piece. The emitter, exhale valve and filter canister are built in the
    game at the anchors returned here."""
    import facegen as FG
    sk = vs[used]; M = np.asarray(M, float); mouth = np.asarray(mouth, float); hc = M + np.array([0, .02, -.085])
    kd = cKDTree(sk)
    def dskin(P):                                                           # signed, and smoothed over the 8 nearest skin samples
        d, k = kd.query(P, 8); q = sk[k]; nq = q - hc; nq /= np.linalg.norm(nq, axis=2, keepdims=True)
        sd = ((P[:, None] - q) * nq).sum(2); w = 1 / (d + .002) ** 2; return (sd * w).sum(1) / w.sum(1)
    def front(x0, y0, y1, w=.01):
        m = (np.abs(sk[:, 0] - x0) < w) & (sk[:, 1] > y0) & (sk[:, 1] < y1); q = sk[m]; return q[np.argmax(q[:, 2])]
    nose = front(0, M[1] - .065, M[1] - .015); chin = front(0, mouth[1] - .075, mouth[1] - .03)
    top = M[1] + .045; bot = chin[1] - .03
    C = np.array([0, (top + bot) / 2, nose[2] - .074]); b = (top - bot) / 2; a = .09; c = nose[2] + .026 - C[2]
    def ell(P):
        q = P - C; v = q[:, 1] / b; aa = a * (.8 + .2 * np.clip(v, -1, 1)) * (1 - .14 * np.clip(-v - .3, 0, 1)); cz = c * (1 - .06 * np.clip(-v, 0, 1))
        k = (np.abs(q[:, 0] / aa) ** 2.4 + np.abs(v) ** 2.4 + np.abs(q[:, 2] / cz) ** 2.4) ** (1 / 2.4)
        return (k - 1) * np.minimum(aa, np.minimum(b, cz)) * .9
    def win(P):
        q = P - C; v = q[:, 1] / b; aa = a * (.8 + .2 * np.clip(v, -1, 1)) * (1 - .14 * np.clip(-v - .3, 0, 1)); u = q[:, 0] / aa
        dip = .12 * np.exp(-(u / .2) ** 2)                                  # the lower edge rises over the nose
        return ((np.abs(u / .88) ** 4 + np.abs((v - .43 - dip * .5) / (.3 - dip * .5)) ** 4) ** .25 - 1) * .07
    back = lambda P: (C[2] - .028) - P[:, 2]
    # the lens is a smooth moulded shell: push the face piece forward until the brows, lids and nose bridge behind it have
    # at least 12 mm of air (otherwise the lens would have to follow the face and catch the light in facets)
    skw = sk[(win(sk) < 0) & (np.abs(sk[:, 0]) < .055) & (sk[:, 2] > C[2] + .02)]; c0 = c
    for _ in range(8):
        e_ = ell(skw).max() if len(skw) else -1
        if e_ < -.012 or c > c0 + .012: break
        c = min(c0 + .012, c + (e_ + .0125) / .9 * 1.2)
    def outline(P):                                                         # the face piece's edge seen from the front
        q = P - C; v = q[:, 1] / b; aa = a * (.8 + .2 * np.clip(v, -1, 1)) * (1 - .14 * np.clip(-v - .3, 0, 1))
        k = (np.abs(q[:, 0] / aa) ** 2.4 + np.abs(v) ** 2.4) ** (1 / 2.4); return (k - 1) * np.minimum(aa, b) * .9
    def S(P):                                                               # moulded outer surface: never closer than 8 mm to the face
        return smin(ell(P), dskin(P) - .008, .006)
    snA = np.array([0, mouth[1] + .006, nose[2] - .03]); snB = snA + np.array([0, -.02, .036])
    def snout(P):
        ab = snB - snA; t = np.clip(((P - snA) @ ab) / (ab @ ab), 0, 1); return np.linalg.norm(P - (snA + t[:, None] * ab), axis=1) - (.036 - .008 * t)
    # the filter boss on the left cheek
    dF = np.array([.93, -.3, .2]); dF /= np.linalg.norm(dF)
    PF, _ = hits(lambda P: ell(P), C, dF[None], rmax=.2); PF = PF[0]; nF = grad(lambda P: ell(P), PF[None])[0]
    nF = (nF + dF) / 2; nF /= np.linalg.norm(nF)
    def boss(P):
        ab = nF * .016; A_ = PF - nF * .006; t = np.clip(((P - A_) @ ab) / (ab @ ab), 0, 1); return np.linalg.norm(P - (A_ + t[:, None] * ab), axis=1) - .024
    # strap buttons at the temples and the cheeks
    btn = []
    for sd in (1, -1):
        for dd in ((.97, .32, .05), (.9, -.42, .08)):
            d_ = np.array([sd * dd[0], dd[1], dd[2]]); d_ /= np.linalg.norm(d_); Pb, _ = hits(lambda P: ell(P), C, d_[None], rmax=.2); nb = grad(lambda P: ell(P), Pb)[0]; btn.append((Pb[0], nb))
    def buttons(P):
        out = np.full(len(P), 9.)
        for Pb, nb in btn:
            q = P - Pb; t = q @ nb; r = np.linalg.norm(q - np.outer(t, nb), axis=1)
            out = np.minimum(out, smax(r - .0085, np.abs(t - .002) - .004, .0015))
        return out
    def body(P):
        r = smin(S(P), snout(P), .016); r = smin(r, boss(P), .005)
        r = smax(r, outline(P), .003)                                       # a clean rounded edge where the seal meets the face
        return smax(smax(r, -(dskin(P) - .0025), .002), back(P), .006)
    def rubber(P):
        return smax(body(P), -win(P), .0025)
    def lens(P):
        return smax(np.abs(S(P) + .0012) - .0021, win(P) + .0015, .0015)
    def frame(P):
        e = S(P); return smax(smax(np.abs(win(P)) - .0058, e - .0042, .002), -e - .0065, .002)
    fn = lambda P: np.minimum(np.minimum(np.minimum(rubber(P), lens(P)), frame(P)), buttons(P))
    lo = C - np.array([.13, .14, .1]); hi = C + np.array([.13, .14, .16])
    print("mask depth", round(c, 4)); v, f, n, ao = mesh_sdf(fn, lo, hi, .0011, 34000, smooth=2, ao_fn=lambda P: np.minimum(fn(P), dskin(P)), ao_dist=.01)
    # materials follow the analytic window contour (not the noisy per-vertex distances), so the frame/lens/rubber borders are clean lines
    wv = win(v); fv = frame(v)
    mid = np.where((wv < -.0058) & (fv > .0004), 1, np.where(((wv < .0058) & (fv < .0012)) | (buttons(v) < .0006), 2, 0))
    # the lens is moulded polycarbonate: project its vertices exactly onto the smooth lens surfaces so it reads glass-clear
    L = mid == 1
    for _ in range(3):
        g_ = grad(S, v[L]); e_ = S(v[L]); inner = e_ < -.0012
        tgt = np.where(inner, -.0033, .0009); v[L] = v[L] - g_ * (e_ - tgt)[:, None]
    # keep only the outer skin of the lens: one clean sheet of glass (the inner face and the rim between would read as shards)
    inner = np.zeros(len(v), bool); inner[L] = S(v[L]) < -.0012
    f = f[~inner[f].any(1)]
    acc = Acc(); acc.add(v, f, ao, 0); acc.mid[-1] = mid
    # head straps: from the temples and cheeks round the back, two up over the crown, buckles at the face piece
    HF = _head_field(vs, used, M, neck_y); fR = HF['fR']
    fRs = lambda e_, p_: fR(np.stack([e_, p_], -1))
    Dir = lambda e_, p_: np.stack([np.cos(e_) * np.sin(p_), np.sin(e_), np.cos(e_) * np.cos(p_)], -1)
    gE, gP = np.meshgrid(np.radians(np.linspace(-60, 89, 120)), np.linspace(-np.pi, np.pi, 240), indexing='ij')
    hp_ = (hc + Dir(gE, gP) * (fRs(gE, gP) + .0025)[..., None]).reshape(-1, 3); hn_ = Dir(gE, gP).reshape(-1, 3); kdh = cKDTree(hp_)
    for sd in (1, -1):
        for phs, els in (([sd * 1.3, sd * 2.0, sd * 2.55, sd * 2.9], [10, 13, 14, 12]), ([sd * 1.25, sd * 1.95, sd * 2.5, sd * 2.85], [-26, -22, -14, -6]),
                         ([sd * .3, sd * .3, sd * .34, sd * .5], [30, 50, 66, 80])):
            t = np.linspace(0, 1, 24); pp = np.interp(t, np.linspace(0, 1, len(phs)), phs); ee = np.radians(np.interp(t, np.linspace(0, 1, len(els)), els))
            path = hc + Dir(ee, pp) * (fRs(ee, pp) + .0032)[:, None]
            for _ in range(3): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
            harness_strip(acc, path, kdh, hp_, hn_, .02, t=.0022)
            nn = Dir(ee[0], pp[0]); tg = path[2] - path[0]; tg -= nn * (tg @ nn); tg /= np.linalg.norm(tg)
            acc.box(path[0] + nn * .006, tg, np.cross(nn, tg), nn, (.011, .012, .003), ao=.9, mid=2)
    G = acc.out()
    def anchor(d, push=0.):
        d = np.asarray(d, float); d /= np.linalg.norm(d); o = (snA + snB) / 2
        P0, _ = hits(rubber, o, d[None], rmax=.12); nn = grad(rubber, P0)[0]; return [(P0[0] + nn * push).tolist(), nn.tolist()]
    anchors = dict(dia=anchor([0, .18, 1.]), valve=anchor([.0, -.62, .78]), filt=[(PF + nF * .01).tolist(), nF.tolist()])
    covered = (outline(vs) < -.002) & (back(vs) < 0) & (win(vs) > .004)
    G['covered'] = covered; G['anchors'] = anchors
    return G
