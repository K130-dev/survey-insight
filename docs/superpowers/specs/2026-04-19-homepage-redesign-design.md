# Insight 首页重新设计规格

## 概述

将现有首页从简洁的上传页重新设计为沉浸式 Hero 页面，突出品牌调性并展示产品功能预览。目标用户第一眼就能感受到产品的专业性和数据分析能力。

## 设计方向：Hero 沉浸型

## 视觉层级（从上到下）

### 1. 背景层
- 渐变背景：从品牌蓝 `#2e4aff` 向下渐变至浅蓝 `#eff2ff` 再至白色 `#F8FAFC`
- 背景装饰：细微的点阵网格图案（opacity 5-10%），增加科技感
- 背景可有微妙的缓慢渐变动画（可选）

### 2. 标题区（Hero Center）
- "Insight" — Space Grotesk, 7xl-8xl, 白色，居中
- 中文标语 — Inter, xl, 白色/80% opacity
- 徽章标签行 — 3 个小徽章横向排列：
  - "AI 驱动的分析"
  - "支持 CSV"
  - "快速洞察"
  - 样式：白色/20% 背景 + 白色文字 + 圆角 pill 形状

### 3. 数据预览区
- 3 张模拟图表卡片横向排列，居中对齐
- 卡片样式：白色背景，圆角 2xl，轻阴影，hover 时 y: -8 上浮 + 阴影加深
- 卡片内容（模拟数据，非真实）：
  - **饼图卡片**：标题"用户满意度分布"，带动画的环形图，例：满意 65%、一般 25%、不满意 10%
  - **柱状图卡片**：标题"年龄群体分布"，带动画的柱状图，3-4 根柱子
  - **文本洞察卡片**：标题"反馈摘要"，AI 生成的简短文本摘要，带 Sparkles 图标
- 卡片入场动画：依次淡入上浮，间隔 100ms

### 4. CTA 按钮区
- 两个按钮水平居中，gap 16px
- **上传数据**：bg-slate-900，文字白色，hover:bg-slate-800，圆角 xl
- **使用示例数据**：border 2px 白色，文字白色，hover:bg-white/10，圆角 xl
- 按钮下方：细小文字说明"支持 CSV 文件，最大 10MB"

## 布局规格

```
min-h-screen
flex flex-col items-center justify-center
p-8

[渐变背景层]
  [网格装饰层]

[标题区 - text-center mb-12]
  "Insight" - text-7xl/font-display/font-bold/white
  标语 - text-xl/white/80%/mt-4
  徽章行 - flex/gap-3/mt-6

[预览区 - mb-12]
  grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl
  [3 cards with motion animation]

[CTA区]
  flex gap-4
  [上传数据按钮]
  [示例数据按钮]
  说明文字 mt-4
```

## 动效规格

- 页面入场：元素依次淡入上浮（opacity 0→1, y: 20→0）
- 间隔：标题 0ms → 标语 100ms → 徽章 200ms → 预览卡片 300ms (间隔 100ms) → CTA 600ms
- 缓动：`ease-out`，时长 400-600ms
- 预览卡片 hover：`y: -8`，`duration: 300ms`
- 饼图/柱状图：使用 recharts 的 animationDuration 属性（1000-1500ms）

## 保持一致的设计系统

- 字体：Space Grotesk (display), Inter (body)
- 颜色：品牌蓝色系 (`--color-brand-*`)
- 圆角：rounded-2xl（卡片）, rounded-xl（按钮）
- 阴影：`shadow-xl shadow-slate-200/40`，hover 时 `shadow-[0 20px 40px -10px rgba(0,0,0,0.15)]`
- 动画库：motion/react

## 保持不变的功能

- 上传 CSV 的核心交互逻辑不变
- 使用示例数据的功能不变
- 上传后的流程（ColumnMapper → Dashboard）不变
- 文件大小和类型验证保持

## 实现文件

- 修改：`src/App.tsx`（upload 步骤的 JSX）
- 修改：`src/components/FileUpload.tsx`（仅外层容器调整，核心交互不变）
- 新增：`src/components/HomePreview.tsx`（预览卡片组件）

## 状态

已批准，待实现
