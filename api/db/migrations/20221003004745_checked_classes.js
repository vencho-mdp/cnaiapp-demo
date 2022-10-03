/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("checked_classes", (table) => {
    table
      .uuid("class_id")
      .notNullable()
      .references("id")
      .inTable("class")
      .onDelete("CASCADE");
    table.timestamp("date").notNullable();
    table.boolean("is_checked").notNullable();
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTableIfExists("checked_classes");
};
