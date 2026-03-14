<template>
  <div class="step-input">
    <div class="panel-header">
      <h3>📋 输入产品信息</h3>
      <p>添加竞品链接让 AI 分析关键词和卖点，同时输入你自己产品的独特优势</p>
    </div>

    <div class="two-col">
      <!-- 左：竞品链接 -->
      <div class="col-card">
        <div class="col-title">
          <el-icon><Link /></el-icon>
          竞品 Amazon 链接
          <el-tag size="small" type="info">{{ competitors.length }}/5</el-tag>
        </div>

        <div class="url-row">
          <el-input
            v-model="urlInput"
            placeholder="https://www.amazon.com/dp/B0XXXXXXXX"
            clearable
            @keyup.enter="addUrl"
          />
          <el-button type="primary" :disabled="competitors.length >= 5 || !urlInput.trim()" @click="addUrl">
            添加
          </el-button>
        </div>
        <p class="hint"><el-icon><InfoFilled /></el-icon>支持 amazon.com/co.uk/de 等，最多 5 个</p>

        <div v-if="competitors.length" class="url-list">
          <div v-for="(c, i) in competitors" :key="c.id" class="url-item">
            <span class="url-idx">{{ i + 1 }}</span>
            <span class="url-text">{{ c.url }}</span>
            <el-button link type="danger" @click="emit('remove-url', c.id)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div v-else class="col-empty">
          <el-icon :size="32" color="#CBD5E1"><Link /></el-icon>
          <p>请添加至少 1 个竞品链接</p>
        </div>
      </div>

      <!-- 右：我的卖点 -->
      <div class="col-card">
        <div class="col-title">
          <el-icon><EditPen /></el-icon>
          我的产品卖点
          <el-tag size="small" type="success">{{ ownPoints.length }} 条</el-tag>
        </div>

        <div class="point-row">
          <el-input
            v-model="pointInput"
            type="textarea"
            :rows="2"
            placeholder="例如：Type-C 快充，30 分钟可续航 8 小时"
            maxlength="200"
            show-word-limit
            @keydown.ctrl.enter="addPoint"
            @keydown.meta.enter="addPoint"
          />
          <el-button type="primary" :disabled="!pointInput.trim()" @click="addPoint">
            添加
          </el-button>
        </div>
        <p class="hint"><el-icon><InfoFilled /></el-icon>Ctrl/⌘+Enter 快速添加，建议 3~8 条</p>

        <div v-if="ownPoints.length" class="point-list">
          <div v-for="(p, i) in ownPoints" :key="i" class="point-item">
            <el-icon color="#22C55E"><Checked /></el-icon>
            <span>{{ p }}</span>
            <el-button link type="danger" @click="emit('remove-point', i)">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </div>
        <div v-else class="col-empty">
          <el-icon :size="32" color="#CBD5E1"><EditPen /></el-icon>
          <p>添加你产品的独特优势</p>
        </div>
      </div>
    </div>

    <!-- 底部操作 -->
    <div class="step-actions">
      <el-button size="large" @click="emit('back')">
        <el-icon><House /></el-icon>返回首页
      </el-button>
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="competitors.length === 0"
        @click="emit('analyze')"
      >
        <el-icon><Search /></el-icon>
        {{ loading ? 'AI 分析中...' : '开始 AI 分析' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Link, EditPen, Delete, InfoFilled, Checked, Search, House } from '@element-plus/icons-vue'
import type { CompetitorUrl } from '../../types'

const props = defineProps<{
  competitors: CompetitorUrl[]
  ownPoints: string[]
  loading: boolean
}>()

const emit = defineEmits<{
  'add-url': [url: string]
  'remove-url': [id: string]
  'add-point': [point: string]
  'remove-point': [index: number]
  'analyze': []
  'back': []
}>()

const urlInput = ref('')
const pointInput = ref('')

function isValidAmazonUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.hostname.includes('amazon') && (url.includes('/dp/') || url.includes('/gp/product/'))
  } catch { return false }
}

function addUrl() {
  const url = urlInput.value.trim()
  if (!url) return
  if (!isValidAmazonUrl(url)) {
    ElMessage.warning('请输入含 /dp/ 的有效亚马逊链接')
    return
  }
  if (props.competitors.some(c => c.url === url)) {
    ElMessage.warning('该链接已添加')
    return
  }
  emit('add-url', url)
  urlInput.value = ''
}

function addPoint() {
  const p = pointInput.value.trim()
  if (!p) return
  emit('add-point', p)
  pointInput.value = ''
}
</script>

<style scoped>
.step-input { display: flex; flex-direction: column; gap: 24px; }

.panel-header h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.panel-header p { color: var(--text-secondary); font-size: 14px; }

.two-col {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}
@media (max-width: 768px) { .two-col { grid-template-columns: 1fr; } }

.col-card {
  background: #F8FAFC;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 300px;
  min-width: 0; /* 防止内容撑开 grid 列 */
  overflow: hidden;
}

.col-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
}

.url-row, .point-row { display: flex; gap: 8px; align-items: flex-start; }
.url-row .el-input, .point-row .el-textarea { flex: 1; }

.hint {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: var(--text-secondary);
}

.url-list, .point-list { display: flex; flex-direction: column; gap: 6px; flex: 1; }

.url-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: #fff;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  font-size: 12px;
  min-width: 0; /* 防止撑开父容器 */
}
.url-idx {
  width: 20px; height: 20px; border-radius: 50%;
  background: var(--amazon-dark); color: var(--amazon-orange);
  font-size: 11px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  flex-shrink: 0; margin-top: 1px;
}
.url-text {
  flex: 1;
  min-width: 0; /* 关键：允许文本被截断 */
  word-break: break-all; /* 超长 URL 自动换行 */
  font-family: monospace;
  line-height: 1.5;
  color: var(--text-secondary);
}

.point-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 8px 10px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.5;
}
.point-item span { flex: 1; }

.col-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: var(--text-secondary);
  font-size: 13px;
}

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}
</style>

