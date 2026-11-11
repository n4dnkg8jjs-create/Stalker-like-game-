"""Head + neck sculpt. Coordinates relative to the skull centre S; face looks down +z."""
import numpy as np
from sdf import *
from skeleton import BONES, BIDX

HEAD_BONE = BONES[BIDX['head']]['frame'].o
S0 = HEAD_BONE + np.array([0, .078, 0])
ES = .0315                      # half inter-pupil distance
EYE_Y, EYE_Z, EYE_R = .0, .0785, .0118

DEFAULT = dict(jaw=1.0, chin=1.0, chinZ=0.0, brow=1.0, cheek=1.0, cheekbone=1.0, nose=1.0, noseW=1.0, noseTip=1.0, noseBump=0.0, noseCrook=0.0,
               lips=1.0, lipFull=1.0, gaunt=0.0, age=0.0, ears=1.0, earOut=0.0, decay=0.0, faceLen=1.0, skull=1.0, lidOpen=1.0)

def eye_centres(p=None):
    return [np.array([s * ES, EYE_Y, EYE_Z]) for s in (-1, 1)]

def head_sdf(p=None):
    q = dict(DEFAULT); q.update(p or {}); p = q
    E = ellipsoid; Cp = capsule
    jw, fl = p['jaw'], p['faceLen']
    base = E((0, .02, -.014), (.073 * p['skull'], .09, .097))
    it = [
        (E((0, .03, .036), (.062, .055, .058)), .02),                                     # forehead
        (E((0, -.038 * fl, .024), (.052, .046 * fl, .062)), .02),                         # maxilla / mid face
        (E((0, -.084 * fl, .026), (.046 * jw, .026, .05)), .016),                         # mandible body
        (E((0, -.106 * fl, .066 + p['chinZ']), (.023 * p['chin'], .017, .015)), .012),     # chin
        (E((0, .021, .08), (.05, .008 * p['brow'], .014)), .016),                        # brow ridge
        (E((0, -.066 * fl, .072), (.03, .024, .026)), .016),                              # muzzle
    ]
    for s in (-1, 1):
        it += [
            (E((s * .03, .019, .083), (.02, .007 * p['brow'], .011)), .008),
            (E((s * .043 * p['cheekbone'], -.016, .05), (.022, .013, .03), R=rot(0, s * .55, 0)), .02),
            (Cp((s * .057 * jw, -.022, -.014), (s * .05 * jw, -.08 * fl, -.004), .014, .015), .016),
            (Cp((s * .05 * jw, -.08 * fl, -.004), (s * .021, -.11 * fl, .058), .013, .012), .012),
            (E((s * .036, -.054 * fl, .054), (.017 * p['cheek'], .022, .02)), .022),
        ]
    # ---- subtractive forms ----
    for s in (-1, 1):
        it += [('-', E((s * .072, .02, .03), (.008, .026, .026)), .02 + .01 * p['gaunt']),
               ('-', E((s * ES, .003, .088), (.0195, .0158, .0152)), .01)]
        if p['gaunt'] > 0:
            it.append(('-', E((s * .046, -.06 * fl, .068), (.016, .02, .014)), .02 * p['gaunt'] + .004))
    # ---- eyeballs (filled so lids sit on them) + lids ----
    lids = []
    op = p['lidOpen']
    for s in (-1, 1):
        Ec = np.array([s * ES, EYE_Y, EYE_Z])
        it.append((sphere(Ec, EYE_R - .0006), .002))
        def up_lid(P, Ec=Ec, s=s):
            q = P - Ec; d = np.abs(np.sqrt((q * q).sum(1)) - .0123) - .00095
            d = smax(d, -(q[:, 1] - s * q[:, 0] * .1 - (.0046 * op - .009 * (1 - op))), .0008)
            return smax(d, -(q[:, 2] + .007), .001)
        def lo_lid(P, Ec=Ec, s=s):
            q = P - Ec; d = np.abs(np.sqrt((q * q).sum(1)) - .0121) - .0009
            d = smax(d, (q[:, 1] - s * q[:, 0] * .06 + .0062), .0008)
            return smax(d, -(q[:, 2] + .004), .001)
        it += [(up_lid, .0022), (lo_lid, .002)]
        # lid crease and tear trough
        it.append(('-', Cp((s * (ES - .012), .0098, .0905), (s * (ES + .012), .0105, .088), .0011), .002))
        it.append(('-', Cp((s * (ES - .009), -.0165, .0905), (s * (ES + .011), -.019, .085), .0014), .006 + .004 * p['age']))
    # ---- nose ----
    nl, nw, nt = p['nose'], p['noseW'], p['noseTip']
    cz = p['noseCrook']
    it += [
        (Cp((0, .002, .0812), (cz * .5, -.012 * nl, .0915), .0058 * nw, .0062 * nw), .008),
        (Cp((cz * .5, -.012 * nl, .0915), (cz, -.032 * nl, .1065 + .002 * (nl - 1)), .0062 * nw, .0074 * nw), .006),
        (sphere((cz * 1.2, -.0385 * nl, .1065 + .002 * (nl - 1)), .0098 * nt), .005),
    ]
    if p['noseBump'] > 0: it.append((sphere((0, -.016, .0975), .004 + .002 * p['noseBump']), .004))
    for s in (-1, 1):
        it += [(E((s * .0118 * nw, -.0438 * nl, .0958), (.0074, .0068, .0088)), .008),
               ('-', E((s * .0062 * nw, -.0492 * nl, .0975), (.0032, .0016, .0042)), .003),
               ('-', Cp((s * .0195 * nw, -.042 * nl, .0955), (s * (.031 + .004 * p['age']), -.077 * fl, .084), .0014 + .001 * p['age']), .008)]
    # ---- mouth ----
    lw, lf = p['lips'], p['lipFull']
    mz = .0905
    it += [
        (E((0, -.0654 * fl, mz - .003), (.0205 * lw, .0046 * lf, .0062)), .006),
        (E((0, -.0656 * fl, mz - .005), (.025 * lw, .0034 * lf, .0054)), .006),
        (E((0, -.0772 * fl, mz - .0042), (.0185 * lw, .0054 * lf, .0068)), .006),
        (E((0, -.0768 * fl, mz - .006), (.023 * lw, .004 * lf, .0056)), .006),
        ('-', E((0, -.0717 * fl, mz + .006), (.0232 * lw, .001 + .0025 * p['decay'], .009)), .0014),
        ('-', Cp((0, -.0525 * nl, .0975), (0, -.0605 * fl, .0965), .0016), .004),
        ('-', Cp((-.012, -.0875 * fl, .0875), (.012, -.0875 * fl, .0875), .0024), .007),
    ]
    for s in (-1, 1):
        it += [('-', sphere((s * .0236 * lw, -.072 * fl, .0838), .0016), .004)]
    # ---- ears ----
    for s in (-1, 1):
        ef = Frame((s * .0735, -.004, -.009), rot(0, s * (.22 + p['earOut']), s * -.06))
        sc = p['ears']
        pts = [(s * .009, .026 * np.cos(t) * sc - .002, .0155 * np.sin(t) * sc - .001) for t in np.linspace(-.3, 4.4, 14)]
        anti = [(s * .0075, .016 * np.cos(t) * sc - .003, .009 * np.sin(t) * sc + .0) for t in np.linspace(.2, 3.3, 9)]
        ear = blend(E((s * .004, 0, 0), (.0055, .029 * sc, .0168 * sc), F=ef), [
            (chain(pts, [.0034] * 14, F=ef), .002),
            (chain(anti, [.0024] * 9, F=ef), .0015),
            (E((s * .005, -.025 * sc, .002), (.0042, .0085 * sc, .007 * sc), F=ef), .003),
            (E((s * .0045, -.004, .0135 * sc), (.003, .0052, .004), F=ef), .002),
            ('-', E((s * .0085, -.006, .002), (.0042, .0098 * sc, .0078 * sc), F=ef), .0018),
            ('-', E((s * .009, .012 * sc, -.002), (.0025, .006 * sc, .006 * sc), F=ef), .0012),
        ])
        it.append((ear, .004))
    # ---- neck in world-consistent coords (must match body.neck_parts) ----
    o = -S0
    it += [(Cp(o + (0, 1.49, -.014), o + (0, 1.615, -.016), .054, .051), .014),
           (E((0, -.065, -.032), (.047, .055, .048)), .02),
           (Cp(o + (-.056, 1.668, -.022), o + (-.013, 1.51, .042), .0125, .011), .012),
           (Cp(o + (.056, 1.668, -.022), o + (.013, 1.51, .042), .0125, .011), .012),
           (E(o + (0, 1.598, .041), (.009, .013, .009)), .008)]
    f = blend(base, it)
    if p['decay'] > 0:  # teeth, exposed by the retracted lips
        teeth = []
        for i in range(10):
            a = (i - 4.5) / 4.5 * .9; x = np.sin(a) * .021; z = mz - .006 - (1 - np.cos(a)) * .016
            teeth.append(rbox((x, -.0712 * fl, z), (.0028, .0042, .0022), .0012, R=rot(0, a, 0)))
        tf = union(*teeth)
        g = f; f = lambda P: np.minimum(g(P), tf(P))
    return f, p

def head_world(p=None):
    f, p = head_sdf(p)
    return (lambda P: f(P - S0)), p
