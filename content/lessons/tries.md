# Tries

A tree of characters for fast prefix queries. Nodes are nested dicts.

## Core syntax
- **Node** — `{}` mapping char → child dict; mark ends with a sentinel key.

```python
class Trie:
    def __init__(self):
        self.root = {}
    def insert(self, word):
        node = self.root
        for c in word:
            node = node.setdefault(c, {})
        node['#'] = True     # end-of-word marker
```

## Watch out
- `dict.setdefault(c, {})` creates the child only if missing.
