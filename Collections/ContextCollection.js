/**
 * @file
 * A Backbone collection of schema models.
 */

'use strict';

var Backbone = require('backbone'),
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
        var model = new ContextModel({ id: contextString, settings: settings });
        this.add(model);
      }
    }
    return Backbone.Collection.prototype.get.call(this, contextString);
  },

  /**
   */
  touch: function(contextString) {
    this.get(contextString);
  }

});
