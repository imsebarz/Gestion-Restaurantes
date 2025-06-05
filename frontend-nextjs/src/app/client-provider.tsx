'use client';

import { ApolloClient, InMemoryCache, createHttpLink, from, ApolloProvider, split } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { getMainDefinition } from '@apollo/client/utilities';

const httpLink = createHttpLink({
  uri: 'http://localhost:4000/graphql',
});

// WebSocket link para suscripciones
const wsLink = typeof window !== 'undefined' ? new GraphQLWsLink(createClient({
  url: 'ws://localhost:4000/graphql',
  connectionParams: () => {
    const token = localStorage.getItem('token');
    return {
      authorization: token ? `Bearer ${token}` : "",
    };
  },
  // Mejorar reconexión automática
  shouldRetry: () => true,
  retryAttempts: 5,
  retryWait: (retries) => {
    return new Promise((resolve) => {
      setTimeout(resolve, Math.min(1000 * Math.pow(2, retries), 30000));
    });
  },
  // Manejo de errores mejorado
  on: {
    connected: () => console.log('✅ WebSocket connected for subscriptions'),
    closed: () => console.log('❌ WebSocket connection closed'),
    error: (error) => console.error('WebSocket error:', error),
  },
})) : null;

const authLink = setContext((_, { headers }) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  
  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
      'content-type': 'application/json',
    }
  }
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.log(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) {
    console.log(`[Network error]: ${networkError}`);
    if (networkError.message.includes('Failed to fetch')) {
      console.error('Backend server is not running on http://localhost:4000/graphql');
    }
  }
});

// Split link to route queries/mutations to HTTP and subscriptions to WebSocket
const splitLink = typeof window !== 'undefined' && wsLink ? split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === 'OperationDefinition' &&
      definition.operation === 'subscription'
    );
  },
  wsLink,
  from([errorLink, authLink, httpLink])
) : from([errorLink, authLink, httpLink]);

// Export the client instance for direct access when needed
export const apolloClient = new ApolloClient({
  link: splitLink,
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          orders: {
            // Mejorar cache para actualizaciones en tiempo real
            merge(existing, incoming, { args }) {
              return incoming;
            },
          },
          items: {
            merge(_, incoming) {
              return incoming;
            },
          },
          tables: {
            // Mejorar cache para actualizaciones de mesas
            merge(existing, incoming, { args }) {
              return incoming;
            },
          },
        },
      },
      // Configuración específica para orders
      Order: {
        keyFields: ["id"],
      },
      Table: {
        keyFields: ["id"],
      },
      MenuItem: {
        keyFields: ["id"],
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
      // Permitir actualizaciones en tiempo real
      notifyOnNetworkStatusChange: true,
    },
    query: {
      errorPolicy: 'all',
    },
  },
});

export default function ClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={apolloClient}>{children}</ApolloProvider>;
}