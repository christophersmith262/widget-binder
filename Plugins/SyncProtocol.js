/**
 * @file
 * Provides an interface for protocol plugins.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  unimplemented = require('../unimplemented');

/**
 * A base for protocol plugins.
 *
 * Protocol plugins handle the request / response mechanism for syncing data to
 * and from the server. They provide a single method 'send' that will be called
 * when requests are dispatched.
 *
 * The command resolver is used to pass the response back into the tracking
 * system asynchronously.
 *
 * @constructor
 */
module.exports = function() {
};

_.extend(module.exports.prototype, {

  /**
   * Sends a request to the data store.
   *
   * This method should initiate a request, then call resolver.resolve(data)
   * with the response.
   * 
   * The data object passed to resolve() may contain one or more of: 'context',
   * 'widget', 'editBufferItem', 'schema'. Each entry should be a data model
   * keyed by the id of the data model.
   *
   * @param {string} type
   *   The request type. This can be one of: 'INSERT_ITEM', 'RENDER_ITEM',
   *   'DUPLICATE_ITEM', 'FETCH_SCHEMA'.
   * @param {object} data
   *   The data to be sent in the request.
   * @param {SyncActionResolver} resolver
   *   The resolver service that will be used to resolve the command.
   *
   * @return {void}
   */
  send: function(type, data, resolver) {
    unimplemented(type, data, resolver);
  }

});

module.exports.extend = Backbone.Model.extend;
