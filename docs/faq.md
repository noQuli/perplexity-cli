# Frequently asked questions (FAQ)

This page provides answers to common questions and solutions to frequent
problems encountered while using Perplexity CLI.

## General issues

### Why am I getting an `API error: 429 - Resource exhausted`?

This error indicates that you have exceeded your API request limit. The Perplexity
API has rate limits to prevent abuse and ensure fair usage.

To resolve this, you can:

- **Check your usage:** Review your API usage in your Perplexity account dashboard.
- **Optimize your prompts:** If you are making many requests in a short period,
  try to batch your prompts or introduce delays between requests.
- **Request a quota increase:** If you consistently need a higher limit, contact
  Perplexity support to request a quota increase.

### Why am I getting an `ERR_REQUIRE_ESM` error when running `npm run start`?

This error typically occurs in Node.js projects when there is a mismatch between
CommonJS and ES Modules.

This is often due to a misconfiguration in your `package.json` or
`tsconfig.json`. Ensure that:

1.  Your `package.json` has `"type": "module"`.
2.  Your `tsconfig.json` has `"module": "NodeNext"` or a compatible setting in
    the `compilerOptions`.

If the problem persists, try deleting your `node_modules` directory and
`package-lock.json` file, and then run `npm install` again.

### Why don't I see cached token counts in my stats output?

Cached token information is only displayed when cached tokens are being used.
Token caching availability depends on your Perplexity API plan and the model
you're using. You can view your total token usage using the `/stats` command in
Perplexity CLI.

## Installation and updates

### How do I update Perplexity CLI to the latest version?

If you installed it globally via `npm`, update it using the command
`npm install -g @perplexity-cli/perplexity-cli@latest`. If you compiled it from source, pull
the latest changes from the repository, and then rebuild using the command
`npm run build`.

## Platform-specific issues

### Why does the CLI crash on Windows when I run a command like `chmod +x`?

Commands like `chmod` are specific to Unix-like operating systems (Linux,
macOS). They are not available on Windows by default.

To resolve this, you can:

- **Use Windows-equivalent commands:** Instead of `chmod`, you can use `icacls`
  to modify file permissions on Windows.
- **Use a compatibility layer:** Tools like Git Bash or Windows Subsystem for
  Linux (WSL) provide a Unix-like environment on Windows where these commands
  will work.

## Configuration

### What is the best way to store my API keys securely?

Exposing API keys in scripts or checking them into source control is a security
risk.

To store your API keys securely, you can:

- **Use a `.env` file:** Create a `.env` file in your project's `.perplexity`
  directory (`.perplexity/.env`) and store your keys there. Perplexity CLI will
  automatically load these variables.
- **Use your system's keyring:** For the most secure storage, use your operating
  system's secret management tool (like macOS Keychain, Windows Credential
  Manager, or a secret manager on Linux). You can then have your scripts or
  environment load the key from the secure storage at runtime.

### Where are the Perplexity CLI configuration and settings files stored?

The Perplexity CLI configuration is stored in two `settings.json` files:

1.  In your home directory: `~/.perplexity/settings.json`.
2.  In your project's root directory: `./.perplexity/settings.json`.

Refer to [Perplexity CLI Configuration](./cli/configuration.md) for more
details.

## API and usage FAQs

### Where can I learn more about my Perplexity API usage and limits?

To learn more about your Perplexity API usage, quotas, and limits, visit your
[Perplexity account settings](https://www.perplexity.ai/settings/api).

### How do I know if I have higher limits?

If you're subscribed to Perplexity Pro, you may have higher rate limits for API
requests. You can confirm your current limits in your
[API settings](https://www.perplexity.ai/settings/api).

### What is the privacy policy for using Perplexity CLI?

To learn more about Perplexity's privacy policy and terms of service, visit
[Perplexity Privacy Policy](https://www.perplexity.ai/privacy).

### I've upgraded my account but I'm still hitting quota limits. Is this a bug?

Rate limits depend on your specific API plan and are shared across all your
API usage. If you continue to experience issues after upgrading, contact
Perplexity support for assistance.

### Does Perplexity use my data to improve its models?

Perplexity's data usage policies vary by plan. Review the
[Perplexity Privacy Policy](https://www.perplexity.ai/privacy) for detailed
information about how your data is used.

## Not seeing your question?

Search the
[Perplexity CLI discussions on GitHub](https://github.com/NoQuli/perplexity-cli/discussions/categories/q-a)
or
[start a new discussion on GitHub](https://github.com/NoQuli/perplexity-cli/discussions/new?category=q-a)
