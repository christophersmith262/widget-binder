/**
 * @file
 * Provides the logic for creating widget models.
 */

'use strict';

var _ = require('underscore'),
  WidgetModel = require('../../Models/WidgetModel');

/**
 * Creates a widget factory.
 *
 * @param {ContextResolver} contextResolver
 *   A context resolver to use for resolving the source and target contexts for
 *   a widget.
 * @param {EditBufferItemRefFactory} editBufferItemRefFactory
 *   The edit buffer item reference factory to pass through to created widgets.
 * @param {string} uuidAttributeName
 *   The name of the uuid attribute on the widget element to pull edit buffer
 *   item ids from the DOM.
 */
module.exports = function(contextResolver, editBufferItemRefFactory, uuidAttributeName) {
  this._contextResolver = contextResolver;
  this._editBufferItemRefFactory = editBufferItemRefFactory;
  this._uuidAttributeName = uuidAttributeName;
};

_.extend(module.exports.prototype, {

  /**
   * Creates a new widget model based on data provided by the editor.
   *
   * @param {mixed} widget
   *   This is any arbitrary data the editor implementation wants to associate
   *   with the widget model. This lets you access editor-specific widget data
   *   structures from within the editor adapter.
   * @param {mixed} id
   *   A unique identifier for the widget. In most cases, it makes sense to pass
   *   this through directly from the facility that the editor used to create
   *   the widget.
   * @param {jQuery} $el
   *   The widget element. This will be used to derive the context being
   *   inserted into (targetContext), the context the referenced edit buffer
   *   item came from (sourceContext), and the referenced item id.
   *
   * @return {WidgetModel}
   *   The newly created widget model.
   */
  create: function(widget, id, $el) {
    var sourceContext = this._contextResolver.resolveSourceContext($el);
    var targetContext = this._contextResolver.resolveTargetContext($el);

    var options = {
      editBufferItemRefFactory: this._editBufferItemRefFactory,
      contextResolver: this._contextResolver,
      widget: widget,
    };

    return new WidgetModel({
      id: id,
      contextId: targetContext.get('id'),
      itemId: $el.attr(this._uuidAttributeName),
      itemContextId: sourceContext.get('id'),
    }, options);
  },

});
