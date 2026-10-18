# 今晚去哪 · redcowork-ai-demo

第一家店不满意时，从已有候选中找到更适合此刻的下一站。输入像吐槽，输出是能比较、有依据的决策卡片。

## 公开预览

https://jamiechou2004.github.io/redcowork-ai-demo/

GitHub Pages 自动发布 main 分支，推送后通常需要几分钟更新。该链接是离线 Demo 预览，不是 REDcowork 最终提交链接。

## 本地使用

直接用现代浏览器打开 `src/index.html`，无需安装依赖或构建。脚本按 samples → ai → flow → mascot → app 顺序加载，使用经典脚本命名空间，避免本地文件的 ES Module 跨域限制。

也可以在仓库目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，访问 `http://127.0.0.1:8000/src/`。

从候选池开始，点击「就从这些候选开始」→「试试我的深圳夜晚」→「就这些，帮我挑」→ 核对理解后继续 → 选择状态 → 比较推荐 → 确认出发 → 打卡反馈。

## 文件

- `src/index.html`：候选入口、导入、输入、核对、编辑、情绪、推荐、出发、打卡、负反馈与集卡页面。
- `src/styles.css`：移动端布局、moodboard 配色与角色动画，尊重减少动态效果设置。
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
- 配色与流程已按 Figma 25 个状态同步，页面合并关系见 `docs/flow-parity.md`。

## 验证

执行 `node tests/ai.test.cjs` 和 `node tests/flow.test.cjs`；可再用 `node --check src/app.js` 检查脚本语法。

逻辑检查已通过。公开 GitHub Pages 页面已在浏览器完成示例输入 → 理解核对 → 默认状态 → 推荐加载 → 切换第二家 → 出发 → 打卡 → 负向反馈 → 返回开始的主流程验证。已补充 390px 手机宽度、手动候选、预算编辑、批次回看与耗尽、负反馈集卡、刷新持久化、模拟生成失败重试和真实候选不足恢复的浏览器验收。真实语音与真实存储禁用场景尚未实机验证。

## 上传

只上传 `src` 中全部七个文件，保持同级，让 `index.html` 位于上传包根目录。无需上传 `.git`、测试和过程材料。所有样式与样本均本地存放，无外部字体、图片、CDN 或构建依赖。具体上传与发布步骤以 REDcowork 平台实际要求为准。

## 最新流程

支持手动添加候选、直接编辑偏好、回看推荐批次、负反馈原因、历史集卡和来源查看。所有候选与反馈只在本机保存。详见 [流程映射](docs/flow-parity.md)。
