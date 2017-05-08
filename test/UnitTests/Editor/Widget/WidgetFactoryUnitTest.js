
const rewire = require('rewire')
const expect = require('chai').expect
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><div class="editor"></div>')
const $ = require('jquery')(dom.window)
const Backbone = require('backbone')

const WidgetFactory = rewire('../../../../Editor/Widget/WidgetFactory')

const WidgetModelMock = Backbone.Model.extend({
  initialize: function(attributes, options) {
    this.options = options;
  }
})

WidgetFactory.__set__('WidgetModel', WidgetModelMock)

const contextResolverMock = {

  resolveSourceContext: function($el) {
    return new Backbone.Model({id: 'sourcecontext'})
  },

  resolveTargetContext: function($el) {
    return new Backbone.Model({id: 'targetcontext'})
  }
}

function createWidgetFactory() {
  return new WidgetFactory(contextResolverMock, 'reffactory', 'data-uuid')
}

describe('WidgetFactory module', () => {
  describe('"create"', () => {
    it('should provide an insert action', function() {
      var widgetFactory = createWidgetFactory()
      var model = widgetFactory.create({widgetid: 1}, 1, $('<div data-uuid="12345"></div>'))
      expect(model.options).to.eql({
        editBufferItemRefFactory: 'reffactory',
        contextResolver: contextResolverMock,
        widget: {widgetid: 1},
      })
      expect(model.get('id')).to.eql(1)
      expect(model.get('contextId')).to.eql('targetcontext')
      expect(model.get('itemId')).to.eql('12345')
      expect(model.get('itemContextId')).to.eql('sourcecontext')
    });
  });
});
