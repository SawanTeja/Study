# Phase 2 — Processes

This is one of the **most important parts of OS interview preparation**. You should be able to explain the concepts verbally **and** solve scheduling problems on paper.

The key mental model is:

```text
Program
   ↓
Process
   ↓
Process enters Ready Queue
   ↓
CPU Scheduler selects it
   ↓
Running
   ↓
 ┌───────────────┬────────────────┐
 ↓               ↓                ↓
I/O request    Time slice       exit
 ↓               ↓                ↓
Waiting         Ready          Terminated
 ↓
I/O completes
 ↓
Ready
```

---

# 3. Process Fundamentals

## 3.1 Program vs Process

This is a very common interview question.

### Program

A **program is a passive set of instructions stored on disk**.

For example:

```text
calculator.exe
```

or:

```text
myprogram
```

The program itself isn't executing.

### Process

A **process is a program that is currently executing**, along with its execution state and resources.

For example:

```text
Program:
chrome.exe
        ↓
Process:
Chrome currently running
```

A process contains more than just the program's instructions:

```text
Process
├── Code
├── Data
├── Heap
├── Stack
├── CPU state
├── Program counter
├── Registers
├── Open files
└── Other resources
```

### Important distinction

One program can have **multiple processes**.

For example, you could execute:

```text
./program
```

twice:

```text
Program
  ↓
Process 1

Program
  ↓
Process 2
```

They are separate processes with separate execution states/address spaces.

### Interview answer

> A program is a passive executable stored on storage, whereas a process is an active instance of a program in execution with its own execution state and allocated resources.

---

# 3.2 Process States

A process doesn't continuously execute on the CPU.

It moves through different states.

The basic five-state model is:

```text
New
Ready
Running
Waiting / Blocked
Terminated
```

---

## 3.2.1 New

The process is being created.

Example:

```text
fork()
  ↓
New process
```

The OS creates the necessary process structures/resources.

---

## 3.2.2 Ready

The process is ready to execute but is **waiting for CPU time**.

Example:

```text
Ready Queue:

P1
P2
P3
```

Only one can execute on a single CPU core at a time.

The scheduler chooses one.

---

## 3.2.3 Running

The process is currently executing on a CPU.

```text
CPU
 ↓
P1
```

A process can leave Running because:

* it finishes
* it requests I/O
* it gets preempted
* it waits for some event

---

## 3.2.4 Waiting / Blocked

The process cannot continue until some event occurs.

Most commonly:

> It is waiting for I/O to complete.

Example:

```text
P1 → read() → waiting for disk
```

While P1 waits, another process can use the CPU.

```text
P1 → Blocked
P2 → Running
```

This is one of the reasons multiprogramming improves CPU utilization.

---

## 3.2.5 Terminated

The process has finished execution.

For example:

```text
main()
  ↓
return 0
  ↓
process terminates
```

The OS performs necessary cleanup, although some process-related information may temporarily remain for the parent to collect the exit status.

That distinction becomes important for **zombie processes**.

---

# 3.3 Process State Transition Diagram

The standard model:

```text
                admitted
       +----------------------+
       |                      ↓
     NEW ────────────────→ READY
                              |
                              | dispatch
                              ↓
                           RUNNING
                         /    |     \
                        /     |      \
                       /      |       \
                  I/O wait   |        exit
                     |       |          |
                     ↓       |          ↓
                  WAITING ←--+       TERMINATED
                     |
                     | I/O complete
                     ↓
                   READY
```

The transition:

```text
Running → Ready
```

happens when a process is **preempted**.

The transition:

```text
Running → Waiting
```

usually happens when the process requests I/O or waits for some event.

The transition:

```text
Waiting → Ready
```

happens when the event/I/O completes.

---

## 3.3.1 Important transitions

### New → Ready

Process has been created/admitted to the ready queue.

### Ready → Running

CPU scheduler selects it and dispatcher gives it the CPU.

### Running → Ready

Process is preempted.

Examples:

* time quantum expires
* higher-priority process needs CPU

### Running → Waiting

Process needs something before it can continue.

Example:

```text
read from disk
```

### Waiting → Ready

Required event/I/O completes.

### Running → Terminated

Process finishes or exits.

---

# 3.4 Process Control Block (PCB)

This is **extremely important**.

A **Process Control Block (PCB)** is a kernel data structure containing information the OS needs to manage a process.

Conceptually:

```text
PCB
+---------------------------+
| Process ID                |
| Process State             |
| Program Counter           |
| CPU Registers             |
| Scheduling Information    |
| Memory Management Info    |
| Accounting Information    |
| I/O / Open File Info      |
+---------------------------+
```

---

## What does a PCB contain?

### 1. Process ID

Unique identifier for the process.

```text
PID = 1234
```

### 2. Process state

For example:

```text
Ready
Running
Blocked
```

### 3. Program Counter

The address of the **next instruction to execute**.

For example:

```text
PC = 0x401250
```

### 4. CPU registers

The process's CPU execution state.

Examples:

* general-purpose registers
* stack pointer
* instruction pointer/program counter
* other architecture-specific registers

### 5. Scheduling information

Such as:

* priority
* scheduling parameters
* queue information

### 6. Memory-management information

Information associated with the process's address space.

For example:

* page-table information
* memory mappings

### 7. Accounting information

Potentially:

* CPU time used
* process owner
* resource usage

### 8. I/O information

For example:

* open file descriptors
* I/O-related state

---

# 3.5 Why is PCB important?

Because the OS needs to know:

> "Where was this process, and how do I resume it?"

Suppose:

```text
P1 is running
```

Then P1 gets preempted.

The OS saves P1's relevant execution state.

```text
P1 CPU state
    ↓
saved in process/kernel data structures
```

Then:

```text
P2 runs
```

Later P1 runs again.

The OS restores the necessary state:

```text
saved P1 state
      ↓
CPU
      ↓
P1 continues
```

This is fundamental to **context switching**.

---

# 3.6 Process Context

A process's **context** is the information representing its current execution state.

It includes things such as:

* program counter
* CPU registers
* stack pointer
* processor state
* address-space-related state
* other information needed to resume execution

For example:

```text
P1:

PC = 0x400500
SP = 0x7fff...
R1 = ...
R2 = ...
...
```

When P1 stops running, this state needs to be preserved so it can continue later.

---

# 3.7 Process ID (PID)

A **PID** is an identifier assigned to a process by the OS.

Example on Linux:

```bash
ps
```

might show:

```text
PID     COMMAND
1234    bash
2451    chrome
3122    myprogram
```

A process can obtain its PID in C:

```c
#include <unistd.h>
#include <stdio.h>

int main() {
    printf("PID = %d\n", getpid());
    return 0;
}
```

`getpid()` is a system call/API interface used to obtain the process ID.

---

# 3.8 Process Creation

Processes can create other processes.

In Unix-like systems, a classic mechanism is:

```text
fork()
```

Example:

```c
pid_t pid = fork();

if (pid == 0) {
    printf("Child\n");
} else {
    printf("Parent\n");
}
```

After `fork()`:

```text
Parent
   |
   | fork()
   |
   +----------+
              |
           Child
```

The child gets its own process identity.

---

## Parent and Child

The process that creates another process is the:

> **Parent**

The newly created process is the:

> **Child**

You can therefore have a hierarchy:

```text
P1
├── P2
│   ├── P4
│   └── P5
└── P3
```

This is a process tree.

---

# 3.9 Process Termination

A process can terminate because:

### 1. It finishes normally

```c
return 0;
```

or:

```c
exit(0);
```

### 2. It encounters an error

For example, a fatal error.

### 3. It is terminated by another process/OS

For example, a process may receive a termination signal.

After termination, the OS eventually reclaims the process's resources.

However, there is an important special case:

> **Zombie process**

---

# 3.10 Orphan Process

An **orphan process** is a child process whose parent has terminated while the child is still running.

Example:

```text
Parent
  |
  └── Child
```

Parent exits first:

```text
Parent → terminated

Child → still running
```

The child becomes orphaned.

On Unix-like systems, the orphan is adopted/re-parented to an appropriate system process (traditionally `init`, or in modern Linux systems typically a process such as `systemd` or another configured subreaper).

### Key point

An orphan is:

> **Still running, but its original parent has exited.**

It is **not necessarily a problem**.

---

# 3.11 Zombie Process

This is another extremely common interview question.

A **zombie process** is a child that has **already terminated**, but its parent has not yet collected its termination status.

Example:

```text
Parent
  |
  └── Child
```

Child exits:

```text
Child → terminated
```

But parent hasn't called:

```c
wait()
```

So some process-table information is retained.

Conceptually:

```text
Child
  ↓
terminated
  ↓
exit status retained
  ↓
ZOMBIE
```

The parent eventually calls:

```c
wait()
```

and the OS can release the remaining process entry.

---

# 3.12 Orphan vs Zombie

Memorize this comparison.

| Orphan                                  | Zombie                                      |
| --------------------------------------- | ------------------------------------------- |
| Parent terminates first                 | Child terminates first                      |
| Child is still running                  | Child has already terminated                |
| Child is re-parented                    | Exit status remains until collected         |
| Not inherently a resource-table problem | Consumes a process-table entry until reaped |

### Easy memory trick

```text
Orphan:
Parent dies → Child lives

Zombie:
Child dies → Parent hasn't collected it
```

---

# 3.13 Can a Zombie execute?

**No.**

A zombie has already terminated.

It does not execute and does not consume CPU like a normal process.

It mainly represents retained process information, such as its exit status, until the parent collects it.

---

# 3.14 Can an Orphan execute?

**Yes.**

An orphan is still an active process.
