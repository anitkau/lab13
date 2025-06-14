import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'
import { glob } from 'node:fs/promises'

const __dirname = dirname(fileURLToPath(import.meta.url))

const inputs = [];

for await (const entry of glob('**/*.html')) {
  console.log(resolve(__dirname, entry));
  inputs.push(resolve(__dirname, entry));
}

export default defineConfig({
  plugins: [],
  root: __dirname,
  build: {
    emptyOutDir: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        login: resolve(__dirname, 'login/index.html'),
      },
    },
    outDir: resolve(__dirname, 'dist'),
  },
})
