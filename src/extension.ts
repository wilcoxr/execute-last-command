import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  console.log('Execute Last Command extension is now active');

  // Create a map to store terminal-specific last commands
  const terminalCommands = new Map<vscode.Terminal, string>();

  // Listen for terminal data
  vscode.window.terminals.forEach((terminal) => {
    terminal.processId.then(() => {
      terminal.sendText('', true);
    });
  });

  // Clean up when terminals are closed
  context.subscriptions.push(
    vscode.window.onDidCloseTerminal((terminal) => {
      terminalCommands.delete(terminal);
    })
  );

  let disposable = vscode.commands.registerCommand(
    'extension.executeLastTerminalCommand',
    async (args: { modifiers: string[] }) => {
      const terminal = vscode.window.activeTerminal;
      if (!terminal) {
        vscode.window.showErrorMessage('No active terminal');
        return;
      }

      try {
        // Get the last command using history
        terminal.sendText('LAST_CMD=$(history 1 | cut -c 8-)');
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Check if Shift was pressed
        const usesMake = args?.modifiers?.includes('shift');
        console.log('Shift pressed:', usesMake);

        // Execute the command
        if (usesMake) {
          terminal.sendText('make $LAST_CMD');
        } else {
          terminal.sendText('$LAST_CMD');
        }

        // Cleanup
        terminal.sendText('unset LAST_CMD');
      } catch (error) {
        vscode.window.showErrorMessage(`Failed to execute command: ${error}`);
      }
    }
  );

  context.subscriptions.push(disposable);
}
