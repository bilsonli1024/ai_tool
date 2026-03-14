import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig(({ mode }) => {
  // 加载 .env 文件中的环境变量
  const env = loadEnv(mode, process.cwd(), '')

  const devPort = parseInt(env.VITE_DEV_PORT || '5173', 10)
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://localhost:3001'

  return {
    plugins: [vue()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    server: {
      port: devPort,
      proxy: {
        // 开发环境：将 /api 请求转发到后端服务
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          // 可选：如后端路径含 /api 前缀则无需 rewrite
          // rewrite: (path) => path.replace(/^\/api/, '')
        }
      }
    }
  }
})
