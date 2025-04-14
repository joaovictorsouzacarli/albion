import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null

    console.log(`Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}`)

    // Primeiro, vamos buscar todos os registros agrupados por jogador e classe
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
      .order("value", { ascending: false })

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Agrupar registros por jogador e classe
    const playerClassMap = new Map()

    records.forEach((record) => {
      const playerId = record.player_id
      const playerClass = record.class
      const key = `${playerId}-${playerClass}`

      if (!playerClassMap.has(key) || record.value > playerClassMap.get(key).value) {
        playerClassMap.set(key, {
          id: record.id,
          playerId: playerId,
          name: record.players.name,
          class: playerClass,
          value: record.value,
          date: record.created_at,
          entries: 1,
          totalValue: record.value,
        })
      } else {
        const existing = playerClassMap.get(key)
        existing.entries += 1
        existing.totalValue += record.value
      }
    })

    // Converter o mapa em um array
    let rankings = Array.from(playerClassMap.values()).map((item) => ({
      id: item.id,
      playerId: item.playerId,
      name: item.name,
      class: item.class,
      value: item.value,
      entries: item.entries,
      averageValue: Math.round(item.totalValue / item.entries),
    }))

    // Aplicar filtro de classe se fornecido
    if (classFilter) {
      rankings = rankings.filter((item) => item.class === classFilter)
    }

    // Ordenar por valor (maior para menor)
    rankings.sort((a, b) => b.value - a.value)

    console.log(`Retornando ${rankings.length} registros de ranking`)
    return NextResponse.json(rankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
