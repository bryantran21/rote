# Sliding Window

A contiguous window that grows on the right and shrinks on the left.

## Core syntax
- **Expand / contract** — outer `for right`, inner `while` shrinks from `left`.
- **Window state** — a running sum, or a `Counter` of the window's contents.

```python
left = 0
window = Counter()
for right, c in enumerate(s):
    window[c] += 1
    while window[c] > 1:
        window[s[left]] -= 1
        left += 1
    best = max(best, right - left + 1)
```

## Watch out
- Window length is `right - left + 1`.
