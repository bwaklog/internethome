---
title: Taking a few messy leaps in a hackathon
description: Learnings from failure from Ingenius 12.0
date: 2024-04-21
layout: post_layout
tags:
  - blog
  - tech
  - hackathon
  - p2p
  - networking
draft: false
collections:
  - systems
  - "2024"
---

## Initial Problem Statement

The proposed idea for the hackathon was way different compared to what our final product was supposed to be. What was planned was a live database collaboration implementation where one host, who has the data, allows a few collaborators who all connect together and modify the data. They would communicate through a *centralized* log server and maintain data correctness.

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

Each client in the node would associate a set of data that identifies its existence in the network pool.

```text
┌─────────────┐
│ Client List │ ->  This is a list of clients connected to in the
└─────────────┘     network pool.
┌─────────────┐
│  Local in   │ ->  this is the data that is to be synced up
│   memory    │     when a node in a network has been changed
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

Initial implementation of the communication was built with a TCP server. All data needs to be sent through this. Sending raw instructions cant be possible. Hence a payload was designed assist the receiving node. It would contain appropriate data for processing and also assist the node in what kind of process it would need to execute

```text
┌─────────────┐
│   Header    │ ->  An integer representing the operation to be performed
└─────────────┘     • 0 ->  handle a new connection into network pool
                    • 1 ->  handle a new connection into a pool,
                            (this is when a client is part of a pool
                             and is connecting with the client part of
                             the client list it received)
                    • 2 ->  handle any sort of operation command
┌─────────────┐
│   Lamport   │ ->  The value of lamport clock of the node
│  Clock val  │
└─────────────┘
┌─────────────┐
│   Command   │ ->  Nodes command head at the time
│    Head     │
└─────────────┘
┌─────────────┐
│    Data     │ ->  Data sent over when trying to bring a node to the current
└─────────────┘     synced up version. Primarily when a node enters a pool.
┌─────────────┐
│ Client List │
└─────────────┘
```

Not all these fields need to be filled up. Only the necessary ones would be filled up and sent over through the connection.

Before sending any data over the connection, we would need to send it over in a way where data can be understandable on the other end. For this, data was marshaled to bytes using the json methods provided go's standard library `encoding/json`. On the receiving end it would be decoded and would follow the instructions.

## Initilizing a network pool

When two clients want to start a p2p connection, for initialization, either one of them would start the connection as a server. The client would then connect to this and send over a payload asking for the nodes client list and data. You would imagine it as two individuals exchanging each others contacts. Along with this the data would get shared over as well. This forms a p2p connection with 2 nodes.

![Formation of a network pool](/static/images/posts/ingny12/forming-net-pool.png)

Suppose there exists a network pool and another peer is trying to enter this. As there would be no leader in this connection, they should be able to connect using either one of the nodes. The procedure would follow the same steps as before with an additional one

The entering node requests for the client list of its peers and the data. We assume that in a network, all the nodes have a synced up data. With this in mind the data is sent over to the node entering the network. They add each other to their client lists.


The node goes through the client list and attempts to connect to each one of its clients. It shares it client list, which would be the latest one, and informs them to add them to their client list, hence a connection is formed with each of the remaining clients in the pool. Again an assumption would be all the data would be in sync, hence there wouldn't be a need of sharing that part. In case of any inconsistency, we would rely on reconstructing the data during any other operation communication.

![Connecting with clients part of the client list](/static/images/posts/ingny12/client-connecting-to-others.png)

## Handling data

The proposed concept was that we would be implementing a basic model of CRDT to make sure all the context of the data is retained when there could be concurrent executions.

With the lamport clocks and the head commands, we could identify if any version of data was behind, and handle the cases accordingly. For example, if there is some sort of mis match regarding the version, the receiver would send its set of instructions to the sender and try brining both versions up to date.

## Big roadblock

Like said before, we didn't test out any of the connections. After finishing the first iteration of the client connection system. While testing this, we realized while the data was getting serialized correctly locally, the data seemed to disappear after the receiver node tried unlashing these bytes. We weren't able to get 2 nodes in consensus.

![Demonstration of the connection system where the data didn't pass through the TCP connection](/static/images/posts/ingny12/broken-communication-payload.png)

Ignoring the nil value in the image, which was later fixed where instead of adding the connection object to the client list, we were only appending the value of the connection remote address as a string. Even this didn't go through.

## Mistakes

We made quite a few mistakes while working with this project. To list out - using TCP as our protocol, using json for serialization of the data. Throughout this hackathon, everything implemented was from scratch. While having premed modules available, we hesitated from using them.

Considering this hackathon was 24 hours long, making everything from scratch set us back compared to our competition. Our initial problem statement being complex, made us work on the *theory* of the implementation alone for about 4 hours. While the hack began at 5pm, from 8-11pm, we were still unsure about what we wanted to achieve, and where this could be applied.

Only after a few reviews with our seniors, we then began working on the first implementation of this model.

Another big mistake that we made was writing the code for the network connections without testing a single line. While our concept was robust and no apparent roadblock was visible, we didn't test crucial parts of our code.

Our current model of how the nodes communicate with each other and rely on logical clocks would immediately fail, when there is any sort of network partition that occurs.


## Learnings

This is something that I'm really eager to work on. Of course, it was a long shot for a 24-hour hackathon. The plan that I put forward was messy to begin with but it was leading us to something. Looking back at it after a day of sleep, it seemed rather foolish that we were trying to reinvent this system. Again we tried doing this all in a few hours.

Thanks to the help of all the seniors, the've been helpful in showing new ways to approach this idea. Our goal set by our senior was to implement this basic distributed p2p connection with synced up data and implement a small text editor to show that such a connection is indeed possible. We weren't able to finish the first part.

<blockquote class="twitter-tweet"><p lang="en" dir="ltr">It&#39;s such a beautiful thing to see systems-oriented projects back at hackathons: (all 1st year students!) one team is attempting to add primitive gc to C, one team is attempting to implement a p2p collaborative text editor... This kinda stuff puts a smile on my face</p>&mdash; Anirudh Rowjee @ override.bsky.social (@AnirudhRowjee) <a href="https://twitter.com/AnirudhRowjee/status/1781404565822165482?ref_src=twsrc%5Etfw">April 19, 2024</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

> A few kind words from my senior Anirudh Rowjee :)

## Conclusion

Keeping all the points of failure in mind and also some other technologies and theories suggested by our seniors, I'm planning to take another shot at this. This live data sharing architecture has been bugging my mind for the past few months. Especially since i've been working on with my friend on our project, where we used the [Zed, a text editor written in rust](zed.dev), which uses CRDT as a method of maintaining data correctness and allowing live sharing to take place. Ever since, i've been more intrigued to work on something.

The mentors and judges i've spoken to have all been of great help. Just to be a part of the top 10 of this hackathon, definitely made me happy that with such a project theory, we were able to make it recognisable to some people. The mentors have backed us up the hackathon, providing us with great suggestions, and i'm gonna keep these and move forward, work more on this theory. I definitely feel there is something that is possible with it and cannot leave it as another un-finished project.
