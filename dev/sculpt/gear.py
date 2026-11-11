"""Hard gear sculpted as signed-distance fields, meshed with marching cubes, decimated, AO baked:
army lace-up boots, the 6B45 plate carrier, the 6B47 helmet with its EMR cover."""
import numpy as np, time
from scipy.spatial import cKDTree
from sdf import *
from qem import decimate
from paint import fbm, vnoise, ss

QUICK = False
def _mesh(fn, lo, hi, h, target, smooth=4, ao_dist=.012):
    t = time.time()
    if QUICK: h *= 2.2; target = 0
    fld, lo_, h_ = evaluate(fn, lo, hi, h)
    v, f = extract(fld, lo_, h_)
    v = taubin(v, f, iters=smooth)
    n0 = len(f)
    if target and len(f) > 3 * target:      # vertex clustering first, quadric collapse for the last step
        cell = h * 1.0
        while True:
            v2, f2 = decimate_cluster(v, f, cell)
            if len(f2) < 3 * target or cell > h * 4: break
            cell *= 1.3
        v, f = v2, f2; uq, inv = np.unique(f, return_inverse=True); v = v[uq]; f = inv.reshape(-1, 3)
        v = taubin(v, f, iters=2)
    if target and len(f) > target: v, f, _ = decimate(v, f, target)
    n = normals(v, f)
    ao = sdf_ao(fn, v, n, dist=ao_dist)
    print('   mesh %d -> %d faces, %.1fs' % (n0, len(f), time.time() - t))
    return v, f, n, ao

def d2circle(x, z, cx, cz, r): return np.hypot(x - cx, z - cz) - r
def d2seg(x, z, a, b, r):
    a = np.asarray(a); b = np.asarray(b); ba = b - a; px, pz = x - a[0], z - a[1]
    h = np.clip((px * ba[0] + pz * ba[1]) / (ba @ ba), 0, 1)
    return np.hypot(px - h * ba[0], pz - h * ba[1]) - r

# ------------------------------------------------------------------ boots
def boot(ankle, leg_top, top_y=.255, side=1, lace=True, shaft_r=(.056, .054), lug=True, pad=True, sole_h=.0155):
    """left/right boot around an ankle joint; leg_top = centre of the shin at the boot top.  side=+1 for x<0 foot"""
    ax, az = ankle[0], ankle[2]; sx = -side          # toes splay slightly outward
    heel = (ax, az - .036); ball = (ax + sx * .006, az + .118); toe = (ax + sx * .011, az + .19)
    def sole2(x, z):
        d = smin(d2seg(x, z, heel, ball, .041), d2seg(x, z, ball, toe, .045), .02)
        return smin(d, d2circle(x, z, ball[0], ball[1], .051), .03)
    def sole(P):
        x, y, z = P[:, 0], P[:, 1], P[:, 2]
        d = smax(sole2(x, z), np.abs(y - sole_h) - sole_h, .004)
        # arch: lift the sole between heel block and forefoot
        arch = rbox((ax, .0, az + .045), (.07, .009, .03), .004)(P)
        d = smax(d, -arch, .004)
        # tread lugs on the underside
        if lug:
            lg = np.abs(((z - az) * 1.0 % .014) - .007) - .0035
            d = smax(d, -smax(lg, y - .004, .001), .0008)
        return d
    sh0 = np.array([ax, .07, az + .004]); sh1 = np.array([leg_top[0], top_y, leg_top[2]])
    def upper(P):
        d = ellipsoid((ax, .062, az - .024), (.043, .052, .047))(P)
        d = smin(d, ellipsoid((ax + sx * .003, .06, az + .058), (.046, .046, .068))(P), .03)
        d = smin(d, ellipsoid((ax + sx * .007, .043, az + .118), (.05, .033, .058))(P), .03)
        d = smin(d, ellipsoid((ax + sx * .01, .039, az + .165), (.044, .029, .048))(P), .025)
        d = smin(d, capsule(sh0, sh1, shaft_r[0], shaft_r[1])(P), .035)
        d = smax(d, sole_h * 1.4 - P[:, 1], .006)                       # sits on the sole
        d = smax(d, P[:, 1] - top_y, .004)                               # flat top inside the bloused trousers
        # toe cap overlay and heel counter: slightly raised panels give the stitched edges
        d = smin(d, smax(ellipsoid((ax + sx * .01, .04, az + .168), (.0465, .031, .05))(P), az + .14 - P[:, 2], .002), .001)
        d = smin(d, smax(ellipsoid((ax, .058, az - .026), (.0455, .045, .049))(P), P[:, 1] - .085, .002), .001)
        # padded collar at the top
        if pad: d = smin(d, torus((sh1[0], top_y - .008, sh1[2]), shaft_r[1] - .002, .0075)(P), .006)
        return d
    # front lacing line: points on the upper surface from the instep to the top
    def surf_pt(o, dvec):
        lo_, hi_ = 0., .12
        for _ in range(30):
            m = (lo_ + hi_) / 2; d = upper((o + dvec * m)[None])[0]
            lo_, hi_ = (m, hi_) if d < 0 else (lo_, m)
        return o + dvec * lo_
    lp = []
    for t in np.linspace(0, 1, 9):
        o = np.array([ax + sx * .004 * (1 - t) + (sh1[0] - ax) * t, .06 + (top_y - .085) * t, (az + .05) * (1 - t) + sh1[2] * t])
        dv = np.array([0, .55 * (1 - t) + .05, 1.]); dv /= np.linalg.norm(dv)
        lp.append((surf_pt(o, dv), dv))
    def laces(P):
        d = np.full(len(P), 1e3)
        for i in range(len(lp) - 1):
            (p0, n0), (p1, n1) = lp[i], lp[i + 1]
            side_v = np.cross(n0, np.array([0, 1., 0])); side_v /= np.linalg.norm(side_v)
            w = .011
            a = p0 + side_v * w + n0 * .002; b = p1 - side_v * w + n1 * .002
            c = p0 - side_v * w + n0 * .002; e = p1 + side_v * w + n1 * .002
            d = np.minimum(d, capsule(a, b, .0022)(P)); d = np.minimum(d, capsule(c, e, .0022)(P))
            for sgn in (-1, 1):
                d = np.minimum(d, sphere(p0 + side_v * sgn * .0135 + n0 * .001, .0032)(P))
        # bow knot at the top
        pt, nt = lp[-1]
        d = np.minimum(d, ellipsoid(pt + nt * .006, (.012, .005, .004))(P))
        return d
    def boot_fn(P):
        return np.minimum(np.minimum(sole(P), upper(P)), laces(P) if lace else 1e3)
    lo = np.array([min(ax, sh1[0]) - .075, -.002, az - .09]); hi = np.array([max(ax, sh1[0]) + .075, top_y + .02, az + .255])
    v, f, n, ao = _mesh(boot_fn, lo, hi, .0016, 9000, smooth=3, ao_dist=.008)
    # material ids: 0 leather, 1 rubber sole, 2 laces
    ds, du = sole(v), upper(v)
    dl = laces(v) if lace else np.full(len(v), 1e3)
    mid = np.where((dl < du) & (dl < ds), 2, np.where(ds < du, 1, 0))
    return dict(v=v, f=f, n=n, ao=ao, mid=mid, ankle=np.asarray(ankle), top=sh1)

# ------------------------------------------------------------------ 6B45 plate carrier
def torso_profile(P, dom_ok, ys, xw=.05):
    """front/back z near the midline and half width, per height"""
    out = []
    for y in ys:
        m = dom_ok & (np.abs(P[:, 1] - y) < .02)
        q = P[m]; mid = q[np.abs(q[:, 0]) < xw]
        out.append((mid[:, 2].max(), mid[:, 2].min(), np.abs(q[:, 0]).max()))
    return np.array(out)

def vest(P, dom_ok, head, jacket_X=None, jacket_N=None, ease=.03):
    ys = np.linspace(head['hips'][1] + .06, head['neck'][1] - .08, 16)
    prof = torso_profile(P, dom_ok, ys)
    y0, y1 = head['spine'][1] - .065, head['neck'][1] - .125          # plate bottom / top
    Rf = .30; T = .03
    def plate_line(sign):
        need = []
        for y in ys:
            m = dom_ok & (np.abs(P[:, 1] - y) < .02) & (np.abs(P[:, 0]) < .15) & (np.sign(P[:, 2] - head['spine'][2]) == sign)
            q = P[m]; sag = Rf - np.sqrt(Rf ** 2 - q[:, 0] ** 2)
            need.append((sign * q[:, 2] + ease + sag).max())
        need = np.array(need); sel = (ys > y0 - .02) & (ys < y1 + .02)
        b, a = np.polyfit(ys[sel], need[sel], 1); a = (need[sel] - b * ys[sel]).max()
        return lambda y: sign * (a + b * y)
    zf, zb = plate_line(1), plate_line(-1)
    cz = lambda y: (zf(y) + zb(y)) / 2
    def outline(x, y, hw0, hw1, ylo, yhi, chamfer=.05, r=.025):
        hw = hw0 + (hw1 - hw0) * np.clip((y - ylo) / (yhi - ylo), 0, 1)
        d = np.maximum(np.abs(x) - hw, np.abs(y - (ylo + yhi) / 2) - (yhi - ylo) / 2)
        cut = (np.abs(x) - hw + chamfer) * .7071 + (y - yhi + chamfer) * .7071      # armhole chamfer
        return np.maximum(d, cut) + 0 * r
    def plate(P_, sign, ylo, yhi, hw0, hw1, R=Rf, th=T, off=0.):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        zl = zf(y) if sign > 0 else zb(y)
        r = np.hypot(x, sign * (z - zl) + R)
        sh = np.abs(r - (R + off + th / 2)) - th / 2
        return smax(sh, outline(x, y, hw0, hw1, ylo, yhi), .008)
    def cummer(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        hw = np.interp(y, ys, prof[:, 2]) + ease + .012; hz = (zf(y) - zb(y)) / 2
        k = np.hypot(x / hw, (z - cz(y)) / hz); d = (k - 1) * np.minimum(hw, hz)
        return smax(np.abs(d - .006) - .006, np.abs(y - (y0 + .085)) - .08, .006)
    kdj = cKDTree(jacket_X) if jacket_X is not None else None
    def straps(P_):
        dd, kk = kdj.query(P_); q = jacket_X[kk]; nq = jacket_N[kk]
        h = ((P_ - q) * nq).sum(1)
        d = np.abs(h - .009) - .007
        x, y = P_[:, 0], P_[:, 1]
        band = np.abs(np.abs(x) - .1) - .032
        return smax(smax(d, band, .004), y1 - .05 - y, .01)
    nb = head['neck']; nz = nb[2] - .005
    def collar(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        k = np.hypot(x / .108, (z - nz) / .095); dr = (k - 1) * .1
        d = np.hypot(dr, (y - (nb[1] - .03)) * 1.1) - .024
        return smax(d, -(z - nz + .05), .02)
    def groin(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        zl = zf(y0) - .006
        r = np.hypot(x, z - zl + .22); sh = np.abs(r - .226) - .006
        hw = .085 - .03 * np.clip((y0 - y) / .17, 0, 1)
        o = np.maximum(np.abs(x) - hw, np.abs(y - (y0 - .085)) - .09)
        return smax(sh, o, .012)
    def molle(P_, sign, ylo, yhi, hw0, hw1):
        y = P_[:, 1]
        rows = np.abs(((y - ylo) % .038) - .019) - .0125
        base = plate(P_, sign, ylo, yhi, hw0 - .012, hw1 - .012, th=.0035, off=T - .0005)
        return smax(base, rows, .0008)
    # pouches: positions on the front plate surface, tilted with the plate curvature
    pouches = []
    def on_front(x, y, depth, hw, hh, hd, r=.009):
        zl = zf(y); zc = zl + T + hd + .001 - (Rf - np.sqrt(Rf ** 2 - x ** 2))
        yaw = np.arcsin(np.clip(x / (Rf + T), -1, 1)); Rm = rot(0, yaw, 0)
        return rbox((x, y, zc), (hw, hh, hd), r, R=Rm), (x, y, zc, yaw)
    fronts = []
    for x in (-.083, 0, .083):
        b_, c_ = on_front(x, y0 + .085, 0, .037, .07, .03); fronts.append(b_)
        f_, _ = on_front(x, y0 + .14, 0, .0395, .021, .033, r=.007); fronts.append(f_)
        t_, _ = on_front(x, y0 + .13, 0, .012, .016, .0345, r=.003); fronts.append(t_)
    rad, _ = on_front(.088, y1 - .095, 0, .031, .055, .024); fronts.append(rad)
    adm, admc = on_front(-.055, y1 - .085, 0, .062, .045, .016, r=.006); fronts.append(adm)
    ant0 = np.array([.1, y1 - .045, zf(y1 - .045) + T + .03]); ant1 = ant0 + np.array([.03, .22, -.06])
    antenna = capsule(ant0, ant1, .0045, .003)
    backs = []
    yb = y0 + .11; zbb = zb(yb)
    backs.append(rbox((0, yb, zbb - T - .045), (.1, .095, .045), .015))
    backs.append(rbox((0, yb + .085, zbb - T - .05), (.103, .03, .048), .01))
    hdl = torus((0, y1 + .005, zb(y1) - T - .004), .035, .006, Rm=rot(np.pi / 2, 0, 0))
    sides = []
    for s in (-1, 1):
        hw = np.interp(y0 + .07, ys, prof[:, 2]) + ease + .024
        sides.append(rbox((s * (hw + .022), y0 + .075, cz(y0 + .07) + .02), (.024, .045, .03), .008))
        sides.append(rbox((s * (hw + .022), y0 + .11, cz(y0 + .07) + .02), (.026, .014, .032), .006))
    def vest_fn(P_):
        d = plate(P_, 1, y0, y1, .145, .125)
        d = np.minimum(d, plate(P_, -1, y0 - .01, y1 + .03, .155, .14))
        d = smin(d, cummer(P_), .01)
        if kdj is not None: d = smin(d, straps(P_), .01)
        d = smin(d, collar(P_), .012)
        d = smin(d, groin(P_), .006)
        d = np.minimum(d, molle(P_, 1, y0 + .012, y1 - .02, .145, .125))
        d = np.minimum(d, molle(P_, -1, y0 + .002, y1 + .01, .155, .14))
        for g in fronts + backs + sides: d = smin(d, g(P_), .003)
        d = np.minimum(d, antenna(P_)); d = np.minimum(d, hdl(P_))
        return d
    lo = np.array([-.3, y0 - .2, zb(y0) - .2]); hi = np.array([.3, nb[1] + .03, zf(y0) + .14])
    v, f, n, ao = _mesh(vest_fn, lo, hi, .0024, 22000, smooth=3, ao_dist=.012)
    # parts for colouring: 0 cordura, 1 webbing/straps, 2 black hardware
    dm = np.minimum(molle(v, 1, y0 + .012, y1 - .02, .145, .125), molle(v, -1, y0 + .002, y1 + .01, .155, .14))
    dh = np.minimum(antenna(v), hdl(v))
    mid = np.where(dh < .0015, 2, np.where(dm < .0015, 1, 0))
    return dict(v=v, f=f, n=n, ao=ao, mid=mid, flag=admc)

# ------------------------------------------------------------------ 6B47 helmet with EMR cover
def helmet(top, half_w, half_l, cz, chin, head_pts=None, head_nrm=None):
    """6B47 "Ratnik-BSh" as issued: mid-cut aramid shell (slightly boxy sides, flared lip, raised over the ears) under a
    loose, wrinkled EMR cover with an elastic band and a velcro patch at the back, NVG shroud, Y chin strap hugging the jaw"""
    Cy = top - .1; C = np.array([0, Cy, cz - .006])
    R = np.array([half_w + .027, top + .024 - Cy, half_l + .03])
    def edge(x, z):
        phi = np.arctan2(x, z - C[2]); c = np.cos(phi)
        e = Cy + .004 - .04 * (1 - c)
        return e + .022 * np.exp(-((np.abs(phi) - 1.62) / .3) ** 2)          # lifted over the ears
    def sup(q, Rr, p=2.4):
        k = (np.abs(q[:, 0] / Rr[0]) ** p + np.abs(q[:, 1] / Rr[1]) ** 2.1 + np.abs(q[:, 2] / Rr[2]) ** p) ** (1 / p)
        return (k - 1) * Rr.min() * .95
    def outer(P_, extra=0.):
        q = P_ - C; e = edge(P_[:, 0], P_[:, 2])
        fl = 1 + .05 * np.exp(-((P_[:, 1] - e) / .02) ** 2) * (P_[:, 1] < e + .05)
        q = q.copy(); q[:, 0] /= fl; q[:, 2] /= fl
        return sup(q, R + extra) * fl
    def shell(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        e = edge(x, z)
        th = .0085 + .005 * np.exp(-((y - e) / .007) ** 2)
        wr = (fbm(P_ * 1 + 3, 30, 3) - .5) * .0055 + (fbm(P_ + 9, 85, 2) - .5) * .0016
        wr *= .55 + .9 * np.exp(-((y - e) / .03) ** 2)
        d = outer(P_) - wr
        d = np.abs(d + th / 2) - th / 2
        return smax(d, e - y, .0035)
    yb = Cy + .03
    def band(P_):
        return smax(np.abs(outer(P_) - .0016) - .0032, np.abs(P_[:, 1] - yb) - .0085, .002)
    def patch(P_):   # velcro panel on the back of the cover
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        return smax(np.abs(outer(P_) - .0018) - .002, np.maximum(np.maximum(np.abs(x) - .04, np.abs(y - Cy - .065) - .022), z - C[2] + .05), .002)
    yg = Cy + .052
    def gstrap(P_): return smax(np.abs(outer(P_) - .0022) - .0024, np.abs(P_[:, 1] - yg) - .008, .002)
    def gframe(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        d = np.abs(outer(P_) - .009) - .0075
        w = np.maximum(np.abs(x) - .066, np.abs(y - yg) - .018)
        return smax(smax(d, w, .01), C[2] - z + .025, .01)
    def glens(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        d = np.abs(outer(P_) - .0165) - .0016
        w = np.maximum(np.abs(x) - .058, np.abs(y - yg) - .012)
        return smax(smax(d, w, .008), C[2] - z + .035, .01)
    fz = C[2] + R[2] * .93
    nvg = rbox((0, Cy + .03, fz + .006), (.022, .016, .007), .003, R=rot(-.35, 0, 0))
    rails = [rbox((s * (R[0] + .006), Cy + .022, C[2] - .006), (.0055, .012, .055), .0025, R=rot(0, 0, -s * .1)) for s in (-1, 1)]
    ey = top - .128; ez = cz - .02
    cups = [ellipsoid((s * (half_w + .017), ey, ez), (.019, .037, .032)) for s in (-1, 1)]
    hb = [capsule((s * (half_w + .02), ey + .04, ez), (s * (half_w + .012), Cy - .01, ez), .006) for s in (-1, 1)]
    boom = capsule((-(half_w + .035), ey - .01, ez + .02), (-(half_w - .01), ey - .05, ez + .1), .0035)
    straps = []
    kd = cKDTree(head_pts)
    def hug(p, clr=.0055):
        _, k = kd.query(p, k=6); q = head_pts[k].mean(1); n = head_nrm[k].mean(1); n /= np.linalg.norm(n, axis=1, keepdims=True)
        return q + n * clr
    for s in (-1, 1):
        a = np.array([s * (R[0] - .012), edge(np.array([s * R[0]]), np.array([C[2] + .03]))[0] - .004, C[2] + .03])
        u = np.array([0, chin[0] - .008, chin[1] - .022])
        path = a + np.linspace(0, 1, 9)[:, None] * (u - a); path[1:-1] = hug(path[1:-1], .007)
        for _ in range(3): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4; path[1:-1] = hug(path[1:-1], .007)
        straps += [capsule(path[i], path[i + 1], .0032) for i in range(len(path) - 1)]
    cup = ellipsoid((0, chin[0] - .011, chin[1] - .016), (.028, .008, .019))
    hard = lambda P_: nvg(P_)
    soft = lambda P_: np.minimum.reduce([s(P_) for s in straps] + [cup(P_)])
    glens = lambda P_: np.full(len(P_), 1.0)
    def fn(P_):
        d = shell(P_); d = smin(d, band(P_), .002); d = smin(d, patch(P_), .0015)
        return np.minimum.reduce([d, hard(P_), soft(P_)])
    lo = np.array([-R[0] - .05, chin[0] - .04, C[2] - R[2] - .03]); hi = np.array([R[0] + .05, top + .05, C[2] + R[2] + .05])
    v, f, n, ao = _mesh(fn, lo, hi, .0015, 12000, smooth=3, ao_dist=.01)
    dh, ds, db, dl, dp = hard(v), soft(v), band(v), glens(v), patch(v)
    mid = np.where(dl < .001, 4, np.where(dh < .001, 2, np.where(ds < .001, 3, np.where((db < .001) | (dp < .001), 1, 0))))
    return dict(v=v, f=f, n=n, ao=ao, mid=mid)

# ------------------------------------------------------------------ 6B45 (full wrap soft-armour vest with plates, big collar, shoulder pads)
def vest45(P, dom_ok, head, jacket_X, jacket_N, ease=.024, T=.026):
    ys = np.linspace(head['hips'][1], head['neck'][1] - .02, 24)
    prof = torso_profile(P, dom_ok, ys)
    # smooth profiles, then let the vest hang straight below the chest (it does not follow the waist in)
    zf = np.polyval(np.polyfit(ys, prof[:, 0], 3), ys) + ease; zb = np.polyval(np.polyfit(ys, prof[:, 1], 3), ys) - ease
    hw = np.polyval(np.polyfit(ys, prof[:, 2], 2), ys) + ease
    ich = np.argmax(zf[: len(ys) * 3 // 4])
    for i in range(ich - 1, -1, -1): zf[i] = max(zf[i], zf[i + 1] - .12 * (ys[i + 1] - ys[i]))
    for i in range(len(ys) - 2, -1, -1): hw[i] = max(hw[i], hw[i + 1] - .2 * (ys[i + 1] - ys[i]))
    F = lambda arr, y: np.interp(y, ys, arr)
    y_bot = head['hips'][1] + .035; y_side = head['shL'][1] - .165; y_front = head['neck'][1] - .105; y_back = head['neck'][1] - .07
    def d_in(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        a = F(hw, y); f = F(zf, y); b_ = F(zb, y); zc = (f + b_) / 2; bb = (f - b_) / 2
        pe = 2.7; k = (np.abs(x / a) ** pe + np.abs((z - zc) / bb) ** pe) ** (1 / pe)
        return (k - 1) * np.minimum(a, bb) * .95
    def ytop(x, z):
        front = z > F(zf, y_side) * 0 + (head['spine'][2])
        yt = np.where(front, y_front, y_back)
        return y_side + (yt - y_side) * ss(.175, .115, np.abs(x))
    def cut(P_, k=.012, grow=0.):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        return np.maximum(y_bot - grow - y, y - ytop(x, z) - grow)
    def shell(P_):
        d = np.abs(d_in(P_) - T / 2) - T / 2
        return smax(d, cut(P_), .012)
    def plates(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]; th = T + .011
        d = np.abs(d_in(P_) - th / 2) - th / 2
        front = z > head['spine'][2]
        r = np.where(front, np.maximum(np.abs(x) - .118, np.maximum(y_bot + .06 - y, y - y_front + .035)),
                     np.maximum(np.abs(x) - .13, np.maximum(y_bot + .05 - y, y - y_back + .03)))
        return smax(d, r, .01)
    def molle(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        ds = np.minimum(np.abs(d_in(P_) - T / 2) - T / 2, plates(P_))
        # the webbing panel itself is a thin raised layer; its 38 mm rows and bar tacks are drawn by the game's 'molle'
        # material (geometry that fine would not survive decimation)
        d = np.abs(ds - .0016) - .0019
        reg = np.maximum(cut(P_) + .025, -(y - y_bot - .03))
        return smax(d, reg, .002)
    kdj = cKDTree(jacket_X)
    def shoulders(P_):
        dd, kk = kdj.query(P_); q = jacket_X[kk]; nq = jacket_N[kk]
        h = ((P_ - q) * nq).sum(1)
        x, y = P_[:, 0], P_[:, 1]
        d = np.abs(h - .017) - .013
        band = np.abs(np.abs(x) - .136) - .074
        return smax(smax(d, band, .01), y_side + .07 - y, .022)
    nb = head['neck']; nz = nb[2] - .012
    def collar(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        ang = np.arctan2(x, z - nz)
        yc = nb[1] - .033 + .032 * (1 - np.cos(ang)) / 2
        k = np.hypot(x / .118, (z - nz) / .106); dr = (k - 1) * .11
        d = np.hypot(dr * .82, (y - yc) * .74) - .036
        return smax(d, .32 - np.abs(ang), .03)
    def groin(P_):
        x, y, z = P_[:, 0], P_[:, 1], P_[:, 2]
        zl = F(zf, y_bot) + T * .5
        r = np.hypot(x, z - zl + .22); sh = np.abs(r - .226) - .007
        w = .108 - .026 * np.clip((y_bot - y) / .19, 0, 1)
        o = np.maximum(np.abs(x) - w, np.abs(y - (y_bot - .09)) - .105)
        return smax(smax(sh, o, .014), zl - .06 - z, .004)
    # pouches: single AK magazine pouches across the front, grenade pouches on the sides, radio, admin
    def surf_z(x, y):
        lo_, hi_ = F(zf, y) - .05, F(zf, y) + .12
        p = np.array([[x, y, 0.]])
        for _ in range(28):
            m = (lo_ + hi_) / 2; p[0, 2] = m
            dd = min(shell(p)[0], plates(p)[0])
            lo_, hi_ = (m, hi_) if dd < 0 else (lo_, m)
        return lo_
    parts = []
    def pouch(x, y, hw_, hh, hd, yaw=None, flap=True, r=.008):
        zs = surf_z(x, y); yaw = np.arctan2(x, F(zf, y) - (F(zf, y) + F(zb, y)) / 2 + .12) * .7 if yaw is None else yaw
        Rm = rot(0, yaw, 0); n = np.array([np.sin(yaw), 0, np.cos(yaw)])
        c = np.array([x, y, zs]) + n * (hd + .0005)
        parts.append(rbox(c, (hw_, hh, hd), r, R=Rm))
        if flap:
            parts.append(rbox(c + np.array([0, hh - .012, 0]) + n * .003, (hw_ + .003, .02, hd + .003), r * .8, R=Rm))
            parts.append(rbox(c + np.array([0, hh - .03, 0]) + n * (hd + .003), (.011, .013, .0025), .002, R=Rm))
        return c, yaw
    ym = y_bot + .1
    for x in (-.105, -.035, .035, .105): pouch(x, ym, .032, .085, .024)
    rc, _ = pouch(.085, y_front - .09, .03, .055, .022)
    ac, ayaw = pouch(-.06, y_front - .075, .055, .04, .014, flap=False, r=.005)
    ant0 = rc + np.array([.008, .05, .0]); ant1 = ant0 + np.array([.03, .24, -.07])
    antenna = capsule(ant0, ant1, .0045, .003)
    for s in (-1, 1):
        x = s * (F(hw, ym) + T * .6); zc_ = (F(zf, ym) + F(zb, ym)) / 2 + .03
        c = np.array([x + s * .026, ym - .005, zc_])
        parts.append(rbox(c, (.026, .05, .032), .009)); parts.append(rbox(c + [0, .04, 0], (.028, .016, .034), .007))
    buckles = []
    for s in (-1, 1):
        for yb_ in (y_bot + .06, y_bot + .17):
            x = s * (F(hw, yb_) + T * .75); zc_ = (F(zf, yb_) + F(zb, yb_)) / 2 + .075
            buckles.append(rbox((x, yb_, zc_), (.006, .013, .022), .003))
    ybk = y_bot + .14; zbk = F(zb, ybk) - T - .012
    parts.append(rbox((0, ybk, zbk - .05), (.11, .1, .05), .016)); parts.append(rbox((0, ybk + .09, zbk - .055), (.113, .028, .053), .01))
    hdl = torus((0, y_back - .02, F(zb, y_back - .02) - T - .006), .04, .007, Rm=rot(.2, 0, 0))
    def vest_fn(P_):
        d = shell(P_); d = smin(d, plates(P_), .006)
        d = smin(d, shoulders(P_), .02); d = smin(d, collar(P_), .02); d = smin(d, groin(P_), .008)
        d = np.minimum(d, molle(P_))
        for g in parts: d = smin(d, g(P_), .004)
        return np.minimum.reduce([d, antenna(P_), hdl(P_)] + [b(P_) for b in buckles])
    lo = np.array([-.33, y_bot - .2, ys[0] * 0 + zb.min() - .16]); hi = np.array([.33, nb[1] + .06, zf.max() + .12])
    v, f, n, ao = _mesh(vest_fn, lo, hi, .0026, 24000, smooth=3, ao_dist=.014)
    dm = molle(v); dh = np.minimum.reduce([antenna(v), hdl(v)] + [b(v) for b in buckles])
    mid = np.where(dh < .0015, 2, np.where(dm < .0012, 1, 0))
    return dict(v=v, f=f, n=n, ao=ao, mid=mid, flag=[float(ac[0]), float(ac[1]), float(ac[2] + .0145 * np.cos(ayaw)), float(ayaw)])
