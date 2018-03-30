const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const devtools = mongoose.model('devtools');
const user = mongoose.model('user');
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// DevTools Index
router.get("/", (req, res) => {
  res.render("devtools/index");
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
  new devtools(newDevTools)
  .save()
  .then(devtools => {
    res.redirect(`/devtools/show/${devtools.id}`);
  });
});

module.exports = router;
