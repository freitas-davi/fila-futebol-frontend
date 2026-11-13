import { useState, type FormEvent } from 'react'
import { CategoryPicker } from '../components/CategoryPicker'
import type { Category, Player } from '../types/game'

interface PlayersPageProps {
  players: Player[]
  onAddPlayer: (name: string, category: Category | null) => void
  onCategoryChange: (playerName: string, category: Category) => void
  onRemovePlayer: (playerName: string) => void
  onStartMatch: () => void | Promise<void>
  isStarting: boolean
  startError: string | null
}

export function PlayersPage({
  players,
  onAddPlayer,
  onCategoryChange,
  onRemovePlayer,
  onStartMatch,
  isStarting,
  startError,
}: PlayersPageProps) {
  const [name, setName] = useState('')
  const [category, setCategory] = useState<Category | null>(null)

  const hasTenCategories =
    players.length >= 10 && players.slice(0, 10).every((player) => player.categoria !== null)

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const trimmedName = name.trim()
    if (!trimmedName) return
    onAddPlayer(trimmedName, players.length < 10 ? category : null)
    setName('')
    setCategory(null)
  }

  return (
    <>
      <header className="brand-row" aria-label="Na linha">
        <div className="brand">
          na lista<span>.</span>
        </div>
        <span className="brand-credit">created by · DaviDev</span>
      </header>
      <section className="page-heading">
        <h1>Faça a lista</h1>
        <p className="list-hint">
          {players.length < 10
            ? `Adicione mais ${10 - players.length} jogador(es) para sortear.`
            : !hasTenCategories
              ? 'Selecione a categoria dos 10 primeiros jogadores.'
              : 'Categorias preenchidas para o sorteio.'}
        </p>
      </section>
      <form className="add-player-form" onSubmit={submit}>
        <input
          aria-label="Nome do jogador"
          maxLength={60}
          placeholder="Nome do jogador"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />

        <button className="add-submit" type="submit" aria-label="Adicionar jogador" disabled={false}>
          +
        </button>
      </form>
      <div className="player-list" aria-label="Lista de jogadores">
        {players.map((player, index) => (
          <article
            className={`player-row ${index < 10 ? 'player-row-with-category' : ''}`}
            key={`${player.nome}-${index}`}
          >
            <span className="player-number">{index + 1}</span>
            <span className="player-name">{player.nome}</span>
            {index < 10 && (
              <CategoryPicker
                className={player.categoria === null ? 'category-select-required' : ''}
                value={player.categoria}
                onChange={(newCategory) => onCategoryChange(player.nome, newCategory)}
              />
            )}
            <button
              className="remove-button"
              type="button"
              aria-label={`Remover ${player.nome}`}
              onClick={() => onRemovePlayer(player.nome)}
            >
              ×
            </button>
          </article>
        ))}
      </div>
      {startError && <p className="start-error" role="alert">{startError}</p>}
      <button
        className="sticky-action"
        type="button"
        disabled={players.length < 10 || !hasTenCategories || isStarting}
        onClick={onStartMatch}
      >
        {isStarting ? 'Sorteando times…' : 'Sortear times'}
      </button>
    </>
  )
}
