import { Injectable, Logger } from '@nestjs/common';
import type { WebhookEvent, UserJSON, UserDeletedJSON } from '@clerk/backend';
import { UsersService } from '../users/users.service';

@Injectable()
export class ClerkWebhookService {
  private readonly logger = new Logger(ClerkWebhookService.name);

  constructor(private readonly usersService: UsersService) {}

  async processEvent(event: WebhookEvent): Promise<void> {
    switch (event.type) {
      case 'user.created':
        await this.handleUserCreated(event.data);
        break;

      case 'user.updated':
        await this.handleUserUpdated(event.data);
        break;

      case 'user.deleted':
        await this.handleUserDeleted(event.data);
        break;

      default:
        this.logger.debug(`Unhandled webhook event type: ${event.type}`);
    }
  }

  private async handleUserCreated(data: UserJSON): Promise<void> {
    const email = this.extractPrimaryEmail(data);
    if (!email) {
      this.logger.warn(`user.created: no email for clerk_id=${data.id}`);
      return;
    }

    await this.usersService.upsert({ clerkId: data.id, email });
    this.logger.log(`user.created: clerk_id=${data.id} email=${email}`);
  }

  private async handleUserUpdated(data: UserJSON): Promise<void> {
    const email = this.extractPrimaryEmail(data);
    if (!email) {
      this.logger.warn(`user.updated: no email for clerk_id=${data.id}`);
      return;
    }

    try {
      await this.usersService.updateByClerkId(data.id, { email });
      this.logger.log(`user.updated: clerk_id=${data.id}`);
    } catch {
      // User may not exist in our DB yet (webhook delivery race condition) —
      // upsert creates the record so subsequent requests work.
      await this.usersService.upsert({ clerkId: data.id, email });
      this.logger.warn(`user.updated: clerk_id=${data.id} not found, created as fallback`);
    }
  }

  private async handleUserDeleted(data: UserDeletedJSON): Promise<void> {
    if (!data.id) {
      this.logger.warn('user.deleted: webhook missing user id, skipping');
      return;
    }

    await this.usersService.deleteByClerkId(data.id);
    this.logger.log(`user.deleted: clerk_id=${data.id}`);
  }

  private extractPrimaryEmail(data: UserJSON): string | null {
    const primary = data.email_addresses.find(
      (e) => e.id === data.primary_email_address_id,
    );
    return (
      primary?.email_address ??
      data.email_addresses[0]?.email_address ??
      null
    );
  }
}
