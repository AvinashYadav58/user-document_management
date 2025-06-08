import {
  Controller,
  Get,
  Patch,
  UseGuards,
  Body,
  Param,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserRoleDto } from './dto/update-user-role.dto';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../auth/get-user.decorator'; // Import GetUser from auth module
import { User, UserRole } from '../auth/user.entity';
import { Roles } from 'src/auth/roles.decorator';

@Controller('users')
@UseGuards(AuthGuard()) // Ensure only authenticated users can access these endpoints
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('profile')
  getProfile(@GetUser() user: User): User {
    return user;
  }

  @Get(':id/user')
  @Roles( UserRole.Admin)
  async getUser(@Param('id') id: string,): Promise<User> {
    return this.usersService.getUser(id);
  }

  @Get()
  @Roles(UserRole.Admin)
  async getAllUsers(): Promise<User[]> {
    return this.usersService.getAllUsers();
  }

  @Patch(':id/role')
  @Roles(UserRole.Admin)
  async updateUserRole(
    @Param('id') id: string,
    @Body() updateUserRoleDto: UpdateUserRoleDto,
  ): Promise<User> {
    return this.usersService.updateUserRole(id, updateUserRoleDto);
  }
}
