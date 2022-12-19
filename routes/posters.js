const express = require("express");
const router = express.Router();

const { Poster, MediaProperty, Tag } = require('../models');

const { bootstrapField, createPosterForm, createSearchForm } = require('../forms');

const { checkIfAuthenticated } = require('../middlewares');

const dataLayer = require('../dal/posters')

// router.get('/', async (req, res) => {
//     let posters = await Poster.collection().fetch({
//         withRelated: ['media_property', 'tags'],
//     });
//     console.log(posters.toJSON());
//     res.render('posters/index', {
//         'posters': posters.toJSON()
//     })
// })

router.get('/', async (req, res) => {
    const allMediaProperties = await dataLayer.getMediaProperties();
    allMediaProperties.unshift([0, '----']);

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    let searchForm = createSearchForm(allMediaProperties, allTags);
    let q = Poster.collection();

    searchForm.handle(req, {
        'empty': async (form) => {
            let posters = await q.fetch({
                withRelated: ['tags']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'error': async (form) => {
            let posters = await q.fetch({
                withRelated: ['tags']
            })
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        },
        'success': async (form) => {
            if (form.data.title) {
                q.where('title', 'like', '%' + form.data.title + '%')
            }
            if (form.data.media_property_id && form.data.media_property_id != "0") {
                q.where('mediaproperty_id', '=', form.data.mediaproperty_id)
            }
            if (form.data.min_cost) {
                q.where('cost', '>=', form.data.min_cost)
            }
            if (form.data.max_cost) {
                q.where('cost', '<=', form.data.max_cost);
            }
            if (form.data.tags) {
                q.query('join', 'poster_tags', 'posters.id', 'poster_id').where('tag_id', 'in', form.data.tags.split(','))
            }

            let posters = await q.fetch({
                withRelated: ['media_property', 'tags']
            })
            console.log(posters.toJSON());
            res.render('posters/index', {
                'posters': posters.toJSON(),
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})


router.get('/create', checkIfAuthenticated, async (req, res) => {
    const allMediaProperties = await dataLayer.getMediaProperties();

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })

    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField),
        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
})

router.post('/create', checkIfAuthenticated, async (req, res) => {
    console.log(req)
    const allMediaProperties = await dataLayer.getMediaProperties();
    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData } = form.data;
            const poster = new Poster(posterData);
            // poster.set('title', form.data.title);
            // poster.set('cost', form.data.cost);
            // poster.set('description', form.data.description);
            // poster.set('date', form.data.date);
            // poster.set('stock', form.data.stock);
            // poster.set('height', form.data.height);
            // poster.set('width', form.data.width);
            await poster.save();
            if (tags) {
                await poster.tags().attach(tags.split(","));
            }
            req.flash("success_messages", `New Poster ${poster.get('title')} has been created`)
            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/create', {
                'form': form.toHTML(bootstrapField)
            })
        }
    })
})

router.get('/:poster_id/update', async (req, res) => {
    const posterId = req.params.poster_id
    const poster = await Poster.where({
        'id': posterId
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    const allTags = await Tag.fetchAll().map(tag => [tag.get('id'), tag.get('name')]);
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get('id'), mediaproperty.get('description')];
    })
    const posterForm = createPosterForm(allMediaProperties, allTags);

    posterForm.fields.title.value = poster.get('title');
    posterForm.fields.cost.value = poster.get('cost');
    posterForm.fields.description.value = poster.get('description');
    posterForm.fields.date.value = poster.get('date');
    posterForm.fields.stock.value = poster.get('stock');
    posterForm.fields.height.value = poster.get('height');
    posterForm.fields.width.value = poster.get('width');
    posterForm.fields.width.value = poster.get('mediaproperty_id');

    posterForm.fields.image_url.value = poster.get('image_url');

    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON(),

        cloudinaryName: process.env.CLOUDINARY_NAME,
        cloudinaryApiKey: process.env.CLOUDINARY_API_KEY,
        cloudinaryPreset: process.env.CLOUDINARY_UPLOAD_PRESET
    })
});


router.post('/:poster_id/update', async (req, res) => {
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get('id'), mediaproperty.get('description')];
    })

    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true,
        withRelated: ['tags']
    });

    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            let { tags, ...posterData } = form.data;
            poster.set(posterData);
            poster.save();

            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            let toRemove = existingTagIds.filter(id => tagIds.includes(id) === false);
            await poster.tags().detach(toRemove);

            await poster.tags().attach(tagIds);

            res.redirect('/posters');
        },
        'error': async (form) => {
            res.render('posters/update', {
                'form': form.toHTML(bootstrapField),
                'poster': poster.toJSON()
            })
        }
    })
})


router.get('/:poster_id/delete', async (req, res) => {
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    res.render('posters/delete', {
        'poster': poster.toJSON()
    })
});

router.post('/:poster_id/delete', async (req, res) => {
    const poster = await Poster.where({
        'id': req.params.poster_id
    }).fetch({
        require: true
    });
    await poster.destroy();
    res.redirect('/posters')
})


module.exports = router;