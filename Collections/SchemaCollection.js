/**
 * @file
 * A Backbone collection of schema entry models
 */

'use strict';

var Backbone = require('backbone'),
  SchemaModel = require('../Models/SchemaModel');

/**
 */
module.exports = Backbone.Collection.extend({

  model: SchemaModel,

  /**
   */
  initialize: function(models, options) {
    this.listenTo(options.contextCollection, 'add', this.addContextSchema);
    this._dispatcher = options.dispatcher;
  },

  /**
   */
  isAllowed: function(schemaId, type) {
    var model = this.get(schemaId);
    return !!(model && model.get('allowed')[type]);
  },

  /**
   */
  addContextSchema: function(contextModel) {
    this._fetchSchema(contextModel);
    this.listenTo(contextModel, 'change:schemaId', this._fetchSchema);
  },

  _fetchSchema: function(contextModel) {
    var id = contextModel.get('schemaId');
    if (id) {
      if (!this.get(id)) {
        this._dispatcher.dispatch('FETCH_SCHEMA', id);
      }
    }
  }

});
