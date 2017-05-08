
'use strict';

var _ = require('underscore');

/**
 */
module.exports = function() {
  this._collections = {};
};

_.extend(module.exports.prototype, {

  /**
   */
  addCollection: function(modelName, collectionCallback) {
    this._collections[modelName] = collectionCallback;
  },

  /**
   */
  resolve: function(response) {
    var resolver = this;

    for (var modelName in response) {
      if (this._collections[modelName]) {
        this._updateModels(response[modelName], this._collections[modelName]);
      }
    }

    if (response.editBufferItem) {
      this._updateModels(response.editBufferItem, function(attributes) {
        return resolver._contextCollection.get(attributes.contextId).editBuffer;
      });
    }

    if (response.widget) {
      this._updateModels(response.widget, function(attributes) {
        return resolver.editorCollection.get(attributes.contextId).widgetStore;
      });
    }
  },

  /**
   */
  _updateModels: function(models, collection) {
    var resolvedCollection = collection;
    _.each(models, function(attributes, id) {
      if (typeof collection == 'function') {
        resolvedCollection = collection(attributes);
      }
      var existing = resolvedCollection(attributes).get(id);
      if (existing) {
        existing.set(attributes);
      }
      else {
        resolvedCollection.add(attributes);
      }
    });
  }

});
