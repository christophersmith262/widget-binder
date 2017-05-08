
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const spy = require('sinon')
const Backbone = require('backbone')
const EditBufferItemCollection = rewire('../../../Collections/EditBufferItemCollection')

const EditBufferItemModelMock = Backbone.Model.extend({
});

const commandEmitterMock = { render: function(x, y) {} }

sinon.spy(commandEmitterMock, 'render')

EditBufferItemCollection.__set__('EditBufferItemModel', EditBufferItemModelMock)

describe('EditBufferItemCollection module', () => {
  describe('"getItem"', () => {
    it('should provide a getter that supports lazy-loading', function() {
      var editBufferItemCollection = new EditBufferItemCollection([], {
        contextId: 'context1',
      })
      expect(editBufferItemCollection.getItem(commandEmitterMock, 'item1').get('id')).to.eql('item1')
      assert(commandEmitterMock.render.calledOnce)
      commandEmitterMock.render.reset()
      expect(editBufferItemCollection.getItem(commandEmitterMock, 'item1').get('id')).to.eql('item1')
      assert(commandEmitterMock.render.notCalled)
      commandEmitterMock.render.reset()
    });
  });
  describe('"setItem"', () => {
    it('should provide a setter that supports merging', function() {
      var editBufferItemCollection = new EditBufferItemCollection([], {
        contextId: 'context1',
      })
      editBufferItemCollection.setItem({ id: 'item1' })
      expect(editBufferItemCollection.getItem(commandEmitterMock, 'item1').get('id')).to.eql('item1')
      assert(commandEmitterMock.render.notCalled)
      commandEmitterMock.render.reset()
    });
  });
  describe('"removeItem"', () => {
    it('should provide a consistent api for removing items', function() {
      var editBufferItemCollection = new EditBufferItemCollection([{ id: 'item1' }], {
        contextId: 'context1',
      })
      editBufferItemCollection.removeItem('item1')
      expect(editBufferItemCollection.getItem(commandEmitterMock, 'item1').get('id')).to.eql('item1')
      assert(commandEmitterMock.render.calledOnce)
      commandEmitterMock.render.reset()
    });
  });
  describe('"getContextId"', () => {
    it('should provide a getter for context id', function() {
      var editBufferItemCollection = new EditBufferItemCollection([], {
        contextId: 'context1',
      })
      expect(editBufferItemCollection.getContextId()).to.eql('context1')
    });
  });
})
