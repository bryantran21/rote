# Backtracking

Choose → explore → un-choose. Build a partial solution and undo on the way back.

## Core syntax
- **Recurse with a path** — append, recurse, pop.

```python
def backtrack(start, path):
    res.append(path[:])          # copy the current path
    for i in range(start, len(nums)):
        path.append(nums[i])
        backtrack(i + 1, path)
        path.pop()               # undo
```

## Watch out
- Append a **copy** (`path[:]`) — the list is mutated in place.
