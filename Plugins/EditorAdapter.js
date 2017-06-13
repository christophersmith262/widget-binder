/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  unimplemented = require('../unimplemented');

/**
 * A base for editor adapter plugins.
 *
 * Adapter plugins are the glue that translates data mutations within the
 * widget binder library into a specific editor's API calls. As long as an
 * editor uses the DOM as the primary method of storage, the widget binder
 * library can handle most of the mutations without editor specific code. Each
 * editor may have its own flavor of DOM wrappers and inline editing handling,
 * so this plugin is required to bridge the gap between the editor's API and
 * the data operations.
 *
 * @constructor
 */
module.exports = function() {
};

_.extend(module.exports.prototype, Backbone.Events, {

  /**
   * Inserts an embed code into the editor.
   *
   * This should insert the newly created element at the current editable cursor
   * position within the editor.
   *
   * @param {Element} embedCode
   *   The embed code element to be inserted.
   *
   * @return {void}
   */
  insertEmbedCode: function(embedCode) {
    unimplemented(embedCode);
  },

  /**
   * Removes a widget from the editor.
   *
   * This should remove the widget based on its unique id and free any
   * associated memory.
   *
   * @param {int} id
   *   The id of the widget to be destroyed.
   *
   * @return {void}
   */
  destroyWidget: function(id) {
    unimplemented(id);
  },

  /**
   * Sets up an inline editable field within a widget.
   *
   * The widgetView parameter gives the adapter access to the DOM element that
   * should be inline-editable. The contextId allows access to the current
   * inline edits for the particular context, and the selector is a jQuery style
   * selector dictating which node in the widgetView DOM will become
   * inline-editable.
   *
   * @param {Backbone.View} widgetView
   *   The view for the widget that contains the field that will become
   *   editable.
   * @param {mixed} contextId
   *   The context id to of the field that should become inline editable. Each
   *   editable field defines a unique context for its children.
   * @param {string} selector
   *   A jQuery style selector for specifying which element within the widget
   *   should become editable. The selector is relative to the view's root el
   *   property.
   *
   * @return {void}
   */
  attachInlineEditing: function(widgetView, contextId, selector) {
    unimplemented(widgetView, contextId, selector);
  },

  /**
   * Reads the inline edit for an editable widget field from the widget's DOM.
   *
   * @param {Backbone.View} widgetView
   *   The view for the widget that contains the field to read inline edits
   *   from.
   * @param {mixed} contextId
   *   The context id to read the inline edit from.
   * @param {string} selector
   *   A jQuery style selector for specifying which element within the widget
   *   should the inline edits should be read from. The selector is relative to
   *   the view's root el property.
   *
   * @return {string}
   *   The processed inline edit markup for the specified contextId.
   */
  getInlineEdit: function(widgetView, contextId, selector) {
    return unimplemented(widgetView, contextId, selector);
  },

  /**
   * Gets the root DOM element for the editor.
   *
   * This method tells the editor how to 
   *
   * @return {DOMElement}
   *   The root DOM element for the editor.
   */
  getRootEl: function() {
    return unimplemented();
  },

  /**
   * An optional method for performing any cleanup after tracker destruction.
   *
   * This will be called when the widget tracker has been destroyed. It is
   * usually not necessary to implement this method.
   *
   * @return {void}
   */
  cleanup: function() {
    this.stopListening();
  }

});

module.exports.extend = Backbone.Model.extend;
