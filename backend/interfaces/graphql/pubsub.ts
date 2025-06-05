import { PubSub } from 'graphql-subscriptions';

// Create a singleton PubSub instance
export const pubsub = new PubSub();

// Define subscription events
export const SUBSCRIPTION_EVENTS = {
  ORDER_CREATED: 'ORDER_CREATED',
  ORDER_UPDATED: 'ORDER_UPDATED',
  ORDER_STATUS_CHANGED: 'ORDER_STATUS_CHANGED',
} as const;