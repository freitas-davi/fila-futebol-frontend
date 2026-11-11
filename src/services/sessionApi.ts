import type {
  ActiveSessionResponse,
  AddPlayerRequest,
  BatchPlayerRequest,
  MatchResponse,
  Player,
} from '../types/game'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? ''

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: init?.body
      ? { 'Content-Type': 'application/json', ...init.headers }
      : init?.headers,
  })

  if (!response.ok) {
    throw new Error(`Falha na requisição (${response.status}): ${response.statusText}`)
  }

  return response.json() as Promise<T>
}

export const sessionApi = {
  getActiveSession(signal?: AbortSignal): Promise<ActiveSessionResponse> {
    return request('/sessoes/ativa', { signal })
  },

  createOrGetActiveSession(signal?: AbortSignal): Promise<ActiveSessionResponse> {
    return request('/sessoes', { method: 'POST', signal })
  },

  startMatch(sessionId: number): Promise<MatchResponse> {
    return request(`/sessoes/${encodeURIComponent(sessionId)}/iniciar`, { method: 'POST' })
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

  addPlayer(sessionId: number, player: AddPlayerRequest): Promise<Player> {
    return request(`/${encodeURIComponent(sessionId)}`, {
      method: 'POST',
      body: JSON.stringify(player),
    })
  },
}
