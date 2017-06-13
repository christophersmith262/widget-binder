/**
 * @file
 * A Backbone view for representing the exported data state of a widget.
 */

'use strict';

var _ = require('underscore'),
  WidgetView = require('./WidgetView'),
  unimplemented = require('../unimplemented');

module.exports = WidgetView.extend({

  /**
   * @inheritdoc
   */
  initialize: function(options) {
    WidgetView.prototype.initialize.call(this, options);

    this.attributeWhitelist = _.invert(this.widgetTemplate.getAttributeNames());
    delete this.attributeWhitelist[this.widgetTemplate.getAttributeName('<viewmode>')];
  },

  /**
   * @inheritdoc
   *
   * @param {ElementFactory} elementFactory
   *   The factory used to create DOM element templates.
   * @param {object} fields
   *   A map of the field / data structure of the widget to output tags for.
   * @param {object} edits
   *   A map of context ids to inline edits that have been made for that
   *   context.
   */
  template: function(elementFactory, fields, edits) {
    unimplemented(elementFactory, fields, edits);
  },

  /**
   * @inheritdoc
   */
  render: function() {
    var view = this;
    var fields = this.model.editBufferItemRef.editBufferItem.get('fields');
    var edits = this.model.get('edits');
    this.$el.html(this.template(this._elementFactory, fields, edits));
    _.each(this.el.attributes, function(attr) {
      if (_.isUndefined(view.attributeWhitelist[attr.name])) {
        view.$el.removeAttr(attr.name);
      }
    });
    return this;
  },

});
