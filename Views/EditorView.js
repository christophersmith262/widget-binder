/**
 * @file
 * A Backbone view for wrapping context containing DOM nodes.
 */

'use strict';

var Backbone = require('backbone');

/**
 * Backbone view for updating the editor element.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.View.extend({

  /**
   * @inheritdoc
   */
  initialize: function(attributes, options) {
    if (!options.elementFactory) {
      throw new Error('Required elementFactory option missing.');
    }

    this._elementFactory = options.elementFactory;

    this.listenTo(this.model, 'change:id', this.render);
    this.listenTo(this.model, 'destroy', this.stopListening);
    this.render();
  },

  /**
   * Renders the editor element.
   *
   * This just exists to keep the context attribute in sync with the data
   * model. This should *never* change the actual contents of the view element.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  render: function() {
    var template = this._elementFactory.getTemplate('field');
    this.$el.attr(template.getAttributeName('<context>'), this.model.get('context'));
    this.trigger('DOMMutate', this, this.$el);
  },

});
