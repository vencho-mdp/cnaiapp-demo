const express = require("express");
const { login, token } = require("../controllers/auth");

const router = express.Router();

router.post("/login", login);
router.post("/token", token);

module.exports = router;
