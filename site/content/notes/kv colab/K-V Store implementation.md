---
title: K-V Store implementation
date: 2024-04-16
type: note
description: The following collection of all notes i've made while trying to figure out CRDT, Automerge, how Redis works, what makes it so special and more
---
## Understanding Redis

- Redis utilises the cache on board the system rather than just the secondary memory. 
- Data is modified on the primary memory
- Data is stored on the disk for reconstruction - snapshots and backups
- More on the data structure : keys are associated to almost any type of *data structure*

## Specifications

- [[Redis operations are atomic in nature]]. 
- [[In memory storage of the database]], allowing for it to be stored in cache
- Transactions: while executing a transaction, nothing else is performed
- Pub/Sub: a publisher and consumer can listen to the same redis. Publishing to a "topic" in a redis, all the consumers listening to that topic would recieve that same topic.
- TTL : Enables key expiration. Example condition, user log out after a certain duration, rather than having the key persist throughout.
- LRU eviction : When the cache is full, keys are evicted.  

For a concurrent programming mode, there can be two approaches. One could be a [[Multi threaded process with each request in a new thread]]. Another is a [[Single threaded process with IO Multiplexing]]

## References 
- [What makes Redis Special](https://www.youtube.com/watch?v=h30k7YixrMo) by Arpit Bhayani