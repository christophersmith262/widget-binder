
'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')

const EditBufferMediator = require('../../../EditBuffer/EditBufferMediator');

const ContextListenerMock = function() {}
ContextListenerMock.prototype = Backbone.Events

const contextListenerMock = new ContextListenerMock()
contextListenerMock.addContext = sinon.spy()

const elementFactoryMock = {
  create: function(type, data) {
    return {
      data: {
        type: type,
        data: data,
        attributes: {},
      },

      setAttribute: function(name, value) {
        this.data.attributes[name] = value
      },
    }
  }
}

const adapterMock = {
  insertEmbedCode: function(embedCode) {
    this.lastInserted = embedCode
  },

  reset: function() {
    this.lastInserted = undefined
  }
}

const editBufferItemRefFactoryMock = {

  create: function(item) {
    return {
      targetContext: new Backbone.Model({id: item.get('contextId')})
    }
  },

  requestNewItem: sinon.spy(),

}

const targetContextMock = new Backbone.Model({id: 'targetcontext'})

const contextResolverMock = {
  resolveTargetContext: function($el) {
    return targetContextMock
  }
}

function createEditBufferMediator() {
  adapterMock.reset()
  return new EditBufferMediator(
    editBufferItemRefFactoryMock,
    elementFactoryMock,
    contextListenerMock,
    adapterMock,
    contextResolverMock
  )
}

describe('EditBufferMediator module', () => {
  describe('"requestBufferItem"', () => {
    it('should allow clients to request a new buffer item', function() {
      var editBufferMediator = createEditBufferMediator()
      editBufferMediator.requestBufferItem('testtype', {})
      assert(contextListenerMock.addContext.withArgs(targetContextMock).calledOnce, 'context not added to listener')
      assert(editBufferItemRefFactoryMock.requestNewItem.calledWith('targetcontext', 'testtype'), 'item not requested')

      contextListenerMock.trigger('insertItem', new Backbone.Model({
        id: 'newitem1',
        contextId: 'targetcontext',
      }))

      expect(adapterMock.lastInserted.data).to.eql({
        type: 'widget',
        data: {
          uuid: 'newitem1',
          context: 'targetcontext',
        },
        attributes: {
          '<viewmode>': 'editor',
        }
      })
    })
  })
  describe('"cleanup"', () => {
    it('should allow clients to destroy the object', function() {
      var editBufferMediator = createEditBufferMediator()
      editBufferMediator.stopListening = sinon.spy()
      editBufferMediator.cleanup()
      assert(editBufferMediator.stopListening.calledOnce, 'listeners were not cleaned up')
    })
  })
})
