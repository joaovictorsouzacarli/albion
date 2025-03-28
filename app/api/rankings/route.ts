import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import type { Record, RankingPlayer } from "@/types"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"

    // Buscar todos os registros do tipo especificado
    const { data: records, error } = await supabase
      .from("records")
      .select("*, players(name)")
      .eq("type", type)
      .order("created_at", { ascending: false })

    if (error) {
      throw error
    }

    // Processar os registros para o formato necessário
    const formattedRecords = records.map((record: any) => ({
      id: record.id,
      player_id: record.player_id,
      player_name: record.players?.name,
      class: record.class,
      value: record.value,
      type: record.type,
      created_at: record.created_at,
    })) as Record[]

    // Agrupar por jogador
    const playerMap = new Map<string, any>()

    formattedRecords.forEach((record) => {
      const playerId = record.player_id

      if (!playerMap.has(playerId)) {
        playerMap.set(playerId, {
          id: playerId,
          name: record.player_name,
          classes: {},
          bestClass: "",
          bestValue: 0,
          totalValue: 0,
          totalEntries: 0,
        })
      }

      const player = playerMap.get(playerId)

      // Agrupar por classe
      if (!player.classes[record.class]) {
        player.classes[record.class] = {
          values: [],
          total: 0,
          count: 0,
          best: 0,
        }
      }

      const classData = player.classes[record.class]
      classData.values.push(record.value)
      classData.total += record.value
      classData.count += 1

      if (record.value > classData.best) {
        classData.best = record.value
      }

      // Atualizar melhor classe geral
      if (record.value > player.bestValue) {
        player.bestValue = record.value
        player.bestClass = record.class
      }

      player.totalValue += record.value
      player.totalEntries += 1
    })

    // Converter para array e calcular médias
    const rankings: RankingPlayer[] = Array.from(playerMap.values()).map((player) => {
      return {
        id: player.id,
        name: player.name,
        class: player.bestClass,
        value: player.bestValue,
        averageValue: Math.round(player.totalValue / player.totalEntries),
        entries: player.totalEntries,
      }
    })

    // Ordenar por valor mais alto
    rankings.sort((a, b) => b.value - a.value)

    return NextResponse.json(rankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

