
'use strict';

var _ = require('underscore');

/**
 * A central dispatcher for sending commands to the canonical data store.
 *
 * Default Supported Actions:
 *
 *   INSERT_ITEM: Requests a new edit buffer item from the data store. This
 *   triggers the creation of an edit buffer item on the server, and should
 *   resolve with the new item.
 *
 *   EDIT_ITEM: Requests that an existing edit buffer item be edited. This
 *   triggers an edit flow on the server. The actual details of that flow are
 *   not enforced. For example, the server may deliver back an ajax form for the
 *   edit buffer item and resolve the action once that form is submitted. The
 *   resolution should include the updates made to the edit buffer item model.
 *
 *   RENDER_ITEM: Requests the representational markup for a data entity that
 *   will be rendered in the editor viewmode. The command should resolve with
 *   the edit buffer item model containing the updated markup. This markup will
 *   automatically be synced to the widget. The markup can also contain inline
 *   editable fields in the format specified by the sync configuration.
 *
 *   DUPLICATE_ITEM: Requests that an item be duplicated in the store, resulting
 *   in a newly created item. This command should resolve with the newly created
 *   edit buffer model.
 *
 *   FETCH_SCHEMA: Requests the schema for a field from the server. This should
 *   resolve with a schema model detailing which other types of fields can be
 *   nested inside the given field type.
 *
 * @param {SyncProtocol} protocol
 *   A protocol plugin for handling the request / response transaction.
 * @param {SyncActionResolver} resolver
 *   The resolver service for processing sync action responses.
 *
 * @constructor
 */
module.exports = function(protocol, resolver) {
  this._protocol = protocol;
  this._resolver = resolver;
};

_.extend(module.exports.prototype, {

  /**
   * Dispatches a sync action.
   *
   * @param {string} type
   *   Should be one of: 'INSERT_ITEM', 'EDIT_ITEM', 'RENDER_ITEM',
   *   'DUPLICATE_ITEM', 'FETCH_SCHEMA'.
   * @param {object} data
   *   Arbitrary data representing the request.
   *
   * @return {void}
   */
  dispatch: function(type, data) {
    this._protocol.send(type, data, this._resolver);
  }

});
