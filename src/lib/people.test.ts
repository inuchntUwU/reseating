import { describe, expect, it } from 'vitest'
import { MAX_SEQUENCE, numberSequence, syncPeople } from './people.ts'

describe('numberSequence', () => {
  it('昇順の連番を作る', () => {
    expect(numberSequence(1, 5)).toEqual(['1', '2', '3', '4', '5'])
  })

  it('開始が終了より大きければ降順', () => {
    expect(numberSequence(3, 1)).toEqual(['3', '2', '1'])
  })

  it('同じ値なら 1 件', () => {
    expect(numberSequence(7, 7)).toEqual(['7'])
  })

  it('小数は切り捨てる', () => {
    expect(numberSequence(1.9, 3.2)).toEqual(['1', '2', '3'])
  })

  it('上限で打ち切る', () => {
    expect(numberSequence(1, 10_000)).toHaveLength(MAX_SEQUENCE)
  })

  it('NaN は空', () => {
    expect(numberSequence(Number.NaN, 5)).toEqual([])
  })
})

describe('syncPeople', () => {
  it('出席番号のテキストを名簿にする', () => {
    const people = syncPeople('1\n2\n3', [])
    expect(people.map((person) => person.name)).toEqual(['1', '2', '3'])
  })

  it('同じ名前が残っていれば id を保つ', () => {
    const first = syncPeople('1\n2\n3', [])
    const second = syncPeople('1\n2\n3\n4', first)
    expect(second.slice(0, 3).map((person) => person.id)).toEqual(
      first.map((person) => person.id),
    )
  })

  it('空行と前後の空白を落とす', () => {
    expect(syncPeople(' 1 \n\n  \n2', []).map((person) => person.name)).toEqual(['1', '2'])
  })
})
