/**
 * @file
 * Provides the logic for executing editor commands.
 */

'use strict';

var _ = require('underscore');

/**
 * Creates a CommandEmitter object.
 *
 * @param {SyncActionDispatcher} dispatcher
 *   The action dispatcher to use for dispatching commands.
 * @param {ContextResolver} contextResolver
 *   The context resolver used to lookup context models associated with
 *   commands.
 *
 * @constructor
 */
module.exports = function(dispatcher, contextResolver) {
  this._dispatcher = dispatcher;
  this._contextResolver = contextResolver;
};

_.extend(module.exports.prototype, {

  /**
   * Executes an "insert" command.
   *
   * @param {string} targetContextId
   *   The id of the context the new item will be inserted into.
   * @param {string} type
   *   The type to insert. This is optional.
   *
   * @return {void}
   */
  insert: function(targetContextId, type) {
    var options = {
      command: 'insert',
      targetContext: targetContextId,
    };

    if (type) {
      options.type = type;
    }

    this._execute('INSERT_ITEM', options);
  },

  /**
   * Executes an "edit" command.
   *
   * @param {string} targetContextId
   *   The id of the context the buffer item belongs to.
   * @param {string} itemId
   *   The id of the buffer item to be edited.
   * @param {object} edits
   *   A map of inline edits to be preserved. See WidgetModel for the format of
   *   inline edits.
   *
   * @return {void}
   */
  edit: function(targetContextId, itemId, edits) {
    this._execute('EDIT_ITEM', {
      command: 'edit',
      targetContext: targetContextId,
      itemId: itemId,
      edits: edits
    });
  },

  /**
   * Executes a "render" command.
   *
   * @param {string} targetContextId
   *   The id of the context the buffer item belongs to.
   * @param {string} itemId
   *   The id of the buffer item to be rendered.
   * @param {object} edits
   *   A map of inline edits to be preserved. See WidgetModel for the format of
   *   inline edits.
   *
   * @return {void}
   */
  render: function(targetContextId, itemId, edits) {
    this._execute('RENDER_ITEM', {
      command: 'render',
      targetContext: targetContextId,
      itemId: itemId,
      edits: edits
    });
  },

  /**
   * Executes an "duplicate" command.
   *
   * @param {string} targetContextId
   *   The id of the context the new item will be inserted into.
   * @param {string} sourceContextId
   *   The id of the context the item being duplicated belongs to.
   * @param {string} itemId
   *   The id of the buffer item to be duplicated.
   * @param {mixed} widgetId
   *   The id of the widget that will be updated to reference the newly created
   *   item.
   * @param {object} edits
   *   A map of inline edits to be preserved. See WidgetModel for the format of
   *   inline edits.
   *
   * @return {void}
   */
  duplicate: function(targetContextId, sourceContextId, itemId, widgetId, edits) {
    this._execute('DUPLICATE_ITEM', {
      command: 'duplicate',
      targetContext: targetContextId,
      sourceContext: sourceContextId,
      itemId: itemId,
      widget: widgetId,
      edits: edits
    });
  },

  /**
   * Internal callback for triggering the command to be sent.
   *
   * @param {string} type
   *   The type of command being performed.
   * @param {object} command
   *   The command data to be passed to the dispatched.
   *
   * @return {void}
   */
  _execute: function(type, command) {
    var editorContext = this._contextResolver.getEditorContext();
    command.editorContext = editorContext.toJSON();
    command.settings = editorContext.get('settings');

    if (command.edits) {
      command.editableContexts = {};
      _.each(command.edits, function(value, contextId) {
        var context = this._contextResolver.get(contextId);
        command.editableContexts[contextId] = context.toJSON();
      }, this);
    }

    this._dispatcher.dispatch(type, command, command.editorContext.settings);
  }
});
