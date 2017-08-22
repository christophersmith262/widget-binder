/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore');

/**
 * A class for resolving the assicuated context(s) for an element.
 *
 * @param {ConextCollection} contextCollection
 *   The contextCollection to use to lookup contexts.
 * @param {string} sourceContextAttribute
 *   The source context attribute name.
 * @param {string} targetContextAttribute
 *   The target context attribute name.
 * @param {Context} editorContext
 *   The root context of the editor instance.
 *
 * @constructor
 */
module.exports = function(contextCollection, sourceContextAttribute, targetContextAttribute, editorContext) {
  this._contextCollection = contextCollection;
  this._sourceContextAttribute = sourceContextAttribute;
  this._targetContextAttribute = targetContextAttribute;
  this._editorContext = editorContext;
};

_.extend(module.exports.prototype, {

  /**
   * Resolves the context of an element based on its position in the editor.
   *
   * @param {jQuery} $el
   *   The element to resolve the context of.
   *
   * @return {Backbone.Model}
   *   The context model associated with the element.
   */
  resolveTargetContext: function ($el) {
    var contextId = $el.attr(this._targetContextAttribute);
    if (!contextId) {
      contextId = $el.closest('[' + this._targetContextAttribute + ']').attr(this._targetContextAttribute);
    }

    return this.get(contextId);
  },

  /**
   * Resolves the context an element has been tagged with.
   *
   * @param {jQuery} $el
   *   The element to resolve the context of.
   * @param {Context} defaultContext
   *   The fallback context. If this is ommitted the editor context will be
   *   used.
   *
   * @return {Backbone.Model}
   *   The context model associated with the element.
   */
  resolveSourceContext: function($el, defaultContext) {
    if (!defaultContext) {
      defaultContext = this._editorContext;
    }
    var contextId = $el.attr(this._sourceContextAttribute);
    return contextId ? this.get(contextId) : defaultContext;
  },

  /**
   * Gets the root editor context.
   *
   * @return {Backbone.Model}
   *   The root editor context.
   */
  getEditorContext: function() {
    return this._editorContext;
  },

  /**
   * Gets a context based on its context id.
   *
   * @param {string} contextId
   *   The id of the context to get.
   *
   * @return {Backbone.Model}
   *   The context model.
   */
  get: function(contextId) {
    if (contextId) {
      var settings = this._editorContext ? this._editorContext.get('settings') : {};
      return this._contextCollection.get(contextId, settings);
    }
    else {
      return this._editorContext;
    }
  },

  /**
   * Ensures that a context exists in the collection.
   *
   * @param {string} contextId
   *   The context id to ensure exists.
   *
   * @return {void}
   */
  touch: function(contextId) {
    this._contextCollection.touch(contextId);
  },

});
