# Intervals

Sort by a boundary, then sweep and merge or count overlaps.

## Core syntax
- **Sort by start** — `intervals.sort(key=lambda x: x[0])`.
- **Overlap test** — `a[1] >= b[0]` when sorted by start.

```python
intervals.sort(key=lambda x: x[0])
merged = [intervals[0]]
for start, end in intervals[1:]:
    if start <= merged[-1][1]:
        merged[-1][1] = max(merged[-1][1], end)
    else:
        merged.append([start, end])
```

## Watch out
- Decide whether touching endpoints (`==`) count as overlap.
