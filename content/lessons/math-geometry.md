# Math & Geometry

Integer arithmetic, digits, and coordinate transforms.

## Core syntax
- **Quotient + remainder** — `q, r = divmod(a, b)`.
- **Last digit / drop digit** — `n % 10`, `n //= 10`.
- **Rotate a matrix** — transpose, then reverse each row.

```python
q, r = divmod(17, 5)          # (3, 2)
matrix[:] = [list(row) for row in zip(*matrix)]   # transpose
for row in matrix:
    row.reverse()
```

## Watch out
- `/` is float division; use `//` for integers.
