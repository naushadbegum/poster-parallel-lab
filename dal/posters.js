const { Poster, MediaProperty, Tag } = require('../models');

const getMediaProperties = async () => {
    return await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get('id'), mediaproperty.get('description')];
})
}

const findPoster = async (posterId) => {
    return await Poster.where({
        'id': parseId(posterId)
    }).fetch({
        require: true,
        withRelated: ['tags']
    });
}

module.exports = {
    getMediaProperties, findPoster
}