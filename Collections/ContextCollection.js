/**
 * @file
 * A Backbone collection of schema models.
 */

'use strict';

var Backbone = require('backbone'),
  ContextModel = require('../Models/ContextModel');

/**
 * Backbone Collection for context models.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Collection.extend({

  model: ContextModel,

  /**
   * @inheritdoc
   */
  get: function(contextId, settings, skipLazyLoad) {
    if (typeof contextId == 'string' && !skipLazyLoad) {
      if (!Backbone.Collection.prototype.get.call(this, contextId)) {
        if (!settings) {
          settings = {};
        }
        var model = new ContextModel({ id: contextId, settings: settings });
        this.add(model);
      }
    }
    return Backbone.Collection.prototype.get.call(this, contextId);
  },

  /**
   * Convenience wrapper for 'get' to ensure that a context exists.
   *
   * @note this does not return the context.
   *
   * @param {string} contextId
   *   The context id to ensure exists.
   *
   * @return {void}
   */
  touch: function(contextId) {
    this.get(contextId);
  }

});
