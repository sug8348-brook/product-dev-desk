import type { Project } from "../types";

export const initialFactoryOptions = ["苏州样机工厂", "宁波制造工厂", "成都制造基地"];

export const initialProjects: Project[] = [
  {
    id: "p1",
    title: "MX-2400 模块化输送机",
    description: "跟进结构方案、电控选型、样机验证和量产风险。",
    developmentFactory: "苏州样机工厂",
    manufacturingFactory: "宁波制造工厂",
    status: "active",
    priority: "high",
    progress: 68,
    updatedAt: "今天 15:20",
    tags: ["输送设备", "样机", "本周重点"],
    subprojects: [
      {
        id: "sp1",
        title: "结构与传动方案",
        dueDate: "2026-07-30",
        status: "active",
        progress: 80,
        tasks: [
          {
            id: "t1",
            title: "确认皮带张紧机构调整方案",
            status: "doing",
            priority: "high",
            due: "2026-07-10",
            memo: "结构",
            tags: ["结构"],
          },
          {
            id: "t2",
            title: "输出电机减速比复核记录",
            status: "todo",
            priority: "medium",
            due: "2026-07-11",
            memo: "传动",
            tags: ["传动"],
          },
        ],
      },
      {
        id: "sp2",
        title: "样机验证准备",
        dueDate: "2026-08-08",
        status: "blocked",
        progress: 45,
        tasks: [
          {
            id: "t3",
            title: "等待供应商确认导轨交期",
            status: "blocked",
            priority: "urgent",
            due: "",
            memo: "供应链",
            tags: ["供应链"],
          },
        ],
      },
    ],
    notes: [
      {
        id: "n1",
        title: "7月9日方案评审纪要",
        type: "评审纪要",
        body: "张紧机构采用偏心调节方案，导轨交期仍需供应商二次确认。",
        updatedAt: "今天",
      },
      {
        id: "n2",
        title: "样机阶段风险摘要",
        type: "阶段总结",
        body: "样机风险集中在导轨、减速机和现场安装空间，需在下轮评审前完成复核。",
        updatedAt: "昨天",
      },
    ],
    attachments: [
      { id: "a1", name: "BOM-样机版.xlsx", kind: "Spreadsheet", size: "82 KB", note: "样机采购清单" },
      { id: "a2", name: "结构方案评审记录.docx", kind: "Document", size: "124 KB", note: "7月9日评审输出" },
    ],
  },
  {
    id: "p2",
    title: "EP-18 电驱控制箱",
    description: "沉淀控制箱布局、线束规范、散热验证和测试记录。",
    developmentFactory: "苏州样机工厂",
    manufacturingFactory: "成都制造基地",
    status: "active",
    priority: "medium",
    progress: 35,
    updatedAt: "昨天 18:40",
    tags: ["电控", "验证"],
    subprojects: [
      {
        id: "sp3",
        title: "电气设计输入",
        dueDate: "2026-08-15",
        status: "active",
        progress: 35,
        tasks: [
          {
            id: "t4",
            title: "整理端子排与线束编号规则",
            status: "todo",
            priority: "medium",
            due: "2026-07-15",
            memo: "电气",
            tags: ["电气"],
          },
        ],
      },
    ],
    notes: [
      {
        id: "n3",
        title: "控制箱设计输入草案",
        type: "机型说明",
        body: "先固化端子排、线束编号和散热验证边界，再进入样箱图纸冻结。",
        updatedAt: "昨天",
      },
    ],
    attachments: [
      { id: "a3", name: "I-O点表.xlsx", kind: "Spreadsheet", size: "9 KB", note: "电气输入版本" },
    ],
  },
  {
    id: "p3",
    title: "AT-05 自动上料单元",
    description: "企划阶段，待确认目标节拍、成本边界和关键供应商。",
    developmentFactory: "",
    manufacturingFactory: "",
    status: "paused",
    priority: "low",
    progress: 20,
    updatedAt: "周一",
    tags: ["自动化", "企划"],
    subprojects: [],
    notes: [],
    attachments: [],
  },
];
