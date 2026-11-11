"""Vertex painting: skin tone, lips, stubble, brows, decay; plus eyeball meshes."""
import numpy as np
from sdf import ellipsoid, sphere, capsule, smin

def _hash(ix, iy, iz):
    h = (ix * 73856093) ^ (iy * 19349663) ^ (iz * 83492791)
    h = (h ^ (h >> 13)) * 1274126177
    return ((h ^ (h >> 16)) & 0xffff) / 65535.0

def vnoise(P, scale):
    q = P * scale; i = np.floor(q).astype(np.int64); t = q - i; t = t * t * (3 - 2 * t)
    out = 0
    for dx in (0, 1):
        for dy in (0, 1):
            for dz in (0, 1):
                w = (t[:, 0] if dx else 1 - t[:, 0]) * (t[:, 1] if dy else 1 - t[:, 1]) * (t[:, 2] if dz else 1 - t[:, 2])
                out = out + w * _hash(i[:, 0] + dx, i[:, 1] + dy, i[:, 2] + dz)
    return out

def fbm(P, scale, oct=4):
    s, a, n = 0, .5, 0
    for k in range(oct): s = s + a * vnoise(P + k * 13.7, scale * 2 ** k); n += a; a *= .5
    return s / n

def mix(a, b, t): return a + (np.asarray(b) - a) * np.asarray(t)[:, None]
def ss(e0, e1, x): t = np.clip((x - e0) / (e1 - e0), 0, 1); return t * t * (3 - 2 * t)

def head_colors(v, ao, p, skin=(0.74, 0.55, 0.45), hair=(0.16, 0.12, 0.1), stubble=0.5, decay=0.0):
    """v in skull-centre coordinates"""
    x, y, z = v[:, 0], v[:, 1], v[:, 2]
    n1 = fbm(v, 60, 3); n2 = fbm(v, 300, 2)
    c = np.tile(np.array(skin), (len(v), 1)) * (0.92 + 0.16 * n1[:, None]) * (0.96 + 0.08 * n2[:, None])
    red = np.exp(-((x - .04 * np.sign(x)) ** 2 + (y + .03) ** 2) / .0006) * (z > .03)
    red += np.exp(-(x ** 2 + (y + .035) ** 2 + (z - .105) ** 2) / .00025)
    red += np.exp(-((np.abs(x) - .075) ** 2) / .0001) * (np.abs(y) < .03)
    c = mix(c, (0.78, 0.46, 0.42), np.clip(red * .35, 0, .5))
    lipd = np.minimum(ellipsoid((0, -.0654, .0875), (.0225, .006, .0075))(v), ellipsoid((0, -.0772, .0863), (.0205, .007, .008))(v))
    lip = ss(.0012, -.0004, lipd) * (z > .08)
    c = mix(c, (0.6, 0.36, 0.34) if not decay else (0.32, 0.22, 0.22), lip * .85)
    # stubble shadow on the lower face for the living
    if stubble > 0:
        reg = ss(-.03, -.05, y) * (z > -.01) * (1 - lip) * ss(.075, .06, np.abs(x) + np.maximum(0, -z) * .5)
        reg += ss(-.045, -.055, y) * ss(.06, .04, np.abs(x)) * (z > .07) * (1 - lip)
        sp = (vnoise(v, 2200) > .45) * .5 + .5
        c = mix(c, np.array(hair) * 1.4 + .08, np.clip(reg, 0, 1) * stubble * .5 * sp)
    # scalp under the hair
    hl = scalp_mask(v)
    c = mix(c, np.array(hair) * (0.8 + 0.4 * n2[:, None]), hl * .9)
    # eyebrows painted underneath the strand cards
    bx = np.abs(x); by = .021 + .006 * np.sin(np.clip((bx - .012) / .04, 0, 1) * np.pi) - (bx - .02) * .12
    brow = np.exp(-((y - by) / .0042) ** 2) * ss(.009, .014, bx) * ss(.056, .048, bx) * (z > .06)
    c = mix(c, np.array(hair) * .9, brow * .75)
    # soft darkening in the eye sockets and under the nose
    c = c * (1 - .18 * np.exp(-((bx - .0315) ** 2 + (y - .006) ** 2) / .0003)[:, None] * (z > .06)[:, None])
    if decay:
        m = fbm(v, 40, 3)
        c = mix(c, (0.5, 0.48, 0.38), np.full(len(v), .55 * decay))
        c = mix(c, (0.3, 0.26, 0.22), ss(.55, .75, m) * .6 * decay)
        c = c * (1 - .35 * decay * np.exp(-((bx - .0315) ** 2 + y ** 2) / .0005)[:, None])
    c = c * (0.35 + 0.65 * ao[:, None])
    return np.clip(c, 0, 1)

def scalp_mask(v):
    x, y, z = v[:, 0], v[:, 1], v[:, 2]
    front = ss(.048, .056, y + (np.maximum(0, -z + .06)) * .25) * (z > .02)
    side = ss(.012, .03, y + np.maximum(0, -z) * .6) * (z <= .06) * (np.abs(x) > .0)
    back = ss(-.07, -.05, y) * (z < -.03)
    m = np.maximum(front, side); m = np.maximum(m, back * ss(-.02, -.06, z))
    m *= ss(.085, .07, np.abs(x) * (y < .02) + 0 * x) + (y >= .02)
    return np.clip(m, 0, 1)

def uv_sphere(c, r, nu=32, nv=20):
    th = np.linspace(0, np.pi, nv + 1); ph = np.linspace(0, 2 * np.pi, nu + 1)
    T, Pp = np.meshgrid(th, ph, indexing='ij')
    d = np.stack([np.sin(T) * np.sin(Pp), np.cos(T), np.sin(T) * np.cos(Pp)], -1).reshape(-1, 3)
    v = np.asarray(c) + d * r
    f = []
    for i in range(nv):
        for j in range(nu):
            a = i * (nu + 1) + j; b = a + nu + 1
            f += [[a, b, a + 1], [a + 1, b, b + 1]]
    return v, np.array(f), d

def eye_colors(d, iris=(0.33, 0.42, 0.48), decay=0.0):
    ang = np.arccos(np.clip(d[:, 2], -1, 1))
    c = np.tile(np.array([0.9, 0.87, 0.83]), (len(d), 1))
    c = mix(c, (0.85, 0.66, 0.62), ss(.6, 1.3, ang) * .5)
    ir = ang < .42
    a = np.arctan2(d[:, 1], d[:, 0]); st = .75 + .25 * np.sin(a * 40)
    c[ir] = np.array(iris)[None, :] * st[ir, None]
    c = mix(c, (0.1, 0.09, 0.08), ss(.34, .42, ang) * (ang < .44))
    c[ang < .15] = (0.02, 0.02, 0.02)
    if decay: c = mix(c, (0.62, 0.62, 0.56), np.full(len(d), .75 * decay))
    return c
