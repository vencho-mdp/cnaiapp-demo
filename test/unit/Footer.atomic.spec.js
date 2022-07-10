import { shallowMount } from '@vue/test-utils'
import TheFooter from '@/components/TheFooter.vue'

describe('VTitle', () => {
  it('should render correctly', async () => {
    const el = shallowMount(TheFooter)
    const html = el.html()
    expect(html).toMatchSnapshot()
  })
})
