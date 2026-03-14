import express from 'express'
import dotenv from 'dotenv'
import apiRouter from './routes/api'

dotenv.config()

const app = express()
const PORT = parseInt(process.env.PORT || '3001', 10)
const HOST = process.env.HOST || '0.0.0.0'  // 0.0.0.0 = 监听所有网卡，服务器部署时可远程访问

// CORS 配置：CORS_ORIGINS=* 允许所有来源，否则只允许列表中的地址
const rawOrigins = process.env.CORS_ORIGINS || '*'
const allowAll = rawOrigins.trim() === '*'
const originList = allowAll ? [] : rawOrigins.split(',').map(o => o.trim()).filter(Boolean)

// 手动设置 CORS 头，比 cors 包更可靠，同时处理 preflight
app.use((req, res, next) => {
  const origin = req.headers.origin as string | undefined

  if (allowAll) {
    // 允许所有来源：不能用 * + credentials，改为回显请求的 Origin
    res.setHeader('Access-Control-Allow-Origin', origin || '*')
  } else {
    if (origin && originList.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin)
    }
  }

  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS,PATCH')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With')
  res.setHeader('Access-Control-Max-Age', '86400') // preflight 缓存 24 小时

  // OPTIONS 预检请求直接返回 200
  if (req.method === 'OPTIONS') {
    res.sendStatus(200)
    return
  }

  next()
})

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
