# 2. System Calls

This is one of the **highest-value OS interview topics**.

The central question is:

> **How does a normal user program request a privileged service from the OS?**

Answer:

**Through system calls.**

---

# 2.1 What is a System Call?

A **system call** is the controlled interface through which a user-space program requests a service from the operating system kernel.

Examples:

```text
open()
read()
write()
close()
fork()
exec()
wait()
```

For example:

```cpp
read(fd, buffer, 100);
```

The application is requesting:

> "Kernel, please read data from this file descriptor into this buffer."

The kernel performs the privileged operation and returns a result.

---

# 2.2 Why do system calls exist?

Because applications run with restricted privileges.

Suppose a program wants to:

* read a disk
* create a process
* allocate certain resources
* communicate through OS-managed mechanisms

It can't simply execute arbitrary privileged instructions.

Instead:

```text
Application
     ↓
System Call
     ↓
Kernel
     ↓
Privileged operation
```

This provides controlled access.

---

# 2.3 User Mode vs Kernel Mode

Let's connect this to system calls.

Initially:

```text
Application
↓
User Mode
```

Suppose it executes:

```c
read(fd, buffer, size);
```

The operation eventually causes a transition:

```text
User Mode
    ↓
System Call mechanism
    ↓
Kernel Mode
    ↓
Kernel handles request
    ↓
User Mode
```

This is often called a **mode switch**.

---

# 2.4 System Call Flow

This is something you should be able to explain verbally in an interview.

Suppose:

```c
read(fd, buffer, 100);
```

### Step 1 — Application calls an API/library wrapper

Your application invokes something like:

```c
read()
```

Depending on the environment, this may be provided through a C library/system-call wrapper.

### Step 2 — Arguments are prepared

The arguments need to be made available to the kernel:

```text
fd
buffer
100
```

### Step 3 — System call instruction is executed

The CPU executes a special mechanism/instruction that transitions execution into a privileged kernel entry point.

Modern CPUs use mechanisms such as:

* `syscall` on x86-64
* architecture-specific equivalents

### Step 4 — CPU enters kernel mode

The processor changes to a privileged execution context and transfers control to the kernel's system-call entry mechanism.

### Step 5 — Kernel identifies the requested system call

The system call number/entry information tells the kernel which operation was requested.

Conceptually:

```text
system call number
        ↓
system-call table
        ↓
appropriate kernel function
```

### Step 6 — Kernel validates arguments

This is extremely important.

The kernel cannot blindly trust user programs.

It checks things such as:

* Is the file descriptor valid?
* Is the operation permitted?
* Is the memory buffer valid?
* Does the process have permission?

### Step 7 — Kernel performs the operation

For `read()`, this could involve:

```text
Kernel
 ↓
Filesystem
 ↓
Block/device layer
 ↓
Device driver
 ↓
Storage hardware
```

The exact path depends on the device and whether data is already cached.

### Step 8 — Kernel returns result

For example:

```text
read() → 100
```

meaning 100 bytes were successfully read.

Or:

```text
read() → -1
```

with an appropriate error indication such as `errno` in POSIX environments.

### Step 9 — Return to user mode

Execution resumes in the user process.

---

# 2.5 Visualizing `read()`

```text
User Program
     |
     | read(fd, buffer, 100)
     ↓
C Library / syscall wrapper
     |
     | system call instruction
     ↓
CPU
     |
     | privilege transition
     ↓
Kernel
     |
     | validate fd, permissions, buffer
     ↓
Filesystem
     ↓
Device Layer / Driver
     ↓
Disk / Device
     ↑
Kernel
     ↑
User Mode
     ↑
read() returns
```

### Important nuance

`read()` does **not necessarily mean the physical disk is accessed every time**.

The kernel may already have the data in memory through caching/page cache.

So:

```text
read()
```

means:

> Request data through the OS interface.

It does **not necessarily mean**:

> Physically access the disk right now.

---

# 2.6 Types of System Calls

The traditional categories are:

```text
System Calls
│
├── Process Control
├── File Management
├── Device Management
├── Information Maintenance
├── Communication
└── Protection
```

Let's understand each.

---

# 2.7 Process Control System Calls

Used to create/manage processes.

Examples:

```text
fork()
exec()
wait()
exit()
```

---

## `fork()`

Creates a new process by duplicating the calling process.

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
Parent Process
      |
      | fork()
      ↓
+-----------+
| Parent    |
+-----------+
      |
      +----------+
      ↓          ↓
   Parent       Child
```

Both processes continue execution after `fork()`.

### Return value

This is extremely important for interviews.

In the **parent**:

```text
fork() returns child PID
```

In the **child**:

```text
fork() returns 0
```

If it fails:

```text
fork() returns -1
```

---

# 2.8 `exec()`

`exec()` is used to **replace the current process's program/image with another program**.

Important:

> `exec()` does not normally create a new process.

Example concept:

```text
Process
running program A
       ↓
     exec()
       ↓
same process
running program B
```

This distinction is one of the most common interview questions.

---

# 2.9 `fork()` + `exec()`

These are frequently used together.

Example shell behavior:

```text
Shell
  |
  | fork()
  ↓
Child
  |
  | exec("ls")
  ↓
ls program
```

The shell remains alive while the child executes `ls`.

Conceptually:

```text
Parent: shell
     |
     | fork
     +----------------+
     |                |
     ↓                ↓
Shell             Child
                     |
                     | exec()
                     ↓
                    ls
```

---

# 2.10 `wait()`

A parent can use `wait()` to wait for a child process to terminate.

Example:

```c
pid_t pid = fork();

if (pid == 0) {
    printf("Child\n");
    exit(0);
} else {
    wait(NULL);
    printf("Parent continues\n");
}
```

Possible output:

```text
Child
Parent continues
```

The parent waits until the child terminates.

This becomes important when studying:

* zombie processes
* process synchronization
* process lifecycle

---

# 2.11 `exit()`

Terminates the calling process.

Example:

```c
exit(0);
```

The OS performs process termination and resource cleanup.

---

# 2.12 File Management System Calls

Important calls:

```text
open()
read()
write()
close()
```

---

# 2.13 `open()`

Used to open a file and obtain a **file descriptor**.

Example:

```c
int fd = open("data.txt", O_RDONLY);
```

If successful:

```text
fd = 3
```

The exact number can vary.

### What is a file descriptor?

A **file descriptor (FD)** is a small integer used by a process to refer to an open file or other I/O resource.

Common POSIX descriptors:

```text
0 → stdin
1 → stdout
2 → stderr
```

For example:

```text
open("data.txt")
       ↓
fd = 3
```

Then:

```c
read(3, buffer, 100);
```

---

# 2.14 `read()`

Reads data from a file descriptor.

Example:

```c
char buffer[100];

int n = read(fd, buffer, 100);
```

Meaning:

> Try to read up to 100 bytes from `fd` into `buffer`.

Return value:

```text
> 0  → number of bytes read
  0  → EOF
< 0  → error
```

This is worth remembering.

---

# 2.15 `write()`

Writes data to a file descriptor.

Example:

```c
char msg[] = "Hello\n";

write(1, msg, 6);
```

Since:

```text
1 = stdout
```

this writes to standard output.

---

# 2.16 `close()`

Closes a file descriptor.

```c
close(fd);
```

After closing it, the descriptor should no longer be used for that open resource.

---

# 2.17 Complete File Example

```c
#include <fcntl.h>
#include <unistd.h>

int main() {
    int fd = open("data.txt", O_RDONLY);

    char buffer[100];

    int n = read(fd, buffer, 100);

    write(1, buffer, n);

    close(fd);

    return 0;
}
```

Conceptually:

```text
open()
  ↓
fd

read(fd)
  ↓
data → buffer

write(stdout)
  ↓
terminal

close(fd)
```

---

# 2.18 Device Management System Calls

System calls can also be used to interact with devices.

Examples conceptually include:

* reading from a device
* writing to a device
* requesting device-specific operations

Unix-like systems often expose many devices through file-like interfaces.

Device-specific operations may use calls such as:

```text
ioctl()
```

You don't need to memorize every device syscall for a fresher interview.

Understand:

> The OS provides controlled interfaces for applications to interact with devices, usually through drivers and kernel subsystems.

---

# 2.19 Information Maintenance System Calls

These obtain or modify system/process information.

Examples include operations for:

* process IDs
* system information
* time
* process attributes

For example:

```c
getpid();
```

returns the current process ID.

Conceptually:

```text
Process
  ↓
getpid()
  ↓
Kernel/system information
```

---

# 2.20 Communication System Calls

Used for communication between processes or with other systems.

Important concepts include:

* pipes
* shared memory
* message queues
* sockets
* signals

Examples:

```text
pipe()
socket()
send()
recv()
```

We'll study IPC separately later.

---

# 2.21 Protection System Calls

These deal with permissions and access control.

Examples/concepts include:

* changing file permissions
* changing ownership
* checking access
* user/group identity

Examples on Unix-like systems:

```text
chmod()
chown()
access()
```

The exact APIs vary by operating system.

---

# 2.22 System Call vs Function Call

Very common interview question.

## Function call

A normal function call generally stays within the current execution context.

Example:

```cpp
int add(int a, int b) {
    return a + b;
}

int x = add(2, 3);
```

Conceptually:

```text
User mode
   ↓
Function
   ↓
User mode
```

No kernel transition is inherently required.

---

## System call

A system call requests a kernel service and normally involves a controlled transition into kernel mode.

```text
User mode
   ↓
System call
   ↓
Kernel mode
   ↓
User mode
```

### Comparison

| Function Call                     | System Call                 |
| --------------------------------- | --------------------------- |
| Calls a function                  | Requests OS/kernel service  |
| Usually same privilege level      | Enters kernel privilege     |
| Usually cheaper                   | Usually more overhead       |
| Doesn't inherently require kernel | Requires kernel involvement |

### Important nuance

A function such as:

```c
printf()
```

is a library function, not itself a system call.

It may eventually cause a system call such as `write()`.

---

# 2.23 System Call vs API

Another common trap.

An **API (Application Programming Interface)** is a programming interface exposed to developers.

A **system call** is the kernel entry mechanism/interface used to request OS services.

They are related but not identical.

For example:

```text
Application
     ↓
C library API
     ↓
system-call wrapper
     ↓
system call
     ↓
Kernel
```

Consider:

```c
printf("Hello");
```

`printf()` is a C library function/API.

It may eventually use:

```text
write()
```

which is a system call.

---

## Another example: Windows

An application might use a high-level Windows API.

Conceptually:

```text
Application
   ↓
Windows API
   ↓
System service
   ↓
Kernel
```

Therefore:

> API is the interface available to programmers; a system call is the controlled mechanism through which a program requests a kernel service.

Not every API call is necessarily a system call.

Some APIs can be implemented entirely in user space.

---

# 2.24 What Actually Happens During `fork()`?

This is worth understanding carefully.

Suppose:

```c
printf("A\n");

pid_t pid = fork();

printf("B\n");
```

Before `fork()`:

```text
One process

Process P
  |
  +-- program state
```

After `fork()`:

```text
Parent P
   |
   +-- execution state

Child C
   |
   +-- copied/inherited process state
```

Both continue from the point after `fork()`.

Therefore:

```text
A
B
B
```

is a possible output.

### Important modern detail

The OS doesn't necessarily physically copy all memory immediately.

Modern systems commonly use **copy-on-write (COW)**.

Conceptually:

```text
Parent ───────┐
              ├── same physical pages initially
Child ────────┘
```

If one process modifies a page:

```text
Parent → page X
Child  → page X

Child writes X
      ↓
OS creates separate copy
```

We'll study copy-on-write later under processes/memory.

---

# 2.25 What Actually Happens During `exec()`?

Suppose:

```c
execl("/bin/ls", "ls", NULL);
```

The current process's program is replaced.

Before:

```text
PID 100
Program = shell
```

After successful `exec()`:

```text
PID 100
Program = ls
```

The **PID remains the same**, while the process's program image is replaced.

That's a very useful interview point.

---

# 2.26 What Happens During `read()`?

Suppose:

```c
read(fd, buffer, 100);
```

A good interview explanation is:

1. User program invokes `read()`.
2. A system-call mechanism transfers control to the kernel.
3. CPU executes kernel code with appropriate privilege.
4. Kernel validates the file descriptor and user buffer.
5. Kernel checks the relevant file/filesystem state.
6. Data may already exist in the kernel's cache, or the kernel may need to obtain it from the device.
7. Data is copied/transferred into the user-provided buffer as appropriate.
8. Kernel returns the number of bytes read or an error.
9. Execution resumes in user mode.

Don't say:

> "`read()` always accesses the disk."

That's incorrect.

---

# 2.27 System Call vs Context Switch

This distinction is **very important**.

A **system call** is a transition from user mode to kernel mode to request a kernel service.

A **context switch** means switching CPU execution from one process/thread to another.

They are not the same thing.

### System call

```text
Process A
User Mode
   ↓
Kernel Mode
   ↓
Process A
User Mode
```

Same process can continue.

### Context switch

```text
Process A
   ↓
save A state
   ↓
restore B state
   ↓
Process B
```

Different execution context.

### Can a system call cause a context switch?

Yes.

For example, if:

```text
Process A → read()
```

and the required data isn't immediately available, Process A may block.

Then the scheduler may run Process B:

```text
A → read()
  ↓
A blocks
  ↓
Scheduler
  ↓
B runs
```

So:

> A system call does not inherently mean a context switch, but some system calls can lead to one.

---

# 2.28 Why are System Calls More Expensive Than Normal Function Calls?

A normal function call can often be relatively cheap:

```text
call function
execute function
return
```

A system call requires controlled transition into the kernel and back.

Potential costs include:

* privilege transition
* saving/restoring relevant CPU state
* kernel validation
* kernel processing
* possible cache/TLB effects
* possible blocking/scheduling

Therefore system calls generally have more overhead than ordinary user-space function calls.

But don't claim:

> "Every system call causes a context switch."

It doesn't.

---

# 2.29 Important System Call Interview Questions

### Q1. What is a system call?

> A controlled interface through which a user-space program requests a service from the OS kernel.

---

### Q2. Why are system calls needed?

Because user programs run with restricted privileges and need a controlled mechanism to access OS-managed resources.

---

### Q3. What happens when `read()` is called?

Know this sequence:

```text
Application
 ↓
read()
 ↓
system-call mechanism
 ↓
kernel mode
 ↓
validate request
 ↓
filesystem/device/cache
 ↓
result
 ↓
user mode
```

---

### Q4. What is the difference between `fork()` and `exec()`?

**fork():**

> Creates a new process.

**exec():**

> Replaces the current process's program image with another program.

Often:

```text
fork()
  ↓
child
  ↓
exec()
  ↓
new program
```

---

### Q5. Does `exec()` create a new process?

**No.**

It replaces the current process's program image.

---

### Q6. What does `fork()` return?

```text
Parent → child PID
Child  → 0
Failure → -1
```

---

### Q7. What is a file descriptor?

A small integer used by a process to refer to an open file or I/O resource.

Typical Unix descriptors:

```text
0 → stdin
1 → stdout
2 → stderr
```

---

### Q8. Is `printf()` a system call?

No.

`printf()` is a library function. It may eventually invoke a system call such as `write()`.

---

### Q9. System call vs API?

API is a programmer-facing interface; a system call is the kernel service request mechanism. An API may use one or more system calls—or none.

---

### Q10. Does every system call cause a context switch?

**No.**

It causes a user/kernel privilege transition, but a context switch between processes/threads occurs only if scheduling requires it.

---

# 2.30 The Mental Model You Should Have

For interviews, keep these three layers separate:

```text
                 USER SPACE
┌─────────────────────────────────┐
│ Application                     │
│                                 │
│ printf()                        │
│ fopen()                         │
│ read() wrapper                  │
└─────────────────────────────────┘
                 ↓
          System Call
                 ↓
                 KERNEL SPACE
┌─────────────────────────────────┐
│ Kernel                          │
│                                 │
│ Process management              │
│ Memory management               │
│ Filesystem                      │
│ Networking                      │
│ Device drivers                  │
└─────────────────────────────────┘
                 ↓
              HARDWARE
┌─────────────────────────────────┐
│ CPU | RAM | SSD | NIC | etc.    │
└─────────────────────────────────┘
```

And remember these distinctions:

```text
OS
└── Kernel is its core component

User mode
└── Restricted application execution

Kernel mode
└── Privileged OS execution

Function call
└── Normal program-level call

API
└── Programmer-facing interface

System call
└── Request to kernel

Context switch
└── Switch execution from one process/thread to another
```
