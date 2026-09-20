import type { Person } from '../types.ts'

/** 一度に作れる出席番号の上限 */
export const MAX_SEQUENCE = 200

/**
 * 出席番号の並びを作る。start > end なら降順。
 * 名簿は 1 行 1 人なので、呼び出し側で改行区切りにする。
 */
export function numberSequence(start: number, end: number): string[] {
  const from = Math.trunc(start)
  const to = Math.trunc(end)
  if (!Number.isFinite(from) || !Number.isFinite(to)) return []
  const count = Math.min(Math.abs(to - from) + 1, MAX_SEQUENCE)
  const step = from <= to ? 1 : -1
  return Array.from({ length: count }, (_, i) => String(from + i * step))
}

/**
 * テキストを名簿に変換する。同じ名前が残っている間は id を保ち、
 * 制約やペアの参照が切れないようにする。
 */
export function syncPeople(text: string, previous: Person[]): Person[] {
  const unused = new Map<string, string[]>()
  for (const person of previous) {
    const ids = unused.get(person.name) ?? []
    ids.push(person.id)
    unused.set(person.name, ids)
  }

  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((name) => {
      const ids = unused.get(name)
      const id = ids?.shift()
      return { id: id ?? crypto.randomUUID(), name }
    })
}
