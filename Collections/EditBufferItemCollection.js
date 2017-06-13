/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var Backbone = require('backbone'),
  EditBufferItemModel = require('../Models/EditBufferItemModel');

/**
 * Backbone Collection for edit buffer item models.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Collection.extend({

  model: EditBufferItemModel,

  /**
   * @inheritdoc
   */
  initialize: function(models, options) {
    this._contextId = options.contextId;
  },

  /**
   * Get an edit buffer item model.
   *
   * Loads the item from the server it does not currently exist in the client-side
   * buffer.
   *
   * @param {CommandEmitter} commandEmitter
   *   The editor command emitter to use in case the item cannot be found
   *   locally.
   * @param {string} uuid
   *   The edit buffer item id to get.
   *
   * @return {Backbone.Model}
   *   The buffer item model.
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
   * Provides a consistent 'setter' API wrapper.
   *
   * @param {Backbone.Model} itemModel
   *   The model to be set in the collection.
   *
   * @return {mixed}
   *   See return value for Backbone.Collection.add.
   */
  setItem: function(itemModel) {
    return this.add(itemModel, {merge: true});
  },

  /**
   * Provides a consistent API wrapper for removing items.
   *
   * @param {string} uuid
   *   The uuid to be removed from the collection.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  removeItem: function(uuid) {
    this.remove(uuid);
  },

  /**
   * Gets the context id this edit buffer belongs to.
   *
   * @return {string}
   *   The context id.
   */
  getContextId: function() {
    return this._contextId;
  }
});
