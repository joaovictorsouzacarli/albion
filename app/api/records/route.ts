import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { playerName, class: className, value, type } = await request.json()

    // Verificar se o jogador já existe
    let { data: player, error: playerError } = await supabase
      .from("players")
      .select("*")
      .eq("name", playerName)
      .single()

    // Se não existir, criar um novo jogador
    if (playerError) {
      const { data: newPlayer, error: createError } = await supabase
        .from("players")
        .insert({ name: playerName })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      player = newPlayer
    }

    // Criar o registro
    const { data: record, error: recordError } = await supabase
      .from("records")
      .insert({
        player_id: player.id,
        class: className,
        value: Number.parseInt(value),
        type,
      })
      .select()
      .single()

    if (recordError) {
      throw recordError
    }

    return NextResponse.json(record)
  } catch (error) {
    console.error("Erro ao adicionar registro:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

