import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  const mockAuthService = {
    signup: jest.fn(),
    signin: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: mockAuthService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it('should call signup on authService', async () => {
    const dto: AuthCredentialsDto = { username: 'user', password: '123' };
    await controller.signUp(dto);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(service.signup).toHaveBeenCalledWith(dto);
  });

  it('should call signin and return token', async () => {
    const dto: AuthCredentialsDto = { username: 'user', password: '123' };
    const token = { accessToken: 'jwt' };
    mockAuthService.signin.mockResolvedValue(token);
    const result = await controller.signIn(dto);
    expect(result).toEqual(token);
  });
});
