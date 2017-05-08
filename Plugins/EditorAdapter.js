/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

/**
 */
module.exports = function() {
};

_.extend(module.exports.prototype, {

  /**
   */
  insertBufferItem: function(bufferItemModel) {},

  /**
   */
  getBufferItem: function(editBuffer, editorWidget) {},

  /**
   */
  getWidget: function(bufferItemModel, editorWidget) {},

  /**
   */
  getWidgetEl: function(editorWidget) {},

  /**
   */
  destroyWidget: function(widgetModel) {},

  /**
   */
  getRootEl: function() {},

  /**
   */
  widgetExists: function(widgetModel) {}
});

module.exports.extend = Backbone.Model.extend;
