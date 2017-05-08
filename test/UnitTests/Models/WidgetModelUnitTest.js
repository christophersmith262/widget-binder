
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')
const WidgetModel = rewire('../../../Models/WidgetModel')

const MockEditBufferItemRef = function(bufferItemModel, sourceContext, targetContext) {
  this.editBufferItem = bufferItemModel
  this.sourceContext = sourceContext
  this.targetContext = targetContext
  this.edit = sinon.spy()
  this.render = sinon.spy()
  this.duplicate = sinon.spy()
}

const mockEditBufferItemRefFactory = {
  createFromIds: function(itemId, sourceContextId, targetContextId) {
    var bufferItemModel = new Backbone.Model({id: itemId});
    var sourceContext = new Backbone.Model({id: sourceContextId})
    var targetContext = new Backbone.Model({id: targetContextId})
    return new MockEditBufferItemRef(bufferItemModel, sourceContext, targetContext)
  }
}

const mockContextResolver = {
  get: function(id) {
    return new Backbone.Model({id: id})
  }
}

function createWidgetModel(attributes) {
  return new WidgetModel(attributes, {
    widget: 'testwidget',
    editBufferItemRefFactory: mockEditBufferItemRefFactory,
    contextResolver: mockContextResolver,
  })
}

const edits = {
  'widgetcontext': 'anedit',
  'othercontext': 'otheredit',
}

describe('WidgetModel module', () => {
  describe('"set"', () => {
    it('should generate computed fields based on set attributes', function() {

      // Test indirect set through constructor.
      var model = createWidgetModel({
        id: 'widget1',
        itemId: 'item1',
        contextId: 'widgetcontext',
        itemContextId: 'itemcontext',
        edits: edits,
      })
      expect(model.get('itemId')).to.eql('item1')

      model.editBufferItemRef.editBufferItem.set({markup: 'testmarkup'})
      expect(model.get('markup')).to.eql('testmarkup')

      model.editBufferItemRef.sourceContext.set({id: 'newitemcontext'})
      expect(model.get('itemContextId')).to.eql('newitemcontext')

      model.editBufferItemRef.targetContext.set({id: 'newwidgetcontext'})
      expect(model.get('contextId')).to.eql('newwidgetcontext')
      expect(model.get('edits')).to.eql({
        'newwidgetcontext': 'anedit',
        'othercontext': 'otheredit',
      })
    })
  })
  describe('"edit"', () => {
    it('should allow clients to edit the referenced buffer item', function() {
      var model = createWidgetModel({
        id: 'widget1',
        contextId: 'widgetcontext',
        itemId: 'item1',
        itemContextId: 'itemcontext',
        edits: edits,
      })
      model.edit()
      assert(model.editBufferItemRef.edit.withArgs(edits).calledOnce, 'edit command not emitted')
    })
  })
  describe('"duplicate"', () => {
    it('should allow clients to duplicate the referenced buffer item', function() {
      var model = createWidgetModel({
        id: 'widget1',
        contextId: 'widgetcontext',
        itemId: 'item1',
        itemContextId: 'itemcontext',
        edits: edits,
      })
      model.duplicate()
      assert(model.editBufferItemRef.duplicate.withArgs('widget1', edits).calledOnce, 'duplicate command not emitted')
    })
  })
  describe('"destroy"', () => {
    it('should allow clients destroy the widget', function() {
      var model = createWidgetModel({
        id: 'widget1',
        contextId: 'widgetcontext',
        itemId: 'item1',
        itemContextId: 'itemcontext',
      })
      model.destroy()
      expect(model.hasState(WidgetModel.State.DESTROYED)).to.eql(true)
      expect(model.destroy.bind(model)).not.to.throw(Error)
    })
  })
  describe('"setState, hasState"', () => {
    it('should allow clients to update and read the widget lifecycle state', function() {
      var model = createWidgetModel({
        id: 'widget1',
        contextId: 'widgetcontext',
        itemId: 'item1',
        itemContextId: 'itemcontext',
      })
      expect(model.hasState(WidgetModel.State.READY)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_WIDGET)).to.eql(false)
      expect(model.hasState(WidgetModel.State.DESTROYED_REFS)).to.eql(false)
      expect(model.hasState(WidgetModel.State.DESTROYED)).to.eql(false)

      model.setState(WidgetModel.State.DESTROYED_WIDGET)
      expect(model.hasState(WidgetModel.State.READY)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_WIDGET)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_REFS)).to.eql(false)
      expect(model.hasState(WidgetModel.State.DESTROYED)).to.eql(false)

      model.setState(WidgetModel.State.DESTROYED_REFS)
      expect(model.hasState(WidgetModel.State.READY)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_WIDGET)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_REFS)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED)).to.eql(true)

      model = createWidgetModel({
        id: 'widget1',
        contextId: 'widgetcontext',
        itemId: 'item1',
        itemContextId: 'itemcontext',
      })
      model.setState(WidgetModel.State.DESTROYED_REFS)
      expect(model.hasState(WidgetModel.State.READY)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED_WIDGET)).to.eql(false)
      expect(model.hasState(WidgetModel.State.DESTROYED_REFS)).to.eql(true)
      expect(model.hasState(WidgetModel.State.DESTROYED)).to.eql(false)
    })
  })
})
