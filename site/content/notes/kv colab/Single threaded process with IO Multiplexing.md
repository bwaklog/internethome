---
title: Single threaded process with IO Multiplexing
date: 2024-04-16
type: note
---
Redis has taken up more of a single threaded approach. Instead of a multi thread model, where each thread handles a separate request, Redis has taken an option to exploit the speed of in memory operations, and having a different approach on fetching data.

Redis follows something called *I/O  Multiplexing* which produces an "apparent" concurrency unlike true concurrency that is achieved by multithreading the process.

![Diagram showing blocking calls over network](/static/images/notes/network-syscall-blocks.png)

[[IO syscalls are blocking operations]], they would make the process more inefficient rather than doing more productive work as shown above. This could be solved with a multi threaded approach, by using locking mechanisms (as seen in [[Multi threaded process with each request in a new thread]]), but this wastes valuable time when we already have a connection ready to send data over

## Solution to the problem

There can be some kind of notification mechanism for I/O movements. We can notify the server for example through a TCP connection, that it has data ready to be sent over, only then the server fires a `read` request to that particular client.

We are not dealing with network sys-calls like read, rather just I/O monitoring calls where we are watching the TCP connections. This achieves a single threaded process. This is the niche where [[Redis exploits in memory operation speeds]]

![A not so accurate diagram of IO multiplexing](/static/images/notes/notsoaccurate-repr-io-mux.png)
