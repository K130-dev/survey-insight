<div align="center">
<img width="1200" height="475" alt="Survey Insight Banner" src="./hero.png" />
</div>

# Survey Insight

Survey Insight 是一款高效的数据分析工具，可将原始 CSV 问卷数据快速转化为精美的交互式仪表盘，并提供 AI 驱动的定性分析洞察。适用于用户调研、员工满意度调查、市场研究等多种场景。

[Live Demo](https://survey-insight.vercel.app) · [Report Bug](https://github.com/K130-dev/survey-insight/issues)

---

## Features

### 📊 智能数据可视化
- 自动识别列类型（单选题、多选题、评分题、文本）
- 饼图、柱状图等多种图表类型
- 实时交叉筛选，深入挖掘数据洞察

### 🤖 AI 驱动的定性分析
- 基于 MiniMax API 自动总结开放式文本回答
- 提取关键主题并计算占比分布
- 生成结构化的分析报告

### 👥 多维度人群画像
- 支持按属性字段（如年龄、性别、部门）筛选人群
- 多条件组合筛选，精准定位目标群体
- 动态更新所有图表数据

### 📤 便捷的数据处理
- 支持 CSV 文件上传（拖拽或点击）
- 提供示例数据集，无需准备数据即可快速体验
- 响应式设计，支持桌面和移动端

---

## Supported Column Types

| 类型 | 说明 | 可视化 |
|------|------|--------|
| **单选题** | 有限选项且互斥的题目 | 饼图 |
| **多选题** | 可选择多个选项的题目 | 水平柱状图（按频率排序） |
| **评分题** | 数值评分（如 1-10 分） | 柱状图 + 平均分显示 |
| **属性字段** | 用于筛选的分类数据 | 侧边栏筛选器 |
| **文本题** | 开放式文字回答 | AI 智能摘要 |

---

## Quick Start

### Prerequisites

- Node.js 18+
- MiniMax API Key ([获取地址](https://platform.minimaxi.com/))

### Local Development

```bash
# 1. 克隆仓库
git clone https://github.com/K130-dev/survey-insight.git
cd survey-insight

# 2. 安装依赖
npm install

# 3. 配置环境变量
cp .env.example .env
# 编辑 .env 文件，填入你的 MINIMAX_API_KEY

# 4. 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### Vercel 部署

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/K130-dev/survey-insight)

部署后需在 Vercel 项目设置中配置 `MINIMAX_API_KEY` 环境变量。

---

## Usage

### 1. 上传数据

页面顶部提供两种方式：
- **上传数据**：点击按钮选择 CSV 文件，或直接拖拽到上传区域
- **使用示例数据**：点击加载内置的员工满意度数据集，快速体验完整功能

### 2. 配置列类型

系统会根据列名和数据内容自动推断列类型。你可以手动调整：

- 选择列的类型（属性/单选题/多选题/评分题/文本/忽略）
- 点击确认进入分析仪表盘

### 3. 分析仪表盘

**结果洞察**：查看所有图表的汇总数据，使用顶部筛选器按单选题选项交叉筛选。

**对比分析**：选择两个分类维度，对比不同群体的回答差异。

**人群画像**：基于属性字段描绘目标人群特征。

### CSV 格式要求

```csv
Response ID,Submission Date,Age Group,Gender,Department,Overall Satisfaction,NPS Score,Product Feedback
R_001,2024-03-01,25-34,Female,Product,Satisfied,8,"Great features but load times increased"
R_002,2024-03-01,18-24,Male,Engineering,Very Satisfied,10,"Seamless integration with existing stack"
```

- 首行必须为列标题
- 支持 UTF-8 编码
- 建议最大 10MB

---

## Tech Stack

| 分类 | 技术 |
|------|------|
| **前端框架** | React 19 + TypeScript |
| **构建工具** | Vite 6 |
| **样式** | TailwindCSS 4 |
| **图表** | Recharts |
| **动画** | Motion (Framer Motion) |
| **CSV 解析** | PapaParse |
| **后端** | Express.js (Vercel Functions) |
| **AI 集成** | MiniMax API |
| **部署** | Vercel |

---

## Project Structure

```
survey-insight/
├── api/
│   └── summarize.ts          # AI 文本摘要 API
├── src/
│   ├── App.tsx               # 主应用入口
│   ├── index.css             # 全局样式 + Tailwind
│   ├── components/
│   │   ├── HomePreview.tsx   # 首页图表预览卡片
│   │   ├── FileUpload.tsx    # CSV 文件上传组件
│   │   ├── ColumnMapper.tsx  # 列类型配置组件
│   │   ├── Dashboard.tsx     # 分析仪表盘主组件
│   │   ├── charts/           # 图表组件
│   │   │   ├── PieChart.tsx
│   │   │   ├── BarChart.tsx
│   │   │   └── StackedBarChart.tsx
│   │   └── analysis/         # AI 分析组件
│   │       ├── TextSummary.tsx
│   │       ├── AudienceAnalysis.tsx
│   │       └── ComparisonAnalysis.tsx
│   ├── data/
│   │   └── sampleData.ts     # 示例数据集
│   └── lib/
│       ├── minimax.ts       # MiniMax API 封装
│       ├── statistics.ts     # 统计计算工具
│       └── utils.ts          # 通用工具函数
├── .env.example              # 环境变量示例
├── package.json
└── vite.config.ts
```

---

## API

### POST /api/summarize

AI 文本摘要接口。

**请求体：**
```json
{
  "question": "请分析以下产品反馈",
  "answers": ["反馈内容1", "反馈内容2", "反馈内容3"]
}
```

**响应：**
```json
{
  "text": "### 主题分布\n\n**性能问题 (占比 40%)**\n- 用户反映加载速度变慢\n\n**功能建议 (占比 35%)**\n- 希望增加更多自定义选项\n\n**其他 (占比 25%)**\n..."
}
```

---

## Environment Variables

| 变量 | 必填 | 说明 |
|------|------|------|
| `MINIMAX_API_KEY` | 是 | MiniMax API 密钥 |

---

## License

MIT
