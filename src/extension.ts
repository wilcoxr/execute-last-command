import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Execute Last Command extension is now active');

  let disposable = vscode.commands.registerCommand(
    'extension.executeLastTerminalCommand',
    async () => {
      // Get the active terminal or create one if none exists
      let terminal = vscode.window.activeTerminal;
      if (!terminal) {
        terminal = vscode.window.createTerminal('Execute Last Command');
        terminal.show();
        return;
      }

      try {
        // Use a more reliable way to get the last command
        terminal.sendText('if [ -n "$BASH" ]; then');
        terminal.sendText('  LAST_CMD=$(history 1 | cut -c 8-)');
        terminal.sendText('elif [ -n "$ZSH_VERSION" ]; then');
        terminal.sendText('  LAST_CMD=$(history -1 | cut -c 8-)');
        terminal.sendText('fi');

        // Add a small delay to ensure the command is captured
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Execute the Makefile target
        terminal.sendText('if [ -n "$LAST_CMD" ]; then');
        terminal.sendText('  make $LAST_CMD');
        terminal.sendText('  unset LAST_CMD');
        terminal.sendText('else');
        terminal.sendText('  echo "No previous command found"');
        terminal.sendText('fi');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}
