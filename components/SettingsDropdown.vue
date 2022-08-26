<template>
  <div class="flex justify-end items-start mr-8">
    <div class="relative">
      <span
        class="flex justify-end"
        @click="show_settings_options = !show_settings_options"
      >
        <icon-button v-click-outside="closeOptions" class="shadow">
          <img src="~/assets/images/settings.svg" class="mr-2" alt="Ajustes" />
          <svg
            class="duration-300 transform"
            :class="{ 'rotate-180': show_settings_options }"
            width="25"
            height="25"
            viewBox="0 0 25 25"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6.58823 9.79637L12.5882 15.7964L18.5882 9.79637"
              stroke="#0982DA"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </icon-button>
      </span>
      <transition
        enter-active-class="transform transition duration-300 ease-custom"
        enter-class="-translate-y-1/2 scale-y-0 opacity-0"
        enter-to-class="translate-y-0 scale-y-100 opacity-100"
        leave-active-class="transform transition duration-300 ease-custom"
        leave-class="translate-y-0 scale-y-100 opacity-100"
        leave-to-class="-translate-y-1/2 scale-y-0 opacity-0"
      >
        <ul
          v-show="show_settings_options"
          class="min-w-min absolute left-0 right-0 mb-4 bg-white-full divide-y rounded-md shadow-lg overflow-hidden"
        >
          <li
            class="cursor-pointer min-w-max flex text-xs px-3 py-2 transition-colors duration-300 text-black hover:bg-gray-200"
            @mousedown.prevent="option_selected('email')"
          >
            <img src="~/assets/images/mail.svg" alt="- " class="mr-2" />
            Email
          </li>
          <li
            class="cursor-pointer min-w-max px-3 flex text-xs py-2 transition-colors duration-300 text-black hover:bg-gray-200"
            @mousedown.prevent="option_selected('password')"
          >
            <img src="~/assets/images/password.svg" alt="- " class="mr-2" />
            Contraseña
          </li>
        </ul>
      </transition>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      show_settings_options: false,
    };
  },
  methods: {
    option_selected(opt) {
      this.show_settings_options = false;
      const title = opt === "email" ? "email" : "contraseña";
      this.$emit("optionSelected", "Cambiar " + title, "LayoutsSettingsForm", {
        attr: title,
      });
    },
    closeOptions() {
      this.show_settings_options = false;
    },
  },
};
</script>

<style></style>
