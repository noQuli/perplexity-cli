# Perplexity API Authentication

Perplexity CLI uses the Perplexity AI API to access Sonar models for AI-powered research and coding assistance.

## Getting Your API Key

1. Visit [Perplexity API Settings](https://www.perplexity.ai/settings/api)
2. Generate a new API key
3. Copy the key (it starts with `pplx-`)

## Authentication Methods

### 1. Environment Variable (Recommended)

Set the `PERPLEXITY_API_KEY` environment variable:

```bash
export PERPLEXITY_API_KEY="pplx-xxxxxxxxxxxx"
```

### 2. Interactive Setup

When you first run the CLI without a configured API key, you'll be prompted to enter it:

```bash
perplexity
# You'll be prompted to enter your API key
```

### 3. Project `.env` File

Create a `.env` file in your project root:

```env
PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxx
```

Or use the Perplexity-specific directory:

```bash
mkdir -p .perplexity
echo 'PERPLEXITY_API_KEY=pplx-xxxxxxxxxxxx' > .perplexity/.env
```

## Available Models

| Model                 | Description                                        |
| --------------------- | -------------------------------------------------- |
| `sonar-pro`           | Most capable model for complex research and coding |
| `sonar`               | Fast and efficient for everyday tasks              |
| `sonar-reasoning-pro` | Advanced reasoning for complex problem solving     |

## Managing Your API Key

### Update API Key

Use the `/auth` command in the CLI to reconfigure your API key:

```bash
/auth
```

### Clear API Key

Use the `/logout` command to clear your saved API key:

```bash
/logout
```

## Security Notes

- **Never commit API keys to version control**
- Add `.env` and `.perplexity/.env` to your `.gitignore`
- API keys are stored securely and not logged
- Use environment variables for CI/CD pipelines

## Troubleshooting

### "API key not found" Error

Ensure your API key is properly set:

```bash
# Check if the variable is set
echo $PERPLEXITY_API_KEY

# Or run the CLI and use /auth to configure
perplexity
```

### "Invalid API key" Error

1. Verify your API key at [Perplexity API Settings](https://www.perplexity.ai/settings/api)
2. Ensure the key starts with `pplx-`
3. Check for extra whitespace or characters

### Rate Limiting

If you encounter rate limiting errors, wait a moment before retrying. For quota information, check the [Perplexity API Documentation](https://docs.perplexity.ai/).
