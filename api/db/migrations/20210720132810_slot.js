const { onUpdateTrigger } = require('../knexfile')

exports.up = async function (knex) {
  return knex.schema
    .createTable('slot', (table) => {
      table
        .uuid('id')
        .primary()
        .unique()
        .defaultTo(knex.raw('uuid_generate_v4()'))
      table
        .uuid('class_id')
        .references('id')
        .inTable('class')
        .notNullable()
        .onDelete('CASCADE')

      table
        .uuid('subject_id')
        .references('id')
        .inTable('subject')
        .notNullable()
        .onDelete('CASCADE')

      table.timestamps(true, true)

      table.text('weekday').notNullable()

      table.time('start_time').notNullable()

      table.time('end_time').notNullable()

      table.boolean('hide').defaultTo('false')
    })
    .then(() => knex.raw(onUpdateTrigger('slot')))
}

exports.down = function (knex) {
  return knex.schema.dropTableIfExists('slot')
}
