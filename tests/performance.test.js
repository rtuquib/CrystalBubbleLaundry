import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import {
  loadFreshSeedForTests,
  __clearMemoryStateForTests,
  getReports,
} from '../src/services/laundryDb.js'

describe('performance', () => {
  beforeEach(() => {
    loadFreshSeedForTests()
  })

  afterEach(() => {
    __clearMemoryStateForTests()
  })

  it('generates reports within a reasonable time budget', () => {
    const start = performance.now()
    for (let i = 0; i < 500; i += 1) {
      getReports()
    }
    const ms = performance.now() - start
    expect(ms).toBeLessThan(800)
  })
})
