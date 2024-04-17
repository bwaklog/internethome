---
title: IO syscalls are blocking operations
date: 2024-04-17
type: note
---
If a read request is fired, it wouldn't do anything until the data from the other side is sent over. We are invoking read, without knowing if the other client has any data to send over. The problem with such a system is that, there could be other clients with data that is ready to be sent over, need to wait for the currently connected client to finish send over some kind of data.

With a multi thread approach, other processes can be scheduled while "waiting" for the data to get sent over. This makes use use stuff like semaphores for ensuring "correctness" of data