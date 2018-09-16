'use babel';

import { CompositeDisposable } from 'atom';
import { SnippetExpansion } from  './snippet-expansion'

export default {

  subscriptions: null,

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'homotopy:expand': () => {
        let editor
        if (editor = atom.workspace.getActiveTextEditor()) {
          new SnippetExpansion(editor).expand(false)
        }
      }
    }));

    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'homotopy:expand-into': () => {
        let editor
        if (editor = atom.workspace.getActiveTextEditor()) {
          new SnippetExpansion(editor).expand()
        }
      }
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  }
};
