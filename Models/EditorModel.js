
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
  },

});
