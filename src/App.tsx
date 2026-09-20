import { useEffect, useState } from 'react'
import './App.css'
import ConstraintEditor from './components/ConstraintEditor.tsx'
import LayoutEditor from './components/LayoutEditor.tsx'
import PairEditor from './components/PairEditor.tsx'
import PeopleEditor from './components/PeopleEditor.tsx'
import SeatGrid from './components/SeatGrid.tsx'
import { enabledSeats, solve } from './lib/solver.ts'
import { loadState, saveState } from './lib/storage.ts'
import type { AppState } from './types.ts'

function App() {
  const [state, setState] = useState<AppState>(loadState)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    saveState(state)
  }, [state])

  const seats = enabledSeats(state.layout)

  const randomize = () => {
    const result = solve({
      layout: state.layout,
      people: state.people,
      constraints: state.constraints,
      forbiddenPairs: state.forbiddenPairs,
    })
    if (result.ok) {
      setError(null)
      setState((current) => ({ ...current, assignment: result.assignment }))
      return
    }
    setError(result.detail)
    setState((current) => ({ ...current, assignment: null }))
  }

  const reset = () => {
    setError(null)
    setState((current) => ({ ...current, assignment: null }))
  }

  return (
    <main className="app">
      <header className="header">
        <h1>席替え</h1>
        <p>条件つきでランダムに座席を決めます。入力はこのブラウザに保存されます。</p>
      </header>

      <div className="actions">
        <button id="random" type="button" className="primary" onClick={randomize}>
          席替えする
        </button>
        <button id="reset" type="button" onClick={reset}>
          結果をクリア
        </button>
        <button type="button" onClick={() => window.print()} disabled={state.assignment === null}>
          印刷
        </button>
      </div>

      {error !== null && <p className="error">{error}</p>}

      <SeatGrid
        layout={state.layout}
        people={state.people}
        constraints={state.constraints}
        assignment={state.assignment}
      />

      <div className="editors">
        <PeopleEditor
          people={state.people}
          seatCount={seats.length}
          onChange={(people) => {
            const ids = new Set(people.map((person) => person.id))
            setState((current) => ({
              ...current,
              people,
              // 名簿から消えた人の条件は残さない
              constraints: current.constraints.filter((constraint) => ids.has(constraint.personId)),
              forbiddenPairs: current.forbiddenPairs.filter(
                (pair) => ids.has(pair.a) && ids.has(pair.b),
              ),
              assignment: null,
            }))
          }}
        />

        <LayoutEditor
          layout={state.layout}
          onChange={(layout) => {
            const available = new Set(enabledSeats(layout))
            setState((current) => ({
              ...current,
              layout,
              // 無効になった席やグリッド外の固定席指定は落とす
              constraints: current.constraints
                .map((constraint) =>
                  constraint.fixedSeat !== undefined && !available.has(constraint.fixedSeat)
                    ? { ...constraint, fixedSeat: undefined }
                    : constraint,
                )
                .filter(
                  (constraint) =>
                    constraint.maxRow !== undefined || constraint.fixedSeat !== undefined,
                ),
              assignment: null,
            }))
          }}
        />

        <ConstraintEditor
          people={state.people}
          layout={state.layout}
          constraints={state.constraints}
          onChange={(constraints) => setState((current) => ({ ...current, constraints }))}
        />

        <PairEditor
          people={state.people}
          pairs={state.forbiddenPairs}
          onChange={(forbiddenPairs) => setState((current) => ({ ...current, forbiddenPairs }))}
        />
      </div>

      <footer className="footer">データはこの端末のブラウザにのみ保存されます。</footer>
    </main>
  )
}

export default App
