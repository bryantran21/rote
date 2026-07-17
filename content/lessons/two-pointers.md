# Two Pointers

Two indices scanning a sequence — converging from the ends, or one chasing the other.

## Core syntax
- **Converging** — `l, r = 0, len(a) - 1`, move inward while `l < r`.
- **Skip filter** — `while l < r and not a[l].isalnum(): l += 1`.
- **Pair iteration** — `for x, y in zip(a, a[1:])`.

```python
l, r = 0, len(s) - 1
while l < r:
    if s[l] != s[r]:
        return False
    l, r = l + 1, r - 1
```

## Watch out
- Reverse a string/list with a slice: `s[::-1]`.
- Sorted input is the usual precondition for the converging variant.
