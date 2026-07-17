# Advanced Graphs

Weighted shortest paths, minimum spanning trees, and ordering with dependencies.

## Core syntax
- **Dijkstra** — a min-heap of `(dist, node)`.
- **Topological sort** — Kahn's algorithm with in-degrees and a queue.

```python
import heapq
dist = {start: 0}
pq = [(0, start)]
while pq:
    d, node = heapq.heappop(pq)
    for nxt, w in graph[node]:
        if d + w < dist.get(nxt, float('inf')):
            dist[nxt] = d + w
            heapq.heappush(pq, (dist[nxt], nxt))
```

## Watch out
- Dijkstra needs non-negative weights.
