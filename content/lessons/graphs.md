# Graphs

Model as an adjacency `defaultdict(list)` or a grid. BFS for shortest hops, DFS for reachability.

## Core syntax
- **BFS** — a `deque`, plus a `visited` set.
- **Grid neighbors** — iterate `[(0,1),(0,-1),(1,0),(-1,0)]`.

```python
from collections import deque
q = deque([start])
seen = {start}
while q:
    node = q.popleft()
    for nxt in graph[node]:
        if nxt not in seen:
            seen.add(nxt)
            q.append(nxt)
```

## Watch out
- Mark visited when **enqueuing**, not dequeuing, to avoid duplicates.
