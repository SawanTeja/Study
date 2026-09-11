# 4. Process Scheduling Basics

Now we move from:

> "What is a process?"

to:

> "How does the OS decide which process gets the CPU?"

---

# 4.1 Why is Scheduling Needed?

On a single CPU core:

```text
P1
P2
P3
P4
```

cannot all literally execute instructions at the exact same instant.

The OS needs to decide:

> Which ready process should run next?

This is the job of the **CPU scheduler**.

Scheduling tries to achieve goals such as:

* high CPU utilization
* high throughput
* low waiting time
* low turnaround time
* low response time
* fairness
* meeting priorities/deadlines where applicable

---

# 4.2 CPU Burst

A **CPU burst** is a period during which a process is actively executing on the CPU.

Example:

```text
CPU burst = 5 ms
```

The process gets CPU for 5 ms before:

* requesting I/O
* being preempted
* finishing

---

# 4.3 I/O Burst

An **I/O burst** is a period where a process is waiting for an I/O operation.

For example:

```text
CPU → Disk I/O → CPU → Network I/O → CPU
```

A process alternates between CPU bursts and I/O bursts.

Conceptually:

```text
CPU burst
    ↓
I/O burst
    ↓
CPU burst
    ↓
I/O burst
    ↓
CPU burst
```

---

# 4.4 CPU-Bound vs I/O-Bound

This distinction is important.

## CPU-bound process

Spends most of its time performing computation.

Example:

```text
Large mathematical calculation
Video encoding
Scientific simulation
```

Conceptually:

```text
CPU ████████████████
I/O ██
```

CPU bursts tend to be long.

---

## I/O-bound process

Spends much of its time waiting for I/O.

Example:

```text
Database workload
File-reading application
Network application
```

Conceptually:

```text
CPU ██
I/O ████████████████
```

CPU bursts tend to be short.

### Why this matters for scheduling

An I/O-bound process can quickly use the CPU and then block for I/O.

Scheduling such processes effectively can improve responsiveness and resource utilization.

---

# 4.5 Scheduler

The scheduler determines which process should execute next.

There are traditionally three scheduler concepts:

```text
Long-term
Medium-term
Short-term
```

---

# 4.6 Long-Term Scheduler

Also called the **job scheduler**.

It decides:

> Which jobs/processes should be admitted into the system for execution.

Conceptually:

```text
Jobs on disk
    ↓
Long-term scheduler
    ↓
Processes admitted to memory/ready system
```

It controls the **degree of multiprogramming**.

### Important

It runs relatively infrequently compared with the short-term scheduler.

---

# 4.7 Short-Term Scheduler

Also called the **CPU scheduler**.

It chooses:

> Which ready process gets the CPU next?

Example:

```text
Ready Queue:

P1
P2
P3

       ↓
Short-term scheduler
       ↓
CPU → P2
```

It runs very frequently.

Therefore it needs to be fast.

---

# 4.8 Medium-Term Scheduler

The medium-term scheduler is associated with temporarily removing processes from memory and later bringing them back.

This is commonly called:

> **Swapping**

Conceptually:

```text
RAM
 ↓
temporarily remove process
 ↓
disk/backing storage
 ↓
later bring it back
 ↓
RAM
```

Why?

To manage memory pressure and the degree of multiprogramming.

Modern systems don't necessarily implement this textbook concept as one distinct scheduler component exactly as the simplified model suggests, but you should know the classical OS definition for interviews.

---

# 4.9 Comparison of Schedulers

| Scheduler   | Main job                             | Frequency    |
| ----------- | ------------------------------------ | ------------ |
| Long-term   | Admit jobs/processes                 | Low          |
| Short-term  | Select next CPU process              | Very high    |
| Medium-term | Temporarily suspend/resume processes | Intermediate |

### Easy memory trick

```text
Long-term → Who enters?
Short-term → Who runs?
Medium-term → Who temporarily leaves/returns?
```

---

# 4.10 Dispatcher

The **scheduler chooses** the next process.

The **dispatcher actually gives the CPU to that process**.

The dispatcher performs activities such as:

* context switching
* switching to user mode when appropriate
* jumping to the proper instruction in the selected process

Conceptually:

```text
Ready processes
      ↓
Scheduler
      ↓
"Run P2"
      ↓
Dispatcher
      ↓
CPU → P2
```

### Scheduler vs Dispatcher

Very common interview question.

> **Scheduler:** decides **which** process should run.

> **Dispatcher:** performs the mechanisms required to **start/resume** the selected process.

---

# 4.11 Context Switching

A **context switch** occurs when the CPU switches from one process/thread to another.

Example:

```text
P1 running
   ↓
save P1 context
   ↓
load P2 context
   ↓
P2 running
```

The saved context may include:

* program counter
* registers
* stack pointer
* processor state
* address-space information as needed

---

## Example

Suppose:

```text
P1:
PC = 1000
R1 = 50

P2:
PC = 5000
R1 = 90
```

P1 is running.

The scheduler decides to run P2.

The OS saves P1's state:

```text
P1:
PC = 1000
R1 = 50
```

Then restores P2's state:

```text
P2:
PC = 5000
R1 = 90
```

Now CPU continues P2 from the correct location.

---

# 4.12 Is Context Switching Free?

**No.**

Context switching introduces overhead.

The CPU spends time:

```text
saving state
+
loading state
```

instead of doing useful application work.

There can also be effects on caches and TLB/address-space state depending on what is being switched and the architecture/OS.

Therefore:

> Excessive context switching can reduce performance.

---

# 4.13 Process Context Switch vs Thread Context Switch

A process switch can involve changing address-space-related state.

A switch between threads belonging to the **same process** may be cheaper because they share the same address space and many resources.

Conceptually:

```text
Process A
├── Thread 1
└── Thread 2
```

Switching:

```text
Thread 1 → Thread 2
```

doesn't require changing to an entirely different process address space.

We'll cover threads in detail later.

---

# 4.14 Scheduling Queues

Processes move between different queues.

A simplified model:

```text
              +-------------+
              | Job Queue   |
              +-------------+
                     |
                     ↓
             Long-term scheduler
                     |
                     ↓
              +-------------+
              | Ready Queue |
              +-------------+
                     |
                     ↓
              Short-term scheduler
                     |
                     ↓
                  CPU
                /     \
               /       \
          I/O request   exit
             ↓            ↓
       Waiting Queue    Terminated
             |
        I/O completes
             |
             ↓
        Ready Queue
```

### Ready Queue

Contains processes ready to execute.

### Device/Waiting Queue

Contains processes waiting for a particular event/device.

For example:

```text
Disk Queue:
P1
P4
P7
```
