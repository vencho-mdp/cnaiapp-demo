import { mount, createLocalVue } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import * as DateComponents from 'v-calendar'
import SlotsAccordionForm from '@/components/SlotsAccordionForm.vue'

const addDays = function (date, days) {
  date.setDate(date.getDate() + days)
  return date
}

const localVue = createLocalVue()
localVue.use(Vuelidate)

// eslint-disable-next-line vue/multi-word-component-names
localVue.component('Calendar', DateComponents.default)
localVue.component('DatePicker', DateComponents.DatePicker)

describe('SlotsAccordionForm', () => {
  const factory = (values = {}) =>
    mount(SlotsAccordionForm, {
      propsData: values,
      localVue
    })
  it('accepts form when all values are valid', async () => {
    const props = {
      selectedTeachers: ['abc', 'cba', 'ard'],
      selectedSubjectId: 'a',
      time: {
        from: new Date().toISOString(),
        to: addDays(new Date(), 3).toISOString()
      }
    }
    const wrapper = factory(props)
    await wrapper.find('button:last-of-type').trigger('click')
    expect(wrapper.emitted()['add-assignment']).toBeTruthy()
  })
  it('does not allow adding an item when the form is invalid', () => {
    const wrapper = factory()
    expect(wrapper.find('button:last-of-type').attributes().disabled).toBeTruthy()
  })
  it('matches snapshot', () => {
    const wrapper = factory()
    expect(wrapper.html()).toMatchSnapshot()
  })
})
