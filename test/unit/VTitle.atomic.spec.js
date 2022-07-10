import { mount } from '@vue/test-utils'
import VTitle from '@/components/VTitle.vue'

describe('VTitle', () => {
  it('should render correctly', async () => {
    const el = mount(VTitle, {
      slots: {
        default: 'Title example'
      }
    })
    const text = el.find('h1').text()
    const html = el.html()
    expect(text).toBe('Title example')
    expect(html).toMatchSnapshot()
  })
})
