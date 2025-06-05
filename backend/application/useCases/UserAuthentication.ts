import { User, RoleEnum } from "../../domain/entities/User";
import { IUserRepository } from "../interfaces/IUserRepository";

export interface AuthenticateUserRequest {
  email: string;
  password: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  role?: RoleEnum;
}

export class AuthenticateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: AuthenticateUserRequest): Promise<User> {
    const user = await this.userRepository.findByEmail(request.email);
    if (!user) {
      throw new Error("Usuario no existe");
    }

    const bcrypt = require("bcryptjs");
    const isValid = await bcrypt.compare(request.password, user.getPassword());
    if (!isValid) {
      throw new Error("Contraseña inválida");
    }

    return user;
  }
}

export class CreateUser {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(request: CreateUserRequest): Promise<User> {
    const existingUser = await this.userRepository.findByEmail(request.email);
    if (existingUser) {
      throw new Error("El usuario ya existe");
    }

    const bcrypt = require("bcryptjs");
    const hashedPassword = await bcrypt.hash(request.password, 10);

    return this.userRepository.create({
      email: request.email,
      password: hashedPassword,
      role: request.role || RoleEnum.STAFF,
    });
  }
}
