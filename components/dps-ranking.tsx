"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Flame, Swords, Trophy, Info, Filter, X, Bug } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { RankingPlayer } from "@/types"

// Lista de classes DPS disponíveis para filtro
const DPS_CLASSES = [
  "FULGURANTE",
  "FURA-BRUMA",
  "ÁGUIA",
  "CHAMA SOMBRA",
  "ADAGAS",
  "FROST",
  "ENDEMONIADO",
  "QUEBRA REINO",
  "REPETIDOR",
]

export function DpsRanking() {
  const [players, setPlayers] = useState<RankingPlayer[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState<boolean>(false)
  const [classFilter, setClassFilter] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [showDebug, setShowDebug] = useState(false)

  // Função para buscar os rankings com base no filtro de classe
  const fetchRankings = async (classFilter: string | null) => {
    setLoading(true)
    setDebugInfo(null)

    try {
      // Construir a URL com o parâmetro de classe, se fornecido
      let url = "/api/rankings?type=dps"
      if (classFilter) {
        url += `&class=${encodeURIComponent(classFilter)}`
      }

      console.log("Buscando rankings de DPS:", url)

      const response = await fetch(url)
      const data = await response.json()

      console.log("Dados recebidos:", data)
      setDebugInfo({
        url,
        status: response.status,
        data: data,
      })

      if (!response.ok) {
        throw new Error("Erro ao buscar rankings")
      }

      setPlayers(data)
    } catch (error) {
      console.error("Erro:", error)
      setDebugInfo((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      }))
    } finally {
      setLoading(false)
    }
  }

  // Efeito para buscar rankings quando o componente é montado ou o filtro muda
  useEffect(() => {
    fetchRankings(classFilter)
  }, [classFilter])

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
      REPETIDOR: "bg-indigo-500",
    }
    return colors[className] || "bg-gray-500"
  }

  const handleOpenDetails = (playerName: string) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  const handleClassFilterChange = (value: string) => {
    setClassFilter(value)
  }

  const clearFilter = () => {
    setClassFilter(null)
  }

  const toggleDebug = () => {
    setShowDebug((prev) => !prev)
  }

  return (
    <>
      <Card className="border-blue-900/50 bg-black/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <CardTitle className="text-2xl flex items-center gap-2">
              <Swords className="h-6 w-6 text-[#00c8ff]" />
              Ranking de DPS
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 rounded-full hover:bg-[#00c8ff]/10"
                onClick={toggleDebug}
              >
                <Bug className="h-4 w-4" />
                <span className="sr-only">Debug</span>
              </Button>
            </CardTitle>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex-1 sm:flex-initial">
                <Select value={classFilter || ""} onValueChange={handleClassFilterChange}>
                  <SelectTrigger className="bg-black/50 border-blue-900/50 w-full sm:w-[180px]">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4" />
                      <SelectValue placeholder="Filtrar por classe" />
                    </div>
                  </SelectTrigger>
                  <SelectContent className="bg-black border-blue-900/50">
                    {DPS_CLASSES.map((className) => (
                      <SelectItem key={className} value={className}>
                        <div className="flex items-center gap-2">
                          <span className={`w-3 h-3 rounded-full ${getClassColor(className)}`}></span>
                          {className}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {classFilter && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFilter}
                  className="h-10 w-10 rounded-full hover:bg-[#00c8ff]/10"
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpar filtro</span>
                </Button>
              )}
            </div>
          </div>

          {classFilter && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-sm text-[#00c8ff]/70">Filtrando por:</span>
              <Badge className={`${getClassColor(classFilter)} text-white`}>{classFilter}</Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {showDebug && debugInfo && (
            <div className="mb-4 p-4 border border-blue-900/50 rounded-md bg-black/50 text-xs overflow-auto">
              <h3 className="font-bold mb-2">Informações de Depuração:</h3>
              <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
            </div>
          )}

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
                <div className="text-center py-8 text-[#00c8ff]/70">
                  {classFilter
                    ? `Nenhum registro de DPS encontrado para a classe ${classFilter}`
                    : "Nenhum registro de DPS encontrado"}
                </div>
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
                        Média: {player.averageValue.toLocaleString("pt-BR")} DPS ({player.entries} caçadas)
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xl font-bold">
                      <Flame className="h-5 w-5 text-[#00c8ff]" />
                      {player.value.toLocaleString("pt-BR")}
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
