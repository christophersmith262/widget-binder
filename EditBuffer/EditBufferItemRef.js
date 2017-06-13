/**
 * @file
 * Provides an actionable reference to a edit buffer item.
 */

'use strict';

var _ = require('underscore');

/**
 * Represents a reference to an edit buffer item.
 *
 * @param {EditBufferItemModel} bufferItemModel
 *   The model this will reference.
 * @param {Context} sourceContext
 *   The context the edit buffer item says it belongs to.
 * @param {Conext} targetContext
 *   The context the edit buffer item's associated widget lives in.
 * @param {CommandEmitter} commandEmitter
 *   A command emitter for emitting commands related to the referenced edit
 *   buffer item.
 *
 * @constructor
 */
module.exports = function(bufferItemModel, sourceContext, targetContext, commandEmitter) {
  this.editBufferItem = bufferItemModel; 
  this.sourceContext = sourceContext; 
  this.targetContext = targetContext; 
  this._commandEmitter = commandEmitter; 
};

_.extend(module.exports.prototype, {

  /**
   * Issues an edit command for the referenced buffer item.
   *
   * @param {object} edits
   *   A map where keys are context ids and values are their associated inline
   *   edits.
   *
   * @return {void}
   */
  edit: function(edits) {
    this._commandEmitter.edit(this.targetContext.get('id'), this.editBufferItem.get('id'), edits);
  },

  /**
   * Issues a render command for the referenced buffer item.
   *
   * @param {object} edits
   *   A map where keys are context ids and values are their associated inline
   *   edits.
   *
   * @return {void}
   */
  render: function(edits) {
    this._commandEmitter.render(this.targetContext.get('id'), this.editBufferItem.get('id'), edits);
  },

  /**
   * Issues a duplicate command for the referenced buffer item.
   *
   * @param {mixed} widgetId
   *   The id of the widget that will recieve the duplicate.
   * @param {object} edits
   *   A map where keys are context ids and values are their associated inline
   *   edits.
   *
   * @return {void}
   */
  duplicate: function(widgetId, edits) {
    this._commandEmitter.duplicate(this.targetContext.get('id'), this.sourceContext.get('id'), this.editBufferItem.get('id'), widgetId, edits);
  }

});
