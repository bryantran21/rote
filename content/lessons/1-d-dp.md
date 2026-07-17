# 1-D DP

Optimal substructure along one axis. Often just two rolling variables.

## Core syntax
- **Table** — `dp = [0] * (n + 1)`, fill left to right.
- **Rolling** — keep `prev`/`curr` instead of the whole array.

```python
prev, curr = 0, 0
for x in nums:
    prev, curr = curr, max(curr, prev + x)
return curr
```

## Watch out
- Seed base cases (`dp[0]`) and mind off-by-one on the array size.
