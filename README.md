# Raqule 🦝

### A smart code gatherer for LLMs & AI

![Version](https://img.shields.io/badge/version-0.0.1--beta.1-blue)
![License](https://img.shields.io/badge/license-Apache--2.0-green)
![Language](https://img.shields.io/badge/language-JavaScript%20ES%20Module-yellow)
![Status](https://img.shields.io/badge/status-Work%20In%20Progress-orange)

---

**Raqule** is a lightweight CLI tool designed for AI models (ChatGPT, Claude, Gemini, etc.) to bundle your entire project's context and code architecture into a single, clean file.

---

## Table of Contents

- [Features](#features)
- [Built With](#built-with)
- [Quick Installation](#quick-installation)
- [Usage](#usage)
- [Available Flags](#available-flags)
- [Project Structure](#project-structure)
- [License](#license)
- [Author](#author)

---

## 🚀 Features

* **Visual Project Tree:** Generates a structured directory tree so LLMs instantly understand your architecture.
* **Smart File Gathering:** Appends all relevant source code files sequentially with code block formatting.
* **Fast & Lightweight:** Built with pure Node.js asynchronous APIs for maximum speed.
* **Interactive & CLI Ready:** Use interactive prompts or fast flags for quick execution.

---

## 🛠️ Built With

* **[Commander](https://www.npmjs.com/package/commander)** - CLI flag parsing
* **[Inquirer](https://www.npmjs.com/package/@inquirer/prompts)** - Interactive command-line prompts
* **Node.js Native Modules** (`fs`, `path`)

---

## 🚚 Requirements

Node.js, NPM

---

## 📦 Quick Installation

You can download the source code directly from **GitHub Releases** and set it up globally in seconds:

1. **Download & Extract:**
   * Go to [Releases](../../releases) and download the `Source code (zip)`.
   * Extract it anywhere on your machine and open your terminal inside that folder.

2. **Install & Link Globally:**
   ```bash
   # Install dependencies
   npm install

   # Link the package globally
   npm link
   ```

---

## 💻 Usage

Open your terminal in ANY project folder and run:
```bash
rql
```

---

## 🚩 Available Flags

| Flag | Description |
| :---: | :---: |
| `-d, --depth <number>` | Set maximum folder traversal depth |
| `-a, --all` | Include hidden files and ignored folders (e.g., node_modules, .git) |
| `-V, --version` | Output the current version |
| `-h, --help` | Display help information |

Examples :

```bash
# Gather code with a max depth of 2 levels
rql -d 2

# Include all ignored files/folders
rql -a
```

---

## 📂 Project Structure
made with Raqule.

```
Raqule
├── .git
├── .gitignore
├── LICENSE
├── README.md
├── bin
│   └── cli.js
├── node_modules
├── package-lock.json
├── package.json
├── src
│   ├── flags.js
│   ├── gather.js
│   ├── index.js
│   ├── packageInfo.js
│   ├── prompts.js
│   └── tree.js
└── testProject
    ├── README.md
    ├── main.mjs
    └── modules
        ├── moduleOne.js
        └── moduleTwo.js

```

## ⚖️ License

This project is licensed under the **Apache-2.0**. See the LICENSE file for details.

## 👨‍💻 Author

**Omar Gamal** - Creator and Maintainer