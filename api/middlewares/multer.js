const path = require('path')
const crypto = require('crypto')
const multer = require('multer')

const storage = multer.diskStorage({
  destination (req, file, cb) {
    cb(null, path.join(__dirname, '..', 'images'))
  },
  filename (req, file, cb) {
    crypto.randomBytes(16, (err, raw) => {
      cb(null, raw.toString('hex') + path.extname(file.originalname)) // Appending extension
    })
  }
})

const upload = multer({ storage })

module.exports = upload
