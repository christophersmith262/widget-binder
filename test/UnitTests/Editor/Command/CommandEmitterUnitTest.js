
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')
const CommandEmitter = require('../../../../Editor/Command/CommandEmitter')

const contextSettings = {
  'jk87hbb8': 'ni78hi'
}

const dispatcherMock = {}
dispatcherMock.dispatch = sinon.spy()

const contextMock = new Backbone.Model({
  id: 'editorcontext',
})
contextMock.getSettings = function() {
  return contextSettings
}

var edits = {
  'fm304v3': 'fm042jf0wrj',
}

describe('CommandEmitter module', () => {
  describe('"insert"', () => {
    it('should provide an insert action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextMock)

      commandEmitter.insert('targetcontext')
      assert(dispatcherMock.dispatch.withArgs('INSERT_ITEM', {
        command: "insert",
        targetContext: 'targetcontext',
      }, contextSettings).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()

      commandEmitter.insert('targetcontext', 'abundle')
      assert(dispatcherMock.dispatch.withArgs('INSERT_ITEM', {
        command: "insert",
        targetContext: 'targetcontext',
        bundleName: 'abundle',
      }, contextSettings).calledOnce, 'command not dispatched (2)')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"edit"', () => {
    it('should provide an edit action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextMock)

      commandEmitter.edit('targetcontext', 'item1', edits)
      assert(dispatcherMock.dispatch.withArgs('EDIT_ITEM', {
        command: "edit",
        targetContext: 'targetcontext',
        itemId: 'item1',
        edits: edits,
      }, contextSettings).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"render"', () => {
    it('should provide a render action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextMock)

      commandEmitter.render('targetcontext', 'item1', edits)
      assert(dispatcherMock.dispatch.withArgs('RENDER_ITEM', {
        command: "render",
        targetContext: 'targetcontext',
        itemId: 'item1',
        edits: edits,
      }, contextSettings).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"duplicate"', () => {
    it('should provide a duplicate action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextMock)

      commandEmitter.duplicate('targetcontext', 'sourcecontext', 'item1', 17, edits)
      assert(dispatcherMock.dispatch.withArgs('DUPLICATE_ITEM', {
        command: "duplicate",
        targetContext: 'targetcontext',
        sourceContext: 'sourcecontext',
        itemId: 'item1',
        widget: 17,
        edits: edits,
      }, contextSettings).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
});
