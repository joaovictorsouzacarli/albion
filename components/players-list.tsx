"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { Search, MoreVertical, Trash2, Edit, Flame, Heart, Info } from "lucide-react"
import { PlayerDetailsDialog } from "@/components/player-details-dialog"

// Tipos para os dados
type PlayerRecord = {
  id: string
  name: string
  class: string
  value: number
  date: string
  type: "dps" | "hps"
}

export function PlayersList() {
  const [records, setRecords] = useState<PlayerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await fetch("/api/records/list")

        if (!response.ok) {
          throw new Error("Erro ao buscar registros")
        }

        const data = await response.json()
        setRecords(data)
      } catch (error) {
        console.error("Erro:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecords()
  }, [])

  const handleDelete = async (id: string) => {
    try {
      const response = await fetch(`/api/records/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Erro ao excluir registro")
      }

      // Remover o registro da lista
      setRecords((prev) => prev.filter((record) => record.id !== id))

      toast({
        title: "Registro excluído",
        description: "O registro foi excluído com sucesso",
      })
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao excluir registro",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (id: string) => {
    // Em uma implementação real, você redirecionaria para um formulário de edição
    // ou abriria um modal com os dados preenchidos
    toast({
      title: "Editar registro",
      description: `Editando registro com ID: ${id}`,
    })
  }

  const handleOpenDetails = (playerName: string) => {
    setSelectedPlayer(playerName)
    setDetailsOpen(true)
  }

  // Função para filtrar registros
  const filteredRecords = records.filter(
    (record) =>
      record.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.class.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Separar registros por tipo
  const dpsRecords = filteredRecords.filter((record) => record.type === "dps")
  const hpsRecords = filteredRecords.filter((record) => record.type === "hps")

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
      "QUEDA SANTA": "bg-green-600",
    }
    return colors[className] || "bg-gray-500"
  }

  return (
    <Card className="border-amber-900/50 bg-black/30">
      <CardContent className="pt-6">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-amber-400/50" />
            <Input
              placeholder="Buscar por nome ou classe..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-black/50 border-amber-900/50"
            />
          </div>
        </div>

        <Tabs defaultValue="dps" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-black border border-amber-900/50 mb-4">
            <TabsTrigger value="dps" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Registros DPS
            </TabsTrigger>
            <TabsTrigger value="hps" className="data-[state=active]:bg-amber-400 data-[state=active]:text-black">
              Registros HPS
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dps">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-amber-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black">
                    <TableRow className="hover:bg-transparent border-amber-900/50">
                      <TableHead className="w-[250px]">Jogador</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead className="text-right">DPS</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dpsRecords.length === 0 ? (
                      <TableRow className="hover:bg-amber-950/10 border-amber-900/30">
                        <TableCell colSpan={5} className="text-center py-4 text-amber-400/50">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      dpsRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-amber-950/10 border-amber-900/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {record.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-amber-400/10"
                                onClick={() => handleOpenDetails(record.name)}
                              >
                                <Info className="h-4 w-4" />
                                <span className="sr-only">Detalhes de {record.name}</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getClassColor(record.class)} text-white`}>{record.class}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Flame className="h-4 w-4 text-amber-400" />
                              {record.value.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(record.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-black border-amber-900/50">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(record.id)}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(record.id)}
                                  className="cursor-pointer text-red-500 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          <TabsContent value="hps">
            {loading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-12 w-full" />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-amber-900/50 overflow-hidden">
                <Table>
                  <TableHeader className="bg-black">
                    <TableRow className="hover:bg-transparent border-amber-900/50">
                      <TableHead className="w-[250px]">Jogador</TableHead>
                      <TableHead>Classe</TableHead>
                      <TableHead className="text-right">HPS</TableHead>
                      <TableHead className="text-right">Data</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {hpsRecords.length === 0 ? (
                      <TableRow className="hover:bg-amber-950/10 border-amber-900/30">
                        <TableCell colSpan={5} className="text-center py-4 text-amber-400/50">
                          Nenhum registro encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      hpsRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-amber-950/10 border-amber-900/30">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              {record.name}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 rounded-full hover:bg-amber-400/10"
                                onClick={() => handleOpenDetails(record.name)}
                              >
                                <Info className="h-4 w-4" />
                                <span className="sr-only">Detalhes de {record.name}</span>
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${getClassColor(record.class)} text-white`}>{record.class}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Heart className="h-4 w-4 text-amber-400" />
                              {record.value.toLocaleString()}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            {new Date(record.date).toLocaleDateString("pt-BR")}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreVertical className="h-4 w-4" />
                                  <span className="sr-only">Abrir menu</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="bg-black border-amber-900/50">
                                <DropdownMenuItem
                                  onClick={() => handleEdit(record.id)}
                                  className="cursor-pointer flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDelete(record.id)}
                                  className="cursor-pointer text-red-500 flex items-center gap-2"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
        {selectedPlayer && (
          <PlayerDetailsDialog playerName={selectedPlayer} open={detailsOpen} onOpenChange={setDetailsOpen} />
        )}
        <Toaster />
      </CardContent>
    </Card>
  )
}

