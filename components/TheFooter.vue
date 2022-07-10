<template>
  <footer
    class="bg-primary-darkblue flex mt-2 w-full p-2 items-center justify-between"
  >
    <button
      data-test="bug_report_btn"
      style="max-width: 200px"
      class="bg-primary-blue rounded font-bold shadow-sm text-xs text-center py-1 px-2 w-1/3 hover-effect !text-white"
      @click="$store.commit('toggle_bug_reporting_sidebar')"
    >
      Comunicar un error
    </button>
    <span class="flex font-p font-bold text-xs pl-4 !text-white">
      Hecho por: &nbsp;
      <a
        href="https://www.linkedin.com/in/benicio-cardozo-115421219/"
        class="underline"
        target="_blank"
      >
        Benicio Cardozo</a
      >
    </span>
  </footer>
</template>
