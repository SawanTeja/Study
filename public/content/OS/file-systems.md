# Phase 11 — File Systems

Now we're moving from **process communication** to how the OS manages persistent data.

---

# 39. File System Fundamentals

## 39.1 What is a File?

A **file** is a named collection of data stored by the operating system.

Examples:

```text
program.exe
photo.jpg
notes.txt
database.db
```

From an OS perspective, a file is associated with:

* Data
* Metadata
* Name
* Permissions
* Ownership
* Storage information

---

# 39.2 Directory

A **directory** organizes files and other directories.

Conceptually:

```text
/home/user/
    |
    +-- notes.txt
    +-- photo.jpg
    +-- projects/
          |
          +-- app.cpp
```

A directory maps names to filesystem objects.

On Unix-like systems, directories themselves are filesystem objects.

---

# 39.3 File Metadata

**Metadata** is information about the file rather than the file's actual contents.

Typical metadata includes:

* File type
* Size
* Owner
* Group
* Permissions
* Timestamps
* Link count
* Location/block mapping information

Linux filesystems store much of this information in an **inode**.

---

# 39.4 File Attributes

Common file attributes:

```text
Name
Type
Size
Owner
Group
Permissions
Creation/change/access/modify timestamps
```

The exact timestamps available and their semantics depend on the filesystem/OS.

For Linux interviews, know:

* Owner
* Group
* Permissions
* Size
* Timestamps
* Inode number

---

# 39.5 File Operations

Common OS file operations:

### Create

```text
create()
```

### Open

```text
open()
```

### Read

```text
read()
```

### Write

```text
write()
```

### Seek

Move the current file offset:

```text
lseek()
```

### Close

```text
close()
```

### Delete

Typically:

```text
unlink()
```

### Rename

Typically:

```text
rename()
```

At the system-call level, these operations allow programs to interact with files through the OS.

---

# 39.6 File Descriptor

A **file descriptor (FD)** is a small integer used by a process to refer to an open file or other I/O object.

Example:

```c
int fd = open("test.txt", O_RDONLY);
```

Suppose:

```text
fd = 3
```

Then:

```text
read(fd, buffer, 100);
```

uses descriptor 3.

### Important Linux concept

A file descriptor is **not the file itself**.

It is a process-local handle referring to an open file description maintained by the kernel.

Conceptually:

```text
Process
+-----------------------+
| File Descriptor Table |
|                       |
| 0 → stdin             |
| 1 → stdout            |
| 2 → stderr            |
| 3 → open file         |
+-----------------------+
              |
              v
      Kernel open-file data
              |
              v
       Filesystem object
```

---

# Standard File Descriptors

On Unix/Linux:

```text
0 → stdin
1 → stdout
2 → stderr
```

This is extremely common in interviews.

---

# 39.7 File Table / Open File Table

The OS maintains kernel data structures describing open files.

Conceptually:

```text
Process A FD table
       |
       +---- FD 3 ----+
                     |
                     v
              Open File Description
              - file offset
              - status flags
                     |
                     v
                  Inode
```

The exact internal structures differ by OS, but the conceptual distinction is important.

An **open file description** can contain things such as:

* Current file offset
* File status flags

The inode represents filesystem metadata and block mapping.

---

# 39.8 Inode

An **inode** is a filesystem data structure used by Unix-like filesystems to store metadata about a file and information needed to locate its data.

Typically an inode contains:

* File type
* Permissions
* Owner UID
* Group GID
* File size
* Timestamps
* Link count
* Pointers/references to data blocks

### Critical point

> **The filename is generally not stored inside the inode.**

The directory stores the relationship:

```text
filename → inode number
```

Then:

```text
inode → metadata + file data block references
```

Conceptually:

```text
Directory

"hello.txt" ─────→ inode 42
                         |
                         v
                    +---------+
                    | inode 42|
                    | metadata|
                    | pointers|
                    +---------+
                         |
                         v
                     Data blocks
```

This is extremely important for hard links.

---

# 40. File Allocation

File allocation determines:

> **How the blocks belonging to a file are organized on storage.**

The classical approaches are:

1. Contiguous allocation
2. Linked allocation
3. Indexed allocation

---

# 40.1 Contiguous Allocation

All blocks of a file are stored next to each other.

Example:

```text
File A:

[10][11][12][13][14]
```

The file needs:

```text
Starting block = 10
Length = 5 blocks
```

So the OS can locate the entire file easily.

---

## Advantages

### Fast sequential access

Blocks are physically/logically adjacent.

### Fast random access

If block size is known:

```text
Block n
= starting block + n
```

So random access is easy.

### Good locality

Sequential reads are efficient.

---

## Disadvantages

### External fragmentation

Free space can become scattered:

```text
[Free][A][Free][B][Free][C][Free]
```

A new large file may not fit even though total free space is sufficient.

### File growth problem

Suppose:

```text
File A = blocks 10–14
```

and it needs another block.

If block 15 is occupied:

```text
10 11 12 13 14 [X]
```

the file cannot simply extend there.

It may need to move to another contiguous region.

---

# 40.2 Linked Allocation

A file is a linked list of blocks.

The blocks can be anywhere on disk.

Example:

```text
[10] → [25] → [7] → [19]
```

Each block contains a pointer to the next block.

---

## Advantages

### No external fragmentation for file allocation

Blocks don't need to be contiguous.

### Easy file growth

A new block can be allocated anywhere.

---

## Disadvantages

### Poor random access

To reach block 4:

```text
First block
   ↓
Second
   ↓
Third
   ↓
Fourth
```

You may need to follow the chain.

Therefore:

> Linked allocation is good for sequential access but poor for random access.

### Pointer overhead

Each block needs space for a pointer.

### Reliability concern

If a pointer is corrupted, part of the chain can become inaccessible.

---

# 40.3 Indexed Allocation

An index block contains pointers to the file's data blocks.

Example:

```text
Index block
+----+----+----+----+
| 10 | 25 | 7  | 19 |
+----+----+----+----+
   |    |    |    |
   v    v    v    v
  10   25    7   19
```

The index block stores references to all the data blocks.

---

## Advantages

### Supports direct/random access

You can find the pointer to a desired data block through the index.

### No requirement for contiguous blocks

Blocks can be anywhere.

### Easy growth

Additional blocks can be allocated as needed, subject to index capacity.

---

## Disadvantages

### Index block overhead

You need extra storage for the index.

### Large files may need multiple levels/index structures

A single index block may not have enough pointers.

---

# Allocation Comparison

| Feature                      | Contiguous | Linked            | Indexed        |
| ---------------------------- | ---------- | ----------------- | -------------- |
| Blocks contiguous?           | Yes        | No                | No             |
| Sequential access            | Excellent  | Good              | Good           |
| Random access                | Excellent  | Poor              | Good           |
| External fragmentation       | Yes        | No                | No             |
| File growth                  | Difficult  | Easy              | Easy           |
| Extra pointer/index overhead | Low        | Pointer per block | Index block(s) |

### Interview shortcut

```text
Contiguous → fastest, but fragmentation/growth problems

Linked → easy growth, sequential access, poor random access

Indexed → supports random access without requiring contiguous blocks
```

---

# 41. Directory Structures

## 41.1 Single-Level Directory

All files are in one directory.

```text
Root
 |
 +-- A
 +-- B
 +-- C
```

### Advantages

Very simple.

### Problems

Filename conflicts:

```text
Alice wants:
report.txt

Bob wants:
report.txt
```

They cannot both use the same filename.

Also poor organization for large systems.

---

# 41.2 Two-Level Directory

Each user gets a separate directory.

```text
Root
 |
 +-- Alice
 |     +-- report.txt
 |
 +-- Bob
       +-- report.txt
```

Now both users can have:

```text
report.txt
```

without conflict.

### Advantage

Better isolation and avoids filename conflicts between users.

### Limitation

Still limited compared with hierarchical organization.

---

# 41.3 Tree-Structured Directory

Directories can contain subdirectories.

```text
/
├── home
│   ├── alice
│   │   ├── docs
│   │   └── projects
│   └── bob
│       └── docs
├── etc
└── var
```

This is the common model in modern operating systems.

### Advantages

* Hierarchical organization
* Good scalability
* Efficient grouping
* Natural pathnames

Example:

```text
/home/alice/projects/app/main.cpp
```

---

# 41.4 Acyclic Graph Directory

Allows shared files/directories through links while preventing cycles.

Conceptually:

```text
        Project A
          |
          v
      shared.txt
          ^
          |
        Project B
```

Both directories can refer to the same object.

The structure is a **DAG — Directed Acyclic Graph**.

### Why prevent cycles?

Without cycle prevention:

```text
A → B → C → A
```

directory traversal could become infinite.

Hard links in Unix filesystems are restricted in ways that help preserve this property for directories.

---

# 42. Inodes

This is particularly important for Linux interviews.

## 42.1 What Does an Inode Store?

An inode typically stores:

```text
File type
Permissions
Owner
Group
Size
Timestamps
Link count
Data block references
```

It does **not normally store the filename**.

---

# 42.2 Filename vs Inode

This relationship is critical:

```text
Directory entry

filename
   |
   v
inode number
   |
   v
inode
   |
   v
data blocks
```

For example:

```text
"hello.txt" → inode 100
```

inode 100 might contain:

```text
Owner = user
Permissions = rw-r--r--
Size = 500 bytes
Links = 1
Data blocks = ...
```

---

# 42.3 Data Block Pointers

The inode needs to tell the filesystem where the file's contents are stored.

Historically, Unix inode designs often used:

```text
Direct pointers
Single indirect pointer
Double indirect pointer
Triple indirect pointer
```

Conceptually:

```text
                 inode
                   |
        +----------+----------+
        |          |          |
      direct     indirect   double
        |           |          |
        v           v          v
     data block   index      index
                  block      blocks
```

### Direct pointer

Points directly to a data block.

### Single indirect

Points to a block containing pointers to data blocks.

### Double indirect

Points to a block containing pointers to blocks that point to data blocks.

### Triple indirect

Adds another level.

The exact inode layout depends on the filesystem, but this classical structure is important for OS interviews.

---

# 42.4 Link Count

The inode contains a **link count** representing the number of directory entries referring to that inode through hard links.

Example:

```text
file1 → inode 100
file2 → inode 100
```

Then:

```text
link count = 2
```

Both names refer to the same underlying file.

---

# 43. Hard Link vs Soft Link

This is one of the most common Linux interview questions.

---

# 43.1 Hard Link

A hard link is another directory entry referring to the **same inode**.

Suppose:

```text
original.txt
```

has:

```text
inode = 100
```

Create a hard link:

```text
ln original.txt hard.txt
```

Now:

```text
original.txt ──┐
               ├──→ inode 100 → data
hard.txt ──────┘
```

Both names refer to exactly the same underlying inode/data.

---

# 43.2 What Happens If Original File Is Deleted?

Suppose:

```text
original.txt → inode 100
hard.txt     → inode 100
```

Delete:

```text
original.txt
```

The inode still exists because:

```text
hard.txt → inode 100
```

still refers to it.

Therefore:

> The data remains accessible through `hard.txt`.

This is a very common interview question.

---

# 43.3 Soft Link / Symbolic Link

A symbolic link is a separate filesystem object that stores a **path to another file**.

Example:

```text
original.txt
     ^
     |
     |
symlink.txt
```

Conceptually:

```text
symlink.txt
     |
     | contains path
     v
"original.txt"
```

It has its **own inode**.

---

# 43.4 What Happens If Original File Is Deleted?

Suppose:

```text
original.txt
symlink.txt → "original.txt"
```

Delete:

```text
original.txt
```

The symbolic link still exists, but its target no longer exists.

Therefore:

> The symlink becomes a **dangling/broken symbolic link**.

---

# Hard Link vs Soft Link

| Feature                              | Hard Link                                                   | Soft/Symbolic Link           |
| ------------------------------------ | ----------------------------------------------------------- | ---------------------------- |
| Refers to                            | Same inode                                                  | Path to target               |
| Own inode?                           | No separate inode for the linked file name                  | Yes                          |
| Original deleted                     | Still works                                                 | Becomes dangling             |
| Can cross filesystems?               | Generally no                                                | Yes                          |
| Can point to directory?              | Generally prohibited for ordinary users / modern Unix tools | Yes                          |
| Target must exist when link created? | Yes, because it references an existing inode                | Generally no                 |
| Inode relationship                   | Same inode                                                  | Different inode              |
| Link to another link                 | Same inode relationship; not path-based                     | Can point to another symlink |

---

# 43.5 Why Can't Hard Links Normally Cross Filesystems?

An inode belongs to a particular filesystem.

A hard link works by creating another directory entry pointing to the same inode.

If two filesystems are separate:

```text
Filesystem A
inode 100

Filesystem B
???
```

Filesystem B cannot simply create a directory entry pointing to an inode belonging to filesystem A.

Therefore:

> **Hard links generally cannot cross filesystem boundaries.**

Symbolic links don't have this limitation because they store a pathname.

---

# 43.6 Why Are Hard Links Usually Not Allowed for Directories?

Allowing arbitrary hard links to directories could create directory cycles:

```text
A
 ↓
B
 ↓
C
 ↓
A
```

That complicates:

* Directory traversal
* Reference counting
* Deletion
* Filesystem consistency

Therefore Unix-like systems generally restrict hard links to directories.

---

# 43.7 Hard Link and Inode — The Key Idea

Memorize this diagram:

```text
             +----------------+
             |     inode 42   |
             |   metadata     |
             | data pointers  |
             +----------------+
                ↑          ↑
                |          |
          file1 |          | file2
                |          |
             directory entries
```

Both:

```text
file1
file2
```

are just different names for the same inode.

---

# 43.8 Soft Link — Key Idea

```text
symlink
   |
   v
separate inode
   |
   v
contains path
   |
   v
target file
```

So:

```text
Hard link:
name ─────────→ same inode

Soft link:
name ─→ symlink inode ─→ pathname ─→ target
```

---

# Final Interview Cheat Sheet

## IPC

```text
IPC = communication between processes
```

### Shared Memory

```text
Fast
Same machine
Shared region
Needs synchronization
```

### Message Passing

```text
send / receive
No direct shared memory
Usually more overhead
```

### Pipe

```text
Byte stream
Usually local
Anonymous pipe → commonly related processes
```

### Named Pipe

```text
FIFO
Has a name
Unrelated local processes can use it
```

### Message Queue

```text
Kernel-managed
Structured messages
Can queue multiple messages
```

### Signal

```text
Event/notification
Not for bulk data
```

### Socket

```text
Communication endpoint
Local or network
```

---

# File System

### File Descriptor

```text
Process-local integer handle
```

```text
0 → stdin
1 → stdout
2 → stderr
```

### Inode

Stores:

```text
Metadata
+
Data block references
```

Does **not normally store filename**.

Relationship:

```text
Directory:
filename → inode

Inode:
metadata + data pointers
```

---

# File Allocation

```text
Contiguous
→ fast random access
→ external fragmentation
→ difficult growth

Linked
→ easy growth
→ good sequential access
→ poor random access

Indexed
→ random access
→ no contiguous requirement
→ index overhead
```

---

# Links

### Hard link

```text
two names → same inode
```

Delete one name:

```text
other name still works
```

### Soft link

```text
symlink → path → target
```

Delete target:

```text
symlink becomes dangling
```

### Restrictions on hard links

Generally:

```text
Cannot cross filesystems
Directories generally cannot be hard-linked by ordinary users
```

---

## The 5 diagrams you should be able to draw in an interview

**1. Shared memory**

```text
Process A ──┐
            ├── Shared Memory
Process B ──┘
```

**2. Pipe**

```text
Process A → Pipe → Process B
```

**3. Message queue**

```text
Process A → [ M1 | M2 | M3 ] → Process B
```

**4. Inode**

```text
filename → inode → data blocks
```

**5. Hard vs soft link**

```text
Hard:
file1 ──┐
        ├──→ inode → data
file2 ──┘

Soft:
link → inode → "path/to/file" → target
```

These relationships are much more important for interviews than memorizing isolated definitions.
