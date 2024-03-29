const db = require("../db/db");

const isSubArray = (array, subarray) => {
  return subarray.every((value) => array.includes(value));
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
  async get_students(
    classes_ids,
    u_id,
    include_students_from_subjects = false
  ) {
    const valid_grades = db("class")
      .select("grade")
      .whereIn(
        "id",
        db.raw("SELECT class_id FROM user_class WHERE user_id = ?", [u_id])
      );
    const user_classes_and_role = await db("class")
      .whereIn("grade", valid_grades)
      .join("user_group", "user_group.user_id", db.raw(`'${u_id}'`))
      .join("group", "group.id", "user_group.group_id")
      .leftJoin(
        "subject_teacher",
        "subject_teacher.teacher_id",
        "user_group.user_id"
      )
      .select(
        db.raw("ARRAY_AGG(class.id) AS classes_ids"),
        db.raw("ARRAY_AGG(DISTINCT name) AS group_names"),
        db.raw("ARRAY_AGG(DISTINCT subject_id) AS subjects_ids")
      )
      .first();
    if (
      !user_classes_and_role.group_names.includes("management_team") &&
      !isSubArray(user_classes_and_role.classes_ids, classes_ids)
    ) {
      throw new Error("Invalid classes list");
    }
    const data = db("user")
      .select(
        "user.id AS id",
        db.raw("CONCAT(last_name, ', ', first_name) AS student_name"),
        "class_id"
      )
      .join("user_class", "user.id", "user_class.user_id")
      .join("class", "user_class.class_id", "class.id")
      .join("user_group", "user.id", "user_group.user_id")
      .leftJoin("student_subject", "student_subject.student_id", "user.id")
      .join("group", "group.id", "user_group.group_id")
      .modify(function (queryBuilder) {
        if (!user_classes_and_role.group_names.includes("management_team")) {
          const condition = include_students_from_subjects
            ? ["subject_id", "in", user_classes_and_role.subjects_ids]
            : ["class_id", "in", user_classes_and_role.classes_ids];
          queryBuilder
            .where((builder) => {
              builder.whereIn("grade", ["5to", "6to"]).andWhere(...condition);
            })
            .orWhere((builder) => {
              builder
                .whereIn("class_id", user_classes_and_role.classes_ids)
                .whereNotIn("grade", ["5to", "6to"]);
            });
        }
      })
      .andWhere("name", "student")
      .groupBy("user.id", "class_id", "first_name", "last_name")
      .orderBy("last_name");
    return await data;
  }

  async add_students_that_were_absent(list, date, user_id) {
    const formatted_date = new Date(date).toISOString();
    const deleted_students = list.filter((el) => el.deleted_because);
    const added_students = list.filter((el) => !el.deleted_because);
    const classes_ids = added_students.map((el) => el.class_id);
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
              accidentally_deleted,
            }) => {
              if (accidentally_deleted) {
                return db("student_absence")
                  .update({
                    reason_of_deletion: null,
                    reported_by: null,
                  })
                  .where({
                    student_id: id,
                    date: formatted_date,
                    shift: shift,
                  });
              }
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
          classes_ids.map((el) =>
            db("checked_classes").insert({
              class_id: el,
              date: formatted_date,
              is_checked: true,
            })
          ),
        ].flat()
      );
    } catch (error) {
      console.log(error);
    }
  }

  async add_checked_classes(classes_ids, date) {
    const formatted_date = new Date(date).toISOString();
    await db("checked_classes")
      .insert(
        classes_ids.map((el) => ({
          class_id: el,
          date: formatted_date,
          is_checked: true,
        }))
      )
      .onConflict()
      .ignore();
  }

  async get_checked_classes(date) {
    const formatted_date = new Date(date).toISOString();
    const data = await db("checked_classes")
      .select("class_id AS id")
      .where("date", formatted_date);
    return data.map((el) => el.id);
  }

  async get_absent_students(date, classes_ids, u_id) {
    return await get_absent_students(date, classes_ids, u_id);
  }

  async get_student_absence_dates(student_id, class_id, since_date) {
    const query = db("student_absence")
      .select("date", "shift", "is_justified", "reason_of_deletion")
      .andWhere(db.raw("date ::date"), ">=", since_date)
      .andWhere("reason_of_deletion", null)
      .orderBy("date", "desc");
    if (student_id !== "all") {
      query.modify(function (queryBuilder) {
        queryBuilder.where("student_id", student_id);
      });
    }
    if (student_id === "all") {
      query.modify(function (queryBuilder) {
        queryBuilder
          .join("user_class", "user_class.user_id", "student_id")
          .where("user_class.class_id", class_id)
          .select("student_id");
      });
    }
    return await query;
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

  async get_late_students(date, classes_ids) {
    date = new Date(date).toISOString().split("T")[0];
    return await db("student_absence")
      .select(
        db.raw("CONCAT(last_name, ', ', first_name) AS student_name"),
        "user.id",
        "shift"
      )
      .join("user", "student_id", "user.id")
      .join("user_class", "student_id", "user_class.user_id")
      .andWhere(db.raw("date ::date"), date)
      .whereIn("class_id", classes_ids)
      .where({ reason_of_deletion: "Llegó tarde" })
      .orderBy("last_name");
  }

  async get_student_grades(student_id) {
    return await db("grades")
      .select(
        "evaluative_activity.id AS evaluative_activity_id",
        "grade",
        "dates",
        "title",
        "grade_type",
        "min_grade_to_pass",
        db.raw("ARRAY_AGG(subject.name) AS subjects")
      )
      .join(
        "evaluative_activity",
        "evaluative_activity.id",
        "evaluative_activity_id"
      )
      .join(
        "evaluative_activity_subjects_teachers",
        "evaluative_activity_subjects_teachers.evaluative_activity_id",
        "evaluative_activity.id"
      )
      .join("subject", "subject.id", "subject_id")
      .groupBy("evaluative_activity.id", "grade", "dates", "title")
      .where("student_id", student_id);
  }
}

module.exports = new students_DAO();
