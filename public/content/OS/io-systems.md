# Phase 12 — I/O Systems

I/O (Input/Output) is how the CPU and operating system interact with devices such as disks, keyboards, network cards, displays, USB devices, etc.

For interviews, the important thing is understanding **who talks to whom and how data moves**.

---

# 44. I/O Basics

## 44.1 What is I/O?

**I/O = Input/Output.**

An I/O operation is any operation where the computer exchanges data with something outside the CPU's immediate execution state.

Examples:

* Reading a file from disk
* Writing a file to disk
* Receiving network data
* Sending network data
* Reading keyboard input
* Writing to a display
* Reading from a USB device

A simplified architecture:

```text
Application
     ↓
System Call
     ↓
Operating System / Kernel
     ↓
Device Driver
     ↓
Device Controller
     ↓
I/O Device
```

For output:

```text
Application
     ↓
Kernel
     ↓
Driver
     ↓
Controller
     ↓
Device
```

For input, the data travels in the opposite direction.

---

# 44.2 I/O Devices

An **I/O device** is hardware that communicates with the computer.

Examples:

* HDD / SSD
* Keyboard
* Mouse
* Network card
* Printer
* Monitor
* USB device

Different devices behave differently.

For example:

### Keyboard

```text
Keyboard → CPU/Memory
```

The keyboard generates input that the OS needs to process.

### Disk

```text
Disk → Memory
```

when reading data.

### Network card

```text
Network → Network Card → Memory
```

when receiving network packets.

---

# 44.3 Device Controller

The CPU usually does **not directly control the physical hardware**.

Instead, a **device controller** acts as an intermediary between the CPU/memory system and the device.

```text
CPU
 ↓
Device Controller
 ↓
Device
```

The controller contains hardware registers/buffers and control logic that allow the OS to communicate with the device.

For example:

```text
CPU
 ↓
Disk Controller
 ↓
Disk
```

The OS can tell the controller things like:

* What operation to perform
* Which device location to access
* Where data should go
* Start the operation

The controller then handles the device-specific hardware operation.

### Interview point

**Device controller = hardware component that controls/coordinates a particular I/O device and provides an interface for the CPU/OS to communicate with it.**

---

# 44.4 Device Driver

A **device driver** is software that allows the operating system to communicate with a particular type of hardware.

```text
OS / Kernel
     ↓
Device Driver
     ↓
Device Controller
     ↓
Device
```

The driver hides hardware-specific details from the rest of the OS.

For example, the OS may say:

```text
"Read these blocks from the disk."
```

The disk driver translates that request into the commands/register operations required by that particular controller/device.

### Controller vs Driver

This is a common interview question.

| Device Controller                | Device Driver                 |
| -------------------------------- | ----------------------------- |
| Hardware                         | Software                      |
| Controls device                  | Communicates with controller  |
| Contains registers/control logic | Contains device-specific code |
| Part of hardware architecture    | Part of OS/kernel software    |

Easy way to remember:

```text
Driver = software
Controller = hardware
```

---

# 44.5 Kernel Interaction

Applications generally don't directly access hardware.

For example:

```c
read(fd, buffer, 100);
```

The application makes a **system call**.

Conceptually:

```text
Application
    |
    | read()
    ↓
Kernel
    |
    ↓
File system / I/O subsystem
    |
    ↓
Device Driver
    |
    ↓
Controller
    |
    ↓
Device
```

The kernel provides:

* Protection
* Device abstraction
* Scheduling
* Buffering
* Error handling
* Resource management

This prevents arbitrary applications from directly manipulating hardware.

---

# 44.6 Blocking I/O

In **blocking I/O**, the calling process/thread waits until the I/O operation can make progress or completes, depending on the API/device semantics.

Example:

```c
read(fd, buffer, 100);
```

Suppose the requested data isn't available yet.

The process may enter a waiting state:

```text
Running
   ↓
Waiting for I/O
   ↓
I/O completes
   ↓
Runnable
   ↓
Running
```

The CPU can execute other processes while this process waits.

### Important

Blocking does **not** mean the CPU is necessarily sitting idle.

It means:

> The calling thread/process is blocked waiting for the I/O condition.

---

# 44.7 Non-Blocking I/O

In **non-blocking I/O**, the operation returns without waiting indefinitely for the requested I/O to become available.

For example, if data isn't available:

```text
read()
   ↓
No data available
   ↓
Return immediately
```

The application can continue doing other work.

Conceptually:

```text
Application
   ↓
read()
   ↓
Data unavailable
   ↓
Return immediately
   ↓
Continue execution
```

### Blocking vs Non-blocking

| Blocking                      | Non-blocking                                    |
| ----------------------------- | ----------------------------------------------- |
| May wait                      | Returns without waiting for availability        |
| Simpler programming model     | Useful for event-driven programs                |
| Calling thread may sleep      | Calling thread continues                        |
| Common in simple applications | Common in high-concurrency/event-driven systems |

### Important interview distinction

**Blocking I/O is about whether the calling thread waits.**

It does not mean:

> "The entire operating system stops."

---

# 45. Interrupts

## 45.1 What is an Interrupt?

An **interrupt** is a mechanism that causes the CPU to temporarily stop its current execution and handle an event that requires attention.

Basic idea:

```text
CPU executing program
        ↓
     Interrupt
        ↓
Save execution state
        ↓
Run interrupt handler
        ↓
Restore state
        ↓
Continue program
```

Example:

```text
CPU executing Process A

        ↓

Keyboard generates interrupt

        ↓

CPU handles keyboard event

        ↓

CPU resumes previous execution
```

Interrupts allow hardware to notify the CPU when something needs attention.

---

# 45.2 Why are Interrupts Needed?

Imagine the CPU repeatedly checking whether a disk operation has completed:

```text
Is disk done?
Is disk done?
Is disk done?
Is disk done?
Is disk done?
...
```

This wastes CPU time.

Instead:

```text
CPU starts disk operation
        ↓
CPU does other work
        ↓
Disk finishes
        ↓
Disk/controller generates interrupt
        ↓
CPU handles it
```

This is much more efficient.

---

# 45.3 Hardware Interrupt

A **hardware interrupt** is generated by hardware.

Examples:

* Keyboard input
* Mouse input
* Network packet arrival
* Disk I/O completion
* Timer interrupt

Example:

```text
Disk
 ↓
I/O completed
 ↓
Interrupt
 ↓
CPU
```

The CPU can then execute the appropriate interrupt handler.

---

# 45.4 Software Interrupt

A **software interrupt** is generated by software/instructions rather than an external hardware device.

Historically, operating systems used software interrupt instructions for things such as system calls.

Conceptually:

```text
Application
    ↓
System call instruction
    ↓
CPU enters kernel
    ↓
Kernel handles request
```

Modern systems often use dedicated system-call instructions rather than the older general software-interrupt mechanism, but the interview-level concept remains important.

### Don't confuse:

```text
Hardware interrupt
    → generated by hardware

Software interrupt
    → generated by software/instruction
```

---

# 45.5 Interrupt Handler

An **interrupt handler** is the kernel code that responds to a particular interrupt.

Example:

```text
Network card
     ↓
Interrupt
     ↓
Kernel interrupt handler
     ↓
Process received packet
```

The handler determines what needs to be done in response to the event.

---

# 45.6 Interrupt Service Routine (ISR)

**ISR = Interrupt Service Routine.**

It is the routine executed by the CPU/kernel in response to an interrupt.

For interview purposes:

> Interrupt handler and ISR are often used almost interchangeably.

A simplified flow:

```text
Interrupt occurs
      ↓
CPU identifies interrupt
      ↓
Save necessary CPU state
      ↓
Run ISR / interrupt handler
      ↓
Handle event
      ↓
Restore state
      ↓
Resume execution
```

---

# 45.7 Interrupt vs Polling

This is a very common interview question.

## Polling

CPU repeatedly checks the device:

```text
CPU
 ↓
Check device
 ↓
Ready?
 ├── No → Check again
 └── Yes → Handle
```

Example:

```text
while (!device_ready()) {
    // keep checking
}

read_device();
```

The CPU actively asks:

> "Are you ready yet?"

---

## Interrupt

The CPU doesn't continuously check.

```text
CPU
 ↓
Do other work

Device becomes ready
 ↓
Interrupt
 ↓
CPU handles event
```

The device effectively says:

> "I'm ready now."

---

## Comparison

| Polling                                     | Interrupt                                      |
| ------------------------------------------- | ---------------------------------------------- |
| CPU repeatedly checks                       | Device notifies CPU                            |
| Can waste CPU cycles                        | Generally more efficient for infrequent events |
| Simple                                      | More complex                                   |
| CPU actively waits/checks                   | CPU can do other work                          |
| Useful when events are frequent/predictable | Useful for asynchronous/infrequent events      |

### Important nuance

Interrupts aren't automatically better in every situation.

If events happen extremely frequently, interrupt overhead can become significant. Systems may use techniques such as batching or polling in appropriate contexts.

For a fresher interview, remember:

> **Polling = CPU asks. Interrupt = device notifies.**

---

# 46. DMA — Direct Memory Access

## 46.1 What is DMA?

**DMA = Direct Memory Access.**

DMA allows an I/O device/controller to transfer data directly between the device and main memory **without requiring the CPU to copy every byte/word itself**.

Basic flow:

```text
Device
   ↓
DMA Controller
   ↓
Memory
```

The CPU is still involved in **setting up** the transfer, but it doesn't have to manually move every piece of data.

---

# 46.2 Why is DMA Needed?

Without DMA, consider receiving a large file from a disk.

A simplified programmed-I/O approach could be:

```text
Device
   ↓
CPU
   ↓
Memory
```

The CPU participates heavily in moving the data.

For large transfers, this wastes CPU time.

With DMA:

```text
Device
   ↓
DMA Controller
   ↓
Memory
```

The DMA hardware performs the bulk transfer.

The CPU can perform other work.

---

# 46.3 DMA Controller

A **DMA controller** is hardware responsible for managing DMA transfers.

The CPU typically configures it with information such as:

* Source/device
* Destination memory address
* Amount of data
* Direction of transfer
* Control information

Then the DMA controller performs the transfer.

---

# 46.4 CPU Involvement in DMA

A common misconception is:

> "DMA means CPU has nothing to do with the transfer."

That's incorrect.

The CPU usually:

### 1. Sets up DMA

```text
CPU
 ↓
Configure DMA controller
```

For example:

```text
Source = device
Destination = memory address X
Size = 4 MB
Direction = device → memory
```

### 2. DMA performs transfer

```text
Device
   ↓
DMA Controller
   ↓
Memory
```

### 3. DMA signals completion

Typically, the DMA/controller can generate an interrupt:

```text
Device
   ↓
DMA
   ↓
Memory
   ↓
Transfer complete
   ↓
Interrupt
   ↓
CPU
```

So:

> CPU sets up the transfer → DMA performs bulk transfer → CPU is notified when appropriate.

---

# 46.5 DMA vs Programmed I/O

## Programmed I/O

CPU is heavily involved in transferring data.

```text
Device
   ↓
CPU
   ↓
Memory
```

Conceptually:

```text
CPU reads device data
CPU writes data to memory
CPU repeats...
```

CPU spends significant time handling the transfer.

---

## DMA

```text
Device
   ↓
DMA Controller
   ↓
Memory
```

CPU:

```text
Setup DMA
   ↓
Do other work
   ↓
Receive completion interrupt
```

### Comparison

| Programmed I/O                     | DMA                                  |
| ---------------------------------- | ------------------------------------ |
| CPU heavily involved               | CPU mainly sets up transfer          |
| More CPU overhead                  | Lower CPU overhead for bulk transfer |
| CPU moves data                     | DMA hardware moves data              |
| Simple concept                     | More hardware/control complexity     |
| Less efficient for large transfers | Efficient for large transfers        |

---

# 46.6 DMA Example

Suppose a network card receives a 1 MB packet buffer.

Without DMA:

```text
Network Card
     ↓
CPU
     ↓
Memory
```

CPU participates heavily in moving the data.

With DMA:

```text
Network Card
     ↓
DMA Controller
     ↓
Memory
```

The CPU might do:

```text
1. Allocate/configure buffer
2. Configure DMA
3. Continue executing other work
4. Receive interrupt
5. Process received data
```

This is the key idea you need for interviews.

---

# DMA — Complete Flow

This is worth memorizing conceptually:

```text
                CPU
                 |
          Configure DMA
                 |
                 ↓
        +----------------+
        | DMA Controller |
        +----------------+
             ↙       ↘
         Device      Memory
             \       /
              \     /
             Data Transfer
                 |
                 ↓
          Transfer Complete
                 |
              Interrupt
                 |
                 ↓
                CPU
```

The most important sequence:

```text
CPU sets up DMA
       ↓
DMA transfers data
       ↓
CPU does other work
       ↓
DMA completes
       ↓
Interrupt
       ↓
CPU handles completion
```

---

# Phase 12 — Interview Questions You Should Be Able to Answer

### Q1. What is the difference between a device driver and device controller?

**Driver is software; controller is hardware.**

```text
OS
 ↓
Driver       ← software
 ↓
Controller   ← hardware
 ↓
Device
```

---

### Q2. What is blocking I/O?

I/O where the calling thread/process waits until the required I/O condition allows the operation to proceed.

---

### Q3. What is non-blocking I/O?

The I/O call returns without waiting indefinitely for the operation to become ready.

---

### Q4. Why are interrupts useful?

They allow devices to notify the CPU when attention is needed instead of requiring the CPU to continuously poll the device.

---

### Q5. Interrupt vs polling?

```text
Polling:
CPU → "Are you ready?"

Interrupt:
Device → "I'm ready."
```

---

### Q6. Does DMA completely eliminate CPU involvement?

**No.**

CPU generally configures DMA and handles completion/related processing. DMA eliminates the need for the CPU to manually perform the bulk data movement.

---

### Q7. Why is DMA faster/more efficient?

Because the CPU doesn't need to execute instructions for every individual data transfer. DMA hardware handles the bulk movement directly between the device and memory.
