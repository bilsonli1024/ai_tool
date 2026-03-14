# 🛒 Amazon 文案 AI 生成器

基于 AI 驱动的亚马逊产品文案生成工具。输入竞品链接，AI 自动分析关键词和卖点，结合你的产品优势，一键生成高转化率的 Amazon Listing 文案。

## ✨ 功能特性

- **竞品分析**：输入 1~5 个亚马逊竞品链接，AI 提取 ~20 个高价值关键词和属性词
- **卖点提炼**：自动总结竞品核心卖点供参考选择
- **文案生成**：生成完整 Amazon Listing，包含：
  - 产品标题（Title，≤200 字符）
  - 5 点描述（Bullet Points）
  - 产品描述（Description）
  - 搜索词（Search Terms，≤250 字节）
- **本地存储**：项目数据保存在浏览器 localStorage 及服务端本地 JSON 文件
- **一键复制**：支持逐项或全部复制文案

---

## 📁 目录结构

```
ai_tool/
├── web/          # 前端（Vue 3 + TypeScript + Element Plus）
│   ├── src/
│   │   ├── api/          # API 请求封装
│   │   ├── router/       # 路由配置
│   │   ├── stores/       # Pinia 状态管理
│   │   ├── types/        # TypeScript 类型
│   │   └── views/        # 页面视图
│   │       ├── HomeView.vue     # 首页（项目列表）
│   │       └── ProjectView.vue  # 项目创建/编辑（4步向导）
│   ├── package.json
│   └── vite.config.ts
│
├── server/       # 后端（Node.js + Express + OpenAI）
│   ├── src/
│   │   ├── routes/api.ts       # API 路由
│   │   ├── services/
│   │   │   ├── aiService.ts    # OpenAI 调用
│   │   │   └── storageService.ts # 本地文件存储
│   │   └── index.ts            # 服务器入口
│   ├── data/          # 本地数据存储（自动创建）
│   │   └── projects.json
│   └── package.json
│
└── README.md     # 本文档
```

---

## 🚀 安装与启动

### 环境要求

- **Node.js** >= 18.0.0
- **pnpm** 或 **npm** 或 **yarn**
- **OpenAI API Key**（或兼容 API，如阿里云百炼等）

### 第一步：获取 OpenAI API Key

1. 访问 [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. 创建一个新的 API Key
3. 建议使用 `gpt-4o` 或 `gpt-4-turbo` 模型

### 第二步：安装依赖

```bash
# 安装后端依赖（含 @google/generative-ai）
cd ai_tool/server
npm install

# 安装前端依赖（含 xlsx 导出）
cd ../web
npm install
```

### 第三步：配置 AI 模型（两种方式）

**推荐：通过 UI 界面配置（无需改代码）**

启动应用后，点击右上角 ⚙️ 图标，选择 AI 服务商并填写 API Key 即可。

支持的服务商：
| 服务商 | 推荐模型 | 特点 |
|--------|---------|------|
| 🔷 DeepSeek | deepseek-chat | 价格极低，推荐首选 |
| 🤖 OpenAI | gpt-4o | 效果最佳 |
| ☁️ 通义千问 | qwen-plus | 国内网络友好 |
| 🌙 Kimi | moonshot-v1-32k | 国内可用 |
| ⚙️ 自定义 | 任意 | 兼容 OpenAI 接口 |

**备选：通过 .env 配置（作为默认值）**
```bash
cp env.example .env
# 编辑 .env，填入：
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_MODEL=deepseek-chat
OPENAI_BASE_URL=https://api.deepseek.com   # DeepSeek
PORT=3001
```
> UI 中配置的 Key 优先级高于 .env 中的配置

### 第四步：安装前端依赖

```bash
cd ai_tool/web
npm install
```

### 第五步：启动服务

**需要同时启动后端和前端（分开两个终端窗口）：**

#### 终端 1：启动后端服务
```bash
cd ai_tool/server
npm run dev
# 服务启动在 http://localhost:3001
```

#### 终端 2：启动前端服务
```bash
cd ai_tool/web
npm run dev
# 前端启动在 http://localhost:5173
```

### 第六步：打开浏览器

访问 [http://localhost:5173](http://localhost:5173) 即可使用

---

## 📖 使用说明

### 创建项目流程

1. **首页** → 点击「新建项目」→ 输入项目名称（如"蓝牙耳机 2024"）

2. **Step 1 - 添加竞品链接**
   - 粘贴 1~5 个亚马逊竞品产品链接
   - 示例：`https://www.amazon.com/dp/B0XXXXXXXX`
   - 点击「开始 AI 分析」

3. **Step 2 - 选择关键词和卖点**
   - AI 分析完毕后，展示约 20 个关键词（搜索词 + 属性词）
   - 点击关键词标签选择/取消（默认全选）
   - 勾选想要参考的竞品卖点
   - 点击「下一步」

4. **Step 3 - 输入我的卖点**
   - 添加你产品的独特优势（建议 3~8 条）
   - 示例：`Type-C 快充，30 分钟充电续航 8 小时`
   - 点击「生成 Amazon 文案」

5. **Step 4 - 查看生成的文案**
   - 可直接编辑修改生成的文案
   - 逐项复制或「一键复制全部」
   - 保存项目到历史记录

---

## ⚙️ 高级配置

### 使用第三方 OpenAI 兼容 API

在 `server/.env` 中设置：

```bash
# 阿里云百炼
OPENAI_API_KEY=your-dashscope-key
OPENAI_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1
OPENAI_MODEL=qwen-plus

# Azure OpenAI
OPENAI_API_KEY=your-azure-key
OPENAI_BASE_URL=https://YOUR_RESOURCE.openai.azure.com/openai/deployments/YOUR_DEPLOYMENT
OPENAI_MODEL=gpt-4o
```

### 修改前端 API 代理

在 `web/vite.config.ts` 中修改代理目标：

```typescript
proxy: {
  '/api': {
    target: 'http://localhost:3001', // 改为你的后端地址
    changeOrigin: true
  }
}
```

---

## 🔧 构建生产版本

```bash
# 构建前端
cd ai_tool/web
npm run build
# 产物在 web/dist/

# 构建后端
cd ai_tool/server
npm run build
# 产物在 server/dist/
npm start  # 启动生产版后端
```

---

## ❓ 常见问题

**Q: 分析竞品时报错"请提供有效的亚马逊链接"**
> 确保链接包含 `amazon.com`（或其他 amazon 站点）域名，且包含 `/dp/` 路径。

**Q: AI 分析很慢或超时**
> 这是正常现象，OpenAI API 调用约需 10~30 秒。可在 `server/src/index.ts` 调整超时时间。

**Q: 数据保存在哪里？**
> - 前端：浏览器 localStorage（换浏览器/清缓存会丢失）
> - 后端：`server/data/projects.json` 文件

**Q: 如何修改生成文案的风格/语言？**
> 编辑 `server/src/services/aiService.ts` 中的 prompt，可以调整语言、风格、字数要求等。

