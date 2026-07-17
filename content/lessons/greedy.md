# Greedy

Take the locally best choice and never look back — when a swap argument proves it works.

## Core syntax
- **Running best** — track a max/min while scanning once.

```python
cur = best = nums[0]
for x in nums[1:]:
    cur = max(x, cur + x)     # extend or restart
    best = max(best, cur)
return best
```

## Watch out
- Sorting first (by end time, size, ratio) sets up most greedy proofs.
