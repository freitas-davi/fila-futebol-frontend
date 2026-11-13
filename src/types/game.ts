export type Category = 'A' | 'B' | 'C' | 'D'
export type PlayerStatus = 'JOGANDO' | 'FILA'
export type TeamSide = 'A' | 'B'

export interface Player {
  nome: string
  categoria: Category | null
  status: PlayerStatus
  lado: TeamSide | null
  posicaoFila: number
}

export interface MatchResponse {
  ladoA: Player[]
  ladoB: Player[]
  proximos: Player[]
}

export type MatchResult = 'LADO_A' | 'LADO_B'

export interface ActiveSessionResponse {
  id: number
  data: string
  status: string
}

export interface AddPlayerRequest {
  nome: string
  categoria?: Category
}

export interface BatchPlayerRequest {
  nome: string
  categoria?: Category
}
