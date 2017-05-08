
'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')
const EditBufferItemRef = require('../../../EditBuffer/EditBufferItemRef');

const editBufferItemMock = new Backbone.Model({
  id: 'bufferitem'
})

const sourceContextMock = new Backbone.Model({
  id: 'sourcecontext'
})

const targetContextMock = new Backbone.Model({
  id: 'targetcontext'
})

const commandEmitterMock = {
}

commandEmitterMock.edit = sinon.spy()
commandEmitterMock.render = sinon.spy()
commandEmitterMock.duplicate = sinon.spy()

var edits = {
  'pjigr09': 'm034009',
}

function createEditBufferItemRef() {
  return new EditBufferItemRef(editBufferItemMock, sourceContextMock, targetContextMock, commandEmitterMock)
}

describe('EditBufferItemRef module', () => {
  describe('"edit"', () => {
    it('should allow clients to trigger an edit action on the item', function() {
      createEditBufferItemRef().edit(edits)
      assert(commandEmitterMock.edit.withArgs('targetcontext', 'bufferitem',  edits), 'edit not emitted')
    })
  })
  describe('"render"', () => {
    it('should allow clients to trigger a render action on the item', function() {
      createEditBufferItemRef().render(edits)
      assert(commandEmitterMock.render.withArgs('targetcontext', 'bufferitem',  edits), 'render not emitted')
    })
  })
  describe('"duplicate"', () => {
    it('should allow clients to trigger a duplication action on the item', function() {
      createEditBufferItemRef().duplicate(5, edits)
      assert(commandEmitterMock.duplicate.withArgs('targetcontext', 'sourcecontext', 'bufferitem',  5, edits), 'duplicate not emitted')
    })
  })
})
