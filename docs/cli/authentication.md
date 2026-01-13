# Authentication Setup

Perplexity CLI uses API key authentication to access Perplexity AI's Sonar models.

## Perplexity API Key (Required)

To use Perplexity CLI, you need a Perplexity API key:

1. Get your API key from [Perplexity API Settings](https://www.perplexity.ai/settings/api)
2. Configure the key using one of the methods below

### Configuration Methods

#### 1. Environment Variable (Recommended)

```bash
export PERPLEXITY_API_KEY="your_api_key_here"
```

#### 2. Project `.env` File

Create a `.env` file in your project root:

```env
PERPLEXITY_API_KEY=your_api_key_here
```

#### 3. Enter after running interactive mode

## Managing Your API Key

To update or reconfigure your API key during a session, use the `/auth` command:

```bash
# Within the CLI, type:
/auth
```

To log out and clear your saved API key:

```bash
# Within the CLI, type:
/logout
```

### Persisting Environment Variables with `.env` Files

You can create a **`.perplexity/.env`** file in your project directory or in your home directory. Creating a plain **`.env`** file also works, but `.perplexity/.env` is recommended to keep Perplexity CLI variables isolated from other tools.

**Important:** Some environment variables (like `DEBUG` and `DEBUG_MODE`) are automatically excluded from project `.env` files to prevent interference with perplexity-cli behavior. Use `.perplexity/.env` files for perplexity-cli specific variables.

Perplexity CLI automatically loads environment variables from the **first** `.env` file it finds, using the following search order:

1. Starting in the **current directory** and moving upward toward `/`, for each directory it checks:
   1. `.perplexity/.env`
   2. `.env`
2. If no file is found, it falls back to your **home directory**:
   - `~/.perplexity/.env`
   - `~/.env`

> **Important:** The search stops at the **first** file encountered—variables are **not merged** across multiple files.

#### Examples

**Project-specific configuration:**

```bash
mkdir -p .perplexity
cat >> .perplexity/.env <<'EOF'
PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxx"
EOF
```

**User-wide settings** (available in every directory):

```bash
mkdir -p ~/.perplexity
cat >> ~/.perplexity/.env <<'EOF'
PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxx"
EOF
```

## Non-Interactive Mode / Headless Environments

When running Perplexity CLI in a non-interactive environment (scripts, CI/CD pipelines, etc.), you must configure authentication using environment variables.

Set the `PERPLEXITY_API_KEY` environment variable:

```bash
export PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxx"
perplexity -p "Your prompt here"
```

If the API key is not set in a non-interactive session, the CLI will exit with an error.

For comprehensive guidance on using Perplexity CLI programmatically and in automation workflows, see the [Headless Mode Guide](../headless.md).
