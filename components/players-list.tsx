"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, Loader2 } from "lucide-react"

export function PlayersList() {
  const [players, setPlayers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    setLoading(true)
    setError(null)

    try {
      // Simulação de busca de jogadores (substitua pela sua lógica real)
      const mockPlayers = [
        { id: "1", name: "TioBarney" },
        { id: "2", name: "delimb" },
      ]

      setPlayers(mockPlayers)
    } catch (err) {
      setError("Erro ao buscar jogadores")
      console.error("Erro ao buscar jogadores:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeletePlayer = (id: string) => {
    // Simulação de exclusão de jogador (substitua pela sua lógica real)
    console.log(`Excluindo jogador com ID: ${id}`)
  }

  const handleEditPlayer = (id: string) => {
    // Simulação de edição de jogador (substitua pela sua lógica real)
    console.log(`Editando jogador com ID: ${id}`)
  }

  return (
    <Card className="border-blue-900/50 bg-black/30">
      <CardContent>
        <Table>
          <TableCaption>Lista de jogadores cadastrados no sistema.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">ID</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Carregando jogadores...
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-red-500">
                  {error}
                </TableCell>
              </TableRow>
            ) : players.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  Nenhum jogador cadastrado.
                </TableCell>
              </TableRow>
            ) : (
              players.map((player) => (
                <TableRow key={player.id}>
                  <TableCell className="font-medium">{player.id}</TableCell>
                  <TableCell>{player.name}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleEditPlayer(player.id)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeletePlayer(player.id)}>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
