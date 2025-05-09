---
title: Building systems in rust
description: A _small_ blog on building raft in rust as a generic consensus layer and a KV store to use it for consensus.
layout: post_layout
draft: false
date: 2024-12-21
tags:
  - WIP
  - tech
  - rust
  - storage
  - systems
  - distributed
previewimage: https://imgs.xkcd.com/comics/network.png
collections:
  - systems
  - "2024"
---
> blog updated 21/10/2024
## A much needed Introduction to this Blog

As I said, this is work in progress. The stupid reality where I open source my progress and not the repository that I'm working on in shame, definitely working with a [garage door open](https://notes.andymatuschak.org/Work_with_the_garage_door_up). This section is still 🏗️

## How this project started out

A distributed bit-cask like LS Hash Table KV Store. Or according to my first, definitely not force pushed commit `4a141713` on _Mon Sep 23 00:31:41 2024 +0530_

> snowflk is a distributed kv store inspired from bitcask's implementation of a Log-Structured Hash Table, focusing on replicated storage of persistent data across nodes

This is another shot of me dipping my toes in rust, which was not the initial plan. Go seemed easy, but I wanted to learn something new along the way as well. May not be a _log_ of progress considering academics and club related work, wanted to try some stuff out :)

_writing this log right before a test, might be messy_

### SEP 23

Genesis, started of with a go implementation but...want to try rust for no reason, lets see how that goes :P

### SEP 24

Making this public, I'm to ashamed of what i have written

### SEP 30

-   Implemented an abstraction over [yaml_rust2](https://docs.rs/yaml-rust2/latest/yaml_rust2/) crate for parsing `config.yml` during startups
-   Plans for [messagepack](https://msgpack.org/) for persistence of states, i.e. for raft that would include data like `current term`, node `votedFor` and the `log[]` of committed changes
-   Writing tests for raft from scratch will be complicated. Plus, need to decide if I should be just using simple `TCPListeners` and _move bytes around_ or try out [Tonic](https://github.com/hyperium/tonic) for gRPC

---

## Back at it again...changing everything

With everything basically scrapped, except that one beautiful yaml parser I wrote with the `yaml_rust2` and learning a bit more after not finish advent of code once again, I felt it would be a great time to rewrite this for fun during my end semesters...which is still going on as I write this line.

So with a lot of undesirable behaviour, and exams this project had to come to a hold. Started the whole thing with a fresh repository and began working on a more generalised raft library. Some small changes included using bincode for serialization instead of message pack showing significantly faster serialization speeds than messagepack.

```rust
#[tarpc::service]
trait Server<T> {
    // ...
    fn ping_example(&self, req: AppendEntries<T>) -> Response;
    // ...
}
```

Having a generalized raft library meant serializing bytes and sending generic logs over TCP, which isn't really that hard. But tarpc didn't really like doing this as it never really allowed me to write generic traits for a server, which was of course needed. Instead of this, wouldn't it be easier to just, excuse my words, raw dog the bytes over tcp??

If I can write my own _rpc like_(definitely not RPC) layer then, I technically have all the flexibility I need to have, couldn't be that hard considering its all just bytes sent over network, and deserialization works if and only if the types on both the sides are correct. As of now, there is absolutely no type validation on client and server side besides the `tokio::task` that has the server running panics out of existence while the task of the application is still running. Of course not desirable but hey, this is still in a toy stage, wont hurt to experiment

Just to point out to those who have not seen my other f ups while doing something like this, the last time I tried writing a protocol with pure tcp and marshaled json bytes across a network [did not end very nicely](https://hegde.live/posts/systems/inginy12), in-fact never managed to send bytes across because go never warned me about private fields in a struct don't get serialized at all, thats really fun to learn about almost a year after a wasted hackathon, but hey you always learn something at the wrong times


Why all this, well lets see how elegantly you can now define a naive type in rust and have raft as a consensus layer

```rust
#[derive(Debug, Serialize, Deserialize)]
pub struct Pair<K, V>
where
    K: 'static + Eq + Hash + Debug + Send + Clone,
    V: 'static + Debug + Send + Clone,
{
    pub key: K,
    pub val: V,
}

// skipping the necessary implemnetations for Clone,
// Display, server::log::Entry (which is a necessasry
// trait of a generic T to be in consensus, more on
// that later)
#[derive(Debug)]
pub struct KVStore<K, V>
where
    K: 'static + Eq + Hash + Debug + Serialize + DeserializeOwned + Send + Clone,
    V: 'static + Debug + Serialize + DeserializeOwned + Send + Clone,
{
    pub map: Mutex<HashMap<K, V>>,
    pub raft: Raft<Pair<K, V>>,
}
```

Now isnt that neat, atleast to my eyes that has seen a lot worse, now all you need is some async function calls and viola!

```rust
#[tokio::main]
async fn main() {
    // some config loading
    let args = Args::parse();
    let config =
        parse_config(PathBuf::from(args.conf_path))
        .expect("failed to parse config");

    // A simple KVStore storing keys as strings and values as a string
    let kv: KVStore<String, String> =
        KVStore::init_from_conf(&config).await;

    kv.raft.start_raft_server().await;
    let kv_raft = Arc::new(Mutex::new(kv.raft));
    let kv_raft_clone = Arc::clone(&kv_raft);

    tokio::spawn(async move {
        kv_raft_clone.lock().await.tick().await;
    });

    // our listener for a kv server to listen to clients over
    // tcp
}
```

Okay now lets get back to what i've done to come to this stage. Now how did I define this layer...

```rust
#[derive(Debug, Deserialize, Serialize)]
pub enum RequestPattern<T>
where
    T: Entry + Debug + Display + Clone,
{
    PingRPC(PingRequest),
    AppendEntriesRPC(AppendEntriesRequest<T>),
    RequestVoteRPC(ElectionVoteRequest),
}


pub trait Service<T>
where
    T: Entry + Debug + Display + Clone,
{
    fn ping_node(
        node_id: NodeId,
        state: Arc<Mutex<State<T>>>,
        req: PingRequest,
    ) -> impl Future<Output = PingResponse>;
    fn append_entries(
        node_id: NodeId,
        state: Arc<Mutex<State<T>>>,
        req: AppendEntriesRequest<T>,
    ) -> impl Future<Output = AppendEntriesResponse>;
    fn request_vote(
        node_id: NodeId,
        state: Arc<Mutex<State<T>>>,
        req: ElectionVoteRequest,
    ) -> impl Future<Output = ElectionVoteResponse>;
}
```

```rust
#[derive(Debug, Clone)]
pub struct Server<T>
where
    // why `static, I basicaly enforce that T is always of an owned type,
    // otherwise the compiler runs in the assumption that T could be of type
    // &T, &&T, &mut T,... which is obviously never the case
    T: 'static Entry + Debug + Display + Serialize + DeserializeOwned + Clone,
{
    // i know this is very redundant, but I did face stupid
    // issues of my `State<T>` not implementing send across
    // threads which definitely whent over my head while
    // trying doing this the first time, so yeah its a bit
    // messy needs a lot of clean up
    pub state: Arc<Mutex<State<T>>>,
    pub node_id: NodeId,
}
```

Now lets have a look of what we can do on the server side for an incoming TCP request

```rust
if stream.read_buf(&mut buf).is_ok() {
    let req: RequestPattern<T> = bincode::deserialize(&buf).unwrap();

    match req {
        RequestPattern::PingRPC(req) => {
        	/* handle resp back here */
        },
        RequestPattern::RequestVoteRPC(req) => {
        	/* handle resp back here */
        },
        RequestPattern::AppendEntriesRPC(req) => {
        	/* handle resp back here */
        },
    }
} else {
  warn!("failed to read stream {:?}", stream);
}
```

I also went ahead and made some changes on how the raft state is defined, separating its volatile component from the persistent state

```rust
#[derive(Debug)]
pub struct State<T: Entry + Debug + Display> {
    pub persistent_state: PersistentState<T>,
    pub volatile_state: VolatileState,
    pub recieved_leader_heartbeat: AtomicBool,
}

#[derive(Debug)]
pub struct Raft<T>
where
    T: Entry + Debug + Display + Serialize + DeserializeOwned + Clone,
{
    pub node_id: NodeId,
    pub config: Config,
    pub state: Arc<Mutex<State<T>>>,

    // termination condition for the
    // server ticker
    pub stopped: bool,

    // for the "rpc"
    pub server: Server<T>,
    pub client: Client,
}
```

And for anything that I missed out, here is the long commit message that I mostly typed (and definitely have not force pushed to a lot) while I was incredibly sleepy...yeah I've gone against all the best practices so far, especially with respect to my commits

![image of a badly written commit](https://i.imgur.com/jycBupX.jpeg)

> (17/12/24) NOTE: A lot of un deterministic behaviour as it stands. Append Entries only sends empty entries to all nodes, just for the sake of testing for now. The cluster remains stable up till a point, and after that all nodes start fighting over leadership like children. Need to read the TLA spec for raft and the paper carefully. Good progress so far

---

## 21/12/2024 Almost There

```text
commit 462a4be4
Author: bwaklog <aditya.mh@outlook.com>
Date:   Sat Dec 21 02:01:25 2024 +0530

feat: Leader Election
```

So small update, finally finished my exams and have gotten back at this. And looks like we finally have some sort of a leader election working along with replication logs for _heart-beats_ as I don't really have a working layer to take in commands from a client...still working on that part and should be up in the next commit

![leader election being stable](https://i.imgur.com/w1YVImd.jpeg)

Now there isn't really a proper testing solution for this _yet_, but the cluster shows deterministic behaviour. I still believe its not fully up-to the original spec, but that should not take much of a change.

### Reason for the previous undefined behaviour

The volatile state on server did not hold a separate timer for heartbeats. Each randomised interval for a `election_timeout` was from the range $[1, 8]$. The main `tick()` method for the raft state kept sleeping for a different randomised time in the range $[1, 8]$, a stupid mistake on my side which made the leader node wait for probably a longer amount of time than what was required.

Hence follower nodes that slept for a shorter duration are highly likely to have not recieved a heartbeat from the leader node which force them to move to a candidate state.  $t_{\text{heartbeat}} << t_{\text{election timeout}}$. I still need to pick a proper ratio to separate out these times which is currently split as $[1, 4)$ for $t_{\text{heartbeat}}$ and $[4, 8]$ for $t_{\text{election timeout}}$ which does cause some issues. The [MIT 6.5840 Spring 2024](https://pdos.csail.mit.edu/6.824/) labs do specify a proportion of $1:20 :: t_{\text{heartbeat}}:t_{\text{election timeout}}$, which i haven't really chosen for the time being. If the max duration for an election timeout were to be $10s$ that would make the max duration for a heartbeat $0.5s$ ish...

<br />

Now here comes part two of this problem which went over my head. When a _server_ recieves an `AppendEntriesRPC` request, the first condition check is the comparing the _node terms_. A server has to reject an append rpc if the request term is lower than the current server term, the condition missing was that it was willing to reject a request regardless of the `NodeRole`. So a candidate that goes haywire would keep going to a higher term whilst receiving heartbeats from a Leader in a _lower term_.

Another minor mistake was not resetting the `election_timeout` timer and `recieved_heartbeat` boolean value that are a condition for a follower to candidate transition right after voting. Normally you send an empty heartbeat to all followers after receiving a quorum of votes, but as the heartbeats are sent out more frequently and wont give a chance for a server (i.e. a follower) to have its election timer to timeout, no un-necessary transitions will take place. I still feel that i'm overlooking this issue, and it can come and bite me in the back, but it should be a simple fix.

### Up next

With most of this out of the way, I can start giving some time to working on the KV layer of this project. I want to focus on the internals of databases, so thats a small diversion I don't want to take for the time being. Besides that, I do need a working client to append to this raft log, so the KV will require some changes.

The next challenge lies in defining a proper message delivery system for committed raft entries. How do I deliver an entry to the application once consensus has been reached.

The goal of this is to have the consensus layer function as a asynchronous worker thread on a server that acts as a middleman for applying updates to state of an application.

When tries to change state of an application, it is first passed onto the consensus layer, so it is the responsibility of the consensus layer to pass this down once it has finished its task of replication as we don't want the KV to waste time in polling through the log of raft entries and find which of the log entries are _freshly_ committed and can apply it to the state of its application. Such a system needs to work asynchronously in the background

## 24/12/2024 1:30am

Small update before heading into a Christmas vacation. Partially got log replication to work, no leader commits have been implemented. So what do I mean by partially? I have not fully tested this yet, this is just a very early commit so I don't loose my progress. 

![Partially working log replication](https://i.imgur.com/Cz2mLRO.jpeg)
You might want to zoom into that image for a better look. 

In the above image, the third horizontal pane is the only leader in the cluster which has taken set operations in the order `set foo baz`, `set foo bar`, `set apple red`. Do note that there is no current compaction RPC

> WIP: Insert some hand drawn images here explaining replication

The mistake that I made was that I have been following the concept of the base index of being 1 only in some places, because of this mismatch of logic, lots of things went wrong. While basic replication works, I still haven't tested out replication in leadership changes in a cluster. Ironically have lesser time to work on this during a vacation than my endsems 😵‍💫

Whats wrong currently? So a node is able to continue replication even after re-election. But the problem comes when a node disconnects from a cluster. As persistence is somewhat broken at the time being and since a leader expects that all the logs are up to date, a node starting back after a crash will have a completely empty set of logs. What is to be done is, incase if a node rejects an entry, we need to decrease the `next_index` on the leaders side and keep retrying until we can successfully replicate the log.

> If AppendEntries fails because of log inconsistency: decrement nextIndex and retry (§5.3)

## 24/12/2024 8:20pm

Clocking in just before my break, and finally have some good log replication. Took a few minutes to change all the indices to be logically based off with index 1. Don't fully like what i've written but i'll focus on optimizing this later.

![Log replication with fixed indices](https://i.imgur.com/NI2gmWB.jpeg)
Log replication commit [ce3fc164](https://github.com/bwaklog/quaso/commit/ce3fc164f08aee7ce997aee1a66e00de22cb6506)

In the above image:
- Cluster elects node $32$ as the leader for term $1$. Client sends the following commands `set foo bar` right before the server is manually stopped and restarted
- Cluster elects node $64$ as its leader for term $2$. Client sends `set bar baz` which is replicated. The server is stopped and restarted
- Cluster elects $32$ for term 3 after which the client sends `set baz foo`

```text
commit ce3fc164f08aee7ce997aee1a66e00de22cb6506 (HEAD -> main, origin/main)
Author: bwaklog <aditya.mh@outlook.com>
Date:   Tue Dec 24 20:27:07 2024 +0530

    feat: Log replication

    Pending
    - log replication when client has to rewrite over conflicting logs
    - write leader commit logic
    - handle a delivery callback to update the underlying state
```

## 24/12/2024 11:07pm

Finally can wrap a part of this up. Persistence is working (commit [837db316](https://github.com/bwaklog/quaso/commit/837db316a1b79146bbdce87480eb3e2e05920ea5)), so is log replication and leader election. Whats left is leader commits which should not be hard. The tricky part remaining is the deliver function callbacks. Good wrap up before Christmas eve 🎄

<div class="vide-container">
	<iframe width="560" height="315" src="https://www.youtube.com/embed/yZ80jvBqrOI?si=FifsrEaxUxIVB-1G" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
</div>

---
## 04/01/2025

```text
commit 6a123051e70c2e3c58bc2d30ee8a72b7c2713cd1
Author: bwaklog <aditya.mh@outlook.com>
Date:   Sat Jan 4 13:15:35 2025 +0530

    feat(wip): Leader Commits
```

Also fixed state persistence where I was initially persisting the entire log length to the disk

## 08/01/2025

```text
commit 3b26e5487cabe65290d25630cba5257e0a2ada95
Author: bwaklog <aditya.mh@outlook.com>
Date:   Wed Jan 8 21:37:54 2025 +0530

    feat: Message delivery to underlying application
```

This required a bit on how the key value store functions, which needed a change to work with multiple background tasks and also with how the ownership model worked. The solution was basically threads and `tokio::select!` is super helpful.

What is needed is:
- Raft needs to "deliver" messages of a newly committed log to the underlying state

![delivery mechanism](https://i.imgur.com/mHvYLpj.png)

- A separate channel to handle message delivery from incoming clients. This isnt really a decision on how the raft struct is architecture, but does have some influence on how it can be used

Now on the kv store side, not really optimized but here is a simple switch between a client and raft channel

```rust
pub async fn generic_handler_interface(&mut self) {
	let deliver_rx = Arc::clone(&self.deliver_rx);
	let mut deliver_rx = deliver_rx.lock().await;

	let client_rx = Arc::clone(&self.client_rx);
	let mut client_rx = client_rx.lock().await;

	loop {
		tokio::select! {
			Some(client_message) = client_rx.recv() => {
				self.handle_client(client_message).await;
			}
			Some(raft_message) = deliver_rx.recv() => {
				self.apply(raft_message).await;
			}
		}
	}
}
```

## Wrapping Up

The changes made were now to accommodate the previously mentioned generic handler on the KV store side which selects between a TCP client request or a message delivery via the deliver receiver. The raft state holds the transmitter and keeps pushing down this channel whenever a new log index is committed

```rust
if min_match_index > current_commit {
    for i in current_commit..min_match_index.0 {
      let deliver_tx = self.deliver_tx.lock().await;
       let _ = deliver_tx
					       .send(state.persistent_state.log[i].clone());
    }

    state.volatile_state.commited_index = min_match_index
			    .clone()
			    .to_owned();
}
```

The `min_match_index` here refers to the largest log index on all peers/followers till which, all previous log indexes are _acknowledged_ and ready to be committed. If larger, the state machine delivers _via_ the channel all the messages from the previous _commit index_ on the leader up-to the _match index_. Once all delivered the commit index shifts updates itself. 

The same logic goes for a follower receiving `AppendEntriesRequest`. The followers must ensure that it discards log entries when its current log length has a mismatch with a verified leaders log length and extend its log by extending its log with the new logs part of the leader request. If the leader’s commit index has shifted ahead of the followers commit index, the follower delivers each leader committed message (which was un delivered on the followers side) to the underlying application.

![](https://raw.githubusercontent.com/bwaklog/quaso/refs/heads/main/resources/docker_cluster.png)

> **QOL**
> 
> To make testing and getting a cluster up easier, all I’ve managed to move the binary to a docker image and run the raft cluster as a network of containers. Another size optimization I’ve learnt as of lately for docker images is having a multistage build bringing the image down to 54MB
> 
> ```text
> docker pull bwaklog/quaso:latest
> docker run \
>		--rm -it \
>		--network bridge \
>		--privileged \
>		bwaklog/quaso:latest
> ```

---

# *References*

> Repository: [bwaklog/quaso](https://github.com/bwaklog/quaso)

- In Search of an Understandable Consensus Algorithm
(Extended Version): [paper link](https://raft.github.io/raft.pdf)
- Phil Eaton’s raft implementation [github](https://github.com/eatonphil/raft-rs)

<div class="cite-block">

I’d also like to thank [@anirudhrowjee](https://github.com/anirudhrowjee) and [@anirudhsudhir](https://github.com/anirudhsudhir) who i’ve been in discussions with during this implementation

</div>