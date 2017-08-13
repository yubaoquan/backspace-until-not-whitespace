'use babel';

import { CompositeDisposable } from 'atom';
import config from './config';

export default {
    extension: '',
    config: {
        useKeybinding: {
            type: 'boolean',
            default: false,
            description: 'Enable this option to use keybinding to delete whitespaces, otherwise when you type backspace, it will trigger the delete. If enabled, the default keybinding is shift-backspace'
        },
        disabledFileExtensions: {
            type: 'array',
            default: [],
            description: 'Disable this package in above file types'
        },
        multiLineDelete: {
            type: 'boolean',
            default: config.multiLineDelete,
            description: 'Disable this option to only delete in current line'
        }
    },
    observeConfig(configKeys = []) {
        const packageName = 'backspace-until-not-whitespace';
        configKeys.forEach((item) => {
            atom.config.observe(`${packageName}.${item}`, (val) => {
                config[item] = val;
            });
        });
    },
    activate: function() {
        this.subscriptions = new CompositeDisposable();
        this.observeConfig([
            'disabledFileExtensions',
            'multiLineDelete',
            'useKeybinding',
        ]);

        this.currentEditor = atom.workspace.getActiveTextEditor();
        this.registerListener();
        atom.workspace.onDidChangeActivePaneItem((paneItem) => {
            this.currentEditor = paneItem;
            this.registerListener();
        });
    },
    registerListener() {
        const editor = this.currentEditor;
        if (!editor || !editor.getBuffer) {
            return;
        }
        if (!config.useKeybinding) {
            this.buffer = editor.getBuffer();
            this.disposer = this.buffer.onDidChangeText((e) => {
                if (this.isWhitespaceDeleted(e)) {
                    this.lastPressedKey = null;
                    this.deleteWhiteSpaces();
                }
            });
            this.element = atom.views.getView(editor);
            this.element.addEventListener(
                'keydown',
                this.storeLastPressedKey.bind(this)
            );
        } else {
            this.registerCommand();
        }
    },
    registerCommand() {
        this.subscriptions.add(atom.commands.add('atom-text-editor:not([mini])', {
            'backspace-until-not-whitespace:delete-white-spaces': () => this.deleteWhiteSpaces(),
        }));
    },
    deleteWhiteSpaces() {
        this._getFileExtension();
        if (config.disabledFileExtensions.includes(this.extension)) {
            console.info(`suffix:${this.extension}, do not listen`);
            return;
        }
        if (this.cursorInBlankRow()) {
            this.backspaceUp();
        } else {
            if (this.cursorAtEndOfLine()) {
                return this.deleteTrailingWhitespaces();
            }
        }
        if (config.multiLineDelete) {
            while (this.cursorInBlankRow()) {
                this.backspaceUp();
            }
        }
    },
    isWhitespaceDeleted(e) {
        if (!e || !e.changes || !e.changes[0]) {
            return false;
        }
        if (this.lastPressedKey !== 'backspace') {
            return false;
        }
        // console.info(e.changes[0].oldText);
        // console.info(e.changes[0].newText);
        return this.isBlankStr(e.changes[0].oldText) && e.changes[0].newText === '';
    },
    deactivate: function() {
        if (this.element) {
            this.element.removeEventListener('keydown', this.listener);
        }
        if (this.disposer) {
            this.disposer();
        }
    },
    _getFileExtension: function() {
        let filename;
        const ref = this.currentEditor;
        if (ref && typeof ref.getFileName === 'function') {
            filename = ref.getFileName();
        }
        this.extension = undefined;
        if (filename && filename.includes('.')) {
            const parts = filename.split('.');
            this.extension = parts[parts.length - 1];
        }
        return this.extension;
    },

    storeLastPressedKey(e) {
        const key = e.key.toLowerCase();
        if (e.shiftKey && key === 'backspace') {
            return this.normalBackspace();
        }
        this.lastPressedKey = key;
    },
    normalBackspace() {
        this.currentEditor.backspace();
    },
    backspaceUp() {
        const editor = this.currentEditor;
        editor.deleteLine();
        editor.moveUp();
        editor.moveToEndOfLine();
        this.deleteTrailingWhitespaces();
    },
    deleteTrailingWhitespaces() {
        const trailngWhitespaceNum = this.getTrailngWhitespaceNum();
        if (!trailngWhitespaceNum) {
            return;
        }
        const editor = this.currentEditor;
        editor.moveLeft(trailngWhitespaceNum);
        editor.deleteToEndOfLine();
    },
    getTrailngWhitespaceNum() {
        const line = this.getCursorLine();
        const match = line.match(/\s*$/);
        return (match && match[0].length) || 0;
    },
    cursorInBlankRow() {
        const line = this.getCursorLine();
        return this.isBlankStr(line);
    },
    cursorAtEndOfLine() {
        const editor = this.currentEditor;
        const position = editor.getCursorBufferPosition();
        const line = this.getCursorLine();
        return position.column === line.length;
    },
    getCursorLine() {
        const editor = this.currentEditor;
        const position = editor.getCursorBufferPosition();
        return editor.lineTextForBufferRow(position.row);
    },
    isBlankStr(str) {
        return !str || /^\s*$/.test(str);
    }
};
