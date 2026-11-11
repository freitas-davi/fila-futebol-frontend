import { useState, type FormEvent } from 'react'
import { CategoryPicker } from './CategoryPicker'
import type { Category } from '../types/game'

interface AddPlayerDialogProps {
  onAdd: (name: string, category: Category) => void
  onClose: () => void
}

export function AddPlayerDialog({ onAdd, onClose }: AddPlayerDialogProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category>('A')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAdd(trimmedName, category)
    onClose()
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget) onClose()
    }}>
      <form className="add-player-dialog" onSubmit={submit}>
        <div className="dialog-heading">
          <h2>Adicionar jogador</h2>
          <button className="dialog-close" type="button" aria-label="Fechar" onClick={onClose}>
            ×
          </button>
        </div>
        <label className="dialog-field-label" htmlFor="dialog-player-name">
          Nome do jogador
        </label>
        <input
          id="dialog-player-name"
          autoFocus
          required
          maxLength={60}
          placeholder="Ex.: João Silva"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <p className="dialog-field-label">Categoria</p>
        <CategoryPicker
          className="dialog-category"
          value={category}
          onChange={setCategory}
        />
        <button className="dialog-submit" type="submit">
          Adicionar à fila
        </button>
      </form>
    </div>
  )
}
