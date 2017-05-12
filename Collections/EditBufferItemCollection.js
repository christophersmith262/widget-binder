/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var Backbone = require('backbone'),
  EditBufferItemModel = require('../Models/EditBufferItemModel');

/**
 */
module.exports = Backbone.Collection.extend({

  model: EditBufferItemModel,

  /**
   */
  initialize: function(models, options) {
    this._contextId = options.contextId;
  },

  /**
   */
  getItem: function(commandEmitter, uuid) {
    var itemModel = this.get(uuid);
    if (!itemModel) {
      itemModel = this.add({id: uuid}, {merge: true});
      commandEmitter.render(this.getContextId(), uuid);
    }
    return itemModel;
  },

  /**
   */
  setItem: function(itemModel) {
    return this.add(itemModel, {merge: true});
  },

  /**
   */
  removeItem: function(uuid) {
    this.remove(uuid);
  },

  /**
   */
  getContextId: function() {
    return this._contextId;
  }
});
