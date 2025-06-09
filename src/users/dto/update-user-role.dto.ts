import { IsEnum } from 'class-validator';
import { UserRole } from '../../auth/user.entity';

export class UpdateUserRoleDto {
  @IsEnum(UserRole, { message: 'Role must be one of Admin, Editor, Viewer' })
  role: UserRole;
}
