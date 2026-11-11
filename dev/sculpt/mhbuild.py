"""Build game characters from the CC0 MakeHuman base mesh."""
import numpy as np, json, base64, io, math
from mh import *
from paint import fbm, vnoise, ss
from PIL import Image

V0, VT, F, FT, G = base()
SK = skeleton()

# ---------------- shared body topology: Catmull-Clark on the head & neck, vertices split at UV seams ----------------
import scipy.sparse as _sp
def _head_region_mask():
    sk = skeleton(); m = np.zeros(len(V0))
    for bname, lst in sk['weights'].items():
        bb = bname
        while bb and bb not in ('head', 'neck01', 'neck02', 'neck03'): bb = sk['bones'][bb]['parent']
        if bb:
            for vi, w in lst: m[vi] += w
    return m

def build_topology(subdiv=True):
    faces = [(f, t) for f, t, g in zip(F, FT, G) if g == 'body']
    n0 = len(V0); rows, cols, vals = [], [], []
    hm = _head_region_mask()
    reg = np.array([subdiv and all(hm[i] > .5 for i in f) for f, _ in faces])
    # edges -> adjacent region faces
    edge_faces = {}
    for fi, (f, _) in enumerate(faces):
        if not reg[fi]: continue
        for k in range(4):
            a, b = f[k], f[(k + 1) % 4]; e = (min(a, b), max(a, b)); edge_faces.setdefault(e, []).append(fi)
    nxt = [n0]
    def newv(): nxt[0] += 1; return nxt[0] - 1
    fpt = {}; ept = {}; comb = {}           # new vertex -> {orig: weight}
    for fi, (f, _) in enumerate(faces):
        if reg[fi]: k = newv(); fpt[fi] = k; comb[k] = {i: .25 for i in f}
    for e, fl in edge_faces.items():
        k = newv(); ept[e] = k
        if len(fl) == 2:
            d = {e[0]: .25, e[1]: .25}
            for fi in fl:
                for i in faces[fi][0]: d[i] = d.get(i, 0) + .25 * .25
            comb[k] = d
        else: comb[k] = {e[0]: .5, e[1]: .5}
    # vertex rule (interior region vertices only; region-boundary vertices stay put to match neighbours)
    vfaces = {}; vedges = {}
    for fi, (f, _) in enumerate(faces):
        for i in f: vfaces.setdefault(i, []).append(fi)
    for e in edge_faces:
        for i in e: vedges.setdefault(i, []).append(e)
    upd = {}
    for i, fl in vfaces.items():
        if not all(reg[fi] for fi in fl): continue
        es = vedges.get(i, [])
        if any(len(edge_faces[e]) != 2 for e in es) or len(es) != len(fl): continue
        n = len(fl); d = {}
        for fi in fl:
            for j in faces[fi][0]: d[j] = d.get(j, 0) + .25 / n / n
        for e in es:
            for j in e: d[j] = d.get(j, 0) + .5 * 2 / n / n
        d[i] = d.get(i, 0) + (n - 3) / n
        upd[i] = d
    NV = nxt[0]
    for i in range(n0):
        d = upd.get(i, {i: 1.0})
        for j, w in d.items(): rows.append(i); cols.append(j); vals.append(w)
    for k, d in comb.items():
        for j, w in d.items(): rows.append(k); cols.append(j); vals.append(w)
    S = _sp.csr_matrix((vals, (rows, cols)), shape=(NV, n0))
    # faces with face-varying UVs
    corners = []
    for fi, (f, t) in enumerate(faces):
        uvs = [VT[x] for x in t]
        if not reg[fi]:
            q = [(f[k], tuple(uvs[k])) for k in range(4)]
            corners += [q[0], q[1], q[2], q[0], q[2], q[3]]
        else:
            fp = (fpt[fi], tuple(np.mean(uvs, 0)))
            for k in range(4):
                a, b, c = f[(k - 1) % 4], f[k], f[(k + 1) % 4]
                ua, ub, uc = uvs[(k - 1) % 4], uvs[k], uvs[(k + 1) % 4]
                eab = (ept[(min(a, b), max(a, b))], tuple((ua + ub) / 2)); ebc = (ept[(min(b, c), max(b, c))], tuple((ub + uc) / 2))
                q = [(b, tuple(ub)), ebc, fp, eab]
                corners += [q[0], q[1], q[2], q[0], q[2], q[3]]
    pairs = {}; vidx = []; uv = []; tris = []
    for vi, u in corners:
        k = (vi, u)
        if k not in pairs: pairs[k] = len(vidx); vidx.append(vi); uv.append(u)
        tris.append(pairs[k])
    return S, np.array(vidx), np.array(uv), np.array(tris).reshape(-1, 3)
S, VIDX, UV, TRIS = build_topology()
NVS = S.shape[0]
def sub(x): return S @ x

def group_topology(name):
    pairs = {}; vidx = []; uv = []; tris = []
    for f, t, g in zip(F, FT, G):
        if g != name: continue
        ids = []
        for vi, ti in zip(f, t):
            k = (vi, ti)
            if k not in pairs: pairs[k] = len(vidx); vidx.append(vi); uv.append(VT[ti] if ti >= 0 else (0, 0))
            ids.append(pairs[k])
        tris.append([ids[0], ids[1], ids[2]])
        if len(ids) == 4: tris.append([ids[0], ids[2], ids[3]])
    return np.array(vidx), np.array(uv), np.array(tris)

# ---------------- character shaping ----------------
def shape(p):
    v = V0.copy()
    macro(v, gender=1, age=p.get('age', .55), muscle=p.get('muscle', .75), weight=p.get('weight', .5), height=p.get('height', .55),
          race=p.get('race', ('caucasian',)), prop=p.get('prop', .92 if p.get('skin') == 'alive' else .6))
    for (grp, name), val in p.get('mods', {}).items():
        if grp.endswith('/lr'):
            g0 = grp[:-3]
            for s in ('l', 'r'): modifier(v, g0, name.replace('{s}', s), val)
        else: modifier(v, grp, name, val)
    v *= .1
    bodyv = v[np.unique(np.array([i for f, g in zip(F, G) if g == 'body' for i in f]))]
    v[:, 1] -= bodyv[:, 1].min()
    return v

# ---------------- skeleton: map MakeHuman's 163 bones onto the game's rig ----------------
MAP = {'root': 'hips', 'spine05': 'hips', 'spine04': 'hips', 'pelvis.L': 'hips', 'pelvis.R': 'hips',
       'spine03': 'spine', 'spine02': 'spine', 'spine01': 'spine', 'breast.L': 'spine', 'breast.R': 'spine',
       'clavicle.L': 'spine', 'clavicle.R': 'spine', 'shoulder01.L': 'spine', 'shoulder01.R': 'spine',
       'neck01': 'neck', 'neck02': 'neck', 'neck03': 'neck', 'head': 'head'}
FING = {'finger1': 'th', 'finger2': 'idx', 'finger3': 'mid', 'finger4': 'rng', 'finger5': 'pnk'}
def side_of(mh_name):   # MakeHuman .L is +x (character's left); the game calls x<0 'L'
    return 'R' if mh_name.endswith('.L') else 'L'
for b in SK['bones']:
    if b.endswith(('.L', '.R')):
        s = side_of(b); base_ = b[:-2]
        if base_ in ('upperarm01', 'upperarm02'): MAP[b] = 'sh' + s
        elif base_ in ('lowerarm01', 'lowerarm02'): MAP[b] = 'el' + s
        elif base_ in ('wrist',) or base_.startswith('metacarpal'): MAP[b] = 'wr' + s
        elif base_.startswith('finger'):
            fn, seg = base_.split('-'); MAP[b] = FING[fn] + s + seg
        elif base_ in ('upperleg01', 'upperleg02'): MAP[b] = 'hp' + s
        elif base_ in ('lowerleg01', 'lowerleg02'): MAP[b] = 'kn' + s
        elif base_ == 'foot' or base_.startswith('toe'): MAP[b] = 'an' + s
def mapped(b):
    while b and b not in MAP: b = SK['bones'][b]['parent']
    return MAP.get(b, 'hips')

GAME_BONES = ['hips', 'spine', 'neck', 'head']
PARENT = {'hips': None, 'spine': 'hips', 'neck': 'spine', 'head': 'neck'}
SRC = {'hips': 'spine05', 'spine': 'spine03', 'neck': 'neck01', 'head': 'head'}
for s, m in (('L', 'R'), ('R', 'L')):
    GAME_BONES += ['sh' + s, 'el' + s, 'wr' + s]
    PARENT.update({'sh' + s: 'spine', 'el' + s: 'sh' + s, 'wr' + s: 'el' + s})
    SRC.update({'sh' + s: 'upperarm01.' + m, 'el' + s: 'lowerarm01.' + m, 'wr' + s: 'wrist.' + m})
    for fn, gn in FING.items():
        for k in (1, 2, 3):
            n = gn + s + str(k); GAME_BONES.append(n); PARENT[n] = ('wr' + s) if k == 1 else gn + s + str(k - 1); SRC[n] = f'{fn}-{k}.{m}'
    GAME_BONES += ['hp' + s, 'kn' + s, 'an' + s]
    PARENT.update({'hp' + s: 'hips', 'kn' + s: 'hp' + s, 'an' + s: 'kn' + s})
    SRC.update({'hp' + s: 'upperleg01.' + m, 'kn' + s: 'lowerleg01.' + m, 'an' + s: 'foot.' + m})
BI = {n: i for i, n in enumerate(GAME_BONES)}

def minrot(a, b):
    a = a / np.linalg.norm(a); b = b / np.linalg.norm(b); c = np.cross(a, b); d = a @ b
    if d < -.9999: return np.diag([1, -1, -1.])
    K = np.array([[0, -c[2], c[1]], [c[2], 0, -c[0]], [-c[1], c[0], 0]])
    return np.eye(3) + K + K @ K / (1 + d)

def rig(v):
    """world joint positions + world frames for the game bones"""
    head = {}; tail = {}
    for n in GAME_BONES:
        h, t = bone_head_tail(v, SRC[n]); head[n] = h; tail[n] = t
    W = {}
    for n in GAME_BONES:
        P = PARENT[n]; Rp = W[P] if P else np.eye(3)
        if n in ('hips', 'spine', 'neck', 'head'): R = np.eye(3)
        elif n.startswith(('an', 'wr')): R = Rp.copy()
        elif n.startswith(('idx', 'mid', 'rng', 'pnk', 'th')):
            s = n[-2]; wr = 'wr' + s
            d = tail[n] - head[n]; d /= np.linalg.norm(d)
            a = head['idx' + s + '1'] - head[wr]; b = head['pnk' + s + '1'] - head['idx' + s + '1']
            pn = np.cross(a, b); pn /= np.linalg.norm(pn)
            if pn[1] > 0: pn = -pn          # in the bind pose the palms face down
            if n.startswith('th'):   # thumb curls across the palm toward the little finger
                pn = (head['pnk' + s + '1'] - head[n]); pn -= d * (pn @ d)
                pn /= np.linalg.norm(pn)
            y = -d; z = pn - y * (pn @ y); z /= np.linalg.norm(z); x = np.cross(y, z)
            R = np.stack([x, y, z], 1)
        else:
            d = tail[n] - head[n]; R = minrot(np.array([0, -1., 0]), d)
        W[n] = R
    return head, W

def rig_json(v):
    head, W = rig(v)
    out = []
    for n in GAME_BONES:
        P = PARENT[n]
        if P: pos = W[P].T @ (head[n] - head[P]); Rl = W[P].T @ W[n]
        else: pos = head[n]; Rl = W[n]
        from skeleton import quat
        out.append(dict(n=n, p=P, pos=[round(float(x), 5) for x in pos], q=[round(x, 6) for x in quat(Rl)]))
    return out, head, W

def skin_weights():
    """per base-mesh vertex: top-4 game bones"""
    acc = np.zeros((len(V0), len(GAME_BONES)))
    for b, lst in SK['weights'].items():
        gi = BI[mapped(b)]
        for vi, w in lst: acc[vi, gi] += w
    acc[acc.sum(1) == 0, BI['hips']] = 1
    acc = S @ acc
    idx = np.argsort(-acc, 1)[:, :4]; w = np.take_along_axis(acc, idx, 1)
    w /= w.sum(1, keepdims=True)
    return idx.astype(np.uint8), w

def mh_mask0(bones_prefix):
    m = np.zeros(len(V0))
    for b, lst in SK['weights'].items():
        if any(b.startswith(p) for p in bones_prefix):
            for vi, w in lst: m[vi] += w
    return np.clip(m, 0, 1)

def mh_mask(bones_prefix):
    m = np.zeros(len(V0))
    for b, lst in SK['weights'].items():
        if any(b.startswith(p) for p in bones_prefix):
            for vi, w in lst: m[vi] += w
    return np.clip(S @ m, 0, 1)

def vert_normals(v, tris_orig):
    fn = np.cross(v[tris_orig[:, 1]] - v[tris_orig[:, 0]], v[tris_orig[:, 2]] - v[tris_orig[:, 0]])
    n = np.zeros_like(v)
    for k in range(3): np.add.at(n, tris_orig[:, k], fn)
    return n / np.maximum(np.linalg.norm(n, axis=1, keepdims=True), 1e-12)
TRIS_ORIG = VIDX[TRIS]   # triangles over subdivided (unsplit) vertices

def cavity(v):
    """concavity per base vertex from the umbrella Laplacian"""
    n = vert_normals(v, TRIS_ORIG)
    import scipy.sparse as sp
    e = np.concatenate([TRIS_ORIG[:, [0, 1]], TRIS_ORIG[:, [1, 2]], TRIS_ORIG[:, [2, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    A = sp.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(len(v), len(v))).tocsr(); A.data[:] = 1
    deg = np.asarray(A.sum(1)).ravel(); deg[deg == 0] = 1
    L = (A @ v) / deg[:, None] - v
    c = (L * n).sum(1)
    for _ in range(5): c = (A @ c) / deg * .6 + c * .4
    return c, n
