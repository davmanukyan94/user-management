import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, IsStrongPassword } from "class-validator";

export class CreateUserDto {
  @ApiProperty({ example: "name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "example@email.com" })
  @IsEmail({}, { message: "Email must be valid" })
  email: string;

  @ApiProperty({ example: "Aa12345678." })
  @IsStrongPassword(
    {
      minLength: 8,
      minLowercase: 1,
      minUppercase: 1,
      minNumbers: 1,
      minSymbols: 1,
    },
    {
      message:
        "Password must be at least 8 characters long, contain at least 1 lowercase letter, 1 uppercase letter, 1 number, and 1 symbol",
    },
  )
  password: string;
}
