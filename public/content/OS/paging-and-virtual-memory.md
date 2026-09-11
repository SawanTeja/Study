# Phase 7 — Paging & Virtual Memory

This is one of the **highest-priority OS topics for interviews**. You should be comfortable with both the concepts and numerical problems.

---

# 23. Paging

## 23.1 What is Paging?

**Paging is a memory-management technique that divides:**

* Logical/virtual memory into fixed-size blocks called **pages**
* Physical memory into fixed-size blocks called **frames**

A page and a frame are always the **same size**.

The OS maps:

> **Virtual Page → Physical Frame**

This allows a process to occupy **non-contiguous locations** in physical memory.

### Why do we need paging?

Without paging, a process may require one large contiguous block of physical memory.

For example:

```text
Process requires 20 MB

Physical memory:
+----+----+----+----+----+----+
| OS | P1 |Free| P2 |Free|Free|
+----+----+----+----+----+----+
```

There might be 20 MB of total free memory, but not 20 MB of **contiguous** free memory.

Paging solves this by allowing the process to be split:

```text
Process:
Page 0
Page 1
Page 2
Page 3
```

and these pages can go into different physical frames:

```text
Page 0 → Frame 7
Page 1 → Frame 2
Page 2 → Frame 10
Page 3 → Frame 4
```

So paging eliminates **external fragmentation**.

---

# 23.2 Pages

A **page** is a fixed-size block of virtual/logical memory.

Common page sizes include:

* 4 KB
* 8 KB
* 2 MB
* 1 GB for certain huge-page configurations

For interview numericals, **4 KB** is very common.

Example:

```text
Page size = 4 KB
Process size = 16 KB

Number of pages = 16 KB / 4 KB
                = 4 pages
```

If the process size isn't an exact multiple:

```text
Process size = 10 KB
Page size = 4 KB

Pages required = ceil(10 / 4)
               = 3 pages
```

The last page will only be partially used.

This unused space is called **internal fragmentation**.

---

# 23.3 Frames

A **frame** is a fixed-size block of physical RAM.

If:

```text
Page size = 4 KB
```

then:

```text
Frame size = 4 KB
```

Physical memory is divided into frames.

Example:

```text
Physical Memory

Frame 0
Frame 1
Frame 2
Frame 3
Frame 4
...
Frame 1023
```

A page can be loaded into any available frame.

---

# 23.4 Page Table

The OS needs to know:

> "Which physical frame contains this virtual page?"

The **page table** stores this mapping.

Example:

| Page Number | Frame Number |
| ----------: | -----------: |
|           0 |            5 |
|           1 |            2 |
|           2 |            8 |
|           3 |            1 |

Meaning:

```text
Page 0 → Frame 5
Page 1 → Frame 2
Page 2 → Frame 8
Page 3 → Frame 1
```

Each process generally has its own page table.

---

# 23.5 Page Number and Offset

A virtual address is divided into:

```text
+-------------------+----------------+
|    Page Number    |     Offset     |
+-------------------+----------------+
```

The:

* **Page number** identifies which page
* **Offset** identifies the exact byte within that page

The page number is used to index the page table.

The offset remains unchanged during address translation.

---

# 23.6 Logical → Physical Address Translation

Suppose:

```text
Page size = 4 KB
Virtual address = 13,000
```

Since:

```text
4 KB = 4096 bytes
```

Calculate:

```text
Page number = 13000 / 4096
            = 3
```

Integer division gives:

```text
Page number = 3
```

Offset:

```text
13000 % 4096 = 712
```

So:

```text
Virtual address:
Page = 3
Offset = 712
```

Suppose the page table says:

```text
Page 3 → Frame 7
```

Then the physical address is:

```text
Physical address
= Frame number × Page size + Offset

= 7 × 4096 + 712
= 28,672 + 712
= 29,384
```

Therefore:

```text
Virtual address 13000
        ↓
Page 3, Offset 712
        ↓
Page table
        ↓
Frame 7
        ↓
Physical address 29384
```

### Critical interview point

**The offset does not change.**

Only:

```text
Page number → Frame number
```

changes.

---

# 23.7 Page Size

Page size is normally a power of 2:

```text
2^n bytes
```

This makes address division extremely easy in hardware.

For example:

```text
Page size = 4 KB
         = 4096 bytes
         = 2^12
```

Therefore the offset requires:

```text
12 bits
```

If the virtual address is 32 bits:

```text
Virtual address = 32 bits
Offset          = 12 bits
Page number     = 32 - 12
                = 20 bits
```

So:

```text
+--------------------+------------+
| Page number (20)   | Offset (12)|
+--------------------+------------+
```

Number of virtual pages:

```text
2^20 = 1,048,576 pages
```

---

# 23.8 Number of Pages

Formula:

```text
Number of pages =
ceil(Process size / Page size)
```

Example:

```text
Process = 17 KB
Page size = 4 KB

Pages = ceil(17 / 4)
      = 5
```

---

# 23.9 Number of Frames

Formula:

```text
Number of frames =
Physical memory size / Frame size
```

Example:

```text
Physical memory = 1 GB
Frame size = 4 KB
```

Convert:

```text
1 GB = 2^30 bytes
4 KB = 2^12 bytes
```

Therefore:

```text
Frames = 2^30 / 2^12
       = 2^18
       = 262,144 frames
```

---

# Important Paging Formulas

Memorize these:

```text
Number of pages
= ceil(Process size / Page size)

Number of frames
= Physical memory / Frame size

Page number
= Virtual address / Page size

Offset
= Virtual address % Page size

Physical address
= Frame number × Page size + Offset
```

---

# 24. Page Table

## 24.1 Page Table Entry

A **Page Table Entry (PTE)** contains information about a page.

At minimum, it contains:

```text
Virtual Page Number → Physical Frame Number
```

But a real PTE contains additional information.

Common fields include:

### Frame number

Tells where the page is located in physical memory.

### Present/Valid bit

Indicates whether the page is currently in physical memory.

```text
1 → page is in memory
0 → page isn't currently in memory
```

If it is not present and the process accesses it, a **page fault** occurs.

### Protection bits

Control operations such as:

```text
Read
Write
Execute
```

For example:

```text
Read-only page
```

cannot be written to.

### Reference/Accessed bit

Indicates that the page has recently been accessed.

Used by algorithms such as:

* LRU approximations
* Clock / Second Chance

### Dirty/Modified bit

Indicates that the page has been modified since being loaded into memory.

If a dirty page is evicted, it generally needs to be written back to disk.

### Other bits

Real systems may also have bits related to:

* caching
* privilege level
* execute permission
* copy-on-write
* memory types

For interviews, the important ones are:

> **Frame number, valid/present bit, protection bits, reference/accessed bit, dirty bit.**

---

# 24.2 Page Table Lookup

Suppose:

```text
Virtual address
     ↓
Page number + offset
     ↓
Page table lookup
     ↓
Frame number
     ↓
Frame number + same offset
     ↓
Physical address
```

Example:

```text
Page size = 4 KB

Virtual address = 5000
```

Then:

```text
Page number = 5000 / 4096 = 1
Offset      = 5000 % 4096 = 904
```

Suppose:

```text
Page 1 → Frame 9
```

Then:

```text
Physical address
= 9 × 4096 + 904
= 37768
```

---

# 24.3 Why is a Page Table Problematic?

A page table lookup itself requires memory access.

Suppose:

```text
CPU generates virtual address
        ↓
Access page table in memory
        ↓
Get frame number
        ↓
Access actual data in memory
```

If memory access takes 100 ns:

```text
Page table lookup = 100 ns
Actual memory access = 100 ns

Total = 200 ns
```

Every memory access could become roughly **twice as expensive**.

This is why we need the **TLB**.

---

# 24.4 Multi-Level Page Tables

A single-level page table can become extremely large.

Suppose:

```text
32-bit virtual address
Page size = 4 KB = 2^12
```

Number of pages:

```text
2^32 / 2^12
= 2^20
```

So there are:

```text
1,048,576 page table entries
```

If each PTE is 4 bytes:

```text
Page table size
= 2^20 × 4
= 2^22 bytes
= 4 MB
```

That's just for **one process**.

For a 64-bit address space, the problem can become much larger.

---

# 24.5 Why Multi-Level Page Tables?

Most processes don't actually use their entire virtual address space.

For example, a process may use only:

```text
100 MB
```

of a possible huge address space.

A single-level page table still needs entries covering the entire virtual address space.

A **multi-level page table** divides the page table into smaller pieces.

Instead of:

```text
Virtual address
       ↓
Huge Page Table
```

we have:

```text
Virtual address
       ↓
Level 1
       ↓
Level 2
       ↓
Page Table
       ↓
Frame
```

Unused portions of the address space don't need their lower-level page tables allocated.

### Main advantage

> **Saves memory for sparse address spaces.**

### Disadvantage

More levels mean potentially more memory accesses during a page-table walk.

The TLB helps mitigate this.

---

# 24.6 Multi-Level Address

For a two-level page table:

```text
+---------+---------+---------+
| Level 1 | Level 2 | Offset  |
+---------+---------+---------+
```

For example:

```text
32-bit address
Page size = 4 KB = 2^12

Offset = 12 bits

Remaining:
32 - 12 = 20 bits
```

Suppose we divide it:

```text
10 bits | 10 bits | 12 bits
```

Then:

```text
10 bits → Level 1 index
10 bits → Level 2 index
12 bits → Offset
```

Translation:

```text
Virtual Address
     |
     +--> Level 1 index
              |
              +--> Level 2 table
                       |
                       +--> Level 2 index
                                |
                                +--> Frame number
                                         |
                                         +--> Offset
```

---

# 24.7 Page Table Size

Basic formula:

```text
Page table size
= Number of pages × Size of each PTE
```

And:

```text
Number of pages
= Virtual address space / Page size
```

Therefore:

```text
Page table size
= (Virtual address space / Page size)
  × PTE size
```

### Example

```text
Virtual address = 32 bits
Page size = 4 KB
PTE = 4 bytes
```

Virtual address space:

```text
2^32 bytes
```

Pages:

```text
2^32 / 2^12
= 2^20
```

Page table:

```text
2^20 × 4
= 2^22 bytes
= 4 MB
```

---

# 25. TLB

## 25.1 What is TLB?

**TLB = Translation Lookaside Buffer**

It is a small, fast cache that stores recently used:

```text
Virtual Page Number → Physical Frame Number
```

mappings.

It is typically implemented using very fast associative hardware.

Think of it as:

> **A cache for page-table translations.**

---

# 25.2 Why Does TLB Exist?

Without TLB:

```text
CPU
 ↓
Page table in RAM
 ↓
Physical memory
```

Two memory accesses are needed.

With TLB:

```text
CPU
 ↓
TLB
 ↓
Physical memory
```

On a TLB hit, we can avoid the page-table memory access.

---

# 25.3 TLB Hit

Suppose CPU wants virtual page 5.

TLB contains:

```text
Page 5 → Frame 12
```

This is a **TLB hit**.

Translation is obtained immediately from the TLB.

Then:

```text
Frame 12 + Offset
```

is used to access physical memory.

---

# 25.4 TLB Miss

Suppose CPU wants:

```text
Page 5
```

but TLB doesn't contain it.

That's a **TLB miss**.

Then:

```text
CPU
 ↓
TLB miss
 ↓
Page table lookup
 ↓
Find frame
 ↓
Update TLB
 ↓
Access physical memory
```

Important:

> **TLB miss does NOT necessarily mean page fault.**

This is a very common interview question.

### TLB miss

Translation isn't in the TLB.

### Page fault

The required page isn't currently in physical memory.

You can have:

```text
TLB miss + page present in RAM
```

and therefore **no page fault**.

---

# 25.5 TLB + Page Table + Memory

Consider:

```text
CPU generates virtual address
        |
        v
       TLB
      /   \
   Hit     Miss
    |        |
    |        v
    |    Page Table
    |        |
    |        v
    |      Frame
    |        |
    +--------+
         |
         v
   Physical Memory
```

### TLB hit

```text
Virtual address
      ↓
     TLB
      ↓
Frame number
      ↓
Physical memory
```

### TLB miss

```text
Virtual address
      ↓
     TLB
      ↓
   Page table
      ↓
Frame number
      ↓
Physical memory
```

---

# 25.6 Effective Access Time — EAT

This is extremely important for interviews.

Suppose:

```text
TLB lookup time = t
Memory access time = m
TLB hit ratio = h
```

Assume:

* TLB hit → TLB lookup + memory access
* TLB miss → TLB lookup + page-table memory access + actual memory access

Then:

```text
EAT =
h(t + m)
+
(1-h)(t + m + m)
```

Simplify:

```text
EAT =
h(t + m)
+
(1-h)(t + 2m)
```

---

## EAT Example

Suppose:

```text
TLB lookup = 10 ns
Memory access = 100 ns
TLB hit ratio = 80%
```

TLB hit:

```text
10 + 100
= 110 ns
```

TLB miss:

```text
10 + 100 + 100
= 210 ns
```

Therefore:

```text
EAT
= 0.8(110) + 0.2(210)

= 88 + 42

= 130 ns
```

So:

> **EAT = 130 ns**

---

# Important EAT Variation

Sometimes a question says:

> TLB lookup takes 20 ns, memory takes 100 ns, and TLB hit ratio is 90%.

Then:

```text
Hit = 20 + 100 = 120 ns

Miss = 20 + 100 + 100 = 220 ns

EAT = 0.9(120) + 0.1(220)
    = 108 + 22
    = 130 ns
```

Always carefully check what the question considers part of the hit/miss path.

---

# 26. Virtual Memory

## 26.1 What is Virtual Memory?

**Virtual memory allows a process to use a virtual address space larger than the available physical RAM.**

The OS uses secondary storage, such as an SSD, as backing storage for pages that aren't currently in RAM.

Example:

```text
Process virtual memory = 8 GB
Physical RAM available = 4 GB
```

The process can still have an 8 GB virtual address space.

Not all 8 GB needs to be in RAM simultaneously.

---

# 26.2 Why Virtual Memory?

Main reasons:

### 1. Run programs larger than RAM

```text
Program = 10 GB
RAM available = 8 GB
```

Virtual memory allows the program to execute by keeping only required portions in RAM.

### 2. Process isolation

Each process gets its own virtual address space.

For example:

```text
Process A:
Virtual address 1000 → physical frame X

Process B:
Virtual address 1000 → physical frame Y
```

Same virtual address can refer to different physical memory.

### 3. Better memory utilization

Only actively needed pages need to be loaded.

### 4. Easier programming model

Programs don't need to know where their data physically resides in RAM.

---

# 26.3 Virtual Address Space

Each process sees its own virtual address space.

Conceptually:

```text
Process Virtual Address Space

+-------------------+
| Stack             |
+-------------------+
|                   |
|       Free        |
|                   |
+-------------------+
| Heap              |
+-------------------+
| Data              |
+-------------------+
| Code/Text         |
+-------------------+
```

The exact layout depends on the OS and architecture.

The important concept is:

> A process works with virtual addresses, not raw physical addresses.

---

# 26.4 Demand Paging

**Demand paging** means:

> Load a page into RAM only when the process actually needs it.

Instead of loading all pages when the process starts:

```text
Program:
Page 0
Page 1
Page 2
Page 3
Page 4
Page 5
```

only some pages may initially be loaded:

```text
RAM:
Page 0
Page 2
Page 5
```

If the process accesses Page 3:

```text
Page 3 not in RAM
        ↓
Page fault
        ↓
OS loads Page 3
        ↓
Execution continues
```

---

# 26.5 Page Fault

A **page fault occurs when a process accesses a virtual page that is not currently present in physical memory.**

Example:

Page table:

| Page | Frame | Present |
| ---- | ----: | ------: |
| 0    |     5 |       1 |
| 1    |     8 |       1 |
| 2    |     — |       0 |
| 3    |     2 |       1 |

If CPU accesses Page 2:

```text
Present = 0
```

Therefore:

> Page fault.

Important:

**Page fault is not necessarily a program error.**

In virtual memory systems, page faults are a normal mechanism for bringing pages into RAM.

---

# 26.6 Page Fault Handling

This is an important interview question.

Suppose process accesses Page 7.

### Step 1 — CPU generates virtual address

```text
Page = 7
Offset = X
```

### Step 2 — Page table is checked

The present/valid bit says:

```text
Page 7 → not present
```

### Step 3 — Hardware raises a page-fault trap

Control transfers to the OS.

### Step 4 — OS checks whether access is valid

The OS determines whether:

```text
The page belongs to the process
```

If the access is invalid, the process may be terminated / receive an access violation.

If valid, continue.

### Step 5 — Find a free frame

If a free frame exists:

```text
Use free frame
```

Otherwise:

```text
Choose victim page
```

using a page replacement algorithm.

### Step 6 — If victim is dirty

Write the victim page back to disk/storage.

### Step 7 — Load required page

Read the required page from backing storage into the selected frame.

### Step 8 — Update page table

For example:

```text
Page 7 → Frame 12
Present = 1
```

### Step 9 — Update TLB if necessary

The translation may be inserted into the TLB.

### Step 10 — Restart the instruction

The CPU retries the instruction that caused the page fault.

```text
Memory access
     ↓
Page fault
     ↓
OS
     ↓
Find frame
     ↓
Load page
     ↓
Update page table
     ↓
Retry instruction
```

### Important

Page faults are **very expensive** compared with normal RAM access because storage access is much slower.

---

# 26.7 Lazy Loading

Lazy loading means:

> Don't load something until it is actually needed.

Demand paging is essentially a lazy-loading strategy for memory pages.

Example:

A program has 100 pages, but initially accesses only 10.

Instead of loading all 100:

```text
Load only pages when required.
```

This saves memory and startup work.

---

# 27. Page Replacement Algorithms

Page replacement is needed when:

```text
Page fault occurs
+
No free frame is available
```

The OS must decide:

> **Which existing page should be removed?**

That page is called the **victim page**.

Common algorithms:

1. FIFO
2. Optimal
3. LRU
4. Second Chance / Clock

---

# 27.1 Page Hit vs Page Fault

### Page hit

Required page is already in RAM.

```text
Page requested
     ↓
Already in memory
     ↓
Page hit
```

No disk access is required.

### Page fault

Required page isn't in RAM.

```text
Page requested
     ↓
Not in memory
     ↓
Page fault
```

The OS must bring it into RAM.

---

# 27.2 FIFO

**FIFO = First In, First Out**

The page that entered memory first is removed first.

Think of it as a queue:

```text
Oldest → Newest
```

When replacement is needed:

```text
Remove oldest page
```

### Example

3 frames:

Reference string:

```text
1 2 3 4
```

Initially:

```text
1
```

```text
1 2
```

```text
1 2 3
```

Now 4 arrives.

FIFO removes 1:

```text
2 3 4
```

because 1 was loaded first.

---

# 27.3 FIFO Numerical Example

Let's solve:

```text
Frames = 3

Reference string:
1 2 3 1 4 5
```

| Reference | Frame 1 | Frame 2 | Frame 3 | Result |
| --------: | ------: | ------: | ------: | ------ |
|         1 |       1 |       - |       - | Fault  |
|         2 |       1 |       2 |       - | Fault  |
|         3 |       1 |       2 |       3 | Fault  |
|         1 |       1 |       2 |       3 | Hit    |
|         4 |       4 |       2 |       3 | Fault  |
|         5 |       4 |       5 |       3 | Fault  |

Total:

```text
Page faults = 5
Page hits = 1
```

---

# 27.4 Belady's Anomaly

This is one of the most important FIFO concepts.

Normally you expect:

> More frames → fewer page faults.

But with **FIFO**, increasing the number of frames can sometimes **increase** the number of page faults.

This is called:

> **Belady's anomaly**

Classic reference string:

```text
1 2 3 4 1 2 5 1 2 3 4 5
```

FIFO can produce more faults with 4 frames than with 3 frames.

### Important interview point

Belady's anomaly can occur in:

> **FIFO**

but not in stack algorithms such as:

> **LRU and Optimal.**

---

# 27.5 Optimal Page Replacement

Optimal replacement chooses:

> The page that will not be used for the longest time in the future.

Example:

```text
Current pages:
1 2 3

Future:
1 4 5 2 3 ...
```

Suppose we need to replace one page.

Look at future use:

```text
1 → used soon
2 → used later
3 → used even later
```

Optimal chooses:

```text
3
```

if 3's next use is farthest away.

### Why is Optimal important?

It gives the **minimum possible number of page faults** for a given reference string and number of frames.

So it is useful as a theoretical benchmark.

### Why isn't it practically implementable?

Because the OS doesn't know the future.

It cannot know exactly:

> "Which page will the process access farthest in the future?"

Therefore:

> **Optimal is mainly used for theoretical comparison, not actual general-purpose page replacement.**

---

# 27.6 LRU

**LRU = Least Recently Used**

It replaces:

> The page that has not been used for the longest time in the past.

Example:

```text
Pages:
1 2 3
```

Access sequence:

```text
1 2 3 1 2
```

Recency:

```text
3 = least recently used
2 = recently used
1 = most recently used
```

If a replacement is needed:

```text
Remove 3
```

---

# 27.7 Why LRU is Usually Better Than FIFO

FIFO cares about:

> When was the page loaded?

LRU cares about:

> When was the page last used?

A page loaded a long time ago may still be heavily used.

Example:

```text
Page A loaded first
```

FIFO may remove A simply because it is old.

But suppose:

```text
A A A A A
```

It is clearly being used frequently.

LRU recognizes that A is recently used and keeps it.

Therefore LRU generally performs better when programs exhibit **locality of reference**.

---

# 27.8 Locality of Reference

Programs tend to access:

### Temporal locality

If something was recently accessed, it is likely to be accessed again soon.

Example:

```text
for(i = 0; i < 1000; i++)
    sum += arr[i];
```

The loop variable and instructions are repeatedly used.

### Spatial locality

If one memory location is accessed, nearby locations are likely to be accessed.

Example:

```text
arr[0]
arr[1]
arr[2]
arr[3]
```

Paging works well partly because of these locality properties.

LRU attempts to exploit temporal locality.

---

# 27.9 LRU Numerical Example

Consider:

```text
Frames = 3

Reference:
1 2 3 1 4
```

Start:

```text
1 → [1]
2 → [1,2]
3 → [1,2,3]
```

Then:

```text
1
```

is a hit.

Recency becomes:

```text
2, 3, 1
```

Now 4 arrives.

Least recently used:

```text
2
```

So:

```text
[1,2,3]
      ↓
replace 2
      ↓
[1,4,3]
```

---

# 27.10 Second Chance

Second Chance is a modification of FIFO.

FIFO has a problem:

> A page may be old but still heavily used.

Second Chance uses a **reference bit**.

Each page has:

```text
Reference bit = 0 or 1
```

When a page is accessed:

```text
Reference bit = 1
```

When replacement is needed:

### If reference bit = 0

Replace it.

### If reference bit = 1

Give it a "second chance":

```text
Set reference bit = 0
Move pointer forward
```

Then consider the next page.

---

# 27.11 Clock Algorithm

The **Clock algorithm** is an efficient implementation of the Second Chance idea.

Pages are arranged conceptually in a circle:

```text
       [A]
    /       \
  [D]       [B]
    \       /
       [C]
```

A clock hand points to a candidate.

Suppose:

```text
A: R=1
B: R=0
C: R=1
D: R=1
```

The hand starts at A.

A has:

```text
R = 1
```

So:

```text
Set R = 0
Move hand
```

B has:

```text
R = 0
```

Therefore:

```text
Replace B
```

### Why Clock?

True LRU can be expensive to implement.

Clock provides a relatively efficient approximation using the reference bit.

---

# 27.12 FIFO vs LRU vs Optimal vs Clock

| Algorithm             | Basic idea                          | Practical?                                    | Belady anomaly?                                                                            |
| --------------------- | ----------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------ |
| FIFO                  | Remove oldest page                  | Yes                                           | Yes                                                                                        |
| Optimal               | Remove page used farthest in future | No                                            | No                                                                                         |
| LRU                   | Remove least recently used          | Conceptually yes, exact implementation costly | No                                                                                         |
| Second Chance / Clock | FIFO + reference bit                | Yes                                           | Standard Second Chance/Clock is generally not treated as having the FIFO anomaly guarantee |

For interview purposes:

```text
Optimal → theoretical best
LRU → good practical principle
FIFO → simplest
Clock → efficient LRU approximation
```

---

# 27.13 Page Replacement Numerical Questions

For numerical problems, follow this exact procedure.

Given:

```text
Number of frames = N
Reference string = ...
Algorithm = FIFO/LRU/Optimal
```

Create a frame table.

For every reference:

### 1. Check if page is already present

If yes:

```text
HIT
```

### 2. If not present

```text
PAGE FAULT
```

### 3. If there is a free frame

Put it there.

### 4. If no free frame

Apply the specified replacement algorithm.

### 5. Count total faults

At the end:

```text
Hits + Faults = Total references
```

This is a good way to verify your answer.

---

# 28. Thrashing

## 28.1 What is Thrashing?

**Thrashing occurs when the system spends most of its time handling page faults and swapping pages rather than executing useful instructions.**

In simple terms:

> The computer is constantly moving pages between RAM and storage.

Example:

```text
Run process
   ↓
Page fault
   ↓
Load page
   ↓
Another needed page missing
   ↓
Page fault
   ↓
Replace page
   ↓
Another page fault
   ↓
...
```

CPU utilization can fall dramatically.

---

# 28.2 Why Does Thrashing Occur?

The primary reason is:

> **Processes don't have enough frames to hold the pages they actively need.**

Suppose a process frequently uses:

```text
Pages:
1 2 3 4 5
```

but it has only:

```text
2 frames
```

It may repeatedly load and evict pages:

```text
1 2
↓
3 replaces 1
↓
1 replaces 2
↓
2 replaces 3
↓
3 replaces 1
...
```

This causes huge numbers of page faults.

---

# 28.3 Thrashing and Multiprogramming

Suppose RAM has limited frames.

If we keep increasing the number of processes:

```text
Process A → needs 5 frames
Process B → needs 5 frames
Process C → needs 5 frames
Process D → needs 5 frames
```

but only 10 frames are available, each process may receive too few frames.

Result:

```text
Many page faults
        ↓
More disk I/O
        ↓
Less CPU work
        ↓
CPU utilization falls
```

---

# 28.4 Working Set

A **working set** is the set of pages that a process is actively using during a particular period.

Suppose during the last window of execution:

```text
Pages accessed:
1, 2, 3, 2, 1, 4, 3
```

The working set is approximately:

```text
{1, 2, 3, 4}
```

So the process needs around:

```text
4 frames
```

to keep its actively used pages in memory.

### Important idea

> If a process has fewer frames than its working set requires, page faults can become very frequent.

---

# 28.5 Working Set Model

The OS can monitor the working sets of processes.

Suppose:

```text
Process A working set = 5 pages
Process B working set = 4 pages
Process C working set = 6 pages
```

Total:

```text
5 + 4 + 6 = 15 frames
```

If the system only has:

```text
10 available frames
```

then all processes cannot keep their working sets in memory.

The OS may need to:

* reduce the degree of multiprogramming
* suspend some processes
* allocate more frames appropriately

to prevent thrashing.

---

# 28.6 Page Fault Frequency (PFF)

**Page Fault Frequency** monitors how frequently a process generates page faults.

If page fault frequency becomes too high:

```text
High page fault frequency
        ↓
Process probably needs more frames
```

The OS can allocate additional frames.

If page fault frequency is low:

```text
Process may have more frames than necessary
```

Some frames can potentially be allocated elsewhere.

So:

> **PFF is a way to control thrashing based on observed page-fault rates.**

---

# 28.7 How to Reduce Thrashing

### 1. Reduce degree of multiprogramming

Run fewer processes simultaneously.

```text
Too many processes
      ↓
Too few frames per process
      ↓
Thrashing
```

Suspending some processes gives remaining processes more frames.

---

### 2. Allocate more frames

Give a process enough frames for its working set.

---

### 3. Working-set model

Track the pages a process actively needs and ensure enough frames are available.

---

### 4. Page Fault Frequency

Monitor page fault rate and dynamically adjust frame allocation.

---

### 5. Better process scheduling

Avoid running too many memory-intensive processes simultaneously.

---

# Extremely Important Interview Distinctions

These are worth memorizing.

### Page vs Frame

```text
Page  → virtual memory
Frame → physical memory
```

Both have the same size.

---

### Page Number vs Offset

```text
Page number → identifies page
Offset      → identifies byte inside page
```

---

### Page Table

```text
Page number → Frame number
```

---

### TLB

```text
Cache of recent page-table translations
```

---

### TLB Miss vs Page Fault

```text
TLB miss:
Translation not in TLB.

Page fault:
Page not in physical memory.
```

A TLB miss does **not** necessarily mean a page fault.

---

### Internal vs External Fragmentation

Paging eliminates/reduces **external fragmentation** because pages can be placed in any free frames.

But paging can cause **internal fragmentation**, especially in the final partially used page.

---

### FIFO vs LRU

```text
FIFO → oldest loaded page
LRU  → least recently accessed page
```

---

### Optimal vs LRU

```text
Optimal:
Looks into the future.

LRU:
Looks at the past.
```

Optimal gives the minimum possible page faults but isn't generally implementable because the future is unknown.

---

### Belady's Anomaly

Know:

```text
More frames
     ↓
Usually fewer faults
```

But with FIFO:

```text
More frames
     ↓
Sometimes MORE faults
```

That's **Belady's anomaly**.

---

### Thrashing

```text
Too many page faults
        ↓
Too much paging/swapping
        ↓
Little useful CPU work
```

---

# Numerical Formula Sheet

## Paging

```text
Page number = Virtual address / Page size

Offset = Virtual address % Page size

Physical address
= Frame number × Page size + Offset
```

---

## Number of Pages

```text
Pages = ceil(Process size / Page size)
```

---

## Number of Frames

```text
Frames = Physical memory / Frame size
```

---

## Page Table Size

```text
Number of PTEs
= Virtual address space / Page size

Page table size
= Number of PTEs × PTE size
```

---

## Address Bits

If:

```text
Virtual address = n bits
Page size = 2^k bytes
```

then:

```text
Offset bits = k

Page-number bits = n - k

Number of pages = 2^(n-k)
```

If:

```text
Physical address = m bits
Page size = 2^k
```

then:

```text
Frame-number bits = m-k

Number of frames = 2^(m-k)
```

---

# TLB EAT

If:

```text
TLB lookup = t
Memory access = m
TLB hit ratio = h
```

then, under the standard two-memory-access miss assumption:

```text
EAT =
h(t + m)
+
(1-h)(t + 2m)
```

---

# The Full Picture

You should be able to connect the entire topic like this:

```text
                 CPU
                  |
                  | Virtual Address
                  v
          +----------------+
          |      TLB       |
          +----------------+
             |          |
          HIT|          |MISS
             |          |
             |          v
             |    +-----------+
             |    | Page Table|
             |    +-----------+
             |          |
             |          v
             +------> Frame
                       |
                       | + Offset
                       v
                Physical Memory
                       |
                       |
                 Page not present?
                       |
                      YES
                       v
                  PAGE FAULT
                       |
                       v
                    OS
                       |
             +---------+---------+
             |                   |
       Free frame?          No free frame
             |                   |
             |                   v
             |            Page Replacement
             |          FIFO/LRU/Clock/etc.
             |                   |
             +---------+---------+
                       |
                       v
                Load page from
                backing storage
                       |
                       v
                 Update Page Table
                       |
                       v
                 Retry instruction
```

And at a higher level:

```text
Virtual Memory
      |
      v
   Pages
      |
      v
 Page Table
      |
      v
Physical Frames
      |
      v
 RAM
```

When RAM is insufficient:

```text
Page Fault
    ↓
Page Replacement
    ↓
Disk ↔ RAM
```

If this happens excessively:

```text
Too many page faults
        ↓
     Thrashing
```

---

# Interview Questions You Should Be Able to Answer

After studying this phase, you should confidently answer:

1. **What is paging and why is it used?**
2. **What is the difference between a page and a frame?**
3. **What is a page table?**
4. **How does logical address translate to physical address?**
5. **Why is the offset unchanged during address translation?**
6. **How do you calculate the number of pages and frames?**
7. **How do you calculate page table size?**
8. **Why do we need multi-level page tables?**
9. **What is a TLB?**
10. **Why does TLB improve performance?**
11. **What happens on a TLB hit?**
12. **What happens on a TLB miss?**
13. **What is the difference between a TLB miss and a page fault?**
14. **Calculate EAT given TLB hit ratio and memory access time.**
15. **What is virtual memory?**
16. **Why can a process have a virtual address space larger than RAM?**
17. **What is demand paging?**
18. **What exactly happens during a page fault?**
19. **What is page replacement?**
20. **Explain FIFO with a numerical example.**
21. **What is Belady's anomaly?**
22. **Why can FIFO suffer from Belady's anomaly?**
23. **Explain LRU with a numerical example.**
24. **Why is LRU generally better than FIFO?**
25. **Why can't Optimal page replacement be practically implemented?**
26. **What is Second Chance?**
27. **How does the Clock algorithm work?**
28. **What is thrashing?**
29. **What causes thrashing?**
30. **What is the working set?**
31. **What is page fault frequency?**
32. **How can thrashing be reduced?**

For an OS interview, the **highest-value numerical practice** from this phase is: **address translation → page-table size → TLB/EAT → FIFO/LRU/Optimal page replacement → Belady's anomaly**.
