<template>
  <div class="image-gen">
    <div class="ig-header">
      <h4>🎨 AI 场景图片生成</h4>
      <p>上传产品参考图片，AI 将结合文案生成 7 张不同场景的营销图片</p>
      <el-alert v-if="!supportsImageGen" type="warning" :closable="false" style="margin-top: 8px">
        <template #title>
          当前模型（{{ currentModel }}）不支持图片生成。请在右上角 ⚙️ 切换为
          <strong>Google Gemini</strong> 后使用此功能。
        </template>
      </el-alert>
    </div>

    <!-- 上传区域 -->
    <div class="upload-section">
      <p class="section-label">📸 上传产品参考图片（可选，最多 4 张）</p>
      <el-upload
        v-model:file-list="fileList"
        action="#"
        list-type="picture-card"
        :auto-upload="false"
        :limit="4"
        accept="image/*"
        :on-change="handleFileChange"
        :on-remove="handleFileRemove"
      >
        <el-icon><Plus /></el-icon>
        <template #tip>
          <div class="upload-tip">支持 JPG/PNG，每张不超过 5MB</div>
        </template>
      </el-upload>
    </div>

    <!-- 场景列表 -->
    <div class="scenes-section">
      <p class="section-label">🎭 生成场景（点击取消/选择）</p>
      <div class="scene-tags">
        <div
          v-for="scene in SCENES"
          :key="scene.key"
          class="scene-tag"
          :class="{ 'scene-tag--on': selectedScenes.includes(scene.key) }"
          @click="toggleScene(scene.key)"
        >
          {{ scene.icon }} {{ scene.name }}
        </div>
      </div>
    </div>

    <!-- 生成按钮 -->
    <el-button
      type="primary"
      size="large"
      :loading="generating"
      :disabled="!supportsImageGen || selectedScenes.length === 0"
      style="width: 100%"
      @click="startGenerate"
    >
      <el-icon><MagicStick /></el-icon>
      {{ generating ? `生成中 ${doneCount}/${selectedScenes.length}...` : `生成 ${selectedScenes.length} 张场景图片` }}
    </el-button>

    <!-- 生成进度 -->
    <el-progress
      v-if="generating"
      :percentage="Math.round((doneCount / selectedScenes.length) * 100)"
      status="active"
    />

    <!-- 结果展示 -->
    <div v-if="images.length" class="images-grid">
      <div v-for="img in images" :key="img.id" class="image-card">
        <div class="image-card__scene">{{ img.scene }}</div>

        <div class="image-card__body">
          <el-icon v-if="img.status === 'generating'" :size="40" class="spin" color="#909399">
            <Loading />
          </el-icon>
          <el-icon v-else-if="img.status === 'error'" :size="40" color="#F56C6C">
            <CircleCloseFilled />
          </el-icon>
          <img
            v-else-if="img.status === 'done'"
            :src="`data:${img.mimeType};base64,${img.base64}`"
            :alt="img.scene"
            class="image-card__img"
            @click="previewImage(img)"
          />
          <el-icon v-else :size="40" color="#CBD5E1"><Picture /></el-icon>
        </div>

        <div class="image-card__footer">
          <span class="image-card__desc">{{ img.sceneEn }}</span>
          <el-button
            v-if="img.status === 'done'"
            link size="small"
            @click="downloadImage(img)"
          >
            <el-icon><Download /></el-icon>下载
          </el-button>
          <el-tooltip v-else-if="img.status === 'error'" :content="img.error" placement="top">
            <el-button link size="small" type="danger">失败</el-button>
          </el-tooltip>
        </div>
      </div>
    </div>

    <!-- 图片预览 -->
    <el-image-viewer
      v-if="previewSrc"
      :url-list="[previewSrc]"
      @close="previewSrc = ''"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { UploadFile } from 'element-plus'
import {
  Plus, MagicStick, Download, Loading,
  CircleCloseFilled, Picture
} from '@element-plus/icons-vue'
import axios from 'axios'
import type { AmazonCopy, GeneratedImage } from '../../types'
import { useSettingsStore } from '../../stores/settings'

const props = defineProps<{
  copy: AmazonCopy
}>()

const settingsStore = useSettingsStore()
const supportsImageGen = computed(() => settingsStore.supportsImageGen)
const currentModel = computed(() => settingsStore.effectiveModel)

// 7 个预设场景
const SCENES = [
  { key: 'white_bg', icon: '⬜', name: '白底展示', en: 'white background product shot, studio lighting' },
  { key: 'lifestyle', icon: '🏠', name: '居家生活', en: 'lifestyle scene in modern home setting' },
  { key: 'outdoor', icon: '🌿', name: '户外场景', en: 'outdoor lifestyle shot in natural environment' },
  { key: 'office', icon: '💼', name: '办公使用', en: 'office professional setting, work environment' },
  { key: 'feature', icon: '🔍', name: '功能特写', en: 'close-up detail shot highlighting key features' },
  { key: 'packshot', icon: '📦', name: '包装展示', en: 'product packaging and unboxing presentation' },
  { key: 'comparison', icon: '📏', name: '尺寸对比', en: 'size comparison and scale reference shot' },
]

const selectedScenes = ref<string[]>(SCENES.map(s => s.key))
const fileList = ref<UploadFile[]>([])
const productImagesB64 = ref<string[]>([])
const images = ref<GeneratedImage[]>([])
const generating = ref(false)
const doneCount = ref(0)
const previewSrc = ref('')

function toggleScene(key: string) {
  const idx = selectedScenes.value.indexOf(key)
  if (idx >= 0) selectedScenes.value.splice(idx, 1)
  else selectedScenes.value.push(key)
}

// 文件转 base64
function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve((reader.result as string).split(',')[1])
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

async function handleFileChange(uploadFile: UploadFile) {
  if (uploadFile.raw) {
    const b64 = await fileToBase64(uploadFile.raw)
    productImagesB64.value.push(b64)
  }
}

function handleFileRemove(uploadFile: UploadFile) {
  // 重新从现有文件列表中构建 base64（简单处理）
  productImagesB64.value = []
  fileList.value.forEach(async (f) => {
    if (f.uid !== uploadFile.uid && f.raw) {
      const b64 = await fileToBase64(f.raw)
      productImagesB64.value.push(b64)
    }
  })
}

async function startGenerate() {
  if (!supportsImageGen.value) return

  const scenes = SCENES.filter(s => selectedScenes.value.includes(s.key))
  doneCount.value = 0
  generating.value = true

  // 初始化图片列表
  images.value = scenes.map(s => ({
    id: s.key,
    scene: s.name,
    sceneEn: s.en,
    base64: '',
    mimeType: 'image/png',
    status: 'pending'
  }))

  // 逐个生成
  for (const scene of scenes) {
    const imgRef = images.value.find(i => i.id === scene.key)
    if (!imgRef) continue
    imgRef.status = 'generating'

    try {
      const res = await axios.post('/api/generate-images', {
        title: props.copy.title,
        bulletPoints: props.copy.bulletPoints,
        description: props.copy.description,
        productImages: productImagesB64.value,
        scene: { key: scene.key, name: scene.name, prompt: scene.en }
      }, { timeout: 60000 })

      imgRef.base64 = res.data.base64
      imgRef.mimeType = res.data.mimeType || 'image/png'
      imgRef.status = 'done'
      doneCount.value++
    } catch (err: unknown) {
      imgRef.status = 'error'
      imgRef.error = err instanceof Error ? err.message : '生成失败'
    }
  }

  generating.value = false
  ElMessage.success(`完成！成功生成 ${doneCount.value}/${scenes.length} 张图片`)
}

function previewImage(img: GeneratedImage) {
  previewSrc.value = `data:${img.mimeType};base64,${img.base64}`
}

function downloadImage(img: GeneratedImage) {
  const a = document.createElement('a')
  a.href = `data:${img.mimeType};base64,${img.base64}`
  a.download = `${img.scene}-${Date.now()}.png`
  a.click()
}
</script>

<style scoped>
.image-gen { display: flex; flex-direction: column; gap: 18px; }

.ig-header h4 { font-size: 16px; font-weight: 700; margin-bottom: 6px; }
.ig-header p { font-size: 13px; color: var(--text-secondary); }

.section-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }

.upload-tip { font-size: 11px; color: var(--text-secondary); margin-top: 4px; text-align: center; }

/* 场景标签 */
.scene-tags { display: flex; flex-wrap: wrap; gap: 8px; }

.scene-tag {
  padding: 6px 14px;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  user-select: none;
  transition: all 0.15s;
}
.scene-tag:hover { border-color: var(--amazon-orange); }
.scene-tag--on {
  background: rgba(255, 153, 0, 0.1);
  border-color: var(--amazon-orange);
  color: #b35c00;
  font-weight: 600;
}

/* 图片网格 */
.images-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 14px;
}

.image-card {
  border: 1px solid var(--border-color);
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  box-shadow: var(--card-shadow);
}

.image-card__scene {
  background: var(--amazon-dark);
  color: var(--amazon-orange);
  font-size: 12px;
  font-weight: 600;
  padding: 6px 12px;
}

.image-card__body {
  height: 180px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #F8FAFC;
  overflow: hidden;
}

.image-card__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: zoom-in;
  transition: transform 0.2s;
}
.image-card__img:hover { transform: scale(1.03); }

.image-card__footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
}

.image-card__desc {
  font-size: 11px;
  color: var(--text-secondary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: 1;
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
</style>

