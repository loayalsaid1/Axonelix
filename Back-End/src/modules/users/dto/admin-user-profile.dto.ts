import { Role } from '../../../common/enums';

export class AdminUserProfileDto {
  id: number;
  clerkId: string;
  email: string;
  role: Role;
  createdAt: string | null;
  firstName: string | null;
  lastName: string | null;
  imageUrl: string | null;
  lastSignInAt: Date | null;
}
