/**
 * @file
 * Provides a model for representing a context.
 */

'use strict';

var Backbone = require('backbone'),
  EditBufferItemCollection = require('../Collections/EditBufferItemCollection');

/**
 */
module.exports = Backbone.Model.extend({

  type: 'Context',

  defaults: {
    schemaId: '',
    settings: {},
  },

  /**
   * {@inheritdoc}
   */
  constructor: function(attributes, options) {
    this.editBuffer = new EditBufferItemCollection([], { contextId: attributes.id });
    Backbone.Model.apply(this, [attributes, options]);
  },

  /**
   */
  set: function(attributes, options) {
    if (attributes.editBufferItems) {
      this.editBuffer.add(attributes.editBufferItems, {merge: true});
      delete attributes.editBufferItems;
    }

    var oldId = this.get('id');
    var newId = attributes.id;
    if (newId && oldId && newId != oldId) {
      var collection = this.collection;
      if (collection) {
        collection.remove(this, { silent: true });
        this.attributes.id = this.id = newId;
        collection.add(this, { silent: true });
        this.attributes.id = this.id = oldId;
      }
    }

    Backbone.Model.prototype.set.call(this, attributes, options);
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
