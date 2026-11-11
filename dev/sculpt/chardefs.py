"""Character definitions and shared eye topology (imported by export.py and dev_face.py)."""
import numpy as np
from mh import *
from PIL import Image
CHARS = {
  'player': dict(age=.55, muscle=.78, weight=.5, height=.52, hair='buzz', hc=(.17, .12, .09), iris='grey', skin='alive',
                 mods={('chin', 'chin-prominent-incr|chin-prominent-decr'): .2, ('chin', 'chin-width-incr|chin-width-decr'): .25,
                       ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .3, ('nose', 'nose-hump-incr|nose-hump-decr'): .15}),
  'guard1': dict(age=.62, muscle=.66, weight=.62, height=.5, hair='buzz', hc=(.2, .15, .1), iris='brown', skin='alive', tint=[1.03, .975, .95],
                 mods={('nose', 'nose-scale-horiz-incr|nose-scale-horiz-decr'): .3, ('nose', 'nose-point-width-incr|nose-point-width-decr'): .4,
                       ('mouth', 'mouth-lowerlip-volume-incr|mouth-lowerlip-volume-decr'): .3, ('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): .25,
                       ('chin', 'chin-height-incr|chin-height-decr'): -.2, ('head', 'head-square'): .4}),
  'guard2': dict(age=.52, muscle=.72, weight=.45, height=.58, hair='buzz', hc=(.13, .1, .08), iris='blue', skin='alive', tint=[.975, .975, .985],
                 mods={('nose', 'nose-scale-vert-incr|nose-scale-vert-decr'): .35, ('nose', 'nose-hump-incr|nose-hump-decr'): .4,
                       ('chin', 'chin-prognathism-incr|chin-prognathism-decr'): .3, ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .4,
                       ('mouth', 'mouth-scale-horiz-incr|mouth-scale-horiz-decr'): -.2, ('head', 'head-oval'): .3}),
  'oldman': dict(age=.9, muscle=.25, weight=.35, height=.45, hair='grey', hc=(.47, .45, .42), iris='cloudy', skin='decay',
                 mods={('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): -.7, ('nose', 'nose-volume-incr|nose-volume-decr'): .4,
                       ('nose', 'nose-point-up|nose-point-down'): -.3, ('mouth', 'mouth-angles-up|mouth-angles-down'): -.5,
                       ('chin', 'chin-jaw-drop-incr|chin-jaw-drop-decr'): .55, ('head', 'head-age-incr|head-age-decr'): .6}),
  'plaid': dict(age=.68, muscle=.45, weight=.7, height=.5, hair='messy', hc=(.2, .15, .11), iris='cloudy', skin='decay',
                mods={('nose', 'nose-scale-horiz-incr|nose-scale-horiz-decr'): .4, ('chin', 'chin-jaw-drop-incr|chin-jaw-drop-decr'): .35,
                      ('head', 'head-fat-incr|head-fat-decr'): .4, ('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): -.3}),
  'patrol': dict(age=.52, muscle=.7, weight=.48, height=.55, hair='buzz', hc=(.25, .19, .13), iris='cloudy', skin='decay',
                 mods={('nose', 'nose-scale-vert-incr|nose-scale-vert-decr'): .2, ('chin', 'chin-jaw-drop-incr|chin-jaw-drop-decr'): .3}),
  'guard3': dict(age=.74, muscle=.6, weight=.7, height=.47, hair='buzz', hc=(.18, .14, .1), iris='brown', skin='alive', tint=[1.05, .955, .92], mustache=True,
                 mods={('nose', 'nose-hump-incr|nose-hump-decr'): .5, ('nose', 'nose-scale-horiz-incr|nose-scale-horiz-decr'): .35, ('chin', 'chin-width-incr|chin-width-decr'): .45,
                       ('head', 'head-square'): .55, ('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): .35, ('mouth', 'mouth-angles-up|mouth-angles-down'): -.3,
                       ('eyebrows', 'eyebrows-trans-up|eyebrows-trans-down'): -.35, ('forehead', 'forehead-scale-vert-incr|forehead-scale-vert-decr'): -.25, ('neck', 'neck-scale-horiz-incr|neck-scale-horiz-decr'): .4}),
  'guard4': dict(age=.44, muscle=.6, weight=.38, height=.62, hair='buzz', hc=(.42, .34, .21), iris='blue', skin='alive', tint=[.985, .975, .985],
                 mods={('nose', 'nose-scale-vert-incr|nose-scale-vert-decr'): .3, ('nose', 'nose-point-up|nose-point-down'): .25, ('chin', 'chin-prominent-incr|chin-prominent-decr'): .45,
                       ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .55, ('head', 'head-oval'): .55, ('mouth', 'mouth-scale-horiz-incr|mouth-scale-horiz-decr'): -.3,
                       ('ears/lr', '{s}-ear-wing-incr|{s}-ear-wing-decr'): .35, ('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): -.35}),
  'driver': dict(age=.48, muscle=.6, weight=.55, height=.5, hair='buzz', hc=(.2, .15, .1), iris='grey', skin='alive', tint=[1.0, .955, .93], tsh=True,
                 mods={('nose', 'nose-scale-vert-incr|nose-scale-vert-decr'): -.2, ('nose', 'nose-point-width-incr|nose-point-width-decr'): .3, ('chin', 'chin-width-incr|chin-width-decr'): .3,
                       ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .35, ('head', 'head-round'): .3, ('mouth', 'mouth-scale-horiz-incr|mouth-scale-horiz-decr'): .15}),
  'guard5': dict(age=.56, muscle=.7, weight=.56, height=.46, hair='buzz', hc=(.07, .06, .05), iris='brown', skin='alive', tint=[1.0, .94, .84], race=('caucasian', 'asian'),
                 mods={('head', 'head-round'): .35, ('nose', 'nose-scale-horiz-incr|nose-scale-horiz-decr'): .3, ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .45,
                       ('chin', 'chin-width-incr|chin-width-decr'): .25, ('mouth', 'mouth-lowerlip-volume-incr|mouth-lowerlip-volume-decr'): .3}),
}

EV, EVT, EF, EFT, EG = load_obj(MH + '/eyes/high-poly/high-poly.obj')
eim = np.asarray(Image.open(MH + '/eyes/materials/brown_eye.png').convert('RGBA')); EH, EW = eim.shape[:2]
pairs = {}; evi = []; euv = []; e_op = []; e_cl = []
for f, tt in zip(EF, EFT):
    ids = []
    for a, b in zip(f, tt):
        k = (a, b)
        if k not in pairs: pairs[k] = len(evi); evi.append(a); euv.append(EVT[b])
        ids.append(pairs[k])
    c = EVT[tt].mean(0); al = eim[int((1 - c[1]) * (EH - 1)), int(c[0] * (EW - 1)), 3]
    tr = [ids[:3]] + ([[ids[0], ids[2], ids[3]]] if len(ids) == 4 else [])
    (e_op if al > 128 else e_cl).extend(tr)
evi = np.array(evi)
def iris_variant(kind):
    """recolour the MH eye texture: natural, darker irises with a limbal ring and a slightly dull, warm sclera
    (a bright white sclera and pale iris read as a stare)"""
    im = eim[..., :3].astype(float) / 255
    H, W = im.shape[:2]; yy, xx = np.mgrid[0:H, 0:W]
    r = np.full((H, W), 9.0)
    for cx, cy in ((720, 304), (296, 724)):
        r = np.minimum(r, np.hypot(xx - cx * W / 1024, yy - cy * H / 1024) / (118 * W / 1024))
    lum = im.mean(2, keepdims=True); det = np.clip(lum / (np.median(lum[r < .8]) + 1e-6), .4, 1.8)
    base = dict(brown=(.24, .14, .07), blue=(.26, .34, .40), grey=(.30, .33, .31), cloudy=(.50, .50, .48))[kind]
    hz = dict(brown=(.36, .25, .10), blue=(.30, .33, .28), grey=(.36, .34, .24), cloudy=(.55, .54, .5))[kind]
    rr = r[..., None]
    col = np.array(base) * det + np.array(hz) * np.exp(-((rr - .38) / .1) ** 2) * .5 * det
    col *= 1 - .55 * np.clip((rr - .78) / .2, 0, 1)                        # limbal ring
    pupil = rr < .3; col = np.where(pupil, im * .25, col)
    sclera = np.clip(im * np.array([.97, .93, .88]) * 1.06, 0, 1); sclera = sclera * .9 + sclera.mean(2, keepdims=True) * .1
    t = np.clip((rr - .98) / .06, 0, 1)
    out = col * (1 - t) + sclera * t
    if kind == 'cloudy': out = out * .8 + .14
    return Image.fromarray((np.clip(out, 0, 1) * 255).astype(np.uint8)).resize((512, 512), Image.LANCZOS)

def eye_ao(v, ev):
    """soft occlusion of the eyeball by the lids: darken eye vertices close to the surrounding skin"""
    from mhbuild import sub, mh_mask
    from scipy.spatial import cKDTree
    vs = sub(v); m = mh_mask(('orbicularis', 'eye', 'levator', 'head'))
    c = ev.mean(0); near = vs[(np.linalg.norm(vs - c, axis=1) < .06) & (m > .3)]
    d, _ = cKDTree(near).query(ev)
    t = np.clip((d - .0002) / .0048, 0, 1); t = t * t * (3 - 2 * t)
    up = np.clip((ev[:, 1] - c[1]) / .012, 0, 1)            # the upper lid casts a little more shadow
    return np.clip(.3 + .7 * t - .12 * up * (1 - t), .22, 1)

# relaxed lids for everyone: the base mesh's eyes are opened wide, which reads as a stare
EYE_RELAX = {('eyes/lr', '{s}-eye-eyefold-down|{s}-eye-eyefold-up'): .45, ('eyes/lr', '{s}-eye-bag-height-incr|{s}-eye-bag-height-decr'): .7,
             ('eyes/lr', '{s}-eye-corner1-down|{s}-eye-corner1-up'): .25}
# common corrections towards an ordinary adult male face (from photo reference): leaner cheeks, defined cheekbones and
# jaw, thinner, level lips instead of a heavy down-turned pout, slightly narrower face, a touch larger eyes
FACE_BASE = {('mouth', 'mouth-lowerlip-volume-incr|mouth-lowerlip-volume-decr'): -.25, ('mouth', 'mouth-upperlip-volume-incr|mouth-upperlip-volume-decr'): -.15,
             ('mouth', 'mouth-angles-up|mouth-angles-down'): .2, ('cheek/lr', '{s}-cheek-volume-incr|{s}-cheek-volume-decr'): -.3,
             ('cheek/lr', '{s}-cheek-bones-incr|{s}-cheek-bones-decr'): .2, ('chin', 'chin-prominent-incr|chin-prominent-decr'): .2,
             ('chin', 'chin-bones-incr|chin-bones-decr'): .2, ('head', 'head-scale-horiz-incr|head-scale-horiz-decr'): -.12,
             ('eyes/lr', '{s}-eye-scale-incr|{s}-eye-scale-decr'): .38, ('mouth', 'mouth-scale-horiz-incr|mouth-scale-horiz-decr'): .2,
             ('mouth', 'mouth-scale-vert-incr|mouth-scale-vert-decr'): .12, ('neck', 'neck-double-incr|neck-double-decr'): -.3}
for _n, _p in CHARS.items():
    if _p.get('skin') == 'alive':   # keep the living soldiers' features in a believable, regular range
        _p['mods'] = {k: v * .55 for k, v in _p.get('mods', {}).items()}
        _p['age'] = min(_p['age'], .66)
        for _k, _v in FACE_BASE.items(): _p['mods'][_k] = _p['mods'].get(_k, 0) + _v
    for _k, _v in EYE_RELAX.items(): _p.setdefault('mods', {}).setdefault(_k, _v)
