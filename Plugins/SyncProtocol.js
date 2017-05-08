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
  send: function(type, data, settings, resolver) {}
});

module.exports.extend = Backbone.Model.extend;
