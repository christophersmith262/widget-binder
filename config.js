
'use strict';

module.exports = {

  name: 'default',

  servicePrototypes: {
    'CommandEmitter': require('./Editor/Command/CommandEmitter'),
    'ContextCollection': require('./Collections/ContextCollection'),
    'ContextListener': require('./Context/ContextListener'),
    'ContextResolver': require('./Context/ContextResolver'),
    'EditBufferItemRefFactory': require('./EditBuffer/EditBufferItemRefFactory'),
    'EditBufferMediator': require('./EditBuffer/EditBufferMediator'),
    'EditorCollection': require('./Collections/EditorCollection'),
    'ElementFactory': require('./Element/ElementFactory'),
    'SchemaCollection': require('./Collections/SchemaCollection'),
    'SyncActionDispatcher': require('./SyncAction/SyncActionDispatcher'),
    'SyncActionResolver': require('./SyncAction/SyncActionResolver'),
    'WidgetFactory': require('./Editor/Widget/WidgetFactory'),
    'WidgetManager': require('./Editor/Widget/WidgetManager'),
    'WidgetStore': require('./Editor/Widget/WidgetStore'),
    'WidgetViewFactory': require('./Editor/Widget/WidgetViewFactory'),
    'EditorView': require('./Views/EditorView'),
  },

  views: {
    'editor': {
      prototype: require('./Views/WidgetEditorView'),
      options: {
        template: require('./Templates/WidgetEditorViewTemplate'),
      }
    },
    'export': {
      prototype: require('./Views/WidgetMementoView'),
      options: {
        template: require('./Templates/WidgetMementoViewTemplate'),
      },
    },
  },

  plugins: {
    adapter: null,
    protocol: null,
  },

  elements: {
    'editor': {
      attributes: {
        'data-context': '<context>',
      },
    },
    'widget': {
      tag: 'div',
      attributes: {
        'data-uuid': '<uuid>',
        'data-context-hint': '<context>',
        'data-viewmode': '<viewmode>',
        'class': 'widget-sync-widget'
      }
    },
    'field': {
      tag: 'div',
      attributes: {
        'data-field-name': '<field>',
        'data-context': '<context>',
        'data-mutable': '<editable>',
        'class': 'widget-sync-field'
      }
    },
    'widget-display': {
      tag: 'div',
      attributes: {
        'class': 'widget-sync-widget__display',
      }
    },
    'toolbar': {
      tag: 'ul',
      attributes: {
        'class': 'widget-sync-toolbox',
      }
    },
    'toolbar-item': {
      tag: 'li',
      attributes: {
        'class': 'widget-sync-toolbox__item',
      }
    },
    'widget-command': {
      tag: 'a',
      attributes: {
        'class': 'widget-sync-command',
        'data-command': '<command>',
        'href': '#',
      }
    }
  },

  data: {
    context: {},
    schema: {},
  }
};
