import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'
import { db } from '#/db'
import { destinations } from '#/db/schema'

import type { TRPCRouterRecord } from '@trpc/server'

const todos = [
  { id: 1, name: 'Get groceries' },
  { id: 2, name: 'Buy a new phone' },
  { id: 3, name: 'Finish the project' },
]

const todosRouter = {
  list: publicProcedure.query(() => todos),
  add: publicProcedure
    .input(z.object({ name: z.string() }))
    .mutation(({ input }) => {
      const newTodo = { id: todos.length + 1, name: input.name }
      todos.push(newTodo)
      return newTodo
    }),
} satisfies TRPCRouterRecord

const destinationsRouter = {
  list: publicProcedure.query(() => db.select().from(destinations)),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  todos: todosRouter,
  destinations: destinationsRouter,
})
export type TRPCRouter = typeof trpcRouter
