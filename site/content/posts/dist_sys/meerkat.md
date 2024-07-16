---
title: Meerkat build log
description: A p2p data sync system in go
collections: [dist_sys]
layout: post_layout
draft: false
date: 2024-04-22
tags:
    - WIP
    - tech
    - log
    - go
    - distributed systems
    - networking
    - progress
previewimage: https://i.imgur.com/LTaopsX.png
---

Meerkat is a p2p distributed application to maintain data synchronisation between all nodes using GRPC. Initially part of a hackathon idea proposed (available in [this](https://hegde.live/posts/dist_sys/inginy12) post)

## Commits

- [3f8b029](https://github.com/bwaklog/meerkat/commit/3f8b029069bff3ce0673b9dda92001a50175ade4) -> Migrating to GRPC and testing out basic node pinging.
- [2291e07](https://github.com/bwaklog/meerkat/commit/2291e07e67be6f91067e3bfe13130b58327e6612) -> Implement a basic pool joining protocol.
- [e9da45e](https://github.com/bwaklog/meerkat/commit/e9da45e1bd5b491133b542dc4be6060bb03e472c) -> Data transmission with failure in edge cases. Using 2 go routines to handle different aspects of the program.
- [7a51506](https://github.com/bwaklog/meerkat/commit/7a51506e730176bc8e80098e5b4e274f5acd2552) -> Creating mutex locks to fix data race issues persistent in the program.
- [6acc241](https://github.com/bwaklog/meerkat/commit/6acc241568aaeb9dafe78e638ebb84bc26fcc580) -> Basic graceful exit for simple fault tolerance during signal interrupts
- [b8ffb9f](https://github.com/bwaklog/meerkat/commit/b8ffb9fad0025447a631367c9c23c45f7524bf58) -> Creating Disk Snapshots to identify events of `DELETION`, `ADDITION` (updates and addition are broadcasted as the same type of event for now).

## Issues

- [ ] Issue [#7](https://github.com/bwaklog/meerkat/issues/7): _Streaming file contents as chunks_
    - Current method passes all bytes in one go through a stream. This is an issue with larger files
- [ ] Issue [#6](https://github.com/bwaklog/meerkat/issues/6): _fix: file deletion broadcasting_
    - [x] file deletions
    - [ ] folder operations are shadowed
- [ ] Issue [#5](https://github.com/bwaklog/meerkat/issues/5): _ Handle unexpected disconnects from nodes_
    - [x] Handle interrupts
    - [ ] Handle fatal erros
- [ ] Issue [#4](https://github.com/bwaklog/meerkat/issues/4): _Dealing with merging 2 network pools_
    - Focus on this issue is to work with network partitions.
    - Current system only deals with how a node can enter an existing network pool.
- [ ] Issue [#3](https://github.com/bwaklog/meerkat/issues/3): _Move towards a gossip protocol_
    - Broadcast of changes happes to all nodes
    - Move to gossip to reduce network overload, the goal is that data propagates to all nodes eventually.
- [x] Issue [#2](https://github.com/bwaklog/meerkat/issues/2): _Handshakes and Disconnects not going through_
    - Duplicate addition of nodes in the client list
    - Safe node leaving boradcast doesn't propagate across the nodes
- [x] Issue [#1](https://github.com/bwaklog/meerkat/issues/1): _Attempt to connect to client twice_


## Research for future improvements

- [Raft Consensus Algorithm Paper](https://raft.github.io/raft.pdf)
- Distributed Systems lecture by [Martin Kleppmann](https://martin.kleppmann.com/)
<div class="video-container">
    <iframe width="560" height="315" src="https://www.youtube-nocookie.com/embed/videoseries?si=4qyZinhJjrAFyn2w&amp;controls=0&amp;list=PLeKd45zvjcDFUEv_ohr_HdUFe97RItdiB" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>
