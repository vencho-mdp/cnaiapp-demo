<template>
  <nav
    class="flex pb-4 flex-wrap max-w-6xl md:w-full items-center justify-between sm:px-20 md:mx-auto"
  >
    <div class="flex-no-shrink p-2 w-20">
      <NuxtLink to="/">
        <img src="../static/icon.png" alt="Logo" />
      </NuxtLink>
    </div>
    <div class="block sm:hidden">
      <button
        class="rounded flex py-2 px-3 items-center hover:border-white"
        @click="toggle"
      >
        <svg
          class="h-5 fill-current text-black w-5"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M0 3h20v2H0V3zm0 6h20v2H0V9zm0 6h20v2H0v-2z" />
        </svg>
      </button>
    </div>
    <transition name="animation">
      <div
        v-show="open ? true : false"
        class="flex-grow w-full justify-end sm:w-auto sm:items-center sm:!flex"
      >
        <div
          class="flex flex-col justify-center items-center sm:flex-row sm:w-10/12 sm:justify-between"
        >
          <NuxtLink
            v-for="item in items"
            :key="item.url"
            class="mt-4 text-sm text-gray py-1 duration-500 no-underline block sm:m-0 sm:px-5 sm:inline-block hover:text-black"
            :to="item.url"
            exact
            @click.native="toggle"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </transition>
  </nav>
</template>

<script>
export default {
  data() {
    return {
      open: false,
      items: [
        {
          name: "Horarios",
          url: "/",
        },
        {
          name: "Noticias",
          url: "/noticias",
        },
        {
          name: "Eventos",
          url: "/eventos",
        },
        {
          name: "Panel",
          url: "/panel",
        },
      ],
    };
  },
  methods: {
    toggle() {
      this.open = !this.open;
    },
  },
};
</script>
<style scoped>
@media screen and (min-width: 768px) {
  a.nuxt-link-active {
    @apply !font-bold;
  }
}
.animation-enter-active {
  transition: all 1s ease;
}
.animation-leave-active {
  transition: all 2s cubic-bezier(1, 0.5, 0.8, 1);
}
.animation-enter,
.animation-leave-to {
  transition: all 0.4s ease;
  opacity: 0;
}
</style>
