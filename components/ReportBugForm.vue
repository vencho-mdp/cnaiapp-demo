<template>
  <form
    class="flex flex-col flex-grow mx-8 mb-12 justify-evenly"
    @submit.prevent="send_form"
  >
    <div class="flex flex-col mt-24 justify-between">
      <v-label class="mb-2 !text-white"> Descripción </v-label>
      <v-textarea
        class="h-64 w-full"
        placeholder='Ej: Al entrar a la página de "Eventos" y apretar en "Leer Más" en un evento específico, no se muestra más información acerca de él'
        :value="form.description"
        @input.native="form.description = $event.target.value"
      />
    </div>
    <primary-button
      data-test="bug_submit_btn"
      :class="{
        '!bg-primary-blue hover-effect': is_form_valid && status !== 'sending',
      }"
      :disabled="$v.$invalid || status === 'sending'"
      class="mt-12 w-48 self-center !duration-500"
    >
      {{ status !== "sending" ? "Enviar" : "Enviando..." }}
    </primary-button>
  </form>
</template>

<script>
import { required } from "vuelidate/lib/validators";

export default {
  data() {
    return {
      form: {
        description: undefined,
      },
      status: "not sent",
    };
  },
  validations: {
    form: {
      $each: {
        required,
      },
    },
  },
  computed: {
    is_form_valid() {
      return this.form.description;
    },
  },
  methods: {
    async send_form() {
      const data = {
        description: this.form.description,
        route: this.$nuxt.$route.path,
      };
      this.status = "sending";
      try {
        await Promise.all([
          this.$axios.$post("/api/bugs", data),
          this.$mail.send({
            subject: "REPORTE DE BUG: CNAI APP",
            html: `
              <span> <p style="font-weight: bold;"> Description &nbsp; &nbsp; </p> ${data.description} </span>
              <br/>
              <span> <p style="font-weight: bold;"> Route &nbsp; &nbsp; </p> ${data.route} </span>
            `,
          }),
        ]);

        this.status = "success";
      } catch (error) {
        this.$reportNetworkError(error);
        this.status = "error";
      }
      this.$store.commit("toggle_bug_reporting_sidebar");
      this.$store.commit("change_toast_state", this.status);
      this.$store.commit(
        "change_toast_content",
        this.status === "error"
          ? "Ocurrió un error al enviar el reporte"
          : "Reporte enviado con éxito"
      );
      setTimeout(() => {
        this.$store.commit("change_toast_state", false);
      }, 5000);
    },
  },
};
</script>
