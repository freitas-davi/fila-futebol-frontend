import type { Player, TeamSide } from '../../types/game.ts'
import './TeamCard.css'

interface TeamCardProps {
  side: TeamSide
  players: Player[]
  winner: boolean
  isLoading?: boolean
  onSetWinner: () => void
  disabled?: boolean
  onRemovePlayer: (player: Player) => void | Promise<void>
  removeDisabled?: boolean
}

export function TeamCard({
  side,
  players,
  winner,
  isLoading = false,
  onSetWinner,
  disabled = false,
  onRemovePlayer,
  removeDisabled = false,
}: TeamCardProps) {
  return (
    <section
      className="team-card"
      aria-label={`Time ${side}`}
      aria-busy={isLoading}
    >
      <div className="team-heading">
        <span className="team-mark">{side}</span>
        <span>Time {side}</span>
      </div>
      {players.map((player) => (
        <div className="lineup-row" key={player.id ?? `${side}-${player.nome}-${player.posicaoFila}`}>
          <span className="lineup-name">{player.nome}</span>
          <span className="category-badge">{player.categoria ?? '—'}</span>
          <button
            className="lineup-remove"
            type="button"
            aria-label={`Remover ${player.nome} do time`}
            disabled={removeDisabled}
            onClick={() => void onRemovePlayer(player)}
          >
            ×
          </button>
        </div>
      ))}
      <button
        className="winner-button"
        type="button"
        aria-pressed={winner}
        disabled={disabled}
        onClick={onSetWinner}
      >
        {winner ? 'Time vencedor' : 'Venceu'}
      </button>
      {isLoading && (
        <div className="team-loading-overlay" role="status" aria-live="polite">
          <span className="team-loading-spinner" aria-hidden="true" />
          <span>Atualizando times…</span>
        </div>
      )}
    </section>
  )
}
