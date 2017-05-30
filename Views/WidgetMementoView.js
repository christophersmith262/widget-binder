/**
 * @file
 * A Backbone view for representing the exported data state of a widget.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  $ = Backbone.$;

module.exports = Backbone.View.extend({

  /**
   * @inheritdoc
   */
  initialize: function(options) {
    this.adapter = options.adapter;
    this.elementFactory = options.elementFactory;
    this.template = options.template;

    // Get a list of templates that will be used.
    var widgetTemplate = this.elementFactory.getTemplate('widget');
    var fieldTemplate = this.elementFactory.getTemplate('field');

    // Set up attribute / element selectors.
    this.widgetSelector = widgetTemplate.getSelector();
    this.inlineContextAttribute = fieldTemplate.getAttributeName('<context>');
    this.inlineEditorSelector = fieldTemplate.getSelector();

    // Filter out non-configured attributes.
    this.attributeWhitelist = _.invert(widgetTemplate.getAttributeNames());
    delete this.attributeWhitelist[widgetTemplate.getAttributeName('<viewmode>')];
  },

  /**
   */
  template: function(elementFactory, fields, edits) {
  },

  /**
   */
  render: function() {
    var view = this;
    var fields = this.model.editBufferItemRef.editBufferItem.get('fields');
    var edits = this.model.get('edits');
    this.$el.html(this.template(this.elementFactory, fields, edits));
    _.each(this.el.attributes, function(attr) {
      if (_.isUndefined(view.attributeWhitelist[attr.name])) {
        view.$el.removeAttr(attr.name);
      }
    });
    return this;
  },

  /**
   */
  save: function() {
    var edits = {};
    var view = this;
    this.$el.find(this.inlineEditorSelector).each(function() {
      if ($(this).closest(view.widgetSelector).is(view.$el)) {
        var contextString = $(this).attr(view.inlineContextAttribute);
        edits[contextString] = $(this).html();
      }
    });
    this.model.set({edits: edits}, {silent: true});
    return this;
  },

  /**
   */
  remove: function() {
  }

});
