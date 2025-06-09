import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../auth/user.entity';
import { DeleteResult, Repository } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

const mockUserRepository = () => ({
  findOne: jest.fn(),
  find: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
});

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<Repository<User>>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useFactory: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUser', () => {
    it('should return user if found', async () => {
      const user = { id: '1', role: UserRole.Viewer } as User;
      userRepository.findOne.mockResolvedValue(user);

      expect(await service.getUser('1')).toEqual(user);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.getUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw DB error if findOne fails', async () => {
      userRepository.findOne.mockRejectedValue(new Error('DB error'));

      await expect(service.getUser('1')).rejects.toThrow('DB error');
    });
  });

  describe('getAllUsers', () => {
    it('should return all users', async () => {
      const users = [{ id: '1' }, { id: '2' }] as User[];
      userRepository.find.mockResolvedValue(users);

      expect(await service.getAllUsers()).toEqual(users);
    });

    it('should throw error if repository fails', async () => {
      userRepository.find.mockRejectedValue(new Error('Find failed'));

      await expect(service.getAllUsers()).rejects.toThrow('Find failed');
    });
  });

  describe('updateUserRole', () => {
    it('should update user role successfully', async () => {
      const user = { id: '1', role: UserRole.Viewer } as User;
      const dto: UpdateUserRoleDto = { role: UserRole.Admin };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockResolvedValue({ ...user, role: dto.role });

      const result = await service.updateUserRole('1', dto);

      expect(result.role).toBe(UserRole.Admin);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(userRepository.save).toHaveBeenCalledWith({
        ...user,
        role: dto.role,
      });
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateUserRole('1', { role: UserRole.Admin }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if role is invalid', async () => {
      const user = { id: '1', role: UserRole.Viewer } as User;
      userRepository.findOne.mockResolvedValue(user);

      await expect(
        service.updateUserRole('1', { role: 'INVALID' as UserRole }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw error if save fails', async () => {
      const user = { id: '1', role: UserRole.Editor } as User;
      const dto: UpdateUserRoleDto = { role: UserRole.Admin };

      userRepository.findOne.mockResolvedValue(user);
      userRepository.save.mockRejectedValue(new Error('Save failed'));

      await expect(service.updateUserRole('1', dto)).rejects.toThrow(
        'Save failed',
      );
    });
  });

  describe('removeUser', () => {
    it('should delete user if exists', async () => {
      const user = { id: '1' } as User;
      userRepository.findOne.mockResolvedValue(user);
      userRepository.delete.mockResolvedValue({ affected: 1 } as DeleteResult);

      const result = await service.removeUser('1');
      expect(result.message).toMatch(/deleted successfully/);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(service.removeUser('1')).rejects.toThrow(NotFoundException);
    });

    it('should throw error if delete fails', async () => {
      const user = { id: '1' } as User;
      userRepository.findOne.mockResolvedValue(user);
      userRepository.delete.mockRejectedValue(new Error('Delete failed'));

      await expect(service.removeUser('1')).rejects.toThrow('Delete failed');
    });
  });
});
