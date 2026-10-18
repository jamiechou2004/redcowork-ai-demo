# 今晚去哪 · redcowork-ai-demo

第一家店不满意时，从已有候选中找到更适合此刻的下一站。输入像吐槽，输出是能比较、有依据的决策卡片。

## 本地使用

直接用现代浏览器打开 `src/index.html`，无需安装依赖或构建。脚本按 samples → ai → app 顺序加载，使用经典脚本命名空间，避免本地文件的 ES Module 跨域限制。

也可以在仓库目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，访问 `http://127.0.0.1:8000/src/`。

点击「试试我的深圳夜晚」→「就这些，帮我挑」→ 核对理解后继续 → 选择状态 → 比较推荐 → 确认出发 → 打卡反馈。

## 文件

- `src/index.html`：五个 section 与弹窗。
- `src/styles.css`：移动端布局、原创 CSS 角色与动画，尊重减少动态效果设置。
- `src/samples.js`：8 家虚构酒吧、24 段虚构示例笔记。
- `src/ai.js`：唯一 AI 接口层，公开 `window.AI.callModel/understand/match/persuade`。
- `src/app.js`：交互、语音可用性检测、localStorage 打卡与反馈。
- `docs/delivery.md`：交接状态、平台待办与验证范围。
- `tests/ai.test.cjs`：无需额外依赖的 Node 逻辑回归检查。

## 接入模型

默认 `src/ai.js` 中 `USE_LLM = false`，离线规则始终可以演示。当前没有真实 LLM 调用。

1. 获取 REDcowork 官方提供的模型调用方式；不能仅凭平台名猜测接口。
2. 在 `callModel(messages)` 内实现平台桥接，返回解析后的 JSON 对象或 JSON 字符串。
3. 配置好之后才改为 `USE_LLM = true`。密钥只放平台服务端，不能提交到浏览器代码或 GitHub。
4. `understand` 要求 `{dislike: string[], want: string[], taste: string[], budget: number|null, mood: null}`。
5. `match` 要求 `{ids: string[]}`（2–3 个唯一且存在于候选池的 ID），匹配标签仍由可信候选属性生成。
6. `persuade` 要求 `{reasons: [string,string], quote: string, source: string}`。当前严格要求理由可在候选笔记原句中找到，引用和来源必须精确匹配，否则展示重试。

## 边界

- 所有店铺、距离、价格、笔记均为虚构样本，无实时数据、收藏读取或小红书账号接入。
- 语音依赖浏览器 Web Speech API、权限和网络；不支持时使用文字。语音路径未实机验证。
- 地图、分享提供明确的演示提示；不会定位虚构店铺或自动发送消息。
- 回访、饮品券、个性化学习尚未接入；反馈仅本机保存。
- 打卡统计从真实的本机操作开始，不预填历史。localStorage 失败时明确提示仅当前页面保留。
- 离线抽取为有限关键词规则，不能完整理解自然语言；理解卡让用户先核对。
- 初版视觉依据总控文档，尚未与 Figma 实稿逐项对齐。

## 验证

执行 `node tests/ai.test.cjs`；可再用 `node --check src/app.js` 检查脚本语法。

逻辑检查已通过。浏览器直接访问本地文件被工具安全策略拦截，尚未完成五屏浏览器操作、移动端截图与真实语音验收，不将源码完成等同于全部验收通过。

## 上传

只上传 `src` 中五个文件，保持同级，让 `index.html` 位于上传包根目录。无需上传 `.git`、测试和过程材料。所有样式与样本均本地存放，无外部字体、图片、CDN 或构建依赖。具体上传与发布步骤以 REDcowork 平台实际要求为准。
