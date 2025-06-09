import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/user.entity';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async getUser(id: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    return user; // Return an array to match the expected return type
  }

  async getAllUsers(): Promise<User[]> {
    return this.userRepository.find();
  }

  //   async updateUserRole(id: string, updateUserRoleDto: UpdateUserRoleDto): Promise<User> {
  //     const user = await this.userRepository.findOne({ where: { id } });

  //     if (!user) {
  //       throw new NotFoundException(`User with ID "${id}" not found.`);
  //     }

  //     user.role = updateUserRoleDto.role;
  //     await this.userRepository.save(user);

  //     return user;
  //   }

  async updateUserRole(
    id: string,
    updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found.`);
    }

    if (!Object.values(UserRole).includes(updateUserRoleDto.role)) {
      throw new BadRequestException('Invalid role provided.');
    }

    user.role = updateUserRoleDto.role;
    await this.userRepository.save(user);

    return user;
  }
}
