/**
 * @file
 * Provides a mechanism for controlling subscriptions to multiple contexts.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

/**
 * Listens to a group of context's edit buffers.
 *
 * @constructor
 */
module.exports = function() {
};

_.extend(module.exports.prototype, Backbone.Events, {

  /**
   * Add a context to the listener.
   *
   * @param {Context} context
   *   The context to listen to.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  addContext: function(context) {
    this.listenTo(context.editBuffer, 'add', this._triggerEvents);
    return this;
  },

  /**
   * Emits an 'insertItem' or 'updateItem' event for a model.
   *
   * @param {EditBufferItemModel} bufferItemModel
   *   The model that the event is being triggered for.
   *
   * @return {void}
   */
  _triggerEvents: function(bufferItemModel) {
    if (bufferItemModel.get('insert')) {
      this.trigger('insertItem', bufferItemModel);
      bufferItemModel.set({insert: false});
    }
    else {
      this.trigger('updateItem', bufferItemModel);
    }
  },

  /**
   * Cleans up after the object when it is ready to be destroyed.
   *
   * @return {void}
   */
  cleanup: function() {
    this.stopListening();
  }
});
