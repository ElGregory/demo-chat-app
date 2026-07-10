import { createTRPCContext } from '@trpc/tanstack-react-query'
import { trpcClient } from './client'
import type { TRPCRouter } from '#/integrations/trpc/router'

export const { TRPCProvider, useTRPC } = createTRPCContext<TRPCRouter>({
  client: trpcClient,
})
