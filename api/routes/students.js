const express = require('express')
const { get_students, add_students_that_were_absent, get_absent_students, get_suspicious_cases } = require('../controllers/students')
const auth = require('../middlewares/auth')

const router = express.Router()

router.get('/students', get_students)
router.post('/absent-students', auth, add_students_that_were_absent)
router.get('/absent-students', get_absent_students)
router.get('/students-absence-suspicious-cases', (req, res, next) => auth(req, res, next, ['management_team']), get_suspicious_cases)

module.exports = router
