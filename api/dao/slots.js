const db = require("../db/db");

const insert_teachers_to_intermediary_table = async (slots) => {
  if (slots.length === 0) {
    return;
  }
  await Promise.all(
    slots.map(async (slot) => {
      await Promise.all(
        slot.teachers_ids.map(async (user) => {
          await db("slot_teacher").insert({
            slot_id: slot.slot_id,
            teacher_id: user,
          });
        })
      );
    })
  );
};
class slot_DAO {
  async get_slots(grade, grade_number) {
    let [class_id] = await db("class")
      .where({ grade, grade_number })
      .select("id");
    if (!class_id) {
      return [];
    }
    class_id = class_id?.id;
    const slots = await db("slot")
      .select(
        "slot.weekday",
        "slot.start_time",
        "slot.weekday",
        "slot.end_time",
        "slot.id",
        "subject.id AS subject_id",
        db.raw("ARRAY_AGG(first_name || ' ' || last_name) AS teachers_names"),
        db.raw("subject.name AS subject"),
        db.raw("ARRAY_AGG(slot_teacher.teacher_id) AS teachers_ids"),
        db.raw("teacher_absence.start_date AS absence_start_date"),
        db.raw("teacher_absence.end_date AS absence_end_date")
      )
      .where({ class_id })
      .andWhere("slot.hide", "false")
      .join("slot_teacher", "slot_teacher.slot_id", "=", "slot.id")
      .join("user", "slot_teacher.teacher_id", "=", "user.id")
      .join("subject", "slot.subject_id", "=", "subject.id")
      .leftJoin("teacher_absence", function () {
        this.on("teacher_absence.hide", "=", db.raw("false"));
        this.andOnVal("teacher_absence.teacher_id", "=", db.raw('"user".id'));
        this.andOnVal(
          db.raw(
            "extract(week from start_date) = extract(week from current_date)"
          )
        );
        this.andOnVal(
          db.raw(
            "extract(year from start_date) = extract(year from current_date)"
          )
        );
      })
      .groupBy(
        "absence_start_date",
        "absence_end_date",
        "slot.weekday",
        "slot.start_time",
        "slot.weekday",
        "slot.end_time",
        "subject.id",
        "subject.name",
        "slot.id"
      )
      .orderBy("slot.start_time");
    const organized_slots = slots.reduce(
      (acc, { weekday, ...rest }) => {
        const index_of_weekday_object = acc.findIndex(
          (el) => el.weekday === weekday
        );
        acc[index_of_weekday_object].assignments.push(rest);
        return acc;
      },
      [
        { weekday: "Lunes", assignments: [] },
        { weekday: "Martes", assignments: [] },
        { weekday: "Miércoles", assignments: [] },
        { weekday: "Jueves", assignments: [] },
        { weekday: "Viernes", assignments: [] },
      ]
    );
    return organized_slots;
  }

  async update_slots(slots) {
    // Actualizar clase
    await db("class")
      .where({
        id: slots.class_id,
      })
      .update({
        grade: slots.grade,
        grade_number: slots.grade_number,
      });
    // Eliminar slots que no esten en el payload
    const slots_ids = slots.assignments
      .filter((el) => !!el.id)
      .map((el) => el.id);
    await db("slot")
      .whereNotIn("id", slots_ids)
      .andWhere({ class_id: slots.class_id })
      .del();

    // Actualizar slots
    const updated_slots = [];
    for (const slot of slots.assignments) {
      const { teachers_ids, ...rest } = slot;
      // console.log(rest)
      const [{ id: slot_id }] = rest.id
        ? await db("slot")
            .where({ id: rest.id })
            .update({ ...rest, class_id: slots.class_id }, "id")
        : await db("slot").insert({ ...rest, class_id: slots.class_id }, "id");

      const db_teachers_ids = rest.id
        ? (
            await db("slot_teacher")
              .select(db.raw("ARRAY_AGG(teacher_id) AS teachers"))
              .where({ slot_id: rest.id || "" })
              .first()
          ).teachers
        : null;
      updated_slots.push({
        slot_id,
        teachers_ids,
        db_teachers_ids,
      });
    }

    // En aquellos en los que cambiaron los profesores,
    // actualizarlos en la tabla intermedia
    const slots_where_teachers_changed = updated_slots.filter(
      ({ db_teachers_ids, teachers_ids }) => {
        // Si no es array es un record nuevo
        return Array.isArray(db_teachers_ids)
          ? !are_arrays_equal(teachers_ids, db_teachers_ids)
          : true;
      }
    );
    await insert_teachers_to_intermediary_table(slots_where_teachers_changed);
  }
}

module.exports = new slot_DAO();
