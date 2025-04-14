import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null

    console.log(`Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}`)

    // Construir a consulta base
    let query = supabaseAdmin
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

    // Aplicar filtro de classe se fornecido
    if (classFilter) {
      query = query.eq("class", classFilter)
    }

    // Executar a consulta
    const { data: records, error } = await query.order("value", { ascending: false })

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Processar os registros para obter o melhor valor de cada jogador
    const playerMap = new Map()

    records.forEach((record) => {
      const playerId = record.player_id
      const playerName = record.players.name

      // Se o jogador ainda não está no mapa ou o valor atual é maior que o valor armazenado
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
        // Atualizar apenas o contador de entradas e o valor total
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

    console.log(`Retornando ${rankings.length} registros de ranking`)
    return NextResponse.json(rankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
