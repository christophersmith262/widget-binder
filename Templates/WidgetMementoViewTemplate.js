
'use strict';

var _ = require('underscore');

/**
 */
module.exports = function(elementFactory, fields, edits) {
  var result = '';

  if (fields) {
    _.each(fields, function(node) {
      var element = elementFactory.create(node.type, node);
      var edit; 

      if (node.type == 'field') {
        if (node.context) {
          edit = edits[node.context];
        }
        else {
          element.setAttribute('<editable>', 'false');
        }
      }

      result += element.renderOpeningTag();

      if (edit) {
        result += edit;
      }
      else {
        result += module.exports(elementFactory, node.children, edits);
      }

      result += element.renderClosingTag();
    });
  }

  return result;
};
