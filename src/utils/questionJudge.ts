import type { Question, QuestionType, AnswerResult } from '@/types/database'
import { getOptionLabel } from '@/utils/index'

/**
 * 题目判定引擎
 * 根据 specs/question-rules.md 实现
 */

/** 判断单选题答案 */
function judgeSingle(question: Question, submitted: any): AnswerResult {
  if (!Array.isArray(submitted)) return 'wrong'
  const correctIndex = question.options.findIndex(o => o.isCorrect)
  if (correctIndex === -1) return 'wrong'
  return submitted[0] === correctIndex ? 'correct' : 'wrong'
}

/** 判断多选题答案 */
function judgeMultiple(question: Question, submitted: any): AnswerResult {
  if (!Array.isArray(submitted)) return 'wrong'
  const correctIndices = question.options
    .map((o, i) => (o.isCorrect ? i : -1))
    .filter(i => i >= 0)
    .sort((a, b) => a - b)
  const sortedSubmitted = [...submitted].sort((a, b) => a - b)
  if (correctIndices.length !== sortedSubmitted.length) return 'wrong'
  return correctIndices.every((v, i) => v === sortedSubmitted[i]) ? 'correct' : 'wrong'
}

/** 判断题文本标准化 */
function normalizeBoolean(input: string): boolean | null {
  const s = input.trim().toLowerCase()
  if (['对', '正确', 'true', '√', 't', 'y'].includes(s)) return true
  if (['错', '错误', 'false', '×', 'x', 'f', 'n'].includes(s)) return false
  return null
}

/** 判断判断题 */
function judgeTrueFalse(question: Question, submitted: any): AnswerResult {
  if (typeof submitted === 'boolean') {
    return submitted === question.answer ? 'correct' : 'wrong'
  }
  if (typeof submitted === 'string') {
    const normalized = normalizeBoolean(submitted)
    if (normalized === null) return 'wrong'
    return normalized === question.answer ? 'correct' : 'wrong'
  }
  return 'wrong'
}

/** 文本归一化：忽略首尾空格、大小写、连续空格 */
function normalizeText(text: string): string {
  return text.trim().toLowerCase().replace(/\s+/g, ' ')
}

/** 判断填空题 */
function judgeBlank(question: Question, submitted: any): AnswerResult {
  if (!Array.isArray(submitted)) submitted = [submitted]
  const correctAnswers: string = Array.isArray(question.answer) 
    ? (question.answer as string[]).join('|') 
    : String(question.answer)
  
  // 正确答案按 || 分割为各空的答案组，每个空内 | 分隔同义答案
  const answerGroups = correctAnswers.split('||').map(g => g.split('|').map(a => normalizeText(a)))
  
  for (let i = 0; i < Math.min(submitted.length, answerGroups.length); i++) {
    const userAns = normalizeText(String(submitted[i]))
    if (!answerGroups[i].some(ans => ans === userAns)) {
      return 'wrong'
    }
  }
  return 'correct'
}

/** 判断简答题 - 不自动评分 */
function judgeShortAnswer(_question: Question, _submitted: any): AnswerResult {
  // 简答题不自动评分，由用户手动判断
  return 'correct' as AnswerResult
}

/** 主判定入口 */
export function judgeAnswer(question: Question, submittedAnswer: any): AnswerResult {
  switch (question.type) {
    case 'single':
      return judgeSingle(question, submittedAnswer)
    case 'multiple':
      return judgeMultiple(question, submittedAnswer)
    case 'trueFalse':
      return judgeTrueFalse(question, submittedAnswer)
    case 'blank':
      return judgeBlank(question, submittedAnswer)
    case 'shortAnswer':
      return judgeShortAnswer(question, submittedAnswer)
    default:
      return 'wrong'
  }
}

/** 格式化用户提交的答案用于显示 */
export function formatSubmittedAnswer(question: Question, submitted: any): string {
  switch (question.type) {
    case 'single':
      return Array.isArray(submitted) && submitted.length > 0
        ? getOptionLabel(submitted[0])
        : String(submitted ?? '')
    case 'multiple':
      return Array.isArray(submitted)
        ? submitted.map(i => getOptionLabel(i)).join('')
        : String(submitted ?? '')
    case 'trueFalse':
      return typeof submitted === 'boolean'
        ? (submitted ? '正确' : '错误')
        : String(submitted ?? '')
    case 'blank':
      return Array.isArray(submitted) ? submitted.join(' / ') : String(submitted ?? '')
    case 'shortAnswer':
      return typeof submitted === 'string' ? submitted : ''
    default:
      return String(submitted ?? '')
  }
}

/** 格式化标准答案用于显示 */
export function formatCorrectAnswer(question: Question): string {
  switch (question.type) {
    case 'single': {
      const idx = question.options.findIndex(o => o.isCorrect)
      return idx >= 0 ? getOptionLabel(idx) : ''
    }
    case 'multiple':
      return question.options
        .map((o, i) => (o.isCorrect ? getOptionLabel(i) : ''))
        .filter(Boolean)
        .join('')
    case 'trueFalse':
      return question.answer ? '正确' : '错误'
    case 'blank':
      return Array.isArray(question.answer)
        ? (question.answer as string[]).join(' | ')
        : String(question.answer)
    case 'shortAnswer':
      return Array.isArray(question.answer)
        ? (question.answer as string[]).join('')
        : String(question.answer)
    default:
      return ''
  }
}

/** 将题干中的下划线转为填空占位符数量 */
export function countBlanks(content: string): number {
  const matches = content.match(/_{3,}/g)
  return matches ? matches.length : 0
}

/** 解析多选答案字符串为数组 */
export function parseMultiSelectAnswer(answer: string | string[]): string[] {
  if (Array.isArray(answer)) return answer
  // 支持 "ACD", "A,C,D", "A C D"
  return answer.replace(/[^A-Z]/gi, '').split('')
}
