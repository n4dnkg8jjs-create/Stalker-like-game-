"""Assemble per-character wardrobe pieces (garments, pockets, pads, boots, vest, helmet) into shared topology +
per-character positions for the game."""
import numpy as np
from clothes import *
from garments import *

def garment_piece(g, X, rim=.0032):
    N = quad_normals(X, g.Q)
    first = np.full(g.n, -1); first[g.vidx[::-1]] = np.arange(len(g.vidx))[::-1]
    Xs = [X]; Ws = [g.W]; vid = [g.vidx]; uvs = [g.uv]; tris = [g.tris]; nu = g.n; ns = len(g.vidx)
    for L in g.loops:
        inner = X[L] - N[L] * rim
        m = len(L); Xs.append(inner); Ws.append(g.W[L]); vid.append(nu + np.arange(m)); uvs.append(g.uv_unsplit[L])
        a = first[L]; b = ns + np.arange(m)
        t = []
        for i in range(m):
            j = (i + 1) % m
            t += [[a[i], b[i], b[j]], [a[i], b[j], a[j]]]
        tris.append(np.array(t)); nu += m; ns += m
    return np.concatenate(Xs), np.concatenate(Ws), np.concatenate(vid), np.concatenate(uvs), np.concatenate(tris)

def cavity_ao(X, tris, k=60.):
    import scipy.sparse as sp_
    n = len(X); e = np.concatenate([tris[:, [0, 1]], tris[:, [1, 2]], tris[:, [2, 0]]]); e = np.concatenate([e, e[:, ::-1]])
    A = sp_.coo_matrix((np.ones(len(e)), (e[:, 0], e[:, 1])), shape=(n, n)).tocsr(); A.data[:] = 1
    deg = np.maximum(np.asarray(A.sum(1)).ravel(), 1)
    fn = np.cross(X[tris[:, 1]] - X[tris[:, 0]], X[tris[:, 2]] - X[tris[:, 0]]); nn = np.zeros_like(X)
    for i in range(3): np.add.at(nn, tris[:, i], fn)
    nn /= np.maximum(np.linalg.norm(nn, axis=1, keepdims=True), 1e-12)
    L = (A @ X) / deg[:, None] - X; c = (L * nn).sum(1)
    for _ in range(3): c = .5 * c + .5 * (A @ c) / deg
    return np.clip(1 - np.maximum(c, 0) * k * 10, .55, 1) * np.clip(1 + np.maximum(-c, 0) * k * 2, 1, 1.08)

def pieces_to_mesh(pieces):
    """normalise every piece to (Xu, Wu, vidx, uv, tris over split verts)"""
    out = []
    for p in pieces:
        if 'g' in p:
            Xu, Wu, vid, uv, tr = garment_piece(p['g'], p['X'])
        else:
            Xu, Wu, vid, uv, tr = p['V'], p['W'], np.arange(len(p['V'])), p['U'], p['T']
        out.append(dict(name=p['name'], mat=p['mat'], X=Xu, W=Wu, vidx=vid, uv=uv, tris=tr))
    return out
