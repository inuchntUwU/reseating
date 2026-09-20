/** 座席の識別子。`${row}-${col}` 形式で row / col は 0 始まり。 */
export type SeatId = string

export type Layout = {
  rows: number
  cols: number
  /** 通路・欠席などで使わない席 */
  disabled: SeatId[]
}

export type Person = {
  id: string
  name: string
}

export type PersonConstraint = {
  personId: string
  /** 前から数えて何行目までに座らせるか。1 始まり。 */
  maxRow?: number
  fixedSeat?: SeatId
}

/** この 2 人を隣り合わせにしない */
export type ForbiddenPair = {
  a: string
  b: string
}

export type Assignment = Record<SeatId, string>

export type AppState = {
  version: 1
  layout: Layout
  people: Person[]
  constraints: PersonConstraint[]
  forbiddenPairs: ForbiddenPair[]
  assignment: Assignment | null
}
