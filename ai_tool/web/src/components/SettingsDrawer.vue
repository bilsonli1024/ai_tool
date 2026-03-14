<template>
  <el-drawer
    v-model="settingsStore.showSettingsDrawer"
    title="AI 模型配置"
    direction="rtl"
    size="480px"
    :append-to-body="true"
  >
    <template #header>
      <div class="drawer-header">
        <span class="drawer-title">
          <el-icon><Setting /></el-icon>
          AI 模型配置
        </span>
        <el-tag
          :type="settingsStore.isConfigured ? 'success' : 'danger'"
          size="small"
        >
          {{ settingsStore.isConfigured ? '✅ 已配置' : '❌ 未配置' }}
        </el-tag>
      </div>
    </template>

    <div class="settings-content">

      <!-- API Key 说明 -->
      <el-alert type="info" :closable="false" style="margin-bottom: 8px">
        <template #title>
          <span style="font-size: 12px">
            🔒 API Key 已配置在服务器环境变量中，前端只需选择模型即可使用
          </span>
        </template>
      </el-alert>

      <!-- Step 1: 选择服务商 -->
      <div class="settings-section">
        <h4 class="settings-section__title">
          <span class="step-badge">1</span>
          选择 AI 服务商
        </h4>
        <div class="provider-grid">
          <div
            v-for="provider in PROVIDERS"
            :key="provider.id"
            class="provider-card"
            :class="{ 'provider-card--active': currentProvider === provider.id }"
            @click="selectProvider(provider.id)"
          >
            <span class="provider-logo">{{ provider.logo }}</span>
            <span class="provider-name">{{ provider.name }}</span>
            <el-tag
              v-if="provider.id === 'deepseek'"
              size="small"
              type="success"
              effect="light"
              class="provider-badge"
            >推荐</el-tag>
          </div>
        </div>

        <!-- 选中服务商的提示 -->
        <div v-if="selectedProviderConfig" class="provider-hint">
          <el-icon><InfoFilled /></el-icon>
          {{ selectedProviderConfig.priceHint }}
          <a
            v-if="selectedProviderConfig.docLink"
            :href="selectedProviderConfig.docLink"
            target="_blank"
            class="doc-link"
          >
            查看 API Key 文档 →
          </a>
        </div>
      </div>

      <!-- Step 2: 选择模型 -->
      <div class="settings-section">
        <h4 class="settings-section__title">
          <span class="step-badge">2</span>
          选择模型
        </h4>

        <!-- 预置模型列表 -->
        <div v-if="currentProvider !== 'custom'" class="model-list">
          <div
            v-for="model in selectedProviderConfig?.models"
            :key="model"
            class="model-item"
            :class="{ 'model-item--active': form.model === model }"
            @click="form.model = model"
          >
            <div class="model-item__radio">
              <div class="model-item__dot" />
            </div>
            <div class="model-item__info">
              <span class="model-item__name">{{ model }}</span>
              <span class="model-item__desc">{{ getModelDesc(model) }}</span>
            </div>
          </div>
        </div>

        <!-- 自定义模型 -->
        <div v-else class="custom-fields">
          <el-form label-position="top" size="default">
            <el-form-item label="Base URL（接口地址）">
              <el-input
                v-model="form.customBaseURL"
                placeholder="https://your-api-endpoint/v1"
              />
              <p class="field-hint">需要兼容 OpenAI Chat Completions 格式</p>
            </el-form-item>
            <el-form-item label="Model Name（模型名称）">
              <el-input
                v-model="form.customModel"
                placeholder="例如: llama3-70b, claude-3-opus"
              />
            </el-form-item>
          </el-form>
        </div>
      </div>

      <!-- 测试连接 -->
      <div class="settings-section">
        <el-button
          type="primary"
          plain
          :loading="testing"
          :disabled="!canSave"
          @click="testConnection"
          style="width: 100%"
        >
          <el-icon><Connection /></el-icon>
          {{ testing ? '测试中...' : '测试连接' }}
        </el-button>
        <div v-if="testResult" class="test-result" :class="`test-result--${testResult.type}`">
          <el-icon>
            <SuccessFilled v-if="testResult.type === 'success'" />
            <CircleCloseFilled v-else />
          </el-icon>
          {{ testResult.message }}
        </div>
      </div>

    </div>

    <!-- 底部操作 -->
    <template #footer>
      <div class="drawer-footer">
        <el-button @click="settingsStore.showSettingsDrawer = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!canSave"
          @click="saveSettings"
        >
          <el-icon><Check /></el-icon>
          保存配置
        </el-button>
      </div>
    </template>
  </el-drawer>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Setting, InfoFilled, Connection,
  SuccessFilled, CircleCloseFilled, Check
} from '@element-plus/icons-vue'
import { useSettingsStore, PROVIDERS, type AIProvider } from '../stores/settings'
import axios from 'axios'

const settingsStore = useSettingsStore()

// 本地表单状态（避免直接修改 store）
const form = reactive({
  model: settingsStore.settings.model,
  customBaseURL: settingsStore.settings.customBaseURL,
  customModel: settingsStore.settings.customModel
})

const currentProvider = ref<AIProvider>(settingsStore.settings.provider)
const testing = ref(false)
const testResult = ref<{ type: 'success' | 'error'; message: string } | null>(null)

// 当 Drawer 打开时同步最新设置
watch(
  () => settingsStore.showSettingsDrawer,
  (open) => {
    if (open) {
      form.model = settingsStore.settings.model
      form.customBaseURL = settingsStore.settings.customBaseURL
      form.customModel = settingsStore.settings.customModel
      currentProvider.value = settingsStore.settings.provider
      testResult.value = null
    }
  }
)

// 当切换服务商时重置 model
const selectedProviderConfig = computed(() =>
  PROVIDERS.find(p => p.id === currentProvider.value)
)

function selectProvider(id: AIProvider) {
  currentProvider.value = id
  const config = PROVIDERS.find(p => p.id === id)
  if (config && id !== 'custom') {
    form.model = config.defaultModel
  }
  testResult.value = null
}

const canSave = computed(() => {
  // API Key 现在从服务器环境变量读取，前端只需要配置模型即可
  if (currentProvider.value === 'custom') {
    return !!(form.customBaseURL && form.customModel)
  }
  return !!(form.model)
})

// 模型描述提示
function getModelDesc(model: string): string {
  const descs: Record<string, string> = {
    'deepseek-chat': '综合能力强，价格极低，推荐',
    'deepseek-reasoner': '深度推理模型，适合复杂任务',
    'gpt-4o': '最强综合能力，速度快',
    'gpt-4o-mini': '轻量版，速度快成本低',
    'gpt-4-turbo': '长上下文，性能强',
    'gpt-3.5-turbo': '速度最快，成本最低',
    'gemini-2.0-flash': '速度快，支持图片生成 ✨，推荐',
    'gemini-2.5-pro-preview-05-06': '最强 Gemini，推理能力出色',
    'gemini-1.5-pro': '长上下文，多模态强',
    'gemini-1.5-flash': '轻量快速，免费额度大',
    'qwen-max': '通义最强模型',
    'qwen-plus': '均衡型，推荐',
    'qwen-turbo': '速度最快',
    'qwen-long': '超长上下文',
    'moonshot-v1-8k': '8K 上下文',
    'moonshot-v1-32k': '32K 上下文，推荐',
    'moonshot-v1-128k': '超长文档处理'
  }
  return descs[model] || ''
}

// 测试连接
async function testConnection() {
  testing.value = true
  testResult.value = null

  try {
    const baseURL = currentProvider.value === 'custom'
      ? form.customBaseURL
      : selectedProviderConfig.value?.baseURL || ''
    const model = currentProvider.value === 'custom' ? form.customModel : form.model

    const response = await axios.post(
      '/api/test-connection',
      { baseURL, model },
      { timeout: 15000 }
    )

    if (response.data.success) {
      testResult.value = { type: 'success', message: `连接成功！模型响应正常 (${model})` }
    } else {
      testResult.value = { type: 'error', message: response.data.message || '连接失败' }
    }
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '连接失败，请检查服务器环境变量配置和网络'
    testResult.value = { type: 'error', message: msg }
  } finally {
    testing.value = false
  }
}

// 保存配置
function saveSettings() {
  settingsStore.saveSettings({
    provider: currentProvider.value,
    model: form.model,
    customBaseURL: form.customBaseURL,
    customModel: form.customModel
  })
  settingsStore.showSettingsDrawer = false
  ElMessage.success('AI 配置已保存')
}
</script>

<style scoped>
.drawer-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.drawer-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
  padding-bottom: 16px;
}

/* 分组 */
.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.step-badge {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--amazon-dark);
  color: var(--amazon-orange);
  font-size: 12px;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 服务商卡片 */
.provider-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.provider-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px;
  border: 1.5px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s;
  position: relative;
  background: #fff;
}

.provider-card:hover {
  border-color: var(--amazon-orange);
  background: rgba(255, 153, 0, 0.04);
}

.provider-card--active {
  border-color: var(--amazon-orange);
  background: rgba(255, 153, 0, 0.08);
  box-shadow: 0 0 0 2px rgba(255, 153, 0, 0.25);
}

.provider-logo {
  font-size: 24px;
}

.provider-name {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  line-height: 1.3;
}

.provider-badge {
  position: absolute;
  top: -6px;
  right: -4px;
  font-size: 10px;
  padding: 0 5px;
  height: 16px;
  line-height: 16px;
}

.provider-hint {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: var(--text-secondary);
  background: #F8FAFC;
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.doc-link {
  color: var(--amazon-blue);
  text-decoration: none;
  font-weight: 500;
  white-space: nowrap;
  margin-left: auto;
}

.doc-link:hover {
  text-decoration: underline;
}

/* API Key 提示 */
.field-hint {
  font-size: 11px;
  color: var(--text-secondary);
  margin-top: 4px;
}

.cursor-pointer {
  cursor: pointer;
}

/* 模型列表 */
.model-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.model-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  background: #fff;
}

.model-item:hover {
  border-color: var(--amazon-orange);
}

.model-item--active {
  border-color: var(--amazon-orange);
  background: rgba(255, 153, 0, 0.06);
}

.model-item__radio {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color 0.15s;
}

.model-item--active .model-item__radio {
  border-color: var(--amazon-orange);
}

.model-item__dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: transparent;
  transition: background 0.15s;
}

.model-item--active .model-item__dot {
  background: var(--amazon-orange);
}

.model-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.model-item__name {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  font-family: monospace;
}

.model-item__desc {
  font-size: 11px;
  color: var(--text-secondary);
}

/* 自定义字段 */
.custom-fields {
  background: #F8FAFC;
  border-radius: 8px;
  padding: 16px;
  border: 1px solid var(--border-color);
}

/* 测试结果 */
.test-result {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  border-radius: 8px;
  font-size: 13px;
}

.test-result--success {
  background: #F0FDF4;
  color: #16A34A;
  border: 1px solid #86EFAC;
}

.test-result--error {
  background: #FEF2F2;
  color: #DC2626;
  border: 1px solid #FECACA;
}

/* 底部 */
.drawer-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>

