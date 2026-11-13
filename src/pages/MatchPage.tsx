import { useEffect, useMemo, useState } from 'react'
import { AddPlayerDialog } from '../components/AddPlayerDialog'
import { TeamCard } from '../components/TeamCard'
import { WaitingQueue } from '../components/WaitingQueue'
import { getWaitingPlayers } from '../services/demoGameService'
import type { Category, MatchResponse, Player } from '../types/game'

interface MatchPageProps {
  match: MatchResponse
  onAddPlayer: (name: string, category: Category) => void
  onBack: () => void
  onMatchChange: (match: MatchResponse) => void
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export function MatchPage({ match, onAddPlayer, onBack, onMatchChange }: MatchPageProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [winner, setWinner] = useState<'A' | 'B' | null>(null)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)

  useEffect(() => {
    if (!isRunning) return
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1)
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isRunning])

  const waitingPlayers = useMemo(() => getWaitingPlayers(match), [match])

  function removePlayer(playerToRemove: Player) {
    const remains = (players: Player[]) =>
      players.filter(
        (player) =>
          player.nome !== playerToRemove.nome ||
          player.posicaoFila !== playerToRemove.posicaoFila,
      )
    onMatchChange({
      ladoA: remains(match.ladoA),
      ladoB: remains(match.ladoB),
      proximos: remains(match.proximos),
    })
  }

  function addPlayer(name: string, category: Category) {
    onAddPlayer(name, category)
  }

  return (
    <>
      <header className="brand-row match-brand-row" aria-label="Na linha">
        <div className="brand">
          na lista<span>.</span>
        </div>
        <span className="brand-credit">created by DaviDev</span>
      </header>
      <header className="match-topbar">
        <button className="text-button" type="button" aria-label="Voltar à lista" onClick={onBack}>
          ←
        </button>
        <div className="topbar-actions">
          <button
            className="text-button"
            type="button"
            aria-label="Reiniciar cronômetro"
            onClick={() => {
              setIsRunning(false)
              setElapsedSeconds(0)
            }}
          >
            ↶
          </button>
          <button
            className="add-inline-button"
            type="button"
            onClick={() => setIsAddingPlayer(true)}
          >
            + &nbsp;Adicionar
          </button>
        </div>
      </header>
      <div className="match-controls">
        <time className="timer" aria-label={`Tempo ${formatTime(elapsedSeconds)}`}>
          {formatTime(elapsedSeconds)}
        </time>
        <button
          className="play-button"
          type="button"
          aria-label={isRunning ? 'Pausar cronômetro' : 'Iniciar cronômetro'}
          onClick={() => setIsRunning((running) => !running)}
        >
          {isRunning ? 'Ⅱ' : '▷'}
        </button>
      </div>
      <TeamCard
        side="A"
        players={match.ladoA}
        winner={winner === 'A'}
        onSetWinner={() => setWinner((current) => (current === 'A' ? null : 'A'))}
        onRemovePlayer={removePlayer}
      />
      <div className="team-separator">x</div>
      <TeamCard
        side="B"
        players={match.ladoB}
        winner={winner === 'B'}
        onSetWinner={() => setWinner((current) => (current === 'B' ? null : 'B'))}
        onRemovePlayer={removePlayer}
      />
      <WaitingQueue players={waitingPlayers} onRemovePlayer={removePlayer} />
      {isAddingPlayer && (
        <AddPlayerDialog
          onAdd={addPlayer}
          onClose={() => setIsAddingPlayer(false)}
        />
      )}
    </>
  )
}
