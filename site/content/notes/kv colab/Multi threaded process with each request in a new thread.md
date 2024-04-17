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

Without locks, there is a good chance for unpredictable output. The final data wouldn't represent the true correct value

```text
      ┌─────────┐ 
T1 -> │  K + 1  │ ===> 10 ++ ~> 11
      └─────────┘
	  
      ┌─────────┐ 
T2 -> │  K + 1  │ ===> 10 ++ ~> 11
      └─────────┘
```

These locks to threads ensure concurrency safety where at max only *one thread* can acquire a lock. This can be achieved with the help of using *mutexes* or *semaphores*. 

![Diagram representing how the locking mechanism would take place](/static/images/notes/aqu-rel_lock_multi_thread.png)
