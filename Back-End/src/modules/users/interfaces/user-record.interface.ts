import { Role } from '../../../common/enums';

/** Shape of a user row returned from the database. */
export interface UserRecord {
  id: number;
  clerkId: string;
  email: string;
  role: Role;
  createdAt: string | null;
  updatedAt: string | null;
}
