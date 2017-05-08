
'use strict';

module.exports = {
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
  },
  views: {
    'editor': {
      prototype: require('./Views/WidgetEditorView'),
      config: {
        template: require('./Templates/WidgetEditorViewTemplate'),
      }
    },
    'export': {
      prototype: require('./Views/WidgetMementoView'),
      config: {
        template: require('./Templates/WidgetMementoViewTemplate'),
      },
    },
  },
  plugins: {
    adapter: null,
    protocol: null,
  },
  elements: {
    widget: {
      tag: 'div',
      attributes: {
        'data-uuid': '<uuid>',
        'data-context-hint': '<context>',
        'class': 'widget-sync-widget'
      }
    },
    field: {
      tag: 'div',
      attributes: {
        'data-field-name': '<field>',
        'data-context': '<context>',
        'class': 'widget-sync-field'
      }
    }
  },
  data: {
    context: {},
    schema: {},
    editBufferItem: {},
  }
};
