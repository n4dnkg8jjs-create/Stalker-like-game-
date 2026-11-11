"""Build every character and write src/03y_chars.js (compact base64 data for the game)."""
import numpy as np, json, base64, io, sys, time
from mhbuild import *
from skintex import paint, landmarks
from hairgen import hair, brows, lashes, strand_texture, mustache
from PIL import Image
from chardefs import *
SP = '/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
OUT = '/home/claude/z12/src/03y_chars.js'
t0 = time.time()
def B(a): return base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
def img64(im, fmt='JPEG', q=86):
    b = io.BytesIO(); im.save(b, fmt, quality=q) if fmt == 'JPEG' else im.save(b, fmt, optimize=True)
    return f'data:image/{fmt.lower()};base64,' + base64.b64encode(b.getvalue()).decode()

# ---------- shared topology & skinning ----------
skI, skW = skin_weights()
skW8 = np.round(skW * 255).astype(np.uint8); skW8[:, 0] += (255 - skW8.sum(1)).astype(np.uint8)
skI_s = skI[VIDX]; skW_s = skW8[VIDX]
uv16 = np.round(np.clip(UV, 0, 1) * 65535).astype(np.uint16)
shared = dict(tris=B(TRIS.astype(np.uint16)), uv=B(uv16), vidx=B(VIDX.astype(np.uint16)), skI=B(skI_s), skW=B(skW_s), nv=int(len(VIDX)), nvs=int(NVS))

# ---------- garment regions (decided once on the reference body) ----------
vref = shape(CHARS['player']); vs = sub(vref)
head_r, W = rig(vref)
acc = np.zeros((len(V0), len(GAME_BONES)))
for b, lst in SK['weights'].items():
    gi = BI[mapped(b)]
    for vi, w in lst: acc[vi, gi] += w
acc = S @ acc; dom = np.array(GAME_BONES)[acc.argmax(1)]
def has(prefixes): return np.array([d.startswith(prefixes) for d in dom])
y = vs[:, 1]
neck_base = head_r['neck'][1]; waist = head_r['spine'][1] - .02; crotch = head_r['hips'][1] - .08
def past_wrist(side):
    e, w_ = head_r['el' + side], head_r['wr' + side]; d = (w_ - e) / np.linalg.norm(w_ - e)
    return ((vs - w_) @ d) > -.012
def along_forearm(side, frac):
    e, w_ = head_r['el' + side], head_r['wr' + side]; d = w_ - e; L = np.linalg.norm(d); d /= L
    return ((vs - e) @ d) / L
hand = np.zeros(len(vs), bool); forearm_lo = np.zeros(len(vs), bool)
for s in ('L', 'R'):
    side_m = (vs[:, 0] < 0) if s == 'L' else (vs[:, 0] > 0)
    hand |= side_m & has(('wr', 'idx', 'mid', 'rng', 'pnk', 'th', 'el')) & past_wrist(s)
    forearm_lo |= side_m & has(('el', 'wr')) & (along_forearm(s, 0) > .35) & ~past_wrist(s)
headneck = has(('head',)) | (has(('neck',)) & (y > neck_base + .03))
torso_arm = ~headneck & ~hand & (y > waist - .16) & ~has(('hp', 'kn', 'an'))
legs = ~headneck & (y < waist + .03) & ~torso_arm | (has(('hp', 'kn', 'an')))
legs &= ~hand
boot = legs & (y < .27); valenki = legs & (y < .42)
flagsV = {'jacket': torso_arm, 'trousers': legs & ~boot, 'boots': boot, 'gloves': hand,
          'shirt': torso_arm & ~forearm_lo, 'telo': torso_arm | (legs & (y > crotch - .06) & ~has(('kn', 'an'))) , 'valenki': valenki, 'ctrousers': legs & ~valenki}
BIT = {'jacket': 1, 'trousers': 2, 'boots': 4, 'gloves': 8, 'shirt': 16, 'telo': 32, 'valenki': 64, 'ctrousers': 128}
tf = np.zeros(len(TRIS), np.uint8)
for k, m in flagsV.items():
    tf |= (m[TRIS_ORIG].any(1) * BIT[k]).astype(np.uint8)   # any(): neighbouring garments overlap by one ring, no skin seam
shared['flags'] = B(tf)
# per-vertex garment thickness profile (looser at the waist/knees for realism)
loose = np.clip(1 + .4 * np.exp(-((y - waist) / .06) ** 2) + .3 * np.exp(-((y - .5) / .05) ** 2), 1, 1.5)
shared['loose'] = B(np.round(loose[VIDX] * 100).astype(np.uint8))

# ---------- shared small meshes ----------
shared['eye'] = dict(op=B(np.array(e_op, np.uint16)), cl=B(np.array(e_cl, np.uint16)), uv=B(np.round(np.array(euv) * 65535).astype(np.uint16)), n=len(evi))
teeth = {}
for gname in ('helper-upper-teeth', 'helper-lower-teeth', 'helper-tongue'):
    vid, _, tri = group_topology(gname); teeth[gname] = (vid, tri)
shared['teeth'] = {k.split('-')[1]: dict(t=B(tri.astype(np.uint16)), n=len(vid)) for k, (vid, tri) in teeth.items()}

# ---------- textures ----------
tex = dict(eye={k: img64(iris_variant(k), q=88) for k in ('brown', 'blue', 'grey', 'cloudy')})
strand_texture(SP + '/strand.png'); strand_texture(SP + '/lash.png', W=128, H=64, n=160, lash=True)
tex['strand'] = img64(Image.open(SP + '/strand.png'), 'PNG'); tex['lash'] = img64(Image.open(SP + '/lash.png'), 'PNG')
print('textures (eyes, strands) %.0fs' % (time.time() - t0))
import os
if os.path.exists(SP + '/cache_alive.png') and 'repaint' not in sys.argv: al, de = Image.open(SP + '/cache_alive.png'), Image.open(SP + '/cache_aliveD.png')
else:
    al, de = paint(vref, 'alive', hair=CHARS['player']['hc'], N=2048, style='buzz', age=.55); al.save(SP + '/cache_alive.png'); de.save(SP + '/cache_aliveD.png')
tex['skin'] = img64(al, q=86); tex['skinD'] = img64(de, q=88)
print('alive skin %.0fs' % (time.time() - t0))
if os.path.exists(SP + '/cache_decay.png') and 'repaint' not in sys.argv: al, de = Image.open(SP + '/cache_decay.png'), Image.open(SP + '/cache_decayD.png')
else:
    al, de = paint(shape(CHARS['oldman']), 'decay', hair=(.3, .28, .26), N=2048, seed=4, style='grey', age=.9); al.save(SP + '/cache_decay.png'); de.save(SP + '/cache_decayD.png')
tex['decay'] = img64(al, q=86); tex['decayD'] = img64(de, q=88)
print('decay skin %.0fs' % (time.time() - t0))

# ---------- characters ----------
Q = 16000.
def q16(p): return B(np.round(np.clip(p, -2.04, 2.04) * Q).astype(np.int16))
chars = {}
COVERS = {}
GP5_ON = ("patrol", "driver", "oldman")
for name, P in CHARS.items():
    v = shape(P); vs = sub(v)
    bones, hd, Wf = rig_json(v)
    ef, ev = fit_proxy(v * 10, MH + '/eyes/high-poly/high-poly.mhclo'); ev = ev * .1
    Lm = landmarks(v)
    c = dict(pos=q16(vs[VIDX]), bones=bones, iris=P['iris'], skin=P['skin'], hc=P['hc'],
             eyes=q16(ev[evi]), eyeAO=B(np.round(eye_ao(v, ev[evi]) * 255).astype(np.uint8)), tint=P.get('tint', [1, 1, 1]), teeth={k.split('-')[1]: q16(v[vid]) for k, (vid, tri) in teeth.items()})
    # brows, lashes, hair as strand ribbons (rigid to the head bone)
    def rib(r):
        p, n, uv_, t = r
        return dict(p=q16(p), n=B(np.round(n * 127).astype(np.int8)), uv=B(np.round(np.clip(uv_, 0, 4) / 4 * 65535).astype(np.uint16)), t=B(t.astype(np.uint16)), nv=len(p))
    c['brows'] = rib(brows(v, seed=hash(name) % 1000))
    LP = lashes(v); c['lashes'] = rib(LP)
    # ---- face morphs (sparse, in split-vertex space): eyelids from rotating the lid skin about the eyeball,
    #      expressions from MakeHuman's own targets ----
    import facegen as FG
    Mv = Lm['M']; D = FG.blink_squint(vs, ev, Mv)
    Fw_ = VIDX[TRIS]
    for k_ in D: D[k_] = np.stack([FG.smooth_on_mesh(D[k_][:, j], Fw_, len(vs), 3) for j in range(3)], 1)
    for k_ in ('smile', 'browUp', 'frown'): D[k_] = FG.expr_delta(k_)
    def sparse(Dv):
        Dv = Dv[VIDX]; idx = np.where(np.abs(Dv).max(1) > 2e-5)[0]
        return dict(i=B(idx.astype(np.uint16)), d=B(np.round(Dv[idx] * 40000).astype(np.int16)))
    c['morph'] = {k_: sparse(D[k_]) for k_ in ('blink', 'squint', 'smile', 'browUp', 'frown')}
    c['lashMorph'] = {k_: B(np.round(FG.lash_delta(LP[0], vs, ev, Mv, *fr) * 40000).astype(np.int16)) for k_, fr in (('blink', (.9, .14)), ('squint', (.28, .42)))}
    if P['hair'] != 'buzz': c['hair'] = rib(hair(v, P['hair'], seed=7))
    if P.get('mustache'): c['must'] = rib(mustache(v, seed=3))
    if P.get('tsh'):
        import tsh2
        e0 = np.zeros(len(V0))
        for sd_ in 'lr':
            i_, d_ = target(f'ears/{sd_}-ear-wing-incr.target'); e0[i_] = 1
        earm = (S @ e0) > .5; ec_ = vs[earm & (vs[:, 0] > Lm['M'][0])].mean(0)
        parts, tfit = tsh2.build(vs, Lm['M'], ec_)
        Vc, Fo, Fi, Fr, UVc = parts['cloth']; I32 = lambda f: B(f.astype(np.uint32))
        c['tsh'] = dict(p=q16(Vc), fo=I32(Fo), fi=I32(Fi), fr=I32(Fr), uv=B(np.round(np.clip(UVc, 0, 1) * 65535).astype(np.uint16)),
                        tex=img64(Image.fromarray(parts['tex']), q=90), pipe=dict(p=q16(parts['pipe'][0]), t=I32(parts['pipe'][1])),
                        leather=dict(p=q16(parts['leather'][0]), t=I32(parts['leather'][1])))
        c['tshFit'] = tfit
    # fit data for helmet / vest
    hv = vs[has(('head',))]
    chest_y = hd['spine'][1] + .27
    band = vs[(np.abs(vs[:, 1] - chest_y) < .02) & torso_arm & (np.abs(vs[:, 0]) < .12)]
    c['fit'] = dict(headTop=float(hv[:, 1].max()), headHalfW=float(np.percentile(np.abs(hv[:, 0]), 99)), eye=Lm['M'].tolist(),
                    chestY=float(chest_y), chestF=float(band[:, 2].max()), chestB=float(band[:, 2].min()), waist=float(waist),
                    headBone=hd['head'].tolist(), spineBone=hd['spine'].tolist(), skullZ=float((hv[:, 2].max() + hv[:, 2].min()) / 2))
    # skin thickness (for light through ears, nostrils, fingers): march inward from each vertex; the distance to the
    # nearest surface rises to the medial axis then falls - twice that peak is the local thickness
    from scipy.spatial import cKDTree as _KD
    # march inward along -normal until the point is outside the skin again (nearest dense surface sample's normal says
    # which side we are on); the distance travelled is the thickness
    TO = TRIS_ORIG; NS_ = vert_normals(vs, TO); A_, B_, C_ = vs[TO[:, 0]], vs[TO[:, 1]], vs[TO[:, 2]]
    FN = np.cross(B_ - A_, C_ - A_); FN /= np.maximum(np.linalg.norm(FN, axis=1, keepdims=True), 1e-12)
    rng_ = np.random.default_rng(1); SP_, SN_ = [vs[np.unique(TO)]], [NS_[np.unique(TO)]]
    for _ in range(4):
        r = rng_.random((len(TO), 2)); m = r.sum(1) > 1; r[m] = 1 - r[m]; SP_.append(A_ + (B_ - A_) * r[:, :1] + (C_ - A_) * r[:, 1:]); SN_.append(FN)
    SP_ = np.concatenate(SP_); SN_ = np.concatenate(SN_); kdS = _KD(SP_)
    thick = np.full(len(vs), .0635); inside = np.ones(len(vs), bool)
    for t_ in np.arange(.0015, .064, .0015):
        q = vs - NS_ * t_; _, k_ = kdS.query(q); out = ((q - SP_[k_]) * SN_[k_]).sum(1) > 0
        if t_ <= .002: continue
        hit = inside & out; thick[hit] = t_; inside &= ~out
    # the eye sockets are empty in the skin mesh (the eyeballs are separate), so lids and the skin round the eyes would read
    # as paper-thin: treat everything within 2.6 cm of an eye centre as solid; same for the lips (open mouth cavity)
    for e_ in (Lm['eL'], Lm['eR']): thick[np.linalg.norm(vs - e_, axis=1) < .026] = .04
    thick[np.linalg.norm(vs - Lm['mouth'], axis=1) < .028] = .04
    thick = np.clip(thick, 0, .0635)
    c['thick'] = B(np.round(thick[VIDX] * 4000).astype(np.uint8))
    if name in ('guard2', 'guard3'):
        import ratnik as RK
        used_ = np.unique(VIDX[TRIS]); Bc = RK.balaclava(vs, used_, Lm['M'], hd['neck'][1], seed=len(name))
        cov = Bc['covered'][VIDX]; c['balaHide'] = B(np.packbits(cov[TRIS].all(1)))
        c['bala'] = dict(v=q16(Bc['v']), t=B(Bc['f'].astype(np.uint16 if len(Bc['v']) < 65536 else np.uint32)), w32=int(len(Bc['v']) >= 65536),
                         ao=B(np.round(np.clip(Bc['ao'], 0, 1) * 255).astype(np.uint8)), wkn=B(np.round(Bc['wkn'] * 255).astype(np.uint8)))
        COVERS[name] = (vs, Bc)
    if name in ("guard4", "guard5"):
        import ratnik as RK
        used_ = np.unique(VIDX[TRIS]); Gm = RK.gasmask2(vs, used_, Lm['M'], hd['neck'][1], Lm['mouth'], seed=len(name))
        cov = Gm['covered'][VIDX]; c['balaHide'] = B(np.packbits(cov[TRIS].all(1)))
        c['mask'] = dict(v=q16(Gm['v']), t=B(Gm['f'].astype(np.uint16 if len(Gm['v']) < 65536 else np.uint32)), w32=int(len(Gm['v']) >= 65536),
                         ao=B(np.round(np.clip(Gm['ao'], 0, 1) * 255).astype(np.uint8)), mid=B(Gm['mid'].astype(np.uint8)),
                         anc={k_: [[float(x) for x in a_[0]], [float(x) for x in a_[1]]] for k_, a_ in Gm['anchors'].items()})
        COVERS[name] = (vs, Gm)
    if name in GP5_ON:
        import ratnik as RK
        used_ = np.unique(VIDX[TRIS]); Hd = RK.gp5(vs, used_, Lm['M'], hd['neck'][1], Lm['mouth'], Lm['eL'], Lm['eR'], seed=len(name) + 3)
        cov = Hd['covered'][VIDX]; c['hoodHide'] = B(np.packbits(cov[TRIS].all(1)))
        c['hood'] = dict(v=q16(Hd['v']), t=B(Hd['f'].astype(np.uint16 if len(Hd['v']) < 65536 else np.uint32)), w32=int(len(Hd['v']) >= 65536),
                         ao=B(np.round(np.clip(Hd['ao'], 0, 1) * 255).astype(np.uint8)), wkn=B(np.round(Hd['wkn'] * 255).astype(np.uint8)),
                         anc={k_: [[float(x) for x in a_[0]], [float(x) for x in a_[1]]] for k_, a_ in Hd['anchors'].items()})
    chars[name] = c
    print(name, 'done %.0fs' % (time.time() - t0))

# ---------- wardrobe and gear ----------
from wear_export import build_all
from clothes import top4
from paint import ss as _ss
shared_w, per_w, gear, hide = build_all(CHARS)
def W4(Wm):
    idx, w = top4(Wm); w8 = np.round(w * 255).astype(np.int32); w8[:, 0] += 255 - w8.sum(1)
    return B(idx.astype(np.uint8)), B(np.clip(w8, 0, 255).astype(np.uint8))
def U16(a): return B(np.round(np.clip(a, 0, 1) * 65535).astype(np.uint16))
outfits = {}
for o, pcs in shared_w.items():
    lst = []
    for p in pcs:
        nu = len(p['W']); ns = len(p['vidx']); assert ns < 65536
        I, Wt = W4(p['W'])
        lst.append(dict(name=p['name'], mat=p['mat'], nu=nu, ns=ns, t=B(p['tris'].astype(np.uint16)), vidx=B(p['vidx'].astype(np.uint16)), uv=U16(p['uv']), skI=I, skW=Wt,
                        ao=B(np.round(np.clip(p['ao'], 0, 1) * 255).astype(np.uint8))))
    outfits[o] = dict(pieces=lst, hide=B(hide[o].astype(np.uint8)))
gsh = {}
for k, gg in gear.items():
    d = dict(nu=len(gg['v']), v=q16(gg['v']), t=B(gg['f'].astype(np.uint16)), mid=B(gg['mid'].astype(np.uint8)), ao=B(np.round(np.clip(gg['ao'], 0, 1) * 255).astype(np.uint8)))
    if k in ('boot', 'valenki'): d['wkn'] = B(np.round(_ss(.085, .17, gg['v'][:, 1]) * 255).astype(np.uint8))
    if k == 'helmet': d['hz'] = B(np.asarray(gg['hz']).astype(np.uint8))
    gsh[k] = d
for name in CHARS:
    pw = per_w[name]
    chars[name]['outfit'] = pw['outfit']; chars[name]['wear'] = {k: q16(X) for k, X in pw['pos'].items()}
    g = pw['gear']; chars[name]['gear'] = dict(aff=g['aff'], boot=g['bootKind'], flag=[float(x) for x in g['flag']], groinPivot=g['groinPivot'])
    # soldiers in a balaclava or a gas mask: the helmet's chin harness is rebuilt over it (the helmet's own is hidden)
    if name in COVERS:
        import ratnik as RK
        from sdf import normals as _nrm
        vs_, cvr = COVERS[name]; a_ = g['aff']['helmet']; o_r, o_c, sc = (np.asarray(x, float) for x in a_)
        fitA = lambda X: (o_c + (np.asarray(X, float) - o_r) * sc)
        A0 = gear['helmet']['anchors']; A = dict(J0=[fitA(x).tolist() for x in A0['J0']], a0=[fitA(x).tolist() for x in A0['a0']], cup=fitA(A0['cup']).tolist())
        nC = _nrm(cvr['v'], cvr['f']); cu = np.zeros(len(cvr['v']), bool); cu[np.unique(cvr['f'])] = True
        nsk = vert_normals(vs_, TRIS_ORIG); hcen = np.asarray(A['cup']) + [0, .09, -.04]
        sok = ~cvr['covered'] & (np.linalg.norm(vs_ - hcen, axis=1) < .2)
        acc_ = RK.Acc(); RK.chin_harness(acc_, A, np.concatenate([cvr['v'][cu], vs_[sok]]), np.concatenate([nC[cu], nsk[sok]])); Hh = acc_.out()
        chars[name]['harn'] = dict(v=q16(Hh['v']), t=B(Hh['f'].astype(np.uint16)), mid=B(Hh['mid'].astype(np.uint8)), ao=B(np.round(np.clip(Hh['ao'], 0, 1) * 255).astype(np.uint8)))
print('wear done %.0fs' % (time.time() - t0))
data = dict(shared=shared, tex=tex, chars=chars, Q=Q, bonesOrder=GAME_BONES, outfits=outfits, gear=gsh)
js = '/* Character data generated from the CC0 MakeHuman base mesh, targets, skeleton and eye assets (makehumancommunity.org). */\nconst CHARDATA=' + json.dumps(data, separators=(',', ':')) + ';\n'
open(OUT, 'w').write(js)
print('wrote', OUT, len(js) / 1e6, 'MB  %.0fs' % (time.time() - t0))
