import fs from 'fs'
import path from 'path'

// 数据存储目录
const DATA_DIR = path.join(process.cwd(), 'data')
const PROJECTS_FILE = path.join(DATA_DIR, 'projects.json')

// 确保数据目录存在
function ensureDataDir(): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// 读取所有项目
export function readProjects(): Record<string, unknown>[] {
  ensureDataDir()
  if (!fs.existsSync(PROJECTS_FILE)) {
    return []
  }
  try {
    const content = fs.readFileSync(PROJECTS_FILE, 'utf-8')
    return JSON.parse(content)
  } catch {
    return []
  }
}

// 写入所有项目
export function writeProjects(projects: Record<string, unknown>[]): void {
  ensureDataDir()
  fs.writeFileSync(PROJECTS_FILE, JSON.stringify(projects, null, 2), 'utf-8')
}

// 保存单个项目（新建或更新）
export function saveProject(project: Record<string, unknown>): void {
  const projects = readProjects()
  const index = projects.findIndex((p) => p.id === project.id)
  if (index !== -1) {
    projects[index] = { ...project, updatedAt: new Date().toISOString() }
  } else {
    projects.unshift(project)
  }
  writeProjects(projects)
}

// 获取单个项目
export function getProject(id: string): Record<string, unknown> | undefined {
  const projects = readProjects()
  return projects.find((p) => p.id === id)
}

// 删除项目
export function deleteProject(id: string): void {
  const projects = readProjects()
  const filtered = projects.filter((p) => p.id !== id)
  writeProjects(filtered)
}

