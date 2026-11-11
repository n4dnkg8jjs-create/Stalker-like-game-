"""Minimal MakeHuman (CC0 data) loader: base mesh, macro + face targets, skeleton, weights, proxies."""
import numpy as np, json, os, re
MH = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad/mh/makehuman/data'

def load_obj(path):
    V, VT, F, FT, G = [], [], [], [], []
    g = None
    for ln in open(path):
        if ln.startswith('v '): V.append([float(x) for x in ln.split()[1:4]])
        elif ln.startswith('vt '): VT.append([float(x) for x in ln.split()[1:3]])
        elif ln.startswith('g '): g = ln.split()[1]
        elif ln.startswith('f '):
            it = [t.split('/') for t in ln.split()[1:]]
            F.append([int(a[0]) - 1 for a in it]); FT.append([int(a[1]) - 1 if len(a) > 1 and a[1] else -1 for a in it]); G.append(g)
    return np.array(V), np.array(VT) if VT else None, F, FT, G

_base = None
def base():
    global _base
    if _base is None: _base = load_obj(MH + '/3dobjs/base.obj')
    return _base

_tcache = {}
def target(rel):
    if rel in _tcache: return _tcache[rel]
    idx, d = [], []
    for ln in open(MH + '/targets/' + rel):
        if not ln.strip() or ln[0] == '#': continue
        p = ln.split(); idx.append(int(p[0])); d.append([float(p[1]), float(p[2]), float(p[3])])
    _tcache[rel] = (np.array(idx, int), np.array(d))
    return _tcache[rel]

def apply(v, rel, w):
    if abs(w) < 1e-6: return
    i, d = target(rel)
    if len(i): v[i] += d * w

def macro(v, gender=1.0, age=.55, muscle=.6, weight=.5, race=('caucasian',), height=.5, prop=.5):
    """MakeHuman macro modifier maths: barycentric weights over gender/age/muscle/weight."""
    def agew(a):
        if a < .1875: return {'baby': 1 - a / .1875, 'child': a / .1875}
        if a < .5: t = (a - .1875) / (.5 - .1875); return {'child': 1 - t, 'young': t}
        t = (a - .5) / .5; return {'young': 1 - t, 'old': t}
    def mw(x, lo, mid, hi):
        if x < .5: return {lo: 1 - x / .5, mid: x / .5}
        return {mid: 1 - (x - .5) / .5, hi: (x - .5) / .5}
    G = {'female': 1 - gender, 'male': gender}; A = agew(age)
    Mu = mw(muscle, 'minmuscle', 'averagemuscle', 'maxmuscle'); W = mw(weight, 'minweight', 'averageweight', 'maxweight')
    for g, gw in G.items():
        for a, aw in A.items():
            for r in race: apply(v, f'macrodetails/{r}-{g}-{a}.target', gw * aw / len(race))
            for m, mww in Mu.items():
                for ww, www in W.items():
                    apply(v, f'macrodetails/universal-{g}-{a}-{m}-{ww}.target', gw * aw * mww * www)
    # body/face proportions: >.5 blends MakeHuman's 'ideal proportions' (balanced, regular features), <.5 'uncommon'
    if prop != .5:
        kind, pw = ('idealproportions', (prop - .5) * 2) if prop > .5 else ('uncommonproportions', (.5 - prop) * 2)
        for g, gw in G.items():
            for a, aw in A.items():
                for m, mww in Mu.items():
                    for ww, www in W.items():
                        apply(v, f'macrodetails/proportions/{g}-{a}-{m}-{ww}-{kind}.target', gw * aw * mww * www * pw)
    hd = 'macrodetails/height/'
    for g, gw in G.items():
        for a, aw in A.items():
            for m, mww in Mu.items():
                for ww, www in W.items():
                    if height > .5: apply(v, f'{hd}{g}-{a}-{m}-{ww}-maxheight.target', gw * aw * mww * www * (height - .5) * 2)
                    elif height < .5: apply(v, f'{hd}{g}-{a}-{m}-{ww}-minheight.target', gw * aw * mww * www * (.5 - height) * 2)
    return v

def modifier(v, group, name, value):
    """symmetric face/body modifiers, e.g. ('nose','nose-trans-up|down', .3) -> picks up/down file"""
    pos, neg = name.split('|') if '|' in name else (name, None)
    if value >= 0: apply(v, f'{group}/{pos}.target', value)
    elif neg: apply(v, f'{group}/{neg}.target', -value)

def list_targets(group):
    return sorted(f[:-7] for f in os.listdir(MH + '/targets/' + group) if f.endswith('.target'))

_skel = None
def skeleton():
    global _skel
    if _skel is None:
        _skel = json.load(open(MH + '/rigs/default.mhskel'))
        _skel['weights'] = json.load(open(MH + '/rigs/default_weights.mhw'))['weights']
    return _skel

def joint_pos(v, name):
    s = skeleton(); j = s['joints'][name]
    return v[np.array(j)].mean(0)

def bone_head_tail(v, bone):
    s = skeleton(); b = s['bones'][bone]
    return joint_pos(v, b['head']), joint_pos(v, b['tail'])

def load_mhclo(path):
    """proxy fitting data: per proxy vertex 3 reference base verts + weights + offset; plus scale refs"""
    refs, scale = [], {}
    objf = None; verts = False
    for ln in open(path):
        p = ln.split()
        if not p or p[0].startswith('#'): continue
        if p[0] == 'obj_file': objf = p[1]
        elif p[0] in ('x_scale', 'y_scale', 'z_scale'): scale[p[0][0]] = (int(p[1]), int(p[2]), float(p[3]))
        elif p[0] == 'verts': verts = True
        elif verts and len(p) == 9:
            refs.append([int(p[0]), int(p[1]), int(p[2]), float(p[3]), float(p[4]), float(p[5]), float(p[6]), float(p[7]), float(p[8])])
        elif verts and len(p) == 1 and p[0].isdigit():
            refs.append([int(p[0]), int(p[0]), int(p[0]), 1, 0, 0, 0, 0, 0])
        elif verts and p[0] in ('delete_verts', 'material', 'z_depth'): pass
    return objf, np.array(refs), scale

def fit_proxy(v, mhclo):
    objf, R, sc = load_mhclo(mhclo)
    ids = R[:, :3].astype(int); w = R[:, 3:6]; off = R[:, 6:9].copy()
    for k, ax in enumerate('xyz'):
        if ax in sc:
            a, b, s0 = sc[ax]; off[:, k] *= abs(v[a][k] - v[b][k]) / s0
    pv = (v[ids] * w[:, :, None]).sum(1) + off
    return os.path.join(os.path.dirname(mhclo), objf), pv
