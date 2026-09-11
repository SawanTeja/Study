# Normalization

Normalization is the process of organizing data in a database. This includes creating tables and establishing relationships between those tables according to rules designed both to protect the data and to make the database more flexible by eliminating redundancy and inconsistent dependency.

## Normal Forms

- **1NF (First Normal Form)**: Eliminate repeating groups in individual tables.
- **2NF (Second Normal Form)**: Meet all requirements of 1NF and remove partial dependencies.
- **3NF (Third Normal Form)**: Meet all requirements of 2NF and remove transitive dependencies.
- **BCNF (Boyce-Codd Normal Form)**: A slightly stronger version of 3NF.

## Why Normalize?
- Minimizes duplicate data.
- Minimizes data modification issues.
- Simplifies queries.
