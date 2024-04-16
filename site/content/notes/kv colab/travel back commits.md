---
title: travel back commits
date: 2024-04-15
type: note
---
Travelling back would seem necessary only in case of having a database. This is kind of the current requirement of the idea, so it would seem practical. Here is a basic idea from *Automerge*

```js
Automerge.getHistory(state)
```

Output

```json
[
	{change: {message: "Add todo item..."},
	snapshot: {todos: [{title: "Buy milk", ...}, ... ]}},
	
	{change: {message: "Marking item as done ... "},
	snapshot: {todos: [{title: "Buy milk", ...}, ... ]}}
]
```

Keeping the idea of a k-v store in mind, this seems pretty reasonable to implement. There could be 2 different types 