import * as fp from "fastify-plugin";
// import { id as getId } from "cls-rtracer";

export default fp(async (server, opts, next) => {
  server.route({
    url: "/status",
    logLevel: "warn",
    method: ["GET", "HEAD"],
    handler: async (request, reply) => {
      server.db.connect()
      
      request.session.usename = "niputi"
      request.session.time = Math.floor(Math.random() * 600000000) + 2000000

      console.log("ID", request.id)

      // request.log.trace("TEST1")
      // request.log.debug("TEST2")
      // request.log.info("TEST3")
      // request.log.warn("TEST4")

      return reply.send({ date: new Date(), works: true });
    }
  });
  next();
});
