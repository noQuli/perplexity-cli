# Perplexity CLI Execution and Deployment

This document describes how to run Perplexity CLI and explains the deployment architecture that Perplexity CLI uses.

## Running Perplexity CLI

There are several ways to run Perplexity CLI. The option you choose depends on how you intend to use it.

---

### 1. Standard installation (Recommended for typical users)

This is the recommended way for end-users to install Perplexity CLI. It involves downloading the Perplexity CLI package from the NPM registry.

- **Global install:**

  ```bash
  npm install -g @perplexity-cli/perplexity-cli
  ```

  Then, run the CLI from anywhere:

  ```bash
  perplexity
  ```

- **NPX execution:**

  ```bash
  # Execute the latest version from NPM without a global install
  npx @perplexity-cli/perplexity-cli
  ```

---

### 2. Running in a sandbox (Docker/Podman)

For security and isolation, Perplexity CLI can be run inside a container. This is the default way that the CLI executes tools that might have side effects.

- **Directly from the Registry:**
  You can run the published sandbox image directly. This is useful for environments where you only have Docker and want to run the CLI.
  ```bash
  # Run the published sandbox image
  docker run --rm -it ghcr.io/perplexitylm/perplexity-cli:0.0.11
  ```
- **Using the `--sandbox` flag:**
  If you have Perplexity CLI installed locally (using the standard installation described above), you can instruct it to run inside the sandbox container.
  ```bash
  perplexity --sandbox -y -p "your prompt here"
  ```

---

### 3. Running from source (Recommended for Perplexity CLI contributors)

Contributors to the project will want to run the CLI directly from the source code.

- **Development Mode:**
  This method provides hot-reloading and is useful for active development.
  ```bash
  # From the root of the repository
  npm run start
  ```
- **Production-like mode (Linked package):**
  This method simulates a global installation by linking your local package. It's useful for testing a local build in a production workflow.

  ```bash
  # Link the local cli package to your global node_modules
  npm link packages/cli

  # Now you can run your local version using the `perplexity` command
  perplexity
  ```

---

### 4. Running the latest Perplexity CLI commit from GitHub

You can run the most recently committed version of Perplexity CLI directly from the GitHub repository. This is useful for testing features still in development.

```bash
# Execute the CLI directly from the main branch on GitHub
npx https://github.com/NoQuli/perplexity-cli
```

## Deployment architecture

The execution methods described above are made possible by the following architectural components and processes:

**NPM packages**

Perplexity CLI project is a monorepo that publishes core packages to the NPM registry:

- `@perplexity-cli/perplexity-cli-core`: The backend, handling logic and tool execution.
- `@perplexity-cli/perplexity-cli`: The user-facing frontend.

These packages are used when performing the standard installation and when running Perplexity CLI from the source.

**Build and packaging processes**

There are two distinct build processes used, depending on the distribution channel:

- **NPM publication:** For publishing to the NPM registry, the TypeScript source code in `@perplexity-cli/perplexity-cli-core` and `@perplexity-cli/perplexity-cli` is transpiled into standard JavaScript using the TypeScript Compiler (`tsc`). The resulting `dist/` directory is what gets published in the NPM package. This is a standard approach for TypeScript libraries.

- **GitHub `npx` execution:** When running the latest version of Perplexity CLI directly from GitHub, a different process is triggered by the `prepare` script in `package.json`. This script uses `esbuild` to bundle the entire application and its dependencies into a single, self-contained JavaScript file. This bundle is created on-the-fly on the user's machine and is not checked into the repository.

**Docker sandbox image**

The Docker-based execution method is supported by the `perplexity-cli-sandbox` container image. This image is published to a container registry and contains a pre-installed, global version of Perplexity CLI.

## Release process

The release process is automated through GitHub Actions. The release workflow performs the following actions:

1.  Build the NPM packages using `tsc`.
2.  Publish the NPM packages to the artifact registry.
3.  Create GitHub releases with bundled assets.
