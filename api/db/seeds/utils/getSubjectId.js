module.exports = async (subjectName, knex) => {
  return (await knex('subject').select('id').where('name', subjectName))[0].id
}
