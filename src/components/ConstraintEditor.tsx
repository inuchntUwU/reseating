import type { Layout, Person, PersonConstraint } from '../types.ts'
import { enabledSeats, seatLabel } from '../lib/solver.ts'
import Panel from './Panel.tsx'

type Props = {
  people: Person[]
  layout: Layout
  constraints: PersonConstraint[]
  onChange: (constraints: PersonConstraint[]) => void
}

function ConstraintEditor({ people, layout, constraints, onChange }: Props) {
  const seats = enabledSeats(layout)
  const byPerson = new Map(constraints.map((constraint) => [constraint.personId, constraint]))

  const update = (personId: string, patch: Partial<PersonConstraint>) => {
    const merged: PersonConstraint = {
      ...(byPerson.get(personId) ?? { personId }),
      ...patch,
    }
    const kept = constraints.filter((constraint) => constraint.personId !== personId)
    // maxRow も fixedSeat も無い行は保存しない
    if (merged.maxRow === undefined && merged.fixedSeat === undefined) {
      onChange(kept)
      return
    }
    onChange([...kept, merged])
  }

  if (people.length === 0) {
    return (
      <Panel id="constraints" title="個別の条件" meta="名簿が空">
        <p className="hint">先に名簿を入力してください。</p>
      </Panel>
    )
  }

  return (
    <Panel
      id="constraints"
      title="個別の条件"
      meta={constraints.length === 0 ? '指定なし' : `${constraints.length}人に指定`}
    >
      <p className="hint">
        「前からN行目まで」は視力などへの配慮用。席を固定すると、その席は他の人に割り当てられません。
      </p>
      <table className="constraints">
        <thead>
          <tr>
            <th>名前</th>
            <th>前から何行目まで</th>
            <th>席を固定</th>
          </tr>
        </thead>
        <tbody>
          {people.map((person) => {
            const constraint = byPerson.get(person.id)
            return (
              <tr key={person.id}>
                <td>{person.name}</td>
                <td>
                  <input
                    type="number"
                    min={1}
                    max={layout.rows}
                    placeholder="指定なし"
                    value={constraint?.maxRow ?? ''}
                    onChange={(event) => {
                      const value = event.target.value
                      update(person.id, {
                        maxRow: value === '' ? undefined : Number(value),
                      })
                    }}
                  />
                </td>
                <td>
                  <select
                    value={constraint?.fixedSeat ?? ''}
                    onChange={(event) => {
                      const value = event.target.value
                      update(person.id, { fixedSeat: value === '' ? undefined : value })
                    }}
                  >
                    <option value="">指定なし</option>
                    {seats.map((seat) => (
                      <option key={seat} value={seat}>
                        {seatLabel(seat)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </Panel>
  )
}

export default ConstraintEditor
