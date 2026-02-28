import { CanActivate, ExecutionContext, Injectable, NotFoundException } from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../../database/drizzle.service';
import { quizzes } from '../../../database/entities/quizzes';
import type { AuthenticatedRequest } from '../../../common/guards/clerk-auth.guard';

/**
 * Ensures the authenticated user owns the quiz identified by the `:id` route param.
 *
 * Returns 404 (rather than 403) when the quiz doesn't belong to the user so that
 * IDs belonging to other users are indistinguishable from non-existent resources.
 *
 * Must be applied after ClerkAuthGuard (which attaches `request.user`).
 */
@Injectable()
export class QuizOwnerGuard implements CanActivate {
  constructor(private readonly drizzleService: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    const quizId = parseInt(request.params['id'] as string, 10);
    const userId = request.user.id;

    const [row] = await this.drizzleService.db
      .select({ id: quizzes.id })
      .from(quizzes)
      .where(and(eq(quizzes.id, quizId), eq(quizzes.createdBy, userId)))
      .limit(1);

    if (!row) throw new NotFoundException(`Quiz ${quizId} not found`);

    return true;
  }
}
