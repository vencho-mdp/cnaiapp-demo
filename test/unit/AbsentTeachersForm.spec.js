import { shallowMount, createLocalVue } from '@vue/test-utils'
import vuelidate from 'vuelidate'
import * as DateComponents from 'v-calendar'
import AbsentTeachersForm from '@/components/Layouts/AbsentTeachersForm.vue'

const localVue = createLocalVue()
localVue.use(vuelidate)
// eslint-disable-next-line vue/multi-word-component-names
localVue.component('Calendar', DateComponents.default)
localVue.component('DatePicker', DateComponents.DatePicker)

describe('AbsentTeachersForm', () => {
  const factory = (values = {}) => {
    return shallowMount(AbsentTeachersForm, {
      propsData: values,
      localVue
    })
  }
  it('should match snapshot', () => {
    const wrapper = factory()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('should not allow to send form is values are invalid', () => {
    const wrapper = factory()
    expect(wrapper.vm.$v.$invalid).toBe(true)
  })
  it('should allow to send form is values are valid', () => {
    const wrapper = factory()
    wrapper.setData({
      form: {
        teacher_id: 'abc123',
        dates: {
          start: '2020-01-01',
          end: '2020-01-01'
        }
      }
    })
    expect(wrapper.vm.$v.$invalid).toBe(false)
  })
})
