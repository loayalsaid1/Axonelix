/** Shape of a user row returned from the database. */
export interface UserRecord {
  id: number;
  clerkId: string;
  email: string;
  role: string;
  createdAt: string | null;
  updatedAt: string | null;
}
