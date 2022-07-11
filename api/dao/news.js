const sanitize_html = require("sanitize-html");
const db = require("../db/db");

const sanitized_data = ({ content, ...rest }) => ({
  content: sanitize_html(content),
  ...rest,
});

class news_DAO {
  async get_news() {
    const res = await db("news")
      .select("id", "title", "content", "created_at", "image_extension")
      .where("hide", "false")
      .orderBy("created_at", "desc");
    return res;
  }

  async add_news(new_record) {
    const record = await db("news")
      .insert(sanitized_data(new_record))
      .returning("id");
    return record;
  }

  async update_news(updates) {
    const { id, ...rest } = updates;

    await db("news").where({ id }).update(sanitized_data(rest)).returning("*");
  }

  async delete_news(id) {
    await db("news").where({ id }).update({ hide: true });
  }
}

module.exports = new news_DAO();
