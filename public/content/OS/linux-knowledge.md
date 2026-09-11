# Phase 15 — Linux-Specific OS Knowledge

You don't need to memorize every Linux command for a fresher interview.

The goal is to understand what common commands mean and how they relate to OS concepts.

---

# 54. Basic Linux Process Concepts

## 54.1 `ps`

`ps` displays information about processes.

For example:

```bash
ps
```

or commonly:

```bash
ps aux
```

You may see information such as:

```text
PID
USER
CPU
MEMORY
COMMAND
```

The important OS concept:

> `ps` lets you inspect currently running processes.

---

# 54.2 `top`

`top` provides a continuously updating view of system/process activity.

It can show:

* CPU usage
* Memory usage
* Process IDs
* Process states
* Load information
* Running processes

Conceptually:

```text
top
 ↓
Kernel process/system information
 ↓
Display live process statistics
```

### `ps` vs `top`

```text
ps
→ snapshot

top
→ continuously updating view
```

---

# 54.3 `kill`

Despite its name, `kill` doesn't necessarily mean "forcefully terminate."

It sends a **signal** to a process.

Example:

```bash
kill 1234
```

Typically sends:

```text
SIGTERM
```

You can explicitly specify a signal.

For example:

```bash
kill -9 1234
```

sends:

```text
SIGKILL
```

which forcefully terminates the process and cannot be caught or handled by the process.

This connects directly to your IPC/signals topic.

---

# 54.4 `jobs`

`jobs` shows jobs associated with the current shell.

For example:

```bash
jobs
```

might show:

```text
[1]+ Running    ./program &
[2]- Stopped    ./program2
```

This is related to **shell job control**.

---

# 54.5 `fg`

`fg` means **foreground**.

It brings a background/stopped shell job into the foreground.

Example:

```bash
fg %1
```

Conceptually:

```text
Background job
      ↓
     fg
      ↓
Foreground job
```

---

# 54.6 `bg`

`bg` resumes a stopped job in the background.

Example:

```bash
bg %1
```

Conceptually:

```text
Stopped job
     ↓
    bg
     ↓
Background execution
```

---

# 54.7 `nice`

`nice` starts a process with a specified **niceness** value.

Niceness influences CPU scheduling priority.

For Linux's normal scheduling classes, a higher nice value generally means **lower scheduling priority**, while a lower nice value generally means **higher priority**.

Example:

```bash
nice -n 10 ./program
```

The process starts with increased niceness.

---

# 54.8 `renice`

`renice` changes the niceness of an already-running process.

Example:

```bash
renice 10 -p 1234
```

Conceptually:

```text
Running process
      ↓
   renice
      ↓
Changed niceness
      ↓
Different scheduling priority
```

### `nice` vs `renice`

```text
nice
→ set niceness when starting

renice
→ change niceness of existing process
```

---

# 55. Basic Linux File Concepts

## 55.1 `ls`

Lists files/directories.

```bash
ls
```

Useful:

```bash
ls -l
```

The `-l` form shows details such as:

* Permissions
* Owner
* Group
* Size
* Modification time
* Filename

---

# 55.2 `cd`

Changes the current working directory.

```bash
cd directory
```

Example:

```bash
cd Documents
```

---

# 55.3 `pwd`

Prints the current working directory.

```bash
pwd
```

Example:

```text
/home/user/Documents
```

---

# 55.4 `cp`

Copies files/directories.

```bash
cp source.txt destination.txt
```

Conceptually:

```text
source
  ↓
copy
  ↓
destination
```

---

# 55.5 `mv`

Moves or renames files/directories.

```bash
mv old.txt new.txt
```

It can be used to:

* Rename
* Move

Example:

```bash
mv file.txt /tmp/
```

---

# 55.6 `rm`

Removes files.

```bash
rm file.txt
```

For directories, options such as `-r` can recursively remove contents.

```bash
rm -r directory
```

Be careful: command-line deletion generally doesn't provide a recycle-bin-style safety net by default.

---

# 55.7 `chmod`

Changes file permissions.

Example:

```bash
chmod 755 script.sh
```

Linux permissions are commonly represented as:

```text
rwx rwx rwx
```

for:

```text
owner group others
```

---

# 55.8 `chown`

Changes file ownership.

Example:

```bash
chown user file.txt
```

It can also change group ownership:

```bash
chown user:group file.txt
```

---

# 55.9 Linux File Permissions

Linux commonly has three permission categories:

```text
Owner
Group
Others
```

And three basic permissions:

```text
r = read
w = write
x = execute
```

So:

```text
rwxr-xr--
```

means:

```text
Owner:  rwx
Group:  r-x
Others: r--
```

---

# 55.10 Numeric Permissions

Permissions have numeric values:

```text
r = 4
w = 2
x = 1
```

Therefore:

```text
rwx = 4 + 2 + 1 = 7
rw- = 4 + 2     = 6
r-x = 4 + 1     = 5
r-- = 4         = 4
```

So:

```bash
chmod 755 file
```

means:

```text
Owner  = 7 = rwx
Group  = 5 = r-x
Others = 5 = r-x
```

Therefore:

```text
rwxr-xr-x
```

This is very common in interviews.

---

# 55.11 Users and Groups

Linux uses users and groups for access control.

A file has:

```text
Owner
Group
Permissions
```

Example:

```text
-rwxr-xr--
```

Conceptually:

```text
             File
              |
       +------+------+
       |             |
     Owner         Group
       |             |
      rwx           r-x

Others → r--
```

This allows the OS to control who can:

* Read
* Write
* Execute

a file.

---

# 56. Important Linux System Calls

These are extremely useful because they connect your theoretical OS knowledge to actual Linux.

---

# 56.1 `fork()`

`fork()` creates a new process by duplicating the calling process.

```text
Parent Process
      |
    fork()
      |
   +--+--+
   |     |
Parent  Child
```

After `fork()`, there are two processes.

Typical return values:

```text
fork() returns 0
→ child

fork() returns child's PID
→ parent

fork() returns -1
→ failure
```

Example:

```c
#include <stdio.h>
#include <unistd.h>

int main() {
    fork();

    printf("Hello\n");

    return 0;
}
```

Assuming `fork()` succeeds and buffering doesn't alter what you observe, both parent and child execute the `printf`, so `"Hello"` can appear twice.

This is a classic interview question.

---

# 56.2 `exec()`

`exec` **replaces the current process's program image** with another program.

Important:

> `exec()` does NOT normally create a new process.

Typical combination:

```text
fork()
  ↓
Child created
  ↓
exec()
  ↓
Child runs another program
```

This is how shells commonly launch programs.

Conceptually:

```text
Shell
 |
 | fork()
 ↓
Child
 |
 | exec()
 ↓
Program
```

---

# 56.3 `wait()`

`wait()` allows a parent process to wait for a child process to terminate.

```text
Parent
  |
  | wait()
  ↓
waits
  |
Child terminates
  ↓
Parent continues
```

This is related to:

* Parent-child synchronization
* Zombie process cleanup

---

# 56.4 `exit()`

`exit()` terminates the calling process.

```c
exit(0);
```

The argument commonly communicates an exit status.

Conventionally:

```text
0 → success
non-zero → some kind of failure/error
```

The parent can retrieve the child's exit status using `wait()`/`waitpid()`.

---

# 56.5 `open()`

`open()` opens a file and returns a **file descriptor**.

Conceptually:

```c
int fd = open("file.txt", ...);
```

If successful:

```text
fd = small integer
```

For example:

```text
3
```

because:

```text
0 → stdin
1 → stdout
2 → stderr
3 → newly opened file
```

This directly connects to your File Systems topic.

---

# 56.6 `read()`

Reads data from a file descriptor.

Conceptually:

```c
read(fd, buffer, size);
```

Flow:

```text
File/device
    ↓
Kernel
    ↓
buffer
```

The return value indicates how many bytes were read, with `0` commonly indicating EOF for regular files.

---

# 56.7 `write()`

Writes data to a file descriptor.

```c
write(fd, buffer, size);
```

Conceptually:

```text
buffer
   ↓
Kernel
   ↓
file/device
```

---

# 56.8 `close()`

Closes a file descriptor.

```c
close(fd);
```

This releases the process's reference to the open file descriptor.

---

# 56.9 `pipe()`

Creates an anonymous pipe for IPC.

```c
int fd[2];

pipe(fd);
```

Typically:

```text
fd[0] → read end
fd[1] → write end
```

Example:

```text
Parent
   |
 write()
   ↓
[ PIPE ]
   ↓
 read()
   |
Child
```

This directly connects to your IPC topic.

---

# 56.10 `dup()`

`dup()` duplicates a file descriptor.

Conceptually:

```text
fd1 ─────┐
         ↓
     same open
     file description
         ↑
fd2 ─────┘
```

The new descriptor refers to the same underlying open file description.

This means they share things such as the current file offset.

---

# 56.11 `dup2()`

`dup2(oldfd, newfd)` duplicates `oldfd` into the specified descriptor number `newfd`.

This is extremely important for **I/O redirection**.

Suppose:

```text
stdout = 1
```

You want output to go to a file instead.

Conceptually:

```text
open("output.txt")
       ↓
      fd = 3

dup2(3, 1)
       ↓

stdout (1)
       ↓
output.txt
```

Then:

```c
printf("Hello");
```

can ultimately send output to the file rather than the terminal.

This is how shell redirection is conceptually implemented:

```bash
./program > output.txt
```

The shell can arrange the child's standard output using file-descriptor duplication before executing the program.

---

# 56.12 `mmap()`

`mmap()` maps a file or other object into a process's virtual address space.

Conceptually:

```text
File
 ↓
mmap()
 ↓
Virtual memory region
 ↓
Process accesses memory addresses
```

Instead of repeatedly doing:

```text
read()
read()
read()
```

a program can access a mapped region like memory.

The OS handles the relationship between the virtual memory region and the underlying file/storage.

This connects directly to your **Paging & Virtual Memory** topic.

---

# Linux System Calls — Big Picture

You should understand how these fit together:

```text
                 Process
                    |
       +------------+-------------+
       |            |             |
     fork()       open()        mmap()
       |            |             |
    Process      File FD      Virtual Memory
       |
     exec()
       |
   New Program
       |
     wait()
       |
  Parent waits
```

And for I/O:

```text
open()
  ↓
file descriptor
  ↓
read() / write()
  ↓
kernel
  ↓
device driver
  ↓
device
```

For IPC:

```text
pipe()
  ↓
file descriptors
  ↓
read() / write()
  ↓
IPC between processes
```

For redirection:

```text
open()
  ↓
fd
  ↓
dup2()
  ↓
stdin/stdout/stderr redirected
  ↓
exec()
```

---

# Final Interview Cheat Sheet

## I/O

```text
Application
 ↓
System Call
 ↓
Kernel
 ↓
Device Driver
 ↓
Device Controller
 ↓
Device
```

**Driver = software**

**Controller = hardware**

---

## Blocking vs Non-blocking

```text
Blocking:
call → wait → continue

Non-blocking:
call → return → continue
```

---

## Interrupt vs Polling

```text
Polling:
CPU asks repeatedly

Interrupt:
Device notifies CPU
```

---

## DMA

```text
CPU configures DMA
        ↓
Device → DMA → Memory
        ↓
Completion
        ↓
Interrupt
        ↓
CPU
```

**DMA reduces CPU involvement in bulk data transfer; it does not eliminate CPU involvement entirely.**

---

## HDD

```text
Track
 ↓
Sector

Same-position tracks across platters
 ↓
Cylinder
```

Access:

```text
Seek
 ↓
Rotational latency
 ↓
Transfer
```

---

## Disk Scheduling

```text
FCFS
→ arrival order

SSTF
→ closest request

SCAN
→ elevator, go to end, reverse

C-SCAN
→ one direction, end → beginning

LOOK
→ SCAN without going to physical end

C-LOOK
→ C-SCAN without going to physical ends
```

The two relationships worth memorizing:

```text
SCAN  → LOOK
C-SCAN → C-LOOK
```

LOOK/C-LOOK avoid unnecessary travel to the physical disk boundary.

---

## Linux Process Commands

```text
ps       → process snapshot
top      → live process/system view
kill     → send signal
jobs     → shell jobs
fg       → foreground job
bg       → background job
nice     → set niceness when starting
renice   → change niceness of existing process
```

---

## Linux File Commands

```text
ls       → list
cd       → change directory
pwd      → current directory
cp       → copy
mv       → move/rename
rm       → remove
chmod    → permissions
chown    → ownership
```

Permissions:

```text
r = 4
w = 2
x = 1

755 = rwxr-xr-x
```

---

## Linux System Calls

```text
fork()   → create child process
exec()   → replace process program image
wait()   → wait for child
exit()   → terminate process

open()   → open file, get FD
read()   → read from FD
write()  → write to FD
close()  → close FD

pipe()   → create anonymous pipe
dup()    → duplicate FD
dup2()   → duplicate FD to specified FD number
mmap()   → map memory/file into virtual address space
```

### The most important interview connection

```text
fork()
   ↓
child process
   ↓
exec()
   ↓
run another program
   ↓
parent uses wait()
```

and:

```text
open()
   ↓
file descriptor
   ↓
read()/write()
   ↓
kernel
   ↓
driver
   ↓
controller
   ↓
device
```

If you understand those two flows, a large portion of practical Linux/OS interview questions becomes much easier.
