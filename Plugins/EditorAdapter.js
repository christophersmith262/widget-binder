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
  insertEmbedCode: function(embedCode) {},

  destroyWidget: function(id) {
  },

  /**
   */
  attachInlineEditing: function(needsHelp) {},

  /**
   */
  getInlineEdit: function(needsHelp) {},

  getRootEl: function() {
  },

  cleanup: function() {
  }

});

module.exports.extend = Backbone.Model.extend;
