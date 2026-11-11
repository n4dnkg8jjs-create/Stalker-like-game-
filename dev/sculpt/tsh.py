"""Soviet tanker's padded helmet (TSh type) shrink-wrapped onto a character's head.

The cap is a (azimuth, elevation) grid around the skull centre. Each grid ray is wrapped onto the head (largest skin
radius in a small cone, heavily smoothed so the cloth bridges the ears), then cloth layers are added as radial
offsets: clearance, the three padded rolls over the crown with stitched grooves between them, the forehead brim roll,
temple pads, a bulge where the headset cup sits in the earflap, compression creases and slack folds, gravity flare
on the neck flap. The outer shell is solidified, bound with a tape around the rim, and a chin strap is laid under
the jaw. Positions are in bind space (metres)."""
import numpy as np
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter
from mhbuild import *
from paint import fbm, vnoise

def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)

def build(vs, M, ear_c):
    Fw = VIDX[TRIS]; used = np.unique(Fw); sk = vs[used]
    hc = M + np.array([0, .02, -.085])
    q = sk - hc; rq = np.linalg.norm(q, axis=1); dq = q / rq[:, None]
    keep = (rq < .2) & (sk[:, 1] > M[1] - .2); dq, rq = dq[keep], rq[keep]
    kd = cKDTree(dq)
    NC, NR = 260, 72
    # columns denser where the earflap's front edge drops steeply down the cheek
    pg = np.linspace(-np.pi, np.pi, 4000, endpoint=False); dens = 1 + 3.2 * np.exp(-((np.abs(np.degrees(pg)) - 63) / 8) ** 2)
    cdf = np.cumsum(dens); cdf = (cdf - cdf[0]) / (cdf[-1] - cdf[0] + dens[-1] / len(dens) * 0 + 1e-9) * (1 - 1 / NC)
    phi = np.interp(np.arange(NC) / NC, cdf, pg)
    # lower boundary (elevation, degrees) per azimuth: forehead rim, earflaps down past the jaw, nape flap
    a = np.abs(np.degrees(phi))
    el_front = 15 + 3 * (a / 55) ** 2
    el_flap = -60 + 14 * ss(95, 130, a)
    el_min = np.where(a < 56, el_front, el_front + (el_flap - el_front) * ss(56, 70, a))
    el_min = np.radians(el_min); el_max = np.radians(88.)
    T = np.linspace(0, 1, NR) ** 1.15
    EL = el_min[None, :] + (el_max - el_min[None, :]) * T[:, None]
    PH = np.broadcast_to(phi[None, :], EL.shape)
    D = np.stack([np.cos(EL) * np.sin(PH), np.sin(EL), np.cos(EL) * np.cos(PH)], -1)
    # wrap on a regular global (azimuth, elevation) grid: largest skin radius in a ~4 degree cone, holes filled,
    # smoothed so the cloth bridges the ears; the helmet grid then samples it (no smoothing across uneven rows)
    from scipy.interpolate import RegularGridInterpolator
    gP = np.linspace(-np.pi, np.pi, 360, endpoint=False); gE = np.radians(np.linspace(-75, 90, 166))
    GE, GP = np.meshgrid(gE, gP, indexing='ij')
    GD = np.stack([np.cos(GE) * np.sin(GP), np.sin(GE), np.cos(GE) * np.cos(GP)], -1)
    G0 = np.full(GE.shape, np.nan)
    for i in range(len(gE)):
        nb = kd.query_ball_point(GD[i], .07); G0[i] = [rq[n].max() if len(n) else np.nan for n in nb]
    for i in range(len(gE)):
        r = G0[i]; m = np.isnan(r)
        if m.all(): G0[i] = np.nanmean(G0) ; continue
        if m.any(): r[m] = np.interp(np.where(m)[0], np.where(~m)[0], r[~m], period=len(r))
    wp = lambda A, sg: gaussian_filter(np.pad(A, ((0, 0), (20, 20)), mode='wrap'), sg, mode='nearest')[:, 20:-20]
    Gs = np.maximum(wp(G0, (3.2, 3.6)), wp(G0, (1.2, 1.4)))
    Gs = np.concatenate([Gs, Gs[:, :1]], 1); gPw = np.concatenate([gP, [np.pi]])
    fR = RegularGridInterpolator((gE, gPw), Gs, bounds_error=False, fill_value=None)
    PHw = np.where(PH >= np.pi, PH - 2 * np.pi, PH)
    Rw = fR(np.stack([np.clip(EL, gE[0], gE[-1]), PHw], -1))
    # ---- cloth layers ----
    P0 = D * Rw[..., None]
    x = D[..., 0]; y = D[..., 1]
    s = np.arcsin(np.clip(x, -1, 1))                       # lateral angle from the mid-plane
    top = ss(.05, .35, y)
    front = np.cos(PH) > 0
    h = .0016 + .0032 * ss(0, .1, T[:, None] * np.ones((1, NC)))   # fabric + liner clearance; the rim hugs the skin
    for s0, amp in ((0, .0125), (.42, .011), (-.42, .011)):  # three padded crown rolls
        u = (s - s0) / .155; h += amp * np.sqrt(np.clip(1 - u * u, 0, 1)) * top
    for s0 in (.21, -.21, .63, -.63):                      # stitched grooves between the rolls
        h -= .0028 * np.exp(-((s - s0) / .022) ** 2) * top
    rim_t = T[:, None] * np.ones((1, NC))
    fr = ss(70, 50, a)[None, :]
    h += .010 * np.exp(-((rim_t - .07) / .05) ** 2) * fr  # forehead brim roll
    h -= .0022 * np.exp(-((rim_t - .145) / .012) ** 2) * fr
    # temple pads and the headset cups in the earflaps
    for sd in (1, -1):
        az = np.arctan2(ear_c[0] - hc[0], ear_c[2] - hc[2]) if sd > 0 else -np.arctan2(ear_c[0] - hc[0], ear_c[2] - hc[2])
        ec = np.array([np.sin(az), 0, np.cos(az)]); ce = np.cos(np.radians(-27))
        ed = np.array([ce * np.sin(az), np.sin(np.radians(-27)), ce * np.cos(az)])
        ang = np.arccos(np.clip(D @ ed, -1, 1))
        h += .016 * ss(.42, .30, ang) + .003 * np.exp(-((ang - .43) / .03) ** 2)      # cup bulge with a rolled rim
        tp = np.array([np.cos(np.radians(18)) * np.sin(az * .9), np.sin(np.radians(18)), np.cos(np.radians(18)) * np.cos(az * .9)])
        h += .007 * ss(.38, .15, np.arccos(np.clip(D @ tp, -1, 1)))
    # fabric behaviour: compression creases across the rolls, slack folds on the flaps, gravity flare on the nape flap
    Pn = P0 / np.linalg.norm(P0, axis=-1, keepdims=True)
    n1 = fbm(Pn.reshape(-1, 3) * 3 + 5, 1, 3).reshape(EL.shape); n2 = fbm(Pn.reshape(-1, 3) * 9 + 2, 1, 2).reshape(EL.shape)
    along = EL * np.sign(np.cos(PH) + 1e-6)
    crease = np.abs(np.sin(along * 26 + n1 * 6)) ** 3 * top * .0016
    flap = (1 - top) * ss(.25, .02, y + .25)
    fold = (np.abs(np.sin(PH * 14 + n1 * 5 + EL * 3)) ** 2.5) * .0026 * flap * (1 - ss(.0, .3, rim_t))
    h += crease + fold + (n2 - .5) * .0012
    back = ss(110, 150, a)[None, :]
    h += .009 * (1 - ss(0, .22, rim_t)) ** 2 * back          # neck flap stands away from the nape
    sag = np.zeros(EL.shape + (3,)); sag[..., 1] = -.004 * (1 - ss(0, .2, rim_t)) ** 2 * (back + .4 * (1 - fr))
    P = P0 + D * h[..., None] + sag
    # Taubin smooth the outer shell a little
    def lap(A):
        Ap = np.pad(A, ((1, 1), (1, 1), (0, 0)), mode='edge'); Ap[:, 0] = Ap[:, -2]; Ap[:, -1] = Ap[:, 1]
        return (Ap[:-2, 1:-1] + Ap[2:, 1:-1] + Ap[1:-1, :-2] + Ap[1:-1, 2:]) / 4 - A
    for _ in range(4):
        P = P + .5 * lap(P); P = P - .53 * lap(P)
    P = P + hc
    # ---- mesh: outer shell, inner shell, rim strip, pole cap ----
    V = [P.reshape(-1, 3)]; F = []
    idx = lambda i, j: i * NC + (j % NC)
    for i in range(NR - 1):
        for j in range(NC):
            F.append([idx(i, j), idx(i + 1, j), idx(i + 1, j + 1)]); F.append([idx(i, j), idx(i + 1, j + 1), idx(i, j + 1)])
    pole = len(V[0]); V.append((hc + np.array([0, Rw[-1].mean() + h[-1].mean(), 0]))[None])
    for j in range(NC): F.append([idx(NR - 1, j), pole, idx(NR - 1, j + 1)])
    Vo = np.concatenate(V); nO = len(Vo)
    nrm = np.zeros_like(Vo); F = np.array(F)
    fn = np.cross(Vo[F[:, 1]] - Vo[F[:, 0]], Vo[F[:, 2]] - Vo[F[:, 0]])
    for k in range(3): np.add.at(nrm, F[:, k], fn)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
    if (nrm[:-1] * (Vo[:-1] - hc)).sum(1).mean() < 0: F = F[:, ::-1]; nrm = -nrm
    Vi = Vo - nrm * .0045
    Fi = F[:, ::-1] + nO
    Fr = []
    for j in range(NC):
        a0, a1 = idx(0, j), idx(0, j + 1); Fr += [[a0, a1 + nO, a0 + nO], [a0, a1, a1 + nO]]
    Fr = np.array(Fr)
    if (np.cross(Vo[Fr[0, 1] % nO] - Vo[Fr[0, 0] % nO], Vi[Fr[0, 2] % nO] - Vo[Fr[0, 0] % nO]) @ (Vo[Fr[0, 0]] - hc) ) > 0: pass
    Vall = np.concatenate([Vo, Vi]); Fall = np.concatenate([F, Fi, Fr])
    # ---- binding tape round the rim (tube), chin strap under the jaw ----
    rim = P[0]; rimn = nrm[:NC]
    tape_v, tape_f = tube(np.concatenate([rim - rimn * .0025, rim[:1] - rimn[:1] * .0025]), .0048, 7)
    # chin strap: from the bottom front corner of each earflap, under the jaw, kept 4 mm off the skin
    jL = int(np.argmin(np.abs(np.degrees(phi) - 66))); jR = int(np.argmin(np.abs(np.degrees(phi) + 66)))
    pa, pb = P[1, jL], P[1, jR]
    chin = np.array([hc[0], M[1] - .135, M[2] - .035])
    t = np.linspace(0, 1, 40)
    ctrl = np.array([pa, (pa + chin) / 2 + [0, -.01, -.005], chin, (pb + chin) / 2 + [0, -.01, -.005], pb])
    from scipy.interpolate import CubicSpline
    cs = CubicSpline(np.linspace(0, 1, 5), ctrl); path = cs(t)
    import facegen as FG
    vn = FG.vert_normals(vs, Fw)[used]; skd = cKDTree(sk)
    for k in range(len(path)):
        dd, ii = skd.query(path[k], 6); near = sk[ii[0]]; nv = vn[ii].mean(0); nv /= np.linalg.norm(nv) + 1e-9
        if (path[k] - near) @ nv < .0045: path[k] = path[k] + nv * (.0045 - (path[k] - near) @ nv)
    strap_v, strap_f = ribbon(path, .017, hc)
    # buckle on the left side of the strap
    bk_v, bk_f = box_mesh(path[9], path[11] - path[7], .012, .022, .004)
    # ---- AO for the cloth (sockets between the rolls darken) ----
    import facegen as FG
    occ = np.concatenate([Vo, sk[np.linalg.norm(sk - hc, axis=1) < .2]])
    aoO = FG.depth_ao(Vo, nrm, occ, n_dir=64, px=.0025, ctr=hc, rad=.2)
    ao = np.concatenate([aoO, np.full(nO, .5)])
    parts = dict(cloth=(Vall, Fall, ao), tape=(tape_v, tape_f, None), strap=(np.concatenate([strap_v, bk_v]), np.concatenate([strap_f, bk_f + len(strap_v)]), None))
    brow = P[int(NR * .07), 0]; brow = P[3, int(np.argmin(np.abs(phi)))]
    return parts, dict(brow=brow.tolist(), hc=hc.tolist(), browN=nrm[3 * NC + int(np.argmin(np.abs(phi)))].tolist())

def tube(path, r, seg):
    V = []; F = []; n = len(path)
    for k in range(n):
        t = path[min(k + 1, n - 1)] - path[max(k - 1, 0)]; t /= np.linalg.norm(t) + 1e-12
        a = np.cross(t, [0, 1, 0]); a = a / (np.linalg.norm(a) + 1e-9) if np.linalg.norm(a) > 1e-3 else np.array([1., 0, 0]); b = np.cross(t, a)
        for s in range(seg):
            th = s / seg * 2 * np.pi; V.append(path[k] + r * (np.cos(th) * a + np.sin(th) * b))
    for k in range(n - 1):
        for s in range(seg):
            a0 = k * seg + s; a1 = k * seg + (s + 1) % seg; F += [[a0, a1, a1 + seg], [a0, a1 + seg, a0 + seg]]
    return np.array(V), np.array(F)

def ribbon(path, w, hc):
    V = []; F = []; n = len(path)
    for k in range(n):
        t = path[min(k + 1, n - 1)] - path[max(k - 1, 0)]; t /= np.linalg.norm(t) + 1e-12
        out = path[k] - hc; out -= t * (out @ t); out /= np.linalg.norm(out) + 1e-9; b = np.cross(t, out)
        for o in (-1, 1): V.append(path[k] + b * o * w / 2)
        for o in (-1, 1): V.append(path[k] + b * o * w / 2 - out * .002)
    for k in range(n - 1):
        a = 4 * k; c = 4 * (k + 1)
        F += [[a, c, c + 1], [a, c + 1, a + 1], [a + 2, a + 3, c + 3], [a + 2, c + 3, c + 2], [a, a + 2, c + 2], [a, c + 2, c], [a + 1, c + 1, c + 3], [a + 1, c + 3, a + 3]]
    return np.array(V), np.array(F)

def box_mesh(c, along, l, w, t):
    a = along / (np.linalg.norm(along) + 1e-9); up = np.array([0, 1., 0]); b = np.cross(a, up); b /= np.linalg.norm(b) + 1e-9; u = np.cross(b, a)
    V = [];
    for i in (-1, 1):
        for j in (-1, 1):
            for k in (-1, 1): V.append(c + a * i * w / 2 + b * j * t / 2 + u * k * l / 2)
    F = [[0, 1, 3], [0, 3, 2], [4, 6, 7], [4, 7, 5], [0, 4, 5], [0, 5, 1], [2, 3, 7], [2, 7, 6], [0, 2, 6], [0, 6, 4], [1, 5, 7], [1, 7, 3]]
    return np.array(V), np.array(F)
