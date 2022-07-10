const getSubjectId = require("../utils/getSubjectId");

exports.seed = async function (knex) {
  await knex("subject_teacher").del();

  const data = [
    {
      teacher: "Paula Ainchil",
      subject: "Matemática",
    },
    {
      teacher: "Paula Ainchil",
      subject: "Lengua",
    },
    {
      teacher: "Maia Gorostegui",
      subject: "Lengua",
    },
    {
      teacher: "Jorge Pitaluga",
      subject: "Música",
    },
    {
      teacher: "Alberto Villavicencio",
      subject: "Geografía",
    },
    {
      teacher: "Mario Rusos",
      subject: "Formación ética",
    },
    {
      teacher: "Matías Wibaux",
      subject: "Historia",
    },
    {
      teacher: "Gabriel Pérez",
      subject: "Física",
    },
    {
      teacher: "Silvia Santoiani",
      subject: "Química",
    },
    {
      teacher: "Mara Martinez",
      subject: "Biología",
    },
    {
      teacher: "Benjamín Rodriguez",
      subject: "Historia",
    },
    {
      teacher: "Soledad Esquius",
      subject: "Biología",
    },
    {
      teacher: "Ruben Frías",
      subject: "Geografía",
    },
  ];

  const getTeacherId = async (teacherName) => {
    const [first_name, last_name] = teacherName.split(" ");
    return (
      await knex("user").select("id").where({ first_name, last_name }).first()
    ).id;
  };

  const dataToInsert = await Promise.all(
    data.map(async (el) => ({
      subject_id: await getSubjectId(el.subject, knex),
      teacher_id: await getTeacherId(el.teacher),
    }))
  );

  return knex("subject_teacher").insert(dataToInsert);
};
