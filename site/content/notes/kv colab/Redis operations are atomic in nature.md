---
title: Redis operations are atomic in nature
date: 2024-04-15
type: note
---
Command executions on redis (in case multiple are stacked due to multiple client connections), in only starts executing the other commands when the previous one has been completed

> There is no context switching and execution of "other" commands

This assures a safe concurrency nature of the db. In general operations like increment are not concurrent safe. Having n connections incrementing a value of a filed will need to keep each increment stored in the final snapshot of the db. Hence, having an atomic model of the db ensures, each of the valid operations results reflects on the final output.