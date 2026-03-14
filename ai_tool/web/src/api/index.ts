import axios from 'axios'
import { useSettingsStore } from '../stores/settings'
import type { AnalysisResponse, GenerateCopyRequest, AmazonCopy } from '../types'

/**
 * API 基础地址：
 *  - 生产/服务器部署：设置 VITE_API_BASE_URL=http://your-server:3001，直接请求后端
 *  - 本地开发：留空，走 Vite proxy（/api → localhost:3001），避免跨域
 */
const API_BASE = (import.meta.env.VITE_API_BASE_URL as string)
  ? `${(import.meta.env.VITE_API_BASE_URL as string).replace(/\/$/, '')}/api`
  : '/api'

const http = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: { 'Content-Type': 'application/json' }
})

// 响应拦截器
http.interceptors.response.use(
  response => response.data,
  error => {
    const msg = error.response?.data?.message || error.message || '请求失败'
    return Promise.reject(new Error(msg))
  }
)

function getAIConfig() {
  return useSettingsStore().aiConfig
}

/** 分析竞品链接，提取关键词和卖点 */
export async function analyzeCompetitors(urls: string[]): Promise<AnalysisResponse> {
  return http.post('/analyze', { urls, aiConfig: getAIConfig() })
}

/** 生成 Amazon 产品文案 */
export async function generateAmazonCopy(params: GenerateCopyRequest): Promise<AmazonCopy> {
  return http.post('/generate', { ...params, aiConfig: getAIConfig() })
}

export default http
