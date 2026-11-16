# ⚡ CodeCollab AI
### *Next-Generation Collaborative Cloud IDE with Machine Learning Defect Prediction & AI Copilot*

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-v4.8-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

---

## 📌 1. Project Overview & Abstract

In contemporary software engineering, distributed team collaboration and continuous code quality assurance are vital. Traditional cloud editors focus either strictly on collaborative text synchronization or static analysis, but rarely integrate both seamlessly within a unified, low-latency browser environment.

**CodeCollab AI** is an advanced full-stack browser-based IDE that pairs **real-time peer-to-peer WebSocket synchronization** with an **empirical Machine Learning Code Quality & Defect Prediction Engine**. As developers code collaboratively, the system continuously tokenizes the syntax, extracts architectural metrics, calculates McCabe's Cyclomatic Complexity, estimates algorithmic Big-O time complexity, and computes defect probability using empirical software engineering benchmarks.

---

## 🚀 2. Key Architecture & Features

### A. Real-Time Distributed Synchronization
* **WebSocket Room Protocol:** Built on Socket.IO over HTTP/HTTPS, enabling isolated multi-user development rooms with automatic client discovery.
* **Concurrency Collision Mitigation:** Uses unidirectional event loops with client-side suppression flags (`isInternalChange` / `setValue` origin filtering) to eliminate infinite echoing loops.
* **Peer Presence:** Active collaborator avatars, dynamic join/leave notifications, and shared room state.
* **Integrated Team Chat:** In-room peer-to-peer messaging drawer with timestamp tracking.

### B. Machine Learning Defect Prediction & SE Metrics HUD
* **Cyclomatic Complexity ($M = E - N + 2P$):** McCabe's graph-theoretic complexity calculated live across conditional branch points (`if`, `loops`, `ternary`, `case`, `logical operators`).
* **Halstead Software Science Metrics:**
  * Program Vocabulary: $\eta = n_1 + n_2$
  * Program Length: $N = N_1 + N_2$
  * Program Volume: $V = N \times \log_2(\eta)$
  * Programming Difficulty: $D = \frac{n_1}{2} \times \frac{N_2}{n_2}$
  * Mental Effort: $E = D \times V$
* **Maintainability Index (MI):**
  $$\text{MI} = \max\left(0, \frac{(171 - 5.2 \times \ln(V) - 0.23 \times M - 16.2 \times \ln(\text{LOC})) \times 100}{171}\right)$$
* **Defect Probability Classifier:** Computes a normalized multi-variable probability score based on NASA Metrics Data Program (MDP) weights:
  $$\text{Defect Risk} = \sigma(0.30 \cdot M_{\text{norm}} + 0.25 \cdot D_{\text{norm}} + 0.20 \cdot \text{MI}_{\text{inv}} + 0.15 \cdot \text{Smells} + 0.10 \cdot \text{Nesting})$$

### C. Algorithmic Big-O Complexity Estimator
* Classifies algorithms into **$O(1)$**, **$O(\log n)$**, **$O(n)$**, **$O(n \log n)$**, **$O(n^2)$**, or **$O(2^n)$** through control-flow loop nesting and recursion analysis.

### D. Interactive AI Copilot & Automated Test Suite Generation
* **Algorithmic Explanation:** Step-by-step logic breakdown with symbol counts.
* **Security & Vulnerability Audit:** Detects OWASP risks (`eval()` execution, unescaped DOM injections, empty catch blocks, loose equality).
* **Automated Unit Test Generator:** Synthesizes Jest/Mocha unit test specifications tailored to the detected function signatures.

### E. In-Browser Sandboxed Execution Terminal
* Executes JavaScript directly in-browser inside a scoped execution sandbox.
* Intercepts `console.log`, `console.warn`, and `console.error` streams.
* Real-time execution duration benchmarking in milliseconds ($\text{ms}$).

---

## 👥 3. Three-Member Project Division & Viva Guide

| Member | Primary Role | Core Modules Owned | What to Say in Evaluation |
| :--- | :--- | :--- | :--- |
| **Member 1** | **Frontend & UI/UX** | `Home.js`, `EditorPage.js`, `App.css`, `Editor.js`, Preset Loaders | *"I architected the responsive dark IDE layout, Monaco/CodeMirror integration, theme styles, keyboard shortcuts (Ctrl+Enter), and preset algorithm loading."* |
| **Member 2** | **Distributed Networking & WebSockets** | `server.js`, `Actions.js`, `ChatDrawer.js`, Socket Life-Cycle | *"I engineered the real-time Socket.IO communication layer, room isolation, payload broadcast mechanics, disconnect cleanups, and prevented infinite sync update loops."* |
| **Member 3** | **Machine Learning & Code Intelligence** | `mlAnalyzer.js`, `aiAssistant.js`, `MetricsPanel.js`, `ConsoleOutput.js` | *"I developed the ML defect prediction model, McCabe Cyclomatic Complexity counter, Halstead science metrics, Big-O estimator, and the sandboxed execution terminal."* |

---

## 🛠️ 4. Quick Start & Running Locally

### Running the Application (One Command)
Run the unified backend server (serves both the WebSockets and the frontend build on port 5000):
```bash
node server.js
```
Open your browser and navigate to:
👉 **`http://localhost:5000`**

---

## 🎓 5. Expected Viva / Defense Questions & Model Answers

**Q1: How does CodeCollab prevent an infinite update loop between collaborating clients?**  
*Answer:* When a remote code change event arrives via Socket.IO, we update the editor value programmatically and set an internal origin flag (`isInternalChange = true`). The editor's `onChange` listener inspects this flag and suppresses outgoing socket emits for updates that originated from the server.

**Q2: How is McCabe's Cyclomatic Complexity calculated mathematically?**  
*Answer:* McCabe's formula is $M = E - N + 2P$, where $E$ is edges in the control-flow graph, $N$ is nodes, and $P$ is connected components ($P=1$ for a single program). In code parsing, this equals $1$ plus the count of decision branch points (`if`, `else if`, `for`, `while`, `case`, `catch`, `&&`, `||`, ternary `? :`).

**Q3: How does the Defect Prediction model work?**  
*Answer:* It extracts structural features: Cyclomatic Complexity ($M$), Halstead Difficulty ($D$), Inverted Maintainability Index ($100 - \text{MI}$), Code Smell count, and Maximum Scope Nesting Depth. These features are weighted according to empirical NASA Software Defect benchmarks to output a calibrated defect risk probability.

**Q4: Why use WebSockets / Socket.IO instead of traditional HTTP REST polling?**  
*Answer:* HTTP polling introduces high latency and unnecessary HTTP header overhead for keystroke synchronization. WebSockets maintain a persistent, full-duplex TCP connection, reducing latency to < 10ms for real-time collaboration.

**Q5: How does the Execution Terminal safely run JavaScript in-browser?**  
*Answer:* The terminal instantiates a scoped execution boundary using dynamic function encapsulation (`new Function(code)`), intercepting `window.console` references into a local telemetry buffer and recording millisecond timing via `performance.now()`.

---

## 📄 License
This project is developed for educational and academic submission purposes under the MIT License.
