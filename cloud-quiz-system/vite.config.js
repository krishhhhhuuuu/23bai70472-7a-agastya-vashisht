import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: [
      '@tensorflow/tfjs',
      '@tensorflow/tfjs-core',
      '@tensorflow/tfjs-converter',
      '@tensorflow/tfjs-backend-webgl',
      '@tensorflow/tfjs-backend-cpu',
      '@tensorflow-models/blazeface',
      '@tensorflow-models/coco-ssd',
    ],
  },
  build: {
    commonjsOptions: {
      exclude: [
        '@tensorflow/tfjs',
        '@tensorflow/tfjs-core',
        '@tensorflow/tfjs-converter',
        '@tensorflow-models/blazeface',
        '@tensorflow-models/coco-ssd',
      ],
    },
  },
})
