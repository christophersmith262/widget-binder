/**
 * @file
 * A Backbone view for representing widgets within the editor.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  $ = Backbone.$,
  WidgetView = require('./WidgetView'),
  unimplemented = require('../unimplemented');

/**
 * Backbone view for representing widgets within the editor.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = WidgetView.extend({

  processingIndicator: '...',

  actions: {
    edit: {
      title: 'Edit',
      callback: function() {
        this.save().edit();
      }
    },
    remove: {
      title: 'Remove',
      callback: function() {
        this.remove();
      }
    }
  },

  /**
   * @inheritdoc
   */
  initialize: function(options) {
    WidgetView.prototype.initialize.call(this, options);

    if (options.processingIndicator) {
      this.processingIndicator = options.processingIndicator;
    }

    var widgetCommandTemplate = this._elementFactory.getTemplate('widget-command');
    this.commandSelector = widgetCommandTemplate.getSelector();
    this.commandAttribute = widgetCommandTemplate.getAttributeName('<command>');

    // Set up the change handler.
    this.listenTo(this.model, 'change', this._changeHandler);
    this.listenTo(this.model, 'rebase', this._rebase);

    this._stale = {};
  },

  /**
   * @inheritdoc
   *
   * @param {ElementFactory} elementFactory
   *   The element factory that will be used to create element templates.
   * @param {string} markup
   *   The markup to be rendered for the widget.
   * @param {object} actions
   *   A mapping where each key is an action name, and each entry is an object
   *   containing the following entries:
   *    - title: The title to display to the user.
   *    - callback: The callback for when the action is triggered.
   */
  template: function(elementFactory, markup, actions) {
    unimplemented(elementFactory, markup, actions);
  },

  /**
   * @inheritdoc
   *
   * @param {string} mode
   *   One of:
   *     - 'duplicating': Re-renders the entire view with the duplicating
   *       indicator.
   *     - 'container': Re-renders the container while preserve the existing
   *       inline editable DOM. This effectively re-renders the container
   *       without triggering a re-render
   *     - 'attributes': Re-renders the top-level attributes only.
   *     - 'all': Re-renders everything. This will wipe out the structure of
   *       any existing edits and sub-widgets, so it's really only suitable
   *       when the markup is completely stale. Usually, 'container' is a
   *       better option.
   *   If no mode is provided 'all' is used by default.
   */
  render: function(mode) {
    this._find(this.commandSelector).off();

    switch (mode) {
      case 'duplicating':
        this._renderDuplicating();
        break;

      case 'container':
        this._renderContainer();
        break;

      case 'attributes':
        this._renderAttributes();
        break;

      default:
        this._renderAll();
    }

    this._cleanupStaleEditables();
    this.trigger('DOMRender', this, this.$el);
    this.trigger('DOMMutate', this, this.$el);

    return this;
  },

  /**
   * Triggers an edit command dispatch.
   *
   * @return {void}
   */
  edit: function() {
    this.model.edit();
  },

  /**
   * Cleans up the view and triggers the destruction of the associated widget.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  remove: function() {
    this.stopListening();
    if (this.model) {
      this.trigger('DOMRemove', this, this.$el);
      this._cleanupStaleEditables(true);
      var model = this.model;
      this.model = null;
      model.destroy();
    }
    return this;
  },

  /**
   * @inheritdoc
   */
  stopListening: function() {
    // Cleanup the command listeners. @see _renderCommands.
    this._find(this.commandSelector).off();
    return WidgetView.prototype.stopListening.apply(this, arguments);
  },

  /**
   * Returns whether or not the editor view has been rendered.
   *
   * @return {bool}
   *   True if the editor view has been rendered on the roow element of the
   *   view, false otherwise.
   */
  isEditorViewRendered: function() {
    return this.$el.attr(this.viewModeAttribute) == 'editor';
  },

  /**
   * Renders the widget indicating the data entity is being duplicated.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _renderDuplicating: function() {
    this.trigger('DOMRemove', this, this.$el.children());
    this.$el.html(this.template(this._elementFactory, this.processingIndicator, this.actions));
    return this;
  },

  /**
   * Renders the markup for a widget while preserving the inline editable DOM.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _renderContainer: function() {
    var domEdits = {};
    this._inlineElementVisitor(function($el, contextString) {
      domEdits[contextString] = $el.contents();
    });

    var $oldContainer = $('<div></div>');
    var $newContainer = $('<div></div>');
    var $oldChildren = this.$el.children();
    this.$el.append($oldContainer);
    this.$el.append($newContainer);

    $oldContainer.append($oldChildren);
    $newContainer.html(this.template(this._elementFactory, this.model.get('markup'), this.actions)); 
    this._find(this.inlineEditorSelector, $oldContainer).attr(this.inlineContextAttribute, '');

    this._inlineElementVisitor(function($el, contextString, selector) {
      this._adapter.attachInlineEditing(this, contextString, selector);

      if (domEdits[contextString]) {
        $el.html('').append(domEdits[contextString]);
      }
    }, $newContainer);

    this.$el.append($newContainer.children());
    this.trigger('DOMRemove', this, $oldContainer);
    $oldContainer.remove();
    $newContainer.remove();

    return this._renderAttributes()._renderCommands();
  },

  /**
   * Renders everything, indiscriminately destroy the existing DOM (and edits).
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _renderAll: function() {
    this.trigger('DOMRemove', this, this.$el.children());
    this.$el.html(this.template(this._elementFactory, this.model.get('markup'), this.actions));

    var edits = this.model.get('edits');
    this._inlineElementVisitor(function($el, contextString, selector) {
      if (edits[contextString]) {
        $el.html(edits[contextString] ? edits[contextString] : '');
      }

      this._adapter.attachInlineEditing(this, contextString, selector);
    });

    return this._renderAttributes()._renderCommands();
  },

  /**
   * Re-renders just the attributes on the root element.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _renderAttributes: function() {
    var element = this._elementFactory.create('widget', {
      context: this.model.get('contextId'),
      uuid: this.model.get('itemId'),
      viewmode: 'editor',
    });

    _.each(element.getAttributes(), function(value, name) {
      this.$el.attr(name, value);
    }, this);

    this.trigger('DOMMutate', this, this.$el);

    return this;
  },

  /**
   * Attaches click handlers for firing commands.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _renderCommands: function() {
    var view = this;
    this._find(this.commandSelector).on('click', function() {
      var action = $(this).attr(view.commandAttribute);
      view.actions[action].callback.call(view);
    });
    return this;
  },

  /**
   * Handles changes to the widget model and invokes the appropriate renderer.
   *
   * @return {void}
   */
  _changeHandler: function() {
    if (this.model.previous('duplicating')) {
      this.render();
    }
    else if (this.model.get('duplicating')) {
      this.render('duplicating');
    }
    else if (this.model.hasChanged('markup')) {
      this.render('container');
    }
    else if (this.model.hasChanged('itemId') || this.model.hasChanged('contextId')) {
      this._render('attributes');
    }

    return this;
  },

  /**
   * Reacts to a context rebase event by updating the associated DOM element.
   *
   * @see WidgetModel
   *
   * @param {Backbone.Model} model
   *   The changed model.
   * @param {string} oldId
   *   The old context id.
   * @param {string} newId
   *   The new context id.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _rebase: function(model, oldId, newId) {
    if (!model) {
      model = this.model;
    }

    this._inlineElementVisitor(function($el, contextString) {
      if (contextString == oldId) {
        $el.attr(this.inlineContextAttribute, newId);
        this.trigger('DOMMutate', this, $el);
      }
    });
    this._stale[oldId] = true;

    return this;
  },

  /**
   * Allows the editor implementation to free inline editing data structures.
   *
   * @param {bool} hard
   *   Whether or not to force all inline editables to be destroyed. Defaults
   *   to false.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _cleanupStaleEditables: function(hard) {
    if (hard) {
      this._inlineElementVisitor(function($el, contextId, selector) {
        this._adapter.detachInlineEditing(this, contextId, selector);
      });
    }
    else {
      _.each(this._stale, function(unused, contextId) {
        var selector = this._inlineElementSelector(contextId);
        this._adapter.detachInlineEditing(this, contextId, selector);
      }, this);
    }

    this._stale = {};

    return this;
  },

});
