<template>
  <div class="flex flex-col gap-4 mx-auto w-60">
    <div class="flex flex-col justify-between">
      <v-label class="mb-2"> Profesor </v-label>
      <multiselect
        ref="multiSelect"
        v-model="computedSelectedTeachers"
        class="border-2 rounded-xl !w-full border-primary-lightblue !box-border py-1"
        :options="filteredTeachers"
        :multiple="true"
        :hide-selected="true"
        select-label=""
        :show-no-results="false"
        placeholder=""
        label="label"
        track-by="value"
      >
        <template #tag="{ option, remove }">
          <transition v-if="option.label" name="fade" mode="out-in">
            <span
              class="bg-primary-lightblue font-bold flex justify-around items-center pl-2 w-min rounded-sm text-black"
            >
              {{ option.label.split(",")[0] }}
              <icon-button
                class="!p-1 !rounded-sm h-6 w-6 bg-primary-blue ml-2 !block"
                type="button"
                @click.native="remove(option)"
              >
                <img src="../assets/images/close-icon.svg" alt="Eliminar" />
              </icon-button>
            </span>
          </transition>
        </template>
      </multiselect>
    </div>
    <div class="flex flex-col">
      <v-label class="mb-2"> Materia </v-label>
      <v-dropdown
        v-model="computedSelectedSubjectId"
        :options="filteredSubjects"
        class="h-10"
      />
    </div>
    <div class="flex justify-around">
      <div class="flex flex-col justify-between mr-4">
        <v-label class="mb-1"> Desde </v-label>
        <v-date-picker
          v-model="computedTime.from"
          data-test="from"
          mode="time"
          class="!w-full time-picker"
          is24hr
          :minute-increment="5"
        />
      </div>
      <div class="flex flex-col justify-between">
        <v-label class="mb-1"> Hasta </v-label>
        <v-date-picker
          v-model="computedTime.to"
          mode="time"
          class="!w-full time-picker"
          is24hr
          data-test="to"
          :valid-hours="{ min: 6, max: 22 }"
          :minute-increment="5"
        />
      </div>
    </div>
    <primary-button
      class="self-start !p-2 !text-xs !rounded-md"
      :disabled="$v.$invalid"
      type="button"
      data-test="slot_add"
      @click.native="$emit('add-assignment')"
    >
      Guardar
    </primary-button>
  </div>
</template>

<script>
import { required } from "vuelidate/lib/validators";
import multiselect from "vue-multiselect";

export default {
  components: {
    multiselect,
  },
  props: {
    selectedTeachers: {
      type: Array,
      default: () => [],
    },
    filteredTeachers: {
      type: Array,
      default: () => [],
    },
    selectedSubjectId: {
      type: String,
      default: "",
    },
    filteredSubjects: {
      type: Array,
      default: () => [],
    },
    time: {
      type: Object,
      default: () => ({ from: undefined, to: undefined }),
    },
  },
  computed: {
    computedSelectedTeachers: {
      get() {
        return this.selectedTeachers;
      },
      set(value) {
        this.$emit("update:selectedTeachers", value);
      },
    },
    computedSelectedSubjectId: {
      get() {
        return this.selectedSubjectId;
      },
      set(value) {
        this.$emit("update:selectedSubjectId", value);
      },
    },
    computedTime: {
      get() {
        return this.time;
      },
      set(value) {
        this.$emit("update:time", value);
      },
    },
  },
  validations() {
    return {
      selectedTeachers: {
        required,
      },
      selectedSubjectId: {
        required,
      },
      time: {
        $each: {
          required,
        },
        to: {
          minValue: (value) =>
            new Date(value).getTime() > new Date(this.time.from).getTime(),
        },
      },
    };
  },
};
</script>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>
<style scoped>
/* Timepicker */
.time-picker :deep(.vc-date),
.time-picker :deep(.vc-time-picker > div:first-child) {
  display: none;
}
.time-picker :deep(.vc-time-picker) {
  @apply p-1.5 w-28 justify-center;
}
.time-picker :deep(.vc-date-time) {
  @apply !m-0;
}
.time-picker :deep(.vc-select > select) {
  @apply border border-primary-lightblue w-12;
}
.time-picker {
  @apply rounded-xl border-none;
}

/* Multiselect */
.multiselect :deep(.multiselect__tags) {
  @apply rounded-xl !min-h-0 !border-transparent !bg-transparent !pt-0 flex flex-col justify-center;
}

.multiselect :deep(.multiselect__tags-wrap) {
  @apply flex justify-start flex-wrap items-center gap-1 h-full;
}

.multiselect :deep(.multiselect__input) {
  @apply !align-middle m-0;
}
.multiselect :deep(.multiselect__option) {
  @apply text-center;
  font-size: 14px;
}
.multiselect :deep(.multiselect__option) :hover {
  @apply !bg-primary-lightblue p-2 rounded shadow;
}
/* https://github.com/shentao/vue-multiselect/issues/594 */
.multiselect :deep(.multiselect__option--highlight) {
  @apply !bg-transparent;
}
.multiselect :deep(.multiselect__content-wrapper) {
  @apply min-w-min px-0.5 !max-h-64;
}
.multiselect :deep(.multiselect__tag) {
  @apply !bg-primary-blue text-white;
}
.multiselect :deep(.multiselect__tag > span) {
  @apply text-white;
}
.multiselect :deep(.multiselect__tag-icon) :hover,
.multiselect :deep(.multiselect__tag-icon) :focus {
  @apply !bg-primary-darkblue;
}
.multiselect :deep(.multiselect--above),
.multiselect :deep(.multiselect__content-wrapper) {
  @apply !bottom-auto;
}
</style>
