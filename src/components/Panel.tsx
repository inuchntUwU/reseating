import { useState } from 'react'
import type { ReactNode } from 'react'
import { loadPanelOpen, savePanelOpen } from '../lib/storage.ts'

type Props = {
  /** 開閉状態の保存キー */
  id: string
  title: string
  /** 閉じたままでも中身が分かる短い要約 */
  meta?: string
  defaultOpen?: boolean
  children: ReactNode
}

function Panel({ id, title, meta, defaultOpen = false, children }: Props) {
  const [open, setOpen] = useState(() => loadPanelOpen(id, defaultOpen))

  return (
    <details
      className="panel"
      open={open}
      onToggle={(event) => {
        const next = event.currentTarget.open
        setOpen(next)
        savePanelOpen(id, next)
      }}
    >
      <summary className="panel-summary">
        <span className="panel-title">{title}</span>
        {meta !== undefined && <span className="panel-meta">{meta}</span>}
      </summary>
      <div className="panel-body">{children}</div>
    </details>
  )
}

export default Panel
