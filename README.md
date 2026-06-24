# obsidian-oxfmt

obsidian-oxfmt is an Obsidian plugin that formats files in a vault with the
oxfmt formatter (https://oxc.rs), on save or on demand.

The plugin formats the active file by piping its contents through the oxfmt
command-line program and writing the result back into the editor. Because it
invokes a native executable through Node's child_process, it runs on the
desktop application only; it is not available on Obsidian mobile.

## Requirements

- Obsidian 1.0.0 or later, desktop.
- The oxfmt executable, installed and reachable by the Obsidian process. One
  way to obtain it is mise (https://mise.jdx.dev): `mise use -g oxfmt`.

To build from source you also need aube (https://github.com/jdx/aube) and a
recent Node.js. The development tools are pinned in mise.toml; `mise install`
provides aube, hk, oxlint, and oxfmt.

## Building

    mise install
    aube install
    aube run build

This produces main.js at the repository root.

## Installation

The plugin is currently not distributed through the Obsidian community catalog. Two
methods are available.

### BRAT

BRAT (https://github.com/TfTHacker/obsidian42-brat) installs and updates
plugins from a GitHub repository.

1. Install "BRAT" from Settings, Community plugins, and enable it.
2. Run the command "BRAT: Add a beta plugin for testing".
3. Enter `rtuszik/obsidian-oxfmt` and confirm. To pin a specific release,
   use "BRAT: Add a beta plugin with frozen version based on a release tag"
   instead.
4. Enable obsidian-oxfmt under Settings, Community plugins.

BRAT installs the latest release and keeps it updated.

### Manual

Copy main.js and manifest.json into the vault:

    <vault>/.obsidian/plugins/obsidian-oxfmt/

Then enable obsidian-oxfmt under Settings, Community plugins.

## Usage

With the plugin enabled, the active file is formatted each time Obsidian saves
it. A command, "Format current file with oxfmt", and a ribbon icon format the
active file on demand.

If oxfmt is not on the PATH seen by the Obsidian process, set its absolute
location under Settings, oxfmt, oxfmt binary path.

## Configuration

Settings are available under Settings, oxfmt.

- Format on save. Format the active file when Obsidian saves it. Default on.
- Format on blur. Format a note when navigating away from it. Default off.
- File types. A toggle per supported file type, plus Enable all and Disable
  all. All types are enabled by default.
- oxfmt binary path. Absolute path to oxfmt. Empty resolves oxfmt from PATH.
- Config path. Path to an .oxfmtrc file. Empty lets oxfmt discover one from the
  vault.
- Notify on error. Show a notice when oxfmt fails. Default on.

The supported file types are those the bundled oxfmt accepts on standard input:
Markdown, JavaScript, TypeScript, JSON, YAML, CSS, SCSS, LESS, HTML, GraphQL,
TOML, Vue, and Svelte.

## Disclaimer

obsidian-oxfmt is an independent project. It is not affiliated with, endorsed
by, or sponsored by the oxc project or the authors of oxfmt. It invokes the
separately distributed oxfmt program, which is the work of its own authors
(https://oxc.rs).

## License

obsidian-oxfmt is distributed under the Zero-Clause BSD license. See LICENSE.
