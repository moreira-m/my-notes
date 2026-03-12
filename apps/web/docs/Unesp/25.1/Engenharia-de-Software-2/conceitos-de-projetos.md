# Project Concepts

---

# Topic 1: Software Design & Quality

### Attributes (FURPS)

- This is the **blueprint phase** where **abstract requirements** are translated into a **structured model** that establishes how the system will be built and ensures its quality.
- It involves modeling the system **before the code begins**.
- **FURPS** includes:
  1.  **Functionality**: capabilities and features of the software.
  2.  **Usability**: human factors, aesthetics, UI consistency, and documentation.
  3.  **Reliability**: frequency of failure (mean time to failure - **MTTF**) and severity of those failures.
  4.  **Performance**: efficiency, resource consumption, and response times.

---

# Topic 2: The Design Model and Process

*   Like an architect's floor plan, start with a **high-level overview** of the system, then **iteratively zoom in** to define:
    *   Specific **interfaces**
    *   **Components**
    *   **Data structures**
    *   This approach uses **UML** for translation into an **analysis model**.
    *   The model must be **readable** and **easy to understand**.
    *   The development process is **iterative**.

*   Even **agile methods** do not eliminate the need for **design**; **code alone** is rarely **sufficient documentation** for future **maintenance**.

*   The **design process** involves **systematic, generic tasks** that transition the system from **high abstraction** to **low abstraction**, mapping **analysis elements** to **design elements**.
    *   **Data/class projects** translate into **Architectural Elements**.
    *   **Scenario behavioral elements** translate into **Interface Elements** and **Component Elements**.
    *   **The process domain** involves:
        *   **Partitioning** the analysis model into a **functionally cohesive subsystem**.
        *   **Designing interfaces** for external devices.
        *   **Developing a deployment model**.

---

# Topic 3: Abstraction and Architecture

*   **Abstraction** simplifies complexity by hiding the granular details of a function.
*   **Architecture** defines the high-level structural organization and interaction of those abstracted components.

### Abstraction

*   **Abstraction**: Naming a sequence of instructions without showing the details.
    *   Example: The word "open" implies walking, reaching, grabbing, and turning.
*   It exists in **user stories**, **use cases**, and **pseudocode**.

### Architecture

*   **Architecture**: The organization of **program modules**, their **data structures**, and how they **interact**.

### Agile Architecture Principles

*   In **Agile**, **architecture** must be defined **early on**.
    *   **Incremental development** of **architecture** is **rarely successful**.

### Key Concept: Refactoring

*   **Component refactoring** is **cheap**.
*   **Architectural refactoring** is **catastrophic**.

---

# Topic 4: Modularity, Encapsulation, and Separation of Concerns

*   **Complex problems** are solved by:
    *   Breaking them down into **separate, independent modules**, which exemplifies **Separation of Concerns**.
    *   These modules are then **wrapped in strict boundaries**, allowing communication only through **specific interfaces**, which is the essence of **Encapsulation**.

### Separation of Concerns
*   A **divide-and-conquer strategy**.

### Modularity
*   The only attribute that makes software **intellectually manageable**.

### Encapsulation
*   Protects **internal data and methods** from **outside interference**.

### Modularity and Cost Considerations

*   As the **number of modules increases**:
    *   The **cost per individual module decreases**.
    *   However, the **integration cost** between these modules **rises simultaneously**.
*   Furthermore, **strict encapsulation** ensures that when **errors** occur during **testing** or **maintenance**:
    *   **Bug propagation** is **physically limited**.
    *   This **prevents cascading system failures**.

### Cost-Module Relationship

*   The relationship between **cost** and the **number of modules** typically forms a U-shaped curve.
    *   Initially, more modules lead to lower per-unit costs.
    *   Beyond an optimal point, increasing modules causes total costs to rise due to higher integration complexity.

---

# Topic 5: Functional Independence (Cohesion vs. Coupling)

*   **High-quality modules** should:
    *   Do exactly **one thing very well** (**High Cohesion**).
    *   Rely as **little as possible** on other modules to do it (**Low Coupling**).

### Key Concepts

*   **Cohesion**:
    *   Refers to **functional robustness**.
    *   Its description should **not contain** the words "and" or "except".
*   **Coupling**:
    *   Describes the **relative interdependence** between modules.

### Golden Rule

*   **High Cohesion** (single-focused purpose) + **Low Coupling** (minimal external dependencies) = **Robust Software**.

---

# Topic 6: Refactoring

- A **rigorous process** of **cleaning up** and **optimizing internal code structure**.
  - This is done **without altering the system's external behavior or output**.

- **Eliminates**:
  - **Redundancy**
  - **Inefficient algorithms**
  - **Poorly constructed data structures**

- **Simplifies the design**.
  - However, it carries the **risk of involuntary side effects**.

### Preparatory Refactoring

- Sometimes, you must **restructure the code first** to **make adding a new feature easier**.