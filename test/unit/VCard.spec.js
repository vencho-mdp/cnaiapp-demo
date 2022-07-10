import { mount } from '@vue/test-utils'
import VCard from '@/components/VCard.vue'

const mocked_data = [{
  label: 'Label1',
  desc: 'Desc1'
}, {
  label: 'Label2',
  desc: 'Desc2'
}]

describe('test card component', () => {
  const factory = props => mount(VCard, {
    propsData: props
  })

  it('renders noDataMsg when it has no records and change records prop is false', () => {
    const wrapper = factory({
      data: [],
      changeRecords: false,
      noDataMsg: 'No información'
    })
    expect(wrapper.find('h2:first-of-type').text()).toBe('No información')
  })

  it('does not render noDataMsg when it has no records and change records prop is true', () => {
    const wrapper = factory({
      data: [],
      changeRecords: true,
      noDataMsg: 'No información'
    })
    expect(wrapper.findAll('h2').at(0).text()).not.toBe('No información')
  })

  it('renders data when it has records', () => {
    const wrapper = factory({
      data: mocked_data,
      changeRecords: false,
      noDataMsg: 'No información'
    })
    const h3s = wrapper.findAll('h3')
    expect(h3s.at(0).text()).toBe('Label1')
    expect(h3s.at(1).text()).toBe('Desc1')
    expect(h3s.at(2).text()).toBe('Label2')
    expect(h3s.at(3).text()).toBe('Desc2')
  })

  it('renders buttons when it has changeRecords set to true', () => {
    const wrapper = factory({
      data: mocked_data.splice(0, 1),
      changeRecords: true,
      noDataMsg: 'No información'
    })
    expect(wrapper.findAll('button').length).toBe(3)
  })

  it('emits the corresponding events when clicking each button', async () => {
    const wrapper = factory({
      data: mocked_data.splice(0, 1),
      changeRecords: true,
      noDataMsg: 'No información'
    })
    const buttons = wrapper.findAll('button')
    buttons.at(0).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('addItem')).toBeTruthy()
    buttons.at(1).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('deleteItem')).toBeTruthy()
    buttons.at(2).trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.emitted('editItem')).toBeTruthy()
  })
})
