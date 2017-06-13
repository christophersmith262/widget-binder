/**
 * @file
 * A Backbone model for representing a schema entry.
 */

'use strict';

var Backbone = require('backbone');

/**
 * Backbone  Model for representing a schema entry.
 *
 * The id for this model is the uuid of a data entity that the item
 * corresponds to.
 *
 * @constructor
 *
 * @augments Backbone.Model
 */
module.exports = Backbone.Model.extend({

  type: 'Schema',

  /**
   * @type {object}
   *
   * @prop markup
   */
  defaults: {

    'allowed': {},
  },

  /**
   * Determines if a type is allowed within a schema.
   *
   * @param {string} type
   *   The type to test validity for.
   *
   * @return {bool}
   *   True if the type is allowed within the schema node, false otherwise.
   */
  isAllowed: function(type) {
    return !!this.get('allowed')[type];
  },

});
