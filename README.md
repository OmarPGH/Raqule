# Raqule 🦝

### A smart code gatherer for LLMs & AI

![latest release](https://img.shields.io/github/v/tag/OmarPGH/Raqule?sort=semver&label=Latest%20Release&color=%2300C853)

![license](https://img.shields.io/github/license/OmarPGH/Raqule?label=License&color=%2300A8FF)

![language](https://img.shields.io/badge/Language-JavaScript%20ES%20Modules-%23EAB308)

![runtime](https://img.shields.io/badge/Runtime-Node.js%20Latest-%23E83B3B)

![raqule downloads](https://img.shields.io/github/downloads/OmarPGH/Raqule/total?color=%23AA00FF&label=Raqule%20Downloads)

---

**Raqule** is a lightweight CLI tool designed for AI models (ChatGPT, Claude, Gemini, etc.) to bundle your entire project's context and code architecture into a single, clean file.

---

### 🗺️ Check Raqule **[Roadmap & Future Plans](./ROADMAP.md)**

---

## 📋 Table of Contents

- [Features](#-features)
- [Built With](#️-built-with)
- [Installation](#-installation)
- [Building from Source (Developers & Termux Users)](#️-building-from-source)
- [How Raqule Runs](#️-how-raqule-runs)
- [Available Flags](#-available-flags)
- [Filtering Files & Folders](#️-filtering-files--folders)
- [Project Config File](#️-project-config-file)
- [Default Ignore List](#-default-ignore-list)
- [Project Structure](#-project-structure)
- [Contributing](#-contributing)
- [License](#️-license)
- [Author](#‍-author)

---

## 🚀 Features

* **Visual Project Tree:** Generates a structured directory tree so LLMs instantly understand your architecture.

* **Smart File Gathering:** Appends all relevant source code files sequentially with code block formatting. Recognized binary files are skipped and represented by a placeholder instead of having their contents read.

* **Fine-Grained Filtering:** Exclude or include files/folders globally, or separately for the tree and the contents.

* **Per-Project Config File:** Optionally sets up a `raqule-config.toml` in your project (you'll be prompted whenever the file is missing) so you can persist custom ignore rules without retyping flags every run.

* **Safe by Default:** Automatically skips secrets (`.env`, `.npmrc`, ...), common dependency lock files, build outputs, and dependency folders.

* **Token Estimation:** Get an estimated token count for the generated output before you paste it into your LLM. The estimate uses OpenAI's `o200k_base` encoding, so counts may differ from the tokenizers used by Claude, Gemini, or other models.

* **Max Tokens Safety Guard:** Set a hard token limit with `-m/--max` — if the output would exceed it, Raqule stops and errors out instead of dumping an oversized file on you.

* **Fast & Lightweight:** Built with pure Node.js asynchronous APIs for maximum speed.

* **Interactive & CLI Ready:** Use interactive prompts or fast flags for quick execution.

---

## 🛠️ Built With

* **[Commander](https://www.npmjs.com/package/commander)** - CLI flag parsing

* **[Inquirer](https://www.npmjs.com/package/@inquirer/prompts)** - Interactive command-line prompts

* **[js-tiktoken](https://www.npmjs.com/package/js-tiktoken)** - Pure JavaScript OpenAI BPE token counting

* **[smol-toml](https://www.npmjs.com/package/smol-toml)** - Fast & lightweight TOML parser and serializer

* **[micromatch](https://www.npmjs.com/package/micromatch)** - Glob pattern matching for filtering files and folders

* **[Zod](https://www.npmjs.com/package/zod)** - Schema validation for configuration parameters

* **[Clipboardy](https://www.npmjs.com/package/clipboardy)** - Cross-platform terminal & Node.js clipboard interface

* **Node.js Native Modules** (`fs`, `path`)

---

## 📦 Installation

Since Raqule is built as a single executable binary, **you don't even need Node.js installed** to run it! Just download the appropriate binary for your OS, add it to your PATH, and you're good to go.

---

### 1. Download the Executable

Head over to the [Releases](../../releases) page and download the latest release for your platform:

| OS | Architecture | File Name |
| :--- | :--- | :--- |
| **Linux** | x64 (Intel/AMD) | `Raqule-vX.Y.Z-linux-x64-release.zip` |
| **Linux** | ARM64 | `Raqule-vX.Y.Z-linux-arm64-release.zip` |
| **macOS** | Apple Silicon (M1/M2/M3/M4) | `Raqule-vX.Y.Z-macos-arm64-release.zip` |
| **Windows** | x64 (Intel/AMD) | `Raqule-vX.Y.Z-win-x64-release.zip` |
| **Windows** | ARM64 | `Raqule-vX.Y.Z-win-arm64-release.zip` |

Each ZIP contains the standalone executable and a copy of `README.md`. **Extract the ZIP first**, then follow the setup steps below.

*(Optional)* You can verify the integrity of the downloaded ZIP files using the provided `SHA256SUMS` file. The checksums are for the ZIP archives, not the extracted executables.

---

### 2. Setup & Add to PATH

To run Raqule seamlessly from **any terminal directory** using the shortcut command `rql` (recommended) or `raqule`, follow the steps for your Operating System below:

<details>
<summary><b>🐧 Linux Setup</b></summary>

1. **Make it executable & rename to `rql`:**
   ```bash
   # Make the file executable
   unzip Raqule-vX.Y.Z-linux-x64-release.zip
   chmod +x Raqule-vX.Y.Z-linux-x64
   # Rename it for easier use
   mv Raqule-vX.Y.Z-linux-x64 rql
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
   unzip Raqule-vX.Y.Z-macos-arm64-release.zip
   chmod +x Raqule-vX.Y.Z-macos-arm64
   # Rename it for easier use
   mv Raqule-vX.Y.Z-macos-arm64 rql
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

1. **Extract the downloaded ZIP** (right-click it and choose **Extract All**, or use PowerShell):
   ```powershell
   Expand-Archive Raqule-vX.Y.Z-win-x64-release.zip
   ```
   *(For Windows ARM64, use the `win-arm64` ZIP name instead.)*
2. **Rename the executable:**
   Rename `Raqule-vX.Y.Z-win-x64.exe` (or `win-arm64.exe`) to `rql.exe`.
3. **Move to a Safe Folder:**
   Create a dedicated folder, for example: `C:\Program Files\Raqule\`, and place `rql.exe` inside it.
4. **Add to System PATH:**
   - Press `Win + R`, type `sysdm.cpl`, and hit Enter.
   - Go to the **Advanced** tab -> click **Environment Variables**.
   - Under **User variables** (or System variables), find **Path** and click **Edit**.
   - Click **New** and add the directory path (e.g., `C:\Program Files\Raqule\`).
   - Click **OK** on all windows.
5. **Restart Terminal:**
   Open a new PowerShell or Command Prompt window. Now you can run `rql` anywhere! 🎯
</details>

---

### 3. Verification

Test your setup in any new terminal window:
```bash
rql --version
```

---

## 🛠️ Building from Source
> **Developers and Termux Users**

Raqule is primarily developed and its release binaries are built with **Node.js 26**, which is the recommended runtime. Some older Node.js versions may also work, but they are not the target environment and compatibility is not guaranteed. You may encounter errors or features that do not work as expected when using an older version.

```bash
# Clone repository
git clone https://github.com/OmarPGH/Raqule.git
cd Raqule
# Install dependencies
npm ci
# Link globally to your local environment
npm link
```
> **📌 Notice**: if you are **termux user**, you need **termux-api** installed for some features like (**clipboard**)

---

## ▶️ How Raqule Runs

Running `rql` always walks through the same interactive flow, regardless of which flags you pass:

1. **Directory prompt** — asks `Your directory path :` (defaults to `./`). There's no flag to pass this non-interactively yet; just hit Enter to accept the default.
2. **Config file prompt** — appears whenever the selected project has no `raqule-config.toml` file (see [Project Config File](#️-project-config-file)). If you decline to create it, you'll be asked again on the next run while the file is still missing.
3. **Output path prompt** — asks `Your output path :` (defaults to `./`), unless you passed `-P`/`--print-only` or `-C`/`--copy-only`.

After that, your flags decide what happens with the gathered content (copy, print, show tokens, write the file). **By default, Raqule saves the result to `raqule-output.md`**; the `-P` and `-C` flags are the options that prevent the output file from being created. See the flag table below.

---

## 🚩 Available Flags

| Flag | Description |
| :--- | :--- |
| `-a, --all` | Don't apply the *default ignore list* (e.g. .git, **.env**, node_modules, target). **Not recommended & Unsafe** |
| `-c, --copy` | Copy the result/output to your clipboard, and also save it to `raqule-output.md` |
| `-C, --copy-only` | Copy the result/output to your clipboard only, without creating `raqule-output.md` |
| `-d, --depth <value>` | Set the maximum folder depth. Accepts a whole number (1 or greater), or `infinity`/`inf`/`max` (case-insensitive) for no limit. Defaults to `Infinity` (no limit) when omitted |
| `-e, --exclude <patterns...>` | Skip these names/patterns in the contents, and do not expand them in the tree |
| `--ce, --content-exclude <patterns...>` | Skip these names/patterns in the contents only |
| `--te, --tree-exclude <patterns...>` | Do not expand these folders in the tree (they are still listed) |
| `-i, --include <patterns...>` | Remove these names/patterns from the ignore list, even if ignored by default or by `-e` |
| `--ci, --content-include <patterns...>` | Same as `--include`, but for the contents only |
| `--ti, --tree-include <patterns...>` | Same as `--include`, but for the tree only |
| `-m, --max <number>` | Set the maximum output tokens (whole number, 1 or greater). Implies `-T` (always shows the token count). If the output exceeds this limit, Raqule throws an error and aborts instead of writing/printing anything |
| `-p, --print` | Print the result in the terminal, and also save it to `raqule-output.md` |
| `-P, --print-only` | Print the result in the terminal only, without creating `raqule-output.md` |
| `-t, --tree` | Generate only the project tree, without file contents |
| `-T, --tokens` | Display estimated total token count for the output |
| `-V, --version` | Output the current version |
| `-h, --help` | Display help information |

**Examples:**
```bash
# Include all ignored files/folders
rql -a
# Gather code with a max depth of 2 levels
rql -d 2
# Skip the docs and tests folders
rql -e docs tests
# Include the dist folder even though it is ignored by default
rql -i dist
# Print the result in the terminal without creating raqule-output.md
rql -P
# Generate project tree structure only
rql -t
# Display estimated total token count for the output
rql -T
# Skip all files inside "src/secrets/" in the contents only (the tree is not affected)
rql --ce "src/secrets/**"
```

---

## 🎛️ Filtering Files & Folders

Raqule matches names/extensions by glob patterns (for example `**/*.test.js` or `src/secrets/**`).

Raqule builds **two separate ignore lists** — one for the tree, one for the contents — each combining your project's [config file](#️-project-config-file), the [default ignore list](#-default-ignore-list) (unless `-a` is used), your general exclude flag (`-e`), and that list's own scoped flag (`--te` for the tree, `--ce` for the contents).

Your include flags then **win**, removing matching names from each list (`-i` removes from both; `--ti`/`--ci` remove from one scope only). So `-i` always beats everything else. 💪

> **Note:** In the tree, an ignored folder is still listed by name, but its children are not expanded (ignored files are always listed). In the contents, ignored files/folders are skipped completely.

> ⚠️ **Shell Warning:** When using glob patterns with `*` directly in your terminal (e.g. `rql -e src/**/*.js`), your shell (Bash/Zsh) might expand the pattern itself *before* Raqule even sees it, causing unexpected results. Always wrap patterns in quotes to be safe:
> ```bash
> rql -e "src/**/*.js"
> ```

---

## ⚙️ Project Config File

Raqule checks the selected project directory for a `raqule-config.toml` file every time you run it. If the file doesn't exist, it'll ask you:

```
Do you want to add a config file : (y/N)
```

Say yes, and it creates one for you with:

```toml
ignore = []
```

This file lets you persist your own ignore patterns for that specific project, so you don't have to retype `-e` flags every single run. Just add names or glob patterns to the `ignore` array:

```toml
ignore = ["docs", "*.test.js", "src/secrets/**"]
```

With the config above, every `rql` run in that project will automatically skip the `docs` folder, any `*.test.js` file, and everything inside `src/secrets/`, on top of the default ignore list — no extra flags needed. 🧠

You can still combine it with CLI flags: the config file's ignore list, the default list, and your `-e` flags all merge together, and `-i` can still remove any of them — see [Filtering Files & Folders](#️-filtering-files--folders) above.

> **Tip:** Commit `raqule-config.toml` to your repo so teammates get the same ignore rules automatically.

---

## 🙈 Default Ignore List

Unless you pass `-a`, Raqule skips the following names/patterns, grouped by ecosystem:

| Group | Ignored names/patterns |
| :--- | :--- |
| **Version control** | `.git`, `.svn`, `.hg` |
| **JavaScript / Node** | `node_modules`, `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, `.npm`, `dist`, `build`, `coverage`, `.next`, `.nuxt`, `.output`, `.turbo`, `.cache`, `*.tsbuildinfo`, `*.log`, `npm-debug.log*`, `yarn-debug.log*`, `yarn-error.log*` |
| **Secrets & credentials** | `.env*` (see note below), `.npmrc`, `.pypirc`, `.netrc` |
| **Cloud & infra** | `.aws`, `.azure`, `.gcloud`, `.kube`, `.terraform`, `*.tfstate`, `*.tfstate.*` |
| **Rust** | `target`, `Cargo.lock` |
| **Python** | `__pycache__`, `*.pyc`, `.venv`, `venv`, `.pytest_cache`, `.mypy_cache`, `.ruff_cache`, `.tox`, `*.egg-info` |
| **Java** | `.gradle`, `.idea`, `*.class`, `*.jar` |
| **Go** | `vendor` |
| **.NET** | `obj`, `*.user` |
| **C / C++** | `CMakeFiles`, `cmake-build-debug`, `cmake-build-release`, `*.o`, `*.obj` |
| **Dart / Flutter** | `.dart_tool`, `.pub-cache`, `*.g.dart` |
| **Ruby** | `.bundle` |
| **Swift** | `DerivedData`, `*.xcuserstate` |
| **OS junk & editor files** | `.DS_Store`, `Thumbs.db`, `*.swp`, `*.swo`, `*~` |
| **Raqule itself** | `raqule-output.md` (so Raqule never re-ingests its own output on the next run) |

> **Note:** The default list includes common dependency lock files such as `package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`, `bun.lockb`, and `Cargo.lock`; it does not automatically ignore every lock-file format.
>
> `.env*` ignores every `.env`-style file (`.env`, `.env.local`, `.env.production`, ...) **except** `.env.example` and `.env.sample`, which are kept since they rarely hold real secrets.

Also, `LICENSE`, `LICENSE.md`, and `LICENSE.txt` files are shortened to their first 3 lines so they don't waste your LLM's context (other extensions, like `LICENSE.json`, are left untouched). 🧠

---

## 📂 Project Structure

```
Raqule
├── .git/
├── .github/
│   ├── dependabot.yml
│   └── workflows/
│       ├── release.yml
│       └── semgrep.yml
├── .gitignore
├── CONTRIBUTING.md
├── LICENSE
├── README.md
├── ROADMAP.md
├── bin/
│   └── cli.js
├── node_modules/
├── package-lock.json
├── package.json
├── raqule-config.toml
├── src/
│   ├── config/
│   │   ├── config.js
│   │   ├── formatConfigErrors.js
│   │   ├── index.js
│   │   ├── io.js
│   │   └── validation.js
│   ├── core/
│   │   ├── gather.js
│   │   ├── index.js
│   │   └── tree.js
│   ├── helpers/
│   │   ├── index.js
│   │   └── specialFiles.js
│   ├── ignore/
│   │   ├── defaultList.js
│   │   ├── index.js
│   │   ├── patterns.js
│   │   └── resolver.js
│   ├── input/
│   │   ├── flags.js
│   │   ├── index.js
│   │   └── prompts.js
│   ├── main.js
│   ├── shared/
│   │   ├── constants.js
│   │   └── index.js
│   ├── utils/
│   │   ├── clipboard.js
│   │   ├── format.js
│   │   ├── index.js
│   │   └── tokens.js
│   └── validation/
│       ├── directory.js
│       └── index.js
└── test/
    ├── helpers/
    │   └── specialFiles.test.js
    ├── ignore/
    │   └── resolver.test.js
    ├── utils/
    │   ├── format.test.js
    │   └── tokens.test.js
    └── validation/
        └── directory.test.js
```

- **`utils/`** — standalone features (clipboard, tokens).
- **`helpers/`** — small secondary modules, not a feature on their own.
- **`shared/`** — cross-cutting values everyone uses but nobody **"owns"** (constants).

> **For contributors:** `src/main.js` runs the whole flow as an ordered list of small steps, so adding a new behavior usually means adding one more step rather than editing existing logic.

> **Note:** `raqule-config.toml` is created only if you accept the prompt; if it remains absent, Raqule asks again on the next run inside that project — see [Project Config File](#️-project-config-file).

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) first. The short version:

* Make precise, line-by-line edits (no full file overwrites).
* Keep your code simple and readable (no over-engineering).
* Reply to review comments quickly, and apply requested changes within 2 days.

---

## ⚖️ License

This project is licensed under the **Apache-2.0**. See the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Omar Gamal** - Creator and Maintainer
