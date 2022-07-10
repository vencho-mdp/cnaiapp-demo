<template>
  <v-card
    :data="formattedClasses"
    :change-records="
      $store.state.authentication.user_data.groups.includes('management_team')
        ? true
        : 'edit'
    "
    v-bind="$attrs"
    title="Cursos"
    class="mb-8"
    :show-delete-btn="false"
    :show-add-button="false"
    @editItem="edit"
  >
    <template #filters>
      <div
        class="border border-primary-lightblue rounded-lg flex shadow mt-2 mb-4 w-full p-2 items-center"
      >
        <div
          v-for="({ label, options }, index) in filters"
          :key="label"
          class="rounded flex-col flex mr-8 p-1 w-24"
        >
          <label class="font-bold text-xs text-white mb-2">{{ label }}</label>
          <v-dropdown
            :value="filters[index].value"
            :options="options"
            class="!p-0.5"
            @change.native="filters[index].value = arguments[0].target.value"
          />
        </div>
      </div>
    </template>
  </v-card>
</template>

<script>
const formatNumberInClassName = (className) => {
  // change ro, do and to, to º
  const regex = /(ro|do|to)/gi;
  const modifiedClass = className.replace(regex, "º");
  // and ra, da, ra, ta, to ª
  const another_regex = /(ra|da|ta|to)/gi;
  return modifiedClass.replace(another_regex, "ª");
};

export default {
  props: {
    classes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      filters: [
        {
          label: "Año",
          options: [
            ...new Set(this.classes.map((el) => el.class.split(" ")[0])),
          ],
          value: "",
        },
      ],
    };
  },
  computed: {
    formattedClasses() {
      const classes = this.classes.filter((el) => {
        const [year] = el.class.split(" ");
        return this.filters[0].value === "" || year === this.filters[0].value;
      });
      return classes.map((_class) => ({
        label: formatNumberInClassName(_class.class),
        class_id: _class.id,
        ..._class,
      }));
    },
  },
  methods: {
    async edit({ label, class_id }) {
      const raw_label = this.classes.find((el) => el.id === class_id).class;
      const data = await this.$axios.$get("/api/slots", {
        params: {
          className: raw_label,
        },
      });
      this.$emit(
        "editItem",
        { schedule: data, label, raw_label, class_id },
        "Cursos",
        "LayoutsSlotsForm"
      );
    },
  },
};
</script>
