import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.ico", "robots.txt", "icons/*.png"],

      manifest: {
        name: "FlowClicker - Full Onchain Game",
        short_name: "FlowClicker",
        description: "Earn $FLOW tokens with each click on ANDE Network. Full onchain clicker game with country competition.",
        theme_color: "#8b5cf6",
        background_color: "#0f172a",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",
        categories: ["games", "entertainment"],

        icons: [
          {
            src: "/icons/icon-72x72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-96x96.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-128x128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-144x144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-152x152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-384x384.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any"
          },
          {
            src: "/icons/icon-maskable-192x192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "maskable"
          },
          {
            src: "/icons/icon-maskable-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable"
          }
        ],

        shortcuts: [
          {
            name: "Start Playing",
            short_name: "Play",
            description: "Start playing FlowClicker",
            url: "/",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "Leaderboard",
            short_name: "Leaderboard",
            description: "View global leaderboard",
            url: "/?view=leaderboard",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
          }
        ],

        screenshots: [
          {
            src: "/screenshots/mobile-1.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          },
          {
            src: "/screenshots/desktop-1.png",
            sizes: "1920x1080",
            type: "image/png",
            form_factor: "wide"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],

        runtimeCaching: [
          {
            // Cache game images and assets - Cache First
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|avif)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "game-images",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // Static resources - Stale While Revalidate
            urlPattern: /\.(?:js|css|woff2?)$/,
            handler: "StaleWhileRevalidate",
            options: {
              cacheName: "static-resources",
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 7 * 24 * 60 * 60, // 7 days
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // RPC calls - Network First (must be fresh, but fallback to cache)
            urlPattern: /https:\/\/rpc\.ande\.network\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "rpc-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // API endpoints - Network First
            urlPattern: /\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              networkTimeoutSeconds: 3,
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 5 * 60, // 5 minutes
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            // MUD Indexer - Network First with short timeout
            urlPattern: /https:\/\/.*indexer.*\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "indexer-cache",
              networkTimeoutSeconds: 2,
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 1 * 60, // 1 minute
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],

        // Skip waiting and claim clients immediately for faster updates
        skipWaiting: true,
        clientsClaim: true,

        // Clean up old caches
        cleanupOutdatedCaches: true,

        // Increase max size for better caching
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
      },

      devOptions: {
        enabled: false, // Enable in dev if you want to test PWA
        type: "module",
      },
    }),
  ],

  server: {
    port: 3000,
    fs: {
      strict: false,
    },
  },

  build: {
    target: "es2022",
    minify: true,
    sourcemap: true,

    // Optimize bundle
    rollupOptions: {
      output: {
        manualChunks: {
          "vendor-react": ["react", "react-dom"],
          "vendor-motion": ["framer-motion"],
          "vendor-web3": ["viem", "wagmi"],
          "vendor-icons": ["lucide-react"],
        },
      },
    },

    chunkSizeWarningLimit: 1000,
  },

  resolve: {
    alias: {
      "@": "/src",
    },
  },
});
