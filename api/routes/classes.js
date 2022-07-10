const express = require('express')
const { get_classes } = require('../controllers/classes')

const router = express.Router()

router.get('/classes', get_classes)

module.exports = router
