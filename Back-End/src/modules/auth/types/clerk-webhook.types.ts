/**
 * Re-export the Clerk webhook types we use throughout the auth module.
 * Import from here so there's a single place to update if the SDK changes.
 */
export type {
  WebhookEvent,
  WebhookEventType,
  UserWebhookEvent,
  UserJSON,
  UserDeletedJSON,
  EmailAddressJSON,
} from '@clerk/backend';
