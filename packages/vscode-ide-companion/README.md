# Perplexity CLI Companion

A VS Code extension that enables Perplexity CLI with direct access to your IDE workspace.

## Features

- Direct integration between Perplexity CLI and VS Code
- Diff view support for file modifications
- Workspace context awareness
- Real-time file tracking

## Installation

The extension can be installed from the VS Code Marketplace or built locally.

### Building Locally

1. Install dependencies:

   ```bash
   npm install
   ```

2. Build the extension:

   ```bash
   npm run build
   ```

3. Package the extension:
   ```bash
   npm run package
   ```

## Usage

Once installed, the extension will automatically activate when VS Code starts. You can:

1. Run Perplexity CLI from the command palette: `Perplexity CLI: Run`
2. Accept or cancel diff views using keyboard shortcuts or the command palette
3. View third-party notices: `Perplexity CLI: View Third-Party Notices`

## Commands

- `Perplexity CLI: Run` - Start Perplexity CLI in the current workspace
- `Perplexity CLI: Accept Diff` - Accept changes in a diff view
- `Perplexity CLI: Close Diff Editor` - Close the current diff view
- `Perplexity CLI: View Third-Party Notices` - View third-party license notices

## Keyboard Shortcuts

- `Ctrl+S` / `Cmd+S` - Accept diff changes (when diff is visible)

## Configuration

- `perplexity-cli.debug.logging.enabled` - Enable detailed logging for debugging

## License

Apache-2.0
