---
title: Multi threaded process with each request in a new thread
date: 2024-04-16
type: note
---
Each request to the TCP is handled by a separate thread. With this mutexes or semaphores can be put in place that ensures *data correctness*. 

```
R1 -> INCR K -> Thread 1
R2 -> INCR K -> Thread 2
```

If there aren't any guard rails in place for this process, the output in the kv could be unpredictable where. To ensure data correctness after execution of both operations, we need to add in a locking mechanism.

These locks to threads ensure concurrency safety where at max only *one thread* can aquire a lock.2 