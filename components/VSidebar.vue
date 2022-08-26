<template>
  <div
    data-test="sidebar"
    class="bg-black-light flex min-h-screen w-screen top-0 left-0 absolute justify-end"
  >
    <aside
      :class="
        'bg-primary-darkblue flex flex-col h-screen max-h-screen w-80 overflow-auto' +
        ' ' +
        sidebarClasses
      "
    >
      <button class="flex items-center justify-end">
        <img
          class="cursor-pointer h-6 m-4 w-6"
          src="~/assets/images/close-icon.svg"
          alt="Cerrar"
          @click="$emit('closeSidebar')"
        />
      </button>
      <h1
        class="text-base font-bold text-center text-white p-0.5"
        :class="applyTextMargin ? 'mt-8' : null"
      >
        {{ title }}
      </h1>
      <h2
        v-if="subtitle"
        class="text-white text-xs font-bold mt-8 text-center px-1"
      >
        {{ subtitle }}
      </h2>
      <slot name="content" />
    </aside>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: "",
    },
    subtitle: {
      type: String,
      default: "",
    },
    applyTextMargin: {
      type: Boolean,
      default: true,
    },

    remove_overflow_delay: {
      type: Number,
      default: 750,
    },
    sidebarClasses: {
      type: String,
      default: "",
    },
  },
  mounted() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  beforeCreate() {
    if (process.browser) {
      document.getElementsByTagName("body")[0].classList.add("overflow-hidden");
    }
  },
  beforeDestroy() {
    // close  sidebar first
    setTimeout(() => {
      document
        .getElementsByTagName("body")[0]
        .classList.remove("overflow-hidden");
    }, this.remove_overflow_delay);
  },
};
</script>
