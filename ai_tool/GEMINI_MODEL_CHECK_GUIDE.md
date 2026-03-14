# Gemini API 模型权限检查指南

## 📋 快速检查方法

### 方法 1: 使用应用内置测试功能（推荐）

1. 打开应用右上角的 **设置**（⚙️）
2. 配置你的 Gemini API Key 和模型名称（如 `gemini-2.0-flash`）
3. 点击 **"测试连接"** 按钮
4. 如果出现 403 错误，会显示详细的错误信息和检查建议

### 方法 2: 使用命令行测试

#### 2.1 检查 API Key 是否有效
```bash
curl -H "X-Goog-Api-Key: YOUR_API_KEY" \
  "https://generativelanguage.googleapis.com/v1/models"
```

如果返回模型列表，说明 API Key 有效。

#### 2.2 测试特定模型访问权限
```bash
curl -X POST \
  "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions" \
  -H "Content-Type: application/json" \
  -H "X-Goog-Api-Key: YOUR_API_KEY" \
  -d '{
    "model": "gemini-2.0-flash",
    "messages": [{"role": "user", "content": "test"}],
    "max_tokens": 10
  }'
```

如果返回 403，说明没有权限访问该模型。

### 方法 3: 使用 Google Cloud Console

1. **检查 API 是否已启用**
   - 访问：https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com
   - 确认状态为 **"已启用"**（Enabled）
   - 如果未启用，点击 **"启用"** 按钮

2. **检查 API Key 限制**
   - 访问：https://console.cloud.google.com/apis/credentials
   - 找到你的 API Key，点击编辑
   - 检查 **"API 限制"**（API restrictions）
   - 确保 **"Generative Language API"** 在允许列表中
   - 或者设置为 **"不限制"**（Don't restrict key）

3. **检查配额和限制**
   - 访问：https://console.cloud.google.com/apis/api/generativelanguage.googleapis.com/quotas
   - 检查是否有配额限制
   - 确认请求速率限制是否足够

### 方法 4: 使用 Google AI Studio

1. 访问：https://aistudio.google.com/app/apikey
2. 检查 API Key 状态
3. 如果 API Key 无效，可以创建新的 API Key
4. 在 AI Studio 中直接测试模型访问：
   - 访问：https://aistudio.google.com/app/prompts/new_chat
   - 选择模型 `gemini-2.0-flash`
   - 如果能正常使用，说明有权限

## 🔍 常见 403 错误原因及解决方案

### 1. API Key 没有权限访问特定模型

**症状**：返回 403 错误，错误信息包含 "PERMISSION_DENIED"

**解决方案**：
- 确认模型名称正确：`gemini-2.0-flash`（注意大小写和连字符）
- 某些模型可能需要特殊权限或付费账户
- 尝试使用其他模型，如 `gemini-1.5-flash` 或 `gemini-1.5-pro`

### 2. API 未启用

**症状**：403 错误，提示 API 未启用

**解决方案**：
- 访问 Google Cloud Console
- 启用 "Generative Language API"
- 等待几分钟后重试

### 3. API Key 限制配置错误

**症状**：403 错误，但 API Key 本身有效

**解决方案**：
- 检查 API Key 的 "API 限制"设置
- 确保 "Generative Language API" 在允许列表中
- 或者临时设置为 "不限制" 进行测试

### 4. 账户配额不足

**症状**：403 错误，提示配额相关

**解决方案**：
- 检查 Google Cloud Console 中的配额设置
- 某些模型可能需要付费账户
- 联系 Google Cloud 支持申请增加配额

### 5. 地区限制

**症状**：在某些地区无法访问

**解决方案**：
- 使用 VPN 或代理
- 使用 API 中转服务
- 检查 Google Cloud 项目的地区设置

## 🛠️ 使用应用 API 检查模型权限

应用提供了专门的 API 端点来检查模型权限：

```bash
curl -X POST http://localhost:3001/api/check-model-access \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "YOUR_API_KEY",
    "baseURL": "https://generativelanguage.googleapis.com/v1beta/openai/",
    "model": "gemini-2.0-flash",
    "targetModel": "gemini-2.0-flash"
  }'
```

返回示例：
```json
{
  "success": true,
  "message": "模型 gemini-2.0-flash 可以正常访问",
  "model": "gemini-2.0-flash",
  "available": true
}
```

## 📝 推荐的 Gemini 模型列表

根据你的需求选择合适的模型：

| 模型名称 | 特点 | 推荐场景 |
|---------|------|---------|
| `gemini-2.0-flash` | 速度快，支持图片生成 | 推荐用于大多数场景 |
| `gemini-2.5-pro-preview-05-06` | 最强推理能力 | 复杂任务 |
| `gemini-1.5-pro` | 长上下文，多模态强 | 长文档处理 |
| `gemini-1.5-flash` | 轻量快速，免费额度大 | 简单任务，成本敏感 |

## 🔗 有用的链接

- **Google AI Studio**: https://aistudio.google.com
- **API 文档**: https://ai.google.dev/gemini-api/docs
- **Cloud Console**: https://console.cloud.google.com
- **API 密钥管理**: https://console.cloud.google.com/apis/credentials
- **API 状态**: https://status.cloud.google.com

## 💡 提示

1. **首次使用**：建议先在 Google AI Studio 中测试模型，确认可以正常使用后再配置到应用中
2. **错误排查**：如果遇到 403 错误，按照上述步骤逐一检查
3. **模型名称**：确保模型名称完全正确，包括大小写和连字符
4. **API Key 安全**：不要将 API Key 提交到代码仓库，使用环境变量或应用设置存储

