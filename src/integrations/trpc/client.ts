import { createTRPCClient, httpBatchStreamLink } from '@trpc/client'
import superjson from 'superjson'
import type { TRPCRouter } from './router'
import { getTrpcUrl } from './url'

export const trpcClient = createTRPCClient<TRPCRouter>({
  links: [
    httpBatchStreamLink({
      transformer: superjson,
      url: getTrpcUrl(),
    }),
  ],
})
