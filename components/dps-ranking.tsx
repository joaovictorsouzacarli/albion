"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Swords, Trophy, Info } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"
import type { RankingPlayer } from "@/types"

export function DpsRanking() {
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false)

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await fetch("/api/rankings?type=dps")

        if (!response.ok) {
          throw new Error("Erro ao buscar rankings")
        }

        const data = await response.json()
        setPlayers(data)
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [])

  // Função para determinar a cor da classe
  const getClassColor = (className: string) => {
    const colors: Record<string, string> = {
      FULGURANTE: "bg-red-500",
      "FURA-BRUMA": "bg-purple-500",
      ÁGUIA: "bg-blue-500",
      "CHAMA SOMBRA": "bg-orange-500",
      ADAGAS: "bg-green-500",
      FROST: "bg-cyan-500",
      ENDEMONIADO: "bg-pink-500",
      "QUEBRA REINO": "bg-yellow-500",
    }
    return colors[className] || "bg-gray-500"
  }

  const handleOpenDetails = (playerName: string) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  return (
    <>
      <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-2xl flex items-center gap-2">
            <Swords className="h-6 w-6 text-[#00c8ff]" />
            Ranking de DPS
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            // Esqueleto de carregamento
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 mb-4 p-4 border border-blue-900/30 rounded-lg">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-4 w-[250px]" />
                  <Skeleton className="h-4 w-[200px]" />
                </div>
                <Skeleton className="h-10 w-20" />
              </div>
            ))
          ) : (
            <div className="space-y-4">
              {players.length === 0 ? (
                <div className="text-center py-8 text-[#00c8ff]/70">Nenhum registro de DPS encontrado</div>
              ) : (
                players.map((player, index) => (
                  <div
                    key={player.id}
                    className={`flex items-center gap-4 p-4 border border-blue-900/30 rounded-lg ${
                      index === 0 ? "bg-[#00c8ff]/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-center h-12 w-12 rounded-full bg-black border-2 border-[#00c8ff] text-[#00c8ff] font-bold">
                      {index === 0 ? <Trophy className="h-6 w-6" /> : <span>{index + 1}</span>}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-lg">{player.name}</h3>
                        <Badge className={`${getClassColor(player.class)} text-white`}>{player.class}</Badge>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 rounded-full hover:bg-[#00c8ff]/10"
                          onClick={() => handleOpenDetails(player.name)}
                        >
                          <Info className="h-4 w-4" />
                          <span className="sr-only">Detalhes de {player.name}</span>
                        </Button>
                      </div>
                      <div className="text-sm text-[#00c8ff]/70">
                        Média: {player.averageValue.toLocaleString()} DPS ({player.entries} caçadas)
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-bold">
                      <Flame className="h-5 w-5 text-[#00c8ff]" />
                      {player.value.toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {selectedPlayer && (
        <PlayerDetailsDialog playerName={selectedPlayer} open={detailsOpen} onOpenChange={setDetailsOpen} />
      )}
    </>
  )
}

