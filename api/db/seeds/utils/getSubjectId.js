module.exports = async (subjectName, knex) => {
  return (await knex('subject').select('id').where('name', subjectName).first()).id
}
