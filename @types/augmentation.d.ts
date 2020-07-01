import { PrismaClient, PrismaClientOptions } from "@prisma/client"
import { IncomingMessage, Server, ServerResponse } from "http"
import { Options as TokenOptions } from "csrf"
import * as fastify from "fastify"
import * as http from "http"

declare module "fastify" {
  export interface FastifyInstance<
    HttpServer = http.Server,
    HttpRequest = http.IncomingMessage,
    HttpResponse = http.ServerResponse
    > {
    db: PrismaClient<PrismaClientOptions, never>
  }
}

declare module "fastify" {
  interface FastifyRequest {
    csrfToken(): string
  }
}

interface Options<HttpRequest> extends TokenOptions {
  value?: (req: HttpRequest) => string
  cookie?: fastify.CookieSerializeOptions | boolean
  ignoreMethods?: Array<string>
  sessionKey?: string
}

declare const fastifyCsrf: fastify.Plugin<
  Server,
  IncomingMessage,
  ServerResponse,
  Options<ServerResponse>
>

export = fastifyCsrf