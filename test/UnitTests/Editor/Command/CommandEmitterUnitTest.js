
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

const editorContextMock = new Backbone.Model({
  id: 'editorcontext',
})
editorContextMock.get = function(name) {
  return name == 'settings' ? contextSettings : null;
}

const contextResolverMock = new Backbone.Collection([
    {
      id: 'editcontext1',
      testproperty: 'test1'
    },
    {
      id: 'editcontext2',
      testproperty: 'test2'
    },
    {
      id: 'editcontext3',
      testproperty: 'test3'
    },
]);
contextResolverMock.getEditorContext = function() {
  return editorContextMock;
}

var edits = {
  'editcontext1': 'edit1',
  'editcontext2': 'edit1',
  'editcontext3': 'edit3',
};

var expectedEditorContextJson = {
  id: 'editorcontext',
};

var expectedEditContextsJson = {
  'editcontext1': {
    id: 'editcontext1',
    testproperty: 'test1'
  },
  'editcontext2': {
    id: 'editcontext2',
    testproperty: 'test2'
  },
  'editcontext3': {
    id: 'editcontext3',
    testproperty: 'test3'
  },
};

describe('CommandEmitter module', () => {
  describe('"insert"', () => {
    it('should provide an insert action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextResolverMock)

      commandEmitter.insert('targetcontext')
      assert(dispatcherMock.dispatch.withArgs('INSERT_ITEM', {
        command: "insert",
        targetContext: 'targetcontext',
        editorContext: expectedEditorContextJson,
        settings: contextSettings
      }).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()

      commandEmitter.insert('targetcontext', 'atype')
      assert(dispatcherMock.dispatch.withArgs('INSERT_ITEM', {
        command: "insert",
        targetContext: 'targetcontext',
        type: 'atype',
        editorContext: expectedEditorContextJson,
        settings: contextSettings
      }).calledOnce, 'command not dispatched (2)')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"edit"', () => {
    it('should provide an edit action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextResolverMock)

      commandEmitter.edit('targetcontext', 'item1', edits)
      assert(dispatcherMock.dispatch.withArgs('EDIT_ITEM', {
        command: "edit",
        targetContext: 'targetcontext',
        itemId: 'item1',
        editorContext: expectedEditorContextJson,
        editableContexts: expectedEditContextsJson,
        edits: edits,
        settings: contextSettings
      }).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"render"', () => {
    it('should provide a render action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextResolverMock)

      commandEmitter.render('targetcontext', 'item1', edits)
      assert(dispatcherMock.dispatch.withArgs('RENDER_ITEM', {
        command: "render",
        targetContext: 'targetcontext',
        itemId: 'item1',
        editorContext: expectedEditorContextJson,
        editableContexts: expectedEditContextsJson,
        edits: edits,
        settings: contextSettings
      }).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
  describe('"duplicate"', () => {
    it('should provide a duplicate action', function() {
      var commandEmitter = new CommandEmitter(dispatcherMock, contextResolverMock)

      commandEmitter.duplicate('targetcontext', 'sourcecontext', 'item1', 17, edits)
      assert(dispatcherMock.dispatch.withArgs('DUPLICATE_ITEM', {
        command: "duplicate",
        targetContext: 'targetcontext',
        sourceContext: 'sourcecontext',
        itemId: 'item1',
        widget: 17,
        editorContext: expectedEditorContextJson,
        editableContexts: expectedEditContextsJson,
        edits: edits,
        settings: contextSettings
      }).calledOnce, 'command not dispatched')
      dispatcherMock.dispatch.reset()
    });
  });
});
