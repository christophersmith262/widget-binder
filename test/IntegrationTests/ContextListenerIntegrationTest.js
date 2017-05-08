
'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')

const BufferItemModel = require('../../Models/EditBufferItemModel');
const EditBufferItemCollection = require('../../Collections/EditBufferItemCollection');
const ContextCollection = require('../../Collections/ContextCollection');
const ContextListener = require('../../Context/ContextListener');

describe('ContextListener Integration Test', () => {
  describe('"Subscribe / Notify"', () => {
    it('should allow clients to recieve notifications for subscribed contexts', function() {
      var contextCollection = new ContextCollection()
      var contextListener = new ContextListener()
      var context1 = contextCollection.get('context1')
      var insertspy = sinon.spy();
      var updatespy = sinon.spy();

      contextListener.addContext(context1)
      contextListener.on('insertItem', insertspy)
      contextListener.on('updateItem', updatespy)

      context1.editBuffer.setItem({
        id: 'newitem',
        insert: true,
      })
      assert(insertspy.calledOnce, 'insert callback not called on insert')
      assert(updatespy.notCalled, 'update callback called on insert')
      insertspy.reset()
      updatespy.reset()

      context1.editBuffer.setItem({
        id: 'existingitem',
        insert: false,
      })
      assert(insertspy.notCalled, 'insert callback called on update')
      assert(updatespy.calledOnce, 'update callback not called on insert')
      insertspy.reset()
      updatespy.reset()
    })
  })
})
