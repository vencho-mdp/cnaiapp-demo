exports.up = async function (knex) {
  await knex.raw('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
  return knex.schema.createTable("user", (table) => {
    table
      .uuid("id")
      .primary()
      .unique()
      .defaultTo(knex.raw("uuid_generate_v4()"));
    table.text("first_name").notNullable();
    table.text("last_name").notNullable();
    table.text("email").unique();
    table.text("password").notNullable();
    table.boolean("hide").defaultTo("false");
  });
};

exports.down = function (knex) {
  return knex.schema.dropTableIfExists("user");
};
