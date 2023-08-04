import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import {resolve} from 'path'
// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    plugins: [
        vue(),
        UnoCSS()
    ],
    resolve: {
        alias: {
          '~': resolve(process.cwd()),
          '@': resolve(process.cwd(), './src')
        }
    },
    build: {
        emptyOutDir: false,
        watch: {}
    }
})
