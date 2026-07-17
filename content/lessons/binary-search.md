# Binary Search

Halve the search space each step. Also search an *answer space*, not just an array.

## Core syntax
- **Midpoint** — `mid = (lo + hi) // 2` (floor division).
- **Library** — `bisect.bisect_left(a, x)` / `bisect_right`.

```python
lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target:
        return mid
    if a[mid] < target:
        lo = mid + 1
    else:
        hi = mid - 1
```

## Watch out
- Decide `<=` vs `<` and `mid ± 1` up front to avoid infinite loops.
