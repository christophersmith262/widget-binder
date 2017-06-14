
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const Backbone = require('backbone')
const SchemaCollection = rewire('../../../Collections/SchemaCollection')

var mockDispatcher = { dispatch: function(x, y, z) {} }
sinon.spy(mockDispatcher, 'dispatch')

const ContextModelMock = Backbone.Model.extend({
});

const SchemaModelMock = Backbone.Model.extend({
});

SchemaCollection.__set__('SchemaModel', SchemaModelMock)

describe('SchemaCollection module', () => {
  describe('"isAllowed"', () => {
    it('should allow clients to get allowed field names', function() {
      var schemaCollection = new SchemaCollection([
        {
          id: "field1",
          allowed: {
            "field2": true,
            "field3": true
          },
        }
      ], {
        dispatcher: mockDispatcher,
      })
      expect(schemaCollection.isAllowed('field1', 'field2')).to.eql(true)
      expect(schemaCollection.isAllowed('field1', 'field3')).to.eql(true)
      expect(schemaCollection.isAllowed('field1', 'field4')).to.eql(false)
      expect(schemaCollection.isAllowed('field4', 'field1')).to.eql(false)
      mockDispatcher.dispatch.reset()
    })
  });
  describe('"addContextSchema"', () => {
    it('should allow users to add schema for a context', function() {
      var schemaCollection = new SchemaCollection([
        {
          id: "field1",
          allowed: {
            "field2": true,
            "field3": true
          },
        }
      ], {
        dispatcher: mockDispatcher,
      })
      var contextModelMock = new ContextModelMock({
        id: 'context1',
        schemaId: 'field1',
      })
      schemaCollection.addContextSchema(contextModelMock)
      assert(mockDispatcher.dispatch.notCalled, 'Fetch schema request on existing schema')
      mockDispatcher.dispatch.reset()

      contextModelMock = new ContextModelMock({
        id: 'context2',
        schemaId: 'field2',
      })
      schemaCollection.addContextSchema(contextModelMock)
      assert(mockDispatcher.dispatch.withArgs('FETCH_SCHEMA', 'field2').calledOnce, 'Fetch schema not called on non-existing schema')
      mockDispatcher.dispatch.reset()

      contextModelMock = new ContextModelMock({
        id: 'context3',
      })
      schemaCollection.addContextSchema(contextModelMock)
      assert(mockDispatcher.dispatch.notCalled, 'Fetch schema called on undefined schema')
      mockDispatcher.dispatch.reset()
    });
  });
})
