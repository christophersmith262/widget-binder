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
    var contextString = $el.attr(this._targetContextAttribute);
    if (!contextString) {
      contextString = $el.closest('[' + this._targetContextAttribute + ']').attr(this._targetContextAttribute);
    }

    return this.get(contextString);
  },

  /**
   */
  resolveSourceContext: function($el) {
    var contextString = $el.attr(this._sourceContextAttribute);
    return contextString ? this.get(contextString) : this._editorContext;
  },

  /**
   */
  getEditorContext: function() {
    return this._editorContext;
  },

  /**
   */
  get: function(contextString) {
    if (contextString) {
      var settings = this._editorContext ? this._editorContext.getSettings() : {};
      return this._contextCollection.get(contextString, settings);
    }
    else {
      return this._editorContext;
    }
  },

  /**
   */
  touch: function(contextString) {
    return this._contextCollection.touch(contextString);
  },

});
