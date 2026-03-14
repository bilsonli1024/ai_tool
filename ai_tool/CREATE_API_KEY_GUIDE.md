# 创建 Google Gemini API Key 详细指南

## 🎯 当前状态

✅ API 已启用  
❌ 需要创建 API Key（凭证）

## 🚀 快速创建步骤

### 方法 1：从当前页面直接创建（推荐）

如果你在 "已启用的 API 和服务" 页面看到提示需要创建凭证：

1. **点击页面上的 "创建凭证"**（Create Credentials）按钮
   - 或者点击 **"创建凭据"**（CREATE CREDENTIALS）链接

2. **选择 "API 密钥"**（API key）
   - 从下拉菜单中选择 **"API 密钥"**

3. **复制 API Key**
   - 系统会自动生成一个 API Key
   - **重要**：立即复制并保存，它只会显示一次！
   - API Key 格式类似：`AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX`

4. **配置限制（推荐）**
   - 点击 **"限制密钥"**（Restrict key）
   - 在 "API 限制" 中选择 **"限制密钥"**
   - 选择 **"Generative Language API"**
   - 点击 **"保存"**

### 方法 2：直接访问凭据页面

**直接访问这个链接**：
👉 **https://console.cloud.google.com/apis/credentials**

然后按照以下步骤操作：

---

## 📝 详细步骤（带截图说明）

### 步骤 1：进入凭据页面

**页面地址**：https://console.cloud.google.com/apis/credentials

**页面位置**：
- 左侧菜单：**"API 和服务"** → **"凭据"**（Credentials）
- 或者直接访问上面的链接

### 步骤 2：创建 API Key

**操作**：
1. 点击页面顶部的 **"+ 创建凭据"**（+ CREATE CREDENTIALS）按钮
2. 从下拉菜单中选择 **"API 密钥"**（API key）

**页面显示**：
```
┌─────────────────────────────────────┐
│  + 创建凭据                          │
│    ├─ API 密钥                       │
│    ├─ OAuth 客户端 ID                │
│    └─ 服务账号                        │
└─────────────────────────────────────┘
```

### 步骤 3：复制 API Key

**重要提示**：
- ⚠️ API Key 只会显示一次！
- 📋 立即复制并保存到安全的地方
- 🔒 不要分享给他人或提交到代码仓库

**API Key 格式**：
```
AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
```

**操作**：
1. 点击 API Key 右侧的 **"复制"** 图标
2. 或者直接选中整个 Key 并复制（Ctrl+C / Cmd+C）
3. 保存到安全的地方（如密码管理器、文本文件）

### 步骤 4：配置 API Key 限制（重要！）

为了安全，强烈建议配置限制：

#### 4.1 进入编辑页面

1. 在凭据列表中，找到刚创建的 API Key
2. 点击 API Key 名称（或右侧的编辑图标）

#### 4.2 设置 API 限制

**位置**：编辑页面的 **"API 限制"**（API restrictions）部分

**操作**：
1. 选择 **"限制密钥"**（Restrict key）
2. 在 **"选择 API"** 下拉菜单中：
   - 搜索：`Generative Language API`
   - 勾选：**"Generative Language API"**
3. 点击 **"保存"**（Save）

**页面显示**：
```
API 限制
○ 不限制密钥（不推荐）
● 限制密钥
  ┌─────────────────────────────┐
  │ ☑ Generative Language API   │
  │ ☐ 其他 API...                │
  └─────────────────────────────┘
  [保存]
```

#### 4.3 设置应用程序限制（可选）

**位置**：编辑页面的 **"应用程序限制"**（Application restrictions）部分

**选项**：
- **"无"**（None）- 用于测试，允许任何地方使用
- **"HTTP 引荐来源网址"**（HTTP referrers）- 限制特定网站使用
- **"IP 地址"**（IP addresses）- 限制特定 IP 使用

**建议**：
- 测试阶段：选择 **"无"**
- 生产环境：设置 **"HTTP 引荐来源网址"** 或 **"IP 地址"**

---

## ✅ 验证 API Key 是否有效

### 方法 1：使用命令行测试

```bash
# 替换 YOUR_API_KEY 为你的实际 API Key
curl -H "X-Goog-Api-Key: YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1/models"
```

**成功响应**：返回 JSON 格式的模型列表  
**失败响应**：返回错误信息（如 403、401）

### 方法 2：在应用中使用

1. 打开应用的设置页面
2. 粘贴你的 API Key
3. 选择模型（如 `gemini-2.0-flash`）
4. 点击 **"测试连接"**
5. 如果显示连接成功，说明 API Key 有效！

---

## 🔍 常见问题

### 问题 1：找不到 "创建凭据" 按钮

**解决方案**：
- 直接访问：https://console.cloud.google.com/apis/credentials
- 确认已选择正确的项目（页面顶部）
- 刷新页面

### 问题 2：创建后找不到 API Key

**说明**：
- API Key 创建后会立即显示
- 如果关闭了弹窗，需要重新创建
- 或者访问凭据列表页面查看

**查看已创建的 API Key**：
1. 访问：https://console.cloud.google.com/apis/credentials
2. 在 **"API 密钥"**（API keys）部分查看
3. 点击 API Key 名称可以查看详情和重新显示 Key

### 问题 3：API Key 被限制，无法使用

**检查步骤**：
1. 访问凭据页面：https://console.cloud.google.com/apis/credentials
2. 点击 API Key 名称进入编辑页面
3. 检查 **"API 限制"**：
   - 确保选择了 **"限制密钥"**
   - 确保 **"Generative Language API"** 在列表中
4. 检查 **"应用程序限制"**：
   - 如果设置了限制，确保你的应用符合限制条件

### 问题 4：API Key 泄露了怎么办？

**立即操作**：
1. 访问：https://console.cloud.google.com/apis/credentials
2. 找到泄露的 API Key
3. 点击 **"删除"**（Delete）或 **"撤销"**（Revoke）
4. 创建新的 API Key
5. 更新应用中的配置

---

## 🔗 相关页面链接

| 页面 | 链接 | 用途 |
|------|------|------|
| **凭据页面（创建 API Key）** | https://console.cloud.google.com/apis/credentials | ⭐ **主要页面** |
| 已启用 API 列表 | https://console.cloud.google.com/apis/dashboard | 查看已启用的 API |
| API 详情 | https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com | 查看 API 信息 |

---

## 📋 创建 API Key 检查清单

完成以下步骤：

- [ ] 访问凭据页面
- [ ] 点击 "创建凭据" → "API 密钥"
- [ ] 复制并保存 API Key（只显示一次！）
- [ ] 配置 API 限制（选择 Generative Language API）
- [ ] 保存配置
- [ ] 测试 API Key 是否有效
- [ ] 在应用中配置 API Key

---

## 💡 安全提示

1. **不要分享 API Key**
   - 不要将 API Key 提交到 Git 仓库
   - 不要分享到公开论坛或社交媒体
   - 使用环境变量或应用设置存储

2. **设置限制**
   - 始终设置 API 限制
   - 限制应用程序访问（如可能）

3. **定期轮换**
   - 定期更换 API Key
   - 如果怀疑泄露，立即撤销并创建新的

4. **监控使用**
   - 定期检查 API 使用情况
   - 设置使用配额和警报

---

## 🎯 快速操作流程

```
1. 访问：https://console.cloud.google.com/apis/credentials
   ↓
2. 点击 "+ 创建凭据" → "API 密钥"
   ↓
3. 复制 API Key（只显示一次！）
   ↓
4. 点击 API Key 名称进入编辑
   ↓
5. 设置 API 限制：选择 "Generative Language API"
   ↓
6. 保存
   ↓
7. ✅ 完成！现在可以在应用中使用这个 API Key 了
```

---

## 📝 下一步

创建 API Key 后：

1. **在应用中配置**：
   - 打开应用设置
   - 粘贴 API Key
   - 选择模型（如 `gemini-2.0-flash`）
   - 点击 "测试连接"

2. **如果测试失败**：
   - 检查 API Key 是否正确复制
   - 检查 API 限制设置
   - 查看错误信息，参考之前的故障排除指南

完成以上步骤后，你就可以在应用中使用 Gemini API 了！🎉

