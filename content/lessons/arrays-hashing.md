# Arrays & Hashing

The bread and butter: lists for ordered data, dicts and sets for O(1) lookup.

## Core syntax
- **Frequency count** — `Counter(nums)` or a `defaultdict(int)` with `count[x] += 1`.
- **Group by key** — `defaultdict(list)` then `groups[key].append(x)`.
- **Membership** — `x in seen` where `seen` is a `set` (O(1), not a list).
- **Index map** — `{v: i for i, v in enumerate(nums)}`.

```python
from collections import Counter, defaultdict
freq = Counter(nums)                 # {val: count}
groups = defaultdict(list)
for s in strs:
    groups[tuple(sorted(s))].append(s)
```

## Watch out
- `{}` is an empty **dict**, not a set — use `set()`.
- `dict.get(k, default)` avoids `KeyError`.
