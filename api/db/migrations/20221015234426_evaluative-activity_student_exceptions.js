/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable(
    "evaluative_activity_student_exceptions",
    (table) => {
      table
        .uuid("evaluative_activity_id")
        .notNullable()
        .references("id")
        .inTable("evaluative_activity")
        .onDelete("CASCADE");
      table
        .uuid("student_id")
        .notNullable()
        .references("id")
        .inTable("user")
        .onDelete("CASCADE");

      table.primary(["evaluative_activity_id", "student_id"]);
    }
  );
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists(
    "evaluative_activity_student_exceptions"
  );
};
