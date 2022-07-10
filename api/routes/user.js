const express = require('express')
const {
  change_email,
  change_password
} = require('../controllers/user')

const router = express.Router()

router.put('/user/email', change_email)
router.put('/user/password', change_password)

module.exports = router
