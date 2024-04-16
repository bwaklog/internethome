---
title: Json like abstraction in Automerge
date: 2024-04-14
type: note
---

An example of some kind of representation of data as a todo list

```json
{ 
    "to-do": [
        {"title": "buy-milk", "done": false},
        {"title": "take-out-trash", "done": true}
    ]
    "settings": {
        "alert-sound": "ring",
    },

}
```

We can have editing operations, such as insertion of new tasks, adding a new data structure, updating values...

Automerge uses [[immutable state objects]], where the current state of data cannot be modified. Automerge capture the canges and stores the operations made in a **log of operations**, somewhat like this

```text
{action: "make-map", obj: id1}
{action: "set", obj: id1, key: "title", value: "Buy Milk"}
...
...
```

Having a log enables us to [[travel back commits]] . Using this we can probably roll back into commits, and open up snapshots of them.