import { describe, expect, it } from 'bun:test'

import { app } from '~/server'

describe('server', () => {
  describe('GET /health', () => {
    it('returns status 200', async () => {
      const response = await app.request('/health')

      expect(response.status).toBe(200)
    })

    it('returns JSON body { status: "ok" }', async () => {
      const response = await app.request('/health')
      const body = await response.json()

      expect(body).toEqual({ status: 'ok' })
    })

    it('is registered before the SPA catch-all', async () => {
      const response = await app.request('/health')
      const contentType = response.headers.get('content-type') ?? ''

      expect(contentType).toContain('application/json')
    })
  })
})
