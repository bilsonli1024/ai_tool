<template>
  <div class="app-wrapper">
    <!-- 顶部导航栏 -->
    <header class="app-header">
      <div class="header-inner">
        <router-link to="/" class="logo">
          <span class="logo-icon">🛒</span>
          <span class="logo-title">Amazon 文案 AI</span>
        </router-link>
        <nav class="header-nav">
          <router-link to="/" class="nav-item">
            <el-icon><House /></el-icon>
            <span>首页</span>
          </router-link>
          <router-link to="/project/new" class="nav-item nav-item--primary">
            <el-icon><Plus /></el-icon>
            <span>新建项目</span>
          </router-link>

          <!-- AI 配置按钮 -->
          <el-tooltip :content="settingsStore.isConfigured ? `当前模型：${settingsStore.effectiveModel}` : '请先配置 AI 模型'" placement="bottom">
            <div class="nav-settings-btn" @click="settingsStore.showSettingsDrawer = true">
              <el-icon><Setting /></el-icon>
              <span class="settings-indicator" :class="{ 'settings-indicator--ok': settingsStore.isConfigured }" />
            </div>
          </el-tooltip>
        </nav>
      </div>
    </header>

    <!-- 主内容区 -->
    <main class="app-main">
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>

    <!-- AI 设置抽屉 -->
    <SettingsDrawer />

    <!-- 底部 -->
    <footer class="app-footer">
      <span>Amazon 文案 AI 生成器 &copy; {{ new Date().getFullYear() }} · 由 OpenAI 驱动</span>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useProjectStore } from './stores/project'
import { useSettingsStore } from './stores/settings'
import SettingsDrawer from './components/SettingsDrawer.vue'

const store = useProjectStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  store.loadProjects()
  settingsStore.loadSettings()
  // 首次使用时自动弹出配置
  if (!settingsStore.isConfigured) {
    settingsStore.showSettingsDrawer = true
  }
})
</script>

<style>
/* 全局样式重置 */
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

:root {
  --amazon-orange: #FF9900;
  --amazon-dark: #232F3E;
  --amazon-light-dark: #37475A;
  --amazon-blue: #146EB4;
  --bg-page: #F3F4F6;
  --text-primary: #0F172A;
  --text-secondary: #64748B;
  --border-color: #E2E8F0;
  --card-shadow: 0 1px 3px 0 rgba(0,0,0,.1), 0 1px 2px -1px rgba(0,0,0,.1);
  --card-shadow-hover: 0 10px 15px -3px rgba(0,0,0,.1), 0 4px 6px -4px rgba(0,0,0,.1);
}

html, body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'PingFang SC',
    'Microsoft YaHei', sans-serif;
  background-color: var(--bg-page);
  color: var(--text-primary);
  min-height: 100vh;
}

#app {
  min-height: 100vh;
}
</style>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* 头部 */
.app-header {
  background: var(--amazon-dark);
  color: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.header-inner {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 24px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #fff;
  transition: opacity 0.2s;
}

.logo:hover {
  opacity: 0.85;
}

.logo-icon {
  font-size: 24px;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.header-nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 6px;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
}

.nav-item:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

.nav-item.router-link-active {
  background: rgba(255, 153, 0, 0.2);
  color: var(--amazon-orange);
}

.nav-item--primary {
  background: var(--amazon-orange);
  color: var(--amazon-dark) !important;
  font-weight: 600;
}

.nav-item--primary:hover {
  background: #e68900 !important;
  color: var(--amazon-dark) !important;
}

/* AI 配置按钮 */
.nav-settings-btn {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  transition: all 0.2s;
  font-size: 18px;
}

.nav-settings-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
}

/* 配置状态指示点 */
.settings-indicator {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #EF4444;
  border: 1.5px solid var(--amazon-dark);
}

.settings-indicator--ok {
  background: #22C55E;
}

/* 主内容 */
.app-main {
  flex: 1;
  padding: 32px 24px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
}

/* 底部 */
.app-footer {
  background: var(--amazon-dark);
  color: rgba(255, 255, 255, 0.5);
  text-align: center;
  padding: 16px 24px;
  font-size: 13px;
}

/* 路由过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

