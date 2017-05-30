
'use strict';

module.exports = {

  name: 'default',

  servicePrototypes: {
    'Binder': require('./Binder'),
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
    adapter: {},
    protocol: {},
  },

  elements: {
    'widget': {
      tag: 'div',
      attributes: {
        'data-uuid': '<uuid>',
        'data-context-hint': '<context>',
        'data-viewmode': '<viewmode>',
        'class': 'widget-binder-widget'
      },
      selector: '.widget-binder-widget[data-context-hint]',
    },
    'field': {
      tag: 'div',
      attributes: {
        'data-field-name': '<name>',
        'data-context': '<context>',
        'data-mutable': '<editable>',
        'class': 'widget-binder-field'
      },
      selector: '.widget-binder-field[data-mutable="true"]',
    },
    'widget-display': {
      tag: 'div',
      attributes: {
        'class': 'widget-binder-widget__display',
      }
    },
    'toolbar': {
      tag: 'ul',
      attributes: {
        'class': 'widget-binder-toolbox',
      }
    },
    'toolbar-item': {
      tag: 'li',
      attributes: {
        'class': 'widget-binder-toolbox__item',
      }
    },
    'widget-command': {
      tag: 'a',
      attributes: {
        'class': 'widget-binder-command',
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
