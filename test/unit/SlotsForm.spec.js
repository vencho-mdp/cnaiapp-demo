import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuelidate from 'vuelidate'
import SlotsForm from '@/components/Layouts/SlotsForm.vue'

const localVue = createLocalVue()
localVue.use(Vuelidate)

describe('SlotsForm', () => {
  const factory = (values = {}) => {
    return shallowMount(SlotsForm, {
      propsData: values,
      localVue
    })
  }
  it('renders correctly', () => {
    const wrapper = factory()
    expect(wrapper.html()).toMatchSnapshot()
  })
  it('does not allow to send form if it is invalid', () => {
    const wrapper = factory()
    expect(wrapper.vm.$v.$invalid).toBe(true)
  })
  it('sends form if it is valid', () => {
    const wrapper = factory()
    wrapper.setData({
      form: {
        grade: 'test',
        grade_number: 'test',
        assignments: [{ weekday: 'Lunes', end_time: '14:10', start_time: '12:55', teachers: [{ value: '3aa21a11-adcf-4bc5-a602-0fd6969a3a5e', label: 'Ainchil, Paula' }], local_id: '8252e3b5-e334-4967-b508-1c9e6381ee17', id: '8252e3b5-e334-4967-b508-1c9e6381ee17', subject_id: '43f4b66f-ba32-4d56-b1f9-cdb4e09c2009' }, { weekday: 'Lunes', end_time: '15:30', start_time: '14:10', teachers: [{ value: '2b404114-a477-4bc8-bd25-d1738c07b26d', label: 'Gorostegui, Maia' }], local_id: 'd0489ade-cfe8-4f24-b242-9b6bd48ed44d', id: 'd0489ade-cfe8-4f24-b242-9b6bd48ed44d', subject_id: 'ac6b491c-4241-49e4-89a8-29223732e664' }, { weekday: 'Lunes', end_time: '17:00', start_time: '15:45', teachers: [{ value: '0f46e9e3-0b6c-4a53-87c8-9f874331dd35', label: 'Santoiani, Silvia' }], local_id: 'ddf0eb43-51cf-4750-872c-600ebcb237d2', id: 'ddf0eb43-51cf-4750-872c-600ebcb237d2', subject_id: '93ede1dd-52d9-415f-ad2e-e6de4d37eae0' }, { weekday: 'Martes', end_time: '14:10', start_time: '12:55', teachers: [{ value: '3aa21a11-adcf-4bc5-a602-0fd6969a3a5e', label: 'Ainchil, Paula' }], local_id: '2c11644a-eb5d-4d05-b611-90b9b29bff07', id: '2c11644a-eb5d-4d05-b611-90b9b29bff07', subject_id: '43f4b66f-ba32-4d56-b1f9-cdb4e09c2009' }, { weekday: 'Martes', end_time: '15:30', start_time: '14:10', teachers: [{ value: '2b404114-a477-4bc8-bd25-d1738c07b26d', label: 'Gorostegui, Maia' }], local_id: 'd02f02d8-b6d7-4a60-a323-97fe7854d997', id: 'd02f02d8-b6d7-4a60-a323-97fe7854d997', subject_id: 'ac6b491c-4241-49e4-89a8-29223732e664' }, { weekday: 'Martes', end_time: '17:35', start_time: '15:45', teachers: [{ value: '3f222a26-3724-4090-978a-35456f1abc14', label: 'Rusos, Mario' }], local_id: 'd522b7de-57e6-49c4-87b3-91b10c4c2cf2', id: 'd522b7de-57e6-49c4-87b3-91b10c4c2cf2', subject_id: '2c6ded66-2432-441a-940a-084f02fe07c6' }, { weekday: 'Miércoles', end_time: '14:10', start_time: '13:30', teachers: [{ value: '3aa21a11-adcf-4bc5-a602-0fd6969a3a5e', label: 'Ainchil, Paula' }], local_id: 'bfcb5479-7255-4f30-8688-6f22978ab712', id: 'bfcb5479-7255-4f30-8688-6f22978ab712', subject_id: '43f4b66f-ba32-4d56-b1f9-cdb4e09c2009' }, { weekday: 'Miércoles', end_time: '15:30', start_time: '14:10', teachers: [{ value: 'bcb68de7-7c08-455c-a562-84d946f3012f', label: 'Pérez, Gabriel' }], local_id: 'c722af9e-51e3-4580-b47f-ac0254f8776f', id: 'c722af9e-51e3-4580-b47f-ac0254f8776f', subject_id: '64af5892-5116-4f49-951b-e4b64e0d8df9' }, { weekday: 'Miércoles', end_time: '17:35', start_time: '15:45', teachers: [{ value: 'ebe11e29-e21e-4319-8936-6090e955028d', label: 'Wibaux, Matías' }], local_id: '1463a9b3-a044-462f-b438-aec4adaafce4', id: '1463a9b3-a044-462f-b438-aec4adaafce4', subject_id: '22d25007-caf9-4db5-bf72-e775130a9a18' }, { weekday: 'Jueves', end_time: '15:30', start_time: '14:10', teachers: [{ value: '2b404114-a477-4bc8-bd25-d1738c07b26d', label: 'Gorostegui, Maia' }], local_id: '82b143aa-5a41-4086-ab01-4a87f492f761', id: '82b143aa-5a41-4086-ab01-4a87f492f761', subject_id: 'ac6b491c-4241-49e4-89a8-29223732e664' }, { weekday: 'Jueves', end_time: '17:35', start_time: '15:45', teachers: [{ value: '864464dc-041c-42e9-bf73-cd6297f14f60', label: 'Villavicencio, Alberto' }], local_id: '05571295-a589-49db-ab29-c6897aa40a99', id: '05571295-a589-49db-ab29-c6897aa40a99', subject_id: '59a61ae9-f252-4156-b929-f93fba140b4c' }, { weekday: 'Viernes', end_time: '15:30', start_time: '14:10', teachers: [{ value: '93358a54-bc92-4b2a-8f03-7247da4f1190', label: 'Pitaluga, Jorge' }], local_id: '9e9c14ca-2947-4a66-9073-2717e19f364f', id: '9e9c14ca-2947-4a66-9073-2717e19f364f', subject_id: '1fa98d0a-7a5f-4a55-868f-2236b7fd14ce' }, { weekday: 'Viernes', end_time: '17:35', start_time: '15:45', teachers: [{ value: 'fbd6ffea-19c3-4eaf-a6a3-bc21d1859b0c', label: 'Martinez, Mara' }], local_id: 'f794cd0f-20c8-425e-8950-1898f2faefc1', id: 'f794cd0f-20c8-425e-8950-1898f2faefc1', subject_id: '7ec7d66d-03d9-448c-b26b-209f05386001' }]
      },
      teachers: [],
      classes: []
    })
    expect(wrapper.vm.$v.$invalid).toBe(false)
  })
})
