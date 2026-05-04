import { defineConfig } from 'vite'
import { crx } from '@crxjs/vite-plugin'
import manifest from './manifest.json'
import { resolve } from 'path'

export default defineConfig({
  plugins: [crx({ manifest })],
  build: {
    rollupOptions: {
      input: {
        content_styles: resolve(__dirname, 'src/content/styles/content.scss'),
        content_styles_202011: resolve(__dirname, 'src/content/styles/content202011.scss'),
        content_styles_202210: resolve(__dirname, 'src/content/styles/content202210.scss'),
      },
      output: {
        assetFileNames: 'assets/[name].[ext]',
      },
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
    },
  },
})
