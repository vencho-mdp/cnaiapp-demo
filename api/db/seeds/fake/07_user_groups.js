const preceptors = require("./preceptors.json");

exports.seed = async function (knex) {
  const data = await knex("user").select("id", "first_name", "last_name");

  const { id: preceptor_id } = await knex("group")
    .select("id")
    .where("name", "preceptor")
    .first();

  const { id: management_team_id } = await knex("group")
    .select("id")
    .where("name", "management_team")
    .first();

  const { id: community_manager_id } = await knex("group")
    .select("id")
    .where("name", "community_manager")
    .first();

  // Students, Teachers and Preceptors groups are already seeded
  // in seed file 03_users.js

  const res = [];

  for (const info of data) {
    const has_management_team_rol = info.last_name.includes("Admin");

    if (
      preceptors.some(
        (el) =>
          el.first_name === info.first_name && el.last_name === info.last_name
      )
    ) {
      res.push({
        user_id: info.id,
        group_id: preceptor_id,
      });
      if (!has_management_team_rol) continue;
    }
    if (has_management_team_rol) {
      res.push({
        user_id: info.id,
        group_id: management_team_id,
      });
      continue;
    }
    // if (info.first_name.startsWith("Mariano")) {
    //   res.push({
    //     user_id: info.id,
    //     group_id: community_manager_id,
    //   });
    //   continue;
    // }
  }
  await knex("user_group").insert(res);
};
