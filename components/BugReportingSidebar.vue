<template>
  <v-sidebar
    v-if="$store.state.show_bug_reporting_sidebar"
    title="Comunicar un error"
    class="z-50"
    @closeSidebar="$store.commit('toggle_bug_reporting_sidebar')"
  >
    <template #content>
      <report-bug-form />
    </template>
  </v-sidebar>
</template>
