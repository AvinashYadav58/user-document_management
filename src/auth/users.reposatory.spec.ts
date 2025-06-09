import { DataSource } from 'typeorm';
import { UsersRepository } from './users.repository';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('UsersRepository', () => {
  let usersRepository: UsersRepository;

  beforeEach(() => {
    const dataSource = new DataSource({
      type: 'sqlite',
      database: ':memory:',
      entities: [],
      synchronize: true,
    });
    usersRepository = new UsersRepository(dataSource);
  });

  describe('createUser', () => {
    it('should hash password and save user', async () => {
      const saveMock = jest
        .spyOn(usersRepository, 'save')
        .mockResolvedValue({} as User);
      const createMock = jest
        .spyOn(usersRepository, 'create')
        .mockReturnValue({} as User);
      (jest.spyOn(bcrypt, 'genSalt') as jest.Mock).mockResolvedValue(
        'testSalt',
      );
      (jest.spyOn(bcrypt, 'hash') as jest.Mock).mockResolvedValue(
        'testHashedPassword',
      );

      const authCredentialsDto = { username: 'test', password: 'test123' };
      await usersRepository.createUser(authCredentialsDto);

      expect(createMock).toHaveBeenCalledWith({
        username: 'test',
        password: 'testHashedPassword',
      });
      expect(saveMock).toHaveBeenCalled();
    });

    it('should throw ConflictException if username already exists', async () => {
      jest.spyOn(usersRepository, 'save').mockRejectedValue({ code: '23505' });
      const authCredentialsDto = { username: 'test', password: 'test123' };

      await expect(
        usersRepository.createUser(authCredentialsDto),
      ).rejects.toThrow('username already exists');
    });
  });
});
