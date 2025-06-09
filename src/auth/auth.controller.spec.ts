// auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signup: jest.fn(() => () => {}),
            signin: jest.fn(() =>
              Promise.resolve({ accessToken: 'testToken' }),
            ),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  describe('signUp', () => {
    it('should call AuthService.signup with correct params', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'test',
        password: 'test123',
      };
      await authController.signUp(authCredentialsDto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(authService.signup).toHaveBeenCalledWith(authCredentialsDto);
    });
  });

  describe('signIn', () => {
    it('should return an access token', async () => {
      const authCredentialsDto: AuthCredentialsDto = {
        username: 'test',
        password: 'test123',
      };
      const result = await authController.signIn(authCredentialsDto);
      expect(result).toEqual({ accessToken: 'testToken' });
    });
  });
});
