import { mount } from '@vue/test-utils'
import Paragraph from '@/components/VParagraph.vue'

const text =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum'

describe('VTitle', () => {
  it('should render correctly', async () => {
    const el = mount(Paragraph, {
      slots: {
        default: text
      }
    })
    const p = el.find('p').text()
    const html = el.html()
    expect(p).toBe(text)
    expect(html).toMatchSnapshot()
  })
})
