# Phase 5 — Object Relationships

These topics are about **how objects/classes relate to each other**, rather than inheritance.

---

## 1. Association

Association means **one object uses or knows about another object**.

There is no strong ownership implied.

Example: A `Teacher` teaches a `Student`.

```cpp
class Student {
public:
    string name;
};

class Teacher {
public:
    void teach(Student& s) {
        cout << "Teaching " << s.name << endl;
    }
};
```

```java
class Student {
    String name;
}

class Teacher {
    void teach(Student s) {
        System.out.println("Teaching " + s.name);
    }
}
```

The `Teacher` doesn't own the `Student`.

```text
Teacher ───────> Student
        uses
```

---

# 2. Aggregation

Aggregation is a **weak has-a relationship**.

One object contains/references another object, but the contained object can exist independently.

Example:

```text
Department ─────> Professor
```

A professor can exist even if the department is removed.

### C++

```cpp
class Professor {
public:
    string name;

    Professor(string name) : name(name) {}
};

class Department {
    Professor* professor;

public:
    Department(Professor* p) : professor(p) {}
};
```

```cpp
Professor p("John");

Department d(&p);
```

The `Professor` exists independently of `Department`.

### Java

```java
class Professor {
    String name;

    Professor(String name) {
        this.name = name;
    }
}

class Department {
    Professor professor;

    Department(Professor professor) {
        this.professor = professor;
    }
}
```

```java
Professor p = new Professor("John");
Department d = new Department(p);
```

---

# 3. Composition

Composition is a **strong has-a relationship**.

The contained object is strongly owned by the containing object.

Example:

```text
Car
 └── Engine
```

An `Engine` belongs to that particular `Car` in the model.

### C++

```cpp
class Engine {
public:
    void start() {
        cout << "Engine started\n";
    }
};

class Car {
private:
    Engine engine;

public:
    void start() {
        engine.start();
    }
};
```

The `Engine` is a member of `Car`.

When the `Car` is destroyed, its `engine` member is also destroyed.

### Java

```java
class Engine {
    void start() {
        System.out.println("Engine started");
    }
}

class Car {
    private Engine engine = new Engine();

    void start() {
        engine.start();
    }
}
```

The important idea is **ownership/lifetime**, not simply "an object was created inside another class."

---

# 4. Has-A vs Is-A Relationship

This is extremely useful when deciding whether to use **composition or inheritance**.

### Is-A → inheritance

```text
Dog IS-A Animal
```

```cpp
class Dog : public Animal {};
```

```java
class Dog extends Animal {}
```

### Has-A → composition/aggregation

```text
Car HAS-A Engine
```

```cpp
class Car {
    Engine engine;
};
```

```java
class Car {
    Engine engine = new Engine();
}
```

### Easy rule

```text
IS-A  → inheritance
HAS-A → composition/aggregation
```

In real software design, **composition is often preferred when you simply need to use another object's functionality**, rather than claiming that one type is a specialized form of another.

---

# Phase 6 — Language-Specific OOP

# 1. Static Members — C++ vs Java

`static` means the member belongs to the **class rather than each individual object**.

## C++

```cpp
class Student {
public:
    static int count;

    Student() {
        count++;
    }
};

int Student::count = 0;
```

```cpp
Student s1;
Student s2;

cout << Student::count;  // 2
```

There is one `count` shared by all `Student` objects.

---

## Java

```java
class Student {
    static int count = 0;

    Student() {
        count++;
    }
}
```

```java
Student s1 = new Student();
Student s2 = new Student();

System.out.println(Student.count);
```

Again, one shared variable.

### Static functions

Both languages allow static functions.

```cpp
Student::someFunction();
```

```java
Student.someFunction();
```

A static function cannot directly access normal instance members because it doesn't belong to a particular object.

---

# 2. `const` — C++ vs `final` — Java

These are **not exact equivalents**.

## C++ `const`

Used to make something immutable.

```cpp
const int x = 10;

// x = 20;  // ERROR
```

It can also make an object/function interaction const:

```cpp
class Student {
public:
    void display() const {
        cout << "Student\n";
    }
};
```

The `const` after the function means the function promises not to modify the object's state.

C++ also has const references and pointers, which makes `const` much broader than Java's `final`.

---

## Java `final`

A final variable cannot be reassigned.

```java
final int x = 10;

// x = 20;  // ERROR
```

A final method cannot be overridden:

```java
class Animal {
    final void sound() {
        System.out.println("Sound");
    }
}
```

A final class cannot be inherited:

```java
final class Animal {
}
```

### Key difference

```text
C++ const → primarily prevents modification
Java final → prevents reassignment / overriding / inheritance depending on usage
```

---

# 3. `friend` — C++

`friend` is a C++ feature that allows another function or class to access private/protected members.

```cpp
class Box {
private:
    int value = 10;

    friend void show(Box b);
};

void show(Box b) {
    cout << b.value << endl;
}
```

Normally `show()` cannot access `value`, but because it's declared `friend`, it can.

### Friend class

```cpp
class A {
private:
    int x = 10;

    friend class B;
};

class B {
public:
    void show(A a) {
        cout << a.x;
    }
};
```

Java has **no direct equivalent of `friend`**.

---

# 4. `final`, `finally`, `finalize` — Java

These three are completely different.

### `final`

Used for restrictions:

```java
final int x = 10;
```

```text
variable → cannot reassign
method   → cannot override
class    → cannot extend
```

### `finally`

Used with exception handling.

```java
try {
    int x = 10 / 0;
}
catch (Exception e) {
    System.out.println("Error");
}
finally {
    System.out.println("This runs");
}
```

`finally` is commonly used for cleanup logic, though modern Java often prefers try-with-resources for closeable resources.

### `finalize()`

Historically associated with garbage collection:

```java
protected void finalize() {
    // old cleanup mechanism
}
```

**Important:** `finalize()` is deprecated and should not be used in modern Java.

For a fresher, remember:

```text
final    → restriction
finally  → exception cleanup block
finalize → old GC-related mechanism; avoid it
```

---

# 5. Nested Classes

A class can be declared inside another class.

### C++

```cpp
class Outer {
public:
    class Inner {
    public:
        void show() {
            cout << "Inner\n";
        }
    };
};
```

Usage:

```cpp
Outer::Inner obj;
obj.show();
```

### Java

```java
class Outer {

    class Inner {
        void show() {
            System.out.println("Inner");
        }
    }
}
```

A Java non-static inner class is associated with an instance of the outer class.

```java
Outer outer = new Outer();
Outer.Inner inner = outer.new Inner();
```

Java also supports **static nested classes**:

```java
class Outer {

    static class Inner {
        void show() {
            System.out.println("Inner");
        }
    }
}
```

Then:

```java
Outer.Inner obj = new Outer.Inner();
```

This distinction is worth knowing.

---

# 6. Object Creation and Memory Management — C++ vs Java

This is a major difference.

## C++

Objects can be created on the stack:

```cpp
Student s;
```

or dynamically:

```cpp
Student* s = new Student();
```

Dynamic object:

```cpp
delete s;
```

You are responsible for managing the lifetime when using raw `new`/`delete`.

Modern C++ generally prefers **RAII and smart pointers** rather than manually managing raw ownership.

---

## Java

Objects are normally created using:

```java
Student s = new Student();
```

The object is managed by the **Garbage Collector**.

You don't write:

```java
delete s;
```

Instead, when the object is no longer reachable, it can eventually be reclaimed by the GC.

### Simplified mental model

```text
C++
 ├── stack objects
 ├── dynamically allocated objects
 └── programmer/RAII-managed lifetime

Java
 ├── references
 ├── objects managed by JVM
 └── garbage collection
```

---

# 7. Copy Constructor — C++

A copy constructor creates an object from another object of the same class.

```cpp
class Student {
public:
    string name;

    Student(string name) : name(name) {}

    Student(const Student& other) {
        name = other.name;
    }
};
```

Usage:

```cpp
Student s1("John");

Student s2 = s1;
```

This invokes the copy constructor.

C++ also generates a copy constructor automatically if you don't define one, subject to the language's rules.

---

# 8. Copy Assignment — C++

Copy constructor and copy assignment are different.

### Copy constructor

Creates a **new object**:

```cpp
Student s2 = s1;
```

### Copy assignment

Copies into an **already existing object**:

```cpp
Student s2("Mike");

s2 = s1;
```

You can define the assignment operator:

```cpp
Student& operator=(const Student& other) {
    name = other.name;
    return *this;
}
```

### Remember

```text
Student s2 = s1;
       ↓
Copy constructor

Student s2;
s2 = s1;
       ↓
Copy assignment
```

This distinction is very important in C++.

---

# 9. Shallow Copy vs Deep Copy

This becomes important when a class owns dynamically allocated memory.

Consider:

```cpp
class Student {
public:
    int* marks;

    Student(int value) {
        marks = new int(value);
    }
};
```

If a normal copy simply copies:

```text
marks pointer
```

then both objects can point to the **same memory**.

That's a shallow copy.

```text
s1 ──────┐
         ↓
       [100]
         ↑
s2 ──────┘
```

Changing one can affect the other.

### Deep copy

Deep copy creates a separate memory allocation:

```text
s1 ──────> [100]

s2 ──────> [100]
```

Example:

```cpp
Student(const Student& other) {
    marks = new int(*other.marks);
}
```

Now each object owns its own integer.

### Why it matters

In C++, if your class manually owns resources, you need to understand:

```text
copy constructor
copy assignment
destructor
```

This leads to the **Rule of Three**:

> If a class needs a custom destructor, copy constructor, or copy assignment operator, it often needs all three.

Modern C++ extends this into the **Rule of Five** with move operations, which you should learn later when studying modern C++ resource management.

---

# 10. Garbage Collection — Java

Java uses automatic garbage collection.

Example:

```java
Student s = new Student();

s = null;
```

The object may now be unreachable.

Eventually the JVM's Garbage Collector can reclaim its memory.

Important:

```text
s = null
```

does **not** mean:

> "Destroy this object immediately."

It only means the reference `s` no longer points to it.

Also, you generally should not rely on GC for timely cleanup of external resources such as files or sockets.

---

# 11. Smart Pointers — C++

Smart pointers help manage dynamically allocated objects automatically.

The three you should know are:

```text
unique_ptr
shared_ptr
weak_ptr
```

### `unique_ptr`

One owner.

```cpp
unique_ptr<Student> s = make_unique<Student>();
```

When `s` goes out of scope, the object is automatically destroyed.

```text
unique_ptr
    ↓
 Student
```

No manual:

```cpp
delete
```

---

### `shared_ptr`

Multiple owners.

```cpp
shared_ptr<Student> s1 = make_shared<Student>();
shared_ptr<Student> s2 = s1;
```

Both refer to the same object.

The object is destroyed when the last owning `shared_ptr` is gone.

---

### `weak_ptr`

A non-owning reference to an object managed by `shared_ptr`.

It's particularly useful for avoiding ownership cycles.

For fresher-level C++, know:

```text
unique_ptr → one owner
shared_ptr → multiple owners
weak_ptr   → non-owning observer
```

---

# Phase 7 — Exception Handling

Exception handling deals with **unexpected/error situations during program execution**.

Examples:

```text
division by zero
file cannot be opened
invalid input
network failure
object/resource failure
```

Instead of allowing the program to fail unpredictably, we can handle the error.

---

# 1. Exceptions and Exception Handling

Basic idea:

```text
Normal execution
       ↓
Something goes wrong
       ↓
Exception thrown
       ↓
Exception caught
       ↓
Handle the error
```

Both C++ and Java use:

```text
try
catch
throw
```

---

# 2. `try`, `catch`, `throw`

## C++

```cpp
try {
    int age = -1;

    if (age < 0)
        throw runtime_error("Invalid age");
}
catch (const exception& e) {
    cout << e.what();
}
```

`throw` raises an exception.

`catch` handles it.

---

## Java

```java
try {
    int age = -1;

    if (age < 0)
        throw new Exception("Invalid age");
}
catch (Exception e) {
    System.out.println(e.getMessage());
}
```

The overall structure is similar.

---

# 3. Multiple Catch Blocks

You can handle different exception types differently.

### C++

```cpp
try {
    // code
}
catch (const invalid_argument& e) {
    cout << "Invalid argument\n";
}
catch (const runtime_error& e) {
    cout << "Runtime error\n";
}
catch (const exception& e) {
    cout << "Other exception\n";
}
```

Specific exceptions should generally be caught before their base exception.

---

### Java

```java
try {
    // code
}
catch (ArithmeticException e) {
    System.out.println("Arithmetic error");
}
catch (NullPointerException e) {
    System.out.println("Null pointer");
}
catch (Exception e) {
    System.out.println("Other exception");
}
```

Same general idea.

---

# 4. Custom Exceptions

You can create your own exception type.

## C++

```cpp
class InvalidAge : public exception {
public:
    const char* what() const noexcept override {
        return "Age is invalid";
    }
};
```

Then:

```cpp
throw InvalidAge();
```

Catch it:

```cpp
catch (const InvalidAge& e) {
    cout << e.what();
}
```

---

## Java

Usually extend `Exception` or another appropriate exception class:

```java
class InvalidAgeException extends Exception {

    InvalidAgeException(String message) {
        super(message);
    }
}
```

Then:

```java
throw new InvalidAgeException("Age is invalid");
```

And:

```java
catch (InvalidAgeException e) {
    System.out.println(e.getMessage());
}
```

---

# 5. Exception Handling — C++ vs Java

The syntax looks similar:

### C++

```cpp
try {
    throw runtime_error("Error");
}
catch (const exception& e) {
    cout << e.what();
}
```

### Java

```java
try {
    throw new Exception("Error");
}
catch (Exception e) {
    System.out.println(e.getMessage());
}
```

But the exception systems differ.

### C++

C++ has exception classes such as:

```text
std::exception
 ├── runtime_error
 ├── logic_error
 └── ...
```

You can also throw many types, although throwing standard exception types or appropriate custom exception types is generally preferable.

### Java

Java has a structured exception hierarchy:

```text
Throwable
├── Error
└── Exception
    ├── RuntimeException
    └── Other checked exceptions
```

This leads to one of Java's most important exception concepts:

**checked vs unchecked exceptions.**

---

# 6. Checked vs Unchecked Exceptions — Java

This is a **Java-specific concept**.

## Checked exceptions

The compiler requires you to **handle or declare** them.

Example:

```java
void readFile() throws IOException {
    // ...
}
```

You could handle it:

```java
try {
    readFile();
}
catch (IOException e) {
    System.out.println("File error");
}
```

Or declare:

```java
void myFunction() throws IOException {
    readFile();
}
```

Common examples:

```text
IOException
SQLException
FileNotFoundException
```

---

## Unchecked exceptions

These are generally subclasses of `RuntimeException`.

Examples:

```text
NullPointerException
ArithmeticException
ArrayIndexOutOfBoundsException
IllegalArgumentException
```

Example:

```java
int x = 10 / 0;
```

This causes:

```text
ArithmeticException
```

You don't have to explicitly declare:

```java
throws ArithmeticException
```

---

# Important C++ vs Java Exception Difference

Java:

```text
Checked exceptions
    ↓
compiler forces handling/declaring
```

C++:

```text
No Java-style checked exceptions
```

C++ does have exception specifications such as `noexcept`, but they serve a different purpose:

```cpp
void func() noexcept {
}
```

This means the function promises not to throw exceptions.

---

# What You Should Be Able to Explain After These Phases

By the end of Phase 7, you should comfortably be able to answer questions like:

```text
What is the difference between inheritance and composition?

What is the difference between IS-A and HAS-A?

What is static in C++ and Java?

What is the difference between const and final?

What is a copy constructor?

Copy constructor vs copy assignment?

Shallow copy vs deep copy?

Why do we need smart pointers?

unique_ptr vs shared_ptr vs weak_ptr?

What is runtime polymorphism?

Why does C++ need virtual?

Why doesn't Java need virtual?

What is an abstract class?

What is a pure virtual function?

What is a Java interface?

Why does Java use interfaces for multiple capabilities?

What is an exception?

Checked vs unchecked exception?

How does exception handling differ between C++ and Java?
```

Those are the **core OOP topics I'd consider important for a fresher**. You don't need to go much beyond these before moving into practical OOP design and interview-style problems.
