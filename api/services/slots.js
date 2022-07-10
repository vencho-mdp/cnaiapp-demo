const { get_slots, add_slots, update_slots } = require("../dao/slots");

class slot_service {
  async get_slots(class_name) {
    try {
      // [null null] es para que no tire error por iterar
      const params = class_name ? class_name.split(" ") : [null, null];
      return await get_slots(...params);
    } catch (error) {
      console.log(error);
      throw {
        status: 500,
        code: "INTERNAL_ERROR",
        msg: "Server Error",
      };
    }
  }

  async update_slots(data) {
    try {
      return await update_slots(data);
    } catch (error) {
      console.log(error);
      throw {
        status: 404,
        code: "NOT_FOUND",
        msg: "Not found",
      };
    }
  }
}

module.exports = new slot_service();
