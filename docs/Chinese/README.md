# Auto Page Translator - 自动页面翻译扩展

一个适用于 Chromium 内核浏览器的自动翻译扩展，支持将英文网页自动翻译成中文。

## 功能特性

- 🌐 **整页自动翻译**：一键翻译整个网页内容
- 🔤 **单向翻译**：英语 → 中文（English to Chinese）
- 🎯 **多翻译引擎支持**：
  - Google Translate（谷歌翻译）
  - Microsoft Bing（必应翻译）
  - Baidu Translate（百度翻译）
  - DeepL
  - AI 翻译（OpenAI GPT）
- ⚡ **自动翻译**：可设置特定域名自动翻译
- 💾 **设置保存**：所有设置自动保存到浏览器同步存储
- 🎨 **美观界面**：现代化渐变色弹窗界面

## 支持的浏览器

- Google Chrome
- Microsoft Edge
- Brave
- Opera
- 其他基于 Chromium 的浏览器

## 安装方法

### 方法一：开发者模式安装（推荐用于测试）

1. 下载或克隆本扩展源代码
2. 打开 Chrome 浏览器，访问 `chrome://extensions/`
3. 右上角开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `extension` 文件夹
6. 扩展安装完成！

### 方法二：打包安装

1. 打开 Chrome 浏览器，访问 `chrome://extensions/`
2. 开启"开发者模式"
3. 点击"打包扩展程序"
4. 选择 `extension` 文件夹
5. 生成 `.crx` 文件后拖入浏览器安装

## 使用说明

### 基本使用

1. 安装扩展后，点击浏览器工具栏中的扩展图标
2. 在弹出的设置面板中：
   - 开启/关闭自动翻译功能
   - 选择翻译服务（Google、Bing、Baidu、DeepL、AI）
   - （可选）输入 API 密钥（DeepL 或 OpenAI）
   - （可选）添加自动翻译域名
3. 点击"Translate Page Now"立即翻译当前页面
4. 点击"Restore Original"恢复原始页面

### 配置 API 密钥

#### DeepL API 密钥
1. 访问 [DeepL API](https://www.deepl.com/pro-api)
2. 注册账号并获取 API 密钥
3. 在扩展设置中输入密钥

#### OpenAI API 密钥
1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 创建 API 密钥
3. 在扩展设置中输入密钥

### 自动翻译域名

在设置面板中输入域名（如 `example.com`），按回车键添加到自动翻译列表。访问这些域名时将自动翻译页面。

## 文件结构

```
extension/
├── manifest.json      # 扩展配置文件
├── background.js      # 后台服务脚本
├── content.js         # 内容脚本（执行翻译）
├── popup.html         # 弹窗界面
├── popup.js           # 弹窗逻辑
└── icons/             # 扩展图标
    ├── icon16.png
    ├── icon48.png
    └── icon128.png
```

## 技术实现

### 翻译流程

1. **内容提取**：遍历页面 DOM，提取所有文本节点
2. **批量翻译**：将文本分批发送翻译 API（避免频率限制）
3. **内容替换**：用翻译结果替换原文本
4. **状态保存**：保存原始内容以便恢复

### 注意事项

- **Bing 和 Baidu**：需要官方 API 密钥才能正常使用，当前版本为演示实现
- **翻译速度**：大页面可能需要几秒到几十秒完成翻译
- **CORS 限制**：部分翻译服务可能受跨域限制影响

## 开发说明

### 构建 CRX 文件

```bash
# 使用 Chrome 打包
1. 访问 chrome://extensions/
2. 开启开发者模式
3. 点击"打包扩展程序"
4. 选择 extension 目录
```

### 调试

1. popup 调试：右键点击扩展图标 → "检查弹出内容"
2. 背景脚本调试：访问 `chrome://extensions/` → 找到扩展 → "Service Worker"
3. 内容脚本调试：在目标页面按 F12 打开开发者工具

## 常见问题

### Q: 翻译失败怎么办？
A: 
- 检查网络连接
- 尝试切换其他翻译服务
- 刷新页面后重试

### Q: 某些页面无法翻译？
A: 
- 部分网站有安全限制
- 动态加载的内容可能需要手动触发翻译
- 尝试在页面完全加载后再翻译

### Q: 翻译质量不佳？
A: 
- 尝试切换不同的翻译服务
- DeepL 和 AI 翻译通常质量更高
- 确保安装了正确的语言包

## 更新日志

### v1.0.0
- 初始版本发布
- 支持 5 种翻译服务
- 自动翻译功能
- 美观的弹窗界面

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题或建议，请通过 GitHub Issues 联系我们。
