import type { SystemDesignQuestion } from "../types";

export const frontendSystemDesignQuestions: SystemDesignQuestion[] = [
  {
    slug: "autocomplete-search",
    title: "Autocomplete / Typeahead Search",
    category: "frontend",
    difficulty: "easy",
    maangTags: ["Google", "Amazon"],
    order: 1,
    summary:
      "Design the client for a search box that suggests results as the user types, balancing latency, network usage, and relevance.",
    requirementsMarkdown: `## Functional Requirements
- As the user types into a search box, show a dropdown of up to 10 ranked suggestions.
- Support keyboard navigation (up/down/enter/escape) and mouse selection over the suggestion list.
- Highlight the matched substring inside each suggestion.
- Recover gracefully from slow or failed network requests without freezing the input.

## Non-Functional Requirements
- Perceived latency under ~100ms for the dropdown to feel "live."
- Minimize redundant network requests as the user types quickly.
- Suggestions should reflect the *latest* keystroke, never a stale one that arrives out of order.
- Accessible via screen readers (\`aria-autocomplete\`, \`role="listbox"\`).

## Clarifying Questions
- Is suggestion data personalized per user, or a shared global index?
- Do we need offline/cached suggestions when the network is unavailable?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **SearchInput** — controlled text input that owns the raw query string.
- **Debouncer** — delays firing a network request until typing pauses (~150-250ms).
- **RequestManager** — issues the fetch, tags each request with a monotonically increasing sequence id, and cancels/ignores stale responses.
- **SuggestionCache** — an in-memory LRU keyed by query prefix so re-typing a previously seen prefix is instant.
- **SuggestionList** — renders results, owns keyboard-navigation highlight state, exposes selection via callback.

## Data Flow
1. Keystroke updates local input state immediately (no delay on what the user sees themselves typing).
2. Debouncer waits for a quiet period, then checks the cache for the query prefix.
3. On a cache miss, RequestManager fires a network call carrying a sequence number.
4. When a response arrives, it's only applied to the UI if its sequence number is the latest issued — otherwise it's dropped as stale.
5. Results populate SuggestionCache and render in SuggestionList.`,
    deepDivesMarkdown: `### Race Conditions and Out-of-Order Responses
Because requests fire on a delay and network latency varies, a request for "ca" can return *after* a request for "cat" if the network reorders them. Tagging each request with an incrementing sequence number (or using \`AbortController\` to cancel superseded requests outright) prevents an old response from clobbering newer results. This is the single most important correctness detail in this problem.

### Debouncing vs. Throttling
Debouncing (wait for a pause) is preferred over throttling (fire at most every N ms) here because the goal is minimizing wasted requests while the user is still actively typing, not guaranteeing a steady cadence. A hybrid works well in practice: debounce for 150-200ms, but also fire immediately if the query has been stable in the cache from a prior session.

### Client-Side Caching Strategy
An LRU keyed by the trimmed, lowercased query prefix avoids re-fetching. Because typing "goog" then "google" then backspacing to "goog" is common, caching every intermediate prefix (not just final queries) meaningfully cuts network calls. Cache invalidation matters if suggestions are personalized or time-sensitive (e.g., trending searches) — a short TTL (30-60s) balances freshness against savings.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Debounce delay | Shorter (~100ms) | Feels snappier but issues more requests, more server load |
| Debounce delay | Longer (~300ms) | Fewer requests but suggestions feel laggy |
| Stale response handling | Sequence numbers | Simple, no browser API dependency, but requires manual bookkeeping |
| Stale response handling | \`AbortController\` | Cancels the network work outright (saves bandwidth) but not supported identically across all fetch wrappers |
| Ranking | Client-side re-rank of server results | Fast, personalizable, but duplicates ranking logic client and server |
| Ranking | Trust server order entirely | Simpler client, but a slow server round-trip fully gates relevance |`,
    realWorldExamplesMarkdown: `- **Google Search** debounces keystrokes and cancels in-flight suggestion requests, and layers in personalized/trending suggestions above generic prefix matches.
- **Amazon's** product search autocomplete blends category-aware suggestions (e.g., "wireless mouse" under Electronics) with plain text completion, requiring the client to render grouped suggestion sections rather than a flat list.
- **GitHub's** command palette (Cmd+K) uses a similar debounce + cache + cancel-stale-request pattern entirely client-side for local actions, falling back to network search for repositories/code.`,
    relatedSlugs: ["infinite-scroll-feed", "notification-system"],
  },
  {
    slug: "infinite-scroll-feed",
    title: "Infinite Scroll Feed",
    category: "frontend",
    difficulty: "easy",
    maangTags: ["Meta", "Amazon"],
    order: 2,
    summary:
      "Design a feed UI that loads more content as the user scrolls, without janking the browser or losing scroll position.",
    requirementsMarkdown: `## Functional Requirements
- Render an initial page of feed items; load the next page automatically as the user nears the bottom.
- Preserve scroll position when new items are appended (never yank the viewport).
- Support pull-to-refresh or a "new posts" banner when fresh content arrives at the top.
- Handle empty state, loading state, and end-of-feed state distinctly.

## Non-Functional Requirements
- Memory must stay bounded even after scrolling through thousands of items — the DOM can't grow unbounded.
- Scrolling must stay at 60fps; layout thrashing from image loads or reflows is unacceptable.
- Network requests for the next page should be prefetched slightly before the user reaches the bottom, not exactly at the edge.

## Clarifying Questions
- Is this a single never-ending feed, or does it need "jump to top" / bookmarking of position across sessions?
- Are feed items heterogeneous (text, image, video, ad) with very different render costs?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **FeedContainer** — the scrollable region; owns the list of loaded items and pagination cursor.
- **IntersectionSentinel** — an invisible marker element near the bottom of the rendered list, observed via \`IntersectionObserver\` to trigger the next page fetch.
- **Virtualizer** — windowing layer that only mounts DOM nodes for items in (or near) the viewport, unmounting/recycling the rest.
- **PageLoader** — fetches the next page given a cursor/offset, deduplicates in-flight requests.
- **FeedItem** renderers — per-content-type components, lazy-loading their own media.

## Data Flow
1. Initial render fetches page 1, mounts items 1..N.
2. IntersectionObserver watches a sentinel placed a few items before the current end.
3. When the sentinel enters the viewport, PageLoader fetches the next page using an opaque cursor returned by the server (not a raw offset, to stay stable under concurrent inserts).
4. New items append to the list; the Virtualizer recalculates which DOM nodes are actually mounted based on current scroll offset.
5. Scroll position is preserved because appends happen *below* the visible viewport — no layout shift above the fold.`,
    deepDivesMarkdown: `### Virtualization (Windowing)
Rendering every loaded item as a real DOM node is the primary way infinite scroll pages become unusably slow. A virtualizer keeps a fixed-size window of mounted nodes (viewport + overscan buffer) and estimates the height of unmounted items — either via a fixed row height or a measured/cached per-item height for variable content — so the scrollbar and scroll math stay correct even though most items aren't in the DOM. This is essentially the same idea as \`react-window\`/\`react-virtualized\`.

### Cursor-Based Pagination
Offset-based pagination ("give me items 100-120") breaks when items are inserted or deleted concurrently — the feed shifts and you get duplicates or skips. Cursor-based pagination ("give me items after this opaque token, which encodes the last item's rank/timestamp/id") is stable under concurrent writes and is what virtually every production feed uses.

### Prepend Handling ("New Posts" Banner)
New content arriving at the *top* of the feed can't simply be prepended — it would shove the user's current scroll position down unexpectedly. The standard pattern is to buffer new top-of-feed items and show a "n new posts — click to load" banner, only splicing them in (and adjusting scroll offset to compensate) on explicit user action.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Pagination style | Offset-based | Simple to implement and reason about, but unstable under concurrent inserts/deletes |
| Pagination style | Cursor-based | Stable under mutation, but requires the backend to expose stable sort keys |
| Rendering | Full DOM (no virtualization) | Simple, but memory/DOM size grows unbounded and scrolling degrades over time |
| Rendering | Windowed/virtualized | Bounded memory and smooth scrolling, but variable-height items need height estimation/measurement complexity |
| Trigger mechanism | Scroll event + manual math | Works everywhere, but scroll events fire at high frequency and need throttling |
| Trigger mechanism | \`IntersectionObserver\` | Native, efficient (browser-batched, off main thread), but slightly less precise timing control |`,
    realWorldExamplesMarkdown: `- **Facebook/Instagram feeds** use cursor-based pagination and a "new posts" banner rather than auto-prepending, exactly to avoid disorienting the scroll position.
- **Twitter/X** virtualizes its timeline heavily — scrolling through a long session shows the DOM node count staying roughly constant via dev tools inspection.
- **Reddit's** feed similarly windows content and prefetches the next page well before the visible sentinel, so the network round-trip is hidden behind existing scroll momentum.`,
    relatedSlugs: ["news-feed", "autocomplete-search"],
  },
  {
    slug: "image-carousel",
    title: "Image Carousel / Slideshow",
    category: "frontend",
    difficulty: "easy",
    maangTags: ["Amazon", "Apple"],
    order: 3,
    summary:
      "Design a reusable, accessible image carousel component that handles swipe, autoplay, and lazy-loaded slides.",
    requirementsMarkdown: `## Functional Requirements
- Show one slide at a time with next/previous controls and dot/thumbnail indicators.
- Support touch swipe on mobile and drag on desktop, with a snap-back animation if the swipe doesn't cross a threshold.
- Optional autoplay with pause-on-hover/focus and pause when the tab is not visible.
- Loop seamlessly from the last slide back to the first (and vice versa).

## Non-Functional Requirements
- Only the current slide (plus one neighbor each side) should have its image actually loaded — not all slides upfront.
- Must be usable via keyboard (arrow keys) and screen readers (\`aria-live\`, \`role="group"\`, slide count announcements).
- Smooth 60fps transition animations even on lower-end mobile devices.

## Clarifying Questions
- Is this carousel embedded in a larger page where autoplay could distract from other content (accessibility concern)?
- Do slides need arbitrary content (video, forms) or are they strictly images?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **CarouselContainer** — owns current index, transition state, and touch/drag gesture handlers.
- **SlideTrack** — a flex/transform-translated strip of slides; the container translates it by \`-index * slideWidth\`.
- **LazySlide** — wraps each slide's image, only setting \`src\` (or using an \`IntersectionObserver\`) when the slide is within one position of active.
- **Indicators** — dots/thumbnails reflecting current index, clickable to jump directly.
- **AutoplayController** — a timer that advances the index, paused on hover/focus/visibility-hidden.

## Data Flow
1. Container renders all slide *slots* but each LazySlide defers real image loading until it's within the "eager window" (current ± 1).
2. Swipe/drag updates a transient \`dragOffset\` in real time for visual feedback; on release, compares distance against a threshold to decide "commit to next slide" vs. "snap back."
3. Committing a slide change updates \`index\`, which shifts the eager window, triggering the newly-adjacent slide to start loading.
4. CSS \`transform: translateX()\` (not \`left\`/\`margin\`) drives the transition so it runs on the compositor thread, not layout.`,
    deepDivesMarkdown: `### GPU-Accelerated Transitions
Animating \`left\` or \`margin-left\` forces layout recalculation on every frame. Animating \`transform: translateX()\` (and optionally \`will-change: transform\`) lets the browser composite the transition on the GPU, keeping it smooth even while other work happens on the main thread. This is the difference between a carousel that stutters on a mid-range phone and one that doesn't.

### Infinite Loop Without a Visible Jump
To loop seamlessly from the last slide to the first, clone the first slide and append it after the last (and vice versa for looping backward). When the user reaches the cloned slide, snap instantly (transition disabled for one frame) back to the real first slide — imperceptible because it happens at an identical-looking frame.

### Touch Gesture Threshold and Velocity
A naive "swiped more than 50% of width = advance" feels wrong for fast flicks. Tracking velocity (distance/time) alongside displacement lets a fast short swipe still trigger a slide change, matching how native OS carousels (e.g., iOS Photos) feel — this is what separates a "toy" carousel from a production one.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Slide loading | Eager (load all images upfront) | Instant navigation, but wastes bandwidth on slides never viewed |
| Slide loading | Lazy window (current ± 1) | Saves bandwidth, but a very fast swipe past the eager window shows a brief blank/loading slide |
| Looping | Clone-and-snap | Seamless visual loop, small extra DOM nodes |
| Looping | Hard stop at ends | Simpler, but feels broken to users expecting infinite loop UX |
| Autoplay | On by default | More "alive" feeling, but a well-known accessibility anti-pattern (WCAG 2.2.2) if not pausable |
| Autoplay | Off by default, opt-in | Accessible by default, less flashy out of the box |`,
    realWorldExamplesMarkdown: `- **Amazon product pages** lazy-load carousel images and prioritize the first slide as the largest-contentful-paint candidate, deferring the rest.
- **Apple's** marketing pages use transform-based, GPU-accelerated carousel transitions tuned to feel identical to native iOS scrolling physics.
- **Netflix's** row-based carousels (distinct from full-bleed hero carousels) apply the same "eager window" lazy-loading idea across dozens of horizontally-scrolling rows simultaneously.`,
    relatedSlugs: ["video-streaming-player", "infinite-scroll-feed"],
  },
  {
    slug: "news-feed",
    title: "News Feed",
    category: "frontend",
    difficulty: "medium",
    maangTags: ["Meta"],
    order: 4,
    summary:
      "Design the frontend for a social news feed combining ranked content, real-time updates, and mixed media rendering.",
    requirementsMarkdown: `## Functional Requirements
- Render a ranked, paginated feed of heterogeneous posts (text, image, video, shared/reposted content, ads).
- Support interactions per post — like, comment, share — with optimistic UI updates.
- Surface new posts at the top without disrupting the reading position (see Infinite Scroll Feed).
- Allow inline expansion (e.g., "see more" for long text, comment threads) without full page navigation.

## Non-Functional Requirements
- Time-to-first-post should be fast even though ranking may be a heavier backend computation — consider skeleton/placeholder rendering.
- Interactions (like/comment) must feel instant regardless of network latency, then reconcile with the server.
- The feed must degrade gracefully on poor connections — text loads before images/video, which load before autoplay.

## Clarifying Questions
- Is ranking entirely server-side, or does the client do any local re-ranking/filtering (e.g., "hide posts from X")?
- Do post interactions need to sync across multiple open tabs/devices in real time?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **FeedController** — orchestrates fetching, merging, and virtualizing the ranked post list (builds on the Infinite Scroll Feed design).
- **PostRenderer** — a per-content-type component tree (TextPost, ImagePost, VideoPost, SharedPost) selected via a discriminated union on post type.
- **InteractionStore** — a normalized client-side store (e.g., by post id) holding like/comment counts and the current user's interaction state, updated optimistically.
- **RealtimeChannel** — a WebSocket or long-poll connection delivering new-post notifications and live interaction-count deltas from other users.
- **MediaLoader** — coordinates lazy image/video loading tied to viewport visibility, prioritizing text-first rendering.

## Data Flow
1. FeedController requests a ranked page from the backend and renders posts through PostRenderer, using placeholders for below-the-fold media.
2. User taps "like" → InteractionStore updates local state and UI immediately (optimistic), fires the mutation request in the background.
3. If the mutation fails, InteractionStore rolls back the optimistic update and surfaces a subtle error (e.g., toast), rather than a jarring UI flash.
4. RealtimeChannel pushes interaction-count deltas from other users and new-post arrival events; new posts are buffered into a "new posts" banner rather than auto-inserted.`,
    deepDivesMarkdown: `### Optimistic Updates and Reconciliation
Liking a post should update the UI in the same frame as the tap — waiting for a network round-trip makes the whole feed feel sluggish. The InteractionStore applies the change locally, tags it as "pending," and fires the request. On success, the pending flag clears. On failure, the change is reverted and the discrepancy surfaced. The tricky part is when a real-time update for the *same* post arrives from the server while a local optimistic update is still pending — the client needs a merge strategy (e.g., server delta wins for counts, but local "did I personally like this" flag is preserved until the pending request resolves).

### Heterogeneous Content Rendering
A feed mixing text, images, video, shared posts, and ads can't use one rigid template. A discriminated union (\`post.type\`) dispatches to a per-type renderer, but all renderers share a common shell (author header, interaction bar, timestamp) to keep the DOM structure and CSS predictable, which also matters for the Virtualizer's height estimation from the Infinite Scroll design.

### Real-Time Updates Without Feed Disruption
New posts and live interaction counts arrive via WebSocket, but naively splicing them into the rendered list causes layout shift and lost scroll position. New posts get buffered (banner pattern); interaction count deltas *can* update in place since they don't change item height or ordering — but only if the delta doesn't cross a re-ranking threshold (e.g., a post's engagement causing the backend to want to reorder it), which is deliberately ignored client-side until the next full page fetch to avoid the entire feed reshuffling under the user's cursor.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Interaction updates | Optimistic (update UI, then confirm) | Feels instant, but requires rollback/reconciliation logic |
| Interaction updates | Pessimistic (wait for server) | Simpler, always consistent, but feels laggy on slow networks |
| New post arrival | Auto-insert at top | Content always fresh, but disorienting/scroll-jumping |
| New post arrival | Buffer + banner | Preserves reading position, but requires an extra explicit user action |
| Re-ranking on live signal | Reorder feed in place as engagement changes | Always "freshest" ranking, but visually chaotic mid-scroll |
| Re-ranking on live signal | Freeze order until next fetch | Stable browsing experience, but ranking can feel slightly stale |`,
    realWorldExamplesMarkdown: `- **Facebook's** News Feed famously buffers new top-of-feed content behind a "X new posts" pill rather than live-inserting, precisely to avoid scroll disruption.
- **LinkedIn's** feed applies optimistic like/react updates with a distinct animation state for "pending" vs "confirmed," visible if you throttle your network in dev tools.
- **Twitter/X** freezes timeline order during an active scroll session and only reflows ranking on manual refresh/pull-to-refresh.`,
    relatedSlugs: ["infinite-scroll-feed", "notification-system", "real-time-chat-app"],
  },
  {
    slug: "real-time-chat-app",
    title: "Real-Time Chat Application",
    category: "frontend",
    difficulty: "medium",
    maangTags: ["Meta", "Amazon"],
    order: 5,
    summary:
      "Design the client for a messaging app: message delivery, ordering, optimistic sends, typing indicators, and offline resilience.",
    requirementsMarkdown: `## Functional Requirements
- Send and receive text messages in real time within a conversation thread.
- Show delivery/read receipts (sent → delivered → read) per message.
- Show a typing indicator when the other participant is composing.
- Support sending while offline, queuing messages for delivery once reconnected.
- Preserve message order even when messages arrive out of send order (multi-device, network jitter).

## Non-Functional Requirements
- Sending a message must feel instantaneous — no waiting on the network round-trip to see it appear.
- The app must reconnect and resync (not just reconnect the socket, but recover any messages missed while disconnected) after network loss.
- Message history should scroll smoothly even for threads with tens of thousands of messages (virtualization, like the feed problem, but scrolling *upward* to load history).

## Clarifying Questions
- Single 1:1 chat only, or also group chats (which changes read-receipt semantics — "read by whom")?
- Is end-to-end encryption in scope for the client design, or purely transport-level (WSS)?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **ConnectionManager** — owns the WebSocket lifecycle: connect, heartbeat/ping-pong, exponential-backoff reconnect, and resync-on-reconnect.
- **MessageStore** — an ordered, deduplicated local store of messages per conversation, keyed by a stable message id (client-generated UUID, not server-assigned, so optimistic sends have an id before the server responds).
- **OutboxQueue** — persists not-yet-acknowledged outgoing messages (e.g., in IndexedDB) so they survive a page reload or offline period, retried on reconnect.
- **TypingIndicatorChannel** — a lightweight, unreliable/best-effort event stream (doesn't need queuing/retry like real messages do).
- **MessageList** — virtualized, reverse-infinite-scroll list (loads older history when scrolling up, similar mechanics to Infinite Scroll Feed but bidirectional).

## Data Flow
1. User hits send → a message with a client-generated UUID and status \`"sending"\` is immediately added to MessageStore and rendered.
2. The same message is pushed into OutboxQueue and sent over the ConnectionManager's socket.
3. Server acknowledges with the same client UUID plus a canonical server timestamp/sequence — MessageStore updates that message's status to \`"sent"\` and reconciles ordering using the server sequence number, not client send time.
4. If the socket drops mid-send, OutboxQueue retries on reconnect; ConnectionManager also requests "anything I missed since sequence N" on reconnect to backfill messages sent by the *other* participant while offline.
5. Delivery/read receipts arrive as separate small events referencing a message id, updating that message's status in place.`,
    deepDivesMarkdown: `### Message Ordering Across Devices and Reconnects
Client send-timestamps aren't trustworthy for ordering (clock skew, multi-device sends). The server assigns a monotonic per-conversation sequence number on receipt; the client always sorts by that sequence, using the client-side "sending" timestamp only as a placeholder position until the real sequence arrives. On reconnect, the client sends its last-known sequence number and the server replays anything newer — this is the same "resync from a checkpoint" idea used in the collaborative editor and notification system problems.

### Optimistic Send with Client-Generated IDs
Generating the message's unique id on the client (UUID) rather than waiting for the server to assign one is what makes an instant, idempotent-safe optimistic send possible: the same id is used locally and in the eventual server acknowledgment, so if the ack is delayed or duplicated (e.g., due to a retry from OutboxQueue), the client can deduplicate instead of showing the message twice.

### Offline Queuing and Retry
Messages composed offline go straight into the persisted OutboxQueue (IndexedDB, not just in-memory — a page refresh shouldn't lose queued messages) with status \`"queued"\`. On reconnect, ConnectionManager drains the queue in order. A message that fails permanently (e.g., blocked recipient) needs a distinct terminal status (\`"failed"\`) with a manual retry affordance, rather than retrying forever.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Message id assignment | Client-generated UUID | Enables true optimistic UI + idempotent retries, but requires server to accept/store the client id |
| Message id assignment | Server-assigned only | Simpler server model, but client can't show a "sent" message until round-trip completes |
| Ordering | Server sequence number | Correct under clock skew and multi-device, needs an extra reconciliation step client-side |
| Ordering | Client send timestamp | Simple, but wrong under clock skew or offline queuing |
| Transport | WebSocket | Low-latency, bidirectional, but needs custom reconnect/backoff/resync logic |
| Transport | HTTP long-polling | Simpler infra compatibility (proxies, older networks), but higher latency and overhead |
| Typing indicator delivery | Best-effort, unqueued | Cheap, and staleness doesn't matter — dropped events are fine |
| Typing indicator delivery | Queued/guaranteed like messages | Unnecessary overhead for a signal that's inherently ephemeral |`,
    realWorldExamplesMarkdown: `- **WhatsApp** generates message ids client-side and shows a clock → single check → double check → blue double check progression, exactly the "sending → sent → delivered → read" state machine described above.
- **Messenger** persists an outbox so a message composed with no signal sends automatically once connectivity returns, without the user re-typing anything.
- **Slack** resyncs missed messages on reconnect using a last-seen cursor per channel, the same checkpoint-and-replay pattern used here.`,
    relatedSlugs: ["notification-system", "collaborative-doc-editor", "news-feed"],
  },
  {
    slug: "collaborative-doc-editor",
    title: "Collaborative Document Editor",
    category: "frontend",
    difficulty: "hard",
    maangTags: ["Google"],
    order: 6,
    summary:
      "Design the client for a Google Docs-style editor where multiple users edit the same document simultaneously with live cursors.",
    requirementsMarkdown: `## Functional Requirements
- Multiple users can type into the same document concurrently, with each other's changes appearing in near real time.
- Show other users' live cursor positions and selections, labeled by name/color.
- Support undo/redo that behaves sensibly even amid concurrent remote edits.
- Work offline for a period and merge changes automatically on reconnect, without silently losing anyone's edits.

## Non-Functional Requirements
- Local typing must never be blocked or delayed by waiting for the network (local edits apply instantly; remote edits merge in).
- The merge algorithm must guarantee **convergence** — every client eventually sees the identical final document, regardless of the order edits are received in.
- Must scale to documents with thousands of paragraphs without the editor becoming sluggish (rendering, not just merge logic).

## Clarifying Questions
- Is rich formatting (bold, headings, embedded images) in scope, or plain text only?
- How many concurrent editors on one document should the design assume (2, or dozens)?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **EditorCore** — the contenteditable/custom text-rendering surface, translating raw keystrokes into structured operations (insert/delete at a position) rather than diffing raw text.
- **OperationTransformer / CRDT Engine** — the conflict-resolution layer; takes local and remote operations and produces a converged document state (see Deep Dives — OT vs CRDT).
- **PresenceChannel** — a lightweight WebSocket stream broadcasting cursor/selection position per user, separate from document content operations (different consistency/reliability needs).
- **LocalPersistenceLayer** — buffers unsent local operations (IndexedDB) so offline edits survive a reload and are replayed once reconnected.
- **DocumentRenderer** — renders the current converged document state; must apply incoming remote operations without disrupting the local user's cursor position or in-progress composition (e.g., IME input).

## Data Flow
1. User types → EditorCore emits a structured operation (e.g., \`insert("hello", position: 42)\`) applied to local state *immediately*.
2. The operation is sent to the server/other clients and also appended to LocalPersistenceLayer's pending-ops log.
3. Remote operations arrive continuously; the OT/CRDT Engine transforms/merges them against any locally pending (not-yet-acknowledged) operations before applying to the shared document model.
4. DocumentRenderer re-renders only the affected region, adjusting the local cursor position by the same transform applied to the document (so typing "at position 42" still lands in the right place even if a remote insert shifted everything after position 10).
5. PresenceChannel separately streams cursor/selection updates at a higher frequency but with no persistence/replay guarantee — losing a stale cursor position is harmless.`,
    deepDivesMarkdown: `### Operational Transformation (OT) vs. CRDTs
Two well-known approaches to convergent concurrent editing:
- **OT** transforms each incoming remote operation against any concurrent local operations so that applying them in either order produces the same result — this is what Google Docs originally used. It requires a central server to serialize a canonical operation order and is comparatively complex to implement correctly (transform functions must satisfy strict mathematical properties).
- **CRDTs** (Conflict-free Replicated Data Types) design the data structure itself (e.g., a linked list of uniquely-identified, tombstoned characters) so that merges are commutative and associative by construction — any merge order converges. This works well peer-to-peer (no central server required) at the cost of higher memory overhead (tombstones for deleted characters) and larger metadata per character.

Most modern collaborative editors (including newer versions of Google Docs, and libraries like Yjs/Automerge) lean CRDT because it simplifies offline support and multi-server architectures.

### Cursor Position Preservation Under Remote Edits
If another user inserts text before your cursor, your cursor must shift right by the inserted length — otherwise your next keystroke lands in the wrong place. This requires applying the *same transform function* used for document content to every tracked cursor/selection position, local and remote, every time an operation is applied.

### Offline Editing and Reconciliation
Offline edits accumulate in LocalPersistenceLayer as a queue of operations. On reconnect, the client doesn't just "replay" its queue on top of whatever the current server document is — it must transform its queued operations against everything that happened on the server while it was offline, which is exactly what the OT/CRDT engine is built to do. This is why ad hoc "last write wins" or naive text diffing fails at scale: it silently drops concurrent edits from other users instead of merging them.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Conflict resolution | Operational Transformation | Mature, used by Google Docs historically, but requires a central sequencing server and intricate transform correctness proofs |
| Conflict resolution | CRDT | Naturally peer-to-peer and offline-friendly, but higher per-character metadata overhead (tombstones) |
| Presence (cursors) | Separate unreliable channel | Cheap, high-frequency updates without persistence overhead |
| Presence (cursors) | Same reliable channel as document ops | Simpler infra (one channel), but wastes reliability/ordering guarantees on data that doesn't need them |
| Undo/redo scope | Local-only undo stack | Simple, but "undo" can fight with a remote edit that happened in between |
| Undo/redo scope | Server-aware undo (undo as a new transformed operation) | Correct under concurrency, significantly more complex to implement |`,
    realWorldExamplesMarkdown: `- **Google Docs** pioneered production OT at scale and has since incorporated CRDT-inspired techniques for newer collaborative surfaces.
- **Figma** uses a custom CRDT-like multiplayer system for its canvas, broadcasting property-level operations (not whole-object diffs) so hundreds of concurrent cursor/edit events stay cheap.
- **Notion** and **Linear** both use CRDT libraries (or CRDT-inspired custom sync engines) specifically to support robust offline editing with automatic merge on reconnect.`,
    relatedSlugs: ["real-time-chat-app", "rich-text-editor", "spreadsheet-application"],
  },
  {
    slug: "ecommerce-product-listing",
    title: "E-Commerce Product Listing Page",
    category: "frontend",
    difficulty: "medium",
    maangTags: ["Amazon"],
    order: 7,
    summary:
      "Design a product listing/search results page with filters, sorting, pagination, and fast perceived load time.",
    requirementsMarkdown: `## Functional Requirements
- Display a paginated/infinite grid of products with image, price, rating, and quick-add-to-cart.
- Support faceted filters (brand, price range, rating, availability) that combine with AND semantics, updating results and URL simultaneously.
- Support sort order (price, rating, relevance, newest) that composes with active filters.
- Preserve filter/sort/scroll state on back-navigation from a product detail page.

## Non-Functional Requirements
- Filter changes should feel instant even if the underlying query is server-side — use a loading skeleton over the existing grid, not a blank page.
- The page must be crawlable/shareable — filter state should live in the URL (query params), not just client memory.
- Images are the dominant payload; must lazy-load and reserve layout space to avoid cumulative layout shift.

## Clarifying Questions
- Server-side filtering (full catalog too large for client) or is a "search-as-you-filter" client-side experience acceptable for a bounded result set?
- Do results need to update live if inventory/price changes while the user is browsing?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **FilterPanel** — renders available facets and their counts, emits a structured filter-state object on change.
- **URLStateSync** — a two-way binding between the filter/sort/page state and the URL query string, so the state survives reload/back-navigation/sharing.
- **ResultsGrid** — renders the product grid, using a skeleton/placeholder overlay during in-flight filter changes rather than unmounting the previous results.
- **QueryClient** — debounced request layer that cancels a superseded filter request the same way the Autocomplete problem cancels stale suggestion requests.
- **ProductCard** — individual card with lazy image loading and reserved aspect-ratio box to prevent layout shift.

## Data Flow
1. Initial load parses filter/sort/page state from the URL, fires the query, renders ResultsGrid.
2. User toggles a filter checkbox → FilterPanel updates local filter state, URLStateSync pushes a new URL (replaceState, not pushState, for rapid toggles — pushState only on a "settled" change or explicit navigation, to avoid polluting browser history).
3. QueryClient cancels any in-flight request for the previous filter combination and issues a new one; ResultsGrid shows a dimmed/skeleton state over the *existing* results until the new ones arrive (avoids a jarring blank flash).
4. On product-detail navigation and back, the page is restored from the URL plus a cached scroll position (session storage keyed by the URL) rather than re-fetching from scratch.`,
    deepDivesMarkdown: `### URL as the Source of Truth for Filter State
Keeping filters purely in component state breaks shareable links, breaks the back button, and breaks reload. Serializing filter/sort/page into the URL query string (e.g., \`?brand=nike,adidas&minPrice=20&sort=price_asc&page=2\`) makes the page a pure function of the URL — which also simplifies server-side rendering, since the server can read the same query params to render the initial HTML.

### Avoiding Layout Shift and Jarring Reflows
Filter changes altering the result count/grid shape are a common cause of Cumulative Layout Shift (CLS) regressions. Two techniques address this: reserving a fixed aspect-ratio box for each product image before it loads (so the grid layout doesn't jump as images arrive), and keeping the *previous* result set visually present (dimmed) while a new filtered set loads, so the page doesn't collapse to a blank/short state mid-transition.

### Debounced, Cancelable Filter Requests
A user clicking through several filters quickly (e.g., unchecking one brand, checking another, adjusting price) shouldn't fire and wait for every intermediate combination. The request layer debounces rapid successive filter changes and cancels (via \`AbortController\` or a sequence-number check, as in the Autocomplete problem) any request that's superseded before it returns — otherwise a slow response for an old filter combination can render *after* a faster response for the current one, showing wrong results.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Filter state location | URL query params | Shareable, back-button friendly, SSR-friendly, but requires careful serialization/parsing |
| Filter state location | In-memory only | Simpler to wire up, but breaks sharing, reload, and back navigation |
| History updates on filter change | \`replaceState\` per toggle | Avoids flooding browser history with every checkbox click |
| History updates on filter change | \`pushState\` per toggle | Back button becomes a filter-undo tool, but history stack balloons with minor toggles |
| Result loading UX | Skeleton overlay on existing grid | Feels responsive, avoids blank flash, more implementation complexity |
| Result loading UX | Unmount and show spinner | Simpler, but jarring and increases perceived latency |`,
    realWorldExamplesMarkdown: `- **Amazon's** search results page encodes every active filter and sort choice in the URL, making filtered result sets directly shareable and bookmarkable.
- **Airbnb's** search page keeps the previous map/list results visible (dimmed) while a new filtered query loads, avoiding a blank-state flash.
- **Zalando/ASOS**-style fashion retailers reserve fixed aspect-ratio image boxes in their grids specifically to keep CLS scores low despite highly variable image dimensions from different suppliers.`,
    relatedSlugs: ["autocomplete-search", "infinite-scroll-feed"],
  },
  {
    slug: "notification-system",
    title: "Notification System",
    category: "frontend",
    difficulty: "medium",
    maangTags: ["Meta", "Google"],
    order: 8,
    summary:
      "Design the client for in-app and push notifications: real-time delivery, unread state, and cross-tab/cross-device consistency.",
    requirementsMarkdown: `## Functional Requirements
- Show a notification bell/badge with an unread count, and a dropdown/panel listing recent notifications.
- Deliver new notifications in near real time while the app is open, without requiring a manual refresh.
- Mark notifications as read individually or "mark all as read," syncing that state across open tabs and devices.
- Support browser push notifications when the tab is backgrounded or closed (via Service Worker + Push API).

## Non-Functional Requirements
- Unread count must never drift out of sync between multiple open tabs of the same account.
- Missed notifications (delivered while offline/closed) must be recoverable on next open, not silently lost.
- Should not spam the user — near-duplicate notifications (e.g., 10 likes on one post within a minute) should be batched/grouped client- or server-side.

## Clarifying Questions
- Are notifications purely informational, or do some require action (e.g., accept/decline a request) directly from the panel?
- Is there a defined notification taxonomy (social, system, billing) needing different visual treatment/priority?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **NotificationChannel** — a WebSocket (or SSE) connection delivering new-notification events while the tab is active, with reconnect-and-resync-from-checkpoint on drop (same pattern as the Chat problem).
- **NotificationStore** — client-side store of notifications keyed by id, tracking read/unread state, shared across tabs via \`BroadcastChannel\` or a shared storage event listener.
- **ServiceWorkerPushHandler** — receives push events when the page isn't open/focused, shows an OS-level notification, and updates a persisted badge count the next time the app opens.
- **NotificationBell** — the badge + dropdown UI, subscribed to NotificationStore's unread count.
- **NotificationPanel** — the list UI, paginated, with per-item mark-as-read and grouping of similar notifications.

## Data Flow
1. NotificationChannel delivers a new notification event; NotificationStore adds it, increments unread count, and re-renders NotificationBell.
2. The same event is broadcast to any other open tab via \`BroadcastChannel\`, so the badge count updates everywhere simultaneously rather than only in the tab that received the socket event.
3. User opens the panel and reads/dismisses a notification → NotificationStore updates local state immediately (optimistic) and fires a mark-as-read request; this update also broadcasts to other tabs.
4. On reconnect after being offline, NotificationChannel requests "everything since my last-seen checkpoint," backfilling anything missed — identical checkpoint-and-replay approach to the Chat and Collaborative Editor problems.
5. When the tab isn't open at all, the Service Worker's push handler shows an OS notification directly; on next app open, the client reconciles by fetching the current authoritative unread state from the server (not trusting any locally cached count, since it may be stale).`,
    deepDivesMarkdown: `### Cross-Tab Consistency
Two tabs of the same logged-in account showing different unread counts is a classic, very visible bug. \`BroadcastChannel\` (or a \`localStorage\` write-triggers-\`storage\`-event fallback for older browsers) lets one tab's read-state change propagate to every other open tab of the same origin instantly, without each tab needing its own independent server round-trip.

### Reconnect-and-Resync via Checkpoints
Exactly like the chat application, a dropped WebSocket connection must not simply reconnect and wait for the *next* new event — it must ask "what did I miss since sequence/timestamp N" and backfill. Without this, notifications generated while a laptop was asleep or a tab was backgrounded (and the browser suspended the socket) would silently vanish.

### Push Notifications via Service Worker
When the tab is closed or backgrounded, real-time delivery over an open socket isn't possible — the browser's Push API (via a Service Worker registered with a push subscription endpoint) lets the server wake the Service Worker even with no page open, which then calls \`registration.showNotification()\`. Because this can happen without the main app ever loading, any unread-count bookkeeping done here must be reconciled against the server's authoritative count the next time the app actually opens, rather than trusted as the source of truth.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Cross-tab sync | \`BroadcastChannel\` | Native, simple, instant, but not supported in every legacy environment (fallback needed) |
| Cross-tab sync | Poll server periodically per tab | Works everywhere, but wastes requests and has visible lag |
| Delivery while open | WebSocket/SSE | Real-time, low latency, needs reconnect/backoff/resync logic |
| Delivery while open | Periodic polling | Simple, robust to flaky networks, but not truly real-time |
| Notification grouping | Server-side batching | Consistent across all clients, but less flexible for per-client display preferences |
| Notification grouping | Client-side grouping | Flexible UI, but risks inconsistent grouping across different client versions |`,
    realWorldExamplesMarkdown: `- **Gmail** keeps unread counts synchronized instantly across multiple open tabs using cross-tab messaging, not independent per-tab polling.
- **Facebook** groups similar notifications ("John and 12 others liked your photo") server-side so the client never has to solve the batching problem itself.
- **Slack** uses the same reconnect-with-checkpoint approach for both messages and notification badges, so a laptop waking from sleep backfills exactly what was missed.`,
    relatedSlugs: ["real-time-chat-app", "news-feed"],
  },
  {
    slug: "video-streaming-player",
    title: "Video Streaming Player",
    category: "frontend",
    difficulty: "hard",
    maangTags: ["Netflix"],
    order: 9,
    summary:
      "Design a video player client that adapts to network conditions, buffers smoothly, and supports seeking through a long-form video.",
    requirementsMarkdown: `## Functional Requirements
- Play back adaptive-bitrate video (multiple quality renditions) with play/pause, seek, volume, and fullscreen controls.
- Automatically switch quality based on measured network throughput and buffer health, without visible playback interruption when possible.
- Support seeking to an arbitrary point in the video, including into not-yet-buffered regions.
- Show accurate buffering state and a scrubber that reflects both playback position and buffered ranges.

## Non-Functional Requirements
- Minimize startup latency (time to first frame) — shouldn't require downloading the entire lowest-quality rendition before playing.
- Rebuffering (playback stalls) should be rare and, when unavoidable, recovered from automatically without user intervention.
- Must work across wildly different network conditions (fiber to throttled mobile) with the same codebase.

## Clarifying Questions
- Live streaming (unbounded, low-latency) or video-on-demand (fixed-length, seekable)?
- Are DRM-protected streams in scope, affecting how segments are decrypted before decode?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **ManifestParser** — fetches and parses the adaptive streaming manifest (HLS \`.m3u8\` or DASH \`.mpd\`) listing available quality renditions and their segment URLs.
- **ABRController** (Adaptive Bitrate) — continuously estimates available bandwidth and current buffer health, deciding which quality rendition to request for each upcoming segment.
- **SegmentBuffer** — fetches video segments and appends them to a \`MediaSource\` \`SourceBuffer\`, managing eviction of already-played segments to bound memory.
- **PlaybackController** — wraps the \`<video>\` element, exposing play/pause/seek/volume and translating user scrub input into segment-fetch requests for the target time range.
- **PlayerUI** — controls bar, scrubber (showing both playback position and buffered ranges via \`video.buffered\`), and quality/settings menu.

## Data Flow
1. ManifestParser fetches the manifest, exposing available renditions (e.g., 360p/720p/1080p) each split into short segments (2-10s).
2. ABRController picks an initial (usually lowest-safe) rendition to minimize startup latency, then continuously re-estimates throughput from recent segment download times.
3. SegmentBuffer downloads the next segment at the ABRController's chosen quality and appends it via \`sourceBuffer.appendBuffer()\`; quality can change segment-to-segment without restarting playback.
4. User drags the scrubber to an unbuffered position → PlaybackController triggers a fetch for segments at that time range (possibly at a lower initial quality to reduce seek latency), then resumes normal ABR-driven buffering from there.
5. PlayerUI reads \`video.buffered\` (a \`TimeRanges\` object, not necessarily contiguous) to render which parts of the scrubber are actually downloaded versus not.`,
    deepDivesMarkdown: `### Adaptive Bitrate Algorithm
A simple throughput-based ABR estimates bandwidth from recent segment download times (bytes/time) and picks the highest rendition whose bitrate fits comfortably under that estimate. A buffer-based approach instead looks at how much video is already buffered — a shrinking buffer means "step down quality now," a healthy/growing buffer means "safe to step up." Production players (e.g., the BOLA algorithm used in some open-source players) combine both signals, because throughput-only estimation overreacts to transient network blips, while buffer-only estimation reacts too slowly to a genuine bandwidth drop.

### Startup Latency vs. Quality Trade-off
Fetching the highest-quality segment first minimizes total segments needed for a given buffer duration but risks a slow start if bandwidth is actually low. Most players intentionally start at a low-to-medium rendition regardless of measured bandwidth (a fast "time to first frame") and let the ABR controller step up within the first few segments once real throughput is observed — optimizing for perceived responsiveness over initial visual quality.

### Seeking Into Unbuffered Regions
A seek to an unbuffered timestamp can't just "wait" for sequential download to reach that point — it needs to abort in-flight segment fetches for the old position, fetch the manifest-indicated segment covering the new target time directly, and resume forward buffering from there. Because a fresh position has no prior throughput history, players commonly reset ABR to a conservative quality immediately after a large seek, to avoid an immediate stall from over-optimistically requesting a high-bitrate segment on unknown network conditions.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| ABR signal | Throughput-based | Reacts quickly to bandwidth changes, but noisy/overreacts to transient blips |
| ABR signal | Buffer-based | Smoother quality changes, but slower to react to a real sustained bandwidth drop |
| Initial quality | Start low, ramp up | Minimizes time-to-first-frame, temporarily lower visual quality |
| Initial quality | Start at best-estimated quality | Best quality from frame one if the estimate is right, higher risk of early stall if wrong |
| Segment buffer eviction | Aggressive (keep only near-playhead) | Lower memory usage, but a backward seek re-downloads recently played content |
| Segment buffer eviction | Retain a large trailing window | Backward seeking is instant, higher memory footprint |`,
    realWorldExamplesMarkdown: `- **Netflix** tunes its ABR heuristics per device class (TV, mobile, browser) since buffer memory constraints and typical network profiles differ significantly.
- **YouTube's** player visibly starts at a conservative resolution and steps up within the first several seconds on a fast connection — observable by watching the quality indicator during playback start.
- **Twitch** (live, not VOD) prioritizes minimizing live-edge latency over buffer depth, accepting more frequent quality drops in exchange for staying closer to real-time.`,
    relatedSlugs: ["image-carousel"],
  },
  {
    slug: "drag-and-drop-file-uploader",
    title: "Drag-and-Drop File Uploader",
    category: "frontend",
    difficulty: "medium",
    maangTags: ["Google", "Amazon"],
    order: 10,
    summary:
      "Design a file upload widget supporting drag-and-drop, multi-file progress, chunked uploads, and resumability.",
    requirementsMarkdown: `## Functional Requirements
- Accept files via drag-and-drop onto a drop zone or a traditional file input, supporting multiple files at once.
- Show per-file upload progress, and an aggregate overall progress indicator.
- Support pausing, resuming, and canceling an individual upload.
- Resume an interrupted upload (network drop, browser crash) from where it left off rather than restarting from zero.

## Non-Functional Requirements
- Large files (multi-GB) must not be held entirely in memory at once — read and upload in chunks.
- Uploading multiple files concurrently should be bounded (not one connection per file unconditionally) to avoid overwhelming the network or hitting browser connection limits.
- Must validate file type/size client-side before upload, giving immediate feedback rather than failing after a slow upload completes.

## Clarifying Questions
- Do uploads need to survive a full page reload (not just a network blip), which affects where progress/chunk state is persisted?
- Is there a maximum file size or type restriction dictated by the backend that the client should enforce proactively?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **DropZone** — handles \`dragenter\`/\`dragover\`/\`drop\` events and the traditional \`<input type="file">\` fallback, normalizing both into a common file list.
- **FileValidator** — checks type/size/count against configured constraints before any upload begins, rejecting invalid files immediately with a clear message.
- **ChunkUploader** (per file) — splits a file into fixed-size chunks (via \`Blob.slice()\`), uploads them sequentially or in small parallel batches, and tracks which chunk indices have been acknowledged by the server.
- **UploadQueueManager** — bounds the number of files uploading concurrently (e.g., 3 at a time), queuing the rest.
- **UploadProgressStore** — persists per-file chunk-acknowledgment state (e.g., in IndexedDB) so an interrupted upload can resume rather than restart, even across a page reload.

## Data Flow
1. Files enter via drop or file-input; FileValidator immediately accepts or rejects each based on type/size rules.
2. Accepted files enqueue into UploadQueueManager, which starts ChunkUploader instances up to the concurrency limit.
3. Each ChunkUploader slices its file into chunks, requests an upload session id from the server (or resumes an existing one if UploadProgressStore has a persisted session for this file's fingerprint), and uploads chunks, updating progress after each acknowledged chunk.
4. On network failure mid-chunk, that chunk is retried with backoff; on a full disconnect, the upload pauses and resumes automatically once connectivity returns, continuing from the last acknowledged chunk index rather than chunk zero.
5. When all chunks for a file are acknowledged, the client calls a "finalize" endpoint so the server assembles/validates the complete file, and UploadProgressStore clears that file's persisted state.`,
    deepDivesMarkdown: `### Chunked Upload and Resumability
Splitting a file into fixed-size chunks (\`file.slice(start, end)\`) via the Blob API means an upload can be paused/resumed at chunk granularity rather than all-or-nothing. Resumability requires the server to track which chunk indices it has already received for a given upload session, and the client to persist that same bookkeeping locally (IndexedDB, since \`localStorage\` isn't suited to potentially large binary state) so a page reload doesn't lose the resume point — the client re-asks "which chunks have you received for session X" on resume rather than assuming.

### Concurrency Limits Across Files and Chunks
Browsers cap concurrent connections per origin (historically ~6 for HTTP/1.1, though HTTP/2 multiplexing changes this). Uploading 20 files with unlimited chunk parallelism per file would starve bandwidth fairness between files and risk hitting connection limits. UploadQueueManager bounds concurrent *files*, and each ChunkUploader further bounds concurrent *chunks* within a file, giving two tunable levels of parallelism.

### Client-Side Validation Before Network Cost
Validating file type/size at drop time (before any bytes are sent) gives instant feedback and avoids wasting bandwidth on an upload that will be rejected server-side anyway. This must be treated as a UX optimization only, not a security boundary — the server must re-validate everything, since client-side checks are trivially bypassable.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Upload strategy | Chunked with resumable sessions | Handles large files and flaky networks gracefully, more server/client protocol complexity |
| Upload strategy | Single whole-file request | Simple, but any interruption means restarting the entire upload from scratch |
| Concurrency | Bounded queue (e.g., 3 files at once) | Predictable bandwidth usage, slower aggregate throughput on fast connections |
| Concurrency | Unbounded parallel uploads | Maximizes throughput on fast/uncongested networks, risks connection exhaustion and poor fairness |
| Resume state storage | IndexedDB | Survives page reload/crash, added persistence-layer complexity |
| Resume state storage | In-memory only | Simpler, but a reload loses all resume progress |`,
    realWorldExamplesMarkdown: `- **Google Drive/Photos** uploads large files in resumable chunked sessions, visibly resuming from a partial percentage after a network drop rather than restarting.
- **Dropbox's** web uploader bounds concurrent file uploads and shows both per-file and aggregate progress, matching the queue-manager design above.
- **YouTube Studio's** video uploader tolerates closing and reopening the tab mid-upload for very large video files, relying on server-tracked chunk acknowledgment to resume correctly.`,
    relatedSlugs: ["rich-text-editor"],
  },
  {
    slug: "modal-dialog-manager",
    title: "Modal / Dialog Management System",
    category: "frontend",
    difficulty: "easy",
    maangTags: ["Apple", "Meta"],
    order: 11,
    summary:
      "Design a reusable system for opening, stacking, and dismissing modal dialogs across a large application, with full accessibility support.",
    requirementsMarkdown: `## Functional Requirements
- Any part of the app can imperatively open a modal (confirmation, form, alert) without prop-drilling through the component tree.
- Support stacking multiple modals (a confirmation dialog opened from within another modal) with correct visual layering and dismiss order.
- Dismiss via close button, backdrop click, or Escape key, with an optional "prevent dismiss" mode for critical confirmations.
- Return focus to the triggering element when a modal closes.

## Non-Functional Requirements
- Fully accessible: focus trapped within the open modal, \`aria-modal\`, correct \`role="dialog"\`, and screen-reader announcement on open.
- Must not allow background content to scroll or be interacted with while a modal is open.
- Rendering must escape any parent's \`overflow: hidden\`/z-index stacking context (via portal), regardless of where in the tree the trigger lives.

## Clarifying Questions
- Do any modals need to be non-dismissible until an async action completes (e.g., a payment confirmation mid-flight)?
- Should routing (browser back button) be able to close the topmost modal, requiring history integration?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **ModalProvider** — a top-level context/store holding the current stack of open modals (array of modal descriptors: component + props + options).
- **ModalRoot** — a single portal-rendered container (mounted once near the document root) that renders the entire modal stack in order, so z-index and DOM order are centrally controlled.
- **useModal() hook / imperative API** — lets any component call \`openModal(Component, props)\` and receive back a promise or callback resolved when that modal closes (e.g., with the user's confirm/cancel choice).
- **FocusTrap** — a wrapper around each rendered modal that constrains Tab/Shift+Tab cycling to elements within it, and restores focus to the previously focused element on unmount.
- **BackdropManager** — renders one shared backdrop per stack depth (or a single backdrop under the topmost modal), handling click-outside-to-dismiss and locking body scroll while any modal is open.

## Data Flow
1. Some component calls \`openModal(ConfirmDialog, { message })\` → ModalProvider pushes a new descriptor onto its stack, generating a unique id.
2. ModalRoot re-renders, mounting a new \`FocusTrap\`-wrapped instance for the new top-of-stack modal; FocusTrap captures the currently focused element for later restoration and moves focus inside itself.
3. User interacts with the modal (confirms/cancels) → the modal component calls a \`close(result)\` function passed to it, which resolves the caller's promise and pops that descriptor off the stack.
4. FocusTrap restores focus to the originally focused element as that modal unmounts; if another modal remains beneath it in the stack, it (still mounted) regains interactivity.
5. Body scroll lock is released only once the stack is fully empty, not after each individual modal closes, since a modal beneath the closed one is still open.`,
    deepDivesMarkdown: `### Focus Trapping and Restoration
Keyboard and screen-reader users must not be able to Tab out of an open modal into background content. On open, the FocusTrap records \`document.activeElement\`, moves focus to the modal's first focusable element (or the modal container itself if configured), and intercepts Tab/Shift+Tab at the boundary to wrap focus back within the modal. On close, focus must be explicitly restored to the recorded element — without this, keyboard users are left with focus reset to \`<body>\`, a common and easily-missed accessibility bug.

### Stacking Multiple Modals
A stack (not a single "isOpen" boolean) is required because opening a confirmation dialog from within a form modal is common (e.g., "discard unsaved changes?"). Each stack entry needs its own FocusTrap scope — closing the top modal must hand focus back to the modal beneath it, not all the way back to the original page trigger, until *that* one closes too. Z-index/DOM order must follow stack order so a newly opened modal always visually sits above earlier ones.

### Imperative API Over Render-Prop/Prop-Drilling
Modals are triggered from arbitrary, often deeply nested locations in the tree (a button inside a table row inside a page). Requiring every intermediate component to pass down an \`isOpen\`/\`setIsOpen\` pair doesn't scale. An imperative \`openModal()\` call backed by a single top-level context avoids prop drilling entirely, and returning a promise from \`openModal()\` lets calling code \`await\` the user's decision naturally (\`const confirmed = await openModal(ConfirmDialog)\`), instead of managing callback props.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| API style | Imperative (\`openModal()\` from anywhere) | No prop drilling, natural async/await usage, less "declarative React" idiomatic |
| API style | Declarative (\`<Modal open={x}>\` in JSX) | Fits React idioms, but requires lifting state up through the tree to wherever the modal is rendered |
| Rendering location | Portal to a single root container | Escapes parent overflow/z-index issues, centralizes stacking logic |
| Rendering location | Rendered in place in the component tree | Simpler mental model, but fragile against parent \`overflow: hidden\` or transform-created stacking contexts |
| Multiple modals | Full stack with independent focus traps | Correctly supports nested confirmation flows |
| Multiple modals | Single modal slot (new replaces old) | Simpler, but breaks the common "confirm inside a form modal" pattern |`,
    realWorldExamplesMarkdown: `- **macOS/iOS system dialogs** (which Apple's HIG heavily documents) enforce strict focus containment and return focus precisely to the triggering control, the reference standard this design mirrors.
- **Radix UI's** Dialog primitive (widely used underneath component libraries like shadcn/ui) implements portal rendering, focus trapping, and scroll locking exactly as separable concerns, matching this component breakdown.
- **Facebook/Meta's** internal component libraries use a similar imperative modal-stack service so any product surface can trigger a confirmation dialog without threading modal state through unrelated components.`,
    relatedSlugs: ["design-system-component-library"],
  },
  {
    slug: "rich-text-editor",
    title: "Rich Text Editor",
    category: "frontend",
    difficulty: "hard",
    maangTags: ["Google", "Meta"],
    order: 12,
    summary:
      "Design the client architecture for a WYSIWYG rich text editor (bold, lists, links, embeds) with predictable, testable state.",
    requirementsMarkdown: `## Functional Requirements
- Support inline formatting (bold, italic, links) and block-level structures (headings, lists, blockquotes) via toolbar and keyboard shortcuts.
- Support copy/paste that intelligently converts pasted HTML/rich content into the editor's own model, not raw arbitrary markup.
- Support undo/redo with sensible grouping (e.g., a burst of typed characters undoes as one step, not one keystroke at a time).
- Serialize to and deserialize from a stable document format (e.g., JSON) for saving/loading, independent of the live DOM.

## Non-Functional Requirements
- Must not rely on parsing/diffing raw \`contenteditable\` DOM as the source of truth — the DOM is a rendering target, not the model.
- Typing latency must stay imperceptible even in large documents (thousands of words) — no full-document re-render per keystroke.
- Must resist browsers' inconsistent and often buggy native \`contenteditable\` behaviors (each browser handles things like nested lists differently).

## Clarifying Questions
- Is real-time multi-user collaboration in scope (pulling in the Collaborative Editor problem), or single-user only?
- Do embeds (images, videos, mentions) need to be first-class model nodes, or is this a plain-text-plus-formatting editor only?`,
    highLevelDesignMarkdown: `## Component Breakdown
- **DocumentModel** — a structured tree (not raw HTML) representing the document as nodes (paragraph, heading, list, text run with marks like bold/italic), the actual source of truth.
- **Renderer** — a pure function from DocumentModel to DOM, re-rendering only changed nodes (a targeted diff, conceptually similar to a virtual DOM, but text-editing-aware).
- **InputHandler** — intercepts native \`contenteditable\` input/composition events and *translates* them into DocumentModel mutations (insert text, split paragraph, apply mark) rather than trusting the browser's raw DOM mutation.
- **SelectionManager** — maps between the DocumentModel's logical positions (node + offset) and the browser's native \`Selection\`/\`Range\` objects, since the model's coordinate space and the DOM's don't always match 1:1 (especially across re-renders).
- **HistoryManager** — records DocumentModel deltas (not DOM snapshots) for undo/redo, batching rapid same-type edits (consecutive character insertions) into a single history entry.
- **PasteNormalizer** — parses pasted \`text/html\` clipboard content into DocumentModel nodes, stripping unsupported markup and mapping recognized tags (\`<b>\`, \`<ul>\`, etc.) to model equivalents.

## Data Flow
1. User types a character → the browser's native \`beforeinput\` event fires; InputHandler intercepts it, computes the corresponding DocumentModel mutation (insert character at logical position), and applies it to the model — critically, *preventing* the browser's own default DOM mutation so the model stays authoritative.
2. Renderer re-renders only the changed node(s) in the DOM; SelectionManager immediately re-establishes the native selection/cursor at the equivalent logical position in the freshly rendered DOM (since a DOM re-render can otherwise lose cursor position).
3. Toolbar "Bold" click reads the current selection's logical range from SelectionManager, applies a bold mark to that range in DocumentModel, and triggers the same render-then-restore-selection cycle.
4. HistoryManager watches model mutations, coalescing a rapid sequence of single-character inserts into one undo step, but always giving structural changes (e.g., "convert to heading") their own discrete step.
5. Paste: the browser's clipboard HTML is intercepted (default paste prevented), parsed by PasteNormalizer into DocumentModel nodes, and inserted at the current selection — arbitrary/unsupported markup (e.g., inline styles, tracking spans) is dropped in the process.`,
    deepDivesMarkdown: `### Model-First, Not DOM-First
The single most important architectural decision: \`contenteditable\`'s native DOM mutations are inconsistent across browsers and hard to reason about as a source of truth. Instead, the editor intercepts input at the \`beforeinput\`/\`keydown\` level, computes the intended change against a clean structured DocumentModel, applies it there, and re-renders the DOM *from* the model — the DOM becomes a projection of the model, never the other way around. This is the architecture behind ProseMirror, Slate, and Lexical.

### Selection/Cursor Position Across Re-Renders
Every model mutation triggers a DOM re-render, which — done naively — destroys and recreates DOM nodes, losing the native cursor position entirely (typing would visually jump to the start of the document). SelectionManager must translate the pre-mutation cursor's logical (node, offset) position through the mutation into a new logical position, then imperatively set the native \`Range\`/\`Selection\` to match immediately after each render, every single keystroke.

### Paste Sanitization and Normalization
Pasting from Word, Google Docs, or a webpage brings deeply nested, inconsistent HTML with inline styles, tracking spans, and unsupported tags. Blindly inserting that into \`contenteditable\` corrupts the model and creates invisible formatting debt. PasteNormalizer parses the clipboard's \`text/html\` payload against an allowlist of recognized tags/attributes, discarding everything else, so pasted content always maps cleanly onto existing DocumentModel node types.

### Undo/Redo Grouping
Recording history at the DOM-snapshot level is both wasteful and produces a bad UX (undoing one keystroke at a time). Recording at the model-mutation level, and coalescing runs of the same mutation type (e.g., consecutive \`insertText\` calls within a short time window) into a single history entry, is what makes undo feel like it operates on "words" or "actions" rather than individual keystrokes.`,
    tradeoffsMarkdown: `| Decision | Option | Trade-off |
|---|---|---|
| Source of truth | Structured DocumentModel, DOM as render target | Predictable, testable, cross-browser consistent, but requires reimplementing input handling browsers give for free |
| Source of truth | Raw \`contenteditable\` DOM | Native browser behavior "for free," but wildly inconsistent across browsers and hard to serialize/diff reliably |
| History granularity | Per-keystroke | Simplest to implement, but produces a tedious one-character-at-a-time undo experience |
| History granularity | Coalesced by edit type/time window | Feels natural ("undo the last sentence"), added bookkeeping complexity |
| Paste handling | Normalize/sanitize into model nodes | Consistent formatting, discards some pasted styling users may have wanted |
| Paste handling | Insert raw pasted HTML | Preserves original formatting fidelity, risks corrupting the model/DOM consistency |`,
    realWorldExamplesMarkdown: `- **Lexical** (Meta's editor framework, used in Facebook's comment/post composer) is explicitly model-first, treating the DOM purely as a reconciliation target, mirroring this design directly.
- **Google Docs'** editor doesn't use native \`contenteditable\` at all for its core canvas — it renders its own text layout engine specifically to sidestep browser \`contenteditable\` inconsistencies entirely.
- **ProseMirror** (underlying many editors, including early versions of the New York Times' CMS) popularized the structured-schema-plus-transaction model this design is based on.`,
    relatedSlugs: ["collaborative-doc-editor", "drag-and-drop-file-uploader"],
  },
];
