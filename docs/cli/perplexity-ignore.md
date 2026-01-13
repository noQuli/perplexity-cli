# Ignoring Files

This document provides an overview of the Perplexity Ignore (`.perplexityignore`) feature of Perplexity CLI.

Perplexity CLI includes the ability to automatically ignore files, similar to `.gitignore` (used by Git). Adding paths to your `.perplexityignore` file will exclude them from tools that support this feature, although they will still be visible to other services (such as Git).

## How it works

When you add a path to your `.perplexityignore` file, tools that respect this file will exclude matching files and directories from their operations. For example, when you use the [`read_many_files`](./tools/multi-file.md) command, any paths in your `.perplexityignore` file will be automatically excluded.

For the most part, `.perplexityignore` follows the conventions of `.gitignore` files:

- Blank lines and lines starting with `#` are ignored.
- Standard glob patterns are supported (such as `*`, `?`, and `[]`).
- Putting a `/` at the end will only match directories.
- Putting a `/` at the beginning anchors the path relative to the `.perplexityignore` file.
- `!` negates a pattern.

You can update your `.perplexityignore` file at any time. To apply the changes, you must restart your Perplexity CLI session.

## How to use `.perplexityignore`

To enable `.perplexityignore`:

1. Create a file named `.perplexityignore` in the root of your project directory.

To add a file or directory to `.perplexityignore`:

1. Open your `.perplexityignore` file.
2. Add the path or file you want to ignore, for example: `/archive/` or `apikeys.txt`.

### `.perplexityignore` examples

You can use `.perplexityignore` to ignore directories and files:

```
# Exclude your /packages/ directory and all subdirectories
/packages/

# Exclude your apikeys.txt file
apikeys.txt
```

You can use wildcards in your `.perplexityignore` file with `*`:

```
# Exclude all .md files
*.md
```

Finally, you can exclude files and directories from exclusion with `!`:

```
# Exclude all .md files except README.md
*.md
!README.md
```

To remove paths from your `.perplexityignore` file, delete the relevant lines.
