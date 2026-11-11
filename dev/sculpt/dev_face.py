"""quick face iteration: paint skin for one character and render studio views of the head"""
import numpy as np, sys, time, subprocess
from mhbuild import *
from skintex import paint, landmarks
from hairgen import *
from PIL import Image
sys.path.insert(0, '.')
import chardefs as EC
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
name = sys.argv[1] if len(sys.argv) > 1 else 'player'; N = int(sys.argv[2]) if len(sys.argv) > 2 else 1024
P = EC.CHARS[name]; t = time.time()
v = shape(P); vs = sub(v)
al, de = paint(v, P['skin'], hair=P['hc'], N=N, style=P['hair'], age=P['age']); al.save(SP + '/dev_skin.jpg', quality=92); de.save(SP + '/dev_det.jpg', quality=92); print('paint %.1f' % (time.time() - t))
np.savez(SP + '/dev_body.npz', v=vs[VIDX], f=TRIS, uv=UV, tex=SP + '/dev_skin.jpg', det=SP + '/dev_det.jpg', sss=1)
ef, ev = fit_proxy(v * 10, MH + '/eyes/high-poly/high-poly.mhclo'); ev = ev * .1
d = np.load(SP + '/eyesA.npz'); EV, EVT, EF, EFT, EG = load_obj(MH + '/eyes/high-poly/high-poly.obj')
from chardefs import evi, e_op, e_cl
EC.iris_variant(P['iris']).save(SP + '/eye_%s.jpg' % P['iris'], quality=92)
np.savez(SP + '/dev_eye.npz', v=ev[evi], f=np.array(e_op), uv=np.array(EC.euv), tex=SP + '/eye_%s.jpg' % P['iris'], vc=EC.eye_ao(v, ev[evi]))
np.savez(SP + '/dev_cornea.npz', v=ev[evi], f=np.array(e_cl), opacity=.1)
meshes = [SP + '/dev_body.npz', SP + '/dev_eye.npz', SP + '/dev_cornea.npz']
for nm, r, col, tex in (('brow', brows(v, seed=3, hc=P['hc']), tuple(np.array(P['hc']) * 1.35), 'strand'), ('lash', lashes(v), (.05, .04, .04), 'lash')):
    p_, n_, u_, t_ = r; np.savez(SP + f'/dev_{nm}.npz', v=p_, f=t_, uv=u_, n=n_, tex=SP + f'/{tex}.png', alpha=.35, col=col); meshes.append(SP + f'/dev_{nm}.npz')
if P['hair'] != 'buzz':
    p_, n_, u_, t_ = hair(v, P['hair'], seed=7); np.savez(SP + '/dev_hair.npz', v=p_, f=t_, uv=u_, n=n_, tex=SP + '/strand.png', alpha=.35, col=P['hc']); meshes.append(SP + '/dev_hair.npz')
M = landmarks(v)['M']; cx, cy, cz = M
cams = ';'.join([f'{cx},{cy},{cz+.42},{cx},{cy-.02},{cz-.03},26', f'{cx+.3},{cy+.02},{cz+.3},{cx},{cy-.02},{cz-.04},26', f'{cx+.42},{cy},{cz-.04},{cx},{cy-.02},{cz-.04},26', f'{cx},{cy+.01},{cz+.16},{cx+.03},{cy},{cz},22'])
subprocess.run(['python3', 'render.py', SP + f'/shots/dev_{name}.png', '520', '620', cams] + meshes)
print('done %.1f' % (time.time() - t))
