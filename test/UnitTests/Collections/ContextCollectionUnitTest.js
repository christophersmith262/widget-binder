
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const ContextCollection = rewire('../../../Collections/ContextCollection')

const EditBufferItemCollectionMock = Backbone.Collection.extend({
  type: 'EditBufferItemCollection'
})

const ContextModelMock = Backbone.Model.extend({
  type: 'Context',

  initialize: function(attributes, options) {
    this.options = options;
    this.attributes = attributes;
  }
});

ContextCollection.__set__('ContextModel', ContextModelMock)

describe('ContextCollection module', () => {
  describe('"get"', () => {
    it('should allow lazy loading of contexts', function() {
      var contextCollection = new ContextCollection();
      var settings = { test: 'sdmc09340m0' }
      var model1 = contextCollection.get('model1')
      var model2 = contextCollection.get('model2', settings)
      var model3 = contextCollection.get('model1', settings)
      expect(model1.type).to.eql('Context')
      expect(model1.attributes.settings).to.eql({})
      expect(model2.type).to.eql('Context')
      expect(model2.attributes.settings).to.eql(settings)
      expect(model3.type).to.eql('Context')
      expect(model1.cid).to.not.eql(model2.cid)
      expect(model3.cid).to.eql(model1.cid)
      expect(model3.attributes.settings).to.eql({})
      expect(contextCollection.get('model4', {}, true)).to.be.a('undefined')
    })
  });
  describe('"touch"', () => {
    it('should allow clients to use the touch alias for get', function() {
      var contextCollection = new ContextCollection();
      contextCollection.touch('model1')
      expect(contextCollection.get('model1', {}, true)).to.not.be.a('undefined')
    })
  });
})
