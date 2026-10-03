# Phase 1 — OOP Fundamentals

---

## 1. Classes and Objects

### Class

A **class** is a blueprint/template that defines what an object will contain and what it can do.

For example, a `Student` class can contain:

- Data → name, age
- Behavior → study(), display()

### C++

```cpp
#include <bits/stdc++.h>
using namespace std;

class Student {
public:
    string name;
    int age;

    void display() {
        cout << name << " " << age << endl;
    }
};
```

Creating an object:

```cpp
int main() {
    Student s1;

    s1.name = "Tejashvi";
    s1.age = 21;

    s1.display();
}
```

Here:

```text
Student     → class
s1          → object
name, age   → data
display()   → behavior
```

### Java

```java
class Student {
    String name;
    int age;

    void display() {
        System.out.println(name + " " + age);
    }
}
```

Creating an object:

```java
public class Main {
    public static void main(String[] args) {
        Student s1 = new Student();

        s1.name = "Tejashvi";
        s1.age = 21;

        s1.display();
    }
}
```

### Important difference

C++:

```cpp
Student s1;
```

can create an object directly.

Java:

```java
Student s1 = new Student();
```

normally creates the object using `new`.

The variable `s1` in Java is a **reference variable** pointing to the object.

---

# 2. Data Members and Member Functions

A class generally contains:

```text
Class
 ├── Data members
 └── Member functions
```

### C++

```cpp
class Car {
private:
    string model;
    int speed;

public:
    void setSpeed(int s) {
        speed = s;
    }

    void showSpeed() {
        cout << speed << endl;
    }
};
```

`model` and `speed` are **data members**.

`setSpeed()` and `showSpeed()` are **member functions**.

### Java

```java
class Car {
    private String model;
    private int speed;

    public void setSpeed(int s) {
        speed = s;
    }

    public void showSpeed() {
        System.out.println(speed);
    }
}
```

Same basic concept.

### Key idea

Data represents the **state** of an object.

Functions represent the **behavior** of an object.

For example:

```text
Car
 ├── speed       → state
 ├── model       → state
 ├── accelerate  → behavior
 └── brake       → behavior
```

---

# 3. Access Specifiers

Access specifiers control **who can access class members**.

The three important ones are:

```text
public
private
protected
```

---

## `public`

Accessible from outside the class.

### C++

```cpp
class Student {
public:
    string name;
};
```

```cpp
Student s;
s.name = "Tejashvi";   // allowed
```

### Java

```java
class Student {
    public String name;
}
```

```java
Student s = new Student();
s.name = "Tejashvi";   // allowed
```

---

## `private`

Accessible only inside the class.

### C++

```cpp
class Student {
private:
    int age;

public:
    void setAge(int a) {
        age = a;
    }
};
```

This is invalid:

```cpp
Student s;
s.age = 21;  // ERROR
```

But this works:

```cpp
s.setAge(21);
```

### Java

```java
class Student {
    private int age;

    public void setAge(int a) {
        age = a;
    }
}
```

```java
Student s = new Student();

s.age = 21;       // ERROR
s.setAge(21);     // allowed
```

---

## `protected`

Mainly relevant when **inheritance** is involved.

A `protected` member can be accessed by:

- the class itself
- derived/child classes
- in C++, also subject to C++'s additional access rules depending on how it's accessed

### C++

```cpp
class Parent {
protected:
    int value = 10;
};

class Child : public Parent {
public:
    void show() {
        cout << value << endl;  // allowed
    }
};
```

### Java

```java
class Parent {
    protected int value = 10;
}

class Child extends Parent {
    void show() {
        System.out.println(value);  // allowed
    }
}
```

### Easy way to remember

```text
public      → everyone
private     → only this class
protected   → this class + child classes
```

---

# 4. Constructors and Destructors

## Constructor

A constructor is a special function that runs when an object is created.

Its main purpose is to **initialize the object**.

---

### C++

```cpp
class Student {
private:
    string name;
    int age;

public:
    Student(string n, int a) {
        name = n;
        age = a;
    }

    void display() {
        cout << name << " " << age << endl;
    }
};
```

```cpp
int main() {
    Student s("Tejashvi", 21);

    s.display();
}
```

Constructor:

```cpp
Student(string n, int a)
```

automatically runs when:

```cpp
Student s("Tejashvi", 21);
```

is executed.

### Better C++ style: initializer list

```cpp
Student(string n, int a)
    : name(n), age(a) {
}
```

You should learn this because it is important in real C++ code.

---

### Java

```java
class Student {
    private String name;
    private int age;

    Student(String n, int a) {
        name = n;
        age = a;
    }

    void display() {
        System.out.println(name + " " + age);
    }
}
```

```java
Student s = new Student("Tejashvi", 21);
```

Again, the constructor automatically runs.

---

## Constructor overloading

A class can have multiple constructors with different parameters.

### C++

```cpp
class Student {
public:
    Student() {
        cout << "Default constructor\n";
    }

    Student(string name) {
        cout << "Name: " << name << endl;
    }
};
```

### Java

```java
class Student {
    Student() {
        System.out.println("Default constructor");
    }

    Student(String name) {
        System.out.println("Name: " + name);
    }
}
```

This is **constructor overloading**.

---

## Destructor

This is where C++ and Java differ significantly.

### C++

C++ has destructors.

```cpp
class Student {
public:
    Student() {
        cout << "Constructor\n";
    }

    ~Student() {
        cout << "Destructor\n";
    }
};
```

When the object's lifetime ends, the destructor runs.

```text
Object created
      ↓
Constructor
      ↓
Object used
      ↓
Object lifetime ends
      ↓
Destructor
```

The destructor is particularly important in C++ because resources such as:

- dynamically allocated memory
- files
- locks
- sockets

may need explicit cleanup.

### Java

Java **does not have C++-style destructors**.

Java uses **Garbage Collection (GC)** to automatically reclaim memory from objects that are no longer reachable.

```java
Student s = new Student();

s = null;
```

Eventually, the object may become eligible for garbage collection.

Don't think:

```text
Java → destructor
```

Instead think:

```text
Java → Garbage Collector
```

For resources such as files, Java commonly uses `try-with-resources` rather than relying on garbage collection.

---

# 5. `this` Keyword / Pointer

`this` refers to the **current object**.

---

## C++

In C++, `this` is a **pointer**.

```cpp
class Student {
private:
    string name;

public:
    Student(string name) {
        this->name = name;
    }
};
```

Here there are two `name`s:

```cpp
string name       // parameter
this->name        // object's data member
```

So:

```cpp
this->name = name;
```

means:

```text
current object's name = parameter name
```

You can think of:

```cpp
this
```

as pointing to the current object.

---

## Java

In Java, `this` is a **reference to the current object**, not a C++-style pointer.

```java
class Student {
    private String name;

    Student(String name) {
        this.name = name;
    }
}
```

Again:

```text
this.name → object's field
name      → parameter
```

### Important difference

```text
C++:
this → pointer

Java:
this → reference
```

Java does not use C++ pointer syntax such as:

```cpp
this->name
```

Instead:

```java
this.name
```

---

# 6. Encapsulation

Encapsulation means **bundling data and the methods that operate on that data together**, while controlling direct access to the internal state.

A common implementation is:

```text
private data
     ↓
public methods
     ↓
controlled access
```

### Bad design

```cpp
class BankAccount {
public:
    double balance;
};
```

Anyone can do:

```cpp
account.balance = -100000;
```

That's dangerous.

### Better C++

```cpp
class BankAccount {
private:
    double balance = 0;

public:
    void deposit(double amount) {
        if (amount > 0)
            balance += amount;
    }

    double getBalance() {
        return balance;
    }
};
```

Now:

```cpp
BankAccount account;

account.deposit(1000);

cout << account.getBalance();
```

The user cannot directly modify `balance`.

### Java

```java
class BankAccount {
    private double balance = 0;

    public void deposit(double amount) {
        if (amount > 0) {
            balance += amount;
        }
    }

    public double getBalance() {
        return balance;
    }
}
```

### Remember

Encapsulation is not simply:

> "Make everything private."

It's about **controlling how an object's internal state is accessed and modified**.

---

# 7. Abstraction

Abstraction means exposing **what an object can do** while hiding unnecessary implementation details.

For example, when you use:

```cpp
car.start();
```

you don't need to know every internal operation required to start the engine.

You care about:

```text
start()
```

rather than:

```text
fuel injection
↓
air mixture
↓
ignition
↓
crankshaft
↓
...
```

---

## C++ abstraction using a class

```cpp
class Car {
private:
    void startEngine() {
        cout << "Engine started\n";
    }

public:
    void start() {
        startEngine();
    }
};
```

User only needs:

```cpp
Car car;
car.start();
```

The internal implementation is hidden.

---

## Java

```java
class Car {
    private void startEngine() {
        System.out.println("Engine started");
    }

    public void start() {
        startEngine();
    }
}
```

```java
Car car = new Car();
car.start();
```

---

## Abstraction using abstract classes

This becomes especially important in Java and C++.

### Java

```java
abstract class Animal {
    abstract void makeSound();
}

class Dog extends Animal {
    @Override
    void makeSound() {
        System.out.println("Bark");
    }
}
```

You can say:

```text
Animal
   ↓
makeSound()
   ↓
implementation hidden
   ↓
Dog → Bark
```

### C++

C++ doesn't have an `abstract` keyword, but a class becomes abstract when it has a **pure virtual function**.

```cpp
class Animal {
public:
    virtual void makeSound() = 0;
};

class Dog : public Animal {
public:
    void makeSound() override {
        cout << "Bark\n";
    }
};
```

The:

```cpp
= 0
```

makes `makeSound()` a pure virtual function.

We'll cover this much more when we reach **polymorphism**.

---

# Phase 2 — Inheritance

Inheritance allows one class to **reuse and extend** another class.

Think:

```text
        Animal
          ↑
          |
         Dog
```

`Dog` inherits properties/behavior from `Animal`.

---

# 1. Inheritance Basics

## C++

```cpp
class Animal {
public:
    void eat() {
        cout << "Eating\n";
    }
};

class Dog : public Animal {
public:
    void bark() {
        cout << "Barking\n";
    }
};
```

Now:

```cpp
Dog d;

d.eat();   // inherited
d.bark();  // Dog's own function
```

`Dog` gets the accessible members of `Animal`.

Syntax:

```cpp
class Child : public Parent
```

---

## Java

```java
class Animal {
    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {
    void bark() {
        System.out.println("Barking");
    }
}
```

```java
Dog d = new Dog();

d.eat();
d.bark();
```

Java uses:

```java
extends
```

while C++ uses:

```cpp
:
```

---

# 2. Types of Inheritance

You should know these five names, but don't over-focus on memorizing diagrams.

---

## Single inheritance

One parent → one child.

```text
Animal
   ↓
 Dog
```

### C++

```cpp
class Animal {};
class Dog : public Animal {};
```

### Java

```java
class Animal {}
class Dog extends Animal {}
```

---

## Multilevel inheritance

```text
Animal
   ↓
Mammal
   ↓
Dog
```

### C++

```cpp
class Animal {};
class Mammal : public Animal {};
class Dog : public Mammal {};
```

### Java

```java
class Animal {}
class Mammal extends Animal {}
class Dog extends Mammal {}
```

---

## Hierarchical inheritance

One parent → multiple children.

```text
       Animal
       /    \
     Dog    Cat
```

### C++

```cpp
class Animal {};

class Dog : public Animal {};
class Cat : public Animal {};
```

### Java

```java
class Animal {}

class Dog extends Animal {}
class Cat extends Animal {}
```

---

## Multiple inheritance

Multiple parents → one child.

```text
  Animal     Pet
      \       /
       \     /
        Dog
```

### C++

```cpp
class Animal {};
class Pet {};

class Dog : public Animal, public Pet {};
```

C++ supports this.

Java classes do **not** support multiple inheritance of classes.

We'll discuss the reason later.

---

## Hybrid inheritance

A combination of multiple inheritance structures.

You mainly need to **recognize the term** as a fresher.

C++ can implement it using classes.

Java avoids multiple class inheritance and uses interfaces for multiple inheritance of type.

---

# 3. Method/Function Overriding

Overriding happens when a child class provides its **own implementation of a method inherited from the parent**.

### Java

```java
class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Bark");
    }
}
```

Now:

```java
Dog d = new Dog();
d.sound();
```

Output:

```text
Bark
```

`Dog` has overridden `Animal.sound()`.

---

## C++

In C++, overriding is normally used with **virtual functions**.

```cpp
class Animal {
public:
    virtual void sound() {
        cout << "Animal sound\n";
    }
};

class Dog : public Animal {
public:
    void sound() override {
        cout << "Bark\n";
    }
};
```

The important keywords are:

```cpp
virtual
override
```

`override` tells the compiler:

> "I intend for this function to override a base-class virtual function."

This lets the compiler catch mistakes.

---

# 4. `super` in Java / Base-Class Access in C++

Sometimes the child class wants to access the parent implementation.

---

## Java — `super`

```java
class Animal {
    void sound() {
        System.out.println("Animal sound");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        super.sound();
        System.out.println("Bark");
    }
}
```

Output:

```text
Animal sound
Bark
```

Here:

```java
super.sound();
```

calls the parent version.

`super` can also access parent constructors:

```java
class Animal {
    Animal(String name) {
        System.out.println(name);
    }
}

class Dog extends Animal {
    Dog() {
        super("Dog");
    }
}
```

---

## C++ — base-class access

C++ doesn't have `super`.

You explicitly name the base class:

```cpp
class Animal {
public:
    void sound() {
        cout << "Animal sound\n";
    }
};

class Dog : public Animal {
public:
    void sound() {
        Animal::sound();
        cout << "Bark\n";
    }
};
```

So:

```cpp
Animal::sound();
```

is roughly analogous to:

```java
super.sound();
```

for this use case.

---

# 5. Constructor and Destructor Order in Inheritance

This is **very important for interviews**.

Suppose:

```text
Parent
  ↓
Child
```

When creating a child object:

```text
Parent constructor
        ↓
Child constructor
```

The parent must be initialized before the child.

---

## C++

```cpp
class Parent {
public:
    Parent() {
        cout << "Parent constructor\n";
    }

    ~Parent() {
        cout << "Parent destructor\n";
    }
};

class Child : public Parent {
public:
    Child() {
        cout << "Child constructor\n";
    }

    ~Child() {
        cout << "Child destructor\n";
    }
};
```

```cpp
int main() {
    Child c;
}
```

Output:

```text
Parent constructor
Child constructor
Child destructor
Parent destructor
```

So:

```text
Construction:
Parent → Child

Destruction:
Child → Parent
```

### Why?

Construction builds the object from the base upward:

```text
Parent part
   ↓
Child part
```

Destruction reverses this:

```text
Child part
   ↓
Parent part
```

---

## Java

Java has no destructors, but constructors still follow the same inheritance initialization principle.

```java
class Parent {
    Parent() {
        System.out.println("Parent constructor");
    }
}

class Child extends Parent {
    Child() {
        System.out.println("Child constructor");
    }
}
```

```java
Child c = new Child();
```

Output:

```text
Parent constructor
Child constructor
```

Java implicitly calls the parent constructor using:

```java
super();
```

unless another constructor invocation is explicitly provided.

---

# 6. Multiple Inheritance — C++ vs Java

This is one of the most important differences between the two languages.

## C++ supports multiple inheritance

```cpp
class Father {
public:
    void work() {
        cout << "Father\n";
    }
};

class Mother {
public:
    void work() {
        cout << "Mother\n";
    }
};

class Child : public Father, public Mother {
};
```

Now:

```cpp
Child c;

c.Father::work();
c.Mother::work();
```

We need to specify which parent's function we want because both have `work()`.

---

## Diamond problem

A classic problem occurs when inheritance looks like:

```text
        A
       / \
      B   C
       \ /
        D
```

If `B` and `C` both inherit from `A`, then `D` may contain two copies of `A`.

C++ can solve this using **virtual inheritance**:

```cpp
class A {};

class B : virtual public A {};
class C : virtual public A {};

class D : public B, public C {};
```

You don't need to master virtual inheritance immediately, but you should understand **why it exists**.

---

## Java

Java doesn't allow:

```java
class D extends B, C
```

A Java class can extend only **one class**.

But Java allows multiple interfaces:

```java
interface A {
    void show();
}

interface B {
    void print();
}

class C implements A, B {
    public void show() {
        System.out.println("Show");
    }

    public void print() {
        System.out.println("Print");
    }
}
```

So the basic comparison is:

| Feature | C++ | Java |
|---|---|---|
| Multiple class inheritance | Yes | No |
| Multiple interfaces | Yes, via abstract classes/interfaces | Yes |
| `super` | No | Yes |
| Base-class access | `Base::function()` | `super.function()` |
| Destructor | Yes | No |
| Garbage collection | No | Yes |
| Pure virtual function | Yes | No equivalent syntax |
| `abstract` keyword | No | Yes |
| `virtual` functions | Yes | Java methods are dynamically dispatched by default except certain cases |

---

# The Big Picture So Far

You should mentally connect the concepts like this:

```text
                    OOP
                     │
          ┌──────────┴──────────┐
          │                     │
       Classes              Objects
          │
          ├── Data Members
          ├── Member Functions
          │
          ├── Access Control
          │     ├── public
          │     ├── private
          │     └── protected
          │
          ├── Encapsulation
          │
          ├── Abstraction
          │
          └── Constructors
                 │
                 ↓
            Inheritance
                 │
       ┌─────────┼─────────┐
       │         │         │
     Types    Overriding  super/base
       │
       ↓
 Multiple Inheritance
       │
   C++ vs Java
```

The **next major Phase after this** should be **Polymorphism**, because inheritance + overriding naturally leads into it. That phase should cover **compile-time vs runtime polymorphism, function overloading, virtual functions, dynamic dispatch, abstract classes/interfaces, and the C++ vs Java differences**.
