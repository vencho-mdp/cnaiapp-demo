<template>
  <main class="p-16">
    <v-subtitle class="mb-8"> Usuarios </v-subtitle>
    {{ data }}
  </main>
</template>
<script setup></script>
<script>
// then should use useFetch and useAsyncData to get the data
// in nuxt 3
export default {
  async asyncData({ $axios, $reportNetworkError }) {
    try {
      const data = await $axios.$get("/api/users");
      return { data };
    } catch (error) {
      $reportNetworkError(error);
      return { error };
    }
  },
};
</script>
