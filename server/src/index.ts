import Fastify from "fastify";
import path from "path";
import fs from "fs";
import fastifyStatic from "@fastify/static";
import { env } from "./lib/env";
import { authPlugin } from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { dashboardRoutes } from "./routes/dashboard";
import { transactionRoutes } from "./routes/transactions";
import { categoryRoutes } from "./routes/categories";
import { merchantRoutes } from "./routes/merchants";
import { accountRoutes } from "./routes/accounts";
import { reportRoutes } from "./routes/reports";

const app = Fastify({ logger: true });

app.register(authPlugin);

app.register(authRoutes, { prefix: "/api" });
app.register(dashboardRoutes, { prefix: "/api" });
app.register(transactionRoutes, { prefix: "/api" });
app.register(categoryRoutes, { prefix: "/api" });
app.register(merchantRoutes, { prefix: "/api" });
app.register(accountRoutes, { prefix: "/api" });
app.register(reportRoutes, { prefix: "/api" });

const staticRoot = path.resolve(process.cwd(), "../client/dist");

if (fs.existsSync(staticRoot)) {
  app.register(fastifyStatic, {
    root: staticRoot,
    prefix: "/"
  });
}

app.setNotFoundHandler((request, reply) => {
  if (request.url.startsWith("/api")) {
    reply.code(404).send({ message: "Not found" });
    return;
  }

  if (fs.existsSync(staticRoot)) {
    return reply.sendFile("index.html");
  }

  reply.code(404).send({ message: "Not found" });
});

app
  .listen({ port: env.PORT, host: "0.0.0.0" })
  .then(() => {
    app.log.info(`Server running on port ${env.PORT}`);
  })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
