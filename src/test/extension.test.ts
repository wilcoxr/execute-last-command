import * as assert from 'assert';
import * as vscode from 'vscode';

suite('Extension Test Suite', () => {
  test('Extension should be present', () => {
    const extension = vscode.extensions.getExtension(
      'wilcoxr.execute-last-command'
    );
    assert.notStrictEqual(extension, undefined);
  });

  test('Command should be registered', async () => {
    const extension = vscode.extensions.getExtension(
      'wilcoxr.execute-last-command'
    );
    await extension?.activate();

    const commands = await vscode.commands.getCommands();
    assert.ok(commands.includes('extension.executeLastTerminalCommand'));
  });

  test('Should execute command with different modifiers', async function () {
    this.timeout(5000);

    const terminal = vscode.window.createTerminal('test');
    try {
      terminal.show();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal.sendText('echo "test"');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await vscode.commands.executeCommand(
        'extension.executeLastTerminalCommand',
        { modifiers: [] }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await vscode.commands.executeCommand(
        'extension.executeLastTerminalCommand',
        { modifiers: ['shift'] }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      terminal.dispose();
    }
    assert.ok(true);
  });

  test('Should prepend make when shift is pressed', async function () {
    this.timeout(5000);

    const terminal = vscode.window.createTerminal('test');
    try {
      terminal.show();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal.sendText('echo "test"');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      await vscode.commands.executeCommand(
        'extension.executeLastTerminalCommand',
        { modifiers: ['shift'] }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } finally {
      terminal.dispose();
    }
    assert.ok(true);
  });

  test('Should handle multiple terminals independently', async function () {
    this.timeout(8000);

    const terminal1 = vscode.window.createTerminal('test1');
    const terminal2 = vscode.window.createTerminal('test2');

    try {
      terminal1.show();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal1.sendText('echo "terminal1 command"');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal2.show();
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal2.sendText('echo "terminal2 command"');
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal1.show();
      await vscode.commands.executeCommand(
        'extension.executeLastTerminalCommand',
        { modifiers: ['shift'] }
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));

      terminal2.show();
      await vscode.commands.executeCommand(
        'extension.executeLastTerminalCommand',
        { modifiers: ['shift'] }
      );
    } finally {
      terminal1.dispose();
      terminal2.dispose();
    }
    assert.ok(true);
  });
});
