# Python Interview Cheat Sheet

A fast reference for the syntax you reach for under interview pressure. Swap in
your own `PYTHON_LEETCODE_CHEATSHEET.md` any time — this file is rendered
verbatim on the Cheat sheet page and is the basis for the starter drill cards.

## Lists

```python
a = [1, 2, 3]
a.append(4)          # add to end
a.pop()              # remove & return last  -> 4
a.pop(0)             # remove & return first (O(n))
a.insert(1, 9)       # insert before index 1
a.remove(9)          # remove first matching value
a[::-1]              # reversed copy
a[1:3]               # slice indices 1,2
a[:] = []            # clear in place
b = a[:]             # shallow copy
a.sort()             # in place, returns None
sorted(a, reverse=True)
a.index(2)           # first index of value
a.count(2)           # occurrences
2 in a               # membership (O(n))
```

## Strings

```python
s = "hello world"
s[::-1]              # reverse
s.split()            # -> ['hello', 'world'] (whitespace)
s.split(",")         # split on comma
"-".join(["a","b"])  # -> 'a-b'
s.strip()            # trim whitespace (also lstrip/rstrip)
s.replace("l", "L")
s.lower() / s.upper()
s.startswith("he") / s.endswith("ld")
c.isalnum() / c.isdigit() / c.isalpha()
ord("a")  # 97      chr(97)  # 'a'
s.find("o")          # index or -1
"".join(sorted(s))   # anagram key
```

## Dicts

```python
d = {}
d["k"] = 1
d.get("k", 0)        # default if missing
d.setdefault("k", []).append(1)
d.pop("k", None)     # remove with default
"k" in d             # key membership (O(1))
d.keys() / d.values() / d.items()
for k, v in d.items(): ...
{v: k for k, v in d.items()}   # invert
```

## Sets

```python
seen = set()
seen.add(x)
seen.discard(x)      # no error if absent
x in seen            # O(1)
a | b                # union
a & b                # intersection
a - b                # difference
a ^ b                # symmetric difference
frozenset(a)         # hashable set (dict key)
```

## collections

```python
from collections import Counter, defaultdict, deque, OrderedDict

Counter("aabbc")            # {'a':2,'b':2,'c':1}
Counter(nums).most_common(2)

d = defaultdict(list)       # missing -> []
d = defaultdict(int)        # missing -> 0

q = deque()
q.append(x); q.appendleft(x)
q.pop();     q.popleft()     # both O(1)
q = deque(maxlen=3)          # ring buffer
```

## heapq

```python
import heapq
h = []
heapq.heappush(h, x)
heapq.heappop(h)             # smallest
h[0]                         # peek smallest
heapq.heapify(nums)          # O(n) in place
heapq.nlargest(k, nums)
heapq.nsmallest(k, nums)
# max-heap: push -x, pop -heapq.heappop(h)
# priority: push (priority, item) tuples
```

## Sorting & keys

```python
sorted(nums)
sorted(words, key=len)
sorted(pairs, key=lambda p: (p[0], -p[1]))   # multi-key
nums.sort(reverse=True)
sorted(d, key=d.get, reverse=True)           # keys by value

from functools import cmp_to_key
sorted(a, key=cmp_to_key(lambda x, y: x - y))
```

## Comprehensions

```python
[x*x for x in nums]
[x for x in nums if x % 2 == 0]
[y for row in grid for y in row]        # flatten
{x for x in nums}                       # set
{k: v for k, v in pairs}                # dict
(x*x for x in nums)                     # generator (lazy)
[[0]*C for _ in range(R)]               # R×C grid, no aliasing
```

## Iteration helpers

```python
for i, x in enumerate(nums, start=0): ...
for a, b in zip(xs, ys): ...
for x, y in zip(a, a[1:]): ...          # consecutive pairs
list(zip(*matrix))                      # transpose
range(n) / range(1, n) / range(n-1, -1, -1)
reversed(a)
any(x > 0 for x in nums)
all(x > 0 for x in nums)
sum(nums) / min(nums) / max(nums)
max(nums, key=abs)
```

## Numbers & math

```python
a // b               # floor division
a % b                # modulo
divmod(a, b)         # (a//b, a%b)
abs(x)  pow(x, y)  pow(x, y, mod)
float("inf") / float("-inf")
round(x, 2)
int("101", 2)        # parse binary -> 5
bin(5)  # '0b101'    hex(255)  # '0xff'
import math
math.gcd(a, b)  math.isqrt(n)  math.inf  math.ceil(x)
```

## Bit manipulation

```python
x & y   x | y   x ^ y   ~x
x << 1  x >> 1
n & (1 << i)         # test bit i
n | (1 << i)         # set bit i
n & ~(1 << i)        # clear bit i
n & (-n)             # lowest set bit
n & (n - 1)          # clear lowest set bit
n.bit_count()        # popcount (3.10+)
bin(n).count("1")    # popcount (classic)
```

## Templates

```python
# Binary search
lo, hi = 0, len(a) - 1
while lo <= hi:
    mid = (lo + hi) // 2
    if a[mid] == target: return mid
    if a[mid] < target:  lo = mid + 1
    else:                hi = mid - 1

# BFS
from collections import deque
q, seen = deque([start]), {start}
while q:
    node = q.popleft()
    for nxt in graph[node]:
        if nxt not in seen:
            seen.add(nxt); q.append(nxt)

# DFS (recursive)
def dfs(node):
    if not node or node in seen: return
    seen.add(node)
    for nxt in graph[node]: dfs(nxt)

# Union-Find
parent = list(range(n))
def find(x):
    while parent[x] != x:
        parent[x] = parent[parent[x]]   # path compression
        x = parent[x]
    return x
def union(a, b): parent[find(a)] = find(b)
```

## Gotchas

```python
{}          # empty DICT, not set — use set()
a = b = []  # both name the SAME list
[[0]*n]*m   # rows are the SAME object — use a comprehension
0.1 + 0.2   # 0.30000000000000004 (float error)
x = 5 / 2   # 2.5 (float);  5 // 2 is 2 (int)
sort()      # returns None (sorts in place)
```
