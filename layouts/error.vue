<template>
  <div class="flex min-h-full min-w-full items-center justify-center">
    <div
      class="rounded-md flex flex-col h-64 shadow mb-32 py-4 px-8 justify-between items-center"
    >
      <v-title class="m-2">
        {{
          error.statusCode === 404
            ? "Esta pagina no existe"
            : "Ocurrió un error"
        }}
      </v-title>
      <primary-button class="mb-12">
        <NuxtLink to="/" class="p-2"> Volvé al inicio </NuxtLink>
      </primary-button>
    </div>
  </div>
</template>

<script>
import head from "../mixins/head.js";

export default {
  mixins: [head],
  props: ["error"],
  mounted() {
    if (process.env.NODE_ENV === "production") {
      this.$mail.send({
        subject: "REPORTE DE ERROR: CNAI APP",
        html: `
             ERROR: ${JSON.stringify(this.error)}
            `,
      });
    }
  },
};
</script>
