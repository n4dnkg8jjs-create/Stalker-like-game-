"""Bone hierarchy shared by the sculpt and the game. Bones hang along local -y; A-pose rest angles."""
import numpy as np
from sdf import Frame, rot

A_ARM = 0.72          # arm angle from vertical in the bind (A) pose
A_LEG = 0.035
FINGERS = [  # name, z position in wrist frame, length, root radius
    ('idx', .0275, .077, .0088), ('mid', .0093, .084, .0090), ('rng', -.0093, .079, .0086), ('pnk', -.0262, .064, .0076)]
SEG = (.45, .30, .25)

def build():
    """returns ordered list of bones: dict(name,parent,pos,quat(rest local),frame(world))"""
    bones = []; idx = {}
    def add(name, parent, pos, R=None):
        pf = bones[idx[parent]]['frame'] if parent else Frame()
        Rm = np.eye(3) if R is None else R
        fr = pf.child(pos, Rm)
        idx[name] = len(bones)
        bones.append(dict(name=name, parent=parent, pos=list(map(float, pos)), R=Rm, frame=fr))
    add('hips', None, (0, .96, 0))
    add('spine', 'hips', (0, .09, 0))
    add('neck', 'spine', (0, .5, -.01))
    add('head', 'neck', (0, .085, 0))
    for side, S in ((-1, 'L'), (1, 'R')):
        add('sh' + S, 'spine', (side * .19, .415, -.012), rot(0, 0, side * A_ARM))
        add('el' + S, 'sh' + S, (0, -.29, 0))
        add('wr' + S, 'el' + S, (0, -.25, 0))
        for fn, z, L, r in FINGERS:
            add(fn + S + '1', 'wr' + S, (0, -.093, z), rot(0, -side * np.pi / 2, 0))
            add(fn + S + '2', fn + S + '1', (0, -L * SEG[0], 0))
            add(fn + S + '3', fn + S + '2', (0, -L * SEG[1], 0))
        # thumb: points forward-down from the base of the palm, curls across it
        d = np.array([-side * .18, -.62, .76]); d /= np.linalg.norm(d)
        y = -d; z = np.array([-side * 1.0, 0, -.25]); z -= y * (z @ y); z /= np.linalg.norm(z); x = np.cross(y, z)
        add('th' + S + '1', 'wr' + S, (-side * .004, -.026, .03), np.stack([x, y, z], 1))
        add('th' + S + '2', 'th' + S + '1', (0, -.036, 0))
        add('th' + S + '3', 'th' + S + '2', (0, -.031, 0))
        add('hp' + S, 'hips', (side * .092, -.03, 0), rot(0, 0, side * A_LEG))
        add('kn' + S, 'hp' + S, (0, -.43, 0))
        add('an' + S, 'kn' + S, (0, -.42, 0))
    return bones, idx

def quat(R):
    m = R; t = np.trace(m)
    if t > 0:
        s = np.sqrt(t + 1) * 2; w = .25 * s; x = (m[2, 1] - m[1, 2]) / s; y = (m[0, 2] - m[2, 0]) / s; z = (m[1, 0] - m[0, 1]) / s
    elif m[0, 0] > m[1, 1] and m[0, 0] > m[2, 2]:
        s = np.sqrt(1 + m[0, 0] - m[1, 1] - m[2, 2]) * 2; w = (m[2, 1] - m[1, 2]) / s; x = .25 * s; y = (m[0, 1] + m[1, 0]) / s; z = (m[0, 2] + m[2, 0]) / s
    elif m[1, 1] > m[2, 2]:
        s = np.sqrt(1 + m[1, 1] - m[0, 0] - m[2, 2]) * 2; w = (m[0, 2] - m[2, 0]) / s; x = (m[0, 1] + m[1, 0]) / s; y = .25 * s; z = (m[1, 2] + m[2, 1]) / s
    else:
        s = np.sqrt(1 + m[2, 2] - m[0, 0] - m[1, 1]) * 2; w = (m[1, 0] - m[0, 1]) / s; x = (m[0, 2] + m[2, 0]) / s; y = (m[1, 2] + m[2, 1]) / s; z = .25 * s
    return [float(x), float(y), float(z), float(w)]

BONES, BIDX = build()

def seg(name):
    """world-space segment for skin weighting: from joint toward its first child"""
    b = BONES[BIDX[name]]; o = b['frame'].o
    kids = [c for c in BONES if c['parent'] == name and not c['name'].startswith(('th', 'idx', 'mid', 'rng', 'pnk', 'sh'))]
    if name.startswith(('idx', 'mid', 'rng', 'pnk', 'th')) and name.endswith('3'):
        L = dict((f[0], f[2]) for f in FINGERS).get(name[:3], .09) * SEG[2] if not name.startswith('th') else .026
        return o, b['frame'].world((0, -L, 0))
    if name.startswith('wr'): return o, b['frame'].world((0, -.085, 0))
    if name.startswith('an'): return b['frame'].world((0, -.05, -.02)), b['frame'].world((0, -.06, .13))
    if name == 'head': return o, b['frame'].world((0, .15, .02))
    if name == 'hips': return b['frame'].world((0, -.08, 0)), b['frame'].world((0, .09, 0))
    if name == 'spine': return o, b['frame'].world((0, .45, 0))
    if kids: return o, kids[0]['frame'].o
    return o, b['frame'].world((0, -.05, 0))
