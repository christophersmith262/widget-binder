
'use strict'

const rewire = require('rewire')
const expect = require('chai').expect
const Backbone = require('backbone')
const EditorCollection = rewire('../../../Collections/EditorCollection')

const EditorModelMock = Backbone.Model.extend({
});

EditorCollection.__set__('EditorModel', EditorModelMock)

describe('EditorCollection module', () => {
})
