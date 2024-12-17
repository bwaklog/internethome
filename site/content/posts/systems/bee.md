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

## A much needed Introduction to this Blog

As I said, this is work in progress. The stupid reality where I open source my progress and not the repository that I'm working on in shame, definitely working witha [garrage door open](https://notes.andymatuschak.org/Work_with_the_garage_door_up). This section is still 🏗️

![XKCD comic 350](https://imgs.xkcd.com/comics/network.png)
[XKCD comic 350](https://xkcd.com/350/)

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

```sh
Benchmark 1: ./target/release/bee
  Time (mean ± σ):       1.4 ms ±   0.0 ms    [User: 0.6 ms, System: 0.5 ms]
  Range (min … max):     1.3 ms …   1.7 ms    904 runs
```

---

## Back at it again...changing everything

With everything basically scrapped, except that one beautiful yaml parser I wrote with the `yaml_rust2` and learning a bit more after not finish advent of code once again, I felt it would be a great time to rewrite this for fun during my end semesters...which is still going on as I write this line.

So witha lot of undesirable behaviour, and exams this project had to come to a hold. Started the whole thing with a fresh repository and began working on a more genralised raft library. Some small changes included using bincode for serialization instead of message pack showing significantly faster serialization speeds than messagepack.

```rust
#[tarpc::service]
trait Server<T> {
    // ...
    fn ping_example(&self, req: AppendEntries<T>) -> Response;
    // ...
}
```

Having a generalised raft library meant serializing bytes and sending generic logs over TCP, which isn't really that hard. But tarpc didn't really like doing this as it never really allowed me to write generic traits for a server, which was ofcourse needed. Instead of this, wouldn't it be easier to just, excuse my words, raw dog the bytes over tcp??

If I can write my own _rpc like_(definitely not RPC) layer then, I technically have all the flexibility I need to have, couldn't be that hard considering its all just bytes sent over network, and deserialization works if and only if the types on both the sides are correct. As of now, there is absolutely no type validation on client and server side besides the `tokio::task` that has the server running panics out of existence while the task of the application is still running. Ofcourse not desireable but hey, this is still in a toy stage, wont hurt to experiment

Just to point out to those who have not seen my other f ups while doing something like this, the last time I tried writing a protocol with pure tcp and marshalled json bytes across a network [did not end very nicely](https://hegde.live/posts/systems/inginy12), infact never managed to send bytes across because go never warned me about private fields in a struct don't get serialized at all, thats really fun to learn about almost a year after a wasted hackathon, but hey you always learn something at the wrong times


Why all this, well lets see how elegantly you can now define a niave type in rust and have raft as a consensus layer

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
    T: Entry + Debug + Display + Serialize + DeserializeOwned + Clone,
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

Now lets have a look of what we can do on the server side for an incomming TCP request

```rust
#[allow(unused)]
impl<T> Server<T>
where
    // why `static, I basicaly enforce that T is always of an owned type,
    // otherwise the compiler runs in the assumption that T could be of type
    // &T, &&T, &mut T,... which is obviously never the case
    T: 'static + Entry + Debug + Display + Serialize + DeserializeOwned + Send + Clone,
{
    pub async fn start_listener(node_id: NodeId, state: Arc<Mutex<State<T>>>, addr: SockAddr) {

        let listener = TcpListener::bind(addr)
            .await
            .unwrap();

        // Yes, I know...lots of nesting and needs a cleanup
        tokio::spawn(async move {
            loop {
                if let Ok((mut stream, _)) = listener.accept().await {
                    let mut buf: Vec<u8> = Vec::new();
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
                    let _ = stream.shutdown().await;
                }
            }
        })
    }
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

> (17/12/24) NOTE: A lot of undeterministic behaviour as it stands. Append Entries only sends empty entries to all nodes, just for the sake of testing for now. The cluster remains stable up till a point, and after that all nodes start fighting over leadership like children. Need to read the TLA spec for raft and the paper carefully. Good progress so far
