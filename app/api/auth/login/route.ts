import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Buscar usuário pelo username
    const { data: users, error: fetchError } = await supabase
      .from("users")
      .select("*")
      .eq("username", username)
      .single()

    if (fetchError || !users) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    // Verificar senha (em produção, use hash+salt)
    if (users.password !== password) {
      return NextResponse.json({ error: "Usuário ou senha inválidos" }, { status: 401 })
    }

    // Retornar dados do usuário (sem a senha)
    const { password: _, ...userWithoutPassword } = users

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Erro ao fazer login:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}

