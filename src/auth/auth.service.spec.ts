import { AuthService } from './auth.service';

import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

const mockUsersRepository = () => ({
  createUser: jest.fn(),
  findOne: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn(),
});

describe('AuthService', () => {
  let authService: AuthService;
  let usersRepository: ReturnType<typeof mockUsersRepository>;
  let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(() => {
    usersRepository = mockUsersRepository();
    jwtService = mockJwtService();
    authService = new AuthService(usersRepository as any, jwtService as any);
  });

  describe('signup', () => {
    it('calls usersRepository.createUser with correct args', async () => {
      const dto = { username: 'test', password: 'pass' };
      await authService.signup(dto);
      expect(usersRepository.createUser).toHaveBeenCalledWith(dto);
    });
  });

  describe('signin', () => {
    const dto = { username: 'test', password: 'pass' };

    it('throws NotFoundException if user not found', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      await expect(authService.signin(dto)).rejects.toThrow(NotFoundException);
    });

    it('throws UnauthorizedException if password does not match', async () => {
      usersRepository.findOne.mockResolvedValue({ password: 'hashed' });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(authService.signin(dto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('returns accessToken if password matches', async () => {
      usersRepository.findOne.mockResolvedValue({
        username: 'test',
        password: 'hashed',
        role: 'user',
      });
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      jwtService.sign.mockReturnValue('token');

      const result = await authService.signin(dto);
      expect(jwtService.sign).toHaveBeenCalledWith({
        username: 'test',
        role: 'user',
      });
      expect(result.accessToken).toEqual('token');
    });
  });
});
