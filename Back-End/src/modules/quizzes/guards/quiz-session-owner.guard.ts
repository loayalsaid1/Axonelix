import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { eq, and } from 'drizzle-orm';
import { DrizzleService } from '../../../database/drizzle.service';
import { quizSessions } from '../../../database/entities/quiz-sessions';
import type { AuthenticatedRequest } from '../../../common/guards/clerk-auth.guard';

/**
 * Verifies that the authenticated user owns the quiz session identified by
 * the `:sessionId` route parameter.
 *
 * Must be placed AFTER ClerkAuthGuard so that `request.user` is already set:
 *
 * @example
 * \@UseGuards(ClerkAuthGuard, QuizSessionOwnerGuard)
 * \@Get(':sessionId')
 * findOne(@Param('sessionId', ParseIntPipe) sessionId: number, ...) { ... }
 *
 * Throws NotFoundException (404) when the session doesn't exist or belongs to
 * a different user — deliberately keeping the same error for both cases to
 * avoid leaking whether a given ID exists.
 */
@Injectable()
export class QuizSessionOwnerGuard implements CanActivate {
  constructor(private readonly drizzleService: DrizzleService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const userId = request.user?.id;
    const sessionId = parseInt(request.params['sessionId'] as string, 10);

    const session = await this.drizzleService.db.query.quizSessions.findFirst({
      where: and(
        eq(quizSessions.id, sessionId),
        eq(quizSessions.userId, userId),
      ),
      columns: { id: true },
    });

    if (!session) throw new NotFoundException(`Session ${sessionId} not found`);
    return true;
  }
}
