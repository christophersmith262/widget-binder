/**
 * @file
 * A Backbone view for representing widgets within the editor.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  $ = Backbone.$;

/**
 * Backbone view for representing widgets within the editor.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.View.extend({

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
   * {@inheritdoc}
   */
  initialize: function(options) {
    this.adapter = options.adapter;
    this._elementFactory = options.elementFactory;
    this.template = options.template;

    // Get a list of templates that will be used.
    var widgetTemplate = this._elementFactory.getTemplate('widget');
    var fieldTemplate = this._elementFactory.getTemplate('field');
    var widgetCommandTemplate = this._elementFactory.getTemplate('widget-command');

    // Set up attribute / element selectors.
    this.widgetSelector = widgetTemplate.getSelector();
    this.viewModeAttribute = widgetTemplate.getAttributeName('<viewmode>');
    this.inlineContextAttribute = fieldTemplate.getAttributeName('<context>');
    this.commandSelector = widgetCommandTemplate.getSelector();
    this.commandAttribute = widgetCommandTemplate.getAttributeName('<command>');
    this.inlineEditorSelector = fieldTemplate.getSelector();

    this._state = {};

    // Set up the change handler.
    this.listenTo(this.model, 'change', this._changeHandler);
    this.listenTo(this.model, 'rebase', this._rebase);
    this._rebased = {};
  },

  /**
   */
  template: function(elementFactory, markup, actions) {
  },

  /**
   */
  render: function(preserveDomEdits) {
    if (this.model.get('duplicating')) {
      this.trigger('DOMRemove', this, this.$el.children());
      this.$el.html(this.template(this._elementFactory, '...', this.actions));
    }
    else {
      if (preserveDomEdits) {
        var domEdits = {};
        this._inlineElementVisitor(function($el, contextString, selector) {
          domEdits[contextString] = $el.children();
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
          this.adapter.attachInlineEditing(this, contextString, selector);

          if (domEdits[contextString]) {
            $el.html('').append(domEdits[contextString]);
          }
        }, $newContainer);

        this.$el.append($newContainer.children());
        this.trigger('DOMRemove', this, $oldContainer);
        $oldContainer.remove();
        $newContainer.remove();
      }
      else {
        this.trigger('DOMRemove', this, this.$el.children());
        this.$el.html(this.template(this._elementFactory, this.model.get('markup'), this.actions));

        this._rebase();
        var edits = this.model.get('edits');
        this._inlineElementVisitor(function($el, contextString, selector) {
          if (edits[contextString]) {
            $el.html(edits[contextString] ? edits[contextString] : '');
          }

          this.adapter.attachInlineEditing(this, contextString, selector);
        });
      }

      _.each(this._rebased, function(unused, contextString) {
        var selector = '[' + this.inlineContextAttribute + '="' + contextString + '"]';
        this.adapter.detachInlineEditing(this, contextString, selector);
      }, this);
      this._rebased = {};

      var view = this;
      this._find(this.commandSelector).on('click', function() {
        var action = $(this).attr(view.commandAttribute);
        view.actions[action].callback.call(view);
      });
      this.renderAttributes();
    }

    this.trigger('DOMRender', this, this.$el);
    this.trigger('DOMMutate', this, this.$el);

    return this;
  },

  /**
   */
  renderAttributes: function() {
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
   */
  save: function() {

    if (!this.model.get('duplicating')) {
      var edits = {};
      this._inlineElementVisitor(function($el, contextString, selector) {
        edits[contextString] = this.adapter.getInlineEdit(this, contextString, selector);
      });
      this.model.set({edits: edits}, {silent: true});
    }

    return this;
  },

  /**
   */
  _rebase: function(model, oldId, newId) {
    if (!model) {
      model = this.model;
    }

    if (oldId && newId) {
      this._inlineElementVisitor(function($el, contextString, selector) {
        if (contextString == oldId) {
          $el.attr(this.inlineContextAttribute, newId);
        }
      });
      this._rebased[oldId] = true;
    }
    else {
      var oldEdits = _.toArray(this.model.get('edits'));
      var edits = {};
      this._inlineElementVisitor(function($el, contextString, selector) {
        var oldEdit = oldEdits.pop();
        edits[contextString] = oldEdit ? oldEdit : '';
      });
      this.model.set({ edits: edits }, { silent: true });
    }
    return this;
  },

  /**
   */
  edit: function() {
    this.model.edit();
  },

  /**
   */
  remove: function() {
    this.stopListening();
    if (this.model) {
      var model = this.model;
      this.model = null;
      model.destroy();
      this.trigger('DOMRemove', this, this.$el);
    }
    return this;
  },

  /**
   */
  stopListening: function() {
    this._find(this.commandSelector).off();
    return Backbone.View.prototype.stopListening.call(this);
  },

  /**
   */
  isEditorViewRendered: function() {
    return this.$el.attr(this.viewModeAttribute) == 'editor';
  },

  /**
   */
  _changeHandler: function() {
    var markupChanged = this.model.hasChanged('markup');
    if (this.model.get('duplicating') || this.model.previous('duplicating')) {
      this.render();
    }

    else if (this.model.hasChanged('markup')) {
      this.render(true);
    }

    else if (this.model.hasChanged('itemId') || this.model.hasChanged('contextId')) {
      this.renderAttributes();
    }

    return this;
  },

  /**
   */
  _inlineElementVisitor: function(callback, $rootEl) {
    if (!$rootEl) {
      $rootEl = this.$el;
    }
    var view = this;
    this._find(this.inlineEditorSelector, $rootEl).each(function() {
      if ($(this).closest(view.widgetSelector).is(view.$el)) {
        var contextString = $(this).attr(view.inlineContextAttribute);
        var selector = '[' + view.inlineContextAttribute + '="' + contextString + '"]';
        callback.call(view, $(this), contextString, selector);
      }
    });
  },

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
