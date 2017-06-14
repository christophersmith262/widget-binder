
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const ElementFactory = rewire('../../../Element/ElementFactory')

const ElementMock = function(tag, attributesMap, selector, data) {
  this.tag = tag;
  this.attributesMap = attributesMap;
  this.selector = selector;
  this.data = data;
}
ElementFactory.__set__('Element', ElementMock);

const elements = {
  widget: {
    tag: 'span',
    selector: 'selector1',
    attributes: {
      'data-uuid': '<uuid>',
      'data-context-hint': '<context>',
      'class': "widget-sync-widget"
    }
  },
  field: {
    tag: 'div',
    selector: 'selector2',
    attributes: {
      'data-field-name': '<field>',
      'data-context': '<context>',
      'class': "widget-sync-field"
    }
  },
  noattr: {
    tag: 'ul'
  }
}

describe('ElementFactory module', () => {
  describe('"getTemplate"', () => {
    it('should allow clients to get an empty element', function() {
      var elementFactory = new ElementFactory(elements);
      var widgetTemplate = elementFactory.getTemplate('widget');
      var fieldTemplate = elementFactory.getTemplate('field');
      var noattrTemplate = elementFactory.getTemplate('noattr');
      expect(widgetTemplate).to.be.an.instanceof(ElementMock);
      expect(widgetTemplate.tag).to.eql(elements.widget.tag);
      expect(widgetTemplate.attributesMap).to.eql(elements.widget.attributes);
      expect(widgetTemplate.data).to.be.a('undefined');
      expect(fieldTemplate.tag).to.eql(elements.field.tag);
      expect(fieldTemplate.attributesMap).to.eql(elements.field.attributes);
      expect(fieldTemplate.data).to.be.a('undefined');
      expect(fieldTemplate).to.be.an.instanceof(ElementMock);
      expect(elementFactory.getTemplate).to.throw(Error);
      expect(noattrTemplate.attributesMap).to.eql({})
    });
  });
  describe('"create"', () => {
    it('should allow clients to create an element', function() {
      var elementFactory = new ElementFactory(elements);
      var widgetData = {
        'context': 'test1',
        'uuid': 'test2',
      };
      var fieldData = {
        'test3': 'test4',
      };
      var widgetElement = elementFactory.create('widget', widgetData);
      var fieldElement = elementFactory.create('field', fieldData);
      expect(widgetElement).to.be.an.instanceof(ElementMock);
      expect(widgetElement.tag).to.eql(elements.widget.tag);
      expect(widgetElement.attributesMap).to.eql(elements.widget.attributes);
      expect(widgetElement.selector).to.eql(elements.widget.selector);
      expect(widgetElement.data).to.eql(widgetData);
      expect(fieldElement.tag).to.eql(elements.field.tag);
      expect(fieldElement.attributesMap).to.eql(elements.field.attributes);
      expect(fieldElement.selector).to.eql(elements.field.selector);
      expect(fieldElement.data).to.eql(fieldData);
      expect(fieldElement).to.be.an.instanceof(ElementMock);
      expect(elementFactory.create.bind(elementFactory)).to.throw(Error);
    });
  });
});
