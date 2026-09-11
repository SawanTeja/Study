# Polymorphism

Polymorphism is one of the core concepts of object-oriented programming (OOP) and describes situations in which something occurs in several different forms.

## Types of Polymorphism

1. **Compile-time Polymorphism**: Achieved by function overloading or operator overloading.
2. **Runtime Polymorphism**: Achieved by function overriding.

## Example

```java
class Animal {
  public void animalSound() {
    System.out.println("The animal makes a sound");
  }
}

class Pig extends Animal {
  public void animalSound() {
    System.out.println("The pig says: wee wee");
  }
}
```
