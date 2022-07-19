const { login, token } = require("../dao/auth");

class user_service {
  async login(email, password) {
    try {
      const res = await login(email, password);
      return res;
    } catch (error) {
      throw {
        status: 401,
        code: "INVALID_LOGIN",
        msg: "Invalid authentication credentials.",
      };
    }
  }

  async token(refresh_token) {
    try {
      const res = await token(refresh_token);
      return res;
    } catch (error) {
      throw {
        status: 401,
        code: "INVALID_REFRESH_TOKEN",
        msg: "The refresh token provided is invalid.",
      };
    }
  }
}

module.exports = new user_service();
