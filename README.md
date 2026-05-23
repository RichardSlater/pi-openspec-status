# pi-openspec-status

A [pi](https://pi.dev) coding agent extension that displays the active OpenSpec change status as a persistent TUI widget above the editor.

## Features

- TODO

## Install

```bash
pi install git:github.com/mattoopie/pi-openspec-status
```

Or with a specific version:

```bash
pi install git:github.com/mattoopie/pi-openspec-status@v0.1.0
```

## Usage

Once installed, the widget appears automatically when you're in a project that has an `openspec/changes/` directory with active change subdirectories.

### Requirements

- A project using [OpenSpec](https://github.com/fission-ai/openspec) with changes in `openspec/changes/`
- Each change directory may contain:
  - `.openspec.yaml` — with a `schema` field (optional, defaults to `"spec-driven"`)
  - `proposal.md`, `design.md`, `tasks.md` — artifacts tracked as "done" when present
  - `specs/` — directory tracked as "done" when non-empty

### Display

TODO

## Development

```bash
# Clone and install dependencies
git clone https://github.com/mattoopie/pi-openspec-status.git
cd pi-openspec-status
npm install

# Test locally with pi
pi -e ./extension/index.ts
```

## License

MIT
