import type { Assignment, Layout, Person, PersonConstraint } from '../types.ts'
import { seatId } from '../lib/solver.ts'

type Props = {
  layout: Layout
  people: Person[]
  constraints: PersonConstraint[]
  assignment: Assignment | null
}

function SeatGrid({ layout, people, constraints, assignment }: Props) {
  const nameOf = new Map(people.map((person) => [person.id, person.name]))
  const constraintOf = new Map(
    constraints.map((constraint) => [constraint.personId, constraint]),
  )
  const disabled = new Set(layout.disabled)

  const cells = []
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const id = seatId(row, col)
      if (disabled.has(id)) {
        cells.push(<div key={id} className="seat seat--off" aria-hidden="true" />)
        continue
      }
      const personId = assignment?.[id]
      const constraint = personId === undefined ? undefined : constraintOf.get(personId)
      cells.push(
        <div key={id} className={personId === undefined ? 'seat seat--empty' : 'seat'}>
          <span className="seat-name">
            {personId === undefined ? '' : (nameOf.get(personId) ?? '?')}
          </span>
          {constraint?.fixedSeat !== undefined && <span className="badge">固定</span>}
          {constraint?.maxRow !== undefined && (
            <span className="badge">前{constraint.maxRow}行</span>
          )}
        </div>,
      )
    }
  }

  return (
    <section className="panel">
      <h2>座席表</h2>
      <div className="blackboard">教壇</div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)` }}>
        {cells}
      </div>
    </section>
  )
}

export default SeatGrid
