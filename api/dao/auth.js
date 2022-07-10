const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../db/db");

const DEFAULT_REFRESH_TOKEN_EXPIRATION = "14 days";
const DEFAULT_ACCESS_TOKEN_EXPIRATION = "30m";

class User_DAO {
  async login(email, password) {
    const user_real_info = await db("user")
      .where({ email })
      .andWhere("user.hide", "false")
      .join("user_group", "user.id", "user_id")
      .leftJoin("group", function () {
        this.onIn("group_id", db.raw('"group".id'));
      })
      .leftJoin("user_class", "user.id", "user_class.user_id")
      .select(
        "password",
        "email",
        db.raw('"user".id'),
        db.raw('ARRAY_AGG(DISTINCT "group".name) AS group_names'),
        db.raw('ARRAY_AGG("user_class".class_id) AS classes_ids')
      )
      .groupBy("user.id", "password")
      .first();

    if (!user_real_info) {
      throw new Error({ msg: "Invalid credentials" });
    }

    const check_password = await bcrypt.compare(
      password,
      user_real_info.password
    );

    if (!check_password) {
      throw new Error({ msg: "Invalid password" });
    }

    const information_to_token = {
      id: user_real_info.id,
      groups: user_real_info.group_names,
      classes_ids: user_real_info.group_names.includes("management_team")
        ? (await db("class").select("id")).map((el) => el.id)
        : user_real_info.classes_ids,
      email: user_real_info.email,
    };

    const token = jwt.sign(
      information_to_token,
      process.env.ACCESS_TOKEN_SECRET,
      { expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION }
    );

    const refresh_token = jwt.sign(
      information_to_token,
      process.env.REFRESH_TOKEN_SECRET,
      { expiresIn: DEFAULT_REFRESH_TOKEN_EXPIRATION }
    );
    return { token, refresh_token };
  }

  async token(refresh_token) {
    const { id } = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
    const user_real_info = await db("user")
      .where("user.id", id)
      .andWhere("user.hide", "false")
      .join("user_group", "user.id", "user_id")
      .join("group", function () {
        this.onIn("group_id", db.raw('"group".id'));
      })
      .leftJoin("user_class", "user.id", "user_class.user_id")
      .select(
        "email",
        db.raw('"user".id'),
        db.raw('ARRAY_AGG("group".name) AS group_names'),
        db.raw('ARRAY_AGG("user_class".class_id) AS classes_ids')
      )
      .groupBy("user.id", "password", "group.name")
      .first();

    const information_to_token = {
      id: user_real_info.id,
      groups: user_real_info.group_names,
      classes_ids: user_real_info.group_names.includes("management_team")
        ? (await db("class").select("id")).map((el) => el.id)
        : user_real_info.classes_ids,
      email: user_real_info.email,
    };

    const new_token = jwt.sign(
      information_to_token,
      process.env.ACCESS_TOKEN_SECRET,
      {
        expiresIn: DEFAULT_ACCESS_TOKEN_EXPIRATION,
      }
    );

    return {
      token: new_token,
    };
  }
}

module.exports = new User_DAO();
