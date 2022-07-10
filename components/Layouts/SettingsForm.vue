<template>
  <form ref="form" class="flex flex-col flex-grow mx-8 mb-12 justify-around pt-12" @submit.prevent="submit_settings_change">
    <h4 v-if="is_email" class="text-white -my-8">
      Email actual:
      <span class="font-bold text-white">
        {{ $store.state.authentication.user_data.email }}
      </span>
    </h4>
    <div class="flex flex-col justify-between">
      <v-label class="mb-2 !text-white">
        Contraseña actual
      </v-label>
      <v-text-input type="password" :value="current_password" class="w-full" @input.native="validate_prop('current_password', $event)" @blur.native="validate_prop('current_password', $event)" />
      <transition name="fade">
        <feedback-card v-if="formatted_errors.current_password" class="!h-auto mt-4" :is-success="false">
          <span class="p-2 text-red-600">
            {{ formatted_errors.current_password }}
          </span>
        </feedback-card>
      </transition>
    </div>
    <div class="flex flex-col justify-between">
      <v-label class="mb-2 !text-white">
        Nuev{{ !is_email ? 'a contraseña' : 'o email' }}
      </v-label>
      <v-text-input :value="new_value" class="w-full" @input.native="validate_prop('new_value', $event)" @blur.native="validate_prop('new_value', $event)" />
      <transition name="fade">
        <feedback-card v-if="formatted_errors.new_value" class="!h-auto mt-4" :is-success="false">
          <span class="p-2 text-red-600">
            {{ formatted_errors.new_value }}
          </span>
        </feedback-card>
      </transition>
    </div>
    <div class="flex flex-col justify-between">
      <v-label class="mb-2 !text-white">
        Confirmar nuev{{ !is_email ? 'a contraseña' : 'o email' }}
      </v-label>
      <v-text-input :value="new_value_confirmation" class="w-full" @input.native="validate_prop('new_value_confirmation', $event)" @blur.native="validate_prop('new_value_confirmation', $event)" />
      <transition name="fade">
        <feedback-card v-if="formatted_errors.new_value_confirmation" class="!h-auto mt-4" :is-success="false">
          <span class="p-2 text-red-600">
            {{ formatted_errors.new_value_confirmation }}
          </span>
        </feedback-card>
      </transition>
    </div>
    <transition name="fade">
      <feedback-card v-if="is_password_wrong" class="!h-auto mt-4" :is-success="false">
        <span class="p-2 text-red-600">
          Contraseña incorrecta
        </span>
      </feedback-card>
    </transition>
    <form-buttons class="mt-8" :is-add-button-invalid="!isValid || !current_password || !new_value || !new_value_confirmation || new_value_confirmation !== new_value || current_password.length < 5" @handleCancelButtonClick="$emit('closeSidebar', 'cancel')" />
  </form>
</template>

<script>
export default {
  props: {
    formData: {
      type: Object,
      default: () => ({
        attr: 'email'
      })
    }
  },
  data () {
    return {
      current_password: '',
      new_value: '',
      new_value_confirmation: '',
      is_password_wrong: false,
      errors: {
        current_password: [],
        new_value: [],
        new_value_confirmation: []
      },
      timeout: null,
      is_email: this.formData.attr === 'email'
    }
  },
  computed: {
    formatted_errors () {
      const formatter = new Intl.ListFormat('es', { style: 'long', type: 'conjunction' })
      return Object.keys(this.errors).reduce((acc, el) => {
        if (this.errors[el].length) {
          acc[el] = '* El campo ' + formatter.format(this.errors[el])
        }
        return acc
      }, {})
    },
    isValid () {
      return Object.values(this.errors).flat().length === 0
    },
    validations () {
      if (this.is_email) {
        return {
          current_password: {
            required: true,
            min: 5
          },
          new_value: {
            required: true,
            email: true
          },
          new_value_confirmation: {
            required: true,
            email: true,
            sameAs: 'new_value'
          }
        }
      }
      return {
        current_password: {
          required: true,
          min: 5
        },
        new_value: {
          required: true,
          min: 5
        },
        new_value_confirmation: {
          required: true,
          sameAs: 'new_value',
          min: 5
        }
      }
    }
  },
  methods: {
    validate_prop (prop, event) {
      this[prop] = event.target.value

      const errors_msgs = {
        required: 'es requerido',
        min: 'debe tener al menos 5 caracteres',
        email: 'debe ser un email válido',
        sameAs: `debe coincidir con el nuev${this.is_email ? 'o email' : 'a contraseña'}`
      }

      const validation = this.validations[prop]
      const value = this[prop]

      const errors = []

      Object.keys(validation).map((el) => {
        if (el === 'required' && !value) {
          errors.push(errors_msgs.required)
        }
        if (el === 'min' && value.length < validation.min) {
          errors.push(errors_msgs.min)
        }
        if (el === 'email' && !value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
          errors.push(errors_msgs.email)
        }
        if (el === 'sameAs' && value !== this[validation.sameAs]) {
          errors.push(errors_msgs.sameAs)
        }

        return errors
      })
      if (event.type === 'blur' && event.target.value !== '') {
        if (this.timeout) { clearTimeout(this.timeout) }
        this.errors[prop] = errors
        return
      }
      if (event.type === 'input' && errors.length === 0) {
        if (this.timeout) { clearTimeout(this.timeout) }
        this.errors[prop] = []
      }
    },
    async submit_settings_change () {
      try {
        if (this.is_email) {
          await this.$axios.$put('/api/user/email', {
            password: this.current_password,
            new_email: this.new_value,
            user_id: this.$store.state.authentication.user_data.id
          })
          await this.$store.dispatch('authentication/refresh')
        } else {
          await this.$axios.$put('/api/user/password', {
            current_password: this.current_password,
            new_password: this.new_value,
            user_id: this.$store.state.authentication.user_data.id
          })
        }
        this.$emit('closeSidebar')
      } catch (error) {
        // reset all values
        this.current_password = ''
        this.new_value = ''
        this.new_value_confirmation = ''
        this.$refs.form.reset()
        this.is_password_wrong = true
        setTimeout(() => {
          this.is_password_wrong = false
        }, 4500)
      }
    }
  }
}
</script>
