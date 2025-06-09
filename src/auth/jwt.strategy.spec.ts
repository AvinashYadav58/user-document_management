import { JwtStrategy } from './jwt.strategy';
import { UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersRepository } from './users.repository';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let usersRepository: Partial<UsersRepository>;

  beforeEach(() => {
    usersRepository = {
      findOne: jest.fn(),
    };

    strategy = new JwtStrategy(
      usersRepository as any,
      {
        get: jest.fn().mockReturnValue('testsecret'),
      } as any as ConfigService,
    );
  });

  describe('validate', () => {
    it('returns user if found', async () => {
      const mockUser = { username: 'test', role: 'user' };
      (usersRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await strategy.validate({
        username: 'test',
        role: 'user',
      });
      expect(result).toEqual(mockUser);
    });

    it('throws UnauthorizedException if user not found', async () => {
      (usersRepository.findOne as jest.Mock).mockResolvedValue(null);
      await expect(
        strategy.validate({ username: 'notfound', role: 'user' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
