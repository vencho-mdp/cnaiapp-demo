import path from 'path'
import glob from 'glob'
import Vue from 'vue'
import { config } from '@vue/test-utils'

glob.sync(path.join(__dirname, './components/**/*.vue')).forEach((file) => {
  const name = file.match(/(\w*)\.vue$/)[1]
  Vue.component(name, require(file).default)
})

config.stubs.nuxt = { template: '<div> </div>' }
config.stubs['nuxt-link'] = { template: '<a> <slot /> </a>' }
config.stubs['client-only'] = { template: '<span> <slot /> </span>' }

global.Vue = Vue
