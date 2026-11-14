import { useCallback, useEffect, useState } from 'react'
import { MatchPage } from './pages/MatchPage'
import { PlayersPage } from './pages/PlayersPage'
import { MatchLoadingScreen } from './components/MatchLoadingScreen'
import { sessionApi } from './services/sessionApi'
import type {
  BatchPlayerRequest,
  Category,
  MatchResponse,
  MatchResult,
  Player,
} from './types/game'
import './App.css'

const MINIMUM_MATCH_LOADING_MS = 2000

function getSessionPlayers(teams: MatchResponse): Player[] {
  return [
    ...teams.ladoA,
    ...teams.ladoB,
    ...teams.proximos.filter((player) => player.status === 'FILA'),
  ].sort((first, second) => first.posicaoFila - second.posicaoFila)
}

function isSamePlayer(player: Player, playerToRemove: Player) {
  if (playerToRemove.id !== undefined) return player.id === playerToRemove.id
  return (
    player.id === undefined &&
    player.nome === playerToRemove.nome &&
    player.posicaoFila === playerToRemove.posicaoFila
  )
}

function removePlayerFromTeams(teams: MatchResponse, playerToRemove: Player): MatchResponse {
  return {
    ladoA: teams.ladoA.filter((player) => !isSamePlayer(player, playerToRemove)),
    ladoB: teams.ladoB.filter((player) => !isSamePlayer(player, playerToRemove)),
    proximos: teams.proximos.filter((player) => !isSamePlayer(player, playerToRemove)),
  }
}

function App() {
  const [players, setPlayers] = useState<Player[]>([])
  const [match, setMatch] = useState<MatchResponse | null>(null)
  const [sessionId, setSessionId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [isStarting, setIsStarting] = useState(false)
  const [startError, setStartError] = useState<string | null>(null)

  const loadActiveSession = useCallback(async (signal?: AbortSignal) => {
    try {
      const activeSession = await sessionApi.createOrGetActiveSession(signal)
      if (!Number.isFinite(activeSession.id)) {
        throw new Error('A resposta da sessão ativa não contém um ID válido.')
      }

      const teamsState = await sessionApi.getTeamsState(activeSession.id, signal)
      if (signal?.aborted) return

      setSessionId(activeSession.id)
      setPlayers(getSessionPlayers(teamsState))

      const hasFormedTeams =
        teamsState.ladoA.some((player) => player.status === 'JOGANDO') ||
        teamsState.ladoB.some((player) => player.status === 'JOGANDO')
      setMatch(hasFormedTeams ? teamsState : null)
    } catch (error) {
      if (signal?.aborted) return
      setLoadError(
        error instanceof Error ? error.message : 'Não foi possível carregar a sessão ativa.',
      )
    } finally {
      if (!signal?.aborted) setIsLoading(false)
    }
  }, [])

  function retryLoadActiveSession() {
    setIsLoading(true)
    setLoadError(null)
    void loadActiveSession()
  }

  useEffect(() => {
    const controller = new AbortController()
    void Promise.resolve().then(() => loadActiveSession(controller.signal))
    return () => controller.abort()
  }, [loadActiveSession])

  function addPlayer(name: string, category: Category | null) {
    const newPlayer: Player = {
      nome: name,
      categoria: category,
      status: 'FILA',
      lado: null,
      posicaoFila: players.length + 1,
    }

    setPlayers((currentPlayers) => [...currentPlayers, newPlayer])
    setMatch((currentMatch) =>
      currentMatch
        ? { ...currentMatch, proximos: [...currentMatch.proximos, newPlayer] }
        : currentMatch,
    )
  }

  async function addPlayerToMatch(name: string) {
    if (sessionId === null) {
      throw new Error('Não foi possível identificar a sessão atual.')
    }

    const player = await sessionApi.addPlayer(sessionId, { nome: name })
    setPlayers((currentPlayers) => [...currentPlayers, player])
    setMatch((currentMatch) =>
      currentMatch
        ? { ...currentMatch, proximos: [...currentMatch.proximos, player] }
        : currentMatch,
    )
  }

  async function removePlayer(playerToRemove: Player) {
    if (sessionId === null) {
      throw new Error('Não foi possível identificar a sessão atual.')
    }

    if (playerToRemove.id === undefined) {
      setPlayers((currentPlayers) =>
        currentPlayers.filter((player) => !isSamePlayer(player, playerToRemove)),
      )
      setMatch((currentMatch) =>
        currentMatch ? removePlayerFromTeams(currentMatch, playerToRemove) : currentMatch,
      )
      return
    }

    await sessionApi.removePlayer(sessionId, playerToRemove.id)
    setPlayers((currentPlayers) =>
      currentPlayers.filter((player) => !isSamePlayer(player, playerToRemove)),
    )
    setMatch((currentMatch) =>
      currentMatch ? removePlayerFromTeams(currentMatch, playerToRemove) : currentMatch,
    )

    try {
      const teamsState = await sessionApi.getTeamsState(sessionId)
      setPlayers(getSessionPlayers(teamsState))
      setMatch((currentMatch) => (currentMatch ? teamsState : currentMatch))
    } catch (error) {
      const reason = error instanceof Error ? ` ${error.message}` : ''
      throw new Error(
        `Jogador removido, mas não foi possível atualizar os times.${reason}`,
        { cause: error },
      )
    }
  }

  async function startMatch() {
    if (sessionId === null || isStarting) return
    const firstTen = players.slice(0, 10)
    if (players.length < 10 || firstTen.some((player) => player.categoria === null)) {
      setStartError('Selecione a categoria dos 10 primeiros jogadores.')
      return
    }

    const requestPlayers = players.map((player, index): BatchPlayerRequest => {
      if (index < 10 && player.categoria !== null) {
        return { nome: player.nome, categoria: player.categoria }
      }
      return { nome: player.nome }
    })

    setIsStarting(true)
    setStartError(null)
    const startedAt = performance.now()
    try {
      const response = await sessionApi.addPlayersAndStart(sessionId, requestPlayers)
      setMatch(response)
      setPlayers([...response.ladoA, ...response.ladoB, ...response.proximos])
    } catch (error) {
      setStartError(
        error instanceof Error ? error.message : 'Não foi possível sortear os times.',
      )
    } finally {
      const remainingTime = MINIMUM_MATCH_LOADING_MS - (performance.now() - startedAt)
      if (remainingTime > 0) {
        await new Promise<void>((resolve) => window.setTimeout(resolve, remainingTime))
      }
      setIsStarting(false)
    }
  }

  async function reportMatchResult(resultado: MatchResult) {
    if (sessionId === null) {
      throw new Error('Não foi possível identificar a sessão atual.')
    }

    const response = await sessionApi.reportMatchResult(sessionId, resultado)
    setMatch(response)
    setPlayers([...response.ladoA, ...response.ladoB, ...response.proximos])
  }

  function returnToPlayers() {
    setMatch(null)
  }

  if (isLoading) {
    return (
      <main className="app-shell">
        <p className="load-message" role="status">Carregando sessão ativa…</p>
      </main>
    )
  }

  if (loadError) {
    return (
      <main className="app-shell">
        <section className="load-error" role="alert">
          <h1>Não foi possível carregar a sessão</h1>
          <p>{loadError}</p>
          <button type="button" onClick={retryLoadActiveSession}>
            Tentar novamente
          </button>
        </section>
      </main>
    )
  }

  if (isStarting) return <MatchLoadingScreen />

  return (
    <main className="app-shell">
      {match ? (
        <MatchPage
          match={match}
          onAddPlayer={addPlayerToMatch}
          onBack={returnToPlayers}
          onRemovePlayer={removePlayer}
          onReportResult={reportMatchResult}
        />
      ) : (
        <PlayersPage
          players={players}
          onAddPlayer={addPlayer}
          onCategoryChange={(playerName, category) =>
            setPlayers((currentPlayers) =>
              currentPlayers.map((player) =>
                player.nome === playerName ? { ...player, categoria: category } : player,
              ),
            )
          }
          onRemovePlayer={removePlayer}
          onStartMatch={startMatch}
          startError={startError}
        />
      )}
    </main>
  )
}

export default App
