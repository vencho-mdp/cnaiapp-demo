<template>
  <main class="flex flex-col justify-around">
    <div class="flex flex-col mb-auto h-1/6 justify-around items-center">
      <v-title>Horarios</v-title>
      <div
        class="flex flex-col h-16 w-full px-12 justify-around items-center sm:w-96"
      >
        <label for="class-selector" class="font-semibold self-start"
          >Curso</label
        >
        <client-only>
          <VDropdown
            id="class-selector"
            ref="dropdown"
            v-model="schoolClass"
            class="w-full"
            :options="classes"
            @change.native="handleClassChange"
          />
        </client-only>
      </div>
    </div>
    <transition name="fade" mode="out-in">
      <div
        v-if="slots.length > 0"
        :key="JSON.stringify(slots)"
        class="flex-grow flex h-4/6 justify-center"
      >
        <slots-of-class-accordion
          first-prop-to-show="subject"
          class="flex-grow m-4 slots md:mx-20 lg:m-8 lg:mx-56 xl:mx-96"
          :slots="slots"
          :current-index.sync="current_index"
        />
      </div>
      <div
        v-if="showErrorMessage"
        class="flex flex-grow min-h-full max-w-full w-full justify-center items-center"
      >
        <div
          class="border border-primary-blue rounded-md mx-4 justify-around items-center"
        >
          <v-subtitle class="flex-col text-black p-2 lg:p-4">
            Ocurrió un error al mostrarte los horarios
          </v-subtitle>
          <v-paragraph class="text-black p-2 lg:p-4">
            Lo estamos tratando de solucionar, probá de vuelta en unos minutos
          </v-paragraph>
        </div>
      </div>
    </transition>
  </main>
</template>

<script>
import VDropdown from "../components/VDropdown.vue";

export default {
  components: {
    VDropdown,
  },
  async asyncData({ $axios, $reportNetworkError }) {
    const get_classes = async () =>
      await $axios.$get("/api/classes?get_all=true");
    const get_absent_teachers = async () =>
      await $axios.$get("/api/absent-teachers");

    try {
      const [classes, absent_teachers] = await Promise.allSettled([
        get_classes(),
        get_absent_teachers(),
      ]);
      return {
        classes: classes.value.map((el) => el.class),
        absent_teachers: absent_teachers.value,
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      showErrorMessage: false,
      slots: [],
      schoolClass: undefined,
      current_index: undefined,
    };
  },
  async fetch() {
    const saved_class = localStorage.getItem("course");
    this.schoolClass = saved_class || this.schoolClass;

    if (saved_class) {
      this.slots = await this.$axios.$get("/api/slots", {
        params: {
          className: this.schoolClass,
        },
      });
    }
  },
  fetchOnServer: false,
  methods: {
    async handleClassChange(e) {
      const value = e.target.value;
      localStorage.setItem("course", value);
      try {
        this.slots = await this.$axios.$get("/api/slots", {
          params: {
            className: value,
          },
        });
      } catch (error) {
        console.error(error);
        this.showErrorMessage = true;
      }
    },
  },
};
</script>
<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s;
}

.slots :deep(.c-accordion__item) {
  @apply !my-8;
}
</style>
