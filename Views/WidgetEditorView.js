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

    // Set up the change handler.
    this.listenTo(this.model, 'change', this._changeHandler);
  },

  /**
   */
  template: function(elementFactory, markup) {
  },

  /**
   */
  render: function() {
    if (this.model.get('duplicating')) {
      this.$el.html(this.template(this._elementFactory, '...'));
    }
    else {
      var view = this;
      this.$el.html(this.template(this._elementFactory, this.model.get('markup')));

      this.$el.find(this.commandSelector).on('click', function() {
        var command = $(this).attr(view.commandAttribute);

        if (command == 'edit') {
          view.save().edit();
        }
        else if (command == 'remove') {
          view.remove();
        }
      });

      this.renderAttributes();
      this.renderEdits();
    }

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

    return this;
  },

  /**
   */
  renderEdits: function() {
    var edits = this.model.get('edits');
    this._inlineElementVisitor(function($el, contextString, selector) {
      // Fetch the edit and set a data attribute to make associating edits
      // easier for whoever is going to attach the inline editor.
      $el.html(edits[contextString] ? edits[contextString] : '');

      // Tell the widget manager to enable inline editing for this element.
      this.adapter.attachInlineEditing(this, contextString, selector);
    });
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
  rebase: function() {
    var oldEdits = _.pairs(this.model.get('edits'));
    var edits = {};
    this._inlineElementVisitor(function($el, contextString, selector) {
      var next = oldEdits.shift();
      edits[contextString] = next ? next[1] : '';
    });
    this.model.set({edits: edits});

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
    }
    return this;
  },

  /**
   */
  stopListening: function() {
    this.$el.find(this.commandSelector).off();
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
    // If the widget is currently asking for a duplicate buffer item from the
    // server, or such a request just finished, we don't want to save the
    // current state of the editor since it is just displaying a 'loading'
    // message.
    if (this.model.previous('duplicating')) {
      this.render().rebase();
    }

    // If the markup changed and the widget wasn't duplicating, we have to
    // re-render everything.
    else if (this.model.get('duplicating') || this.model.hasChanged('markup')) {
      this.render();
    }

    // Otherwise we can just re-render the parts that changed.
    else {
      if (this.model.hasChanged('edits')) {
        this.renderEdits();
      }

      if (this.model.hasChanged('itemId') || this.model.hasChanged('itemContextId')) {
        this.renderAttributes();
      }
    }

    return this;
  },

  /**
   */
  _inlineElementVisitor(callback) {
    var view = this;
    this.$el.find(this.inlineEditorSelector).each(function() {
      if ($(this).closest(view.widgetSelector).is(view.$el)) {
        var contextString = $(this).attr(view.inlineContextAttribute);
        var selector = view.inlineEditorSelector + '[' + view.inlineContextAttribute + '="' + contextString + '"]';
        callback.call(view, $(this), contextString, selector);
      }
    });
  }

});
