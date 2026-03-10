import {
  Controller,
  Post,
  HttpCode,
  HttpStatus,
  Logger,
  BadRequestException,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request as ExpressRequest } from 'express';
import { verifyWebhook } from '@clerk/backend/webhooks';
import type { WebhookEvent } from '@clerk/backend';
import { ClerkWebhookService } from './clerk-webhook.service';
import { IsPublic } from '../../common/decorators';

@IsPublic()
@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  private readonly webhookSecret: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly clerkWebhookService: ClerkWebhookService,
  ) {
    // Clerk Dashboard → Webhooks → endpoint → Signing Secret
    const secret = this.configService.get<string>('CLERK_WEBHOOK_SIGNING_SECRET');
    if (!secret) {
      throw new Error('CLERK_WEBHOOK_SIGNING_SECRET environment variable is not set');
    }
    this.webhookSecret = secret;
  }

  @Post('clerk/webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Req() req: RawBodyRequest<ExpressRequest>): Promise<{ received: boolean }> {
    const rawBody = req.rawBody;

    if (!rawBody) {
      throw new BadRequestException('Raw body is not available');
    }

    // Wrap the Express request in a Web API Request so verifyWebhook can
    // read headers and body using the standard fetch interfaces.
    const webRequest = new Request('https://webhook', {
      method: 'POST',
      headers: req.headers as Record<string, string>,
      body: rawBody.toString(),
    });

    let event: WebhookEvent;

    try {
      event = (await verifyWebhook(webRequest, {
        signingSecret: this.webhookSecret,
      })) as WebhookEvent;
    } catch (err) {
      this.logger.error('Webhook verification failed', err);
      throw new BadRequestException('Invalid webhook signature');
    }

    this.logger.debug(
      `Received webhook: type=${event.type} id=${'id' in event.data ? event.data.id : 'n/a'}`,
    );

    await this.clerkWebhookService.processEvent(event);

    return { received: true };
  }
}
