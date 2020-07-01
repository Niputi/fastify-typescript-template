import * as fp from 'fastify-plugin'

export default fp(async (server, opts, next) => {
  server.route({
    url: '/status',
    logLevel: 'warn',
    method: ['GET', 'HEAD'],
    handler: async (request, reply) => {
      server.db.connect()

      request.session.username = 'niputi'
      request.session.time = Math.floor(Math.random() * 600000000) + 2000000

      console.log('ID', request.id)

      return reply.send({
        date: new Date(),
        works: true,
        data: request.session,
      })
    },
  })
  next()
})
