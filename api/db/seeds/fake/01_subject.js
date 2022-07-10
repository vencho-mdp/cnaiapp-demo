exports.seed = function (knex) {
  return knex('subject')
    .del()
    .then(function () {
      return knex('subject').insert([
        { name: 'Educacion física' },
        { name: 'Matemática' },
        { name: 'Lengua' },
        { name: 'Física' },
        { name: 'Química' },
        { name: 'Plástica' },
        { name: 'Formación ética' },
        { name: 'Inglés' },
        { name: 'Historia' },
        { name: 'Informática' },
        { name: 'Geografía' },
        { name: 'Música' },
        { name: 'Biología' }
      ])
    })
}
