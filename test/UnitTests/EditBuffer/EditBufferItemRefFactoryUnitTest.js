
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')
const EditBufferItemRefFactory = rewire('../../../EditBuffer/EditBufferItemRefFactory');

const editBufferItemModelMock = {
  collection: {
    getContextId: function() {
      return 'fallbackcontext'
    }
  }
}

const EditBufferItemRefMock = function(model, sourceContext, targetContext, commandEmitter) {
  this.model = model
  this.sourceContext = sourceContext
  this.targetContext = targetContext
  this.commandEmitter = commandEmitter
}
EditBufferItemRefFactory.__set__('EditBufferItemRef', EditBufferItemRefMock)

const ContextModelMock = Backbone.Model.extend({

  initialize: function() {
    this.editBuffer = {
      getItem: function(commandEmitter, id) {
        editBufferItemModelMock.lookedUp = true
        return editBufferItemModelMock
      }
    }
  }
})

const contextResolverMock = {

  get: function(id) {
    return new ContextModelMock({id: id})
  }
}

const commandEmitterMock = { insert: function(x, y) {} }

sinon.spy(commandEmitterMock, 'insert')

describe('EditBufferItemRefFactory module', () => {
  describe('"create"', () => {
    it('should allow clients to create edit buffer item references', function() {
      var editBufferItemRefFactory = new EditBufferItemRefFactory(contextResolverMock, commandEmitterMock)

      var ref = editBufferItemRefFactory.create(editBufferItemModelMock)
      expect(ref.model).to.eql(editBufferItemModelMock)
      expect(ref.sourceContext.get('id')).to.eql('fallbackcontext')
      expect(ref.targetContext.get('id')).to.eql('fallbackcontext')
      expect(ref.commandEmitter).to.eql(commandEmitterMock)

      ref = editBufferItemRefFactory.create(editBufferItemModelMock, new ContextModelMock({id: 'sourcecontext'}))
      expect(ref.model).to.eql(editBufferItemModelMock)
      expect(ref.sourceContext.get('id')).to.eql('sourcecontext')
      expect(ref.targetContext.get('id')).to.eql('fallbackcontext')
      expect(ref.commandEmitter).to.eql(commandEmitterMock)

      ref = editBufferItemRefFactory.create(editBufferItemModelMock,
          new ContextModelMock({id: 'sourcecontext'}), new ContextModelMock({id: 'targetcontext'}))
      expect(ref.model).to.eql(editBufferItemModelMock)
      expect(ref.sourceContext.get('id')).to.eql('sourcecontext')
      expect(ref.targetContext.get('id')).to.eql('targetcontext')
      expect(ref.commandEmitter).to.eql(commandEmitterMock)
    })
  })
  describe('"createFromIds"', () => {
    it('should allow clients to create edit buffer item refrences from an item id', function() {
      var editBufferItemRefFactory = new EditBufferItemRefFactory(contextResolverMock, commandEmitterMock)

      expect(editBufferItemRefFactory.createFromIds.bind(editBufferItemRefFactory, 'itemid')).to.throw(Error)
      expect(editBufferItemRefFactory.createFromIds.bind(editBufferItemRefFactory, 'itemid', 'sourceid')).to.throw(Error)

      var ref = editBufferItemRefFactory.createFromIds('i', 's', 't')
      expect(ref.model).to.eql(editBufferItemModelMock)
      expect(ref.model.lookedUp).to.eql(true)
      expect(ref.sourceContext.get('id')).to.eql('s')
      expect(ref.targetContext.get('id')).to.eql('t')
      expect(ref.commandEmitter).to.eql(commandEmitterMock)
      ref.model.lookedUp = false
    })
  })
  describe('"requestNewItem"', () => {
    it('should allow clients to request a new edit buffer item be created', function() {
      var editBufferItemRefFactory = new EditBufferItemRefFactory(contextResolverMock, commandEmitterMock)
      editBufferItemRefFactory.requestNewItem('test1', 'test2')
      assert(commandEmitterMock.insert.withArgs('test1', 'test2').calledOnce)
      commandEmitterMock.insert.reset()
    })
  })
})
