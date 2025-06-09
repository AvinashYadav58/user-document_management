import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from '../auth/user.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersModule', () => {
  let usersController: UsersController;
  let usersService: UsersService;
  let userRepository: Repository<User>;

  const mockUserRepository = {
    findOne: jest.fn(),
    find: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    usersController = module.get<UsersController>(UsersController);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('UsersService', () => {
    describe('getUser', () => {
      it('should return a user by ID', async () => {
        const user: User = {
          id: '1',
          username: 'testUser',
          password: 'testPass',
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
    });

    describe('getAllUsers', () => {
      it('should return all users', async () => {
        const users: User[] = [
          {
            id: '1',
            username: 'user1',
            password: 'pass1',
            role: UserRole.Editor,
          },
          {
            id: '2',
            username: 'user2',
            password: 'pass2',
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
          password: 'testPass',
          role: UserRole.Editor,
        };
        const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.Admin };

        mockUserRepository.findOne.mockResolvedValue(user);
        mockUserRepository.save.mockResolvedValue({
          ...user,
          role: UserRole.Admin,
        });

        const result = await usersService.updateUserRole(
          '1',
          updateUserRoleDto,
        );
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
    });
  });

  describe('UsersController', () => {
    describe('getProfile', () => {
      it('should return the current user profile', () => {
        const user: User = {
          id: '1',
          username: 'testUser',
          password: 'testPass',
          role: UserRole.Editor,
        };
        const result = usersController.getProfile(user);
        expect(result).toBe(user);
      });
    });

    describe('getUser', () => {
      it('should return a user by ID', async () => {
        const mockUser: User = {
          id: '1',
          username: 'testUser',
          password: 'testPass',
          role: UserRole.Editor,
        };
        jest.spyOn(usersService, 'getUser').mockResolvedValue(mockUser);

        const result = await usersController.getUser('1');
        expect(result).toBe(mockUser);
        expect(usersService.getUser).toHaveBeenCalledWith('1');
      });

      it('should throw a NotFoundException if the user is not found', async () => {
        jest
          .spyOn(usersService, 'getUser')
          .mockRejectedValue(new NotFoundException('User not found'));

        await expect(usersController.getUser('1')).rejects.toThrow(
          NotFoundException,
        );
      });
    });

    describe('getAllUsers', () => {
      it('should return a list of all users', async () => {
        const mockUsers: User[] = [
          {
            id: '1',
            username: 'user1',
            password: 'pass1',
            role: UserRole.Editor,
          },
          {
            id: '2',
            username: 'user2',
            password: 'pass2',
            role: UserRole.Admin,
          },
        ];
        jest.spyOn(usersService, 'getAllUsers').mockResolvedValue(mockUsers);

        const result = await usersController.getAllUsers();
        expect(result).toBe(mockUsers);
        expect(usersService.getAllUsers).toHaveBeenCalled();
      });

      it('should handle errors gracefully', async () => {
        jest
          .spyOn(usersService, 'getAllUsers')
          .mockRejectedValue(new Error('Database error'));

        await expect(usersController.getAllUsers()).rejects.toThrow(Error);
      });
    });

    describe('updateUserRole', () => {
      it('should update the role of an existing user', async () => {
        const updateUserRoleDto: UpdateUserRoleDto = { role: UserRole.Admin };
        const updatedUser: User = {
          id: '1',
          username: 'testUser',
          password: 'testPass',
          role: UserRole.Admin,
        };
        jest
          .spyOn(usersService, 'updateUserRole')
          .mockResolvedValue(updatedUser);

        const result = await usersController.updateUserRole(
          '1',
          updateUserRoleDto,
        );
        expect(result).toBe(updatedUser);
        expect(usersService.updateUserRole).toHaveBeenCalledWith(
          '1',
          updateUserRoleDto,
        );
      });

      it('should throw a NotFoundException if the user to update is not found', async () => {
        jest
          .spyOn(usersService, 'updateUserRole')
          .mockRejectedValue(new NotFoundException('User not found'));

        await expect(
          usersController.updateUserRole('1', { role: UserRole.Admin }),
        ).rejects.toThrow(NotFoundException);
      });

      it('should throw a BadRequestException for invalid role', async () => {
        const invalidRoleDto = {
          role: 'InvalidRole',
        } as unknown as UpdateUserRoleDto;
        jest.spyOn(usersService, 'updateUserRole').mockImplementation(() => {
          throw new BadRequestException('Invalid role provided');
        });

        await expect(
          usersController.updateUserRole('1', invalidRoleDto),
        ).rejects.toThrow(BadRequestException);
      });
    });
  });
});
