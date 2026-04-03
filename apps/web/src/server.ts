import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { Hono } from 'hono'

const app = new Hono()

app.use('/assets/*', serveStatic({ root: './dist' }))
app.use('/favicon.svg', serveStatic({ root: './dist' }))

app.get('*', serveStatic({ root: './dist', path: '/index.html' }))

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, info => {
  console.log(`CubeMaster running at http://localhost:${info.port}`)
})
