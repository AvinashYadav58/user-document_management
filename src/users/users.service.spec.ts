import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../auth/user.entity';
import { Repository } from 'typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const user: User = {
        id: '1',
        username: 'testUser',
        password: 'testPassword',
        role: UserRole.Editor,
      };
      mockUserRepository.findOne.mockResolvedValue(user);

      const result = await usersService.getUser('1');
      expect(result).toBe(user);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getUser('1')).rejects.toThrow(
        new NotFoundException('User with ID "1" not found.'),
      );
    });

    it('should throw error for invalid ID format', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(usersService.getUser('')).rejects.toThrow(
        new NotFoundException('User with ID "" not found.'),
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users: User[] = [
        {
          id: '1',
          username: 'user1',
          password: 'password1',
          role: UserRole.Editor,
        },
        {
          id: '2',
          username: 'user2',
          password: 'password2',
          role: UserRole.Admin,
        },
      ];
      mockUserRepository.find.mockResolvedValue(users);

      const result = await usersService.getAllUsers();
      expect(result).toBe(users);
      expect(mockUserRepository.find).toHaveBeenCalledTimes(1);
    });

    it('should return an empty array if no users found', async () => {
      mockUserRepository.find.mockResolvedValue([]);

      const result = await usersService.getAllUsers();
      expect(result).toEqual([]);
    });
  });

  describe('updateUserRole', () => {
    it('should update the user role', async () => {
      const user: User = {
        id: '1',
        username: 'testUser',
        password: 'testPassword',
        role: UserRole.Editor,
      };
      const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.Admin };

      mockUserRepository.findOne.mockResolvedValue(user);
      mockUserRepository.save.mockResolvedValue({
        ...user,
        role: UserRole.Admin,
      });

      const result = await usersService.updateUserRole('1', updateUserRoleDto);
      expect(result).toEqual({ ...user, role: UserRole.Admin });
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...user,
        role: UserRole.Admin,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.Admin };

      await expect(
        usersService.updateUserRole('1', updateUserRoleDto),
      ).rejects.toThrow(new NotFoundException('User with ID "1" not found.'));
    });

    // it('should throw error for invalid role format', async () => {
    //   const user: User = { id: '1', username: 'testUser', password: 'testPassword', role: UserRole.Editor };
    //   const invalidRoleDto = { role: 'InvalidRole' } as unknown as UpdateUserRoleDto;

    //   mockUserRepository.findOne.mockResolvedValue(user);

    //   await expect(usersService.updateUserRole('1', invalidRoleDto)).rejects.toThrow(
    //     new NotFoundException('Invalid role provided.'),
    //   );
    // });

    it('should throw error for invalid role format', async () => {
      const user: User = {
        id: '1',
        username: 'testUser',
        password: 'testPassword',
        role: UserRole.Editor,
      };
      const invalidRoleDto = {
        role: 'InvalidRole',
      } as unknown as UpdateUserRoleDto;

      mockUserRepository.findOne.mockResolvedValue(user);

      await expect(
        usersService.updateUserRole('1', invalidRoleDto),
      ).rejects.toThrow(new BadRequestException('Invalid role provided.'));
    });
  });
});
