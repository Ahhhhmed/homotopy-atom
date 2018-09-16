'use babel';

import * as ChildProcess from  'child_process'
import {SnippetExpansion} from '../lib/snippet-expansion';

describe('SnippetExpansion', () => {
  let instance, editor, execFile

  beforeEach(() => {
    atom.packages.activatePackage('homotopy');

    editor = jasmine.createSpyObj('editor', [
      'getSoftTabs',
      'getTabLength',
      'hasMultipleCursors',
      'getCursorBufferPosition',
      'getTextInBufferRange',
      'getCursorBufferPosition',
      'getGrammar',
      'transact',
      'setTextInBufferRange',
      'setCursorBufferPosition'
    ]);
    execFile = jasmine.createSpy('execFile')
    editor.getSoftTabs.andReturn(false)
    editor.transact.andCallFake((f)=>{f()})
    instance = new SnippetExpansion(editor, execFile)
  });

  it('should make args', ()=>{
    expect(instance.prepareArguments('c++', 'if$true', true)).toEqual(['-c', 'c++', 'if$true'])
    expect(editor.getSoftTabs).toHaveBeenCalledWith()
    expect(editor.getTabLength).not.toHaveBeenCalled()

    editor.getSoftTabs.andReturn(true)
    editor.getTabLength.andReturn(4)
    expect(instance.prepareArguments('c++', 'if$true')).toEqual(['-t', 4, 'c++', 'if$true'])
    expect(editor.getSoftTabs).toHaveBeenCalledWith()
    expect(editor.getTabLength).toHaveBeenCalledWith()

    atom.config.set('homotopy.User lib path', ["folder1", "folder2"])
    expect(instance.prepareArguments('c++', 'if$true', true)).toEqual(['-p', 'folder1::folder2', '-t', 4, '-c', 'c++', 'if$true'])
  });

  it('should expand snippets', ()=>{
    let cursorPositionSpy = jasmine.createSpyObj('getCursorBufferPosition', ['copy'])
    let lineStartSpy = jasmine.createSpyObj('fakeCopy', ['column'])
    let expectedRange = [lineStartSpy, cursorPositionSpy]
    cursorPositionSpy.copy.andReturn(lineStartSpy)
    editor.getCursorBufferPosition.andReturn(cursorPositionSpy)
    editor.getGrammar.andReturn(jasmine.createSpyObj('fakeGrammar', ['name']))

    execFile.andCallFake((path, args, callback)=>{
      let addErrorSpy = spyOn(atom.notifications, 'addError')
      let addWarningSpy = spyOn(atom.notifications, 'addWarning')

      expect(path).toEqual('homotopy')
      callback('', 'snippet_text')

      expect(editor.transact).not.toHaveBeenCalled()
      expect(editor.setTextInBufferRange).toHaveBeenCalledWith(expectedRange, 'snippet_text' + '\n')
      expect(editor.setCursorBufferPosition).not.toHaveBeenCalled()
      expect(addErrorSpy).not.toHaveBeenCalled()
      expect(addWarningSpy).not.toHaveBeenCalled()

      callback('', 'before[{cursor_marker}]after')

      expect(editor.transact).toHaveBeenCalled()
      expect(editor.setTextInBufferRange).toHaveBeenCalledWith(expectedRange, 'before')
      expect(editor.setTextInBufferRange).toHaveBeenCalledWith([cursorPositionSpy, cursorPositionSpy], 'after')
      expect(editor.setCursorBufferPosition).toHaveBeenCalledWith(cursorPositionSpy)
      expect(addErrorSpy).not.toHaveBeenCalled()
      expect(addWarningSpy).not.toHaveBeenCalled()

      callback(new Error("error message"), "junk")
      expect(addErrorSpy).toHaveBeenCalledWith("Error calling homotopy engine. Homotopy path: 'homotopy'. error message")
      expect(addWarningSpy).not.toHaveBeenCalled()

      callback(undefined, "junk", "warning message")
      expect(addWarningSpy).toHaveBeenCalledWith("One or more waring messages from homotopy engine: warning message")
    })

    instance.expand()
    expect(execFile).toHaveBeenCalled()
    expect(editor.hasMultipleCursors).toHaveBeenCalled()
    expect(editor.getSoftTabs).toHaveBeenCalled()
    expect(editor.getTabLength).not.toHaveBeenCalled()
    expect(editor.getCursorBufferPosition).toHaveBeenCalled()
    expect(editor.getTextInBufferRange).toHaveBeenCalledWith(expectedRange)
    expect(editor.getGrammar).toHaveBeenCalled()

  });

  it('should pass custom path', ()=>{
    let cursorPositionSpy = jasmine.createSpyObj('getCursorBufferPosition', ['copy'])
    cursorPositionSpy.copy.andReturn(jasmine.createSpyObj('fakeCopy', ['column']))
    editor.getCursorBufferPosition.andReturn(cursorPositionSpy)
    editor.getGrammar.andReturn(jasmine.createSpyObj('fakeGrammar', ['name']))

    atom.config.set('homotopy.Homotopy path', 'customPath')

    execFile.andCallFake((path)=>{
      expect(path).toEqual('customPath')
    })

    instance.expand()
  })

  it('should do nothing when multiple cursors', ()=>{
    editor.hasMultipleCursors.andReturn(true)
    instance.expand()
    expect(editor.hasMultipleCursors).toHaveBeenCalled()
    expect(editor.getSoftTabs).not.toHaveBeenCalled()
    expect(editor.getTabLength).not.toHaveBeenCalled()
    expect(editor.getCursorBufferPosition).not.toHaveBeenCalled()
    expect(editor.getTextInBufferRange).not.toHaveBeenCalled()
    expect(editor.getGrammar).not.toHaveBeenCalled()
    expect(editor.transact).not.toHaveBeenCalled()
    expect(editor.setTextInBufferRange).not.toHaveBeenCalled()
    expect(editor.setCursorBufferPosition).not.toHaveBeenCalled()
  });

});
