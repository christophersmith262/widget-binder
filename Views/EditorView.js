/**
 * @file
 * A Backbone view for wrapping context containing DOM nodes.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

/**
 */
module.exports = Backbone.View.extend({

  /**
   * {@inheritdoc}
   */
  initialize: function(attributes, options) {
    this._elementFactory = options.elementFactory;

    this.listenTo(this.model, 'change:id', this.render);
    this.listenTo(this.model, 'destroy', this.stopListening);
    this.render();
  },

  /**
   */
  render: function() {
    var element = this._elementFactory.create('editor', {
      context: this.model.get('context'),
    });

    _.each(element.getAttributes(), function(value, name) {
      this.$el.attr(name, value);
    }, this);
  },

});
