import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'

import { createVersionedStorage } from '~/lib/storage'

type Progress = { count: number }

const KEY = 'cubeMaster:test'
const fallback: Progress = { count: 0 }

const makeStore = (
  overrides: Partial<Parameters<typeof createVersionedStorage<Progress>>[0]> = {}
) => createVersionedStorage<Progress>({ key: KEY, version: 1, fallback, ...overrides })

beforeEach(() => {
  localStorage.clear()
})

afterEach(() => {
  localStorage.clear()
})

describe('createVersionedStorage', () => {
  it('should round-trip data through a versioned envelope', () => {
    const store = makeStore()
    store.save({ count: 5 })

    expect(store.load()).toEqual({ count: 5 })

    const raw = localStorage.getItem(KEY)
    expect(JSON.parse(raw ?? '')).toEqual({ version: 1, data: { count: 5 } })
  })

  it('should return the fallback when the key is missing', () => {
    expect(makeStore().load()).toEqual(fallback)
  })

  it('should return the fallback on malformed JSON', () => {
    localStorage.setItem(KEY, 'not json {')
    expect(makeStore().load()).toEqual(fallback)
  })

  it('should return the fallback on a non-envelope shape', () => {
    localStorage.setItem(KEY, JSON.stringify({ count: 9 }))
    expect(makeStore().load()).toEqual(fallback)
  })

  it('should return the fallback for a newer (unknown) version', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 2, data: { count: 9 } }))
    expect(makeStore().load()).toEqual(fallback)
  })

  it('should route an older version through the migrate hook', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 0, data: { legacy: 9 } }))
    const migrate = () => ({ count: 9 })
    expect(makeStore({ migrate }).load()).toEqual({ count: 9 })
  })

  it('should fall back when an older version has no migrate hook', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 0, data: { legacy: 9 } }))
    expect(makeStore().load()).toEqual(fallback)
  })

  it('should fall back when validate rejects the current-version data', () => {
    localStorage.setItem(KEY, JSON.stringify({ version: 1, data: { wrong: true } }))
    const validate = (data: unknown): Progress | null =>
      typeof data === 'object' && data !== null && 'count' in data ? (data as Progress) : null
    expect(makeStore({ validate }).load()).toEqual(fallback)
  })

  it('should swallow quota errors on write without throwing', () => {
    const spy = spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError')
    })

    expect(() => makeStore().save({ count: 1 })).not.toThrow()

    spy.mockRestore()
  })
})
