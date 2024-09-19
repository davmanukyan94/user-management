import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { SECONDS_IN_MINUTE } from "../config/constants";
import { UsersModule } from "../users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: SECONDS_IN_MINUTE * SECONDS_IN_MINUTE },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
