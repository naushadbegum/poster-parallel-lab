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
  return db.createTable('posters', {
    id: {type: 'int', primaryKey:true, autoIcrement: true, unsigned: true},
    title: {type: 'string', length: 100, notNull: true},
    cost: {type: 'int', notNull:true},
    description: {type: 'text'},
    date: {type: 'date', notNull:true},
    stock: {type: 'int', notNull:true},
    height: {type: 'int', notNull:true},
    width: {type: 'int', notNull:true}

  })
};


exports.down = function(db) {
  return db.dropTable('posters');
};

exports._meta = {
  "version": 1
};
