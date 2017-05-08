/**
 * @file
 * A Backbone view for representing the exported data state of a widget.
 */

'use strict';

var Backbone = require('backbone'),
  $ = Backbone.$;

module.exports = Backbone.View.extend({

  /**
   * @inheritdoc
   */
  initialize: function(options) {
    this.adapter = options.adapter;
    this.elementFactory = options.elementFactory;
    this.fieldTemplate = this.elementFactory.getTemplate('field');
    this.contextAttribute = this.elementFactory.getContextAttribute();
    this.inlineEditorSelector =  this.fieldTemplate.getTag() + '[' + this.contextAttribute + ']';
    this.attributeWhitelist = _.invert(this.fieldTemplate.getAttributes());
    this.template = options.template;
  },

  /**
   */
  template: function(elementFactory, fields, edits) {
  },

  /**
   */
  render: function() {
    var view = this;
    var fields = this.model.embedCode.getBufferItem().get('fields');
    var edits = this.model.get('edits');
    this.$el.html(this.template(this.elementFactory, fields, edits));
    _.each(this.el.attributes, function(attr) {
      if (!view.attributeWhitelist[attr.name]) {
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
      var contextString = $(this).attr(view.contextAttribute);
      edits[contextString] = $(this).html();
    });
    this.model.set({edits: edits}, {silent: true});
    return this;
  },

  /**
   */
  remove: function() {
  }

});
