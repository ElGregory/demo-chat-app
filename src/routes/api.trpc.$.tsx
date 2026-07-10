import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { trpcRouter } from '#/integrations/trpc/router'
import { createFileRoute } from '@tanstack/react-router'

function handler({ request }: { request: Request }) {
  const absoluteUrl = request.url.startsWith('http')
    ? request.url
    : new URL(request.url, 'http://localhost').toString()
  const url = new URL(absoluteUrl)
  const endpoint = '/api/trpc'
  let path = url.pathname.startsWith(endpoint)
    ? url.pathname.slice(endpoint.length)
    : url.pathname
  if (!path) path = '/'

  const req = new Request(absoluteUrl, {
    method: request.method,
    headers: request.headers,
    body: request.body,
    redirect: request.redirect,
  })

  return fetchRequestHandler({
    req,
    router: trpcRouter,
    endpoint,
    path,
  })
}

export const Route = createFileRoute('/api/trpc/$')({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
})
