const students = require("./students.json");
const preceptors = require("./preceptors.json");
const capitalize = (s) => {
  if (typeof s !== "string") {
    return "";
  }
  return s.charAt(0).toUpperCase() + s.slice(1);
};

exports.seed = async function (knex) {
  const classes = {};

  const records = [
    {
      first_name: "Admin",
      last_name: "Admin",
      email: "adminadmin@gmail.com",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Paula",
      last_name: "Ainchil",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Maia",
      last_name: "Gorostegui",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Jorge",
      last_name: "Pitaluga",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Alberto",
      last_name: "Villavicencio",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Mario",
      last_name: "Rusos",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Matías",
      last_name: "Wibaux",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Gabriel",
      last_name: "Pérez",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Silvia",
      last_name: "Santoiani",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Mara",
      last_name: "Martinez",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Ruben",
      last_name: "Frías",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Soledad",
      last_name: "Esquius",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
    {
      first_name: "Benjamín",
      last_name: "Rodriguez",
      password: "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
    },
  ];

  await knex("user_group").del();
  await knex("user_class").del();
  await knex("student_absence").del();
  await knex("user").del();

  const { id: student_group_id } = await knex("group")
    .select("id")
    .where("name", "student")
    .first();

  const { id: teacher_group_id } = await knex("group")
    .select("id")
    .where("name", "teacher")
    .first();

  await knex("user")
    .insert(
      preceptors.map(({ first_name, last_name }) => ({
        first_name,
        last_name,
        email: `${last_name}${first_name}@gmail.com`
          .trim()
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, ""),
        password:
          "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
      }))
    )
    .onConflict("email")
    .ignore();

  const ids = await knex("user")
    .insert(
      records.map(({ email, ...el }) => ({
        ...el,
        email: email || null,
      }))
    )
    .returning("id");

  await knex("user_group")
    .insert(
      ids.map(({ id }) => {
        return {
          user_id: id,
          group_id: teacher_group_id,
        };
      })
    )
    .returning("*");
  // insert students
  for (const student of students) {
    const [last_name_not_formatted, first_name_not_formatted] =
      student.APYNOM.split(",");
    const [{ id }] = await knex("user")
      .insert({
        first_name: capitalize(
          first_name_not_formatted.trim().toLowerCase().replace(/,/g, "")
        ),
        last_name: capitalize(
          last_name_not_formatted.trim().toLowerCase().replace(/,/g, "")
        ),
        email: null,
        password:
          "$2a$10$b3/Zymj0dYKatA3Fd4n/eOE/QvP.OxTbQ0ktGHXuPc.0tr8DLlDQ.",
      })
      .returning("id");

    const student_class = `${student.AÑO} ${student.DIV}`;
    if (classes[student_class]) {
      await knex("user_class").insert({
        user_id: id,
        class_id: classes[student_class],
      });
    } else {
      const class_id = await knex("class")
        .where({
          grade: student.AÑO,
          grade_number: student.DIV,
        })
        .select("id")
        .first();
      await knex("user_class").insert({
        user_id: id,
        class_id: class_id.id,
      });
      classes[student_class] = class_id.id;
    }
    await knex("user_group").insert({
      user_id: id,
      group_id: student_group_id,
    });
  }

  return knex;
};
