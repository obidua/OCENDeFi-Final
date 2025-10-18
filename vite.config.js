import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: false,
    hmr: {
      overlay: true,
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@tanstack/react-query',
      'wagmi',
      'viem',
      '@reown/appkit',
      '@reown/appkit-adapter-wagmi',
      '@reown/appkit/react',
      'zustand',
    ],
    force: true,
    esbuildOptions: {
      target: 'esnext',
      supported: {
        'top-level-await': true,
      },
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            if (id.includes('recharts') || id.includes('@mui')) {
              return 'vendor-charts';
            }
            if (id.includes('wagmi') || id.includes('viem')) {
              return 'vendor-web3-core';
            }
            if (id.includes('@reown') || id.includes('@rainbow-me') || id.includes('@walletconnect')) {
              return 'vendor-web3-ui';
            }
            if (id.includes('web3') && !id.includes('web3modal')) {
              return 'vendor-web3-lib';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query';
            }
            return 'vendor-other';
          }
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
})
