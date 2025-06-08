import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

// Define an enum for the role
export enum UserRole {
  Admin = 'Admin',
  Editor = 'Editor',
  Viewer = 'Viewer',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({
    type: 'enum', 
    enum: UserRole,
    default: UserRole.Viewer, 
  })
  role: UserRole;
}