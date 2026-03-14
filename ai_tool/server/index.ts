import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import apiRouter from './routes/api'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'  // 0.0.0.0 = 监听所有网卡，服务器部署时可远程访问

// CORS 配置：
//   CORS_ORIGINS=*               → 允许所有来源（开发/内网部署推荐）
//   CORS_ORIGINS=https://a.com,https://b.com  → 只允许指定地址
//   不设置                       → 默认允许本地开发地址
const rawOrigins = process.env.CORS_ORIGINS || 'http://localhost:5173,http://localhost:3000,http://127.0.0.1:5173'
const allowAll = rawOrigins.trim() === '*'

app.use(cors({
  origin: allowAll
    ? '*'                          // 允许所有来源
    : (origin, callback) => {
        const list = rawOrigins.split(',').map(o => o.trim()).filter(Boolean)
        if (!origin || list.includes(origin)) {
          callback(null, true)
        } else {
          callback(new Error(`CORS 拒绝来自 ${origin} 的请求，请在 CORS_ORIGINS 中添加该地址`))
        }
      },
  credentials: !allowAll           // origin=* 时不能同时开启 credentials
}))

app.use(express.json({ limit: '20mb' }))  // 图片 base64 较大，适当调大
app.use(express.urlencoded({ extended: true }))

// 请求日志
app.use((req, _res, next) => {
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.path}`)
  next()
})

// API 路由
app.use('/api', apiRouter)

// 健康检查
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    host: `${HOST}:${PORT}`,
    corsOrigins: rawOrigins,
    aiConfigured: !!process.env.OPENAI_API_KEY
  })
})

// 404
app.use((_req, res) => {
  res.status(404).json({ message: '接口不存在' })
})

// 全局错误处理
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('服务器错误:', err.message)
  res.status(500).json({ message: err.message || '服务器内部错误' })
})

app.listen(PORT, HOST, () => {
  console.log(`
╔══════════════════════════════════════════════╗
║       Amazon 文案 AI 服务器启动成功            ║
╠══════════════════════════════════════════════╣
║  监听地址: ${HOST}:${PORT}
║  AI 配置:  ${process.env.OPENAI_API_KEY ? '✅ 已配置' : '❌ 未配置（请设置 .env）'}
║  模型:     ${process.env.OPENAI_MODEL || 'gemini-2.0-flash'}
║  CORS:     ${allowAll ? '✅ 允许所有来源 (*)' : rawOrigins}
╚══════════════════════════════════════════════╝
  `)
})

export default app
