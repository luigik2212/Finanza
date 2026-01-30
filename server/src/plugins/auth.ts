import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import jwt from "jsonwebtoken";
import { env } from "../lib/env";

export interface AuthPayload {
  userId: string;
}

export function authPlugin(fastify: FastifyInstance) {
  fastify.decorateRequest("user", null);
  fastify.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const header = request.headers.authorization;
      if (!header || !header.startsWith("Bearer ")) {
        reply.code(401).send({ message: "Unauthorized" });
        return;
      }

      const token = header.replace("Bearer ", "").trim();
      try {
        const payload = jwt.verify(token, env.JWT_SECRET) as AuthPayload;
        request.user = { userId: payload.userId };
      } catch {
        reply.code(401).send({ message: "Invalid token" });
        return;
      }
    }
  );
}
