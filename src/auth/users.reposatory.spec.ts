import { UsersRepository } from './users.repository';
import { DataSource } from 'typeorm';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  const mockManager = {
    save: jest.fn(),
  };

  const mockDataSource = {
    createEntityManager: () => mockManager,
  } as unknown as DataSource;

  beforeEach(() => {
    usersRepository = new UsersRepository(mockDataSource);
    usersRepository.create = jest
      .fn()
      .mockImplementation(
        (user: { username: string; password: string }) => user,
      );
    usersRepository.save = jest.fn();
  });

  describe('createUser', () => {
    const dto = { username: 'test', password: '1234' };

    it('should hash password and save user', async () => {
      (jest.spyOn(bcrypt, 'genSalt') as jest.Mock).mockResolvedValue('salt');
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue('hashed');
      await usersRepository.createUser(dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersRepository.create).toHaveBeenCalledWith({
        username: dto.username,
        password: 'hashed',
      });
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(usersRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException on duplicate username', async () => {
      usersRepository.save = jest.fn().mockRejectedValue({ code: '23505' });
      await expect(usersRepository.createUser(dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should throw InternalServerErrorException on other errors', async () => {
      usersRepository.save = jest.fn().mockRejectedValue({ code: '12345' });
      await expect(usersRepository.createUser(dto)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
