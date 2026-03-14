import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project, Keyword, SellingPoint, AmazonCopy, CompetitorUrl } from '../types'

const STORAGE_KEY = 'amazon_copy_projects'

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])

  // 从 localStorage 加载数据
  function loadProjects(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        projects.value = JSON.parse(stored)
      }
    } catch (e) {
      console.error('Failed to load projects from localStorage', e)
    }
  }

  // 保存到 localStorage
  function saveToStorage(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(projects.value))
    } catch (e) {
      console.error('Failed to save projects to localStorage', e)
    }
  }

  // 创建新项目
  function createProject(name: string): Project {
    const project: Project = {
      id: generateId(),
      name,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      currentStep: 1,
      competitors: [],
      keywords: [],
      competitorSellingPoints: [],
      ownSellingPoints: []
    }
    projects.value.unshift(project)
    saveToStorage()
    return project
  }

  // 更新项目
  function updateProject(id: string, updates: Partial<Project>): void {
    const index = projects.value.findIndex(p => p.id === id)
    if (index !== -1) {
      projects.value[index] = {
        ...projects.value[index],
        ...updates,
        updatedAt: new Date().toISOString()
      }
      saveToStorage()
    }
  }

  // 删除项目
  function deleteProject(id: string): void {
    projects.value = projects.value.filter(p => p.id !== id)
    saveToStorage()
  }

  // 获取单个项目
  function getProject(id: string): Project | undefined {
    return projects.value.find(p => p.id === id)
  }

  // 更新项目竞品列表
  function updateCompetitors(id: string, competitors: CompetitorUrl[]): void {
    updateProject(id, { competitors })
  }

  // 更新关键词
  function updateKeywords(id: string, keywords: Keyword[]): void {
    updateProject(id, { keywords })
  }

  // 更新竞品卖点
  function updateCompetitorSellingPoints(id: string, points: SellingPoint[]): void {
    updateProject(id, { competitorSellingPoints: points })
  }

  // 更新我的卖点
  function updateOwnSellingPoints(id: string, points: string[]): void {
    updateProject(id, { ownSellingPoints: points })
  }

  // 更新生成的文案
  function updateGeneratedCopy(id: string, copy: AmazonCopy): void {
    updateProject(id, { generatedCopy: copy })
  }

  // 设置当前步骤
  function setStep(id: string, step: number): void {
    updateProject(id, { currentStep: step })
  }

  const sortedProjects = computed(() => {
    return [...projects.value].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    )
  })

  return {
    projects,
    sortedProjects,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
    getProject,
    updateCompetitors,
    updateKeywords,
    updateCompetitorSellingPoints,
    updateOwnSellingPoints,
    updateGeneratedCopy,
    setStep
  }
})

