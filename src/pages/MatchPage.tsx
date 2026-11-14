import { useEffect, useMemo, useState } from 'react'
import { AddPlayerDialog } from '../components/AddPlayerDialog'
import { TeamCard } from '../components/TeamCard'
import { WaitingQueue } from '../components/WaitingQueue'
import { getWaitingPlayers } from '../services/demoGameService'
import type { MatchResponse, MatchResult, Player, TeamSide } from '../types/game'

interface MatchPageProps {
  match: MatchResponse
  onAddPlayer: (name: string) => Promise<void>
  onBack: () => void
  onRemovePlayer: (player: Player) => Promise<void>
  onReportResult: (result: MatchResult) => Promise<void>
}

function formatTime(seconds: number) {
  const minutes = Math.floor(seconds / 60)
    .toString()
    .padStart(2, '0')
  const remainingSeconds = (seconds % 60).toString().padStart(2, '0')
  return `${minutes}:${remainingSeconds}`
}

export function MatchPage({
  match,
  onAddPlayer,
  onBack,
  onRemovePlayer,
  onReportResult,
}: MatchPageProps) {
  const [isRunning, setIsRunning] = useState(false)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [winner, setWinner] = useState<'A' | 'B' | null>(null)
  const [isAddingPlayer, setIsAddingPlayer] = useState(false)
  const [isReportingResult, setIsReportingResult] = useState(false)
  const [resultError, setResultError] = useState<string | null>(null)
  const [isRemovingPlayer, setIsRemovingPlayer] = useState(false)
  const [removeError, setRemoveError] = useState<string | null>(null)

  useEffect(() => {
    if (!isRunning) return
    const intervalId = window.setInterval(() => {
      setElapsedSeconds((seconds) => seconds + 1)
    }, 1000)
    return () => window.clearInterval(intervalId)
  }, [isRunning])

  const waitingPlayers = useMemo(() => getWaitingPlayers(match), [match])

  async function removePlayer(player: Player) {
    if (isRemovingPlayer) return
    setIsRemovingPlayer(true)
    setRemoveError(null)
    try {
      await onRemovePlayer(player)
    } catch (error) {
      setRemoveError(
        error instanceof Error ? error.message : 'Não foi possível remover o jogador.',
      )
    } finally {
      setIsRemovingPlayer(false)
    }
  }

  async function addPlayer(name: string) {
    await onAddPlayer(name)
  }

  async function reportResult(side: TeamSide) {
    if (isReportingResult) return

    setWinner(side)
    setResultError(null)
    setIsReportingResult(true)
    try {
      await onReportResult(side === 'A' ? 'LADO_A' : 'LADO_B')
      setWinner(null)
    } catch (error) {
      setResultError(
        error instanceof Error ? error.message : 'Não foi possível registrar o resultado.',
      )
    } finally {
      setIsReportingResult(false)
    }
  }

  return (
    <>
      <header className="brand-row match-brand-row" aria-label="Na linha">
        <div className="brand">
          na lista<span>.</span>
        </div>
        <span className="brand-credit">created by · DaviDev</span>
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
        onSetWinner={() => void reportResult('A')}
        disabled={isReportingResult}
        onRemovePlayer={removePlayer}
        removeDisabled={isRemovingPlayer}
      />
      <div className="team-separator">x</div>
      <TeamCard
        side="B"
        players={match.ladoB}
        winner={winner === 'B'}
        onSetWinner={() => void reportResult('B')}
        disabled={isReportingResult}
        onRemovePlayer={removePlayer}
        removeDisabled={isRemovingPlayer}
      />
      {resultError && <p role="alert">{resultError}</p>}
      {removeError && <p role="alert">{removeError}</p>}
      <WaitingQueue
        players={waitingPlayers}
        onRemovePlayer={removePlayer}
        removeDisabled={isRemovingPlayer}
      />
      {isAddingPlayer && (
        <AddPlayerDialog
          onAdd={addPlayer}
          onClose={() => setIsAddingPlayer(false)}
        />
      )}
    </>
  )
}
