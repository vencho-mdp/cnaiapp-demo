<template>
  <the-modal class="px-8">
    <v-title class="text-center mb-2"> Iniciar sesión </v-title>
    <form
      ref="form"
      class="flex flex-col my-4 items-center justify-around"
      @submit.prevent="userLogin()"
    >
      <form-input
        v-for="(input, index) in inputs"
        :key="input.label"
        :ref="input.label"
        :type="input.type"
        :label="input.label"
        :value.sync="input.value"
        :error="
          $v.inputs.$each[index].$dirty
            ? $v.inputs.$each[index].$anyError
            : null
        "
        class="mb-10"
        novalidate
        @focus="incorrectCredentials = false"
        @blur="$v.inputs.$each[index].$touch()"
        @keyup="
          $v.inputs.$each[index].$dirty ? $v.inputs.$each[index].$touch() : null
        "
      />
      <transition name="fade">
        <div
          v-if="incorrectCredentials"
          class="bg-red-light rounded-md mb-4 w-full py-2"
        >
          <v-paragraph class="font-bold text-center !text-red-dark">
            Contraseña y/o email inválido
          </v-paragraph>
        </div>
      </transition>
      <primary-button
        class="w-40"
        :disabled="isInvalid ? true : false"
        type="submit"
      >
        {{ sending ? "Ingresando..." : "Ingresar" }}
      </primary-button>
    </form>
  </the-modal>
</template>

<script>
import { required } from "vuelidate/lib/validators";
const emailRegex =
  /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21\x23-\x5B\x5D-\x7F]|[\x01-\x09\x0B\x0C\x0E-\x7F])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0B\x0C\x0E-\x1F\x21-\x5A\x53-\x7F]|\\[\x01-\x09\x0B\x0C\x0E-\x7F])+)\])$/i;

export default {
  data() {
    return {
      inputs: [
        {
          label: "Email",
          value: "",
          type: "email",
        },
        {
          label: "Contraseña",
          value: "",
          type: "password",
        },
      ],
      sending: false,
      incorrectCredentials: false,
    };
  },
  computed: {
    isInvalid() {
      return this.$v.$invalid;
    },
  },
  methods: {
    async userLogin() {
      this.sending = true;
      try {
        await this.$store.dispatch("authentication/login", {
          email_address: this.inputs[0].value,
          password: this.inputs[1].value,
        });
        this.$router.push("/dashboard");
      } catch (err) {
        this.inputs = this.inputs.map(({ value, ...rest }) => {
          this.$refs[rest.label][0].$el.value = "";
          return { ...rest, value: "" };
        });
        this.$refs.form.reset();
        this.$refs["Email"][0].$el.children[1].children[0].focus();
        this.$v.$reset();
        this.incorrectCredentials = true;
      }
      this.sending = false;
    },
  },
  validations: {
    inputs: {
      $each: {
        value: {
          required,
          checkEmail: (value, object) =>
            object.type === "email" ? emailRegex.test(value) : true,
        },
      },
    },
  },
};
</script>
