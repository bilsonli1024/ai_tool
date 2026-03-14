<template>
  <div class="step-analysis">
    <div class="panel-header">
      <h3>🔍 AI 分析结果</h3>
      <p>选择想要融入文案的关键词和卖点，然后点击生成文案</p>
    </div>

    <!-- 关键词区域 -->
    <div class="analysis-card">
      <div class="card-header">
        <div class="card-title">
          🏷️ 关键词 & 属性词
          <el-badge :value="selectedKwCount" type="primary" />
        </div>
        <div class="card-actions">
          <el-button size="small" @click="toggleAllKw(true)">全选</el-button>
          <el-button size="small" @click="toggleAllKw(false)">全不选</el-button>
          <el-tag size="small" type="info">共 {{ keywords.length }} 个</el-tag>
        </div>
      </div>

      <div class="kw-cloud" v-if="keywords.length">
        <div
          v-for="kw in keywords"
          :key="kw.id"
          class="kw-tag"
          :class="{ 'kw-tag--on': kw.selected, 'kw-tag--attr': kw.type === 'attribute' }"
          @click="emit('toggle-kw', kw.id)"
        >
          <el-icon v-if="kw.selected" :size="12"><Check /></el-icon>
          {{ kw.text }}
          <span class="kw-type">{{ kw.type === 'attribute' ? '属性' : '搜索词' }}</span>
        </div>
      </div>
      <el-skeleton v-else :rows="2" animated />
    </div>

    <!-- 竞品卖点区域 -->
    <div class="analysis-card">
      <div class="card-header">
        <div class="card-title">
          💡 竞品核心卖点
          <el-badge :value="selectedSpCount" type="primary" />
        </div>
        <div class="card-actions">
          <el-button size="small" @click="toggleAllSp(true)">全选</el-button>
          <el-button size="small" @click="toggleAllSp(false)">全不选</el-button>
        </div>
      </div>

      <div class="sp-list" v-if="sellingPoints.length">
        <div
          v-for="sp in sellingPoints"
          :key="sp.id"
          class="sp-item"
          :class="{ 'sp-item--on': sp.selected }"
          @click="emit('toggle-sp', sp.id)"
        >
          <el-checkbox :model-value="sp.selected" @change="emit('toggle-sp', sp.id)" />
          <span>{{ sp.text }}</span>
        </div>
      </div>
      <el-skeleton v-else :rows="3" animated />
    </div>

    <!-- 已选我的卖点预览 -->
    <div class="own-preview" v-if="ownPoints.length">
      <span class="own-label">✅ 我的卖点（{{ ownPoints.length }} 条）：</span>
      <div class="own-tags">
        <el-tag v-for="(p, i) in ownPoints" :key="i" size="small" type="success" effect="light">
          {{ p.length > 20 ? p.slice(0, 20) + '…' : p }}
        </el-tag>
      </div>
      <el-button link size="small" @click="emit('back')">修改</el-button>
    </div>

    <!-- 底部操作 -->
    <div class="step-actions">
      <el-button size="large" @click="emit('back')">
        <el-icon><ArrowLeft /></el-icon>上一步
      </el-button>
      <el-button
        type="primary"
        size="large"
        :loading="loading"
        :disabled="selectedKwCount === 0 && selectedSpCount === 0 && ownPoints.length === 0"
        @click="emit('generate')"
      >
        <el-icon><MagicStick /></el-icon>
        {{ loading ? 'AI 生成中...' : '生成 Amazon 文案' }}
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Check, ArrowLeft, MagicStick } from '@element-plus/icons-vue'
import type { Keyword, SellingPoint } from '../../types'

const props = defineProps<{
  keywords: Keyword[]
  sellingPoints: SellingPoint[]
  ownPoints: string[]
  loading: boolean
}>()

const emit = defineEmits<{
  'toggle-kw': [id: string]
  'toggle-sp': [id: string]
  'select-all-kw': [val: boolean]
  'select-all-sp': [val: boolean]
  'generate': []
  'back': []
}>()

const selectedKwCount = computed(() => props.keywords.filter(k => k.selected).length)
const selectedSpCount = computed(() => props.sellingPoints.filter(s => s.selected).length)

function toggleAllKw(val: boolean) { emit('select-all-kw', val) }
function toggleAllSp(val: boolean) { emit('select-all-sp', val) }
</script>

<style scoped>
.step-analysis { display: flex; flex-direction: column; gap: 20px; }

.panel-header h3 { font-size: 20px; font-weight: 700; margin-bottom: 8px; }
.panel-header p { color: var(--text-secondary); font-size: 14px; }

.analysis-card {
  background: #F8FAFC;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.card-actions { display: flex; gap: 6px; align-items: center; }

/* 关键词云 */
.kw-cloud { display: flex; flex-wrap: wrap; gap: 8px; }

.kw-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 11px;
  border-radius: 20px;
  border: 1.5px solid var(--border-color);
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  color: var(--text-secondary);
  transition: all 0.15s;
  user-select: none;
}
.kw-tag:hover { border-color: var(--amazon-orange); color: var(--text-primary); }
.kw-tag--on {
  background: rgba(255, 153, 0, 0.1);
  border-color: var(--amazon-orange);
  color: #b35c00;
  font-weight: 600;
}
.kw-tag--attr { border-style: dashed; }
.kw-type {
  font-size: 10px;
  background: rgba(0,0,0,.06);
  padding: 1px 5px;
  border-radius: 3px;
}

/* 卖点列表 */
.sp-list { display: flex; flex-direction: column; gap: 6px; }

.sp-item {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 14px;
  background: #fff;
  border: 1.5px solid var(--border-color);
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  line-height: 1.5;
  transition: all 0.15s;
}
.sp-item:hover { border-color: var(--amazon-orange); }
.sp-item--on {
  background: rgba(255, 153, 0, 0.05);
  border-color: rgba(255, 153, 0, 0.5);
}

/* 我的卖点预览 */
.own-preview {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;
  padding: 12px 14px;
  background: #F0FDF4;
  border: 1px solid #86EFAC;
  border-radius: 8px;
  font-size: 13px;
}
.own-label { font-weight: 600; color: #16A34A; white-space: nowrap; }
.own-tags { display: flex; flex-wrap: wrap; gap: 4px; flex: 1; }

.step-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 8px;
  border-top: 1px solid var(--border-color);
}
</style>

