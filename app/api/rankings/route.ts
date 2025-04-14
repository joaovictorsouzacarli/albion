import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null

    console.log(`Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}`)

    // Buscar todos os registros do tipo especificado
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

    const { data: records, error } = await query.order("value", { ascending: false })

    if (error) {
      console.error("Erro ao buscar registros:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log(`Encontrados ${records.length} registros brutos`)

    // Verificar se há registros
    if (!records || records.length === 0) {
      console.log("Nenhum registro encontrado")
      return NextResponse.json([])
    }

    // Verificar a estrutura dos registros para depuração
    console.log("Exemplo de registro:", JSON.stringify(records[0], null, 2))

    // Encontrar o melhor registro de cada jogador
    const playerBestRecords = new Map()

    records.forEach((record) => {
      // Verificar se o registro tem as propriedades necessárias
      if (!record.player_id || !record.players) {
        console.log("Registro inválido:", record)
        return
      }

      const playerId = record.player_id
      const playerName = record.players.name

      if (!playerBestRecords.has(playerId) || record.value > playerBestRecords.get(playerId).value) {
        playerBestRecords.set(playerId, {
          id: record.id,
          playerId: playerId,
          name: playerName,
          class: record.class,
          value: record.value,
          date: record.created_at,
        })
      }
    })

    // Calcular estatísticas adicionais para cada jogador
    const playerStats = new Map()

    records.forEach((record) => {
      const playerId = record.player_id

      if (!playerStats.has(playerId)) {
        playerStats.set(playerId, {
          entries: 1,
          totalValue: record.value,
        })
      } else {
        const stats = playerStats.get(playerId)
        stats.entries += 1
        stats.totalValue += record.value
      }
    })

    // Combinar os melhores registros com as estatísticas
    const rankings = Array.from(playerBestRecords.values()).map((record) => {
      const stats = playerStats.get(record.playerId)
      return {
        ...record,
        entries: stats.entries,
        averageValue: Math.round(stats.totalValue / stats.entries),
      }
    })

    // Ordenar por valor (maior para menor)
    rankings.sort((a, b) => b.value - a.value)

    console.log(`Retornando ${rankings.length} registros de ranking processados`)
    return NextResponse.json(rankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
