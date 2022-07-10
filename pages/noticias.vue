<template>
  <!-- eslint-disable vue/no-v-html -->
  <main class="flex flex-col justify-around">
    <v-title class="text-center"> Noticias </v-title>
    <div
      v-if="news.length > 0"
      class="flex flex-grow flex-wrap mt-12 justify-center"
    >
      <item-card-with-content
        v-for="{ id, title, content, created_at, image } in news"
        :key="id"
        data-test="card"
        class="m-4 lg:mx-24"
        style="width: clamp(300px, 20%, 400px); height: max-content"
        :data="{
          title,
          content,
          dates: [created_at],
          image,
        }"
        :has-source="!!image"
        @openSidebar="openSidebar"
      />
    </div>
    <transition name="fade">
      <lazy-v-sidebar
        v-if="Object.keys(selected_news).length > 0"
        :title="selected_news.title"
        class="sidebar"
        @closeSidebar="closeSidebar"
      >
        <template #content>
          <div class="flex min-w-full items-center justify-center">
            <date-display :dates="[selected_news.created_at]" />
          </div>
          <img
            v-if="selected_news.image"
            ref="selected_img"
            :src="selected_news.image"
            class="rounded-md shadow my-4 hover-effect max-w-full mx-4"
            loading="lazy"
            @click="
              $store.commit('change_see_img_bigger_state', selected_news.image)
            "
          />
          <span
            data-test="news_content"
            class="text-sm p-4 max-w-full !text-white"
            v-html="replaceNbsps(selected_news.content)"
          />
        </template>
      </lazy-v-sidebar>
    </transition>
  </main>
</template>
<script>
import replaceNbsps from "../utils/replaceNbsps";

export default {
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      const news = await $axios.$get("/api/news");
      return {
        news,
      };
    } catch (error) {
      $reportNetworkError(error);
    }
  },
  data() {
    return {
      selected_news: {},
    };
  },
  methods: {
    openSidebar(selected_news) {
      const { dates, ...rest } = selected_news;
      this.selected_news = {
        created_at: dates[0],
        ...rest,
      };
    },
    closeSidebar() {
      this.selected_news = {};
    },
    replaceNbsps(str) {
      return replaceNbsps(str);
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
  @apply text-sm leading-relaxed text-white;
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
