import { describe, expect, it } from 'vitest'
import { enabledSeats, neighborsOf, parseSeatId, seatId, solve } from './solver.ts'
import type { ForbiddenPair, Layout, Person, PersonConstraint } from '../types.ts'

/** 再現可能な乱数。mulberry32。 */
function makeRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makePeople(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => ({ id: `p${i}`, name: `生徒${i}` }))
}

function run(
  layout: Layout,
  people: Person[],
  constraints: PersonConstraint[] = [],
  forbiddenPairs: ForbiddenPair[] = [],
  seed = 1,
) {
  return solve({ layout, people, constraints, forbiddenPairs, rng: makeRng(seed) })
}

describe('座席ユーティリティ', () => {
  it('無効席をグリッドから除く', () => {
    const seats = enabledSeats({ rows: 2, cols: 3, disabled: ['0-1'] })
    expect(seats).toEqual(['0-0', '0-2', '1-0', '1-1', '1-2'])
  })

  it('隣接は上下左右のみで、無効席は隣に数えない', () => {
    const layout: Layout = { rows: 3, cols: 3, disabled: ['1-0'] }
    expect(neighborsOf('1-1', layout).sort()).toEqual(['0-1', '1-2', '2-1'])
  })

  it('seatId と parseSeatId が往復する', () => {
    expect(parseSeatId(seatId(4, 2))).toEqual({ row: 4, col: 2 })
  })
})

describe('solve', () => {
  const layout: Layout = { rows: 4, cols: 5, disabled: [] }

  it('全員を別々の有効席に座らせる', () => {
    const people = makePeople(18)
    const result = run(layout, people)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const seats = Object.keys(result.assignment)
    const occupants = Object.values(result.assignment)
    expect(seats).toHaveLength(18)
    expect(new Set(occupants).size).toBe(18)
    for (const seat of seats) expect(enabledSeats(layout)).toContain(seat)
  })

  it('無効席には誰も座らせない', () => {
    const holey: Layout = { rows: 4, cols: 5, disabled: ['0-2', '1-2', '2-2', '3-2'] }
    const result = run(holey, makePeople(16))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    for (const seat of Object.keys(result.assignment)) {
      expect(holey.disabled).not.toContain(seat)
    }
  })

  it('maxRow 指定者を指定行以内に置く', () => {
    const people = makePeople(18)
    const constraints: PersonConstraint[] = [
      { personId: 'p0', maxRow: 1 },
      { personId: 'p1', maxRow: 2 },
    ]
    const result = run(layout, people, constraints)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const seatOf = new Map(
      Object.entries(result.assignment).map(([seat, personId]) => [personId, seat]),
    )
    expect(parseSeatId(seatOf.get('p0')!).row).toBeLessThan(1)
    expect(parseSeatId(seatOf.get('p1')!).row).toBeLessThan(2)
  })

  it('固定席の指定を守る', () => {
    const result = run(layout, makePeople(18), [{ personId: 'p3', fixedSeat: '2-4' }])
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.assignment['2-4']).toBe('p3')
  })

  it('禁止ペアを隣り合わせにしない', () => {
    const people = makePeople(20)
    const pairs: ForbiddenPair[] = [
      { a: 'p0', b: 'p1' },
      { a: 'p2', b: 'p3' },
    ]
    for (let seed = 1; seed <= 20; seed++) {
      const result = run(layout, people, [], pairs, seed)
      expect(result.ok).toBe(true)
      if (!result.ok) return
      for (const [seat, personId] of Object.entries(result.assignment)) {
        for (const neighbor of neighborsOf(seat, layout)) {
          const other = result.assignment[neighbor]
          if (other === undefined) continue
          const forbidden = pairs.some(
            (pair) =>
              (pair.a === personId && pair.b === other) ||
              (pair.b === personId && pair.a === other),
          )
          expect(forbidden).toBe(false)
        }
      }
    }
  })

  it('席より人が多ければ no-seats', () => {
    const result = run({ rows: 2, cols: 2, disabled: ['0-0'] }, makePeople(4))
    expect(result).toMatchObject({ ok: false, reason: 'no-seats' })
  })

  it('前方指定が席数を超えたら empty-domain', () => {
    // 1 行目は 2 席しかないのに 3 人が「前から 1 行目まで」
    const narrow: Layout = { rows: 3, cols: 2, disabled: [] }
    const constraints: PersonConstraint[] = [
      { personId: 'p0', maxRow: 1 },
      { personId: 'p1', maxRow: 1 },
      { personId: 'p2', maxRow: 1 },
    ]
    const result = run(narrow, makePeople(6), constraints)
    expect(result).toMatchObject({ ok: false })
    if (result.ok) return
    expect(['empty-domain', 'unsatisfiable']).toContain(result.reason)
  })

  it('同じ席に 2 人を固定したら fixed-conflict', () => {
    const result = run(layout, makePeople(6), [
      { personId: 'p0', fixedSeat: '1-1' },
      { personId: 'p1', fixedSeat: '1-1' },
    ])
    expect(result).toMatchObject({ ok: false, reason: 'fixed-conflict' })
  })

  it('固定席が自分の前方指定に反したら fixed-conflict', () => {
    const result = run(layout, makePeople(6), [{ personId: 'p0', maxRow: 1, fixedSeat: '3-0' }])
    expect(result).toMatchObject({ ok: false, reason: 'fixed-conflict' })
  })

  it('解が無い禁止ペアの組み合わせでは失敗を返す', () => {
    // 2 席しかない 1 行に、隣り合えない 2 人だけ
    const tiny: Layout = { rows: 1, cols: 2, disabled: [] }
    const result = run(tiny, makePeople(2), [], [{ a: 'p0', b: 'p1' }])
    expect(result.ok).toBe(false)
  })

  it('シードを変えると配置が変わる', () => {
    const people = makePeople(18)
    const first = run(layout, people, [], [], 1)
    const second = run(layout, people, [], [], 99)
    expect(first.ok && second.ok).toBe(true)
    if (!first.ok || !second.ok) return
    expect(first.assignment).not.toEqual(second.assignment)
  })
})
