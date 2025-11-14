/**
 * GraphQL Client Configuration for MUD Indexer
 *
 * The MUD Indexer automatically syncs blockchain data to a PostgreSQL database
 * and exposes a GraphQL API for real-time queries and subscriptions.
 *
 * Default local: http://localhost:8080/graphql
 * Production: Configure via VITE_INDEXER_URL environment variable
 */

import { createClient, cacheExchange, fetchExchange, subscriptionExchange } from 'urql';
import { createClient as createWSClient } from 'graphql-ws';

// Get indexer URL from environment or use default
const INDEXER_HTTP_URL = import.meta.env.VITE_INDEXER_URL || 'http://localhost:8080/graphql';
const INDEXER_WS_URL = import.meta.env.VITE_INDEXER_WS_URL || 'ws://localhost:8080/graphql';

// Create WebSocket client for subscriptions (real-time updates)
const wsClient = createWSClient({
  url: INDEXER_WS_URL,
  connectionParams: {
    // Add authentication if needed
  },
  retryAttempts: 5,
  shouldRetry: () => true,
});

/**
 * URQL GraphQL Client
 * - Lightweight and performant
 * - Built-in caching
 * - Real-time subscriptions via WebSocket
 * - Perfect for MUD Indexer integration
 */
export const graphqlClient = createClient({
  url: INDEXER_HTTP_URL,
  exchanges: [
    cacheExchange,
    fetchExchange,
    subscriptionExchange({
      forwardSubscription(operation) {
        return {
          subscribe: (sink) => {
            const dispose = wsClient.subscribe(operation, sink);
            return {
              unsubscribe: dispose,
            };
          },
        };
      },
    }),
  ],
  // Request policy: cache-first for static data, network-only for real-time
  requestPolicy: 'cache-and-network',
});

export { INDEXER_HTTP_URL, INDEXER_WS_URL };
