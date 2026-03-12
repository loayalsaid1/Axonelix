import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Mark a route handler (or an entire controller) as publicly accessible.
 * The global ClerkAuthGuard will skip JWT verification for these routes.
 */
export const IsPublic = () => SetMetadata(IS_PUBLIC_KEY, true);
