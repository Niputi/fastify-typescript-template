# fastify with typescript

You can have next grades of the integration covered here:
 - local development setup
 - integration with a database
 - debugging
 - deployment
 - error logging
 - recommended to use ngrok for development (to make secure cookies and oauth working)


> https://www.prisma.io/docs/reference/tools-and-interfaces/prisma-migrate
prisma db setup
```
npx prisma migrate save --experimental
npx prisma migrate up --experimental  
npx prisma generate
```