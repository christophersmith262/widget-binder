/**
 * @file
 * A Backbone collection of schema entry models
 */

'use strict';

var Backbone = require('backbone'),
  SchemaModel = require('../Models/SchemaModel');

/**
 * Backbone Collection for schema models.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Collection.extend({

  model: SchemaModel,

  /**
   * @inheritdoc
   */
  initialize: function(models, options) {
    this.listenTo(options.contextCollection, 'add', this.addContextSchema);
    this._dispatcher = options.dispatcher;
  },

  /**
   * Checks if a type is allowed within a given schema node.
   *
   * @param {string} schemaId
   *   The schema id to check within.
   * @param {string} type
   *   The type to check for.
   *
   * @return {bool}
   *   True if the type is allowed, false otherwise.
   */
  isAllowed: function(schemaId, type) {
    var model = this.get(schemaId);
    return !!(model && model.get('allowed')[type]);
  },

  /**
   * Adds the schema for a given context.
   *
   * @param {Context} contextModel
   *   The context to add the schema for.
   *
   * @return {void}
   */
  addContextSchema: function(contextModel) {
    this._fetchSchema(contextModel);
    this.listenTo(contextModel, 'change:schemaId', this._fetchSchema);
  },

  /**
   * Helper function to fetch the schema for a model if it doesn't exist.
   *
   * @param {Context} contextModel
   *   The model to fetch the schema for.
   *
   * @return {void}
   */
  _fetchSchema: function(contextModel) {
    var id = contextModel.get('schemaId');
    if (id) {
      if (!this.get(id)) {
        // Create a placeholder to prevent concurrent requests for the same
        // schema, then dispatch the schema request.
        this.add({ id: id });
        this._dispatcher.dispatch('FETCH_SCHEMA', id);
      }
    }
  }

});
