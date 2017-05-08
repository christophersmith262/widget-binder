/**
 * @file
 * A Backbone view for wrapping context containing DOM nodes.
 */

'use strict';

/**
 */
module.exports = Backbone.View.extend({

  contextAttribute: 'data-context',

  /**
   * {@inheritdoc}
   */
  initialize: function(attributes, options) {
    this.listenTo(this.model, 'change:id', this.render);
    this.render();
  },

  /**
   */
  render: function() {
    this.$el.attr(this.contextAttribute, this.model.get('id'));
  }

});
