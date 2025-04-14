import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null

    console.log(`Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}`)

    // Verificar a conexão com o Supabase
    try {
      const { error: connectionError } = await supabaseAdmin.from("players").select("count")

      if (connectionError) {
        console.error("Erro de conexão com o Supabase:", connectionError)
        return NextResponse.json(
          {
            error: "Erro de conexão com o Supabase: " + connectionError.message,
          },
          { status: 500 },
        )
      }
    } catch (connError) {
      console.error("Exceção ao conectar com o Supabase:", connError)
      return NextResponse.json(
        {
          error:
            "Exceção ao conectar com o Supabase: " +
            (connError instanceof Error ? connError.message : String(connError)),
        },
        { status: 500 },
      )
    }

    // Primeiro, vamos verificar se existem registros do tipo solicitado
    const { count, error: countError } = await supabaseAdmin
      .from("records")
      .select("*", { count: "exact", head: true })
      .eq("type", type)
      .limit(1)

    if (countError) {
      console.error("Erro ao verificar existência de registros:", countError)
      return NextResponse.json({ error: countError.message }, { status: 500 })
    }

    console.log(`Contagem de registros do tipo ${type}: ${count}`)

    if (count === 0) {
      console.log(`Nenhum registro do tipo ${type} encontrado`)
      return NextResponse.json([])
    }

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

    console.log(`Encontrados ${records?.length || 0} registros brutos`)

    // Se não houver registros, retornar array vazio
    if (!records || records.length === 0) {
      console.log("Nenhum registro encontrado")
      return NextResponse.json([])
    }

    // Verificar a estrutura dos registros para depuração
    console.log("Exemplo de registro:", JSON.stringify(records[0], null, 2))

    // Transformar os registros em um formato mais simples para o frontend
    const processedRecords = records
      .map((record) => {
        // Verificar se o registro tem as propriedades necessárias
        if (!record.player_id) {
          console.log("Registro sem player_id:", record)
          return null
        }

        // Verificar se o jogador existe
        if (!record.players) {
          console.log("Registro sem jogador associado:", record)
          return {
            id: record.id,
            playerId: record.player_id,
            name: "Jogador Desconhecido",
            class: record.class,
            value: record.value,
            date: record.created_at,
            entries: 1,
            averageValue: record.value,
          }
        }

        return {
          id: record.id,
          playerId: record.player_id,
          name: record.players.name,
          class: record.class,
          value: record.value,
          date: record.created_at,
          entries: 1,
          averageValue: record.value,
        }
      })
      .filter(Boolean) // Remover itens nulos

    // Remover duplicatas (manter apenas o melhor valor de cada jogador)
    const uniquePlayers = new Map()
    processedRecords.forEach((record) => {
      if (!uniquePlayers.has(record.playerId) || record.value > uniquePlayers.get(record.playerId).value) {
        uniquePlayers.set(record.playerId, record)
      }
    })

    const finalRankings = Array.from(uniquePlayers.values())

    // Ordenar por valor (maior para menor)
    finalRankings.sort((a, b) => b.value - a.value)

    console.log(`Retornando ${finalRankings.length} registros de ranking processados`)
    return NextResponse.json(finalRankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor: " + (error instanceof Error ? error.message : String(error)),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
