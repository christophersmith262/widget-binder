/**
 * @file
 * Provides a model for representing a context.
 */

'use strict';

var Backbone = require('backbone'),
  EditBufferItemCollection = require('../Collections/EditBufferItemCollection');

/**
 * Backbone Model for representing editor widget contexts.
 *
 * A context is an environment where widgets can appear. Contexts let us know
 * who owns the data it's associated with. Each editable region will get its
 * own context. When a widget travels from one context to another it flags that
 * the data entity that is associated with the widget needs to be updated.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Model.extend({

  type: 'Context',

  defaults: {
    ownerId: '',
    fieldId: '',
    schemaId: '',
    settings: {},
  },

  /**
   * @inheritdoc
   */
  constructor: function(attributes, options) {
    this.editBuffer = new EditBufferItemCollection([], { contextId: attributes.id });
    Backbone.Model.apply(this, [attributes, options]);
  },

  /**
   * @inheritdoc
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
   * A convenience function for reading an individual setting.
   *
   * @param {string} key
   *   The settings key to lookup.
   *
   * @return {mixed}
   *   The setting value that was read or undefined if no such setting existed.
   */
  getSetting: function(key) {
    return this.get('settings')[key];
  },

});
