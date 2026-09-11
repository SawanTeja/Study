# Phase 10 — IPC

IPC (**Inter-Process Communication**) is the set of mechanisms an operating system provides for processes to **exchange data and coordinate with each other**.

A process normally has its **own isolated address space**, so one process cannot simply access another process's memory.

IPC provides controlled ways for processes to communicate.

---

# 34. Inter-Process Communication

## 34.1 Why Do Processes Need IPC?

Processes may need to communicate for several reasons:

### 1. Data sharing

Example:

```text
Process A → produces data
Process B → consumes data
```

### 2. Coordination

Processes may need to coordinate execution.

Example:

```text
Process A finishes writing
        ↓
Process B starts reading
```

### 3. Resource sharing

Multiple processes may need to cooperate around a shared resource.

### 4. Parallelism

A large task can be split among multiple processes.

Example:

```text
Process A → process first part
Process B → process second part
Process C → process third part
```

---

# Main IPC Mechanisms

You should understand these seven:

| Mechanism             | Main idea                                  | Typical use                           |
| --------------------- | ------------------------------------------ | ------------------------------------- |
| **Shared Memory**     | Processes share a memory region            | Very fast local communication         |
| **Message Passing**   | Processes explicitly send/receive messages | Structured communication              |
| **Pipe**              | Byte stream between processes              | Parent-child communication            |
| **Named Pipe (FIFO)** | Pipe represented by a filesystem name      | Unrelated local processes             |
| **Message Queue**     | Kernel-managed queue of messages           | Structured asynchronous communication |
| **Signal**            | Event/notification sent to process         | Notifications/control                 |
| **Socket**            | Bidirectional communication endpoint       | Local or network communication        |

The two broad IPC models are:

```text
Shared Memory
Message Passing
```

The others can be viewed as specific IPC mechanisms built around different communication semantics.

---

# 34.2 Shared Memory

Shared memory allows multiple processes to access a **common region of physical memory** mapped into their virtual address spaces.

Conceptually:

```text
Process A                 Process B
+---------+               +---------+
| Private |               | Private |
| Memory  |               | Memory  |
+---------+               +---------+
      \                       /
       \                     /
        +-------------------+
        |  Shared Memory    |
        +-------------------+
```

Both processes can access the shared region.

### Advantage

Very fast because after setup, processes can communicate by reading/writing memory directly instead of repeatedly copying messages through the kernel.

### Problem

**Synchronization is required.**

If two processes modify the same data concurrently:

```text
Process A → writes
Process B → writes
```

you can get a race condition.

Therefore shared memory is commonly combined with:

* Mutexes
* Semaphores
* Other synchronization primitives

---

# 34.3 Message Passing

In message passing, processes communicate by explicitly:

```text
send(message)
receive(message)
```

Conceptually:

```text
Process A
   |
   | send("Hello")
   v
IPC mechanism
   |
   v
Process B
```

The processes don't directly access each other's memory.

### Advantages

* Simpler isolation
* Easier synchronization semantics
* Useful when processes don't want to share memory directly
* Can work across machines when implemented through networking

### Disadvantage

Message passing can involve more overhead than shared memory because data may need to be copied and/or handled by the kernel.

---

# Shared Memory vs Message Passing

| Shared Memory                             | Message Passing                                                  |
| ----------------------------------------- | ---------------------------------------------------------------- |
| Processes share memory region             | Processes exchange messages                                      |
| Very fast after setup                     | Usually more overhead                                            |
| Requires explicit synchronization         | Communication mechanism provides message boundaries/coordination |
| Processes directly read/write shared data | Processes use send/receive                                       |
| Excellent for large amounts of local data | Good for structured communication                                |

### Interview answer

If asked:

> "Which is faster, shared memory or message passing?"

Generally:

> **Shared memory is faster for high-volume communication between processes on the same machine because processes can access shared data directly after the shared region is established. However, it requires synchronization to avoid races.**

---

# 35. Pipes

A **pipe** is an IPC mechanism that provides a stream of bytes between processes.

Conceptually:

```text
Process A
   |
   | write()
   v
+---------+
|  Pipe   |
+---------+
   |
   | read()
   v
Process B
```

One process writes into the pipe and another reads from it.

---

# 35.1 Anonymous Pipe

An **anonymous pipe** doesn't normally have a filesystem pathname.

It is commonly created by a process and then inherited by its child.

Classic example:

```text
Parent
  |
  | creates pipe
  |
  +---- fork()
          |
       Child
```

The parent and child can communicate through the pipe.

---

# 35.2 Parent-Child Communication

In Unix/Linux, a typical pattern is:

```text
pipe()
fork()
```

Suppose the parent wants to send data to the child.

```text
Parent
   |
   | write()
   v
 Pipe
   |
   | read()
   v
Child
```

The pipe has two ends:

```text
Read end
Write end
```

In C:

```c
int fd[2];

pipe(fd);
```

Typically:

```text
fd[0] → read end
fd[1] → write end
```

After `fork()`, both parent and child initially have access to the descriptors.

For one-way parent → child communication, a typical pattern is:

```c
pipe(fd);

pid_t pid = fork();

if (pid == 0) {
    // Child
    close(fd[1]);        // Don't write
    read(fd[0], buffer, sizeof(buffer));
} else {
    // Parent
    close(fd[0]);        // Don't read
    write(fd[1], "Hello", 5);
}
```

The exact error handling is omitted here for interview clarity.

### Why close unused ends?

It is good practice and important for correct EOF behavior.

If all write ends are closed, a reader can eventually observe **EOF**.

---

# 35.3 Pipe Characteristics

Important properties:

### 1. Usually byte-stream based

A normal pipe provides a stream of bytes.

It doesn't inherently preserve application-level message boundaries.

For example:

```text
write("Hello")
write("World")
```

the reader conceptually sees:

```text
HelloWorld
```

and must use its own protocol if it needs message boundaries.

### 2. Kernel-managed buffer

The pipe has a kernel-managed buffer.

```text
Writer
  ↓
Kernel pipe buffer
  ↓
Reader
```

### 3. Usually one-way

A traditional pipe is generally used as a unidirectional communication channel.

If you need bidirectional communication, you can use two pipes:

```text
Pipe 1: A → B
Pipe 2: B → A
```

### 4. Blocking behavior

Depending on the descriptors and configuration:

* `read()` may block when no data is available.
* `write()` may block when the pipe buffer is full.

### 5. Anonymous pipes are commonly used between related processes

Especially:

```text
Parent ↔ Child
```

because the descriptors can be inherited through `fork()`.

---

# 35.4 Named Pipes

A **named pipe**, commonly called a **FIFO** on Unix/Linux, has a name in the filesystem namespace.

Example:

```text
/tmp/myfifo
```

Processes that don't have a parent-child relationship can use it.

Conceptually:

```text
Process A
    |
    v
 /tmp/myfifo
    |
    v
Process B
```

### Anonymous pipe vs Named pipe

| Anonymous Pipe                                  | Named Pipe                                  |
| ----------------------------------------------- | ------------------------------------------- |
| Usually no filesystem name                      | Has a filesystem name                       |
| Commonly parent-child                           | Can connect unrelated processes             |
| Created with `pipe()`                           | Unix/Linux commonly created with `mkfifo()` |
| Lifetime tied to open descriptors/process usage | FIFO pathname exists until removed          |
| Simple local IPC                                | Useful for unrelated local processes        |

Important:

> A named pipe is still a **pipe/byte-stream IPC mechanism**, not a regular file containing persistent data.

---

# 36. Shared Memory

## 36.1 How Shared Memory Works

Normally:

```text
Process A virtual memory
        ↓
      Page table
        ↓
Physical memory
```

Process B has its own address space.

With shared memory, the OS maps the **same physical memory region** into both processes' virtual address spaces.

Conceptually:

```text
Process A VA              Process B VA
+---------+               +---------+
| Shared  |-------------->| Shared  |
| Region  |               | Region  |
+---------+               +---------+
       \                     /
        \                   /
         +-----------------+
         | Physical memory |
         +-----------------+
```

The virtual addresses don't necessarily have to be identical.

The important thing is:

> Both virtual mappings refer to the same underlying physical memory.

---

# 36.2 Why Shared Memory Is Fast

Consider message passing:

```text
Process A
   ↓
Kernel
   ↓
copy/transfer
   ↓
Process B
```

There may be significant copying and kernel involvement.

With shared memory:

```text
Process A
   ↓
Shared memory
   ↑
Process B
```

After setup, both processes can directly access the shared region.

Therefore it is particularly useful for **large amounts of data**.

---

# 36.3 Synchronization Requirement

Shared memory creates a major problem:

> Multiple processes may access the same data simultaneously.

Example:

```c
shared_counter++;
```

This is not necessarily one indivisible operation.

Conceptually:

```text
read counter
add 1
write counter
```

Suppose:

```text
counter = 5
```

Process A reads:

```text
5
```

Process B also reads:

```text
5
```

Both increment:

```text
6
```

Both write:

```text
6
```

Expected:

```text
7
```

Actual:

```text
6
```

This is a **race condition**.

Therefore shared memory usually needs synchronization such as:

```text
Mutex
Semaphore
Spinlock
```

---

# 36.4 Shared Memory vs Message Passing

A very common interview comparison:

### Shared memory

```text
A → shared region ← B
```

* Fast
* Good for large data
* Requires synchronization
* Same-machine communication

### Message passing

```text
A → message → B
```

* Simpler abstraction
* Kernel/runtime handles communication
* Usually more overhead
* Can naturally support communication across machines when using a network-based mechanism

---

# 37. Signals

## 37.1 What is a Signal?

A **signal** is an asynchronous notification sent to a process to indicate that an event has occurred.

Examples:

```text
SIGINT
SIGTERM
SIGKILL
SIGSTOP
```

Signals are primarily for **notification/control**, not for transferring large amounts of data.

Conceptually:

```text
Process A
    |
    | signal
    v
Process B
```

The receiving process can have the OS invoke a signal handler for signals that are catchable.

---

# 37.2 Signal Handling

A process can specify what to do when certain signals arrive.

Possible behaviors include:

* Default action
* Ignore the signal where permitted
* Execute a custom handler

Example in C:

```c
#include <signal.h>
#include <stdio.h>

void handler(int sig) {
    printf("Received signal %d\n", sig);
}

int main() {
    signal(SIGINT, handler);

    while (1) {
        // Keep running
    }
}
```

Pressing:

```text
Ctrl + C
```

normally generates `SIGINT`.

The process can catch it and execute the handler.

In production Unix/Linux code, `sigaction()` is generally preferred over `signal()` because it provides more precise and portable signal semantics.

---

# 37.3 SIGINT

**SIGINT = Interrupt**

Commonly generated when the user presses:

```text
Ctrl + C
```

Default behavior:

> Terminate the process.

But the process can catch and handle `SIGINT`.

Example:

```text
User presses Ctrl+C
        ↓
SIGINT
        ↓
Process
        ↓
Custom handler / default termination
```

---

# 37.4 SIGTERM

**SIGTERM = Termination request**

It asks a process to terminate.

It is a **polite/handleable termination request**.

A process can catch `SIGTERM` and perform cleanup:

```text
Close files
Save state
Release resources
Exit
```

Example:

```text
kill -TERM <pid>
```

Important:

> `SIGTERM` is a request, not an unconditional forced termination.

---

# 37.5 SIGKILL

`SIGKILL` forces a process to terminate.

The critical interview point:

> **SIGKILL cannot be caught, blocked, or ignored.**

Why?

Because the OS must guarantee that a process cannot prevent an administrator or system from forcibly terminating it.

So this doesn't work:

```c
signal(SIGKILL, handler);
```

You cannot handle it.

---

# 37.6 SIGSTOP

`SIGSTOP` stops/suspends a process.

Important:

> `SIGSTOP` cannot be caught, blocked, or ignored.

The process remains stopped until it receives an appropriate continue action, commonly via:

```text
SIGCONT
```

---

# SIGINT vs SIGTERM vs SIGKILL vs SIGSTOP

| Signal    | Purpose                    | Catchable? |
| --------- | -------------------------- | ---------- |
| `SIGINT`  | Interrupt, commonly Ctrl+C | Yes        |
| `SIGTERM` | Request termination        | Yes        |
| `SIGKILL` | Force termination          | **No**     |
| `SIGSTOP` | Force stop/suspend         | **No**     |

### Very important

Both:

```text
SIGKILL
SIGSTOP
```

cannot be caught, blocked, or ignored.

---

# 38. IPC Comparison

This comparison is highly interview-relevant.

| Mechanism     | Communication        | Data model                 | Typical scope    | Synchronization                               |
| ------------- | -------------------- | -------------------------- | ---------------- | --------------------------------------------- |
| Pipe          | Process → process    | Byte stream                | Local            | Blocking/coordination through pipe            |
| Named Pipe    | Process → process    | Byte stream                | Local            | Similar pipe semantics                        |
| Message Queue | Process → process    | Messages                   | Local            | Queue provides communication coordination     |
| Shared Memory | Shared region        | Raw/shared data            | Local            | **Explicit synchronization usually required** |
| Signal        | Process notification | Event/signal               | Local            | Not for bulk data                             |
| Socket        | Endpoint ↔ endpoint  | Byte stream/datagrams/etc. | Local or network | Depends on protocol/design                    |

---

# Message Queues

Your list includes message queues, so this deserves a little more detail.

A **message queue** is a kernel-managed queue where processes can place and retrieve messages.

Conceptually:

```text
Process A
   |
   | send(message)
   v
+----------------+
| Message Queue  |
| M1             |
| M2             |
| M3             |
+----------------+
        |
        | receive()
        v
    Process B
```

Unlike a pipe's basic byte-stream model, messages are maintained as **separate messages**.

For example:

```text
send("Hello")
send("World")
```

can be received as:

```text
"Hello"
"World"
```

rather than merely an undifferentiated byte stream.

### When useful?

When processes need:

* Structured messages
* Asynchronous communication
* Multiple messages waiting to be processed

---

# Sockets

A **socket** is a communication endpoint.

Sockets are widely used for:

```text
Process ↔ Process
```

and especially:

```text
Machine A ↔ Machine B
```

Example:

```text
Client
  |
Socket
  |
Network
  |
Socket
  |
Server
```

Sockets can also be used locally.

Common types include:

### TCP sockets

Reliable, ordered byte stream.

### UDP sockets

Datagram-based, connectionless communication with fewer guarantees.

For OS interview preparation, understand:

> **Sockets are the major IPC mechanism when communication may need to cross machine boundaries.**
