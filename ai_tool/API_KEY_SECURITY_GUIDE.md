# API Key 泄露处理和安全指南

## 🚨 当前问题

你的 API Key 已被 Google 标记为泄露：
```
"Your API key was reported as leaked. Please use another API key."
```

**这意味着**：
- ⚠️ 这个 API Key 可能已经被公开或泄露
- ⚠️ Google 已经禁用了这个 API Key
- ⚠️ 需要立即撤销并创建新的 API Key

## 🔥 立即操作步骤

### 步骤 1：撤销泄露的 API Key（立即执行）

1. **访问凭据页面**：
   👉 https://console.cloud.google.com/apis/credentials

2. **找到泄露的 API Key**：
   - 在 API 密钥列表中查找：`AIzaSyAh0U2MB_Hk4Fum17kAognCVJU5A8ORoCU`
   - 或者查看所有 API Key

3. **撤销 API Key**：
   - 点击 API Key 名称进入详情页
   - 点击 **"撤销"**（Revoke）或 **"删除"**（Delete）按钮
   - 确认删除

4. **验证已删除**：
   - 确认该 API Key 不再出现在列表中

### 步骤 2：创建新的 API Key

1. **访问凭据页面**：
   👉 https://console.cloud.google.com/apis/credentials

2. **创建新 API Key**：
   - 点击 **"+ 创建凭据"** → **"API 密钥"**
   - 复制新生成的 API Key（只显示一次！）

3. **配置限制**：
   - **API 限制**：选择 "限制密钥"，只选择 "Generative Language API"
   - **应用程序限制**：设置为 "无"（测试阶段）或配置适当的限制
   - 点击 **"保存"**

### 步骤 3：更新应用配置

1. **在应用中更新**：
   - 打开应用设置
   - 删除旧的 API Key
   - 粘贴新的 API Key
   - 点击 "测试连接" 验证

2. **验证新 API Key**：
   ```bash
   curl -H "X-Goog-Api-Key: YOUR_NEW_API_KEY" \
     "https://generativelanguage.googleapis.com/v1/models"
   ```
   应该返回模型列表，而不是 403 错误。

## 🔒 安全最佳实践

### ❌ 永远不要做的事情

1. **不要在命令行中直接使用 API Key**
   ```bash
   # ❌ 错误：API Key 会出现在命令历史中
   curl -H "X-Goog-Api-Key: AIzaSy..." ...
   
   # ✅ 正确：使用环境变量
   export GEMINI_API_KEY="your-key"
   curl -H "X-Goog-Api-Key: $GEMINI_API_KEY" ...
   ```

2. **不要将 API Key 提交到 Git 仓库**
   ```bash
   # ❌ 错误：直接写在代码中
   const apiKey = "AIzaSy..."
   
   # ✅ 正确：使用环境变量
   const apiKey = process.env.GEMINI_API_KEY
   ```

3. **不要在公开场合分享 API Key**
   - ❌ 不要在论坛、聊天室、社交媒体分享
   - ❌ 不要在代码片段中分享
   - ❌ 不要在截图或视频中显示

4. **不要在日志中输出 API Key**
   ```javascript
   // ❌ 错误
   console.log("API Key:", apiKey)
   
   // ✅ 正确：只显示部分
   console.log("API Key:", apiKey.substring(0, 10) + "...")
   ```

### ✅ 应该做的事情

1. **使用环境变量存储 API Key**
   ```bash
   # .env 文件（不要提交到 Git）
   GEMINI_API_KEY=your-api-key-here
   ```

2. **使用 .gitignore 排除敏感文件**
   ```gitignore
   # .gitignore
   .env
   .env.local
   *.key
   ```

3. **设置 API Key 限制**
   - API 限制：只允许需要的 API
   - 应用程序限制：限制使用范围
   - IP 地址限制：限制特定 IP（如需要）

4. **定期轮换 API Key**
   - 每 3-6 个月更换一次
   - 如果怀疑泄露，立即更换

5. **监控 API Key 使用**
   - 定期检查使用情况
   - 设置使用配额和警报
   - 发现异常使用立即撤销

## 🔍 如何检查 API Key 是否泄露

### 方法 1：检查命令历史

```bash
# 检查命令历史中是否包含 API Key
history | grep "AIzaSy"

# 如果找到，立即撤销该 API Key
```

### 方法 2：检查 Git 历史

```bash
# 检查 Git 提交历史中是否包含 API Key
git log -p | grep "AIzaSy"

# 如果找到，需要：
# 1. 撤销泄露的 API Key
# 2. 从 Git 历史中移除（使用 git filter-branch 或 BFG）
# 3. 创建新的 API Key
```

### 方法 3：检查代码仓库

- 检查 GitHub/GitLab 等代码仓库
- 检查是否有公开的代码片段包含 API Key
- 检查是否有公开的配置文件

## 🛡️ 安全配置检查清单

创建新 API Key 后，确保：

- [ ] API Key 已创建并保存到安全位置
- [ ] 旧 API Key 已撤销/删除
- [ ] API 限制已配置（只选择 Generative Language API）
- [ ] 应用程序限制已配置（测试阶段可设为"无"）
- [ ] API Key 存储在环境变量中，不在代码中
- [ ] .env 文件已添加到 .gitignore
- [ ] 应用已更新为新 API Key
- [ ] 新 API Key 测试通过

## 📋 如果 API Key 已泄露到 Git 仓库

### 情况 1：仓库是私有的

1. 立即撤销泄露的 API Key
2. 创建新的 API Key
3. 从代码中移除旧 API Key
4. 提交新代码

### 情况 2：仓库是公开的

1. **立即撤销泄露的 API Key**（最重要！）
2. 创建新的 API Key
3. 从 Git 历史中移除 API Key：
   ```bash
   # 使用 git filter-branch（复杂）
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch .env" \
     --prune-empty --tag-name-filter cat -- --all
   
   # 或使用 BFG Repo-Cleaner（推荐）
   # 下载：https://rtyley.github.io/bfg-repo-cleaner/
   bfg --replace-text passwords.txt
   ```
4. 强制推送（警告：会重写历史）
   ```bash
   git push --force --all
   ```
5. 通知团队成员更新 API Key

## 🔐 安全存储 API Key 的方法

### 方法 1：环境变量（推荐）

**服务器端（Node.js）**：
```javascript
// .env 文件（不提交到 Git）
GEMINI_API_KEY=your-api-key

// 代码中
require('dotenv').config()
const apiKey = process.env.GEMINI_API_KEY
```

**客户端（浏览器）**：
- 使用应用设置存储（本地存储）
- 不要硬编码在代码中

### 方法 2：密钥管理服务

- **Google Cloud Secret Manager**
- **AWS Secrets Manager**
- **Azure Key Vault**

### 方法 3：配置文件（不提交到 Git）

```bash
# config.local.json（添加到 .gitignore）
{
  "apiKey": "your-api-key"
}
```

## 📞 紧急情况处理

如果发现 API Key 泄露：

1. **立即撤销 API Key**（5 分钟内）
2. **检查使用情况**：
   - 访问：https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/metrics
   - 查看是否有异常使用
3. **创建新 API Key**
4. **更新所有使用该 Key 的应用**
5. **检查是否有费用异常**

## 💡 预防措施

1. **使用 API Key 管理工具**
   - 使用密码管理器存储 API Key
   - 不要保存在普通文本文件中

2. **代码审查**
   - 提交代码前检查是否包含 API Key
   - 使用 pre-commit hooks 检查

3. **使用不同的 API Key**
   - 开发环境使用一个 Key
   - 生产环境使用另一个 Key
   - 测试环境使用第三个 Key

4. **设置使用配额和警报**
   - 设置每日/每月使用限额
   - 设置使用异常警报

## 🎯 总结

**当前需要做的**：
1. ✅ 立即撤销泄露的 API Key
2. ✅ 创建新的 API Key
3. ✅ 配置新 API Key 的限制
4. ✅ 更新应用配置
5. ✅ 检查是否有其他地方泄露

**未来预防**：
- ✅ 使用环境变量存储 API Key
- ✅ 不要将 API Key 提交到代码仓库
- ✅ 设置 API Key 限制
- ✅ 定期轮换 API Key

完成以上步骤后，你的 API 应该可以正常使用了！🔒

