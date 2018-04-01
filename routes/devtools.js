const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Devtools = mongoose.model('devtools');
const user = mongoose.model('users');
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// DevTools Index
router.get("/", (req, res) => {
  Devtools.find({status:'public'})
  .populate('user')
  .then(devtools => {
    res.render("devtools/index",  {
      devtools: devtools
    });
  });
});

// Add DevTools Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("devtools/add");
});

// Process Add DevTools
router.post("/", (req, res) => {
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
  new Devtools(newDevTools)
  .save()
  .then(devtools => {
    res.redirect(`/devtools/show/${devtools.id}`);
  });
});

module.exports = router;
