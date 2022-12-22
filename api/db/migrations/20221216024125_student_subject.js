exports.up = function (knex) {
  return knex.schema.createTable("student_subject", (table) => {
    table.primary(["student_id", "subject_id"]);

    table
      .uuid("student_id")
      .references("id")
      .inTable("user")
      .notNullable()
      .onDelete("CASCADE");

    table
      .uuid("subject_id")
      .references("id")
      .inTable("subject")
      .notNullable()
      .onDelete("CASCADE");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("student_subject");
};
