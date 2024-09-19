import { ConflictException, NotFoundException } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

jest.mock("../prisma/prisma.service");

describe("UsersService", () => {
  let service: UsersService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "Password1!",
      };

      (prismaService.user.create as jest.Mock).mockResolvedValue(createUserDto);

      const result = await service.create(createUserDto);
      expect(result).toEqual(createUserDto);
      expect(prismaService.user.create).toHaveBeenCalledWith({
        data: createUserDto,
      });
    });

    it("should throw ConflictException if user with email exists", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        name: "Test User",
        password: "password",
      };

      (prismaService.user.create as jest.Mock).mockRejectedValue({
        code: "P2002",
      });

      await expect(service.create(createUserDto)).rejects.toThrow(
        new ConflictException(
          `User with email ${createUserDto.email} already exists`,
        ),
      );
    });
  });

  describe("findAll", () => {
    it("should return all users", async () => {
      const users = [{ id: "1", name: "Test User", email: "test@example.com" }];
      (prismaService.user.findMany as jest.Mock).mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
    });
  });

  describe("findOne", () => {
    it("should return a user if found", async () => {
      const user = { id: "1", name: "Test User", email: "test@example.com" };
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(user);

      const result = await service.findOne("1");
      expect(result).toEqual(user);
    });

    it("should throw NotFoundException if user is not found", async () => {
      (prismaService.user.findUnique as jest.Mock).mockResolvedValue(null);

      await expect(service.findOne("1")).rejects.toThrow(
        new NotFoundException(`User with ID 1 not found`),
      );
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const updateUserDto: UpdateUserDto = {
        name: "Updated User",
        email: "updated@example.com",
      };

      (prismaService.user.update as jest.Mock).mockResolvedValue({
        message: "User updated",
      });

      const result = await service.update("1", updateUserDto);
      expect(result).toEqual({ message: "User updated" });
    });

    it("should throw NotFoundException if user does not exist", async () => {
      (prismaService.user.update as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      await expect(
        service.update("1", { email: "test@example.com" }),
      ).rejects.toThrow(new NotFoundException(`User with ID 1 not found`));
    });

    it("should throw ConflictException if email already exists", async () => {
      (prismaService.user.update as jest.Mock).mockRejectedValue({
        code: "P2002",
      });

      await expect(
        service.update("1", { email: "test@example.com" }),
      ).rejects.toThrow(
        new ConflictException(
          `User with email test@example.com already exists`,
        ),
      );
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      (prismaService.user.delete as jest.Mock).mockResolvedValue({
        message: "User deleted",
      });

      const result = await service.delete("1");
      expect(result).toEqual({ message: "User deleted" });
    });

    it("should throw NotFoundException if user does not exist", async () => {
      (prismaService.user.delete as jest.Mock).mockRejectedValue({
        code: "P2025",
      });

      await expect(service.delete("1")).rejects.toThrow(
        new NotFoundException(`User with ID 1 not found`),
      );
    });
  });
});
