
'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const ContextListener = require('../../../Context/ContextListener');

describe('ContextListener module', () => {
  describe('"addContext"', () => {
    it('should allow clients to add contexts to listen to', function() {
      var contextListener = new ContextListener()
      contextListener.listenTo = sinon.spy()
      contextListener.addContext({ editBuffer: 'editbuffer' })
      assert(contextListener.listenTo.withArgs('editbuffer', 'add update', contextListener._triggerEvents))
    })
  })
})
