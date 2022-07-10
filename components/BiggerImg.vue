<template>
  <div
    class="absolute min-h-full min-w-full flex flex-col items-center justify-center z-50"
    style="background: rgba(120, 120, 120, 0.75)"
  >
    <div
      class="absolute h-2/3 w-2/3 flex flex-col items-center justify-center mb-20"
      @click.self="$store.commit('change_see_img_bigger_state', false)"
    >
      <div
        class="ml-auto p-1"
      >
        <img
          class="cursor-pointer h-8 w-6 m-8"
          src="~/assets/images/close-icon.svg"
          alt="Cerrar"
          @click="$store.commit('change_see_img_bigger_state', false)"
        >
      </div>
      <img
        :src="$store.state.see_img_bigger"
        loading="lazy"
        class="object-cover w-2/3 rounded-md shadow-lg"
      >
    </div>
  </div>
</template>
