'use babel';

import { CompositeDisposable } from 'atom';
import config from './config';

export default {
    extension: '',
    disabledFileExtensions: [],
    config: {
        disabledFileExtensions: {
            type: 'array',
            default: ['html'],
            description: 'Disable this package in above file types'
        },
        multiLineDelete: {
            type: 'boolean',
            default: config.multiLineDelete,
            description: 'Disable this option to only delete in current line'
        }
    },
    activate: function() {
        this.subscriptions = new CompositeDisposable();
        atom.config.observe('backspace-until-not-space.disabledFileExtensions', (value = []) => {
            this.disabledFileExtensions = value;
        });
        atom.config.observe('backspace-until-not-space.multiLineDelete', (val) => {
            config.multiLineDelete = val;
        });
        this.currentEditor = atom.workspace.getActiveTextEditor();
        this.registerListener();
        atom.workspace.onDidChangeActivePaneItem((paneItem) => {
            this.currentEditor = paneItem;
            this.registerListener();
        });
    },
    registerListener() {
        this._getFileExtension();
        if (this.disabledFileExtensions.includes(this.extension)) {
            console.info(`suffix:${this.extension}, do not listen`);
            return;
        }
        const editor = this.currentEditor;
        if (!editor || !editor.getBuffer) {
            return;
        }

        this.buffer = editor.getBuffer();
        this.disposer = this.buffer.onDidChangeText((e) => {
            if (this.isWhitespaceDeleted(e)) {
                this.lastPressedKey = null;
                if (this.cursorInBlankRow()) {
                    this.backspaceUp();
                }
                if (config.multiLineDelete) {
                    while (this.cursorInBlankRow()) {
                        this.backspaceUp();
                    }
                }
            }
        });
        this.element = atom.views.getView(editor);
        this.element.addEventListener('keydown', this.storeLastPressedKey.bind(this));
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
        this.lastPressedKey = e.key.toLowerCase();
    },
    backspaceUp() {
        const editor = this.currentEditor;
        editor.deleteLine();
        editor.moveUp();
        editor.moveToEndOfLine();
        // editor.deleteToPreviousWordBoundary();
        const tailWhitespaceNum = this.tailWhitespaceNum();
        if (tailWhitespaceNum) {
            editor.moveLeft(tailWhitespaceNum);
            editor.deleteToEndOfLine(); //
        }
    },
    tailWhitespaceNum() {
        const line = this.getCursorLine();
        const match = line.match(/\s*$/);
        return (match && match[0].length) || 0;
    },
    cursorInBlankRow() {
        const line = this.getCursorLine();
        return this.isBlankStr(line);
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
