
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const SchemaModel = rewire('../../../Models/SchemaModel')

describe('SchemaModel module', () => {
  describe('"isAllowed"', () => {
    it('should allow clients to check for allowed children in the schema', function() {
      expect((new SchemaModel({id: 'field1'})).isAllowed('field2')).to.eql(false)
      expect((new SchemaModel({id: 'field1', allowed: { field2: true }})).isAllowed('field2')).to.eql(true)
    })
  })
})
