const path = require('path')
const { promises } = require('fs')
const {
  get_news,
  add_news,
  update_news,
  delete_news
} = require('../dao/news')
const change_file_name = require('../utils/change_file_name')

class news_service {
  async get_news (url) {
    try {
      const news = await get_news()
      return news.map(({ image_extension, ...el }) => ({
        ...el,
        image: image_extension && (url + '/api/images/' + el.id + image_extension),
        original_image_extension: image_extension
      }))
    } catch (error) {
      throw {
        status: 500,
        code: 'INTERNAL_ERROR',
        msg: 'Internal server error.'
      }
    }
  }

  async add_news (new_record, file) {
    try {
      if (file?.filename) {
        const [{ id }] = await add_news({ ...new_record, image_extension: path.extname(file.filename) })
        return await change_file_name(file.filename, id)
      }
      return await add_news(new_record)
    } catch (error) {
      console.log(error)
      throw {
        status: 409,
        code: 'REQUEST_CONFLICT',
        msg: 'The request could not be processed because of conflict in the request.'
      }
    }
  }

  async update_news ({ original_image_extension, ...updates }, created_file) {
    try {
      if (created_file?.filename) {
        // if img changed
        await change_file_name(created_file.filename, updates.id)
        return await update_news({ ...updates, image_extension: path.extname(created_file.filename) })
      }

      const { image, ...rest_of_updates } = updates

      if (!image) {
        // remove img if existed
        if (original_image_extension) { await promises.unlink(path.join(__dirname, '..', '/images', updates.id + original_image_extension)) }
        return await update_news({ ...rest_of_updates, image_extension: null })
      }

      return await update_news(rest_of_updates)
    } catch (error) {
      console.log(error)
      throw {
        status: 404,
        code: 'NOT_FOUND',
        msg: 'Not found.'
      }
    }
  }

  async delete_news (id) {
    try {
      return await delete_news(id)
    } catch (error) {
      throw {
        status: 400,
        code: 'BAD_REQUEST',
        msg: 'Bad Request response.'
      }
    }
  }
}

module.exports = new news_service()
