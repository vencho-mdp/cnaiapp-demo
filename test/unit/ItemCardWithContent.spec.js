import { mount } from '@vue/test-utils'
import ItemCardWithContent from '@/components/ItemCardWithContent.vue'

const remove_html_tags = html_string => html_string.replace(/<(?:.|\n)*?>/gm, '')

const title = 'title'
const content = '<p id="text" >Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum </p>'
const dates = [new Date(), new Date()]

describe('ItemCardWithContent', () => {
  const factory = props => mount(ItemCardWithContent, {
    propsData: props
  })
  it('renders title correctly', () => {
    const wrapper = factory({ data: { title, content, dates } })
    expect(wrapper.find('h2').text()).toBe('title')
  })

  it('does not trim content if it is less than 200 characters', () => {
    // 199 and not 200 because the operator in the component is
    // greater or equal
    // however, it does not make a notorious difference
    const first_two_hundred_characters = content.substring(0, 199)
    const wrapper = factory({ data: { title, content: first_two_hundred_characters, dates } })
    const sanitized_text = remove_html_tags(first_two_hundred_characters)
    expect(wrapper.find('#text').text()).toBe(sanitized_text)
  })

  it('trims content if it is more than 200 characters', () => {
    const wrapper = factory({ data: { title, content, dates } })
    const expected_text = remove_html_tags(content.substring(0, 200) + ' ...').trim()
    expect(wrapper.find('#text').text()).toBe(expected_text)
  })

  it('does not show "read more" button if all content is already shown', () => {
    const wrapper = factory({ data: { title, content: content.substring(0, 200), dates } })
    expect(wrapper.find('#read-more').exists()).toBe(false)
  })

  it('shows "read more" button if content is more than 200 characters and it emits the open sidebar event', () => {
    const wrapper = factory({ data: { title, content, dates } })
    wrapper.findAll('button').at(-1).trigger('click')
    expect(wrapper.emitted().openSidebar).toBeTruthy()
  })

  it('display dates correctly', () => {
    const wrapper = factory({ data: { title, content, dates } })
    const formatted_date = dates[0]
      .toLocaleDateString('es-AR', {
        month: 'short',
        day: 'numeric'
      })
      .replaceAll('.', '')
    expect(wrapper.find('span').text()).toBe(`${formatted_date} - ${formatted_date}`)
  })
})
