const bcrypt = require("bcryptjs");
const db = require("../db/db");
class user_dao {
  async change_email(user_id, password, new_email) {
    const { password: real_password } = await db("user")
      .select("password")
      .where("id", user_id)
      .first();
    const check_password = await bcrypt.compare(password, real_password);
    if (!check_password) {
      throw new Error();
    }
    await db("user").update("email", new_email).where("id", user_id);
  }

  async change_password(user_id, current_password, new_password) {
    const { password: real_password } = await db("user")
      .select("password")
      .where("id", user_id)
      .first();
    const check_password = await bcrypt.compare(
      current_password,
      real_password
    );
    if (!check_password) {
      throw new Error();
    }
    const encrypted_password = await bcrypt.hash(new_password, 10);
    await db("user")
      .update("password", encrypted_password)
      .where("id", user_id);
  }

  async get_all_users() {
    try {
      const data = await db("user")
        .select(
          "user.id",
          "first_name",
          "last_name",
          "email",
          db.raw('ARRAY_AGG(DISTINCT "group".name) as groups'),
          db.raw("ARRAY_AGG(DISTINCT subject.name) as subjects"),
          db.raw(
            "ARRAY_AGG(DISTINCT CONCAT(class.grade, ' ', class.grade_number)) as classes"
          )
        )
        .where("user.hide", false)
        .join("user_group", "user_group.user_id", "user.id")
        .join("group", "group.id", "user_group.group_id")
        .leftJoin("user_class", "user_class.user_id", "user.id")
        .leftJoin("class", "class_id", "class.id")
        .leftJoin("subject_teacher", "subject_teacher.teacher_id", "user.id")
        .leftJoin("subject", "subject_id", "subject.id")
        .groupBy("user.id")
        .orderBy("last_name");
      return data;
    } catch (error) {
      console.log(error);
    }
  }

  async delete_user(user_id) {
    return await Promise.all([
      db("user").where("id", user_id).update({
        hide: true,
      }),
      db("user_group").where("user_id", user_id).update({
        hide: true,
      }),
      db("user_class").where("user_id", user_id).update({
        hide: true,
      }),
      db("subject_teacher").where("teacher_id", user_id).update({
        hide: true,
      }),
    ]);
  }
}

module.exports = new user_dao();
