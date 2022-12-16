'use strict';

var dbm;
var type;
var seed;

/**
  * We receive the dbmigrate dependency from dbmigrate initially.
  * This enables us to not have to rely on NODE_PATH.
  */
exports.setup = function(options, seedLink) {
  dbm = options.dbmigrate;
  type = dbm.dataType;
  seed = seedLink;
};

exports.up = function(db) {
  return db.addColumn('posters', 'brand_id', {
    'type': 'int',
    'unsigned': true,
    'notNull': true,
    'defaultValue': 1,
    'foreignKey': {
      'name': 'poster_brand_fk',
      'table': 'brands',
      'mapping': 'id',
      'rules': {
        'onDelete': 'cascade',
        'opUpdate': 'restrict'
      }
    }
  });
};

exports.down = function(db) {
  return null;
};

exports._meta = {
  "version": 1
};
