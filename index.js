

const express = require("express");
const hbs = require("hbs");
const wax = require("wax-on");
require("dotenv").config();

const session = require('express-session');
const flash = require('connect-flash');
const FileStore = require('session-file-store')(session);

const csrf = require('csurf');

app.use(csrf());

app.use(function (err,req,res,next){
  if(err && err.code == "EBADCSRFTOKEN") {
    req.flash('error_messages', 'The form has expired. Please try again');
    res.redirect('back');
  }else {
    next()
  }
});

app.use(function(req,res,next){
  res.locals.csrfToken = req.csrfToken();
  next();
})



// create an instance of express app
let app = express();

// set the view engine
app.set("view engine", "hbs");

// static folder
app.use(express.static("public"));

// setup wax-on
wax.on(hbs.handlebars);
wax.setLayoutPath("./views/layouts");

// enable forms
app.use(
  express.urlencoded({
    extended: false
  })
);

app.use(session({
  store: new FileStore(),
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: true
}));

app.use(flash())

app.use(function (req,res,next){
  res.locals.success_messages= req.flash("success_messages");
  res.locals.error_messages = req.flash("error_messages");
  next();
})


const landingRoutes = require('./routes/landing');
const posterRoutes = require('./routes/posters');
const userRoutes = require('./routes/users');
const cloudinaryRoutes = require('./routes/cloudinary.js')

async function main() {
    app.use('/', landingRoutes);
    app.use('/posters', posterRoutes);
    app.use('/users', userRoutes);
    app.use('/cloudinary', cloudinaryRoutes);
}
main();

app.use(function(req,res,next){
  res.locals.user = req.session.user;
  next();
})



app.listen(3000, () => {
  console.log("Server has started");
});

