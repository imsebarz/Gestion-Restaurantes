import { GraphQLContext } from "../context";
import { AuthenticateUser, CreateUser } from "../../../application/useCases/UserAuthentication";
import { sign } from "jsonwebtoken";
import { RoleEnum } from "../../../domain/entities/User";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

function signToken(user: { id: number; role: RoleEnum }): string {
  return sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: "24h" });
}

export const userResolvers = {
  Query: {
    me: async (_: unknown, __: unknown, context: GraphQLContext) => {
      console.log('=== ME RESOLVER DEBUG ===');
      console.log('Context user:', context.user);
      console.log('User exists:', !!context.user);
      console.log('User ID:', context.user?.id);
      console.log('User role:', context.user?.role);
      console.log('========================');
      
      if (!context.user) {
        throw new Error("No autorizado");
      }

      // Get full user from database
      const fullUser = await context.repositories.userRepository.findById(context.user.id);
      if (!fullUser) {
        throw new Error("Usuario no encontrado");
      }

      return fullUser;
    },
  },

  Mutation: {
    signup: async (
      _: unknown,
      args: {
        email: string;
        password: string;
        name?: string;
        role?: RoleEnum;
      },
      context: GraphQLContext
    ) => {
      const { email, password, role = RoleEnum.STAFF } = args;
      
      const createUser = new CreateUser(context.repositories.userRepository);
      const user = await createUser.execute({
        email,
        password,
        role,
      });

      return {
        token: signToken({ id: user.id, role: user.role }),
        user,
      };
    },

    login: async (
      _: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) => {
      const authenticateUser = new AuthenticateUser(context.repositories.userRepository);
      const user = await authenticateUser.execute(args);

      return {
        token: signToken({ id: user.id, role: user.role }),
        user,
      };
    },
  },
};