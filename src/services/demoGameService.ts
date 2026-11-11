import type { MatchResponse, Player } from '../types/game'

export const demoPlayers: Player[] = [
  'Lucas Silva',
  'Gabriel Santos',
  'Pedro Oliveira',
  'Matheus Costa',
  'Rafael Lima',
  'Bruno Alves',
  'Felipe Souza',
  'André Pereira',
  'Gustavo Rocha',
  'Diego Martins',
  'Thiago Ribeiro',
  'Vinícius Melo',
  'João Victor',
  'Henrique Dias',
  'Leonardo Gomes',
  'Caio Ferreira',
  'Eduardo Nunes',
  'Daniel Castro',
  'Marcelo Lopes',
  'Murilo Carvalho',
  'Davi Freitas',
  'Maurício Mendes',
  'Higor Almeida',
].map((nome, index) => ({
  nome,
  categoria: (['A', 'B', 'C', 'D'] as const)[index % 4],
  status: 'FILA',
  lado: null,
  posicaoFila: index + 1,
}))

export function getWaitingPlayers(match: MatchResponse): Player[] {
  return match.proximos.filter((player) => player.status === 'FILA')
}
