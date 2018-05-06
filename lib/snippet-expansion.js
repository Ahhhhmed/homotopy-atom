'use babel';

import { execFile } from  'child_process'

let cursor_marker = "[{cursor_marker}]"
let homotopy_command = "homotopy"

export class SnippetExpansion{
  constructor(editor, execFileFn=execFile){
    this.editor = editor
    this.execFile = execFileFn
  }

  prepareArguments(language_name, snippet_text){
    var args = [];

    if(this.editor.getSoftTabs()){
      args.push("-t");
      args.push(this.editor.getTabLength())
    }

    args.push("-c");
    args.push(language_name);
    args.push(snippet_text);

    return args;
  }

  expand(){
    if(this.editor.hasMultipleCursors()){
      return;
    }

    let cursorPosition = this.editor.getCursorBufferPosition();
    var lineStart = cursorPosition.copy();
    lineStart.column = 0;
    let range = [lineStart, cursorPosition];

    let snippet_text = this.editor.getTextInBufferRange(range);
    let language_name = this.editor.getGrammar().name

    this.execFile(homotopy_command, this.prepareArguments(language_name, snippet_text), (error, stdout) =>{
      let snippet_split = stdout.split(cursor_marker)

      if(snippet_split.length>1){
        this.editor.transact(()=>{
          this.editor.setTextInBufferRange(range, snippet_split[0])
          var cursorPosition = this.editor.getCursorBufferPosition()
          this.editor.setTextInBufferRange([cursorPosition, cursorPosition], snippet_split[1])
          this.editor.setCursorBufferPosition(cursorPosition)
        })
      } else {
        this.editor.setTextInBufferRange(range, snippet_split[0] + "\n")
      }
    })
  }
}
