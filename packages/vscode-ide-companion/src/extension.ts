/**
 * @license
 * Copyright 2025 Perplexity AI
 * SPDX-License-Identifier: Apache-2.0
 */

import * as vscode from 'vscode';
import { IDEServer } from './ide-server.js';
import { DiffContentProvider, DiffManager } from './diff-manager.js';
import { createLogger } from './utils/logger.js';
import {
  detectIdeFromEnv,
  IDE_DEFINITIONS,
  type IdeInfo,
} from '@perplexity-cli/perplexity-cli-core/src/ide/detect-ide.js';

const CLI_IDE_COMPANION_IDENTIFIER =
  'perplexity.perplexity-cli-vscode-ide-companion';
const INFO_MESSAGE_SHOWN_KEY = 'perplexityCliInfoMessageShown';
export const DIFF_SCHEME = 'perplexity-diff';

/**
 * In these environments the companion extension is installed and managed by the IDE instead of the user.
 */
const MANAGED_EXTENSION_SURFACES: ReadonlySet<IdeInfo['name']> = new Set([
  IDE_DEFINITIONS.firebasestudio.name,
  IDE_DEFINITIONS.cloudshell.name,
]);

let ideServer: IDEServer;
let logger: vscode.OutputChannel;

let log: (message: string) => void = () => {};

async function checkForUpdates(
  context: vscode.ExtensionContext,
  log: (message: string) => void,
  isManagedExtensionSurface: boolean,
) {
  try {
    const currentVersion = context.extension.packageJSON.version;

    // Fetch extension details from the VSCode Marketplace.
    const response = await fetch(
      'https://marketplace.visualstudio.com/_apis/public/gallery/extensionquery',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json;api-version=7.1-preview.1',
        },
        body: JSON.stringify({
          filters: [
            {
              criteria: [
                {
                  filterType: 7, // Corresponds to ExtensionName
                  value: CLI_IDE_COMPANION_IDENTIFIER,
                },
              ],
            },
          ],
          // See: https://learn.microsoft.com/en-us/azure/devops/extend/gallery/apis/hyper-linking?view=azure-devops
          // 946 = IncludeVersions | IncludeFiles | IncludeCategoryAndTags |
          //       IncludeShortDescription | IncludePublisher | IncludeStatistics
          flags: 946,
        }),
      },
    );

    if (!response.ok) {
      log(
        `Failed to fetch latest version info from marketplace: ${response.statusText}`,
      );
      return;
    }

    const data = await response.json();
    const extension = data?.results?.[0]?.extensions?.[0];
    // The versions are sorted by date, so the first one is the latest.
    const latestVersion = extension?.versions?.[0]?.version;

    if (
      !isManagedExtensionSurface &&
      latestVersion &&
      compareVersions(latestVersion, currentVersion) > 0
    ) {
      const selection = await vscode.window.showInformationMessage(
        `A new version (${latestVersion}) of the Perplexity CLI Companion extension is available.`,
        'Update to latest version',
      );
      if (selection === 'Update to latest version') {
        // The install command will update the extension if a newer version is found.
        await vscode.commands.executeCommand(
          'workbench.extensions.installExtension',
          CLI_IDE_COMPANION_IDENTIFIER,
        );
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(`Error checking for extension updates: ${message}`);
  }
}

/**
 * Simple semver comparison: returns positive if a > b, negative if a < b, 0 if equal
 */
function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);
  for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;
    if (numA !== numB) {
      return numA - numB;
    }
  }
  return 0;
}

export async function activate(context: vscode.ExtensionContext) {
  logger = vscode.window.createOutputChannel('Perplexity CLI IDE Companion');
  log = createLogger(context, logger);
  log('Extension activated');

  const isManagedExtensionSurface = MANAGED_EXTENSION_SURFACES.has(
    detectIdeFromEnv().name,
  );

  checkForUpdates(context, log, isManagedExtensionSurface);

  const diffContentProvider = new DiffContentProvider();
  const diffManager = new DiffManager(log, diffContentProvider);

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((doc) => {
      if (doc.uri.scheme === DIFF_SCHEME) {
        diffManager.cancelDiff(doc.uri);
      }
    }),
    vscode.workspace.registerTextDocumentContentProvider(
      DIFF_SCHEME,
      diffContentProvider,
    ),
    (vscode.commands.registerCommand(
      'perplexity.diff.accept',
      (uri?: vscode.Uri) => {
        const docUri = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (docUri && docUri.scheme === DIFF_SCHEME) {
          diffManager.acceptDiff(docUri);
        }
      },
    ),
    vscode.commands.registerCommand(
      'perplexity.diff.cancel',
      (uri?: vscode.Uri) => {
        const docUri = uri ?? vscode.window.activeTextEditor?.document.uri;
        if (docUri && docUri.scheme === DIFF_SCHEME) {
          diffManager.cancelDiff(docUri);
        }
      },
    )),
  );

  ideServer = new IDEServer(log, diffManager);
  try {
    await ideServer.start(context);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`Failed to start IDE server: ${message}`);
  }

  if (
    !context.globalState.get(INFO_MESSAGE_SHOWN_KEY) &&
    !isManagedExtensionSurface
  ) {
    void vscode.window.showInformationMessage(
      'Perplexity CLI Companion extension successfully installed.',
    );
    context.globalState.update(INFO_MESSAGE_SHOWN_KEY, true);
  }

  context.subscriptions.push(
    (vscode.workspace.onDidChangeWorkspaceFolders(() => {
      ideServer.syncEnvVars();
    }),
    vscode.workspace.onDidGrantWorkspaceTrust(() => {
      ideServer.syncEnvVars();
    })),
    vscode.commands.registerCommand(
      'perplexity-cli.runPerplexityCLI',
      async () => {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
          vscode.window.showInformationMessage(
            'No folder open. Please open a folder to run Perplexity CLI.',
          );
          return;
        }

        let selectedFolder: vscode.WorkspaceFolder | undefined;
        if (workspaceFolders.length === 1) {
          selectedFolder = workspaceFolders[0];
        } else {
          selectedFolder = await vscode.window.showWorkspaceFolderPick({
            placeHolder: 'Select a folder to run Perplexity CLI in',
          });
        }

        if (selectedFolder) {
          const perplexityCmd = 'perplexity';
          const terminal = vscode.window.createTerminal({
            name: `Perplexity CLI (${selectedFolder.name})`,
            cwd: selectedFolder.uri.fsPath,
          });
          terminal.show();
          terminal.sendText(perplexityCmd);
        }
      },
    ),
    vscode.commands.registerCommand('perplexity-cli.showNotices', async () => {
      const noticePath = vscode.Uri.joinPath(
        context.extensionUri,
        'NOTICES.txt',
      );
      await vscode.window.showTextDocument(noticePath);
    }),
  );
}

export async function deactivate(): Promise<void> {
  log('Extension deactivated');
  try {
    if (ideServer) {
      await ideServer.stop();
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    log(`Failed to stop IDE server during deactivation: ${message}`);
  } finally {
    if (logger) {
      logger.dispose();
    }
  }
}
