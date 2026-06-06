// UUID生成工具
export function generateId(): string {
  return crypto.randomUUID()
}

// 防抖函数
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer)
    timer = setTimeout(() => fn(...args), delay)
  }
}

// 节流函数
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastTime = 0
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastTime >= delay) {
      lastTime = now
      fn(...args)
    }
  }
}

// 日期格式化
export function formatDate(timestamp: number, format: string = 'YYYY-MM-DD HH:mm:ss'): string {
  const date = new Date(timestamp)
  const pad = (n: number) => String(n).padStart(2, '0')
  
  return format
    .replace('YYYY', String(date.getFullYear()))
    .replace('MM', pad(date.getMonth() + 1))
    .replace('DD', pad(date.getDate()))
    .replace('HH', pad(date.getHours()))
    .replace('mm', pad(date.getMinutes()))
    .replace('ss', pad(date.getSeconds()))
}

// 文件大小格式化
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

// 题型显示名称
export function getQuestionTypeName(type: string): string {
  const map: Record<string, string> = {
    single: '单选题',
    multiple: '多选题',
    trueFalse: '判断题',
    blank: '填空题',
    shortAnswer: '简答题'
  }
  return map[type] || type
}

// 选项标签 A B C D ...
export function getOptionLabel(index: number): string {
  return String.fromCharCode(65 + index)
}

// 从 questionJudge 重新导出
export { countBlanks, parseMultiSelectAnswer } from './questionJudge'
