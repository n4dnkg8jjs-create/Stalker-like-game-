import numpy as np, sys, json, time
from mhbuild import *
from skintex import paint
from hairgen import *
from PIL import Image
SP='/tmp/claude-0/-home-claude/4bb1cc2a-aa1f-57c7-a2bd-6d60fbeb348f/scratchpad'
t=time.time()
P=dict(age=.55,muscle=.78,weight=.5,height=.52)
v=shape(P)
HAIR=(.17,.12,.09)
import os
if not os.path.exists(SP+'/skinA.jpg') or 'paint' in sys.argv: paint(v,'alive',hair=HAIR,N=2048).save(SP+'/skinA.jpg',quality=90); print('paint %.1f'%(time.time()-t))
np.savez(SP+'/charA.npz',v=sub(v)[VIDX],f=TRIS,uv=UV,tex=SP+'/skinA.jpg')
ef,ev=fit_proxy(v*10, MH+'/eyes/high-poly/high-poly.mhclo'); ev=ev*.1
EV,EVT,EF,EFT,EG=load_obj(ef)
im=np.asarray(Image.open(MH+'/eyes/materials/brown_eye.png').convert('RGBA'));H,W=im.shape[:2]
op,tr_op,tr_cl={},[],[]
vi=[];uv=[]
for f,tt in zip(EF,EFT):
    ids=[]
    for a,b in zip(f,tt):
        k=(a,b)
        if k not in op: op[k]=len(vi);vi.append(a);uv.append(EVT[b])
        ids.append(op[k])
    c=EVT[tt].mean(0);al=im[int((1-c[1])*(H-1)),int(c[0]*(W-1)),3]
    tt2=[ids[:3]]+([[ids[0],ids[2],ids[3]]] if len(ids)==4 else [])
    (tr_op if al>128 else tr_cl).extend(tt2)
Image.fromarray(im[...,:3]).save(SP+'/eye.jpg',quality=92)
np.savez(SP+'/eyesA.npz',v=ev[vi],f=np.array(tr_op),uv=np.array(uv),tex=SP+'/eye.jpg')
np.savez(SP+'/corneaA.npz',v=ev[vi],f=np.array(tr_cl),opacity=.12)
strand_texture(SP+'/hairtex.png');strand_texture(SP+'/lashtex.png',W=128,H=64,n=160,lash=True)
fuzz_texture(SP+'/fuzz.png')
from skintex import landmarks
from paint import ss as SS
Lm=landmarks(v);M=Lm['M']
def scalp(Pc):
    q=Pc-M;x,y,z=q[:,0],q[:,1],q[:,2];ax=np.abs(x)
    edge=.064-.006*np.cos(np.clip(ax/.05,0,1)*np.pi)
    f=SS(edge-.004,edge+.008,y+np.maximum(0,-z)*.3);sd=SS(.004,.028,y+np.maximum(0,-z-.01)*.55)*SS(.04,0,z);bk=SS(-.07,-.05,y)*SS(-.03,-.06,z)
    return np.maximum(np.maximum(f,sd),bk)*(y>-.085)
for k,(p,tr,uv,nn) in enumerate(shells(v,scalp)):
    np.savez(SP+f'/shell{k}.npz',v=p,f=tr,uv=uv,n=nn,tex=SP+'/fuzz.png',alpha=.18+k*.13,col=HAIR)
for name,(Pp,N,U,T),col,tex in (('browA',brows(v),tuple(np.array(HAIR)*1.25),'hairtex'),('lashA',lashes(v),(.06,.05,.05),'lashtex')):
    np.savez(SP+f'/{name}.npz',v=Pp,f=T,uv=U,n=N,tex=SP+f'/{tex}.png',alpha=.35,col=col);print(name,len(Pp))
print('done %.1f'%(time.time()-t))
