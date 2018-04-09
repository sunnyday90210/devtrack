const express = require("express");
const router = express.Router();
const mongoose = require('mongoose');
const Devtools = mongoose.model('devtools');
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


module.exports = router;
