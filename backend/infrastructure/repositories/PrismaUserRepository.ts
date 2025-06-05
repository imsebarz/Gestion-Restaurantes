import { IUserRepository } from "../../application/interfaces/IUserRepository";
import { User, RoleEnum } from "../../domain/entities/User";
import prisma from "../prisma/client";

export class PrismaUserRepository implements IUserRepository {
  async findById(id: number): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as RoleEnum,
      user.createdAt,
    );
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) return null;

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as RoleEnum,
      user.createdAt,
    );
  }

  async create(userData: {
    email: string;
    password: string;
    role: RoleEnum;
  }): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password: userData.password,
        role: userData.role,
      },
    });

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as RoleEnum,
      user.createdAt,
    );
  }

  async update(id: number, userData: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (userData.email) updateData.email = userData.email;
    if (userData.role) updateData.role = userData.role;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
    });

    return new User(
      user.id,
      user.email,
      user.password,
      user.role as RoleEnum,
      user.createdAt,
    );
  }

  async delete(id: number): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }
}
