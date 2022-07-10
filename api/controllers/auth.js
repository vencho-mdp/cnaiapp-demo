const { login, token } = require('../services/auth')

class user_controller {
  async login (req, res) {
    try {
      const data = await login(req.body.email, req.body.password)
      res.status(200).json(data)
    } catch (error) {
      res.status(error.status).json({
        error
      })
    }
  }

  async token (req, res) {
    try {
      const refresh_token = req.body.refreshToken
      const new_access_token = await token(refresh_token)
      res.status(200).json(new_access_token)
    } catch (error) {
      res.status(error.status).json({
        error
      })
    }
  }
}

module.exports = new user_controller()
