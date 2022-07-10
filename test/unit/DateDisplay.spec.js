import { shallowMount } from '@vue/test-utils'
import dateDisplay from '@/components/DateDisplay.vue'

describe('Date Display', () => {
  const factory = props => shallowMount(dateDisplay, {
    propsData: props
  })

  it('displays one date correctly', () => {
    const date = new Date()
    const wrapper = factory({ dates: [date] })
    expect(wrapper.find('span').text()).toBe(
      date
        .toLocaleDateString('es-AR', {
          month: 'short',
          day: 'numeric'
        })
        .replaceAll('.', ''))
  })

  it('displays two dates correctly', () => {
    const date = new Date()
    const wrapper = factory({ dates: [date, date] })
    const formatted_date = date
      .toLocaleDateString('es-AR', {
        month: 'short',
        day: 'numeric'
      })
      .replaceAll('.', '')
    expect(wrapper.find('span').text()).toBe(`${formatted_date} - ${formatted_date}`)
  })
})
