# Phase 8 — Generics & Templates

This phase is about writing **reusable code that works with different data types** without rewriting the same logic.

The main difference is:

```text
C++  → Templates
Java → Generics
```

---

# 1. Function Templates — C++

Suppose you want a function that returns the larger of two values.

Without templates:

```cpp
int maxValue(int a, int b) {
    return a > b ? a : b;
}

double maxValue(double a, double b) {
    return a > b ? a : b;
}
```

We're writing essentially the same logic twice.

A template lets us write it once.

```cpp
template <typename T>
T maxValue(T a, T b) {
    return a > b ? a : b;
}
```

Now:

```cpp
cout << maxValue(10, 20) << endl;

cout << maxValue(2.5, 1.5) << endl;
```

The compiler generates the appropriate version for the types being used.

### Mental model

```text
                maxValue()
                    │
             ┌──────┴──────┐
             │             │
          int,int      double,double
             │             │
             ▼             ▼
         int version   double version
```

`T` is a **placeholder for a type**.

You can also explicitly specify it:

```cpp
maxValue<int>(10, 20);
```

### `typename` vs `class`

You will commonly see both:

```cpp
template <typename T>
```

and:

```cpp
template <class T>
```

For basic type-template declarations, they are generally interchangeable.

---

# 2. Class Templates — C++

Templates aren't limited to functions.

You can make an entire class generic.

```cpp
template <typename T>
class Box {
private:
    T value;

public:
    Box(T value) : value(value) {}

    T getValue() {
        return value;
    }
};
```

Now:

```cpp
Box<int> a(10);

Box<string> b("Hello");

Box<double> c(3.14);
```

Conceptually:

```text
                  Box<T>
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
    Box<int>    Box<string>   Box<double>
       │            │            │
      10          "Hello"       3.14
```

This is extremely useful for data structures.

For example, you can conceptually create:

```cpp
Stack<int>
Stack<string>
Stack<double>
```

using the same implementation.

---

# 3. Generics — Java

Java provides **generics**, which serve a similar purpose.

Example:

```java
class Box<T> {
    private T value;

    Box(T value) {
        this.value = value;
    }

    T getValue() {
        return value;
    }
}
```

Now:

```java
Box<Integer> a = new Box<>(10);

Box<String> b = new Box<>("Hello");

Box<Double> c = new Box<>(3.14);
```

The diagram is similar:

```text
                  Box<T>
                    │
       ┌────────────┼────────────┐
       │            │            │
       ▼            ▼            ▼
  Box<Integer>  Box<String>  Box<Double>
       │            │            │
      10          "Hello"       3.14
```

---

## Why `Integer` instead of `int`?

Java generics work with **reference types**, not primitive types.

So this is invalid:

```java
Box<int> box;
```

Instead:

```java
Box<Integer> box;
```

Java provides wrapper classes:

```text
int     → Integer
double  → Double
boolean → Boolean
char    → Character
long    → Long
```

Java's **autoboxing** makes this convenient:

```java
Box<Integer> box = new Box<>(10);
```

The `10` can be automatically boxed into an `Integer`.

---

# 4. Template vs Generic

They solve a similar problem but work differently.

| | C++ Templates | Java Generics |
|---|---|---|
| Language | C++ | Java |
| Syntax | `template <typename T>` | `<T>` |
| Main purpose | Generic/reusable code | Generic/reusable code |
| Primitive types | Yes | No, use wrappers |
| Compile-time type checking | Yes | Yes |
| Template specialization | Yes | No equivalent in the same C++ sense |
| Runtime type erasure | No general Java-style erasure | Usually type erasure |
| Can generate specialized code for types | Yes | Different model |

### Important conceptual difference

C++ templates are heavily tied to **compile-time code generation/type instantiation**.

Java generics are largely implemented through **type erasure**.

For fresher interviews, remember:

```text
C++
Template
   ↓
Compiler instantiates/generates appropriate code

Java
Generic
   ↓
Compile-time type safety
   ↓
Type information is generally erased from ordinary generic types at runtime
```

---

# 5. Generic/Template Classes

This is essentially putting the previous concepts together.

### C++

```cpp
template <typename T>
class Pair {
private:
    T first;
    T second;

public:
    Pair(T first, T second)
        : first(first), second(second) {}

    void display() {
        cout << first << " " << second << endl;
    }
};
```

Usage:

```cpp
Pair<int> p1(10, 20);

Pair<string> p2("Hello", "World");
```

### Java

```java
class Pair<T> {
    private T first;
    private T second;

    Pair(T first, T second) {
        this.first = first;
        this.second = second;
    }

    void display() {
        System.out.println(first + " " + second);
    }
}
```

Usage:

```java
Pair<Integer> p1 = new Pair<>(10, 20);

Pair<String> p2 = new Pair<>("Hello", "World");
```

---

# Phase 9 — OOP Design Basics

This phase is less about language syntax and more about **how to design classes properly**.

---

# 1. Coupling and Cohesion

These two concepts are extremely important for understanding good software design.

## Coupling

Coupling describes **how dependent one class is on another**.

### High coupling

```text
Class A
  │
  ├────────> Class B
  │
  ├────────> Class C
  │
  └────────> Class D
```

If `B`, `C`, or `D` changes, `A` may need many changes.

That's high coupling.

### Low coupling

```text
Class A ─────> Interface
                  ↑
             ┌────┴────┐
             B          C
```

`A` depends on an abstraction rather than a specific implementation.

Generally, you want **lower coupling**.

---

## Cohesion

Cohesion describes **how closely related the responsibilities inside one class are**.

### Low cohesion

```text
UserManager
 ├── login()
 ├── calculateTax()
 ├── sendEmail()
 ├── resizeImage()
 └── saveToDatabase()
```

The class is doing unrelated things.

### Higher cohesion

```text
User
 ├── name
 ├── email
 └── changeEmail()

EmailService
 ├── sendEmail()
 └── validateEmail()

TaxCalculator
 └── calculateTax()
```

Each class has a more focused responsibility.

### Remember

```text
Good OOP generally aims for:

Low Coupling
     +
High Cohesion
```

---

# 2. SOLID Principles

SOLID is a set of five design principles.

```text
S → Single Responsibility Principle
O → Open/Closed Principle
L → Liskov Substitution Principle
I → Interface Segregation Principle
D → Dependency Inversion Principle
```

These are important for interviews, but don't treat them as five definitions to memorize. Understand the problem each solves.

---

## S — Single Responsibility Principle

> A class should have one primary responsibility.

Bad:

```text
Employee
 ├── employee information
 ├── calculate salary
 ├── generate PDF report
 └── send email
```

Better:

```text
Employee
    │
    └── employee data

SalaryCalculator
    │
    └── calculate salary

ReportGenerator
    │
    └── generate report

EmailService
    │
    └── send email
```

### Example

Instead of:

```java
class Employee {
    void calculateSalary() {}
    void generateReport() {}
    void sendEmail() {}
}
```

use:

```java
class Employee {
    String name;
}

class SalaryCalculator {
    double calculate(Employee e) {
        // ...
        return 0;
    }
}

class ReportGenerator {
    void generate(Employee e) {
        // ...
    }
}
```

The exact number of classes isn't the goal. The goal is **separating distinct responsibilities when that improves the design**.

---

# O — Open/Closed Principle

> Software entities should be open for extension but closed for modification.

Suppose:

```text
Payment
 ├── Credit Card
 ├── UPI
 └── PayPal
```

A poor design might have:

```java
class Payment {
    void pay(String type) {
        if (type.equals("card")) {
            // ...
        }
        else if (type.equals("upi")) {
            // ...
        }
        else if (type.equals("paypal")) {
            // ...
        }
    }
}
```

Every new payment type requires modifying the existing class.

A polymorphic design:

```java
interface Payment {
    void pay();
}
```

```java
class CardPayment implements Payment {
    public void pay() {
        System.out.println("Card payment");
    }
}
```

```java
class UpiPayment implements Payment {
    public void pay() {
        System.out.println("UPI payment");
    }
}
```

Now:

```text
              Payment
                 │
       ┌─────────┼─────────┐
       ↓         ↓         ↓
     Card       UPI      PayPal
```

You can add another implementation without changing the existing implementations.

---

# L — Liskov Substitution Principle

This one is often confusing.

The basic idea:

> If `B` is a subtype of `A`, code expecting `A` should be able to use `B` without breaking the expected behavior.

Classic example:

```text
Bird
 ├── Sparrow
 └── Penguin
```

If `Bird` has:

```java
void fly()
```

then `Penguin extends Bird` becomes problematic because penguins don't fly.

```text
Bird
  ↓
Penguin
  ↓
fly() ??? 
```

A better model might be:

```text
Bird
 ├── Sparrow
 └── Penguin

FlyingBird
 ├── Sparrow
 └── Eagle
```

Or use a capability interface:

```java
interface Flyable {
    void fly();
}
```

```text
Bird
 ├── Penguin
 └── Sparrow ─── implements Flyable
```

The important lesson:

**Don't create inheritance relationships that violate the expected behavior of the parent type.**

---

# I — Interface Segregation Principle

> Clients should not be forced to depend on methods they don't need.

Bad interface:

```java
interface Worker {
    void work();
    void eat();
}
```

Suppose a robot is a worker:

```java
class Robot implements Worker {

    public void work() {
        System.out.println("Working");
    }

    public void eat() {
        // Robot doesn't eat!
    }
}
```

The interface is too broad.

Better:

```java
interface Workable {
    void work();
}

interface Eatable {
    void eat();
}
```

Now:

```text
Human
 ├── Workable
 └── Eatable

Robot
 └── Workable
```

Each class implements only what it actually needs.

---

# D — Dependency Inversion Principle

This is one of the most useful SOLID principles.

> High-level code should depend on abstractions, not concrete implementations.

Bad:

```java
class EmailService {
    void send() {
        System.out.println("Email");
    }
}

class Notification {
    private EmailService service = new EmailService();
}
```

`Notification` is tightly coupled to `EmailService`.

Better:

```java
interface MessageService {
    void send();
}
```

```java
class EmailService implements MessageService {
    public void send() {
        System.out.println("Email");
    }
}
```

```java
class Notification {
    private MessageService service;

    Notification(MessageService service) {
        this.service = service;
    }

    void notifyUser() {
        service.send();
    }
}
```

Now:

```text
                  MessageService
                   /          \
                  /            \
          EmailService      SMSService
                  \            /
                   \          /
                    Notification
```

`Notification` doesn't care whether the message is sent through email or SMS.

This leads directly into **Dependency Injection**.

---

# 3. Composition Over Inheritance

This principle says:

> Prefer combining objects when appropriate instead of creating deep inheritance hierarchies.

### Inheritance

```text
Vehicle
   ↓
Car
   ↓
SportsCar
   ↓
ElectricSportsCar
```

Deep hierarchies can become difficult to maintain.

### Composition

```text
Car
 ├── Engine
 ├── Transmission
 ├── GPS
 └── Battery
```

Each component has its own responsibility.

For example:

```java
class Car {
    private Engine engine;
    private GPS gps;

    Car(Engine engine, GPS gps) {
        this.engine = engine;
        this.gps = gps;
    }
}
```

Instead of:

```text
Car
 ↓
ElectricCar
 ↓
FastElectricCar
 ↓
SelfDrivingFastElectricCar
```

you can compose capabilities:

```text
Car
 ├── Engine
 ├── Navigation
 ├── AutonomousDriving
 └── PerformanceSystem
```

### Important

This does **not** mean:

> "Never use inheritance."

Use inheritance when there is a genuine **IS-A** relationship and polymorphism makes sense.

Use composition when you are primarily **combining functionality/objects**.

---

# 4. Dependency Injection Basics

Dependency Injection means:

> Instead of a class creating its dependencies itself, the dependency is provided to it.

### Without DI

```java
class Car {
    private Engine engine = new Engine();
}
```

`Car` decides exactly which `Engine` to create.

### With DI

```java
class Car {
    private Engine engine;

    Car(Engine engine) {
        this.engine = engine;
    }
}
```

Now:

```java
Engine engine = new Engine();

Car car = new Car(engine);
```

Diagram:

```text
        creates
Application
    │
    ├──────────> Engine
    │
    └──────────> Car
                    │
                    └── uses Engine
```

The `Car` receives its dependency.

---

## Constructor Injection

This is the simplest form to understand:

```java
class Car {
    private Engine engine;

    Car(Engine engine) {
        this.engine = engine;
    }
}
```

```java
Engine engine = new Engine();
Car car = new Car(engine);
```

For fresher interviews, **understand constructor injection first**.

---

# 5. Common OOP Design Patterns — Basics

Don't try to memorize dozens of design patterns at this stage.

For a fresher, understand what a few common patterns are trying to solve.

---

## Singleton

Ensures a class has a single shared instance.

Conceptually:

```text
Application
     │
     ▼
  Singleton
     │
     └── one instance
```

Java example:

```java
class Singleton {

    private static Singleton instance;

    private Singleton() {}

    public static Singleton getInstance() {
        if (instance == null) {
            instance = new Singleton();
        }

        return instance;
    }
}
```

Usage:

```java
Singleton a = Singleton.getInstance();
Singleton b = Singleton.getInstance();

System.out.println(a == b);  // true
```

Know the concept, but don't blindly use Singleton everywhere. It introduces global shared state and can make testing/design harder.

---

# Factory Pattern

Factory centralizes object creation.

Instead of:

```java
new Dog();
new Cat();
new Dog();
new Cat();
```

you can have:

```java
Animal animal = AnimalFactory.create("dog");
```

Diagram:

```text
             Factory
                │
        ┌───────┴───────┐
        ↓               ↓
       Dog             Cat
```

Example:

```java
interface Animal {
    void sound();
}
```

```java
class AnimalFactory {

    static Animal create(String type) {
        if (type.equals("dog"))
            return new Dog();

        if (type.equals("cat"))
            return new Cat();

        throw new IllegalArgumentException("Unknown type");
    }
}
```

The caller doesn't need to know the exact construction process.

---

# Strategy Pattern

Strategy allows you to switch between different algorithms/behaviors.

Example:

```text
Payment
   │
   ├── CardStrategy
   ├── UpiStrategy
   └── PayPalStrategy
```

```java
interface PaymentStrategy {
    void pay();
}
```

```java
class CardPayment implements PaymentStrategy {
    public void pay() {
        System.out.println("Pay using card");
    }
}
```

```java
class UpiPayment implements PaymentStrategy {
    public void pay() {
        System.out.println("Pay using UPI");
    }
}
```

Then:

```java
class Checkout {
    private PaymentStrategy strategy;

    Checkout(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    void pay() {
        strategy.pay();
    }
}
```

Now:

```java
Checkout checkout =
    new Checkout(new UpiPayment());

checkout.pay();
```

This is a very practical example of:

```text
Composition
+
Interfaces
+
Polymorphism
+
Dependency Injection
```

---

# Observer Pattern

Used when one object needs to notify multiple objects when something changes.

Example:

```text
                 YouTube Channel
                       │
              new video uploaded
                       │
            ┌──────────┼──────────┐
            ↓          ↓          ↓
        Subscriber  Subscriber  Subscriber
```

Basic idea:

```java
interface Observer {
    void update();
}
```

The channel maintains observers and notifies them when an event occurs.

You don't need to memorize a full implementation yet. Understand the **problem and relationship**.

---

# 6. UML Class Diagrams

UML diagrams are a visual way to represent classes and their relationships.

A basic class:

```text
┌──────────────────────────┐
│         Student          │
├──────────────────────────┤
│ - name : String          │
│ - age : int              │
├──────────────────────────┤
│ + study() : void         │
│ + getAge() : int         │
└──────────────────────────┘
```

The three sections are:

```text
┌──────────────┐
│ Class Name   │
├──────────────┤
│ Attributes   │
├──────────────┤
│ Methods      │
└──────────────┘
```

Common visibility symbols:

```text
+  public
-  private
#  protected
~  package/default
```

---

## Inheritance in UML

```text
       ┌───────────┐
       │  Animal   │
       └─────┬─────┘
             △
             │
       ┌─────┴─────┐
       │   Dog     │
       └───────────┘
```

The hollow triangle points toward the **parent/base class**.

---

## Association

```text
┌──────────┐              ┌───────────┐
│ Teacher  │──────────────│  Student  │
└──────────┘              └───────────┘
```

Simple line = association.

---

## Aggregation

Aggregation is represented by a **hollow diamond**.

```text
┌────────────┐      ◇──────────────┐
│ Department │─────────────────────│ Professor
└────────────┘                     └─────────
```

The diamond is on the side of the **whole/container**.

---

## Composition

Composition uses a **filled diamond**.

```text
┌─────────┐      ◆──────────────┐
│   Car   │─────────────────────│ Engine
└─────────┘                     └──────
```

The filled diamond represents stronger ownership.

---

# Putting Phase 9 Together

Here's a small example that combines several of these ideas.

Suppose we're designing a payment system.

```text
                         ┌──────────────────┐
                         │ PaymentStrategy  │
                         ├──────────────────┤
                         │ + pay()          │
                         └────────┬─────────┘
                                  △
                    ┌─────────────┴─────────────┐
                    │                           │
             ┌──────────────┐            ┌──────────────┐
             │ CardPayment  │            │  UpiPayment  │
             ├──────────────┤            ├──────────────┤
             │ + pay()      │            │ + pay()      │
             └──────────────┘            └──────────────┘
                    △                           △
                    │                           │
                    └──────────┐     ┌──────────┘
                               │     │
                         ┌─────┴─────┴─────┐
                         │    Checkout     │
                         ├─────────────────┤
                         │ - strategy      │
                         ├─────────────────┤
                         │ + pay()         │
                         └─────────────────┘
```

This design demonstrates:

```text
Interface
    ↓
Polymorphism
    ↓
Composition
    ↓
Dependency Injection
    ↓
Low Coupling
    ↓
Strategy Pattern
```

For example:

```java
interface PaymentStrategy {
    void pay();
}

class CardPayment implements PaymentStrategy {
    public void pay() {
        System.out.println("Card payment");
    }
}

class UpiPayment implements PaymentStrategy {
    public void pay() {
        System.out.println("Pay using UPI");
    }
}

class Checkout {
    private PaymentStrategy strategy;

    Checkout(PaymentStrategy strategy) {
        this.strategy = strategy;
    }

    void pay() {
        strategy.pay();
    }
}
```

Usage:

```java
PaymentStrategy strategy = new UpiPayment();

Checkout checkout = new Checkout(strategy);

checkout.pay();
```

The important part isn't memorizing the pattern. It's understanding **why the design works**:

```text
Checkout
   │
   │ depends on
   ▼
PaymentStrategy
   ▲
   │
 ┌─┴───────────┐
 │             │
Card          UPI
```

`Checkout` doesn't need to know the implementation details of Card or UPI.

---

# Your Complete OOP Roadmap

At this point, your roadmap is quite complete for a **fresher-level C++ + Java OOP preparation**:

```text
PHASE 1
OOP Fundamentals
│
├── Classes & Objects
├── Members
├── Access Specifiers
├── Constructors / Destructors
├── this
├── Encapsulation
└── Abstraction
        │
        ▼
PHASE 2
Inheritance
│
├── Inheritance
├── Types
├── Overriding
├── super / Base access
├── Constructor / Destructor order
└── Multiple Inheritance
        │
        ▼
PHASE 3
Polymorphism
│
├── Overloading
├── Operator Overloading
├── Runtime Polymorphism
├── Virtual Functions
├── Dynamic Dispatch
└── override / final
        │
        ▼
PHASE 4
Abstract Classes & Interfaces
│
├── Abstract Classes
├── Pure Virtual Functions
├── Java Interfaces
├── Multiple Interfaces
└── Abstract Class vs Interface
        │
        ▼
PHASE 5
Object Relationships
│
├── Association
├── Aggregation
├── Composition
└── IS-A / HAS-A
        │
        ▼
PHASE 6
Language-Specific OOP
│
├── static
├── const / final
├── friend
├── Nested Classes
├── Memory Management
├── Copy Constructor
├── Copy Assignment
├── Shallow / Deep Copy
├── GC
└── Smart Pointers
        │
        ▼
PHASE 7
Exception Handling
│
├── try / catch / throw
├── Multiple Catch
├── Custom Exceptions
└── Checked / Unchecked
        │
        ▼
PHASE 8
Templates & Generics
│
├── Function Templates
├── Class Templates
├── Java Generics
└── Template vs Generic
        │
        ▼
PHASE 9
OOP Design
│
├── Coupling / Cohesion
├── SOLID
├── Composition over Inheritance
├── Dependency Injection
├── Design Patterns
└── UML
```

For a fresher, I would **stop the dedicated OOP syllabus here**. The next useful step isn't adding more OOP theory; it's practicing these concepts through **small C++ and Java class-design problems and interview questions**, because that's where the concepts start connecting naturally.
