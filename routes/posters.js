const express = require("express");
const router = express.Router();

const {Poster} = require('../models');

router.get('/', async (req,res)=> {
    let posters = await Poster.collection().fetch();
    res.render('posters/index', {
        'posters': posters.toJSON()
    })
})

module.exports = router;