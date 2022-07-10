import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import NewsForm from '@/components/Layouts/NewsForm.vue'

const localVue = createLocalVue()
localVue.use(Vuelidate)

describe('NewsForm', () => {
  const factory = (values = {}) => {
    return shallowMount(NewsForm, {
      propsData: values,
      localVue
    })
  }
  it('renders correctly', () => {
    const wrapper = factory()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('does not send form if it is invalid', () => {
    const wrapper = factory()
    expect(wrapper.vm.$v.$invalid).toBe(true)
  })
  it('sends form if it is valid', () => {
    const wrapper = factory()
    wrapper.setData({
      form: {
        title: 'test',
        content: 'test',
        image: 'test'
      }
    })
    expect(wrapper.vm.$v.$invalid).toBe(false)
  })
})
