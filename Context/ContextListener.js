/**
 * @file
 * Provides a mechanism for controlling subscriptions to multiple contexts.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

/**
 * Listens to a group of context's edit buffers.
 */
module.exports = function() {
};

_.extend(module.exports.prototype, Backbone.Events, {

  /**
   * Add a context to the listener.
   *
   * @param {Context} context
   *   The context to listen to.
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

  cleanup: function() {
    this.stopListening();
  }
});
