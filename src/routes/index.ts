import * as fp from 'fastify-plugin'

export default fp(async (server, opts, next) => {
  server.route({
    url: '/',
    logLevel: 'warn',
    method: ['GET', 'HEAD'],
    handler: async (request, reply) => {
      reply.view('index.html')
    },
  })
  next()
})
