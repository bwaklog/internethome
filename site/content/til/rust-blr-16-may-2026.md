---
title: Rust Bangalore Meetup 16 May 2026
date: 2026-05-16
tags:
  - notes
  - tech
draft: false
layout: post_layout
collections:
  - til
---

- Talk on Async Runtimes and async I/O in Linux by **Sanchayan Maity**. [Slides](https://git.sanchayanmaity.net/sanchayanmaity/presentations/src/branch/master/async-runtimes-may-2026) for the talk.
- Asynchronous I/O programming with `io_uring` [unixism.net](https://unixism.net/loti/)
- Async IO on Linux: select, poll, epoll [jvns.ca](https://jvns.ca/blog/2017/06/03/async-io-on-linux--select--poll--and-epoll/)
- Notes on epoll and io_uring - OS readiness vs OS completion models [iafisher.com](https://iafisher.com/notes/2025/10/epoll-io-uring)
- Notes on io_uring [boats.gitlab.io](https://boats.gitlab.io/blog/post/io-uring/)
- Asynchronous IO fundamentals [www.ncameron.org](https://www.ncameron.org/blog/async-io-fundamentals/)
- The Impact of Thread-Per-Core Architecture on Application Tail Latency [penberg.org](https://penberg.org/papers/tpc-ancs19.pdf)
- Thread-per core [without.boats](https://without.boats/blog/thread-per-core/)
- Io Uring [nick-black.com](https://nick-black.com/dankwiki/index.php/Io_uring)
- I/O access and interrupts [linux-kernel-labs.github.io](https://linux-kernel-labs.github.io/refs/pull/165/merge/labs/interrupts.html)
- Compio - a thread-per-core async runtime with io_uring [github.com/compio-rs](https://github.com/compio-rs/compio/)
- Compio with executor and dispatcher decoupled that can be swapped [compio.rs](https://compio.rs/docs/preface)
- Scheduling multithreaded computations by work stealing [dl.acm.org](https://dl.acm.org/doi/10.1145/324133.324234)
- Completion model makes use of an ownership model. There can be an issue with respect to drop problem on how buffer should be handled when a future is dropped as results will be written back to this buffer. (I' not sure about this, have to research). Complexities wrt in flight future operation cancellations. Dropping future does not stop kernels handling of the memory that it was given ownership to.
```rust
// compio (ownership mode)
// kernel must have ownership to the buffer that it is writing to
let buf = [0; 4096];
// buf is not borrowed
let (res, buf) = file.read_at(buf, 0).await;
//        ^^^ buffer returned with data

// tokio (borrowing) model
file.read(&mut buf).await?; // here buf is borrowed
```
- Advantages wrt zero-copy optimisations, completion models support batched submission for I/O operations, etc (check slides),
- Apache Iggy benchmarking [benchmarks.iggy.apache.org](https://benchmarks.iggy.apache.org/)
- Apache Iggy: Hyper efficient Message Streaming [github.com/apache](https://github.com/apache/iggy)
