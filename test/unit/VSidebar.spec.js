import { mount } from '@vue/test-utils'
import VSidebar from '@/components/VSidebar.vue'

describe('VSidebar', () => {
  window.scrollTo = jest.fn()
  it('renders correctly', async () => {
    const el = mount(VSidebar)
    expect(el.html()).toMatchSnapshot()
  })

  it('should render correctly with slots', async () => {
    const el = mount(VSidebar, {
      slots: {
        content: '<div> Content Example </div>'
      }
    })
    const text = el.find('div').text()
    expect(text).toBe('Content Example')
  })

  it('should render correctly with content props', async () => {
    const el = mount(VSidebar, {
      propsData: {
        title: 'Title Example',
        subtitle: 'Subtitle Example'
      }
    })
    const h1 = el.find('h1').text()
    expect(h1).toBe('Title Example')
    const h2 = el.find('h2').text()
    expect(h2).toBe('Subtitle Example')
  })
})
