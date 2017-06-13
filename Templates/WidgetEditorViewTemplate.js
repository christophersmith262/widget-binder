
'use strict';

var _ = require('underscore');

/**
 * @inheritdoc
 */
module.exports = function(elementFactory, markup, actions) {
  var displayElement = elementFactory.create('widget-display');
  var toolbarElement = elementFactory.create('toolbar');
  var toolbarItemElement = elementFactory.create('toolbar-item');
  var commandElement = elementFactory.create('widget-command');

  var result = displayElement.renderOpeningTag()
    + markup
    + toolbarElement.renderOpeningTag();

  _.each(actions, function(def, id) {
    result += toolbarItemElement.renderOpeningTag()
      + commandElement.setAttribute('<command>', id).renderOpeningTag() + def.title + commandElement.renderClosingTag()
      + toolbarItemElement.renderClosingTag();
  });

  result += toolbarElement.renderClosingTag()
    + displayElement.renderClosingTag();

  return result;
};
