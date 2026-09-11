# Phase 13 — Disk Scheduling

Disk scheduling is primarily associated with **HDDs**, where physical head movement makes access order important.

For SSDs, traditional seek/rotational scheduling is much less important because SSDs have no mechanical read/write head.

---

# 47. Disk Basics

## 47.1 HDD Basics

A traditional HDD contains rotating magnetic platters.

Simplified:

```text
        Spindle
           |
     ┌───────────┐
     │  Platter  │
     └───────────┘
       ↑     ↑
      Track  Track
```

A read/write head moves over the platter to access data.

The important physical concepts are:

* Track
* Sector
* Cylinder
* Seek time
* Rotational latency
* Transfer time

---

# 47.2 Track

A **track** is a circular path on the disk platter where data can be stored.

Think of a platter as having concentric circles:

```text
       ___________
     /             \
    /   Track       \
   |   _________     |
   |  /         \    |
   | |  Track    |   |
   |  \_________/    |
    \               /
     \_____________/
```

Each circle is a track.

---

# 47.3 Sector

A **sector** is a subdivision of a track.

Imagine a pizza:

```text
       \ | /
        \|/
     ----+----
        /|\
       / | \
```

The track is the circular ring.

The sector is a portion of that ring.

Historically, a sector often stores a fixed amount of data, commonly 512 bytes; modern disks may use 4096-byte physical sectors.

For interview purposes:

> **Track = circular ring; sector = subdivision of a track.**

---

# 47.4 Cylinder

A **cylinder** consists of tracks at the same radial position across multiple platters/surfaces.

Imagine:

```text
Platter 1:  Track 20
Platter 2:  Track 20
Platter 3:  Track 20
```

Together, these corresponding tracks form a **cylinder**.

The term is mainly relevant to traditional HDD geometry.

---

# 47.5 Seek Time

**Seek time** is the time required to move the disk's read/write head to the desired track.

Example:

```text
Current head position = Track 20
Requested track       = Track 80

Head moves:
20 → 80
```

That movement contributes to seek time.

In disk scheduling problems, **head movement** is usually represented by:

```text
|current position - requested position|
```

and total head movement is the sum of these distances.

---

# 47.6 Rotational Latency

Once the head reaches the correct track, the desired sector may not currently be under the head.

The platter must rotate.

The waiting time for the desired sector to rotate under the head is **rotational latency**.

```text
Seek
 ↓
Correct track
 ↓
Wait for platter rotation
 ↓
Desired sector arrives
```

Average rotational latency is approximately half a rotation, assuming requests are uniformly distributed.

If rotational speed is:

```text
7200 RPM
```

Then:

```text
Rotations per second = 7200 / 60 = 120 rotations/sec
```

Time for one rotation:

```text
1 / 120 = 0.00833 sec
≈ 8.33 ms
```

Average rotational latency:

```text
8.33 / 2
≈ 4.17 ms
```

---

# 47.7 Transfer Time

**Transfer time** is the time required to actually transfer the requested data once the head is positioned and the desired sector is available.

So disk access time can be thought of approximately as:

```text
Disk access time
≈
Seek time
+
Rotational latency
+
Transfer time
+
Other overhead
```

For traditional HDDs, seek and rotational latency can be major contributors.

---

# 47.8 The Three Important Times

Remember:

```text
Seek time
    ↓
Move head to correct track

Rotational latency
    ↓
Wait for correct sector to rotate under head

Transfer time
    ↓
Actually read/write the data
```

---

# 48. Disk Scheduling Algorithms

Suppose:

```text
Request queue:
98, 183, 37, 122, 14, 124, 65, 67

Initial head:
53
```

Disk scheduling determines **the order in which these requests are serviced**.

The main goal is usually to reduce head movement and therefore improve performance.

---

# 48.1 FCFS — First Come First Serve

Requests are served in the order they arrive.

Queue:

```text
98 → 183 → 37 → 122 → 14 → 124 → 65 → 67
```

Starting at:

```text
53
```

Movement:

```text
53 → 98 → 183 → 37 → 122 → 14 → 124 → 65 → 67
```

Calculate:

```text
|53 - 98|   = 45
|98 - 183|  = 85
|183 - 37|  = 146
|37 - 122|  = 85
|122 - 14|  = 108
|14 - 124|  = 110
|124 - 65|  = 59
|65 - 67|   = 2
```

Total:

```text
45 + 85 + 146 + 85 + 108 + 110 + 59 + 2
= 640 cylinders
```

### Advantages

* Very simple
* Fair
* No starvation

### Disadvantage

Can cause very large unnecessary head movement.

---

# 48.2 SSTF — Shortest Seek Time First

**SSTF = Shortest Seek Time First.**

At every step, choose the request closest to the current head position.

Queue:

```text
98, 183, 37, 122, 14, 124, 65, 67
```

Start:

```text
53
```

Distances:

```text
98 → 45
183 → 130
37 → 16
122 → 69
14 → 39
124 → 71
65 → 12
67 → 14
```

Closest = **65**.

Then:

```text
53 → 65
```

Remaining requests:

```text
98, 183, 37, 122, 14, 124, 67
```

From 65:

```text
67 → 2
```

So:

```text
65 → 67
```

From 67:

```text
98 → 31
37 → 30
```

Choose 37.

Then continue choosing the closest request each time.

The important point is not this particular final number but the algorithm:

> **At every step, choose the pending request with minimum distance from the current head.**

### Advantage

Usually produces lower average seek time than FCFS.

### Disadvantage

Can cause **starvation**.

Imagine requests continuously arrive near the current head:

```text
50, 51, 52, 53, 54, ...
```

A request far away may keep getting ignored.

---

# 48.3 SCAN

SCAN is commonly called the **elevator algorithm**.

The head moves in one direction, servicing requests along the way.

When it reaches the end of the disk, it reverses direction.

Imagine an elevator:

```text
0 ------------------------ 199
              ↑
            Head
```

Suppose direction is increasing.

It services:

```text
65 → 67 → 98 → 122 → 124 → 183
```

continues toward the end:

```text
183 → 199
```

then reverses:

```text
199 → ...
```

and services requests on the other side.

### Key idea

```text
Move →
service requests
reach end
reverse ←
service requests
```

### Advantage

* More predictable than SSTF
* Reduces starvation
* Good overall fairness

### Important numerical point

In classical SCAN problems, the head usually goes all the way to the physical disk end before reversing.

So if disk range is:

```text
0 to 199
```

and direction is upward, you may need to include:

```text
199
```

even if there is no request at 199.

---

# 48.4 C-SCAN

**C-SCAN = Circular SCAN.**

Instead of servicing requests in both directions, the head services requests in **one direction only**.

Example:

```text
0 ------------------------ 199
              →
```

It services requests while moving right.

When it reaches the end:

```text
199
 ↓
jump to 0
```

Then it continues moving right again.

Conceptually:

```text
→ → → → → → → → → 
                      ↓
                      0
→ → → → → → → → →
```

The return from the end to the beginning does not service requests during the return.

### Advantage

Provides more uniform waiting time than SCAN.

### Numerical point

For classical C-SCAN, include:

```text
disk end
+
jump to disk beginning
```

when calculating head movement.

---

# 48.5 LOOK

LOOK is similar to SCAN but **does not go all the way to the physical end of the disk unless there is a request there**.

Suppose the highest request in the current direction is:

```text
183
```

Instead of:

```text
... → 183 → 199 → reverse
```

LOOK does:

```text
... → 183 → reverse
```

So:

> **SCAN goes to the end. LOOK goes only as far as the last request in that direction.**

This avoids unnecessary movement.

---

# 48.6 C-LOOK

C-LOOK is the circular version of LOOK.

The head moves in one direction and services requests.

When it reaches the last request in that direction, it jumps to the first request on the other side.

Example:

```text
14 ... 67 ... 183
             ↑
           highest request
```

After servicing 183:

```text
183
 ↓
jump to
14
 ↓
continue →
```

Unlike C-SCAN, C-LOOK doesn't need to travel to the physical disk boundary.

---

# 48.7 Disk Scheduling Comparison

| Algorithm | Basic idea                                  | Reaches physical end? | Starvation |
| --------- | ------------------------------------------- | --------------------: | ---------- |
| FCFS      | Arrival order                               |       Not necessarily | No         |
| SSTF      | Closest request                             |                    No | Possible   |
| SCAN      | Elevator, both directions                   |                   Yes | Low        |
| C-SCAN    | One direction, circular                     |                   Yes | Low        |
| LOOK      | SCAN but stops at last request              |                    No | Low        |
| C-LOOK    | C-SCAN but jumps between last/first request |                    No | Low        |

---

# 48.8 SCAN vs LOOK

Very commonly asked.

### SCAN

```text
Requests → physical end → reverse
```

### LOOK

```text
Requests → last request → reverse
```

So:

> **LOOK avoids unnecessary movement to the physical disk boundary.**

---

# 48.9 C-SCAN vs C-LOOK

### C-SCAN

```text
Service →
reach physical end
jump to beginning
service →
```

### C-LOOK

```text
Service →
reach last request
jump to first request
service →
```

Therefore:

> **C-LOOK is to C-SCAN what LOOK is to SCAN.**

That's an excellent interview statement.

---

# 48.10 How to Solve Disk Scheduling Numericals

This is important.

Given:

```text
Queue:
98, 183, 37, 122, 14, 124, 65, 67

Initial head:
53
```

Always do these steps.

### Step 1 — Write the current head

```text
53
```

### Step 2 — Determine the algorithm

For example:

```text
SSTF
```

### Step 3 — Determine direction if required

For:

* SCAN
* C-SCAN
* LOOK
* C-LOOK

you must know whether the head initially moves:

```text
LEFT
```

or

```text
RIGHT
```

If the question doesn't specify direction, the problem may expect you to state your assumption.

### Step 4 — Write the service order

Example for FCFS:

```text
53 → 98 → 183 → 37 → ...
```

### Step 5 — Calculate each movement

```text
|53 - 98|
|98 - 183|
|183 - 37|
...
```

### Step 6 — Add everything

```text
Total head movement
=
sum of all movements
```

---

# Phase 13 — One Very Important Interview Distinction

Don't confuse these:

### Seek time

```text
Head moves to correct TRACK
```

### Rotational latency

```text
Wait for correct SECTOR
```

### Transfer time

```text
Actually transfer DATA
```

So:

```text
Request
  ↓
Seek
  ↓
Correct track
  ↓
Rotational latency
  ↓
Correct sector
  ↓
Transfer data
```
