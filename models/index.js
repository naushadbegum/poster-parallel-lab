const bookshelf = require('../bookshelf')

const Poster = bookshelf.model('Poster', {
    tableName: 'posters',
    mediaproperty(){
        return this.belongsTo('MediaProperty')
    },
    tags(){
        return this.belongsToMany('Tag');
    }
});

const Tag = bookshelf.model('Tag', {
    tableName: 'tags',
    products() {
        return this.belongsToMany('Poster')
    }
})

const MediaProperty = bookshelf.model('MediaProperty', {
    tableName: 'media_properties',
    posters(){
        return this.hasMany('Poster', 'mediaproperty_id');
    }
})
module.exports = { Poster, MediaProperty, Tag }; 