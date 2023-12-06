import * as vscode from "vscode";
import * as microcode from "./completions/microcode.json";

interface Argument {
  arg: string;
  description: string;
}

interface Command {
  command: string;
  unit: string;
  description: string;
  args: { arg: string; description: string }[];
}

const microcodeCommands = microcode.commands.map((command) => {
  return command;
});

function getCommandArguments(commandName: string): Argument[] | undefined {
  const command: Command | undefined = microcodeCommands.find(
    (c) => c.command === commandName
  );
  return command ? command.args : undefined;
}

export function activate(context: vscode.ExtensionContext) {
  const commandCompletions = vscode.languages.registerCompletionItemProvider(
    "plaintext",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        token: vscode.CancellationToken,
        context: vscode.CompletionContext
      ) {
        const completionItems = microcodeCommands.map((command: Command) => {
          const label = command.command + "[" + command.unit + "]";

          const completionItem = new vscode.CompletionItem(
            label,
            vscode.CompletionItemKind.Method
          );

          completionItem.insertText = command.command;

          completionItem.documentation = new vscode.MarkdownString(
            command.description
          );

          completionItem.detail = command.unit;

          return completionItem;
        });

        return completionItems;
      },
    }
  );

  const valueCompletions = vscode.languages.registerCompletionItemProvider(
    "plaintext",
    {
      provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position
      ) {
        const currentLine = document.lineAt(position.line).text;
        const currentWords = currentLine.split(" ");

        const currentPosition =
          vscode.window.activeTextEditor?.selection.active;

        let currentPositionInLoop = 0;
        let currentWord: string = "";
        for (const word of currentWords) {
          currentPositionInLoop += word.length + 1;
          if (currentPosition!.character < currentPositionInLoop) {
            currentWord = word.trim();
            break;
          }
        }

        let matchedCommand = undefined;

        microcodeCommands.map((command: Command) => {
          if (currentWord.endsWith(command.command + "="))
            matchedCommand = command.command;
        });

        if (matchedCommand === undefined) return undefined;

        const commandArguments = getCommandArguments(currentWord.slice(0, -1));

        const completionItems = commandArguments?.map((arg) => {
          const completionItem = new vscode.CompletionItem(
            arg.arg,
            vscode.CompletionItemKind.Method
          );
          completionItem.detail = arg.description;

          return completionItem;
        });

        return completionItems;
      },
    },
    "=" // triggered whenever a '=' is being typed
  );

  const hoverDocumentation = vscode.languages.registerHoverProvider(
    "plaintext",
    {
      provideHover(
        document: vscode.TextDocument,
        position: vscode.Position,
        token
      ) {
        const editor = vscode.window.activeTextEditor;

        let currentWord: string = "";

        if (editor) {
          const wordRange = editor.document.getWordRangeAtPosition(position);

          if (wordRange) {
            currentWord = editor.document.getText(wordRange);
          }
        }

        let matchedCommand: Command | undefined;

        microcodeCommands.map((command: Command) => {
          if (currentWord === command.command) matchedCommand = command;
        });

        if (matchedCommand) {
          return {
            contents: [matchedCommand.description],
          };
        } else {
          return undefined;
        }
      },
    }
  );

  context.subscriptions.push(
    commandCompletions,
    valueCompletions,
    hoverDocumentation
  );
}
