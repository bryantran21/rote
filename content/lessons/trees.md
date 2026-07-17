# Trees

Recursion is the natural fit; a stack/queue gives the iterative version.

## Core syntax
- **DFS orders** — pre (node,L,R), in (L,node,R), post (L,R,node).
- **BFS** — a `deque`, processing level by level.

```python
def inorder(node):
    if not node:
        return
    inorder(node.left)
    visit(node.val)
    inorder(node.right)
```

## Watch out
- In-order of a **BST** yields sorted values.
- Base case first: `if not node: return`.
