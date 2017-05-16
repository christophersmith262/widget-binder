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
  isAllowed: function(id, schemaId) {
    var model = this.get(id);
    return !!(model && model.get('allowed')[schemaId]);
  },

  /**
   */
  addContextSchema: function(contextModel) {
    var id = contextModel.get('schemaId');
    if (id) {
      this._dispatcher.dispatch('FETCH_SCHEMA', {}, id);
    }
  }

});
