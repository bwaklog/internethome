---
title: Notes from Goland Bangalore 75
date: 2024-04-13
draft: false
collections: [talks, 2024]
layout: post_layout
tags:
  - go
  - tech
  - profiling
  - WIP
description: Sharing a few notes from the Go Blore meetup on 13th April 2024. The speakers covered a few points on profiling in go, hands on demonstrations on it, dependency injection and a talk on how to use go with android.
---

This post contains a few notes from the Go Blore meetup on 13th April 2024. The speakers covered a few points on profiling in go, hands on demonstrations on it, dependency injection and a talk on how to use go with android.


# Profiling with Go

> by [Swapnil Nakade]()

## Points covered

- Using [net/http/pprof](https://pkg.go.dev/net/http/pprof) with go to profile either the CPU, memory or block profiling
- Visualisation of profiling using either the CLI, web flow diagram or flame graph
- Breaking down the code with profiling and finding places to improve performance
