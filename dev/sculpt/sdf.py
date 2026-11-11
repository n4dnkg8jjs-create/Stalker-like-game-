"""Signed-distance sculpting toolkit (numpy). Shapes are callables P(N,3)->d(N)."""
import numpy as np

def _len(v): return np.sqrt((v*v).sum(-1))

def rot(ax=0, ay=0, az=0):
    """rotation matrix R (columns = local axes in world), applied as world = R @ local (XYZ euler like three.js)"""
    cx,sx=np.cos(ax),np.sin(ax); cy,sy=np.cos(ay),np.sin(ay); cz,sz=np.cos(az),np.sin(az)
    Rx=np.array([[1,0,0],[0,cx,-sx],[0,sx,cx]]); Ry=np.array([[cy,0,sy],[0,1,0],[-sy,0,cy]]); Rz=np.array([[cz,-sz,0],[sz,cz,0],[0,0,1]])
    return Rx@Ry@Rz

class Frame:
    def __init__(self, origin=(0,0,0), R=None):
        self.o=np.asarray(origin,float); self.R=np.eye(3) if R is None else np.asarray(R,float)
    def child(self, offset=(0,0,0), R=None):
        o=self.o+self.R@np.asarray(offset,float); Rn=self.R if R is None else self.R@R
        return Frame(o,Rn)
    def local(self, P): return (P-self.o)@self.R           # world -> local
    def world(self, p): return self.o+self.R@np.asarray(p,float)
    def wdir(self, d): return self.R@np.asarray(d,float)

# ---------- primitives (defined in a frame's local coords) ----------
def ellipsoid(c, r, F=None, R=None):
    c=np.asarray(c,float); r=np.asarray(r,float); Rm=None if R is None else np.asarray(R,float)
    def f(P):
        q=F.local(P) if F else P
        q=q-c
        if Rm is not None: q=q@Rm
        k0=_len(q/r); k1=_len(q/(r*r))
        return k0*(k0-1)/np.maximum(k1,1e-9)
    f.bb=(F.world(c) if F else c, r.max()); return f

def sphere(c, r, F=None):
    c=np.asarray(c,float)
    def f(P):
        q=F.local(P) if F else P
        return _len(q-c)-r
    f.bb=(F.world(c) if F else c, r); return f

def capsule(a, b, r1, r2=None, F=None):
    """round cone from a (radius r1) to b (radius r2)"""
    a=np.asarray(a,float); b=np.asarray(b,float); r2=r1 if r2 is None else r2
    ba=b-a; l2=ba@ba
    def f(P):
        q=F.local(P) if F else P
        pa=q-a; h=np.clip((pa@ba)/l2,0,1)
        return _len(pa-np.outer(h,ba))-(r1+(r2-r1)*h)
    c=(a+b)/2; f.bb=(F.world(c) if F else c, np.sqrt(l2)/2+max(r1,r2)); return f

def rbox(c, h, rr, F=None, R=None):
    """rounded box centre c, half extents h (including rounding), corner radius rr"""
    c=np.asarray(c,float); h=np.asarray(h,float)-rr; Rm=None if R is None else np.asarray(R,float)
    def f(P):
        q=F.local(P) if F else P
        q=q-c
        if Rm is not None: q=q@Rm
        d=np.abs(q)-h
        return _len(np.maximum(d,0))+np.minimum(d.max(-1),0)-rr
    f.bb=(F.world(c) if F else c, _len(h)+rr); return f

def torus(c, R0, r, F=None, Rm=None):
    """torus around local y axis"""
    c=np.asarray(c,float)
    def f(P):
        q=F.local(P) if F else P
        q=q-c
        if Rm is not None: q=q@np.asarray(Rm,float)
        qx=np.sqrt(q[:,0]**2+q[:,2]**2)-R0
        return np.sqrt(qx*qx+q[:,1]**2)-r
    f.bb=(F.world(c) if F else c, R0+r); return f

def chain(points, radii, F=None):
    """smooth tube through points (list of capsules)"""
    parts=[capsule(points[i],points[i+1],radii[i],radii[i+1],F) for i in range(len(points)-1)]
    return union(*parts)

# ---------- operators ----------
def smin(a,b,k):
    if k<=0: return np.minimum(a,b)
    h=np.clip(.5+.5*(b-a)/k,0,1); return b+(a-b)*h-k*h*(1-h)
def smax(a,b,k): return -smin(-a,-b,k)

def union(*fs, k=0.0):
    def f(P):
        d=fs[0](P)
        for g in fs[1:]: d=smin(d,g(P),k)
        return d
    return f

def blend(base, items):
    """base shape smoothly unioned with list of (shape, k) or subtracted with ('-', shape, k)"""
    def f(P):
        d=base(P)
        for it in items:
            if it[0]=='-': d=smax(d,-it[1](P),it[2])
            elif it[0]=='&': d=smax(d,it[1](P),it[2])
            else: d=smin(d,it[0](P),it[1])
        return d
    return f

def offset(fn, o): return lambda P: fn(P)-o

def clip_plane(fn, n, p0, k=0.0):
    """keep the half-space where (P-p0).n <= 0"""
    n=np.asarray(n,float); n=n/np.linalg.norm(n); p0=np.asarray(p0,float)
    return lambda P: smax(fn(P),(P-p0)@n,k)

# ---------- evaluation ----------
def evaluate(fn, lo, hi, h, coarse=4, band=None, chunk=400000):
    """narrow-band evaluation: coarse pass then exact values only near the surface"""
    lo=np.asarray(lo,float); hi=np.asarray(hi,float)
    n=np.ceil((hi-lo)/h).astype(int)+1
    hc=h*coarse; nc=np.ceil((hi-lo)/hc).astype(int)+2
    gc=np.stack(np.meshgrid(*[lo[i]+np.arange(nc[i])*hc for i in range(3)],indexing='ij'),-1).reshape(-1,3)
    dc=np.concatenate([fn(gc[i:i+chunk]) for i in range(0,len(gc),chunk)]).reshape(nc)
    from scipy.ndimage import map_coordinates
    idx=[np.arange(n[i])*h/hc for i in range(3)]
    I=np.meshgrid(*idx,indexing='ij')
    up=map_coordinates(dc,[I[0],I[1],I[2]],order=1,mode='nearest')
    band=band or hc*1.8
    m=np.abs(up)<band
    pts=np.stack([lo[i]+I[i][m]*hc for i in range(3)],-1)
    vals=np.concatenate([fn(pts[i:i+chunk]) for i in range(0,len(pts),chunk)]) if len(pts) else np.zeros(0)
    up[m]=vals
    return up, lo, h

def extract(field, lo, h):
    from skimage.measure import marching_cubes
    v,f,nrm,_=marching_cubes(field,0.0,spacing=(h,h,h),allow_degenerate=False)
    v=v+lo
    return v.astype(np.float64), f.astype(np.int64)

def taubin(v, f, iters=6, lam=.5, mu=-.53, mask=None):
    """smooth marching-cubes stair-steps while preserving volume"""
    import scipy.sparse as sp
    n=len(v); e=np.concatenate([f[:,[0,1]],f[:,[1,2]],f[:,[2,0]]]); e=np.concatenate([e,e[:,::-1]])
    A=sp.coo_matrix((np.ones(len(e)),(e[:,0],e[:,1])),shape=(n,n)).tocsr(); A.data[:]=1
    deg=np.asarray(A.sum(1)).ravel(); deg[deg==0]=1
    for _ in range(iters):
        for w in (lam,mu):
            L=(A@v)/deg[:,None]-v
            if mask is not None: L*=mask[:,None]
            v=v+w*L
    return v

def normals(v,f):
    fn=np.cross(v[f[:,1]]-v[f[:,0]],v[f[:,2]]-v[f[:,0]])
    n=np.zeros_like(v)
    for i in range(3): np.add.at(n,f[:,i],fn)
    return n/np.maximum(np.linalg.norm(n,axis=1,keepdims=True),1e-12)

def sdf_ao(fn, v, n, steps=5, dist=0.012, k=1.0):
    """ambient occlusion from the distance field: compare expected vs actual distance along the normal"""
    occ=np.zeros(len(v))
    for i in range(1,steps+1):
        d=dist*i/steps*2
        occ+=(d-fn(v+n*d))/(2**i)
    return np.clip(1-k*occ/dist*1.6,0,1)

def cut(v,f,keep):
    """keep faces whose 3 vertices are all kept; reindex"""
    fm=keep[f].all(1); f=f[fm]
    used=np.unique(f); remap=-np.ones(len(v),int); remap[used]=np.arange(len(used))
    return v[used], remap[f], used

def decimate_cluster(v,f,cell):
    """vertex-clustering decimation (used only for far LODs)"""
    key=np.floor(v/cell).astype(np.int64); _,inv=np.unique(key,axis=0,return_inverse=True); inv=inv.ravel()
    nv=np.zeros((inv.max()+1,3)); cnt=np.zeros(inv.max()+1)
    np.add.at(nv,inv,v); np.add.at(cnt,inv,1); nv/=cnt[:,None]
    nf=inv[f]; ok=(nf[:,0]!=nf[:,1])&(nf[:,1]!=nf[:,2])&(nf[:,0]!=nf[:,2])
    return nv, nf[ok]
