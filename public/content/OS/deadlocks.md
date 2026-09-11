# Phase 5 — Deadlocks

Deadlocks come naturally after synchronization because **locks, semaphores, and shared resources can introduce situations where threads wait for one another forever**.

---

# 14. Deadlock Fundamentals

## 14.1 What is Deadlock?

A **deadlock** is a situation where a set of processes/threads are permanently blocked because **each one is waiting for a resource held by another**.

In simple terms:

> Everyone is waiting, and nobody can proceed.

### Simple example

Suppose:

```text
Thread 1 owns Lock A
Thread 2 owns Lock B
```

Then:

```text
Thread 1 → wants Lock B
Thread 2 → wants Lock A
```

So:

```text
T1 → waiting for B → held by T2
T2 → waiting for A → held by T1
```

Neither can proceed.

```text
T1 ──waits for──> B ──held by──> T2
T2 ──waits for──> A ──held by──> T1
```

That's a deadlock.

---

## 14.2 Real-World Intuition

Imagine two people:

```text
Person A has Pen 1
Person B has Pen 2

A needs Pen 2
B needs Pen 1
```

Neither gives up their pen.

```text
A → waits for B's pen
B → waits for A's pen
```

Forever.

This is exactly the same pattern as threads and locks.

---

## 14.3 Deadlock Example in Code

```cpp
#include <iostream>
#include <thread>
#include <mutex>

using namespace std;

mutex m1, m2;

void thread1() {
    lock_guard<mutex> lock1(m1);

    // Thread 1 now owns m1

    lock_guard<mutex> lock2(m2);

    // ...
}

void thread2() {
    lock_guard<mutex> lock2(m2);

    // Thread 2 now owns m2

    lock_guard<mutex> lock1(m1);

    // ...
}
```

Possible execution:

```text
T1 → locks m1
T2 → locks m2

T1 → tries m2 → waits
T2 → tries m1 → waits
```

Deadlock.

---

# 15. Four Necessary Conditions

A deadlock can occur only when **all four** of these conditions hold simultaneously.

You should memorize:

> **Mutual Exclusion + Hold and Wait + No Preemption + Circular Wait**

A very common interview question is:

> "What are the four necessary conditions for deadlock?"

Know all four **and understand why each matters**.

---

# 15.1 Mutual Exclusion

At least one resource must be held in a way that **only one process/thread can use it at a time**.

Example:

```text
Lock A → currently owned by T1
```

T2 cannot use it simultaneously.

Without mutual exclusion, multiple threads could share the resource and this particular deadlock condition would disappear.

---

# 15.2 Hold and Wait

A process is:

> **holding at least one resource while waiting for another resource.**

Example:

```text
T1:
    holds Lock A
    waits for Lock B
```

At the same time:

```text
T2:
    holds Lock B
    waits for Lock A
```

Both are holding something while waiting for something else.

---

# 15.3 No Preemption

A resource cannot simply be forcibly taken away from a process.

For example:

```text
T1 owns Lock A
```

The OS cannot arbitrarily say:

```text
"Give me Lock A."
```

The thread must release it voluntarily.

This allows deadlock to persist.

---

# 15.4 Circular Wait

There must be a circular chain of processes waiting for resources.

Example:

```text
T1 waits for resource held by T2
T2 waits for resource held by T3
T3 waits for resource held by T1
```

Graphically:

```text
T1 → T2 → T3
↑           ↓
└───────────┘
```

That's a cycle.

---

# Why All Four Are Required

Consider:

```text
Mutual Exclusion
        +
Hold and Wait
        +
No Preemption
        +
Circular Wait
        ↓
     Deadlock
```

If you break **any one** of the four conditions, deadlock cannot occur.

This is the foundation of **deadlock prevention**.

---

# 16. Resource Allocation Graph

A **Resource Allocation Graph (RAG)** represents the relationship between:

* Processes
* Resources
* Resource requests
* Resource allocations

It is commonly used to reason about deadlocks.

---

# 16.1 Processes

Processes are represented by **circles**.

For example:

```text
(P1)
(P2)
(P3)
```

---

# 16.2 Resources

Resources are represented by **rectangles**.

```text
[R1]
[R2]
[R3]
```

A resource may have one or more instances.

For example:

```text
[R1]
 •
 •
```

could represent a resource with two instances.

---

# 16.3 Allocation Edge

An **allocation edge** means:

> A resource has been allocated to a process.

Direction:

```text
Resource → Process
```

Example:

```text
[R1] ─────→ (P1)
```

means:

> R1 is currently allocated to P1.

---

# 16.4 Request Edge

A **request edge** means:

> A process is requesting a resource.

Direction:

```text
Process → Resource
```

Example:

```text
(P1) ─────→ [R2]
```

means:

> P1 is waiting for R2.

---

# 16.5 Complete Example

Suppose:

```text
P1 holds R1
P1 wants R2

P2 holds R2
P2 wants R1
```

Graph:

```text
[R1] ──→ (P1) ──→ [R2]
                         │
                         ↓
                       (P2)
                         │
                         ↓
                       [R1]
```

More clearly:

```text
[R1] → P1 → [R2] → P2 → [R1]
```

There is a cycle.

---

# 16.6 Detecting Cycles

### Important interview detail

For a resource allocation graph:

### Single instance of every resource

A cycle indicates a **deadlock**.

Example:

```text
P1 → R1 → P2 → R2 → P1
```

Cycle exists → deadlock.

### Multiple instances

A cycle **does not necessarily mean deadlock**.

This distinction is important.

With multiple instances, a cycle may exist while some process can still obtain an available resource instance and eventually break the cycle.

---

# 17. Deadlock Handling

There are four major approaches:

1. Deadlock Prevention
2. Deadlock Avoidance
3. Deadlock Detection
4. Deadlock Recovery

---

# 17.1 Deadlock Prevention

The goal is:

> **Design the system so that at least one of the four necessary conditions can never hold.**

Remember:

```text
Break one condition
        ↓
Deadlock impossible
```

---

## Prevent Mutual Exclusion

Make resources shareable where possible.

For example, read-only data can often be shared.

However, some resources are inherently non-shareable.

For example:

```text
Printer
```

Two jobs cannot necessarily control it simultaneously.

So this approach isn't always possible.

---

## Prevent Hold and Wait

Require a process to request **all resources before starting**.

Example:

```text
P1 needs:
R1 + R2
```

Instead of:

```text
Acquire R1
...
Acquire R2
```

it requests:

```text
R1 + R2
```

together.

Then it doesn't hold R1 while waiting for R2.

### Problem

This can cause:

* Poor resource utilization
* Processes holding resources they don't currently need
* Potential starvation

---

## Prevent No Preemption

If a process requests a resource that isn't available:

> Force it to release resources it currently holds.

Example:

```text
P1 holds R1
P1 requests R2

R2 unavailable
       ↓
P1 releases R1
```

Later, P1 can retry.

This is possible for some resources but impossible or impractical for others.

---

## Prevent Circular Wait

Impose an ordering on resources.

For example:

```text
R1 < R2 < R3 < R4
```

Require every thread to acquire resources in increasing order.

Correct:

```text
R1 → R2 → R3
```

Incorrect:

```text
R3 → R1
```

### Why does this work?

A circular wait would require eventually going from a higher-numbered resource back to a lower-numbered one.

That violates the ordering rule.

### This is a very practical deadlock-prevention technique.

---

# 17.2 Deadlock Avoidance

Prevention says:

> "Don't allow the system to create conditions that can cause deadlock."

Avoidance says:

> "Before granting a resource request, check whether doing so could put the system into an unsafe state."

The classic algorithm used for this is:

> **Banker's Algorithm**

The OS needs information about possible future resource requirements.

---

# Prevention vs Avoidance

| Prevention                                                        | Avoidance                                         |
| ----------------------------------------------------------------- | ------------------------------------------------- |
| Breaks at least one necessary condition                           | Makes decisions dynamically                       |
| Guarantees deadlock cannot occur through that prevented condition | Grants resources only if state remains safe       |
| Usually more restrictive                                          | More flexible                                     |
| Doesn't require knowing maximum future demands in the same way    | Requires information about maximum resource needs |
| Resource ordering is an example                                   | Banker's Algorithm is an example                  |

---

# 17.3 Deadlock Detection

Instead of preventing deadlocks, the system allows them to occur.

Periodically:

```text
Check system
     ↓
Is deadlock present?
     ↓
Yes
     ↓
Recover
```

For single-instance resource systems, cycle detection in a wait-for graph is commonly used.

For multiple resource instances, more general detection algorithms are needed.

---

# 17.4 Deadlock Recovery

Once deadlock has been detected, the system needs to recover.

Common approaches:

### 1. Process termination

Terminate one or more processes.

Possible strategies:

```text
Terminate one process
       ↓
Check if deadlock resolved
       ↓
If not, terminate another
```

### 2. Resource preemption

Take resources away from some process and give them to another.

Challenges:

* Which process should lose the resource?
* How do we avoid starvation?
* Can the process safely resume?

### 3. Rollback

Return a process to an earlier safe state.

This requires the system to maintain enough state to roll back.

---

# 18. Banker's Algorithm

Banker's Algorithm is a **deadlock avoidance algorithm**.

The key idea:

> Grant a resource request only if doing so leaves the system in a **safe state**.

It is called "Banker's" because it resembles a bank deciding whether granting a loan could still allow all customers to eventually complete.

---

# 18.1 Safe State

A system is in a **safe state** if there exists some order in which **all processes can finish successfully** without causing deadlock.

That order is called a:

> **Safe sequence**

Example:

```text
<P2, P1, P3>
```

means:

```text
P2 can finish
→ releases resources
→ P1 can finish
→ releases resources
→ P3 can finish
```

Therefore the state is safe.

---

# 18.2 Unsafe State

An unsafe state means:

> The system cannot guarantee that all processes can finish without potentially entering deadlock.

### Extremely important:

```text
Unsafe ≠ Deadlocked
```

An unsafe state **may lead to deadlock**, but it isn't necessarily currently deadlocked.

Interviewers love this distinction.

---

# 18.3 Banker's Algorithm Data Structures

Suppose there are:

```text
n processes
m resource types
```

Banker's Algorithm uses:

### Available

Number of currently available instances of each resource.

Example:

```text
Available = [3, 2, 1]
```

---

### Maximum

Maximum resources each process may need.

Example:

```text
        R1 R2 R3
P1      7  5  3
P2      3  2  2
P3      9  0  2
```

---

### Allocation

Resources currently allocated to each process.

Example:

```text
        R1 R2 R3
P1      0  1  0
P2      2  0  0
P3      3  0  2
```

---

### Need

Resources a process still needs to reach its maximum.

Formula:

```text
Need = Maximum - Allocation
```

For example:

```text
Maximum(P1)    = [7,5,3]
Allocation(P1) = [0,1,0]

Need(P1)
= [7,5,3] - [0,1,0]
= [7,4,3]
```

This formula is extremely important.

---

# 18.4 Basic Banker's Algorithm Example

Consider:

```text
Available = [3, 3, 2]
```

### Allocation

```text
        A B C
P0      0 1 0
P1      2 0 0
P2      3 0 2
P3      2 1 1
P4      0 0 2
```

### Maximum

```text
        A B C
P0      7 5 3
P1      3 2 2
P2      9 0 2
P3      2 2 2
P4      4 3 3
```

Calculate:

```text
Need = Maximum - Allocation
```

Therefore:

```text
        A B C
P0      7 4 3
P1      1 2 2
P2      6 0 0
P3      0 1 1
P4      4 3 1
```

Now:

```text
Work = Available
     = [3,3,2]
```

Find a process whose:

```text
Need <= Work
```

---

### Check P0

```text
Need P0 = [7,4,3]

Work = [3,3,2]
```

P0 cannot finish because:

```text
7 > 3
```

---

### Check P1

```text
Need P1 = [1,2,2]

Work = [3,3,2]
```

Everything fits.

So P1 can finish.

When P1 finishes, it releases its allocation:

```text
Allocation P1 = [2,0,0]
```

New Work:

```text
Work = [3,3,2] + [2,0,0]
     = [5,3,2]
```

Safe sequence so far:

```text
P1
```

---

### Check P3

```text
Need P3 = [0,1,1]

Work = [5,3,2]
```

Fits.

P3 finishes and releases:

```text
Allocation P3 = [2,1,1]
```

New:

```text
Work = [5,3,2] + [2,1,1]
     = [7,4,3]
```

Sequence:

```text
P1 → P3
```

---

### Check P4

```text
Need P4 = [4,3,1]

Work = [7,4,3]
```

Fits.

P4 releases:

```text
Allocation P4 = [0,0,2]
```

New:

```text
Work = [7,4,5]
```

Sequence:

```text
P1 → P3 → P4
```

---

### Check P0

```text
Need P0 = [7,4,3]

Work = [7,4,5]
```

Fits.

P0 releases:

```text
Allocation P0 = [0,1,0]
```

New:

```text
Work = [7,5,5]
```

Sequence:

```text
P1 → P3 → P4 → P0
```

---

### Check P2

```text
Need P2 = [6,0,0]

Work = [7,5,5]
```

Fits.

Therefore P2 can finish.

Safe sequence:

```text
P1 → P3 → P4 → P0 → P2
```

Therefore:

> **The system is in a safe state.**

---

# 18.5 Banker's Algorithm Procedure

For a **safety check**, remember this process:

### Step 1

Calculate:

```text
Need = Maximum - Allocation
```

### Step 2

Set:

```text
Work = Available
```

### Step 3

Find a process `Pi` where:

```text
Need[i] <= Work
```

### Step 4

Pretend it finishes.

Then:

```text
Work = Work + Allocation[i]
```

### Step 5

Mark that process finished.

### Step 6

Repeat.

If all processes can finish:

```text
SAFE
```

If you get stuck before all processes finish:

```text
UNSAFE
```

---

# 18.6 Resource Request in Banker's Algorithm

Suppose process `Pi` requests:

```text
Request[i]
```

The system checks:

### Check 1

```text
Request[i] <= Need[i]
```

If not:

> The process is requesting more than its declared maximum.

Invalid request.

### Check 2

```text
Request[i] <= Available
```

If not:

> Resources aren't currently available.

The process must wait.

### Check 3

Pretend to allocate the resources.

Update:

```text
Available -= Request
Allocation += Request
Need -= Request
```

Then perform the **safety algorithm**.

If the resulting state is safe:

```text
Grant request
```

Otherwise:

```text
Do not grant request
```

---

# 19. Deadlock vs Starvation vs Livelock

This is a **very common conceptual interview question**.

---

# 19.1 Deadlock

Threads are stuck because they are waiting for each other.

Example:

```text
T1 holds A → waits for B
T2 holds B → waits for A
```

Neither progresses.

```text
T1 ↔ T2
```

### Key idea

> **No progress because everyone is waiting.**

---

# 19.2 Starvation

A thread waits for an **indefinitely long time because other threads continuously get the resource/opportunity it needs**.

Example:

```text
T1 waiting for CPU

T2 gets CPU
T3 gets CPU
T4 gets CPU
T5 gets CPU
...
```

T1 may remain ready but never receive sufficient CPU time.

Or with locks:

```text
T1 waits for lock

T2 gets lock
T3 gets lock
T4 gets lock
T5 gets lock
...
```

### Key idea

> **One thread is repeatedly denied access while others make progress.**

Starvation does **not** require a circular wait.

---

# 19.3 Livelock

In livelock, threads are **not blocked**.

They are actively executing, but **no useful progress is being made**.

Example:

Two people meet in a narrow hallway.

```text
Person A moves left
Person B moves left

A moves right
B moves right

A moves left
B moves left
...
```

Both are moving, but neither gets past the other.

That's livelock.

### Programming intuition

Two threads repeatedly detect a conflict and respond by backing off, but both keep changing state in response to each other.

```text
T1 → changes
T2 → changes
T1 → changes
T2 → changes
...
```

CPU is being used, but useful work isn't progressing.

---

# Deadlock vs Starvation vs Livelock

|                           | Deadlock                         | Starvation                                  | Livelock                                 |
| ------------------------- | -------------------------------- | ------------------------------------------- | ---------------------------------------- |
| Threads blocked?          | Usually yes                      | Usually waiting/blocked or denied execution | No                                       |
| Useful progress?          | No                               | Some other threads make progress            | No                                       |
| Main issue                | Circular/resource dependency     | Unfair scheduling/resource allocation       | Threads continuously react to each other |
| Example                   | T1 waits for T2, T2 waits for T1 | T1 never gets CPU/lock                      | Threads repeatedly back off              |
| Can CPU be actively used? | Not necessarily                  | Yes                                         | Yes, often significantly                 |

### Easy memory trick

```text
Deadlock  → "I'm waiting for you."
Starvation → "Everyone gets it except me."
Livelock  → "We're both moving, but going nowhere."
```
