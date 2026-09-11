# Phase 8 — Segmentation

Study this after paging, not before.

---

# 29. Segmentation

## 29.1 What is Segmentation?

**Segmentation** is a memory-management technique that supports the user's view of memory. 

Instead of dividing the memory into fixed-size pages (like paging), segmentation divides memory into **variable-size segments** based on logical divisions of the program.

A program isn't just a giant contiguous block of bytes to a programmer. It is a collection of logical entities:
* Main program
* Functions
* Local variables (Stack)
* Global variables
* Dynamically allocated memory (Heap)

Segmentation allocates memory such that each of these logical entities gets its own segment.

---

## 29.2 Segment

A **segment** is a variable-sized block of logical memory. 

Each segment has:
* A name or **segment number**
* A **length** (or limit)

---

## 29.3 Logical Address in Segmentation

In segmentation, a logical address consists of two parts:

```text
Logical Address = <Segment Number, Offset>
```

* **Segment Number (s):** Identifies which segment is being accessed.
* **Offset (d):** The specific byte within that segment.

For example, if the compiler puts the Stack in Segment 2, an address might be:
> "Segment 2, Byte 500"

---

## 29.4 Segment Table

Just like paging uses a page table, segmentation uses a **segment table** to map two-dimensional user-defined addresses into one-dimensional physical addresses.

Each entry in the segment table has two parts:
1. **Base:** The starting physical address where the segment resides in memory.
2. **Limit:** The length of the segment.

### Translation Process:

```text
Logical Address: (s, d)
        ↓
Look up segment 's' in Segment Table
        ↓
Is 'd' < Limit?
        ↓
    YES: Physical Address = Base + d
    NO:  Trap (Addressing Error / Segmentation Fault)
```

The hardware checks the offset against the limit to ensure the process doesn't access memory outside of that specific segment. This provides memory protection.

---

## 29.5 Paging vs Segmentation

This is a **classic interview question**.

| Feature | Paging | Segmentation |
| :--- | :--- | :--- |
| **Division** | Fixed-size blocks (Pages/Frames) | Variable-size logical blocks (Segments) |
| **Perspective** | Hardware/OS view | User/Programmer view |
| **Fragmentation** | Causes **Internal Fragmentation** | Causes **External Fragmentation** |
| **Table** | Page Table (Frame Number) | Segment Table (Base + Limit) |
| **Address** | Page Number + Offset | Segment Number + Offset |

---

## 29.6 Advantages & Disadvantages

### Advantages:
1. **No Internal Fragmentation:** Segments are exactly the size they need to be.
2. **Logical Grouping:** Easier to manage protection and sharing (e.g., a "read-only" code segment can be shared among processes).

### Disadvantages:
1. **External Fragmentation:** Variable-sized segments leave variable-sized holes in physical memory.
2. **Complex Allocation:** Finding a free contiguous block of memory for a new segment requires algorithms like First-Fit or Best-Fit, which have overhead.

---

# 30. Segmentation with Paging

## 30.1 Basic Idea

Pure segmentation suffers from severe external fragmentation. Pure paging ignores the logical structure of a program. 

Can we combine the best of both worlds? Yes: **Paged Segmentation**.

The idea is:
> **Divide the logical address space into segments, and then divide each segment into fixed-size pages.**

## 30.2 Why Combine Them?

* **From Segmentation:** We get the user's view of memory, easy sharing, and logical protection.
* **From Paging:** We eliminate external fragmentation because the segments are backed by fixed-size frames in physical memory.

## 30.3 x86-Style Conceptual Understanding

In older x86 architectures (like the Intel 80386), memory management worked in two stages:

```text
Logical Address
      ↓ (Segmentation Unit)
Linear Address
      ↓ (Paging Unit)
Physical Address
```

1. **Segmentation Unit:** Takes a logical address (Segment Selector + Offset) and translates it into a continuous 32-bit linear address.
2. **Paging Unit:** Takes that linear address, divides it into pages, and translates it into the final physical address in RAM.

*Note: For modern fresher interviews, you usually don't need to go extremely deep into hardware-specific segmentation. Modern 64-bit OS architectures (x86-64) have largely flattened or bypassed the segmentation step in favor of pure paging.*
