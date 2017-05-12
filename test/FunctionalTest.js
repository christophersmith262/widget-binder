
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

const WidgetSync = require('../');

var watcher;

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
const TestAdapter = WidgetSync.PluginInterface.EditorAdapter.extend({

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
    watcher.widgetManager.track(widget, widget.id, $widget);
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
const TestProtocol = WidgetSync.PluginInterface.SyncProtocol.extend({

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
    this.dataStore = new WidgetSync();
    this.contexts = this.dataStore.getContexts();
    this.nextId = 1;
  },

  send: function(type, data, settings, resolver) {
    switch (type) {
      case 'INSERT_ITEM':
        var editBufferItem = this.createEditBufferItem(data.targetContext, data.bundle);
        var response = { editBufferItem: {} };
        response.editBufferItem[editBufferItem.id] = editBufferItem;
        resolver.resolve(response);
        break;
    }
  },

  createEditBufferItem: function(contextId, bundle) {
    var editBufferItem = {
      id: this.nextId++,
      contextId: contextId,
      insert: true,
      markup: '<div data-field-name="field1" data-context="nestedcontext" class="widget-sync-field"></div>',
      type: bundle,
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

    var widgetSync = new WidgetSync({
      plugins: {
        adapter: new TestAdapter(editor),
        protocol: new TestProtocol(),
      },
    });

    watcher = widgetSync.watch($('.editor'));
    watcher.widgetManager.insert($('.editor'), 'bundle1');
}

test();

/*describe('Functional Test', () => {
  it('should be creatable', function() {
    test();
  })
})*/
