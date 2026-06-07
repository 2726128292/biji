# IndexedDB 数据模型

## folders

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | UUID |
| moduleType | notes \| questions | 所属模块 |
| parentId | string \| null | 父文件夹 |
| bankId | string \| null | 题库 ID，仅题库章节使用 |
| name | string | 名称 |
| sortKey | number | 同级排序 |

## questionBanks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 题库 ID |
| name | string | 题库名称 |
| rootFolderId | string | 根章节 |
| createdAt | number | 时间戳 |

## questions

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 题目 ID |
| bankId | string | 原始题库 |
| folderId | string | 原始章节位置 |
| originalIndex | number | 原题号 |
| type | enum | single / multiple / trueFalse / blank / shortAnswer |
| content | string | 题干 |
| options | array | 选项 |
| answer | array \| boolean \| string | 标准答案 |
| explanation | string | 解析 |
| stableKey | string | 重解析时用于匹配 |

## wrongBooks

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 错题本 ID |
| name | string | 用户自定义名称 |
| sourceType | bank \| wrongBook | 来源类型 |
| sourceId | string | 来源题库或错题本 |
| createdAt | number | 创建时间 |

## wrongBookQuestionRefs

| 字段 | 类型 | 说明 |
|---|---|---|
| wrongBookId | string | 目标错题本 |
| questionId | string | 原题引用 |
| addedReason | wrong \| unknown | 加入原因 |
| originalFolderId | string | 原章节位置 |
| originalIndex | number | 原题号 |
| addedAt | number | 加入时间 |
| wrongCount | number | 在该错题本中的答错次数 |

错题本目录不复制存储。界面根据 `question.folderId` 向上读取章节路径，动态生成镜像结构。

## practiceSessions

| 字段 | 类型 | 说明 |
|---|---|---|
| id | string | 本轮练习 |
| sourceType | bank \| wrongBook \| folder | 来源 |
| sourceId | string | 来源 ID |
| targetWrongBookId | string \| null | 目标错题本；为空表示不保存错题 |
| mode | memorize \| quiz | 模式 |
| status | active \| completed \| abandoned | 状态 |
| startedAt | number | 开始时间 |
| completedAt | number \| null | 完成时间 |

## practiceAnswers

| 字段 | 类型 | 说明 |
|---|---|---|
| sessionId | string | 练习 ID |
| questionId | string | 题目 ID |
| submittedAnswer | any | 提交内容 |
| result | correct \| wrong \| unknown | 结果 |
| addedToTarget | boolean | 是否已加入目标错题本 |
| answeredAt | number | 作答时间 |
