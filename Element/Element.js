/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore');

/**
 */
module.exports = function(tag, attributeMap, selector, data) {
  var element = this;

  if (!attributeMap) {
    attributeMap = {};
  }

  this._tag = tag;
  this._attributeMap = attributeMap;
  this._selector = selector;
  this._invertedAttributeMap = {};
  _.each(attributeMap, function(attribute_value, attribute_name) {
    element._invertedAttributeMap[element._getDataKey(attribute_value)] = attribute_name;
  });

  if (!data) {
    data = {};
  }

  var attributes = {};
  _.each(attributeMap, function(attribute_value, attribute_name) {
    var dataKey = element._getDataKey(attribute_value);
    if (dataKey) {
      if (data[dataKey]) {
        attributes[attribute_name] = data[dataKey];
      }
    }
    else {
      attributes[attribute_name] = attribute_value;
    }
  });

  this._attributes = attributes;
};

_.extend(module.exports.prototype, {

  /**
   */
  getTag: function() {
    return this._tag;
  },

  /**
   */
  getAttributes: function() {
    return this._attributes;
  },

  /**
   */
  getAttributeNames: function() {
    return _.keys(this._attributeMap);
  },

  /**
   */
  setAttribute: function(name, value) {
    this._attributes[this.getAttributeName(name)] = value;
    return this;
  },

  /**
   */
  getAttribute: function(name) {
    return this._attributes[this.getAttributeName(name)];
  },

  /**
   */
  getAttributeName: function(name) {
    var dataKey = this._getDataKey(name);
    if (dataKey && this._invertedAttributeMap[dataKey]) {
      name = this._invertedAttributeMap[dataKey];
    }
    return name;
  },

  /**
   */
  renderOpeningTag: function() {
    var result = '<' + this.getTag();

    _.each(this.getAttributes(), function(value, name) {
      result += ' ' + name + '="' + value + '"';
    });

    return result + '>';
  },

  /**
   */
  renderClosingTag: function() {
    return '</' + this.getTag() + '>';
  },

  /**
   */
  getSelector: function() {
    var attributes = this.getAttributes();
    var selector = '';

    if (this._selector) {
      selector = this._selector;
    }
    else if (attributes['class']) {
      var classes = attributes['class'].split(' ');
      _.each(classes, function(classname) {
        selector += '.' + classname;
      }, this);
    }
    else {
      selector = this.getTag();
    }

    return selector;
  },

  /**
   */
  _getDataKey: function(name) {
    var regex = /^<([a-z\-]+)>$/;
    var parsed = regex.exec(name);
    if (parsed && parsed[1]) {
      return parsed[1];
    }
    else {
      return false;
    }
  }

});
