import { useState, type FormEvent } from 'react'

interface AddPlayerDialogProps {
  onAdd: (name: string) => Promise<void>
  onClose: () => void
}

export function AddPlayerDialog({ onAdd, onClose }: AddPlayerDialogProps) {
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName || isSubmitting) return

    setError(null)
    setIsSubmitting(true)
    try {
      await onAdd(trimmedName)
      onClose()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : 'Não foi possível adicionar o jogador.',
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="modal-backdrop" onMouseDown={(event) => {
      if (event.target === event.currentTarget && !isSubmitting) onClose()
    }}>
      <form className="add-player-dialog" onSubmit={(event) => void submit(event)}>
        <div className="dialog-heading">
          <h2>Adicionar jogador</h2>
          <button
            className="dialog-close"
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            disabled={isSubmitting}
          >
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
          className="dialog-input"
          placeholder="Digite o nome"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        {error && <p className="dialog-error" role="alert">{error}</p>}
        <button className="dialog-submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Adicionando…' : 'Adicionar à fila'}
        </button>
      </form>
    </div>
  )
}
