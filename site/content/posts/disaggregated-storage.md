---
title: Disaggregated Databases
date: 2026-09-06
description: Notes on disaggregated databases, paper readings and understanding architecture for such systems
layout: post_layout
draft: true
tags:
  - tech
  - databases
collections:
  - post
  - tech
---

## Understanding databases

Let’s design a simple “database”. We wan’t to store key-value pairs that we can modify with a fixed set of operations permitted. Lets define these operations that can be sequenced in a schedule as
- `READ x` that will get the value
- `WRITE x, y` that acts as an upsert for the pair

```rust
// create a database (only a single machine)
let mut db = Db::new()

_ = db.read(x).           // undefined 
db.write(Pair::new(x, "foo"))
_ = db.read(x)            // x="foo"
```

Here is another example

```rust
#[tokio::async]
async fn main() -> anyhow::Result<()> {
    Ok(());
}
```