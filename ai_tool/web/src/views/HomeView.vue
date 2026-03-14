<template>
  <div class="home">
    <!-- Hero 区域 -->
    <section class="hero">
      <div class="hero-content">
        <div class="hero-badge">🤖 AI 驱动</div>
        <h1 class="hero-title">Amazon 产品文案智能生成器</h1>
        <p class="hero-subtitle">
          上传竞品链接 → AI 智能分析关键词与卖点 → 一键生成高转化率亚马逊文案
        </p>
        <div class="hero-actions">
          <el-button type="primary" size="large" class="btn-start" @click="handleNewProject">
            <el-icon><Plus /></el-icon>
            立即开始创建
          </el-button>
          <el-button size="large" class="btn-learn" @click="scrollToFlow">
            了解功能流程
          </el-button>
        </div>
        <div class="hero-stats">
          <div class="stat-item">
            <span class="stat-number">{{ store.projects.length }}</span>
            <span class="stat-label">已创建项目</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-number">20+</span>
            <span class="stat-label">关键词提取</span>
          </div>
          <div class="stat-divider" />
          <div class="stat-item">
            <span class="stat-number">4</span>
            <span class="stat-label">文案模块</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="visual-card vc-1">
          <div class="vc-label">📊 竞品分析</div>
          <div class="vc-tags">
            <span class="vc-tag vc-tag--selected">wireless</span>
            <span class="vc-tag vc-tag--selected">bluetooth 5.3</span>
            <span class="vc-tag">noise cancelling</span>
            <span class="vc-tag vc-tag--selected">40hr battery</span>
            <span class="vc-tag">foldable</span>
          </div>
        </div>
        <div class="visual-card vc-2">
          <div class="vc-label">✍️ 标题生成</div>
          <div class="vc-text">Wireless Headphones with Active Noise Cancelling, 40H Battery...</div>
        </div>
        <div class="visual-card vc-3">
          <div class="vc-label">🎯 5点描述</div>
          <div class="vc-bullets">
            <div class="vc-bullet">• SUPERIOR SOUND QUALITY</div>
            <div class="vc-bullet">• 40-HOUR BATTERY LIFE</div>
            <div class="vc-bullet">• ACTIVE NOISE CANCELLING</div>
          </div>
        </div>
      </div>
    </section>

    <!-- 功能流程 -->
    <section id="flow" class="flow-section">
      <h2 class="section-title">四步生成高质量文案</h2>
      <div class="flow-steps">
        <div v-for="step in flowSteps" :key="step.step" class="flow-step">
          <div class="step-number">{{ step.step }}</div>
          <div class="step-icon">{{ step.icon }}</div>
          <h3 class="step-title">{{ step.title }}</h3>
          <p class="step-desc">{{ step.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 最近项目 -->
    <section class="projects-section">
      <div class="section-header">
        <h2 class="section-title">最近项目</h2>
        <el-button type="primary" plain @click="handleNewProject">
          <el-icon><Plus /></el-icon>
          新建项目
        </el-button>
      </div>

      <!-- 空状态 -->
      <div v-if="store.sortedProjects.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <h3>还没有项目</h3>
        <p>点击"新建项目"开始生成你的第一份 Amazon 文案</p>
        <el-button type="primary" @click="handleNewProject">
          <el-icon><Plus /></el-icon>
          创建第一个项目
        </el-button>
      </div>

      <!-- 项目列表 -->
      <div v-else class="project-grid">
        <div
          v-for="project in store.sortedProjects"
          :key="project.id"
          class="project-card"
          @click="goToProject(project.id)"
        >
          <div class="project-card__header">
            <div class="project-card__icon">📄</div>
            <div class="project-card__actions" @click.stop>
              <el-dropdown trigger="click" @command="(cmd: string) => handleProjectAction(cmd, project.id)">
                <el-button link>
                  <el-icon><MoreFilled /></el-icon>
                </el-button>
                <template #dropdown>
                  <el-dropdown-menu>
                    <el-dropdown-item command="open">打开项目</el-dropdown-item>
                    <el-dropdown-item command="delete" divided style="color: #F56C6C">删除项目</el-dropdown-item>
                  </el-dropdown-menu>
                </template>
              </el-dropdown>
            </div>
          </div>

          <h3 class="project-card__name">{{ project.name }}</h3>

          <div class="project-card__meta">
            <el-tag :type="getStepTagType(project.currentStep)" size="small">
              {{ getStepLabel(project.currentStep) }}
            </el-tag>
          </div>

          <div class="project-card__info">
            <span>{{ project.competitors.length }} 个竞品</span>
            <span>·</span>
            <span>{{ project.keywords.filter(k => k.selected).length }} 个关键词</span>
          </div>

          <div class="project-card__time">
            更新于 {{ formatTime(project.updatedAt) }}
          </div>

          <!-- 进度条 -->
          <div class="project-card__progress">
            <div
              class="project-card__progress-bar"
              :style="{ width: `${(project.currentStep / 4) * 100}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <!-- 新建项目弹窗 -->
    <el-dialog
      v-model="showNewProjectDialog"
      title="新建项目"
      width="480px"
      align-center
    >
      <el-form :model="newProjectForm" label-position="top" @submit.prevent="submitNewProject">
        <el-form-item label="项目名称" required>
          <el-input
            v-model="newProjectForm.name"
            placeholder="例如：蓝牙耳机 2024 款"
            maxlength="50"
            show-word-limit
            autofocus
            @keyup.enter="submitNewProject"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showNewProjectDialog = false">取消</el-button>
        <el-button
          type="primary"
          :disabled="!newProjectForm.name.trim()"
          @click="submitNewProject"
        >
          创建并开始
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useProjectStore } from '../stores/project'
import type { Project } from '../types'

const router = useRouter()
const store = useProjectStore()

// 新建项目弹窗
const showNewProjectDialog = ref(false)
const newProjectForm = reactive({ name: '' })

const flowSteps = [
  {
    step: 1,
    icon: '🔗',
    title: '输入竞品链接',
    desc: '粘贴 1~5 个亚马逊竞品产品链接，AI 将自动抓取并分析产品信息'
  },
  {
    step: 2,
    icon: '🔍',
    title: '分析关键词与卖点',
    desc: 'AI 提炼约 20 个高价值搜索关键词和属性词，总结竞品核心卖点'
  },
  {
    step: 3,
    icon: '✏️',
    title: '输入我的卖点',
    desc: '在竞品分析基础上，添加你产品的独特优势和差异化卖点'
  },
  {
    step: 4,
    icon: '🚀',
    title: '生成 Amazon 文案',
    desc: 'AI 生成完整亚马逊文案：标题、5 点描述、详细描述、Search Terms'
  }
]

function handleNewProject() {
  newProjectForm.name = ''
  showNewProjectDialog.value = true
}

function submitNewProject() {
  const name = newProjectForm.name.trim()
  if (!name) return
  const project = store.createProject(name)
  showNewProjectDialog.value = false
  router.push(`/project/${project.id}`)
}

function goToProject(id: string) {
  router.push(`/project/${id}`)
}

function scrollToFlow() {
  document.getElementById('flow')?.scrollIntoView({ behavior: 'smooth' })
}

async function handleProjectAction(cmd: string, id: string) {
  if (cmd === 'open') {
    goToProject(id)
  } else if (cmd === 'delete') {
    try {
      await ElMessageBox.confirm('确定要删除这个项目吗？此操作不可恢复。', '删除确认', {
        confirmButtonText: '删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      })
      store.deleteProject(id)
    } catch {
      // 用户取消
    }
  }
}

function getStepLabel(step: number): string {
  const labels: Record<number, string> = {
    1: '添加竞品',
    2: '分析完成',
    3: '添加卖点',
    4: '文案已生成'
  }
  return labels[step] || `第 ${step} 步`
}

function getStepTagType(step: number): '' | 'success' | 'warning' | 'info' {
  if (step === 4) return 'success'
  if (step === 3) return 'warning'
  if (step === 2) return ''
  return 'info'
}

function formatTime(isoStr: string): string {
  const date = new Date(isoStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  return date.toLocaleDateString('zh-CN')
}
</script>

<style scoped>
.home {
  display: flex;
  flex-direction: column;
  gap: 64px;
}

/* Hero 区域 */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 48px;
  align-items: center;
  padding: 32px 0;
}

@media (max-width: 900px) {
  .hero {
    grid-template-columns: 1fr;
  }
  .hero-visual {
    display: none;
  }
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(255, 153, 0, 0.12);
  color: #b35c00;
  border: 1px solid rgba(255, 153, 0, 0.3);
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
}

.hero-title {
  font-size: 38px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--text-primary);
}

.hero-subtitle {
  font-size: 16px;
  color: var(--text-secondary);
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-start {
  background: var(--amazon-orange) !important;
  border-color: var(--amazon-orange) !important;
  color: var(--amazon-dark) !important;
  font-weight: 600;
  padding: 0 28px;
  height: 48px;
}

.btn-start:hover {
  background: #e68900 !important;
  border-color: #e68900 !important;
}

.btn-learn {
  height: 48px;
  padding: 0 28px;
}

.hero-stats {
  display: flex;
  align-items: center;
  gap: 24px;
  padding-top: 8px;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-number {
  font-size: 28px;
  font-weight: 800;
  color: var(--amazon-orange);
  line-height: 1;
}

.stat-label {
  font-size: 12px;
  color: var(--text-secondary);
}

.stat-divider {
  width: 1px;
  height: 40px;
  background: var(--border-color);
}

/* 视觉卡片 */
.hero-visual {
  position: relative;
  height: 320px;
}

.visual-card {
  position: absolute;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: var(--card-shadow-hover);
  border: 1px solid var(--border-color);
}

.vc-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  margin-bottom: 10px;
}

.vc-1 {
  top: 0;
  left: 0;
  width: 280px;
}

.vc-2 {
  top: 110px;
  right: 0;
  width: 260px;
}

.vc-3 {
  bottom: 0;
  left: 40px;
  width: 270px;
}

.vc-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.vc-tag {
  background: #F1F5F9;
  color: var(--text-secondary);
  border-radius: 4px;
  padding: 3px 8px;
  font-size: 12px;
  border: 1px solid var(--border-color);
}

.vc-tag--selected {
  background: rgba(255, 153, 0, 0.12);
  color: #b35c00;
  border-color: rgba(255, 153, 0, 0.4);
  font-weight: 500;
}

.vc-text {
  font-size: 13px;
  color: var(--text-primary);
  line-height: 1.5;
}

.vc-bullets {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.vc-bullet {
  font-size: 12px;
  color: var(--text-primary);
  font-weight: 500;
}

/* 功能流程 */
.flow-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 40px;
}

.section-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--text-primary);
  text-align: center;
}

.flow-steps {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  width: 100%;
}

@media (max-width: 768px) {
  .flow-steps {
    grid-template-columns: repeat(2, 1fr);
  }
}

.flow-step {
  background: #fff;
  border-radius: 16px;
  padding: 28px 20px;
  text-align: center;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.flow-step:hover {
  box-shadow: var(--card-shadow-hover);
  transform: translateY(-2px);
}

.step-number {
  background: var(--amazon-dark);
  color: var(--amazon-orange);
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 700;
}

.step-icon {
  font-size: 32px;
}

.step-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--text-primary);
}

.step-desc {
  font-size: 13px;
  color: var(--text-secondary);
  line-height: 1.6;
}

/* 项目列表 */
.projects-section {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

/* 空状态 */
.empty-state {
  background: #fff;
  border-radius: 16px;
  border: 2px dashed var(--border-color);
  padding: 64px 24px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-icon {
  font-size: 48px;
}

.empty-state h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
}

.empty-state p {
  color: var(--text-secondary);
  font-size: 14px;
}

/* 项目卡片 */
.project-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.project-card {
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid var(--border-color);
  box-shadow: var(--card-shadow);
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  flex-direction: column;
  gap: 10px;
  position: relative;
}

.project-card:hover {
  box-shadow: var(--card-shadow-hover);
  border-color: var(--amazon-orange);
  transform: translateY(-2px);
}

.project-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.project-card__icon {
  font-size: 24px;
}

.project-card__name {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.project-card__meta {
  display: flex;
  gap: 8px;
}

.project-card__info {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--text-secondary);
}

.project-card__time {
  font-size: 12px;
  color: var(--text-secondary);
}

.project-card__progress {
  height: 3px;
  background: #F1F5F9;
  border-radius: 2px;
  margin-top: 4px;
  overflow: hidden;
}

.project-card__progress-bar {
  height: 100%;
  background: var(--amazon-orange);
  border-radius: 2px;
  transition: width 0.4s ease;
}
</style>

