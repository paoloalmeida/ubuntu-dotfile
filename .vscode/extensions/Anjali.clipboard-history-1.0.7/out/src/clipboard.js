'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
const vscode_1 = require("vscode");
function activate(context) {
    let config = vscode_1.workspace.getConfiguration('clipboard');
    let clipboardSize = config.get('size', 12);
    var clipboardArray = [];
    var disposableArray = [];
    // Save all values that are copied to clipboard in array
    function addClipboardItem(editor) {
        let doc = editor.document;
        let sels = editor.selections;
        for (var i = 0; i < sels.length; i++) {
            let line = sels[i].active.line;
            let text = doc.getText(new vscode_1.Range(sels[i].start, sels[i].end));
            if (sels[i].isEmpty) {
                let lineStart = new vscode_1.Position(line, 0);
                let lineEnd = new vscode_1.Position(line, doc.lineAt(line).range.end.character);
                text = doc.getText(new vscode_1.Range(lineStart, lineEnd));
            }
            console.log(clipboardArray.length);
            console.log(clipboardSize);
            clipboardArray.push(text);
            if (clipboardArray.length > clipboardSize) {
                clipboardArray.shift();
            }
        }
    }
    function makeQuickPick(clipboardArray, toBeRemoved) {
        // Create quick pick clipboard items
        var options = { placeHolder: "Clipboard", matchOnDescription: true, matchOnDetail: true };
        var copiedItems = [];
        // Add clear all history option if making removal quick pick
        if (toBeRemoved && clipboardArray.length > 0) {
            copiedItems.push({ label: "", description: "Clear All History" });
        }
        // List clipboard items in order of recency
        for (var i = 0; i < clipboardArray.length; i++) {
            copiedItems.unshift({ label: "", description: clipboardArray[i] });
        }
        return copiedItems;
    }
    function removeQuickPickItem(clipboardArray, item) {
        let index = clipboardArray.indexOf(item.description);
        if (index > -1) {
            clipboardArray.splice(index, 1);
        }
        return clipboardArray;
    }
    function editQuickPickItem(clipboardArray, item, text) {
        let index = clipboardArray.indexOf(item.description);
        if (index > -1) {
            clipboardArray[index] = text;
        }
        return clipboardArray;
    }
    function pasteSelected(item) {
        let activeEditor;
        if (activeEditor = vscode_1.window.activeTextEditor) {
            let text = item.description;
            activeEditor.edit(function (textInserter) {
                textInserter.delete(activeEditor.selection); // Delete anything currently selected
            }).then(function () {
                activeEditor.edit(function (textInserter) {
                    textInserter.insert(activeEditor.selection.start, text); // Insert text from list
                });
            });
        }
    }
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.copy', () => {
        addClipboardItem(vscode_1.window.activeTextEditor);
        vscode_1.commands.executeCommand("editor.action.clipboardCopyAction");
    }));
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.cut', () => {
        addClipboardItem(vscode_1.window.activeTextEditor);
        vscode_1.commands.executeCommand("editor.action.clipboardCutAction");
    }));
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.paste', () => {
        vscode_1.commands.executeCommand("editor.action.clipboardPasteAction");
    }));
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.pasteFromClipboard', () => {
        if (clipboardArray.length == 0) {
            vscode_1.window.setStatusBarMessage("No items in clipboard");
            vscode_1.window.showQuickPick(makeQuickPick(clipboardArray));
            return;
        }
        else {
            vscode_1.window.showQuickPick(makeQuickPick(clipboardArray)).then((item) => { pasteSelected(item); });
        }
    }));
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.removeFromClipboard', () => {
        if (clipboardArray.length == 0) {
            vscode_1.window.setStatusBarMessage("No items in clipboard");
            vscode_1.window.showQuickPick(makeQuickPick(clipboardArray));
            return;
        }
        else {
            let currentQuickPick = makeQuickPick(clipboardArray, true);
            vscode_1.window.showQuickPick(currentQuickPick).then((item) => {
                if (item.description === "Clear All History") {
                    clipboardArray = []; // Clear clipboard history if selected
                    vscode_1.window.setStatusBarMessage("Clipboard history cleared");
                    return;
                }
                else {
                    let removedQuickPick = makeQuickPick(removeQuickPickItem(clipboardArray, item), true);
                    vscode_1.window.setStatusBarMessage("Removed from clipboard");
                }
            });
        }
    }));
    disposableArray.push(vscode_1.commands.registerCommand('clipboard.editClipboard', () => {
        if (clipboardArray.length == 0) {
            vscode_1.window.setStatusBarMessage("No items in clipboard");
            return;
        }
        else {
            let currentQuickPick = makeQuickPick(clipboardArray);
            vscode_1.window.showQuickPick(currentQuickPick).then((item) => {
                let text = item.description;
                vscode_1.window.showInputBox({ value: item.description.toString() })
                    .then(val => {
                    let editedQuickPick = makeQuickPick(editQuickPickItem(clipboardArray, item, val));
                    vscode_1.window.setStatusBarMessage("Edited clipboard item");
                });
            });
        }
    }));
    context.subscriptions.concat(disposableArray);
}
exports.activate = activate;
// Called when extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=clipboard.js.map