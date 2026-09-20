import { useState } from 'react'
import type { ForbiddenPair, Person } from '../types.ts'
import Panel from './Panel.tsx'

type Props = {
  people: Person[]
  pairs: ForbiddenPair[]
  onChange: (pairs: ForbiddenPair[]) => void
}

function PairEditor({ people, pairs, onChange }: Props) {
  const [a, setA] = useState('')
  const [b, setB] = useState('')

  const nameOf = new Map(people.map((person) => [person.id, person.name]))
  const exists = pairs.some(
    (pair) => (pair.a === a && pair.b === b) || (pair.a === b && pair.b === a),
  )
  const canAdd = a !== '' && b !== '' && a !== b && !exists

  const add = () => {
    if (!canAdd) return
    onChange([...pairs, { a, b }])
    setA('')
    setB('')
  }

  const remove = (index: number) => {
    onChange(pairs.filter((_, i) => i !== index))
  }

  return (
    <Panel
      id="pairs"
      title="隣にしない組み合わせ"
      meta={pairs.length === 0 ? 'なし' : `${pairs.length}組`}
    >
      <p className="hint">上下左右が隣の判定です。斜めは隣とみなしません。</p>
      <div className="field-row">
        <select value={a} onChange={(event) => setA(event.target.value)}>
          <option value="">選択</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <span>と</span>
        <select value={b} onChange={(event) => setB(event.target.value)}>
          <option value="">選択</option>
          {people.map((person) => (
            <option key={person.id} value={person.id}>
              {person.name}
            </option>
          ))}
        </select>
        <button type="button" onClick={add} disabled={!canAdd}>
          追加
        </button>
      </div>
      {pairs.length === 0 ? (
        <p className="hint">まだ登録がありません。</p>
      ) : (
        <ul className="pair-list">
          {pairs.map((pair, index) => (
            <li key={`${pair.a}-${pair.b}`}>
              <span>
                {nameOf.get(pair.a) ?? '(削除済み)'} ／ {nameOf.get(pair.b) ?? '(削除済み)'}
              </span>
              <button type="button" onClick={() => remove(index)}>
                削除
              </button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

export default PairEditor
