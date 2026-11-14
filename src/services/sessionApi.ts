import type {
  ActiveSessionResponse,
  AddPlayerRequest,
  BatchPlayerRequest,
  MatchResponse,
  MatchResult,
  Player,
} from '../types/game'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

function fetchResponse(path: string, init?: RequestInit): Promise<Response> {
  return fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  })
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetchResponse(path, init)
  if (!response.ok) {
    throw new Error(`Falha na requisição (${response.status}): ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

async function requestWithoutResponse(path: string, init?: RequestInit): Promise<void> {
  const response = await fetchResponse(path, init)
  if (!response.ok) {
    throw new Error(`Falha na requisição (${response.status}): ${response.statusText}`)
  }
}

export const sessionApi = {
  createOrGetActiveSession(signal?: AbortSignal): Promise<ActiveSessionResponse> {
    return request('/sessoes', { method: 'POST', signal })
  },

  addPlayersAndStart(
    sessionId: number,
    players: BatchPlayerRequest[],
  ): Promise<MatchResponse> {
    return request(`/sessoes/${encodeURIComponent(sessionId)}/jogadores/iniciar`, {
      method: 'POST',
      body: JSON.stringify(players),
    })
  },

  getTeamsState(sessionId: number, signal?: AbortSignal): Promise<MatchResponse> {
    return request(`/sessoes/${encodeURIComponent(sessionId)}/estado-times`, { signal })
  },

  reportMatchResult(sessionId: number, resultado: MatchResult): Promise<MatchResponse> {
    return request(`/sessoes/${encodeURIComponent(sessionId)}/partidas/resultado`, {
      method: 'POST',
      body: JSON.stringify({ resultado }),
    })
  },

  addPlayer(sessionId: number, player: AddPlayerRequest): Promise<Player> {
    return request(`/sessoes/${encodeURIComponent(sessionId)}/jogadores`, {
      method: 'POST',
      body: JSON.stringify(player),
    })
  },

  removePlayer(sessionId: number, playerId: number): Promise<void> {
    return requestWithoutResponse(
      `/sessoes/${encodeURIComponent(sessionId)}/jogadores/${encodeURIComponent(playerId)}`,
      { method: 'DELETE' },
    )
  },
}
