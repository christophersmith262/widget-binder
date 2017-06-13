/**
 * @file
 * Provides a class for storing widget tracking data.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone'),
  WidgetModel = require('../../Models/WidgetModel'),
  WidgetCollection = require('../../Collections/WidgetCollection');

/**
 * Creates a WidgetStore object.
 *
 * @param {EditorAdapter} adapter
 *   The editor adapter that will be used to tie the editor widget state to the
 *   internal tracked widget state.
 *
 * @constructor
 */
module.exports = function(adapter) {
  this._adapter = adapter;
  this._views = {};
  this._widgetCollection = new WidgetCollection();
};

_.extend(module.exports.prototype, Backbone.Events, {

  /**
   * Adds a model to the widget store.
   *
   * @param {object} widgetModel
   *   The widget model to be tracked, or an attributes object to update an
   *   existing model with. If an attributes object is provided, it must have an
   *   id attribute and the mode must already be in the store. Otherwise an
   *   error will be thrown. If a model is provided and belongs to a collection,
   *   it must belong to the widget store instance collection. Otherwise an
   *   error will be thrown.
   * @param {Backbone.View} widgetView
   *   An optional view corresponding to the widget's DOM element, if one
   *   exists. This will be used to track whether the widget is present in the
   *   DOM and if it gets orphaned.
   *
   * @return {WidgetModel}
   *   The added model.
   */
  add: function(widgetModel, widgetView) {
    if (!(widgetModel instanceof Backbone.Model)) {
      var attributes = widgetModel;
      widgetModel = this._widgetCollection.get(attributes.id);
      if (!widgetModel) {
        throw new Error('Attempt to update an unknown widget.');
      }
      widgetModel.set(attributes);
    }

    if (widgetModel.collection) {
      if (widgetModel.collection !== this._widgetCollection) {
        throw new Error('The widget being added already belongs to another editor.');
      }
    }
    else {
      this.listenTo(widgetModel, 'destroy', this._removeWrapper);
      this.listenTo(widgetModel, 'change:itemId', this._updateItemReference);
      this._widgetCollection.add(widgetModel);
    }

    if (widgetView) {
      var i = widgetModel.get('itemId');
      var j = widgetModel.get('id');
      if (!this._views[i]) {
        this._views[i] = {};
      }
      this._views[i][j] = widgetView;
    }

    return widgetModel;
  },

  /**
   * Gets a widget model, view pair based on its widget id.
   *
   * @param {mixed} id
   *   The id of the widget to get.
   * @param {bool} modelOnly
   *   Set to true to skip editor view lookup. This should be used for
   *   read-only access to the model since this method has the side-effect of
   *   cleaning up the reference table if the view is not found in the DOM.
   *
   * @return {object}
   *   An object with keys 'model' and 'view', which are respectively the model
   *   and view objects associated with the widget id. If either cannot be
   *   found, the value in the respective key is null.
   */
  get: function(id, modelOnly) {
    var widgetModel = this._widgetCollection.get(id);
    if (widgetModel && !modelOnly) {
      var i = widgetModel.get('itemId');
      var j = widgetModel.get('id');
      return {
        model: widgetModel,
        view: this._readCell(i, j),
      };
    }

    return {
      model: widgetModel,
      view: null
    };
  },

  /**
   * Removes a model from the store.
   *
   * If the widget has not already been marked as destroyed by the editor, this
   * method will also trigger widget destruction within the editor through the
   * editor adapter.
   *
   * @param {WidgetModel} widgetModel
   *   The widget model to be removed from the store.
   * @param {bool} skipDestroy
   *   Allows the client to stop tracking a widget without actually triggering
   *   the destruction of that widget within the editor. Pass true to avoid
   *   destroying the editor widget. By default, calling this method will
   *   trigger widget destruction within the editor if it has not already been
   *   destroyed.
   *
   * @return {WidgetModel}
   *   The widget model that was destroyed.
   */
  remove: function(widgetModel, skipDestroy) {
    if (!widgetModel) {
      return;
    }

    var i = widgetModel.get('itemId');
    var j = widgetModel.get('id');

    // If the widget has not already been destroyed within the editor, then
    // removing it here triggers its destruction. We provide the caller the
    // ability to sidestep this side effect with the skipDestroy opt-out.
    if (!widgetModel.hasState(WidgetModel.State.DESTROYED_WIDGET) && !skipDestroy) {
      this._adapter.destroyWidget(widgetModel.get('id'));
    }

    // If there is currently a view assocaited with the widget, then destroy it.
    if (this._views[i] && this._views[i][j]) {
      var view = this._views[i][j];
      delete this._views[i][j];
      view.remove();
    }

    // Remove the widget from the internal collection, perform memory cleanup,
    // and mark the widget model as no longer being tracked.
    this._cleanRow(i);
    this._widgetCollection.remove(widgetModel);
    widgetModel.setState(WidgetModel.State.DESTROYED_REFS);

    return widgetModel;
  },

  /**
   * Counts the number of different widgets that reference the same buffer item.
   *
   * @param {WidgetModel} widgetModel
   *   A widget model to count the buffer item references for. This function
   *   will return the total number of widgets that reference the buffer item
   *   given by the itemId attribute on the widget model, including the passed
   *   widget iteself.
   *
   * @return {int}
   *   The number of widgets referencing the item specified by the passed widget
   *   model's referenced item.
   */
  count: function(widgetModel) {
    var count = 0;

    if (widgetModel) {
      var i = widgetModel.get('itemId');
      for (var j in this._views[i]) {
        if (this._readCell(i, j)) {
          count++;
        }
      }
    }

    return count;
  },

  /**
   * Triggers the destruction of all tracked widgets and data structures.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  cleanup: function() {
    for (var i in this._views) {
      for (var j in this._views[i]) {
        this._views[i][j].remove();
      }
      delete this._views[i];
    }
    this._widgetCollection.reset();
    this._adapter.cleanup();
    return this.stopListening();
  },

  /**
   * Safely retrieves a view from the table if possible.
   *
   * @param {int} i
   *   The row (buffer item id) in the view table to read from.
   * @param {int} j
   *   The column (widget id) in the view table to read from.
   *
   * @return {Backbone.View}
   *   A view object if one exists in the view table it (i,j), null otherwise.
   */
  _readCell: function(i, j) {
    var view = null;

    if (this._views[i] && this._views[i][j]) {
      view = this._views[i][j];
      if (!this._adapter.getRootEl().contains(view.el)) {
        this.remove(view.model);
        view = null;
      }
    }

    return view;
  },

  /**
   * Reclaims space from an unused row.
   *
   * This is called after performing entry removals to delete rows in the view
   * table once they become empty.
   *
   * @param {int} i
   *   The row in the view table to check for cleanup. If this row is empty, it
   *   will be removed.
   *
   * @return {void}
   */
  _cleanRow: function(i) {
    if (this._views[i] && _.isEmpty(this._views[i])) {
      delete this._views[i];
    }
  },

  /**
   * Updates the widget table when a widget's referenced item has changed.
   *
   * This ensures that when a buffer item is duplicated for a widget, and the
   * widget gets updated to point to the new item, the view table is updated to
   * reflect the change. In particular this means moving the data from the old
   * table entry to the new table entry.
   *
   * @param {WidgetModel} widgetModel
   *   The widget model that has had its itemId attribute updated.
   *
   * @return {void}
   */
  _updateItemReference: function(widgetModel) {
    var i = widgetModel.previous('itemId');
    var j = widgetModel.get('id');
    var k = widgetModel.get('itemId');

    if (this._views[i] && this._views[i][j]) {
      if (!this._views[k]) {
        this._views[k] = {};
      }
      this._views[k][j] = this._views[i][j];
      delete this._views[i][j];
    }

    this._cleanRow(i);
  },

  _removeWrapper: function(widgetModel) {
    this.remove(widgetModel);
  }
});
