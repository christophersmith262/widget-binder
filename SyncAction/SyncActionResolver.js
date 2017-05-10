
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
  },

  /**
   */
  _updateModels: function(models, collection) {
    var resolvedCollection = collection;
    _.each(models, function(attributes, id) {
      if (typeof collection == 'function') {
        resolvedCollection = collection(attributes);
      }
      var existing = resolvedCollection.get(id);
      if (existing) {
        existing.set(attributes);
      }
      else {
        resolvedCollection.add(attributes);
      }
    });
  }

});
