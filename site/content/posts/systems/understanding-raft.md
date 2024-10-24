---
title: Understanding Raft
description: navigating distributed systems with raft
collections: [systems]
layout: post_layout
draft: true
date: 2024-10-06
tags:
    - wip
    - rust
    - systems
---

#  A Distributed Problem

-  _common knowledge_ in a system.
- two systems having a certainty of the state of another
- problem of **byzantine generals**. malicious systems being an adversary to a network. first definition of quorum \\(3f+1\\) \\(f\\) being the number of byzantine systems). **not focusing on cryptography here!**

**System models**

- the model of a network
- handling faulty/malicious modes
- ==also modeling systems based on how we handle network failures, node
behaviour (crash stop, crash-recovery & byzantien) from scratches and
timings(sync, partially and asynchronous)== - ==having assumptions in a
synchronous system vs an asynchronous system== - _fault tolerance_

> insert relevant time series diagrams

---
### Problem of Time and Events
- problem of **timing** and **ordering of events**
- we can't drop the notion of time, but how do we logically use it without breaking consistency and causality. why we cant have dependency on a physical clock for times
- ntp's???
- **causality** happens before relation in events

![minkowi-space-time](https://i.imgur.com/OfDw42d.png)
Minkoiws space-time

### Logical Timing of Events

- capturing causal order & dependencies \\((e_{1} \to e_{2}) \rightarrow (t(e_{1}) < t(e2))\\) allowing us to define a _total order_ \\(\prec\\) giving a linear order of events. but we are still away from _concurrent events in a system_, implying that we could have \\(a \parallel b\\) which implies that it is possible to have \\(a \prec b\\) and \\(b \prec a\\). hence \\(l(a)\\) and \\(l(b)\\) with \\(l(a) < l(b)\\) will not tell us about causality or concurrent events in a system.
- introducing **vector clocks**

> missing a lot of crucial sections of this, probably needs more to be focused on while developing this system

### ==Broadcasting Protocols==
- fifo: if \\(m_{1}\\) and \\(m_{2}\\)  are broadcasted by the same node then delivery must follow causality of \\(m_{1} \to m_{2}\\)
- causal order: if \\(\text{broadcast}(m_{1}) \to \text{broadcast}(m_{2})\\) then they are delivered in the same order
- total order: if \\(m_{1}\\) is delivered to a node before \\(m_{2}\\) then all nodes must deliver in the same order
- fifo-total order overcoming for short-comes in causality order!!
- gossip??


---

## Replicating, Why and Where?

- now this is where we talk about _fault tolerance_ in systems. with multiple systems working together, or just relying on one, we need to make sure information is maintained even during downtimes in some sort of fashion.
- using copies/replicas when needed to handle faulty data. there is also the problem of how we maintain consistency and a common ground of agreement over data
- setting some ground rules on how updates are delivered to applications. need for **idempotent** operations in a system with failable systems considering we rely on networks for communication
- \\(\text{func}(\text{state}) = \text{func}(\text{func}(state))\\)

> going to be referring to the _current_ data represented in a some sort of table/store to be representing its current _state_

### Manipulating States

- need for acknowledgements to go thru
- due to having a failable network between a client and server, there are cases where cruicial state change calls take place and that is not passed on to each server in the network

![timestamp with tombstones](https://i.imgur.com/NHZcOYk.png)

- using logical tombstones can later be used in **reconciling replicas**(anti-entropy) when we. logical time stamps on each of the commits help us understand order of occurrence. performing periodic checks would mitigate this issue, and bring all the servers state for one of the terms up-to the latest.
- *dealing with concurrent writes* could either be by two approaches, **last  writer wins** and **multiple-value registers** which wont drop values - \\(\{v_{1},v_{2}\}\\) when \\(t_{1} \parallel t_{2}\\), hence needing some sort of _conflict management_ in play..... _vector clocks in play_

### need for a *quorum*
- fault tolerance in a system with byzantine nodes, or trying to handle faults such as network partitions or node failures
- using quorum to decide how to handle delivery of messages

> **probability of faults**, where having all \\(n\\) replicas being faulty is \\(p^n\\) and \\(\ge 1\\) of \\(n\\) being faulty would be \\(1 - (1 - p^n)\\) where \\(p\\) is the probability that of a randomly selected replica, the replica is faulty, value exponentially increases with a large size of a network of nodes

- with a system of \\(n\\) replicas, our quorum of nodes that will constitute a majority would be \\(\lceil \frac{n+1}{2} \rceil = \frac{n+2}{2}\\) for an even number of replicas as \\(\frac{n+1}{2}\\) with odd number of replicas
- in a system with \\(n\\) replicas, if a write is acknowledged by \\(w\\) replicas and a read is acknowledged by \\(r\\) replicas, then it must follow that \\(r + w > n\\). reads can tolerate \\(n-r\\) unavailable nodes and \\(n-w\\) for writes

### ==read repairs==

> reconciliation and disseminating updates.  updating states of nodes based on some common knowledge of another

### replication with  broadcasting

- **state machine replication**, considering a *replica* as a state machine, it would go through the same sequence of state transitions, assuming a deterministic system, in the same order hence all replicas will end up in the same state. not referring to eventual consistency of things like a crdt here. what is a state machine tho

> *a state machine is a mathematical model defining a set of states and how transitions occur between them*

- relying on a _fifo total-order broadcast_ would mean that delivery of messages to replicas would be in the same order, we want to focus on maintaining causality. hence, because of the presence of a _deterministic state machine_, our system would be predictable. this is true when all current inputs and succeeding inputs to a system will lead all replicas to a single same state.
- we have similar disadvantages as total order broadcast while in the sense we need to wait for all message deliveries before beginning to
- **leader and follower** based  systems to implement total order broadcasting.
- ==in order to handle *concurrent updates* without the order in writes/updates being made taken into account then the states transitions must be commutative, and ensuring the final result of an arbitrary sequence of concurrent changes will lead a system to a common state. \\(f(g(x)) = g(f(x))\\)==

---

- while boradcasting with fifo-total order allows us to maintain some sort of sequence/ordering in events, we still haven't touched on the aspect of. but the leader itself in a such a system which is responsible for delivering messages in order is another *point of failure* within an already failable system.
- we want a system that can handle failures without intervention, we are trying to trying to achieve a *fault tole
- rant system*
- we are also restricted to how much we can deliver from a delivered from a distributed system

> a distributed system at a time can deliver two of the three characteristics. consistency in reads. availability (different from high availability) in the sense that every request to a non failing node will return a response. another characteristic would be that of handling network partition tolerance

##  Significance of Consensus

- in a system that has can have multiple failures, we need to find a common ground of agreement on values.
- messages are delivered by *total-order broadcast*, we then take a decision on the message to be delivered. considering a sequence of messages, we need to find a way to establish consensus between all nodes on each one of these entries.
- once an order has been formed and a message has been agreed upon, all the nodes will deliver the message in the same order.
- raft is fifo total order broadcast _out of the box_. paxos and raft are _partially synchronous chrash-recovery_ system models.

> asynchronous systems don't rely on any timing based assumptions.
>
> **flp's** result suggests _there is no deterministic consensus algorithm that will is guaranteed to terminate in an asynchronous crash-stop system mode_ ==add more relevant information of the paper here==


- Raft's consensus algorithm is partially synchronous but isn't a byzantine system model, those are different
- Raft and Paxos both rely on clocks for timeouts for deciding some state transitions. without timings, identifying failures in nodes would become problematic and the system cannot progress.
- goal of a consensus algorithm is to guarantee some sort of safety in a system to, and deal with faults.

**leader elections**
- we would use a leader for ordering of messages for delivery, but like we said before, the leader could be a point of failure in the system, hence we would need to take into account how the system behaves when the leader goes down
- needs to be \\(\leq 1\\) leader per term, and this like before is decided by a quorum of nodes
- we also don't want to leaders existing in a system, we don't want to handle such kind of conflicts, _violating total order broadcast_. raft does this by guaranteeing that there can at most be a be a single leader per term. leaders of a current term could also be unaware of there being a newly elected leader due to some partition, but the would handle this by having the new system in a higher term, but we need to note that, the system will only progress if the nodes in a partition will have a quorum of votes.
- leaders also don't make decisions about how to handle state alone, rather it seeks votes for each of them from a quorum of nodes and then proceeds on how to handle state.

> insert diagram probably

---
# "In Search for an Understandable Consensus Algorithm"

Raft uses a **strong leader** in a system, which makes all the decisions on log replication. we are also guaranteed that we cant have \\(> 1\\) leader in the _same term_

raft separates leader election, log replication and safety. it also tries eliminating the number of non deterministic ways servers can be inconsistent with each other

use of **leader elections** to progress systems in absence of a leader

as of **membership changes**, raft uses a _joint consensus_ approach where majority of two configurations overlap during transitions. configuration changes are based on this for progression

> it is simpler and more understandable than other algorithms; it is described completely enough to meet the needs of a practical system

![paper - fig1 replicated state machine architecture](https://imgur.com/0ookVBx.png)
paper figure 1: replicated state machine architecture

raft woks based off on **state machine replication**.

## *The Algorithm*

> Algo here

---

<div class="cite-block">

<strong>citations<strogn>

**in search for an understandable consensus algorithm**: [diego ongaro and john ousterhout. 2014. in search of an understandable consensus algorithm. in proceedings of the 2014 usenix conference on usenix annual technical conference (usenix atc'14). usenix association, usa, 305–320.]()

<hr >

[https://doi.org/10.1145/2854065.2854081](https://doi.org/10.1145/2854065.2854081): **first formal verification for raft consensus**

</div>

---

_references_

- Eaton Phil - [implementing the raft distributed consensus protocol in go](https://notes.eatonphil.com/2023-05-25-raft.html)
- Jon Gjengset -[students guide to raft](https://thesquareplanet.com/blog/students-guide-to-raft/)
- hashicorp/Mitchell Hashimoto - [hashicorp/raft.git](https://github.com/hashicorp/raft)
