import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User, UserRole } from '../auth/user.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: jest.Mocked<UsersService>;

  const mockUsersService = {
    getUser: jest.fn(),
    getAllUsers: jest.fn(),
    updateUserRole: jest.fn(),
    removeUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return profile of logged in user', () => {
    const mockUser = {
      id: '1',
      email: 'test@test.com',
      username: 'testuser',
      password: 'password123',
      role: UserRole.Admin,
    } as User;

    expect(controller.getProfile(mockUser)).toEqual(mockUser);
  });

  describe('getUser', () => {
    it('should return a user by ID', async () => {
      const mockUser = { id: '1' } as User;
      usersService.getUser.mockResolvedValue(mockUser);

      expect(await controller.getUser('1')).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found', async () => {
      usersService.getUser.mockRejectedValue(new NotFoundException());

      await expect(controller.getUser('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const mockUsers = [{ id: '1' }, { id: '2' }] as User[];
      usersService.getAllUsers.mockResolvedValue(mockUsers);

      expect(await controller.getAllUsers()).toEqual(mockUsers);
    });

    it('should handle service error when fetching users', async () => {
      usersService.getAllUsers.mockRejectedValue(new Error('DB Error'));

      await expect(controller.getAllUsers()).rejects.toThrow('DB Error');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role', async () => {
      const mockUser = { id: '1', role: UserRole.Admin } as User;
      const dto: UpdateUserRoleDto = { role: UserRole.Admin };

      usersService.updateUserRole.mockResolvedValue(mockUser);

      expect(await controller.updateUserRole('1', dto)).toEqual(mockUser);
    });

    it('should throw NotFoundException when user not found for role update', async () => {
      const dto: UpdateUserRoleDto = { role: UserRole.Editor };
      usersService.updateUserRole.mockRejectedValue(new NotFoundException());

      await expect(controller.updateUserRole('999', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException for invalid role', async () => {
      const dto = { role: 'invalid' as UserRole };
      usersService.updateUserRole.mockRejectedValue(new BadRequestException());

      await expect(controller.updateUserRole('1', dto)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const result = { message: 'User with ID "1" deleted successfully.' };
      usersService.removeUser.mockResolvedValue(result);

      expect(await controller.deleteUser('1')).toEqual(result);
    });

    it('should throw NotFoundException when deleting a non-existing user', async () => {
      usersService.removeUser.mockRejectedValue(new NotFoundException());

      await expect(controller.deleteUser('999')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
