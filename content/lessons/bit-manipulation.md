# Bit Manipulation

Masks, shifts, and XOR identities.

## Core syntax
- **Test bit i** — `n & (1 << i)`.
- **Lowest set bit** — `n & (-n)`; **clear it** — `n & (n - 1)`.
- **Count bits** — `n.bit_count()` (3.10+) or `bin(n).count('1')`.

```python
missing = 0
for i, x in enumerate(nums):
    missing ^= i ^ x
missing ^= len(nums)          # XOR cancels pairs
```

## Watch out
- `x ^ x == 0` and `x ^ 0 == x` — the whole trick behind XOR puzzles.
