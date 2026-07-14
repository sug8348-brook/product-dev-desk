# Model Dev Board 项目说明文档

## 1. 当前定位

Model Dev Board 是一个面向机电产品开发经理的本地机种开发看板工具。它不再以通用“项目管理”为中心，而是围绕“规划机型”组织开发过程中的对应内容、作业、提要和附件信息。

当前版本是本地可运行的前端 MVP，主要目标是验证产品层级、业务命名、编辑体验和看板布局。数据目前保存在 React 前端状态中，并通过浏览器 `localStorage` 做轻量持久化，刷新页面后会恢复上次编辑内容。后续会为 Tauri 桌面化预留更正式的数据访问结构。

## 2. 上一次进度

截至上一轮开发，项目已经完成到以下阶段：

- 已从通用工作看板调整为机种开发看板语境。
- 已建立三栏式主界面：左侧机型导航，中间机型开发内容，右侧机型抽屉。
- 已支持规划机型的新增、编辑、状态调整和删除。
- 已支持对应内容的新增、编辑、预计完成日期调整、收起展开和删除。
- 已支持作业的新增、编辑、状态切换、优先级调整、截止日期修改、备忘录编辑和删除。
- 已支持左侧按机型状态筛选：全部机型、开发中、企划中、已量产。
- 已支持项目搜索：按机型名称、说明和标签过滤。
- 已支持提要的新增、编辑和删除。
- 已支持附件元数据的新增、编辑和删除。
- 已接入浏览器 `localStorage`，支持本地自动保存和刷新恢复。
- 已支持删除确认。
- 已支持 JSON 数据导入、导出和示例数据重置。
- 已调整状态颜色：开发中为黄色，企划中为蓝色，已量产为绿色。
- 已支持为每个规划机型维护开发工厂和制造工厂。
- 已支持在设置中手动添加和删除备选工厂，并在开发/制造工厂下拉框中复用。
- 左侧规划机型列表已显示开发工厂标签，并按工厂名称分配不同标签色。
- 对应内容已改为维护预计完成日期；作业截止日期和对应内容预计完成日期均使用浏览器原生日历选择。
- 已开始拆分 `src/main.tsx`，类型、常量、初始数据、存储逻辑、通用工具、基础组件、左侧栏、工作区、对应内容卡片和右侧快捷面板已独立成模块。
- 已抽出数据访问层入口：`useBoardData` 负责前端数据状态与自动保存，`BoardRepository` 负责持久化读写；当前实现为 `localStorageBoardRepository`。
- 已抽出业务动作层：`useBoardActions` 集中处理规划机型、对应内容、作业、提要、附件、备选工厂和导入导出重置等数据变更。
- 已增加轻量状态提示层：`useNotice` 与 `AppNotice` 用于导入、导出、重置的成功/失败反馈，替代导入失败时的阻塞式 `alert`。
- 已能通过 Vite 构建，并使用本地预览服务查看页面。

当前预览地址通常为：

```txt
http://localhost:4173/
```

该地址来自构建后的静态预览服务。当前固定预览方式为：

```powershell
npm run build
npm run preview
```

`npm run preview` 使用项目内 `scripts/preview-dist.mjs` 服务 `dist/` 目录，不再依赖 `vite preview` 的后台启动行为。默认优先使用 `4173` 端口；如果端口被占用，会自动尝试后续端口，并以控制台实际打印的地址为准。

## 3. 当前技术栈

| 层级 | 当前技术 | 状态 |
|---|---|---|
| 前端框架 | React 19 | 已使用 |
| 语言 | TypeScript | 已使用 |
| 构建工具 | Vite | 已使用 |
| 图标 | lucide-react | 已使用 |
| 样式 | 原生 CSS | 已使用 |
| 状态管理 | React useState / useMemo | 当前 MVP 使用 |
| 状态提示 | useNotice / AppNotice | 已接入轻量提示 |
| 业务动作层 | useBoardActions | 已抽出 |
| 数据访问层 | BoardRepository / useBoardData | 已兼容同步/异步 repository |
| 本地持久化 | localStorage / SQLite | 浏览器走 localStorage，Tauri 桌面走 SQLite |
| 数据库 | SQLite | Schema、migration、映射层、Tauri SQL 插件和重启恢复验收已完成 |
| ORM | Drizzle ORM | 规划中 |
| 桌面封装 | Tauri | 已初始化并可构建安装包 |
| 测试 | 暂未接入 | 待实现 |

SQLite migration 已于 2026-07-13 使用内存数据库完成一次基础验证：5 个 migration 可顺序执行，默认数据可 seed，项目、对应内容、作业、笔记、附件、标签关系可写入，附件单一归属约束可生效。

SQLite 代码层已抽出 `sqliteBoardMapper.ts`、`sqliteBoardRepository.ts` 和 `tauriSqliteBoardDriver.ts`。浏览器预览环境自动使用 `localStorage`，Tauri 桌面环境自动使用 SQLite。

`useBoardData` 已改为兼容同步/异步 repository：加载完成前不会触发保存，避免未来 SQLite 异步读取尚未完成时被内置示例数据覆盖。

Tauri 已于 2026-07-13 初始化并完成构建验证：`cargo check` 通过，`npm run tauri -- build --debug` 成功生成 MSI 与 NSIS 安装包，构建出的 `app.exe` 已完成启动冒烟验证。当前使用 Rust `1.88.0-x86_64-pc-windows-msvc` 工具链验证通过。

SQLite 桌面端持久化已于 2026-07-14 完成基础验收：Tauri SQL 插件权限已补充 `sql:allow-execute`，桌面端启动后可将内置项目写入 `product-dev-desk.db`，重启后可从 SQLite 恢复 3 个项目、3 个对应内容、4 个作业、3 条提要、3 条附件元数据、11 个标签关联和 3 个备选工厂。

当前 `package.json` 脚本：

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "preview": "node scripts/preview-dist.mjs",
  "tauri": "tauri",
  "desktop": "tauri dev",
  "desktop:build": "tauri build"
}
```

构建产物使用 Vite `base: "./"`，因此静态资源为相对路径，既可被 `scripts/preview-dist.mjs` 服务，也便于后续桌面封装。

开发过程中曾使用过：

```powershell
npx vite build --base ./
npx vite preview --host 0.0.0.0 --port 4173
```

但在当前 Windows + Codex 工具环境中，`Start-Process npx/node ... vite preview` 可能出现“日志显示 Local 地址，但实际没有端口监听”的情况。后续预览不要再依赖这种后台启动方式。

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
  - 开发工厂彩色标签
- 标签列表
- 数据工具与设置入口
  - 备选工厂新增与删除

中间工作区
- 当前规划机型标题与说明
- 当前规划机型开发工厂与制造工厂
- 添加对应内容按钮
- 统计卡片
- 总体进度与标签
- 对应内容列表
  - 对应内容名称
  - 对应内容预计完成日期
  - 作业列表
  - 添加作业按钮

右侧抽屉
- 概览：机型编辑表单
  - 开发工厂
  - 制造工厂
- 提要：提要列表与编辑
- 附件：附件元数据列表与编辑
```

## 6. 当前数据模型

当前源码中仍沿用 `Project`、`SubProject`、`WorkTask` 等内部类型名，但产品界面已显示为机种开发语言。后续可以在结构拆分时重命名为更贴合业务的 `ModelPlan`、`ContentSection`、`WorkItem`。

浏览器端本地保存使用带版本号的数据包：

```ts
type StoredBoardData = {
  version: 1;
  projects: Project[];
  factoryOptions: string[];
};
```

当前存储键为 `model-dev-board.projects.v1`。读取失败、版本不匹配或数据为空时，会回退到内置示例数据。旧缓存中缺少工厂字段时，会自动补为空值，并保留可继续编辑。已保存的备选工厂列表以用户数据为准，不会在刷新后重新追加被用户删除的内置默认工厂；仅旧数据完全缺少 `factoryOptions` 字段时才补入默认备选工厂。

### 6.1 Project / 规划机型

```ts
type Project = {
  id: string;
  title: string;
  description: string;
  developmentFactory: string;
  manufacturingFactory: string;
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
  dueDate: string;
  status?: Status;
  progress?: number;
  tasks: WorkTask[];
};
```

对应内容界面当前只维护名称、预计完成日期和作业列表。`status` 与 `progress` 作为旧数据兼容字段保留，界面不再显示。

### 6.3 WorkTask / 作业

```ts
type WorkTask = {
  id: string;
  title: string;
  status: TaskStatus;
  priority: Priority;
  due: string;
  memo: string;
  tags: string[];
};
```

`tags` 目前作为旧数据兼容字段保留；界面右侧标签用于显示作业状态，备忘录通过折叠区域编辑。

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
  body: string;
  updatedAt: string;
};
```

当前支持新增、编辑、删除。提要类型建议先使用：机型说明、评审纪要、阶段总结、风险记录。

### 6.5 Attachment / 附件

```ts
type Attachment = {
  id: string;
  name: string;
  kind: string;
  size: string;
  note: string;
};
```

当前支持附件元数据的新增、编辑、删除，字段包含名称、类型、大小和备注。尚未接入真实本地文件系统。

## 6.6 SQLite Schema 草案

SQLite 阶段优先服务当前本地个人工作看板 MVP，同时为未来“自然语言需求 -> 树状图/思维导图 -> 垂直领域本地看板应用”的生成流程保留架构出口。当前不实现完整低代码平台，也不把所有数据塞进万能 `nodes` 表。

### 6.6.1 设计原则

- 使用 SQLite 原生能力，启动时必须执行 `PRAGMA foreign_keys = ON;`。
- 所有主表使用 `TEXT` 类型稳定 ID，建议由应用层生成 UUID。
- 所有主要表包含 `created_at` 和 `updated_at`。
- 时间字段统一存 UTC ISO-8601 字符串，例如 `2026-07-13T10:30:00.000Z`。
- 核心业务字段保持可查询、可约束、可迁移，不只存在 JSON 中。
- JSON 仅用于低频展示配置，例如 `layout_config`、`metadata_json`。
- 当前优先清晰业务表；未来抽象能力通过 `entity_type_configs`、`view_type`、`layout_config`、`sort_order`、`parent_id` 预留。

### 6.6.2 数据表清单

| 表 | 用途 |
|---|---|
| `workspaces` | 本地看板空间，当前可只有一个默认 workspace |
| `entity_type_configs` | 内部类型与用户显示名称、颜色、图标的映射 |
| `projects` | 当前规划机型/项目 |
| `project_sections` | 当前对应内容/模块/阶段 |
| `tasks` | 作业/待办 |
| `notes` | 提要、备注、记录 |
| `attachments` | 附件数据库索引，不存文件本体 |
| `tags` | 标签字典 |
| `entity_tags` | 标签与项目、任务、笔记的关联 |
| `factory_options` | 备选工厂 |
| `settings` | 简单全局配置 |
| `schema_migrations` | migration 版本记录 |

### 6.6.3 核心 SQL 草案

```sql
PRAGMA foreign_keys = ON;

CREATE TABLE workspaces (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE entity_type_configs (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  system_type TEXT NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_enabled INTEGER NOT NULL DEFAULT 1,
  view_type TEXT,
  layout_config TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, system_type)
);

CREATE TABLE projects (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'paused',
  priority TEXT NOT NULL DEFAULT 'medium',
  progress INTEGER NOT NULL DEFAULT 0 CHECK(progress BETWEEN 0 AND 100),
  development_factory TEXT NOT NULL DEFAULT '',
  manufacturing_factory TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_pinned INTEGER NOT NULL DEFAULT 0,
  is_archived INTEGER NOT NULL DEFAULT 0,
  metadata_json TEXT,
  display_updated_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE project_sections (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  parent_id TEXT REFERENCES project_sections(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  due_date TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  depth INTEGER NOT NULL DEFAULT 0 CHECK(depth BETWEEN 0 AND 2),
  is_collapsed INTEGER NOT NULL DEFAULT 0,
  view_type TEXT NOT NULL DEFAULT 'collapse',
  layout_config TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  section_id TEXT REFERENCES project_sections(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'todo',
  priority TEXT NOT NULL DEFAULT 'medium',
  due_date TEXT NOT NULL DEFAULT '',
  memo TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_important INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE notes (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  note_type TEXT NOT NULL DEFAULT 'note',
  body TEXT NOT NULL DEFAULT '',
  sort_order INTEGER NOT NULL DEFAULT 0,
  display_updated_at TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 6.6.4 附件方案

附件本体不放入 SQLite。正式桌面阶段使用 Tauri 将文件复制到应用数据目录，SQLite 仅保存元数据和相对路径。

推荐附件关联使用约束式多列外键，而不是纯 `owner_type + owner_id`。

```sql
CREATE TABLE attachments (
  id TEXT PRIMARY KEY,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  original_name TEXT NOT NULL,
  stored_name TEXT NOT NULL UNIQUE,
  relative_path TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'Document',
  display_size TEXT NOT NULL DEFAULT '',
  mime_type TEXT,
  size_bytes INTEGER NOT NULL DEFAULT 0,
  note TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  CHECK (
    (project_id IS NOT NULL) +
    (task_id IS NOT NULL) +
    (note_id IS NOT NULL) = 1
  )
);
```

取舍：

- 不采用纯 `owner_type + owner_id`，因为 SQLite 无法对多态 owner 建立完整外键，容易产生孤儿附件。
- 当前只允许附件关联项目、任务或笔记，约束清晰、级联可靠。
- 未来如果出现客户、供应商等新实体，可迁移为 `attachment_links` 或增加明确外键列。

文件一致性方案：

- 添加附件：先复制文件到 `attachments/{uuid}/{stored_name}`，再写数据库。
- 删除附件：先删除数据库记录，再删除文件；若文件删除失败，记录待清理项，后续启动时扫描孤儿文件。
- 删除项目、任务、笔记：SQLite 级联删除附件记录；应用层事务完成后清理对应文件目录。

### 6.6.5 标签方案

标签同样采用约束式关联，当前支持项目、任务、笔记。

```sql
CREATE TABLE tags (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, name)
);

CREATE TABLE entity_tags (
  id TEXT PRIMARY KEY,
  tag_id TEXT NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  project_id TEXT REFERENCES projects(id) ON DELETE CASCADE,
  task_id TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  note_id TEXT REFERENCES notes(id) ON DELETE CASCADE,
  created_at TEXT NOT NULL,
  CHECK (
    (project_id IS NOT NULL) +
    (task_id IS NOT NULL) +
    (note_id IS NOT NULL) = 1
  )
);

CREATE UNIQUE INDEX uniq_entity_tags_project
  ON entity_tags(tag_id, project_id)
  WHERE project_id IS NOT NULL;

CREATE UNIQUE INDEX uniq_entity_tags_task
  ON entity_tags(tag_id, task_id)
  WHERE task_id IS NOT NULL;

CREATE UNIQUE INDEX uniq_entity_tags_note
  ON entity_tags(tag_id, note_id)
  WHERE note_id IS NOT NULL;
```

### 6.6.6 配置表

```sql
CREATE TABLE factory_options (
  id TEXT PRIMARY KEY,
  workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  UNIQUE(workspace_id, name)
);

CREATE TABLE settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE schema_migrations (
  version TEXT PRIMARY KEY,
  applied_at TEXT NOT NULL
);
```

### 6.6.7 推荐索引

```sql
CREATE INDEX idx_projects_workspace ON projects(workspace_id, sort_order);
CREATE INDEX idx_projects_status ON projects(workspace_id, status);
CREATE INDEX idx_sections_project ON project_sections(project_id, sort_order);
CREATE INDEX idx_tasks_project ON tasks(project_id, sort_order);
CREATE INDEX idx_tasks_section ON tasks(section_id, sort_order);
CREATE INDEX idx_tasks_status ON tasks(project_id, status);
CREATE INDEX idx_notes_project ON notes(project_id, sort_order);
CREATE INDEX idx_attachments_project ON attachments(project_id);
CREATE INDEX idx_attachments_task ON attachments(task_id);
CREATE INDEX idx_attachments_note ON attachments(note_id);
CREATE INDEX idx_entity_tags_tag ON entity_tags(tag_id);
```

### 6.6.8 删除和级联策略

- 删除 workspace：级联删除全部业务数据。
- 删除 project：级联删除 sections、tasks、notes、attachments、标签关联。
- 删除 section：级联删除子 section；tasks 的 `section_id` 使用 `ON DELETE SET NULL`，避免误删任务。
- 删除 task 或 note：级联删除其附件记录和标签关联。
- 删除 tag：级联删除 `entity_tags`，不影响业务实体。

### 6.6.9 用户显示名称和颜色

`entity_type_configs` 用于分离内部类型和用户显示名称。

示例：

| system_type | display_name |
|---|---|
| `project` | 规划机型 / 客户 / 课题 |
| `section` | 对应内容 / 阶段 / 模块 |
| `task` | 作业 / 待办 / 实验任务 |
| `note` | 提要 / 记录 / 跟进纪要 |

用户修改词条时，只更新 `display_name`、`icon`、`color`、`sort_order`、`is_enabled`，不修改底层 `system_type`。

### 6.6.10 未来 Node + Template + View 抽象

当前不建立完整模板系统。未来需要抽象为看板模型和树状图映射 Skill 时，可新增：

```txt
templates
template_entity_types
template_sections
template_views
```

迁移路径：

1. 将当前 `entity_type_configs` 提升为模板中的实体类型配置。
2. 将 `projects / project_sections / tasks / notes` 映射为模板实例数据。
3. 使用 `view_type` 和 `layout_config` 映射列表、看板、折叠栏、抽屉、时间线等展示形式。
4. 保持底层允许的节点类型和关系类型有限、明确、可验证，不开放完全任意递归。

### 6.6.11 当前实现与预留边界

当前建议实现：

- 清晰业务表。
- repository 替换策略。
- JSON 导入数据到 SQLite 的迁移逻辑。
- 附件元数据表和文件路径策略。
- 标签表和约束式关联表。

当前只做预留：

- 完整模板系统。
- 通用 Node 表。
- 多视图布局引擎。
- 任意层级树编辑器。
- Skill 自动生成 UI/DB 的模板编译流程。

### 6.6.12 第一版 migration 拆分

```txt
001_core_workspace_and_configs.sql
002_projects_sections_tasks.sql
003_notes_attachments_tags.sql
004_settings_and_factory_options.sql
005_seed_default_workspace.sql
```

### 6.6.13 示例数据

```sql
INSERT INTO workspaces VALUES
('ws_default', '本地工作看板', '', '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT INTO projects (
  id, workspace_id, title, description, status, priority, progress,
  development_factory, manufacturing_factory, sort_order, is_pinned, is_archived,
  metadata_json, display_updated_at, created_at, updated_at
) VALUES (
  'p1', 'ws_default', 'MX-2400 模块化输送机', '样机开发推进', 'active', 'high', 68,
  '苏州样机工厂', '宁波制造工厂', 0, 1, 0, NULL, '今天',
  '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'
);

INSERT INTO project_sections VALUES
('s1', 'p1', NULL, '结构与传动方案', '2026-07-30', 0, 0, 0, 'collapse', NULL,
 '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT INTO tasks VALUES
('t1', 'p1', 's1', '确认皮带张紧机构调整方案', 'doing', 'high', '2026-07-20',
 '供应商图纸需二次确认', 0, 1,
 '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT INTO notes (
  id, project_id, task_id, title, note_type, body, sort_order,
  display_updated_at, created_at, updated_at
) VALUES (
  'n1', 'p1', NULL, '方案评审纪要', 'review', '张紧机构采用偏心调节方案。', 0,
  '今天', '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'
);

INSERT INTO attachments (
  id, project_id, task_id, note_id, original_name, stored_name, relative_path,
  kind, display_size, mime_type, size_bytes, note, created_at, updated_at
) VALUES (
  'a1', 'p1', NULL, NULL, 'BOM-样机版.xlsx', 'a1-bom.xlsx',
  'attachments/a1/a1-bom.xlsx', 'Spreadsheet', '82 KB',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 83968, '样机采购清单',
  '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z'
);

INSERT INTO tags VALUES
('tag1', 'ws_default', '样机', '#2f6f62',
 '2026-07-13T00:00:00.000Z', '2026-07-13T00:00:00.000Z');

INSERT INTO entity_tags VALUES
('et1', 'tag1', 'p1', NULL, NULL, '2026-07-13T00:00:00.000Z');
```

### 6.6.14 推荐结论

当前最终推荐方案是：不做万能 `nodes` 表，采用清晰业务表，加少量配置表和展示字段预留。关键取舍如下：

- 当前业务清晰度优先：项目、对应内容、任务、笔记、附件、标签都可查询、可约束。
- 未来抽象能力通过 `entity_type_configs`、`view_type`、`layout_config`、`sort_order`、`parent_id` 预留。
- 附件和标签优先完整外键约束，暂不使用纯多态关联。
- 模板能力暂不实现，只保留未来可迁移入口。

## 7. 已实现功能清单

### 7.1 规划机型

- 新增规划机型。
- 修改机型名称。
- 修改机型说明。
- 修改开发工厂。
- 修改制造工厂。
- 在设置中手动添加备选工厂。
- 在设置中删除备选工厂；删除已被机型使用的工厂时，会确认并清空相关机型字段。
- 左侧项目卡片显示开发工厂彩色标签。
- 修改机型状态。
- 修改优先级。
- 修改总体进度。
- 修改标签。
- 删除规划机型。
- 删除前会进行确认。
- 删除时至少保留一个规划机型，最后一个机型的删除按钮会禁用。
- 左侧列表实时显示机型名称、状态和更新时间。

### 7.2 状态筛选与搜索

- 支持按全部机型查看。
- 支持按开发中查看。
- 支持按企划中查看。
- 支持按已量产查看。
- 支持按机型名称、说明、标签搜索。
- 支持按开发工厂和制造工厂搜索。

### 7.3 对应内容

- 在当前规划机型下新增对应内容。
- 修改对应内容名称。
- 修改对应内容预计完成日期。
- 收起和展开对应内容下的作业列表。
- 删除对应内容。
- 删除前会进行确认。

### 7.4 作业

- 在对应内容下新增作业。
- 修改作业名称。
- 修改作业状态。
- 修改作业优先级。
- 修改作业截止日期。
- 修改作业备忘录。
- 作业截止日期使用浏览器原生日历选择，不额外引入日历依赖。
- 作业行右侧显示作业状态标签，备忘录区域可折叠展开。
- 删除作业。
- 删除前会进行确认。
- 点击状态图标快速推进作业状态。

### 7.5 提要与附件

- 支持查看示例提要。
- 支持新增提要。
- 支持修改提要标题、类型、更新时间和正文。
- 支持删除提要。
- 删除提要前会进行确认。
- 支持查看示例附件。
- 支持新增附件元数据。
- 支持修改附件名称、类型、大小和备注。
- 支持删除附件元数据。
- 删除附件元数据前会进行确认。

### 7.6 本地持久化

- 支持将规划机型、对应内容、作业、提要和附件元数据自动保存到浏览器 `localStorage`。
- 支持将备选工厂列表自动保存到浏览器 `localStorage`。
- 支持刷新页面后恢复上次编辑内容。
- 支持读取异常或版本不匹配时回退到内置示例数据。
- 支持对旧缓存中的缺省字段做轻量补齐。
- 支持导出带版本号的 JSON 数据，并在导出后显示成功提示。
- 支持从同版本 JSON 文件导入并替换当前看板数据，导入成功或失败都会显示状态提示。
- 支持重置回内置示例数据，并在重置后显示成功提示。
- `storage.ts` 只负责数据解析与归一化，`repositories/boardRepository.ts` 负责持久化读写，`hooks/useBoardData.ts` 负责连接 React 状态与 repository，`hooks/useBoardActions.ts` 负责集中处理数据变更动作。
- `repositories/sqliteBoardMapper.ts` 负责在 SQLite 关系表行和当前 `BoardData` 之间双向转换。
- `repositories/sqliteBoardRepository.ts` 负责定义异步 SQLite repository 与 driver 契约。
- `repositories/tauriSqliteBoardDriver.ts` 基于 `@tauri-apps/plugin-sql` 实现 SQLite 读写 driver。

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

- 浏览器预览仍使用 `localStorage`，Tauri 桌面环境使用 SQLite。
- 已接入 Tauri SQL 插件和 SQLite migration，并完成桌面端重启恢复验收。
- 真实附件文件复制/打开尚未接入 Tauri 文件系统。
- 当前 SQLite 保存策略是按 workspace 整体替换业务行，后续可按操作粒度优化。
- 附件只维护元数据，尚不能选择、复制或打开真实本地文件。
- 尚未实现拖拽排序。
- 尚未实现真实文件附件存储。
- 页面级结构和业务动作已基本拆出，`src/main.tsx` 目前主要保留页面状态、筛选统计和页面拼装。
- 尚未接入自动化测试。

## 10. 推荐下一步

下一步建议继续完善结构和数据安全：

1. 接入真实附件文件选择、复制、打开和清理流程。
2. 为 SQLite repository 增加基础自动化测试或脚本级回归验证。
3. 将当前 SQLite 整体替换保存逐步优化为操作级写入。

## 11. 未来技术路线

### 11.1 短期

- 设计真实附件目录和文件生命周期。
- 为 SQLite repository 增加脚本级回归验证。
- 梳理导入/导出与数据迁移策略。

### 11.2 中期

- 视复杂度决定是否继续引入 Drizzle ORM。
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
product dev desk/
  db/
    migrations/
      001_core_workspace_and_configs.sql
      002_projects_sections_tasks.sql
      003_notes_attachments_tags.sql
      004_settings_and_factory_options.sql
      005_seed_default_workspace.sql
  docs/
    product-plan.md
  scripts/
    preview-dist.mjs
  src-tauri/
    capabilities/
      default.json
    src/
      lib.rs
      main.rs
    Cargo.toml
    tauri.conf.json
  src/
    components/
      AppNotice.tsx
      BoardWidgets.tsx
      DateField.tsx
      QuickPanel.tsx
      Sidebar.tsx
      SubProjectCard.tsx
      Workspace.tsx
    data/
      initialData.ts
    hooks/
      useBoardActions.ts
      useBoardData.ts
      useNotice.ts
    repositories/
      activeBoardRepository.ts
      boardRepository.ts
      sqliteBoardMapper.ts
      sqliteBoardRepository.ts
      tauriSqliteBoardDriver.ts
    utils/
      factoryColors.ts
      progress.ts
      tags.ts
    constants.ts
    main.tsx
    storage.ts
    styles.css
    types.ts
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
npm run build
npm run preview
```

桌面开发模式：

```powershell
npm run desktop
```

桌面安装包构建：

```powershell
npm run desktop:build
```

当前已验证可生成：

```txt
src-tauri/target/release/bundle/msi/product-dev-desk_0.1.0_x64_en-US.msi
src-tauri/target/release/bundle/nsis/product-dev-desk_0.1.0_x64-setup.exe
```

浏览器访问：

```txt
http://localhost:4173/
```

如果 `4173` 被占用，预览脚本会自动切到下一个可用端口，例如：

```txt
http://127.0.0.1:4174/
```

预览验收建议：

```powershell
Invoke-WebRequest -Uri "http://127.0.0.1:4173/" -UseBasicParsing
```

返回 `200` 且页面内容包含 `Model Dev Board` 时，说明构建产物和本地预览服务正常。若 Chrome 插件访问本地地址时出现 `ERR_BLOCKED_BY_CLIENT` 或超时，应优先按 Chrome 插件/浏览器本地地址拦截问题处理，不要直接判断为项目加载失败。

## 14. 当前验收标准

当前版本可认为完成了“核心层级与执行项管理 MVP”：

- 能创建和维护规划机型。
- 能维护规划机型的开发工厂和制造工厂。
- 能在设置中手动添加和删除备选工厂。
- 能维护规划机型状态：开发中、企划中、已量产。
- 能创建和维护对应内容。
- 能创建和维护作业。
- 能删除规划机型、对应内容和作业。
- 删除关键数据前会出现确认。
- 能通过搜索和状态筛选快速定位机型。
- 能新增、编辑和删除提要与附件元数据。
- 能刷新页面后恢复上次编辑内容。
- 能导出、导入 JSON 数据并重置为示例数据。
