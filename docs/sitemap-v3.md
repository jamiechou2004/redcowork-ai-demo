# Sitemap v3 — 实现与验收

依据：[用户确认的 IA](https://www.figma.com/design/4yegzIqM4FSfyDMJHhF8Rw/design-challenge?node-id=57-205)

设计：[v3 首次引导](https://www.figma.com/design/4yegzIqM4FSfyDMJHhF8Rw/design-challenge?node-id=61-7761)

原型：[Figma 点击体验](https://www.figma.com/proto/4yegzIqM4FSfyDMJHhF8Rw/design-challenge?node-id=61-7761&starting-point-node-id=61%3A7761)

## 页面映射

| IA | 网页 | Figma 起点/示例 |
|---|---|---|
| E1 / E2 引导 | welcome-screen / guide-screen | 61:7761 / 61:7795 |
| I1 输入 | input-screen；右上重看引导、我的候选 | 61:1212 |
| U1 / U2 | confirm-screen；改一改返回 input-screen | 61:1236 |
| U3 没听懂 | clarify-screen；三种方向 | 61:7838 |
| M 状态 | mood-screen；跳过默认平衡 | 61:1254 |
| R 推荐 | recommend-screen；加载、重排、比较、来源、换批 | 67:1042 / 67:1076 / 67:1110 |
| U3 三条分支 | 确认对应偏好，再选择状态 | 67:1144 / 67:1176 / 67:1208 |
| G 出发 | departure-screen | 61:1354 |
| C 打卡反馈 | checkin-screen / negative-screen | 61:1373 / 61:1413 / 61:1563 |
| P 候选与历史 | pool-screen / import-screen / history-screen | 61:1693 / 61:1598 / 61:1580 |
| P 周记录 | pool-week 对话框；与打卡页共用同一记录 | 67:7586 |
| F1 回访 | 明确标注概念，不实际推送 | 61:1660 |

## 实现规则

- 首次完成或跳过引导写入 `tonight-onboarding-v3`；之后直接进入输入。可随时重看。
- 没提取到偏好，或同时要求安静/热闹时先追问，不自动猜测。追问保留其他已明确的预算、口味。
- 状态切换从当前整个候选池重新排序，重置批次；普通“换一批”保持不重复。已有批次可回看。
- 推荐理由引用现有笔记；比较只使用已提供的匹配标签、距离、价格、氛围。冲突与缺失会展示。
- “我的候选”作为次入口，包含 10 家虚构候选（2 家夜食），支持选择与手动补充。
- 打卡、反馈、周记录、历史均存于当前浏览器；结束返回吐槽。
- Figma 交互使用固定示例和选择变量。网页负责动态解析、重排、记录持久化。语音、手动输入、计数和候选筛选以网页为功能验收对象。

## 验证

- 三组 Node 测试：既有推荐/批次/持久化逻辑；新增追问、食物场景、4 人抽取、冲突标签、状态重排和比较依据。
- 本地浏览器：首次两屏引导、跳过、重看、刷新直达输入；模糊输入 → 食物追问 → 核对 → 推荐 → 出发 → 打卡 → 返回输入。390px 移动端布局检查。
- Figma：v3 页面导航目标均在本页，旧设计保留；主流程与追问分支已连线。

## 仍属演示的部分

当前是可操作的离线交互原型，`USE_LLM = false`。真实模型、真实商家检索/定位、分享发送、回访推送及小券均未接入。语音仍依赖浏览器支持、网络及权限，未验证真实录音。不要将虚构店铺或离线结果当作真实服务承诺。
