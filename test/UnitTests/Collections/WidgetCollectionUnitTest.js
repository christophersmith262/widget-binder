
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const WidgetCollection = rewire('../../../Collections/WidgetCollection')

const WidgetModelMock = Backbone.Model.extend({
});

WidgetCollection.__set__('WidgetModel', WidgetModelMock)

describe('WidgetCollection module', () => {
})
