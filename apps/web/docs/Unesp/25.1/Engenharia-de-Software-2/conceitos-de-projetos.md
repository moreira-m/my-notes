

---

# Software Design & Quality

## Attributes (FURPS)

- This is the **blueprint phase** where **abstract requirements** are translated into a **structured model** that establishes how the system will be built and ensures its quality.
- It involves modeling the system **before the code begins**.
- **FURPS** includes:
  1.  **Functionality**: capabilities and features of the software.
  2.  **Usability**: human factors, aesthetics, UI consistency, and documentation.
  3.  **Reliability**: frequency of failure (mean time to failure - **MTTF**) and severity of those failures.
  4.  **Performance**: efficiency, resource consumption, and response times.

---

# The Design Model and Process

*   Like an architect's floor plan, start with a **high-level overview** of the system, then **iteratively zoom in** to define:
    *   Specific **interfaces**
    *   **Components**
    *   **Data structures**
    *   This approach uses **UML** for translation into an **analysis model**.
    *   The model must be **readable** and **easy to understand**.
    *   The development process is **iterative**.

*   Even **agile methods** do not eliminate the need for **design**; **code alone** is rarely **sufficient documentation** for future **maintenance**.

*   The **design process** involves **systematic, generic tasks** that transition the system from **high abstraction** to **low abstraction**, mapping **analysis elements** to **design elements**.

---

# Architectural Element Translations

*   **Data/class projects** translate into **Architectural Elements**.
*   **Scenario behavioral elements** translate into **Interface Elements** and **Component Elements**.
*   **The process domain** involves:
    *   **Partitioning** the analysis model into a **functionally cohesive subsystem**.
    *   **Designing interfaces** for external devices.
    *   **Developing a deployment model**.