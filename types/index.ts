export type User = {
  id: string
  username: string
  created_at: string
}

export type Player = {
  id: string
  name: string
  created_at: string
}

export type Record = {
  id: string
  player_id: string
  player_name?: string
  class: string
  value: number
  type: "dps" | "hps"
  created_at: string
}

export type ClassSummary = {
  class: string
  type: string
  highestValue: number
  averageValue: number
  count: number
  records: {
    id: string
    value: number
    date: string
  }[]
}

export type PlayerDetails = {
  player: {
    id: string
    name: string
  }
  classSummary: ClassSummary[]
  allRecords: Record[]
}

export type RankingPlayer = {
  id: string
  name: string
  class: string
  value: number
  averageValue: number
  entries: number
}

