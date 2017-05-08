/**
 * @file
 * Provides a model for representing a context.
 */

'use strict';

var Backbone = require('backbone');

/**
 */
module.exports = Backbone.Model.extend({

  type: 'Context',

  defaults: {
    field: '',
    settings: {},
  },

  /**
   * {@inheritdoc}
   */
  constructor: function(attributes, options) {
    this.editBuffer = options.editBuffer;
    if (!attributes.settings) {
      attributes.settings = {};
    }
    Backbone.Model.apply(this, [attributes, options]);
  },

  /**
   */
  set: function(attributes, options) {
    if (attributes.editBufferItems) {
      this.editBuffer.add(attributes.editBufferItems, {merge: true});
      delete attributes.editBufferItems;
    }

    return Backbone.Model.prototype.set.call(this, attributes, options);
  },

  /**
   */
  getSettings: function() {
    return this.get('settings');
  },

  /**
   */
  getSetting: function(key) {
    return this.get('settings')[key];
  },

});
