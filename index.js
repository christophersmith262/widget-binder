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
  PluginInterface: {
    EditorAdapter: require('./Plugins/EditorAdapter'),
    SyncProtocol: require('./Plugins/SyncProtocol'),
  }
});

_.extend(module.exports.prototype, {

  /**
   */
  getInstanceName: function() {
    return this._globalSettings.name;
  },

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
  watch: function($editorEl) {
    var editorContext = this._createContextResolver().resolveTargetContext($editorEl);
    var editorContextId = editorContext ? editorContext.get('id') : null;
    var editorModel;
    if (editorContextId) {
      if (!this._editorCollection.get(editorContextId)) {
        var contextResolver = this._createContextResolver(editorContext);
        var commandEmitter = this._createService('CommandEmitter', this._syncActionDispatcher, editorContext);
        var editBufferItemRefFactory = this._createService('EditBufferItemRefFactory', contextResolver, commandEmitter);

        // Setup a context listener for recieving buffer item arrival
        // notifications, and a context resolver for determining which
        // context(s) an element is associated with.
        var contextListener = this._createService('ContextListener');
        contextListener.addContext(editorContext);

        // Create factories for generating models and views.
        var adapter = this._globalSettings.plugins.adapter;
        var uuidAttribute = this._elementFactory.getTemplate('widget').getAttributeName('<uuid>');
        var widgetFactory = this._createService('WidgetFactory', contextResolver, editBufferItemRefFactory, uuidAttribute);

        // Create a table for storing widget instances and a tracker tracker for
        // maintaining the table based on the editor state.
        var widgetStore = this._createService('WidgetStore', adapter);

        // Create a mediator for controlling interactions between the widget
        // table and the edit buffer.
        var editBufferMediator = this._createService('EditBufferMediator', editBufferItemRefFactory, this._elementFactory, contextListener, adapter, contextResolver);

        // Create the editor model and return it to the caller.
        editorModel = new this._globalSettings.servicePrototypes.EditorCollection.prototype.model({
          id: editorContextId,
        }, {
          widgetManager: this._createService('WidgetManager', widgetFactory, this._viewFactory, widgetStore, editBufferMediator),
          widgetStore: widgetStore,
        });
        this._createService('EditorView', {
          model: editorModel,
          el: $editorEl[0],
        }, {
          elementFactory: this._elementFactory,
        });
        this._editorCollection.set(editorModel);
      }
    }

    return editorModel;
  },

  /**
   */
  _initialize: function(config) {
    this._globalSettings = _.defaults(config, module.exports.defaults);

    // Create the action dispatcher / resolution services for handling syncing
    // data with the server.
    this._syncActionResolver = this._createService('SyncActionResolver');
    this._syncActionDispatcher = this._createService('SyncActionDispatcher', this._globalSettings.plugins.protocol, this._syncActionResolver);

    // Create the top level collections that are shared across editor instances.
    var editorCollection = this._createService('EditorCollection');
    var contextCollection = this._createService('ContextCollection');
    var schemaCollection = this._createService('SchemaCollection', [], {
      contextCollection: contextCollection,
      dispatcher: this._syncActionDispatcher,
    });
    this._editorCollection = schemaCollection;
    this._contextCollection = contextCollection;
    this._schemaCollection = schemaCollection;

    // Set up the collections that the sync action resolver should watch for
    // updates to.
    this._syncActionResolver.addCollection('context', this._contextCollection);
    this._syncActionResolver.addCollection('schema', this._schemaCollection);
    this._syncActionResolver.addCollection('editBufferItem', function(attributes) {
      return contextCollection.get(attributes.contextId).editBuffer;
    });
    this._syncActionResolver.addCollection('widget', function(attributes) {
      return editorCollection.get(attributes.contextId).widgetStore;
    });

    // Create an element factory to provide a generic way to create markup.
    this._elementFactory = this._createService('ElementFactory', this._globalSettings.elements);

    // Create a view factory for generating widget views.
    this._viewFactory = this._createService('WidgetViewFactory', this._elementFactory, this._globalSettings.plugins.adapter);
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
    return this._createService('ContextResolver', this._contextCollection, sourceContextAttribute, targetContextAttribute, editorContext);
  },

  /**
   * Creates a service based on the configured prototype.
   *
   * Service names are the same as class names. We only support services with up
   * to five arguments
   *
   * @param {string} name
   *   The name of the service to be created. This is the default class name.
   *
   * @return {object}
   *   The created service. Note that a new service will be created each time
   *   this method is called. No static caching is performed.
   */
  _createService: function(name) {
    // All arguments that follow the 'name' argument are injected as
    // dependencies into the created object.
    var args = [];
    for (var i = 1; i < arguments.length; ++i) {
      args.push(arguments[i]);
    }

    // We explicitly call the constructor here instead of doing some fancy magic
    // with wrapper classes in order to insure that the created object is
    // actually an instanceof the prototype.
    var prototype = this._globalSettings.servicePrototypes[name];
    switch (args.length) {
      case 0:
        return new prototype()
      case 1:
        return new prototype(args[0])
      case 2:
        return new prototype(args[0], args[1])
      case 3:
        return new prototype(args[0], args[1], args[2])
      case 4:
        return new prototype(args[0], args[1], args[2], args[3])
      case 5:
        return new prototype(args[0], args[1], args[2], args[3], args[4])
      default:
        throw new Error('Really, you need to inject more than five services? Consider factoring ' + name + ' into separate classes.')
    }
  }

});

module.exports.createConfig = function() {

  this.registerService = function(name, prototype) {
  }

  this.registerView = function(viewmode, def) {
  }

  this.registerElement = function(name, defintion) {
  }

  this.setViewOptions = function(viewmode, options) {
  }

  this.setViewOption = function(viewmode, options) {
  }

  this.setPlugin = function(type, instance) {
  }

  this.setInitialData = function(data) {
  }
}
