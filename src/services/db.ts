import Dexie, { type EntityTable } from 'dexie'
import type {
  Folder,
  QuestionBank,
  Question,
  Note,
  NoteVersion,
  NoteLink,
  Tag,
  WrongBook,
  WrongBookQuestionRef,
  PracticeSession,
  PracticeAnswer,
  AppSettings
} from '@/types/database'

class ZhixingNotesDB extends Dexie {
  folders!: EntityTable<Folder, 'id'>
  questionBanks!: EntityTable<QuestionBank, 'id'>
  questions!: EntityTable<Question, 'id'>
  notes!: EntityTable<Note, 'id'>
  noteVersions!: EntityTable<NoteVersion, 'id'>
  noteLinks!: EntityTable<NoteLink, 'id'>
  tags!: EntityTable<Tag, 'id'>
  wrongBooks!: EntityTable<WrongBook, 'id'>
  wrongBookQuestionRefs!: EntityTable<WrongBookQuestionRef, 'id'>
  practiceSessions!: EntityTable<PracticeSession, 'id'>
  practiceAnswers!: EntityTable<PracticeAnswer, 'id'>
  settings!: EntityTable<AppSettings, 'id'>

  constructor() {
    super('ZhixingNotesDB')

    this.version(1).stores({
      folders: 'id, moduleType, parentId, bankId',
      questionBanks: 'id',
      questions: 'id, bankId, folderId',
      notes: 'id, folderId',
      noteVersions: 'id, noteId',
      noteLinks: 'id, sourceNoteId, targetNoteId',
      tags: 'id, name, noteId',
      wrongBooks: 'id, sourceType, sourceId',
      wrongBookQuestionRefs: 'id, wrongBookId, questionId',
      practiceSessions: 'id, sourceType, sourceId, status',
      practiceAnswers: 'id, sessionId, questionId',
      settings: 'id'
    })
  }
}

export const db = new ZhixingNotesDB()

// 初始化默认数据
export async function initDefaultData(): Promise<void> {
  const settingsCount = await db.settings.count()
  if (settingsCount === 0) {
    await db.settings.add({
      id: 'default',
      data: {
        defaultModule: 'notes',
        autoSaveInterval: 500,
        editorFontSize: 15,
        editorTheme: 'light',
        quizOrder: 'random',
        autoAdvanceOnCorrect: false,
        sidebarWidth: 240
      }
    })
  }

  // 检查是否有"我的笔记"根目录
  const notesRoot = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (!notesRoot) {
    await db.folders.add({
      id: crypto.randomUUID(),
      moduleType: 'notes',
      parentId: null,
      bankId: null,
      name: '我的笔记',
      sortKey: 0
    })
  }

  // 检查是否有"我的题库"根目录
  const questionsRoot = await db.folders.where({ moduleType: 'questions', parentId: null }).first()
  if (!questionsRoot) {
    await db.folders.add({
      id: crypto.randomUUID(),
      moduleType: 'questions',
      parentId: null,
      bankId: null,
      name: '我的题库',
      sortKey: 0
    })
  }

  // ===== 示例题库：计算机网络 =====
  const existingBanks = await db.questionBanks.count()
  if (existingBanks === 0) {
    await initSampleBank()
  }
}

/** 创建示例题库：计算机网络 */
async function initSampleBank(): Promise<void> {
  const genId = () => crypto.randomUUID()

  // 创建题库 + 根章节
  const rootFolderId = genId()
  const bankId = genId()

  await db.folders.add({ id: rootFolderId, moduleType: 'questions', parentId: null, bankId: null, name: '全部题目', sortKey: 0 })

  await db.questionBanks.add({ id: bankId, name: '计算机网络', rootFolderId, createdAt: Date.now() - 86400000 })
  await db.folders.update(rootFolderId, { bankId: bankId })

  // 章节定义
  const ch1 = genId()
  const ch2 = genId()
  const ch3 = genId()

  const folderData = [
    { id: ch1, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第一章 概述', sortKey: 0 },
    { id: ch2, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第二章 物理层', sortKey: 1 },
    { id: ch3, moduleType: 'questions' as const, parentId: rootFolderId, bankId, name: '第三章 数据链路层', sortKey: 2 }
  ]
  for (const f of folderData) {
    await db.folders.add(f)
  }

  // 示例题目
  const questions: any[] = [
    // ========== 第一章 概述（单选+多选+判断） ==========
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 1,
      type: 'single' as const,
      content: 'TCP/IP 参考模型共分为几层？',
      options: [
        { label: 'A', text: '3层', isCorrect: false },
        { label: 'B', text: '4层', isCorrect: true },
        { label: 'C', text: '5层', isCorrect: false },
        { label: 'D', text: '7层', isCorrect: false }
      ],
      answer: true,
      explanation: 'TCP/IP参考模型分为四层：应用层、传输层、网际层（网络层）、网络接口层。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 2,
      type: 'single' as const,
      content: '在OSI参考模型中，负责端到端可靠传输的是哪一层？',
      options: [
        { label: 'A', text: '网络层', isCorrect: false },
        { label: 'B', text: '传输层', isCorrect: true },
        { label: 'C', text: '会话层', isCorrect: false },
        { label: 'D', text: '表示层', isCorrect: false }
      ],
      answer: true,
      explanation: '传输层提供端到端的可靠或不可靠的数据传输服务，TCP协议就工作在这一层。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 3,
      type: 'multiple' as const,
      content: '以下哪些属于应用层协议？（多选）',
      options: [
        { label: 'A', text: 'HTTP', isCorrect: true },
        { label: 'B', text: 'IP', isCorrect: false },
        { label: 'C', text: 'DNS', isCorrect: true },
        { label: 'D', text: 'TCP', isCorrect: false }
      ],
      answer: ['A', 'C'],
      explanation: 'HTTP和DNS是应用层协议；IP是网络层协议；TCP是传输层协议。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch1, originalIndex: 4,
      type: 'trueFalse' as const,
      content: '互联网的英文缩写是Internet。',
      options: [],
      answer: true,
      explanation: 'Internet即因特网/互联网，是全球最大的计算机网络系统。',
      stableKey: genId()
    },

    // ========== 第二章 物理层（单选+填空） ==========
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 1,
      type: 'single' as const,
      content: '以下哪种传输介质抗电磁干扰能力最强？',
      options: [
        { label: 'A', text: '双绞线', isCorrect: false },
        { label: 'B', text: '同轴电缆', isCorrect: false },
        { label: 'C', text: '光纤', isCorrect: true },
        { label: 'D', text: '无线电波', isCorrect: false }
      ],
      answer: true,
      explanation: '光纤使用光信号传输，不受电磁干扰影响，且传输距离远、带宽高。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 2,
      type: 'single' as const,
      content: '奈奎斯特定理描述了什么关系？',
      options: [
        { label: 'A', text: '信噪比与信道容量', isCorrect: false },
        { label: 'B', text: '带宽与最大数据传输率', isCorrect: true },
        { label: 'C', text: '信号衰减与距离', isCorrect: false },
        { label: 'D', text: '误码率与噪声', isCorrect: false }
      ],
      answer: true,
      explanation: '奈奎斯特定理指出：无噪声理想信道的最大码元传输速率=2W Baud（W为带宽）。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 3,
      type: 'blank' as const,
      content: '香农公式中，信道容量C与带宽B和信噪比S/N的关系为 C = ___ × log₂(1 + S/N)。',
      options: [],
      answer: ['B'],
      explanation: '香农公式：C = B·log₂(1+S/N)，其中B是信道带宽(Hz)，S/N是信噪比。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch2, originalIndex: 4,
      type: 'trueFalse' as const,
      content: '光纤通信中，单模光纤比多模光纤传输距离更短。',
      options: [],
      answer: false,
      explanation: '恰恰相反。单模光纤只允许一种模式的光传播，色散小，适合长距离传输；多模光纤存在模间色散，适用于短距离。',
      stableKey: genId()
    },

    // ========== 第三章 数据链路层（多选+简答+判断） ==========
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 1,
      type: 'multiple' as const,
      content: '以下关于以太网帧结构的说法正确的有：（多选）',
      options: [
        { label: 'A', text: '前导码用于时钟同步', isCorrect: true },
        { label: 'B', text: '目的MAC地址长度为6字节', isCorrect: true },
        { label: 'C', text: '类型字段标识上层协议', isCorrect: true },
        { label: 'D', text: 'FCS使用MD5算法计算', isCorrect: false }
      ],
      answer: ['A', 'B', 'C'],
      explanation: 'FCS（帧检验序列）使用CRC循环冗余校验，不是MD5。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 2,
      type: 'single' as const,
      content: 'CSMA/CD协议主要用于哪种网络？',
      options: [
        { label: 'A', text: '无线局域网', isCorrect: false },
        { label: 'B', text: '总线型以太网', isCorrect: true },
        { label: 'C', text: '令牌环网', isCorrect: false },
        { label: 'D', text: 'ATM网络', isCorrect: false }
      ],
      answer: true,
      explanation: 'CSMA/CD（载波监听多点接入/碰撞检测）是传统以太网使用的介质访问控制方法。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 3,
      type: 'single' as const,
      content: 'TCP三次握手的正确顺序是？',
      options: [
        { label: 'A', text: 'SYN → SYN+ACK → ACK', isCorrect: true },
        { label: 'B', text: 'ACK → SYN → ACK', isCorrect: false },
        { label: 'C', text: 'SYN → ACK → FIN', isCorrect: false },
        { label: 'D', text: 'FIN → ACK → SYN', isCorrect: false }
      ],
      answer: true,
      explanation: '三次握手过程：客户端发送SYN → 服务端回复SYN+ACK → 客户端发送ACK，连接建立完成。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 4,
      type: 'blank' as const,
      content: 'ARP协议的作用是通过___地址查询___地址。',
      options: [],
      answer: ['IP', 'MAC'],
      explanation: 'ARP（地址解析协议）将网络层的IP地址解析为数据链路层的MAC地址。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 5,
      type: 'trueFalse' as const,
      content: '交换机工作在OSI模型的第三层（网络层）。',
      options: [],
      answer: false,
      explanation: '交换机主要工作在第二层（数据链路层），根据MAC地址转发帧。三层交换机才具备路由功能。',
      stableKey: genId()
    },
    {
      id: genId(), bankId, folderId: ch3, originalIndex: 6,
      type: 'shortAnswer' as const,
      content: '请简述滑动窗口协议的基本原理。',
      options: [],
      answer: '发送方维护一个发送窗口，接收方维护一个接收窗口。窗口内的帧可以连续发送而无需逐帧确认，窗口大小决定了未确认帧的最大数量。通过滑动窗口实现流量控制和可靠传输。',
      explanation: '滑动窗口是TCP等可靠传输协议的核心机制，兼顾了效率和可靠性。',
      stableKey: genId()
    }
  ]

  await db.questions.bulkAdd(questions)

  // ===== 示例费曼笔记 =====
  const notesRoot = await db.folders.where({ moduleType: 'notes', parentId: null }).first()
  if (notesRoot) {
    const noteId = genId()
    const now = Date.now() - 86400000

    await db.notes.add({
      id: noteId,
      folderId: notesRoot.id,
      title: 'TCP 三次握手',
      content: `## 问题
> 为什么 TCP 建立连接需要三次握手，而不是两次或四次？

## 重点
- **三次握手**是 TCP 建立可靠连接的核心机制
- 目的：**同步双方的初始序列号** + **确认双方都有收发能力**
- 关键状态：SYN_SENT → SYN_RCVD → ESTABLISHED

## 解释
想象两个人打电话确认对方能听到：

1. **第一次握手（客户端 → 服务端）**：发送 SYN 包
   - 客户端说："我想和你通话，我的初始序列号是 X"
   - 客户端进入 **SYN_SENT** 状态

2. **第二次握手（服务端 → 客户端）**：发送 SYN+ACK 包
   - 服务端说："我听到了，我确认你的序列号 X，我的初始序列号是 Y"
   - 服务端进入 **SYN_RCVD** 状态

3. **第三次握手（客户端 → 服务端）**：发送 ACK 包
   - 客户端说："我收到了你的序列号 Y"
   - 双方都进入 **ESTABLISHED** 状态，连接建立完成！

**为什么不能是两次？**
如果只有两次握手，服务端无法确认客户端是否收到了自己的确认包。可能导致"已失效的连接请求"突然到达服务端，造成资源浪费。

**为什么不需要四次？**
第三次握手的 ACK 可以和后续数据一起发送，合并后效率更高。

## 卡壳点
- 为什么需要序列号？→ 防止旧报文段干扰、保证有序接收
- 如果第三次握手丢失会怎样？→ 服务端会重传 SYN+ACK，客户端重传 ACK
- SYN Flood 攻击是什么？→ 恶意发送大量 SYN 包不完成三次握手，耗尽服务端资源

## 类比
**就像约朋友吃饭：**

| 步骤 | 动作 | 类比 |
|------|------|------|
| 第1次 | "周六有空吗？" | SYN（发起邀请） |
| 第2次 | "有啊，几点？" | SYN+ACK（确认+回应） |
| 第3次 | "那就6点见！" | ACK（最终确认） |

如果是两次握手：你发了"周六有空吗"，但不知道对方到底有没有收到。万一对方没收到呢？你就白等了。第三次握手就是确认"好的我知道你收到了"。

## 总结
> **三次握手 = 双向确认双方收发能力 + 同步初始序列号，用最少的次数实现可靠连接建立。**
`,
      createdAt: now,
      updatedAt: now
    })
  }
}
