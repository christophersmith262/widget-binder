/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore');

/**
 */
module.exports = function(contextCollection, sourceContextAttribute, targetContextAttribute, editorContext) {
  this._contextCollection = contextCollection;
  this._sourceContextAttribute = sourceContextAttribute;
  this._targetContextAttribute = targetContextAttribute;
  this._editorContext = editorContext;
};

_.extend(module.exports.prototype, {

  /**
   */
  resolveTargetContext: function ($el) {
    var contextId = $el.attr(this._targetContextAttribute);
    if (!contextId) {
      contextId = $el.closest('[' + this._targetContextAttribute + ']').attr(this._targetContextAttribute);
    }

    return this.get(contextId);
  },

  /**
   */
  resolveSourceContext: function($el) {
    var contextId = $el.attr(this._sourceContextAttribute);
    return contextId ? this.get(contextId) : this._editorContext;
  },

  /**
   */
  getEditorContext: function() {
    return this._editorContext;
  },

  /**
   */
  get: function(contextId) {
    if (contextId) {
      var settings = this._editorContext ? this._editorContext.getSettings() : {};
      return this._contextCollection.get(contextId, settings);
    }
    else {
      return this._editorContext;
    }
  },

  /**
   */
  touch: function(contextId) {
    return this._contextCollection.touch(contextId);
  },

});
