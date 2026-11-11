"""Soviet tanker's helmet (TSh-4 pattern), modelled from reference photos and shrink-wrapped to the wearer's head.

Reference features reproduced:
  * dark navy-black cotton canvas, stitched with a slightly green thread
  * face opening bound with a rolled piping of the same cloth; rim sits ~2 cm above the brows and runs straight down
    the cheeks in front of the ears
  * flat padded rectangle over the forehead, five padded rolls over the crown (centre, inner pair, outer pair that
    sweep down over the temples), stitched channels between them
  * large oval padded ear-cups (headset pockets) with a double stitched outline
  * long earflaps that wrap the jaw and then hang free well below the chin, rounded ends, stitched borders
  * separate rear neck panel with a notch between it and the earflaps
  * leather chin strap with holes hanging from one flap, a leather buckle tab on the other
The cap is a grid in (azimuth, elevation) around the skull centre; each column wraps the head down to its own lower
edge and the flap columns continue as a hanging panel. A texture painted in the same grid space carries the stitching,
seams, ambient occlusion and cloth tone."""
import numpy as np
from scipy.spatial import cKDTree
from scipy.ndimage import gaussian_filter, zoom
from mhbuild import *
from paint import fbm
from tsh import tube, ribbon, box_mesh

def ss(a, b, x): t = np.clip((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t)
def bump(x, a, b, e): return ss(a - e, a + e, x) * (1 - ss(b - e, b + e, x))

def build(vs, M, ear_c):
    Fw = VIDX[TRIS]; used = np.unique(Fw); sk = vs[used]
    hc = M + np.array([0, .02, -.085])
    q = sk - hc; rq = np.linalg.norm(q, axis=1); dq = q / rq[:, None]
    keep = (rq < .2) & (sk[:, 1] > M[1] - .22); kd = cKDTree(dq[keep]); rk = rq[keep]
    # ---- wrap radius on a regular global grid (smoothed: the cloth spans the ears and hollows) ----
    from scipy.interpolate import RegularGridInterpolator
    gP = np.linspace(-np.pi, np.pi, 360, endpoint=False); gE = np.radians(np.linspace(-80, 90, 171))
    GE, GP = np.meshgrid(gE, gP, indexing='ij')
    GD = np.stack([np.cos(GE) * np.sin(GP), np.sin(GE), np.cos(GE) * np.cos(GP)], -1)
    G0 = np.full(GE.shape, np.nan)
    for i in range(len(gE)):
        nb = kd.query_ball_point(GD[i], .07); G0[i] = [rk[n].max() if len(n) else np.nan for n in nb]
    for i in range(len(gE)):
        r = G0[i]; m = np.isnan(r)
        if m.all(): G0[i] = np.nanmean(G0); continue
        if m.any(): r[m] = np.interp(np.where(m)[0], np.where(~m)[0], r[~m], period=len(r))
    wp = lambda A, sg: gaussian_filter(np.pad(A, ((0, 0), (20, 20)), mode='wrap'), sg, mode='nearest')[:, 20:-20]
    Gs = np.maximum(wp(G0, (3.4, 3.8)), wp(G0, (1.2, 1.4)))
    Gs = np.concatenate([Gs, Gs[:, :1]], 1); gPw = np.concatenate([gP, [np.pi]])
    fR = RegularGridInterpolator((gE, gPw), Gs, bounds_error=False, fill_value=None)
    # ---- columns: denser where the edges turn (face edge, flap / notch / neck panel) ----
    NC, NW, NH = 300, 80, 18
    pg = np.linspace(-np.pi, np.pi, 6000, endpoint=False); ad = np.abs(np.degrees(pg))
    dens = 1 + 2.5 * np.exp(-((ad - 42) / 6) ** 2) + 1.6 * np.exp(-((ad - 104) / 9) ** 2)
    cdf = np.cumsum(dens); cdf = (cdf - cdf[0]) / (cdf[-1] - cdf[0]) * (1 - 1 / NC)
    phi = np.interp(np.arange(NC) / NC, cdf, pg); a = np.abs(np.degrees(phi)); sgn = np.sign(phi + 1e-9)
    # lower wrap edge (deg) per column and the free-hanging length below it
    el_face = 3.5 + 4 * (a / 40) ** 2
    el_bot = el_face + (-52 - el_face) * ss(38, 46, a)
    el_bot = el_bot + (-27 - el_bot) * bump(a, 99, 106, 2.5)          # notch between earflap and neck panel
    el_bot = el_bot + (-50 - el_bot) * ss(108, 120, a)
    u_flap = np.clip((a - 40) / 56, 0, 1)
    hang = .05 * np.sqrt(np.clip(1 - np.abs(2 * u_flap - 1) ** 3.2, 0, 1)) * (a > 40) * (a < 96)
    el_bot = np.radians(el_bot); el_top = np.radians(88.)
    Tw = np.linspace(0, 1, NW) ** 1.12
    ELw = el_bot[None] + (el_top - el_bot[None]) * Tw[:, None]
    PHw = np.broadcast_to(phi[None], ELw.shape)
    Dw = np.stack([np.cos(ELw) * np.sin(PHw), np.sin(ELw), np.cos(ELw) * np.cos(PHw)], -1)
    Rw = fR(np.stack([np.clip(ELw, gE[0], gE[-1]), np.where(PHw >= np.pi, PHw - 2 * np.pi, PHw)], -1))
    Pw = hc + Dw * Rw[..., None]
    # hanging rows (bottom first): drop from the wrap edge under gravity, flap narrows and curls slightly forward
    B = Pw[0]; sH = np.linspace(1, 0, NH, endpoint=False)[:, None]
    fc = np.radians(66) * sgn                                             # flap centre azimuth
    out = np.stack([np.sin(phi), np.zeros(NC), np.cos(phi)], -1)
    ctr = hc + np.stack([np.sin(fc), np.zeros(NC), np.cos(fc)], -1) * .09
    flapm = ((a > 40) & (a < 96)).astype(float)[None, :, None]
    narrow = (B - ctr) * np.array([1, 0, 1])                             # horizontal offset from the flap centre line
    L = hang[None, :, None] * sH[..., None]
    Ph = B[None] + np.array([0, -1., 0]) * L + out[None] * (L * .1 + (L / .05) ** 2 * .004) * flapm \
         - narrow[None] * (L / .05) * .22 * flapm + np.array([0, 0, 1.]) * L * .7 * flapm - np.stack([sgn, 0 * sgn, 0 * sgn], -1)[None] * L * .28 * flapm
    ELh = np.broadcast_to(el_bot[None], Ph.shape[:2]); PHh = np.broadcast_to(phi[None], Ph.shape[:2])
    P0 = np.concatenate([Ph, Pw], 0); NR = NH + NW
    ROWT = np.concatenate([-sH[:, 0] * 1.0 * 0 - (sH[:, 0]), Tw])         # <0 hanging, 0..1 wrapped
    EL = np.concatenate([ELh, ELw]); PH = np.concatenate([PHh, PHw])
    D = (P0 - hc); D /= np.linalg.norm(D, axis=-1, keepdims=True)
    x, y = D[..., 0], D[..., 1]; s = np.arcsin(np.clip(x, -1, 1)); A = np.abs(np.degrees(PH))
    T = np.broadcast_to(ROWT[:, None], EL.shape)
    top = ss(-.05, .3, y) * (T > 0)
    # ---- padding layers (outward offsets) ----
    h = .0028 + .0014 * ss(0, .1, T)
    # forehead pad: flat raised rectangle with rounded edges
    elg = np.degrees(EL)
    pad = bump(np.degrees(s), -33, 33, 2.5) * bump(elg, np.degrees(el_bot)[None, :] + 4.5, 40, 2.0) * (A < 50) * (T > 0)
    h += .0105 * pad
    # five crown rolls; the inner three start behind the forehead pad, the outer pair sweep down over the temples
    rolls = [(0., .145, .0145, 44), (.40, .15, .014, 38), (-.40, .15, .014, 38), (.79, .15, .0125, 0), (-.79, .15, .0125, 0)]
    front_el = elg * (np.cos(PH) > 0) + 200 * (np.cos(PH) <= 0)
    for s0, w, amp, fstart in rolls:
        u = (s - s0) / w; prof = np.sqrt(np.clip(1 - u * u, 0, 1)) ** .8
        start = ss(fstart - 2, fstart + 5, front_el) if fstart else 1
        low = ss(-.25, .05, y) if abs(s0) > .6 else ss(-.1, .15, y)
        h += amp * prof * start * low * (T > 0) * (1 - pad)
    for s0 in (.2, -.2, .595, -.595):                                      # stitched channels
        h -= .0024 * np.exp(-((s - s0) / .02) ** 2) * top * (1 - pad) * ss(36, 46, front_el)
    # ear cups: large padded ovals with a rolled edge
    cups = []
    for sd in (1, -1):
        az = np.arctan2(ear_c[0] - hc[0], ear_c[2] - hc[2]) * sd; ce = np.radians(-24)
        cd = np.array([np.cos(ce) * np.sin(az), np.sin(ce), np.cos(ce) * np.cos(az)])
        e1 = np.cross([0, 1, 0], cd); e1 /= np.linalg.norm(e1); e2 = np.cross(cd, e1)
        cu, cv = D @ e1, D @ e2; ov = np.where(D @ cd > 0, np.sqrt((cu / .36) ** 2 + (cv / .44) ** 2), 9.)
        h += .019 * np.sqrt(np.clip(1 - ov ** 2.2, 0, 1)) * (T > -.2) + .0015 * np.exp(-((ov - 1) / .06) ** 2)
        cups.append((cd, e1, e2))
    # cloth: compression creases on the rolls, folds where the flaps bend under the jaw, slack in the hanging part
    Pn = D.reshape(-1, 3); n1 = fbm(Pn * 3 + 5, 1, 3).reshape(EL.shape); n2 = fbm(Pn * 10 + 2, 1, 2).reshape(EL.shape)
    h += np.abs(np.sin(EL * np.sign(np.cos(PH) + 1e-6) * 30 + n1 * 5)) ** 4 * top * .0009
    jaw = np.exp(-(T / .06) ** 2) * flapm[..., 0]
    h += jaw * (np.abs(np.sin(PH * 40 + n1 * 4)) ** 2) * .0022
    h += (n2 - .5) * .0008
    P = P0 + D * h[..., None]
    # light Taubin smoothing of the outer shell
    def lap(Q):
        Qp = np.pad(Q, ((1, 1), (1, 1), (0, 0)), mode='edge'); Qp[:, 0] = Qp[:, -2]; Qp[:, -1] = Qp[:, 1]
        return (Qp[:-2, 1:-1] + Qp[2:, 1:-1] + Qp[1:-1, :-2] + Qp[1:-1, 2:]) / 4 - Q
    for _ in range(3): P = P + .5 * lap(P); P = P - .53 * lap(P)
    # ---- mesh: wrap grid (rows NH..NR-1) and two hanging flap panels (rows 0..NH-1 of the flap columns only) ----
    vid = -np.ones((NR, NC), int); Vl = []
    for i in range(NH, NR):
        for j in range(NC): vid[i, j] = len(Vl); Vl.append(P[i, j])
    fl = hang > 1e-4
    for i in range(NH):
        for j in np.where(fl)[0]: vid[i, j] = len(Vl); Vl.append(P[i, j])
    Vo = np.array(Vl); pole = len(Vo); Vo = np.concatenate([Vo, (hc + [0, (np.linalg.norm(P[-1] - hc, axis=1)).mean(), 0])[None]])
    F = []
    for i in range(NR - 1):
        for j in range(NC):
            j2 = (j + 1) % NC; q = [vid[i, j], vid[i + 1, j], vid[i + 1, j2], vid[i, j2]]
            if min(q) < 0: continue
            F.append([q[0], q[1], q[2]]); F.append([q[0], q[2], q[3]])
    for j in range(NC): F.append([vid[NR - 1, j], pole, vid[NR - 1, (j + 1) % NC]])
    F = np.array(F)
    rowcol = np.argwhere(vid >= 0); order = np.argsort(vid[vid >= 0]); rc = rowcol[order]
    nrm = np.zeros_like(Vo); fn = np.cross(Vo[F[:, 1]] - Vo[F[:, 0]], Vo[F[:, 2]] - Vo[F[:, 0]])
    for k in range(3): np.add.at(nrm, F[:, k], fn)
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True) + 1e-12
    if (nrm[:pole] * (Vo[:pole] - hc)).sum(1).mean() < 0: F = F[:, ::-1]; nrm = -nrm
    nO = len(Vo); Vi = Vo - nrm * .004
    # boundary of the outer shell -> rim strip between the shells and the piping
    e = np.concatenate([F[:, [0, 1]], F[:, [1, 2]], F[:, [2, 0]]]); key = {}
    for a_, b_ in e: key[(a_, b_)] = 1
    bd = [(a_, b_) for a_, b_ in e if (b_, a_) not in key]
    Fr = np.array([[a_, b_ + nO, a_ + nO] for a_, b_ in bd] + [[a_, b_, b_ + nO] for a_, b_ in bd])
    used_v = np.zeros(nO, bool); used_v[np.unique(F)] = True
    Vall = np.concatenate([Vo, Vi]); Fout = F; Fin = F[:, ::-1] + nO
    # uv in grid space
    uv = np.stack([(rc[:, 1] + .5) / NC, (rc[:, 0] + .5) / NR], 1); uv = np.concatenate([uv, [[.5, 1.]]])
    UV = np.concatenate([uv, uv])
    # piping along every boundary loop (rolled cloth)
    nxt = {a_: b_ for a_, b_ in bd}; loops = []; seen = set()
    for a_, _ in bd:
        if a_ in seen: continue
        lp = [a_]; seen.add(a_); c = nxt[a_]
        while c != a_ and c not in seen and c in nxt: lp.append(c); seen.add(c); c = nxt[c]
        if len(lp) > 20: loops.append(lp)
    pipes = []
    for lp in loops:
        path = Vo[lp] - nrm[lp] * .002; path = np.concatenate([path, path[:1]])
        # light smoothing of the loop path
        for _ in range(3): path[1:-1] = (path[:-2] + path[2:] + 2 * path[1:-1]) / 4
        pipes.append(tube(path, .0047, 7))
    pv = np.concatenate([p[0] for p in pipes]); pf = []; o = 0
    for p in pipes: pf.append(p[1] + o); o += len(p[0])
    pf = np.concatenate(pf)
    # ---- AO on the outer shell ----
    import facegen as FG
    occ = np.concatenate([Vo[used_v], sk[np.linalg.norm(sk - hc, axis=1) < .22]])
    ao = np.ones(nO); ao[used_v] = FG.depth_ao(Vo[used_v], nrm[used_v], occ, n_dir=72, px=.0024, ctr=hc, rad=.22)
    aog = np.ones((NR, NC)); aog[rc[:, 0], rc[:, 1]] = ao[:pole]
    aog[:NH][~np.broadcast_to(fl[None], (NH, NC))] = 1
    # ---- texture painted in grid space: cloth tone, seams, stitching, AO ----
    tex = paint_tex(P, D, s, EL, T, A, pad, cups, aog, hang, loops, Vo, NR, NC)
    # ---- leather: hanging chin strap with holes on the left flap, buckle tab on the right ----
    straps = leather(P, NH, NC, phi, hc)
    fit = dict(hc=hc.tolist(), brow=P[NH + 6, int(np.argmin(np.abs(phi)))].tolist(), browN=nrm[vid[NH + 6, int(np.argmin(np.abs(phi)))]].tolist())
    return dict(cloth=(Vall, Fout, Fin, Fr, UV), pipe=(pv, pf), leather=straps, tex=tex), fit

def paint_tex(P, D, s, EL, T, A, pad, cups, ao, hang, loops, Vo, NR, NC, K=4):
    """colour texture in grid space (K texels per grid cell)"""
    Z = lambda X: zoom(X, K, order=1)
    Pz = np.stack([Z(P[..., k]) for k in range(3)], -1); Dz = Pz / 1
    sz, Tz, Az, padz, aoz = Z(s), Z(T), Z(A), Z(pad), Z(ao)
    Dn = np.stack([Z(D[..., k]) for k in range(3)], -1); Dn /= np.linalg.norm(Dn, axis=-1, keepdims=True)
    yz = Dn[..., 1]
    st = np.zeros(sz.shape)
    dash = (np.sin((Pz[..., 0] * 1.3 + Pz[..., 1] + Pz[..., 2] * .7) * 1400) > -.2).astype(float)
    line = lambda d, w=.0011: np.exp(-(d / w) ** 2)
    top = ss(-.05, .3, yz) * (Tz > 0)
    padtop = (padz < .05)
    for s0 in (.2, -.2, .595, -.595): st = np.maximum(st, line(np.abs(sz - s0) * .1, .0006) * top * padtop)   # channel stitching
    # pad border
    st = np.maximum(st, line(np.abs(padz - .5), .06) * (padz > .05) * .9)
    # edge stitching ~9 mm in from every edge
    bpts = np.concatenate([Vo[lp] for lp in loops]); dd, _ = cKDTree(bpts).query(Pz.reshape(-1, 3)); dd = dd.reshape(sz.shape)
    st = np.maximum(st, line(dd - .009))
    # ear cup double outline
    for cd, e1, e2 in cups:
        cu, cv = Dn @ e1, Dn @ e2; ov = np.where(Dn @ cd > 0, np.sqrt((cu / .36) ** 2 + (cv / .44) ** 2), 9.)
        st = np.maximum(st, line((ov - .9) * .05, .0012) + line((ov - .66) * .05, .0012))
    # back panel seams
    st = np.maximum(st, line(np.abs(yz + .15) * .1, .0006) * ss(120, 140, Az) * (Tz > 0))
    st = np.clip(st, 0, 1) * dash
    base = np.array([.032, .036, .047])
    n = fbm(np.concatenate([Dn.reshape(-1, 3) * 6], 0), 1, 4).reshape(sz.shape)
    wear = ss(.55, .8, n) * .25
    col = base[None, None] * (.9 + .2 * n[..., None]) * (1 + wear[..., None] * .5)
    seamdark = np.zeros(sz.shape)
    for s0 in (.2, -.2, .595, -.595): seamdark = np.maximum(seamdark, np.exp(-((sz - s0) / .012) ** 2) * top)
    col *= (1 - .35 * seamdark)[..., None]
    col *= (.45 + .55 * np.clip(aoz, 0, 1) ** 1.2)[..., None]
    thread = np.array([.11, .14, .125])
    col = col * (1 - st[..., None] * .85) + thread * st[..., None] * .85
    img = np.clip(col, 0, 1) ** (1 / 2.2)
    return (img * 255).astype(np.uint8)

def leather(P, NH, NC, phi, hc):
    a = np.degrees(phi); out = []
    jl = int(np.argmin(np.abs(a - 66))); jr = int(np.argmin(np.abs(a + 66)))
    # strap: from the bottom of the +x flap, hangs and curls toward the centre
    p0 = P[0, jl] + np.array([0, .006, 0])
    t = np.linspace(0, 1, 46)
    ctrl = np.array([p0, p0 + [-.004, -.05, .012], p0 + [-.03, -.11, .03], p0 + [-.07, -.15, .045], p0 + [-.11, -.17, .05]])
    from scipy.interpolate import CubicSpline
    path = CubicSpline(np.linspace(0, 1, len(ctrl)), ctrl)(t)
    sv, sf = ribbon(path, .02, hc + [0, -.25, .2])
    out.append((sv, sf))
    # holes as dark studs along the strap end
    for k in range(5):
        c = path[20 + k * 5]; bv, bf = box_mesh(c, path[21 + k * 5] - c, .006, .006, .0045); out.append((bv, bf))
    # buckle tab on the other flap: short strap with a steel frame
    q0 = P[0, jr] + np.array([0, .006, 0]); tp = np.array([q0, q0 + [.004, -.025, .006], q0 + [.01, -.045, .012]])
    tv, tf = ribbon(tp, .022, hc + [0, -.25, .2]); out.append((tv, tf))
    fr = []
    bv, bf = box_mesh(tp[-1] + [0, -.006, 0], tp[2] - tp[1], .026, .006, .006); out.append((bv, bf))
    V = []; Fs = []; o = 0
    for v_, f_ in out: V.append(v_); Fs.append(f_ + o); o += len(v_)
    return np.concatenate(V), np.concatenate(Fs)
