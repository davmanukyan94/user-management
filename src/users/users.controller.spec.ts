import {
  BadRequestException,
  ConflictException,
  NotFoundException,
  ValidationPipe,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AuthGuard } from "../auth/auth.guard";
import { SALT } from "../config/constants";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";

jest.mock("../auth/auth.guard", () => ({
  AuthGuard: jest.fn().mockImplementation(() => ({
    canActivate: jest.fn().mockReturnValue(true),
  })),
}));

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
          },
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  describe("create", () => {
    it("should create a user", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "StrongP@ss1",
        name: "Test User",
      };
      const expectedResult = {
        id: randomUUID(),
        ...createUserDto,
        password: bcrypt.hashSync("StrongP@ss1", SALT),
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(service, "create").mockResolvedValue(expectedResult);

      const result = await controller.create(createUserDto);
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it("should throw BadRequestException for weak password", async () => {
      const createUserDto: CreateUserDto = {
        email: "test@example.com",
        password: "weakpass",
        name: "Test User",
      };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      await expect(
        validationPipe.transform(createUserDto, {
          type: "body",
          metatype: CreateUserDto,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(service.create).not.toHaveBeenCalledWith(createUserDto);
    });

    it("should throw BadRequestException for wrong email format", async () => {
      const createUserDto: CreateUserDto = {
        email: "testexample.com",
        password: "StrongP@ss1",
        name: "Test User",
      };

      const validationPipe = new ValidationPipe({
        transform: true,
        whitelist: true,
        forbidNonWhitelisted: true,
      });

      await expect(
        validationPipe.transform(createUserDto, {
          type: "body",
          metatype: CreateUserDto,
        }),
      ).rejects.toThrow(BadRequestException);

      expect(service.create).not.toHaveBeenCalled();
    });

    it("should throw ConflictException for exists email", async () => {
      const createUserDto: CreateUserDto = {
        email: "exists@example.com",
        password: "StrongP@ss1",
        name: "Test User",
      };

      jest
        .spyOn(service, "create")
        .mockRejectedValue(new ConflictException("User already exists"));

      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );

      expect(service.create).toHaveBeenCalled();
    });
  });

  describe("findAll", () => {
    it("should return an array of users", async () => {
      const expectedResult = [
        {
          id: randomUUID(),
          email: "user1@example.com",
          name: "User 1",
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password123",
        },
        {
          id: randomUUID(),
          email: "user2@example.com",
          name: "User 2",
          createdAt: new Date(),
          updatedAt: new Date(),
          password: "password123",
        },
      ];

      jest.spyOn(service, "findAll").mockResolvedValue(expectedResult);

      expect(await controller.findAll()).toBe(expectedResult);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe("findOne", () => {
    it("should return a user by id", async () => {
      const userId = randomUUID();
      const expectedResult = {
        id: userId,
        email: "user@example.com",
        name: "User",
        createdAt: new Date(),
        updatedAt: new Date(),
        password: "password123",
      };

      jest.spyOn(service, "findOne").mockResolvedValue(expectedResult);

      expect(await controller.findOne(userId)).toBe(expectedResult);
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException for not found user", async () => {
      const userId = randomUUID();
      jest
        .spyOn(service, "findOne")
        .mockRejectedValue(new NotFoundException("User not found"));

      await expect(controller.findOne(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.findOne).toHaveBeenCalledWith(userId);
    });
  });

  describe("update", () => {
    it("should update a user", async () => {
      const userId = randomUUID();
      const updateUserDto: UpdateUserDto = {
        name: "Updated Name",
      };
      const expectedResult = { message: "User updated" };

      jest.spyOn(service, "update").mockResolvedValue(expectedResult);

      expect(await controller.update(userId, updateUserDto)).toBe(
        expectedResult,
      );
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it("should throw NotFoundException for not found user", async () => {
      const userId = randomUUID();
      const updateUserDto: UpdateUserDto = {
        name: "Updated Name",
      };

      jest
        .spyOn(service, "update")
        .mockRejectedValue(new NotFoundException("User not found"));

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });

    it("should throw ConflictException for exists email", async () => {
      const userId = randomUUID();
      const updateUserDto: UpdateUserDto = {
        email: "test@test.com",
      };

      jest
        .spyOn(service, "update")
        .mockRejectedValue(new ConflictException("Email already exists"));

      await expect(controller.update(userId, updateUserDto)).rejects.toThrow(
        ConflictException,
      );
      expect(service.update).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe("delete", () => {
    it("should delete a user", async () => {
      const userId = randomUUID();
      const expectedResult = { message: "User deleted" };

      jest.spyOn(service, "delete").mockResolvedValue(expectedResult);

      expect(await controller.delete(userId)).toBe(expectedResult);
      expect(service.delete).toHaveBeenCalledWith(userId);
    });

    it("should throw NotFoundException for not found user", async () => {
      const userId = randomUUID();

      jest
        .spyOn(service, "delete")
        .mockRejectedValue(new NotFoundException("User not found"));

      await expect(controller.delete(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(service.delete).toHaveBeenCalledWith(userId);
    });
  });
});
