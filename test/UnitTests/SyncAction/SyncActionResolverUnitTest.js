
'use strict'

const expect = require('chai').expect;
const Backbone = require('backbone');
const SyncActionResolver = require('../../../SyncAction/SyncActionResolver');

describe('SyncActionResolver module', () => {
  describe('"addCollection", "resolve"', () => {
    it('should allow clients resolve commands', function() {
      var resolver = new SyncActionResolver();
      var collection1 = new Backbone.Collection();
      var collection2 = new Backbone.Collection();
      resolver.addCollection('type1', collection1);
      resolver.addCollection('type2', function() {
        return collection2;
      });

      resolver.resolve([
        {
          id: 'model1',
          type: 'type1',
          attributes: {
            'attr1': 'test1'
          }
        },
        {
          id: 'model2',
          type: 'type1',
          attributes: {
            'attr2': 'test2'
          }
        },
        {
          id: 'model3',
          type: 'type2',
          attributes: {
            'attr3': 'test3'
          }
        },
      ]);
      expect(collection1.toJSON()).to.eql([
        {
          id: 'model1',
          attr1: 'test1',
        },
        {
          id: 'model2',
          attr2: 'test2',
        }
      ]);
      expect(collection2.toJSON()).to.eql([
        {
          id: 'model3',
          attr3: 'test3',
        }
      ]);

      resolver.resolve([
        {
          id: 'model1',
          type: 'type1',
          attributes: {
            'id': 'model11',
          },
        }
      ]);
      expect(collection1.toJSON()).to.eql([
        {
          id: 'model11',
          attr1: 'test1',
        },
        {
          id: 'model2',
          attr2: 'test2',
        }
      ]);
    });
  });
})
