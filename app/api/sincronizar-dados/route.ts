import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    console.log("Iniciando sincronização de dados...")

    // 1. Verificar jogadores existentes
    console.log("Buscando jogadores existentes...")
    const { data: players, error: playersError } = await supabaseAdmin.from("players").select("*")

    if (playersError) {
      console.error("Erro ao buscar jogadores:", playersError)
      return NextResponse.json({ error: "Erro ao buscar jogadores" }, { status: 500 })
    }

    console.log(`Encontrados ${players.length} jogadores no banco de dados`)

    // 2. Verificar registros existentes
    console.log("Buscando registros existentes...")
    const { data: records, error: recordsError } = await supabaseAdmin.from("records").select(`
        id,
        player_id,
        class,
        value,
        type,
        created_at
      `)

    if (recordsError) {
      console.error("Erro ao buscar registros:", recordsError)
      return NextResponse.json({ error: "Erro ao buscar registros" }, { status: 500 })
    }

    console.log(`Encontrados ${records.length} registros no banco de dados`)

    // 3. Verificar relações entre jogadores e registros
    console.log("Verificando relações entre jogadores e registros...")

    // Mapear jogadores por ID para verificação rápida
    const playerMap = new Map()
    players.forEach((player) => {
      playerMap.set(player.id, player)
    })

    // Verificar registros sem jogador associado
    const orphanedRecords = records.filter((record) => !playerMap.has(record.player_id))

    if (orphanedRecords.length > 0) {
      console.warn(`Encontrados ${orphanedRecords.length} registros sem jogador associado`)
      console.log("Exemplos de registros órfãos:", orphanedRecords.slice(0, 3))
    }

    // 4. Verificar registros de DPS e HPS
    const dpsRecords = records.filter((record) => record.type === "dps")
    const hpsRecords = records.filter((record) => record.type === "hps")

    console.log(`Registros de DPS: ${dpsRecords.length}`)
    console.log(`Registros de HPS: ${hpsRecords.length}`)

    // 5. Verificar jogadores sem registros
    const playersWithoutRecords = players.filter((player) => {
      return !records.some((record) => record.player_id === player.id)
    })

    if (playersWithoutRecords.length > 0) {
      console.warn(`Encontrados ${playersWithoutRecords.length} jogadores sem registros`)
      console.log("Exemplos de jogadores sem registros:", playersWithoutRecords.slice(0, 3))
    }

    // 6. Testar a consulta de ranking para garantir que está funcionando
    console.log("Testando consulta de ranking...")

    // Consulta para DPS
    const { data: dpsRanking, error: dpsRankingError } = await supabaseAdmin
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
      .eq("type", "dps")
      .order("value", { ascending: false })
      .limit(10)

    if (dpsRankingError) {
      console.error("Erro ao testar ranking de DPS:", dpsRankingError)
      return NextResponse.json({ error: "Erro ao testar ranking de DPS" }, { status: 500 })
    }

    // Verificar se os jogadores estão sendo incluídos corretamente na consulta
    const dpsRankingWithMissingPlayers = dpsRanking.filter((record) => !record.players)

    if (dpsRankingWithMissingPlayers.length > 0) {
      console.warn(
        `Encontrados ${dpsRankingWithMissingPlayers.length} registros de DPS sem jogador associado na consulta`,
      )
      console.log("Exemplos:", dpsRankingWithMissingPlayers.slice(0, 3))
    }

    return NextResponse.json({
      success: true,
      stats: {
        players: players.length,
        records: records.length,
        dpsRecords: dpsRecords.length,
        hpsRecords: hpsRecords.length,
        orphanedRecords: orphanedRecords.length,
        playersWithoutRecords: playersWithoutRecords.length,
        dpsRankingTest: {
          count: dpsRanking.length,
          missingPlayers: dpsRankingWithMissingPlayers.length,
          samples: dpsRanking.slice(0, 3),
        },
      },
    })
  } catch (error) {
    console.error("Erro durante a sincronização:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
