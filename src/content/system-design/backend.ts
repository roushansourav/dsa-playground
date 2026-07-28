import type { SystemDesignQuestion } from "../types";

export const backendSystemDesignQuestions: SystemDesignQuestion[] = [
  {
    slug: "url-shortener",
    title: "Design a URL Shortener",
    category: "backend",
    difficulty: "easy",
    maangTags: ["Google", "Amazon"],
    order: 1,
    summary:
      "Design a service like bit.ly that maps long URLs to short, shareable aliases and redirects users at scale.",
    requirementsMarkdown: `## Functional Requirements
- Given a long URL, generate a unique short URL (e.g., \`https://short.ly/aZ9k1\`).
- Given a short URL, redirect the client to the original long URL.
- Support optional custom aliases and link expiration dates.
- Track basic click analytics (count, referrer, timestamp) without slowing down redirects.

## Non-Functional Requirements
- **High availability** — redirects must never go down; links get shared for years.
- **Low latency reads** — a redirect should feel instant, well under 100ms.
- **Uniqueness** — no two long URLs silently collide on the same short code.
- **Read-heavy** — reads (redirects) vastly outnumber writes (new shortens), often 100:1 or more.

## Back-of-the-envelope Estimation
- 500M new URLs/month ≈ ~200 writes/sec average.
- At a 100:1 read/write ratio ≈ ~20K redirect reads/sec average, several times that at peak.
- Storing 500M URLs/month for 5 years ≈ 30B records; at ~500 bytes/record ≈ 15TB total.`,
    highLevelDesignMarkdown: `## API
- \`POST /api/shorten { longUrl, customAlias?, expiresAt? } -> { shortUrl }\`
- \`GET /{shortCode} -> 301/302 redirect to longUrl\`

## Components
- Load balancer in front of stateless API servers so any instance can serve any request.
- An encoding service that generates a unique short code for each new long URL.
- A key-value store as the source of truth: \`shortCode -> longUrl\`.
- A cache layer (Redis) in front of the store for hot redirects.
- An async analytics pipeline: click events are pushed onto a queue (e.g. Kafka) and aggregated by a separate consumer, so the redirect hot path never blocks on writing analytics.

## Data Model
- Table \`urls\`: \`shortCode\` (PK), \`longUrl\`, \`userId\`, \`createdAt\`, \`expiresAt\`.
- Short code generation options: base62-encode an auto-increment ID, hash the long URL and truncate with collision retry, or hand out codes from a pre-generated pool managed by a dedicated key-generation service.`,
    deepDivesMarkdown: `## Choosing the Shortening Strategy
- **Base62 counter**: globally unique by construction, but a single incrementing counter is a bottleneck and single point of failure at scale. Mitigate with a Snowflake-style distributed ID generator, or shard counter ranges across key-generation servers that each hand out a local block of IDs.
- **Hash + collision check**: hash the long URL (e.g. MD5), truncate to ~7 characters, and check-and-retry with a salt on collision. Simpler to reason about, but needs a uniqueness check on every write.

## Caching the Redirect Path
- The redirect path is the one path that must stay fast under all conditions. Cache \`shortCode -> longUrl\` in Redis with a generous TTL; on a miss, read through to the database and populate the cache.
- Popular links follow a power law — a small number of short codes account for most traffic — so a modestly sized LRU cache captures the bulk of the hit rate.

## 301 vs 302 Redirects
- \`302\` (temporary) lets the server run analytics/expiration checks on every hit and swap the destination later. \`301\` (permanent) lets browsers cache the redirect and skip the server entirely on repeat visits — faster for the user, but it kills click tracking and expiration. This is a genuine product trade-off, not just an HTTP technicality.`,
    tradeoffsMarkdown: `## SQL vs Key-Value Store
- The access pattern is a single-key lookup (\`shortCode -> longUrl\`) with no joins — exactly what a key-value store (DynamoDB, Cassandra) is built for. A relational database works fine at moderate scale too, but carries overhead this workload doesn't need.

## Counter-Based vs Random Codes
- Counter-based codes are sequential and guessable, which can leak how many URLs exist and invites scraping. Random codes avoid this but require a collision check on write — a security/simplicity trade-off.

## Strong vs Eventual Consistency
- A short propagation delay between "shorten" and "redirect works everywhere" is acceptable for this product. Choosing eventual consistency lets multi-region replication favor availability without a cross-region consistency bottleneck.`,
    realWorldExamplesMarkdown: `- **bit.ly** supports custom domains and aliases, with click analytics collected asynchronously so link resolution stays fast.
- **TinyURL** popularized the base62 counter approach at internet scale.
- **Google's goo.gl** (retired) operated across regions with heavy caching, showing that even a conceptually "simple" service needs serious infrastructure once it is globally distributed and read-heavy.`,
    relatedSlugs: ["rate-limiter", "distributed-cache"],
  },
  {
    slug: "rate-limiter",
    title: "Design a Rate Limiter",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Google", "Amazon", "Meta"],
    order: 2,
    summary:
      "Design an API rate limiter that throttles clients to a configured number of requests per time window, protecting backend services from abuse and overload.",
    requirementsMarkdown: `## Functional Requirements
- Limit each client (by API key, user ID, or IP) to N requests per time window (e.g., 100 requests/minute).
- Reject requests over the limit with \`HTTP 429\` and a \`Retry-After\` header.
- Support different limits per API endpoint or client tier (free vs. paid).

## Non-Functional Requirements
- **Low added latency** — the limiter sits on every request's hot path, so its own overhead must be sub-millisecond.
- **Accuracy under distribution** — the limit must hold even when requests for one client land on different servers.
- **High availability** — if the limiter's own store is unreachable, the system should fail open or closed based on a deliberate policy, not by accident.
- **Scalability** — must handle millions of tracked clients and requests per second.

## Back-of-the-envelope Estimation
- 10M active API keys, each capable of bursting to their limit ⇒ counter state for 10M keys must be cheap to store and update (a few bytes each, comfortably fits in memory across a Redis cluster).
- At 1M requests/sec system-wide, every request needs one fast read-modify-write against the limiter's counter store.`,
    highLevelDesignMarkdown: `## API
- Implemented as **middleware** in front of application servers, not a public API: every incoming request is checked before it reaches business logic.
- Response on rejection: \`429 Too Many Requests\` with a \`Retry-After\` header telling the client when to try again.

## Components
- A shared, low-latency counter store (Redis) reachable from every API server, since limits must be enforced across the whole fleet, not per-instance.
- Rate-limiting logic executed as a Lua script inside Redis so the check-and-increment is atomic in one round trip.
- A rules service/config store mapping client tier and endpoint to limit + window, so limits can change without a code deploy.

## Data Model
- Redis key per (clientId, endpoint) storing either a simple counter with a TTL (fixed window) or a sorted set of request timestamps (sliding window log).
- Rules stored as \`{ tier, endpoint } -> { limit, windowSeconds }\`, cached locally on each API server with a short TTL to avoid a config lookup on every request.`,
    deepDivesMarkdown: `## Algorithm Choice
- **Fixed window counter**: increment a counter per window, reset on expiry. Cheap, but allows up to 2x the limit in a burst straddling a window boundary.
- **Sliding window log**: store a timestamp per request in a sorted set, count entries in the trailing window. Accurate, but memory grows with request volume per client.
- **Sliding window counter**: approximate the sliding window using a weighted average of the current and previous fixed windows — most of the accuracy of the log approach at a fraction of the memory.
- **Token bucket**: a bucket refills at a fixed rate and each request consumes a token; naturally allows short bursts up to the bucket size while enforcing a long-run average rate, which is why it's the most common choice for public APIs.

## Enforcing Limits Across a Distributed Fleet
- If each API server tracked its own counters in memory, a client could get N times the limit by spreading requests across N servers. The counter state must live in a shared store (Redis) so every server sees the same count.
- The check-and-increment must be atomic — a Lua script executed inside Redis avoids a race where two servers both read "under limit" concurrently and both allow the request.

## Fail-Open vs Fail-Closed
- If the shared counter store itself becomes unavailable, the system must choose deliberately: fail open (allow all requests, risking overload) or fail closed (reject all requests, risking a false outage). Most production systems fail open for a short grace period, since an overload risk is usually preferable to a hard outage of a fully working backend.`,
    tradeoffsMarkdown: `## Redis vs In-Memory Local Counters
- Local, per-server counters are the fastest option (no network hop) but only enforce the limit approximately across a fleet. Centralized Redis counters are accurate globally but add a network round trip to every request — most systems accept that cost since Redis latency is sub-millisecond and the correctness win is worth it.

## Token Bucket vs Sliding Window
- Token bucket is simpler to implement and tolerates bursts gracefully, which fits human/browser traffic patterns. Sliding window (log or counter) is stricter about the true rate over any window, which matters more for protecting against sustained abuse than for typical client fairness.

## Client-Level vs Endpoint-Level Granularity
- A single global limit per client is simple but lets one expensive endpoint starve out cheap ones. Per-(client, endpoint) limits are more precise but multiply the amount of state tracked — a trade-off between fairness/isolation and storage/complexity.`,
    realWorldExamplesMarkdown: `- **Stripe's API** documents a token-bucket-style limiter and returns \`Retry-After\` headers, letting client SDKs back off automatically.
- **GitHub's REST API** exposes remaining quota via \`X-RateLimit-Remaining\` headers so clients can self-throttle before hitting the wall.
- **Cloudflare** implements rate limiting at the edge, in front of origin servers, so abusive traffic is dropped before it ever reaches backend infrastructure.`,
    relatedSlugs: ["url-shortener", "distributed-cache", "distributed-message-queue"],
  },
  {
    slug: "distributed-cache",
    title: "Design a Distributed Cache",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Meta", "Amazon", "Netflix"],
    order: 3,
    summary:
      "Design a horizontally scalable, in-memory distributed cache (like Memcached or Redis Cluster) that sits in front of a slower database.",
    requirementsMarkdown: `## Functional Requirements
- Support \`get(key)\`, \`set(key, value, ttl)\`, and \`delete(key)\` with millisecond latency.
- Scale horizontally across many nodes as data volume and request rate grow.
- Evict entries under memory pressure using a defined policy (e.g., LRU).
- Survive individual node failure without losing the whole cache.

## Non-Functional Requirements
- **Low latency** — sub-millisecond reads/writes; this is the entire reason a cache exists.
- **High throughput** — must handle orders of magnitude more requests than the database behind it.
- **Horizontal scalability** — adding nodes should linearly increase capacity and throughput.
- **Acceptable staleness** — cached data can lag the source of truth briefly; this is an explicit, accepted trade-off for speed.

## Back-of-the-envelope Estimation
- 100M cacheable objects, ~1KB average ⇒ ~100GB of hot data, distributed across, say, 10 nodes with ~10GB each — comfortably fits in memory per node.
- A read-heavy application serving 500K reads/sec pushes ~50K reads/sec per node at 10 nodes — well within a single Redis/Memcached instance's capability.`,
    highLevelDesignMarkdown: `## API
- Client library exposes \`get\`, \`set\`, \`delete\`; internally it hashes the key to pick the owning node and talks to it directly (no central router in the hot path).

## Components
- A cluster of cache nodes, each holding an in-memory hash table (key -> value + TTL).
- A partitioning layer (consistent hashing) that maps keys to nodes and is shared by every client so they all agree on cache node ownership.
- A membership/health-check mechanism so clients learn when a node joins or leaves the ring.
- Optional replication: each key's data is also stored on the next node(s) around the hash ring, so a single node failure doesn't lose that data.

## Data Model
- In-memory hash map per node: key -> (value, expiry timestamp).
- Eviction metadata: an LRU list (or approximate LRU via sampling, as in Redis) to decide what to evict when a node hits its memory limit.`,
    deepDivesMarkdown: `## Consistent Hashing for Partitioning
- A naive \`hash(key) % numNodes\` scheme reshuffles nearly every key when a node is added or removed, causing a cache-wide stampede to the database. Consistent hashing places both nodes and keys on a hash ring so that adding/removing a node only remaps the keys between it and its neighbor — a small, bounded fraction of the total keyspace.
- Virtual nodes (each physical node claims many points on the ring) smooth out load distribution, since a small number of physical nodes on a plain ring can otherwise end up with very uneven key ranges.

## Cache Invalidation and the Thundering Herd
- When a hot key expires, many concurrent requests can all miss the cache simultaneously and hammer the database at once (the "thundering herd"). Mitigations: a short-lived lock so only one request repopulates the cache while others wait or serve slightly stale data; or staggering TTLs with jitter so expirations don't cluster.

## Eviction Policy Under Memory Pressure
- LRU approximates "keep what's likely to be used again," but exact LRU requires a doubly linked list touched on every access, which adds overhead. Redis instead samples a handful of keys and evicts the oldest among them — approximate LRU that is nearly as effective at a fraction of the bookkeeping cost.`,
    tradeoffsMarkdown: `## Cache-Aside vs Write-Through
- **Cache-aside** (lazy loading): the application checks the cache first and populates it on a miss. Simple and only caches what's actually requested, but the first request after eviction always pays the full database latency.
- **Write-through**: every write goes to the cache and the database together, so the cache is never stale for written keys. Adds write latency and caches data that may never be read.

## Consistency vs Latency
- Keeping the cache and database perfectly in sync would require a distributed transaction on every write, defeating the purpose of caching. Accepting brief staleness (a TTL-bounded window of inconsistency) is the trade a distributed cache is built around.

## Replication Factor
- Replicating each key to more nodes improves availability (survives more simultaneous failures) and read throughput, at the cost of more memory and write amplification. Most systems replicate to 2-3 nodes as a balance.`,
    realWorldExamplesMarkdown: `- **Memcached at Facebook/Meta** scales to thousands of nodes serving trillions of requests a day in front of MySQL, using consistent hashing and client-side sharding described in their "Scaling Memcache at Facebook" paper.
- **Redis Cluster** implements sharding via hash slots (16384 slots mapped to nodes) rather than pure consistent hashing, trading some flexibility for simpler resharding logic.
- **Amazon ElastiCache** offers both Memcached and Redis as managed distributed caches in front of RDS/DynamoDB-backed services.`,
    relatedSlugs: ["key-value-store", "url-shortener", "rate-limiter"],
  },
  {
    slug: "key-value-store",
    title: "Design a Distributed Key-Value Store",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Amazon", "Google"],
    order: 4,
    summary:
      "Design a horizontally scalable, fault-tolerant key-value store (in the spirit of DynamoDB or Cassandra) that stays available under node and network failures.",
    requirementsMarkdown: `## Functional Requirements
- \`put(key, value)\` and \`get(key)\` with no relational queries or joins required.
- Data is partitioned (sharded) across many nodes and replicated for durability.
- The system continues serving reads and writes even when some nodes are unreachable.

## Non-Functional Requirements
- **High availability** — favor availability over strict consistency during partitions (an AP system in CAP terms), since the target use cases (e.g. shopping carts, session data) tolerate brief staleness far better than downtime.
- **Horizontal scalability** — adding nodes increases capacity and throughput close to linearly.
- **Durability** — a write acknowledged to the client must survive the failure of any single node.
- **Tunable consistency** — clients can trade off latency for consistency per operation.

## Back-of-the-envelope Estimation
- 1B keys, ~1KB average value ⇒ ~1TB of raw data, tripled by replication ⇒ ~3TB across the cluster.
- 100K writes/sec at a replication factor of 3 ⇒ 300K replica writes/sec to distribute across nodes.`,
    highLevelDesignMarkdown: `## API
- \`PUT /keys/{key}\` and \`GET /keys/{key}\`, plus internal replica-sync RPCs between nodes — no query language, no joins.

## Components
- A consistent-hash ring partitioning keys across nodes, with each key's data replicated to the next N-1 nodes clockwise on the ring (the "preference list").
- A coordinator node (any node can act as coordinator for a request) that forwards reads/writes to the appropriate replicas and collects quorum responses.
- A gossip protocol for cluster membership and failure detection, so every node eventually learns about joins, leaves, and failures without a single central coordinator.
- A background anti-entropy process (e.g. Merkle trees) that detects and repairs replicas that have drifted out of sync.

## Data Model
- Each node stores its shard as a local log-structured store (an LSM tree, as in Cassandra/RocksDB) optimized for high write throughput.
- Each value is tagged with a vector clock or a simple timestamp to detect and resolve conflicting concurrent writes to the same key.`,
    deepDivesMarkdown: `## Quorum Reads and Writes (N, R, W)
- With replication factor N, a write is acknowledged once W replicas confirm it, and a read queries R replicas and returns the most recent. Choosing \`R + W > N\` guarantees every read overlaps with the most recent write on at least one replica — "quorum consistency."
- Tuning R and W lets each operation trade latency for consistency: W=1 gives fast, less durable writes; W=N gives durable but slower writes that block on the slowest replica.

## Handling Conflicting Writes
- During a network partition, two clients might write to the same key on different replicas, producing two "latest" versions when the partition heals. Vector clocks let the system detect this as a genuine conflict (rather than one write simply overwriting another) and either resolve it automatically (last-writer-wins by timestamp) or surface both versions to the application to merge (as DynamoDB historically did for shopping carts).

## Hinted Handoff and Replica Repair
- If a replica is temporarily down when a write arrives, another node can accept the write on its behalf ("hinted handoff") and replay it once the original replica recovers, preserving availability without permanently losing the write.
- Anti-entropy repair (Merkle tree comparison between replicas) finds and fixes divergence that accumulates from hinted handoff, dropped messages, or extended outages, without comparing every key individually.`,
    tradeoffsMarkdown: `## CAP: Availability vs Consistency
- During a network partition, the system must choose: keep serving reads/writes on both sides of the partition (availability, accepting temporary inconsistency) or refuse requests that can't be guaranteed consistent (consistency, accepting reduced availability). This design leans AP, matching Dynamo's original design goals for shopping-cart-like workloads.

## LSM Trees vs B-Trees for Storage
- LSM trees (append-only writes, periodic compaction) favor very high write throughput at the cost of read amplification and background compaction overhead — a good fit for a write-heavy distributed store. B-trees favor read latency and in-place updates but pay more per write, which matters less here since reads are served from replica quorums with retries anyway.

## Client-Resolved vs Server-Resolved Conflicts
- Automatic last-writer-wins resolution is simple and requires no application changes, but can silently drop a legitimate concurrent write. Exposing conflicting versions to the client (as with vector clocks) preserves all information but pushes merge logic into every application that uses the store.`,
    realWorldExamplesMarkdown: `- **Amazon DynamoDB**, evolved from the original Dynamo paper, uses consistent hashing, tunable quorum consistency, and vector-clock-style conflict tracking under the hood.
- **Apache Cassandra** directly implements Dynamo-style partitioning and gossip alongside a Bigtable-style LSM storage engine, and is used at companies like Netflix and Meta for high-write-throughput workloads.
- **Riak** was built explicitly as an open-source implementation of the Dynamo paper's architecture.`,
    relatedSlugs: ["distributed-cache", "distributed-message-queue"],
  },
  {
    slug: "distributed-message-queue",
    title: "Design a Distributed Message Queue",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Amazon", "Meta"],
    order: 5,
    summary:
      "Design a durable, high-throughput publish-subscribe message queue (in the spirit of Kafka or SQS) that decouples producers from consumers.",
    requirementsMarkdown: `## Functional Requirements
- Producers publish messages to named topics/queues; consumers subscribe and read messages, potentially in independent consumer groups.
- Messages are durable — once acknowledged to a producer, a message survives broker restarts and individual node failure.
- Support at-least-once delivery, and ideally exactly-once processing semantics for consumers that need it.

## Non-Functional Requirements
- **High throughput** — must sustain very high sustained write rates (hundreds of thousands of messages/sec) with sequential, not random, disk I/O.
- **Durability** — acknowledged messages must not be lost even if the broker that received them crashes immediately after.
- **Ordering guarantees** — at least within a partition/shard, messages should be delivered in the order they were produced.
- **Backpressure handling** — slow consumers should not cause producers to lose data; the queue absorbs the mismatch in rates.

## Back-of-the-envelope Estimation
- 1M messages/sec system-wide at 1KB average ⇒ ~1GB/sec of write throughput, which is why real implementations rely on sequential disk writes and OS page cache rather than random-access databases.
- Retaining 7 days of a 1GB/sec stream ⇒ ~600TB of retained log data across the cluster.`,
    highLevelDesignMarkdown: `## API
- Producers: \`publish(topic, key?, payload)\`.
- Consumers: \`subscribe(topic, consumerGroup)\` then \`poll()\` in a loop, periodically committing the offset up to which they've processed.

## Components
- Topics are split into **partitions**, each an append-only log stored on disk in strict order; partitioning is what makes the system horizontally scalable.
- Each partition is replicated across multiple broker nodes, with one elected leader handling all reads/writes for that partition and followers replicating from it.
- Consumer groups: each partition is consumed by exactly one consumer within a group at a time, so a group's total throughput scales by adding partitions/consumers.
- A metadata/coordination layer (e.g. ZooKeeper or a built-in Raft-based controller) tracks partition leadership and group membership.

## Data Model
- Each partition is an append-only log of (offset, key, payload, timestamp) records, stored sequentially on disk and never modified in place — only appended to and, eventually, trimmed by a retention policy.
- Consumer offsets (how far each consumer group has read) are themselves stored durably, often in a special internal topic, so a restarted consumer resumes where it left off.`,
    deepDivesMarkdown: `## Why Partitioned, Append-Only Logs
- Sequential disk writes are dramatically faster than random writes, even on SSDs, because they avoid seek overhead and play well with OS read-ahead/write-back caching. An append-only log turns every write into a sequential append, which is the core trick behind high-throughput queues like Kafka.
- Partitioning a topic lets the system parallelize both writes (different partitions on different brokers) and reads (different consumers in a group each own a subset of partitions), which is what makes throughput scale horizontally rather than being capped by one machine's disk.

## Delivery Semantics: At-Least-Once vs Exactly-Once
- At-least-once is the natural default: a consumer processes a message, then commits its offset; if it crashes between those two steps, the message is redelivered on restart. This means consumers must be idempotent (safe to process the same message twice) unless stronger guarantees are added.
- Exactly-once typically requires either transactional writes that atomically commit both the processed output and the consumer offset together, or an idempotency key on the consumer side that de-duplicates reprocessed messages.

## Replication and Leader Election
- Each partition has a leader broker and a set of in-sync replicas (ISRs) that have fully caught up. A write is only acknowledged once it's replicated to a configurable number of ISRs, trading latency for durability.
- If the leader fails, a new leader is elected from the ISR set; only replicas that were fully caught up are eligible, so no acknowledged data is lost in the failover.`,
    tradeoffsMarkdown: `## Pull-Based vs Push-Based Consumption
- Pull-based consumers (as in Kafka) control their own pace, naturally handling backpressure — a slow consumer just polls less often without overwhelming itself. Push-based delivery (broker pushes to consumers) can deliver lower latency but risks overwhelming a slow consumer unless the broker implements its own flow control.

## Number of Partitions
- More partitions increase parallelism (more consumers can work concurrently) but also increase per-partition overhead (more open file handles, more replication traffic, longer leader-election windows) and can hurt ordering guarantees, since ordering is only guaranteed within a partition, not across the whole topic.

## Log Retention: Time-Based vs Size-Based
- Retaining messages for a fixed time window lets consumers replay recent history (useful for reprocessing or new consumers joining), at the cost of disk space proportional to both time and throughput. Size-based retention bounds disk usage directly but makes "how far back can I replay" unpredictable as throughput changes.`,
    realWorldExamplesMarkdown: `- **Apache Kafka** is the canonical implementation of this design — partitioned logs, consumer groups, and leader/ISR replication — used at LinkedIn, Netflix, and Uber for event streaming at massive scale.
- **Amazon SQS** trades some of Kafka's ordering/replay guarantees for operational simplicity as a fully managed queue, popular for decoupling microservices.
- **Amazon Kinesis** mirrors the partitioned-log model (calling partitions "shards") as a managed streaming service integrated with AWS Lambda and other consumers.`,
    relatedSlugs: ["key-value-store", "notification-system", "distributed-task-scheduler"],
  },
  {
    slug: "notification-system",
    title: "Design a Notification System",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Meta", "Amazon", "Apple"],
    order: 6,
    summary:
      "Design a system that delivers push, email, and SMS notifications to millions of users reliably and without spamming them.",
    requirementsMarkdown: `## Functional Requirements
- Accept notification requests from many internal services (order shipped, new comment, friend request) and deliver them via push, email, and/or SMS.
- Respect user preferences (channel opt-outs, quiet hours) and avoid duplicate/spammy delivery.
- Support both immediate, transactional notifications and large batch/marketing sends to millions of users.

## Non-Functional Requirements
- **Reliability** — a notification, once accepted, should be delivered or clearly reported as failed; internal services shouldn't need to retry delivery themselves.
- **Scalability for bursts** — a single event (e.g. a viral post) can trigger millions of notifications nearly simultaneously.
- **Low latency for transactional notifications** — a "your OTP code" push should arrive in seconds, even while a marketing batch is being processed.
- **Third-party rate limits** — must respect the throughput limits of downstream providers (APNs, FCM, email/SMS gateways).

## Back-of-the-envelope Estimation
- 500M users, average 5 notifications/day ⇒ 2.5B notifications/day ≈ ~30K/sec average, with bursts far higher during viral events.
- Each notification is small (a few hundred bytes of payload plus metadata), so storage is dominated by delivery logs/receipts, not payload size.`,
    highLevelDesignMarkdown: `## API
- Internal services call \`POST /notifications { userId, type, payload, channels? }\`; the notification service decides final channel(s) and timing, not the caller.

## Components
- A notification API that validates the request and writes it to a durable queue rather than sending it synchronously, decoupling acceptance from delivery.
- Per-channel worker pools (push workers, email workers, SMS workers) that consume from the queue and call the relevant third-party provider (APNs/FCM, an email gateway, an SMS gateway).
- A preferences/user-settings service consulted before send, to filter out opted-out channels, respect quiet hours, and de-duplicate near-identical notifications.
- A retry and dead-letter mechanism for failed sends, with exponential backoff, so transient provider errors don't drop notifications silently.

## Data Model
- \`notifications\` table/log: id, userId, type, channels attempted, status per channel, timestamps.
- \`user_preferences\`: userId -> per-channel opt-in/opt-out, quiet-hours window, device tokens.`,
    deepDivesMarkdown: `## Decoupling Acceptance from Delivery
- If the API synchronously called APNs/email/SMS providers before responding, a slow or down provider would make the calling service (e.g. the order service) wait or fail. Writing the request to a queue immediately and returning success to the caller means the notification service's own reliability problems never propagate back into unrelated product flows.

## Handling Send Bursts (Fan-Out)
- A single trigger (e.g. "your team just won") can require notifying millions of users at once. This is handled as a fan-out job: a worker reads the target audience (possibly from a precomputed list or a query against the user graph) and enqueues one message per recipient, rather than trying to notify everyone in one synchronous pass.
- Worker pools are scaled independently per channel so a marketing email burst doesn't starve latency-sensitive push notifications — separate queues per channel/priority prevent head-of-line blocking.

## De-duplication and Preference Enforcement
- Multiple services might trigger overlapping notifications for the same event (e.g. both a "like" and a "comment" service reacting to one action). A dedup layer keyed on (userId, eventId, channel) within a short window collapses these before send.
- Preference checks happen as late as possible (just before actual send) rather than at request time, since user settings can change between when a notification is enqueued and when it's actually delivered, especially under a large backlog.`,
    tradeoffsMarkdown: `## Push via Queue vs Direct Synchronous Call
- Queueing adds a small amount of latency to every send (a network hop through the broker) but decouples producer and provider availability. For anything above the smallest scale, this trade is worth it — direct synchronous calls don't survive a provider outage gracefully.

## Priority Queues vs Single Queue
- Separate queues per priority (transactional vs marketing) prevent a marketing blast from delaying a password-reset push, at the cost of more queues to operate and monitor. A single queue is simpler but risks exactly this kind of head-of-line blocking.

## Precomputed Audience Lists vs Query-Time Fan-Out
- Precomputing a notification's recipient list ahead of time (e.g. nightly for a digest) makes send time fast and predictable but can be stale by send time. Computing the audience at send time is always fresh but adds latency and load to whatever service owns that data (e.g. the social graph) right at the moment of a burst.`,
    realWorldExamplesMarkdown: `- **Meta/Facebook's notification infrastructure** fans out billions of notifications per day through dedicated per-channel pipelines with aggressive de-duplication to avoid over-notifying users.
- **Amazon SNS** offers a managed pub/sub notification service that fans out a single published message to email, SMS, push, and queue subscribers.
- **Uber's notification platform** prioritizes transactional messages (trip status) over marketing sends using separate queues and worker pools, exactly to avoid the head-of-line blocking problem described above.`,
    relatedSlugs: ["distributed-message-queue", "chat-system"],
  },
  {
    slug: "chat-system",
    title: "Design a Chat / Messaging System",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Meta", "Apple"],
    order: 7,
    summary:
      "Design a real-time one-on-one and group messaging system (like WhatsApp or Messenger) with delivery guarantees and online presence.",
    requirementsMarkdown: `## Functional Requirements
- Send and receive messages in one-on-one and group conversations, in near-real-time when both parties are online.
- Deliver queued messages when an offline recipient comes back online.
- Support delivery/read receipts and basic online/offline presence indicators.

## Non-Functional Requirements
- **Low latency** — messages between online users should arrive in well under a second.
- **Durability** — a sent message must never be lost, even if the recipient is offline for days.
- **Ordering** — messages within a single conversation should arrive in a consistent order.
- **Massive concurrent connections** — hundreds of millions of devices holding an open connection simultaneously.

## Back-of-the-envelope Estimation
- 500M daily active users, each holding one persistent connection ⇒ hundreds of millions of concurrent open sockets, requiring many connection-handling servers behind a load balancer, each holding maybe 50-100K connections.
- 50B messages/day ≈ ~600K messages/sec average, several times that at peak — small payloads, so this is a throughput and fan-out problem more than a storage-volume one.`,
    highLevelDesignMarkdown: `## API
- Clients hold a persistent connection (WebSocket) to a **connection/gateway server** for real-time delivery; a REST API handles non-real-time operations like conversation history and profile lookups.

## Components
- Connection servers: each holds many long-lived client connections and maintains an in-memory map of which userId is connected to which server instance.
- A session/routing service that tracks, for any userId, which connection server (if any) currently holds their socket — needed because a message from user A to user B may need to be routed to a different physical server than the one A is connected to.
- A message queue per recipient (or per conversation) that durably stores messages so they survive a connection server restart and are available for offline delivery.
- A separate storage layer (not the queue) for full conversation history, since queues are optimized for transient delivery, not long-term storage/search.

## Data Model
- \`messages\`: id, conversationId, senderId, payload, timestamp, delivery/read status.
- \`conversations\`: id, participant list, last-message pointer (for fast conversation-list rendering).
- A per-user "connected-to" mapping (userId -> connection server ID), kept in a fast shared store (Redis) since it changes constantly and must be checked on every message send.`,
    deepDivesMarkdown: `## Routing a Message to the Right Connection Server
- With hundreds of connection servers, sender and recipient are very likely connected to different machines. When server A receives a message from user A destined for user B, it looks up B's current connection server in the shared routing table and forwards the message internally (server-to-server) to be delivered over B's live socket — or, if B isn't connected anywhere, writes it durably for later delivery.

## Guaranteeing Delivery to Offline Users
- Every message is first durably persisted (append to a per-recipient message store) before being pushed to a live connection — this way, presence status is purely an optimization for latency, never a requirement for correctness. When an offline user reconnects, the client fetches everything since its last-known message ID/timestamp (a "sync since cursor" pattern) rather than relying on a real-time push it missed.

## Ordering Within a Conversation
- Assigning a monotonically increasing sequence number per conversation (not globally) lets clients detect gaps and reorder locally, without requiring a single global lock across the whole system. Group chats extend this the same way, treating the group as just another conversation with more participants to fan a message out to.`,
    tradeoffsMarkdown: `## WebSockets vs Long Polling
- Persistent WebSocket connections give the lowest latency and lowest overhead per message once established, but require holding significant server-side connection state (memory per connection) at massive scale. Long polling is simpler to load-balance (stateless-ish HTTP requests) but adds latency and repeated connection overhead — most modern chat systems use WebSockets specifically because of the connection-count-at-scale trade being worth it for latency.

## Push-Based Delivery vs Client Pull-on-Reconnect
- Pushing messages the instant they arrive minimizes perceived latency for online users, but requires the routing infrastructure described above. Relying purely on clients polling/pulling on each reconnect is simpler but adds latency and wastes bandwidth on empty polls — a hybrid (push when connected, pull-since-cursor on reconnect) captures the benefits of both.

## Storing History in the Message Queue vs a Separate Database
- Using the delivery queue itself as the permanent history store is simpler operationally (one system) but queues are tuned for high-throughput transient storage, not efficient historical range queries or search — most systems durably archive messages into a separate database optimized for that access pattern once delivery is confirmed.`,
    realWorldExamplesMarkdown: `- **WhatsApp** famously ran on a small number of Erlang servers each holding millions of concurrent connections, exploiting Erlang's lightweight-process model for exactly this connection-handling problem.
- **Facebook Messenger** built a custom-routing layer conceptually similar to the userId -> connection-server mapping described above to fan messages across a huge connection-server fleet.
- **Signal/iMessage** layer end-to-end encryption on top of a similar store-and-forward architecture, adding key-exchange and encryption concerns on top of the same delivery-guarantee problem.`,
    relatedSlugs: ["notification-system", "distributed-message-queue"],
  },
  {
    slug: "news-feed",
    title: "Design a News Feed System",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Meta", "Google"],
    order: 8,
    summary:
      "Design a social media news feed (like Facebook or Instagram's feed) that aggregates and ranks posts from people a user follows.",
    requirementsMarkdown: `## Functional Requirements
- When a user posts, followers should eventually see it in their feed.
- When a user opens the app, render a ranked feed of recent posts from people/pages they follow.
- Support ranking beyond pure recency (engagement prediction), not just a chronological timeline.

## Non-Functional Requirements
- **Low read latency** — opening the app should render a feed in a few hundred milliseconds.
- **High write fan-out** — a single post from a celebrity with millions of followers must eventually reach all of them.
- **Eventual consistency acceptable** — it's fine if a new post takes a few seconds to appear in every follower's feed.
- **Availability over strict freshness** — showing a slightly stale feed beats showing an error or a blank screen.

## Back-of-the-envelope Estimation
- 500M daily active users opening their feed a few times a day ⇒ ~1-2B feed reads/day, each needing to be assembled and ranked quickly.
- A user with 10M followers posting once ⇒ a single write potentially fanning out into 10M feed updates — the classic "celebrity problem" this design must handle.`,
    highLevelDesignMarkdown: `## API
- \`POST /posts { content }\` to publish.
- \`GET /feed\` to retrieve the current user's ranked feed.

## Components
- A post service that stores the canonical post and publishes a "new post" event.
- A fan-out service that, for most users, immediately pushes the new post into each follower's precomputed feed (stored in a fast store like Redis) — "fan-out on write."
- For celebrity accounts with very large follower counts, fan-out is skipped at write time; instead those posts are merged into a requester's feed at read time — "fan-out on read" — avoiding a single post triggering tens of millions of writes.
- A ranking service that scores candidate posts (recency, predicted engagement, relationship strength) before final feed assembly.

## Data Model
- \`posts\`: id, authorId, content, createdAt.
- \`follow_graph\`: followerId -> set of followedIds (and the reverse index, followedId -> followers, for fan-out).
- Per-user precomputed feed: a capped, ordered list of post IDs stored in a fast store, refreshed incrementally by the fan-out service.`,
    deepDivesMarkdown: `## Fan-Out on Write vs Fan-Out on Read
- **Fan-out on write**: the moment someone posts, the system pushes a reference to that post into every follower's precomputed feed list. Reads become nearly free (just fetch the precomputed list), but a single post from a very popular account can generate an enormous, latency-spiking burst of writes.
- **Fan-out on read**: nothing happens at post time beyond storing the post; a user's feed is assembled by querying and merging recent posts from everyone they follow at request time. This avoids the celebrity write-burst problem but makes every feed read more expensive, since it has to query and merge across potentially thousands of followed accounts.
- **Hybrid (used in practice)**: fan-out on write for the vast majority of accounts with normal follower counts, combined with fan-out on read (merged in at request time) specifically for the small number of accounts with huge follower counts — getting cheap reads for the common case without a write storm for the rare case.

## Ranking Beyond Recency
- A purely chronological feed is simple but doesn't surface the posts a user is most likely to care about. A ranking step scores each candidate post using signals like recency decay, the strength of the relationship (how often the user interacts with that author), and predicted engagement (often from a learned model), then reorders the candidate set before it's returned — this ranking is applied at read time even for fan-out-on-write feeds, since ranking signals (like "did they already see this") change more often than the underlying post list.

## Feed Staleness and Cache Invalidation
- Precomputed feeds stored in a fast store are a cache, not a source of truth — the canonical post data lives in the post service's database. If the precomputed feed store is lost or a bug corrupts it, feeds can be rebuilt from the follow graph and post store, just more slowly (falling back to fan-out on read) until it recovers.`,
    tradeoffsMarkdown: `## Push (Write Fan-Out) vs Pull (Read Fan-Out)
- Push minimizes read latency at the cost of write amplification and wasted work for posts nobody ends up viewing (they get pushed to every follower's feed regardless). Pull minimizes wasted work (only assembles feeds users actually request) at the cost of higher, more variable read latency. The celebrity problem is exactly why most real systems don't pick one exclusively.

## Strong Freshness vs Bounded Staleness
- Guaranteeing every follower sees a new post within milliseconds would require synchronous fan-out on the critical path of the post request, slowing down posting itself. Accepting a few seconds of propagation delay lets fan-out happen asynchronously, keeping the post action itself fast.

## Precomputed Feed Size
- Capping each user's precomputed feed to, say, the most recent 500-1000 post IDs bounds storage and keeps refresh operations cheap, at the cost of needing a fallback (query-based) path for a user scrolling back further than that cap.`,
    realWorldExamplesMarkdown: `- **Facebook's feed** famously popularized the hybrid fan-out approach, precomputing for most users while handling high-follower-count pages differently to avoid write storms.
- **Twitter/X's timeline** ("Fanout Service") is one of the most publicly documented examples of push/pull hybrid fan-out, explicitly built to handle the celebrity-account problem.
- **Instagram's feed** layers a machine-learned ranking model on top of a similar fan-out architecture, since it moved away from strict chronological ordering years ago.`,
    relatedSlugs: ["notification-system", "distributed-cache"],
  },
  {
    slug: "search-autocomplete",
    title: "Design Search Autocomplete (Typeahead)",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    order: 9,
    summary:
      "Design a typeahead suggestion service that returns the top matching queries as a user types, in real time.",
    requirementsMarkdown: `## Functional Requirements
- As a user types each character, return the top-k most likely completions/suggestions for the prefix typed so far.
- Suggestions should reflect popularity — more frequently searched queries rank higher.
- Suggestions should update over time as query popularity shifts (e.g., trending topics).

## Non-Functional Requirements
- **Very low latency** — must respond within milliseconds per keystroke, since it fires on every character typed.
- **High read throughput** — every keystroke of every user is a request; far higher QPS than the underlying search itself.
- **Freshness vs staleness trade-off** — suggestions don't need to reflect the last second of activity, but should update within minutes to hours.

## Back-of-the-envelope Estimation
- 100M searches/day, each search averaging ~5 keystrokes before selection ⇒ ~500M autocomplete requests/day ≈ ~6K/sec average, spiky around peak hours.
- Top 5-10M distinct historical queries is enough to cover the vast majority of traffic (a long-tail distribution), keeping the in-memory suggestion index small relative to total search volume.`,
    highLevelDesignMarkdown: `## API
- \`GET /autocomplete?prefix=abc -> [ "abc...", "abc...", ... ]\` (top-k suggestions, typically k=5-10).

## Components
- An offline aggregation job that periodically (e.g. hourly) processes raw search logs to compute query frequencies.
- A **trie** (prefix tree) built from the aggregated frequencies, where each node caches its own top-k most frequent completions, so a lookup is just a walk down the trie to the prefix node.
- The trie is served from an in-memory service (sharded if it doesn't fit on one machine) — freshness comes from periodically rebuilding and swapping in a new trie, not from live updates to it.
- A caching layer in front of the trie service for extremely common prefixes ("a", "the", single letters), which see disproportionate traffic.

## Data Model
- Aggregated query counts: \`query -> frequency\`, recomputed periodically from logs (e.g. via a batch job).
- Trie nodes annotated with a precomputed top-k list, so a query never has to rank all completions under a prefix at request time.`,
    deepDivesMarkdown: `## Precomputing Top-K at Every Trie Node
- If each request had to enumerate every word under a prefix node and sort by frequency, response time would depend on how many completions exist under that prefix — too slow for a system that must respond in milliseconds. Instead, each node in the trie stores its own precomputed top-k list, computed bottom-up when the trie is built, so a request is just a direct lookup with no on-the-fly ranking.

## Building and Refreshing the Trie Offline
- Query popularity is aggregated in a batch job (e.g. hourly or daily) rather than updated live on every search, because updating a shared in-memory trie on every single query would create massive write contention on a structure that's read far more than it's written. The batch job builds a brand-new trie and atomically swaps it in, so the live service is always serving a complete, consistent structure with no in-place mutation races.

## Sharding the Trie for Scale
- If the full trie doesn't fit in memory on one machine, it can be sharded by prefix range (e.g. "a-m" on one shard, "n-z" on another), with a thin routing layer sending each request to the right shard based on its first character(s) — a natural fit since prefix queries are inherently routable by their leading characters.`,
    tradeoffsMarkdown: `## Precomputed Trie vs Live Ranking Query
- Precomputing top-k per node gives near-instant responses but means new/trending queries take until the next rebuild to appear as suggestions. Ranking at request time (e.g. against a live search index) is always fresh but far too slow for a per-keystroke UI.

## Rebuild Frequency
- Rebuilding hourly keeps suggestions fresh with modest infrastructure cost. Rebuilding more often (real-time) chases freshness at much higher infrastructure and complexity cost for a feature where "fresh within the hour" is usually good enough for user experience.

## Personalization vs Global Popularity
- Purely global popularity-based ranking is simple and cacheable across all users. Personalized ranking (factoring in a user's own history) improves relevance but means the trie/cache can no longer be shared across users, multiplying both the compute and memory cost.`,
    realWorldExamplesMarkdown: `- **Google Search** autocomplete blends global query popularity with personalization and real-time trending signals, layered on top of a conceptually similar prefix-index structure.
- **Amazon's product search** typeahead ranks suggestions by a mix of popularity and purchase conversion, not just raw search frequency.
- **Elasticsearch's completion suggester** implements a finite-state-transducer-based structure that serves a similar purpose to the precomputed trie described above.`,
    relatedSlugs: ["distributed-cache", "web-crawler"],
  },
  {
    slug: "web-crawler",
    title: "Design a Web Crawler",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Google"],
    order: 10,
    summary:
      "Design a distributed web crawler that discovers and downloads billions of web pages while respecting politeness constraints and avoiding duplicate work.",
    requirementsMarkdown: `## Functional Requirements
- Starting from a set of seed URLs, discover new URLs by following links found on crawled pages.
- Download page content for indexing/analysis, and avoid re-crawling unchanged pages too frequently.
- Respect each site's \`robots.txt\` and avoid overwhelming any single host with concurrent requests.

## Non-Functional Requirements
- **Scalability** — must crawl billions of pages, which requires distributing work across many machines.
- **Politeness** — no single web server should be hit with more than a small number of concurrent requests, or it can be mistaken for (or effectively become) a denial-of-service attack.
- **Extensibility** — new content types (HTML, PDF, images) and priority rules should be pluggable without redesigning the whole system.
- **Avoiding duplicate work** — the same URL, or the same content under different URLs, shouldn't be fetched and processed repeatedly.

## Back-of-the-envelope Estimation
- Crawling 1B pages/month ≈ ~400 pages/sec average sustained across the whole fleet.
- Average page size ~500KB ⇒ 1B pages/month ≈ 500TB/month of raw downloaded content to store and process.`,
    highLevelDesignMarkdown: `## Components
- A **URL frontier**: a set of prioritized queues holding URLs waiting to be crawled, partitioned so that URLs from the same host land in the same queue (this is what makes per-host politeness enforceable).
- Many **fetcher workers** pulling URLs from the frontier, downloading content, and respecting per-host rate limits and \`robots.txt\` rules.
- A **link extraction/parsing** stage that pulls new URLs out of downloaded pages and feeds them back into the frontier.
- A **duplicate detection** layer (URL-level and content-level) that filters out URLs already seen or pages whose content is a near-duplicate of one already crawled.
- Persistent storage for raw downloaded content and crawl metadata (last-crawled time, content hash, HTTP status).

## Data Model
- \`crawled_urls\`: url (or url hash), lastCrawledAt, contentHash, httpStatus.
- Frontier queues keyed by host, so a single worker pool can enforce "no more than N concurrent requests to host X" regardless of how many URLs for that host are queued.`,
    deepDivesMarkdown: `## Enforcing Politeness Per Host
- If URLs were pulled from a single global queue in arbitrary order, many workers could simultaneously hit the same host, effectively DoS-ing it. Partitioning the frontier by host — one queue (or one bucket of queues) per host — combined with a per-host delay/concurrency limit enforced by whichever worker owns that host's queue, guarantees politeness without needing global coordination across all workers for every request.

## Avoiding Duplicate Crawls (URL and Content Level)
- **URL-level dedup**: before enqueueing a discovered URL, check it against a seen-URL set. At billions of URLs, this set is too large to check with a simple in-memory hash set on one machine, so it's typically implemented with a distributed Bloom filter (accepting a small, tunable false-positive rate) backed by a persistent store for exact confirmation.
- **Content-level dedup**: two different URLs (e.g., with different tracking query parameters) can serve identical or near-identical content. Hashing normalized page content (or using a similarity fingerprint like simhash) catches this class of duplication that pure URL-matching misses.

## Prioritization and Re-Crawl Scheduling
- Not all pages are equal — a news homepage changes hourly while a static reference page might never change. The frontier assigns priority/re-crawl frequency based on signals like historical change frequency and page importance (e.g., inbound link count), so crawl budget is spent where freshness actually matters.`,
    tradeoffsMarkdown: `## Breadth-First vs Priority-Based Crawling
- Pure breadth-first crawling is simple and gives good early coverage but treats a rarely updated page the same as a fast-changing one. Priority-based crawling (using signals like page importance and change frequency) is more complex to compute but spends limited crawl capacity far more effectively.

## Bloom Filter vs Exact Set for Seen-URL Tracking
- A Bloom filter is compact enough to keep largely in memory even at billions of URLs, at the cost of a small false-positive rate (occasionally skipping a URL that was never actually seen). An exact set (e.g., a hash set backed by a database) avoids false positives entirely but costs far more in memory/storage and lookup latency at this scale.

## Centralized vs Fully Decentralized Frontier
- A centralized frontier service is easier to reason about for prioritization and politeness but can become a bottleneck/single point of failure at very large scale. A sharded frontier (partitioned by host, as described above) scales better but requires care to avoid starving hosts that happen to land on an overloaded shard.`,
    realWorldExamplesMarkdown: `- **Googlebot** is the most well-known large-scale crawler, using sophisticated prioritization based on page importance (historically related to PageRank) and observed change frequency.
- **The Internet Archive's crawler (Heritrix)** is open-source and documents many of the politeness and frontier-partitioning strategies described above.
- **Common Crawl** operates a large-scale, publicly available web crawl and publishes both its crawled data and details of its distributed architecture.`,
    relatedSlugs: ["search-autocomplete", "distributed-task-scheduler"],
  },
  {
    slug: "video-streaming",
    title: "Design a Video Streaming Service",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Netflix", "Google"],
    order: 11,
    summary:
      "Design a video-on-demand streaming service (like YouTube or Netflix) that ingests, transcodes, stores, and streams video to a global audience.",
    requirementsMarkdown: `## Functional Requirements
- Creators upload video files; the system processes them into multiple resolutions/bitrates for playback.
- Viewers stream video that adapts quality to their current network conditions, with minimal buffering.
- Support seeking to arbitrary points in a video without downloading the entire file first.

## Non-Functional Requirements
- **Global low-latency delivery** — video must start playing quickly and keep playing smoothly for users anywhere in the world.
- **High storage and bandwidth efficiency** — video files are large and re-transcoding/re-serving them at scale is expensive if not done carefully.
- **Durability** — uploaded source video must never be lost, since it can't be regenerated once deleted by the creator.
- **Elastic transcoding capacity** — upload volume is bursty (uploads spike at certain times of day), and transcoding is CPU-intensive.

## Back-of-the-envelope Estimation
- 500 hours of video uploaded per minute (YouTube-scale) ⇒ transcoding pipeline must sustain a very high, continuous compute load across many resolutions per source video.
- A single 10-minute 1080p source video, transcoded into 5 resolutions, might produce several GB of total derived output — multiplied by upload volume, this drives most of the storage footprint.`,
    highLevelDesignMarkdown: `## Components
- An **upload service** that accepts raw video, stores it durably in blob storage (e.g. S3-like object storage), and enqueues a transcoding job — the upload itself completes quickly and doesn't block on processing.
- A **transcoding pipeline** (often split into many parallel worker tasks, sometimes chunking a single video into segments transcoded in parallel) that produces multiple resolutions/bitrates and packages them for adaptive streaming (e.g. HLS/DASH manifests plus segmented video files).
- **Object storage** for both source and transcoded output, fronted by a **CDN** so viewers fetch video segments from an edge location near them instead of a central origin.
- A **metadata service** (video title, description, view counts, processing status) backed by a conventional database, separate from the actual video bytes.

## Data Model
- \`videos\`: id, uploaderId, title, status (uploading/processing/ready), durations, available resolutions.
- Video content itself is stored as segmented files per resolution (e.g. multiple ~2-10 second chunks) referenced by a manifest file, not as one giant file per resolution.`,
    deepDivesMarkdown: `## Adaptive Bitrate Streaming
- Instead of picking one fixed quality, the video is encoded at several bitrates/resolutions and cut into short segments (a few seconds each). The player downloads a manifest listing all available segments/qualities and continuously measures the viewer's actual download speed, switching to a higher or lower quality segment-by-segment as bandwidth changes — this is what lets playback keep going smoothly on a train going through a tunnel, at the cost of an occasional visible quality shift instead of a stall.

## Parallelizing Transcoding
- Transcoding a full-length video serially on one machine is slow and doesn't scale with upload volume. Splitting the source video into chunks and transcoding each chunk in parallel across many worker machines (then reassembling the segments) turns transcoding into an embarrassingly parallel batch job, at the cost of needing careful chunk boundaries (e.g. splitting on keyframes) so segments stitch back together cleanly.

## CDN Caching and Cache-Miss Origin Load
- The overwhelming majority of views concentrate on a small fraction of videos (another power-law distribution), so caching popular video segments at CDN edge nodes serves most traffic without ever reaching origin storage. Less popular ("long tail") content is more likely to miss the CDN cache and pull from origin storage directly — origin capacity is sized for this long-tail load, not for total traffic, since the CDN absorbs the bulk of it.`,
    tradeoffsMarkdown: `## Transcode-Everything-Upfront vs On-Demand Transcoding
- Transcoding into every resolution immediately at upload time means playback is always ready instantly, but wastes compute on resolutions/videos that might rarely be watched. Transcoding lazily (only the requested resolution, on first request) saves compute for unpopular content but adds latency to that first playback request — most large platforms transcode common resolutions upfront and generate rare ones on demand.

## CDN Push vs Pull Caching
- Proactively pushing popular new content to CDN edges ahead of expected demand keeps first-view latency low, at the cost of guessing what will be popular. Pull-based caching (only cache on first edge request) is simpler and never wastes bandwidth on content that turns out unpopular, but the very first viewer in each region pays a slower, uncached fetch.

## Storage Cost vs Number of Encoded Variants
- Encoding into more resolution/bitrate variants improves playback quality across a wider range of devices and network conditions, but each additional variant multiplies storage and transcoding cost — most services cap the variant count to the handful that cover the vast majority of device/network combinations.`,
    realWorldExamplesMarkdown: `- **YouTube** transcodes uploads into many resolutions using a highly parallelized pipeline and serves via Google's global CDN infrastructure and edge caching.
- **Netflix** pre-positions popular content on its own purpose-built CDN (Open Connect), placing servers directly inside ISP networks to minimize the distance video has to travel.
- **HLS (HTTP Live Streaming)**, developed by Apple, and **MPEG-DASH** are the two dominant adaptive-bitrate streaming protocols implementing the segment-and-manifest approach described above.`,
    relatedSlugs: ["distributed-cache", "distributed-task-scheduler"],
  },
  {
    slug: "ride-sharing",
    title: "Design a Ride-Sharing Backend",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Amazon", "Google"],
    order: 12,
    summary:
      "Design the backend for a ride-sharing service (like Uber or Lyft) that matches riders with nearby drivers in real time.",
    requirementsMarkdown: `## Functional Requirements
- Riders request a trip from a pickup to a destination; the system matches them with a nearby available driver.
- Drivers continuously report their live location; riders can see their assigned driver's location update in real time.
- Compute an estimated fare and route, and handle the trip lifecycle (requested, accepted, in-progress, completed).

## Non-Functional Requirements
- **Low matching latency** — a rider shouldn't wait long to be matched with a driver, especially in dense areas.
- **High write throughput for location updates** — every active driver's device pushes a location update every few seconds, across potentially millions of simultaneously active drivers.
- **Geospatial query performance** — "find available drivers near this point" must be fast even with millions of drivers moving continuously.
- **Consistency for trip state** — a driver should never be double-matched to two riders simultaneously.

## Back-of-the-envelope Estimation
- 5M active drivers, each reporting location every 4 seconds ⇒ ~1.25M location updates/sec system-wide.
- A dense city might have tens of thousands of available drivers within a few kilometers of a given rider — matching must search this efficiently, not scan every driver in the city.`,
    highLevelDesignMarkdown: `## Components
- A **location ingestion service** that receives frequent driver location pings and updates a fast, in-memory geospatial index rather than writing straight to a durable database on every ping.
- A **geospatial index** (commonly built on geohashing or a quadtree) that supports "find nearby available drivers" queries in roughly constant time relative to the search radius, not the total driver count.
- A **matching service** that, given a rider request, queries the geospatial index for nearby available drivers, ranks candidates (distance, driver rating, ETA), and proposes a match, marking that driver as pending/unavailable to prevent double-matching.
- A **trip service** that owns trip state transitions (requested -> accepted -> in-progress -> completed) as the authoritative source of truth, backed by a durable database.

## Data Model
- Driver location state: driverId -> (lat, lng, geohash, availability status), held in a fast in-memory/geospatial store, not the durable trip database.
- \`trips\`: id, riderId, driverId, pickup, destination, status, timestamps — this is the durable, transactional record.`,
    deepDivesMarkdown: `## Geospatial Indexing for "Nearby Drivers"
- A naive scan comparing a rider's location against every driver's location doesn't scale past a small city. Geohashing encodes latitude/longitude into a string where nearby locations share long common prefixes, letting "find drivers near me" become a prefix range query instead of a full scan. A quadtree achieves a similar goal by recursively subdividing the map into cells sized so each holds roughly a bounded number of drivers, giving denser areas smaller cells and sparser areas larger ones.

## Preventing Double-Matching
- Once a driver is proposed for a match, they must be atomically marked unavailable so a second, concurrent rider request can't also match to them before the first driver accepts or declines. This is a classic compare-and-set problem: the matching service updates the driver's status from "available" to "pending" conditionally, and only proceeds with the offer if that update succeeds — if it fails, another request already claimed the driver, and this request falls through to the next candidate.

## Separating Frequent Location Writes from Durable Trip State
- Driver location changes far more often (every few seconds) than it needs long-term durability — losing the last few location pings on a crash is an acceptable trade-off, since a new ping arrives moments later. Trip status changes (accepted, completed), by contrast, must never be lost. Keeping these in separate stores — a fast, ephemeral geospatial index for location, and a durable database for trip state — avoids forcing every high-frequency location ping through the overhead of a fully durable transactional write.`,
    tradeoffsMarkdown: `## Geohash vs Quadtree
- Geohashing is simpler to implement (it's just string encoding) and works well with existing key-value/sorted-set stores (e.g. Redis's built-in geospatial commands), but its fixed grid cells can awkwardly split a dense cluster of drivers across a cell boundary. Quadtrees adapt cell size to driver density, giving more uniform query cost, at the cost of a more complex, custom data structure to build and maintain.

## Optimistic (Compare-and-Set) vs Locking for Matching
- Compare-and-set avoids holding a lock during the (potentially slow) process of offering a match to a driver and waiting for their response, keeping the system responsive under load. Pessimistic locking would guarantee no race but risks a slow/unresponsive driver holding a lock and blocking other riders from being matched to them.

## Real-Time Push vs Rider Polling for Driver Location
- Pushing driver location updates to the rider's app the instant they arrive gives the smoothest "watch your driver approach" experience, but requires maintaining a live connection per active trip. Polling is simpler to implement but adds latency and wastes requests when the driver hasn't moved much — most production apps use a live connection (similar to the chat system's approach) specifically for this reason.`,
    realWorldExamplesMarkdown: `- **Uber's dispatch system** (described in their engineering blog as "H3", a hexagonal hierarchical geospatial index) partitions the map into hexagonal cells for efficient nearby-driver queries, an alternative to geohash/quadtree grids.
- **Lyft** similarly relies on geospatial indexing combined with a real-time matching service to pair riders with nearby drivers within seconds.
- **Redis's built-in geospatial commands** (\`GEOADD\`, \`GEOSEARCH\`) implement geohashing internally and are a common building block for smaller-scale versions of this kind of nearby-search problem.`,
    relatedSlugs: ["distributed-cache", "chat-system"],
  },
  {
    slug: "cloud-file-storage",
    title: "Design a Cloud File Storage Service",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Google", "Apple", "Amazon"],
    order: 13,
    summary:
      "Design a cloud file storage and sync service (like Dropbox or Google Drive) that keeps files consistent across a user's multiple devices.",
    requirementsMarkdown: `## Functional Requirements
- Users upload files/folders; changes on one device should sync to all of a user's other devices.
- Support efficient sync for large files by only transferring changed portions, not the whole file on every edit.
- Support sharing files/folders between users with permission controls.
- Maintain version history so a file can be restored to an earlier state.

## Non-Functional Requirements
- **Storage durability** — files must not be lost; this is the core promise of the product.
- **Bandwidth efficiency** — syncing a small edit to a large file shouldn't require re-uploading the entire file.
- **Consistency across devices** — devices should eventually converge on the same file state, with sensible conflict handling when two devices edit offline simultaneously.
- **Scalability** — hundreds of millions of users, many with large libraries of files.

## Back-of-the-envelope Estimation
- 500M users, average 5GB stored each ⇒ ~2.5 exabytes of total storage, requiring storage systems designed for durability and cost efficiency at that scale, not a single database.
- A file edited and synced 10 times/day across 3 devices per user ⇒ tens of millions of sync operations/day system-wide, most involving small deltas rather than full files.`,
    highLevelDesignMarkdown: `## Components
- A **block/chunk storage service**: files are split into fixed-size blocks (e.g. 4MB), each stored in durable object storage and identified by a hash of its content.
- A **metadata service** that tracks, per file, the ordered list of block hashes that make it up, plus version history — the file itself is really just a manifest of blocks, not one indivisible blob.
- A **sync client** on each device that watches the local filesystem for changes, splits changed files into blocks, and uploads only blocks the server doesn't already have (identified by comparing hashes) — then notifies other devices that new blocks/metadata are available.
- A **notification/pub-sub channel** per user (or per shared folder) so other online devices learn about a change quickly rather than polling.

## Data Model
- \`blocks\`: contentHash (PK) -> stored bytes in object storage, deduplicated globally (identical blocks across different files/users are stored once).
- \`file_versions\`: fileId, version number, ordered list of block hashes, timestamp, author device — enables both sync (compare block lists) and version history (keep old lists around).`,
    deepDivesMarkdown: `## Chunking Files for Efficient Delta Sync
- If a whole file had to be re-uploaded on every edit, editing one line in a large document would cost as much bandwidth as the original upload. Splitting files into content-addressed blocks (hashed chunks) means an edit only changes the blocks around that edit; syncing means comparing the new block list against the old one and transferring only the blocks that differ — plus, since blocks are addressed by content hash, identical blocks across completely different files or different users' accounts are automatically deduplicated in storage.

## Detecting and Resolving Sync Conflicts
- If a file is edited on two devices while offline, both produce a new version built from the same base version — a genuine conflict, not just a race. The metadata service detects this by version lineage (both new versions claim the same parent version) and resolves it either by keeping both as separate conflicted copies (Dropbox's "conflicted copy" file) or by attempting an automatic merge for text-mergeable content — the safe default is to never silently discard either version.

## Efficient Change Notification
- Devices could poll the server periodically to check for changes, but that adds latency (up to the poll interval) and wastes requests when nothing changed. A push-based notification channel (similar in spirit to the chat system's connection-routing approach) tells other online devices the instant new metadata is available, so they pull only the specific new/changed blocks — polling remains as a fallback for a device that was offline when the push happened.`,
    tradeoffsMarkdown: `## Block Size Choice
- Smaller blocks (e.g. a few hundred KB) capture edits more precisely, minimizing the data re-transferred per small edit, but multiply the number of blocks (and metadata overhead) per file. Larger blocks reduce metadata overhead but mean a small edit near a block boundary still forces re-uploading that whole larger block.

## Client-Side vs Server-Side Conflict Resolution
- Automatically merging conflicts on the server (where possible) gives a seamless experience but risks incorrect merges for content the server can't safely interpret (e.g. binary files). Surfacing conflicts to the user as separate files is always safe (no data loss) but pushes the resolution burden onto the user.

## Full Version History vs Limited Retention
- Keeping every version of every file forever maximizes recoverability but multiplies storage cost, especially with deduplication only partially offsetting it for heavily edited files. Most services cap retained version history (e.g. 30 days or a fixed number of versions) as a deliberate storage-cost trade-off.`,
    realWorldExamplesMarkdown: `- **Dropbox** built a custom block-storage system, described in public engineering posts, that deduplicates blocks across its entire user base and only ever syncs changed blocks.
- **Google Drive** integrates with Google Docs' operational-transform-based collaborative editing for text documents, layering real-time conflict-free merging on top of file-level storage for other file types.
- **Git itself** is conceptually similar at a smaller scale: content-addressed storage (blobs identified by hash) with explicit version lineage used to detect and resolve merge conflicts.`,
    relatedSlugs: ["distributed-cache", "chat-system"],
  },
  {
    slug: "ticket-booking-system",
    title: "Design a Ticket Booking System",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Amazon"],
    order: 14,
    summary:
      "Design a high-demand event ticket booking system (like Ticketmaster) that prevents double-booking the same seat under massive concurrent demand.",
    requirementsMarkdown: `## Functional Requirements
- Users browse events and select specific seats (or general-admission quantities) to purchase.
- The system must guarantee no two users are ever sold the same seat.
- Hold a selected seat temporarily (e.g. 10 minutes) while a user completes checkout, then release it if they abandon.

## Non-Functional Requirements
- **Strong consistency for seat inventory** — this is the one place in the whole system where "eventually consistent" is not acceptable; overselling a seat is a direct product failure.
- **Handling extreme burst demand** — a popular on-sale event can see hundreds of thousands of concurrent requests for a few thousand seats in seconds.
- **Fairness** — under contention, seat allocation should feel fair to users rather than arbitrary or gameable.
- **Availability of browsing** — even under massive load for one event's on-sale, browsing other events should remain responsive.

## Back-of-the-envelope Estimation
- A popular on-sale event: 20,000 seats, 500,000 concurrent requests in the first minute ⇒ the vast majority of requests must be told "sold out" or queued without ever reaching the seat-inventory system, or that system collapses under load it can't productively use anyway.`,
    highLevelDesignMarkdown: `## Components
- A **virtual waiting room / queueing layer** in front of the booking system for high-demand on-sales, admitting users into the actual booking flow at a controlled rate rather than letting all demand hit inventory simultaneously.
- A **seat inventory service** backed by a strongly consistent data store, where each seat's state (available, held, sold) is updated via an atomic compare-and-set — this is the system's single source of truth and its most carefully guarded component.
- A **hold/reservation mechanism**: selecting a seat transitions it to "held" with an expiry timestamp; a background job releases holds that expire without completing checkout.
- A **payment/checkout service** that only finalizes a sale after successfully charging payment, transitioning the seat from "held" to "sold" only on payment success.

## Data Model
- \`seats\`: eventId, seatId, status (available/held/sold), heldBy, holdExpiresAt — status transitions are the core correctness-critical operation in the whole system.
- \`orders\`: id, userId, seatIds, paymentStatus, timestamps.`,
    deepDivesMarkdown: `## Preventing Double-Booking Under Extreme Contention
- The seat status transition from "available" to "held" must be an atomic compare-and-set: "set status to held only if current status is available." If two requests race for the same seat, exactly one compare-and-set succeeds and the other fails cleanly and is told the seat is gone — this is the single correctness-critical operation the entire design protects, and it deliberately does not use eventual consistency or optimistic conflict resolution the way earlier designs in this list do, because overselling a seat has no acceptable resolution after the fact.

## Shedding Load Before It Reaches Inventory
- If 500,000 concurrent requests all hit the seat-inventory service directly for a 20,000-seat on-sale, the inventory service itself becomes the bottleneck and likely falls over, hurting even the requests that could have succeeded. A virtual waiting room admits users at a rate the downstream system can actually handle (e.g., via a token or queue position), so the inventory service only ever sees a manageable request rate — the same overall demand is handled, just spread out and given order.

## Releasing Abandoned Holds
- A held seat that isn't completed within its hold window (e.g. 10 minutes) must be released back to available, or seats would silently disappear from inventory forever whenever a user abandons checkout. A background sweeper job scans for expired holds and atomically transitions them back to available — using the same compare-and-set discipline, since a hold could complete checkout at nearly the same moment the sweeper considers expiring it.`,
    tradeoffsMarkdown: `## Strong Consistency vs Throughput
- This is one of the few designs in this space where the answer isn't "favor availability" — strong, immediate consistency on seat status is non-negotiable, even though it caps how many concurrent writes the inventory system can serve compared to an eventually consistent design. The waiting room exists specifically to keep demand within what a strongly consistent system can handle, rather than relaxing the consistency requirement.

## Waiting Room Fairness: FIFO vs Random Admission
- A strict first-in-first-out queue feels fair and rewards users who arrive early, but can be gamed by bots that connect earlier than any human could. Randomized admission (a lottery among everyone who joined within a short window) is harder to game via pure speed but can feel less "fair" to a user who was demonstrably first.

## Short vs Long Hold Windows
- A short hold window (e.g. 5 minutes) returns abandoned seats to inventory faster, which matters enormously when demand vastly exceeds supply, but pressures users who are slower at checkout (e.g. entering payment details) to rush or lose their seat. A longer window is more forgiving to the user but keeps scarce seats locked up longer during exactly the moments when contention is highest.`,
    realWorldExamplesMarkdown: `- **Ticketmaster's queueing system** ("Queue-It" style virtual waiting rooms) is publicly documented as sitting in front of high-demand on-sales for exactly this load-shedding purpose.
- **Airline seat reservation systems** face the same double-booking-prevention problem and have historically relied on strongly consistent mainframe/database transactions for seat-hold state for this reason.
- **StubHub and similar resale platforms** implement analogous hold/expire mechanics when a buyer adds a ticket to their cart, releasing it back to listings if checkout isn't completed in time.`,
    relatedSlugs: ["rate-limiter", "payment-system"],
  },
  {
    slug: "payment-system",
    title: "Design a Payment Processing System",
    category: "backend",
    difficulty: "hard",
    maangTags: ["Amazon", "Apple"],
    order: 15,
    summary:
      "Design a payment processing backend that reliably charges customers, integrates with external payment providers, and never double-charges or silently loses a transaction.",
    requirementsMarkdown: `## Functional Requirements
- Accept a payment request (amount, currency, payment method) and route it to an external payment processor (card network, bank, wallet provider).
- Guarantee that a given payment request is processed **exactly once**, even if the client retries after a timeout.
- Support refunds, and reconcile the system's own records against the payment processor's records to catch discrepancies.

## Non-Functional Requirements
- **Correctness above all** — money must never be double-charged, and a successful charge must never be silently lost from the system's records; this system tolerates lower throughput far more readily than it tolerates incorrect state.
- **Durability** — a transaction, once accepted, must be recorded durably before any success response is returned.
- **Auditability** — every state transition of every transaction must be logged immutably for compliance and dispute resolution.
- **Resilience to partial failure** — the network call to an external payment processor can fail in ambiguous ways (timeout with unknown outcome), and the system must handle "I don't know if this succeeded" as a first-class case, not an edge case.

## Back-of-the-envelope Estimation
- 1M transactions/day ≈ ~12/sec average — modest throughput compared to earlier designs in this list, which is precisely why this design can afford to prioritize strong consistency and durability over raw throughput.`,
    highLevelDesignMarkdown: `## Components
- A **payment API** that, on receiving a charge request, first durably records the request with a unique idempotency key **before** calling any external processor — this ordering is the crux of the whole design.
- An **idempotency layer**: if the same idempotency key is submitted again (e.g. a client retry after a timeout), the system returns the stored result of the original attempt instead of processing the charge a second time.
- A **payment processor adapter** that talks to external providers (card networks, ACH, wallets), abstracting their different APIs behind a common internal interface.
- A **reconciliation job** that periodically compares the system's own transaction records against statements/reports from the external processor, flagging any mismatch for manual review.

## Data Model
- \`transactions\`: idempotencyKey (unique), status (pending/succeeded/failed/unknown), amount, processorReference, createdAt, updatedAt — status transitions are append-only/audited, never overwritten silently.
- \`transaction_events\`: an immutable log of every state change for a transaction, forming the audit trail required for disputes and compliance.`,
    deepDivesMarkdown: `## Idempotency Keys for Exactly-Once Charging
- A client (e.g. a checkout page) might retry a payment request after a network timeout without knowing whether the original request actually succeeded on the server before the timeout. Requiring the client to generate and send a unique idempotency key with the original request — and having the server check for that key before processing — lets a retry safely return the original result instead of charging the customer twice. This single mechanism is the core defense against the most damaging failure mode in the whole system.

## Handling "Unknown" Outcomes from External Processors
- A call to an external payment processor can time out without telling the caller whether the charge succeeded on the processor's side before the timeout. The system must record this as an explicit \`unknown\` status, not silently treat it as failed (risking a duplicate charge on retry) or as succeeded (risking recording money that was never actually charged) — a background reconciliation process later queries the processor's own transaction status to resolve the ambiguity definitively.

## The Durable-Write-Before-External-Call Ordering
- Recording the transaction request durably, with its idempotency key, **before** calling the external processor (rather than after) means that even if the service crashes immediately after initiating the external call, on restart it can look up the transaction's last known status and resume/reconcile rather than losing all knowledge that the request was ever made. Getting this ordering backwards is one of the most common real-world sources of duplicate or lost charges in poorly designed payment systems.`,
    tradeoffsMarkdown: `## Throughput vs Correctness Guarantees
- Every design decision here (durable-write-before-external-call, idempotency key checks, immutable audit logs) adds latency and reduces raw throughput compared to a naive "just call the processor and return the result" implementation. For a payment system, this is the correct trade — the earlier designs in this list optimize for latency/throughput because staleness is cheap; this one optimizes for correctness because an incorrect charge is not something that can simply be retried away.

## Synchronous vs Asynchronous Charge Confirmation
- Returning success to the client only after the external processor confirms the charge gives the simplest mental model but ties client-facing latency to a third party's response time, which the system doesn't control. Returning "processing" immediately and notifying the client asynchronously (webhook/polling) decouples client latency from processor latency, at the cost of a more complex client-side integration.

## Automatic Reconciliation vs Manual Review of Mismatches
- Automatically resolving reconciliation discrepancies (e.g. always trusting the processor's record) is faster to operate but risks silently absorbing an error that a human might have caught. Flagging every mismatch for manual review is safer for a system handling real money but doesn't scale to very high mismatch volumes — most systems auto-resolve well-understood mismatch patterns and escalate anything novel.`,
    realWorldExamplesMarkdown: `- **Stripe's API** requires an idempotency key on charge requests specifically to solve the retry-after-timeout double-charge problem described above, and documents this pattern extensively for integrators.
- **PayPal and major card networks** run continuous reconciliation processes between merchant records and network settlement reports to catch discrepancies that slip past real-time processing.
- **Banking core systems** have used durable, append-only ledger designs (write the intent before acting on it) for this same class of correctness guarantee for far longer than modern web payment systems have existed.`,
    relatedSlugs: ["ticket-booking-system", "rate-limiter"],
  },
  {
    slug: "distributed-task-scheduler",
    title: "Design a Distributed Task Scheduler",
    category: "backend",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    order: 16,
    summary:
      "Design a distributed job scheduler that runs one-off and recurring tasks reliably across a fleet of worker machines, similar to a distributed cron.",
    requirementsMarkdown: `## Functional Requirements
- Schedule a task to run once at a specific future time, or on a recurring schedule (e.g. every hour, or a cron expression).
- Guarantee a scheduled task executes even if the machine that was supposed to run it fails.
- Prevent the same scheduled task from running twice concurrently ("no duplicate execution" for a given scheduled instance).

## Non-Functional Requirements
- **Reliability** — a task must run even across worker failures; "the scheduler crashed" is not an acceptable reason for a job to silently not run.
- **Scalability** — must handle scheduling and dispatching millions of tasks across a large worker fleet.
- **Timeliness** — tasks should fire close to their scheduled time, with bounded, predictable delay under normal load.
- **Idempotent-friendly execution** — since failures can cause retries, the system should make it easy for task authors to write safely retryable tasks.

## Back-of-the-envelope Estimation
- 10M scheduled tasks, many recurring (e.g. every minute to every day) ⇒ potentially hundreds of thousands of task executions/minute at peak across the fleet, requiring the scheduling metadata store itself to handle high read/write rates just to figure out "what's due right now."`,
    highLevelDesignMarkdown: `## Components
- A **schedule store** holding every task definition (one-off time or recurring cron expression) and its next-run timestamp, indexed so "find all tasks due before now" is an efficient range query rather than a full scan.
- A small set of **scheduler nodes** that periodically poll the schedule store for due tasks and enqueue them onto a distributed task queue — the scheduler's job is just "figure out what's due and hand it off," not to execute anything itself.
- A **worker fleet** that pulls tasks from the queue and executes them, reporting success/failure back, similar in spirit to the message-queue consumer model described earlier in this list.
- A **leader election / locking mechanism** among scheduler nodes so multiple scheduler instances (needed for the scheduler's own redundancy) don't all enqueue the same due task simultaneously.

## Data Model
- \`scheduled_tasks\`: id, cronExpression or runAt, nextRunAt, lastRunStatus, ownerId.
- \`task_executions\`: taskId, executionId, status (queued/running/succeeded/failed), lockOwner, startedAt — the execution record, separate from the schedule definition, is what a distributed lock is taken against to prevent duplicate concurrent runs.`,
    deepDivesMarkdown: `## Preventing Duplicate Execution of the Same Scheduled Instance
- If two scheduler nodes (running for the scheduler's own redundancy) both notice the same task is due at the same time, both could enqueue it, and two workers could execute it concurrently. A distributed lock — acquired per (taskId, scheduledInstanceTime) before enqueueing, with a lease/TTL so it's automatically released if the holder crashes — ensures only one scheduler node successfully claims and enqueues any given due instance.

## Recovering from Worker Failure Mid-Task
- If a worker crashes while executing a task, the task must not be silently lost. Workers periodically renew a lease on the task they're executing; if the lease isn't renewed within its timeout, the task is considered abandoned and becomes eligible for another worker to pick up and retry — this is the same lease/heartbeat pattern used to detect failed workers in many distributed systems, applied here to individual task executions rather than whole machines.

## Handling Cron-Style Recurrence Efficiently
- Rather than materializing every future occurrence of a recurring task in advance (which would be unbounded for an indefinitely repeating schedule), the schedule store keeps only the task's recurrence rule plus its single next-run timestamp; after each execution, the scheduler computes and writes the next occurrence, keeping the store's size proportional to the number of distinct scheduled tasks, not the number of times they'll ever run.`,
    tradeoffsMarkdown: `## Polling-Based Scheduling vs Precise Timers
- Having scheduler nodes periodically poll for "what's due" (e.g. every few seconds) is simple and horizontally scalable but introduces up to one polling interval of delay before a due task is actually enqueued. Maintaining precise per-task timers avoids that delay but is much harder to distribute and rebalance across multiple scheduler nodes without a single node becoming a bottleneck holding all the timers.

## Lease-Based Failure Detection vs Explicit Heartbeat Reporting
- Lease expiry (assume failure if not renewed in time) requires no extra messages from a healthy worker beyond periodic renewal, but a slow-but-alive worker can be mistakenly treated as failed if it can't renew in time, risking duplicate execution when its work is reassigned. Explicit heartbeats with more generous timeouts reduce false failure detection but delay how quickly a truly failed worker's task is noticed and reassigned.

## At-Least-Once Execution vs Exactly-Once Execution
- Guaranteeing a task runs at least once (accepting that failure/retry can occasionally cause it to run twice) is far simpler to build reliably than guaranteeing exactly-once execution, which requires either idempotent task logic or a transactional execution record. Most distributed schedulers push the idempotency requirement onto task authors rather than trying to solve exactly-once execution generically in the scheduler itself.`,
    realWorldExamplesMarkdown: `- **Google's Cron/Borg-integrated scheduling** (described in Google's infrastructure papers) runs recurring jobs across its cluster manager with exactly this lease-based failure recovery model.
- **Apache Airflow** implements DAG-based task scheduling with similar due-task polling and distributed worker execution, widely used for data pipeline orchestration.
- **Quartz Scheduler** (Java) and **Celery Beat** (Python) are smaller-scale but architecturally similar examples of the schedule-store-plus-worker-queue pattern described above.`,
    relatedSlugs: ["distributed-message-queue", "web-crawler"],
  },
];
