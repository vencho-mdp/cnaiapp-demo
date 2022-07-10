import { mount } from '@vue/test-utils'
import Modal from '@/components/TheModal.vue'

describe('VTitle', () => {
  it('should render correctly', async () => {
    const el = mount(Modal, {
      slots: {
        default: '<h1>Content inside Modal</h1>'
      }
    })
    const text = el.find('h1')
    const html = el.html()
    expect(text.exists()).toBe(true)
    expect(html).toMatchSnapshot()
  })
})
