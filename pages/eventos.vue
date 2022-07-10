<template>
  <main class="flex flex-col justify-around">
    <v-title class="mt-4 text-center mb-6"> Eventos </v-title>
    <div class="flex justify-center items-center">
      <v-dropdown
        v-model="event_filter"
        :options="[
          'Pasados',
          'Próxima semana',
          'Próximo mes',
          'Próximos 6 meses',
          'Todos',
        ]"
      />
    </div>
    <transition-group
      v-if="filtered_events.length !== 0"
      name="list"
      class="flex flex-grow flex-wrap mt-12 justify-around items-start"
    >
      <item-card-with-content
        v-for="{
          id,
          title,
          description,
          start_date,
          end_date,
          image,
        } in filtered_events"
        :key="id"
        class="m-4 lg:mx-12"
        style="width: clamp(300px, 28%, 300px)"
        :data="{
          title,
          content: description,
          dates: [start_date, end_date],
          image,
        }"
        :has-source="!!image"
        data-test="card"
        @openSidebar="openSidebar(id)"
      />
    </transition-group>
    <div
      v-else
      class="flex flex-col flex-grow mb-32 w-full justify-center items-center"
    >
      <warning-sign> No hay eventos en estas fechas </warning-sign>
    </div>

    <transition name="fade">
      <v-sidebar
        v-if="Object.keys(event).length > 0"
        :title="event.title"
        :remove_overflow_delay="150"
        class="sidebar"
        @closeSidebar="closeSidebar"
      >
        <template #content>
          <div class="flex w-full items-center justify-center">
            <date-display :dates="event.dates" />
          </div>
          <img
            v-if="event.image"
            ref="selected_img"
            :src="event.image"
            class="rounded-md max-w-full shadow my-4 mx-4 hover-effect"
            loading="lazy"
            @click="$store.commit('change_see_img_bigger_state', event.image)"
          />
          <span class="text-sm p-4 !text-white" v-html="event.content" />
        </template>
      </v-sidebar>
    </transition>
  </main>
</template>

<script>
const addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};
export default {
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      const events = await $axios.$get("/api/events?show_past=true");
      return { events };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      event: {},
      event_filter: "Próxima semana",
    };
  },
  computed: {
    filtered_events() {
      const days = {
        "Próxima semana": 7,
        "Próximo mes": 30,
        "Próximos 6 meses": 180,
      };
      const today = new Date().getTime();
      const limit_date = addDays(today, days[this.event_filter]).getTime();
      return this.events.filter(({ start_date, end_date }) => {
        if (this.event_filter === "Todos") {
          return true;
        }
        const start_date_time = new Date(start_date).getTime();
        const end_date_time = new Date(end_date).getTime();
        if (this.event_filter === "Pasados") {
          return end_date_time < today;
        }
        return start_date_time >= today && end_date_time <= limit_date;
      });
    },
  },
  methods: {
    openSidebar(id) {
      const { description, start_date, end_date, title, image } =
        this.events.find((el) => el.id === id);
      this.event = {
        title,
        content: description,
        image,
        dates: [new Date(start_date), new Date(end_date)],
      };
    },
    closeSidebar() {
      this.event = {};
    },
  },
};
</script>

<style scoped>
.sidebar :deep(p),
.sidebar :deep(span),
.sidebar :deep(ul),
.sidebar :deep(ol),
.sidebar :deep(em),
.sidebar :deep(u) {
  @apply text-sm text-white leading-relaxed;
}
.sidebar :deep(ul),
.sidebar :deep(ol) {
  @apply list-disc ml-4;
}

.sidebar :deep(*) {
  max-width: 320px;
  overflow-wrap: break-word;
}
</style>
