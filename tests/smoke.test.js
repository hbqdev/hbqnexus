import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent } from 'vue'

describe('test infrastructure', () => {
  it('runs assertions', () => {
    expect(1 + 1).toBe(2)
  })

  it('mounts a Vue component', () => {
    const Hello = defineComponent({ template: '<p>Nexus Hub</p>' })
    expect(mount(Hello).text()).toBe('Nexus Hub')
  })
})
