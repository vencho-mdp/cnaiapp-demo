import { mount } from '@vue/test-utils'
import SlotsAccordionItem from '@/components/SlotsAccordionItem.vue'

const remove_new_lines = str => str.replace(/\n/g, '')
const remove_multiple_space_and_put_one = str => str.replace(/\s+/g, ' ')

describe('SlotsAccordionItem', () => {
  const factory = propsData => mount(SlotsAccordionItem, {
    propsData
  })
  it('renders correctly', () => {
    const wrapper = factory({
      assignment: {
        subject: 'Matemática',
        teachers: ['Mariana'],
        start_time: '10:00',
        end_time: '11:00'
      }
    })
    expect(wrapper.find('h5:first-of-type').text()).toBe('Matemática')
    expect(wrapper.find('h6').text()).toBe('10:00 - 11:00')
  })

  it('shows edit and delete buttons when edit prop is set to true', async () => {
    const wrapper = factory({
      assignment: {
        subject: 'Matemática',
        teachers: ['Mariana'],
        start_time: '10:00',
        end_time: '11:00'
      },
      edit: true
    })
    await wrapper.find('button:first-of-type').trigger('click')
    await wrapper.find('button:last-of-type').trigger('click')
    expect(wrapper.emitted()['delete-assignment']).toBeTruthy()
    expect(wrapper.emitted()['edit-assignment']).toBeTruthy()
  })

  it('show that a warning saying that the teacher will be absent if absence_start_date && absence_end_date are present and edit prop is set to false', () => {
    const wrapper = factory({
      assignment: {
        subject: 'Matemática',
        teachers: ['Mariana'],
        start_time: '10:00',
        end_time: '11:00',
        absence_start_date: '2022-02-18T15:03:39.321Z',
        absence_end_date: '2022-02-20T15:03:39.321Z'
      },
      edit: false
    })
    expect(wrapper.find('[data-test="teacher-absence-warning"]').exists()).toBe(true)
    expect(remove_new_lines(remove_multiple_space_and_put_one(wrapper.find('[data-test="teacher-absence-warning"]').text()))).toBe('El profesor faltará desde el 18/2 al 20/2')
  })
})
