'use babel';



import HomotopyAtom from '../lib/homotopy';

// Use the command `window:run-package-specs` (cmd-alt-ctrl-p) to run specs.
//
// To run a specific `it` or `describe` block add an `f` to the front (e.g. `fit`
// or `fdescribe`). Remove the `f` to unfocus the block.

describe('HomotopyAtom', () => {
  let workspaceElement, activationPromise, editor;

  beforeEach(() => {
    waitsForPromise(()=>{
      return atom.workspace.open()
    })

    workspaceElement = atom.views.getView(atom.workspace);
    activationPromise = atom.packages.activatePackage('homotopy');

    runs(()=>{
      editor = atom.workspace.getActiveTextEditor()
    })
  });

  it('should expand into a snippet', ()=>{
    editor.setText("enum1!A>a&b&c")
    atom.workspace.getActiveTextEditor().getGrammar().name = 'c++'
    editor.moveToEndOfWord()
    let changeHandler = jasmine.createSpy('changeHandler')
    editor.onDidChange(changeHandler)

    editor.onDidChange(()=>{
      expect(editor.getText()).toEqual('enum A { a, b, c,  };')
      expect(editor.getCursorBufferPosition()).toEqual({'row': 0, 'column': 18})
    })
    atom.commands.dispatch(workspaceElement, 'homotopy:expand-into')
    waitsFor(()=>{
      return changeHandler.callCount > 0
    })
  });

  it('should expand a snippet', ()=>{
    editor.setText("enum1!A>a&b&c")
    atom.workspace.getActiveTextEditor().getGrammar().name = 'c++'
    editor.moveToEndOfWord()
    let changeHandler = jasmine.createSpy('changeHandler')
    editor.onDidChange(changeHandler)

    editor.onDidChange(()=>{
      expect(editor.getText()).toEqual('enum A { a, b, c };\n')
      expect(editor.getCursorBufferPosition()).toEqual({'row': 1, 'column': 0})
    })
    atom.commands.dispatch(workspaceElement, 'homotopy:expand')
    waitsFor(()=>{
      return changeHandler.callCount > 0
    })
  });
});
