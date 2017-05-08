/**
 * @file
 * A Backbone collection of schema models.
 */

'use strict';

var Backbone = require('backbone'),
  EditBufferItemCollection = require('./EditBufferItemCollection'),
  ContextModel = require('../Models/ContextModel');

/**
 */
module.exports = Backbone.Collection.extend({

  model: ContextModel,

  /**
   */
  get: function(contextString, settings, skipLazyLoad) {
    if (typeof contextString == 'string' && !skipLazyLoad) {
      if (!Backbone.Collection.prototype.get.call(this, contextString)) {
        if (!settings) {
          settings = {};
        }
        var editBuffer = new EditBufferItemCollection([], { contextId: contextString });
        var model = new ContextModel({ id: contextString }, { editBuffer: editBuffer, settings: settings });
        this.add(model);
      }
    }
    return Backbone.Collection.prototype.get.call(this, contextString);
  },

  /**
   */
  touch: function(contextString) {
    this.get(contextString);
  },

});
