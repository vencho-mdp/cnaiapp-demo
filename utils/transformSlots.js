import filterMap from "@/utils/filterMap.js";

export const transformSlots = (slots, extra_curricular_shifts) => {
  const day_index_in_arr = new Date().getDay() - 1;
  const current_day_index =
    day_index_in_arr > 4 || day_index_in_arr < 0 ? 4 : day_index_in_arr;
  return (
    filterMap(
      slots[current_day_index].assignments,
      (el) => {
        return extra_curricular_shifts.includes(el.subject);
      },
      (el) => ({
        subject: el.subject,
        start_time: el.start_time.slice(0, -3),
      })
    ) || []
  );
};
