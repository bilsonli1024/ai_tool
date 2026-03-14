import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

export interface AIConfig {
  apiKey: string  // 仅从环境变量读取，不在接口中暴露
  baseURL: string
  model: string
}

export interface KeywordItem {
  text: string
  type: 'keyword' | 'attribute'
}

export interface AnalysisResult {
  keywords: KeywordItem[]
  sellingPoints: string[]
}

export interface AmazonCopy {
  title: string
  bulletPoints: string[]
  description: string
  searchTerms: string
}

/**
 * 从环境变量和请求中提取 AI 配置
 * API Key 只能从环境变量读取，不允许从前端传递
 * 模型和 baseURL 可以从前端选择，但会降级使用环境变量
 */
export function resolveAIConfig(requestConfig?: Partial<AIConfig>): AIConfig {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    throw new Error('API Key 未配置，请在服务器环境变量中设置 OPENAI_API_KEY')
  }
  return {
    apiKey,
    baseURL: requestConfig?.baseURL || process.env.OPENAI_BASE_URL || 'https://generativelanguage.googleapis.com/v1beta/openai/',
    model: requestConfig?.model || process.env.OPENAI_MODEL || 'gemini-2.0-flash'
  }
}

/**
 * 创建 OpenAI 兼容客户端
 */
function createClient(config: AIConfig): OpenAI {
  if (!config.apiKey) {
    throw new Error('API Key 未配置，请在右上角设置中配置 AI 模型')
  }
  return new OpenAI({
    apiKey: config.apiKey,
    baseURL: config.baseURL
  })
}

/**
 * 分析竞品链接，提取关键词和卖点
 */
export async function analyzeCompetitors(
  urls: string[],
  config: AIConfig
): Promise<AnalysisResult> {
  const client = createClient(config)
  const urlList = urls.map((u, i) => `${i + 1}. ${u}`).join('\n')

  const prompt = `你是一位亚马逊产品运营专家，精通亚马逊 SEO 和产品文案优化。

请分析以下亚马逊竞品链接，提取关键词和产品卖点：

${urlList}

请根据这些亚马逊产品链接（包含 ASIN、标题关键词等信息）以及你对亚马逊同类产品的专业知识，完成以下任务：

1. **提取关键词**：总结约 20 个高价值关键词，分为两类：
   - 搜索关键词（消费者搜索时常用的词）type: "keyword"
   - 属性词（描述产品特性、规格的词）type: "attribute"

2. **总结卖点**：提炼 8~12 个竞品核心卖点，每个卖点一句中文，简洁有力

请严格按照以下 JSON 格式返回，不要包含其他任何内容：
{
  "keywords": [
    {"text": "wireless headphones", "type": "keyword"},
    {"text": "bluetooth 5.3", "type": "attribute"}
  ],
  "sellingPoints": [
    "超长40小时续航，满足全天出行需求",
    "主动降噪技术，有效隔绝外界噪音"
  ]
}`

  let response
  try {
    response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是亚马逊产品运营专家，必须严格以 JSON 格式返回结果，不包含任何 markdown 代码块或其他内容。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: 'json_object' }
    })
  } catch (error: any) {
    // 处理 API 错误，提供更详细的错误信息
    const status = error?.status
    const errorDetail = error?.error?.message || error?.error || error?.message || ''
    
    if (status === 403) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      const troubleshootingSteps = config.model.includes('gemini')
        ? `\n\n🔧 403 错误排查（API 限制已配置但仍报错）：\n1. 检查应用程序限制：https://console.cloud.google.com/apis/credentials → API Key → "应用程序限制"设为"无"测试\n2. 确认 API 限制：只选择"Generative Language API"\n3. 检查模型名称：${config.model}\n4. 检查 baseURL：${config.baseURL}\n5. 尝试其他模型：gemini-1.5-flash`
        : ''
      throw new Error(`API 访问被拒绝 (403)。可能原因：1) API Key 无效或过期；2) API Key 没有权限访问该模型；3) 账户余额不足；4) baseURL 配置错误；5) 应用程序限制设置过严。${detail}${troubleshootingSteps}`)
    } else if (status === 401) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      throw new Error(`API Key 认证失败 (401)。请检查 API Key 是否正确。${detail}`)
    } else if (status === 429) {
      throw new Error('API 请求频率超限 (429)。请稍后再试。')
    } else if (status === 500 || status === 503) {
      throw new Error('API 服务暂时不可用。请稍后再试。')
    } else if (errorDetail) {
      throw new Error(`API 请求失败: ${errorDetail}`)
    } else if (error instanceof Error) {
      throw error
    }
    throw new Error('未知错误')
  }

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')

  try {
    const parsed = JSON.parse(content)
    return {
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      sellingPoints: Array.isArray(parsed.sellingPoints) ? parsed.sellingPoints : []
    }
  } catch {
    throw new Error('AI 返回格式解析失败，请重试')
  }
}

/**
 * 生成 Amazon 产品文案
 */
export async function generateAmazonCopy(
  params: {
    selectedKeywords: string[]
    selectedSellingPoints: string[]
    ownSellingPoints: string[]
  },
  config: AIConfig
): Promise<AmazonCopy> {
  const client = createClient(config)
  const { selectedKeywords, selectedSellingPoints, ownSellingPoints } = params

  const prompt = `你是一位专业的亚马逊文案专家，精通亚马逊 SEO 和高转化率英文文案写作。

请根据以下信息，生成一份完整的亚马逊英文产品 listing：

**目标关键词（必须自然融入文案）：**
${selectedKeywords.length ? selectedKeywords.join(', ') : '（无）'}

**竞品参考卖点：**
${selectedSellingPoints.length ? selectedSellingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') : '（无）'}

**我的产品独特卖点（重点突出）：**
${ownSellingPoints.length ? ownSellingPoints.map((p, i) => `${i + 1}. ${p}`).join('\n') : '（无）'}

请生成以下内容：

1. **Title（标题）**：
   - 150~200 字符
   - 格式：核心关键词 + 主要卖点 + 规格参数
   - 自然融入 3~5 个核心关键词

2. **Bullet Points（5点描述）**：
   - 必须恰好 5 条，bulletPoints 数组长度必须等于 5，绝对不能少于 5 条
   - 每条开头：全大写关键词（3~4个词）+ EM DASH（–）+ 具体说明
   - 每条 150~200 字符，以用户利益为核心
   - 第1条：核心功能/卖点；第2条：电池/续航/耐用；第3条：舒适/设计；第4条：兼容性/连接；第5条：保修/服务/品质保证

3. **Description（产品描述）**：
   - 1500~2000 字符
   - 吸引人的开篇，3~4 段
   - 讲述产品价值和使用场景
   - 自然融入关键词

4. **Search Terms（搜索词）**：
   - 总长不超过 250 字节
   - 词语用空格分隔，不加逗号
   - 不重复 Title 中已有的词
   - 包含长尾词、变体、同义词

请严格按照以下 JSON 格式返回，所有文案必须是英文：
{
  "title": "...",
  "bulletPoints": ["...", "...", "...", "...", "..."],
  "description": "...",
  "searchTerms": "..."
}`

  let response
  try {
    response = await client.chat.completions.create({
      model: config.model,
      messages: [
        {
          role: 'system',
          content: '你是专业亚马逊英文文案专家，必须严格以 JSON 格式返回结果，文案全部使用英文，不包含 markdown 标记。'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8,
      max_tokens: 3000,
      response_format: { type: 'json_object' }
    })
  } catch (error: any) {
    // 处理 API 错误，提供更详细的错误信息
    const status = error?.status
    const errorDetail = error?.error?.message || error?.error || error?.message || ''
    
    if (status === 403) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      const troubleshootingSteps = config.model.includes('gemini')
        ? `\n\n🔧 403 错误排查（API 限制已配置但仍报错）：\n1. 检查应用程序限制：https://console.cloud.google.com/apis/credentials → API Key → "应用程序限制"设为"无"测试\n2. 确认 API 限制：只选择"Generative Language API"\n3. 检查模型名称：${config.model}\n4. 检查 baseURL：${config.baseURL}\n5. 尝试其他模型：gemini-1.5-flash`
        : ''
      throw new Error(`API 访问被拒绝 (403)。可能原因：1) API Key 无效或过期；2) API Key 没有权限访问该模型；3) 账户余额不足；4) baseURL 配置错误；5) 应用程序限制设置过严。${detail}${troubleshootingSteps}`)
    } else if (status === 401) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      throw new Error(`API Key 认证失败 (401)。请检查 API Key 是否正确。${detail}`)
    } else if (status === 429) {
      throw new Error('API 请求频率超限 (429)。请稍后再试。')
    } else if (status === 500 || status === 503) {
      throw new Error('API 服务暂时不可用。请稍后再试。')
    } else if (errorDetail) {
      throw new Error(`API 请求失败: ${errorDetail}`)
    } else if (error instanceof Error) {
      throw error
    }
    throw new Error('未知错误')
  }

  const content = response.choices[0]?.message?.content
  if (!content) throw new Error('AI 返回内容为空')

  try {
    const parsed = JSON.parse(content)
    if (!parsed.title || !Array.isArray(parsed.bulletPoints)) {
      throw new Error('返回格式不完整')
    }
    // 严格保证 5 条，不足补空，多余截断
    const bullets: string[] = parsed.bulletPoints.slice(0, 5)
    while (bullets.length < 5) bullets.push(`QUALITY ASSURANCE – This product is backed by our quality guarantee, ensuring complete satisfaction with every purchase. Contact us anytime for support.`)
    return {
      title: parsed.title,
      bulletPoints: bullets,
      description: parsed.description || '',
      searchTerms: parsed.searchTerms || ''
    }
  } catch {
    throw new Error('AI 返回格式解析失败，请重试')
  }
}

/**
 * 测试连接：发送一个简单的 Hello 请求
 */
export async function testConnection(config: AIConfig): Promise<{ success: boolean; message: string }> {
  const client = createClient(config)

  try {
    const response = await client.chat.completions.create({
      model: config.model,
      messages: [{ role: 'user', content: 'Hi, reply "OK" only.' }],
      max_tokens: 10,
      temperature: 0
    })
    const reply = response.choices[0]?.message?.content || ''
    return { success: true, message: `连接成功，模型回复：${reply.trim()}` }
  } catch (error: any) {
    // 提供更详细的错误信息
    const status = error?.status
    const errorDetail = error?.error?.message || error?.error || error?.message || ''
    let msg = '连接失败'
    
    if (status === 403) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      const troubleshootingSteps = config.model.includes('gemini') 
        ? `\n\n🔧 403 错误排查步骤（API 限制已配置但仍报错）：\n1. 检查应用程序限制：访问 https://console.cloud.google.com/apis/credentials → 点击 API Key → 查看"应用程序限制"，临时设置为"无"测试\n2. 确认 API 限制：确保只选择了"Generative Language API"，没有其他限制\n3. 检查模型名称：确认是 ${config.model}（注意大小写和连字符）\n4. 检查 baseURL：确认是 ${config.baseURL}\n5. 尝试其他模型：如 gemini-1.5-flash 测试是否可用\n6. 检查配额：访问 https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas\n7. 验证 API Key：curl -H "X-Goog-Api-Key: YOUR_KEY" "https://generativelanguage.googleapis.com/v1/models"`
        : ''
      msg = `API 访问被拒绝 (403)。可能原因：1) API Key 无效或过期；2) API Key 没有权限访问该模型 (${config.model})；3) 账户余额不足；4) baseURL 配置错误；5) 应用程序限制设置过严。${detail}${troubleshootingSteps}`
    } else if (status === 401) {
      const detail = errorDetail ? ` 错误详情: ${errorDetail}` : ''
      msg = `API Key 认证失败 (401)。请检查 API Key 是否正确。${detail}`
    } else if (status === 429) {
      msg = 'API 请求频率超限 (429)。请稍后再试。'
    } else if (status === 500 || status === 503) {
      msg = 'API 服务暂时不可用。请稍后再试。'
    } else if (errorDetail) {
      msg = `连接失败: ${errorDetail}`
    } else if (error instanceof Error) {
      msg = error.message
    }
    return { success: false, message: msg }
  }
}

/**
 * 检查模型可用性：测试特定模型是否可以访问
 */
export async function checkModelAccess(config: AIConfig, modelName?: string): Promise<{ 
  success: boolean
  message: string
  model?: string
  available?: boolean
}> {
  const client = createClient(config)
  const modelToTest = modelName || config.model

  try {
    const response = await client.chat.completions.create({
      model: modelToTest,
      messages: [{ role: 'user', content: 'Test' }],
      max_tokens: 5,
      temperature: 0
    })
    return {
      success: true,
      message: `模型 ${modelToTest} 可以正常访问`,
      model: modelToTest,
      available: true
    }
  } catch (error: any) {
    const status = error?.status
    const errorDetail = error?.error?.message || error?.error || error?.message || ''
    
    if (status === 403) {
      return {
        success: false,
        message: `模型 ${modelToTest} 访问被拒绝 (403)。可能原因：1) API Key 没有权限访问此模型；2) 模型名称错误；3) 账户配额不足`,
        model: modelToTest,
        available: false
      }
    } else if (status === 404) {
      return {
        success: false,
        message: `模型 ${modelToTest} 不存在或不可用 (404)`,
        model: modelToTest,
        available: false
      }
    } else {
      return {
        success: false,
        message: `检查失败: ${errorDetail || error?.message || '未知错误'}`,
        model: modelToTest,
        available: false
      }
    }
  }
}
