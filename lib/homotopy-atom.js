'use babel';

import { CompositeDisposable } from 'atom';
import { execFile } from  'child_process'

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'homotopy-atom:expand': () => this.expand()
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  expand() {
    let editor
    if (editor = atom.workspace.getActiveTextEditor()) {
      editor.selectToBeginningOfLine()
      let selection = editor.getSelectedText()

      execFile('homotopy', [selection], (error, stdout) =>{
        editor.insertText(stdout)
      })
    }

  }

};
