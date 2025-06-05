import { User, RoleEnum } from "../../domain/entities/User";

export interface IUserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(userData: {
    email: string;
    password: string;
    role: RoleEnum;
  }): Promise<User>;
  update(id: number, userData: Partial<User>): Promise<User>;
  delete(id: number): Promise<void>;
}
