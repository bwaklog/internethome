---
title: (devlog) Building systems in rust
description: Raft + KV's!
collections: [systems]
layout: post_layout
draft: false
date: 2024-09-26
tags:
    - WIP
    - tech
    - rust
    - storage
    - systems
---

A distributed bit-cask like LS Hash Table KV Store. Or according to my first, definitely not force pushed commit `4a141713` on _Mon Sep 23 00:31:41 2024 +0530_

> snowflk is a distributed kv store inspired from bitcask's implementation of a Log-Structured Hash Table, focusing on replicated storage of persistent data across nodes

This is another shot of me dipping my toes in rust, which was not the initial plan. Go seemed easy, but I wanted to learn something new along the way as well. May not be a _log_ of progress considering academics and club related work, wanted to try some stuff out :)

_writing this log right before a test, might be messy_

---

## Devlog

### SEP 23

Genesis, started of with a go implementation but...want to try rust for no reason, lets see how that goes :P

### SEP 24

Making this public, I'm to ashamed of what i have written

### SEP 30

- Implemented an abstraction over [yaml_rust2](https://docs.rs/yaml-rust2/latest/yaml_rust2/) crate for parsing `config.yml` during startups
- Plans for [messagepack](https://msgpack.org/) for persistence of states, i.e. for raft that would include data like `current term`, node `votedFor` and the `log[]` of committed changes
- Writing tests for raft from scratch will be complicated. Plus, need to decide if I should be just using simple `TCPListeners`  and _move bytes around_ or try out [Tonic](https://github.com/hyperium/tonic) for gRPC

```sh
Benchmark 1: ./target/release/bee
  Time (mean ± σ):       1.4 ms ±   0.0 ms    [User: 0.6 ms, System: 0.5 ms]
  Range (min … max):     1.3 ms …   1.7 ms    904 runs
```

---

## Links

Github repo: [bwaklog/bee](https://github.com/bwaklog/bee)