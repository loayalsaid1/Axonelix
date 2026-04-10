import { users } from '../../../database/entities/users';

type UserRow = typeof users.$inferSelect;

export class AdminUserProfileDto {
  id!: UserRow['id'];
  clerkId!: UserRow['clerkId'];
  email!: UserRow['email'];
  role!: UserRow['role'];
  createdAt!: UserRow['createdAt'];
  firstName!: string | null;
  lastName!: string | null;
  imageUrl!: string | null;
  lastSignInAt!: Date | null;
}
