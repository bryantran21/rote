# Heap / Priority Queue

`heapq` is a **min-heap** over a plain list. Great for top-k and streaming.

## Core syntax
- **Push / pop** — `heapq.heappush(h, x)` / `heapq.heappop(h)`.
- **Heapify** — `heapq.heapify(nums)` (O(n), in place).
- **Max-heap** — push `-x`, negate on pop.

```python
import heapq
h = []
for x in nums:
    heapq.heappush(h, x)
    if len(h) > k:
        heapq.heappop(h)    # keep k largest
```

## Watch out
- Tuples sort by first element: `(priority, item)`.
