const sanitize_html = require("sanitize-html");
const db = require("../db/db");

class Events_DAO {
  async get_events(show_past) {
    if (!show_past) {
      const res = await db("event")
        .select()
        .where("hide", "false")
        .andWhere("end_date", ">=", new Date())
        .orderBy("start_date");
      return res;
    }
    const res = await db("event")
      .select()
      .where("hide", "false")
      .orderBy("start_date");
    return res;
  }

  async add_event(newRecord) {
    const { description, ...rest } = newRecord;
    const sanitized_description = sanitize_html(description);
    return await db("event")
      .insert({ description: sanitized_description, ...rest })
      .returning("id");
  }

  async update_event(updates) {
    const { id, description, ...rest } = updates;
    const sanitized_description = sanitize_html(description);
    await db("event")
      .where({ id })
      .update({ description: sanitized_description, ...rest });
  }

  async delete_event(id) {
    await db("event").where({ id }).update({ hide: true });
  }
}

module.exports = new Events_DAO();
