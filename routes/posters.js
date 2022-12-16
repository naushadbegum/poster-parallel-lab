const express = require("express");
const router = express.Router();

const { Poster, MediaProperty, Tag } = require('../models');

const { bootstrapField, createPosterForm } = require('../forms');

router.get('/', async (req, res) => {
    let posters = await Poster.collection().fetch({
        withRelated: ['mediaproperty'],
        withRelated: ['tags']
    });
    console.log(posters.toJSON());
    res.render('posters/index', {
        'posters': posters.toJSON()
    })
})

router.get('/create', async (req, res) => {
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get("id"), mediaproperty.get('description')]
    })

    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);

    const posterForm = createPosterForm(allMediaProperties, allTags);
    res.render('posters/create', {
        'form': posterForm.toHTML(bootstrapField)
    })
})

router.post('/create', async (req, res) => {
    console.log(req)
    const allMediaProperties = await MediaProperty.fetchAll().map((mediaproperty) => {
        return [mediaproperty.get('id'), mediaproperty.get('description')];
    })
    const posterForm = createPosterForm(allMediaProperties);
    posterForm.handle(req, {
        'success': async (form) => {
            let {tags,...posterData} = form.data;
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

    const allTags = await Tag.fetchAll().map( tag => [tag.get('id'), tag.get('name')]);
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

    let selectedTags = await poster.related('tags').pluck('id');
    posterForm.fields.tags.value = selectedTags;

    res.render('posters/update', {
        'form': posterForm.toHTML(bootstrapField),
        'poster': poster.toJSON()
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
            let { tags, ...posterData} = form.data;
            poster.set(posterData);
            poster.save();

            let tagIds = tags.split(',');
            let existingTagIds = await poster.related('tags').pluck('id');

            let toRemove = existingTagIds.filter( id => tagIds.includes(id) === false);
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