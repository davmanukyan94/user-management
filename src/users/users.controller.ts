import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from "@nestjs/swagger";
import * as bcrypt from "bcrypt";
import { randomUUID } from "crypto";
import { AuthGuard } from "../auth/auth.guard";
import { SALT } from "../config/constants";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import { UsersService } from "./users.service";

@ApiTags("Users")
@ApiBearerAuth("access-token")
@Controller("users")
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: "Create user" })
  @ApiBody({ type: CreateUserDto })
  @ApiCreatedResponse({ description: "User successful created" })
  @ApiConflictResponse({ description: "User already exists" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiOkResponse({
    example: {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "example@email.com",
      password: bcrypt.hashSync("example_password", SALT),
      name: "name",
    },
  })
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @ApiOperation({ summary: "Get all users" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiOkResponse({
    example: [
      {
        id: randomUUID(),
        createdAt: new Date(),
        updatedAt: new Date(),
        email: "example@email.com",
        password: bcrypt.hashSync("example_password", SALT),
        name: "name",
      },
    ],
  })
  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @ApiOperation({ summary: "Get user by id" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiOkResponse({
    example: {
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      email: "example@email.com",
      password: bcrypt.hashSync("example_password", SALT),
      name: "name",
    },
  })
  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @ApiOperation({ summary: "Update user" })
  @ApiBody({ type: UpdateUserDto })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Email already exists" })
  @ApiOkResponse({ example: { message: "User updated" } })
  @Put(":id")
  update(@Param("id") id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOperation({ summary: "Delete user" })
  @ApiUnauthorizedResponse({ description: "Unauthorized" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiOkResponse({ example: { message: "User deleted" } })
  @Delete(":id")
  delete(@Param("id") id: string) {
    return this.usersService.delete(id);
  }
}
