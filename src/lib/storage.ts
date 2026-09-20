import type { AppState } from '../types.ts'

const STORAGE_KEY = 'reseating:v1'

export function defaultState(): AppState {
  return {
    version: 1,
    layout: { rows: 5, cols: 6, disabled: [] },
    people: [],
    constraints: [],
    forbiddenPairs: [],
    assignment: null,
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

/**
 * 保存された JSON は壊れていることがあるので、形が合わない部分は既定値で埋める。
 */
function parseState(raw: unknown): AppState {
  const fallback = defaultState()
  if (!isRecord(raw) || raw.version !== 1) return fallback

  const layout = isRecord(raw.layout) ? raw.layout : {}
  const rows = typeof layout.rows === 'number' ? layout.rows : fallback.layout.rows
  const cols = typeof layout.cols === 'number' ? layout.cols : fallback.layout.cols

  return {
    version: 1,
    layout: {
      rows: Math.min(Math.max(Math.trunc(rows), 1), 20),
      cols: Math.min(Math.max(Math.trunc(cols), 1), 20),
      disabled: Array.isArray(layout.disabled)
        ? layout.disabled.filter((id): id is string => typeof id === 'string')
        : [],
    },
    people: Array.isArray(raw.people)
      ? raw.people.filter(
          (person): person is AppState['people'][number] =>
            isRecord(person) && typeof person.id === 'string' && typeof person.name === 'string',
        )
      : [],
    constraints: Array.isArray(raw.constraints)
      ? raw.constraints.filter(
          (constraint): constraint is AppState['constraints'][number] =>
            isRecord(constraint) && typeof constraint.personId === 'string',
        )
      : [],
    forbiddenPairs: Array.isArray(raw.forbiddenPairs)
      ? raw.forbiddenPairs.filter(
          (pair): pair is AppState['forbiddenPairs'][number] =>
            isRecord(pair) && typeof pair.a === 'string' && typeof pair.b === 'string',
        )
      : [],
    assignment: isRecord(raw.assignment) ? (raw.assignment as AppState['assignment']) : null,
  }
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) return defaultState()
    return parseState(JSON.parse(raw))
  } catch {
    // プライベートウィンドウやストレージ無効時は throw しうる
    return defaultState()
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // 保存できなくてもアプリは動き続ける
  }
}

const PANEL_KEY_PREFIX = 'reseating:panel:'

export function loadPanelOpen(id: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(PANEL_KEY_PREFIX + id)
    if (raw === null) return fallback
    return raw === '1'
  } catch {
    return fallback
  }
}

export function savePanelOpen(id: string, open: boolean): void {
  try {
    localStorage.setItem(PANEL_KEY_PREFIX + id, open ? '1' : '0')
  } catch {
    // 保存できなくても開閉は動く
  }
}
