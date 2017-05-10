
'use strict';

var Backbone = require('Backbone');

/**
 */
module.exports = Backbone.Model.extend({

  type: 'Editor',

  /**
   * {@inheritdoc}
   */
  initialize: function(attributes, config) {
    this.widgetManager = config.widgetManager;
    this.widgetStore = config.widgetStore;
    this.context = config.context;
    this.listenTo(this.context, 'change:id', this._updateContextId);
  },

  /**
   */
  _updateContextId: function(contextModel) {
    this.set({ id: contextModel.get('id') });
  },

});
