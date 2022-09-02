const {
  change_email,
  change_password,
  get_all_users,
  delete_user,
  add_user,
  edit_user,
} = require("../dao/user");

class User_service {
  async change_email(body) {
    try {
      const { user_id, password, new_email } = body;
      await change_email(user_id, password, new_email);
      return;
    } catch (error) {
      throw {
        msg: "Incorrect Password",
      };
    }
  }

  async change_password(body) {
    try {
      const { user_id, current_password, new_password } = body;
      await change_password(user_id, current_password, new_password);
      return;
    } catch (error) {
      throw {
        msg: "Incorrect Password",
      };
    }
  }

  async get_all_users() {
    try {
      return await get_all_users();
    } catch (error) {
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async delete_user(user_id) {
    try {
      if (!user_id) throw new Error();
      return await delete_user(user_id);
    } catch (error) {
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error.",
      };
    }
  }

  async add_user(body) {
    try {
      return await add_user(body);
    } catch (error) {
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error. Could not add user.",
      };
    }
  }

  async edit_user(body) {
    try {
      return await edit_user(body);
    } catch (error) {
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Internal server error. Could not edit user.",
      };
    }
  }
}

module.exports = new User_service();
