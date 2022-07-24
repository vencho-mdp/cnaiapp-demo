const { get_slots, update_slots } = require("../dao/slots");

class slot_service {
  async get_slots(class_name, classesIds) {
    try {
      // [null null] es para que no tire error por iterar
      const classNames = class_name ? class_name.split(" ") : [null, null];
      const classesIdsParam = classesIds ? JSON.parse(classesIds) : null;
      return await get_slots(...classNames, classesIdsParam);
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
