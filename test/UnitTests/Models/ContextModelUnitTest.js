
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const ContextModel = rewire('../../../Models/ContextModel')

var editBufferItemCollectionMock 
var contextSettings = {
  'hello': 'world',
}

function createContextModel(attributes) {
  editBufferItemCollectionMock = new Backbone.Collection()
  return new ContextModel(attributes, { editBuffer: editBufferItemCollectionMock})
}

describe('ContextModel module', () => {
  describe('"set"', () => {
    it('should allow clients to set model attributes with edit buffer items', function() {
      var model = createContextModel({
        id: 'context1',
        editBufferItems: [
          {
            id: 'item1',
          },
          {
            id: 'item2',
          }
        ]
      })
      expect(editBufferItemCollectionMock.get('item1').get('id')).to.eql('item1')
      expect(editBufferItemCollectionMock.get('item2').get('id')).to.eql('item2')

      model = createContextModel({
        id: 'context2',
      })
      model.set({'prop1': 'test'})
      expect(model.get('prop1')).to.eql('test')
    })
  })
  describe('"getSettings"', () => {
    it('should allow clients to get the context settings', function() {
      expect(createContextModel({id: 'context1', settings: contextSettings}).getSettings()).to.eql(contextSettings)
      expect(createContextModel({id: 'context1'}).getSettings()).to.eql({})
    })
  })
  describe('"getSetting"', () => {
    it('should allow clients to get a specific context setting', function() {
      expect(createContextModel({id: 'context1', settings: contextSettings}).getSetting('hello')).to.eql('world')
      expect(createContextModel({id: 'context1', settings: contextSettings}).getSetting('another')).to.be.a('undefined')
      expect(createContextModel({id: 'context1'}).getSetting('hello')).to.be.a('undefined')
    })
  })
})
