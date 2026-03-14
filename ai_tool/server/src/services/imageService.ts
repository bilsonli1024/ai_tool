import { GoogleGenerativeAI, Part } from '@google/generative-ai'

export interface SceneRequest {
  key: string
  name: string    // 中文场景名
  prompt: string  // 英文场景描述
}

export interface ImageResult {
  base64: string
  mimeType: string
}

/**
 * 使用 Gemini gemini-2.0-flash-preview-image-generation 生成单张场景图片
 *
 * 如果用户上传了参考图片，会附带到 prompt 中让模型理解产品外观
 */
export async function generateSceneImage(params: {
  apiKey: string
  title: string
  bulletPoints: string[]
  description: string
  productImages: string[]  // base64 参考图片
  scene: SceneRequest
}): Promise<ImageResult> {
  const { apiKey, title, bulletPoints, description, productImages, scene } = params

  if (!apiKey) throw new Error('Gemini API Key 未配置')

  const genAI = new GoogleGenerativeAI(apiKey)

  // 使用支持图片生成的模型（responseModalities 在较新版 SDK 中已支持）
  const model = genAI.getGenerativeModel({
    model: 'gemini-2.0-flash-preview-image-generation',
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] } as object
  })

  // 构建 prompt
  const textPrompt = `Create a professional Amazon product marketing photo for the following product:

Product Title: ${title}

Key Features:
${bulletPoints.filter(Boolean).slice(0, 3).map((b, i) => `${i + 1}. ${b}`).join('\n')}

Scene: ${scene.prompt}

Requirements:
- High quality, professional Amazon product photography
- Clean, commercially appealing composition
- Well-lit with appropriate background for the scene
- No text or watermarks on the image
- Suitable for Amazon product listing

Generate a single high-quality ${scene.name} marketing image.`

  // 构建 parts（文本 + 可选参考图片）
  const parts: Part[] = []

  // 先加参考图片（帮助模型理解产品外观）
  if (productImages.length > 0) {
    parts.push({ text: 'Reference product images for visual context:' })
    const firstImage = productImages[0]
    parts.push({
      inlineData: {
        mimeType: 'image/jpeg',
        data: firstImage
      }
    })
    parts.push({ text: 'Based on the product above, ' + textPrompt })
  } else {
    parts.push({ text: textPrompt })
  }

  const result = await model.generateContent(parts)
  const response = result.response

  // 提取图片数据
  const candidates = response.candidates
  if (!candidates || candidates.length === 0) {
    throw new Error('Gemini 未返回图片结果')
  }

  for (const candidate of candidates) {
    for (const part of candidate.content.parts as Array<Record<string, unknown>>) {
      if (part['inlineData']) {
        const inline = part['inlineData'] as { data: string; mimeType: string }
        return { base64: inline.data, mimeType: inline.mimeType || 'image/png' }
      }
    }
  }

  throw new Error('Gemini 返回了文本但没有图片，请尝试重新生成')
}

