import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'
import SfcProbe from './fixtures/SfcProbe.vue'

describe('test infrastructure', () => {
  it('runs assertions', () => {
    expect(1 + 1).toBe(2)
  })

  it('mounts a Vue component', () => {
    const Hello = defineComponent({ template: '<p>Nexus Hub</p>' })
    expect(mount(Hello).text()).toBe('Nexus Hub')
  })

  it('compiles and mounts a real .vue single-file component', () => {
    const w = mount(SfcProbe, { props: { label: 'Nexus Hub' } })
    expect(w.get('.probe').text()).toBe('Nexus Hub')
  })
})
