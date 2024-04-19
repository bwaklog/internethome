---
title: Taking a few messy leaps in a hackathon
description: Decided to work on a distributed peer to peer networking system from scratch while maintaining data consistency across all nodes for a hackathon. While a being a failed attempt, wanted to share my learnings and ideas.
date: 2024-08-21
type: post
tags:
    - blog
    - tech
    - hackathon
draft: false
---

## Initial Problem Statement

The proposed idea for the hackathon was way different compared to what our final product was supposed to be. What was planned was a live database collaboration implementation where one host, who has the data, allows a few collaborators who all connect together and modify the data. They would communicate through a *centralised* log server and maintain data correctness.

The approach taken to handle a request coming in, would be single threaded. The host node would work on two separate threads. One to process transaction in memory, and persist changes to the disk. The other thread would be how the host would contribute to the data. All the clients would simply send its operations to the log server (so would the host), and its action would be executed by the host. So this collaboration model followed more of a *client-server* communication where *the host could also contribute to modification of data.*

The host would deal with the incoming requests through a TCP listener. This is similar to IO multiplexing. Host handles multiple TCP connections concurrently. It then executes these operations sequentially, ensuring data correctness which would need a different approach using locks when the process is multi threaded.

## Creating a a simple echo server

Just to test this connection mechanism, we tried out communication with all the connected peers using a simple echo server. A simple tcp listener was set up in go and all our nodes tapped into this connection.

For now, an array in the host would hold the connection addresses of all the connections to the listener

```go
var connectionChan = []net.Conn{}
```

Here is a basic sketch of the listener

```go
func TCPActiveListener() {
  tcp, err := net.Listen("tcp", ":8080")

  for {
    // a go routine to accept multiple connections to the
    // tcp server
    go func() {

      conn, err := tcp.Accept()
      connectionChan = append(connectionChan, conn)

      for {
        connResp, err := readBlock(&conn)

        if err == io.EOF {
          log.Printf("[%s] DISCONNECT {EOF}", conn.RemoteAddr())
        }

        if err != nil {
          conn.Close()
          // remove connection from client list
          log.Printf("[%s] DISCONNECT", conn.RemoteAddr())
          break
        }

        echoResponse(message string)
      }
    }()
  }
}
```

The response is echoed to all connections part of the client list. Building onto this, what was now needed, was to share some kind of instruction from a node to the listener. Decode this instruction and keep the operation in queue for execution.

This initial idea, had a lot of bottle necks.
- If the data doesn't reach a log server. The data would be lost. There would be no reflection to a local contribution for a node in the connection.
- Data being sent to a centralized server and back to the primary host with the data would be a slow process. Having all commands executed move through this stream would be *inefficient*

## Changes made to the problem statement

On advice of our seniors, we changed the basis of the project. Instead of having a centralized log server handling all the "operation logs" that were to be forwarded to the host, we shifted it to a *peer to peer* connection where all the data would be distributed and remain in memory. Every local contribution should reflect in the final synced up data across all the node sin this connection pool.

## Proof of concept

Creating this *decentralized* p2p connection, there would need to be a way to figure out how to set up the connection with peers and have the data. There needs to be at least one node who initiates the connection. During this the "host" would act as a server.

Each client in the node would associate a set of data that identifies its existance in the network pool.

```text
    ┌─────────────┐
    │ Client List │ ->  This is a list of clients connected to in the
    └─────────────┘     network pool.
    ┌─────────────┐
    │  Local in   │ ->  this is the data that is to be synced up
    │   memory    │     when a node in a netowrk has been changed
    │    data     │     data persisted to memory is not the priority
    └─────────────┘
    ┌─────────────┐
    │   Lamport   │ ->  This is the logical clock associated to the
    │    Clock    │     the node in the network
    └─────────────┘
    ┌─────────────┐
    │   Command   │ ->  Commands executed by that node. Could be used
    │    Head     │     to trace back and help in rebuilding, incase
    └─────────────┘     discrepancy during data syncing.
```

Each client in the connection must maintain such data for validity of connection and also to assist the node to communicate with other connections.

Initial implementation of the communication was built with a TCP server. All data needs to be sent through this. Sending raw inscructions cant be possible. Hence a payload was designed assist the revieveing node.
