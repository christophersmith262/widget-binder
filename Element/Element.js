/**
 * @file
 * Provides the logic for executing commands from the queue.
 */

'use strict';

var _ = require('underscore');

/**
 * Abstract representation of an HTML element.
 *
 * @param {string} tag
 *   The html tag name of the element.
 * @param {object} attributeMap
 *   A mapping of attributes for the element. Keys are attribute names and
 *   values are either hard-coded attribute values or data references in the
 *   for '<datakeyname>'.
 * @param {string} selector
 *   A selector for finding elements of this type.
 * @param {object} data
 *   Data to associate with each attribute in the attribute map.
 *
 * @constructor
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
   * Gets the html tag name of the element.
   *
   * @return {string}
   *   The html tag name.
   */
  getTag: function() {
    return this._tag;
  },

  /**
   * Gets the attributes of the element.
   *
   * @return {object}
   *   A map where keys are attribute names and values are the associated
   *   attribute values.
   */
  getAttributes: function() {
    return this._attributes;
  },

  /**
   * Gets the names of the attributes this element supports.
   *
   * @return {array}
   *   An array of attribute names.
   */
  getAttributeNames: function() {
    return _.keys(this._attributeMap);
  },

  /**
   * Sets the value of an attribute.
   *
   * @param {string} name
   *   Either a hard coded attribute name or a data reference name if the form
   *   '<datakeyname>'.
   * @param {string} value
   *   The attribute value. Note that only strings are supported here.
   *
   * @return {this}
   *   The this object for call-chaining.
   */
  setAttribute: function(name, value) {
    this._attributes[this.getAttributeName(name)] = value;
    return this;
  },

  /**
   * Gets the value of an attribute on this element instance.
   *
   * @param {string} name
   *   Either a hard coded attribute name or a data reference name if the form
   *   '<datakeyname>'.
   *
   * @return {string}
   *   The attribute value for the requested attribute.
   */
  getAttribute: function(name) {
    return this._attributes[this.getAttributeName(name)];
  },

  /**
   * Gets the name of an attribute based on its data key entry name.
   *
   * @param {string} name
   *   A data key entry name in the form '<datakeyname>'.
   *
   * @return {string}
   *   The name of the attribute. Passes through the originally passed name
   *   if no data key match was found.
   */
  getAttributeName: function(name) {
    var dataKey = this._getDataKey(name);
    if (dataKey && this._invertedAttributeMap[dataKey]) {
      name = this._invertedAttributeMap[dataKey];
    }
    return name;
  },

  /**
   * Renders the opening tag for the element.
   *
   * @return {string}
   *   The rendered opening tag.
   */
  renderOpeningTag: function() {
    var result = '<' + this.getTag();

    _.each(this.getAttributes(), function(value, name) {
      result += ' ' + name + '="' + value + '"';
    });

    return result + '>';
  },

  /**
   * Renders the closing tag for the element.
   *
   * @return {string}
   *   The rendered closing tag.
   */
  renderClosingTag: function() {
    return '</' + this.getTag() + '>';
  },

  /**
   * Gets the selector for finding instances of this element in the DOM.
   *
   * @return {string}
   *   The selector for this element.
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
   * Helper function to parse data key attribute names.
   *
   * @param {string} name
   *   The attribute name to be parsed.
   *
   * @return {string}
   *   The data key attribute name (without enclosing '<>') if the attribute
   *   name matched the pattern, false otherwise.
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
