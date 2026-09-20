import type { Layout } from '../types.ts'
import { seatId } from '../lib/solver.ts'
import Panel from './Panel.tsx'

type Props = {
  layout: Layout
  onChange: (layout: Layout) => void
}

const MAX_SIDE = 20

function LayoutEditor({ layout, onChange }: Props) {
  const setSide = (key: 'rows' | 'cols', value: number) => {
    const next = Math.min(Math.max(Math.trunc(value) || 1, 1), MAX_SIDE)
    const resized = { ...layout, [key]: next }
    // 縮小したときにグリッド外へ出た無効席を捨てる
    resized.disabled = layout.disabled.filter((id) => {
      const [row, col] = id.split('-').map(Number)
      return row < resized.rows && col < resized.cols
    })
    onChange(resized)
  }

  const toggleSeat = (id: string) => {
    const disabled = new Set(layout.disabled)
    if (disabled.has(id)) disabled.delete(id)
    else disabled.add(id)
    onChange({ ...layout, disabled: [...disabled] })
  }

  const disabled = new Set(layout.disabled)
  const cells = []
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const id = seatId(row, col)
      const off = disabled.has(id)
      cells.push(
        <button
          key={id}
          type="button"
          className={off ? 'layout-cell layout-cell--off' : 'layout-cell'}
          onClick={() => toggleSeat(id)}
          aria-pressed={!off}
          title={off ? '使わない席' : '使う席'}
        >
          {off ? '×' : `${row + 1}-${col + 1}`}
        </button>,
      )
    }
  }

  return (
    <Panel
      id="layout"
      title="座席レイアウト"
      meta={`${layout.rows}行 × ${layout.cols}列 / ${layout.rows * layout.cols - disabled.size}席`}
    >
      <div className="field-row">
        <label>
          行数
          <input
            type="number"
            min={1}
            max={MAX_SIDE}
            value={layout.rows}
            onChange={(event) => setSide('rows', event.target.valueAsNumber)}
          />
        </label>
        <label>
          列数
          <input
            type="number"
            min={1}
            max={MAX_SIDE}
            value={layout.cols}
            onChange={(event) => setSide('cols', event.target.valueAsNumber)}
          />
        </label>
      </div>
      <p className="hint">
        席をクリックすると使う / 使わない（通路・欠席）を切り替えます。上が教壇側です。
      </p>
      <div className="blackboard">教壇</div>
      <div className="grid" style={{ gridTemplateColumns: `repeat(${layout.cols}, 1fr)` }}>
        {cells}
      </div>
    </Panel>
  )
}

export default LayoutEditor
