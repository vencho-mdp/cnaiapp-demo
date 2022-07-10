const express = require('express')
const { get_subjects } = require('../controllers/subjects')

const router = express.Router()

router.get('/subjects', get_subjects)

module.exports = router
