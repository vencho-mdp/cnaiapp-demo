<template>
  <delete-item-confirmation
    v-if="deleteUser"
    @handleCancelButtonClick="$emit('closeSidebar')"
    @click="$emit('handleClickForDeletion')"
  />
  <form
    v-else
    class="flex flex-col flex-grow my-2 mx-4 gap-4 justify-evenly"
    @submit.prevent="send_data()"
  >
    <div class="flex">
      <div class="flex flex-col flex-grow mr-2 justify-between">
        <v-label class="mb-2 !text-white"> Nombre </v-label>
        <v-text-input
          class="w-full"
          data-test="name"
          :value="form.first_name"
          @input.native="form.first_name = $event.target.value"
        />
      </div>
      <div class="flex flex-col flex-grow ml-2 justify-between">
        <v-label class="mb-2 !text-white"> Apellido </v-label>
        <v-text-input
          class="w-full"
          data-test="name"
          :value="form.last_name"
          @input.native="form.last_name = $event.target.value"
        />
      </div>
    </div>
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Email </v-label>
      <v-text-input
        class="w-full"
        data-test="name"
        type="email"
        :value="form.email"
        @input.native="form.email = $event.target.value"
      />
    </div>
    <div class="flex flex-col mb-1 justify-between">
      <v-label class="mb-2 !text-white"> Roles </v-label>
      <multiselect
        v-model="form.groups"
        class="border-2 rounded-xl !w-full border-gray-light bg-white !box-border py-1"
        :options="groups"
        :multiple="true"
        :hide-selected="true"
        select-label=""
        :show-no-results="false"
        :searchable="false"
        placeholder=""
        label="label"
        track-by="value"
        maxElements=""
        noOptions=""
      >
        <template #tag="{ option, remove }">
          <span
            class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
          >
            {{ option.label }}
            <icon-button
              class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
              type="button"
              @click.native="remove(option)"
            >
              <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
            </icon-button>
          </span>
        </template>
      </multiselect>
    </div>
    <transition name="fade">
      <div
        v-if="form.groups.some((el) => el.value === 'teacher')"
        class="flex flex-col mb-1 justify-between"
      >
        <v-label class="mb-2 !text-white"> Materias </v-label>
        <multiselect
          v-model="form.subjects"
          class="border-2 rounded-xl !w-full border-gray-light bg-white !box-border py-1"
          :options="subjects"
          :multiple="true"
          :hide-selected="true"
          maxElements=" "
          select-label=""
          :show-no-results="false"
          placeholder=""
          label="name"
          noOptions=" "
          track-by="id"
        >
          <template #tag="{ option, remove }">
            <span
              class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
            >
              {{ option.name }}
              <icon-button
                class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
                type="button"
                @click.native="remove(option)"
              >
                <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
              </icon-button>
            </span>
          </template>
        </multiselect>
      </div>
    </transition>
    <transition name="fade">
      <div
        v-if="
          form.groups.some(
            (el) =>
              el.value === 'preceptor' ||
              el.value === 'teacher' ||
              el.value === 'student'
          )
        "
        class="flex flex-col mb-1 justify-between"
      >
        <v-label class="mb-2 !text-white">
          Clase{{ form.groups.some((el) => el.value === "student") ? "" : "s" }}
        </v-label>
        <multiselect
          v-model="form.classes"
          class="border-2 rounded-xl !w-full border-gray-light bg-white-full !box-border py-1"
          :options="classes"
          :multiple="true"
          :hide-selected="true"
          select-label=""
          :show-no-results="false"
          :max="form.groups.some((el) => el.value === 'student') ? 1 : null"
          placeholder=""
          label="class"
          maxElements=" "
          track-by="id"
        >
          <template #tag="{ option, remove }">
            <span
              class="bg-primary-lightblue font-bold flex justify-around items-center p-2 w-min rounded-sm text-black"
            >
              {{ option.class }}
              <icon-button
                class="!p-0.5 !rounded-sm h-4 w-4 bg-red ml-2 !block"
                type="button"
                @click.native="remove(option)"
              >
                <img src="~/assets/images/close-icon.svg" alt="Eliminar" />
              </icon-button>
            </span>
          </template>
        </multiselect>
      </div>
    </transition>
    <form-buttons
      :is-add-button-invalid="isFormValid"
      class="my-10"
      type="submit"
      @handleCancelButtonClick="$emit('closeSidebar', 'cancel')"
    />
  </form>
</template>
<script>
import multiselect from "vue-multiselect";
import "vue-multiselect/dist/vue-multiselect.min.css";

export default {
  components: {
    multiselect,
  },
  props: {
    deleteUser: {
      type: Boolean,
      default: false,
    },
    isEditingOrAddingUser: {
      type: [String, Object],
      default: false,
    },
    subjects: {
      type: Array,
      default: () => [],
    },
    classes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      form: {
        first_name: this.isEditingOrAddingUser.first_name ?? "",
        last_name: this.isEditingOrAddingUser.last_name ?? "",
        groups: this.isEditingOrAddingUser.groups ?? [],
        subjects: this.isEditingOrAddingUser.subjects ?? [],
        classes: this.isEditingOrAddingUser.classes ?? [],
        email: this.isEditingOrAddingUser.email ?? "",
      },
      groups: [
        {
          label: "Directivo",
          value: "management_team",
        },
        {
          label: "Profesor",
          value: "teacher",
        },
        {
          label: "Alumno",
          value: "student",
        },
        {
          label: "Preceptor",
          value: "preceptor",
        },
        {
          label: "Community manager",
          value: "community_manager",
        },
      ],
    };
  },
  methods: {
    async send_data() {},
  },
  computed: {
    isFormValid() {
      return true;
    },
  },
};
</script>
<style scoped>
@import "~/assets/css/third_party_components.css";
</style>
