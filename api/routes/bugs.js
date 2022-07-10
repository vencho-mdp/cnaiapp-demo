const express = require('express')
const { add_bug } = require('../controllers/bugs')

const router = express.Router()

router.post('/bugs', add_bug)

module.exports = router
