/**
 * @file
 * Provides a model for representing widgets.
 */

'use strict';

var Backbone = require('backbone'),
  $ = Backbone.$,
  unimplemented = require('../unimplemented');

/**
 * Backbone view for representing widgets within the editor.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.View.extend({

  /**
   * @inheritdoc
   */
  initialize: function(options) {
    if (!options.adapter) {
      throw new Error('Required adapter option missing.');
    }

    if (!options.elementFactory) {
      throw new Error('Required elementFactory option missing.');
    }

    if (!options.template) {
      throw new Error('Required template option missing.');
    }

    this._adapter = options.adapter;
    this._elementFactory = options.elementFactory;
    this._contextResolver = options.contextResolver;
    this.template = options.template;

    // Get a list of templates that will be used.
    this.widgetTemplate = this._elementFactory.getTemplate('widget');
    this.fieldTemplate = this._elementFactory.getTemplate('field');
    this.widgetCommandTemplate = this._elementFactory.getTemplate('widget-command');

    // Set up attribute / element selectors.
    this.widgetSelector = this.widgetTemplate.getSelector();
    this.viewModeAttribute = this.widgetTemplate.getAttributeName('<viewmode>');
    this.inlineContextAttribute = this.fieldTemplate.getAttributeName('<context>');
    this.inlineEditorSelector = this.fieldTemplate.getSelector();
  },

  /**
   * Generates the HTML content for the root element.
   *
   * @return {string}
   *   The html markup to apply inside the root element.
   */
  template: function() {
    unimplemented();
  },

  /**
   * Renders the widget.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  render: function() {
    unimplemented();
  },

  /**
   * Saves inline edits currently in the DOM to the model.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  save: function() {

    if (!this.model.get('duplicating')) {
      var edits = {};
      this._inlineElementVisitor(function($el, contextString, selector) {
        edits[contextString] = this._adapter.getInlineEdit(this, contextString, selector);
      });
      this.model.set({edits: edits}, {silent: true});
    }

    return this;
  },

  /**
   * @inheritdoc
   */
  remove: function() {
    // We override the default remove function to prevent destruction of the
    // widget by default when the view is removed.
    return this;
  },

  /**
   * Gets the inline element selector for a given context id.
   *
   * @param {string} contextId
   *   The context id to get the selector for.
   *
   * @return {string}
   *   A jQuery selector for a given contextId.
   */
  _inlineElementSelector: function(contextId) {
    return '[' + this.inlineContextAttribute + '="' + contextId + '"]';
  },

  /**
   * A visitor function for processing inline editable elements.
   *
   * @param {function} callback
   *   A callback that will be invoked for each inline element in the DOM,
   *   with three arguments:
   *    - $el {jQuery} The inline element.
   *    - contextId: The context id associated with the inline element.
   *    - selector: A selector for locating the element in the DOM.
   * @param {jQuery} $rootEl
   *   The root element to search for inline editables inside. If none is
   *   provided, the widget root element is used by default.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _inlineElementVisitor: function(callback, $rootEl) {
    if (!$rootEl) {
      $rootEl = this.$el;
    }

    var view = this;
    this._find(this.inlineEditorSelector, $rootEl).each(function() {
      var contextString = $(this).attr(view.inlineContextAttribute);
      var selector = view._inlineElementSelector(contextString);
      callback.call(view, $(this), contextString, selector);
    });

    return this;
  },

  /**
   * A find wrapper for jQuery that searches only within the context of the
   * widget this view is associated with.
   *
   * @param {string} selector
   *   The selector to search with.
   * @param {jQuery} $rootEl
   *   The root element to search inside. If none is provided, the widget root
   *   element is used by default.
   *
   * @return {jQuery}
   *   A jQuery wrapper object containing any matching elements.
   */
  _find: function(selector, $rootEl) {
    var view = this;
    var $result = $([]);

    if (!$rootEl) {
      $rootEl = this.$el;
    }

    $rootEl.children().each(function() {
      var $child = $(this);
      if ($child.is(selector)) {
        $result = $result.add($child);
      }
      if (!$child.is(view.widgetSelector)) {
        $result = $result.add(view._find(selector, $child));
      }
    });

    return $result;
  },

});
