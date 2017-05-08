/**
 * @file
 * A Backbone collection of schema entry models
 */

'use strict';

var Backbone = require('backbone'),
  SchemaModel = require('../models/SchemaModel');

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
  isAllowed: function(id, bundleName) {
    var model = this.get(id);
    return !!(model && model.get('allowed')[bundleName]);
  },

  /**
   */
  addContextSchema: function(contextModel) {
    var id = contextModel.get('field');
    if (id) {
      this._dispatcher.dispatch('FETCH_SCHEMA', {}, id);
    }
  }

});
