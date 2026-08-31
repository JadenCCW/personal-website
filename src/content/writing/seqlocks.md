---
title: "Seqlocks in C++"
date: 2026-08-30
description: "Why seqlocks conflict with the C++ memory model"
---

_This is my first post, mainly just so that I have content on this board. I wrote about something that I recently read about._

A seqlock is useful when data is read often but rarely changed. The writer makes a counter odd, updates the data, then makes the counter even again. A reader will copy the data only when the counter has the same even value before and after the copy.

$$
\operatorname{accept}(D)
\iff
s_{\mathrm{before}} = s_{\mathrm{after}}
\;\land\;
s_{\mathrm{before}} \bmod 2 = 0
$$

<div class="diagram-wrap">
  <svg class="diagram" viewBox="0 0 660 356" role="img" aria-labelledby="seqlock-title seqlock-desc">
  <title id="seqlock-title">A read overlapping a write</title>
  <desc id="seqlock-desc">The reader copies the data while the sequence counter is odd, so its snapshot is torn. Reading the counter again returns 6 instead of the 4 it started with, and the reader retries.</desc>
  <rect class="band" x="16" y="110" width="628" height="144" />
  <text class="band-label" x="124" y="102">sequence is odd - write in progress</text>
  <line class="lane" x1="110" y1="52" x2="110" y2="340" />
  <line class="lane" x1="550" y1="52" x2="550" y2="340" />
  <text class="lane-head" x="110" y="34" text-anchor="middle">Reader</text>
  <text class="lane-head" x="550" y="34" text-anchor="middle">Writer</text>
  <circle class="tick" cx="110" cy="80" r="3" />
  <text class="ev" x="124" y="85">reads sequence = 4</text>
  <circle class="tick" cx="550" cy="122" r="3" />
  <text class="ev" x="536" y="127" text-anchor="end">sets sequence = 5</text>
  <circle class="tick" cx="550" cy="158" r="3" />
  <text class="ev" x="536" y="163" text-anchor="end">updates data</text>
  <circle class="tick" cx="110" cy="200" r="3" />
  <text class="ev" x="124" y="205">copies data</text>
  <text class="ev-note" x="212" y="205"><-- torn snapshot</text>
  <circle class="tick" cx="550" cy="242" r="3" />
  <text class="ev" x="536" y="247" text-anchor="end">sets sequence = 6</text>
  <circle class="tick" cx="110" cy="284" r="3" />
  <text class="ev" x="124" y="289">reads sequence = 6</text>
  <circle class="tick" cx="110" cy="320" r="3" />
  <text class="ev" x="124" y="325">4 != 6 - reject and retry</text>
</svg>
</div>

The problem is when the data gets copied. If a writer modifies data at the same time, the reader and writer are accessing ordinary memory concurrently, so the program has a data race. It does not matter that the reader checks the counter and discards the bad copy. It also does not matter whether `Data` is trivially copyable. The compiler assumes there are no data races during optimization, so the program is undefined in C++.

```cpp
std::atomic<uint64_t> sequence{0};
Data data;

Data read() {
    while (true) {
        auto before = sequence.load(std::memory_order_seq_cst);
        if (before & 1)
            continue;

        Data copy = data;  // ordinary unprotected access

        auto after = sequence.load(std::memory_order_seq_cst);
        if (before == after)
            return copy;
    }
}
```

A portable implementation must remove the conflicting non-atomic access. Using `std::atomic<Data>` is simple, but it may fall back to an internal lock when `Data` is not lock-free. Another option is to atomically publish a pointer to an immutable snapshot, which replaces the data race with allocation and memory-reclamation costs. [Kernel implementations](https://docs.kernel.org/locking/seqlock.html#) rely on operations such as `READ_ONCE`, `WRITE_ONCE` and explicit compiler/CPU barriers to keep memory accesses ordered around the sequence checks.