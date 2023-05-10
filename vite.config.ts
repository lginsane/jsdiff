import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  base:"./", //设置项目的根目录
  build: {
    outDir: 'docs' // 打包文件的输出目录
  },
  plugins: [vue()],
  server:{
    proxy: {
      '/api': {
        target: 'http://localhost:8090/',
        changeOrigin: true,
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  },
  define: {
    'process.env': process.env
  }
})
