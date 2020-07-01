import { PrismaClient } from '@prisma/client'
import * as fp from 'fastify-plugin'

export default fp(async (fastify, opts: { uri: string }, next) => {
  const db = new PrismaClient()

  fastify.decorate('db', db)

  next()
})
