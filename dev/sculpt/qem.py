"""Quadric-error edge-collapse decimation (Garland-Heckbert) with flip and link-condition checks."""
import numpy as np, heapq

def decimate(v, f, target_faces, protect=None, boundary_w=50.0):
    v = v.astype(np.float64).copy(); f = f.astype(np.int64).copy()
    nv, nf = len(v), len(f)
    a, b, c = v[f[:, 0]], v[f[:, 1]], v[f[:, 2]]
    n = np.cross(b - a, c - a); ar = np.linalg.norm(n, axis=1); n = n / np.maximum(ar, 1e-20)[:, None]
    P = np.concatenate([n, -(n * a).sum(1, keepdims=True)], 1)
    K = P[:, :, None] * P[:, None, :] * ar[:, None, None]
    Q = np.zeros((nv, 4, 4))
    for k in range(3): np.add.at(Q, f[:, k], K)
    # boundary edges get perpendicular constraint planes so the outline is kept
    e = np.concatenate([f[:, [0, 1]], f[:, [1, 2]], f[:, [2, 0]]]); fe = np.tile(np.arange(nf), 3)
    es = np.sort(e, 1); key = es[:, 0] * nv + es[:, 1]
    uk, inv, cnt = np.unique(key, return_inverse=True, return_counts=True)
    bmask = cnt[inv] == 1
    for (i, j), fi in zip(e[bmask], fe[bmask]):
        d = v[j] - v[i]; pn = np.cross(d, n[fi]); l = np.linalg.norm(pn)
        if l < 1e-20: continue
        pn /= l; pl = np.array([*pn, -pn @ v[i]]); Kb = np.outer(pl, pl) * boundary_w * (d @ d)
        Q[i] += Kb; Q[j] += Kb
    if protect is not None:
        Q[protect] *= 1e3
    vf = [set() for _ in range(nv)]
    for i, (x, y, z) in enumerate(f): vf[x].add(i); vf[y].add(i); vf[z].add(i)
    alive_v = np.ones(nv, bool); alive_f = np.ones(nf, bool); ver = np.zeros(nv, np.int64)
    isb = np.zeros(nv, bool); isb[e[bmask].ravel()] = True

    def best(i, j):
        Qs = Q[i] + Q[j]; A = Qs[:3, :3]
        try:
            if np.linalg.cond(A) < 1e8:
                x = np.linalg.solve(A, -Qs[:3, 3]); h = np.append(x, 1); return x, max(h @ Qs @ h, 0)
        except np.linalg.LinAlgError: pass
        bestc = None
        for x in (v[i], v[j], (v[i] + v[j]) / 2):
            h = np.append(x, 1); cst = h @ Qs @ h
            if bestc is None or cst < bestc[1]: bestc = (x, cst)
        return bestc[0], max(bestc[1], 0)

    heap = []
    for i, j in np.unique(es, axis=0):
        x, cst = best(i, j); heap.append((cst, i, j, 0, 0))
    heapq.heapify(heap)
    faces = nf
    def nbrs(i):
        s = set()
        for fi in vf[i]: s.update(f[fi])
        s.discard(i); return s
    while faces > target_faces and heap:
        cst, i, j, vi, vj = heapq.heappop(heap)
        if not (alive_v[i] and alive_v[j]) or ver[i] != vi or ver[j] != vj: continue
        if isb[i] != isb[j]: continue
        ni, nj = nbrs(i), nbrs(j)
        if j not in ni: continue
        common = ni & nj
        shared = vf[i] & vf[j]
        if len(common) != len(shared): continue
        x, _ = best(i, j)
        ok = True
        for vv, other in ((i, j), (j, i)):
            for fi in vf[vv]:
                if fi in shared: continue
                tri = f[fi]; p = v[tri].copy(); p[list(tri).index(vv)] = x
                nn = np.cross(p[1] - p[0], p[2] - p[0]); no = np.cross(v[tri[1]] - v[tri[0]], v[tri[2]] - v[tri[0]])
                ln, lo = np.linalg.norm(nn), np.linalg.norm(no)
                if ln < 1e-14 or (nn @ no) < .25 * ln * lo: ok = False; break
            if not ok: break
        if not ok:
            ver[i] += 0; continue
        v[i] = x; Q[i] = Q[i] + Q[j]; alive_v[j] = False
        for fi in list(vf[j]):
            if fi in shared:
                alive_f[fi] = False; faces -= 1
                for w in f[fi]: vf[w].discard(fi)
            else:
                t = f[fi]; t[t == j] = i; vf[i].add(fi)
        vf[j] = set(); ver[i] += 1
        for w in nbrs(i):
            a_, b_ = (i, w) if i < w else (w, i)
            xx, cc = best(a_, b_); heapq.heappush(heap, (cc, a_, b_, ver[a_], ver[b_]))
    f2 = f[alive_f]; used = np.unique(f2); remap = -np.ones(nv, np.int64); remap[used] = np.arange(len(used))
    return v[used], remap[f2], used
