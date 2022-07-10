import { shallowMount, createLocalVue } from '@vue/test-utils'
import Vuex from 'vuex'
import TheSideNavbar from '@/components/TheSideNavbar.vue'

const localVue = createLocalVue()
localVue.use(Vuex)

describe('TheSideNavbar', () => {
  // eslint-disable-next-line no-unused-vars
  let actions
  let state
  let store

  beforeEach(() => {
    actions = {
      'authentication/logout': jest.fn()
    }

    state = {
      authentication: {
        user_data: {
          classes_ids: [1, 2, 3],
          groups: ['preceptor']
        }
      }
    }

    store = new Vuex.Store({
      actions,
      state
    })
  })

  it('renders the correct markup', () => {
    const component = shallowMount(TheSideNavbar, {
      store,
      localVue
    })
    expect(component.html).toMatchSnapshot()
  })

  it('logs out', async () => {
    const component = shallowMount(TheSideNavbar, {
      store,
      localVue,
      mocks: {
        $router: {
          replace: jest.fn()
        }
      }
    })
    await component.find('aside > a').trigger('click')
    expect(actions['authentication/logout']).toHaveBeenCalled()
  })

  it('has links', () => {
    const component = shallowMount(TheSideNavbar, {
      store,
      localVue
    })
    expect(component.findAll('a').length).toBeGreaterThan(0)
  })
})
