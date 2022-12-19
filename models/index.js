const bookshelf = require('../bookshelf');

const Poster = bookshelf.model('Poster', {
    tableName: 'posters',
    media_property(){
        return this.belongsTo('MediaProperty', 'mediaproperty_id')
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

const User = bookshelf.model('User', {
    tableName: 'users'
})

const CartItem = bookshelf.model('CartItem', {
    tableName: 'cart_items',
    poster(){
        return this.belongsTo('Poster')
    }
})
module.exports = { Poster, MediaProperty, Tag, User, CartItem }; 