export type RankingPlayer = {
  id: string
  playerId: string
  name: string
  class: string
  value: number
  entries: number
  averageValue: number
}

export type PlayerRecord = {
  id: string
  player_id: string
  class: string
  value: number
  type: string
  created_at: string
  players: {
    id: string
    name: string
  }
}
