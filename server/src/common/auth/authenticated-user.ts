import { UserRole } from '@prisma/client';

export type AuthenticatedUser = {
  id: string;
  email: string;
  name: string | null;
  imageUrl: string | null;
  role: UserRole;
  isSuspended: boolean;
};
