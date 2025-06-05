import { pubsub, SUBSCRIPTION_EVENTS } from "../pubsub";

export const subscriptionResolvers = {
  Subscription: {
    orderCreated: {
      subscribe: () => pubsub.asyncIterableIterator([SUBSCRIPTION_EVENTS.ORDER_CREATED]),
    },
    orderUpdated: {
      subscribe: () => pubsub.asyncIterableIterator([SUBSCRIPTION_EVENTS.ORDER_UPDATED]),
    },
    orderStatusChanged: {
      subscribe: () => pubsub.asyncIterableIterator([SUBSCRIPTION_EVENTS.ORDER_STATUS_CHANGED]),
    },
  },
};