import { createTRPCClient, httpBatchLink } from '@trpc/client'
import type { TRPCRouter } from './router'

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchLink({
      url: '/api/trpc',
    }),
  ],
})
