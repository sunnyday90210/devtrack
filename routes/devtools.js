const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Devtools = mongoose.model('devtools');
const user = mongoose.model('users');
const UserPass = mongoose.model('userspass');
const { ensureAuthenticated, ensureGuest } = require('../helpers/auth');

// DevTools Index
router.get('/', (req, res) => {
  Devtools.find({ status: 'public' })
    .populate('user')
    .sort({ date: 'desc' })
    .then(devtools => {
      res.render('devtools/index', {
        devtools: devtools
      });
    });
});

// Show single devtools
router.get('/show/:id', (req, res) => {
  Devtools.findOne({
    _id: req.params.id
  })
    .populate('user')
    .populate('comments.commentUser')
    .then(devtools => {
      if (devtools.status == 'public') {
        res.render('devtools/show', {
          devtools: devtools
        });
      } else {
        if (req.user) {
          if (req.user.id == devtools.user._id) {
            res.render('devtools/show', {
              devtools: devtools
            });
          } else {
            res.redirect('/devtools');
          }
        } else {
          res.redirect('/devtools');
        }
      }
    });
});

// List DevTools from a user
router.get('/user/:userId', (req, res) => {
  Devtools.find({ user: req.params.userId, status: 'public' })
    .populate('user')
    .then(devtools => {
      res.render('devtools/index', {
        devtools: devtools
      });
    });
});

// Logged in Users DevTools
router.get('/my', ensureAuthenticated, (req, res) => {
  Devtools.find({ user: req.user.id })
    .populate('user')
    .then(devtools => {
      res.render('devtools/index', {
        devtools: devtools
      });
    });
});

// Add DevTools Form
router.get('/add', ensureAuthenticated, (req, res) => {
  res.render('devtools/add');
});

// Edit DevTools Form
router.get('/edit/:id', ensureAuthenticated, (req, res) => {
  Devtools.findOne({
    _id: req.params.id
  }).then(devtools => {
    if (devtools.user != req.user.id) {
      res.redirect('/devtools');
    } else {
      res.render('devtools/edit', {
        devtools: devtools
      });
    }
  });
});

// Process Add DevTools
router.post('/', (req, res) => {
  let allowComments;

  if (req.body.allowComments) {
    allowComments = true;
  } else {
    allowComments = false;
  }

  const newDevTools = {
    title: req.body.title,
    body: req.body.body,
    status: req.body.status,
    allowComments: allowComments,
    user: req.user.id
  };
  // Create DevTools
  new Devtools(newDevTools).save().then(devtools => {
    res.redirect(`/devtools/show/${devtools.id}`);
  });
});

// Edit Form Process
router.put('/:id', (req, res) => {
  Devtools.findOne({
    _id: req.params.id
  }).then(devtools => {
    let allowComments;

    if (req.body.allowComments) {
      allowComments = true;
    } else {
      allowComments = false;
    }

    // New Values to Save
    devtools.title = req.body.title;
    devtools.body = req.body.body;
    devtools.status = req.body.status;
    devtools.allowComments = allowComments;

    devtools.save().then(devtools => {
      res.redirect('/dashboard');
    });
  });
});

// Delete Devtool
router.delete('/:id', (req, res) => {
  Devtools.remove({ _id: req.params.id }).then(() => {
    res.redirect('/dashboard');
  });
});

// Add comment
router.post('/comment/:id', (req, res) => {
  Devtools.findOne({
    _id: req.params.id
  }).then(devtools => {
    const newComment = {
      commentBody: req.body.commentBody,
      commentUser: req.user.id
    };

    // Add to comments Array
    devtools.comments.unshift(newComment);

    devtools.save().then(devtools => {
      res.redirect(`/devtools/show/${devtools.id}`);
    });
  });
});

module.exports = router;
