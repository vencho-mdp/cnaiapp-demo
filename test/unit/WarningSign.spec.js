import { mount } from '@vue/test-utils'
import WarningSign from '@/components/WarningSign.vue'

describe('WarningSign', () => {
  it('should render correctly with props', async () => {
    const el = mount(WarningSign, {
      slots: {
        default: '<h1> Title example </h1>'
      }
    })
    const text = el.find('h1').text()
    const html = el.html()
    expect(text).toBe('Title example')
    expect(html).toMatchSnapshot()
  })

  it('renders correctly without props', async () => {
    const el = mount(WarningSign)
    expect(el.html()).toMatchSnapshot()
  })
})
