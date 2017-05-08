
'use strict'

const expect = require('chai').expect
const assert = require('chai').assert
const sinon = require('sinon')
const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM()
const $ = require('jquery')(dom.window)
const Backbone = require('backbone')

const ContextResolver = require('../../../Context/ContextResolver')

const sourceContextAttribute = 'data-source-context'
const targetContextAttribute = 'data-target-context'
const editorSettings = { test: 'jof40992' }

const ContextMock = Backbone.Model.extend({
  getSettings: function() {
    return this.get('settings')
  }
})

const ContextCollectionMock = Backbone.Collection.extend({
  model: ContextMock,

  get: function(id, settings) {
    if (typeof id == 'string' && !Backbone.Collection.prototype.get.call(this, id)) {
      this.add(new ContextMock({
        id: id,
        settings: settings,
      }))
    }
    return Backbone.Collection.prototype.get.call(this, id)
  }
})

var editorContextMock, contextCollectionMock

function createContextResolver(noEditorContext) {
  if (!noEditorContext) {
    editorContextMock = new ContextMock({
      id: 'editorcontext',
      settings: editorSettings,
    })
  }
  else {
    editorContextMock = undefined
  }
  contextCollectionMock = new ContextCollectionMock()
  contextCollectionMock.add(editorContextMock)
  return new ContextResolver(contextCollectionMock, sourceContextAttribute, targetContextAttribute, editorContextMock)
}

describe('ContextResolver module', () => {
  describe('"resolveTargetContext"', () => {
    it('should allow clients to get a target context based on a jquery element', function() {
      var contextResolver = createContextResolver()

      var $markup = $('<div data-target-context="editorcontext"><div class="widget"></div></div>')
      var $widget = $markup.find('.widget')
      var context = contextResolver.resolveTargetContext($widget)
      expect(context.get('id')).to.eql('editorcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      $widget = $('<div data-target-context="editorcontext" class="widget"></div>')
      context = contextResolver.resolveTargetContext($widget)
      expect(context.get('id')).to.eql('editorcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      $markup = $('<div data-target-context="nestedcontext"><div class="widget"></div></div>')
      $widget = $markup.find('.widget')
      context = contextResolver.resolveTargetContext($widget)
      expect(context.get('id')).to.eql('nestedcontext')
      expect(context.getSettings()).to.eql(editorSettings)
    })
  })
  describe('"resolveSourceContext"', () => {
    it('should allow clients to get a source context based on a jquery element', function() {
      var contextResolver = createContextResolver()

      var $widget = $('<div data-source-context="nestedcontext"></div>')
      var context = contextResolver.resolveSourceContext($widget)
      expect(context.get('id')).to.eql('nestedcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      $widget = $('<div></div>')
      context = contextResolver.resolveSourceContext($widget)
      expect(context.get('id')).to.eql('editorcontext')
      expect(context.getSettings()).to.eql(editorSettings)
    })
  })
  describe('"getEditorContext"', () => {
    it('should allow clients to get the root editor context', function() {
      var contextResolver = createContextResolver()
      return expect(contextResolver.getEditorContext()).to.eql(editorContextMock)
    })
  })
  describe('"get"', () => {
    it('should allow clients to lazy load contexts', function() {
      var contextResolver = createContextResolver()

      var context = contextResolver.get('editorcontext')
      expect(context.get('id')).to.eql('editorcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      context = contextResolver.get('nestedcontext')
      expect(context.get('id')).to.eql('nestedcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      context = contextResolver.get()
      expect(context.get('id')).to.eql('editorcontext')
      expect(context.getSettings()).to.eql(editorSettings)

      contextResolver = createContextResolver(true)
      context = contextResolver.get('nestedcontext')
      expect(context.get('id')).to.eql('nestedcontext')
      expect(context.getSettings()).to.eql({})
    })
  })
  describe('"touch"', () => {
    it('should allow clients to ensure contexts exist', function() {
      var contextResolver = createContextResolver()
      contextCollectionMock.touch = sinon.spy()

      contextResolver.touch('editorcontext')
      assert(contextCollectionMock.touch.withArgs('editorcontext').calledOnce, 'context collection touch method not called')
      contextCollectionMock.touch.reset()

      contextResolver.touch('nestedcontext')
      assert(contextCollectionMock.touch.withArgs('nestedcontext').calledOnce, 'context collection touch method not called (2)')
      contextCollectionMock.touch.reset()
    })
  })
})
