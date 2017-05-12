/**
 * @file
 * Provides a mediator for negotiating the insertion of new items.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

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
   */
  requestBufferItem: function(bundleName, $el) {
    var targetContext = this._contextResolver.resolveTargetContext($el);
    this._contextListener.addContext(targetContext);
    this._editBufferItemRefFactory.requestNewItem(targetContext.get('id'), bundleName);
      
  },

  cleanup: function() {
    this._contextListener.cleanup();
    this.stopListening();
  },

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
