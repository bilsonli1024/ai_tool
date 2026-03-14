# 在 Google Cloud Console 中启用 Generative Language API 详细指南

## 📋 前提条件

1. 拥有 Google 账号
2. 已创建 Google Cloud 项目（如果没有，会在步骤中创建）

## 🚀 详细步骤

### 步骤 1: 访问 Google Cloud Console

1. 打开浏览器，访问：**https://console.cloud.google.com**
2. 使用你的 Google 账号登录

### 步骤 2: 创建或选择项目

#### 如果是新用户（首次使用）：
1. 点击页面顶部的 **"选择项目"**（Select a project）下拉菜单
2. 点击 **"新建项目"**（New Project）
3. 输入项目名称，例如：`gemini-api-project`
4. 点击 **"创建"**（Create）
5. 等待项目创建完成（通常几秒钟）

#### 如果已有项目：
1. 点击页面顶部的 **"选择项目"**（Select a project）下拉菜单
2. 从列表中选择你的项目

### 步骤 3: 导航到 API 库

有两种方式可以到达 API 库：

**方式 A（推荐）：**
1. 在顶部搜索框中输入：`Generative Language API`
2. 从搜索结果中选择 **"Generative Language API"**

**方式 B（手动导航）：**
1. 点击左侧菜单中的 **"API 和服务"**（APIs & Services）
2. 点击 **"库"**（Library）

### 步骤 4: 搜索并选择 API

1. 在 API 库页面的搜索框中输入：`Generative Language API`
2. 点击搜索结果中的 **"Generative Language API"**
   - 或者直接访问：**https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com**

### 步骤 5: 启用 API

1. 在 API 详情页面，你会看到 **"启用"**（Enable）按钮
2. 点击 **"启用"** 按钮
3. 等待几秒钟，系统会启用该 API
4. 启用成功后，页面会显示 **"API 已启用"**（API enabled）的提示

### 步骤 6: 验证 API 已启用

1. 导航到：**https://console.cloud.google.com/apis/dashboard**
2. 在 **"已启用的 API"**（Enabled APIs）列表中，你应该能看到 **"Generative Language API"**
3. 状态应该显示为 **"已启用"**（Enabled）

## 🔑 创建 API Key（如果还没有）

### 步骤 1: 进入凭据页面

1. 访问：**https://console.cloud.google.com/apis/credentials**
2. 或者：点击左侧菜单 **"API 和服务"** → **"凭据"**（Credentials）

### 步骤 2: 创建 API Key

1. 点击页面顶部的 **"+ 创建凭据"**（+ CREATE CREDENTIALS）
2. 选择 **"API 密钥"**（API key）
3. 系统会自动生成一个 API Key
4. **重要**：复制并保存这个 API Key，它只会显示一次！

### 步骤 3: 配置 API Key 限制（推荐）

为了安全，建议设置 API Key 限制：

1. 在凭据列表中，找到刚创建的 API Key
2. 点击 API Key 名称进入编辑页面
3. **API 限制**（API restrictions）：
   - 选择 **"限制密钥"**（Restrict key）
   - 在 **"选择 API"** 下拉菜单中，搜索并选择 **"Generative Language API"**
   - 点击 **"保存"**（Save）

4. **应用程序限制**（Application restrictions）（可选）：
   - 可以选择 **"无"**（None）用于测试
   - 或设置 **"HTTP 引荐来源网址"**（HTTP referrers）限制特定网站使用

## ✅ 验证设置

### 方法 1: 使用命令行测试

```bash
# 替换 YOUR_API_KEY 为你的实际 API Key
curl -H "X-Goog-Api-Key: YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1/models"
```

如果返回模型列表（JSON 格式），说明 API 已成功启用且 API Key 有效。

### 方法 2: 在应用中使用

1. 打开应用的设置页面
2. 输入你的 API Key
3. 选择模型（如 `gemini-2.0-flash`）
4. 点击 **"测试连接"**
5. 如果显示连接成功，说明一切正常！

## 🔍 常见问题排查

### 问题 1: 找不到 "Generative Language API"

**可能原因**：
- API 名称在不同地区可能不同
- 搜索关键词：`Gemini API`、`Generative AI API`、`Google AI API`

**解决方案**：
- 直接访问：**https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com**
- 或者搜索：`generativelanguage`

### 问题 2: "启用" 按钮是灰色的或不可点击

**可能原因**：
- 需要先启用结算功能（某些 API 需要付费账户）
- 项目权限不足

**解决方案**：
1. 检查是否需要启用结算：
   - 访问：**https://console.cloud.google.com/billing**
   - 如果没有结算账户，需要添加一个（可以使用免费试用）
2. 检查项目权限：
   - 确保你是项目的 Owner 或 Editor

### 问题 3: API 启用后仍然返回 403

**可能原因**：
- API Key 限制配置错误
- API Key 未关联到正确的项目

**解决方案**：
1. 检查 API Key 限制：
   - 访问：**https://console.cloud.google.com/apis/credentials**
   - 编辑 API Key，确保 "Generative Language API" 在允许列表中
2. 确认 API Key 属于正确的项目：
   - 在 API Key 详情页面检查项目名称

### 问题 4: 启用 API 后需要等待多久？

**答案**：
- 通常立即生效（几秒钟内）
- 如果超过 5 分钟仍未生效，尝试：
  1. 刷新页面
  2. 清除浏览器缓存
  3. 重新登录 Google Cloud Console

## 📝 重要提示

1. **API Key 安全**：
   - 不要将 API Key 提交到代码仓库
   - 不要在公开场合分享 API Key
   - 定期轮换 API Key

2. **配额限制**：
   - 免费账户有配额限制
   - 可以在 **https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas** 查看配额

3. **地区限制**：
   - 某些地区可能需要 VPN 才能访问
   - 检查 Google Cloud 项目的地区设置

## 🔗 快速链接

- **API 库（直接访问 Generative Language API）**：
  https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com

- **已启用的 API 列表**：
  https://console.cloud.google.com/apis/dashboard

- **API 凭据（创建/管理 API Key）**：
  https://console.cloud.google.com/apis/credentials

- **配额和限制**：
  https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas

- **API 文档**：
  https://ai.google.dev/gemini-api/docs

## 🎯 快速检查清单

完成以下步骤后，你的 API 应该可以正常使用了：

- [ ] 已创建或选择 Google Cloud 项目
- [ ] 已启用 "Generative Language API"
- [ ] 已创建 API Key
- [ ] 已配置 API Key 限制（允许 Generative Language API）
- [ ] 已测试 API Key 是否有效
- [ ] 在应用中测试连接成功

完成以上所有步骤后，你就可以在应用中使用 Gemini API 了！🎉

