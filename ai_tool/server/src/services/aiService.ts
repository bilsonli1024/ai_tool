import OpenAI from 'openai'
import dotenv from 'dotenv'

dotenv.config()

export interface AIConfig {
  apiKey: string
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
 * 从请求中提取 AI 配置，优先使用前端传来的，降级使用环境变量
 */
export function resolveAIConfig(requestConfig?: Partial<AIConfig>): AIConfig {
  return {
    apiKey: requestConfig?.apiKey || process.env.OPENAI_API_KEY || '',
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

  const response = await client.chat.completions.create({
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

  const response = await client.chat.completions.create({
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
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '连接失败'
    return { success: false, message: msg }
  }
}
