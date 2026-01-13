# Perplexity CLI

Within Perplexity CLI, `packages/cli` is the frontend for users to send and receive prompts with Perplexity AI's Sonar models and their associated tools.

## Navigating this section

- **[Authentication](./authentication.md):** A guide to setting up API key authentication with Perplexity AI.
- **[Commands](./commands.md):** A reference for Perplexity CLI commands (e.g., `/help`, `/tools`, `/theme`).
- **[Configuration](./configuration.md):** A guide to tailoring Perplexity CLI behavior using configuration files.
- **[Themes](./themes.md)**: A guide to customizing the CLI's appearance with different themes.
- **[Keyboard Shortcuts](./keyboard-shortcuts.md)**: A reference for all available keyboard shortcuts.
- **[Tutorials](tutorials.md)**: A tutorial showing how to use Perplexity CLI to automate a development task.

## Non-interactive mode

Perplexity CLI can be run in a non-interactive mode, which is useful for scripting and automation. In this mode, you pipe input to the CLI, it executes the command, and then it exits.

The following example pipes a command to Perplexity CLI from your terminal:

```bash
echo "What is fine tuning?" | perplexity
```

You can also use the `--prompt` or `-p` flag:

```bash
perplexity -p "What is fine tuning?"
```

For comprehensive documentation on headless usage, scripting, automation, and advanced examples, see the **[Headless Mode](../headless.md)** guide.
