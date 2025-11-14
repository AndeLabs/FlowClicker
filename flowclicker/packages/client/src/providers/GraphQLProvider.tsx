import { ReactNode } from 'react';
import { Provider } from 'urql';
import { graphqlClient } from '../lib/graphql/client';

interface GraphQLProviderProps {
  children: ReactNode;
}

/**
 * GraphQLProvider Component
 * Wraps the app with URQL provider for MUD Indexer integration
 *
 * Features:
 * - Real-time blockchain data queries
 * - WebSocket subscriptions for live updates
 * - Optimized caching strategy
 * - Automatic connection management
 */
export function GraphQLProvider({ children }: GraphQLProviderProps) {
  return <Provider value={graphqlClient}>{children}</Provider>;
}
