const {
  get_news,
  add_news,
  update_news,
  delete_news
} = require('../services/news')

class news_controller {
  async get_news (req, res) {
    try {
      const news = await get_news(req.protocol + '://' + req.get('host'))
      res.status(200).json(news)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async add_news (req, res) {
    try {
      const data = await add_news(req.body, req.file)
      res.status(201).json(data)
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async update_news (req, res) {
    try {
      await update_news(req.body, req.file)
      res.status(204).json()
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }

  async delete_news (req, res) {
    try {
      await delete_news(req.body.id)
      res.status(201).json({ message: 'News successfully deleted' })
    } catch (error) {
      console.error(error)
      return res.status(error.status).send({
        error
      })
    }
  }
}

module.exports = new news_controller()
