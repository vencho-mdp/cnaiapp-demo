import { mount } from '@vue/test-utils'
import ComingSoonCard from '@/components/ComingSoonCard.vue'

describe('ComingSoonCard', () => {
  it('should render correctly', async () => {
    const el = mount(ComingSoonCard, {
      slots: {
        default: '<span> Proximamente </span>'
      }
    })
    const text = el.find('h2 > span').text()
    const html = el.html()
    expect(text).toBe('Proximamente')
    expect(html).toMatchSnapshot()
  })
})
