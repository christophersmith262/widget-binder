
'use strict';

var _ = require('underscore');

/**
 */
module.exports = function(protocol, resolver) {
  this._protocol = protocol;
  this._resolver = resolver;
};

_.extend(module.exports.prototype, {

  /**
   */
  dispatch: function(type, data, settings) {
    this._protocol.send(type, data, settings, this._resolver);
  }

});
