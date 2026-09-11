# Phase 4 — Process Synchronization

---

# 9. Synchronization Concepts

## 9.1 Synchronization

Synchronization is the coordination of concurrent threads/processes so that shared resources are accessed safely and operations happen in the required order.

Example:

```text
Thread 1 → produce data
Thread 2 → consume data
```

Thread 2 shouldn't consume data before Thread 1 has produced it.

Synchronization solves such problems.

---

# 9.2 Shared Resources

A shared resource is something multiple threads/processes can access.

Examples:

* Shared variable
* File
* Database
* Memory buffer
* Printer
* Data structure

Example:

```cpp
int balance = 1000;
```

If multiple threads modify `balance`, synchronization may be necessary.

---

# 9.3 Data Race

A **data race** occurs when:

1. Two or more threads access the same memory location concurrently,
2. At least one access is a write,
3. The accesses are not properly synchronized.

Example:

```cpp
int x = 0;

// Thread 1
x++;

// Thread 2
x++;
```

This can create a data race.

### Race condition vs data race

They're related but not exactly synonymous.

**Race condition** is the broader concept where correctness depends on timing/order.

**Data race** specifically refers to conflicting unsynchronized memory accesses under a concurrent execution model.

For interviews:

> Every data race is a concurrency bug, but race conditions can also involve ordering or higher-level logic beyond a simple memory data race.

---

# 9.4 Atomicity

Atomicity means an operation appears indivisible.

For example:

```text
Thread A
   ↓
LOCK
   ↓
modify shared resource
   ↓
UNLOCK
```

Other threads cannot interfere with that protected operation.

---

# 10. Mutex

## 10.1 What is a Mutex?

**Mutex = Mutual Exclusion**

A mutex is a synchronization primitive used to ensure that **only one thread at a time** can access a protected critical section.

Example:

```text
          Mutex
            │
       ┌────┴────┐
       │         │
      T1         T2
       │         │
     LOCK       WAIT
       │
 Critical Section
       │
    UNLOCK
       │
       └────→ T2
```

---

# 10.2 Lock / Unlock

Basic pattern:

```cpp
mutex.lock();

// critical section
counter++;

mutex.unlock();
```

Better:

```cpp
lock_guard<mutex> lock(mtx);
counter++;
```

The mutex is acquired when `lock_guard` is created and released automatically when it goes out of scope.

---

# 10.3 Mutex vs Normal Variable

A normal variable:

```cpp
int counter;
```

doesn't provide synchronization.

A mutex:

```cpp
mutex mtx;
```

controls access to a shared resource.

You use them together:

```cpp
mtx.lock();
counter++;
mtx.unlock();
```

The mutex protects `counter`; it isn't the data itself.

---

# 10.4 What happens if a thread tries to acquire a locked mutex?

Suppose:

```text
T1 → owns mutex

T2 → tries lock()
```

Typically T2 becomes **blocked/waiting** until the mutex becomes available.

```text
T1
 ↓
LOCK
 ↓
critical section

T2
 ↓
LOCK
 ↓
BLOCKED
```

When T1 unlocks:

```text
T1 → UNLOCK
         ↓
       T2 can acquire
```

### Important

Some mutex APIs also provide a non-blocking attempt such as:

```cpp
try_lock()
```

which returns without waiting if the mutex is unavailable.

---

# 10.5 Mutex vs Semaphore

Very common interview question.

| Mutex                               | Semaphore                                  |
| ----------------------------------- | ------------------------------------------ |
| Primarily provides mutual exclusion | Used for synchronization/resource counting |
| Usually has ownership               | Typically no ownership requirement         |
| Usually binary                      | Binary or counting                         |
| Owner thread unlocks it             | Another thread can signal a semaphore      |
| Protects critical section           | Can control access to multiple resources   |
| Lock/unlock                         | Wait/signal                                |

### Simple distinction

Mutex:

> **Who is allowed inside?**

Semaphore:

> **How many units/resources are available?**

---

# 11. Semaphores

## 11.1 What is a Semaphore?

A semaphore is a synchronization primitive containing a counter used to coordinate concurrent execution and/or control access to a limited number of resources.

It provides two fundamental operations:

```text
wait()
signal()
```

Also called:

```text
P()
V()
```

or conceptually:

```text
down()
up()
```

---

# 11.2 `wait()` / P()

Conceptually:

```text
wait(S):

    S--

    if S < 0:
        block()
```

The exact implementation details vary, but the essential idea is:

> Try to acquire one unit of the semaphore.

---

# 11.3 `signal()` / V()

Conceptually:

```text
signal(S):

    S++

    wake one waiting thread if necessary
```

Meaning:

> Release one unit/resource.

---

# 11.4 Binary Semaphore

A binary semaphore has values conceptually:

```text
0 or 1
```

Example:

```text
S = 1
```

Thread 1:

```text
wait(S)
```

Now:

```text
S = 0
```

Another thread attempting:

```text
wait(S)
```

must wait until someone performs:

```text
signal(S)
```

### Important

A binary semaphore can be used for mutual exclusion, but it is **not necessarily equivalent to a mutex** because ownership semantics differ.

---

# 11.5 Counting Semaphore

A counting semaphore can have values greater than 1.

Suppose there are 3 identical resources:

```text
S = 3
```

Each thread acquires one:

```text
T1 → wait → S=2
T2 → wait → S=1
T3 → wait → S=0
T4 → wait → BLOCKED
```

When one resource is released:

```text
T1 → signal → S=1
```

T4 can proceed.

### Example

Suppose a server has:

```text
3 database connections
```

A counting semaphore initialized to `3` can limit concurrent access to three connections.

---

# 11.6 Semaphore Implementation Idea

Semaphore operations must themselves be performed safely.

Conceptually:

```cpp
wait(S):
    atomically:
        if S > 0:
            S--
        else:
            block current thread
```

And:

```cpp
signal(S):
    atomically:
        S++
        wake a waiting thread if necessary
```

The critical word is:

> **atomically**

Otherwise multiple threads could modify the semaphore itself incorrectly.

Real OS implementations use lower-level atomic operations, hardware support, and/or kernel mechanisms.

---

# 11.7 Mutex vs Semaphore — Interview Answer

If asked:

> "What's the difference between mutex and semaphore?"

Good answer:

> A mutex is primarily used for mutual exclusion and generally has ownership semantics: the thread that locks it is expected to unlock it. A semaphore is a synchronization/counting mechanism that maintains a permit count and does not generally have ownership semantics. A binary semaphore can have a value of 0 or 1, while a counting semaphore can represent multiple available resources.

---

# 12. Classic Synchronization Problems

You should know the **problem, why it occurs, and how synchronization solves it**.

---

# 12.1 Producer-Consumer / Bounded Buffer

There are two types of threads:

### Producer

Produces data.

### Consumer

Consumes data.

They share a finite buffer.

```text
Producer
   │
   ↓
┌──────────────┐
│    BUFFER    │
└──────────────┘
   │
   ↓
Consumer
```

---

## The problems

### Problem 1: Producer when buffer is full

Producer must wait.

```text
Buffer = FULL

Producer → WAIT
```

### Problem 2: Consumer when buffer is empty

Consumer must wait.

```text
Buffer = EMPTY

Consumer → WAIT
```

### Problem 3: Concurrent access

Producer and consumer must not corrupt the buffer by modifying it simultaneously.

---

## Semaphore solution

Use:

```text
empty = number of empty slots
full  = number of filled slots
mutex = protects buffer
```

For a buffer of size `N`:

```text
empty = N
full = 0
```

### Producer

Conceptually:

```text
wait(empty)
wait(mutex)

    add item to buffer

signal(mutex)
signal(full)
```

### Consumer

```text
wait(full)
wait(mutex)

    remove item from buffer

signal(mutex)
signal(empty)
```

### Why?

Producer:

```text
wait(empty)
```

ensures there is space.

Consumer:

```text
wait(full)
```

ensures there is something to consume.

Mutex protects the actual buffer manipulation.

---

# 12.2 Readers-Writers Problem

Suppose multiple threads access shared data.

There are:

* Readers
* Writers

Rules:

### Multiple readers can read simultaneously.

```text
R1 ─┐
R2 ─┼──→ Shared Data
R3 ─┘
```

That's safe if they're only reading.

### Writer needs exclusive access.

```text
Writer → Shared Data
```

No reader or another writer should access it concurrently.

```text
Writer
   ↓
[ EXCLUSIVE ACCESS ]
```

---

## Basic idea

Maintain a reader count.

```text
readers = number of active readers
```

When first reader enters:

```text
lock resource
```

Other readers can enter.

When last reader exits:

```text
unlock resource
```

Writer obtains exclusive access.

### Classic issue: starvation

Depending on the implementation, readers can continuously enter and prevent a writer from ever getting access.

That's **writer starvation**.

Another policy can cause reader starvation.

Therefore, practical implementations often use fairness policies.

### Interview point

There are multiple variants:

* Reader-preference
* Writer-preference
* Fair/no-starvation approach

You should understand that the scheduling policy determines who can starve.

---

# 12.3 Dining Philosophers Problem

Five philosophers sit around a table.

Each needs **two forks** to eat.

```text
       P1
    F1    F2
 P5        P2
    F5    F3
       P4
         F4
```

Each philosopher needs:

```text
left fork
+
right fork
```

### Problem

If every philosopher picks up their left fork:

```text
P1 → holds F1
P2 → holds F2
P3 → holds F3
P4 → holds F4
P5 → holds F5
```

Now everyone waits for their right fork.

```text
P1 waits for F2
P2 waits for F3
P3 waits for F4
P4 waits for F5
P5 waits for F1
```

This creates a **deadlock**.

---

## Possible solutions

### Solution 1: Resource ordering

Number the forks:

```text
F1 < F2 < F3 < F4 < F5
```

Require every philosopher to acquire the lower-numbered fork first.

This prevents circular waiting.

---

### Solution 2: Allow at most N-1 philosophers to try simultaneously

For 5 philosophers:

```text
Only 4 can attempt to acquire forks.
```

Then at least one philosopher can obtain both forks, eat, and release them.

---

### Solution 3: Asymmetric ordering

For example:

```text
Even philosopher → left then right
Odd philosopher → right then left
```

This can break the circular waiting pattern.

### Interview takeaway

Dining Philosophers demonstrates:

* Deadlock
* Resource allocation
* Mutual exclusion
* Synchronization
* Starvation/fairness concerns

---

# 13. Monitors

A **monitor** is a higher-level synchronization construct that combines:

1. Shared data
2. Procedures/functions operating on that data
3. Mutual exclusion
4. Condition variables for waiting/signaling

Think:

> A monitor is a protected object where only one thread can execute its monitor procedures at a time.

Conceptually:

```text
             Monitor
┌─────────────────────────────┐
│ Shared Data                 │
│                             │
│ Function A()                │
│ Function B()                │
│ Function C()                │
│                             │
│ Condition Variables         │
└─────────────────────────────┘
```

Only one thread is typically active inside the monitor at a time.

---

# 13.1 Condition Variables

A condition variable allows a thread to **sleep until some condition becomes true**.

Example:

```text
Buffer is empty
        ↓
Consumer waits
        ↓
Producer adds item
        ↓
Producer signals
        ↓
Consumer wakes
```

Common operations:

```text
wait()
signal()
```

Some systems also provide:

```text
broadcast()
```

to wake all waiting threads.

---

# 13.2 `wait()`

A thread calls:

```text
wait(condition)
```

when it cannot proceed because some condition isn't satisfied.

Important:

> `wait()` generally releases the associated lock while the thread sleeps, then reacquires it before returning.

This is crucial.

Example:

```cpp
unique_lock<mutex> lock(mtx);

while (buffer.empty()) {
    cv.wait(lock);
}

consume(buffer);
```

While waiting:

```text
Thread → releases mutex → sleeps
```

When notified:

```text
Thread wakes
     ↓
reacquires mutex
     ↓
checks condition
     ↓
continues
```

---

# 13.3 `signal()`

`signal()` wakes one waiting thread whose condition may now be satisfied.

Conceptually:

```text
Producer:
    add item
    signal(not_empty)
```

This tells a waiting consumer:

> Something changed; you should check whether you can proceed.

---

# 13.4 Why use `while` instead of `if` with condition variables?

Correct:

```cpp
while (buffer.empty()) {
    cv.wait(lock);
}
```

Not:

```cpp
if (buffer.empty()) {
    cv.wait(lock);
}
```

Why?

Because after waking up, the condition must be **rechecked**.

Reasons include:

* Another thread may consume the resource first.
* Spurious wakeups can occur in common condition-variable implementations.
* Being notified does not necessarily mean the condition is currently true.

Therefore:

> **Always wait in a loop that checks the condition.**

This is a very good interview detail.

---

# 13.5 Monitor vs Semaphore

| Monitor                                              | Semaphore                                |
| ---------------------------------------------------- | ---------------------------------------- |
| Higher-level synchronization construct               | Lower-level synchronization primitive    |
| Encapsulates shared data + operations                | Mainly provides synchronization/counting |
| Mutual exclusion is generally built in               | Must explicitly coordinate usage         |
| Uses condition variables for waiting                 | Uses wait/signal                         |
| Easier to structure safely                           | More flexible but easier to misuse       |
| Common in high-level languages/concurrency libraries | Common OS synchronization primitive      |

### Simple way to remember

**Semaphore:**

```text
"How many permits are available?"
```

**Monitor:**

```text
"Here is the shared object; only one thread can operate on it at a time."
```

---
