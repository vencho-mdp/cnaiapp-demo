import { mount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import vuelidate from 'vuelidate'
import ReportBugForm from '@/components/ReportBugForm.vue'

const localVue = createLocalVue()
localVue.use(Vuex)
localVue.use(vuelidate)

describe('ReportBugForm', () => {
  let actions
  let store

  beforeEach(() => {
    actions = {
      toggle_bug_reporting_sidebar: jest.fn()
    }

    store = new Vuex.Store({
      actions
    })
  })

  it('sends form if all values are valid', async () => {
    const wrapper = mount(ReportBugForm, {
      store,
      localVue
    })

    wrapper.setData({
      form: {
        description: 'description'
      }
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes().disabled).toBe(undefined)
    setTimeout(() => {
      expect(wrapper.find('button').attributes().disabled).toBe(true)
      expect(wrapper.find('button').text()).toBe('Enviando...')
      expect(actions.toggle_bug_reporting_sidebar).toHaveBeenCalled()
    }, 2000)
  })

  it("can't t send form if not all values are valid", async () => {
    const wrapper = mount(ReportBugForm, {
      store,
      localVue
    })
    await wrapper.find('button').trigger('click')
    expect(wrapper.find('button').attributes().disabled).toBe('disabled')
    setTimeout(() => {
      expect(wrapper.find('button').attributes().disabled).toBe('disabled')
      expect(wrapper.find('button').text()).toBe('Enviar')
      expect(actions.toggle_bug_reporting_sidebar).not.toHaveBeenCalled()
    }, 2000)
  })
})
