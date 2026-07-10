# Model Dev Board 项目说明文档

## 1. 当前定位

Model Dev Board 是一个面向机电产品开发经理的本地机种开发看板工具。它不再以通用“项目管理”为中心，而是围绕“规划机型”组织开发过程中的对应内容、作业、提要和附件信息。

当前版本是本地可运行的前端 MVP，主要目标是验证产品层级、业务命名、编辑体验和看板布局。数据目前保存在 React 前端运行时状态中，刷新页面后不会持久化。后续会接入本地持久化，并为 Tauri 桌面化预留结构。

## 2. 上一次进度

截至上一轮开发，项目已经完成到以下阶段：

- 已从通用工作看板调整为机种开发看板语境。
- 已建立三栏式主界面：左侧机型导航，中间机型开发内容，右侧机型抽屉。
- 已支持规划机型的新增、编辑、状态调整和删除。
- 已支持对应内容的新增、编辑、状态调整、进度调整和删除。
- 已支持作业的新增、编辑、状态切换、优先级调整、截止日期修改、标签修改和删除。
- 已支持左侧按机型状态筛选：全部机型、开发中、企划中、已量产。
- 已支持项目搜索：按机型名称、说明和标签过滤。
- 已保留提要与附件抽屉展示，但新增/编辑能力尚未实现。
- 已能通过 Vite 构建，并使用本地预览服务查看页面。

当前预览地址通常为：

```txt
http://localhost:4173/
```

该地址来自构建后的静态预览服务：

```powershell
npx vite preview --host 0.0.0.0 --port 4173
```

## 3. 当前技术栈

| 层级 | 当前技术 | 状态 |
|---|---|---|
| 前端框架 | React 19 | 已使用 |
| 语言 | TypeScript | 已使用 |
| 构建工具 | Vite | 已使用 |
| 图标 | lucide-react | 已使用 |
| 样式 | 原生 CSS | 已使用 |
| 状态管理 | React useState / useMemo | 当前 MVP 使用 |
| 本地持久化 | 未接入 | 待实现 |
| 数据库 | SQLite | 规划中 |
| ORM | Drizzle ORM | 规划中 |
| 桌面封装 | Tauri | 规划中 |
| 测试 | 暂未接入 | 待实现 |

当前 `package.json` 脚本：

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "preview": "vite preview --host 127.0.0.1"
}
```

开发过程中为了让 Chrome 能稳定访问，使用过：

```powershell
npx vite build --base ./
npx vite preview --host 0.0.0.0 --port 4173
```

## 4. 当前业务语言

| 通用项目管理概念 | 当前机种开发概念 |
|---|---|
| 项目 | 规划机型 |
| 进行中 | 开发中 |
| 已归档 | 已量产 |
| 未开始 / 暂停 | 企划中 |
| 子项目 | 对应内容 |
| 任务 | 作业 |
| 项目详情 | 机型抽屉 |

## 5. 当前信息架构

```txt
左侧导航
- 品牌与应用名称
- 搜索框
- 状态筛选
  - 全部机型
  - 开发中
  - 企划中
  - 已量产
- 规划机型列表
- 标签列表
- 设置入口

中间工作区
- 当前规划机型标题与说明
- 添加对应内容按钮
- 统计卡片
- 总体进度与标签
- 对应内容列表
  - 对应内容名称
  - 对应内容状态
  - 对应内容进度
  - 作业列表
  - 添加作业按钮

右侧抽屉
- 概览：机型编辑表单
- 提要：提要列表展示
- 附件：附件列表展示
```

## 6. 当前数据模型

当前源码中仍沿用 `Project`、`SubProject`、`WorkTask` 等内部类型名，但产品界面已显示为机种开发语言。后续可以在结构拆分时重命名为更贴合业务的 `ModelPlan`、`ContentSection`、`WorkItem`。

### 6.1 Project / 规划机型

```ts
type Project = {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  progress: number;
  updatedAt: string;
  tags: string[];
  subprojects: SubProject[];
  notes: Note[];
  attachments: Attachment[];
};
```

当前机型状态：

```ts
type Status = "active" | "paused" | "blocked" | "done";
```

界面中规划机型只开放三个状态：

| 值 | 显示 |
|---|---|
| active | 开发中 |
| paused | 企划中 |
| done | 已量产 |

`blocked` 目前保留给对应内容使用。

### 6.2 SubProject / 对应内容

```ts
type SubProject = {
  id: string;
  title: string;
  status: Status;
  progress: number;
  tasks: WorkTask[];
};
```

对应内容当前开放状态：

- 开发中
- 企划中
- 阻塞
- 已量产

### 6.3 WorkTask / 作业

```ts
type WorkTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due: string;
  tags: string[];
};
```

作业状态：

| 值 | 显示 |
|---|---|
| todo | 待处理 |
| doing | 作业中 |
| blocked | 阻塞 |
| done | 已完成 |

作业支持点击左侧状态图标快速推进：

```txt
待处理 -> 作业中 -> 已完成 -> 待处理
阻塞 -> 作业中
```

### 6.4 Note / 提要

```ts
type Note = {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
};
```

当前仅支持展示，尚未支持新增、编辑、删除。

### 6.5 Attachment / 附件

```ts
type Attachment = {
  id: string;
  name: string;
  kind: string;
  size: string;
};
```

当前仅支持展示，尚未支持新增、编辑、删除，也尚未接入真实本地文件系统。

## 7. 已实现功能清单

### 7.1 规划机型

- 新增规划机型。
- 修改机型名称。
- 修改机型说明。
- 修改机型状态。
- 修改优先级。
- 修改总体进度。
- 修改标签。
- 删除规划机型。
- 删除时至少保留一个规划机型，最后一个机型的删除按钮会禁用。
- 左侧列表实时显示机型名称、状态和更新时间。

### 7.2 状态筛选与搜索

- 支持按全部机型查看。
- 支持按开发中查看。
- 支持按企划中查看。
- 支持按已量产查看。
- 支持按机型名称、说明、标签搜索。

### 7.3 对应内容

- 在当前规划机型下新增对应内容。
- 修改对应内容名称。
- 修改对应内容状态。
- 修改对应内容进度。
- 删除对应内容。

### 7.4 作业

- 在对应内容下新增作业。
- 修改作业名称。
- 修改作业状态。
- 修改作业优先级。
- 修改作业截止日期。
- 修改作业标签。
- 删除作业。
- 点击状态图标快速推进作业状态。

### 7.5 提要与附件

- 当前支持查看示例提要。
- 当前支持查看示例附件。
- 新增、编辑、删除尚未实现。

## 8. 当前示例数据

当前内置了三类机电产品开发示例：

- `MX-2400 模块化输送机`
- `EP-18 电驱控制箱`
- `AT-05 自动上料单元`

示例内容覆盖：

- 结构与传动方案
- 样机验证准备
- 电气设计输入
- 供应链阻塞事项
- BOM、评审记录、I/O 点表示例附件

## 9. 当前限制

- 数据只存在于前端运行时，刷新页面后会恢复为内置示例数据。
- 还没有接入 LocalStorage、IndexedDB、SQLite 或 Tauri 文件系统。
- 删除操作当前没有二次确认弹窗。
- 提要和附件还是展示态，尚不能新增和编辑。
- 尚未实现拖拽排序。
- 尚未实现真实文件附件存储。
- 尚未拆分组件，主逻辑主要集中在 `src/main.tsx`。
- 尚未接入自动化测试。

## 10. 推荐下一步

下一步建议优先做本地数据持久化前的两个小闭环：

1. 提要新增/编辑/删除
   - 支持创建机型说明、评审纪要、阶段总结、风险记录。
   - 先使用普通输入框和 textarea，不急着引入富文本。

2. 附件元数据新增/编辑/删除
   - 先记录文件名、类型、大小或备注。
   - 暂不处理真实文件复制与打开。
   - 真实本地文件能力放到 Tauri 阶段。

完成以上两个闭环后，再进入本地持久化：

1. 先接入 `localStorage` 或 IndexedDB 做轻量保存。
2. 再评估是否进入 SQLite + Drizzle。
3. 最后进入 Tauri 桌面化和真实附件目录管理。

## 11. 未来技术路线

### 11.1 短期

- 拆分 `src/main.tsx` 为组件和业务模块。
- 增加提要编辑能力。
- 增加附件元数据能力。
- 增加删除确认。
- 增加浏览器本地持久化。

### 11.2 中期

- 引入更正式的数据访问层。
- 接入 SQLite。
- 设计数据迁移。
- 加入导入/导出。
- 增加基础测试。

### 11.3 长期

- 使用 Tauri 封装桌面应用。
- 管理数据库路径和附件目录。
- 支持真实本地文件选择、复制和打开。
- 支持备份与恢复。
- 视需要加入拖拽排序和更完整的看板视图。

## 12. 当前文件结构

```txt
MCP-Lab/
  docs/
    product-plan.md
  src/
    main.tsx
    styles.css
  index.html
  package.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
```

## 13. 运行方式

安装依赖：

```powershell
npm install
```

开发模式：

```powershell
npm run dev
```

构建：

```powershell
npm run build
```

当前预览推荐方式：

```powershell
npx vite build --base ./
npx vite preview --host 0.0.0.0 --port 4173
```

浏览器访问：

```txt
http://localhost:4173/
```

## 14. 当前验收标准

当前版本可认为完成了“核心层级与执行项管理 MVP”：

- 能创建和维护规划机型。
- 能维护规划机型状态：开发中、企划中、已量产。
- 能创建和维护对应内容。
- 能创建和维护作业。
- 能删除规划机型、对应内容和作业。
- 能通过搜索和状态筛选快速定位机型。
- 能展示提要和附件区域，为下一阶段扩展留出入口。
