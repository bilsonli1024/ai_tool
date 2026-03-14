<template>
  <div class="step-copy">
    <div class="panel-header">
      <h3>🚀 生成的 Amazon 文案</h3>
      <p>文案已针对亚马逊流量最大化优化，可直接编辑修改后使用</p>
    </div>

    <div v-if="copy && copy.bulletPoints" class="copy-body">
      <!-- 工具栏 -->
      <div class="toolbar">
        <el-button type="primary" @click="emit('download-excel')">
          <el-icon><Download /></el-icon> 下载 Excel
        </el-button>
        <el-button @click="copyAll">
          <el-icon><CopyDocument /></el-icon>
          {{ copied === 'all' ? '已复制 ✓' : '一键复制全部' }}
        </el-button>
        <el-button :loading="regenerating" @click="emit('regenerate')">
          <el-icon><Refresh /></el-icon> 重新生成
        </el-button>
      </div>

      <!-- 标题 -->
      <div class="copy-block">
        <div class="block-header">
          <span class="block-label">📝 产品标题 Title</span>
          <div class="block-meta">
            <el-tag size="small" :type="copy.title.length > 200 ? 'danger' : 'success'">
              {{ copy.title.length }} / 200 字符
            </el-tag>
            <el-button size="small" link @click="copyText(copy.title, 'title')">
              {{ copied === 'title' ? '✓' : '复制' }}
            </el-button>
          </div>
        </div>
        <el-input v-model="copy.title" type="textarea" :rows="3" class="copy-ta" />
      </div>

      <!-- 五点描述（固定 5 个） -->
      <div class="copy-block">
        <div class="block-header">
          <span class="block-label">📌 五点描述 Bullet Points</span>
          <el-button size="small" link @click="copyText(copy.bulletPoints.join('\n'), 'bullets')">
            {{ copied === 'bullets' ? '✓ 已复制' : '复制全部' }}
          </el-button>
        </div>
        <div class="bullets-grid">
          <div v-for="i in 5" :key="i" class="bullet-row">
            <div class="bullet-no">{{ i }}</div>
            <el-input
              v-model="copy.bulletPoints[i - 1]"
              type="textarea"
              :rows="2"
              :placeholder="`第 ${i} 条卖点（建议 150~200 字符）`"
              class="copy-ta"
            />
            <el-button link @click="copyText(copy.bulletPoints[i - 1], `b${i}`)">
              <el-icon><CopyDocument /></el-icon>
            </el-button>
          </div>
        </div>
      </div>

      <!-- 描述 -->
      <div class="copy-block">
        <div class="block-header">
          <span class="block-label">📄 产品描述 Description</span>
          <div class="block-meta">
            <el-tag size="small" type="info">{{ copy.description.length }} 字符</el-tag>
            <el-button size="small" link @click="copyText(copy.description, 'desc')">
              {{ copied === 'desc' ? '✓' : '复制' }}
            </el-button>
          </div>
        </div>
        <el-input v-model="copy.description" type="textarea" :rows="8" class="copy-ta" />
      </div>

      <!-- Search Terms -->
      <div class="copy-block">
        <div class="block-header">
          <span class="block-label">🔍 Search Terms</span>
          <div class="block-meta">
            <el-tag size="small" :type="copy.searchTerms.length > 250 ? 'danger' : 'success'">
              {{ copy.searchTerms.length }} / 250 字节
            </el-tag>
            <el-button size="small" link @click="copyText(copy.searchTerms, 'st')">
              {{ copied === 'st' ? '✓' : '复制' }}
            </el-button>
          </div>
        </div>
        <el-input v-model="copy.searchTerms" type="textarea" :rows="3" class="copy-ta" />
        <p class="hint">词间用空格，不超过 250 字节，不与标题重复</p>
      </div>
    </div>

    <!-- 生成中占位 -->
    <el-skeleton v-else :rows="18" animated style="padding: 8px 0" />

    <!-- 底部操作 -->
    <div class="step-actions" v-if="copy">
      <el-button size="large" @click="emit('back')">
        <el-icon><ArrowLeft /></el-icon>重新选择
      </el-button>
      <el-button type="success" size="large" @click="emit('save')">
        <el-icon><DocumentChecked /></el-icon>保存项目
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import {
  Download, CopyDocument, Refresh, ArrowLeft, DocumentChecked
} from '@element-plus/icons-vue'
import type { AmazonCopy } from '../../types'

defineProps<{ regenerating?: boolean }>()

const emit = defineEmits<{
  'download-excel': []
  'regenerate': []
  'save': []
  'back': []
}>()

const copy = defineModel<AmazonCopy | null>('copy', { required: true })

// 确保有 5 条 bulletPoints
function ensureFive() {
  if (!copy.value) return
  while (copy.value.bulletPoints.length < 5) copy.value.bulletPoints.push('')
}

const copied = ref('')

async function copyText(text: string, field: string) {
  if (!text) return
  try {
    await navigator.clipboard.writeText(text)
    copied.value = field
    setTimeout(() => { if (copied.value === field) copied.value = '' }, 2000)
    ElMessage.success('已复制')
  } catch { ElMessage.error('复制失败') }
}

async function copyAll() {
  if (!copy.value) return
  ensureFive()
  const c = copy.value
  const text = [
    `【Title】\n${c.title}`,
    `\n【Bullet Points】\n${c.bulletPoints.map((b, i) => `${i + 1}. ${b}`).join('\n')}`,
    `\n【Description】\n${c.description}`,
    `\n【Search Terms】\n${c.searchTerms}`
  ].join('\n')
  await copyText(text, 'all')
}
</script>

<style scoped>
.step-copy { display: flex; flex-direction: column; gap: 20px; }

.panel-header h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.panel-header p { color: var(--text-secondary); font-size: 14px; }

.toolbar { display: flex; gap: 10px; flex-wrap: wrap; }

.copy-body { display: flex; flex-direction: column; gap: 20px; }

.copy-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 18px;
  background: #F8FAFC;
  border: 1px solid var(--border-color);
  border-radius: 10px;
}

.block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.block-label { font-size: 14px; font-weight: 600; color: var(--text-primary); }
.block-meta { display: flex; align-items: center; gap: 8px; }

.copy-ta :deep(.el-textarea__inner) {
  font-size: 13.5px;
  line-height: 1.65;
  font-family: system-ui, sans-serif;
  background: #fff;
}

/* 五点描述 */
.bullets-grid { display: flex; flex-direction: column; gap: 8px; }

.bullet-row { display: flex; align-items: flex-start; gap: 10px; }

.bullet-no {
  width: 26px; height: 26px; flex-shrink: 0;
  background: var(--amazon-dark); color: var(--amazon-orange);
  border-radius: 50%; font-size: 12px; font-weight: 700;
  display: flex; align-items: center; justify-content: center;
  margin-top: 8px;
}

.bullet-row .copy-ta { flex: 1; }

.hint { font-size: 11px; color: var(--text-secondary); }

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}
</style>

