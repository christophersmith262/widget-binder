
'use strict';

const expect = require('chai').expect;
const config = require('chai').config;

config.includeStack = true;

const WidgetSync = require('../');

describe('Functional Test', () => {
  it('should be creatble', function() {
    var widgetSync = new WidgetSync();
  })
})
