import type { Player, TeamSide } from '../types/game'

interface TeamCardProps {
  side: TeamSide
  players: Player[]
  winner: boolean
  onSetWinner: () => void
  disabled?: boolean
  onRemovePlayer: (player: Player) => void
}

export function TeamCard({
  side,
  players,
  winner,
  onSetWinner,
  disabled = false,
  onRemovePlayer,
}: TeamCardProps) {
  return (
    <section className="team-card" aria-label={`Time ${side}`}>
      <div className="team-heading">
        <span className="team-mark">{side}</span>
        <span>Time {side}</span>
      </div>
      {players.map((player) => (
        <div className="lineup-row" key={`${side}-${player.nome}`}>
          <span className="lineup-name">{player.nome}</span>
          <span className="category-badge">{player.categoria ?? '—'}</span>
          <button
            className="lineup-remove"
            type="button"
            aria-label={`Remover ${player.nome} do time`}
            onClick={() => onRemovePlayer(player)}
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
    </section>
  )
}
