# Phase 3 — Threads

---

# 7. Threads

## 7.1 What is a Thread?

A **thread** is the smallest unit of CPU execution within a process.

A process can contain **one or more threads**.

A thread has its own:

* Program counter (PC)
* CPU registers
* Stack
* Thread ID
* Thread state

But threads belonging to the same process **share**:

* Code section
* Data section
* Heap
* Open files/resources
* Address space

### Simple picture

```text
Process
│
├── Code
├── Data
├── Heap
├── Open Files
│
├── Thread 1
│   ├── PC
│   ├── Registers
│   └── Stack
│
├── Thread 2
│   ├── PC
│   ├── Registers
│   └── Stack
│
└── Thread 3
    ├── PC
    ├── Registers
    └── Stack
```

The important idea:

> **A process is a resource container; a thread is an execution unit.**

### Example

Suppose a browser is a process.

It might have:

```text
Browser Process
    │
    ├── UI Thread
    ├── Network Thread
    ├── Rendering Thread
    └── JavaScript/Worker Threads
```

They can work concurrently while sharing the browser process's resources.

---

# 7.2 Process vs Thread

This is one of the **most common OS interview questions**.

| Process                                            | Thread                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| Independent execution environment                  | Execution unit inside a process                          |
| Has its own address space                          | Shares address space with threads of same process        |
| More expensive to create                           | Cheaper to create                                        |
| More expensive context switch                      | Usually cheaper context switch                           |
| Communication requires IPC                         | Communication can happen through shared memory           |
| Failure is generally isolated from other processes | One bad thread can potentially affect the entire process |
| Has process-level resources                        | Uses process resources                                   |
| Contains one or more threads                       | Exists inside a process                                  |

### Memory difference

Two processes:

```text
Process A              Process B

Address Space A        Address Space B
     ↓                      ↓
  Code A                 Code B
  Heap A                 Heap B
  Data A                 Data B
```

They don't normally share memory directly.

Two threads:

```text
             Process
                │
       ┌────────┴────────┐
       │                 │
    Thread 1          Thread 2
       │                 │
       └───────┬─────────┘
               ↓
      Shared Address Space
       Code / Data / Heap
```

Each thread still has its **own stack and registers**.

### Interview answer

If asked:

> "What is the major difference between process and thread?"

Say:

> A process is an independent execution environment with its own address space, while a thread is a lightweight execution unit inside a process. Threads of the same process share resources such as code, data and heap, but each thread has its own stack, registers and program counter.

---

# 7.3 Why Threads?

Threads are used because they provide:

### 1. Responsiveness

A program can continue doing useful work while another operation is blocked.

Example:

```text
Main/UI Thread
      │
      ├── Handle user input
      │
      └── Worker Thread
              │
              └── Download file
```

The UI doesn't have to freeze while downloading.

---

### 2. Resource sharing

Threads naturally share the process's:

* memory
* variables
* files
* resources

This makes communication easier than between separate processes.

---

### 3. Economy

Creating a thread is generally cheaper than creating a process.

Thread context switching is also generally cheaper than process context switching.

---

### 4. Parallelism

On a multicore CPU, multiple threads can actually execute simultaneously.

```text
Core 1 → Thread 1
Core 2 → Thread 2
Core 3 → Thread 3
Core 4 → Thread 4
```

This can improve performance for CPU-intensive workloads.

---

### 5. Better utilization

While one thread waits for I/O:

```text
Thread 1 → waiting for disk
Thread 2 → executing
Thread 3 → executing
```

CPU resources can remain productive.

---

# 7.4 Single-threaded vs Multithreaded Process

## Single-threaded process

A process has only one thread.

```text
Process
   │
   └── Thread
```

Execution happens through one execution path.

Example:

```cpp
#include <iostream>
using namespace std;

int main() {
    cout << "Task 1\n";
    cout << "Task 2\n";
    cout << "Task 3\n";
}
```

Conceptually:

```text
Task 1 → Task 2 → Task 3
```

---

## Multithreaded process

A process has multiple threads.

```text
Process
   │
   ├── Thread 1
   ├── Thread 2
   └── Thread 3
```

They can execute concurrently.

On a single core:

```text
T1 → T2 → T1 → T3 → T2 → ...
```

On multiple cores:

```text
Core 1 → T1
Core 2 → T2
Core 3 → T3
```

### Important interview distinction

**Multithreading does not necessarily mean parallel execution.**

It can provide:

* **Concurrency** on a single core
* **Parallelism** on multiple cores

We'll cover this in detail below.

---

# 7.5 User-Level Threads

User-level threads are managed by a **user-space thread library**, without requiring the OS kernel to manage each thread individually.

Conceptually:

```text
User Space
┌─────────────────────────┐
│ Thread Library           │
│                          │
│ T1   T2   T3             │
└─────────────────────────┘
            │
            ↓
         Kernel
       sees process
```

The thread management happens in user space.

### Advantages

#### Fast

Creating/switching threads can be faster because kernel involvement may not be required.

#### Flexible

The thread library can implement its own scheduling.

#### Lower overhead

Kernel doesn't need to maintain a kernel-level thread for every user thread.

### Disadvantages

#### Blocking system call problem

In a traditional many-to-one user-thread model, if one thread makes a blocking system call:

```text
T1 → blocking system call
             ↓
        Entire process blocks
```

because the kernel may see only one execution entity.

#### No true parallelism in many-to-one

If multiple user threads map to one kernel thread:

```text
T1 ─┐
T2 ─┼──→ Kernel Thread
T3 ─┘
```

they cannot execute simultaneously on multiple cores.

---

# 7.6 Kernel-Level Threads

Kernel-level threads are managed directly by the **operating system kernel**.

Conceptually:

```text
User Space
   T1
   T2
   T3
   │
   ↓
Kernel
   │
   ├── KT1
   ├── KT2
   └── KT3
```

The kernel knows about the threads and schedules them.

### Advantages

### 1. Better parallelism

Different threads can run on different CPU cores.

### 2. Blocking one thread doesn't necessarily block others

```text
T1 → waiting for I/O

T2 → running
T3 → running
```

### Disadvantages

Kernel-level thread operations have greater overhead because kernel involvement is required.

---

# 7.7 User-Level vs Kernel-Level Threads

| User-Level                                                              | Kernel-Level               |
| ----------------------------------------------------------------------- | -------------------------- |
| Managed by thread library                                               | Managed by OS kernel       |
| Kernel may not know individual threads                                  | Kernel knows threads       |
| Faster management                                                       | More overhead              |
| Kernel involvement can be avoided for thread operations                 | Kernel involved            |
| Blocking call can block entire process in many-to-one model             | Other threads can continue |
| Traditional many-to-one model cannot achieve true multicore parallelism | Can achieve parallelism    |

### Interview trap

Don't say:

> "User-level threads can never run in parallel."

More accurately:

> **In the traditional many-to-one model**, user threads cannot execute in parallel on multiple cores because they map to a single kernel thread.

---

# 7.8 Thread Creation

Thread creation means creating a new execution flow within a process.

In C++, the standard library provides `std::thread`.

```cpp
#include <iostream>
#include <thread>

using namespace std;

void task() {
    cout << "Worker thread running\n";
}

int main() {
    thread t(task);

    t.join();

    cout << "Main thread finished\n";
}
```

### What happens?

```text
main()
  │
  ├── create thread
  │
  ├──────────────→ worker executes task()
  │
  └── join()
          │
          └── waits for worker
```

### `join()`

```cpp
t.join();
```

means:

> The calling thread waits until thread `t` finishes.

### `detach()`

```cpp
t.detach();
```

allows the thread to execute independently.

For interview purposes, remember:

> `join()` synchronizes with thread completion; `detach()` separates the thread's execution from the `std::thread` object.

---

# 7.9 Thread Lifecycle

A thread generally moves through states such as:

```text
             create
               ↓
             Ready
               ↓
            Running
           ↙       ↘
       Waiting     Terminated
           ↓
         Ready
```

### New

Thread is being created.

### Ready

Thread is ready to execute but waiting for CPU scheduling.

### Running

Currently executing on CPU.

### Waiting / Blocked

Waiting for something such as:

* I/O
* lock
* condition
* event

### Terminated

Thread has finished execution.

---

## Example

Suppose:

```cpp
void task() {
    readFromDisk();
}
```

Possible sequence:

```text
New
 ↓
Ready
 ↓
Running
 ↓
Waiting
 ↓
Ready
 ↓
Running
 ↓
Terminated
```

---

# 7.10 Thread Control Block — TCB

The **Thread Control Block (TCB)** is a kernel data structure containing information needed to manage a thread.

Think:

> **PCB = process information**
>
> **TCB = thread information**

A TCB may contain:

* Thread ID
* Thread state
* Program counter
* CPU registers
* Stack pointer
* Scheduling information
* Priority
* Pointer to process/address space
* Thread-specific information
* Accounting information

Conceptually:

```text
TCB
├── Thread ID
├── State
├── Program Counter
├── Registers
├── Stack Pointer
├── Priority
├── Scheduling Info
└── Pointer to Process Resources
```

### Why is TCB important?

During a context switch, the OS needs to save the current thread's CPU state and restore another thread's state.

TCB helps store this information.

---

# 7.11 Multithreading Models

The important models are:

1. Many-to-One
2. One-to-One
3. Many-to-Many

---

## Many-to-One

Many user threads map to one kernel thread.

```text
User Threads

T1 ─┐
T2 ─┤
T3 ─┤────→ K1
T4 ─┘
```

### Advantages

* Simple
* Low overhead
* Thread management can happen in user space

### Disadvantages

* One blocking system call can block the entire process
* No true parallelism

Even with 8 CPU cores:

```text
T1
T2
T3
T4
 ↓
one kernel thread
```

Only one can execute at a time.

---

# One-to-One

Each user thread maps to one kernel thread.

```text
T1 → K1
T2 → K2
T3 → K3
T4 → K4
```

### Advantages

* True parallelism
* Blocking one thread doesn't necessarily block others

### Disadvantages

* More overhead
* OS may limit the number of threads

---

# Many-to-Many

Many user threads are mapped to multiple kernel threads.

```text
T1 ─┐
T2 ─┤
T3 ─┼──→ K1
T4 ─┤
T5 ─┼──→ K2
T6 ─┘     K3
```

The number of user threads can be greater than the number of kernel threads.

### Advantages

* Can achieve parallelism
* More flexible
* Potentially avoids excessive kernel-thread creation

### Disadvantages

* More complicated to implement
* Scheduling/mapping is more complex

---

# 7.12 Benefits of Multithreading

Remember these:

### 1. Responsiveness

Program can continue while another thread waits.

### 2. Resource sharing

Threads share process resources.

### 3. Economy

Threads are generally cheaper than processes.

### 4. Scalability

Threads can take advantage of multiple CPU cores.

### 5. Better CPU utilization

While one thread waits for I/O, another can execute.

---

# 7.13 Thread Overhead

Threads are cheaper than processes, but they are **not free**.

Costs include:

### Creation overhead

OS/library must create and initialize thread-related data.

### Stack memory

Each thread generally requires its own stack.

```text
Thread 1 → Stack 1
Thread 2 → Stack 2
Thread 3 → Stack 3
```

### Context-switch overhead

CPU state must be saved/restored.

### Synchronization overhead

When threads share resources, locks/semaphores may be required.

### Scheduling overhead

The OS must schedule runnable threads.

### Cache effects

Switching between threads can reduce cache locality and cause cache misses.

### Key interview point

> Threads are lighter than processes, but creating too many threads can still hurt performance.
