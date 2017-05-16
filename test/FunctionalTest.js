
'use strict';

const expect = require('chai').expect;
const config = require('chai').config;

const jsdom = require('jsdom')
const { JSDOM } = jsdom
const dom = new JSDOM('<!DOCTYPE html><div class="editor" data-context="rootcontext"></div>')
const $ = require('jquery')(dom.window)
const Backbone = require('backbone')
Backbone.$ = $;

config.includeStack = true;

const WidgetBinder = require('../');

var binder;

const Editor = function($el) {
  this.$el = $el;
  this.makeEditable($el);
  this.setSelectedElement($el);
}

Editor.prototype = {

  getEditorEl: function() {
    return this.$el;
  },

  makeEditable: function($el) {
    $el.attr('content-editable', true);
  },

  isEditable: function($el) {
    return !!$el.attr('content-editable');
  },

  edit: function($el, edit) {
    $el.html(edit);
  },

  getSelectedElement: function() {
    return this.$selected;
  },

  setSelectedElement: function($el) {
    if (!this.isEditable($el)) {
      throw new Error('Cannot select a non-editable region');
    }
    this.$selected = $el;
  }
}

/**
 * Simulates an editor integration.
 */
const TestAdapter = WidgetBinder.PluginInterface.EditorAdapter.extend({

  constructor: function(editor) {
    this.editor = editor;
    this.nextId = 1;
    this.widgets = {};
  },

  insertEmbedCode: function(embedCode) {
    var $widget = $(embedCode.renderOpeningTag() + embedCode.renderClosingTag());
    this.editor.getSelectedElement().append($widget);
    var widget = {
      id: this.nextId++,
    };
    this.widgets[widget.id] = widget;
    binder.bind(widget, widget.id, $widget);
  },

  attachInlineEditing: function(widgetView, contextId, selector) {
    this.editor.makeEditable(widgetView.$el.find(selector));
  },

  getInlineEdit: function(widgetView, contextId, selector) {
    return widgetView.$el.find(selector).html();
  },

  getRootEl: function() {
    return this.editor.getEditorEl()[0];
  },

  destroyWidget: function(id) {
    delete this.widgets[id];
  }

});

/**
 * Simulates a server integration.
 */
const TestProtocol = WidgetBinder.PluginInterface.SyncProtocol.extend({

  types: {
    tabs: {
      schema: {
        id: 'tabs',
        allowed: {
          tab: true,
        }
      },
    },
    tab: {
      schema: {
        id: 'tab',
        allowed: {
          tabs: true,
        }
      }
    }
  },

  constructor: function() {
    this.dataStore = new WidgetBinder();
    this.contexts = this.dataStore.getContexts();
    this.nextId = 1;
  },

  send: function(type, data, settings, resolver) {
    switch (type) {
      case 'INSERT_ITEM':
        var editBufferItem = this.createEditBufferItem(data.targetContext, data.type);
        var response = { editBufferItem: {} };
        response.editBufferItem[editBufferItem.id] = editBufferItem;
        resolver.resolve(response);
        break;
    }
  },

  createEditBufferItem: function(contextId, type) {
    var editBufferItem = {
      id: this.nextId++,
      contextId: contextId,
      insert: true,
      markup: '<div data-field-name="field1" data-context="nestedcontext" class="widget-sync-field"></div>',
      type: type,
      fields: {
        field1: {
          type: 'field',
          context: 'nestedcontext',
        }
      },
    };

    this.contexts.get(contextId).editBuffer.add(editBufferItem);

    return editBufferItem;
  }
});

process.on('uncaughtException', function(err) {
  console.log(err);
  process.exit(1);
});

function test() {
    var editor = new Editor($('.editor'));

    var widgetBinder = new WidgetBinder({
      plugins: {
        adapter: new TestAdapter(editor),
        protocol: new TestProtocol(),
      },
    });

    binder = widgetBinder.open($('.editor'));
    binder.create($('.editor'), 'type1');
    console.log($('.editor').html());
    binder.save(1, $('.widget-binder-widget'));
    console.log($('.editor').html());
    binder.close();
}

test();

/*describe('Functional Test', () => {
  it('should be creatable', function() {
    test();
  })
})*/
