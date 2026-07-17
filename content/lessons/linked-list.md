# Linked List

Pointer surgery. A **dummy head** removes edge cases around the real head.

## Core syntax
- **Dummy + tail** — `dummy = ListNode(); tail = dummy`.
- **Reverse** — three pointers: `prev`, `curr`, `nxt`.

```python
prev, curr = None, head
while curr:
    nxt = curr.next
    curr.next = prev
    prev = curr
    curr = nxt
return prev            # new head
```

## Watch out
- Save `curr.next` **before** you overwrite it.
- Fast/slow pointers find the middle and detect cycles.
