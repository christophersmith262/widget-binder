
'use strict';

var Backbone = require('backbone');

/**
 */
module.exports = Backbone.Model.extend({

  type: 'Editor',

  /**
   * {@inheritdoc}
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
   */
  _updateContextId: function(contextModel) {
    this.set({ id: contextModel.get('id') });
  },

  destroy: function() {
    this.stopListening();
    this.widgetStore.cleanup();
    this.editBufferMediator.cleanup();
  }

});
