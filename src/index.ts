// types, startup etc.
import { Server, IncomingMessage, ServerResponse } from "http";
import * as sourceMapSupport from "source-map-support";
import * as crypto from "crypto";
import { config } from "dotenv";
import { join } from "path";
sourceMapSupport.install();
config({
  path: join(__dirname, '..', 'config', '.env')
})

// fastify and plugins
import * as fastify from "fastify";
import * as fastiCookie from "fastify-cookie";
import * as fastiBody from "fastify-formbody";
import * as fastiSession from "fastify-session";
import * as fastifyBlipp from "fastify-blipp";
import * as fastiHelmet from "fastify-helmet";
import * as mysqlSession from "express-mysql-session";
import * as oauthPlugin from "fastify-oauth2";

// modules and routes
import statusRoutes from "./modules/routes/status";
// import vehiclesRoutes from "./modules/routes/vehicles";
import errorThrowerRoutes from "./modules/routes/error-thrower";
import db from "./modules/db";

// const prisma = new PrismaClient()
const server: fastify.FastifyInstance<
  Server,
  IncomingMessage,
  ServerResponse
> = fastify({
  logger: {
    level: "info",
    // stream: stream,
    file: './logs/log.log', // Will use pino.destination()
  },
  genReqId: (req) => {
    const acceptLang = req.headers["accept-language"] || ""
    const xForwardedFor = req.headers['x-forwarded-for'] || ""
    let cookie: string = ""
    const CookieHeader = req.headers["cookie"] || ""
    if (CookieHeader.includes("_ses")) {
      cookie = cookie.substring(cookie.indexOf("_ses"))
    }
    const hash = crypto.createHash('sha256')
    hash.update(cookie)
    hash.update(xForwardedFor)
    hash.update(acceptLang)
    hash.update(req.headers['user-agent'] || '')
    hash.update(process.env.LOG_FINGERPRINT_SALT)
    const fingerprint = hash
      .digest('base64')
      .slice(0, 16)
    return fingerprint
  }
});

server.register(fastiHelmet)

const MySQLStore = mysqlSession(fastiSession as any);
const sessionStore = new MySQLStore({ 
  host: process.env.SESSION_DB_HOST,
  password: process.env.SESSION_DB_PASSWORD,
  user: process.env.SESSION_DB_USER,
  port: Number(process.env.SESSION_DB_PORT),
  database: process.env.SESSION_DB_DATABASE
});

server.register(fastiCookie, {
  secret: "y$B&E)H@MbQeThWmZq4t7w!z%C*F-JaNdRfUjXn2r5u8x/A?D(G+KbPeShVkYp3s", // for cookies signature
  parseOptions: {}     // options for parsing cookies
});
server.register(fastiBody);
server.register(fastiSession, {
  cookieName: '_ses',
  secret: "dbe66f5aad50fd5468def0d56e9cf3be9525d63a255104a8b0b34ff34731d302",
  saveUninitialized: true,
  cookie: {
    path: '/',
    secure: true
  },
  store: sessionStore
})

server.register(oauthPlugin, {
  name: 'googleOAuth2',
  credentials: {
    client: {
      id: process.env.OAUTH_GOOGLE_CIENT_ID,
      secret: process.env.OAUTH_GOOGLE_CIENT_SECRET
    },
    auth: oauthPlugin.GOOGLE_CONFIGURATION,
  },
  scope: ["email"],
  // register a fastify url to start the redirect flow
  startRedirectPath: '/login/google',
  // google redirect here after the user login
  callbackUri: process.env.OAUTH_GOOGLE_CALLBACK_URI
})

server.register(require("fastify-csrf"), { cookie: { secure: true, path: "/", httpOnly: true }, key: '_csrf' });
server.register(require('fastify-static'), {
  root: join(__dirname, 'static'),
  prefix: '/static/', // optional: default '/'
})

server.register(require('point-of-view'), {
  engine: {
    handlebars: require('handlebars')
  },
  // layout: './templates/layout.hbs',
});


server.register(fastifyBlipp);
server.register(db);
server.register(statusRoutes);
server.register(errorThrowerRoutes);
const start = async () => {
  try {
    await server.listen(3000, "0.0.0.0");
    console.log("listening on: http://127.0.0.1:3000");
    
    server.blipp();
  } catch (err) {
    console.log(err);
    server.log.error(err);
    process.exit(1);
  }
};

process.on("uncaughtException", error => {
  console.error(error);
});
process.on("unhandledRejection", error => {
  console.error(error);
});

start();
