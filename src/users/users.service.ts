import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PRISMA_ERROR } from "src/config/constants";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({ data: createUserDto });
    } catch (error) {
      if (error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT_FAILED)  {
        throw new ConflictException(
          `User with email ${createUserDto.email} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try {
      await this.prisma.user.update({
        where: { id },
        data: { ...updateUserDto, updatedAt: new Date() },
      });

      return { message: "User updated" };
    } catch (error) {
      if (error.code === PRISMA_ERROR.NOT_FOUND) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      if (error.code === PRISMA_ERROR.UNIQUE_CONSTRAINT_FAILED) {
        throw new ConflictException(
          `User with email ${updateUserDto.email} already exists`,
        );
      }
      throw error;
    }
  }

  async delete(id: string) {
    try {
      await this.prisma.user.delete({ where: { id } });

      return { message: "User deleted" };
    } catch (error) {
      if (error.code === PRISMA_ERROR.NOT_FOUND) {
        throw new NotFoundException(`User with ID ${id} not found`);
      }
      throw error;
    }
  }
}
