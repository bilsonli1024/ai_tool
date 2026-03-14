import { Router, Request, Response } from 'express'
import { analyzeCompetitors, generateAmazonCopy, testConnection, checkModelAccess, resolveAIConfig } from '../services/aiService'
import type { AIConfig } from '../services/aiService'
import { generateSceneImage } from '../services/imageService'
import { readProjects, saveProject, getProject, deleteProject } from '../services/storageService'

const router = Router()

// ===== AI 文案接口 =====

/** POST /api/analyze */
router.post('/analyze', async (req: Request, res: Response) => {
  try {
    const { urls, aiConfig } = req.body as { urls?: unknown; aiConfig?: Partial<AIConfig> }
    if (!Array.isArray(urls) || urls.length === 0) {
      res.status(400).json({ message: '请提供至少一个竞品链接' }); return
    }
    if (urls.length > 5) { res.status(400).json({ message: '最多支持 5 个链接' }); return }
    const valid = (urls as string[]).filter(u => typeof u === 'string' && u.toLowerCase().includes('amazon'))
    if (!valid.length) { res.status(400).json({ message: '请提供有效的亚马逊链接' }); return }

    const config = resolveAIConfig(aiConfig)
    console.log(`[AI] 分析 ${valid.length} 个竞品 · 模型: ${config.model}`)
    const result = await analyzeCompetitors(valid, config)
    res.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '分析失败'
    console.error('[AI] 分析出错:', msg)
    res.status(500).json({ message: msg })
  }
})

/** POST /api/generate */
router.post('/generate', async (req: Request, res: Response) => {
  try {
    const { selectedKeywords, selectedSellingPoints, ownSellingPoints, aiConfig } = req.body as {
      selectedKeywords?: string[]; selectedSellingPoints?: string[]
      ownSellingPoints?: string[]; aiConfig?: Partial<AIConfig>
    }
    const hasContent = [selectedKeywords, selectedSellingPoints, ownSellingPoints].some(a => a?.length)
    if (!hasContent) { res.status(400).json({ message: '请至少提供关键词或卖点' }); return }

    const config = resolveAIConfig(aiConfig)
    console.log(`[AI] 生成文案 · 模型: ${config.model}`)
    const result = await generateAmazonCopy(
      { selectedKeywords: selectedKeywords || [], selectedSellingPoints: selectedSellingPoints || [], ownSellingPoints: ownSellingPoints || [] },
      config
    )
    res.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '生成失败'
    res.status(500).json({ message: msg })
  }
})

/** POST /api/test-connection */
router.post('/test-connection', async (req: Request, res: Response) => {
  try {
    const { apiKey, baseURL, model } = req.body as { apiKey?: string; baseURL?: string; model?: string }
    if (!apiKey) { res.status(400).json({ success: false, message: 'API Key 不能为空' }); return }
    const config = resolveAIConfig({ apiKey, baseURL, model })
    const result = await testConnection(config)
    res.json(result)
  } catch (e: unknown) {
    res.json({ success: false, message: e instanceof Error ? e.message : '测试失败' })
  }
})

/** POST /api/check-model-access - 检查特定模型的访问权限 */
router.post('/check-model-access', async (req: Request, res: Response) => {
  try {
    const { apiKey, baseURL, model, targetModel } = req.body as { 
      apiKey?: string
      baseURL?: string
      model?: string
      targetModel?: string
    }
    if (!apiKey) { res.status(400).json({ success: false, message: 'API Key 不能为空' }); return }
    const config = resolveAIConfig({ apiKey, baseURL, model })
    const modelToCheck = targetModel || config.model
    const result = await checkModelAccess(config, modelToCheck)
    res.json(result)
  } catch (e: unknown) {
    res.json({ success: false, message: e instanceof Error ? e.message : '检查失败' })
  }
})

// ===== 图片生成接口 =====

/** POST /api/generate-images — 生成单张场景图片 */
router.post('/generate-images', async (req: Request, res: Response) => {
  try {
    const { title, bulletPoints, description, productImages, apiKey, scene } = req.body as {
      title?: string
      bulletPoints?: string[]
      description?: string
      productImages?: string[]
      apiKey?: string
      scene?: { key: string; name: string; prompt: string }
    }

    if (!title) { res.status(400).json({ message: '产品标题不能为空' }); return }
    if (!scene) { res.status(400).json({ message: '场景参数缺失' }); return }
    if (!apiKey) { res.status(400).json({ message: 'Gemini API Key 未提供' }); return }

    console.log(`[Image] 生成场景: ${scene.name}`)
    const result = await generateSceneImage({
      apiKey,
      title: title || '',
      bulletPoints: bulletPoints || [],
      description: description || '',
      productImages: productImages || [],
      scene
    })

    res.json(result)
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : '图片生成失败'
    console.error('[Image] 错误:', msg)
    res.status(500).json({ message: msg })
  }
})

// ===== 项目 CRUD =====

router.get('/projects', (_req, res) => { try { res.json(readProjects()) } catch { res.status(500).json({ message: '读取失败' }) } })

router.post('/projects', (req, res) => {
  try {
    const p = req.body as Record<string, unknown>
    if (!p.id) { res.status(400).json({ message: '项目 ID 缺失' }); return }
    saveProject(p); res.json({ success: true })
  } catch { res.status(500).json({ message: '保存失败' }) }
})

router.get('/projects/:id', (req, res) => {
  try {
    const p = getProject(req.params.id)
    if (!p) { res.status(404).json({ message: '项目不存在' }); return }
    res.json(p)
  } catch { res.status(500).json({ message: '获取失败' }) }
})

router.delete('/projects/:id', (req, res) => {
  try { deleteProject(req.params.id); res.json({ success: true }) }
  catch { res.status(500).json({ message: '删除失败' }) }
})

export default router
