const express = require("express");
const router = express.Router();
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// DevTools Index
router.get("/", (req, res) => {
  res.render("devtools/index");
});

// Add DevTools Form
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("devtools/add");
});

module.exports = router;
