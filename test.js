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
        atom.config.observe('backspace-until-not-whitespace.disabledFileExtensions', (value = []) => {
            this.disabledFileExtensions = value;
        });
        atom.config.observe('backspace-until-not-whitespace.multiLineDelete', (val) => {
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
        if (!editor) {
            return;
        }

        this.buffer = editor.getBuffer();
        this.disposer = this.buffer.onDidChangeText((e) => {
            if (this.isDeletedSpace(e)) {
                this.backspaceUp();
            }
        });
        this.element = atom.views.getView(editor);
        this.element.addEventListener('keydown', this.storeCursorPos.bind(this));
    },
    isDeletedSpace(e) {
        if (!e || !e.changes || !e.changes[0]) {
            return false;
        }
        return /^\s$/.test(e.changes[0].oldText) && e.changes[0].newText === '';
    },
    deactivate: function() {
        if (this.element) {
            this.element.removeEventListener('keydown', this.listener);
        }
        if (this.closeListener) {
            this.closeListener();
        }
        // return this.subscriptions.dispose(); //
        //
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
    storeCursorPos(e) {
        if (e.key.toLowerCase() !== 'backspace') {
            return;
        }
    },
    backspaceUp() {
        // this.currentEditor.deleteToBeginningOfLine();
        this.currentEditor.deleteLine();
    },
};
