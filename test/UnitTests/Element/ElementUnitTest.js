
'use strict'

const expect = require('chai').expect
const Element = require('../../../Element/Element');

describe('Element module', () => {
  describe('"getTag"', () => {
    it('should allow clients to access the tag name', function() {
      var element = new Element('div');
      expect(element.getTag()).to.eql('div');
    });
  });
  describe('"getAttributeNames"', () => {
    it('should allow clients to get the attribute names', function() {
      var element = new Element('div', {
        "data-test": "test1",
        "class": "test2",
      });
      expect(element.getAttributeNames()).to.eql(['data-test', 'class']);
      element = new Element('div');
      expect(element.getAttributeNames()).to.eql([]);
    });
  });
  describe('"getAttributes"', () => {
    it('should allow clients to get the attribute data', function() {
      var element = new Element('div', {
        "data-uuid": "<uuid>",
        "data-context": "<context>",
        "class": "class1 class2"
      }, '.selector', {
        "uuid": 'test1',
        "context": "test2",
      });
      expect(element.getAttributes()).to.eql({
        "data-uuid": "test1",
        "data-context": "test2",
        "class": "class1 class2",
      });

      element = new Element('div');
      expect(element.getAttributes()).to.eql({});

      element = new Element('div', {
        "data-uuid": "<uuid>",
        "data-context": "<context>",
        "class": "class1 class2"
      });
      expect(element.getAttributes()).to.eql({
        "class": "class1 class2",
      });
    });
  });
  describe('"setAttribute"', () => {
    it('should allow clients to set attribute data', function() {
      var element = new Element('div', {
        "data-uuid": "<uuid>",
        "data-context": "<context>",
        "class": "class1 class2"
      }, '.selector', {
        "uuid": 'test1',
        "context": "test2",
      });
      expect(element.getAttributes()).to.eql({
        "data-uuid": 'test1',
        "data-context": 'test2',
        "class": "class1 class2",
      });
      element.setAttribute('class', 'test');
      element.setAttribute('<uuid>', 'test3');
      element.setAttribute('another', 'test4');
      expect(element.getAttributes()).to.eql({
        "data-uuid": 'test3',
        "data-context": 'test2',
        "class": "test",
        "another": "test4",
      });
    });
  });
  describe('"getAttribute"', () => {
    it('should allow clients to get invididual attribute data', function() {
      var element = new Element('div', {
        'data-uuid': '<uuid>',
      });
      expect(element.getAttribute('<uuid>')).to.be.a('undefined');
      element.setAttribute('<uuid>', 'test1');
      element.setAttribute('class', 'test2');
      expect(element.getAttribute('<uuid>')).to.eql('test1');
      expect(element.getAttribute('data-uuid')).to.eql('test1');
      expect(element.getAttribute('class')).to.eql('test2');
    });
  });
})
