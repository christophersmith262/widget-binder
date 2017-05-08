
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const EditorModel = rewire('../../../Models/EditorModel')

describe('EditorModel module', () => {
  describe('"construct"', () => {
    it('should allow clients to create new editors', function() {
      var model = new EditorModel({id: 'editor1'}, {
        widgetManager: 'test1',
        widgetStore: 'test2'
      })
      expect(model.widgetManager).to.eql('test1')
      expect(model.widgetStore).to.eql('test2')
    })
  })
})
