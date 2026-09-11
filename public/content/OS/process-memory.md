# Phase 9 — Process Memory / Address Space

This is particularly important for C/C++ interviews.

---

# 31. Process Address Space

When a program is loaded into memory to become a process, the OS allocates a virtual address space for it. The layout is typically organized into distinct segments.

### Typical Memory Layout

```text
High Address
+----------------+
| Stack          |
| ↓              |
|                |
|                |
| ↑              |
| Heap           |
+----------------+
| BSS            |
+----------------+
| Data           |
+----------------+
| Text / Code    |
+----------------+
Low Address
```

## 31.1 Segments Breakdown

### Text / Code Segment
* Contains the compiled machine instructions of the program.
* Usually marked as **read-only** to prevent the program from accidentally modifying its own instructions.
* Shareable among multiple instances of the same program.

### Data Segment
* Contains **initialized** global and static variables.
* Example: `int count = 5;`

### BSS Segment
* Stands for "Block Started by Symbol" (historical name).
* Contains **uninitialized** global and static variables.
* The OS guarantees these are initialized to zero before execution starts.
* Example: `int count;` (implicitly `0`).

### Heap
* Used for **dynamic memory allocation** at runtime (e.g., `malloc()`, `new`).
* Grows "upward" toward higher memory addresses.

### Stack
* Used for function call management, local variables, and control flow.
* Grows "downward" toward lower memory addresses.

---

# 32. Stack vs Heap

Understanding the difference between Stack and Heap is a **guaranteed interview question**.

## 32.1 What is stored where?

| Feature | Stack | Heap |
| :--- | :--- | :--- |
| **Variables** | Local variables, function arguments, return addresses | Dynamically allocated variables |
| **Allocation** | Automatic (managed by compiler/OS) | Manual (programmer must request and free) |
| **Speed** | Very fast (simple pointer movement) | Slower (requires OS to find free block) |
| **Size Limit** | Fixed/Limited (e.g., 1MB to 8MB typically) | Very large (limited by physical RAM + Swap) |
| **Growth** | Grows downward (high to low address) | Grows upward (low to high address) |

## 32.2 Examples

### Local Variables (Stack)
```c
void foo() {
    int x = 10; // Allocated on the Stack
}
```
When `foo()` returns, `x` is automatically destroyed.

### Global / Static Variables (Data/BSS)
```c
int global_var = 5; // Data Segment
static int static_var; // BSS Segment
```
They live for the entire lifetime of the program.

### Dynamic Allocation (Heap)
```c
void foo() {
    int* ptr = (int*)malloc(sizeof(int)); // Allocated on the Heap
    *ptr = 10;
    free(ptr); // Must be manually freed
}
```

## 32.3 Issues

### Stack Overflow
Occurs when the stack pointer exceeds the stack bound.
**Common causes:**
* Infinite or exceedingly deep recursion.
* Allocating massive local arrays (e.g., `int large_array[1000000];`).

### Heap Fragmentation
Because the heap allocates and frees blocks of variable sizes dynamically, it suffers from **external fragmentation** over time, making it hard to find large contiguous blocks.

---

# 33. Memory Allocation

These concepts overlap heavily with C/C++, but are very useful OS interview knowledge.

## 33.1 C Standard Library Functions

### `malloc()`
* Allocates a specified number of bytes on the heap.
* The allocated memory is **uninitialized** (contains garbage values).
```c
int* ptr = (int*)malloc(10 * sizeof(int));
```

### `calloc()`
* Allocates memory for an array of elements.
* **Initializes all bytes to zero.**
```c
int* ptr = (int*)calloc(10, sizeof(int));
```

### `realloc()`
* Resizes a previously allocated memory block.
* If the new size is larger, it might copy the old data to a new, larger location and free the old one.
```c
ptr = (int*)realloc(ptr, 20 * sizeof(int));
```

### `free()`
* Deallocates memory previously allocated by malloc/calloc/realloc.
```c
free(ptr);
```

## 33.2 C++ Operators

### `new` / `new[]`
* Allocates memory and **calls the constructor**.

### `delete` / `delete[]`
* **Calls the destructor** and deallocates memory.

---

## 33.3 Common Memory Errors (Interview Traps)

### Memory Leak
Failing to free dynamically allocated memory before the program loses the pointer to it.
```c
void leak() {
    int* ptr = (int*)malloc(sizeof(int));
    // Function ends, ptr goes out of scope, but memory isn't freed.
}
```

### Dangling Pointer
A pointer that points to memory that has already been freed.
```c
int* ptr = (int*)malloc(sizeof(int));
free(ptr);
// ptr is now a dangling pointer
*ptr = 5; // Undefined behavior
```

### Double Free
Attempting to free the same memory location twice.
```c
int* ptr = (int*)malloc(sizeof(int));
free(ptr);
free(ptr); // Crash / Undefined behavior
```

### Use-After-Free
Dereferencing a pointer after its memory has been deallocated. (Similar to dangling pointer). Can lead to security vulnerabilities.
