/**
 * @file
 * Provides a mediator for negotiating the insertion of new items.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

/**
 * A class for mediating requests for new edit buffer items from the server.
 *
 * @param {EditBufferItemRefFactory} editBufferItemRefFactory
 *   The factory to use for creating edit buffer item references.
 * @param {ElementFactory} elementFactory
 *   The factory to use for creating embedable widget elements.
 * @param {ContextListener} contextListener
 *   The listener that listens for new edit buffer items being delivered.
 * @param {EditorAdapter} adapter
 *   The editor adapter that handles insertion of new embed codes into the
 *   editor.
 * @param {ContextResolver} contextResolver
 *   The context resolver to use for resolving the context that a widget is
 *   being inserted into.
 *
 * @constructor
 */
module.exports = function(editBufferItemRefFactory, elementFactory, contextListener, adapter, contextResolver) {
  this._editBufferItemRefFactory = editBufferItemRefFactory;
  this._elementFactory = elementFactory;
  this._contextListener = contextListener;
  this._adapter = adapter;
  this._contextResolver = contextResolver;
  this.listenTo(this._contextListener, 'insertItem', this._insertBufferItem);
};

_.extend(module.exports.prototype, Backbone.Events, {

  /**
   * Triggers the widget insertion flow.
   *
   * @param {string} type
   *   The type name of the widget to insert.
   * @param {jQuery} $el
   *   The insertion point for the new item being requested.
   *
   * @return {void}
   */
  requestBufferItem: function(type, $el) {
    var targetContext = this._contextResolver.resolveTargetContext($el);
    this._contextListener.addContext(targetContext);
    this._editBufferItemRefFactory.requestNewItem(targetContext.get('id'), type);
  },

  /**
   * Cleans up the mediator in preparation for destruction.
   *
   * @return {void}
   */
  cleanup: function() {
    this._contextListener.cleanup();
    this.stopListening();
  },

  /**
   * Handler for new edit buffer items being delivered.
   *
   * @param {EditBufferItemModel} bufferItemModel
   *   The new model being inserted
   *
   * @return {void}
   */
  _insertBufferItem: function(bufferItemModel) {
    var item = this._editBufferItemRefFactory.create(bufferItemModel);

    // If the new model is ready to be inserted, insert an embed code in
    // Editor and mark the model as inserted.
    var embedCode = this._elementFactory.create('widget', {
      uuid: bufferItemModel.get('id'),
      context: item.targetContext.get('id'),
    });
    embedCode.setAttribute('<viewmode>', 'editor');
    this._adapter.insertEmbedCode(embedCode);
  }

});
