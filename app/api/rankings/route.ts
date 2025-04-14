import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabase"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "dps"
    const classFilter = searchParams.get("class") || null

    console.log(`Buscando rankings de ${type}${classFilter ? ` para a classe ${classFilter}` : ""}`)

    // Primeiro, vamos buscar todos os registros do tipo especificado
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
    const rankings = records
      .map((record) => {
        // Verificar se o registro tem as propriedades necessárias
        if (!record.player_id || !record.players) {
          console.log("Registro inválido:", record)
          return null
        }

        return {
          id: record.id,
          playerId: record.player_id,
          name: record.players?.name || "Jogador Desconhecido",
          class: record.class,
          value: record.value,
          date: record.created_at,
          // Valores fictícios para manter a compatibilidade com o frontend
          entries: 1,
          averageValue: record.value,
        }
      })
      .filter(Boolean) // Remover itens nulos

    // Ordenar por valor (maior para menor)
    rankings.sort((a, b) => b.value - a.value)

    // Remover duplicatas (manter apenas o melhor valor de cada jogador)
    const uniquePlayers = new Map()
    rankings.forEach((record) => {
      if (!uniquePlayers.has(record.playerId) || record.value > uniquePlayers.get(record.playerId).value) {
        uniquePlayers.set(record.playerId, record)
      }
    })

    const finalRankings = Array.from(uniquePlayers.values())

    console.log(`Retornando ${finalRankings.length} registros de ranking processados`)
    return NextResponse.json(finalRankings)
  } catch (error) {
    console.error("Erro ao buscar rankings:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
