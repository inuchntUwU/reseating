import { useState } from 'react'
import type { Person } from '../types.ts'
import { MAX_SEQUENCE, numberSequence, syncPeople } from '../lib/people.ts'
import Panel from './Panel.tsx'

type Props = {
  people: Person[]
  seatCount: number
  onChange: (people: Person[]) => void
}

function PeopleEditor({ people, seatCount, onChange }: Props) {
  const [text, setText] = useState(() => people.map((person) => person.name).join('\n'))
  const [start, setStart] = useState(1)
  const [end, setEnd] = useState(() => Math.max(seatCount, 1))

  const handleChange = (value: string) => {
    setText(value)
    onChange(syncPeople(value, people))
  }

  const numbers = numberSequence(start, end)

  const fillNumbers = (mode: 'replace' | 'append') => {
    if (numbers.length === 0) return
    const block = numbers.join('\n')
    const current = text.trim()
    handleChange(mode === 'append' && current !== '' ? `${current}\n${block}` : block)
  }

  const over = people.length > seatCount

  return (
    <Panel
      id="people"
      title="名簿"
      meta={`${people.length}人`}
      defaultOpen={people.length === 0}
    >
      <p className="hint">1 行に 1 人。空行は無視します。出席番号だけでも構いません。</p>

      <div className="field-row">
        <label>
          出席番号
          <input
            type="number"
            value={start}
            onChange={(event) => setStart(event.target.valueAsNumber || 0)}
          />
        </label>
        <span>〜</span>
        <label>
          <input
            type="number"
            value={end}
            onChange={(event) => setEnd(event.target.valueAsNumber || 0)}
          />
        </label>
        <button type="button" onClick={() => fillNumbers('replace')} disabled={numbers.length === 0}>
          入れ替え
        </button>
        <button type="button" onClick={() => fillNumbers('append')} disabled={numbers.length === 0}>
          末尾に追加
        </button>
      </div>
      <p className="hint">
        {numbers.length}件（最大{MAX_SEQUENCE}件）。欠番はあとから該当行を消してください。
      </p>

      <textarea
        id="names"
        rows={10}
        value={text}
        placeholder={'1\n2\n3'}
        onChange={(event) => handleChange(event.target.value)}
      />
      <p className={over ? 'count count--error' : 'count'}>
        {people.length}人 / 使える席 {seatCount}席{over ? '（席が足りません）' : ''}
      </p>
    </Panel>
  )
}

export default PeopleEditor
