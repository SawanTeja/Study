# Phase 3 — Polymorphism

Polymorphism literally means **“many forms.”** In OOP, it means the same interface/function call can behave differently depending on the situation or object.

---

## 1. Compile-Time Polymorphism

Compile-time polymorphism means the compiler determines **which function/operator to use during compilation**.

The two important forms are:

```text
Compile-Time Polymorphism
        │
        ├── Function/Method Overloading
        │
        └── Operator Overloading (C++)
```

---

# 2. Function/Method Overloading

Overloading means having multiple functions with the **same name but different parameter lists**.

## C++

```cpp
#include <bits/stdc++.h>
using namespace std;

class Calculator {
public:
    int add(int a, int b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }

    double add(double a, double b) {
        return a + b;
    }
};
```

Now:

```cpp
Calculator c;

cout << c.add(2, 3) << endl;        // int, int
cout << c.add(2, 3, 4) << endl;     // int, int, int
cout << c.add(2.5, 3.5) << endl;    // double, double
```

The compiler determines which `add()` to call based on the arguments.

### Java

```java
class Calculator {

    int add(int a, int b) {
        return a + b;
    }

    int add(int a, int b, int c) {
        return a + b + c;
    }

    double add(double a, double b) {
        return a + b;
    }
}
```

Same idea:

```java
Calculator c = new Calculator();

c.add(2, 3);
c.add(2, 3, 4);
c.add(2.5, 3.5);
```

### Important rule

You **cannot overload only by changing the return type**.

This is invalid:

```cpp
int add(int a, int b);
double add(int a, int b);  // ERROR
```

because the parameter list is identical.

---

# 3. Operator Overloading — C++

Operator overloading allows you to define how operators such as:

```text
+
-
==
<
>
```

behave for your own classes.

For example, C++ already knows:

```cpp
int a = 10;
int b = 20;

int c = a + b;
```

But what should `+` mean for:

```cpp
Student s1;
Student s2;
```

You can define it.

### Example

```cpp
#include <bits/stdc++.h>
using namespace std;

class Point {
public:
    int x, y;

    Point(int x, int y) : x(x), y(y) {}

    Point operator+(const Point& other) {
        return Point(x + other.x, y + other.y);
    }
};
```

Now:

```cpp
Point p1(2, 3);
Point p2(4, 5);

Point p3 = p1 + p2;

cout << p3.x << " " << p3.y;
```

Output:

```text
6 8
```

The expression:

```cpp
p1 + p2
```

is essentially handled through your overloaded `operator+`.

### Java

Java **does not support user-defined operator overloading**.

You cannot define:

```java
p1 + p2
```

for your own class.

Instead, you'd use a method:

```java
class Point {
    int x, y;

    Point(int x, int y) {
        this.x = x;
        this.y = y;
    }

    Point add(Point other) {
        return new Point(x + other.x, y + other.y);
    }
}
```

Then:

```java
Point p3 = p1.add(p2);
```

---

# 4. Runtime Polymorphism

Runtime polymorphism means the actual method to execute is determined **at runtime based on the actual object**.

This is mainly achieved through **method overriding**.

Consider:

```text
Animal
  ↑
  |
 Dog
```

Both have:

```text
sound()
```

but the behavior is different.

---

## C++

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

Now:

```cpp
Animal* animal = new Dog();

animal->sound();
```

Output:

```text
Bark
```

Even though the pointer type is:

```cpp
Animal*
```

the actual object is:

```text
Dog
```

Therefore the `Dog` implementation runs.

That's runtime polymorphism.

---

## Java

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

Then:

```java
Animal animal = new Dog();

animal.sound();
```

Output:

```text
Bark
```

Again:

```text
Reference type → Animal
Actual object  → Dog
Method called  → Dog.sound()
```

This is a **very important concept for Java interviews**.

---

# 5. Virtual Functions — C++

This is one of the most important C++ OOP concepts.

Consider:

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
        cout << "Bark\n";
    }
};
```

Now:

```cpp
Animal* a = new Dog();

a->sound();
```

Without `virtual`, C++ uses the **pointer/reference type** for this call.

So it calls:

```text
Animal::sound()
```

not:

```text
Dog::sound()
```

---

## Add `virtual`

```cpp
class Animal {
public:
    virtual void sound() {
        cout << "Animal sound\n";
    }
};
```

Now:

```cpp
Animal* a = new Dog();

a->sound();
```

Output:

```text
Bark
```

`virtual` tells C++ that the function should participate in **dynamic dispatch**.

Conceptually:

```text
Animal* a
    ↓
actual object = Dog
    ↓
Dog::sound()
```

You don't need to memorize the internal implementation yet, but you should know that C++ commonly implements this using a **virtual table (vtable)** and virtual pointer machinery.

---

# 6. Dynamic Method Dispatch — Java

Java uses runtime method dispatch for overridable instance methods by default.

Example:

```java
class Animal {
    void sound() {
        System.out.println("Animal");
    }
}

class Dog extends Animal {
    @Override
    void sound() {
        System.out.println("Dog");
    }
}
```

Then:

```java
Animal a = new Dog();

a.sound();
```

Output:

```text
Dog
```

Notice something important:

Java does **not** require a `virtual` keyword.

You don't write:

```java
virtual void sound()
```

Java's normal instance-method overriding already uses dynamic dispatch.

---

# 7. `override` and `final`

## `override` — C++

`override` tells the compiler:

> "This function is supposed to override a virtual function from the parent."

```cpp
class Animal {
public:
    virtual void sound() {
        cout << "Animal\n";
    }
};

class Dog : public Animal {
public:
    void sound() override {
        cout << "Dog\n";
    }
};
```

If you accidentally write:

```cpp
void sounds() override
```

the compiler gives an error because there is no parent method called `sounds()` to override.

This is useful because it catches mistakes.

---

## `@Override` — Java

Java uses an annotation:

```java
class Dog extends Animal {

    @Override
    void sound() {
        System.out.println("Dog");
    }
}
```

It serves a similar purpose.

It tells the compiler:

> "Check that this actually overrides a parent method."

---

## `final`

`final` can prevent further overriding in Java.

```java
class Animal {
    final void sound() {
        System.out.println("Animal");
    }
}
```

Now a child cannot override `sound()`.

```java
class Dog extends Animal {

    // ERROR
    void sound() {
    }
}
```

Java can also make a class `final`:

```java
final class Animal {
}
```

Then:

```java
class Dog extends Animal {
}
```

is invalid because a `final` class cannot be inherited.

### C++ equivalent

C++ also has `final`:

```cpp
class Animal {
public:
    virtual void sound() final {
        cout << "Animal\n";
    }
};
```

A derived class cannot override it.

You can also make the class final:

```cpp
class Animal final {
};
```

Then it cannot be inherited.

---

# Phase 4 — Abstract Classes & Interfaces

This phase is closely connected to **abstraction + inheritance + polymorphism**.

---

# 1. Abstract Classes

An abstract class is a class that is intended to be used as a **base class** and generally cannot be instantiated directly.

For example:

```text
Animal
 ├── Dog
 └── Cat
```

You may want every animal to have:

```text
sound()
```

but `Animal` itself doesn't need a specific implementation.

---

## Java

Java explicitly provides the `abstract` keyword.

```java
abstract class Animal {

    abstract void sound();

    void eat() {
        System.out.println("Eating");
    }
}
```

You cannot do:

```java
Animal a = new Animal();  // ERROR
```

But you can:

```java
class Dog extends Animal {

    @Override
    void sound() {
        System.out.println("Bark");
    }
}
```

And:

```java
Animal a = new Dog();

a.sound();
a.eat();
```

So an abstract class can contain:

```text
abstract methods
+
normal methods
+
fields
+
constructors
```

---

# 2. Pure Virtual Functions — C++

C++ doesn't have an `abstract` keyword.

Instead, a class becomes abstract when it contains at least one **pure virtual function**.

Syntax:

```cpp
virtual void sound() = 0;
```

Example:

```cpp
class Animal {
public:
    virtual void sound() = 0;

    void eat() {
        cout << "Eating\n";
    }
};
```

You cannot:

```cpp
Animal a;  // ERROR
```

because `Animal` is abstract.

A derived class must implement the pure virtual function:

```cpp
class Dog : public Animal {
public:
    void sound() override {
        cout << "Bark\n";
    }
};
```

Now:

```cpp
Animal* a = new Dog();

a->sound();
a->eat();
```

works.

### Important connection

```text
Java:
abstract void sound();

C++:
virtual void sound() = 0;
```

Both express the idea:

> "Derived classes must provide an implementation."

---

# 3. Interfaces — Java

An interface defines a **contract** that classes can implement.

Example:

```java
interface Flyable {
    void fly();
}
```

A class implements it:

```java
class Bird implements Flyable {

    @Override
    public void fly() {
        System.out.println("Bird flying");
    }
}
```

Now:

```java
Flyable f = new Bird();

f.fly();
```

The interface says:

```text
Any Flyable must provide fly()
```

but doesn't necessarily specify how the particular class performs it.

---

# 4. Multiple Interfaces — Java

This is particularly important because Java doesn't allow multiple class inheritance.

A class can implement multiple interfaces:

```java
interface Flyable {
    void fly();
}

interface Swimmable {
    void swim();
}

class Duck implements Flyable, Swimmable {

    @Override
    public void fly() {
        System.out.println("Flying");
    }

    @Override
    public void swim() {
        System.out.println("Swimming");
    }
}
```

Now:

```java
Duck d = new Duck();

d.fly();
d.swim();
```

The class gets multiple capabilities:

```text
          Flyable
             \
              \
              Duck
              /
             /
        Swimmable
```

This is one reason interfaces are very important in Java.

---

# 5. Abstract Class vs Interface

This distinction is frequently asked in interviews.

| Feature | Abstract Class | Interface — Java |
|---|---|---|
| Purpose | Common base + partial implementation | Contract/capability |
| Can have fields | Yes | Can have constants |
| Can have constructors | Yes | No constructors |
| Can have implemented methods | Yes | Yes, including `default`/`static` methods |
| Can have abstract methods | Yes | Yes |
| Class can extend multiple? | No | A class can implement multiple interfaces |
| Keyword | `abstract` | `interface` |
| Used with | `extends` | `implements` |

Example:

```java
abstract class Animal {
    String name;

    Animal(String name) {
        this.name = name;
    }

    abstract void sound();

    void eat() {
        System.out.println("Eating");
    }
}
```

An interface:

```java
interface Flyable {
    void fly();
}
```

A class can combine them:

```java
class Bird extends Animal implements Flyable {

    Bird(String name) {
        super(name);
    }

    @Override
    void sound() {
        System.out.println("Chirp");
    }

    @Override
    public void fly() {
        System.out.println("Flying");
    }
}
```

This is a very realistic Java OOP pattern:

```text
             Animal
          (abstract class)
                ↑
                |
              Bird
                |
        implements Flyable
                |
             Flyable
            (interface)
```

---

# 6. C++ Abstract Classes vs Java Interfaces

This is where you should understand the **conceptual difference**, rather than trying to find an exact one-to-one language mapping.

### C++

C++ uses abstract classes with pure virtual functions:

```cpp
class Flyable {
public:
    virtual void fly() = 0;
};
```

Then:

```cpp
class Bird : public Flyable {
public:
    void fly() override {
        cout << "Flying\n";
    }
};
```

C++ doesn't have a separate `interface` keyword like Java.

A class containing only pure virtual functions can effectively be used like an interface.

---

### Java

Java has an explicit interface:

```java
interface Flyable {
    void fly();
}
```

Then:

```java
class Bird implements Flyable {
    public void fly() {
        System.out.println("Flying");
    }
}
```

### The important conceptual difference

```text
C++
────────────────────────────
Abstract class
    ↓
Pure virtual functions
    ↓
Can behave like an interface

Java
────────────────────────────
abstract class
    ↓
Partial implementation + shared state

interface
    ↓
Contract / capability
```

---

# One Important Connection to Remember

At this point, don't study these topics as isolated definitions.

They form one chain:

```text
Class
  ↓
Encapsulation
  ↓
Inheritance
  ↓
Overriding
  ↓
Polymorphism
  ↓
Virtual Functions / Dynamic Dispatch
  ↓
Abstract Classes
  ↓
Interfaces
```

For example, this single C++ program combines almost everything:

```cpp
#include <bits/stdc++.h>
using namespace std;

class Animal {
public:
    virtual void sound() = 0;

    void eat() {
        cout << "Eating\n";
    }

    virtual ~Animal() = default;
};

class Dog : public Animal {
public:
    void sound() override {
        cout << "Bark\n";
    }
};

class Cat : public Animal {
public:
    void sound() override {
        cout << "Meow\n";
    }
};

int main() {
    Animal* a1 = new Dog();
    Animal* a2 = new Cat();

    a1->sound();
    a2->sound();

    a1->eat();
    a2->eat();

    delete a1;
    delete a2;
}
```

Here:

```text
Animal
 ├── abstract class
 ├── pure virtual function
 ├── virtual destructor
 └── normal method

Dog / Cat
 ├── inheritance
 ├── method overriding
 └── override

Animal*
 └── runtime polymorphism
       ↓
    Dog::sound()
    Cat::sound()
```

And the Java equivalent:

```java
abstract class Animal {

    abstract void sound();

    void eat() {
        System.out.println("Eating");
    }
}

class Dog extends Animal {

    @Override
    void sound() {
        System.out.println("Bark");
    }
}

class Cat extends Animal {

    @Override
    void sound() {
        System.out.println("Meow");
    }
}

public class Main {
    public static void main(String[] args) {

        Animal a1 = new Dog();
        Animal a2 = new Cat();

        a1.sound();
        a2.sound();

        a1.eat();
        a2.eat();
    }
}
```

The key mental model is:

```text
Animal a1 = new Dog();

                 ┌──────────────────┐
Reference ──────►│ Animal reference │
                 └────────┬─────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │ Dog object  │
                   └─────────────┘
                          │
                          ▼
                    sound() → Dog
```

That distinction between **reference/pointer type** and **actual object type** is the heart of runtime polymorphism.
