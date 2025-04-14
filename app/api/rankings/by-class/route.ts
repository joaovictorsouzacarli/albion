import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const className = searchParams.get("class")

    if (!className) {
      return NextResponse.json({ error: "Parâmetro 'class' é obrigatório" }, { status: 400 })
    }

    console.log(`Buscando rankings de ${type} para a classe ${className}`)

    // Buscar todos os jogadores que têm registros com a classe especificada
    const { data: records, error } = await supabaseAdmin
      .from("records")
      .select(`
        id,
        player_id,
        class,
        value,
        type,
        created_at,
        players (
          id,
          name
        )
      `)
      .eq("type", type)
      .eq("class", className)
      .order("value", { ascending: false })

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar por jogador para obter o melhor valor de cada jogador para esta classe
    const playerMap = new Map()

    records.forEach((record) => {
      const playerId = record.player_id
      const playerName = record.players.name

      if (!playerMap.has(playerId) || record.value > playerMap.get(playerId).value) {
        playerMap.set(playerId, {
          id: record.id,
          playerId: playerId,
          name: playerName,
          class: record.class,
          value: record.value,
          entries: 1,
          totalValue: record.value,
        })
      } else {
        const existing = playerMap.get(playerId)
        existing.entries += 1
        existing.totalValue += record.value
      }
    })

    // Converter o mapa em um array
    const rankings = Array.from(playerMap.values()).map((item) => ({
      id: item.id,
      playerId: item.playerId,
      name: item.name,
      class: item.class,
      value: item.value,
      entries: item.entries,
      averageValue: Math.round(item.totalValue / item.entries),
    }))

    // Ordenar por valor (maior para menor)
    rankings.sort((a, b) => b.value - a.value)

    console.log(`Retornando ${rankings.length} registros de ranking para a classe ${className}`)
    return NextResponse.json(rankings)
  } catch (error) {
    console.error("Erro ao buscar rankings por classe:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
