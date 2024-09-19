import { JwtService } from "@nestjs/jwt";
import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";

describe("AuthService", () => {
  let authService: AuthService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
          },
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it("should be defined", () => {
    expect(authService).toBeDefined();
  });

  describe("login", () => {
    it("should return an access token", async () => {
      const mockUser = {
        email: "example@email.com",
        password: "Aa12345678.",
      };
      const mockToken = "jwtToken";

      (jwtService.sign as jest.Mock).mockReturnValue(mockToken);

      const result = await authService.login(mockUser);
      expect(result).toEqual({
        access_token: mockToken,
      });
      expect(jwtService.sign).toHaveBeenCalledWith({
        email: "example@email.com",
        password: "Aa12345678.",
      });
    });
  });
});
