# Phase 3 — Concurrency Basics

This section is extremely important because it leads directly into synchronization.

---

# 8.1 Concurrency vs Parallelism

These are commonly confused.

## Concurrency

Concurrency means **multiple tasks make progress during overlapping time periods**.

They don't necessarily execute simultaneously.

Single CPU:

```text
Time →

T1  T1  T2  T2  T1  T3  T2
```

The CPU switches between them.

That's concurrency.

---

## Parallelism

Parallelism means **multiple tasks execute at the same time**.

Multiple cores:

```text
Core 1: T1 T1 T1
Core 2: T2 T2 T2
Core 3: T3 T3 T3
```

That's parallelism.

### Easy analogy

Concurrency:

> One chef switches between preparing multiple dishes.

Parallelism:

> Multiple chefs prepare dishes simultaneously.

### Interview answer

> Concurrency is about dealing with multiple tasks whose execution overlaps, while parallelism is about actually executing multiple tasks simultaneously, typically using multiple CPU cores.

### Important

```text
Concurrency ≠ Parallelism
```

You can have:

```text
Concurrency without parallelism
```

on one CPU.

And:

```text
Parallelism implies simultaneous execution
```

but systems can have both concurrency and parallelism.

---

# 8.2 Race Condition

A **race condition** occurs when the result of a program depends on the timing/interleaving of concurrent operations.

Consider:

```cpp
int counter = 0;
```

Two threads execute:

```cpp
counter++;
```

You might think:

```text
counter = 0

Thread 1 → counter = 1
Thread 2 → counter = 2

Final = 2
```

But `counter++` is not necessarily one indivisible CPU operation.

Conceptually:

```text
READ counter
ADD 1
WRITE counter
```

Suppose:

```text
Initial counter = 0

T1: READ 0
T2: READ 0
T1: ADD 1
T2: ADD 1
T1: WRITE 1
T2: WRITE 1
```

Final:

```text
counter = 1
```

instead of:

```text
counter = 2
```

This is a **race condition**.

---

# 8.3 Critical Section

A **critical section** is the part of a program where a thread accesses a shared resource that must not be concurrently accessed in an unsafe way.

Example:

```cpp
counter++;
```

If `counter` is shared between threads, this operation can be a critical section.

Conceptually:

```text
Thread
  │
  ├── normal code
  │
  ├── ENTER critical section
  │
  ├── access shared resource
  │
  ├── EXIT critical section
  │
  └── normal code
```

---

# 8.4 Critical-Section Problem

The **critical-section problem** is the problem of designing a protocol that allows concurrent processes/threads to safely access shared resources.

A solution should satisfy three requirements:

1. Mutual exclusion
2. Progress
3. Bounded waiting

These are very important interview terms.

---

# 8.5 Mutual Exclusion

Mutual exclusion means:

> At most one thread can execute the critical section at a time.

Example:

```text
Critical Section

T1 → ENTER → [RUNNING]
T2 → WAITING
T3 → WAITING
```

After T1 leaves:

```text
T1 → EXIT

T2 → ENTER
```

### Why?

To prevent concurrent modification of shared resources.

---

# 8.6 Progress

Progress means:

> If no thread is currently inside the critical section and some threads want to enter, the decision of who enters next should not be postponed indefinitely.

Example:

```text
Critical section = empty

T1 wants entry
T2 wants entry
```

The system must eventually decide who gets in.

It shouldn't unnecessarily keep both waiting.

---

# 8.7 Bounded Waiting

Bounded waiting means:

> A thread should not wait indefinitely after requesting entry to the critical section.

There should be a finite bound on how many times other threads can enter before it gets its turn.

### Why?

To prevent **starvation**.

Example:

```text
T1 waiting...

T2 enters
T2 exits

T3 enters
T3 exits

T4 enters
T4 exits

...
```

If T1 never gets a chance, T1 is starving.

Bounded waiting prevents indefinite postponement.

---

# 8.8 Atomic Operation

An atomic operation is an operation that appears **indivisible** to other threads.

It either:

* happens completely, or
* doesn't happen.

No other thread can observe an intermediate state.

### Example

An atomic increment conceptually guarantees:

```text
counter = counter + 1
```

is performed without another thread interfering between the relevant steps.

Modern CPUs provide atomic primitives such as:

* Compare-and-Swap (CAS)
* Test-and-Set
* Fetch-and-Add

Example C++:

```cpp
#include <atomic>

atomic<int> counter = 0;

counter++;
```

`std::atomic` provides atomic operations appropriate for the type.

### Important interview distinction

Atomicity does **not** automatically mean:

* the entire program is thread-safe
* multiple operations are synchronized
* there is no race between larger sequences of operations

Example:

```cpp
if (counter < 10)
    counter++;
```

Even if individual operations are atomic, the **whole check-then-act sequence** may not be atomic.

---

# 8.9 Two Threads Incrementing the Same Variable

This is one of the questions you specifically should be prepared for.

Question:

> Two threads increment the same variable. Why can the result be wrong?

Suppose:

```cpp
int counter = 0;
```

Both execute:

```cpp
counter++;
```

Expected:

```text
2 increments → counter = 2
```

But `counter++` can conceptually be:

```text
LOAD counter
ADD 1
STORE counter
```

Possible execution:

```text
T1: LOAD counter → 0
T2: LOAD counter → 0

T1: ADD 1
T2: ADD 1

T1: STORE 1
T2: STORE 1
```

Final:

```text
1
```

This is called a **lost update**.

### Fix using mutex

```cpp
#include <iostream>
#include <thread>
#include <mutex>

using namespace std;

int counter = 0;
mutex mtx;

void increment() {
    for (int i = 0; i < 100000; i++) {
        mtx.lock();
        counter++;
        mtx.unlock();
    }
}

int main() {
    thread t1(increment);
    thread t2(increment);

    t1.join();
    t2.join();

    cout << counter << endl;
}
```

Better style:

```cpp
void increment() {
    for (int i = 0; i < 100000; i++) {
        lock_guard<mutex> lock(mtx);
        counter++;
    }
}
```

`lock_guard` automatically unlocks when it goes out of scope.
