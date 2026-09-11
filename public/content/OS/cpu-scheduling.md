# 5. CPU Scheduling Algorithms

Now we reach the numerical part.

You should be able to draw **Gantt charts** and calculate:

* Completion Time
* Turnaround Time
* Waiting Time
* Response Time

We'll use one example repeatedly so the relationships become clear.

---

# 5.1 Important Scheduling Terms

Suppose:

```text
Arrival Time (AT)
Burst Time (BT)
```

### Completion Time (CT)

The time at which the process finishes.

### Turnaround Time (TAT)

Total time from arrival until completion.

```text
TAT = CT - AT
```

### Waiting Time (WT)

Total time spent waiting in the ready queue.

```text
WT = TAT - BT
```

### Response Time (RT)

Time from arrival until the process gets CPU **for the first time**.

```text
RT = First CPU Start Time - AT
```

### Important distinction

Waiting time can include multiple periods spent in the ready queue.

Response time only cares about:

> **How long until I get CPU for the first time?**

---

# 5.2 FCFS — First Come First Serve

The process that arrives first runs first.

It is:

> **Non-preemptive**

Once a process starts running, it continues until it:

* finishes
* blocks for I/O

---

## Example

Processes:

| Process | Arrival | Burst |
| ------- | ------: | ----: |
| P1      |       0 |     5 |
| P2      |       1 |     3 |
| P3      |       2 |     2 |

Order:

```text
P1 → P2 → P3
```

Gantt chart:

```text
0      5      8      10
|  P1  |  P2  |  P3  |
```

### Completion Time

```text
P1 = 5
P2 = 8
P3 = 10
```

### Turnaround Time

```text
P1 = 5 - 0 = 5
P2 = 8 - 1 = 7
P3 = 10 - 2 = 8
```

### Waiting Time

```text
P1 = 5 - 5 = 0
P2 = 7 - 3 = 4
P3 = 8 - 2 = 6
```

### Response Time

Since each process starts for the first time at:

```text
P1 → 0
P2 → 5
P3 → 8
```

we get:

```text
P1 = 0 - 0 = 0
P2 = 5 - 1 = 4
P3 = 8 - 2 = 6
```

---

## FCFS Advantage

* Very simple
* Easy to implement
* No starvation due to scheduling order

## FCFS Disadvantage

### Convoy effect

A long CPU-bound process can make many short processes wait.

Example:

```text
Long process
    ↓
P1 ███████████████████

Short:
P2 ██
P3 ██
P4 ██
```

P2, P3 and P4 may suffer large waiting times.

---

# 5.3 SJF — Shortest Job First

SJF chooses the process with the **smallest CPU burst**.

It is traditionally:

> **Non-preemptive**

Example:

```text
P1 = 8
P2 = 3
P3 = 4
```

If all are ready:

```text
P2 → P3 → P1
```

because:

```text
3 < 4 < 8
```

---

## Major advantage

SJF gives the **minimum average waiting time** among non-preemptive scheduling algorithms when burst times are known exactly under the classical assumptions.

This is an important interview fact.

---

## Major disadvantage

How do you know the future CPU burst?

You generally don't know it exactly.

Operating systems may estimate CPU burst lengths based on past behavior.

---

## Starvation

Yes, SJF can cause starvation.

Suppose a long process is waiting:

```text
P1 = 100
```

and short jobs keep arriving:

```text
P2 = 2
P3 = 1
P4 = 3
P5 = 2
...
```

P1 can potentially wait for a very long time.

---

# 5.4 SRTF — Shortest Remaining Time First

SRTF is the **preemptive version of SJF**.

The OS always chooses the process with the shortest **remaining CPU burst**.

Example:

```text
P1 arrives:
BT = 8
```

P1 runs:

```text
P1: remaining = 8 → 7 → 6 → 5
```

Now P2 arrives:

```text
P2 BT = 2
```

Since:

```text
P2 remaining = 2
P1 remaining = 5
```

P1 is preempted.

```text
P1
█████

P2
██
```

Then P2 finishes and P1 resumes.

---

## SJF vs SRTF

| SJF                               | SRTF                     |
| --------------------------------- | ------------------------ |
| Non-preemptive                    | Preemptive               |
| Shortest burst                    | Shortest remaining burst |
| Once running, generally continues | Can be preempted         |
| Starvation possible               | Starvation possible      |

---

# 5.5 Round Robin

Round Robin is one of the most important algorithms for understanding **time-sharing**.

Each process gets a fixed:

> **Time quantum**

Example:

```text
Quantum = 2 ms
```

Suppose:

```text
P1 = 5
P2 = 3
P3 = 4
```

The CPU rotates:

```text
P1 → P2 → P3 → P1 → P2 → P3 → ...
```

Gantt chart:

```text
0  2  4  6  8  9  11  12
|P1|P2|P3|P1|P2| P3|P1|
```

The exact sequence depends on arrivals and queue behavior.

---

## Round Robin is preemptive

When the time quantum expires:

```text
Running
   ↓
Quantum expires
   ↓
Preempt
   ↓
Ready Queue
```

Then another process runs.

---

# 5.6 Effect of Time Quantum

This is a common conceptual interview question.

### Very large quantum

Round Robin starts behaving more like:

> FCFS

because processes may finish before being preempted.

### Very small quantum

There are many context switches.

So:

```text
Quantum too large
→ poor responsiveness

Quantum too small
→ excessive context-switch overhead
```

There is therefore a practical tradeoff.

---

# 5.7 Priority Scheduling

Each process gets a priority.

The scheduler chooses the highest-priority process.

Example:

```text
P1 → priority 3
P2 → priority 1
P3 → priority 2
```

The ordering depends on the convention.

In many OS problems:

> Smaller numerical value = higher priority.

But **always check the question's convention**.

---

## Non-preemptive Priority Scheduling

Once a process starts, it continues until completion/blocking.

Example:

```text
P1 starts
   ↓
higher-priority P2 arrives
   ↓
P1 continues
   ↓
P1 finishes
   ↓
P2 runs
```

---

## Preemptive Priority Scheduling

If a higher-priority process arrives:

```text
P1 running
   ↓
P2 arrives with higher priority
   ↓
P1 preempted
   ↓
P2 runs
```

---

# 5.8 Starvation in Priority Scheduling

Yes.

A low-priority process may wait indefinitely if higher-priority processes continuously arrive.

Example:

```text
P1 = low priority

High-priority jobs:
P2
P3
P4
P5
...
```

P1 could continually be postponed.

---

## Aging

A common solution is:

> Gradually increase the priority of a process the longer it waits.

Example:

```text
Initially:
P1 priority = low

After waiting:
P1 priority increases

Eventually:
P1 gets CPU
```

This is called **aging**.

---

# 5.9 Multilevel Queue Scheduling

Processes are divided into separate queues based on characteristics.

For example:

```text
+----------------------+
| System processes     |
+----------------------+
| Interactive          |
+----------------------+
| Batch                |
+----------------------+
```

Each queue can have its own scheduling algorithm.

Example:

```text
Foreground queue
→ Round Robin

Background queue
→ FCFS
```

There may also be a priority relationship between queues.

For example:

```text
Foreground
    ↓ higher priority
Background
```

If the foreground queue has work, the background queue may not get CPU.

---

## Major disadvantage

Processes are generally **permanently assigned** to a queue.

This can cause inflexibility and starvation of lower-priority queues depending on the design.

---

# 5.10 Multilevel Feedback Queue (MLFQ)

MLFQ improves on the rigidity of Multilevel Queue scheduling.

The key feature:

> **Processes can move between queues.**

Example:

```text
Queue 1 → highest priority
Quantum = 4

Queue 2
Quantum = 8

Queue 3 → lowest priority
FCFS
```

A new process might start at Queue 1.

If it uses its entire quantum:

```text
Queue 1
   ↓
Queue 2
```

If it continues using CPU heavily:

```text
Queue 2
   ↓
Queue 3
```

A process that waits for too long may be promoted upward.

This can help prevent starvation.

---

# 5.11 Multilevel Queue vs MLFQ

Very important.

| Multilevel Queue                        | MLFQ                                              |
| --------------------------------------- | ------------------------------------------------- |
| Multiple queues                         | Multiple queues                                   |
| Process usually stays in assigned queue | Processes can move                                |
| Less flexible                           | More adaptive                                     |
| Can suffer starvation                   | Aging/priority boosts can help prevent starvation |

### Easy memory trick

```text
MLQ:
"Which queue am I assigned to?"

MLFQ:
"Which queue should I be in based on my behavior?"
```

---

# 5.12 Preemptive vs Non-Preemptive Scheduling

### Non-preemptive

Once CPU is assigned:

```text
Process → CPU
```

the OS doesn't forcibly take it away merely because another process is ready.

It usually gives up CPU when:

* it terminates
* it blocks
* voluntarily yields

Examples:

* FCFS
* SJF
* non-preemptive Priority

### Preemptive

The OS can forcibly take CPU away.

Examples:

* SRTF
* Round Robin
* preemptive Priority

---

# 5.13 Scheduling Metrics

You need to be very comfortable with these.

---

## Completion Time (CT)

Time when the process finishes.

Example:

```text
P1 finishes at t = 12
```

Therefore:

```text
CT = 12
```

---

## Turnaround Time (TAT)

Total time from arrival to completion.

```text
TAT = CT - AT
```

Example:

```text
AT = 3
CT = 10

TAT = 10 - 3
    = 7
```

---

## Waiting Time (WT)

Time spent waiting in the ready queue.

For the standard CPU scheduling model:

```text
WT = TAT - BT
```

Example:

```text
TAT = 10
BT = 4

WT = 10 - 4
   = 6
```

---

## Response Time (RT)

Time from arrival until first CPU allocation.

```text
RT = First CPU Start - AT
```

Example:

```text
AT = 2
First CPU start = 7

RT = 7 - 2
   = 5
```

---

# 5.14 Important Difference: Waiting vs Response Time

Suppose:

```text
P1 arrives at 0
P1 runs from 5 to 7
P1 runs again from 10 to 12
```

Then:

```text
Response Time = 5 - 0 = 5
```

because P1 first got CPU at 5.

But waiting time includes the time it spends waiting in the ready queue across its execution:

```text
0 → 5
7 → 10
```

So:

```text
Waiting Time = 5 + 3 = 8
```

This distinction is especially important in **preemptive scheduling**.

---

# 5.15 Throughput

**Throughput** measures how many processes are completed per unit of time.

For example:

```text
10 processes completed
in 5 seconds
```

Then:

```text
Throughput = 10 / 5
           = 2 processes/second
```

Higher throughput is generally desirable.

---

# 5.16 Scheduling Algorithm Comparison

| Algorithm        | Preemptive?        | Starvation?                          | Main characteristic           |
| ---------------- | ------------------ | ------------------------------------ | ----------------------------- |
| FCFS             | No                 | No                                   | Simple, arrival order         |
| SJF              | No                 | Yes                                  | Shortest burst                |
| SRTF             | Yes                | Yes                                  | Shortest remaining time       |
| Round Robin      | Yes                | Generally no if properly implemented | Time quantum                  |
| Priority         | Either             | Yes                                  | Priority                      |
| Multilevel Queue | Depends            | Possible                             | Fixed queues                  |
| MLFQ             | Usually preemptive | Can be mitigated                     | Processes move between queues |

---

# 5.17 Numerical Problems — The Method You Should Always Use

When you get a scheduling question, **do not immediately calculate formulas**.

Use this process:

### Step 1 — Make a table

```text
Process | Arrival | Burst | Priority
```

### Step 2 — Determine scheduling rule

For example:

```text
FCFS
SJF
SRTF
RR q=2
Priority
```

### Step 3 — Draw Gantt chart

For example:

```text
0    5    8    10
| P1 | P2 | P3 |
```

### Step 4 — Determine Completion Time

The right boundary of each process's **final execution interval**.

### Step 5 — Calculate

```text
TAT = CT - AT

WT = TAT - BT

RT = First Start - AT
```

### Step 6 — Calculate averages

```text
Average WT = ΣWT / n

Average TAT = ΣTAT / n
```

---

# 5.18 Full Scheduling Example

Let's solve one properly.

Processes:

| Process | Arrival Time | Burst Time |
| ------- | -----------: | ---------: |
| P1      |            0 |          5 |
| P2      |            1 |          3 |
| P3      |            2 |          2 |

Use **FCFS**.

### Step 1 — Order

Arrival order:

```text
P1 → P2 → P3
```

### Step 2 — Gantt chart

```text
0       5       8       10
|  P1   |  P2   |  P3   |
```

### Step 3 — Completion Time

```text
P1 = 5
P2 = 8
P3 = 10
```

### Step 4 — Turnaround Time

```text
P1:
TAT = 5 - 0 = 5

P2:
TAT = 8 - 1 = 7

P3:
TAT = 10 - 2 = 8
```

### Step 5 — Waiting Time

```text
P1:
WT = 5 - 5 = 0

P2:
WT = 7 - 3 = 4

P3:
WT = 8 - 2 = 6
```

### Step 6 — Response Time

First CPU starts:

```text
P1 → 0
P2 → 5
P3 → 8
```

Therefore:

```text
P1:
RT = 0 - 0 = 0

P2:
RT = 5 - 1 = 4

P3:
RT = 8 - 2 = 6
```

### Final table

| Process | AT | BT | CT | TAT | WT | RT |
| ------- | -: | -: | -: | --: | -: | -: |
| P1      |  0 |  5 |  5 |   5 |  0 |  0 |
| P2      |  1 |  3 |  8 |   7 |  4 |  4 |
| P3      |  2 |  2 | 10 |   8 |  6 |  6 |

Average waiting time:

```text
(0 + 4 + 6) / 3
= 10 / 3
≈ 3.33
```

Average turnaround:

```text
(5 + 7 + 8) / 3
= 20 / 3
≈ 6.67
```

---

# 5.19 The Most Important Scheduling Interview Traps

### Trap 1: SJF vs SRTF

```text
SJF  → shortest burst, non-preemptive
SRTF → shortest remaining time, preemptive
```

---

### Trap 2: Response vs Waiting

```text
Response:
arrival → first CPU

Waiting:
total time waiting in ready queue
```

They are **not the same** for preemptive algorithms.

---

### Trap 3: Context switch ≠ system call

A system call enters kernel mode.

A context switch changes the executing process/thread.

A system call **can cause** a context switch, but doesn't inherently do so.

---

### Trap 4: Zombie ≠ orphan

```text
Zombie:
Child finished → parent hasn't collected status

Orphan:
Parent finished → child still running
```

---

### Trap 5: `exec()` doesn't create a process

```text
fork() → new process
exec() → replace program image
```

---

### Trap 6: Real-time ≠ simply fast

Real-time systems emphasize predictable timing/deadlines.
