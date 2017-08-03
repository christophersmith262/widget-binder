/**
 * @file
 * A package for managing server / client data binding for editor widgets. 
 */

'use strict';

var _ = require('underscore'),
  $ = require('jquery');

/**
 * The widget-sync library application root object.
 *
 * @param {object} config
 *   A map of configuration. See the default configuration as a reference.
 *
 * @constructor
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
  },

  /**
   * A convenience factory method to create the WidgetBinder application root.
   *
   * @param {object} config
   *   A map of configuration. See the default configuration as a reference.
   *
   * @return {WidgetBinder}
   *   The root WidgetBinder library object.
   */
  create: function(config) {
    return new module.exports(config);
  },

  /**
   * Creates a copy of the default configuration and returns it.
   *
   * Call this method to avoid accidently making changes to the default
   * configuration object.
   *
   * @return {object}
   *   A copy of the default configuration object.
   */
  config: function() {
    var defaults = module.exports.defaults;
    var config = {};
    config.servicePrototypes = {};
    _.defaults(config.servicePrototypes, defaults.servicePrototypes);
    config.views = {};
    _.each(defaults.views, function(def, name) {
      config.views[name] = { options: {} };
      _.defaults(config.views[name].options, def.options);
      _.defaults(config.views[name], def);
    });
    config.plugins = {};
    _.defaults(config.plugins, defaults.plugins);
    $.extend(true, config.elements, defaults.elements);
    config.data = {};
    _.defaults(config.data, defaults.data);
    _.defaults(config, defaults);
    return config;
  }
});

_.extend(module.exports.prototype, {

  /**
   * Gets the element factory.
   *
   * @return {ElementFactory}
   *   The element factory used to create element templates and instances.
   */
  getElementFactory: function() {
    return this._elementFactory;
  },

  /**
   * Gets the context collection.
   *
   * @return {ContextCollection}
   *   The collection of all contexts referenced in every bound editor.
   */
  getContexts: function() {
    return this._contextCollection;
  },

  /**
   * Gets the schema collection.
   *
   * @return {SchemaCollection}
   *   The collection of all schema nodes.
   */
  getSchema: function() {
    return this._schemaCollection;
  },

  /**
   * Gets the editor collection.
   *
   * @return {EditorCollection}
   *   The collection of all associated editors.
   */
  getEditors: function() {
    return this._editorCollection;
  },

  /**
   * Gets the sync action dispatcher.
   *
   * @return {SyncActionDispatcher}
   *   The dispatcher for dispatching editor commands.
   */
  getSyncActionDispatcher: function() {
    return this._syncActionDispatcher;
  },

  /**
   * Gets the sync action resolver.
   *
   * @return {SyncActionResolver}
   *   The resolver for resolving sync action commands.
   */
  getSyncActionResolver: function() {
    return this._syncActionResolver;
  },

  /**
   * Opens a widget binder for a given editor.
   *
   * To close the binder later, call binder.close().
   *
   * @see Binder
   *
   * @param {jQuery} $editorEl
   *   The root element for the editor. This must have the context id attached
   *   as an attribute according to the 'field' template '<context>' data key name.
   *   By default this is 'data-context'.
   *
   * @return {Binder}
   *   The opened widget binder for the editor.
   */
  open: function($editorEl) {
    $editorEl.addClass('widget-binder-open');

    var editorContext = this._createContextResolver().resolveTargetContext($editorEl);
    var editorContextId = editorContext ? editorContext.get('id') : null;
    var editorModel;
    if (editorContextId) {
      if (!this._editorCollection.get(editorContextId)) {
        var contextResolver = this._createContextResolver(editorContext);
        var commandEmitter = this._createService('CommandEmitter', this._syncActionDispatcher, contextResolver);
        var editBufferItemRefFactory = this._createService('EditBufferItemRefFactory', contextResolver, commandEmitter);

        // Setup a context listener for recieving buffer item arrival
        // notifications, and a context resolver for determining which
        // context(s) an element is associated with.
        var contextListener = this._createService('ContextListener');
        contextListener.addContext(editorContext);

        // Create factories for generating models and views.
        var adapter = this._globalSettings.plugins.adapter;
        if (typeof adapter.create == 'function') {
          adapter = adapter.create.apply(adapter, arguments);
        }

        // Create a view factory for generating widget views.
        var viewFactory = this._createService('WidgetViewFactory', contextResolver, this._elementFactory, adapter);
        for (var type in this._globalSettings.views) {
          viewFactory.register(type, this._globalSettings.views[type]);
        }

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
          widgetFactory: widgetFactory,
          viewFactory: viewFactory,
          widgetStore: widgetStore,
          editBufferMediator: editBufferMediator,
          context: editorContext,
          contextResolver: contextResolver,
        });
        var editorView = this._createService('EditorView', {
          model: editorModel,
          el: $editorEl[0],
        }, {
          elementFactory: this._elementFactory,
        });
        this._editorCollection.set(editorModel);

        return this._createService('Binder', editorView);
      }
      else {
        throw new Error('Existing binder already open for this editor instance.');
      }
    }
  },

  /**
   * Handles the initialization of objects that live at the application root.
   *
   * @param {object} config
   *   The config object as passed to the constructor.
   *
   * @return {void}
   */
  _initialize: function(config) {
    this._globalSettings = _.defaults(config, module.exports.defaults);

    var protocol = this._globalSettings.plugins.protocol;
    if (typeof protocol.create == 'function') {
      protocol = protocol.create.apply(protocol, arguments);
    }

    // Create the action dispatcher / resolution services for handling syncing
    // data with the server.
    this._syncActionResolver = this._createService('SyncActionResolver');
    this._syncActionDispatcher = this._createService('SyncActionDispatcher', protocol, this._syncActionResolver);

    // Create the top level collections that are shared across editor instances.
    var editorCollection = this._createService('EditorCollection');
    var contextCollection = this._createService('ContextCollection');
    var schemaCollection = this._createService('SchemaCollection', [], {
      contextCollection: contextCollection,
      dispatcher: this._syncActionDispatcher,
    });
    this._editorCollection = editorCollection;
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
      var widgetStore = editorCollection.get(attributes.editorContextId).widgetStore;
      return {
        get: function(id) {
          return widgetStore.get(id).model;
        },
        add: function(attributes) {
          return widgetStore.add(attributes);
        }
      };
    });

    // Create an element factory to provide a generic way to create markup.
    this._elementFactory = this._createService('ElementFactory', this._globalSettings.elements);

    // Load any initial models.
    if (config.data) {
      this._syncActionResolver.resolve(config.data);
    }
  },

  /**
   * Helper function to create a context resolver for a given editor instance.
   *
   * @param {Context} editorContext
   *   The root context of the editor.
   *
   * @return {ContextResolver}
   *   A context resolver specific to the provided editor context.
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
        return new prototype();
      case 1:
        return new prototype(args[0]);
      case 2:
        return new prototype(args[0], args[1]);
      case 3:
        return new prototype(args[0], args[1], args[2]);
      case 4:
        return new prototype(args[0], args[1], args[2], args[3]);
      case 5:
        return new prototype(args[0], args[1], args[2], args[3], args[4]);
      default:
        throw new Error('Really, you need to inject more than five services? Consider factoring ' + name + ' into separate classes.');
    }
  }

});
