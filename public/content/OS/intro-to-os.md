# Phase 1 — OS Fundamentals

# 1. Introduction to Operating Systems

---

## 1.1 What is an Operating System?

An **Operating System (OS)** is system software that acts as an intermediary between:

**Applications / users ↔ Hardware**

For example:

```text
User
  ↓
Application
  ↓
Operating System
  ↓
Hardware
```

Applications generally don't directly control hardware.

For example, suppose your C++ program wants to read a file:

```cpp
ifstream file("data.txt");
```

Your program doesn't directly tell the SSD:

> "Go to these physical storage cells and retrieve these bytes."

Instead, the request eventually goes through the OS, which manages the filesystem, storage device, permissions, buffering, etc.

### Two major roles of an OS

The OS can broadly be viewed as:

### 1. Resource manager

It manages hardware resources:

* CPU
* RAM
* Disk/storage
* Network devices
* I/O devices
* Other hardware

For example, if 10 processes want to use the CPU, the OS decides **which process gets CPU time and when**.

### 2. Abstraction layer

The OS hides complicated hardware details and provides convenient abstractions.

For example:

```text
Physical disk
     ↓
Filesystem abstraction
     ↓
file.txt
```

Instead of worrying about sectors and disk blocks, programs work with:

```text
open()
read()
write()
close()
```

Similarly:

```text
Physical RAM
     ↓
Virtual memory abstraction
     ↓
Process sees its own address space
```

---

# 1.2 Why do we need an OS?

Without an OS, every program would have to manage hardware itself.

Imagine writing a program that needs to:

* access the disk
* communicate with the keyboard
* display something on the screen
* use memory
* use the network
* share CPU with another program

Every program would need to know hardware-specific details.

The OS solves this by providing:

### 1. Resource management

Multiple programs can safely share:

* CPU
* memory
* storage
* devices

### 2. Abstraction

Programs use simple interfaces instead of hardware-specific operations.

### 3. Protection

One process shouldn't normally be able to freely access another process's memory.

For example:

```text
Process A memory
----------------
0x1000
0x2000
0x3000

Process B memory
----------------
0x5000
0x6000
```

Process A shouldn't simply read/write Process B's memory.

### 4. Concurrency

The OS allows many programs to appear to execute simultaneously.

For example:

```text
Browser
VS Code
Spotify
Terminal
```

The CPU may actually execute only a limited number of threads at a time, but the OS rapidly schedules them.

### 5. Hardware independence

Applications can use standard OS interfaces rather than being written specifically for a particular disk, keyboard, or display device.

---

# 1.3 Responsibilities of an OS

The major responsibilities you should know for interviews are:

```text
Operating System
│
├── Process Management
├── Memory Management
├── File Management
├── I/O Management
└── Protection & Security
```

These topics become major OS interview subjects later.

---

## 1.3.1 Process Management

A **process** is a program in execution.

For example:

```text
program:
chrome.exe

        ↓ execution

process:
Chrome running in memory
```

The OS manages:

* process creation
* process termination
* process scheduling
* CPU allocation
* process synchronization
* inter-process communication
* context switching

Suppose three processes are ready:

```text
P1
P2
P3
```

The OS scheduler decides:

```text
CPU → P1 → P2 → P3 → P1 → ...
```

We'll later study scheduling algorithms such as:

* FCFS
* SJF
* Round Robin
* Priority Scheduling
* Multilevel Queue
* Multilevel Feedback Queue

---

## 1.3.2 Memory Management

The OS manages RAM.

It must decide:

* which process gets memory
* how much memory it gets
* where memory is located
* how memory is protected
* how memory is reclaimed
* how virtual memory works

For example:

```text
RAM
+----------------+
| OS             |
+----------------+
| Process A      |
+----------------+
| Process B      |
+----------------+
| Free           |
+----------------+
```

The OS also provides **virtual memory**, allowing processes to have an address space that is larger/different from the physical RAM layout.

Important concepts later:

* paging
* segmentation
* virtual memory
* page tables
* TLB
* page faults
* swapping
* memory allocation
* fragmentation

---

## 1.3.3 File Management

The OS provides a filesystem abstraction.

Applications work with:

```text
file.txt
folder/
image.png
```

rather than physical disk sectors.

The OS manages:

* file creation
* deletion
* reading
* writing
* file permissions
* directories
* metadata
* storage allocation

For example:

```cpp
FILE *f = fopen("data.txt", "r");
```

The OS/filesystem eventually handles locating and reading the file from storage.

---

## 1.3.4 I/O Management

I/O means **Input/Output**.

Examples:

* keyboard
* mouse
* disk
* network card
* monitor
* printer

The OS provides a common interface for interacting with devices.

For example:

```text
Application
    ↓
OS I/O subsystem
    ↓
Device driver
    ↓
Hardware
```

A **device driver** is software that allows the OS to communicate with a particular hardware device.

For example:

```text
OS
 ↓
GPU driver
 ↓
GPU
```

---

## 1.3.5 Security and Protection

The OS controls access to resources.

It provides mechanisms such as:

* authentication
* authorization
* permissions
* process isolation
* memory protection
* user/kernel privilege levels

For example, a normal application shouldn't be able to execute arbitrary privileged CPU instructions.

---

# 1.4 Types of Operating Systems

You should understand the **idea and distinction**, not memorize definitions blindly.

---

# 1.4.1 Batch OS

In a **Batch Operating System**, jobs are collected and executed in batches with little/no direct user interaction during execution.

Example:

```text
Job 1
Job 2
Job 3
Job 4

      ↓

OS processes them
```

Historically useful for large repetitive workloads.

Example:

```text
100 payroll calculations
```

You submit all jobs and the system processes them.

### Advantage

Efficient for large batches of similar jobs.

### Disadvantage

Poor interactive response.

---

# 1.4.2 Multiprogramming OS

**Multiprogramming** means keeping multiple programs in memory so the CPU can switch to another when one is waiting, especially for I/O.

Example:

```text
RAM:

+-----------+
| Program A |
+-----------+
| Program B |
+-----------+
| Program C |
+-----------+
```

Suppose:

```text
A → CPU
A → waiting for disk
```

Instead of leaving CPU idle:

```text
CPU → B
```

So CPU utilization increases.

### Core idea

> Keep multiple jobs in memory and switch between them to keep the CPU busy.

---

# 1.4.3 Multitasking OS

A multitasking OS allows multiple tasks to make progress seemingly simultaneously.

Example:

```text
Browser
Music
VS Code
Terminal
```

The OS rapidly switches CPU execution between tasks.

Modern operating systems are multitasking.

---

# 1.4.4 Time-Sharing OS

A time-sharing OS is designed for **interactive users**.

CPU time is divided into small units called **time slices/quantums**.

For example:

```text
P1 → 10ms
P2 → 10ms
P3 → 10ms
P1 → 10ms
P2 → 10ms
...
```

This creates the illusion that everyone is running simultaneously.

### Key difference

Multiprogramming focuses heavily on:

> Keeping CPU busy.

Time-sharing focuses heavily on:

> Providing responsive interactive access to users/processes.

---

# 1.4.5 Distributed OS

A distributed OS manages resources across multiple networked computers and attempts to make the system appear more unified.

Conceptually:

```text
Computer A
     \
      \
Computer B ---- Network
      /
     /
Computer C
```

Resources may be distributed across machines.

The important idea is:

> Multiple machines cooperate and are managed as part of a distributed computing environment.

Don't confuse this with simply having computers connected to a network.

---

# 1.4.6 Real-Time OS

A **Real-Time Operating System (RTOS)** is designed for systems where timing constraints are important.

The important concept isn't simply:

> "It's very fast."

Instead:

> It provides predictable timing behavior and bounded response times for important operations.

Two commonly discussed types:

### Hard real-time

Missing a deadline can be catastrophic.

Examples:

* aircraft control systems
* certain medical systems
* industrial control

### Soft real-time

Missing an occasional deadline is undesirable but not catastrophic.

Examples can include:

* multimedia
* some communication systems

### Interview trap

**Real-time ≠ fastest OS.**

Real-time means **predictable timing/deadline behavior**.

---

# 1.5 Kernel vs Operating System

This is a very common interview question.

### Kernel

The **kernel is the core component of an operating system** that runs with high privilege and manages hardware/resources.

It handles things such as:

* CPU scheduling
* memory management
* system calls
* device management
* process management
* low-level networking

### Operating System

The OS is broader than just the kernel.

Conceptually:

```text
Operating System
│
├── Kernel
├── System utilities
├── Libraries
├── Drivers
├── System services
└── Other OS components
```

The exact architecture varies by OS.

### Simple analogy

Think:

```text
OS = entire organization
Kernel = core management machinery
```

### Interview answer

If asked:

> "Is the kernel the operating system?"

Say:

> "The kernel is the core part of the operating system responsible for managing hardware and system resources. The operating system as a whole includes the kernel along with other system software and services."

---

# 1.6 User Space vs Kernel Space

This is **extremely important** for OS interviews.

Modern systems generally separate execution into privilege levels.

Conceptually:

```text
Higher privilege
┌──────────────────────┐
│     Kernel Space     │
│   OS / Kernel code   │
└──────────────────────┘

┌──────────────────────┐
│      User Space      │
│ Applications         │
│ Libraries            │
└──────────────────────┘
Lower privilege
```

## User space

Normal applications execute here.

Examples:

* Chrome
* VS Code
* your C++ program
* games

User-space programs have restricted access to hardware and privileged operations.

## Kernel space

The kernel executes here with much higher privileges.

It can perform operations that ordinary user processes cannot.

For example:

* configure hardware
* manage page tables
* access protected memory
* schedule processes

---

## Why separate them?

### Protection

Suppose an application contains a bug:

```cpp
int *p = nullptr;
*p = 10;
```

We don't want this to corrupt the kernel or the entire machine.

The OS isolates user applications.

Conceptually:

```text
Bad application
      ↓
Crash / exception
      ↓
That process is affected
```

rather than:

```text
Bad application
      ↓
Entire OS destroyed
```

---

# 1.7 Kernel Mode vs User Mode

The CPU typically provides privilege levels.

The two concepts you must know:

```text
User mode
Kernel mode
```

### User mode

Restricted privileges.

Applications execute here.

### Kernel mode

Privileged execution.

Kernel code executes here.

---

## Example

Suppose your program does:

```cpp
read(fd, buffer, 100);
```

The actual operation requires OS involvement.

Conceptually:

```text
User program
     ↓
read()
     ↓
system call
     ↓
CPU switches privilege
     ↓
Kernel
     ↓
disk/device
     ↓
Kernel
     ↓
return to user mode
     ↓
program continues
```

We'll examine this in detail in the system calls section.

---

# 1.8 Monolithic Kernel

In a **monolithic kernel**, many major OS services run inside kernel space.

Conceptually:

```text
User Applications
       ↓
System Calls
       ↓
+--------------------------+
|       Kernel Space       |
|                          |
| Process Management       |
| Memory Management        |
| File System              |
| Device Drivers           |
| Networking               |
+--------------------------+
       ↓
Hardware
```

### Advantages

* Good performance
* Components can communicate efficiently

### Disadvantages

* Large kernel
* A bug in a kernel component can potentially affect the whole system
* More complex kernel code

### Example

Linux is generally classified as a **monolithic kernel**, although it is modular.

That distinction is important:

> Monolithic does not mean "everything is compiled into one giant static binary."

Linux supports dynamically loadable kernel modules.

---

# 1.9 Microkernel

A **microkernel** tries to keep the kernel as small as possible.

Only essential mechanisms remain in kernel space.

For example:

```text
              User Space
+----------------------------------+
| File Server | Driver | Network   |
+----------------------------------+

              Kernel Space
+----------------------------------+
| IPC | Scheduling | Basic Memory  |
+----------------------------------+

              Hardware
```

Many services run in user space.

### Advantages

* Better isolation
* Smaller trusted kernel
* Fault isolation can be better
* Potentially easier to maintain modular components

### Disadvantages

Communication between components may require more IPC/context switching, potentially introducing overhead.

### Core distinction

```text
Monolithic:
More OS services → kernel space

Microkernel:
Minimal mechanisms → kernel space
More services → user space
```

---

# 1.10 Hybrid Kernel

A **hybrid kernel** combines ideas from monolithic and microkernel designs.

It tries to retain:

* performance of monolithic designs
* modularity/isolation ideas from microkernels

Windows NT is commonly described as having a **hybrid kernel architecture**.

The important interview point is understanding the architectural tradeoff rather than arguing over labels.

---

# 1.11 Basic Linux Architecture

A simplified view:

```text
+------------------------------------+
|          User Applications         |
| Chrome | VS Code | Shell | etc.    |
+------------------------------------+
                 ↓
+------------------------------------+
|      Libraries / System APIs       |
|             libc etc.              |
+------------------------------------+
                 ↓
+------------------------------------+
|             System Calls           |
+------------------------------------+
                 ↓
+------------------------------------+
|              Linux Kernel          |
|                                    |
| Process Management                 |
| Memory Management                  |
| File Systems                       |
| Networking                         |
| Device Drivers                     |
+------------------------------------+
                 ↓
+------------------------------------+
|              Hardware              |
| CPU | RAM | Disk | Network | etc. |
+------------------------------------+
```

A shell such as `bash` is a user-space program.

If you type:

```bash
cat file.txt
```

the `cat` program eventually uses OS interfaces to read the file.

---

# 1.12 Basic Windows Architecture

A simplified view:

```text
+------------------------------------+
|          User Applications         |
+------------------------------------+
                 ↓
+------------------------------------+
| User-mode system components        |
| APIs / Runtime / Services          |
+------------------------------------+
                 ↓
+------------------------------------+
|          Windows Kernel             |
| Executive + Kernel + Drivers       |
+------------------------------------+
                 ↓
+------------------------------------+
|              Hardware              |
+------------------------------------+
```

You don't need to memorize every Windows subsystem for a fresher OS interview.

Know the key architectural concepts:

* user mode
* kernel mode
* system calls/system services
* kernel
* drivers
* hardware
* process/memory/I/O management

---

# 1.13 Important Interview Questions from Topic 1

### Q1. What is an operating system?

> An OS is system software that acts as an interface between applications/users and hardware while managing system resources such as CPU, memory, storage, and I/O devices.

### Q2. Why do we need an OS?

Because it provides:

* resource management
* hardware abstraction
* protection
* process management
* memory management
* I/O management

### Q3. Kernel vs OS?

Kernel is the core privileged component; OS is the broader system software environment.

### Q4. User mode vs kernel mode?

User mode has restricted privileges for applications. Kernel mode has privileged access required to manage hardware and system resources.

### Q5. Why can't applications directly access hardware?

Primarily for **protection, isolation, and controlled resource management**.

### Q6. Difference between multiprogramming and multitasking?

**Multiprogramming:** multiple programs are kept in memory and CPU switches when one waits, improving CPU utilization.

**Multitasking:** multiple tasks are given CPU time so they can make progress seemingly concurrently, especially emphasizing responsiveness.

### Q7. Is Linux monolithic?

Yes, Linux uses a **monolithic kernel design**, while also supporting modular components such as loadable kernel modules.

### Q8. Is a real-time OS necessarily faster?

No. Its defining property is **predictable/bounded timing behavior**, not simply maximum speed.
