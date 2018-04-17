const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const Devtools = mongoose.model('devtools');
const UserPass = mongoose.model('userspass');
const keys = require("../config/keys");
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");



router.get("/", ensureGuest, (req, res) => {
  res.render("index/welcome");
});

router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Devtools.find({user:req.user.id})
  .then(devtools => {
  res.render("index/dashboard", {
    devtools: devtools
  });
  });
});

router.get("/about", (req, res) => {
  res.render("index/about");
});

router.get("/register", (req, res) => {
  res.render("index/register");
});

router.get("/login", (req, res) => {
  res.render("index/login");
});

// Login Form Post
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/login',
    failureFlash: true
  })(req, res, next);
});


// Register Form POST
router.post('/register', (req, res) => {
  let errors = [];

  if(req.body.password !== req.body.password2) {
    errors.push({text:'Passwords do not Match'});
  }

  if(req.body.password.length <8) {
    errors.push({text:'Password must be atleast 8 characters'});
  }

  if(errors.length > 0) {
    res.render('index/register', {
      errors: errors,
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      password2: req.body.password2
    });
  } else {

    UserPass.findOne({email: req.body.email})
    .then(user => {
      if(user) {
        req.flash('error_msg', 'Email already Registered');
        res.redirect('/register');
      }else {
    const newUserPass = new UserPass({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password
    });


    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(newUserPass.password, salt, (err, hash) => {
        if (err) throw err;
        newUserPass.password = hash;
        newUserPass.save()
          .then(user => {
            req.flash('success_msg', 'You have successfully Registered');
            res.redirect('/login');
          })
          .catch(err => {
            console.log(err);
            return;
          })

      });
    });
      }
    });

  }


});





module.exports = router;
