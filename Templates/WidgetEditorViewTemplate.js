
'use strict';

/**
 */
module.exports = function(elementFactory, markup) {
  var displayElement = elementFactory.create('widget-display');
  var toolbarElement = elementFactory.create('toolbar');
  var toolbarItemElement = elementFactory.create('toolbar-item');
  var commandElement = elementFactory.create('widget-command');

  return displayElement.renderOpeningTag()
    + markup
    + toolbarElement.renderOpeningTag()
      + toolbarItemElement.renderOpeningTag()
        + commandElement.setAttribute('<command>', 'edit').renderOpeningTag() + commandElement.renderClosingTag()
      + toolbarItemElement.renderClosingTag()
      + toolbarItemElement.renderOpeningTag()
        + commandElement.setAttribute('<command>', 'delete').renderOpeningTag() + commandElement.renderClosingTag()
      + toolbarItemElement.renderClosingTag()
    + toolbarElement.renderClosingTag()
  + displayElement.renderClosingTag();
};
