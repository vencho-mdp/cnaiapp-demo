const bcrypt = require("bcryptjs");
const db = require("../db/db");
const cachePassword = [];
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
    try {
      return await db.transaction(async (trx) => {
        await db("user")
          .where("id", user_id)
          .update({
            hide: true,
          })
          .transacting(trx);

        await db("slot_teacher")
          .where("teacher_id", user_id)
          .update({
            hide: true,
          })
          .transacting(trx);
        await db("slot")
          .whereIn(
            "slot.id",
            db("slot_teacher").where("teacher_id", user_id).select("slot_id")
          )
          .transacting(trx)
          .update("hide", true);
      });
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async add_user(data) {
    try {
      const {
        email,
        first_name,
        last_name,
        groups: groups_names,
        classes,
        subjects,
      } = data;

      const encrypted_password =
        cachePassword[0] || (await bcrypt.hash("Illia", 10));
      if (!cachePassword[0]) cachePassword.push(encrypted_password);
      let user_id = await db("user")
        .insert({
          password: encrypted_password,
          email,
          first_name,
          last_name,
        })
        .returning("id");
      user_id = user_id[0].id;
      await db.transaction(async (trx) => {
        const groups = await db("group")
          .select("id")
          .whereIn("name", groups_names)
          .transacting(trx);
        await db("user_group")
          .insert(
            groups.map((group) => ({
              user_id,
              group_id: group.id,
            }))
          )
          .transacting(trx);
        await db("user_class")
          .insert(
            classes.map((class_id) => {
              return {
                user_id,
                class_id,
              };
            })
          )
          .transacting(trx);
        if (subjects.length > 0)
          await db("subject_teacher").insert(
            subjects.map((subject_id) => {
              return {
                teacher_id: user_id,
                subject_id,
              };
            })
          );
      });
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }

  async edit_user(data) {
    try {
      const {
        id,
        email,
        first_name,
        last_name,
        groups: groups_names,
        classes,
        subjects,
      } = data;
      await db.transaction(async (trx) => {
        await trx("user").where("id", id).update({
          email,
          first_name,
          last_name,
        });
        const groups = await trx("group")
          .select("id")
          .whereIn("name", groups_names);
        await trx("user_group").where("user_id", id).del();
        await trx("user_group").insert(
          groups.map((group) => ({
            user_id: id,
            group_id: group.id,
          }))
        );
        await trx("user_class").where("user_id", id).del();
        await trx("user_class").insert(
          classes.map((class_id) => {
            return {
              user_id: id,
              class_id,
            };
          })
        );

        await trx("subject_teacher").where("teacher_id", id).del();

        if (subjects.length > 0)
          await trx("subject_teacher").insert(
            subjects.map((subject_id) => {
              return {
                teacher_id: id,
                subject_id,
              };
            })
          );
      });
      return "success";
    } catch (error) {
      console.log(error);
      throw new Error();
    }
  }
}

module.exports = new user_dao();
