/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "evaluative_activity_subjects_teachers",
    (table) => {
      table
        .uuid("evaluative_activity_id")
        .notNullable()
        .references("id")
        .inTable("evaluative_activity")
        .onDelete("CASCADE");
      table
        .uuid("subject_id")
        .notNullable()
        .references("id")
        .inTable("subject")
        .onDelete("CASCADE");
      table
        .uuid("teacher_id")
        .notNullable()
        .references("id")
        .inTable("user")
        .onDelete("CASCADE");

      table.primary(["evaluative_activity_id", "subject_id", "teacher_id"]);
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("evaluative_activity_subjects_teachers");
};
