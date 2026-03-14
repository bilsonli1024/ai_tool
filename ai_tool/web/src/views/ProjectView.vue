<template>
  <div class="project-view">
    <!-- 顶部标题栏 -->
    <div class="pv-header">
      <el-button link @click="router.push('/')">
        <el-icon><ArrowLeft /></el-icon> 返回首页
      </el-button>
      <div v-if="project" class="pv-title">
        <h2>{{ project.name }}</h2>
        <el-tag type="info" size="small">{{ fmtTime(project.updatedAt) }} 更新</el-tag>
      </div>
    </div>

    <!-- AI 未配置提示 -->
    <el-alert v-if="!settingsStore.isConfigured" type="warning" :closable="false">
      <template #title>
        ⚠️ 尚未配置 AI 模型
        <el-button type="warning" size="small" style="margin-left: 12px"
          @click="settingsStore.showSettingsDrawer = true">
          <el-icon><Setting /></el-icon> 立即配置
        </el-button>
      </template>
    </el-alert>

    <!-- 步骤指示器（3步） -->
    <div class="steps-wrap">
      <el-steps :active="currentStep - 1" finish-status="success" align-center>
        <el-step title="输入产品信息" description="竞品链接 + 我的卖点" :icon="DocumentAdd" />
        <el-step title="选择关键词 & 卖点" description="AI 分析结果" :icon="Search" />
        <el-step title="生成 & 下载文案" description="文案 + Excel + 图片" :icon="Download" />
      </el-steps>
    </div>

    <!-- 步骤内容 -->
    <div v-if="project" class="step-card">

      <!-- Step 1 -->
      <StepInput
        v-if="currentStep === 1"
        :competitors="competitors"
        :own-points="ownSellingPoints"
        :loading="analyzing"
        @add-url="addUrl"
        @remove-url="removeUrl"
        @add-point="addPoint"
        @remove-point="removePoint"
        @analyze="startAnalysis"
        @back="router.push('/')"
      />

      <!-- Step 2 -->
      <StepAnalysis
        v-else-if="currentStep === 2"
        :keywords="keywords"
        :selling-points="competitorSellingPoints"
        :own-points="ownSellingPoints"
        :loading="generating"
        @toggle-kw="toggleKw"
        @toggle-sp="toggleSp"
        @select-all-kw="selectAllKw"
        @select-all-sp="selectAllSp"
        @generate="startGeneration"
        @back="goStep(1)"
      />

      <!-- Step 3 -->
      <template v-else-if="currentStep === 3">
        <StepCopy
          v-model:copy="generatedCopy"
          :regenerating="generating"
          @download-excel="downloadExcel"
          @regenerate="startGeneration"
          @save="saveProject"
          @back="goStep(2)"
        />

        <!-- 图片生成（有文案后展示） -->
        <div v-if="generatedCopy" class="image-gen-wrap">
          <el-divider>
            <el-icon><Picture /></el-icon> AI 图片生成（Gemini）
          </el-divider>
          <ImageGen :copy="generatedCopy" />
        </div>
      </template>

    </div>

    <!-- 项目不存在 -->
    <el-result v-else icon="warning" title="项目未找到" sub-title="该项目不存在或已被删除">
      <template #extra>
        <el-button type="primary" @click="router.push('/')">返回首页</el-button>
      </template>
    </el-result>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Setting, Search, Download, DocumentAdd, Picture } from '@element-plus/icons-vue'

import { useProjectStore } from '../stores/project'
import { useSettingsStore } from '../stores/settings'
import { analyzeCompetitors, generateAmazonCopy } from '../api'
import { downloadCopyAsExcel } from '../utils/excel'

import StepInput from '../components/project/StepInput.vue'
import StepAnalysis from '../components/project/StepAnalysis.vue'
import StepCopy from '../components/project/StepCopy.vue'
import ImageGen from '../components/project/ImageGen.vue'

import type { CompetitorUrl, Keyword, SellingPoint, AmazonCopy } from '../types'

const route = useRoute()
const router = useRouter()
const store = useProjectStore()
const settingsStore = useSettingsStore()

const projectId = computed(() => route.params.id as string)
const project = computed(() => store.getProject(projectId.value))
const currentStep = computed(() => project.value?.currentStep ?? 1)

// 本地状态
const competitors = ref<CompetitorUrl[]>([])
const keywords = ref<Keyword[]>([])
const competitorSellingPoints = ref<SellingPoint[]>([])
const ownSellingPoints = ref<string[]>([])
const generatedCopy = ref<AmazonCopy | null>(null)
const analyzing = ref(false)
const generating = ref(false)

function genId() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

// 同步 project → 本地
function syncFromProject() {
  if (!project.value) return
  competitors.value = [...project.value.competitors]
  keywords.value = [...project.value.keywords]
  competitorSellingPoints.value = [...project.value.competitorSellingPoints]
  ownSellingPoints.value = [...project.value.ownSellingPoints]
  generatedCopy.value = project.value.generatedCopy
    ? { ...project.value.generatedCopy, bulletPoints: [...project.value.generatedCopy.bulletPoints] }
    : null
  // 确保 5 条 bullet
  if (generatedCopy.value) {
    while (generatedCopy.value.bulletPoints.length < 5) generatedCopy.value.bulletPoints.push('')
  }
}
watch(project, syncFromProject, { immediate: true })

// ===== Step 1 操作 =====
function addUrl(url: string) {
  competitors.value.push({ id: genId(), url, status: 'pending' })
  store.updateCompetitors(projectId.value, competitors.value)
}
function removeUrl(id: string) {
  competitors.value = competitors.value.filter(c => c.id !== id)
  store.updateCompetitors(projectId.value, competitors.value)
}
function addPoint(p: string) {
  ownSellingPoints.value.push(p)
  store.updateOwnSellingPoints(projectId.value, ownSellingPoints.value)
}
function removePoint(i: number) {
  ownSellingPoints.value.splice(i, 1)
  store.updateOwnSellingPoints(projectId.value, ownSellingPoints.value)
}

async function startAnalysis() {
  if (!settingsStore.isConfigured) {
    settingsStore.showSettingsDrawer = true; return
  }
  analyzing.value = true
  try {
    competitors.value = competitors.value.map(c => ({ ...c, status: 'analyzing' as const }))
    const result = await analyzeCompetitors(competitors.value.map(c => c.url))

    keywords.value = result.keywords.map((kw, i) => ({
      id: `kw-${i}`, text: kw.text, selected: true, type: kw.type
    }))
    competitorSellingPoints.value = result.sellingPoints.map((sp, i) => ({
      id: `sp-${i}`, text: sp, selected: true, source: 'competitor' as const
    }))
    competitors.value = competitors.value.map(c => ({ ...c, status: 'done' as const }))

    store.updateCompetitors(projectId.value, competitors.value)
    store.updateKeywords(projectId.value, keywords.value)
    store.updateCompetitorSellingPoints(projectId.value, competitorSellingPoints.value)
    goStep(2)
    ElMessage.success('分析完成，请选择关键词和卖点')
  } catch (e: unknown) {
    competitors.value = competitors.value.map(c => ({ ...c, status: 'pending' as const }))
    ElMessage.error(`分析失败：${e instanceof Error ? e.message : ''}`)
  } finally { analyzing.value = false }
}

// ===== Step 2 操作 =====
function toggleKw(id: string) {
  if (!id) return
  const kw = keywords.value.find(k => k.id === id)
  if (kw) { kw.selected = !kw.selected; store.updateKeywords(projectId.value, keywords.value) }
}
function toggleSp(id: string) {
  if (!id) return
  const sp = competitorSellingPoints.value.find(s => s.id === id)
  if (sp) { sp.selected = !sp.selected; store.updateCompetitorSellingPoints(projectId.value, competitorSellingPoints.value) }
}
function selectAllKw(val: boolean) {
  keywords.value.forEach(k => { k.selected = val })
  store.updateKeywords(projectId.value, keywords.value)
}
function selectAllSp(val: boolean) {
  competitorSellingPoints.value.forEach(s => { s.selected = val })
  store.updateCompetitorSellingPoints(projectId.value, competitorSellingPoints.value)
}

async function startGeneration() {
  if (!settingsStore.isConfigured) {
    settingsStore.showSettingsDrawer = true; return
  }
  generating.value = true
  generatedCopy.value = null
  if (currentStep.value !== 3) goStep(3)

  try {
    const result = await generateAmazonCopy({
      selectedKeywords: keywords.value.filter(k => k.selected).map(k => k.text),
      selectedSellingPoints: competitorSellingPoints.value.filter(s => s.selected).map(s => s.text),
      ownSellingPoints: ownSellingPoints.value
    })
    // 确保 5 条
    while (result.bulletPoints.length < 5) result.bulletPoints.push('')
    generatedCopy.value = result
    store.updateGeneratedCopy(projectId.value, result)
    ElMessage.success('文案生成成功！')
  } catch (e: unknown) {
    ElMessage.error(`生成失败：${e instanceof Error ? e.message : ''}`)
  } finally { generating.value = false }
}

// ===== Excel 下载 =====
function downloadExcel() {
  if (!generatedCopy.value || !project.value) return
  downloadCopyAsExcel(generatedCopy.value, project.value.name, keywords.value)
}

// ===== 保存 =====
function saveProject() {
  if (!generatedCopy.value) return
  store.updateGeneratedCopy(projectId.value, generatedCopy.value)
  ElMessage.success('已保存！')
  router.push('/')
}

function goStep(s: number) { store.setStep(projectId.value, s) }

function fmtTime(iso: string) {
  return new Date(iso).toLocaleString('zh-CN', {
    month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
  })
}

onMounted(syncFromProject)
</script>

<style scoped>
.project-view { display: flex; flex-direction: column; gap: 20px; max-width: 920px; margin: 0 auto; }

.pv-header { display: flex; align-items: center; gap: 16px; }
.pv-title { display: flex; align-items: center; gap: 10px; flex: 1; }
.pv-title h2 { font-size: 20px; font-weight: 700; }

.steps-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 20px 32px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
}

.step-card {
  background: #fff;
  border-radius: 12px;
  padding: 28px 32px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.image-gen-wrap {
  background: #fff;
  border-radius: 12px;
  padding: 24px 32px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  margin-top: 4px;
}
</style>
