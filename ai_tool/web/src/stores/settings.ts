import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export type AIProvider = 'deepseek' | 'openai' | 'gemini' | 'qwen' | 'moonshot' | 'custom'

export interface ProviderConfig {
  id: AIProvider
  name: string
  logo: string
  baseURL: string
  models: string[]
  defaultModel: string
  apiKeyPlaceholder: string
  docLink: string
  priceHint: string
  supportsImageGen: boolean // 是否支持图片生成
}

export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'deepseek',
    name: 'DeepSeek',
    logo: '🔷',
    baseURL: 'https://api.deepseek.com',
    models: ['deepseek-chat', 'deepseek-reasoner'],
    defaultModel: 'deepseek-chat',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    docLink: 'https://platform.deepseek.com/api_keys',
    priceHint: '价格极低，推荐首选',
    supportsImageGen: false
  },
  {
    id: 'openai',
    name: 'OpenAI',
    logo: '🤖',
    baseURL: 'https://api.openai.com/v1',
    models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    defaultModel: 'gpt-4o',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    docLink: 'https://platform.openai.com/api-keys',
    priceHint: '效果最佳，支持 DALL·E 图片生成',
    supportsImageGen: false // DALL-E 3 需要另外实现
  },
  {
    id: 'gemini',
    name: 'Google Gemini',
    logo: '✨',
    baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
    models: ['gemini-2.0-flash', 'gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-pro-preview-05-06'],
    defaultModel: 'gemini-2.0-flash',
    apiKeyPlaceholder: 'AIzaSyXXXXXXXXXXXXXXXXXXXXXXX',
    docLink: 'https://aistudio.google.com/app/apikey',
    priceHint: '免费额度大，支持图片生成（推荐）',
    supportsImageGen: true
  },
  {
    id: 'qwen',
    name: '通义千问',
    logo: '☁️',
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    models: ['qwen-plus', 'qwen-turbo', 'qwen-max'],
    defaultModel: 'qwen-plus',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    docLink: 'https://bailian.console.aliyun.com/',
    priceHint: '国内网络友好，中文能力强',
    supportsImageGen: false
  },
  {
    id: 'moonshot',
    name: 'Kimi（月之暗面）',
    logo: '🌙',
    baseURL: 'https://api.moonshot.cn/v1',
    models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'],
    defaultModel: 'moonshot-v1-32k',
    apiKeyPlaceholder: 'sk-xxxxxxxxxxxxxxxx',
    docLink: 'https://platform.moonshot.cn/console/api-keys',
    priceHint: '国内可用，长上下文支持好',
    supportsImageGen: false
  },
  {
    id: 'custom',
    name: '自定义接口',
    logo: '⚙️',
    baseURL: '',
    models: [],
    defaultModel: '',
    apiKeyPlaceholder: '你的 API Key',
    docLink: '',
    priceHint: '支持任何 OpenAI 兼容接口',
    supportsImageGen: false
  }
]

export interface AISettings {
  provider: AIProvider
  model: string
  customBaseURL: string
  customModel: string
}

const SETTINGS_KEY = 'amazon_copy_ai_settings'

export const useSettingsStore = defineStore('settings', () => {
  const settings = ref<AISettings>({
    provider: 'gemini',
    model: 'gemini-2.0-flash',
    customBaseURL: '',
    customModel: ''
  })

  const showSettingsDrawer = ref(false)

  function loadSettings(): void {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY)
      if (stored) settings.value = { ...settings.value, ...JSON.parse(stored) }
    } catch {}
  }

  function saveSettings(patch: Partial<AISettings>): void {
    settings.value = { ...settings.value, ...patch }
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings.value))
  }

  function switchProvider(providerId: AIProvider): void {
    const p = PROVIDERS.find(x => x.id === providerId)
    if (p) saveSettings({ provider: providerId, model: p.defaultModel })
  }

  const currentProvider = computed<ProviderConfig>(
    () => PROVIDERS.find(p => p.id === settings.value.provider) || PROVIDERS[0]
  )
  const effectiveBaseURL = computed<string>(() =>
    settings.value.provider === 'custom' ? settings.value.customBaseURL : currentProvider.value.baseURL
  )
  const effectiveModel = computed<string>(() =>
    settings.value.provider === 'custom' ? settings.value.customModel : settings.value.model
  )
  const isConfigured = computed<boolean>(() => {
    // API Key 现在从服务器环境变量读取，前端只需要配置模型即可
    if (settings.value.provider === 'custom')
      return !!(settings.value.customBaseURL && settings.value.customModel)
    return true
  })
  const supportsImageGen = computed<boolean>(() => currentProvider.value.supportsImageGen)
  const aiConfig = computed(() => ({
    // API Key 不再从前端传递，由服务器从环境变量读取
    baseURL: effectiveBaseURL.value,
    model: effectiveModel.value
  }))

  return {
    settings, showSettingsDrawer,
    loadSettings, saveSettings, switchProvider,
    currentProvider, effectiveBaseURL, effectiveModel,
    isConfigured, supportsImageGen, aiConfig
  }
})
