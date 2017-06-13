
'use strict';

var _ = require('underscore');

/**
 * A class for resolving dispatched actions.
 *
 * Dispatched actions are resolved by checking the response for models that
 * should be added to the appropriate collection.
 *
 * The resolver service is set up with a mappings of models-to-collections and
 * uses this mapping to update the associated collection when it sees a model
 * that has been mapped.
 *
 * @constructor
 */
module.exports = function() {
  this._collections = {};
};

_.extend(module.exports.prototype, {

  /**
   * Adds a model-to-collection map.
   *
   * This map is used to add models in the response to the appropriate
   * colleciton.
   *
   * @param {string} modelName
   *   The key in the response object that contains a model to be added to the
   *   specified collection.
   * @param {mixed} collectionCallback
   *   If the passed value is a Backbone.Collection, models in the response will
   *   be added directly to this collection. If the passed value is a function,
   *   the callback function will be called with the model attributes in the
   *   response and should return the resolved collection. The model will be
   *   added to the resolved collection in this case.
   *
   * @return {void}
   */
  addCollection: function(modelName, collectionCallback) {
    this._collections[modelName] = collectionCallback;
  },

  /**
   * Resolves a dispatched sync action.
   *
   * @param {object} response
   *   A plain javascript object that contains the action response. Keys in this
   *   object should be model names as passed to the addCollection method. The
   *   values in this object should be models to be added to the associated
   *   collection. Each entry in the object should contain a javascript object,
   *   keyed by the model's id, and containg the model attributes to be set in
   *   the collection as a value.
   *
   *   [
   *    {
   *      type: 'asset',
   *      id: '',
   *      attributes: '',
   *    },
   *   ]
   *
   * @return {void}
   */
  resolve: function(response) {
    _.each(response, function(model) {
      if (this._collections[model.type]) {
        this._updateModel(model, this._collections[model.type]);
      }
    }, this);
  },

  /**
   * Adds models to a collection.
   *
   * @param {object} model
   *   An object where keys are model ids and values are model attributes.
   * @param {mixed} collection
   *   Can either be a Backbone.Collection to add the model to, or a callback
   *   which returns the collection.
   *
   * @return {void}
   */
  _updateModel: function(model, collection) {
    var resolvedCollection = collection;

    // If a function is passed as the collection, we call it to resolve the
    // actual collection for this model.
    if (typeof collection == 'function') {
      resolvedCollection = collection(model.attributes);
    }

    // We first try to load the existing model instead of directly setting the
    // model in collection since it is completely valid for a model's id to
    // change.
    var existing = resolvedCollection.get(model.id);
    if (existing) {
      existing.set(model.attributes);
    }
    else {
      if (!model.attributes.id) {
        model.attributes.id = model.id;
      }
      resolvedCollection.add(model.attributes);
    }
  }

});
