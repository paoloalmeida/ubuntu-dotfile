'use strict';
var vscode_1 = require('vscode');
function default_1(text, editor) {
    editor = editor || vscode_1.window.activeTextEditor;
    if (!editor) {
        return Promise.resolve();
    }
    return new Promise(function (resolve) {
        editor.edit(function (builder) {
            var document = editor.document;
            var lastLine = document.lineAt(document.lineCount - 2);
            var start = new vscode_1.Position(0, 0);
            var end = new vscode_1.Position(document.lineCount - 1, lastLine.text.length);
            builder.replace(new vscode_1.Range(start, end), text);
            resolve();
        });
    });
}
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
//# sourceMappingURL=test.js.map