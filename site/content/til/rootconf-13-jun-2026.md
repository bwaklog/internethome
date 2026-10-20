---
title: "Rootconf 13 Jun 2026"
description: Some unorganised notes made durign the Rootconf Tropical Edition on Databases hosted at TERI auditorium on 13th Auditorium 2026
date: 2026-06-13
tags:
  - notes
  - tech
draft: false
layout: post_layout
collections:
  - til
---

Some unorganised notes made durign the Rootconf Tropical Edition on Databases hosted at TERI auditorium on 13th Auditorium 2026

## Incremental Computation
> Mihai Budiu, Chief Scientist at Feldera
- DBSP: Automatic Incremental View Maintenance for Rich Query Languages [vldb.org](https://www.vldb.org/pvldb/vol16/p1601-budiu.pdf)
- incremental view maintenance
- What are Z-sets: unifies changes and data representation
- stream operators  
- differential and integral circuits on streams. Stream of states cab be transposed into a stream of deltas and can be reproduced the original state stream from this delta stream with integral circuits. 
- If we can have our primitive relational operators work on streams, then the same query can be used for the working with streams
- A time space trade off.
- Our integral function has a delay in the circuit and this circuit maintains internal state throughout the entire time. 
- Converting every primitive operator to an incremental operator. It may or may not use integrators inside. Inputs and outputs are Z-Sets

## Database systems: a decade of disruption and innovation
> Karthik Ramachandra, Azure SQL DB R&D Organization
- Intelligent query processing 
	- Approximate query processing 
	- Adaptive query processing 
- DB in cloud != DBaaS
- Flexible Resource Allocation - packing databases in data enters
	- problems with statically allocating
	- flexible allocation, ensuring predictable performance, controlled overbooking
	- Increase sellable capacity
	- It is feasible. Not all dbs use all resources at all times. Low likelihood of many dbs simultaneously spiking
	- Allow controlled overbooking, tight packing and making sure there are no violations. 
	- Total sellable capacity > available capacity
	- Proactive - prevent/reduce likelihood of violations
	- Reactive - Reduce impact of violations
	- Challenges because dbs are a state full service
- how do databases move between machines? 
	- Compilation Storm!
	- Query plans are cached to avoid re optimisations  
	- After failover, all queries have to be re compiled and optimised, CPU spikes
- How do we have predictable performance despite having heterogeneity in hardware? 
- Deployment Flighting
	- How do we handle upgrades, and ensure data isn’t lost or upgraded when we have changes to data layouts and formats.
	- how are rollbacks handled at scale
-  Shift towards agents as consumers of data and also agents having the ability to directly interact with database systems.
- Bespoke databases
- Do we need to rethink building from ground up or do we refactor existing solutions. 
- No benchmarking equivalent for benchmarking in the cloud. We do not have the equivalent of TPC benchmarks for cloud databases

## Sponsored session: The evolving OLAP stack: a conversation with Firebolt
> Simon Stieger (Firebolt), Anirudh Sudhir (InMobi)
- How are data systems changing with agents working along with systems at scale and running large number of concurrent queries.
- Synthesising engines!!
- How do we look at latency in these hybrid systems
- Firebolt transitioning towards a single binary approach, outside of microservice approach. Similar approach to duck db. And with this same approach they have an approach to scale out
- Why they collapsed it into a single binary. Moving away from side car service approach makes it easier for setup, agents can evaluate systems better. Postgres’s is still used for metadata management. 
- Like DuckDB for single node and can also have a distributed version for scaling out. 
- Collapsing control plane into a single binary while making the data plane flexible. No vendor lock-in
- firebolts open source approach 
- Agentic speculation - how do agents perform exploratory task and queries on data

## Rolling Your Own Database (Safely!): Property-based Testing at Scale
> Shomik Ghose, Database Engineer at Antithesis
- Property Based Testing (PBT) [antithesis.com](https://antithesis.com/docs/resources/property_based_testing)
- PBT inspired generator to verify different propertied 
- Catching with DTS with inline checks 

## No Stats, No Problem: Building Feedback-Driven Optimizers for Lakehouses
> Renu Pinky Sumam, Senior Software Engineer at e6data
- decisions that optimisers make are done based on estimations on row count 
- Classical cost based optimisers assumptions are broken by lakehouse data assumptions
	 - Large number of parallel ingest pipeline with low latency requirement
	 - Stats like Number Of Distinct Values and Histograms is a challenge. Reliability of these computed values at a regular interval of time.
- magic number sensitivity analysis. Magic numbers are probes not final estimates
- What is high and low NDV
- Learned execution optimiser
	- plan query -> we canonicalise subtrees and lookup learned stats
	- execute the plan. The physical operators have stats for analysis that is captured
	- Feedback is processed and maps runtime stats to canonical hashes. 
	- persistence of the stats
- LEO in e6 makes the feedback reusable. They normalise the query that is being used by replacing common parameters with markers. This is hashed and used to identity the query pattern. Based on this learnt stats are chosen for optimisations. 
- Context blending. We do not want to use learned stats for queries.

## From Timeout to Sub-Second: Solving Scale-Dependent Deadlocks in Distributed Systems
> Varun Mishra, Senior Software Engineer (SDE-III) at Flipkart
- Related to the backup path and log rolling with HBase
- A multi instance thread dump revealing a deadlock coming up between region server and H master
- This was not revealed at a small scale test but when scaled up to pre deployment 
- 62300ms to 200ms for per rolling across 50+ nodes. Solved by removing a synchronous call when holding a global lock at a cluster level. The call was removed as a check that was already done at the start was being called at the time. 

## Fast on Paper, Slow in Reality: What We Got Wrong About Performance
> Sarthak Makhija, Principal Architect at Caizin

## Databases were not designed for this
> Arpit Bhayani, Principal Engineer II at Razorpay
