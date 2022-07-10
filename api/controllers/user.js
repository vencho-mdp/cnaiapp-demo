const {
  change_email,
  change_password
} = require('../services/user')

class User_controller {
  async change_email (req, res) {
    try {
      await change_email(req.body)
      res.status(200).json({ message: 'Changed successfully' })
    } catch (error) {
      return res.status(400).send(
        error
      )
    }
  }

  async change_password (req, res) {
    try {
      await change_password(req.body)
      res.status(200).json({ message: 'Changed successfully' })
    } catch (error) {
      return res.status(400).send(
        error
      )
    }
  }
}

module.exports = new User_controller()
