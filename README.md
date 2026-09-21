# Raqule 🦝

### A smart code gatherer for LLMs & AI

![latest release](https://img.shields.io/github/v/tag/OmarPGH/Raqule?sort=semver&label=Latest%20Release&color=brightgreen)

![license](https://img.shields.io/github/license/OmarPGH/Raqule?label=License&color=yellow)

![language](https://img.shields.io/badge/Language-JavaScript%20ES%20Module-blue)

![raqule downloads](https://img.shields.io/github/downloads/OmarPGH/Raqule/total?color=red&label=Raqule%20Downloads)

---

**Raqule** is a lightweight CLI tool designed for AI models (ChatGPT, Claude, Gemini, etc.) to bundle your entire project's context and code architecture into a single, clean file.

---

## Table of Contents

- [Features](#-features)
- [Built With](#%EF%B8%8F-built-with)
- [Installation](#-installation)
- [Building from Source (Developers)](#%EF%B8%8F-building-from-source-developers)
- [Available Flags](#-available-flags)
- [Filtering Files & Folders](#%EF%B8%8F-filtering-files--folders)
- [Default Ignore List](#-default-ignore-list)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#%EF%B8%8F-license)
- [Author](#%E2%80%8D-author)

---

## 🚀 Features

* **Visual Project Tree:** Generates a structured directory tree so LLMs instantly understand your architecture.

* **Smart File Gathering:** Appends all relevant source code files sequentially with code block formatting.

* **Fine-Grained Filtering:** Exclude or include files/folders globally, or separately for the tree and the contents.

* **Safe by Default:** Automatically skips secrets (`.env`, `.npmrc`, ...), lock files, build outputs, and dependency folders.

* **Fast & Lightweight:** Built with pure Node.js asynchronous APIs for maximum speed.

* **Interactive & CLI Ready:** Use interactive prompts or fast flags for quick execution.

---

## 🛠️ Built With

* **[Commander](https://www.npmjs.com/package/commander)** - CLI flag parsing

* **[Inquirer](https://www.npmjs.com/package/@inquirer/prompts)** - Interactive command-line prompts

* **Node.js Native Modules** (`fs`, `path`)

---

## 📦 Installation

Since Raqule is built as a single executable binary, **you don't even need Node.js installed** to run it! Just download the appropriate binary for your OS, add it to your PATH, and you're good to go.

---

### 1. Download the Executable

Head over to the [Releases](../../releases) page and download the latest release for your platform:

| OS | Architecture | File Name |
| :--- | :--- | :--- |
| **Linux** | x64 (Intel/AMD) | `Raqule-vX.Y.Z-linux-x64` |
| **Linux** | ARM64 | `Raqule-vX.Y.Z-linux-arm64` |
| **macOS** | Apple Silicon (M1/M2/M3/M4) | `Raqule-vX.Y.Z-macos-arm64` |
| **Windows** | x64 (Intel/AMD) | `Raqule-vX.Y.Z-win-x64.exe` |
| **Windows** | ARM64 | `Raqule-vX.Y.Z-win-arm64.exe` |

*(Optional)* You can verify the integrity of your downloaded binary using the provided `SHA256SUMS` file.

---

### 2. Setup & Add to PATH

To run Raqule seamlessly from **any terminal directory** using the shortcut command `rql` (recommended) or `raqule`, follow the steps for your Operating System below:

<details>
<summary><b>🐧 Linux Setup</b></summary>

1. **Make it executable & rename to `rql`:**
   ```bash
   # Make the file executable
   chmod +x Raqule-*-linux-*
   # Rename it for easier use
   mv Raqule-*-linux-* rql
   ```
2. **Move to system PATH (Recommended):**
   ```bash
   sudo mv rql /usr/local/bin/
   ```

Now you can run `rql` anywhere! 🎯
</details>

<details>
<summary><b>🍎 macOS Setup</b></summary>

1. **Make it executable & rename to `rql`:**
   ```bash
   # Make the file executable
   chmod +x Raqule-*-macos-arm64
   # Rename it for easier use
   mv Raqule-*-macos-arm64 rql
   ```
2. **Move to system PATH (Recommended):**
   ```bash
   sudo mv rql /usr/local/bin/
   ```
3. **Allow Gatekeeper (If Prompted):**
   If macOS blocks the binary on first execution, run:
   ```bash
   xattr -d com.apple.quarantine /usr/local/bin/rql
   ```

Now you can run `rql` anywhere! 🎯
</details>

<details>
<summary><b>🪟 Windows Setup</b></summary>

1. **Rename the File:**
   Rename `Raqule-vX.Y.Z-win-x64.exe` (or `win-arm64`) to `rql.exe`.
2. **Move to a Safe Folder:**
   Create a dedicated folder, for example: `C:\Program Files\Raqule\`, and place `rql.exe` inside it.
3. **Add to System PATH:**
   - Press `Win + R`, type `sysdm.cpl`, and hit Enter.
   - Go to the **Advanced** tab -> click **Environment Variables**.
   - Under **User variables** (or System variables), find **Path** and click **Edit**.
   - Click **New** and add the directory path (e.g., `C:\Program Files\Raqule\`).
   - Click **OK** on all windows.
4. **Restart Terminal:**
   Open a new PowerShell or Command Prompt window. Now you can run `rql` anywhere! 🎯
</details>

---

### 3. Verification

Test your setup in any new terminal window:
```bash
rql --version
```

---

## 🛠️ Building from Source (Developers)

If you prefer installing from source code using Node.js & NPM (a recent Node.js version is required, the release binaries are built with Node.js 26):
```bash
# Clone repository
git clone https://github.com/OmarPGH/Raqule.git
cd Raqule
# Install dependencies
npm ci
# Link globally to your local environment
npm link
```

---

## 🚩 Available Flags

| Flag | Description |
| :--- | :--- |
| `-d, --depth <number>` | Set the maximum folder depth (whole number, 1 or greater) |
| `-a, --all` | Do not apply the default ignore list (e.g. .git, node_modules, target). **Not Recommended** |
| `-e, --exclude <names...>` | Skip these names in the contents, and do not expand them in the tree |
| `--ce, --content-exclude <names...>` | Skip these names in the contents only |
| `--te, --tree-exclude <names...>` | Do not expand these folders in the tree (they are still listed) |
| `-i, --include <names...>` | Remove these names from the ignore list, even if ignored by default or by `-e` |
| `--ci, --content-include <names...>` | Same as `--include`, but for the contents only |
| `--ti, --tree-include <names...>` | Same as `--include`, but for the tree only |
| `-t, --tree` | Generate only the project tree, without file contents |
| `-p, --print` | Print the result in the terminal, and also save it to `context.md` |
| `-P, --print-only` | Print the result in the terminal only, without creating `context.md` |
| `-V, --version` | Output the current version |
| `-h, --help` | Display help information |

**Examples:**
```bash
# Gather code with a max depth of 2 levels
rql -d 2
# Include all ignored files/folders
rql -a
# Generate project tree structure only
rql -t
# Skip the docs and tests folders
rql -e docs tests
# Include the dist folder even though it is ignored by default
rql -i dist
# Skip "assets" in the contents only (the tree is not affected)
rql --ce assets
# Print the result in the terminal without creating context.md
rql -P
```

---

## 🎛️ Filtering Files & Folders

Raqule matches names **exactly** (for example `node_modules` or `README.md`), not glob patterns.

The filtering order is:

1. The [default ignore list](#-default-ignore-list) is applied (unless `-a` is used).
2. Your exclude flags are added (`-e`, plus `--ce` for contents or `--te` for the tree).
3. Your include flags **win** and remove matching names from the ignored list (`-i`, plus `--ci` or `--ti`).

So `-i` always beats `-e`, and both beat the defaults. 💪

> **Note:** In the tree, an ignored folder is still listed by name, but its children are not expanded (ignored files are always listed). In the contents, ignored files/folders are skipped completely.

---

## 🙈 Default Ignore List

Unless you pass `-a`, Raqule skips the following names:

* **Version control:** `.git`, `.svn`, `.hg`
* **Dependencies & builds:** `node_modules`, `dist`, `build`, `coverage`, `target`, `vendor`, `out`, `bin`, `obj`, `.next`, `.nuxt`, `.output`, `.turbo`, `.cache`
* **Lock files:** `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `Cargo.lock`
* **Secrets & credentials:** `.env` (and variants), `.npmrc`, `.pypirc`, `.netrc`, `.aws`, `.azure`, `.gcloud`, `.kube`
* **Language & tool caches:** `__pycache__`, `.venv`, `venv`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.gradle`, `.idea`, `.dart_tool`, `.pub-cache`, `.bundle`, `DerivedData`, `CMakeFiles`, and more
* **OS junk:** `.DS_Store`, `Thumbs.db`

Also, `LICENSE` files are shortened to their first 3 lines so they don't waste your LLM's context. 🧠

---

## 📂 Project Structure
Generated by Raqule:
```
Raqule
├── .git/
├── .github/
│   └── workflows/
│       ├── release.yml
│       └── semgrep.yml
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── bin/
│   └── cli.js
├── node_modules/
├── package-lock.json
├── package.json
└── src/
    ├── flags.js
    ├── format.js
    ├── gather.js
    ├── helpers/
    │   └── ignore.js
    ├── ignoreList.js
    ├── index.js
    ├── packageInfo.js
    ├── prompts.js
    ├── specialFiles.js
    ├── tree.js
    └── write.js
```

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. The short version:

* Make precise, line-by-line edits (no full file overwrites).
* Keep your code simple and readable (no over-engineering).
* Reply to review comments quickly, and apply requested changes within 2 days.

---

## ⚖️ License
This project is licensed under the **Apache-2.0**. See the LICENSE file for details.

---

## 👨‍💻 Author
**Omar Gamal** - Creator and Maintainer
