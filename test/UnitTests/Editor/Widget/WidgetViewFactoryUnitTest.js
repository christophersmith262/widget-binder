
const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const WidgetViewFactory = require('../../../../Editor/Widget/WidgetViewFactory')
const WidgetModel = require('../../../../Models/WidgetModel')

const widgetModelMock = sinon.createStubInstance(WidgetModel);

const WidgetViewMock = function(options) {
  var mock = this
  this.options = options;
  this.__name = 'WidgetViewMock'
  this.stopListening = function() {
    mock.stopListeningSpy()
    return mock
  }
  this.stopListeningSpy = sinon.spy()
}

const WidgetViewMock2 = function(options) {
  this.options = options;
  this.__name = 'WidgetViewMock2'
}

const jQueryMock = function(marker) {
  this.get = function() {
    return marker
  }
}

var contextResolver = 'mockcontextresolver';
var elementFactory = 'mockelementfactory';
var adapter = 'mockadapter';

describe('WidgetViewFactory module', () => {
  describe('"register"', () => {
    it('should allow clients to register new views', function() {
      var widgetViewFactory = new WidgetViewFactory(contextResolver, elementFactory, adapter);
      expect(widgetViewFactory.register.bind(widgetViewFactory, 'invalid1')).to.throw(Error);
      expect(widgetViewFactory.register.bind(widgetViewFactory, 'invalid2', {
        template: function() {}
      })).to.throw(Error);
      var def = {
        prototype: WidgetViewMock
      }
      expect(widgetViewFactory.register('valid', def)).to.eql(def)
    });
  });
  describe('"create"', () => {
    it('should allow clients to create view instances', function() {
      var widgetViewFactory = new WidgetViewFactory(contextResolver, elementFactory, adapter);
      widgetViewFactory.register('view1', {
        prototype: WidgetViewMock,
        options: {
          template: 'mocktemplate1',
        }
      })
      widgetViewFactory.register('view2', {
        prototype: WidgetViewMock2,
        options: {
          template: 'mocktemplate2',
        }
      })
      var $el1 = new jQueryMock('div');
      var $el2 = new jQueryMock('span');
      var view1 = widgetViewFactory.create(widgetModelMock, $el1, 'view1')
      var view2 = widgetViewFactory.create(widgetModelMock, $el2, 'view2')
      expect(view1.options).to.eql({
        model: widgetModelMock,
        adapter: 'mockadapter',
        contextResolver: 'mockcontextresolver',
        elementFactory: 'mockelementfactory',
        el: 'div',
        template: 'mocktemplate1',
      })
      expect(view1.__name).to.eql('WidgetViewMock')
      expect(view2.options).to.eql({
        model: widgetModelMock,
        adapter: 'mockadapter',
        contextResolver: 'mockcontextresolver',
        elementFactory: 'mockelementfactory',
        el: 'span',
        template: 'mocktemplate2',
      })
      expect(view2.__name).to.eql('WidgetViewMock2')
      expect(widgetViewFactory.create.bind(widgetViewFactory, widgetModelMock, $el1)).to.throw(Error)
      widgetModelMock.get.withArgs('viewMode').returns('view1')
      var view3 = widgetViewFactory.create(widgetModelMock, $el1)
      expect(view3.options).to.eql({
        model: widgetModelMock,
        adapter: 'mockadapter',
        contextResolver: 'mockcontextresolver',
        elementFactory: 'mockelementfactory',
        el: 'div',
        template: 'mocktemplate1',
      })
      expect(view3.__name).to.eql('WidgetViewMock')
      widgetModelMock.get.restore()
    });
  });
  describe('"createTemporary"', () => {
    it('should allow clients to create view instances without any listeners', function() {
      var widgetViewFactory = new WidgetViewFactory(contextResolver, elementFactory, adapter);
      widgetViewFactory.register('view1', {
        prototype: WidgetViewMock,
        options: {
          template: 'mocktemplate1',
        }
      })
      var $el = new jQueryMock('div');
      var view = widgetViewFactory.createTemporary(widgetModelMock, $el, 'view1')
      assert(view.stopListeningSpy.calledOnce)
    });
  });
});
