import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuelidate from 'vuelidate'
import * as DateComponents from 'v-calendar'
import EventsForm from '@/components/Layouts/EventsForm.vue'

const localVue = createLocalVue()
localVue.use(vuelidate)
// eslint-disable-next-line vue/multi-word-component-names
localVue.component('Calendar', DateComponents.default)
localVue.component('DatePicker', DateComponents.DatePicker)
describe('EventsForm', () => {
  const wrapper = shallowMount(EventsForm, { localVue })
  it('renders correctly', () => {
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('does not send form if it is invalid', () => {
    expect(wrapper.vm.$v.$invalid).toBe(true)
  })
  it('sends form if it is valid', async () => {
    wrapper.setData({
      form: {
        title: 'test',
        description: 'test',
        dates: {
          start: '2020-01-01',
          end: '2020-01-01'
        },
        image: 'test'
      }
    })
    expect(wrapper.vm.$v.$invalid).toBe(false)
  })
})
