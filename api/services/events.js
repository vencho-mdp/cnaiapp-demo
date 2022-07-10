const path = require('path')
const { promises } = require('fs')
const {
  get_events,
  add_event,
  update_event,
  delete_event
} = require('../dao/events')
const change_file_name = require('../utils/change_file_name')

class Events_service {
  async get_events (url, show_past = false) {
    try {
      const events = await get_events(show_past)
      return events.map(({ image_extension, ...el }) => ({
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

  async add_event (new_record, file) {
    // console.log(new_record, file)
    try {
      if (file?.filename) {
        const [{ id }] = await add_event({ ...new_record, image_extension: path.extname(file.filename) })
        return await change_file_name(file.filename, id)
      }
      return await add_event(new_record)
    } catch (error) {
      console.log(error)
      throw {
        status: 409,
        code: 'REQUEST_CONFLICT',
        msg: 'The request could not be processed because of conflict in the request.'
      }
    }
  }

  async update_event ({ original_image_extension, ...updates }, created_file) {
    try {
      if (created_file?.filename) {
      // if img changed
        await change_file_name(created_file.filename, updates.id)
        return await update_event({ ...updates, image_extension: path.extname(created_file.filename) })
      }

      const { image, ...rest_of_updates } = updates

      if (!image) {
      // remove img if existed
        if (original_image_extension) { await promises.unlink(path.join(__dirname, '..', '/images', updates.id + original_image_extension)) }
        return await update_event({ ...rest_of_updates, image_extension: null })
      }

      return await update_event(rest_of_updates)
    } catch (error) {
      console.log(error)
      throw {
        status: 404,
        code: 'NOT_FOUND',
        msg: 'Not found.'
      }
    }
  }

  async delete_event (id) {
    try {
      return await delete_event(id)
    } catch (error) {
      throw {
        status: 400,
        code: 'BAD_REQUEST',
        msg: 'Bad Request response.'
      }
    }
  }
}

module.exports = new Events_service()
