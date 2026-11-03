# Raqule Roadmap 🗺

A glimpse of ongoing work and planned features.

## 🎯 Next Release

- [ ] Expand test coverage.
- [ ] Enhance overall stability.
- [ ] Refine the project architecture.
- [ ] Clarify README examples and documentation.
- [x] Add a `-m` / `--max` flag to set a maximum number of output tokens.
- [x] Add a `-C` / `--copy-only` flag to just copy the result without printing it.

---

## 💡 Future Ideas & Backlog

- Add a `-f` / `--focus` feature to analyze selected files, trace their imports using AST, and aggregate related data.
- Support multiple output formats (`--format json`, `--format markdown`) for easier piping into other tools.
- Add a diff mode to only gather files changed since the last git commit or last run instead of regenerating the full context every time.
- Add a watch mode to run Raqule in the background and auto-regenerate the context file whenever source files change

---

## 🐛 Known Issues & Fixes
- None currently.

---

> 💡 Have a feature request or found a bug? Open an [Issue](../../issues)!

> 📌 This roadmap may change based on feedback and project priorities.
