'use strict';
const vscode = require("vscode");
const fs = require("fs");
const path = require("path");
const mkdirp = require("mkdirp");
const lodash_1 = require("lodash");
const gitignoreToGlob = require("gitignore-to-glob");
const glob_1 = require("glob");
const Cache = require("vscode-cache");
function isFolderDescriptor(filepath) {
    return filepath.charAt(filepath.length - 1) === path.sep;
}
function invertGlob(pattern) {
    return pattern.replace(/^!/, '');
}
function walkupGitignores(dir, found = []) {
    const gitignore = path.join(dir, '.gitignore');
    if (fs.existsSync(gitignore))
        found.push(gitignore);
    const parentDir = path.resolve(dir, '..');
    const reachedSystemRoot = dir === parentDir;
    if (!reachedSystemRoot) {
        return walkupGitignores(parentDir, found);
    }
    else {
        return found;
    }
}
function flatten(memo, item) {
    return memo.concat(item);
}
function gitignoreGlobs(root) {
    const gitignoreFiles = walkupGitignores(root);
    return gitignoreFiles.map(gitignoreToGlob).reduce(flatten, []);
}
function configIgnoredGlobs() {
    const configFilesExclude = Object.assign([], vscode.workspace.getConfiguration('advancedNewFile').get('exclude'), vscode.workspace.getConfiguration('files.exclude'));
    const configIgnored = Object.keys(configFilesExclude)
        .filter(key => configFilesExclude[key] === true);
    return gitignoreToGlob(configIgnored.join('\n'), { string: true });
}
function directoriesSync(root) {
    const ignore = gitignoreGlobs(root).concat(configIgnoredGlobs()).map(invertGlob);
    const results = glob_1.sync('**', { cwd: root, ignore })
        .filter(f => fs.statSync(path.join(root, f)).isDirectory())
        .map(f => '/' + f);
    return results;
}
function showQuickPick(choices) {
    return vscode.window.showQuickPick(choices, {
        placeHolder: 'First, select an existing path to create relative to ' +
            '(larger projects may take a moment to load)'
    });
}
exports.showQuickPick = showQuickPick;
function showInputBox(baseDirectory) {
    const resolverArgsCount = 2;
    const resolveRelativePath = lodash_1.curry(path.join, resolverArgsCount)(baseDirectory);
    return vscode.window.showInputBox({
        prompt: `Relative to ${baseDirectory}`,
        placeHolder: 'Filename or relative path to file'
    }).then(resolveRelativePath);
}
exports.showInputBox = showInputBox;
function directories(root) {
    return new Promise((resolve, reject) => {
        const findDirectories = () => {
            try {
                resolve(directoriesSync(root));
            }
            catch (error) {
                reject(error);
            }
        };
        const delayToAllowVSCodeToRender = 1;
        setTimeout(findDirectories, delayToAllowVSCodeToRender);
    });
}
exports.directories = directories;
function toQuickPickItems(choices) {
    return Promise.resolve(choices.map((choice) => {
        return { label: choice, description: null };
    }));
}
exports.toQuickPickItems = toQuickPickItems;
function prependChoice(label, description) {
    return function (choices) {
        if (label) {
            const choice = {
                label: label,
                description: description
            };
            choices.unshift(choice);
        }
        return choices;
    };
}
exports.prependChoice = prependChoice;
function currentEditorPath() {
    const activeEditor = vscode.window.activeTextEditor;
    if (!activeEditor)
        return;
    const currentFilePath = path.dirname(activeEditor.document.fileName);
    const rootMatcher = new RegExp(`^${vscode.workspace.rootPath}`);
    const relativeCurrentFilePath = currentFilePath.replace(rootMatcher, '');
    return relativeCurrentFilePath;
}
exports.currentEditorPath = currentEditorPath;
function createFileOrFolder(absolutePath) {
    let directoryToFile = path.dirname(absolutePath);
    if (!fs.existsSync(absolutePath)) {
        if (isFolderDescriptor(absolutePath)) {
            mkdirp.sync(absolutePath);
        }
        else {
            mkdirp.sync(directoryToFile);
            fs.appendFileSync(absolutePath, '');
        }
    }
    return absolutePath;
}
exports.createFileOrFolder = createFileOrFolder;
function openFile(absolutePath) {
    if (isFolderDescriptor(absolutePath)) {
        vscode.window.showInformationMessage(`Folder created: ${absolutePath}`);
        return Promise.resolve(absolutePath);
    }
    return vscode.workspace.openTextDocument(absolutePath)
        .then((textDocument) => {
        if (textDocument) {
            vscode.window.showTextDocument(textDocument);
            return Promise.resolve(absolutePath);
        }
        else {
            return Promise.reject('Could not open document');
        }
    });
}
exports.openFile = openFile;
function guardNoSelection(selection) {
    if (!selection)
        return Promise.reject('No selection');
    return Promise.resolve(selection);
}
exports.guardNoSelection = guardNoSelection;
function cacheSelection(cache) {
    return function (selection) {
        cache.put('last', selection);
        return selection;
    };
}
exports.cacheSelection = cacheSelection;
function lastSelection(cache) {
    if (!cache.has('last'))
        return;
    return cache.get('last');
}
exports.lastSelection = lastSelection;
function unwrapSelection(selection) {
    if (!selection)
        return;
    return selection.label;
}
exports.unwrapSelection = unwrapSelection;
function activate(context) {
    let disposable = vscode.commands.registerCommand('extension.advancedNewFile', () => {
        const root = vscode.workspace.rootPath;
        if (root) {
            const cache = new Cache(context, `workspace:${root}`);
            const resolverArgsCount = 2;
            const resolveAbsolutePath = lodash_1.curry(path.join, resolverArgsCount)(root);
            const choices = directories(root)
                .then(toQuickPickItems)
                .then(prependChoice('/', '- workspace root'))
                .then(prependChoice(currentEditorPath(), '- current file'))
                .then(prependChoice(lastSelection(cache), '- last selection'));
            return showQuickPick(choices)
                .then(unwrapSelection)
                .then(guardNoSelection)
                .then(cacheSelection(cache))
                .then(showInputBox)
                .then(guardNoSelection)
                .then(resolveAbsolutePath)
                .then(createFileOrFolder)
                .then(openFile)
                .then(lodash_1.noop, lodash_1.noop); // Silently handle rejections for now
        }
        else {
            return vscode.window.showErrorMessage('It doesn\'t look like you have a folder opened in your workspace. ' +
                'Try opening a folder first.');
        }
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
function deactivate() { }
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map