const db = require("../db/db");

class Teachers_absence_DAO {
  async get_all_absent_teachers() {
    const res = await db("teacher_absence")
      .select(
        db.raw(
          "start_date, end_date, teacher_absence.id, teacher_id, CONCAT(last_name, ', ', first_name) AS teacher_name "
        )
      )
      .join("user", "user.id", "=", "teacher_id")
      .where("teacher_absence.end_date", ">=", db.raw("current_date"))
      .andWhere("teacher_absence.hide", "false")
      .orderBy("start_date");
    return res;
  }

  async add_absent_teacher(newRecord) {
    await db("teacher_absence").insert(newRecord);
  }

  async update_absent_teacher(updates) {
    const { id } = updates;
    await db("teacher_absence").where({ id }).update(updates);
  }

  async delete_absent_teacher(id) {
    await db("teacher_absence").where({ id }).update({ hide: true });
  }
}

module.exports = new Teachers_absence_DAO();
