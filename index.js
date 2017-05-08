/**
 * @file
 * A package for managing server / client data binding for editor widgets. 
 */

'use strict';

var _ = require('underscore'),
  $ = require('backbone').$;

/**
 */
module.exports = function(config) {
  if (!config) {
    config = {};
  }
  this._initialize(config);
};

_.extend(module.exports, {
  defaults: require('./config'),
  pluginInterfaces: {
    EditorAdapter: require('./Plugins/EditorAdapter'),
    SyncProtocol: require('./Plugins/SyncProtocol'),
  }
});

_.extend(module.exports.prototype, {

  /**
   */
  getElementFactory: function() {
    return this._elementFactory;
  },

  /**
   */
  getViewFactory: function() {
    return this._viewFactory;
  },

  /**
   */
  getContexts: function() {
    return this._contextCollection;
  },

  /**
   */
  getSchema: function() {
    return this._schemaCollection;
  },

  /**
   */
  getEditors: function() {
    return this._editorCollection;
  },

  /**
   */
  getSyncActionDispatcher: function() {
    return this._syncActionDispatcher;
  },

  /**
   */
  getSyncActionResolver: function() {
    return this._syncActionResolver;
  },

  /**
   */
  watch: function(subject) {
    var editorContext;
    if (subject instanceof $) {
      editorContext = this._createContextResolver().resolveTargetContext(subject);
    }
    else {
      editorContext = this.getContexts().get(subject);
    }

    var editorContextId = editorContext ? editorContext.get('id') : null;
    if (editorContextId) {
      if (!this._editorCollection.get(editorContextId)) {
        var contextResolver = this._createContextResolver(editorContext);
        var commandEmitter = this._createService('CommandEmitter', this._syncActionDispatcher, editorContext);
        var editBufferItemRefFactory = this._createService('EditBufferItemRefFactory', contextResolver, commandEmitter);

        // Setup a context listener for recieving buffer item arrival
        // notifications, and a context resolver for determining which
        // context(s) an element is associated with.
        var contextListener = this._createService('ContextListener');
        contextListener.addContext(this.editorContext);

        // Create factories for generating models and views.
        var adapter = this._globalSettings.plugins.adapter;
        var widgetFactory = this._createService('WidgetFactory', adapter, contextResolver, editBufferItemRefFactory);

        // Create a table for storing widget instances and a tracker tracker for
        // maintaining the table based on the editor state.
        var widgetStore = this._createService('WidgetStore', adapter);
        var widgetTracker = this._createService('WidgetTracker', adapter, widgetFactory, this._viewFactory, widgetStore);

        // Create a mediator for controlling interactions between the widget
        // table and the edit buffer.
        var editBufferMediator = this._createService('EditBufferMediator', editBufferItemRefFactory, this._elementFactory, contextListener, adapter, contextResolver);

        // Create the editor model and return it to the caller.
        this._editorCollection.set({
          id: editorContextId,
        }, {
          widgetManager: this._createService('WidgetManager', widgetStore, widgetTracker, this._viewFactory, editBufferMediator)
        });
      }
    }

    return this._editors[editorContextId];
  },

  /**
   */
  _initialize: function(config) {
    this._globalSettings = _.extend(config, module.exports.defaults);

    // Create the action dispatcher / resolution services for handling syncing
    // data with the server.
    this._syncActionResolver = this._createService('SyncActionResolver');
    this._syncActionDispatcher = this._createService('SyncActionDispatcher', this._globalSettings.plugins.protocol, this._syncActionResolver);

    // Create the top level collections that are shared across editor instances.
    var editorCollection = this._createService('EditorCollection');
    var contextCollection = this._createService('ContextCollection', _.toArray(this._globalSettings['contexts']));
    var schemaCollection = this._createService('SchemaCollection', _.toArray(this._globalSettings['schema']), {
      contextCollection: contextCollection,
      dispatcher: this._syncActionDispatcher,
    });
    this._schemaCollection = schemaCollection;

    // Set up the collections that the sync action resolver should watch for
    // updates to.
    this._syncActionResolver.addCollection('context', this._contextCollection);
    this._syncActionResolver.addCollection('schema', this._schemaCollection);
    this._syncActionResolver.addCollection('editBufferItem', function(attributes) {
      return contextCollection.get(attributes.contextId).editBufferItemCollection;
    });
    this._syncActionResolver.addCollection('widget', function(attributes) {
      return editorCollection.get(attributes.contextId).widgetStore;
    });

    // Create an element factory to provide a generic way to create markup.
    this._elementFactory = this._createService('ElementFactory', this._globalSettings.elements);

    // Create a view factory for generating widget views.
    var adapter = this._globalSettings.plugins.adapter;
    this._viewFactory = this._createService('WidgetViewFactory', this._elementFactory, adapter);
    for (var type in this._globalSettings.views) {
      this._viewFactory.register(type, this._globalSettings.views[type]);
    }

    // Load any initial models.
    if (config.data) {
      this._syncActionResolver.resolve(config.data);
    }
  },

  /**
   */
  _createContextResolver: function(editorContext) {
    var sourceContextAttribute = this._elementFactory.getTemplate('widget').getAttributeName('<context>');
    var targetContextAttribute = this._elementFactory.getTemplate('field').getAttributeName('<context>');
    return new this._createService('ContextResolver', this._contextCollection, sourceContextAttribute, targetContextAttribute, editorContext);
  },

  /**
   */
  _createService: function(name) {
    var args = [];

    for (var i = 0; i < arguments.length; ++i) {
      args.push(arguments[i]);
    }

    var prototype = this._globalSettings.servicePrototypes[name];
    switch (args.length) {
      case 0:
        return new prototype()
      case 1:
        return new prototype(args[1])
      case 2:
        return new prototype(args[1], args[2])
      case 3:
        return new prototype(args[1], args[2], args[3])
      case 4:
        return new prototype(args[1], args[2], args[3], args[4])
      case 5:
        return new prototype(args[1], args[2], args[3], args[4], args[5])
      default:
        throw new Error('Really, you need to inject more than five services? Consider factoring ' + name + ' into separate classes.')
    }
  }

});
