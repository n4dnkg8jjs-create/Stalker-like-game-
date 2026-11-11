"""Hair, eyebrows and eyelashes as clumps of strands (alpha-textured ribbons) grown over the head surface."""
import numpy as np
from scipy.spatial import cKDTree
from mhbuild import *
from skintex import landmarks
from paint import fbm, ss
from PIL import Image, ImageDraw

def strand_texture(path, W=128, H=512, n=70, seed=1, lash=False):
    rng = np.random.default_rng(seed)
    im = Image.new('RGBA', (W, H), (255, 255, 255, 0)); d = ImageDraw.Draw(im)
    for i in range(n):
        x = rng.uniform(2, W - 2); L = H * rng.uniform(.6, 1.0); g = int(rng.uniform(170, 255))
        pts = []; wob = rng.uniform(-4, 4); bend = rng.uniform(-6, 6)
        for k in range(24):
            t = k / 23; pts.append((x + np.sin(t * 2.5 + i) * wob * t + t * t * bend, t * L))
        for k in range(23):
            a = int(255 * (1 - (k / 23) ** 2.5))
            d.line([pts[k], pts[k + 1]], fill=(g, g, g, a), width=2 if lash else 1)
    im.save(path)

def fuzz_texture(path, W=256, seed=3):
    """short-hair cross sections for shell layers: alpha = strand height"""
    rng = np.random.default_rng(seed); a = np.zeros((W, W)); g = np.zeros((W, W))
    for _ in range(26000):
        x, y = rng.integers(0, W, 2); h = rng.uniform(.35, 1); a[y, x] = max(a[y, x], h); g[y, x] = rng.uniform(.6, 1)
        if rng.random() < .5: a[(y + 1) % W, x] = max(a[(y + 1) % W, x], h * .9); g[(y + 1) % W, x] = g[y, x]
    img = np.zeros((W, W, 4), np.uint8); img[..., 0] = img[..., 1] = img[..., 2] = (g * 255).astype(np.uint8); img[..., 3] = (a * 255).astype(np.uint8)
    Image.fromarray(img).save(path)

def shells(v0, scalp_fn, layers=6, step=.0011):
    """fur-shell layers over the scalp: returns list of (positions, tris, uv) per layer"""
    v = sub(v0); n = vert_normals(v, TRIS_ORIG)
    cen = v[TRIS_ORIG].mean(1); keep = scalp_fn(cen) > .35
    tris = TRIS[keep]; used = np.unique(tris); remap = -np.ones(len(VIDX), int); remap[used] = np.arange(len(used))
    out = []
    for k in range(1, layers + 1):
        p = v[VIDX[used]] + n[VIDX[used]] * step * k
        out.append((p, remap[tris], UV[used] * 20, n[VIDX[used]]))
    return out

class Surface:
    def __init__(self, v):
        self.v = v; self.n = vert_normals(v, TRIS_ORIG)
        self.ids = np.unique(TRIS_ORIG); self.kd = cKDTree(v[self.ids])
    def project(self, p, lift):
        d, k = self.kd.query(p); q = self.v[self.ids[k]]; n = self.n[self.ids[k]]
        h = ((p - q) * n).sum(-1)
        p = p + n * np.maximum(lift - h, 0)[:, None]
        return p, n

def sample_surface(v, weight_fn, n, rng):
    T = TRIS_ORIG; a, b, c = v[T[:, 0]], v[T[:, 1]], v[T[:, 2]]
    area = np.linalg.norm(np.cross(b - a, c - a), axis=1) / 2
    w = area * weight_fn((a + b + c) / 3); w = np.maximum(w, 0)
    if w.sum() <= 0: return np.zeros((0, 3))
    ti = rng.choice(len(T), n, p=w / w.sum())
    r1, r2 = rng.random(n), rng.random(n); s = np.sqrt(r1)
    return a[ti] * (1 - s)[:, None] + b[ti] * (s * (1 - r2))[:, None] + c[ti] * (s * r2)[:, None]

def ribbons(paths, normals, widths, rng, uvw=.22):
    P, N, U, Tr = [], [], [], []
    for path, nor, w in zip(paths, normals, widths):
        k = len(path); u0 = rng.uniform(0, 1 - uvw); base = len(P)
        for i in range(k):
            t = i / (k - 1)
            fw = path[min(i + 1, k - 1)] - path[max(i - 1, 0)]; fw /= np.linalg.norm(fw) + 1e-12
            sd = np.cross(fw, nor[i]); sd /= np.linalg.norm(sd) + 1e-12
            hw = w * (1 - .65 * t) / 2
            P += [path[i] - sd * hw, path[i] + sd * hw]; N += [nor[i], nor[i]]; U += [(u0, 1 - t), (u0 + uvw, 1 - t)]
            if i < k - 1: b = base + 2 * i; Tr += [[b, b + 1, b + 2], [b + 1, b + 3, b + 2]]
    return np.array(P), np.array(N), np.array(U), np.array(Tr)

def grow(S, roots, flow_fn, L, seg, lift, droop, rng, jitter=.25):
    paths, norms = [], []
    p, n = S.project(roots, lift)
    for i in range(len(roots)):
        pts = [p[i]]; nn = [n[i]]; d = flow_fn(p[i], n[i]); cur = p[i]
        for s in range(seg):
            d = d - n[i] * (d @ n[i]) * .7 + np.array([0, -1., 0]) * droop * (s + 1) / seg + rng.normal(0, jitter, 3) * .2
            d /= np.linalg.norm(d)
            cur = cur + d * L[i] / seg
            q, qn = S.project(cur[None], lift * (1 + s * .35))
            cur = q[0]; pts.append(cur); nn.append(qn[0])
        paths.append(np.array(pts)); norms.append(np.array(nn))
    return paths, norms

def hair(v0, style, seed=0):
    v = sub(v0); rng = np.random.default_rng(seed); S = Surface(v); Lm = landmarks(v0); M = Lm['M']
    crown = M + np.array([0, .11, -.07])
    hm = mh_mask(('head', 'jaw', 'oris', 'levator', 'orbicularis', 'risorius', 'special', 'temporalis', 'eye'))
    from scipy.spatial import cKDTree as KD
    kd = KD(v);
    def region(P):
        q = P - M; x, y, z = q[:, 0], q[:, 1], q[:, 2]; ax = np.abs(x)
        edge = .064 - .006 * np.cos(np.clip(ax / .05, 0, 1) * np.pi)
        front = ss(edge - .004, edge + .008, y + np.maximum(0, -z) * .3)
        side = ss(.004, .028, y + np.maximum(0, -z - .01) * .55) * ss(.04, .0, z)
        back = ss(-.07, -.05, y) * ss(-.03, -.06, z)
        r = np.maximum(np.maximum(front, side), back) * (hm[kd.query(P)[1]] > .5)
        if style == 'grey': r *= 1 - ss(.5, .7, np.exp(-((x) ** 2 + (y - .1) ** 2 + (z + .02) ** 2) / .0025))
        return r
    cfg = {'buzz': dict(n=2600, L=(.009, .016), seg=3, lift=.0012, droop=.05, w=.006),
           'messy': dict(n=1400, L=(.04, .08), seg=5, lift=.0025, droop=.35, w=.009),
           'grey': dict(n=700, L=(.025, .05), seg=4, lift=.0018, droop=.3, w=.007)}[style]
    roots = sample_surface(v, region, cfg['n'], rng)
    def flow(p, n):
        d = p - crown; d -= n * (d @ n);
        if style == 'messy': d += np.array([rng.uniform(-.5, .5), -.4, .3]) * np.linalg.norm(d)
        if style == 'grey': d = d + np.array([0, 0, -1.]) * np.linalg.norm(d) * .8 * (p[2] > M[2] - .03)
        return d / (np.linalg.norm(d) + 1e-9)
    Ls = rng.uniform(*cfg['L'], len(roots))
    paths, norms = grow(S, roots, flow, Ls, cfg['seg'], cfg['lift'], cfg['droop'], rng)
    return ribbons(paths, norms, rng.uniform(.7, 1.2, len(paths)) * cfg['w'], rng)

def brows(v0, seed=0, hc=None):
    v = sub(v0); rng = np.random.default_rng(seed); S = Surface(v); Lm = landmarks(v0); M = Lm['M']
    ex = abs(Lm['eL'][0] - M[0])
    def band(P):
        q = P - M; x, y, z = q[:, 0], q[:, 1], q[:, 2]; ax = np.abs(x)
        by = .011 + .005 * np.sin(np.clip((ax - .01) / .045, 0, 1) * np.pi) - np.maximum(0, ax - .035) * .2
        return np.exp(-((y - by + .0015) / .0033) ** 2) * ss(.008, .013, ax) * ss(.056, .048, ax) * (z > -.0)
    roots = sample_surface(v, band, 720, rng)
    def flow(p, n):
        q = p - M; ax = abs(q[0]); sx = np.sign(q[0]); t = np.clip((ax - .01) / .045, 0, 1)
        d = np.array([sx * (.25 + .9 * t), .9 - 1.3 * t, 0]); d -= n * (d @ n)
        return d / (np.linalg.norm(d) + 1e-9)
    Ls = rng.uniform(.0035, .0065, len(roots))
    paths, norms = grow(S, roots, flow, Ls, 3, .00025, 0, rng, jitter=.06)
    return ribbons(paths, norms, rng.uniform(.00045, .0007, len(paths)), rng, uvw=.022)

def boundary_loops(tris):
    e = np.concatenate([tris[:, [0, 1]], tris[:, [1, 2]], tris[:, [2, 0]]])
    key = {}
    for a, b in e: key[(a, b)] = 1
    bd = [(a, b) for a, b in e if (b, a) not in key]
    nxt = {a: b for a, b in bd}; loops = []; seen = set()
    for a, _ in bd:
        if a in seen: continue
        loop = [a]; seen.add(a); c = nxt[a]
        while c != a and c not in seen and c in nxt: loop.append(c); seen.add(c); c = nxt[c]
        loops.append(loop)
    return loops

def lashes(v, seed=0):
    """use MakeHuman's eyelash helper strips; UVs rebuilt so strands run root -> tip"""
    Lm = landmarks(v); P, N, U, Tr = [], [], [], []
    for gname in ('helper-l-eyelashes-1', 'helper-l-eyelashes-2', 'helper-r-eyelashes-1', 'helper-r-eyelashes-2'):
        vid, _, tri = group_topology(gname)
        pts = v[vid]; e = Lm['eL'] if np.linalg.norm(pts.mean(0) - Lm['eL']) < np.linalg.norm(pts.mean(0) - Lm['eR']) else Lm['eR']
        d = np.linalg.norm(pts - e, axis=1); dv = (d - d.min()) / (np.ptp(d) + 1e-9)
        if pts[:, 1].mean() < e[1]: dv = np.clip(dv * 2.4, 0, 1.6)   # lower lashes: much shorter
        u = (pts[:, 0] - pts[:, 0].min()) / (np.ptp(pts[:, 0]) + 1e-9)
        b = len(P); P += list(pts); U += list(zip(u * 3, 1 - dv)); N += [np.array([0, 0, 1.])] * len(pts)
        Tr += list(tri + b)
    return np.array(P), np.array(N), np.array(U), np.array(Tr)

def mustache(v0, seed=0):
    """upper-lip moustache: dense short strands combed down and out from under the nose"""
    v = sub(v0); rng = np.random.default_rng(seed); S = Surface(v); Lm = landmarks(v0); M = Lm['M']
    my = Lm['mouth'][1]; ny = Lm['nose'][1]
    def band(P):
        q = P - M; x, y, z = q[:, 0], q[:, 1], q[:, 2]; ax = np.abs(x)
        top = ny - M[1] - .012; bot = my - M[1] + .004
        return ss(bot - .002, bot + .004, y) * ss(top + .003, top - .003, y) * ss(.03, .022, ax + np.maximum(0, (y - bot)) * .3) * (z > .02)
    roots = sample_surface(v, band, 520, rng)
    def flow(p, n):
        q = p - M; sx = np.sign(q[0]); d = np.array([sx * (.25 + abs(q[0]) * 14), -1., .15]); d -= n * (d @ n)
        return d / (np.linalg.norm(d) + 1e-9)
    Ls = rng.uniform(.006, .011, len(roots))
    paths, norms = grow(S, roots, flow, Ls, 3, .0006, .1, rng, jitter=.12)
    return ribbons(paths, norms, rng.uniform(.0008, .0013, len(paths)), rng, uvw=.03)
