/**
 * @file
 * A Backbone model for representing editor widgets.
 */

'use strict';

var _ = require('underscore'),
  Backbone = require('backbone');

var State = {
  READY: 0x01,
  DESTROYED_WIDGET: 0x02,
  DESTROYED_REFS: 0x04,
  DESTROYED: 0x06,
};

/**
 * Backbone  Model for representing editor widgets.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Model.extend({

  type: 'Widget',

  /**
   * @type {object}
   *
   * @prop markup
   */
  defaults: {

    /**
     * The context the widget is in.
     *
     * @type {string}
     */
    contextId: '',

    /**
     * The data to be sent with the command.
     *
     * @type {int}
     */
    itemId: 0,

    /**
     * The data to be sent with the command.
     *
     * @type {int}
     */
    itemContextId: '',

    /**
     * The internal markup to display in the widget.
     *
     * @type {string}
     */
    markup: '',

    /**
     * The data to be sent with the command.
     *
     * @type {object}
     */
    edits: {},

    /**
     * Whether or not the referenced edit buffer item is being duplicated.
     *
     * @type {bool}
     */
    duplicating: false,

    /**
     * The destruction state for the widget.
     *
     * @type {int}
     */
    state: State.READY,
  },

  /**
   * @inheritdoc
   */
  constructor: function (attributes, options) {
    this.widget = options.widget;
    this._editBufferItemRefFactory = options.editBufferItemRefFactory;
    this._contextResolver = options.contextResolver;
    Backbone.Model.apply(this, [attributes, options]);
  },

  /**
   * @inheritdoc
   */
  set: function(attributes, options) {
    this._filterAttributes(attributes);
    return Backbone.Model.prototype.set.call(this, attributes, options);
  },

  /**
   * Triggers a request to edit the referenced edit buffer item.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  edit: function() {
    this.editBufferItemRef.edit(this.get('edits'));
    return this;
  },

  /**
   * Triggers a request to duplicate the referenced edit buffer item.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  duplicate: function() {
    this.set({ duplicating: true });
    this.editBufferItemRef.duplicate(this.get('id'), this.get('edits'));
    return this;
  },

  /**
   * @inheritdoc
   */
  destroy: function(options) {
    // If the widget has not already been marked as destroyed we trigger a
    // destroy event on the widget collection so it can instruct anything that
    // references this widget to clean it out. Redundant destroy calls are
    // ignored.
    if (!this.hasState(State.DESTROYED)) {
      this.trigger('destroy', this, this.collection, options);
      this.setState(State.DESTROYED);
    }
    return this;
  },

  /**
   * Updates the destruction state for this widget.
   *
   * @param {WidgetModel.State} state
   *   The state to set on the widget model.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  setState: function(state) {
    return this.set({state: this.get('state') | state});
  },

  /**
   * Checks the destruction state for this widget.
   *
   * @param {WidgetModel.State} state
   *   The state to check for.
   *
   * @return {bool}
   *   True of the model has the provided state set, false otherwise.
   */
  hasState: function(state) {
    return (this.get('state') & state) === state;
  },

  /**
   * Applies attribute filtering for 'set' method calls.
   *
   * @param {object} attributes
   *   The attributes that need to be filtered.
   *
   * @return {void}
   */
  _filterAttributes: function(attributes) {
    // Run the change handler to rebuild any references to external models
    // if necessary. We do this here instead of on('change') to ensure that
    // subscribed external listeners get consistent atomic change
    // notifications.
    if (this._refreshEditBufferItemRef(attributes) || attributes.edits) {
      this._setupListeners(attributes);
    }
  },

  /**
   * Internal function to handle changes to the referenced edit buffer item.
   *
   * @param {object} attributes
   *   An attributes object to parse for changes that could have side-effects.
   *
   * @return {bool}
   *   True if the changes in the attributes object signaled that this model
   *   needs to start listening to new objects, false otherwise.
   */
  _refreshEditBufferItemRef: function(attributes) {
    // Track whether we need to update which referenced models we are
    // listening to.
    var setupListeners = false;

    // Get the consolidated list of old / updated properties to check for
    // changes.
    var oldItemContext = this.get('itemContextId');
    var oldWidgetContext = this.get('contextId');
    var oldItemId = this.get('itemId');
    var newItemContext = attributes.itemContextId ? attributes.itemContextId : oldItemContext;
    var newWidgetContext = attributes.contextId ? attributes.contextId : oldWidgetContext;
    var newItemId = attributes.itemId ? attributes.itemId : oldItemId;

    // If the context the buffer item has changed, the context of the widget
    // has changed, or the referenced edit buffer item id has changed we need
    // to regenerate the edit buffer item reference and instruct the caller to
    // update the models this widget is listening to.
    if (newItemContext != oldItemContext || newWidgetContext != oldWidgetContext || newItemId != oldItemId) {
      this.editBufferItemRef = this._editBufferItemRefFactory.createFromIds(newItemId, newItemContext, newWidgetContext);
      setupListeners = true;
      attributes.markup = this.editBufferItemRef.editBufferItem.get('markup');
    }

    return setupListeners;
  },

  /**
   * Removes any stale listeners and sets up fresh listeners.
   *
   * @param {object} attributes
   *   An attributes object to use to determine which related models need to be
   *   listened to.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  _setupListeners: function(attributes) {
    this.stopListening()
      .listenTo(this.editBufferItemRef.editBufferItem, 'change:markup', this._readFromBufferItem)
      .listenTo(this.editBufferItemRef.sourceContext, 'change:id', this._updateContext)
      .listenTo(this.editBufferItemRef.targetContext, 'change:id', this._updateContext);

    _.each(attributes.edits, function(value, contextString) {
      var context = this._contextResolver.get(contextString);
      this.listenTo(context, 'change:id', this._updateContext);
    }, this);

    return this;
  },

  /**
   * Internal function to copy updates from the referenced buffer item.
   *
   * @param {Backbone.Model} bufferItemModel
   *   The buffer item model to copy markup changes from.
   *
   * @return {void}
   */
  _readFromBufferItem: function(bufferItemModel) {
    this.set({markup: bufferItemModel.get('markup')});
  },

  /**
   * Internal function to handle when a referenced context id has changed.
   *
   * @param {Backbone.Model} contextModel
   *   The context model that has had an id attribute changed.
   *
   * @return {void}
   */
  _updateContext: function(contextModel) {
    var oldId = contextModel.previous('id');
    var newId = contextModel.get('id');
    var attributes = {};

    // Update any context id references that may need to change.
    if (this.get('itemContextId') == oldId) {
      attributes.itemContextId = newId;
    }
    if (this.get('contextId') == oldId) {
      attributes.contextId = newId;
    }

    // If the context was referenced by an edit on the model, update the edit.
    var edits = this.get('edits');
    if (edits[oldId]) {
      attributes.edits = {};
      _.each(edits, function(value, contextString) {
        if (contextString == oldId) {
          attributes.edits[newId] = value.replace(oldId, newId);
        }
        else {
          attributes.edits[contextString] = value;
        }
      }, this);
    }

    this.set(attributes);
    this.trigger('rebase', this, oldId, newId);
  },

});

module.exports.State = State;
