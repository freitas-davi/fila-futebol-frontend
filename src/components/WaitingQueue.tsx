import type { Player } from '../types/game'

interface WaitingQueueProps {
  players: Player[]
  onRemovePlayer: (player: Player) => void
}

export function WaitingQueue({ players, onRemovePlayer }: WaitingQueueProps) {
  const groups: Player[][] = []
  for (let index = 0; index < players.length; index += 5) {
    groups.push(players.slice(index, index + 5))
  }

  return (
    <section className="queue-section">
      <h2 className="queue-title">
        Próximos <span>{players.length}</span>
      </h2>
      {groups.length ? (
        <div className="queue-groups">
          {groups.map((group, groupIndex) => (
            <section className="queue-card" key={`queue-group-${groupIndex + 1}`}>
              <h3>{`${groupIndex + 1}º TIME`}</h3>
              {group.map((player) => (
                <div className="queue-row" key={`${player.posicaoFila}-${player.nome}`}>
                  <span className="queue-position">{player.posicaoFila}</span>
                  <span className="lineup-name">{player.nome}</span>
                  <span className="category-badge">{player.categoria ?? '—'}</span>
                  <button
                    className="lineup-remove"
                    type="button"
                    aria-label={`Remover ${player.nome} da fila`}
                    onClick={() => onRemovePlayer(player)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </section>
          ))}
        </div>
      ) : (
        <p className="empty-queue">Não há jogadores aguardando na fila.</p>
      )}
    </section>
  )
}
