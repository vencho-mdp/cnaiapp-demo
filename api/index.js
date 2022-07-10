const path = require('path')
const express = require('express')
const router = require('./routes/index')

const app = express()

app.use(express.json({ limit: '300kb' }))
app.use(express.urlencoded({ limit: '300kb', extended: true }))

app.use(router)

app.use('/images', express.static(path.join(__dirname, '/images')))

module.exports = { path: '/api', handler: app }

// Start standalone server if directly running
if (require.main === module) {
  require('dotenv').config()
  const port = process.env.PORT || 3001
  app.listen(port, () => {
    console.log(`API server listening on port ${port}`)
  })
}
