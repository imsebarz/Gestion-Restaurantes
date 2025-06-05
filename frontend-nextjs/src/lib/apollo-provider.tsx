'use client';

import { ApolloProvider } from '@apollo/client';
import client from './apollo-client';

export function ApolloProviderComponent({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ApolloProvider client={client}>{children}</ApolloProvider>;
}

// También exportar como default para compatibilidad
export default ApolloProviderComponent;