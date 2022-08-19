const db = require("../db/db");

const isSubArray = (master, sub) => {
  return sub.every(
    (
      (i) => (v) =>
        (i = master.indexOf(v, i) + 1)
    )(0)
  );
};

const get_absent_students = async (date, classes_ids, u_id) => {
  date = new Date(date).toISOString().split("T")[0];
  const user = await db("user_group")
    .select(
      db.raw('ARRAY_AGG("group".name) AS groups'),
      db.raw('ARRAY_AGG("subject".name) AS subjects')
    )
    .leftJoin("group", function () {
      this.onIn("id", db.raw('"user_group".group_id'));
    })
    .leftJoin(
      "subject_teacher",
      "subject_teacher.teacher_id",
      "user_group.user_id"
    )
    .leftJoin("subject", "subject.id", "subject_teacher.subject_id")
    .where({ user_id: u_id })
    .groupBy("user_id")
    .first();

  if (user.groups.includes("teacher")) {
    return await db("student_absence")
      .select(
        "user.id AS id",
        "first_name",
        "last_name",
        "is_justified",
        "shift",
        "class_id"
      )
      .join("user_class", "student_id", "user_class.user_id")
      .join("user_group", "student_id", "user_group.user_id")
      .join("user", "student_id", "user.id")
      .join("group", "group.id", "user_group.group_id")
      .whereIn("class_id", classes_ids)
      .andWhere("name", "student")
      .andWhere(function () {
        this.whereIn("shift", user.subjects);
      })
      .andWhere(db.raw("date ::date"), date)
      // if it has not been reported
      // it means it is valid
      .andWhere("reported_by", null)
      .orderBy("last_name");
  }
  const data = await db("student_absence")
    .select(
      "user.id AS id",
      "first_name",
      "last_name",
      "is_justified",
      "shift",
      "class_id"
    )
    .join("user_class", "student_id", "user_class.user_id")
    .join("user_group", "student_id", "user_group.user_id")
    .join("user", "student_id", "user.id")
    .join("group", "group.id", "user_group.group_id")
    .whereIn("class_id", classes_ids)
    .andWhere("name", "student")
    .andWhere(db.raw("date ::date"), date)
    // if it has not been reported
    // it means it is valid
    .andWhere("reported_by", null)
    .orderBy("last_name");
  return data;
};

class students_DAO {
  async get_students(classes_ids, u_id) {
    const user_classes_and_role = await db("user_class")
      .andWhere("user_class.user_id", u_id)
      .join("user_group", "user_class.user_id", "user_group.user_id")
      .join("group", "group.id", "user_group.group_id")
      .select(
        db.raw("ARRAY_AGG(class_id) AS classes_ids"),
        "name AS group_name"
      )
      .groupBy("user_class.user_id", "name");
    if (
      (user_classes_and_role[0].group_name === "preceptor" ||
        user_classes_and_role[0].group_name === "teacher") &&
      !isSubArray(user_classes_and_role[0].classes_ids, classes_ids)
    ) {
      throw new Error("Invalid classes list");
    }
    const data = await db("user")
      .select(
        "user.id AS id",
        db.raw("CONCAT(last_name, ', ', first_name) AS student_name"),
        "class_id"
      )
      .join("user_class", "user.id", "user_class.user_id")
      .join("class", "user_class.class_id", "class.id")
      .join("user_group", "user.id", "user_group.user_id")
      .leftJoin("student_absence", "student_absence.student_id", "user.id")
      .join("group", "group.id", "user_group.group_id")
      .whereIn("class_id", classes_ids)
      .andWhere("name", "student")
      .having(db.raw("COUNT(student_id) < 5"))
      .groupBy("user.id", "class_id", "first_name", "last_name")
      .orderBy("last_name");
    return data;
  }

  async add_students_that_were_absent(list, date, user_id) {
    const formatted_date = new Date(date).toISOString();
    const deleted_students = list.filter((el) => el.deleted_because);
    const added_students = list.filter((el) => !el.deleted_because);
    // TODO:
    // in case shift was one from the extra curricular activities
    // validate user has permissions using auth header
    try {
      await Promise.all(
        [
          added_students.map(
            async ({
              id,
              is_justified,
              previous_shift,
              shift,
              was_shift_modified,
            }) => {
              if (was_shift_modified) {
                return db("student_absence")
                  .update({
                    is_justified: is_justified,
                    shift,
                  })
                  .where({
                    student_id: id,
                    date: formatted_date,
                    shift: previous_shift,
                  });
              }
              return db("student_absence")
                .insert({
                  student_id: id,
                  date: formatted_date,
                  added_by: user_id,
                  is_justified,
                  shift,
                })
                .onConflict(["student_id", "date", "shift"])
                .merge(["is_justified"])
                .returning("*");
            }
          ),
          deleted_students.map(({ id, deleted_because, shift }) =>
            db("student_absence")
              .where({
                student_id: id,
                date: formatted_date,
                shift,
              })
              .update({
                reason_of_deletion: deleted_because,
                reported_by: user_id,
              })
          ),
        ].flat()
      );
    } catch (error) {
      console.log(error);
    }
  }

  async get_absent_students(date, classes_ids, u_id) {
    return await get_absent_students(date, classes_ids, u_id);
  }

  async get_suspicious_cases() {
    const nro_of_reports_that_are_suspicious = 2;
    const suspicious_preceptors_because_are_reporting_a_lot_func = async () =>
      await db("student_absence")
        .select(
          db.raw("CONCAT(last_name, ' ', first_name) AS preceptor"),
          db.raw("count(*) as nro_of_reports"),
          db.raw("ARRAY_AGG(date ORDER BY date DESC) AS dates"),
          // affected classes names
          db.raw(
            "ARRAY_AGG(DISTINCT CONCAT(grade, ' ', grade_number)) AS classes_names"
          )
        )
        .join("user", "reported_by", "user.id")
        .join("user_class", "student_id", "user_class.user_id")
        .join("class", "user_class.class_id", "class.id")
        .where("reported_by", "<>", db.raw('"added_by"'))
        .andWhere("reason_of_deletion", "=", "Error al pasar el listado")
        .having(db.raw("COUNT(*)"), ">", nro_of_reports_that_are_suspicious)
        .orderBy("nro_of_reports", "desc")
        .groupBy("reported_by", "first_name", "last_name");

    const suspicious_preceptors_because_are_being_reported_a_lot_func =
      async () =>
        await db("student_absence")
          .select(
            db.raw("CONCAT(first_name, ' ', last_name) AS preceptor"),
            db.raw("count(*) as nro_of_reports"),
            db.raw("ARRAY_AGG(date ORDER BY date DESC) AS dates"),
            db.raw(
              "ARRAY_AGG(DISTINCT CONCAT(grade, ' ', grade_number)) AS classes_names"
            )
          )
          .join("user", "added_by", "user.id")
          .join("user_class", "student_id", "user_class.user_id")
          .join("class", "user_class.class_id", "class.id")
          .having(db.raw("COUNT(*)"), ">", nro_of_reports_that_are_suspicious)
          .where("reported_by", "<>", db.raw('"added_by"'))
          .andWhere("reason_of_deletion", "=", "Error al pasar el listado")
          .orderBy("nro_of_reports", "desc")
          .groupBy("added_by", "first_name", "last_name");

    const [
      suspicious_preceptors_because_are_reporting_a_lot,
      suspicious_preceptors_because_are_being_reported_a_lot,
    ] = await Promise.all([
      suspicious_preceptors_because_are_reporting_a_lot_func(),
      suspicious_preceptors_because_are_being_reported_a_lot_func(),
    ]);

    return {
      // eslint-disable-next-line object-shorthand
      suspicious_preceptors_because_are_reporting_a_lot:
        suspicious_preceptors_because_are_reporting_a_lot,
      // eslint-disable-next-line object-shorthand
      suspicious_preceptors_because_are_being_reported_a_lot:
        suspicious_preceptors_because_are_being_reported_a_lot,
    };
  }
}

module.exports = new students_DAO();
