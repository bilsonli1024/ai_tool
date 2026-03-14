export type UrlStatus = 'pending' | 'analyzing' | 'done' | 'error'

export interface CompetitorUrl {
  id: string
  url: string
  status: UrlStatus
}

export interface Keyword {
  id: string
  text: string
  selected: boolean
  type: 'keyword' | 'attribute'
}

export interface SellingPoint {
  id: string
  text: string
  selected: boolean
  source: 'competitor' | 'own'
}

export interface AmazonCopy {
  title: string
  bulletPoints: string[] // 始终保证 5 条
  description: string
  searchTerms: string
}

export interface GeneratedImage {
  id: string
  scene: string        // 场景名称（中文）
  sceneEn: string      // 场景英文描述
  base64: string       // base64 图片数据
  mimeType: string
  status: 'pending' | 'generating' | 'done' | 'error'
  error?: string
}

export interface Project {
  id: string
  name: string
  createdAt: string
  updatedAt: string
  currentStep: number  // 1~3
  competitors: CompetitorUrl[]
  keywords: Keyword[]
  competitorSellingPoints: SellingPoint[]
  ownSellingPoints: string[]
  generatedCopy?: AmazonCopy
  generatedImages?: GeneratedImage[]
}

export interface AnalysisResponse {
  keywords: Array<{ text: string; type: 'keyword' | 'attribute' }>
  sellingPoints: string[]
}

export interface GenerateCopyRequest {
  selectedKeywords: string[]
  selectedSellingPoints: string[]
  ownSellingPoints: string[]
}

export interface GenerateImagesRequest {
  title: string
  bulletPoints: string[]
  description: string
  productImages: string[]  // base64 参考图片
  scenes?: string[]
  // apiKey 已移除，现在从服务器环境变量读取
}
