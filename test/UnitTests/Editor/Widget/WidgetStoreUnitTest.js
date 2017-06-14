
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><div class="editor"></div>')
const $ = require('jquery')(dom.window)
const Backbone = require('backbone')
Backbone.$ = $

const WidgetModel = require('../../../../Models/WidgetModel')
const WidgetStore = require('../../../../Editor/Widget/WidgetStore')

const WidgetMockModel = Backbone.Model.extend({
  initialize: function(attributes, options) {
    var destroyed = options && options.destroyed ? true : false;
    this.hasState = sinon.stub();
    this.hasState.withArgs(WidgetModel.State.DESTROYED_WIDGET).returns(destroyed)
    this.setState = sinon.spy()
  }
})

const adapterMock = {
  getRootEl: function() {
    return $('.editor')[0]
  },

  cleanup: sinon.spy(),

  destroyWidget: sinon.spy()
}

function resetDom() {
  $('.editor').html('<div class="widget1"></div><div class="widget2"></div>')
}

function createWidgetStore() {
  return new WidgetStore(adapterMock)
}

function createTestArgs(id, itemId, destroyedState) {
  var model = new WidgetMockModel({
    id: id,
    itemId: itemId,
  }, {destroyed: destroyedState});

  var view = new Backbone.View({
    model: model,
    el: $('.' + id)[0],
  })
  view.remove = sinon.spy()

  return {
    model: model,
    view: view,
  }
}

describe('WidgetStore module', () => {
  describe('"add, get"', () => {
    it('should allow clients to add and update widget models', function() {
      resetDom()

      var args1 = createTestArgs('widget1', 'item1')
      var args2 = createTestArgs('widget2', 'item2')

      // Test adding a model to the store.
      var widgetStore = createWidgetStore()
      widgetStore.add(args1.model)
      expect(widgetStore.get('widget1')).to.eql({
        model: args1.model,
        view: null,
      })

      // Test adding model / view pairs to the store.
      widgetStore = createWidgetStore()
      args1 = createTestArgs('widget1', 'item1')
      args2 = createTestArgs('widget2', 'item2')
      widgetStore.add(args1.model, args1.view)
      expect(widgetStore.get('widget1')).to.eql({
        model: args1.model,
        view: args1.view,
      })
      widgetStore.add(args1.model, args2.view)
      expect(widgetStore.get('widget1')).to.eql({
        model: args1.model,
        view: args2.view,
      })

      // Test getting a non-existent widget.
      expect(widgetStore.get('widget2')).to.eql({
        model: null,
        view: null
      })

      // Test updating existing widgets using an attribute array.
      widgetStore = createWidgetStore()
      args1 = createTestArgs('widget1', 'item1')
      args2 = createTestArgs('widget2', 'item2')
      widgetStore.add(args1.model, args1.view)
      widgetStore.add({
        id: 'widget1',
        aproperty: 'testit',
      })
      expect(widgetStore.get('widget1').model.get('aproperty')).to.eql('testit')

      // Test trying to update a non-existent widget using an attribute array.
      expect(widgetStore.add.bind(widgetStore, {
        id: 'widget2',
        aproperty: 'testit',
      })).to.throw(Error)

      // Test trying to update a model from another editor.
      widgetStore1 = createWidgetStore()
      widgetStore2 = createWidgetStore()
      args1 = createTestArgs('widget1', 'item1')
      args2 = createTestArgs('widget2', 'item2')
      widgetStore1.add(args1.model, args1.view)
      widgetStore2.add(args2.model, args2.view)
      expect(widgetStore1.add.bind(widgetStore1, args2.model, args2.view)).to.throw(Error)
    });
  });
  describe('"remove"', () => {
    it('should allow clients to remove widget models', function() {
      resetDom()

      var args = createTestArgs('widget1', 'item1')

      // Test adding and removing a model with view.
      var widgetStore = createWidgetStore()
      widgetStore.add(args.model)
      widgetStore.remove(args.model)
      expect(widgetStore.get('widget1')).to.eql({
        model: null,
        view: null
      })

      // Test adding and remove a model without a view.
      widgetStore = createWidgetStore()
      widgetStore.add(args.model, args.view)
      widgetStore.remove(args.model)
      expect(widgetStore.get('widget1')).to.eql({
        model: null,
        view: null
      })

      // Test removing the model after it has already been removed.
      expect(widgetStore.remove.bind(widgetStore, args.model)).not.to.throw(Error)

      // Test adding a removed model that has been destroyed.
      var args = createTestArgs('widget1', 'item1', true)
      widgetStore = createWidgetStore()
      widgetStore.add(args.model, args.view)
      widgetStore.remove(args.model)
      expect(widgetStore.get('widget1')).to.eql({
        model: null,
        view: null
      })

      widgetStore.remove();
    });
  });
  describe('"count"', () => {
    it('should allow clients to count widgets that reference a data entity', function() {

      // Check count with add/remove.
      resetDom()
      var widgetStore = createWidgetStore()
      var args1 = createTestArgs('widget1', 'item1')
      var args2 = createTestArgs('widget2', 'item1')
      expect(widgetStore.count(args1.model)).to.eql(0)
      expect(widgetStore.count(args2.model)).to.eql(0)
      widgetStore.add(args1.model, args1.view)
      expect(widgetStore.count(args1.model)).to.eql(1)
      expect(widgetStore.count(args2.model)).to.eql(1)
      widgetStore.add(args2.model, args2.view)
      expect(widgetStore.count(args1.model)).to.eql(2)
      expect(widgetStore.count(args2.model)).to.eql(2)
      $('.widget2').remove()
      expect(widgetStore.count(args1.model)).to.eql(1)
      expect(widgetStore.count(args2.model)).to.eql(1)
      expect(widgetStore.count()).to.eql(0)

      // Simulate resolving a multiple references to the same item.
      resetDom()
      args1 = createTestArgs('widget1', 'item1')
      args2 = createTestArgs('widget2', 'item1')
      widgetStore = createWidgetStore()
      widgetStore.add(args1.model, args1.view)
      expect(widgetStore.count(args1.model)).to.eql(1)
      expect(widgetStore.count(args2.model)).to.eql(1)
      widgetStore.add(args2.model, args2.view)
      expect(widgetStore.count(args1.model)).to.eql(2)
      expect(widgetStore.count(args2.model)).to.eql(2)
      args2.model.set({'itemId': 'item2'})
      expect(widgetStore.count(args1.model)).to.eql(1)
      expect(widgetStore.count(args2.model)).to.eql(1)

      // Test counts for models with no views.
      resetDom()
      args1 = createTestArgs('widget1', 'item1')
      args2 = createTestArgs('widget2', 'item3')
      widgetStore = createWidgetStore()
      widgetStore.add(args1.model)
      expect(args1.model.set.bind(args1.model, {'itemId': 'item2'})).not.to.throw(Error)
      expect(widgetStore.count(args1.model)).to.eql(0)
      expect(widgetStore.count(args2.model)).to.eql(0)
      widgetStore.add(args1.model, args1.view)
      expect(widgetStore.count(args1.model)).to.eql(1)
      expect(widgetStore.count(args2.model)).to.eql(0)
      widgetStore.add(args2.model, args2.view)
      args2.model.set({'itemId': 'item2'})
      expect(widgetStore.count(args1.model)).to.eql(2)
      expect(widgetStore.count(args2.model)).to.eql(2)
    });
  });
  describe('"cleanup"', () => {
    it('should allow clients to destroy the object', function() {
      resetDom()

      var args = createTestArgs('widget1', 'item1')

      var widgetStore = createWidgetStore()
      widgetStore.stopListening = sinon.spy()
      widgetStore.add(args.model, args.view)
      widgetStore.cleanup()
      expect(widgetStore.get(args.model)).to.eql({
        model: null,
        view: null
      })
      assert(adapterMock.cleanup.calledOnce, 'adapter not cleaned up')
      assert(widgetStore.stopListening.calledOnce, 'dangling listeners')
    });
  });
});
