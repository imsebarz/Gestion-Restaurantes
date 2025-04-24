// src/server.ts
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { createYoga, createSchema } from 'graphql-yoga';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import { createContext } from './context';
import type { Context } from './auth';

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Construye el esquema GraphQL
  const schema = createSchema({ typeDefs, resolvers });

  // Inicializa Yoga con nuestro contexto tipado
  const yoga = createYoga<Context>({
    schema,
    context: createContext,
    graphiql: true,
  });

  // Middleware puente para que Express reconozca Yoga en /graphql
  app.use(
    '/graphql',
    (req: Request, res: Response, next: NextFunction) => {
      yoga(req, res).catch(next);
    }
  );

  const port = process.env.PORT ?? 4000;
  createServer(app).listen(port, () => {
    console.log(`🚀 Server listo en http://localhost:${port}/graphql`);
  });
}

main().catch(console.error);
