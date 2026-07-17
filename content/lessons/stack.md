# Stack

A plain Python `list` is a stack: `append` to push, `pop()` to pop the top.

## Core syntax
- **Push / pop** — `stack.append(x)` / `stack.pop()`.
- **Peek** — `stack[-1]` (guard with `if stack`).
- **Monotonic stack** — pop while the top breaks the invariant.

```python
stack = []
for i, h in enumerate(heights):
    while stack and heights[stack[-1]] > h:
        stack.pop()
    stack.append(i)
```

## Watch out
- `pop()` removes from the **end**; `pop(0)` is O(n) — use a deque for a queue.
