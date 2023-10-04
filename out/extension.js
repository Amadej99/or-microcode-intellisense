"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = void 0;
const vscode = require("vscode");
const microcode = require("./completions/microcode.json");
const microcodeCommands = microcode.commands.map((command) => {
    return command.command;
});
function getCommandArguments(commandName) {
    const command = microcode.commands.find((c) => c.command === commandName);
    return command ? command.args : undefined;
}
function activate(context) {
    const provider1 = vscode.languages.registerCompletionItemProvider("plaintext", {
        provideCompletionItems(document, position, token, context) {
            // a simple completion item which inserts `Hello World!`
            const simpleCompletion = new vscode.CompletionItem("Hello World!");
            // a completion item that inserts its text as snippet,
            // the `insertText`-property is a `SnippetString` which will be
            // honored by the editor.
            const snippetCompletion = new vscode.CompletionItem("Good part of the day");
            snippetCompletion.insertText = new vscode.SnippetString("Good ${1|morning,afternoon,evening|}. It is ${1}, right?");
            const docs = new vscode.MarkdownString("Inserts a snippet that lets you select [link](x.ts).");
            snippetCompletion.documentation = docs;
            docs.baseUri = vscode.Uri.parse("http://example.com/a/b/c/");
            // a completion item that can be accepted by a commit character,
            // the `commitCharacters`-property is set which means that the completion will
            // be inserted and then the character will be typed.
            const commitCharacterCompletion = new vscode.CompletionItem("console");
            commitCharacterCompletion.commitCharacters = ["."];
            commitCharacterCompletion.documentation = new vscode.MarkdownString("Press `.` to get `console.`");
            // a completion item that retriggers IntelliSense when being accepted,
            // the `command`-property is set which the editor will execute after
            // completion has been inserted. Also, the `insertText` is set so that
            // a space is inserted after `new`
            const commandCompletion = new vscode.CompletionItem("new");
            commandCompletion.kind = vscode.CompletionItemKind.Keyword;
            commandCompletion.insertText = "new ";
            commandCompletion.command = {
                command: "editor.action.triggerSuggest",
                title: "Re-trigger completions...",
            };
            const completionItems = microcode.commands.map((command) => {
                const completionItem = new vscode.CompletionItem(command.command, vscode.CompletionItemKind.Method);
                completionItem.detail = command.description;
                return completionItem;
            });
            // return all completion items as array
            return completionItems;
        },
    });
    const provider2 = vscode.languages.registerCompletionItemProvider("plaintext", {
        provideCompletionItems(document, position) {
            // get all text until the `position` and check if it reads `console.`
            // and if so then complete if `log`, `warn`, and `error`
            const linePrefix = document
                .lineAt(position)
                .text.slice(0, position.character);
            for (const command of microcodeCommands) {
                if (linePrefix.endsWith(command + "=")) {
                    console.log("command: " + command);
                    break;
                }
                return undefined;
            }
            const commandArguments = getCommandArguments(linePrefix.slice(0, -1));
            const completionItems = commandArguments?.map((arg) => {
                const completionItem = new vscode.CompletionItem(arg.arg, vscode.CompletionItemKind.Method);
                completionItem.detail = arg.description;
                return completionItem;
            });
            return completionItems;
        },
    }, "=" // triggered whenever a '=' is being typed
    );
    context.subscriptions.push(provider1, provider2);
}
exports.activate = activate;
//# sourceMappingURL=extension.js.map