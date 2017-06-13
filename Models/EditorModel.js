
'use strict';

var Backbone = require('backbone');

/**
 */
module.exports = Backbone.Model.extend({

  type: 'Editor',

  /**
   * @inheritdoc
   */
  initialize: function(attributes, config) {
    this.widgetFactory = config.widgetFactory;
    this.viewFactory = config.viewFactory;
    this.widgetStore = config.widgetStore;
    this.editBufferMediator = config.editBufferMediator;
    this.context = config.context;
    this.contextResolver = config.contextResolver;
    this.listenTo(this.context, 'change:id', this._updateContextId);
  },

  /**
   * @inheritdoc
   */
  destroy: function() {
    this.stopListening();
    this.widgetStore.cleanup();
    this.editBufferMediator.cleanup();
  },

  /**
   * Change handler for a context id change.
   *
   * @param {Backbone.Model} contextModel
   *   The context model that has had an id change.
   *
   * @return {void}
   */
  _updateContextId: function(contextModel) {
    this.set({ id: contextModel.get('id') });
  }

});
