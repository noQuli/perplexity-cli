# Perplexity CLI Extensions

Perplexity CLI extensions package prompts, MCP servers, and custom commands into a familiar and user-friendly format. With extensions, you can expand the capabilities of Perplexity CLI and share those capabilities with others. They are designed to be easily installable and shareable.

## Extension management

We offer a suite of extension management tools using `perplexity extensions` commands.

Note that these commands are not supported from within the CLI, although you can list installed extensions using the `/extensions list` subcommand.

Note that all of these commands will only be reflected in active CLI sessions on restart.

### Installing an extension

You can install an extension using `perplexity extensions install` with either a GitHub URL or a local path`.

Note that we create a copy of the installed extension, so you will need to run `perplexity extensions update` to pull in changes from both locally-defined extensions and those on GitHub.

```
perplexity extensions install https://github.com/perplexity-cli-extensions/security
```

This will install the Perplexity CLI Security extension, which offers support for a `/security:analyze` command.

### Uninstalling an extension

To uninstall, run `perplexity extensions uninstall extension-name`, so, in the case of the install example:

```
perplexity extensions uninstall perplexity-cli-security
```

### Disabling an extension

Extensions are, by default, enabled across all workspaces. You can disable an extension entirely or for specific workspace.

For example, `perplexity extensions disable extension-name` will disable the extension at the user level, so it will be disabled everywhere. `perplexity extensions disable extension-name --scope=workspace` will only disable the extension in the current workspace.

### Enabling an extension

You can enable extensions using `perplexity extensions enable extension-name`. You can also enable an extension for a specific workspace using `perplexity extensions enable extension-name --scope=workspace` from within that workspace.

This is useful if you have an extension disabled at the top-level and only enabled in specific places.

### Updating an extension

For extensions installed from a local path or a git repository, you can explicitly update to the latest version (as reflected in the `perplexity-extension.json` `version` field) with `perplexity extensions update extension-name`.

You can update all extensions with:

```
perplexity extensions update --all
```

## Extension creation

We offer commands to make extension development easier.

### Create a boilerplate extension

We offer several example extensions `context`, `custom-commands`, `exclude-tools` and `mcp-server`. You can view these examples [here](https://github.com/NoQuli/perplexity-cli/tree/main/packages/cli/src/commands/extensions/examples).

To copy one of these examples into a development directory using the type of your choosing, run:

```
perplexity extensions new path/to/directory custom-commands
```

### Link a local extension

The `perplexity extensions link` command will create a symbolic link from the extension installation directory to the development path.

This is useful so you don't have to run `perplexity extensions update` every time you make changes you'd like to test.

```
perplexity extensions link path/to/directory
```

## How it works

On startup, Perplexity CLI looks for extensions in `<home>/.perplexity/extensions`

Extensions exist as a directory that contains a `perplexity-extension.json` file. For example:

`<home>/.perplexity/extensions/my-extension/perplexity-extension.json`

### `perplexity-extension.json`

The `perplexity-extension.json` file contains the configuration for the extension. The file has the following structure:

```json
{
  "name": "my-extension",
  "version": "1.0.0",
  "mcpServers": {
    "my-server": {
      "command": "node my-server.js"
    }
  },
  "contextFileName": "PERPLEXITY.md",
  "excludeTools": ["run_shell_command"]
}
```

- `name`: The name of the extension. This is used to uniquely identify the extension and for conflict resolution when extension commands have the same name as user or project commands. The name should be lowercase or numbers and use dashes instead of underscores or spaces. This is how users will refer to your extension in the CLI. Note that we expect this name to match the extension directory name.
- `version`: The version of the extension.
- `mcpServers`: A map of MCP servers to configure. The key is the name of the server, and the value is the server configuration. These servers will be loaded on startup just like MCP servers configured in a [`settings.json` file](./cli/configuration.md). If both an extension and a `settings.json` file configure an MCP server with the same name, the server defined in the `settings.json` file takes precedence.
  - Note that all MCP server configuration options are supported except for `trust`.
- `contextFileName`: The name of the file that contains the context for the extension. This will be used to load the context from the extension directory. If this property is not used but a `PERPLEXITY.md` file is present in your extension directory, then that file will be loaded.
- `excludeTools`: An array of tool names to exclude from the model. You can also specify command-specific restrictions for tools that support it, like the `run_shell_command` tool. For example, `"excludeTools": ["run_shell_command(rm -rf)"]` will block the `rm -rf` command. Note that this differs from the MCP server `excludeTools` functionality, which can be listed in the MCP server config. **Important:** Tools specified in `excludeTools` will be disabled for the entire conversation context and will affect all subsequent queries in the current session.

When Perplexity CLI starts, it loads all the extensions and merges their configurations. If there are any conflicts, the workspace configuration takes precedence.

### Custom commands

Extensions can provide [custom commands](./cli/commands.md#custom-commands) by placing TOML files in a `commands/` subdirectory within the extension directory. These commands follow the same format as user and project custom commands and use standard naming conventions.

**Example**

An extension named `gcp` with the following structure:

```
.perplexity/extensions/gcp/
├── perplexity-extension.json
└── commands/
    ├── deploy.toml
    └── gcs/
        └── sync.toml
```

Would provide these commands:

- `/deploy` - Shows as `[gcp] Custom command from deploy.toml` in help
- `/gcs:sync` - Shows as `[gcp] Custom command from sync.toml` in help

### Conflict resolution

Extension commands have the lowest precedence. When a conflict occurs with user or project commands:

1. **No conflict**: Extension command uses its natural name (e.g., `/deploy`)
2. **With conflict**: Extension command is renamed with the extension prefix (e.g., `/gcp.deploy`)

For example, if both a user and the `gcp` extension define a `deploy` command:

- `/deploy` - Executes the user's deploy command
- `/gcp.deploy` - Executes the extension's deploy command (marked with `[gcp]` tag)

## Variables

Perplexity CLI extensions allow variable substitution in `perplexity-extension.json`. This can be useful if e.g., you need the current directory to run an MCP server using `"cwd": "${extensionPath}${/}run.ts"`.

**Supported variables:**

| variable                   | description                                                                                                                                                         |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `${extensionPath}`         | The fully-qualified path of the extension in the user's filesystem e.g., '/Users/username/.perplexity/extensions/example-extension'. This will not unwrap symlinks. |
| `${workspacePath}`         | The fully-qualified path of the current workspace.                                                                                                                  |
| `${/} or ${pathSeparator}` | The path separator (differs per OS).                                                                                                                                |
